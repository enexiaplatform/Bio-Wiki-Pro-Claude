import { z } from "zod";
import { getQualityLabReadiness, qualityLabBlueprintSchema, qualityLabInputSchema, type QualityLabProject } from "./quality-lab.js";
import { qualityLabEngagementPacketSchema } from "./quality-lab-engagement.js";
import { qualityLabActionPlanSchema, reconcileQualityLabActionPlan } from "./quality-lab-actions.js";
import { qualityLabDecisionRegisterSchema, reconcileQualityLabDecisionRegister } from "./quality-lab-decisions.js";
import { createEmptyQualityLabEvidenceRegister, qualityLabEvidenceRegisterSchema } from "./quality-lab-evidence.js";
import { ensureQualityLabProjectHistory, qualityLabFrozenRevisionSchema } from "./quality-lab-revisions.js";

export const QUALITY_LAB_ACCOUNT_SNAPSHOT_VERSION = "quality-lab-account-project/v3" as const;
export const QUALITY_LAB_V2_ACCOUNT_SNAPSHOT_VERSION = "quality-lab-account-project/v2" as const;
export const QUALITY_LAB_LEGACY_ACCOUNT_SNAPSHOT_VERSION = "quality-lab-account-project/v1" as const;
export const QUALITY_LAB_LOCAL_STORE_VERSION = "quality-lab-local-store/v2" as const;

/**
 * Versioned account snapshot used only after an authenticated user explicitly
 * saves a project. Browser-local storage remains the resilient working copy.
 */
const qualityLabReviewedProjectSnapshotBaseSchema = z.object({
  snapshotVersion: z.union([
    z.literal(QUALITY_LAB_ACCOUNT_SNAPSHOT_VERSION),
    z.literal(QUALITY_LAB_V2_ACCOUNT_SNAPSHOT_VERSION),
    z.literal(QUALITY_LAB_LEGACY_ACCOUNT_SNAPSHOT_VERSION),
  ]).optional(),
  localProjectId: z.string().min(1).max(160),
  projectName: z.string().min(1).max(200),
  projectCreatedAt: z.string().datetime().optional(),
  projectUpdatedAt: z.string().datetime().optional(),
  input: qualityLabInputSchema,
  blueprint: qualityLabBlueprintSchema,
  actionPlan: qualityLabActionPlanSchema.optional(),
  decisionRegister: qualityLabDecisionRegisterSchema.optional(),
  evidenceRegister: qualityLabEvidenceRegisterSchema.optional(),
  frozenRevisions: z.array(qualityLabFrozenRevisionSchema).optional(),
  activeRevisionId: z.string().optional(),
  engagement: qualityLabEngagementPacketSchema.nullable(),
  reviewRequestedAt: z.string().datetime().nullable(),
  workspace: z.object({
    projectStatus: z.enum(["concept", "diagnostic", "review-in-progress", "controlled-handoff"]),
    decisionOwnerRole: z.string().min(1),
    reviewState: z.enum(["concept-only", "review-requested", "expert-reviewed", "approved-outside-atlas"]),
    evidenceRequestIds: z.array(z.string()),
    unresolvedAssumptionIds: z.array(z.string()),
    actionOwnerRoles: z.array(z.string()),
    decisionRegister: qualityLabDecisionRegisterSchema.optional(),
  }).optional(),
});

export const qualityLabReviewedProjectSnapshotSchema = qualityLabReviewedProjectSnapshotBaseSchema.superRefine((snapshot, context) => {
  if (snapshot.snapshotVersion !== QUALITY_LAB_ACCOUNT_SNAPSHOT_VERSION) return;
  if (!snapshot.frozenRevisions || snapshot.frozenRevisions.length !== 1) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["frozenRevisions"], message: "A v3 account snapshot must contain exactly the active frozen revision" });
    return;
  }
  if (snapshot.frozenRevisions[0].revisionId !== snapshot.activeRevisionId) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["activeRevisionId"], message: "The v3 active revision must match its frozen revision" });
  }
});

