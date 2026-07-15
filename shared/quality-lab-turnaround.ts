import { z } from "zod";
import type { QualityLabProject, WorkflowDemand } from "./quality-lab.js";

export const TURNAROUND_FEASIBILITY_ENGINE_VERSION = "turnaround-feasibility/v1.0" as const;

export const turnaroundFeasibilityInputSchema = z.object({
  projectId: z.string().min(1),
  demandHorizon: z.enum(["current", "future"]),
  targetTurnaroundDays: z.number().min(1).max(60),
  arrivalPattern: z.enum(["level", "weekday-loaded", "campaign"]),
  executionDaysPerWeek: z.number().int().min(5).max(7),
  reviewDaysPerWeek: z.number().int().min(5).max(7),
  analystFteAvailable: z.number().min(0.1).max(500),
  reviewerFteAvailable: z.number().min(0.1).max(100),
  reviewMinutesPerUnit: z.number().min(1).max(240),
  batchWindowHours: z.number().min(0).max(72),
  handoffHours: z.number().min(0).max(72),
  investigationReservePercent: z.number().min(0).max(100),
});

export type TurnaroundFeasibilityInput = z.infer<typeof turnaroundFeasibilityInputSchema>;
export type TurnaroundStatus = "concept-pass" | "tight" | "concept-fail" | "capacity-overload";

export interface TurnaroundLoadSummary {
  demandHoursPerMonth: number;
  capacityHoursPerMonth: number;
  utilizationPercent: number;
  peakDayHours: number;
  capacityHoursPerExecutionDay: number;
  queueAllowanceDays: number;
}

export interface TurnaroundWorkflowResult {
  id: string;
  label: string;
  criticality: WorkflowDemand["criticality"];
  monthlyUnits: number;
  technicalDurationDays: number;
  batchingDelayDays: number;
  executionQueueDays: number;
  executionCalendarExposureDays: number;
  handoffDays: number;
  reviewQueueDays: number;
  reviewCalendarExposureDays: number;
  modeledTurnaroundDays: number;
  targetTurnaroundDays: number;
  marginDays: number;
  status: TurnaroundStatus;
  relatedRuleIds: string[];
}

export interface TurnaroundDecisionSignal {
  id: string;
  severity: "critical" | "watch" | "positive" | "information";
  title: string;
  description: string;
  relatedRuleIds: string[];
}

export interface TurnaroundFeasibilityResult {
  engineVersion: typeof TURNAROUND_FEASIBILITY_ENGINE_VERSION;
  generatedAt: string;
  project: { id: string; name: string; blueprintEngineVersion: string; demandHorizon: "current" | "future" };
  input: TurnaroundFeasibilityInput;
  arrivalPeakFactor: number;
  executionLoad: TurnaroundLoadSummary;
  reviewLoad: TurnaroundLoadSummary;
  workflows: TurnaroundWorkflowResult[];
  overallStatus: TurnaroundStatus;
  signals: TurnaroundDecisionSignal[];
  assumptions: Array<{ id: string; value: string; confidence: "user-supplied" | "indicative"; evidenceNeeded: string }>;
  unresolvedInputs: string[];
  ruleTrace: Array<{ ruleId: string; role: string; limitation: string }>;
  boundary: string;
}

const peakFactors = { level: 1.1, "weekday-loaded": 1.45, campaign: 2 } as const;

