import { describe, expect, it } from "vitest";
import { createQualityLabProject, defaultQualityLabInput } from "./quality-lab";
import { createQualityLabEngagementPacket } from "./quality-lab-engagement";
import { assessPaidPilotPortfolio, createPaidPilotRegistry } from "./quality-lab-pilot-portfolio";

function completeRecord(id: string) {
  const packet = createQualityLabEngagementPacket(createQualityLabProject(defaultQualityLabInput, id));
  Object.assign(packet.pilotControl, {
    engagementClass: "blueprint", commercialStatus: "paid", commercialEvidenceReference: `INV-${id}`,
    serviceStartedAt: "2026-07-01T09:00:00.000Z", scopeConfirmedAt: "2026-07-02T09:00:00.000Z",
    firstControlledDeliveryAt: "2026-07-08T09:00:00.000Z", deliveryEffortHours: 24,
    acceptanceStatus: "accepted", clientAcceptanceAt: "2026-07-10T09:00:00.000Z", acceptanceReference: `MOM-${id}`,
  });
  packet.decisions.push({ id: `dec-${id}`, recordedAt: "2026-07-10T09:00:00.000Z", decision: "Proceed", optionsConsidered: ["Proceed", "Hold"], rationale: "Reviewed basis", owner: "Sponsor", downstreamImpact: "Project plan" });
  packet.baseline.monthlyTests.actual = packet.baseline.monthlyTests.estimate;
  packet.baseline.monthlyTests.variancePercent = 0;
  Object.assign(packet.calibration, { observedPeriodStart: "2026-07-01", observedPeriodEnd: "2026-07-31", dataOwner: "QC Operations", evidenceRefs: [`OPS-${id}`] });
  Object.assign(packet.calibration.metricNotes.find((item) => item.metric === "monthlyTests")!, { actualBasis: "Controlled operations report", varianceDriver: "site-performance" });
  return { packet, deliveryReadiness: { status: "recorded-external-release" as const, blockers: [] } };
}

describe("Quality Lab paid-pilot portfolio", () => {
  it("does not claim Gate 1 progress without real records", () => {
    expect(assessPaidPilotPortfolio([])).toMatchObject({ status: "not-started", eligibleCount: 0, remainingCount: 3 });
    const concept = createQualityLabEngagementPacket(createQualityLabProject(defaultQualityLabInput, "concept"));
    expect(assessPaidPilotPortfolio([{ packet: concept, deliveryReadiness: { status: "working-draft", blockers: [] } }]).status).toBe("not-started");
  });

  it("requires three paid, accepted, calibrated engagement records", () => {
    const portfolio = assessPaidPilotPortfolio([completeRecord("pilot_1"), completeRecord("pilot_2"), completeRecord("pilot_3")]);
    expect(portfolio).toMatchObject({ status: "evidence-complete", eligibleCount: 3, remainingCount: 0, averageDeliveryCalendarDays: 7, averageDeliveryEffortHours: 24, totalDecisions: 3, observedCalibrationMetrics: 3 });
    expect(createPaidPilotRegistry([completeRecord("pilot_1")], "2026-07-14T00:00:00.000Z")).toMatchObject({ registryVersion: "quality-lab-paid-pilot-registry/v1", eligibleCount: 1 });
  });

  it("keeps a paid delivery out of Gate 1 until calibration evidence exists", () => {
    const record = completeRecord("pilot_uncalibrated");
    record.packet.baseline.monthlyTests.actual = null;
    record.packet.baseline.monthlyTests.variancePercent = null;
    const portfolio = assessPaidPilotPortfolio([record]);
    expect(portfolio.eligibleCount).toBe(0);
    expect(portfolio.records[0].blockers).toContain("Capture at least one observed estimate-to-actual metric with complete provenance and variance classification.");
  });
});
