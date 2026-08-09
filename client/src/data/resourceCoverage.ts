import type { RegulatoryDomain } from "@shared/regulatory-monitor";

import type { BlueprintDecisionId } from "./atlasEvidenceGraph";
import { getWorkflowSystem, type WorkflowSystem, type WorkflowSystemStage } from "./workflowSystems";

export const RESOURCE_COVERAGE_CONTRACT_VERSION = "resource-coverage/v2" as const;

export type ResourceArea = "methods" | "monitor" | "workflows" | "academy" | "tools" | "toolkits" | "compliance";
export type ResourceKind = "workflow" | "lesson" | "tool" | "toolkit" | "method" | "monitor" | "compliance";
export type ResourceCoverageStatus = "mapped" | "evidence-required" | "specialist-review-required" | "no-current-change";

export interface StageCoverageRule {
  systemId: string;
  stageId: string;
  methodTitle: string;
  complianceTitle: string;
  sourceIds: string[];
  monitorDomains: RegulatoryDomain[];
  decisionIds: BlueprintDecisionId[];
  reviewerRole: string;
}

export interface StageCoverageProfile {
  key: string;
  contractVersion: typeof RESOURCE_COVERAGE_CONTRACT_VERSION;
  area: "methods" | "compliance" | "monitor";
  kind: "method" | "compliance" | "monitor";
  slug: string;
  title: string;
  href: string;
  systemId: string;
  stageId: string;
  coverageStatus: ResourceCoverageStatus;
  sourceIds: string[];
  decisionIds: BlueprintDecisionId[];
  reviewRequired: true;
  reviewerRole: string;
  purpose: string;
  applicability: string;
  limitations: string;
  monitorDomains: RegulatoryDomain[];
}

const coreSources = ["ICH-Q9-R1", "ICH-Q10"];
const biopharmaSources = ["ICH-Q5A-R2", "ICH-Q5C", "ICH-Q5D", "ICH-Q5E", "ICH-Q6B", ...coreSources];
const sterileSources = ["EU-GMP-ANNEX1-2022", "EU-GMP-ANNEX15-2015", ...coreSources];
const laboratorySources = ["EU-GMP-CH6-2014", "FDA-DI-2018", "FDA-OOS-2022", ...coreSources];
const apiSources = ["ICH-Q7", "ICH-Q11", "ICH-Q6A", ...coreSources];

const rule = (
  systemId: string,
  stageId: string,
  methodTitle: string,
  complianceTitle: string,
  sourceIds: string[],
  monitorDomains: RegulatoryDomain[],
  decisionIds: BlueprintDecisionId[],
  reviewerRole: string,
): StageCoverageRule => ({ systemId, stageId, methodTitle, complianceTitle, sourceIds, monitorDomains, decisionIds, reviewerRole });

