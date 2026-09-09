import { describe, expect, it } from "vitest";
import { buildQualityLabFunnelSnapshot, qualityLabFunnelEventSchema } from "./quality-lab-funnel";

describe("Quality Lab funnel contract", () => {
  it("accepts a privacy-minimal illustrative exploration receipt", () => {
    const parsed = qualityLabFunnelEventSchema.safeParse({
      eventId: "5ce422d1-34f8-4a5d-a121-14d4339f323c",
      journeyId: "03bb1889-35b8-487a-a8ab-f447aaec3b31",
      stage: "example_explored",
      occurredAt: "2026-08-26T00:00:00.000Z",
      placement: "casebook_complete-in-house",
      destination: "synthetic_blueprint",
      startMode: "example",
    });

    expect(parsed.success).toBe(true);
  });

  it("accepts only supported onboarding path destinations", () => {
    const base = {
      eventId: "5ce422d1-34f8-4a5d-a121-14d4339f323c",
      journeyId: "03bb1889-35b8-487a-a8ab-f447aaec3b31",
      stage: "onboarding_path_selected",
      occurredAt: "2026-08-26T00:00:00.000Z",
      source: "welcome",
    } as const;

    expect(qualityLabFunnelEventSchema.safeParse({ ...base, destination: "scope_diagnostic" }).success).toBe(true);
    expect(qualityLabFunnelEventSchema.safeParse({ ...base, destination: "academy" }).success).toBe(false);
    expect(qualityLabFunnelEventSchema.safeParse(base).success).toBe(false);
  });

  it("rejects arbitrary project or personal data", () => {
    const parsed = qualityLabFunnelEventSchema.safeParse({
      eventId: "5ce422d1-34f8-4a5d-a121-14d4339f323c",
      journeyId: "03bb1889-35b8-487a-a8ab-f447aaec3b31",
      stage: "planner_started",
      occurredAt: "2026-07-28T00:00:00.000Z",
      projectName: "Confidential expansion",
    });
    expect(parsed.success).toBe(false);
  });

  it("deduplicates repeated events within the same journey", () => {
    const snapshot = buildQualityLabFunnelSnapshot([
      { journeyId: "journey-a", stage: "planner_started" },
      { journeyId: "journey-a", stage: "model_compiled" },
      { journeyId: "journey-a", stage: "model_compiled" },
      { journeyId: "journey-b", stage: "planner_started" },
    ], 30, "2026-07-28T00:00:00.000Z");

    expect(snapshot.uniqueJourneys).toBe(2);
    expect(snapshot.illustrativeJourneys).toBe(0);
    expect(snapshot.stages.find((stage) => stage.stage === "model_compiled")).toMatchObject({
      journeys: 1,
      percentOfPlannerStarts: 50,
    });
  });

  it("keeps current and legacy illustrative exploration out of commercial conversion", () => {
    const snapshot = buildQualityLabFunnelSnapshot([
      { journeyId: "casebook-new", stage: "example_explored", placement: "casebook_complete-in-house", destination: "synthetic_blueprint", startMode: "example" },
      { journeyId: "casebook-legacy", stage: "cta_clicked", placement: "casebook_complete-in-house", destination: "editable_project" },
      { journeyId: "sample-legacy", stage: "cta_clicked", placement: "home_hero", destination: "sample" },
      { journeyId: "worked-example", stage: "planner_started" },
      { journeyId: "worked-example", stage: "start_mode_selected", startMode: "example" },
      { journeyId: "worked-example", stage: "model_compiled", startMode: null },
      { journeyId: "commercial", stage: "planner_started" },
      { journeyId: "commercial", stage: "start_mode_selected", startMode: "guided" },
      { journeyId: "commercial", stage: "model_compiled", startMode: "guided" },
    ], 30, "2026-08-26T00:00:00.000Z");

    expect(snapshot.uniqueJourneys).toBe(1);
    expect(snapshot.illustrativeJourneys).toBe(4);
    expect(snapshot.stages.find((stage) => stage.stage === "example_explored")?.journeys).toBe(4);
    expect(snapshot.stages.find((stage) => stage.stage === "planner_started")?.journeys).toBe(1);
    expect(snapshot.stages.find((stage) => stage.stage === "model_compiled")?.journeys).toBe(1);
  });

  it("measures authenticated onboarding selection and destination reach without inflating commercial journeys", () => {
    const snapshot = buildQualityLabFunnelSnapshot([
      { journeyId: "model-journey", userId: "user-a", stage: "onboarding_viewed" },
      { journeyId: "model-journey", userId: "user-a", stage: "onboarding_path_selected", destination: "capability_model" },
      { journeyId: "model-journey", userId: "user-a", stage: "planner_started", source: "onboarding" },
      { journeyId: "sample-journey", userId: "user-b", stage: "onboarding_viewed" },
      { journeyId: "sample-journey", userId: "user-b", stage: "onboarding_path_selected", destination: "illustrative_sample" },
      { journeyId: "sample-journey", userId: "user-b", stage: "example_explored", placement: "onboarding", destination: "sample", startMode: "example" },
      { journeyId: "diagnostic-journey", userId: "user-c", stage: "onboarding_viewed" },
      { journeyId: "diagnostic-journey", userId: "user-c", stage: "onboarding_path_selected", destination: "scope_diagnostic" },
      { journeyId: "diagnostic-journey", userId: "user-c", stage: "review_viewed", source: "onboarding" },
      { journeyId: "no-choice", userId: "user-d", stage: "onboarding_viewed" },
      { journeyId: "forged-anonymous", userId: null, stage: "onboarding_viewed" },
      { journeyId: "forged-anonymous", userId: null, stage: "onboarding_path_selected", destination: "scope_diagnostic" },
    ], 30, "2026-08-26T00:00:00.000Z");

    expect(snapshot.onboarding).toMatchObject({
      viewedAccounts: 4,
      selectedAccounts: 3,
      selectionRate: 75,
      destinationReachedAccounts: 3,
      destinationReachRate: 75,
    });
    expect(snapshot.onboarding.paths).toEqual([
      { path: "capability_model", selectedAccounts: 1, reachedAccounts: 1, reachRate: 100 },
      { path: "illustrative_sample", selectedAccounts: 1, reachedAccounts: 1, reachRate: 100 },
      { path: "scope_diagnostic", selectedAccounts: 1, reachedAccounts: 1, reachRate: 100 },
    ]);
    expect(snapshot.uniqueJourneys).toBe(2);
    expect(snapshot.illustrativeJourneys).toBe(1);
  });

  it("does not treat destination activity before path selection as a completed handoff", () => {
    const snapshot = buildQualityLabFunnelSnapshot([
      { journeyId: "returning-journey", userId: "user-a", stage: "example_explored", occurredAt: "2026-08-26T08:00:00.000Z", placement: "public_sample_view", destination: "sample", startMode: "example" },
      { journeyId: "returning-journey", userId: "user-a", stage: "onboarding_viewed", occurredAt: "2026-08-26T09:00:00.000Z" },
      { journeyId: "returning-journey", userId: "user-a", stage: "onboarding_path_selected", occurredAt: "2026-08-26T09:01:00.000Z", destination: "illustrative_sample" },
    ], 30, "2026-08-26T10:00:00.000Z");

    expect(snapshot.onboarding).toMatchObject({
      viewedAccounts: 1,
      selectedAccounts: 1,
      selectionRate: 100,
      destinationReachedAccounts: 0,
      destinationReachRate: 0,
    });
    expect(snapshot.onboarding.paths.find((path) => path.path === "illustrative_sample")).toMatchObject({
      selectedAccounts: 1,
      reachedAccounts: 0,
      reachRate: 0,
    });
  });
});
