import {
  assessPaidPilotEvidence,
  calculateGrossMarginPercent,
  summarizeCalibration,
  type QualityLabEngagementPacket,
} from "./quality-lab-engagement.js";

export const QUALITY_LAB_GATE_1_TARGET = 3;
export const QUALITY_LAB_PILOT_REGISTRY_VERSION = "quality-lab-paid-pilot-registry/v1" as const;

export type DeliveryReadinessBasis = {
  status: "working-draft" | "ready-for-qualified-review" | "recorded-external-release";
  blockers: string[];
};

export type PilotPortfolioInput = {
  packet: QualityLabEngagementPacket;
  deliveryReadiness: DeliveryReadinessBasis;
};

export function assessPaidPilotPortfolio(inputs: PilotPortfolioInput[]) {
  const assessedRecords = inputs.map(({ packet, deliveryReadiness }) => {
    const pilot = assessPaidPilotEvidence(packet, deliveryReadiness);
    const calibration = summarizeCalibration(packet);
    const blockers = [...pilot.blockers];
    if (pilot.eligibility === "eligible-gate-1-pilot-record" && !calibration.reviewReady) {
      blockers.push("Capture at least one observed estimate-to-actual metric with complete provenance and variance classification.");
    }
    const gate1EvidenceComplete = pilot.eligibility === "eligible-gate-1-pilot-record" && calibration.reviewReady;
    const grossMarginPercent = pilot.grossMarginPercent ?? calculateGrossMarginPercent(packet.pilotControl.contractValueUsd, packet.pilotControl.directDeliveryCostUsd);
    return { packet, pilot, calibration, grossMarginPercent, gate1EvidenceComplete, blockers };
  });

  // A copied revision or reused commercial reference cannot establish another
  // independent engagement. Hold every conflicting candidate for reconciliation.
  const candidateRecords = assessedRecords.filter((record) => record.gate1EvidenceComplete);
  const projectCounts = new Map<string, number>();
  const commercialReferenceCounts = new Map<string, number>();
  for (const { packet } of candidateRecords) {
    const projectId = packet.project.id.trim();
    const reference = packet.pilotControl.commercialEvidenceReference.trim();
    projectCounts.set(projectId, (projectCounts.get(projectId) ?? 0) + 1);
    commercialReferenceCounts.set(reference, (commercialReferenceCounts.get(reference) ?? 0) + 1);
  }
  const records = assessedRecords.map((record) => {
    if (!record.gate1EvidenceComplete) return record;
    const blockers = [...record.blockers];
    if ((projectCounts.get(record.packet.project.id.trim()) ?? 0) > 1) {
      blockers.push("This project appears in more than one evidence-complete candidate. Reconcile duplicate project records before counting a distinct Gate 1 engagement.");
    }
    if ((commercialReferenceCounts.get(record.packet.pilotControl.commercialEvidenceReference.trim()) ?? 0) > 1) {
      blockers.push("This commercial evidence reference is reused by multiple evidence-complete candidates. Provide distinct engagement evidence before counting these records toward Gate 1.");
    }
    return { ...record, blockers, gate1EvidenceComplete: blockers.length === 0 };
  });

  const complete = records.filter((record) => record.gate1EvidenceComplete);
  const measuredDays = records.flatMap((record) => record.pilot.deliveryCalendarDays === null ? [] : [record.pilot.deliveryCalendarDays]);
  const measuredHours = records.flatMap((record) => record.pilot.deliveryEffortHours === null ? [] : [record.pilot.deliveryEffortHours]);
  const measuredMargins = records.flatMap((record) => record.grossMarginPercent === null ? [] : [record.grossMarginPercent]);
  const average = (values: number[]) => values.length ? Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10 : null;
  const eligibleCount = complete.length;
  const startedCount = records.filter((record) => record.packet.pilotControl.engagementClass !== "unclassified" || record.packet.pilotControl.commercialStatus !== "not-recorded").length;

  return {
    status: eligibleCount >= QUALITY_LAB_GATE_1_TARGET ? "evidence-complete" as const : startedCount ? "in-progress" as const : "not-started" as const,
    targetCount: QUALITY_LAB_GATE_1_TARGET,
    eligibleCount,
    remainingCount: Math.max(0, QUALITY_LAB_GATE_1_TARGET - eligibleCount),
    paidRecordedCount: records.filter((record) => record.packet.pilotControl.commercialStatus === "paid").length,
    acceptedCount: records.filter((record) => ["accepted", "accepted-with-actions"].includes(record.packet.pilotControl.acceptanceStatus)).length,
    deliveryMeasuredCount: measuredDays.length,
    averageDeliveryCalendarDays: average(measuredDays),
    averageDeliveryEffortHours: average(measuredHours),
    averageGrossMarginPercent: average(measuredMargins),
    economicsMeasuredCount: measuredMargins.length,
    totalCorrections: records.reduce((sum, record) => sum + record.packet.corrections.length, 0),
    totalDecisions: records.reduce((sum, record) => sum + record.packet.decisions.length, 0),
    observedCalibrationMetrics: records.reduce((sum, record) => sum + record.calibration.observedCount, 0),
    records,
    controlNotice: "Portfolio evidence is complete only when three real engagements have controlled paid-pilot evidence and estimate-to-actual calibration. It is not proof of product-market fit or approval of an Atlas benchmark.",
  };
}

