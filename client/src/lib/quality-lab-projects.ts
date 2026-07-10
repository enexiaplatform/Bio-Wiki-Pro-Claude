import type { QualityLabInput, QualityLabProject } from "@shared/quality-lab";
import { compileQualityLabBlueprint, createQualityLabProject, qualityLabInputSchema } from "@shared/quality-lab";

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

export function exportQualityLabProject(project: QualityLabProject) {
  const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${project.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "quality-lab-blueprint"}.json`;
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
