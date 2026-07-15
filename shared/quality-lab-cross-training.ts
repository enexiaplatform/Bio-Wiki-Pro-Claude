import { z } from "zod";
import type { SkillShiftFeasibilityResult, WorkflowSkillCoverageResult } from "./quality-lab-skill-coverage.js";

export const CROSS_TRAINING_PRIORITY_ENGINE_VERSION = "cross-training-priority/v1.0" as const;

export const crossTrainingWorkflowOptionSchema = z.object({
  workflowId: z.string().min(1),
  availableExecutionCandidates: z.number().int().min(0).max(100),
  executionLeadTimeWeeks: z.number().min(0).max(104),
  trainerHoursPerExecutionCandidate: z.number().min(0).max(10_000),
  costPerExecutionCandidateUsd: z.number().min(0).max(1_000_000),
  availableReviewerCandidates: z.number().int().min(0).max(100),
  reviewerLeadTimeWeeks: z.number().min(0).max(104),
  trainerHoursPerReviewerCandidate: z.number().min(0).max(10_000),
  costPerReviewerCandidateUsd: z.number().min(0).max(1_000_000),
});

export const crossTrainingPriorityInputSchema = z.object({
  maximumPeopleActions: z.number().int().min(0).max(500),
  maximumBudgetUsd: z.number().min(0).max(100_000_000),
  maximumTrainerHours: z.number().min(0).max(100_000),
  planningHorizonWeeks: z.number().min(1).max(104),
  workflows: z.array(crossTrainingWorkflowOptionSchema).max(100),
});

export type CrossTrainingWorkflowOption = z.infer<typeof crossTrainingWorkflowOptionSchema>;
export type CrossTrainingPriorityInput = z.infer<typeof crossTrainingPriorityInputSchema>;
export type CrossTrainingActionType = "execution-cross-training" | "reviewer-authorization";

export interface CrossTrainingPriorityAction {
  id: string;
  rank: number;
  workflowId: string;
  workflowName: string;
  actionType: CrossTrainingActionType;
  priority: "immediate" | "next" | "monitor";
  riskScore: number;
  peopleRequired: number;
  availableCandidates: number;
  peopleAllocated: number;
  deferredPeople: number;
  leadTimeWeeks: number;
  trainerHoursPerCandidate: number;
  costPerCandidateUsd: number;
  allocatedTrainerHours: number;
  allocatedCostUsd: number;
  evidenceConfidence: "controlled" | "estimated" | "illustrative";
  rationale: string;
  projectedOutcome: string;
  evidenceNeeded: string[];
  relatedRuleIds: string[];
}

export interface CrossTrainingPriorityResult {
  engineVersion: typeof CROSS_TRAINING_PRIORITY_ENGINE_VERSION;
  generatedAt: string;
  sourceEngineVersion: string;
  project: SkillShiftFeasibilityResult["project"];
  input: CrossTrainingPriorityInput;
  actions: CrossTrainingPriorityAction[];
  summary: { actionCount: number; peopleRequired: number; peopleAllocated: number; deferredPeople: number; allocatedBudgetUsd: number; allocatedTrainerHours: number; workflowsWithResidualGap: number; infeasibleWithinHorizonCount: number };
  signals: Array<{ id: string; severity: "critical" | "watch" | "positive" | "information"; title: string; description: string }>;
  assumptions: Array<{ id: string; value: string; evidenceNeeded: string }>;
  ruleTrace: Array<{ ruleId: string; ruleVersion: string; role: string; limitation: string }>;
  boundary: string;
}

function evidenceConfidence(workflow: WorkflowSkillCoverageResult): CrossTrainingPriorityAction["evidenceConfidence"] {
  if (workflow.evidenceBasis === "controlled-qualification-record") return "controlled";
  if (workflow.evidenceBasis === "user-supplied-estimate") return "estimated";
  return "illustrative";
}

function criticalityWeight(workflow: WorkflowSkillCoverageResult) {
  return workflow.criticality === "critical" ? 50 : workflow.criticality === "important" ? 32 : 18;
}

function statusWeight(workflow: WorkflowSkillCoverageResult) {
  if (workflow.status === "uncovered") return 35;
  if (workflow.status === "qualification-gap") return 30;
  if (workflow.status === "shift-gap") return 25;
  if (workflow.status === "workload-gap") return 20;
  if (workflow.status === "reviewer-gap") return 15;
  return 0;
}

function priority(score: number): CrossTrainingPriorityAction["priority"] {
  return score >= 85 ? "immediate" : score >= 60 ? "next" : "monitor";
}

export function defaultCrossTrainingPriorityInput(coverage: SkillShiftFeasibilityResult): CrossTrainingPriorityInput {
  return crossTrainingPriorityInputSchema.parse({
    maximumPeopleActions: 5,
    maximumBudgetUsd: 10_000,
    maximumTrainerHours: 80,
    planningHorizonWeeks: 12,
    workflows: coverage.workflows.map((workflow) => ({
      workflowId: workflow.workflowId,
      availableExecutionCandidates: 2,
      executionLeadTimeWeeks: 6,
      trainerHoursPerExecutionCandidate: 12,
      costPerExecutionCandidateUsd: 1_200,
      availableReviewerCandidates: 1,
      reviewerLeadTimeWeeks: 4,
      trainerHoursPerReviewerCandidate: 6,
      costPerReviewerCandidateUsd: 500,
    })),
  });
}

