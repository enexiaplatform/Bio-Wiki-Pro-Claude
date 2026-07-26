import { describe, expect, it } from "vitest";
import { createQualityLabProject, defaultQualityLabInput } from "./quality-lab";
import {
  analyzeQualityLabOperatingModel,
  createQualityLabOperatingModelInput,
  validateQualityLabOperatingModelIntegrity,
  type QualityLabOperatingModelApplicationInput,
} from "./quality-lab-operating-model";

const NOW = "2026-07-26T02:00:00.000Z";

function completeApplication(
  input: QualityLabOperatingModelApplicationInput,
  overrides: Partial<QualityLabOperatingModelApplicationInput> = {},
): QualityLabOperatingModelApplicationInput {
  return {
    ...input,
    externalPricePerTestUsd: 100,
    externalTurnaroundDays: 2,
    sampleHoldTimeDays: 5,
    methodTransferCostUsd: 0,
    internalCapability: "confirmed",
    methodReadiness: "ready",
    externalLabQualified: "yes",
    backupExternalCoverage: "yes",
    dataAccess: "full",
    investigationResponsiveness: "comparable",
    surgeCapacity: "both",
    continuityPriority: "high",
    strategicControl: "high",
    confidentiality: "standard",
    ...overrides,
  };
}

describe("Quality Lab application operating-model analysis", () => {
  it("withholds recommendations and asks exact evidence questions by default", () => {
    const project = createQualityLabProject(defaultQualityLabInput, "qlp_operating_model_open");
    const analysis = analyzeQualityLabOperatingModel(project, undefined, NOW);

    expect(analysis.contractVersion).toBe("quality-lab-operating-model/v1");
    expect(analysis.applications.length).toBeGreaterThan(0);
    expect(analysis.summary.evidenceRequired).toBe(analysis.applications.length);
    expect(analysis.applications[0]).toMatchObject({
      recommendedMode: "evidence-required",
      decisionStatus: "material-evidence-missing",
    });
    expect(analysis.applications[0].missingEvidence).toEqual(expect.arrayContaining([
      expect.objectContaining({ field: "externalPricePerTestUsd", blocking: true }),
      expect.objectContaining({ field: "externalTurnaroundDays", blocking: true }),
      expect.objectContaining({ field: "externalLabQualified", blocking: true }),
    ]));
    expect(analysis.applications[0].lineage).toMatchObject({
      decisionType: "operating-model",
      currentOutput: "evidence-required",
    });
    expect(analysis.applications[0].lineage.unresolvedInputIds.length).toBeGreaterThan(0);
    expect(analysis.applications[0].lineage.evidenceRefs).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "vendor-budget-evidence" }),
    ]));
  });

  it("selects insource when the external route is explicitly infeasible", () => {
    const project = createQualityLabProject(defaultQualityLabInput, "qlp_operating_model_insource");
    const input = createQualityLabOperatingModelInput(project, undefined, NOW);
    input.applications = input.applications.map((application) => completeApplication(application, {
      externalLabQualified: "no",
      investigationResponsiveness: "internal-faster",
      surgeCapacity: "internal",
    }));

    const analysis = analyzeQualityLabOperatingModel(project, input, NOW);
    expect(analysis.summary.insource).toBe(analysis.applications.length);
    expect(analysis.summary.evidenceRequired).toBe(0);
    expect(analysis.applications.every((application) => application.missingEvidence.length === 0)).toBe(true);
  });

  it("selects outsource when internal capability is explicitly unavailable", () => {
    const project = createQualityLabProject(defaultQualityLabInput, "qlp_operating_model_outsource");
    const input = createQualityLabOperatingModelInput(project, undefined, NOW);
    input.applications = input.applications.map((application) => completeApplication(application, {
      internalCapability: "not-available",
      investigationResponsiveness: "external-faster",
      surgeCapacity: "external",
    }));

    const analysis = analyzeQualityLabOperatingModel(project, input, NOW);
    expect(analysis.summary.outsource).toBe(analysis.applications.length);
    expect(analysis.summary.evidenceRequired).toBe(0);
  });

  it("supports a hybrid conclusion with complete evidence and balanced routes", () => {
    const project = createQualityLabProject(defaultQualityLabInput, "qlp_operating_model_hybrid");
    const input = createQualityLabOperatingModelInput(project, undefined, NOW);
    input.applications = input.applications.map((application) => completeApplication(application, {
      externalPricePerTestUsd: 1,
      surgeCapacity: "both",
    }));

    const analysis = analyzeQualityLabOperatingModel(project, input, NOW);
    expect(analysis.summary.hybrid).toBe(analysis.applications.length);
    expect(analysis.summary.evidenceRequired).toBe(0);
    expect(analysis.applications[0].economics.economicPosition).toBe("not-calculable");
  });

  it("detects broken rule traceability", () => {
    const project = createQualityLabProject(defaultQualityLabInput, "qlp_operating_model_tamper");
    const analysis = analyzeQualityLabOperatingModel(project, undefined, NOW);
    analysis.ruleTrace = analysis.ruleTrace.filter((rule) => rule.ruleId !== "quality-lab.operating-model.application");

    expect(() => validateQualityLabOperatingModelIntegrity(project, analysis)).toThrow(/Missing rule trace/i);
  });
});
