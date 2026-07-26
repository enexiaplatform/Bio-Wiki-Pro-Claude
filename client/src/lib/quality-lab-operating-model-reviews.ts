import type { QualityLabProject } from "@shared/quality-lab";
import type { QualityLabEngagementPacket } from "@shared/quality-lab-engagement";
import type { QualityLabOperatingModelInput } from "@shared/quality-lab-operating-model";
import {
  createQualityLabOperatingModelReviewDraft,
  createQualityLabOperatingModelReviewRegistry,
  createQualityLabOperatingModelReviewSnapshot,
  qualityLabOperatingModelReviewDraftSchema,
  qualityLabOperatingModelReviewSnapshotSchema,
  verifyQualityLabOperatingModelReviewSnapshot,
  type QualityLabOperatingModelReviewDraft,
  type QualityLabOperatingModelReviewSnapshot,
} from "@shared/quality-lab-operating-model-review";

const STORAGE_KEY = "lsa:quality-lab-operating-model-reviews:v1";

type ReviewStore = { drafts: Record<string, QualityLabOperatingModelReviewDraft>; snapshots: QualityLabOperatingModelReviewSnapshot[] };

function read(): ReviewStore {
  const empty: ReviewStore = { drafts: {}, snapshots: [] };
  if (typeof window === "undefined") return empty;
  try {
    const raw = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}");
    const drafts = Object.fromEntries(Object.entries(raw?.drafts ?? {}).flatMap(([id, value]) => {
      const parsed = qualityLabOperatingModelReviewDraftSchema.safeParse(value);
      return parsed.success ? [[id, parsed.data]] : [];
    }));
    const snapshots = Array.isArray(raw?.snapshots) ? raw.snapshots.flatMap((value: unknown) => {
      const parsed = qualityLabOperatingModelReviewSnapshotSchema.safeParse(value);
      if (!parsed.success) return [];
      try { return [verifyQualityLabOperatingModelReviewSnapshot(parsed.data)]; } catch { return []; }
    }) : [];
    return { drafts, snapshots };
  } catch {
    return empty;
  }
}

function write(store: ReviewStore) {
  if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function loadQualityLabOperatingModelReviewDraft(project: QualityLabProject, input: QualityLabOperatingModelInput) {
  return createQualityLabOperatingModelReviewDraft(project, input, read().drafts[project.id]);
}

export function saveQualityLabOperatingModelReviewDraft(draft: QualityLabOperatingModelReviewDraft) {
  const parsed = qualityLabOperatingModelReviewDraftSchema.parse({ ...draft, updatedAt: new Date().toISOString() });
  const store = read();
  write({ ...store, drafts: { ...store.drafts, [parsed.projectId]: parsed } });
  return parsed;
}

export function freezeQualityLabOperatingModelReview(
  project: QualityLabProject,
  input: QualityLabOperatingModelInput,
  engagement: QualityLabEngagementPacket,
  draft: QualityLabOperatingModelReviewDraft,
) {
  const snapshot = createQualityLabOperatingModelReviewSnapshot(project, input, engagement, draft);
  const store = read();
  const existing = store.snapshots.find((item) => item.snapshotId === snapshot.snapshotId);
  if (existing) return existing;
  write({ ...store, snapshots: [snapshot, ...store.snapshots] });
  return snapshot;
}

export function listQualityLabOperatingModelReviewSnapshots(projectId?: string) {
  return read().snapshots.filter((item) => !projectId || item.source.projectId === projectId).sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
}

export function downloadQualityLabOperatingModelReviewRegistry() {
  const registry = createQualityLabOperatingModelReviewRegistry(listQualityLabOperatingModelReviewSnapshots());
  const url = URL.createObjectURL(new Blob([JSON.stringify(registry, null, 2)], { type: "application/json" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "atlas-operating-model-review-registry.json";
  anchor.click();
  URL.revokeObjectURL(url);
}
