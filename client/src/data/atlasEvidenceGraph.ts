export type EvidenceDomainId =
  | "compiler-core"
  | "nonsterile-microbiology"
  | "water-em"
  | "sterile-biologics"
  | "analytical-chemistry"
  | "stability-sample-management";

export type BlueprintDecisionId =
  | "scope-applicability"
  | "method-architecture"
  | "workload-capacity"
  | "equipment-utilities"
  | "control-investigation"
  | "lifecycle-governance";

export type EvidenceResourceKind = "guide" | "lesson" | "workflow" | "tool";

export interface EvidenceResource {
  kind: EvidenceResourceKind;
  title: string;
  href: string;
  purpose: string;
  decisions: BlueprintDecisionId[];
}

export interface EvidenceDomain {
  id: EvidenceDomainId;
  eyebrow: string;
  title: string;
  maturity: "executable-concept" | "evidence-development" | "specialist-gated";
  boundary: string;
  guideHref: string;
  resources: EvidenceResource[];
}

export const blueprintDecisions: Array<{ id: BlueprintDecisionId; title: string; question: string }> = [
  { id: "scope-applicability", title: "Scope & applicability", question: "Which requirements and capabilities apply to this product, market and site?" },
  { id: "method-architecture", title: "Method architecture", question: "Which method steps, controls, acceptance criteria and verification boundaries drive the work?" },
  { id: "workload-capacity", title: "Workload & capacity", question: "How do samples and events become analyst, instrument, incubation and turnaround demand?" },
  { id: "equipment-utilities", title: "Equipment & utilities", question: "What vendor-neutral resources, resilience and qualification basis must exist?" },
  { id: "control-investigation", title: "Control & investigation", question: "What detects loss of control and what evidence is needed to investigate it?" },
  { id: "lifecycle-governance", title: "Lifecycle & governance", question: "How will the capability remain qualified, reviewed, changed and approved over time?" },
];

const resource = (
  kind: EvidenceResourceKind,
  title: string,
  href: string,
  purpose: string,
  decisions: BlueprintDecisionId[],
): EvidenceResource => ({ kind, title, href, purpose, decisions });