function round(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function queueAllowanceDays(utilization: number, peakDayHours: number, dailyCapacity: number): number {
  if (dailyCapacity <= 0 || utilization >= 1) {
    const overloadRatio = dailyCapacity > 0 ? peakDayHours / dailyCapacity : 10;
    return round(Math.min(30, Math.max(3, overloadRatio * 3)));
  }
  const peakBacklogDays = Math.max(0, peakDayHours - dailyCapacity) / dailyCapacity;
  const congestionAllowance = utilization < 0.7 ? 0.15 : utilization < 0.85 ? 0.5 : 1.5 + ((utilization - 0.85) / 0.15) * 1.5;
  return round(Math.min(5, peakBacklogDays + congestionAllowance));
}

function loadSummary(demandHours: number, capacityHours: number, operatingDaysPerMonth: number, peakFactor: number): TurnaroundLoadSummary {
  const capacityPerDay = operatingDaysPerMonth > 0 ? capacityHours / operatingDaysPerMonth : 0;
  const averageDemandPerDay = operatingDaysPerMonth > 0 ? demandHours / operatingDaysPerMonth : 0;
  const peakDayHours = averageDemandPerDay * peakFactor;
  const utilization = capacityHours > 0 ? demandHours / capacityHours : 10;
  return {
    demandHoursPerMonth: round(demandHours),
    capacityHoursPerMonth: round(capacityHours),
    utilizationPercent: round(utilization * 100, 1),
    peakDayHours: round(peakDayHours),
    capacityHoursPerExecutionDay: round(capacityPerDay),
    queueAllowanceDays: queueAllowanceDays(utilization, peakDayHours, capacityPerDay),
  };
}

function worstStatus(statuses: TurnaroundStatus[]): TurnaroundStatus {
  const order: TurnaroundStatus[] = ["concept-pass", "tight", "concept-fail", "capacity-overload"];
  return statuses.reduce((worst, status) => order.indexOf(status) > order.indexOf(worst) ? status : worst, "concept-pass");
}

export function defaultTurnaroundFeasibilityInput(project: QualityLabProject): TurnaroundFeasibilityInput {
  const workforce = project.blueprint.workforceCapacity?.current;
  return turnaroundFeasibilityInputSchema.parse({
    projectId: project.id,
    demandHorizon: "current",
    targetTurnaroundDays: project.input.targetTurnaroundDays,
    arrivalPattern: "weekday-loaded",
    executionDaysPerWeek: Math.min(7, Math.max(5, project.input.shifts > 1 ? 6 : 5)),
    reviewDaysPerWeek: 5,
    analystFteAvailable: Math.max(0.1, workforce?.executionFte ?? project.blueprint.current.analystFte),
    reviewerFteAvailable: Math.max(0.1, workforce?.reviewerFte ?? Math.max(1, project.blueprint.current.totalTeamFte - project.blueprint.current.analystFte)),
    reviewMinutesPerUnit: 12,
    batchWindowHours: 8,
    handoffHours: 4,
    investigationReservePercent: 15,
  });
}

export function evaluateTurnaroundFeasibility(project: QualityLabProject, rawInput: TurnaroundFeasibilityInput): TurnaroundFeasibilityResult {
  const input = turnaroundFeasibilityInputSchema.parse(rawInput);
  const isFuture = input.demandHorizon === "future";
  const workflows = isFuture
    ? project.blueprint.workflows.map((workflow) => ({ ...workflow, monthlyUnits: round(workflow.monthlyUnits * project.blueprint.future.multiplier), monthlyHandsOnHours: round(workflow.monthlyHandsOnHours * project.blueprint.future.multiplier) }))
    : project.blueprint.workflows;
  const peakFactor = peakFactors[input.arrivalPattern];
  const reserveFactor = 1 + input.investigationReservePercent / 100;
  const executionDemand = workflows.reduce((sum, row) => sum + row.monthlyHandsOnHours, 0) * reserveFactor;
  const executionOperatingDays = project.input.workingDaysPerMonth * (input.executionDaysPerWeek / 5);
  const executionCapacity = input.analystFteAvailable * project.input.productiveHoursPerShift * executionOperatingDays;
  const executionLoad = loadSummary(executionDemand, executionCapacity, executionOperatingDays, peakFactor);
  const totalUnits = workflows.reduce((sum, row) => sum + row.monthlyUnits, 0);
  const reviewDemand = totalUnits * (input.reviewMinutesPerUnit / 60) * reserveFactor;
  const reviewOperatingDays = project.input.workingDaysPerMonth * (input.reviewDaysPerWeek / 5);
  const reviewCapacity = input.reviewerFteAvailable * project.input.productiveHoursPerShift * reviewOperatingDays;
  const reviewLoad = loadSummary(reviewDemand, reviewCapacity, reviewOperatingDays, peakFactor);
  const executionCalendarExposure = (7 - input.executionDaysPerWeek) * 0.5;
  const reviewCalendarExposure = (7 - input.reviewDaysPerWeek) * 0.5;
  const batchingDelay = input.batchWindowHours / 24;
  const handoffDelay = input.handoffHours / 24;
  const capacityOverloaded = executionLoad.utilizationPercent >= 100 || reviewLoad.utilizationPercent >= 100;

  const workflowResults = workflows.filter((workflow) => workflow.monthlyUnits > 0).map((workflow): TurnaroundWorkflowResult => {
    const modeled = workflow.turnaroundDays + batchingDelay + executionLoad.queueAllowanceDays + executionCalendarExposure + handoffDelay + reviewLoad.queueAllowanceDays + reviewCalendarExposure;
    const margin = input.targetTurnaroundDays - modeled;
    const status: TurnaroundStatus = capacityOverloaded ? "capacity-overload" : margin < 0 ? "concept-fail" : margin < 1 ? "tight" : "concept-pass";
    return {
      id: workflow.id,
      label: workflow.label,
      criticality: workflow.criticality,
      monthlyUnits: round(workflow.monthlyUnits),
      technicalDurationDays: workflow.turnaroundDays,
      batchingDelayDays: round(batchingDelay),
      executionQueueDays: executionLoad.queueAllowanceDays,
      executionCalendarExposureDays: round(executionCalendarExposure),
      handoffDays: round(handoffDelay),
      reviewQueueDays: reviewLoad.queueAllowanceDays,
      reviewCalendarExposureDays: round(reviewCalendarExposure),
      modeledTurnaroundDays: round(modeled),
      targetTurnaroundDays: input.targetTurnaroundDays,
      marginDays: round(margin),
      status,
      relatedRuleIds: [workflow.ruleId, "core.turnaround.feasibility", "core.capacity.people"],
    };
  });
  const overallStatus = worstStatus(workflowResults.map((workflow) => workflow.status));
  const signals: TurnaroundDecisionSignal[] = [];

  if (executionLoad.utilizationPercent >= 100) signals.push({ id: "execution-overload", severity: "critical", title: "Execution demand exceeds modeled analyst capacity", description: `Demand including reserve is ${executionLoad.demandHoursPerMonth} hours against ${executionLoad.capacityHoursPerMonth} available hours per month.`, relatedRuleIds: ["core.capacity.people"] });
  else if (executionLoad.utilizationPercent >= 85) signals.push({ id: "execution-congestion", severity: "watch", title: `Execution capacity operates at ${executionLoad.utilizationPercent}%`, description: "The model applies a congestion allowance because small peaks, absence or investigations can create a persistent queue near this utilization.", relatedRuleIds: ["core.capacity.people", "core.turnaround.feasibility"] });

  if (reviewLoad.utilizationPercent >= 100) signals.push({ id: "review-overload", severity: "critical", title: "Technical review demand exceeds modeled capacity", description: `Review demand is ${reviewLoad.demandHoursPerMonth} hours against ${reviewLoad.capacityHoursPerMonth} available hours per month.`, relatedRuleIds: ["core.capacity.people", "core.turnaround.feasibility"] });
  else if (reviewLoad.utilizationPercent >= 85) signals.push({ id: "review-congestion", severity: "watch", title: `Review capacity operates at ${reviewLoad.utilizationPercent}%`, description: "Approval and disposition can become the release bottleneck even when laboratory execution capacity appears sufficient.", relatedRuleIds: ["core.capacity.people", "core.turnaround.feasibility"] });

  const missedCritical = workflowResults.filter((workflow) => workflow.criticality === "critical" && (workflow.status === "concept-fail" || workflow.status === "capacity-overload"));
  if (missedCritical.length) signals.push({ id: "critical-workflow-miss", severity: "critical", title: `${missedCritical.length} critical workflow${missedCritical.length === 1 ? "" : "s"} miss the planning target`, description: "The target is not demonstrated under the selected arrival, calendar, batching, handoff and review assumptions.", relatedRuleIds: Array.from(new Set(missedCritical.flatMap((workflow) => workflow.relatedRuleIds))) });
  if (workflowResults.some((workflow) => workflow.status === "tight")) signals.push({ id: "tight-margin", severity: "watch", title: "One or more workflows have less than one day of margin", description: "A concept pass with less than one day of buffer is sensitive to cutoffs, repeat work, excursions and weekend timing.", relatedRuleIds: ["core.turnaround.feasibility"] });
  if (input.executionDaysPerWeek < 7 || input.reviewDaysPerWeek < 7) signals.push({ id: "calendar-exposure", severity: "information", title: "Closed-day exposure is included", description: "The allowance is a conservative planning proxy. Replace it with actual timestamps, cutoffs, weekend reads, on-call rules and approval calendars.", relatedRuleIds: ["core.turnaround.feasibility"] });
  if (overallStatus === "concept-pass") signals.push({ id: "concept-pass", severity: "positive", title: "All modeled workflows retain at least one day of planning margin", description: "This supports scenario screening only. It is not schedule validation and remains dependent on the supplied assumptions and concept workflow times.", relatedRuleIds: ["core.turnaround.feasibility"] });

  return {
    engineVersion: TURNAROUND_FEASIBILITY_ENGINE_VERSION,
    generatedAt: new Date().toISOString(),
    project: { id: project.id, name: project.name, blueprintEngineVersion: project.blueprint.engineVersion, demandHorizon: input.demandHorizon },
    input,
    arrivalPeakFactor: peakFactor,
    executionLoad,
    reviewLoad,
    workflows: workflowResults,
    overallStatus,
    signals,
    assumptions: [
      { id: "arrival-pattern", value: `${input.arrivalPattern}; ${peakFactor}× peak-day factor`, confidence: "user-supplied", evidenceNeeded: "Timestamped arrivals and deadlines by workflow." },
      { id: "execution-calendar", value: `${input.executionDaysPerWeek} execution days/week`, confidence: "user-supplied", evidenceNeeded: "Approved operating calendar, shift roster and weekend-read requirements." },
      { id: "review-standard-time", value: `${input.reviewMinutesPerUnit} review minutes/unit`, confidence: "user-supplied", evidenceNeeded: "Observed review and disposition time study by method and outcome." },
      { id: "queue-model", value: "Deterministic utilization and peak-load allowance", confidence: "indicative", evidenceNeeded: "Arrival, start, completion, review and release timestamps for discrete-event or empirical validation." },
    ],
    unresolvedInputs: [
      "Actual sample arrival timestamps, deadlines and release priorities",
      "Approved method steps, incubation reads, repeats and exception paths",
      "Named-skill coverage by shift, weekend and absence state",
      "Equipment-specific batching, load geometry, cycle and downtime constraints",
      "Observed technical-review, QA disposition and investigation queues",
    ],
    ruleTrace: [
      { ruleId: "core.turnaround.feasibility", role: "Separates technical duration from batching, execution queue, calendar, handoff and review delay.", limitation: "This v1 model uses deterministic allowances, not timestamped discrete-event simulation." },
      { ruleId: "core.capacity.people", role: "Tests execution and review demand against supplied deployable FTE capacity.", limitation: "FTE does not prove qualification, simultaneous coverage, roster feasibility or productivity." },
    ],
    boundary: "Atlas Turnaround Feasibility v1 is a scenario-screening model. It does not schedule individual samples, validate a release process, replace approved methods or prove service-level performance. Controlled use requires timestamped site data and qualified operational review.",
  };
}
