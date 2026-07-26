import { z } from "zod";

export const QUALITY_LAB_INPUT_CONTRACT_VERSION = "quality-lab-input/v1" as const;
export const QUALITY_LAB_BLUEPRINT_CONTRACT_VERSION = "quality-lab-blueprint/v1" as const;
export const QUALITY_LAB_COMPILER_CORE_VERSION = "compiler-core/v1.0" as const;
export const QUALITY_LAB_LINEAGE_CONTRACT_VERSION = "quality-lab-lineage/v1" as const;
export const QUALITY_LAB_READINESS_CONTRACT_VERSION = "quality-lab-readiness/v1" as const;

export const confidenceValues = ["high", "medium", "indicative"] as const;
export const evidenceStatusValues = ["public-reference", "user-supplied", "internal-concept", "site-evidence-required"] as const;
export const reviewStatusValues = ["concept-only", "review-requested", "expert-reviewed", "approved-outside-atlas"] as const;

export const evidenceRecordSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  kind: z.enum(["regulatory-context", "project-input", "benchmark", "site-document"]),
  publisher: z.string().min(1),
  version: z.string().min(1),
  locator: z.string().min(1),
  status: z.enum(evidenceStatusValues),
  scope: z.string().min(1),
  limitations: z.string().min(1),
});

export type EvidenceRecord = z.infer<typeof evidenceRecordSchema>;

export const ruleTraceSchema = z.object({
  ruleId: z.string().min(1),
  ruleVersion: z.string().min(1),
  name: z.string().min(1),
  domainPackId: z.string().min(1),
  outputTypes: z.array(z.string().min(1)).min(1),
  evidenceIds: z.array(z.string().min(1)).min(1),
  applicability: z.string().min(1),
  confidence: z.enum(confidenceValues),
  limitations: z.string().min(1),
  reviewRequired: z.boolean(),
});

export type RuleTrace = z.infer<typeof ruleTraceSchema>;

export const unresolvedInputSchema = z.object({
  id: z.string().min(1),
  category: z.enum(["portfolio", "method", "workload", "equipment", "facility", "cost", "governance"]),
  severity: z.enum(["blocking", "important", "advisory"]),
  question: z.string().min(1),
  impact: z.string().min(1),
  resolution: z.string().min(1),
  relatedRuleIds: z.array(z.string().min(1)),
});

export type UnresolvedInput = z.infer<typeof unresolvedInputSchema>;

export const blueprintReviewSchema = z.object({
  status: z.enum(reviewStatusValues),
  requiredRoles: z.array(z.string().min(1)).min(1),
  blockingInputIds: z.array(z.string().min(1)),
  lastReviewedAt: z.string().datetime().nullable(),
  reviewNote: z.string().min(1),
});

export type BlueprintReview = z.infer<typeof blueprintReviewSchema>;

export const dataQualitySummarySchema = z.object({
  completenessPercent: z.number().min(0).max(100),
  blockingOpenCount: z.number().int().min(0),
  importantOpenCount: z.number().int().min(0),
  evidenceCount: z.number().int().min(0),
  tracedRuleCount: z.number().int().min(0),
});

export type DataQualitySummary = z.infer<typeof dataQualitySummarySchema>;

export const decisionLineageSchema = z.object({
  id: z.string().min(1),
  contractVersion: z.literal(QUALITY_LAB_LINEAGE_CONTRACT_VERSION),
  decisionType: z.enum(["recommendation", "staffing", "equipment", "space", "capex", "opex", "consumable", "operating-model"]),
  outputKey: z.string().min(1),
  summary: z.string().min(1),
  currentOutput: z.string().min(1),
  calculation: z.string().min(1),
  contributingInputPaths: z.array(z.string().min(1)).min(1),
  workflowIds: z.array(z.string().min(1)),
  methodIds: z.array(z.string().min(1)),
  ruleRefs: z.array(z.object({ id: z.string().min(1), version: z.string().min(1) })).min(1),
  evidenceRefs: z.array(z.object({ id: z.string().min(1), version: z.string().min(1) })).min(1),
  assumptionIds: z.array(z.string().min(1)),
  confidence: z.enum(confidenceValues),
  limitations: z.array(z.string().min(1)).min(1),
  unresolvedInputIds: z.array(z.string().min(1)),
  materialChangeFactors: z.array(z.string().min(1)).min(1),
});

export type DecisionLineage = z.infer<typeof decisionLineageSchema>;

export const readinessDimensionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  score: z.number().min(0).max(100),
  weight: z.number().positive(),
  status: z.enum(["met", "partial", "open", "not-applicable"]),
  summary: z.string().min(1),
  relatedUnresolvedInputIds: z.array(z.string().min(1)),
});

export const readinessMeasureSchema = z.object({
  score: z.number().min(0).max(100),
  label: z.string().min(1),
  summary: z.string().min(1),
  formula: z.string().min(1),
  dimensions: z.array(readinessDimensionSchema).min(1),
});

export const decisionReadinessSchema = z.object({
  score: z.number().min(0).max(100),
  stage: z.enum([
    "not-ready",
    "concept-planning-only",
    "diagnostic-review-ready",
    "expert-review-in-progress",
    "procurement-basis-draft",
    "controlled-handoff-ready",
  ]),
  label: z.string().min(1),
  summary: z.string().min(1),
  formula: z.string().min(1),
  blockingInputIds: z.array(z.string().min(1)),
  nextGate: z.string().min(1),
});

export const qualityLabReadinessSchema = z.object({
  contractVersion: z.literal(QUALITY_LAB_READINESS_CONTRACT_VERSION),
  modelCompleteness: readinessMeasureSchema,
  evidenceReadiness: readinessMeasureSchema,
  decisionReadiness: decisionReadinessSchema,
});

export type ReadinessDimension = z.infer<typeof readinessDimensionSchema>;
export type ReadinessMeasure = z.infer<typeof readinessMeasureSchema>;
export type DecisionReadiness = z.infer<typeof decisionReadinessSchema>;
export type QualityLabReadiness = z.infer<typeof qualityLabReadinessSchema>;

