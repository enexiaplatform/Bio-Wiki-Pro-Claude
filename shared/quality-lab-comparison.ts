import type { QualityLabBlueprint, QualityLabInput, QualityLabProject } from "./quality-lab.js";

export type ComparisonSignalSeverity = "critical" | "watch" | "positive" | "information";

export interface ScenarioComparisonMetric {
  id: string;
  label: string;
  unit: "count" | "fte" | "sqm" | "usd" | "percent";
  baseline: number;
  alternative: number;
  delta: number;
  percentChange: number | null;
}

export interface ScenarioInputChange {
  id: keyof QualityLabInput;
  label: string;
  baseline: number;
  alternative: number;
  delta: number;
  unit: string;
}

export interface ScenarioEquipmentChange {
  id: string;
  name: string;
  baselineQuantity: number;
  alternativeQuantity: number;
  delta: number;
}

export interface ScenarioCapacityChange {
  id: string;
  name: string;
  unit: string;
  baselineUtilization: number;
  alternativeUtilization: number;
  delta: number;
}

export interface ScenarioComparisonSignal {
  id: string;
  severity: ComparisonSignalSeverity;
  title: string;
  description: string;
  relatedRuleIds: string[];
}

export interface QualityLabScenarioComparison {
  generatedAt: string;
  engineVersions: { baseline: string; alternative: string; comparable: boolean };
  baseline: { id: string; name: string; horizonYears: number };
  alternative: { id: string; name: string; horizonYears: number };
  metrics: ScenarioComparisonMetric[];
  inputChanges: ScenarioInputChange[];
  equipmentChanges: ScenarioEquipmentChange[];
  capacityChanges: ScenarioCapacityChange[];
  resolvedBlockingInputs: string[];
  addedBlockingInputs: string[];
  signals: ScenarioComparisonSignal[];
  boundary: string;
}

const trackedInputs: Array<{ id: keyof QualityLabInput; label: string; unit: string }> = [
  { id: "finishedBatchesPerMonth", label: "Finished batches / month", unit: "batches" },
  { id: "rawMaterialLotsPerMonth", label: "Raw-material lots / month", unit: "lots" },
  { id: "waterPoints", label: "Water sampling points", unit: "points" },
  { id: "waterRoundsPerWeek", label: "Water rounds / week", unit: "rounds" },
  { id: "emLocations", label: "EM locations", unit: "locations" },
  { id: "emRoundsPerWeek", label: "EM rounds / week", unit: "rounds" },
  { id: "mediaLotsPerMonth", label: "Media lots / month", unit: "lots" },
  { id: "targetTurnaroundDays", label: "Target turnaround", unit: "days" },
  { id: "growthRatePercent", label: "Growth assumption", unit: "%" },
  { id: "horizonYears", label: "Planning horizon", unit: "years" },
  { id: "workingDaysPerMonth", label: "Working days / month", unit: "days" },
  { id: "shifts", label: "Operating shifts", unit: "shifts" },
  { id: "productiveHoursPerShift", label: "Productive hours / shift", unit: "hours" },
  { id: "outsourcePercent", label: "Outsourced workload", unit: "%" },
  { id: "redundancyPercent", label: "People capacity reserve", unit: "%" },
  { id: "equipmentDowntimePercent", label: "Equipment downtime", unit: "%" },
];

function round(value: number, digits = 1): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function percentChange(baseline: number, alternative: number): number | null {
  if (baseline === 0) return alternative === 0 ? 0 : null;
  return round(((alternative - baseline) / baseline) * 100);
}

function metric(id: string, label: string, unit: ScenarioComparisonMetric["unit"], baseline: number, alternative: number): ScenarioComparisonMetric {
  return { id, label, unit, baseline, alternative, delta: round(alternative - baseline), percentChange: percentChange(baseline, alternative) };
}

function blockingIds(blueprint: QualityLabBlueprint): Set<string> {
  return new Set(blueprint.unresolvedInputs.filter((item) => item.severity === "blocking").map((item) => item.id));
}

