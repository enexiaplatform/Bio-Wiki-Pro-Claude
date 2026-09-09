# Atlas intelligence evolution — execution record

Updated 9 September 2026. Founder brief: confirmed file intake → living model →
Challenge → simulation → decision → project-aware monitoring → controlled learning.
`PRODUCT_SOURCE_OF_TRUTH.md` remains canonical. This record distinguishes shipped
code, verification, and external requirements; it does not redefine the full goal.

## Current checkpoint — 9 September

The last released branch SHA is `1943ba21b99a5c2ee647ca8c788cf0b1126d684a`, with
Ready Preview `life-science-atlas-6s99dtgsn-enexiaplatforms-projects.vercel.app`.
CI run `34216374088` passed validation, 703 unit/server tests, build, audit and
58 critical browser checks; nine deployed Twin/Challenge/Impact journeys passed.
Main remains `bae6bcb43b282167994eb720d570b41c7943e677` at this checkpoint.

The explicitly authorized two-table repair has now been applied once through the
Preview target. Independent Preview and Production audits pass 15 tables,
105 columns and 25 primary/unique keys. Both real health routes report HTTP 200
and `schema:true`. The isolated PGlite rehearsal established transaction rollback
and repeat refusal, not a full Production backup/restore. Nine real synthetic
funnel stages persist and suppress duplicate event IDs. Digest storage completed
synthetic read/write/opt-in/opt-out/idempotency checks inside a rolled-back
transaction; no customer preference or email was affected.

Native XLSX/PDF/DOCX extraction and Pro/product presentation changes passed the
local release gates: 713 unit/server tests, production build and 170 public browser
journeys passed; the two separately opt-in Stripe journeys were skipped because
test commerce is not configured. Parsers are browser-local, bounded and lazy-loaded;
all facts require source inspection and confirmation. Exact-SHA deployed acceptance
remains required before this becomes a shipped claim.
[ADR 0005](adr/0005-confirmed-file-intake.md) records the native source contract,
format limits and privacy boundary. Existing CSV deployed evidence does not prove
native-format release. Final test counts and exact-SHA Preview/Production evidence
must be recorded after the full finishing slice is verified.

Schema is no longer an external blocker. Test payments, email, configured AI and
advanced analytics remain dependent on unavailable provider configuration; public
origin and Preview notification readiness still require completion/recheck. A
Preview-scoped cron secret was added without invoking lifecycle delivery.
See the [current runtime table](COMMERCIAL_LAUNCH_RUNBOOK.md). Historical observations
below are retained as dated evidence and do not describe the repaired runtime.

## Historical verified baseline — before repair

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
| 0. Commercial/runtime foundation | Applied bounded repair; both target audits and deployed health pass; nine real synthetic funnel stages persist/idempotently retry; digest storage lifecycle verified with rollback | Test payment/email/inbox and safe job acceptance; explicit runtime configuration; deployment recheck |
| 1. File intake | Published and Preview-verified CSV; native XLSX/PDF/DOCX candidates passed edge cases and complete local gates with explicit confirmation and versioned provenance; bounded optional AI source mapping | Exact-SHA deployed acceptance; configured synthetic AI acceptance |
| 2. Decision Twin | Embedded six-assumption workspace, comparison and sensitivity handoff, exhaustive bounded equipment/specialist warning transitions, five accepted revisioned bases, four primary report destinations; Preview-verified through 5c23170 | Site evidence and qualified acceptance remain necessary; bounded probes are not universal operating limits |
| 3. Challenge | Deterministic priority factors over unresolved inputs, exact equipment transitions, sensitivity and accepted specialist warnings including operating-model application blockers; evidence/action/lineage disclosure and activation events | Final release verification of this combined slice; scores are review policy, not regulatory severity or independent risks to sum |
| 4. Role lenses | Six lightweight Executive/QC/QA/Engineering/Finance/Procurement views of the same Blueprint; unchanged calculations and saved state verified | Final release verification; no parallel stakeholder model |
| 5. Impact Watch | Project-specific candidate links to actual method/evidence/assumption/unresolved records; explicit versioned human disposition; failed feeds/stale bases blocked; existing browser revisions and account snapshots reused | Final release verification; live digest readiness remains Phase 0; feed matching is not full-text regulatory review |
| 6. Controlled learning | Existing frozen observations, append-only review, permission and validation-case controls verified; duplicate project/commercial references now withheld from Gate 1 counting | Real distinct paid engagements and qualified permissioned observations; no public benchmark or statistical-validation claim |

Existing sensitivity searches aggregate cost/FTE/area/workload and peak resource
utilization bands. It does not prove an individual incubator 3→4 transition, and
currently recompiles its baseline using the current engine. Those are explicit
Phase 2 gaps, not capabilities to imply in new copy.

