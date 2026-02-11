# BioWiki Pro

## Overview

BioWiki Pro is a mobile-first PWA (Progressive Web App) serving as a pocket mentor for students and professionals in Biotech, Pharma, and Life Science. It provides a knowledge hub with five main sections: Academy (learning terms/concepts), Lab Tools (scientific calculators), Compliance (SOPs and guidelines), Career (job listings), and Solutions (lab equipment/reagent marketplace with quote requests). The app features a freemium model with a "Pro" upgrade that unlocks gated content.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, bundled via Vite
- **Routing**: Wouter (lightweight alternative to React Router) — routes defined in `client/src/App.tsx`
- **State Management**: React Context API for user state (`UserContext` manages Pro status, persisted to localStorage)
- **Data Fetching**: TanStack React Query with custom hooks in `client/src/hooks/use-data.ts`
- **UI Components**: shadcn/ui (new-york style) with Radix UI primitives, located in `client/src/components/ui/`
- **Styling**: Tailwind CSS with CSS variables for theming (dark scientific/premium palette with teal accent). Custom fonts: Inter (sans) and Space Grotesk (display)
- **Animations**: Framer Motion for page transitions, tab animations, and modal effects
- **Icons**: Lucide React

### Key Frontend Patterns
- Mobile-first layout with sticky bottom tab navigation (5 tabs) and desktop top navigation
- Safe-area-aware padding for mobile devices
- Mock data loaded through React Query hooks (simulating API calls with timeouts) from `client/src/data/mockData.ts`
- Pro/Free gating with `ProModal` component that toggles Pro status via context
- Path aliases: `@/` → `client/src/`, `@shared/` → `shared/`, `@assets/` → `attached_assets/`

### Backend Architecture
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript, executed via tsx
- **API Pattern**: REST endpoints defined in `server/routes.ts` with shared API contract in `shared/routes.ts`
- **Validation**: Zod schemas (shared between client and server via `shared/schema.ts` and `shared/routes.ts`)
- **Development**: Vite dev server middleware with HMR served through Express
- **Production**: Vite builds static assets to `dist/public`, esbuild bundles server to `dist/index.cjs`

### Data Storage
- **Database**: PostgreSQL via `DATABASE_URL` environment variable
- **ORM**: Drizzle ORM with `drizzle-zod` for schema-to-validation integration
- **Schema**: Defined in `shared/schema.ts` — two tables:
  - `users`: id, username, role, isPro, createdAt
  - `quote_requests`: id, name, email, company, need, productOfInterest, createdAt
- **Migrations**: Managed via `drizzle-kit push` (schema push approach, no migration files)
- **Storage Layer**: `server/storage.ts` implements `IStorage` interface with `DatabaseStorage` class using Drizzle

### Shared Layer
- `shared/schema.ts`: Database table definitions, Zod insert schemas, and TypeScript types (including mock data interfaces like Term, Job, Product, SOP)
- `shared/routes.ts`: API contract defining endpoint paths, methods, input schemas, and response types

### Build System
- `script/build.ts`: Custom build script that runs Vite build for client, then esbuild for server
- Server dependencies are selectively bundled (allowlist in build script) to optimize cold start times
- Dev: `tsx server/index.ts` with Vite middleware
- Prod: `node dist/index.cjs` serving static files

## External Dependencies

### Database
- **PostgreSQL**: Required, connected via `DATABASE_URL` environment variable. Used with `pg` (node-postgres) pool and Drizzle ORM.

### Key NPM Packages
- **drizzle-orm** + **drizzle-kit**: ORM and migration tooling for PostgreSQL
- **express** (v5): HTTP server framework
- **@tanstack/react-query**: Server state management and caching
- **framer-motion**: Animation library for transitions and interactions
- **zod**: Runtime validation (shared between client/server)
- **react-hook-form** + **@hookform/resolvers**: Form handling with Zod validation
- **shadcn/ui ecosystem**: Radix UI primitives, class-variance-authority, tailwind-merge, clsx, cmdk
- **connect-pg-simple**: PostgreSQL session store (available but sessions not fully implemented)
- **wouter**: Lightweight client-side routing
- **recharts**: Available for data visualizations
- **vaul**: Drawer component
- **embla-carousel-react**: Carousel functionality

### Replit-Specific Plugins
- `@replit/vite-plugin-runtime-error-modal`: Error overlay in development
- `@replit/vite-plugin-cartographer`: Dev tooling (dev only)
- `@replit/vite-plugin-dev-banner`: Development banner (dev only)