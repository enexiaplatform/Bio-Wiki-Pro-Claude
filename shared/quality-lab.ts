import { z } from "zod";
import {
  QUALITY_LAB_BLUEPRINT_CONTRACT_VERSION,
  QUALITY_LAB_COMPILER_CORE_VERSION,
  QUALITY_LAB_INPUT_CONTRACT_VERSION,
  blueprintReviewSchema,
  dataQualitySummarySchema,
  evidenceRecordSchema,
  ruleTraceSchema,
  unresolvedInputSchema,
  type EvidenceRecord,
  type RuleTrace,
  type UnresolvedInput,
} from "./quality-lab-contract";
import {
  MICROBIOLOGY_DOMAIN_PACK,
  MICROBIOLOGY_EVIDENCE_CATALOG,
  MICROBIOLOGY_SHARED_RULE_TRACE,
  MICROBIOLOGY_WORKFLOW_RULES,
  workflowRuleTrace,
  type MicrobiologyWorkflowKey,
} from "./quality-lab-microbiology-pack";
import {
  compileNonSterileMethodGraph,
  productProfileSchema,
  methodRequirementSchema,
  methodBomItemSchema,
  methodCapacityDemandSchema,
  type ProductProfile,
} from "./quality-lab-method-graph";

export * from "./quality-lab-contract";
export * from "./quality-lab-microbiology-pack";
export * from "./quality-lab-method-graph";

export const QUALITY_LAB_ENGINE_VERSION = `${QUALITY_LAB_COMPILER_CORE_VERSION}+${MICROBIOLOGY_DOMAIN_PACK.version}`;

export const facilityTypeValues = [
  "nonsterile-pharma",
  "sterile-pharma",
  "biologics",
  "food-beverage",
  "cosmetics",
  "medical-device",
] as const;

export const marketValues = ["vietnam", "asean", "eu", "us", "who"] as const;

export const qualityLabInputSchema = z.object({
  contractVersion: z.literal(QUALITY_LAB_INPUT_CONTRACT_VERSION).default(QUALITY_LAB_INPUT_CONTRACT_VERSION),
  projectName: z.string().trim().min(2).max(120),
  companyName: z.string().trim().max(120).default(""),
  country: z.string().trim().min(2).max(80),
  facilityType: z.enum(facilityTypeValues),
  markets: z.array(z.enum(marketValues)).min(1),
  finishedProducts: z.number().int().min(0).max(10_000),
  rawMaterials: z.number().int().min(0).max(10_000),
  finishedBatchesPerMonth: z.number().min(0).max(100_000),
  rawMaterialLotsPerMonth: z.number().min(0).max(100_000),
  waterPoints: z.number().int().min(0).max(10_000),
  waterRoundsPerWeek: z.number().min(0).max(21),
  emLocations: z.number().int().min(0).max(100_000),
  emRoundsPerWeek: z.number().min(0).max(21),
  sterilityBatchesPerMonth: z.number().min(0).max(100_000),
  endotoxinSamplesPerMonth: z.number().min(0).max(100_000),
  bioburdenSamplesPerMonth: z.number().min(0).max(100_000),
  mediaLotsPerMonth: z.number().min(0).max(10_000),
  scope: z.object({
    rawMaterials: z.boolean(),
    finishedProducts: z.boolean(),
    water: z.boolean(),
    environmentalMonitoring: z.boolean(),
    sterility: z.boolean(),
    endotoxin: z.boolean(),
    bioburden: z.boolean(),
    growthPromotion: z.boolean(),
  }),
  targetTurnaroundDays: z.number().min(1).max(60),
  growthRatePercent: z.number().min(-50).max(500),
  horizonYears: z.number().int().min(1).max(10),
  workingDaysPerMonth: z.number().int().min(10).max(31),
  shifts: z.number().int().min(1).max(3),
  productiveHoursPerShift: z.number().min(2).max(12),
  outsourcePercent: z.number().min(0).max(95),
  redundancyPercent: z.number().min(0).max(100),
  equipmentDowntimePercent: z.number().min(0).max(50),
  consumableWastePercent: z.number().min(0).max(50).default(10),
  consumableLeadTimeDays: z.number().int().min(1).max(365).default(45),
  consumableSafetyStockDays: z.number().int().min(0).max(365).default(30),
  analystAnnualCostUsd: z.number().min(0).max(500_000),
  productProfiles: z.array(productProfileSchema).max(500).default([]),
  portfolioIsComplete: z.boolean().default(false),
});

export type QualityLabInput = z.infer<typeof qualityLabInputSchema>;
export type QualityLabFacilityType = QualityLabInput["facilityType"];
export type QualityLabMarket = QualityLabInput["markets"][number];

export interface WorkflowDemand {
  id: string;
  ruleId: string;
  label: string;
  monthlyUnits: number;
  monthlyHandsOnHours: number;
  monthlyPlateDays: number;
  monthlyMediaLiters: number;
  turnaroundDays: number;
  criticality: "routine" | "important" | "critical";
  confidence: "high" | "medium" | "indicative";
  evidenceIds: string[];
  basis: string;
}

export interface EquipmentRecommendation {
  id: string;
  name: string;
  category: string;
  quantityNow: number;
  quantityFuture: number;
  unitCapexLowUsd: number;
  unitCapexHighUsd: number;
  confidence: "high" | "medium" | "indicative";
  rationale: string;
  specification: string;
  methodRequirementIds: string[];
  methodLoadBasis: string[];
  evidenceIds: string[];
}

export interface ConsumableForecast {
  id: string;
  name: string;
  unit: string;
  quantityPerMonthNow: number;
  quantityPerMonthFuture: number;
  unitCostLowUsd: number;
  unitCostHighUsd: number;
}

export interface SpaceRecommendation {
  name: string;
  areaSqm: number;
  rationale: string;
}

export interface BlueprintRisk {
  id: string;
  severity: "high" | "medium" | "low";
  title: string;
  description: string;
  mitigation: string;
}

export interface BlueprintAssumption {
  id: string;
  label: string;
  value: string;
  confidence: "high" | "medium" | "indicative";
  source: string;
}

export interface BlueprintRecommendation {
  id: string;
  priority: "before-design-freeze" | "before-budget-approval" | "improvement";
  recommendation: string;
  rationale: string;
  relatedRuleIds: string[];
}

export interface BlueprintScenario {
  label: string;
  multiplier: number;
  monthlyTests: number;
  monthlyHandsOnHours: number;
  analystFte: number;
  totalTeamFte: number;
  estimatedAreaSqm: number;
  capexLowUsd: number;
  capexHighUsd: number;
  annualOpexLowUsd: number;
  annualOpexHighUsd: number;
}

export interface WorkforceRoleDemand {
  id: "routine-testing" | "monitoring-sampling" | "media-support" | "technical-review";
  role: string;
  monthlyHours: number;
  requiredFte: number;
  workflowIds: string[];
  confidence: "medium" | "indicative";
  basis: string;
}

export interface WorkforceCapacityScenario {
  label: string;
  productiveHoursPerFte: number;
  baseExecutionFte: number;
  resilienceReserveFte: number;
  executionFte: number;
  reviewerFte: number;
  totalTeamFte: number;
  roles: WorkforceRoleDemand[];
}

export interface WorkforceCapacityModel {
  current: WorkforceCapacityScenario;
  future: WorkforceCapacityScenario;
  skillCoverage: Array<{ id: string; skill: string; workflowIds: string[]; minimumQualifiedPeople: number; status: "site-confirmation-required"; rationale: string }>;
  excludedLoads: Array<{ id: string; load: string; status: "not-separately-quantified"; impact: string; evidenceNeeded: string }>;
  limitations: string[];
}

export interface ConsumableSupplyPlan {
  id: string;
  name: string;
  unit: string;
  netMonthlyDemand: number;
  grossMonthlyDemand: number;
  reorderPoint: number;
  safetyStock: number;
  targetStock: number;
  annualSpendLowUsd: number;
  annualSpendHighUsd: number;
  status: "concept-supply-basis";
  confirmationRequired: string[];
}

export interface ConsumableSupplyModel {
  parameters: { wastePercent: number; leadTimeDays: number; safetyStockDays: number; demandDaysPerMonth: number };
  current: ConsumableSupplyPlan[];
  future: ConsumableSupplyPlan[];
  limitations: string[];
}

export interface FinishedProductDemandReconciliation {
  source: "aggregate-input" | "portfolio-derived" | "reconciliation-required";
  aggregateMonthlyBatches: number;
  portfolioMonthlyBatches: number;
  portfolioInHouseBatches: number;
  portfolioOutsourcedBatches: number;
  effectiveInHouseBatches: number;
  differencePercent: number | null;
  message: string;
}

export type MethodRequirement = z.infer<typeof methodRequirementSchema>;
export type MethodBomItem = z.infer<typeof methodBomItemSchema>;

export interface MethodCapacitySummary {
  resourceId: "incubator-20-25" | "incubator-30-35" | "bsc" | "autoclave";
  resourceName: string;
  unit: "plate-days" | "hands-on-hours" | "media-liters";
  monthlyDemand: number;
  peakWeekDemand: number;
  availableMonthlyCapacity: number;
  utilizationPercent: number;
  basis: string;
  limitations: string;
}

