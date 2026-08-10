import { describe, expect, it } from "vitest";
import contentManifest from "../../client/src/data/content-manifest.json";
import { TOOL_CATALOG } from "../../client/src/data/tools/catalog";
import { toolkits } from "../../client/src/data/toolkits";
import { workflows } from "../../client/src/data/workflows";
import { workflowSystems } from "../../client/src/data/workflowSystems";

describe("workflow systems", () => {
  it("places every operational workflow in at least one connected system", () => {
    const linkedWorkflowSlugs = new Set(
      workflowSystems.flatMap((system) => system.stages.flatMap((stage) => stage.applications.filter((item) => item.kind === "workflow").map((item) => item.slug))),
    );

    expect(workflows.filter((workflow) => !linkedWorkflowSlugs.has(workflow.slug)).map((workflow) => workflow.slug)).toEqual([]);
  });

  it("only references real workflows, tools, and toolkits", () => {
    const validByKind = {
      workflow: new Set(workflows.map((item) => item.slug)),
      tool: new Set(TOOL_CATALOG.map((item) => item.slug)),
      toolkit: new Set(toolkits.map((item) => item.slug)),
    };

    const invalid = workflowSystems.flatMap((system) => system.stages.flatMap((stage) => stage.applications
      .filter((item) => item.kind !== "lesson" && !validByKind[item.kind].has(item.slug))
      .map((item) => `${system.id}/${stage.id}/${item.kind}/${item.slug}`)));

    expect(invalid).toEqual([]);
  });

  it("only references real English Academy lessons", () => {
    const lessonSlugs = new Set(contentManifest.filter((item) => item.collection === "academy" && item.lang === "en").map((item) => item.slug));
    const invalid = workflowSystems.flatMap((system) => system.stages.flatMap((stage) => stage.applications
      .filter((item) => item.kind === "lesson" && !lessonSlugs.has(item.slug))
      .map((item) => `${system.id}/${stage.id}/lesson/${item.slug}`)));

    expect(invalid).toEqual([]);
  });

  it("keeps the canonical seven-stage rhythm and the four-stage drug-product framework", () => {
    expect(workflowSystems.filter((system) => system.id !== "pharma-drug-product").every((system) => system.stages.length === 7)).toBe(true);
    expect(workflowSystems.find((system) => system.id === "pharma-drug-product")?.stages).toHaveLength(4);
  });
});
