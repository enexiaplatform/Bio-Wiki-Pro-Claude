# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Commands

```bash
# Development (runs Express + Vite HMR on port 5000)
npm run dev

# Type-check only
npm run check

# Build for production (Vite client + esbuild server)
npm run build

# Run production build
npm start

# Push DB schema changes (no migration files - direct push)
npm run db:push

# Content/path/link/tool metadata validation + type-check
npm run validate

# Tests
npm test
npm run test:e2e
```

Vitest and Playwright are configured. Use `npm run validate` for the full content/path/link/tool metadata/type-check gate, `npm test` for server/unit coverage, and `npm run test:e2e` for the public smoke suite.

## Architecture Overview

Life Science Atlas is a mobile-first PWA for Biotech/Pharma/Life Science professionals with a freemium model. The app runs as a monorepo with client, server, shared code, and MDX content.

### Project Layout

```text
client/src/         React frontend (Vite root)
  pages/            One file per route (Landing, Workflows, Academy, Library, Blog, Tools, Toolkits, Compliance, Career, Settings, Upgrade/Pricing)
  features/         Domain UI grouped by academy, compliance, tools, vault
  components/       Navigation, Footer, CommandPalette, ProModal/GatedContent; shadcn/ui primitives in ui/
  context/          UserContext - provides auth state and isPro flag
  hooks/            use-data.ts, use-auth.ts, use-analytics.ts, use-seo.ts
  data/             mockData.ts + structured lessons/workflows/tools/learning paths
content/            MDX academy/blog/toolkit content and gated deliverables
server/
  index.ts          Express 5 app entry for local dev
  routes.ts         API endpoints for auth, Stripe, content gating, downloads, progress, leads, sitemap/RSS
  storage.ts        IStorage interface + DatabaseStorage (Drizzle + PostgreSQL)
  db.ts             Drizzle client setup via DATABASE_URL
  static.ts         Production static serving + crawler meta injection
shared/
  schema.ts         DB table defs for leads/content/progress/quotes and mock data TypeScript interfaces
  models/auth.ts    Auth/billing DB tables (users, sessions, purchases)
  routes.ts         Typed API contract (path, method, Zod response schemas)
script/build.ts     Custom build: Vite for client -> esbuild for server -> dist/
```

### Key Patterns

**Data flow**: Much of the product surface is static data from `client/src/data/` and MDX under `content/`. MDX metadata is generated into `client/src/data/content-manifest.json`; academy/toolkit bodies are fetched through the server-gated content endpoint so paid bodies do not ship to guests. Real API calls include auth, lead capture, Stripe checkout/webhooks, content gating, downloads, reading progress, quote requests, and the dev/admin Pro toggle.

**Pro/Free gating**: `useUser()` from `UserContext` exposes `isPro`. Server-side entitlement lives in `server/entitlements.ts` and is enforced by `/api/content/:collection/:slug` plus `/api/downloads`. Pro is normally granted by Stripe webhooks; `/api/users/toggle-pro` is a dev/admin tool.

**Auth**: Auth is email/password with bcrypt and Express sessions, plus optional Google ID-token sign-in. `GET /api/auth/me` returns the current session user; 401 means guest mode.

**Routing**: Wouter handles client-side routing. `/` is the workflow-first landing page. Legacy `/qc-hub` and `/library` redirect into `/academy`; legacy `/en/*` and `/vi/*` redirect to clean English-only URLs. Routes are defined in `client/src/App.tsx`.

**English-only product direction**: `react-i18next` is retained as a central English string catalog. Do not reintroduce `/en` or `/vi` routes or a language switcher unless product direction changes.

**Path aliases** (configured in `vite.config.ts` and `tsconfig.json`):
- `@/` -> `client/src/`
- `@shared/` -> `shared/`
- `@assets/` -> `attached_assets/`

**Shared types**: Static data interfaces are defined in `shared/schema.ts`. Auth/billing types come from `shared/models/auth.ts`.

### Database

PostgreSQL via `DATABASE_URL` env var. Drizzle ORM uses schema-push (no migration files). Auth/billing tables live in `shared/models/auth.ts`; content, leads, quote requests, Stripe event idempotency, lifecycle email guards, and lesson reads live in `shared/schema.ts`.

### Build Output

- `dist/public/` - Vite client build (static assets served by Express in production)
- `dist/index.cjs` - esbuild server bundle (CommonJS, run with `node dist/index.cjs`)

### Styling

Tailwind CSS with a dark scientific/premium palette using CSS variables. Custom fonts: `Inter` (sans) and `Space Grotesk` (display). Component library is shadcn/ui (new-york style) with Radix UI primitives.
