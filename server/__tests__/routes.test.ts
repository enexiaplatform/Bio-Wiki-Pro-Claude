import { describe, it, expect, beforeEach, vi } from "vitest";
import express from "express";
import request from "supertest";

// ── Mocks (vi.hoisted so the vi.mock factories can reference them) ────────────
const { storageMock, constructEvent } = vi.hoisted(() => ({
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
  },
  constructEvent: vi.fn(),
}));
vi.mock("../storage.js", () => ({ storage: storageMock }));

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
