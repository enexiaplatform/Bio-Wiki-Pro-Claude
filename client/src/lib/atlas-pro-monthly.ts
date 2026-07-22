import { ATLAS_PRO_MONTHLY_REVIEW_VERSION, atlasProMonthlyFocusValues, atlasProMonthlyRoleValues, type AtlasProMonthlyActionStatus, type AtlasProMonthlyCycleStep, type AtlasProMonthlyInput } from "@shared/atlas-pro-monthly";

export const ATLAS_PRO_MONTHLY_STORAGE_KEY = "atlas:pro-monthly-reviews:v1";

export interface StoredAtlasProMonthlyReview {
  id: string;
  version: typeof ATLAS_PRO_MONTHLY_REVIEW_VERSION;
  input: AtlasProMonthlyInput;
  statuses: Record<AtlasProMonthlyCycleStep["id"], AtlasProMonthlyActionStatus>;
  updatedAt: string;
}

export const emptyAtlasProMonthlyStatuses = (): StoredAtlasProMonthlyReview["statuses"] => ({ frame: "not-started", verify: "not-started", decide: "not-started", close: "not-started" });

function isStoredReview(value: unknown): value is StoredAtlasProMonthlyReview {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<StoredAtlasProMonthlyReview>;
  return record.version === ATLAS_PRO_MONTHLY_REVIEW_VERSION
    && typeof record.id === "string"
    && typeof record.updatedAt === "string"
    && Boolean(record.input)
    && typeof record.input?.month === "string"
    && atlasProMonthlyRoleValues.includes(record.input.role)
    && atlasProMonthlyFocusValues.includes(record.input.focus)
    && Boolean(record.statuses);
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

export function downloadAtlasProMonthlyReview(markdown: string, month: string) {
  const url = URL.createObjectURL(new Blob([markdown], { type: "text/markdown;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `atlas-pro-monthly-quality-review-${month}.md`;
  anchor.click();
  URL.revokeObjectURL(url);
}
