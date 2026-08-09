import type { RegulatoryDomain } from "@shared/regulatory-monitor";

import { atlasEvidenceDomains, type BlueprintDecisionId, type EvidenceDomainId } from "./atlasEvidenceGraph";
import {
  getWorkflowSystem,
  workflowSystems,
  type ConnectedApplicationKind,
  type ConnectedApplicationRef,
  type WorkflowSystem,
  type WorkflowSystemStage,
} from "./workflowSystems";

export type ResourceArea = "methods" | "monitor" | "workflows" | "academy" | "tools" | "toolkits" | "compliance";
export type ResourceKind = ConnectedApplicationKind | "method" | "monitor" | "compliance";
export type GuidedWorkPhase = "prepare" | "execute" | "investigate" | "release";
export type GuidedOutcome = "learn" | "calculate" | "workflow" | "toolkit" | "verify";

export interface ResourceSelection {
  systemId?: string;
  stageId?: string;
}

export interface ResourceConnection {
  key: string;
  kind: ConnectedApplicationKind;
  slug: string;
  href: string;
  systemId: string;
  stageId: string;
  system: WorkflowSystem;
  stage: WorkflowSystemStage;
  evidenceDomainIds: EvidenceDomainId[];
  decisionIds: BlueprintDecisionId[];
}

export interface ResourceLocationContext {
  system: WorkflowSystem;
  stage: WorkflowSystemStage;
  connection: ResourceConnection;
  previousStage?: WorkflowSystemStage;
  nextStage?: WorkflowSystemStage;
  siblingConnections: ResourceConnection[];
}

export const RESOURCE_AREA_PATHS: Record<ResourceArea, string> = {
  methods: "/methods",
  monitor: "/monitor",
  workflows: "/workflows",
  academy: "/academy",
  tools: "/tools",
  toolkits: "/toolkits",
  compliance: "/compliance",
};

export const RESOURCE_KIND_AREAS: Record<ConnectedApplicationKind, ResourceArea> = {
  workflow: "workflows",
  lesson: "academy",
  tool: "tools",
  toolkit: "toolkits",
};

export const GUIDED_OUTCOME_AREAS: Record<GuidedOutcome, ResourceArea> = {
  learn: "academy",
  calculate: "tools",
  workflow: "workflows",
  toolkit: "toolkits",
  verify: "compliance",
};

const GUIDED_STAGE_INDEX: Record<GuidedWorkPhase, number> = {
  prepare: 0,
  execute: 3,
  investigate: 5,
  release: 6,
};

function applicationHref(reference: ConnectedApplicationRef) {
  if (reference.kind === "workflow") return `/workflows/${reference.slug}`;
  if (reference.kind === "tool") return `/tools/${reference.slug}`;
  if (reference.kind === "lesson") return `/library/${reference.slug}`;
  return `/toolkits/${reference.slug}`;
}

function evidenceForHref(href: string) {
  const matches = atlasEvidenceDomains.flatMap((domain) => domain.resources
    .filter((resource) => resource.href === href)
    .map((resource) => ({ domainId: domain.id, decisionIds: resource.decisions })));
  return {
    evidenceDomainIds: Array.from(new Set(matches.map((match) => match.domainId))),
    decisionIds: Array.from(new Set(matches.flatMap((match) => match.decisionIds))),
  };
}

export const resourceConnections: ResourceConnection[] = workflowSystems.flatMap((system) => system.stages.flatMap((stage) => stage.applications.map((reference) => {
  const href = applicationHref(reference);
  const evidence = evidenceForHref(href);
  return {
    key: `${system.id}:${stage.id}:${reference.kind}:${reference.slug}`,
    kind: reference.kind,
    slug: reference.slug,
    href,
    systemId: system.id,
    stageId: stage.id,
    system,
    stage,
    ...evidence,
  };
})));

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

export function getConnectionsForSelection(selection: ResourceSelection, area?: ResourceArea) {
  if (!selection.systemId) return [];
  return resourceConnections.filter((connection) => connection.systemId === selection.systemId
    && (!selection.stageId || connection.stageId === selection.stageId)
    && (!area || RESOURCE_KIND_AREAS[connection.kind] === area));
}

export function getResourceLocationContexts(href: string): ResourceLocationContext[] {
  const pathname = href.split("?")[0];
  return resourceConnections.filter((connection) => connection.href === pathname).map((connection) => {
    const stageIndex = connection.system.stages.findIndex((stage) => stage.id === connection.stageId);
    return {
      system: connection.system,
      stage: connection.stage,
      connection,
      previousStage: connection.system.stages[stageIndex - 1],
      nextStage: connection.system.stages[stageIndex + 1],
      siblingConnections: resourceConnections.filter((candidate) => candidate.systemId === connection.systemId
        && candidate.stageId === connection.stageId && candidate.href !== connection.href),
    };
  });
}

