import { z } from "zod";

export const QUALITY_LAB_INPUT_CONTRACT_VERSION = "quality-lab-input/v1" as const;
export const QUALITY_LAB_BLUEPRINT_CONTRACT_VERSION = "quality-lab-blueprint/v1" as const;
export const QUALITY_LAB_COMPILER_CORE_VERSION = "compiler-core/v1.0" as const;

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

