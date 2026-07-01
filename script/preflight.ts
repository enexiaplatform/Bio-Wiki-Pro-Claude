// ============================================================================
// Go-live preflight — verifies the environment is revenue-ready before launch.
//
// Run BEFORE taking money in production:
//   npm run preflight            # checks the current environment
//   # or against a prod .env:  the script loads dotenv, so put prod values in
//   # .env (or export them) and run the same command.
//
// It is aligned with the SUBSCRIPTION-FIRST model (see docs/GO_LIVE.md):
//   - Pro subscription is the ONLY required revenue product.
//   - The GMP Audit Kit is folded into Pro (its standalone price is NOT needed).
//   - Career one-time kits are OPTIONAL — only checked if you configured a price
//     (a price without its matching DOWNLOAD_* url = a broken delivery email).
//
// Exit code: 0 when all REQUIRED checks pass (warnings allowed), 1 otherwise.
// This is a config linter only — it does NOT call Stripe / connect to the DB.
// ============================================================================

import "dotenv/config";
import { PRODUCTS } from "../server/products.js";

type Level = "ok" | "warn" | "fail";
interface Result {
  level: Level;
  label: string;
  detail: string;
}

const results: Result[] = [];
const ok = (label: string, detail = "") => results.push({ level: "ok", label, detail });
const warn = (label: string, detail: string) => results.push({ level: "warn", label, detail });
const fail = (label: string, detail: string) => results.push({ level: "fail", label, detail });

const env = process.env;
const has = (v?: string) => typeof v === "string" && v.trim().length > 0;

// ── 1. Database ─────────────────────────────────────────────────────────────
// Mirror server/db.ts: DATABASE_URL, then the Supabase/Vercel-injected names.
const dbUrl =
  env.DATABASE_URL || env.POSTGRES_URL || env.POSTGRES_PRISMA_URL || env.POSTGRES_URL_NON_POOLING;
if (has(dbUrl)) {
  const src = env.DATABASE_URL
    ? "DATABASE_URL"
    : env.POSTGRES_URL
      ? "POSTGRES_URL"
      : env.POSTGRES_PRISMA_URL
        ? "POSTGRES_PRISMA_URL"
        : "POSTGRES_URL_NON_POOLING";
  ok("DATABASE_URL", `set via ${src} — remember to run \`npm run db:push\``);
} else {
  fail(
    "DATABASE_URL",
    "missing → sessions fall back to memory (users logged out on cold start), no purchases persist",
  );
}

// ── 2. Auth & core ──────────────────────────────────────────────────────────
if (!has(env.SESSION_SECRET)) {
  fail("SESSION_SECRET", "missing → falls back to the weak default 'default_secret'");
} else if (env.SESSION_SECRET!.length < 16 || env.SESSION_SECRET === "default_secret") {
  warn("SESSION_SECRET", "set but weak — use a long random string");
} else {
  ok("SESSION_SECRET");
}

if (!has(env.BASE_URL)) {
  warn(
    "BASE_URL",
    "unset → Stripe redirect + email links fall back to localhost (email.ts falls back to the vercel domain). Set to your prod domain to be safe.",
  );
} else if (/localhost|127\.0\.0\.1/.test(env.BASE_URL!)) {
  fail("BASE_URL", `points at localhost (${env.BASE_URL}) → Stripe redirects + email links will be broken in prod`);
} else {
  ok("BASE_URL", env.BASE_URL!);
}

// ── 3. Stripe (subscription-first) ──────────────────────────────────────────
if (!has(env.STRIPE_SECRET_KEY)) {
  fail("STRIPE_SECRET_KEY", "missing → all Stripe endpoints return 503 (no checkout)");
} else if (env.STRIPE_SECRET_KEY!.startsWith("sk_test_")) {
  warn("STRIPE_SECRET_KEY", "is a TEST key (sk_test_…) — swap to sk_live_… before real sales");
} else if (env.STRIPE_SECRET_KEY!.startsWith("sk_live_")) {
  ok("STRIPE_SECRET_KEY", "live key");
} else {
  warn("STRIPE_SECRET_KEY", "set but not a recognised sk_test_/sk_live_ prefix");
}

if (!has(env.STRIPE_WEBHOOK_SECRET)) {
  fail(
    "STRIPE_WEBHOOK_SECRET",
    "missing → webhook returns 503 → payments succeed but Pro is NEVER unlocked and no emails send. THE most commonly-forgotten var.",
  );
} else if (!env.STRIPE_WEBHOOK_SECRET!.startsWith("whsec_")) {
  warn("STRIPE_WEBHOOK_SECRET", "set but does not start with whsec_ — verify it is the endpoint signing secret");
} else {
  ok("STRIPE_WEBHOOK_SECRET", "set — ensure the live endpoint subscribes to all 6 events (see GO_LIVE.md 2b)");
}

