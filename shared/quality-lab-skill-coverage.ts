import { z } from "zod";
import type { QualityLabProject, WorkflowDemand } from "./quality-lab.js";

export const SKILL_SHIFT_FEASIBILITY_ENGINE_VERSION = "skill-shift-feasibility/v1.0" as const;

export const skillEvidenceBasisSchema = z.enum(["illustrative-stress", "user-supplied-estimate", "controlled-qualification-record"]);

export const workflowSkillCoverageInputSchema = z.object({
  workflowId: z.string().min(1),
  activeShifts: z.number().int().min(1).max(3),
  qualifiedPeople: z.number().int().min(0).max(500),
  crossTrainedBackupPeople: z.number().int().min(0).max(500),
  peopleScheduledPerShift: z.number().int().min(0).max(100),
  authorizedReviewers: z.number().int().min(0).max(100),
  evidenceBasis: skillEvidenceBasisSchema,
});

export const skillShiftFeasibilityInputSchema = z.object({
  projectId: z.string().min(1),
  demandHorizon: z.enum(["current", "future"]),
  operatingDaysPerMonth: z.number().min(1).max(31),
  productiveHoursPerShift: z.number().min(0.5).max(24),
  peakShiftFactor: z.number().min(1).max(3),
  absenceScenarioPeople: z.number().int().min(0).max(20),
  reviewerCoverageRequiredPerShift: z.number().int().min(0).max(10),
  workflows: z.array(workflowSkillCoverageInputSchema).max(100),
});

export type SkillEvidenceBasis = z.infer<typeof skillEvidenceBasisSchema>;
export type WorkflowSkillCoverageInput = z.infer<typeof workflowSkillCoverageInputSchema>;
export type SkillShiftFeasibilityInput = z.infer<typeof skillShiftFeasibilityInputSchema>;
export type SkillShiftStatus = "covered" | "evidence-open" | "reviewer-gap" | "workload-gap" | "shift-gap" | "qualification-gap" | "uncovered";

export interface WorkflowSkillCoverageResult {
  workflowId: string;
  workflowName: string;
  criticality: WorkflowDemand["criticality"];
  status: SkillShiftStatus;
  monthlyHandsOnHours: number;
  activeShifts: number;
  minimumQualifiedPeople: number;
  qualifiedPool: number;
  absenceAdjustedPool: number;
  simultaneousExecutionNeed: number;
  executionPeopleGap: number;
  authorizedReviewers: number;
  absenceAdjustedReviewers: number;
  simultaneousReviewerNeed: number;
  reviewerPeopleGap: number;
  peakHoursPerActiveShift: number;
  scheduledHoursPerShift: number;
  workloadHoursGapPerShift: number;
  evidenceBasis: SkillEvidenceBasis;
  evidenceNeeded: string[];
  relatedRuleIds: string[];
}

export interface SkillShiftFeasibilityResult {
  engineVersion: typeof SKILL_SHIFT_FEASIBILITY_ENGINE_VERSION;
  generatedAt: string;
  project: { id: string; name: string; blueprintEngineVersion: string; demandHorizon: "current" | "future" };
  input: SkillShiftFeasibilityInput;
  workflows: WorkflowSkillCoverageResult[];
  overallStatus: SkillShiftStatus | "not-applicable";
  summary: { workflowCount: number; coveredCount: number; failingCount: number; criticalFailingCount: number; controlledEvidenceCount: number; executionPeopleGap: number; reviewerPeopleGap: number };
  signals: Array<{ id: string; severity: "critical" | "watch" | "positive" | "information"; title: string; description: string; relatedRuleIds: string[] }>;
  assumptions: Array<{ id: string; value: string; confidence: "user-supplied" | "indicative"; evidenceNeeded: string }>;
  ruleTrace: Array<{ ruleId: string; ruleVersion: string; role: string; limitation: string }>;
  boundary: string;
}

const statusOrder: SkillShiftStatus[] = ["covered", "evidence-open", "reviewer-gap", "workload-gap", "shift-gap", "qualification-gap", "uncovered"];

