/**
 * Safe operator guidance for an incomplete runtime schema. Production data
 * must never be reconciled through an unreviewed direct schema push.
 */
export const RUNTIME_SCHEMA_REMEDIATION =
  "Run the protected schema audit, then apply an approved versioned migration for this environment.";
