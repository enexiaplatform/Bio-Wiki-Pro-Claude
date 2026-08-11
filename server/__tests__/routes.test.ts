import { describe, it, expect, beforeEach, afterAll, vi } from "vitest";
import express from "express";
import request from "supertest";
import bcrypt from "bcryptjs";
import { ATLAS_PRO_MONTHLY_REVIEW_VERSION, exampleAtlasProMonthlyInput } from "../../shared/atlas-pro-monthly";

// ── Mocks (vi.hoisted so the vi.mock factories can reference them) ────────────
const { storageMock, constructEvent, verifyIdToken, checkoutCreate, portalCreate, fulfillStripeEventOnce, checkRuntimeSchema } = vi.hoisted(() => ({
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
    getLatestCompletedPurchaseAt: vi.fn(() => Promise.resolve(null)),
    getUserByResetToken: vi.fn(),
    setResetToken: vi.fn(),
    updatePassword: vi.fn(),
    getReadLessons: vi.fn(),
    markLessonRead: vi.fn(),
    listAtlasProMonthlyReviews: vi.fn(() => Promise.resolve([])),
    upsertAtlasProMonthlyReview: vi.fn(),
    getLatestCareerBlueprintExecution: vi.fn(() => Promise.resolve(undefined)),
    upsertCareerBlueprintExecution: vi.fn(),
    getCareerBlueprintProfile: vi.fn(() => Promise.resolve(undefined)),
    upsertCareerBlueprintProfile: vi.fn(),
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
    getRegulatoryAlertPreference: vi.fn(() => Promise.resolve(undefined)),
    upsertRegulatoryAlertPreference: vi.fn(),
    getRegulatoryDigestCandidates: vi.fn(() => Promise.resolve([])),
    recordQualityLabFunnelEvent: vi.fn(),
    getQualityLabReviewedProject: vi.fn(),
    upsertQualityLabReviewedProject: vi.fn(),
    syncQualityLabReviewedProject: vi.fn(),
    listQualityLabReviewedProjects: vi.fn(() => Promise.resolve([])),
    countQualityLabReviewedProjectRevisions: vi.fn(() => Promise.resolve(0)),
    listQualityLabReviewedProjectRevisions: vi.fn(() => Promise.resolve([])),
    getQualityLabReviewedProjectRevision: vi.fn(() => Promise.resolve(undefined)),
    deleteQualityLabReviewedProject: vi.fn(() => Promise.resolve(false)),
  },
  constructEvent: vi.fn(),
  verifyIdToken: vi.fn(),
  checkoutCreate: vi.fn(),
  portalCreate: vi.fn(),
  fulfillStripeEventOnce: vi.fn(() => Promise.resolve({ duplicate: false, userId: "u1" })),
  checkRuntimeSchema: vi.fn(() => Promise.resolve(true)),
}));
vi.mock("../storage.js", () => ({ storage: storageMock }));
vi.mock("../db.js", () => ({ connectionString: undefined, checkRuntimeSchema }));
vi.mock("../stripe-fulfillment.js", () => ({ fulfillStripeEventOnce }));
vi.mock("../regulatory-monitor.js", () => ({ fetchRegulatoryMonitor: vi.fn(() => Promise.resolve({ generatedAt: "2026-07-20T00:00:00.000Z", items: [], sources: [] })) }));

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
  sendRegulatoryDigestEmail: vi.fn(() => Promise.resolve(true)),
  sendCommercialRequestEmails: vi.fn(() => Promise.resolve()),
}));

import { createApiApp } from "../app.js";
import { DELIVERABLES } from "../deliverables.js";
import * as email from "../email.js";
import { createQualityLabProject, defaultQualityLabInput } from "../../shared/quality-lab.js";
import { createQualityLabAccountSnapshot } from "../../shared/quality-lab-persistence.js";
import { defaultCareerProfile } from "../../shared/career-blueprint.js";
import { createCareerExecutionRecord } from "../../shared/career-execution.js";

async function buildApp() {
  return createApiApp({ requestLogging: false });
}

