import type { Express } from "express";
import { storage } from "./storage.js";
import { api } from "../shared/routes.js";
import { z } from "zod";
import session from "express-session";
import connectPg from "connect-pg-simple";
import bcrypt from "bcryptjs";
import Stripe from "stripe";
import { sendWelcomeEmail, sendPurchaseConfirmation, sendLeadMagnetEmail, sendDunningEmail, sendPasswordResetEmail, sendVerificationEmail, sendNurtureEmail } from "./email.js";
import crypto from "crypto";
import { getPriceId, isSubscription, isProductAvailable } from "./products.js";
import { DELIVERABLES, getDeliverable, getDeliverableFile } from "./deliverables.js";
import { gapAnalysisWorkbook, markdownToPdf } from "./generate.js";
import { isProActive } from "./entitlements.js";
import { connectionString } from "./db.js";
import { OAuth2Client } from "google-auth-library";
import { rateLimit } from "express-rate-limit";

const googleClient = new OAuth2Client();
import { readFile, readdir } from "fs/promises";
import path from "path";
import matter from "gray-matter";

// Dunning grace window after a failed subscription payment.
const GRACE_PERIOD_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

// Brute-force / abuse protection on credential + account endpoints. In-memory
// store: meaningful per-instance protection (note: not shared across serverless
// instances). validate:false avoids any startup/runtime throw from proxy checks.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  message: { message: "Too many attempts. Please wait a few minutes and try again." },
  // The limiter uses a process-wide in-memory store; under vitest every test
  // shares it across freshly-built apps, so cumulative auth POSTs would trip
  // the limit and flake unrelated tests. Disable it in the test env only.
  skip: () => process.env.NODE_ENV === "test",
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function isValidEmail(email: unknown): email is string {
  return typeof email === "string" && email.length <= 254 && EMAIL_RE.test(email);
}

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-06-30.basil" as any,
    })
  : null;

// Add session middleware
export function setupSession(app: Express) {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  const sessionStore = connectionString
    ? new (connectPg(session))({
        conString: connectionString,
        createTableIfMissing: false,
        ttl: sessionTtl,
        tableName: "sessions",
      })
    : undefined;

  app.set("trust proxy", 1);
  app.use(session({
    secret: process.env.SESSION_SECRET || "default_secret",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  }));
}

