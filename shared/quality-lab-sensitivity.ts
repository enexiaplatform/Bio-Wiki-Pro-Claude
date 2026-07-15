import { compileQualityLabBlueprint, type QualityLabBlueprint, type QualityLabInput, type QualityLabProject } from "./quality-lab.js";

export const QUALITY_LAB_SENSITIVITY_ENGINE_VERSION = "sensitivity-confidence/v1.0";

export type SensitivityMetricId =
  | "future-hands-on-hours"
  | "future-team-fte"
  | "future-capex-high"
  | "future-opex-high"
  | "future-area"
  | "peak-resource-utilization";

export type SensitivityDriverId =
  | "finishedBatchesPerMonth"
  | "rawMaterialLotsPerMonth"
  | "waterRoundsPerWeek"
  | "emRoundsPerWeek"
  | "mediaLotsPerMonth"
  | "growthRatePercent"
  | "outsourcePercent"
  | "productiveHoursPerShift"
  | "redundancyPercent"
  | "equipmentDowntimePercent"
  | "consumableWastePercent"
  | "analystAnnualCostUsd";

export interface SensitivityMetric {
  id: SensitivityMetricId;
  label: string;
  unit: "hours" | "fte" | "usd" | "sqm" | "percent";
  baseline: number;
}

export interface SensitivityOutcome {
  metricId: SensitivityMetricId;
  low: number;
  high: number;
  lowDeltaPercent: number;
  highDeltaPercent: number;
  swingPercent: number;
}

export interface SensitivityDriver {
  id: SensitivityDriverId;
  label: string;
  unit: string;
  baselineValue: number;
  lowValue: number;
  highValue: number;
  perturbationBasis: string;
  modelConfidence: "high" | "medium" | "indicative";
  evidenceStatus: "site-evidence-required";
  decisionClass: "decision-critical" | "material" | "stable-in-tested-range";
  verificationPriority: "critical" | "high" | "medium";
  maxOutputSwingPercent: number;
  outcomes: SensitivityOutcome[];
  relatedUnresolvedInputIds: string[];
  evidenceNeeded: string;
  decisionUse: string;
  relatedRuleIds: string[];
}

export interface SensitivityAnalysis {
  generatedAt: string;
  engineVersion: string;
  blueprintEngineVersion: string;
  project: { id: string; name: string };
  metrics: SensitivityMetric[];
  drivers: SensitivityDriver[];
  verificationQueue: SensitivityDriver[];
  summary: {
    dominantDriverId: SensitivityDriverId | null;
    decisionCriticalCount: number;
    siteEvidenceRequiredCount: number;
    openBlockingInputCount: number;
  };
  methodology: string[];
  ruleTrace: Array<{ ruleId: string; ruleVersion: string; name: string; applicability: string; limitations: string }>;
  boundary: string;
}

type DriverDefinition = {
  id: SensitivityDriverId;
  label: string;
  unit: string;
  mode: "scale" | "add";
  variation: number;
  min: number;
  max: number;
  integer?: boolean;
  active: (input: QualityLabInput) => boolean;
  confidence: SensitivityDriver["modelConfidence"];
  unresolvedIds: string[];
  unresolvedCategories?: Array<QualityLabBlueprint["unresolvedInputs"][number]["category"]>;
  evidenceNeeded: string;
  decisionUse: string;
  relatedRuleIds: string[];
};

