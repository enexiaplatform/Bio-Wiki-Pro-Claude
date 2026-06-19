// Toolkit library model — in-app workflow assets (checklists, templates,
// guides), NOT lead magnets. Pro unlocks the toolkits; the GMP Audit Survival
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
    slug: "gmp-audit-kit",
    title: "GMP Audit Survival Kit",
    audience: "Senior QC/QA preparing for a GMP or Annex 1 audit",
    problemSolved: "Walk into the audit with a checklist, CAPA templates, a gap-analysis sheet, and rehearsed answers.",
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
    format: "Checklist + templates",
    accessTier: "pro",
    status: "soon",
  },
  {
    slug: "environmental-monitoring-checklist",
    title: "Environmental Monitoring Checklist",
    audience: "QC micro running cleanroom and utility EM",
    problemSolved: "Plan locations, limits, and excursion response against a risk-based EM program.",
    format: "Checklist",
    accessTier: "pro",
    status: "soon",
  },
  {
    slug: "bi-workflow-checklist",
    title: "BI Workflow Checklist",
    audience: "Validation and QC staff running sterilization challenges",
    problemSolved: "Select, place, recover, and interpret biological indicators without false negatives.",
    format: "Checklist",
    accessTier: "pro",
    status: "soon",
  },
  {
    slug: "culture-media-selection-guide",
    title: "Culture Media Selection Guide",
    audience: "QC micro analysts choosing and qualifying media",
    problemSolved: "Match media to the method, qualify each lot, and document equivalence decisions.",
    format: "PDF guide",
    accessTier: "pro",
    status: "soon",
  },
  {
    slug: "lab-water-selection-checklist",
    title: "Lab Water Selection Checklist",
    audience: "QC labs choosing the right water grade for a test",
    problemSolved: "Pick purified water vs WFI vs reagent-grade water and defend the choice.",
    format: "Checklist",
    accessTier: "pro",
    status: "soon",
  },
  {
    slug: "oos-investigation-template",
    title: "OOS Investigation Template",
    audience: "QC analysts and QA leading laboratory investigations",
    problemSolved: "Run a phased OOS investigation that holds up to inspection.",
    format: "Template",
    accessTier: "pro",
    status: "soon",
  },
  {
    slug: "data-integrity-self-check",
    title: "Data Integrity Self-Check",
    audience: "QC/QA assessing ALCOA+ readiness",
    problemSolved: "Spot data-integrity gaps before an auditor does.",
    format: "Checklist",
    accessTier: "free",
    status: "soon",
  },
];

export function getToolkit(slug: string): Toolkit | undefined {
  return toolkits.find((t) => t.slug === slug);
}
