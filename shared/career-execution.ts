import { z } from "zod";
import { buildCareerAnalysis, buildCareerProofExperiment, careerProfileSchema, type CareerProfile } from "./career-blueprint.js";

export const CAREER_EXECUTION_VERSION = "career-execution/v1" as const;
export const careerExecutionStatusValues = ["not-started", "in-progress", "waiting-review", "complete"] as const;
export type CareerExecutionStatus = typeof careerExecutionStatusValues[number];
export const careerExecutionDecisionValues = ["not-decided", "continue", "adjust", "pivot"] as const;
export type CareerExecutionDecision = typeof careerExecutionDecisionValues[number];

export interface CareerExecutionWeekDefinition {
  week: number;
  phase: "validate" | "build" | "prove" | "transition";
  phaseLabel: string;
  title: string;
  action: string;
  evidencePrompt: string;
  reviewQuestion: string;
  effortHours: number;
}

export interface CareerExecutionWeekRecord {
  week: number;
  status: CareerExecutionStatus;
  evidenceNote: string;
  artifactReference: string;
  reviewerFeedback: string;
  reflection: string;
}

export interface CareerExecutionRecord {
  id: string;
  version: typeof CAREER_EXECUTION_VERSION;
  profile: CareerProfile;
  routeId: string;
  routeTitle: string;
  plan: CareerExecutionWeekDefinition[];
  weeks: CareerExecutionWeekRecord[];
  decision: CareerExecutionDecision;
  decisionRationale: string;
  nextReviewDate: string;
  updatedAt: string;
}

const careerExecutionWeekRecordSchema = z.object({
  week: z.number().int().min(1).max(13),
  status: z.enum(careerExecutionStatusValues),
  evidenceNote: z.string().trim().max(3000),
  artifactReference: z.string().trim().max(1000),
  reviewerFeedback: z.string().trim().max(3000),
  reflection: z.string().trim().max(3000),
});

const careerExecutionWeekDefinitionSchema = z.object({
  week: z.number().int().min(1).max(13),
  phase: z.enum(["validate", "build", "prove", "transition"]),
  phaseLabel: z.string().trim().min(2).max(100),
  title: z.string().trim().min(2).max(200),
  action: z.string().trim().min(10).max(3000),
  evidencePrompt: z.string().trim().min(10).max(2000),
  reviewQuestion: z.string().trim().min(10).max(1000),
  effortHours: z.number().int().min(1).max(10),
});

export const careerExecutionRecordSchema = z.object({
  id: z.string().trim().min(1).max(160),
  version: z.literal(CAREER_EXECUTION_VERSION),
  profile: careerProfileSchema,
  routeId: z.string().trim().min(2).max(80),
  routeTitle: z.string().trim().min(2).max(160),
  plan: z.array(careerExecutionWeekDefinitionSchema).length(13),
  weeks: z.array(careerExecutionWeekRecordSchema).length(13),
  decision: z.enum(careerExecutionDecisionValues),
  decisionRationale: z.string().trim().max(3000),
  nextReviewDate: z.union([z.literal(""), z.string().date()]),
  updatedAt: z.string().datetime(),
});

function week(
  weekNumber: number,
  phase: CareerExecutionWeekDefinition["phase"],
  phaseLabel: string,
  title: string,
  action: string,
  evidencePrompt: string,
  reviewQuestion: string,
  effortHours: number,
): CareerExecutionWeekDefinition {
  return { week: weekNumber, phase, phaseLabel, title, action, evidencePrompt, reviewQuestion, effortHours };
}

