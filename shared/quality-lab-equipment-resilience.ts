import { z } from "zod";
import type { MethodCapacitySummary, QualityLabProject } from "./quality-lab.js";

export const EQUIPMENT_RESILIENCE_ENGINE_VERSION = "equipment-resilience/v1.0" as const;

const resourceIdSchema = z.enum(["incubator-20-25", "incubator-30-35", "bsc", "autoclave"]);

export const equipmentResourceConfigurationSchema = z.object({
  resourceId: resourceIdSchema,
  installedUnits: z.number().int().min(0).max(100),
  capacityPerUnitPerDay: z.number().positive().max(100_000),
  usableCapacityPercent: z.number().min(1).max(100),
  availabilityPercent: z.number().min(1).max(100),
  operatingDaysPerMonth: z.number().min(1).max(31),
  largestConcurrentLoad: z.number().min(0).max(1_000_000),
});

export const equipmentResilienceInputSchema = z.object({
  projectId: z.string().min(1),
  demandHorizon: z.enum(["current", "future"]),
  demandPeakFactor: z.number().min(1).max(3),
  singleFailureDurationDays: z.number().min(0.5).max(90),
  maximumRecoveryDays: z.number().min(0).max(60),
  resources: z.array(equipmentResourceConfigurationSchema).max(4),
});

export type EquipmentResourceConfiguration = z.infer<typeof equipmentResourceConfigurationSchema>;
export type EquipmentResilienceInput = z.infer<typeof equipmentResilienceInputSchema>;
export type EquipmentResilienceStatus = "resilient" | "recoverable" | "single-point-failure" | "normal-capacity-fail" | "recovery-fail" | "geometry-fail";

export interface EquipmentResilienceResource {
  resourceId: EquipmentResourceConfiguration["resourceId"];
  resourceName: string;
  unit: MethodCapacitySummary["unit"];
  status: EquipmentResilienceStatus;
  installedUnits: number;
  failedUnitsAvailable: number;
  monthlyDemand: number;
  peakDailyDemand: number;
  usableCapacityPerUnitPerDay: number;
  normalDailyCapacity: number;
  failureDailyCapacity: number;
  normalUtilizationPercent: number;
  failureUtilizationPercent: number | null;
  largestConcurrentLoad: number;
  geometryMargin: number;
  failureBacklog: number;
  modeledRecoveryDays: number | null;
  minimumUnitsNormal: number;
  minimumUnitsNPlusOne: number;
  nPlusOneGapUnits: number;
  incrementalCapexLowUsd: number;
  incrementalCapexHighUsd: number;
  evidenceNeeded: string[];
  relatedRuleIds: string[];
}

export interface EquipmentResilienceResult {
  engineVersion: typeof EQUIPMENT_RESILIENCE_ENGINE_VERSION;
  generatedAt: string;
  project: { id: string; name: string; blueprintEngineVersion: string; demandHorizon: "current" | "future" };
  input: EquipmentResilienceInput;
  resources: EquipmentResilienceResource[];
  overallStatus: EquipmentResilienceStatus | "not-applicable";
  summary: { resilientCount: number; singlePointCount: number; failingCount: number; nPlusOneGapUnits: number; incrementalCapexLowUsd: number; incrementalCapexHighUsd: number };
  signals: Array<{ id: string; severity: "critical" | "watch" | "positive" | "information"; title: string; description: string; relatedRuleIds: string[] }>;
  assumptions: Array<{ id: string; value: string; confidence: "user-supplied" | "indicative"; evidenceNeeded: string }>;
  ruleTrace: Array<{ ruleId: string; ruleVersion: string; role: string; limitation: string }>;
  boundary: string;
}