export function compareQualityLabScenarios(baseline: QualityLabProject, alternative: QualityLabProject): QualityLabScenarioComparison {
  const baselineFuture = baseline.blueprint.future;
  const alternativeFuture = alternative.blueprint.future;
  const metrics = [
    metric("monthly-tests", "Monthly tests at planning horizon", "count", baselineFuture.monthlyTests, alternativeFuture.monthlyTests),
    metric("hands-on-hours", "Monthly hands-on hours", "count", baselineFuture.monthlyHandsOnHours, alternativeFuture.monthlyHandsOnHours),
    metric("team-fte", "Total team capacity", "fte", baselineFuture.totalTeamFte, alternativeFuture.totalTeamFte),
    metric("area", "Concept area allowance", "sqm", baselineFuture.estimatedAreaSqm, alternativeFuture.estimatedAreaSqm),
    metric("capex-high", "CAPEX planning high", "usd", baselineFuture.capexHighUsd, alternativeFuture.capexHighUsd),
    metric("opex-high", "Annual OPEX planning high", "usd", baselineFuture.annualOpexHighUsd, alternativeFuture.annualOpexHighUsd),
    metric("readiness", "Input readiness", "percent", baseline.blueprint.dataQuality.completenessPercent, alternative.blueprint.dataQuality.completenessPercent),
  ];

  const inputChanges = trackedInputs.flatMap(({ id, label, unit }) => {
    const before = baseline.input[id];
    const after = alternative.input[id];
    if (typeof before !== "number" || typeof after !== "number" || before === after) return [];
    return [{ id, label, unit, baseline: before, alternative: after, delta: round(after - before) }];
  });

  const baselineEquipment = new Map(baseline.blueprint.equipment.map((item) => [item.id, item]));
  const alternativeEquipment = new Map(alternative.blueprint.equipment.map((item) => [item.id, item]));
  const equipmentIds = new Set([...Array.from(baselineEquipment.keys()), ...Array.from(alternativeEquipment.keys())]);
  const equipmentChanges = Array.from(equipmentIds).flatMap((id) => {
    const before = baselineEquipment.get(id);
    const after = alternativeEquipment.get(id);
    const baselineQuantity = before?.quantityFuture ?? 0;
    const alternativeQuantity = after?.quantityFuture ?? 0;
    if (baselineQuantity === alternativeQuantity) return [];
    return [{ id, name: after?.name ?? before?.name ?? id, baselineQuantity, alternativeQuantity, delta: alternativeQuantity - baselineQuantity }];
  });

  const baselineCapacity = new Map(baseline.blueprint.methodCapacitySummary.map((item) => [item.resourceId, item]));
  const alternativeCapacity = new Map(alternative.blueprint.methodCapacitySummary.map((item) => [item.resourceId, item]));
  const capacityIds = new Set([...Array.from(baselineCapacity.keys()), ...Array.from(alternativeCapacity.keys())]);
  const capacityChanges = Array.from(capacityIds).map((id) => {
    const before = baselineCapacity.get(id);
    const after = alternativeCapacity.get(id);
    return {
      id,
      name: after?.resourceName ?? before?.resourceName ?? id,
      unit: after?.unit ?? before?.unit ?? "capacity units",
      baselineUtilization: before?.utilizationPercent ?? 0,
      alternativeUtilization: after?.utilizationPercent ?? 0,
      delta: round((after?.utilizationPercent ?? 0) - (before?.utilizationPercent ?? 0)),
    };
  }).filter((item) => item.baselineUtilization !== item.alternativeUtilization || item.alternativeUtilization >= 70);

  const beforeBlocking = blockingIds(baseline.blueprint);
  const afterBlocking = blockingIds(alternative.blueprint);
  const resolvedBlockingInputs = Array.from(beforeBlocking).filter((id) => !afterBlocking.has(id));
  const addedBlockingInputs = Array.from(afterBlocking).filter((id) => !beforeBlocking.has(id));
  const signals: ScenarioComparisonSignal[] = [];

  for (const capacity of capacityChanges.filter((item) => item.alternativeUtilization >= 85)) {
    signals.push({
      id: `capacity-${capacity.id}`,
      severity: "critical",
      title: `${capacity.name} reaches ${round(capacity.alternativeUtilization)}% concept utilization`,
      description: "The alternative crosses the 85% planning trigger. Confirm usable geometry, cycle data, downtime, batching and redundancy before treating the scenario as feasible.",
      relatedRuleIds: ["core.capacity.equipment"],
    });
  }

  const teamMetric = metrics.find((item) => item.id === "team-fte")!;
  if (Math.abs(teamMetric.delta) >= 0.5) signals.push({
    id: "workforce-change",
    severity: "watch",
    title: `${teamMetric.delta > 0 ? "+" : ""}${teamMetric.delta} team FTE at the planning horizon`,
    description: "Validate the change against method qualification, shift coverage, reviewer authorization, leave and investigation load; aggregate FTE is not a deployable roster.",
    relatedRuleIds: ["core.capacity.people"],
  });

  if (equipmentChanges.length > 0) signals.push({
    id: "equipment-change",
    severity: "watch",
    title: `${equipmentChanges.length} equipment class${equipmentChanges.length === 1 ? "" : "es"} change quantity`,
    description: "Treat these as procurement trigger candidates. Confirm approved method loads, utilities, qualification downtime and business-continuity requirements before URS release.",
    relatedRuleIds: ["core.capacity.equipment", "core.cost.concept"],
  });

  const outsourceChange = inputChanges.find((item) => item.id === "outsourcePercent");
  if (outsourceChange) signals.push({
    id: "outsource-tradeoff",
    severity: "information",
    title: `Outsourcing changes by ${outsourceChange.delta > 0 ? "+" : ""}${outsourceChange.delta}%`,
    description: "Compare internal resource relief with sample logistics, external queue time, data ownership, investigation handoffs and backup-laboratory resilience.",
    relatedRuleIds: ["core.capacity.people", "core.turnaround.feasibility"],
  });

  if (resolvedBlockingInputs.length > 0) signals.push({ id: "blocking-resolved", severity: "positive", title: `${resolvedBlockingInputs.length} blocking input${resolvedBlockingInputs.length === 1 ? "" : "s"} resolved`, description: "The alternative has a stronger decision basis for these items, but still requires the named external review and evidence controls.", relatedRuleIds: [] });
  if (addedBlockingInputs.length > 0) signals.push({ id: "blocking-added", severity: "critical", title: `${addedBlockingInputs.length} new blocking input${addedBlockingInputs.length === 1 ? "" : "s"}`, description: "Do not select the alternative for controlled use until these inputs are resolved or explicitly accepted through project governance.", relatedRuleIds: [] });
  if (signals.length === 0) signals.push({ id: "no-material-trigger", severity: "information", title: "No material planning trigger detected", description: "The compiled outputs are close on the tracked decision dimensions. Review method applicability and site evidence before concluding that the scenarios are equivalent.", relatedRuleIds: [] });

  return {
    generatedAt: new Date().toISOString(),
    engineVersions: { baseline: baseline.blueprint.engineVersion, alternative: alternative.blueprint.engineVersion, comparable: baseline.blueprint.engineVersion === alternative.blueprint.engineVersion },
    baseline: { id: baseline.id, name: baseline.name, horizonYears: baseline.input.horizonYears },
    alternative: { id: alternative.id, name: alternative.name, horizonYears: alternative.input.horizonYears },
    metrics,
    inputChanges,
    equipmentChanges,
    capacityChanges,
    resolvedBlockingInputs,
    addedBlockingInputs,
    signals,
    boundary: "This comparison ranks concept planning consequences. It does not validate methods, prove schedule feasibility, approve equipment quantities, or replace site, SME, QA, engineering and regulatory review.",
  };
}
