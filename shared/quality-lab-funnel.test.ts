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
});
