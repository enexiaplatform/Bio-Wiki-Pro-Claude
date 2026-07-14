import type { QualityLabInput, QualityLabProject } from "@shared/quality-lab";
import { compileQualityLabBlueprint, createQualityLabProject, qualityLabInputSchema } from "@shared/quality-lab";
import { createQualityLabEngagementPacket } from "@shared/quality-lab-engagement";

const STORAGE_KEY = "lsa:quality-lab-projects:v1";

function safeParse(raw: string | null): QualityLabProject[] {
  if (!raw) return [];
  try {
    const values = JSON.parse(raw) as QualityLabProject[];
    if (!Array.isArray(values)) return [];
    return values.flatMap((project) => {
      const parsed = qualityLabInputSchema.safeParse(project?.input);
      if (!project?.id || !parsed.success) return [];
      return [{
        ...project,
        name: parsed.data.projectName,
        input: parsed.data,
        blueprint: compileQualityLabBlueprint(parsed.data),
      }];
    });
  } catch {
    return [];
  }
}

export function listQualityLabProjects(): QualityLabProject[] {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(STORAGE_KEY))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function write(projects: QualityLabProject[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function getQualityLabProject(id: string): QualityLabProject | undefined {
  return listQualityLabProjects().find((project) => project.id === id);
}

export function saveQualityLabProject(input: QualityLabInput, id?: string): QualityLabProject {
  const projects = listQualityLabProjects();
  const existing = id ? projects.find((project) => project.id === id) : undefined;
  const project = existing
    ? {
        ...existing,
        name: input.projectName,
        input: qualityLabInputSchema.parse(input),
        blueprint: compileQualityLabBlueprint(input),
        updatedAt: new Date().toISOString(),
      }
    : createQualityLabProject(input);
  write([project, ...projects.filter((item) => item.id !== project.id)]);
  return project;
}

export function duplicateQualityLabProject(id: string): QualityLabProject | undefined {
  const source = getQualityLabProject(id);
  if (!source) return undefined;
  return saveQualityLabProject({
    ...source.input,
    projectName: `${source.input.projectName} — copy`,
  });
}

export function deleteQualityLabProject(id: string) {
  write(listQualityLabProjects().filter((project) => project.id !== id));
}

export function markQualityLabReviewRequested(id: string): QualityLabProject | undefined {
  const projects = listQualityLabProjects();
  const project = projects.find((item) => item.id === id);
  if (!project) return undefined;
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
  if (!project.reviewRequestedAt) throw new Error("Only requested-review projects may be synced");
  const response = await fetch(`/api/quality-lab/reviewed-projects/${encodeURIComponent(project.id)}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      localProjectId: project.id,
      projectName: project.name,
      input: project.input,
      blueprint: project.blueprint,
      engagement,
      reviewRequestedAt: project.reviewRequestedAt,
    }),
  });
  if (!response.ok) throw new Error("Unable to securely save this review project");
  return response.json() as Promise<{ localProjectId: string; projectName: string; updatedAt: string }>;
}

export async function fetchQualityLabReviewedProject(localProjectId: string) {
  const response = await fetch(`/api/quality-lab/reviewed-projects/${encodeURIComponent(localProjectId)}`, { credentials: "include" });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Unable to recover this reviewed project");
  return response.json() as Promise<{
    localProjectId: string;
    projectName: string;
    input: QualityLabProject["input"];
    blueprint: QualityLabProject["blueprint"];
    engagement: ReturnType<typeof createQualityLabEngagementPacket> | null;
    reviewRequestedAt: string | null;
  }>;
}

export async function fetchQualityLabReviewedProjects() {
  const response = await fetch("/api/quality-lab/reviewed-projects", { credentials: "include" });
  if (!response.ok) throw new Error("Unable to load the reviewed-project portfolio");
  return response.json() as Promise<Array<{
    localProjectId: string;
    projectName: string;
    input: QualityLabProject["input"];
    blueprint: QualityLabProject["blueprint"];
    engagement: ReturnType<typeof createQualityLabEngagementPacket> | null;
    reviewRequestedAt: string | null;
  }>>;
}

export async function fetchQualityLabReviewedProjectRevisions(localProjectId: string) {
  const response = await fetch(`/api/quality-lab/reviewed-projects/${encodeURIComponent(localProjectId)}/revisions`, { credentials: "include" });
  if (!response.ok) return [] as Array<{ revisionNumber: number; createdAt: string; blockingOpenCount: number }>;
  return response.json() as Promise<Array<{ revisionNumber: number; createdAt: string; blockingOpenCount: number }>>;
}

export async function downloadQualityLabDeliveryArtifact(localProjectId: string, artifact: "workbook" | "brief") {
  const suffix = artifact === "workbook" ? "delivery-workbook" : "delivery-brief.pdf";
  const response = await fetch(`/api/quality-lab/reviewed-projects/${encodeURIComponent(localProjectId)}/${suffix}`, { credentials: "include" });
  if (!response.ok) {
    const message = await response.json().then((value) => value?.message).catch(() => null);
    throw new Error(message || "Unable to prepare the Blueprint delivery file");
  }
  const disposition = response.headers.get("content-disposition") ?? "";
  const filename = disposition.match(/filename="([^"]+)"/)?.[1] ?? (artifact === "workbook" ? "atlas-blueprint-delivery.xlsx" : "atlas-blueprint-decision-brief.pdf");
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
  return () => window.removeEventListener("storage", handler);
}