const metadata: Record<EquipmentResourceConfiguration["resourceId"], {
  capacityPerUnitPerDay: (project: QualityLabProject) => number;
  usableCapacityPercent: number;
  operatingDaysPerMonth: (project: QualityLabProject) => number;
  evidenceNeeded: string[];
}> = {
  "incubator-20-25": {
    capacityPerUnitPerDay: () => 300,
    usableCapacityPercent: 70,
    operatingDaysPerMonth: () => 30,
    evidenceNeeded: ["Mapped usable shelf and rack positions by plate format", "Approved incubation segregation and concurrent-load rules", "Alarm response, transfer capacity and temperature-excursion history"],
  },
  "incubator-30-35": {
    capacityPerUnitPerDay: () => 300,
    usableCapacityPercent: 70,
    operatingDaysPerMonth: () => 30,
    evidenceNeeded: ["Mapped usable shelf and rack positions by plate format", "Approved incubation segregation and concurrent-load rules", "Alarm response, transfer capacity and temperature-excursion history"],
  },
  bsc: {
    capacityPerUnitPerDay: (project) => project.input.productiveHoursPerShift * project.input.shifts,
    usableCapacityPercent: 75,
    operatingDaysPerMonth: (project) => project.input.workingDaysPerMonth,
    evidenceNeeded: ["Qualified operating hours and observed setup/cleaning/changeover time", "Concurrent work and method-segregation restrictions", "Certification downtime, decontamination and alternate-cabinet transfer plan"],
  },
  autoclave: {
    capacityPerUnitPerDay: () => 50,
    usableCapacityPercent: 70,
    operatingDaysPerMonth: (project) => project.input.workingDaysPerMonth,
    evidenceNeeded: ["Validated usable load by cycle and load pattern", "Cycle duration, cooling, release and daily scheduling evidence", "Clean/dirty load segregation, utilities and alternate decontamination route"],
  },
};

const statusOrder: EquipmentResilienceStatus[] = ["resilient", "recoverable", "single-point-failure", "recovery-fail", "normal-capacity-fail", "geometry-fail"];

