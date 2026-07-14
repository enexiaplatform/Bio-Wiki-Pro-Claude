import { describe, expect, it } from "vitest";
import {
  assessExpertOwnership,
  createExpertOwnershipCsv,
  createMicrobiologyExpertOwnerRoles,
  type ExpertOwnerRole,
} from "./quality-lab-expert-ownership";
import {
  MICROBIOLOGY_DOMAIN_PACK,
  MICROBIOLOGY_SHARED_RULE_TRACE,
  workflowRuleTrace,
  type MicrobiologyWorkflowKey,
} from "./quality-lab-microbiology-pack";

const workflowKeys: MicrobiologyWorkflowKey[] = ["rawMaterials", "finishedProducts", "water", "environmentalMonitoring", "sterility", "endotoxin", "bioburden", "growthPromotion"];
const ruleTrace = [...workflowRuleTrace(workflowKeys), ...MICROBIOLOGY_SHARED_RULE_TRACE];
const roles = createMicrobiologyExpertOwnerRoles(ruleTrace);
const generatedAt = "2026-07-14T00:00:00.000Z";

describe("Quality Lab expert ownership controls", () => {
  it("assigns every current microbiology rule to a defined review scope", () => {
    const assessment = assessExpertOwnership({ domainPack: MICROBIOLOGY_DOMAIN_PACK, ruleTrace, roles, generatedAt });
    expect(assessment.metrics).toMatchObject({
      requiredRoleCount: 4,
      ownershipEstablishedCount: 0,
      ruleCount: 14,
      rulesInReviewScopeCount: 14,
      uncoveredRuleCount: 0,
      unknownScopedRuleCount: 0,
      duplicateRoleIdCount: 0,
    });
    expect(assessment.ownershipGateSatisfied).toBe(false);
    expect(assessment.roles.every((role) => role.missingControls.includes("Named reviewer"))).toBe(true);
  });

  it("requires evidence-backed external appointment before ownership is established", () => {
    const appointed: ExpertOwnerRole = {
      ...roles[0],
      appointment: {
        reviewerName: "Named reviewer",
        organization: "Qualified organization",
        competenceBasis: "Documented pharmaceutical microbiology leadership and method lifecycle accountability.",
        competenceEvidenceRefs: ["controlled-cv-001", "training-matrix-004"],
        conflictDeclaration: "No unmanaged conflict declared for this scope.",
        scopeAccepted: true,
        appointmentStatus: "appointed-outside-atlas",
        appointmentEvidenceRef: "appointment-record-007",
        appointedAt: "2026-07-01T00:00:00.000Z",
        appointmentExpiresAt: "2027-07-01T00:00:00.000Z",
        changeControlResponsibility: "Reviews affected rules and evidence before controlled release or version change.",
      },
    };
    const assessment = assessExpertOwnership({ domainPack: MICROBIOLOGY_DOMAIN_PACK, ruleTrace, roles: [appointed, ...roles.slice(1)], generatedAt });
    expect(assessment.roles[0]).toMatchObject({ ownershipEstablished: true, missingControls: [] });
    expect(assessment.metrics.ownershipEstablishedCount).toBe(1);
    expect(assessment.ownershipGateSatisfied).toBe(false);
    const complete = assessExpertOwnership({ domainPack: MICROBIOLOGY_DOMAIN_PACK, ruleTrace, roles: roles.map((role) => ({ ...role, appointment: appointed.appointment })), generatedAt });
    expect(complete).toMatchObject({ ownershipGateSatisfied: true, blockers: [], metrics: { ownershipEstablishedCount: 4 } });
  });

  it("rejects an expired appointment period", () => {
    const expired: ExpertOwnerRole = {
      ...roles[0],
      appointment: {
        reviewerName: "Named reviewer",
        organization: null,
        competenceBasis: "Documented pharmaceutical microbiology leadership and method lifecycle accountability.",
        competenceEvidenceRefs: ["controlled-cv-001"],
        conflictDeclaration: "No unmanaged conflict declared for this scope.",
        scopeAccepted: true,
        appointmentStatus: "appointed-outside-atlas",
        appointmentEvidenceRef: "appointment-record-007",
        appointedAt: "2025-01-01T00:00:00.000Z",
        appointmentExpiresAt: "2026-01-01T00:00:00.000Z",
        changeControlResponsibility: "Reviews affected rules and evidence before controlled release or version change.",
      },
    };
    const assessment = assessExpertOwnership({ domainPack: MICROBIOLOGY_DOMAIN_PACK, ruleTrace, roles: [expired], generatedAt });
    expect(assessment.roles[0].ownershipEstablished).toBe(false);
    expect(assessment.roles[0].missingControls).toContain("Current appointment period");
  });

  it("detects scope defects and exports a fillable control charter", () => {
    const defective = assessExpertOwnership({ domainPack: MICROBIOLOGY_DOMAIN_PACK, ruleTrace, roles: [{ ...roles[0], id: "duplicate", ruleIds: ["unknown.rule"] }, { ...roles[1], id: "duplicate", ruleIds: [] }], generatedAt });
    expect(defective.metrics).toMatchObject({ duplicateRoleIdCount: 1, unknownScopedRuleCount: 1 });
    expect(defective.metrics.uncoveredRuleCount).toBeGreaterThan(0);
    const csv = createExpertOwnershipCsv(assessExpertOwnership({ domainPack: MICROBIOLOGY_DOMAIN_PACK, ruleTrace, roles, generatedAt }));
    expect(csv).toContain('"role_id","role_title"');
    expect(csv).toContain('"microbiology-domain-owner"');
    expect(csv).toContain('"not-appointed"');
    expect(csv).not.toContain("Qualified organization");
  });
});
