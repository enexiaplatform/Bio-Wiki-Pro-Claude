import type { QualityLabInput, QualityLabProject, QualityLabProjectAction, QualityLabProjectOrigin } from "@shared/quality-lab";
import { compileQualityLabBlueprint, createQualityLabProject, createEmptyQualityLabEvidenceRegister, isIllustrativeQualityLabProject, qualityLabActionPlanSchema, qualityLabBlueprintSchema, qualityLabDecisionRegisterSchema, qualityLabInputSchema, reconcileQualityLabActionPlan, reconcileQualityLabDecisionRegister, validateQualityLabDecisionRecord, QualityLabDecisionValidationError, type QualityLabDecisionRecord, type QualityLabEvidenceRecord } from "@shared/quality-lab";
import { ensureQualityLabProjectHistory, freezeQualityLabProjectRevision, recompileQualityLabProject } from "@shared/quality-lab-revisions";
import { createQualityLabEngagementPacket } from "@shared/quality-lab-engagement";
import {
  createQualityLabAccountSnapshot,
  migrateQualityLabLocalStore,
  qualityLabProjectFromReviewedSnapshot,
  type QualityLabAccountProjectRecord,
  type QualityLabReviewedProjectSnapshot,
} from "@shared/quality-lab-persistence";

const LEGACY_STORAGE_KEY = "lsa:quality-lab-projects:v1";
const STORAGE_KEY = "lsa:quality-lab-projects:v2";
const PROJECTS_CHANGED_EVENT = "atlas:quality-lab-projects-changed";

function safeParse(values: unknown[]): QualityLabProject[] {
  return values.flatMap((value) => {
      const project = value as QualityLabProject;
      const parsed = qualityLabInputSchema.safeParse(project?.input);
      if (!project?.id || !parsed.success) return [];
      const storedBlueprint = qualityLabBlueprintSchema.safeParse(project.blueprint);
      const blueprint = storedBlueprint.success ? storedBlueprint.data : compileQualityLabBlueprint(parsed.data);
      const storedActionPlan = qualityLabActionPlanSchema.safeParse(project.actionPlan);
      const actionPlan = storedActionPlan.success ? storedActionPlan.data : reconcileQualityLabActionPlan(blueprint, undefined, blueprint.generatedAt);
      const storedDecisionRegister = qualityLabDecisionRegisterSchema.safeParse(project.decisionRegister);
      const decisionRegister = storedDecisionRegister.success ? storedDecisionRegister.data : reconcileQualityLabDecisionRegister(blueprint, actionPlan, undefined, blueprint.generatedAt);
      return [ensureQualityLabProjectHistory({
        ...project,
        name: parsed.data.projectName,
        input: parsed.data,
        blueprint,
        actionPlan,
        decisionRegister,
        evidenceRegister: project.evidenceRegister ?? createEmptyQualityLabEvidenceRegister(project.updatedAt ?? blueprint.generatedAt),
      })];
    });
}

export function listQualityLabProjects(): QualityLabProject[] {
  if (typeof window === "undefined") return [];
  const store = migrateQualityLabLocalStore(window.localStorage.getItem(STORAGE_KEY), window.localStorage.getItem(LEGACY_STORAGE_KEY));
  if (!window.localStorage.getItem(STORAGE_KEY)) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  return safeParse(store.projects)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function write(projects: QualityLabProject[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
    version: "quality-lab-local-store/v2",
    migratedFrom: window.localStorage.getItem(LEGACY_STORAGE_KEY) ? LEGACY_STORAGE_KEY : null,
    projects,
  }));
  window.dispatchEvent(new Event(PROJECTS_CHANGED_EVENT));
}

export function getQualityLabProject(id: string): QualityLabProject | undefined {
  return listQualityLabProjects().find((project) => project.id === id);
}

