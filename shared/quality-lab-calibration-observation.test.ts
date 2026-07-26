import { describe, expect, it } from "vitest";
import { createQualityLabProject, defaultQualityLabInput } from "./quality-lab";
import { createQualityLabEngagementPacket } from "./quality-lab-engagement";
import {
  appendCalibrationReviewEvent,
  calibrationReviewStatus,
  createCalibrationObservationRegistry,
  createCalibrationReviewCase,
  createQualityLabCalibrationObservation,
  verifyQualityLabCalibrationObservation,
} from "./quality-lab-calibration-observation";

function completePacket(disposition: "project-only" | "candidate-rule-update" = "candidate-rule-update") {
  const project = createQualityLabProject({ ...defaultQualityLabInput, projectName: "Frozen calibration proof" }, "qlp_frozen_calibration");
  const packet = createQualityLabEngagementPacket(project, "2026-07-01T00:00:00.000Z");
  packet.baseline.monthlyTests.actual = packet.baseline.monthlyTests.estimate * 1.2;
  packet.baseline.monthlyTests.variancePercent = 999;
  Object.assign(packet.calibration, {
    status: "reviewed",
    observedPeriodStart: "2026-04-01",
    observedPeriodEnd: "2026-06-30",
    dataOwner: "QC Operations",
    evidenceRefs: ["QC-Q2-OBSERVED-TEST-REGISTER"],
    learningDisposition: disposition,
    applicableRuleIds: ["micro.workflow.finished-products"],
    dispositionRationale: "Observed site demand should enter controlled cross-project review.",
    reviewedByRole: "Microbiology SME",
    reviewedAt: "2026-07-10T00:00:00.000Z",
  });
  Object.assign(packet.calibration.metricNotes.find((item) => item.metric === "monthlyTests")!, {
    actualBasis: "Approved monthly test register for the observed quarter",
    varianceDriver: "scope-change",
    reviewerNote: "Additional product families entered routine release testing.",
  });
  return { project, packet };
}

describe("immutable Quality Lab calibration observations", () => {
  it("freezes source revisions, rule versions, evidence and recalculated variance", () => {
    const { project, packet } = completePacket();
    const observation = createQualityLabCalibrationObservation(project, packet, "2026-07-11T00:00:00.000Z");

    expect(observation.observationId).toBe(`calobs_${observation.observationFingerprint}`);
    expect(observation.source.projectRevisionReference).toBe(project.updatedAt);
    expect(observation.source.ruleRefs.length).toBe(project.blueprint.ruleTrace.length);
    expect(observation.evidenceRefs).toEqual(["QC-Q2-OBSERVED-TEST-REGISTER"]);
    expect(observation.metrics[0]).toMatchObject({ metric: "monthlyTests", variancePercent: 20 });
    expect(observation.eligibilityAtFreeze).toMatchObject({ status: "eligible-for-learning-review", blockers: [] });
    expect(Object.isFrozen(observation)).toBe(true);
    expect(verifyQualityLabCalibrationObservation(observation)).toBeDefined();
  });

  it("detects snapshot or variance tampering", () => {
    const { project, packet } = completePacket();
    const observation = createQualityLabCalibrationObservation(project, packet, "2026-07-11T00:00:00.000Z");
    const tampered = structuredClone(observation);
    tampered.metrics[0].actual += 1;

    expect(() => verifyQualityLabCalibrationObservation(tampered)).toThrow(/integrity check failed/i);
  });

  it("records review decisions as append-only events without changing the observation", () => {
    const { project, packet } = completePacket();
    const observation = createQualityLabCalibrationObservation(project, packet, "2026-07-11T00:00:00.000Z");
    const reviewCase = createCalibrationReviewCase(observation);
    const accepted = appendCalibrationReviewEvent(reviewCase, {
      decision: "accepted-evidence",
      recordedAt: "2026-07-12T00:00:00.000Z",
      reviewedByRole: "Domain Pack review board",
      externalReviewReference: "CAL-BOARD-2026-07-12",
      rationale: "Evidence is sufficient as project calibration evidence for controlled cross-case review.",
    });

    expect(calibrationReviewStatus(reviewCase)).toBe("eligible");
    expect(calibrationReviewStatus(accepted)).toBe("accepted-evidence");
    expect(accepted.observation).toEqual(reviewCase.observation);
    expect(accepted.events).toHaveLength(1);
    expect(accepted.events[0].controls).toEqual({ changesExecutableRules: false, approvesUniversalBenchmark: false });
    expect(createCalibrationObservationRegistry([accepted], "2026-07-13T00:00:00.000Z").cases[0].currentStatus).toBe("accepted-evidence");
  });

  it("does not accept project-only observations as learning evidence", () => {
    const { project, packet } = completePacket("project-only");
    const reviewCase = createCalibrationReviewCase(createQualityLabCalibrationObservation(project, packet, "2026-07-11T00:00:00.000Z"));

    expect(calibrationReviewStatus(reviewCase)).toBe("captured");
    expect(() => appendCalibrationReviewEvent(reviewCase, {
      decision: "accepted-evidence",
      recordedAt: "2026-07-12T00:00:00.000Z",
      reviewedByRole: "Domain Pack review board",
      externalReviewReference: "CAL-BOARD-2026-07-12",
      rationale: "Attempted acceptance.",
    })).toThrow(/Only an eligible frozen candidate/i);
  });

  it("requires evidence-complete observation provenance before freezing", () => {
    const project = createQualityLabProject(defaultQualityLabInput, "qlp_incomplete_observation");
    const packet = createQualityLabEngagementPacket(project);
    expect(() => createQualityLabCalibrationObservation(project, packet)).toThrow(/must be complete before freezing/i);
  });
});