export function buildCareerExecutionPlan(profile: CareerProfile, selectedRouteId?: string): CareerExecutionWeekDefinition[] {
  const analysis = buildCareerAnalysis(profile, selectedRouteId ?? profile.selectedRouteId);
  const experiment = buildCareerProofExperiment(profile, analysis.selectedRoute.id);
  const [priority, adjacent] = analysis.recommendations;
  const hours = profile.weeklyHours;
  const reviewer = profile.managerSupport === "yes" ? "manager or authorized reviewer" : "qualified mentor, manager, or technical reviewer";

  return [
    week(1, "validate", "Validate the route", "Decode the target role", `Review 5-8 real ${analysis.selectedRoute.title} role descriptions or one controlled internal role profile. Separate recurring requirements from employer-specific preferences.`, "A requirement matrix with source, frequency, evidence state, and unknowns.", "Which requirements are genuinely common enough to plan against?", Math.min(hours, 4)),
    week(2, "validate", "Validate the route", "Inventory evidence without inflation", `Map your current evidence against the role matrix. Keep participation, bounded contribution, reviewed ownership, and outcome evidence separate.`, "A sanitized evidence inventory with explicit gaps and confidentiality boundaries.", "Which claims can a reviewer verify today, and which are still aspirations?", hours),
    week(3, "validate", "Validate the route", "Challenge route fit", `Review the route, assumptions, constraints, and adjacent option with a ${reviewer}.`, "Reviewer notes, corrected assumptions, and a keep/adjust decision for the route.", "What evidence or constraint would change the recommended route?", Math.min(hours, 3)),
    week(4, "build", "Build priority proof", "Scope one bounded proof experiment", experiment.action, "A one-page experiment charter naming the outcome, boundary, reviewer, artifact, and stop condition.", experiment.reviewerQuestion, Math.min(hours, 4)),
    week(5, "build", "Build priority proof", "Create the first evidence increment", `Complete the smallest credible increment of ${priority.title.toLowerCase()} in the approved practice context.`, priority.proof ?? experiment.artifact, "Does this artifact show a decision or outcome, rather than activity alone?", hours),
    week(6, "build", "Build priority proof", "Obtain reviewer challenge", `Ask the named reviewer to test your contribution boundary, technical reasoning, and unsupported claims.`, "Dated reviewer feedback with corrections kept separate from the original claim.", experiment.reviewerQuestion, Math.min(hours, 3)),
    week(7, "build", "Build priority proof", "Revise to a defensible claim", "Revise the artifact once, state what you owned, what others owned, what changed, and what remains unknown.", "A sanitized before/after claim plus the retained evidence reference.", "Would this wording remain accurate under interview follow-up?", Math.min(hours, 4)),
    week(8, "prove", "Prove ownership", "Choose a second proof signal", adjacent?.firstAction ?? adjacent?.title ?? "Choose one adjacent capability that strengthens the target route.", adjacent?.proof ?? "A scoped second proof asset with a named reviewer and observable outcome.", "Does the second signal broaden the route evidence or merely repeat the first?", hours),
    week(9, "prove", "Prove ownership", "Make the outcome observable", "Record the before state, intervention, contribution, result, limitations, and any metric that can be shared without confidential data.", "An outcome note that distinguishes observation from attribution.", "What changed, and how much of that change can you credibly attribute to your work?", Math.min(hours, 4)),
    week(10, "prove", "Prove ownership", "Run an evidence acceptance review", `Ask a ${reviewer} to classify each priority claim as unsupported, participation, bounded contribution, or reviewed ownership.`, "A reviewer-classified claim register with gaps and next evidence requests.", "Which claim is strong enough to use now, and which still needs proof?", Math.min(hours, 3)),
    week(11, "transition", "Run the transition", "Translate proof into positioning", `Rewrite the strongest accepted evidence for a ${analysis.selectedRoute.title} CV, LinkedIn profile, and internal career conversation.`, "Two CV bullets and one concise positioning statement traceable to accepted evidence.", "Does every sentence preserve the contribution boundary and outcome evidence?", hours),
    week(12, "transition", "Run the transition", "Test the story in conversation", "Run two interview drills and at least one real manager, mentor, recruiter, or market conversation.", "A question log, feedback notes, and revised six-story bank.", "Where did the evidence become vague, overstated, or unconvincing under challenge?", hours),
    week(13, "transition", "Run the transition", "Make the route decision", `Use evidence gained, reviewer signals, constraints, and real market feedback to continue, adjust, or pivot from ${analysis.selectedRoute.title}.`, "A dated decision note, rationale, next review date, and fallback route if needed.", "What new evidence justifies continuing, adjusting, or pivoting?", Math.min(hours, 3)),
  ];
}

