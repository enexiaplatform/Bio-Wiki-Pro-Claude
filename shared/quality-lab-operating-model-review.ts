import { z } from "zod";
import type { QualityLabProject } from "./quality-lab.js";
import type { QualityLabEngagementPacket } from "./quality-lab-engagement.js";
import {
  analyzeQualityLabOperatingModel,
  operatingModeValues,
  qualityLabOperatingModelAnalysisSchema,
  qualityLabOperatingModelInputSchema,
  type QualityLabOperatingModelAnalysis,
  type QualityLabOperatingModelInput,
} from "./quality-lab-operating-model.js";

export const QUALITY_LAB_OPERATING_MODEL_REVIEW_DRAFT_VERSION = "quality-lab-operating-model-review-draft/v1" as const;
export const QUALITY_LAB_OPERATING_MODEL_REVIEW_VERSION = "quality-lab-operating-model-review/v1" as const;
export const QUALITY_LAB_OPERATING_MODEL_REVIEW_REGISTRY_VERSION = "quality-lab-operating-model-review-registry/v1" as const;
export const QUALITY_LAB_OPERATING_MODEL_REVIEW_FINGERPRINT_VERSION = "atlas-operating-model-review-fingerprint/v1" as const;

export const operatingModelStakeholderValues = ["quality-assurance", "laboratory", "finance", "procurement"] as const;
export const operatingModelReviewOutcomeValues = ["not-reviewed", "agree", "agree-with-actions", "disagree", "defer"] as const;

const stakeholderReviewSchema = z.object({
  stakeholder: z.enum(operatingModelStakeholderValues),
  reviewerRole: z.string().max(160),
  status: z.enum(["not-reviewed", "reviewed-no-objection", "concern-recorded"]),
  externalReviewReference: z.string().max(240),
  note: z.string().max(1000),
});

const applicationReviewSchema = z.object({
  applicationId: z.string().min(1),
  outcome: z.enum(operatingModelReviewOutcomeValues),
  reviewedMode: z.enum(operatingModeValues).nullable(),
  rationale: z.string().max(2000),
  evidenceRefs: z.array(z.string().max(240)),
  requiredActions: z.array(z.string().max(500)),
});

export const qualityLabOperatingModelReviewDraftSchema = z.object({
  draftVersion: z.literal(QUALITY_LAB_OPERATING_MODEL_REVIEW_DRAFT_VERSION),
  projectId: z.string().min(1),
  operatingModelInputUpdatedAt: z.string().datetime(),
  reviewPurpose: z.string().max(1000),
  facilitatorRole: z.string().max(160),
  stakeholders: z.array(stakeholderReviewSchema).length(operatingModelStakeholderValues.length),
  applications: z.array(applicationReviewSchema),
  updatedAt: z.string().datetime(),
});

const reviewBlockerSchema = z.object({
  id: z.string().min(1),
  category: z.enum(["commercial", "model-evidence", "application-review", "stakeholder-review"]),
  applicationId: z.string().nullable(),
  message: z.string().min(1),
  resolution: z.string().min(1),
});

export const qualityLabOperatingModelReviewAssessmentSchema = z.object({
  eligibleToFreeze: z.boolean(),
  blockers: z.array(reviewBlockerSchema),
  summary: z.object({ applicationCount: z.number().int().min(0), applicationReviewsComplete: z.number().int().min(0), stakeholderReviewsComplete: z.number().int().min(0) }),
  boundary: z.string().min(1),
});

const frozenApplicationReviewSchema = applicationReviewSchema.extend({
  label: z.string().min(1),
  modelMode: z.enum(operatingModeValues),
  alignment: z.enum(["aligned", "changed-with-rationale", "deferred"]),
  lineageId: z.string().min(1),
});

