import { describe, expect, it } from "vitest";
import {
  compileQualityLabBlueprint,
  createQualityLabProject,
  defaultQualityLabInput,
} from "./quality-lab";
import {
  findTwinEquipmentThreshold,
  inspectTwinBaseline,
  simulateQualityLabTwin,
} from "./quality-lab-decision-twin";

const project = () =>
  createQualityLabProject(
    defaultQualityLabInput,
    "synthetic-twin",
    "illustrative-example",
  );

describe("Decision Twin orchestration", () => {
  it("finds the first real Compiler equipment transition and proves the preceding integer unchanged", () => {
    const baseline = project();
    const result = findTwinEquipmentThreshold(baseline);
    expect(result.status).toBe("found");
    expect(result.firstChangedDemand).toBe(53);
    expect(result.changes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "bsc",
          horizon: "planning-horizon",
          before: 5,
          after: 6,
        }),
      ]),
    );
    const before = compileQualityLabBlueprint({
      ...baseline.input,
      finishedBatchesPerMonth: 52,
    });
    const after = compileQualityLabBlueprint({
      ...baseline.input,
      finishedBatchesPerMonth: 53,
    });
    expect(
      before.equipment.find((row) => row.id === "bsc")?.quantityFuture,
    ).toBe(5);
    expect(
      after.equipment.find((row) => row.id === "bsc")?.quantityFuture,
    ).toBe(6);
    expect(result.changes[0].lineageIds.length).toBeGreaterThan(0);
    expect(result.changes[0].basis.length).toBeGreaterThan(0);
  });
  it("distinguishes a bounded no-transition result from a stability claim", () => {
    const result = findTwinEquipmentThreshold(project(), 10);
    expect(result).toMatchObject({
      status: "none-in-range",
      testedThrough: 40,
      firstChangedDemand: null,
    });
    expect(result.explanation).toContain("does not establish spare capacity");
  });
  it("probes whole-batch boundaries above a fractional monthly average", () => {
    const baseline = createQualityLabProject(
      { ...defaultQualityLabInput, finishedBatchesPerMonth: 52.5 },
      "synthetic-fraction",
    );
    const result = findTwinEquipmentThreshold(baseline, 2);
    expect(result.firstChangedDemand).toBe(53);
    expect(result.testedThrough).toBe(53);
  });
  it("rejects stale input and changed saved engine/output instead of overwriting the baseline", () => {
    const stale = project();
    stale.input = { ...stale.input, finishedBatchesPerMonth: 60 };
    expect(inspectTwinBaseline(stale)).toContain("Working inputs differ");
    const version = project();
    version.blueprint.engineVersion = "historical";
    expect(simulateQualityLabTwin(version, { shifts: 2 }).status).toBe(
      "blocked",
    );
    const changed = project();
    changed.blueprint.future.totalTeamFte++;
    expect(findTwinEquipmentThreshold(changed).status).toBe("not-applicable");
  });
  it("uses the existing Compiler and comparison without mutating project controls", () => {
    const baseline = project();
    const saved = JSON.stringify(baseline);
    const result = simulateQualityLabTwin(baseline, {
      finishedBatchesPerMonth: 60,
      shifts: 2,
    });
    expect(result.status).toBe("ready");
    if (result.status !== "ready") throw new Error("Expected simulation");
    const expected = compileQualityLabBlueprint({
      ...baseline.input,
      finishedBatchesPerMonth: 60,
      shifts: 2,
    });
    expect(result.scenario.current).toEqual(expected.current);
    expect(result.scenario.future).toEqual(expected.future);
    const team = result.comparison.metrics.find(
      (row) => row.id === "team-fte",
    )!;
    expect(team.delta).toBeCloseTo(
      expected.future.totalTeamFte - baseline.blueprint.future.totalTeamFte,
      1,
    );
    expect(JSON.stringify(baseline)).toBe(saved);
  });
  it("rejects unsupported changes and invalid ranges", () => {
    for (const changes of [
      { country: "Elsewhere" },
      { shifts: 0 },
      { finishedBatchesPerMonth: Infinity },
      { growthRatePercent: 501 },
    ]) {
      expect(simulateQualityLabTwin(project(), changes).status).toBe("blocked");
    }
  });
});
