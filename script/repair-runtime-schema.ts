// Narrow, versioned repair. Defaults to a names-only READ ONLY transaction.
// No application rows, credential values, or raw database errors are printed.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  RUNTIME_SCHEMA_REQUIREMENTS,
  type RuntimeSchemaAssessment,
} from "../server/runtime-schema.js";

export const RECONCILIATION_ID = "20260905_funnel_regulatory";
export const RECONCILIATION_TABLES = ["quality_lab_funnel_events", "regulatory_alert_preferences"] as const;
const SQL_URL = new URL(`../migrations/reconciliation/${RECONCILIATION_ID}.sql`, import.meta.url);

export class SchemaRepairError extends Error {
  constructor(public readonly code: "unexpected-schema-state" | "post-audit-failed" | "invalid-arguments") {
    super(code);
    this.name = "SchemaRepairError";
  }
}

function currentContract(assessment: RuntimeSchemaAssessment): boolean {
  return assessment.requiredTableCount === RUNTIME_SCHEMA_REQUIREMENTS.length
    && assessment.requiredColumnCount === RUNTIME_SCHEMA_REQUIREMENTS.reduce((sum, item) => sum + item.columns.length, 0)
    && assessment.requiredUniqueKeyCount === RUNTIME_SCHEMA_REQUIREMENTS.reduce((sum, item) => sum + item.uniqueKeys.length, 0);
}

/** Reject an old, partial, already-repaired, or differently drifted target. */
export function canRepairRuntimeSchema(assessment: RuntimeSchemaAssessment): boolean {
  return currentContract(assessment)
    && !assessment.ready
    && assessment.missingTables.length === RECONCILIATION_TABLES.length
    && RECONCILIATION_TABLES.every((table) => assessment.missingTables.includes(table))
    && assessment.missingColumns.length === 0
    && assessment.incompatibleColumns.length === 0
    && assessment.missingUniqueKeys.length === 0;
}

export function repairApplyRequested(args: string[]): boolean {
  if (args.length === 0 || (args.length === 1 && args[0] === "--dry-run")) return false;
  if (args.length === 1 && args[0] === "--apply") return true;
  throw new SchemaRepairError("invalid-arguments");
}

/** inspect must use this same dedicated client, never a pool/second connection. */
export async function runRuntimeSchemaRepair(options: {
  client: { query: (sql: string) => Promise<unknown> };
  inspect: () => Promise<RuntimeSchemaAssessment>;
  apply: boolean;
  sql: string;
}): Promise<{ mode: "dry-run" | "applied"; before: RuntimeSchemaAssessment; after?: RuntimeSchemaAssessment }> {
  const { client, inspect, apply, sql } = options;
  await client.query(apply ? "BEGIN" : "BEGIN READ ONLY");
  try {
    await client.query("SET LOCAL lock_timeout = '5s'");
    await client.query("SET LOCAL statement_timeout = '30s'");
    const before = await inspect();
    if (!canRepairRuntimeSchema(before)) throw new SchemaRepairError("unexpected-schema-state");
    if (!apply) {
      await client.query("ROLLBACK");
      return { mode: "dry-run", before };
    }
    await client.query(sql);
    const after = await inspect();
    if (!currentContract(after) || !after.ready) throw new SchemaRepairError("post-audit-failed");
    await client.query("COMMIT");
    return { mode: "applied", before, after };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}

async function main() {
  // Loading configuration and connecting happen only for an explicit CLI run.
  const apply = repairApplyRequested(process.argv.slice(2));
  await import("dotenv/config");
  const { pool, inspectRuntimeSchema } = await import("../server/db.js");
  if (!pool) throw new Error("DatabaseUnavailable");
  try {
    const sql = await readFile(SQL_URL, "utf8");
    const client = await pool.connect();
    try {
      const result = await runRuntimeSchemaRepair({ client, inspect: () => inspectRuntimeSchema(client), apply, sql });
      console.log(JSON.stringify({ reconciliation: RECONCILIATION_ID, ledgerReconciled: false, ...result }, null, 2));
    } finally {
      client.release();
    }
  } finally {
    await pool.end();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error: unknown) => {
    console.error(JSON.stringify({
      reconciliation: RECONCILIATION_ID,
      ready: false,
      error: error instanceof SchemaRepairError ? error.code : "database-or-file-operation-failed",
    }));
    process.exitCode = 1;
  });
}
