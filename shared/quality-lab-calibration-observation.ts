import { z } from "zod";
import type { QualityLabProject } from "./quality-lab.js";
import {
  assessCalibrationCandidate,
  calculateVariancePercent,
  calibrationMetricKeySchema,
  summarizeCalibration,
  type QualityLabEngagementPacket,
} from "./quality-lab-engagement.js";

export const QUALITY_LAB_CALIBRATION_OBSERVATION_VERSION = "quality-lab-calibration-observation/v1" as const;
export const QUALITY_LAB_CALIBRATION_REVIEW_VERSION = "quality-lab-calibration-review/v1" as const;
export const QUALITY_LAB_CALIBRATION_REGISTRY_VERSION = "quality-lab-calibration-registry/v1" as const;
export const QUALITY_LAB_CALIBRATION_FINGERPRINT_VERSION = "atlas-canonical-fingerprint/v1" as const;

const calibrationEligibilitySchema = z.enum(["hold", "project-only", "blocked", "eligible-for-learning-review"]);
const calibrationReviewDecisionSchema = z.enum(["accepted-evidence", "rejected", "withdrawn"]);
export const calibrationReviewStatusSchema = z.enum(["captured", "eligible", "accepted-evidence", "rejected", "withdrawn"]);

const calibrationObservationMetricSchema = z.object({
  metric: calibrationMetricKeySchema,
  estimate: z.number().nonnegative(),
  actual: z.number().nonnegative(),
  variancePercent: z.number().nullable(),
  actualBasis: z.string().min(1),
  varianceDriver: z.enum(["input-quality", "scope-change", "rule-assumption", "site-performance", "market-price", "implementation-choice", "mixed"]),
  reviewerNote: z.string(),
  lineageIds: z.array(z.string()),
});

export const qualityLabCalibrationObservationSchema = z.object({
  observationVersion: z.literal(QUALITY_LAB_CALIBRATION_OBSERVATION_VERSION),
  observationId: z.string().min(1),
  recordedAt: z.string().datetime(),
  fingerprintVersion: z.literal(QUALITY_LAB_CALIBRATION_FINGERPRINT_VERSION),
  sourceFingerprint: z.string().min(1),
  observationFingerprint: z.string().min(1),
  source: z.object({
    projectId: z.string().min(1),
    projectName: z.string().min(1),
    projectCreatedAt: z.string().datetime(),
    projectRevisionReference: z.string().datetime(),
    engagementPacketGeneratedAt: z.string().datetime(),
    inputContract: z.string().min(1),
    outputContract: z.string().min(1),
    compilerCore: z.string().min(1),
    blueprintEngine: z.string().min(1),
    domainPack: z.string().min(1),
    ruleRefs: z.array(z.object({ ruleId: z.string().min(1), ruleVersion: z.string().min(1) })),
  }),
  observedPeriod: z.object({ start: z.string().min(1), end: z.string().min(1) }),
  dataOwner: z.string().min(1),
  evidenceRefs: z.array(z.string().min(1)).min(1),
  metrics: z.array(calibrationObservationMetricSchema).min(1),
  learningDisposition: z.enum(["hold", "project-only", "candidate-rule-update", "candidate-benchmark"]),
  applicableRuleIds: z.array(z.string()),
  dispositionRationale: z.string(),
  reviewedByRole: z.string(),
  reviewedAt: z.string().datetime().nullable(),
  eligibilityAtFreeze: z.object({
    status: calibrationEligibilitySchema,
    blockers: z.array(z.string()),
  }),
  controls: z.object({
    immutableSnapshot: z.literal(true),
    automaticRuleUpdate: z.literal(false),
    automaticBenchmarkApproval: z.literal(false),
    notice: z.string().min(1),
  }),
});

