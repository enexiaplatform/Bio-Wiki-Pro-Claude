export function safeAuthReturnTo(search: string, fallback: string): string {
  const params = new URLSearchParams(search);
  const candidate = params.get("returnTo") ?? params.get("next");
  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//")) return fallback;
  if (candidate.includes("\\") || /[\u0000-\u001f\u007f]/.test(candidate)) return fallback;

  try {
    const base = new URL("https://atlas.invalid");
    const resolved = new URL(candidate, base);
    return resolved.origin === base.origin ? candidate : fallback;
  } catch {
    return fallback;
  }
}

const adminWorkspacePaths = new Set([
  "/admin",
  "/quality-lab/calibration",
  "/quality-lab/pilots",
  "/quality-lab/domain-readiness",
  "/quality-lab/domain-ownership",
  "/quality-lab/validation-cases",
  "/quality-lab/gate-2-release",
  "/quality-lab/governance-history",
  "/quality-lab/rule-changes",
  "/quality-lab/method-applications",
]);

export function isAdminWorkspaceReturnTo(returnTo: string): boolean {
  const path = returnTo.split(/[?#]/, 1)[0] ?? "";
  return adminWorkspacePaths.has(path) || path.startsWith("/quality-lab/engagements/");
}

export function authPath(path: "/login" | "/register", returnTo: string): string {
  return `${path}?returnTo=${encodeURIComponent(returnTo)}`;
}
