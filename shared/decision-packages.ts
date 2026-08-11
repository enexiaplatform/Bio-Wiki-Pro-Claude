import type { BlueprintDecisionId } from "../client/src/data/atlasEvidenceGraph";
import { workflowSystems } from "../client/src/data/workflowSystems";
import type { CompetencyKey } from "./career-blueprint";
import { EVIDENCE_SOURCE_CATALOG } from "./content-quality-registry";

export const DECISION_PACKAGE_CONTRACT_VERSION = "decision-package/v1" as const;

export type DecisionPackageId =
  | "biopharma-cell-materials-upstream"
  | "biopharma-downstream-analytics-formulation"
  | "biopharma-validation-comparability-transfer"
  | "pharma-api-route-inputs-suppliers"
  | "pharma-api-reaction-workup-scale-up"
  | "pharma-api-isolation-solid-state-impurity"
  | "pharma-api-analytical-lifecycle"
  | "drug-product-formulation-material-attributes"
  | "drug-product-unit-operations-scale-up"
  | "drug-product-analytical-release-stability-packaging"
  | "drug-product-validation-transfer-lifecycle"
  | "cross-cutting-evidence-governance";

export type DecisionPackageLane = "biopharma" | "pharma-api" | "pharma-drug-product" | "cross-cutting-quality-rd";
export type DecisionPackageReviewStatus = "under-review" | "editorial-reviewed" | "sme-reviewed";
export type DecisionPackageCompilerMode = "nonsterile-microbiology-only" | "evidence-context-only";
export type DecisionPackageAssetKind = "guide" | "academy" | "workflow" | "tool" | "toolkit" | "deliverable";
export type DecisionPackageArtifactKind = "public-guide" | "pro-lesson" | "workflow-or-tool" | "working-asset" | "fictional-example" | "review-packet";
export type DecisionPackageProductDestination = "public" | "pro" | "quality-lab" | "career";

export interface DecisionPackageStageRef {
  systemId: string;
  stageId: string;
}

export interface DecisionPackageAssetRef {
  kind: DecisionPackageAssetKind;
  slug: string;
  title: string;
  href: string;
  status: "existing";
}

export interface DecisionPackageArtifactPlan {
  kind: DecisionPackageArtifactKind;
  title: string;
  status: "existing" | "planned";
  assetRef?: string;
}

export interface DecisionPackage {
  contractVersion: typeof DECISION_PACKAGE_CONTRACT_VERSION;
  id: DecisionPackageId;
  month: 1 | 2 | 3 | 4 | 5 | 6;
  lane: DecisionPackageLane;
  title: string;
  summary: string;
  decisionQuestion: string;
  discoveryQuestions: string[];
  stageRefs: DecisionPackageStageRef[];
  sourceIds: string[];
  sourceVersions: Record<string, string>;
  applicability: string;
  limitations: string[];
  reviewerRoles: string[];
  reviewStatus: DecisionPackageReviewStatus;
  riskLevel: "high";
  compilerMode: DecisionPackageCompilerMode;
  blueprintDecisionIds: BlueprintDecisionId[];
  careerCompetencyIds: CompetencyKey[];
  productDestinations: DecisionPackageProductDestination[];
  assetRefs: DecisionPackageAssetRef[];
  artifactPlan: DecisionPackageArtifactPlan[];
  reviewPacketPath: string;
}

const hrefFor = (kind: DecisionPackageAssetKind, slug: string) => {
  if (kind === "guide") return `/blog/${slug}`;
  if (kind === "academy") return `/library/${slug}`;
  if (kind === "workflow") return `/workflows/${slug}`;
  if (kind === "tool") return `/tools/${slug}`;
  if (kind === "toolkit") return `/toolkits?asset=${slug}`;
  return `/my-downloads?asset=${slug}`;
};

const asset = (kind: DecisionPackageAssetKind, slug: string, title: string): DecisionPackageAssetRef => ({ kind, slug, title, href: hrefFor(kind, slug), status: "existing" });
const plan = (kind: DecisionPackageArtifactKind, title: string, status: "existing" | "planned", assetRef?: string): DecisionPackageArtifactPlan => ({ kind, title, status, assetRef });

const standardProductDestinations: DecisionPackageProductDestination[] = ["public", "pro", "quality-lab", "career"];

const sharedLimitations = [
  "This package is decision support, not a site-approved method, specification, validation conclusion, regulatory determination or disposition decision.",
  "Product, market, site, process, method and effective-version applicability must be confirmed by accountable qualified roles.",
  "Fictional examples are illustrative and must not be reused as product-specific criteria, operating ranges or acceptance decisions.",
];

type DecisionPackageDefinition = Omit<DecisionPackage, "productDestinations" | "sourceVersions" | "reviewPacketPath" | "discoveryQuestions">;

const REVIEW_PACKET_PATHS: Record<DecisionPackageId, string> = {
  "biopharma-cell-materials-upstream": "docs/content-reviews/BIOPHARMA_CELL_SUBSTRATE_CONTROL_1_0_REVIEW_PACKET.md",
  "biopharma-downstream-analytics-formulation": "docs/content-reviews/BIOPHARMA_DOWNSTREAM_CLEARANCE_1_0_REVIEW_PACKET.md",
  "biopharma-validation-comparability-transfer": "docs/content-reviews/BIOPHARMA_PROCESS_VALIDATION_CPV_1_0_REVIEW_PACKET.md",
  "pharma-api-route-inputs-suppliers": "docs/content-reviews/PHARMA_API_STARTING_MATERIAL_INPUT_CONTROL_1_0_REVIEW_PACKET.md",
  "pharma-api-reaction-workup-scale-up": "docs/content-reviews/PHARMA_API_REACTION_SCALE_UP_1_0_REVIEW_PACKET.md",
  "pharma-api-isolation-solid-state-impurity": "docs/content-reviews/PHARMA_API_IMPURITY_CONTROL_1_0_REVIEW_PACKET.md",
  "pharma-api-analytical-lifecycle": "docs/content-reviews/PHARMA_API_ANALYTICAL_LIFECYCLE_1_0_REVIEW_PACKET.md",
  "drug-product-formulation-material-attributes": "docs/content-reviews/DRUG_PRODUCT_FORMULATION_MATERIAL_ATTRIBUTES_1_0_REVIEW_PACKET.md",
  "drug-product-unit-operations-scale-up": "docs/content-reviews/DRUG_PRODUCT_UNIT_OPERATIONS_SCALE_UP_1_0_REVIEW_PACKET.md",
  "drug-product-analytical-release-stability-packaging": "docs/content-reviews/DRUG_PRODUCT_ANALYTICAL_RELEASE_STABILITY_1_0_REVIEW_PACKET.md",
  "drug-product-validation-transfer-lifecycle": "docs/content-reviews/DRUG_PRODUCT_VALIDATION_TRANSFER_LIFECYCLE_1_0_REVIEW_PACKET.md",
  "cross-cutting-evidence-governance": "docs/content-reviews/CROSS_CUTTING_EVIDENCE_GOVERNANCE_1_0_REVIEW_PACKET.md",
};

