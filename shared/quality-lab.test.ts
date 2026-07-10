import { describe, expect, it } from "vitest";
import { compileQualityLabBlueprint, defaultQualityLabInput, qualityLabInputSchema } from "./quality-lab";

describe("quality lab compiler", () => {
  it("compiles the default non-sterile scenario", () => {
    const result = compileQualityLabBlueprint(defaultQualityLabInput);
    expect(result.workflows.length).toBeGreaterThanOrEqual(4);
    expect(result.current.monthlyTests).toBeGreaterThan(0);
    expect(result.current.analystFte).toBeGreaterThanOrEqual(2);
    expect(result.equipment.some((item) => item.id === "incubator-20-25")).toBe(true);
    expect(result.equipment.some((item) => item.id === "incubator-30-35")).toBe(true);
    expect(result.future.monthlyTests).toBeGreaterThan(result.current.monthlyTests);
    expect(result.assumptions.some((item) => item.confidence === "indicative")).toBe(true);
  });

  it("flags a release target shorter than conventional incubation", () => {
    const result = compileQualityLabBlueprint({ ...defaultQualityLabInput, targetTurnaroundDays: 3 });
    expect(result.risks.some((risk) => risk.id === "tat-incubation" && risk.severity === "high")).toBe(true);
  });

  it("adds sterile equipment only when sterility is in scope", () => {
    const withoutSterility = compileQualityLabBlueprint(defaultQualityLabInput);
    const withSterility = compileQualityLabBlueprint({
      ...defaultQualityLabInput,
      facilityType: "sterile-pharma",
      sterilityBatchesPerMonth: 20,
      scope: { ...defaultQualityLabInput.scope, sterility: true, environmentalMonitoring: true },
    });
    expect(withoutSterility.equipment.some((item) => item.id === "sterility-isolator")).toBe(false);
    expect(withSterility.equipment.some((item) => item.id === "sterility-isolator")).toBe(true);
  });

  it("rejects projects with no target market", () => {
    const parsed = qualityLabInputSchema.safeParse({ ...defaultQualityLabInput, markets: [] });
    expect(parsed.success).toBe(false);
  });
});
