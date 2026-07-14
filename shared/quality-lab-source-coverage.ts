import { z } from "zod";
import type { EvidenceRecord, RuleTrace } from "./quality-lab-contract";

export const QUALITY_LAB_SOURCE_COVERAGE_VERSION = "source-coverage/v1.0" as const;
export const QUALITY_LAB_SOURCE_CLOSURE_REGISTER_VERSION = "source-closure-register/v1" as const;

export type EvidenceControlState =
  | "controlled-context"
  | "version-confirmation-required"
  | "project-revision"
  | "concept-benchmark"
  | "site-evidence-required";

export const evidenceClosureResolutionTypes = ["controlled-project-revision", "calibrated-benchmark-replacement", "confirmed-public-edition", "controlled-site-record"] as const;
export const evidenceClosureRecordSchema = z.object({
  evidenceId: z.string().trim().min(1),
  domainPackId: z.string().trim().min(1),
  domainPackVersion: z.string().trim().min(1),
  resolutionType: z.enum(evidenceClosureResolutionTypes),
  sourceVersion: z.string().trim().min(3),
  sourceLocator: z.string().trim().min(3),
  scopeSummary: z.string().trim().min(20),
  reviewStatus: z.enum(["draft", "accepted-outside-atlas", "rejected"]),
  reviewedByRole: z.string().trim().nullable(),
  reviewedAt: z.string().datetime().nullable(),
  reviewEvidenceRef: z.string().trim().nullable(),
  limitations: z.string().trim().min(20),
});
export type EvidenceClosureRecord = z.infer<typeof evidenceClosureRecordSchema>;

export const sourceClosureRegisterSchema = z.object({
  registerVersion: z.literal(QUALITY_LAB_SOURCE_CLOSURE_REGISTER_VERSION),
  domainPackId: z.string().trim().min(1),
  domainPackVersion: z.string().trim().min(1),
  updatedAt: z.string().datetime(),
  closures: z.array(evidenceClosureRecordSchema),
});
export type SourceClosureRegister = z.infer<typeof sourceClosureRegisterSchema>;

export interface ControlledEvidenceRecord extends EvidenceRecord {
  controlState: EvidenceControlState;
  openForControlledRelease: boolean;
  controlReason: string;
}

export interface RuleSourceCoverage {
  ruleId: string;
  ruleVersion: string;
  name: string;
  outputTypes: string[];
  evidenceIds: string[];
  missingEvidenceIds: string[];
  controlledEvidenceIds: string[];
  openEvidenceIds: string[];
  catalogTraceable: boolean;
  controlledReviewReady: boolean;
  reviewRequired: boolean;
  applicability: string;
  limitations: string;
}

export interface SourceCoverageAssessment {
  assessmentVersion: typeof QUALITY_LAB_SOURCE_COVERAGE_VERSION;
  generatedAt: string;
  domainPackId: string;
  domainPackVersion: string;
  domainPackStatus: string;
  evidence: ControlledEvidenceRecord[];
  closures: EvidenceClosureRecord[];
  rules: RuleSourceCoverage[];
  metrics: {
    evidenceRecordCount: number;
    ruleCount: number;
    catalogTraceableRuleCount: number;
    controlledReviewReadyRuleCount: number;
    controlledEvidenceCount: number;
    openEvidenceCount: number;
    acceptedClosureCount: number;
    missingEvidenceLinkCount: number;
    duplicateEvidenceIdCount: number;
    duplicateRuleIdCount: number;
  };
  blockers: string[];
  notice: string;
}

function hasUnconfirmedVersion(version: string) {
  return /must be confirmed|to be supplied|to be obtained/i.test(version);
}

export function requiredEvidenceClosureResolution(record: EvidenceRecord): EvidenceClosureRecord["resolutionType"] | null {
  if (record.status === "site-evidence-required") return "controlled-site-record";
  if (record.status === "internal-concept") return "calibrated-benchmark-replacement";
  if (record.status === "user-supplied") return "controlled-project-revision";
  if (hasUnconfirmedVersion(record.version)) return "confirmed-public-edition";
  return null;
}

