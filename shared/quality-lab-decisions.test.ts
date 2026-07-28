import { describe, expect, it } from "vitest";
import {
  createQualityLabProject,
  defaultQualityLabInput,
  qualityLabDecisionMetrics,
  reconcileQualityLabDecisionRegister,
} from "./quality-lab.js";

describe("Quality Lab decision register", () => {
  it("creates a stable primary decision and traceable recommendation decisions", () => {
    const project = createQualityLabProject(defaultQualityLabInput, "qlp_decisions");
    const primary = project.decisionRegister.decisions[0];

    expect(primary).toMatchObject({
      id: "decision-project-mandate",
      sourceType: "project-mandate",
      question: defaultQualityLabInput.primaryDecision,
      status: "evidence-required",
    });
    expect(primary.relatedActionIds).toHaveLength(project.actionPlan.actions.length);
    expect(primary.lineageIds.length).toBeGreaterThan(0);
    expect(project.decisionRegister.decisions).toHaveLength(project.blueprint.recommendations.length + 1);
  });

  it("preserves human disposition and observed outcomes when the model is refreshed", () => {
    const project = createQualityLabProject(defaultQualityLabInput, "qlp_decision_memory");
    const primary = project.decisionRegister.decisions[0];
    const decided = {
      ...project.decisionRegister,
      decisions: project.decisionRegister.decisions.map((decision) => decision.id === primary.id ? {
        ...decision,
        status: "decided" as const,
        finalDisposition: "Accepted with utility confirmation.",
        decidedAt: "2026-09-18",
        outcome: {
          ...decision.outcome,
          observed: "Observed peak utilization was 71% after nine months.",
          observedAt: "2027-06-18",
          evidenceReference: "UTIL-REVIEW-2027-06",
          learningStatus: "learning-candidate" as const,
        },
      } : decision),
    };

    const refreshed = reconcileQualityLabDecisionRegister(project.blueprint, project.actionPlan, decided, "2027-06-19T00:00:00.000Z");
    const remembered = refreshed.decisions.find((decision) => decision.id === primary.id)!;
    expect(remembered).toMatchObject({ status: "decided", finalDisposition: "Accepted with utility confirmation.", decidedAt: "2026-09-18" });
    expect(remembered.outcome).toMatchObject({ observedAt: "2027-06-18", evidenceReference: "UTIL-REVIEW-2027-06", learningStatus: "learning-candidate" });
    expect(qualityLabDecisionMetrics(refreshed)).toMatchObject({ decidedCount: 1, outcomeCount: 1, learningCandidateCount: 1 });
  });

  it("moves an undecided record toward review when its linked actions resolve", () => {
    const project = createQualityLabProject(defaultQualityLabInput, "qlp_decision_readiness");
    const resolvedPlan = {
      ...project.actionPlan,
      actions: project.actionPlan.actions.map((action) => ({ ...action, status: "resolved" as const })),
    };
    const reconciled = reconcileQualityLabDecisionRegister(project.blueprint, resolvedPlan, project.decisionRegister, "2026-08-01T00:00:00.000Z");
    expect(reconciled.decisions.every((decision) => decision.status === "ready-for-review")).toBe(true);
  });
});

