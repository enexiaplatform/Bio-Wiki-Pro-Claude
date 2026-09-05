import { describe, expect, it, vi } from "vitest";
import {
  assessRuntimeSchema,
  RUNTIME_SCHEMA_REQUIREMENTS,
  type RuntimeSchemaAssessment,
  type RuntimeSchemaColumnRow,
} from "../runtime-schema.js";
import {
  canRepairRuntimeSchema,
  RECONCILIATION_TABLES,
  repairApplyRequested,
  runRuntimeSchemaRepair,
} from "../../script/repair-runtime-schema.js";

function assessment(missing: readonly string[] = []): RuntimeSchemaAssessment {
  const requirements = RUNTIME_SCHEMA_REQUIREMENTS.filter((item) => !missing.includes(item.table));
  const columns: RuntimeSchemaColumnRow[] = requirements.flatMap((item) => item.columnContracts.map((column) => ({
    table_name: item.table,
    column_name: column.name,
    udt_name: column.udtName,
    is_nullable: column.nullable ? "YES" : "NO",
    column_default: column.hasDefault ? "fixture-default" : null,
    is_identity: "NO",
  })));
  const keys = requirements.flatMap((item) => item.uniqueKeys.map((columns) => ({ table_name: item.table, columns: [...columns] })));
  return assessRuntimeSchema(columns, keys);
}

describe("versioned runtime repair preflight", () => {
  it("accepts exactly the two observed absent tables", () => {
    expect(canRepairRuntimeSchema(assessment(RECONCILIATION_TABLES))).toBe(true);
  });

  it.each([
    ["already repaired", assessment()],
    ["partly repaired", assessment([RECONCILIATION_TABLES[0]])],
    ["additional missing table", assessment([...RECONCILIATION_TABLES, "users"])],
    ["incomplete audit scope", { ...assessment(RECONCILIATION_TABLES), requiredTableCount: 10 }],
    ["missing existing column", { ...assessment(RECONCILIATION_TABLES), missingColumns: [{ table: "users", columns: ["email"] }] }],
    ["incompatible existing column", { ...assessment(RECONCILIATION_TABLES), incompatibleColumns: [{ table: "users", column: "email", issues: ["type mismatch"] }] }],
    ["missing existing unique key", { ...assessment(RECONCILIATION_TABLES), missingUniqueKeys: [{ table: "users", columns: ["id"] }] }],
  ])("refuses %s", (_name, value) => {
    expect(canRepairRuntimeSchema(value as RuntimeSchemaAssessment)).toBe(false);
  });

  it("requires the sole explicit apply argument before enabling DDL", () => {
    expect(repairApplyRequested([])).toBe(false);
    expect(repairApplyRequested(["--dry-run"])).toBe(false);
    expect(repairApplyRequested(["--apply"])).toBe(true);
    for (const args of [["--yes"], ["--dry-run", "--apply"], ["--apply", "production"]]) {
      expect(() => repairApplyRequested(args)).toThrow("invalid-arguments");
    }
  });
});

describe("transaction-scoped runtime repair", () => {
  const sql = "CREATE TABLE repair_fixture (id integer)";

  it("uses a read-only transaction and never sends migration SQL in a dry run", async () => {
    const client = { query: vi.fn().mockResolvedValue({}) };
    const inspect = vi.fn().mockResolvedValue(assessment(RECONCILIATION_TABLES));
    const result = await runRuntimeSchemaRepair({ client, inspect, apply: false, sql });
    expect(result.mode).toBe("dry-run");
    expect(client.query.mock.calls.map(([query]) => query)).toEqual([
      "BEGIN READ ONLY", "SET LOCAL lock_timeout = '5s'", "SET LOCAL statement_timeout = '30s'", "ROLLBACK",
    ]);
    expect(inspect).toHaveBeenCalledOnce();
  });

  it("commits only after the same transaction passes postflight", async () => {
    const order: string[] = [];
    const client = { query: vi.fn(async (query: string) => { order.push(query); }) };
    let audits = 0;
    const inspect = async () => { order.push("AUDIT"); return audits++ === 0 ? assessment(RECONCILIATION_TABLES) : assessment(); };
    const result = await runRuntimeSchemaRepair({ client, inspect, apply: true, sql });
    expect(result.mode).toBe("applied");
    expect(order).toEqual([
      "BEGIN", "SET LOCAL lock_timeout = '5s'", "SET LOCAL statement_timeout = '30s'", "AUDIT", sql, "AUDIT", "COMMIT",
    ]);
  });

  it("rolls back without any DDL when preflight finds unexpected drift", async () => {
    const client = { query: vi.fn().mockResolvedValue({}) };
    await expect(runRuntimeSchemaRepair({ client, inspect: async () => assessment(["users"]), apply: true, sql }))
      .rejects.toThrow("unexpected-schema-state");
    expect(client.query).not.toHaveBeenCalledWith(sql);
    expect(client.query).not.toHaveBeenCalledWith("COMMIT");
    expect(client.query).toHaveBeenLastCalledWith("ROLLBACK");
  });

  it("rolls back a conflicting SQL operation", async () => {
    const client = { query: vi.fn(async (query: string) => {
      if (query === sql) throw new Error("synthetic conflicting index");
    }) };
    await expect(runRuntimeSchemaRepair({ client, inspect: async () => assessment(RECONCILIATION_TABLES), apply: true, sql }))
      .rejects.toThrow("synthetic conflicting index");
    expect(client.query).not.toHaveBeenCalledWith("COMMIT");
    expect(client.query).toHaveBeenLastCalledWith("ROLLBACK");
  });

  it("rolls back all DDL when postflight is still incompatible", async () => {
    const client = { query: vi.fn().mockResolvedValue({}) };
    const inspect = vi.fn().mockResolvedValueOnce(assessment(RECONCILIATION_TABLES)).mockResolvedValueOnce(assessment(["regulatory_alert_preferences"]));
    await expect(runRuntimeSchemaRepair({ client, inspect, apply: true, sql })).rejects.toThrow("post-audit-failed");
    expect(client.query).toHaveBeenCalledWith(sql);
    expect(client.query).not.toHaveBeenCalledWith("COMMIT");
    expect(client.query).toHaveBeenLastCalledWith("ROLLBACK");
  });

  it("rolls back if the transaction-scoped catalog query itself fails", async () => {
    const client = { query: vi.fn().mockResolvedValue({}) };
    const inspect = vi.fn().mockResolvedValueOnce(assessment(RECONCILIATION_TABLES)).mockRejectedValueOnce(new Error("synthetic inspection failure"));
    await expect(runRuntimeSchemaRepair({ client, inspect, apply: true, sql })).rejects.toThrow("synthetic inspection failure");
    expect(client.query).not.toHaveBeenCalledWith("COMMIT");
    expect(client.query).toHaveBeenLastCalledWith("ROLLBACK");
  });
});
