import { describe, expect, it } from "vitest";
import { defaultCareerProfile } from "./career-blueprint";
import { buildCareerExecutionPlan, compileCareerExecution, createCareerExecutionRecord, formatCareerExecution } from "./career-execution";

describe("Career Blueprint execution workspace", () => {
  const profile = { ...defaultCareerProfile, fullName: "Alex Morgan", location: "Toronto, Canada" };

  it("builds a personalized 13-week path across four decision phases", () => {
    const plan = buildCareerExecutionPlan(profile);
    expect(plan).toHaveLength(13);
    expect(plan.map((item) => item.week)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
    expect(new Set(plan.map((item) => item.phase))).toEqual(new Set(["validate", "build", "prove", "transition"]));
    expect(plan[0].action).toContain("Senior QC Microbiologist");
    expect(plan.every((item) => item.evidencePrompt.length > 30 && item.reviewQuestion.length > 20)).toBe(true);
  });

  it("keeps execution progress separate from competence or hiring claims", () => {
    const record = createCareerExecutionRecord(profile, undefined, new Date("2026-07-22T12:00:00.000Z"));
    record.weeks[0] = { ...record.weeks[0], status: "complete", evidenceNote: "Reviewed five role profiles and classified recurring expectations.", reviewerFeedback: "The requirement clusters are plausible for this employer group." };
    const compiled = compileCareerExecution(record);
    expect(compiled.completeWeeks).toBe(1);
    expect(compiled.evidenceWeeks).toBe(1);
    expect(compiled.reviewedWeeks).toBe(1);
    expect(compiled.percent).toBe(8);
    expect(compiled.boundary).toContain("does not verify competence");
  });

  it("exports weekly evidence and the continue-adjust-pivot decision gate", () => {
    const record = createCareerExecutionRecord(profile, undefined, new Date("2026-07-22T12:00:00.000Z"));
    record.decision = "adjust";
    record.decisionRationale = "The target remains credible, but investigation ownership needs a smaller first experiment.";
    const output = formatCareerExecution(record);
    expect(output).toContain("13-Week Career Blueprint Execution Brief");
    expect(output).toContain("### Week 13: Make the route decision");
    expect(output).toContain("## Route decision gate");
    expect(output).toContain("Decision: adjust");
    expect(output).toContain("does not verify competence");
  });
});