export function prioritizeCrossTraining(coverage: SkillShiftFeasibilityResult, rawInput: CrossTrainingPriorityInput): CrossTrainingPriorityResult {
  const input = crossTrainingPriorityInputSchema.parse(rawInput);
  const optionByWorkflow = new Map(input.workflows.map((item) => [item.workflowId, item]));
  const maxMonthlyHours = Math.max(1, ...coverage.workflows.map((item) => item.monthlyHandsOnHours));
  const drafts: Omit<CrossTrainingPriorityAction, "rank" | "peopleAllocated" | "deferredPeople" | "allocatedTrainerHours" | "allocatedCostUsd" | "priority" | "projectedOutcome">[] = [];

  for (const workflow of coverage.workflows) {
    const option = optionByWorkflow.get(workflow.workflowId);
    if (!option) continue;
    const qualificationGap = Math.max(0, workflow.minimumQualifiedPeople - workflow.qualifiedPool);
    const workloadPeopleGap = Math.ceil(workflow.workloadHoursGapPerShift / Math.max(0.5, coverage.input.productiveHoursPerShift));
    const executionRequired = Math.max(qualificationGap, workflow.executionPeopleGap, workloadPeopleGap);
    const volumeWeight = Math.round(workflow.monthlyHandsOnHours / maxMonthlyHours * 15);
    const baseScore = criticalityWeight(workflow) + statusWeight(workflow) + volumeWeight;
    if (executionRequired > 0) drafts.push({
      id: `execution-${workflow.workflowId}`,
      workflowId: workflow.workflowId,
      workflowName: workflow.workflowName,
      actionType: "execution-cross-training",
      riskScore: Math.min(100, baseScore + (workflow.qualifiedPool === 0 ? 10 : 0)),
      peopleRequired: executionRequired,
      availableCandidates: option.availableExecutionCandidates,
      leadTimeWeeks: option.executionLeadTimeWeeks,
      trainerHoursPerCandidate: option.trainerHoursPerExecutionCandidate,
      costPerCandidateUsd: option.costPerExecutionCandidateUsd,
      evidenceConfidence: evidenceConfidence(workflow),
      rationale: `Close the largest of the qualification-floor, simultaneous-shift and peak-workload gaps (${executionRequired} person(s)) for a ${workflow.criticality} workflow.`,
      evidenceNeeded: ["Approved curriculum and current method version", "Named trainer and candidate competence prerequisites", "Observed supervised runs and qualification acceptance criteria", "Shift roster showing post-qualification deployability"],
      relatedRuleIds: [...workflow.relatedRuleIds, "core.workforce.cross-training-priority"],
    });
    if (workflow.reviewerPeopleGap > 0) drafts.push({
      id: `reviewer-${workflow.workflowId}`,
      workflowId: workflow.workflowId,
      workflowName: workflow.workflowName,
      actionType: "reviewer-authorization",
      riskScore: Math.min(100, criticalityWeight(workflow) + 25 + volumeWeight),
      peopleRequired: workflow.reviewerPeopleGap,
      availableCandidates: option.availableReviewerCandidates,
      leadTimeWeeks: option.reviewerLeadTimeWeeks,
      trainerHoursPerCandidate: option.trainerHoursPerReviewerCandidate,
      costPerCandidateUsd: option.costPerReviewerCandidateUsd,
      evidenceConfidence: evidenceConfidence(workflow),
      rationale: `Add ${workflow.reviewerPeopleGap} authorized reviewer(s) so the selected active shifts retain review coverage after the modeled absence.`,
      evidenceNeeded: ["Defined reviewer scope and delegation rules", "Competence assessment against the applicable method and data-review requirements", "Documented authorization with effective date", "Roster and dual-role conflict review"],
      relatedRuleIds: [...workflow.relatedRuleIds, "core.workforce.cross-training-priority"],
    });
  }

  drafts.sort((a, b) => b.riskScore - a.riskScore || a.leadTimeWeeks - b.leadTimeWeeks || a.id.localeCompare(b.id));
  let remainingPeople = input.maximumPeopleActions;
  let remainingBudget = input.maximumBudgetUsd;
  let remainingTrainerHours = input.maximumTrainerHours;
  const actions = drafts.map((draft, index): CrossTrainingPriorityAction => {
    const candidateLimit = Math.min(draft.peopleRequired, draft.availableCandidates);
    const horizonEligible = draft.leadTimeWeeks <= input.planningHorizonWeeks;
    const budgetLimit = draft.costPerCandidateUsd > 0 ? Math.floor(remainingBudget / draft.costPerCandidateUsd) : candidateLimit;
    const trainerLimit = draft.trainerHoursPerCandidate > 0 ? Math.floor(remainingTrainerHours / draft.trainerHoursPerCandidate) : candidateLimit;
    const peopleAllocated = horizonEligible ? Math.max(0, Math.min(candidateLimit, remainingPeople, budgetLimit, trainerLimit)) : 0;
    const allocatedCostUsd = peopleAllocated * draft.costPerCandidateUsd;
    const allocatedTrainerHours = peopleAllocated * draft.trainerHoursPerCandidate;
    remainingPeople -= peopleAllocated;
    remainingBudget -= allocatedCostUsd;
    remainingTrainerHours -= allocatedTrainerHours;
    const deferredPeople = draft.peopleRequired - peopleAllocated;
    return {
      ...draft,
      rank: index + 1,
      priority: priority(draft.riskScore),
      peopleAllocated,
      deferredPeople,
      allocatedCostUsd,
      allocatedTrainerHours,
      projectedOutcome: deferredPeople === 0 ? "The modeled people gap closes if candidates complete qualification and are deployed as assumed." : `${deferredPeople} person(s) remain unresolved because of candidate, horizon, slot, budget or trainer-hour constraints.`,
    };
  });

  const peopleRequired = actions.reduce((sum, item) => sum + item.peopleRequired, 0);
  const peopleAllocated = actions.reduce((sum, item) => sum + item.peopleAllocated, 0);
  const deferredPeople = peopleRequired - peopleAllocated;
  const residualWorkflowIds = new Set(actions.filter((item) => item.deferredPeople > 0).map((item) => item.workflowId));
  const infeasibleWithinHorizonCount = actions.filter((item) => item.leadTimeWeeks > input.planningHorizonWeeks).length;
  const signals: CrossTrainingPriorityResult["signals"] = [];
  if (actions.some((item) => item.priority === "immediate" && item.deferredPeople > 0)) signals.push({ id: "immediate-deferred", severity: "critical", title: "One or more immediate actions remain unfunded or infeasible", description: "Increase capacity only after confirming candidates, training evidence, trainer availability and the operational consequence of delay." });
  if (infeasibleWithinHorizonCount > 0) signals.push({ id: "horizon-gap", severity: "watch", title: `${infeasibleWithinHorizonCount} action(s) exceed the planning horizon`, description: "Lead-time compression is not assumed. Consider temporary qualified coverage, scope phasing or an approved continuity arrangement." });
  if (actions.some((item) => item.evidenceConfidence === "illustrative")) signals.push({ id: "illustrative-basis", severity: "information", title: "Priority scores still depend on illustrative coverage inputs", description: "Use the ranking for discovery, not resource approval, until the qualification matrix, roster and authorization evidence are controlled." });
  if (actions.length > 0 && deferredPeople === 0) signals.push({ id: "portfolio-fit", severity: "positive", title: "The selected portfolio constraints fund every modeled people action", description: "This is a feasible planning allocation, conditional on candidate suitability, qualification success and actual shift deployment." });
  if (actions.length === 0) signals.push({ id: "no-actions", severity: "positive", title: "No new people actions are generated by the current coverage scenario", description: "Continue monitoring qualification expiry, roster changes, demand peaks and reviewer authorization scope." });

  return {
    engineVersion: CROSS_TRAINING_PRIORITY_ENGINE_VERSION,
    generatedAt: new Date().toISOString(),
    sourceEngineVersion: coverage.engineVersion,
    project: coverage.project,
    input,
    actions,
    summary: { actionCount: actions.length, peopleRequired, peopleAllocated, deferredPeople, allocatedBudgetUsd: actions.reduce((sum, item) => sum + item.allocatedCostUsd, 0), allocatedTrainerHours: actions.reduce((sum, item) => sum + item.allocatedTrainerHours, 0), workflowsWithResidualGap: residualWorkflowIds.size, infeasibleWithinHorizonCount },
    signals,
    assumptions: [
      { id: "one-person-one-action", value: "One execution qualification or reviewer authorization consumes one portfolio action", evidenceNeeded: "Confirm whether curricula can be combined without weakening scope-specific qualification." },
      { id: "successful-completion", value: "Allocated candidates complete qualification within the stated lead time", evidenceNeeded: "Historical completion, failure, rework and trainer-capacity data." },
      { id: "separate-tracks", value: "Execution and reviewer actions are planned separately even when one person could hold both roles", evidenceNeeded: "Named responsibility matrix and dual-role independence constraints." },
    ],
    ruleTrace: [{ ruleId: "core.workforce.cross-training-priority", ruleVersion: CROSS_TRAINING_PRIORITY_ENGINE_VERSION, role: "Ranks workflow-specific qualification and reviewer actions, then allocates them within user-supplied candidate, time, budget, slot and trainer-hour constraints.", limitation: "Deterministic greedy portfolio heuristic; it does not prove a global optimum, candidate competence, qualification success, labor availability or authorization." }],
    boundary: "Atlas Cross-training Priority v1 is a resource-prioritization aid, not a training plan, LMS, qualification protocol, reviewer appointment, roster change or staffing approval. Final sequencing requires named candidates, controlled curricula, trainer approval, labor planning and QA/functional authorization.",
  };
}
