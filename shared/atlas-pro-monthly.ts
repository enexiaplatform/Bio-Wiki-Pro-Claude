import { z } from "zod";

export const ATLAS_PRO_MONTHLY_REVIEW_VERSION = "atlas-pro-monthly-review/v1" as const;

export const atlasProMonthlyRoleValues = ["qc", "qa", "validation", "quality-leadership", "cross-functional"] as const;
export type AtlasProMonthlyRole = typeof atlasProMonthlyRoleValues[number];

export const atlasProMonthlyFocusValues = ["audit-readiness", "quality-signals", "method-capacity", "data-integrity", "supplier-control"] as const;
export type AtlasProMonthlyFocus = typeof atlasProMonthlyFocusValues[number];

export type AtlasProMonthlyActionStatus = "not-started" | "in-progress" | "waiting-review" | "closed";

export interface AtlasProMonthlyResource {
  label: string;
  href: string;
  kind: "evidence" | "workflow" | "tool" | "working-file";
}

export interface AtlasProMonthlyInput {
  month: string;
  role: AtlasProMonthlyRole;
  focus: AtlasProMonthlyFocus;
  decision: string;
  signal: string;
  evidenceHeld: string;
  evidenceNeeded: string;
  owner: string;
  reviewDate: string;
  outcome: string;
  carryover: string;
}

export interface AtlasProMonthlyReviewRecord {
  id: string;
  version: typeof ATLAS_PRO_MONTHLY_REVIEW_VERSION;
  input: AtlasProMonthlyInput;
  statuses: Record<AtlasProMonthlyCycleStep["id"], AtlasProMonthlyActionStatus>;
  updatedAt: string;
}

export interface AtlasProMonthlyCycleStep {
  id: "frame" | "verify" | "decide" | "close";
  label: string;
  outcome: string;
  action: string;
  evidence: string;
}

export const atlasProMonthlyInputSchema = z.object({
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
  role: z.enum(atlasProMonthlyRoleValues),
  focus: z.enum(atlasProMonthlyFocusValues),
  decision: z.string().trim().max(2000),
  signal: z.string().trim().max(3000),
  evidenceHeld: z.string().trim().max(5000),
  evidenceNeeded: z.string().trim().max(5000),
  owner: z.string().trim().max(200),
  reviewDate: z.union([z.literal(""), z.string().date()]),
  outcome: z.string().trim().max(5000),
  carryover: z.string().trim().max(5000),
});

const atlasProMonthlyActionStatusSchema = z.enum(["not-started", "in-progress", "waiting-review", "closed"]);

export const atlasProMonthlyReviewRecordSchema = z.object({
  id: z.string().trim().min(1).max(160),
  version: z.literal(ATLAS_PRO_MONTHLY_REVIEW_VERSION),
  input: atlasProMonthlyInputSchema,
  statuses: z.object({ frame: atlasProMonthlyActionStatusSchema, verify: atlasProMonthlyActionStatusSchema, decide: atlasProMonthlyActionStatusSchema, close: atlasProMonthlyActionStatusSchema }),
  updatedAt: z.string().datetime(),
});

interface AtlasProMonthlyFocusDefinition {
  label: string;
  promise: string;
  reviewQuestion: string;
  actions: [string, string, string, string];
  evidence: [string, string, string, string];
  resources: AtlasProMonthlyResource[];
}

