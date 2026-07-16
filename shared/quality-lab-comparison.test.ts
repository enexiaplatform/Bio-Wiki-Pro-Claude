import { describe, expect, it } from "vitest";
import { compareQualityLabScenarios } from "./quality-lab-comparison.js";
import { createQualityLabProject, defaultQualityLabInput } from "./quality-lab.js";

describe("quality lab scenario comparison", () => {
  it("traces changed assumptions into decision metrics and signals", () => {
    const baseline = createQualityLabProject({ ...defaultQualityLabInput, projectName: "Baseline" });
    const alternative = createQualityLabProject({
      ...defaultQualityLabInput,
      projectName: "Growth and second shift",
      growthRatePercent: 140,
      shifts: 2,
      equipmentDowntimePercent: 20,
    });
    const comparison = compareQualityLabScenarios(baseline, alternative);

    expect(comparison.inputChanges.map((item) => item.id)).toEqual(expect.arrayContaining(["growthRatePercent", "shifts", "equipmentDowntimePercent"]));
    expect(comparison.metrics.find((item) => item.id === "monthly-tests")?.delta).toBeGreaterThan(0);
    expect(comparison.signals.some((item) => item.relatedRuleIds.includes("core.capacity.people") || item.relatedRuleIds.includes("core.capacity.equipment"))).toBe(true);
    expect(comparison.engineVersions.comparable).toBe(true);
    expect(comparison.comparisonIntegrity.exportAllowed).toBe(true);
  });

  it("flags a changed outsourcing decision as an operational trade-off", () => {
    const baseline = createQualityLabProject({ ...defaultQualityLabInput, projectName: "In-house", outsourcePercent: 0, productProfiles: [] });
    const alternative = createQualityLabProject({ ...defaultQualityLabInput, projectName: "Outsource", outsourcePercent: 50, productProfiles: [] });
    const comparison = compareQualityLabScenarios(baseline, alternative);

    expect(comparison.signals.find((item) => item.id === "outsource-tradeoff")?.description).toContain("external queue time");
    expect(comparison.metrics.find((item) => item.id === "team-fte")?.delta).toBeLessThan(0);
  });

  it("captures nested portfolio changes as controlled scenario differences", () => {
    const baseline = createQualityLabProject({ ...defaultQualityLabInput, projectName: "Same project", scenarioLabel: "Baseline - tablet" });
    const alternative = createQualityLabProject({
      ...defaultQualityLabInput,
      projectName: "Same project",
      scenarioLabel: "Alternative - liquid",
      productProfiles: defaultQualityLabInput.productProfiles.map((product) => ({ ...product, dosageForm: "oral-liquid" })),
    });
    const comparison = compareQualityLabScenarios(baseline, alternative);

    expect(comparison.baseline.scenarioLabel).toBe("Baseline - tablet");
    expect(comparison.alternative.scenarioLabel).toBe("Alternative - liquid");
    expect(comparison.normalizedInputChanges.map((item) => item.id)).toEqual(expect.arrayContaining(["scenario-label", "product-profiles"]));
    expect(comparison.comparisonIntegrity.status).toBe("valid");
  });

  it("blocks export when two records have no controlled difference", () => {
    const baseline = createQualityLabProject({ ...defaultQualityLabInput, projectName: "Baseline" }, "baseline");
    const alternative = createQualityLabProject({ ...defaultQualityLabInput, projectName: "Baseline" }, "alternative");
    const comparison = compareQualityLabScenarios(baseline, alternative);

    expect(comparison.inputChanges).toHaveLength(0);
    expect(comparison.normalizedInputChanges).toHaveLength(0);
    expect(comparison.comparisonIntegrity.exportAllowed).toBe(false);
    expect(comparison.comparisonIntegrity.status).toBe("no-controlled-difference");
  });
});
