import { describe, it, expect, beforeEach, afterAll, vi } from "vitest";
import express from "express";
import request from "supertest";

// ── Mocks (vi.hoisted so the vi.mock factories can reference them) ────────────
const { storageMock, constructEvent, verifyIdToken, checkoutCreate, portalCreate } = vi.hoisted(() => ({
  storageMock: {
    getUser: vi.fn(),
    getUserByEmail: vi.fn(),
    getUserByStripeCustomerId: vi.fn(),
    createUser: vi.fn(),
    updateUserPro: vi.fn(),
    updateUserStripe: vi.fn(),
    createPurchase: vi.fn(),
    createQuoteRequest: vi.fn(),
    captureLead: vi.fn(),
    isStripeEventProcessed: vi.fn(),
    markStripeEventProcessed: vi.fn(),
    getContentEntry: vi.fn(),
    upsertContentEntry: vi.fn(),
    hasCompletedPurchase: vi.fn(),
    getUserByResetToken: vi.fn(),
    setResetToken: vi.fn(),
    updatePassword: vi.fn(),
    getReadLessons: vi.fn(),
    markLessonRead: vi.fn(),
    setVerificationToken: vi.fn(() => Promise.resolve()),
    getUserByVerificationToken: vi.fn(),
    markEmailVerified: vi.fn(() => Promise.resolve()),
    getNurtureCandidates: vi.fn(() => Promise.resolve([])),
    getSentNurtureSteps: vi.fn(() => Promise.resolve([])),
    recordNurtureSend: vi.fn(() => Promise.resolve()),
    getTrialEndingCandidates: vi.fn(() => Promise.resolve([])),
    wasLifecycleSent: vi.fn(() => Promise.resolve(false)),
    recordLifecycleSend: vi.fn(() => Promise.resolve()),
    recordCheckoutAttempt: vi.fn(() => Promise.resolve()),
    getRecentCheckoutAttempts: vi.fn(() => Promise.resolve([])),
    getReEngagementCandidates: vi.fn(() => Promise.resolve([])),
  },
  constructEvent: vi.fn(),
  verifyIdToken: vi.fn(),
  checkoutCreate: vi.fn(),
  portalCreate: vi.fn(),
}));
vi.mock("../storage.js", () => ({ storage: storageMock }));

vi.mock("google-auth-library", () => ({
  OAuth2Client: class {
    verifyIdToken = verifyIdToken;
  },
}));

vi.mock("stripe", () => {
  function Stripe() {
    return {
      webhooks: { constructEvent },
      checkout: { sessions: { create: checkoutCreate } },
      billingPortal: { sessions: { create: portalCreate } },
    };
  }
  return { default: Stripe };
});

vi.mock("../email.js", () => ({
  // must return a Promise — routes call .catch() on these (fire-and-forget)
  sendWelcomeEmail: vi.fn(() => Promise.resolve()),
  sendPurchaseConfirmation: vi.fn(() => Promise.resolve()),
  sendLeadMagnetEmail: vi.fn(() => Promise.resolve()),
  sendDunningEmail: vi.fn(() => Promise.resolve()),
  sendPasswordResetEmail: vi.fn(() => Promise.resolve()),
  sendVerificationEmail: vi.fn(() => Promise.resolve()),
  sendNurtureEmail: vi.fn(() => Promise.resolve()),
  sendTrialEndingEmail: vi.fn(() => Promise.resolve()),
  sendAbandonedCheckoutEmail: vi.fn(() => Promise.resolve()),
  sendReEngagementEmail: vi.fn(() => Promise.resolve()),
}));

import { registerRoutes } from "../routes.js";
import * as email from "../email.js";

