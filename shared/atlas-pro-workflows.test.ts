import { describe, expect, it } from "vitest";
import { ATLAS_PRO_WORKFLOWS, formatAtlasProWorkflowBrief, getAtlasProWorkflow } from "./atlas-pro-workflows";

describe("Atlas Pro workflow briefs", () => {
  it("provides a reusable evidence-to-action brief for every supported workflow", () => {
    expect(ATLAS_PRO_WORKFLOWS).toHaveLength(3);
    for (const workflow of ATLAS_PRO_WORKFLOWS) {
      const brief = formatAtlasProWorkflowBrief(workflow.id);
      expect(brief).toContain(workflow.question);
      expect(brief).toContain("## Evidence to understand");
      expect(brief).toContain("## First step");
      expect(brief).toContain("## Review question");
      expect(brief).toContain("not project-specific expert review");
    }
  });

  it("resolves a selected workflow deterministically", () => {
    expect(getAtlasProWorkflow("quality-signal").href).toBe("/workflows");
  });
});
