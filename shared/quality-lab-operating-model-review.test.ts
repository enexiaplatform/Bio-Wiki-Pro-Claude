import { describe, expect, it } from "vitest";
import { createQualityLabProject, defaultQualityLabInput } from "./quality-lab";
import { createQualityLabEngagementPacket } from "./quality-lab-engagement";
import { createQualityLabOperatingModelInput } from "./quality-lab-operating-model";
import {
  assessQualityLabOperatingModelReview,
  createQualityLabOperatingModelReviewDraft,
  createQualityLabOperatingModelReviewRegistry,
  createQualityLabOperatingModelReviewSnapshot,
  verifyQualityLabOperatingModelReviewSnapshot,
} from "./quality-lab-operating-model-review";

const NOW = "2026-07-26T04:00:00.000Z";

function reviewedProject(id: string) {
  const project = createQualityLabProject(defaultQualityLabInput, id);
  project.reviewRequestedAt = "2026-07-26T01:00:00.000Z";
  return project;
}

function completeBasis(project: ReturnType<typeof reviewedProject>) {
  const input = createQualityLabOperatingModelInput(project, undefined, "2026-07-26T02:00:00.000Z");
  input.applications = input.applications.map((application) => ({
    ...application,
    externalPricePerTestUsd: 100,
    externalTurnaroundDays: 2,
    sampleHoldTimeDays: 5,
    methodTransferCostUsd: 0,
    internalCapability: "confirmed" as const,
    methodReadiness: "ready" as const,
    externalLabQualified: "no" as const,
    backupExternalCoverage: "no" as const,
    dataAccess: "full" as const,
    investigationResponsiveness: "internal-faster" as const,
    surgeCapacity: "internal" as const,
  }));
  const engagement = createQualityLabEngagementPacket(project, "2026-07-26T03:00:00.000Z");
  engagement.pilotControl.engagementClass = "blueprint";
  engagement.pilotControl.commercialStatus = "paid";
  engagement.pilotControl.commercialEvidenceReference = "INV-STATUS-2026-014";
  const draft = createQualityLabOperatingModelReviewDraft(project, input, undefined, NOW);
  draft.facilitatorRole = "Blueprint engagement lead";
  draft.stakeholders = draft.stakeholders.map((stakeholder) => ({
    ...stakeholder,
    reviewerRole: `${stakeholder.stakeholder} accountable reviewer`,
    status: "reviewed-no-objection" as const,
    externalReviewReference: `REVIEW-${stakeholder.stakeholder}`,
  }));
  draft.applications = draft.applications.map((application) => ({
    ...application,
    outcome: "agree" as const,
    reviewedMode: "insource" as const,
    rationale: "The controlled project review supports the bounded model conclusion for this application.",
    evidenceRefs: [`APP-REVIEW-${application.applicationId}`],
  }));
  return { input, engagement, draft };
}

describe("Quality Lab operating-model stakeholder review", () => {
  it("fails closed when paid, model and stakeholder evidence are missing", () => {
    const project = createQualityLabProject(defaultQualityLabInput, "qlp_operating_review_open");
    const input = createQualityLabOperatingModelInput(project, undefined, NOW);
    const engagement = createQualityLabEngagementPacket(project, NOW);
    const assessment = assessQualityLabOperatingModelReview(project, input, engagement, undefined);

    expect(assessment.eligibleToFreeze).toBe(false);
    expect(assessment.blockers).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "commercial:review-not-requested" }),
      expect.objectContaining({ id: "commercial:paid-status" }),
      expect.objectContaining({ category: "model-evidence" }),
      expect.objectContaining({ category: "stakeholder-review" }),
    ]));
  });

  it("freezes an immutable paid-diagnostic comparison with exact lineage", () => {
    const project = reviewedProject("qlp_operating_review_complete");
    const { input, engagement, draft } = completeBasis(project);
    const assessment = assessQualityLabOperatingModelReview(project, input, engagement, draft);
    expect(assessment).toMatchObject({ eligibleToFreeze: true, summary: { applicationReviewsComplete: draft.applications.length, stakeholderReviewsComplete: 4 } });

    const snapshot = createQualityLabOperatingModelReviewSnapshot(project, input, engagement, draft, NOW);
    expect(snapshot.reviewVersion).toBe("quality-lab-operating-model-review/v1");
    expect(snapshot.comparison).toEqual({ aligned: draft.applications.length, changedWithRationale: 0, deferred: 0 });
    expect(snapshot.review.applications[0].lineageId).toMatch(/^decision:operating-model:/);
    expect(snapshot.controls).toMatchObject({ immutableSnapshot: true, approvesOperatingModel: false, selectsSupplier: false, changesExecutableRules: false, createsValidationEvidence: false });
    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(createQualityLabOperatingModelReviewRegistry([snapshot], NOW).snapshots).toHaveLength(1);
  });

  it("requires a changed mode when stakeholders disagree", () => {
    const project = reviewedProject("qlp_operating_review_disagree");
    const { input, engagement, draft } = completeBasis(project);
    draft.applications[0] = { ...draft.applications[0], outcome: "disagree", reviewedMode: "insource" };
    const assessment = assessQualityLabOperatingModelReview(project, input, engagement, draft);
    expect(assessment.blockers).toEqual(expect.arrayContaining([expect.objectContaining({ id: expect.stringMatching(/:disagreement$/) })]));

    draft.applications[0] = { ...draft.applications[0], reviewedMode: "hybrid" };
    const snapshot = createQualityLabOperatingModelReviewSnapshot(project, input, engagement, draft, NOW);
    expect(snapshot.comparison.changedWithRationale).toBe(1);
  });

  it("detects review snapshot tampering", () => {
    const project = reviewedProject("qlp_operating_review_tamper");
    const { input, engagement, draft } = completeBasis(project);
    const snapshot = structuredClone(createQualityLabOperatingModelReviewSnapshot(project, input, engagement, draft, NOW));
    snapshot.review.applications[0].rationale = "Tampered after freeze";
    expect(() => verifyQualityLabOperatingModelReviewSnapshot(snapshot)).toThrow(/fingerprint integrity/i);
  });
});
