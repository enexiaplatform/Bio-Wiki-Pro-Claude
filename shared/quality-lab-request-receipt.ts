import { z } from "zod";
import { qualityLabEngagementIntentSchema } from "./quality-lab-review.js";
import { commercialRequestNotificationStatusSchema, type CommercialRequestNotificationStatus } from "./quality-lab-request-notifications.js";

export const QUALITY_LAB_REQUEST_RECEIPT_VERSION = "quality-lab-request-receipt/v2" as const;
export const QUALITY_LAB_REQUEST_RECEIPT_TTL_MS = 24 * 60 * 60 * 1000;

const receiptSchema = z.object({
  version: z.literal(QUALITY_LAB_REQUEST_RECEIPT_VERSION),
  scopeKey: z.string().min(1).max(200),
  offer: qualityLabEngagementIntentSchema,
  requestId: z.number().int().positive().nullable(),
  notifications: commercialRequestNotificationStatusSchema.optional(),
  recordedAt: z.number().int().nonnegative(),
});

const legacyDiagnosticReceiptSchema = z.object({
  offer: z.literal("scope-diagnostic"),
  recordedAt: z.number().int().nonnegative(),
});

export type QualityLabRequestReceipt = z.infer<typeof receiptSchema>;

export function qualityLabRequestScopeKey(projectId: string | null | undefined): string {
  return projectId ? `project:${projectId}` : "standalone";
}

export function createQualityLabRequestReceipt(input: {
  scopeKey: string;
  offer: QualityLabRequestReceipt["offer"];
  requestId?: number | null;
  notifications?: CommercialRequestNotificationStatus;
  recordedAt?: number;
}): QualityLabRequestReceipt {
  return receiptSchema.parse({
    version: QUALITY_LAB_REQUEST_RECEIPT_VERSION,
    scopeKey: input.scopeKey,
    offer: input.offer,
    requestId: input.requestId ?? null,
    ...(input.notifications ? { notifications: input.notifications } : {}),
    recordedAt: input.recordedAt ?? Date.now(),
  });
}

export function parseRecentQualityLabRequestReceipt(
  value: unknown,
  scopeKey: string,
  now = Date.now(),
): QualityLabRequestReceipt | null {
  const current = receiptSchema.safeParse(value);
  if (current.success) {
    const age = now - current.data.recordedAt;
    return current.data.scopeKey === scopeKey && age >= 0 && age < QUALITY_LAB_REQUEST_RECEIPT_TTL_MS
      ? current.data
      : null;
  }

  // v1 stored only the fact that a standalone Diagnostic was submitted so the
  // account-return flow could resume checkout. Preserve that bounded behavior.
  const legacy = legacyDiagnosticReceiptSchema.safeParse(value);
  if (!legacy.success || scopeKey !== "standalone") return null;
  const age = now - legacy.data.recordedAt;
  return age >= 0 && age < QUALITY_LAB_REQUEST_RECEIPT_TTL_MS
    ? createQualityLabRequestReceipt({
        scopeKey,
        offer: legacy.data.offer,
        recordedAt: legacy.data.recordedAt,
      })
    : null;
}
