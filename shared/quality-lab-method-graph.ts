import { z } from "zod";

/**
 * The first executable slice of the Atlas Quality Method Graph.  These are
 * deliberately planning nodes, not a substitute for an approved registered
 * specification or a compendial method text.
 */
export const dosageFormValues = ["tablet-capsule", "oral-liquid", "topical", "powder", "other"] as const;
export const methodSuitabilityValues = ["verified", "pending", "not-required", "unknown"] as const;
export const executionValues = ["in-house", "outsource"] as const;
export const marketExecutionStrategyValues = ["unknown", "shared-across-markets", "separate-by-market"] as const;

export const productProfileSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2).max(120),
  dosageForm: z.enum(dosageFormValues),
  markets: z.array(z.string().min(1)).min(1),
  monthlyBatches: z.number().min(0).max(100_000),
  samplesPerBatch: z.number().min(1).max(100),
  sampleQuantityGrams: z.number().min(0.1).max(10_000).default(10),
  dilutionVolumeMl: z.number().min(1).max(100_000).default(100),
  incubationProfile: z.enum(["standard", "extended"]).default("standard"),
  microbialLimitsRequired: z.boolean(),
  specifiedOrganismsRequired: z.boolean(),
  methodSuitability: z.enum(methodSuitabilityValues),
  execution: z.enum(executionValues),
  marketExecutionStrategy: z.enum(marketExecutionStrategyValues).default("unknown"),
  preservativeOrNeutralizerNote: z.string().max(300).default(""),
});

export type ProductProfile = z.infer<typeof productProfileSchema>;

export const methodRequirementSchema = z.object({
  id: z.string(),
  productId: z.string(),
  productName: z.string(),
  market: z.string(),
  requirementType: z.enum(["microbial-enumeration", "specified-microorganisms", "method-suitability", "raw-material-microbiology", "water-microbiology", "environmental-monitoring", "growth-promotion-media-qc"]),
  methodId: z.string(),
  methodName: z.string(),
  monthlyExecutions: z.number(),
  allocatedMonthlyExecutions: z.number(),
  operationalDemandStatus: z.enum(["allocated", "unresolved"]),
  execution: z.enum(executionValues),
  acceptanceCriteria: z.string(),
  verificationRequirement: z.string(),
  evidenceIds: z.array(z.string()).min(1),
  applicability: z.string(),
  limitations: z.string(),
});

export type MethodRequirement = z.infer<typeof methodRequirementSchema>;

export const methodBomItemSchema = z.object({
  id: z.string(),
  methodRequirementId: z.string(),
  productName: z.string(),
  methodName: z.string(),
  category: z.enum(["sample", "media", "diluent", "neutralizer", "membrane", "plate", "reference-strain", "control", "sampling-consumable"]),
  item: z.string(),
  unit: z.string(),
  quantityPerExecution: z.number(),
  quantityPerMonth: z.number(),
  incubationOrControl: z.string(),
  evidenceIds: z.array(z.string()).min(1),
  status: z.enum(["concept-benchmark", "site-confirmation-required"]),
});

export type MethodBomItem = z.infer<typeof methodBomItemSchema>;

export const methodCapacityDemandSchema = z.object({
  id: z.string(),
  methodRequirementId: z.string(),
  productName: z.string(),
  resourceId: z.enum(["incubator-20-25", "incubator-30-35", "bsc", "autoclave"]),
  resourceName: z.string(),
  unit: z.enum(["plate-days", "hands-on-hours", "media-liters"]),
  demandPerExecution: z.number().min(0),
  monthlyDemand: z.number().min(0),
  basis: z.string(),
  evidenceIds: z.array(z.string()).min(1),
});

export type MethodCapacityDemand = z.infer<typeof methodCapacityDemandSchema>;

export interface SupportApplicationGraphInput {
  rawMaterialLotsPerMonth: number;
  waterPoints: number;
  waterRoundsPerWeek: number;
  emLocations: number;
  emRoundsPerWeek: number;
  mediaLotsPerMonth: number;
  outsourcePercent: number;
  scope: {
    rawMaterials: boolean;
    water: boolean;
    environmentalMonitoring: boolean;
    growthPromotion: boolean;
  };
}

