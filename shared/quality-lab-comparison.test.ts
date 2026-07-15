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
  });

  it("flags a changed outsourcing decision as an operational trade-off", () => {
    const baseline = createQualityLabProject({ ...defaultQualityLabInput, projectName: "In-house", outsourcePercent: 0, productProfiles: [] });
    const alternative = createQualityLabProject({ ...defaultQualityLabInput, projectName: "Outsource", outsourcePercent: 50, productProfiles: [] });
    const comparison = compareQualityLabScenarios(baseline, alternative);

    expect(comparison.signals.find((item) => item.id === "outsource-tradeoff")?.description).toContain("external queue time");
    expect(comparison.metrics.find((item) => item.id === "team-fte")?.delta).toBeLessThan(0);
  });
});