export const ATLAS_PRO_MONTHLY_FOCUS: Record<AtlasProMonthlyFocus, AtlasProMonthlyFocusDefinition> = {
  "audit-readiness": {
    label: "Audit readiness",
    promise: "Keep one inspection scope moving from broad concern to an owned, evidence-linked readiness position.",
    reviewQuestion: "Which readiness claims can be demonstrated from controlled records today, and which still depend on assumption or verbal confirmation?",
    actions: [
      "Name the audit scope, likely reviewer path and the five records most likely to be requested first.",
      "Reconcile each readiness claim to a controlled record, process owner and current effective version.",
      "Prioritize gaps by product, patient, data-integrity and inspection impact; assign owners and dates.",
      "Record the review outcome, evidence accepted, residual gaps and next-month carryover without calling the site audit-ready.",
    ],
    evidence: ["Audit scope and inspection context", "Controlled records and evidence-request list", "Owned gap and CAPA register", "Management-review note and residual-risk record"],
    resources: [
      { label: "GMP Audit Readiness Kit", href: "/toolkits/gmp-audit-kit", kind: "working-file" },
      { label: "Audit Readiness Scorecard", href: "/tools/audit-readiness-scorecard", kind: "tool" },
      { label: "How to prepare for a GMP audit in 30 days", href: "/blog/gmp-audit-30-day-plan", kind: "evidence" },
    ],
  },
  "quality-signals": {
    label: "Quality signals",
    promise: "Turn recurring deviations, OOS/OOT results and trend signals into a disciplined monthly evidence and escalation review.",
    reviewQuestion: "What evidence would disprove the leading explanation, and which qualified role owns product, compliance or patient-impact disposition?",
    actions: [
      "Define the signal neutrally and separate observation, hypothesis, impact and decision already taken.",
      "Review recurrence, related records, trend history, investigation evidence and overdue effectiveness checks.",
      "Choose the next evidence request, escalation or decision owner without presenting correlation as root cause.",
      "Record the disposition boundary, effectiveness trigger and any unresolved signal carried into the next review.",
    ],
    evidence: ["Signal and event population", "Trend, investigation and effectiveness evidence", "Qualified disposition and escalation record", "Closure rationale and monitoring trigger"],
    resources: [
      { label: "OOS Investigation workflow", href: "/workflows/oos-investigation", kind: "workflow" },
      { label: "OOT Trend Triage Planner", href: "/tools/oot-trend-triage-planner", kind: "tool" },
      { label: "OOS Investigation Template", href: "/my-downloads", kind: "working-file" },
    ],
  },
  "method-capacity": {
    label: "Method and capacity",
    promise: "Keep one method, workload or resource decision tied to visible demand, capacity units, assumptions and verification needs.",
    reviewQuestion: "Which input would change the decision if it moved, and what controlled site or vendor evidence can resolve it?",
    actions: [
      "State the decision, planning horizon and natural demand or capacity unit before comparing options.",
      "Reconcile demand, execution time, equipment availability, analyst coverage, downtime and non-routine load evidence.",
      "Test the highest-impact uncertainty and document the alternative that remains viable if the assumption changes.",
      "Record the working decision, approval boundary, evidence still needed and the trigger for reopening the choice.",
    ],
    evidence: ["Decision and natural capacity unit", "Workload, time, availability and skill evidence", "Sensitivity or alternative-scenario record", "Working decision and reopening trigger"],
    resources: [
      { label: "Quality Lab tools", href: "/tools", kind: "tool" },
      { label: "Structured quality workflows", href: "/workflows", kind: "workflow" },
      { label: "Method and capacity evidence library", href: "/academy", kind: "evidence" },
    ],
  },
  "data-integrity": {
    label: "Data integrity",
    promise: "Review one record lifecycle or audit-trail risk each month with visible scope, exceptions, evidence and ownership.",
    reviewQuestion: "Can the record be reconstructed and trusted from contemporaneous, attributable evidence, including changes, review and system context?",
    actions: [
      "Choose the process, system, record population and risk-based review period.",
      "Sample original records, metadata, audit trails, access controls, review evidence and unexplained exceptions.",
      "Separate isolated error, control weakness and potential systemic integrity risk; assign qualified escalation.",
      "Record the review boundary, remediation evidence, effectiveness check and residual population not assessed.",
    ],
    evidence: ["System, record population and review period", "Original records, metadata and audit trails", "Exception classification and escalation", "Remediation and effectiveness evidence"],
    resources: [
      { label: "Data Integrity Review workflow", href: "/workflows/data-integrity-review", kind: "workflow" },
      { label: "Audit Trail Review Triage", href: "/tools/audit-trail-review-triage", kind: "tool" },
      { label: "Data Integrity Self-Check", href: "/my-downloads", kind: "working-file" },
    ],
  },
  "supplier-control": {
    label: "Supplier control",
    promise: "Keep critical supplier evidence, performance signals, changes and requalification triggers current rather than revisiting them only during an audit.",
    reviewQuestion: "Does current evidence still support the approved supplier scope, risk tier and reliance placed on incoming controls?",
    actions: [
      "Select the supplier, material or service scope and confirm the current risk tier and approved use.",
      "Review quality agreement status, changes, complaints, deviations, delivery performance and incoming verification evidence.",
      "Decide whether monitoring, escalation, audit, requalification or approved-scope change needs qualified review.",
      "Record the evidence basis, decision owner, next trigger and any unresolved supplier dependency.",
    ],
    evidence: ["Approved supplier scope and risk tier", "Agreement, change and performance evidence", "Qualified escalation or requalification basis", "Decision record and next review trigger"],
    resources: [
      { label: "Supplier Qualification workflow", href: "/workflows/supplier-qualification-workflow", kind: "workflow" },
      { label: "Supplier qualification and quality agreements", href: "/blog/supplier-qualification-quality-agreement", kind: "evidence" },
      { label: "Available Pro working files", href: "/toolkits", kind: "working-file" },
    ],
  },
};

const roleLabels: Record<AtlasProMonthlyRole, string> = {
  qc: "QC",
  qa: "QA",
  validation: "Validation",
  "quality-leadership": "Quality leadership",
  "cross-functional": "Cross-functional",
};

