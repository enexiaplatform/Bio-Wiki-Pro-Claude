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
    workflowSlugs: ["aseptic-gowning-qualification", "aseptic-process-simulation", "sterile-filtration"],
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
    workflowSlugs: ["oos-investigation", "deviation-capa", "data-integrity-review"],
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

  {
    slug: "aseptic-gowning-qualification",
    categorySlug: "sterile-aseptic",
    title: "Aseptic Gowning Qualification",
    purpose: "Qualify and re-qualify operators to gown for grade A/B aseptic areas without contaminating the suit.",
    audience: "Aseptic operators, QC micro, and QA managing the gowning program.",
    useWhen: [
      "Onboarding a new operator for grade A/B access",
      "Periodic gowning re-qualification is due",
      "Gowning monitoring shows a recurring failure",
      "Revising the program after an Annex 1 gap assessment",
    ],
    inputs: [
      "Approved gowning SOP and qualification acceptance criteria",
      "Sterile gown components and a qualified changing-room flow",
      "Contact plates / swabs and qualified media for gown monitoring",
      "A trained assessor and limits set per area grade",
    ],
    steps: [
      { title: "Train before you qualify", detail: "Operators complete gowning theory and supervised practice before any qualification attempt." },
      { title: "Observe the gowning sequence", detail: "A qualified assessor watches the full aseptic gowning sequence against the SOP checklist and flags any technique breach." },
      { title: "Monitor the gowned operator", detail: "Take contact plates at defined locations — gloves, forearms, chest, and hood — immediately after gowning." },
      { title: "Incubate and read", detail: "Incubate the gown plates per the regime and compare counts to the area-grade limits." },
      { title: "Decide and document", detail: "A pass requires BOTH correct technique and within-limit counts across the required number of consecutive sessions." },
      { title: "Re-qualify and trend", detail: "Re-qualify on a defined interval and trend routine gowning monitoring; an excursion triggers retraining and investigation." },
    ],
    criticalControlPoints: [
      "Both technique observation AND gown-plate counts within limits",
      "The required number of consecutive successful qualifications is met",
      "Continuous gowning monitoring during routine production",
      "Re-qualification interval defined and actively tracked",
    ],
    commonMistakes: [
      "Qualifying on a single session instead of consecutive ones",
      "Monitoring only gloves and ignoring forearms and chest",
      "Letting re-qualification lapse silently",
      "No retraining after a gowning excursion",
    ],
    troubleshooting: [
      { problem: "Operator repeatedly fails glove monitoring", action: "Review glove-change technique and sanitization frequency; retrain and re-qualify before granting grade A/B access." },
      { problem: "Counts pass but technique breaches were observed", action: "A technique breach is a fail on its own — retrain the specific step and re-observe; counts alone don't qualify." },
      { problem: "Facility-wide rise in gowning excursions", action: "Check changing-room airflow, gown sterilization and supply, and disinfectant rotation — not just individual operators." },
    ],
    relatedLessonSlugs: ["gowning-qualification", "aseptic-technique", "contamination-control-strategy", "disinfectant-qualification"],
    relatedToolkitSlugs: ["gmp-audit-kit"],
    accessTier: "free",
    deepDive:
      "The gowned operator is the single largest contamination risk to the sterile field, so gowning qualification is really a test of the primary barrier. Annex 1 (2022) expects a documented program with initial qualification over several consecutive sessions, periodic re-qualification, and continuous monitoring during production rather than a one-off certificate. Both halves matter: a within-limit plate count after a sloppy technique tells you the plate location got lucky, not that the operator is qualified — which is why the assessor's observation is weighted equally with the microbial result.",
  },
  {
    slug: "aseptic-process-simulation",
    categorySlug: "sterile-aseptic",
    title: "Aseptic Process Simulation (Media Fill)",
    purpose: "Run a media fill that demonstrates your aseptic process can reliably produce sterile product.",
    audience: "Aseptic manufacturing, QC micro, and QA validating the filling line.",
    useWhen: [
      "Initial qualification of a new aseptic line or operator",
      "Periodic (typically semi-annual) APS re-qualification",
      "After a significant change to line, process, or personnel",
      "Investigating a sterility-assurance failure",
    ],
    inputs: [
      "An approved APS protocol that simulates the worst-case process",
      "A sterile, growth-promotion-qualified medium in place of product",
      "Defined interventions, run duration, and unit count",
      "An incubation and inspection plan with acceptance criteria",
    ],
    steps: [
      { title: "Design to worst case", detail: "Simulate the longest and most complex routine process — maximum interventions, shift changes, line-speed extremes, and operator count." },
      { title: "Fill with growth medium", detail: "Substitute a sterile, GPT-qualified medium for product and process the units exactly as in routine production." },
      { title: "Perform planned interventions", detail: "Execute and record every inherent and corrective intervention the process actually allows — don't omit the awkward ones." },
      { title: "Incubate all integral units", detail: "Incubate per the protocol (commonly a dual-temperature scheme) and inspect every integral unit for turbidity." },
      { title: "Read against zero-tolerance criteria", detail: "Apply current acceptance criteria; any contaminated unit triggers a full investigation." },
      { title: "Investigate and link to EM", detail: "Reconcile the result with the environmental and personnel monitoring from the run, and CAPA any positive." },
    ],
    criticalControlPoints: [
      "The simulation reflects the true worst-case process and interventions",
      "Every integral filled unit is incubated and inspected",
      "Acceptance criteria applied per current regulatory expectation",
      "Each operator participates per the qualification matrix",
    ],
    commonMistakes: [
      "Simulating an easy process instead of the worst case",
      "Omitting routine interventions to 'protect' the result",
      "Discarding units without documented justification",
      "Not reconciling the APS with the run's EM data",
    ],
    troubleshooting: [
      { problem: "A media-fill unit shows growth", action: "Quarantine, identify the organism, and run a full investigation linking interventions, personnel, and EM before any release decision." },
      { problem: "Medium fails growth promotion after incubation", action: "The run is invalid — the medium must support growth; repeat the APS with a GPT-passed medium lot." },
      { problem: "An operator isn't covered by a recent APS", action: "Restrict that operator from aseptic filling until they're included in a successful media fill." },
    ],
    relatedLessonSlugs: ["media-fill-aps", "aseptic-technique", "gowning-qualification", "environmental-monitoring-basics"],
    relatedToolkitSlugs: ["gmp-audit-kit"],
    accessTier: "free",
    deepDive:
      "An aseptic process simulation is the closest thing to a direct test of the process itself: by replacing product with a microbiological growth medium, any contamination introduced during filling shows up as visible growth. Its evidential value depends entirely on honesty of design — the simulation must stress the process at least as hard as the worst routine batch, including the interventions teams are tempted to leave out. Modern expectations treat APS results together with the run's environmental and personnel monitoring, so a single positive is investigated as a process signal, not written off as a stray contaminant.",
  },
  {
    slug: "sterile-filtration",
    categorySlug: "sterile-aseptic",
    title: "Sterile Filtration",
    purpose: "Select, validate, and verify a sterilizing-grade filter that delivers a sterile product stream.",
    audience: "Process and QC engineers responsible for the sterile filtration step.",
    useWhen: [
      "Designing a sterile filtration step for a new product",
      "Validating bacterial retention for a filter/product pair",
      "Routine pre- and post-use integrity testing",
      "Investigating a failed post-use integrity test",
    ],
    inputs: [
      "A filter rated 0.22 µm (or a validated equivalent) for the product",
      "Product-specific bacterial-retention validation (B. diminuta)",
      "An integrity-test method and limits (bubble point / diffusion)",
      "Defined filtration parameters (pressure, time, temperature, volume)",
    ],
    steps: [
      { title: "Select the right filter", detail: "Match membrane chemistry and rating to the product, and confirm compatibility, extractables, and adsorption are acceptable." },
      { title: "Validate bacterial retention", detail: "Demonstrate full retention of B. diminuta under worst-case process conditions for the specific filter/product pair." },
      { title: "Test integrity before use", detail: "Perform a pre-use post-sterilization integrity test (PUPSIT where required) against validated limits." },
      { title: "Filter under validated parameters", detail: "Run within the validated pressure, time, and volume limits so you stay inside the retention claim." },
      { title: "Test integrity after use", detail: "Perform a post-use integrity test — a pass is required to support the sterility of the filtrate." },
      { title: "Investigate any failure", detail: "A failed post-use test puts the batch's sterility in question and triggers an investigation, not a release." },
    ],
    criticalControlPoints: [
      "Bacterial retention validated for the specific filter/product/process",
      "Post-use integrity test passes before release",
      "Filtration stays within validated parameters",
      "Integrity-test limits correlated to the retention validation",
    ],
    commonMistakes: [
      "Relying on the 0.22 µm rating without product-specific retention data",
      "Skipping or mis-correlating the integrity-test limits",
      "Exceeding validated pressure or batch volume",
      "Treating a marginal integrity result as a pass",
    ],
    troubleshooting: [
      { problem: "Post-use integrity test fails", action: "Do not release on filtrate sterility alone — investigate the filter, wetting, and test setup and assess batch impact per your procedure." },
      { problem: "Bubble point lower than expected", action: "Confirm the correct wetting fluid, temperature, and full membrane wetting before concluding a filter defect, then re-test." },
      { problem: "Product fouls the filter early", action: "Re-examine pre-filtration, filter sizing, and area; validate any change to the filtration train." },
    ],
    relatedLessonSlugs: ["sterilizing-grade-filtration", "container-closure-integrity", "visual-inspection", "steam-sterilization-validation"],
    relatedToolkitSlugs: ["gmp-audit-kit"],
    accessTier: "free",
    deepDive:
      "A sterilizing-grade filter is defined by performance, not pore size: the 0.22 µm rating is a label, while the real claim is full retention of B. diminuta under your worst-case conditions, which is why product-specific retention validation is non-negotiable. The integrity test is the routine surrogate for that validation — its limits are only meaningful because they were correlated to bacterial retention during validation. The post-use test matters most: it confirms the filter that actually processed the batch was still integral, so a failure there reopens the sterility question for the whole batch.",
  },

  {
    slug: "oos-investigation",
    categorySlug: "investigations-data-integrity",
    title: "OOS Investigation",
    purpose: "Run a phased out-of-specification investigation that holds up to inspection.",
    audience: "QC analysts and QA leading laboratory investigations.",
    useWhen: [
      "A released-method result falls outside specification",
      "You must decide whether a result is lab error or a true OOS",
      "Preparing investigation SOPs ahead of an inspection",
      "A retest or resample decision needs to be justified",
    ],
    inputs: [
      "An approved OOS SOP with defined phases and timelines",
      "Original data, instrument logs, and the analyst's records",
      "Method, system-suitability, and reference-standard records",
      "QA oversight and a defined decision authority",
    ],
    steps: [
      { title: "Phase I — laboratory assessment", detail: "Before discarding anything, assess for assignable lab error: calculations, standards, system suitability, instrument, and analyst technique. Retain the original solution where possible." },
      { title: "Decide on hypothesis testing", detail: "Retest or re-prepare only under a documented, QA-approved hypothesis — never test into compliance." },
      { title: "Conclude Phase I", detail: "If a clear, documented lab error is found, invalidate the result with justification; otherwise escalate." },
      { title: "Phase II — full-scale investigation", detail: "Extend to the process: batch record, raw materials, equipment, and trends, involving manufacturing and QA." },
      { title: "Reach a disposition", detail: "QA decides batch disposition on the totality of evidence and documents the rationale." },
      { title: "CAPA and trend", detail: "Drive CAPA for the root cause and trend OOS by method, product, and analyst." },
    ],
    criticalControlPoints: [
      "No result invalidated without a documented assignable cause",
      "Original data and solutions retained until the investigation closes",
      "Retesting only under a pre-approved hypothesis",
      "QA owns the final batch-disposition decision",
    ],
    commonMistakes: [
      "Discarding the original preparation before Phase I is complete",
      "Testing into compliance with unjustified retests",
      "Stopping at the lab when no lab error is found (skipping Phase II)",
      "Closing without a root cause or CAPA",
    ],
    troubleshooting: [
      { problem: "No assignable lab error found in Phase I", action: "Do not invalidate — escalate to a Phase II full-scale investigation covering the process and batch." },
      { problem: "Retest passes but the original failed", action: "A passing retest does not by itself invalidate the OOS; you still need a documented assignable cause and a QA disposition." },
      { problem: "Repeated OOS on one method", action: "Treat it as a trend — review method robustness, system-suitability history, and analyst training, not just the single batch." },
    ],
    relatedLessonSlugs: ["oos-investigation-deep-dive", "out-of-trend-investigation", "good-documentation-practice", "data-integrity-deep-dive"],
    relatedToolkitSlugs: ["oos-investigation-template", "gmp-audit-kit"],
    accessTier: "free",
    deepDive:
      "OOS investigations are shaped by the FDA OOS guidance and the Barr Laboratories ruling, whose central principle is that you cannot invalidate a failing result without an identified, assignable cause. That is why the original preparation is retained, why retesting requires a pre-approved scientific hypothesis (not a fishing expedition), and why a passing retest never on its own overrides the original. The two-phase structure forces the investigation outward — when the lab is clean, the question moves to the process — and QA, not the analyst, owns the disposition so the decision is independent of the people who generated the result.",
  },
  {
    slug: "deviation-capa",
    categorySlug: "investigations-data-integrity",
    title: "Deviation & CAPA",
    purpose: "Capture a deviation, find the true root cause, and close effective corrective and preventive actions.",
    audience: "QA and QC handling deviations and the CAPA system.",
    useWhen: [
      "A process, test, or procedure departs from the approved standard",
      "An investigation needs a structured root-cause analysis",
      "CAPA effectiveness checks are due",
      "Preparing CAPA records for an audit",
    ],
    inputs: [
      "A deviation/CAPA SOP with risk-based timelines",
      "A clear problem statement and immediate containment",
      "Root-cause tools (5-Whys, fishbone) and the relevant records",
      "Defined CAPA owners and effectiveness criteria",
    ],
    steps: [
      { title: "Record and contain", detail: "Document the deviation promptly with a factual problem statement, and take immediate containment to protect product and patients." },
      { title: "Assess risk and impact", detail: "Classify by risk (minor / major / critical) and assess impact on product, other batches, and the validated state." },
      { title: "Investigate root cause", detail: "Use a structured method to reach the true root cause, not the first plausible symptom." },
      { title: "Define corrective + preventive actions", detail: "Corrective fixes this occurrence; preventive stops recurrence elsewhere. 'Retrain the operator' alone is rarely enough." },
      { title: "Implement and verify", detail: "Execute the actions with owners and due dates, and capture objective evidence of completion." },
      { title: "Check effectiveness and close", detail: "Verify the CAPA actually worked against pre-defined criteria before closing, and trend repeat deviations." },
    ],
    criticalControlPoints: [
      "Risk-based classification drives timeline and depth",
      "Root cause established before defining CAPA",
      "Preventive action addresses systemic recurrence",
      "Effectiveness check completed before closure",
    ],
    commonMistakes: [
      "'Retraining' as the default corrective action with no systemic fix",
      "Closing CAPA without an effectiveness check",
      "Confusing correction (the fix now) with corrective action (the cause)",
      "No trending of repeat deviations",
    ],
    troubleshooting: [
      { problem: "The same deviation keeps recurring", action: "The original CAPA missed the root cause or the effectiveness check was weak — reopen, re-investigate the system, and strengthen the preventive action." },
      { problem: "Root cause comes out as 'human error'", action: "Human error is rarely the true root cause — probe the system (procedure clarity, design, workload) that allowed the error." },
      { problem: "CAPA backlog is growing", action: "Triage by risk, escalate overdue critical CAPAs, and review whether timelines and resourcing are realistic in a management review." },
    ],
    relatedLessonSlugs: ["deviation-management", "capa-fundamentals", "change-control", "quality-risk-management-q9"],
    relatedToolkitSlugs: ["gmp-audit-kit"],
    accessTier: "free",
    deepDive:
      "A CAPA system is only as good as its root-cause analysis and its effectiveness check — the two places teams most often cut corners. Correction (fixing the immediate problem), corrective action (eliminating the cause so it doesn't happen again here), and preventive action (stopping it happening elsewhere) are distinct, and conflating them is why deviations recur. ICH Q10 frames CAPA as a core element of the quality system, and risk (Q9) should scale the rigour — a critical deviation warrants a deeper investigation and a formal effectiveness verification than a minor one.",
  },
  {
    slug: "data-integrity-review",
    categorySlug: "investigations-data-integrity",
    title: "Data Integrity Review",
    purpose: "Assess records against ALCOA+ and close the gaps before an inspector finds them.",
    audience: "QC/QA assessing data integrity across paper and electronic systems.",
    useWhen: [
      "Performing a data-integrity self-assessment",
      "Qualifying a new electronic system or GMP spreadsheet",
      "Investigating a suspected data-integrity issue",
      "Preparing for a data-focused inspection",
    ],
    inputs: [
      "The ALCOA+ principles as your assessment frame",
      "A system inventory (paper, hybrid, electronic) and the data flows",
      "Audit-trail and access-control configuration",
      "Defined review-by-exception and second-person review steps",
    ],
    steps: [
      { title: "Map the data lifecycle", detail: "For each system, map how data is generated, processed, reviewed, reported, retained, and disposed." },
      { title: "Check ALCOA+ for each record", detail: "Attributable, Legible, Contemporaneous, Original, Accurate — plus Complete, Consistent, Enduring, and Available." },
      { title: "Verify audit trails and access", detail: "Confirm audit trails are on, reviewed, and not disable-able by users, and that access rights match role and segregation of duties." },
      { title: "Review by exception", detail: "Make audit-trail / exception review part of the data review — not just signing the result printout." },
      { title: "Find and rank gaps", detail: "Document gaps by risk (e.g. shared logins, missing audit trail, uncontrolled spreadsheets) and prioritize them." },
      { title: "Remediate and monitor", detail: "Drive CAPA on the highest-risk gaps and add periodic data-integrity monitoring." },
    ],
    criticalControlPoints: [
      "Audit trails enabled, reviewed, and protected from user edits",
      "Unique logins and role-based access — no shared accounts",
      "Original data retained and reviewable, not just the printout",
      "Exception / audit-trail review built into routine data review",
    ],
    commonMistakes: [
      "Reviewing only the result and never the audit trail",
      "Shared logins or admin rights for routine users",
      "Uncontrolled spreadsheets performing GMP calculations",
      "Treating data integrity as IT-only, not a quality responsibility",
    ],
    troubleshooting: [
      { problem: "A system has no usable audit trail", action: "Treat it as high risk: add compensating controls (second-person contemporaneous review) and prioritize the system upgrade or replacement." },
      { problem: "A shared analyst login is discovered", action: "Attributability is broken — move to unique accounts immediately and assess the integrity of past records made under the shared login." },
      { problem: "A spreadsheet used for GMP decisions is uncontrolled", action: "Lock formulas, validate the spreadsheet, and control versions and access — or move the calculation into a validated system." },
    ],
    relatedLessonSlugs: ["data-integrity-deep-dive", "good-documentation-practice", "electronic-records-part-11", "measurement-systems-analysis"],
    relatedToolkitSlugs: ["data-integrity-self-check", "gmp-audit-kit"],
    accessTier: "free",
    deepDive:
      "ALCOA+ is the shared language regulators use for data integrity, and most findings trace back to a handful of recurring gaps: audit trails that exist but are never reviewed, shared logins that destroy attributability, and uncontrolled spreadsheets making GMP decisions. The decisive shift is review-by-exception — reviewing the audit trail and exceptions alongside the result, rather than rubber-stamping a clean printout. Data integrity is a quality responsibility, not an IT project: the controls are technical, but the accountability for trustworthy records sits with QA.",
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
