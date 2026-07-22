export type AtlasProWorkflowId = "audit-readiness" | "quality-signal" | "method-capacity";

export interface AtlasProWorkflow {
  id: AtlasProWorkflowId;
  question: string;
  evidence: string;
  tool: string;
  workingFile: string;
  firstStep: string;
  reviewPrompt: string;
  href: string;
  cta: string;
}

export const ATLAS_PRO_WORKFLOWS: AtlasProWorkflow[] = [
  {
    id: "audit-readiness",
    question: "Prepare for a GMP audit",
    evidence: "Understand audit logic, evidence expectations, interview risk, CAPA boundaries, and the difference between an observation and a verified gap.",
    tool: "Run a structured readiness check and convert each gap into an owned action with evidence and a due date.",
    workingFile: "Reuse the GMP Audit Readiness Kit for evidence requests, gap review, interviews, CAPA planning, and follow-up.",
    firstStep: "Choose one audit scope and list the five records or system controls that a reviewer would request first.",
    reviewPrompt: "Which claims are supported by controlled records, which are assumptions, and which need QA or process-owner confirmation?",
    href: "/toolkits/gmp-audit-kit",
    cta: "Inspect the audit kit",
  },
  {
    id: "quality-signal",
    question: "Investigate a quality signal",
    evidence: "Review deviation, OOS/OOT, data-integrity, root-cause, and effectiveness-check reasoning before choosing a path.",
    tool: "Apply a focused workflow or calculator while keeping observations, hypotheses, decisions, assumptions, and limits separate.",
    workingFile: "Capture evidence, decisions, owners, due dates, review status, and effectiveness checks in a reusable working record.",
    firstStep: "Write one neutral problem statement that separates the observed signal from the suspected cause and potential impact.",
    reviewPrompt: "What evidence would disprove the leading hypothesis, and who is qualified to disposition product, compliance, or patient impact?",
    href: "/workflows",
    cta: "Explore quality workflows",
  },
  {
    id: "method-capacity",
    question: "Make a method or capacity decision",
    evidence: "Understand method applicability, execution steps, resource dependencies, confidence, and the evidence still required for the decision.",
    tool: "Test inputs and scenarios without hiding formulas, site assumptions, capacity units, or uncertainty.",
    workingFile: "Carry the result into a checklist or worksheet that records the basis, alternatives, trigger, reviewer, and next evidence request.",
    firstStep: "Name the decision and natural capacity unit before collecting equipment or cost numbers.",
    reviewPrompt: "Which input would change the decision if it moved, and what site or vendor evidence can resolve it?",
    href: "/tools",
    cta: "Explore decision tools",
  },
];

export function getAtlasProWorkflow(id: AtlasProWorkflowId): AtlasProWorkflow {
  return ATLAS_PRO_WORKFLOWS.find((item) => item.id === id) ?? ATLAS_PRO_WORKFLOWS[0];
}

export function formatAtlasProWorkflowBrief(id: AtlasProWorkflowId): string {
  const workflow = getAtlasProWorkflow(id);
  return [
    `# Atlas Pro Work Brief - ${workflow.question}`,
    "Planning boundary: reusable professional workflow support; not project-specific expert review, QA approval, regulatory advice, or a controlled site record.",
    "",
    "## Evidence to understand",
    workflow.evidence,
    "",
    "## Tool or model to apply",
    workflow.tool,
    "",
    "## Working file to maintain",
    workflow.workingFile,
    "",
    "## First step",
    workflow.firstStep,
    "",
    "## Review question",
    workflow.reviewPrompt,
  ].join("\n");
}
