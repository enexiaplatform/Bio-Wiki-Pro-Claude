import { z } from "zod";
import type { QualityLabProject } from "./quality-lab.js";
import type { QualityLabEngagementPacket } from "./quality-lab-engagement.js";

export const QUALITY_LAB_COMMERCIAL_HANDOFF_VERSION = "quality-lab-commercial-handoff/v1" as const;
export const QUALITY_LAB_URS_DOCUMENT_VERSION = "quality-lab-urs-document/v1" as const;
export const QUALITY_LAB_RFQ_WORKBOOK_VERSION = "quality-lab-rfq-workbook/v1" as const;

const versionedRefSchema = z.object({ id: z.string().min(1), version: z.string().min(1) });
const reviewStatusSchema = z.enum(["draft", "needs-site-evidence", "ready-for-qualified-review"]);

export const qualityLabUrsRequirementSchema = z.object({
  requirementId: z.string().min(1),
  equipmentId: z.string().min(1),
  equipmentName: z.string().min(1),
  equipmentCategory: z.string().min(1),
  intendedUse: z.string().min(1),
  quantityBasis: z.object({ current: z.number().nonnegative(), planningHorizon: z.number().nonnegative(), status: z.literal("concept-allowance") }),
  functionalRequirements: z.array(z.string().min(1)).min(1),
  performanceRequirements: z.array(z.string().min(1)).min(1),
  utilitiesAndInterfaces: z.array(z.string().min(1)).min(1),
  qualificationImpact: z.string().min(1),
  exclusions: z.array(z.string().min(1)).min(1),
  supplierEvidenceRequested: z.array(z.string().min(1)).min(1),
  relatedMethodRequirementIds: z.array(z.string().min(1)),
  ruleRefs: z.array(versionedRefSchema).min(1),
  evidenceRefs: z.array(versionedRefSchema).min(1),
  decisionLineageIds: z.array(z.string().min(1)).min(1),
  unresolvedInputIds: z.array(z.string().min(1)),
  sourceReviewStatus: reviewStatusSchema,
  handoffStatus: z.enum(["blocked", "ready-for-qualified-drafting"]),
  blockers: z.array(z.string()),
});

export const qualityLabCommercialHandoffSchema = z.object({
  handoffVersion: z.literal(QUALITY_LAB_COMMERCIAL_HANDOFF_VERSION),
  ursDocumentVersion: z.literal(QUALITY_LAB_URS_DOCUMENT_VERSION),
  rfqWorkbookVersion: z.literal(QUALITY_LAB_RFQ_WORKBOOK_VERSION),
  generatedAt: z.string().datetime(),
  project: z.object({ id: z.string().min(1), name: z.string().min(1), revisionReference: z.string().datetime() }),
  documentControl: z.object({ documentId: z.string().min(1), revision: z.string().min(1), intendedUse: z.string().min(1), recordedStatus: z.string().min(1) }),
  sourceVersions: z.object({ inputContract: z.string().min(1), outputContract: z.string().min(1), compilerCore: z.string().min(1), blueprintEngine: z.string().min(1), domainPack: z.string().min(1) }),
  status: z.enum(["working-draft", "ready-for-qualified-review"]),
  requirements: z.array(qualityLabUrsRequirementSchema),
  blockers: z.array(z.string()),
  controls: z.object({
    vendorNeutral: z.literal(true),
    selectsVendor: z.literal(false),
    assertsProductEquivalence: z.literal(false),
    approvedEngineeringSpecification: z.literal(false),
    approvedUrs: z.literal(false),
    supplierResponsesAreDeclarations: z.literal(true),
    notice: z.string().min(1),
  }),
});

export type QualityLabUrsRequirement = z.infer<typeof qualityLabUrsRequirementSchema>;
export type QualityLabCommercialHandoff = z.infer<typeof qualityLabCommercialHandoffSchema>;

const commonExclusions = [
  "No manufacturer, model, catalogue number or proprietary feature is selected by Atlas.",
  "Final site utilities, room layout, installation, integration, local code and EHS requirements are excluded until qualified site review.",
  "Final method parameters, registered specifications, qualification protocols and acceptance criteria remain controlled outside Atlas.",
  "Concept quantities and budget bands are not supplier quotations, approved purchase quantities or an award recommendation.",
];

const commonUtilities = [
  "Supplier shall declare every required electrical, environmental, exhaust, drainage, gas, network, data and physical-service interface; final values require site engineering confirmation.",
  "Supplier shall identify software, access-control, audit-trail, data-export, backup/recovery and cybersecurity dependencies where applicable; Atlas does not infer electronic-record applicability.",
];

