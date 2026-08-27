import { z } from "zod";
import { qualityLabReviewQualificationSchema } from "./quality-lab-review.js";

export const QUALITY_LAB_REQUEST_DRAFT_VERSION = "quality-lab-request-draft/v1" as const;
export const QUALITY_LAB_REQUEST_DRAFT_TTL_MS = 8 * 60 * 60 * 1000;

export const qualityLabRequestDraftSchema = z.object({
  version: z.literal(QUALITY_LAB_REQUEST_DRAFT_VERSION),
  scopeKey: z.string().min(1).max(200),
  savedAt: z.number().int().nonnegative(),
  qualification: qualityLabReviewQualificationSchema,
  form: z.object({
    name: z.string().max(120),
    email: z.string().max(254),
    company: z.string().max(160),
    role: z.string().max(120),
    need: z.string().max(4000),
  }),
  attachMode: z.enum(["brief-only", "full-snapshot"]),
});

export type QualityLabRequestDraft = z.infer<typeof qualityLabRequestDraftSchema>;

export function createQualityLabRequestDraft(
  input: Omit<QualityLabRequestDraft, "version" | "savedAt">,
  savedAt = Date.now(),
): QualityLabRequestDraft {
  return qualityLabRequestDraftSchema.parse({
    version: QUALITY_LAB_REQUEST_DRAFT_VERSION,
    savedAt,
    ...input,
  });
}

export function parseRecentQualityLabRequestDraft(
  value: unknown,
  scopeKey: string,
  now = Date.now(),
): QualityLabRequestDraft | null {
  const parsed = qualityLabRequestDraftSchema.safeParse(value);
  if (!parsed.success) return null;
  if (parsed.data.scopeKey !== scopeKey) return null;
  if (parsed.data.savedAt > now) return null;
  if (now - parsed.data.savedAt > QUALITY_LAB_REQUEST_DRAFT_TTL_MS) return null;
  return parsed.data;
}
