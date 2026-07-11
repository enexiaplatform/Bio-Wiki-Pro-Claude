import type { EvidenceRecord, RuleTrace } from "./quality-lab-contract";

export const MICROBIOLOGY_DOMAIN_PACK = {
  id: "nonsterile-pharma-microbiology",
  version: "microbiology-pack/v1.1",
  status: "concept" as const,
  scope: "Non-sterile pharmaceutical microbiology with optional concept-only adjacent capabilities",
};

export const MICROBIOLOGY_EVIDENCE_CATALOG: EvidenceRecord[] = [
  {
    id: "project-inputs",
    title: "Project facts supplied through the Atlas intake",
    kind: "project-input",
    publisher: "Project owner",
    version: "Current project revision",
    locator: "Blueprint input snapshot",
    status: "user-supplied",
    scope: "Facility, markets, portfolio, demand, operating calendar, growth, outsourcing, and planning assumptions",
    limitations: "Atlas does not independently verify user-supplied facts in the concept edition.",
  },
  {
    id: "atlas-microbiology-benchmarks-v1",
    title: "Atlas Microbiology Concept Benchmark Set",
    kind: "benchmark",
    publisher: "Life Science Atlas",
    version: "v1.1 · 2026-07",
    locator: "Microbiology Domain Pack rule registry",
    status: "internal-concept",
    scope: "Hands-on time, media demand, plate-days, utilization, space, cost, and productivity allowances",
    limitations: "Uncalibrated concept assumptions; replace with approved methods, time studies, vendor data, and local cost evidence.",
  },
  {
    id: "usp-61-context",
    title: "USP <61> Microbiological Examination of Nonsterile Products: Microbial Enumeration Tests",
    kind: "regulatory-context",
    publisher: "United States Pharmacopeia",
    version: "Current applicable edition must be confirmed",
    locator: "https://www.usp.org/harmonization-standards/pdg/general-methods/microbial-examination",
    status: "public-reference",
    scope: "Context for non-sterile enumeration capability and method dependencies",
    limitations: "This reference does not validate Atlas workload, capacity, equipment, cost, or site-applicability assumptions.",
  },
  {
    id: "usp-62-context",
    title: "USP <62> Microbiological Examination of Nonsterile Products: Tests for Specified Microorganisms",
    kind: "regulatory-context",
    publisher: "United States Pharmacopeia",
    version: "Current applicable edition must be confirmed",
    locator: "https://www.usp.org/harmonization-standards/pdg/general-methods/microbial-examination",
    status: "public-reference",
    scope: "Context for specified-organism capability and method dependencies",
    limitations: "Product-specific applicability, registered specifications, suitability, and current text require qualified review.",
  },
  {
    id: "eu-gmp-annex-1-2022",
    title: "EU GMP Annex 1 — Manufacture of Sterile Medicinal Products",
    kind: "regulatory-context",
    publisher: "European Commission",
    version: "2022",
    locator: "https://health.ec.europa.eu/medicinal-products/eudralex/eudralex-volume-4_en",
    status: "public-reference",
    scope: "Context when sterile operations, environmental monitoring, or contamination-control dependencies are selected",
    limitations: "Annex 1 context does not constitute a site CCS, facility design, monitoring program, or approved interpretation.",
  },
  {
    id: "site-approved-methods",
    title: "Approved product specifications, methods, sampling plans, and SOPs",
    kind: "site-document",
    publisher: "Client quality system",
    version: "Current approved revisions",
    locator: "To be supplied during expert review",
    status: "site-evidence-required",
    scope: "Authoritative product-by-market test requirements, frequencies, method steps, controls, and actual durations",
    limitations: "Not available to the concept engine; required before design freeze or controlled procurement outputs.",
  },
  {
    id: "vendor-budget-evidence",
    title: "Local vendor budget quotations and utility requirements",
    kind: "site-document",
    publisher: "Qualified vendors",
    version: "Current project budget cycle",
    locator: "To be obtained after vendor-neutral requirements are reviewed",
    status: "site-evidence-required",
    scope: "Equipment configuration, lead time, installed cost, maintenance, utilities, consumables, and service coverage",
    limitations: "Not available to the concept engine; Atlas cost bands are not quotations.",
  },
];

