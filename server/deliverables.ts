// ============================================================================
// DELIVERABLES MANIFEST — the actual digital goods shipped for one-time products.
//
// Files live in content/deliverables/<dir>/ and are served, gated by purchase,
// via GET /api/downloads/:productId(/:filename). This keeps fulfillment fully
// self-hosted (no external Drive links) — the files ship in the function bundle
// (vercel.json includes content/**).
//
// `entitledBy` lists the productTypes whose purchase unlocks this product's
// files — a bundle can unlock several. Pro subscription also unlocks everything
// (handled in the route).
// ============================================================================

export interface DeliverableFile {
  /** Download file name presented to the user (e.g. guide.pdf). */
  filename: string;
  /** Human-facing label */
  label: string;
  /** One-line description shown in the UI */
  description: string;
  /** MIME type for the download response */
  contentType: string;
  /**
   * How to produce the bytes:
   *  - undefined: read `filename` straight from disk.
   *  - "pdf": render the markdown at `source` to PDF on the fly.
   *  - "gap-xlsx": generate the SOP gap-analysis workbook.
   */
  generate?: "pdf" | "gap-xlsx";
  /** Source file on disk (for generated formats), under the product dir. */
  source?: string;
}

export interface DeliverableProduct {
  /** Matches PRODUCTS id / Stripe metadata.productType */
  id: string;
  /** Folder under content/deliverables/ */
  dir: string;
  /** Display name */
  name: string;
  /** productTypes whose completed purchase unlocks these files */
  entitledBy: string[];
  /** Customer-visible quality boundary. */
  quality?: {
    version: string;
    reviewStatus: "under-review" | "editorial-reviewed" | "sme-reviewed";
    limitations: string[];
  };
  files: DeliverableFile[];
}

const MD = "text/markdown; charset=utf-8";
const CSV = "text/csv; charset=utf-8";
const PDF = "application/pdf";
const XLSX_CT = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const XLSX = XLSX_CT;

