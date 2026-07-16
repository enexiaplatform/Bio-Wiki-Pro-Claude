# First-user audit remediation plan

> Audit date: 2026-07-16  
> Plan date: 2026-07-16  
> Source: strict first-user audit covering landing, Blueprint intake, compiled output, projects, scenario comparison, pricing, and expert-review request  
> Strategic basis: `docs/PRODUCT_SOURCE_OF_TRUTH.md`

## Outcome

Make Atlas credible and purchasable as a **fixed-scope, service-assisted Blueprint pilot** without presenting the current product as recurring enterprise SaaS or a validated automated design system.

The plan optimizes for the first 3 paid engagements. It does not attempt to build a complete enterprise collaboration platform before real pilot evidence justifies it.

## Execution update — Project Action Center

The next customer-return slice is now implemented:

- every compiled unresolved input creates a traceable project action;
- the customer can record owner role, due date, evidence note, and action status;
- actions close automatically only when recompilation removes the source input and reopen if the input returns;
- project cards expose stage, next action, owner, due date, and portfolio action totals;
- action history persists locally and is included in an explicitly saved reviewed-project snapshot;
- engagement checklists inherit customer action ownership/evidence context;
- controlled workbooks and decision briefs include the action register;
- analytics cover action-center views and action updates.

Commercial facts remain gated by `docs/BLUEPRINT_PILOT_COMMERCIAL_DECISIONS.md`; no price, SLA, reviewer identity, or sample claim has been invented.

## Execution update — Portfolio daily work queue

The Projects workspace now gives returning users one prioritized queue across every local Blueprint:

- overdue and due-within-seven-days actions lead the queue;
- ready-for-review and in-progress actions stay ahead of unscheduled open work;
- blocking actions without a due date are counted explicitly instead of disappearing inside project cards;
- every queue item links directly to the originating Project Action Center;
- analytics distinguish queue views from action opens, and desktop/mobile layouts have been verified.

This improves return cadence without introducing email claims, automatic cloud storage, or unsupported collaboration behavior.

## What the audit changes

The audit validates the core value moment: a small operational intake can produce a useful cross-functional laboratory planning model. The immediate problem is not missing model breadth. It is trust, commercial clarity, role separation, and a broken handoff between the browser-local model and expert review.

Repository inspection also changes one recommendation from the audit:

- Full reviewed-project persistence, append-only revisions, and controlled workbook/PDF generation already exist for signed-in users.
- The customer UI nevertheless says only written context is submitted, while a full snapshot is synced after submission and sync errors are silently ignored.
- Therefore, the first persistence task is to make consent, sync status, recovery, and data handling explicit. Organization-level collaboration and RBAC remain a later pilot-driven slice.

## Prioritization rules

1. Fix misleading or contradictory regulated-quality signals before adding features.
2. Productize the paid Blueprint offer before optimizing the $8 Pro plan.
3. Reuse the reviewed-project and revision infrastructure already in the repository.
4. Keep internal validation and learning controls out of the customer workspace.
5. Build only the collaboration capability required by actual paid pilots.

## Phase 0 — remove trust blockers

**Target:** 2–4 working days  
**Release condition:** a first buyer cannot mistake model completeness, risk count, scenario deltas, data transfer, or internal controls for something they are not.

### P0.1 Separate model risks from controlled-use blockers

Current issue:

- The report can show `0 high-priority risks` beside low `controlled-use readiness` and multiple blocking inputs.
- `dataQuality.completenessPercent` is presented as controlled-use readiness even though it measures input completeness, not approval or fitness for use.

Change:

- Rename the percentage everywhere to **Input completeness**.
- Present three independent statuses in the decision brief:
  - operational risks produced by the model;
  - blocking inputs/evidence gaps;
  - review status: concept / review requested / expert reviewed.
- When blocking inputs exist, show a prominent **Not ready for controlled use** state regardless of modeled risk count.
- Rename `high-priority risks` to **high modeled operational risks** and add a separate **controlled-use blockers** count.
- Add deterministic tests for combinations such as zero modeled risks plus one or more blocking inputs.

Primary code areas:

- `client/src/components/quality-lab/BlueprintReport.tsx`
- `client/src/pages/QualityLabPlannerPage.tsx`
- `client/src/pages/QualityLabProjectsPage.tsx`
- `shared/quality-lab.ts`
- related unit tests in `shared/*.test.ts`

Acceptance criteria:

- No screen equates completeness with approval/readiness.
- Zero modeled risk can never visually imply that a blocked model is safe to use.
- The report answers: what the model found, what is missing, and what review has occurred.

### P0.2 Make scenario identity and causality defensible

Current issue:

- Project name is doing double duty as scenario identity.
- The comparison only tracks a subset of numeric top-level inputs, while nested portfolio, market, capability, evidence, and rule changes can move outputs.
- The UI can say no tracked input changed while area or utilization changes materially.

Change:

- Add a required/displayed `scenarioLabel` separate from project name, with suggested values such as `Baseline — 1 shift` and `Alternative — 2 shifts`.
- On duplication, open a rename/label step and show source scenario plus last edited time.
- Build a normalized input-diff that covers top-level assumptions, scope, markets, product profiles, evidence state, and versioned engine/domain-pack inputs.
- For each material output delta, display the changed input(s), consuming rule ID/version, direction of effect, and evidence/confidence status when available.
- If outputs differ without an explainable normalized input or version change, show a comparison-integrity error and disable decision export.
- Prevent comparison of the same project/revision and warn when no meaningful controlled difference exists.

Primary code areas:

- `client/src/lib/quality-lab-projects.ts`
- `client/src/pages/QualityLabProjectsPage.tsx`
- `client/src/pages/QualityLabScenarioComparePage.tsx`
- `shared/quality-lab-comparison.ts`
- `shared/quality-lab-comparison.test.ts`

Acceptance criteria:

- Selectors are distinguishable without opening a project.
- Every material delta has an explicit causal trace or is flagged as unexplained.
- `No tracked numeric assumption changed` cannot coexist with unexplained material output changes.

### P0.3 Remove internal operations from customer navigation

Current issue:

- Customer project surfaces link to Paid pilot portfolio, Learning review queue, validation/governance controls, and other Gate 1/Gate 2 operations.
- Several internal routes are registered alongside customer routes without a clear role boundary.

Change:

- Define three product roles: customer, expert reviewer, Atlas admin.
- Remove pilot, calibration, validation registry, rule-change, ownership, and Gate 2 links from customer project pages.
- Place Atlas operations under the authenticated admin surface and enforce server/client authorization appropriate to each route.
- Keep the customer workspace limited to project inputs, scenarios, assumptions/evidence gaps, review handoff, revisions shared with the customer, and controlled deliverables.
- Keep reviewer-only controls inside a clearly labeled review workspace.

Primary code areas:

- `client/src/pages/QualityLabProjectsPage.tsx`
- `client/src/pages/QualityLabEngagementPage.tsx`
- `client/src/pages/AdminDashboardPage.tsx`
- `client/src/App.tsx`
- `client/src/components/Navigation.tsx`
- relevant API authorization in `server/routes.ts`

Acceptance criteria:

- A non-admin buyer sees no internal portfolio, learning queue, validation registry, Gate 2, ownership, or rule-change operations.
- Direct navigation to internal routes is denied or redirected for unauthorized users.
- Customer and reviewer actions are labeled by role and intended outcome.

### P0.4 Make review handoff and data consent truthful

Current issue:

- The form says the model stays in the browser and only written context is submitted.
- For an authenticated user, the application subsequently attempts to sync the full reviewed-project snapshot and silently ignores failure.

Change:

- Add an explicit choice before submission:
  - submit scope brief only; or
  - securely attach the full Blueprint snapshot for expert review.
- Explain exactly what is stored, why, who can access it, retention/deletion behavior, and that it is not regulatory approval.
- Await the snapshot sync when the user opts in; show success, partial success, or failure rather than swallowing the error.
- Give the user a retry and export fallback if secure save fails.
- On success, show the response SLA and the exact next step.
- Update privacy/FAQ copy to match actual behavior.

Primary code areas:

