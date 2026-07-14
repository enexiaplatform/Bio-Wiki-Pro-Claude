import { describe, expect, it } from "vitest";
import { assessExpertOwnership, createMicrobiologyExpertOwnerRoles } from "./quality-lab-expert-ownership";
import { assessGate2Release, createGate2ReleaseDossier } from "./quality-lab-gate-2-release";
import { MICROBIOLOGY_DOMAIN_PACK, MICROBIOLOGY_EVIDENCE_CATALOG, MICROBIOLOGY_SHARED_RULE_TRACE, workflowRuleTrace, type MicrobiologyWorkflowKey } from "./quality-lab-microbiology-pack";
import { assessSourceCoverage } from "./quality-lab-source-coverage";

const workflowKeys: MicrobiologyWorkflowKey[] = ["rawMaterials", "finishedProducts", "water", "environmentalMonitoring", "sterility", "endotoxin", "bioburden", "growthPromotion"];
const rules = [...workflowRuleTrace(workflowKeys), ...MICROBIOLOGY_SHARED_RULE_TRACE];
const sourceCoverage = assessSourceCoverage({ domainPack: MICROBIOLOGY_DOMAIN_PACK, evidence: MICROBIOLOGY_EVIDENCE_CATALOG, rules, generatedAt: "2026-07-14T00:00:00.000Z" });
const expertOwnership = assessExpertOwnership({ domainPack: MICROBIOLOGY_DOMAIN_PACK, ruleTrace: rules, roles: createMicrobiologyExpertOwnerRoles(rules), generatedAt: "2026-07-14T00:00:00.000Z" });

const emptyValidation = { status: "not-started" as const, eligibleCount: 0, targetCount: 3, coveredRuleCount: 0, portfolioBlockers: ["3 additional distinct accepted validation case(s) are required for the working Gate 2 threshold."], records: [] };
const emptyDemand = { status: "not-started" as const, eligibleCount: 0, targetCount: 3, paidRecordedCount: 0, acceptedCount: 0, records: [] };

describe("Quality Lab Gate 2 consolidated release control", () => {
  it("keeps the current concept pack blocked across all four controls", () => {
    const assessment = assessGate2Release({ sourceCoverage, expertOwnership, validationRegistry: emptyValidation, paidPilotPortfolio: emptyDemand, generatedAt: "2026-07-14T00:00:00.000Z" });
    expect(assessment).toMatchObject({ status: "blocked", evidenceCompleteCount: 0, totalControlCount: 4 });
    expect(assessment.controls.map((control) => control.id)).toEqual(["source-corpus", "expert-ownership", "validation-cases", "qualified-demand"]);
    expect(assessment.blockers.length).toBeGreaterThanOrEqual(4);
  });

  it("allows qualified release review only when every evidence control is complete", () => {
    const completeSource = { ...sourceCoverage, blockers: [], metrics: { ...sourceCoverage.metrics, controlledReviewReadyRuleCount: sourceCoverage.metrics.ruleCount, openEvidenceCount: 0 } };
    const completeOwnership = { ...expertOwnership, ownershipGateSatisfied: true, blockers: [], metrics: { ...expertOwnership.metrics, ownershipEstablishedCount: expertOwnership.metrics.requiredRoleCount } };
    const version = `${MICROBIOLOGY_DOMAIN_PACK.id}@${MICROBIOLOGY_DOMAIN_PACK.version}`;
    const validation = { status: "working-threshold-met" as const, eligibleCount: 3, targetCount: 3, coveredRuleCount: 6, portfolioBlockers: [], records: ["p1", "p2", "p3"].map((id) => ({ packet: { project: { id }, sourceVersions: { domainPack: version } }, assessment: { eligibility: "eligible-validation-case" } })) };
    const demand = { status: "evidence-complete" as const, eligibleCount: 3, targetCount: 3, paidRecordedCount: 3, acceptedCount: 3, records: ["p1", "p2", "p3"].map((id) => ({ packet: { project: { id }, sourceVersions: { domainPack: version } }, gate1EvidenceComplete: true })) };
    const assessment = assessGate2Release({ sourceCoverage: completeSource, expertOwnership: completeOwnership, validationRegistry: validation, paidPilotPortfolio: demand, generatedAt: "2026-07-14T00:00:00.000Z" });
    expect(assessment).toMatchObject({ status: "eligible-for-qualified-release-review", evidenceCompleteCount: 4, blockers: [], versionMismatches: [] });
    expect(assessment.controls.every((control) => control.status === "evidence-complete")).toBe(true);
  });

  it("blocks evidence produced against another Domain Pack version", () => {
    const completeSource = { ...sourceCoverage, blockers: [], metrics: { ...sourceCoverage.metrics, controlledReviewReadyRuleCount: sourceCoverage.metrics.ruleCount, openEvidenceCount: 0 } };
    const completeOwnership = { ...expertOwnership, ownershipGateSatisfied: true, blockers: [], metrics: { ...expertOwnership.metrics, ownershipEstablishedCount: expertOwnership.metrics.requiredRoleCount } };
    const validation = { status: "working-threshold-met" as const, eligibleCount: 3, targetCount: 3, coveredRuleCount: 6, portfolioBlockers: [], records: [{ packet: { project: { id: "legacy" }, sourceVersions: { domainPack: "nonsterile-pharma-microbiology@microbiology-pack/v1.0" } }, assessment: { eligibility: "eligible-validation-case" } }] };
    const assessment = assessGate2Release({ sourceCoverage: completeSource, expertOwnership: completeOwnership, validationRegistry: validation, paidPilotPortfolio: emptyDemand, generatedAt: "2026-07-14T00:00:00.000Z" });
    expect(assessment.status).toBe("blocked");
    expect(assessment.versionMismatches[0]).toMatch(/expected nonsterile-pharma-microbiology@microbiology-pack\/v1\.1/i);
    expect(assessment.controls.find((control) => control.id === "validation-cases")?.status).toBe("open");
  });

  it("exports an evidence dossier without converting eligibility into approval", () => {
    const assessment = assessGate2Release({ sourceCoverage, expertOwnership, validationRegistry: emptyValidation, paidPilotPortfolio: emptyDemand, generatedAt: "2026-07-14T00:00:00.000Z" });
    const dossier = createGate2ReleaseDossier(assessment, { sourceCoverage, expertOwnership });
    expect(dossier).toMatchObject({ dossierVersion: "quality-lab-gate-2-release/v1", releaseReviewStatus: "blocked", totalControlCount: 4 });
    expect(dossier.controlNotice).toMatch(/does not verify/i);
    expect(dossier.evidenceBasis?.sourceClosure.metrics.openEvidenceCount).toBe(sourceCoverage.metrics.openEvidenceCount);
    expect(dossier.evidenceBasis?.expertOwnership.roles).toHaveLength(4);
  });
});
