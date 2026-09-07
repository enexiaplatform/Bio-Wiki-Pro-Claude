import { describe, it, expect } from "vitest";
import { createQualityLabProject, defaultQualityLabInput } from "./quality-lab";
import {
  captureSpecialistBasis,
  compareTwinSpecialists,
  twinSourceBasisHash,
} from "./quality-lab-twin-specialists";
import {
  defaultTurnaroundFeasibilityInput,
  evaluateTurnaroundFeasibility,
} from "./quality-lab-turnaround";
import { defaultEquipmentResilienceInput } from "./quality-lab-equipment-resilience";
import { createQualityLabOperatingModelInput } from "./quality-lab-operating-model";
import { defaultNonRoutineLoadInput } from "./quality-lab-non-routine";
import { defaultSkillShiftFeasibilityInput } from "./quality-lab-skill-coverage";
import {
  createQualityLabAccountSnapshot,
  qualityLabProjectFromReviewedSnapshot,
} from "./quality-lab-persistence";

describe("accepted specialist basis", () => {
  it("persists all five versioned assumption sets through frozen/account snapshots", async () => {
    const source = createQualityLabProject(
      defaultQualityLabInput,
      "synthetic-specialists",
    );
    const records = await Promise.all([
      captureSpecialistBasis(
        source,
        "operating-model",
        createQualityLabOperatingModelInput(source),
      ),
      captureSpecialistBasis(
        source,
        "turnaround",
        defaultTurnaroundFeasibilityInput(source),
      ),
      captureSpecialistBasis(
        source,
        "equipment-resilience",
        defaultEquipmentResilienceInput(source),
      ),
      captureSpecialistBasis(
        source,
        "non-routine-load",
        defaultNonRoutineLoadInput(source),
      ),
      captureSpecialistBasis(
        source,
        "skill-shift-coverage",
        defaultSkillShiftFeasibilityInput(source),
      ),
    ]);
    const saved = createQualityLabProject(
      { ...source.input, specialistBasis: records },
      source.id,
    );
    expect(await twinSourceBasisHash(saved)).toBe(
      await twinSourceBasisHash(source),
    );
    const restored = qualityLabProjectFromReviewedSnapshot(
      createQualityLabAccountSnapshot(saved),
    );
    expect(restored.input.specialistBasis).toEqual(records);
    expect(restored.blueprint.input.specialistBasis).toEqual(records);
    expect(
      (await compareTwinSpecialists(restored, restored)).every(
        (item) => item.status === "ready",
      ),
    ).toBe(true);
  });
  it("keeps explicitly accepted staffing fixed while reusing the turnaround engine for changed demand", async () => {
    const source = createQualityLabProject(
      defaultQualityLabInput,
      "synthetic-turnaround",
    );
    const input = {
      ...defaultTurnaroundFeasibilityInput(source),
      analystFteAvailable: 3,
    };
    const record = await captureSpecialistBasis(source, "turnaround", input);
    const baseline = createQualityLabProject(
      { ...source.input, specialistBasis: [record] },
      source.id,
    );
    const scenario = createQualityLabProject(
      { ...baseline.input, finishedBatchesPerMonth: 90 },
      "synthetic-alternative",
    );
    const actual = (await compareTwinSpecialists(baseline, scenario)).find(
      (item) => item.kind === "turnaround",
    )!;
    const expected = evaluateTurnaroundFeasibility(scenario, {
      ...input,
      projectId: scenario.id,
    });
    expect(actual.status).toBe("ready");
    expect(actual.after).toBe(expected.overallStatus);
    expect(
      actual.metrics?.find((item) => item.label === "Execution utilization")
        ?.after,
    ).toBe(expected.executionLoad.utilizationPercent);
    expect(input.analystFteAvailable).toBe(3);
  });
  it("fails closed for absent, duplicated, stale and cross-project bases", async () => {
    const source = createQualityLabProject(
      defaultQualityLabInput,
      "synthetic-stale",
    );
    expect(
      (await compareTwinSpecialists(source, source)).every(
        (item) => item.status === "missing",
      ),
    ).toBe(true);
    const record = await captureSpecialistBasis(
      source,
      "turnaround",
      defaultTurnaroundFeasibilityInput(source),
    );
    const stale = createQualityLabProject(
      {
        ...source.input,
        finishedBatchesPerMonth: 90,
        specialistBasis: [record],
      },
      source.id,
    );
    expect(
      (await compareTwinSpecialists(stale, stale)).find(
        (item) => item.kind === "turnaround",
      )!.status,
    ).toBe("stale");
    const duplicate = createQualityLabProject(
      { ...source.input, specialistBasis: [record, record] },
      source.id,
    );
    expect(
      (await compareTwinSpecialists(duplicate, duplicate)).find(
        (item) => item.kind === "turnaround",
      )!.status,
    ).toBe("invalid");
    const other = createQualityLabProject(
      { ...source.input, specialistBasis: [record] },
      "synthetic-other",
    );
    expect(
      (await compareTwinSpecialists(other, other)).find(
        (item) => item.kind === "turnaround",
      )!.status,
    ).toBe("stale");
  });
  it("requires reconciliation when scenario calendars change", async () => {
    const source = createQualityLabProject(
      defaultQualityLabInput,
      "synthetic-calendar",
    );
    const record = await captureSpecialistBasis(
      source,
      "turnaround",
      defaultTurnaroundFeasibilityInput(source),
    );
    const baseline = createQualityLabProject(
      { ...source.input, specialistBasis: [record] },
      source.id,
    );
    const scenario = createQualityLabProject(
      { ...baseline.input, shifts: 2 },
      "synthetic-new-calendar",
    );
    const result = (await compareTwinSpecialists(baseline, scenario)).find(
      (item) => item.kind === "turnaround",
    )!;
    expect(result.status).toBe("stale");
    expect(result.metrics).toBeUndefined();
  });
});
