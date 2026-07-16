import { z } from "zod";
import type { QualityLabProject } from "./quality-lab.js";

export const QUALITY_LAB_ENGAGEMENT_PACKET_VERSION = "quality-lab-engagement-packet/v1" as const;

const checklistStatusSchema = z.enum(["open", "in-review", "resolved", "not-applicable"]);
const commercialReviewStatusSchema = z.enum(["draft", "needs-site-evidence", "ready-for-qualified-review"]);
export const calibrationMetricKeySchema = z.enum(["monthlyTests", "teamFte", "areaSqm", "capexLowUsd", "capexHighUsd"]);
const calibrationMetricNoteSchema = z.object({
  metric: calibrationMetricKeySchema,
  actualBasis: z.string(),
  varianceDriver: z.enum(["not-assessed", "input-quality", "scope-change", "rule-assumption", "site-performance", "market-price", "implementation-choice", "mixed"]),
  reviewerNote: z.string(),
});

const emptyCalibration = () => ({
  status: "draft" as const,
  observedPeriodStart: "",
  observedPeriodEnd: "",
  dataOwner: "",
  evidenceRefs: [] as string[],
  metricNotes: calibrationMetricKeySchema.options.map((metric) => ({ metric, actualBasis: "", varianceDriver: "not-assessed" as const, reviewerNote: "" })),
  learningDisposition: "hold" as const,
  applicableRuleIds: [] as string[],
  dispositionRationale: "",
  reviewedByRole: "",
  reviewedAt: null as string | null,
});

const emptyDeliveryControl = () => ({
  documentId: "",
  revision: "D0",
  intendedUse: "Concept planning and qualified review",
  preparedByRole: "",
  reviewedByRole: "",
  externalApprovalReference: "",
  recordedStatus: "working-draft" as const,
});

const emptyPilotControl = () => ({
  engagementClass: "unclassified" as const,
  commercialStatus: "not-recorded" as const,
  commercialEvidenceReference: "",
  serviceStartedAt: "",
  scopeConfirmedAt: "",
  firstControlledDeliveryAt: "",
  deliveryEffortHours: null as number | null,
  acceptanceStatus: "not-requested" as const,
  clientAcceptanceAt: "",
  acceptanceReference: "",
  outcomeNote: "",
});

const emptyValidationControl = () => ({
  caseId: "",
  status: "draft" as const,
  confidentialityClass: "not-classified" as const,
  learningUsePermission: "not-assessed" as const,
  baselineFrozenAt: "",
  casePurpose: "",
  scopeAlignment: "unknown" as const,
  qualificationEvidenceRefs: [] as string[],
  acceptanceRationale: "",
  acceptedByRole: "",
  acceptedAt: null as string | null,
});

