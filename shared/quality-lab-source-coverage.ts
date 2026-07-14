import type { EvidenceRecord, RuleTrace } from "./quality-lab-contract";

export const QUALITY_LAB_SOURCE_COVERAGE_VERSION = "source-coverage/v1.0" as const;

export type EvidenceControlState =
  | "controlled-context"
  | "version-confirmation-required"
  | "project-revision"
  | "concept-benchmark"
  | "site-evidence-required";

export interface ControlledEvidenceRecord extends EvidenceRecord {
  controlState: EvidenceControlState;
  openForControlledRelease: boolean;
  controlReason: string;
}

export interface RuleSourceCoverage {
  ruleId: string;
  ruleVersion: string;
  name: string;
  outputTypes: string[];
  evidenceIds: string[];
  missingEvidenceIds: string[];
  controlledEvidenceIds: string[];
  openEvidenceIds: string[];
  catalogTraceable: boolean;
  controlledReviewReady: boolean;
  reviewRequired: boolean;
  applicability: string;
  limitations: string;
}

export interface SourceCoverageAssessment {
  assessmentVersion: typeof QUALITY_LAB_SOURCE_COVERAGE_VERSION;
  generatedAt: string;
  domainPackId: string;
  domainPackVersion: string;
  domainPackStatus: string;
  evidence: ControlledEvidenceRecord[];
  rules: RuleSourceCoverage[];
  metrics: {
    evidenceRecordCount: number;
    ruleCount: number;
    catalogTraceableRuleCount: number;
    controlledReviewReadyRuleCount: number;
    controlledEvidenceCount: number;
    openEvidenceCount: number;
    missingEvidenceLinkCount: number;
    duplicateEvidenceIdCount: number;
    duplicateRuleIdCount: number;
  };
  blockers: string[];
  notice: string;
}

function hasUnconfirmedVersion(version: string) {
  return /must be confirmed|to be supplied|to be obtained/i.test(version);
}

export function classifyEvidenceControl(record: EvidenceRecord): ControlledEvidenceRecord {
  if (record.status === "site-evidence-required") {
    return {
      ...record,
      controlState: "site-evidence-required",
      openForControlledRelease: true,
      controlReason: "The catalog names the required evidence, but the approved site or vendor record has not been supplied.",
    };
  }
  if (record.status === "internal-concept") {
    return {
      ...record,
      controlState: "concept-benchmark",
      openForControlledRelease: true,
      controlReason: "This is an uncalibrated Atlas planning assumption and cannot be treated as verified operating evidence.",
    };
  }
  if (record.status === "user-supplied") {
    return {
      ...record,
      controlState: "project-revision",
      openForControlledRelease: true,
      controlReason: "The evidence must be tied to a named, reviewed project revision before controlled use.",
    };
  }
  if (hasUnconfirmedVersion(record.version)) {
    return {
      ...record,
      controlState: "version-confirmation-required",
      openForControlledRelease: true,
      controlReason: "The source is identified, but its applicable edition or revision is not confirmed.",
    };
  }
  return {
    ...record,
    controlState: "controlled-context",
    openForControlledRelease: false,
    controlReason: "The public context record has a named version and locator; applicability still requires qualified review.",
  };
}