const methodDefinitions = {
  enumeration: {
    id: "usp-61-concept",
    name: "Microbial enumeration (USP <61>-context conventional method)",
    evidenceIds: ["usp-61-context", "site-approved-methods", "atlas-microbiology-benchmarks-v1"],
    acceptance: "Use the approved product specification and current applicable compendial requirements; no generic limit is asserted by Atlas.",
    verification: "Confirm product-specific method suitability, sample preparation, recovery and any neutralization strategy before controlled use.",
    bom: [
      ["media", "Tryptic soy agar (or approved equivalent)", "plates", 2, "Incubate under the approved method conditions"],
      ["media", "Sabouraud dextrose agar (or approved equivalent)", "plates", 2, "Incubate under the approved method conditions"],
      ["diluent", "Validated diluent", "mL", 100, "Confirm dilution scheme and compatibility"],
      ["plate", "Petri dishes", "plates", 4, "Includes duplicate aerobic and fungal recovery plates"],
      ["control", "Negative/process controls", "controls", 1, "Frequency follows the approved method"],
    ],
    capacity: [
      ["incubator-20-25", "Incubator 20–25 °C", "plate-days", 10, "Two fungal-recovery plates held for a concept five-day incubation allowance"],
      ["incubator-30-35", "Incubator 30–35 °C", "plate-days", 6, "Two bacterial-recovery plates held for a concept three-day incubation allowance"],
      ["bsc", "Class II biological safety cabinet", "hands-on-hours", 0.7, "Preparation, dilution and plating allowance"],
      ["autoclave", "Steam sterilizer / autoclave", "media-liters", 0.4, "Prepared-media equivalent; prepared media strategy can remove this site load"],
    ],
  },
  specified: {
    id: "usp-62-concept",
    name: "Specified microorganisms (USP <62>-context conventional method)",
    evidenceIds: ["usp-62-context", "site-approved-methods", "atlas-microbiology-benchmarks-v1"],
    acceptance: "Use the approved product specification, organism panel and current applicable compendial requirements; Atlas does not infer the required organism panel.",
    verification: "Confirm enrichment/selective media, organism panel, sample quantity, neutralization and product-specific suitability before controlled use.",
    bom: [
      ["media", "Approved enrichment/selective media", "sets", 1, "Incubation and transfers follow the approved organism-specific method"],
      ["diluent", "Validated diluent", "mL", 100, "Confirm dilution scheme and compatibility"],
      ["reference-strain", "Qualified positive-control strain", "set", 1, "Use the approved organism panel and control frequency"],
      ["control", "Negative/process controls", "controls", 1, "Frequency follows the approved method"],
    ],
    capacity: [
      ["incubator-20-25", "Incubator 20–25 °C", "plate-days", 5, "Concept allowance for selective/enrichment recovery conditions"],
      ["incubator-30-35", "Incubator 30–35 °C", "plate-days", 5, "Concept allowance for selective/enrichment recovery conditions"],
      ["bsc", "Class II biological safety cabinet", "hands-on-hours", 0.8, "Preparation, enrichment and transfer allowance"],
      ["autoclave", "Steam sterilizer / autoclave", "media-liters", 0.25, "Prepared-media equivalent; confirm media strategy and batch sizes"],
    ],
  },
} as const;

type MethodDefinition = (typeof methodDefinitions)[keyof typeof methodDefinitions];

function rounded(value: number) {
  return Math.round(value * 10) / 10;
}