function round(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function equipmentFor(project: QualityLabProject, id: EquipmentResourceConfiguration["resourceId"]) {
  return project.blueprint.equipment.find((item) => item.id === id);
}

function monthlyDemand(project: QualityLabProject, summary: MethodCapacitySummary, horizon: "current" | "future") {
  return round(summary.monthlyDemand * (horizon === "future" ? project.blueprint.future.multiplier : 1));
}

export function defaultEquipmentResilienceInput(project: QualityLabProject): EquipmentResilienceInput {
  const demandHorizon = "future" as const;
  const demandPeakFactor = 1.3;
  const resources = project.blueprint.methodCapacitySummary.map((summary): EquipmentResourceConfiguration => {
    const definition = metadata[summary.resourceId];
    const demand = monthlyDemand(project, summary, demandHorizon);
    const operatingDays = definition.operatingDaysPerMonth(project);
    return {
      resourceId: summary.resourceId,
      installedUnits: equipmentFor(project, summary.resourceId)?.quantityFuture ?? 0,
      capacityPerUnitPerDay: definition.capacityPerUnitPerDay(project),
      usableCapacityPercent: definition.usableCapacityPercent,
      availabilityPercent: 100 - project.input.equipmentDowntimePercent,
      operatingDaysPerMonth: operatingDays,
      largestConcurrentLoad: round(demand * demandPeakFactor / operatingDays),
    };
  });
  return equipmentResilienceInputSchema.parse({ projectId: project.id, demandHorizon, demandPeakFactor, singleFailureDurationDays: 5, maximumRecoveryDays: 5, resources });
}

export function evaluateEquipmentResilience(project: QualityLabProject, rawInput: EquipmentResilienceInput): EquipmentResilienceResult {
  const input = equipmentResilienceInputSchema.parse(rawInput);
  const summaryById = new Map(project.blueprint.methodCapacitySummary.map((item) => [item.resourceId, item]));
  const resources = input.resources.flatMap((configuration): EquipmentResilienceResource[] => {
    const summary = summaryById.get(configuration.resourceId);
    if (!summary) return [];
    const demand = monthlyDemand(project, summary, input.demandHorizon);
    if (demand <= 0) return [];
    const equipment = equipmentFor(project, configuration.resourceId);
    const geometryCapacity = configuration.capacityPerUnitPerDay * configuration.usableCapacityPercent / 100;
    const usableCapacity = geometryCapacity * configuration.availabilityPercent / 100;
    const peakDailyDemand = demand * input.demandPeakFactor / configuration.operatingDaysPerMonth;
    const normalDailyCapacity = configuration.installedUnits * usableCapacity;
    const failedUnitsAvailable = Math.max(0, configuration.installedUnits - 1);
    const failureDailyCapacity = failedUnitsAvailable * usableCapacity;
    const minimumUnitsNormal = Math.max(1, Math.ceil(peakDailyDemand / usableCapacity));
    const minimumUnitsNPlusOne = minimumUnitsNormal + 1;
    const nPlusOneGapUnits = Math.max(0, minimumUnitsNPlusOne - configuration.installedUnits);
    const failureBacklog = Math.max(0, peakDailyDemand - failureDailyCapacity) * input.singleFailureDurationDays;
    const recoveryHeadroom = normalDailyCapacity - peakDailyDemand;
    const modeledRecoveryDays = failureBacklog === 0 ? 0 : recoveryHeadroom > 0 ? failureBacklog / recoveryHeadroom : null;
    const geometryMargin = geometryCapacity - configuration.largestConcurrentLoad;
    let status: EquipmentResilienceStatus;
    if (geometryMargin < 0) status = "geometry-fail";
    else if (normalDailyCapacity < peakDailyDemand) status = "normal-capacity-fail";
    else if (configuration.installedUnits <= 1) status = "single-point-failure";
    else if (failureDailyCapacity >= peakDailyDemand) status = "resilient";
    else if (modeledRecoveryDays !== null && modeledRecoveryDays <= input.maximumRecoveryDays) status = "recoverable";
    else status = "recovery-fail";
    return [{
      resourceId: configuration.resourceId,
      resourceName: summary.resourceName,
      unit: summary.unit,
      status,
      installedUnits: configuration.installedUnits,
      failedUnitsAvailable,
      monthlyDemand: demand,
      peakDailyDemand: round(peakDailyDemand),
      usableCapacityPerUnitPerDay: round(usableCapacity),
      normalDailyCapacity: round(normalDailyCapacity),
      failureDailyCapacity: round(failureDailyCapacity),
      normalUtilizationPercent: normalDailyCapacity > 0 ? round(peakDailyDemand / normalDailyCapacity * 100, 1) : 100,
      failureUtilizationPercent: failureDailyCapacity > 0 ? round(peakDailyDemand / failureDailyCapacity * 100, 1) : null,
      largestConcurrentLoad: configuration.largestConcurrentLoad,
      geometryMargin: round(geometryMargin),
      failureBacklog: round(failureBacklog),
      modeledRecoveryDays: modeledRecoveryDays === null ? null : round(modeledRecoveryDays),
      minimumUnitsNormal,
      minimumUnitsNPlusOne,
      nPlusOneGapUnits,
      incrementalCapexLowUsd: nPlusOneGapUnits * (equipment?.unitCapexLowUsd ?? 0),
      incrementalCapexHighUsd: nPlusOneGapUnits * (equipment?.unitCapexHighUsd ?? 0),
      evidenceNeeded: metadata[configuration.resourceId].evidenceNeeded,
      relatedRuleIds: ["core.capacity.equipment", "core.equipment.resilience", ...project.blueprint.methodCapacity.filter((item) => item.resourceId === configuration.resourceId).map((item) => item.methodRequirementId)],
    }];
  });

  const overallStatus = resources.length ? resources.reduce((worst, item) => statusOrder.indexOf(item.status) > statusOrder.indexOf(worst) ? item.status : worst, "resilient" as EquipmentResilienceStatus) : "not-applicable";
  const failing = resources.filter((item) => ["geometry-fail", "normal-capacity-fail", "recovery-fail"].includes(item.status));
  const singlePoints = resources.filter((item) => item.status === "single-point-failure");
  const signals: EquipmentResilienceResult["signals"] = [];
  for (const resource of failing) signals.push({ id: `failure-${resource.resourceId}`, severity: "critical", title: `${resource.resourceName}: ${resource.status.replaceAll("-", " ")}`, description: resource.status === "geometry-fail" ? "The largest concurrent load does not fit the modeled usable unit geometry. Additional units do not fix a load that cannot fit one qualified configuration." : resource.status === "normal-capacity-fail" ? "Peak demand exceeds normal available capacity under the selected geometry and availability assumptions." : "A one-unit outage creates backlog that cannot be recovered inside the selected recovery window.", relatedRuleIds: resource.relatedRuleIds });
  for (const resource of singlePoints) signals.push({ id: `single-point-${resource.resourceId}`, severity: "critical", title: `${resource.resourceName} is a single point of failure`, description: "Loss of the only configured unit removes all modeled site capacity for this method-linked resource during the outage.", relatedRuleIds: resource.relatedRuleIds });
  for (const resource of resources.filter((item) => item.status === "recoverable")) signals.push({ id: `recovery-${resource.resourceId}`, severity: "watch", title: `${resource.resourceName} depends on backlog recovery`, description: `The failure state cannot carry peak demand. The model creates ${resource.failureBacklog} ${resource.unit} of backlog and clears it in ${resource.modeledRecoveryDays} day(s) after repair.`, relatedRuleIds: resource.relatedRuleIds });
  if (resources.some((item) => item.nPlusOneGapUnits > 0)) signals.push({ id: "n-plus-one-gap", severity: "watch", title: `${resources.reduce((sum, item) => sum + item.nPlusOneGapUnits, 0)} additional unit(s) close the concept N+1 gap`, description: "This is a configuration trigger, not a purchase recommendation. Confirm usable geometry, failure independence, utilities, transfer procedures and business-continuity policy first.", relatedRuleIds: ["core.equipment.resilience", "core.cost.concept"] });
  if (resources.length > 0 && resources.every((item) => item.status === "resilient")) signals.push({ id: "resilient-screen", severity: "positive", title: "All modeled critical resources carry peak demand after one-unit loss", description: "The result remains conditional on the supplied unit geometry, availability, load concurrency and failure-independence assumptions.", relatedRuleIds: ["core.equipment.resilience"] });
  if (resources.length === 0) signals.push({ id: "no-method-load", severity: "information", title: "No method-derived critical resource load is available", description: "Complete an in-house non-sterile product method profile before running equipment resilience analysis.", relatedRuleIds: [] });

  return {
    engineVersion: EQUIPMENT_RESILIENCE_ENGINE_VERSION,
    generatedAt: new Date().toISOString(),
    project: { id: project.id, name: project.name, blueprintEngineVersion: project.blueprint.engineVersion, demandHorizon: input.demandHorizon },
    input,
    resources,
    overallStatus,
    summary: {
      resilientCount: resources.filter((item) => item.status === "resilient").length,
      singlePointCount: singlePoints.length,
      failingCount: failing.length,
      nPlusOneGapUnits: resources.reduce((sum, item) => sum + item.nPlusOneGapUnits, 0),
      incrementalCapexLowUsd: resources.reduce((sum, item) => sum + item.incrementalCapexLowUsd, 0),
      incrementalCapexHighUsd: resources.reduce((sum, item) => sum + item.incrementalCapexHighUsd, 0),
    },
    signals,
    assumptions: [
      { id: "peak-demand", value: `${input.demandPeakFactor}× average daily method load`, confidence: "indicative", evidenceNeeded: "Timestamped samples, batch campaigns and concurrent method loads." },
      { id: "single-failure", value: `One unit unavailable for ${input.singleFailureDurationDays} day(s)`, confidence: "user-supplied", evidenceNeeded: "Failure, repair, qualification and return-to-service history by equipment class." },
      { id: "recovery-window", value: `${input.maximumRecoveryDays} day(s) maximum modeled backlog recovery`, confidence: "user-supplied", evidenceNeeded: "Approved turnaround commitments, backlog triage and business-continuity policy." },
      { id: "failure-independence", value: "Remaining units, utilities and monitoring remain available", confidence: "indicative", evidenceNeeded: "Common-cause failure assessment for utilities, HVAC, monitoring, rooms, alarms and staff." },
    ],
    ruleTrace: [{ ruleId: "core.equipment.resilience", ruleVersion: EQUIPMENT_RESILIENCE_ENGINE_VERSION, role: "Separates unit load fit, normal peak capacity, one-unit failure continuity, backlog and recovery.", limitation: "Deterministic resource screen; it does not schedule batches, model correlated failures or qualify equipment." }],
    boundary: "Atlas Equipment Resilience v1 is a vendor-neutral configuration screen. N+1 gaps and CAPEX bands are planning triggers, not purchase quantities, validated load claims, URS approval or proof of business continuity. Controlled use requires approved methods, mapped usable geometry, observed cycles/downtime and qualified engineering, SME and QA review.",
  };
}
