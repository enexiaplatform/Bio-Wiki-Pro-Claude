import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { send } = vi.hoisted(() => ({ send: vi.fn() }));
vi.mock("resend", () => ({
  Resend: class {
    emails = { send };
  },
}));

type EmailModule = typeof import("../email.js");
const recipient = "private.person@example.test";
const privateContext = "confidential-client-context";
const deliveries = [
  { name: "nurture", invoke: (email: EmailModule) => email.sendNurtureEmail(recipient, 1, privateContext) },
  { name: "trial ending", invoke: (email: EmailModule) => email.sendTrialEndingEmail(recipient, 1, new Date("2026-09-06T00:00:00Z"), privateContext) },
  { name: "abandoned checkout", invoke: (email: EmailModule) => email.sendAbandonedCheckoutEmail(recipient, "scope_diagnostic", privateContext) },
  { name: "re-engagement", invoke: (email: EmailModule) => email.sendReEngagementEmail(recipient, privateContext) },
];

beforeEach(() => {
  vi.resetModules();
  send.mockReset();
  vi.stubEnv("RESEND_API_KEY", "re_local_mock_only");
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe.each(deliveries)("$name delivery acknowledgement", ({ invoke }) => {
  it("returns false without calling a provider when email is unconfigured", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const email = await import("../email.js");
    expect(await invoke(email)).toBe(false);
    expect(send).not.toHaveBeenCalled();
    const logs = JSON.stringify(vi.mocked(console.warn).mock.calls);
    expect(logs).not.toContain(recipient);
    expect(logs).not.toContain(privateContext);
  });

  it("returns false and sanitizes a provider rejection", async () => {
    send.mockResolvedValue({ data: null, error: { name: "validation_error", message: `${recipient} ${privateContext}` } });
    const email = await import("../email.js");
    expect(await invoke(email)).toBe(false);
    expect(send).toHaveBeenCalledOnce();
    expect(console.error).toHaveBeenCalledWith("[Email] delivery failed", expect.objectContaining({ errorType: "provider-error" }));
    const logs = JSON.stringify(vi.mocked(console.error).mock.calls);
    expect(logs).not.toContain(recipient);
    expect(logs).not.toContain(privateContext);
  });

  it("returns false and sanitizes a thrown delivery error", async () => {
    send.mockRejectedValue(new Error(`${recipient} ${privateContext}`));
    const email = await import("../email.js");
    expect(await invoke(email)).toBe(false);
    expect(send).toHaveBeenCalledOnce();
    expect(console.error).toHaveBeenCalledWith("[Email] delivery failed", expect.objectContaining({ errorType: "Error" }));
    const logs = JSON.stringify(vi.mocked(console.error).mock.calls);
    expect(logs).not.toContain(recipient);
    expect(logs).not.toContain(privateContext);
  });

  it("returns true only after the provider accepts the message", async () => {
    send.mockResolvedValue({ data: { id: "mock-accepted-message" }, error: null });
    const email = await import("../email.js");
    expect(await invoke(email)).toBe(true);
    expect(send).toHaveBeenCalledOnce();
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ to: recipient, subject: expect.any(String), html: expect.any(String) }));
    expect(console.error).not.toHaveBeenCalled();
  });
});

it("does not acknowledge or dispatch an unknown nurture step", async () => {
  const email = await import("../email.js");
  expect(await email.sendNurtureEmail(recipient, 99)).toBe(false);
  expect(send).not.toHaveBeenCalled();
});