const workflowDemandSchema = z.object({
  id: z.string(), ruleId: z.string(), label: z.string(), monthlyUnits: z.number(), monthlyHandsOnHours: z.number(), monthlyPlateDays: z.number(), monthlyMediaLiters: z.number(), turnaroundDays: z.number(), criticality: z.enum(["routine", "important", "critical"]), confidence: z.enum(["high", "medium", "indicative"]), evidenceIds: z.array(z.string()), basis: z.string(),
});
const equipmentRecommendationSchema = z.object({
  id: z.string(), name: z.string(), category: z.string(), quantityNow: z.number(), quantityFuture: z.number(), unitCapexLowUsd: z.number(), unitCapexHighUsd: z.number(), confidence: z.enum(["high", "medium", "indicative"]), rationale: z.string(), specification: z.string(), methodRequirementIds: z.array(z.string()).default([]), methodLoadBasis: z.array(z.string()).default([]), evidenceIds: z.array(z.string()).default([]),
});
const consumableForecastSchema = z.object({
  id: z.string(), name: z.string(), unit: z.string(), quantityPerMonthNow: z.number(), quantityPerMonthFuture: z.number(), unitCostLowUsd: z.number(), unitCostHighUsd: z.number(),
});
const spaceRecommendationSchema = z.object({ name: z.string(), areaSqm: z.number(), rationale: z.string() });
const blueprintRiskSchema = z.object({ id: z.string(), severity: z.enum(["high", "medium", "low"]), title: z.string(), description: z.string(), mitigation: z.string() });
const blueprintAssumptionSchema = z.object({ id: z.string(), label: z.string(), value: z.string(), confidence: z.enum(["high", "medium", "indicative"]), source: z.string() });
const blueprintRecommendationSchema = z.object({ id: z.string(), priority: z.enum(["before-design-freeze", "before-budget-approval", "improvement"]), recommendation: z.string(), rationale: z.string(), relatedRuleIds: z.array(z.string()) });
const blueprintScenarioSchema = z.object({ label: z.string(), multiplier: z.number(), monthlyTests: z.number(), monthlyHandsOnHours: z.number(), analystFte: z.number(), totalTeamFte: z.number(), estimatedAreaSqm: z.number(), capexLowUsd: z.number(), capexHighUsd: z.number(), annualOpexLowUsd: z.number(), annualOpexHighUsd: z.number() });
const workforceRoleDemandSchema = z.object({ id: z.enum(["routine-testing", "monitoring-sampling", "media-support", "technical-review"]), role: z.string(), monthlyHours: z.number(), requiredFte: z.number(), workflowIds: z.array(z.string()), confidence: z.enum(["medium", "indicative"]), basis: z.string() });
const workforceCapacityScenarioSchema = z.object({ label: z.string(), productiveHoursPerFte: z.number(), baseExecutionFte: z.number(), resilienceReserveFte: z.number(), executionFte: z.number(), reviewerFte: z.number(), totalTeamFte: z.number(), roles: z.array(workforceRoleDemandSchema) });
const workforceCapacityModelSchema = z.object({
  current: workforceCapacityScenarioSchema,
  future: workforceCapacityScenarioSchema,
  skillCoverage: z.array(z.object({ id: z.string(), skill: z.string(), workflowIds: z.array(z.string()), minimumQualifiedPeople: z.number().int().positive(), status: z.literal("site-confirmation-required"), rationale: z.string() })),
  excludedLoads: z.array(z.object({ id: z.string(), load: z.string(), status: z.literal("not-separately-quantified"), impact: z.string(), evidenceNeeded: z.string() })),
  limitations: z.array(z.string()),
});
const consumableSupplyPlanSchema = z.object({ id: z.string(), name: z.string(), unit: z.string(), netMonthlyDemand: z.number(), grossMonthlyDemand: z.number(), reorderPoint: z.number(), safetyStock: z.number(), targetStock: z.number(), annualSpendLowUsd: z.number(), annualSpendHighUsd: z.number(), status: z.literal("concept-supply-basis"), confirmationRequired: z.array(z.string()) });
const consumableSupplyModelSchema = z.object({ parameters: z.object({ wastePercent: z.number(), leadTimeDays: z.number(), safetyStockDays: z.number(), demandDaysPerMonth: z.number() }), current: z.array(consumableSupplyPlanSchema), future: z.array(consumableSupplyPlanSchema), limitations: z.array(z.string()) });
const methodCapacitySummarySchema = z.object({ resourceId: z.enum(["incubator-20-25", "incubator-30-35", "bsc", "autoclave"]), resourceName: z.string(), unit: z.enum(["plate-days", "hands-on-hours", "media-liters"]), monthlyDemand: z.number(), peakWeekDemand: z.number(), availableMonthlyCapacity: z.number(), utilizationPercent: z.number(), basis: z.string(), limitations: z.string() });
const finishedProductDemandReconciliationSchema = z.object({ source: z.enum(["aggregate-input", "portfolio-derived", "reconciliation-required"]), aggregateMonthlyBatches: z.number(), portfolioMonthlyBatches: z.number(), portfolioInHouseBatches: z.number(), portfolioOutsourcedBatches: z.number(), effectiveInHouseBatches: z.number(), differencePercent: z.number().nullable(), message: z.string() });

export const qualityLabBlueprintSchema = z.object({
  contractVersion: z.literal(QUALITY_LAB_BLUEPRINT_CONTRACT_VERSION),
  engineVersion: z.string(),
  compilerCoreVersion: z.literal(QUALITY_LAB_COMPILER_CORE_VERSION),
  generatedAt: z.string().datetime(),
  domainPack: z.object({ id: z.string(), version: z.string(), status: z.literal("concept"), scope: z.string() }),
  input: qualityLabInputSchema,
  workflows: z.array(workflowDemandSchema),
  methodRequirements: z.array(methodRequirementSchema),
  methodBom: z.array(methodBomItemSchema),
  methodCapacity: z.array(methodCapacityDemandSchema),
  methodCapacitySummary: z.array(methodCapacitySummarySchema),
  finishedProductDemand: finishedProductDemandReconciliationSchema,
  equipment: z.array(equipmentRecommendationSchema),
  consumables: z.array(consumableForecastSchema),
  spaces: z.array(spaceRecommendationSchema),
  risks: z.array(blueprintRiskSchema),
  assumptions: z.array(blueprintAssumptionSchema),
  recommendations: z.array(blueprintRecommendationSchema),
  procurementSequence: z.array(z.object({ phase: z.string(), timing: z.string(), items: z.array(z.string()) })),
  current: blueprintScenarioSchema,
  future: blueprintScenarioSchema,
  workforceCapacity: workforceCapacityModelSchema.optional(),
  consumableSupply: consumableSupplyModelSchema.optional(),
  evidence: z.array(evidenceRecordSchema),
  ruleTrace: z.array(ruleTraceSchema),
  unresolvedInputs: z.array(unresolvedInputSchema),
  dataQuality: dataQualitySummarySchema,
  review: blueprintReviewSchema,
  reviewStatus: z.literal("concept-only"),
});

export type QualityLabBlueprint = z.infer<typeof qualityLabBlueprintSchema>;

export interface QualityLabProject {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  input: QualityLabInput;
  blueprint: QualityLabBlueprint;
  reviewRequestedAt?: string;
}

export const defaultQualityLabInput: QualityLabInput = {
  contractVersion: QUALITY_LAB_INPUT_CONTRACT_VERSION,
  projectName: "Vietnam non-sterile QC expansion",
  companyName: "",
  country: "Vietnam",
  facilityType: "nonsterile-pharma",
  markets: ["vietnam"],
  finishedProducts: 40,
  rawMaterials: 80,
  finishedBatchesPerMonth: 30,
  rawMaterialLotsPerMonth: 45,
  waterPoints: 18,
  waterRoundsPerWeek: 2,
  emLocations: 24,
  emRoundsPerWeek: 1,
  sterilityBatchesPerMonth: 0,
  endotoxinSamplesPerMonth: 0,
  bioburdenSamplesPerMonth: 0,
  mediaLotsPerMonth: 8,
  scope: {
    rawMaterials: true,
    finishedProducts: true,
    water: true,
    environmentalMonitoring: true,
    sterility: false,
    endotoxin: false,
    bioburden: false,
    growthPromotion: true,
  },
  targetTurnaroundDays: 5,
  growthRatePercent: 70,
  horizonYears: 3,
  workingDaysPerMonth: 22,
  shifts: 1,
  productiveHoursPerShift: 6,
  outsourcePercent: 10,
  redundancyPercent: 20,
  equipmentDowntimePercent: 15,
  consumableWastePercent: 10,
  consumableLeadTimeDays: 45,
  consumableSafetyStockDays: 30,
  analystAnnualCostUsd: 18_000,
  portfolioIsComplete: false,
  productProfiles: [{
    id: "demo-nonsterile-solid", name: "Illustrative non-sterile solid oral product", dosageForm: "tablet-capsule", markets: ["vietnam"], monthlyBatches: 30, samplesPerBatch: 1,
    microbialLimitsRequired: true, specifiedOrganismsRequired: true, methodSuitability: "unknown", execution: "in-house", sampleQuantityGrams: 10, dilutionVolumeMl: 100, incubationProfile: "standard", preservativeOrNeutralizerNote: "",
    marketExecutionStrategy: "unknown",
  }],
};

