import { describe, expect, it } from "vitest";
import { METHOD_NAVIGATOR_RECORDS, searchMethodNavigator, standardsForMethod } from "../client/src/data/methodStandardsNavigator";

describe("method and standards navigator", () => {
  it("keeps the public catalog bounded to defined application packs", () => {
    expect(METHOD_NAVIGATOR_RECORDS).toHaveLength(8);
    expect(METHOD_NAVIGATOR_RECORDS.every((record) => record.coverage !== undefined)).toBe(true);
  });

  it("finds methods through mapped standard identifiers", () => {
    const result = searchMethodNavigator("usp-85");
    expect(result.methods.map((record) => record.id)).toContain("bet-lal");
    expect(result.standards.map((standard) => standard.id)).toContain("usp-85");
  });

  it("returns source mappings without implying executable readiness", () => {
    const water = METHOD_NAVIGATOR_RECORDS.find((record) => record.id === "water-microbiology")!;
    expect(water.coverage).toBe("source-mapped");
    expect(standardsForMethod(water).map((standard) => standard.id)).toContain("usp-1231");
    expect(water.unresolvedCount).toBeGreaterThan(0);
  });
});