export const qualityLabEngagementPacketSchema = z.object({
  packetVersion: z.literal(QUALITY_LAB_ENGAGEMENT_PACKET_VERSION),
  generatedAt: z.string().datetime(),
  stage: z.literal("scope-triage"),
  project: z.object({ id: z.string().min(1), name: z.string().min(1), country: z.string().min(1), facilityType: z.string().min(1) }),
  sourceVersions: z.object({ inputContract: z.string().min(1), outputContract: z.string().min(1), compilerCore: z.string().min(1), domainPack: z.string().min(1) }),
  baseline: z.object({
    monthlyTests: z.object({ estimate: z.number().nonnegative(), actual: z.number().nonnegative().nullable(), variancePercent: z.number().nullable() }),
    teamFte: z.object({ estimate: z.number().nonnegative(), actual: z.number().nonnegative().nullable(), variancePercent: z.number().nullable() }),
    areaSqm: z.object({ estimate: z.number().nonnegative(), actual: z.number().nonnegative().nullable(), variancePercent: z.number().nullable() }),
    capexLowUsd: z.object({ estimate: z.number().nonnegative(), actual: z.number().nonnegative().nullable(), variancePercent: z.number().nullable() }),
    capexHighUsd: z.object({ estimate: z.number().nonnegative(), actual: z.number().nonnegative().nullable(), variancePercent: z.number().nullable() }),
  }),
  calibration: z.object({
    status: z.enum(["draft", "observed", "review-ready", "reviewed"]),
    observedPeriodStart: z.string(),
    observedPeriodEnd: z.string(),
    dataOwner: z.string(),
    evidenceRefs: z.array(z.string()),
    metricNotes: z.array(calibrationMetricNoteSchema),
    learningDisposition: z.enum(["hold", "project-only", "candidate-rule-update", "candidate-benchmark"]),
    applicableRuleIds: z.array(z.string()),
    dispositionRationale: z.string(),
    reviewedByRole: z.string(),
    reviewedAt: z.string().datetime().nullable(),
  }).default(emptyCalibration),
  deliveryControl: z.object({
    documentId: z.string().max(160),
    revision: z.string().min(1).max(40),
    intendedUse: z.string().min(1).max(500),
    preparedByRole: z.string().max(160),
    reviewedByRole: z.string().max(160),
    externalApprovalReference: z.string().max(240),
    recordedStatus: z.enum(["working-draft", "ready-for-qualified-review", "recorded-external-release"]),
  }).default(emptyDeliveryControl),
  pilotControl: z.object({
    engagementClass: z.enum(["unclassified", "discovery", "blueprint"]),
    commercialStatus: z.enum(["not-recorded", "qualified-unpaid", "paid"]),
    commercialEvidenceReference: z.string().max(240),
    serviceStartedAt: z.string(),
    scopeConfirmedAt: z.string(),
    firstControlledDeliveryAt: z.string(),
    deliveryEffortHours: z.number().nonnegative().max(10000).nullable(),
    acceptanceStatus: z.enum(["not-requested", "pending", "accepted", "accepted-with-actions", "not-accepted"]),
    clientAcceptanceAt: z.string(),
    acceptanceReference: z.string().max(240),
    outcomeNote: z.string().max(2000),
  }).default(emptyPilotControl),
  validationControl: z.object({
    caseId: z.string().max(160),
    status: z.enum(["draft", "in-review", "accepted", "rejected"]),
    confidentialityClass: z.enum(["not-classified", "client-confidential", "internal-anonymized", "shareable"]),
    learningUsePermission: z.enum(["not-assessed", "project-validation-only", "internal-anonymized-learning"]),
    baselineFrozenAt: z.string(),
    casePurpose: z.string().max(2000),
    scopeAlignment: z.enum(["unknown", "yes", "partial", "no"]),
    qualificationEvidenceRefs: z.array(z.string().max(240)),
    acceptanceRationale: z.string().max(2000),
    acceptedByRole: z.string().max(160),
    acceptedAt: z.string().datetime().nullable(),
  }).default(emptyValidationControl),
  checklist: z.array(z.object({ id: z.string().min(1), ownerRole: z.string().min(1), status: checklistStatusSchema, question: z.string().min(1), requiredEvidence: z.string().min(1), relatedRuleIds: z.array(z.string()), reviewerNote: z.string() })),
  methodEvidenceMatrix: z.array(z.object({ id: z.string(), productName: z.string(), market: z.string(), requirementType: z.string(), methodName: z.string(), evidenceIds: z.array(z.string()).min(1), verificationRequirement: z.string(), status: commercialReviewStatusSchema, reviewerNote: z.string() })).default([]),
  ursBasis: z.array(z.object({ id: z.string(), equipmentName: z.string(), equipmentCategory: z.string(), relatedMethodRequirementIds: z.array(z.string()), evidenceIds: z.array(z.string()).default([]), functionalRequirement: z.string(), qualificationImpact: z.string(), status: commercialReviewStatusSchema })).default([]),
  corrections: z.array(z.object({ id: z.string(), recordedAt: z.string(), fieldOrRuleId: z.string(), previousValue: z.string(), correctedValue: z.string(), evidenceRef: z.string(), rationale: z.string(), reviewerRole: z.string() })),
  decisions: z.array(z.object({ id: z.string(), recordedAt: z.string(), decision: z.string(), optionsConsidered: z.array(z.string()), rationale: z.string(), owner: z.string(), downstreamImpact: z.string() })),
  controls: z.object({ expertApprovalInsideAtlas: z.literal(false), containsContactData: z.literal(false), usageNotice: z.string().min(1) }),
});

export type QualityLabEngagementPacket = z.infer<typeof qualityLabEngagementPacketSchema>;

const ownerByCategory: Record<string, string> = {
  portfolio: "QC / Regulatory Affairs", method: "QC method owner", workload: "QC operations", equipment: "Laboratory engineering",
  facility: "Engineering / EHS", cost: "Procurement / Finance", governance: "QA",
};

