import { z } from "zod";

export const INTAKE_FIELDS = {
  projectName: "Project name",
  country: "Facility country",
  markets: "Target markets",
  finishedProducts: "Finished product count",
  rawMaterials: "Raw material count",
  finishedBatchesPerMonth: "Finished batches per month",
  rawMaterialLotsPerMonth: "Raw material lots per month",
  waterPoints: "Water sampling points",
  waterRoundsPerWeek: "Water sampling rounds per week",
  emLocations: "Environmental monitoring locations",
  emRoundsPerWeek: "Environmental monitoring rounds per week",
  mediaLotsPerMonth: "Media lots per month",
  targetTurnaroundDays: "Target turnaround days",
  growthRatePercent: "Total growth over planning horizon percent",
  horizonYears: "Planning horizon years",
  workingDaysPerMonth: "Working days per month",
  shifts: "Shifts per day",
  productiveHoursPerShift: "Productive hours per shift",
  outsourcePercent: "Outsource percent",
  redundancyPercent: "People capacity reserve percent",
} as const;
export type IntakeField = keyof typeof INTAKE_FIELDS;
export const intakeFieldSchema = z.enum(
  Object.keys(INTAKE_FIELDS) as [IntakeField, ...IntakeField[]],
);
export const intakeValueSchema = z.union([
  z.number().finite(),
  z.string().max(120),
  z.array(z.string().max(40)).max(5),
]);
export const intakeSourceSchema = z
  .object({
    fileName: z.string().min(1).max(180),
    fileSha256: z.string().regex(/^[a-f0-9]{64}$/),
    section: z.literal("CSV"),
    locator: z.string().regex(/^[A-Z]{1,2}[1-9][0-9]{0,2}$/),
    text: z.string().max(500),
    context: z.string().max(500),
    method: z.enum(["csv-label-match/v1", "ai-csv-field-map/v1"]),
    confidence: z.enum(["label-match", "requires-review"]),
  })
  .strict();
export const intakeConfirmationSchema = z
  .object({
    version: z.literal("quality-lab-intake-confirmation/v1"),
    field: intakeFieldSchema,
    value: intakeValueSchema,
    source: intakeSourceSchema,
    confirmedAt: z.string().datetime(),
  })
  .strict();
export type IntakeConfirmation = z.infer<typeof intakeConfirmationSchema>;
export type IntakeSource = z.infer<typeof intakeSourceSchema>;
export type IntakeCandidate = {
  id: string;
  field: IntakeField;
  value: z.infer<typeof intakeValueSchema>;
  source: IntakeSource;
};
