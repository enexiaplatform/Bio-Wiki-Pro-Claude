# First-session activation measurement

Status: measurement contract for the current Quality Lab onboarding slice  
Owner: Product Director / commercial operator  
Decision cadence: weekly during controlled onboarding

## Initiative decision

The first-session screen exists to move a newly authenticated account into one of three strategic Quality Lab starts: build a capability model, inspect the synthetic Blueprint, or review the USD 149 Paid Scope Diagnostic. The operating question is not whether the welcome page received traffic. It is whether a new account made an explicit choice and reached the intended next step without Atlas overstating purchase intent or value realization.

## Primary KPIs

### Strategic-start selection rate

`unique authenticated accounts selecting at least one onboarding path / unique authenticated accounts viewing onboarding`

This is the primary choice-clarity signal. It changes the product decision: weak selection calls for clearer choice architecture or entry framing, while strong selection with weak destination reach points to a routing or runtime problem.

### Destination reach rate

`unique onboarding viewers that select a path and emit the matching destination receipt / unique authenticated accounts viewing onboarding`

Matching receipts are:

- capability model → planner opened;
- illustrative sample → sample explored;
- Scope Diagnostic → commercial review intake viewed.

This is a handoff-health metric, not evidence of delivered customer value, qualified demand, purchase intent, or revenue.

## Drivers

For each strategic path, report unique accounts selecting the path, unique accounts reaching its matching destination, and destination reach as a percentage of path selections. Counts are non-exclusive because an account may legitimately inspect more than one route.

## Guardrails

- Only events carrying an authenticated server-session user ID enter onboarding KPIs; anonymous or forged onboarding receipts are excluded.
- Funnel receipts remain privacy-minimal: no email, contact details, project inputs, regulated evidence, or free-text customer context.
- A selection is not called activation value, a sample view is not a qualified lead, and a Diagnostic view is not a purchase.
- Commercial Blueprint journeys and synthetic-example exploration remain separated from the onboarding cohort.
- Missing runtime schema or failed receipt persistence must remain visible and must not block the user journey.

## Target policy

No numerical product target is asserted before a real onboarding baseline exists. Review raw denominators and path mix weekly; set a target only after the configured first-party receipt table is live and controlled onboarding has produced enough real accounts to distinguish a product pattern from individual-session noise. The first three paid engagements remain the commercial learning gate and are not replaced by click metrics.

## Evidence reviewed

- `docs/PRODUCT_SOURCE_OF_TRUTH.md` for the service-assisted Quality Lab strategy, initial microbiology wedge, pricing, customer priority and Gate 1 evidence requirement.
- The existing `quality_lab_funnel_events` receipt table, session-side user attribution, strict event schema and Admin Control Center funnel.
- Current planner, public sample and Diagnostic intake destination events.
- The authenticated `/welcome` route and its three strategic choices.

## Assumptions and known limits

- Browser receipt delivery is best-effort and may be blocked; counts are operational signals, not a financial ledger.
- The production runtime currently reports its Gate 1 schema as incomplete, so production activation measurement is not yet proven live.
- PostHog remains optional. The KPI source of truth is the first-party receipt path once its reviewed schema migration is applied.

## Learning questions

- Which path is selected first by real design-partner prospects?
- Where does destination reach fail despite a clear selection?
- Do accounts that first inspect the synthetic sample later build a model or enter the Diagnostic?
- Which path creates the strongest qualified conversations and accepted paid work once the Gate 1 sample exists?
