# ADR 0006: Decision Twin orchestration over saved Blueprints

- Status: Accepted
- Date: 2026-09-06
- Scope: First Decision Twin vertical slice

## Decision

Embed the Twin in the existing Blueprint report. The first finding is the first
modeled equipment quantity transition above the saved monthly batch basis. A
small form then varies batches, total horizon growth, operating days, shifts,
outsourcing and people reserve. Existing Compiler outputs and Scenario Compare
provide the before/after staffing, work, space, equipment and cost consequences.
No LLM or parallel calculation engine is introduced.

Probes evaluate every whole-batch value above the baseline, up to the next 100
integers by default (hard maximum 1,000 probes and the canonical demand ceiling).
They stop at the first changed current or planning-horizon equipment count.
Fractional monthly averages start at the next integer. This is exhaustive only
at the stated one-batch resolution and within the displayed tested range; it
does not locate fractional discontinuities, prove monotonicity or establish
installed-capacity sufficiency. A no-change result explicitly limits its claim.

Aggregate batch probes are unavailable for portfolio-derived or unreconciled
demand. Users must edit product allocation in the planner. Thresholds retain the
current/planning-horizon distinction, equipment rationale, confidence category,
evidence identifiers and links to the saved equipment Decision Lineage.

## Preserving the model basis

Before simulating, compare saved inputs with the Blueprint input snapshot and
compare the material saved outputs/version/domain with a fresh Compiler result.
Mismatch blocks simulation and requests a reviewed recompile. The Twin never
silently replaces a saved or frozen baseline with today's engine.

Transient scenarios are not persisted automatically. An explicit save uses the
existing project persistence path to create a separate browser scenario with
a fresh evidence/revision record. The original remains unchanged. Illustrative
origin is preserved, so the new example cannot enter a real commercial workflow.
No account upload or expert approval is implied. Unchanged scenarios cannot be
saved from this workspace.

## Progressive integration

Existing specialist links retain the saved project ID and state which basis
they open. Users save and open a changed scenario before running its specialist
analysis. Turnaround, installed-capacity feasibility, shift coverage and
redundancy are not fabricated from aggregate monthly figures. Their required
inputs and existing engines remain authoritative.

This first slice does not complete founder Phase 2: deeper integration of the
specialist results, the consolidated project workspace/navigation, and expanded
constraint coverage still require implementation and user-journey verification.
Challenge ranking, additional role lenses and project Impact Watch follow in
priority order. These gaps must not be described as shipped capabilities.

## Verification

Deterministic tests check a real Compiler transition and its preceding integer,
bounded no-change results, fractional baselines, stale versions/outputs,
unmodified source projects, comparison deltas and invalid changes. Desktop and
mobile browser tests cover simulation, a separate saved scenario, preserved
origin, invalid-input recovery, accessibility and reflow. Only synthetic
projects are used. Funnel stages contain no project name, values or source text.

## Accepted specialist basis — 7 September 2026

Turnaround, equipment resilience, non-routine load, skill/shift coverage and
operating-model pages now offer an explicit reviewed-assumptions handoff. The
user accepts the current analysis input as a planning basis, including any
illustrative defaults; this is not verified site evidence or expert approval.
Editing the input clears acceptance. A restore action recovers the accepted
input only when its source still matches.

The optional canonical-input `specialistBasis` array contains at most five
`quality-lab-specialist-basis/v1` records. Each is a discriminated, validated
specialist input, a confirmation time and a SHA-256 source-basis fingerprint.
The hash covers canonical model inputs, engine/core and domain versions,
excluding intake/provenance annotations and the specialist records themselves.
This allows adding a basis without invalidating it, but invalidates it when
model inputs change. Project identity is checked separately. No new database
table or parallel project store is introduced; these additive versioned
annotations travel through the existing input snapshot and account contract.

Accepting a basis creates a new browser revision through the existing save path.
It follows frozen revisions, exports and explicit account saves. Existing
projects without the optional annotation remain valid. The Twin displays missing,
invalid, duplicate and stale states instead of substituting default site facts.
It runs the existing specialist engines twice with the same accepted operating
assumptions, exposing status and selected before/after metrics with their time
horizon and limits. Calendar/shift changes require separate reconciliation;
their specialist deltas are withheld rather than silently overriding deployment
or calendar assumptions. Saved alternate project IDs also require reconnection.

The standalone operating-model draft store is preserved for compatibility, but
only explicit handoffs become part of the Twin's revisioned basis. Specialist
engine outputs remain concept screens, with their original evidence and human
review boundaries. Broader first-constraint search and navigation consolidation
remain outstanding Phase 2 work.

The next slice adds a bounded specialist status-transition search over accepted
bases. It probes every whole batch above baseline, up to 100 additional batches
by default, using the existing engines with fixed assumptions. It retains all
five coverage states and baseline statuses: an already-failing result does not
become safe merely because its status stays unchanged. Missing, stale or invalid
bases are excluded explicitly; loss of an otherwise evaluable engine aborts the
search. Portfolio-derived demand is not probed as an aggregate input.

The UI separates these transitions from equipment quantity thresholds. Neither
is described as a universal first constraint: specialist status aggregation can
hide changes within an existing failure state. Tests compare every preceding
demand step to the turnaround engine and verify missing-basis and bounded-range
outcomes. Broader metric-level constraint coverage, sensitivity consolidation
and simplified navigation remain required.

Report navigation now leads with four destinations: Decision brief, Decision
Twin, Actions & deliverables, and Evidence. Technical destinations reveal the
existing detail view before scrolling and receiving keyboard focus. The full
section index remains available inside a disclosure, and existing section IDs
and specialist deep links are retained. This is an initial navigation
consolidation; sensitivity and the full decision orchestration remain unfinished.