function ceil(value: number, minimum = 0): number {
  return Math.max(minimum, Math.ceil(value - 1e-9));
}

function round(value: number, digits = 1): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function workflow(
  key: MicrobiologyWorkflowKey,
  units: number,
  insourceFactor: number,
  growthMultiplier = 1,
): WorkflowDemand {
  const rule = MICROBIOLOGY_WORKFLOW_RULES[key];
  const monthlyUnits = Math.max(0, units * insourceFactor * growthMultiplier);
  return {
    id: rule.id,
    ruleId: rule.ruleId,
    label: rule.label,
    monthlyUnits: round(monthlyUnits),
    monthlyHandsOnHours: round(monthlyUnits * rule.hours),
    monthlyPlateDays: round(monthlyUnits * rule.plateDays),
    monthlyMediaLiters: round(monthlyUnits * rule.media),
    turnaroundDays: rule.tat,
    criticality: rule.criticality,
    confidence: rule.confidence,
    evidenceIds: rule.evidenceIds,
    basis: `${rule.hours} hands-on h/unit; ${rule.plateDays} plate-days/unit; ${rule.media} L media/unit. Validate against site methods.`,
  };
}

function buildFinishedProductDemand(input: QualityLabInput): FinishedProductDemandReconciliation {
  const profiles = input.productProfiles.filter((product) => product.monthlyBatches > 0);
  const portfolioMonthlyBatches = sum(profiles, (product) => product.monthlyBatches);
  const portfolioInHouseBatches = sum(profiles.filter((product) => product.execution === "in-house"), (product) => product.monthlyBatches);
  const portfolioOutsourcedBatches = sum(profiles.filter((product) => product.execution === "outsource"), (product) => product.monthlyBatches);
  const allocationOpen = profiles.some((product) => product.markets.length > 1 && product.marketExecutionStrategy === "unknown");
  const differencePercent = input.finishedBatchesPerMonth === 0 ? (portfolioMonthlyBatches === 0 ? 0 : null) : round((portfolioMonthlyBatches - input.finishedBatchesPerMonth) / input.finishedBatchesPerMonth * 100);
  if (input.portfolioIsComplete && portfolioMonthlyBatches > 0 && !allocationOpen) return {
    source: "portfolio-derived", aggregateMonthlyBatches: input.finishedBatchesPerMonth, portfolioMonthlyBatches, portfolioInHouseBatches, portfolioOutsourcedBatches, effectiveInHouseBatches: portfolioInHouseBatches, differencePercent,
    message: "Finished-product workflow sizing uses the complete portfolio's in-house batch demand. Product-specific execution decisions override the global outsource percentage for this workflow.",
  };
  if (input.portfolioIsComplete) return {
    source: "reconciliation-required", aggregateMonthlyBatches: input.finishedBatchesPerMonth, portfolioMonthlyBatches, portfolioInHouseBatches, portfolioOutsourcedBatches, effectiveInHouseBatches: input.finishedBatchesPerMonth * (1 - input.outsourcePercent / 100), differencePercent,
    message: allocationOpen ? "Portfolio coverage is marked complete, but multi-market physical test allocation is unresolved; aggregate demand remains the temporary sizing basis." : "Portfolio coverage is marked complete, but it contains no positive batch demand; aggregate demand remains the temporary sizing basis.",
  };
  return {
    source: "aggregate-input", aggregateMonthlyBatches: input.finishedBatchesPerMonth, portfolioMonthlyBatches, portfolioInHouseBatches, portfolioOutsourcedBatches, effectiveInHouseBatches: input.finishedBatchesPerMonth * (1 - input.outsourcePercent / 100), differencePercent,
    message: portfolioMonthlyBatches > 0 ? "Aggregate demand remains the sizing basis because the portfolio is not yet confirmed as complete." : "Aggregate demand is the sizing basis; add and confirm a product portfolio to replace it.",
  };
}

function buildWorkflowDemand(input: QualityLabInput, multiplier = 1, finishedProductDemand = buildFinishedProductDemand(input)): WorkflowDemand[] {
  const insourceFactor = 1 - input.outsourcePercent / 100;
  const monthlyWaterSamples = input.waterPoints * input.waterRoundsPerWeek * 4.33;
  const monthlyEmSamples = input.emLocations * input.emRoundsPerWeek * 4.33;
  const values: [MicrobiologyWorkflowKey, boolean, number, number?][] = [
    ["rawMaterials", input.scope.rawMaterials, input.rawMaterialLotsPerMonth],
    ["finishedProducts", input.scope.finishedProducts, finishedProductDemand.source === "portfolio-derived" ? finishedProductDemand.portfolioInHouseBatches : input.finishedBatchesPerMonth, finishedProductDemand.source === "portfolio-derived" ? 1 : insourceFactor],
    ["water", input.scope.water, monthlyWaterSamples],
    ["environmentalMonitoring", input.scope.environmentalMonitoring, monthlyEmSamples],
    ["sterility", input.scope.sterility, input.sterilityBatchesPerMonth],
    ["endotoxin", input.scope.endotoxin, input.endotoxinSamplesPerMonth],
    ["bioburden", input.scope.bioburden, input.bioburdenSamplesPerMonth],
    ["growthPromotion", input.scope.growthPromotion, input.mediaLotsPerMonth],
  ];
  return values
    .filter(([, enabled, units]) => enabled && units > 0)
    .map(([key, , units, workflowInsourceFactor]) => workflow(key, units, workflowInsourceFactor ?? insourceFactor, multiplier));
}

function sum<T>(items: T[], get: (item: T) => number): number {
  return items.reduce((total, item) => total + get(item), 0);
}

