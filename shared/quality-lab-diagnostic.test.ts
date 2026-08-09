import { describe, expect, it } from "vitest";
import { createQualityLabProject, defaultQualityLabInput } from "./quality-lab.js";
import { createQualityLabDiagnosticPackage } from "./quality-lab-diagnostic.js";

describe("Quality Lab Scope Diagnostic v2", () => {
  it("creates the complete workshop, decision, scope and workplan package", () => {
    const project = createQualityLabProject(defaultQualityLabInput, "diagnostic-v2");
    const diagnostic = createQualityLabDiagnosticPackage(project, "2026-08-03T00:00:00.000Z");
    expect(diagnostic.workshopGuide.durationMinutes).toBe(60);
    expect(diagnostic.options.length).toBeGreaterThanOrEqual(2);
    expect(diagnostic.blueprintWorkplan.reviewDomains).toEqual(["domain-pack", "quality-governance", "lab-operations-capacity", "engineering-cost"]);
    expect(diagnostic.memo.recommendedOptionId).toBe("verification-first");
    expect(diagnostic.control.status).toBe("working-draft");
  });
});