export type QualityLabReviewedProjectSnapshot = z.infer<typeof qualityLabReviewedProjectSnapshotSchema>;

export const qualityLabProjectSyncRequestSchema = z.object({
  snapshot: qualityLabReviewedProjectSnapshotSchema,
  expectedUpdatedAt: z.string().datetime().nullable(),
});

export type QualityLabProjectSyncRequest = z.infer<typeof qualityLabProjectSyncRequestSchema>;

export type QualityLabAccountProjectRecord = {
  snapshot: QualityLabReviewedProjectSnapshot;
  updatedAt: string;
  revisionCount: number;
};

export const qualityLabLocalStoreSchema = z.object({
  version: z.literal(QUALITY_LAB_LOCAL_STORE_VERSION),
  migratedFrom: z.literal("lsa:quality-lab-projects:v1").nullable(),
  projects: z.array(z.unknown()),
});

export type QualityLabLocalStore = z.infer<typeof qualityLabLocalStoreSchema>;

export function createQualityLabAccountSnapshot(project: QualityLabProject, engagement: QualityLabReviewedProjectSnapshot["engagement"] = null): QualityLabReviewedProjectSnapshot {
  const historical = ensureQualityLabProjectHistory(project);
  const activeRevision = historical.revisions?.find((revision) => revision.revisionId === historical.activeRevisionId)
    ?? historical.revisions?.at(-1);
  if (!activeRevision) throw new Error("An account snapshot requires an active frozen revision");
  return qualityLabReviewedProjectSnapshotSchema.parse({
    snapshotVersion: QUALITY_LAB_ACCOUNT_SNAPSHOT_VERSION,
    localProjectId: historical.id,
    projectName: historical.name,
    projectCreatedAt: historical.createdAt,
    projectUpdatedAt: historical.updatedAt,
    input: historical.input,
    blueprint: historical.blueprint,
    actionPlan: historical.actionPlan,
    decisionRegister: historical.decisionRegister,
    evidenceRegister: historical.evidenceRegister,
    frozenRevisions: [activeRevision],
    activeRevisionId: activeRevision.revisionId,
    engagement,
    reviewRequestedAt: project.reviewRequestedAt ?? null,
    workspace: {
      projectStatus: project.reviewRequestedAt ? "review-in-progress" : "concept",
      decisionOwnerRole: project.input.decisionOwnerRole,
      reviewState: project.blueprint.review.status,
      evidenceRequestIds: project.blueprint.unresolvedInputs.map((item) => item.id),
      unresolvedAssumptionIds: project.blueprint.assumptions.filter((item) => item.confidence !== "high").map((item) => item.id),
      actionOwnerRoles: Array.from(new Set(project.actionPlan.actions.map((action) => action.ownerRole).filter(Boolean))),
      decisionRegister: historical.decisionRegister,
    },
  });
}

/**
 * Normalizes legacy cumulative snapshots before persistence. Existing v1/v2
 * payloads remain readable, while every subsequent save becomes bounded v3.
 */
export function compactQualityLabAccountSnapshot(rawSnapshot: QualityLabReviewedProjectSnapshot): QualityLabReviewedProjectSnapshot {
  const snapshot = qualityLabReviewedProjectSnapshotSchema.parse(rawSnapshot);
  if (snapshot.snapshotVersion === QUALITY_LAB_ACCOUNT_SNAPSHOT_VERSION) return snapshot;
  const project = ensureQualityLabProjectHistory(qualityLabProjectFromReviewedSnapshot(snapshot));
  return createQualityLabAccountSnapshot(project, snapshot.engagement);
}

export function qualityLabSyncHasConflict(expectedUpdatedAt: string | null, currentUpdatedAt: string | null) {
  if (!currentUpdatedAt) return false;
  return expectedUpdatedAt !== currentUpdatedAt;
}

