import { z } from "zod";
import type { QualityLabProject } from "./quality-lab.js";

export const QUALITY_LAB_DIAGNOSTIC_PACKAGE_VERSION = "quality-lab-scope-diagnostic/v2" as const;

const diagnosticOptionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(3),
  description: z.string().min(10),
  evidenceNeeded: z.array(z.string().min(3)).min(1),
  tradeoffs: z.array(z.string().min(3)).min(1),
});

export const qualityLabDiagnosticPackageSchema = z.object({
  contractVersion: z.literal(QUALITY_LAB_DIAGNOSTIC_PACKAGE_VERSION),
  generatedAt: z.string().datetime(),
  control: z.object({
    documentId: z.string().min(1),
    revision: z.string().min(1),
    status: z.literal("working-draft"),
    limitations: z.array(z.string().min(10)).min(1),
  }),
  workshopGuide: z.object({
    durationMinutes: z.number().int().min(45).max(120),
    participants: z.array(z.string().min(2)).min(3),
    agenda: z.array(z.object({ minutes: z.number().int().positive(), objective: z.string().min(8), output: z.string().min(8) })).min(4),
  }),
  decision: z.object({ statement: z.string().min(20), ownerRole: z.string().min(2), decisionWindow: z.string().min(2) }),
  scope: z.object({ inScope: z.array(z.string()).min(1), outOfScope: z.array(z.string()).min(1) }),
  inputInventory: z.array(z.object({ id: z.string(), category: z.string(), status: z.enum(["available", "gap", "needs-verification"]), ownerRole: z.string(), evidenceNeeded: z.string() })).min(1),
  assumptions: z.array(z.object({ id: z.string(), statement: z.string(), confidence: z.enum(["high", "medium", "indicative"]), materialChangeFactors: z.array(z.string()).min(1) })).min(1),
  options: z.array(diagnosticOptionSchema).min(2).max(3),
  blueprintWorkplan: z.object({
    reviewDomains: z.array(z.enum(["domain-pack", "quality-governance", "lab-operations-capacity", "engineering-cost"])).length(4),
    timeline: z.array(z.object({ phase: z.string(), exitCriterion: z.string() })).min(3),
    acceptanceCriteria: z.array(z.string().min(8)).min(4),
  }),
  memo: z.object({
    recommendedOptionId: z.string(),
    recommendation: z.string().min(10),
    openDecisions: z.array(z.string()),
    limitations: z.array(z.string()).min(1),
  }),
});

export type QualityLabDiagnosticPackage = z.infer<typeof qualityLabDiagnosticPackageSchema>;