export const calibrationReviewEventSchema = z.object({
  eventId: z.string().min(1),
  observationId: z.string().min(1),
  decision: calibrationReviewDecisionSchema,
  recordedAt: z.string().datetime(),
  reviewedByRole: z.string().min(1),
  externalReviewReference: z.string().min(1),
  rationale: z.string().min(1),
  controls: z.object({
    changesExecutableRules: z.literal(false),
    approvesUniversalBenchmark: z.literal(false),
  }),
});

export const qualityLabCalibrationReviewCaseSchema = z.object({
  reviewVersion: z.literal(QUALITY_LAB_CALIBRATION_REVIEW_VERSION),
  observation: qualityLabCalibrationObservationSchema,
  events: z.array(calibrationReviewEventSchema),
});

export type QualityLabCalibrationObservation = z.infer<typeof qualityLabCalibrationObservationSchema>;
export type CalibrationReviewEvent = z.infer<typeof calibrationReviewEventSchema>;
export type QualityLabCalibrationReviewCase = z.infer<typeof qualityLabCalibrationReviewCaseSchema>;
export type CalibrationReviewDecision = z.infer<typeof calibrationReviewDecisionSchema>;
export type CalibrationReviewStatus = z.infer<typeof calibrationReviewStatusSchema>;

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, canonicalize(item)]));
  }
  return value;
}

function fingerprint(value: unknown): string {
  const text = JSON.stringify(canonicalize(value));
  let first = 0x811c9dc5;
  let second = 0x9e3779b1;
  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    first = Math.imul(first ^ code, 0x01000193) >>> 0;
    second = Math.imul(second ^ (code + index), 0x85ebca6b) >>> 0;
  }
  return `${first.toString(16).padStart(8, "0")}${second.toString(16).padStart(8, "0")}`;
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value as Record<string, unknown>).forEach(deepFreeze);
  }
  return value;
}

function lineageIds(metric: z.infer<typeof calibrationMetricKeySchema>, project: QualityLabProject): string[] {
  const outputKeys: Partial<Record<z.infer<typeof calibrationMetricKeySchema>, string>> = {
    teamFte: "current.totalTeamFte",
    areaSqm: "current.estimatedAreaSqm",
    capexLowUsd: "current.capexLowUsd",
    capexHighUsd: "current.capexHighUsd",
  };
  const outputKey = outputKeys[metric];
  if (!outputKey) return [];
  return project.blueprint.decisionLineage.filter((item) => item.outputKey === outputKey).map((item) => item.id);
}

function observationMaterial(observation: Omit<QualityLabCalibrationObservation, "observationId" | "recordedAt" | "observationFingerprint">) {
  return observation;
}

