import { describe, expect, it } from "vitest";
import contentManifest from "../../client/src/data/content-manifest.json";
import { TOOL_CATALOG } from "../../client/src/data/tools/catalog";
import { toolkits } from "../../client/src/data/toolkits";
import { workflows } from "../../client/src/data/workflows";

import { workflowSystems } from "../../client/src/data/workflowSystems";
import {
  DECISION_PACKAGES,
  DECISION_PACKAGE_CONTRACT_VERSION,
  decisionPackageForAsset,
  validateDecisionPackages,
} from "../../shared/decision-packages";
import {
  CAREER_DOMAIN_TRACKS,
  CAREER_DOMAIN_TRACK_CONTRACT_VERSION,
  getCareerTracksForPackage,
  validateCareerDomainTracks,
} from "../../shared/career-domain-tracks";
import { CONTENT_QUALITY_REGISTRY } from "../../shared/content-quality-registry";
import { PAID_ASSET_QUALITY } from "../../shared/paid-asset-quality";
import {
  DECISION_PACKAGE_LEARNING_CONTRACT_VERSION,
  DECISION_PACKAGE_LEARNING_FLOWS,
  validateDecisionPackageLearningFlows,
} from "../../shared/decision-package-learning";

describe("Atlas decision-package contracts", () => {
  it("registers twelve unique, product-bound packages with complete artifact plans", () => {
    expect(DECISION_PACKAGES).toHaveLength(12);
    expect(new Set(DECISION_PACKAGES.map((item) => item.id)).size).toBe(12);
    expect(validateDecisionPackages()).toEqual([]);
    for (const item of DECISION_PACKAGES) {
      expect(item.contractVersion).toBe(DECISION_PACKAGE_CONTRACT_VERSION);
      expect(item.productDestinations).toEqual(expect.arrayContaining(["public", "pro", "quality-lab", "career"]));
      expect(item.artifactPlan.map((artifact) => artifact.kind)).toEqual(expect.arrayContaining([
        "public-guide", "pro-lesson", "workflow-or-tool", "working-asset", "fictional-example", "review-packet",
      ]));
      expect(item.artifactPlan.every((artifact) => artifact.status === "existing")).toBe(true);
      expect(item.reviewStatus).toBe("editorial-reviewed");
      expect(item.compilerMode).toBe("evidence-context-only");
      expect(Object.keys(item.sourceVersions)).toEqual(expect.arrayContaining(item.sourceIds));
      expect(item.sourceIds.every((sourceId) => item.sourceVersions[sourceId].length > 0)).toBe(true);
      expect(item.reviewPacketPath).toMatch(/^docs\/content-reviews\/.+\.md$/);
      expect(item.artifactPlan.find((artifact) => artifact.kind === "review-packet")?.status).toBe("existing");
      expect(item.limitations.length).toBeGreaterThan(0);
      expect(item.reviewerRoles.length).toBeGreaterThan(0);
      expect(item.discoveryQuestions.length).toBeGreaterThanOrEqual(3);
      expect(item.discoveryQuestions.every((question) => question.trim().length > 0)).toBe(true);
      expect(item.assetRefs.some((asset) => asset.kind === "workflow" || asset.kind === "tool"), `${item.id} requires a bounded workflow or tool`).toBe(true);
      const proLessonRef = item.artifactPlan.find((artifact) => artifact.kind === "pro-lesson")?.assetRef;
      expect(proLessonRef).toBeTruthy();
      expect(CONTENT_QUALITY_REGISTRY[`academy/${proLessonRef}`]?.reviewStatus).toBe(item.reviewStatus);
      const workingAssetRef = item.artifactPlan.find((artifact) => artifact.kind === "working-asset")?.assetRef;
      expect(workingAssetRef).toBeTruthy();
      expect(PAID_ASSET_QUALITY.find((asset) => asset.id === workingAssetRef)?.reviewStatus).toBe(item.reviewStatus);
    }
  });

  it("maps every package stage to a real lifecycle stage", () => {
    const stageKeys = new Set(workflowSystems.flatMap((system) => system.stages.map((stage) => `${system.id}:${stage.id}`)));
    expect(DECISION_PACKAGES.flatMap((item) => item.stageRefs.filter((stage) => !stageKeys.has(`${stage.systemId}:${stage.stageId}`)))).toEqual([]);
  });

  it("covers every priority stage in the three six-month lifecycle lanes", () => {
    for (const systemId of ["biopharma", "pharma-api", "pharma-drug-product"] as const) {
      const expected = new Set(workflowSystems.find((system) => system.id === systemId)?.stages.map((stage) => `${systemId}:${stage.id}`));
      const covered = new Set(DECISION_PACKAGES.filter((item) => item.lane === systemId).flatMap((item) => item.stageRefs.map((stage) => `${stage.systemId}:${stage.stageId}`)));
      expect(covered).toEqual(expected);
    }
  });

  it("detects duplicate IDs and preserves the three career domain boundaries", () => {
    expect(validateDecisionPackages([...DECISION_PACKAGES, DECISION_PACKAGES[0]])).toContain(
      "duplicate decision package id: biopharma-cell-materials-upstream",
    );
    expect(CAREER_DOMAIN_TRACKS).toHaveLength(3);
    expect(CAREER_DOMAIN_TRACKS.map((track) => track.id)).toEqual(["biopharma", "pharma-api", "drug-product"]);
    expect(CAREER_DOMAIN_TRACKS.every((track) => track.contractVersion === CAREER_DOMAIN_TRACK_CONTRACT_VERSION)).toBe(true);
    expect(CAREER_DOMAIN_TRACKS.every((track) => track.thirteenWeekActions.length === 13)).toBe(true);
    expect(getCareerTracksForPackage("cross-cutting-evidence-governance").map((track) => track.id)).toEqual(["biopharma", "pharma-api", "drug-product"]);
    expect(validateCareerDomainTracks()).toEqual([]);
  });

  it("rejects missing source/product bindings and keeps every asset reference resolvable", () => {
    const missingSource = { ...DECISION_PACKAGES[0], sourceIds: ["MISSING-SOURCE"], sourceVersions: {} };
    expect(validateDecisionPackages([missingSource])).toEqual(expect.arrayContaining([
      "biopharma-cell-materials-upstream: unknown sourceId MISSING-SOURCE",
      "biopharma-cell-materials-upstream: every sourceId requires a source version",
    ]));
    const missingProducts = { ...DECISION_PACKAGES[0], productDestinations: [] };
    expect(validateDecisionPackages([missingProducts])).toContain("biopharma-cell-materials-upstream: productDestinations must bind public, pro, quality-lab and career");
    const invalidStage = { ...DECISION_PACKAGES[0], stageRefs: [{ systemId: "biopharma", stageId: "does-not-exist" }] };
    expect(validateDecisionPackages([invalidStage])).toContain("biopharma-cell-materials-upstream: invalid stage mapping biopharma:does-not-exist");
    const missingWorkflow = { ...DECISION_PACKAGES[0], assetRefs: DECISION_PACKAGES[0].assetRefs.filter((asset) => asset.kind !== "workflow" && asset.kind !== "tool") };
    expect(validateDecisionPackages([missingWorkflow])).toContain("biopharma-cell-materials-upstream: bounded workflow or tool asset is required");
    const orphanArtifact = { ...DECISION_PACKAGES[0], artifactPlan: DECISION_PACKAGES[0].artifactPlan.map((artifact) => artifact.kind === "working-asset" ? { ...artifact, assetRef: "unregistered-working-asset" } : artifact) };
    expect(validateDecisionPackages([orphanArtifact])).toContain("biopharma-cell-materials-upstream: working-asset references unregistered asset unregistered-working-asset");

    const manifest = contentManifest as Array<{ collection: string; slug: string }>;
    const known = {
      guide: new Set(manifest.filter((entry) => entry.collection === "blog").map((entry) => entry.slug)),
      academy: new Set(manifest.filter((entry) => entry.collection === "academy").map((entry) => entry.slug)),
      workflow: new Set(workflows.map((entry) => entry.slug)),
      tool: new Set(TOOL_CATALOG.map((entry) => entry.slug)),
      toolkit: new Set(toolkits.map((entry) => entry.slug)),
      deliverable: new Set<string>(),
    };
    for (const item of DECISION_PACKAGES) {
      for (const asset of item.assetRefs) expect(known[asset.kind].has(asset.slug), `${item.id} orphan ${asset.kind}:${asset.slug}`).toBe(true);
    }
  });

  it("resolves existing public and Pro assets back to their package", () => {
    expect(decisionPackageForAsset("blog", "cell-banks-the-foundation-of-a-biologic").map((item) => item.id)).toEqual([
      "biopharma-cell-materials-upstream",
    ]);
    expect(decisionPackageForAsset("academy", "pharma-api-analytical-specification-lifecycle").map((item) => item.id)).toEqual([
      "pharma-api-analytical-lifecycle",
    ]);
  });

  it("generates package and lifecycle metadata without requiring MDX authors to repeat it", () => {
    const entry = (contentManifest as Array<Record<string, unknown>>).find((item) => item.slug === "drug-product-formulation-material-attributes");
    expect(entry).toMatchObject({
      collection: "academy",
      decisionPackageId: "drug-product-formulation-material-attributes",
      decisionPackageIds: ["drug-product-formulation-material-attributes"],
      systemIds: ["pharma-drug-product"],
      stageIds: ["formulation-material-attributes"],
      lifecycleStageIds: ["pharma-drug-product:formulation-material-attributes"],
      productDestinations: ["public", "pro", "quality-lab", "career"],
    });
  });

  it("provides a complete knowledge, workflow, evidence and reasoning flow for every package", () => {
    expect(validateDecisionPackageLearningFlows()).toEqual([]);
    expect(DECISION_PACKAGE_LEARNING_FLOWS).toHaveLength(DECISION_PACKAGES.length);
    expect(new Set(DECISION_PACKAGE_LEARNING_FLOWS.map((flow) => flow.packageId))).toEqual(new Set(DECISION_PACKAGES.map((item) => item.id)));
    for (const flow of DECISION_PACKAGE_LEARNING_FLOWS) {
      expect(flow.contractVersion).toBe(DECISION_PACKAGE_LEARNING_CONTRACT_VERSION);
      expect(flow.reviewStatus).toBe("specialist-review-required");
      expect(flow.reviewPacketPath).toBe("docs/content-reviews/DECISION_PACKAGE_LEARNING_FLOWS_1_0_REVIEW_PACKET.md");
      expect(flow.learningObjectives.length).toBeGreaterThanOrEqual(3);
      expect(flow.knowledgeUnits.length).toBeGreaterThanOrEqual(3);
      expect(flow.workflowPhases.length).toBeGreaterThanOrEqual(5);
      expect(flow.evidenceActivities.length).toBeGreaterThanOrEqual(3);
      expect(flow.knowledgeChecks.length).toBeGreaterThanOrEqual(3);
      expect(flow.completionCriteria.length).toBeGreaterThanOrEqual(4);
    }
  });

  it("rejects duplicate, missing and structurally incomplete learning flows", () => {
    const first = DECISION_PACKAGE_LEARNING_FLOWS[0];
    expect(validateDecisionPackageLearningFlows([...DECISION_PACKAGE_LEARNING_FLOWS, first])).toContain(`duplicate learning flow: ${first.packageId}`);
    expect(validateDecisionPackageLearningFlows(DECISION_PACKAGE_LEARNING_FLOWS.slice(1))).toContain(`missing learning flow: ${first.packageId}`);
    const incomplete = { ...first, workflowPhases: first.workflowPhases.slice(0, 4) };
    expect(validateDecisionPackageLearningFlows([incomplete, ...DECISION_PACKAGE_LEARNING_FLOWS.slice(1)])).toContain(`${first.packageId}: at least five workflow phases are required`);
  });
});