async function buildApp() {
  const app = express();
  app.use(express.json({ verify: (req: any, _res, buf) => { req.rawBody = buf; } }));
  app.use(express.urlencoded({ extended: false }));
  await registerRoutes(app);
  return app;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("auth", () => {
  it("register → me round-trip (session persisted)", async () => {
    const app = await buildApp();
    const agent = request.agent(app);

    storageMock.getUserByEmail.mockResolvedValueOnce(undefined);
    storageMock.createUser.mockResolvedValueOnce({ id: "u1", email: "a@b.com", isPro: false });

    const reg = await agent.post("/api/auth/register").send({ email: "a@b.com", password: "pw123456" });
    expect(reg.status).toBe(201);
    expect(reg.body.id).toBe("u1");

    storageMock.getUser.mockResolvedValueOnce({ id: "u1", email: "a@b.com", isPro: false, subscriptionStatus: "free" });
    const me = await agent.get("/api/auth/me");
    expect(me.status).toBe(200);
    expect(me.body).toMatchObject({ id: "u1", isPro: false });
  });

  it("register rejects duplicate email", async () => {
    const app = await buildApp();
    storageMock.getUserByEmail.mockResolvedValueOnce({ id: "u1", email: "a@b.com" });
    const res = await request(app).post("/api/auth/register").send({ email: "a@b.com", password: "pw123456" });
    expect(res.status).toBe(400);
  });

  it("register rejects an invalid email", async () => {
    const app = await buildApp();
    const res = await request(app).post("/api/auth/register").send({ email: "not-an-email", password: "pw123456" });
    expect(res.status).toBe(400);
    expect(storageMock.createUser).not.toHaveBeenCalled();
  });

  it("register rejects a short password", async () => {
    const app = await buildApp();
    const res = await request(app).post("/api/auth/register").send({ email: "a@b.com", password: "short" });
    expect(res.status).toBe(400);
    expect(storageMock.createUser).not.toHaveBeenCalled();
  });

  it("login rejects bad credentials", async () => {
    const app = await buildApp();
    storageMock.getUserByEmail.mockResolvedValueOnce(undefined);
    const res = await request(app).post("/api/auth/login").send({ email: "x@y.com", password: "nope" });
    expect(res.status).toBe(401);
  });

  it("me is 401 without session", async () => {
    const app = await buildApp();
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });
});

describe("lead capture", () => {
  it("stores a new lead (normalized email)", async () => {
    const app = await buildApp();
    storageMock.captureLead.mockResolvedValueOnce({ isNew: true, lead: { id: 1, email: "x@y.com" } });
    const res = await request(app).post("/api/leads/capture").send({ email: "  X@Y.com  " });
    expect(res.status).toBe(200);
    expect(res.body.isNew).toBe(true);
    expect(storageMock.captureLead).toHaveBeenCalledWith("x@y.com", "lead_magnet");
  });

  it("rejects invalid email", async () => {
    const app = await buildApp();
    const res = await request(app).post("/api/leads/capture").send({ email: "not-an-email" });
    expect(res.status).toBe(400);
    expect(storageMock.captureLead).not.toHaveBeenCalled();
  });

  it("duplicate email → isNew false, no junk", async () => {
    const app = await buildApp();
    storageMock.captureLead.mockResolvedValueOnce({ isNew: false, lead: { id: 1, email: "x@y.com" } });
    const res = await request(app).post("/api/leads/capture").send({ email: "x@y.com" });
    expect(res.status).toBe(200);
    expect(res.body.isNew).toBe(false);
  });
});

describe("stripe webhook", () => {
  const purchaseEvent = {
    id: "evt_1",
    type: "checkout.session.completed",
    data: {
      object: {
        id: "cs_1",
        metadata: { userId: "u1", productType: "gmp_audit_kit" },
        amount_total: 5900,
        customer_email: "a@b.com",
      },
    },
  };

  it("fulfills once and is idempotent on retry", async () => {
    const app = await buildApp();
    constructEvent.mockReturnValue(purchaseEvent);
    storageMock.getUser.mockResolvedValue({ id: "u1", firstName: "A" });
    storageMock.createPurchase.mockResolvedValue(undefined);
    storageMock.markStripeEventProcessed.mockResolvedValue(undefined);

    // 1st delivery: not processed yet
    storageMock.isStripeEventProcessed.mockResolvedValueOnce(false);
    const first = await request(app)
      .post("/api/stripe/webhook")
      .set("stripe-signature", "sig")
      .send(purchaseEvent);
    expect(first.status).toBe(200);

    // 2nd delivery (retry): already processed
    storageMock.isStripeEventProcessed.mockResolvedValueOnce(true);
    const second = await request(app)
      .post("/api/stripe/webhook")
      .set("stripe-signature", "sig")
      .send(purchaseEvent);
    expect(second.status).toBe(200);
    expect(second.body.duplicate).toBe(true);

    // Fulfillment happened exactly once
    expect(storageMock.createPurchase).toHaveBeenCalledTimes(1);
    expect(storageMock.markStripeEventProcessed).toHaveBeenCalledTimes(1);
  });

  it("rejects missing signature", async () => {
    const app = await buildApp();
    const res = await request(app).post("/api/stripe/webhook").send(purchaseEvent);
    expect(res.status).toBe(400);
  });
});

describe("create-checkout-session", () => {
  const PRICE_ENVS = [
    "STRIPE_PRO_PRICE_ID",
    "STRIPE_GMP_AUDIT_KIT_PRICE_ID",
  ] as const;
  const saved: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const k of PRICE_ENVS) saved[k] = process.env[k];
    process.env.STRIPE_PRO_PRICE_ID = "price_pro";
    process.env.STRIPE_GMP_AUDIT_KIT_PRICE_ID = "price_gmp";
  });
  afterAll(() => {
    for (const k of PRICE_ENVS) {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k]!;
    }
  });

  /** Register (which sets the session) and return an authed supertest agent. */
  async function authedAgent(app: express.Express, user: any) {
    const agent = request.agent(app);
    storageMock.getUserByEmail.mockResolvedValueOnce(undefined);
    storageMock.createUser.mockResolvedValueOnce(user);
    const reg = await agent.post("/api/auth/register").send({ email: user.email, password: "pw123456" });
    expect(reg.status).toBe(201);
    return agent;
  }

  it("401 without a session", async () => {
    const app = await buildApp();
    const res = await request(app).post("/api/stripe/create-checkout-session").send({ productType: "pro_subscription" });
    expect(res.status).toBe(401);
    expect(checkoutCreate).not.toHaveBeenCalled();
  });

  it("400 for a product with no configured price", async () => {
    const app = await buildApp();
    const user = { id: "u1", email: "a@b.com", isPro: false };
    const agent = await authedAgent(app, user);
    storageMock.getUser.mockResolvedValueOnce(user);

    const res = await agent.post("/api/stripe/create-checkout-session").send({ productType: "starter_kit" });
    expect(res.status).toBe(400);
    expect(checkoutCreate).not.toHaveBeenCalled();
  });

  it("creates a subscription session WITH a trial for a new Pro subscriber", async () => {
    const app = await buildApp();
    const user = { id: "u1", email: "a@b.com", isPro: false };
    const agent = await authedAgent(app, user);
    storageMock.getUser.mockResolvedValueOnce(user);
    checkoutCreate.mockResolvedValueOnce({ url: "https://checkout.stripe.test/pro" });

    const res = await agent.post("/api/stripe/create-checkout-session").send({ productType: "pro_subscription" });
    expect(res.status).toBe(200);
    expect(res.body.url).toBe("https://checkout.stripe.test/pro");

    const arg = checkoutCreate.mock.calls[0][0];
    expect(arg.mode).toBe("subscription");
    expect(arg.line_items[0].price).toBe("price_pro");
    expect(arg.customer_email).toBe("a@b.com");
    expect(arg.metadata).toMatchObject({ userId: "u1", productType: "pro_subscription" });
    expect(arg.subscription_data.trial_period_days).toBe(7);
  });

  it("creates a one-time payment session (no trial) for a kit", async () => {
    const app = await buildApp();
    const user = { id: "u1", email: "a@b.com", isPro: false };
    const agent = await authedAgent(app, user);
    storageMock.getUser.mockResolvedValueOnce(user);
    checkoutCreate.mockResolvedValueOnce({ url: "https://checkout.stripe.test/gmp" });

    const res = await agent.post("/api/stripe/create-checkout-session").send({ productType: "gmp_audit_kit" });
    expect(res.status).toBe(200);

    const arg = checkoutCreate.mock.calls[0][0];
    expect(arg.mode).toBe("payment");
    expect(arg.line_items[0].price).toBe("price_gmp");
    expect(arg.subscription_data).toBeUndefined();
  });

  it("does NOT grant a trial to a user who already has a subscription", async () => {
    const app = await buildApp();
    const user = { id: "u1", email: "a@b.com", isPro: false, stripeSubscriptionId: "sub_old" };
    const agent = await authedAgent(app, user);
    storageMock.getUser.mockResolvedValueOnce(user);
    checkoutCreate.mockResolvedValueOnce({ url: "https://checkout.stripe.test/pro" });

    const res = await agent.post("/api/stripe/create-checkout-session").send({ productType: "pro_subscription" });
    expect(res.status).toBe(200);

    const arg = checkoutCreate.mock.calls[0][0];
    expect(arg.mode).toBe("subscription");
    expect(arg.subscription_data.trial_period_days).toBeUndefined();
  });
});

