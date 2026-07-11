import { z } from "zod";
import type { QualityLabProject } from "./quality-lab.js";

export const QUALITY_LAB_ENGAGEMENT_PACKET_VERSION = "quality-lab-engagement-packet/v1" as const;

const checklistStatusSchema = z.enum(["open", "in-review", "resolved", "not-applicable"]);

export const qualityLabEngagementPacketSchema = z.object({
  packetVersion: z.literal(QUALITY_LAB_ENGAGEMENT_PACKET_VERSION),
  generatedAt: z.string().datetime(),
  stage: z.literal("scope-triage"),
  project: z.object({ id: z.string().min(1), name: z.string().min(1), country: z.string().min(1), facilityType: z.string().min(1) }),
  sourceVersions: z.object({ inputContract: z.string().min(1), outputContract: z.string().min(1), compilerCore: z.string().min(1), domainPack: z.string().min(1) }),
  baseline: z.object({
    monthlyTests: z.object({ estimate: z.number().nonnegative(), actual: z.number().nonnegative().nullable(), variancePercent: z.number().nullable() }),
    teamFte: z.object({ estimate: z.number().nonnegative(), actual: z.number().nonnegative().nullable(), variancePercent: z.number().nullable() }),
    areaSqm: z.object({ estimate: z.number().nonnegative(), actual: z.number().nonnegative().nullable(), variancePercent: z.number().nullable() }),
    capexLowUsd: z.object({ estimate: z.number().nonnegative(), actual: z.number().nonnegative().nullable(), variancePercent: z.number().nullable() }),
    capexHighUsd: z.object({ estimate: z.number().nonnegative(), actual: z.number().nonnegative().nullable(), variancePercent: z.number().nullable() }),
  }),
  checklist: z.array(z.object({ id: z.string().min(1), ownerRole: z.string().min(1), status: checklistStatusSchema, question: z.string().min(1), requiredEvidence: z.string().min(1), relatedRuleIds: z.array(z.string()), reviewerNote: z.string() })),
  corrections: z.array(z.object({ id: z.string(), recordedAt: z.string(), fieldOrRuleId: z.string(), previousValue: z.string(), correctedValue: z.string(), evidenceRef: z.string(), rationale: z.string(), reviewerRole: z.string() })),
  decisions: z.array(z.object({ id: z.string(), recordedAt: z.string(), decision: z.string(), optionsConsidered: z.array(z.string()), rationale: z.string(), owner: z.string(), downstreamImpact: z.string() })),
  controls: z.object({ expertApprovalInsideAtlas: z.literal(false), containsContactData: z.literal(false), usageNotice: z.string().min(1) }),
});

export type QualityLabEngagementPacket = z.infer<typeof qualityLabEngagementPacketSchema>;

const ownerByCategory: Record<string, string> = {
  portfolio: "QC / Regulatory Affairs", method: "QC method owner", workload: "QC operations", equipment: "Laboratory engineering",
  facility: "Engineering / EHS", cost: "Procurement / Finance", governance: "QA",
};

export function createQualityLabEngagementPacket(project: QualityLabProject, generatedAt = new Date().toISOString()): QualityLabEngagementPacket {
  const { blueprint } = project;
  const packet = {
    packetVersion: QUALITY_LAB_ENGAGEMENT_PACKET_VERSION,
    generatedAt,
    stage: "scope-triage" as const,
    project: { id: project.id, name: project.name, country: project.input.country, facilityType: project.input.facilityType },
    sourceVersions: {
      inputContract: project.input.contractVersion,
      outputContract: blueprint.contractVersion,
      compilerCore: blueprint.compilerCoreVersion,
      domainPack: `${blueprint.domainPack.id}@${blueprint.domainPack.version}`,
    },
    baseline: {
      monthlyTests: { estimate: blueprint.current.monthlyTests, actual: null, variancePercent: null },
      teamFte: { estimate: blueprint.current.totalTeamFte, actual: null, variancePercent: null },
      areaSqm: { estimate: blueprint.current.estimatedAreaSqm, actual: null, variancePercent: null },
      capexLowUsd: { estimate: blueprint.current.capexLowUsd, actual: null, variancePercent: null },
      capexHighUsd: { estimate: blueprint.current.capexHighUsd, actual: null, variancePercent: null },
    },
    checklist: blueprint.unresolvedInputs.map((item) => ({
      id: `review-${item.id}`,
      ownerRole: ownerByCategory[item.category] ?? "Project owner",
      status: "open" as const,
      question: item.question,
      requiredEvidence: item.resolution,
      relatedRuleIds: item.relatedRuleIds,
      reviewerNote: "",
    })),
    corrections: [],
    decisions: [],
    controls: {
      expertApprovalInsideAtlas: false as const,
      containsContactData: false as const,
      usageNotice: "Working engagement packet only. Qualified reviewers must resolve evidence, record corrections and approve controlled deliverables under the client quality system.",
    },
  };
  return qualityLabEngagementPacketSchema.parse(packet);
}

export function calculateVariancePercent(estimate: number, actual: number): number | null {
  if (estimate === 0) return actual === 0 ? 0 : null;
  return Math.round(((actual - estimate) / estimate) * 1000) / 10;
}