const definitions: DriverDefinition[] = [
  { id: "finishedBatchesPerMonth", label: "Finished-product batches", unit: "batches/month", mode: "scale", variation: 0.2, min: 0, max: 100_000, active: (i) => i.scope.finishedProducts, confidence: "medium", unresolvedIds: ["finished-batch-demand", "portfolio-demand-reconciliation", "product-profiles", "market-execution-allocation"], evidenceNeeded: "Approved production plan, sampling plan and reconciled product-by-market test allocation.", decisionUse: "Confirms release-test workload, analyst demand and method-linked equipment sizing.", relatedRuleIds: ["micro.workflow.finished-products"] },
  { id: "rawMaterialLotsPerMonth", label: "Raw-material lots", unit: "lots/month", mode: "scale", variation: 0.2, min: 0, max: 100_000, active: (i) => i.scope.rawMaterials, confidence: "indicative", unresolvedIds: ["raw-material-demand"], evidenceNeeded: "Approved material forecast, receipt frequency, skip-lot/reduced-testing rules and sampling plan.", decisionUse: "Confirms incoming-control workload and the value of insource versus outsource options.", relatedRuleIds: ["micro.workflow.raw-materials"] },
  { id: "waterRoundsPerWeek", label: "Water monitoring frequency", unit: "rounds/week", mode: "scale", variation: 0.2, min: 0, max: 21, active: (i) => i.scope.water && i.waterPoints > 0, confidence: "indicative", unresolvedIds: [], unresolvedCategories: ["workload"], evidenceNeeded: "Approved sampling map, point criticality, monitoring frequency and repeat/investigation history.", decisionUse: "Tests sampling, transport and microbiology workload exposure from the water program.", relatedRuleIds: ["micro.workflow.water"] },
  { id: "emRoundsPerWeek", label: "Environmental monitoring frequency", unit: "rounds/week", mode: "scale", variation: 0.2, min: 0, max: 21, active: (i) => i.scope.environmentalMonitoring && i.emLocations > 0, confidence: "indicative", unresolvedIds: [], unresolvedCategories: ["workload"], evidenceNeeded: "Approved EM map, frequencies by state, sample types and investigation/repeat history.", decisionUse: "Tests routine monitoring demand and the risk of under-sizing sampling and incubation capacity.", relatedRuleIds: ["micro.workflow.environmental-monitoring"] },
  { id: "mediaLotsPerMonth", label: "Prepared media lots", unit: "lots/month", mode: "scale", variation: 0.2, min: 0, max: 10_000, active: (i) => i.scope.growthPromotion, confidence: "indicative", unresolvedIds: [], unresolvedCategories: ["workload"], evidenceNeeded: "Media recipes, batch sizes, preparation schedule, growth-promotion design and rejection history.", decisionUse: "Tests media-support effort, autoclave demand and growth-promotion workload.", relatedRuleIds: ["micro.workflow.growth-promotion"] },
  { id: "growthRatePercent", label: "Annual demand growth", unit: "%/year", mode: "add", variation: 10, min: -50, max: 500, active: () => true, confidence: "medium", unresolvedIds: [], unresolvedCategories: ["portfolio", "workload"], evidenceNeeded: "Approved commercial and production forecast with product launches, transfers and scenario ownership.", decisionUse: "Determines how strongly future staffing, area, equipment and budget depend on the planning horizon.", relatedRuleIds: ["core.scenario.growth"] },
  { id: "outsourcePercent", label: "Outsourced workload", unit: "%", mode: "add", variation: 10, min: 0, max: 95, active: () => true, confidence: "high", unresolvedIds: ["market-execution-allocation"], unresolvedCategories: ["method", "workload"], evidenceNeeded: "Approved make/buy scope, qualified laboratory capability, logistics time, investigation ownership and continuity plan.", decisionUse: "Tests the resource relief and retained capability implied by the make-versus-buy decision.", relatedRuleIds: ["core.capacity.people"] },
  { id: "productiveHoursPerShift", label: "Productive analyst hours", unit: "hours/shift", mode: "add", variation: 1, min: 2, max: 12, active: () => true, confidence: "indicative", unresolvedIds: ["skill-shift-coverage"], evidenceNeeded: "Time study separating testing, setup, documentation, meetings, training, deviations and non-routine work.", decisionUse: "Tests whether the staffing result depends on an optimistic productive-time allowance.", relatedRuleIds: ["core.capacity.people"] },
  { id: "redundancyPercent", label: "People resilience reserve", unit: "%", mode: "add", variation: 10, min: 0, max: 100, active: () => true, confidence: "medium", unresolvedIds: ["skill-shift-coverage"], evidenceNeeded: "Shift roster, qualification matrix, leave/absence history, training load and minimum method coverage rules.", decisionUse: "Tests the cost and staffing consequence of the selected resilience policy.", relatedRuleIds: ["core.capacity.people"] },
  { id: "equipmentDowntimePercent", label: "Equipment downtime", unit: "%", mode: "add", variation: 10, min: 0, max: 50, active: () => true, confidence: "medium", unresolvedIds: ["equipment-cycle-data"], evidenceNeeded: "Maintenance, calibration, qualification and failure history plus usable cycle and load geometry by equipment class.", decisionUse: "Tests equipment quantities and utilization against realistic unavailability.", relatedRuleIds: ["core.capacity.equipment"] },
  { id: "consumableWastePercent", label: "Consumable waste allowance", unit: "%", mode: "add", variation: 5, min: 0, max: 50, active: () => true, confidence: "indicative", unresolvedIds: ["consumable-supply-evidence"], evidenceNeeded: "Item-level issue/usage history, rejects, expiry, pack sizes and minimum order quantities.", decisionUse: "Tests inventory and recurring-cost exposure from waste and unusable stock.", relatedRuleIds: ["core.supply.consumables"] },
  { id: "analystAnnualCostUsd", label: "Loaded analyst cost", unit: "USD/FTE-year", mode: "scale", variation: 0.2, min: 0, max: 500_000, active: () => true, confidence: "indicative", unresolvedIds: ["local-cost-basis"], evidenceNeeded: "Approved loaded labor cost by role, shift premium, benefits, contractor assumptions and inflation basis.", decisionUse: "Tests the labor component of annual operating cost.", relatedRuleIds: ["core.cost.concept"] },
];