- `client/src/pages/QualityLabReviewPage.tsx`
- `client/src/lib/quality-lab-projects.ts`
- `server/routes.ts`
- `client/src/pages/PrivacyPage.tsx`
- `client/src/pages/FaqPage.tsx`

Acceptance criteria:

- No full model is persisted without explicit user action.
- The user can see whether the scope brief and full Blueprint were each received.
- A failed sync is recoverable and never reported as a complete handoff.

## Phase 1 — productize the paid pilot

**Target:** 4–7 working days after founder commercial decisions are supplied  
**Release condition:** a qualified buyer can understand the offer, assess fit and budget, submit the right project context, and know exactly what happens next.

### P0.5 Replace the lead-form offer with a productized Blueprint pilot

Create one primary commercial offer: **Expert-reviewed Quality Lab Blueprint pilot**.

The offer page and review request must state:

- eligible project type and first-wedge scope;
- included and excluded work;
- client inputs and workshops required;
- named deliverables and file formats;
- delivery stages and target timeline;
- reviewer role and qualification standard;
- revision/clarification policy;
- acceptance event;
- response SLA;
- starting price, price range, or explicit qualification logic;
- data-handling basis;
- redacted sample deliverable.

Recommended package hierarchy for the current gate:

1. **Concept Sandbox** — local example/blank model, limited decision summary, no claim of controlled delivery.
2. **Blueprint Pilot** — scoped service engagement, secure reviewed project, review trail, controlled workbook/brief, and agreed acceptance event.
3. **Evidence Pro** — clearly secondary individual access to deeper evidence and reusable resources.

Do not advertise a Team SaaS tier until pilots show repeat multi-user demand and define the minimum required collaboration workflow.

Primary code/content areas:

- `client/src/pages/PricingPage.tsx`
- `client/src/pages/QualityLabReviewPage.tsx`
- `client/src/pages/QualityLabLandingPage.tsx`
- `client/src/pages/FaqPage.tsx`
- a controlled redacted sample under the existing deliverable/content mechanism
- relevant analytics events

Acceptance criteria:

- A buyer can estimate fit, procurement effort, timing, deliverables, and commercial basis without contacting Atlas for basic facts.
- The primary CTA is the Blueprint pilot; Pro is visibly supporting evidence access.
- Submission confirmation includes owner, response time, and next milestone.

### P1.1 Make example state explicit

Change the planner entry into a clear three-way start:

- **Use example**
- **Start blank**
- **Import inputs**

Add a persistent `Example project` badge, a short replacement checklist, and a one-click blank reset. Imported files must be schema/version validated and must not silently overwrite an existing project.

Acceptance criteria:

- A first user cannot mistake the Vietnam example for their own saved or inferred data.
- Analytics distinguish example exploration, blank starts, and imports.

### P1.2 Turn the report into a decision brief first

Restructure the on-screen result into:

1. **Decisions possible now**
2. **Decisions blocked** and the exact evidence/input required
3. **Detailed calculations and trace**

Add lightweight role lenses for QC, QA, engineering, and procurement by filtering/prioritizing the same underlying findings; do not create separate calculation models. Keep the full detail in controlled export.

Acceptance criteria:

- The first viewport answers what can be decided, what cannot, and why.
- Role lenses do not hide blockers or change the underlying result.
- Full assumptions, calculations, evidence, and limitations remain reachable.

### P1.3 Fix the observed accessibility defects

- Remove the nested `main` landmark from the planner.
- Add `aria-pressed` or equivalent selected semantics to facility, market, and capability controls.
- Announce why future steps are locked and what action unlocks them.
- Measure and fix dark-theme contrast for helper and muted small text.
- Verify keyboard order, visible focus, 200% zoom/reflow, and primary screen-reader announcements.

Acceptance criteria:

- No nested main landmark.
- Every visual selection state has an equivalent programmatic state.
- Locked steps have an accessible reason.
- Changed surfaces pass automated accessibility checks plus a documented keyboard/zoom smoke test.

## Phase 2 — complete the pilot workspace using existing infrastructure

