import { DECISION_PACKAGES, type DecisionPackageId } from "./decision-packages";
import { DECISION_PACKAGE_LEARNING_CONTRACT_VERSION } from "./decision-package-learning-types";

export const DECISION_PACKAGE_PROGRESS_CONTRACT_VERSION = "decision-package-progress/v1" as const;
export const DECISION_PACKAGE_PROGRESS_STORAGE_KEY = "lsa_decision_package_progress_v1" as const;

export type DecisionPackageProgressStatus = "not-started" | "in-progress" | "ready-for-review";

export interface DecisionPackageProgressRecord {
  contractVersion: typeof DECISION_PACKAGE_PROGRESS_CONTRACT_VERSION;
  learningContractVersion: typeof DECISION_PACKAGE_LEARNING_CONTRACT_VERSION;
  packageId: DecisionPackageId;
  criteria: Array<{ criterion: string; complete: boolean }>;
  updatedAt: string;
}

export interface DecisionPackageProgressAssessment {
  status: DecisionPackageProgressStatus;
  completedCount: number;
  totalCount: number;
  percent: number;
}

const packageIds = new Set<string>(DECISION_PACKAGES.map((item) => item.id));

export function assessDecisionPackageProgress(record?: DecisionPackageProgressRecord): DecisionPackageProgressAssessment {
  const totalCount = record?.criteria.length ?? 0;
  const completedCount = record?.criteria.filter((item) => item.complete).length ?? 0;
  return {
    status: completedCount === 0 ? "not-started" : totalCount > 0 && completedCount === totalCount ? "ready-for-review" : "in-progress",
    completedCount,
    totalCount,
    percent: totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100),
  };
}

export function reconcileDecisionPackageProgress(
  packageId: DecisionPackageId,
  completionCriteria: string[],
  existing?: DecisionPackageProgressRecord,
  now = new Date().toISOString(),
): DecisionPackageProgressRecord {
  const completed = new Set(existing?.criteria.filter((item) => item.complete).map((item) => item.criterion) ?? []);
  return {
    contractVersion: DECISION_PACKAGE_PROGRESS_CONTRACT_VERSION,
    learningContractVersion: DECISION_PACKAGE_LEARNING_CONTRACT_VERSION,
    packageId,
    criteria: completionCriteria.map((criterion) => ({ criterion, complete: completed.has(criterion) })),
    updatedAt: existing?.updatedAt ?? now,
  };
}

export function setDecisionPackageCriterion(
  record: DecisionPackageProgressRecord,
  criterion: string,
  complete: boolean,
  now = new Date().toISOString(),
): DecisionPackageProgressRecord {
  if (!record.criteria.some((item) => item.criterion === criterion)) return record;
  return {
    ...record,
    criteria: record.criteria.map((item) => item.criterion === criterion ? { ...item, complete } : item),
    updatedAt: now,
  };
}

export function parseDecisionPackageProgressStore(value: unknown): DecisionPackageProgressRecord[] {
  if (!Array.isArray(value)) return [];
  const parsed = value.filter((candidate): candidate is DecisionPackageProgressRecord => {
    if (!candidate || typeof candidate !== "object") return false;
    const record = candidate as Partial<DecisionPackageProgressRecord>;
    return record.contractVersion === DECISION_PACKAGE_PROGRESS_CONTRACT_VERSION
      && record.learningContractVersion === DECISION_PACKAGE_LEARNING_CONTRACT_VERSION
      && typeof record.packageId === "string"
      && packageIds.has(record.packageId)
      && typeof record.updatedAt === "string"
      && Array.isArray(record.criteria)
      && record.criteria.length >= 4
      && record.criteria.length <= 20
      && record.criteria.every((item) => item && typeof item.criterion === "string" && item.criterion.trim().length > 0 && typeof item.complete === "boolean")
      && new Set(record.criteria.map((item) => item.criterion)).size === record.criteria.length;
  });
  if (parsed.length !== value.length) return [];
  if (new Set(parsed.map((record) => record.packageId)).size !== parsed.length) return [];
  return parsed;
}
