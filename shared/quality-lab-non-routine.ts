import { z } from "zod";
import type { QualityLabProject } from "./quality-lab.js";

export const NON_ROUTINE_LOAD_ENGINE_VERSION = "non-routine-load/v1.0" as const;

const eventTypeSchema = z.enum(["deviation", "oos-oot", "contamination", "repeat-testing", "training-qualification", "method-lifecycle"]);
const evidenceBasisSchema = z.enum(["illustrative-stress", "user-supplied-estimate", "observed-site-data"]);

export const nonRoutineEventInputSchema = z.object({
  id: eventTypeSchema,
  eventsPerMonth: z.number().min(0).max(10_000),
  analystHoursPerEvent: z.number().min(0).max(10_000),
  reviewerHoursPerEvent: z.number().min(0).max(10_000),
  evidenceBasis: evidenceBasisSchema,
});

export const nonRoutineLoadInputSchema = z.object({
  projectId: z.string().min(1),
  demandHorizon: z.enum(["current", "future"]),
  availableAnalystFte: z.number().min(0.1).max(500),
  availableReviewerFte: z.number().min(0.1).max(100),
  absenceAndLeavePercent: z.number().min(0).max(50),
  routineReviewMinutesPerUnit: z.number().min(0).max(240),
  weeklyHandoverHours: z.number().min(0).max(500),
  events: z.array(nonRoutineEventInputSchema).length(6),
});

export type NonRoutineEventInput = z.infer<typeof nonRoutineEventInputSchema>;
export type NonRoutineLoadInput = z.infer<typeof nonRoutineLoadInputSchema>;
export type NonRoutineLoadStatus = "concept-pass" | "tight" | "capacity-gap";

export interface NonRoutineEventResult extends NonRoutineEventInput {
  label: string;
  monthlyAnalystHours: number;
  monthlyReviewerHours: number;
  totalMonthlyHours: number;
  shareOfNonRoutinePercent: number;
  evidenceNeeded: string;
  relatedRuleIds: string[];
}

export interface RoleCapacityResult {
  role: "analyst" | "reviewer";
  routineHours: number;
  nonRoutineHours: number;
  totalDemandHours: number;
  nominalCapacityHours: number;
  absenceAdjustedCapacityHours: number;
  utilizationPercent: number;
  requiredFte: number;
  availableFte: number;
  fteGap: number;
  status: NonRoutineLoadStatus;
}

export interface NonRoutineLoadResult {
  engineVersion: typeof NON_ROUTINE_LOAD_ENGINE_VERSION;
  generatedAt: string;
  project: { id: string; name: string; blueprintEngineVersion: string; demandHorizon: "current" | "future" };
  input: NonRoutineLoadInput;
  events: NonRoutineEventResult[];
  analyst: RoleCapacityResult;
  reviewer: RoleCapacityResult;
  overallStatus: NonRoutineLoadStatus;
  routineExecutionHours: number;
  totalNonRoutineHours: number;
  nonRoutineSharePercent: number;
  blueprintResilienceReserveFte: number;
  nonRoutineAnalystFte: number;
  reserveCoveragePercent: number | null;
  evidenceSummary: { illustrativeCount: number; estimatedCount: number; observedCount: number; decisionBasis: "stress-test-only" | "partially-observed" | "observed-input-set" };
  signals: Array<{ id: string; severity: "critical" | "watch" | "positive" | "information"; title: string; description: string; relatedRuleIds: string[] }>;
  assumptions: Array<{ id: string; value: string; confidence: "user-supplied" | "illustrative"; evidenceNeeded: string }>;
  ruleTrace: Array<{ ruleId: string; ruleVersion: string; role: string; limitation: string }>;
  boundary: string;
}

const eventMetadata: Record<NonRoutineEventInput["id"], { label: string; evidenceNeeded: string; rules: string[] }> = {
  deviation: { label: "Laboratory deviations", evidenceNeeded: "Monthly deviation count and analyst/reviewer hours from the deviation system, separated by severity and root cause.", rules: ["core.capacity.people", "core.nonroutine.deviation"] },
  "oos-oot": { label: "OOS / OOT investigations", evidenceNeeded: "OOS/OOT events, phase durations, repeat work, reviewer/QA hours and closure lead time for 12–24 months.", rules: ["core.capacity.people", "core.nonroutine.investigation"] },
  contamination: { label: "Contamination investigations", evidenceNeeded: "Microbiology excursions, identification, resampling, impact assessment and investigation hours by role.", rules: ["core.capacity.people", "core.nonroutine.contamination"] },
  "repeat-testing": { label: "Unplanned repeat testing", evidenceNeeded: "Repeat execution count, reason, method, hands-on time, equipment occupancy and review time without double-counting investigation events.", rules: ["core.capacity.people", "core.nonroutine.repeat"] },
  "training-qualification": { label: "Training & qualification", evidenceNeeded: "Curricula, initial/requalification frequency, learner hours, trainer hours and failed/repeated qualification effort.", rules: ["core.capacity.people", "core.nonroutine.qualification"] },
  "method-lifecycle": { label: "Method lifecycle projects", evidenceNeeded: "Approved transfer, verification, validation and change-control pipeline with planned analyst and reviewer hours.", rules: ["core.capacity.people", "core.nonroutine.lifecycle"] },
};

