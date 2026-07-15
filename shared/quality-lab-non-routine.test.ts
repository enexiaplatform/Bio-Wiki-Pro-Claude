import { describe, expect, it } from "vitest";
import { createQualityLabProject, defaultQualityLabInput } from "./quality-lab.js";
import { defaultNonRoutineLoadInput, evaluateNonRoutineLoad } from "./quality-lab-non-routine.js";

describe("Quality Lab non-routine workload", () => {
  it("separates routine and exception demand without mutating the project", () => {
    const project = createQualityLabProject({ ...defaultQualityLabInput, projectName: "Exception load" });
    const original = JSON.stringify(project.input);
    const result = evaluateNonRoutineLoad(project, defaultNonRoutineLoadInput(project));
    expect(result.routineExecutionHours).toBeGreaterThan(0);
    expect(result.totalNonRoutineHours).toBeGreaterThan(0);
    expect(result.events).toHaveLength(6);
    expect(result.evidenceSummary.decisionBasis).toBe("stress-test-only");
    expect(JSON.stringify(project.input)).toBe(original);
  });

  it("increases role demand and creates a gap when investigation load rises", () => {
    const project = createQualityLabProject({ ...defaultQualityLabInput, projectName: "Investigation stress" });
    const base = defaultNonRoutineLoadInput(project);
    const baseline = evaluateNonRoutineLoad(project, base);
    const stressed = evaluateNonRoutineLoad(project, { ...base, events: base.events.map((event) => event.id === "oos-oot" ? { ...event, eventsPerMonth: 50, analystHoursPerEvent: 40 } : event) });
    expect(stressed.analyst.totalDemandHours).toBeGreaterThan(baseline.analyst.totalDemandHours);
    expect(stressed.analyst.status).toBe("capacity-gap");
    expect(stressed.analyst.fteGap).toBeGreaterThan(0);
  });

  it("can expose reviewer capacity as the independent bottleneck", () => {
    const project = createQualityLabProject({ ...defaultQualityLabInput, projectName: "Reviewer bottleneck" });
    const base = defaultNonRoutineLoadInput(project);
    const result = evaluateNonRoutineLoad(project, { ...base, availableAnalystFte: 100, availableReviewerFte: 0.1, events: base.events.map((event) => ({ ...event, reviewerHoursPerEvent: event.reviewerHoursPerEvent * 10 })) });
    expect(result.analyst.status).toBe("concept-pass");
    expect(result.reviewer.status).toBe("capacity-gap");
    expect(result.overallStatus).toBe("capacity-gap");
    expect(result.boundary).toContain("does not predict");
  });
});
