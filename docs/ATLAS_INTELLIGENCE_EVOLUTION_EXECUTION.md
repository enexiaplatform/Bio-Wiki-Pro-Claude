# Atlas intelligence evolution — execution record

Updated 7 September 2026. Founder brief: confirmed file intake → living model →
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
| 1. File intake | Published and Preview-verified browser-local CSV candidates; optional authenticated AI cell mapping; explicit confirmation; versioned source history in existing snapshots/revisions; privacy-safe journey stages; 64 focused tests and 20 endpoint tests | Operator-configured synthetic AI acceptance. Native XLSX/PDF/DOCX deferred deliberately; export the relevant sheet as CSV |
| 2. Decision Twin | Embedded six-assumption workspace, Compiler/comparison reuse, exact bounded equipment transitions, stale-baseline guard, separate scenario save; five specialist bases connected through explicit revisioned handoffs | Broader first-constraint search, sensitivity consolidation and simpler project navigation; deployed verification of specialist integration |
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

## Confirmed intake implementation

The planner now accepts CSV project facts without applying unreviewed values.
Source review shows filename, cell, literal text, extraction method, confidence
category and missing inputs. Applied sources follow the same input snapshot into
the Blueprint and identify later edits. Optional AI suggests field/cell pairs;
it cannot author values or approve them. See [ADR 0005](adr/0005-confirmed-file-intake.md)
for formats, limits, compatibility, privacy and operator configuration.

Local verification: 90 unit/server files, 673 tests pass; validation/type-check
and build pass. Four new browser tests pass, covering desktop/mobile confirmation,
source conflict, provenance edits, reflow/accessibility, empty/malformed recovery,
AI consent, loading and service failure. Both screen sizes also compile, save
and reload the imported basis with its provenance intact. Synthetic data only;
no real provider call. The complete critical browser suite passes 49 tests.
Published commits: `fe680d9` plus `19434f7`, which corrects total-horizon growth
and people-reserve labels and rejects annual-rate/equipment-reserve mappings.
CI on `19434f7` passed validation, unit/server tests, build, dependency audit
and 49 critical browser journeys. All four intake journeys also passed against
the Ready Preview `life-science-atlas-emwk968bd-enexiaplatforms-projects.vercel.app`.
The deployed capability endpoint returns `aiAvailable:false`. Health and
deployment-specific runtime logs still expose the known two missing tables and
funnel receipt 503s; no target schema changes have occurred.

Decision Twin work has begun locally: an orchestration core reuses the existing
Compiler and scenario comparison, rejects stale saved input/output/engine bases,
and exhaustively probes whole-batch equipment transitions within a declared range.
Six focused tests pass. The synthetic default model's first observed transition
is BSC planning-horizon quantity 5→6 at 53 batches/month; it is not an incubator
or installed-capacity claim. The report now embeds a workspace with six
assumptions, existing comparison outputs, first threshold, unresolved evidence,
specialist links and an explicit separate-scenario save. The original and its
review records remain unchanged. Full unit/server validation passes 680 tests;
validation/type-check, build and 52 critical browser tests pass. Three Twin
browser tests cover desktop/mobile scenario creation, accessibility/reflow and
invalid-input recovery. Desktop/mobile rendered results were inspected.
See [ADR 0006](adr/0006-decision-twin-orchestration.md) for limitations and the
remaining Phase 2 consolidation; this is not yet the complete Decision Twin.

First Twin slice `ec1f393` passed CI (680 unit/server tests, 52 critical browser
checks), and its Ready Preview is
`life-science-atlas-ji7fl19r9-enexiaplatforms-projects.vercel.app`. All three Twin
journeys passed on that deployment. Its inspected runtime errors remain the
known funnel persistence 503s; no schema repair has been applied.

Current follow-up integrates five explicitly accepted specialist input sets into
the existing revision/account snapshot path. The Twin compares existing engine
results for the same accepted basis; stale model hashes, project mismatches,
duplicate records and calendar changes fail closed. Four shared tests cover
round trips, fixed staffing, stale records and calendar reconciliation. Browser
coverage connects all five specialist pages, saves revisions and reopens the
Twin. Broader constraint thresholds and unified navigation remain to complete.

Specialist integration validation: 684 unit/server tests pass. All four Twin
browser journeys pass, including acceptance reset after edits, restored inputs,
five-page handoff, revision persistence, and desktop/mobile accessibility/reflow
for the connected results. All 53 critical browser checks, validation/type-check
and build pass. The inspected
synthetic example shows the accepted turnaround basis changing from concept-fail
to capacity-overload when batch demand changes; unavailable evidence remains
explicit in the operating-model result.

Next: finish release verification, then compose the existing calculation engines
into the Decision Twin with exact first decision thresholds and lineage. The
full founder goal remains active; Phases 2–6 are not implied complete by intake.
