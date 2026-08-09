import { describe, expect, it } from "vitest";
import {
  buildCareerAnalysis,
  buildCareerProofExperiment,
  buildCareerSnapshotSummary,
  careerProfileFilename,
  defaultCareerProfile,
  formatCareerProofExperiment,
} from "../../shared/career-blueprint";
import { careerBlueprintPdf, careerBlueprintSamplePdf } from "../career-blueprint";

describe("Personal Career Blueprint", () => {
  const profile = { ...defaultCareerProfile, fullName: "Alex Morgan", location: "Toronto, Canada" };

  it("turns profile evidence into ranked routes and explicit gaps", () => {
    const analysis = buildCareerAnalysis(profile);
    expect(analysis.contractVersion).toBe("career-analysis/v2");
    expect(analysis.routes).toHaveLength(3);
    expect(analysis.selectedRoute.title).toBe("Senior QC Microbiologist");
    expect(analysis.competencies).toHaveLength(6);
    expect(analysis.recommendations).toHaveLength(3);
    expect(analysis.assumptions).toHaveLength(4);
    expect(analysis.readinessIndex).toBeGreaterThan(0);
    expect(analysis.routes.every((route) => typeof route.fitScore === "number")).toBe(true);
    expect(analysis.competencies.every((item) => item.current >= 20 && item.current <= 96)).toBe(true);
    expect(analysis.recommendations.every((item) => item.influencedBy.length >= 4 && item.evidenceMissing.length >= 1)).toBe(true);
    expect(analysis.requirementEvidence.every((item) => item.selfRating && item.observedEvidence && item.reviewerConfirmedEvidence)).toBe(true);
  });

  it("keeps a 20-profile golden set materially differentiated", () => {
    const tracks = ["qc-microbiology", "quality-assurance", "regulatory-affairs", "manufacturing-quality", "other"] as const;
    const signatures = Array.from({ length: 20 }, (_, index) => {
      const level = (index % 5) + 1;
      const candidate = {
        ...profile,
        fullName: `Golden Profile ${index + 1}`,
        careerTrack: tracks[index % tracks.length],
        yearsExperience: 1 + index,
        targetRole: index % 2 ? "Quality Systems Manager" : "Technical Specialist",
        primaryConstraint: (["limited-ownership", "time", "english", "experience", "manager-support"] as const)[index % 5],
        methods: [`Method ${index + 1}`],
        qualityActivities: [`Quality activity ${index + 1}`],
        evidenceActivities: [`Observed evidence ${index + 1}`],
        ratings: {
          technicalExecution: level,
          gmpEvidence: ((index + 1) % 5) + 1,
          investigationOwnership: ((index + 2) % 5) + 1,
          documentation: ((index + 3) % 5) + 1,
          leadership: ((index + 4) % 5) + 1,
        },
      };
      const analysis = buildCareerAnalysis(candidate);
      return JSON.stringify({
        route: analysis.selectedRoute.title,
        rationale: analysis.selectedRoute.fitReason,
        gap: analysis.biggestGap,
        action: analysis.recommendations[0].firstAction,
        inputTrace: analysis.recommendations[0].influencedBy,
      });
    });
    expect(new Set(signatures).size).toBe(20);
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

  it("turns the priority gap into a bounded proof experiment with review and stop controls", () => {
    const experiment = buildCareerProofExperiment(profile);
    const formatted = formatCareerProofExperiment(profile);

    expect(experiment.duration).toBe("30 days");
    expect(experiment.objective).toContain("Senior QC Microbiologist");
    expect(experiment.weeklyCadence).toHaveLength(4);
    expect(experiment.reviewerQuestion).toContain("credibly claim I owned");
    expect(experiment.changeSignal).toContain("no qualified reviewer");
    expect(formatted).toContain("## Hypothesis to test");
    expect(formatted).toContain("## Review control");
    expect(formatted).toContain("## Four-week cadence");
    expect(formatted).toContain("Do not copy controlled records");
  });

  it("generates a named 38-page PDF with the planning boundary", async () => {
    const pdf = await careerBlueprintPdf(profile);
    expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
    expect(pdf.length).toBeGreaterThan(20_000);
    expect(pdf.toString("latin1")).toContain("/Count 38");
    expect(careerProfileFilename(profile)).toBe("alex-morgan-career-blueprint.pdf");
  });

  it("generates a short illustrative sample from the same engine (fictional profile, first pages)", async () => {
    const pdf = await careerBlueprintSamplePdf();
    expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
    // Cover + 4 content pages — deliberately much shorter than the paid 38.
    expect(pdf.toString("latin1")).toContain("/Count 5");
  });

  it("generates the full role playbook across every supported career track", async () => {
    const tracks = ["qc-microbiology", "quality-assurance", "regulatory-affairs", "manufacturing-quality", "other"] as const;
    const outputs = await Promise.all(tracks.map((careerTrack) => careerBlueprintPdf({ ...profile, careerTrack })));
    expect(outputs.every((pdf) => pdf.toString("latin1").includes("/Count 38"))).toBe(true);
  });
});
