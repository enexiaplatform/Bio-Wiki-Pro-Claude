import { describe, expect, it } from "vitest";
import { compareQualityLabGovernanceSnapshots } from "./quality-lab-governance";
import { createExpertOwnershipRegister, createMicrobiologyExpertOwnerRoles } from "./quality-lab-expert-ownership";
import { MICROBIOLOGY_DOMAIN_PACK, MICROBIOLOGY_SHARED_RULE_TRACE } from "./quality-lab-microbiology-pack";

describe("Quality Lab governance revision comparison", () => {
  it("reports changed evidence paths without treating timestamps as evidence changes", () => {
    const roles = createMicrobiologyExpertOwnerRoles(MICROBIOLOGY_SHARED_RULE_TRACE);
    const before = createExpertOwnershipRegister({ domainPack: MICROBIOLOGY_DOMAIN_PACK, roles, updatedAt: "2026-07-01T00:00:00.000Z" });
    const after = createExpertOwnershipRegister({ domainPack: MICROBIOLOGY_DOMAIN_PACK, roles: roles.map((role, index) => index ? role : { ...role, appointment: { ...role.appointment, reviewerName: "Named reviewer" } }), updatedAt: "2026-07-02T00:00:00.000Z" });
    const changes = compareQualityLabGovernanceSnapshots(before, after);
    expect(changes).toEqual([{ path: "appointments.microbiology-domain-owner.reviewerName", before: null, after: "Named reviewer" }]);
  });
});
