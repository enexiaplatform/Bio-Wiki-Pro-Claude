import { describe, expect, it } from "vitest";

import {
  COMPLIANCE_SYSTEM_MAP,
  METHOD_SYSTEM_MAP,
  REGULATORY_DOMAIN_SYSTEM_MAP,
  buildResourceContextHref,
  getConnectionsForSelection,
  getGuidedDestination,
  getResourceLocationContexts,
  parseResourceSelection,
  resolveExplicitSystemStages,
  resourceConnections,
} from "../../client/src/data/resourceConnections";
import { TOOL_CATALOG } from "../../client/src/data/tools/catalog";
import { workflowSystems } from "../../client/src/data/workflowSystems";

describe("resource connection registry", () => {
  it("keeps system, stage, and connection identifiers unique", () => {
    const systemIds = workflowSystems.map((system) => system.id);
    const stageKeys = workflowSystems.flatMap((system) => system.stages.map((stage) => `${system.id}:${stage.id}`));
    const connectionKeys = resourceConnections.map((connection) => connection.key);

    expect(new Set(systemIds).size).toBe(systemIds.length);
    expect(new Set(stageKeys).size).toBe(stageKeys.length);
    expect(new Set(connectionKeys).size).toBe(connectionKeys.length);
  });

  it("resolves every registry connection to its declared system and stage", () => {
    const invalid = resourceConnections.filter((connection) => {
      const system = workflowSystems.find((candidate) => candidate.id === connection.systemId);
      const stage = system?.stages.find((candidate) => candidate.id === connection.stageId);
      return !system || !stage || !connection.href.startsWith("/") || !connection.slug;
    });

    expect(invalid).toEqual([]);
  });

  it("parses valid URL context and safely drops invalid parameters", () => {
    const system = workflowSystems[0];
    const stage = system.stages[1];

    expect(parseResourceSelection(`?system=${system.id}&stage=${stage.id}`)).toEqual({ systemId: system.id, stageId: stage.id });
    expect(parseResourceSelection(`?system=${system.id}&stage=not-a-stage`)).toEqual({ systemId: system.id, stageId: undefined });
    expect(parseResourceSelection("?system=not-a-system&stage=anything")).toEqual({});
  });

  it("preserves existing query parameters while adding connected context", () => {
    expect(buildResourceContextHref("/academy?q=water", { systemId: "qc-laboratory", stageId: "media-utilities" })).toBe(
      "/academy?q=water&system=qc-laboratory&stage=media-utilities",
    );
  });

  it("filters by system, stage, and Resource area", () => {
    const selection = { systemId: "biopharma", stageId: "downstream" };
    const workflows = getConnectionsForSelection(selection, "workflows");

    expect(workflows.length).toBeGreaterThan(0);
    expect(workflows.every((connection) => connection.systemId === selection.systemId
      && connection.stageId === selection.stageId
      && connection.kind === "workflow")).toBe(true);
  });

  it("returns every location for a resource connected to multiple systems", () => {
    const contexts = getResourceLocationContexts("/workflows/process-validation");

    expect(new Set(contexts.map((context) => context.system.id)).size).toBeGreaterThan(1);
    expect(contexts.every((context) => context.connection.slug === "process-validation")).toBe(true);
  });

  it("keeps unmapped catalog items available as general references", () => {
    const mappedToolSlugs = new Set(resourceConnections.filter((connection) => connection.kind === "tool").map((connection) => connection.slug));
    const generalReference = TOOL_CATALOG.find((tool) => !mappedToolSlugs.has(tool.slug));

    expect(generalReference).toBeDefined();
    expect(getResourceLocationContexts(`/tools/${generalReference!.slug}`)).toEqual([]);
  });

  it("builds a deterministic guided destination", () => {
    expect(getGuidedDestination("qc-laboratory", "investigate", "calculate")).toBe(
      "/tools?system=qc-laboratory&stage=lab-investigations&source=guided-selector",
    );
    expect(getGuidedDestination("not-a-system", "prepare", "learn")).toBe("/academy?source=guided-selector");
  });

  it("only resolves valid explicit Method, Compliance, and Monitor mappings", () => {
    const mappingGroups = [
      ...Object.values(METHOD_SYSTEM_MAP),
      ...Object.values(COMPLIANCE_SYSTEM_MAP),
      ...Object.values(REGULATORY_DOMAIN_SYSTEM_MAP),
    ];

    expect(mappingGroups.length).toBeGreaterThan(0);
    expect(mappingGroups.every((mappings) => resolveExplicitSystemStages(mappings).length === mappings.length)).toBe(true);
  });
});