export function compileNonSterileMethodGraph(products: ProductProfile[]): { requirements: MethodRequirement[]; bom: MethodBomItem[]; capacity: MethodCapacityDemand[] } {
  const requirements: MethodRequirement[] = [];
  const bom: MethodBomItem[] = [];
  const capacity: MethodCapacityDemand[] = [];
  for (const product of products) {
    const tests: Array<["microbial-enumeration" | "specified-microorganisms", MethodDefinition]> = [];
    if (product.microbialLimitsRequired) tests.push(["microbial-enumeration", methodDefinitions.enumeration]);
    if (product.specifiedOrganismsRequired) tests.push(["specified-microorganisms", methodDefinitions.specified]);
    for (const [requirementType, definition] of tests) for (let marketIndex = 0; marketIndex < product.markets.length; marketIndex += 1) {
      const market = product.markets[marketIndex];
      const id = `${product.id}:${market}:${definition.id}`;
      const monthlyExecutions = rounded(product.monthlyBatches * product.samplesPerBatch);
      const multipleMarkets = product.markets.length > 1;
      const operationalDemandStatus = multipleMarkets && product.marketExecutionStrategy === "unknown" ? "unresolved" as const : "allocated" as const;
      const allocatedMonthlyExecutions = operationalDemandStatus === "unresolved" ? 0
        : product.marketExecutionStrategy === "shared-across-markets" && marketIndex > 0 ? 0
          : monthlyExecutions;
      const applicability = `${product.name} (${product.dosageForm}) for ${market}; ${product.execution} execution; ${product.sampleQuantityGrams} g sample with ${product.dilutionVolumeMl} mL dilution and ${product.incubationProfile} incubation profile.`;
      requirements.push({
        id, productId: product.id, productName: product.name, market, requirementType,
        methodId: definition.id, methodName: definition.name, monthlyExecutions, allocatedMonthlyExecutions, operationalDemandStatus, execution: product.execution,
        acceptanceCriteria: definition.acceptance, verificationRequirement: definition.verification,
        evidenceIds: [...definition.evidenceIds], applicability,
        limitations: "Concept method architecture only. Product registration, approved specification, method parameters, samples, replicates and controls must be confirmed by the site.",
      });
      const incubationMultiplier = product.incubationProfile === "extended" ? 1.4 : 1;
      bom.push({
        id: `${id}:sample-quantity`, methodRequirementId: id, productName: product.name, methodName: definition.name,
        category: "sample", item: "Product sample quantity", unit: "g", quantityPerExecution: product.sampleQuantityGrams,
        quantityPerMonth: rounded(allocatedMonthlyExecutions * product.sampleQuantityGrams),
        incubationOrControl: "Confirm sample mass/volume and representativeness in the approved sampling plan",
        evidenceIds: ["site-approved-methods"], status: "site-confirmation-required",
      });
      for (const [category, item, unit, quantityPerExecution, incubationOrControl] of definition.bom) {
        const adjustedQuantity = category === "diluent" ? product.dilutionVolumeMl : quantityPerExecution;
        bom.push({
          id: `${id}:${item}`, methodRequirementId: id, productName: product.name, methodName: definition.name,
          category, item, unit, quantityPerExecution: adjustedQuantity, quantityPerMonth: rounded(allocatedMonthlyExecutions * adjustedQuantity),
          incubationOrControl, evidenceIds: [...definition.evidenceIds], status: "site-confirmation-required",
        });
      }
      if (product.execution === "in-house" && operationalDemandStatus === "allocated") for (const [resourceId, resourceName, unit, demandPerExecution, basis] of definition.capacity) {
        const adjustedDemand = unit === "plate-days" ? demandPerExecution * incubationMultiplier : demandPerExecution;
        capacity.push({ id: `${id}:${resourceId}`, methodRequirementId: id, productName: product.name, resourceId, resourceName, unit, demandPerExecution: adjustedDemand, monthlyDemand: rounded(allocatedMonthlyExecutions * adjustedDemand), basis: `${basis}; ${product.incubationProfile} incubation profile`, evidenceIds: [...definition.evidenceIds] });
      }
      if (product.preservativeOrNeutralizerNote.trim()) {
        bom.push({ id: `${id}:neutralizer`, methodRequirementId: id, productName: product.name, methodName: definition.name, category: "neutralizer", item: product.preservativeOrNeutralizerNote, unit: "method execution", quantityPerExecution: 1, quantityPerMonth: allocatedMonthlyExecutions, incubationOrControl: "Confirm neutralization/recovery during suitability work", evidenceIds: ["site-approved-methods"], status: "site-confirmation-required" });
      }
    }
    if (product.methodSuitability === "pending" || product.methodSuitability === "unknown") {
      const suitabilityId = `${product.id}:suitability`;
      const suitabilityEvidence = ["site-approved-methods", "usp-61-context", "usp-62-context", "atlas-microbiology-benchmarks-v1"];
      requirements.push({ id: suitabilityId, productId: product.id, productName: product.name, market: product.markets.join(", "), requirementType: "method-suitability", methodId: "method-suitability-recovery-concept", methodName: "Product-specific method suitability and recovery", monthlyExecutions: 0, allocatedMonthlyExecutions: 0, operationalDemandStatus: "allocated", execution: product.execution, acceptanceCriteria: "Recovery, neutralization and control acceptance must be defined in the approved protocol; Atlas does not infer organisms, inoculum or acceptance limits.", verificationRequirement: "Blocking before routine method use where suitability is pending or unknown.", evidenceIds: suitabilityEvidence, applicability: `${product.name} has method-suitability status ${product.methodSuitability}.`, limitations: "Qualification node only. It exposes the one-time BOM and resource architecture but does not add recurring monthly demand until a controlled protocol and study plan exist." });
      const suitabilityBom: Array<[MethodBomItem["category"], string, string, number, string]> = [
        ["sample", "Representative product/matrix samples", "study set", 1, "Confirm worst-case and bracketing rationale"],
        ["diluent", "Approved dilution and rinse system", "study set", 1, "Confirm preparation, dilution and filtration branches"],
        ["neutralizer", "Candidate neutralization or inactivation system", "study set", 1, "Selection remains a controlled recovery hypothesis"],
        ["reference-strain", "Qualified challenge-organism panel", "panel", 1, "Organisms and inoculum preparation require approved protocol"],
        ["media", "Recovery, enrichment and selective media set", "study set", 1, "Match the intended routine method architecture"],
        ["control", "Positive, negative, inoculum and method controls", "control set", 1, "Run validity and acceptance remain protocol-controlled"],
      ];
      for (const [category, item, unit, quantityPerExecution, incubationOrControl] of suitabilityBom) bom.push({
        id: `${suitabilityId}:${category}`, methodRequirementId: suitabilityId, productName: product.name, methodName: "Product-specific method suitability and recovery", category, item, unit, quantityPerExecution, quantityPerMonth: 0, incubationOrControl, evidenceIds: suitabilityEvidence, status: "site-confirmation-required",
      });
      const suitabilityCapacity: Array<[MethodCapacityDemand["resourceId"], string, MethodCapacityDemand["unit"], number, string]> = [
        ["incubator-20-25", "Incubator 20–25 °C", "plate-days", 12, "Qualification-study recovery and selective-media occupancy allowance"],
        ["incubator-30-35", "Incubator 30–35 °C", "plate-days", 12, "Qualification-study recovery and selective-media occupancy allowance"],
        ["bsc", "Class II biological safety cabinet", "hands-on-hours", 4, "Preparation, challenge, neutralization and transfer study allowance"],
        ["autoclave", "Steam sterilizer / autoclave", "media-liters", 1, "Prepared-media equivalent for one study set"],
      ];
      if (product.execution === "in-house") for (const [resourceId, resourceName, unit, demandPerExecution, basis] of suitabilityCapacity) capacity.push({ id: `${suitabilityId}:${resourceId}`, methodRequirementId: suitabilityId, productName: product.name, resourceId, resourceName, unit, demandPerExecution, monthlyDemand: 0, basis: `${basis}; one-time qualification demand is not included in recurring capacity`, evidenceIds: suitabilityEvidence });
    }
  }
  return { requirements, bom, capacity };
}

