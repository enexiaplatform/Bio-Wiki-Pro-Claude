import { describe, it, expect, beforeEach, afterAll, vi } from "vitest";
import express from "express";
import request from "supertest";

// ── Mocks (vi.hoisted so the vi.mock factories can reference them) ────────────
const { storageMock, constructEvent, verifyIdToken } = vi.hoisted(() => ({
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
  },
  constructEvent: vi.fn(),
  verifyIdToken: vi.fn(),
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
      checkout: { sessions: { create: vi.fn() } },
      billingPortal: { sessions: { create: vi.fn() } },
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
}));

import { registerRoutes } from "../routes.js";

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
});
