import { getTableColumns, getTableName } from "drizzle-orm";
import { getTableConfig } from "drizzle-orm/pg-core";
import {
  checkoutAttempts,
  lessonReads,
  lifecycleSends,
  nurtureSends,
  processedStripeEvents,
  qualityLabFunnelEvents,
  qualityLabGovernanceRecords,
  qualityLabGovernanceRevisions,
  qualityLabReviewedProjectRevisions,
  qualityLabReviewedProjects,
  quoteRequests,
  regulatoryAlertPreferences,
} from "../shared/schema.js";
import { purchases, sessions, users } from "../shared/models/auth.js";

const REQUIRED_RUNTIME_TABLE_OBJECTS = [
  users,
  sessions,
  purchases,
  processedStripeEvents,
  quoteRequests,
  qualityLabReviewedProjects,
  qualityLabReviewedProjectRevisions,
  qualityLabGovernanceRecords,
  qualityLabGovernanceRevisions,
  qualityLabFunnelEvents,
  regulatoryAlertPreferences,
  lifecycleSends,
  nurtureSends,
  checkoutAttempts,
  lessonReads,
] as const;

export type RuntimeSchemaRequirement = {
  table: string;
  columns: readonly string[];
  columnContracts: readonly RuntimeSchemaColumnContract[];
  uniqueKeys: readonly (readonly string[])[];
};

export type RuntimeSchemaColumnContract = {
  name: string;
  udtName: string;
  nullable: boolean;
  hasDefault: boolean;
};

export type RuntimeSchemaColumnRow = {
  table_name: string;
  column_name: string;
  udt_name: string;
  is_nullable: "YES" | "NO";
  column_default: string | null;
  is_identity: "YES" | "NO";
};

export type RuntimeSchemaUniqueKeyRow = {
  table_name: string;
  columns: string[];
};

export type RuntimeSchemaAssessment = {
  ready: boolean;
  requiredTableCount: number;
  requiredColumnCount: number;
  presentTableCount: number;
  presentColumnCount: number;
  compatibleColumnCount: number;
  requiredUniqueKeyCount: number;
  presentUniqueKeyCount: number;
  missingTables: string[];
  missingColumns: Array<{ table: string; columns: string[] }>;
  incompatibleColumns: Array<{ table: string; column: string; issues: string[] }>;
  missingUniqueKeys: Array<{ table: string; columns: string[] }>;
};