export function saveQualityLabProject(input: QualityLabInput, id?: string, origin: QualityLabProjectOrigin = "user-entered"): QualityLabProject {
  const projects = listQualityLabProjects();
  const existing = id ? projects.find((project) => project.id === id) : undefined;
  const project = existing
    ? recompileQualityLabProject(existing, input)
    : (() => {
        const created = { ...createQualityLabProject(input, undefined, origin), evidenceRegister: createEmptyQualityLabEvidenceRegister() };
        const revision = freezeQualityLabProjectRevision(created, 1, created.updatedAt);
        return { ...created, revisions: [revision], activeRevisionId: revision.revisionId };
      })();
  write([project, ...projects.filter((item) => item.id !== project.id)]);
  return project;
}

export function duplicateQualityLabProject(id: string, scenarioLabel?: string): QualityLabProject | undefined {
  const source = getQualityLabProject(id);
  if (!source) return undefined;
  const label = scenarioLabel?.trim() || `${source.input.scenarioLabel} - alternative`;
  return saveQualityLabProject({
    ...source.input,
    scenarioLabel: label,
  }, undefined, source.origin ?? "user-entered");
}

/** Restores an account-held review snapshot into this browser without re-syncing it. */
export function restoreQualityLabReviewedProject(snapshot: QualityLabReviewedProjectSnapshot): QualityLabProject {
  const project = qualityLabProjectFromReviewedSnapshot(snapshot);
  const projects = listQualityLabProjects();
  write([project, ...projects.filter((item) => item.id !== project.id)]);
  return project;
}

export type QualityLabProjectActionPatch = Partial<Pick<QualityLabProjectAction, "ownerRole" | "dueDate" | "evidenceNote" | "status">>;

export function updateQualityLabProjectAction(projectId: string, actionId: string, patch: QualityLabProjectActionPatch): QualityLabProject | undefined {
  const projects = listQualityLabProjects();
  const project = projects.find((item) => item.id === projectId);
  const action = project?.actionPlan.actions.find((item) => item.id === actionId);
  if (!project || !action) return undefined;
  const now = new Date().toISOString();
  const changedFields = (Object.keys(patch) as Array<keyof QualityLabProjectActionPatch>)
    .filter((key) => patch[key] !== undefined && patch[key] !== action[key]);
  if (changedFields.length === 0) return project;
  const summary = changedFields.includes("status")
    ? `Action status changed to ${(patch.status ?? action.status).replaceAll("-", " ")}.`
    : `Action ${changedFields.join(", ")} updated.`;
  const updatedAction: QualityLabProjectAction = {
    ...action,
    ...patch,
    updatedAt: now,
    activity: [...action.activity, { id: `${action.id}:updated:${now}`, recordedAt: now, type: "updated", summary }],
  };
  const updated: QualityLabProject = {
    ...project,
    updatedAt: now,
    actionPlan: {
      ...project.actionPlan,
      updatedAt: now,
      actions: project.actionPlan.actions.map((item) => item.id === actionId ? updatedAction : item),
    },
  };
  updated.decisionRegister = reconcileQualityLabDecisionRegister(updated.blueprint, updated.actionPlan, updated.decisionRegister, now);
  write([updated, ...projects.filter((item) => item.id !== projectId)]);
  return updated;
}

export type QualityLabDecisionPatch = Partial<Pick<QualityLabDecisionRecord, "ownerRole" | "targetDate" | "status" | "alternative" | "finalDisposition" | "decidedAt" | "outcome">>;

