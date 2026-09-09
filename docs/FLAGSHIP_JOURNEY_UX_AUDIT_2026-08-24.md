# Flagship Journey UX Audit — 2026-08-24

## Audit scope

- Product: Life Science Atlas public Quality Lab journey.
- User goal: understand the offer, build an initial non-sterile microbiology model, inspect decision boundaries, and prepare an expert-review request.
- States: guest, dark theme, local development build.
- Viewports: 1440 × 1000 desktop and 390 × 844 mobile.
- Evidence folder: `docs/design-references/flagship-journey-audit-2026-08-24/`.

## Journey steps

1. **Homepage promise — healthy.** The first viewport leads with the Quality Lab Blueprint, first-wedge boundary, free model, public sample, $149 Diagnostic, $990 starting Blueprint scope, delivery target, and human-review boundary. Evidence: `01-homepage-desktop.png` and `07-homepage-mobile-390x844.png`.
2. **Planner start choice — healthy.** Atlas-guided, blank site data, illustrative example, and validated JSON import are separated clearly. Suggestions are explicitly planning assumptions. Evidence: `02-planner-start-desktop.png` and `11-planner-start-mobile-390x844.png`.
3. **Guided intake — healthy.** Locked-step reasons, project/scenario identity, decision mandate, demand patterns, capability recommendations, operating assumptions, live model preview, completeness, evidence readiness, blockers, and rule trace stay visible. Evidence: `03-guided-intake-desktop.png`.
4. **Compiled decision brief — healthy.** The first report viewport separates modeled operational flags, controlled-use blockers, model completeness, evidence readiness, decision status, and the top unresolved decisions. Mobile collapses secondary export tools and provides a direct decision-brief action. Evidence: `04-blueprint-decision-brief-desktop.png`, `08-blueprint-report-mobile-390x844.png`, and `09-blueprint-decision-mobile.png`.
5. **Expert-review handoff — healthy after fix.** The page states the offer, price, response/delivery basis, scope-brief readiness, engagement choice, data-transfer choice, and no-payment-on-submit boundary. On mobile, offer context now appears before the form instead of showing the readiness checklist first. Evidence: `05-expert-review-handoff-desktop.png` and `10-expert-review-mobile-390x844.png`.
6. **Public sample — healthy.** The synthetic boundary, 17-page structure, controlled-use blockers, example calculations, evidence actions, PDF path, paid inclusions, and operating terms are explicit. Evidence: `06-public-sample-desktop.png`.
7. **Decision routing and evidence layer — healthy.** The product router makes Quality Lab the selected flagship while keeping Pro and Career clearly distinct. Atlas Evidence links named, bounded evidence to lifecycle decisions without implying SME approval. Evidence: `12-products-desktop.png`, `16-products-mobile.png`, and `15-evidence-desktop.png`.
8. **Quality Lab flagship surface — healthy.** The immersive desktop compiler and reduced mobile stage view preserve the product-to-method-to-workload-to-resource-to-output story, plus explicit concept and expert-review states. Evidence: `13-quality-lab-landing-desktop.png` and `14-quality-lab-landing-mobile.png`.

## Changes made from audit evidence

- Cleared the stale selected-application state in Method Navigator when a search has no bounded result; unsupported queries now leave all application buttons unpressed.
- Restored offer-first visual order on the mobile expert-review page so users see scope, price, deliverables, and payment boundary before the intake checklist.
- Added smoke regression coverage for both states.

## Accessibility and responsive observations

- No horizontal document overflow was observed at the 390 px viewport on the audited mobile routes.
- Selected states expose `aria-pressed`; planner locked steps explain what unlocks them; the review form retains the heading before form content in DOM and visual order.
- Desktop and mobile browser console errors were zero across the audited journey.
- Screenshot review can support visible hierarchy, contrast risk, target separation, and reflow, but cannot prove full screen-reader or keyboard conformance.

## Evidence limits and external blockers

- The review form was not submitted, no checkout was started, and no external communication or payment action occurred.
- Full-snapshot handoff requires an authenticated account and was not exercised in the guest audit.
- Production preflight currently reports eight configuration blockers: session secret, public origin, Stripe core, enabled commerce mode, Diagnostic price ID, transactional email, commercial owner inbox, and canonical site URL. PostHog and lifecycle cron remain warnings.
- The protected schema audit could not connect from this environment and made no database changes.
- Gate 1 still requires three real paid/discovery engagements, qualified reviewer evidence, controlled acceptance, and estimate-to-actual learning. Those facts cannot be created through UI polish or source code.

## Overall verdict

The public flagship journey is coherent, reachable, and trust-bounded on desktop and mobile. The remaining release blockers are protected environment configuration and real commercial/reviewer evidence, not an unfinished public product flow.
