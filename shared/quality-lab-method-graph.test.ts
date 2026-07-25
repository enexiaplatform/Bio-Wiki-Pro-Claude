import { describe, expect, it } from "vitest";
import {
  compileNonSterileMethodGraph,
  productProfileSchema,
  type ProductProfile,
} from "./quality-lab-method-graph";

function makeProduct(overrides: Partial<ProductProfile> = {}): ProductProfile {
  return productProfileSchema.parse({
    id: "p1",
    name: "Solid oral family",
    dosageForm: "tablet-capsule",
    markets: ["vietnam"],
    monthlyBatches: 10,
    samplesPerBatch: 3,
    microbialLimitsRequired: true,
    specifiedOrganismsRequired: true,
    methodSuitability: "pending",
    execution: "in-house",
    ...overrides,
  });
}

describe("quality lab method graph", () => {
  it("derives the method BOM from product, market and execution inputs for the non-sterile wedge", () => {
    const graph = compileNonSterileMethodGraph([makeProduct({ preservativeOrNeutralizerNote: "Polysorbate 80 neutralizer to confirm" })]);

    // One requirement per required test type, plus the suitability gate.
    const enumeration = graph.requirements.find((item) => item.requirementType === "microbial-enumeration");
    const specified = graph.requirements.find((item) => item.requirementType === "specified-microorganisms");
    const suitability = graph.requirements.find((item) => item.requirementType === "method-suitability");
    expect(enumeration?.methodId).toBe("usp-61-concept");
    expect(specified?.methodId).toBe("usp-62-concept");
    expect(suitability?.methodId).toBe("method-suitability");
    expect(graph.requirements).toHaveLength(3);

    // 10 batches × 3 samples per batch = 30 monthly executions, fully allocated for a single market.
    expect(enumeration?.monthlyExecutions).toBe(30);
    expect(enumeration?.allocatedMonthlyExecutions).toBe(30);
    expect(enumeration?.operationalDemandStatus).toBe("allocated");

    // BOM reflects product inputs: sample mass, dilution volume, scaled media demand.
    const sample = graph.bom.find((item) => item.category === "sample");
    expect(sample?.quantityPerExecution).toBe(10);
    expect(sample?.quantityPerMonth).toBe(300);
    const diluent = graph.bom.find((item) => item.category === "diluent" && item.methodRequirementId === enumeration?.id);
    expect(diluent?.quantityPerExecution).toBe(100);
    expect(diluent?.quantityPerMonth).toBe(3000);
    const media = graph.bom.find((item) => item.category === "media" && item.methodRequirementId === enumeration?.id);
    expect(media?.quantityPerExecution).toBe(2);
    expect(media?.quantityPerMonth).toBe(60);
    const neutralizer = graph.bom.find((item) => item.category === "neutralizer");
    expect(neutralizer?.item).toBe("Polysorbate 80 neutralizer to confirm");
    expect(neutralizer?.quantityPerMonth).toBe(30);
    expect(graph.bom.every((item) => item.status === "site-confirmation-required")).toBe(true);

    // In-house execution creates capacity demand on the expected resources.
    expect(graph.capacity.map((item) => item.resourceId)).toEqual(expect.arrayContaining(["incubator-20-25", "incubator-30-35", "bsc", "autoclave"]));
    const fungal = graph.capacity.find((item) => item.methodRequirementId === enumeration?.id && item.resourceId === "incubator-20-25");
    expect(fungal?.demandPerExecution).toBe(10);
    expect(fungal?.monthlyDemand).toBe(300);
  });

  it("scales BOM and capacity with dilution volume and extended incubation", () => {
    const standard = compileNonSterileMethodGraph([makeProduct()]);
    const adjusted = compileNonSterileMethodGraph([makeProduct({ dilutionVolumeMl: 250, incubationProfile: "extended" })]);

    expect(adjusted.bom.find((item) => item.category === "diluent")?.quantityPerExecution).toBe(250);
    const standardFungal = standard.capacity.find((item) => item.resourceId === "incubator-20-25");
    const adjustedFungal = adjusted.capacity.find((item) => item.resourceId === "incubator-20-25");
    expect(adjustedFungal?.demandPerExecution).toBe(14);
    expect(adjustedFungal!.monthlyDemand).toBeGreaterThan(standardFungal!.monthlyDemand);
    // Hands-on hours and media-liters are not incubation-driven.
    const standardBsc = standard.capacity.find((item) => item.resourceId === "bsc");
    const adjustedBsc = adjusted.capacity.find((item) => item.resourceId === "bsc");
    expect(adjustedBsc?.demandPerExecution).toBe(standardBsc?.demandPerExecution);
  });

  it("blocks multi-market products with an unknown execution strategy instead of auto-assuming one", () => {
    const unresolved = compileNonSterileMethodGraph([makeProduct({ markets: ["vietnam", "asean"] })]);

    const testRequirements = unresolved.requirements.filter((item) => item.requirementType !== "method-suitability");
    expect(testRequirements).toHaveLength(4);
    expect(testRequirements.every((item) => item.operationalDemandStatus === "unresolved")).toBe(true);
    expect(testRequirements.every((item) => item.allocatedMonthlyExecutions === 0)).toBe(true);
    // No physical load is fabricated while the allocation is unknown.
    expect(unresolved.capacity).toEqual([]);
    expect(unresolved.bom.every((item) => item.quantityPerMonth === 0)).toBe(true);
    expect(testRequirements.reduce((total, item) => total + item.allocatedMonthlyExecutions, 0)).toBe(0);

    // Only an explicit strategy unlocks allocation — shared counts one physical execution…
    const shared = compileNonSterileMethodGraph([makeProduct({ markets: ["vietnam", "asean"], marketExecutionStrategy: "shared-across-markets" })]);
    const sharedEnumeration = shared.requirements.filter((item) => item.requirementType === "microbial-enumeration");
    expect(sharedEnumeration.map((item) => item.allocatedMonthlyExecutions)).toEqual([30, 0]);
    expect(sharedEnumeration.every((item) => item.operationalDemandStatus === "allocated")).toBe(true);
    expect(shared.capacity.length).toBeGreaterThan(0);

    // …and separate-by-market counts each market independently.
    const separate = compileNonSterileMethodGraph([makeProduct({ markets: ["vietnam", "asean"], marketExecutionStrategy: "separate-by-market" })]);
    const separateEnumeration = separate.requirements.filter((item) => item.requirementType === "microbial-enumeration");
    expect(separateEnumeration.map((item) => item.allocatedMonthlyExecutions)).toEqual([30, 30]);
  });

  it("omits site capacity load for outsourced products while keeping the method trace", () => {
    const graph = compileNonSterileMethodGraph([makeProduct({ execution: "outsource" })]);
    expect(graph.requirements.some((item) => item.requirementType === "microbial-enumeration")).toBe(true);
    expect(graph.capacity).toEqual([]);
    // Outsourced demand still sizes consumable purchasing.
    expect(graph.bom.some((item) => item.quantityPerMonth > 0)).toBe(true);
  });

  it("keeps evidence and rule trace on every generated method node", () => {
    const graph = compileNonSterileMethodGraph([
      makeProduct(),
      makeProduct({ id: "p2", name: "Oral liquid family", dosageForm: "oral-liquid", markets: ["asean", "eu"], monthlyBatches: 4, samplesPerBatch: 2, specifiedOrganismsRequired: false, methodSuitability: "verified" }),
    ]);

    const requirementIds = new Set(graph.requirements.map((item) => item.id));
    for (const requirement of graph.requirements) {
      expect(requirement.evidenceIds.length).toBeGreaterThanOrEqual(1);
      expect(requirement.acceptanceCriteria.length).toBeGreaterThan(0);
      expect(requirement.verificationRequirement.length).toBeGreaterThan(0);
      expect(requirement.applicability).toContain(requirement.productName);
      expect(requirement.limitations.length).toBeGreaterThan(0);
    }
    const suitability = graph.requirements.find((item) => item.requirementType === "method-suitability");
    expect(suitability?.evidenceIds).toContain("site-approved-methods");

    for (const item of graph.bom) {
      expect(requirementIds.has(item.methodRequirementId)).toBe(true);
      expect(item.evidenceIds.length).toBeGreaterThanOrEqual(1);
      expect(item.incubationOrControl.length).toBeGreaterThan(0);
    }
    for (const demand of graph.capacity) {
      expect(requirementIds.has(demand.methodRequirementId)).toBe(true);
      expect(demand.evidenceIds.length).toBeGreaterThanOrEqual(1);
      expect(demand.basis.length).toBeGreaterThan(0);
    }

    // Compendial context travels with the generated nodes, never alone.
    const enumerated = graph.requirements.find((item) => item.requirementType === "microbial-enumeration");
    expect(enumerated?.evidenceIds).toEqual(expect.arrayContaining(["usp-61-context", "site-approved-methods", "atlas-microbiology-benchmarks-v1"]));
  });
});
