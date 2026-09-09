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
export const nativeIntakeBasisSchema = z.object({
  version: z.literal("quality-lab-native-basis/v1"),
  format: z.enum(["xlsx", "pdf", "docx"]),
  operation: z.enum(["literal", "unique-markets", "distinct-products"]),
  units: z.array(z.object({
    locator: z.string().min(1).max(120),
    text: z.string().min(1).max(500),
    rawText: z.string().max(500).optional(),
    numberFormat: z.string().max(100).optional(),
  }).strict()).min(1).max(500),
}).strict();
export const intakeSourceSchema = z
  .object({
    fileName: z.string().min(1).max(180),
    fileSha256: z.string().regex(/^[a-f0-9]{64}$/),
    section: z.string().min(1).max(180),
    locator: z.string().min(1).max(120),
    text: z.string().max(500),
    context: z.string().max(500),
    method: z.enum(["csv-label-match/v1", "ai-csv-field-map/v1", "native-project-facts/v1", "ai-native-field-map/v1"]),
    confidence: z.enum(["label-match", "requires-review"]),
    nativeBasis: nativeIntakeBasisSchema.optional(),
  })
  .strict().superRefine((source, context) => {
    const native = source.method === "native-project-facts/v1" || source.method === "ai-native-field-map/v1";
    if (native !== Boolean(source.nativeBasis)) context.addIssue({ code: z.ZodIssueCode.custom, message: "Native extraction requires its versioned source basis." });
    if (!native && (source.section !== "CSV" || !/^[A-Z]{1,2}[1-9][0-9]{0,2}$/.test(source.locator))) context.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid CSV source locator." });
    if (source.nativeBasis && (new Set(source.nativeBasis.units.map(unit => unit.locator)).size !== source.nativeBasis.units.length)) context.addIssue({ code: z.ZodIssueCode.custom, message: "Source locators must be unique." });
  });
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