export const atlasEvidenceDomains: EvidenceDomain[] = [
  {
    id: "compiler-core",
    eyebrow: "Shared compiler logic",
    title: "Cross-domain capability architecture",
    maturity: "executable-concept",
    boundary: "A reusable decision structure, not a substitute for domain applicability review or site-approved specifications.",
    guideHref: "/blog/product-portfolio-to-qc-capability-map",
    resources: [
      resource("guide", "Product portfolio to QC capability map", "/blog/product-portfolio-to-qc-capability-map", "Build the requirements-to-resource decision chain before selecting equipment.", ["scope-applicability", "method-architecture", "workload-capacity", "equipment-utilities"]),
      resource("lesson", "Equipment Qualification (IQ/OQ/PQ)", "/library/equipment-qualification", "Distinguish installation, operational and performance evidence across the equipment lifecycle.", ["equipment-utilities", "lifecycle-governance"]),
      resource("workflow", "Equipment Qualification Lifecycle", "/workflows/equipment-qualification-lifecycle", "Turn the qualification lifecycle into an operational sequence and review structure.", ["equipment-utilities", "lifecycle-governance"]),
      resource("tool", "Equipment Qualification Readiness Planner", "/tools/equipment-qualification-readiness-planner", "Expose missing qualification evidence before equipment is treated as ready.", ["equipment-utilities", "lifecycle-governance"]),
      resource("guide", "Validate a Domain Pack without turning one project into a benchmark", "/blog/how-to-validate-a-quality-lab-domain-pack", "Govern estimate-to-actual observations, learning candidates, cross-case review and controlled rule changes.", ["control-investigation", "lifecycle-governance"]),
      resource("guide", "From method BOM to resilient QC consumable supply", "/blog/from-method-bom-to-resilient-qc-consumable-supply", "Convert method demand into gross use, reorder points, safety stock, expiry-aware storage and supplier continuity decisions.", ["method-architecture", "workload-capacity", "lifecycle-governance"]),
      resource("guide", "From QC capability map to space, zoning and flow basis", "/blog/from-qc-capability-map-to-space-zoning-and-flow-basis", "Translate activities into functional zones, adjacencies, segregation, four flow paths, usable envelopes and an engineering-ready evidence package.", ["method-architecture", "equipment-utilities", "lifecycle-governance"]),
      resource("guide", "From concept cost band to a controlled QC laboratory cost basis", "/blog/from-concept-cost-band-to-controlled-qc-lab-cost-basis", "Separate purchase price, installed cost, implementation, recurring OPEX, lifecycle cost, escalation, contingency and estimate maturity.", ["scope-applicability", "equipment-utilities", "lifecycle-governance"]),
      resource("guide", "From workload to usable QC equipment capacity", "/blog/from-workload-to-usable-qc-equipment-capacity", "Convert method load into qualified usable capacity with peaks, downtime, queue risk, redundancy and procurement triggers.", ["workload-capacity", "equipment-utilities", "lifecycle-governance"]),
      resource("guide", "From hands-on hours to resilient QC staffing", "/blog/from-hands-on-hours-to-resilient-qc-staffing", "Convert method workload into analyst, reviewer and specialist capacity with productive hours, skills, shifts, peaks and resilience.", ["method-architecture", "workload-capacity", "control-investigation", "lifecycle-governance"]),
      resource("guide", "From monthly workload to QC turnaround and queue feasibility", "/blog/from-monthly-workload-to-qc-turnaround-and-queue-feasibility", "Separate touch, hold, queue, handoff, calendar and review time; define when a static map, schedule or queue simulation is required.", ["scope-applicability", "workload-capacity", "control-investigation", "lifecycle-governance"]),
    ],
  },
  {
    id: "nonsterile-microbiology",
    eyebrow: "First executable Domain Pack",
    title: "Non-sterile pharmaceutical microbiology",
    maturity: "executable-concept",
    boundary: "Current graph nodes and workload factors are concept benchmarks; registered specifications, approved methods and site time studies remain authoritative.",
    guideHref: "/blog/how-to-scope-nonsterile-microbiology-qc-lab",
    resources: [
      resource("guide", "Scope a non-sterile microbiology QC lab", "/blog/how-to-scope-nonsterile-microbiology-qc-lab", "Connect product profiles, markets and execution choices to methods, BOM and capacity.", ["scope-applicability", "method-architecture", "workload-capacity"]),
      resource("guide", "Growth promotion and media QC application pack", "/blog/growth-promotion-media-qc-application-pack", "Connect media lots and preparations to required properties, challenge cultures, release decisions, failures and resource demand.", ["method-architecture", "workload-capacity", "control-investigation", "lifecycle-governance"]),
      resource("guide", "Bioburden and membrane filtration application pack", "/blog/bioburden-membrane-filtration-application-pack", "Connect sample purpose and matrix preparation to recovery suitability, enumeration architecture, decisions and capacity.", ["scope-applicability", "method-architecture", "workload-capacity", "control-investigation", "lifecycle-governance"]),
      resource("guide", "Specified microorganisms and objectionability application pack", "/blog/specified-microorganisms-objectionability-application-pack", "Connect product applicability and organism requirements to recovery, enrichment, confirmation, absence, objectionability and capacity.", ["scope-applicability", "method-architecture", "workload-capacity", "control-investigation", "lifecycle-governance"]),
      resource("guide", "Pharmaceutical microbial identification application pack", "/blog/pharmaceutical-microbial-identification-application-pack", "Connect isolate sources and decision risk to required resolution, platform confidence, confirmation, investigations and capacity.", ["method-architecture", "workload-capacity", "control-investigation", "lifecycle-governance"]),
      resource("lesson", "Growth Promotion Testing", "/library/growth-promotion-testing", "Understand media suitability, organism controls and the evidence behind media release.", ["method-architecture", "control-investigation"]),
      resource("workflow", "Culture Media Selection", "/workflows/culture-media-selection", "Operationalize media choice, preparation, GPT and lot release controls.", ["method-architecture", "workload-capacity", "control-investigation"]),
      resource("tool", "Microbial Count Calculator", "/tools/microbial-count-calculator", "Check dilution and count calculations while preserving method and suitability boundaries.", ["method-architecture", "control-investigation"]),
      resource("guide", "Method suitability to microbiology lab capacity", "/blog/method-suitability-to-microbiology-lab-capacity", "Connect product recovery evidence to preparation steps, BOM, qualification demand and operating capacity.", ["method-architecture", "workload-capacity", "control-investigation", "lifecycle-governance"]),
      resource("lesson", "Bioburden & Microbial Limits", "/library/bioburden-usp-61", "Review enumeration, specified-organism testing and product-specific method suitability foundations.", ["scope-applicability", "method-architecture", "control-investigation"]),
      resource("lesson", "Bacterial Endotoxins — BET/LAL Testing", "/library/endotoxin-lal-testing", "Connect endotoxin limits, MVD, interference controls and platform suitability.", ["scope-applicability", "method-architecture", "control-investigation"]),
      resource("guide", "Bacterial endotoxins BET/LAL application pack", "/blog/bacterial-endotoxins-bet-lal-application-pack", "Connect article and limit basis to MVD, interference, platform, run validity, lifecycle and specialist resource demand.", ["scope-applicability", "method-architecture", "workload-capacity", "control-investigation", "lifecycle-governance"]),
      resource("tool", "Endotoxin Limit Calculator", "/tools/endotoxin-limit-calculator", "Calculate an endotoxin limit and MVD as a review aid, not a product specification.", ["method-architecture", "control-investigation"]),
    ],
  },
  {
    id: "water-em",
    eyebrow: "Evidence-development Domain Pack",
    title: "Water & environmental monitoring",
    maturity: "evidence-development",
    boundary: "Point counts alone do not establish demand; grades, zones, frequencies, shifts, methods, incubation, trends and excursion burden require site evidence.",
    guideHref: "/blog/water-environmental-monitoring-capability-planning",
    resources: [
      resource("guide", "Water and EM capability planning", "/blog/water-environmental-monitoring-capability-planning", "Translate monitoring design into sampling, incubation, trending and resilience demand.", ["scope-applicability", "workload-capacity", "control-investigation"]),
      resource("guide", "Pharmaceutical water microbiology application pack", "/blog/pharmaceutical-water-microbiology-application-pack", "Connect monitoring purpose, true point-of-use sampling, hold time, recovery architecture, controls, trending and resource demand.", ["scope-applicability", "method-architecture", "workload-capacity", "control-investigation", "lifecycle-governance"]),
      resource("guide", "Pharmaceutical environmental monitoring application pack", "/blog/pharmaceutical-environmental-monitoring-application-pack", "Connect contamination risks and operating states to locations, viable methods, trends, excursions and resource demand.", ["scope-applicability", "method-architecture", "workload-capacity", "control-investigation", "lifecycle-governance"]),
      resource("lesson", "Environmental Monitoring Program Design", "/library/environmental-monitoring-basics", "Connect locations, methods, limits, trending and investigations into one control program.", ["scope-applicability", "control-investigation", "lifecycle-governance"]),
      resource("workflow", "Pharmaceutical Water System Monitoring", "/workflows/water-system-monitoring", "Structure sampling, testing, trending and response for a water system.", ["method-architecture", "workload-capacity", "control-investigation"]),
      resource("tool", "Lab Water Type Selector", "/tools/lab-water-type-selector", "Frame water-grade selection and the controls that follow from intended use.", ["scope-applicability", "method-architecture"]),
    ],
  },
  {
    id: "sterile-biologics",
    eyebrow: "Specialist-gated Domain Pack",
    title: "Sterile & biologics quality",
    maturity: "specialist-gated",
    boundary: "Sterility assurance and biologics methods require modality-specific evidence, contamination-control strategy and qualified specialist ownership.",
    guideHref: "/blog/sterile-biologics-qc-capability-planning",
    resources: [
      resource("guide", "Sterile and biologics QC capability planning", "/blog/sterile-biologics-qc-capability-planning", "Map sterility-assurance evidence, specialist methods, critical reagents and continuity decisions.", ["scope-applicability", "method-architecture", "equipment-utilities", "lifecycle-governance"]),
      resource("lesson", "Sterility Testing Foundations", "/library/sterility-testing-basics", "Understand what sterility testing can support and why it cannot prove batch sterility alone.", ["method-architecture", "control-investigation"]),
      resource("workflow", "Aseptic Process Simulation", "/workflows/aseptic-process-simulation", "Connect worst-case process simulation, interventions, incubation and disposition evidence.", ["control-investigation", "lifecycle-governance"]),
      resource("tool", "Sterility Test Method Selector", "/tools/sterility-test-method-selector", "Frame membrane-filtration versus direct-inoculation choices for specialist verification.", ["scope-applicability", "method-architecture"]),
    ],
  },
  {
    id: "analytical-chemistry",
    eyebrow: "SME-gated expansion",
    title: "Analytical chemistry",
    maturity: "specialist-gated",
    boundary: "Instrument counts cannot be inferred from test names alone; preparations, sequence design, runtime, system suitability, failures and review time control capacity.",
    guideHref: "/blog/analytical-chemistry-qc-capability-planning",
    resources: [
      resource("guide", "Analytical chemistry capability planning", "/blog/analytical-chemistry-qc-capability-planning", "Compile methods into sequences, instrument hours, analyst work, standards and lifecycle demand.", ["method-architecture", "workload-capacity", "equipment-utilities"]),
      resource("lesson", "Analytical Method Validation", "/library/analytical-method-validation", "Connect intended use to validation characteristics and reportable-result confidence.", ["method-architecture", "lifecycle-governance"]),
      resource("workflow", "HPLC System Suitability", "/workflows/hplc-system-suitability-workflow", "Operationalize suitability criteria, sequence readiness and failure response.", ["method-architecture", "control-investigation"]),
      resource("tool", "System Suitability Calculator", "/tools/system-suitability-calculator", "Calculate common suitability measures without replacing approved method criteria.", ["method-architecture", "control-investigation"]),
    ],
  },
  {
    id: "stability-sample-management",
    eyebrow: "Lifecycle Domain Pack",
    title: "Stability & sample management",
    maturity: "evidence-development",
    boundary: "Storage positions and pull counts depend on protocols, orientations, reserve policy, chamber mapping, excursions, method demand and retention rules.",
    guideHref: "/blog/stability-sample-management-capability-planning",
    resources: [
      resource("guide", "Stability and sample-management capability planning", "/blog/stability-sample-management-capability-planning", "Connect protocols, chamber geometry and pull calendars to future testing and continuity.", ["scope-applicability", "workload-capacity", "equipment-utilities", "lifecycle-governance"]),
      resource("lesson", "Ongoing Stability Program", "/library/ongoing-stability-program", "Understand lifecycle commitments, pull schedules, trends and governance after approval.", ["workload-capacity", "control-investigation", "lifecycle-governance"]),
      resource("workflow", "Stability Program", "/workflows/stability-program", "Structure protocol setup, storage, pulls, testing, trending and excursion response.", ["workload-capacity", "control-investigation", "lifecycle-governance"]),
      resource("tool", "Stability Trend & Shelf-life Planner", "/tools/stability-trend-shelf-life-planner", "Explore trend and shelf-life signals while keeping statistical and regulatory review explicit.", ["control-investigation", "lifecycle-governance"]),
    ],
  },
];

