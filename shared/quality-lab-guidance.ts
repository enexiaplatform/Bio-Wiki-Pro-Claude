import type { QualityLabInput } from "./quality-lab.js";

export type QualityLabDemandPresetId = "small-routine" | "growing-site" | "high-throughput";
export type QualityLabOperatingPresetId = "lean" | "balanced" | "resilient";

export interface QualityLabGuidancePreset<TId extends string, TValues> {
  id: TId;
  label: string;
  summary: string;
  bestFor: string;
  values: TValues;
}

type DemandValues = Pick<QualityLabInput,
  | "finishedBatchesPerMonth"
  | "rawMaterialLotsPerMonth"
  | "waterPoints"
  | "waterRoundsPerWeek"
  | "emLocations"
  | "emRoundsPerWeek"
  | "mediaLotsPerMonth"
>;

type OperatingValues = Pick<QualityLabInput,
  | "targetTurnaroundDays"
  | "growthRatePercent"
  | "horizonYears"
  | "workingDaysPerMonth"
  | "shifts"
  | "productiveHoursPerShift"
  | "outsourcePercent"
  | "redundancyPercent"
  | "equipmentDowntimePercent"
  | "consumableWastePercent"
  | "consumableLeadTimeDays"
  | "consumableSafetyStockDays"
>;

export const qualityLabDemandPresets: Array<QualityLabGuidancePreset<QualityLabDemandPresetId, DemandValues>> = [
  {
    id: "small-routine",
    label: "Small routine site",
    summary: "12 release batches and 20 incoming lots per month, with light monitoring demand.",
    bestFor: "A first-pass model for a small portfolio or early insourcing discussion.",
    values: { finishedBatchesPerMonth: 12, rawMaterialLotsPerMonth: 20, waterPoints: 8, waterRoundsPerWeek: 1, emLocations: 8, emRoundsPerWeek: 1, mediaLotsPerMonth: 4 },
  },
  {
    id: "growing-site",
    label: "Growing site",
    summary: "30 release batches and 45 incoming lots per month, with regular water and EM rounds.",
    bestFor: "A balanced starting case for a non-sterile site planning expansion.",
    values: { finishedBatchesPerMonth: 30, rawMaterialLotsPerMonth: 45, waterPoints: 18, waterRoundsPerWeek: 2, emLocations: 24, emRoundsPerWeek: 1, mediaLotsPerMonth: 8 },
  },
  {
    id: "high-throughput",
    label: "High-throughput site",
    summary: "80 release batches and 120 incoming lots per month, with denser monitoring demand.",
    bestFor: "Stress-testing staffing, equipment headroom and phased capacity.",
    values: { finishedBatchesPerMonth: 80, rawMaterialLotsPerMonth: 120, waterPoints: 30, waterRoundsPerWeek: 2, emLocations: 50, emRoundsPerWeek: 2, mediaLotsPerMonth: 16 },
  },
];

export const qualityLabOperatingPresets: Array<QualityLabGuidancePreset<QualityLabOperatingPresetId, OperatingValues>> = [
  {
    id: "lean",
    label: "Lean concept",
    summary: "One shift, 10% people reserve and 10% equipment downtime.",
    bestFor: "Testing the lowest practical concept while keeping limitations visible.",
    values: { targetTurnaroundDays: 5, growthRatePercent: 30, horizonYears: 3, workingDaysPerMonth: 22, shifts: 1, productiveHoursPerShift: 6.5, outsourcePercent: 10, redundancyPercent: 10, equipmentDowntimePercent: 10, consumableWastePercent: 7, consumableLeadTimeDays: 30, consumableSafetyStockDays: 21 },
  },
  {
    id: "balanced",
    label: "Balanced planning",
    summary: "One shift, 20% people reserve and 15% equipment downtime.",
    bestFor: "The recommended neutral starting point when observed site data is not yet available.",
    values: { targetTurnaroundDays: 5, growthRatePercent: 70, horizonYears: 3, workingDaysPerMonth: 22, shifts: 1, productiveHoursPerShift: 6, outsourcePercent: 10, redundancyPercent: 20, equipmentDowntimePercent: 15, consumableWastePercent: 10, consumableLeadTimeDays: 45, consumableSafetyStockDays: 30 },
  },
  {
    id: "resilient",
    label: "Resilient service",
    summary: "Two shifts, 30% people reserve and 20% equipment downtime.",
    bestFor: "Challenging continuity, peak demand and backup-capacity expectations.",
    values: { targetTurnaroundDays: 5, growthRatePercent: 100, horizonYears: 5, workingDaysPerMonth: 22, shifts: 2, productiveHoursPerShift: 6, outsourcePercent: 15, redundancyPercent: 30, equipmentDowntimePercent: 20, consumableWastePercent: 12, consumableLeadTimeDays: 60, consumableSafetyStockDays: 45 },
  },
];

export function suggestQualityLabDecision(input: QualityLabInput): string {
  const site = input.country.trim() ? `the ${input.country.trim()} site` : "this site";
  if (input.projectIntent === "capacity-expansion") return `Which microbiology capabilities and phased capacity should ${site} fund for current demand and the planning-horizon growth scenario?`;
  if (input.projectIntent === "compliance-upgrade") return `Which microbiology capability, evidence and operating-model gaps should ${site} close first to support the intended regulated markets?`;
  if (input.projectIntent === "insource-outsource") return `Which microbiology tests should ${site} perform in-house, outsource or phase later without compromising turnaround, continuity or evidence control?`;
  if (input.projectIntent === "operating-model-change") return `Which microbiology operating model should ${site} adopt to balance turnaround, staffing, resilience and cost?`;
  return `Which microbiology capabilities, staffing, equipment and functional space should ${site} establish for the planned product and market demand?`;
}

export function suggestQualityLabScope(input: QualityLabInput): QualityLabInput["scope"] {
  const coreDemand = input.finishedBatchesPerMonth > 0 || input.rawMaterialLotsPerMonth > 0;
  return {
    rawMaterials: input.rawMaterialLotsPerMonth > 0,
    finishedProducts: input.finishedBatchesPerMonth > 0,
    water: input.waterPoints > 0 && input.waterRoundsPerWeek > 0,
    environmentalMonitoring: input.emLocations > 0 && input.emRoundsPerWeek > 0,
    sterility: input.sterilityBatchesPerMonth > 0,
    endotoxin: input.endotoxinSamplesPerMonth > 0,
    bioburden: input.bioburdenSamplesPerMonth > 0,
    growthPromotion: input.mediaLotsPerMonth > 0 || coreDemand,
  };
}

export function applyQualityLabDemandPreset(input: QualityLabInput, presetId: QualityLabDemandPresetId): QualityLabInput {
  const preset = qualityLabDemandPresets.find((item) => item.id === presetId);
  if (!preset) return input;
  const next = { ...input, ...preset.values };
  return { ...next, scope: suggestQualityLabScope(next) };
}

export function applyQualityLabOperatingPreset(input: QualityLabInput, presetId: QualityLabOperatingPresetId): QualityLabInput {
  const preset = qualityLabOperatingPresets.find((item) => item.id === presetId);
  return preset ? { ...input, ...preset.values } : input;
}
