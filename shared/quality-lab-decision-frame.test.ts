import { describe, expect, it } from "vitest";
import {
  assessQualityLabDecisionFrame,
  createQualityLabDecisionFrameHandoff,
  emptyQualityLabDecisionFrame,
  formatQualityLabDecisionFrame,
  formatQualityLabDecisionFrameReviewContext,
  parseQualityLabDecisionFrame,
  parseQualityLabDecisionFrameHandoff,
  qualityLabDecisionFrameFieldLimits,
  type QualityLabDecisionFrameInput,
} from "./quality-lab-decision-frame";

const completeFrame: QualityLabDecisionFrameInput = {
  decision: "Decide whether baseline release demand should use one shift or a planned second-shift scenario.",
  decisionOwner: "Site quality director with QC, QA, engineering, and finance review.",
  firstScope: "One ASEAN non-sterile site, three oral-solid product families, microbiology release scope, baseline plus one shift scenario.",
  decisionGate: "Budget review on 30 September 2026",
  evidenceBasis: "Twelve months of sample history owned by QC, current approved methods, equipment list, and a concept layout with open utility details.",
  unresolvedImpact: "A late shift decision could delay release capacity, distort staffing cost, and trigger layout rework.",
  excludedDecisions: "This review will not select suppliers, issue URS documents, approve validation, or authorize the final laboratory design.",
};

describe("Quality Lab decision frame", () => {
  it("keeps an empty frame visibly incomplete and identifies the first useful action", () => {
    const readiness = assessQualityLabDecisionFrame(emptyQualityLabDecisionFrame);
    expect(readiness.completeCount).toBe(0);
    expect(readiness.percent).toBe(0);
    expect(readiness.nextAction).toContain("State the operating");
  });

  it("recognizes a fully described frame without implying approval or evidence sufficiency", () => {
    const readiness = assessQualityLabDecisionFrame(completeFrame);
    expect(readiness.completeCount).toBe(7);
    expect(readiness.percent).toBe(100);
    expect(readiness.boundary).toContain("does not establish regulatory applicability");
    expect(readiness.nextAction).toContain("link controlled evidence");
  });

  it("formats a portable decision frame with gaps, controls, and next action", () => {
    const formatted = formatQualityLabDecisionFrame({ ...completeFrame, evidenceBasis: "" });
    expect(formatted).toContain("# Atlas Blueprint Decision Frame");
    expect(formatted).toContain("## Available evidence and limitations\nNot described - discovery gap");
    expect(formatted).toContain("Available evidence: List the controlled or working inputs");
    expect(formatted).toContain("Decisions not authorized by this work");
    expect(formatted).toContain("evidence sufficiency");
  });

  it("validates browser-local records and expires deliberate review handoffs", () => {
    const recordedAt = Date.UTC(2026, 6, 22, 10, 0, 0);
    const handoff = createQualityLabDecisionFrameHandoff(completeFrame, recordedAt);

    expect(parseQualityLabDecisionFrame(completeFrame)).toEqual(completeFrame);
    expect(parseQualityLabDecisionFrame({ ...completeFrame, decision: 42 })).toBeNull();
    expect(parseQualityLabDecisionFrameHandoff(handoff, recordedAt + 60_000)).toEqual(handoff);
    expect(parseQualityLabDecisionFrameHandoff(handoff, recordedAt + 24 * 60 * 60 * 1000)).toBeNull();
  });

  it("builds a review context that preserves every decision boundary without exceeding the intake limit", () => {
    const context = formatQualityLabDecisionFrameReviewContext(completeFrame);
    const maximumFrame = Object.fromEntries(Object.entries(qualityLabDecisionFrameFieldLimits).map(([key, limit]) => [key, "x".repeat(limit)])) as unknown as QualityLabDecisionFrameInput;
    expect(context).toContain("Decision frame transferred from the browser-local Atlas Blueprint Discovery Pack.");
    expect(context).toContain("Decisions not authorized by this work");
    expect(context.length).toBeLessThan(4000);
    expect(formatQualityLabDecisionFrameReviewContext(maximumFrame).length).toBeLessThan(4000);
  });
});
