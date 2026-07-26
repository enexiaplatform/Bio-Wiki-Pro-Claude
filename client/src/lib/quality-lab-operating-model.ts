import {
  createQualityLabOperatingModelInput,
  qualityLabOperatingModelInputSchema,
  type QualityLabOperatingModelInput,
} from "@shared/quality-lab-operating-model";
import type { QualityLabProject } from "@shared/quality-lab";

const STORAGE_KEY = "lsa:quality-lab-operating-model:v1";

function readStore(): Record<string, unknown> {
  if (typeof window === "undefined") return {};
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}");
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

export function loadQualityLabOperatingModelInput(project: QualityLabProject): QualityLabOperatingModelInput {
  return createQualityLabOperatingModelInput(project, readStore()[project.id]);
}

export function saveQualityLabOperatingModelInput(input: QualityLabOperatingModelInput): QualityLabOperatingModelInput {
  const parsed = qualityLabOperatingModelInputSchema.parse({ ...input, updatedAt: new Date().toISOString() });
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...readStore(), [parsed.projectId]: parsed }));
  }
  return parsed;
}
