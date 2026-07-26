import { z } from "zod";
import { decisionLineageSchema, evidenceRecordSchema, ruleTraceSchema, type DecisionLineage, type EvidenceRecord, type RuleTrace } from "./quality-lab-contract.js";
import type { QualityLabProject } from "./quality-lab.js";

export const QUALITY_LAB_OPERATING_MODEL_INPUT_VERSION = "quality-lab-operating-model-input/v1" as const;
export const QUALITY_LAB_OPERATING_MODEL_VERSION = "quality-lab-operating-model/v1" as const;
export const QUALITY_LAB_OPERATING_MODEL_RULE_VERSION = "v1.0" as const;

export const operatingModeValues = ["insource", "outsource", "hybrid", "evidence-required"] as const;
const unknownBooleanValues = ["unknown", "yes", "no"] as const;

export const qualityLabOperatingModelApplicationInputSchema = z.object({
  applicationId: z.string().min(1),
  externalPricePerTestUsd: z.number().positive().max(1_000_000).nullable(),
  externalTurnaroundDays: z.number().positive().max(365).nullable(),
  sampleHoldTimeDays: z.number().positive().max(365).nullable(),
  methodTransferCostUsd: z.number().min(0).max(100_000_000).nullable(),
  internalCapability: z.enum(["unknown", "concept-modeled", "confirmed", "not-available"]),
  methodReadiness: z.enum(["unknown", "ready", "not-required", "transfer-required", "validation-required"]),
  externalLabQualified: z.enum(unknownBooleanValues),
  backupExternalCoverage: z.enum(unknownBooleanValues),
  dataAccess: z.enum(["unknown", "full", "limited"]),
  investigationResponsiveness: z.enum(["unknown", "internal-faster", "comparable", "external-faster"]),
  surgeCapacity: z.enum(["unknown", "internal", "external", "both", "neither"]),
  continuityPriority: z.enum(["standard", "high", "critical"]),
  strategicControl: z.enum(["standard", "high", "critical"]),
  confidentiality: z.enum(["standard", "sensitive", "highly-sensitive"]),
  note: z.string().max(1000).default(""),
});

export const qualityLabOperatingModelInputSchema = z.object({
  contractVersion: z.literal(QUALITY_LAB_OPERATING_MODEL_INPUT_VERSION),
  projectId: z.string().min(1),
  projectRevision: z.string().datetime(),
  assetLifeYears: z.number().int().min(1).max(30),
  applications: z.array(qualityLabOperatingModelApplicationInputSchema),
  updatedAt: z.string().datetime(),
});

const missingEvidenceSchema = z.object({
  id: z.string().min(1),
  field: z.string().min(1),
  question: z.string().min(1),
  whyItMatters: z.string().min(1),
  evidenceNeeded: z.string().min(1),
  blocking: z.boolean(),
});

const economicsSchema = z.object({
  currency: z.literal("USD"),
  monthlyDemand: z.number().min(0),
  allocatedCapexLowUsd: z.number().min(0),
  allocatedCapexHighUsd: z.number().min(0),
  internalOpexPerTestLowUsd: z.number().min(0),
  internalOpexPerTestHighUsd: z.number().min(0),
  annualizedFixedCostLowUsd: z.number().min(0),
  annualizedFixedCostHighUsd: z.number().min(0),
  annualInternalCostLowUsd: z.number().min(0),
  annualInternalCostHighUsd: z.number().min(0),
  annualExternalCostUsd: z.number().min(0).nullable(),
  firstYearExternalCostUsd: z.number().min(0).nullable(),
  breakEvenMonthlyLow: z.number().min(0).nullable(),
  breakEvenMonthlyHigh: z.number().min(0).nullable(),
  economicPosition: z.enum(["insource-favored", "outsource-favored", "overlap-or-uncertain", "not-calculable"]),
  basis: z.string().min(1),
  limitations: z.array(z.string().min(1)).min(1),
});

const operatingModelApplicationSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  scope: z.string().min(1),
  source: z.enum(["method-application", "workflow-application"]),
  currentExecution: z.enum(["in-house", "outsource", "hybrid"]),
  recommendedMode: z.enum(operatingModeValues),
  decisionStatus: z.enum(["decision-basis-available", "material-evidence-missing"]),
  monthlyDemand: z.number().min(0),
  demandStatus: z.enum(["allocated", "unresolved"]),
  targetTurnaroundDays: z.number().positive(),
  criticality: z.enum(["routine", "important", "critical"]),
  methodRequirementIds: z.array(z.string()),
  workflowIds: z.array(z.string()),
  methodIds: z.array(z.string()),
  ruleIds: z.array(z.string()),
  evidenceIds: z.array(z.string()),
  economics: economicsSchema,
  economicBasis: z.string().min(1),
  operationalBasis: z.string().min(1),
  qualityControlBasis: z.string().min(1),
  decisionDrivers: z.array(z.string().min(1)).min(1),
  majorRisks: z.array(z.string().min(1)),
  assumptions: z.array(z.string().min(1)).min(1),
  missingEvidence: z.array(missingEvidenceSchema),
  sensitivityDrivers: z.array(z.object({ id: z.string(), label: z.string(), currentValue: z.string(), decisionChange: z.string(), evidenceNeeded: z.string() })).min(1),
  relatedBlueprintLineageIds: z.array(z.string()),
  lineage: decisionLineageSchema,
});

