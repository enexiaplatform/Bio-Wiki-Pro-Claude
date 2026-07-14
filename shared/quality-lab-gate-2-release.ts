import type { ExpertOwnershipAssessment } from "./quality-lab-expert-ownership";
import type { SourceCoverageAssessment } from "./quality-lab-source-coverage";

export const QUALITY_LAB_GATE_2_RELEASE_VERSION = "quality-lab-gate-2-release/v1" as const;

export type Gate2ControlStatus = "open" | "evidence-complete";

export interface Gate2ControlAssessment {
  id: "source-corpus" | "expert-ownership" | "validation-cases" | "qualified-demand";
  label: string;
  status: Gate2ControlStatus;
  evidence: string;
  blockers: string[];
  href: string;
}

export interface Gate2ReleaseAssessment {
  assessmentVersion: typeof QUALITY_LAB_GATE_2_RELEASE_VERSION;
  generatedAt: string;
  domainPackId: string;
  domainPackVersion: string;
  status: "blocked" | "eligible-for-qualified-release-review";
  evidenceCompleteCount: number;
  totalControlCount: number;
  controls: Gate2ControlAssessment[];
  blockers: string[];
  versionMismatches: string[];
  notice: string;
}

type ValidationRegistryBasis = {
  status: "not-started" | "in-progress" | "working-threshold-met";
  eligibleCount: number;
  targetCount: number;
  coveredRuleCount: number;
  portfolioBlockers: string[];
  records: Array<{ packet: { project: { id: string }; sourceVersions: { domainPack: string } }; assessment: { eligibility: string } }>;
};

type PaidPilotPortfolioBasis = {
  status: "not-started" | "in-progress" | "evidence-complete";
  eligibleCount: number;
  targetCount: number;
  paidRecordedCount: number;
  acceptedCount: number;
  records: Array<{ packet: { project: { id: string }; sourceVersions: { domainPack: string } }; gate1EvidenceComplete: boolean }>;
};

