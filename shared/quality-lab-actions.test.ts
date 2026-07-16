import { describe, expect, it } from "vitest";
import {
  createQualityLabProject,
  defaultQualityLabInput,
  priorityQualityLabActions,
  qualityLabActionPlanMetrics,
  reconcileQualityLabActionPlan,
} from "./quality-lab.js";

describe("Quality Lab project action plan", () => {
  it("creates one traceable action for every unresolved Blueprint input", () => {
    const project = createQualityLabProject(defaultQualityLabInput, "qlp_actions");
    expect(project.actionPlan.actions).toHaveLength(project.blueprint.unresolvedInputs.length);
    expect(project.actionPlan.actions.every((action) => action.sourceInputId.length > 0 && action.requiredEvidence.length > 0)).toBe(true);
    expect(qualityLabActionPlanMetrics(project.actionPlan).blockingCount).toBe(project.blueprint.dataQuality.blockingOpenCount);
  });

  it("preserves ownership work and auto-resolves only when the compiled source input closes", () => {
    const project = createQualityLabProject(defaultQualityLabInput, "qlp_reconcile");
    const source = project.blueprint.unresolvedInputs[0];
    const originalAction = project.actionPlan.actions.find((action) => action.sourceInputId === source.id)!;
    const assignedPlan = {
      ...project.actionPlan,
      actions: project.actionPlan.actions.map((action) => action.id === originalAction.id ? { ...action, ownerRole: "Site QC lead", dueDate: "2026-08-01", status: "in-progress" as const } : action),
    };
    const closedBlueprint = {
      ...project.blueprint,
      unresolvedInputs: project.blueprint.unresolvedInputs.filter((item) => item.id !== source.id),
    };
    const resolved = reconcileQualityLabActionPlan(closedBlueprint, assignedPlan, "2026-07-17T00:00:00.000Z");
    const resolvedAction = resolved.actions.find((action) => action.id === originalAction.id)!;
    expect(resolvedAction).toMatchObject({ status: "resolved", ownerRole: "Site QC lead", dueDate: "2026-08-01" });
    expect(resolvedAction.activity.at(-1)?.type).toBe("auto-resolved");

    const reopened = reconcileQualityLabActionPlan(project.blueprint, resolved, "2026-07-18T00:00:00.000Z");
    const reopenedAction = reopened.actions.find((action) => action.id === originalAction.id)!;
    expect(reopenedAction.status).toBe("open");
    expect(reopenedAction.activity.at(-1)?.type).toBe("reopened");
  });

  it("prioritizes active blocking work before important or resolved items", () => {
    const project = createQualityLabProject(defaultQualityLabInput, "qlp_priority");
    const prioritized = priorityQualityLabActions(project.actionPlan);
    expect(prioritized.length).toBeGreaterThan(0);
    expect(prioritized[0].severity).toBe("blocking");
    expect(prioritized.every((action) => action.status !== "resolved")).toBe(true);
  });
});
