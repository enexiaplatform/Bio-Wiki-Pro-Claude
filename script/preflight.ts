// Gate 1 commercial preflight. This lints configuration only: it never calls
// Stripe, Resend, the database, or another external service and never prints
// credential values.

import "dotenv/config";
import { runtimeReadiness } from "../server/runtime-config.js";

type Level = "ok" | "warn" | "fail";
type Result = { level: Level; label: string; detail: string };

const results: Result[] = [];
const record = (level: Level, label: string, detail: string) => results.push({ level, label, detail });
const readiness = runtimeReadiness();
const allowTestStripe = process.argv.includes("--allow-test-stripe");
const stripeKey = process.env.STRIPE_SECRET_KEY?.trim() ?? "";

record(readiness.database ? "ok" : "fail", "Database", readiness.database
  ? "persistent sessions, requests and purchases can be recorded"
  : "set DATABASE_URL (or a supported Postgres integration variable)");
record(readiness.sessions ? "ok" : "fail", "Session security", readiness.sessions
  ? "strong SESSION_SECRET detected"
  : "set SESSION_SECRET to a non-placeholder value of at least 32 characters");
record(readiness.publicOriginConfigured ? "ok" : "fail", "Public origin", readiness.publicOriginConfigured
  ? "custom production origin detected"
  : "set BASE_URL to the intended custom HTTPS domain; localhost and temporary *.vercel.app hosts are not launch-ready");
record(readiness.stripe ? "ok" : "fail", "Stripe core", readiness.stripe
  ? "secret key and webhook signing secret have valid shapes"
  : "set non-placeholder STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET values");

if (readiness.stripe && stripeKey.startsWith("sk_test_")) {
  record(allowTestStripe ? "warn" : "fail", "Stripe mode", allowTestStripe
    ? "test key accepted for a dry run; do not treat this as a live payment acceptance"
    : "test key detected; use a live key for production or rerun with --allow-test-stripe for a controlled dry run");
} else if (readiness.stripe && stripeKey.startsWith("sk_live_")) {
  record("ok", "Stripe mode", "live key detected");
}

record(readiness.scopeDiagnostic ? "ok" : "fail", "Paid Scope Diagnostic", readiness.scopeDiagnostic
  ? "STRIPE_SCOPE_DIAGNOSTIC_PRICE_ID is configured"
  : "set the USD 149 one-time STRIPE_SCOPE_DIAGNOSTIC_PRICE_ID");
record(readiness.email ? "ok" : "fail", "Transactional email", readiness.email
  ? "Resend key and sender address are configured"
  : "set RESEND_API_KEY and a verified EMAIL_FROM sender");
record(readiness.commercialNotifications ? "ok" : "fail", "Commercial owner inbox", readiness.commercialNotifications
  ? "a monitored COMMERCIAL_NOTIFICATION_EMAILS or ADMIN_EMAILS recipient is configured"
  : "set a monitored COMMERCIAL_NOTIFICATION_EMAILS or ADMIN_EMAILS address for the two-business-day SLA");

const siteUrl = process.env.VITE_SITE_URL?.trim().replace(/\/$/, "") ?? "";
record(siteUrl && siteUrl === readiness.publicOrigin ? "ok" : "fail", "Canonical site URL", siteUrl
  ? "VITE_SITE_URL matches BASE_URL; redeploy after any build-time URL change"
  : "set VITE_SITE_URL to the same custom origin as BASE_URL and redeploy");
record(readiness.analytics ? "ok" : "warn", "Commercial analytics", readiness.analytics
  ? "VITE_POSTHOG_KEY is configured"
  : "VITE_POSTHOG_KEY is missing; paid conversion can operate, but Gate 1 funnel metrics will be incomplete");
record(readiness.cron ? "ok" : "warn", "Lifecycle cron", readiness.cron
  ? "CRON_SECRET is configured"
  : "CRON_SECRET is missing; lifecycle and portfolio reminder jobs remain disabled");

const icon: Record<Level, string> = { ok: "✓", warn: "!", fail: "✗" };
console.log("\nGate 1 commercial preflight\n" + "=".repeat(56));
for (const level of ["fail", "warn", "ok"] as const) {
  for (const result of results.filter((item) => item.level === level)) {
    console.log(`  ${icon[result.level]} ${result.label} — ${result.detail}`);
  }
}

const failures = results.filter((item) => item.level === "fail").length;
const warnings = results.filter((item) => item.level === "warn").length;
console.log("=".repeat(56));
console.log(`  ${failures} blocking, ${warnings} warning(s), ${results.length - failures - warnings} ready`);

if (failures > 0) {
  console.log("\n✗ NOT ready for unattended Paid Scope Diagnostic checkout.\n  See docs/COMMERCIAL_LAUNCH_RUNBOOK.md.\n");
  process.exit(1);
}

console.log("\n✓ Configuration is present. Complete the external Stripe acceptance test before accepting payment.\n");
