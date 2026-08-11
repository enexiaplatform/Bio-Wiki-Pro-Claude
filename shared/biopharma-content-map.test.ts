import { describe, expect, it } from "vitest";
import { BIOPHARMA_CONTENT_MAP, getBiopharmaCoverage, summarizeBiopharmaCoverage } from "./biopharma-content-map.js";

describe("Biopharma product and process quality coverage", () => {
  it("makes lifecycle coverage and gaps explicit", () => {
    expect(BIOPHARMA_CONTENT_MAP.map((area) => area.id)).toEqual([
      "product-process-control-strategy",
      "cell-substrate-and-raw-materials",
      "upstream-process-control",
      "downstream-purification-and-clearance",
      "process-validation-and-continued-verification",
      "characterization-potency-and-specifications",
      "formulation-fill-finish-and-stability",
      "comparability-tech-transfer-and-lifecycle",
      "advanced-modalities",
    ]);
    expect(BIOPHARMA_CONTENT_MAP.every((area) => area.materialGaps.length > 0)).toBe(true);
    expect(BIOPHARMA_CONTENT_MAP.every((area) => area.requiredReviewerRoles.length > 0)).toBe(true);
  });

  it("fails honestly for areas that are not covered", () => {
    expect(getBiopharmaCoverage("upstream-process-control")?.status).toBe("mapped");
    expect(getBiopharmaCoverage("advanced-modalities")?.currentLessonSlugs).toEqual([]);
    expect(summarizeBiopharmaCoverage()).toEqual({
      mapped: 8,
      "evidence-required": 0,
      "not-covered": 1,
    });
  });

  it("does not represent QC assays as complete biopharma lifecycle coverage", () => {
    const unmapped = BIOPHARMA_CONTENT_MAP.filter((area) => area.status !== "mapped");
    expect(unmapped.map((area) => area.id)).toEqual(["advanced-modalities"]);
    expect(BIOPHARMA_CONTENT_MAP.filter((area) => area.status === "mapped").every((area) => area.currentAssetIds.length > 0)).toBe(true);
  });

  it("registers dedicated upstream and downstream decision content without claiming full coverage", () => {
    expect(getBiopharmaCoverage("upstream-process-control")?.currentLessonSlugs).toContain("biopharma-upstream-process-control");
    expect(getBiopharmaCoverage("downstream-purification-and-clearance")?.currentLessonSlugs).toContain("biopharma-downstream-purification-clearance");
    expect(getBiopharmaCoverage("downstream-purification-and-clearance")?.status).toBe("mapped");
  });

  it("registers formulation and stability decision content without claiming qualified coverage", () => {
    const area = getBiopharmaCoverage("formulation-fill-finish-and-stability");
    expect(area?.currentLessonSlugs).toContain("biopharma-formulation-fill-finish-stability");
    expect(area?.sourceIds).toContain("ICH-Q5C");
    expect(area?.status).toBe("mapped");
    expect(area?.currentAssetIds).toContain("biopharma-formulation-stability");
  });

  it("registers integrated analytical decision content and current reference-standard evidence without claiming qualified coverage", () => {
    const area = getBiopharmaCoverage("characterization-potency-and-specifications");
    expect(area?.currentLessonSlugs).toContain("biopharma-integrated-analytical-control-strategy");
    expect(area?.sourceIds).toContain("WHO-IBRS-2026");
    expect(area?.sourceIds).toContain("ICH-Q6-R1-CONCEPT-2024");
    expect(area?.status).toBe("mapped");
    expect(area?.currentAssetIds).toContain("biopharma-analytical-control-strategy");
  });

  it("registers integrated technology-transfer evidence without claiming transfer or Domain Pack readiness", () => {
    const area = getBiopharmaCoverage("comparability-tech-transfer-and-lifecycle");
    expect(area?.currentLessonSlugs).toContain("biopharma-integrated-technology-transfer");
    expect(area?.sourceIds).toContain("WHO-TRS-1044-ANNEX4");
    expect(area?.sourceIds).toContain("ICH-Q5E");
    expect(area?.sourceIds).toContain("ICH-Q14");
    expect(area?.status).toBe("mapped");
    expect(area?.currentAssetIds).toContain("biopharma-technology-transfer");
  });

  it("registers material and single-use decision content without claiming material approval or full coverage", () => {
    const area = getBiopharmaCoverage("cell-substrate-and-raw-materials");
    expect(area?.currentLessonSlugs).toContain("biopharma-raw-ancillary-materials-control");
    expect(area?.sourceIds).toContain("WHO-TRS-996-ANNEX3");
    expect(area?.sourceIds).toContain("EU-GMP-ANNEX1-2022");
    expect(area?.status).toBe("mapped");
    expect(area?.currentAssetIds).toEqual(expect.arrayContaining(["biopharma-cell-substrate-control", "biopharma-materials-control"]));
  });

  it("registers cell-line, bank and genetic-stability decision content without claiming bank or Domain Pack approval", () => {
    const area = getBiopharmaCoverage("cell-substrate-and-raw-materials");
    expect(area?.currentLessonSlugs).toContain("biopharma-cell-line-cell-bank-genetic-stability");
    expect(area?.sourceIds).toContain("ICH-Q5B");
    expect(area?.sourceIds).toContain("WHO-TRS-978-ANNEX3");
    expect(area?.status).toBe("mapped");
  });

  it("registers process-validation and continued-verification decision content without claiming a validated state", () => {
    const area = getBiopharmaCoverage("process-validation-and-continued-verification");
    expect(area?.currentLessonSlugs).toContain("biopharma-process-validation-continued-verification");
    expect(area?.sourceIds).toContain("EMA-BIOLOGICS-PROCESS-VALIDATION-2016");
    expect(area?.sourceIds).toContain("EU-GMP-ANNEX15-2015");
    expect(area?.status).toBe("mapped");
    expect(area?.currentAssetIds).toContain("biopharma-process-validation-cpv");
  });
});