function buildEquipment(
  input: QualityLabInput,
  now: WorkflowDemand[],
  future: WorkflowDemand[],
  methodCapacity: z.infer<typeof methodCapacityDemandSchema>[] = [],
  finishedProductDemand?: FinishedProductDemandReconciliation,
): EquipmentRecommendation[] {
  const uptime = Math.max(0.5, 1 - input.equipmentDowntimePercent / 100);
  const workingHoursPerMonth = input.workingDaysPerMonth * input.shifts * 6 * 0.75 * uptime;
  const units = (id: string, rows = now) => rows.find((row) => row.id === id)?.monthlyUnits ?? 0;
  const futureUnits = (id: string) => units(id, future);
  const plateDaysNow = sum(now, (row) => row.monthlyPlateDays);
  const plateDaysFuture = sum(future, (row) => row.monthlyPlateDays);
  const mediaNow = sum(now, (row) => row.monthlyMediaLiters);
  const mediaFuture = sum(future, (row) => row.monthlyMediaLiters);
  const manipHoursNow = sum(now, (row) => row.monthlyHandsOnHours) * 0.46;
  const manipHoursFuture = sum(future, (row) => row.monthlyHandsOnHours) * 0.46;
  const totalUnitsNow = sum(now, (row) => row.monthlyUnits);
  const totalUnitsFuture = sum(future, (row) => row.monthlyUnits);

  const equipment: Array<Omit<EquipmentRecommendation, "methodRequirementIds" | "methodLoadBasis" | "evidenceIds">> = [];
  const add = (item: Omit<EquipmentRecommendation, "methodRequirementIds" | "methodLoadBasis" | "evidenceIds">) => {
    if (item.quantityNow > 0 || item.quantityFuture > 0) equipment.push(item);
  };

  const incubatorQty = (plateDays: number) => plateDays > 0 ? ceil((plateDays / 2) / (300 * 30 * 0.7 * uptime), 1) : 0;
  add({
    id: "incubator-20-25", name: "Incubator 20–25 °C", category: "Incubation",
    quantityNow: incubatorQty(plateDaysNow), quantityFuture: incubatorQty(plateDaysFuture),
    unitCapexLowUsd: 7_000, unitCapexHighUsd: 18_000, confidence: "medium",
    rationale: "Sized from fungal/low-temperature plate-days with 70% planned utilization and downtime reserve.",
    specification: "Mapped chamber, continuous temperature monitoring, alarm, data export, qualified usable volume.",
  });
  add({
    id: "incubator-30-35", name: "Incubator 30–35 °C", category: "Incubation",
    quantityNow: incubatorQty(plateDaysNow), quantityFuture: incubatorQty(plateDaysFuture),
    unitCapexLowUsd: 7_000, unitCapexHighUsd: 18_000, confidence: "medium",
    rationale: "Sized from bacterial/high-temperature plate-days with 70% planned utilization and downtime reserve.",
    specification: "Mapped chamber, continuous temperature monitoring, alarm, data export, qualified usable volume.",
  });
  const autoclaveQty = (liters: number) => liters > 0 ? ceil(liters / (50 * input.workingDaysPerMonth * 0.7 * uptime), 1) : 0;
  add({
    id: "autoclave", name: "Steam sterilizer / autoclave", category: "Media & decontamination",
    quantityNow: autoclaveQty(mediaNow), quantityFuture: autoclaveQty(mediaFuture),
    unitCapexLowUsd: 25_000, unitCapexHighUsd: 90_000, confidence: "indicative",
    rationale: "Capacity model assumes one 50 L usable cycle per working day; waste and clean-side segregation may require separate units.",
    specification: "Validated cycles, load probes, audit-ready records, utility requirements, clean/dirty flow assessment.",
  });
  const bscQty = (hours: number) => hours > 0 ? ceil(hours / workingHoursPerMonth, 1) : 0;
  add({
    id: "bsc", name: "Class II biological safety cabinet", category: "Aseptic handling",
    quantityNow: bscQty(manipHoursNow), quantityFuture: bscQty(manipHoursFuture),
    unitCapexLowUsd: 9_000, unitCapexHighUsd: 22_000, confidence: "medium",
    rationale: "Sized from estimated manipulation hours and shift coverage; dedicated sterility/organism work can change segregation needs.",
    specification: "EN 12469/NSF-style performance, HEPA integrity access, ergonomic working width, qualification support.",
  });
  const manifoldQty = (rows: WorkflowDemand[]) => {
    const filtrationUnits = (rows.find((row) => row.id === "water-microbiology")?.monthlyUnits ?? 0)
      + (rows.find((row) => row.id === "bioburden")?.monthlyUnits ?? 0);
    return filtrationUnits > 0 ? ceil(filtrationUnits / (input.workingDaysPerMonth * input.shifts * 18 * uptime), 1) : 0;
  };
  add({
    id: "filtration-manifold", name: "Membrane filtration manifold", category: "Sample processing",
    quantityNow: manifoldQty(now), quantityFuture: manifoldQty(future),
    unitCapexLowUsd: 2_500, unitCapexHighUsd: 9_000, confidence: "medium",
    rationale: "Sized for water and bioburden filtration throughput with cleaning/setup allowance.",
    specification: "Closed or sanitizable manifold, compatible funnels, vacuum source, validated cleaning approach.",
  });
  const airSamplerQty = (locations: number) => locations > 0 ? ceil(locations / 15, 1) : 0;
  if (input.scope.environmentalMonitoring) add({
    id: "air-sampler", name: "Active microbial air sampler", category: "Environmental monitoring",
    quantityNow: airSamplerQty(input.emLocations), quantityFuture: airSamplerQty(input.emLocations),
    unitCapexLowUsd: 5_000, unitCapexHighUsd: 12_000, confidence: "medium",
    rationale: "One sampler per 15 locations in a sampling round; increase for simultaneous grade A/B coverage.",
    specification: "Validated flow, traceable calibration, disinfectable head, suitable sampling volume and data integrity.",
  });
  const counterQty = (samples: number) => samples > 0 ? ceil(samples / (input.workingDaysPerMonth * input.shifts * 60), 1) : 0;
  add({
    id: "colony-counter", name: "Colony counter", category: "Reading & review",
    quantityNow: counterQty(totalUnitsNow), quantityFuture: counterQty(totalUnitsFuture),
    unitCapexLowUsd: 1_200, unitCapexHighUsd: 15_000, confidence: "indicative",
    rationale: "Throughput threshold supports manual/semi-automated counting; high volume may justify automated imaging.",
    specification: "Audit trail/data export if automated, plate-size compatibility, verification standard.",
  });
  const betQty = (samples: number) => samples > 0 ? ceil(samples / (input.workingDaysPerMonth * input.shifts * 24 * uptime), 1) : 0;
  if (input.scope.endotoxin) add({
    id: "bet-reader", name: "Endotoxin reader / platform", category: "Endotoxin",
    quantityNow: betQty(units("bacterial-endotoxin")), quantityFuture: betQty(futureUnits("bacterial-endotoxin")),
    unitCapexLowUsd: 8_000, unitCapexHighUsd: 35_000, confidence: "indicative",
    rationale: "Throughput estimate assumes batched testing; platform selection depends on method and matrix interference.",
    specification: "Method-compatible reader, 21 CFR Part 11 assessment, validated software, temperature control.",
  });
  const sterilityQty = (batches: number) => batches > 0 ? ceil(batches / (input.workingDaysPerMonth * input.shifts * 1.5 * uptime), 1) : 0;
  if (input.scope.sterility) add({
    id: "sterility-isolator", name: "Sterility-test isolator", category: "Sterility",
    quantityNow: sterilityQty(units("sterility-testing")), quantityFuture: sterilityQty(futureUnits("sterility-testing")),
    unitCapexLowUsd: 180_000, unitCapexHighUsd: 550_000, confidence: "indicative",
    rationale: "Concept capacity only; cycle duration, batch grouping, decontamination and product presentation drive final sizing.",
    specification: "Validated bio-decontamination, leak testing, glove integrity, transfer strategy, EM integration.",
  });
  add({
    id: "refrigerator", name: "Laboratory refrigerator", category: "Storage",
    quantityNow: totalUnitsNow > 0 ? ceil(totalUnitsNow / 450, 1) : 0,
    quantityFuture: totalUnitsFuture > 0 ? ceil(totalUnitsFuture / 450, 1) : 0,
    unitCapexLowUsd: 3_000, unitCapexHighUsd: 9_000, confidence: "medium",
    rationale: "Allowance for prepared media, reagents and short-term sample storage; retain storage excluded.",
    specification: "Mapped usable volume, continuous monitoring, alarm, access control and backup response.",
  });
  if (mediaNow > 0) add({
    id: "media-preparator", name: "Media preparator", category: "Media & decontamination",
    quantityNow: mediaNow >= 220 ? 1 : 0,
    quantityFuture: mediaFuture >= 220 ? ceil(mediaFuture / 600, 1) : 0,
    unitCapexLowUsd: 35_000, unitCapexHighUsd: 95_000, confidence: "indicative",
    rationale: "Recommended when recurring prepared-media volume makes manual preparation a capacity or consistency constraint.",
    specification: "Controlled heating/cooling, recipe control, electronic batch record assessment, clean transfer strategy.",
  });

  return equipment.map((item) => {
    const methodLoads = methodCapacity.filter((load) => load.resourceId === item.id);
    const methodRequirementIds = Array.from(new Set(methodLoads.map((load) => load.methodRequirementId)));
    const evidenceIds = Array.from(new Set(methodLoads.flatMap((load) => load.evidenceIds)));
    const methodLoadBasis = methodLoads.map((load) => `${load.productName}: ${round(load.monthlyDemand)} ${load.unit}/month`).filter((value, index, values) => values.indexOf(value) === index);
    if (item.id === "incubator-20-25" || item.id === "incubator-30-35" || item.id === "bsc" || item.id === "autoclave") {
      methodLoadBasis.push(finishedProductDemand?.source === "portfolio-derived" ? "Finished-product sizing source: complete portfolio" : "Finished-product sizing source: aggregate demand");
    }
    return { ...item, methodRequirementIds, methodLoadBasis, evidenceIds };
  });
}

function buildConsumables(now: WorkflowDemand[], future: WorkflowDemand[]): ConsumableForecast[] {
  const units = (id: string, rows: WorkflowDemand[]) => rows.find((row) => row.id === id)?.monthlyUnits ?? 0;
  const mediaNow = sum(now, (row) => row.monthlyMediaLiters);
  const mediaFuture = sum(future, (row) => row.monthlyMediaLiters);
  const plateNow = sum(now, (row) => row.monthlyPlateDays) / 5;
  const plateFuture = sum(future, (row) => row.monthlyPlateDays) / 5;
  const waterNow = units("water-microbiology", now);
  const waterFuture = units("water-microbiology", future);
  const bioNow = units("bioburden", now);
  const bioFuture = units("bioburden", future);
  const emNow = units("environmental-monitoring", now);
  const emFuture = units("environmental-monitoring", future);
  const sterilityNow = units("sterility-testing", now);
  const sterilityFuture = units("sterility-testing", future);
  const betNow = units("bacterial-endotoxin", now);
  const betFuture = units("bacterial-endotoxin", future);
  return [
    { id: "prepared-media", name: "Prepared media equivalent", unit: "L", quantityPerMonthNow: round(mediaNow), quantityPerMonthFuture: round(mediaFuture), unitCostLowUsd: 18, unitCostHighUsd: 45 },
    { id: "plates", name: "Petri/contact plates", unit: "plates", quantityPerMonthNow: ceil(plateNow), quantityPerMonthFuture: ceil(plateFuture), unitCostLowUsd: 0.45, unitCostHighUsd: 1.5 },
    { id: "membranes", name: "Membrane filters & funnels", unit: "tests", quantityPerMonthNow: ceil(waterNow + bioNow), quantityPerMonthFuture: ceil(waterFuture + bioFuture), unitCostLowUsd: 2.5, unitCostHighUsd: 8 },
    { id: "em-consumables", name: "EM plates, swabs & accessories", unit: "locations", quantityPerMonthNow: ceil(emNow), quantityPerMonthFuture: ceil(emFuture), unitCostLowUsd: 1.2, unitCostHighUsd: 4.5 },
    { id: "bet-tests", name: "Endotoxin test capacity", unit: "sample equivalents", quantityPerMonthNow: ceil(betNow * 1.2), quantityPerMonthFuture: ceil(betFuture * 1.2), unitCostLowUsd: 10, unitCostHighUsd: 35 },
    { id: "sterility-canisters", name: "Sterility testing canisters", unit: "canisters", quantityPerMonthNow: ceil(sterilityNow * 2), quantityPerMonthFuture: ceil(sterilityFuture * 2), unitCostLowUsd: 35, unitCostHighUsd: 110 },
  ].filter((item) => item.quantityPerMonthNow > 0 || item.quantityPerMonthFuture > 0);
}