export function updateQualityLabProjectDecision(projectId: string, decisionId: string, patch: QualityLabDecisionPatch): QualityLabProject | undefined {
  const projects = listQualityLabProjects();
  const project = projects.find((item) => item.id === projectId);
  const decision = project?.decisionRegister.decisions.find((item) => item.id === decisionId);
  if (!project || !decision) return undefined;
  const now = new Date().toISOString();
  const outcomeChanged = patch.outcome !== undefined && JSON.stringify(patch.outcome) !== JSON.stringify(decision.outcome);
  const dispositionChanged = patch.finalDisposition !== undefined && patch.finalDisposition !== decision.finalDisposition;
  const changed = Object.entries(patch).some(([key, value]) => JSON.stringify(value) !== JSON.stringify(decision[key as keyof QualityLabDecisionRecord]));
  if (!changed) return project;
  const type = outcomeChanged ? "outcome-recorded" as const : dispositionChanged ? "disposition-recorded" as const : "updated" as const;
  const summary = outcomeChanged ? "Observed outcome or learning status updated." : dispositionChanged ? "Final disposition updated." : "Decision owner, timing, status or alternative updated.";
  const updatedDecision: QualityLabDecisionRecord = {
    ...decision,
    ...patch,
    decidedAt: patch.decidedAt ?? decision.decidedAt,
    updatedAt: now,
    activity: [...decision.activity, { id: `${decision.id}:${type}:${now}`, recordedAt: now, type, summary }],
  };
  const validationErrors = validateQualityLabDecisionRecord(updatedDecision);
  if (validationErrors.length > 0) throw new QualityLabDecisionValidationError(validationErrors);
  const updated: QualityLabProject = {
    ...project,
    updatedAt: now,
    decisionRegister: {
      ...project.decisionRegister,
      updatedAt: now,
      decisions: project.decisionRegister.decisions.map((item) => item.id === decisionId ? updatedDecision : item),
    },
  };
  write([updated, ...projects.filter((item) => item.id !== projectId)]);
  return updated;
}

export type QualityLabEvidenceRecordInput = Omit<QualityLabEvidenceRecord, "contractVersion" | "id" | "projectId" | "createdAt" | "updatedAt" | "confirmedByUser" | "confirmedAt">;

export function addQualityLabProjectEvidence(projectId: string, input: QualityLabEvidenceRecordInput): QualityLabProject | undefined {
  const projects = listQualityLabProjects();
  const project = projects.find((item) => item.id === projectId);
  if (!project) return undefined;
  const now = new Date().toISOString();
  const record: QualityLabEvidenceRecord = {
    ...input,
    contractVersion: "quality-lab-evidence-record/v1",
    id: `qle_${Date.now().toString(36)}`,
    projectId,
    status: input.status === "confirmed" ? "candidate" : input.status,
    confirmedByUser: false,
    confirmedAt: null,
    createdAt: now,
    updatedAt: now,
  };
  const register = project.evidenceRegister ?? createEmptyQualityLabEvidenceRegister(now);
  const updated = { ...project, updatedAt: now, evidenceRegister: { ...register, updatedAt: now, records: [...register.records, record] } };
  write([updated, ...projects.filter((item) => item.id !== projectId)]);
  return updated;
}

export function confirmQualityLabProjectEvidence(projectId: string, evidenceId: string): QualityLabProject | undefined {
  const projects = listQualityLabProjects();
  const project = projects.find((item) => item.id === projectId);
  const register = project?.evidenceRegister;
  if (!project || !register?.records.some((record) => record.id === evidenceId)) return undefined;
  const now = new Date().toISOString();
  const updated = {
    ...project,
    updatedAt: now,
    evidenceRegister: {
      ...register,
      updatedAt: now,
      records: register.records.map((record) => record.id === evidenceId ? { ...record, status: "confirmed" as const, confirmedByUser: true, confirmedAt: now, updatedAt: now } : record),
    },
  };
  write([updated, ...projects.filter((item) => item.id !== projectId)]);
  return updated;
}

export function deleteQualityLabProject(id: string) {
  write(listQualityLabProjects().filter((project) => project.id !== id));
}

export function markQualityLabReviewRequested(id: string): QualityLabProject | undefined {
  const projects = listQualityLabProjects();
  const project = projects.find((item) => item.id === id);
  if (!project || isIllustrativeQualityLabProject(project)) return undefined;
  const now = new Date().toISOString();
  const updated = { ...project, reviewRequestedAt: now, updatedAt: now };
  write([updated, ...projects.filter((item) => item.id !== id)]);
  return updated;
}

