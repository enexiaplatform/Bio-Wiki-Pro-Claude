import {
  applyExpertOwnershipRegister,
  createExpertOwnershipRegister,
  expertOwnershipRegisterSchema,
  type ExpertOwnerRole,
  type ExpertOwnershipRegister,
} from "@shared/quality-lab-expert-ownership";

export const EXPERT_OWNERSHIP_STORAGE_KEY = "lsa:quality-lab-expert-ownership:v1";

export function loadExpertOwnershipRegister(): ExpertOwnershipRegister | null {
  if (typeof window === "undefined") return null;
  try {
    const parsed = expertOwnershipRegisterSchema.safeParse(JSON.parse(window.localStorage.getItem(EXPERT_OWNERSHIP_STORAGE_KEY) ?? "null"));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function loadExpertOwnerRoles(domainPack: { id: string; version: string }, roles: ExpertOwnerRole[]) {
  const register = loadExpertOwnershipRegister();
  return register ? applyExpertOwnershipRegister({ domainPack, roles, register }) : { roles, applied: false as const, reason: null };
}

export function saveExpertOwnerRoles(domainPack: { id: string; version: string }, roles: ExpertOwnerRole[]) {
  const register = createExpertOwnershipRegister({ domainPack, roles });
  window.localStorage.setItem(EXPERT_OWNERSHIP_STORAGE_KEY, JSON.stringify(register));
  return register;
}

export function clearExpertOwnerRoles() {
  if (typeof window !== "undefined") window.localStorage.removeItem(EXPERT_OWNERSHIP_STORAGE_KEY);
}
