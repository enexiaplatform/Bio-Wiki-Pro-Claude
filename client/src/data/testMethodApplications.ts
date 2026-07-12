export type ApplicationPackStage = "application-development" | "content-foundation" | "specialist-gated";
export type ApplicationDimensionStatus = "structured" | "partial" | "evidence-required";

export interface TestMethodApplicationPack {
  id: string;
  sequence: number;
  title: string;
  domain: string;
  stage: ApplicationPackStage;
  decision: string;
  boundary: string;
  guideHref: string;
  evidenceHrefs: string[];
  dimensions: Array<{ id: string; label: string; status: ApplicationDimensionStatus; currentBasis: string; exitEvidence: string }>;
  methodGraphStatus: "executable-concept" | "workflow-only" | "not-executable";
}

const commonExit = {
  intendedUse: "Approved use cases linked to product/process decisions, water grade or monitoring purpose and market/site requirements.",
  matrix: "Representative matrices, sampling conditions, hold-time evidence and known interference or recovery risks.",
  method: "Current approved method steps, volumes, dilutions, media/reagents, incubation/run conditions, controls and calculations.",
  decision: "Approved specification or alert/action framework, result interpretation, review and investigation pathway.",
  resources: "Observed hands-on time, BOM, equipment occupancy, skill, queue and exception demand from controlled cases.",
  lifecycle: "Transfer/verification/validation status, change controls, version ownership, performance monitoring and qualified alternates.",
} as const;

