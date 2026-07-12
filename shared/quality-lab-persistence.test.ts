import { describe, expect, it } from "vitest";
import { createQualityLabProject, defaultQualityLabInput } from "./quality-lab";
import { createQualityLabEngagementPacket } from "./quality-lab-engagement";
import { compareQualityLabReviewedSnapshots, qualityLabReviewedProjectSnapshotSchema } from "./quality-lab-persistence";

describe("reviewed Blueprint persistence contract", () => {
  it("accepts a complete review snapshot without adding contact data", () => {
    const project = createQualityLabProject(defaultQualityLabInput, "qlp_persisted");
    const snapshot = {
      localProjectId: project.id,
      projectName: project.name,
      input: project.input,
      blueprint: project.blueprint,
      engagement: createQualityLabEngagementPacket(project, "2026-07-11T00:00:00.000Z"),
      reviewRequestedAt: "2026-07-11T00:00:00.000Z",
    };
    expect(qualityLabReviewedProjectSnapshotSchema.safeParse(snapshot).success).toBe(true);
  });

  it("compares decision-impact metrics without asserting controlled approval", () => {
    const project = createQualityLabProject(defaultQualityLabInput, "qlp_compare");
    const baseline = { localProjectId: project.id, projectName: project.name, input: project.input, blueprint: project.blueprint, engagement: null, reviewRequestedAt: "2026-07-11T00:00:00.000Z" };
    const laterProject = createQualityLabProject({ ...defaultQualityLabInput, finishedBatchesPerMonth: 60 }, "qlp_compare");
    const current = { ...baseline, input: laterProject.input, blueprint: laterProject.blueprint };
    const comparison = compareQualityLabReviewedSnapshots(baseline, current);
    expect(comparison.changes.find((item) => item.metric === "Monthly tests")?.delta).toBeGreaterThan(0);
    expect(comparison.notice).toContain("does not establish");
  });
});