export function isEvidenceClosureAccepted(args: {
  record: EvidenceRecord;
  closure: unknown;
  domainPack: { id: string; version: string };
  generatedAt: string;
}) {
  const closure = evidenceClosureRecordSchema.safeParse(args.closure);
  if (!closure.success) return false;
  const item = closure.data;
  return item.evidenceId === args.record.id
    && item.domainPackId === args.domainPack.id
    && item.domainPackVersion === args.domainPack.version
    && item.resolutionType === requiredEvidenceClosureResolution(args.record)
    && item.reviewStatus === "accepted-outside-atlas"
    && Boolean(item.reviewedByRole)
    && Boolean(item.reviewEvidenceRef)
    && Boolean(item.reviewedAt)
    && Date.parse(item.reviewedAt ?? "") <= Date.parse(args.generatedAt);
}

export function classifyEvidenceControl(record: EvidenceRecord, closure?: unknown, domainPack?: { id: string; version: string }, generatedAt = new Date().toISOString()): ControlledEvidenceRecord {
  if (closure && domainPack && isEvidenceClosureAccepted({ record, closure, domainPack, generatedAt })) {
    return { ...record, controlState: "controlled-context", openForControlledRelease: false, controlReason: "A version-matched controlled closure record references externally accepted review evidence. Applicability and approval remain outside Atlas." };
  }
  if (record.status === "site-evidence-required") {
    return {
      ...record,
      controlState: "site-evidence-required",
      openForControlledRelease: true,
      controlReason: "The catalog names the required evidence, but the approved site or vendor record has not been supplied.",
    };
  }
  if (record.status === "internal-concept") {
    return {
      ...record,
      controlState: "concept-benchmark",
      openForControlledRelease: true,
      controlReason: "This is an uncalibrated Atlas planning assumption and cannot be treated as verified operating evidence.",
    };
  }
  if (record.status === "user-supplied") {
    return {
      ...record,
      controlState: "project-revision",
      openForControlledRelease: true,
      controlReason: "The evidence must be tied to a named, reviewed project revision before controlled use.",
    };
  }
  if (hasUnconfirmedVersion(record.version)) {
    return {
      ...record,
      controlState: "version-confirmation-required",
      openForControlledRelease: true,
      controlReason: "The source is identified, but its applicable edition or revision is not confirmed.",
    };
  }
  return {
    ...record,
    controlState: "controlled-context",
    openForControlledRelease: false,
    controlReason: "The public context record has a named version and locator; applicability still requires qualified review.",
  };
}