describe("password reset", () => {
  it("forgot-password is enumeration-safe (200, no token for unknown email)", async () => {
    const app = await buildApp();
    storageMock.getUserByEmail.mockResolvedValueOnce(undefined);
    const res = await request(app).post("/api/auth/forgot-password").send({ email: "ghost@x.com" });
    expect(res.status).toBe(200);
    expect(storageMock.setResetToken).not.toHaveBeenCalled();
  });

  it("forgot-password sets a 1-hour token for a known email", async () => {
    const app = await buildApp();
    storageMock.getUserByEmail.mockResolvedValueOnce({ id: "u1", email: "a@b.com", firstName: "A" });
    storageMock.setResetToken.mockResolvedValueOnce(undefined);
    const res = await request(app).post("/api/auth/forgot-password").send({ email: "a@b.com" });
    expect(res.status).toBe(200);
    expect(storageMock.setResetToken).toHaveBeenCalledTimes(1);
    const [userId, token, expiry] = storageMock.setResetToken.mock.calls[0];
    expect(userId).toBe("u1");
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThanOrEqual(32);
    expect(expiry instanceof Date).toBe(true);
  });

  it("forgot-password requires an email", async () => {
    const app = await buildApp();
    const res = await request(app).post("/api/auth/forgot-password").send({});
    expect(res.status).toBe(400);
  });

  it("reset-password rejects a short password", async () => {
    const app = await buildApp();
    const res = await request(app).post("/api/auth/reset-password").send({ token: "abc", password: "short" });
    expect(res.status).toBe(400);
    expect(storageMock.updatePassword).not.toHaveBeenCalled();
  });

  it("reset-password rejects an unknown token", async () => {
    const app = await buildApp();
    storageMock.getUserByResetToken.mockResolvedValueOnce(undefined);
    const res = await request(app).post("/api/auth/reset-password").send({ token: "bad", password: "longenough" });
    expect(res.status).toBe(400);
    expect(storageMock.updatePassword).not.toHaveBeenCalled();
  });

  it("reset-password rejects an expired token", async () => {
    const app = await buildApp();
    storageMock.getUserByResetToken.mockResolvedValueOnce({ id: "u1", resetTokenExpiry: new Date(Date.now() - 1000) });
    const res = await request(app).post("/api/auth/reset-password").send({ token: "t", password: "longenough" });
    expect(res.status).toBe(400);
    expect(storageMock.updatePassword).not.toHaveBeenCalled();
  });

  it("reset-password succeeds with a valid token and logs the user in", async () => {
    const app = await buildApp();
    storageMock.getUserByResetToken.mockResolvedValueOnce({
      id: "u1", email: "a@b.com", isPro: false, subscriptionStatus: "free",
      resetTokenExpiry: new Date(Date.now() + 60_000),
    });
    storageMock.updatePassword.mockResolvedValueOnce(undefined);
    const res = await request(app).post("/api/auth/reset-password").send({ token: "good", password: "longenough" });
    expect(res.status).toBe(200);
    expect(res.body.id).toBe("u1");
    expect(storageMock.updatePassword).toHaveBeenCalledTimes(1);
    expect(storageMock.updatePassword.mock.calls[0][0]).toBe("u1");
  });
});