export const qualityLabOperatingModelAnalysisSchema = z.object({
  contractVersion: z.literal(QUALITY_LAB_OPERATING_MODEL_VERSION),
  inputContractVersion: z.literal(QUALITY_LAB_OPERATING_MODEL_INPUT_VERSION),
  generatedAt: z.string().datetime(),
  project: z.object({ id: z.string(), name: z.string(), revision: z.string().datetime() }),
  sourceVersions: z.object({ inputContract: z.string(), outputContract: z.string(), compilerCore: z.string(), blueprintEngine: z.string(), domainPack: z.string() }),
  applications: z.array(operatingModelApplicationSchema),
  ruleTrace: z.array(ruleTraceSchema),
  evidence: z.array(evidenceRecordSchema),
  summary: z.object({ insource: z.number().int().min(0), outsource: z.number().int().min(0), hybrid: z.number().int().min(0), evidenceRequired: z.number().int().min(0) }),
  boundary: z.string().min(1),
});

export type QualityLabOperatingModelApplicationInput = z.infer<typeof qualityLabOperatingModelApplicationInputSchema>;
export type QualityLabOperatingModelInput = z.infer<typeof qualityLabOperatingModelInputSchema>;
export type QualityLabOperatingModelAnalysis = z.infer<typeof qualityLabOperatingModelAnalysisSchema>;
export type QualityLabOperatingModelApplication = QualityLabOperatingModelAnalysis["applications"][number];

type ApplicationBasis = {
  id: string;
  label: string;
  scope: string;
  source: "method-application" | "workflow-application";
  currentExecution: "in-house" | "outsource" | "hybrid";
  monthlyDemand: number;
  demandStatus: "allocated" | "unresolved";
  targetTurnaroundDays: number;
  criticality: "routine" | "important" | "critical";
  monthlyHandsOnHours: number;
  methodRequirementIds: string[];
  workflowIds: string[];
  methodIds: string[];
  ruleIds: string[];
  evidenceIds: string[];
  defaultMethodReadiness: QualityLabOperatingModelApplicationInput["methodReadiness"];
};

const operatingModelRules: RuleTrace[] = [
  {
    ruleId: "quality-lab.operating-model.application",
    ruleVersion: QUALITY_LAB_OPERATING_MODEL_RULE_VERSION,
    name: "Application-level operating-model decision",
    domainPackId: "compiler-core",
    outputTypes: ["operating-model"],
    evidenceIds: ["project-inputs"],
    applicability: "One application with allocated demand and explicit economic, operational, quality and control inputs.",
    confidence: "medium",
    limitations: "Deterministic planning logic only; it does not qualify a laboratory, approve a method, guarantee cost or make a procurement award.",
    reviewRequired: true,
  },
  {
    ruleId: "quality-lab.operating-model.break-even",
    ruleVersion: QUALITY_LAB_OPERATING_MODEL_RULE_VERSION,
    name: "Bounded steady-state break-even range",
    domainPackId: "compiler-core",
    outputTypes: ["operating-model", "cost"],
    evidenceIds: ["project-inputs", "vendor-budget-evidence"],
    applicability: "Applications with positive demand, an external price and a positive external-price-minus-internal-OPEX contribution margin.",
    confidence: "indicative",
    limitations: "Uses allocated concept CAPEX, modeled Blueprint OPEX and straight-line asset life. It excludes discounting, tax, working capital, overhead allocation and quoted contract terms.",
    reviewRequired: true,
  },
];

