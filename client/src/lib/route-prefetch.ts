// Warm the lazy route chunks for the most likely next destinations so navigation
// feels instant. The dynamic import() specifiers match App.tsx exactly, so Vite
// dedupes them to the same chunk — calling these just primes the browser cache,
// it doesn't create new chunks.

const importers: Record<string, () => Promise<unknown>> = {
  "/academy": () => import("@/pages/Academy"),
  "/register": () => import("@/pages/RegisterPage"),
  "/login": () => import("@/pages/LoginPage"),
  "/pricing": () => import("@/pages/PricingPage"),
  "/blog": () => import("@/pages/Blog"),
  "/tools": () => import("@/pages/LabTools"),
  "/compliance": () => import("@/pages/Compliance"),
  "/career": () => import("@/pages/Career"),
  "/vault": () => import("@/pages/Vault"),
  "/toolkits/gmp-audit-kit": () => import("@/pages/GMPAuditKit"),
};

const done = new Set<string>();

/** Prefetch one route's chunk (e.g. on link hover). No-op if unknown/already done. */
export function prefetchRoute(path: string): void {
  if (done.has(path)) return;
  const fn = importers[path];
  if (!fn) return;
  done.add(path);
  fn().catch(() => done.delete(path));
}

/** After the page is idle, warm the highest-intent next routes. */
export function prefetchLikelyNext(paths: string[] = ["/academy", "/tools", "/register"]): void {
  if (typeof window === "undefined") return;
  const run = () => paths.forEach(prefetchRoute);
  const ric = (window as unknown as { requestIdleCallback?: (cb: () => void) => void }).requestIdleCallback;
  if (ric) ric(run);
  else setTimeout(run, 1500);
}
