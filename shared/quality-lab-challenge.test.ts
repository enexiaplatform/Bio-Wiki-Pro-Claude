import { describe, expect, it } from "vitest";
import { createQualityLabProject, defaultQualityLabInput } from "./quality-lab";
import { analyzeQualityLabChallenge, analyzeQualityLabChallengeWithSpecialists, rankChallengeFindings } from "./quality-lab-challenge";
import { analyzeQualityLabSensitivity } from "./quality-lab-sensitivity";
import { captureSpecialistBasis } from "./quality-lab-twin-specialists";
import { defaultTurnaroundFeasibilityInput } from "./quality-lab-turnaround";

describe("Challenge ranking", () => {
  it("rejects removed evidence gaps and altered lineage even when totals are unchanged", () => {
    const project = createQualityLabProject(defaultQualityLabInput, "synthetic-integrity");
    project.blueprint.unresolvedInputs = [];
    expect(analyzeQualityLabChallenge(project).status).toBe("blocked");
    const changedTrace = createQualityLabProject(defaultQualityLabInput, "synthetic-trace");
    changedTrace.blueprint.decisionLineage[0].unresolvedInputIds = [];
    changedTrace.blueprint.decisionLineage[0].summary = "altered explanation";
    expect(analyzeQualityLabChallenge(changedTrace).status).toBe("blocked");
  });
  it("includes only accepted current specialist warnings and reports missing coverage", async () => {
    const source = createQualityLabProject(defaultQualityLabInput, "synthetic-specialist-challenge");
    const missing = await analyzeQualityLabChallengeWithSpecialists(source);
    expect(missing.findings.some((finding) => finding.kind === "specialist-warning")).toBe(false);
    const record = await captureSpecialistBasis(source, "turnaround", { ...defaultTurnaroundFeasibilityInput(source), analystFteAvailable: 1 });
    const accepted = createQualityLabProject({ ...source.input, specialistBasis: [record] }, source.id);
    const result = await analyzeQualityLabChallengeWithSpecialists(accepted);
    expect(result.findings.some((finding) => finding.id === "specialist:turnaround:execution-overload")).toBe(true);
    const changed = createQualityLabProject({ ...accepted.input, shifts: 2 }, source.id);
    expect((await analyzeQualityLabChallengeWithSpecialists(changed)).findings.some((finding) => finding.kind === "specialist-warning")).toBe(false);
  });
  it("preserves the sensitivity engine's actual criterion and evidence requirement", () => {
    const project = createQualityLabProject(defaultQualityLabInput, "synthetic-sensitivity-challenge");
    const drivers = analyzeQualityLabSensitivity(project).drivers;
    const findings = analyzeQualityLabChallenge(project).findings.filter((finding) => finding.kind === "sensitivity");
    expect(findings.length).toBeGreaterThan(0);
    for (const finding of findings) {
      const driver = drivers.find((candidate) => `sensitivity:${candidate.id}` === finding.id)!;
      expect(finding.nextAction).toBe(driver.evidenceNeeded);
      expect(finding.confidence).toBe(driver.modelConfidence);
      if (driver.nearestThreshold) expect(finding.explanation).toContain(driver.nearestThreshold.criterion);
    }
  });
  it("traces findings to actual unresolved inputs and leaves the saved model untouched", () => {
    const project = createQualityLabProject(defaultQualityLabInput, "synthetic-challenge");
    const original = JSON.stringify(project);
    const result = analyzeQualityLabChallenge(project);
    expect(result.status).toBe("ready");
    expect(result.findings.filter((finding) => finding.kind === "unresolved-input")).toHaveLength(project.blueprint.unresolvedInputs.length);
    for (const finding of result.findings) {
      expect(finding.score).toBe(Object.values(finding.factors).reduce((sum, value) => sum + value, 0));
      for (const id of finding.lineageIds) expect(project.blueprint.decisionLineage.some((lineage) => lineage.id === id)).toBe(true);
      expect(finding.nextAction.length).toBeGreaterThan(0);
    }
    expect(JSON.stringify(project)).toBe(original);
    expect(result.findings.map((finding) => finding.id)).toEqual(analyzeQualityLabChallenge(project).findings.map((finding) => finding.id));
  });
  it("raises threshold proximity only from the modeled distance", () => {
    const distant = analyzeQualityLabChallenge(createQualityLabProject(defaultQualityLabInput, "synthetic-distant"));
    const near = analyzeQualityLabChallenge(createQualityLabProject({ ...defaultQualityLabInput, finishedBatchesPerMonth: 52 }, "synthetic-near"));
    const threshold = near.findings.find((finding) => finding.kind === "equipment-threshold")!;
    expect(threshold.explanation).toContain("53 batches/month");
    expect(threshold.factors.proximity).toBe(30);
    expect(threshold.factors.proximity).toBeGreaterThan(distant.findings.find((finding) => finding.kind === "equipment-threshold")!.factors.proximity);
  });
  it("uses stable ties and blocks stale saved outputs", () => {
    const project = createQualityLabProject(defaultQualityLabInput, "synthetic-order");
    const finding = analyzeQualityLabChallenge(project).findings[0];
    expect(rankChallengeFindings([{ ...finding, id: "b" }, { ...finding, id: "a" }]).map((item) => item.id)).toEqual(["a", "b"]);
    project.blueprint.future.totalTeamFte += 1;
    const result = analyzeQualityLabChallenge(project);
    expect(result.status).toBe("blocked");
    expect(result.findings).toEqual([]);
  });
});
