import { describe, expect, it } from "vitest";
import { compileQualityLabBlueprint, defaultQualityLabInput } from "./quality-lab";
import { buildCapacityVisual, buildScenarioComparison, buildZoneLayout } from "./quality-lab-visuals";

describe("Blueprint visual decision models", () => {
  const blueprint = compileQualityLabBlueprint(defaultQualityLabInput);

  it("compares each scenario metric on its own truthful scale", () => {
    const metrics = buildScenarioComparison(blueprint.current, blueprint.future);

    expect(metrics.map((metric) => metric.key)).toEqual([
      "monthlyTests",
      "monthlyHandsOnHours",
      "totalTeamFte",
      "estimatedAreaSqm",
    ]);
    expect(metrics.every((metric) => Math.max(metric.currentPlotPercent, metric.futurePlotPercent) === 100)).toBe(true);
    expect(metrics.every((metric) => metric.changePercent >= 0)).toBe(true);
  });

  it("keeps overload visible and assigns explicit capacity states", () => {
    const rows = buildCapacityVisual([
      { ...blueprint.methodCapacitySummary[0], utilizationPercent: 72 },
      { ...blueprint.methodCapacitySummary[0], resourceId: "bsc", utilizationPercent: 91 },
      { ...blueprint.methodCapacitySummary[0], resourceId: "autoclave", utilizationPercent: 126 },
    ]);

    expect(rows.map((row) => row.status)).toEqual(["headroom", "watch", "constrained"]);
    expect(rows[2].plotPercent).toBe(100);
    expect(rows[1].plotPercent).toBeGreaterThan(rows[0].plotPercent);
  });

  it("creates non-overlapping, area-proportional 2D zoning bands", () => {
    const width = 720;
    const height = 320;
    const zones = buildZoneLayout(blueprint.spaces, width, height);

    expect(zones).toHaveLength(blueprint.spaces.length);
    expect(zones.reduce((sum, zone) => sum + zone.sharePercent, 0)).toBeCloseTo(100, 0);
    expect(zones.every((zone) => zone.x >= 0 && zone.y >= 0 && zone.x + zone.width <= width + 0.01 && zone.y + zone.height <= height + 0.01)).toBe(true);
    zones.forEach((zone) => {
      expect(((zone.width * zone.height) / (width * height)) * 100).toBeCloseTo(zone.sharePercent, 1);
    });

    for (let left = 0; left < zones.length; left += 1) {
      for (let right = left + 1; right < zones.length; right += 1) {
        const a = zones[left];
        const b = zones[right];
        const overlaps = a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
        expect(overlaps).toBe(false);
      }
    }
  });
});
