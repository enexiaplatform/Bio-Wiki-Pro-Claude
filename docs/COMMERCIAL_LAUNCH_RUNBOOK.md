# Commercial launch runbook

This checklist is the operational gate for accepting unattended public payment. Product direction remains governed by `PRODUCT_SOURCE_OF_TRUTH.md`.

For execution after a qualified request becomes a real engagement, use `QUALITY_LAB_GATE_1_GATE_2_FIELD_RUNBOOK.md`. It maps reviewer appointment, paid-pilot delivery, calibration, client acceptance, validation cases, publication permission and external Domain Pack release to the existing Atlas control surfaces.

For target-account preparation, qualification and copy-ready founding-pilot outreach, use the current `SOFT_LAUNCH.md`. It supersedes the former Academy/Pro launch campaign and does not authorize external sending by itself.

## Gate 1 change decision record

1. **Current-state audit:** Atlas already has commercial intake, diagnostic checkout, reviewed-project persistence, controlled exports, action tracking, calibration records and a paid-pilot portfolio. The repository still contains no accepted real validation case.
2. **Existing-capability map:** Pricing and review pages frame the offer; Stripe collects the Diagnostic fee; quote requests store qualification context; the review workspace and delivery generators support execution; the pilot portfolio records outcomes.
3. **Exact gap:** A qualified buyer could not inspect a representative controlled deliverable before purchase, request acknowledgement and internal routing were not assured, production configuration could not be checked without reading secrets, and a guest who created an account after Diagnostic intake was sent away from the payment handoff and had to repeat the request.
4. **Real-project evidence:** No paid engagement evidence is claimed. This is a bounded launch prerequisite for obtaining the first paid case, not evidence that Gate 1 is complete.
5. **Duplication analysis:** The change reuses the existing pricing, review, quote-request, Stripe, email, PDF and analytics paths. It does not add a CRM, document-control system, new calculator or new modeling domain.
6. **Roadmap gate:** Gate 1 — paid service-assisted validation.
7. **Smallest data contract:** Existing commercial request fields plus request reference, offer label and non-confidential summary; runtime readiness returns booleans and a public origin, never credential values. Authentication accepts only an encoded internal `returnTo` path, while a 24-hour session receipt preserves only the fact that a Diagnostic request was submitted—not its contact or project content.
8. **Human-review and liability boundaries:** The sample is synthetic and concept-only. Reviewer appointment, site approval, engineering approval, regulatory approval and customer outcomes are never implied.
9. **Minimal user flow:** Pricing or sample → Paid Scope Diagnostic intake → sign in or create an account without losing the submitted-request state → authenticated checkout when available → acknowledgement and owner alert → human fit confirmation within two business days.
10. **Commercial-impact hypothesis:** A tangible sample and reliable follow-up reduce uncertainty and prevent qualified requests from being lost between intake and delivery ownership.
11. **Intelligence-compounding hypothesis:** Better conversion to a real engagement creates the first controlled assumptions, corrections, buyer decisions and estimate-to-actual evidence; this slice creates no universal rule by itself.
12. **Success metrics:** Sample downloads, pricing and intake views, paid diagnostics, response within SLA, Diagnostic-to-Blueprint conversion, delivery time, revision burden and accepted validation cases.
13. **Stop conditions:** Do not add modeling breadth, spatial design, a new Domain Pack or generalized CRM workflow until real engagements demonstrate the need. Stop unattended payment if `commerceReady` is false.
14. **Files and contracts changed:** Commercial pages and copy, authentication return-path handling, analytics events, transactional email routing, public sample PDF generation, runtime readiness, tests and this runbook. Existing project and Blueprint contracts remain unchanged.
15. **Migration and compatibility risks:** No database migration. New environment variables are optional at runtime but required for commercial readiness. Existing checkout falls back safely; placeholder configuration must remain non-ready.
16. **Test and validation strategy:** Runtime configuration and safe-return unit tests, route tests for request routing and public PDF delivery, PDF generation tests, repository validation, production build and public desktop/mobile smoke coverage including guest intake → account creation → payment handoff. A real Stripe acceptance test remains an external launch step.

### Subsequent schema and measurement note — 28 July 2026

The commercial journey now has a strict, privacy-minimal first-party funnel receipt and an Admin 30-day report. It stores stage and limited operational attribution only; it rejects project identifiers, project inputs, contact details and evidence content. The Stripe webhook carries the anonymous journey identifier so a successful Scope Diagnostic purchase remains attributable even when the buyer does not return to the success page.

During P0, do not run `db:push` or alter the production schema. `GET /api/health` performs a cached, read-only check of Gate 1 tables, column type/nullability/default compatibility and required primary/unique keys for the account, intake, payment, project revision, governance and funnel contract, then publishes only `readiness.schema: boolean`. If it is false, account sync and checkout stay fail-closed until a separately approved schema operation is completed. PostHog is an optional advanced-analysis layer rather than the sole source of Blueprint funnel measurement.

## Required production configuration