function round(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function boundedValue(value: number, definition: DriverDefinition, direction: "low" | "high"): number {
  const changed = definition.mode === "scale"
    ? value * (direction === "low" ? 1 - definition.variation : 1 + definition.variation)
    : value + (direction === "low" ? -definition.variation : definition.variation);
  const bounded = Math.min(definition.max, Math.max(definition.min, changed));
  return definition.integer ? Math.round(bounded) : round(bounded);
}

function metricValues(blueprint: QualityLabBlueprint): Record<SensitivityMetricId, number> {
  return {
    "future-hands-on-hours": blueprint.future.monthlyHandsOnHours,
    "future-team-fte": blueprint.future.totalTeamFte,
    "future-capex-high": blueprint.future.capexHighUsd,
    "future-opex-high": blueprint.future.annualOpexHighUsd,
    "future-area": blueprint.future.estimatedAreaSqm,
    "peak-resource-utilization": Math.max(0, ...blueprint.methodCapacitySummary.map((item) => item.utilizationPercent)),
  };
}

function deltaPercent(baseline: number, value: number): number {
  if (baseline === 0) return value === 0 ? 0 : 100;
  return round(((value - baseline) / Math.abs(baseline)) * 100);
}

function perturb(input: QualityLabInput, definition: DriverDefinition, value: number): QualityLabInput {
  return { ...input, [definition.id]: value };
}

function priorityRank(priority: SensitivityDriver["verificationPriority"]): number {
  return priority === "critical" ? 0 : priority === "high" ? 1 : 2;
}

export function analyzeQualityLabSensitivity(project: QualityLabProject): SensitivityAnalysis {
  const baselineBlueprint = compileQualityLabBlueprint(project.input);
  const baselineValues = metricValues(baselineBlueprint);
  const metricDefinitions: Array<Omit<SensitivityMetric, "baseline">> = [
    { id: "future-hands-on-hours", label: "Future monthly hands-on hours", unit: "hours" },
    { id: "future-team-fte", label: "Future total team", unit: "fte" },
    { id: "future-capex-high", label: "Future CAPEX high", unit: "usd" },
    { id: "future-opex-high", label: "Future annual OPEX high", unit: "usd" },
    { id: "future-area", label: "Future concept area", unit: "sqm" },
    { id: "peak-resource-utilization", label: "Peak method-resource utilization", unit: "percent" },
  ];
  const metrics = metricDefinitions.map((metric) => ({ ...metric, baseline: baselineValues[metric.id] }));

  const drivers = definitions.filter((definition) => definition.active(project.input)).map((definition): SensitivityDriver => {
    const baselineValue = project.input[definition.id] as number;
    const lowValue = boundedValue(baselineValue, definition, "low");
    const highValue = boundedValue(baselineValue, definition, "high");
    const lowValues = metricValues(compileQualityLabBlueprint(perturb(project.input, definition, lowValue)));
    const highValues = metricValues(compileQualityLabBlueprint(perturb(project.input, definition, highValue)));
    const outcomes = metrics.map((metric): SensitivityOutcome => {
      const lowDeltaPercent = deltaPercent(metric.baseline, lowValues[metric.id]);
      const highDeltaPercent = deltaPercent(metric.baseline, highValues[metric.id]);
      return { metricId: metric.id, low: lowValues[metric.id], high: highValues[metric.id], lowDeltaPercent, highDeltaPercent, swingPercent: round(Math.max(Math.abs(lowDeltaPercent), Math.abs(highDeltaPercent))) };
    });
    const maxOutputSwingPercent = round(Math.max(...outcomes.map((outcome) => outcome.swingPercent)));
    const relatedUnresolved = baselineBlueprint.unresolvedInputs.filter((item) =>
      definition.unresolvedIds.includes(item.id)
      || definition.unresolvedCategories?.includes(item.category)
      || item.relatedRuleIds.some((ruleId) => definition.relatedRuleIds.includes(ruleId))
    );
    const hasBlocking = relatedUnresolved.some((item) => item.severity === "blocking");
    const decisionClass = hasBlocking || maxOutputSwingPercent >= 15 ? "decision-critical" : maxOutputSwingPercent >= 5 ? "material" : "stable-in-tested-range";
    const verificationPriority = (hasBlocking && maxOutputSwingPercent >= 5) || (definition.confidence === "indicative" && maxOutputSwingPercent >= 15)
      ? "critical"
      : decisionClass === "decision-critical" || maxOutputSwingPercent >= 5
        ? "high"
        : "medium";
    return {
      id: definition.id,
      label: definition.label,
      unit: definition.unit,
      baselineValue,
      lowValue,
      highValue,
      perturbationBasis: definition.mode === "scale" ? `Baseline ±${definition.variation * 100}%` : `Baseline ±${definition.variation} ${definition.unit}`,
      modelConfidence: definition.confidence,
      evidenceStatus: "site-evidence-required",
      decisionClass,
      verificationPriority,
      maxOutputSwingPercent,
      outcomes,
      relatedUnresolvedInputIds: relatedUnresolved.map((item) => item.id),
      evidenceNeeded: definition.evidenceNeeded,
      decisionUse: definition.decisionUse,
      relatedRuleIds: definition.relatedRuleIds,
    };
  }).sort((a, b) => b.maxOutputSwingPercent - a.maxOutputSwingPercent || a.label.localeCompare(b.label));

  const verificationQueue = [...drivers].sort((a, b) => priorityRank(a.verificationPriority) - priorityRank(b.verificationPriority) || b.maxOutputSwingPercent - a.maxOutputSwingPercent);
  return {
    generatedAt: new Date().toISOString(),
    engineVersion: QUALITY_LAB_SENSITIVITY_ENGINE_VERSION,
    blueprintEngineVersion: baselineBlueprint.engineVersion,
    project: { id: project.id, name: project.name },
    metrics,
    drivers,
    verificationQueue,
    summary: {
      dominantDriverId: drivers[0]?.id ?? null,
      decisionCriticalCount: drivers.filter((driver) => driver.decisionClass === "decision-critical").length,
      siteEvidenceRequiredCount: drivers.length,
      openBlockingInputCount: baselineBlueprint.dataQuality.blockingOpenCount,
    },
    methodology: [
      "Each driver is changed independently while all other Blueprint inputs remain fixed.",
      "Volume and cost drivers use a ±20% test range; policy and operating-rate drivers use the explicit point or hour range shown.",
      "Impact is the largest absolute percentage movement across the six displayed planning outputs, not a probability or statistical confidence interval.",
      "A stable result only means the compiled outputs did not move materially inside the tested range; it does not prove the input is correct or immaterial outside that range.",
    ],
    ruleTrace: [{
      ruleId: "core.decision.sensitivity",
      ruleVersion: QUALITY_LAB_SENSITIVITY_ENGINE_VERSION,
      name: "One-at-a-time Blueprint sensitivity and evidence-priority screen",
      applicability: "Concept-stage Quality Lab Blueprints compiled with the same executable engine version.",
      limitations: "Does not model interactions, distributions, correlations, schedule events, site validation or regulatory acceptance.",
    }],
    boundary: "This analysis prioritizes which assumptions deserve evidence first. It is not a probabilistic risk model, validated design margin, budget approval, method approval or substitute for site, SME, QA, engineering and regulatory review.",
  };
}
