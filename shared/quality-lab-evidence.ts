import { z } from "zod";

export const QUALITY_LAB_EVIDENCE_RECORD_VERSION = "quality-lab-evidence-record/v1" as const;
export const QUALITY_LAB_EVIDENCE_REGISTER_VERSION = "quality-lab-evidence-register/v1" as const;

export const qualityLabEvidenceStatusSchema = z.enum([
  "candidate",
  "confirmed",
  "needs-review",
  "superseded",
  "expired",
  "rejected",
]);

export const qualityLabEvidenceTypeSchema = z.enum([
  "product-portfolio",
  "approved-method",
  "sop",
  "production-forecast",
  "equipment-master",
  "vendor-quotation",
  "facility-constraint",
  "cost-basis",
  "supplier-record",
  "qualification-record",
  "governance-record",
  "outcome-evidence",
  "other",
]);
export type QualityLabEvidenceType = z.infer<typeof qualityLabEvidenceTypeSchema>;

export const qualityLabEvidenceRecordSchema = z.object({
  contractVersion: z.literal(QUALITY_LAB_EVIDENCE_RECORD_VERSION),
  id: z.string().min(1),
  projectId: z.string().min(1),
  title: z.string().min(1).max(240),
  evidenceType: qualityLabEvidenceTypeSchema,
  sourceType: z.enum(["client-record", "external-reference", "atlas-output", "other"]),
  sourceReference: z.string().max(1000),
  documentDate: z.string(),
  versionOrRevision: z.string().max(160),
  status: qualityLabEvidenceStatusSchema,
  confirmedByUser: z.boolean(),
  confirmedAt: z.string().datetime().nullable(),
  relatedDecisionIds: z.array(z.string()),
  relatedActionIds: z.array(z.string()),
  relatedRuleIds: z.array(z.string()),
  relatedMethodIds: z.array(z.string()),
  notes: z.string().max(2000),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type QualityLabEvidenceRecord = z.infer<typeof qualityLabEvidenceRecordSchema>;

export const qualityLabEvidenceRegisterSchema = z.object({
  contractVersion: z.literal(QUALITY_LAB_EVIDENCE_REGISTER_VERSION),
  updatedAt: z.string().datetime(),
  records: z.array(qualityLabEvidenceRecordSchema),
});

export type QualityLabEvidenceRegister = z.infer<typeof qualityLabEvidenceRegisterSchema>;

export function createEmptyQualityLabEvidenceRegister(now = new Date().toISOString()): QualityLabEvidenceRegister {
  return { contractVersion: QUALITY_LAB_EVIDENCE_REGISTER_VERSION, updatedAt: now, records: [] };
}

export function isConfirmedQualityLabEvidence(record: QualityLabEvidenceRecord) {
  return record.status === "confirmed" && record.confirmedByUser && Boolean(record.confirmedAt);
}

export function validateQualityLabEvidenceRecord(record: QualityLabEvidenceRecord): string[] {
  const errors: string[] = [];
  if (record.status === "confirmed" && (!record.confirmedByUser || !record.confirmedAt)) {
    errors.push("Confirmed evidence requires explicit user confirmation and a confirmation timestamp.");
  }
  if (record.status !== "confirmed" && record.confirmedByUser) {
    errors.push("Only evidence with confirmed status may be treated as confirmed.");
  }
  return errors;
}
