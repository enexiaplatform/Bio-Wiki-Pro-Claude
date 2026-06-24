// Pure metadata for the free QC/QA tools — NO React components, so content
// pages (workflows, lessons) can link to tools without pulling the tool bundle
// into their route chunk. The visual registry (features/tools/registry.tsx)
// builds on this and adds the icon + interactive element per slug.

export interface ToolMeta {
  /** Clean URL slug — /tools/<slug>. Kept in sync with the sitemap in server/routes.ts. */
  slug: string;
  /** H1 + SEO title base. */
  title: string;
  /** Topical group, shown as a chip on the index card. */
  category: string;
  /** Short teaser for the index card and related-tool strips. */
  blurb: string;
  /** SEO meta description for the standalone page. */
  description: string;
  /** The structured workflow this tool supports, for a reverse link. Optional. */
  relatedWorkflow?: { slug: string; title: string };
}

// Order here is the order shown on the /tools index.
export const TOOL_CATALOG: ToolMeta[] = [
  {
    slug: "audit-readiness-scorecard",
    title: "GMP Audit Readiness Scorecard",
    category: "Quality systems",
    blurb: "Score your inspection readiness across six GMP areas and see your top gaps.",
    description:
      "Free GMP audit readiness self-assessment — rate your quality system across six areas and get a prioritized list of the gaps to close before an inspection.",
  },
  {
    slug: "lab-water-type-selector",
    title: "Lab Water Type Selector",
    category: "Microbiology",
    blurb: "Match your use case to the right pharmacopeial water grade and its controls.",
    description:
      "Free pharmaceutical water grade selector — pick your use case (Water for Injection, Purified Water, reagent grade) and see the key controls and pitfalls for each.",
  },
  {
    slug: "culture-media-selection-helper",
    title: "Culture Media Selection Helper",
    category: "Microbiology",
    blurb: "Choose the right culture media for your microbiology test and incubation.",
    description:
      "Free culture media selector for pharmaceutical microbiology — match your test (bioburden, sterility, environmental monitoring, growth promotion) to the right media.",
    relatedWorkflow: { slug: "culture-media-selection", title: "Culture Media Selection" },
  },
  {
    slug: "sterility-test-method-selector",
    title: "Sterility Test Method Selector",
    category: "Sterility",
    blurb: "Decide between membrane filtration and direct inoculation for your product.",
    description:
      "Free sterility test method selector — choose between membrane filtration and direct inoculation based on your product type and volume, with the key method controls.",
  },
  {
    slug: "microbial-count-calculator",
    title: "Microbial Count (CFU) Calculator",
    category: "Microbiology",
    blurb: "Convert plate or membrane colony counts to CFU/mL in the original sample.",
    description:
      "Free microbial count (CFU) calculator — convert colonies on a pour plate, spread plate, or membrane back to CFU/mL accounting for dilution and volume plated.",
    relatedWorkflow: { slug: "environmental-monitoring", title: "Environmental Monitoring" },
  },
  {
    slug: "endotoxin-limit-calculator",
    title: "Endotoxin Limit & MVD Calculator",
    category: "Microbiology",
    blurb: "Calculate the endotoxin limit (K/M) and Maximum Valid Dilution for a BET.",
    description:
      "Free bacterial endotoxin limit and MVD calculator — apply the compendial formulas (endotoxin limit = K/M, Maximum Valid Dilution) for your LAL / bacterial endotoxin test.",
  },
  {
    slug: "cleaning-validation-maco-calculator",
    title: "Cleaning Validation MACO Calculator",
    category: "Validation",
    blurb: "Compute MACO by dose, HBEL, and 10 ppm, then derive surface and swab limits.",
    description:
      "Free cleaning validation MACO calculator — dose-based, HBEL/PDE, and 10 ppm maximum allowable carryover limits, with surface and recovery-corrected swab limits.",
    relatedWorkflow: { slug: "cleaning-validation-program", title: "Cleaning Validation" },
  },
  {
    slug: "process-capability-calculator",
    title: "Process Capability Calculator",
    category: "Validation",
    blurb: "Compute Cp, Cpk, and the estimated out-of-spec PPM from your process data.",
    description:
      "Free process capability calculator — Cp, Cpu, Cpl, Cpk and the estimated out-of-spec PPM from spec limits and process data, with raw-data paste support.",
    relatedWorkflow: { slug: "process-validation", title: "Process Validation" },
  },
  {
    slug: "oos-investigation-decision-tree",
    title: "OOS Investigation Decision Tree",
    category: "Investigations",
    blurb: "Walk a phased FDA OOS investigation and see the right next step.",
    description:
      "Free OOS investigation decision tree — walk the phased FDA out-of-specification process (Phase I laboratory investigation, Phase II) and see the appropriate next step.",
    relatedWorkflow: { slug: "oos-investigation", title: "OOS Investigation" },
  },
  {
    slug: "em-scenario-decision-tree",
    title: "EM Scenario Decision Tree",
    category: "Microbiology",
    blurb: "Work through common environmental monitoring excursions and responses.",
    description:
      "Free environmental monitoring decision tree — work through common EM excursion scenarios (alert and action limits, investigations) and the appropriate response.",
    relatedWorkflow: { slug: "environmental-monitoring", title: "Environmental Monitoring" },
  },
  {
    slug: "contamination-control-strategy-builder",
    title: "CCS Builder Lite",
    category: "Sterility",
    blurb: "Outline a contamination control strategy across the key control elements.",
    description:
      "Free contamination control strategy (CCS) builder — outline your Annex 1 contamination controls across the key elements and spot the gaps.",
    relatedWorkflow: { slug: "environmental-monitoring", title: "Environmental Monitoring" },
  },
  {
    slug: "investigation-template-viewer",
    title: "Investigation Template Viewer",
    category: "Investigations",
    blurb: "Preview a structured investigation template you can adapt.",
    description:
      "Free QC investigation template viewer — preview a structured deviation/OOS investigation outline you can adapt to your quality system.",
    relatedWorkflow: { slug: "deviation-capa", title: "Deviation & CAPA" },
  },
];

export function getToolMeta(slug: string): ToolMeta | undefined {
  return TOOL_CATALOG.find((t) => t.slug === slug);
}

/** Slugs for the sitemap (kept in sync with server/routes.ts). */
export const TOOL_SLUGS = TOOL_CATALOG.map((t) => t.slug);
