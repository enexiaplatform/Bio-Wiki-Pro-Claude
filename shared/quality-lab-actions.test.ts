import { describe, expect, it } from "vitest";
import {
  createQualityLabProject,
  defaultQualityLabInput,
  priorityQualityLabActions,
  qualityLabActionPlanMetrics,
  qualityLabPortfolioQueueMetrics,
  qualityLabPortfolioWorkQueue,
  qualityLabWeeklyPortfolioReview,
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

  it("builds a portfolio queue with overdue and due-soon work first", () => {
    const project = createQualityLabProject(defaultQualityLabInput, "qlp_portfolio_queue");
    const [overdue, dueSoon, ready, inProgress] = project.actionPlan.actions;
    const queuedProject = {
      ...project,
      actionPlan: {
        ...project.actionPlan,
        actions: project.actionPlan.actions.map((action) => {
          if (action.id === overdue.id) return { ...action, dueDate: "2026-07-15" };
          if (action.id === dueSoon.id) return { ...action, dueDate: "2026-07-20" };
          if (action.id === ready.id) return { ...action, status: "ready-for-review" as const };
          if (action.id === inProgress.id) return { ...action, status: "in-progress" as const };
          return action;
        }),
      },
    };
    const queue = qualityLabPortfolioWorkQueue([queuedProject], "2026-07-16");
    expect(queue.slice(0, 4).map((item) => item.action.id)).toEqual([overdue.id, dueSoon.id, ready.id, inProgress.id]);
    expect(qualityLabPortfolioQueueMetrics(queue)).toMatchObject({
      overdueCount: 1,
      dueSoonCount: 1,
      readyForReviewCount: 1,
    });
  });

  it("summarizes only action activity inside the seven-day portfolio window", () => {
    const project = createQualityLabProject(defaultQualityLabInput, "qlp_weekly_review");
    const [created, resolved, updated, old] = project.actionPlan.actions;
    const reviewedProject = {
      ...project,
      actionPlan: {
        ...project.actionPlan,
        actions: project.actionPlan.actions.map((action) => {
          if (action.id === created.id) return { ...action, activity: [{ ...action.activity[0], recordedAt: "2026-07-16T08:00:00.000Z" }] };
          if (action.id === resolved.id) return { ...action, status: "resolved" as const, activity: [{ id: "resolved", recordedAt: "2026-07-15T08:00:00.000Z", type: "auto-resolved" as const, summary: "Resolved this week." }] };
          if (action.id === updated.id) return { ...action, activity: [{ id: "updated", recordedAt: "2026-07-14T08:00:00.000Z", type: "updated" as const, summary: "Owner and evidence updated." }] };
          if (action.id === old.id) return { ...action, activity: [{ ...action.activity[0], recordedAt: "2026-07-09T23:59:59.999Z" }] };
          return { ...action, activity: [] };
        }),
      },
    };

    const review = qualityLabWeeklyPortfolioReview([reviewedProject], "2026-07-16");
    expect(review).toMatchObject({
      windowStart: "2026-07-10",
      windowEnd: "2026-07-16",
      newCount: 1,
      resolvedCount: 1,
      updatedCount: 1,
    });
    expect(review.recentEvents.map((event) => event.type)).toEqual(["created", "auto-resolved", "updated"]);
    expect(review.recentEvents.some((event) => event.actionId === old.id)).toBe(false);
  });
});
