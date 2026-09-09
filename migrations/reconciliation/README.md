# Runtime reconciliation — SQL dated 5 September, applied 9 September 2026

`20260905_funnel_regulatory.sql` is a standalone, explicitly versioned repair
repair for the protected target audit that found exactly
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

# Historical apply entry point; do not rerun against the repaired target:
npx tsx script/repair-runtime-schema.ts --apply
```

The runner refuses every state except the exact two absent tables with no
other runtime drift. Both preflight and postflight use the same dedicated
connection as the transaction. Apply sets a five-second lock timeout and
30-second statement timeout; an SQL conflict or failed postflight rolls back
the entire transaction. A repeated apply is refused. Dry run ends in rollback
and cannot create schema objects. Unknown or conflicting CLI arguments fail
before connecting.

## Verified application

The founder's finishing brief explicitly authorized this two-table operation after
exact preflight, transaction recovery and an isolated rehearsal. The synthetic
PGlite rehearsal checked dry-run behavior, SQL conflict rollback, postflight,
repeat refusal, opt-in defaults and unique guards. It was not a full Production
backup/restore rehearsal. Both protected preflights matched the intended absent
objects without unrelated drift.

A single real apply through the protected Preview target completed successfully.
Postflight and independent Preview and Production audits passed 15 tables,
105 columns and 25 primary/unique keys. Production already saw the repaired state;
no second apply was run. This is not proof that the two environments have isolated
databases. Both public health endpoints returned HTTP 200 and `schema:true` on
9 September 2026. No existing customer rows were modified by the repair.

Keep this applied SQL immutable. A repeated apply now refuses safely. Do not drop
the tables as rollback after they may contain activity; any later correction needs
an inspected forward repair or authorized recovery procedure. Future unrelated
schema changes retain the backup, rehearsal and approval requirements in
`docs/DB_MIGRATIONS.md`. Billing, email and provider acceptance remain separate.
