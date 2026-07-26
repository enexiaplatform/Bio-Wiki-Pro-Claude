import { compileQualityLabBlueprint, type QualityLabBlueprint, type QualityLabInput, type QualityLabProject } from "./quality-lab.js";

export const QUALITY_LAB_SENSITIVITY_ENGINE_VERSION = "sensitivity-confidence/v1.1";
export const QUALITY_LAB_ROBUSTNESS_CONTRACT_VERSION = "quality-lab-robustness/v1";

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
  changeCriterion: string;
  robustnessClass: SensitivityRobustnessClass;
  thresholds: SensitivityThreshold[];
  lineageIds: string[];
}

export type SensitivityRobustnessClass = "fragile-in-tested-range" | "conditional-in-tested-range" | "robust-in-tested-range";

export interface SensitivityThreshold {
  id: string;
  metricId: SensitivityMetricId;
  direction: "low" | "high";
  inputValue: number;
  inputUnit: string;
  outputValue: number;
  outputUnit: SensitivityMetric["unit"];
  distanceFromBaseline: number;
  distancePercentOfTestRange: number;
  criterion: string;
  change: string;
  lineageIds: string[];
  iterations: number;
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
  inputPath: string;
  plannerStep: number;
  lineageIds: string[];
  robustnessClass: SensitivityRobustnessClass;
  robustnessSummary: string;
  nearestThreshold: SensitivityThreshold | null;
  whatToConfirmNext: string;
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
    fragileDriverCount: number;
    conditionalDriverCount: number;
    robustDriverCount: number;
  };
  robustnessContractVersion: string;
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
  plannerStep: number;
};

