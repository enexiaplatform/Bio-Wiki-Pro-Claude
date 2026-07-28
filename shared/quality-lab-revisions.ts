import { z } from "zod";
import {
  compileQualityLabBlueprint,
  getQualityLabReadiness,
  qualityLabBlueprintSchema,
  qualityLabInputSchema,
  type QualityLabInput,
  type QualityLabProject,
} from "./quality-lab.js";
import { qualityLabActionPlanSchema, reconcileQualityLabActionPlan } from "./quality-lab-actions.js";
import { qualityLabDecisionRegisterSchema, reconcileQualityLabDecisionRegister } from "./quality-lab-decisions.js";
import { createEmptyQualityLabEvidenceRegister, qualityLabEvidenceRegisterSchema } from "./quality-lab-evidence.js";
import { decisionLineageSchema, qualityLabReadinessSchema } from "./quality-lab-contract.js";

export const QUALITY_LAB_FROZEN_REVISION_VERSION = "quality-lab-frozen-revision/v1" as const;

export const qualityLabFrozenRevisionSchema = z.object({
  contractVersion: z.literal(QUALITY_LAB_FROZEN_REVISION_VERSION),
  projectId: z.string().min(1),
  revisionId: z.string().min(1),
  revisionNumber: z.number().int().positive(),
  projectName: z.string().min(1),
  inputSnapshot: qualityLabInputSchema,
  blueprintSnapshot: qualityLabBlueprintSchema,
  decisionRegisterSnapshot: qualityLabDecisionRegisterSchema,
  actionPlanSnapshot: qualityLabActionPlanSchema,
  decisionLineageSnapshot: z.array(decisionLineageSchema),
  readinessSnapshot: qualityLabReadinessSchema,
  evidenceRegisterSnapshot: qualityLabEvidenceRegisterSchema,
  compilerVersion: z.string().min(1),
  engineVersion: z.string().min(1),
  domainPack: z.object({ id: z.string().min(1), version: z.string().min(1) }),
  ruleReferences: z.array(z.object({ id: z.string().min(1), version: z.string().min(1) })),
  evidenceReferences: z.array(z.object({ id: z.string().min(1), version: z.string().min(1) })),
  generatedAt: z.string().datetime(),
  savedAt: z.string().datetime(),
  reviewState: z.enum(["concept-only", "review-requested", "expert-reviewed", "approved-outside-atlas"]),
  engagementMetadata: z.object({ engagementId: z.string(), engagementStatus: z.string() }).nullable(),
  provenanceStatus: z.enum(["complete", "legacy-incomplete"]),
  provenanceNotice: z.string().min(1),
});

export type QualityLabFrozenRevision = z.infer<typeof qualityLabFrozenRevisionSchema>;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function freezeQualityLabProjectRevision(
  project: Pick<QualityLabProject, "id" | "name" | "input" | "blueprint" | "actionPlan" | "decisionRegister"> & Partial<Pick<QualityLabProject, "evidenceRegister">>,
  revisionNumber: number,
  savedAt = new Date().toISOString(),
  provenanceStatus: QualityLabFrozenRevision["provenanceStatus"] = "complete",
): QualityLabFrozenRevision {
  const blueprint = clone(project.blueprint);
  const evidenceRegister = clone(project.evidenceRegister ?? createEmptyQualityLabEvidenceRegister(savedAt));
  return qualityLabFrozenRevisionSchema.parse({
    contractVersion: QUALITY_LAB_FROZEN_REVISION_VERSION,
    projectId: project.id,
    revisionId: `${project.id}:revision:${revisionNumber}`,
    revisionNumber,
    projectName: project.name,
    inputSnapshot: clone(project.input),
    blueprintSnapshot: blueprint,
    decisionRegisterSnapshot: clone(project.decisionRegister),
    actionPlanSnapshot: clone(project.actionPlan),
    decisionLineageSnapshot: clone(blueprint.decisionLineage),
    readinessSnapshot: clone(getQualityLabReadiness(blueprint)),
    evidenceRegisterSnapshot: evidenceRegister,
    compilerVersion: blueprint.compilerCoreVersion,
    engineVersion: blueprint.engineVersion,
    domainPack: { id: blueprint.domainPack.id, version: blueprint.domainPack.version },
    ruleReferences: blueprint.ruleTrace.map((rule) => ({ id: rule.ruleId, version: rule.ruleVersion })),
    evidenceReferences: blueprint.evidence.map((record) => ({ id: record.id, version: record.version })),
    generatedAt: blueprint.generatedAt,
    savedAt,
    reviewState: blueprint.review.status,
    engagementMetadata: null,
    provenanceStatus,
    provenanceNotice: provenanceStatus === "complete"
      ? "Frozen from the exact compiled output and versioned provenance shown here."
      : "Legacy snapshot preserved without recompilation; some original save or engagement provenance was not recorded.",
  });
}

export function ensureQualityLabProjectHistory(project: QualityLabProject): QualityLabProject {
  const parsed = z.array(qualityLabFrozenRevisionSchema).safeParse(project.revisions);
  if (parsed.success && parsed.data.length > 0) {
    const active = parsed.data.find((revision) => revision.revisionId === project.activeRevisionId) ?? parsed.data.at(-1)!;
    return { ...project, revisions: parsed.data, activeRevisionId: active.revisionId, evidenceRegister: project.evidenceRegister ?? createEmptyQualityLabEvidenceRegister(project.updatedAt) };
  }
  const legacy = freezeQualityLabProjectRevision(project, 1, project.updatedAt, "legacy-incomplete");
  return { ...project, revisions: [legacy], activeRevisionId: legacy.revisionId, evidenceRegister: project.evidenceRegister ?? createEmptyQualityLabEvidenceRegister(project.updatedAt) };
}

export function recompileQualityLabProject(
  project: QualityLabProject,
  rawInput: QualityLabInput,
  now = new Date().toISOString(),
): QualityLabProject {
  const historical = ensureQualityLabProjectHistory(project);
  const input = qualityLabInputSchema.parse(rawInput);
  const blueprint = compileQualityLabBlueprint(input);
  const actionPlan = reconcileQualityLabActionPlan(blueprint, historical.actionPlan, now);
  const decisionRegister = reconcileQualityLabDecisionRegister(blueprint, actionPlan, historical.decisionRegister, now);
  const working: QualityLabProject = {
    ...historical,
    name: input.projectName,
    input,
    blueprint,
    actionPlan,
    decisionRegister,
    updatedAt: now,
  };
  const next = freezeQualityLabProjectRevision(working, historical.revisions!.length + 1, now);
  return { ...working, revisions: [...historical.revisions!, next], activeRevisionId: next.revisionId };
}
