import { getWorkflowSystem } from "./workflowSystems";

export interface ResourceSelection {
  systemId?: string;
  stageId?: string;
}

export function parseResourceSelection(search: string): ResourceSelection {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const system = getWorkflowSystem(params.get("system") ?? "");
  if (!system) return {};
  const stageId = params.get("stage") ?? undefined;
  return {
    systemId: system.id,
    stageId: stageId && system.stages.some((stage) => stage.id === stageId) ? stageId : undefined,
  };
}

export function buildResourceContextHref(path: string, selection: ResourceSelection, source?: string) {
  const [pathname, existingSearch = ""] = path.split("?");
  const params = new URLSearchParams(existingSearch);
  if (selection.systemId) params.set("system", selection.systemId); else params.delete("system");
  if (selection.systemId && selection.stageId) params.set("stage", selection.stageId); else params.delete("stage");
  if (source) params.set("source", source);
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}
