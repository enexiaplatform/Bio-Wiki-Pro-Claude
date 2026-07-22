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
    getQualityLabReminderPreference: vi.fn(() => Promise.resolve(undefined)),
    upsertQualityLabReminderPreference: vi.fn(),
    getQualityLabReminderCandidates: vi.fn(() => Promise.resolve([])),
    getQualityLabReviewedProject: vi.fn(),
    listQualityLabReviewedProjects: vi.fn(() => Promise.resolve([])),
    listQualityLabReviewedProjectRevisions: vi.fn(() => Promise.resolve([])),
    deleteQualityLabReviewedProject: vi.fn(() => Promise.resolve(false)),
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
  sendQualityLabWorkQueueEmail: vi.fn(() => Promise.resolve(true)),
  sendQualityLabWeeklyReviewEmail: vi.fn(() => Promise.resolve(true)),
  sendCommercialRequestEmails: vi.fn(() => Promise.resolve()),
}));

import { registerRoutes } from "../routes.js";
import { DELIVERABLES } from "../deliverables.js";
import * as email from "../email.js";
import { createQualityLabProject, defaultQualityLabInput } from "../../shared/quality-lab.js";
import { defaultCareerProfile } from "../../shared/career-blueprint.js";

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

describe("Quality Lab expert review", () => {
  it("stores a structured review brief in the existing commercial intake", async () => {
    const app = await buildApp();
    storageMock.createQuoteRequest.mockImplementationOnce(async (value: any) => ({ id: 12, ...value }));
    const res = await request(app).post("/api/quality-lab/reviews").send({
      briefVersion: "quality-lab-review-brief/v3",
      contact: { name: "Quality Lead", email: "QUALITY@EXAMPLE.COM", company: "Example Pharma", role: "QC Manager" },
      qualification: { engagementIntent: "blueprint-pilot", projectStage: "budget-planning", decisionWindow: "1-3-months", budgetStatus: "range-defined", decisionRole: "technical-lead", dataReadiness: "substantial", portfolioScale: "4-10-products" },
      projectContext: "We need a scoped review before the capital planning workshop.",
      project: null,
      confidentialityConfirmed: true,
    });
    expect(res.status).toBe(201);
    expect(storageMock.createQuoteRequest).toHaveBeenCalledWith(expect.objectContaining({
      email: "quality@example.com",
      productOfInterest: "Expert-reviewed Blueprint Pilot (from $990)",
      need: expect.stringContaining("[quality-lab-review-brief/v3]"),
    }));
    expect(email.sendCommercialRequestEmails).toHaveBeenCalledWith(expect.objectContaining({
      requestId: "12",
      email: "quality@example.com",
      offer: "Expert-reviewed Blueprint Pilot (from $990)",
      summary: expect.stringContaining("[quality-lab-review-brief/v3]"),
    }));
  });

  it("serves the clearly labelled illustrative Blueprint PDF without authentication", async () => {
    const app = await buildApp();
    const res = await request(app).get("/api/quality-lab/sample-blueprint.pdf");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("application/pdf");
    expect(res.headers["content-disposition"]).toContain("illustrative-sample.pdf");
    expect(Buffer.from(res.body).subarray(0, 4).toString()).toBe("%PDF");
  });

  it("rejects review context that is not confirmed non-confidential", async () => {
    const app = await buildApp();
    const res = await request(app).post("/api/quality-lab/reviews").send({
      briefVersion: "quality-lab-review-brief/v2",
      contact: { name: "Quality Lead", email: "quality@example.com", company: null, role: null },
      qualification: { engagementIntent: "scope-diagnostic", projectStage: "concept", decisionWindow: "not-set", budgetStatus: "exploring", decisionRole: "influencer", dataReadiness: "initial", portfolioScale: "not-set" },
      projectContext: "We need a scoped review before the capital planning workshop.",
      project: null,
      confidentialityConfirmed: false,
    });
    expect(res.status).toBe(400);
    expect(storageMock.createQuoteRequest).not.toHaveBeenCalled();
  });

  it("protects controlled Blueprint delivery files behind authentication", async () => {
    const app = await buildApp();
    const workbook = await request(app).get("/api/quality-lab/reviewed-projects/qlp_private/delivery-workbook");
    const brief = await request(app).get("/api/quality-lab/reviewed-projects/qlp_private/delivery-brief.pdf");
    expect(workbook.status).toBe(401);
    expect(brief.status).toBe(401);
    expect(storageMock.getQualityLabReviewedProject).not.toHaveBeenCalled();
  });

  it("protects the reviewed-project portfolio behind authentication", async () => {
    const app = await buildApp();
    await request(app).get("/api/quality-lab/reviewed-projects").expect(401);
    await request(app).delete("/api/quality-lab/reviewed-projects/qlp_private").expect(401);
    expect(storageMock.listQualityLabReviewedProjects).not.toHaveBeenCalled();
    expect(storageMock.deleteQualityLabReviewedProject).not.toHaveBeenCalled();
  });
});

