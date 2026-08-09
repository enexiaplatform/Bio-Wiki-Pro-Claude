// Toolkit library model — in-app workflow assets (checklists, templates,
// guides), NOT lead magnets. Pro unlocks the toolkits; the GMP Audit Readiness
// Kit is the one fully built today, the rest are honestly marked "Coming soon".
// No fake downloads.

export type AccessTier = "free" | "pro";
export type ToolkitStatus = "available" | "soon";

export interface Toolkit {
  slug: string;
  title: string;
  /** Who it's for. */
  audience: string;
  /** What it helps with. */
  problemSolved: string;
  /** checklist / template / PDF / Excel / guide. */
  format: string;
  accessTier: AccessTier;
  status: ToolkitStatus;
  /** Internal route for available toolkits. */
  href?: string;
}

export const toolkits: Toolkit[] = [
  {
    slug: "pharma-api-analytical-lifecycle",
    title: "Pharma API Analytical & Lifecycle Control Evidence Map",
    audience: "API analytical development, QC, statistics, stability, validation, technology transfer, Quality Unit and regulatory CMC",
    problemSolved: "Connect an API attribute and intended decision to analytical target profile, method capability, specification linkage, stability, transfer and lifecycle change without inventing methods, limits or approval.",
    format: "Guide + validated workbook + fictional example",
    accessTier: "pro",
    status: "available",
    href: "/my-downloads",
  },
  {
    slug: "pharma-api-starting-material-input-control",
    title: "Pharma API Starting Material & Input Control Evidence Map",
    audience: "API process development, supplier quality, analytical development/QC, manufacturing science, Quality Unit, validation, supply chain and regulatory CMC",
    problemSolved: "Connect a proposed starting-material boundary to the actual supplier/sub-tier chain, material and impurity knowledge, specification basis, incoming controls and lifecycle change without inventing approval, limits or filing conclusions.",
    format: "Guide + validated workbook + fictional example",
    accessTier: "pro",
    status: "available",
    href: "/my-downloads",
  },
  {
    slug: "pharma-api-impurity-control",
    title: "Pharma API Process & Impurity Control Evidence Map",
    audience: "Small-molecule API process development, engineering/MSAT, analytical development, impurity safety, QC, Quality Unit, validation, technology transfer, and regulatory CMC",
    problemSolved: "Connect a defined API route and process version to inputs, unit operations, impurity origin, observed fate, analytical capability, control placement, change and accountable decisions without inventing chemistry, purge factors, limits, specifications or approval.",
    format: "Guide + validated workbook + fictional example",
    accessTier: "pro",
    status: "available",
    href: "/my-downloads",
  },
  {
    slug: "biopharma-process-validation-cpv",
    title: "Biopharma Process Validation & CPV Evidence Map",
    audience: "Biopharma process development/MSAT, manufacturing, validation, engineering/automation, analytical/QC, statistics, product quality, Quality Unit, and regulatory CMC",
    problemSolved: "Connect process knowledge and enabling-system readiness to PPQ, continued verification, signal assessment, change, and accountable decisions without inventing process limits, batch counts, statistical rules, validation conclusions, or authorization.",
    format: "Guide + validated workbook + fictional example",
    accessTier: "pro",
    status: "available",
    href: "/my-downloads",
  },
  {
    slug: "biopharma-cell-substrate-control",
    title: "Biopharma Cell Substrate & Bank Lifecycle Evidence Map",
    audience: "Biopharma cell-line development, molecular characterization, cell-bank manufacturing/custody, biosafety, viral safety, process/MSAT, analytical/product quality, statistics, validation, quality, and regulatory CMC",
    problemSolved: "Connect a defined host, construct, clone and bank version to lineage, selection, bank lifecycle, characterization, genetic/phenotypic stability, production age, process/product evidence, change control, and accountable review without inventing tests, limits, criteria, or approval.",
    format: "Guide + validated workbook + fictional example",
    accessTier: "pro",
    status: "available",
    href: "/my-downloads",
  },
  {
    slug: "biopharma-materials-control",
    title: "Biopharma Materials & Single-Use Control Evidence Map",
    audience: "Biopharma raw-material science, supplier quality, supply chain, process/MSAT, manufacturing, single-use and E&L specialists, analytical, validation, quality, and regulatory CMC",
    problemSolved: "Connect a defined material or single-use configuration to intended use, supplier/sub-tier chain, functional attributes, incoming controls, process/product evidence, qualification, change control, continuity, and accountable review without inventing criteria or approval.",
    format: "Guide + validated workbook + fictional example",
    accessTier: "pro",
    status: "available",
    href: "/my-downloads",
  },
  {
    slug: "biopharma-technology-transfer",
    title: "Biopharma Technology Transfer Evidence Map",
    audience: "Biopharma technology transfer, product/process development, MSAT, manufacturing, engineering/automation, analytical development, QC, validation, supply, quality, and regulatory CMC",
    problemSolved: "Connect a frozen transfer scope to knowledge, receiving-unit capability, equipment/material/process differences, analytical readiness, validation, comparability, commitments, staged acceptance, and accountable review without inventing product criteria or authorization.",
    format: "Guide + validated workbook + fictional example",
    accessTier: "pro",
    status: "available",
    href: "/my-downloads",
  },
  {
    slug: "biopharma-analytical-control-strategy",
    title: "Biopharma Analytical Control Strategy Evidence Map",
    audience: "Biopharma product quality, analytical development, bioassay/statistics, QC, reference-standard owners, quality, validation, and regulatory CMC",
    problemSolved: "Connect product attributes, analytical purpose and capability, potency, impurities, reference systems, control placement, specification basis, lifecycle changes, evidence, and qualified review without inventing methods or criteria.",
    format: "Guide + validated workbook + fictional example",
    accessTier: "pro",
    status: "available",
    href: "/my-downloads",
  },
  {
    slug: "biopharma-formulation-stability",
    title: "Biopharma Formulation & Stability Evidence Map",
    audience: "Biopharma formulation, fill-finish/MSAT, analytical and stability sciences, container engineering, quality, validation, and regulatory CMC",
    problemSolved: "Connect degradation pathways, formulation hypotheses, manufacturing and handling exposure, the complete presentation, stability-indicating methods, studies, changes, commitments, and qualified review without inventing platform recipes or shelf life.",
    format: "Guide + validated workbook + fictional example",
    accessTier: "pro",
    status: "available",
    href: "/my-downloads",
  },
  {
    slug: "biopharma-downstream-clearance",
    title: "Biopharma Downstream Purification & Clearance Evidence Map",
    audience: "Biopharma downstream process development, MSAT, analytical development, viral safety, quality, and regulatory CMC",
    problemSolved: "Connect unit operations, impurity and product-variant control, viral safety, recovery, scale-down evidence, lifecycle boundaries, and accountable review without inventing platform clearance claims.",
    format: "Guide + validated workbook + fictional example",
    accessTier: "pro",
    status: "available",
    href: "/my-downloads",
  },
  {
    slug: "biopharma-upstream-control",
    title: "Biopharma Upstream Control Evidence Map",
    audience: "Biopharma process development, MSAT, analytical development, quality, and regulatory CMC",
    problemSolved: "Connect cell substrate, materials, upstream parameters, performance indicators, product attributes, evidence strength, controls, and lifecycle triggers without inventing platform ranges.",
    format: "Guide + validated workbook + fictional example",
    accessTier: "pro",
    status: "available",
    href: "/my-downloads",
  },
  {
    slug: "gmp-audit-kit",
    title: "GMP Audit Readiness Kit",
    audience: "Senior QC/QA preparing for a GMP or Annex 1 audit",
    problemSolved: "Organize readiness evidence, gap triage, CAPA planning, and interview rehearsal before qualified site review.",
    format: "Toolkit (PDF guide + Excel + templates)",
    accessTier: "pro",
    status: "available",
    href: "/toolkits/gmp-audit-kit",
  },
  {
    slug: "microbiology-qc-starter-pack",
    title: "Microbiology QC Starter Pack",
    audience: "New QC micro analysts and lab supervisors",
    problemSolved: "Set up media, GPT, and routine micro testing the right way from day one.",
    format: "Guide + checklist (PDF + Excel)",
    accessTier: "pro",
    status: "available",
    href: "/my-downloads",
  },
  {
    slug: "environmental-monitoring-checklist",
    title: "Environmental Monitoring Checklist",
    audience: "QC micro running cleanroom and utility EM",
    problemSolved: "Plan locations, limits, and excursion response against a risk-based EM program.",
    format: "Checklist (PDF + Excel)",
    accessTier: "pro",
    status: "available",
    href: "/my-downloads",
  },
  {
    slug: "bi-workflow-checklist",
    title: "BI Workflow Checklist",
    audience: "Validation and QC staff running sterilization challenges",
    problemSolved: "Select, place, recover, and interpret biological indicators without false negatives.",
    format: "Checklist (PDF + Excel)",
    accessTier: "pro",
    status: "available",
    href: "/my-downloads",
  },
  {
    slug: "culture-media-selection-guide",
    title: "Culture Media Selection Guide",
    audience: "QC micro analysts choosing and qualifying media",
    problemSolved: "Match media to the method, qualify each lot, and document equivalence decisions.",
    format: "PDF guide + Excel",
    accessTier: "pro",
    status: "available",
    href: "/my-downloads",
  },
  {
    slug: "lab-water-selection-checklist",
    title: "Lab Water Selection Checklist",
    audience: "QC labs choosing the right water grade for a test",
    problemSolved: "Pick purified water vs WFI vs reagent-grade water and defend the choice.",
    format: "Checklist (PDF + Excel)",
    accessTier: "pro",
    status: "available",
    href: "/my-downloads",
  },
  {
    slug: "oos-investigation-template",
    title: "OOS Investigation Template",
    audience: "QC analysts and QA leading laboratory investigations",
    problemSolved: "Run a phased OOS investigation that holds up to inspection.",
    format: "Template (PDF + Excel)",
    accessTier: "pro",
    status: "available",
    href: "/my-downloads",
  },
  {
    slug: "data-integrity-self-check",
    title: "Data Integrity Self-Check",
    audience: "QC/QA assessing ALCOA+ readiness",
    problemSolved: "Spot data-integrity gaps before an auditor does.",
    format: "Checklist (PDF + Excel)",
    accessTier: "pro",
    status: "available",
    href: "/my-downloads",
  },
];

export function getToolkit(slug: string): Toolkit | undefined {
  return toolkits.find((t) => t.slug === slug);
}
