# Runtime reconciliation — 5 September 2026

`20260905_funnel_regulatory.sql` is a standalone, explicitly versioned repair
proposal for the protected target audit that found exactly
`quality_lab_funnel_events` and `regulatory_alert_preferences` absent. The other
13 required tables and their 86 columns were structurally compatible, with no
missing required unique keys. The complete current runtime contract is 15
tables and 105 columns. This is a dated names-only observation; rerun preflight
against the intended target before considering execution.

The SQL creates only these two tables and their indexes, matching
`shared/schema.ts`. There are no application-row reads, inserts, updates,
deletes, drops, or alterations of existing tables. Creation deliberately fails
if either table or an index/sequence name conflicts. The repair does not repair
historical losses of analytics events or prove email or billing readiness.

The historical `0000_baseline.sql` and Drizzle journal remain unreconciled. This
proposal is intentionally outside that ledger: do not run `db:migrate` to apply
it or mark the historical baseline as applied. Full ledger reconciliation is a
separate, inspected and rehearsed change.

Run in a protected operator environment with the intended target connection
already configured. Never paste credentials into terminal arguments or chat.

```sh
# Default is an explicitly READ ONLY names-only transaction; no DDL runs.
npx tsx script/repair-runtime-schema.ts

# Equivalent explicit dry run:
npx tsx script/repair-runtime-schema.ts --dry-run

# ONLY after owner authorization, a verified backup and staging rehearsal:
npx tsx script/repair-runtime-schema.ts --apply
```

The runner refuses every state except the exact two absent tables with no
other runtime drift. Both preflight and postflight use the same dedicated
connection as the transaction. Apply sets a five-second lock timeout and
30-second statement timeout; an SQL conflict or failed postflight rolls back
the entire transaction. A repeated apply is refused. Dry run ends in rollback
and cannot create schema objects. Unknown or conflicting CLI arguments fail
before connecting.

Before applying, record the intended environment, backup/restore evidence,
reviewed SQL version and names-only dry-run result in the private change record.
After an approved apply, retain the post-audit output, independently rerun the
protected schema audit and public health probe, and complete separate billing
and email acceptance checks. Do not drop the tables to roll back once they may
contain customer activity; use the approved backup/restore or forward-repair
procedure. No production application is implied by committing this proposal.
