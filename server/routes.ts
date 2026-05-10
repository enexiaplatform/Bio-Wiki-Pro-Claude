import type { Express } from "express";
import { storage } from "./storage.js";
import { api } from "../shared/routes.js";
import { z } from "zod";
import session from "express-session";
import connectPg from "connect-pg-simple";
import bcrypt from "bcryptjs";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-06-30.basil" as any,
    })
  : null;

const PRICE_MAP: Record<string, string> = {
  pro_subscription: process.env.STRIPE_PRO_PRICE_ID ?? "",
  starter_kit: process.env.STRIPE_STARTER_KIT_PRICE_ID ?? "",
  interview_prep: process.env.STRIPE_INTERVIEW_PREP_PRICE_ID ?? "",
  bundle: process.env.STRIPE_BUNDLE_PRICE_ID ?? "",
};

const SUBSCRIPTION_PRODUCTS = new Set(["pro_subscription"]);

// Add session middleware
export function setupSession(app: Express) {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  const sessionStore = process.env.DATABASE_URL
    ? new (connectPg(session))({
        conString: process.env.DATABASE_URL,
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

    try {
      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const { userId, productType } = session.metadata ?? {};
        if (!userId || !productType) {
          return res.status(400).json({ message: "Missing metadata" });
        }

        if (productType === "pro_subscription") {
          await storage.updateUserStripe(userId, {
            isPro: true,
            subscriptionStatus: "active",
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
          });
        } else {
          await storage.createPurchase({
            userId,
            productType,
            stripeSessionId: session.id,
            amount: session.amount_total ?? undefined,
            status: "completed",
          });
        }
      } else if (event.type === "customer.subscription.deleted") {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const user = await storage.getUserByStripeCustomerId(customerId);
        if (user) {
          await storage.updateUserStripe(user.id, {
            isPro: false,
            subscriptionStatus: "cancelled",
          });
        }
      }
    } catch (err) {
      console.error("Webhook handler error:", err);
      return res.status(500).json({ message: "Webhook handler failed" });
    }

    res.status(200).json({ received: true });
  });

  setupSession(app);

  // ── Auth routes ──────────────────────────────────────────────────────────

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const user = await storage.createUser({ email, passwordHash, firstName, lastName });

      req.session.userId = user.id;
      return res.status(201).json({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, isPro: user.isPro });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
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

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.status(200).json({ message: "Logged out" });
    });
  });

  app.get("/api/auth/me", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, isPro: user.isPro });
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
      const priceId = PRICE_MAP[productType];
      if (!priceId) {
        return res.status(400).json({ message: "Invalid productType" });
      }

      const baseUrl = process.env.BASE_URL ?? "http://localhost:5000";
      const isSubscription = SUBSCRIPTION_PRODUCTS.has(productType);

      const session = await stripe.checkout.sessions.create({
        mode: isSubscription ? "subscription" : "payment",
        line_items: [{ price: priceId, quantity: 1 }],
        customer_email: user.email ?? undefined,
        success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/pricing`,
        metadata: { userId: user.id, productType },
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

  // Old mock toggle-pro route, kept so the frontend doesn't break.
  // Will be replaced by Stripe webhooks setting isPro.
  app.post(api.users.togglePro.path, isAuthenticated, async (req: any, res) => {
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
