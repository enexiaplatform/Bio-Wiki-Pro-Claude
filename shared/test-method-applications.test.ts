import { describe, expect, it } from "vitest";
import { applicationReadinessBaselineRows, assessApplicationPack, assessApplicationPortfolio, testMethodApplicationPacks } from "../client/src/data/testMethodApplications";

describe("Test Method Application Packs", () => {
  it("keeps the microbiology-first application sequence explicit and evidence gated", () => {
    expect(testMethodApplicationPacks.map((pack) => pack.id)).toEqual(["water-microbiology", "growth-promotion-media-qc", "bioburden-filtration", "specified-microorganisms", "bet-lal", "environmental-monitoring", "microbial-identification"]);
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

  it("advances growth promotion and bioburden into evidence-gated application development", () => {
    const growthPromotion = testMethodApplicationPacks.find((pack) => pack.id === "growth-promotion-media-qc");
    const bioburden = testMethodApplicationPacks.find((pack) => pack.id === "bioburden-filtration");

    expect(growthPromotion).toMatchObject({ stage: "application-development", methodGraphStatus: "workflow-only", guideHref: "/blog/growth-promotion-media-qc-application-pack" });
    expect(bioburden).toMatchObject({ stage: "application-development", methodGraphStatus: "workflow-only", guideHref: "/blog/bioburden-membrane-filtration-application-pack" });
    expect(growthPromotion?.dimensions.find((dimension) => dimension.id === "intended-use")?.status).toBe("structured");
    expect(bioburden?.dimensions.find((dimension) => dimension.id === "intended-use")?.status).toBe("structured");
    expect(assessApplicationPack(growthPromotion!).blockers.map((item) => item.id)).toEqual(["lifecycle"]);
    expect(assessApplicationPack(bioburden!).blockers.map((item) => item.id)).toEqual(["lifecycle"]);
  });

  it("advances environmental monitoring without inventing site limits or executable maturity", () => {
    const environmentalMonitoring = testMethodApplicationPacks.find((pack) => pack.id === "environmental-monitoring");
    expect(environmentalMonitoring).toMatchObject({
      stage: "application-development",
      methodGraphStatus: "workflow-only",
      guideHref: "/blog/pharmaceutical-environmental-monitoring-application-pack",
    });
    expect(environmentalMonitoring?.dimensions.find((dimension) => dimension.id === "matrix")?.status).toBe("partial");
    expect(assessApplicationPack(environmentalMonitoring!).blockers.map((item) => item.id)).toEqual(["lifecycle"]);
  });

  it("deepens microbial identification while keeping the absent executable node explicit", () => {
    const microbialIdentification = testMethodApplicationPacks.find((pack) => pack.id === "microbial-identification");
    expect(microbialIdentification).toMatchObject({
      stage: "application-development",
      methodGraphStatus: "not-executable",
      guideHref: "/blog/pharmaceutical-microbial-identification-application-pack",
    });
    expect(microbialIdentification?.dimensions.find((dimension) => dimension.id === "intended-use")?.status).toBe("structured");
    expect(assessApplicationPack(microbialIdentification!).blockers.map((item) => item.id)).toEqual(["lifecycle"]);
    expect(assessApplicationPack(microbialIdentification!).readyForExecutableMethodGraph).toBe(false);
  });

  it("deepens BET/LAL without removing the specialist gate", () => {
    const bet = testMethodApplicationPacks.find((pack) => pack.id === "bet-lal");
    expect(bet).toMatchObject({
      stage: "specialist-gated",
      methodGraphStatus: "workflow-only",
      guideHref: "/blog/bacterial-endotoxins-bet-lal-application-pack",
    });
    expect(bet?.dimensions.find((dimension) => dimension.id === "intended-use")?.status).toBe("structured");
    expect(assessApplicationPack(bet!).blockers.map((item) => item.id)).toEqual(["lifecycle"]);
    expect(assessApplicationPack(bet!).readyForExecutableMethodGraph).toBe(false);
  });

  it("does not mistake partial dimensions for executable readiness", () => {
    for (const pack of testMethodApplicationPacks) {
      const assessment = assessApplicationPack(pack);
      expect(assessment.unresolved.length).toBe(assessment.partial.length + assessment.blockers.length);
      expect(assessment.unresolved.length).toBeGreaterThan(0);
      expect(assessment.readyForExecutableMethodGraph).toBe(false);
    }

    const portfolio = assessApplicationPortfolio();
    expect(portfolio).toEqual({
      packCount: 7,
      dimensionCount: 42,
      structuredCount: 7,
      partialCount: 28,
      blockerCount: 7,
      executableReadyCount: 0,
    });
  });

  it("exports one readiness baseline row for every application dimension", () => {
    const [header, ...rows] = applicationReadinessBaselineRows();
    expect(rows).toHaveLength(42);
    expect(new Set(rows.map((row) => row[0])).size).toBe(42);
    expect(header).toEqual(expect.arrayContaining(["application_id", "dimension", "current_status", "required_evidence", "method_graph_eligibility", "eligibility_rationale"]));
    expect(rows.every((row) => row.length === header.length)).toBe(true);
    expect(rows.filter((row) => row[4] === "structured")).toHaveLength(7);
    expect(rows.filter((row) => row[4] === "evidence-required")).toHaveLength(7);
  });

  it("separates specified-organism absence and objectionability from enumeration", () => {
    const specified = testMethodApplicationPacks.find((pack) => pack.id === "specified-microorganisms");
    expect(specified).toMatchObject({
      stage: "application-development",
      methodGraphStatus: "executable-concept",
      guideHref: "/blog/specified-microorganisms-objectionability-application-pack",
    });
    expect(specified?.dimensions.find((dimension) => dimension.id === "method")?.currentBasis).toContain("USP <62> concept node");
    expect(assessApplicationPack(specified!).readyForExecutableMethodGraph).toBe(false);
  });
});
