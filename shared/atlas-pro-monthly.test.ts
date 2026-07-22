import { describe, expect, it } from "vitest";
import { ATLAS_PRO_MONTHLY_FOCUS, atlasProMonthlyFocusValues, compileAtlasProMonthlyReview, defaultAtlasProMonthlyInput, exampleAtlasProMonthlyInput, formatAtlasProMonthlyReview } from "./atlas-pro-monthly";

describe("Atlas Pro monthly quality review", () => {
  it("provides an evidence-to-action cycle and connected resources for every focus", () => {
    for (const focus of atlasProMonthlyFocusValues) {
      const review = compileAtlasProMonthlyReview({ ...exampleAtlasProMonthlyInput, focus });
      expect(review.steps.map((step) => step.id)).toEqual(["frame", "verify", "decide", "close"]);
      expect(review.focus.resources.map((resource) => resource.cycleStep)).toEqual(["frame", "verify", "decide", "close"]);
      expect(review.focus.resources.filter((resource) => resource.access === "pro").length).toBeGreaterThanOrEqual(2);
      expect(review.focus.resources.every((resource) => resource.href.startsWith("/"))).toBe(true);
      expect(review.boundary).toContain("does not establish compliance");
      expect(ATLAS_PRO_MONTHLY_FOCUS[focus].reviewQuestion.length).toBeGreaterThan(40);
    }
  });

  it("keeps working completeness separate from compliance or approval", () => {
    const empty = compileAtlasProMonthlyReview(defaultAtlasProMonthlyInput("2026-08"));
    expect(empty.readiness.percent).toBe(0);
    expect(empty.readiness.missing).toEqual(["Decision", "Signal", "Evidence held", "Evidence needed", "Owner", "Review date"]);
    const complete = compileAtlasProMonthlyReview(exampleAtlasProMonthlyInput);
    expect(complete.readiness.percent).toBe(100);
    expect(complete.boundary).toContain("controlled site record");
  });

  it("exports the mandate, cycle status, evidence, outcome and resource links", () => {
    const markdown = formatAtlasProMonthlyReview(exampleAtlasProMonthlyInput, { frame: "closed", verify: "in-progress" });
    expect(markdown).toContain("Atlas Pro Monthly Quality Review");
    expect(markdown).toContain(exampleAtlasProMonthlyInput.decision);
    expect(markdown).toContain("### 1. Frame — closed");
    expect(markdown).toContain("### 2. Verify — in progress");
    expect(markdown).toContain("## Four-week guided resource path");
    expect(markdown).toContain("Week 1 / frame");
    expect(markdown).toContain("Pro member");
    expect(markdown).toContain("does not establish compliance");
  });
});
