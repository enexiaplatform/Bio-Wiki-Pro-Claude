# Atlas intelligence evolution — execution record

Updated 5 September 2026. Founder brief: confirmed file intake → living model →
Challenge → simulation → decision → project-aware monitoring → controlled learning.
`PRODUCT_SOURCE_OF_TRUTH.md` remains canonical. This record distinguishes shipped
code, verification, and external requirements; it does not redefine the full goal.

## Verified baseline

- Main: `bae6bcb`; active continuation: `codex/resource-coverage-v2`, PR #9,
  baseline `de50d54`. Branch was clean, 25 commits ahead with no missing main
  commits, mergeable, CI and Vercel preview successful.
- Preview at baseline: `life-science-atlas-fm4o0cwno-enexiaplatforms-projects.vercel.app`.
  Production: the linked project's historical stable Vercel alias.
- Read-only browser audit covered homepage, Quality Lab, planner, synthetic
  Blueprint, sample, Scenario Compare, Sensitivity, Operating Model, Regulatory
  Monitor and guest Pro Workbench at 1440px and 390px on both deployments.
  All 40 route visits returned 200 with no page exceptions. Guest Workbench
  expanded to 778px when a saved synthetic project exposed its wide preview;
  constrained grid tracks and `min-width:0` fix the identified mobile overflow.
- Production and Preview `/api/health` report 503 and `schema:false`.
  Production commerce is disabled; Preview test commerce is not ready.
- Protected Production catalog audit: exactly `quality_lab_funnel_events` and
  `regulatory_alert_preferences` absent. Other 13 required tables/86 columns
  match. No application rows were read. Runtime error-group queries returned
  no groups in the checked seven-day window; that is not proof of runtime health.

## Phase status and remaining requirements

| Phase | Current evidence | Remaining outcome |
| --- | --- | --- |
| 0. Commercial/runtime foundation | Expanded schema audit; transactional two-table repair proposal; truthful lifecycle acceptance/status; bounded idempotent funnel retry; mobile Workbench correction | Owner-approved target repair with verified backup/restore and production-like staging rehearsal; isolated Preview credentials/schema; Stripe/email/inbox acceptance; deployed runtime verification |
| 1. File intake | Existing planner imports canonical JSON only; local project/evidence confirmation and immutable revisions can be reused | Versioned extraction candidates, field-level provenance, normalization, explicit material-value confirmation, safe CSV/XLSX parsing first, malicious-document tests, persisted confirmation history and journey measurement; AI assistance must stay outside authoritative Compiler input |
| 2. Decision Twin | Existing scenario, sensitivity, turnaround, resilience, non-routine, skill/shift and operating-model engines | One project workspace and small assumption set; before/after consequences; exact first equipment/constraint threshold; stored/current engine mismatch guard and explicit revision save |
| 3. Challenge | Readiness, sensitivity verification queue, decision register, unresolved evidence and lineage | Transparent deterministic impact ranking; concrete decision-changing findings/actions; source and score inspection; no arbitrary LLM numerical severity |
| 4. Role lenses | Blueprint already has QC/QA/engineering/procurement and executive/technical modes | Consolidate same-model stakeholder decisions including finance; avoid parallel state or calculations |
| 5. Impact Watch | Official-source metadata triage and explicit Pro digest opt-in exist | Match updates to current project methods/evidence/assumptions; potential-impact queue; explicit human disposition; fail closed without changing rules or Blueprint |
| 6. Controlled learning | Frozen observations, append-only reviews, Gate 1 and validation-case controls exist | Verify new journey preserves permissioned actual-versus-predicted learning; no fabricated benchmarks or evidence claims |

Existing sensitivity searches aggregate cost/FTE/area/workload and peak resource
utilization bands. It does not prove an individual incubator 3→4 transition, and
currently recompiles its baseline using the current engine. Those are explicit
Phase 2 gaps, not capabilities to imply in new copy.

## Foundation verification and boundaries

- Full validation, type-check and production build pass.
- Full unit/server suite: 87 files, 590 tests passed, including 15 repair-runner
  transaction/preflight tests.
- Browser recovery tests prove the same event survives two simulated 503s,
  preserves editable intake and omits entered project text at desktop/mobile.
  Workbench reflow tests cover saved synthetic examples at both widths.
- Combined resilience and existing automated WCAG/reflow suite: 33 passed.
- Two-table SQL rehearsal in isolated in-memory PostgreSQL: dry run creates no
  objects; index conflict rolls back both-table work; success passes all 15
  tables/105 columns/25 keys; repeated apply refuses; opt-in defaults and unique
  guards behave correctly. Synthetic fixture only, not a production backup.
- Protected Production repair dry-run passes. No Production or Preview DDL,
  billing configuration, DNS, permissions, customer writes or real mail occurred.

The exact external schema action is documented in
[`migrations/reconciliation/README.md`](../migrations/reconciliation/README.md).
The historical Drizzle ledger remains unreconciled. Do not silently replay its
baseline or present this focused repair as a complete migration history.

Funnel retries remain bounded and best effort across page closure. Email provider
acceptance is not confirmed inbox delivery, and external send plus database guard
is not atomic. These limits must remain visible in release/operating evidence.

Next implementation slice after safe foundation preparation: CSV/XLSX candidate
intake with local parsing, exact locators and explicit review, integrated into the
existing planner and revision path. No new primary navigation item is needed.
