export const QUALITY_LAB_WORK_QUEUE_REMINDER_SOURCE = "work-queue-email" as const;
export const QUALITY_LAB_WEEKLY_REVIEW_REMINDER_SOURCE = "weekly-review-email" as const;
export const QUALITY_LAB_REMINDER_SOURCES = [QUALITY_LAB_WORK_QUEUE_REMINDER_SOURCE, QUALITY_LAB_WEEKLY_REVIEW_REMINDER_SOURCE] as const;
export type QualityLabReminderSource = typeof QUALITY_LAB_REMINDER_SOURCES[number];

const STORAGE_KEY = "atlas:quality-lab-reminder-attribution";
const ATTRIBUTION_TTL_MS = 24 * 60 * 60 * 1000;

type ReminderAttribution = {
  source: QualityLabReminderSource;
  attributedAt: number;
};

export function isQualityLabReminderSource(value: string | null): value is QualityLabReminderSource {
  return QUALITY_LAB_REMINDER_SOURCES.some((source) => source === value);
}

export function markQualityLabReminderAttribution(source: QualityLabReminderSource, now = Date.now()) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ source, attributedAt: now } satisfies ReminderAttribution));
  } catch {
    // Attribution is best-effort and must never block the work queue.
  }
}

export function getQualityLabReminderAttribution(now = Date.now()) {
  if (typeof window === "undefined") return null;
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) ?? "null") as ReminderAttribution | null;
    if (!parsed || !isQualityLabReminderSource(parsed.source) || !Number.isFinite(parsed.attributedAt)) return null;
    const ageMs = now - parsed.attributedAt;
    if (ageMs < 0 || ageMs > ATTRIBUTION_TTL_MS) {
      window.sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return { source: parsed.source, attributionAgeMinutes: Math.floor(ageMs / 60_000) };
  } catch {
    window.sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
}
