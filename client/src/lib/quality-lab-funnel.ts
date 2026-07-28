import {
  qualityLabFunnelEventSchema,
  type QualityLabFunnelEventInput,
} from "@shared/quality-lab-funnel";

const JOURNEY_STORAGE_KEY = "atlas_quality_lab_funnel_journey_v1";
const JOURNEY_IDLE_MS = 24 * 60 * 60 * 1000;
let fallbackJourneyId: string | null = null;

type StoredJourney = { id: string; lastSeenAt: number };

function randomId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (character) =>
    (Number(character) ^ (Math.random() * 16 >> (Number(character) / 4))).toString(16),
  );
}

export function getQualityLabFunnelJourneyId(now = Date.now()): string {
  if (typeof window === "undefined") return fallbackJourneyId ??= randomId();
  try {
    const stored = JSON.parse(window.localStorage.getItem(JOURNEY_STORAGE_KEY) ?? "null") as StoredJourney | null;
    const id = stored?.id && now - stored.lastSeenAt < JOURNEY_IDLE_MS ? stored.id : randomId();
    window.localStorage.setItem(JOURNEY_STORAGE_KEY, JSON.stringify({ id, lastSeenAt: now } satisfies StoredJourney));
    return id;
  } catch {
    return fallbackJourneyId ??= randomId();
  }
}

export function recordQualityLabFunnelEvent(
  input: Omit<QualityLabFunnelEventInput, "eventId" | "journeyId" | "occurredAt">,
): void {
  if (typeof window === "undefined" || typeof fetch !== "function") return;
  const parsed = qualityLabFunnelEventSchema.safeParse({
    ...input,
    eventId: randomId(),
    journeyId: getQualityLabFunnelJourneyId(),
    occurredAt: new Date().toISOString(),
  });
  if (!parsed.success) return;
  const event = parsed.data;
  void fetch("/api/quality-lab/funnel-events", {
    method: "POST",
    credentials: "include",
    keepalive: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  }).catch(() => undefined);
}
