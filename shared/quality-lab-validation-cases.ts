import { assessCalibrationCandidate, summarizeCalibration, type QualityLabEngagementPacket } from "./quality-lab-engagement";

export const QUALITY_LAB_VALIDATION_CASE_REGISTRY_VERSION = "quality-lab-validation-case-registry/v1" as const;
export const QUALITY_LAB_VALIDATION_CASE_TARGET = 3;

export type ValidationCaseEligibility = "not-started" | "blocked" | "eligible-validation-case";

function recordedTime(value: string | null) {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function assessValidationCase(packet: QualityLabEngagementPacket) {
  const control = packet.validationControl;
  const calibration = summarizeCalibration(packet);
  const learning = assessCalibrationCandidate(packet);
  const started = control.status !== "draft"
    || control.confidentialityClass !== "not-classified"
    || control.learningUsePermission !== "not-assessed"
    || control.scopeAlignment !== "unknown"
    || Boolean(control.casePurpose.trim() || control.qualificationEvidenceRefs.length || control.acceptedByRole.trim());
  if (!started) {
    return {
      eligibility: "not-started" as ValidationCaseEligibility,
      blockers: ["Validation-case acceptance has not started."],
      observedMetricCount: calibration.observedCount,
      applicableRuleIds: packet.calibration.applicableRuleIds,
    };
  }

  const blockers: string[] = [];
  const baselineAt = recordedTime(control.baselineFrozenAt);
  const observedStart = recordedTime(packet.calibration.observedPeriodStart);
  const observedEnd = recordedTime(packet.calibration.observedPeriodEnd);
  const acceptedAt = recordedTime(control.acceptedAt);
  const learningReviewedAt = recordedTime(packet.calibration.reviewedAt);
  if (!control.caseId.trim()) blockers.push("A controlled validation case ID is required.");
  if (baselineAt === null) blockers.push("Record a valid frozen-baseline timestamp.");
  if (observedStart === null || observedEnd === null) blockers.push("Record a valid observed-period start and end.");
  if (observedStart !== null && observedEnd !== null && observedEnd < observedStart) blockers.push("Observed-period end cannot precede its start.");
  if (!control.casePurpose.trim() || control.casePurpose.trim().length < 20) blockers.push("Define the validation question and intended learning in the case purpose.");
  if (control.confidentialityClass === "not-classified") blockers.push("Classify case confidentiality before review.");
  if (control.learningUsePermission !== "internal-anonymized-learning") blockers.push("Document permission for internal anonymized Domain Pack learning.");
  if (control.scopeAlignment !== "yes") blockers.push("Confirm that the observed scope is aligned to the frozen estimate; partial or changed scope cannot validate the rule as-is.");
  if (control.qualificationEvidenceRefs.length === 0) blockers.push("Reference at least one controlled qualification or source-quality record.");
  if (learning.eligibility !== "eligible-for-learning-review") blockers.push("The estimate-to-actual record must first be eligible for controlled learning review.");
  if (calibration.observedCount === 0) blockers.push("At least one estimate-to-actual metric is required.");
  if (control.status !== "accepted") blockers.push("A qualified reviewer must accept the record as a validation case.");
  if (!control.acceptanceRationale.trim() || control.acceptanceRationale.trim().length < 20) blockers.push("Record a substantive case-acceptance rationale.");
  if (!control.acceptedByRole.trim()) blockers.push("Record the qualified role accepting the validation case.");
  if (acceptedAt === null) blockers.push("Record a valid validation-case acceptance timestamp.");
  if (baselineAt !== null && observedStart !== null && baselineAt > observedStart) blockers.push("The frozen baseline must predate the observed period.");
  if (acceptedAt !== null && learningReviewedAt !== null && acceptedAt < learningReviewedAt) blockers.push("Validation-case acceptance cannot precede calibration learning review.");
  if (acceptedAt !== null && observedEnd !== null && acceptedAt < observedEnd) blockers.push("Validation-case acceptance cannot precede the end of the observed period.");

  return {
    eligibility: (blockers.length ? "blocked" : "eligible-validation-case") as ValidationCaseEligibility,
    blockers,
    observedMetricCount: calibration.observedCount,
    applicableRuleIds: packet.calibration.applicableRuleIds,
  };
}

export function assessValidationCaseRegistry(packets: QualityLabEngagementPacket[]) {
  const records = packets.map((packet) => ({ packet, assessment: assessValidationCase(packet) }));
  const eligibleRecords = records.filter((record) => record.assessment.eligibility === "eligible-validation-case");
  const caseIds = eligibleRecords.map((record) => record.packet.validationControl.caseId);
  const projectIds = eligibleRecords.map((record) => record.packet.project.id);
  const duplicateCaseIdCount = caseIds.length - new Set(caseIds).size;
  const duplicateProjectCount = projectIds.length - new Set(projectIds).size;
  const caseIdCounts = new Map(caseIds.map((caseId) => [caseId, caseIds.filter((value) => value === caseId).length]));
  const projectIdCounts = new Map(projectIds.map((projectId) => [projectId, projectIds.filter((value) => value === projectId).length]));
  const structurallyEligibleRecords = eligibleRecords.filter((record) => caseIdCounts.get(record.packet.validationControl.caseId) === 1 && projectIdCounts.get(record.packet.project.id) === 1);
  const eligibleCount = structurallyEligibleRecords.length;
  const ruleIds = new Set(structurallyEligibleRecords.flatMap((record) => record.assessment.applicableRuleIds));
  const portfolioBlockers: string[] = [];
  if (duplicateCaseIdCount > 0) portfolioBlockers.push(`${duplicateCaseIdCount} duplicate accepted case ID(s) must be resolved.`);
  if (duplicateProjectCount > 0) portfolioBlockers.push(`${duplicateProjectCount} project(s) appear more than once in accepted validation evidence.`);
  if (eligibleCount < QUALITY_LAB_VALIDATION_CASE_TARGET) portfolioBlockers.push(`${QUALITY_LAB_VALIDATION_CASE_TARGET - eligibleCount} additional distinct accepted validation case(s) are required for the working Gate 2 threshold.`);
  return {
    registryVersion: QUALITY_LAB_VALIDATION_CASE_REGISTRY_VERSION,
    status: eligibleCount >= QUALITY_LAB_VALIDATION_CASE_TARGET && portfolioBlockers.length === 0 ? "working-threshold-met" as const : records.some((record) => record.assessment.eligibility !== "not-started") ? "in-progress" as const : "not-started" as const,
    targetCount: QUALITY_LAB_VALIDATION_CASE_TARGET,
    eligibleCount,
    remainingCount: Math.max(0, QUALITY_LAB_VALIDATION_CASE_TARGET - eligibleCount),
    observedMetricCount: structurallyEligibleRecords.reduce((sum, record) => sum + record.assessment.observedMetricCount, 0),
    coveredRuleCount: ruleIds.size,
    coveredRuleIds: Array.from(ruleIds),
    duplicateCaseIdCount,
    duplicateProjectCount,
    records,
    portfolioBlockers,
    controlNotice: "Three accepted cases are a working evidence threshold, not statistical validation or proof of representativeness. Domain Pack release still requires expert ownership, source closure, cross-case review, and controlled change approval.",
  };
}

export function createValidationCaseRegistry(packets: QualityLabEngagementPacket[], generatedAt = new Date().toISOString()) {
  const registry = assessValidationCaseRegistry(packets);
  return {
    registryVersion: registry.registryVersion,
    generatedAt,
    status: registry.status,
    targetCount: registry.targetCount,
    eligibleCount: registry.eligibleCount,
    remainingCount: registry.remainingCount,
    metrics: { observedMetricCount: registry.observedMetricCount, coveredRuleCount: registry.coveredRuleCount },
    portfolioBlockers: registry.portfolioBlockers,
    cases: registry.records.map(({ packet, assessment }) => ({
      caseId: packet.validationControl.caseId,
      project: packet.project,
      sourceVersions: packet.sourceVersions,
      eligibility: assessment.eligibility,
      blockers: assessment.blockers,
      confidentialityClass: packet.validationControl.confidentialityClass,
      learningUsePermission: packet.validationControl.learningUsePermission,
      baselineFrozenAt: packet.validationControl.baselineFrozenAt,
      casePurpose: packet.validationControl.casePurpose,
      scopeAlignment: packet.validationControl.scopeAlignment,
      qualificationEvidenceRefs: packet.validationControl.qualificationEvidenceRefs,
      observedPeriod: { start: packet.calibration.observedPeriodStart, end: packet.calibration.observedPeriodEnd },
      observedMetricCount: assessment.observedMetricCount,
      applicableRuleIds: assessment.applicableRuleIds,
      acceptedByRole: packet.validationControl.acceptedByRole,
      acceptedAt: packet.validationControl.acceptedAt,
      acceptanceRationale: packet.validationControl.acceptanceRationale,
    })),
    controlNotice: registry.controlNotice,
  };
}
