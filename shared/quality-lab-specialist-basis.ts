import { z } from "zod";
import { turnaroundFeasibilityInputSchema } from "./quality-lab-turnaround.js";
import { equipmentResilienceInputSchema } from "./quality-lab-equipment-resilience.js";
import { nonRoutineLoadInputSchema } from "./quality-lab-non-routine.js";
import { skillShiftFeasibilityInputSchema } from "./quality-lab-skill-coverage.js";
import { qualityLabOperatingModelInputSchema } from "./quality-lab-operating-model.js";

const metadata = {
  version: z.literal("quality-lab-specialist-basis/v1"),
  sourceBasisHash: z.string().regex(/^[a-f0-9]{64}$/),
  confirmedAt: z.string().datetime(),
  confirmation: z.literal("planning-assumptions-only"),
};
export const specialistBasisSchema = z.discriminatedUnion("kind", [
  z
    .object({
      ...metadata,
      kind: z.literal("operating-model"),
      input: qualityLabOperatingModelInputSchema.extend({
        applications:
          qualityLabOperatingModelInputSchema.shape.applications.max(100),
      }),
    })
    .strict(),
  z
    .object({
      ...metadata,
      kind: z.literal("turnaround"),
      input: turnaroundFeasibilityInputSchema,
    })
    .strict(),
  z
    .object({
      ...metadata,
      kind: z.literal("equipment-resilience"),
      input: equipmentResilienceInputSchema,
    })
    .strict(),
  z
    .object({
      ...metadata,
      kind: z.literal("non-routine-load"),
      input: nonRoutineLoadInputSchema,
    })
    .strict(),
  z
    .object({
      ...metadata,
      kind: z.literal("skill-shift-coverage"),
      input: skillShiftFeasibilityInputSchema,
    })
    .strict(),
]);
export type SpecialistBasis = z.infer<typeof specialistBasisSchema>;
export type SpecialistKind = SpecialistBasis["kind"];