export function migrateQualityLabLocalStore(rawV2: string | null, rawV1: string | null): QualityLabLocalStore {
  if (rawV2) {
    try {
      const parsed = qualityLabLocalStoreSchema.safeParse(JSON.parse(rawV2));
      if (parsed.success) return parsed.data;
    } catch {
      // Preserve the unreadable v2 value in browser storage and recover from v1 when available.
    }
  }
  let projects: unknown[] = [];
  if (rawV1) {
    try {
      const parsed = JSON.parse(rawV1);
      if (Array.isArray(parsed)) projects = parsed;
    } catch {
      // Invalid legacy data is retained under its original key for manual export/recovery.
    }
  }
  return { version: QUALITY_LAB_LOCAL_STORE_VERSION, migratedFrom: rawV1 ? "lsa:quality-lab-projects:v1" : null, projects };
}

export function qualityLabProjectFromReviewedSnapshot(snapshot: QualityLabReviewedProjectSnapshot): QualityLabProject {
  const storedActionPlan = qualityLabActionPlanSchema.safeParse(snapshot.actionPlan);
  const actionPlan = storedActionPlan.success ? storedActionPlan.data : reconcileQualityLabActionPlan(snapshot.blueprint, undefined, snapshot.blueprint.generatedAt);
  const storedDecisionRegister = qualityLabDecisionRegisterSchema.safeParse(snapshot.decisionRegister ?? snapshot.workspace?.decisionRegister);
  return ensureQualityLabProjectHistory({
    id: snapshot.localProjectId,
    name: snapshot.projectName,
    input: snapshot.input,
    blueprint: snapshot.blueprint,
    actionPlan,
    decisionRegister: storedDecisionRegister.success ? storedDecisionRegister.data : reconcileQualityLabDecisionRegister(snapshot.blueprint, actionPlan, undefined, snapshot.blueprint.generatedAt),
    evidenceRegister: snapshot.evidenceRegister ?? createEmptyQualityLabEvidenceRegister(snapshot.projectUpdatedAt ?? snapshot.blueprint.generatedAt),
    revisions: snapshot.frozenRevisions,
    activeRevisionId: snapshot.activeRevisionId,
    createdAt: snapshot.projectCreatedAt ?? snapshot.blueprint.generatedAt,
    updatedAt: snapshot.projectUpdatedAt ?? snapshot.blueprint.generatedAt,
    reviewRequestedAt: snapshot.reviewRequestedAt ?? undefined,
  });
}

export function compareQualityLabReviewedSnapshots(
  baseline: QualityLabReviewedProjectSnapshot,
  current: QualityLabReviewedProjectSnapshot,
) {
  const before = baseline.blueprint;
  const after = current.blueprint;
  return {
    baselineGeneratedAt: before.generatedAt,
    currentGeneratedAt: after.generatedAt,
    changes: [
      { metric: "Model completeness", before: getQualityLabReadiness(before).modelCompleteness.score, after: getQualityLabReadiness(after).modelCompleteness.score, unit: "%" },
      { metric: "Evidence readiness", before: getQualityLabReadiness(before).evidenceReadiness.score, after: getQualityLabReadiness(after).evidenceReadiness.score, unit: "%" },
      { metric: "Blocking inputs", before: before.dataQuality.blockingOpenCount, after: after.dataQuality.blockingOpenCount, unit: "items" },
      { metric: "Important inputs", before: before.dataQuality.importantOpenCount, after: after.dataQuality.importantOpenCount, unit: "items" },
      { metric: "Monthly tests", before: before.current.monthlyTests, after: after.current.monthlyTests, unit: "tests/month" },
      { metric: "Team FTE", before: before.current.totalTeamFte, after: after.current.totalTeamFte, unit: "FTE" },
      { metric: "CAPEX high", before: before.current.capexHighUsd, after: after.current.capexHighUsd, unit: "USD" },
      { metric: "Method requirements", before: before.methodRequirements.length, after: after.methodRequirements.length, unit: "requirements" },
    ].map((item) => ({ ...item, delta: Math.round((item.after - item.before) * 100) / 100 })),
    notice: "Decision-impact comparison only. It does not establish method approval, regulatory compliance, or a controlled change-control assessment.",
  };
}