/** Explicit, human-authored stage applicability table. No inferred or AI-generated classification is used. */
export const STAGE_COVERAGE_RULES: StageCoverageRule[] = [
  rule("biopharma", "cell-source-materials", "Cell substrate and material method profile", "Cell substrate and material governance profile", biopharmaSources, ["sterile-biologics", "quality-systems"], ["scope-applicability", "method-architecture", "lifecycle-governance"], "Biopharma CMC and cell-substrate SME"),
  rule("biopharma", "upstream", "Upstream process and monitoring method profile", "Upstream control and continued-evidence profile", biopharmaSources, ["sterile-biologics"], ["method-architecture", "workload-capacity", "control-investigation"], "Upstream process/MSAT and Quality reviewer"),
  rule("biopharma", "downstream", "Downstream purification and clearance method profile", "Downstream clearance governance profile", biopharmaSources, ["sterile-biologics"], ["method-architecture", "control-investigation", "lifecycle-governance"], "Downstream, viral-safety and analytical SME"),
  rule("biopharma", "formulation-fill", "Formulation, fill-finish and stability method profile", "Fill-finish and presentation control profile", biopharmaSources, ["sterile-biologics"], ["method-architecture", "equipment-utilities", "control-investigation"], "Formulation, sterile manufacturing and Quality reviewer"),
  rule("biopharma", "analytical-control", "Biopharma analytical control method profile", "Analytical control and specification governance profile", biopharmaSources, ["sterile-biologics", "analytical-chemistry"], ["method-architecture", "control-investigation", "lifecycle-governance"], "Biopharma analytical and regulatory CMC SME"),
  rule("biopharma", "validation-cpv", "Process validation and CPV method profile", "Validation lifecycle governance profile", ["FDA-PROCESS-VALIDATION-2011", "EMA-BIOLOGICS-PROCESS-VALIDATION-2016", ...biopharmaSources], ["sterile-biologics", "quality-systems"], ["workload-capacity", "control-investigation", "lifecycle-governance"], "Validation, statistics and Quality reviewer"),
  rule("biopharma", "release-transfer", "Release, comparability and transfer method profile", "Disposition, comparability and transfer governance profile", ["WHO-TRS-1044-ANNEX4", ...biopharmaSources], ["sterile-biologics", "quality-systems"], ["scope-applicability", "control-investigation", "lifecycle-governance"], "Quality, technology-transfer and regulatory CMC reviewer"),

  rule("sterile-product", "sterile-materials", "Sterile material and supplier method profile", "Material entry and supplier control profile", sterileSources, ["sterile-biologics", "quality-systems"], ["scope-applicability", "method-architecture", "lifecycle-governance"], "Supplier Quality and sterility-assurance reviewer"),
  rule("sterile-product", "facility-readiness", "Facility and cleanroom qualification method profile", "Facility readiness and CCS control profile", sterileSources, ["sterile-biologics", "quality-systems"], ["equipment-utilities", "control-investigation", "lifecycle-governance"], "Engineering, validation and sterility-assurance reviewer"),
  rule("sterile-product", "people-sterilization", "Personnel and sterilization method profile", "Personnel and sterilization control profile", sterileSources, ["sterile-biologics"], ["method-architecture", "control-investigation", "lifecycle-governance"], "Sterility-assurance, microbiology and validation reviewer"),
  rule("sterile-product", "sterile-filtration-stage", "Sterilizing filtration method profile", "Sterile filtration lifecycle control profile", sterileSources, ["sterile-biologics"], ["method-architecture", "equipment-utilities", "control-investigation"], "Sterile filtration and validation SME"),
  rule("sterile-product", "aseptic-process", "Aseptic process simulation and control method profile", "Aseptic process and CCS governance profile", sterileSources, ["sterile-biologics", "water-environmental-monitoring"], ["method-architecture", "control-investigation", "lifecycle-governance"], "Aseptic processing and sterility-assurance SME"),
  rule("sterile-product", "monitor-investigate", "Environmental monitoring and investigation method profile", "Contamination signal and investigation control profile", sterileSources, ["sterile-biologics", "water-environmental-monitoring", "data-integrity"], ["workload-capacity", "control-investigation", "lifecycle-governance"], "Microbiology, sterility-assurance and Quality reviewer"),
  rule("sterile-product", "sterile-release", "Sterile release evidence method profile", "Sterile disposition and lifecycle governance profile", sterileSources, ["sterile-biologics", "quality-systems"], ["control-investigation", "lifecycle-governance"], "Quality release and sterility-assurance reviewer"),

  rule("qc-laboratory", "lab-readiness", "Laboratory readiness and qualification method profile", "Laboratory readiness and data governance profile", laboratorySources, ["data-integrity", "quality-systems"], ["equipment-utilities", "control-investigation", "lifecycle-governance"], "Laboratory management, validation and data-integrity reviewer"),
  rule("qc-laboratory", "media-utilities", "Media and pharmaceutical-water method profile", "Media and utility control profile", ["FDA-NONSTERILE-MICRO-2021", ...laboratorySources], ["water-environmental-monitoring", "nonsterile-microbiology"], ["method-architecture", "workload-capacity", "control-investigation"], "Pharmaceutical microbiology and water-system SME"),
  rule("qc-laboratory", "microbiology-controls", "Microbiology control method profile", "Microbiology control and excursion governance profile", ["FDA-NONSTERILE-MICRO-2021", "USP-CURRENT", ...laboratorySources], ["nonsterile-microbiology", "water-environmental-monitoring"], ["method-architecture", "workload-capacity", "control-investigation"], "Pharmaceutical microbiology and Quality reviewer"),
  rule("qc-laboratory", "analytical-testing", "Analytical testing method profile", "Analytical laboratory control profile", ["ICH-Q2-R2", "ICH-Q14", ...laboratorySources], ["analytical-chemistry", "data-integrity"], ["method-architecture", "workload-capacity", "control-investigation"], "Analytical chemistry and laboratory Quality SME"),
  rule("qc-laboratory", "stability-trending", "Stability and trending method profile", "Stability lifecycle governance profile", ["ICH-Q1A-R2", ...laboratorySources], ["analytical-chemistry", "quality-systems"], ["workload-capacity", "control-investigation", "lifecycle-governance"], "Stability, statistics and Quality reviewer"),
  rule("qc-laboratory", "lab-investigations", "Laboratory investigation method profile", "OOS, OOT and data-investigation control profile", ["FDA-OOS-2022", "FDA-DI-2018", ...coreSources], ["quality-systems", "data-integrity"], ["control-investigation", "lifecycle-governance"], "Laboratory investigation and Quality reviewer"),
  rule("qc-laboratory", "lab-release", "Result review and release method profile", "Laboratory review and disposition control profile", laboratorySources, ["quality-systems", "data-integrity"], ["control-investigation", "lifecycle-governance"], "Laboratory reviewer and authorized Quality disposition role"),

  rule("pharma-api", "api-inputs", "API input and starting-material method profile", "Starting-material and supplier governance profile", apiSources, ["quality-systems", "analytical-chemistry"], ["scope-applicability", "method-architecture", "lifecycle-governance"], "API process, supplier Quality and analytical reviewer"),
  rule("pharma-api", "api-process", "API process and impurity method profile", "Process and impurity control governance profile", ["ICH-Q3A-R2", "ICH-M7-R2", ...apiSources], ["analytical-chemistry", "quality-systems"], ["method-architecture", "control-investigation", "lifecycle-governance"], "API process, impurity and analytical SME"),
  rule("pharma-api", "api-equipment-cleaning", "API equipment and cleaning method profile", "Equipment and cleaning lifecycle control profile", ["EU-GMP-ANNEX15-2015", ...apiSources], ["quality-systems"], ["equipment-utilities", "control-investigation", "lifecycle-governance"], "Validation, engineering and toxicology/HBEL reviewer"),
  rule("pharma-api", "api-analytical", "API analytical lifecycle method profile", "Analytical specification and lifecycle governance profile", ["ICH-Q2-R2", "ICH-Q14", ...apiSources], ["analytical-chemistry", "data-integrity"], ["method-architecture", "control-investigation", "lifecycle-governance"], "API analytical and regulatory CMC SME"),
  rule("pharma-api", "api-validation", "API process-validation method profile", "Process-validation governance profile", ["FDA-PROCESS-VALIDATION-2011", "EU-GMP-ANNEX15-2015", ...apiSources], ["quality-systems"], ["workload-capacity", "control-investigation", "lifecycle-governance"], "API validation, statistics and Quality reviewer"),
  rule("pharma-api", "api-stability-investigation", "API stability and investigation method profile", "Stability and investigation governance profile", ["ICH-Q1A-R2", "FDA-OOS-2022", ...apiSources], ["analytical-chemistry", "quality-systems"], ["control-investigation", "lifecycle-governance"], "API stability, analytical and Quality reviewer"),
  rule("pharma-api", "api-release-change", "API release and change method profile", "Release, change and transfer governance profile", ["WHO-TRS-1044-ANNEX4", ...apiSources], ["quality-systems", "data-integrity"], ["control-investigation", "lifecycle-governance"], "Quality Unit, release and regulatory CMC reviewer"),

  rule("quality-lifecycle", "supplier-governance", "Supplier evidence review method profile", "Supplier quality-system control profile", ["FDA-QUALITY-AGREEMENTS-2016", ...coreSources], ["quality-systems"], ["scope-applicability", "control-investigation", "lifecycle-governance"], "Supplier Quality and system owner"),
  rule("quality-lifecycle", "qualification", "Qualification evidence method profile", "Qualification governance profile", ["EU-GMP-ANNEX15-2015", ...coreSources], ["quality-systems", "data-integrity"], ["equipment-utilities", "control-investigation", "lifecycle-governance"], "Validation, engineering and Quality reviewer"),
  rule("quality-lifecycle", "validation", "Validation lifecycle method profile", "Validation governance profile", ["FDA-PROCESS-VALIDATION-2011", "EU-GMP-ANNEX15-2015", ...coreSources], ["quality-systems"], ["control-investigation", "lifecycle-governance"], "Validation and Quality reviewer"),
  rule("quality-lifecycle", "routine-control", "Routine control method profile", "Routine control governance profile", ["EU-GMP-CH6-2014", ...coreSources], ["quality-systems", "analytical-chemistry", "water-environmental-monitoring"], ["method-architecture", "control-investigation", "lifecycle-governance"], "Process, laboratory and Quality system owner"),
  rule("quality-lifecycle", "quality-signals", "Quality signal review method profile", "Quality signal and investigation governance profile", ["FDA-OOS-2022", "FDA-DI-2018", ...coreSources], ["quality-systems", "data-integrity"], ["control-investigation", "lifecycle-governance"], "Quality systems and data-integrity reviewer"),
  rule("quality-lifecycle", "capa-change", "CAPA effectiveness and change method profile", "CAPA and change governance profile", coreSources, ["quality-systems"], ["control-investigation", "lifecycle-governance"], "CAPA/change-control owner and Quality reviewer"),
  rule("quality-lifecycle", "quality-review-release", "Management review and disposition method profile", "Quality review and disposition governance profile", coreSources, ["quality-systems", "data-integrity"], ["scope-applicability", "control-investigation", "lifecycle-governance"], "Quality management and authorized disposition role"),
];

