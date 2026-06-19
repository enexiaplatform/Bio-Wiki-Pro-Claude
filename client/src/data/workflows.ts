// Workflow content model — the "Workflow Learning OS" layer.
//
// A Workflow is an operational, scannable how-to (steps, control points,
// mistakes, troubleshooting) that links out to the supporting Academy lessons
// and Pro toolkits. Workflows are grouped into WorkflowCategories that map 1:1
// onto the existing learning paths (client/src/data/learningPaths.ts).
//
// Keep this data SERIALIZABLE (no React/icon imports) — icons are mapped by
// category/workflow slug in the page components. Lesson/toolkit references are
// bare slugs; pages build the hrefs (`/library/<slug>`, `/paths/<slug>`,
// `/toolkits`) with template literals so the link validator stays happy.

export type AccessTier = "free" | "pro";

export interface WorkflowStep {
  title: string;
  detail: string;
}

export interface TroubleshootingItem {
  problem: string;
  action: string;
}

export interface Workflow {
  slug: string;
  categorySlug: string;
  title: string;
  /** One-line purpose — what this workflow helps you do. */
  purpose: string;
  /** Who it helps. */
  audience: string;
  /** "Use this when" — scannable triggers. */
  useWhen: string[];
  /** Inputs / prerequisites before you start. */
  inputs: string[];
  steps: WorkflowStep[];
  criticalControlPoints: string[];
  commonMistakes: string[];
  troubleshooting: TroubleshootingItem[];
  /** Bare academy MDX slugs → /library/<slug>. */
  relatedLessonSlugs: string[];
  /** Bare toolkit slugs → see data/toolkits.ts. */
  relatedToolkitSlugs: string[];
  accessTier: AccessTier;
  /** Optional long educational background, rendered collapsed under "Deep dive". */
  deepDive?: string;
}

export interface WorkflowCategory {
  slug: string;
  title: string;
  /** One-line purpose for the category card. */
  description: string;
  audience: string;
  /** Existing learning path slug (/paths/<slug>), if any. */
  pathSlug?: string;
  /** Direct route for categories without a path (e.g. Career). */
  href?: string;
  /** Workflow detail pages that live in this category (may be empty for now). */
  workflowSlugs: string[];
}

// ── Categories — one per vertical, ordered for the homepage grid ──────────────
export const workflowCategories: WorkflowCategory[] = [
  {
    slug: "microbiology-qc",
    title: "Microbiology QC",
    description: "Media, environmental monitoring, sterility, endotoxin, and water — the daily micro lab.",
    audience: "QC micro analysts & supervisors",
    pathSlug: "microbiology-qc-fundamentals",
    workflowSlugs: ["culture-media-selection", "environmental-monitoring", "biological-indicator-workflow"],
  },
  {
    slug: "sterile-aseptic",
    title: "Sterile & Aseptic Manufacturing",
    description: "Protect the sterile boundary — gowning, aseptic technique, sterilization, media fills.",
    audience: "Aseptic operations & QA",
    pathSlug: "sterile-aseptic-manufacturing",
    workflowSlugs: [],
  },
  {
    slug: "validation",
    title: "Validation",
    description: "Qualify and validate equipment, methods, processes, cleaning, and computer systems.",
    audience: "Validation & QC engineers",
    pathSlug: "validation-essentials",
    workflowSlugs: [],
  },
  {
    slug: "quality-systems",
    title: "Quality Systems",
    description: "Run the QMS engine — deviations, CAPA, change control, risk, and product release.",
    audience: "QA & quality systems owners",
    pathSlug: "quality-systems",
    workflowSlugs: [],
  },
  {
    slug: "investigations-data-integrity",
    title: "Investigations & Data Integrity",
    description: "Investigate failures and defend your data — ALCOA+, OOS/OOT, and trending.",
    audience: "QC analysts & QA reviewers",
    pathSlug: "investigations-data-integrity",
    workflowSlugs: [],
  },
  {
    slug: "laboratory-controls",
    title: "Laboratory Controls",
    description: "Compendial analytical control — reference standards, USP tests, impurities, stability.",
    audience: "Analytical QC labs",
    pathSlug: "laboratory-controls-stability",
    workflowSlugs: [],
  },
  {
    slug: "biologics-qc",
    title: "Biologics QC",
    description: "QC for large molecules — potency, host-cell proteins, aggregation, viral safety.",
    audience: "Biologics & biopharma QC",
    pathSlug: "biologics-biopharmaceutical-qc",
    workflowSlugs: [],
  },
  {
    slug: "career-skills",
    title: "Career Skills",
    description: "Grow from QC analyst to QA leader — skills, interview prep, and audit confidence.",
    audience: "QC/QA professionals advancing",
    href: "/career",
    workflowSlugs: [],
  },
];

