import { describe, expect, it } from "vitest";
import {
  QUALITY_LAB_BLUEPRINT_CONTRACT_VERSION,
  QUALITY_LAB_COMPILER_CORE_VERSION,
  QUALITY_LAB_INPUT_CONTRACT_VERSION,
  compileQualityLabBlueprint,
  defaultQualityLabInput,
  qualityLabBlueprintSchema,
  qualityLabInputSchema,
} from "./quality-lab";

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
    expect(result.contractVersion).toBe(QUALITY_LAB_BLUEPRINT_CONTRACT_VERSION);
    expect(result.compilerCoreVersion).toBe(QUALITY_LAB_COMPILER_CORE_VERSION);
    expect(result.input.contractVersion).toBe(QUALITY_LAB_INPUT_CONTRACT_VERSION);
    expect(qualityLabBlueprintSchema.safeParse(result).success).toBe(true);
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

  it("migrates a legacy v1 input that has no contract version", () => {
    const { contractVersion: _removed, ...legacyInput } = defaultQualityLabInput;
    const parsed = qualityLabInputSchema.parse(legacyInput);
    expect(parsed.contractVersion).toBe(QUALITY_LAB_INPUT_CONTRACT_VERSION);
  });

  it("traces every workflow rule to registered evidence", () => {
    const result = compileQualityLabBlueprint(defaultQualityLabInput);
    const evidenceIds = new Set(result.evidence.map((record) => record.id));
    const tracedRuleIds = new Set(result.ruleTrace.map((rule) => rule.ruleId));
    for (const workflow of result.workflows) {
      expect(tracedRuleIds.has(workflow.ruleId)).toBe(true);
      for (const evidenceId of workflow.evidenceIds) expect(evidenceIds.has(evidenceId)).toBe(true);
    }
    for (const rule of result.ruleTrace) {
      for (const evidenceId of rule.evidenceIds) expect(evidenceIds.has(evidenceId)).toBe(true);
    }
  });

  it("keeps concept review blocked until site evidence is resolved", () => {
    const result = compileQualityLabBlueprint(defaultQualityLabInput);
    expect(result.review.status).toBe("concept-only");
    expect(result.review.lastReviewedAt).toBeNull();
    expect(result.dataQuality.blockingOpenCount).toBeGreaterThan(0);
    expect(result.review.blockingInputIds).toEqual(
      result.unresolvedInputs.filter((item) => item.severity === "blocking").map((item) => item.id),
    );
    expect(result.evidence.some((record) => record.status === "site-evidence-required")).toBe(true);
  });
});
