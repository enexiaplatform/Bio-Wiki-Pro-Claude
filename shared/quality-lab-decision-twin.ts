import {
  compileQualityLabBlueprint,
  qualityLabInputSchema,
  type QualityLabBlueprint,
  type QualityLabInput,
  type QualityLabProject,
} from "./quality-lab.js";
import { compareQualityLabScenarios } from "./quality-lab-comparison.js";

export const QUALITY_LAB_TWIN_VERSION = "quality-lab-decision-twin/v1";
export const twinChangesSchema = qualityLabInputSchema
  .pick({
    finishedBatchesPerMonth: true,
    growthRatePercent: true,
    workingDaysPerMonth: true,
    shifts: true,
    outsourcePercent: true,
    redundancyPercent: true,
  })
  .partial()
  .strict();

export type TwinChanges = Partial<
  Pick<
    QualityLabInput,
    | "finishedBatchesPerMonth"
    | "growthRatePercent"
    | "workingDaysPerMonth"
    | "shifts"
    | "outsourcePercent"
    | "redundancyPercent"
  >
>;

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

function materialBasis(blueprint: QualityLabBlueprint) {
  return {
    engineVersion: blueprint.engineVersion,
    compilerCoreVersion: blueprint.compilerCoreVersion,
    domainPack: blueprint.domainPack,
    current: blueprint.current,
    future: blueprint.future,
    equipment: blueprint.equipment,
    workflows: blueprint.workflows,
    methodCapacitySummary: blueprint.methodCapacitySummary,
    finishedProductDemand: blueprint.finishedProductDemand,
  };
}

/** Never silently replace a frozen baseline with a result from today's engine. */
export function inspectTwinBaseline(project: QualityLabProject): string | null {
  const parsed = qualityLabInputSchema.safeParse(project.input);
  if (!parsed.success)
    return "Complete and validate the project inputs before simulating.";
  if (stable(project.input) !== stable(project.blueprint.input))
    return "Working inputs differ from the saved Blueprint. Save a reviewed revision before simulating.";
  const current = compileQualityLabBlueprint(parsed.data);
  if (
    stable(materialBasis(project.blueprint)) !== stable(materialBasis(current))
  )
    return "The saved model differs from the current Compiler basis. Review and recompile a new revision before comparing outcomes.";
  return null;
}

export interface TwinEquipmentChange {
  id: string;
  name: string;
  horizon: "current" | "planning-horizon";
  before: number;
  after: number;
  confidence: "high" | "medium" | "indicative";
  basis: string;
  lineageIds: string[];
  evidenceIds: string[];
}

export type TwinThreshold = {
  status: "found" | "none-in-range" | "not-applicable";
  baselineDemand: number;
  testedThrough: number;
  testedStep: 1;
  firstChangedDemand: number | null;
  distancePercent: number | null;
  changes: TwinEquipmentChange[];
  explanation: string;
};

function equipmentChanges(
  baseline: QualityLabBlueprint,
  candidate: QualityLabBlueprint,
): TwinEquipmentChange[] {
  return candidate.equipment.flatMap((row) => {
    const before = baseline.equipment.find((item) => item.id === row.id);
    const records: TwinEquipmentChange[] = [];
    for (const horizon of ["current", "planning-horizon"] as const) {
      const key = horizon === "current" ? "quantityNow" : "quantityFuture";
      const quantity = before?.[key] ?? 0;
      if (quantity === row[key]) continue;
      const lineage = baseline.decisionLineage.filter(
        (item) => item.outputKey === `equipment.${row.id}.quantityFuture`,
      );
      records.push({
        id: row.id,
        name: row.name,
        horizon,
        before: quantity,
        after: row[key],
        confidence: row.confidence,
        basis: row.rationale,
        lineageIds: lineage.map((item) => item.id),
        evidenceIds: row.evidenceIds,
      });
    }
    return records;
  });
}

/** Exhaustive integer probes reuse the Compiler; no monotonicity assumption or interpolation. */
export function findTwinEquipmentThreshold(
  project: QualityLabProject,
  steps = 100,
): TwinThreshold {
  const demand = project.input.finishedBatchesPerMonth;
  const count =
    Number.isInteger(steps) && steps >= 1 && steps <= 1000 ? steps : 100;
  const end = Math.min(100000, Math.floor(demand) + count);
  const result: TwinThreshold = {
    status: "none-in-range",
    baselineDemand: demand,
    testedThrough: end,
    testedStep: 1,
    firstChangedDemand: null,
    distancePercent: null,
    changes: [],
    explanation: `No modeled equipment quantity changes between ${demand} and ${end} batches/month. This does not establish spare capacity or stability outside this tested range.`,
  };
  const invalid = inspectTwinBaseline(project);
  if (
    invalid ||
    !project.input.scope.finishedProducts ||
    project.blueprint.finishedProductDemand.source !== "aggregate-input"
  )
    return {
      ...result,
      status: "not-applicable",
      testedThrough: demand,
      explanation:
        invalid ??
        "Aggregate batch probing is unavailable for this scope or portfolio-derived demand. Review product allocation in the planner.",
    };
  for (let next = Math.floor(demand) + 1; next <= end; next++) {
    const blueprint = compileQualityLabBlueprint({
      ...project.input,
      finishedBatchesPerMonth: next,
    });
    const changes = equipmentChanges(project.blueprint, blueprint);
    if (changes.length)
      return {
        ...result,
        status: "found",
        testedThrough: next,
        firstChangedDemand: next,
        distancePercent: demand > 0 ? ((next - demand) / demand) * 100 : null,
        changes,
        explanation: `First modeled equipment quantity change found at ${next} batches/month, testing every whole batch above ${demand}. All other assumptions remain fixed. Concept sizing is not verified installed capacity.`,
      };
  }
  return result;
}

/** Transient what-if only: the existing project, evidence and revision records are untouched. */
export function simulateQualityLabTwin(
  project: QualityLabProject,
  changes: unknown,
) {
  const invalid = inspectTwinBaseline(project);
  if (invalid) return { status: "blocked" as const, message: invalid };
  const parsed = twinChangesSchema.safeParse(changes);
  if (!parsed.success)
    return {
      status: "blocked" as const,
      message: "Enter valid values for the supported scenario assumptions.",
    };
  if (
    parsed.data.finishedBatchesPerMonth !== undefined &&
    parsed.data.finishedBatchesPerMonth !==
      project.input.finishedBatchesPerMonth &&
    project.blueprint.finishedProductDemand.source !== "aggregate-input"
  )
    return {
      status: "blocked" as const,
      message:
        "Change the product allocation in the planner before varying portfolio-derived batch demand.",
    };
  const input = qualityLabInputSchema.parse({
    ...project.input,
    ...parsed.data,
  });
  const scenario: QualityLabProject = {
    ...project,
    id: `${project.id}:twin-preview`,
    input,
    blueprint: compileQualityLabBlueprint(input),
  };
  return {
    status: "ready" as const,
    version: QUALITY_LAB_TWIN_VERSION,
    baseline: project.blueprint,
    scenario: scenario.blueprint,
    comparison: compareQualityLabScenarios(project, scenario),
    equipmentChanges: equipmentChanges(project.blueprint, scenario.blueprint),
    boundary:
      "What-if concept model only. Review evidence, methods, usable equipment capacity and local costs before approving a decision. This preview does not change the saved Blueprint.",
  };
}
