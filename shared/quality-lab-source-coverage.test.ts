import { describe, expect, it } from "vitest";
import {
  MICROBIOLOGY_DOMAIN_PACK,
  MICROBIOLOGY_EVIDENCE_CATALOG,
  MICROBIOLOGY_SHARED_RULE_TRACE,
  workflowRuleTrace,
} from "./quality-lab-microbiology-pack";
import {
  assessSourceCoverage,
  classifyEvidenceControl,
  createSourceCoverageRegistry,
} from "./quality-lab-source-coverage";

const allWorkflowKeys = [
  "rawMaterials",
  "finishedProducts",
  "water",
  "environmentalMonitoring",
  "sterility",
  "endotoxin",
  "bioburden",
  "growthPromotion",
] as const;

const assessment = assessSourceCoverage({
  domainPack: MICROBIOLOGY_DOMAIN_PACK,
  evidence: MICROBIOLOGY_EVIDENCE_CATALOG,
  rules: [...workflowRuleTrace([...allWorkflowKeys]), ...MICROBIOLOGY_SHARED_RULE_TRACE],
  generatedAt: "2026-07-14T00:00:00.000Z",
});

describe("Quality Lab source coverage", () => {
  it("resolves every current microbiology rule to the evidence catalog", () => {
    expect(assessment.metrics).toMatchObject({
      evidenceRecordCount: 7,
      ruleCount: 14,
      catalogTraceableRuleCount: 14,
      missingEvidenceLinkCount: 0,
      duplicateEvidenceIdCount: 0,
      duplicateRuleIdCount: 0,
    });
    expect(assessment.rules.every((rule) => rule.catalogTraceable)).toBe(true);
  });

  it("does not mistake catalog traceability for controlled evidence closure", () => {
    expect(assessment.metrics.controlledReviewReadyRuleCount).toBe(0);
    expect(assessment.metrics.openEvidenceCount).toBe(6);
    expect(assessment.metrics.controlledEvidenceCount).toBe(1);
    expect(assessment.blockers).toEqual(expect.arrayContaining([
      expect.stringMatching(/applicable edition/i),
      expect.stringMatching(/site-approved methods/i),
      expect.stringMatching(/concept benchmarks/i),
      expect.stringMatching(/named revision/i),
    ]));
  });

  it("flags missing evidence links as a structural catalog defect", () => {
    const broken = assessSourceCoverage({
      domainPack: MICROBIOLOGY_DOMAIN_PACK,
      evidence: MICROBIOLOGY_EVIDENCE_CATALOG,
      rules: [{ ...MICROBIOLOGY_SHARED_RULE_TRACE[0], evidenceIds: ["missing-record"] }],
      generatedAt: "2026-07-14T00:00:00.000Z",
    });
    expect(broken.rules[0]).toMatchObject({ catalogTraceable: false, controlledReviewReady: false, missingEvidenceIds: ["missing-record"] });
    expect(broken.blockers[0]).toMatch(/do not resolve/i);
  });

  it("detects duplicate evidence and rule identifiers", () => {
    const duplicated = assessSourceCoverage({
      domainPack: MICROBIOLOGY_DOMAIN_PACK,
      evidence: [MICROBIOLOGY_EVIDENCE_CATALOG[0], MICROBIOLOGY_EVIDENCE_CATALOG[0]],
      rules: [MICROBIOLOGY_SHARED_RULE_TRACE[0], MICROBIOLOGY_SHARED_RULE_TRACE[0]],
      generatedAt: "2026-07-14T00:00:00.000Z",
    });
    expect(duplicated.metrics).toMatchObject({ duplicateEvidenceIdCount: 1, duplicateRuleIdCount: 1 });
    expect(duplicated.blockers).toEqual(expect.arrayContaining([expect.stringMatching(/duplicate evidence/i), expect.stringMatching(/duplicate rule/i)]));
  });

  it("exports a controlled working registry without a verification claim", () => {
    const registry = createSourceCoverageRegistry(assessment);
    expect(registry).toMatchObject({
      documentType: "Atlas Quality Lab source coverage registry",
      controlStatus: "working-control-record",
      domainPack: { status: "concept" },
    });
    expect(registry.controlNotice).toMatch(/does not verify/i);
  });

  it("classifies an identified and versioned public reference as context only", () => {
    const annex = MICROBIOLOGY_EVIDENCE_CATALOG.find((record) => record.id === "eu-gmp-annex-1-2022")!;
    expect(classifyEvidenceControl(annex)).toMatchObject({ controlState: "controlled-context", openForControlledRelease: false });
  });
});
