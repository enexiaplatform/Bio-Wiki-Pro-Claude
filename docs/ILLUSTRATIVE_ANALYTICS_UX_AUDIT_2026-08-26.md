# Illustrative analytics and commercial-funnel UX audit

**Date:** 2026-08-26
**Surface:** Public sample and Casebook → illustrative Blueprint → commercial reporting
**Mode:** Combined UX, trust-boundary and analytics-integrity audit

## Audit scope

This audit followed synthetic Blueprint exploration from the public Casebook into a quarantined browser-local project and then tested a direct commercial-review URL. It also traced the emitted first-party receipt into the Admin funnel snapshot contract.

## User goal and accessibility target

A visitor should be able to inspect Atlas reasoning without synthetic activity being mistaken for commercial intent. If the visitor deliberately moves from an example into a real planner, review request or checkout, that transition should become measurable without carrying synthetic project facts forward.

## Numbered flow

1. **Casebook entry — healthy.** The hero and visible boundary identify the scenarios as synthetic before any interaction. `Build from your inputs` remains a commercial-intent path.
2. **Explore synthetic Blueprint — corrected.** Opening a case now emits `example_explored` with `startMode: example` and destination `synthetic_blueprint`, rather than the commercial `cta_clicked` stage.
3. **Illustrative project — healthy.** The project remains visibly quarantined and offers a deliberate `Build my own model` transition. That transition is now recorded as a real planner CTA.
4. **Direct review URL — corrected.** The visible no-attachment boundary remains, and merely viewing this boundary no longer emits `review_viewed` into the commercial funnel.
5. **Admin funnel — corrected in contract and UI.** Commercial-intent journeys and illustrative journeys are shown separately. Synthetic sample, Casebook and worked-example events are excluded from stage conversion rates; legacy `sample` and Casebook `editable_project` receipts are also classified as illustrative without a database migration.
6. **Mobile reflow — healthy at 390 × 844.** The boundary, safe CTA, compact export controls and illustrative badge remain visible without document-level horizontal overflow.

## Strengths

- Synthetic status is disclosed before and after the Casebook transition.
- The same browser journey may move from exploration to commercial intent, but only an explicit planner, review or checkout signal promotes it into commercial reporting.
- First-party receipts remain privacy-minimal: no project inputs, contact details or evidence content are added.
- Existing database rows remain compatible because the new stage uses the current text column and the snapshot builder recovers known legacy patterns.

## UX and trust risks resolved

- **Inflated top-of-funnel conversion:** Casebook exploration previously appeared as a Blueprint CTA click.
- **Inflated review interest:** opening a blocked review URL for an illustrative project previously recorded `review_viewed`.
- **Worked-example contamination:** planner starts and compiled models from the illustrative start mode can now be excluded from commercial stage counts.
- **Invisible learning signal:** removing synthetic activity entirely would lose product-learning value; the Admin view now retains it as a separate illustrative metric.

## Accessibility risks and evidence limits

- Visible synthetic labels, action names and boundary hierarchy are clear in the captured desktop and mobile states.
- The mobile viewport has no document-level horizontal overflow.
- Screenshots do not prove screen-reader announcement order, keyboard traversal, zoom resilience or color-contrast ratios.
- The local database was unavailable during the browser run. The server accepted the privacy-minimal event fail-soft and exposed its bounded fields in diagnostics, while deterministic unit coverage proves snapshot classification. A production database receipt and authenticated Admin screenshot remain deployment/runtime evidence rather than screenshot evidence from this local run.

## Evidence

- `design-references/illustrative-analytics-audit-2026-08-26/01-casebook-entry.png`
- `design-references/illustrative-analytics-audit-2026-08-26/02-synthetic-project-boundary-desktop.png`
- `design-references/illustrative-analytics-audit-2026-08-26/03-synthetic-project-boundary-mobile.png`

No real customer data, review request, payment, account record or external communication was created during this audit.