export function createQualityLabDiagnosticPackage(project: QualityLabProject, generatedAt = new Date().toISOString()): QualityLabDiagnosticPackage {
  const blueprint = project.blueprint;
  const inScope = blueprint.workflows.map((workflow) => workflow.label);
  const outOfScope = ["Detailed engineering and construction design", "Method validation or verification execution", "QA or regulatory approval", "Supplier quotation or commercial award"];
  const inputInventory = blueprint.unresolvedInputs.map((item) => ({
    id: item.id,
    category: item.category,
    status: item.severity === "blocking" ? "gap" as const : "needs-verification" as const,
    ownerRole: project.actionPlan.actions.find((action) => action.sourceInputId === item.id)?.ownerRole || "Project owner",
    evidenceNeeded: item.resolution,
  }));
  const assumptions = blueprint.assumptions.map((item) => ({
    id: item.id,
    statement: `${item.label}: ${item.value}`,
    confidence: item.confidence,
    materialChangeFactors: blueprint.decisionLineage.filter((lineage) => lineage.assumptionIds.includes(item.id)).flatMap((lineage) => lineage.materialChangeFactors).slice(0, 5).length
      ? Array.from(new Set(blueprint.decisionLineage.filter((lineage) => lineage.assumptionIds.includes(item.id)).flatMap((lineage) => lineage.materialChangeFactors))).slice(0, 5)
      : ["Approved site evidence", "Scope or demand change"],
  }));

  const output = {
    contractVersion: QUALITY_LAB_DIAGNOSTIC_PACKAGE_VERSION,
    generatedAt,
    control: {
      documentId: `ATLAS-DIAG-${project.id.toUpperCase()}`,
      revision: "D0",
      status: "working-draft" as const,
      limitations: ["Scope diagnostic only. Controlled Blueprint release requires complete evidence and appointed qualified reviewers."],
    },
    workshopGuide: {
      durationMinutes: 60,
      participants: ["Decision owner", "QC or laboratory operations owner", "QA or quality governance representative", "Engineering or cost representative"],
      agenda: [
        { minutes: 10, objective: "Confirm the decision and decision owner", output: "One written decision statement and accountable owner" },
        { minutes: 15, objective: "Set in-scope and out-of-scope boundaries", output: "Agreed scope boundary and exclusions" },
        { minutes: 15, objective: "Inventory controlled inputs and material gaps", output: "Owned evidence and data-gap map" },
        { minutes: 10, objective: "Compare two or three feasible paths", output: "Option trade-offs and evidence needs" },
        { minutes: 10, objective: "Agree the Blueprint workplan and acceptance test", output: "Review coverage, timeline and acceptance criteria" },
      ],
    },
    decision: { statement: project.input.primaryDecision, ownerRole: project.input.decisionOwnerRole, decisionWindow: project.input.decisionWindow },
    scope: { inScope: inScope.length ? inScope : ["Selected microbiology QC scope"], outOfScope },
    inputInventory,
    assumptions,
    options: [
      { id: "baseline-inhouse", label: "Baseline in-house model", description: "Use the current concept in-house allocation as the evidence-gathering baseline.", evidenceNeeded: ["Approved portfolio and methods", "Observed workload and review time"], tradeoffs: ["More internal capability and control", "Higher evidence, staffing and equipment burden"] },
      { id: "hybrid-phased", label: "Phased hybrid model", description: "Retain critical capability while phasing or outsourcing selected demand until evidence supports expansion.", evidenceNeeded: ["Supplier capability and quality agreement", "Internal versus external turnaround and cost evidence"], tradeoffs: ["Lower initial internal load", "Greater supplier, handoff and governance dependency"] },
      { id: "verification-first", label: "Verification-first hold", description: "Delay the funding recommendation until blocking portfolio and method evidence is resolved.", evidenceNeeded: ["Closed blocking-input register", "Qualified review of method applicability"], tradeoffs: ["Reduces premature commitment", "May delay project decisions"] },
    ],
    blueprintWorkplan: {
      reviewDomains: ["domain-pack", "quality-governance", "lab-operations-capacity", "engineering-cost"],
      timeline: [
        { phase: "Evidence closure", exitCriterion: "Blocking portfolio and method evidence is traceable or explicitly excluded." },
        { phase: "Baseline and alternative", exitCriterion: "Both scenarios use frozen inputs and expose material sensitivities." },
        { phase: "Qualified review", exitCriterion: "Each review domain has a recorded reviewer decision or a disclosed open item." },
        { phase: "Acceptance", exitCriterion: "Corrections, buyer decisions, acceptance and calibration plan are recorded." },
      ],
      acceptanceCriteria: ["Decision statement and scope are approved by the decision owner.", "Material outputs trace to versioned rules, evidence and assumptions.", "Blocking evidence-required items do not appear in controlled release.", "Review, correction, acceptance and estimate-to-actual records are included."],
    },
    memo: {
      recommendedOptionId: blueprint.dataQuality.blockingOpenCount > 0 ? "verification-first" : "hybrid-phased",
      recommendation: blueprint.dataQuality.blockingOpenCount > 0 ? "Resolve blocking evidence before committing the controlled Blueprint basis." : "Develop the baseline and phased hybrid alternative for qualified review.",
      openDecisions: blueprint.unresolvedInputs.filter((item) => item.severity !== "advisory").map((item) => item.question),
      limitations: ["The memo records the current decision basis; it is not a validated design, supplier quotation or client approval."],
    },
  };
  return qualityLabDiagnosticPackageSchema.parse(output);
}