export const testMethodApplicationPacks: TestMethodApplicationPack[] = [
  {
    id: "water-microbiology", sequence: 1, title: "Pharmaceutical water microbiology", domain: "Water & environmental microbiology", stage: "application-development", methodGraphStatus: "workflow-only",
    decision: "Determine whether a water system remains in microbial control and whether sampled water is fit for its intended use under the site's approved program.",
    boundary: "Atlas structures monitoring and laboratory capability. It does not set universal microbial specifications, approve sampling representativeness or replace the site water-system control strategy.",
    guideHref: "/blog/pharmaceutical-water-microbiology-application-pack",
    evidenceHrefs: ["/blog/water-environmental-monitoring-capability-planning", "/library/pharmaceutical-water-systems", "/workflows/water-system-monitoring", "/tools/lab-water-type-selector"],
    dimensions: [
      { id: "intended-use", label: "Intended use & decision", status: "structured", currentBasis: "Process-control versus QC/fitness-for-use purpose is explicitly separated.", exitEvidence: commonExit.intendedUse },
      { id: "matrix", label: "Sampling & matrix", status: "partial", currentBasis: "Point/frequency demand exists; true point-of-use representativeness, flush, container and hold time remain site evidence.", exitEvidence: commonExit.matrix },
      { id: "method", label: "Method architecture", status: "partial", currentBasis: "Filtration/plating capability is modeled broadly; sample volume, medium, temperature and incubation are not frozen.", exitEvidence: commonExit.method },
      { id: "decision", label: "Result decision", status: "partial", currentBasis: "Trending and excursion logic exists; no universal limit is inferred.", exitEvidence: commonExit.decision },
      { id: "resources", label: "BOM & capacity", status: "partial", currentBasis: "Workflow hours, plate-days, media and filtration demand are class-level allowances.", exitEvidence: commonExit.resources },
      { id: "lifecycle", label: "Lifecycle evidence", status: "evidence-required", currentBasis: "No paid/site-calibrated application case has been approved as an Atlas benchmark.", exitEvidence: commonExit.lifecycle },
    ],
  },
  {
    id: "growth-promotion-media-qc", sequence: 2, title: "Growth promotion and media QC", domain: "Non-sterile microbiology", stage: "application-development", methodGraphStatus: "workflow-only",
    decision: "Establish whether each prepared or purchased media lot is suitable for its intended recovery/selectivity role before use.", boundary: "Organism panels, inoculum targets, acceptance rules and reduced-testing strategies remain method- and site-controlled.", guideHref: "/blog/growth-promotion-media-qc-application-pack", evidenceHrefs: ["/blog/growth-promotion-testing-what-good-looks-like", "/library/growth-promotion-testing", "/workflows/culture-media-selection"],
    dimensions: [
      { id: "intended-use", label: "Intended use & decision", status: "structured", currentBasis: "Prepared, purchased, method-specific, in-use hold, comparability and failure decisions are separated.", exitEvidence: commonExit.intendedUse },
      { id: "matrix", label: "Media/organism matrix", status: "partial", currentBasis: "The media × method × property × organism contract is defined; controlled site records remain required.", exitEvidence: commonExit.matrix },
      { id: "method", label: "Method architecture", status: "partial", currentBasis: "Receipt/preparation, challenge culture, growth, inhibition, indication and negative-control branches are structured but not executable nodes.", exitEvidence: commonExit.method },
      { id: "decision", label: "Result decision", status: "partial", currentBasis: "Release, restriction, failure and affected-use logic is explicit without inventing site acceptance criteria.", exitEvidence: commonExit.decision },
      { id: "resources", label: "BOM & capacity", status: "partial", currentBasis: "Lot/preparation cadence, organism-property units, incubation, release and failure demand are defined for case capture.", exitEvidence: commonExit.resources },
      { id: "lifecycle", label: "Lifecycle evidence", status: "evidence-required", currentBasis: "Supplier qualification, skip/reduced testing and failure history are not calibrated.", exitEvidence: commonExit.lifecycle },
    ],
  },
  {
    id: "bioburden-filtration", sequence: 3, title: "Bioburden and membrane filtration", domain: "Microbiology", stage: "application-development", methodGraphStatus: "workflow-only",
    decision: "Estimate recoverable microbial load for a defined material, process sample or product decision using a suitable recovery method.", boundary: "Matrices, recovery, filtration compatibility, sample quantity, limits and method suitability are not generalized across products.", guideHref: "/blog/bioburden-membrane-filtration-application-pack", evidenceHrefs: ["/blog/what-is-bioburden-testing", "/library/bioburden-usp-61", "/tools/microbial-count-calculator"],
    dimensions: [
      { id: "intended-use", label: "Intended use & decision", status: "structured", currentBasis: "Product, in-process, pre-sterilization, material, study and investigation decisions are separated.", exitEvidence: commonExit.intendedUse },
      { id: "matrix", label: "Sample/matrix", status: "partial", currentBasis: "The product × preparation × recovery contract is defined; representative site matrices and hold evidence remain required.", exitEvidence: commonExit.matrix },
      { id: "method", label: "Method architecture", status: "partial", currentBasis: "Preparation, filtration, direct-plating/MPN, controls and calculations are structured but not executable nodes.", exitEvidence: commonExit.method },
      { id: "decision", label: "Result decision", status: "partial", currentBasis: "Specification, trend, sterilization-input and investigation pathways are separated without inferring limits.", exitEvidence: commonExit.decision },
      { id: "resources", label: "BOM & capacity", status: "partial", currentBasis: "Matrix-specific filtration, dilution, membrane, plate-day, identification and exception demand are defined for case capture.", exitEvidence: commonExit.resources },
      { id: "lifecycle", label: "Lifecycle evidence", status: "evidence-required", currentBasis: "No calibrated suitability or recovery case set.", exitEvidence: commonExit.lifecycle },
    ],
  },
  {
    id: "specified-microorganisms", sequence: 4, title: "Specified microorganisms and objectionability", domain: "Non-sterile microbiology", stage: "application-development", methodGraphStatus: "executable-concept",
    decision: "Determine whether a defined organism or organism group is detected under an approved recovery and confirmation sequence, then assess broader product-specific objectionability.", boundary: "Atlas does not assign organism requirements, approve absence claims, validate neutralization or determine that an unlisted recovery is non-objectionable.", guideHref: "/blog/specified-microorganisms-objectionability-application-pack", evidenceHrefs: ["/library/bioburden-usp-61", "/library/objectionable-organisms", "/blog/objectionable-organisms-its-not-just-the-count"],
    dimensions: [
      { id: "intended-use", label: "Intended use & decision", status: "structured", currentBasis: "Compendial/registered absence, product objectionability and contamination-control decisions are separated.", exitEvidence: commonExit.intendedUse },
      { id: "matrix", label: "Product/organism matrix", status: "partial", currentBasis: "The product × organism × decision contract is defined; controlled market and product applicability remain required.", exitEvidence: commonExit.matrix },
      { id: "method", label: "Method architecture", status: "partial", currentBasis: "Preparation, resuscitation, enrichment, selection, confirmation and controls are structured around the existing USP <62> concept node.", exitEvidence: commonExit.method },
      { id: "decision", label: "Result decision", status: "partial", currentBasis: "Presumptive, confirmed, invalid, absence and broader objectionability pathways are explicit without inferring specifications.", exitEvidence: commonExit.decision },
      { id: "resources", label: "BOM & capacity", status: "partial", currentBasis: "Organism-specific enrichment trees, vessel-days, transfers, confirmation and exception demand are defined for case capture.", exitEvidence: commonExit.resources },
      { id: "lifecycle", label: "Lifecycle evidence", status: "evidence-required", currentBasis: "No controlled site case has calibrated suitability, positive/invalid rates or organism-pathway resource demand.", exitEvidence: commonExit.lifecycle },
    ],
  },
  {
    id: "bet-lal", sequence: 5, title: "Bacterial endotoxins (BET/LAL)", domain: "Microbiology / sterile & biologics", stage: "specialist-gated", methodGraphStatus: "workflow-only",
    decision: "Determine whether endotoxin is within the approved product/material limit using a suitable method and valid interference controls.", boundary: "Atlas does not infer K/M limits, MVD, dilution, inhibition/enhancement, platform or release acceptance.", guideHref: "/blog/bacterial-endotoxins-bet-lal-application-pack", evidenceHrefs: ["/blog/bacterial-endotoxin-test-what-lal-actually-measures", "/library/endotoxin-lal-testing", "/tools/endotoxin-limit-calculator"],
    dimensions: [
      { id: "intended-use", label: "Intended use & decision", status: "structured", currentBasis: "Release, in-process, water, material/device, change and investigation applications are separated.", exitEvidence: commonExit.intendedUse },
      { id: "matrix", label: "Sample/matrix", status: "partial", currentBasis: "The article × limit × method contract is defined; product-specific interference and approved inputs remain required.", exitEvidence: commonExit.matrix },
      { id: "method", label: "Method architecture", status: "partial", currentBasis: "Gel-clot, photometric and recombinant branches, controls and interfering-factors logic are structured but not executable nodes.", exitEvidence: commonExit.method },
      { id: "decision", label: "Result decision", status: "partial", currentBasis: "Run validity, invalidity, adverse-result and product/process pathways are explicit without inferring acceptance.", exitEvidence: commonExit.decision },
      { id: "resources", label: "BOM & capacity", status: "partial", currentBasis: "Dilution, controls, wells/tubes, reader, review, invalidity and reagent-continuity demand are defined for specialist case capture.", exitEvidence: commonExit.resources },
      { id: "lifecycle", label: "Lifecycle evidence", status: "evidence-required", currentBasis: "Specialist owner and validation cases are required.", exitEvidence: commonExit.lifecycle },
    ],
  },
  {
    id: "environmental-monitoring", sequence: 6, title: "Environmental monitoring methods", domain: "Water & environmental microbiology", stage: "application-development", methodGraphStatus: "workflow-only",
    decision: "Detect and trend viable contamination signals across defined locations, activities and personnel to support contamination-control decisions.", boundary: "Grades, locations, methods, volumes, frequencies, limits, incubation and excursion actions require the approved site program.", guideHref: "/blog/pharmaceutical-environmental-monitoring-application-pack", evidenceHrefs: ["/blog/water-environmental-monitoring-capability-planning", "/library/environmental-monitoring-basics", "/workflows/environmental-monitoring"],
    dimensions: [
      { id: "intended-use", label: "Intended use & decision", status: "structured", currentBasis: "Program decisions and excursion burden are described.", exitEvidence: commonExit.intendedUse },
      { id: "matrix", label: "Location/activity matrix", status: "partial", currentBasis: "The location × activity × method × decision contract is defined; approved site points and risk rationales remain required.", exitEvidence: commonExit.matrix },
      { id: "method", label: "Method architecture", status: "partial", currentBasis: "Active air, passive air, contact plate, swab and personnel branches are structured but not executable nodes.", exitEvidence: commonExit.method },
      { id: "decision", label: "Result decision", status: "partial", currentBasis: "Alert, action, trend, identification and excursion pathways are separated without inferring site limits.", exitEvidence: commonExit.decision },
      { id: "resources", label: "BOM & capacity", status: "partial", currentBasis: "Route, sampler, media, plate-day, reading, identification and excursion demand are defined for controlled case capture.", exitEvidence: commonExit.resources },
      { id: "lifecycle", label: "Lifecycle evidence", status: "evidence-required", currentBasis: "Recovery, incubation and trend performance are not calibrated.", exitEvidence: commonExit.lifecycle },
    ],
  },
  {
    id: "microbial-identification", sequence: 7, title: "Microbial identification", domain: "Microbiology", stage: "application-development", methodGraphStatus: "not-executable",
    decision: "Identify an isolate to the level required for product, process, contamination-control or investigation decisions.", boundary: "Required identification level, library coverage, confirmation, data interpretation and disposition are risk- and platform-specific.", guideHref: "/blog/pharmaceutical-microbial-identification-application-pack", evidenceHrefs: ["/blog/microbial-identification-knowing-your-bug", "/library/microbial-identification"],
    dimensions: [
      { id: "intended-use", label: "Intended use & decision", status: "structured", currentBasis: "Routine flora, excursion, water, product, sterility-positive and recurrence decisions are separated by required resolution.", exitEvidence: commonExit.intendedUse },
      { id: "matrix", label: "Isolate/application matrix", status: "partial", currentBasis: "The source × decision × required-resolution contract is defined; approved site applications remain required.", exitEvidence: commonExit.matrix },
      { id: "method", label: "Method architecture", status: "partial", currentBasis: "Purity, phenotypic, MALDI-TOF, sequencing and strain-typing branches are structured but not executable nodes.", exitEvidence: commonExit.method },
      { id: "decision", label: "Result decision", status: "partial", currentBasis: "Confidence, ambiguity, discordance, confirmation and investigation linkage are explicit without platform-specific thresholds.", exitEvidence: commonExit.decision },
      { id: "resources", label: "BOM & capacity", status: "partial", currentBasis: "Morphotype, subculture, platform, repeat, review, archive and outsource demand are defined for controlled case capture.", exitEvidence: commonExit.resources },
      { id: "lifecycle", label: "Lifecycle evidence", status: "evidence-required", currentBasis: "Library, database, platform and change-control evidence require specialist ownership.", exitEvidence: commonExit.lifecycle },
    ],
  },
];

