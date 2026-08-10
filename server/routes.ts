import type { Express, NextFunction, Request, Response } from "express";
import { storage } from "./storage.js";
import { api } from "../shared/routes.js";
import { z } from "zod";
import { getContentQuality } from "../shared/content-quality-registry.js";
import { toPublicContentQuality } from "../shared/content-quality.js";
import session from "express-session";
import connectPg from "connect-pg-simple";
import bcrypt from "bcryptjs";
import Stripe from "stripe";
import { sendWelcomeEmail, sendPurchaseConfirmation, sendLeadMagnetEmail, sendDunningEmail, sendPasswordResetEmail, sendVerificationEmail, sendNurtureEmail, sendTrialEndingEmail, sendAbandonedCheckoutEmail, sendReEngagementEmail, sendQualityLabWorkQueueEmail, sendQualityLabWeeklyReviewEmail, sendRegulatoryDigestEmail, sendCommercialRequestEmails } from "./email.js";
import crypto from "crypto";
import { getPriceId, getProduct, isSubscription, isProductAvailable } from "./products.js";
import { DELIVERABLES, getDeliverable, getDeliverableFile } from "./deliverables.js";
import { gapAnalysisWorkbook, markdownToPdf, qualityLabSampleBlueprintPdf } from "./generate.js";
import { isProActive } from "./entitlements.js";
import { checkRuntimeSchema, connectionString } from "./db.js";
import { OAuth2Client } from "google-auth-library";
import { rateLimit } from "express-rate-limit";
import {
  compareQualityLabReviewedSnapshots,
  qualityLabProjectFromReviewedSnapshot,
  qualityLabProjectSyncRequestSchema,
  qualityLabReviewedProjectSnapshotSchema,
} from "../shared/quality-lab-persistence.js";
import { qualityLabPortfolioQueueMetrics, qualityLabPortfolioWorkQueue, qualityLabWeeklyPortfolioReview } from "../shared/quality-lab-actions.js";
import { qualityLabGovernanceKeySchema, qualityLabGovernanceSnapshotSchema } from "../shared/quality-lab-governance.js";
import { isAdminEmail, registerAdminRoutes } from "./admin.js";
import { getPublicOrigin, runtimeReadiness } from "./runtime-config.js";
import { careerProfileSchema } from "../shared/career-blueprint.js";
import { careerExecutionRecordSchema, createCareerExecutionRecord } from "../shared/career-execution.js";
import { careerBlueprintPdf, careerBlueprintSamplePdf, careerProfileFilename } from "./career-blueprint.js";
import { atlasProMonthlyReviewRecordSchema } from "../shared/atlas-pro-monthly.js";
import { filterRegulatoryUpdates, regulatoryDigestPreferenceSchema } from "../shared/regulatory-monitor.js";
import { fetchRegulatoryMonitor } from "./regulatory-monitor.js";
import { qualityLabFunnelEventSchema } from "../shared/quality-lab-funnel.js";
import { fulfillStripeEventOnce, type StripeFulfillment } from "./stripe-fulfillment.js";
import { DECISION_PACKAGES } from "../shared/decision-packages.js";

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

// Throttles unauthenticated PDF sample generation (CPU-bound render per hit).
// Same in-memory-store caveat as authLimiter; disabled in the test env.
const publicSampleLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  message: { message: "Too many requests. Please wait a few minutes and try again." },
  skip: () => process.env.NODE_ENV === "test",
});

const funnelEventLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  message: { message: "Too many funnel events. Please try again later." },
  skip: () => process.env.NODE_ENV === "test",
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const qualityLabReminderCadenceSchema = z.enum(["off", "weekly", "daily", "weekdays"]);
function isValidEmail(email: unknown): email is string {
  return typeof email === "string" && email.length <= 254 && EMAIL_RE.test(email);
}

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-06-30.basil" as any,
    })
  : null;

function usesSecureCookies() {
  return process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL_ENV);
}

// Add session middleware
export function setupSession(app: Express) {
  const sessionTtlSeconds = 7 * 24 * 60 * 60;
  const sessionTtlMs = sessionTtlSeconds * 1000;
  const readiness = runtimeReadiness();
  if ((process.env.NODE_ENV === "production" || process.env.VERCEL_ENV) && !readiness.sessions) {
    throw new Error("A non-placeholder SESSION_SECRET of at least 32 characters is required");
  }
  const sessionStore = connectionString
    ? new (connectPg(session))({
        conString: connectionString,
        createTableIfMissing: false,
        ttl: sessionTtlSeconds,
        tableName: "sessions",
      })
    : undefined;

  app.set("trust proxy", 1);
  app.use(session({
    name: "lsa.sid",
    secret: process.env.SESSION_SECRET || "life-science-atlas-development-session-only",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: usesSecureCookies(),
      sameSite: "lax",
      path: "/",
      maxAge: sessionTtlMs,
    },
  }));
}