- `COMMERCE_MODE`: `disabled`, `test`, or `live`; omitted or invalid values become `disabled`.
- `PUBLIC_APP_URL`: active public origin used by Stripe, account and email links. `BASE_URL` is a one-release compatibility fallback.
- `VITE_SITE_URL`: same active origin until a custom domain is attached.
- `STRIPE_SECRET_KEY`: valid Stripe key for the intended live or test environment.
- `STRIPE_WEBHOOK_SECRET`: signing secret for `/api/stripe/webhook` from the same Stripe environment.
- `STRIPE_SCOPE_DIAGNOSTIC_PRICE_ID`: USD 149 one-time Price for `Atlas Paid Scope Diagnostic`.
- `RESEND_API_KEY` and `EMAIL_FROM`: verified sender for buyer acknowledgements and operational alerts.
- `COMMERCIAL_NOTIFICATION_EMAILS` or `ADMIN_EMAILS`: monitored inboxes for the two-business-day response SLA.
- `VITE_POSTHOG_KEY`: optional advanced product/path analytics; the core Blueprint stage funnel is first-party.
- `CRON_SECRET`: long random value protecting lifecycle jobs.

`GET /api/health` reports `commerceMode`, `diagnosticTestReady`, `commerceReady`, and boolean schema/origin readiness without returning connection details or secrets. `diagnosticTestReady` means a preview can complete a Stripe test-mode acceptance journey. `commerceReady` remains false unless `COMMERCE_MODE=live`, the Stripe key is live, all email/inbox/database/session requirements are ready, the schema check passes, and the origin is a custom domain. Production stays `COMMERCE_MODE=disabled` for this pilot cycle.

`npm run audit:schema` is the protected operator companion to that public boolean. It queries `information_schema.columns` plus names-only `pg_catalog` index metadata, reads no application rows and prints only required object names, structural issues and counts. Use `npm run audit:schema -- --json` for a machine-readable handoff. Its contract is derived from the current Drizzle definitions and covers 15 Gate 1/lifecycle tables, 105 column contracts and 25 primary/unique keys. This includes identity, idempotency, conflict-safe persistence, the privacy-minimal funnel, regulatory preferences, lifecycle/nurture guards, checkout attempts and reading activity. Invalid or not-ready unique indexes do not satisfy the check.

### Runtime foundation recheck — 5 September 2026

Production and PR #9 preview health remain degraded with `schema:false`.
Protected Production inspection confirms exactly two missing tables:
`quality_lab_funnel_events` and `regulatory_alert_preferences`; the other 13
required tables and 86 columns pass. The read-only repair preflight passes for
the [versioned reconciliation proposal](../migrations/reconciliation/README.md).
It has not been applied to Production or Preview. The historical migration
ledger remains unreconciled.

The environment-name audit still finds no Diagnostic Price, Resend key or email
sender configuration; Preview additionally lacks a Stripe secret, commercial
inbox and cron secret. Presence of other names does not prove credential validity,
inbox monitoring or delivery. Separate test checkout/email acceptance is still
required. Production commerce remains disabled.

Funnel receipt persistence failures now return HTTP 503 with `accepted:false`;
the browser makes at most three attempts using the same event ID, with bounded
timeouts and no persistent project-data queue. Duplicate insertion is accepted.
Retries remain best effort and do not recover receipts after page closure or
historical events lost while the table was missing.

Lifecycle jobs record a send guard only after provider acceptance. A rejected
send, storage failure or official-feed outage produces an overall HTTP 503;
independent jobs remain isolated and logs contain fixed operational codes rather
than raw errors. Provider acceptance is not inbox delivery. Sending and recording
the guard are separate operations, so a provider success followed by a database
failure or concurrent cron invocations can still cause duplicate mail; this
change does not claim exactly-once external delivery.

The interim public/canonical origin is `https://life-science-atlas-enexiaplatforms-projects.vercel.app`. Preview deployments in `COMMERCE_MODE=test` derive Stripe redirect URLs from their own `VERCEL_URL` so they cannot redirect a test buyer to production.

### Production name-only audit — 18 July 2026

