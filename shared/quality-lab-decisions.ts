import { z } from "zod";
import type { QualityLabBlueprint } from "./quality-lab.js";
import type { QualityLabActionPlan } from "./quality-lab-actions.js";

export const QUALITY_LAB_DECISION_REGISTER_VERSION = "quality-lab-decision-register/v1" as const;

export const qualityLabDecisionStatusSchema = z.enum([
  "open",
  "evidence-required",
  "ready-for-review",
  "under-review",
  "decided",
  "deferred",
  "closed",
]);
export type QualityLabDecisionStatus = z.infer<typeof qualityLabDecisionStatusSchema>;

export const qualityLabDecisionActivitySchema = z.object({
  id: z.string().min(1),
  recordedAt: z.string().datetime(),
  type: z.enum(["created", "model-refreshed", "updated", "disposition-recorded", "outcome-recorded"]),
  summary: z.string().min(1).max(500),
});

export const qualityLabDecisionOutcomeSchema = z.object({
  predicted: z.string().max(2000),
  observed: z.string().max(2000),
  varianceExplanation: z.string().max(2000),
  evidenceReference: z.string().max(1000),
  observedAt: z.string(),
  learningStatus: z.enum(["not-assessed", "learning-candidate", "reviewed-no-change", "governed-change-proposed"]),
});

export const qualityLabDecisionRecordSchema = z.object({
  id: z.string().min(1),
  sourceType: z.enum(["project-mandate", "blueprint-recommendation"]),
  sourceRecommendationId: z.string().nullable(),
  question: z.string().min(1).max(2000),
  ownerRole: z.string().max(160),
  targetDate: z.string(),
  status: qualityLabDecisionStatusSchema,
  atlasRecommendation: z.string().min(1).max(4000),
  rationale: z.string().min(1).max(4000),
  alternative: z.string().max(2000),
  relatedActionIds: z.array(z.string()),
  blockerActionIds: z.array(z.string()),
  lineageIds: z.array(z.string()),
  evidenceIds: z.array(z.string()),
  finalDisposition: z.string().max(4000),
  decidedAt: z.string(),
  outcome: qualityLabDecisionOutcomeSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  activity: z.array(qualityLabDecisionActivitySchema),
});
export type QualityLabDecisionRecord = z.infer<typeof qualityLabDecisionRecordSchema>;

export const qualityLabDecisionRegisterSchema = z.object({
  version: z.literal(QUALITY_LAB_DECISION_REGISTER_VERSION),
  updatedAt: z.string().datetime(),
  decisions: z.array(qualityLabDecisionRecordSchema),
});
export type QualityLabDecisionRegister = z.infer<typeof qualityLabDecisionRegisterSchema>;

const recommendationQuestions: Record<string, string> = {
  "turnaround-feasibility": "Can the proposed operating model meet the required release turnaround?",
  "product-test-matrix": "Is the product × market × test basis ready for design freeze?",
  "workflow-time-study": "Is the staffing basis ready for cross-functional review?",
  "vendor-neutral-budget": "Is the CAPEX basis ready for budget approval?",
  "qualified-engineering": "Can Engineering freeze the current facility and utility basis?",
  "consumable-supply-basis": "Is the consumable supply basis ready for budget approval?",
  "outsource-strategy": "Which tests should remain outsourced, and on what controlled basis?",
  "future-capacity-triggers": "Which evidence should trigger release of future capacity?",
  "role-separation": "Should execution, support and technical review responsibilities be separated?",
};

function unique(values: string[]) {
  return Array.from(new Set(values));
}

function activityId(decisionId: string, now: string, type: string) {
  return `${decisionId}:${type}:${now}`;
}

function defaultOutcome(predicted: string) {
  return {
    predicted,
    observed: "",
    varianceExplanation: "",
    evidenceReference: "",
    observedAt: "",
    learningStatus: "not-assessed" as const,
  };
}

function primaryRecommendation(blueprint: QualityLabBlueprint) {
  return `Use the current concept basis of ${blueprint.current.monthlyTests} test units/month, ${blueprint.current.totalTeamFte} team FTE and ${blueprint.current.estimatedAreaSqm} m², while reserving for the ${blueprint.future.monthlyTests} test-unit future scenario. Keep the decision evidence-required until controlled-use blockers are resolved.`;
}

function traceForRules(blueprint: QualityLabBlueprint, ruleIds: string[]) {
  const ruleSet = new Set(ruleIds);
  const lineage = blueprint.decisionLineage.filter((item) =>
    item.ruleRefs.some((rule) => ruleSet.has(rule.id)),
  );
  return {
    lineageIds: lineage.map((item) => item.id),
    evidenceIds: unique(lineage.flatMap((item) => item.evidenceRefs.map((evidence) => evidence.id))),
  };
}

function actionsForRules(actionPlan: QualityLabActionPlan, ruleIds: string[]) {
  const ruleSet = new Set(ruleIds);
  const related = actionPlan.actions.filter((action) =>
    action.relatedRuleIds.some((ruleId) => ruleSet.has(ruleId)),
  );
  return {
    relatedActionIds: related.map((action) => action.id),
    blockerActionIds: related
      .filter((action) => action.severity === "blocking" && action.status !== "resolved")
      .map((action) => action.id),
  };
}

