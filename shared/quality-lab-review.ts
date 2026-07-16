import { z } from "zod";
import { QUALITY_LAB_BLUEPRINT_CONTRACT_VERSION, QUALITY_LAB_INPUT_CONTRACT_VERSION } from "./quality-lab-contract.js";

export const QUALITY_LAB_REVIEW_BRIEF_VERSION = "quality-lab-review-brief/v1" as const;

export const qualityLabReviewRequestSchema = z.object({
  briefVersion: z.literal(QUALITY_LAB_REVIEW_BRIEF_VERSION),
  contact: z.object({
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(254),
    company: z.string().trim().max(160).nullable(),
    role: z.string().trim().max(120).nullable(),
  }),
  projectContext: z.string().trim().min(20).max(4000),
  project: z.object({
    localProjectId: z.string().min(1).max(120),
    projectName: z.string().min(1).max(200),
    country: z.string().min(1).max(120),
    facilityType: z.string().min(1).max(120),
    inputContractVersion: z.literal(QUALITY_LAB_INPUT_CONTRACT_VERSION),
    outputContractVersion: z.literal(QUALITY_LAB_BLUEPRINT_CONTRACT_VERSION),
    compilerCoreVersion: z.string().min(1).max(120),
    domainPackId: z.string().min(1).max(160),
    domainPackVersion: z.string().min(1).max(120),
    monthlyTests: z.number().int().nonnegative(),
    inputCompletenessPercent: z.number().min(0).max(100).optional(),
    readinessPercent: z.number().min(0).max(100).optional(),
    blockingOpenCount: z.number().int().nonnegative(),
    importantOpenCount: z.number().int().nonnegative(),
    unresolvedInputs: z.array(z.object({
      id: z.string().min(1).max(160),
      severity: z.enum(["blocking", "important", "advisory"]),
      question: z.string().min(1).max(500),
      resolution: z.string().min(1).max(500),
    })).max(30),
  }).transform((project) => ({
    ...project,
    inputCompletenessPercent: project.inputCompletenessPercent ?? project.readinessPercent ?? 0,
  })).nullable(),
  confidentialityConfirmed: z.literal(true),
});

export type QualityLabReviewRequest = z.infer<typeof qualityLabReviewRequestSchema>;

export function formatQualityLabReviewBrief(request: QualityLabReviewRequest): string {
  const lines = [
    `[${request.briefVersion}]`,
    request.contact.role ? `Contact role: ${request.contact.role}` : null,
    `Project context: ${request.projectContext}`,
  ];
  if (request.project) {
    const project = request.project;
    lines.push(
      `Project: ${project.projectName} (${project.localProjectId})`,
      `Basis: ${project.country}; ${project.facilityType}; ${project.monthlyTests} modeled monthly test units`,
      `Contracts: ${project.inputContractVersion}; ${project.outputContractVersion}; ${project.compilerCoreVersion}; ${project.domainPackId}@${project.domainPackVersion}`,
      `Triage: ${project.inputCompletenessPercent}% input completeness; ${project.blockingOpenCount} controlled-use blockers and ${project.importantOpenCount} important inputs open`,
      "Open-input checklist:",
      ...project.unresolvedInputs.map((item) => `- [${item.severity}] ${item.id}: ${item.question} Resolve: ${item.resolution}`),
    );
  } else {
    lines.push("Project: no browser-local model attached; discovery intake required.");
  }
  lines.push("Confidentiality: submitter confirmed that no confidential formulations, proprietary methods, credentials, or third-party personal data were included.");
  return lines.filter((line): line is string => Boolean(line)).join("\n");
}
