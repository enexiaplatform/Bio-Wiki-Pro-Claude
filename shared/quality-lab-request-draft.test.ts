import { describe, expect, it } from "vitest";
import {
  createQualityLabRequestDraft,
  parseRecentQualityLabRequestDraft,
  QUALITY_LAB_REQUEST_DRAFT_TTL_MS,
} from "./quality-lab-request-draft";

const qualification = {
  engagementIntent: "blueprint-pilot" as const,
  projectStage: "concept" as const,
  decisionWindow: "not-set" as const,
  budgetStatus: "exploring" as const,
  decisionRole: "technical-lead" as const,
  dataReadiness: "initial" as const,
  portfolioScale: "not-set" as const,
};

function draft(savedAt = 1_000) {
  return createQualityLabRequestDraft({
    scopeKey: "standalone",
    qualification,
    form: { name: "A", email: "partial@", company: "", role: "", need: "Early notes" },
    attachMode: "brief-only",
  }, savedAt);
}

describe("commercial request drafts", () => {
  it("keeps incomplete tab-local values for the same scope", () => {
    expect(parseRecentQualityLabRequestDraft(draft(), "standalone", 2_000)?.form.email).toBe("partial@");
  });

  it("does not cross project scopes", () => {
    expect(parseRecentQualityLabRequestDraft(draft(), "project:other", 2_000)).toBeNull();
  });

  it("rejects expired and future-dated drafts", () => {
    expect(parseRecentQualityLabRequestDraft(draft(), "standalone", 1_000 + QUALITY_LAB_REQUEST_DRAFT_TTL_MS + 1)).toBeNull();
    expect(parseRecentQualityLabRequestDraft(draft(3_000), "standalone", 2_000)).toBeNull();
  });

  it("rejects malformed or oversized draft content", () => {
    expect(parseRecentQualityLabRequestDraft({ ...draft(), form: { ...draft().form, need: "x".repeat(4_001) } }, "standalone", 2_000)).toBeNull();
  });

  it("never restores a confidentiality attestation", () => {
    const parsed = parseRecentQualityLabRequestDraft({ ...draft(), confidentialityConfirmed: true }, "standalone", 2_000);
    expect(parsed).not.toHaveProperty("confidentialityConfirmed");
  });
});