export function evidenceForDecision(decision: BlueprintDecisionId, domainId?: EvidenceDomainId) {
  return atlasEvidenceDomains
    .filter((domain) => !domainId || domain.id === domainId)
    .flatMap((domain) => domain.resources.map((item) => ({ ...item, domainId: domain.id, domainTitle: domain.title })))
    .filter((item) => item.decisions.includes(decision));
}

export function evidenceForRuleIds(ruleIds: string[]): EvidenceResource[] {
  return ruleGuidanceForIds(ruleIds).resources;
}

export interface RuleEvidenceMapping {
  ruleId: string;
  domainId: EvidenceDomainId;
  decisions: BlueprintDecisionId[];
  preferredResourceHref?: string;
}

export const ruleEvidenceMappings: RuleEvidenceMapping[] = [
  { ruleId: "core.turnaround.feasibility", domainId: "compiler-core", decisions: ["scope-applicability", "workload-capacity", "control-investigation", "lifecycle-governance"] },
  { ruleId: "core.capacity.people", domainId: "compiler-core", decisions: ["method-architecture", "workload-capacity", "control-investigation", "lifecycle-governance"] },
  { ruleId: "core.capacity.equipment", domainId: "compiler-core", decisions: ["workload-capacity", "equipment-utilities", "lifecycle-governance"] },
  { ruleId: "core.supply.consumables", domainId: "compiler-core", decisions: ["method-architecture", "workload-capacity", "lifecycle-governance"] },
  { ruleId: "core.cost.concept", domainId: "compiler-core", decisions: ["scope-applicability", "equipment-utilities", "lifecycle-governance"] },
  { ruleId: "core.space.concept", domainId: "compiler-core", decisions: ["method-architecture", "equipment-utilities", "lifecycle-governance"] },
  { ruleId: "micro.workflow.raw-materials", domainId: "nonsterile-microbiology", decisions: ["scope-applicability", "method-architecture", "workload-capacity"] },
  { ruleId: "micro.workflow.finished-products", domainId: "nonsterile-microbiology", decisions: ["scope-applicability", "method-architecture", "workload-capacity"] },
  { ruleId: "micro.workflow.bioburden", domainId: "nonsterile-microbiology", decisions: ["method-architecture", "workload-capacity", "control-investigation"], preferredResourceHref: "/blog/bioburden-membrane-filtration-application-pack" },
  { ruleId: "micro.workflow.growth-promotion", domainId: "nonsterile-microbiology", decisions: ["method-architecture", "workload-capacity", "control-investigation"], preferredResourceHref: "/blog/growth-promotion-media-qc-application-pack" },
  { ruleId: "micro.workflow.endotoxin", domainId: "nonsterile-microbiology", decisions: ["scope-applicability", "method-architecture", "control-investigation"], preferredResourceHref: "/blog/bacterial-endotoxins-bet-lal-application-pack" },
  { ruleId: "micro.workflow.water", domainId: "water-em", decisions: ["scope-applicability", "method-architecture", "workload-capacity", "control-investigation"] },
  { ruleId: "micro.workflow.environmental-monitoring", domainId: "water-em", decisions: ["scope-applicability", "workload-capacity", "control-investigation", "lifecycle-governance"], preferredResourceHref: "/blog/pharmaceutical-environmental-monitoring-application-pack" },
  { ruleId: "micro.workflow.sterility", domainId: "sterile-biologics", decisions: ["scope-applicability", "method-architecture", "equipment-utilities", "control-investigation"] },
  { ruleId: "usp-61-concept", domainId: "nonsterile-microbiology", decisions: ["method-architecture", "workload-capacity", "control-investigation"] },
  { ruleId: "usp-62-concept", domainId: "nonsterile-microbiology", decisions: ["method-architecture", "workload-capacity", "control-investigation"], preferredResourceHref: "/blog/specified-microorganisms-objectionability-application-pack" },
  { ruleId: "method-suitability", domainId: "nonsterile-microbiology", decisions: ["method-architecture", "control-investigation", "lifecycle-governance"], preferredResourceHref: "/blog/method-suitability-to-microbiology-lab-capacity" },
];

