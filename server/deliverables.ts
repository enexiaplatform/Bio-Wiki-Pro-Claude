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
