import { describe, expect, it } from "vitest";
import { createQualityLabProject, defaultQualityLabInput } from "./quality-lab.js";
import { analyzeQualityLabSensitivity, QUALITY_LAB_ROBUSTNESS_CONTRACT_VERSION } from "./quality-lab-sensitivity.js";

describe("Quality Lab sensitivity and evidence confidence", () => {
  it("ranks independent input perturbations without mutating the project", () => {
    const project = createQualityLabProject({ ...defaultQualityLabInput, projectName: "Sensitivity test" });
    const original = JSON.stringify(project.input);
    const result = analyzeQualityLabSensitivity(project);

    expect(result.drivers.length).toBeGreaterThan(8);
    expect(result.summary.dominantDriverId).toBe(result.drivers[0].id);
    expect(result.drivers.every((driver) => driver.outcomes.length === result.metrics.length)).toBe(true);
    expect(JSON.stringify(project.input)).toBe(original);
  });

  it("shows workload demand moving when finished batches are stressed", () => {
    const project = createQualityLabProject({ ...defaultQualityLabInput, projectName: "Demand sensitivity" });
    const result = analyzeQualityLabSensitivity(project);
    const driver = result.drivers.find((item) => item.id === "finishedBatchesPerMonth")!;
    const hours = driver.outcomes.find((item) => item.metricId === "future-hands-on-hours")!;

    expect(driver.lowValue).toBeLessThan(driver.baselineValue);
    expect(driver.highValue).toBeGreaterThan(driver.baselineValue);
    expect(hours.low).toBeLessThan(hours.high);
    expect(hours.swingPercent).toBeGreaterThan(0);
  });

  it("elevates influential unresolved assumptions into the verification queue", () => {
    const project = createQualityLabProject({
      ...defaultQualityLabInput,
      projectName: "Evidence priority",
      finishedProducts: 12,
      finishedBatchesPerMonth: 0,
      productProfiles: [],
    });
    const result = analyzeQualityLabSensitivity(project);
    const finishedDemand = result.drivers.find((item) => item.id === "finishedBatchesPerMonth")!;

    expect(result.summary.openBlockingInputCount).toBeGreaterThan(0);
    expect(finishedDemand.relatedUnresolvedInputIds).toContain("finished-batch-demand");
    expect(result.ruleTrace[0].limitations).toContain("interactions");
    expect(result.boundary).toContain("not a probabilistic risk model");
  });

  it("finds bounded decision thresholds and connects them to inputs and lineage", () => {
    const project = createQualityLabProject({ ...defaultQualityLabInput, projectName: "Threshold trace" });
    const result = analyzeQualityLabSensitivity(project);
    const driver = result.drivers.find((item) => item.id === "finishedBatchesPerMonth")!;
    const staffing = driver.outcomes.find((item) => item.metricId === "future-team-fte")!;
    const threshold = staffing.thresholds[0];

    expect(result.robustnessContractVersion).toBe(QUALITY_LAB_ROBUSTNESS_CONTRACT_VERSION);
    expect(threshold).toBeDefined();
    expect(threshold.inputValue).toBeGreaterThanOrEqual(driver.lowValue);
    expect(threshold.inputValue).toBeLessThanOrEqual(driver.highValue);
    expect(threshold.distancePercentOfTestRange).toBeGreaterThanOrEqual(0);
    expect(threshold.distancePercentOfTestRange).toBeLessThanOrEqual(100);
    expect(staffing.lineageIds).toContain("decision:staffing:future-total-team-fte");
    expect(driver.inputPath).toBe("finishedBatchesPerMonth");
    expect(driver.plannerStep).toBe(1);
  });

  it("classifies robustness only inside the explicit tested range", () => {
    const project = createQualityLabProject({ ...defaultQualityLabInput, projectName: "Robustness labels" });
    const result = analyzeQualityLabSensitivity(project);
    const stable = result.drivers.find((item) => item.id === "consumableWastePercent")!;

    expect(result.summary.fragileDriverCount + result.summary.conditionalDriverCount + result.summary.robustDriverCount).toBe(result.drivers.length);
    expect(stable.robustnessClass).toBe("robust-in-tested-range");
    expect(stable.nearestThreshold).toBeNull();
    expect(stable.whatToConfirmNext).toContain("no displayed decision threshold was found inside");
  });

  it("produces deterministic threshold outputs for the same project input", () => {
    const project = createQualityLabProject({ ...defaultQualityLabInput, projectName: "Deterministic thresholds" });
    const first = analyzeQualityLabSensitivity(project);
    const second = analyzeQualityLabSensitivity(project);

    expect(second.metrics).toEqual(first.metrics);
    expect(second.drivers).toEqual(first.drivers);
    expect(second.verificationQueue.map((item) => item.id)).toEqual(first.verificationQueue.map((item) => item.id));
  });
});