const sourceEditionMap = new Map(EVIDENCE_SOURCE_CATALOG.sources.map((source) => [source.id, source.edition]));

const PACKAGE_DISCOVERY_QUESTIONS: Record<DecisionPackageId, string[]> = {
  "biopharma-cell-materials-upstream": [
    "Which cell substrate, bank and ancillary-material attributes could affect the intended product-quality profile?",
    "What evidence connects each material or upstream change to process performance and product observations?",
    "Which controls, comparability observations and open questions are ready for qualified review?",
    "Who owns unresolved evidence, and what lifecycle event would trigger re-review?",
  ],
  "biopharma-downstream-analytics-formulation": [
    "Which downstream, formulation and fill-finish steps are intended to control the most consequential quality attributes?",
    "Which analytical and orthogonal observations support clearance, potency, identity and stability claims?",
    "Where are hold-time, formulation or container-closure evidence still incomplete or scope-limited?",
    "Which signal would require escalation before the next lifecycle stage?",
  ],
  "biopharma-validation-comparability-transfer": [
    "What process or site differences must be explained before comparability can be reviewed?",
    "Which validation and continued-process-verification signals are available, versioned and attributable?",
    "What transfer evidence demonstrates that the receiving site can reproduce the intended control strategy?",
    "Which trend, deviation or change-control trigger should reopen the evidence review?",
  ],
  "pharma-api-route-inputs-suppliers": [
    "Which route steps and starting-material boundaries define the intended API quality risk?",
    "What supplier qualification, change-notification and incoming-control evidence is available?",
    "Which identity, impurity and material-attribute observations are product- or site-specific?",
    "What evidence is missing for the target market, supplier version or lifecycle stage?",
  ],
  "pharma-api-reaction-workup-scale-up": [
    "Which reaction and workup parameters have a defensible link to yield, impurity fate or downstream operability?",
    "What scale-up assumptions, heat or mass-transfer risks and failure modes remain open?",
    "Which sampling and analytical signals would distinguish a process issue from an input or measurement issue?",
    "What bounded evidence can be taken to qualified process-development or manufacturing review?",
  ],
  "pharma-api-isolation-solid-state-impurity": [
    "Which impurities require a stepwise fate, purge or carryover evidence map rather than a generic claim?",
    "How could isolation, drying or milling alter solid-state form, particle behavior or downstream performance?",
    "Which analytical observations distinguish process capability from a material or sampling artifact?",
    "What product-, route- and site-specific evidence is required before setting a control or escalation path?",
  ],
  "pharma-api-analytical-lifecycle": [
    "What is the intended purpose and evidence basis for each API analytical procedure and specification element?",
    "Which validation, transfer and stability observations constrain interpretation or applicability?",
    "What lifecycle changes could alter method performance, specification rationale or sampling needs?",
    "Which reviewers must confirm the evidence before a commercial decision is recorded?",
  ],
  "drug-product-formulation-material-attributes": [
    "What product intent and quality attributes should guide formulation and material-attribute evidence collection?",
    "Which excipient, API or material observations could interact with blend, compaction, dissolution or stability behavior?",
    "Which OSD observations are planning hypotheses that still require product-specific development evidence?",
    "What must remain explicitly out of scope because the available evidence does not support a formula or design-space conclusion?",
  ],
  "drug-product-unit-operations-scale-up": [
    "Which unit operations and process parameters are expected to influence the intended drug-product quality attributes?",
    "What scale-up, equipment-difference and material-variability evidence is available or still required?",
    "Which in-process observations and sampling triggers would expose loss of control early?",
    "What transfer or commercial-lifecycle decision depends on closing these evidence gaps?",
  ],
  "drug-product-analytical-release-stability-packaging": [
    "Which release and stability decisions depend on analytical performance evidence, product knowledge and intended use?",
    "What packaging or container-closure risks could change interpretation of stability or product-quality observations?",
    "Which method, specification and investigation signals should be connected rather than reviewed in isolation?",
    "Where does the available evidence stop short of a dosage-form-specific or product-specific conclusion?",
  ],
  "drug-product-validation-transfer-lifecycle": [
    "Which validation and transfer evidence demonstrates control at the receiving site or changed process state?",
    "What site, equipment, material or method differences could invalidate a simple transfer assumption?",
    "Which change-control and continued-verification signals should trigger a renewed evidence review?",
    "Who is accountable for accepting evidence gaps, documenting limitations and deciding the next review step?",
  ],
  "cross-cutting-evidence-governance": [
    "What source, version, method and data lineage is needed to explain the decision or signal under review?",
    "How will investigation, CAPA and effectiveness evidence distinguish correction from demonstrated control improvement?",
    "Which change-control and knowledge-transfer records must carry the same assumptions, limitations and reviewer roles?",
    "What unresolved evidence should remain visible instead of being converted into a recommendation or rule?",
  ],
};