function postgresUdtName(sqlType: string): string {
  const normalized = sqlType.trim().toLowerCase().replace(/\(.*/, "");
  const aliases: Record<string, string> = {
    boolean: "bool",
    integer: "int4",
    serial: "int4",
    timestamp: "timestamp",
    varchar: "varchar",
  };
  return aliases[normalized] ?? normalized;
}

function uniqueKeySignature(columns: readonly string[]): string {
  return columns.join("\u0000");
}

function tableUniqueKeys(table: (typeof REQUIRED_RUNTIME_TABLE_OBJECTS)[number]): string[][] {
  const config = getTableConfig(table);
  const keys = [
    ...config.columns.filter((column) => column.primary || column.isUnique).map((column) => [column.name]),
    ...config.primaryKeys.map((key) => key.columns.map((column) => column.name)),
    ...config.uniqueConstraints.map((key) => key.columns.map((column) => column.name)),
    ...config.indexes
      .filter((index) => index.config.unique)
      .map((index) => index.config.columns.map((column) => "name" in column ? column.name : undefined).filter((name): name is string => Boolean(name))),
  ].filter((columns) => columns.length > 0);

  return Array.from(new Map(keys.map((columns) => [uniqueKeySignature(columns), columns])).values())
    .sort((left, right) => uniqueKeySignature(left).localeCompare(uniqueKeySignature(right)));
}

/**
 * Runtime-critical schema for the Gate 1 intake, payment, persistence,
 * governance, first-party funnel and lifecycle/digest paths. Columns and primary/unique keys are
 * derived from Drizzle so this audit cannot silently drift from the app model.
 */
export const RUNTIME_SCHEMA_REQUIREMENTS: readonly RuntimeSchemaRequirement[] =
  REQUIRED_RUNTIME_TABLE_OBJECTS
    .map((table) => {
      const columns = Object.values(getTableColumns(table));
      return {
        table: getTableName(table),
        columns: columns.map((column) => column.name).sort(),
        columnContracts: columns
          .map((column) => ({
            name: column.name,
            udtName: postgresUdtName(column.getSQLType()),
            nullable: !column.notNull,
            hasDefault: column.hasDefault,
          }))
          .sort((left, right) => left.name.localeCompare(right.name)),
        uniqueKeys: tableUniqueKeys(table),
      };
    })
    .sort((left, right) => left.table.localeCompare(right.table));

/** Pure assessment used by both the public boolean guard and the protected CLI. */
export function assessRuntimeSchema(
  columnRows: readonly RuntimeSchemaColumnRow[],
  uniqueKeyRows: readonly RuntimeSchemaUniqueKeyRow[] = [],
  requirements: readonly RuntimeSchemaRequirement[] = RUNTIME_SCHEMA_REQUIREMENTS,
): RuntimeSchemaAssessment {
  const presentByTable = new Map<string, Map<string, RuntimeSchemaColumnRow>>();
  const presentUniqueKeysByTable = new Map<string, Set<string>>();

  for (const row of columnRows) {
    const columns = presentByTable.get(row.table_name) ?? new Map<string, RuntimeSchemaColumnRow>();
    columns.set(row.column_name, row);
    presentByTable.set(row.table_name, columns);
  }

  for (const row of uniqueKeyRows) {
    const keys = presentUniqueKeysByTable.get(row.table_name) ?? new Set<string>();
    keys.add(uniqueKeySignature(row.columns));
    presentUniqueKeysByTable.set(row.table_name, keys);
  }

  const missingTables: string[] = [];
  const missingColumns: Array<{ table: string; columns: string[] }> = [];
  const incompatibleColumns: Array<{ table: string; column: string; issues: string[] }> = [];
  const missingUniqueKeys: Array<{ table: string; columns: string[] }> = [];
  let presentColumnCount = 0;
  let compatibleColumnCount = 0;
  let presentUniqueKeyCount = 0;

  for (const requirement of requirements) {
    const presentColumns = presentByTable.get(requirement.table);
    if (!presentColumns) {
      missingTables.push(requirement.table);
      continue;
    }

    const absent = requirement.columns.filter((column) => !presentColumns.has(column));
    presentColumnCount += requirement.columns.length - absent.length;
    if (absent.length > 0) missingColumns.push({ table: requirement.table, columns: absent });

    for (const contract of requirement.columnContracts) {
      const present = presentColumns.get(contract.name);
      if (!present) continue;
      const issues: string[] = [];
      if (present.udt_name !== contract.udtName) issues.push(`type ${present.udt_name}; expected ${contract.udtName}`);
      const nullable = present.is_nullable === "YES";
      if (nullable !== contract.nullable) issues.push(`${nullable ? "nullable" : "not-null"}; expected ${contract.nullable ? "nullable" : "not-null"}`);
      const hasDefault = present.column_default !== null || present.is_identity === "YES";
      if (hasDefault !== contract.hasDefault) issues.push(`${hasDefault ? "default present" : "default absent"}; expected ${contract.hasDefault ? "default present" : "default absent"}`);
      if (issues.length > 0) incompatibleColumns.push({ table: requirement.table, column: contract.name, issues });
      else compatibleColumnCount += 1;
    }

    const presentKeys = presentUniqueKeysByTable.get(requirement.table) ?? new Set<string>();
    for (const key of requirement.uniqueKeys) {
      if (presentKeys.has(uniqueKeySignature(key))) presentUniqueKeyCount += 1;
      else missingUniqueKeys.push({ table: requirement.table, columns: [...key] });
    }
  }

  const requiredColumnCount = requirements.reduce((total, item) => total + item.columns.length, 0);
  const requiredUniqueKeyCount = requirements.reduce((total, item) => total + item.uniqueKeys.length, 0);
  return {
    ready: missingTables.length === 0 && missingColumns.length === 0 && incompatibleColumns.length === 0 && missingUniqueKeys.length === 0,
    requiredTableCount: requirements.length,
    requiredColumnCount,
    presentTableCount: requirements.length - missingTables.length,
    presentColumnCount,
    compatibleColumnCount,
    requiredUniqueKeyCount,
    presentUniqueKeyCount,
    missingTables,
    missingColumns,
    incompatibleColumns,
    missingUniqueKeys,
  };
}
