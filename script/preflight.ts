// Configuration-only readiness check. It never calls external services and
// never prints credential values.
import "dotenv/config";
import { runtimeReadiness } from "../server/runtime-config.js";

type Level = "ok" | "warn" | "fail";
type Result = { level: Level; label: string; detail: string };

const results: Result[] = [];
const record = (level: Level, label: string, detail: string) => results.push({ level, label, detail });
const readiness = runtimeReadiness();
const allowTestStripe = process.argv.includes("--allow-test-stripe");
const previewOriginReady = readiness.publicOrigin.startsWith("https://") && !readiness.publicOrigin.includes("localhost");

record(readiness.database ? "ok" : "fail", "Database connection", readiness.database
  ? "persistent storage is configured; run npm run audit:schema in the protected target environment"
  : "set DATABASE_URL (or a supported Postgres integration variable)");
record(readiness.sessions ? "ok" : "fail", "Session security", readiness.sessions
  ? "strong SESSION_SECRET detected"
  : "set SESSION_SECRET to a non-placeholder value of at least 32 characters");
record((readiness.commerceMode === "test" ? previewOriginReady : readiness.publicOriginConfigured) ? "ok" : "fail", "Public origin",
  readiness.commerceMode === "test" && previewOriginReady
    ? "HTTPS preview origin is valid for test checkout"
    : readiness.publicOriginConfigured
      ? "custom production origin detected"
      : "set PUBLIC_APP_URL to the intended HTTPS origin; temporary Vercel hosts are never live-commerce-ready");
record(readiness.stripe ? "ok" : "fail", "Stripe core", readiness.stripe
  ? "secret key and webhook signing secret have valid shapes"
  : "set non-placeholder STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET values");

if (readiness.commerceMode === "disabled") {
  record("fail", "Commerce mode", "COMMERCE_MODE is disabled; checkout remains intentionally closed");
} else if (readiness.commerceMode === "test" && readiness.stripeMode === "test") {
  record(allowTestStripe ? "warn" : "fail", "Stripe mode", allowTestStripe
    ? "test mode acknowledged; this cannot authorize live payment"
    : "rerun with --allow-test-stripe to acknowledge a controlled test checkout");
} else if (readiness.commerceMode === "live" && readiness.stripeMode === "live") {
  record("ok", "Stripe mode", "COMMERCE_MODE=live matches the live key");
} else {
  record("fail", "Stripe mode", `COMMERCE_MODE=${readiness.commerceMode} does not match the configured Stripe key mode`);
}

record(readiness.scopeDiagnostic ? "ok" : "fail", "Paid Scope Diagnostic", readiness.scopeDiagnostic
  ? "STRIPE_SCOPE_DIAGNOSTIC_PRICE_ID is configured"
  : "set the USD 149 one-time STRIPE_SCOPE_DIAGNOSTIC_PRICE_ID");
record(readiness.email ? "ok" : "fail", "Transactional email", readiness.email
  ? "Resend key and sender address are configured"
  : "set RESEND_API_KEY and a verified EMAIL_FROM sender");
record(readiness.commercialNotifications ? "ok" : "fail", "Commercial owner inbox", readiness.commercialNotifications
  ? "a monitored commercial or admin recipient is configured"
  : "set COMMERCIAL_NOTIFICATION_EMAILS or ADMIN_EMAILS for the two-business-day SLA");

const siteUrl = process.env.VITE_SITE_URL?.trim().replace(/\/$/, "") ?? "";
record(siteUrl && siteUrl === readiness.publicOrigin ? "ok" : "fail", "Canonical site URL", siteUrl
  ? "VITE_SITE_URL matches PUBLIC_APP_URL; redeploy after any build-time URL change"
  : "set VITE_SITE_URL to the same public origin and redeploy");
record(readiness.analytics ? "ok" : "warn", "Commercial analytics", readiness.analytics
  ? "PostHog plus the first-party Blueprint funnel are configured"
  : "PostHog is missing; the privacy-minimal first-party funnel remains available when schema-ready");
record(readiness.cron ? "ok" : "warn", "Lifecycle cron", readiness.cron
  ? "CRON_SECRET is configured"
  : "CRON_SECRET is missing; lifecycle and portfolio reminder jobs remain disabled");

const icon: Record<Level, string> = { ok: "OK", warn: "!", fail: "X" };
console.log("\nCommercial readiness preflight\n" + "=".repeat(56));
for (const level of ["fail", "warn", "ok"] as const) {
  for (const result of results.filter((item) => item.level === level)) {
    console.log(`  ${icon[result.level]} ${result.label} - ${result.detail}`);
  }
}

const failures = results.filter((item) => item.level === "fail").length;
const warnings = results.filter((item) => item.level === "warn").length;
console.log("=".repeat(56));
console.log(`  ${failures} blocking, ${warnings} warning(s), ${results.length - failures - warnings} ready`);

if (failures > 0) {
  console.log("\nNot ready for the selected checkout mode. See docs/COMMERCIAL_LAUNCH_RUNBOOK.md.\n");
  process.exit(1);
}

console.log(readiness.commerceMode === "test"
  ? "\nTest-pilot configuration is present. Live payment remains disabled.\n"
  : "\nConfiguration is present. Complete the external Stripe acceptance test before accepting payment.\n");