export const DECISION_PACKAGES: DecisionPackage[] = ([
  {
    contractVersion: DECISION_PACKAGE_CONTRACT_VERSION,
    id: "biopharma-cell-materials-upstream",
    month: 1,
    lane: "biopharma",
    title: "Cell substrate, materials & upstream control",
    summary: "Connect substrate, bank, material and upstream process evidence to intended product-quality decisions.",
    decisionQuestion: "What must be known, controlled and reviewed before substrate, material or upstream evidence supports a product decision?",
    stageRefs: [{ systemId: "biopharma", stageId: "cell-source-materials" }, { systemId: "biopharma", stageId: "upstream" }],
    sourceIds: ["ICH-Q5B", "ICH-Q5D", "ICH-Q8-R2", "ICH-Q11", "ICH-Q9-R1"],
    applicability: "Protein-biologics development and manufacturing evidence chains involving cell substrates, banks, materials and upstream process decisions.",
    limitations: sharedLimitations,
    reviewerRoles: ["cell-line development", "upstream process development", "materials science", "analytical development", "quality", "regulatory CMC"],
    reviewStatus: "editorial-reviewed",
    riskLevel: "high",
    compilerMode: "evidence-context-only",
    blueprintDecisionIds: ["scope-applicability", "method-architecture", "control-investigation", "lifecycle-governance"],
    careerCompetencyIds: ["technicalExecution", "gmpEvidence", "documentation"],
    assetRefs: [
      asset("guide", "cell-banks-the-foundation-of-a-biologic", "Cell banks: the foundation of a biologic"),
      asset("academy", "biopharma-cell-line-cell-bank-genetic-stability", "Cell-line, bank lifecycle and genetic stability"),
      asset("academy", "biopharma-raw-ancillary-materials-control", "Raw, ancillary materials and single-use control"),
      asset("academy", "biopharma-upstream-process-control", "Upstream process control"),
      asset("workflow", "biopharma-control-strategy", "Biopharma control strategy workflow"),
      asset("toolkit", "biopharma-cell-substrate-control", "Cell substrate & bank lifecycle evidence map"),
      asset("toolkit", "biopharma-materials-control", "Materials & single-use control evidence map"),
    ],
    artifactPlan: [
      plan("public-guide", "Cell substrate and upstream decision guide", "existing", "cell-banks-the-foundation-of-a-biologic"),
      plan("pro-lesson", "Integrated cell-material-upstream lesson", "existing", "biopharma-upstream-process-control"),
      plan("workflow-or-tool", "Evidence-chain workflow", "existing", "biopharma-control-strategy"),
      plan("working-asset", "Cell/material/upstream evidence map", "existing", "biopharma-cell-substrate-control"),
      plan("fictional-example", "Fictional completed evidence map", "existing", "biopharma-cell-substrate-control"),
      plan("review-packet", "Founder review packet", "existing"),
    ],
  },
  {
    contractVersion: DECISION_PACKAGE_CONTRACT_VERSION,
    id: "biopharma-downstream-analytics-formulation",
    month: 2,
    lane: "biopharma",
    title: "Downstream, analytics & formulation control",
    summary: "Connect purification, clearance, product attributes, potency, formulation and stability evidence.",
    decisionQuestion: "How do downstream, analytical and formulation evidence objects contribute to one controlled product-quality decision?",
    stageRefs: [{ systemId: "biopharma", stageId: "downstream" }, { systemId: "biopharma", stageId: "formulation-fill" }, { systemId: "biopharma", stageId: "analytical-control" }],
    sourceIds: ["ICH-Q5A-R2", "ICH-Q5C", "ICH-Q5E", "ICH-Q6B", "ICH-Q9-R1"],
    applicability: "Protein-biologics purification, product characterization, potency, formulation, fill-finish and stability evidence framing.",
    limitations: sharedLimitations,
    reviewerRoles: ["downstream process development", "product quality", "analytical development", "formulation development", "quality", "regulatory CMC"],
    reviewStatus: "editorial-reviewed",
    riskLevel: "high",
    compilerMode: "evidence-context-only",
    blueprintDecisionIds: ["method-architecture", "control-investigation", "lifecycle-governance"],
    careerCompetencyIds: ["technicalExecution", "gmpEvidence", "documentation", "investigationOwnership"],
    assetRefs: [
      asset("guide", "characterizing-a-protein-its-not-one-test", "Characterizing a protein: it is not one test"),
      asset("academy", "biopharma-downstream-purification-clearance", "Downstream purification and clearance"),
      asset("academy", "biopharma-integrated-analytical-control-strategy", "Integrated analytical control strategy"),
      asset("academy", "biopharma-formulation-fill-finish-stability", "Formulation, fill-finish and stability"),
      asset("academy", "biopharma-potency-reference-and-orthogonal-characterization", "Potency, reference and orthogonal characterization"),
      asset("workflow", "biopharma-control-strategy", "Biopharma control strategy workflow"),
      asset("toolkit", "biopharma-downstream-clearance", "Downstream clearance evidence map"),
      asset("toolkit", "biopharma-analytical-control-strategy", "Analytical control-strategy evidence map"),
      asset("toolkit", "biopharma-formulation-stability", "Formulation and stability evidence map"),
    ],
    artifactPlan: [
      plan("public-guide", "Downstream-to-formulation decision guide", "existing", "characterizing-a-protein-its-not-one-test"),
      plan("pro-lesson", "Integrated downstream and analytical lesson", "existing", "biopharma-integrated-analytical-control-strategy"),
      plan("workflow-or-tool", "Attribute-to-decision workflow", "existing", "biopharma-control-strategy"),
      plan("working-asset", "Downstream/analytics/formulation evidence map", "existing", "biopharma-downstream-clearance"),
      plan("fictional-example", "Fictional completed evidence map", "existing", "biopharma-downstream-clearance"),
      plan("review-packet", "Founder review packet", "existing"),
    ],
  },
  {
    contractVersion: DECISION_PACKAGE_CONTRACT_VERSION,
    id: "biopharma-validation-comparability-transfer",
    month: 2,
    lane: "biopharma",
    title: "Validation, CPV, comparability & transfer",
    summary: "Close the biopharma lifecycle loop from process knowledge through continued verification, change and receiving-site transfer.",
    decisionQuestion: "What evidence and accountable review are required before a validation, comparability or transfer conclusion can be relied upon?",
    stageRefs: [{ systemId: "biopharma", stageId: "validation-cpv" }, { systemId: "biopharma", stageId: "release-transfer" }],
    sourceIds: ["ICH-Q5E", "ICH-Q10", "ICH-Q11", "FDA-PROCESS-VALIDATION-2011", "WHO-TRS-1044-ANNEX4"],
    applicability: "Biopharma PPQ, CPV, comparability, technology-transfer and lifecycle-change evidence.",
    limitations: sharedLimitations,
    reviewerRoles: ["MSAT", "validation", "technology transfer", "manufacturing", "quality", "regulatory CMC"],
    reviewStatus: "editorial-reviewed",
    riskLevel: "high",
    compilerMode: "evidence-context-only",
    blueprintDecisionIds: ["control-investigation", "lifecycle-governance", "scope-applicability"],
    careerCompetencyIds: ["gmpEvidence", "investigationOwnership", "documentation", "leadership"],
    assetRefs: [
      asset("guide", "technology-transfer-moving-without-breaking", "Technology transfer: moving without breaking control"),
      asset("academy", "biopharma-process-validation-continued-verification", "Process validation and CPV"),
      asset("academy", "biopharma-manufacturing-comparability", "Manufacturing comparability after change"),
      asset("academy", "biopharma-integrated-technology-transfer", "Integrated technology transfer"),
      asset("workflow", "process-validation", "Process validation workflow"),
      asset("toolkit", "biopharma-process-validation-cpv", "Process validation and CPV evidence map"),
      asset("toolkit", "biopharma-technology-transfer", "Technology transfer evidence map"),
    ],
    artifactPlan: [
      plan("public-guide", "Validation-to-transfer decision guide", "existing", "technology-transfer-moving-without-breaking"),
      plan("pro-lesson", "Integrated validation and transfer lesson", "existing", "biopharma-integrated-technology-transfer"),
      plan("workflow-or-tool", "Change-to-evidence workflow", "existing", "process-validation"),
      plan("working-asset", "Validation/CPV/transfer evidence map", "existing", "biopharma-process-validation-cpv"),
      plan("fictional-example", "Fictional completed transfer map", "existing", "biopharma-technology-transfer"),
      plan("review-packet", "Founder review packet", "existing"),
    ],
  },
  {
    contractVersion: DECISION_PACKAGE_CONTRACT_VERSION,
    id: "pharma-api-route-inputs-suppliers",
    month: 1,
    lane: "pharma-api",
    title: "API route, starting materials & supplier inputs",
    summary: "Connect route understanding, starting-material boundaries, supplier evidence and incoming controls.",
    decisionQuestion: "What evidence supports a proposed API starting-material and supplier-control boundary?",
    stageRefs: [{ systemId: "pharma-api", stageId: "api-inputs" }],
    sourceIds: ["ICH-Q11", "ICH-Q11-QA", "ICH-Q7", "ICH-Q7-QA", "ICH-Q9-R1", "ICH-Q10", "FDA-QUALITY-AGREEMENTS-2016"],
    applicability: "Small-molecule API route, input, starting-material and supplier-quality decision framing.",
    limitations: sharedLimitations,
    reviewerRoles: ["synthetic process development", "API regulatory CMC", "supplier quality", "quality"],
    reviewStatus: "editorial-reviewed",
    riskLevel: "high",
    compilerMode: "evidence-context-only",
    blueprintDecisionIds: ["scope-applicability", "method-architecture", "lifecycle-governance"],
    careerCompetencyIds: ["technicalExecution", "gmpEvidence", "documentation"],
    assetRefs: [
      asset("guide", "supplier-qualification-quality-agreement", "Supplier qualification and quality agreements"),
      asset("academy", "pharma-api-starting-materials-input-control", "API starting materials and input control"),
      asset("academy", "supplier-qualification", "Supplier qualification"),
      asset("workflow", "supplier-qualification-workflow", "Supplier qualification workflow"),
      asset("toolkit", "pharma-api-starting-material-input-control", "API starting-material input evidence map"),
    ],
    artifactPlan: [
      plan("public-guide", "Route and input-control decision guide", "existing", "supplier-qualification-quality-agreement"),
      plan("pro-lesson", "API starting-material control lesson", "existing", "pharma-api-starting-materials-input-control"),
      plan("workflow-or-tool", "Starting-material boundary workflow", "existing", "supplier-qualification-workflow"),
      plan("working-asset", "Starting-material input evidence map", "existing", "pharma-api-starting-material-input-control"),
      plan("fictional-example", "Fictional input-control case", "existing", "pharma-api-starting-material-input-control"),
      plan("review-packet", "Founder review packet", "existing"),
    ],
  },
  {
    contractVersion: DECISION_PACKAGE_CONTRACT_VERSION,
    id: "pharma-api-reaction-workup-scale-up",
    month: 3,
    lane: "pharma-api",
    title: "API reaction, work-up & scale-up control",
    summary: "Connect transformations, work-up, scale-up and process understanding without generalizing operating ranges.",
    decisionQuestion: "Which process-development and manufacturing evidence must be connected before a unit-operation decision is reviewed?",
    stageRefs: [{ systemId: "pharma-api", stageId: "api-process" }, { systemId: "pharma-api", stageId: "api-equipment-cleaning" }],
    sourceIds: ["ICH-Q8-R2", "ICH-Q11", "ICH-Q9-R1", "FDA-PROCESS-VALIDATION-2011"],
    applicability: "Small-molecule API reaction, work-up, equipment and scale-up evidence framing.",
    limitations: sharedLimitations,
    reviewerRoles: ["synthetic process development", "chemical or process engineering", "manufacturing science", "process validation"],
    reviewStatus: "editorial-reviewed",
    riskLevel: "high",
    compilerMode: "evidence-context-only",
    blueprintDecisionIds: ["method-architecture", "equipment-utilities", "control-investigation", "lifecycle-governance"],
    careerCompetencyIds: ["technicalExecution", "gmpEvidence", "investigationOwnership"],
    assetRefs: [
      asset("guide", "quality-by-design-building-quality-in", "Quality by design: building quality in"),
      asset("academy", "pharma-api-reaction-workup-scale-up", "API reaction, work-up and scale-up"),
      asset("academy", "pharma-api-full-lifecycle-drug-substance-control", "Full-lifecycle drug-substance control"),
      asset("workflow", "process-validation", "Process validation workflow"),
      asset("tool", "process-capability-calculator", "Process capability calculator"),
      asset("toolkit", "pharma-api-reaction-scale-up", "Reaction, work-up & scale-up evidence map"),
    ],
    artifactPlan: [
      plan("public-guide", "Reaction-to-scale-up decision guide", "existing", "quality-by-design-building-quality-in"),
      plan("pro-lesson", "Reaction and scale-up lesson", "existing", "pharma-api-reaction-workup-scale-up"),
      plan("workflow-or-tool", "Unit-operation evidence mapper", "existing", "pharma-api-reaction-scale-up"),
      plan("working-asset", "API unit-operation evidence map", "existing", "pharma-api-reaction-scale-up"),
      plan("fictional-example", "Fictional scale-up evidence case", "existing", "pharma-api-reaction-scale-up"),
      plan("review-packet", "Founder review packet", "existing"),
    ],
  },
  {
    contractVersion: DECISION_PACKAGE_CONTRACT_VERSION,
    id: "pharma-api-isolation-solid-state-impurity",
    month: 3,
    lane: "pharma-api",
    title: "API isolation, solid-state & impurity fate",
    summary: "Trace isolation, drying, milling, solid-state and impurity observations to control decisions without transferable purge claims.",
    decisionQuestion: "How should impurity origin, observed fate, isolation and solid-state evidence be connected and reviewed?",
    stageRefs: [{ systemId: "pharma-api", stageId: "api-process" }, { systemId: "pharma-api", stageId: "api-stability-investigation" }],
    sourceIds: ["ICH-Q3A-R2", "ICH-Q3C-R9", "ICH-Q3D-R2", "ICH-M7-R2", "ICH-Q6A", "ICH-Q9-R1"],
    applicability: "API impurity strategy, isolation/solid-state evidence and stability/investigation decisions.",
    limitations: sharedLimitations,
    reviewerRoles: ["process chemistry", "solid-state science", "analytical development", "toxicology or impurity safety", "quality", "API regulatory CMC"],
    reviewStatus: "editorial-reviewed",
    riskLevel: "high",
    compilerMode: "evidence-context-only",
    blueprintDecisionIds: ["method-architecture", "control-investigation", "lifecycle-governance"],
    careerCompetencyIds: ["technicalExecution", "gmpEvidence", "investigationOwnership", "documentation"],
    assetRefs: [
      asset("guide", "nitrosamine-impurities", "Nitrosamine impurities"),
      asset("academy", "pharma-api-isolation-solid-state-control", "API isolation and solid-state control"),
      asset("academy", "pharma-api-process-development-impurity-control", "API process-development impurity control"),
      asset("academy", "nitrosamine-impurity-control", "Nitrosamine impurity control"),
      asset("workflow", "pharma-api-impurity-control", "API impurity-control workflow"),
      asset("toolkit", "pharma-api-impurity-control", "API impurity control evidence map"),
    ],
    artifactPlan: [
      plan("public-guide", "Isolation and impurity decision guide", "existing", "nitrosamine-impurities"),
      plan("pro-lesson", "Isolation, solid-state and impurity lesson", "existing", "pharma-api-isolation-solid-state-control"),
      plan("workflow-or-tool", "Impurity-fate evidence mapper", "existing", "pharma-api-impurity-control"),
      plan("working-asset", "Isolation and impurity evidence map", "existing", "pharma-api-impurity-control"),
      plan("fictional-example", "Fictional impurity-control case", "existing", "pharma-api-impurity-control"),
      plan("review-packet", "Founder review packet", "existing"),
    ],
  },
  {
    contractVersion: DECISION_PACKAGE_CONTRACT_VERSION,
    id: "pharma-api-analytical-lifecycle",
    month: 4,
    lane: "pharma-api",
    title: "API analytical, stability & lifecycle control",
    summary: "Connect analytical purpose, specification basis, validation, stability, transfer and commercial lifecycle change.",
    decisionQuestion: "What evidence keeps an API analytical and specification strategy decision-ready across its lifecycle?",
    stageRefs: [{ systemId: "pharma-api", stageId: "api-analytical" }, { systemId: "pharma-api", stageId: "api-validation" }, { systemId: "pharma-api", stageId: "api-stability-investigation" }, { systemId: "pharma-api", stageId: "api-release-change" }],
    sourceIds: ["ICH-Q1A-R2", "ICH-Q2-R2", "ICH-Q6A", "ICH-Q7", "ICH-Q10", "ICH-Q14", "FDA-ANALYTICAL-PROCEDURES-2015", "FDA-PROCESS-VALIDATION-2011", "WHO-TRS-1044-ANNEX4"],
    applicability: "API analytical method, specification, stability, validation, transfer and post-approval lifecycle evidence.",
    limitations: sharedLimitations,
    reviewerRoles: ["API analytical development", "quality control", "stability", "process validation", "technology transfer", "quality", "regulatory CMC"],
    reviewStatus: "editorial-reviewed",
    riskLevel: "high",
    compilerMode: "evidence-context-only",
    blueprintDecisionIds: ["method-architecture", "control-investigation", "lifecycle-governance"],
    careerCompetencyIds: ["technicalExecution", "gmpEvidence", "documentation", "investigationOwnership"],
    assetRefs: [
      asset("guide", "analytical-method-validation-what-q2-asks", "Analytical method validation: what Q2 asks"),
      asset("academy", "pharma-api-analytical-specification-lifecycle", "API analytical specification lifecycle"),
      asset("academy", "pharma-api-process-validation-commercial-lifecycle", "API process validation and commercial lifecycle"),
      asset("academy", "analytical-procedure-lifecycle-q14", "Analytical procedure lifecycle"),
      asset("workflow", "hplc-system-suitability-workflow", "HPLC system suitability"),
      asset("toolkit", "pharma-api-analytical-lifecycle", "API analytical lifecycle evidence map"),
    ],
    artifactPlan: [
      plan("public-guide", "API analytical lifecycle decision guide", "existing", "analytical-method-validation-what-q2-asks"),
      plan("pro-lesson", "API analytical lifecycle lesson", "existing", "pharma-api-analytical-specification-lifecycle"),
      plan("workflow-or-tool", "API method lifecycle workflow", "existing", "hplc-system-suitability-workflow"),
      plan("working-asset", "API analytical lifecycle evidence map", "existing", "pharma-api-analytical-lifecycle"),
      plan("fictional-example", "Fictional API lifecycle case", "existing", "pharma-api-analytical-lifecycle"),
      plan("review-packet", "Founder review packet", "existing"),
    ],
  },
  {
    contractVersion: DECISION_PACKAGE_CONTRACT_VERSION,
    id: "drug-product-formulation-material-attributes",
    month: 4,
    lane: "pharma-drug-product",
    title: "Drug product formulation & material attributes",
    summary: "Create a dosage-form-aware decision framework with an OSD worked example for formulation and material attributes.",
    decisionQuestion: "How do formulation, API/excipient attributes and presentation affect product performance and manufacturability evidence?",
    stageRefs: [{ systemId: "pharma-drug-product", stageId: "formulation-material-attributes" }],
    sourceIds: ["ICH-Q8-R2", "ICH-Q9-R1", "ICH-Q10"],
    applicability: "General drug-product formulation framing with a synthetic oral-solid-dose example; dosage-form and product-specific review remains open.",
    limitations: [...sharedLimitations, "The OSD example does not establish a formulation, design space, bioequivalence, release criterion or regulatory precedent."],
    reviewerRoles: ["formulation development", "material science", "biopharmaceutics", "analytical development", "regulatory CMC"],
    reviewStatus: "editorial-reviewed",
    riskLevel: "high",
    compilerMode: "evidence-context-only",
    blueprintDecisionIds: ["scope-applicability", "method-architecture", "lifecycle-governance"],
    careerCompetencyIds: ["technicalExecution", "gmpEvidence", "documentation"],
    assetRefs: [
      asset("guide", "quality-by-design-building-quality-in", "Quality by design: building quality in"),
      asset("academy", "quality-risk-management-q9", "Quality risk management"),
      asset("academy", "stability-studies", "Stability studies"),
      asset("academy", "drug-product-formulation-material-attributes", "Drug-product formulation and material attributes"),
      asset("toolkit", "drug-product-formulation-material-attributes", "Formulation and material-attributes evidence map"),
    ],
    artifactPlan: [
      plan("public-guide", "Formulation and material-attributes decision guide", "existing", "quality-by-design-building-quality-in"),
      plan("pro-lesson", "Drug-product formulation and OSD lesson", "existing", "drug-product-formulation-material-attributes"),
      plan("workflow-or-tool", "Formulation-to-attribute workflow", "existing", "drug-product-formulation-material-attributes"),
      plan("working-asset", "OSD formulation evidence map", "existing", "drug-product-formulation-material-attributes"),
      plan("fictional-example", "Synthetic OSD worked example", "existing", "drug-product-formulation-material-attributes"),
      plan("review-packet", "Founder review packet", "existing"),
    ],
  },
  {
    contractVersion: DECISION_PACKAGE_CONTRACT_VERSION,
    id: "drug-product-unit-operations-scale-up",
    month: 5,
    lane: "pharma-drug-product",
    title: "Drug product unit operations & scale-up",
    summary: "Connect unit operations, equipment, scale, hold, sampling and process-control evidence for an OSD planning example.",
    decisionQuestion: "Which development, equipment and process-control evidence is needed before a drug-product scale-up decision is reviewed?",
    stageRefs: [{ systemId: "pharma-drug-product", stageId: "unit-operations-scale-up" }],
    sourceIds: ["ICH-Q8-R2", "ICH-Q9-R1", "ICH-Q10", "FDA-PROCESS-VALIDATION-2011"],
    applicability: "Drug-product process-development and scale-up evidence framing, using OSD as an illustrative example.",
    limitations: sharedLimitations,
    reviewerRoles: ["drug-product process development", "manufacturing science", "equipment engineering", "statistics", "process validation"],
    reviewStatus: "editorial-reviewed",
    riskLevel: "high",
    compilerMode: "evidence-context-only",
    blueprintDecisionIds: ["method-architecture", "workload-capacity", "equipment-utilities", "control-investigation"],
    careerCompetencyIds: ["technicalExecution", "gmpEvidence", "investigationOwnership"],
    assetRefs: [
      asset("guide", "process-validation-three-stages", "Process validation: three stages"),
      asset("academy", "process-validation-stages", "Process validation stages"),
      asset("academy", "equipment-qualification", "Equipment qualification"),
      asset("workflow", "process-validation", "Process validation workflow"),
      asset("tool", "process-capability-calculator", "Process capability calculator"),
      asset("academy", "drug-product-unit-operations-scale-up", "Drug-product unit operations and scale-up"),
      asset("toolkit", "drug-product-unit-operations-scale-up", "Unit operations and scale-up evidence map"),
    ],
    artifactPlan: [
      plan("public-guide", "Unit-operation and scale-up decision guide", "existing", "process-validation-three-stages"),
      plan("pro-lesson", "Drug-product process-control lesson", "existing", "drug-product-unit-operations-scale-up"),
      plan("workflow-or-tool", "OSD unit-operation evidence workflow", "existing", "drug-product-unit-operations-scale-up"),
      plan("working-asset", "Unit-operation and scale-up evidence map", "existing", "drug-product-unit-operations-scale-up"),
      plan("fictional-example", "Synthetic OSD scale-up case", "existing", "drug-product-unit-operations-scale-up"),
      plan("review-packet", "Founder review packet", "existing"),
    ],
  },
  {
    contractVersion: DECISION_PACKAGE_CONTRACT_VERSION,
    id: "drug-product-analytical-release-stability-packaging",
    month: 5,
    lane: "pharma-drug-product",
    title: "Drug product analytical, release, stability & packaging",
    summary: "Connect analytical performance, release, stability, dissolution and packaging evidence for a complete presentation.",
    decisionQuestion: "What evidence supports the product-performance, release, stability and packaging control chain?",
    stageRefs: [{ systemId: "pharma-drug-product", stageId: "analytical-release-stability-packaging" }],
    sourceIds: ["ICH-Q1A-R2", "ICH-Q2-R2", "ICH-Q6A", "ICH-Q14", "FDA-CONTAINER-CLOSURE-1999"],
    applicability: "Drug-product analytical, dissolution/performance, stability and packaging evidence framing.",
    limitations: sharedLimitations,
    reviewerRoles: ["drug-product analytical development", "quality control", "stability", "packaging or container engineering", "regulatory CMC"],
    reviewStatus: "editorial-reviewed",
    riskLevel: "high",
    compilerMode: "evidence-context-only",
    blueprintDecisionIds: ["method-architecture", "control-investigation", "lifecycle-governance"],
    careerCompetencyIds: ["technicalExecution", "gmpEvidence", "documentation", "investigationOwnership"],
    assetRefs: [
      asset("guide", "dissolution-is-more-mechanical-than-you-think", "Dissolution is more mechanical than you think"),
      asset("academy", "dissolution-testing-usp-711", "Dissolution testing"),
      asset("academy", "stability-studies", "Stability studies"),
      asset("academy", "container-closure-integrity", "Container closure integrity"),
      asset("workflow", "dissolution-testing-workflow", "Dissolution testing workflow"),
      asset("workflow", "stability-program", "Stability program"),
      asset("academy", "drug-product-analytical-release-stability", "Drug-product analytical, release and stability"),
      asset("toolkit", "drug-product-analytical-release-stability", "Analytical, release and stability evidence map"),
    ],
    artifactPlan: [
      plan("public-guide", "Release, stability and packaging decision guide", "existing", "dissolution-is-more-mechanical-than-you-think"),
      plan("pro-lesson", "Drug-product analytical and stability lesson", "existing", "drug-product-analytical-release-stability"),
      plan("workflow-or-tool", "Performance-to-release workflow", "existing", "drug-product-analytical-release-stability"),
      plan("working-asset", "Drug-product analytical lifecycle map", "existing", "drug-product-analytical-release-stability"),
      plan("fictional-example", "Synthetic OSD release/stability case", "existing", "drug-product-analytical-release-stability"),
      plan("review-packet", "Founder review packet", "existing"),
    ],
  },
  {
    contractVersion: DECISION_PACKAGE_CONTRACT_VERSION,
    id: "drug-product-validation-transfer-lifecycle",
    month: 6,
    lane: "pharma-drug-product",
    title: "Drug product validation, transfer & lifecycle",
    summary: "Connect receiving-site capability, validation, change, transfer and continued lifecycle control.",
    decisionQuestion: "How does a drug-product control strategy remain traceable through validation, transfer and change?",
    stageRefs: [{ systemId: "pharma-drug-product", stageId: "validation-transfer-lifecycle" }],
    sourceIds: ["WHO-TRS-1044-ANNEX4", "ICH-Q9-R1", "ICH-Q10", "FDA-PROCESS-VALIDATION-2011"],
    applicability: "Drug-product validation, technology transfer and post-approval lifecycle evidence framing.",
    limitations: sharedLimitations,
    reviewerRoles: ["technology transfer", "manufacturing operations", "engineering", "analytical development and QC", "validation", "quality", "regulatory CMC"],
    reviewStatus: "editorial-reviewed",
    riskLevel: "high",
    compilerMode: "evidence-context-only",
    blueprintDecisionIds: ["control-investigation", "lifecycle-governance", "scope-applicability"],
    careerCompetencyIds: ["gmpEvidence", "investigationOwnership", "documentation", "leadership"],
    assetRefs: [
      asset("guide", "technology-transfer-moving-without-breaking", "Technology transfer: moving without breaking control"),
      asset("academy", "technology-transfer", "Technology transfer"),
      asset("academy", "analytical-method-transfer", "Analytical method transfer"),
      asset("academy", "change-control", "Change control"),
      asset("workflow", "change-control-workflow", "Change-control workflow"),
      asset("academy", "drug-product-validation-transfer-lifecycle", "Drug-product validation, transfer and lifecycle"),
      asset("toolkit", "drug-product-validation-transfer-lifecycle", "Validation, transfer and lifecycle evidence map"),
    ],
    artifactPlan: [
      plan("public-guide", "Drug-product transfer and lifecycle guide", "existing", "technology-transfer-moving-without-breaking"),
      plan("pro-lesson", "Drug-product transfer and lifecycle lesson", "existing", "drug-product-validation-transfer-lifecycle"),
      plan("workflow-or-tool", "Transfer-to-change workflow", "existing", "change-control-workflow"),
      plan("working-asset", "Drug-product transfer evidence map", "existing", "drug-product-validation-transfer-lifecycle"),
      plan("fictional-example", "Synthetic receiving-site transfer case", "existing", "drug-product-validation-transfer-lifecycle"),
      plan("review-packet", "Founder review packet", "existing"),
    ],
  },
  {
    contractVersion: DECISION_PACKAGE_CONTRACT_VERSION,
    id: "cross-cutting-evidence-governance",
    month: 6,
    lane: "cross-cutting-quality-rd",
    title: "Cross-product evidence, statistics & change governance",
    summary: "Move analytical signals and process changes through data quality, investigation, CAPA, effectiveness and knowledge transfer.",
    decisionQuestion: "What evidence chain makes a cross-product quality signal or change decision reviewable and reusable?",
    stageRefs: [{ systemId: "quality-lifecycle", stageId: "quality-signals" }, { systemId: "quality-lifecycle", stageId: "capa-change" }, { systemId: "quality-lifecycle", stageId: "quality-review-release" }, { systemId: "qc-laboratory", stageId: "lab-investigations" }],
    sourceIds: ["ICH-Q2-R2", "ICH-Q8-R2", "ICH-Q9-R1", "FDA-DI-2018", "FDA-OOS-2022", "FDA-PROCESS-VALIDATION-2011", "ICH-Q10"],
    applicability: "Cross-product analytical, statistical, investigation, CAPA, change-control and knowledge-transfer decisions.",
    limitations: sharedLimitations,
    reviewerRoles: ["quality control", "quality assurance", "manufacturing science", "data integrity", "regulatory CMC"],
    reviewStatus: "editorial-reviewed",
    riskLevel: "high",
    compilerMode: "evidence-context-only",
    blueprintDecisionIds: ["control-investigation", "lifecycle-governance"],
    careerCompetencyIds: ["gmpEvidence", "investigationOwnership", "documentation", "leadership"],
    assetRefs: [
      asset("guide", "capa-effectiveness-check", "CAPA effectiveness check"),
      asset("academy", "data-integrity-deep-dive", "Data integrity deep dive"),
      asset("academy", "oos-investigation-deep-dive", "OOS investigation"),
      asset("academy", "decision-led-doe-and-multivariate-process-evidence", "Decision-led DoE and multivariate evidence"),
      asset("workflow", "oos-investigation", "OOS investigation workflow"),
      asset("toolkit", "analytical-lifecycle-evidence-map", "Analytical lifecycle evidence map"),
      asset("toolkit", "decision-led-statistics-evidence-map", "Decision-led statistics and process evidence map"),
      asset("toolkit", "oos-investigation-template", "OOS investigation template"),
    ],
    artifactPlan: [
      plan("public-guide", "Evidence-to-effectiveness decision guide", "existing", "capa-effectiveness-check"),
      plan("pro-lesson", "Cross-product evidence governance lesson", "existing", "data-integrity-deep-dive"),
      plan("workflow-or-tool", "Signal-to-CAPA workflow", "existing", "oos-investigation"),
      plan("working-asset", "Investigation-to-effectiveness evidence map", "existing", "oos-investigation-template"),
      plan("fictional-example", "Fictional investigation case", "existing", "oos-investigation-template"),
      plan("review-packet", "Founder review packet", "existing"),
    ],
  },
] as DecisionPackageDefinition[]).map((item) => ({
  ...item,
  discoveryQuestions: PACKAGE_DISCOVERY_QUESTIONS[item.id],
  sourceVersions: Object.fromEntries(item.sourceIds.map((sourceId) => [sourceId, sourceEditionMap.get(sourceId) ?? "Verify current edition"])),
  productDestinations: [...standardProductDestinations],
  reviewPacketPath: REVIEW_PACKET_PATHS[item.id],
  artifactPlan: item.artifactPlan,
}));

