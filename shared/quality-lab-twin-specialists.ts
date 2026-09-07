import type { QualityLabProject } from "./quality-lab.js";
import { compileQualityLabBlueprint } from "./quality-lab.js";
import {
  specialistBasisSchema,
  type SpecialistBasis,
  type SpecialistKind,
} from "./quality-lab-specialist-basis.js";
import { evaluateTurnaroundFeasibility } from "./quality-lab-turnaround.js";
import { evaluateEquipmentResilience } from "./quality-lab-equipment-resilience.js";
import { evaluateNonRoutineLoad } from "./quality-lab-non-routine.js";
import { evaluateSkillShiftFeasibility } from "./quality-lab-skill-coverage.js";
import { inspectTwinBaseline } from "./quality-lab-decision-twin.js";
import { analyzeQualityLabOperatingModel } from "./quality-lab-operating-model.js";

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object")
    return (
      "{" +
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, item]) => `${JSON.stringify(key)}:${stable(item)}`)
        .join(",") +
      "}"
    );
  return JSON.stringify(value) ?? "undefined";
}

/** Source hash excludes annotations; adding a basis cannot invalidate itself. */
export async function twinSourceBasisHash(
  project: QualityLabProject,
): Promise<string> {
  const {
    specialistBasis: _specialists,
    intakeProvenance: _provenance,
    ...input
  } = project.input;
  const bytes = new TextEncoder().encode(
    stable({
      input,
      engine: project.blueprint.engineVersion,
      core: project.blueprint.compilerCoreVersion,
      domain: project.blueprint.domainPack,
    }),
  );
  const hash = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

export async function captureSpecialistBasis(
  project: QualityLabProject,
  kind: SpecialistKind,
  input: unknown,
): Promise<SpecialistBasis> {
  const record = specialistBasisSchema.parse({
    version: "quality-lab-specialist-basis/v1",
    kind,
    input,
    sourceBasisHash: await twinSourceBasisHash(project),
    confirmedAt: new Date().toISOString(),
    confirmation: "planning-assumptions-only",
  });
  if (record.input.projectId !== project.id)
    throw new Error("The analysis belongs to a different project.");
  return record;
}

export interface TwinSpecialistSummary {
  kind: SpecialistKind;
  status: "ready" | "missing" | "stale" | "invalid";
  horizon?: "current" | "future";
  before?: string;
  after?: string;
  metrics?: Array<{
    label: string;
    before: number;
    after: number;
    unit: string;
  }>;
  boundary: string;
}
export const SPECIALIST_LABELS: Record<SpecialistKind, string> = {
  "operating-model": "Operating model",
  turnaround: "Turnaround",
  "equipment-resilience": "Equipment resilience",
  "non-routine-load": "Non-routine load",
  "skill-shift-coverage": "Skill / shift coverage",
};

function evaluate(project: QualityLabProject, record: SpecialistBasis) {
  switch (record.kind) {
    case "operating-model": {
      const result = analyzeQualityLabOperatingModel(project, record.input);
      return {
        status:
          result.summary.evidenceRequired > 0
            ? "evidence-required"
            : "bounded-modes-evaluated",
        boundary: result.boundary,
        metrics: [
          {
            label: "Applications needing evidence",
            value: result.summary.evidenceRequired,
            unit: "applications",
          },
          {
            label: "Insource / hybrid candidates",
            value: result.summary.insource + result.summary.hybrid,
            unit: "applications",
          },
        ],
      };
    }
    case "turnaround": {
      const result = evaluateTurnaroundFeasibility(project, {
        ...record.input,
        projectId: project.id,
      });
      return {
        status: result.overallStatus,
        boundary: result.boundary,
        metrics: [
          {
            label: "Execution utilization",
            value: result.executionLoad.utilizationPercent,
            unit: "%",
          },
          {
            label: "Review utilization",
            value: result.reviewLoad.utilizationPercent,
            unit: "%",
          },
        ],
      };
    }
    case "equipment-resilience": {
      const result = evaluateEquipmentResilience(project, {
        ...record.input,
        projectId: project.id,
      });
      return {
        status: result.overallStatus,
        boundary: result.boundary,
        metrics: [
          {
            label: "Single points of failure",
            value: result.summary.singlePointCount,
            unit: "resources",
          },
          {
            label: "N+1 gap",
            value: result.summary.nPlusOneGapUnits,
            unit: "units",
          },
        ],
      };
    }
    case "non-routine-load": {
      const result = evaluateNonRoutineLoad(project, {
        ...record.input,
        projectId: project.id,
      });
      return {
        status: result.overallStatus,
        boundary: result.boundary,
        metrics: [
          {
            label: "Analyst utilization",
            value: result.analyst.utilizationPercent,
            unit: "%",
          },
          {
            label: "Reviewer utilization",
            value: result.reviewer.utilizationPercent,
            unit: "%",
          },
        ],
      };
    }
    case "skill-shift-coverage": {
      const result = evaluateSkillShiftFeasibility(project, {
        ...record.input,
        projectId: project.id,
      });
      return {
        status: result.overallStatus,
        boundary: result.boundary,
        metrics: [
          {
            label: "Execution people gap",
            value: result.summary.executionPeopleGap,
            unit: "people",
          },
          {
            label: "Reviewer gap",
            value: result.summary.reviewerPeopleGap,
            unit: "people",
          },
        ],
      };
    }
  }
}

/** Keep the explicitly accepted staff/fleet/calendar basis fixed in both models. */
export async function compareTwinSpecialists(
  baseline: QualityLabProject,
  scenario: QualityLabProject,
): Promise<TwinSpecialistSummary[]> {
  const invalid =
    inspectTwinBaseline(baseline) || inspectTwinBaseline(scenario);
  if (invalid)
    return (Object.keys(SPECIALIST_LABELS) as SpecialistKind[]).map((kind) => ({
      kind,
      status: "stale",
      boundary: invalid,
    }));
  const hash = await twinSourceBasisHash(baseline);
  return (Object.keys(SPECIALIST_LABELS) as SpecialistKind[]).map((kind) => {
    const candidates =
      baseline.input.specialistBasis?.filter((item) => item.kind === kind) ??
      [];
    if (!candidates.length)
      return {
        kind,
        status: "missing",
        boundary:
          "No analysis basis has been accepted for this Blueprint. Open the specialist analysis, review its inputs and explicitly use its basis in the Twin.",
      };
    const parsed = specialistBasisSchema.safeParse(candidates[0]);
    if (!parsed.success || candidates.length !== 1)
      return {
        kind,
        status: "invalid",
        boundary:
          "The saved analysis basis is invalid or duplicated. Review and replace it.",
      };
    const record = parsed.data;
    if (
      record.sourceBasisHash !== hash ||
      record.input.projectId !== baseline.id
    )
      return {
        kind,
        status: "stale",
        boundary:
          "The Blueprint basis changed since these assumptions were accepted. Review and reconnect the analysis before relying on its results.",
      };
    if (
      scenario.input.shifts !== baseline.input.shifts ||
      scenario.input.workingDaysPerMonth !== baseline.input.workingDaysPerMonth
    )
      return {
        kind,
        status: "stale",
        boundary:
          "This scenario changes operating shifts or days. Save the scenario and reconcile its specialist calendar and deployment assumptions before comparing these outcomes.",
      };
    try {
      const before = evaluate(baseline, record),
        after = evaluate(scenario, record);
      return {
        kind,
        status: "ready",
        horizon:
          record.kind === "operating-model"
            ? "current"
            : record.input.demandHorizon,
        before: before.status,
        after: after.status,
        metrics: before.metrics.map((metric, index) => ({
          label: metric.label,
          before: metric.value,
          after: after.metrics[index].value,
          unit: metric.unit,
        })),
        boundary: `Same accepted staff, fleet and calendar assumptions in both models. ${after.boundary}`,
      };
    } catch {
      return {
        kind,
        status: "invalid",
        boundary:
          "The specialist engine could not evaluate this basis. Review its required inputs.",
      };
    }
  });
}

/** Bounded exhaustive search for status transitions, not a claim of spare capacity.
 * Already-failing baseline statuses are retained in coverage, even without a transition.
 */
export async function findTwinSpecialistThreshold(
  project: QualityLabProject,
  steps = 100,
) {
  const demand = project.input.finishedBatchesPerMonth;
  const coverage = await compareTwinSpecialists(project, project);
  const count = Number.isInteger(steps) && steps >= 1 && steps <= 1000 ? steps : 100;
  const end = Math.min(100000, Math.floor(demand) + count);
  const base = {
    baselineDemand: demand,
    testedThrough: demand,
    testedStep: 1 as const,
    firstChangedDemand: null as number | null,
    coverage,
    changes: [] as TwinSpecialistSummary[],
  };
  if (
    inspectTwinBaseline(project) ||
    !project.input.scope.finishedProducts ||
    project.blueprint.finishedProductDemand.source !== "aggregate-input" ||
    !coverage.some((item) => item.status === "ready")
  ) return { ...base, status: "not-applicable" as const };
  for (let next = Math.floor(demand) + 1; next <= end; next++) {
    const input = { ...project.input, finishedBatchesPerMonth: next };
    const scenario = {
      ...project,
      id: `${project.id}:threshold-probe`,
      input,
      blueprint: compileQualityLabBlueprint(input),
    };
    const summaries = await compareTwinSpecialists(project, scenario);
    // A lost evaluation invalidates the search; it must not masquerade as stability.
    if (coverage.some((item) => item.status === "ready" &&
      summaries.find((candidate) => candidate.kind === item.kind)?.status !== "ready"))
      return { ...base, status: "evaluation-failed" as const, testedThrough: next - 1 };
    const changes = summaries.filter((item) => item.status === "ready" && item.before !== item.after);
    if (changes.length) return {
      ...base, status: "found" as const, testedThrough: next,
      firstChangedDemand: next, changes,
    };
  }
  return { ...base, status: "none-in-range" as const, testedThrough: end };
}
