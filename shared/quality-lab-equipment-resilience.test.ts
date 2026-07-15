import { describe, expect, it } from "vitest";
import { createQualityLabProject, defaultQualityLabInput } from "./quality-lab.js";
import { defaultEquipmentResilienceInput, evaluateEquipmentResilience } from "./quality-lab-equipment-resilience.js";

describe("Quality Lab equipment resilience", () => {
  it("exposes single-unit critical resources as single points of failure", () => {
    const project = createQualityLabProject({ ...defaultQualityLabInput, projectName: "Resilience baseline" });
    const input = defaultEquipmentResilienceInput(project);
    const result = evaluateEquipmentResilience(project, input);

    expect(result.resources.length).toBeGreaterThan(0);
    expect(result.resources.some((resource) => resource.installedUnits === 1 && resource.status === "single-point-failure")).toBe(true);
    expect(result.summary.nPlusOneGapUnits).toBeGreaterThan(0);
    expect(result.boundary).toContain("not purchase quantities");
  });

  it("shows N+1 continuity when enough independent units are configured", () => {
    const project = createQualityLabProject({ ...defaultQualityLabInput, projectName: "N plus one" });
    const base = defaultEquipmentResilienceInput(project);
    const first = evaluateEquipmentResilience(project, base);
    const resources = base.resources.map((configuration) => {
      const result = first.resources.find((resource) => resource.resourceId === configuration.resourceId)!;
      return { ...configuration, installedUnits: result.minimumUnitsNPlusOne, largestConcurrentLoad: Math.min(configuration.largestConcurrentLoad, configuration.capacityPerUnitPerDay * configuration.usableCapacityPercent / 100) };
    });
    const resilient = evaluateEquipmentResilience(project, { ...base, resources });

    expect(resilient.resources.every((resource) => resource.failureUtilizationPercent !== null && resource.failureUtilizationPercent <= 100)).toBe(true);
    expect(resilient.resources.every((resource) => resource.status === "resilient")).toBe(true);
    expect(resilient.summary.nPlusOneGapUnits).toBe(0);
  });

  it("fails geometry independently from aggregate unit count", () => {
    const project = createQualityLabProject({ ...defaultQualityLabInput, projectName: "Geometry check" });
    const base = defaultEquipmentResilienceInput(project);
    const target = base.resources[0];
    const resources = base.resources.map((configuration) => configuration.resourceId === target.resourceId ? { ...configuration, installedUnits: 10, largestConcurrentLoad: configuration.capacityPerUnitPerDay * 2 } : configuration);
    const result = evaluateEquipmentResilience(project, { ...base, resources });
    const failed = result.resources.find((resource) => resource.resourceId === target.resourceId)!;

    expect(failed.status).toBe("geometry-fail");
    expect(failed.geometryMargin).toBeLessThan(0);
  });
});
