import { describe, expect, it } from "vitest";
import { createQualityLabProject, defaultQualityLabInput } from "./quality-lab.js";
import { defaultSkillShiftFeasibilityInput, evaluateSkillShiftFeasibility } from "./quality-lab-skill-coverage.js";

function project() {
  return createQualityLabProject({ ...defaultQualityLabInput, projectName: "Skill coverage test" });
}

describe("Quality Lab skill and shift feasibility", () => {
  it("exposes single-person shift and reviewer dependencies in the illustrative default", () => {
    const item = project();
    const input = defaultSkillShiftFeasibilityInput(item);
    const result = evaluateSkillShiftFeasibility(item, input);

    expect(result.engineVersion).toBe("skill-shift-feasibility/v1.0");
    expect(result.workflows.length).toBeGreaterThan(0);
    expect(result.summary.failingCount).toBeGreaterThan(0);
    expect(result.summary.reviewerPeopleGap).toBeGreaterThan(0);
    expect(result.signals.some((signal) => signal.id === "evidence-open")).toBe(true);
  });

  it("passes structural coverage when qualified execution and reviewer backups are controlled", () => {
    const item = project();
    const input = defaultSkillShiftFeasibilityInput(item);
    input.peakShiftFactor = 1;
    input.workflows = input.workflows.map((workflow) => ({
      ...workflow,
      qualifiedPeople: 20,
      crossTrainedBackupPeople: 1,
      peopleScheduledPerShift: 10,
      authorizedReviewers: 3,
      evidenceBasis: "controlled-qualification-record" as const,
    }));
    const result = evaluateSkillShiftFeasibility(item, input);

    expect(result.overallStatus).toBe("covered");
    expect(result.summary.failingCount).toBe(0);
    expect(result.summary.controlledEvidenceCount).toBe(result.summary.workflowCount);
    expect(result.signals.some((signal) => signal.id === "coverage-pass")).toBe(true);
  });

  it("separates concurrent shift coverage from aggregate qualified headcount", () => {
    const item = createQualityLabProject({ ...defaultQualityLabInput, projectName: "Multi shift", shifts: 3 });
    const input = defaultSkillShiftFeasibilityInput(item);
    input.absenceScenarioPeople = 1;
    input.workflows = input.workflows.map((workflow) => ({ ...workflow, qualifiedPeople: 2, activeShifts: 3, peopleScheduledPerShift: 1, authorizedReviewers: 4 }));
    const result = evaluateSkillShiftFeasibility(item, input);

    expect(result.workflows.some((workflow) => workflow.status === "shift-gap")).toBe(true);
    expect(result.summary.executionPeopleGap).toBeGreaterThan(0);
  });

  it("does not mutate the supplied scenario and preserves the expert boundary", () => {
    const item = project();
    const input = defaultSkillShiftFeasibilityInput(item);
    const snapshot = structuredClone(input);
    const result = evaluateSkillShiftFeasibility(item, input);

    expect(input).toEqual(snapshot);
    expect(result.ruleTrace[0].ruleId).toBe("core.workforce.skill-shift");
    expect(result.boundary).toContain("not a training record");
  });
});
