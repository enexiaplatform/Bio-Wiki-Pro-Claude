import type { RegulatoryDomain } from "@shared/regulatory-monitor";

import { atlasEvidenceDomains, type BlueprintDecisionId, type EvidenceDomainId } from "./atlasEvidenceGraph";
import {
  RESOURCE_COVERAGE_CONTRACT_VERSION,
  STAGE_COVERAGE_RULES,
  stageCoverageProfiles,
  type ResourceArea,
  type ResourceCoverageStatus,
  type ResourceKind,
} from "./resourceCoverage";
import {
  getWorkflowSystem,
  workflowSystems,
  type ConnectedApplicationKind,
  type ConnectedApplicationRef,
  type WorkflowSystem,
  type WorkflowSystemStage,
} from "./workflowSystems";
import {
  buildResourceContextHref,
  type ResourceSelection,
} from "./resourceSelection";

export type { ResourceArea, ResourceCoverageStatus, ResourceKind } from "./resourceCoverage";
export { buildResourceContextHref, parseResourceSelection, type ResourceSelection } from "./resourceSelection";
export type GuidedWorkPhase = "prepare" | "execute" | "investigate" | "release";
export type GuidedOutcome = "learn" | "calculate" | "workflow" | "toolkit" | "verify";

export interface ResourceConnection {
  key: string;
  kind: ResourceKind;
  slug: string;
  title: string;
  href: string;
  systemId: string;
  stageId: string;
  system: WorkflowSystem;
  stage: WorkflowSystemStage;
  evidenceDomainIds: EvidenceDomainId[];
  decisionIds: BlueprintDecisionId[];
  decisionPackageIds: string[];
  coverageStatus: ResourceCoverageStatus;
  sourceIds: string[];
  reviewRequired: boolean;
  reviewerRole: string;
  purpose: string;
  applicability: string;
  limitations: string;
}

export interface StageAreaCoverage {
  area: ResourceArea;
  status: ResourceCoverageStatus;
  connections: ResourceConnection[];
}

