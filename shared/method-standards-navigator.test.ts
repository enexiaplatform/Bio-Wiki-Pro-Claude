import { describe, expect, it } from "vitest";
import { METHOD_NAVIGATOR_RECORDS, searchMethodNavigator, standardsForMethod } from "../client/src/data/methodStandardsNavigator";
import { EVIDENCE_SOURCE_CATALOG } from "./content-quality-registry";

describe("method and standards navigator", () => {
  it("keeps the public catalog bounded to defined application packs", () => {
    expect(METHOD_NAVIGATOR_RECORDS).toHaveLength(8);
    expect(METHOD_NAVIGATOR_RECORDS.every((record) => record.coverage !== undefined)).toBe(true);
    expect(METHOD_NAVIGATOR_RECORDS.every((record) => record.controlledRevisionStatus === "not-recorded")).toBe(true);
    expect(METHOD_NAVIGATOR_RECORDS.every((record) => record.dimensionStatus.structured + record.dimensionStatus.partial + record.dimensionStatus.evidenceRequired === 6)).toBe(true);
  });

  it("finds methods through mapped standard identifiers", () => {
    const result = searchMethodNavigator("usp-85");
    expect(result.methods.map((record) => record.id)).toContain("bet-lal");
    expect(result.standards.map((standard) => standard.id)).toContain("usp-85");
  });

  it("returns source mappings without implying executable readiness", () => {
    const water = METHOD_NAVIGATOR_RECORDS.find((record) => record.id === "water-microbiology")!;
    expect(water.coverage).toBe("structured-concept");
    expect(standardsForMethod(water).map((standard) => standard.id)).toContain("usp-1231");
    expect(water.unresolvedCount).toBeGreaterThan(0);
    expect(water.methodGraphStatus).toBe("executable-concept");
    expect(water.dimensionStatus.evidenceRequired).toBeGreaterThan(0);
  });

  it("binds every Navigator standard to the canonical evidence catalog", () => {
    const canonical = new Map(EVIDENCE_SOURCE_CATALOG.sources.map((source) => [source.id, source]));
    const standards = METHOD_NAVIGATOR_RECORDS.flatMap((record) => standardsForMethod(record));
    for (const standard of standards) {
      const source = canonical.get(standard.canonicalSourceId);
      expect(source, standard.id).toBeDefined();
      expect(standard.publisher, standard.id).toBe(source?.publisher);
      expect(standard.version, standard.id).toBe(source?.edition);
      expect(standard.locator, standard.id).toBe(source?.locator);
    }
  });
});
