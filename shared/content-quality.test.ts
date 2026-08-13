import { describe, expect, it } from "vitest";
import {
  CONTENT_QUALITY_REGISTRY,
  CONTENT_QUIZ_V2_REGISTRY,
  EVIDENCE_SOURCE_CATALOG,
  getContentQuality,
} from "./content-quality-registry.js";
import { legacyContentQuality, passesQualityGate, totalQualityScore } from "./content-quality.js";
import { QUALITY_LAB_TRUST_CORRIDOR } from "./quality-lab-trust-corridor.js";
import { ATLAS_PRO_WORKFLOWS } from "./atlas-pro-workflows.js";

describe("Content Quality Contract v2", () => {
  it("keeps legacy content readable but under review and unpromoted", () => {
    const quality = legacyContentQuality("Legacy lesson", "pro");
    expect(quality.reviewStatus).toBe("under-review");
    expect(quality.promoted).toBe(false);
    expect(quality.score.criticalFails.length).toBeGreaterThan(0);
  });

  it("keeps the bounded Quality Lab trust corridor registered, sourced and unpromoted until review", () => {
    expect(QUALITY_LAB_TRUST_CORRIDOR).toHaveLength(20);
    for (const item of QUALITY_LAB_TRUST_CORRIDOR) {
      const quality = CONTENT_QUALITY_REGISTRY[item.id];
      expect(quality, item.id).toBeDefined();
      expect(quality.contentVersion, item.id).not.toBe("legacy/v1");
      expect(quality.sourceIds.length, item.id).toBeGreaterThan(0);
      if (quality.reviewStatus === "under-review") expect(quality.promoted, item.id).toBe(false);
    }
  });

  it("resolves all registered source IDs", () => {
    const ids = new Set(EVIDENCE_SOURCE_CATALOG.sources.map((source) => source.id));
    for (const quality of Object.values(CONTENT_QUALITY_REGISTRY)) {
      expect(quality.sourceIds.every((id) => ids.has(id))).toBe(true);
    }
  });

  it("provides four balanced v2 questions for every strategic lesson", () => {
    const positions = [0, 0, 0, 0];
    for (const [key, quality] of Object.entries(CONTENT_QUALITY_REGISTRY)) {
      if (!quality.strategicCore) continue;
      const questions = CONTENT_QUIZ_V2_REGISTRY[key];
      expect(questions).toHaveLength(4);
      expect(new Set(questions.map((question) => question.type))).toEqual(new Set(["concept", "applicability", "scenario", "evidence-action"]));
      questions.forEach((question) => positions[question.answer] += 1);
    }
    expect(Math.max(...positions) - Math.min(...positions)).toBeLessThanOrEqual(1);
  });

  it("never treats a critical fail as gate passing", () => {
    const quality = getContentQuality("academy", "oos-investigation-deep-dive", "OOS", "pro");
    expect(totalQualityScore(quality.score)).toBeGreaterThan(0);
    expect(passesQualityGate(quality.score, "pro")).toBe(false);
  });

  it("maps exactly 36 unique strategic lessons into five under-review workflows", () => {
    const slugs = ATLAS_PRO_WORKFLOWS.flatMap((workflow) => workflow.lessonSlugs);
    expect(ATLAS_PRO_WORKFLOWS).toHaveLength(5);
    expect(slugs).toHaveLength(36);
    expect(new Set(slugs).size).toBe(36);
    expect(slugs.every((slug) => CONTENT_QUALITY_REGISTRY[`academy/${slug}`]?.strategicCore)).toBe(true);
    expect(ATLAS_PRO_WORKFLOWS.every((workflow) => workflow.qualityGate === "under-review")).toBe(true);
  });
});