## Historical foundation verification and boundaries — before repair

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

The subsequently applied schema action is documented in
[`migrations/reconciliation/README.md`](../migrations/reconciliation/README.md).
The historical Drizzle ledger remains unreconciled. Do not silently replay its
baseline or present this focused repair as a complete migration history.

Funnel retries remain bounded and best effort across page closure. Email provider
acceptance is not confirmed inbox delivery, and external send plus database guard
is not atomic. These limits must remain visible in release/operating evidence.

## Historical CSV and Twin implementation evidence — 6–8 September

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
At that release the deployed capability endpoint returned `aiAvailable:false`.
Health and deployment-specific runtime logs exposed the two missing tables and
funnel receipt 503s. The 9 September repair supersedes that runtime observation.

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
journeys passed on that deployment. Its inspected runtime errors were the
then-known funnel persistence 503s, before the 9 September repair.

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

Specialist handoff commit 924fe6f passed CI run 34072740707 and all four Twin
journeys on its Ready Preview. Runtime inspection still showed only the known
sanitized funnel persistence failures in the returned error records.

The subsequent local slice adds exhaustive specialist status-transition probing
with explicit baseline coverage. The synthetic accepted four-analyst basis first
changes turnaround status at 32 batches/month from a baseline of 30; this is an
engine status transition, not evidence of verified site capacity. All 685
unit/server tests, validation/type-check and build pass. Desktop and mobile
threshold cards have been visually inspected. Full release verification of
this slice remains pending.

Next: finish release verification, then compose the existing calculation engines
into the Decision Twin with exact first decision thresholds and lineage. The
full founder goal remains active; Phases 2–6 are not implied complete by intake.

Release follow-ups through 5a0e439: specialist warning search now includes new
engine watch/critical signals under unchanged aggregate status; navigation uses
four primary report destinations with a disclosed technical index. Both passed
CI and four deployed Twin journeys. Latest verified CI: 34090902726; Preview:
`life-science-atlas-gx6y130kr-enexiaplatforms-projects.vercel.app`.

Current sensitivity handoff reuses existing report analysis to prepare low/high
one-assumption Twin scenarios, resets unrelated controls to baseline, restores
Compare focus, and presents evidence requirements. Full local gates passed
(686 unit/server tests and 53 critical browser checks); compact-card copy was
then clarified to identify evidence rather than an unspecified output threshold.
Release verification of this handoff remains pending. Phase 2 consolidation,
Challenge, unified role lenses, project impact review and controlled learning
remain part of the full objective.

## 8 September combined implementation and release gate

This entry supersedes the earlier pending Phase 2–6 implementation notes above.
Challenge, six role lenses and project-aware Impact Watch now connect the same
Blueprint and existing engines. Operating-model application blockers/risks join
accepted specialist findings. No new calculation engine, primary navigation
destination, dependency or physical schema object was introduced.

Impact reviews require explicit disposition, stated role, rationale and user
confirmation. Records survive existing snapshots, but a changed publication,
project basis or copied project invalidates current-review status. Failed feeds
cannot produce a project all-clear. See ADRs 0007 and 0008 for bounded scoring,
matching and provenance contracts. Confidential source/project details never
enter the new analytics events.

The existing calibration, permission, frozen-observation and append-only review
architecture remains authoritative. Gate 1 now withholds conflicting project IDs
and commercial references instead of counting duplicate packets as independent
paid engagements. Three projects remain learning evidence, not statistical
validation. No real observation, customer outcome or benchmark has been invented.

Validation/type-check, production build, 703 unit/server tests and 58 critical
browser tests pass. The operating-model regression was separated into bounded
cases after a full-suite timeout; all resulting cases pass together with the
complete suite. Desktop/mobile Challenge, Executive/Finance and Impact Watch
were visually inspected; browser tests cover confirmation, saved state, source
failure, context preservation, accessibility and reflow.

The 8 September production read-only preflight was repeated: exactly the two
prepared tables were absent, while the other 13 tables/86 columns matched the
contract. No real DDL had been applied at that checkpoint. The 9 September entry
above records the later authorized repair; payment/email configuration and
acceptance, safe job acceptance and real qualified paid-project learning remain
separate requirements.
Push, CI and deployed journey evidence are recorded below when complete.

## 8 September candidate-first Impact Watch follow-up

A read-only review of the deployed Blueprint-to-monitor journey found that the
project queue mixed bounded candidates with every successful-feed item carrying
zero candidate records. The queue now presents candidate reviews only, keeps the
no-match count and non-all-clear boundary visible, links to the full official feed
for manual inspection, and preserves a direct return to the source Blueprint.
This is a presentation correction only: the deterministic matcher, official-source
checks, stored review contract and executable project model are unchanged.