describe("reading progress", () => {
  async function authedAgent(app: express.Express) {
    const agent = request.agent(app);
    storageMock.getUserByEmail.mockResolvedValueOnce(undefined);
    storageMock.createUser.mockResolvedValueOnce({ id: "u1", email: "a@b.com", isPro: false });
    await agent.post("/api/auth/register").send({ email: "a@b.com", password: "pw123456" });
    return agent;
  }

  it("GET /api/progress/reads is 401 without a session", async () => {
    const app = await buildApp();
    const res = await request(app).get("/api/progress/reads");
    expect(res.status).toBe(401);
  });

  it("returns the user's read slugs when authed", async () => {
    const app = await buildApp();
    const agent = await authedAgent(app);
    storageMock.getReadLessons.mockResolvedValueOnce(["sterility-testing-basics", "bioburden-usp-61"]);
    const res = await agent.get("/api/progress/reads");
    expect(res.status).toBe(200);
    expect(res.body.reads).toEqual(["sterility-testing-basics", "bioburden-usp-61"]);
    expect(storageMock.getReadLessons).toHaveBeenCalledWith("u1");
  });

  it("marks a lesson read for the authed user", async () => {
    const app = await buildApp();
    const agent = await authedAgent(app);
    storageMock.markLessonRead.mockResolvedValueOnce(undefined);
    const res = await agent.post("/api/progress/reads").send({ slug: "aseptic-technique" });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(storageMock.markLessonRead).toHaveBeenCalledWith("u1", "aseptic-technique");
  });

  it("rejects an empty slug", async () => {
    const app = await buildApp();
    const agent = await authedAgent(app);
    const res = await agent.post("/api/progress/reads").send({});
    expect(res.status).toBe(400);
    expect(storageMock.markLessonRead).not.toHaveBeenCalled();
  });

  it("fails soft (200) if the store throws — client falls back to localStorage", async () => {
    const app = await buildApp();
    const agent = await authedAgent(app);
    storageMock.getReadLessons.mockRejectedValueOnce(new Error("relation lesson_reads does not exist"));
    const res = await agent.get("/api/progress/reads");
    expect(res.status).toBe(200);
    expect(res.body.reads).toEqual([]);
  });
});