const definitions: DriverDefinition[] = [
  { id: "finishedBatchesPerMonth", label: "Finished-product batches", unit: "batches/month", mode: "scale", variation: 0.2, min: 0, max: 100_000, plannerStep: 1, active: (i) => i.scope.finishedProducts, confidence: "medium", unresolvedIds: ["finished-batch-demand", "portfolio-demand-reconciliation", "product-profiles", "market-execution-allocation"], evidenceNeeded: "Approved production plan, sampling plan and reconciled product-by-market test allocation.", decisionUse: "Confirms release-test workload, analyst demand and method-linked equipment sizing.", relatedRuleIds: ["micro.workflow.finished-products"] },
  { id: "rawMaterialLotsPerMonth", label: "Raw-material lots", unit: "lots/month", mode: "scale", variation: 0.2, min: 0, max: 100_000, plannerStep: 1, active: (i) => i.scope.rawMaterials, confidence: "indicative", unresolvedIds: ["raw-material-demand"], evidenceNeeded: "Approved material forecast, receipt frequency, skip-lot/reduced-testing rules and sampling plan.", decisionUse: "Confirms incoming-control workload and the value of insource versus outsource options.", relatedRuleIds: ["micro.workflow.raw-materials"] },
  { id: "waterRoundsPerWeek", label: "Water monitoring frequency", unit: "rounds/week", mode: "scale", variation: 0.2, min: 0, max: 21, plannerStep: 1, active: (i) => i.scope.water && i.waterPoints > 0, confidence: "indicative", unresolvedIds: [], unresolvedCategories: ["workload"], evidenceNeeded: "Approved sampling map, point criticality, monitoring frequency and repeat/investigation history.", decisionUse: "Tests sampling, transport and microbiology workload exposure from the water program.", relatedRuleIds: ["micro.workflow.water"] },
  { id: "emRoundsPerWeek", label: "Environmental monitoring frequency", unit: "rounds/week", mode: "scale", variation: 0.2, min: 0, max: 21, plannerStep: 1, active: (i) => i.scope.environmentalMonitoring && i.emLocations > 0, confidence: "indicative", unresolvedIds: [], unresolvedCategories: ["workload"], evidenceNeeded: "Approved EM map, frequencies by state, sample types and investigation/repeat history.", decisionUse: "Tests routine monitoring demand and the risk of under-sizing sampling and incubation capacity.", relatedRuleIds: ["micro.workflow.environmental-monitoring"] },
  { id: "mediaLotsPerMonth", label: "Prepared media lots", unit: "lots/month", mode: "scale", variation: 0.2, min: 0, max: 10_000, plannerStep: 1, active: (i) => i.scope.growthPromotion, confidence: "indicative", unresolvedIds: [], unresolvedCategories: ["workload"], evidenceNeeded: "Media recipes, batch sizes, preparation schedule, growth-promotion design and rejection history.", decisionUse: "Tests media-support effort, autoclave demand and growth-promotion workload.", relatedRuleIds: ["micro.workflow.growth-promotion"] },
  { id: "growthRatePercent", label: "Annual demand growth", unit: "%/year", mode: "add", variation: 10, min: -50, max: 500, plannerStep: 3, active: () => true, confidence: "medium", unresolvedIds: [], unresolvedCategories: ["portfolio", "workload"], evidenceNeeded: "Approved commercial and production forecast with product launches, transfers and scenario ownership.", decisionUse: "Determines how strongly future staffing, area, equipment and budget depend on the planning horizon.", relatedRuleIds: ["core.scenario.growth"] },
  { id: "outsourcePercent", label: "Outsourced workload", unit: "%", mode: "add", variation: 10, min: 0, max: 95, plannerStep: 3, active: () => true, confidence: "high", unresolvedIds: ["market-execution-allocation"], unresolvedCategories: ["method", "workload"], evidenceNeeded: "Approved make/buy scope, qualified laboratory capability, logistics time, investigation ownership and continuity plan.", decisionUse: "Tests the resource relief and retained capability implied by the make-versus-buy decision.", relatedRuleIds: ["core.capacity.people"] },
  { id: "productiveHoursPerShift", label: "Productive analyst hours", unit: "hours/shift", mode: "add", variation: 1, min: 2, max: 12, plannerStep: 3, active: () => true, confidence: "indicative", unresolvedIds: ["skill-shift-coverage"], evidenceNeeded: "Time study separating testing, setup, documentation, meetings, training, deviations and non-routine work.", decisionUse: "Tests whether the staffing result depends on an optimistic productive-time allowance.", relatedRuleIds: ["core.capacity.people"] },
  { id: "redundancyPercent", label: "People resilience reserve", unit: "%", mode: "add", variation: 10, min: 0, max: 100, plannerStep: 3, active: () => true, confidence: "medium", unresolvedIds: ["skill-shift-coverage"], evidenceNeeded: "Shift roster, qualification matrix, leave/absence history, training load and minimum method coverage rules.", decisionUse: "Tests the cost and staffing consequence of the selected resilience policy.", relatedRuleIds: ["core.capacity.people"] },
  { id: "equipmentDowntimePercent", label: "Equipment downtime", unit: "%", mode: "add", variation: 10, min: 0, max: 50, plannerStep: 3, active: () => true, confidence: "medium", unresolvedIds: ["equipment-cycle-data"], evidenceNeeded: "Maintenance, calibration, qualification and failure history plus usable cycle and load geometry by equipment class.", decisionUse: "Tests equipment quantities and utilization against realistic unavailability.", relatedRuleIds: ["core.capacity.equipment"] },
  { id: "consumableWastePercent", label: "Consumable waste allowance", unit: "%", mode: "add", variation: 5, min: 0, max: 50, plannerStep: 3, active: () => true, confidence: "indicative", unresolvedIds: ["consumable-supply-evidence"], evidenceNeeded: "Item-level issue/usage history, rejects, expiry, pack sizes and minimum order quantities.", decisionUse: "Tests inventory and recurring-cost exposure from waste and unusable stock.", relatedRuleIds: ["core.supply.consumables"] },
  { id: "analystAnnualCostUsd", label: "Loaded analyst cost", unit: "USD/FTE-year", mode: "scale", variation: 0.2, min: 0, max: 500_000, plannerStep: 3, active: () => true, confidence: "indicative", unresolvedIds: ["local-cost-basis"], evidenceNeeded: "Approved loaded labor cost by role, shift premium, benefits, contractor assumptions and inflation basis.", decisionUse: "Tests the labor component of annual operating cost.", relatedRuleIds: ["core.cost.concept"] },
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

function robustnessRank(value: SensitivityRobustnessClass): number {
  return value === "fragile-in-tested-range" ? 0 : value === "conditional-in-tested-range" ? 1 : 2;
}

function metricCriterion(metricId: SensitivityMetricId, baseline: number): string {
  if (metricId === "future-team-fte") return "A different whole-FTE planning band";
  if (metricId === "future-capex-high") return `At least ${round(Math.max(50_000, Math.abs(baseline) * 0.1), 0)} USD or 10% from baseline`;
  if (metricId === "future-opex-high") return `At least ${round(Math.max(25_000, Math.abs(baseline) * 0.1), 0)} USD or 10% from baseline`;
  if (metricId === "future-area") return `At least ${round(Math.max(10, Math.abs(baseline) * 0.1), 1)} m² or 10% from baseline`;
  if (metricId === "future-hands-on-hours") return `At least ${round(Math.max(40, Math.abs(baseline) * 0.1), 1)} hours/month or 10% from baseline`;
  return "A crossing of the 70%, 85% or 100% resource-utilization planning band";
}

function utilizationBand(value: number): number {
  if (value >= 100) return 3;
  if (value >= 85) return 2;
  if (value >= 70) return 1;
  return 0;
}

function isDecisionChange(metricId: SensitivityMetricId, baseline: number, candidate: number): boolean {
  if (metricId === "future-team-fte") return Math.ceil(Math.max(0, candidate) - 1e-9) !== Math.ceil(Math.max(0, baseline) - 1e-9);
  if (metricId === "peak-resource-utilization") return utilizationBand(candidate) !== utilizationBand(baseline);
  const absoluteFloor = metricId === "future-capex-high" ? 50_000
    : metricId === "future-opex-high" ? 25_000
      : metricId === "future-area" ? 10
        : 40;
  return Math.abs(candidate - baseline) + 1e-9 >= Math.max(absoluteFloor, Math.abs(baseline) * 0.1);
}

function lineageIdsForMetric(metricId: SensitivityMetricId, blueprint: QualityLabBlueprint): string[] {
  const fixed: Partial<Record<SensitivityMetricId, string>> = {
    "future-team-fte": "decision:staffing:future-total-team-fte",
    "future-capex-high": "decision:capex:future-high",
    "future-opex-high": "decision:opex:future-high",
    "future-area": "decision:space:future-area",
  };
  const fixedId = fixed[metricId];
  if (fixedId && blueprint.decisionLineage.some((item) => item.id === fixedId)) return [fixedId];
  if (metricId === "peak-resource-utilization") {
    return blueprint.decisionLineage.filter((item) => item.id.startsWith("decision:equipment:")).map((item) => item.id);
  }
  return [];
}

function thresholdChange(metric: SensitivityMetric, outputValue: number): string {
  if (metric.id === "future-team-fte") return `${round(metric.baseline)} to ${round(outputValue)} FTE crosses a whole-team planning band`;
  if (metric.id === "peak-resource-utilization") return `${round(metric.baseline)}% to ${round(outputValue)}% crosses a utilization planning band`;
  const direction = outputValue >= metric.baseline ? "increases" : "decreases";
  const unit = metric.unit === "usd" ? "USD" : metric.unit === "sqm" ? "m²" : "hours/month";
  return `${metric.label} ${direction} from ${round(metric.baseline)} to ${round(outputValue)} ${unit}`;
}

function findThreshold(
  project: QualityLabProject,
  definition: DriverDefinition,
  metric: SensitivityMetric,
  direction: "low" | "high",
  endpointValue: number,
  endpointOutput: number,
  lineageIds: string[],
  valuesAt: (value: number) => Record<SensitivityMetricId, number>,
): SensitivityThreshold | null {
  const baselineInput = project.input[definition.id] as number;
  if (endpointValue === baselineInput || !isDecisionChange(metric.id, metric.baseline, endpointOutput)) return null;

  let unchangedInput = baselineInput;
  let changedInput = endpointValue;
  let changedOutput = endpointOutput;
  let iterations = 0;
  for (; iterations < 14; iterations += 1) {
    const candidateInput = round((unchangedInput + changedInput) / 2, 4);
    if (candidateInput === unchangedInput || candidateInput === changedInput) break;
    const candidateOutput = valuesAt(candidateInput)[metric.id];
    if (isDecisionChange(metric.id, metric.baseline, candidateOutput)) {
      changedInput = candidateInput;
      changedOutput = candidateOutput;
    } else {
      unchangedInput = candidateInput;
    }
  }
  const testedDistance = Math.abs(endpointValue - baselineInput);
  return {
    id: `${definition.id}:${metric.id}:${direction}`,
    metricId: metric.id,
    direction,
    inputValue: round(changedInput, 2),
    inputUnit: definition.unit,
    outputValue: round(changedOutput, 2),
    outputUnit: metric.unit,
    distanceFromBaseline: round(Math.abs(changedInput - baselineInput), 2),
    distancePercentOfTestRange: testedDistance === 0 ? 0 : round((Math.abs(changedInput - baselineInput) / testedDistance) * 100, 1),
    criterion: metricCriterion(metric.id, metric.baseline),
    change: thresholdChange(metric, changedOutput),
    lineageIds,
    iterations,
  };
}

function classifyRobustness(thresholds: SensitivityThreshold[]): SensitivityRobustnessClass {
  if (thresholds.length === 0) return "robust-in-tested-range";
  const nearest = Math.min(...thresholds.map((item) => item.distancePercentOfTestRange));
  return nearest <= 33 ? "fragile-in-tested-range" : "conditional-in-tested-range";
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
    const compiledValueCache = new Map<number, Record<SensitivityMetricId, number>>();
    const valuesAt = (value: number) => {
      const cached = compiledValueCache.get(value);
      if (cached) return cached;
      const values = metricValues(compileQualityLabBlueprint(perturb(project.input, definition, value)));
      compiledValueCache.set(value, values);
      return values;
    };
    const lowValues = valuesAt(lowValue);
    const highValues = valuesAt(highValue);
    const outcomes = metrics.map((metric): SensitivityOutcome => {
      const lowDeltaPercent = deltaPercent(metric.baseline, lowValues[metric.id]);
      const highDeltaPercent = deltaPercent(metric.baseline, highValues[metric.id]);
      const lineageIds = lineageIdsForMetric(metric.id, baselineBlueprint);
      const thresholds = ([
        findThreshold(project, definition, metric, "low", lowValue, lowValues[metric.id], lineageIds, valuesAt),
        findThreshold(project, definition, metric, "high", highValue, highValues[metric.id], lineageIds, valuesAt),
      ] satisfies Array<SensitivityThreshold | null>).filter((item): item is SensitivityThreshold => item !== null);
      return {
        metricId: metric.id,
        low: lowValues[metric.id],
        high: highValues[metric.id],
        lowDeltaPercent,
        highDeltaPercent,
        swingPercent: round(Math.max(Math.abs(lowDeltaPercent), Math.abs(highDeltaPercent))),
        changeCriterion: metricCriterion(metric.id, metric.baseline),
        robustnessClass: classifyRobustness(thresholds),
        thresholds,
        lineageIds,
      };
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
    const thresholds = outcomes.flatMap((outcome) => outcome.thresholds);
    const robustnessClass = classifyRobustness(thresholds);
    const nearestThreshold = [...thresholds].sort((a, b) => a.distancePercentOfTestRange - b.distancePercentOfTestRange || a.id.localeCompare(b.id))[0] ?? null;
    const lineageIds = Array.from(new Set(outcomes.flatMap((outcome) => outcome.lineageIds)));
    const robustnessSummary = robustnessClass === "robust-in-tested-range"
      ? "No displayed planning output crossed its stated decision-change criterion inside this one-at-a-time test range."
      : robustnessClass === "fragile-in-tested-range"
        ? "At least one displayed decision changes within the nearest third of the tested input range."
        : "A displayed decision changes inside the tested range, but not close to the current input value.";
    const whatToConfirmNext = nearestThreshold
      ? `Confirm ${definition.label.toLowerCase()} before freezing the affected decision; the nearest tested change occurs around ${nearestThreshold.inputValue} ${definition.unit}.`
      : `Confirm the current site basis for ${definition.label.toLowerCase()}; no displayed decision threshold was found inside ${lowValue}–${highValue} ${definition.unit}.`;
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
      inputPath: definition.id,
      plannerStep: definition.plannerStep,
      lineageIds,
      robustnessClass,
      robustnessSummary,
      nearestThreshold,
      whatToConfirmNext,
    };
  }).sort((a, b) => b.maxOutputSwingPercent - a.maxOutputSwingPercent || a.label.localeCompare(b.label));

  const verificationQueue = [...drivers].sort((a, b) => robustnessRank(a.robustnessClass) - robustnessRank(b.robustnessClass) || priorityRank(a.verificationPriority) - priorityRank(b.verificationPriority) || b.maxOutputSwingPercent - a.maxOutputSwingPercent);
  return {
    generatedAt: new Date().toISOString(),
    engineVersion: QUALITY_LAB_SENSITIVITY_ENGINE_VERSION,
    blueprintEngineVersion: baselineBlueprint.engineVersion,
    project: { id: project.id, name: project.name },
    robustnessContractVersion: QUALITY_LAB_ROBUSTNESS_CONTRACT_VERSION,
    metrics,
    drivers,
    verificationQueue,
    summary: {
      dominantDriverId: drivers[0]?.id ?? null,
      decisionCriticalCount: drivers.filter((driver) => driver.decisionClass === "decision-critical").length,
      siteEvidenceRequiredCount: drivers.length,
      openBlockingInputCount: baselineBlueprint.dataQuality.blockingOpenCount,
      fragileDriverCount: drivers.filter((driver) => driver.robustnessClass === "fragile-in-tested-range").length,
      conditionalDriverCount: drivers.filter((driver) => driver.robustnessClass === "conditional-in-tested-range").length,
      robustDriverCount: drivers.filter((driver) => driver.robustnessClass === "robust-in-tested-range").length,
    },
    methodology: [
      "Each driver is changed independently while all other Blueprint inputs remain fixed.",
      "Volume and cost drivers use a ±20% test range; policy and operating-rate drivers use the explicit point or hour range shown.",
      "Impact is the largest absolute percentage movement across the six displayed planning outputs, not a probability or statistical confidence interval.",
      "For each input direction, a bounded 14-step search locates the nearest value that crosses the displayed output's explicit decision-change criterion.",
      "Fragile means a threshold lies within the nearest third of the tested input range; conditional means a threshold lies farther away; robust means no threshold was found inside that tested range.",
      "A stable result only means the compiled outputs did not move materially inside the tested range; it does not prove the input is correct or immaterial outside that range.",
    ],
    ruleTrace: [{
      ruleId: "core.decision.sensitivity",
      ruleVersion: QUALITY_LAB_SENSITIVITY_ENGINE_VERSION,
      name: "One-at-a-time Blueprint sensitivity, decision-threshold and evidence-priority screen",
      applicability: "Concept-stage Quality Lab Blueprints compiled with the same executable engine version.",
      limitations: "Threshold search assumes a usable one-direction change inside each bounded one-at-a-time range. It does not model interactions, distributions, correlations, schedule events, site validation or regulatory acceptance.",
    }],
    boundary: "This analysis prioritizes which assumptions deserve evidence first. It is not a probabilistic risk model, validated design margin, budget approval, method approval or substitute for site, SME, QA, engineering and regulatory review.",
  };
}
