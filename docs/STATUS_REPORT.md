# Life Science Atlas — Status & Launch-Readiness

> **Strategic status notice (2026-07-10):** This report remains an operational snapshot of the legacy knowledge-PWA and monetization stack. Its product definition and future-bet priorities are superseded by `docs/PRODUCT_SOURCE_OF_TRUTH.md`. Do not use this report as the current product strategy.

> **Purpose:** Hand-off doc so a future session (or the owner) knows the true state of the product and exactly what remains to flip on before / during commercial onboarding.
> **Updated:** 2026-06-12
> **Latest commit:** `ae9659f`
> **Live:** https://lifescienceatlas.com

---

## 1. What the product is

Life Science Atlas is a **mobile-first PWA** for **QC/QA professionals in Pharma/Biotech/Life-Science**, sold to a **global, English-only** audience (freemium). Director-level content on GMP, sterility/EM, OOS/CAPA investigations, Annex 1, data integrity, validation, biologics QC, audit prep and career growth.

**Positioning:** written from real-world QC *and* vendor (industrial microbiology) experience — frameworks that apply immediately, not theory.

### Monetization
| Product | Price | Type | State |
|---|---|---|---|
| Academy + Library (78 long-form lessons, 7 learning paths) | Free to start | — | ✅ Free tier live; ~30 lessons are Pro-gated |
| GMP Audit Survival Kit | Included in Pro | subscription | ✅ Folded into Pro (2026-06-18) — page now drives Pro, no standalone sale; unlocked via `isProActive` + real PDF/Excel fulfillment. Legacy one-time buyers keep access. |
| Career Starter Kit | $15 | one-time | ✅ Real deliverables (CV / cover letter / LinkedIn / employer CSV) |
| Interview Prep Pack | $20 | one-time | ✅ Real deliverable (100+ Q&A) |
| Career Accelerator Bundle | $30 | one-time | ✅ Unlocks the two career products |
| Pro Subscription | $8/mo | subscription | ✅ Checkout + **7-day free trial** + dunning + lazy entitlement |

> The four commercialization gaps flagged in the original assessment (Pro content depth, kit fulfillment, honest social proof, trial + nurture) are **all closed**. See memory `commercialization-gaps`.

---

## 2. Architecture (full detail in `CLAUDE.md`)

- **Monorepo:** `client/` (React 18 + Vite + Wouter + TanStack Query + shadcn/ui), `server/` (Express 5 + Drizzle + PostgreSQL), `shared/` (types + typed API contract).
- **Auth:** email/password (bcryptjs) + Express sessions (connect-pg-simple); Google sign-in optional; soft email verification; password reset; rate-limited auth routes.
- **Billing:** Stripe checkout (subscriptions + one-time), customer portal, webhook with idempotency + dunning grace; entitlement via `server/entitlements.ts`.
- **Content engine:** MDX-in-repo (`content/{academy,blog,toolkits}/*.en.mdx`) + Postgres metadata; **server-side gating** (`GET /api/content/:collection/:slug`) so paid bodies never ship in the public bundle.
- **Fulfillment:** gated in-app downloads (`/api/downloads`) generating **real PDF/Excel binaries on the fly** (`server/generate.ts`); `/my-downloads` page.
- **Email:** Resend transactional (welcome / purchase / lead magnet / dunning / reset / verification) + 3-step free→Pro nurture drip via daily cron.
- **Deploy:** Vercel — `api/index.ts` serverless entry wraps the Express app; `vercel.json` ships `dist/**` + `content/**`.
- **Analytics:** PostHog page-views + a wired conversion funnel (`use-analytics.ts`: lead → checkout → subscription/purchase, upgrade prompts, pro modal).

### Content footprint
78 academy MDX + 23 blog MDX; 7 disjoint learning paths (every academy lesson in exactly one, enforced by `npm run validate:paths`); structured `/academy/:slug` lessons from `microbiologyLessons`.

