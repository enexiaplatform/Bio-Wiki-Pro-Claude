# Commercial launch runbook

This checklist is the operational gate for accepting unattended public payment. Product direction remains governed by `PRODUCT_SOURCE_OF_TRUTH.md`.

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

## Required production configuration

- `BASE_URL`: active public origin used by Stripe, account and email links.
- `VITE_SITE_URL`: same active origin until a custom domain is attached.
- `STRIPE_SECRET_KEY`: valid Stripe key for the intended live or test environment.
- `STRIPE_WEBHOOK_SECRET`: signing secret for `/api/stripe/webhook` from the same Stripe environment.
- `STRIPE_SCOPE_DIAGNOSTIC_PRICE_ID`: USD 149 one-time Price for `Atlas Paid Scope Diagnostic`.
- `RESEND_API_KEY` and `EMAIL_FROM`: verified sender for buyer acknowledgements and operational alerts.
- `COMMERCIAL_NOTIFICATION_EMAILS` or `ADMIN_EMAILS`: monitored inboxes for the two-business-day response SLA.
- `VITE_POSTHOG_KEY`: production project key for the Blueprint commercial funnel.
- `CRON_SECRET`: long random value protecting lifecycle jobs.

`GET /api/health` reports operational readiness and a separate `commerceReady` flag without returning secret values. `commerceReady` remains false for placeholder credentials, localhost, and temporary `*.vercel.app` origins; attach and configure the intended public domain before accepting unattended payment.

### Production name-only audit — 18 July 2026

The linked Vercel Production project currently lists database integration variables, `SESSION_SECRET`, `BASE_URL`, `VITE_SITE_URL`, `CRON_SECRET`, `ADMIN_EMAILS`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` and the legacy Pro price. The listing does not expose or validate their values.

The Production listing does not yet contain `STRIPE_SCOPE_DIAGNOSTIC_PRICE_ID`, `RESEND_API_KEY`, `EMAIL_FROM` or `VITE_POSTHOG_KEY`. `COMMERCIAL_NOTIFICATION_EMAILS` is also absent, but the existing `ADMIN_EMAILS` is an allowed fallback when it points to a monitored operational inbox. Re-run `npm run preflight` inside a protected Production environment after configuration; do not copy secrets into source-controlled files or chat.

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

Before a Blueprint kickoff, the proposal must identify:

- the Atlas delivery owner;
- the engagement-specific reviewer and relevant competence evidence;
- scope, named files, exclusions and input freeze;
- payment milestones, cancellation basis and one-revision allowance;
- target delivery and five-business-day acceptance event;
- data handling and deletion route.

No public page may imply a reviewer appointment, client outcome, validation, regulatory approval or engineering approval before evidence exists.

## Domain cutover

When the custom domain is attached, update `BASE_URL`, `VITE_SITE_URL`, Stripe webhook/portal settings, Resend domain verification and any Google OAuth origin in one release. Then rerun the Stripe acceptance test and public E2E suite.
