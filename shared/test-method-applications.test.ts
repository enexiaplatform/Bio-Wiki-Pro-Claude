import { describe, expect, it } from "vitest";
import { assessApplicationPack, testMethodApplicationPacks } from "../client/src/data/testMethodApplications";

describe("Test Method Application Packs", () => {
  it("keeps the microbiology-first application sequence explicit and evidence gated", () => {
    expect(testMethodApplicationPacks.map((pack) => pack.id)).toEqual(["water-microbiology", "growth-promotion-media-qc", "bioburden-filtration", "bet-lal", "environmental-monitoring", "microbial-identification"]);
    expect(new Set(testMethodApplicationPacks.map((pack) => pack.id)).size).toBe(testMethodApplicationPacks.length);
    for (const pack of testMethodApplicationPacks) {
      expect(pack.dimensions.map((dimension) => dimension.id)).toEqual(["intended-use", "matrix", "method", "decision", "resources", "lifecycle"]);
      expect(assessApplicationPack(pack).readyForExecutableMethodGraph).toBe(false);
      expect(pack.boundary.length).toBeGreaterThan(40);
      expect(pack.guideHref.startsWith("/blog/")).toBe(true);
    }
  });

  it("opens water microbiology as application development without overstating Method Graph maturity", () => {
    const water = testMethodApplicationPacks[0];
    expect(water.stage).toBe("application-development");
    expect(water.methodGraphStatus).toBe("workflow-only");
    expect(water.guideHref).toBe("/blog/pharmaceutical-water-microbiology-application-pack");
    expect(assessApplicationPack(water).blockers.map((item) => item.id)).toContain("lifecycle");
  });
});