// Pro price — the one required product.
const proPrice = env[PRODUCTS.pro_subscription.priceEnv];
if (!has(proPrice)) {
  fail("STRIPE_PRO_PRICE_ID", "missing → Pro checkout returns 400 Invalid productType (no way to subscribe)");
} else if (!proPrice!.startsWith("price_")) {
  warn("STRIPE_PRO_PRICE_ID", "set but does not look like a Stripe price_… id");
} else {
  ok("STRIPE_PRO_PRICE_ID", "set");
}

// Optional annual Pro.
if (has(env[PRODUCTS.pro_subscription_annual.priceEnv])) {
  ok("STRIPE_PRO_ANNUAL_PRICE_ID", "set → /upgrade shows a Monthly/Annual toggle");
}

// ── 4. Email / Resend ───────────────────────────────────────────────────────
if (!has(env.RESEND_API_KEY)) {
  fail("RESEND_API_KEY", "missing → ALL transactional email (welcome, purchase, lead magnet) is silently skipped");
} else if (!env.RESEND_API_KEY!.startsWith("re_")) {
  warn("RESEND_API_KEY", "set but does not start with re_");
} else {
  ok("RESEND_API_KEY");
}

if (!has(env.EMAIL_FROM)) {
  warn("EMAIL_FROM", "unset → falls back to onboarding@resend.dev (poor deliverability). Use a Resend-verified domain.");
} else if (/resend\.dev/.test(env.EMAIL_FROM!)) {
  warn("EMAIL_FROM", "uses resend.dev — fine for testing, verify your own domain for prod deliverability");
} else {
  ok("EMAIL_FROM", env.EMAIL_FROM!);
}

// ── 5. Optional one-time career kits ────────────────────────────────────────
// Only relevant if you sell them. A configured price with NO download url = a
// customer who pays and gets a broken delivery email.
for (const id of ["starter_kit", "interview_prep", "bundle"] as const) {
  const p = PRODUCTS[id];
  const priceSet = has(env[p.priceEnv]);
  const dlSet = p.downloadEnv ? has(env[p.downloadEnv]) : true;
  if (priceSet && !dlSet) {
    warn(p.name, `${p.priceEnv} is set but ${p.downloadEnv} is missing → buyers get a broken download link`);
  } else if (priceSet && dlSet) {
    ok(p.name, "price + download configured");
  }
  // Not set at all → not selling it → silent (expected for a Pro-only launch).
}
// GMP kit is intentionally Pro-only now; flag only if someone re-enabled it.
if (has(env.STRIPE_GMP_AUDIT_KIT_PRICE_ID) && !has(env.DOWNLOAD_GMP_AUDIT_KIT)) {
  warn("GMP Audit Kit", "STRIPE_GMP_AUDIT_KIT_PRICE_ID is set but DOWNLOAD_GMP_AUDIT_KIT is missing (kit is normally Pro-only)");
}

// ── 6. Analytics / misc (informational) ─────────────────────────────────────
if (has(env.VITE_POSTHOG_KEY)) {
  ok("VITE_POSTHOG_KEY", "set (build-time — redeploy after changing)");
} else {
  warn("VITE_POSTHOG_KEY", "unset → no product analytics (app runs fine). Build-time: redeploy after setting.");
}
if (!has(env.VITE_SITE_URL)) {
  warn("VITE_SITE_URL", "unset → client canonical/OG fall back. Set to your prod domain (build-time, needs redeploy).");
} else {
  ok("VITE_SITE_URL", env.VITE_SITE_URL!);
}

// ── Report ──────────────────────────────────────────────────────────────────
const icon = { ok: "✓", warn: "!", fail: "✗" } as const;
const order: Level[] = ["fail", "warn", "ok"];
console.log("\nGo-live preflight — subscription-first launch\n" + "=".repeat(48));
for (const lvl of order) {
  for (const r of results.filter((x) => x.level === lvl)) {
    console.log(`  ${icon[r.level]} ${r.label}${r.detail ? `  — ${r.detail}` : ""}`);
  }
}
const fails = results.filter((r) => r.level === "fail").length;
const warns = results.filter((r) => r.level === "warn").length;
console.log("=".repeat(48));
console.log(`  ${fails} blocking, ${warns} warning(s), ${results.length - fails - warns} ok`);
if (fails > 0) {
  console.log("\n✗ NOT revenue-ready — resolve the blocking items above (docs/GO_LIVE.md).\n");
  process.exit(1);
} else {
  console.log(
    "\n✓ Required config present. Do a live test purchase (GO_LIVE.md Step 6) to confirm the webhook + DB end to end.\n",
  );
}
