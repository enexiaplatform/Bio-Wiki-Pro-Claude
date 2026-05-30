import { describe, it, expect, beforeEach } from "vitest";
import { getPriceId, getDownloadUrl, isSubscription, getProductName, getProduct } from "../products.js";

describe("product catalog", () => {
  beforeEach(() => {
    process.env.STRIPE_GMP_AUDIT_KIT_PRICE_ID = "price_gmp";
    process.env.DOWNLOAD_GMP_AUDIT_KIT = "https://dl/gmp";
    process.env.STRIPE_PRO_PRICE_ID = "price_pro";
  });

  it("resolves price id lazily from env", () => {
    expect(getPriceId("gmp_audit_kit")).toBe("price_gmp");
    expect(getPriceId("pro_subscription")).toBe("price_pro");
  });

  it("returns '' for unknown product", () => {
    expect(getPriceId("does_not_exist")).toBe("");
  });

  it("download url for one-time product", () => {
    expect(getDownloadUrl("gmp_audit_kit")).toBe("https://dl/gmp");
  });

  it("no download url for subscription", () => {
    expect(getDownloadUrl("pro_subscription")).toBeUndefined();
  });

  it("identifies subscription vs one-time", () => {
    expect(isSubscription("pro_subscription")).toBe(true);
    expect(isSubscription("gmp_audit_kit")).toBe(false);
  });

  it("name with fallback", () => {
    expect(getProductName("gmp_audit_kit")).toBe("GMP Audit Survival Kit");
    expect(getProductName("unknown")).toBe("unknown");
  });

  it("getProduct returns config or undefined", () => {
    expect(getProduct("bundle")?.mode).toBe("payment");
    expect(getProduct("nope")).toBeUndefined();
  });
});
