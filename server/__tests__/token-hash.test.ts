import { describe, expect, it } from "vitest";
import { hashAuthToken } from "../storage.js";

describe("authentication token storage", () => {
  it("uses a deterministic SHA-256 digest without retaining the raw token", () => {
    const token = "raw-reset-token-that-must-never-be-stored";
    const digest = hashAuthToken(token);
    expect(digest).toMatch(/^[a-f0-9]{64}$/);
    expect(digest).not.toContain(token);
    expect(hashAuthToken(token)).toBe(digest);
    expect(hashAuthToken(`${token}-different`)).not.toBe(digest);
  });
});
