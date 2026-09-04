import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("email fallback privacy", () => {
  it("does not log recipients, auth links, or Blueprint content when the provider is absent", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    vi.resetModules();
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const email = await import("../email.js");
    const recipient = "private.person@example.test";
    const token = "secret-reset-token";
    const blueprintContent = "confidential-blueprint-content";

    await email.sendPasswordResetEmail(recipient, `https://atlas.test/reset-password?token=${token}`);
    await email.sendVerificationEmail(recipient, `https://atlas.test/verify-email?token=${token}`);
    await email.sendQualityLabWorkQueueEmail(recipient, blueprintContent, [] as any, {
      overdueCount: 0,
      dueSoonCount: 0,
      unscheduledBlockingCount: 0,
      readyForReviewCount: 0,
    });
    const delivery = await email.sendCommercialRequestEmails({
      requestId: "request-private",
      name: blueprintContent,
      email: recipient,
      offer: "scope diagnostic",
      summary: blueprintContent,
    });

    const output = JSON.stringify(warn.mock.calls);
    expect(output).not.toContain(recipient);
    expect(output).not.toContain(token);
    expect(output).not.toContain(blueprintContent);
    expect(output).toContain("transactional email is not configured");
    expect(delivery).toEqual({ buyerAcknowledgement: "unavailable", ownerAlert: "unavailable" });
  });
});