// ── Workflow detail pages ─────────────────────────────────────────────────────
export const workflows: Workflow[] = [
  {
    slug: "culture-media-selection",
    categorySlug: "microbiology-qc",
    title: "Culture Media Selection",
    purpose: "Pick, prepare, and release the right microbiological media for each QC test.",
    audience: "QC micro analysts and supervisors setting up or reviewing a media program.",
    useWhen: [
      "You're choosing media for a new method, product, or sample type",
      "A growth promotion test (GPT) is due, or one has failed",
      "An auditor asks how you qualify incoming media lots",
      "You need to decide between selective and non-selective media",
    ],
    inputs: [
      "The compendial method and acceptance criteria (USP/EP) for the test",
      "Target organisms and the compendial test strains for GPT",
      "Incubation conditions defined in your approved SOP",
      "The media certificate of analysis (CoA) from the supplier",
    ],
    steps: [
      { title: "Match the media to the method", detail: "Start from the compendial chapter (e.g. USP 61/62, USP 71, EP 2.6.x). Use the named medium or a justified equivalent, and document the equivalence rationale." },
      { title: "Choose the media type for the purpose", detail: "Non-selective (e.g. TSA / SCDA) for total counts and sterility; selective or differential (e.g. MacConkey, Cetrimide, MSA) when screening for specified or objectionable organisms." },
      { title: "Define preparation and sterilization", detail: "Follow the manufacturer's instructions for hydration, post-sterilization pH, and autoclave cycle. Record lot, expiry, and every prep parameter." },
      { title: "Qualify each lot with growth promotion", detail: "Run GPT against the compendial strains before release-testing use. For selective media, confirm BOTH recovery of the target and inhibition of non-target organisms." },
      { title: "Set storage and expiry controls", detail: "Store at the labeled conditions, protect from light and dehydration, apply a use-by date, and quarantine the lot until GPT passes." },
      { title: "Release and trace", detail: "Release a lot only after GPT and visual checks pass, then link the media lot to the tests it supports so every result is traceable." },
    ],
    criticalControlPoints: [
      "Growth promotion passes before a lot is used for release testing",
      "pH measured after sterilization is within the method range",
      "Selective media demonstrate both recovery and inhibition",
      "Every plate is traceable to a qualified, in-date media lot",
    ],
    commonMistakes: [
      "Using media past expiry, or with no GPT performed on the lot",
      "Over-autoclaving — degrades selective agents and fastidious-organism recovery",
      "Treating all media as interchangeable and ignoring selective/differential intent",
      "Substituting a named medium with no documented equivalence",
    ],
    troubleshooting: [
      { problem: "GPT shows weak or no growth", action: "Check for sterilization over-heating, out-of-range pH, plate age, and strain viability / passage number; re-prepare from fresh dehydrated media." },
      { problem: "Selective medium grows non-target organisms", action: "Verify the correct formulation, confirm selective agents weren't degraded by over-autoclaving, and check the incubation temperature." },
      { problem: "Inconsistent counts between lots", action: "Compare prep records and CoA, standardize hydration volume and pour depth, then re-run GPT." },
    ],
    relatedLessonSlugs: ["growth-promotion-testing", "objectionable-organisms", "microbial-identification", "bioburden-usp-61"],
    relatedToolkitSlugs: ["culture-media-selection-guide", "microbiology-qc-starter-pack"],
    accessTier: "free",
    deepDive:
      "Media is the silent variable behind almost every microbiology result. Growth promotion testing is what turns a bag of agar into a qualified, defensible test system: it proves the lot recovers low numbers of the compendial strains, and — for selective media — that it still suppresses the organisms it's meant to exclude. The compendial strain set (typically including S. aureus, P. aeruginosa, B. subtilis, C. albicans and A. brasiliensis for non-selective recovery, plus method-specific challenge organisms) is chosen to span Gram-positive, Gram-negative, spore-forming, and fungal recovery. When you substitute a medium, equivalence is a written, data-backed judgement — not a like-for-like swap — and it should be approved through your change-control system.",
  },
  {
    slug: "environmental-monitoring",
    categorySlug: "microbiology-qc",
    title: "Environmental Monitoring",
    purpose: "Design and run a risk-based EM program that detects contamination before it reaches product.",
    audience: "QC micro and QA overseeing cleanroom and utility monitoring.",
    useWhen: [
      "Setting up or revising an EM program for a classified area",
      "An excursion or adverse trend needs a response",
      "Preparing for an Annex 1 / GMP inspection of contamination control",
      "Qualifying a new cleanroom, isolator, or RABS",
    ],
    inputs: [
      "Cleanroom classification and the contamination control strategy (CCS)",
      "Validated sampling methods (active air, settle plates, contact/swab, personnel)",
      "Qualified media and a justified incubation regime",
      "Alert and action limits, plus a trending tool",
    ],
    steps: [
      { title: "Map sample locations by risk", detail: "Use a documented risk assessment (process steps, airflow, interventions) to place sites at worst-case points — not just convenient ones." },
      { title: "Define methods, frequency, and limits", detail: "Match the grade (A–D) to active-air volume, settle-plate exposure, contact plates, and personnel monitoring; set alert/action limits from guidance and your own historical data." },
      { title: "Sample aseptically", detail: "Train operators, control the sampling intervention itself, and protect samples from secondary contamination on the way to the lab." },
      { title: "Incubate per a justified regime", detail: "Use a recovery scheme that captures both bacteria and fungi (commonly a dual-temperature incubation); record and reconcile every plate." },
      { title: "Trend and review", detail: "Plot counts against alert/action limits and review per-site AND aggregate trends — a run of 'passing' results can still be drifting." },
      { title: "Respond to excursions", detail: "Investigate action-limit breaches and adverse trends: identify the isolate, assess product impact, and drive a CAPA." },
    ],
    criticalControlPoints: [
      "Sample locations justified by a documented risk assessment",
      "Personnel and grade A/B monitoring during every aseptic operation",
      "Excursions trigger a timely, documented investigation",
      "Trending detects drift before it becomes an action-limit breach",
    ],
    commonMistakes: [
      "Sampling only easy locations and missing worst-case points",
      "Treating an alert limit as a 'pass' and ignoring the trend",
      "Disrupting the aseptic field while taking the sample",
      "No microbial identification on action-limit recoveries",
    ],
    troubleshooting: [
      { problem: "Recurring excursions at one site", action: "Review the airflow / smoke study, cleaning, and interventions at that location; rule out a sampling artifact before concluding process loss." },
      { problem: "Sudden fungal spike", action: "Check the facility (construction, HVAC, water ingress), gowning, and incubation conditions; identify isolates to genus/species." },
      { problem: "Counts trending up but still below action limit", action: "Open a trend investigation now — don't wait for an action breach; reassess limits and cleaning frequency." },
    ],
    relatedLessonSlugs: ["environmental-monitoring-basics", "microbial-excursion-investigation", "contamination-control-strategy", "disinfectant-qualification"],
    relatedToolkitSlugs: ["environmental-monitoring-checklist", "gmp-audit-kit"],
    accessTier: "free",
    deepDive:
      "Environmental monitoring doesn't make product sterile — it provides evidence that your contamination control strategy is working. Under Annex 1 (2022), EM is explicitly a feedback loop into the CCS rather than a stand-alone pass/fail gate: site selection, limits, and frequency all flow from risk assessment, and trending is given equal weight to single results. The most informative EM programs treat an adverse trend below the action limit as a signal worth investigating, identify recoveries to species to build a facility flora baseline, and tie personnel monitoring directly to the aseptic interventions performed.",
  },
  {
    slug: "biological-indicator-workflow",
    categorySlug: "microbiology-qc",
    title: "Biological Indicator Workflow",
    purpose: "Use biological indicators to challenge and confirm a sterilization or depyrogenation process.",
    audience: "QC and validation staff running sterilization qualification and routine BI monitoring.",
    useWhen: [
      "Validating a steam, dry-heat, VHP, or EO cycle",
      "Running routine BI challenges on a qualified cycle",
      "A BI shows growth (positive) after exposure",
      "Selecting a BI for a new process or load configuration",
    ],
    inputs: [
      "The target process and its lethality requirement (e.g. SAL of 10^-6)",
      "A BI with the right organism, certified population, and D-value for the process",
      "Qualified recovery media and incubation capability",
      "Defined BI placement at worst-case load locations",
    ],
    steps: [
      { title: "Select the right BI", detail: "Match the organism to the process (e.g. G. stearothermophilus for steam and VHP, B. atrophaeus for dry heat and EO) and confirm the certified population and D-value on the CoA." },
      { title: "Place at worst-case locations", detail: "Position BIs at the hardest-to-sterilize points identified by the load and heat-penetration study, not where they're easy to retrieve." },
      { title: "Expose and recover", detail: "Run the cycle, then aseptically transfer the BIs into recovery media within the labeled hold time. Always include positive and negative controls." },
      { title: "Incubate per the manufacturer's instructions", detail: "Incubate at the specified temperature and time, then read for growth (turbidity or indicator colour change)." },
      { title: "Interpret the result", detail: "All exposed BIs negative — with valid controls — supports the kill claim. Any positive is an excursion until proven otherwise." },
      { title: "Investigate and document", detail: "Confirm the controls, review the cycle's physical data (temperature, time, F0), and investigate any unexpected positive before releasing the cycle or load." },
    ],
    criticalControlPoints: [
      "BI organism, population, and D-value match the process and the CoA",
      "BIs placed at validated worst-case locations",
      "Positive and negative controls valid for every run",
      "Recovery within the labeled hold time to avoid false negatives",
    ],
    commonMistakes: [
      "Using a BI whose organism or D-value doesn't suit the process",
      "Placing BIs only in easy-to-reach locations",
      "Skipping the positive control — you then can't prove the BI was viable",
      "Delayed transfer to recovery media, risking a false negative",
    ],
    troubleshooting: [
      { problem: "Unexpected BI positive after a qualified cycle", action: "Verify the controls and aseptic recovery first, review the cycle's physical data, and treat it as an excursion to be investigated before release." },
      { problem: "Positive control shows no growth", action: "The run is invalid — check incubation temperature, recovery-media GPT, and BI viability/expiry, then repeat with a verified BI lot." },
      { problem: "Inconsistent BI results across the load", action: "Re-examine the load configuration and heat-penetration mapping, and confirm the BIs actually reached the worst-case points." },
    ],
    relatedLessonSlugs: ["steam-sterilization-validation", "dry-heat-depyrogenation", "media-fill-aps", "sterilizing-grade-filtration"],
    relatedToolkitSlugs: ["bi-workflow-checklist", "gmp-audit-kit"],
    accessTier: "free",
    deepDive:
      "A biological indicator is a deliberately worst-case challenge: a known population of highly resistant spores with a certified D-value (the time to reduce the population by 90% under defined conditions). BIs complement — they don't replace — the physical cycle data; a release decision rests on both lethality calculations (e.g. F0 for moist heat) and the biological challenge. The positive control is non-negotiable: without proof the spores were viable and would grow in your recovery media, a 'no growth' result tells you nothing. Worst-case placement is the other half of the story — a BI that never reached the cold spot can't qualify the cycle.",
  },
];

// ── Lookups ───────────────────────────────────────────────────────────────────
export function getWorkflowCategory(slug: string): WorkflowCategory | undefined {
  return workflowCategories.find((c) => c.slug === slug);
}

export function getWorkflow(slug: string): Workflow | undefined {
  return workflows.find((w) => w.slug === slug);
}

export function getWorkflowsInCategory(categorySlug: string): Workflow[] {
  return workflows.filter((w) => w.categorySlug === categorySlug);
}

/** Every workflow detail slug — used for the sitemap and route prefetch. */
export const workflowSlugs = workflows.map((w) => w.slug);
