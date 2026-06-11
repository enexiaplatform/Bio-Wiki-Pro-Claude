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
  /** File name on disk under content/deliverables/<dir>/ */
  filename: string;
  /** Human-facing label */
  label: string;
  /** One-line description shown in the UI */
  description: string;
  /** MIME type for the download response */
  contentType: string;
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

export const DELIVERABLES: Record<string, DeliverableProduct> = {
  gmp_audit_kit: {
    id: "gmp_audit_kit",
    dir: "gmp-audit-kit",
    name: "GMP Audit Survival Kit",
    entitledBy: ["gmp_audit_kit", "bundle"],
    files: [
      { filename: "README.md", label: "Start Here (README)", description: "What's inside and the order to use it.", contentType: MD },
      { filename: "gmp-audit-survival-guide.md", label: "GMP Audit Survival Guide", description: "The full framework — from 30 days out to audit-day to the written response.", contentType: MD },
      { filename: "sop-gap-analysis.csv", label: "SOP Gap Analysis (Excel/Sheets)", description: "Score 20 quality-system elements; the sheet computes your % readiness and worst gaps.", contentType: CSV },
      { filename: "capa-templates.md", label: "10 CAPA Report Templates", description: "Ready-to-fill CAPA structures for the most common audit nonconformances.", contentType: MD },
      { filename: "audit-interview-qa.md", label: "Audit Interview Q&A Scripts", description: "50+ real auditor questions with model QC/QA answers.", contentType: MD },
      { filename: "mock-audit-walkthrough.md", label: "Mock Audit Walkthrough", description: "A full inspection narrated from the auditor's side.", contentType: MD },
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
