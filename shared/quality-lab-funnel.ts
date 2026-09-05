import { z } from "zod";

export const QUALITY_LAB_ONBOARDING_PATHS = [
  "capability_model",
  "illustrative_sample",
  "scope_diagnostic",
] as const;

export type QualityLabOnboardingPath = (typeof QUALITY_LAB_ONBOARDING_PATHS)[number];

export const QUALITY_LAB_ACTIVATION_STAGES = [
  "onboarding_viewed",
  "onboarding_path_selected",
] as const;

export const QUALITY_LAB_COMMERCIAL_FUNNEL_STAGES = [
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

export const QUALITY_LAB_FUNNEL_STAGES = [
  ...QUALITY_LAB_ACTIVATION_STAGES,
  ...QUALITY_LAB_COMMERCIAL_FUNNEL_STAGES,
] as const;

export type QualityLabFunnelStage = (typeof QUALITY_LAB_FUNNEL_STAGES)[number];
export type QualityLabCommercialFunnelStage = (typeof QUALITY_LAB_COMMERCIAL_FUNNEL_STAGES)[number];

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
}).strict().superRefine((event, context) => {
  if (event.stage === "onboarding_path_selected" && !QUALITY_LAB_ONBOARDING_PATHS.includes(event.destination as QualityLabOnboardingPath)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["destination"],
      message: "Onboarding path selection requires a supported destination",
    });
  }
});

export type QualityLabFunnelEventInput = z.infer<typeof qualityLabFunnelEventSchema>;

export type QualityLabFunnelSnapshot = {
  generatedAt: string;
  windowDays: number;
  onboarding: {
    viewedAccounts: number;
    selectedAccounts: number;
    selectionRate: number | null;
    destinationReachedAccounts: number;
    destinationReachRate: number | null;
    paths: Array<{
      path: QualityLabOnboardingPath;
      selectedAccounts: number;
      reachedAccounts: number;
      reachRate: number | null;
    }>;
  };
  /** Commercial-intent journeys only; illustrative-only activity is excluded. */
  uniqueJourneys: number;
  illustrativeJourneys: number;
  stages: Array<{
    stage: QualityLabCommercialFunnelStage;
    journeys: number;
    percentOfPlannerStarts: number | null;
  }>;
};

type QualityLabFunnelSnapshotEvent = {
  journeyId: string;
  userId?: string | null;
  stage: QualityLabFunnelStage;
  occurredAt?: string | Date | null;
  source?: string | null;
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

  const onboardingViewers = new Set(
    events.filter((event) => event.stage === "onboarding_viewed" && event.userId).map((event) => event.userId as string),
  );
  const selectedByPath = new Map<QualityLabOnboardingPath, Set<string>>(
    QUALITY_LAB_ONBOARDING_PATHS.map((path) => [path, new Set<string>()]),
  );
  const reachedByPath = new Map<QualityLabOnboardingPath, Set<string>>(
    QUALITY_LAB_ONBOARDING_PATHS.map((path) => [path, new Set<string>()]),
  );
  const reachStageByPath: Record<QualityLabOnboardingPath, QualityLabFunnelStage> = {
    capability_model: "planner_started",
    illustrative_sample: "example_explored",
    scope_diagnostic: "review_viewed",
  };
  const isAttributedReach = (path: QualityLabOnboardingPath, event: (typeof events)[number]) => {
    if (event.stage !== reachStageByPath[path]) return false;
    if (path === "illustrative_sample") return event.placement === "onboarding";
    return event.source === "onboarding";
  };

  eventsByJourney.forEach((journeyEvents) => {
    for (const event of journeyEvents) {
      if (
        event.stage !== "onboarding_path_selected"
        || !event.userId
        || !onboardingViewers.has(event.userId)
        || !QUALITY_LAB_ONBOARDING_PATHS.includes(event.destination as QualityLabOnboardingPath)
      ) continue;
      const path = event.destination as QualityLabOnboardingPath;
      selectedByPath.get(path)?.add(event.userId);
      const selectedAt = event.occurredAt ? new Date(event.occurredAt).getTime() : null;
      if (journeyEvents.some((candidate) => {
        if (!isAttributedReach(path, candidate)) return false;
        const reachedAt = candidate.occurredAt ? new Date(candidate.occurredAt).getTime() : null;
        return selectedAt === null || reachedAt === null || reachedAt >= selectedAt;
      })) {
        reachedByPath.get(path)?.add(event.userId);
      }
    }
  });
  const selectedAccounts = new Set(Array.from(selectedByPath.values()).flatMap((accounts) => Array.from(accounts)));
  const destinationReachedAccounts = new Set(Array.from(reachedByPath.values()).flatMap((accounts) => Array.from(accounts)));
  const percent = (numerator: number, denominator: number) => denominator > 0
    ? Math.round((numerator / denominator) * 1000) / 10
    : null;

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
    if (hasExplicitCommercialActivity || (!hasIllustrativeActivity && journeyEvents.some((event) => QUALITY_LAB_COMMERCIAL_FUNNEL_STAGES.includes(event.stage as QualityLabCommercialFunnelStage)))) {
      commercialJourneys.add(journeyId);
    }
  });

  const byStage = new Map<QualityLabCommercialFunnelStage, Set<string>>(
    QUALITY_LAB_COMMERCIAL_FUNNEL_STAGES.map((stage) => [stage, new Set<string>()]),
  );
  for (const event of events) {
    if (isIllustrativeEvent(event)) {
      byStage.get("example_explored")?.add(event.journeyId);
      continue;
    }
    if (commercialJourneys.has(event.journeyId)) byStage.get(event.stage as QualityLabCommercialFunnelStage)?.add(event.journeyId);
  }

  const plannerStarts = byStage.get("planner_started")?.size ?? 0;
  return {
    generatedAt,
    windowDays,
    onboarding: {
      viewedAccounts: onboardingViewers.size,
      selectedAccounts: selectedAccounts.size,
      selectionRate: percent(selectedAccounts.size, onboardingViewers.size),
      destinationReachedAccounts: destinationReachedAccounts.size,
      destinationReachRate: percent(destinationReachedAccounts.size, onboardingViewers.size),
      paths: QUALITY_LAB_ONBOARDING_PATHS.map((path) => ({
        path,
        selectedAccounts: selectedByPath.get(path)?.size ?? 0,
        reachedAccounts: reachedByPath.get(path)?.size ?? 0,
        reachRate: percent(reachedByPath.get(path)?.size ?? 0, selectedByPath.get(path)?.size ?? 0),
      })),
    },
    uniqueJourneys: commercialJourneys.size,
    illustrativeJourneys: illustrativeJourneys.size,
    stages: QUALITY_LAB_COMMERCIAL_FUNNEL_STAGES.map((stage) => {
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
