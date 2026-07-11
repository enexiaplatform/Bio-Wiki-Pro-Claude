import { describe, expect, it } from "vitest";
import { createQualityLabProject, defaultQualityLabInput } from "./quality-lab";
import { calculateVariancePercent, createQualityLabEngagementPacket, qualityLabEngagementPacketSchema } from "./quality-lab-engagement";

describe("Quality Lab engagement packet", () => {
  it("creates a validated review checklist and empty learning logs", () => {
    const project = createQualityLabProject(defaultQualityLabInput, "qlp_test");
    const packet = createQualityLabEngagementPacket(project, "2026-07-11T00:00:00.000Z");
    expect(qualityLabEngagementPacketSchema.safeParse(packet).success).toBe(true);
    expect(packet.checklist).toHaveLength(project.blueprint.unresolvedInputs.length);
    expect(packet.checklist.every((item) => item.status === "open")).toBe(true);
    expect(packet.corrections).toEqual([]);
    expect(packet.decisions).toEqual([]);
    expect(packet.controls).toMatchObject({ expertApprovalInsideAtlas: false, containsContactData: false });
  });

  it("calculates estimate-to-actual variance without inventing a zero baseline", () => {
    expect(calculateVariancePercent(100, 115)).toBe(15);
    expect(calculateVariancePercent(100, 85)).toBe(-15);
    expect(calculateVariancePercent(0, 0)).toBe(0);
    expect(calculateVariancePercent(0, 5)).toBeNull();
  });
});