describe("google sign-in", () => {
  const OLD = process.env.GOOGLE_CLIENT_ID;
  beforeEach(() => {
    process.env.GOOGLE_CLIENT_ID = "test-client-id";
  });
  afterAll(() => {
    if (OLD === undefined) delete process.env.GOOGLE_CLIENT_ID;
    else process.env.GOOGLE_CLIENT_ID = OLD;
  });

  function payload(over: Record<string, unknown> = {}) {
    return { getPayload: () => ({ email: "g@b.com", email_verified: true, given_name: "G", family_name: "B", picture: "p", ...over }) };
  }

  it("503 when not configured", async () => {
    delete process.env.GOOGLE_CLIENT_ID;
    const app = await buildApp();
    const res = await request(app).post("/api/auth/google").send({ credential: "x" });
    expect(res.status).toBe(503);
  });

  it("400 when credential missing", async () => {
    const app = await buildApp();
    const res = await request(app).post("/api/auth/google").send({});
    expect(res.status).toBe(400);
  });

  it("401 when email not verified", async () => {
    const app = await buildApp();
    verifyIdToken.mockResolvedValueOnce(payload({ email_verified: false }));
    const res = await request(app).post("/api/auth/google").send({ credential: "tok" });
    expect(res.status).toBe(401);
  });

  it("401 when token verification throws", async () => {
    const app = await buildApp();
    verifyIdToken.mockRejectedValueOnce(new Error("bad token"));
    const res = await request(app).post("/api/auth/google").send({ credential: "tok" });
    expect(res.status).toBe(401);
  });

  it("creates a new user on first Google sign-in", async () => {
    const app = await buildApp();
    verifyIdToken.mockResolvedValueOnce(payload());
    storageMock.getUserByEmail.mockResolvedValueOnce(undefined);
    storageMock.createUser.mockResolvedValueOnce({ id: "u9", email: "g@b.com", isPro: false, verifiedEmail: true });
    const res = await request(app).post("/api/auth/google").send({ credential: "tok" });
    expect(res.status).toBe(200);
    expect(res.body.id).toBe("u9");
    expect(storageMock.createUser).toHaveBeenCalledTimes(1);
    expect(storageMock.createUser.mock.calls[0][0]).toMatchObject({ email: "g@b.com", verifiedEmail: true });
  });

  it("logs in an existing user without creating a duplicate", async () => {
    const app = await buildApp();
    verifyIdToken.mockResolvedValueOnce(payload());
    storageMock.getUserByEmail.mockResolvedValueOnce({ id: "u1", email: "g@b.com", isPro: false, subscriptionStatus: "free", verifiedEmail: true });
    const res = await request(app).post("/api/auth/google").send({ credential: "tok" });
    expect(res.status).toBe(200);
    expect(res.body.id).toBe("u1");
    expect(storageMock.createUser).not.toHaveBeenCalled();
  });
});