function establishSession(req: any, userId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.regenerate((regenerateError: unknown) => {
      if (regenerateError) return reject(regenerateError);
      req.session.userId = userId;
      req.session.save((saveError: unknown) => saveError ? reject(saveError) : resolve());
    });
  });
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
  // ── Security headers (all responses) ───────────────────────────────────────
  // Enforced headers are zero-risk hardening. CSP ships Report-Only first so it
  // never breaks third parties (PostHog, Google Fonts/Sign-In) — observe reports
  // in prod, then flip to enforced `Content-Security-Policy`.
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://app.posthog.com https://accounts.google.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https:",
    "connect-src 'self' https://app.posthog.com https://*.posthog.com https://accounts.google.com",
    "frame-src https://accounts.google.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join("; ");
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), browsing-topics=()");
    res.setHeader("Content-Security-Policy-Report-Only", csp);
    next();
  });

  app.use((req: any, res, next) => {
    if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method) || req.path === "/api/stripe/webhook") return next();
    const origin = typeof req.headers.origin === "string" ? req.headers.origin : "";
    const fetchSite = typeof req.headers["sec-fetch-site"] === "string" ? req.headers["sec-fetch-site"] : "";
    const allowedOrigins = new Set([
      getPublicOrigin(),
      "http://localhost:5000",
      "http://127.0.0.1:5000",
    ]);
    const forwardedProtocol = typeof req.headers["x-forwarded-proto"] === "string"
      ? req.headers["x-forwarded-proto"].split(",")[0].trim()
      : req.protocol;
    if (req.headers.host) allowedOrigins.add(`${forwardedProtocol}://${req.headers.host}`);
    if (fetchSite === "cross-site" || (origin && !allowedOrigins.has(origin))) {
      return res.status(403).json({ message: "Cross-origin request rejected", code: "ORIGIN_NOT_ALLOWED", requestId: req.requestId ?? "unavailable" });
    }
    next();
  });

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

    try {
      let fulfillment: StripeFulfillment = { kind: "noop" };
      let purchaseEmail: { to: string; productType: string; amount?: number; userId: string } | undefined;
      let dunningEmail: { to?: string; graceUntil: Date } | undefined;

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const { userId, productType, blueprintJourneyId } = session.metadata ?? {};
        if (!userId || !productType || !getProduct(productType)) {
          return res.status(400).json({ message: "Missing metadata" });
        }

        if (isSubscription(productType)) {
          fulfillment = {
            kind: "checkout-subscription",
            userId,
            customerId: typeof session.customer === "string" ? session.customer : null,
            subscriptionId: typeof session.subscription === "string" ? session.subscription : null,
          };
        } else {
          fulfillment = {
            kind: "checkout-payment",
            userId,
            productType,
            sessionId: session.id,
            amount: session.amount_total,
            blueprintJourneyId: z.string().uuid().safeParse(blueprintJourneyId).success ? blueprintJourneyId : undefined,
            occurredAt: new Date((session.created ?? Math.floor(Date.now() / 1000)) * 1000),
          };
          const customerEmail = session.customer_email ?? session.customer_details?.email;
          if (customerEmail) purchaseEmail = { to: customerEmail, productType, amount: session.amount_total ?? undefined, userId };
        }
      } else if (
        event.type === "customer.subscription.created" ||
        event.type === "customer.subscription.updated"
      ) {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        const periodEnd = (sub as any).current_period_end as number | undefined;
        const active = sub.status === "active" || sub.status === "trialing";
        fulfillment = {
          kind: "subscription-state",
          userId,
          customerId: String(sub.customer),
          subscriptionId: sub.id,
          status: sub.status,
          active,
          periodEnd: periodEnd ? new Date(periodEnd * 1000) : undefined,
        };
      } else if (event.type === "customer.subscription.deleted") {
        const sub = event.data.object as Stripe.Subscription;
        fulfillment = { kind: "subscription-deleted", customerId: String(sub.customer) };
      } else if (event.type === "invoice.payment_failed") {
        const invoice = event.data.object as Stripe.Invoice;
        const graceUntil = new Date(Date.now() + GRACE_PERIOD_MS);
        fulfillment = { kind: "invoice-failed", customerId: String(invoice.customer), graceUntil };
        dunningEmail = { to: invoice.customer_email ?? undefined, graceUntil };
      } else if (event.type === "invoice.payment_succeeded") {
        const invoice = event.data.object as Stripe.Invoice;
        const periodEnd = (invoice as any).lines?.data?.[0]?.period?.end as number | undefined;
        fulfillment = { kind: "invoice-succeeded", customerId: String(invoice.customer), periodEnd: periodEnd ? new Date(periodEnd * 1000) : undefined };
      }

      const result = await fulfillStripeEventOnce(event.id, event.type, fulfillment);
      if (result.duplicate) return res.status(200).json({ received: true, duplicate: true });

      if (purchaseEmail) {
        const user = await storage.getUser(purchaseEmail.userId).catch(() => null);
        sendPurchaseConfirmation(purchaseEmail.to, purchaseEmail.productType, purchaseEmail.amount, user?.firstName ?? undefined)
          .catch((error) => console.error("[Webhook] Purchase email failed", { eventId: event.id, message: error instanceof Error ? error.message : String(error) }));
      }
      if (dunningEmail && result.userId) {
        const user = await storage.getUser(result.userId).catch(() => null);
        const email = dunningEmail.to ?? user?.email ?? undefined;
        if (email) sendDunningEmail(email, dunningEmail.graceUntil, user?.firstName ?? undefined)
          .catch((error) => console.error("[Webhook] Dunning email failed", { eventId: event.id, message: error instanceof Error ? error.message : String(error) }));
      }
    } catch (err) {
      console.error("Webhook handler error", { eventId: event.id, message: err instanceof Error ? err.message : String(err) });
      return res.status(500).json({ message: "Webhook handler failed", code: "WEBHOOK_FULFILLMENT_FAILED", requestId: req.requestId ?? "unavailable" });
    }

    res.status(200).json({ received: true });
  });

  setupSession(app);

  app.get("/api/health", async (_req, res) => {
    const readiness = runtimeReadiness();
    const schema = await checkRuntimeSchema();
    const operational = readiness.database && readiness.sessions && schema;
    const diagnosticTestReady = readiness.diagnosticTestReady && schema;
    const commerceReady = readiness.commerceReady && schema;
    res.status(operational ? 200 : 503).json({
      status: operational ? "ok" : "degraded",
      commerceMode: readiness.commerceMode,
      commerceReady,
      diagnosticTestReady,
      service: "life-science-atlas",
      timestamp: new Date().toISOString(),
      readiness: { ...readiness, schema, commerceReady, diagnosticTestReady },
    });
  });

  // Which billing plans are sellable (have a configured Stripe price). Lets the
  // client show/hide the annual option without leaking price IDs.
  app.get("/api/billing/plans", async (_req, res) => {
      const readiness = runtimeReadiness();
      const checkoutEnabled = (readiness.commerceReady || readiness.diagnosticTestReady) && await checkRuntimeSchema();
      res.json({
        monthly: checkoutEnabled && isProductAvailable("pro_subscription"),
        annual: checkoutEnabled && isProductAvailable("pro_subscription_annual"),
        scopeDiagnostic: checkoutEnabled && isProductAvailable("scope_diagnostic"),
        careerBlueprint: checkoutEnabled && isProductAvailable("career_blueprint"),
        commerceMode: readiness.commerceMode,
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

      await establishSession(req, user.id);

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
        const baseUrl = getPublicOrigin();
        sendVerificationEmail(email, `${baseUrl}/verify-email?token=${vToken}`, firstName ?? undefined).catch((err) =>
          console.error("[Register] Verification email error:", err)
        );
      } catch (err) {
        console.error("[Register] Verification token error (non-blocking):", err);
      }

      return res.status(201).json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isPro: user.isPro,
        isAdmin: isAdminEmail(user.email),
      });
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

      await establishSession(req, user.id);
      return res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isPro: user.isPro,
        isAdmin: isAdminEmail(user.email),
      });
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

        const baseUrl = getPublicOrigin();
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
      await establishSession(req, user.id);
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
      const baseUrl = getPublicOrigin();
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

      await establishSession(req, user.id);
      return res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isPro: isProActive(user),
        isAdmin: isAdminEmail(user.email),
        verifiedEmail: user.verifiedEmail ?? true,
      });
    } catch (err) {
      console.error("[Google] verify error:", err);
      return res.status(401).json({ message: "Invalid Google credential" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.clearCookie("lsa.sid", { httpOnly: true, secure: usesSecureCookies(), sameSite: "lax", path: "/" });
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

  // Pro monthly working records sync only after an authenticated member saves.
  // These remain explicitly non-controlled professional aids; local browser
  // storage continues to work if the optional table has not been deployed yet.
  app.get("/api/pro/monthly-reviews", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!isProActive(user)) return res.status(403).json({ message: "Active Pro membership required" });
      const rows = await storage.listAtlasProMonthlyReviews(req.session.userId);
      res.json({ reviews: rows.map((row) => row.snapshot), syncAvailable: true });
    } catch (error) {
      console.error("[Pro monthly review] list error:", error);
      res.json({ reviews: [], syncAvailable: false });
    }
  });

  app.put("/api/pro/monthly-reviews/:reviewId", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!isProActive(user)) return res.status(403).json({ message: "Active Pro membership required" });
      const review = atlasProMonthlyReviewRecordSchema.parse(req.body);
      if (review.id !== req.params.reviewId) return res.status(400).json({ message: "Review identifier mismatch" });
      const row = await storage.upsertAtlasProMonthlyReview(req.session.userId, review);
      res.status(201).json({ review: row.snapshot, syncedAt: row.updatedAt });
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ message: "Invalid monthly review record", issues: error.issues });
      console.error("[Pro monthly review] save error:", error);
      res.status(503).json({ message: "Monthly review saved locally; account sync is temporarily unavailable" });
    }
  });

  app.get("/api/auth/me", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, isPro: isProActive(user), isAdmin: isAdminEmail(user.email), verifiedEmail: user.verifiedEmail ?? false });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // ── Stripe routes ────────────────────────────────────────────────────────

  // Operational controls require both a signed-in account and an explicit
  // ADMIN_EMAILS / ADMIN_EMAIL allowlist match.
  registerAdminRoutes(app, isAuthenticated);

  app.post("/api/stripe/create-checkout-session", isAuthenticated, async (req: any, res) => {
    const readiness = runtimeReadiness();
    if (process.env.NODE_ENV !== "test" && !readiness.commerceReady && !readiness.diagnosticTestReady) {
      return res.status(503).json({ message: "Checkout is currently disabled", code: "COMMERCE_DISABLED", requestId: req.requestId ?? "unavailable" });
    }
    if (process.env.NODE_ENV !== "test" && !(await checkRuntimeSchema())) {
      return res.status(503).json({ message: "Checkout storage is not ready", code: "SCHEMA_NOT_READY", requestId: req.requestId ?? "unavailable" });
    }
    if (!stripe) {
      return res.status(503).json({ message: "Stripe is not configured" });
    }

    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) return res.status(401).json({ message: "Unauthorized" });

      const checkoutInput = z.object({
        productType: z.string().min(1).max(80),
        blueprintJourneyId: z.string().uuid().optional(),
      }).safeParse(req.body);
      if (!checkoutInput.success) return res.status(400).json({ message: "Invalid checkout request" });
      const { productType, blueprintJourneyId } = checkoutInput.data;
      if (!getProduct(productType)) return res.status(400).json({ message: "Invalid productType" });
      const priceId = getPriceId(productType);
      if (!priceId) {
        return res.status(400).json({ message: "Invalid productType or missing price configuration" });
      }

      const baseUrl = getPublicOrigin();

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
          cancel_url:
            productType === "scope_diagnostic"
              ? `${baseUrl}/quality-lab/review?offer=diagnostic`
              : productType === "career_blueprint"
                ? `${baseUrl}/career`
                : `${baseUrl}/pricing`,
        metadata: { userId: user.id, productType, ...(blueprintJourneyId ? { blueprintJourneyId } : {}) },
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

      // Record the attempt for the abandoned-checkout reminder. Best-effort:
      // never let this break the checkout flow (table may be absent pre-migration).
      storage
        .recordCheckoutAttempt(user.id, productType)
        .catch((e) => console.error("[Checkout] attempt record failed:", e));

      res.json({ url: session.url });
    } catch (err: any) {
      console.error("Stripe checkout error:", err);
      res.status(500).json({ message: err.message ?? "Failed to create checkout session" });
    }
  });

  app.get("/api/quality-lab/sample-blueprint.pdf", async (_req, res) => {
    const pdf = await qualityLabSampleBlueprintPdf();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="atlas-quality-lab-blueprint-illustrative-sample.pdf"');
    res.send(pdf);
  });

  // Public illustrative sample of the paid Personal Career Blueprint: fictional
  // profile, first pages of the real engine, every page watermarked. Same
  // in-memory limiter pattern as the auth endpoints (disabled under vitest).
  app.get("/api/career-blueprint/sample.pdf", publicSampleLimiter, async (_req, res) => {
    try {
      const pdf = await careerBlueprintSamplePdf();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", 'attachment; filename="career-blueprint-illustrative-sample.pdf"');
      res.send(pdf);
    } catch (error) {
      console.error("[Career Blueprint sample] generation error:", error);
      res.status(500).json({ message: "Unable to generate the sample Blueprint" });
    }
  });

  // Career profiles stay browser-local for guests; authenticated users also
  // keep an account copy (see the profile routes below) so a purchase survives
  // a device switch. The PDF endpoint still receives the profile explicitly.
  app.get("/api/career-blueprint/access", isAuthenticated, async (req: any, res) => {
    const userId: string = req.session.userId;
    const user = await storage.getUser(userId).catch(() => undefined);
    const entitled = isAdminEmail(user?.email) || (await storage.hasCompletedPurchase(userId, "career_blueprint").catch(() => false));
    res.json({ entitled });
  });

  app.get("/api/career-blueprint/execution", isAuthenticated, async (req: any, res) => {
    const userId: string = req.session.userId;
    const user = await storage.getUser(userId).catch(() => undefined);
    const entitled = isAdminEmail(user?.email) || (await storage.hasCompletedPurchase(userId, "career_blueprint").catch(() => false));
    if (!entitled) return res.status(403).json({ message: "Personal Career Blueprint purchase required" });

    try {
      const row = await storage.getLatestCareerBlueprintExecution(userId);
      const record = row ? careerExecutionRecordSchema.parse(row.snapshot) : null;
      return res.json({ record, syncedAt: row?.updatedAt ?? null, syncAvailable: true });
    } catch (error) {
      console.error("[Career Blueprint execution] load error:", error);
      return res.json({ record: null, syncedAt: null, syncAvailable: false });
    }
  });

  app.post("/api/career-blueprint/execution", isAuthenticated, async (req: any, res) => {
    const userId: string = req.session.userId;
    const user = await storage.getUser(userId).catch(() => undefined);
    const entitled = isAdminEmail(user?.email) || (await storage.hasCompletedPurchase(userId, "career_blueprint").catch(() => false));
    if (!entitled) return res.status(403).json({ message: "Personal Career Blueprint purchase required" });

    const parsed = careerProfileSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Complete the career assessment before opening your execution workspace" });
    const record = createCareerExecutionRecord(parsed.data, parsed.data.selectedRouteId);
    try {
      const row = await storage.upsertCareerBlueprintExecution(userId, record);
      return res.json({ record: row.snapshot, syncedAt: row.updatedAt, syncAvailable: true });
    } catch (error) {
      console.error("[Career Blueprint execution] initial sync error:", error);
      return res.json({ record, syncedAt: null, syncAvailable: false });
    }
  });

  app.put("/api/career-blueprint/execution/:executionId", isAuthenticated, async (req: any, res) => {
    const userId: string = req.session.userId;
    const user = await storage.getUser(userId).catch(() => undefined);
    const entitled = isAdminEmail(user?.email) || (await storage.hasCompletedPurchase(userId, "career_blueprint").catch(() => false));
    if (!entitled) return res.status(403).json({ message: "Personal Career Blueprint purchase required" });

    try {
      const record = careerExecutionRecordSchema.parse(req.body);
      if (record.id !== req.params.executionId) return res.status(400).json({ message: "Execution identifier mismatch" });
      const row = await storage.upsertCareerBlueprintExecution(userId, record);
      return res.status(201).json({ record: row.snapshot, syncedAt: row.updatedAt, syncAvailable: true });
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ message: "Invalid Career Blueprint execution record", issues: error.issues });
      console.error("[Career Blueprint execution] save error:", error);
      return res.status(503).json({ message: "Workspace saved locally; account sync is temporarily unavailable" });
    }
  });

  // Server-side copy of the assessment profile so an entitled buyer can
  // restore it on a new device (PDF regeneration, workspace creation).
  // Latest write wins — one active profile per user. Like the execution sync,
  // a missing table degrades to syncAvailable:false instead of a 500.
  app.put("/api/career-blueprint/profile", isAuthenticated, async (req: any, res) => {
    const userId: string = req.session.userId;
    const parsed = careerProfileSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid career profile", issues: parsed.error.issues });
    try {
      const row = await storage.upsertCareerBlueprintProfile(userId, parsed.data);
      return res.json({ profile: row.profile, syncedAt: row.updatedAt, syncAvailable: true });
    } catch (error) {
      console.error("[Career Blueprint profile] save error:", error);
      return res.json({ profile: parsed.data, syncedAt: null, syncAvailable: false });
    }
  });

  app.get("/api/career-blueprint/profile", isAuthenticated, async (req: any, res) => {
    const userId: string = req.session.userId;
    const user = await storage.getUser(userId).catch(() => undefined);
    const entitled = isAdminEmail(user?.email) || (await storage.hasCompletedPurchase(userId, "career_blueprint").catch(() => false));
    if (!entitled) return res.status(403).json({ message: "Personal Career Blueprint purchase required", code: "career_blueprint_purchase_required" });

    try {
      const row = await storage.getCareerBlueprintProfile(userId);
      const profile = row ? careerProfileSchema.parse(row.profile) : null;
      return res.json({ profile, syncedAt: row?.updatedAt ?? null, syncAvailable: true });
    } catch (error) {
      console.error("[Career Blueprint profile] load error:", error);
      return res.json({ profile: null, syncedAt: null, syncAvailable: false });
    }
  });

  app.post("/api/career-blueprint/download", isAuthenticated, async (req: any, res) => {
    const userId: string = req.session.userId;
    const user = await storage.getUser(userId).catch(() => undefined);
    const entitled = isAdminEmail(user?.email) || (await storage.hasCompletedPurchase(userId, "career_blueprint").catch(() => false));
    if (!entitled) return res.status(403).json({ message: "Personal Career Blueprint purchase required" });

    const parsed = careerProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Complete the career assessment before generating your Blueprint" });
    }

    try {
      const pdf = await careerBlueprintPdf(parsed.data);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${careerProfileFilename(parsed.data)}"`);
      res.setHeader("Cache-Control", "private, no-store");
      return res.send(pdf);
    } catch (error) {
      console.error("[Career Blueprint] generation error:", error);
      return res.status(500).json({ message: "Unable to generate the Personal Career Blueprint" });
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

      const baseUrl = getPublicOrigin();
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

  app.post("/api/quality-lab/funnel-events", funnelEventLimiter, async (req: any, res) => {
    const parsed = qualityLabFunnelEventSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid Blueprint funnel event" });
    try {
      const row = await storage.recordQualityLabFunnelEvent(req.session?.userId ?? null, {
        ...parsed.data,
        occurredAt: new Date().toISOString(),
      });
      return res.status(202).json({ accepted: true, recorded: Boolean(row) });
    } catch (error) {
      // Analytics must never interrupt the user journey. The admin endpoint will
      // expose a missing table clearly until db:push is run.
      console.error("[Quality Lab funnel] receipt error:", error);
      return res.status(202).json({ accepted: true, recorded: false });
    }
  });

  app.post(api.quoteRequests.create.path, async (req, res) => {
    try {
      const input = api.quoteRequests.create.input.parse(req.body);
      const quote = await storage.createQuoteRequest(input);
      sendCommercialRequestEmails({
        requestId: String(quote?.id ?? "pending"),
        name: input.name,
        email: input.email.toLowerCase(),
        company: input.company ?? undefined,
        offer: input.productOfInterest ?? "Commercial inquiry",
        summary: input.need,
      }).catch((error) => console.error("[Commercial request] Email notification failed:", error));
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

  app.post(api.qualityLabReviews.create.path, async (req, res) => {
    try {
      const input = api.qualityLabReviews.create.input.parse(req.body);
      const { formatQualityLabReviewBrief, qualityLabReviewOfferLabel } = await import("../shared/quality-lab-review.js");
      const quote = await storage.createQuoteRequest({
        name: input.contact.name,
        email: input.contact.email.toLowerCase(),
        company: input.contact.company,
        need: formatQualityLabReviewBrief(input),
        productOfInterest: qualityLabReviewOfferLabel(input.qualification.engagementIntent),
      });
      sendCommercialRequestEmails({
        requestId: String(quote?.id ?? "pending"),
        name: input.contact.name,
        email: input.contact.email.toLowerCase(),
        company: input.contact.company ?? undefined,
        offer: qualityLabReviewOfferLabel(input.qualification.engagementIntent),
        summary: formatQualityLabReviewBrief(input),
      }).catch((error) => console.error("[Quality Lab review] Email notification failed:", error));
      res.status(201).json(quote);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join(".") });
      }
      throw err;
    }
  });

  // Account project persistence is explicit and conflict-aware. The existing
  // reviewed-project tables are reused as a legacy physical store so this
  // rollout does not require a destructive or production-ambiguous migration.
  const requireAccountProjectSchema = async (req: Request, res: Response, next: NextFunction) => {
    if (await checkRuntimeSchema()) return next();
    return res.status(503).json({
      message: "Account project storage is not ready",
      code: "SCHEMA_NOT_READY",
      requestId: req.requestId ?? "unavailable",
    });
  };

  app.get("/api/quality-lab/projects", isAuthenticated, requireAccountProjectSchema, async (req: any, res) => {
    const rows = await storage.listQualityLabReviewedProjects(req.session.userId);
    const records = await Promise.all(rows.map(async (row) => {
      const revisionCount = await storage.countQualityLabReviewedProjectRevisions(req.session.userId, row.localProjectId);
      return {
        snapshot: qualityLabReviewedProjectSnapshotSchema.parse(row.snapshot),
        updatedAt: row.updatedAt?.toISOString() ?? row.createdAt?.toISOString() ?? new Date(0).toISOString(),
        revisionCount,
      };
    }));
    res.json(records);
  });

  app.put("/api/quality-lab/projects/:localProjectId", isAuthenticated, requireAccountProjectSchema, async (req: any, res) => {
    try {
      const request = qualityLabProjectSyncRequestSchema.parse(req.body);
      if (request.snapshot.localProjectId !== req.params.localProjectId) return res.status(400).json({ message: "Project identifier mismatch" });
      const result = await storage.syncQualityLabReviewedProject(req.session.userId, request.snapshot, request.expectedUpdatedAt);
      if (result.status === "conflict") {
        const currentUpdatedAt = result.row.updatedAt?.toISOString() ?? result.row.createdAt?.toISOString() ?? null;
        return res.status(409).json({
          snapshot: qualityLabReviewedProjectSnapshotSchema.parse(result.row.snapshot),
          updatedAt: currentUpdatedAt,
          revisionCount: result.revisionCount,
        });
      }
      res.status(result.status === "created" ? 201 : 200).json({
        snapshot: qualityLabReviewedProjectSnapshotSchema.parse(result.row.snapshot),
        updatedAt: result.row.updatedAt?.toISOString() ?? result.row.createdAt?.toISOString() ?? new Date().toISOString(),
        revisionCount: result.revisionCount,
      });
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join(".") });
      throw err;
    }
  });

  app.delete("/api/quality-lab/projects/:localProjectId", isAuthenticated, requireAccountProjectSchema, async (req: any, res) => {
    const deleted = await storage.deleteQualityLabReviewedProject(req.session.userId, req.params.localProjectId);
    if (!deleted) return res.status(404).json({ message: "Account project not found" });
    res.status(204).end();
  });

  app.get("/api/quality-lab/projects/:localProjectId/revisions", isAuthenticated, requireAccountProjectSchema, async (req: any, res) => {
    const rows = await storage.listQualityLabReviewedProjectRevisions(req.session.userId, req.params.localProjectId);
    res.json(rows.map((row) => ({ revisionNumber: row.revisionNumber, reason: row.reason, createdAt: row.createdAt, generatedAt: row.snapshot.blueprint.generatedAt, blockingOpenCount: row.snapshot.blueprint.dataQuality.blockingOpenCount })));
  });

  app.get("/api/quality-lab/projects/:localProjectId/revisions/:revisionNumber", isAuthenticated, requireAccountProjectSchema, async (req: any, res) => {
    const revisionNumber = Number(req.params.revisionNumber);
    if (!Number.isInteger(revisionNumber) || revisionNumber < 1) return res.status(400).json({ message: "Invalid revision number" });
    const row = await storage.getQualityLabReviewedProjectRevision(req.session.userId, req.params.localProjectId, revisionNumber);
    if (!row) return res.status(404).json({ message: "Project revision not found" });
    res.json({
      revisionNumber: row.revisionNumber,
      reason: row.reason,
      createdAt: row.createdAt,
      snapshot: qualityLabReviewedProjectSnapshotSchema.parse(row.snapshot),
    });
  });

  // Backward-compatible expert-review routes remain available for existing
  // delivery workflows and stored URLs.
  app.get("/api/quality-lab/reviewed-projects", isAuthenticated, async (req: any, res) => {
    const rows = await storage.listQualityLabReviewedProjects(req.session.userId);
    res.json(rows.map((row) => row.snapshot));
  });

  // Lets the review page recognize a user returning from a successful $149
  // Paid Scope Diagnostic checkout, so it can show the post-payment state
  // instead of a fresh intake form. Mirrors /api/career-blueprint/access.
  app.get("/api/quality-lab/diagnostic-access", isAuthenticated, async (req: any, res) => {
    const userId: string = req.session.userId;
    const user = await storage.getUser(userId).catch(() => undefined);
    const entitled = isAdminEmail(user?.email) || (await storage.hasCompletedPurchase(userId, "scope_diagnostic").catch(() => false));
    const purchasedAt = await storage.getLatestCompletedPurchaseAt(userId, "scope_diagnostic").catch(() => null);
    res.json({ entitled, purchasedAt: purchasedAt ? purchasedAt.toISOString() : null });
  });

  app.get("/api/quality-lab/reminder-preference", isAuthenticated, async (req: any, res) => {
    const preference = await storage.getQualityLabReminderPreference(req.session.userId);
    res.json({ cadence: preference?.cadence ?? "off", updatedAt: preference?.updatedAt ?? null });
  });

  app.put("/api/quality-lab/reminder-preference", isAuthenticated, async (req: any, res) => {
    try {
      const cadence = qualityLabReminderCadenceSchema.parse(req.body?.cadence);
      const preference = await storage.upsertQualityLabReminderPreference(req.session.userId, cadence);
      res.json({ cadence: preference.cadence, updatedAt: preference.updatedAt });
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: "Reminder cadence must be off, weekly, weekdays, or daily" });
      throw err;
    }
  });

  // Governance registers are saved only when a signed-in user explicitly asks.
  // They remain working records, not electronic signatures or external approval.
  app.get("/api/quality-lab/governance/:recordKey", isAuthenticated, async (req: any, res) => {
    const recordKey = qualityLabGovernanceKeySchema.safeParse(req.params.recordKey);
    if (!recordKey.success) return res.status(404).json({ message: "Governance register not found" });
    const row = await storage.getQualityLabGovernanceRecord(req.session.userId, recordKey.data);
    if (!row) return res.status(404).json({ message: "Governance register not found" });
    res.json(row.snapshot);
  });

  app.put("/api/quality-lab/governance/:recordKey", isAuthenticated, async (req: any, res) => {
    try {
      const recordKey = qualityLabGovernanceKeySchema.parse(req.params.recordKey);
      const snapshot = qualityLabGovernanceSnapshotSchema.parse(req.body);
      const expectedVersion = { "expert-ownership": "expert-ownership-register/v1", "source-closures": "source-closure-register/v1", "rule-changes": "rule-change-register/v1" }[recordKey];
      if (snapshot.registerVersion !== expectedVersion) return res.status(400).json({ message: "Governance record type mismatch" });
      const row = await storage.upsertQualityLabGovernanceRecord(req.session.userId, recordKey, snapshot);
      res.status(201).json({ recordKey: row.recordKey, updatedAt: row.updatedAt });
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join(".") });
      throw err;
    }
  });

  app.get("/api/quality-lab/governance/:recordKey/revisions", isAuthenticated, async (req: any, res) => {
    const recordKey = qualityLabGovernanceKeySchema.safeParse(req.params.recordKey);
    if (!recordKey.success) return res.status(404).json({ message: "Governance register not found" });
    const rows = await storage.listQualityLabGovernanceRevisions(req.session.userId, recordKey.data);
    res.json(rows.map((row) => ({ revisionNumber: row.revisionNumber, createdAt: row.createdAt })));
  });

  app.get("/api/quality-lab/governance/:recordKey/revisions/:revisionNumber", isAuthenticated, async (req: any, res) => {
    const recordKey = qualityLabGovernanceKeySchema.safeParse(req.params.recordKey);
    if (!recordKey.success) return res.status(404).json({ message: "Governance register not found" });
    const rows = await storage.listQualityLabGovernanceRevisions(req.session.userId, recordKey.data);
    const revision = rows.find((row) => row.revisionNumber === Number(req.params.revisionNumber));
    if (!revision) return res.status(404).json({ message: "Governance revision not found" });
    res.json(revision.snapshot);
  });

  app.put("/api/quality-lab/reviewed-projects/:localProjectId", isAuthenticated, async (req: any, res) => {
    try {
      const snapshot = qualityLabReviewedProjectSnapshotSchema.parse(req.body);
      if (snapshot.localProjectId !== req.params.localProjectId) return res.status(400).json({ message: "Project identifier mismatch" });
      if (!snapshot.reviewRequestedAt) return res.status(400).json({ message: "Only requested-review projects may be persisted" });
      const row = await storage.upsertQualityLabReviewedProject(req.session.userId, snapshot);
      res.status(201).json({ localProjectId: row.localProjectId, projectName: row.projectName, updatedAt: row.updatedAt });
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join(".") });
      throw err;
    }
  });

  app.get("/api/quality-lab/reviewed-projects/:localProjectId", isAuthenticated, async (req: any, res) => {
    const row = await storage.getQualityLabReviewedProject(req.session.userId, req.params.localProjectId);
    if (!row) return res.status(404).json({ message: "Reviewed project not found" });
    res.json(row.snapshot);
  });

  app.delete("/api/quality-lab/reviewed-projects/:localProjectId", isAuthenticated, async (req: any, res) => {
    const deleted = await storage.deleteQualityLabReviewedProject(req.session.userId, req.params.localProjectId);
    if (!deleted) return res.status(404).json({ message: "Reviewed project not found" });
    res.status(204).end();
  });

  app.get("/api/quality-lab/reviewed-projects/:localProjectId/revisions", isAuthenticated, async (req: any, res) => {
    const rows = await storage.listQualityLabReviewedProjectRevisions(req.session.userId, req.params.localProjectId);
    res.json(rows.map((row) => ({ revisionNumber: row.revisionNumber, reason: row.reason, createdAt: row.createdAt, generatedAt: row.snapshot.blueprint.generatedAt, blockingOpenCount: row.snapshot.blueprint.dataQuality.blockingOpenCount })));
  });

  app.get("/api/quality-lab/reviewed-projects/:localProjectId/revisions/:revisionNumber/compare-current", isAuthenticated, async (req: any, res) => {
    const current = await storage.getQualityLabReviewedProject(req.session.userId, req.params.localProjectId);
    if (!current) return res.status(404).json({ message: "Reviewed project not found" });
    const baseline = await storage.getQualityLabReviewedProjectRevision(req.session.userId, req.params.localProjectId, Number(req.params.revisionNumber));
    if (!baseline) return res.status(404).json({ message: "Revision not found" });
    res.json(compareQualityLabReviewedSnapshots(baseline.snapshot, current.snapshot));
  });

  // ── Lead capture ────────────────────────────────────────────────────────

  app.get("/api/quality-lab/reviewed-projects/:localProjectId/delivery-workbook", isAuthenticated, async (req: any, res) => {
    const row = await storage.getQualityLabReviewedProject(req.session.userId, req.params.localProjectId);
    if (!row) return res.status(404).json({ message: "Reviewed project not found" });
    if (!row.snapshot.engagement) return res.status(409).json({ message: "Complete the review engagement workspace before exporting a delivery workbook" });
    const { qualityLabDeliveryWorkbook } = await import("./generate.js");
    const filename = `${row.projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "atlas-quality-lab"}-blueprint-delivery.xlsx`;
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(qualityLabDeliveryWorkbook(row.snapshot));
  });

  app.get("/api/quality-lab/reviewed-projects/:localProjectId/delivery-brief.pdf", isAuthenticated, async (req: any, res) => {
    const row = await storage.getQualityLabReviewedProject(req.session.userId, req.params.localProjectId);
    if (!row) return res.status(404).json({ message: "Reviewed project not found" });
    if (!row.snapshot.engagement) return res.status(409).json({ message: "Complete the review engagement workspace before exporting a decision brief" });
    const { qualityLabBlueprintPdf } = await import("./quality-lab-blueprint-pdf.js");
    const filename = `${row.projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "atlas-quality-lab"}-decision-brief.pdf`;
    const pdf = await qualityLabBlueprintPdf(row.snapshot);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(pdf);
  });

  app.get("/api/quality-lab/reviewed-projects/:localProjectId/urs-document.docx", isAuthenticated, async (req: any, res) => {
    const row = await storage.getQualityLabReviewedProject(req.session.userId, req.params.localProjectId);
    if (!row) return res.status(404).json({ message: "Reviewed project not found" });
    if (!row.snapshot.engagement) return res.status(409).json({ message: "Complete the review engagement workspace before exporting a URS drafting document" });
    const { qualityLabUrsDocument } = await import("./quality-lab-urs-docx.js");
    const filename = `${row.projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "atlas-quality-lab"}-vendor-neutral-urs.docx`;
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(await qualityLabUrsDocument(row.snapshot));
  });

  app.get("/api/quality-lab/reviewed-projects/:localProjectId/rfq-workbook", isAuthenticated, async (req: any, res) => {
    const row = await storage.getQualityLabReviewedProject(req.session.userId, req.params.localProjectId);
    if (!row) return res.status(404).json({ message: "Reviewed project not found" });
    if (!row.snapshot.engagement) return res.status(409).json({ message: "Complete the review engagement workspace before exporting an RFQ comparison workbook" });
    const { qualityLabRfqWorkbook } = await import("./generate.js");
    const filename = `${row.projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "atlas-quality-lab"}-rfq-comparison.xlsx`;
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(qualityLabRfqWorkbook(row.snapshot));
  });

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
        const base = getPublicOrigin();
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
  const CONTENT_LANGS = new Set(["en"]);
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
    const quality = toPublicContentQuality(getContentQuality(collection, slug, title, tier));

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
      return res.json({ locked: true, tier, title, teaser, quality });
    }
    return res.json({ locked: false, tier, title, body: content, quality });
  });

  // Official-source metadata plus deterministic impact triage. No feed item is
  // represented as reviewed regulatory interpretation or an approved change.
  app.get("/api/regulatory-updates", async (_req, res) => {
    try {
      const monitor = await fetchRegulatoryMonitor();
      res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=900");
      return res.json(monitor);
    } catch (err) {
      console.error("[Regulatory monitor] feed refresh failed:", err);
      return res.status(503).json({ message: "Official-source feeds are temporarily unavailable", generatedAt: new Date().toISOString(), items: [], sources: [] });
    }
  });

  app.get("/api/regulatory-preference", isAuthenticated, async (req: any, res) => {
    const user = await storage.getUser(req.session.userId).catch(() => undefined);
    if (!isProActive(user)) return res.status(403).json({ message: "Active Pro membership required" });
    try {
      const row = await storage.getRegulatoryAlertPreference(req.session.userId);
      return res.json({ cadence: row?.cadence ?? "off", domains: row?.domains ?? [], sources: row?.sources ?? [], syncAvailable: true });
    } catch {
      return res.json({ cadence: "off", domains: [], sources: [], syncAvailable: false });
    }
  });

  app.put("/api/regulatory-preference", isAuthenticated, async (req: any, res) => {
    const user = await storage.getUser(req.session.userId).catch(() => undefined);
    if (!isProActive(user)) return res.status(403).json({ message: "Active Pro membership required" });
    const parsed = regulatoryDigestPreferenceSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0]?.message ?? "Invalid regulatory watchlist" });
    try {
      const row = await storage.upsertRegulatoryAlertPreference(req.session.userId, parsed.data);
      return res.json({ cadence: row.cadence, domains: row.domains, sources: row.sources, updatedAt: row.updatedAt, syncAvailable: true });
    } catch (err) {
      console.error("[Regulatory monitor] preference save failed:", err);
      return res.status(503).json({ message: "Regulatory watchlist storage is unavailable; run db:push" });
    }
  });

  // ── Daily lifecycle cron ──────────────────────────────────────────────────
  // Secured by CRON_SECRET (Vercel cron sends it as a Bearer token). One daily
  // run does three jobs, each isolated so one missing table can't break another:
  //   1. free→Pro nurture (day 1/3/7 since signup)
  //   2. trial-ending reminders (3 days + 1 day before the Pro trial ends)
  //   3. abandoned-checkout reminders (started checkout, never converted)
  // Path kept as /api/cron/nurture for vercel.json compatibility.
  app.get("/api/cron/nurture", async (req: any, res) => {
    const secret = process.env.CRON_SECRET;
    if (!secret) return res.status(503).json({ message: "Lifecycle cron not configured" });
    const auth = req.headers.authorization as string | undefined;
    const provided = (auth?.startsWith("Bearer ") ? auth.slice(7) : undefined) ?? req.headers["x-cron-secret"];
    if (provided !== secret) return res.status(401).json({ message: "Unauthorized" });

    const DAY = 24 * 60 * 60 * 1000;
    const result: Record<string, unknown> = { ok: true };

    // 1. Nurture
    const SCHEDULE = [{ step: 1, day: 1 }, { step: 2, day: 3 }, { step: 3, day: 7 }];
    try {
      let scanned = 0, sent = 0;
      for (const u of await storage.getNurtureCandidates(14)) {
        if (!u.email || !u.createdAt) continue;
        scanned++;
        const ageDays = (Date.now() - new Date(u.createdAt).getTime()) / DAY;
        const due = SCHEDULE.filter((s) => ageDays >= s.day).map((s) => s.step);
        if (!due.length) continue;
        const already = await storage.getSentNurtureSteps(u.id);
        const next = due.find((s) => !already.includes(s));
        if (next == null) continue;
        await sendNurtureEmail(u.email, next, u.firstName ?? undefined);
        await storage.recordNurtureSend(u.id, next);
        sent++;
      }
      result.nurture = { scanned, sent };
    } catch (err) {
      console.error("[Cron] nurture error:", err);
      result.nurture = { error: "nurture_sends table may be absent — run db:push" };
    }

    // 2. Trial-ending (3-day then 1-day, most urgent unsent reminder per user)
    try {
      let sent = 0;
      for (const u of await storage.getTrialEndingCandidates(3)) {
        if (!u.email || !u.proExpiresAt) continue;
        const daysLeft = Math.ceil((new Date(u.proExpiresAt).getTime() - Date.now()) / DAY);
        const kind = daysLeft <= 1 ? "trial_end_1d" : "trial_end_3d";
        if (await storage.wasLifecycleSent(u.id, kind)) continue;
        await sendTrialEndingEmail(u.email, Math.max(1, daysLeft), new Date(u.proExpiresAt), u.firstName ?? undefined);
        await storage.recordLifecycleSend(u.id, kind);
        sent++;
      }
      result.trialEnding = { sent };
    } catch (err) {
      console.error("[Cron] trial-ending error:", err);
      result.trialEnding = { error: "lifecycle_sends table may be absent — run db:push" };
    }

    // 3. Abandoned checkout (started 1–72h ago, not converted, once per user)
    try {
      let sent = 0;
      const seen = new Set<string>();
      for (const a of await storage.getRecentCheckoutAttempts(1, 72)) {
        if (seen.has(a.userId)) continue;
        seen.add(a.userId);
        if (await storage.wasLifecycleSent(a.userId, "abandoned_checkout")) continue;
        const user = await storage.getUser(a.userId).catch(() => undefined);
        if (!user?.email) continue;
        const converted = a.productType.startsWith("pro_subscription")
          ? isProActive(user)
          : await storage.hasCompletedPurchase(user.id, a.productType).catch(() => false);
        if (converted) continue;
        await sendAbandonedCheckoutEmail(user.email, a.productType, user.firstName ?? undefined);
        await storage.recordLifecycleSend(user.id, "abandoned_checkout");
        sent++;
      }
      result.abandonedCheckout = { sent };
    } catch (err) {
      console.error("[Cron] abandoned-checkout error:", err);
      result.abandonedCheckout = { error: "checkout_attempts/lifecycle_sends table may be absent — run db:push" };
    }

    // 4. Re-engagement (last lesson read 7–14 days ago, not Pro, once per user)
    try {
      let sent = 0;
      for (const userId of await storage.getReEngagementCandidates(7, 14)) {
        if (await storage.wasLifecycleSent(userId, "re_engagement")) continue;
        const user = await storage.getUser(userId).catch(() => undefined);
        if (!user?.email || isProActive(user)) continue;
        await sendReEngagementEmail(user.email, user.firstName ?? undefined);
        await storage.recordLifecycleSend(userId, "re_engagement");
        sent++;
      }
      result.reEngagement = { sent };
    } catch (err) {
      console.error("[Cron] re-engagement error:", err);
      result.reEngagement = { error: "lesson_reads/lifecycle_sends table may be absent — run db:push" };
    }

    // 5. Opt-in Blueprint work queue and weekly review. Only explicitly saved
    // review snapshots are available to the server; local projects stay device-only.
    try {
      let scanned = 0, sent = 0, skippedNoPriority = 0;
      let weeklyScanned = 0, weeklySent = 0, weeklySkippedNoChange = 0;
      const today = new Date().toISOString().slice(0, 10);
      const utcDay = new Date().getUTCDay();
      for (const candidate of await storage.getQualityLabReminderCandidates()) {
        if (!candidate.email || candidate.cadence === "off") continue;
        if (candidate.cadence === "weekly" && utcDay !== 1) continue;
        if (candidate.cadence === "weekdays" && (utcDay === 0 || utcDay === 6)) continue;
        const rows = await storage.listQualityLabReviewedProjects(candidate.id);
        const projects = rows.map((row) => qualityLabProjectFromReviewedSnapshot(row.snapshot));
        const queue = qualityLabPortfolioWorkQueue(projects, today);
        if (candidate.cadence === "weekly") {
          weeklyScanned++;
          const review = qualityLabWeeklyPortfolioReview(projects, today);
          if (!review.recentEvents.length && !review.priorityItems.length) {
            weeklySkippedNoChange++;
            continue;
          }
          const kind = `quality_lab_weekly_review_${today}`;
          if (await storage.wasLifecycleSent(candidate.id, kind)) continue;
          const accepted = await sendQualityLabWeeklyReviewEmail(candidate.email, candidate.firstName ?? undefined, review);
          if (!accepted) continue;
          await storage.recordLifecycleSend(candidate.id, kind);
          weeklySent++;
          continue;
        }
        scanned++;
        const priority = queue.filter((item) =>
          item.timing === "overdue"
          || item.timing === "due-soon"
          || item.action.status === "ready-for-review"
          || item.action.status === "in-progress"
          || (item.timing === "unscheduled" && item.action.severity === "blocking"),
        );
        if (!priority.length) {
          skippedNoPriority++;
          continue;
        }
        const kind = `quality_lab_work_queue_${today}`;
        if (await storage.wasLifecycleSent(candidate.id, kind)) continue;
        const accepted = await sendQualityLabWorkQueueEmail(
          candidate.email,
          candidate.firstName ?? undefined,
          priority,
          qualityLabPortfolioQueueMetrics(queue),
        );
        if (!accepted) continue;
        await storage.recordLifecycleSend(candidate.id, kind);
        sent++;
      }
      result.qualityLabWorkQueue = { scanned, sent, skippedNoPriority };
      result.qualityLabWeeklyReview = { scanned: weeklyScanned, sent: weeklySent, skippedNoChange: weeklySkippedNoChange };
    } catch (err) {
      console.error("[Cron] Blueprint reminder error:", err);
      const error = "reminder preferences or reviewed-project tables may be absent — run db:push";
      result.qualityLabWorkQueue = { error };
      result.qualityLabWeeklyReview = { error };
    }

    // 6. Explicitly opted-in Pro regulatory impact digest. Weekly runs Monday;
    // daily runs every day. Empty watchlists mean all configured domains/sources.
    try {
      let scanned = 0, sent = 0, skippedNoChange = 0;
      const today = new Date().toISOString().slice(0, 10);
      const utcDay = new Date().getUTCDay();
      const monitor = await fetchRegulatoryMonitor(true);
      for (const candidate of await storage.getRegulatoryDigestCandidates()) {
        if (!candidate.email || (candidate.cadence !== "daily" && candidate.cadence !== "weekly")) continue;
        if (candidate.cadence === "weekly" && utcDay !== 1) continue;
        const user = await storage.getUser(candidate.id).catch(() => undefined);
        if (!isProActive(user)) continue;
        scanned++;
        const lookbackHours = candidate.cadence === "daily" ? 36 : 8 * 24;
        const cutoffMs = Date.now() - lookbackHours * 60 * 60 * 1000;
        const matching = filterRegulatoryUpdates(
          monitor.items.filter((item) => new Date(item.publishedAt).getTime() >= cutoffMs),
          { domains: candidate.domains, sources: candidate.sources },
        );
        if (matching.length === 0) { skippedNoChange++; continue; }
        const kind = `regulatory_digest_${candidate.cadence}_${today}`;
        if (await storage.wasLifecycleSent(candidate.id, kind)) continue;
        const accepted = await sendRegulatoryDigestEmail(candidate.email, candidate.firstName ?? undefined, candidate.cadence, matching);
        if (!accepted) continue;
        await storage.recordLifecycleSend(candidate.id, kind);
        sent++;
      }
      result.regulatoryDigest = { scanned, sent, skippedNoChange, sourceFailures: monitor.sources.filter((source) => !source.ok).length };
    } catch (err) {
      console.error("[Cron] Regulatory digest error:", err);
      result.regulatoryDigest = { error: "regulatory preferences, lifecycle guard, or official feeds unavailable" };
    }

    return res.json(result);
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
    const pro = isProActive(user) || isAdminEmail(user?.email);

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
          quality: product.quality,
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
    let entitled = isProActive(user) || isAdminEmail(user?.email);
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

  // ── Dynamic sitemap (core pages + all English MDX blog/academy) ────────────
  app.get("/sitemap.xml", async (_req, res) => {
    const baseUrl = getPublicOrigin();

    // Distinct slugs per collection from the MDX files on disk.
    async function slugsIn(collection: string): Promise<string[]> {
      const dir = path.resolve(process.cwd(), "content", collection);
      try {
        const files = await readdir(dir);
        const set = new Set<string>();
        for (const f of files) {
          const m = f.match(/^(.+)\.en\.mdx$/);
          if (m) set.add(m[1]);
        }
        return Array.from(set);
      } catch {
        return [];
      }
    }

    const corePaths = [
      "", "/workflows", "/toolkits", "/academy",
      "/glossary", "/about", "/tools", "/compliance", "/career", "/career/domains", "/products", "/pro", "/how-it-works", "/methods", "/monitor",
      "/quality-lab", "/quality-lab/how-it-works", "/quality-lab/deliverables", "/quality-lab/sample",
      "/pricing", "/toolkits/gmp-audit-kit", "/evidence", "/evidence/biopharma", "/evidence/pharma-api", "/evidence/drug-product",
      "/blog", "/upgrade", "/login", "/signup", "/faq", "/terms", "/privacy",
    ];
    // Learning-path tracks. Kept in sync with client/src/data/learningPaths.ts.
    const pathPaths = [
      "microbiology-qc-fundamentals", "sterile-aseptic-manufacturing",
      "validation-essentials", "quality-systems",
      "investigations-data-integrity", "laboratory-controls-stability",
      "pharma-api-development-quality",
      "pharma-drug-product-quality",
      "biologics-biopharmaceutical-qc",
    ].map((s) => `/paths/${s}`);
    // Workflow detail pages. Kept in sync with client/src/data/workflows.ts.
    const workflowPaths = [
      "culture-media-selection", "environmental-monitoring", "water-system-monitoring",
      "biological-indicator-workflow", "aseptic-gowning-qualification",
      "aseptic-process-simulation", "sterile-filtration",
      "oos-investigation", "deviation-capa", "data-integrity-review",
      "equipment-qualification-lifecycle", "process-validation",
      "cleaning-validation-program", "change-control-workflow",
      "supplier-qualification-workflow", "batch-record-review-release",
      "hplc-system-suitability-workflow", "dissolution-testing-workflow",
      "stability-program", "pharma-api-impurity-control", "biopharma-control-strategy", "cell-based-potency-assay",
      "host-cell-protein-testing-workflow", "viral-safety-testing-workflow",
    ].map((s) => `/workflows/${s}`);
    // Standalone tool pages. Kept in sync with client/src/features/tools/registry.tsx.
    const toolPaths = [
      "audit-readiness-scorecard", "lab-water-type-selector",
      "culture-media-selection-helper", "sterility-test-method-selector",
      "sterile-filtration-readiness-planner", "gowning-qualification-readiness-planner",
      "media-fill-aps-readiness-planner", "microbial-count-calculator", "sterilization-f0-calculator",
      "endotoxin-limit-calculator", "cleaning-validation-maco-calculator",
      "process-capability-calculator", "equipment-qualification-readiness-planner", "system-suitability-calculator",
      "dilution-calculator", "dissolution-acceptance-checker", "stability-trend-shelf-life-planner",
      "cell-based-potency-readiness-planner",
      "hcp-testing-readiness-planner",
      "viral-safety-readiness-planner",
      "oot-trend-triage-planner",
      "audit-trail-review-triage",
      "batch-release-readiness-checklist", "change-control-impact-triage", "supplier-qualification-risk-triage",
      "oos-investigation-decision-tree",
      "em-scenario-decision-tree", "contamination-control-strategy-builder",
      "investigation-template-viewer", "capa-effectiveness-check-planner",
      "cell-bank-evidence-readiness-planner", "impurity-fate-purge-evidence-mapper",
      "routine-control-signal-planner",
    ].map((s) => `/tools/${s}`);
    const blogPaths = (await slugsIn("blog")).map((s) => `/blog/${s}`);
    const libPaths = (await slugsIn("academy")).map((s) => `/library/${s}`);
    const decisionPackagePaths = DECISION_PACKAGES.map((item) => `/evidence/packages/${item.id}`);
    const allPaths = [...corePaths, ...decisionPackagePaths, ...pathPaths, ...workflowPaths, ...toolPaths, ...blogPaths, ...libPaths];

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
    const baseUrl = getPublicOrigin();
    const dir = path.resolve(process.cwd(), "content", "blog");
    const esc = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

    type Item = { title: string; slug: string; desc: string; updatedAt?: string };
    const items: Item[] = [];
    try {
      const files = await readdir(dir);
      for (const file of files) {
        const m = file.match(/^(.+)\.(en)\.mdx$/);
        if (!m) continue;
        const raw = await readFile(path.join(dir, file), "utf-8");
        const { data } = matter(raw);
        items.push({
          title: (data.title as string) ?? m[1],
          slug: (data.slug as string) ?? m[1],
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
      `<title>Life Science Atlas Blog</title>\n` +
      `<link>${baseUrl}/blog</link>\n` +
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