export function assessGate2Release(args: {
  sourceCoverage: SourceCoverageAssessment;
  expertOwnership: ExpertOwnershipAssessment;
  validationRegistry: ValidationRegistryBasis;
  paidPilotPortfolio: PaidPilotPortfolioBasis;
  generatedAt?: string;
}): Gate2ReleaseAssessment {
  const generatedAt = args.generatedAt ?? new Date().toISOString();
  const expectedDomainPack = `${args.sourceCoverage.domainPackId}@${args.sourceCoverage.domainPackVersion}`;
  const versionMismatches = [
    ...args.validationRegistry.records
      .filter((record) => record.assessment.eligibility === "eligible-validation-case" && record.packet.sourceVersions.domainPack !== expectedDomainPack)
      .map((record) => `Validation case project ${record.packet.project.id} uses ${record.packet.sourceVersions.domainPack}; expected ${expectedDomainPack}.`),
    ...args.paidPilotPortfolio.records
      .filter((record) => record.gate1EvidenceComplete && record.packet.sourceVersions.domainPack !== expectedDomainPack)
      .map((record) => `Paid pilot project ${record.packet.project.id} uses ${record.packet.sourceVersions.domainPack}; expected ${expectedDomainPack}.`),
  ];

  const sourceComplete = args.sourceCoverage.metrics.ruleCount > 0
    && args.sourceCoverage.metrics.controlledReviewReadyRuleCount === args.sourceCoverage.metrics.ruleCount
    && args.sourceCoverage.metrics.openEvidenceCount === 0
    && args.sourceCoverage.metrics.missingEvidenceLinkCount === 0
    && args.sourceCoverage.metrics.duplicateEvidenceIdCount === 0
    && args.sourceCoverage.metrics.duplicateRuleIdCount === 0
    && args.sourceCoverage.blockers.length === 0;
  const ownershipComplete = args.expertOwnership.ownershipGateSatisfied
    && args.expertOwnership.domainPackId === args.sourceCoverage.domainPackId
    && args.expertOwnership.domainPackVersion === args.sourceCoverage.domainPackVersion;
  const matchingValidationProjectCount = new Set(args.validationRegistry.records
    .filter((record) => record.assessment.eligibility === "eligible-validation-case" && record.packet.sourceVersions.domainPack === expectedDomainPack)
    .map((record) => record.packet.project.id)).size;
  const matchingPaidPilotProjectCount = new Set(args.paidPilotPortfolio.records
    .filter((record) => record.gate1EvidenceComplete && record.packet.sourceVersions.domainPack === expectedDomainPack)
    .map((record) => record.packet.project.id)).size;
  const validationComplete = args.validationRegistry.status === "working-threshold-met"
    && args.validationRegistry.eligibleCount >= args.validationRegistry.targetCount
    && matchingValidationProjectCount >= args.validationRegistry.targetCount
    && args.validationRegistry.portfolioBlockers.length === 0
    && !versionMismatches.some((item) => item.startsWith("Validation case"));
  const demandComplete = args.paidPilotPortfolio.status === "evidence-complete"
    && args.paidPilotPortfolio.eligibleCount >= args.paidPilotPortfolio.targetCount
    && matchingPaidPilotProjectCount >= args.paidPilotPortfolio.targetCount
    && !versionMismatches.some((item) => item.startsWith("Paid pilot"));

  const controls: Gate2ControlAssessment[] = [
    {
      id: "source-corpus",
      label: "Controlled source corpus",
      status: sourceComplete ? "evidence-complete" : "open",
      evidence: `${args.sourceCoverage.metrics.controlledReviewReadyRuleCount}/${args.sourceCoverage.metrics.ruleCount} rules evidence-closed; ${args.sourceCoverage.metrics.openEvidenceCount} evidence records open.`,
      blockers: sourceComplete ? [] : args.sourceCoverage.blockers.length ? args.sourceCoverage.blockers : ["Close every material rule against controlled evidence."],
      href: "/quality-lab/domain-readiness#source-coverage-title",
    },
    {
      id: "expert-ownership",
      label: "Qualified expert ownership",
      status: ownershipComplete ? "evidence-complete" : "open",
      evidence: `${args.expertOwnership.metrics.ownershipEstablishedCount}/${args.expertOwnership.metrics.requiredRoleCount} accountable roles established.`,
      blockers: ownershipComplete ? [] : args.expertOwnership.blockers.length ? args.expertOwnership.blockers : ["Reconcile ownership against the active Domain Pack version."],
      href: "/quality-lab/domain-ownership",
    },
    {
      id: "validation-cases",
      label: "Controlled validation cases",
      status: validationComplete ? "evidence-complete" : "open",
      evidence: `${matchingValidationProjectCount}/${args.validationRegistry.targetCount} distinct current-version cases accepted; ${args.validationRegistry.coveredRuleCount} rules covered.`,
      blockers: validationComplete ? [] : Array.from(new Set([...args.validationRegistry.portfolioBlockers.filter((item) => !/additional distinct accepted validation case/i.test(item)), ...(matchingValidationProjectCount < args.validationRegistry.targetCount ? [`${args.validationRegistry.targetCount - matchingValidationProjectCount} additional distinct current-version validation case(s) required.`] : []), ...versionMismatches.filter((item) => item.startsWith("Validation case"))])),
      href: "/quality-lab/validation-cases",
    },
    {
      id: "qualified-demand",
      label: "Paid and accepted demand",
      status: demandComplete ? "evidence-complete" : "open",
      evidence: `${matchingPaidPilotProjectCount}/${args.paidPilotPortfolio.targetCount} distinct current-version paid engagements; ${args.paidPilotPortfolio.acceptedCount} client acceptances.`,
      blockers: demandComplete ? [] : [`${Math.max(0, args.paidPilotPortfolio.targetCount - matchingPaidPilotProjectCount)} additional distinct current-version paid engagement(s) required.`, ...versionMismatches.filter((item) => item.startsWith("Paid pilot"))],
      href: "/quality-lab/pilots",
    },
  ];
  const blockers = controls.flatMap((control) => control.blockers.map((blocker) => `${control.label}: ${blocker}`));
  const evidenceCompleteCount = controls.filter((control) => control.status === "evidence-complete").length;
  return {
    assessmentVersion: QUALITY_LAB_GATE_2_RELEASE_VERSION,
    generatedAt,
    domainPackId: args.sourceCoverage.domainPackId,
    domainPackVersion: args.sourceCoverage.domainPackVersion,
    status: evidenceCompleteCount === controls.length && blockers.length === 0 ? "eligible-for-qualified-release-review" : "blocked",
    evidenceCompleteCount,
    totalControlCount: controls.length,
    controls,
    blockers,
    versionMismatches,
    notice: "Eligibility starts a qualified release review only. It does not verify the Domain Pack, approve a rule change, authorize client use, or replace documented approval outside Atlas.",
  };
}

export function createGate2ReleaseDossier(assessment: Gate2ReleaseAssessment, evidenceBasis?: { sourceCoverage: SourceCoverageAssessment; expertOwnership: ExpertOwnershipAssessment }) {
  return {
    dossierType: "Atlas Quality Lab Gate 2 release evidence dossier",
    dossierVersion: assessment.assessmentVersion,
    generatedAt: assessment.generatedAt,
    domainPack: { id: assessment.domainPackId, version: assessment.domainPackVersion },
    releaseReviewStatus: assessment.status,
    evidenceCompleteCount: assessment.evidenceCompleteCount,
    totalControlCount: assessment.totalControlCount,
    controls: assessment.controls,
    blockers: assessment.blockers,
    versionMismatches: assessment.versionMismatches,
    evidenceBasis: evidenceBasis ? {
      sourceClosure: {
        domainPack: { id: evidenceBasis.sourceCoverage.domainPackId, version: evidenceBasis.sourceCoverage.domainPackVersion },
        metrics: evidenceBasis.sourceCoverage.metrics,
        acceptedClosureRecords: evidenceBasis.sourceCoverage.closures.filter((closure) => closure.reviewStatus === "accepted-outside-atlas"),
        notice: evidenceBasis.sourceCoverage.notice,
      },
      expertOwnership: {
        domainPack: { id: evidenceBasis.expertOwnership.domainPackId, version: evidenceBasis.expertOwnership.domainPackVersion },
        metrics: evidenceBasis.expertOwnership.metrics,
        roles: evidenceBasis.expertOwnership.roles.map((role) => ({ id: role.id, title: role.title, ruleIds: role.ruleIds, appointment: role.appointment, ownershipEstablished: role.ownershipEstablished, missingControls: role.missingControls })),
        notice: evidenceBasis.expertOwnership.notice,
      },
    } : undefined,
    controlNotice: assessment.notice,
  };
}
