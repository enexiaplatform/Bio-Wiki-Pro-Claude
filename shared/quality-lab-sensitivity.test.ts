import { describe, expect, it } from "vitest";
import { createQualityLabProject, defaultQualityLabInput } from "./quality-lab.js";
import { analyzeQualityLabSensitivity } from "./quality-lab-sensitivity.js";

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
});