function round(value: number, digits = 2) { const factor = 10 ** digits; return Math.round(value * factor) / factor; }

function status(utilizationPercent: number): NonRoutineLoadStatus {
  return utilizationPercent >= 100 ? "capacity-gap" : utilizationPercent >= 85 ? "tight" : "concept-pass";
}

function worst(statuses: NonRoutineLoadStatus[]) {
  const order: NonRoutineLoadStatus[] = ["concept-pass", "tight", "capacity-gap"];
  return statuses.reduce((current, item) => order.indexOf(item) > order.indexOf(current) ? item : current, "concept-pass");
}

function roleResult(role: RoleCapacityResult["role"], routineHours: number, nonRoutineHours: number, availableFte: number, productiveHoursPerFte: number, absencePercent: number): RoleCapacityResult {
  const nominalCapacityHours = availableFte * productiveHoursPerFte;
  const absenceAdjustedCapacityHours = nominalCapacityHours * (1 - absencePercent / 100);
  const totalDemandHours = routineHours + nonRoutineHours;
  const utilizationPercent = absenceAdjustedCapacityHours > 0 ? totalDemandHours / absenceAdjustedCapacityHours * 100 : 1000;
  const requiredFte = productiveHoursPerFte > 0 ? totalDemandHours / (productiveHoursPerFte * (1 - absencePercent / 100)) : 0;
  return { role, routineHours: round(routineHours), nonRoutineHours: round(nonRoutineHours), totalDemandHours: round(totalDemandHours), nominalCapacityHours: round(nominalCapacityHours), absenceAdjustedCapacityHours: round(absenceAdjustedCapacityHours), utilizationPercent: round(utilizationPercent, 1), requiredFte: round(requiredFte, 2), availableFte, fteGap: round(Math.max(0, requiredFte - availableFte), 2), status: status(utilizationPercent) };
}

export function defaultNonRoutineLoadInput(project: QualityLabProject): NonRoutineLoadInput {
  const workforce = project.blueprint.workforceCapacity?.future;
  return nonRoutineLoadInputSchema.parse({
    projectId: project.id,
    demandHorizon: "future",
    availableAnalystFte: Math.max(0.1, workforce?.executionFte ?? project.blueprint.future.analystFte),
    availableReviewerFte: Math.max(0.1, workforce?.reviewerFte ?? Math.max(1, project.blueprint.future.totalTeamFte - project.blueprint.future.analystFte)),
    absenceAndLeavePercent: 8,
    routineReviewMinutesPerUnit: 12,
    weeklyHandoverHours: 2,
    events: [
      { id: "deviation", eventsPerMonth: 1, analystHoursPerEvent: 6, reviewerHoursPerEvent: 2, evidenceBasis: "illustrative-stress" },
      { id: "oos-oot", eventsPerMonth: 1, analystHoursPerEvent: 16, reviewerHoursPerEvent: 6, evidenceBasis: "illustrative-stress" },
      { id: "contamination", eventsPerMonth: 0.5, analystHoursPerEvent: 24, reviewerHoursPerEvent: 8, evidenceBasis: "illustrative-stress" },
      { id: "repeat-testing", eventsPerMonth: 2, analystHoursPerEvent: 4, reviewerHoursPerEvent: 1, evidenceBasis: "illustrative-stress" },
      { id: "training-qualification", eventsPerMonth: 2, analystHoursPerEvent: 12, reviewerHoursPerEvent: 4, evidenceBasis: "illustrative-stress" },
      { id: "method-lifecycle", eventsPerMonth: 0.25, analystHoursPerEvent: 40, reviewerHoursPerEvent: 16, evidenceBasis: "illustrative-stress" },
    ],
  });
}

