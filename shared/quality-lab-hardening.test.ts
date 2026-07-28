import { describe, expect, it } from "vitest";
import {
  createQualityLabProject,
  defaultQualityLabInput,
  validateQualityLabLineageIntegrity,
} from "./quality-lab.js";
import { validateQualityLabDecisionRecord } from "./quality-lab-decisions.js";
import {
  createEmptyQualityLabEvidenceRegister,
  isConfirmedQualityLabEvidence,
  qualityLabEvidenceRecordSchema,
} from "./quality-lab-evidence.js";
import {
  ensureQualityLabProjectHistory,
  freezeQualityLabProjectRevision,
  recompileQualityLabProject,
} from "./quality-lab-revisions.js";

const now = "2026-07-28T00:00:00.000Z";

function projectWithHistory() {
  const project = { ...createQualityLabProject(defaultQualityLabInput, "qlp_hardening"), evidenceRegister: createEmptyQualityLabEvidenceRegister(now) };
  const revision = freezeQualityLabProjectRevision(project, 1, now);
  return { ...project, revisions: [revision], activeRevisionId: revision.revisionId };
}

describe("Quality Lab frozen revision integrity", () => {
  it("loads a stored frozen output without recompiling it", () => {
    const project = projectWithHistory();
    const historicalOutput = project.blueprint.current.monthlyTests;
    const incompatibleWorkingInput = { ...project.input, finishedBatchesPerMonth: project.input.finishedBatchesPerMonth + 999 };
    const loaded = ensureQualityLabProjectHistory({ ...project, input: incompatibleWorkingInput });
    expect(loaded.blueprint.current.monthlyTests).toBe(historicalOutput);
    expect(loaded.revisions?.[0].blueprintSnapshot.current.monthlyTests).toBe(historicalOutput);
  });

  it("creates a new revision only on explicit recompile and preserves the previous revision", () => {
    const project = projectWithHistory();
    const first = JSON.stringify(project.revisions?.[0]);
    const updated = recompileQualityLabProject(project, { ...project.input, finishedBatchesPerMonth: project.input.finishedBatchesPerMonth + 10 }, "2026-07-28T01:00:00.000Z");
    expect(updated.revisions).toHaveLength(2);
    expect(JSON.stringify(updated.revisions?.[0])).toBe(first);
    expect(updated.activeRevisionId).toBe("qlp_hardening:revision:2");
    expect(updated.revisions?.[1].engineVersion).toBe(updated.blueprint.engineVersion);
    expect(updated.revisions?.[1].ruleReferences).toEqual(updated.blueprint.ruleTrace.map((rule) => ({ id: rule.ruleId, version: rule.ruleVersion })));
  });

  it("preserves legacy stored output and marks incomplete provenance", () => {
    const project = createQualityLabProject(defaultQualityLabInput, "qlp_legacy");
    const loaded = ensureQualityLabProjectHistory(project);
    expect(loaded.revisions).toHaveLength(1);
    expect(loaded.revisions?.[0].provenanceStatus).toBe("legacy-incomplete");
    expect(loaded.revisions?.[0].blueprintSnapshot.generatedAt).toBe(project.blueprint.generatedAt);
  });
});

describe("Quality Lab decision lifecycle validation", () => {
  const decision = () => projectWithHistory().decisionRegister.decisions[0];

  it("rejects final decisions without disposition, owner, or date", () => {
    const base = decision();
    expect(validateQualityLabDecisionRecord({ ...base, status: "decided", ownerRole: "", finalDisposition: "Accepted", decidedAt: now.slice(0, 10) })).toContain("Owner role is required before a decision can be decided or closed.");
    expect(validateQualityLabDecisionRecord({ ...base, status: "decided", ownerRole: "QA", finalDisposition: "", decidedAt: now.slice(0, 10) })).toContain("Final disposition is required before a decision can be decided or closed.");
    expect(validateQualityLabDecisionRecord({ ...base, status: "decided", ownerRole: "QA", finalDisposition: "Accepted", decidedAt: "" })).toContain("Decision date is required before a decision can be decided or closed.");
  });

  it("rejects material outcomes before a decision is decided", () => {
    const base = decision();
    const errors = validateQualityLabDecisionRecord({ ...base, status: "open", outcome: { ...base.outcome, observed: "Actual throughput was lower." } });
    expect(errors).toContain("Observed outcomes may only be recorded for decided or closed decisions.");
  });

  it("rejects incomplete governed-change proposals", () => {
    const base = decision();
    const errors = validateQualityLabDecisionRecord({ ...base, status: "decided", ownerRole: "QA", finalDisposition: "Adopted", decidedAt: "2026-07-28", outcome: { ...base.outcome, learningStatus: "governed-change-proposed" } });
    expect(errors).toEqual(expect.arrayContaining([
      "A governed-change proposal requires an observed outcome.",
      "A governed-change proposal requires a variance explanation.",
      "A governed-change proposal requires an outcome evidence reference.",
      "A governed-change proposal requires an observed date.",
    ]));
  });
});