function buildConsumableSupply(input: QualityLabInput, consumables: ConsumableForecast[]): ConsumableSupplyModel {
  const demandDaysPerMonth = 30.4;
  const plan = (item: ConsumableForecast, future: boolean): ConsumableSupplyPlan => {
    const netMonthlyDemand = future ? item.quantityPerMonthFuture : item.quantityPerMonthNow;
    const grossMonthlyDemand = round(netMonthlyDemand * (1 + input.consumableWastePercent / 100), 1);
    const dailyDemand = grossMonthlyDemand / demandDaysPerMonth;
    const reorderPoint = ceil(dailyDemand * input.consumableLeadTimeDays);
    const safetyStock = ceil(dailyDemand * input.consumableSafetyStockDays);
    return {
      id: item.id,
      name: item.name,
      unit: item.unit,
      netMonthlyDemand,
      grossMonthlyDemand,
      reorderPoint,
      safetyStock,
      targetStock: reorderPoint + safetyStock,
      annualSpendLowUsd: ceil(grossMonthlyDemand * 12 * item.unitCostLowUsd),
      annualSpendHighUsd: ceil(grossMonthlyDemand * 12 * item.unitCostHighUsd),
      status: "concept-supply-basis",
      confirmationRequired: ["Approved item/specification and pack size", "Qualified supplier and observed replenishment lead time", "Shelf life, storage condition and expiry-at-receipt requirement", "Minimum order quantity, release/receipt testing and alternate-source status"],
    };
  };
  return {
    parameters: { wastePercent: input.consumableWastePercent, leadTimeDays: input.consumableLeadTimeDays, safetyStockDays: input.consumableSafetyStockDays, demandDaysPerMonth },
    current: consumables.map((item) => plan(item, false)),
    future: consumables.map((item) => plan(item, true)),
    limitations: [
      "Reorder point uses average gross daily demand and does not simulate batch arrivals, seasonality or supplier variability.",
      "Safety stock is expressed as demand days; it is not statistically calibrated to service level or lead-time variance.",
      "Target stock is not an order quantity and does not account for pack rounding, minimum order quantity or storage capacity.",
      "No item is approved for purchase until specification, supplier, shelf life, storage, receipt controls and alternate-source strategy are confirmed.",
    ],
  };
}

function buildMethodCapacitySummary(input: QualityLabInput, equipment: EquipmentRecommendation[], capacity: z.infer<typeof methodCapacityDemandSchema>[]): MethodCapacitySummary[] {
  const uptime = Math.max(0.5, 1 - input.equipmentDowntimePercent / 100);
  const quantity = (id: MethodCapacitySummary["resourceId"]) => equipment.find((item) => item.id === id)?.quantityNow ?? 0;
  const capacities: Record<MethodCapacitySummary["resourceId"], number> = {
    "incubator-20-25": quantity("incubator-20-25") * 300 * 30 * 0.7 * uptime,
    "incubator-30-35": quantity("incubator-30-35") * 300 * 30 * 0.7 * uptime,
    bsc: quantity("bsc") * input.workingDaysPerMonth * input.shifts * input.productiveHoursPerShift * 0.75 * uptime,
    autoclave: quantity("autoclave") * 50 * input.workingDaysPerMonth * 0.7 * uptime,
  };
  const resourceNames: Record<MethodCapacitySummary["resourceId"], string> = {
    "incubator-20-25": "Incubator 20–25 °C", "incubator-30-35": "Incubator 30–35 °C", bsc: "Class II biological safety cabinet", autoclave: "Steam sterilizer / autoclave",
  };
  const units: Record<MethodCapacitySummary["resourceId"], MethodCapacitySummary["unit"]> = {
    "incubator-20-25": "plate-days", "incubator-30-35": "plate-days", bsc: "hands-on-hours", autoclave: "media-liters",
  };
  return (["incubator-20-25", "incubator-30-35", "bsc", "autoclave"] as const).map((resourceId) => {
    const rows = capacity.filter((item) => item.resourceId === resourceId);
    const monthlyDemand = round(sum(rows, (item) => item.monthlyDemand));
    const peakWeekDemand = round(monthlyDemand / 4.33 * 1.3);
    const availableMonthlyCapacity = round(capacities[resourceId]);
    return {
      resourceId, resourceName: resourceNames[resourceId], unit: units[resourceId], monthlyDemand, peakWeekDemand, availableMonthlyCapacity,
      utilizationPercent: availableMonthlyCapacity > 0 ? round(monthlyDemand * 1.3 / availableMonthlyCapacity * 100) : (monthlyDemand > 0 ? 100 : 0),
      basis: "Method-derived demand with a 1.3× peak-week planning factor; available capacity uses the current concept equipment plan and uptime allowance.",
      limitations: "This is a resource-load check, not a schedule simulation. It excludes non-profiled products, EM/water queues, investigations, actual rack geometry, changeovers, media batch scheduling and concurrent work.",
    };
  }).filter((item) => item.monthlyDemand > 0);
}

function buildSpaces(input: QualityLabInput, equipment: EquipmentRecommendation[], demand: WorkflowDemand[], future = false): SpaceRecommendation[] {
  const qty = (id: string) => {
    const item = equipment.find((candidate) => candidate.id === id);
    return future ? item?.quantityFuture ?? 0 : item?.quantityNow ?? 0;
  };
  const monthlyUnits = sum(demand, (row) => row.monthlyUnits);
  const rows: SpaceRecommendation[] = [
    { name: "Sample receipt & staging", areaSqm: round(10 + Math.min(20, monthlyUnits / 80)), rationale: "Controlled receipt, logging, segregation and short-term staging." },
    { name: "Media preparation", areaSqm: round(14 + qty("media-preparator") * 8), rationale: "Weighing, dissolution, dispensing and controlled material flow." },
    { name: "Wash & decontamination", areaSqm: round(14 + qty("autoclave") * 7), rationale: "Dirty-side handling, autoclave access, cooling and waste flow." },
    { name: "General microbiology testing", areaSqm: round(22 + qty("bsc") * 8 + qty("filtration-manifold") * 4), rationale: "Aseptic manipulations, filtration, bench work and documentation." },
    { name: "Incubation", areaSqm: round(8 + (qty("incubator-20-25") + qty("incubator-30-35")) * 5), rationale: "Incubator access, heat rejection, monitoring and sample movement." },
    { name: "Cold & controlled storage", areaSqm: round(8 + qty("refrigerator") * 4), rationale: "Media, reagents, cultures, standards and controlled access." },
  ];
  if (input.scope.environmentalMonitoring) rows.push({ name: "EM equipment staging", areaSqm: 8, rationale: "Sampler charging, disinfection, plate issue and return reconciliation." });
  if (input.scope.sterility) rows.push({ name: "Sterility testing suite", areaSqm: round(35 + qty("sterility-isolator") * 20), rationale: "Isolator, transfers, staging, EM and decontamination flow; engineering study required." });
  const net = sum(rows, (row) => row.areaSqm);
  rows.push({ name: "Circulation, gowning & support allowance", areaSqm: round(net * 0.35), rationale: "Concept allowance only; zoning, personnel/material flows and HVAC are not designed here." });
  return rows;
}

function equipmentCapex(equipment: EquipmentRecommendation[], future: boolean, high: boolean): number {
  return sum(equipment, (item) => {
    const quantity = future ? item.quantityFuture : item.quantityNow;
    return quantity * (high ? item.unitCapexHighUsd : item.unitCapexLowUsd);
  });
}

function consumableOpex(consumables: ConsumableForecast[], future: boolean, high: boolean, wastePercent: number): number {
  return sum(consumables, (item) => {
    const quantity = future ? item.quantityPerMonthFuture : item.quantityPerMonthNow;
    return quantity * (1 + wastePercent / 100) * 12 * (high ? item.unitCostHighUsd : item.unitCostLowUsd);
  });
}

function scenario(
  label: string,
  multiplier: number,
  input: QualityLabInput,
  workflows: WorkflowDemand[],
  equipment: EquipmentRecommendation[],
  consumables: ConsumableForecast[],
  spaces: SpaceRecommendation[],
  future: boolean,
): BlueprintScenario {
  const hours = sum(workflows, (row) => row.monthlyHandsOnHours);
  const productiveHoursPerFte = input.workingDaysPerMonth * input.productiveHoursPerShift;
  const analystFte = hours > 0 ? ceil((hours * (1 + input.redundancyPercent / 100)) / productiveHoursPerFte, 2) : 0;
  const reviewerFte = analystFte > 0 ? Math.max(1, ceil(analystFte / 8)) : 0;
  const totalTeamFte = analystFte + reviewerFte;
  const capexLow = equipmentCapex(equipment, future, false);
  const capexHigh = equipmentCapex(equipment, future, true);
  const staffLow = totalTeamFte * input.analystAnnualCostUsd;
  const staffHigh = totalTeamFte * input.analystAnnualCostUsd * 1.25;
  const annualMaintenanceLow = capexLow * 0.06;
  const annualMaintenanceHigh = capexHigh * 0.12;
  return {
    label,
    multiplier: round(multiplier, 2),
    monthlyTests: ceil(sum(workflows, (row) => row.monthlyUnits)),
    monthlyHandsOnHours: ceil(hours),
    analystFte,
    totalTeamFte,
    estimatedAreaSqm: ceil(sum(spaces, (row) => row.areaSqm)),
    capexLowUsd: ceil(capexLow),
    capexHighUsd: ceil(capexHigh),
    annualOpexLowUsd: ceil(staffLow + consumableOpex(consumables, future, false, input.consumableWastePercent) + annualMaintenanceLow),
    annualOpexHighUsd: ceil(staffHigh + consumableOpex(consumables, future, true, input.consumableWastePercent) + annualMaintenanceHigh),
  };
}