export function createCareerExecutionRecord(profile: CareerProfile, selectedRouteId?: string, now = new Date()): CareerExecutionRecord {
  const analysis = buildCareerAnalysis(profile, selectedRouteId ?? profile.selectedRouteId);
  const plan = buildCareerExecutionPlan(profile, analysis.selectedRoute.id);
  return {
    id: `career_execution_${now.getTime()}`,
    version: CAREER_EXECUTION_VERSION,
    profile: { ...profile, selectedRouteId: analysis.selectedRoute.id },
    routeId: analysis.selectedRoute.id,
    routeTitle: analysis.selectedRoute.title,
    plan,
    weeks: plan.map((item) => ({ week: item.week, status: "not-started", evidenceNote: "", artifactReference: "", reviewerFeedback: "", reflection: "" })),
    decision: "not-decided",
    decisionRationale: "",
    nextReviewDate: "",
    updatedAt: now.toISOString(),
  };
}

export function compileCareerExecution(record: CareerExecutionRecord) {
  const plan = record.plan;
  const completeWeeks = record.weeks.filter((item) => item.status === "complete").length;
  const reviewedWeeks = record.weeks.filter((item) => item.reviewerFeedback.trim().length >= 10).length;
  const evidenceWeeks = record.weeks.filter((item) => item.evidenceNote.trim().length >= 10 || item.artifactReference.trim().length >= 3).length;
  const currentWeek = record.weeks.find((item) => item.status !== "complete")?.week ?? 13;
  const phases = (["validate", "build", "prove", "transition"] as const).map((phase) => {
    const phaseWeeks = plan.filter((item) => item.phase === phase);
    const completed = phaseWeeks.filter((item) => record.weeks.find((state) => state.week === item.week)?.status === "complete").length;
    return { id: phase, label: phaseWeeks[0].phaseLabel, complete: completed, total: phaseWeeks.length };
  });
  return {
    plan,
    completeWeeks,
    evidenceWeeks,
    reviewedWeeks,
    currentWeek,
    percent: Math.round((completeWeeks / 13) * 100),
    phases,
    boundary: "This workspace is a personal planning and evidence-organizing aid. It does not verify competence, employer authorization, confidential records, reviewer qualifications, hiring outcomes, compensation, or job availability.",
  };
}

export function formatCareerExecution(record: CareerExecutionRecord) {
  const analysis = buildCareerAnalysis(record.profile, record.routeId);
  const compiled = compileCareerExecution(record);
  return [
    `# ${record.profile.fullName} — 13-Week Career Blueprint Execution Brief`,
    `Target route: ${analysis.selectedRoute.title}`,
    `Updated: ${record.updatedAt}`,
    `Progress: ${compiled.completeWeeks}/13 weeks complete`,
    "",
    `> ${compiled.boundary}`,
    "",
    "## Weekly execution record",
    ...compiled.plan.flatMap((item) => {
      const state = record.weeks.find((candidate) => candidate.week === item.week)!;
      return [
        `### Week ${item.week}: ${item.title} — ${state.status.replaceAll("-", " ")}`,
        `Action: ${item.action}`,
        `Expected evidence: ${item.evidencePrompt}`,
        `Evidence note: ${state.evidenceNote || "Open"}`,
        `Artifact reference: ${state.artifactReference || "Open"}`,
        `Reviewer feedback: ${state.reviewerFeedback || "Open"}`,
        `Reflection: ${state.reflection || "Open"}`,
        "",
      ];
    }),
    "## Route decision gate",
    `- Decision: ${record.decision.replaceAll("-", " ")}`,
    `- Rationale: ${record.decisionRationale || "Open"}`,
    `- Next review date: ${record.nextReviewDate || "Open"}`,
  ].join("\n");
}