export function getGuidedSelection(systemId: string, phase: GuidedWorkPhase): ResourceSelection {
  const system = getWorkflowSystem(systemId);
  if (!system) return {};
  const stage = system.stages[GUIDED_STAGE_INDEX[phase]] ?? system.stages[0];
  return { systemId: system.id, stageId: stage.id };
}

export function getGuidedDestination(systemId: string, phase: GuidedWorkPhase, outcome: GuidedOutcome) {
  const selection = getGuidedSelection(systemId, phase);
  return buildResourceContextHref(RESOURCE_AREA_PATHS[GUIDED_OUTCOME_AREAS[outcome]], selection, "guided-selector");
}

export function getResourceSystem(systemId?: string) {
  return systemId ? getWorkflowSystem(systemId) : undefined;
}

export function getResourceStage(selection: ResourceSelection) {
  const system = getResourceSystem(selection.systemId);
  return system?.stages.find((stage) => stage.id === selection.stageId);
}

export interface ExplicitSystemStageMap {
  systemId: string;
  stageId: string;
}

export const METHOD_SYSTEM_MAP: Record<string, ExplicitSystemStageMap[]> = {
  "water-microbiology": [{ systemId: "qc-laboratory", stageId: "media-utilities" }, { systemId: "quality-lifecycle", stageId: "routine-control" }],
  "growth-promotion-media-qc": [{ systemId: "qc-laboratory", stageId: "media-utilities" }],
  "bioburden-filtration": [{ systemId: "qc-laboratory", stageId: "microbiology-controls" }, { systemId: "biopharma", stageId: "downstream" }],
  "specified-microorganisms": [{ systemId: "qc-laboratory", stageId: "microbiology-controls" }],
  "method-suitability-recovery": [{ systemId: "qc-laboratory", stageId: "microbiology-controls" }],
  "bet-lal": [{ systemId: "qc-laboratory", stageId: "microbiology-controls" }, { systemId: "biopharma", stageId: "analytical-control" }],
  "environmental-monitoring": [{ systemId: "sterile-product", stageId: "monitor-investigate" }, { systemId: "qc-laboratory", stageId: "microbiology-controls" }],
  "microbial-identification": [{ systemId: "qc-laboratory", stageId: "microbiology-controls" }, { systemId: "sterile-product", stageId: "monitor-investigate" }],
};

export const COMPLIANCE_SYSTEM_MAP: Record<string, ExplicitSystemStageMap[]> = {
  "annex-1": [{ systemId: "sterile-product", stageId: "aseptic-process" }, { systemId: "sterile-product", stageId: "monitor-investigate" }],
  ccs: [{ systemId: "sterile-product", stageId: "facility-readiness" }, { systemId: "sterile-product", stageId: "aseptic-process" }],
  em: [{ systemId: "sterile-product", stageId: "monitor-investigate" }, { systemId: "qc-laboratory", stageId: "microbiology-controls" }],
  "aseptic-processing": [{ systemId: "sterile-product", stageId: "aseptic-process" }],
  "sterility-assurance": [{ systemId: "sterile-product", stageId: "sterile-release" }],
};

export const REGULATORY_DOMAIN_SYSTEM_MAP: Record<RegulatoryDomain, ExplicitSystemStageMap[]> = {
  "nonsterile-microbiology": [{ systemId: "qc-laboratory", stageId: "microbiology-controls" }],
  "water-environmental-monitoring": [{ systemId: "qc-laboratory", stageId: "media-utilities" }, { systemId: "sterile-product", stageId: "monitor-investigate" }],
  "sterile-biologics": [{ systemId: "sterile-product", stageId: "aseptic-process" }, { systemId: "biopharma", stageId: "formulation-fill" }],
  "analytical-chemistry": [{ systemId: "qc-laboratory", stageId: "analytical-testing" }, { systemId: "pharma-api", stageId: "api-analytical" }],
  "quality-systems": [{ systemId: "quality-lifecycle", stageId: "quality-review-release" }, { systemId: "quality-lifecycle", stageId: "capa-change" }],
  "data-integrity": [{ systemId: "qc-laboratory", stageId: "lab-readiness" }, { systemId: "quality-lifecycle", stageId: "quality-signals" }],
};

export function resolveExplicitSystemStages(mappings: ExplicitSystemStageMap[] | undefined) {
  return (mappings ?? []).flatMap((mapping) => {
    const system = getWorkflowSystem(mapping.systemId);
    const stage = system?.stages.find((candidate) => candidate.id === mapping.stageId);
    return system && stage ? [{ system, stage }] : [];
  });
}
