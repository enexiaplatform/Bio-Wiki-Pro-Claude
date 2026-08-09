import { z } from "zod";

export const CONTENT_QUALITY_CONTRACT_VERSION = "content-quality/v2" as const;
export const QUIZ_CONTRACT_VERSION = "lesson-quiz/v2" as const;
export const EVIDENCE_SOURCE_CATALOG_VERSION = "evidence-source-catalog/v1" as const;

export const reviewStatusSchema = z.enum([
  "under-review",
  "editorial-reviewed",
  "sme-reviewed",
]);
export type ReviewStatus = z.infer<typeof reviewStatusSchema>;

export const riskLevelSchema = z.enum(["low", "medium", "high"]);
export type RiskLevel = z.infer<typeof riskLevelSchema>;

export const quizQuestionV2Schema = z.object({
  q: z.string().trim().min(8),
  options: z.array(z.string().trim().min(1)).length(4),
  answer: z.number().int().min(0).max(3),
  type: z.enum(["concept", "applicability", "scenario", "evidence-action"]),
  rationale: z.string().trim().min(20),
  sourceIds: z.array(z.string().trim().min(1)).min(1),
  difficulty: z.enum(["foundation", "intermediate", "advanced"]),
});
export type QuizQuestionV2 = z.infer<typeof quizQuestionV2Schema>;

export const legacyQuizQuestionSchema = z.object({
  q: z.string().trim().min(1),
  options: z.array(z.string().trim().min(1)).min(2),
  answer: z.number().int().nonnegative(),
});
export type LegacyQuizQuestion = z.infer<typeof legacyQuizQuestionSchema>;

export const qualityScoreSchema = z.object({
  provenance: z.number().min(0).max(30),
  actionability: z.number().min(0).max(25),
  applicability: z.number().min(0).max(15),
  workedExample: z.number().min(0).max(15),
  usability: z.number().min(0).max(15),
  criticalFails: z.array(z.string()),
});
export type QualityScore = z.infer<typeof qualityScoreSchema>;

export const contentQualitySchema = z.object({
  contractVersion: z.literal(CONTENT_QUALITY_CONTRACT_VERSION),
  contentVersion: z.string().trim().min(1),
  reviewStatus: reviewStatusSchema,
  riskLevel: riskLevelSchema,
  lastReviewedAt: z.string().date().nullable(),
  reviewDueAt: z.string().date().nullable(),
  reviewerRoles: z.array(z.string().trim().min(2)),
  learningObjectives: z.array(z.string().trim().min(8)).min(1),
  decisionUse: z.string().trim().min(12),
  sourceIds: z.array(z.string().trim().min(1)),
  limitations: z.array(z.string().trim().min(8)).min(1),
  workedExample: z.string().trim().min(1).nullable(),
  workingAsset: z.string().trim().min(1).nullable(),
  supersedes: z.string().trim().min(1).nullable(),
  changeSummary: z.string().trim().min(8),
  strategicCore: z.boolean().default(false),
  promoted: z.boolean().default(false),
  score: qualityScoreSchema,
});
export type ContentQuality = z.infer<typeof contentQualitySchema>;

export const evidenceSourceSchema = z.object({
  id: z.string().regex(/^[A-Z0-9][A-Z0-9-]+$/),
  publisher: z.string().trim().min(2),
  title: z.string().trim().min(3),
  edition: z.string().trim().min(1),
  effectiveDate: z.string().date().nullable(),
  locator: z.string().url(),
  sourceType: z.enum(["regulation", "guidance", "standard", "pharmacopeia", "internal-record"]),
  licensingBoundary: z.string().trim().min(8),
  lifecycleStatus: z.enum(["current", "draft", "superseded", "expired"]),
  verificationStatus: z.enum(["verified", "pending", "licensed-access-required"]),
  verifiedAt: z.string().date().nullable(),
  notes: z.string().trim().min(1).optional(),
});
export type EvidenceSource = z.infer<typeof evidenceSourceSchema>;

export const evidenceSourceCatalogSchema = z.object({
  contractVersion: z.literal(EVIDENCE_SOURCE_CATALOG_VERSION),
  updatedAt: z.string().date(),
  sources: z.array(evidenceSourceSchema),
});
export type EvidenceSourceCatalog = z.infer<typeof evidenceSourceCatalogSchema>;

export type QualityAssetClass = "public-evidence" | "pro" | "paid-output";

export function totalQualityScore(score: QualityScore): number {
  return score.provenance + score.actionability + score.applicability + score.workedExample + score.usability;
}

export function qualityThreshold(assetClass: QualityAssetClass): number {
  if (assetClass === "public-evidence") return 75;
  if (assetClass === "pro") return 85;
  return 90;
}

export function passesQualityGate(score: QualityScore, assetClass: QualityAssetClass): boolean {
  return score.criticalFails.length === 0 && totalQualityScore(score) >= qualityThreshold(assetClass);
}

export interface PublicContentQuality {
  contentVersion: string;
  reviewStatus: ReviewStatus;
  riskLevel: RiskLevel;
  lastReviewedAt: string | null;
  reviewDueAt: string | null;
  reviewerRoles: string[];
  sourceCount: number;
  limitations: string[];
  score: number;
  promoted: boolean;
}

export function toPublicContentQuality(quality: ContentQuality): PublicContentQuality {
  return {
    contentVersion: quality.contentVersion,
    reviewStatus: quality.reviewStatus,
    riskLevel: quality.riskLevel,
    lastReviewedAt: quality.lastReviewedAt,
    reviewDueAt: quality.reviewDueAt,
    reviewerRoles: quality.reviewerRoles,
    sourceCount: quality.sourceIds.length,
    limitations: quality.limitations,
    score: totalQualityScore(quality.score),
    promoted: quality.promoted,
  };
}

export function legacyContentQuality(title: string, tier: string): ContentQuality {
  return contentQualitySchema.parse({
    contractVersion: CONTENT_QUALITY_CONTRACT_VERSION,
    contentVersion: "legacy/v1",
    reviewStatus: "under-review",
    riskLevel: tier === "free" ? "low" : "medium",
    lastReviewedAt: null,
    reviewDueAt: null,
    reviewerRoles: [],
    learningObjectives: [`Understand the current educational scope of ${title}.`],
    decisionUse: "Orientation only until the content completes the v2 review workflow.",
    sourceIds: [],
    limitations: ["Legacy content has not yet completed Content Quality Contract v2 review."],
    workedExample: null,
    workingAsset: null,
    supersedes: null,
    changeSummary: "Imported into the v2 quality workflow without changing the legacy body.",
    strategicCore: false,
    promoted: false,
    score: {
      provenance: 0,
      actionability: 0,
      applicability: 0,
      workedExample: 0,
      usability: 0,
      criticalFails: ["Content Quality Contract v2 review is incomplete."],
    },
  });
}