The linked Vercel Production project currently lists database integration variables, `SESSION_SECRET`, `BASE_URL`, `VITE_SITE_URL`, `CRON_SECRET`, `ADMIN_EMAILS`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` and the legacy Pro price. The listing does not expose or validate their values.

The Production listing does not yet contain `STRIPE_SCOPE_DIAGNOSTIC_PRICE_ID`, `RESEND_API_KEY`, `EMAIL_FROM` or `VITE_POSTHOG_KEY`. `COMMERCIAL_NOTIFICATION_EMAILS` is also absent, but the existing `ADMIN_EMAILS` is an allowed fallback when it points to a monitored operational inbox. Re-run `npm run preflight` inside a protected Production environment after configuration; do not copy secrets into source-controlled files or chat.

### Public readiness probe — 15 August 2026

The public pricing, Diagnostic review and illustrative sample routes returned HTTP 200. The production health endpoint returned HTTP 503 with `status: degraded`, `commerceMode: disabled`, `schema: false`, `diagnosticTestReady: false` and `commerceReady: false`. It reported database, session, Stripe test-mode, commercial-notification and cron configuration as present, while the Scope Diagnostic price, email, analytics and explicit public-origin readiness remained false. This is a dated names/booleans-only observation, not proof that any credential value, inbox delivery, webhook or payment journey works.

### Public readiness recheck — 25 August 2026

The current Vercel Production deployment remains `Ready`, and its stable Vercel alias responds, but `/api/health` still returns HTTP 503 with `status: degraded`, `commerceMode: disabled`, `schema: false`, `diagnosticTestReady: false` and `commerceReady: false`. The public probe reports database, session, Stripe test-mode, commercial-notification and cron configuration as present. Scope Diagnostic pricing, transactional email, analytics and explicit public-origin readiness remain false.

The Production environment name-only listing confirms that `PUBLIC_APP_URL` and `COMMERCE_MODE` now exist, but the runtime result shows that their current values do not make the origin or commerce ready. `STRIPE_SCOPE_DIAGNOSTIC_PRICE_ID`, `RESEND_API_KEY`, `EMAIL_FROM` and `VITE_POSTHOG_KEY` remain absent; `ADMIN_EMAILS` is present as the permitted notification fallback. The intended `lifescienceatlas.com` custom domain did not resolve in DNS during this check. No credential values were read, no database rows were queried and no production settings were changed.

### Public and PR-preview readiness recheck — 4 September 2026

The stable Vercel production alias still serves the public Diagnostic intake with HTTP 200. Its public `/api/health` response remains HTTP 503 with `commerceMode: disabled`, `diagnosticTestReady: false`, `commerceReady: false` and `schema: false`. Database, sessions, Stripe test-mode credentials, the monitored commercial inbox and cron report ready. The Diagnostic Price, transactional email, analytics and custom public origin remain not ready. The intended `lifescienceatlas.com` hostname still does not resolve.

PR #9 preview deployment `1706c73` completed successfully and serves the updated Diagnostic intake with HTTP 200. Its isolated Preview runtime reports `commerceMode: test` but remains HTTP 503: database and sessions are ready, while Stripe, Diagnostic Price, transactional email, commercial notifications, cron and schema are not. This preview is suitable for public UI review, but it is not suitable for the Stripe acceptance journey until the owner configures the Preview-scoped test credentials and reconciles the target schema under the procedure below.

No credential values, application rows, billing settings, DNS records or production configuration were read or changed during this recheck.

### Schema remediation procedure — approval required

1. Load the protected target environment without copying connection values into source control, screenshots or chat.
2. Run `npm run audit:schema` and retain only its names/counts output in the private release record.
3. Compare missing objects with `shared/schema.ts`, `shared/models/auth.ts` and the migration journal. Do not infer that all absent objects are safe to create from the public health boolean alone.
4. Take and verify a restorable database backup, then reconcile an additive migration and rehearse it against a production-like staging copy. Review for drops, truncation, type narrowing, constraint conflicts and long locks.
5. Obtain explicit production-change approval naming the migration, target, backup reference, operator, window and rollback owner.
6. Apply the reviewed migration with `npm run db:migrate`. Never use `npm run db:push` against production data.
7. Rerun `npm run audit:schema`, then `/api/health`. A green schema result proves structural compatibility only; complete the Stripe and email acceptance tests separately.

## Stripe acceptance test

1. Confirm the Price is USD 149, one-time, active and in the same Stripe environment as the secret key.
2. Sign in with a non-admin customer account.
3. Submit a Scope Diagnostic request and start checkout.
4. Complete payment using the matching Stripe test/live method.
5. Confirm return to `/payment/success`, not localhost.
6. Confirm one completed purchase record and one processed webhook event.
7. Confirm the buyer receipt and the internal commercial alert arrive.
8. Confirm the success page directs the buyer back to Diagnostic intake.

## Service-delivery gate

The private Admin Pipeline derives a weekday-based UTC response deadline from each stored request, keeps overdue and due-soon `new` requests first, and exposes missing owner or next-action controls. It is a planning queue only: moving a request beyond `new` is not evidence that the buyer received a response, so retain the external email or call reference in the authorized commercial record.

Before a Blueprint kickoff, the proposal must identify:

- the Atlas delivery owner;
- the engagement-specific reviewer and relevant competence evidence;
- scope, named files, exclusions and input freeze;
- payment milestones, cancellation basis and one-revision allowance;
- target delivery and five-business-day acceptance event;
- data handling and deletion route.

No public page may imply a reviewer appointment, client outcome, validation, regulatory approval or engineering approval before evidence exists.

## Domain cutover

When the custom domain is attached, update `PUBLIC_APP_URL`, `VITE_SITE_URL`, Stripe webhook/portal settings, Resend domain verification and any Google OAuth origin in one release. Keep `BASE_URL` only through the compatibility window, then remove it. Rerun the Stripe acceptance test and public E2E suite before considering `COMMERCE_MODE=live`.
