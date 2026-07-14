import {
  applySourceClosureRegister,
  createSourceClosureRegister,
  sourceClosureRegisterSchema,
  type EvidenceClosureRecord,
  type SourceClosureRegister,
} from "@shared/quality-lab-source-coverage";

export const SOURCE_CLOSURE_STORAGE_KEY = "lsa:quality-lab-source-closures:v1";

export function loadSourceClosureRegister(): SourceClosureRegister | null {
  if (typeof window === "undefined") return null;
  try {
    const parsed = sourceClosureRegisterSchema.safeParse(JSON.parse(window.localStorage.getItem(SOURCE_CLOSURE_STORAGE_KEY) ?? "null"));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function loadSourceClosures(domainPack: { id: string; version: string }) {
  const register = loadSourceClosureRegister();
  return register ? applySourceClosureRegister({ domainPack, register }) : { closures: [] as EvidenceClosureRecord[], applied: false as const, reason: null };
}

export function saveSourceClosures(domainPack: { id: string; version: string }, closures: EvidenceClosureRecord[]) {
  const register = createSourceClosureRegister({ domainPack, closures });
  window.localStorage.setItem(SOURCE_CLOSURE_STORAGE_KEY, JSON.stringify(register));
  return register;
}

export function clearSourceClosures() {
  if (typeof window !== "undefined") window.localStorage.removeItem(SOURCE_CLOSURE_STORAGE_KEY);
}