export function assessApplicationPack(pack: TestMethodApplicationPack) {
  const structured = pack.dimensions.filter((dimension) => dimension.status === "structured");
  const partial = pack.dimensions.filter((dimension) => dimension.status === "partial");
  const blockers = pack.dimensions.filter((dimension) => dimension.status === "evidence-required");
  const unresolved = pack.dimensions.filter((dimension) => dimension.status !== "structured");
  return {
    structured,
    partial,
    blockers,
    unresolved,
    readyForExecutableMethodGraph: unresolved.length === 0 && pack.methodGraphStatus !== "not-executable",
  };
}

export function assessApplicationPortfolio(packs = testMethodApplicationPacks) {
  const assessments = packs.map((pack) => ({ pack, assessment: assessApplicationPack(pack) }));
  const dimensions = packs.flatMap((pack) => pack.dimensions);
  return {
    packCount: packs.length,
    dimensionCount: dimensions.length,
    structuredCount: dimensions.filter((dimension) => dimension.status === "structured").length,
    partialCount: dimensions.filter((dimension) => dimension.status === "partial").length,
    blockerCount: dimensions.filter((dimension) => dimension.status === "evidence-required").length,
    executableReadyCount: assessments.filter(({ assessment }) => assessment.readyForExecutableMethodGraph).length,
  };
}

