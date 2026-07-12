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
    expect(result.workforceCapacity?.current.totalTeamFte).toBe(result.current.totalTeamFte);
    expect(result.workforceCapacity?.current.baseExecutionFte).toBeLessThanOrEqual(result.current.analystFte);
    expect(result.workforceCapacity?.skillCoverage.some((item) => item.minimumQualifiedPeople === 2)).toBe(true);
    expect(result.workforceCapacity?.excludedLoads.map((item) => item.id)).toEqual(expect.arrayContaining(["investigations", "training-qualification", "method-lifecycle", "absence-shift"]));
    expect(result.consumableSupply?.current.length).toBe(result.consumables.length);
    expect(result.consumableSupply?.current.every((item) => item.grossMonthlyDemand >= item.netMonthlyDemand && item.targetStock === item.reorderPoint + item.safetyStock)).toBe(true);
    expect(result.ruleTrace.some((rule) => rule.ruleId === "core.turnaround.feasibility")).toBe(true);
    expect(result.unresolvedInputs.some((item) => item.id === "arrival-calendar-and-queues" && item.relatedRuleIds.includes("core.turnaround.feasibility"))).toBe(true);
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

  it("turns net consumable demand into an explicit replenishment and protected-stock basis", () => {
    const baseline = compileQualityLabBlueprint(defaultQualityLabInput);
    const protectedPlan = compileQualityLabBlueprint({ ...defaultQualityLabInput, consumableWastePercent: 20, consumableLeadTimeDays: 60, consumableSafetyStockDays: 45 });
    const baselineItem = baseline.consumableSupply!.current[0];
    const protectedItem = protectedPlan.consumableSupply!.current[0];
    expect(protectedItem.grossMonthlyDemand).toBeGreaterThan(baselineItem.grossMonthlyDemand);
    expect(protectedItem.reorderPoint).toBeGreaterThan(baselineItem.reorderPoint);
    expect(protectedItem.safetyStock).toBeGreaterThan(baselineItem.safetyStock);
    expect(protectedPlan.current.annualOpexLowUsd).toBeGreaterThan(baseline.current.annualOpexLowUsd);
    expect(protectedPlan.unresolvedInputs.some((item) => item.id === "consumable-supply-evidence")).toBe(true);
  });

  it("keeps role demand reconciled to workflow hours while exposing review and resilience separately", () => {
    const result = compileQualityLabBlueprint(defaultQualityLabInput);
    const workforce = result.workforceCapacity!;
    const executionRoleHours = workforce.current.roles.filter((role) => role.id !== "technical-review").reduce((total, role) => total + role.monthlyHours, 0);
    expect(executionRoleHours).toBeCloseTo(result.current.monthlyHandsOnHours, 0);
    expect(workforce.current.executionFte).toBeCloseTo(workforce.current.baseExecutionFte + workforce.current.resilienceReserveFte, 2);
    expect(workforce.current.totalTeamFte).toBeCloseTo(workforce.current.executionFte + workforce.current.reviewerFte, 2);
    expect(result.unresolvedInputs.some((item) => item.id === "skill-shift-coverage" && item.relatedRuleIds.includes("core.capacity.people"))).toBe(true);
  });

  it("compiles a product-level non-sterile method graph and method BOM", () => {
    const result = compileQualityLabBlueprint(defaultQualityLabInput);
    expect(result.methodRequirements.some((item) => item.requirementType === "microbial-enumeration")).toBe(true);
    expect(result.methodRequirements.some((item) => item.requirementType === "specified-microorganisms")).toBe(true);
    expect(result.methodRequirements.some((item) => item.requirementType === "method-suitability")).toBe(true);
    expect(result.methodBom.some((item) => item.category === "media" && item.quantityPerMonth > 0)).toBe(true);
    expect(result.methodBom.every((item) => item.status === "site-confirmation-required")).toBe(true);
    expect(result.methodCapacitySummary.some((item) => item.resourceId === "incubator-20-25" && item.monthlyDemand > 0)).toBe(true);
    expect(result.methodCapacitySummary.every((item) => item.peakWeekDemand > item.monthlyDemand / 4.33)).toBe(true);
  });

  it("does not fabricate a method graph for another domain pack", () => {
    const result = compileQualityLabBlueprint({ ...defaultQualityLabInput, facilityType: "food-beverage" });
    expect(result.methodRequirements).toEqual([]);
    expect(result.methodBom).toEqual([]);
    expect(result.methodCapacitySummary).toEqual([]);
  });

  it("removes method-derived site load when a product method is outsourced", () => {
    const result = compileQualityLabBlueprint({
      ...defaultQualityLabInput,
      productProfiles: defaultQualityLabInput.productProfiles.map((product) => ({ ...product, execution: "outsource" as const })),
    });
    expect(result.methodRequirements.length).toBeGreaterThan(0);
    expect(result.methodCapacity).toEqual([]);
    expect(result.methodCapacitySummary).toEqual([]);
  });

  it("keeps product, market and execution trace distinct across a portfolio", () => {
    const result = compileQualityLabBlueprint({
      ...defaultQualityLabInput,
      markets: ["vietnam", "asean"],
      productProfiles: [
        { ...defaultQualityLabInput.productProfiles[0], id: "solid", name: "Solid oral family", markets: ["vietnam"], monthlyBatches: 10, specifiedOrganismsRequired: false, execution: "in-house" },
        { ...defaultQualityLabInput.productProfiles[0], id: "liquid", name: "Oral liquid family", dosageForm: "oral-liquid", markets: ["asean"], monthlyBatches: 20, specifiedOrganismsRequired: true, execution: "outsource" },
      ],
    });
    expect(result.methodRequirements.some((item) => item.productName === "Solid oral family" && item.market === "vietnam" && item.execution === "in-house")).toBe(true);
    expect(result.methodRequirements.some((item) => item.productName === "Oral liquid family" && item.market === "asean" && item.execution === "outsource")).toBe(true);
    expect(result.methodCapacity.every((item) => item.productName === "Solid oral family")).toBe(true);
  });

  it("does not multiply physical load across markets until allocation is declared", () => {
    const base = { ...defaultQualityLabInput.productProfiles[0], markets: ["vietnam", "asean"] as const, preservativeOrNeutralizerNote: "Neutralizer to be confirmed" };
    const unresolved = compileQualityLabBlueprint({ ...defaultQualityLabInput, markets: ["vietnam", "asean"], productProfiles: [{ ...base, marketExecutionStrategy: "unknown" }] });
    expect(unresolved.methodRequirements.filter((item) => item.requirementType === "microbial-enumeration")).toHaveLength(2);
    expect(unresolved.methodCapacity).toEqual([]);
    expect(unresolved.methodBom.filter((item) => item.category === "neutralizer").every((item) => item.quantityPerMonth === 0)).toBe(true);
    expect(unresolved.unresolvedInputs.some((item) => item.id === "market-execution-allocation")).toBe(true);

    const shared = compileQualityLabBlueprint({ ...defaultQualityLabInput, markets: ["vietnam", "asean"], productProfiles: [{ ...base, marketExecutionStrategy: "shared-across-markets" }] });
    expect(shared.methodRequirements.filter((item) => item.requirementType === "microbial-enumeration").map((item) => item.allocatedMonthlyExecutions)).toEqual([30, 0]);
  });

  it("uses complete portfolio execution decisions for finished-product workflow sizing", () => {
    const result = compileQualityLabBlueprint({
      ...defaultQualityLabInput,
      finishedBatchesPerMonth: 99,
      outsourcePercent: 50,
      portfolioIsComplete: true,
      productProfiles: [
        { ...defaultQualityLabInput.productProfiles[0], id: "in-house", monthlyBatches: 12, execution: "in-house" },
        { ...defaultQualityLabInput.productProfiles[0], id: "outsource", monthlyBatches: 8, execution: "outsource" },
      ],
    });
    const workflow = result.workflows.find((item) => item.id === "finished-product-mlt");
    expect(result.finishedProductDemand.source).toBe("portfolio-derived");
    expect(result.finishedProductDemand.effectiveInHouseBatches).toBe(12);
    expect(workflow?.monthlyUnits).toBe(12);
  });

  it("traces method-driven equipment back to requirements and evidence", () => {
    const result = compileQualityLabBlueprint(defaultQualityLabInput);
    const incubator = result.equipment.find((item) => item.id === "incubator-20-25");
    expect(incubator?.methodRequirementIds.length).toBeGreaterThan(0);
    expect(incubator?.evidenceIds).toContain("usp-61-context");
    expect(incubator?.methodLoadBasis.some((item) => item.includes("Finished-product sizing source"))).toBe(true);
  });

  it("uses product dilution and incubation inputs in method-level planning", () => {
    const standard = compileQualityLabBlueprint(defaultQualityLabInput);
    const adjusted = compileQualityLabBlueprint({ ...defaultQualityLabInput, productProfiles: defaultQualityLabInput.productProfiles.map((product) => ({ ...product, dilutionVolumeMl: 250, incubationProfile: "extended" })) });
    expect(adjusted.methodBom.find((item) => item.category === "diluent")?.quantityPerExecution).toBe(250);
    expect(adjusted.methodBom.find((item) => item.category === "sample")?.quantityPerExecution).toBe(10);
    expect(adjusted.methodCapacity.find((item) => item.resourceId === "incubator-20-25")?.monthlyDemand).toBeGreaterThan(standard.methodCapacity.find((item) => item.resourceId === "incubator-20-25")?.monthlyDemand ?? 0);
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