function derivedStatus(blockerActionIds: string[], relatedActionIds: string[], actionPlan: QualityLabActionPlan): QualityLabDecisionStatus {
  if (blockerActionIds.length > 0) return "evidence-required";
  const active = new Set(actionPlan.actions.filter((action) => action.status !== "resolved").map((action) => action.id));
  return relatedActionIds.some((id) => active.has(id)) ? "open" : "ready-for-review";
}

export function reconcileQualityLabDecisionRegister(
  blueprint: QualityLabBlueprint,
  actionPlan: QualityLabActionPlan,
  current?: QualityLabDecisionRegister,
  now = new Date().toISOString(),
): QualityLabDecisionRegister {
  const parsed = qualityLabDecisionRegisterSchema.safeParse(current);
  const existing = new Map((parsed.success ? parsed.data.decisions : []).map((decision) => [decision.id, decision]));
  const allActionIds = actionPlan.actions.map((action) => action.id);
  const blockingActionIds = actionPlan.actions.filter((action) => action.severity === "blocking" && action.status !== "resolved").map((action) => action.id);
  const allLineageIds = blueprint.decisionLineage.map((item) => item.id);
  const allEvidenceIds = unique(blueprint.decisionLineage.flatMap((item) => item.evidenceRefs.map((evidence) => evidence.id)));
  const primaryId = "decision-project-mandate";
  const primaryAtlasRecommendation = primaryRecommendation(blueprint);
  const seeds = [{
    id: primaryId,
    sourceType: "project-mandate" as const,
    sourceRecommendationId: null,
    question: blueprint.input.primaryDecision,
    atlasRecommendation: primaryAtlasRecommendation,
    rationale: "This is the decision mandate supplied in the planner. Atlas connects it to the complete model, evidence-readiness basis, Decision Lineage and unresolved action plan.",
    relatedActionIds: allActionIds,
    blockerActionIds: blockingActionIds,
    lineageIds: allLineageIds,
    evidenceIds: allEvidenceIds,
  }, ...blueprint.recommendations.map((recommendation) => {
    const actions = actionsForRules(actionPlan, recommendation.relatedRuleIds);
    const trace = traceForRules(blueprint, recommendation.relatedRuleIds);
    return {
      id: `decision-${recommendation.id}`,
      sourceType: "blueprint-recommendation" as const,
      sourceRecommendationId: recommendation.id,
      question: recommendationQuestions[recommendation.id] ?? `Should the team accept this Atlas recommendation: ${recommendation.recommendation}`,
      atlasRecommendation: recommendation.recommendation,
      rationale: recommendation.rationale,
      ...actions,
      ...trace,
    };
  })];

  const decisions = seeds.map((seed) => {
    const previous = existing.get(seed.id);
    const automaticStatus = derivedStatus(seed.blockerActionIds, seed.relatedActionIds, actionPlan);
    if (!previous) {
      return qualityLabDecisionRecordSchema.parse({
        ...seed,
        ownerRole: blueprint.input.decisionOwnerRole,
        targetDate: "",
        status: automaticStatus,
        alternative: "",
        finalDisposition: "",
        decidedAt: "",
        outcome: defaultOutcome(seed.atlasRecommendation),
        createdAt: now,
        updatedAt: now,
        activity: [{ id: activityId(seed.id, now, "created"), recordedAt: now, type: "created", summary: "Decision created from the current Blueprint basis." }],
      });
    }
    const protectedStatus = ["under-review", "decided", "deferred", "closed"].includes(previous.status);
    const modelChanged = previous.atlasRecommendation !== seed.atlasRecommendation || previous.question !== seed.question;
    return qualityLabDecisionRecordSchema.parse({
      ...previous,
      ...seed,
      status: protectedStatus ? previous.status : automaticStatus,
      outcome: {
        ...previous.outcome,
        predicted: previous.outcome.observed ? previous.outcome.predicted : seed.atlasRecommendation,
      },
      updatedAt: modelChanged ? now : previous.updatedAt,
      activity: modelChanged
        ? [...previous.activity, { id: activityId(seed.id, now, "model-refreshed"), recordedAt: now, type: "model-refreshed" as const, summary: "Atlas refreshed the recommendation from a newly compiled Blueprint; the recorded disposition and outcome were preserved." }]
        : previous.activity,
    });
  });

  return qualityLabDecisionRegisterSchema.parse({ version: QUALITY_LAB_DECISION_REGISTER_VERSION, updatedAt: now, decisions });
}

export function qualityLabDecisionMetrics(register: QualityLabDecisionRegister) {
  return {
    openCount: register.decisions.filter((decision) => ["open", "evidence-required", "ready-for-review", "under-review"].includes(decision.status)).length,
    evidenceRequiredCount: register.decisions.filter((decision) => decision.status === "evidence-required").length,
    readyForReviewCount: register.decisions.filter((decision) => decision.status === "ready-for-review").length,
    decidedCount: register.decisions.filter((decision) => ["decided", "closed"].includes(decision.status)).length,
    outcomeCount: register.decisions.filter((decision) => decision.outcome.observed.trim().length > 0).length,
    learningCandidateCount: register.decisions.filter((decision) => decision.outcome.learningStatus === "learning-candidate").length,
  };
}

