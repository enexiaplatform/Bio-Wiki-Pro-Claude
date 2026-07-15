import { describe, expect, it } from "vitest";
import { createQualityLabProject, defaultQualityLabInput } from "./quality-lab.js";
import { defaultTurnaroundFeasibilityInput, evaluateTurnaroundFeasibility } from "./quality-lab-turnaround.js";

describe("turnaround feasibility engine", () => {
  it("separates technical duration from operational delay", () => {
    const project = createQualityLabProject({ ...defaultQualityLabInput, projectName: "Turnaround baseline" });
    const result = evaluateTurnaroundFeasibility(project, defaultTurnaroundFeasibilityInput(project));
    const finishedProduct = result.workflows.find((workflow) => workflow.id === "finished-product-mlt");

    expect(finishedProduct?.modeledTurnaroundDays).toBeGreaterThan(finishedProduct?.technicalDurationDays ?? 0);
    expect(finishedProduct?.relatedRuleIds).toContain("core.turnaround.feasibility");
    expect(result.boundary).toContain("does not schedule individual samples");
  });

  it("does not improve queue allowances when capacity is removed", () => {
    const project = createQualityLabProject({ ...defaultQualityLabInput, projectName: "Capacity sensitivity", finishedBatchesPerMonth: 100, productProfiles: [] });
    const base = defaultTurnaroundFeasibilityInput(project);
    const constrained = evaluateTurnaroundFeasibility(project, { ...base, analystFteAvailable: 0.5, reviewerFteAvailable: 0.2 });
    const reinforced = evaluateTurnaroundFeasibility(project, { ...base, analystFteAvailable: 12, reviewerFteAvailable: 3 });

    expect(constrained.executionLoad.queueAllowanceDays).toBeGreaterThanOrEqual(reinforced.executionLoad.queueAllowanceDays);
    expect(constrained.overallStatus).toBe("capacity-overload");
  });

  it("makes campaign arrivals no less conservative than level arrivals", () => {
    const project = createQualityLabProject({ ...defaultQualityLabInput, projectName: "Arrival sensitivity" });
    const base = defaultTurnaroundFeasibilityInput(project);
    const level = evaluateTurnaroundFeasibility(project, { ...base, arrivalPattern: "level" });
    const campaign = evaluateTurnaroundFeasibility(project, { ...base, arrivalPattern: "campaign" });

    expect(campaign.executionLoad.peakDayHours).toBeGreaterThan(level.executionLoad.peakDayHours);
    expect(campaign.executionLoad.queueAllowanceDays).toBeGreaterThanOrEqual(level.executionLoad.queueAllowanceDays);
  });
});
