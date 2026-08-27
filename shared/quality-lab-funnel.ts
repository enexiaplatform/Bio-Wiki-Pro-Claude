import { z } from "zod";

export const QUALITY_LAB_FUNNEL_STAGES = [
  "example_explored",
  "cta_clicked",
  "planner_started",
  "start_mode_selected",
  "model_compiled",
  "review_viewed",
  "review_started",
  "review_requested",
  "diagnostic_checkout_started",
  "diagnostic_purchased",
] as const;

export type QualityLabFunnelStage = (typeof QUALITY_LAB_FUNNEL_STAGES)[number];

export const qualityLabFunnelEventSchema = z.object({
  eventId: z.string().uuid(),
  journeyId: z.string().uuid(),
  stage: z.enum(QUALITY_LAB_FUNNEL_STAGES),
  occurredAt: z.string().datetime(),
  source: z.string().trim().min(1).max(80).optional(),
  placement: z.string().trim().min(1).max(80).optional(),
  destination: z.string().trim().min(1).max(120).optional(),
  offer: z.string().trim().min(1).max(80).optional(),
  startMode: z.enum(["guided", "example", "blank", "import", "existing"]).optional(),
}).strict();

export type QualityLabFunnelEventInput = z.infer<typeof qualityLabFunnelEventSchema>;

export type QualityLabFunnelSnapshot = {
  generatedAt: string;
  windowDays: number;
  /** Commercial-intent journeys only; illustrative-only activity is excluded. */
  uniqueJourneys: number;
  illustrativeJourneys: number;
  stages: Array<{
    stage: QualityLabFunnelStage;
    journeys: number;
    percentOfPlannerStarts: number | null;
  }>;
};

type QualityLabFunnelSnapshotEvent = {
  journeyId: string;
  stage: QualityLabFunnelStage;
  placement?: string | null;
  destination?: string | null;
  startMode?: string | null;
};

export function buildQualityLabFunnelSnapshot(
  events: QualityLabFunnelSnapshotEvent[],
  windowDays = 30,
  generatedAt = new Date().toISOString(),
): QualityLabFunnelSnapshot {
  const eventsByJourney = new Map<string, typeof events>();
  for (const event of events) eventsByJourney.set(event.journeyId, [...(eventsByJourney.get(event.journeyId) ?? []), event]);

  const isIllustrativeEvent = (event: (typeof events)[number]) => event.stage === "example_explored"
    || event.startMode === "example"
    || (event.destination === "sample")
    || (event.destination === "editable_project" && event.placement?.startsWith("casebook_"));
  const isExplicitCommercialEvent = (event: (typeof events)[number]) => {
    if (isIllustrativeEvent(event)) return false;
    if (event.stage === "cta_clicked") return true;
    if (event.stage === "start_mode_selected") return event.startMode != null && event.startMode !== "example";
    if (event.stage === "model_compiled") return event.startMode != null && event.startMode !== "example";
    return ["review_viewed", "review_started", "review_requested", "diagnostic_checkout_started", "diagnostic_purchased"].includes(event.stage);
  };

  const illustrativeJourneys = new Set<string>();
  const commercialJourneys = new Set<string>();
  eventsByJourney.forEach((journeyEvents, journeyId) => {
    const hasIllustrativeActivity = journeyEvents.some(isIllustrativeEvent);
    const hasExplicitCommercialActivity = journeyEvents.some(isExplicitCommercialEvent);
    if (hasIllustrativeActivity) illustrativeJourneys.add(journeyId);
    if (hasExplicitCommercialActivity || (!hasIllustrativeActivity && journeyEvents.some((event) => event.stage !== "example_explored"))) {
      commercialJourneys.add(journeyId);
    }
  });

  const byStage = new Map<QualityLabFunnelStage, Set<string>>(
    QUALITY_LAB_FUNNEL_STAGES.map((stage) => [stage, new Set<string>()]),
  );
  for (const event of events) {
    if (isIllustrativeEvent(event)) {
      byStage.get("example_explored")?.add(event.journeyId);
      continue;
    }
    if (commercialJourneys.has(event.journeyId)) byStage.get(event.stage)?.add(event.journeyId);
  }

  const plannerStarts = byStage.get("planner_started")?.size ?? 0;
  return {
    generatedAt,
    windowDays,
    uniqueJourneys: commercialJourneys.size,
    illustrativeJourneys: illustrativeJourneys.size,
    stages: QUALITY_LAB_FUNNEL_STAGES.map((stage) => {
      const count = byStage.get(stage)?.size ?? 0;
      return {
        stage,
        journeys: count,
        percentOfPlannerStarts: stage !== "example_explored" && plannerStarts > 0
          ? Math.round((count / plannerStarts) * 1000) / 10
          : null,
      };
    }),
  };
}
