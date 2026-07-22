import type { BlueprintScenario, MethodCapacitySummary, SpaceRecommendation } from "./quality-lab";

export type ScenarioMetricKey = "monthlyTests" | "monthlyHandsOnHours" | "totalTeamFte" | "estimatedAreaSqm";

export interface ScenarioComparisonMetric {
  key: ScenarioMetricKey;
  label: string;
  unit: string;
  current: number;
  future: number;
  currentPlotPercent: number;
  futurePlotPercent: number;
  changePercent: number;
}

export interface CapacityVisualRow extends MethodCapacitySummary {
  status: "headroom" | "watch" | "constrained";
  plotPercent: number;
}

export interface ZoneRect extends SpaceRecommendation {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  sharePercent: number;
}

const scenarioMetricDefinitions: Array<{ key: ScenarioMetricKey; label: string; unit: string }> = [
  { key: "monthlyTests", label: "Test units", unit: "/ month" },
  { key: "monthlyHandsOnHours", label: "Hands-on load", unit: "hours / month" },
  { key: "totalTeamFte", label: "Team capacity", unit: "FTE" },
  { key: "estimatedAreaSqm", label: "Space allowance", unit: "m²" },
];

const round = (value: number, digits = 1) => Number(value.toFixed(digits));

export function buildScenarioComparison(current: BlueprintScenario, future: BlueprintScenario): ScenarioComparisonMetric[] {
  return scenarioMetricDefinitions.map(({ key, label, unit }) => {
    const currentValue = current[key];
    const futureValue = future[key];
    const maximum = Math.max(currentValue, futureValue, 1);
    return {
      key,
      label,
      unit,
      current: currentValue,
      future: futureValue,
      currentPlotPercent: round((currentValue / maximum) * 100),
      futurePlotPercent: round((futureValue / maximum) * 100),
      changePercent: currentValue > 0 ? round(((futureValue - currentValue) / currentValue) * 100) : 0,
    };
  });
}

export function buildCapacityVisual(rows: MethodCapacitySummary[]): CapacityVisualRow[] {
  return rows.map((row) => ({
    ...row,
    status: row.utilizationPercent >= 100 ? "constrained" : row.utilizationPercent >= 85 ? "watch" : "headroom",
    // The visual scale intentionally extends to 120% so overload remains visible instead of being clipped at capacity.
    plotPercent: round(Math.min(Math.max(row.utilizationPercent, 0), 120) / 1.2),
  }));
}

function stableZoneId(name: string, index: number) {
  return `${index + 1}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}

/**
 * Builds a deterministic, area-proportional two-band schematic. It represents
 * functional allowance only: the rectangles are not rooms or surveyed geometry.
 */
export function buildZoneLayout(spaces: SpaceRecommendation[], width = 720, height = 320, gap = 0): ZoneRect[] {
  const validSpaces = spaces.filter((space) => Number.isFinite(space.areaSqm) && space.areaSqm > 0);
  const totalArea = validSpaces.reduce((sum, space) => sum + space.areaSqm, 0);
  if (validSpaces.length === 0 || totalArea === 0) return [];

  const targetFirstBandArea = totalArea / 2;
  let firstBandArea = 0;
  let splitIndex = 0;
  validSpaces.forEach((space, index) => {
    if (firstBandArea < targetFirstBandArea || index === 0) {
      firstBandArea += space.areaSqm;
      splitIndex = index + 1;
    }
  });

  // Keep both bands populated when more than one zone exists.
  splitIndex = validSpaces.length > 1 ? Math.min(splitIndex, validSpaces.length - 1) : splitIndex;
  const bands = [validSpaces.slice(0, splitIndex), validSpaces.slice(splitIndex)].filter((band) => band.length > 0);
  const usableHeight = height - gap * Math.max(0, bands.length - 1);
  let y = 0;

  return bands.flatMap((band) => {
    const bandArea = band.reduce((sum, space) => sum + space.areaSqm, 0);
    const bandHeight = usableHeight * (bandArea / totalArea);
    const usableWidth = width - gap * Math.max(0, band.length - 1);
    let x = 0;
    const rectangles = band.map((space) => {
      const rectWidth = usableWidth * (space.areaSqm / bandArea);
      const index = validSpaces.indexOf(space);
      const rectangle: ZoneRect = {
        ...space,
        id: stableZoneId(space.name, index),
        x: round(x, 3),
        y: round(y, 3),
        width: round(rectWidth, 3),
        height: round(bandHeight, 3),
        sharePercent: round((space.areaSqm / totalArea) * 100),
      };
      x += rectWidth + gap;
      return rectangle;
    });
    y += bandHeight + gap;
    return rectangles;
  });
}
