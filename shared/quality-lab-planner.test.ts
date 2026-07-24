import { describe, expect, it } from "vitest";
import { createBlankQualityLabInput } from "./quality-lab";
import { qualityLabPlannerStepIssues } from "./quality-lab-planner";

describe("Quality Lab planner validation", () => {
  it("returns every missing project-basis field in one pass", () => {
    const input = createBlankQualityLabInput();
    const issues = qualityLabPlannerStepIssues(input, 0);
    expect(issues.map((issue) => issue.id)).toEqual(["projectName", "primaryDecision", "country", "markets"]);
  });

  it("reports the demand and capability groups at their own steps", () => {
    const input = createBlankQualityLabInput();
    expect(qualityLabPlannerStepIssues(input, 1).map((issue) => issue.id)).toEqual(["testing-demand"]);
    expect(qualityLabPlannerStepIssues(input, 2).map((issue) => issue.id)).toEqual(["capability-scope"]);
  });
});