export function applicationReadinessBaselineRows(packs = testMethodApplicationPacks) {
  const header = ["readiness_id", "application_id", "application_pack", "dimension", "current_status", "claim_or_decision_supported", "required_evidence", "available_evidence_reference", "evidence_version_or_date", "applicability_scope", "evidence_owner", "reviewer_role", "review_status", "confidence", "blocking_gap", "gap_impact", "resolution_action", "due_date", "dependency", "method_graph_eligibility", "eligibility_rationale", "last_reviewed_at"];
  const rows = packs.flatMap((pack) => pack.dimensions.map((dimension, index) => [
    `RDY-${String(pack.sequence).padStart(2, "0")}-${String(index + 1).padStart(2, "0")}`,
    pack.id,
    pack.title,
    dimension.id,
    dimension.status,
    pack.decision,
    dimension.exitEvidence,
    pack.evidenceHrefs.join(" | "),
    "",
    pack.domain,
    "",
    "QC / QA / Regulatory / Engineering / SME",
    "open",
    dimension.status === "structured" ? "medium" : "indicative",
    dimension.status === "structured" ? "" : dimension.currentBasis,
    dimension.status === "structured" ? "" : "Prevents executable Method Graph eligibility until controlled evidence is reviewed.",
    dimension.status === "structured" ? "Confirm applicability and controlled source." : dimension.exitEvidence,
    "",
    "",
    pack.methodGraphStatus,
    assessApplicationPack(pack).readyForExecutableMethodGraph ? "Ready for controlled implementation review." : `${assessApplicationPack(pack).unresolved.length} dimensions remain unresolved.`,
    "",
  ]));
  return [header, ...rows];
}
