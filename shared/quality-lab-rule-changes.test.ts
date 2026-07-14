import { describe, expect, it } from "vitest";
import { assessRuleChangeCandidate, type RuleChangeCandidate } from "./quality-lab-rule-changes";

const candidate: RuleChangeCandidate = { id: "change-1", domainPackId: "micro", domainPackVersion: "v1", targetRuleId: "rule-1", currentRuleVersion: "v1", proposedRuleVersion: "v2", triggerProjectIds: ["project-1"], evidenceRefs: ["evidence-1"], validationCaseIds: ["case-1"], changeSummary: "Update the controlled workload coefficient.", rationale: "Observed project evidence supports a reviewed change.", impactAssessment: "Staffing and capacity outputs require regression review.", proposedByRole: "Domain owner", proposedAt: "2026-07-14T00:00:00.000Z", reviewStatus: "ready-for-external-approval", approvedByRole: null, approvalEvidenceRef: null, approvedAt: null };

describe("Quality Lab controlled rule changes", () => {
  it("allows review eligibility without changing executable rules", () => {
    const assessment = assessRuleChangeCandidate(candidate, ["rule-1"]);
    expect(assessment).toMatchObject({ eligibleForExternalApproval: true, externallyApproved: false, blockers: [] });
    expect(assessment.notice).toMatch(/does not modify executable Atlas rules/i);
  });
  it("blocks unknown rules and same-version proposals", () => {
    expect(assessRuleChangeCandidate({ ...candidate, currentRuleVersion: "v2" }, []).blockers).toHaveLength(2);
  });
});
