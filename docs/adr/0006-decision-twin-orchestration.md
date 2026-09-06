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