type SupportApplicationDefinition = {
  key: keyof SupportApplicationGraphInput["scope"];
  requirementType: MethodRequirement["requirementType"];
  methodId: string;
  methodName: string;
  programName: string;
  evidenceIds: string[];
  acceptanceCriteria: string;
  verificationRequirement: string;
  limitations: string;
  bom: Array<[MethodBomItem["category"], string, string, number, string]>;
  capacity: Array<[MethodCapacityDemand["resourceId"], string, MethodCapacityDemand["unit"], number, string]>;
};

const supportApplicationDefinitions: SupportApplicationDefinition[] = [
  {
    key: "rawMaterials", requirementType: "raw-material-microbiology", methodId: "raw-material-microbiology-concept", methodName: "Raw-material microbiology application", programName: "Incoming raw-material program",
    evidenceIds: ["project-inputs", "site-approved-methods", "fda-nonsterile-draft-context", "atlas-microbiology-benchmarks-v1"],
    acceptanceCriteria: "Use the approved material specification, sampling plan and supplier-control strategy; Atlas does not infer tests, frequency, reduced testing or limits.",
    verificationRequirement: "Confirm the material-by-specification matrix, sample preparation, method suitability, supplier status and physical test allocation.",
    limitations: "One concept application per incoming lot. Material families, skip-lot rules, sample count, preparation, controls and exception demand remain site evidence.",
    bom: [["sample", "Representative incoming-material sample", "lot application", 1, "Sampling quantity and representativeness follow the approved plan"], ["diluent", "Approved preparation/dilution system", "mL", 100, "Confirm matrix solubility, dispersion and neutralization"], ["media", "Approved enumeration or specified-organism media set", "set", 1, "Tests depend on the material specification"], ["control", "Method and process controls", "set", 1, "Control frequency follows the approved method"]],
    capacity: [["incubator-20-25", "Incubator 20–25 °C", "plate-days", 8, "Concept fungal/selective-media occupancy"], ["incubator-30-35", "Incubator 30–35 °C", "plate-days", 8, "Concept bacterial/enrichment-media occupancy"], ["bsc", "Class II biological safety cabinet", "hands-on-hours", 0.6, "Preparation, dilution and plating allowance"], ["autoclave", "Steam sterilizer / autoclave", "media-liters", 0.3, "Prepared-media equivalent"]],
  },
  {
    key: "water", requirementType: "water-microbiology", methodId: "water-microbiology-concept", methodName: "Pharmaceutical-water microbiology application", programName: "Pharmaceutical-water monitoring program",
    evidenceIds: ["project-inputs", "site-approved-methods", "usp-1231-context", "ph-eur-microbiology-context", "atlas-microbiology-benchmarks-v1"],
    acceptanceCriteria: "Use the approved water grade, point-specific monitoring program, method, alert/action framework and investigation procedure; Atlas sets no universal limit.",
    verificationRequirement: "Confirm point criticality, route and timing, sample volume/container/hold time, filtration or plating method, incubation and trend ownership.",
    limitations: "One concept application per sampled point-round. Flush practice, sample volume, media, incubation, duplicate plates and excursion/repeat demand remain site evidence.",
    bom: [["sample", "Water sample", "sample", 1, "Volume and representativeness require the approved sampling program"], ["sampling-consumable", "Qualified sample container", "container", 1, "Container, closure, sterilization and hold time require confirmation"], ["membrane", "Membrane filter and filtration funnel", "set", 1, "Applies only when the approved method uses membrane filtration"], ["media", "Approved water-recovery medium", "plate", 1, "Medium and incubation remain method-controlled"], ["control", "Method/process controls", "set", 1, "Frequency follows the approved method"]],
    capacity: [["incubator-20-25", "Incubator 20–25 °C", "plate-days", 10, "Concept water-recovery plate occupancy"], ["bsc", "Class II biological safety cabinet", "hands-on-hours", 0.25, "Receipt, filtration and transfer allowance"], ["autoclave", "Steam sterilizer / autoclave", "media-liters", 0.12, "Prepared-media equivalent"]],
  },
  {
    key: "environmentalMonitoring", requirementType: "environmental-monitoring", methodId: "environmental-monitoring-concept", methodName: "Environmental-monitoring method application", programName: "Environmental-monitoring program",
    evidenceIds: ["project-inputs", "site-approved-methods", "eu-gmp-annex-1-2022", "usp-1116-context", "atlas-microbiology-benchmarks-v1"],
    acceptanceCriteria: "Use the approved location/activity/method matrix, limits, trend rules and excursion procedure; Atlas does not infer grades, frequencies, locations or disposition.",
    verificationRequirement: "Confirm location, state/activity, shift, active/passive air, surface/personnel method mix, sample volume/duration, media, incubation, reading and identification triggers.",
    limitations: "One concept application per location-round. It does not separate all sample types or simulate route time, interventions, personnel, excursions and identification demand.",
    bom: [["sampling-consumable", "Active/passive air, surface or personnel collection unit", "location application", 1, "Method mix must be declared by location and activity"], ["media", "Approved EM recovery medium", "plate", 1, "Media and neutralization depend on the site program"], ["control", "Transport, exposure and process controls", "set", 1, "Control design follows the approved program"]],
    capacity: [["incubator-20-25", "Incubator 20–25 °C", "plate-days", 4.5, "Concept share of dual-condition EM incubation"], ["incubator-30-35", "Incubator 30–35 °C", "plate-days", 4.5, "Concept share of dual-condition EM incubation"], ["bsc", "Class II biological safety cabinet", "hands-on-hours", 0.15, "Plate handling, reading preparation and transfer allowance"], ["autoclave", "Steam sterilizer / autoclave", "media-liters", 0.08, "Prepared-media equivalent"]],
  },
  {
    key: "growthPromotion", requirementType: "growth-promotion-media-qc", methodId: "growth-promotion-media-qc-concept", methodName: "Growth-promotion and media-QC application", programName: "Media preparation and release program",
    evidenceIds: ["project-inputs", "site-approved-methods", "usp-61-context", "usp-62-context", "ph-eur-microbiology-context", "atlas-microbiology-benchmarks-v1"],
    acceptanceCriteria: "Use the approved media-specific organism/property matrix, inoculum controls and release procedure; Atlas does not infer organism panels, acceptance or reduced-testing rules.",
    verificationRequirement: "Confirm media family, lot/container, intended method, growth/inhibition/indicative properties, organism/control panel, inoculum preparation, incubation and supplier strategy.",
    limitations: "One concept application per prepared or received media lot. Container counts, organism-property branches, negative controls, failures and reduced-testing eligibility remain site evidence.",
    bom: [["media", "Prepared or purchased media lot", "lot", 1, "Media identity, container and intended-use matrix require confirmation"], ["reference-strain", "Qualified challenge-organism panel", "panel", 1, "Organism and passage controls remain site-approved"], ["diluent", "Inoculum preparation system", "set", 1, "Target inoculum and preparation evidence remain controlled"], ["control", "Positive, negative and media-sterility controls", "set", 1, "Release validity follows the approved procedure"]],
    capacity: [["incubator-20-25", "Incubator 20–25 °C", "plate-days", 14, "Concept fungal/low-temperature organism-property occupancy"], ["incubator-30-35", "Incubator 30–35 °C", "plate-days", 14, "Concept bacterial/high-temperature organism-property occupancy"], ["bsc", "Class II biological safety cabinet", "hands-on-hours", 0.8, "Culture, inoculum and challenge handling allowance"], ["autoclave", "Steam sterilizer / autoclave", "media-liters", 1, "Prepared-media equivalent"]],
  },
];

