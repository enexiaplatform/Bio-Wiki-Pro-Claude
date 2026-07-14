import { calculateVariancePercent, createCalibrationLearningCandidate, createQualityLabEngagementPacket, qualityLabEngagementPacketSchema, type QualityLabEngagementPacket } from "@shared/quality-lab-engagement";
import type { QualityLabProject } from "@shared/quality-lab";
import { createPaidPilotRegistry, type PilotPortfolioInput } from "@shared/quality-lab-pilot-portfolio";
import { createValidationCaseRegistry } from "@shared/quality-lab-validation-cases";

const STORAGE_KEY = "lsa:quality-lab-engagements:v1";

function read(): QualityLabEngagementPacket[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(raw)) return [];
    return raw.flatMap((value) => {
      const parsed = qualityLabEngagementPacketSchema.safeParse(value);
      return parsed.success ? [parsed.data] : [];
    });
  } catch { return []; }
}

function write(packets: QualityLabEngagementPacket[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(packets));
}

export function getOrCreateEngagement(project: QualityLabProject): QualityLabEngagementPacket {
  return read().find((packet) => packet.project.id === project.id) ?? createQualityLabEngagementPacket(project);
}

export function saveEngagement(packet: QualityLabEngagementPacket): QualityLabEngagementPacket {
  const parsed = qualityLabEngagementPacketSchema.parse(packet);
  write([parsed, ...read().filter((item) => item.project.id !== parsed.project.id)]);
  return parsed;
}

export function setEngagementActual(packet: QualityLabEngagementPacket, key: keyof QualityLabEngagementPacket["baseline"], actual: number | null) {
  const item = packet.baseline[key];
  return saveEngagement({ ...packet, baseline: { ...packet.baseline, [key]: { ...item, actual, variancePercent: actual === null ? null : calculateVariancePercent(item.estimate, actual) } } });
}

export function downloadEngagement(packet: QualityLabEngagementPacket) {
  const blob = new Blob([JSON.stringify(packet, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${packet.project.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "quality-lab"}-engagement-packet.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function listEngagements() {
  return read();
}

function csvCell(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export function calibrationCsv(packet: QualityLabEngagementPacket) {
  const headers = ["project_id", "project_name", "metric", "estimate", "actual", "variance_percent", "variance_driver", "actual_basis", "reviewer_note", "observed_period_start", "observed_period_end", "data_owner", "evidence_refs", "learning_disposition", "applicable_rule_ids", "disposition_rationale", "reviewed_by_role", "reviewed_at"];
  const rows = Object.entries(packet.baseline).map(([metric, value]) => {
    const note = packet.calibration.metricNotes.find((item) => item.metric === metric);
    return [packet.project.id, packet.project.name, metric, value.estimate, value.actual, value.variancePercent, note?.varianceDriver, note?.actualBasis, note?.reviewerNote, packet.calibration.observedPeriodStart, packet.calibration.observedPeriodEnd, packet.calibration.dataOwner, packet.calibration.evidenceRefs.join(" | "), packet.calibration.learningDisposition, packet.calibration.applicableRuleIds.join(" | "), packet.calibration.dispositionRationale, packet.calibration.reviewedByRole, packet.calibration.reviewedAt];
  });
  return [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
}

export function downloadCalibration(packet: QualityLabEngagementPacket) {
  const blob = new Blob([calibrationCsv(packet)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${packet.project.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "quality-lab"}-calibration.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function downloadLearningCandidateRegistry(packets: QualityLabEngagementPacket[]) {
  const registry = {
    registryVersion: "quality-lab-learning-candidate-registry/v1",
    generatedAt: new Date().toISOString(),
    candidates: packets.map(createCalibrationLearningCandidate),
    controlNotice: "Working review queue export. No candidate in this file is an approved benchmark or rule change.",
  };
  const blob = new Blob([JSON.stringify(registry, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "atlas-calibration-learning-candidates.json";
  anchor.click();
  URL.revokeObjectURL(url);
}

export function downloadPaidPilotRegistry(records: PilotPortfolioInput[]) {
  const blob = new Blob([JSON.stringify(createPaidPilotRegistry(records), null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "atlas-gate-1-paid-pilot-registry.json";
  anchor.click();
  URL.revokeObjectURL(url);
}

export function downloadValidationCaseRegistry(packets: QualityLabEngagementPacket[]) {
  const blob = new Blob([JSON.stringify(createValidationCaseRegistry(packets), null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "atlas-domain-pack-validation-case-registry.json";
  anchor.click();
  URL.revokeObjectURL(url);
}
