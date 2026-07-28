import { describe, expect, it } from "vitest";
import { buildQualityLabFunnelSnapshot, qualityLabFunnelEventSchema } from "./quality-lab-funnel";

describe("Quality Lab funnel contract", () => {
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
    expect(snapshot.stages.find((stage) => stage.stage === "model_compiled")).toMatchObject({
      journeys: 1,
      percentOfPlannerStarts: 50,
    });
  });
});