export const qualityLabOperatingModelReviewSnapshotSchema = z.object({
  reviewVersion: z.literal(QUALITY_LAB_OPERATING_MODEL_REVIEW_VERSION),
  snapshotId: z.string().min(1),
  recordedAt: z.string().datetime(),
  fingerprintVersion: z.literal(QUALITY_LAB_OPERATING_MODEL_REVIEW_FINGERPRINT_VERSION),
  sourceFingerprint: z.string().min(1),
  reviewFingerprint: z.string().min(1),
  source: z.object({
    projectId: z.string().min(1),
    projectName: z.string().min(1),
    projectRevision: z.string().datetime(),
    reviewRequestedAt: z.string().datetime(),
    engagementPacketGeneratedAt: z.string().datetime(),
    commercialEvidenceReference: z.string().min(1),
    inputContract: z.string().min(1),
    analysisContract: z.string().min(1),
    compilerCore: z.string().min(1),
    blueprintEngine: z.string().min(1),
    domainPack: z.string().min(1),
  }),
  operatingModelInput: qualityLabOperatingModelInputSchema,
  operatingModelAnalysis: qualityLabOperatingModelAnalysisSchema,
  review: z.object({
    reviewPurpose: z.string().min(1),
    facilitatorRole: z.string().min(1),
    stakeholders: z.array(stakeholderReviewSchema).length(operatingModelStakeholderValues.length),
    applications: z.array(frozenApplicationReviewSchema).min(1),
  }),
  comparison: z.object({ aligned: z.number().int().min(0), changedWithRationale: z.number().int().min(0), deferred: z.number().int().min(0) }),
  controls: z.object({
    immutableSnapshot: z.literal(true),
    approvesOperatingModel: z.literal(false),
    selectsSupplier: z.literal(false),
    changesExecutableRules: z.literal(false),
    createsValidationEvidence: z.literal(false),
    notice: z.string().min(1),
  }),
});

export const qualityLabOperatingModelReviewRegistrySchema = z.object({
  registryVersion: z.literal(QUALITY_LAB_OPERATING_MODEL_REVIEW_REGISTRY_VERSION),
  generatedAt: z.string().datetime(),
  snapshots: z.array(qualityLabOperatingModelReviewSnapshotSchema),
  controls: z.object({ projectDecisionRecordsOnly: z.literal(true), automaticRuleUpdate: z.literal(false), notice: z.string().min(1) }),
});

export type QualityLabOperatingModelReviewDraft = z.infer<typeof qualityLabOperatingModelReviewDraftSchema>;
export type QualityLabOperatingModelReviewAssessment = z.infer<typeof qualityLabOperatingModelReviewAssessmentSchema>;
export type QualityLabOperatingModelReviewSnapshot = z.infer<typeof qualityLabOperatingModelReviewSnapshotSchema>;

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, canonicalize(item)]));
  return value;
}

