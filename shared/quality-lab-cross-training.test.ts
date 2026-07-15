import { describe, expect, it } from "vitest";
import { createQualityLabProject, defaultQualityLabInput } from "./quality-lab.js";
import { defaultSkillShiftFeasibilityInput, evaluateSkillShiftFeasibility } from "./quality-lab-skill-coverage.js";
import { defaultCrossTrainingPriorityInput, prioritizeCrossTraining } from "./quality-lab-cross-training.js";

function scenario() {
  const project = createQualityLabProject({ ...defaultQualityLabInput, projectName: "Cross-training priority" });
  return evaluateSkillShiftFeasibility(project, defaultSkillShiftFeasibilityInput(project));
}

describe("Quality Lab cross-training priority", () => {
  it("ranks and allocates execution and reviewer actions within constraints", () => {
    const coverage = scenario();
    const result = prioritizeCrossTraining(coverage, defaultCrossTrainingPriorityInput(coverage));
    expect(result.engineVersion).toBe("cross-training-priority/v1.0");
    expect(result.actions.length).toBeGreaterThan(0);
    expect(result.actions[0].riskScore).toBeGreaterThanOrEqual(result.actions.at(-1)!.riskScore);
    expect(result.summary.peopleAllocated).toBeLessThanOrEqual(5);
    expect(result.summary.allocatedBudgetUsd).toBeLessThanOrEqual(10_000);
    expect(result.summary.allocatedTrainerHours).toBeLessThanOrEqual(80);
  });

  it("defers actions that cannot finish inside the planning horizon", () => {
    const coverage = scenario();
    const input = defaultCrossTrainingPriorityInput(coverage);
    input.planningHorizonWeeks = 2;
    const result = prioritizeCrossTraining(coverage, input);
    expect(result.summary.infeasibleWithinHorizonCount).toBe(result.actions.length);
    expect(result.summary.peopleAllocated).toBe(0);
    expect(result.signals.some((item) => item.id === "horizon-gap")).toBe(true);
  });

  it("does not generate training work when controlled coverage already passes", () => {
    const coverage = scenario();
    coverage.workflows = coverage.workflows.map((item) => ({ ...item, status: "covered", qualifiedPool: 20, absenceAdjustedPool: 19, executionPeopleGap: 0, workloadHoursGapPerShift: 0, authorizedReviewers: 3, absenceAdjustedReviewers: 2, reviewerPeopleGap: 0, evidenceBasis: "controlled-qualification-record" }));
    const result = prioritizeCrossTraining(coverage, defaultCrossTrainingPriorityInput(coverage));
    expect(result.actions).toHaveLength(0);
    expect(result.signals[0].id).toBe("no-actions");
  });

  it("preserves the source scenario and expert boundary", () => {
    const coverage = scenario();
    const snapshot = structuredClone(coverage);
    const result = prioritizeCrossTraining(coverage, defaultCrossTrainingPriorityInput(coverage));
    expect(coverage).toEqual(snapshot);
    expect(result.ruleTrace[0].limitation).toContain("does not prove a global optimum");
    expect(result.boundary).toContain("not a training plan");
  });
});
