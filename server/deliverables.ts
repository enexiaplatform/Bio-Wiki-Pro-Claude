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
    name: "GMP Audit Survival Kit",
    entitledBy: ["gmp_audit_kit"],
    files: [
      { filename: "README.md", label: "Start Here (README)", description: "What's inside and the order to use it.", contentType: MD },
      { filename: "gmp-audit-survival-guide.pdf", label: "GMP Audit Survival Guide (PDF)", description: "The full framework — from 30 days out to audit-day to the written response.", contentType: PDF, generate: "pdf", source: "gmp-audit-survival-guide.md" },
      { filename: "sop-gap-analysis.xlsx", label: "SOP Gap Analysis (Excel)", description: "Score 20 quality-system elements; the workbook auto-computes your % readiness.", contentType: XLSX, generate: "gap-xlsx", source: "sop-gap-analysis.csv" },
      { filename: "capa-templates.pdf", label: "10 CAPA Report Templates (PDF)", description: "Ready-to-fill CAPA structures for the most common audit nonconformances.", contentType: PDF, generate: "pdf", source: "capa-templates.md" },
      { filename: "audit-interview-qa.pdf", label: "Audit Interview Q&A Scripts (PDF)", description: "50+ real auditor questions with model QC/QA answers.", contentType: PDF, generate: "pdf", source: "audit-interview-qa.md" },
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
    files: [
      { filename: "README.md", label: "Start Here (README)", description: "What's inside and how to run the investigation.", contentType: MD },
      { filename: "oos-investigation-template.pdf", label: "OOS Investigation Template (PDF)", description: "The full phased form — Phase I lab assessment, hypothesis testing, Phase II, disposition, and CAPA.", contentType: PDF, generate: "pdf", source: "oos-investigation-template.md" },
      { filename: "oos-investigation-log.csv", label: "OOS Investigation Log (Excel/CSV)", description: "A step-by-step checklist log with owner, status, and date columns.", contentType: CSV },
    ],
  },
  environmental_monitoring_checklist: {
    id: "environmental_monitoring_checklist",
    dir: "environmental-monitoring-checklist",
    name: "Environmental Monitoring Checklist",
    entitledBy: [],
    files: [
      { filename: "README.md", label: "Start Here (README)", description: "What's inside and how to use the checklist.", contentType: MD },
      { filename: "environmental-monitoring-checklist.pdf", label: "EM Program Checklist (PDF)", description: "Seven sections from program design to audit readiness — risk-based, Annex 1 aligned.", contentType: PDF, generate: "pdf", source: "environmental-monitoring-checklist.md" },
      { filename: "em-site-sample-plan.csv", label: "EM Site & Sample Plan (Excel/CSV)", description: "A template to record each location, grade, method, frequency, and alert/action limits.", contentType: CSV },
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
    files: [
      { filename: "README.md", label: "Start Here (README)", description: "What's inside and how to use the checklist.", contentType: MD },
      { filename: "lab-water-selection-checklist.pdf", label: "Lab Water Selection Checklist (PDF)", description: "Choose and justify the right water grade, with specs and monitoring.", contentType: PDF, generate: "pdf", source: "lab-water-selection-checklist.md" },
      { filename: "water-grade-quick-reference.csv", label: "Water Grade Quick Reference (Excel/CSV)", description: "Typical use, conductivity/TOC, microbial limit, and endotoxin per grade.", contentType: CSV },
    ],
  },
};

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