export function createQualityLabCalibrationObservation(
  project: QualityLabProject,
  packet: QualityLabEngagementPacket,
  recordedAt = new Date().toISOString(),
): QualityLabCalibrationObservation {
  if (packet.project.id !== project.id) throw new Error("Calibration packet and Blueprint project do not match.");
  const summary = summarizeCalibration(packet);
  if (!summary.reviewReady) throw new Error("Observation provenance and metric-level variance classification must be complete before freezing.");
  const observedStart = Date.parse(packet.calibration.observedPeriodStart);
  const observedEnd = Date.parse(packet.calibration.observedPeriodEnd);
  if (!Number.isFinite(observedStart) || !Number.isFinite(observedEnd) || observedEnd < observedStart) throw new Error("The observed period must contain valid dates in chronological order.");
  const assessment = assessCalibrationCandidate(packet);
  const metrics = calibrationMetricKeySchema.options.flatMap((metric) => {
    const baseline = packet.baseline[metric];
    if (baseline.actual === null) return [];
    const note = packet.calibration.metricNotes.find((item) => item.metric === metric);
    if (!note?.actualBasis.trim() || note.varianceDriver === "not-assessed") throw new Error(`Observed metric ${metric} needs an actual basis and variance driver.`);
    return [{
      metric,
      estimate: baseline.estimate,
      actual: baseline.actual,
      variancePercent: calculateVariancePercent(baseline.estimate, baseline.actual),
      actualBasis: note.actualBasis.trim(),
      varianceDriver: note.varianceDriver,
      reviewerNote: note.reviewerNote.trim(),
      lineageIds: lineageIds(metric, project),
    }];
  });
  const ruleRefs = project.blueprint.ruleTrace.map((rule) => ({ ruleId: rule.ruleId, ruleVersion: rule.ruleVersion })).sort((a, b) => a.ruleId.localeCompare(b.ruleId));
  const sourceRuleIds = new Set(ruleRefs.map((item) => item.ruleId));
  const unknownRuleIds = packet.calibration.applicableRuleIds.filter((ruleId) => !sourceRuleIds.has(ruleId));
  if (unknownRuleIds.length > 0) throw new Error(`Applicable rules are not present in the frozen Blueprint trace: ${unknownRuleIds.join(", ")}.`);
  const source = {
    projectId: project.id,
    projectName: project.name,
    projectCreatedAt: project.createdAt,
    projectRevisionReference: project.updatedAt,
    engagementPacketGeneratedAt: packet.generatedAt,
    inputContract: packet.sourceVersions.inputContract,
    outputContract: packet.sourceVersions.outputContract,
    compilerCore: packet.sourceVersions.compilerCore,
    blueprintEngine: project.blueprint.engineVersion,
    domainPack: packet.sourceVersions.domainPack,
    ruleRefs,
  };
  const sourceFingerprint = fingerprint({ source, estimates: Object.fromEntries(metrics.map((item) => [item.metric, item.estimate])) });
  const material = {
    observationVersion: QUALITY_LAB_CALIBRATION_OBSERVATION_VERSION,
    fingerprintVersion: QUALITY_LAB_CALIBRATION_FINGERPRINT_VERSION,
    sourceFingerprint,
    source,
    observedPeriod: { start: packet.calibration.observedPeriodStart, end: packet.calibration.observedPeriodEnd },
    dataOwner: packet.calibration.dataOwner.trim(),
    evidenceRefs: [...packet.calibration.evidenceRefs].map((item) => item.trim()).filter(Boolean).sort(),
    metrics,
    learningDisposition: packet.calibration.learningDisposition,
    applicableRuleIds: [...packet.calibration.applicableRuleIds].sort(),
    dispositionRationale: packet.calibration.dispositionRationale.trim(),
    reviewedByRole: packet.calibration.reviewedByRole.trim(),
    reviewedAt: packet.calibration.reviewedAt,
    eligibilityAtFreeze: { status: assessment.eligibility, blockers: assessment.blockers },
    controls: {
      immutableSnapshot: true as const,
      automaticRuleUpdate: false as const,
      automaticBenchmarkApproval: false as const,
      notice: "Immutable project observation only. Review acceptance does not update an Atlas rule, approve a universal benchmark or validate the Domain Pack.",
    },
  };
  const observationFingerprint = fingerprint(observationMaterial({ ...material }));
  const observation = qualityLabCalibrationObservationSchema.parse({
    ...material,
    observationId: `calobs_${observationFingerprint}`,
    recordedAt,
    observationFingerprint,
  });
  return deepFreeze(observation);
}

export function verifyQualityLabCalibrationObservation(observation: QualityLabCalibrationObservation): QualityLabCalibrationObservation {
  const parsed = qualityLabCalibrationObservationSchema.parse(observation);
  const { observationId: _id, recordedAt: _recordedAt, observationFingerprint: _fingerprint, ...material } = parsed;
  const expected = fingerprint(observationMaterial(material));
  if (expected !== parsed.observationFingerprint || parsed.observationId !== `calobs_${expected}`) throw new Error("Calibration observation integrity check failed.");
  const expectedSource = fingerprint({ source: parsed.source, estimates: Object.fromEntries(parsed.metrics.map((item) => [item.metric, item.estimate])) });
  if (expectedSource !== parsed.sourceFingerprint) throw new Error("Calibration source fingerprint integrity check failed.");
  for (const metric of parsed.metrics) {
    if (metric.variancePercent !== calculateVariancePercent(metric.estimate, metric.actual)) throw new Error(`Calibration variance integrity check failed for ${metric.metric}.`);
  }
  return deepFreeze(parsed);
}

