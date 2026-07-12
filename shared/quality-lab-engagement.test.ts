import { describe, expect, it } from "vitest";
import { createQualityLabProject, defaultQualityLabInput } from "./quality-lab";
import { assessCalibrationCandidate, calculateVariancePercent, createCalibrationLearningCandidate, createQualityLabEngagementPacket, qualityLabEngagementPacketSchema, summarizeCalibration, varianceMagnitude } from "./quality-lab-engagement";

describe("Quality Lab engagement packet", () => {
  it("creates a validated review checklist and empty learning logs", () => {
    const project = createQualityLabProject(defaultQualityLabInput, "qlp_test");
    const packet = createQualityLabEngagementPacket(project, "2026-07-11T00:00:00.000Z");
    expect(qualityLabEngagementPacketSchema.safeParse(packet).success).toBe(true);
    expect(packet.checklist).toHaveLength(project.blueprint.unresolvedInputs.length);
    expect(packet.checklist.every((item) => item.status === "open")).toBe(true);
    expect(packet.methodEvidenceMatrix.length).toBeGreaterThan(0);
    expect(packet.methodEvidenceMatrix.some((item) => item.status === "needs-site-evidence")).toBe(true);
    expect(packet.ursBasis.length).toBe(project.blueprint.equipment.length);
    expect(packet.ursBasis.some((item) => item.relatedMethodRequirementIds.length > 0)).toBe(true);
    expect(packet.ursBasis.some((item) => item.evidenceIds.includes("usp-61-context"))).toBe(true);
    expect(packet.corrections).toEqual([]);
    expect(packet.decisions).toEqual([]);
    expect(packet.calibration).toMatchObject({ status: "draft", learningDisposition: "hold" });
    expect(packet.calibration.metricNotes).toHaveLength(5);
    expect(packet.controls).toMatchObject({ expertApprovalInsideAtlas: false, containsContactData: false });
  });

  it("calculates estimate-to-actual variance without inventing a zero baseline", () => {
    expect(calculateVariancePercent(100, 115)).toBe(15);
    expect(calculateVariancePercent(100, 85)).toBe(-15);
    expect(calculateVariancePercent(0, 0)).toBe(0);
    expect(calculateVariancePercent(0, 5)).toBeNull();
  });

  it("keeps legacy v1 packets readable by adding an empty calibration record", () => {
    const packet = createQualityLabEngagementPacket(createQualityLabProject(defaultQualityLabInput, "qlp_legacy"));
    const legacy = { ...packet } as Record<string, unknown>;
    delete legacy.calibration;
    const parsed = qualityLabEngagementPacketSchema.parse(legacy);
    expect(parsed.calibration.status).toBe("draft");
    expect(parsed.calibration.metricNotes.map((item) => item.metric)).toEqual(["monthlyTests", "teamFte", "areaSqm", "capexLowUsd", "capexHighUsd"]);
  });

  it("requires observation provenance and variance classification before calibration review", () => {
    const packet = createQualityLabEngagementPacket(createQualityLabProject(defaultQualityLabInput, "qlp_calibration"));
    packet.baseline.monthlyTests.actual = packet.baseline.monthlyTests.estimate * 1.3;
    packet.baseline.monthlyTests.variancePercent = 30;
    expect(summarizeCalibration(packet)).toMatchObject({ observedCount: 1, coveragePercent: 20, materialVarianceCount: 1, reviewReady: false });

    packet.calibration.observedPeriodStart = "2026-01-01";
    packet.calibration.observedPeriodEnd = "2026-03-31";
    packet.calibration.dataOwner = "QC Operations";
    packet.calibration.evidenceRefs = ["TS-2026-04"];
    const note = packet.calibration.metricNotes.find((item) => item.metric === "monthlyTests")!;
    note.actualBasis = "Approved monthly sample and test report";
    note.varianceDriver = "scope-change";
    expect(summarizeCalibration(packet).reviewReady).toBe(true);
    expect(varianceMagnitude(30)).toBe("over-25");
    expect(varianceMagnitude(-10)).toBe("within-10");
  });

  it("blocks learning candidates until review governance and rule links are complete", () => {
    const packet = createQualityLabEngagementPacket(createQualityLabProject(defaultQualityLabInput, "qlp_candidate"));
    packet.baseline.monthlyTests.actual = packet.baseline.monthlyTests.estimate;
    packet.baseline.monthlyTests.variancePercent = 0;
    Object.assign(packet.calibration, {
      observedPeriodStart: "2026-01-01", observedPeriodEnd: "2026-03-31", dataOwner: "QC Operations",
      evidenceRefs: ["QC-Q1"], learningDisposition: "candidate-rule-update", status: "review-ready",
    });
    Object.assign(packet.calibration.metricNotes.find((item) => item.metric === "monthlyTests")!, { actualBasis: "Controlled QC report", varianceDriver: "site-performance" });
    expect(assessCalibrationCandidate(packet).eligibility).toBe("blocked");

    Object.assign(packet.calibration, {
      status: "reviewed", reviewedByRole: "Microbiology SME", reviewedAt: "2026-04-15T00:00:00.000Z",
      dispositionRationale: "Observed workflow performance should be reviewed against the concept factor.", applicableRuleIds: ["micro.workflow.finished-products"],
    });
    expect(assessCalibrationCandidate(packet)).toMatchObject({ eligibility: "eligible-for-learning-review", blockers: [] });
    expect(createCalibrationLearningCandidate(packet)).toMatchObject({ candidateVersion: "quality-lab-calibration-candidate/v1", metrics: [{ metric: "monthlyTests" }] });
  });
});
