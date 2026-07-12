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
  requirementType: z.enum(["microbial-enumeration", "specified-microorganisms", "method-suitability"]),
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
  category: z.enum(["sample", "media", "diluent", "neutralizer", "membrane", "plate", "reference-strain", "control"]),
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
      requirements.push({ id: `${product.id}:suitability`, productId: product.id, productName: product.name, market: product.markets.join(", "), requirementType: "method-suitability", methodId: "method-suitability", methodName: "Product-specific method suitability", monthlyExecutions: 0, allocatedMonthlyExecutions: 0, operationalDemandStatus: "allocated", execution: product.execution, acceptanceCriteria: "Recovery and neutralization acceptance must be defined in the approved protocol; Atlas does not infer acceptance limits.", verificationRequirement: "Blocking before method use where suitability is required or unknown.", evidenceIds: ["site-approved-methods", "usp-61-context", "usp-62-context"], applicability: `${product.name} has method-suitability status ${product.methodSuitability}.`, limitations: "Requires approved protocol, challenge organisms, product matrix details and qualified review." });
    }
  }
  return { requirements, bom, capacity };
}