describe("Quality Lab lineage integrity", () => {
  it("maps recommendation rules through workflows to method IDs", () => {
    const blueprint = projectWithHistory().blueprint;
    const lineage = blueprint.decisionLineage.find((item) => item.outputKey === "recommendations.turnaround-feasibility");
    expect(lineage?.workflowIds).toContain("finished-product-mlt");
    expect(lineage?.methodIds).toEqual(expect.arrayContaining(blueprint.methodRequirements.map((requirement) => requirement.methodId)));
  });

  it("does not replace an unknown material rule with fallback attribution", () => {
    const blueprint = projectWithHistory().blueprint;
    const corrupted = {
      ...blueprint,
      recommendations: blueprint.recommendations.map((recommendation, index) => index === 0 ? { ...recommendation, relatedRuleIds: ["unknown.material.rule"] } : recommendation),
    };
    expect(validateQualityLabLineageIntegrity(corrupted)).toContain(`Recommendation ${blueprint.recommendations[0].id} references unknown material rule unknown.material.rule`);
  });

  it("has no orphan references and preserves exact rule versions", () => {
    const blueprint = projectWithHistory().blueprint;
    expect(validateQualityLabLineageIntegrity(blueprint)).toEqual([]);
    for (const lineage of blueprint.decisionLineage) for (const ref of lineage.ruleRefs) {
      expect(blueprint.ruleTrace.find((rule) => rule.ruleId === ref.id)?.ruleVersion).toBe(ref.version);
    }
  });
});

describe("Quality Lab Evidence Register", () => {
  const record = qualityLabEvidenceRecordSchema.parse({
    contractVersion: "quality-lab-evidence-record/v1", id: "e1", projectId: "p1", title: "Production forecast FY27", evidenceType: "production-forecast", sourceType: "client-record", sourceReference: "DOC-27", documentDate: "2026-07-01", versionOrRevision: "r2", status: "candidate", confirmedByUser: false, confirmedAt: null,
    relatedDecisionIds: ["decision-project-mandate"], relatedActionIds: ["action-forecast"], relatedRuleIds: ["core.capacity.people"], relatedMethodIds: [], notes: "", createdAt: now, updatedAt: now,
  });

  it("keeps candidate evidence distinct from confirmed evidence", () => {
    expect(isConfirmedQualityLabEvidence(record)).toBe(false);
    expect(isConfirmedQualityLabEvidence({ ...record, status: "confirmed", confirmedByUser: true, confirmedAt: now })).toBe(true);
  });

  it("keeps superseded evidence historically visible with decision and action links", () => {
    const register = { ...createEmptyQualityLabEvidenceRegister(now), records: [{ ...record, status: "superseded" as const }] };
    expect(register.records).toHaveLength(1);
    expect(register.records[0].relatedDecisionIds).toEqual(["decision-project-mandate"]);
    expect(register.records[0].relatedActionIds).toEqual(["action-forecast"]);
  });

  it("does not turn unresolved evidence gaps into available evidence records", () => {
    const project = projectWithHistory();
    expect(project.blueprint.unresolvedInputs.length).toBeGreaterThan(0);
    expect(project.evidenceRegister.records).toEqual([]);
  });
});
