import { describe, expect, it } from "vitest";
import { buildCareerAnalysis, buildCareerSnapshotSummary, careerProfileFilename, defaultCareerProfile } from "../../shared/career-blueprint";
import { careerBlueprintPdf } from "../career-blueprint";

describe("Personal Career Blueprint", () => {
  const profile = { ...defaultCareerProfile, fullName: "Alex Morgan", location: "Toronto, Canada" };

  it("turns profile evidence into ranked routes and explicit gaps", () => {
    const analysis = buildCareerAnalysis(profile);
    expect(analysis.routes).toHaveLength(3);
    expect(analysis.selectedRoute.title).toBe("Senior QC Microbiologist");
    expect(analysis.competencies).toHaveLength(6);
    expect(analysis.recommendations).toHaveLength(3);
    expect(analysis.assumptions).toHaveLength(4);
    expect(analysis.readinessIndex).toBeGreaterThan(0);
    expect(analysis.routes.every((route) => typeof route.fitScore === "number")).toBe(true);
    expect(analysis.competencies.every((item) => item.current >= 20 && item.current <= 96)).toBe(true);
  });

  it("respects the user's selected route", () => {
    const analysis = buildCareerAnalysis({ ...profile, selectedRouteId: "qa-investigation-specialist" }, "qa-investigation-specialist");
    expect(analysis.selectedRoute.title).toBe("QA Investigation Specialist");
  });

  it("builds milestone ranges from the user's actual planning horizon", () => {
    const analysis = buildCareerAnalysis({ ...profile, targetHorizonMonths: 18, targetRole: "QA Investigation Specialist", primaryConstraint: "english" });
    expect(analysis.milestones.map((item) => item.months)).toEqual(["Months 1-4", "Months 5-9", "Months 10-14", "Months 15-18"]);
    expect(analysis.assumptions.at(-1)).toContain("technical English confidence");
  });

  it("builds a portable free snapshot with decision, evidence, action, and trust boundaries", () => {
    const summary = buildCareerSnapshotSummary(profile);
    expect(summary).toContain("# Alex Morgan — Career Snapshot");
    expect(summary).toContain("Selected route: Senior QC Microbiologist");
    expect(summary).toContain("## First proof-building move");
    expect(summary).toContain("## Why Atlas has this confidence");
    expect(summary).toContain("## Assumptions to confirm");
    expect(summary).toContain("self-assessment decision support");
  });

  it("generates a named 38-page PDF with the planning boundary", async () => {
    const pdf = await careerBlueprintPdf(profile);
    expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
    expect(pdf.length).toBeGreaterThan(20_000);
    expect(pdf.toString("latin1")).toContain("/Count 38");
    expect(careerProfileFilename(profile)).toBe("alex-morgan-career-blueprint.pdf");
  });

  it("generates the full role playbook across every supported career track", async () => {
    const tracks = ["qc-microbiology", "quality-assurance", "regulatory-affairs", "manufacturing-quality", "other"] as const;
    const outputs = await Promise.all(tracks.map((careerTrack) => careerBlueprintPdf({ ...profile, careerTrack })));
    expect(outputs.every((pdf) => pdf.toString("latin1").includes("/Count 38"))).toBe(true);
  });
});