function buildWorkforceScenario(label: string, input: QualityLabInput, workflows: WorkflowDemand[], summary: BlueprintScenario): WorkforceCapacityScenario {
  const productiveHoursPerFte = input.workingDaysPerMonth * input.productiveHoursPerShift;
  const monitoringIds = new Set(["water-microbiology", "environmental-monitoring"]);
  const mediaIds = new Set(["growth-promotion"]);
  const role = (id: WorkforceRoleDemand["id"], roleName: string, rows: WorkflowDemand[], confidence: WorkforceRoleDemand["confidence"], basis: string): WorkforceRoleDemand => {
    const monthlyHours = round(sum(rows, (row) => row.monthlyHandsOnHours));
    return { id, role: roleName, monthlyHours, requiredFte: monthlyHours > 0 ? round(monthlyHours / productiveHoursPerFte, 2) : 0, workflowIds: rows.map((row) => row.id), confidence, basis };
  };
  const monitoring = workflows.filter((row) => monitoringIds.has(row.id));
  const media = workflows.filter((row) => mediaIds.has(row.id));
  const routine = workflows.filter((row) => !monitoringIds.has(row.id) && !mediaIds.has(row.id));
  const reviewerFte = round(summary.totalTeamFte - summary.analystFte, 2);
  const roles = [
    role("routine-testing", "Routine laboratory execution", routine, "indicative", "Workflow hands-on benchmarks divided by productive analyst hours."),
    role("monitoring-sampling", "Monitoring and sampling", monitoring, "indicative", "Water and environmental-monitoring hands-on benchmarks; travel and route constraints require a site study."),
    role("media-support", "Media preparation and growth-promotion support", media, "indicative", "Growth-promotion workflow hours only; shared media preparation work may be embedded in other workflow benchmarks."),
    { id: "technical-review" as const, role: "Technical review and release support", monthlyHours: 0, requiredFte: reviewerFte, workflowIds: workflows.map((row) => row.id), confidence: "indicative" as const, basis: "Concept ratio of one reviewer FTE per eight execution FTE; review minutes and queue timing are not yet observed." },
  ].filter((item) => item.requiredFte > 0 || item.monthlyHours > 0);
  const baseExecutionFte = summary.monthlyHandsOnHours > 0 ? round(summary.monthlyHandsOnHours / productiveHoursPerFte, 2) : 0;
  return {
    label,
    productiveHoursPerFte,
    baseExecutionFte,
    resilienceReserveFte: round(Math.max(0, summary.analystFte - baseExecutionFte), 2),
    executionFte: summary.analystFte,
    reviewerFte,
    totalTeamFte: summary.totalTeamFte,
    roles,
  };
}

function buildWorkforceCapacity(input: QualityLabInput, currentWorkflows: WorkflowDemand[], futureWorkflows: WorkflowDemand[], current: BlueprintScenario, future: BlueprintScenario): WorkforceCapacityModel {
  const selected = currentWorkflows.filter((row) => row.monthlyHandsOnHours > 0);
  return {
    current: buildWorkforceScenario("Current demand", input, currentWorkflows, current),
    future: buildWorkforceScenario(`Year ${input.horizonYears}`, input, futureWorkflows, future),
    skillCoverage: selected.map((row) => ({
      id: `skill-${row.id}`,
      skill: row.label,
      workflowIds: [row.id],
      minimumQualifiedPeople: row.criticality === "critical" ? 2 : 1,
      status: "site-confirmation-required" as const,
      rationale: row.criticality === "critical" ? "Two-person coverage is a continuity planning floor, not proof of site qualification or simultaneous shift coverage." : "At least one qualified owner is required; leave, shifts and succession may require additional coverage.",
    })),
    excludedLoads: [
      { id: "investigations", load: "Deviations, OOS/OOT and contamination investigations", status: "not-separately-quantified", impact: "Can consume analysts, technical reviewers and equipment unpredictably, especially during adverse trends.", evidenceNeeded: "Twelve to twenty-four months of event counts and hours by role." },
      { id: "training-qualification", load: "Training, qualification and requalification", status: "not-separately-quantified", impact: "Reduces productive hours and constrains how quickly new or cross-trained staff become deployable.", evidenceNeeded: "Curricula, qualification duration, recurrence and observed trainer/trainee hours." },
      { id: "method-lifecycle", load: "Method transfer, verification, validation and change control", status: "not-separately-quantified", impact: "Creates specialist and reviewer demand that does not scale directly with routine sample volume.", evidenceNeeded: "Approved project pipeline, protocol effort and historical lifecycle hours." },
      { id: "absence-shift", load: "Leave, absence, handover and off-shift coverage", status: "not-separately-quantified", impact: "A percentage reserve does not prove named-skill availability on every required shift.", evidenceNeeded: "Shift roster, leave history, on-call model and minimum coverage rules." },
    ],
    limitations: [
      "Role hours partition workflow benchmarks; they are not observed time-study results.",
      "Reviewer capacity uses a planning ratio because review minutes, arrival patterns and release queues are not supplied.",
      "Skill coverage states a minimum continuity floor and does not assert that any named person is trained or qualified.",
      "Aggregate FTE cannot prove daily schedule feasibility, peak coverage or turnaround performance.",
    ],
  };
}

function buildRisks(input: QualityLabInput, current: BlueprintScenario, future: BlueprintScenario): BlueprintRisk[] {
  const risks: BlueprintRisk[] = [];
  if (input.targetTurnaroundDays < 5 && (input.scope.rawMaterials || input.scope.finishedProducts || input.scope.water || input.scope.environmentalMonitoring)) {
    risks.push({ id: "tat-incubation", severity: "high", title: "Release target is shorter than conventional incubation", description: `${input.targetTurnaroundDays}-day target conflicts with one or more conventional microbiology workflows.`, mitigation: "Separate sampling/logistics time from incubation time; evaluate validated rapid methods only where a business case and method suitability exist." });
  }
  if ((input.facilityType === "sterile-pharma" || input.facilityType === "biologics") && !input.scope.environmentalMonitoring) {
    risks.push({ id: "missing-em", severity: "high", title: "Environmental monitoring is outside scope", description: "A sterile/biologics quality-lab concept without EM is likely incomplete.", mitigation: "Confirm whether EM is handled by another team/site; otherwise add locations, frequencies, incubation and trending workload." });
  }
  if (input.facilityType === "sterile-pharma" && !input.scope.sterility) {
    risks.push({ id: "missing-sterility", severity: "high", title: "Sterility testing is outside scope", description: "Sterile-product release may rely on an external laboratory or a missing capability.", mitigation: "Document outsource strategy, sample logistics, method transfer, turnaround, data review and business-continuity controls." });
  }
  if (input.outsourcePercent >= 30) {
    risks.push({ id: "outsourcing", severity: "medium", title: "High outsourced testing dependency", description: `${input.outsourcePercent}% of modeled workload is outsourced.`, mitigation: "Qualify at least one backup laboratory and model transport, queue, investigation and data-review lead times." });
  }
  if (input.growthRatePercent >= 50) {
    risks.push({ id: "growth", severity: "medium", title: "High growth scenario", description: `Demand grows ${input.growthRatePercent}% over ${input.horizonYears} years; step changes can occur before the horizon.`, mitigation: "Use modular rooms/utilities and phase procurement against trigger volumes, not only the final-year forecast." });
  }
  if (future.analystFte > current.analystFte * 1.5) {
    risks.push({ id: "staff-ramp", severity: "medium", title: "Significant analyst ramp-up", description: `Modeled analyst demand rises from ${current.analystFte} to ${future.analystFte} FTE.`, mitigation: "Create a hiring, training, qualification and cross-training plan ahead of equipment commissioning." });
  }
  if (input.equipmentDowntimePercent < 10) {
    risks.push({ id: "downtime", severity: "low", title: "Aggressive equipment availability assumption", description: "Less than 10% downtime may understate qualification, calibration, maintenance and breakdown impact.", mitigation: "Compare with site maintenance history and include critical-equipment redundancy or external backup." });
  }
  if (input.markets.some((market) => market === "eu" || market === "us")) {
    risks.push({ id: "market-validation", severity: "medium", title: "Multi-market regulatory mapping required", description: "EU/US supply adds compendial, data-integrity and inspection expectations beyond a generic concept model.", mitigation: "Create a product-by-market test matrix and approve all compendial equivalence/reduced-testing decisions through site quality governance." });
  }
  if (risks.length === 0) {
    risks.push({ id: "concept-review", severity: "low", title: "Concept model requires site verification", description: "No rule-based red flags were triggered, but method detail and actual sample mix remain unverified.", mitigation: "Run an SME workshop and reconcile the blueprint against approved specifications, methods and production forecasts." });
  }
  return risks;
}