export function assessSourceCoverage(args: {
  domainPack: { id: string; version: string; status: string };
  evidence: EvidenceRecord[];
  rules: RuleTrace[];
  generatedAt?: string;
}): SourceCoverageAssessment {
  const generatedAt = args.generatedAt ?? new Date().toISOString();
  const evidence = args.evidence.map(classifyEvidenceControl);
  const duplicateEvidenceIdCount = evidence.length - new Set(evidence.map((record) => record.id)).size;
  const duplicateRuleIdCount = args.rules.length - new Set(args.rules.map((rule) => rule.ruleId)).size;
  const evidenceById = new Map(evidence.map((record) => [record.id, record]));
  const rules = args.rules.map<RuleSourceCoverage>((rule) => {
    const missingEvidenceIds = rule.evidenceIds.filter((id) => !evidenceById.has(id));
    const linkedEvidence = rule.evidenceIds.flatMap((id) => {
      const record = evidenceById.get(id);
      return record ? [record] : [];
    });
    const openEvidenceIds = linkedEvidence.filter((record) => record.openForControlledRelease).map((record) => record.id);
    const controlledEvidenceIds = linkedEvidence.filter((record) => !record.openForControlledRelease).map((record) => record.id);
    return {
      ruleId: rule.ruleId,
      ruleVersion: rule.ruleVersion,
      name: rule.name,
      outputTypes: rule.outputTypes,
      evidenceIds: rule.evidenceIds,
      missingEvidenceIds,
      controlledEvidenceIds,
      openEvidenceIds,
      catalogTraceable: missingEvidenceIds.length === 0,
      controlledReviewReady: missingEvidenceIds.length === 0 && openEvidenceIds.length === 0,
      reviewRequired: rule.reviewRequired,
      applicability: rule.applicability,
      limitations: rule.limitations,
    };
  });
  const missingEvidenceLinkCount = rules.reduce((sum, rule) => sum + rule.missingEvidenceIds.length, 0);
  const catalogTraceableRuleCount = rules.filter((rule) => rule.catalogTraceable).length;
  const controlledReviewReadyRuleCount = rules.filter((rule) => rule.controlledReviewReady).length;
  const openEvidence = evidence.filter((record) => record.openForControlledRelease);
  const blockers: string[] = [];
  if (duplicateEvidenceIdCount > 0) blockers.push(`${duplicateEvidenceIdCount} duplicate evidence catalog ID(s) must be resolved.`);
  if (duplicateRuleIdCount > 0) blockers.push(`${duplicateRuleIdCount} duplicate rule ID(s) must be resolved.`);
  if (missingEvidenceLinkCount > 0) blockers.push(`${missingEvidenceLinkCount} rule-to-evidence link(s) do not resolve to the catalog.`);
  if (openEvidence.some((record) => record.controlState === "version-confirmation-required")) blockers.push("Confirm the applicable edition for every public source marked as unresolved.");
  if (openEvidence.some((record) => record.controlState === "site-evidence-required")) blockers.push("Obtain and review the named site-approved methods, specifications, SOPs, and vendor evidence.");
  if (openEvidence.some((record) => record.controlState === "concept-benchmark")) blockers.push("Calibrate or replace Atlas concept benchmarks with controlled case evidence.");
  if (openEvidence.some((record) => record.controlState === "project-revision")) blockers.push("Bind project facts to a named revision and qualified review record.");

  return {
    assessmentVersion: QUALITY_LAB_SOURCE_COVERAGE_VERSION,
    generatedAt,
    domainPackId: args.domainPack.id,
    domainPackVersion: args.domainPack.version,
    domainPackStatus: args.domainPack.status,
    evidence,
    rules,
    metrics: {
      evidenceRecordCount: evidence.length,
      ruleCount: rules.length,
      catalogTraceableRuleCount,
      controlledReviewReadyRuleCount,
      controlledEvidenceCount: evidence.length - openEvidence.length,
      openEvidenceCount: openEvidence.length,
      missingEvidenceLinkCount,
      duplicateEvidenceIdCount,
      duplicateRuleIdCount,
    },
    blockers,
    notice: "Coverage measures traceability and evidence closure only. It does not verify a method, validate a Domain Pack, or authorize design, procurement, or release decisions.",
  };
}

export function createSourceCoverageRegistry(assessment: SourceCoverageAssessment) {
  return {
    documentType: "Atlas Quality Lab source coverage registry",
    documentVersion: assessment.assessmentVersion,
    generatedAt: assessment.generatedAt,
    controlStatus: "working-control-record",
    domainPack: {
      id: assessment.domainPackId,
      version: assessment.domainPackVersion,
      status: assessment.domainPackStatus,
    },
    metrics: assessment.metrics,
    blockers: assessment.blockers,
    evidence: assessment.evidence,
    rules: assessment.rules,
    controlNotice: assessment.notice,
  };
}
