import { careerDomainTrackIds, type CareerDomainTrackId, type CompetencyKey } from "./career-blueprint";
import { DECISION_PACKAGE_CONTRACT_VERSION, DECISION_PACKAGES, type DecisionPackageId } from "./decision-packages";

export const CAREER_DOMAIN_TRACK_CONTRACT_VERSION = "career-domain-track/v1" as const;

export { careerDomainTrackIds };

export interface CareerDomainPackageMap {
  packageId: DecisionPackageId;
  competencyIds: CompetencyKey[];
  evidenceActivities: string[];
  reviewerPrompt: string;
}

export interface CareerDomainTrack {
  contractVersion: typeof CAREER_DOMAIN_TRACK_CONTRACT_VERSION;
  id: CareerDomainTrackId;
  title: string;
  summary: string;
  boundary: string;
  roleFamilies: string[];
  competencyIds: CompetencyKey[];
  packageMaps: CareerDomainPackageMap[];
  thirteenWeekActions: string[];
}

const packageMap = (packageId: DecisionPackageId, competencyIds: CompetencyKey[], evidenceActivities: string[], reviewerPrompt: string): CareerDomainPackageMap => ({ packageId, competencyIds, evidenceActivities, reviewerPrompt });

export const CAREER_DOMAIN_TRACKS: CareerDomainTrack[] = [
  {
    contractVersion: CAREER_DOMAIN_TRACK_CONTRACT_VERSION,
    id: "biopharma",
    title: "Biopharma product & process quality",
    summary: "Build evidence across substrate, materials, process, analytics, validation, comparability and transfer decisions.",
    boundary: "A planning track for evidence building; it does not certify role competence, authorize a method or replace qualified review.",
    roleFamilies: ["QC / analytical", "MSAT / process development", "Validation", "Quality / QA", "Regulatory CMC", "Technology transfer"],
    competencyIds: ["technicalExecution", "gmpEvidence", "investigationOwnership", "documentation", "leadership"],
    thirteenWeekActions: [
      "Choose one biopharma role lens and define the evidence standard you want to demonstrate.",
      "Map cell substrate, bank and material facts to one bounded product-quality question.",
      "Build a controlled source map and record applicability, limitations and reviewer roles.",
      "Trace one upstream attribute or parameter hypothesis to an observation and open evidence.",
      "Connect one downstream or clearance observation to analytical capability and uncertainty.",
      "Compare one potency, identity or orthogonal-characterization decision chain.",
      "Frame formulation, fill-finish or stability evidence without turning it into a recipe.",
      "Create a validation or CPV evidence map with explicit signal and escalation triggers.",
      "Draft a comparability question set that preserves differences and competing explanations.",
      "Prepare a receiving-site transfer review prompt with open evidence and accountable owners.",
      "Practice one investigation or CAPA effectiveness question using controlled lineage.",
      "Request qualified reviewer feedback and revise one evidence artifact with the limitation intact.",
      "Summarize the portfolio, remaining competency gaps and the next evidence increment.",
    ],
    packageMaps: [
      packageMap("biopharma-cell-materials-upstream", ["technicalExecution", "gmpEvidence", "documentation"], ["Create a source-linked substrate or material evidence map", "Explain one upstream decision and its unresolved evidence"], "Which qualified role would challenge this evidence before a product decision?"),
      packageMap("biopharma-downstream-analytics-formulation", ["technicalExecution", "gmpEvidence", "investigationOwnership"], ["Compare one attribute, method and decision chain", "Record one analytical limitation and its impact"], "What product-specific evidence is still needed before relying on the conclusion?"),
      packageMap("biopharma-validation-comparability-transfer", ["gmpEvidence", "investigationOwnership", "documentation", "leadership"], ["Build a change-to-evidence map", "Draft a receiving-site review question set"], "What would disprove the current comparability or transfer hypothesis?"),
      packageMap("cross-cutting-evidence-governance", ["gmpEvidence", "investigationOwnership", "documentation"], ["Trace one quality signal through investigation, CAPA and effectiveness evidence", "Draft a cross-functional data-lineage question"], "What evidence distinguishes an effective corrective action from a merely closed action?"),
    ],
  },
  {
    contractVersion: CAREER_DOMAIN_TRACK_CONTRACT_VERSION,
    id: "pharma-api",
    title: "Pharma/API development, manufacture & control",
    summary: "Build evidence across route, inputs, unit operations, impurities, analytical lifecycle, validation and transfer.",
    boundary: "A planning track for evidence building; it does not set API specifications, purge factors, process ranges or regulatory conclusions.",
    roleFamilies: ["API process development", "Chemical engineering", "Analytical development", "QC", "Validation", "API regulatory CMC"],
    competencyIds: ["technicalExecution", "gmpEvidence", "investigationOwnership", "documentation"],
    thirteenWeekActions: [
      "Choose an API role lens and define the route or lifecycle evidence you want to demonstrate.",
      "Trace a starting-material boundary to supplier qualification and incoming-control evidence.",
      "Record route, process version, market, source edition and decision-owner assumptions.",
      "Map one reaction and work-up operation to material, equipment and sampling evidence.",
      "Separate scale-up observations from universal process-range or equivalence claims.",
      "Trace one impurity from origin through observed fate and analytical capability.",
      "Frame isolation, drying, milling or solid-state uncertainty without asserting purge factors.",
      "Connect intended use, method performance and specification basis for one API procedure.",
      "Map stability, validation, transfer and commercial lifecycle evidence for one change.",
      "Draft a supplier, analytical or receiving-site review question set.",
      "Practice an investigation-to-CAPA effectiveness chain with unresolved evidence visible.",
      "Request qualified process, analytical or quality feedback and revise the evidence map.",
      "Summarize transferable competencies, API-specific gaps and the next evidence increment.",
    ],
    packageMaps: [
      packageMap("pharma-api-route-inputs-suppliers", ["technicalExecution", "gmpEvidence", "documentation"], ["Trace one starting-material boundary to supplier evidence", "Identify retained quality responsibilities"], "Which evidence would make the starting-material boundary unacceptable or incomplete?"),
      packageMap("pharma-api-reaction-workup-scale-up", ["technicalExecution", "gmpEvidence", "investigationOwnership"], ["Separate development knowledge from commercial control claims", "Map one unit operation to material and quality evidence"], "Which measurement or process evidence could change the scale-up decision?"),
      packageMap("pharma-api-isolation-solid-state-impurity", ["technicalExecution", "gmpEvidence", "investigationOwnership", "documentation"], ["Trace impurity origin, observed fate and analytical capability", "Write a limitation statement for a purge hypothesis"], "What evidence prevents a calculated ratio from becoming a transferable purge claim?"),
      packageMap("pharma-api-analytical-lifecycle", ["technicalExecution", "gmpEvidence", "documentation", "investigationOwnership"], ["Connect intended use, method capability, specification basis and lifecycle change", "Draft an analytical transfer review question"], "What product-specific evidence is required before the analytical conclusion can support release or filing?"),
      packageMap("cross-cutting-evidence-governance", ["technicalExecution", "gmpEvidence", "documentation", "investigationOwnership"], ["Map an API analytical signal to investigation, change and knowledge-transfer evidence", "Identify data needed before reusing a quality conclusion across products or sites"], "What evidence prevents a local signal from becoming an unsupported cross-product rule?"),
    ],
  },
  {
    contractVersion: CAREER_DOMAIN_TRACK_CONTRACT_VERSION,
    id: "drug-product",
    title: "Drug product development, manufacture & control",
    summary: "Build evidence across formulation, OSD unit operations, analytical performance, release, stability, packaging and transfer.",
    boundary: "A planning track using a synthetic OSD example; it does not certify a formulation, design space, validation strategy or regulatory precedent.",
    roleFamilies: ["Formulation development", "Drug-product process development", "Manufacturing science", "Analytical / QC", "Packaging", "Quality / regulatory CMC"],
    competencyIds: ["technicalExecution", "gmpEvidence", "investigationOwnership", "documentation", "leadership"],
    thirteenWeekActions: [
      "Choose a drug-product role lens and define the evidence standard for a bounded OSD example.",
      "Freeze dosage form, presentation, intended use and product-specific applicability questions.",
      "Map formulation intent, API/excipient attributes and material-version evidence.",
      "Trace one material hypothesis to blend, compaction, dissolution or stability observations.",
      "Map unit operations, equipment differences, holds and sampling without universal ranges.",
      "Record one scale-up question with competing explanations and missing evidence.",
      "Connect analytical purpose, performance evidence, release and investigation triggers.",
      "Frame stability and packaging evidence with licensed-source and dosage-form boundaries.",
      "Draft a validation, transfer or receiving-site evidence map.",
      "Connect a proposed change to continued verification, effectiveness and lifecycle review.",
      "Practice a cross-functional CAPA or data-lineage question using the shared package.",
      "Request qualified formulation, process, analytical or quality feedback and revise one artifact.",
      "Summarize role evidence, remaining product-specific gaps and the next bounded action.",
    ],
    packageMaps: [
      packageMap("drug-product-formulation-material-attributes", ["technicalExecution", "gmpEvidence", "documentation"], ["Build an OSD formulation-to-attribute evidence map", "Separate product facts from planning assumptions"], "Which dosage-form and product-specific evidence is missing?"),
      packageMap("drug-product-unit-operations-scale-up", ["technicalExecution", "gmpEvidence", "investigationOwnership"], ["Map one unit operation to scale and control evidence", "Identify an equipment or hold-time uncertainty"], "What evidence would change the proposed scale-up boundary?"),
      packageMap("drug-product-analytical-release-stability-packaging", ["technicalExecution", "gmpEvidence", "documentation", "investigationOwnership"], ["Connect performance, release, stability and packaging evidence", "Record one analytical limitation and its decision impact"], "What evidence is needed before performance or stability can support a product decision?"),
      packageMap("drug-product-validation-transfer-lifecycle", ["gmpEvidence", "investigationOwnership", "documentation", "leadership"], ["Draft a receiving-site transfer evidence map", "Define an effectiveness signal for a lifecycle change"], "Which qualified reviewer owns the transfer or change conclusion?"),
      packageMap("cross-cutting-evidence-governance", ["gmpEvidence", "investigationOwnership", "documentation"], ["Connect a release or stability signal to CAPA and effectiveness evidence", "Carry a change-control question into transfer and lifecycle review"], "Which product-specific evidence is required before generalizing the signal?"),
    ],
  },
];

