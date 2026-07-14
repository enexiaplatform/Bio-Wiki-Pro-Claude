import { z } from "zod";
import type { QualityLabProject } from "./quality-lab.js";
import type { QualityLabEngagementPacket } from "./quality-lab-engagement.js";

export const QUALITY_LAB_DELIVERY_PACKAGE_VERSION = "quality-lab-delivery-package/v1" as const;

export const deliveryReadinessSchema = z.object({
  status: z.enum(["working-draft", "ready-for-qualified-review", "recorded-external-release"]),
  blockers: z.array(z.string()),
  cautions: z.array(z.string()),
  completedReviewItems: z.number().int().nonnegative(),
  totalReviewItems: z.number().int().nonnegative(),
  methodEvidenceReady: z.number().int().nonnegative(),
  totalMethodEvidence: z.number().int().nonnegative(),
  ursItemsReady: z.number().int().nonnegative(),
  totalUrsItems: z.number().int().nonnegative(),
});

export type DeliveryReadiness = z.infer<typeof deliveryReadinessSchema>;

export function assessQualityLabDeliveryReadiness(
  project: QualityLabProject,
  packet: QualityLabEngagementPacket,
): DeliveryReadiness {
  const completedReviewItems = packet.checklist.filter((item) => item.status === "resolved" || item.status === "not-applicable").length;
  const methodEvidenceReady = packet.methodEvidenceMatrix.filter((item) => item.status === "ready-for-qualified-review").length;
  const ursItemsReady = packet.ursBasis.filter((item) => item.status === "ready-for-qualified-review").length;
  const blockers: string[] = [];
  const cautions: string[] = [];

  if (!project.reviewRequestedAt) blockers.push("Submit the structured expert-review brief before preparing a controlled handoff.");
  if (!packet.deliveryControl.documentId.trim()) blockers.push("Assign a controlled document identifier.");
  if (!packet.deliveryControl.revision.trim()) blockers.push("Assign a document revision.");
  if (!packet.deliveryControl.preparedByRole.trim()) blockers.push("Record the role responsible for preparing the delivery package.");
  if (project.blueprint.dataQuality.blockingOpenCount > 0) blockers.push(`Resolve ${project.blueprint.dataQuality.blockingOpenCount} blocking Blueprint input(s) and recompile the model.`);
  if (completedReviewItems < packet.checklist.length) blockers.push(`Complete or disposition ${packet.checklist.length - completedReviewItems} evidence-review item(s).`);
  if (methodEvidenceReady < packet.methodEvidenceMatrix.length) blockers.push(`Move ${packet.methodEvidenceMatrix.length - methodEvidenceReady} method-evidence item(s) to qualified-review readiness.`);
  if (ursItemsReady < packet.ursBasis.length) blockers.push(`Move ${packet.ursBasis.length - ursItemsReady} URS basis item(s) to qualified-review readiness.`);

  if (packet.decisions.length === 0) cautions.push("No project decisions have been recorded in the engagement log.");
  if (packet.corrections.length === 0) cautions.push("No corrections have been recorded; confirm whether the concept baseline was accepted without change.");
  if (project.blueprint.dataQuality.importantOpenCount > 0) cautions.push(`${project.blueprint.dataQuality.importantOpenCount} important input(s) remain open and must be disclosed in the handoff.`);

  let status: DeliveryReadiness["status"] = blockers.length === 0 ? "ready-for-qualified-review" : "working-draft";
  if (packet.deliveryControl.recordedStatus === "recorded-external-release") {
    if (!packet.deliveryControl.reviewedByRole.trim()) blockers.push("Record the qualified reviewer role before recording an external release.");
    if (!packet.deliveryControl.externalApprovalReference.trim()) blockers.push("Record the client-controlled approval or release reference.");
    status = blockers.length === 0 ? "recorded-external-release" : "working-draft";
  }

  return deliveryReadinessSchema.parse({
    status,
    blockers,
    cautions,
    completedReviewItems,
    totalReviewItems: packet.checklist.length,
    methodEvidenceReady,
    totalMethodEvidence: packet.methodEvidenceMatrix.length,
    ursItemsReady,
    totalUrsItems: packet.ursBasis.length,
  });
}

export function createQualityLabDeliveryPackage(
  project: QualityLabProject,
  packet: QualityLabEngagementPacket,
  generatedAt = new Date().toISOString(),
) {
  const readiness = assessQualityLabDeliveryReadiness(project, packet);
  return {
    packageVersion: QUALITY_LAB_DELIVERY_PACKAGE_VERSION,
    generatedAt,
    project: { id: project.id, name: project.name, country: project.input.country, facilityType: project.input.facilityType },
    control: packet.deliveryControl,
    sourceVersions: packet.sourceVersions,
    readiness,
    manifest: [
      { id: "decision-brief", title: "Executive decision brief", format: "PDF/XLSX", status: "included" },
      { id: "capacity-model", title: "Demand, capacity and resource model", format: "XLSX", status: "included" },
      { id: "method-portfolio", title: "Method portfolio and method BOM", format: "XLSX", status: "included" },
      { id: "urs-basis", title: "Vendor-neutral URS drafting basis", format: "XLSX", status: "requires-qualified-review" },
      { id: "evidence-register", title: "Evidence, assumptions and open-input register", format: "XLSX", status: "included" },
      { id: "review-record", title: "Review, correction and decision record", format: "XLSX", status: "included" },
      { id: "calibration-record", title: "Estimate-to-actual calibration record", format: "XLSX/CSV", status: "included" },
    ] as const,
    controlNotice: readiness.status === "recorded-external-release"
      ? "Atlas records the external release reference only. Approval remains under the client quality system."
      : "Working decision-support package. Not a validated design, approved specification, supplier quotation, regulatory opinion or client-controlled release.",
  };
}
