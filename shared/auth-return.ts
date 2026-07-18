export function safeAuthReturnTo(search: string, fallback: string): string {
  const candidate = new URLSearchParams(search).get("returnTo");
  return candidate && candidate.startsWith("/") && !candidate.startsWith("//")
    ? candidate
    : fallback;
}

export function authPath(path: "/login" | "/register", returnTo: string): string {
  return `${path}?returnTo=${encodeURIComponent(returnTo)}`;
}
