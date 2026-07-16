import { z } from "zod";
import type { QualityLabBlueprint } from "./quality-lab.js";

export const QUALITY_LAB_ACTION_PLAN_VERSION = "quality-lab-action-plan/v1" as const;

export const qualityLabActionStatusSchema = z.enum(["open", "in-progress", "ready-for-review", "resolved"]);
export type QualityLabActionStatus = z.infer<typeof qualityLabActionStatusSchema>;

export const qualityLabActionActivitySchema = z.object({
  id: z.string().min(1),
  recordedAt: z.string().datetime(),
  type: z.enum(["created", "updated", "auto-resolved", "reopened"]),
  summary: z.string().min(1).max(500),
});

export const qualityLabProjectActionSchema = z.object({
  id: z.string().min(1),
  sourceInputId: z.string().min(1),
  category: z.enum(["portfolio", "method", "workload", "equipment", "facility", "cost", "governance"]),
  severity: z.enum(["blocking", "important", "advisory"]),
  question: z.string().min(1),
  impact: z.string().min(1),
  requiredEvidence: z.string().min(1),
  relatedRuleIds: z.array(z.string().min(1)),
  ownerRole: z.string().max(160),
  dueDate: z.string(),
  evidenceNote: z.string().max(2000),
  status: qualityLabActionStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  activity: z.array(qualityLabActionActivitySchema),
});

export type QualityLabProjectAction = z.infer<typeof qualityLabProjectActionSchema>;

export const qualityLabActionPlanSchema = z.object({
  version: z.literal(QUALITY_LAB_ACTION_PLAN_VERSION),
  updatedAt: z.string().datetime(),
  actions: z.array(qualityLabProjectActionSchema),
});

export type QualityLabActionPlan = z.infer<typeof qualityLabActionPlanSchema>;

const ownerByCategory: Record<QualityLabProjectAction["category"], string> = {
  portfolio: "QC project lead",
  method: "QC method owner",
  workload: "QC operations",
  equipment: "Laboratory engineering",
  facility: "Engineering / EHS",
  cost: "Procurement / Finance",
  governance: "QA",
};

function eventId(actionId: string, recordedAt: string, type: string) {
  return `${actionId}:${type}:${recordedAt}`;
}

function createdAction(input: QualityLabBlueprint["unresolvedInputs"][number], now: string): QualityLabProjectAction {
  const id = `action-${input.id}`;
  return {
    id,
    sourceInputId: input.id,
    category: input.category,
    severity: input.severity,
    question: input.question,
    impact: input.impact,
    requiredEvidence: input.resolution,
    relatedRuleIds: input.relatedRuleIds,
    ownerRole: ownerByCategory[input.category],
    dueDate: "",
    evidenceNote: "",
    status: "open",
    createdAt: now,
    updatedAt: now,
    activity: [{ id: eventId(id, now, "created"), recordedAt: now, type: "created", summary: "Action created from an open Blueprint input." }],
  };
}

export function reconcileQualityLabActionPlan(
  blueprint: QualityLabBlueprint,
  current?: QualityLabActionPlan,
  now = new Date().toISOString(),
): QualityLabActionPlan {
  const parsedCurrent = qualityLabActionPlanSchema.safeParse(current);
  const existing = parsedCurrent.success ? parsedCurrent.data.actions : [];
  const bySourceId = new Map(existing.map((action) => [action.sourceInputId, action]));
  const openIds = new Set(blueprint.unresolvedInputs.map((item) => item.id));

  const openActions = blueprint.unresolvedInputs.map((input) => {
    const previous = bySourceId.get(input.id);
    if (!previous) return createdAction(input, now);
    const reopened = previous.status === "resolved";
    return {
      ...previous,
      category: input.category,
      severity: input.severity,
      question: input.question,
      impact: input.impact,
      requiredEvidence: input.resolution,
      relatedRuleIds: input.relatedRuleIds,
      status: reopened ? "open" as const : previous.status,
      updatedAt: reopened ? now : previous.updatedAt,
      activity: reopened
        ? [...previous.activity, { id: eventId(previous.id, now, "reopened"), recordedAt: now, type: "reopened" as const, summary: "The source input is open again after the Blueprint was recompiled." }]
        : previous.activity,
    };
  });

  const resolvedActions = existing
    .filter((action) => !openIds.has(action.sourceInputId))
    .map((action) => action.status === "resolved" ? action : {
      ...action,
      status: "resolved" as const,
      updatedAt: now,
      activity: [...action.activity, { id: eventId(action.id, now, "auto-resolved"), recordedAt: now, type: "auto-resolved" as const, summary: "The source input no longer appears in the compiled Blueprint." }],
    });

  return qualityLabActionPlanSchema.parse({
    version: QUALITY_LAB_ACTION_PLAN_VERSION,
    updatedAt: now,
    actions: [...openActions, ...resolvedActions],
  });
}

const severityRank: Record<QualityLabProjectAction["severity"], number> = { blocking: 0, important: 1, advisory: 2 };
const statusRank: Record<QualityLabActionStatus, number> = { "in-progress": 0, open: 1, "ready-for-review": 2, resolved: 3 };

export function priorityQualityLabActions(plan: QualityLabActionPlan) {
  return plan.actions
    .filter((action) => action.status !== "resolved")
    .sort((a, b) => {
      const severityDelta = severityRank[a.severity] - severityRank[b.severity];
      if (severityDelta !== 0) return severityDelta;
      const statusDelta = statusRank[a.status] - statusRank[b.status];
      if (statusDelta !== 0) return statusDelta;
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return a.createdAt.localeCompare(b.createdAt);
    });
}

export function qualityLabActionPlanMetrics(plan: QualityLabActionPlan) {
  const active = plan.actions.filter((action) => action.status !== "resolved");
  return {
    activeCount: active.length,
    blockingCount: active.filter((action) => action.severity === "blocking").length,
    inProgressCount: active.filter((action) => action.status === "in-progress").length,
    readyForReviewCount: active.filter((action) => action.status === "ready-for-review").length,
    resolvedCount: plan.actions.filter((action) => action.status === "resolved").length,
  };
}

export function qualityLabProjectStage(plan: QualityLabActionPlan, reviewRequestedAt?: string) {
  if (reviewRequestedAt) return "review-requested" as const;
  const metrics = qualityLabActionPlanMetrics(plan);
  if (metrics.blockingCount > 0) return "awaiting-inputs" as const;
  return "ready-for-review" as const;
}
