# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development — Express + Vite HMR on a single port (5000)
npm run dev

# Type-check only (no emit)
npm run check

# Production build — Vite client → esbuild server (see script/build.ts)
npm run build

# Run the production build
npm start

# Push Drizzle schema to the DB (drizzle-kit push — NO migration files)
npm run db:push

# Validate content + learning-path coverage (CI guards)
npm run validate:content   # MDX frontmatter / escaping
npm run validate:paths     # every academy lesson in exactly one learning path

# Tests
npm test                   # vitest (server unit + route tests)
npm run test:e2e           # playwright public smoke (auto-starts dev server)
```

**Testing:** `vitest` (42 unit/route tests in `server/__tests__/`) + `playwright` E2E (`e2e/smoke.spec.ts` — 7 public smoke tests; purchase flow opt-in via `E2E_RUN=1`). Two content guards: `validate:content` and `validate:paths`.

## Localization (IMPORTANT — product direction)

**English-only, global market.** Bilingual (VI) support was removed. Concretely:

- URLs are **clean / unprefixed** (`/pricing`, `/blog/x`, `/library/x`). There is
  NO `/en` or `/vi` prefix and NO language switcher. Legacy `/en/*` and `/vi/*`
  URLs redirect to the clean path (`App.tsx` `LegacyLangRedirect`).
- `react-i18next` is **retained as a central English string catalog only**:
  `SUPPORTED_LNGS = ['en']`, default `en`, locale files under
  `client/src/i18n/locales/en/`. UI copy still goes through `t()` — add new
  strings to the `en` JSON; there are no other languages.
- Content (MDX) is English: `content/{academy,blog,toolkits}/<slug>.en.mdx`.
- `use-seo.ts` emits a single canonical + `og:locale=en_US` (no hreflang). The
  dynamic `/sitemap.xml` lists clean English URLs.
- When adding UI, prefer `t()` with an `en` key (keeps copy centralized), or
  plain English text — never reintroduce a second language.

## Architecture Overview

BioWikiPro is a mobile-first PWA for QC/QA professionals in the Pharma/Biotech/Life-Science space, sold to a **global** audience (English-first; strong Vietnam presence). It is a monorepo with **client**, **server**, and **shared** code that share types and an API contract.

### Project Layout

```
client/src/         React 18 frontend (Vite root is client/)
  pages/            One file per route — see Routing below
  features/         Domain UI grouped by area: academy/, compliance/, tools/, vault/
  components/       Navigation, ProModal, Footer, LeadMagnetBanner, ErrorBoundary; shadcn/ui primitives in ui/
  context/          UserContext — exposes auth state + isPro flag
  hooks/            use-data.ts (mock data hooks), use-auth.ts, use-analytics.ts (PostHog), use-seo.ts
  data/             mockData.ts + data/{lessons,compliance,scenarios,tools}/ — all static content
  lib/              queryClient.ts, utils
server/
  index.ts          Express 5 entry for LOCAL dev (sets up middleware + HTTP server)
  routes.ts         registerRoutes(app) — all API endpoints; Stripe webhook; session setup; auth guards
  storage.ts        IStorage interface + DatabaseStorage (Drizzle + PostgreSQL)
  static.ts         serveStatic(app) — serves dist/public, SPA fallback to index.html
  db.ts             Drizzle client; exports resolved `connectionString` (DATABASE_URL → POSTGRES_URL → POSTGRES_PRISMA_URL → POSTGRES_URL_NON_POOLING — supports the Supabase/Vercel integration var names)
  email.ts          Resend transactional email (welcome / purchase / lead magnet / dunning / password-reset) — all English
  entitlements.ts   isProActive(user) — lazy entitlement (period end + dunning grace); source of truth for /me + gating
shared/
  schema.ts         Content TS interfaces (Term, Job, Product, LabTool, SOP, Skill) + leads/quoteRequests/contentEntries/processedStripeEvents/lessonReads tables + Zod insert schemas
  models/auth.ts    Auth/billing DB tables: users (incl. reset-token cols), sessions, purchases
  routes.ts         Typed API contract (path, method, Zod schemas) — imported by client AND server
api/index.ts        VERCEL serverless entry — wraps the Express app as a single function
script/build.ts     Custom build: vite build (client) → esbuild bundle (server) → dist/
```

### Routing (Wouter, `client/src/App.tsx`)

Client-side routing via **Wouter** `<Switch>`/`<Route>`. There is no server-side routing for pages — the SPA handles everything and the server falls back to `index.html`.

- `/` → **LandingPage** (marketing). Note: `/` is NOT a redirect to `/qc-hub` (that was the old behavior).
- Core app: `/qc-hub`, `/academy`, `/academy/:slug` (structured `microbiologyLessons`), `/insights`, `/tools`, `/compliance`, `/vault`, `/career`, `/solutions`, `/settings`
- Content (MDX): `/library` (curriculum hub, grouped by path), `/library/:slug` (gated reader), `/blog`, `/blog/:slug`, `/glossary`, `/about`
- Learning: `/paths/:slug` (a learning track), `/certificate/:slug` (printable + PNG-downloadable, gated on 100% path completion), `/my-learning` (personal dashboard: progress, achievements, certificates — linked from the desktop nav avatar)
- Monetization: `/pricing`, `/upgrade`, `/toolkits/gmp-audit-kit`, `/payment/success`
- Auth: `/login`, `/register`, `/signup` (both RegisterPage), `/forgot-password`, `/reset-password`. Login/Register also offer **Google sign-in** (`GoogleSignInButton`, shown only when `VITE_GOOGLE_CLIENT_ID` is set).
- Legal: `/terms`, `/privacy`, `/refund`
- Fallback: NotFound

> Learning paths live in `client/src/data/learningPaths.ts` — **6 disjoint paths covering all academy lessons** (invariant enforced by `npm run validate:paths`). Reading progress (`use-read-lessons.ts`) is localStorage-first and syncs to the DB (`lesson_reads`) for logged-in users when that table exists (degrades gracefully pre-migration). `getPathContext()` drives reader prev/next + the "Lesson X of N" header.

The whole tree is wrapped in `<ErrorBoundary>` (in `App.tsx`) so a single component throw shows a fallback instead of a blank page. `usePageTracking()` runs at the Router level for PostHog page views.

### Data Layer (IMPORTANT)

Most content is **static mock data**, not from the database.

- Page content comes from `client/src/data/mockData.ts` (and `data/{lessons,compliance,scenarios,tools}/`) via React Query hooks in `client/src/hooks/use-data.ts`. These hooks **simulate latency with `setTimeout`** and return in-memory arrays — they do NOT hit the server.
- The only **real** client→server calls are: quote requests (`POST /api/quotes` via `useCreateQuoteRequest`), auth (`/api/auth/*`), lead capture (`/api/leads/capture`), and Stripe checkout.
- Content interfaces live in `shared/schema.ts` and are imported by both the client hooks and (potentially) the server.

When asked to "wire up real data", the work is: move a `use-data.ts` hook from returning a mock array to fetching a server endpoint, and add that endpoint + storage method.

### API Endpoints (`server/routes.ts`, registered via `registerRoutes(app)`)

- **Auth** (session-based, bcryptjs): `POST /api/auth/register` (email-format + 8-char validation), `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` (guarded). **Password reset:** `POST /api/auth/forgot-password` (enumeration-safe, always 200; 1h crypto token emailed) + `POST /api/auth/reset-password`. **Google sign-in:** `POST /api/auth/google` (verifies the GIS ID token via `google-auth-library`, find-or-create by verified email; 503 if `GOOGLE_CLIENT_ID` unset). **Email verification (soft, non-blocking):** register issues a 24h token + emails a confirm link; `POST /api/auth/verify-email` sets `verifiedEmail`; `POST /api/auth/resend-verification` (authed) reissues it; `<VerifyEmailBanner>` prompts unverified users on the dashboard. All auth POSTs are behind an in-memory `express-rate-limit` (30/15min).
- **Progress** (guarded): `GET`/`POST /api/progress/reads` (cross-device reading progress; fails soft → `{reads:[]}` / `{ok:false}` if the `lesson_reads` table is absent, so the client falls back to localStorage).
- **Stripe**: `POST /api/stripe/create-checkout-session` (guarded), `GET /api/stripe/customer-portal` (guarded), `POST /api/stripe/webhook` (raw-body signature verify; subscription lifecycle + dunning + idempotency via `processed_stripe_events`)
- **Leads**: `POST /api/leads/capture` (lead magnet email capture)
- **SEO**: `GET /sitemap.xml` (dynamic — core pages + `/library` + `/paths/*` + all blog/academy), `GET /blog/rss.xml`. `serveStatic` injects per-page OG/title meta into `index.html` for `/blog/:slug` and `/library/:slug` (crawlers don't run the client JS).
- **Contract-defined** (`shared/routes.ts`): `POST /api/quotes` (quote request), `POST /api/users/toggle-pro` (guarded)

`isAuthenticated` checks `req.session.userId`. Session middleware (`setupSession`) uses `connect-pg-simple` backed by the resolved `connectionString` (`db.ts`); without it, sessions fall back to memory. The Stripe webhook is registered before session middleware and uses `req.rawBody` for signature verification.

> ⚠️ **Migration-first rule (learned from an outage):** Drizzle `db.select().from(users)` selects *all* schema columns, so adding a column to the `users` schema and deploying **before** `db:push` runs breaks every user query (register/login/me 500). Never ship a `users` schema change ahead of its migration — stage it on a branch, run `db:push`, then merge. Always re-probe prod auth (`/api/auth/register`) after any DB-touching deploy.

### Auth & Pro Gating

- **Auth is email/password** with bcryptjs hashing + Express sessions — NOT Replit OpenID Connect (that was the old design; ignore stale references). `useAuth` (`use-auth.ts`) calls `GET /api/auth/me`; a 401 means guest mode.
- `useUser()` (from `UserContext`) exposes `user`, `isAuthenticated`, and `isPro` (`user.isPro`). Pro is granted server-side via the Stripe webhook on subscription, or `POST /api/users/toggle-pro`.
- Locked content renders `<ProModal>`. Most gating today is client-side; treat server-side enforcement as the source of truth for real entitlements.

### Database (Drizzle + PostgreSQL)

PostgreSQL via `DATABASE_URL`. Drizzle ORM with **schema-push** (`drizzle-kit push`) — there are **no migration files**, so schema changes apply directly.

> **Schema import split (don't undo):** `shared/schema.ts` does **not** re-export `./models/auth.js` — that `.js` extension is required for Vercel native ESM but drizzle-kit's loader can't resolve `.js`→`.ts`, which broke `db:push`. So `drizzle.config.ts` lists **both** files (`schema.ts` + `models/auth.ts`), and app code imports auth tables/types from `@shared/models/auth`. Keep them separate.
>
> **Running `db:push` against Supabase locally:** use the **Session pooler** URL (port 5432) and, because the local Node may not trust Supabase's cert, set `NODE_TLS_REJECT_UNAUTHORIZED=0` + `?sslmode=no-verify` for that one-off command.

Tables:
- `shared/models/auth.ts`: **users** (id, email, names, isPro, passwordHash, reset-token + verification-token fields, Stripe fields, timestamps), **sessions** (connect-pg-simple store), **purchases** (userId, productType, Stripe IDs, amount in cents, status)
- `shared/schema.ts`: **leads**, **quote_requests**, **content_entries**, **processed_stripe_events**, **lesson_reads** (per-user reading progress)

`server/storage.ts` defines `IStorage` and `DatabaseStorage` (the methods: getUser/byEmail/byStripeCustomerId, createUser, updateUserPro, updateUserStripe, createPurchase, createQuoteRequest, captureLead).

### Deployment (Vercel)

- **`api/index.ts`** is the Vercel serverless entry. It lazily builds the Express app (`registerRoutes` + `serveStatic`) once and reuses it across invocations (`appPromise`). This is the production runtime — `server/index.ts` is only for local `npm run dev`.
- **`vercel.json`** runs `npm run build`, includes `dist/**` in the function bundle, and routes BOTH `/api/(.*)` and `/(.*)` to `api/index.ts` (the Express app serves static assets + SPA fallback itself).
- `VITE_*` env vars are **inlined at build time** — changing them requires a redeploy. Non-`VITE_` vars (DB, Stripe secret, Resend) are runtime.
- Client build does NOT mark `drizzle-orm`/`drizzle-zod` as external (doing so crashes the browser bundle, since `shared/schema.ts` imports them and the client imports `@shared/schema`). The server bundle (`script/build.ts`) keeps an allowlist of deps to bundle for faster cold starts.

### Path Aliases (`vite.config.ts` + `tsconfig.json`)

- `@/` → `client/src/`
- `@shared/` → `shared/`
- `@assets/` → `attached_assets/`

### Build Output

- `dist/public/` — Vite client build (static assets; served by Express/`serveStatic` in production)
- `dist/index.cjs` — esbuild server bundle (CommonJS; `node dist/index.cjs`)

### Styling

Tailwind CSS with a dark scientific/premium palette via CSS variables. Fonts: `Inter` (sans) and `Space Grotesk` (display). Component library is shadcn/ui (new-york style) over Radix UI; animations via framer-motion.

## Content Engine (MDX + Postgres hybrid)

New long-form content uses MDX-in-repo + Postgres metadata (see `docs/adr/0001-content-mdx-postgres.md`):

- **Files:** `content/{academy,blog,toolkits}/{slug}.{vi|en}.mdx` — YAML frontmatter (`title, slug, lang, tier, category, seoDescription, updatedAt`) + MDX prose body.
- **Build-time loader:** `client/src/lib/content.ts` (`listContent`/`getContentBySlug`) via `import.meta.glob` over `content/**/*.mdx`. Adding a file auto-registers it.
- **DB:** `content_entries` (slug, lang, tier, published, sort, viewCount) holds operational state. `npm run seed:content` syncs frontmatter → DB.
- **Gating is server-side:** `GET /api/content/:collection/:slug?lang=` returns the full body only when the session is entitled (free / `isPro` / completed purchase); otherwise `{ locked: true, teaser }` with NO body. `<GatedContent>` renders it (react-markdown). Pro/paid bodies are never shipped in the public client bundle.
- `content/` sits outside the Vite `client/` root → `vite.config.ts` sets `server.fs.allow` + `@content` alias, and `vercel.json` ships `content/**` in the function bundle for runtime gating.

> The old `importedAcademyEntries` (48 structured `AcademyEntry` records in `mockData.ts`, plus the `useImportedAcademyEntries` hook and the `AcademyEntry` interface) were **removed as dead code** — they were never rendered by any route (Rollup already tree-shook them out of the bundle) and are superseded by the MDX library under `content/academy/`. The rich structured lessons at `/academy/:slug` come from `microbiologyLessons` (`data/lessons/microbiologyLessons.ts`); long-form content lives in `content/**/*.en.mdx` and renders at `/library/:slug`.

## Known Tech Debt

- Client bundle is a single ~750KB chunk (no code-splitting yet).
- See `docs/STATUS_REPORT.md` for the full development plan and `docs/adr/` for architecture decisions in flight.