beforeEach(() => {
  vi.clearAllMocks();
  fulfillStripeEventOnce.mockResolvedValue({ duplicate: false, userId: "u1" });
  checkRuntimeSchema.mockResolvedValue(true);
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

  it("regenerates the session on authentication and emits the seven-day cookie contract", async () => {
    const app = await buildApp();
    const agent = request.agent(app);
    const passwordHash = await bcrypt.hash("pw123456", 4);
    storageMock.getUserByEmail.mockResolvedValueOnce(undefined);
    storageMock.createUser.mockResolvedValueOnce({ id: "u1", email: "a@b.com", isPro: false });
    const registered = await agent.post("/api/auth/register").send({ email: "a@b.com", password: "pw123456" });
    const registerCookie = registered.headers["set-cookie"]?.[0];

    storageMock.getUserByEmail.mockResolvedValueOnce({ id: "u1", email: "a@b.com", passwordHash, isPro: false });
    const loggedIn = await agent.post("/api/auth/login").send({ email: "a@b.com", password: "pw123456" });
    const loginCookie = loggedIn.headers["set-cookie"]?.[0];

    expect(registerCookie).toContain("lsa.sid=");
    expect(registerCookie).toContain("Path=/");
    expect(registerCookie).toContain("HttpOnly");
    expect(registerCookie).toContain("SameSite=Lax");
    const expiry = /Expires=([^;]+)/.exec(registerCookie ?? "")?.[1];
    expect(expiry).toBeTruthy();
    expect(new Date(expiry!).getTime() - Date.now()).toBeGreaterThan(6.9 * 24 * 60 * 60 * 1000);
    expect(loginCookie).toContain("lsa.sid=");
    expect(loginCookie?.split(";")[0]).not.toBe(registerCookie?.split(";")[0]);

    const loggedOut = await agent.post("/api/auth/logout");
    expect(loggedOut.status).toBe(200);
    expect(loggedOut.headers["set-cookie"]?.[0]).toContain("lsa.sid=;");
  });

  it("blocks cross-origin cookie mutations while allowing the deployment origin", async () => {
    const app = await buildApp();
    const blocked = await request(app)
      .post("/api/auth/forgot-password")
      .set("origin", "https://evil.example")
      .send({ email: "a@b.com" });
    expect(blocked.status).toBe(403);

    storageMock.getUserByEmail.mockResolvedValueOnce(undefined);
    const allowed = await request(app)
      .post("/api/auth/forgot-password")
      .set("host", "feature-123.vercel.app")
      .set("x-forwarded-proto", "https")
      .set("origin", "https://feature-123.vercel.app")
      .send({ email: "a@b.com" });
    expect(allowed.status).toBe(200);
  });
});