export function ruleGuidanceForIds(ruleIds: string[], limit = 4) {
  const uniqueRuleIds = Array.from(new Set(ruleIds));
  const matchedMappings = ruleEvidenceMappings.filter((mapping) => uniqueRuleIds.includes(mapping.ruleId));
  const fallbackUsed = matchedMappings.length === 0;
  const activeMappings: RuleEvidenceMapping[] = fallbackUsed
    ? [{ ruleId: "unmapped", domainId: "compiler-core" as const, decisions: ["scope-applicability" as const, "lifecycle-governance" as const] }]
    : matchedMappings;
  const domainIds = new Set(activeMappings.map((mapping) => mapping.domainId));
  const decisionIds = new Set(activeMappings.flatMap((mapping) => mapping.decisions));
  const preferredResourceHrefs = new Set(activeMappings.flatMap((mapping) => mapping.preferredResourceHref ? [mapping.preferredResourceHref] : []));
  const scored = atlasEvidenceDomains
    .filter((domain) => domainIds.has(domain.id))
    .flatMap((domain) => domain.resources.map((resource) => ({ resource, preferred: preferredResourceHrefs.has(resource.href), score: resource.decisions.filter((decision) => decisionIds.has(decision)).length })))
    .filter((item) => item.score > 0)
    .sort((a, b) => Number(b.preferred) - Number(a.preferred) || b.score - a.score || Number(b.resource.kind === "guide") - Number(a.resource.kind === "guide"));
  return {
    matchedRuleIds: matchedMappings.map((mapping) => mapping.ruleId),
    unmatchedRuleIds: uniqueRuleIds.filter((ruleId) => !matchedMappings.some((mapping) => mapping.ruleId === ruleId)),
    domainIds: Array.from(domainIds),
    decisionIds: Array.from(decisionIds),
    fallbackUsed,
    resources: Array.from(new Map(scored.map((item) => [item.resource.href, item.resource])).values()).slice(0, limit),
  };
}

export function evidenceContextForHref(href: string) {
  return atlasEvidenceDomains.flatMap((domain) => domain.resources
    .filter((resource) => resource.href === href)
    .map((resource) => ({
      domain,
      resource,
      decisions: blueprintDecisions.filter((decision) => resource.decisions.includes(decision.id)),
      nextResources: domain.resources.filter((candidate) => candidate.href !== href),
    })));
}