**Target:** 1–2 weeks, driven by the workflow of the first paid pilot  
**Release condition:** Atlas and the customer can recover, review, revise, and hand off one real Blueprint with an inspectable history.

### P1.4 Promote reviewed-project persistence into a visible workflow

- Show secure-save state, last successful sync, revision number, and recovery status.
- Let authenticated users recover reviewed projects on another device.
- Expose a customer-safe revision timeline and immutable delivery release identifiers.
- Add explicit project deletion/retention controls.
- Instrument sync success/failure and recovery.

Use the existing reviewed-project, revision, workbook, and PDF infrastructure before adding new tables or services.

### P1.5 Add only the collaboration required by pilots

Start with project membership and simple roles only if a pilot requires another person to access the same project. The minimum likely set is owner, contributor, reviewer, and read-only recipient.

Defer real-time co-editing, comments everywhere, SSO, SCIM, complex organization policy, and broad enterprise administration until repeated paid usage demonstrates the requirement.

Acceptance criteria:

- One real pilot can complete intake → expert review → correction → controlled release → client acceptance without relying on ambiguous browser-local state.
- Every released artifact can be tied to a project revision, reviewer disposition, limitations, and acceptance event.

## Instrumentation

Add or verify events for:

- planner start mode: example / blank / import;
- step completion and abandonment;
- compile success and blocking-input count;
- decision brief viewed;
- scenario created, comparison valid/invalid, unexplained delta;
- review offer viewed;
- scope brief submitted;
- full-snapshot consent granted/declined;
- reviewed-project sync success/failure/retry;
- sample deliverable viewed;
- pilot qualification accepted/declined;
- controlled deliverable released;
- client acceptance recorded.

Primary funnel:

`Blueprint landing → planner start → compile → decision brief → review offer → qualified request → scoped pilot → controlled delivery → acceptance`

## Founder decisions required before Phase 1 release

These must be real commercial decisions; the product must not invent them:

1. Pilot starting price, range, or qualification threshold.
2. Target response SLA and delivery timeline.
3. Reviewer identity/role and the qualification evidence that may be shown publicly.
4. Included deliverables, number of review rounds, and acceptance criteria.
5. Data retention/deletion policy and who may access an attached Blueprint.
6. A redacted sample deliverable approved for public use.

Phase 0 can ship while these decisions are being finalized.

## Verification gate for each phase

- `npm run check`
- targeted unit tests during implementation
- `npm test`
- `npm run validate`
- `npm run build`
- Playwright/public smoke coverage for changed routes
- desktop and mobile browser verification of the complete changed journey
- console error check
- keyboard, focus, zoom/reflow, and automated accessibility checks for the changed controls

## Paid-pilot readiness definition

Atlas is ready to recruit and charge the first design partners when all of the following are true:

- Phase 0 trust blockers are closed.
- The pilot offer has real price/scope/timeline/reviewer/deliverable terms.
- The buyer explicitly controls whether a full Blueprint is attached.
- A submitted project can be recovered and its review/revision state is visible.
- Internal operational controls are inaccessible from the customer role.
- A redacted sample demonstrates the promised handoff.
- The release has passed the repository and browser verification gates.

This threshold authorizes a controlled paid pilot, not recurring enterprise SaaS positioning or a claim that the Domain Pack is validated.

## Explicitly deferred

- Optimizing the $8 Pro subscription or one-time content products.
- Broad content growth unrelated to Blueprint decisions.
- Full enterprise organization administration.
- Real-time collaboration.
- New quality domains beyond the current evidence-gated microbiology wedge.
- Claims of regulatory approval, validated design, or autonomous expert replacement.

## Recommended execution order

1. P0.1 risk/readiness semantics.
2. P0.2 scenario identity and causal trace.
3. P0.3 customer/admin/reviewer separation.
4. P0.4 explicit review consent and observable sync.
5. Founder commercial decisions and sample deliverable.
6. P0.5 productized Blueprint pilot offer.
7. P1.1 example/blank/import onboarding.
8. P1.2 decision-first report and role lenses.
9. P1.3 accessibility fixes.
10. P1.4 reviewed-project recovery and visible revisions.
11. P1.5 minimum pilot-proven collaboration.

