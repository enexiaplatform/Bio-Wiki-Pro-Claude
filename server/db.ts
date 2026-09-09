import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../shared/schema.js";
import {
  assessRuntimeSchema,
  RUNTIME_SCHEMA_REQUIREMENTS,
  type RuntimeSchemaAssessment,
  type RuntimeSchemaColumnRow,
  type RuntimeSchemaUniqueKeyRow,
} from "./runtime-schema.js";

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

let schemaReadinessCache: { assessment: RuntimeSchemaAssessment; expiresAt: number } | undefined;
let schemaReadinessFailureExpiresAt = 0;

/** Protected, read-only inspection. Callers must not expose names publicly. */
export async function inspectRuntimeSchema(queryable: Pick<pg.PoolClient, "query"> | null = pool): Promise<RuntimeSchemaAssessment> {
  if (!queryable) throw new Error("Database connection is not configured");

  const requiredTables = RUNTIME_SCHEMA_REQUIREMENTS.map((item) => item.table);
  const [columnResult, uniqueKeyResult] = await Promise.all([
    queryable.query<RuntimeSchemaColumnRow>(
      "select table_name, column_name, udt_name, is_nullable, column_default, is_identity from information_schema.columns where table_schema = 'public' and table_name = any($1::text[])",
      [requiredTables],
    ),
    queryable.query<RuntimeSchemaUniqueKeyRow>(
      `select table_record.relname as table_name,
              array_agg(attribute_record.attname order by key_column.position)::text[] as columns
         from pg_catalog.pg_class table_record
         join pg_catalog.pg_namespace namespace_record on namespace_record.oid = table_record.relnamespace
         join pg_catalog.pg_index index_record on index_record.indrelid = table_record.oid
         join lateral unnest(index_record.indkey) with ordinality as key_column(attribute_number, position) on true
         join pg_catalog.pg_attribute attribute_record
           on attribute_record.attrelid = table_record.oid
          and attribute_record.attnum = key_column.attribute_number
        where namespace_record.nspname = 'public'
          and table_record.relname = any($1::text[])
          and index_record.indisunique = true
          and index_record.indisvalid = true
          and index_record.indisready = true
          and index_record.indpred is null
          and index_record.indexprs is null
          and key_column.position <= index_record.indnkeyatts
        group by table_record.relname, index_record.indexrelid`,
      [requiredTables],
    ),
  ]);

  return assessRuntimeSchema(columnResult.rows, uniqueKeyResult.rows);
}

/** Read-only, cached production guard. Public callers receive only a boolean. */
export async function checkRuntimeSchema(): Promise<boolean> {
  if (!pool) return false;
  if (schemaReadinessCache && schemaReadinessCache.expiresAt > Date.now()) return schemaReadinessCache.assessment.ready;
  if (schemaReadinessFailureExpiresAt > Date.now()) return false;
  try {
    const assessment = await inspectRuntimeSchema();
    if (!assessment.ready) {
      console.error("[schema readiness] required runtime schema is incomplete", {
        missingTableCount: assessment.missingTables.length,
        missingColumnCount: assessment.missingColumns.reduce((total, item) => total + item.columns.length, 0),
        incompatibleColumnCount: assessment.incompatibleColumns.length,
        missingUniqueKeyCount: assessment.missingUniqueKeys.length,
      });
    }
    schemaReadinessCache = { assessment, expiresAt: Date.now() + 60_000 };
    schemaReadinessFailureExpiresAt = 0;
    return assessment.ready;
  } catch (error) {
    console.error("[schema readiness] check failed", { errorType: error instanceof Error ? error.name : "unknown-error" });
    schemaReadinessFailureExpiresAt = Date.now() + 15_000;
    return false;
  }
}
