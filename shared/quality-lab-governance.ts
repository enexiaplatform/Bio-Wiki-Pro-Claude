import { z } from "zod";
import { expertOwnershipRegisterSchema } from "./quality-lab-expert-ownership";
import { sourceClosureRegisterSchema } from "./quality-lab-source-coverage";

export const qualityLabGovernanceKeySchema = z.enum(["expert-ownership", "source-closures"]);
export type QualityLabGovernanceKey = z.infer<typeof qualityLabGovernanceKeySchema>;
export const qualityLabGovernanceSnapshotSchema = z.union([expertOwnershipRegisterSchema, sourceClosureRegisterSchema]);
export type QualityLabGovernanceSnapshot = z.infer<typeof qualityLabGovernanceSnapshotSchema>;
