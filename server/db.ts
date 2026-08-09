import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../shared/schema.js";

const { Pool } = pg;

// Prefer an explicit DATABASE_URL, but fall back to the variable names the
// Supabase / Vercel Postgres integration injects (it does NOT set DATABASE_URL).
// Pooled connection (POSTGRES_URL) is preferred for serverless; the non-pooling
// URL is the last resort.
export const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  undefined;

export const pool = connectionString
  ? new Pool({ connectionString })
  : null;

export const db = pool
  ? drizzle(pool, { schema })
  : new Proxy(
      {},
      {
        get() {
          throw new Error(
            "DATABASE_URL is not configured. Database-backed APIs are disabled.",
          );
        },
      },
    ) as ReturnType<typeof drizzle<typeof schema>>;

const REQUIRED_RUNTIME_TABLES = [
  "users",
  "sessions",
  "purchases",
  "processed_stripe_events",
  "quality_lab_reviewed_projects",
  "quality_lab_reviewed_project_revisions",
  "quality_lab_funnel_events",
] as const;

let schemaReadinessCache: { ready: boolean; expiresAt: number } | undefined;

/** Read-only, cached production guard. Public callers receive only a boolean. */
export async function checkRuntimeSchema(): Promise<boolean> {
  if (!pool) return false;
  if (schemaReadinessCache && schemaReadinessCache.expiresAt > Date.now()) return schemaReadinessCache.ready;
  try {
    const result = await pool.query<{ table_name: string }>(
      "select table_name from information_schema.tables where table_schema = 'public' and table_name = any($1::text[])",
      [[...REQUIRED_RUNTIME_TABLES]],
    );
    const present = new Set(result.rows.map((row) => row.table_name));
    const missing = REQUIRED_RUNTIME_TABLES.filter((table) => !present.has(table));
    const ready = missing.length === 0;
    if (!ready) console.error("[schema readiness] required runtime tables are missing", { missingCount: missing.length });
    schemaReadinessCache = { ready, expiresAt: Date.now() + 60_000 };
    return ready;
  } catch (error) {
    console.error("[schema readiness] check failed", { errorType: error instanceof Error ? error.name : "unknown-error" });
    schemaReadinessCache = { ready: false, expiresAt: Date.now() + 15_000 };
    return false;
  }
}
