import { describe, expect, it } from "vitest";
import { createQualityLabProject, defaultQualityLabInput } from "./quality-lab";
import { createQualityLabEngagementPacket } from "./quality-lab-engagement";
import { assessQualityLabDeliveryReadiness, createQualityLabDeliveryPackage } from "./quality-lab-delivery";

describe("Quality Lab delivery package", () => {
  it("keeps a concept project in working-draft status with explicit blockers", () => {
    const project = createQualityLabProject(defaultQualityLabInput, "qlp_delivery");
    const packet = createQualityLabEngagementPacket(project, "2026-07-14T00:00:00.000Z");
    const readiness = assessQualityLabDeliveryReadiness(project, packet);
    expect(readiness.status).toBe("working-draft");
    expect(readiness.blockers).toContain("Submit the structured expert-review brief before preparing a controlled handoff.");
    expect(readiness.blockers.some((item) => item.includes("blocking Blueprint"))).toBe(true);
  });

  it("builds a versioned delivery manifest without claiming Atlas approval", () => {
    const project = createQualityLabProject(defaultQualityLabInput, "qlp_manifest");
    const packet = createQualityLabEngagementPacket(project, "2026-07-14T00:00:00.000Z");
    const delivery = createQualityLabDeliveryPackage(project, packet, "2026-07-14T01:00:00.000Z");
    expect(delivery.packageVersion).toBe("quality-lab-delivery-package/v1");
    expect(delivery.manifest.map((item) => item.id)).toContain("urs-basis");
    expect(delivery.controlNotice).toContain("Not a validated design");
  });

  it("requires external approval provenance before recording a released package", () => {
    const project = createQualityLabProject(defaultQualityLabInput, "qlp_release");
    project.reviewRequestedAt = "2026-07-14T00:00:00.000Z";
    project.blueprint.dataQuality.blockingOpenCount = 0;
    const packet = createQualityLabEngagementPacket(project, "2026-07-14T00:00:00.000Z");
    packet.deliveryControl.preparedByRole = "Atlas project lead";
    packet.deliveryControl.recordedStatus = "recorded-external-release";
    packet.checklist.forEach((item) => { item.status = "resolved"; });
    packet.methodEvidenceMatrix.forEach((item) => { item.status = "ready-for-qualified-review"; });
    packet.ursBasis.forEach((item) => { item.status = "ready-for-qualified-review"; });
    expect(assessQualityLabDeliveryReadiness(project, packet).status).toBe("working-draft");

    packet.deliveryControl.reviewedByRole = "Qualified microbiology SME";
    packet.deliveryControl.externalApprovalReference = "CLIENT-DOC-001 Rev 1";
    expect(assessQualityLabDeliveryReadiness(project, packet).status).toBe("recorded-external-release");
  });
});
