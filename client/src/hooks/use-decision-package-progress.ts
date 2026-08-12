import { useCallback, useEffect, useState } from "react";

import type { DecisionPackageId } from "@shared/decision-packages";
import {
  DECISION_PACKAGE_PROGRESS_STORAGE_KEY,
  assessDecisionPackageProgress,
  parseDecisionPackageProgressStore,
  reconcileDecisionPackageProgress,
  setDecisionPackageCriterion,
  type DecisionPackageProgressRecord,
} from "@shared/decision-package-progress";

const CHANGE_EVENT = "lsa:decision-package-progress";

function readRecords(): DecisionPackageProgressRecord[] {
  try {
    return parseDecisionPackageProgressStore(JSON.parse(localStorage.getItem(DECISION_PACKAGE_PROGRESS_STORAGE_KEY) ?? "[]"));
  } catch {
    return [];
  }
}

function writeRecords(records: DecisionPackageProgressRecord[]) {
  try {
    localStorage.setItem(DECISION_PACKAGE_PROGRESS_STORAGE_KEY, JSON.stringify(records));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // Privacy mode and storage quota failures leave the current page usable.
  }
}

export function useDecisionPackageProgressPortfolio() {
  const [records, setRecords] = useState<DecisionPackageProgressRecord[]>([]);

  useEffect(() => {
    const refresh = () => setRecords(readRecords());
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener(CHANGE_EVENT, refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener(CHANGE_EVENT, refresh);
    };
  }, []);

  const getRecord = useCallback((packageId: DecisionPackageId) => records.find((record) => record.packageId === packageId), [records]);
  return { records, getRecord, completedCount: records.filter((record) => assessDecisionPackageProgress(record).status === "ready-for-review").length };
}

export function useDecisionPackageProgress(packageId: DecisionPackageId, completionCriteria: string[]) {
  const portfolio = useDecisionPackageProgressPortfolio();
  const record = reconcileDecisionPackageProgress(packageId, completionCriteria, portfolio.getRecord(packageId));
  const assessment = assessDecisionPackageProgress(record);

  const setCriterion = useCallback((criterion: string, complete: boolean) => {
    const records = readRecords();
    const existing = records.find((item) => item.packageId === packageId);
    const reconciled = reconcileDecisionPackageProgress(packageId, completionCriteria, existing);
    const next = setDecisionPackageCriterion(reconciled, criterion, complete);
    writeRecords([...records.filter((item) => item.packageId !== packageId), next]);
    return assessDecisionPackageProgress(next);
  }, [completionCriteria, packageId]);

  return { record, assessment, setCriterion };
}