const commonSupplierEvidence = [
  "Requirement-by-requirement compliance declaration with comply, deviation, clarification-required or not-offered status.",
  "Technical data, configuration identifier and stated operating limits supporting each declared response.",
  "Utility, installation, calibration, maintenance, training, warranty, service and lifecycle-support scope with explicit exclusions.",
  "Proposed FAT, SAT, IQ/OQ support and documentation deliverables; final qualification strategy remains the user's responsibility.",
];

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function intendedUse(equipmentName: string, methodNames: string[]) {
  return methodNames.length > 0
    ? `Support the controlled laboratory execution of ${methodNames.join("; ")} within the approved site method, sample, workflow and quality-system context.`
    : `${equipmentName} capability for the modeled laboratory workflow, subject to approved site methods, operating procedures and qualified review.`;
}

export function createQualityLabCommercialHandoff(
  project: QualityLabProject,
  packet: QualityLabEngagementPacket,
  generatedAt = new Date().toISOString(),
): QualityLabCommercialHandoff {
  if (project.id !== packet.project.id) throw new Error("Commercial handoff project and engagement packet do not match.");
  const blueprint = project.blueprint;
  const evidenceById = new Map(blueprint.evidence.map((item) => [item.id, item]));
  const ruleById = new Map(blueprint.ruleTrace.map((item) => [item.ruleId, item]));
  const methodByRequirementId = new Map(blueprint.methodRequirements.map((item) => [item.id, item]));

  const requirements = blueprint.equipment.filter((equipment) => equipment.quantityNow > 0 || equipment.quantityFuture > 0).map((equipment, index) => {
    const basis = packet.ursBasis.find((item) => item.id === `urs-basis-${equipment.id}`);
    if (!basis) throw new Error(`Missing URS basis for ${equipment.id}.`);
    const lineage = blueprint.decisionLineage.filter((item) => item.outputKey === `equipment.${equipment.id}.quantityFuture`);
    if (lineage.length !== 1) throw new Error(`Equipment ${equipment.id} must resolve to exactly one Decision Lineage record.`);
    const capacity = blueprint.methodCapacitySummary.find((item) => item.resourceId === equipment.id);
    const methodNames = basis.relatedMethodRequirementIds.map((id) => methodByRequirementId.get(id)?.methodName).filter((value): value is string => Boolean(value));
    const ruleRefs = unique(lineage.flatMap((item) => item.ruleRefs.map((ref) => ref.id))).map((id) => ({ id, version: ruleById.get(id)?.ruleVersion ?? "" }));
    const evidenceIds = unique([...basis.evidenceIds, ...lineage.flatMap((item) => item.evidenceRefs.map((ref) => ref.id))]);
    const evidenceRefs = evidenceIds.map((id) => ({ id, version: evidenceById.get(id)?.version ?? "" }));
    const unresolvedInputIds = unique(lineage.flatMap((item) => item.unresolvedInputIds));
    const blockers: string[] = [];
    if (basis.status !== "ready-for-qualified-review") blockers.push("The engagement URS basis has not reached ready-for-qualified-review status.");
    if (basis.relatedMethodRequirementIds.some((id) => packet.methodEvidenceMatrix.find((item) => item.id === `method-evidence-${id}`)?.status !== "ready-for-qualified-review")) blockers.push("At least one linked method evidence record still requires qualified review.");
    if (unresolvedInputIds.length > 0) blockers.push(`${unresolvedInputIds.length} linked Blueprint input(s) remain unresolved.`);
    if (evidenceIds.some((id) => evidenceById.get(id)?.status === "site-evidence-required" || evidenceById.get(id)?.status === "internal-concept")) blockers.push("Linked evidence still contains site-required or internal-concept records.");
    const performanceRequirements = [
      `Planning quantity basis: ${equipment.quantityNow} current and ${equipment.quantityFuture} planning-horizon unit(s). Treat as a concept allowance pending usable-capacity and redundancy confirmation.`,
      capacity
        ? `Modeled demand basis: ${capacity.monthlyDemand.toLocaleString("en-US")} ${capacity.unit}/month, ${capacity.peakWeekDemand.toLocaleString("en-US")} ${capacity.unit}/peak week and ${capacity.utilizationPercent.toFixed(1)}% modeled utilization. Confirm cycle, load geometry, downtime and usable capacity.`
        : "Supplier shall state usable throughput and limiting operating assumptions against the user's approved workload and method configuration; no universal throughput is asserted.",
      capacity?.limitations ?? "Performance acceptance criteria require qualified site and method-owner definition before URS approval.",
    ];
    return qualityLabUrsRequirementSchema.parse({
      requirementId: `URS-${String(index + 1).padStart(3, "0")}-${equipment.id.toUpperCase()}`,
      equipmentId: equipment.id,
      equipmentName: equipment.name,
      equipmentCategory: equipment.category,
      intendedUse: intendedUse(equipment.name, unique(methodNames)),
      quantityBasis: { current: equipment.quantityNow, planningHorizon: equipment.quantityFuture, status: "concept-allowance" },
      functionalRequirements: [basis.functionalRequirement, equipment.rationale],
      performanceRequirements,
      utilitiesAndInterfaces: commonUtilities,
      qualificationImpact: basis.qualificationImpact,
      exclusions: commonExclusions,
      supplierEvidenceRequested: commonSupplierEvidence,
      relatedMethodRequirementIds: basis.relatedMethodRequirementIds,
      ruleRefs,
      evidenceRefs,
      decisionLineageIds: lineage.map((item) => item.id),
      unresolvedInputIds,
      sourceReviewStatus: basis.status,
      handoffStatus: blockers.length === 0 ? "ready-for-qualified-drafting" : "blocked",
      blockers,
    });
  });
  const blockers = requirements.flatMap((requirement) => requirement.blockers.map((blocker) => `${requirement.requirementId}: ${blocker}`));
  return qualityLabCommercialHandoffSchema.parse({
    handoffVersion: QUALITY_LAB_COMMERCIAL_HANDOFF_VERSION,
    ursDocumentVersion: QUALITY_LAB_URS_DOCUMENT_VERSION,
    rfqWorkbookVersion: QUALITY_LAB_RFQ_WORKBOOK_VERSION,
    generatedAt,
    project: { id: project.id, name: project.name, revisionReference: project.updatedAt },
    documentControl: {
      documentId: packet.deliveryControl.documentId || `ATLAS-${project.id.toUpperCase()}`,
      revision: packet.deliveryControl.revision,
      intendedUse: packet.deliveryControl.intendedUse,
      recordedStatus: packet.deliveryControl.recordedStatus,
    },
    sourceVersions: { ...packet.sourceVersions, blueprintEngine: blueprint.engineVersion },
    status: requirements.length > 0 && blockers.length === 0 ? "ready-for-qualified-review" : "working-draft",
    requirements,
    blockers,
    controls: {
      vendorNeutral: true,
      selectsVendor: false,
      assertsProductEquivalence: false,
      approvedEngineeringSpecification: false,
      approvedUrs: false,
      supplierResponsesAreDeclarations: true,
      notice: "Controlled drafting basis only. Qualified users must resolve site evidence, approve the URS under their document-control system and evaluate supplier declarations; Atlas does not select a vendor or assert equivalence.",
    },
  });
}