export function evaluateNonRoutineLoad(project: QualityLabProject, rawInput: NonRoutineLoadInput): NonRoutineLoadResult {
  const input = nonRoutineLoadInputSchema.parse(rawInput);
  const isFuture = input.demandHorizon === "future";
  const multiplier = isFuture ? project.blueprint.future.multiplier : 1;
  const routineExecutionHours = project.blueprint.current.monthlyHandsOnHours * multiplier;
  const routineUnits = project.blueprint.workflows.reduce((sum, row) => sum + row.monthlyUnits, 0) * multiplier;
  const routineReviewHours = routineUnits * input.routineReviewMinutesPerUnit / 60;
  const productiveHoursPerFte = project.input.workingDaysPerMonth * project.input.productiveHoursPerShift;
  const rawEvents = input.events.map((event) => ({
    input: event,
    analyst: event.eventsPerMonth * event.analystHoursPerEvent,
    reviewer: event.eventsPerMonth * event.reviewerHoursPerEvent,
  }));
  const handoverAnalystHours = input.weeklyHandoverHours * 4.33;
  const eventHours = rawEvents.reduce((sum, item) => sum + item.analyst + item.reviewer, 0);
  const totalNonRoutineHours = eventHours + handoverAnalystHours;
  const events = rawEvents.map(({ input: event, analyst, reviewer }): NonRoutineEventResult => ({
    ...event,
    label: eventMetadata[event.id].label,
    monthlyAnalystHours: round(analyst),
    monthlyReviewerHours: round(reviewer),
    totalMonthlyHours: round(analyst + reviewer),
    shareOfNonRoutinePercent: totalNonRoutineHours > 0 ? round((analyst + reviewer) / totalNonRoutineHours * 100, 1) : 0,
    evidenceNeeded: eventMetadata[event.id].evidenceNeeded,
    relatedRuleIds: eventMetadata[event.id].rules,
  }));
  const analystNonRoutine = rawEvents.reduce((sum, item) => sum + item.analyst, 0) + handoverAnalystHours;
  const reviewerNonRoutine = rawEvents.reduce((sum, item) => sum + item.reviewer, 0);
  const analyst = roleResult("analyst", routineExecutionHours, analystNonRoutine, input.availableAnalystFte, productiveHoursPerFte, input.absenceAndLeavePercent);
  const reviewer = roleResult("reviewer", routineReviewHours, reviewerNonRoutine, input.availableReviewerFte, productiveHoursPerFte, input.absenceAndLeavePercent);
  const overallStatus = worst([analyst.status, reviewer.status]);
  const workforce = isFuture ? project.blueprint.workforceCapacity?.future : project.blueprint.workforceCapacity?.current;
  const blueprintResilienceReserveFte = workforce?.resilienceReserveFte ?? 0;
  const nonRoutineAnalystFte = productiveHoursPerFte > 0 ? analystNonRoutine / productiveHoursPerFte : 0;
  const reserveCoveragePercent = nonRoutineAnalystFte > 0 ? blueprintResilienceReserveFte / nonRoutineAnalystFte * 100 : null;
  const illustrativeCount = events.filter((item) => item.evidenceBasis === "illustrative-stress").length;
  const estimatedCount = events.filter((item) => item.evidenceBasis === "user-supplied-estimate").length;
  const observedCount = events.filter((item) => item.evidenceBasis === "observed-site-data").length;
  const decisionBasis = observedCount === events.length ? "observed-input-set" : observedCount > 0 ? "partially-observed" : "stress-test-only";
  const signals: NonRoutineLoadResult["signals"] = [];
  if (analyst.status === "capacity-gap") signals.push({ id: "analyst-gap", severity: "critical", title: `Analyst capacity gap of ${analyst.fteGap} FTE`, description: `Routine and non-routine demand reaches ${analyst.utilizationPercent}% of absence-adjusted analyst capacity.`, relatedRuleIds: ["core.capacity.people", "core.nonroutine.load"] });
  else if (analyst.status === "tight") signals.push({ id: "analyst-tight", severity: "watch", title: `Analyst capacity operates at ${analyst.utilizationPercent}%`, description: "Small changes in event frequency, duration or absence can remove the remaining planning margin.", relatedRuleIds: ["core.capacity.people", "core.nonroutine.load"] });
  if (reviewer.status === "capacity-gap") signals.push({ id: "reviewer-gap", severity: "critical", title: `Reviewer capacity gap of ${reviewer.fteGap} FTE`, description: `Routine review plus non-routine review reaches ${reviewer.utilizationPercent}% of absence-adjusted reviewer capacity.`, relatedRuleIds: ["core.capacity.people", "core.nonroutine.load"] });
  else if (reviewer.status === "tight") signals.push({ id: "reviewer-tight", severity: "watch", title: `Reviewer capacity operates at ${reviewer.utilizationPercent}%`, description: "Investigation approval and lifecycle work can become the bottleneck even when execution staffing appears adequate.", relatedRuleIds: ["core.capacity.people", "core.nonroutine.load"] });
  const topEvent = [...events].sort((a, b) => b.totalMonthlyHours - a.totalMonthlyHours)[0];
  if (topEvent?.totalMonthlyHours > 0) signals.push({ id: "top-driver", severity: "information", title: `${topEvent.label} is the largest modeled exception load`, description: `${topEvent.totalMonthlyHours} total role-hours/month (${topEvent.shareOfNonRoutinePercent}% of modeled non-routine hours).`, relatedRuleIds: topEvent.relatedRuleIds });
  if (reserveCoveragePercent !== null && reserveCoveragePercent < 100) signals.push({ id: "reserve-consumed", severity: "watch", title: "Blueprint people reserve does not cover modeled analyst exception load", description: `${round(blueprintResilienceReserveFte, 2)} reserve FTE covers ${round(reserveCoveragePercent, 1)}% of the modeled ${round(nonRoutineAnalystFte, 2)} analyst FTE exception load.`, relatedRuleIds: ["core.capacity.people", "core.nonroutine.load"] });
  if (illustrativeCount > 0) signals.push({ id: "illustrative-inputs", severity: "information", title: `${illustrativeCount} event models still use illustrative stress inputs`, description: "Use the result to prioritize data collection, not to approve staffing. Replace event rates and role-hours with controlled site evidence.", relatedRuleIds: ["core.nonroutine.load"] });
  if (overallStatus === "concept-pass") signals.push({ id: "concept-pass", severity: "positive", title: "Routine and modeled exception demand retain at least 15% capacity margin", description: "This is a scenario-screening result and remains conditional on event completeness, role-hour evidence, absence and skill coverage.", relatedRuleIds: ["core.capacity.people", "core.nonroutine.load"] });

  return {
    engineVersion: NON_ROUTINE_LOAD_ENGINE_VERSION,
    generatedAt: new Date().toISOString(),
    project: { id: project.id, name: project.name, blueprintEngineVersion: project.blueprint.engineVersion, demandHorizon: input.demandHorizon },
    input, events, analyst, reviewer, overallStatus,
    routineExecutionHours: round(routineExecutionHours),
    totalNonRoutineHours: round(totalNonRoutineHours),
    nonRoutineSharePercent: routineExecutionHours + routineReviewHours + totalNonRoutineHours > 0 ? round(totalNonRoutineHours / (routineExecutionHours + routineReviewHours + totalNonRoutineHours) * 100, 1) : 0,
    blueprintResilienceReserveFte: round(blueprintResilienceReserveFte, 2),
    nonRoutineAnalystFte: round(nonRoutineAnalystFte, 2),
    reserveCoveragePercent: reserveCoveragePercent === null ? null : round(reserveCoveragePercent, 1),
    evidenceSummary: { illustrativeCount, estimatedCount, observedCount, decisionBasis },
    signals,
    assumptions: [
      { id: "event-model", value: "Event frequency × role-hours per event", confidence: "illustrative", evidenceNeeded: "Controlled event extract with start/close dates and time by role; avoid double-counting repeats inside investigations." },
      { id: "routine-review", value: `${input.routineReviewMinutesPerUnit} minutes per routine unit`, confidence: "user-supplied", evidenceNeeded: "Observed technical-review and disposition time by workflow and outcome." },
      { id: "absence", value: `${input.absenceAndLeavePercent}% capacity unavailable for absence and leave`, confidence: "user-supplied", evidenceNeeded: "Roster, leave, sickness, vacancy and temporary-assignment history." },
      { id: "handover", value: `${input.weeklyHandoverHours} analyst hours/week`, confidence: "user-supplied", evidenceNeeded: "Observed shift, escalation and weekend handover effort." },
    ],
    ruleTrace: [{ ruleId: "core.nonroutine.load", ruleVersion: NON_ROUTINE_LOAD_ENGINE_VERSION, role: "Adds event-based exception work to routine execution/review demand and tests both roles against absence-adjusted capacity.", limitation: "Deterministic monthly aggregation; no event correlation, severity distribution, investigation queue, skill roster or equipment occupancy schedule." }],
    boundary: "Atlas Non-routine Load v1 is a staffing stress screen. It does not predict deviation or OOS rates, authorize repeat testing, validate investigation practice, replace a qualification matrix or approve headcount. Controlled use requires complete site event data, non-duplicated role-hours and qualified QC, QA and HR/workforce review.",
  };
}
