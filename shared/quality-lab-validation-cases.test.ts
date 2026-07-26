import { describe, expect, it } from "vitest";
import { createQualityLabProject, defaultQualityLabInput } from "./quality-lab";
import { createQualityLabEngagementPacket, qualityLabEngagementPacketSchema, type QualityLabEngagementPacket } from "./quality-lab-engagement";
import { appendCalibrationReviewEvent, createCalibrationReviewCase, createQualityLabCalibrationObservation, type QualityLabCalibrationReviewCase } from "./quality-lab-calibration-observation";
import { assessValidationCase, assessValidationCaseRegistry, createValidationCaseRegistry } from "./quality-lab-validation-cases";

function eligibleCase(id: string): { packet: QualityLabEngagementPacket; reviewCase: QualityLabCalibrationReviewCase } {
  const project = createQualityLabProject({ ...defaultQualityLabInput, projectName: `Validation ${id}` }, id);
  const packet = createQualityLabEngagementPacket(project, "2026-01-01T00:00:00.000Z");
  packet.baseline.monthlyTests.actual = packet.baseline.monthlyTests.estimate * 1.1;
  packet.baseline.monthlyTests.variancePercent = 10;
  Object.assign(packet.calibration, {
    status: "reviewed",
    observedPeriodStart: "2026-02-01",
    observedPeriodEnd: "2026-04-30",
    dataOwner: "QC Operations",
    evidenceRefs: [`OPS-${id}`],
    learningDisposition: "candidate-rule-update",
    applicableRuleIds: ["micro.workflow.finished-products"],
    dispositionRationale: "Observed evidence is suitable for controlled cross-case review of the current rule.",
    reviewedByRole: "Microbiology SME",
    reviewedAt: "2026-05-10T00:00:00.000Z",
  });
  Object.assign(packet.calibration.metricNotes.find((note) => note.metric === "monthlyTests")!, {
    actualBasis: "Controlled monthly operations report",
    varianceDriver: "site-performance",
    reviewerNote: "Scope and calculation basis reconciled.",
  });
  Object.assign(packet.validationControl, {
    caseId: `VAL-${id}`,
    status: "accepted",
    confidentialityClass: "internal-anonymized",
    learningUsePermission: "internal-anonymized-learning",
    baselineFrozenAt: "2026-01-01T00:00:00.000Z",
    casePurpose: "Test the finished-product monthly workload rule against qualified operating evidence.",
    scopeAlignment: "yes",
    qualificationEvidenceRefs: [`QMS-${id}`],
    acceptanceRationale: "The baseline, observed scope, evidence provenance and variance classification support cross-case review.",
    acceptedByRole: "Domain Pack validation reviewer",
    acceptedAt: "2026-05-15T00:00:00.000Z",
  });
  const parsedPacket = qualityLabEngagementPacketSchema.parse(packet);
  const observation = createQualityLabCalibrationObservation(project, parsedPacket, "2026-05-11T00:00:00.000Z");
  const reviewCase = appendCalibrationReviewEvent(createCalibrationReviewCase(observation), {
    decision: "accepted-evidence",
    recordedAt: "2026-05-12T00:00:00.000Z",
    reviewedByRole: "Calibration evidence reviewer",
    externalReviewReference: `CAL-${id}`,
    rationale: "The immutable project observation is suitable evidence for separate validation-case review.",
  });
  return { packet: parsedPacket, reviewCase };
}

describe("Quality Lab validation case controls", () => {
  it("keeps a new engagement out of the validation registry", () => {
    const packet = createQualityLabEngagementPacket(createQualityLabProject(defaultQualityLabInput, "case-open"), "2026-01-01T00:00:00.000Z");
    expect(assessValidationCase(packet)).toMatchObject({ eligibility: "not-started", observedMetricCount: 0, calibrationObservationId: null });
  });

  it("requires immutable accepted calibration evidence even when the mutable packet is complete", () => {
    const { packet } = eligibleCase("case-mutable-only");
    const assessment = assessValidationCase(packet);
    expect(assessment.eligibility).toBe("blocked");
    expect(assessment.calibrationObservationId).toBeNull();
    expect(assessment.blockers).toEqual(expect.arrayContaining([expect.stringMatching(/immutable calibration observation/i)]));
  });

  it("requires case acceptance controls beyond calibration review", () => {
    const { packet, reviewCase } = eligibleCase("case-blocked");
    packet.validationControl.learningUsePermission = "project-validation-only";
    packet.validationControl.scopeAlignment = "partial";
    packet.validationControl.status = "in-review";
    const assessment = assessValidationCase(packet, reviewCase);
    expect(assessment.eligibility).toBe("blocked");
    expect(assessment.blockers).toEqual(expect.arrayContaining([
      expect.stringMatching(/permission/i),
      expect.stringMatching(/scope is aligned/i),
      expect.stringMatching(/accept the record/i),
    ]));
  });

  it("accepts an evidence-complete validation case without approving a rule change", () => {
    const { packet, reviewCase } = eligibleCase("case-1");
    const assessment = assessValidationCase(packet, reviewCase);
    expect(assessment).toMatchObject({ eligibility: "eligible-validation-case", blockers: [], observedMetricCount: 1, applicableRuleIds: ["micro.workflow.finished-products"], calibrationObservationId: reviewCase.observation.observationId });
  });

  it("uses three distinct accepted cases as a working threshold", () => {
    const records = [eligibleCase("case-1"), eligibleCase("case-2"), eligibleCase("case-3")];
    const packets = records.map((item) => item.packet);
    const reviewCases = records.map((item) => item.reviewCase);
    const registry = assessValidationCaseRegistry(packets, reviewCases);
    expect(registry).toMatchObject({ status: "working-threshold-met", targetCount: 3, eligibleCount: 3, remainingCount: 0, observedMetricCount: 3, coveredRuleCount: 1, portfolioBlockers: [] });
    expect(registry.controlNotice).toMatch(/not statistical validation/i);
    const exported = createValidationCaseRegistry(packets, "2026-06-01T00:00:00.000Z", reviewCases);
    expect(exported.registryVersion).toBe("quality-lab-validation-case-registry/v2");
    expect(exported.cases).toHaveLength(3);
    expect(exported.cases[0]).toMatchObject({ eligibility: "eligible-validation-case", calibrationObservationId: reviewCases[0].observation.observationId });
  });

  it("blocks duplicate case and project records at portfolio level", () => {
    const { packet, reviewCase } = eligibleCase("duplicate");
    const duplicate = structuredClone(packet);
    const registry = assessValidationCaseRegistry([packet, duplicate], [reviewCase]);
    expect(registry).toMatchObject({ status: "in-progress", eligibleCount: 0, duplicateCaseIdCount: 1, duplicateProjectCount: 1 });
    expect(registry.portfolioBlockers).toEqual(expect.arrayContaining([expect.stringMatching(/duplicate accepted case/i), expect.stringMatching(/appear more than once/i)]));
  });
});