export function validateQualityLabCommercialHandoffIntegrity(handoff: QualityLabCommercialHandoff, project: QualityLabProject): string[] {
  const errors: string[] = [];
  const requirementIds = new Set<string>();
  const lineageIds = new Set(project.blueprint.decisionLineage.map((item) => item.id));
  const methodRequirementIds = new Set(project.blueprint.methodRequirements.map((item) => item.id));
  const ruleVersions = new Map(project.blueprint.ruleTrace.map((item) => [item.ruleId, item.ruleVersion]));
  const evidenceVersions = new Map(project.blueprint.evidence.map((item) => [item.id, item.version]));
  for (const requirement of handoff.requirements) {
    if (requirementIds.has(requirement.requirementId)) errors.push(`Duplicate URS requirement ID: ${requirement.requirementId}`);
    requirementIds.add(requirement.requirementId);
    for (const id of requirement.decisionLineageIds) if (!lineageIds.has(id)) errors.push(`${requirement.requirementId} references unknown Decision Lineage ${id}`);
    for (const id of requirement.relatedMethodRequirementIds) if (!methodRequirementIds.has(id)) errors.push(`${requirement.requirementId} references unknown method requirement ${id}`);
    for (const ref of requirement.ruleRefs) {
      if (!ruleVersions.has(ref.id)) errors.push(`${requirement.requirementId} references unknown rule ${ref.id}`);
      else if (ruleVersions.get(ref.id) !== ref.version) errors.push(`${requirement.requirementId} references mismatched rule ${ref.id}@${ref.version}`);
    }
    for (const ref of requirement.evidenceRefs) {
      if (!evidenceVersions.has(ref.id)) errors.push(`${requirement.requirementId} references unknown evidence ${ref.id}`);
      else if (evidenceVersions.get(ref.id) !== ref.version) errors.push(`${requirement.requirementId} references mismatched evidence ${ref.id}@${ref.version}`);
    }
  }
  return errors;
}
