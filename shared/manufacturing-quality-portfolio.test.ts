import { describe, expect, it } from "vitest";
import { MANUFACTURING_QUALITY_PORTFOLIO, getPortfolioLane, summarizeManufacturingQualityPortfolio } from "./manufacturing-quality-portfolio.js";

describe("manufacturing quality portfolio", () => {
  it("covers the four strategic lanes without claiming Compiler readiness", () => {
    expect(MANUFACTURING_QUALITY_PORTFOLIO.map((lane) => lane.id)).toEqual(["pharma-api", "pharma-drug-product", "biopharma", "cross-cutting-quality-rd"]);
    expect(MANUFACTURING_QUALITY_PORTFOLIO.every((lane) => lane.compilerDomainPackReady === false)).toBe(true);
  });

  it("represents R&D, process, manufacturing science, QC and quality/regulatory work", () => {
    const functions = new Set(MANUFACTURING_QUALITY_PORTFOLIO.flatMap((lane) => lane.areas.flatMap((area) => area.functions)));
    expect([...functions].sort()).toEqual(["manufacturing-science", "process-development", "quality-and-regulatory", "quality-control", "research-and-development"]);
  });

  it("adds an evidence-led Pharma API slice while keeping material gaps visible", () => {
    const api = getPortfolioLane("pharma-api");
    const inputs = api?.areas.find((area) => area.id === "route-starting-materials-and-inputs");
    expect(inputs?.status).toBe("mapped");
    expect(inputs?.currentLessonSlugs).toContain("pharma-api-starting-materials-input-control");
    expect(inputs?.currentAssetIds).toContain("pharma-api-starting-material-input-control");
    const lifecycle = api?.areas.find((area) => area.id === "analytical-specifications-stability-and-lifecycle");
    expect(lifecycle?.status).toBe("mapped");
    expect(lifecycle?.currentLessonSlugs).toContain("pharma-api-analytical-specification-lifecycle");
    expect(lifecycle?.currentAssetIds).toContain("pharma-api-analytical-lifecycle");
    const impurity = api?.areas.find((area) => area.id === "impurity-fate-purge-and-control-strategy");
    expect(impurity?.status).toBe("mapped");
    expect(impurity?.currentLessonSlugs).toContain("pharma-api-process-development-impurity-control");
    expect(impurity?.currentAssetIds).toContain("pharma-api-impurity-control");
    expect(impurity?.sourceIds).toContain("ICH-Q3A-R2");
    expect(impurity?.materialGaps.length).toBeGreaterThan(0);
  });

  it("keeps unsupported modalities explicitly not covered", () => {
    expect(getPortfolioLane("pharma-drug-product")?.areas.find((area) => area.id === "formulation-and-material-attributes")?.status).toBe("mapped");
    expect(getPortfolioLane("biopharma")?.areas.find((area) => area.id === "advanced-modalities")?.status).toBe("not-covered");
    expect(summarizeManufacturingQualityPortfolio()).toEqual({ mapped: 14, partial: 0, "not-covered": 1 });
  });

  it("links every reviewable portfolio area to a decision package", () => {
    for (const lane of MANUFACTURING_QUALITY_PORTFOLIO) {
      for (const area of lane.areas) {
        if (area.status !== "not-covered") expect(area.decisionPackageIds.length).toBeGreaterThan(0);
        if (area.status === "mapped") expect(area.currentAssetIds.length).toBeGreaterThan(0);
      }
    }
  });

  it("closes the three cross-cutting asset gaps without claiming Domain Pack readiness", () => {
    const lane = getPortfolioLane("cross-cutting-quality-rd");
    expect(lane?.compilerDomainPackReady).toBe(false);
    expect(lane?.areas.every((area) => area.status === "mapped")).toBe(true);
    expect(lane?.areas.find((area) => area.id === "quality-systems-investigations-and-change")?.currentAssetIds).toContain("investigation-capa-change-evidence-loop");
    expect(lane?.areas.find((area) => area.id === "analytical-development-and-lifecycle")?.currentAssetIds).toContain("analytical-lifecycle-evidence-map");
    expect(lane?.areas.find((area) => area.id === "statistics-data-and-process-understanding")?.currentAssetIds).toContain("decision-led-statistics-evidence-map");
  });
});