function buildAssumptions(input: QualityLabInput, multiplier: number): BlueprintAssumption[] {
  return [
    { id: "work-month", label: "Operating calendar", value: `${input.workingDaysPerMonth} working days/month; ${input.shifts} shift(s); ${input.productiveHoursPerShift} productive h/analyst-day`, confidence: "high", source: "User input" },
    { id: "insource", label: "In-house share", value: `${100 - input.outsourcePercent}% in-house / ${input.outsourcePercent}% outsourced`, confidence: "high", source: "User input" },
    { id: "growth", label: "Future demand multiplier", value: `${multiplier.toFixed(2)}× over ${input.horizonYears} year(s)`, confidence: "medium", source: "User growth assumption applied uniformly" },
    { id: "redundancy", label: "People capacity reserve", value: `${input.redundancyPercent}% above modeled hands-on demand`, confidence: "medium", source: "User input; review against leave, training and investigation history" },
    { id: "downtime", label: "Equipment downtime", value: `${input.equipmentDowntimePercent}%`, confidence: "medium", source: "User input; includes qualification, calibration and maintenance allowance" },
    { id: "consumable-supply", label: "Consumable supply basis", value: `${input.consumableWastePercent}% waste; ${input.consumableLeadTimeDays}-day lead time; ${input.consumableSafetyStockDays} safety-stock days`, confidence: "indicative", source: "User planning inputs; replace by item and qualified supplier" },
    { id: "workflow-times", label: "Workflow standard times", value: "Atlas Microbiology v1 benchmark set", confidence: "indicative", source: "Concept benchmark; replace with time study and approved methods" },
    { id: "costs", label: "CAPEX and consumable costs", value: "Indicative 2026 USD bands, vendor-neutral", confidence: "indicative", source: "Planning allowance only; obtain local budgetary quotes" },
    { id: "regulatory", label: "Regulatory basis", value: "USP/Ph. Eur.-style conventional microbiology and GMP laboratory controls", confidence: "medium", source: "Verify current applicable monographs, registrations, SOPs and local regulations" },
  ];
}

function buildRecommendations(input: QualityLabInput, equipment: EquipmentRecommendation[], future: BlueprintScenario): BlueprintRecommendation[] {
  const recommendations: BlueprintRecommendation[] = [
    { id: "product-test-matrix", priority: "before-design-freeze", recommendation: "Create and approve a product × market × test matrix before fixing the equipment list.", rationale: "The concept compiler models aggregate demand, not registered specifications or product-specific methods.", relatedRuleIds: ["micro.workflow.finished-products", "micro.workflow.raw-materials"] },
    { id: "workflow-time-study", priority: "before-design-freeze", recommendation: "Validate workflow standard times with a site time study covering preparation, execution, incubation handling, reading, review and investigations.", rationale: "Hands-on benchmarks are the main driver of staffing and several equipment allowances.", relatedRuleIds: ["core.capacity.people", ...Object.values(MICROBIOLOGY_WORKFLOW_RULES).map((rule) => rule.ruleId)] },
    { id: "vendor-neutral-budget", priority: "before-budget-approval", recommendation: "Treat every cost as a planning range and issue reviewed vendor-neutral requirements before requesting quotations.", rationale: "Concept bands exclude site, vendor, installation, validation, tax, freight, service and commercial-term effects.", relatedRuleIds: ["core.cost.concept", "core.capacity.equipment"] },
    { id: "qualified-engineering", priority: "before-design-freeze", recommendation: "Approve zoning, HVAC, utilities and personnel/material flows through qualified laboratory engineering review.", rationale: "Atlas provides a capability and space basis, not architectural or engineering design.", relatedRuleIds: ["core.space.concept", "core.capacity.equipment"] },
    { id: "consumable-supply-basis", priority: "before-budget-approval", recommendation: "Convert class-level consumable allowances into an approved item × supplier × pack-size × shelf-life supply plan.", rationale: "Average demand and generic lead-time assumptions cannot establish purchase quantities, storage capacity or continuity for critical media and reagents.", relatedRuleIds: ["core.supply.consumables"] },
  ];
  if (input.outsourcePercent > 0) recommendations.push({ id: "outsource-strategy", priority: "before-design-freeze", recommendation: "Document the insource/outsource decision per test, including sample stability, transport, queue time, data ownership and backup capacity.", rationale: "A global outsource percentage cannot represent method-specific operational and continuity risk.", relatedRuleIds: ["core.capacity.people", ...Object.values(MICROBIOLOGY_WORKFLOW_RULES).map((rule) => rule.ruleId)] });
  if (equipment.some((item) => item.quantityFuture > item.quantityNow)) recommendations.push({ id: "future-capacity-triggers", priority: "before-budget-approval", recommendation: "Reserve utilities and floor space for future equipment now; release purchases against approved demand triggers.", rationale: "The future scenario requires additional equipment classes or quantities, but demand growth may not be linear.", relatedRuleIds: ["core.capacity.equipment", "core.space.concept"] });
  if (future.analystFte >= 6) recommendations.push({ id: "role-separation", priority: "improvement", recommendation: "Separate routine execution, media/EM support and technical review responsibilities.", rationale: "At the modeled team size, reviewer and specialist capacity can become a bottleneck hidden by aggregate FTE.", relatedRuleIds: ["core.capacity.people"] });
  return recommendations;
}

function buildUnresolvedInputs(input: QualityLabInput, workflows: WorkflowDemand[]): UnresolvedInput[] {
  const unresolved: UnresolvedInput[] = [
    { id: "product-market-test-matrix", category: "portfolio", severity: "blocking", question: "Which approved tests, methods and frequencies apply to each product, material and target market?", impact: "The capability scope and equipment list may be incomplete or overstated without the authoritative test portfolio.", resolution: "Provide an approved product/material × market × specification × method matrix.", relatedRuleIds: workflows.map((row) => row.ruleId) },
    { id: "approved-method-detail", category: "method", severity: "blocking", question: "What are the current approved method steps, sample counts, replicates, controls, incubation conditions and review requirements?", impact: "Hands-on time, media, plates, equipment loading and turnaround are concept allowances only.", resolution: "Reconcile every selected workflow against current approved methods and SOPs during SME review.", relatedRuleIds: workflows.map((row) => row.ruleId) },
    { id: "site-time-study", category: "workload", severity: "important", question: "What are the observed preparation, execution, handling, reading, review and investigation times by method?", impact: "Staffing and utilization estimates may differ materially from actual site performance.", resolution: "Complete a representative time study and replace Domain Pack benchmarks.", relatedRuleIds: ["core.capacity.people", ...workflows.map((row) => row.ruleId)] },
    { id: "skill-shift-coverage", category: "workload", severity: "important", question: "Which qualified analysts, reviewers and specialists cover each required method on every operating shift?", impact: "Aggregate FTE can appear sufficient while a critical method, reviewer or investigation capability has no deployable coverage.", resolution: "Provide the approved qualification matrix, shift roster, leave assumptions, reviewer authorization and cross-training plan.", relatedRuleIds: ["core.capacity.people", ...workflows.map((row) => row.ruleId)] },
    { id: "equipment-cycle-data", category: "equipment", severity: "important", question: "What usable capacity, cycle duration, load pattern, downtime and redundancy standard applies to each critical equipment class?", impact: "Final quantities and utility requirements cannot be approved from class-level throughput assumptions.", resolution: "Obtain reviewed URS inputs and vendor budget data for shortlisted equipment classes.", relatedRuleIds: ["core.capacity.equipment"] },
    { id: "facility-engineering-basis", category: "facility", severity: "blocking", question: "What zoning, biosafety, HVAC, utility, flow, building-code and site constraints govern the laboratory?", impact: "The reported area is an allowance and cannot be used as an architectural design.", resolution: "Complete a qualified engineering basis-of-design review using the approved capability model.", relatedRuleIds: ["core.space.concept", "core.capacity.equipment"] },
    { id: "local-cost-basis", category: "cost", severity: "important", question: "What local installed costs, service terms, staffing structure, taxes, freight, validation and inflation assumptions apply?", impact: "CAPEX and OPEX bands are not suitable for budget approval.", resolution: "Replace concept bands with dated local quotations and an approved cost basis.", relatedRuleIds: ["core.cost.concept"] },
    { id: "consumable-supply-evidence", category: "cost", severity: "important", question: "Which approved consumable items, pack sizes, qualified suppliers, lead times, shelf lives, storage conditions and alternate sources support each method?", impact: "The supply plan may overstate usable stock, miss expiry risk or fail during supplier disruption despite adequate average inventory.", resolution: "Provide the approved item master, supplier/quality status, purchasing history, expiry-at-receipt rules and storage constraints.", relatedRuleIds: ["core.supply.consumables"] },
    { id: "quality-governance", category: "governance", severity: "blocking", question: "Who owns QC, QA, engineering, EHS and procurement review, and what constitutes approval outside Atlas?", impact: "No Blueprint output can move from concept to controlled use without accountable reviewers and site governance.", resolution: "Name required reviewers, decision rights, document controls and approval records.", relatedRuleIds: ["core.capacity.people", "core.capacity.equipment", "core.space.concept", "core.cost.concept"] },
  ];
  if (!input.companyName.trim()) unresolved.push({ id: "site-identity", category: "governance", severity: "advisory", question: "Which legal entity and site owns this project?", impact: "The model cannot yet be tied to a controlled project record.", resolution: "Add the company and site identifier before expert review.", relatedRuleIds: [] });
  if (input.finishedProducts > 0 && input.finishedBatchesPerMonth === 0) unresolved.push({ id: "finished-batch-demand", category: "workload", severity: "blocking", question: "What is the monthly finished-product batch and sample demand?", impact: "Finished-product capability is present but no release workload is modeled.", resolution: "Provide current and future monthly batch/sample forecasts by product family.", relatedRuleIds: ["micro.workflow.finished-products"] });
  if (input.rawMaterials > 0 && input.rawMaterialLotsPerMonth === 0) unresolved.push({ id: "raw-material-demand", category: "workload", severity: "blocking", question: "What is the monthly incoming-lot and sample demand?", impact: "Raw-material capability is present but no incoming workload is modeled.", resolution: "Provide current and future incoming-lot/sample forecasts by material family.", relatedRuleIds: ["micro.workflow.raw-materials"] });
  return unresolved;
}