export function assessSourceCoverage(args: {
  domainPack: { id: string; version: string; status: string };
  evidence: EvidenceRecord[];
  rules: RuleTrace[];
  closures?: EvidenceClosureRecord[];
  generatedAt?: string;
}): SourceCoverageAssessment {
  const generatedAt = args.generatedAt ?? new Date().toISOString();
  const closures = (args.closures ?? []).flatMap((closure) => {
    const parsed = evidenceClosureRecordSchema.safeParse(closure);
    return parsed.success ? [parsed.data] : [];
  });
  const closureByEvidenceId = new Map(closures.map((closure) => [closure.evidenceId, closure]));
  const evidence = args.evidence.map((record) => classifyEvidenceControl(record, closureByEvidenceId.get(record.id), args.domainPack, generatedAt));
  const duplicateEvidenceIdCount = evidence.length - new Set(evidence.map((record) => record.id)).size;
  const duplicateRuleIdCount = args.rules.length - new Set(args.rules.map((rule) => rule.ruleId)).size;
  const evidenceById = new Map(evidence.map((record) => [record.id, record]));
  const rules = args.rules.map<RuleSourceCoverage>((rule) => {
    const missingEvidenceIds = rule.evidenceIds.filter((id) => !evidenceById.has(id));
    const linkedEvidence = rule.evidenceIds.flatMap((id) => {
      const record = evidenceById.get(id);
      return record ? [record] : [];
    });
    const openEvidenceIds = linkedEvidence.filter((record) => record.openForControlledRelease).map((record) => record.id);
    const controlledEvidenceIds = linkedEvidence.filter((record) => !record.openForControlledRelease).map((record) => record.id);
    return {
      ruleId: rule.ruleId,
      ruleVersion: rule.ruleVersion,
      name: rule.name,
      outputTypes: rule.outputTypes,
      evidenceIds: rule.evidenceIds,
      missingEvidenceIds,
      controlledEvidenceIds,
      openEvidenceIds,
      catalogTraceable: missingEvidenceIds.length === 0,
      controlledReviewReady: missingEvidenceIds.length === 0 && openEvidenceIds.length === 0,
      reviewRequired: rule.reviewRequired,
      applicability: rule.applicability,
      limitations: rule.limitations,
    };
  });
  const missingEvidenceLinkCount = rules.reduce((sum, rule) => sum + rule.missingEvidenceIds.length, 0);
  const catalogTraceableRuleCount = rules.filter((rule) => rule.catalogTraceable).length;
  const controlledReviewReadyRuleCount = rules.filter((rule) => rule.controlledReviewReady).length;
  const openEvidence = evidence.filter((record) => record.openForControlledRelease);
  const acceptedClosureCount = evidence.filter((record) => !record.openForControlledRelease && requiredEvidenceClosureResolution(record) !== null).length;
  const blockers: string[] = [];
  if (duplicateEvidenceIdCount > 0) blockers.push(`${duplicateEvidenceIdCount} duplicate evidence catalog ID(s) must be resolved.`);
  if (duplicateRuleIdCount > 0) blockers.push(`${duplicateRuleIdCount} duplicate rule ID(s) must be resolved.`);
  if (missingEvidenceLinkCount > 0) blockers.push(`${missingEvidenceLinkCount} rule-to-evidence link(s) do not resolve to the catalog.`);
  if (openEvidence.some((record) => record.controlState === "version-confirmation-required")) blockers.push("Confirm the applicable edition for every public source marked as unresolved.");
  if (openEvidence.some((record) => record.controlState === "site-evidence-required")) blockers.push("Obtain and review the named site-approved methods, specifications, SOPs, and vendor evidence.");
  if (openEvidence.some((record) => record.controlState === "concept-benchmark")) blockers.push("Calibrate or replace Atlas concept benchmarks with controlled case evidence.");
  if (openEvidence.some((record) => record.controlState === "project-revision")) blockers.push("Bind project facts to a named revision and qualified review record.");

  return {
    assessmentVersion: QUALITY_LAB_SOURCE_COVERAGE_VERSION,
    generatedAt,
    domainPackId: args.domainPack.id,
    domainPackVersion: args.domainPack.version,
    domainPackStatus: args.domainPack.status,
    evidence,
    closures,
    rules,
    metrics: {
      evidenceRecordCount: evidence.length,
      ruleCount: rules.length,
      catalogTraceableRuleCount,
      controlledReviewReadyRuleCount,
      controlledEvidenceCount: evidence.length - openEvidence.length,
      openEvidenceCount: openEvidence.length,
      acceptedClosureCount,
      missingEvidenceLinkCount,
      duplicateEvidenceIdCount,
      duplicateRuleIdCount,
    },
    blockers,
    notice: "Coverage measures traceability and evidence closure only. It does not verify a method, validate a Domain Pack, or authorize design, procurement, or release decisions.",
  };
}

export function createSourceClosureRegister(args: { domainPack: { id: string; version: string }; closures: EvidenceClosureRecord[]; updatedAt?: string }): SourceClosureRegister {
  return sourceClosureRegisterSchema.parse({ registerVersion: QUALITY_LAB_SOURCE_CLOSURE_REGISTER_VERSION, domainPackId: args.domainPack.id, domainPackVersion: args.domainPack.version, updatedAt: args.updatedAt ?? new Date().toISOString(), closures: args.closures });
}

export function applySourceClosureRegister(args: { domainPack: { id: string; version: string }; register: unknown }) {
  const parsed = sourceClosureRegisterSchema.safeParse(args.register);
  if (!parsed.success) return { closures: [] as EvidenceClosureRecord[], applied: false as const, reason: "The saved source-closure register is invalid." };
  if (parsed.data.domainPackId !== args.domainPack.id || parsed.data.domainPackVersion !== args.domainPack.version) return { closures: [] as EvidenceClosureRecord[], applied: false as const, reason: `The saved source-closure register targets ${parsed.data.domainPackId}@${parsed.data.domainPackVersion}, not ${args.domainPack.id}@${args.domainPack.version}.` };
  return { closures: parsed.data.closures, applied: true as const, reason: null };
}

export function createSourceCoverageRegistry(assessment: SourceCoverageAssessment) {
  return {
    documentType: "Atlas Quality Lab source coverage registry",
    documentVersion: assessment.assessmentVersion,
    generatedAt: assessment.generatedAt,
    controlStatus: "working-control-record",
    domainPack: {
      id: assessment.domainPackId,
      version: assessment.domainPackVersion,
      status: assessment.domainPackStatus,
    },
    metrics: assessment.metrics,
    blockers: assessment.blockers,
    evidence: assessment.evidence,
    closures: assessment.closures,
    rules: assessment.rules,
    controlNotice: assessment.notice,
  };
}