export function createQualityLabEngagementPacket(project: QualityLabProject, generatedAt = new Date().toISOString()): QualityLabEngagementPacket {
  const { blueprint } = project;
  const packet = {
    packetVersion: QUALITY_LAB_ENGAGEMENT_PACKET_VERSION,
    generatedAt,
    stage: "scope-triage" as const,
    project: { id: project.id, name: project.name, country: project.input.country, facilityType: project.input.facilityType },
    sourceVersions: {
      inputContract: project.input.contractVersion,
      outputContract: blueprint.contractVersion,
      compilerCore: blueprint.compilerCoreVersion,
      domainPack: `${blueprint.domainPack.id}@${blueprint.domainPack.version}`,
    },
    baseline: {
      monthlyTests: { estimate: blueprint.current.monthlyTests, actual: null, variancePercent: null },
      teamFte: { estimate: blueprint.current.totalTeamFte, actual: null, variancePercent: null },
      areaSqm: { estimate: blueprint.current.estimatedAreaSqm, actual: null, variancePercent: null },
      capexLowUsd: { estimate: blueprint.current.capexLowUsd, actual: null, variancePercent: null },
      capexHighUsd: { estimate: blueprint.current.capexHighUsd, actual: null, variancePercent: null },
    },
    calibration: emptyCalibration(),
    deliveryControl: {
      ...emptyDeliveryControl(),
      documentId: `ATLAS-${project.id.toUpperCase()}`,
    },
    pilotControl: emptyPilotControl(),
    validationControl: {
      ...emptyValidationControl(),
      caseId: `VAL-${project.id.toUpperCase()}`,
      baselineFrozenAt: generatedAt,
    },
    checklist: project.actionPlan.actions.filter((action) => action.status !== "resolved").map((action) => ({
      id: `review-${action.sourceInputId}`,
      ownerRole: action.ownerRole || ownerByCategory[action.category] || "Project owner",
      status: action.status === "open" ? "open" as const : "in-review" as const,
      question: action.question,
      requiredEvidence: action.requiredEvidence,
      relatedRuleIds: action.relatedRuleIds,
      reviewerNote: action.evidenceNote,
    })),
    methodEvidenceMatrix: blueprint.methodRequirements.map((item) => ({
      id: `method-evidence-${item.id}`,
      productName: item.productName,
      market: item.market,
      requirementType: item.requirementType,
      methodName: item.methodName,
      evidenceIds: item.evidenceIds,
      verificationRequirement: item.verificationRequirement,
      status: item.evidenceIds.includes("site-approved-methods") ? "needs-site-evidence" as const : "draft" as const,
      reviewerNote: "",
    })),
    ursBasis: blueprint.equipment.map((equipment) => {
      const relatedMethodRequirementIds = equipment.methodRequirementIds ?? blueprint.methodCapacity.filter((item) => item.resourceId === equipment.id).map((item) => item.methodRequirementId);
      const relatedMethods = blueprint.methodRequirements.filter((item) => relatedMethodRequirementIds.includes(item.id));
      return {
        id: `urs-basis-${equipment.id}`,
        equipmentName: equipment.name,
        equipmentCategory: equipment.category,
        relatedMethodRequirementIds,
        evidenceIds: equipment.evidenceIds ?? [],
        functionalRequirement: equipment.specification,
        qualificationImpact: relatedMethods.length > 0
          ? `Confirm configuration, usable capacity and qualification strategy against: ${relatedMethods.map((item) => item.methodName).join("; ")}.`
          : "Confirm configuration, utilities, qualification and workflow fit against approved site methods and the controlled capability model.",
        status: relatedMethods.length > 0 ? "needs-site-evidence" as const : "draft" as const,
      };
    }),
    corrections: [],
    decisions: [],
    controls: {
      expertApprovalInsideAtlas: false as const,
      containsContactData: false as const,
      usageNotice: "Working engagement packet only. Qualified reviewers must resolve evidence, record corrections and approve controlled deliverables under the client quality system.",
    },
  };
  return qualityLabEngagementPacketSchema.parse(packet);
}

export function calculateVariancePercent(estimate: number, actual: number): number | null {
  if (estimate === 0) return actual === 0 ? 0 : null;
  return Math.round(((actual - estimate) / estimate) * 1000) / 10;
}

