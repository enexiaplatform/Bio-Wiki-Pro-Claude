import { describe, expect, it } from "vitest";
import { createBlankQualityLabInput } from "./quality-lab.js";
import { applyQualityLabDemandPreset, applyQualityLabOperatingPreset, suggestQualityLabDecision, suggestQualityLabScope } from "./quality-lab-guidance.js";

describe("Quality Lab guided intake", () => {
  it("turns a demand pattern into a suggested capability scope", () => {
    const input = applyQualityLabDemandPreset(createBlankQualityLabInput(), "growing-site");
    expect(input.finishedBatchesPerMonth).toBe(30);
    expect(input.scope.finishedProducts).toBe(true);
    expect(input.scope.water).toBe(true);
    expect(input.scope.sterility).toBe(false);
  });

  it("does not suggest inactive capabilities", () => {
    const input = createBlankQualityLabInput();
    expect(suggestQualityLabScope(input)).toEqual({ rawMaterials: false, finishedProducts: false, water: false, environmentalMonitoring: false, sterility: false, endotoxin: false, bioburden: false, growthPromotion: false });
  });

  it("frames a decision from project intent and country", () => {
    const input = { ...createBlankQualityLabInput(), country: "Vietnam", projectIntent: "insource-outsource" as const };
    expect(suggestQualityLabDecision(input)).toContain("perform in-house, outsource or phase later");
    expect(suggestQualityLabDecision(input)).toContain("Vietnam site");
  });

  it("applies a balanced operating assumption set without changing project identity", () => {
    const input = { ...createBlankQualityLabInput(), projectName: "Site A" };
    const result = applyQualityLabOperatingPreset(input, "balanced");
    expect(result.projectName).toBe("Site A");
    expect(result.redundancyPercent).toBe(20);
    expect(result.consumableLeadTimeDays).toBe(45);
  });
});