### Tests
`npm test` runs Vitest server/unit coverage. `npm run test:e2e` runs the Playwright public smoke suite. Content guards include `validate:content`, `validate:paths`, `validate:links`, and `validate:tool-meta`.

---

## 3. Data state

Most *page* content is still static mock data (`client/src/data/`) served via `use-data.ts` hooks that simulate latency — by design. **Real client→server flows:** auth, lead capture, quote requests, Stripe checkout, content gating, downloads, reading progress, nurture cron. Long-form content is MDX (gated server-side). DB via Drizzle schema-push (no migration files).

---

## 4. Launch-readiness checklist (owner actions)

The code is ready; these are the **operational switches** to go live. None require new code.

### Must-have to take money
- [ ] **Vercel env audit** — confirm real (not placeholder) values: `DATABASE_URL`, `SESSION_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `VITE_STRIPE_PUBLISHABLE_KEY`, and **all 5 Stripe price IDs** (`STRIPE_PRO_PRICE_ID` + the 4 one-time kits), `RESEND_API_KEY`, `EMAIL_FROM`.
- [ ] **Stripe webhook** registered in the Stripe dashboard pointing at `/api/stripe/webhook`, signing secret matches `STRIPE_WEBHOOK_SECRET`.
- [ ] **End-to-end test purchase** (Stripe test mode): buy GMP kit → success page → webhook fires → purchase recorded → `/my-downloads` serves the real PDF/Excel; buy Pro → 7-day trial starts → entitlement active.

### Activate nurture drip (optional but recommended)
- [ ] `npm run db:push` to create the `nurture_sends` table, set `CRON_SECRET` in Vercel env, redeploy. (Trial works *without* this; only the drip needs it.)

### Pre-launch polish
- [ ] **Custom domain** instead of `*.vercel.app` (SEO + email deliverability) — update canonical/sitemap base if it changes.
- [ ] **PostHog** — set `VITE_POSTHOG_KEY` (build-time; needs redeploy) to start capturing the conversion funnel from day one.
- [ ] **Re-probe prod auth** (`/api/auth/register` → 201) after any DB-touching deploy — see the migration-first rule in `CLAUDE.md`.
- [ ] **One known a11y contrast issue (owner design call).** An axe-core (WCAG 2.1 AA) sweep of the home, pricing, workflow-detail, and all tool pages came back clean **except one systemic item**: the default primary `Button` is white text on the brand teal `#14b89f` (≈2.5:1, needs 4.5:1) — most visible as the header **"Sign In"** on every page. The app's prominent CTAs already use the accessible pattern (`bg-teal-500 text-teal-950`, dark-on-teal), so the simplest fix is to set `--primary-foreground` to a dark teal to match — a brand-token decision left to the owner. Everything else audited is WCAG AA clean.

---

## 5. Remaining tech debt / future bets (none block launch)

| # | Item | Note |
|---|---|---|
| 1 | Social proof | Add real reviews / case studies once paying users exist (current copy is honest, no fabricated testimonials). |
| 2 | Conversion analytics | Funnel is instrumented; once traffic flows, build a trial→paid dashboard in PostHog. |
| 3 | Content growth | More learning paths / lessons; the MDX engine auto-registers new files. |
| 4 | Second market | i18n is retained as an English-only catalog; could re-expand for a localized market later. |
| 5 | Migration discipline | Drizzle is schema-push (no history) — consider migrations before prod data grows. |

---

## 6. Common commands
```bash
npm run dev              # Express + Vite HMR (port 5000)
npm run check            # type-check (tsc) — currently clean
npm run build            # vite client + esbuild server → dist/
npm start                # run production build
npm run db:push          # push Drizzle schema (no migration files)
npm test                 # vitest server/unit coverage
npm run test:e2e         # playwright public smoke
npm run validate:content # MDX frontmatter / escaping guard
npm run validate:paths   # every academy lesson in exactly one path
```