function round(value: number, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function workflowHours(project: QualityLabProject, workflow: WorkflowDemand, horizon: "current" | "future") {
  return round(workflow.monthlyHandsOnHours * (horizon === "future" ? project.blueprint.future.multiplier : 1));
}

export function defaultSkillShiftFeasibilityInput(project: QualityLabProject): SkillShiftFeasibilityInput {
  const coverageByWorkflow = new Map((project.blueprint.workforceCapacity?.skillCoverage ?? []).flatMap((item) => item.workflowIds.map((id) => [id, item])));
  return skillShiftFeasibilityInputSchema.parse({
    projectId: project.id,
    demandHorizon: "future",
    operatingDaysPerMonth: project.input.workingDaysPerMonth,
    productiveHoursPerShift: project.input.productiveHoursPerShift,
    peakShiftFactor: 1.3,
    absenceScenarioPeople: 1,
    reviewerCoverageRequiredPerShift: 1,
    workflows: project.blueprint.workflows.filter((workflow) => workflow.monthlyHandsOnHours > 0).map((workflow) => {
      const floor = coverageByWorkflow.get(workflow.id)?.minimumQualifiedPeople ?? 1;
      return {
        workflowId: workflow.id,
        activeShifts: project.input.shifts,
        qualifiedPeople: floor,
        crossTrainedBackupPeople: 0,
        peopleScheduledPerShift: 1,
        authorizedReviewers: 1,
        evidenceBasis: "illustrative-stress" as const,
      };
    }),
  });
}

export function evaluateSkillShiftFeasibility(project: QualityLabProject, rawInput: SkillShiftFeasibilityInput): SkillShiftFeasibilityResult {
  const input = skillShiftFeasibilityInputSchema.parse(rawInput);
  const workflowById = new Map(project.blueprint.workflows.map((item) => [item.id, item]));
  const floorByWorkflow = new Map((project.blueprint.workforceCapacity?.skillCoverage ?? []).flatMap((item) => item.workflowIds.map((id) => [id, item.minimumQualifiedPeople])));
  const workflows = input.workflows.flatMap((configuration): WorkflowSkillCoverageResult[] => {
    const workflow = workflowById.get(configuration.workflowId);
    if (!workflow) return [];
    const monthlyHandsOnHours = workflowHours(project, workflow, input.demandHorizon);
    if (monthlyHandsOnHours <= 0) return [];
    const minimumQualifiedPeople = floorByWorkflow.get(workflow.id) ?? 1;
    const qualifiedPool = configuration.qualifiedPeople + configuration.crossTrainedBackupPeople;
    const absenceAdjustedPool = Math.max(0, qualifiedPool - input.absenceScenarioPeople);
    const simultaneousExecutionNeed = configuration.peopleScheduledPerShift * configuration.activeShifts;
    const executionPeopleGap = Math.max(0, simultaneousExecutionNeed - absenceAdjustedPool);
    const absenceAdjustedReviewers = Math.max(0, configuration.authorizedReviewers - input.absenceScenarioPeople);
    const simultaneousReviewerNeed = input.reviewerCoverageRequiredPerShift * configuration.activeShifts;
    const reviewerPeopleGap = Math.max(0, simultaneousReviewerNeed - absenceAdjustedReviewers);
    const peakHoursPerActiveShift = monthlyHandsOnHours * input.peakShiftFactor / input.operatingDaysPerMonth / configuration.activeShifts;
    const scheduledHoursPerShift = configuration.peopleScheduledPerShift * input.productiveHoursPerShift;
    const workloadHoursGapPerShift = Math.max(0, peakHoursPerActiveShift - scheduledHoursPerShift);
    let status: SkillShiftStatus;
    if (qualifiedPool === 0 || configuration.peopleScheduledPerShift === 0) status = "uncovered";
    else if (qualifiedPool < minimumQualifiedPeople) status = "qualification-gap";
    else if (executionPeopleGap > 0) status = "shift-gap";
    else if (workloadHoursGapPerShift > 0) status = "workload-gap";
    else if (reviewerPeopleGap > 0) status = "reviewer-gap";
    else if (configuration.evidenceBasis !== "controlled-qualification-record") status = "evidence-open";
    else status = "covered";
    return [{
      workflowId: workflow.id,
      workflowName: workflow.label,
      criticality: workflow.criticality,
      status,
      monthlyHandsOnHours,
      activeShifts: configuration.activeShifts,
      minimumQualifiedPeople,
      qualifiedPool,
      absenceAdjustedPool,
      simultaneousExecutionNeed,
      executionPeopleGap,
      authorizedReviewers: configuration.authorizedReviewers,
      absenceAdjustedReviewers,
      simultaneousReviewerNeed,
      reviewerPeopleGap,
      peakHoursPerActiveShift: round(peakHoursPerActiveShift),
      scheduledHoursPerShift: round(scheduledHoursPerShift),
      workloadHoursGapPerShift: round(workloadHoursGapPerShift),
      evidenceBasis: configuration.evidenceBasis,
      evidenceNeeded: [
        "Approved training, qualification and requalification status with effective dates and method version.",
        "Shift roster, leave and on-call assumptions mapped to named qualified people.",
        "Reviewer authorization scope, delegation rules and absence cover.",
        "Observed shift-level workload, handover and peak-arrival evidence.",
      ],
      relatedRuleIds: [workflow.ruleId, "core.workforce.skill-shift"],
    }];
  });

  const failing = workflows.filter((item) => !["covered", "evidence-open"].includes(item.status));
  const criticalFailing = failing.filter((item) => item.criticality === "critical");
  const signals: SkillShiftFeasibilityResult["signals"] = [];
  for (const workflow of criticalFailing) signals.push({ id: `critical-${workflow.workflowId}`, severity: "critical", title: `${workflow.workflowName} cannot sustain the selected shift stress`, description: `Status: ${workflow.status.replaceAll("-", " ")}. The concept has ${workflow.executionPeopleGap} execution-person and ${workflow.reviewerPeopleGap} reviewer-person gap(s) after the modeled absence.`, relatedRuleIds: workflow.relatedRuleIds });
  const executionGap = workflows.reduce((sum, item) => sum + item.executionPeopleGap, 0);
  const reviewerGap = workflows.reduce((sum, item) => sum + item.reviewerPeopleGap, 0);
  if (executionGap > 0) signals.push({ id: "execution-gap", severity: "watch", title: `${executionGap} concurrent execution-person gap(s)`, description: "Cross-training only closes this gap when the backup is qualified for the applicable method version and actually deployable on the required shift.", relatedRuleIds: ["core.workforce.skill-shift"] });
  if (reviewerGap > 0) signals.push({ id: "reviewer-gap", severity: "watch", title: `${reviewerGap} authorized reviewer-person gap(s)`, description: "Aggregate technical-review FTE does not prove authorized review availability on every active shift after absence.", relatedRuleIds: ["core.workforce.skill-shift"] });
  const openEvidence = workflows.filter((item) => item.evidenceBasis !== "controlled-qualification-record");
  if (openEvidence.length > 0) signals.push({ id: "evidence-open", severity: "information", title: `${openEvidence.length} workflow(s) still rely on unverified coverage inputs`, description: "Attach controlled qualification, authorization and roster records before treating structural coverage as operationally confirmed.", relatedRuleIds: ["core.workforce.skill-shift"] });
  if (workflows.length > 0 && failing.length === 0 && openEvidence.length === 0) signals.push({ id: "coverage-pass", severity: "positive", title: "All modeled workflows retain execution and reviewer coverage", description: "The structural screen passes the selected absence, shift and peak-load assumptions. It remains subject to QA and functional approval of the underlying records.", relatedRuleIds: ["core.workforce.skill-shift"] });
  if (workflows.length === 0) signals.push({ id: "no-workflows", severity: "information", title: "No in-scope workflow load is available", description: "Compile an in-house workflow demand profile before testing skill and shift feasibility.", relatedRuleIds: [] });

  const overallStatus = workflows.length ? workflows.reduce((worst, item) => statusOrder.indexOf(item.status) > statusOrder.indexOf(worst) ? item.status : worst, "covered" as SkillShiftStatus) : "not-applicable";
  return {
    engineVersion: SKILL_SHIFT_FEASIBILITY_ENGINE_VERSION,
    generatedAt: new Date().toISOString(),
    project: { id: project.id, name: project.name, blueprintEngineVersion: project.blueprint.engineVersion, demandHorizon: input.demandHorizon },
    input,
    workflows,
    overallStatus,
    summary: {
      workflowCount: workflows.length,
      coveredCount: workflows.filter((item) => item.status === "covered").length,
      failingCount: failing.length,
      criticalFailingCount: criticalFailing.length,
      controlledEvidenceCount: workflows.filter((item) => item.evidenceBasis === "controlled-qualification-record").length,
      executionPeopleGap: executionGap,
      reviewerPeopleGap: reviewerGap,
    },
    signals,
    assumptions: [
      { id: "absence", value: `${input.absenceScenarioPeople} unavailable person(s), stress-tested independently in execution and reviewer pools`, confidence: "user-supplied", evidenceNeeded: "Leave history, planned absence, on-call arrangements and role overlap between execution and review." },
      { id: "peak", value: `${input.peakShiftFactor}x average evenly distributed shift workload`, confidence: "indicative", evidenceNeeded: "Timestamped sample arrivals, campaigns, handovers and shift-level touch-time observations." },
      { id: "deployability", value: "Qualified and cross-trained people are assumed deployable on each configured active shift", confidence: "indicative", evidenceNeeded: "Named roster mapped to current qualification and authorization records." },
      { id: "review-independence", value: "Reviewer absence is conservatively tested independently from execution absence", confidence: "indicative", evidenceNeeded: "Named responsibility matrix showing dual-role constraints and reviewer delegation." },
    ],
    ruleTrace: [{ ruleId: "core.workforce.skill-shift", ruleVersion: SKILL_SHIFT_FEASIBILITY_ENGINE_VERSION, role: "Tests qualification floor, concurrent shift deployment, peak-shift execution capacity, authorized review and one-person absence resilience by workflow.", limitation: "Deterministic structural screen; it does not optimize rosters, sequence samples, verify credentials or approve staffing." }],
    boundary: "Atlas Skill Coverage & Shift Feasibility v1 is a planning stress screen, not a training record, qualification matrix, electronic roster, authorization decision or headcount approval. Controlled use requires current named-person records, method-version alignment, observed shift demand and qualified functional and QA review.",
  };
}