export interface StageResourceCoverage {
  contractVersion: typeof RESOURCE_COVERAGE_CONTRACT_VERSION;
  system: WorkflowSystem;
  stage: WorkflowSystemStage;
  areas: Record<ResourceArea, StageAreaCoverage>;
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

export const RESOURCE_KIND_AREAS: Record<ResourceKind, ResourceArea> = {
  workflow: "workflows",
  lesson: "academy",
  tool: "tools",
  toolkit: "toolkits",
  method: "methods",
  monitor: "monitor",
  compliance: "compliance",
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

const EVIDENCE_REQUIRED_TOOLKITS = new Set([
  "sterile-product-control-pack",
  "qc-laboratory-operating-pack",
  "pharma-api-lifecycle-control-pack",
  "quality-lifecycle-control-pack",
]);

const applicationConnections: ResourceConnection[] = workflowSystems.flatMap((system) => system.stages.flatMap((stage) => stage.applications.map((reference) => {
  const href = applicationHref(reference);
  const evidence = evidenceForHref(href);
  return {
    key: `${system.id}:${stage.id}:${reference.kind}:${reference.slug}`,
    kind: reference.kind,
    slug: reference.slug,
    title: reference.slug,
    href,
    systemId: system.id,
    stageId: stage.id,
    system,
    stage,
    ...evidence,
    decisionPackageIds: [],
    coverageStatus: reference.kind === "toolkit" && EVIDENCE_REQUIRED_TOOLKITS.has(reference.slug) ? "evidence-required" : "mapped",
    sourceIds: [],
    reviewRequired: true,
    reviewerRole: "Applicable system owner and qualified reviewer",
    purpose: `Support the ${stage.title} decision stage with a connected ${reference.kind}.`,
    applicability: `Confirm product, market, site, method, and effective-version applicability for ${system.shortTitle} / ${stage.title}.`,
    limitations: "A catalog connection is navigation evidence only; it does not approve applicability, method use, validation, compliance, or disposition.",
  };
})));

const profileConnections: ResourceConnection[] = stageCoverageProfiles.flatMap((profile) => {
  const system = getWorkflowSystem(profile.systemId);
  const stage = system?.stages.find((candidate) => candidate.id === profile.stageId);
  if (!system || !stage) return [];
  return [{
    key: profile.key,
    kind: profile.kind,
    slug: profile.slug,
    title: profile.title,
    href: profile.href,
    systemId: profile.systemId,
    stageId: profile.stageId,
    system,
    stage,
    evidenceDomainIds: [],
    decisionIds: profile.decisionIds,
    decisionPackageIds: profile.decisionPackageIds,
    coverageStatus: profile.coverageStatus,
    sourceIds: profile.sourceIds,
    reviewRequired: profile.reviewRequired,
    reviewerRole: profile.reviewerRole,
    purpose: profile.purpose,
    applicability: profile.applicability,
    limitations: profile.limitations,
  }];
});

export const resourceConnections: ResourceConnection[] = [...applicationConnections, ...profileConnections];

export function getConnectionsForSelection(selection: ResourceSelection, area?: ResourceArea) {
  if (!selection.systemId) return [];
  return resourceConnections.filter((connection) => connection.systemId === selection.systemId
    && (!selection.stageId || connection.stageId === selection.stageId)
    && (!area || RESOURCE_KIND_AREAS[connection.kind] === area));
}

const RESOURCE_AREAS: ResourceArea[] = ["workflows", "academy", "tools", "toolkits", "methods", "compliance", "monitor"];

export function getStageResourceCoverage(selection: ResourceSelection): StageResourceCoverage | undefined {
  const system = getResourceSystem(selection.systemId);
  const stage = system?.stages.find((candidate) => candidate.id === selection.stageId);
  if (!system || !stage) return undefined;
  const areas = Object.fromEntries(RESOURCE_AREAS.map((area) => {
    const connections = getConnectionsForSelection({ systemId: system.id, stageId: stage.id }, area);
    const status = (["not-covered", "evidence-required", "specialist-review-required", "under-review", "mapped", "no-current-change"] as ResourceCoverageStatus[])
      .find((candidate) => connections.some((connection) => connection.coverageStatus === candidate)) ?? "no-current-change";
    return [area, { area, status, connections } satisfies StageAreaCoverage];
  })) as Record<ResourceArea, StageAreaCoverage>;
  return { contractVersion: RESOURCE_COVERAGE_CONTRACT_VERSION, system, stage, areas };
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
  "nonsterile-microbiology": STAGE_COVERAGE_RULES.filter((entry) => entry.monitorDomains.includes("nonsterile-microbiology")).map(({ systemId, stageId }) => ({ systemId, stageId })),
  "water-environmental-monitoring": STAGE_COVERAGE_RULES.filter((entry) => entry.monitorDomains.includes("water-environmental-monitoring")).map(({ systemId, stageId }) => ({ systemId, stageId })),
  "sterile-biologics": STAGE_COVERAGE_RULES.filter((entry) => entry.monitorDomains.includes("sterile-biologics")).map(({ systemId, stageId }) => ({ systemId, stageId })),
  "analytical-chemistry": STAGE_COVERAGE_RULES.filter((entry) => entry.monitorDomains.includes("analytical-chemistry")).map(({ systemId, stageId }) => ({ systemId, stageId })),
  "quality-systems": STAGE_COVERAGE_RULES.filter((entry) => entry.monitorDomains.includes("quality-systems")).map(({ systemId, stageId }) => ({ systemId, stageId })),
  "data-integrity": STAGE_COVERAGE_RULES.filter((entry) => entry.monitorDomains.includes("data-integrity")).map(({ systemId, stageId }) => ({ systemId, stageId })),
};

export function resolveExplicitSystemStages(mappings: ExplicitSystemStageMap[] | undefined) {
  return (mappings ?? []).flatMap((mapping) => {
    const system = getWorkflowSystem(mapping.systemId);
    const stage = system?.stages.find((candidate) => candidate.id === mapping.stageId);
    return system && stage ? [{ system, stage }] : [];
  });
}
