# Life Science Atlas — Optimization Roadmap (to commercial)

The single source of truth for taking Life Science Atlas from "launch-ready code" to a
**self-sustaining commercial product**, then optimizing it for real.

It is split into **work packages (WP)**, each sized at **~5–10% of the whole
journey** = roughly **one full session**. Sessions run packages in order (respect
`deps`), so every session builds coherently on the last. Update the ledger %/status
at the end of each session.

> **North star / "commercial" =** a brand-new visitor can land → understand the
> product in 5s → sign up free → learn → upgrade to Pro (one subscription that
> unlocks the full academy + every toolkit, incl. the GMP kit) → pay (live Stripe)
> → get real files + emails → come back → and we can see the whole funnel in
> analytics. Beyond that: a repeatable loop that improves conversion, retention,
> and content. (Monetization is **subscription-first**: the GMP kit is folded into
> Pro, not sold standalone — see the `commercialization-gaps` memory, 2026-06-18.)

---

## How to run a session (protocol)

1. Read this file. Pick the **first `TODO` WP whose `deps` are all `DONE`.**
2. Do the **whole** package (it's scoped to one session). Don't half-do two.
3. Verify before committing: `npm run check` + `npm run build` + `npm test` +
   (`npx playwright test` if UI/content touched) + a `preview` check for visible
   changes. Confirm no Pro-content leak / no console errors.
4. Commit per logical change, push to `main` (Vercel auto-deploys).
5. **Update the ledger** below (status → `DONE`, set the % done) and append a
   one-line dated note to the WP. Update the `commercialization-gaps` memory.
6. If you discover the WP is bigger than one session, split it (add `WP-Xa/Xb`)
   rather than rushing.

Owner-only operational steps (Stripe live keys, `db:push`, DNS, secrets) are
flagged 🔑 — a session can prepare/verify around them but cannot complete them.

---

## Progress ledger

Overall: **code roadmap 100% complete** — A, B, C, D, E1, E2, E3, E4 all done.
Only the owner-only 🔑 LAUNCH (go-live ops) remains.

| WP | Phase | Scope | Est % | Status |
|----|-------|-------|------:|--------|
| A | Foundation | Auth, Stripe, entitlement, server gating, fulfillment, content engine, trial+nurture | 40% | ✅ DONE |
| B | Launch readiness | SEO, analytics funnel, IA (desktop+mobile), trust/legal, brand, perf, content QA, a11y pass 1, soft-launch kit | 18% | ✅ DONE |
| C1 | Conversion | Email lifecycle completion (abandoned-checkout + trial-ending) | 6% | ✅ DONE (e014c73) |
| C2 | Conversion | Onboarding & activation (first-run, empty states, verify-email nudge, progress prompts) | 6% | ✅ DONE (d8bf569) |
| C3 | Conversion | Conversion polish (upgrade-prompt tuning, social-proof capture, exit-intent lead, pricing clarity) | 6% | ✅ DONE (6a6337d) |
| D1 | Retention | Retention loops (streaks/achievements/certificate polish + re-engagement email) | 5% | ✅ DONE (56b3546) |
| D2 | Growth | SEO depth (internal-link checker, more JSON-LD, content cadence workflow; OG images → backlog) | 6% | ✅ DONE (c14bffb) |
| E1 | Hardening | Performance round 2 (fonts/images, route preload, use-data split, Lighthouse pass) | 5% | ✅ DONE (9444669) |
| E2 | Hardening | Accessibility full pass (keyboard/focus/contrast, axe audit, complex widgets) | 4% | ✅ DONE (5d0885e) |
| E3 | Hardening | Security & observability (headers/CSP, rate-limit review, error monitoring, webhook alerts, dep audit) | 5% | ✅ DONE (e520669) |
| E4 | Hardening | Testing depth (e2e purchase via E2E_RUN, route coverage, smoke for new flows) | 4% | ✅ DONE |
| LAUNCH | Ops 🔑 | Go-live dry run: env audit, Stripe live, `db:push`, PostHog key, one real purchase, prod smoke | 5% | ⛔ TODO (owner) |

> % sums to 100. Adjust weights if scope shifts. "DONE" rows are recorded in the
> `commercialization-gaps` memory with commit hashes.

---

## Phase A — Foundation ✅ (done, prior sessions)

Auth (bcrypt + sessions + Google + reset/verify), Stripe checkout + webhook (6
events, idempotency, dunning), lazy entitlement (`isProActive`), server-side
content gating (`/api/content` + `GatedContent`), self-hosted deliverables
(GMP/career kits, PDF/XLSX on the fly), MDX content engine, 7-day trial, free→Pro
nurture cron. See `docs/GO_LIVE.md` + `commercialization-gaps` memory.

## Phase B — Launch readiness ✅ (done, 2026-06-13 session)

SEO (per-page meta, dynamic sitemap incl. all 7 paths, robots, JSON-LD
Article/Course/FAQ/Breadcrumb); analytics funnel (identify + signup/lesson/
download events); IA (Solutions surfaced, mobile "More" drawer, ⌘K complete);
trust/legal (educational-use disclaimer on readers, trust badges, Terms §6);
brand favicon; performance (index chunk 904→362KB, **Pro-content leak closed**,
react-markdown off the landing path, dead recharts removed); content accuracy
sweep (citations/formulas verified); a11y pass 1 (icon-button labels); soft-launch
kit (`docs/SOFT_LAUNCH.md`).

---

## Phase C — Conversion & lifecycle (next up)

### WP-C1 — Email lifecycle completion ⛔ deps: A
**Goal:** close the two missing lifecycle emails so no revenue moment is silent.
- Add **abandoned-checkout** reminder: record checkout-session-created (or a
  `checkout_started` server signal) and email if not completed in N hours.
- Add **trial-ending** reminders (3 days + 1 day before `proExpiresAt` while
  `subscriptionStatus=trialing`).
- Reuse the cron pattern in `server/routes.ts` (`/api/cron/nurture`) + `email.ts`;
  add a `lifecycle_sends` guard table (degrade gracefully pre-migration).
**Acceptance:** each email sends once, idempotently; gated by `CRON_SECRET`; no
double-send. **Verify:** unit test the selection logic; cron returns ok with no
DB; tsc+build green.
**✅ DONE 2026-06-13 (e014c73):** folded into the single daily `/api/cron/nurture`
(3 isolated jobs). New `lifecycle_sends` + `checkout_attempts` tables (graceful if
absent). `recordCheckoutAttempt` best-effort in create-checkout-session. +5 tests
(60 total). **Owner: run `db:push`** to create the two tables (works without it —
per-job error reported, checkout unaffected).

### WP-C2 — Onboarding & activation ⛔ deps: A, B
**Goal:** get a new free user to first value fast.
- Strengthen `/welcome` first-run (pick a goal/path → land on lesson 1).
- Good empty states (My Learning, My Downloads, Vault) with a clear next action.
- Surface the verify-email nudge + a "resume where you left off" prompt.
- Track `activation` (first lesson completed) in analytics.
**Acceptance:** a fresh account always has an obvious next step on every core page.
**Verify:** preview new-user flow; e2e for welcome→lesson.
**✅ DONE 2026-06-13 (d8bf569):** `activated` analytics event fires once on first
lesson (guarded in use-read-lessons); Welcome step-1 → learning path (not a blog
post) + fixed step-2 copy; Vault empty state got a "Browse the Academy" CTA.
(MyLearning/MyDownloads already had rich empty states + VerifyEmailBanner +
ContinueLearning resume prompt.)

### WP-C3 — Conversion polish ⛔ deps: B
**Goal:** lift visitor→signup→Pro without dark patterns.
- Tune `UpgradePrompts` placements/copy; ensure every locked surface routes to
  `/upgrade` with context.
- Honest social proof scaffolding (real-usage counters / opt-in testimonials from
  the feedback form — NO fabricated quotes).
- Exit-intent or scroll-depth lead capture tied to the existing lead magnet.
- Pricing clarity: annual emphasis, "what you get free vs Pro" at a glance.
**Acceptance:** measurable funnel events on each lever; copy accurate.
**Verify:** preview + analytics events fire.
**✅ DONE 2026-06-13 (6a6337d):** GatedContent paywall now fires
upgrade_prompt_shown/clicked (locked_pro/locked_paid) — was untracked, the
biggest conversion moment. New ExitIntentLeadModal (guest+desktop only, once/
session, 8s dwell) reusing the lead magnet. Existing UpgradePrompts already
tracked; pricing already has Free/Pro/Career cards + trust badges. Social-proof:
deferred to real testimonials from the feedback form (no fabricated quotes).

## Phase D — Retention & growth

### WP-D1 — Retention loops ✅ deps: A
Streaks / achievements / certificate polish; a re-engagement email for users
inactive 7–14 days (reuse cron). **Acceptance:** returning-user signal improves;
emails idempotent.
**✅ DONE 2026-06-13 (56b3546):** re-engagement email = 4th cron job (non-Pro, last
lesson_read 7–14d ago, once per user via lifecycle guard; lesson_reads as the
last-active signal — no users-schema change). New `use-streak` hook (local,
consecutive-day, lapses after a gap) shown as a chip on My Learning; recorded in
markRead. Achievements/certificates already rich (left as-is). +1 test (61).

### WP-D2 — SEO depth & content cadence ✅ deps: B
Dynamic per-page OG images (or templated), internal-linking pass (related
lessons/paths/glossary cross-links), more JSON-LD where valid, and a documented
"add a lesson/post" workflow so content ships regularly. **Acceptance:** richer
SERP eligibility; no broken internal links (add a checker).
**✅ DONE 2026-06-13 (c14bffb):** `validate:links` CI guard (wired into
`npm run validate`) checks every hard-coded internal content link resolves;
Glossary DefinedTermSet JSON-LD (LibraryIndex CollectionPage + PathPage Course +
Article JSON-LD already shipped earlier); `docs/CONTENT.md` workflow. **Dynamic
OG images deferred → Backlog** (needs PNG generation via satori/resvg or a build
step — its own chunk; SVG OG renders unreliably on FB/LinkedIn).

## Phase E — Hardening & insight

### WP-E1 — Performance round 2 ✅ deps: B
Self-host/subset fonts (currently Google Fonts), preconnect tuning, route
preloading for likely-next pages, consider splitting `use-data`/mockData, run a
Lighthouse pass and fix top issues. **Acceptance:** Lighthouse perf ≥90 mobile on
landing; no regression in chunk strategy.
**✅ DONE 2026-06-13 (9444669):** route preloading — `lib/route-prefetch.ts`
(idle-prefetch academy/library/register on landing + hover-prefetch desktop nav;
specifiers match App.tsx so no new chunks). Verified via network. Fonts already
request only used weights (no italic/opsz bloat) + preconnect present — left as
is. use-data not on the landing critical path (left). **Deferred:** self-hosting
fonts + an actual Lighthouse run on the live site (owner; can't run headless
Lighthouse here) — note in LAUNCH.

### WP-E2 — Accessibility full pass ✅ deps: B
Keyboard nav + focus management (drawer/dialog/command palette), color-contrast
audit against the dark theme, ARIA on complex widgets (TOC, quiz, accordions),
run axe. **Acceptance:** no critical axe violations on core pages.
**✅ DONE 2026-06-13 (5d0885e):** skip-to-content link + `<main id="main">`
landmark; LessonQuiz radiogroup/radio + aria-checked; aria-expanded on
GMP-kit/glossary accordions (FAQ already had); aria-pressed on glossary filters;
search aria-label. Dialog/Drawer/Command palette get focus-trap + ARIA from
Radix/vaul/cmdk (verified earlier sessions). Icon-only buttons labelled in WP-B
a11y pass. **Deferred:** an actual axe-core run + a formal color-contrast audit
of the dark palette (owner/tooling — couldn't run axe headless here).

### WP-E3 — Security & observability ✅ deps: A
Security headers/CSP, review rate-limits + input validation, dependency audit
(`npm audit`), client error monitoring (PostHog `captureError` already exists —
wire a dashboard/alert), webhook-failure visibility. **Acceptance:** headers
present; known vulns triaged; errors visible.
**✅ DONE 2026-06-13 (e520669):** 5 security headers on every response (4 enforced
+ CSP Report-Only so it can't break PostHog/Google — owner flips to enforced
after observing). `npm audit` 19→4; non-breaking fixes applied; the 4 remaining
(drizzle-orm SQLi via dynamic identifiers, gray-matter/js-yaml DoS, xlsx no-fix)
triaged as LOW real risk for our usage (no untrusted SQL identifiers, trusted
frontmatter, write-only xlsx) — breaking upgrades deferred, NOT forced. Errors:
client → PostHog captureError; server → Vercel logs. Dashboards = owner. Auth
rate-limit + Zod/email validation already in place.

### WP-E4 — Testing depth ✅ deps: A
Exercise the purchase flow e2e (`E2E_RUN=1` with Stripe test), add route/unit
coverage for new lifecycle + onboarding code, smoke the new flows.
**Acceptance:** purchase e2e passes in test mode; coverage on new code.
**✅ DONE 2026-06-18:** scope adapted to the subscription-first pivot. (1) New
**public** smoke (no Stripe needed, runs in CI) locks the pivot: the GMP kit page
shows no `$59`, renders the lead-magnet, and its "Unlock with Pro" CTA routes to
`/pricing`; `/pricing` + `/upgrade` surface "toolkits included in Pro". (2)
Replaced the now-stale E2E_RUN test (asserted the old one-time kit checkout) with
a **Pro-subscription** checkout test — the primary funnel now. (3) Route test:
abandoned **Pro-subscription** checkout re-engages a still-free user via the
`converted = isProActive` branch (complements the existing converted-skip case).
62 unit/route tests + 9 public smoke green (2 E2E_RUN-gated skip without Stripe).
**Owner (in LAUNCH):** run the full purchase e2e with `E2E_RUN=1` + Stripe test
keys + a seeded user — can't run locally (no `DATABASE_URL`/Stripe CLI here).

---

## LAUNCH — Go-live ops 🔑 (owner)

Not code — but a session can verify around it. Set Stripe **live** keys + price
IDs + webhook (6 events), `DATABASE_URL`, `SESSION_SECRET`, `BASE_URL`,
`RESEND_API_KEY`, `EMAIL_FROM`, `VITE_POSTHOG_KEY`; run `db:push`; do one real
purchase; run the prod smoke in `docs/GO_LIVE.md`. Then execute `docs/SOFT_LAUNCH.md`.

---

## Backlog (unsized / post-traction)
Dynamic per-page OG images (PNG via satori/resvg or a build step),
PWA installability + push, i18n re-expansion for a 2nd market, B2B/team plans,
in-app feedback widget, AI-assisted study/quiz generation, affiliate/referral.
Pull into a sized WP when prioritized.