describe("admin access", () => {
  it("rejects admin APIs without an authenticated session", async () => {
    const app = await buildApp();
    await request(app).get("/api/admin/documents").expect(401);
  });

  it("rejects signed-in users outside the admin email allowlist", async () => {
    const app = await buildApp();
    const agent = request.agent(app);
    storageMock.getUserByEmail.mockResolvedValueOnce(undefined);
    storageMock.createUser.mockResolvedValueOnce({ id: "u-member", email: "member@example.com", isPro: false });
    await agent.post("/api/auth/register").send({ email: "member@example.com", password: "pw123456" }).expect(201);
    storageMock.getUser.mockResolvedValueOnce({ id: "u-member", email: "member@example.com", isPro: false });
    await agent.get("/api/admin/documents").expect(403);
  });

  it("lets an allowlisted admin inspect the paid document vault", async () => {
    const previous = process.env.ADMIN_EMAILS;
    process.env.ADMIN_EMAILS = "admin@example.com";
    try {
      const app = await buildApp();
      const agent = request.agent(app);
      storageMock.getUserByEmail.mockResolvedValueOnce(undefined);
      storageMock.createUser.mockResolvedValueOnce({ id: "u-admin", email: "admin@example.com", isPro: false });
      await agent.post("/api/auth/register").send({ email: "admin@example.com", password: "pw123456" }).expect(201);
      storageMock.getUser.mockResolvedValueOnce({ id: "u-admin", email: "admin@example.com", isPro: false });
      const response = await agent.get("/api/admin/documents").expect(200);
      expect(response.body.products.length).toBe(Object.keys(DELIVERABLES).length);
      expect(response.body.products[0]).toHaveProperty("files");
    } finally {
      if (previous === undefined) delete process.env.ADMIN_EMAILS;
      else process.env.ADMIN_EMAILS = previous;
    }
  });
});

