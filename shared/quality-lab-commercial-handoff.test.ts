import { describe, expect, it } from "vitest";
import { createQualityLabProject, defaultQualityLabInput } from "./quality-lab";
import { createQualityLabEngagementPacket } from "./quality-lab-engagement";
import { createQualityLabCommercialHandoff, validateQualityLabCommercialHandoffIntegrity } from "./quality-lab-commercial-handoff";

describe("Quality Lab commercial handoff contract", () => {
  it("creates stable vendor-neutral requirements with exact lineage, rule and evidence references", () => {
    const project = createQualityLabProject(defaultQualityLabInput, "qlp_handoff");
    const packet = createQualityLabEngagementPacket(project, "2026-07-26T00:00:00.000Z");
    const handoff = createQualityLabCommercialHandoff(project, packet, "2026-07-26T01:00:00.000Z");
    expect(handoff.handoffVersion).toBe("quality-lab-commercial-handoff/v1");
    expect(handoff.requirements.length).toBeGreaterThan(0);
    expect(handoff.requirements[0]).toMatchObject({ handoffStatus: "blocked", quantityBasis: { status: "concept-allowance" } });
    expect(handoff.requirements[0].decisionLineageIds).toHaveLength(1);
    expect(handoff.requirements[0].ruleRefs[0].version).toBeTruthy();
    expect(handoff.controls).toMatchObject({ vendorNeutral: true, selectsVendor: false, assertsProductEquivalence: false, approvedUrs: false });
    expect(validateQualityLabCommercialHandoffIntegrity(handoff, project)).toEqual([]);
  });

  it("cannot become ready while linked method and site evidence remain open", () => {
    const project = createQualityLabProject(defaultQualityLabInput, "qlp_handoff_open");
    const packet = createQualityLabEngagementPacket(project, "2026-07-26T00:00:00.000Z");
    packet.ursBasis.forEach((item) => { item.status = "ready-for-qualified-review"; });
    const handoff = createQualityLabCommercialHandoff(project, packet);
    expect(handoff.status).toBe("working-draft");
    expect(handoff.blockers.join(" ")).toMatch(/method evidence|site-required|unresolved/i);
  });

  it("rejects a packet from another project", () => {
    const project = createQualityLabProject(defaultQualityLabInput, "qlp_handoff_a");
    const other = createQualityLabProject(defaultQualityLabInput, "qlp_handoff_b");
    expect(() => createQualityLabCommercialHandoff(project, createQualityLabEngagementPacket(other))).toThrow(/do not match/i);
  });

  it("detects traceability tampering", () => {
    const project = createQualityLabProject(defaultQualityLabInput, "qlp_handoff_tamper");
    const handoff = createQualityLabCommercialHandoff(project, createQualityLabEngagementPacket(project));
    handoff.requirements[0].ruleRefs[0].version = "tampered";
    expect(validateQualityLabCommercialHandoffIntegrity(handoff, project)).toEqual(expect.arrayContaining([expect.stringMatching(/mismatched rule/i)]));
  });
});
