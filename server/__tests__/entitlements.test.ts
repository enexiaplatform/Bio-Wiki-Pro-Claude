import { describe, it, expect } from "vitest";
import { isProActive } from "../entitlements.js";

const base = {
  isPro: true,
  subscriptionStatus: "active",
  proExpiresAt: null,
  proGraceUntil: null,
};

describe("isProActive", () => {
  it("false when not pro", () => {
    expect(isProActive({ ...base, isPro: false })).toBe(false);
  });

  it("true when active subscription", () => {
    expect(isProActive(base)).toBe(true);
  });

  it("false past proExpiresAt (cancel → off at period end)", () => {
    expect(isProActive({ ...base, proExpiresAt: new Date(Date.now() - 1000) })).toBe(false);
  });

  it("true within dunning grace window", () => {
    expect(
      isProActive({ ...base, subscriptionStatus: "past_due", proGraceUntil: new Date(Date.now() + 60_000) })
    ).toBe(true);
  });

  it("false when grace window expired", () => {
    expect(
      isProActive({ ...base, subscriptionStatus: "past_due", proGraceUntil: new Date(Date.now() - 1000) })
    ).toBe(false);
  });

  it("false for null/undefined user", () => {
    expect(isProActive(null)).toBe(false);
    expect(isProActive(undefined)).toBe(false);
  });
});
