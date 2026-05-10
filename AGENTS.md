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

# Push DB schema changes (no migration files — direct push)
npm run db:push
```

No test suite is configured. There is no `npm test` command.

## Architecture Overview

BioWiki Pro is a mobile-first PWA for Biotech/Pharma/Life Science professionals with a freemium model. The app runs as a monorepo with client, server, and shared code.

### Project Layout

```
client/src/         React frontend (Vite root)
  pages/            One file per route (QCHub, Academy, Insights, LabTools, Compliance, Career, Solutions, Settings, UpgradePage)
  components/       Navigation + ProModal; shadcn/ui primitives in ui/
  context/          UserContext — provides auth state and isPro flag
  hooks/            use-data.ts (all data hooks), use-auth.ts
  data/             mockData.ts — all static content (Terms, Jobs, SOPs, Products, LabTools, Skills)
server/
  index.ts          Express 5 app entry, sets up middleware and starts HTTP server
  routes.ts         Registers API endpoints using shared/routes.ts contract
  storage.ts        IStorage interface + DatabaseStorage (Drizzle + PostgreSQL)
  db.ts             Drizzle client setup via DATABASE_URL
shared/
  schema.ts         DB table defs (users, quoteRequests), Zod insert schemas, and ALL mock data TypeScript interfaces
  routes.ts         Typed API contract (path, method, Zod response schemas) — imported by both client and server
script/build.ts     Custom build: Vite for client → esbuild for server → dist/
```

### Key Patterns

**Data flow**: All page data comes from `client/src/data/mockData.ts` via React Query hooks in `use-data.ts`. The hooks simulate network latency with `setTimeout`. The only real API calls are quote request submission (`POST /api/quotes`) and Pro toggle (`POST /api/users/toggle-pro`).

**Pro/Free gating**: `useUser()` from `UserContext` exposes `isPro`. Locked content renders `<ProModal>` which calls `togglePro()` → hits `/api/users/toggle-pro`. Without Replit auth env vars (`REPL_ID` + `SESSION_SECRET`), this endpoint always returns 401.

**Auth**: Auth is Replit OpenID Connect, gated by `REPL_ID` and `SESSION_SECRET` env vars. Without them, `/api/auth/user` always returns 401 and the app runs unauthenticated (guest mode, no Pro features).

**Routing**: Wouter handles client-side routing. Default route `/` redirects to `/qc-hub`. Routes are defined in `client/src/App.tsx`.

**Path aliases** (configured in `vite.config.ts` and `tsconfig.json`):
- `@/` → `client/src/`
- `@shared/` → `shared/`
- `@assets/` → `attached_assets/`

**Shared types**: All data interfaces (`Term`, `AcademyEntry`, `Job`, `Product`, `LabTool`, `SOP`, `Skill`) are defined in `shared/schema.ts` and imported in both client hooks and server code.

### Database

PostgreSQL via `DATABASE_URL` env var. Drizzle ORM with schema-push (no migration files). Two tables: `users` and `quote_requests`. Schema is in `shared/schema.ts`; auth models (`users` table) are in `shared/models/auth.ts`.

### Build Output

- `dist/public/` — Vite client build (static assets served by Express in production)
- `dist/index.cjs` — esbuild server bundle (CommonJS, run with `node dist/index.cjs`)

### Styling

Tailwind CSS with dark scientific/premium palette using CSS variables. Custom fonts: `Inter` (sans) and `Space Grotesk` (display). Component library is shadcn/ui (new-york style) with Radix UI primitives.
