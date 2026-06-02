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
