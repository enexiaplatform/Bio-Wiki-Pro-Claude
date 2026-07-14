import { z } from "zod";
import { expertOwnershipRegisterSchema } from "./quality-lab-expert-ownership";
import { sourceClosureRegisterSchema } from "./quality-lab-source-coverage";
import { ruleChangeRegisterSchema } from "./quality-lab-rule-changes";

export const qualityLabGovernanceKeySchema = z.enum(["expert-ownership", "source-closures", "rule-changes"]);
export type QualityLabGovernanceKey = z.infer<typeof qualityLabGovernanceKeySchema>;
export const qualityLabGovernanceSnapshotSchema = z.union([expertOwnershipRegisterSchema, sourceClosureRegisterSchema, ruleChangeRegisterSchema]);
export type QualityLabGovernanceSnapshot = z.infer<typeof qualityLabGovernanceSnapshotSchema>;

export interface QualityLabGovernanceChange { path: string; before: unknown; after: unknown }

function flatten(value: unknown, prefix = "", output = new Map<string, unknown>()) {
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) flatten(child, prefix ? `${prefix}.${key}` : key, output);
  } else output.set(prefix, value);
  return output;
}

export function compareQualityLabGovernanceSnapshots(before: QualityLabGovernanceSnapshot, after: QualityLabGovernanceSnapshot): QualityLabGovernanceChange[] {
  const left = flatten(before);
  const right = flatten(after);
  return Array.from(new Set([...Array.from(left.keys()), ...Array.from(right.keys())])).filter((path) => path !== "updatedAt" && JSON.stringify(left.get(path)) !== JSON.stringify(right.get(path))).sort().map((path) => ({ path, before: left.get(path), after: right.get(path) }));
}
