import { z } from "zod";

export const impactReviewSchema = z.object({
  version: z.literal("quality-lab-impact-review/v1"),
  projectId: z.string().min(1).max(200),
  updateId: z.string().min(1).max(200),
  updateFingerprint: z.string().regex(/^[a-f0-9]{64}$/),
  projectBasisFingerprint: z.string().regex(/^[a-f0-9]{64}$/),
  sourceUrl: z.string().url().max(2000),
  sourceTitle: z.string().min(1).max(1000),
  disposition: z.enum(["action-required", "not-applicable", "deferred"]),
  reviewerRole: z.string().trim().min(2).max(100),
  rationale: z.string().trim().min(10).max(2000),
  reviewedAt: z.string().datetime(),
  confirmation: z.literal("human-review-record-only"),
}).strict();
export type ImpactReview = z.infer<typeof impactReviewSchema>;