export const DELIVERABLES: Record<string, DeliverableProduct> = {
  gmp_audit_kit: {
    id: "gmp_audit_kit",
    dir: "gmp-audit-kit",
    name: "GMP Audit Readiness Kit",
    entitledBy: ["gmp_audit_kit"],
    quality: { version: "2.0.0-review", reviewStatus: "under-review", limitations: ["Site adaptation and authorized quality review are required before operational use."] },
    files: [
      { filename: "README.md", label: "Start Here (README)", description: "What's inside and the order to use it.", contentType: MD },
      { filename: "gmp-audit-survival-guide.pdf", label: "GMP Audit Readiness Guide (PDF)", description: "A preparation framework from initial triage through audit day and written-response planning.", contentType: PDF, generate: "pdf", source: "gmp-audit-survival-guide.md" },
      { filename: "sop-gap-analysis.xlsx", label: "SOP Gap Analysis (Excel)", description: "Score 20 quality-system elements; the workbook auto-computes your % readiness.", contentType: XLSX, generate: "gap-xlsx", source: "sop-gap-analysis.csv" },
      { filename: "gmp-audit-readiness-v2.xlsx", label: "GMP Audit Working File v2 (XLSX)", description: "Blank controlled register with validation, formula checks, sources, limitations, and sign-off fields.", contentType: XLSX },
      { filename: "gmp-audit-readiness-v2-fictional-example.xlsx", label: "GMP Audit Fictional Example v2 (XLSX)", description: "Completed fictional example showing evidence, ownership, status, and attention checks.", contentType: XLSX },
      { filename: "capa-templates.pdf", label: "10 CAPA Report Templates (PDF)", description: "Ready-to-fill CAPA structures for the most common audit nonconformances.", contentType: PDF, generate: "pdf", source: "capa-templates.md" },
      { filename: "audit-interview-qa.pdf", label: "Audit Interview Q&A Prompts (PDF)", description: "50+ rehearsal prompts with example answer structures for site adaptation.", contentType: PDF, generate: "pdf", source: "audit-interview-qa.md" },
      { filename: "mock-audit-walkthrough.pdf", label: "Mock Audit Walkthrough (PDF)", description: "A full inspection narrated from the auditor's side.", contentType: PDF, generate: "pdf", source: "mock-audit-walkthrough.md" },
    ],
  },
  starter_kit: {
    id: "starter_kit",
    dir: "career-starter-kit",
    name: "Career Starter Kit",
    entitledBy: ["starter_kit", "bundle"],
    files: [
      { filename: "README.md", label: "Start Here (README)", description: "What's inside and the order to use it.", contentType: MD },
      { filename: "qc-qa-cv-template.pdf", label: "QC/QA CV Template (PDF)", description: "Results-focused CV structure for QC/QA hiring managers, with worked bullets.", contentType: PDF, generate: "pdf", source: "qc-qa-cv-template.md" },
      { filename: "cover-letter-templates.pdf", label: "Cover Letter Templates (PDF)", description: "Three adaptable versions: senior, entry, and career-changer.", contentType: PDF, generate: "pdf", source: "cover-letter-templates.md" },
      { filename: "linkedin-profile-guide.pdf", label: "LinkedIn Profile Guide (PDF)", description: "Headline, About, and skills recruiters search for in QC/QA.", contentType: PDF, generate: "pdf", source: "linkedin-profile-guide.md" },
      { filename: "top-pharma-employers.csv", label: "Top Employers Research List (Excel/CSV)", description: "A starter target list of global pharma/biotech employers to research.", contentType: CSV },
    ],
  },
  interview_prep: {
    id: "interview_prep",
    dir: "interview-prep",
    name: "Interview Prep Pack",
    entitledBy: ["interview_prep", "bundle"],
    files: [
      { filename: "README.md", label: "Start Here (README)", description: "How to use the question bank.", contentType: MD },
      { filename: "qc-qa-interview-questions.pdf", label: "100+ QC/QA Interview Questions (PDF)", description: "Grouped question bank with model-answer guidance for the highest-stakes questions.", contentType: PDF, generate: "pdf", source: "qc-qa-interview-questions.md" },
    ],
  },
  // Pro-only toolkit (no one-time product unlocks it — empty entitledBy means
  // only an active Pro subscription does, handled in the route).
  oos_investigation_template: {
    id: "oos_investigation_template",
    dir: "oos-investigation-template",
    name: "OOS Investigation Template",
    entitledBy: [],
    quality: { version: "2.1.0-review", reviewStatus: "under-review", limitations: ["The authorized laboratory and quality unit retain hypothesis approval, product-impact assessment, and disposition authority."] },
    files: [
      { filename: "README.md", label: "Start Here (README)", description: "What's inside and how to run the investigation.", contentType: MD },
      { filename: "oos-investigation-template.pdf", label: "OOS Investigation Template (PDF)", description: "The full phased form — Phase I lab assessment, hypothesis testing, Phase II, disposition, and CAPA.", contentType: PDF, generate: "pdf", source: "oos-investigation-template.md" },
      { filename: "oos-investigation-log.csv", label: "OOS Investigation Log (Excel/CSV)", description: "A step-by-step checklist log with owner, status, and date columns.", contentType: CSV },
      { filename: "oos-investigation-v2.xlsx", label: "OOS Investigation Working File v2 (XLSX)", description: "Blank investigation register with structured evidence, validation, formula checks, sources, limitations, and sign-off.", contentType: XLSX },
      { filename: "oos-investigation-v2-fictional-example.xlsx", label: "OOS Fictional Example v2 (XLSX)", description: "Completed fictional example separating observation, hypothesis, evidence, decision, and disposition.", contentType: XLSX },
    ],
  },
  biopharma_upstream_control: {
    id: "biopharma_upstream_control",
    dir: "biopharma-upstream-control",
    name: "Biopharma Upstream Control Evidence Map",
    entitledBy: [],
    quality: { version: "1.0.0-review", reviewStatus: "under-review", limitations: ["Qualified product, upstream/MSAT, analytical, quality, and regulatory review is required before controlled use. No generic numeric ranges or criticality decisions are supplied."] },
    files: [
      { filename: "README.md", label: "Start Here (README)", description: "Package scope, workflow, source IDs, and decision boundary.", contentType: MD },
      { filename: "biopharma-upstream-control-guide.pdf", label: "Upstream Control Guide (PDF)", description: "Evidence-led workflow for product attributes, process relationships, control placement, and lifecycle review.", contentType: PDF, generate: "pdf", source: "biopharma-upstream-control-guide.md" },
      { filename: "biopharma-upstream-control-v1.xlsx", label: "Upstream Control Evidence Map v1 (XLSX)", description: "Blank formula-driven working file with data validation, evidence register, review actions, sources, limitations, and sign-off.", contentType: XLSX },
      { filename: "biopharma-upstream-control-v1-fictional-example.xlsx", label: "Upstream Control Fictional Example v1 (XLSX)", description: "Completed fictional CHO example preserving observation, hypothesis, contradictory evidence, control, lifecycle trigger, and accountable review.", contentType: XLSX },
    ],
  },
  biopharma_downstream_clearance: {
    id: "biopharma_downstream_clearance",
    dir: "biopharma-downstream-clearance",
    name: "Biopharma Downstream Purification & Clearance Evidence Map",
    entitledBy: [],
    quality: { version: "1.0.0-review", reviewStatus: "under-review", limitations: ["Qualified downstream/MSAT, analytical, viral-safety, quality, validation, and regulatory review is required before controlled use. No generic clearance factors, ranges, lifetimes, or conclusions are supplied."] },
    files: [
      { filename: "README.md", label: "Start Here (README)", description: "Package scope, workflow, source IDs, and decision boundary.", contentType: MD },
      { filename: "biopharma-downstream-clearance-guide.pdf", label: "Downstream Purification & Clearance Guide (PDF)", description: "Evidence-led workflow for targets, unit operations, clearance claims, viral-safety boundaries, and lifecycle review.", contentType: PDF, generate: "pdf", source: "biopharma-downstream-clearance-guide.md" },
      { filename: "biopharma-downstream-clearance-v1.xlsx", label: "Downstream Purification & Clearance Evidence Map v1 (XLSX)", description: "Blank formula-driven working file with validation, evidence register, review actions, sources, limitations, and sign-off.", contentType: XLSX },
      { filename: "biopharma-downstream-clearance-v1-fictional-example.xlsx", label: "Downstream Purification & Clearance Fictional Example v1 (XLSX)", description: "Completed fictional CHO example preserving impurity, product-variant, recovery, viral-safety, scale-down, lifecycle, and accountable review boundaries.", contentType: XLSX },
    ],
  },
  biopharma_formulation_stability: {
    id: "biopharma_formulation_stability",
    dir: "biopharma-formulation-stability",
    name: "Biopharma Formulation & Stability Evidence Map",
    entitledBy: [],
    quality: { version: "1.0.0-review", reviewStatus: "under-review", limitations: ["Qualified formulation, fill-finish, analytical, stability, container, quality, validation, and regulatory review is required before controlled use. No platform formulation, process parameters, conditions, schedules, limits, shelf life, or conclusions are supplied."] },
    files: [
      { filename: "README.md", label: "Start Here (README)", description: "Package scope, workflow, source IDs, revision watch, and decision boundary.", contentType: MD },
      { filename: "biopharma-formulation-stability-guide.pdf", label: "Formulation & Stability Guide (PDF)", description: "Evidence-led workflow for degradation pathways, formulation, process/fill exposure, presentation, stability studies, and lifecycle review.", contentType: PDF, generate: "pdf", source: "biopharma-formulation-stability-guide.md" },
      { filename: "biopharma-formulation-stability-v1.xlsx", label: "Formulation & Stability Evidence Map v1 (XLSX)", description: "Blank formula-driven working file with validation, study and evidence registers, review actions, sources, limitations, and sign-off.", contentType: XLSX },
      { filename: "biopharma-formulation-stability-v1-fictional-example.xlsx", label: "Formulation & Stability Fictional Example v1 (XLSX)", description: "Completed fictional CHO example preserving degradation, formulation, fill-finish, container, analytical, stability, change, and accountable-review boundaries.", contentType: XLSX },
    ],
  },
  biopharma_analytical_control_strategy: {
    id: "biopharma_analytical_control_strategy",
    dir: "biopharma-analytical-control-strategy",
    name: "Biopharma Analytical Control Strategy Evidence Map",
    entitledBy: [],
    quality: { version: "1.0.0-review", reviewStatus: "under-review", limitations: ["Qualified product-quality, analytical development, bioassay/statistics, reference-standard, QC, quality, validation, and regulatory CMC review is required before controlled use. No product method, reference value, specification, criterion, validation, transfer, comparability, filing, or batch conclusion is supplied."] },
    files: [
      { filename: "README.md", label: "Start Here (README)", description: "Package scope, workflow, source IDs, revision watch, and decision boundary.", contentType: MD },
      { filename: "biopharma-analytical-control-strategy-guide.pdf", label: "Analytical Control Strategy Guide (PDF)", description: "Evidence-led workflow for attributes, method purpose and capability, potency, impurities, reference systems, specifications, reportability, and lifecycle change.", contentType: PDF, generate: "pdf", source: "biopharma-analytical-control-strategy-guide.md" },
      { filename: "biopharma-analytical-control-strategy-v1.xlsx", label: "Analytical Control Strategy Evidence Map v1 (XLSX)", description: "Blank formula-driven working file with attribute, method, specification, reference, lifecycle, evidence, action, source, limitation, and review controls.", contentType: XLSX },
      { filename: "biopharma-analytical-control-strategy-v1-fictional-example.xlsx", label: "Analytical Control Strategy Fictional Example v1 (XLSX)", description: "Completed fictional CHO example preserving resin-change, charge-profile, potency, reference-transition, method-transfer, specification, and accountable-review boundaries.", contentType: XLSX },
    ],
  },
  biopharma_technology_transfer: {
    id: "biopharma_technology_transfer",
    dir: "biopharma-technology-transfer",
    name: "Biopharma Technology Transfer Evidence Map",
    entitledBy: [],
    quality: { version: "1.0.0-review", reviewStatus: "under-review", limitations: ["Qualified transfer, process/MSAT, manufacturing, engineering/automation, materials/supply, analytical/QC, validation, quality, and regulatory CMC review is required before controlled use. No process parameter, equipment-equivalence rule, method, transfer approach, validation design, batch count, acceptance criterion, comparability conclusion, filing category, execution authorization, routine-readiness decision, site approval, or batch disposition is supplied."] },
    files: [
      { filename: "README.md", label: "Start Here (README)", description: "Package scope, staged workflow, source IDs, reviewer roles, and decision boundaries.", contentType: MD },
      { filename: "biopharma-technology-transfer-guide.pdf", label: "Biopharma Technology Transfer Guide (PDF)", description: "Evidence-led workflow for transfer scope, knowledge, receiving-unit capability, process/material, analytical, validation, comparability, commitments, and acceptance.", contentType: PDF, generate: "pdf", source: "biopharma-technology-transfer-guide.md" },
      { filename: "biopharma-technology-transfer-v1.xlsx", label: "Biopharma Technology Transfer Evidence Map v1 (XLSX)", description: "Blank formula-driven working file with twelve controlled sheets, validations, evidence/actions, sources, limitations, and review state.", contentType: XLSX },
      { filename: "biopharma-technology-transfer-v1-fictional-example.xlsx", label: "Biopharma Technology Transfer Fictional Example v1 (XLSX)", description: "Completed fictional CHO drug-substance site-transfer example preserving equipment, automation, material, method, reference, comparability, validation, commitment, and acceptance questions.", contentType: XLSX },
    ],
  },
  biopharma_materials_control: {
    id: "biopharma_materials_control",
    dir: "biopharma-materials-control",
    name: "Biopharma Materials & Single-Use Control Evidence Map",
    entitledBy: [],
    quality: { version: "1.0.0-review", reviewStatus: "under-review", limitations: ["Qualified raw-material/material-science, supplier-quality, supply-chain, process/MSAT, single-use/E&L/toxicology, microbiology/viral-safety, analytical, validation, quality, and regulatory CMC review is required before controlled use. No specification, sampling/testing frequency, acceptance limit, test panel, qualification-lot count, E&L condition or limit, toxicology threshold, viral-safety conclusion, validation design, comparability conclusion, supplier/change approval, implementation authorization, or batch disposition is supplied."] },
    files: [
      { filename: "README.md", label: "Start Here (README)", description: "Package scope, staged workflow, source IDs, reviewer roles, and decision boundaries.", contentType: MD },
      { filename: "biopharma-materials-control-guide.pdf", label: "Biopharma Materials & Single-Use Control Guide (PDF)", description: "Evidence-led workflow for material use, supply chain, functional attributes, incoming controls, configured single-use systems, qualification, changes, and governance.", contentType: PDF, generate: "pdf", source: "biopharma-materials-control-guide.md" },
      { filename: "biopharma-materials-control-v1.xlsx", label: "Biopharma Materials & Single-Use Control Evidence Map v1 (XLSX)", description: "Blank formula-driven working file with twelve controlled sheets, validations, evidence/actions, sources, limitations, and review state.", contentType: XLSX },
      { filename: "biopharma-materials-control-v1-fictional-example.xlsx", label: "Biopharma Materials & Single-Use Fictional Example v1 (XLSX)", description: "Completed fictional CHO media-component and harvest-hold assembly change example preserving supply-chain, functional, process/product, contamination, E&L, comparability, validation, continuity, and implementation questions.", contentType: XLSX },
    ],
  },
  biopharma_cell_substrate_control: {
    id: "biopharma_cell_substrate_control",
    dir: "biopharma-cell-substrate-control",
    name: "Biopharma Cell Substrate & Bank Lifecycle Evidence Map",
    entitledBy: [],
    quality: { version: "1.0.0-review", reviewStatus: "under-review", limitations: ["Qualified cell-line development, molecular characterization, cell-bank manufacturing/custody, biosafety, viral-safety, process/MSAT, analytical/product-quality, statistics, validation, quality, and regulatory CMC review is required before controlled use. No host, vector, construct, clone-selection method, culture condition, bank-manufacturing process, test panel, sampling plan, production-age/passages, acceptance criterion, qualification-lot count, adventitious-agent conclusion, comparability conclusion, bank approval, manufacturing authorization, or batch disposition is supplied."] },
    files: [
      { filename: "README.md", label: "Start Here (README)", description: "Package scope, staged workflow, source IDs, reviewer roles, and decision boundaries.", contentType: MD },
      { filename: "biopharma-cell-substrate-control-guide.pdf", label: "Biopharma Cell Substrate & Bank Lifecycle Guide (PDF)", description: "Evidence-led workflow for lineage, construct, clone development, bank hierarchy/lifecycle, characterization, stability/production age, change, and governance.", contentType: PDF, generate: "pdf", source: "biopharma-cell-substrate-control-guide.md" },
      { filename: "biopharma-cell-substrate-control-v1.xlsx", label: "Biopharma Cell Substrate & Bank Lifecycle Evidence Map v1 (XLSX)", description: "Blank formula-driven working file with twelve controlled sheets, validations, evidence/actions, sources, limitations, and review state.", contentType: XLSX },
      { filename: "biopharma-cell-substrate-control-v1-fictional-example.xlsx", label: "Biopharma Cell Substrate & Bank Lifecycle Fictional Example v1 (XLSX)", description: "Completed fictional CHO replacement-working-bank example preserving lineage, construct, clone, bank, characterization, production-age, process/product, comparability, validation, regulatory, and authorized-use questions.", contentType: XLSX },
    ],
  },
  biopharma_process_validation_cpv: {
    id: "biopharma_process_validation_cpv",
    dir: "biopharma-process-validation-cpv",
    name: "Biopharma Process Validation & CPV Evidence Map",
    entitledBy: [],
    quality: { version: "1.0.0-review", reviewStatus: "under-review", limitations: ["Qualified process-development/MSAT, manufacturing, validation, engineering/automation/data, analytical/QC, statistics, product-quality, quality, and regulatory CMC review is required before controlled use. No product-specific CQA, CPP, range, qualification design, PPQ batch count, sampling plan, statistical method, signal rule, acceptance criterion, CPV frequency, capability target, validation conclusion, routine authorization, regulatory decision, or batch disposition is supplied."] },
    files: [
      { filename: "README.md", label: "Start Here (README)", description: "Package scope, lifecycle workflow, source IDs, reviewer roles, signal boundaries, and controlled-use limitations.", contentType: MD },
      { filename: "biopharma-process-validation-cpv-guide.pdf", label: "Biopharma Process Validation & CPV Guide (PDF)", description: "Evidence-led workflow for process knowledge, enabling qualification, PPQ, CPV plan/data, signal assessment, lifecycle change, and governance.", contentType: PDF, generate: "pdf", source: "biopharma-process-validation-cpv-guide.md" },
      { filename: "biopharma-process-validation-cpv-v1.xlsx", label: "Biopharma Process Validation & CPV Evidence Map v1 (XLSX)", description: "Blank formula-driven working file with twelve controlled sheets, entered-threshold signal checks, evidence/actions, sources, limitations, and review state.", contentType: XLSX },
      { filename: "biopharma-process-validation-cpv-v1-fictional-example.xlsx", label: "Biopharma Process Validation & CPV Fictional Example v1 (XLSX)", description: "Completed fictional CHO PPQ-to-CPV example preserving one statistical signal within specification, concurrent events, hypotheses, validation-state questions, and open actions.", contentType: XLSX },
    ],
  },
  pharma_api_impurity_control: {
    id: "pharma_api_impurity_control",
    dir: "pharma-api-impurity-control",
    name: "Pharma API Process & Impurity Control Evidence Map",
    entitledBy: [],
    quality: { version: "1.0.0-review", reviewStatus: "under-review", limitations: ["Qualified process chemistry, process engineering/MSAT, analytical development, impurity-safety, API QC, quality, validation, technology-transfer, and regulatory CMC review is required before controlled use. No route, starting-material decision, chemistry, process condition, impurity identity, purge factor, acceptable intake, specification, validation conclusion, filing decision, manufacturing authorization, or batch disposition is supplied."] },
    files: [
      { filename: "README.md", label: "Start Here (README)", description: "Package scope, route-to-control workflow, source IDs, reviewer roles, observed-ratio boundary, and controlled-use limitations.", contentType: MD },
      { filename: "pharma-api-impurity-control-guide.pdf", label: "Pharma API Process & Impurity Control Guide (PDF)", description: "Evidence-led workflow for route and inputs, unit operations, impurity origin, observed fate, analytical capability, control placement, change, and governance.", contentType: PDF, generate: "pdf", source: "pharma-api-impurity-control-guide.md" },
      { filename: "pharma-api-impurity-control-v1.xlsx", label: "Pharma API Process & Impurity Control Evidence Map v1 (XLSX)", description: "Blank formula-driven working file with twelve controlled sheets, comparability and analytical-capability gates, evidence/actions, sources, limitations, and review state.", contentType: XLSX },
      { filename: "pharma-api-impurity-control-v1-fictional-example.xlsx", label: "Pharma API Process & Impurity Control Fictional Example v1 (XLSX)", description: "Completed fictional three-stage API example preserving a reagent-site change, recovered-solvent configuration change, unknown signal, one bounded observed ratio, competing hypotheses, and open decisions.", contentType: XLSX },
    ],
  },
  pharma_api_starting_material_input_control: {
    id: "pharma_api_starting_material_input_control",
    dir: "pharma-api-starting-material-input-control",
    name: "Pharma API Starting Material & Input Control Evidence Map",
    entitledBy: [],
    quality: { version: "1.0.0-review", reviewStatus: "under-review", limitations: ["Qualified synthetic-process, supplier-quality, API analytical/QC, manufacturing/validation, quality, and regulatory CMC review is required before controlled use. No chemistry, commodity status, starting-material acceptance, supplier approval, specification, method, limit, reduced-testing authorization, filing conclusion, manufacturing authorization, or batch disposition is supplied."] },
    files: [
      { filename: "README.md", label: "Start Here (README)", description: "Package scope, route-boundary workflow, source IDs, reviewer roles, supplier-chain boundaries, and controlled-use limitations.", contentType: MD },
      { filename: "pharma-api-starting-material-input-control-guide.pdf", label: "Pharma API Starting Material & Input Control Guide (PDF)", description: "Evidence-led workflow for route boundary, material portfolio, supplier chain, specification basis, impurity linkage, incoming control and lifecycle change.", contentType: PDF, generate: "pdf", source: "pharma-api-starting-material-input-control-guide.md" },
      { filename: "pharma-api-starting-material-input-control-v1.xlsx", label: "Pharma API Starting Material & Input Control Evidence Map v1 (XLSX)", description: "Blank formula-driven working file with twelve controlled sheets, evidence/actions, sources, limitations and fail-closed review state.", contentType: XLSX },
      { filename: "pharma-api-starting-material-input-control-v1-fictional-example.xlsx", label: "Pharma API Starting Material & Input Control Fictional Example v1 (XLSX)", description: "Fictional custom-intermediate and sub-tier-site-change case preserving commercial-availability, upstream synthesis, impurity, method, inventory and filing questions.", contentType: XLSX },
    ],
  },
  pharma_api_analytical_lifecycle: {
    id: "pharma_api_analytical_lifecycle",
    dir: "pharma-api-analytical-lifecycle",
    name: "Pharma API Analytical & Lifecycle Control Evidence Map",
    entitledBy: [],
    quality: { version: "1.0.0-review", reviewStatus: "under-review", limitations: ["Qualified API analytical development, QC, statistics, stability, validation, quality and regulatory CMC review is required before controlled use. No product-specific method, instrument, condition, system-suitability criterion, validation design, acceptance limit, specification, stability condition, shelf life, transfer acceptance, filing decision, manufacturing authorization, or batch disposition is supplied."] },
    files: [
      { filename: "README.md", label: "Start Here (README)", description: "Package scope, intended-use workflow, source IDs, reviewer roles, analytical/stability boundaries, and controlled-use limitations.", contentType: MD },
      { filename: "pharma-api-analytical-lifecycle-guide.pdf", label: "Pharma API Analytical & Lifecycle Control Guide (PDF)", description: "Evidence-led workflow for analytical target profile, procedure capability, specification linkage, stability, transfer and lifecycle change.", contentType: PDF, generate: "pdf", source: "pharma-api-analytical-lifecycle-guide.md" },
      { filename: "pharma-api-analytical-lifecycle-v1.xlsx", label: "Pharma API Analytical & Lifecycle Control Evidence Map v1 (XLSX)", description: "Blank formula-driven working file with twelve controlled sheets, evidence/actions, sources, limitations and fail-closed review state.", contentType: XLSX },
      { filename: "pharma-api-analytical-lifecycle-v1-fictional-example.xlsx", label: "Pharma API Analytical & Lifecycle Fictional Example v1 (XLSX)", description: "Fictional column and sample-preparation transfer case preserving method, stability, reference, data-integrity and filing questions.", contentType: XLSX },
    ],
  },
  pharma_api_reaction_scale_up: {
    id: "pharma_api_reaction_scale_up",
    dir: "pharma-api-reaction-scale-up",
    name: "Pharma API Reaction, Work-up & Scale-up Evidence Map",
    entitledBy: [],
    quality: { version: "1.0.0-review", reviewStatus: "under-review", limitations: ["Qualified process chemistry, engineering, manufacturing science, validation, quality and regulatory CMC review is required before controlled use. No operating range, purge factor, acceptance criterion, process capability conclusion or authorization is supplied."] },
    files: [
      { filename: "README.md", label: "Start Here (README)", description: "Package scope, source IDs, reviewer roles and the evidence-chain boundary.", contentType: MD },
      { filename: "pharma-api-reaction-scale-up-guide.md", label: "Reaction, Work-up & Scale-up Guide", description: "Evidence-led workflow for reaction, work-up, equipment, scale and accountable review.", contentType: MD },
      { filename: "pharma-api-reaction-scale-up-blank.csv", label: "Reaction & Scale-up Working File (CSV)", description: "Blank register for evidence, controls, actions, sources and review state.", contentType: CSV },
      { filename: "pharma-api-reaction-scale-up-fictional-example.md", label: "Reaction & Scale-up Fictional Example", description: "Bounded synthetic example with observed evidence and open decisions.", contentType: MD },
    ],
  },
  drug_product_formulation_material_attributes: {
    id: "drug_product_formulation_material_attributes",
    dir: "drug-product-formulation-material-attributes",
    name: "Drug Product Formulation & Material Attributes Evidence Map",
    entitledBy: [],
    quality: { version: "1.0.0-review", reviewStatus: "under-review", limitations: ["The OSD example is synthetic planning context only. Qualified formulation, material, biopharmaceutics, analytical, quality and regulatory review is required; no formula, design space, bioequivalence conclusion, release criterion or precedent is supplied."] },
    files: [
      { filename: "README.md", label: "Start Here (README)", description: "Package scope, OSD boundary, source IDs and review roles.", contentType: MD },
      { filename: "drug-product-formulation-material-attributes-guide.md", label: "Formulation & Material Attributes Guide", description: "Framework for linking formulation hypotheses, material attributes and evidence strength.", contentType: MD },
      { filename: "drug-product-formulation-material-attributes-blank.csv", label: "Formulation Working File (CSV)", description: "Blank register for attributes, evidence, questions, sources and review state.", contentType: CSV },
      { filename: "drug-product-formulation-material-attributes-fictional-example.md", label: "Synthetic OSD Fictional Example", description: "Illustrative planning case labelled as fictional and non-regulatory.", contentType: MD },
    ],
  },
  drug_product_unit_operations_scale_up: {
    id: "drug_product_unit_operations_scale_up",
    dir: "drug-product-unit-operations-scale-up",
    name: "Drug Product Unit Operations & Scale-up Evidence Map",
    entitledBy: [],
    quality: { version: "1.0.0-review", reviewStatus: "under-review", limitations: ["Qualified process development, engineering, manufacturing, statistics, validation, quality and regulatory review is required. No process parameter, scale rule, hold limit, sampling plan or acceptance criterion is supplied."] },
    files: [
      { filename: "README.md", label: "Start Here (README)", description: "Package scope, unit-operation boundary, source IDs and review roles.", contentType: MD },
      { filename: "drug-product-unit-operations-scale-up-guide.md", label: "Unit Operations & Scale-up Guide", description: "Evidence-led workflow for equipment, hold, sampling, scale and control questions.", contentType: MD },
      { filename: "drug-product-unit-operations-scale-up-blank.csv", label: "Unit Operations Working File (CSV)", description: "Blank register for unit operations, evidence, controls and open actions.", contentType: CSV },
      { filename: "drug-product-unit-operations-scale-up-fictional-example.md", label: "Synthetic OSD Scale-up Fictional Example", description: "Illustrative scale-up evidence map with explicit unknowns.", contentType: MD },
    ],
  },
  drug_product_analytical_release_stability: {
    id: "drug_product_analytical_release_stability",
    dir: "drug-product-analytical-release-stability",
    name: "Drug Product Analytical, Release & Stability Evidence Map",
    entitledBy: [],
    quality: { version: "1.0.0-review", reviewStatus: "under-review", limitations: ["Qualified analytical, QC, stability, packaging, quality and regulatory review is required. No product-specific method, specification, limit, shelf life, dissolution conclusion or release decision is supplied."] },
    files: [
      { filename: "README.md", label: "Start Here (README)", description: "Package scope, evidence boundary, source IDs and review roles.", contentType: MD },
      { filename: "drug-product-analytical-release-stability-guide.md", label: "Analytical, Release & Stability Guide", description: "Framework for linking analytical capability, release, stability and packaging evidence.", contentType: MD },
      { filename: "drug-product-analytical-release-stability-blank.csv", label: "Analytical Lifecycle Working File (CSV)", description: "Blank register for methods, studies, evidence, actions and review state.", contentType: CSV },
      { filename: "drug-product-analytical-release-stability-fictional-example.md", label: "Synthetic OSD Release & Stability Fictional Example", description: "Illustrative case preserving open technical and quality decisions.", contentType: MD },
    ],
  },
  drug_product_validation_transfer_lifecycle: {
    id: "drug_product_validation_transfer_lifecycle",
    dir: "drug-product-validation-transfer-lifecycle",
    name: "Drug Product Validation, Transfer & Lifecycle Evidence Map",
    entitledBy: [],
    quality: { version: "1.0.0-review", reviewStatus: "under-review", limitations: ["Qualified transfer, manufacturing, engineering, analytical/QC, validation, quality and regulatory review is required. No execution authorization, validation conclusion, change approval, site readiness decision or disposition is supplied."] },
    files: [
      { filename: "README.md", label: "Start Here (README)", description: "Package scope, transfer boundary, source IDs and review roles.", contentType: MD },
      { filename: "drug-product-validation-transfer-lifecycle-guide.md", label: "Validation, Transfer & Lifecycle Guide", description: "Evidence-led workflow for receiving-site capability, validation, change and continued review.", contentType: MD },
      { filename: "drug-product-validation-transfer-lifecycle-blank.csv", label: "Transfer & Lifecycle Working File (CSV)", description: "Blank register for scope, evidence, actions, sources and sign-off.", contentType: CSV },
      { filename: "drug-product-validation-transfer-lifecycle-fictional-example.md", label: "Synthetic Receiving-site Transfer Fictional Example", description: "Illustrative case labelled fictional and not an authorization or validation conclusion.", contentType: MD },
    ],
  },
  analytical_lifecycle_evidence_map: {
    id: "analytical_lifecycle_evidence_map",
    dir: "analytical-lifecycle-evidence-map",
    name: "Analytical Lifecycle Evidence Map",
    entitledBy: [],
    quality: { version: "1.0.0-review", reviewStatus: "editorial-reviewed", limitations: ["Qualified product-specific analytical, statistics, QC, validation, quality and regulatory review is required. No method, performance criterion, validation conclusion, specification, transfer acceptance, filing position or batch decision is supplied."] },
    files: [
      { filename: "README.md", label: "Start Here (README)", description: "Scope, source map, reviewer roles and analytical lifecycle boundary.", contentType: MD },
      { filename: "analytical-lifecycle-evidence-map-guide.md", label: "Analytical Lifecycle Evidence Map Guide", description: "Evidence-led workflow from intended use through procedure performance, transfer and change.", contentType: MD },
      { filename: "analytical-lifecycle-evidence-map-blank.csv", label: "Analytical Lifecycle Working File (CSV)", description: "Blank register for intended use, performance claims, evidence, limitations and actions.", contentType: CSV },
      { filename: "analytical-lifecycle-evidence-map-fictional-example.md", label: "Analytical Lifecycle Fictional Example", description: "Bounded synthetic transfer example preserving unresolved evidence and reviewer ownership.", contentType: MD },
    ],
  },
  decision_led_statistics_evidence_map: {
    id: "decision_led_statistics_evidence_map",
    dir: "decision-led-statistics-evidence-map",
    name: "Decision-led Statistics & Process Evidence Map",
    entitledBy: [],
    quality: { version: "1.0.0-review", reviewStatus: "editorial-reviewed", limitations: ["Qualified statistical, domain, measurement-system, data-integrity and quality review is required. No default sample size, threshold, control limit, CPP, capability, validation or authorization conclusion is supplied."] },
    files: [
      { filename: "README.md", label: "Start Here (README)", description: "Scope, source map, reviewer roles and model-use boundary.", contentType: MD },
      { filename: "decision-led-statistics-evidence-map-guide.md", label: "Decision-led Statistics & Process Evidence Guide", description: "Workflow linking a decision to data lineage, measurement evidence, analysis and uncertainty.", contentType: MD },
      { filename: "decision-led-statistics-evidence-map-blank.csv", label: "Statistics & Process Evidence Working File (CSV)", description: "Blank register for datasets, assumptions, diagnostics, uncertainty and actions.", contentType: CSV },
      { filename: "decision-led-statistics-evidence-map-fictional-example.md", label: "Decision-led Statistics Fictional Example", description: "Synthetic scale-up example that does not declare causality, criticality or process acceptance.", contentType: MD },
    ],
  },
  environmental_monitoring_checklist: {
    id: "environmental_monitoring_checklist",
    dir: "environmental-monitoring-checklist",
    name: "Environmental Monitoring Checklist",
    entitledBy: [],
    quality: { version: "2.0.0-review", reviewStatus: "under-review", limitations: ["Methods, locations, frequencies, limits, and responses require site-specific contamination-control review."] },
    files: [
      { filename: "README.md", label: "Start Here (README)", description: "What's inside and how to use the checklist.", contentType: MD },
      { filename: "environmental-monitoring-checklist.pdf", label: "EM Program Checklist (PDF)", description: "Seven sections for adapting program design, review controls, and audit-readiness evidence to the authorized site strategy.", contentType: PDF, generate: "pdf", source: "environmental-monitoring-checklist.md" },
      { filename: "em-site-sample-plan.csv", label: "EM Site & Sample Plan (Excel/CSV)", description: "A template to record each location, grade, method, frequency, and alert/action limits.", contentType: CSV },
      { filename: "environmental-monitoring-v2.xlsx", label: "Environmental Monitoring Working File v2 (XLSX)", description: "Blank site-adaptation register with controlled lists, validation, formula checks, sources, limitations, and sign-off.", contentType: XLSX },
      { filename: "environmental-monitoring-v2-fictional-example.xlsx", label: "Environmental Monitoring Fictional Example v2 (XLSX)", description: "Completed fictional example for locations, methods, frequencies, limits, evidence status, and ownership.", contentType: XLSX },
    ],
  },
  bi_workflow_checklist: {
    id: "bi_workflow_checklist",
    dir: "bi-workflow-checklist",
    name: "BI Workflow Checklist",
    entitledBy: [],
    files: [
      { filename: "README.md", label: "Start Here (README)", description: "What's inside and how to use the checklist.", contentType: MD },
      { filename: "bi-workflow-checklist.pdf", label: "BI Workflow Checklist (PDF)", description: "Six sections from BI selection to investigation & release.", contentType: PDF, generate: "pdf", source: "bi-workflow-checklist.md" },
      { filename: "bi-run-log.csv", label: "BI Run Log (Excel/CSV)", description: "Record each BI lot, organism, D-value, population, location, control type, and result.", contentType: CSV },
    ],
  },
  culture_media_selection_guide: {
    id: "culture_media_selection_guide",
    dir: "culture-media-selection-guide",
    name: "Culture Media Selection Guide",
    entitledBy: [],
    files: [
      { filename: "README.md", label: "Start Here (README)", description: "What's inside and how to use the guide.", contentType: MD },
      { filename: "culture-media-selection-guide.pdf", label: "Culture Media Selection Guide (PDF)", description: "Match media to the method, qualify lots by growth promotion, and control storage/equivalence.", contentType: PDF, generate: "pdf", source: "culture-media-selection-guide.md" },
      { filename: "media-gpt-log.csv", label: "Media & GPT Log (Excel/CSV)", description: "Record media lot, prep, pH, growth-promotion strains, recovery and inhibition.", contentType: CSV },
    ],
  },
  lab_water_selection_checklist: {
    id: "lab_water_selection_checklist",
    dir: "lab-water-selection-checklist",
    name: "Lab Water Selection Checklist",
    entitledBy: [],
    quality: { version: "2.0.0-review", reviewStatus: "under-review", limitations: ["Selection and controls require confirmation against intended use, approved methods, site systems, and current licensed standards."] },
    files: [
      { filename: "README.md", label: "Start Here (README)", description: "What's inside and how to use the checklist.", contentType: MD },
      { filename: "lab-water-selection-checklist.pdf", label: "Lab Water Selection Checklist (PDF)", description: "Choose and justify the right water grade, with specs and monitoring.", contentType: PDF, generate: "pdf", source: "lab-water-selection-checklist.md" },
      { filename: "water-grade-quick-reference.csv", label: "Water Grade Quick Reference (Excel/CSV)", description: "Typical use, conductivity/TOC, microbial limit, and endotoxin per grade.", contentType: CSV },
      { filename: "lab-water-selection-v2.xlsx", label: "Lab Water Selection Working File v2 (XLSX)", description: "Blank decision register linking intended use, proposed grade, control basis, ownership, sources, and sign-off.", contentType: XLSX },
      { filename: "lab-water-selection-v2-fictional-example.xlsx", label: "Lab Water Selection Fictional Example v2 (XLSX)", description: "Completed fictional example making applicability, evidence gaps, controls, and the accountable decision explicit.", contentType: XLSX },
    ],
  },
  data_integrity_self_check: {
    id: "data_integrity_self_check",
    dir: "data-integrity-self-check",
    name: "Data Integrity Self-Check",
    entitledBy: [],
    files: [
      { filename: "README.md", label: "Start Here (README)", description: "What's inside and how to run the self-check.", contentType: MD },
      { filename: "data-integrity-self-check.pdf", label: "Data Integrity Self-Check (PDF)", description: "ALCOA+ self-assessment across inventory, records, audit trails, spreadsheets, and gaps.", contentType: PDF, generate: "pdf", source: "data-integrity-self-check.md" },
      { filename: "alcoa-gap-log.csv", label: "ALCOA+ Gap Log (Excel/CSV)", description: "Record each finding by system and principle with risk, action, owner, and status.", contentType: CSV },
    ],
  },
  microbiology_qc_starter_pack: {
    id: "microbiology_qc_starter_pack",
    dir: "microbiology-qc-starter-pack",
    name: "Microbiology QC Starter Pack",
    entitledBy: [],
    files: [
      { filename: "README.md", label: "Start Here (README)", description: "What's inside and how to use the pack.", contentType: MD },
      { filename: "microbiology-qc-starter-pack.pdf", label: "Microbiology QC Starter Guide (PDF)", description: "The core QC micro tests, key controls, common mistakes, and where to go deeper.", contentType: PDF, generate: "pdf", source: "microbiology-qc-starter-pack.md" },
      { filename: "micro-qc-first-90-days.csv", label: "First 90 Days Checklist (Excel/CSV)", description: "A week-by-week onboarding plan for new QC micro analysts.", contentType: CSV },
    ],
  },
};

