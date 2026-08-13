import type { ExpertOwnershipAssessment } from "./quality-lab-expert-ownership";
import type { SourceCoverageAssessment } from "./quality-lab-source-coverage";
import { z } from "zod";

export const QUALITY_LAB_GATE_2_RELEASE_VERSION = "quality-lab-gate-2-release/v1" as const;
export const QUALITY_LAB_GATE_2_DECISION_VERSION = "quality-lab-gate-2-decision/v1" as const;

export const gate2ReleaseDecisionSchema = z.object({
  decisionVersion: z.literal(QUALITY_LAB_GATE_2_DECISION_VERSION),
  domainPackId: z.string().trim().min(1),
  domainPackVersion: z.string().trim().min(1),
  reviewedValidationCaseIds: z.array(z.string().trim().min(1)).min(3),
  crossCaseReviewEvidenceRef: z.string().trim().min(1),
  ruleDisposition: z.enum(["retain-current-rules", "approved-rule-changes", "reject-release"]),
  ruleDispositionSummary: z.string().trim().min(20),
  ruleChangeApprovalEvidenceRefs: z.array(z.string().trim().min(1)),
  decision: z.enum(["approved-outside-atlas", "rejected"]),
  approvedByRoles: z.array(z.string().trim().min(1)).min(2),
  approvalEvidenceRef: z.string().trim().min(1),
  decidedAt: z.string().datetime(),
});
export type Gate2ReleaseDecision = z.infer<typeof gate2ReleaseDecisionSchema>;

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
  status: "blocked" | "eligible-for-qualified-release-review" | "approved-outside-atlas" | "rejected-outside-atlas";
  evidenceCompleteCount: number;
  totalControlCount: number;
  controls: Gate2ControlAssessment[];
  blockers: string[];
  versionMismatches: string[];
  authorization: {
    status: "not-recorded" | "evidence-incomplete" | "approved-outside-atlas" | "rejected-outside-atlas";
    blockers: string[];
    decision: Gate2ReleaseDecision | null;
  };
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
  releaseDecision?: Gate2ReleaseDecision | null;
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
  const prerequisitesComplete = evidenceCompleteCount === controls.length && blockers.length === 0;
  const decisionParse = args.releaseDecision ? gate2ReleaseDecisionSchema.safeParse(args.releaseDecision) : null;
  const authorizationBlockers: string[] = [];
  const releaseDecision = decisionParse?.success ? decisionParse.data : null;
  if (args.releaseDecision && !decisionParse?.success) authorizationBlockers.push("The release decision record is structurally invalid.");
  if (releaseDecision) {
    if (!prerequisitesComplete) authorizationBlockers.push("All four Gate 2 evidence prerequisites must be complete before release authorization.");
    if (`${releaseDecision.domainPackId}@${releaseDecision.domainPackVersion}` !== expectedDomainPack) authorizationBlockers.push("The release decision does not match the active Domain Pack version.");
    const acceptedCaseIds = new Set(args.validationRegistry.records
      .filter((record) => record.assessment.eligibility === "eligible-validation-case")
      .map((record) => (record.packet as { validationControl?: { caseId?: string } }).validationControl?.caseId)
      .filter((value): value is string => Boolean(value)));
    if (acceptedCaseIds.size > 0 && releaseDecision.reviewedValidationCaseIds.some((caseId) => !acceptedCaseIds.has(caseId))) authorizationBlockers.push("Every reviewed case ID must exist in the accepted current-version validation registry.");
    if (new Set(releaseDecision.reviewedValidationCaseIds).size < args.validationRegistry.targetCount) authorizationBlockers.push(`Cross-case review must include at least ${args.validationRegistry.targetCount} distinct validation cases.`);
    if (releaseDecision.ruleDisposition === "approved-rule-changes" && releaseDecision.ruleChangeApprovalEvidenceRefs.length === 0) authorizationBlockers.push("Approved rule changes require at least one controlled external approval reference.");
    if (releaseDecision.decision === "approved-outside-atlas" && releaseDecision.ruleDisposition === "reject-release") authorizationBlockers.push("A rejected rule disposition cannot authorize release.");
    if (releaseDecision.decision === "rejected" && releaseDecision.ruleDisposition !== "reject-release") authorizationBlockers.push("A rejected release decision must carry a reject-release rule disposition.");
  }
  const authorizationStatus = !args.releaseDecision ? "not-recorded" as const
    : authorizationBlockers.length ? "evidence-incomplete" as const
    : releaseDecision?.decision === "approved-outside-atlas" ? "approved-outside-atlas" as const
    : "rejected-outside-atlas" as const;
  const status = authorizationStatus === "approved-outside-atlas" ? "approved-outside-atlas" as const
    : authorizationStatus === "rejected-outside-atlas" ? "rejected-outside-atlas" as const
    : prerequisitesComplete ? "eligible-for-qualified-release-review" as const
    : "blocked" as const;
  return {
    assessmentVersion: QUALITY_LAB_GATE_2_RELEASE_VERSION,
    generatedAt,
    domainPackId: args.sourceCoverage.domainPackId,
    domainPackVersion: args.sourceCoverage.domainPackVersion,
    status,
    evidenceCompleteCount,
    totalControlCount: controls.length,
    controls,
    blockers,
    versionMismatches,
    authorization: { status: authorizationStatus, blockers: authorizationBlockers, decision: releaseDecision },
    notice: "Evidence eligibility starts a qualified release review only and does not verify the Domain Pack. A separate version-matched cross-case decision with documented rule disposition and approval outside Atlas is required before the Pack can be recorded as released.",
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
    authorization: assessment.authorization,
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
