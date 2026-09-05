import { describe, expect, it } from "vitest";
import {
  createQualityLabRequestReceipt,
  parseRecentQualityLabRequestReceipt,
  qualityLabRequestScopeKey,
  QUALITY_LAB_REQUEST_RECEIPT_TTL_MS,
} from "./quality-lab-request-receipt";

describe("Quality Lab commercial request receipt", () => {
  it("restores a recent receipt only for the same Blueprint scope", () => {
    const receipt = createQualityLabRequestReceipt({
      scopeKey: qualityLabRequestScopeKey("qlp_real_1"),
      offer: "blueprint-pilot",
      requestId: 43,
      notifications: { buyerAcknowledgement: "queued", ownerAlert: "queued" },
      recordedAt: 1_000,
    });

    expect(parseRecentQualityLabRequestReceipt(receipt, "project:qlp_real_1", 2_000)).toEqual(receipt);
    expect(parseRecentQualityLabRequestReceipt(receipt, "project:qlp_real_2", 2_000)).toBeNull();
  });

  it("preserves failed or unavailable email routing without treating the stored request as failed", () => {
    const receipt = createQualityLabRequestReceipt({
      scopeKey: "standalone",
      offer: "scope-diagnostic",
      requestId: 45,
      notifications: { buyerAcknowledgement: "failed", ownerAlert: "unavailable" },
      recordedAt: 1_000,
    });

    expect(parseRecentQualityLabRequestReceipt(receipt, "standalone", 2_000)?.notifications).toEqual({
      buyerAcknowledgement: "failed",
      ownerAlert: "unavailable",
    });
  });

  it("expires the receipt after the bounded duplicate-prevention window", () => {
    const receipt = createQualityLabRequestReceipt({
      scopeKey: "standalone",
      offer: "unsure",
      requestId: 44,
      recordedAt: 1_000,
    });

    expect(parseRecentQualityLabRequestReceipt(receipt, "standalone", 1_000 + QUALITY_LAB_REQUEST_RECEIPT_TTL_MS)).toBeNull();
  });

  it("recovers the legacy Diagnostic account-return receipt without inventing a request reference", () => {
    expect(parseRecentQualityLabRequestReceipt(
      { offer: "scope-diagnostic", recordedAt: 1_000 },
      "standalone",
      2_000,
    )).toMatchObject({ offer: "scope-diagnostic", requestId: null, scopeKey: "standalone" });
  });

  it("rejects malformed, future, and project-scoped legacy receipts", () => {
    expect(parseRecentQualityLabRequestReceipt({ offer: "blueprint-pilot", recordedAt: 1_000 }, "standalone", 2_000)).toBeNull();
    expect(parseRecentQualityLabRequestReceipt({ offer: "scope-diagnostic", recordedAt: 3_000 }, "standalone", 2_000)).toBeNull();
    expect(parseRecentQualityLabRequestReceipt({ offer: "scope-diagnostic", recordedAt: 1_000 }, "project:qlp_real_1", 2_000)).toBeNull();
  });
});