const EDITORIAL_REVIEWED_PACKAGE_DELIVERABLES = new Set([
  "biopharma_cell_substrate_control",
  "biopharma_upstream_control",
  "biopharma_materials_control",
  "biopharma_downstream_clearance",
  "biopharma_formulation_stability",
  "biopharma_analytical_control_strategy",
  "biopharma_process_validation_cpv",
  "biopharma_technology_transfer",
  "pharma_api_starting_material_input_control",
  "pharma_api_reaction_scale_up",
  "pharma_api_impurity_control",
  "pharma_api_analytical_lifecycle",
  "drug_product_formulation_material_attributes",
  "drug_product_unit_operations_scale_up",
  "drug_product_analytical_release_stability",
  "drug_product_validation_transfer_lifecycle",
  "oos_investigation_template",
]);

for (const productId of Array.from(EDITORIAL_REVIEWED_PACKAGE_DELIVERABLES)) {
  const product = DELIVERABLES[productId];
  if (product?.quality) product.quality = { ...product.quality, reviewStatus: "editorial-reviewed" };
}

/** All deliverable products a purchase of `productType` unlocks. */
export function deliverablesForPurchase(productType: string): DeliverableProduct[] {
  return Object.values(DELIVERABLES).filter((d) => d.entitledBy.includes(productType));
}

/** Look up a deliverable product by id. */
export function getDeliverable(productId: string): DeliverableProduct | undefined {
  return DELIVERABLES[productId];
}

/** Find a single file within a deliverable product (guards against traversal). */
export function getDeliverableFile(productId: string, filename: string): DeliverableFile | undefined {
  const product = DELIVERABLES[productId];
  if (!product) return undefined;
  return product.files.find((f) => f.filename === filename);
}