export function exportQualityLabProject(project: QualityLabProject) {
  const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${project.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "quality-lab-blueprint"}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function exportQualityLabEngagementPacket(project: QualityLabProject) {
  const packet = createQualityLabEngagementPacket(project);
  const blob = new Blob([JSON.stringify(packet, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${project.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "quality-lab"}-engagement-packet.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function syncQualityLabReviewedProject(project: QualityLabProject, engagement = createQualityLabEngagementPacket(project)) {
  if (isIllustrativeQualityLabProject(project)) throw new Error("Illustrative examples cannot be attached to expert review.");
  if (!project.reviewRequestedAt) throw new Error("Only requested-review projects may be synced");
  const snapshot = createQualityLabAccountSnapshot(project, engagement);
  const response = await fetch(`/api/quality-lab/reviewed-projects/${encodeURIComponent(project.id)}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify(snapshot),
  });
  if (!response.ok) throw new Error("Unable to securely save this review project");
  return response.json() as Promise<{ localProjectId: string; projectName: string; updatedAt: string }>;
}

export async function fetchQualityLabReviewedProject(localProjectId: string) {
  const response = await fetch(`/api/quality-lab/reviewed-projects/${encodeURIComponent(localProjectId)}`, { credentials: "include" });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Unable to recover this reviewed project");
  return response.json() as Promise<QualityLabReviewedProjectSnapshot>;
}

export async function fetchQualityLabReviewedProjects() {
  const response = await fetch("/api/quality-lab/reviewed-projects", { credentials: "include" });
  if (!response.ok) throw new Error("Unable to load the reviewed-project portfolio");
  return response.json() as Promise<QualityLabReviewedProjectSnapshot[]>;
}

export async function deleteQualityLabReviewedProjectSnapshot(localProjectId: string) {
  const response = await fetch(`/api/quality-lab/reviewed-projects/${encodeURIComponent(localProjectId)}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Unable to remove the account-held review snapshot");
}

export async function fetchQualityLabReviewedProjectRevisions(localProjectId: string) {
  const response = await fetch(`/api/quality-lab/reviewed-projects/${encodeURIComponent(localProjectId)}/revisions`, { credentials: "include" });
  if (!response.ok) return [] as Array<{ revisionNumber: number; createdAt: string; blockingOpenCount: number }>;
  return response.json() as Promise<Array<{ revisionNumber: number; createdAt: string; blockingOpenCount: number }>>;
}

export type QualityLabDeliveryArtifact = "workbook" | "brief" | "urs" | "rfq";

export async function downloadQualityLabDeliveryArtifact(localProjectId: string, artifact: QualityLabDeliveryArtifact) {
  const suffix = artifact === "workbook" ? "delivery-workbook" : artifact === "brief" ? "delivery-brief.pdf" : artifact === "urs" ? "urs-document.docx" : "rfq-workbook";
  const response = await fetch(`/api/quality-lab/reviewed-projects/${encodeURIComponent(localProjectId)}/${suffix}`, { credentials: "include" });
  if (!response.ok) {
    const message = await response.json().then((value) => value?.message).catch(() => null);
    throw new Error(message || "Unable to prepare the Blueprint delivery file");
  }
  const disposition = response.headers.get("content-disposition") ?? "";
  const fallback = { workbook: "atlas-blueprint-delivery.xlsx", brief: "atlas-blueprint-decision-brief.pdf", urs: "atlas-vendor-neutral-urs.docx", rfq: "atlas-rfq-comparison.xlsx" }[artifact];
  const filename = disposition.match(/filename="([^"]+)"/)?.[1] ?? fallback;
  const url = URL.createObjectURL(await response.blob());
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function subscribeToQualityLabProjects(listener: () => void) {
  const handler = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", handler);
  window.addEventListener(PROJECTS_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(PROJECTS_CHANGED_EVENT, listener);
  };
}

export class QualityLabSyncConflictError extends Error {
  constructor(public readonly current: QualityLabAccountProjectRecord) {
    super("This project changed in another browser. The local copy was not overwritten.");
    this.name = "QualityLabSyncConflictError";
  }
}

type QualityLabApiErrorBody = { message?: string; code?: string; requestId?: string };

export class QualityLabSyncRequestError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly requestId?: string,
    public readonly retryable = false,
  ) {
    super(message);
    this.name = "QualityLabSyncRequestError";
  }
}

export async function fetchQualityLabAccountProjects() {
  const response = await fetch("/api/quality-lab/projects", { credentials: "include" });
  if (!response.ok) throw new Error("Unable to load account-held Quality Lab projects");
  return response.json() as Promise<QualityLabAccountProjectRecord[]>;
}

export async function syncQualityLabAccountProject(project: QualityLabProject, expectedUpdatedAt: string | null) {
  if (isIllustrativeQualityLabProject(project)) throw new Error("Illustrative examples stay browser-local and cannot be saved to an account.");
  const response = await fetch(`/api/quality-lab/projects/${encodeURIComponent(project.id)}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ snapshot: createQualityLabAccountSnapshot(project), expectedUpdatedAt }),
  });
  if (response.status === 409) {
    const current = await response.json() as QualityLabAccountProjectRecord;
    throw new QualityLabSyncConflictError(current);
  }
  if (!response.ok) {
    const error = await response.json().catch(() => ({})) as QualityLabApiErrorBody;
    if (response.status === 413 || error.code === "PAYLOAD_TOO_LARGE") {
      throw new QualityLabSyncRequestError(
        "This Blueprint is too large to sync. Your browser copy is safe; export it and contact support with the request ID.",
        "PAYLOAD_TOO_LARGE",
        error.requestId,
      );
    }
    const retryable = response.status === 408 || response.status === 425 || response.status === 429 || response.status >= 500;
    throw new QualityLabSyncRequestError(
      retryable
        ? "Account sync is temporarily unavailable. Your browser copy is safe; please retry."
        : error.message ?? "Unable to save this project to the account",
      error.code ?? (retryable ? "TEMPORARY_FAILURE" : "SYNC_FAILED"),
      error.requestId,
      retryable,
    );
  }
  return response.json() as Promise<QualityLabAccountProjectRecord>;
}

export async function deleteQualityLabAccountProject(localProjectId: string) {
  const response = await fetch(`/api/quality-lab/projects/${encodeURIComponent(localProjectId)}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Unable to remove the account-held project");
}

export async function fetchQualityLabAccountProjectRevisions(localProjectId: string) {
  const response = await fetch(`/api/quality-lab/projects/${encodeURIComponent(localProjectId)}/revisions`, { credentials: "include" });
  if (!response.ok) return [] as Array<{ revisionNumber: number; createdAt: string; blockingOpenCount: number }>;
  return response.json() as Promise<Array<{ revisionNumber: number; createdAt: string; blockingOpenCount: number }>>;
}

export async function fetchQualityLabAccountProjectRevision(localProjectId: string, revisionNumber: number) {
  const response = await fetch(`/api/quality-lab/projects/${encodeURIComponent(localProjectId)}/revisions/${revisionNumber}`, { credentials: "include" });
  if (!response.ok) throw new Error("Unable to load this account revision");
  return response.json() as Promise<{
    revisionNumber: number;
    reason: string;
    createdAt: string;
    snapshot: QualityLabReviewedProjectSnapshot;
  }>;
}

export type QualityLabReminderCadence = "off" | "weekly" | "daily" | "weekdays";

export async function fetchQualityLabReminderPreference() {
  const response = await fetch("/api/quality-lab/reminder-preference", { credentials: "include" });
  if (!response.ok) throw new Error("Unable to load the reminder preference");
  return response.json() as Promise<{ cadence: QualityLabReminderCadence; updatedAt: string | null }>;
}

export async function saveQualityLabReminderPreference(cadence: QualityLabReminderCadence) {
  const response = await fetch("/api/quality-lab/reminder-preference", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ cadence }),
  });
  if (!response.ok) throw new Error("Unable to save the reminder preference");
  return response.json() as Promise<{ cadence: QualityLabReminderCadence; updatedAt: string | null }>;
}