export function getDecisionPackage(id: string) {
  return DECISION_PACKAGES.find((item) => item.id === id);
}

export function getDecisionPackagesForStage(systemId: string, stageId: string) {
  return DECISION_PACKAGES.filter((item) => item.stageRefs.some((stage) => stage.systemId === systemId && stage.stageId === stageId));
}

export function getDecisionPackagesForLane(lane: DecisionPackageLane) {
  return DECISION_PACKAGES.filter((item) => item.lane === lane);
}

export function getNextDecisionPackage(id: string) {
  const current = getDecisionPackage(id);
  if (!current) return undefined;
  const lanePackages = DECISION_PACKAGES.filter((item) => item.lane === current.lane);
  const index = lanePackages.findIndex((item) => item.id === current.id);
  return index >= 0 ? lanePackages[index + 1] : undefined;
}

export function decisionPackageForAsset(collection: string, slug: string) {
  return DECISION_PACKAGES.filter((item) => item.assetRefs.some((assetRef) => assetRef.slug === slug && (
    (collection === "blog" && assetRef.kind === "guide")
    || (collection === "academy" && assetRef.kind === "academy")
    || (collection === "toolkits" && assetRef.kind === "toolkit")
  )));
}

export function validateDecisionPackages(packages = DECISION_PACKAGES): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const requiredDestinations: DecisionPackageProductDestination[] = ["public", "pro", "quality-lab", "career"];
  const knownSourceIds = new Set(sourceEditionMap.keys());
  const knownStageKeys = new Set(workflowSystems.flatMap((system) => system.stages.map((stage) => `${system.id}:${stage.id}`)));
  for (const item of packages) {
    if (ids.has(item.id)) errors.push(`duplicate decision package id: ${item.id}`);
    ids.add(item.id);
    if (item.sourceIds.length === 0) errors.push(`${item.id}: sourceIds must not be empty`);
    if (item.discoveryQuestions.length < 3 || item.discoveryQuestions.some((question) => !question.trim())) errors.push(`${item.id}: discoveryQuestions must contain at least three non-empty questions`);
    for (const sourceId of item.sourceIds) {
      if (!knownSourceIds.has(sourceId)) errors.push(`${item.id}: unknown sourceId ${sourceId}`);
      if (!item.sourceVersions[sourceId]?.trim()) errors.push(`${item.id}: every sourceId requires a source version`);
    }
    if (item.stageRefs.length === 0) errors.push(`${item.id}: stageRefs must not be empty`);
    for (const stage of item.stageRefs) {
      if (!knownStageKeys.has(`${stage.systemId}:${stage.stageId}`)) errors.push(`${item.id}: invalid stage mapping ${stage.systemId}:${stage.stageId}`);
    }
    if (item.assetRefs.length === 0) errors.push(`${item.id}: assetRefs must not be empty`);
    if (!item.reviewPacketPath?.startsWith("docs/content-reviews/")) errors.push(`${item.id}: reviewPacketPath must point to a repository review packet`);
    if (item.productDestinations.length === 0 || requiredDestinations.some((destination) => !item.productDestinations.includes(destination))) errors.push(`${item.id}: productDestinations must bind public, pro, quality-lab and career`);
    if (item.artifactPlan.length !== 6) errors.push(`${item.id}: artifactPlan must contain six required artifacts`);
    if (new Set(item.assetRefs.map((assetRef) => `${assetRef.kind}:${assetRef.slug}`)).size !== item.assetRefs.length) errors.push(`${item.id}: assetRefs contain duplicate keys`);
    if (new Set(item.artifactPlan.map((artifact) => artifact.kind)).size !== item.artifactPlan.length) errors.push(`${item.id}: artifactPlan contains duplicate kinds`);
    for (const artifact of item.artifactPlan) {
      if (artifact.status === "existing" && artifact.kind !== "review-packet" && !artifact.assetRef) errors.push(`${item.id}: existing ${artifact.kind} artifact requires an assetRef`);
    }
    if (item.reviewStatus === "sme-reviewed" && item.reviewerRoles.length === 0) errors.push(`${item.id}: SME-reviewed package requires reviewer roles`);
    for (const assetRef of item.assetRefs) {
      if (!assetRef.href.startsWith("/")) errors.push(`${item.id}: asset ${assetRef.slug} has an invalid href`);
    }
  }
  return errors;
}
