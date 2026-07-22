import { careerExecutionRecordSchema, formatCareerExecution, type CareerExecutionRecord } from "@shared/career-execution";

export const CAREER_EXECUTION_STORAGE_KEY = "lsa:career-blueprint-execution:v1";

export function loadCareerExecution(): CareerExecutionRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CAREER_EXECUTION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = careerExecutionRecordSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) throw new Error("Invalid Career Execution record");
    return parsed.data;
  } catch {
    window.localStorage.removeItem(CAREER_EXECUTION_STORAGE_KEY);
    return null;
  }
}

export function saveCareerExecution(record: CareerExecutionRecord): CareerExecutionRecord {
  const parsed = careerExecutionRecordSchema.parse({ ...record, updatedAt: new Date().toISOString() });
  window.localStorage.setItem(CAREER_EXECUTION_STORAGE_KEY, JSON.stringify(parsed));
  return parsed;
}

export function downloadCareerExecution(record: CareerExecutionRecord) {
  const blob = new Blob([formatCareerExecution(record)], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const safeName = record.profile.fullName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "personal";
  anchor.href = url;
  anchor.download = `${safeName}-career-execution-brief.md`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