describe("Quality Lab funnel receipts", () => {
  const event = {
    eventId: "5ce422d1-34f8-4a5d-a121-14d4339f323c",
    journeyId: "03bb1889-35b8-487a-a8ab-f447aaec3b31",
    stage: "model_compiled",
    occurredAt: "2026-07-28T00:00:00.000Z",
  };

  it("accepts a privacy-scoped anonymous event", async () => {
    const app = await buildApp();
    storageMock.recordQualityLabFunnelEvent.mockResolvedValueOnce({ id: 1, ...event });
    const res = await request(app).post("/api/quality-lab/funnel-events").send(event);
    expect(res.status).toBe(202);
    expect(res.body).toEqual({ accepted: true, recorded: true });
    expect(storageMock.recordQualityLabFunnelEvent).toHaveBeenCalledWith(null, expect.objectContaining({
      ...event,
      occurredAt: expect.any(String),
    }));
  });

  it("rejects fields that could smuggle project content", async () => {
    const app = await buildApp();
    const res = await request(app).post("/api/quality-lab/funnel-events").send({ ...event, projectName: "Secret project" });
    expect(res.status).toBe(400);
    expect(storageMock.recordQualityLabFunnelEvent).not.toHaveBeenCalled();
  });

  it("never blocks the journey when persistence is unavailable", async () => {
    const app = await buildApp();
    storageMock.recordQualityLabFunnelEvent.mockRejectedValueOnce(new Error("table missing"));
    const res = await request(app).post("/api/quality-lab/funnel-events").send(event);
    expect(res.status).toBe(202);
    expect(res.body).toEqual({ accepted: true, recorded: false });
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
    const urs = await request(app).get("/api/quality-lab/reviewed-projects/qlp_private/urs-document.docx");
    const rfq = await request(app).get("/api/quality-lab/reviewed-projects/qlp_private/rfq-workbook");
    expect(workbook.status).toBe(401);
    expect(brief.status).toBe(401);
    expect(urs.status).toBe(401);
    expect(rfq.status).toBe(401);
    expect(storageMock.getQualityLabReviewedProject).not.toHaveBeenCalled();
  });

  it("protects the reviewed-project portfolio behind authentication", async () => {
    const app = await buildApp();
    await request(app).get("/api/quality-lab/reviewed-projects").expect(401);
    await request(app).delete("/api/quality-lab/reviewed-projects/qlp_private").expect(401);
    expect(storageMock.listQualityLabReviewedProjects).not.toHaveBeenCalled();
    expect(storageMock.deleteQualityLabReviewedProject).not.toHaveBeenCalled();
  });

  it("keeps diagnostic access behind authentication", async () => {
    const app = await buildApp();
    await request(app).get("/api/quality-lab/diagnostic-access").expect(401);
    expect(storageMock.hasCompletedPurchase).not.toHaveBeenCalled();
  });

  it("reports paid scope-diagnostic access with the purchase date", async () => {
    const app = await buildApp();
    const agent = request.agent(app);
    storageMock.getUserByEmail.mockResolvedValueOnce(undefined);
    storageMock.createUser.mockResolvedValueOnce({ id: "u1", email: "a@b.com", isPro: false });
    await agent.post("/api/auth/register").send({ email: "a@b.com", password: "pw123456" }).expect(201);
    storageMock.getUser.mockResolvedValue({ id: "u1", email: "a@b.com", isPro: false });
    storageMock.hasCompletedPurchase.mockResolvedValue(true);
    storageMock.getLatestCompletedPurchaseAt.mockResolvedValue(new Date("2026-07-20T10:00:00.000Z"));

    const res = await agent.get("/api/quality-lab/diagnostic-access");
    expect(res.status).toBe(200);
    expect(res.body.entitled).toBe(true);
    expect(res.body.purchasedAt).toBe("2026-07-20T10:00:00.000Z");
    expect(storageMock.hasCompletedPurchase).toHaveBeenCalledWith("u1", "scope_diagnostic");
    expect(storageMock.getLatestCompletedPurchaseAt).toHaveBeenCalledWith("u1", "scope_diagnostic");
  });

  it("reports no diagnostic entitlement without a completed purchase", async () => {
    const app = await buildApp();
    const agent = request.agent(app);
    storageMock.getUserByEmail.mockResolvedValueOnce(undefined);
    storageMock.createUser.mockResolvedValueOnce({ id: "u1", email: "a@b.com", isPro: false });
    await agent.post("/api/auth/register").send({ email: "a@b.com", password: "pw123456" }).expect(201);
    storageMock.getUser.mockResolvedValue({ id: "u1", email: "a@b.com", isPro: false });
    storageMock.hasCompletedPurchase.mockResolvedValue(false);
    storageMock.getLatestCompletedPurchaseAt.mockResolvedValue(null);

    const res = await agent.get("/api/quality-lab/diagnostic-access");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ entitled: false, purchasedAt: null });
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
  it("returns public quality metadata while keeping a Pro lesson body locked", async () => {
    const app = await buildApp();
    storageMock.getContentEntry.mockResolvedValueOnce(undefined);
    const res = await request(app).get("/api/content/academy/batch-record-review");

    expect(res.status).toBe(200);
    expect(res.body.locked).toBe(true);
    expect(res.body).not.toHaveProperty("body");
    expect(res.body.quality).toMatchObject({
      contentVersion: "2.0.0-review",
      reviewStatus: "under-review",
      sourceCount: 3,
      promoted: false,
    });
    expect(res.body.quality.limitations.length).toBeGreaterThan(0);
  });

  it("rejects legacy non-English content language requests", async () => {
    const app = await buildApp();
    const res = await request(app).get("/api/content/academy/sterility-testing-basics?lang=vi");

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid content reference");
    expect(storageMock.getContentEntry).not.toHaveBeenCalled();
  });

  it("keeps the full Decision Package learning flow out of guest responses", async () => {
    const app = await buildApp();
    const res = await request(app).get("/api/decision-packages/cross-cutting-evidence-governance/learning-flow");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ locked: true, tier: "pro", reviewStatus: "specialist-review-required", preview: { knowledgeUnits: 3, workflowPhases: 5, evidenceActivities: 3, knowledgeChecks: 3, practiceLabs: 1 } });
    expect(res.body).not.toHaveProperty("flow");
    expect(JSON.stringify(res.body)).not.toContain("Signal-to-decision lineage reconstruction");
  });

  it("returns the complete learning flow only to an active Pro session", async () => {
    const app = await buildApp();
    const agent = request.agent(app);
    const user = { id: "u-learning-pro", email: "learning@example.com", isPro: true, subscriptionStatus: "active" };
    storageMock.getUserByEmail.mockResolvedValueOnce(undefined);
    storageMock.createUser.mockResolvedValueOnce(user);
    await agent.post("/api/auth/register").send({ email: user.email, password: "pw123456" }).expect(201);
    storageMock.getUser.mockResolvedValueOnce(user);

    const res = await agent.get("/api/decision-packages/cross-cutting-evidence-governance/learning-flow");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ locked: false, tier: "pro", flow: { packageId: "cross-cutting-evidence-governance", reviewStatus: "specialist-review-required" } });
    expect(res.body.flow.workflowPhases).toHaveLength(5);
    expect(res.body.flow.evidenceActivities[0].title).toBe("Signal-to-decision lineage reconstruction");
    expect(res.body.flow.practiceLab.title).toBe("Fictional signal-to-investigation-to-change evidence loop");
    expect(res.body.flow.practiceLab.rounds).toHaveLength(3);
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
    fulfillStripeEventOnce
      .mockResolvedValueOnce({ duplicate: false, userId: "u1" })
      .mockResolvedValueOnce({ duplicate: true });
    const first = await request(app)
      .post("/api/stripe/webhook")
      .set("stripe-signature", "sig")
      .send(purchaseEvent);
    expect(first.status).toBe(200);

    const second = await request(app)
      .post("/api/stripe/webhook")
      .set("stripe-signature", "sig")
      .send(purchaseEvent);
    expect(second.status).toBe(200);
    expect(second.body.duplicate).toBe(true);

    expect(fulfillStripeEventOnce).toHaveBeenCalledTimes(2);
    expect(fulfillStripeEventOnce).toHaveBeenNthCalledWith(1, "evt_1", "checkout.session.completed", expect.objectContaining({ kind: "checkout-payment", sessionId: "cs_1" }));
  });

  it("records an authoritative Diagnostic conversion against its anonymous journey", async () => {
    const app = await buildApp();
    const diagnosticEvent = {
      id: "evt_diagnostic",
      type: "checkout.session.completed",
      data: { object: {
        id: "cs_diagnostic",
        created: 1785196800,
        metadata: {
          userId: "u1",
          productType: "scope_diagnostic",
          blueprintJourneyId: "03bb1889-35b8-487a-a8ab-f447aaec3b31",
        },
        amount_total: 14900,
        customer_email: "buyer@example.com",
      } },
    };
    constructEvent.mockReturnValue(diagnosticEvent);
    const res = await request(app).post("/api/stripe/webhook").set("stripe-signature", "sig").send(diagnosticEvent);
    expect(res.status).toBe(200);
    expect(fulfillStripeEventOnce).toHaveBeenCalledWith("evt_diagnostic", "checkout.session.completed", expect.objectContaining({
      kind: "checkout-payment",
      productType: "scope_diagnostic",
      blueprintJourneyId: "03bb1889-35b8-487a-a8ab-f447aaec3b31",
    }));
  });

  it("rejects missing signature", async () => {
    const app = await buildApp();
    const res = await request(app).post("/api/stripe/webhook").send(purchaseEvent);
    expect(res.status).toBe(400);
  });

  it("exempts a signed Stripe webhook from the browser origin guard", async () => {
    const app = await buildApp();
    constructEvent.mockReturnValue(purchaseEvent);
    const response = await request(app)
      .post("/api/stripe/webhook")
      .set("origin", "https://stripe.example")
      .set("stripe-signature", "sig")
      .send(purchaseEvent);
    expect(response.status).toBe(200);
    expect(fulfillStripeEventOnce).toHaveBeenCalledOnce();
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

  it("protects account-saved Blueprint projects and revisions behind authentication", async () => {
    const app = await buildApp();
    await request(app).get("/api/quality-lab/projects").expect(401);
    await request(app).put("/api/quality-lab/projects/qlp_private").send({}).expect(401);
    await request(app).get("/api/quality-lab/projects/qlp_private/revisions").expect(401);
    await request(app).delete("/api/quality-lab/projects/qlp_private").expect(401);
    expect(storageMock.listQualityLabReviewedProjects).not.toHaveBeenCalled();
    expect(storageMock.deleteQualityLabReviewedProject).not.toHaveBeenCalled();
  });

  it("fails account project sync closed when the required schema is incomplete", async () => {
    const app = await buildApp();
    const agent = request.agent(app);
    storageMock.getUserByEmail.mockResolvedValueOnce(undefined);
    storageMock.createUser.mockResolvedValueOnce({ id: "u-schema", email: "schema@example.com", isPro: false });
    await agent.post("/api/auth/register").send({ email: "schema@example.com", password: "pw123456" }).expect(201);
    checkRuntimeSchema.mockResolvedValueOnce(false);

    const response = await agent.get("/api/quality-lab/projects");

    expect(response.status).toBe(503);
    expect(response.body).toMatchObject({ code: "SCHEMA_NOT_READY" });
    expect(response.body.requestId).toEqual(expect.any(String));
    expect(storageMock.listQualityLabReviewedProjects).not.toHaveBeenCalled();
  });

  it("creates an authenticated account project with its first revision", async () => {
    const app = await buildApp();
    const agent = request.agent(app);
    storageMock.getUserByEmail.mockResolvedValueOnce(undefined);
    storageMock.createUser.mockResolvedValueOnce({ id: "u-project-sync", email: "sync@example.com", isPro: false });
    await agent.post("/api/auth/register").send({ email: "sync@example.com", password: "pw123456" }).expect(201);

    const project = createQualityLabProject(defaultQualityLabInput, "qlp_account_route");
    const snapshot = createQualityLabAccountSnapshot(project);
    const savedAt = new Date("2026-07-26T09:00:00.000Z");
    const row = { id: 1, userId: "u-project-sync", localProjectId: project.id, projectName: project.name, snapshot, createdAt: savedAt, updatedAt: savedAt };
    storageMock.syncQualityLabReviewedProject.mockResolvedValueOnce({ status: "created", row, revisionCount: 1 });

    const response = await agent.put(`/api/quality-lab/projects/${project.id}`).send({ snapshot, expectedUpdatedAt: null });
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ revisionCount: 1, updatedAt: savedAt.toISOString(), snapshot: { localProjectId: project.id } });
    expect(storageMock.syncQualityLabReviewedProject).toHaveBeenCalledWith("u-project-sync", expect.objectContaining({ localProjectId: project.id }), null);
  });

  it("returns the current account revision instead of overwriting a stale project", async () => {
    const app = await buildApp();
    const agent = request.agent(app);
    storageMock.getUserByEmail.mockResolvedValueOnce(undefined);
    storageMock.createUser.mockResolvedValueOnce({ id: "u-project-conflict", email: "conflict@example.com", isPro: false });
    await agent.post("/api/auth/register").send({ email: "conflict@example.com", password: "pw123456" }).expect(201);

    const project = createQualityLabProject(defaultQualityLabInput, "qlp_conflict_route");
    const snapshot = createQualityLabAccountSnapshot(project);
    const currentUpdatedAt = new Date("2026-07-26T09:00:00.000Z");
    const row = { id: 2, userId: "u-project-conflict", localProjectId: project.id, projectName: project.name, snapshot, createdAt: currentUpdatedAt, updatedAt: currentUpdatedAt };
    storageMock.syncQualityLabReviewedProject.mockResolvedValueOnce({ status: "conflict", row, revisionCount: 1 });

    const response = await agent.put(`/api/quality-lab/projects/${project.id}`).send({ snapshot, expectedUpdatedAt: "2026-07-25T09:00:00.000Z" });
    expect(response.status).toBe(409);
    expect(response.body).toMatchObject({ revisionCount: 1, updatedAt: currentUpdatedAt.toISOString(), snapshot: { localProjectId: project.id } });
    expect(storageMock.syncQualityLabReviewedProject).toHaveBeenCalledTimes(1);
  });

  it("loads revision counts and individual history content on demand", async () => {
    const app = await buildApp();
    const agent = request.agent(app);
    storageMock.getUserByEmail.mockResolvedValueOnce(undefined);
    storageMock.createUser.mockResolvedValueOnce({ id: "u-project-history", email: "history@example.com", isPro: false });
    await agent.post("/api/auth/register").send({ email: "history@example.com", password: "pw123456" }).expect(201);

    const project = createQualityLabProject(defaultQualityLabInput, "qlp_history_route");
    const snapshot = createQualityLabAccountSnapshot(project);
    const savedAt = new Date("2026-07-26T09:00:00.000Z");
    const projectRow = { id: 3, userId: "u-project-history", localProjectId: project.id, projectName: project.name, snapshot, createdAt: savedAt, updatedAt: savedAt };
    storageMock.listQualityLabReviewedProjects.mockResolvedValueOnce([projectRow]);
    storageMock.countQualityLabReviewedProjectRevisions.mockResolvedValueOnce(6);

    const projects = await agent.get("/api/quality-lab/projects");
    expect(projects.status).toBe(200);
    expect(projects.body[0].revisionCount).toBe(6);
    expect(storageMock.listQualityLabReviewedProjectRevisions).not.toHaveBeenCalled();

    storageMock.getQualityLabReviewedProjectRevision.mockResolvedValueOnce({
      id: 9,
      reviewedProjectId: projectRow.id,
      revisionNumber: 1,
      reason: "reviewed-project-sync",
      snapshot,
      createdAt: savedAt,
    });
    const revision = await agent.get(`/api/quality-lab/projects/${project.id}/revisions/1`);
    expect(revision.status).toBe(200);
    expect(revision.body).toMatchObject({ revisionNumber: 1, snapshot: { localProjectId: project.id } });
    expect(storageMock.getQualityLabReviewedProjectRevision).toHaveBeenCalledWith("u-project-history", project.id, 1);
  });

  it("syncs monthly quality reviews only for an active Pro member", async () => {
    const app = await buildApp();
    const proUser = { id: "pro-monthly", email: "pro-monthly@example.com", isPro: true, subscriptionStatus: "active" };
    const agent = await authedAgent(app, proUser);
    const review = { id: "apr_2026-08_test", version: ATLAS_PRO_MONTHLY_REVIEW_VERSION, input: exampleAtlasProMonthlyInput, statuses: { frame: "closed", verify: "in-progress", decide: "waiting-review", close: "not-started" }, updatedAt: "2026-07-22T12:00:00.000Z" };
    storageMock.getUser.mockResolvedValue(proUser);
    storageMock.listAtlasProMonthlyReviews.mockResolvedValueOnce([{ snapshot: review }]);
    const listed = await agent.get("/api/pro/monthly-reviews");
    expect(listed.status).toBe(200);
    expect(listed.body.reviews[0].id).toBe(review.id);

    storageMock.upsertAtlasProMonthlyReview.mockResolvedValueOnce({ snapshot: review, updatedAt: new Date(review.updatedAt) });
    const saved = await agent.put(`/api/pro/monthly-reviews/${review.id}`).send(review);
    expect(saved.status).toBe(201);
    expect(storageMock.upsertAtlasProMonthlyReview).toHaveBeenCalledWith(proUser.id, expect.objectContaining({ id: review.id }));
  });

  it("rejects monthly quality review sync for a free member", async () => {
    const app = await buildApp();
    const freeUser = { id: "free-monthly", email: "free-monthly@example.com", isPro: false, subscriptionStatus: "free" };
    const agent = await authedAgent(app, freeUser);
    storageMock.getUser.mockResolvedValueOnce(freeUser);
    const res = await agent.get("/api/pro/monthly-reviews");
    expect(res.status).toBe(403);
    expect(storageMock.listAtlasProMonthlyReviews).not.toHaveBeenCalled();
  });

  it("creates a one-time Diagnostic session with the intake cancel route", async () => {
    const app = await buildApp();
    const user = { id: "u1", email: "a@b.com", isPro: false };
    const agent = await authedAgent(app, user);
    storageMock.getUser.mockResolvedValueOnce(user);
    checkoutCreate.mockResolvedValueOnce({ url: "https://checkout.stripe.test/diagnostic" });

    const res = await agent.post("/api/stripe/create-checkout-session").send({
      productType: "scope_diagnostic",
      blueprintJourneyId: "03bb1889-35b8-487a-a8ab-f447aaec3b31",
    });
    expect(res.status).toBe(200);
    const arg = checkoutCreate.mock.calls[0][0];
    expect(arg.mode).toBe("payment");
    expect(arg.line_items[0].price).toBe("price_diagnostic");
    expect(arg.cancel_url).toContain("/quality-lab/review?offer=diagnostic");
    expect(arg.metadata).toMatchObject({
      userId: "u1",
      productType: "scope_diagnostic",
      blueprintJourneyId: "03bb1889-35b8-487a-a8ab-f447aaec3b31",
    });
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

describe("regulatory impact monitor", () => {
  async function authedAgent(app: express.Express) {
    const agent = request.agent(app);
    storageMock.getUserByEmail.mockResolvedValueOnce(undefined);
    storageMock.createUser.mockResolvedValueOnce({ id: "u1", email: "pro@example.com", isPro: true, subscriptionStatus: "active" });
    await agent.post("/api/auth/register").send({ email: "pro@example.com", password: "pw123456" });
    return agent;
  }

  it("exposes official-source metadata publicly but keeps preferences authenticated", async () => {
    const app = await buildApp();
    const monitor = await request(app).get("/api/regulatory-updates");
    expect(monitor.status).toBe(200);
    expect(monitor.body.items).toEqual([]);
    await request(app).get("/api/regulatory-preference").expect(401);
  });

  it("saves an explicit Pro opt-in watchlist", async () => {
    const app = await buildApp();
    const agent = await authedAgent(app);
    storageMock.getUser.mockResolvedValue({ id: "u1", email: "pro@example.com", isPro: true, subscriptionStatus: "active" });
    storageMock.upsertRegulatoryAlertPreference.mockResolvedValueOnce({ cadence: "weekly", domains: ["nonsterile-microbiology"], sources: ["fda-drugs"], updatedAt: new Date() });
    const response = await agent.put("/api/regulatory-preference").send({ cadence: "weekly", domains: ["nonsterile-microbiology"], sources: ["fda-drugs"] });
    expect(response.status).toBe(200);
    expect(storageMock.upsertRegulatoryAlertPreference).toHaveBeenCalledWith("u1", { cadence: "weekly", domains: ["nonsterile-microbiology"], sources: ["fda-drugs"] });
  });

  it("rejects digest preferences for a free account", async () => {
    const app = await buildApp();
    const agent = await authedAgent(app);
    storageMock.getUser.mockResolvedValueOnce({ id: "u1", email: "free@example.com", isPro: false, subscriptionStatus: "free" });
    await agent.put("/api/regulatory-preference").send({ cadence: "daily", domains: [], sources: [] }).expect(403);
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
    await request(app).get("/api/career-blueprint/execution").expect(401);
    await request(app).post("/api/career-blueprint/execution").send({ ...defaultCareerProfile, fullName: "Alex Morgan", location: "Toronto, Canada" }).expect(401);
    await request(app).put("/api/career-blueprint/execution/execution-1").send({}).expect(401);
    await request(app).put("/api/career-blueprint/profile").send({ ...defaultCareerProfile, fullName: "Alex Morgan", location: "Toronto, Canada" }).expect(401);
    await request(app).get("/api/career-blueprint/profile").expect(401);
    await request(app).post("/api/career-blueprint/download").send({ ...defaultCareerProfile, fullName: "Alex Morgan", location: "Toronto, Canada" }).expect(401);
  });

  it("reports purchase access and generates the named 38-page PDF", async () => {
    const app = await buildApp();
    const agent = await authedAgent(app);
    storageMock.getUser.mockResolvedValue({ id: "u1", email: "a@b.com", isPro: false });
    storageMock.hasCompletedPurchase.mockResolvedValue(true);
    storageMock.upsertCareerBlueprintExecution.mockImplementation(async (_userId, record) => ({ snapshot: record, updatedAt: new Date("2026-07-22T12:00:00.000Z") }));

    const access = await agent.get("/api/career-blueprint/access");
    expect(access.status).toBe(200);
    expect(access.body.entitled).toBe(true);

    const execution = await agent.post("/api/career-blueprint/execution").send({ ...defaultCareerProfile, fullName: "Alex Morgan", location: "Toronto, Canada" });
    expect(execution.status).toBe(200);
    expect(execution.body.record.routeTitle).toBe("Senior QC Microbiologist");
    expect(execution.body.record.plan).toHaveLength(13);
    expect(execution.body.record.weeks).toHaveLength(13);
    expect(execution.body.syncAvailable).toBe(true);

    storageMock.getLatestCareerBlueprintExecution.mockResolvedValueOnce({ snapshot: execution.body.record, updatedAt: new Date("2026-07-22T12:00:00.000Z") });
    const synced = await agent.get("/api/career-blueprint/execution");
    expect(synced.status).toBe(200);
    expect(synced.body.record.id).toBe(execution.body.record.id);

    const updatedRecord = { ...execution.body.record, decision: "adjust", decisionRationale: "Reviewer evidence shows a narrower intermediate role is more credible." };
    const saved = await agent.put(`/api/career-blueprint/execution/${execution.body.record.id}`).send(updatedRecord);
    expect(saved.status).toBe(201);
    expect(saved.body.record.decision).toBe("adjust");

    const download = await agent.post("/api/career-blueprint/download").send({ ...defaultCareerProfile, fullName: "Alex Morgan", location: "Toronto, Canada" });
    expect(download.status).toBe(200);
    expect(download.headers["content-type"]).toContain("application/pdf");
    expect(download.headers["content-disposition"]).toContain("alex-morgan-career-blueprint.pdf");
    expect(download.body.subarray(0, 4).toString()).toBe("%PDF");
  });

  it("serves the illustrative sample PDF without authentication", async () => {
    const app = await buildApp();
    const sample = await request(app).get("/api/career-blueprint/sample.pdf");
    expect(sample.status).toBe(200);
    expect(sample.headers["content-type"]).toContain("application/pdf");
    expect(sample.headers["content-disposition"]).toContain("career-blueprint-illustrative-sample.pdf");
    expect(sample.body.subarray(0, 4).toString()).toBe("%PDF");
  });

  it("rejects generation without a completed purchase", async () => {
    const app = await buildApp();
    const agent = await authedAgent(app);
    storageMock.getUser.mockResolvedValue({ id: "u1", email: "a@b.com", isPro: false });
    storageMock.hasCompletedPurchase.mockResolvedValue(false);
    await agent.get("/api/career-blueprint/execution").expect(403);
    await agent.post("/api/career-blueprint/execution").send({ ...defaultCareerProfile, fullName: "Alex Morgan", location: "Toronto, Canada" }).expect(403);
    const record = createCareerExecutionRecord({ ...defaultCareerProfile, fullName: "Alex Morgan", location: "Toronto, Canada" });
    await agent.put(`/api/career-blueprint/execution/${record.id}`).send(record).expect(403);
    await agent.post("/api/career-blueprint/download").send({ ...defaultCareerProfile, fullName: "Alex Morgan", location: "Toronto, Canada" }).expect(403);
    const denied = await agent.get("/api/career-blueprint/profile");
    expect(denied.status).toBe(403);
    expect(denied.body.code).toBe("career_blueprint_purchase_required");
  });

  it("rejects a malformed profile on PUT and round-trips a valid one for an entitled user", async () => {
    const app = await buildApp();
    const agent = await authedAgent(app);
    storageMock.getUser.mockResolvedValue({ id: "u1", email: "a@b.com", isPro: false });
    storageMock.hasCompletedPurchase.mockResolvedValue(true);

    const invalid = await agent.put("/api/career-blueprint/profile").send({ fullName: "X" });
    expect(invalid.status).toBe(400);
    expect(storageMock.upsertCareerBlueprintProfile).not.toHaveBeenCalled();

    const profile = { ...defaultCareerProfile, fullName: "Alex Morgan", location: "Toronto, Canada" };
    const syncedAt = new Date("2026-07-25T12:00:00.000Z");
    storageMock.upsertCareerBlueprintProfile.mockImplementation(async (_userId, value) => ({ profile: value, updatedAt: syncedAt }));
    const saved = await agent.put("/api/career-blueprint/profile").send(profile);
    expect(saved.status).toBe(200);
    expect(saved.body.syncAvailable).toBe(true);
    expect(saved.body.profile.fullName).toBe("Alex Morgan");
    expect(storageMock.upsertCareerBlueprintProfile).toHaveBeenCalledWith("u1", expect.objectContaining({ fullName: "Alex Morgan" }));

    storageMock.getCareerBlueprintProfile.mockResolvedValueOnce({ profile, updatedAt: syncedAt });
    const restored = await agent.get("/api/career-blueprint/profile");
    expect(restored.status).toBe(200);
    expect(restored.body.syncAvailable).toBe(true);
    expect(restored.body.profile).toEqual(saved.body.profile);

    const empty = await agent.get("/api/career-blueprint/profile");
    expect(empty.status).toBe(200);
    expect(empty.body.profile).toBeNull();
  });

  it("degrades to syncAvailable:false instead of failing when the profile table is missing", async () => {
    const app = await buildApp();
    const agent = await authedAgent(app);
    storageMock.getUser.mockResolvedValue({ id: "u1", email: "a@b.com", isPro: false });
    storageMock.hasCompletedPurchase.mockResolvedValue(true);
    storageMock.upsertCareerBlueprintProfile.mockRejectedValueOnce(new Error("relation does not exist"));
    storageMock.getCareerBlueprintProfile.mockRejectedValueOnce(new Error("relation does not exist"));

    const profile = { ...defaultCareerProfile, fullName: "Alex Morgan", location: "Toronto, Canada" };
    const saved = await agent.put("/api/career-blueprint/profile").send(profile);
    expect(saved.status).toBe(200);
    expect(saved.body.syncAvailable).toBe(false);

    const restored = await agent.get("/api/career-blueprint/profile");
    expect(restored.status).toBe(200);
    expect(restored.body).toEqual({ profile: null, syncedAt: null, syncAvailable: false });
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
    expect(res.text).toContain("/evidence</loc>");
    expect(res.text).toContain("/evidence/biopharma</loc>");
    expect(res.text).toContain("/evidence/pharma-api</loc>");
    expect(res.text).toContain("/evidence/drug-product</loc>");
    expect(res.text).toContain("/evidence/packages/drug-product-formulation-material-attributes</loc>");
    expect(res.text).toContain("/career/domains</loc>");
    expect(res.text).toContain("/workflows/oos-investigation</loc>");
    expect(res.text).toMatch(/\/library\/[a-z0-9-]+<\/loc>/);
    expect(res.text).toMatch(/\/blog\/[a-z0-9-]+<\/loc>/);
  });
});