export type MicrobiologyWorkflowKey = "rawMaterials" | "finishedProducts" | "water" | "environmentalMonitoring" | "sterility" | "endotoxin" | "bioburden" | "growthPromotion";

export interface MicrobiologyWorkflowRule {
  id: string;
  ruleId: string;
  label: string;
  hours: number;
  plateDays: number;
  media: number;
  tat: number;
  criticality: "routine" | "important" | "critical";
  confidence: "high" | "medium" | "indicative";
  evidenceIds: string[];
  applicability: string;
  limitations: string;
}

export const MICROBIOLOGY_WORKFLOW_RULES: Record<MicrobiologyWorkflowKey, MicrobiologyWorkflowRule> = {
  rawMaterials: { id: "raw-material-micro", ruleId: "micro.workflow.raw-materials", label: "Raw-material microbiology", hours: 3.2, plateDays: 36, media: 0.32, tat: 5, criticality: "important", confidence: "indicative", evidenceIds: ["project-inputs", "atlas-microbiology-benchmarks-v1", "site-approved-methods"], applicability: "Selected in-house raw-material microbiology with monthly incoming-lot demand", limitations: "One modeled unit per lot; actual specifications, skip-lot rules, preparation, replicates, and controls are unknown." },
  finishedProducts: { id: "finished-product-mlt", ruleId: "micro.workflow.finished-products", label: "Finished-product microbial limits", hours: 4.2, plateDays: 46, media: 0.45, tat: 5, criticality: "critical", confidence: "indicative", evidenceIds: ["project-inputs", "atlas-microbiology-benchmarks-v1", "usp-61-context", "usp-62-context", "site-approved-methods"], applicability: "Selected in-house non-sterile finished-product microbiology with monthly batch demand", limitations: "One modeled unit per batch; product families, sample count, method suitability, specified organisms, and registered specifications are unknown." },
  water: { id: "water-microbiology", ruleId: "micro.workflow.water", label: "Pharmaceutical water microbiology", hours: 0.85, plateDays: 10, media: 0.12, tat: 5, criticality: "critical", confidence: "indicative", evidenceIds: ["project-inputs", "atlas-microbiology-benchmarks-v1", "site-approved-methods"], applicability: "Selected in-house water testing using points × weekly rounds × 4.33", limitations: "Water grades, point criticality, sample volumes, method, alert/action levels, and investigation workload are unknown." },
  environmentalMonitoring: { id: "environmental-monitoring", ruleId: "micro.workflow.environmental-monitoring", label: "Environmental monitoring", hours: 0.65, plateDays: 9, media: 0.08, tat: 5, criticality: "critical", confidence: "indicative", evidenceIds: ["project-inputs", "atlas-microbiology-benchmarks-v1", "eu-gmp-annex-1-2022", "site-approved-methods"], applicability: "Selected in-house EM using locations × weekly rounds × 4.33", limitations: "Monitoring methods, grades, shifts, interventions, personnel counts, incubation strategy, reading, trending, and excursions are unknown." },
  sterility: { id: "sterility-testing", ruleId: "micro.workflow.sterility", label: "Sterility testing", hours: 6, plateDays: 0, media: 0.5, tat: 14, criticality: "critical", confidence: "indicative", evidenceIds: ["project-inputs", "atlas-microbiology-benchmarks-v1", "eu-gmp-annex-1-2022", "site-approved-methods"], applicability: "Optional concept-only sterility scope with monthly batch demand", limitations: "Product presentations, method, batch grouping, isolator cycle, transfers, controls, and investigation burden are unknown; specialist review is mandatory." },
  endotoxin: { id: "bacterial-endotoxin", ruleId: "micro.workflow.endotoxin", label: "Bacterial endotoxin testing", hours: 1.6, plateDays: 0, media: 0, tat: 1, criticality: "critical", confidence: "indicative", evidenceIds: ["project-inputs", "atlas-microbiology-benchmarks-v1", "site-approved-methods"], applicability: "Optional in-house endotoxin scope with explicit monthly sample demand", limitations: "Method, product limits, MVD, interference, replicates, standards, controls, and platform are unknown." },
  bioburden: { id: "bioburden", ruleId: "micro.workflow.bioburden", label: "Bioburden testing", hours: 1.8, plateDays: 12, media: 0.16, tat: 5, criticality: "critical", confidence: "indicative", evidenceIds: ["project-inputs", "atlas-microbiology-benchmarks-v1", "site-approved-methods"], applicability: "Optional in-house bioburden scope with explicit monthly sample demand", limitations: "Matrices, sample preparation, filtration/plating, replicates, controls, limits, and method suitability are unknown." },
  growthPromotion: { id: "growth-promotion", ruleId: "micro.workflow.growth-promotion", label: "Growth-promotion testing", hours: 4, plateDays: 28, media: 1, tat: 5, criticality: "important", confidence: "indicative", evidenceIds: ["project-inputs", "atlas-microbiology-benchmarks-v1", "site-approved-methods"], applicability: "Selected in-house media QC with monthly media-lot demand", limitations: "Media types, container counts, organisms, negative controls, inoculum preparation, and supplier qualification strategy are unknown." },
};