export function createPaidPilotRegistry(inputs: PilotPortfolioInput[], generatedAt = new Date().toISOString()) {
  const portfolio = assessPaidPilotPortfolio(inputs);
  return {
    registryVersion: QUALITY_LAB_PILOT_REGISTRY_VERSION,
    generatedAt,
    status: portfolio.status,
    targetCount: portfolio.targetCount,
    eligibleCount: portfolio.eligibleCount,
    metrics: {
      paidRecordedCount: portfolio.paidRecordedCount,
      acceptedCount: portfolio.acceptedCount,
      deliveryMeasuredCount: portfolio.deliveryMeasuredCount,
      averageDeliveryCalendarDays: portfolio.averageDeliveryCalendarDays,
      averageDeliveryEffortHours: portfolio.averageDeliveryEffortHours,
      averageGrossMarginPercent: portfolio.averageGrossMarginPercent,
      economicsMeasuredCount: portfolio.economicsMeasuredCount,
      totalCorrections: portfolio.totalCorrections,
      totalDecisions: portfolio.totalDecisions,
      observedCalibrationMetrics: portfolio.observedCalibrationMetrics,
    },
    engagements: portfolio.records.map((record) => ({
      project: record.packet.project,
      sourceVersions: record.packet.sourceVersions,
      gate1EvidenceComplete: record.gate1EvidenceComplete,
      blockers: record.blockers,
      engagementClass: record.packet.pilotControl.engagementClass,
      commercialStatus: record.packet.pilotControl.commercialStatus,
      commercialEvidenceReference: record.packet.pilotControl.commercialEvidenceReference,
      deliveryCalendarDays: record.pilot.deliveryCalendarDays,
      deliveryEffortHours: record.pilot.deliveryEffortHours,
      contractValueUsd: record.packet.pilotControl.contractValueUsd,
      directDeliveryCostUsd: record.packet.pilotControl.directDeliveryCostUsd,
      grossMarginPercent: record.grossMarginPercent,
      economicsEvidenceReference: record.packet.pilotControl.economicsEvidenceReference,
      acceptanceStatus: record.packet.pilotControl.acceptanceStatus,
      acceptanceReference: record.packet.pilotControl.acceptanceReference,
      corrections: record.packet.corrections.length,
      decisions: record.packet.decisions.length,
      observedCalibrationMetrics: record.calibration.observedCount,
    })),
    controlNotice: portfolio.controlNotice,
  };
}
