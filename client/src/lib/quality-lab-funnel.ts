import {
  qualityLabFunnelEventSchema,
  type QualityLabFunnelEventInput,
} from "@shared/quality-lab-funnel";

const JOURNEY_STORAGE_KEY = "atlas_quality_lab_funnel_journey_v1";
const JOURNEY_IDLE_MS = 24 * 60 * 60 * 1000;
const RETRY_DELAYS_MS = [1_000, 3_000] as const;
const REQUEST_TIMEOUT_MS = 5_000;
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

async function sendFunnelEvent(body: string, attempt = 0): Promise<void> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let retry = false;
  try {
    const response = await fetch("/api/quality-lab/funnel-events", {
      method: "POST",
      credentials: "include",
      keepalive: true,
      signal: controller.signal,
      headers: { "Content-Type": "application/json" },
      body,
    });
    retry = response.status === 429 || response.status >= 500;
    if (response.ok) {
      const acknowledgement = await response.json().catch(() => null);
      // accepted includes an idempotent duplicate; older deployments only return recorded.
      retry = controller.signal.aborted || (acknowledgement?.accepted !== true && acknowledgement?.recorded === false);
    }
  } catch {
    retry = true;
  } finally {
    clearTimeout(timeout);
  }
  if (retry && attempt < RETRY_DELAYS_MS.length) {
    setTimeout(() => void sendFunnelEvent(body, attempt + 1), RETRY_DELAYS_MS[attempt]);
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
  // Keep only the validated metadata in memory and reuse the event ID across retries.
  void sendFunnelEvent(JSON.stringify(parsed.data));
}
