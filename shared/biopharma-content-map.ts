export type BiopharmaCoverageStatus = "covered-under-review" | "partial" | "not-covered";

export interface BiopharmaCoverageArea {
  id: string;
  decision: string;
  status: BiopharmaCoverageStatus;
  currentLessonSlugs: string[];
  materialGaps: string[];
  requiredReviewerRoles: string[];
  sourceIds: string[];
  nextAsset: string;
}

export const BIOPHARMA_CONTENT_MAP_VERSION = "biopharma-content-map/v1" as const;

/**
 * Product-quality coverage map, not a claim that Atlas can approve a biologics
 * control strategy. Areas remain partial until the listed gaps and review roles
 * are closed with product- and modality-appropriate evidence.
 */
export const BIOPHARMA_CONTENT_MAP: BiopharmaCoverageArea[] = [
  {
    id: "product-process-control-strategy",
    decision: "Connect intended product quality to cell substrate, process, analytical, stability, and lifecycle controls.",
    status: "covered-under-review",
    currentLessonSlugs: ["biopharma-product-process-control-strategy", "biologics-qc-overview"],
    materialGaps: ["No qualified cross-functional review is recorded.", "No real product control-strategy case is available."],
    requiredReviewerRoles: ["biologics CMC", "process development or MSAT", "analytical development", "quality or regulatory CMC"],
    sourceIds: ["ICH-Q5D", "ICH-Q5A-R2", "ICH-Q5C", "ICH-Q5E", "ICH-Q6B", "ICH-Q9-R1", "ICH-Q10"],
    nextAsset: "Product-process evidence map with a fictional completed example and review record.",
  },
  {
    id: "cell-substrate-and-raw-materials",
    decision: "Define cell-bank, substrate, adventitious-agent, and material controls appropriate to the product and process.",
    status: "partial",
    currentLessonSlugs: ["biopharma-cell-line-cell-bank-genetic-stability", "biopharma-raw-ancillary-materials-control", "cell-bank-characterization", "viral-safety-testing"],
    materialGaps: ["Qualified cell-line/construct, cell-bank, raw-material, supplier-quality, SUS/E&L, process/MSAT, analytical/product-quality, viral-safety, validation, quality, and regulatory review is not recorded.", "No real permissioned cell-line/bank or material/SUS change case connects implementation to actual process/product outcomes."],
    requiredReviewerRoles: ["cell-line development and molecular characterization", "cell-bank manufacturing/custody", "virology or viral safety", "raw-material sciences", "supplier quality and supply chain", "single-use systems and E&L/toxicology", "process/MSAT", "analytical/product quality and statistics", "quality or regulatory CMC"],
    sourceIds: ["ICH-Q5D", "ICH-Q5B", "ICH-Q5A-R2", "WHO-TRS-978-ANNEX3", "ICH-Q5E", "ICH-Q6B", "ICH-Q11", "ICH-Q9-R1", "ICH-Q10", "EU-GMP-ANNEX1-2022", "WHO-TRS-996-ANNEX3", "FDA-QUALITY-AGREEMENTS-2016"],
    nextAsset: "Qualified review and real permissioned cell-bank plus material/SUS change cases; no universal tests, production-age/passages, material specifications, E&L limits, or approval shortcuts.",
  },
  {
    id: "upstream-process-control",
    decision: "Relate material attributes and upstream parameters to cell performance and product-quality attributes.",
    status: "partial",
    currentLessonSlugs: ["biopharma-upstream-process-control"],
    materialGaps: ["Qualified upstream/MSAT and analytical review is not recorded.", "No real scale-up, process-characterization, or continued-verification case is available."],
    requiredReviewerRoles: ["upstream process development", "MSAT", "biostatistics or process data science", "quality"],
    sourceIds: ["ICH-Q8-R2", "ICH-Q11", "ICH-Q5D", "ICH-Q6B", "ICH-Q9-R1", "ICH-Q10", "FDA-PROCESS-VALIDATION-2011"],
    nextAsset: "Qualified review and a real, permissioned scale or process-characterization case; no numeric platform ranges without reviewed data.",
  },
  {
    id: "downstream-purification-and-clearance",
    decision: "Balance impurity clearance, recovery, product variants, viral safety, and process robustness across purification.",
    status: "partial",
    currentLessonSlugs: ["biopharma-downstream-purification-clearance", "host-cell-protein-testing", "viral-safety-testing", "aggregation-and-sec"],
    materialGaps: ["Qualified downstream, analytical, viral-safety, quality, and regulatory review is not recorded.", "No real permissioned downstream change, scale-down, resin/membrane lifecycle, or clearance case is available."],
    requiredReviewerRoles: ["downstream process development", "viral safety", "analytical development", "quality"],
    sourceIds: ["ICH-Q8-R2", "ICH-Q11", "ICH-Q5A-R2", "ICH-Q5E", "ICH-Q6B", "ICH-Q9-R1", "ICH-Q10", "FDA-PROCESS-VALIDATION-2011"],
    nextAsset: "Qualified review and a real, permissioned downstream change case; no platform clearance claims without reviewed product/process evidence.",
  },
  {
    id: "process-validation-and-continued-verification",
    decision: "Establish and maintain a validated process state through process knowledge, enabling qualification, PPQ, continued verification, signal assessment and controlled lifecycle learning.",
    status: "partial",
    currentLessonSlugs: ["biopharma-process-validation-continued-verification", "statistical-process-control", "process-validation-stages"],
    materialGaps: ["Qualified process-development/MSAT, manufacturing, validation, engineering/automation/data, analytical/QC, statistics, product-quality, quality and regulatory CMC review is not recorded.", "No real permissioned PPQ-to-CPV, process-drift, monitoring-change or revalidation case connects execution, signals, decisions and actual process/product outcomes."],
    requiredReviewerRoles: ["process development or MSAT", "manufacturing operations", "process validation", "engineering, automation and data integrity", "analytical development or QC", "statistics or process data science", "product quality", "quality or regulatory CMC"],
    sourceIds: ["FDA-PROCESS-VALIDATION-2011", "EMA-BIOLOGICS-PROCESS-VALIDATION-2016", "EU-GMP-ANNEX15-2015", "ICH-Q8-R2", "ICH-Q11", "ICH-Q9-R1", "ICH-Q10", "ICH-Q5E", "ICH-Q6B"],
    nextAsset: "Qualified review and a real permissioned PPQ-to-CPV case; no universal batch count, sampling design, statistical rule, process limit, validation conclusion or authorization.",
  },
  {
    id: "characterization-potency-and-specifications",
    decision: "Choose an orthogonal analytical strategy and justify which attributes belong in characterization, release, stability, or process control.",
    status: "partial",
    currentLessonSlugs: ["biopharma-integrated-analytical-control-strategy", "biopharma-potency-reference-and-orthogonal-characterization", "protein-characterization", "cell-based-potency-assays", "analytical-procedure-lifecycle-q14", "reference-standards-management", "glycosylation-analysis", "aggregation-and-sec", "host-cell-protein-testing"],
    materialGaps: ["Qualified product-quality, analytical, bioassay/statistics, reference-standard, QC, quality, validation, and regulatory review is not recorded.", "No real permissioned analytical-strategy, specification, reference-transition, method-transfer, or comparability case is available.", "Dedicated charge-variant and residual-DNA depth and real reference-transition evidence still require review."],
    requiredReviewerRoles: ["analytical development", "bioassay", "product quality", "regulatory CMC"],
    sourceIds: ["ICH-Q6B", "ICH-Q6-R1-CONCEPT-2024", "ICH-Q2-R2", "ICH-Q14", "ICH-Q5E", "ICH-Q5C", "ICH-Q9-R1", "ICH-Q10", "WHO-IBRS-2026"],
    nextAsset: "Qualified review and a real permissioned analytical strategy or method/reference change case; monitor Q6(R1) without treating revision activity as effective guidance.",
  },
  {
    id: "formulation-fill-finish-and-stability",
    decision: "Protect product quality through formulation, concentration, filtration, filling, container, shipping, and storage.",
    status: "partial",
    currentLessonSlugs: ["biopharma-formulation-fill-finish-stability", "aggregation-and-sec"],
    materialGaps: ["Qualified formulation, fill-finish, analytical, stability, container, quality, validation, and regulatory review is not recorded.", "No real permissioned formulation, fill-finish, container, shipping, storage, or stability change case is available."],
    requiredReviewerRoles: ["formulation development", "fill-finish or process engineering", "stability", "analytical development", "container-closure engineering", "quality or regulatory CMC"],
    sourceIds: ["ICH-Q5C", "ICH-Q1A-R2", "ICH-Q1B", "ICH-Q6B", "ICH-Q5E", "ICH-Q8-R2", "ICH-Q9-R1", "ICH-Q10", "EU-GMP-ANNEX1-2022", "FDA-CONTAINER-CLOSURE-1999", "FDA-CCS-VIAL-STOPPER-2024"],
    nextAsset: "Qualified review and a real permissioned formulation, presentation, or stability change case; monitor the consolidated ICH Q1 revision without treating the draft as effective guidance.",
  },
  {
    id: "comparability-tech-transfer-and-lifecycle",
    decision: "Determine the evidence required after process, site, scale, formulation, method, or container change.",
    status: "partial",
    currentLessonSlugs: ["biopharma-integrated-technology-transfer", "biopharma-manufacturing-comparability", "analytical-method-transfer", "biopharma-product-process-control-strategy"],
    materialGaps: ["The integrated technology-transfer and ICH Q5E content has no qualified cross-functional review.", "No real permissioned biologics transfer case connects execution, corrections, acceptance, continued verification, and actual outcomes.", "The comparability workflow still lacks a dedicated completed working package."],
    requiredReviewerRoles: ["biologics CMC or product quality", "MSAT or technology transfer", "manufacturing operations", "engineering or automation", "analytical development and QC", "validation", "supply chain or materials", "regulatory CMC", "quality"],
    sourceIds: ["WHO-TRS-1044-ANNEX4", "ICH-Q5E", "ICH-Q8-R2", "ICH-Q11", "ICH-Q6B", "ICH-Q5C", "ICH-Q2-R2", "ICH-Q14", "ICH-Q9-R1", "ICH-Q10", "FDA-PROCESS-VALIDATION-2011"],
    nextAsset: "Qualified review and a real permissioned site-transfer case, plus a dedicated comparability working package with pre-change/post-change traceability.",
  },
  {
    id: "advanced-modalities",
    decision: "Identify when protein-biologics reasoning is insufficient for a different modality.",
    status: "not-covered",
    currentLessonSlugs: [],
    materialGaps: ["Cell and gene therapy, viral vectors, mRNA, vaccines, plasma-derived products, ADCs, and oligonucleotides do not have modality-specific coverage."],
    requiredReviewerRoles: ["modality-specific CMC", "manufacturing sciences", "analytical development", "regulatory CMC", "quality"],
    sourceIds: [],
    nextAsset: "Do not publish a generic advanced-modality pack; first establish demand, source corpus, reviewer appointment, and validation cases.",
  },
];

export function getBiopharmaCoverage(id: string): BiopharmaCoverageArea | undefined {
  return BIOPHARMA_CONTENT_MAP.find((area) => area.id === id);
}

export function summarizeBiopharmaCoverage() {
  return BIOPHARMA_CONTENT_MAP.reduce<Record<BiopharmaCoverageStatus, number>>(
    (summary, area) => {
      summary[area.status] += 1;
      return summary;
    },
    { "covered-under-review": 0, partial: 0, "not-covered": 0 },
  );
}
