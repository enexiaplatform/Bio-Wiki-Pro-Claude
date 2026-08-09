export type AtlasProWorkflowId = "audit-readiness" | "quality-signal" | "method-capacity" | "pharma-api-impurity-control" | "biopharma-control-strategy";

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
  version: "atlas-pro-workflow/v2";
  lessonSlugs: string[];
  workingAssetId: string;
  qualityGate: "under-review" | "featured";
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
    version: "atlas-pro-workflow/v2",
    lessonSlugs: ["batch-record-review", "capa-fundamentals", "data-integrity-deep-dive", "supplier-qualification"],
    workingAssetId: "gmp_audit_kit",
    qualityGate: "under-review",
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
    version: "atlas-pro-workflow/v2",
    lessonSlugs: ["oos-investigation-deep-dive", "out-of-trend-investigation", "microbial-excursion-investigation", "statistical-process-control", "atlas-pro-monthly-quality-review"],
    workingAssetId: "oos_investigation_template",
    qualityGate: "under-review",
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
    version: "atlas-pro-workflow/v2",
    lessonSlugs: ["analytical-method-transfer", "analytical-procedure-lifecycle-q14", "decision-led-doe-and-multivariate-process-evidence", "water-system-validation", "objectionable-organisms"],
    workingAssetId: "lab_water_selection_checklist",
    qualityGate: "under-review",
  },
  {
    id: "pharma-api-impurity-control",
    question: "Build a Pharma API route-to-routine control strategy",
    evidence: "Connect starting materials, route, reaction/work-up, scale-up, isolation/solid-state, impurity origin and fate, analytical capability, validation, routine manufacture, transfer, control placement, changes and accountable decisions.",
    tool: "Challenge each process, material, impurity, analytical, scale-up or lifecycle claim against genealogy, sampling, comparable basis, method capability, variability, mechanism, exact process applicability and authorized review.",
    workingFile: "Use the Pharma API sequence of Decision Briefs to keep route/input, reaction/work-up, scale-up, isolation/solid-state, impurity, analytical, validation, routine and lifecycle evidence connected without turning an observation into a transferable process or purge claim.",
    firstStep: "Name the exact drug substance, form, route/process version and one impurity or change decision before entering results.",
    reviewPrompt: "Which claim is supported by comparable route-stage and analytical evidence, which remains a hypothesis, and who is qualified to decide safety, specification, validation, filing or disposition?",
    href: "/workflows/pharma-api-impurity-control",
    cta: "Open the API control workflow",
    version: "atlas-pro-workflow/v2",
    lessonSlugs: ["pharma-api-full-lifecycle-drug-substance-control", "pharma-api-starting-materials-input-control", "pharma-api-reaction-workup-scale-up", "pharma-api-process-development-impurity-control", "pharma-api-isolation-solid-state-control", "pharma-api-analytical-specification-lifecycle", "pharma-api-process-validation-commercial-lifecycle"],
    workingAssetId: "pharma_api_analytical_lifecycle",
    qualityGate: "under-review",
  },
  {
    id: "biopharma-control-strategy",
    question: "Build a biopharma control strategy",
    evidence: "Connect cell substrate, raw materials, upstream and downstream process knowledge, product characterization, potency, stability, and lifecycle change without reducing the decision to final-product QC tests.",
    tool: "Build a product-process evidence map that separates product-specific evidence, platform knowledge, hypotheses, contradictory signals, and material gaps.",
    workingFile: "Use the Cell Substrate & Bank Lifecycle, Materials & Single-Use Control, Upstream Control, Downstream Purification & Clearance, Formulation & Stability, Analytical Control Strategy, Process Validation & CPV, and Technology Transfer Evidence Maps to record lineage/construct/bank evidence, supply-chain and material-use evidence, product-process links, qualification and PPQ evidence, CPV signal lineage, attribute and method decisions, validation and comparability gates, lifecycle triggers, reviewer roles, and unresolved decisions.",
    firstStep: "Name the product modality and one decision or change, then map the first product-quality attribute that could be affected.",
    reviewPrompt: "Which product-process link is supported by direct evidence, which is inferred from platform knowledge, and who is qualified to accept the remaining uncertainty?",
    href: "/workflows/biopharma-control-strategy",
    cta: "Open the control-strategy workflow",
    version: "atlas-pro-workflow/v2",
    lessonSlugs: ["biopharma-full-lifecycle-product-process-orchestration", "biopharma-product-process-control-strategy", "biopharma-cell-line-cell-bank-genetic-stability", "biopharma-raw-ancillary-materials-control", "biopharma-upstream-process-control", "biopharma-downstream-purification-clearance", "biopharma-formulation-fill-finish-stability", "biopharma-integrated-analytical-control-strategy", "biopharma-potency-reference-and-orthogonal-characterization", "biopharma-process-validation-continued-verification", "biopharma-manufacturing-comparability", "biopharma-integrated-technology-transfer", "cell-bank-characterization", "protein-characterization", "cell-based-potency-assays"],
    workingAssetId: "biopharma_upstream_control",
    qualityGate: "under-review",
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
