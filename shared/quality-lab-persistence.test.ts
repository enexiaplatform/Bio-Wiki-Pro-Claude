import { describe, expect, it } from "vitest";
import { createQualityLabProject, defaultQualityLabInput } from "./quality-lab";
import { createQualityLabEngagementPacket } from "./quality-lab-engagement";
import {
  QUALITY_LAB_ACCOUNT_SNAPSHOT_VERSION,
  QUALITY_LAB_V2_ACCOUNT_SNAPSHOT_VERSION,
  QUALITY_LAB_LOCAL_STORE_VERSION,
  compareQualityLabReviewedSnapshots,
  createQualityLabAccountSnapshot,
  compactQualityLabAccountSnapshot,
  migrateQualityLabLocalStore,
  qualityLabReviewedProjectSnapshotSchema,
  qualityLabSyncHasConflict,
} from "./quality-lab-persistence";
import { recompileQualityLabProject } from "./quality-lab-revisions";

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

  it("creates a versioned account snapshot for a concept without implying a review", () => {
    const project = createQualityLabProject(defaultQualityLabInput, "qlp_account_copy");
    const snapshot = createQualityLabAccountSnapshot(project);
    expect(snapshot.snapshotVersion).toBe(QUALITY_LAB_ACCOUNT_SNAPSHOT_VERSION);
    expect(snapshot.reviewRequestedAt).toBeNull();
    expect(snapshot.workspace?.projectStatus).toBe("concept");
    expect(snapshot.workspace?.evidenceRequestIds).toEqual(project.blueprint.unresolvedInputs.map((item) => item.id));
    expect(snapshot.frozenRevisions).toHaveLength(1);
    expect(snapshot.frozenRevisions?.[0].revisionId).toBe(snapshot.activeRevisionId);
  });

  it("keeps the account sync payload bounded after twenty recompiles", () => {
    let project = createQualityLabProject(defaultQualityLabInput, "qlp_bounded_sync");
    for (let revision = 2; revision <= 20; revision += 1) {
      project = recompileQualityLabProject(
        project,
        { ...project.input, finishedBatchesPerMonth: project.input.finishedBatchesPerMonth + 1 },
        `2026-07-${String(revision).padStart(2, "0")}T00:00:00.000Z`,
      );
    }

    const snapshot = createQualityLabAccountSnapshot(project);
    expect(project.revisions).toHaveLength(20);
    expect(snapshot.frozenRevisions).toHaveLength(1);
    expect(snapshot.frozenRevisions?.[0].revisionNumber).toBe(20);
    expect(Buffer.byteLength(JSON.stringify({ snapshot, expectedUpdatedAt: null }), "utf8")).toBeLessThan(512 * 1024);
  });

  it("reads a cumulative v2 snapshot and compacts it on the next save", () => {
    const first = createQualityLabProject(defaultQualityLabInput, "qlp_v2_compaction");
    const project = recompileQualityLabProject(first, { ...first.input, finishedBatchesPerMonth: 48 }, "2026-07-20T00:00:00.000Z");
    const current = createQualityLabAccountSnapshot(project);
    const legacyV2 = {
      ...current,
      snapshotVersion: QUALITY_LAB_V2_ACCOUNT_SNAPSHOT_VERSION,
      frozenRevisions: project.revisions,
    };

    expect(qualityLabReviewedProjectSnapshotSchema.safeParse(legacyV2).success).toBe(true);
    const compacted = compactQualityLabAccountSnapshot(legacyV2);
    expect(compacted.snapshotVersion).toBe(QUALITY_LAB_ACCOUNT_SNAPSHOT_VERSION);
    expect(compacted.frozenRevisions).toHaveLength(1);
    expect(compacted.activeRevisionId).toBe(project.activeRevisionId);
    expect(compacted.frozenRevisions?.[0].provenanceStatus).toBe(project.revisions?.[1].provenanceStatus);
  });

  it("migrates the v1 browser array into a versioned envelope without deleting the source", () => {
    const project = createQualityLabProject(defaultQualityLabInput, "qlp_legacy_local");
    const migrated = migrateQualityLabLocalStore(null, JSON.stringify([project]));
    expect(migrated.version).toBe(QUALITY_LAB_LOCAL_STORE_VERSION);
    expect(migrated.migratedFrom).toBe("lsa:quality-lab-projects:v1");
    expect(migrated.projects).toHaveLength(1);
  });

  it("detects stale account writes while accepting a matching revision token", () => {
    const current = "2026-07-26T09:00:00.000Z";
    expect(qualityLabSyncHasConflict(null, null)).toBe(false);
    expect(qualityLabSyncHasConflict(current, current)).toBe(false);
    expect(qualityLabSyncHasConflict("2026-07-25T09:00:00.000Z", current)).toBe(true);
  });
});