export const MICROBIOLOGY_SHARED_RULE_TRACE: RuleTrace[] = [
  {
    ruleId: "core.capacity.people",
    ruleVersion: "v1.0",
    name: "Analyst and reviewer capacity model",
    domainPackId: MICROBIOLOGY_DOMAIN_PACK.id,
    outputTypes: ["staffing", "opex", "risk"],
    evidenceIds: ["project-inputs", "atlas-microbiology-benchmarks-v1", "site-approved-methods"],
    applicability: "All compiled projects with positive in-house hands-on demand",
    confidence: "indicative",
    limitations: "Uses aggregate productive hours and a reviewer ratio; does not schedule skills, shifts, leave, training, investigations, or method-specific queues.",
    reviewRequired: true,
  },
  {
    ruleId: "core.capacity.equipment",
    ruleVersion: "v1.0",
    name: "Equipment capacity and redundancy sizing",
    domainPackId: MICROBIOLOGY_DOMAIN_PACK.id,
    outputTypes: ["equipment", "capex", "space"],
    evidenceIds: ["project-inputs", "atlas-microbiology-benchmarks-v1", "site-approved-methods", "vendor-budget-evidence"],
    applicability: "Selected in-house capabilities with positive modeled demand",
    confidence: "indicative",
    limitations: "Uses class-level throughput and utilization allowances; final quantity requires approved methods, load patterns, cycle data, qualification downtime, utilities, and business-continuity review.",
    reviewRequired: true,
  },
  {
    ruleId: "core.cost.concept",
    ruleVersion: "v1.0",
    name: "Concept CAPEX and OPEX bands",
    domainPackId: MICROBIOLOGY_DOMAIN_PACK.id,
    outputTypes: ["capex", "opex", "consumables"],
    evidenceIds: ["project-inputs", "atlas-microbiology-benchmarks-v1", "vendor-budget-evidence"],
    applicability: "All concept scenarios",
    confidence: "indicative",
    limitations: "2026 USD planning allowances exclude taxes, freight, installation complexity, construction, validation, data systems, local labor structure, inflation, and negotiated terms.",
    reviewRequired: true,
  },
  {
    ruleId: "core.space.concept",
    ruleVersion: "v1.0",
    name: "Concept space allowance",
    domainPackId: MICROBIOLOGY_DOMAIN_PACK.id,
    outputTypes: ["space"],
    evidenceIds: ["project-inputs", "atlas-microbiology-benchmarks-v1", "site-approved-methods"],
    applicability: "All projects with selected in-house capabilities",
    confidence: "indicative",
    limitations: "Not a layout or engineering design; zoning, HVAC, utilities, flows, biosafety, accessibility, fire, structural, and local-code requirements are excluded.",
    reviewRequired: true,
  },
];

export function workflowRuleTrace(keys: MicrobiologyWorkflowKey[]): RuleTrace[] {
  return keys.map((key) => {
    const rule = MICROBIOLOGY_WORKFLOW_RULES[key];
    return {
      ruleId: rule.ruleId,
      ruleVersion: "v1.1",
      name: rule.label,
      domainPackId: MICROBIOLOGY_DOMAIN_PACK.id,
      outputTypes: ["workflow-demand", "turnaround", "consumables"],
      evidenceIds: rule.evidenceIds,
      applicability: rule.applicability,
      confidence: rule.confidence,
      limitations: rule.limitations,
      reviewRequired: true,
    };
  });
}