function profileFor(ruleEntry: StageCoverageRule, area: StageCoverageProfile["area"]): StageCoverageProfile {
  const system = getWorkflowSystem(ruleEntry.systemId)!;
  const stage = system.stages.find((candidate) => candidate.id === ruleEntry.stageId)!;
  const kind = area === "methods" ? "method" : area === "compliance" ? "compliance" : "monitor";
  const title = area === "methods" ? ruleEntry.methodTitle : area === "compliance" ? ruleEntry.complianceTitle : `${stage.title} regulatory watch context`;
  const status: ResourceCoverageStatus = area === "methods" ? "evidence-required" : area === "compliance" ? "specialist-review-required" : "no-current-change";
  return {
    key: `${ruleEntry.systemId}:${ruleEntry.stageId}:${kind}:stage-profile`,
    contractVersion: RESOURCE_COVERAGE_CONTRACT_VERSION,
    area,
    kind,
    slug: `${ruleEntry.systemId}-${ruleEntry.stageId}`,
    title,
    href: area === "methods" ? "/methods" : area === "compliance" ? "/compliance" : "/monitor",
    systemId: ruleEntry.systemId,
    stageId: ruleEntry.stageId,
    coverageStatus: status,
    sourceIds: ruleEntry.sourceIds,
    decisionIds: ruleEntry.decisionIds,
    reviewRequired: true,
    reviewerRole: ruleEntry.reviewerRole,
    purpose: area === "methods" ? `Frame the method and evidence questions attached to ${stage.title}.` : area === "compliance" ? `Frame the control objective and review evidence attached to ${stage.title}.` : `Watch official-source signals that may affect ${stage.title}.`,
    applicability: `Navigation profile for ${system.shortTitle} / ${stage.title}; product, market, site, process, method, and effective-version applicability must be confirmed.`,
    limitations: area === "monitor" ? "No current mapped signal is not proof of no regulatory impact. Official sources and site change-control assessment remain authoritative." : "This profile is decision support, not an approved method, specification, validation conclusion, compliance determination, or disposition decision.",
    monitorDomains: ruleEntry.monitorDomains,
  };
}

export const stageCoverageProfiles: StageCoverageProfile[] = STAGE_COVERAGE_RULES.flatMap((entry) => [profileFor(entry, "methods"), profileFor(entry, "compliance"), profileFor(entry, "monitor")]);

export function getStageCoverageProfiles(systemId: string, stageId?: string, area?: StageCoverageProfile["area"]) {
  return stageCoverageProfiles.filter((profile) => profile.systemId === systemId && (!stageId || profile.stageId === stageId) && (!area || profile.area === area));
}

export function getCoverageRule(systemId: string, stageId: string) {
  return STAGE_COVERAGE_RULES.find((entry) => entry.systemId === systemId && entry.stageId === stageId);
}

export function resolveCoverageLocation(profile: StageCoverageProfile): { system: WorkflowSystem; stage: WorkflowSystemStage } | undefined {
  const system = getWorkflowSystem(profile.systemId);
  const stage = system?.stages.find((candidate) => candidate.id === profile.stageId);
  return system && stage ? { system, stage } : undefined;
}
