// Read-only production schema audit. It prints object names and counts only;
// it never reads table rows or prints connection details or credential values.
import "dotenv/config";
import { inspectRuntimeSchema, pool } from "../server/db.js";

const jsonOutput = process.argv.includes("--json");

async function main() {
  if (!pool) {
    const result = {
      ready: false,
      error: "Database connection is not configured",
    };
    console.log(jsonOutput ? JSON.stringify(result, null, 2) : "X Database connection is not configured.");
    process.exitCode = 1;
    return;
  }

  try {
    const assessment = await inspectRuntimeSchema();
    if (jsonOutput) {
      console.log(JSON.stringify(assessment, null, 2));
    } else {
      console.log("\nRuntime schema audit (read-only, names-only)");
      console.log("=".repeat(56));
      console.log(`  ${assessment.presentTableCount}/${assessment.requiredTableCount} required tables present`);
      console.log(`  ${assessment.presentColumnCount}/${assessment.requiredColumnCount} required columns present`);
      console.log(`  ${assessment.compatibleColumnCount}/${assessment.requiredColumnCount} required columns structurally compatible`);
      console.log(`  ${assessment.presentUniqueKeyCount}/${assessment.requiredUniqueKeyCount} required primary/unique keys present`);

      for (const table of assessment.missingTables) console.log(`  X missing table: ${table}`);
      for (const item of assessment.missingColumns) {
        console.log(`  X missing column(s): ${item.table}.${item.columns.join(`, ${item.table}.`)}`);
      }
      for (const item of assessment.incompatibleColumns) {
        console.log(`  X incompatible column: ${item.table}.${item.column} (${item.issues.join("; ")})`);
      }
      for (const item of assessment.missingUniqueKeys) {
        console.log(`  X missing primary/unique key: ${item.table}(${item.columns.join(", ")})`);
      }

      console.log("=".repeat(56));
      console.log(assessment.ready
        ? "  OK Runtime schema matches the Gate 1 application contract."
        : "  HOLD Review the names above; obtain approval before any migration operation.");
    }
    if (!assessment.ready) process.exitCode = 1;
  } catch (error) {
    const errorType = error instanceof Error ? error.name : "unknown-error";
    console.log(jsonOutput
      ? JSON.stringify({ ready: false, error: errorType }, null, 2)
      : `X Runtime schema audit failed (${errorType}). No database changes were attempted.`);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

await main();
