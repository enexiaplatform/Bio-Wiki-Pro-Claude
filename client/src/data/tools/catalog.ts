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
    relatedWorkflow: { slug: "water-system-monitoring", title: "Pharmaceutical Water System Monitoring" },
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
    slug: "sterile-filtration-readiness-planner",
    title: "Sterile Filtration Readiness Planner",
    category: "Sterility",
    blurb: "Check retention validation, PUPSIT, integrity testing, and batch-impact controls.",
    description:
      "Free sterile filtration readiness planner - check bacterial-retention validation, integrity-test limits, PUPSIT or CCS/QRM rationale, validated process parameters, post-use integrity, and batch-impact assessment.",
    relatedWorkflow: { slug: "sterile-filtration", title: "Sterile Filtration" },
  },
  {
    slug: "gowning-qualification-readiness-planner",
    title: "Gowning Qualification Readiness Planner",
    category: "Sterility",
    blurb: "Check training, technique, gown plates, APS coverage, and requalification controls.",
    description:
      "Free gowning qualification readiness planner - check aseptic gowning training, assessor observation, consecutive successful sessions, gown monitoring counts, APS coverage, routine monitoring, and requalification controls.",
    relatedWorkflow: { slug: "aseptic-gowning-qualification", title: "Aseptic Gowning Qualification" },
  },
  {
    slug: "media-fill-aps-readiness-planner",
    title: "Media Fill APS Readiness Planner",
    category: "Sterility",
    blurb: "Check worst-case APS design, interventions, incubation, EM linkage, and disposition blockers.",
    description:
      "Free media fill APS readiness planner - check aseptic process simulation protocol, intervention matrix, operator coverage, growth promotion, worst-case run design, incubation, EM linkage, and positive-unit investigation controls.",
    relatedWorkflow: { slug: "aseptic-process-simulation", title: "Aseptic Process Simulation" },
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
    slug: "sterilization-f0-calculator",
    title: "F0 Sterilization Lethality Calculator",
    category: "Sterility",
    blurb: "Lethal rate and equivalent F0 time for a moist-heat sterilization hold.",
    description:
      "Free F0 sterilization calculator — compute the lethal rate and the equivalent time at 121.1 C (F0) for a moist-heat hold from temperature, time, and z-value.",
    relatedWorkflow: { slug: "biological-indicator-workflow", title: "Biological Indicator Workflow" },
  },
  {
    slug: "endotoxin-limit-calculator",
    title: "Endotoxin Limit & MVD Calculator",
    category: "Microbiology",
    blurb: "Calculate the endotoxin limit (K/M) and Maximum Valid Dilution for a BET.",
    description:
      "Free bacterial endotoxin limit and MVD calculator — apply the compendial formulas (endotoxin limit = K/M, Maximum Valid Dilution) for your LAL / bacterial endotoxin test.",
    relatedWorkflow: { slug: "water-system-monitoring", title: "Pharmaceutical Water System Monitoring" },
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
    slug: "equipment-qualification-readiness-planner",
    title: "Equipment Qualification Readiness Planner",
    category: "Validation",
    blurb: "Check DQ/IQ/OQ/PQ evidence before QA releases equipment for GMP use.",
    description:
      "Free equipment qualification readiness planner - check URS, risk assessment, DQ, IQ, OQ, PQ, deviations, and qualified-state controls before QA release.",
    relatedWorkflow: { slug: "equipment-qualification-lifecycle", title: "Equipment Qualification" },
  },
  {
    slug: "system-suitability-calculator",
    title: "System Suitability %RSD Calculator",
    category: "Laboratory controls",
    blurb: "Compute the injection-precision %RSD and check it against your SST limit.",
    description:
      "Free system suitability %RSD calculator — compute the relative standard deviation of replicate chromatographic injections and check it against a %RSD limit and minimum injection count (USP 621 / Ph. Eur. 2.2.46 style).",
    relatedWorkflow: { slug: "hplc-system-suitability-workflow", title: "HPLC System Suitability" },
  },
  {
    slug: "dilution-calculator",
    title: "Dilution & Standard Prep Calculator",
    category: "Laboratory controls",
    blurb: "Solve C1V1 = C2V2 for stock and diluent, or build a serial-dilution table.",
    description:
      "Free dilution calculator — solve C1V1 = C2V2 for the stock and diluent volumes to hit a target concentration, or build a serial (fold) dilution table for standard preparation.",
  },
  {
    slug: "dissolution-acceptance-checker",
    title: "Dissolution S1/S2/S3 Acceptance Checker",
    category: "Laboratory controls",
    blurb: "Check immediate-release dissolution unit results against staged S1/S2/S3 criteria.",
    description:
      "Free dissolution acceptance checker - paste 6, 12, or 24 unit results, enter the Q value, and evaluate immediate-release S1/S2/S3 staged acceptance criteria.",
    relatedWorkflow: { slug: "dissolution-testing-workflow", title: "Dissolution Testing" },
  },
  {
    slug: "stability-trend-shelf-life-planner",
    title: "Stability Trend & Shelf-Life Planner",
    category: "Laboratory controls",
    blurb: "Project a stability trend against specs and decide whether shelf-life extrapolation needs review.",
    description:
      "Free stability trend and shelf-life planner - enter long-term stability points, specifications, proposed retest period or shelf life, and get a Q1A/Q1E-style triage note for trend, headroom, extrapolation, and impact review.",
    relatedWorkflow: { slug: "stability-program", title: "Stability Program" },
  },
  {
    slug: "cell-based-potency-readiness-planner",
    title: "Cell-Based Potency Readiness Planner",
    category: "Biologics QC",
    blurb: "Check whether a bioassay run is ready to report relative potency.",
    description:
      "Free cell-based potency readiness planner - check reference standard, cell system, plate controls, curve fit, parallelism, precision, and assay-vs-sample investigation before reporting relative potency.",
    relatedWorkflow: { slug: "cell-based-potency-assay", title: "Cell-Based Potency Assay" },
  },
  {
    slug: "hcp-testing-readiness-planner",
    title: "HCP Testing Readiness Planner",
    category: "Biologics QC",
    blurb: "Check HCP ELISA coverage, dilutional linearity, range, controls, and impact assessment.",
    description:
      "Free HCP testing readiness planner - check method validity, antibody coverage, dilutional linearity, assay range, plate controls, orthogonal support, clearance trend, and assay-vs-process impact before reporting host-cell protein results.",
    relatedWorkflow: { slug: "host-cell-protein-testing-workflow", title: "Host-Cell Protein Testing" },
  },
  {
    slug: "viral-safety-readiness-planner",
    title: "Viral Safety Readiness Planner",
    category: "Biologics QC",
    blurb: "Check source control, viral testing, clearance, LRV margin, and signal-response blockers.",
    description:
      "Free viral safety readiness planner - check ICH Q5A(R2) source control, raw-material risk, stage-appropriate viral testing, assay controls, representative clearance, orthogonal LRV margin, prior knowledge, and adventitious-agent response before relying on a biologics viral-safety package.",
    relatedWorkflow: { slug: "viral-safety-testing-workflow", title: "Viral Safety Testing" },
  },
  {
    slug: "oot-trend-triage-planner",
    title: "OOT Trend Triage Planner",
    category: "Investigations",
    blurb: "Classify an in-spec result against a historical baseline and decide the next action.",
    description:
      "Free OOT trend triage planner - compare a current result to historical mean, standard deviation, and specification limits to decide whether it is routine noise, an OOT signal, or an OOS event.",
    relatedWorkflow: { slug: "oos-investigation", title: "OOS Investigation" },
  },
  {
    slug: "audit-trail-review-triage",
    title: "Audit Trail Review Triage",
    category: "Data integrity",
    blurb: "Risk-rank audit-trail exceptions and build a defensible reviewer note.",
    description:
      "Free audit trail review triage tool - risk-rank GMP audit-trail exceptions, identify evidence to capture, and build a reviewer note for ALCOA+ data integrity review.",
    relatedWorkflow: { slug: "data-integrity-review", title: "Data Integrity Review" },
  },
  {
    slug: "batch-release-readiness-checklist",
    title: "Batch Release Readiness Checklist",
    category: "Quality systems",
    blurb: "Check release blockers before QA or QP disposition of a batch.",
    description:
      "Free batch release readiness checklist - check batch record completion, QC testing, deviations, audit trails, reconciliation, and authorized QA/QP disposition before release.",
    relatedWorkflow: { slug: "batch-record-review-release", title: "Batch Record Review & Release" },
  },
  {
    slug: "change-control-impact-triage",
    title: "Change Control Impact Triage",
    category: "Quality systems",
    blurb: "Classify GMP change impact across quality, validation, stability, and regulatory risk.",
    description:
      "Free change control impact triage tool - classify a proposed GMP change, identify approval blockers, and build an impact-assessment note before implementation.",
    relatedWorkflow: { slug: "change-control-workflow", title: "Change Control" },
  },
  {
    slug: "supplier-qualification-risk-triage",
    title: "Supplier Qualification Risk Triage",
    category: "Quality systems",
    blurb: "Score supplier/material risk and choose the right qualification depth.",
    description:
      "Free supplier qualification risk triage tool - score material criticality, supplier history, substitutability, regulatory status, and control gaps to choose audit depth, quality agreement, incoming verification, and monitoring.",
    relatedWorkflow: { slug: "supplier-qualification-workflow", title: "Supplier Qualification" },
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
  {
    slug: "capa-effectiveness-check-planner",
    title: "CAPA Effectiveness Check Planner",
    category: "Quality systems",
    blurb: "Plan a defensible CAPA effectiveness check with measurable evidence.",
    description:
      "Free CAPA effectiveness check planner - score whether your CAPA is ready for closure, define a verification window, and build evidence that the root cause is controlled.",
    relatedWorkflow: { slug: "deviation-capa", title: "Deviation & CAPA" },
  },
];

export function getToolMeta(slug: string): ToolMeta | undefined {
  return TOOL_CATALOG.find((t) => t.slug === slug);
}

/** Slugs for the sitemap (kept in sync with server/routes.ts). */
export const TOOL_SLUGS = TOOL_CATALOG.map((t) => t.slug);
