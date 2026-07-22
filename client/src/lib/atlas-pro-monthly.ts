import { atlasProMonthlyReviewRecordSchema, type AtlasProMonthlyActionStatus, type AtlasProMonthlyCycleStep, type AtlasProMonthlyReviewRecord } from "@shared/atlas-pro-monthly";

export const ATLAS_PRO_MONTHLY_STORAGE_KEY = "atlas:pro-monthly-reviews:v1";

export type StoredAtlasProMonthlyReview = AtlasProMonthlyReviewRecord;

export const emptyAtlasProMonthlyStatuses = (): StoredAtlasProMonthlyReview["statuses"] => ({ frame: "not-started", verify: "not-started", decide: "not-started", close: "not-started" });

function isStoredReview(value: unknown): value is StoredAtlasProMonthlyReview {
  return atlasProMonthlyReviewRecordSchema.safeParse(value).success;
}

export function loadAtlasProMonthlyReviews(): StoredAtlasProMonthlyReview[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(ATLAS_PRO_MONTHLY_STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter(isStoredReview).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 24) : [];
  } catch {
    return [];
  }
}

export function saveAtlasProMonthlyReview(review: StoredAtlasProMonthlyReview): StoredAtlasProMonthlyReview[] {
  const next = [review, ...loadAtlasProMonthlyReviews().filter((item) => item.id !== review.id)]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 24);
  window.localStorage.setItem(ATLAS_PRO_MONTHLY_STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function mergeAtlasProMonthlyReviews(remote: StoredAtlasProMonthlyReview[]): StoredAtlasProMonthlyReview[] {
  const byId = new Map<string, StoredAtlasProMonthlyReview>();
  for (const review of [...loadAtlasProMonthlyReviews(), ...remote.filter(isStoredReview)]) {
    const existing = byId.get(review.id);
    if (!existing || review.updatedAt > existing.updatedAt) byId.set(review.id, review);
  }
  const merged = Array.from(byId.values()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 24);
  window.localStorage.setItem(ATLAS_PRO_MONTHLY_STORAGE_KEY, JSON.stringify(merged));
  return merged;
}

export function downloadAtlasProMonthlyReview(markdown: string, month: string) {
  const url = URL.createObjectURL(new Blob([markdown], { type: "text/markdown;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `atlas-pro-monthly-quality-review-${month}.md`;
  anchor.click();
  URL.revokeObjectURL(url);
}
