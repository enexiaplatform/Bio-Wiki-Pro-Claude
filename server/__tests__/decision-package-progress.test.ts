import { describe, expect, it } from "vitest";

import { getDecisionPackageLearningFlow } from "../../shared/decision-package-learning";
import {
  DECISION_PACKAGE_PROGRESS_CONTRACT_VERSION,
  assessDecisionPackageProgress,
  parseDecisionPackageProgressStore,
  reconcileDecisionPackageProgress,
  setDecisionPackageCriterion,
} from "../../shared/decision-package-progress";

describe("Decision Package progress contract", () => {
  const packageId = "cross-cutting-evidence-governance" as const;
  const criteria = getDecisionPackageLearningFlow(packageId)!.completionCriteria;

  it("derives readiness only after every current criterion is explicitly recorded", () => {
    let record = reconcileDecisionPackageProgress(packageId, criteria, undefined, "2026-08-12T00:00:00.000Z");
    expect(record.contractVersion).toBe(DECISION_PACKAGE_PROGRESS_CONTRACT_VERSION);
    expect(assessDecisionPackageProgress(record)).toMatchObject({ status: "not-started", completedCount: 0, totalCount: 4, percent: 0 });

    record = setDecisionPackageCriterion(record, criteria[0], true, "2026-08-12T01:00:00.000Z");
    expect(assessDecisionPackageProgress(record)).toMatchObject({ status: "in-progress", completedCount: 1, percent: 25 });
    for (const criterion of criteria.slice(1)) record = setDecisionPackageCriterion(record, criterion, true);
    expect(assessDecisionPackageProgress(record)).toMatchObject({ status: "ready-for-review", completedCount: 4, percent: 100 });
  });

  it("reopens readiness when a criterion is corrected and invalidates changed criterion text", () => {
    let record = reconcileDecisionPackageProgress(packageId, criteria);
    for (const criterion of criteria) record = setDecisionPackageCriterion(record, criterion, true);
    record = setDecisionPackageCriterion(record, criteria[1], false);
    expect(assessDecisionPackageProgress(record).status).toBe("in-progress");

    const revised = reconcileDecisionPackageProgress(packageId, [...criteria.slice(0, 3), "A revised controlled handoff criterion"], record);
    expect(revised.criteria[3]).toEqual({ criterion: "A revised controlled handoff criterion", complete: false });
    expect(assessDecisionPackageProgress(revised).status).toBe("in-progress");
  });

  it("fails closed for corrupt, obsolete, duplicate or unknown stored records", () => {
    const valid = reconcileDecisionPackageProgress(packageId, criteria);
    expect(parseDecisionPackageProgressStore([valid])).toEqual([valid]);
    expect(parseDecisionPackageProgressStore([{ ...valid, contractVersion: "decision-package-progress/v0" }])).toEqual([]);
    expect(parseDecisionPackageProgressStore([{ ...valid, packageId: "unknown-package" }])).toEqual([]);
    expect(parseDecisionPackageProgressStore([{ ...valid, criteria: [valid.criteria[0], valid.criteria[0], ...valid.criteria.slice(2)] }])).toEqual([]);
    expect(parseDecisionPackageProgressStore([valid, valid])).toEqual([]);
    expect(parseDecisionPackageProgressStore({ records: [valid] })).toEqual([]);
  });
});