describe("email verification (soft)", () => {
  it("register issues a verification token without blocking signup", async () => {
    const app = await buildApp();
    storageMock.getUserByEmail.mockResolvedValueOnce(undefined);
    storageMock.createUser.mockResolvedValueOnce({ id: "u1", email: "a@b.com", isPro: false });
    const res = await request(app).post("/api/auth/register").send({ email: "a@b.com", password: "pw123456" });
    expect(res.status).toBe(201);
    expect(storageMock.setVerificationToken).toHaveBeenCalledTimes(1);
    expect(storageMock.setVerificationToken.mock.calls[0][0]).toBe("u1");
  });

  it("register still succeeds if issuing the token throws (pre-migration)", async () => {
    const app = await buildApp();
    storageMock.getUserByEmail.mockResolvedValueOnce(undefined);
    storageMock.createUser.mockResolvedValueOnce({ id: "u1", email: "a@b.com", isPro: false });
    storageMock.setVerificationToken.mockRejectedValueOnce(new Error("column does not exist"));
    const res = await request(app).post("/api/auth/register").send({ email: "a@b.com", password: "pw123456" });
    expect(res.status).toBe(201);
  });

  it("verify-email confirms a valid token", async () => {
    const app = await buildApp();
    storageMock.getUserByVerificationToken.mockResolvedValueOnce({ id: "u1", verificationTokenExpiry: new Date(Date.now() + 60_000) });
    const res = await request(app).post("/api/auth/verify-email").send({ token: "good" });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(storageMock.markEmailVerified).toHaveBeenCalledWith("u1");
  });

  it("verify-email rejects an invalid/expired token", async () => {
    const app = await buildApp();
    storageMock.getUserByVerificationToken.mockResolvedValueOnce(undefined);
    const res = await request(app).post("/api/auth/verify-email").send({ token: "bad" });
    expect(res.status).toBe(400);
    expect(storageMock.markEmailVerified).not.toHaveBeenCalled();
  });

  it("verify-email requires a token", async () => {
    const app = await buildApp();
    const res = await request(app).post("/api/auth/verify-email").send({});
    expect(res.status).toBe(400);
  });

  async function authedAgent(app: express.Express) {
    const agent = request.agent(app);
    storageMock.getUserByEmail.mockResolvedValueOnce(undefined);
    storageMock.createUser.mockResolvedValueOnce({ id: "u1", email: "a@b.com", isPro: false });
    await agent.post("/api/auth/register").send({ email: "a@b.com", password: "pw123456" });
    return agent;
  }

  it("resend-verification requires auth", async () => {
    const app = await buildApp();
    const res = await request(app).post("/api/auth/resend-verification").send({});
    expect(res.status).toBe(401);
  });

  it("resend sends a new token for an unverified user", async () => {
    const app = await buildApp();
    const agent = await authedAgent(app);
    storageMock.setVerificationToken.mockClear();
    storageMock.getUser.mockResolvedValueOnce({ id: "u1", email: "a@b.com", verifiedEmail: false });
    const res = await agent.post("/api/auth/resend-verification").send({});
    expect(res.status).toBe(200);
    expect(storageMock.setVerificationToken).toHaveBeenCalledTimes(1);
  });

  it("resend is a no-op for an already-verified user", async () => {
    const app = await buildApp();
    const agent = await authedAgent(app);
    storageMock.setVerificationToken.mockClear();
    storageMock.getUser.mockResolvedValueOnce({ id: "u1", email: "a@b.com", verifiedEmail: true });
    const res = await agent.post("/api/auth/resend-verification").send({});
    expect(res.status).toBe(200);
    expect(storageMock.setVerificationToken).not.toHaveBeenCalled();
  });
});

