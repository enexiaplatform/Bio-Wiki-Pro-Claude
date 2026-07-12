import { z } from "zod";
import { qualityLabBlueprintSchema, qualityLabInputSchema } from "./quality-lab";
import { qualityLabEngagementPacketSchema } from "./quality-lab-engagement";

/**
 * A deliberately narrow server-side record. It is created only for an
 * authenticated review workflow; ordinary concept projects remain local.
 */
export const qualityLabReviewedProjectSnapshotSchema = z.object({
  localProjectId: z.string().min(1).max(160),
  projectName: z.string().min(1).max(200),
  input: qualityLabInputSchema,
  blueprint: qualityLabBlueprintSchema,
  engagement: qualityLabEngagementPacketSchema.nullable(),
  reviewRequestedAt: z.string().datetime().nullable(),
});

export type QualityLabReviewedProjectSnapshot = z.infer<typeof qualityLabReviewedProjectSnapshotSchema>;

export function compareQualityLabReviewedSnapshots(
  baseline: QualityLabReviewedProjectSnapshot,
  current: QualityLabReviewedProjectSnapshot,
) {
  const before = baseline.blueprint;
  const after = current.blueprint;
  return {
    baselineGeneratedAt: before.generatedAt,
    currentGeneratedAt: after.generatedAt,
    changes: [
      { metric: "Readiness", before: before.dataQuality.completenessPercent, after: after.dataQuality.completenessPercent, unit: "%" },
      { metric: "Blocking inputs", before: before.dataQuality.blockingOpenCount, after: after.dataQuality.blockingOpenCount, unit: "items" },
      { metric: "Important inputs", before: before.dataQuality.importantOpenCount, after: after.dataQuality.importantOpenCount, unit: "items" },
      { metric: "Monthly tests", before: before.current.monthlyTests, after: after.current.monthlyTests, unit: "tests/month" },
      { metric: "Team FTE", before: before.current.totalTeamFte, after: after.current.totalTeamFte, unit: "FTE" },
      { metric: "CAPEX high", before: before.current.capexHighUsd, after: after.current.capexHighUsd, unit: "USD" },
      { metric: "Method requirements", before: before.methodRequirements.length, after: after.methodRequirements.length, unit: "requirements" },
    ].map((item) => ({ ...item, delta: Math.round((item.after - item.before) * 100) / 100 })),
    notice: "Decision-impact comparison only. It does not establish method approval, regulatory compliance, or a controlled change-control assessment.",
  };
}