export function getCareerDomainTrack(id: string) {
  return CAREER_DOMAIN_TRACKS.find((track) => track.id === id);
}

export function getCareerTrackForPackage(packageId: DecisionPackageId) {
  return CAREER_DOMAIN_TRACKS.find((track) => track.packageMaps.some((mapping) => mapping.packageId === packageId));
}

export function getCareerTracksForPackage(packageId: DecisionPackageId) {
  return CAREER_DOMAIN_TRACKS.filter((track) => track.packageMaps.some((mapping) => mapping.packageId === packageId));
}

export function validateCareerDomainTracks(): string[] {
  const errors: string[] = [];
  const packageIds = new Set(DECISION_PACKAGES.map((item) => item.id));
  const mapped = new Set<DecisionPackageId>();
  for (const track of CAREER_DOMAIN_TRACKS) {
    if (track.packageMaps.length === 0) errors.push(`${track.id}: packageMaps must not be empty`);
    if (track.thirteenWeekActions.length !== 13 || track.thirteenWeekActions.some((action) => !action.trim())) errors.push(`${track.id}: thirteenWeekActions must contain exactly thirteen non-empty actions`);
    for (const mapping of track.packageMaps) {
      if (!packageIds.has(mapping.packageId)) errors.push(`${track.id}: unknown package ${mapping.packageId}`);
      const packageItem = DECISION_PACKAGES.find((item) => item.id === mapping.packageId);
      if (mapped.has(mapping.packageId) && packageItem?.lane !== "cross-cutting-quality-rd") errors.push(`package ${mapping.packageId} is mapped to multiple career tracks`);
      mapped.add(mapping.packageId);
      if (mapping.evidenceActivities.length === 0) errors.push(`${mapping.packageId}: evidenceActivities must not be empty`);
    }
  }
  for (const item of DECISION_PACKAGES.filter((item) => item.lane !== "cross-cutting-quality-rd")) {
    if (!mapped.has(item.id)) errors.push(`${item.id}: missing career track mapping`);
  }
  for (const item of DECISION_PACKAGES.filter((item) => item.lane === "cross-cutting-quality-rd")) {
    if (CAREER_DOMAIN_TRACKS.filter((track) => track.packageMaps.some((mapping) => mapping.packageId === item.id)).length !== CAREER_DOMAIN_TRACKS.length) errors.push(`${item.id}: shared package must map to every career domain track`);
  }
  return errors;
}

export const CAREER_DOMAIN_TRACK_SOURCE_CONTRACT = DECISION_PACKAGE_CONTRACT_VERSION;