describe("content API", () => {
  it("rejects legacy non-English content language requests", async () => {
    const app = await buildApp();
    const res = await request(app).get("/api/content/academy/sterility-testing-basics?lang=vi");

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid content reference");
    expect(storageMock.getContentEntry).not.toHaveBeenCalled();
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
    "STRIPE_SCOPE_DIAGNOSTIC_PRICE_ID",
    "STRIPE_CAREER_BLUEPRINT_PRICE_ID",
  ] as const;
  const saved: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const k of PRICE_ENVS) saved[k] = process.env[k];
    process.env.STRIPE_PRO_PRICE_ID = "price_pro";
    process.env.STRIPE_GMP_AUDIT_KIT_PRICE_ID = "price_gmp";
    process.env.STRIPE_SCOPE_DIAGNOSTIC_PRICE_ID = "price_diagnostic";
    process.env.STRIPE_CAREER_BLUEPRINT_PRICE_ID = "price_career";
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

  it("creates a one-time Diagnostic session with the intake cancel route", async () => {
    const app = await buildApp();
    const user = { id: "u1", email: "a@b.com", isPro: false };
    const agent = await authedAgent(app, user);
    storageMock.getUser.mockResolvedValueOnce(user);
    checkoutCreate.mockResolvedValueOnce({ url: "https://checkout.stripe.test/diagnostic" });

    const res = await agent.post("/api/stripe/create-checkout-session").send({ productType: "scope_diagnostic" });
    expect(res.status).toBe(200);
    const arg = checkoutCreate.mock.calls[0][0];
    expect(arg.mode).toBe("payment");
    expect(arg.line_items[0].price).toBe("price_diagnostic");
    expect(arg.cancel_url).toContain("/quality-lab/review?offer=diagnostic");
    expect(arg.metadata).toMatchObject({ userId: "u1", productType: "scope_diagnostic" });
  });

  it("creates the $20 Career Blueprint checkout with a Career cancel route", async () => {
    const app = await buildApp();
    const user = { id: "u1", email: "a@b.com", isPro: false };
    const agent = await authedAgent(app, user);
    storageMock.getUser.mockResolvedValueOnce(user);
    checkoutCreate.mockResolvedValueOnce({ url: "https://checkout.stripe.test/career" });

    const res = await agent.post("/api/stripe/create-checkout-session").send({ productType: "career_blueprint" });
    expect(res.status).toBe(200);
    const arg = checkoutCreate.mock.calls[0][0];
    expect(arg.mode).toBe("payment");
    expect(arg.line_items[0].price).toBe("price_career");
    expect(arg.cancel_url).toContain("/career");
    expect(arg.metadata).toMatchObject({ userId: "u1", productType: "career_blueprint" });
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

describe("downloads", () => {
  async function authedAgent(app: express.Express, user: any) {
    const agent = request.agent(app);
    storageMock.getUserByEmail.mockResolvedValueOnce(undefined);
    storageMock.createUser.mockResolvedValueOnce(user);
    const reg = await agent.post("/api/auth/register").send({ email: user.email, password: "pw123456" });
    expect(reg.status).toBe(201);
    return agent;
  }

  it("GET /api/downloads is 401 without a session", async () => {
    const app = await buildApp();
    const res = await request(app).get("/api/downloads");
    expect(res.status).toBe(401);
  });

  it("lists every deliverable product for an active Pro user", async () => {
    const app = await buildApp();
    const user = { id: "u1", email: "pro@example.com", isPro: true, subscriptionStatus: "active" };
    const agent = await authedAgent(app, user);
    storageMock.getUser.mockResolvedValueOnce(user);

    const res = await agent.get("/api/downloads");

    expect(res.status).toBe(200);
    expect(res.body.products.map((p: any) => p.id).sort()).toEqual(Object.keys(DELIVERABLES).sort());
    expect(res.body.products.find((p: any) => p.id === "gmp_audit_kit").files[0]).toMatchObject({
      filename: "README.md",
      url: "/api/downloads/gmp_audit_kit/README.md",
    });
    expect(storageMock.hasCompletedPurchase).not.toHaveBeenCalled();
  });

  it("lists only purchased one-time deliverables for a non-Pro user", async () => {
    const app = await buildApp();
    const user = { id: "u1", email: "kit@example.com", isPro: false, subscriptionStatus: "free" };
    const agent = await authedAgent(app, user);
    storageMock.getUser.mockResolvedValueOnce(user);
    storageMock.hasCompletedPurchase.mockImplementation(async (_userId: string, productType: string) =>
      productType === "gmp_audit_kit",
    );

    const res = await agent.get("/api/downloads");

    expect(res.status).toBe(200);
    expect(res.body.products.map((p: any) => p.id)).toEqual(["gmp_audit_kit"]);
    expect(res.body.products[0].files.map((f: any) => f.filename)).toContain("gmp-audit-survival-guide.pdf");
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

  it("sends one opt-in Blueprint work-queue digest for a priority account snapshot", async () => {
    const app = await buildApp();
    const project = createQualityLabProject(defaultQualityLabInput, "qlp_digest");
    project.actionPlan.actions[0].dueDate = "2000-01-01";
    storageMock.getQualityLabReminderCandidates.mockResolvedValueOnce([
      { id: "u1", email: "owner@example.com", firstName: "Owner", cadence: "daily" },
    ]);
    storageMock.listQualityLabReviewedProjects.mockResolvedValueOnce([{
      snapshot: {
        localProjectId: project.id,
        projectName: project.name,
        input: project.input,
        blueprint: project.blueprint,
        actionPlan: project.actionPlan,
        engagement: null,
        reviewRequestedAt: new Date().toISOString(),
      },
    }]);
    storageMock.wasLifecycleSent.mockResolvedValueOnce(false);
    const res = await auth(request(app).get("/api/cron/nurture"));
    expect(res.status).toBe(200);
    expect(email.sendQualityLabWorkQueueEmail).toHaveBeenCalledTimes(1);
    expect(storageMock.recordLifecycleSend).toHaveBeenCalledWith("u1", `quality_lab_work_queue_${new Date().toISOString().slice(0, 10)}`);
    expect(res.body.qualityLabWorkQueue.sent).toBe(1);
  });

  it("sends an opted-in weekly Blueprint review on Monday", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-20T09:00:00.000Z"));
    try {
      const app = await buildApp();
      const project = createQualityLabProject(defaultQualityLabInput, "qlp_weekly_digest");
      storageMock.getQualityLabReminderCandidates.mockResolvedValueOnce([
        { id: "u1", email: "owner@example.com", firstName: "Owner", cadence: "weekly" },
      ]);
      storageMock.listQualityLabReviewedProjects.mockResolvedValueOnce([{
        snapshot: {
          localProjectId: project.id,
          projectName: project.name,
          input: project.input,
          blueprint: project.blueprint,
          actionPlan: project.actionPlan,
          engagement: null,
          reviewRequestedAt: new Date().toISOString(),
        },
      }]);
      storageMock.wasLifecycleSent.mockResolvedValueOnce(false);
      const res = await auth(request(app).get("/api/cron/nurture"));
      expect(res.status).toBe(200);
      expect(email.sendQualityLabWeeklyReviewEmail).toHaveBeenCalledTimes(1);
      expect(storageMock.recordLifecycleSend).toHaveBeenCalledWith("u1", "quality_lab_weekly_review_2026-07-20");
      expect(res.body.qualityLabWeeklyReview.sent).toBe(1);
      expect(email.sendQualityLabWorkQueueEmail).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("Blueprint reminder preference", () => {
  async function authedAgent(app: express.Express) {
    const agent = request.agent(app);
    storageMock.getUserByEmail.mockResolvedValueOnce(undefined);
    storageMock.createUser.mockResolvedValueOnce({ id: "u1", email: "a@b.com", isPro: false });
    await agent.post("/api/auth/register").send({ email: "a@b.com", password: "pw123456" });
    return agent;
  }

  it("requires authentication", async () => {
    const app = await buildApp();
    await request(app).get("/api/quality-lab/reminder-preference").expect(401);
    await request(app).put("/api/quality-lab/reminder-preference").send({ cadence: "daily" }).expect(401);
  });

  it("defaults to off and saves an explicit cadence", async () => {
    const app = await buildApp();
    const agent = await authedAgent(app);
    const current = await agent.get("/api/quality-lab/reminder-preference");
    expect(current.status).toBe(200);
    expect(current.body.cadence).toBe("off");

    storageMock.upsertQualityLabReminderPreference.mockResolvedValueOnce({ userId: "u1", cadence: "weekly", updatedAt: new Date() });
    const saved = await agent.put("/api/quality-lab/reminder-preference").send({ cadence: "weekly" });
    expect(saved.status).toBe(200);
    expect(saved.body.cadence).toBe("weekly");
    expect(storageMock.upsertQualityLabReminderPreference).toHaveBeenCalledWith("u1", "weekly");
  });

  it("rejects an unsupported cadence", async () => {
    const app = await buildApp();
    const agent = await authedAgent(app);
    const res = await agent.put("/api/quality-lab/reminder-preference").send({ cadence: "hourly" });
    expect(res.status).toBe(400);
  });
});

describe("career blueprint fulfillment", () => {
  async function authedAgent(app: express.Express) {
    const agent = request.agent(app);
    storageMock.getUserByEmail.mockResolvedValueOnce(undefined);
    storageMock.createUser.mockResolvedValueOnce({ id: "u1", email: "a@b.com", isPro: false });
    const response = await agent.post("/api/auth/register").send({ email: "a@b.com", password: "pw123456" });
    expect(response.status).toBe(201);
    return agent;
  }

  it("keeps access and generation behind authentication", async () => {
    const app = await buildApp();
    await request(app).get("/api/career-blueprint/access").expect(401);
    await request(app).post("/api/career-blueprint/download").send({ ...defaultCareerProfile, fullName: "Alex Morgan", location: "Toronto, Canada" }).expect(401);
  });

  it("reports purchase access and generates the named 38-page PDF", async () => {
    const app = await buildApp();
    const agent = await authedAgent(app);
    storageMock.getUser.mockResolvedValue({ id: "u1", email: "a@b.com", isPro: false });
    storageMock.hasCompletedPurchase.mockResolvedValue(true);

    const access = await agent.get("/api/career-blueprint/access");
    expect(access.status).toBe(200);
    expect(access.body.entitled).toBe(true);

    const download = await agent.post("/api/career-blueprint/download").send({ ...defaultCareerProfile, fullName: "Alex Morgan", location: "Toronto, Canada" });
    expect(download.status).toBe(200);
    expect(download.headers["content-type"]).toContain("application/pdf");
    expect(download.headers["content-disposition"]).toContain("alex-morgan-career-blueprint.pdf");
    expect(download.body.subarray(0, 4).toString()).toBe("%PDF");
  });

  it("rejects generation without a completed purchase", async () => {
    const app = await buildApp();
    const agent = await authedAgent(app);
    storageMock.getUser.mockResolvedValue({ id: "u1", email: "a@b.com", isPro: false });
    storageMock.hasCompletedPurchase.mockResolvedValue(false);
    await agent.post("/api/career-blueprint/download").send({ ...defaultCareerProfile, fullName: "Alex Morgan", location: "Toronto, Canada" }).expect(403);
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
