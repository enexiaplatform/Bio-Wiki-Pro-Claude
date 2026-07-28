import { z } from "zod";

export const QUALITY_LAB_FUNNEL_STAGES = [
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
  startMode: z.enum(["guided", "example", "blank", "import"]).optional(),
}).strict();

export type QualityLabFunnelEventInput = z.infer<typeof qualityLabFunnelEventSchema>;

export type QualityLabFunnelSnapshot = {
  generatedAt: string;
  windowDays: number;
  uniqueJourneys: number;
  stages: Array<{
    stage: QualityLabFunnelStage;
    journeys: number;
    percentOfPlannerStarts: number | null;
  }>;
};

export function buildQualityLabFunnelSnapshot(
  events: Array<Pick<QualityLabFunnelEventInput, "journeyId" | "stage">>,
  windowDays = 30,
  generatedAt = new Date().toISOString(),
): QualityLabFunnelSnapshot {
  const journeys = new Set(events.map((event) => event.journeyId));
  const byStage = new Map<QualityLabFunnelStage, Set<string>>(
    QUALITY_LAB_FUNNEL_STAGES.map((stage) => [stage, new Set<string>()]),
  );
  for (const event of events) byStage.get(event.stage)?.add(event.journeyId);

  const plannerStarts = byStage.get("planner_started")?.size ?? 0;
  return {
    generatedAt,
    windowDays,
    uniqueJourneys: journeys.size,
    stages: QUALITY_LAB_FUNNEL_STAGES.map((stage) => {
      const count = byStage.get(stage)?.size ?? 0;
      return {
        stage,
        journeys: count,
        percentOfPlannerStarts: plannerStarts > 0
          ? Math.round((count / plannerStarts) * 1000) / 10
          : null,
      };
    }),
  };
}