export type PaidPilotEligibility = "not-a-gate-1-record" | "evidence-incomplete" | "eligible-gate-1-pilot-record";

function parseRecordedTime(value: string): number | null {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function assessPaidPilotEvidence(
  packet: QualityLabEngagementPacket,
  deliveryReadiness: { status: "working-draft" | "ready-for-qualified-review" | "recorded-external-release"; blockers: string[] },
): {
  eligibility: PaidPilotEligibility;
  blockers: string[];
  deliveryCalendarDays: number | null;
  deliveryEffortHours: number | null;
} {
  const pilot = packet.pilotControl;
  const startedAt = parseRecordedTime(pilot.serviceStartedAt);
  const scopeAt = parseRecordedTime(pilot.scopeConfirmedAt);
  const deliveredAt = parseRecordedTime(pilot.firstControlledDeliveryAt);
  const acceptedAt = parseRecordedTime(pilot.clientAcceptanceAt);
  const deliveryCalendarDays = startedAt !== null && deliveredAt !== null
    ? Math.round(((deliveredAt - startedAt) / 86_400_000) * 10) / 10
    : null;

  if (pilot.engagementClass === "unclassified" && pilot.commercialStatus === "not-recorded") {
    return { eligibility: "not-a-gate-1-record", blockers: ["Classify the engagement and record its commercial status."], deliveryCalendarDays, deliveryEffortHours: pilot.deliveryEffortHours };
  }

  const blockers: string[] = [];
  if (pilot.engagementClass === "unclassified") blockers.push("Classify the engagement as discovery or Blueprint.");
  if (pilot.commercialStatus !== "paid") blockers.push("Paid status is required for a paid-pilot record.");
  if (!pilot.commercialEvidenceReference.trim()) blockers.push("A controlled commercial evidence reference is required; do not upload confidential payment data.");
  if (startedAt === null) blockers.push("Record a valid service start timestamp.");
  if (scopeAt === null) blockers.push("Record a valid scope-confirmation timestamp.");
  if (deliveredAt === null) blockers.push("Record the first controlled-delivery timestamp.");
  if (pilot.deliveryEffortHours === null || pilot.deliveryEffortHours <= 0) blockers.push("Record positive delivery effort hours.");
  if (!(["accepted", "accepted-with-actions"] as const).includes(pilot.acceptanceStatus as "accepted" | "accepted-with-actions")) blockers.push("Record client acceptance or acceptance with actions.");
  if (acceptedAt === null) blockers.push("Record a valid client-acceptance timestamp.");
  if (!pilot.acceptanceReference.trim()) blockers.push("A controlled client-acceptance reference is required.");
  if (deliveryReadiness.status !== "recorded-external-release") blockers.push("The computed delivery package must be eligible for recorded external release.");
  if (packet.decisions.length === 0) blockers.push("Capture at least one actual buyer or project decision.");
  if (startedAt !== null && scopeAt !== null && scopeAt < startedAt) blockers.push("Scope confirmation cannot precede service start.");
  if (startedAt !== null && deliveredAt !== null && deliveredAt < startedAt) blockers.push("Controlled delivery cannot precede service start.");
  if (deliveredAt !== null && acceptedAt !== null && acceptedAt < deliveredAt) blockers.push("Client acceptance cannot precede controlled delivery.");

  return {
    eligibility: blockers.length ? "evidence-incomplete" : "eligible-gate-1-pilot-record",
    blockers,
    deliveryCalendarDays,
    deliveryEffortHours: pilot.deliveryEffortHours,
  };
}

export type CalibrationMetricKey = z.infer<typeof calibrationMetricKeySchema>;

export function varianceMagnitude(variancePercent: number | null): "open" | "within-10" | "10-to-25" | "over-25" {
  if (variancePercent === null) return "open";
  const magnitude = Math.abs(variancePercent);
  if (magnitude <= 10) return "within-10";
  if (magnitude <= 25) return "10-to-25";
  return "over-25";
}

export function summarizeCalibration(packet: QualityLabEngagementPacket) {
  const entries = (Object.entries(packet.baseline) as Array<[CalibrationMetricKey, QualityLabEngagementPacket["baseline"][CalibrationMetricKey]]>);
  const observed = entries.filter(([, item]) => item.actual !== null);
  const ranked = observed
    .filter(([, item]) => item.variancePercent !== null)
    .sort((a, b) => Math.abs(b[1].variancePercent ?? 0) - Math.abs(a[1].variancePercent ?? 0));
  const provenanceComplete = Boolean(
    packet.calibration.observedPeriodStart
    && packet.calibration.observedPeriodEnd
    && packet.calibration.dataOwner.trim()
    && packet.calibration.evidenceRefs.length,
  );
  const notesComplete = observed.every(([key]) => {
    const note = packet.calibration.metricNotes.find((item) => item.metric === key);
    return Boolean(note?.actualBasis.trim() && note.varianceDriver !== "not-assessed");
  });
  const reviewReady = observed.length > 0 && provenanceComplete && notesComplete;
  return {
    observedCount: observed.length,
    totalCount: entries.length,
    coveragePercent: Math.round((observed.length / entries.length) * 100),
    provenanceComplete,
    notesComplete,
    reviewReady,
    largestVariance: ranked[0] ? { metric: ranked[0][0], variancePercent: ranked[0][1].variancePercent! } : null,
    materialVarianceCount: ranked.filter(([, item]) => Math.abs(item.variancePercent ?? 0) > 25).length,
    notice: "A review-ready calibration is still project evidence, not an approved Atlas benchmark or automatic rule change.",
  };
}

export type CalibrationEligibility = "hold" | "project-only" | "blocked" | "eligible-for-learning-review";

export function assessCalibrationCandidate(packet: QualityLabEngagementPacket): {
  eligibility: CalibrationEligibility;
  blockers: string[];
  observedMetrics: CalibrationMetricKey[];
} {
  const summary = summarizeCalibration(packet);
  const disposition = packet.calibration.learningDisposition;
  const observedMetrics = (Object.keys(packet.baseline) as CalibrationMetricKey[]).filter((key) => packet.baseline[key].actual !== null);
  if (disposition === "hold") return { eligibility: "hold", blockers: ["Learning disposition remains on hold."], observedMetrics };
  if (disposition === "project-only") return { eligibility: "project-only", blockers: [], observedMetrics };

  const blockers: string[] = [];
  if (!summary.reviewReady) blockers.push("Observation provenance and metric-level variance classification must be complete.");
  if (packet.calibration.status !== "reviewed") blockers.push("Calibration must be reviewed for learning.");
  if (!packet.calibration.reviewedByRole.trim() || !packet.calibration.reviewedAt) blockers.push("Reviewer role and review timestamp are required.");
  if (!packet.calibration.dispositionRationale.trim()) blockers.push("A learning-disposition rationale is required.");
  if (packet.calibration.applicableRuleIds.length === 0) blockers.push("At least one applicable rule ID is required.");
  if (disposition === "candidate-benchmark" && observedMetrics.length < 2) blockers.push("A benchmark candidate requires at least two observed metrics in this project record.");
  return { eligibility: blockers.length ? "blocked" : "eligible-for-learning-review", blockers, observedMetrics };
}

export function createCalibrationLearningCandidate(packet: QualityLabEngagementPacket) {
  const assessment = assessCalibrationCandidate(packet);
  return {
    candidateVersion: "quality-lab-calibration-candidate/v1" as const,
    project: packet.project,
    sourceVersions: packet.sourceVersions,
    calibrationStatus: packet.calibration.status,
    learningDisposition: packet.calibration.learningDisposition,
    eligibility: assessment.eligibility,
    blockers: assessment.blockers,
    observedPeriod: { start: packet.calibration.observedPeriodStart, end: packet.calibration.observedPeriodEnd },
    dataOwner: packet.calibration.dataOwner,
    evidenceRefs: packet.calibration.evidenceRefs,
    applicableRuleIds: packet.calibration.applicableRuleIds,
    dispositionRationale: packet.calibration.dispositionRationale,
    reviewedByRole: packet.calibration.reviewedByRole,
    reviewedAt: packet.calibration.reviewedAt,
    metrics: assessment.observedMetrics.map((metric) => ({
      metric,
      ...packet.baseline[metric],
      ...packet.calibration.metricNotes.find((item) => item.metric === metric),
    })),
    controlNotice: "Candidate for controlled learning review only. Eligibility does not approve a benchmark or change an Atlas rule.",
  };
}