function fingerprint(value: unknown) {
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

function unique(values: string[]) {
  return Array.from(new Set(values.map((item) => item.trim()).filter(Boolean)));
}

export function createQualityLabOperatingModelReviewDraft(
  project: QualityLabProject,
  input: QualityLabOperatingModelInput,
  previous?: unknown,
  now = new Date().toISOString(),
): QualityLabOperatingModelReviewDraft {
  const analysis = analyzeQualityLabOperatingModel(project, input, input.updatedAt);
  const parsed = qualityLabOperatingModelReviewDraftSchema.safeParse(previous);
  const prior = parsed.success && parsed.data.projectId === project.id ? parsed.data : null;
  const priorApplications = new Map(prior?.applications.map((item) => [item.applicationId, item]) ?? []);
  const priorStakeholders = new Map(prior?.stakeholders.map((item) => [item.stakeholder, item]) ?? []);
  return qualityLabOperatingModelReviewDraftSchema.parse({
    draftVersion: QUALITY_LAB_OPERATING_MODEL_REVIEW_DRAFT_VERSION,
    projectId: project.id,
    operatingModelInputUpdatedAt: input.updatedAt,
    reviewPurpose: prior?.reviewPurpose ?? "Compare the bounded Atlas operating-model conclusion with qualified project stakeholder review before any procurement, transfer or design-freeze decision.",
    facilitatorRole: prior?.facilitatorRole ?? "",
    stakeholders: operatingModelStakeholderValues.map((stakeholder) => priorStakeholders.get(stakeholder) ?? { stakeholder, reviewerRole: "", status: "not-reviewed", externalReviewReference: "", note: "" }),
    applications: analysis.applications.map((application) => priorApplications.get(application.id) ?? { applicationId: application.id, outcome: "not-reviewed", reviewedMode: null, rationale: "", evidenceRefs: [], requiredActions: [] }),
    updatedAt: now,
  });
}

export function assessQualityLabOperatingModelReview(
  project: QualityLabProject,
  input: QualityLabOperatingModelInput,
  engagement: QualityLabEngagementPacket,
  rawDraft: unknown,
): QualityLabOperatingModelReviewAssessment {
  const draft = createQualityLabOperatingModelReviewDraft(project, input, rawDraft);
  const analysis = analyzeQualityLabOperatingModel(project, input, input.updatedAt);
  const blockers: z.infer<typeof reviewBlockerSchema>[] = [];
  const add = (id: string, category: z.infer<typeof reviewBlockerSchema>["category"], message: string, resolution: string, applicationId: string | null = null) => blockers.push({ id, category, applicationId, message, resolution });

  if (engagement.project.id !== project.id) add("commercial:project-mismatch", "commercial", "The engagement packet does not belong to this Blueprint project.", "Open or create the engagement packet for this exact project revision.");
  if (!project.reviewRequestedAt) add("commercial:review-not-requested", "commercial", "The project has not entered the expert-review workflow.", "Submit the project for expert review before freezing a paid-diagnostic decision record.");
  if (engagement.pilotControl.engagementClass === "unclassified") add("commercial:engagement-class", "commercial", "The engagement class is not recorded.", "Classify the engagement as discovery or Blueprint in the service-assisted review workspace.");
  if (engagement.pilotControl.commercialStatus !== "paid") add("commercial:paid-status", "commercial", "Paid diagnostic status is not evidenced.", "Record paid status in the engagement workspace; a qualified or unpaid lead is not a paid-project evidence record.");
  if (!engagement.pilotControl.commercialEvidenceReference.trim()) add("commercial:paid-reference", "commercial", "The paid diagnostic has no commercial evidence reference.", "Record an invoice-status, purchase-order or controlled CRM reference without adding contact or payment-card data.");
  if (!draft.reviewPurpose.trim()) add("review:purpose", "stakeholder-review", "The review purpose is not recorded.", "State the bounded project decision this stakeholder review supports.");
  if (!draft.facilitatorRole.trim()) add("review:facilitator", "stakeholder-review", "The facilitator role is not recorded.", "Record the accountable facilitation role; do not enter personal contact data.");

  for (const application of analysis.applications) {
    const review = draft.applications.find((item) => item.applicationId === application.id)!;
    if (application.recommendedMode === "evidence-required") add(`model:${application.id}:evidence`, "model-evidence", `${application.label} still requires material evidence before an operating mode can be reviewed.`, "Resolve the exact evidence requests in the application worksheet and rerun the analysis.", application.id);
    if (review.outcome === "not-reviewed") add(`review:${application.id}:outcome`, "application-review", `${application.label} has not been reviewed.`, "Record agreement, agreement with actions, disagreement or deferral.", application.id);
    if (review.reviewedMode === null) add(`review:${application.id}:mode`, "application-review", `${application.label} has no stakeholder-reviewed operating mode.`, "Select the reviewed mode, including evidence required when the decision is deferred.", application.id);
    if (!review.rationale.trim()) add(`review:${application.id}:rationale`, "application-review", `${application.label} has no review rationale.`, "Record why stakeholders agree, change or defer the model conclusion.", application.id);
    if (unique(review.evidenceRefs).length === 0) add(`review:${application.id}:evidence`, "application-review", `${application.label} has no controlled review evidence reference.`, "Reference the quotation, qualification record, stability evidence, quality agreement, cost review or other controlled basis used.", application.id);
    if (review.outcome === "agree" && review.reviewedMode !== application.recommendedMode) add(`review:${application.id}:alignment`, "application-review", `${application.label} is marked agree but the reviewed mode differs from the model.`, "Select the model mode or change the outcome to disagree/agree with actions.", application.id);
    if (review.outcome === "disagree" && review.reviewedMode === application.recommendedMode) add(`review:${application.id}:disagreement`, "application-review", `${application.label} is marked disagree but keeps the model mode.`, "Record the changed mode or use agree with actions when the mode is retained.", application.id);
    if (review.outcome === "defer" && review.reviewedMode !== "evidence-required") add(`review:${application.id}:defer`, "application-review", `${application.label} is deferred without an evidence-required reviewed mode.`, "Set the reviewed mode to evidence required and record the evidence/action needed.", application.id);
    if (review.outcome === "agree-with-actions" && unique(review.requiredActions).length === 0) add(`review:${application.id}:actions`, "application-review", `${application.label} is agreed with actions but no action is recorded.`, "Record at least one controlled follow-up action.", application.id);
  }

  for (const stakeholder of draft.stakeholders) {
    const label = stakeholder.stakeholder.replaceAll("-", " ");
    if (stakeholder.status === "not-reviewed") add(`stakeholder:${stakeholder.stakeholder}:status`, "stakeholder-review", `${label} review is not recorded.`, `Record the ${label} review status.`);
    if (!stakeholder.reviewerRole.trim()) add(`stakeholder:${stakeholder.stakeholder}:role`, "stakeholder-review", `${label} reviewer role is missing.`, `Record the accountable ${label} reviewer role without personal contact data.`);
    if (!stakeholder.externalReviewReference.trim()) add(`stakeholder:${stakeholder.stakeholder}:reference`, "stakeholder-review", `${label} review has no external reference.`, `Reference the controlled ${label} review record or meeting decision.`);
  }

  const applicationReviewsComplete = analysis.applications.filter((application) => !blockers.some((item) => item.applicationId === application.id)).length;
  const stakeholderReviewsComplete = draft.stakeholders.filter((stakeholder) => !blockers.some((item) => item.id.startsWith(`stakeholder:${stakeholder.stakeholder}:`))).length;
  return qualityLabOperatingModelReviewAssessmentSchema.parse({
    eligibleToFreeze: blockers.length === 0,
    blockers,
    summary: { applicationCount: analysis.applications.length, applicationReviewsComplete, stakeholderReviewsComplete },
    boundary: "Freeze eligibility means the project review record is complete enough to preserve. It does not approve the operating model, qualify a laboratory, authorize transfer, select a supplier, release a purchase order or create validation evidence.",
  });
}

function reviewMaterial(snapshot: Omit<QualityLabOperatingModelReviewSnapshot, "snapshotId" | "recordedAt" | "reviewFingerprint">) {
  return snapshot;
}

export function createQualityLabOperatingModelReviewSnapshot(
  project: QualityLabProject,
  input: QualityLabOperatingModelInput,
  engagement: QualityLabEngagementPacket,
  rawDraft: unknown,
  recordedAt = new Date().toISOString(),
): QualityLabOperatingModelReviewSnapshot {
  const draft = createQualityLabOperatingModelReviewDraft(project, input, rawDraft, recordedAt);
  const assessment = assessQualityLabOperatingModelReview(project, input, engagement, draft);
  if (!assessment.eligibleToFreeze) throw new Error(`Operating-model review is not ready to freeze:\n- ${assessment.blockers.map((item) => item.message).join("\n- ")}`);
  const analysis = analyzeQualityLabOperatingModel(project, input, input.updatedAt);
  const source = {
    projectId: project.id,
    projectName: project.name,
    projectRevision: project.updatedAt,
    reviewRequestedAt: project.reviewRequestedAt!,
    engagementPacketGeneratedAt: engagement.generatedAt,
    commercialEvidenceReference: engagement.pilotControl.commercialEvidenceReference.trim(),
    inputContract: input.contractVersion,
    analysisContract: analysis.contractVersion,
    compilerCore: project.blueprint.compilerCoreVersion,
    blueprintEngine: project.blueprint.engineVersion,
    domainPack: `${project.blueprint.domainPack.id}@${project.blueprint.domainPack.version}`,
  };
  const sourceFingerprint = fingerprint({ source, operatingModelInput: input, operatingModelAnalysis: analysis });
  const applications = analysis.applications.map((application) => {
    const review = draft.applications.find((item) => item.applicationId === application.id)!;
    const alignment = review.outcome === "defer" ? "deferred" as const : review.reviewedMode === application.recommendedMode ? "aligned" as const : "changed-with-rationale" as const;
    return { ...review, rationale: review.rationale.trim(), evidenceRefs: unique(review.evidenceRefs), requiredActions: unique(review.requiredActions), label: application.label, modelMode: application.recommendedMode, alignment, lineageId: application.lineage.id };
  });
  const material = {
    reviewVersion: QUALITY_LAB_OPERATING_MODEL_REVIEW_VERSION,
    fingerprintVersion: QUALITY_LAB_OPERATING_MODEL_REVIEW_FINGERPRINT_VERSION,
    sourceFingerprint,
    source,
    operatingModelInput: input,
    operatingModelAnalysis: analysis,
    review: {
      reviewPurpose: draft.reviewPurpose.trim(),
      facilitatorRole: draft.facilitatorRole.trim(),
      stakeholders: draft.stakeholders.map((item) => ({ ...item, reviewerRole: item.reviewerRole.trim(), externalReviewReference: item.externalReviewReference.trim(), note: item.note.trim() })),
      applications,
    },
    comparison: {
      aligned: applications.filter((item) => item.alignment === "aligned").length,
      changedWithRationale: applications.filter((item) => item.alignment === "changed-with-rationale").length,
      deferred: applications.filter((item) => item.alignment === "deferred").length,
    },
    controls: {
      immutableSnapshot: true as const,
      approvesOperatingModel: false as const,
      selectsSupplier: false as const,
      changesExecutableRules: false as const,
      createsValidationEvidence: false as const,
      notice: "Immutable paid-diagnostic project review record only. Client-controlled approval, qualification, transfer, procurement and validation governance remain outside Atlas.",
    },
  };
  const reviewFingerprint = fingerprint(reviewMaterial(material));
  return deepFreeze(qualityLabOperatingModelReviewSnapshotSchema.parse({ ...material, snapshotId: `omrev_${reviewFingerprint}`, recordedAt, reviewFingerprint }));
}

export function verifyQualityLabOperatingModelReviewSnapshot(snapshot: QualityLabOperatingModelReviewSnapshot) {
  const parsed = qualityLabOperatingModelReviewSnapshotSchema.parse(snapshot);
  const { snapshotId: _id, recordedAt: _recordedAt, reviewFingerprint: _reviewFingerprint, ...material } = parsed;
  const expectedReview = fingerprint(reviewMaterial(material));
  if (parsed.snapshotId !== `omrev_${expectedReview}` || parsed.reviewFingerprint !== expectedReview) throw new Error("Operating-model review fingerprint integrity check failed.");
  const expectedSource = fingerprint({ source: parsed.source, operatingModelInput: parsed.operatingModelInput, operatingModelAnalysis: parsed.operatingModelAnalysis });
  if (expectedSource !== parsed.sourceFingerprint) throw new Error("Operating-model review source integrity check failed.");
  const analysisById = new Map(parsed.operatingModelAnalysis.applications.map((item) => [item.id, item]));
  for (const review of parsed.review.applications) {
    const application = analysisById.get(review.applicationId);
    if (!application || application.recommendedMode !== review.modelMode || application.lineage.id !== review.lineageId) throw new Error(`Operating-model review application trace failed for ${review.applicationId}.`);
  }
  const comparison = {
    aligned: parsed.review.applications.filter((item) => item.alignment === "aligned").length,
    changedWithRationale: parsed.review.applications.filter((item) => item.alignment === "changed-with-rationale").length,
    deferred: parsed.review.applications.filter((item) => item.alignment === "deferred").length,
  };
  if (JSON.stringify(comparison) !== JSON.stringify(parsed.comparison)) throw new Error("Operating-model review comparison integrity check failed.");
  return deepFreeze(parsed);
}

export function createQualityLabOperatingModelReviewRegistry(snapshots: QualityLabOperatingModelReviewSnapshot[], generatedAt = new Date().toISOString()) {
  return qualityLabOperatingModelReviewRegistrySchema.parse({
    registryVersion: QUALITY_LAB_OPERATING_MODEL_REVIEW_REGISTRY_VERSION,
    generatedAt,
    snapshots: snapshots.map(verifyQualityLabOperatingModelReviewSnapshot).sort((a, b) => b.recordedAt.localeCompare(a.recordedAt)),
    controls: { projectDecisionRecordsOnly: true, automaticRuleUpdate: false, notice: "Portable immutable project review records. Inclusion does not create approval, validation evidence or a reusable Atlas rule/benchmark." },
  });
}