export const isAuthenticated = (req: any, res: any, next: any) => {
  if (req.session && req.session.userId) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// Extend express session type
declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

export async function registerRoutes(app: Express): Promise<void> {
  // ── Stripe webhook must be registered BEFORE session/json middleware
  // but express.json verify already saves req.rawBody so we can verify here.
  app.post("/api/stripe/webhook", async (req: any, res) => {
    if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
      return res.status(503).json({ message: "Stripe is not configured" });
    }

    const sig = req.headers["stripe-signature"] as string;
    if (!sig) return res.status(400).json({ message: "Missing stripe-signature header" });

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody as Buffer,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET ?? ""
      );
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).json({ message: `Webhook Error: ${err.message}` });
    }

    // Idempotency: Stripe retries deliver the same event.id. If we've already
    // processed it, ack immediately so we never fulfill twice.
    const alreadyProcessed = await storage
      .isStripeEventProcessed(event.id)
      .catch((e) => {
        console.error("[Webhook] Idempotency check failed:", e);
        return false; // fail-open: better to risk a guarded retry than drop the event
      });
    if (alreadyProcessed) {
      return res.status(200).json({ received: true, duplicate: true });
    }

    try {
      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const { userId, productType } = session.metadata ?? {};
        if (!userId || !productType) {
          return res.status(400).json({ message: "Missing metadata" });
        }

        if (isSubscription(productType)) {
          // Pro (monthly or annual). Provisional unlock; subscription.created/
          // updated sets the period end.
          await storage.updateUserStripe(userId, {
            isPro: true,
            subscriptionStatus: "active",
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            proGraceUntil: null,
          });
        } else {
          await storage.createPurchase({
            userId,
            productType,
            stripeSessionId: session.id,
            amount: session.amount_total ?? undefined,
            status: "completed",
          });

          // Purchase confirmation email (one-time products only)
          const customerEmail = session.customer_email ?? session.customer_details?.email;
          if (customerEmail) {
            const user = await storage.getUser(userId).catch(() => null);
            sendPurchaseConfirmation(
              customerEmail,
              productType,
              session.amount_total ?? undefined,
              user?.firstName ?? undefined
            ).catch((err) => console.error("[Webhook] Purchase email error:", err));
          }
        }
      } else if (
        event.type === "customer.subscription.created" ||
        event.type === "customer.subscription.updated"
      ) {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        const user = userId
          ? await storage.getUser(userId).catch(() => undefined)
          : await storage.getUserByStripeCustomerId(sub.customer as string);
        if (user) {
          const periodEnd = (sub as any).current_period_end as number | undefined;
          const active = sub.status === "active" || sub.status === "trialing";
          await storage.updateUserStripe(user.id, {
            isPro: active || sub.status === "past_due", // keep Pro during dunning grace
            subscriptionStatus: sub.status,
            stripeCustomerId: sub.customer as string,
            stripeSubscriptionId: sub.id,
            proExpiresAt: periodEnd ? new Date(periodEnd * 1000) : undefined,
            ...(active ? { proGraceUntil: null } : {}),
          });
        }
      } else if (event.type === "customer.subscription.deleted") {
        const sub = event.data.object as Stripe.Subscription;
        const user = await storage.getUserByStripeCustomerId(sub.customer as string);
        if (user) {
          await storage.updateUserStripe(user.id, {
            isPro: false,
            subscriptionStatus: "canceled",
            proGraceUntil: null,
          });
        }
      } else if (event.type === "invoice.payment_failed") {
        // Dunning: start a 3-day grace window, keep Pro, email the customer.
        const invoice = event.data.object as Stripe.Invoice;
        const user = await storage.getUserByStripeCustomerId(invoice.customer as string);
        if (user) {
          const graceUntil = new Date(Date.now() + GRACE_PERIOD_MS);
          await storage.updateUserStripe(user.id, {
            isPro: true,
            subscriptionStatus: "past_due",
            proGraceUntil: graceUntil,
          });
          const email = invoice.customer_email ?? user.email ?? undefined;
          if (email) {
            sendDunningEmail(email, graceUntil, user.firstName ?? undefined).catch((err) =>
              console.error("[Webhook] Dunning email error:", err)
            );
          }
        }
      } else if (event.type === "invoice.payment_succeeded") {
        // Recovered (or normal renewal): clear grace, restore Pro.
        const invoice = event.data.object as Stripe.Invoice;
        const user = await storage.getUserByStripeCustomerId(invoice.customer as string);
        if (user) {
          const periodEnd = (invoice as any).lines?.data?.[0]?.period?.end as number | undefined;
          await storage.updateUserStripe(user.id, {
            isPro: true,
            subscriptionStatus: "active",
            proGraceUntil: null,
            ...(periodEnd ? { proExpiresAt: new Date(periodEnd * 1000) } : {}),
          });
        }
      }

      // Mark processed only after fulfillment succeeded. A throw above skips
      // this and returns 500 → Stripe retries → the idempotency check still
      // prevents double-fulfill once a later attempt succeeds.
      await storage.markStripeEventProcessed(event.id, event.type);
    } catch (err) {
      console.error("Webhook handler error:", err);
      return res.status(500).json({ message: "Webhook handler failed" });
    }

    res.status(200).json({ received: true });
  });

  setupSession(app);

  // Which billing plans are sellable (have a configured Stripe price). Lets the
  // client show/hide the annual option without leaking price IDs.
  app.get("/api/billing/plans", (_req, res) => {
    res.json({
      monthly: isProductAvailable("pro_subscription"),
      annual: isProductAvailable("pro_subscription_annual"),
      // Configured free-trial length for new Pro subscribers (0 = disabled).
      trialDays: parseInt(process.env.PRO_TRIAL_DAYS ?? "7", 10),
    });
  });

  // ── Auth routes ──────────────────────────────────────────────────────────

  app.post("/api/auth/register", authLimiter, async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }
      if (!isValidEmail(email)) {
        return res.status(400).json({ message: "Please enter a valid email address" });
      }
      if (String(password).length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
      }
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const user = await storage.createUser({ email, passwordHash, firstName, lastName });

      req.session.userId = user.id;

      // Fire-and-forget welcome email
      sendWelcomeEmail(email, firstName).catch((err) =>
        console.error("[Register] Welcome email error:", err)
      );

      // Soft email verification — issue a 24h token and email a confirm link.
      // Never blocks registration: any failure is swallowed.
      try {
        const vToken = crypto.randomBytes(32).toString("hex");
        const vExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await storage.setVerificationToken(user.id, vToken, vExpiry);
        const baseUrl = process.env.BASE_URL ?? "http://localhost:5000";
        sendVerificationEmail(email, `${baseUrl}/verify-email?token=${vToken}`, firstName ?? undefined).catch((err) =>
          console.error("[Register] Verification email error:", err)
        );
      } catch (err) {
        console.error("[Register] Verification token error (non-blocking):", err);
      }

      return res.status(201).json({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, isPro: user.isPro });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/auth/login", authLimiter, async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }
      const user = await storage.getUserByEmail(email);
      if (!user || (!user.passwordHash && password !== "")) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValid = await bcrypt.compare(password, user.passwordHash!);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      return res.json({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, isPro: user.isPro });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Request a password reset link. Always returns 200 so the endpoint never
  // reveals whether an email is registered (enumeration protection).
  app.post("/api/auth/forgot-password", authLimiter, async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ message: "Email required" });

      const user = await storage.getUserByEmail(email);
      if (user) {
        const token = crypto.randomBytes(32).toString("hex");
        const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await storage.setResetToken(user.id, token, expiry);

        const baseUrl = process.env.BASE_URL ?? "http://localhost:5000";
        const resetUrl = `${baseUrl}/reset-password?token=${token}`;
        sendPasswordResetEmail(email, resetUrl, user.firstName ?? undefined).catch((err) =>
          console.error("[ForgotPassword] Email error:", err)
        );
      }

      return res.json({ message: "If an account exists for that email, a reset link has been sent." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Complete a password reset using the emailed token.
  app.post("/api/auth/reset-password", authLimiter, async (req, res) => {
    try {
      const { token, password } = req.body;
      if (!token || !password) {
        return res.status(400).json({ message: "Token and new password required" });
      }
      if (String(password).length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
      }

      const user = await storage.getUserByResetToken(token);
      if (!user || !user.resetTokenExpiry || new Date(user.resetTokenExpiry).getTime() < Date.now()) {
        return res.status(400).json({ message: "This reset link is invalid or has expired." });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      await storage.updatePassword(user.id, passwordHash);

      // Log the user in after a successful reset.
      req.session.userId = user.id;
      return res.json({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, isPro: isProActive(user) });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Confirm an email via the link token. Soft verification: it sets the flag
  // but access is never gated on it.
  app.post("/api/auth/verify-email", async (req, res) => {
    try {
      const token = String(req.body?.token ?? "");
      if (!token) return res.status(400).json({ message: "Token required" });
      const user = await storage.getUserByVerificationToken(token);
      if (!user || !user.verificationTokenExpiry || new Date(user.verificationTokenExpiry).getTime() < Date.now()) {
        return res.status(400).json({ message: "This verification link is invalid or has expired." });
      }
      await storage.markEmailVerified(user.id);
      return res.json({ ok: true });
    } catch (err) {
      console.error("[VerifyEmail] error:", err);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Resend the verification email for the logged-in user (no-op if already verified).
  app.post("/api/auth/resend-verification", authLimiter, isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) return res.status(401).json({ message: "Unauthorized" });
      if (user.verifiedEmail) return res.json({ message: "Email already verified." });
      const token = crypto.randomBytes(32).toString("hex");
      const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await storage.setVerificationToken(user.id, token, expiry);
      const baseUrl = process.env.BASE_URL ?? "http://localhost:5000";
      if (user.email) {
        sendVerificationEmail(user.email, `${baseUrl}/verify-email?token=${token}`, user.firstName ?? undefined).catch((err) =>
          console.error("[ResendVerify] email error:", err)
        );
      }
      return res.json({ message: "Verification email sent." });
    } catch (err) {
      console.error("[ResendVerify] error:", err);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Sign in / sign up with Google. The client sends a Google ID token
  // (credential); we verify it server-side, then find-or-create the user by
  // their Google-verified email and start a session. No password is set for
  // Google-only accounts.
  app.post("/api/auth/google", authLimiter, async (req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return res.status(503).json({ message: "Google sign-in is not configured" });
    }
    try {
      const credential = String(req.body?.credential ?? "");
      if (!credential) return res.status(400).json({ message: "Missing Google credential" });

      const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: clientId });
      const payload = ticket.getPayload();
      if (!payload?.email || !payload.email_verified) {
        return res.status(401).json({ message: "Google account email is not verified" });
      }

      const email = payload.email.toLowerCase();
      let user = await storage.getUserByEmail(email);
      if (!user) {
        user = await storage.createUser({
          email,
          firstName: payload.given_name ?? null,
          lastName: payload.family_name ?? null,
          profileImageUrl: payload.picture ?? null,
          verifiedEmail: true,
        });
        sendWelcomeEmail(email, payload.given_name ?? undefined).catch((err) =>
          console.error("[Google] Welcome email error:", err)
        );
      }

      req.session.userId = user.id;
      return res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isPro: isProActive(user),
        verifiedEmail: user.verifiedEmail ?? true,
      });
    } catch (err) {
      console.error("[Google] verify error:", err);
      return res.status(401).json({ message: "Invalid Google credential" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.status(200).json({ message: "Logged out" });
    });
  });

  // Reading progress (cross-device for logged-in users). Both endpoints fail
  // soft: if the lesson_reads table isn't present yet (pre-migration), they
  // return empty/ok so the client transparently falls back to localStorage.
  app.get("/api/progress/reads", isAuthenticated, async (req: any, res) => {
    try {
      const slugs = await storage.getReadLessons(req.session.userId);
      res.json({ reads: slugs });
    } catch (err) {
      console.error("[Progress] read list error:", err);
      res.json({ reads: [] });
    }
  });

  app.post("/api/progress/reads", isAuthenticated, async (req: any, res) => {
    try {
      const slug = String(req.body?.slug ?? "").trim();
      if (!slug) return res.status(400).json({ message: "slug required" });
      await storage.markLessonRead(req.session.userId, slug);
      res.json({ ok: true });
    } catch (err) {
      console.error("[Progress] mark read error:", err);
      res.json({ ok: false });
    }
  });

  app.get("/api/auth/me", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, isPro: isProActive(user), verifiedEmail: user.verifiedEmail ?? false });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // ── Stripe routes ────────────────────────────────────────────────────────

  app.post("/api/stripe/create-checkout-session", isAuthenticated, async (req: any, res) => {
    if (!stripe) {
      return res.status(503).json({ message: "Stripe is not configured" });
    }

    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) return res.status(401).json({ message: "Unauthorized" });

      const { productType } = req.body;
      const priceId = getPriceId(productType);
      if (!priceId) {
        return res.status(400).json({ message: "Invalid productType or missing price configuration" });
      }

      const baseUrl = process.env.BASE_URL ?? "http://localhost:5000";

      const subscription = isSubscription(productType);
      // Free trial for NEW Pro subscribers only (never subscribed, not currently
      // Pro) — prevents repeat-trial abuse. PRO_TRIAL_DAYS=0 disables it.
      const trialDays = parseInt(process.env.PRO_TRIAL_DAYS ?? "7", 10);
      const grantTrial =
        subscription && trialDays > 0 && !user.stripeSubscriptionId && !isProActive(user);

      const session = await stripe.checkout.sessions.create({
        mode: subscription ? "subscription" : "payment",
        line_items: [{ price: priceId, quantity: 1 }],
        customer_email: user.email ?? undefined,
        success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&product=${productType}`,
        cancel_url: `${baseUrl}/pricing`,
        metadata: { userId: user.id, productType },
        // Propagate userId onto the subscription so subscription.*/invoice.*
        // webhook events can resolve the user even before the customer id is stored.
        ...(subscription
          ? {
              subscription_data: {
                metadata: { userId: user.id, productType },
                ...(grantTrial ? { trial_period_days: trialDays } : {}),
              },
            }
          : {}),
      });

      res.json({ url: session.url });
    } catch (err: any) {
      console.error("Stripe checkout error:", err);
      res.status(500).json({ message: err.message ?? "Failed to create checkout session" });
    }
  });

  app.get("/api/stripe/customer-portal", isAuthenticated, async (req: any, res) => {
    if (!stripe) {
      return res.status(503).json({ message: "Stripe is not configured" });
    }

    try {
      const user = await storage.getUser(req.session.userId);
      if (!user?.stripeCustomerId) {
        return res.status(400).json({ message: "No Stripe customer found for this account" });
      }

      const baseUrl = process.env.BASE_URL ?? "http://localhost:5000";
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${baseUrl}/settings`,
      });

      res.json({ url: portalSession.url });
    } catch (err: any) {
      console.error("Customer portal error:", err);
      res.status(500).json({ message: err.message ?? "Failed to create portal session" });
    }
  });

  // ── Other routes ─────────────────────────────────────────────────────────

  app.post(api.quoteRequests.create.path, async (req, res) => {
    try {
      const input = api.quoteRequests.create.input.parse(req.body);
      const quote = await storage.createQuoteRequest(input);
      res.status(201).json(quote);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      throw err;
    }
  });

  // ── Lead capture ────────────────────────────────────────────────────────

  app.post("/api/leads/capture", async (req, res) => {
    try {
      const { email, source } = req.body;
      if (!email || typeof email !== "string") {
        return res.status(400).json({ message: "Email is required" });
      }

      const normalizedEmail = email.toLowerCase().trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({ message: "Email không hợp lệ" });
      }

      const { isNew } = await storage.captureLead(normalizedEmail, source ?? "lead_magnet");

      // Send checklist email only for new leads. Fire-and-forget: a mail failure
      // must NOT fail the request — the lead is already saved.
      if (isNew) {
        const base = (process.env.VITE_SITE_URL || process.env.BASE_URL || "https://bio-wiki-pro-claude.vercel.app").replace(/\/$/, "");
        const downloadUrl = process.env.DOWNLOAD_GMP_CHECKLIST || `${base}/api/lead-magnet/gmp-checklist`;
        sendLeadMagnetEmail(normalizedEmail, downloadUrl).catch((err) =>
          console.error("[Leads] Email error:", err)
        );
      }

      res.json({
        success: true,
        isNew,
        message: isNew
          ? "Đã gửi! Kiểm tra email của bạn."
          : "Email này đã đăng ký rồi — kiểm tra lại hộp thư (kể cả spam).",
      });
    } catch (err) {
      console.error("[Leads] Capture error:", err);
      res.status(500).json({ message: "Server error" });
    }
  });

  // ── Content (server-gated MDX) ───────────────────────────────────────────
  // Returns the full MDX body ONLY when the session is entitled for the tier.
  // Pro/paid bodies are never sent to unentitled clients (server-side gating).
  const CONTENT_COLLECTIONS = new Set(["academy", "blog", "toolkits"]);
  const CONTENT_LANGS = new Set(["vi", "en"]);
  const SLUG_RE = /^[a-z0-9-]+$/;

  app.get("/api/content/:collection/:slug", async (req: any, res) => {
    const { collection, slug } = req.params;
    const lang = String(req.query.lang ?? "en");

    if (!CONTENT_COLLECTIONS.has(collection) || !SLUG_RE.test(slug) || !CONTENT_LANGS.has(lang)) {
      return res.status(400).json({ message: "Invalid content reference" });
    }

    // SLUG_RE + fixed dir prevent path traversal.
    const filePath = path.resolve(process.cwd(), "content", collection, `${slug}.${lang}.mdx`);
    let raw: string;
    try {
      raw = await readFile(filePath, "utf-8");
    } catch {
      return res.status(404).json({ message: "Content not found" });
    }

    const { data, content } = matter(raw);
    const tier = (data.tier as string) ?? "free";
    const title = (data.title as string) ?? slug;
    const teaser = (data.seoDescription as string) ?? "";

    // Publish gate — DB is the source of truth; default published if DB is
    // unconfigured or the entry hasn't been seeded yet.
    try {
      const row = await storage.getContentEntry(slug, lang);
      if (row && !row.published) {
        return res.status(404).json({ message: "Content not found" });
      }
    } catch {
      /* DB optional for free content */
    }

    // Entitlement from session
    let isPro = false;
    let purchased = false;
    const userId: string | undefined = req.session?.userId;
    if (userId) {
      const user = await storage.getUser(userId).catch(() => undefined);
      isPro = isProActive(user);
      if (tier === "paid") {
        purchased = await storage
          .hasCompletedPurchase(userId, (data.productId as string) || undefined)
          .catch(() => false);
      }
    }

    const allowed =
      tier === "free" ||
      (tier === "pro" && isPro) ||
      (tier === "paid" && (purchased || isPro));

    if (!allowed) {
      return res.json({ locked: true, tier, title, teaser });
    }
    return res.json({ locked: false, tier, title, body: content });
  });

  // ── Free→Pro email nurture (daily cron) ───────────────────────────────────
  // Secured by CRON_SECRET (Vercel cron sends it as a Bearer token). Sends at
  // most one due-but-unsent step per user per run. Degrades to ok:false if the
  // nurture_sends table is absent (pre-migration).
  app.get("/api/cron/nurture", async (req: any, res) => {
    const secret = process.env.CRON_SECRET;
    if (!secret) return res.status(503).json({ message: "Nurture cron not configured" });
    const auth = req.headers.authorization as string | undefined;
    const provided = (auth?.startsWith("Bearer ") ? auth.slice(7) : undefined) ?? req.headers["x-cron-secret"];
    if (provided !== secret) return res.status(401).json({ message: "Unauthorized" });

    const SCHEDULE = [
      { step: 1, day: 1 },
      { step: 2, day: 3 },
      { step: 3, day: 7 },
    ];
    let scanned = 0;
    let sent = 0;
    try {
      const candidates = await storage.getNurtureCandidates(14);
      for (const u of candidates) {
        if (!u.email || !u.createdAt) continue;
        scanned++;
        const ageDays = (Date.now() - new Date(u.createdAt).getTime()) / (24 * 60 * 60 * 1000);
        const dueSteps = SCHEDULE.filter((s) => ageDays >= s.day).map((s) => s.step);
        if (dueSteps.length === 0) continue;
        const already = await storage.getSentNurtureSteps(u.id);
        const next = dueSteps.find((s) => !already.includes(s));
        if (next == null) continue;
        await sendNurtureEmail(u.email, next, u.firstName ?? undefined);
        await storage.recordNurtureSend(u.id, next);
        sent++;
      }
      return res.json({ ok: true, scanned, sent });
    } catch (err) {
      console.error("[Cron] nurture error:", err);
      return res.json({ ok: false, scanned, sent, note: "nurture_sends table may be absent — run db:push" });
    }
  });

  // ── Free lead-magnet checklist (public, no auth) ──────────────────────────
  app.get("/api/lead-magnet/gmp-checklist", async (_req, res) => {
    const filePath = path.resolve(process.cwd(), "content", "deliverables", "free", "gmp-audit-quick-checklist.md");
    try {
      const buf = await readFile(filePath);
      res.setHeader("Content-Type", "text/markdown; charset=utf-8");
      res.setHeader("Content-Disposition", 'attachment; filename="gmp-audit-quick-checklist.md"');
      return res.send(buf);
    } catch {
      return res.status(404).json({ message: "File not found" });
    }
  });

  // ── Digital-goods fulfillment (one-time products) ─────────────────────────
  // List the deliverable products the logged-in user is entitled to (by a
  // completed purchase, or any active Pro subscription which unlocks all kits).
  app.get("/api/downloads", isAuthenticated, async (req: any, res) => {
    const userId: string = req.session.userId;
    const user = await storage.getUser(userId).catch(() => undefined);
    const pro = isProActive(user);

    const owned = [];
    for (const product of Object.values(DELIVERABLES)) {
      let entitled = pro;
      if (!entitled) {
        for (const pt of product.entitledBy) {
          if (await storage.hasCompletedPurchase(userId, pt).catch(() => false)) {
            entitled = true;
            break;
          }
        }
      }
      if (entitled) {
        owned.push({
          id: product.id,
          name: product.name,
          files: product.files.map((f) => ({
            filename: f.filename,
            label: f.label,
            description: f.description,
            url: `/api/downloads/${product.id}/${encodeURIComponent(f.filename)}`,
          })),
        });
      }
    }
    res.json({ products: owned });
  });

  // Stream a single deliverable file, gated by entitlement.
  app.get("/api/downloads/:productId/:filename", isAuthenticated, async (req: any, res) => {
    const { productId, filename } = req.params;
    const product = getDeliverable(productId);
    const file = getDeliverableFile(productId, filename);
    if (!product || !file) {
      return res.status(404).json({ message: "File not found" });
    }

    const userId: string = req.session.userId;
    const user = await storage.getUser(userId).catch(() => undefined);
    let entitled = isProActive(user);
    if (!entitled) {
      for (const pt of product.entitledBy) {
        if (await storage.hasCompletedPurchase(userId, pt).catch(() => false)) {
          entitled = true;
          break;
        }
      }
    }
    if (!entitled) {
      return res.status(403).json({ message: "Purchase required" });
    }

    // file.filename/source are validated against the manifest above (no traversal).
    const dir = path.resolve(process.cwd(), "content", "deliverables", product.dir);
    try {
      let buf: Buffer;
      if (file.generate === "gap-xlsx") {
        buf = gapAnalysisWorkbook();
      } else if (file.generate === "pdf") {
        const md = await readFile(path.join(dir, file.source ?? file.filename), "utf-8");
        buf = await markdownToPdf(md, file.label);
      } else {
        buf = await readFile(path.join(dir, file.filename));
      }
      res.setHeader("Content-Type", file.contentType);
      res.setHeader("Content-Disposition", `attachment; filename="${file.filename}"`);
      res.setHeader("Cache-Control", "private, no-store");
      return res.send(buf);
    } catch (err) {
      console.error("[Downloads] generation error:", err);
      return res.status(404).json({ message: "File not found" });
    }
  });

  // ── Dynamic sitemap (core pages + all MDX blog/academy, both languages) ────
  app.get("/sitemap.xml", async (_req, res) => {
    const baseUrl = (process.env.VITE_SITE_URL || process.env.BASE_URL || "https://bio-wiki-pro-claude.vercel.app").replace(/\/$/, "");

    // Distinct slugs per collection from the MDX files on disk.
    async function slugsIn(collection: string): Promise<string[]> {
      const dir = path.resolve(process.cwd(), "content", collection);
      try {
        const files = await readdir(dir);
        const set = new Set<string>();
        for (const f of files) {
          const m = f.match(/^(.+)\.(?:vi|en)\.mdx$/);
          if (m) set.add(m[1]);
        }
        return Array.from(set);
      } catch {
        return [];
      }
    }

    const corePaths = [
      "", "/qc-hub", "/academy", "/library", "/glossary", "/about", "/tools",
      "/compliance", "/vault", "/career", "/solutions", "/insights", "/pricing",
      "/toolkits/gmp-audit-kit", "/blog", "/upgrade", "/login", "/signup",
      "/faq", "/terms", "/privacy", "/refund",
    ];
    // Learning-path tracks. Kept in sync with client/src/data/learningPaths.ts.
    const pathPaths = [
      "microbiology-qc-fundamentals", "sterile-aseptic-manufacturing",
      "validation-essentials", "quality-systems",
      "investigations-data-integrity", "laboratory-controls-stability",
    ].map((s) => `/paths/${s}`);
    const blogPaths = (await slugsIn("blog")).map((s) => `/blog/${s}`);
    const libPaths = (await slugsIn("academy")).map((s) => `/library/${s}`);
    const allPaths = [...corePaths, ...pathPaths, ...blogPaths, ...libPaths];

    // English-only: clean single URL per path.
    const urls = allPaths
      .map((p) => `<url><loc>${baseUrl}${p || "/"}</loc></url>`)
      .join("\n");

    const body =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      urls +
      `\n</urlset>`;

    res.set("Content-Type", "application/xml; charset=utf-8");
    res.send(body);
  });

  // ── Blog RSS feed ─────────────────────────────────────────────────────────
  app.get("/blog/rss.xml", async (_req, res) => {
    const baseUrl = process.env.BASE_URL ?? "https://bio-wiki-pro-claude.vercel.app";
    const dir = path.resolve(process.cwd(), "content", "blog");
    const esc = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

    type Item = { title: string; slug: string; lang: string; desc: string; updatedAt?: string };
    const items: Item[] = [];
    try {
      const files = await readdir(dir);
      for (const file of files) {
        const m = file.match(/^(.+)\.(vi|en)\.mdx$/);
        if (!m) continue;
        const raw = await readFile(path.join(dir, file), "utf-8");
        const { data } = matter(raw);
        items.push({
          title: (data.title as string) ?? m[1],
          slug: (data.slug as string) ?? m[1],
          lang: m[2],
          desc: (data.seoDescription as string) ?? "",
          updatedAt: data.updatedAt as string | undefined,
        });
      }
    } catch {
      /* no blog dir yet */
    }

    items.sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""));

    const body =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<rss version="2.0"><channel>\n` +
      `<title>BioWikiPro Blog</title>\n` +
      `<link>${baseUrl}/vi/blog</link>\n` +
      `<description>GMP, QC/QA &amp; data integrity insights</description>\n` +
      items
        .map((it) => {
          const url = `${baseUrl}/blog/${it.slug}`;
          const date = it.updatedAt ? new Date(it.updatedAt).toUTCString() : new Date().toUTCString();
          return (
            `<item><title>${esc(it.title)}</title>` +
            `<link>${url}</link><guid>${url}</guid>` +
            `<description>${esc(it.desc)}</description>` +
            `<pubDate>${date}</pubDate></item>`
          );
        })
        .join("\n") +
      `\n</channel></rss>`;

    res.set("Content-Type", "application/rss+xml; charset=utf-8");
    res.send(body);
  });

  // Dev/admin-only Pro toggle. Pro is granted in production via Stripe webhooks
  // (see above). This route is NOT part of the user flow: in production it
  // requires an admin secret header; in dev it is open for testing.
  app.post(api.users.togglePro.path, isAuthenticated, async (req: any, res) => {
    const isProd = process.env.NODE_ENV === "production";
    const adminSecret = process.env.ADMIN_TOOLS_SECRET;
    const provided = req.headers["x-admin-secret"];
    const allowed = !isProd || (!!adminSecret && provided === adminSecret);
    if (!allowed) {
      return res.status(403).json({ message: "Forbidden — Pro is managed via subscription" });
    }
    try {
      const userId = req.session.userId;
      const currentUser = await storage.getUser(userId);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }
      const updatedUser = await storage.updateUserPro(userId, !currentUser.isPro);
      res.json(updatedUser);
    } catch (_err) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });
}