describe("lifecycle cron (/api/cron/nurture)", () => {
  const OLD = process.env.CRON_SECRET;
  beforeEach(() => { process.env.CRON_SECRET = "s3cret"; });
  afterAll(() => {
    if (OLD === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = OLD;
  });
  const auth = (a: request.Test) => a.set("Authorization", "Bearer s3cret");

  it("401 with a wrong secret", async () => {
    const app = await buildApp();
    const res = await request(app).get("/api/cron/nurture").set("Authorization", "Bearer nope");
    expect(res.status).toBe(401);
  });

  it("sends a 1-day trial-ending reminder and records the guard", async () => {
    const app = await buildApp();
    storageMock.getTrialEndingCandidates.mockResolvedValueOnce([
      { id: "u1", email: "a@b.com", firstName: "A", proExpiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000) },
    ]);
    const res = await auth(request(app).get("/api/cron/nurture"));
    expect(res.status).toBe(200);
    expect(email.sendTrialEndingEmail).toHaveBeenCalledTimes(1);
    expect(storageMock.recordLifecycleSend).toHaveBeenCalledWith("u1", "trial_end_1d");
  });

  it("skips a trial reminder already sent", async () => {
    const app = await buildApp();
    storageMock.getTrialEndingCandidates.mockResolvedValueOnce([
      { id: "u1", email: "a@b.com", firstName: "A", proExpiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
    ]);
    storageMock.wasLifecycleSent.mockResolvedValueOnce(true); // trial_end_3d already sent
    const res = await auth(request(app).get("/api/cron/nurture"));
    expect(res.status).toBe(200);
    expect(email.sendTrialEndingEmail).not.toHaveBeenCalled();
  });

  it("emails an abandoned checkout for a non-converted user", async () => {
    const app = await buildApp();
    storageMock.getRecentCheckoutAttempts.mockResolvedValueOnce([{ userId: "u1", productType: "gmp_audit_kit" }]);
    storageMock.wasLifecycleSent.mockResolvedValue(false);
    storageMock.getUser.mockResolvedValueOnce({ id: "u1", email: "a@b.com", firstName: "A", isPro: false });
    storageMock.hasCompletedPurchase.mockResolvedValueOnce(false);
    const res = await auth(request(app).get("/api/cron/nurture"));
    expect(res.status).toBe(200);
    expect(email.sendAbandonedCheckoutEmail).toHaveBeenCalledTimes(1);
    expect(storageMock.recordLifecycleSend).toHaveBeenCalledWith("u1", "abandoned_checkout");
  });

  it("does NOT email an abandoned checkout once the user converted to Pro", async () => {
    const app = await buildApp();
    storageMock.getRecentCheckoutAttempts.mockResolvedValueOnce([{ userId: "u1", productType: "pro_subscription" }]);
    storageMock.wasLifecycleSent.mockResolvedValue(false);
    storageMock.getUser.mockResolvedValueOnce({ id: "u1", email: "a@b.com", isPro: true });
    const res = await auth(request(app).get("/api/cron/nurture"));
    expect(res.status).toBe(200);
    expect(email.sendAbandonedCheckoutEmail).not.toHaveBeenCalled();
  });

  // Pro subscription is the primary funnel post-pivot (the GMP kit no longer
  // has a standalone checkout). An abandoned Pro attempt by a still-free user
  // must be re-engaged via the subscription "converted = isProActive" branch.
  it("emails an abandoned Pro-subscription checkout for a still-free user", async () => {
    const app = await buildApp();
    storageMock.getRecentCheckoutAttempts.mockResolvedValueOnce([{ userId: "u1", productType: "pro_subscription" }]);
    storageMock.wasLifecycleSent.mockResolvedValue(false);
    storageMock.getUser.mockResolvedValueOnce({ id: "u1", email: "a@b.com", firstName: "A", isPro: false });
    const res = await auth(request(app).get("/api/cron/nurture"));
    expect(res.status).toBe(200);
    expect(email.sendAbandonedCheckoutEmail).toHaveBeenCalledTimes(1);
    expect(email.sendAbandonedCheckoutEmail).toHaveBeenCalledWith("a@b.com", "pro_subscription", "A");
    expect(storageMock.recordLifecycleSend).toHaveBeenCalledWith("u1", "abandoned_checkout");
    // hasCompletedPurchase must NOT be consulted for a subscription attempt.
    expect(storageMock.hasCompletedPurchase).not.toHaveBeenCalled();
  });

  it("re-engages a lapsed, non-Pro learner once", async () => {
    const app = await buildApp();
    storageMock.getReEngagementCandidates.mockResolvedValueOnce(["u1"]);
    storageMock.wasLifecycleSent.mockResolvedValue(false);
    storageMock.getUser.mockResolvedValueOnce({ id: "u1", email: "a@b.com", firstName: "A", isPro: false });
    const res = await auth(request(app).get("/api/cron/nurture"));
    expect(res.status).toBe(200);
    expect(email.sendReEngagementEmail).toHaveBeenCalledTimes(1);
    expect(storageMock.recordLifecycleSend).toHaveBeenCalledWith("u1", "re_engagement");
  });
});

describe("sitemap", () => {
  it("emits well-formed XML with core, workflow, content, and every tool URL", async () => {
    const app = await buildApp();
    const res = await request(app).get("/sitemap.xml");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/xml/);
    expect(res.text).toMatch(/^<\?xml/);
    expect(res.text).toContain("<urlset");
    // The standalone calculator pages are the high-intent SEO/acquisition surface.
    for (const slug of [
      "endotoxin-limit-calculator",
      "cleaning-validation-maco-calculator",
      "process-capability-calculator",
      "sterilization-f0-calculator",
      "microbial-count-calculator",
    ]) {
      expect(res.text).toContain(`/tools/${slug}</loc>`);
    }
    // Core, workflow, and dynamic content slugs are listed too (host-agnostic).
    expect(res.text).toContain("/pricing</loc>");
    expect(res.text).toContain("/workflows/oos-investigation</loc>");
    expect(res.text).toMatch(/\/library\/[a-z0-9-]+<\/loc>/);
    expect(res.text).toMatch(/\/blog\/[a-z0-9-]+<\/loc>/);
  });
});
