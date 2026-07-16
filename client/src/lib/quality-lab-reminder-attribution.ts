export const QUALITY_LAB_REMINDER_SOURCE = "work-queue-email" as const;

const STORAGE_KEY = "atlas:quality-lab-reminder-attribution";
const ATTRIBUTION_TTL_MS = 24 * 60 * 60 * 1000;

type ReminderAttribution = {
  source: typeof QUALITY_LAB_REMINDER_SOURCE;
  attributedAt: number;
};

export function markQualityLabReminderAttribution(now = Date.now()) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ source: QUALITY_LAB_REMINDER_SOURCE, attributedAt: now } satisfies ReminderAttribution));
  } catch {
    // Attribution is best-effort and must never block the work queue.
  }
}

export function getQualityLabReminderAttribution(now = Date.now()) {
  if (typeof window === "undefined") return null;
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) ?? "null") as ReminderAttribution | null;
    if (!parsed || parsed.source !== QUALITY_LAB_REMINDER_SOURCE || !Number.isFinite(parsed.attributedAt)) return null;
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
