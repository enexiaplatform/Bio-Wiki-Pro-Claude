import { describe, expect, it } from "vitest";
import { compileQualityLabBlueprint, defaultQualityLabInput } from "./quality-lab";
import { assessQualityLabReviewBrief, formatQualityLabReviewBrief, QUALITY_LAB_REVIEW_BRIEF_VERSION, qualityLabReviewRequestSchema } from "./quality-lab-review";

describe("Quality Lab review brief", () => {
  it("creates a versioned, deterministic triage brief from a Blueprint", () => {
    const blueprint = compileQualityLabBlueprint(defaultQualityLabInput);
    const request = qualityLabReviewRequestSchema.parse({
      briefVersion: QUALITY_LAB_REVIEW_BRIEF_VERSION,
      contact: { name: "Quality Lead", email: "quality@example.com", company: "Example Pharma", role: "QC Manager" },
      qualification: {
        engagementIntent: "blueprint-pilot",
        projectStage: "budget-planning",
        decisionWindow: "1-3-months",
        budgetStatus: "range-defined",
        decisionRole: "technical-lead",
        dataReadiness: "substantial",
        portfolioScale: "4-10-products",
      },
      projectContext: "We need a review before the capital planning workshop next month.",
      project: {
        localProjectId: "qlp_test",
        projectName: defaultQualityLabInput.projectName,
        scenarioLabel: defaultQualityLabInput.scenarioLabel,
        projectIntent: defaultQualityLabInput.projectIntent,
        primaryDecision: defaultQualityLabInput.primaryDecision,
        decisionOwnerRole: defaultQualityLabInput.decisionOwnerRole,
        decisionWindow: defaultQualityLabInput.decisionWindow,
        country: defaultQualityLabInput.country,
        facilityType: defaultQualityLabInput.facilityType,
        inputContractVersion: defaultQualityLabInput.contractVersion,
        outputContractVersion: blueprint.contractVersion,
        compilerCoreVersion: blueprint.compilerCoreVersion,
        domainPackId: blueprint.domainPack.id,
        domainPackVersion: blueprint.domainPack.version,
        monthlyTests: blueprint.current.monthlyTests,
        inputCompletenessPercent: blueprint.dataQuality.completenessPercent,
        blockingOpenCount: blueprint.dataQuality.blockingOpenCount,
        importantOpenCount: blueprint.dataQuality.importantOpenCount,
        unresolvedInputs: blueprint.unresolvedInputs.map(({ id, severity, question, resolution }) => ({ id, severity, question, resolution })),
      },
      confidentialityConfirmed: true,
    });
    const brief = formatQualityLabReviewBrief(request);
    expect(brief).toContain("[quality-lab-review-brief/v3]");
    expect(brief).toContain("Expert-reviewed Blueprint Pilot (from $990)");
    expect(brief).toContain("decision window=1–3 months");
    expect(brief).toContain("controlled-use evidence readiness");
    expect(brief).toContain("controlled-use blockers");
    expect(brief).toContain("Open-input checklist:");
    expect(brief).toContain("Decision mandate:");
    expect(brief).toContain(defaultQualityLabInput.primaryDecision);
    expect(brief).toContain("quality-lab-blueprint/v1");
    expect(brief).not.toContain(request.contact.email);
  });

  it("rejects a submission without confidentiality confirmation", () => {
    const parsed = qualityLabReviewRequestSchema.safeParse({
      briefVersion: QUALITY_LAB_REVIEW_BRIEF_VERSION,
      contact: { name: "Quality Lead", email: "quality@example.com", company: null, role: null },
      qualification: {
        engagementIntent: "scope-diagnostic",
        projectStage: "concept",
        decisionWindow: "not-set",
        budgetStatus: "exploring",
        decisionRole: "influencer",
        dataReadiness: "initial",
        portfolioScale: "not-set",
      },
      projectContext: "A sufficiently detailed non-confidential project context.",
      project: null,
      confidentialityConfirmed: false,
    });
    expect(parsed.success).toBe(false);
  });

  it("continues to accept a legacy v2 scope-only brief", () => {
    const parsed = qualityLabReviewRequestSchema.safeParse({
      briefVersion: "quality-lab-review-brief/v2",
      contact: { name: "Quality Lead", email: "quality@example.com", company: null, role: null },
      qualification: { engagementIntent: "scope-diagnostic", projectStage: "concept", decisionWindow: "not-set", budgetStatus: "exploring", decisionRole: "technical-lead", dataReadiness: "initial", portfolioScale: "not-set" },
      projectContext: "We need a scoped review before the capital planning workshop.",
      project: null,
      confidentialityConfirmed: true,
    });
    expect(parsed.success).toBe(true);
  });

  it("separates scope-brief detail from engagement eligibility", () => {
    const early = assessQualityLabReviewBrief({
      qualification: { engagementIntent: "scope-diagnostic", projectStage: "concept", decisionWindow: "not-set", budgetStatus: "exploring", decisionRole: "technical-lead", dataReadiness: "initial", portfolioScale: "not-set" },
      projectContext: "We need help defining the project.",
      hasProject: false,
    });
    expect(early.completeCount).toBe(2);
    expect(early.criteria.find((item) => item.id === "model-handoff")?.complete).toBe(true);
    expect(early.boundary).toContain("does not prove engagement fit");

    const detailedPilot = assessQualityLabReviewBrief({
      qualification: { engagementIntent: "blueprint-pilot", projectStage: "budget-planning", decisionWindow: "1-3-months", budgetStatus: "range-defined", decisionRole: "decision-owner", dataReadiness: "substantial", portfolioScale: "4-10-products" },
      projectContext: "The capital committee needs a baseline and alternative microbiology capacity decision for one site and six non-sterile products before the next budget review. Product, market, workload, equipment, and site constraints are available for qualified review.",
      hasProject: true,
    });
    expect(detailedPilot.completeCount).toBe(6);
    expect(detailedPilot.percent).toBe(100);
  });
});
