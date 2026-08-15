import { describe, expect, it } from "vitest";
import {
  assessRuntimeSchema,
  RUNTIME_SCHEMA_REQUIREMENTS,
  type RuntimeSchemaColumnRow,
  type RuntimeSchemaUniqueKeyRow,
} from "../runtime-schema.js";

function completeRows(): RuntimeSchemaColumnRow[] {
  return RUNTIME_SCHEMA_REQUIREMENTS.flatMap((requirement) =>
    requirement.columnContracts.map((column) => ({
      table_name: requirement.table,
      column_name: column.name,
      udt_name: column.udtName,
      is_nullable: column.nullable ? "YES" as const : "NO" as const,
      column_default: column.hasDefault ? "expected-default" : null,
      is_identity: "NO" as const,
    })),
  );
}

function completeUniqueKeys(): RuntimeSchemaUniqueKeyRow[] {
  return RUNTIME_SCHEMA_REQUIREMENTS.flatMap((requirement) =>
    requirement.uniqueKeys.map((columns) => ({ table_name: requirement.table, columns: [...columns] })),
  );
}

describe("runtime schema assessment", () => {
  it("accepts the exact current Gate 1 schema contract", () => {
    const assessment = assessRuntimeSchema(completeRows(), completeUniqueKeys());

    expect(assessment).toMatchObject({
      ready: true,
      requiredTableCount: RUNTIME_SCHEMA_REQUIREMENTS.length,
      presentTableCount: RUNTIME_SCHEMA_REQUIREMENTS.length,
      missingTables: [],
      missingColumns: [],
      missingUniqueKeys: [],
    });
    expect(assessment.presentColumnCount).toBe(assessment.requiredColumnCount);
    expect(assessment.compatibleColumnCount).toBe(assessment.requiredColumnCount);
    expect(assessment.presentUniqueKeyCount).toBe(assessment.requiredUniqueKeyCount);
  });

  it("fails closed and names a missing table", () => {
    const target = RUNTIME_SCHEMA_REQUIREMENTS[0];
    const rows = completeRows().filter((row) => row.table_name !== target.table);
    const keys = completeUniqueKeys().filter((row) => row.table_name !== target.table);
    const assessment = assessRuntimeSchema(rows, keys);

    expect(assessment.ready).toBe(false);
    expect(assessment.missingTables).toEqual([target.table]);
    expect(assessment.presentTableCount).toBe(assessment.requiredTableCount - 1);
  });

  it("fails closed and names missing columns without treating the table as absent", () => {
    const target = RUNTIME_SCHEMA_REQUIREMENTS.find((item) => item.columns.length > 1)!;
    const missingColumn = target.columns[0];
    const rows = completeRows().filter(
      (row) => !(row.table_name === target.table && row.column_name === missingColumn),
    );
    const assessment = assessRuntimeSchema(rows, completeUniqueKeys());

    expect(assessment.ready).toBe(false);
    expect(assessment.missingTables).not.toContain(target.table);
    expect(assessment.missingColumns).toContainEqual({ table: target.table, columns: [missingColumn] });
  });

  it("fails closed and explains type, nullability and default incompatibility", () => {
    const target = RUNTIME_SCHEMA_REQUIREMENTS.find((item) => item.columnContracts.some((column) => column.hasDefault))!;
    const contract = target.columnContracts.find((column) => column.hasDefault)!;
    const rows = completeRows().map((row) => row.table_name === target.table && row.column_name === contract.name
      ? { ...row, udt_name: "bytea", is_nullable: row.is_nullable === "YES" ? "NO" as const : "YES" as const, column_default: null }
      : row);
    const assessment = assessRuntimeSchema(rows, completeUniqueKeys());

    expect(assessment.ready).toBe(false);
    expect(assessment.incompatibleColumns).toContainEqual({
      table: target.table,
      column: contract.name,
      issues: expect.arrayContaining([
        expect.stringContaining("type bytea"),
        expect.stringContaining("expected"),
        expect.stringContaining("default absent"),
      ]),
    });
  });

  it("fails closed and names a missing primary or unique key", () => {
    const target = RUNTIME_SCHEMA_REQUIREMENTS.find((item) => item.uniqueKeys.length > 0)!;
    const missingKey = target.uniqueKeys[0];
    const keys = completeUniqueKeys().filter(
      (row) => !(row.table_name === target.table && row.columns.join("|") === missingKey.join("|")),
    );
    const assessment = assessRuntimeSchema(completeRows(), keys);

    expect(assessment.ready).toBe(false);
    expect(assessment.missingTables).toEqual([]);
    expect(assessment.missingColumns).toEqual([]);
    expect(assessment.missingUniqueKeys).toContainEqual({ table: target.table, columns: [...missingKey] });
  });

  it("ignores unrelated database objects", () => {
    const assessment = assessRuntimeSchema(
      [...completeRows(), {
        table_name: "unrelated_table",
        column_name: "secret_payload",
        udt_name: "text",
        is_nullable: "YES",
        column_default: null,
        is_identity: "NO",
      }],
      [...completeUniqueKeys(), { table_name: "unrelated_table", columns: ["secret_payload"] }],
    );

    expect(assessment.ready).toBe(true);
    expect(assessment.presentColumnCount).toBe(assessment.requiredColumnCount);
    expect(assessment.compatibleColumnCount).toBe(assessment.requiredColumnCount);
    expect(assessment.presentUniqueKeyCount).toBe(assessment.requiredUniqueKeyCount);
  });

  it("covers intake, payment, controlled persistence, governance and funnel tables", () => {
    expect(RUNTIME_SCHEMA_REQUIREMENTS.map((item) => item.table)).toEqual(expect.arrayContaining([
      "users",
      "sessions",
      "purchases",
      "processed_stripe_events",
      "quote_requests",
      "quality_lab_reviewed_projects",
      "quality_lab_reviewed_project_revisions",
      "quality_lab_governance_records",
      "quality_lab_governance_revisions",
      "quality_lab_funnel_events",
    ]));
    expect(RUNTIME_SCHEMA_REQUIREMENTS.find((item) => item.table === "processed_stripe_events")?.uniqueKeys)
      .toContainEqual(["event_id"]);
    expect(RUNTIME_SCHEMA_REQUIREMENTS.find((item) => item.table === "quality_lab_funnel_events")?.uniqueKeys)
      .toContainEqual(["event_id"]);
    expect(RUNTIME_SCHEMA_REQUIREMENTS.find((item) => item.table === "quality_lab_reviewed_projects")?.uniqueKeys)
      .toContainEqual(["user_id", "local_project_id"]);
  });
});