function round(value: number, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function deriveApplications(project: QualityLabProject): ApplicationBasis[] {
  const { blueprint, input } = project;
  const groups = new Map<string, ApplicationBasis>();
  for (const requirement of blueprint.methodRequirements.filter((item) => item.requirementType !== "method-suitability")) {
    const id = `method:${requirement.productId}:${requirement.methodId}`;
    const product = input.productProfiles.find((item) => item.id === requirement.productId);
    const readiness = product?.methodSuitability === "verified" ? "ready"
      : product?.methodSuitability === "not-required" ? "not-required"
        : product?.methodSuitability === "pending" ? "validation-required" : "unknown";
    const existing = groups.get(id) ?? {
      id,
      label: `${requirement.productName} — ${requirement.methodName}`,
      scope: `Application-level ${requirement.requirementType.replaceAll("-", " ")} basis across the selected markets.`,
      source: "method-application" as const,
      currentExecution: requirement.execution,
      monthlyDemand: 0,
      demandStatus: "allocated" as const,
      targetTurnaroundDays: input.targetTurnaroundDays,
      criticality: "critical" as const,
      monthlyHandsOnHours: 0,
      methodRequirementIds: [],
      workflowIds: blueprint.workflows.some((item) => item.id === "finishedProducts") ? ["finishedProducts"] : [],
      methodIds: [],
      ruleIds: ["micro.workflow.finished-products"],
      evidenceIds: [],
      defaultMethodReadiness: readiness,
    };
    existing.monthlyDemand += requirement.operationalDemandStatus === "allocated" ? requirement.allocatedMonthlyExecutions : requirement.monthlyExecutions;
    if (requirement.operationalDemandStatus === "unresolved") existing.demandStatus = "unresolved";
    if (existing.currentExecution !== requirement.execution) existing.currentExecution = "hybrid";
    existing.methodRequirementIds.push(requirement.id);
    existing.methodIds.push(requirement.methodId);
    existing.evidenceIds.push(...requirement.evidenceIds);
    existing.monthlyHandsOnHours += blueprint.methodCapacity.filter((item) => item.methodRequirementId === requirement.id && item.unit === "hands-on-hours").reduce((total, item) => total + item.monthlyDemand, 0);
    groups.set(id, existing);
  }

  const insourceFactor = Math.max(0.05, 1 - input.outsourcePercent / 100);
  for (const workflow of blueprint.workflows) {
    if (workflow.id === "finishedProducts" && groups.size > 0) continue;
    groups.set(`workflow:${workflow.id}`, {
      id: `workflow:${workflow.id}`,
      label: workflow.label,
      scope: workflow.basis,
      source: "workflow-application",
      currentExecution: input.outsourcePercent === 0 ? "in-house" : input.outsourcePercent >= 95 ? "outsource" : "hybrid",
      monthlyDemand: round(workflow.monthlyUnits / insourceFactor, 1),
      demandStatus: "allocated",
      targetTurnaroundDays: Math.min(input.targetTurnaroundDays, workflow.turnaroundDays),
      criticality: workflow.criticality,
      monthlyHandsOnHours: round(workflow.monthlyHandsOnHours / insourceFactor, 1),
      methodRequirementIds: [],
      workflowIds: [workflow.id],
      methodIds: [],
      ruleIds: [workflow.ruleId],
      evidenceIds: [...workflow.evidenceIds],
      defaultMethodReadiness: "unknown",
    });
  }
  return Array.from(groups.values()).map((item) => ({ ...item, monthlyDemand: round(item.monthlyDemand, 1), monthlyHandsOnHours: round(item.monthlyHandsOnHours, 1), methodRequirementIds: unique(item.methodRequirementIds), methodIds: unique(item.methodIds), evidenceIds: unique(item.evidenceIds) })).sort((a, b) => a.label.localeCompare(b.label));
}

function defaultApplicationInput(application: ApplicationBasis): QualityLabOperatingModelApplicationInput {
  return {
    applicationId: application.id,
    externalPricePerTestUsd: null,
    externalTurnaroundDays: null,
    sampleHoldTimeDays: null,
    methodTransferCostUsd: null,
    internalCapability: application.currentExecution === "outsource" ? "unknown" : "concept-modeled",
    methodReadiness: application.defaultMethodReadiness,
    externalLabQualified: "unknown",
    backupExternalCoverage: "unknown",
    dataAccess: "unknown",
    investigationResponsiveness: "unknown",
    surgeCapacity: "unknown",
    continuityPriority: application.criticality === "critical" ? "critical" : application.criticality === "important" ? "high" : "standard",
    strategicControl: application.criticality === "critical" ? "high" : "standard",
    confidentiality: "standard",
    note: "",
  };
}

export function createQualityLabOperatingModelInput(project: QualityLabProject, previous?: unknown, now = new Date().toISOString()): QualityLabOperatingModelInput {
  const applications = deriveApplications(project);
  const parsed = qualityLabOperatingModelInputSchema.safeParse(previous);
  const previousById = new Map(parsed.success ? parsed.data.applications.map((item) => [item.applicationId, item]) : []);
  return qualityLabOperatingModelInputSchema.parse({
    contractVersion: QUALITY_LAB_OPERATING_MODEL_INPUT_VERSION,
    projectId: project.id,
    projectRevision: project.updatedAt,
    assetLifeYears: parsed.success && parsed.data.projectId === project.id ? parsed.data.assetLifeYears : 7,
    applications: applications.map((application) => ({ ...defaultApplicationInput(application), ...(previousById.get(application.id) ?? {}), applicationId: application.id })),
    updatedAt: now,
  });
}

function missing(id: string, field: string, question: string, whyItMatters: string, evidenceNeeded: string, blocking = true) {
  return { id, field, question, whyItMatters, evidenceNeeded, blocking };
}

function analyzeApplication(project: QualityLabProject, basis: ApplicationBasis, input: QualityLabOperatingModelApplicationInput, assetLifeYears: number, costShare: number): QualityLabOperatingModelApplication {
  const blueprint = project.blueprint;
  const monthlyDemand = basis.monthlyDemand;
  const totalMonthlyTests = Math.max(1, blueprint.current.monthlyTests);
  const variableLow = round(blueprint.current.annualOpexLowUsd / (totalMonthlyTests * 12));
  const variableHigh = round(blueprint.current.annualOpexHighUsd / (totalMonthlyTests * 12));
  const allocatedCapexLow = round(blueprint.current.capexLowUsd * costShare);
  const allocatedCapexHigh = round(blueprint.current.capexHighUsd * costShare);
  const annualizedFixedLow = round(allocatedCapexLow / assetLifeYears);
  const annualizedFixedHigh = round(allocatedCapexHigh / assetLifeYears);
  const annualInternalLow = round(annualizedFixedLow + variableLow * monthlyDemand * 12);
  const annualInternalHigh = round(annualizedFixedHigh + variableHigh * monthlyDemand * 12);
  const externalPrice = input.externalPricePerTestUsd;
  const annualExternal = externalPrice === null ? null : round(externalPrice * monthlyDemand * 12);
  const firstYearExternal = annualExternal === null ? null : round(annualExternal + (input.methodTransferCostUsd ?? 0));
  const breakEvenLow = externalPrice !== null && externalPrice > variableLow ? round(annualizedFixedLow / (12 * (externalPrice - variableLow)), 1) : null;
  const breakEvenHigh = externalPrice !== null && externalPrice > variableHigh ? round(annualizedFixedHigh / (12 * (externalPrice - variableHigh)), 1) : null;
  const normalizedBreakEven = [breakEvenLow, breakEvenHigh].filter((value): value is number => value !== null).sort((a, b) => a - b);
  const lowThreshold = normalizedBreakEven[0] ?? null;
  const highThreshold = normalizedBreakEven.at(-1) ?? null;
  const economicPosition = externalPrice === null || lowThreshold === null ? "not-calculable"
    : monthlyDemand < lowThreshold ? "outsource-favored"
      : highThreshold !== null && monthlyDemand > highThreshold ? "insource-favored" : "overlap-or-uncertain";

  const missingEvidence: ReturnType<typeof missing>[] = [];
  const prefix = `operating-model:${basis.id}`;
  if (basis.demandStatus === "unresolved" || monthlyDemand <= 0) missingEvidence.push(missing(`${prefix}:demand`, "monthlyDemand", "What physical test demand belongs to this application?", "Break-even and capacity comparisons require allocated physical executions, not duplicated regulatory traces.", "Approved forecast and market-to-physical-test allocation."));
  if (externalPrice === null) missingEvidence.push(missing(`${prefix}:external-price`, "externalPricePerTestUsd", "What is the comparable external price per reportable test?", "Without a scoped price Atlas cannot calculate steady-state or first-year external cost.", "Current laboratory quotation with included tests, controls, repeats, data package, currency and validity."));
  if (input.externalTurnaroundDays === null) missingEvidence.push(missing(`${prefix}:external-tat`, "externalTurnaroundDays", "What is the external end-to-end turnaround?", "Release impact depends on collection, transport, queue, execution, review and data return—not bench time alone.", "Qualified provider service level and actual end-to-end performance."));
  if (input.sampleHoldTimeDays === null) missingEvidence.push(missing(`${prefix}:sample-hold`, "sampleHoldTimeDays", "What sample stability or hold-time limit constrains transport and queue time?", "An economically attractive outsource route may be infeasible if the sample cannot remain representative.", "Approved sample stability, hold-time or transport study."));
  if (input.internalCapability === "unknown") missingEvidence.push(missing(`${prefix}:internal-capability`, "internalCapability", "Can the site establish the required internal capability?", "An outsource comparison is incomplete without a feasible internal counterfactual.", "Site method, skill, equipment, utility and qualification feasibility review."));
  if (input.methodReadiness === "unknown") missingEvidence.push(missing(`${prefix}:method-readiness`, "methodReadiness", "What method transfer, suitability or validation work is required?", "The operating mode cannot be separated from the method state and accountable method owner.", "Approved method status and transfer/suitability/validation gap assessment."));
  if (["transfer-required", "validation-required"].includes(input.methodReadiness) && input.methodTransferCostUsd === null) missingEvidence.push(missing(`${prefix}:transfer-cost`, "methodTransferCostUsd", "What one-time method transfer or validation cost belongs to the external route?", "First-year comparison must not hide method establishment costs.", "Scoped transfer, suitability, validation, protocol, material and review cost."));
  if (input.externalLabQualified === "unknown") missingEvidence.push(missing(`${prefix}:external-qualification`, "externalLabQualified", "Is the external laboratory qualified for this exact application?", "Commercial availability is not evidence of quality-system, method, scope or data-package suitability.", "Current qualification evidence, scope, audit status and quality agreement."));
  if (input.backupExternalCoverage === "unknown") missingEvidence.push(missing(`${prefix}:backup-coverage`, "backupExternalCoverage", "Is qualified backup external coverage available?", "Continuity and surge claims depend on an alternate route with the same approved scope.", "Qualified backup laboratory evidence and activation lead time."));
  if (input.dataAccess === "unknown") missingEvidence.push(missing(`${prefix}:data-access`, "dataAccess", "What raw data, audit trail and investigation evidence will the site receive?", "Release and investigation control can change even when price and routine TAT are acceptable.", "Quality agreement and example data/review package."));
  if (input.investigationResponsiveness === "unknown") missingEvidence.push(missing(`${prefix}:investigation-response`, "investigationResponsiveness", "Which route resolves atypical, OOS and invalid results faster?", "Routine turnaround does not represent investigation responsiveness or decision ownership.", "Actual investigation timelines, roles, escalation and sample-retention evidence."));
  if (input.surgeCapacity === "unknown") missingEvidence.push(missing(`${prefix}:surge-capacity`, "surgeCapacity", "Where is qualified surge capacity available?", "Demand variability, outages and investigations can reverse a steady-state cost conclusion.", "Demonstrated qualified surge capacity and activation constraints."));

  const majorRisks: string[] = [];
  const drivers: string[] = [];
  let insourceSignal = 0;
  let outsourceSignal = 0;
  let hybridSignal = 0;
  if (economicPosition === "insource-favored") { insourceSignal += 2; drivers.push("Current demand is above the modeled break-even range."); }
  if (economicPosition === "outsource-favored") { outsourceSignal += 2; drivers.push("Current demand is below the modeled break-even range."); }
  if (economicPosition === "overlap-or-uncertain") { hybridSignal += 2; drivers.push("Current demand sits inside or near the modeled break-even range."); }
  if (input.externalTurnaroundDays !== null && input.externalTurnaroundDays > basis.targetTurnaroundDays) { insourceSignal += 2; majorRisks.push("External end-to-end turnaround exceeds the Blueprint target."); }
  if (input.externalTurnaroundDays !== null && input.sampleHoldTimeDays !== null && input.externalTurnaroundDays >= input.sampleHoldTimeDays) { insourceSignal += 3; majorRisks.push("External turnaround reaches or exceeds the declared sample hold-time limit."); }
  if (input.externalLabQualified === "no") { insourceSignal += 4; majorRisks.push("The external laboratory is not qualified for the declared application."); }
  if (input.internalCapability === "not-available") { outsourceSignal += 4; majorRisks.push("Internal capability is declared unavailable at the current project boundary."); }
  if (input.backupExternalCoverage === "no" && input.continuityPriority !== "standard") { insourceSignal += 1; hybridSignal += 2; majorRisks.push("No qualified external backup is available for a high-continuity application."); }
  if (input.dataAccess === "limited" && input.strategicControl !== "standard") { insourceSignal += 2; hybridSignal += 1; majorRisks.push("Limited external data access conflicts with the declared strategic-control need."); }
  if (input.investigationResponsiveness === "internal-faster") insourceSignal += 2;
  if (input.investigationResponsiveness === "external-faster") outsourceSignal += 2;
  if (input.surgeCapacity === "both") hybridSignal += 2;
  if (input.surgeCapacity === "internal") insourceSignal += 1;
  if (input.surgeCapacity === "external") outsourceSignal += 1;
  if (input.surgeCapacity === "neither") majorRisks.push("Neither route has declared qualified surge capacity.");
  if (input.confidentiality === "highly-sensitive") insourceSignal += 2;
  if (input.confidentiality === "sensitive") hybridSignal += 1;
  if (["transfer-required", "validation-required"].includes(input.methodReadiness)) { hybridSignal += 2; majorRisks.push("Method establishment work creates a transition period before the target mode is available."); }

  const impossibleRoute = input.internalCapability === "not-available" && input.externalLabQualified === "no";
  if (impossibleRoute) missingEvidence.push(missing(`${prefix}:feasible-route`, "feasibleRoute", "What qualified execution route can be made available?", "Both internal and external routes are currently declared infeasible.", "Approved remediation plan with accountable owner, timing and release contingency."));
  const blockingEvidence = missingEvidence.filter((item) => item.blocking);
  let recommendedMode: QualityLabOperatingModelApplication["recommendedMode"] = "evidence-required";
  if (blockingEvidence.length === 0) {
    if (input.internalCapability === "not-available") recommendedMode = "outsource";
    else if (input.externalLabQualified === "no") recommendedMode = "insource";
    else if (hybridSignal >= Math.max(insourceSignal, outsourceSignal)) recommendedMode = "hybrid";
    else if (insourceSignal >= outsourceSignal + 2) recommendedMode = "insource";
    else if (outsourceSignal >= insourceSignal + 2) recommendedMode = "outsource";
    else recommendedMode = "hybrid";
  }
  if (drivers.length === 0) drivers.push("Economic direction remains open until the external price produces a comparable break-even basis.");
  if (input.externalTurnaroundDays !== null) drivers.push(`External end-to-end turnaround is ${input.externalTurnaroundDays} days against a ${basis.targetTurnaroundDays}-day Blueprint target.`);
  drivers.push(`Continuity priority is ${input.continuityPriority}; strategic control is ${input.strategicControl}.`);

  const economics = {
    currency: "USD" as const,
    monthlyDemand,
    allocatedCapexLowUsd: allocatedCapexLow,
    allocatedCapexHighUsd: allocatedCapexHigh,
    internalOpexPerTestLowUsd: variableLow,
    internalOpexPerTestHighUsd: variableHigh,
    annualizedFixedCostLowUsd: annualizedFixedLow,
    annualizedFixedCostHighUsd: annualizedFixedHigh,
    annualInternalCostLowUsd: annualInternalLow,
    annualInternalCostHighUsd: annualInternalHigh,
    annualExternalCostUsd: annualExternal,
    firstYearExternalCostUsd: firstYearExternal,
    breakEvenMonthlyLow: lowThreshold,
    breakEvenMonthlyHigh: highThreshold,
    economicPosition,
    basis: `Allocated ${round(costShare * 100, 1)}% of current concept CAPEX by application workload weight; annualized over ${assetLifeYears} years. Internal running cost uses current Blueprint annual OPEX divided by compiled monthly tests.`,
    limitations: ["Concept allocation, not an accounting standard or supplier quotation.", "Break-even is steady-state and undiscounted; first-year external cost shows the declared transfer cost separately.", "Local taxes, overhead, working capital, repeat/OOS frequency, escalation and contract minimums are excluded."],
  };
  const economicBasis = externalPrice === null ? "Economic comparison is not calculable until a comparable external price is recorded."
    : lowThreshold === null ? `External price ${externalPrice} USD/test does not exceed the modeled internal running-cost floor; no positive steady-state break-even exists within this cost basis.`
      : `At ${monthlyDemand} tests/month, the modeled break-even range is ${lowThreshold}–${highThreshold ?? lowThreshold} tests/month. Annual internal cost is ${annualInternalLow}–${annualInternalHigh} USD versus ${annualExternal} USD external before one-time transfer cost.`;
  const operationalBasis = input.externalTurnaroundDays === null ? "External end-to-end turnaround and sample hold time remain open."
    : `External end-to-end turnaround is ${input.externalTurnaroundDays} days versus the ${basis.targetTurnaroundDays}-day target${input.sampleHoldTimeDays === null ? "; sample hold time is open" : ` and ${input.sampleHoldTimeDays}-day sample hold limit`}. Investigation response is ${input.investigationResponsiveness}; surge capacity is ${input.surgeCapacity}.`;
  const qualityControlBasis = `Internal capability is ${input.internalCapability}; method readiness is ${input.methodReadiness}; external qualification is ${input.externalLabQualified}; data access is ${input.dataAccess}; backup coverage is ${input.backupExternalCoverage}.`;
  const relatedBlueprintLineageIds = unique(blueprint.decisionLineage.filter((item) => ["current.totalTeamFte", "current.capexHighUsd", "current.annualOpexHighUsd"].includes(item.outputKey) || item.workflowIds.some((id) => basis.workflowIds.includes(id)) || item.methodIds.some((id) => basis.methodIds.includes(id))).map((item) => item.id));
  const underlyingRuleRefs = basis.ruleIds.map((id) => blueprint.ruleTrace.find((item) => item.ruleId === id)).filter((item): item is RuleTrace => Boolean(item)).map((item) => ({ id: item.ruleId, version: item.ruleVersion }));
  const evidenceRefs = unique(["project-inputs", "vendor-budget-evidence", ...basis.evidenceIds]).map((id) => blueprint.evidence.find((item) => item.id === id)).filter((item): item is EvidenceRecord => Boolean(item)).map((item) => ({ id: item.id, version: item.version }));
  const lineage: DecisionLineage = decisionLineageSchema.parse({
    id: `decision:operating-model:${basis.id}`,
    contractVersion: "quality-lab-lineage/v1",
    decisionType: "operating-model",
    outputKey: `operatingModel.applications.${basis.id}.recommendedMode`,
    summary: `${basis.label}: ${recommendedMode === "evidence-required" ? "material evidence is required before recommending an operating mode" : `${recommendedMode} is the current bounded operating-model conclusion`}.`,
    currentOutput: recommendedMode,
    calculation: `${economicBasis} ${operationalBasis} ${qualityControlBasis}`,
    contributingInputPaths: ["blueprint.current.capexLowUsd", "blueprint.current.capexHighUsd", "blueprint.current.annualOpexLowUsd", "blueprint.current.annualOpexHighUsd", `applications.${basis.id}.externalPricePerTestUsd`, `applications.${basis.id}.externalTurnaroundDays`, `applications.${basis.id}.sampleHoldTimeDays`, `applications.${basis.id}.internalCapability`, `applications.${basis.id}.methodReadiness`, `applications.${basis.id}.externalLabQualified`, `applications.${basis.id}.backupExternalCoverage`, `applications.${basis.id}.dataAccess`, `applications.${basis.id}.investigationResponsiveness`, `applications.${basis.id}.surgeCapacity`],
    workflowIds: basis.workflowIds,
    methodIds: basis.methodIds,
    ruleRefs: [{ id: "quality-lab.operating-model.application", version: QUALITY_LAB_OPERATING_MODEL_RULE_VERSION }, { id: "quality-lab.operating-model.break-even", version: QUALITY_LAB_OPERATING_MODEL_RULE_VERSION }, ...underlyingRuleRefs],
    evidenceRefs: evidenceRefs.length ? evidenceRefs : [{ id: blueprint.evidence[0].id, version: blueprint.evidence[0].version }],
    assumptionIds: ["operating-model-cost-allocation", `operating-model-input:${basis.id}`],
    confidence: recommendedMode === "evidence-required" ? "indicative" : "medium",
    limitations: ["Application-level planning conclusion only; not a financial guarantee, method approval, laboratory qualification or procurement award.", ...economics.limitations],
    unresolvedInputIds: blockingEvidence.map((item) => item.id),
    materialChangeFactors: ["Monthly physical test demand crossing the break-even range", "Comparable external price or scope changing", "External end-to-end turnaround crossing the target or sample hold time", "Method transfer, suitability or validation state changing", "External laboratory qualification, backup coverage, data access or investigation responsiveness changing", "Internal capability, surge capacity, continuity priority or strategic-control need changing"],
  });
  return operatingModelApplicationSchema.parse({
    id: basis.id,
    label: basis.label,
    scope: basis.scope,
    source: basis.source,
    currentExecution: basis.currentExecution,
    recommendedMode,
    decisionStatus: blockingEvidence.length ? "material-evidence-missing" : "decision-basis-available",
    monthlyDemand,
    demandStatus: basis.demandStatus,
    targetTurnaroundDays: basis.targetTurnaroundDays,
    criticality: basis.criticality,
    methodRequirementIds: basis.methodRequirementIds,
    workflowIds: basis.workflowIds,
    methodIds: basis.methodIds,
    ruleIds: basis.ruleIds,
    evidenceIds: basis.evidenceIds,
    economics,
    economicBasis,
    operationalBasis,
    qualityControlBasis,
    decisionDrivers: drivers,
    majorRisks,
    assumptions: [`${assetLifeYears}-year straight-line asset-life assumption.`, `${round(costShare * 100, 1)}% application workload allocation of current Blueprint CAPEX.`, "Current Blueprint OPEX per compiled test is used as the internal running-cost range.", input.note.trim() || "No application-specific note recorded."],
    missingEvidence,
    sensitivityDrivers: [
      { id: "monthly-demand", label: "Monthly physical demand", currentValue: `${monthlyDemand} tests/month`, decisionChange: lowThreshold === null ? "Cannot test an economic threshold until external price exceeds the internal running-cost floor." : `Crossing ${lowThreshold}–${highThreshold ?? lowThreshold} tests/month changes the economic direction.`, evidenceNeeded: "Approved forecast and physical execution allocation." },
      { id: "external-price", label: "Comparable external price", currentValue: externalPrice === null ? "Open" : `${externalPrice} USD/test`, decisionChange: monthlyDemand > 0 ? `At current demand, external price crossing approximately ${round(variableLow + annualizedFixedLow / (monthlyDemand * 12))}–${round(variableHigh + annualizedFixedHigh / (monthlyDemand * 12))} USD/test changes the economic direction.` : "Demand must be allocated first.", evidenceNeeded: "Scoped, current laboratory quotation." },
      { id: "external-turnaround", label: "External end-to-end turnaround", currentValue: input.externalTurnaroundDays === null ? "Open" : `${input.externalTurnaroundDays} days`, decisionChange: `Crossing the ${basis.targetTurnaroundDays}-day Blueprint target or declared sample hold time can make the external route operationally infeasible.`, evidenceNeeded: "Actual collection-to-approved-result performance and sample stability evidence." },
      { id: "continuity-control", label: "Continuity and control", currentValue: `${input.continuityPriority} continuity / ${input.strategicControl} control`, decisionChange: "Qualification, backup, raw-data access, investigation response or surge-capacity changes can move the conclusion between outsource, hybrid and insource.", evidenceNeeded: "Qualification package, quality agreement, continuity plan and operating evidence." },
    ],
    relatedBlueprintLineageIds,
    lineage,
  });
}

export function analyzeQualityLabOperatingModel(project: QualityLabProject, rawInput?: unknown, generatedAt = new Date().toISOString()): QualityLabOperatingModelAnalysis {
  const input = createQualityLabOperatingModelInput(project, rawInput, generatedAt);
  const basis = deriveApplications(project);
  const weights = basis.map((item) => Math.max(0.1, item.monthlyHandsOnHours || item.monthlyDemand));
  const totalWeight = weights.reduce((total, item) => total + item, 0) || 1;
  const applications = basis.map((application, index) => analyzeApplication(project, application, input.applications.find((item) => item.applicationId === application.id)!, input.assetLifeYears, weights[index] / totalWeight));
  const usedRuleIds = unique(applications.flatMap((item) => item.lineage.ruleRefs.map((ref) => ref.id)));
  const ruleTrace = [...operatingModelRules, ...project.blueprint.ruleTrace].filter((item, index, all) => usedRuleIds.includes(item.ruleId) && all.findIndex((other) => other.ruleId === item.ruleId && other.ruleVersion === item.ruleVersion) === index);
  const usedEvidenceIds = unique(applications.flatMap((item) => item.lineage.evidenceRefs.map((ref) => ref.id)));
  const evidence = project.blueprint.evidence.filter((item) => usedEvidenceIds.includes(item.id));
  const analysis = qualityLabOperatingModelAnalysisSchema.parse({
    contractVersion: QUALITY_LAB_OPERATING_MODEL_VERSION,
    inputContractVersion: QUALITY_LAB_OPERATING_MODEL_INPUT_VERSION,
    generatedAt,
    project: { id: project.id, name: project.name, revision: project.updatedAt },
    sourceVersions: { inputContract: project.input.contractVersion, outputContract: project.blueprint.contractVersion, compilerCore: project.blueprint.compilerCoreVersion, blueprintEngine: project.blueprint.engineVersion, domainPack: `${project.blueprint.domainPack.id}@${project.blueprint.domainPack.version}` },
    applications,
    ruleTrace,
    evidence,
    summary: {
      insource: applications.filter((item) => item.recommendedMode === "insource").length,
      outsource: applications.filter((item) => item.recommendedMode === "outsource").length,
      hybrid: applications.filter((item) => item.recommendedMode === "hybrid").length,
      evidenceRequired: applications.filter((item) => item.recommendedMode === "evidence-required").length,
    },
    boundary: "Application-level concept decision support only. Atlas does not qualify an external laboratory, approve a method, guarantee savings, select a supplier, authorize a transfer or replace QA, finance and procurement governance.",
  });
  validateQualityLabOperatingModelIntegrity(project, analysis);
  return analysis;
}

export function validateQualityLabOperatingModelIntegrity(project: QualityLabProject, analysis: QualityLabOperatingModelAnalysis) {
  const issues: string[] = [];
  if (analysis.project.id !== project.id) issues.push("Analysis project does not match the Blueprint project.");
  const applicationIds = new Set<string>();
  const lineageIds = new Set<string>();
  const ruleKeys = new Set(analysis.ruleTrace.map((item) => `${item.ruleId}@${item.ruleVersion}`));
  const evidenceKeys = new Set(analysis.evidence.map((item) => `${item.id}@${item.version}`));
  const workflowIds = new Set(project.blueprint.workflows.map((item) => item.id));
  const methodIds = new Set(project.blueprint.methodRequirements.map((item) => item.methodId));
  for (const application of analysis.applications) {
    if (applicationIds.has(application.id)) issues.push(`Duplicate application ID: ${application.id}`);
    applicationIds.add(application.id);
    if (lineageIds.has(application.lineage.id)) issues.push(`Duplicate lineage ID: ${application.lineage.id}`);
    lineageIds.add(application.lineage.id);
    if (!application.lineage.outputKey.includes(application.id)) issues.push(`Lineage output does not identify application: ${application.id}`);
    application.lineage.ruleRefs.forEach((ref) => { if (!ruleKeys.has(`${ref.id}@${ref.version}`)) issues.push(`Missing rule trace: ${ref.id}@${ref.version}`); });
    application.lineage.evidenceRefs.forEach((ref) => { if (!evidenceKeys.has(`${ref.id}@${ref.version}`)) issues.push(`Missing evidence trace: ${ref.id}@${ref.version}`); });
    application.workflowIds.forEach((id) => { if (!workflowIds.has(id)) issues.push(`Unknown workflow link: ${id}`); });
    application.methodIds.forEach((id) => { if (!methodIds.has(id)) issues.push(`Unknown method link: ${id}`); });
    if (application.recommendedMode !== "evidence-required" && application.missingEvidence.some((item) => item.blocking)) issues.push(`Recommendation bypasses blocking evidence: ${application.id}`);
  }
  if (issues.length) throw new Error(`Quality Lab operating-model integrity failed:\n- ${issues.join("\n- ")}`);
}
