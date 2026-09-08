import { describe, expect, it } from "vitest";
import { createQualityLabProject, defaultQualityLabInput } from "./quality-lab";
import { analyzeQualityLabOperatingModel, createQualityLabOperatingModelInput } from "./quality-lab-operating-model";
import { captureSpecialistBasis, compareTwinSpecialists } from "./quality-lab-twin-specialists";
import { analyzeQualityLabChallengeWithSpecialists } from "./quality-lab-challenge";

describe("operating-model Challenge handoff", () => {
  it("ranks actual application blockers and major risks only after current basis acceptance", async () => {
    const source = createQualityLabProject(defaultQualityLabInput, "synthetic-operating-challenge");
    const input = createQualityLabOperatingModelInput(source);
    input.applications[0].externalLabQualified = "no";
    const record = await captureSpecialistBasis(source, "operating-model", input);
    const accepted = createQualityLabProject({ ...source.input, specialistBasis: [record] }, source.id);
    const frozen = JSON.stringify(accepted);
    const engine = analyzeQualityLabOperatingModel(accepted, input);
    const summary = (await compareTwinSpecialists(accepted, accepted)).find((item) => item.kind === "operating-model")!;
    expect(summary.status).toBe("ready");
    expect(summary.newSignals).toEqual([]);
    const expectedBlockers = engine.applications.flatMap((application) => application.missingEvidence.filter((gap) => gap.blocking));
    expect(summary.baselineSignals!.filter((signal) => signal.severity === "critical").map((signal) => signal.id))
      .toEqual(expectedBlockers.map((gap) => gap.id));
    for (const gap of expectedBlockers) {
      const signal = summary.baselineSignals!.find((item) => item.id === gap.id)!;
      expect(signal.title).toContain(gap.question);
      expect(signal.description).toContain(gap.evidenceNeeded);
    }
    const risk = engine.applications[0].majorRisks.find((item) => item.includes("not qualified"))!;
    expect(risk).toBeTruthy();
    const warning = summary.baselineSignals!.find((signal) => signal.description === risk)!;
    expect(warning.severity).toBe("watch");
    expect(warning.relatedRuleIds).toEqual(engine.applications[0].lineage.ruleRefs.map((ref) => ref.id));
    const challenge = await analyzeQualityLabChallengeWithSpecialists(accepted);
    expect(challenge.findings.some((finding) => finding.id === `specialist:operating-model:${warning.id}`)).toBe(true);
    expect((await compareTwinSpecialists(accepted, accepted)).find((item) => item.kind === "operating-model")!.baselineSignals)
      .toEqual(summary.baselineSignals);
    expect(JSON.stringify(accepted)).toBe(frozen);

  });
  it.each(["missing", "changed", "copied"])("withholds %s operating-model basis from Challenge", async (state) => {
    const source = createQualityLabProject(defaultQualityLabInput, "synthetic-operating-challenge");
    const input = createQualityLabOperatingModelInput(source);
    const record = await captureSpecialistBasis(source, "operating-model", input);
    const accepted = createQualityLabProject({ ...source.input, specialistBasis: [record] }, source.id);
    const project = state === "missing" ? source : state === "changed"
      ? createQualityLabProject({ ...accepted.input, finishedBatchesPerMonth: accepted.input.finishedBatchesPerMonth + 1 }, accepted.id)
      : createQualityLabProject(accepted.input, "synthetic-copy");
    const result = await analyzeQualityLabChallengeWithSpecialists(project);
    expect(result.findings.some((finding) => finding.id.startsWith("specialist:operating-model:"))).toBe(false);
  });
});
