import { describe, expect, it } from "vitest";
import {
  MICROBIOLOGY_DOMAIN_PACK,
  MICROBIOLOGY_EVIDENCE_CATALOG,
  MICROBIOLOGY_SHARED_RULE_TRACE,
  MICROBIOLOGY_WORKFLOW_RULES,
  workflowRuleTrace,
  type MicrobiologyWorkflowKey,
} from "./quality-lab-microbiology-pack";

describe("microbiology domain pack", () => {
  it("publishes an honest concept-status identity for the non-sterile wedge", () => {
    expect(MICROBIOLOGY_DOMAIN_PACK.id).toBe("nonsterile-pharma-microbiology");
    expect(MICROBIOLOGY_DOMAIN_PACK.status).toBe("concept");
    expect(MICROBIOLOGY_DOMAIN_PACK.version).toMatch(/^microbiology-pack\/v\d/);
    expect(MICROBIOLOGY_DOMAIN_PACK.scope).toMatch(/non-sterile pharmaceutical microbiology/i);
  });

  it("keeps the evidence catalog complete, unique and limitation-bound", () => {
    const ids = MICROBIOLOGY_EVIDENCE_CATALOG.map((record) => record.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual(expect.arrayContaining([
      "project-inputs",
      "atlas-microbiology-benchmarks-v1",
      "usp-61-context",
      "usp-62-context",
      "site-approved-methods",
      "vendor-budget-evidence",
    ]));
    for (const record of MICROBIOLOGY_EVIDENCE_CATALOG) {
      expect(record.title.length).toBeGreaterThan(0);
      expect(record.publisher.length).toBeGreaterThan(0);
      expect(record.version.length).toBeGreaterThan(0);
      expect(record.status.length).toBeGreaterThan(0);
      expect(record.scope.length).toBeGreaterThan(0);
      expect(record.limitations.length).toBeGreaterThan(0);
    }
  });

  it("resolves every workflow-rule evidence reference against the catalog", () => {
    const catalogIds = new Set(MICROBIOLOGY_EVIDENCE_CATALOG.map((record) => record.id));
    for (const rule of Object.values(MICROBIOLOGY_WORKFLOW_RULES)) {
      expect(rule.ruleId).toMatch(/^micro\.workflow\./);
      expect(rule.evidenceIds.length).toBeGreaterThanOrEqual(1);
      for (const evidenceId of rule.evidenceIds) expect(catalogIds.has(evidenceId)).toBe(true);
      expect(rule.applicability.length).toBeGreaterThan(0);
      expect(rule.limitations.length).toBeGreaterThan(0);
      // Site-approved methods gate every workflow before controlled use.
      expect(rule.evidenceIds).toContain("site-approved-methods");
    }
  });

  it("marks every shared rule trace review-required with pack provenance and resolvable evidence", () => {
    const catalogIds = new Set(MICROBIOLOGY_EVIDENCE_CATALOG.map((record) => record.id));
    expect(MICROBIOLOGY_SHARED_RULE_TRACE.length).toBeGreaterThanOrEqual(5);
    for (const rule of MICROBIOLOGY_SHARED_RULE_TRACE) {
      expect(rule.domainPackId).toBe(MICROBIOLOGY_DOMAIN_PACK.id);
      expect(rule.reviewRequired).toBe(true);
      expect(rule.ruleVersion.length).toBeGreaterThan(0);
      expect(rule.outputTypes.length).toBeGreaterThanOrEqual(1);
      expect(rule.limitations.length).toBeGreaterThan(0);
      for (const evidenceId of rule.evidenceIds) expect(catalogIds.has(evidenceId)).toBe(true);
    }
  });

  it("workflowRuleTrace emits one traced rule per requested key with pack provenance", () => {
    const keys: MicrobiologyWorkflowKey[] = ["finishedProducts", "water", "environmentalMonitoring"];
    const catalogIds = new Set(MICROBIOLOGY_EVIDENCE_CATALOG.map((record) => record.id));
    const trace = workflowRuleTrace(keys);

    expect(trace).toHaveLength(keys.length);
    expect(trace.map((rule) => rule.ruleId)).toEqual(keys.map((key) => MICROBIOLOGY_WORKFLOW_RULES[key].ruleId));
    for (const rule of trace) {
      expect(rule.domainPackId).toBe(MICROBIOLOGY_DOMAIN_PACK.id);
      expect(rule.reviewRequired).toBe(true);
      expect(rule.ruleVersion).toBe("v1.1");
      expect(rule.evidenceIds.length).toBeGreaterThanOrEqual(1);
      for (const evidenceId of rule.evidenceIds) expect(catalogIds.has(evidenceId)).toBe(true);
    }
  });
});