const meaningful = (value: string, minimum = 3) => value.trim().length >= minimum;

export function defaultAtlasProMonthlyInput(month: string): AtlasProMonthlyInput {
  return { month, role: "cross-functional", focus: "audit-readiness", decision: "", signal: "", evidenceHeld: "", evidenceNeeded: "", owner: "", reviewDate: "", outcome: "", carryover: "" };
}

export const exampleAtlasProMonthlyInput: AtlasProMonthlyInput = {
  month: "2026-07",
  role: "qa",
  focus: "quality-signals",
  decision: "Decide which recurring laboratory signals require escalation, deeper investigation or a controlled effectiveness check this month.",
  signal: "Three repeat deviations share a sample-handling step, while two effectiveness checks are overdue.",
  evidenceHeld: "Deviation register, OOS/OOT trend, sample-handling records and current CAPA status.",
  evidenceNeeded: "Training effectiveness, original-record review and qualified product-impact disposition.",
  owner: "Site QA lead",
  reviewDate: "2026-07-28",
  outcome: "",
  carryover: "Confirm whether the sample-handling control change reduced recurrence in the next monthly period.",
};

export function compileAtlasProMonthlyReview(input: AtlasProMonthlyInput) {
  const focus = ATLAS_PRO_MONTHLY_FOCUS[input.focus];
  const checks = [
    { label: "Decision", complete: meaningful(input.decision, 20) },
    { label: "Signal", complete: meaningful(input.signal, 20) },
    { label: "Evidence held", complete: meaningful(input.evidenceHeld, 10) },
    { label: "Evidence needed", complete: meaningful(input.evidenceNeeded, 10) },
    { label: "Owner", complete: meaningful(input.owner) },
    { label: "Review date", complete: meaningful(input.reviewDate, 8) },
  ];
  const completeCount = checks.filter((item) => item.complete).length;
  const steps: AtlasProMonthlyCycleStep[] = ["frame", "verify", "decide", "close"].map((id, index) => ({
    id: id as AtlasProMonthlyCycleStep["id"],
    label: ["Frame", "Verify", "Decide", "Close"][index],
    outcome: ["One bounded monthly decision", "A visible evidence basis", "An owned working decision", "A traceable outcome and carryover"][index],
    action: focus.actions[index],
    evidence: focus.evidence[index],
  }));
  return {
    version: ATLAS_PRO_MONTHLY_REVIEW_VERSION,
    title: `${focus.label} · ${input.month}`,
    focus,
    roleLabel: roleLabels[input.role],
    readiness: { completeCount, totalCount: checks.length, percent: Math.round((completeCount / checks.length) * 100), checks, missing: checks.filter((item) => !item.complete).map((item) => item.label) },
    steps,
    boundary: "This is a browser-local professional working record. It does not establish compliance, close an investigation or CAPA, approve a method or supplier, disposition product, replace a controlled site record, or provide project-specific expert review.",
  };
}

export function formatAtlasProMonthlyReview(input: AtlasProMonthlyInput, statuses: Partial<Record<AtlasProMonthlyCycleStep["id"], AtlasProMonthlyActionStatus>> = {}): string {
  const review = compileAtlasProMonthlyReview(input);
  return [
    `# Atlas Pro Monthly Quality Review — ${review.title}`,
    `Version: ${review.version}`,
    `Role lens: ${review.roleLabel}`,
    `Working completeness: ${review.readiness.completeCount}/${review.readiness.totalCount} (${review.readiness.percent}%)`,
    "",
    `> ${review.boundary}`,
    "",
    "## Monthly decision mandate",
    `- Decision: ${input.decision || "Not yet described"}`,
    `- Signal or trigger: ${input.signal || "Not yet described"}`,
    `- Owner: ${input.owner || "Not assigned"}`,
    `- Review date: ${input.reviewDate || "Not scheduled"}`,
    "",
    "## Evidence basis",
    `- Evidence held: ${input.evidenceHeld || "Not yet described"}`,
    `- Evidence still needed: ${input.evidenceNeeded || "Not yet described"}`,
    "",
    "## Monthly operating cycle",
    ...review.steps.flatMap((step, index) => [
      `### ${index + 1}. ${step.label} — ${(statuses[step.id] ?? "not-started").replaceAll("-", " ")}`,
      step.action,
      `Expected evidence: ${step.evidence}`,
      "",
    ]),
    "## Outcome and carryover",
    `- Working outcome: ${input.outcome || "Open"}`,
    `- Carryover / next trigger: ${input.carryover || "Not yet recorded"}`,
    "",
    "## Connected Atlas resources",
    ...review.focus.resources.map((resource) => `- [${resource.label}](${resource.href}) — ${resource.kind.replaceAll("-", " ")}`),
    "",
    `Review question: ${review.focus.reviewQuestion}`,
  ].join("\n");
}