export function createCalibrationReviewCase(observation: QualityLabCalibrationObservation): QualityLabCalibrationReviewCase {
  return deepFreeze(qualityLabCalibrationReviewCaseSchema.parse({
    reviewVersion: QUALITY_LAB_CALIBRATION_REVIEW_VERSION,
    observation: verifyQualityLabCalibrationObservation(observation),
    events: [],
  }));
}

export function calibrationReviewStatus(reviewCase: QualityLabCalibrationReviewCase): CalibrationReviewStatus {
  const last = reviewCase.events.at(-1);
  if (last) return last.decision;
  return reviewCase.observation.eligibilityAtFreeze.status === "eligible-for-learning-review" ? "eligible" : "captured";
}

export function appendCalibrationReviewEvent(
  reviewCase: QualityLabCalibrationReviewCase,
  input: Omit<CalibrationReviewEvent, "eventId" | "observationId" | "controls">,
): QualityLabCalibrationReviewCase {
  const parsed = qualityLabCalibrationReviewCaseSchema.parse(reviewCase);
  verifyQualityLabCalibrationObservation(parsed.observation);
  const current = calibrationReviewStatus(parsed);
  if (current === "rejected" || current === "withdrawn") throw new Error("A rejected or withdrawn observation is closed; freeze a new observation for another review.");
  if (current === "accepted-evidence" && input.decision !== "withdrawn") throw new Error("Accepted calibration evidence can only be withdrawn; freeze a new observation for another decision.");
  if (input.decision === "accepted-evidence" && current !== "eligible") throw new Error("Only an eligible frozen candidate can be accepted as calibration evidence.");
  if (input.decision === "withdrawn" && current === "captured") throw new Error("A captured observation must first become an eligible candidate before it can be withdrawn.");
  if (Date.parse(input.recordedAt) < Date.parse(parsed.observation.recordedAt)) throw new Error("A review event cannot precede the frozen observation.");
  const event = calibrationReviewEventSchema.parse({
    ...input,
    eventId: `calrev_${fingerprint({ observationId: parsed.observation.observationId, ...input })}`,
    observationId: parsed.observation.observationId,
    reviewedByRole: input.reviewedByRole.trim(),
    externalReviewReference: input.externalReviewReference.trim(),
    rationale: input.rationale.trim(),
    controls: { changesExecutableRules: false, approvesUniversalBenchmark: false },
  });
  return deepFreeze(qualityLabCalibrationReviewCaseSchema.parse({ ...parsed, events: [...parsed.events, event] }));
}

export function createCalibrationObservationRegistry(cases: QualityLabCalibrationReviewCase[], generatedAt = new Date().toISOString()) {
  const verified = cases.map((item) => qualityLabCalibrationReviewCaseSchema.parse({ ...item, observation: verifyQualityLabCalibrationObservation(item.observation) }));
  return {
    registryVersion: QUALITY_LAB_CALIBRATION_REGISTRY_VERSION,
    generatedAt,
    cases: verified.map((item) => ({ ...item, currentStatus: calibrationReviewStatus(item) })),
    controls: {
      automaticRuleUpdate: false as const,
      automaticBenchmarkApproval: false as const,
      notice: "Append-only working registry. Accepted evidence remains project evidence until separate validation, rule-change and Domain Pack release controls are satisfied.",
    },
  };
}

export function acceptedCalibrationEvidenceForProject(cases: QualityLabCalibrationReviewCase[], projectId: string): QualityLabCalibrationReviewCase | null {
  return cases
    .filter((item) => item.observation.source.projectId === projectId && calibrationReviewStatus(item) === "accepted-evidence")
    .sort((a, b) => (b.events.at(-1)?.recordedAt ?? "").localeCompare(a.events.at(-1)?.recordedAt ?? ""))[0] ?? null;
}
