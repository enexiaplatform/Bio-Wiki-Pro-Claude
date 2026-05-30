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
```

No test suite is configured. There is no `npm test` command.

## Architecture Overview

BioWikiPro is a mobile-first PWA for QC/QA professionals in the Pharma/Biotech/Life-Science space (primarily Vietnam), with a freemium model. It is a monorepo with **client**, **server**, and **shared** code that share types and an API contract.

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
  db.ts             Drizzle client via DATABASE_URL
  email.ts          Resend transactional email (welcome / purchase / lead magnet)
shared/
  schema.ts         Content TS interfaces (Term, AcademyEntry, Job, Product, LabTool, SOP, Skill) + leads/quoteRequests tables + Zod insert schemas
  models/auth.ts    Auth/billing DB tables: users, sessions, purchases
  routes.ts         Typed API contract (path, method, Zod schemas) — imported by client AND server
api/index.ts        VERCEL serverless entry — wraps the Express app as a single function
script/build.ts     Custom build: vite build (client) → esbuild bundle (server) → dist/
```

### Routing (Wouter, `client/src/App.tsx`)

Client-side routing via **Wouter** `<Switch>`/`<Route>`. There is no server-side routing for pages — the SPA handles everything and the server falls back to `index.html`.

- `/` → **LandingPage** (marketing). Note: `/` is NOT a redirect to `/qc-hub` (that was the old behavior).
- Core app: `/qc-hub`, `/academy`, `/academy/:slug`, `/insights`, `/tools`, `/compliance`, `/vault`, `/career`, `/solutions`, `/settings`
- Monetization: `/pricing`, `/upgrade`, `/toolkits/gmp-audit-kit`, `/payment/success`
- Auth: `/login`, `/register`, `/signup` (both map to RegisterPage)
- Legal: `/terms`, `/privacy`, `/refund`
- Fallback: NotFound

The whole tree is wrapped in `<ErrorBoundary>` (in `App.tsx`) so a single component throw shows a fallback instead of a blank page. `usePageTracking()` runs at the Router level for PostHog page views.

### Data Layer (IMPORTANT)

Most content is **static mock data**, not from the database.

- Page content comes from `client/src/data/mockData.ts` (and `data/{lessons,compliance,scenarios,tools}/`) via React Query hooks in `client/src/hooks/use-data.ts`. These hooks **simulate latency with `setTimeout`** and return in-memory arrays — they do NOT hit the server.
- The only **real** client→server calls are: quote requests (`POST /api/quotes` via `useCreateQuoteRequest`), auth (`/api/auth/*`), lead capture (`/api/leads/capture`), and Stripe checkout.
- Content interfaces live in `shared/schema.ts` and are imported by both the client hooks and (potentially) the server.

When asked to "wire up real data", the work is: move a `use-data.ts` hook from returning a mock array to fetching a server endpoint, and add that endpoint + storage method.

### API Endpoints (`server/routes.ts`, registered via `registerRoutes(app)`)

- **Auth** (session-based, bcryptjs): `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` (guarded by `isAuthenticated`)
- **Stripe**: `POST /api/stripe/create-checkout-session` (guarded), `GET /api/stripe/customer-portal` (guarded), `POST /api/stripe/webhook` (raw-body signature verify; handles `checkout.session.completed` → unlock Pro / record purchase + send email, and `customer.subscription.deleted` → revoke Pro)
- **Leads**: `POST /api/leads/capture` (lead magnet email capture)
- **Contract-defined** (`shared/routes.ts`): `POST /api/quotes` (quote request), `POST /api/users/toggle-pro` (guarded)

`isAuthenticated` checks `req.session.userId`. Session middleware (`setupSession`) uses `connect-pg-simple` backed by `DATABASE_URL`; without it, sessions fall back to memory. The Stripe webhook is registered before session middleware and uses `req.rawBody` (captured by the `express.json` verify hook) for signature verification.

### Auth & Pro Gating

- **Auth is email/password** with bcryptjs hashing + Express sessions — NOT Replit OpenID Connect (that was the old design; ignore stale references). `useAuth` (`use-auth.ts`) calls `GET /api/auth/me`; a 401 means guest mode.
- `useUser()` (from `UserContext`) exposes `user`, `isAuthenticated`, and `isPro` (`user.isPro`). Pro is granted server-side via the Stripe webhook on subscription, or `POST /api/users/toggle-pro`.
- Locked content renders `<ProModal>`. Most gating today is client-side; treat server-side enforcement as the source of truth for real entitlements.

### Database (Drizzle + PostgreSQL)

PostgreSQL via `DATABASE_URL`. Drizzle ORM with **schema-push** (`drizzle-kit push`) — there are **no migration files**, so schema changes apply directly.

Tables:
- `shared/models/auth.ts`: **users** (id, email, names, isPro, passwordHash, reset token fields, Stripe fields, timestamps), **sessions** (connect-pg-simple store), **purchases** (userId, productType, Stripe IDs, amount in cents, status)
- `shared/schema.ts`: **leads** (email, source, downloadSent), **quote_requests**

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

> The legacy 48 Academy entries still come from `mockData.ts` — migration to MDX is pending (will use a frontmatter-heavy variant to preserve the structured render contract).

## Known Tech Debt

- Client bundle is a single ~750KB chunk (no code-splitting yet).
- See `docs/STATUS_REPORT.md` for the full development plan and `docs/adr/` for architecture decisions in flight.