function buildTraceability(workflows: WorkflowDemand[]): { evidence: EvidenceRecord[]; ruleTrace: RuleTrace[] } {
  const workflowKeys = Object.entries(MICROBIOLOGY_WORKFLOW_RULES)
    .filter(([, rule]) => workflows.some((row) => row.ruleId === rule.ruleId))
    .map(([key]) => key as MicrobiologyWorkflowKey);
  const ruleTrace = [...workflowRuleTrace(workflowKeys), ...MICROBIOLOGY_SHARED_RULE_TRACE];
  const evidenceIds = new Set(ruleTrace.flatMap((rule) => rule.evidenceIds));
  return {
    ruleTrace,
    evidence: MICROBIOLOGY_EVIDENCE_CATALOG.filter((record) => evidenceIds.has(record.id)),
  };
}

function summarizeDataQuality(unresolvedInputs: UnresolvedInput[], evidence: EvidenceRecord[], ruleTrace: RuleTrace[]) {
  const blockingOpenCount = unresolvedInputs.filter((item) => item.severity === "blocking").length;
  const importantOpenCount = unresolvedInputs.filter((item) => item.severity === "important").length;
  return {
    completenessPercent: Math.max(0, Math.min(100, 100 - blockingOpenCount * 12 - importantOpenCount * 5)),
    blockingOpenCount,
    importantOpenCount,
    evidenceCount: evidence.length,
    tracedRuleCount: ruleTrace.length,
  };
}

export function compileQualityLabBlueprint(rawInput: QualityLabInput): QualityLabBlueprint {
  const input = qualityLabInputSchema.parse(rawInput);
  const growthMultiplier = 1 + input.growthRatePercent / 100;
  const finishedProductDemand = buildFinishedProductDemand(input);
  const currentWorkflows = buildWorkflowDemand(input, 1, finishedProductDemand);
  const methodGraph = input.facilityType === "nonsterile-pharma"
    ? compileNonSterileMethodGraph(input.productProfiles)
    : { requirements: [], bom: [], capacity: [] };
  const futureWorkflows = buildWorkflowDemand(input, growthMultiplier, finishedProductDemand);
  const equipment = buildEquipment(input, currentWorkflows, futureWorkflows, methodGraph.capacity, finishedProductDemand);
  const methodCapacitySummary = buildMethodCapacitySummary(input, equipment, methodGraph.capacity);
  const consumables = buildConsumables(currentWorkflows, futureWorkflows);
  const consumableSupply = buildConsumableSupply(input, consumables);
  const currentSpaces = buildSpaces(input, equipment, currentWorkflows);
  const futureSpaces = buildSpaces(input, equipment, futureWorkflows, true);
  const current = scenario("Current demand", 1, input, currentWorkflows, equipment, consumables, currentSpaces, false);
  const future = scenario(`Year ${input.horizonYears}`, growthMultiplier, input, futureWorkflows, equipment, consumables, futureSpaces, true);
  const workforceCapacity = buildWorkforceCapacity(input, currentWorkflows, futureWorkflows, current, future);
  const unresolvedInputs = buildUnresolvedInputs(input, currentWorkflows);
  if (input.productProfiles.length === 0) unresolvedInputs.push({ id: "product-profiles", category: "portfolio", severity: "blocking", question: "Which products, dosage forms, methods and execution decisions make up this portfolio?", impact: "Atlas cannot compile a product-to-method trace or method BOM without product profiles.", resolution: "Add each in-scope product profile and reconcile it with approved specifications.", relatedRuleIds: ["micro.workflow.finished-products"] });
  if (methodGraph.requirements.some((item) => item.requirementType === "method-suitability")) unresolvedInputs.push({ id: "method-suitability-status", category: "method", severity: "blocking", question: "Which products have approved method-suitability evidence, including neutralization and recovery?", impact: "Method architecture and consumable choices cannot be frozen while suitability is pending or unknown.", resolution: "Attach approved suitability/verification evidence per product and method.", relatedRuleIds: methodGraph.requirements.filter((item) => item.requirementType === "method-suitability").map((item) => item.methodId) });
  const unresolvedMarketAllocation = input.productProfiles.filter((product) => product.markets.length > 1 && product.marketExecutionStrategy === "unknown");
  if (unresolvedMarketAllocation.length > 0) unresolvedInputs.push({ id: "market-execution-allocation", category: "workload", severity: "blocking", question: "Which market requirements share one physical test execution, and which require separate testing?", impact: "Method BOM and in-house capacity are intentionally excluded for multi-market products until the physical testing allocation is known.", resolution: `Set a shared or separate execution strategy for: ${unresolvedMarketAllocation.map((product) => product.name).join(", ")}.`, relatedRuleIds: unresolvedMarketAllocation.flatMap((product) => methodGraph.requirements.filter((item) => item.productId === product.id).map((item) => item.methodId)) });
  if (finishedProductDemand.source === "reconciliation-required") unresolvedInputs.push({ id: "portfolio-demand-reconciliation", category: "workload", severity: "blocking", question: "Can the complete product portfolio be reconciled to the finished-product demand used for sizing?", impact: finishedProductDemand.message, resolution: "Resolve portfolio batch demand and market execution allocation, then recompile using the portfolio-derived basis.", relatedRuleIds: ["micro.workflow.finished-products"] });
  const { evidence, ruleTrace } = buildTraceability(currentWorkflows);
  const blueprint: QualityLabBlueprint = {
    contractVersion: QUALITY_LAB_BLUEPRINT_CONTRACT_VERSION,
    engineVersion: QUALITY_LAB_ENGINE_VERSION,
    compilerCoreVersion: QUALITY_LAB_COMPILER_CORE_VERSION,
    generatedAt: new Date().toISOString(),
    domainPack: MICROBIOLOGY_DOMAIN_PACK,
    input,
    workflows: currentWorkflows,
    methodRequirements: methodGraph.requirements,
    methodBom: methodGraph.bom,
    methodCapacity: methodGraph.capacity,
    methodCapacitySummary,
    finishedProductDemand,
    equipment,
    consumables,
    consumableSupply,
    spaces: futureSpaces,
    risks: buildRisks(input, current, future),
    assumptions: buildAssumptions(input, growthMultiplier),
    recommendations: buildRecommendations(input, equipment, future),
    procurementSequence: [
      { phase: "1 — Basis of design", timing: "0–4 weeks", items: ["Product/test matrix", "Approved demand forecast", "Insourcing strategy", "Site workflow time study"] },
      { phase: "2 — Critical path", timing: "1–3 months", items: equipment.filter((item) => ["sterility-isolator", "autoclave", "incubator-20-25", "incubator-30-35"].includes(item.id)).map((item) => item.name) },
      { phase: "3 — Core operations", timing: "2–5 months", items: equipment.filter((item) => ["bsc", "filtration-manifold", "air-sampler", "bet-reader"].includes(item.id)).map((item) => item.name) },
      { phase: "4 — Commission & scale", timing: "Before routine use", items: ["URS/DQ/IQ/OQ/PQ", "Method transfer/verification", "Analyst qualification", "Future-capacity trigger review"] },
    ].filter((phase) => phase.items.length > 0),
    current,
    future,
    workforceCapacity,
    evidence,
    ruleTrace,
    unresolvedInputs,
    dataQuality: summarizeDataQuality(unresolvedInputs, evidence, ruleTrace),
    review: {
      status: "concept-only",
      requiredRoles: ["QC method owner", "QA", "Laboratory engineering", "Procurement / finance"],
      blockingInputIds: unresolvedInputs.filter((item) => item.severity === "blocking").map((item) => item.id),
      lastReviewedAt: null,
      reviewNote: "Atlas generated this concept model. Approval, validation and controlled use occur outside Atlas under the client quality system.",
    },
    reviewStatus: "concept-only",
  };
  return qualityLabBlueprintSchema.parse(blueprint);
}

export function createQualityLabProject(input: QualityLabInput, id = `qlp_${Date.now().toString(36)}`): QualityLabProject {
  const now = new Date().toISOString();
  return {
    id,
    name: input.projectName,
    createdAt: now,
    updatedAt: now,
    input: qualityLabInputSchema.parse(input),
    blueprint: compileQualityLabBlueprint(input),
  };
}
