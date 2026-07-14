import { z } from "zod";

export const QUALITY_LAB_RULE_CHANGE_REGISTER_VERSION = "rule-change-register/v1" as const;
export const ruleChangeCandidateSchema = z.object({
  id: z.string().trim().min(1),
  domainPackId: z.string().trim().min(1),
  domainPackVersion: z.string().trim().min(1),
  targetRuleId: z.string().trim().min(1),
  currentRuleVersion: z.string().trim().min(1),
  proposedRuleVersion: z.string().trim().min(1),
  triggerProjectIds: z.array(z.string().trim().min(1)).min(1),
  evidenceRefs: z.array(z.string().trim().min(1)).min(1),
  validationCaseIds: z.array(z.string().trim().min(1)).min(1),
  changeSummary: z.string().trim().min(20),
  rationale: z.string().trim().min(20),
  impactAssessment: z.string().trim().min(20),
  proposedByRole: z.string().trim().min(1),
  proposedAt: z.string().datetime(),
  reviewStatus: z.enum(["draft", "ready-for-external-approval", "approved-outside-atlas", "rejected"]),
  approvedByRole: z.string().trim().nullable(),
  approvalEvidenceRef: z.string().trim().nullable(),
  approvedAt: z.string().datetime().nullable(),
});
export type RuleChangeCandidate = z.infer<typeof ruleChangeCandidateSchema>;
export const ruleChangeRegisterSchema = z.object({ registerVersion: z.literal(QUALITY_LAB_RULE_CHANGE_REGISTER_VERSION), domainPackId: z.string().min(1), domainPackVersion: z.string().min(1), updatedAt: z.string().datetime(), candidates: z.array(ruleChangeCandidateSchema) });
export type RuleChangeRegister = z.infer<typeof ruleChangeRegisterSchema>;

export function assessRuleChangeCandidate(candidate: RuleChangeCandidate, knownRuleIds: string[]) {
  const blockers: string[] = [];
  if (!knownRuleIds.includes(candidate.targetRuleId)) blockers.push("Target rule does not exist in the active registry.");
  if (candidate.currentRuleVersion === candidate.proposedRuleVersion) blockers.push("Proposed rule version must differ from the current version.");
  if (new Set(candidate.triggerProjectIds).size < 1) blockers.push("At least one distinct trigger project is required.");
  if (new Set(candidate.validationCaseIds).size < 1) blockers.push("At least one controlled validation case is required.");
  if (candidate.reviewStatus === "approved-outside-atlas" && (!candidate.approvedByRole || !candidate.approvalEvidenceRef || !candidate.approvedAt)) blockers.push("External approval role, evidence reference and date are required.");
  return { candidate, eligibleForExternalApproval: blockers.length === 0 && candidate.reviewStatus === "ready-for-external-approval", externallyApproved: blockers.length === 0 && candidate.reviewStatus === "approved-outside-atlas", blockers, notice: "A candidate or approval record does not modify executable Atlas rules. A separate controlled Domain Pack version release is required." };
}

export function createRuleChangeRegister(args: { domainPack: { id: string; version: string }; candidates: RuleChangeCandidate[]; updatedAt?: string }) {
  return ruleChangeRegisterSchema.parse({ registerVersion: QUALITY_LAB_RULE_CHANGE_REGISTER_VERSION, domainPackId: args.domainPack.id, domainPackVersion: args.domainPack.version, updatedAt: args.updatedAt ?? new Date().toISOString(), candidates: args.candidates });
}
