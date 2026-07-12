import { describe, expect, it } from "vitest";
import { atlasEvidenceDomains, blueprintDecisions, evidenceContextForHref, evidenceForDecision, ruleEvidenceMappings, ruleGuidanceForIds } from "../client/src/data/atlasEvidenceGraph";
import { createQualityLabProject, defaultQualityLabInput } from "./quality-lab";

describe("Atlas Evidence Graph", () => {
  it("gives every domain a complete guide, lesson, workflow and tool chain", () => {
    expect(atlasEvidenceDomains).toHaveLength(6);
    for (const domain of atlasEvidenceDomains) {
      expect(new Set(domain.resources.map((item) => item.kind))).toEqual(new Set(["guide", "lesson", "workflow", "tool"]));
      expect(domain.resources.some((item) => item.href === domain.guideHref && item.kind === "guide")).toBe(true);
      for (const resource of domain.resources) {
        expect(resource.decisions.length).toBeGreaterThan(0);
        expect(evidenceContextForHref(resource.href).some((context) => context.domain.id === domain.id)).toBe(true);
      }
    }
  });

  it("keeps resource URLs unique and every Blueprint decision connected", () => {
    const hrefs = atlasEvidenceDomains.flatMap((domain) => domain.resources.map((item) => item.href));
    expect(new Set(hrefs).size).toBe(hrefs.length);
    for (const decision of blueprintDecisions) expect(evidenceForDecision(decision.id).length).toBeGreaterThan(0);
  });

  it("maps every executable Blueprint rule to contextual evidence", () => {
    const project = createQualityLabProject(defaultQualityLabInput, "qlp_evidence_mapping");
    for (const rule of project.blueprint.ruleTrace) {
      const guidance = ruleGuidanceForIds([rule.ruleId]);
      expect(guidance.matchedRuleIds, rule.ruleId).toContain(rule.ruleId);
      expect(guidance.resources.length, rule.ruleId).toBeGreaterThan(0);
      expect(guidance.fallbackUsed).toBe(false);
    }
    expect(new Set(ruleEvidenceMappings.map((mapping) => mapping.ruleId)).size).toBe(ruleEvidenceMappings.length);
  });

  it("exposes unmapped IDs instead of silently pretending an exact match", () => {
    const guidance = ruleGuidanceForIds(["future.domain.rule"]);
    expect(guidance).toMatchObject({ matchedRuleIds: [], unmatchedRuleIds: ["future.domain.rule"], fallbackUsed: true });
    expect(guidance.resources.length).toBeGreaterThan(0);
  });

  it("routes method-suitability blockers to product recovery and capacity guidance", () => {
    const guidance = ruleGuidanceForIds(["method-suitability"]);
    expect(guidance.fallbackUsed).toBe(false);
    expect(guidance.decisionIds).toEqual(expect.arrayContaining(["method-architecture", "control-investigation", "lifecycle-governance"]));
    expect(guidance.resources[0]?.href).toBe("/blog/method-suitability-to-microbiology-lab-capacity");
  });

  it("routes equipment-cycle blockers to usable-capacity guidance", () => {
    const guidance = ruleGuidanceForIds(["core.capacity.equipment"]);
    expect(guidance.fallbackUsed).toBe(false);
    expect(guidance.resources[0]?.href).toBe("/blog/from-workload-to-usable-qc-equipment-capacity");
    expect(guidance.decisionIds).toEqual(expect.arrayContaining(["workload-capacity", "equipment-utilities", "lifecycle-governance"]));
  });

  it("routes staffing and time-study blockers to resilient staffing guidance", () => {
    const guidance = ruleGuidanceForIds(["core.capacity.people"]);
    expect(guidance.fallbackUsed).toBe(false);
    expect(guidance.resources[0]?.href).toBe("/blog/from-hands-on-hours-to-resilient-qc-staffing");
    expect(guidance.decisionIds).toEqual(expect.arrayContaining(["workload-capacity", "control-investigation", "lifecycle-governance"]));
  });

  it("routes cost and supply blockers to consumable resilience guidance", () => {
    const guidance = ruleGuidanceForIds(["core.cost.concept"]);
    expect(guidance.fallbackUsed).toBe(false);
    expect(guidance.resources[0]?.href).toBe("/blog/from-method-bom-to-resilient-qc-consumable-supply");
    expect(guidance.decisionIds).toEqual(expect.arrayContaining(["method-architecture", "workload-capacity", "lifecycle-governance"]));
  });

  it("routes space blockers to zoning, flow and engineering-basis guidance", () => {
    const guidance = ruleGuidanceForIds(["core.space.concept"]);
    expect(guidance.fallbackUsed).toBe(false);
    expect(guidance.resources[0]?.href).toBe("/blog/from-qc-capability-map-to-space-zoning-and-flow-basis");
    expect(guidance.decisionIds).toEqual(expect.arrayContaining(["method-architecture", "equipment-utilities", "lifecycle-governance"]));
  });
});