export function compileNonSterileSupportMethodGraph(input: SupportApplicationGraphInput): { requirements: MethodRequirement[]; bom: MethodBomItem[]; capacity: MethodCapacityDemand[] } {
  const requirements: MethodRequirement[] = [];
  const bom: MethodBomItem[] = [];
  const capacity: MethodCapacityDemand[] = [];
  const insourceFactor = 1 - Math.min(95, Math.max(0, input.outsourcePercent)) / 100;
  const unitsByKey: Record<SupportApplicationDefinition["key"], number> = {
    rawMaterials: input.rawMaterialLotsPerMonth,
    water: input.waterPoints * input.waterRoundsPerWeek * 4.33,
    environmentalMonitoring: input.emLocations * input.emRoundsPerWeek * 4.33,
    growthPromotion: input.mediaLotsPerMonth,
  };
  for (const definition of supportApplicationDefinitions) {
    if (!input.scope[definition.key] || unitsByKey[definition.key] <= 0) continue;
    const monthlyExecutions = rounded(unitsByKey[definition.key]);
    const allocatedMonthlyExecutions = rounded(monthlyExecutions * insourceFactor);
    const id = `application:${definition.methodId}`;
    requirements.push({
      id, productId: `application:${definition.key}`, productName: definition.programName, market: "Site program", requirementType: definition.requirementType,
      methodId: definition.methodId, methodName: definition.methodName, monthlyExecutions, allocatedMonthlyExecutions, operationalDemandStatus: "allocated", execution: "in-house",
      acceptanceCriteria: definition.acceptanceCriteria, verificationRequirement: definition.verificationRequirement, evidenceIds: definition.evidenceIds,
      applicability: `${definition.programName}; ${monthlyExecutions} concept applications/month with ${rounded(insourceFactor * 100)}% retained in-house workload.`, limitations: definition.limitations,
    });
    for (const [category, item, unit, quantityPerExecution, incubationOrControl] of definition.bom) bom.push({
      id: `${id}:${category}:${item}`, methodRequirementId: id, productName: definition.programName, methodName: definition.methodName, category, item, unit, quantityPerExecution,
      quantityPerMonth: rounded(allocatedMonthlyExecutions * quantityPerExecution), incubationOrControl, evidenceIds: definition.evidenceIds, status: "site-confirmation-required",
    });
    for (const [resourceId, resourceName, unit, demandPerExecution, basis] of definition.capacity) capacity.push({
      id: `${id}:${resourceId}`, methodRequirementId: id, productName: definition.programName, resourceId, resourceName, unit, demandPerExecution,
      monthlyDemand: rounded(allocatedMonthlyExecutions * demandPerExecution), basis: `${basis}; application-level concept node, not observed site cycle data`, evidenceIds: definition.evidenceIds,
    });
  }
  return { requirements, bom, capacity };
}
