import { z } from "zod";
import { QUALITY_LAB_BLUEPRINT_CONTRACT_VERSION, QUALITY_LAB_INPUT_CONTRACT_VERSION } from "./quality-lab-contract.js";

export const QUALITY_LAB_REVIEW_BRIEF_VERSION = "quality-lab-review-brief/v2" as const;

export const qualityLabEngagementIntentSchema = z.enum(["scope-diagnostic", "blueprint-pilot", "unsure"]);
export const qualityLabProjectStageSchema = z.enum(["concept", "budget-planning", "approved-project", "active-project", "expansion-or-change"]);
export const qualityLabDecisionWindowSchema = z.enum(["under-30-days", "1-3-months", "3-6-months", "over-6-months", "not-set"]);
export const qualityLabBudgetStatusSchema = z.enum(["exploring", "range-defined", "budget-approved", "procurement-ready", "prefer-not-to-say"]);
export const qualityLabDecisionRoleSchema = z.enum(["decision-owner", "technical-lead", "influencer", "advisor-or-partner", "other"]);
export const qualityLabDataReadinessSchema = z.enum(["initial", "partial", "substantial", "review-ready"]);
export const qualityLabPortfolioScaleSchema = z.enum(["1-3-products", "4-10-products", "11-25-products", "over-25-products", "not-set"]);

export const qualityLabReviewRequestSchema = z.object({
  briefVersion: z.literal(QUALITY_LAB_REVIEW_BRIEF_VERSION),
  contact: z.object({
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(254),
    company: z.string().trim().max(160).nullable(),
    role: z.string().trim().max(120).nullable(),
  }),
  qualification: z.object({
    engagementIntent: qualityLabEngagementIntentSchema,
    projectStage: qualityLabProjectStageSchema,
    decisionWindow: qualityLabDecisionWindowSchema,
    budgetStatus: qualityLabBudgetStatusSchema,
    decisionRole: qualityLabDecisionRoleSchema,
    dataReadiness: qualityLabDataReadinessSchema,
    portfolioScale: qualityLabPortfolioScaleSchema,
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

const qualificationLabels = {
  engagementIntent: {
    "scope-diagnostic": "Paid Scope Diagnostic ($750 fixed fee)",
    "blueprint-pilot": "Expert-reviewed Blueprint Pilot (from $3,500)",
    unsure: "Engagement fit review",
  },
  projectStage: {
    concept: "Concept / feasibility",
    "budget-planning": "Budget planning",
    "approved-project": "Approved project",
    "active-project": "Active project / procurement",
    "expansion-or-change": "Operating-model change or expansion",
  },
  decisionWindow: {
    "under-30-days": "Under 30 days",
    "1-3-months": "1–3 months",
    "3-6-months": "3–6 months",
    "over-6-months": "Over 6 months",
    "not-set": "Not set",
  },
  budgetStatus: {
    exploring: "Exploring / no range yet",
    "range-defined": "Working range defined",
    "budget-approved": "Budget approved",
    "procurement-ready": "Procurement ready",
    "prefer-not-to-say": "Prefer not to say",
  },
  decisionRole: {
    "decision-owner": "Decision owner / budget holder",
    "technical-lead": "Technical lead",
    influencer: "Project contributor / influencer",
    "advisor-or-partner": "Engineering, distributor, or specialist partner",
    other: "Other",
  },
  dataReadiness: {
    initial: "Initial facts only",
    partial: "Partial product, demand, or site data",
    substantial: "Substantial working data",
    "review-ready": "Controlled inputs ready for review",
  },
  portfolioScale: {
    "1-3-products": "1–3 products",
    "4-10-products": "4–10 products",
    "11-25-products": "11–25 products",
    "over-25-products": "Over 25 products",
    "not-set": "Not confirmed",
  },
} as const;

export function qualityLabReviewOfferLabel(intent: QualityLabReviewRequest["qualification"]["engagementIntent"]): string {
  return qualificationLabels.engagementIntent[intent];
}

export function formatQualityLabReviewBrief(request: QualityLabReviewRequest): string {
  const lines = [
    `[${request.briefVersion}]`,
    request.contact.role ? `Contact role: ${request.contact.role}` : null,
    `Requested offer: ${qualityLabReviewOfferLabel(request.qualification.engagementIntent)}`,
    `Commercial fit: stage=${qualificationLabels.projectStage[request.qualification.projectStage]}; decision window=${qualificationLabels.decisionWindow[request.qualification.decisionWindow]}; budget=${qualificationLabels.budgetStatus[request.qualification.budgetStatus]}; contact role=${qualificationLabels.decisionRole[request.qualification.decisionRole]}`,
    `Delivery readiness: data=${qualificationLabels.dataReadiness[request.qualification.dataReadiness]}; portfolio=${qualificationLabels.portfolioScale[request.qualification.portfolioScale]}`,
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
