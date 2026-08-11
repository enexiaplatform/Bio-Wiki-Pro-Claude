export const MANUFACTURING_QUALITY_PORTFOLIO_VERSION = "manufacturing-quality-portfolio/v2" as const;

export type PortfolioLaneId = "pharma-api" | "pharma-drug-product" | "biopharma" | "cross-cutting-quality-rd";
export type PortfolioCoverageStatus = "covered-under-review" | "partial" | "not-covered";
export type PortfolioFunction = "research-and-development" | "process-development" | "manufacturing-science" | "quality-control" | "quality-and-regulatory";

export interface PortfolioCoverageArea {
  id: string;
  title: string;
  decision: string;
  functions: PortfolioFunction[];
  status: PortfolioCoverageStatus;
  currentLessonSlugs: string[];
  currentAssetIds: string[];
  sourceIds: string[];
  decisionPackageIds: string[];
  materialGaps: string[];
  requiredReviewerRoles: string[];
  nextAsset: string;
}

export interface ManufacturingQualityPortfolioLane {
  id: PortfolioLaneId;
  title: string;
  scope: string;
  compilerDomainPackReady: false;
  areas: PortfolioCoverageArea[];
}

export const MANUFACTURING_QUALITY_PORTFOLIO: ManufacturingQualityPortfolioLane[] = [
  {
    id: "pharma-api",
    title: "Pharma API Development, Manufacture and Control",
    scope: "Small-molecule drug-substance work from route and starting-material understanding through reaction, work-up, isolation, solid-state control, impurity strategy, analytical control, validation, stability, transfer and lifecycle change.",
    compilerDomainPackReady: false,
    areas: [
      {
        id: "route-starting-materials-and-inputs",
        title: "Route, starting materials and input controls",
        decision: "Define the process and input evidence needed to justify the proposed commercial drug-substance boundary and starting-material controls.",
        functions: ["research-and-development", "process-development", "quality-and-regulatory"],
        status: "covered-under-review",
        currentLessonSlugs: ["pharma-api-starting-materials-input-control", "pharma-api-process-development-impurity-control", "supplier-qualification"],
        currentAssetIds: ["pharma-api-starting-material-input-control", "pharma-api-impurity-control"],
        sourceIds: ["ICH-Q11", "ICH-Q11-QA", "ICH-Q7", "ICH-Q7-QA", "ICH-Q9-R1", "ICH-Q10", "FDA-QUALITY-AGREEMENTS-2016"], decisionPackageIds: ["pharma-api-route-inputs-suppliers"],
        materialGaps: ["No qualified synthetic-process, API CMC, supplier-quality and regulatory review is recorded.", "No permissioned real route or starting-material justification case is available."],
        requiredReviewerRoles: ["synthetic process development", "API regulatory CMC", "supplier quality", "quality"],
        nextAsset: "A reviewed starting-material and raw-material control case connected to the exact route, suppliers, specifications and lifecycle commitments.",
      },
      {
        id: "reaction-workup-isolation-and-solid-state",
        title: "Reaction, work-up, isolation and solid-state process",
        decision: "Connect transformations, work-up, crystallization, isolation, drying, milling and hold steps to material attributes, process performance and drug-substance quality.",
        functions: ["research-and-development", "process-development", "manufacturing-science", "quality-control"],
        status: "covered-under-review",
        currentLessonSlugs: ["pharma-api-full-lifecycle-drug-substance-control", "pharma-api-reaction-workup-scale-up", "pharma-api-process-development-impurity-control", "pharma-api-isolation-solid-state-control", "process-validation-stages"],
        currentAssetIds: ["pharma-api-reaction-scale-up", "pharma-api-impurity-control"],
        sourceIds: ["ICH-Q8-R2", "ICH-Q11", "ICH-Q9-R1", "FDA-PROCESS-VALIDATION-2011"], decisionPackageIds: ["pharma-api-reaction-workup-scale-up"],
        materialGaps: ["No qualified chemical-engineering, crystallization/solid-state, scale-up, manufacturing or validation review is recorded.", "No real scale-up, isolation, drying, milling or hold-time case connects development evidence to actual outcomes."],
        requiredReviewerRoles: ["synthetic process development", "chemical or process engineering", "solid-state science", "manufacturing science", "process validation"],
        nextAsset: "A product-specific unit-operation and scale-up evidence map; no generic recipe, operating range, endpoint, hold time or solid-form conclusion.",
      },
      {
        id: "impurity-fate-purge-and-control-strategy",
        title: "Impurity fate, purge and control strategy",
        decision: "Trace actual and potential impurities from origin through observed fate, analytical capability and justified control placement without treating a calculated ratio as a transferable purge claim.",
        functions: ["research-and-development", "process-development", "manufacturing-science", "quality-control", "quality-and-regulatory"],
        status: "covered-under-review",
        currentLessonSlugs: ["pharma-api-process-development-impurity-control", "nitrosamine-impurity-control", "residual-solvents-q3c", "elemental-impurities-q3d"],
        currentAssetIds: ["pharma-api-impurity-control"],
        sourceIds: ["ICH-Q3A-R2", "ICH-Q3C-R9", "ICH-Q3D-R2", "ICH-M7-R2", "ICH-Q6A", "ICH-Q11", "ICH-Q2-R2", "ICH-Q14", "ICH-Q9-R1"], decisionPackageIds: ["pharma-api-isolation-solid-state-impurity"],
        materialGaps: ["Qualified process chemistry, analytical development, toxicology, QC, quality and API regulatory CMC review is not recorded.", "No permissioned real impurity fate/purge investigation links process observations, analytical capability, control decisions and actual commercial outcomes."],
        requiredReviewerRoles: ["process chemistry", "analytical development", "toxicology or impurity safety", "quality control", "quality", "API regulatory CMC"],
        nextAsset: "Qualified review and a real permissioned impurity-control case; no universal purge factor, acceptable intake, specification or filing conclusion.",
      },
      {
        id: "analytical-specifications-stability-and-lifecycle",
        title: "Analytical, specifications, stability, validation and lifecycle",
        decision: "Maintain a justified analytical and specification strategy through validation, stability, transfer, process verification and post-approval change.",
        functions: ["process-development", "manufacturing-science", "quality-control", "quality-and-regulatory"],
        status: "covered-under-review",
        currentLessonSlugs: ["pharma-api-full-lifecycle-drug-substance-control", "pharma-api-analytical-specification-lifecycle", "pharma-api-process-validation-commercial-lifecycle", "analytical-procedure-lifecycle-q14", "analytical-method-validation", "analytical-method-transfer", "stability-studies", "retest-period-shelf-life", "process-validation-stages", "technology-transfer"],
        currentAssetIds: ["pharma-api-analytical-lifecycle"],
        sourceIds: ["ICH-Q1A-R2", "ICH-Q2-R2", "ICH-Q6A", "ICH-Q7", "ICH-Q10", "ICH-Q14", "FDA-ANALYTICAL-PROCEDURES-2015", "FDA-PROCESS-VALIDATION-2011", "WHO-TRS-1044-ANNEX4"], decisionPackageIds: ["pharma-api-analytical-lifecycle"],
        materialGaps: ["The API-specific lifecycle package remains under review and requires qualified analytical, stability, validation and regulatory review.", "No real API method, specification, stability, validation or site-transfer case is available."],
        requiredReviewerRoles: ["API analytical development", "quality control", "stability", "process validation", "technology transfer", "quality", "regulatory CMC"],
        nextAsset: "Qualified review and a real API method lifecycle or transfer case connected to a defined drug substance, process version and filing basis.",
      },
    ],
  },
  {
    id: "pharma-drug-product",
    title: "Pharma Drug Product Development, Manufacture and Control",
    scope: "Formulation and finished-dose development through material attributes, unit operations, scale-up, process controls, validation, release, stability, packaging, transfer and lifecycle change.",
    compilerDomainPackReady: false,
    areas: [
      {
        id: "formulation-and-material-attributes",
        title: "Formulation and material attributes",
        decision: "Connect product performance and manufacturability to the formulation, API/excipient attributes and container presentation.",
        functions: ["research-and-development", "process-development", "quality-control", "quality-and-regulatory"],
        status: "covered-under-review",
        currentLessonSlugs: ["drug-product-formulation-material-attributes"], currentAssetIds: ["drug-product-formulation-material-attributes"], sourceIds: ["ICH-Q8-R2", "ICH-Q9-R1", "ICH-Q10"], decisionPackageIds: ["drug-product-formulation-material-attributes"],
        materialGaps: ["The OSD example is synthetic and no qualified dosage-form or product-specific formulation review is recorded."],
        requiredReviewerRoles: ["formulation development", "material science", "biopharmaceutics", "analytical development", "regulatory CMC"],
        nextAsset: "Demand-led dosage-form scope and reviewer appointment before creating a formulation Domain Pack or recommendation engine.",
      },
      {
        id: "unit-operations-scale-up-and-process-control",
        title: "Unit operations, scale-up and process control",
        decision: "Translate development understanding into a controllable commercial process across equipment, scale, hold, sampling and process-monitoring boundaries.",
        functions: ["process-development", "manufacturing-science", "quality-control", "quality-and-regulatory"],
        status: "covered-under-review",
        currentLessonSlugs: ["drug-product-unit-operations-scale-up", "process-validation-stages", "statistical-process-control", "equipment-qualification"], currentAssetIds: ["drug-product-unit-operations-scale-up"],
        sourceIds: ["ICH-Q8-R2", "ICH-Q9-R1", "ICH-Q10", "FDA-PROCESS-VALIDATION-2011"], decisionPackageIds: ["drug-product-unit-operations-scale-up"],
        materialGaps: ["The OSD example remains synthetic and qualified process, engineering, statistics and validation review is not recorded."],
        requiredReviewerRoles: ["drug-product process development", "manufacturing science", "equipment engineering", "statistics", "process validation"],
        nextAsset: "A dosage-form-specific unit-operation and scale-up evidence map selected from demonstrated demand.",
      },
      {
        id: "analytical-release-stability-and-packaging",
        title: "Analytical, release, stability and packaging",
        decision: "Justify the release, performance, stability and container controls for the complete drug product presentation.",
        functions: ["research-and-development", "quality-control", "quality-and-regulatory"],
        status: "covered-under-review",
        currentLessonSlugs: ["drug-product-analytical-release-stability", "dissolution-testing-usp-711", "stability-studies", "ongoing-stability-program", "container-closure-integrity", "extractables-and-leachables"], currentAssetIds: ["drug-product-analytical-release-stability"],
        sourceIds: ["ICH-Q1A-R2", "ICH-Q2-R2", "ICH-Q6A", "ICH-Q14", "FDA-CONTAINER-CLOSURE-1999"], decisionPackageIds: ["drug-product-analytical-release-stability-packaging"],
        materialGaps: ["The OSD example remains synthetic and qualified analytical, stability, packaging and regulatory review is not recorded."],
        requiredReviewerRoles: ["drug-product analytical development", "quality control", "stability", "packaging or container engineering", "regulatory CMC"],
        nextAsset: "A dosage-form-specific product-performance and stability case with current compendial and filing boundaries.",
      },
      {
        id: "validation-transfer-and-lifecycle",
        title: "Validation, transfer and lifecycle change",
        decision: "Demonstrate receiving-unit capability and maintain the validated process and product control strategy through change.",
        functions: ["process-development", "manufacturing-science", "quality-control", "quality-and-regulatory"],
        status: "covered-under-review",
        currentLessonSlugs: ["drug-product-validation-transfer-lifecycle", "technology-transfer", "analytical-method-transfer", "process-validation-stages", "change-control"], currentAssetIds: ["drug-product-validation-transfer-lifecycle"],
        sourceIds: ["WHO-TRS-1044-ANNEX4", "ICH-Q9-R1", "ICH-Q10", "FDA-PROCESS-VALIDATION-2011"], decisionPackageIds: ["drug-product-validation-transfer-lifecycle"],
        materialGaps: ["The OSD example remains synthetic and qualified transfer, validation, quality and regulatory review is not recorded."],
        requiredReviewerRoles: ["technology transfer", "manufacturing operations", "engineering", "analytical development and QC", "validation", "quality", "regulatory CMC"],
        nextAsset: "A real permissioned receiving-site transfer case before any dosage-form-specific operational pack is featured.",
      },
    ],
  },
  {
    id: "biopharma",
    title: "Biopharma Product and Process Quality",
    scope: "Protein-biologics lifecycle from cell substrate and materials through upstream, downstream, formulation/fill-finish, analytics, validation, comparability, transfer and lifecycle control.",
    compilerDomainPackReady: false,
    areas: [
      {
        id: "cell-substrate-materials-and-upstream", title: "Cell substrate, materials and upstream", decision: "Connect the production substrate, material chain and upstream process to product-quality evidence.",
        functions: ["research-and-development", "process-development", "manufacturing-science", "quality-control", "quality-and-regulatory"], status: "covered-under-review",
        currentLessonSlugs: ["biopharma-full-lifecycle-product-process-orchestration", "biopharma-cell-line-cell-bank-genetic-stability", "biopharma-raw-ancillary-materials-control", "biopharma-upstream-process-control"], currentAssetIds: ["biopharma-cell-substrate-control", "biopharma-materials-control", "biopharma-upstream-control"],
        sourceIds: ["ICH-Q5B", "ICH-Q5D", "ICH-Q8-R2", "ICH-Q11", "ICH-Q9-R1"], decisionPackageIds: ["biopharma-cell-materials-upstream"], materialGaps: ["Qualified review and real permissioned cases are absent."], requiredReviewerRoles: ["cell-line development", "upstream process development", "materials science", "analytical development", "quality", "regulatory CMC"], nextAsset: "Qualified review and actual cell-bank/material/upstream change evidence.",
      },
      {
        id: "downstream-product-analytics-and-formulation", title: "Downstream, product analytics and formulation", decision: "Connect purification, clearance, product variants, potency, formulation and stability to the total control strategy.",
        functions: ["research-and-development", "process-development", "manufacturing-science", "quality-control", "quality-and-regulatory"], status: "covered-under-review",
        currentLessonSlugs: ["biopharma-full-lifecycle-product-process-orchestration", "biopharma-downstream-purification-clearance", "biopharma-integrated-analytical-control-strategy", "biopharma-potency-reference-and-orthogonal-characterization", "biopharma-formulation-fill-finish-stability"], currentAssetIds: ["biopharma-downstream-clearance", "biopharma-analytical-control-strategy", "biopharma-formulation-stability"],
        sourceIds: ["ICH-Q5A-R2", "ICH-Q5C", "ICH-Q5E", "ICH-Q6B", "ICH-Q9-R1"], decisionPackageIds: ["biopharma-downstream-analytics-formulation"], materialGaps: ["Qualified review and real permissioned downstream, analytical and formulation cases are absent."], requiredReviewerRoles: ["downstream process development", "product quality", "analytical development", "formulation development", "quality", "regulatory CMC"], nextAsset: "Qualified reviews and actual product/process outcome evidence.",
      },
      {
        id: "validation-comparability-transfer-and-lifecycle", title: "Validation, comparability, transfer and lifecycle", decision: "Maintain product/process knowledge and validated control through execution, monitoring, transfer and change.",
        functions: ["process-development", "manufacturing-science", "quality-control", "quality-and-regulatory"], status: "covered-under-review",
        currentLessonSlugs: ["biopharma-process-validation-continued-verification", "biopharma-manufacturing-comparability", "biopharma-integrated-technology-transfer"], currentAssetIds: ["biopharma-process-validation-cpv", "biopharma-technology-transfer"],
        sourceIds: ["ICH-Q5E", "ICH-Q10", "ICH-Q11", "FDA-PROCESS-VALIDATION-2011", "WHO-TRS-1044-ANNEX4"], decisionPackageIds: ["biopharma-validation-comparability-transfer"], materialGaps: ["No qualified review or real permissioned validation/comparability/transfer case closes the lifecycle loop."], requiredReviewerRoles: ["MSAT", "validation", "technology transfer", "manufacturing", "quality", "regulatory CMC"], nextAsset: "Real engagements with corrections, acceptance and actual outcomes.",
      },
      {
        id: "advanced-modalities", title: "Advanced modalities", decision: "Determine when protein-biologics evidence cannot be transferred to a different modality.",
        functions: ["research-and-development", "process-development", "manufacturing-science", "quality-control", "quality-and-regulatory"], status: "not-covered", currentLessonSlugs: [], currentAssetIds: [], sourceIds: [], decisionPackageIds: [], materialGaps: ["Cell and gene therapies, viral vectors, mRNA, vaccines, plasma products, ADCs and oligonucleotides require modality-specific scope and reviewers."], requiredReviewerRoles: ["modality-specific CMC", "manufacturing science", "analytical development", "quality", "regulatory CMC"], nextAsset: "Do not generalize the protein-biologics package; establish demand, sources, reviewers and validation cases first.",
      },
    ],
  },
  {
    id: "cross-cutting-quality-rd",
    title: "Cross-cutting Quality and R&D Systems",
    scope: "Reusable decision systems spanning analytical lifecycle, statistics, quality risk, investigations, knowledge management, transfer, validation and regulatory CMC.",
    compilerDomainPackReady: false,
    areas: [
      {
        id: "analytical-development-and-lifecycle", title: "Analytical development and lifecycle", decision: "Define the analytical question, performance evidence, transfer and lifecycle controls before results support a decision.", functions: ["research-and-development", "process-development", "quality-control", "quality-and-regulatory"], status: "covered-under-review", currentLessonSlugs: ["analytical-procedure-lifecycle-q14", "analytical-method-validation", "analytical-method-transfer", "measurement-systems-analysis"], currentAssetIds: ["analytical-lifecycle-evidence-map"], sourceIds: ["ICH-Q2-R2", "ICH-Q14", "ICH-Q9-R1", "ICH-Q10"], decisionPackageIds: ["pharma-api-analytical-lifecycle", "drug-product-analytical-release-stability-packaging", "cross-cutting-evidence-governance"], materialGaps: ["Qualified cross-modality analytical, measurement-science, QC, validation and regulatory review is not recorded.", "No permissioned real analytical lifecycle or transfer case is available."], requiredReviewerRoles: ["analytical development", "statistics", "quality control", "validation", "regulatory CMC"], nextAsset: "Qualified review and a permissioned analytical lifecycle case; no universal ATP, method, criterion or transfer conclusion.",
      },
      {
        id: "statistics-data-and-process-understanding", title: "Statistics, data and process understanding", decision: "Choose analysis that matches the decision, measurement system, data structure and uncertainty.", functions: ["research-and-development", "process-development", "manufacturing-science", "quality-control"], status: "covered-under-review", currentLessonSlugs: ["statistical-process-control", "measurement-systems-analysis", "data-integrity-deep-dive", "decision-led-doe-and-multivariate-process-evidence"], currentAssetIds: ["decision-led-statistics-evidence-map"], sourceIds: ["ICH-Q8-R2", "ICH-Q9-R1", "ICH-Q10", "FDA-DI-2018", "FDA-PROCESS-VALIDATION-2011"], decisionPackageIds: ["cross-cutting-evidence-governance"], materialGaps: ["Qualified applied-statistics, domain, measurement-system, data-integrity and quality review is not recorded.", "No permissioned real DoE or multivariate case with accountable outcomes is available."], requiredReviewerRoles: ["applied statistics", "process data science", "data integrity", "domain scientist"], nextAsset: "Qualified review and a real decision-led DoE or process-data case without generic model acceptance rules.",
      },
      {
        id: "quality-systems-investigations-and-change", title: "Quality systems, investigations and change", decision: "Move signals and changes through evidence, investigation, action, effectiveness and accountable decision pathways.", functions: ["manufacturing-science", "quality-control", "quality-and-regulatory"], status: "covered-under-review", currentLessonSlugs: ["oos-investigation-deep-dive", "deviation-management", "capa-fundamentals", "change-control", "pharmaceutical-quality-system-q10"], currentAssetIds: ["oos-investigation-template", "gmp-audit-kit"], sourceIds: ["FDA-OOS-2022", "ICH-Q9-R1", "ICH-Q10"], decisionPackageIds: ["cross-cutting-evidence-governance"], materialGaps: ["No permissioned end-to-end investigation-to-effectiveness case is available across API, drug product and Biopharma.", "Qualified cross-product quality, data-integrity and regulatory review remains open."], requiredReviewerRoles: ["quality control", "quality assurance", "manufacturing science", "data integrity", "regulatory CMC"], nextAsset: "Real cases that preserve corrections, disposition, change and effectiveness evidence.",
      },
    ],
  },
];

export function getPortfolioLane(id: PortfolioLaneId) {
  return MANUFACTURING_QUALITY_PORTFOLIO.find((lane) => lane.id === id);
}

export function summarizeManufacturingQualityPortfolio() {
  return MANUFACTURING_QUALITY_PORTFOLIO.flatMap((lane) => lane.areas).reduce<Record<PortfolioCoverageStatus, number>>((summary, area) => {
    summary[area.status] += 1;
    return summary;
  }, { "covered-under-review": 0, partial: 0, "not-covered": 0 });
}
