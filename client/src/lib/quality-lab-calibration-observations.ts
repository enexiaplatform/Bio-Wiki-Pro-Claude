import type { QualityLabProject } from "@shared/quality-lab";
import type { QualityLabEngagementPacket } from "@shared/quality-lab-engagement";
import {
  appendCalibrationReviewEvent,
  calibrationReviewStatus,
  createCalibrationObservationRegistry,
  createCalibrationReviewCase,
  createQualityLabCalibrationObservation,
  qualityLabCalibrationReviewCaseSchema,
  verifyQualityLabCalibrationObservation,
  type CalibrationReviewDecision,
  type QualityLabCalibrationReviewCase,
} from "@shared/quality-lab-calibration-observation";

const STORAGE_KEY = "lsa:quality-lab-calibration-observations:v1";

function read(): QualityLabCalibrationReviewCase[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(raw)) return [];
    return raw.flatMap((value) => {
      const parsed = qualityLabCalibrationReviewCaseSchema.safeParse(value);
      if (!parsed.success) return [];
      try {
        verifyQualityLabCalibrationObservation(parsed.data.observation);
        return [parsed.data];
      } catch {
        return [];
      }
    });
  } catch {
    return [];
  }
}

function write(cases: QualityLabCalibrationReviewCase[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
}

export function listCalibrationReviewCases(projectId?: string): QualityLabCalibrationReviewCase[] {
  return read()
    .filter((item) => !projectId || item.observation.source.projectId === projectId)
    .sort((a, b) => b.observation.recordedAt.localeCompare(a.observation.recordedAt));
}

export function freezeCalibrationObservation(project: QualityLabProject, packet: QualityLabEngagementPacket): QualityLabCalibrationReviewCase {
  const observation = createQualityLabCalibrationObservation(project, packet);
  const existing = read().find((item) => item.observation.observationId === observation.observationId);
  if (existing) return existing;
  const reviewCase = createCalibrationReviewCase(observation);
  write([reviewCase, ...read()]);
  return reviewCase;
}

export function recordCalibrationReviewDecision(
  observationId: string,
  input: {
    decision: CalibrationReviewDecision;
    reviewedByRole: string;
    externalReviewReference: string;
    rationale: string;
  },
): QualityLabCalibrationReviewCase {
  const cases = read();
  const current = cases.find((item) => item.observation.observationId === observationId);
  if (!current) throw new Error("Frozen calibration observation was not found.");
  const next = appendCalibrationReviewEvent(current, { ...input, recordedAt: new Date().toISOString() });
  write(cases.map((item) => item.observation.observationId === observationId ? next : item));
  return next;
}

export function downloadCalibrationObservationRegistry(cases = listCalibrationReviewCases()) {
  const registry = createCalibrationObservationRegistry(cases);
  const blob = new Blob([JSON.stringify(registry, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "atlas-frozen-calibration-observation-registry.json";
  anchor.click();
  URL.revokeObjectURL(url);
}

export function calibrationObservationCounts(cases = listCalibrationReviewCases()) {
  return cases.reduce((counts, item) => {
    counts[calibrationReviewStatus(item)] += 1;
    return counts;
  }, { captured: 0, eligible: 0, "accepted-evidence": 0, rejected: 0, withdrawn: 0 });
}
