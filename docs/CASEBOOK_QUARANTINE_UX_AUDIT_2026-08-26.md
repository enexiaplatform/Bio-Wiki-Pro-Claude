# Casebook quarantine UX audit

**Date:** 2026-08-26
**Surface:** Blueprint Casebook → synthetic Blueprint project
**Mode:** Combined UX, trust-boundary and responsive audit

## Audit scope

The audit followed the first Casebook scenario from its public synthetic-case disclosure into the generated browser-local Blueprint. The goal was to verify that illustrative data stays visibly and functionally separate from commercial review, account persistence and active project reporting.

## User goal and accessibility target

A visitor should be able to explore how the Compiler behaves without mistaking synthetic values for a customer project or sending them into a controlled commercial workflow. The boundary must remain explicit in visible copy, accessible names and available actions on desktop and mobile.

## Numbered flow

1. **Casebook disclosure — healthy.** The entry page labels all scenarios as synthetic and distinguishes them from customer cases, calibrated benchmarks and validated designs.
2. **Open a scenario — corrected.** The action now says `Explore synthetic Blueprint` and stores `origin: illustrative-example` instead of silently using the user-entered default.
3. **Blueprint trust boundary — corrected.** The project shows an explicit illustrative-example notice and badge. Commercial review and engagement-packet actions are removed; the safe handoff is `Build my own model`.
4. **Direct-route boundary — corrected.** Manually opening review, engagement, commercial-handoff or paid operating-model routes now fails closed with a clear synthetic-example explanation instead of creating a packet or crashing the page.
5. **Mobile reflow — healthy in the tested 390 × 844 viewport.** The boundary notice, safe CTA and illustrative badge remain readable without horizontal clipping.

## Strengths

- The Casebook already states the synthetic boundary before entry.
- The shared project model already has an explicit `illustrative-example` origin and downstream fail-closed controls.
- The Blueprint report already provides distinct desktop and mobile quarantine UI once the origin is preserved.

## UX and trust risks resolved

- **Commercial contamination:** Casebook projects previously defaulted to `user-entered`, exposing `Engagement packet` and `Request expert review` for synthetic values.
- **Contradictory copy:** `Open as editable project` and the closing instruction implied that editing a sample could make it ready for review. The revised copy keeps exploration separate from a new site-input model.
- **False provenance:** The title contained “Illustrative case,” but the status badge incorrectly said `Concept blueprint · SME review required`. Origin now drives the stronger `Illustrative synthetic example` label.
- **Legacy local records:** Existing Casebook projects saved under the old `user-entered` origin are recovered from their reserved `case-` product identifiers and normalized back to illustrative on read.
- **URL bypass and runtime failure:** The shared engagement contract rejects illustrative projects, while operational pages detect the same boundary before attempting packet creation.

## Accessibility risks and limits

- The tested actions have descriptive accessible names, and the quarantine notice is exposed as a status region.
- The mobile screenshot confirms reflow and readable hierarchy, but it does not prove screen-reader announcement order, keyboard focus order, zoom behavior or color-contrast ratios. Automated accessibility coverage and assistive-technology testing remain separate evidence.

## Evidence

- `design-references/casebook-quarantine-audit-2026-08-26/01-casebook-project-before.png`
- `design-references/casebook-quarantine-audit-2026-08-26/02-casebook-project-fixed-desktop.png`
- `design-references/casebook-quarantine-audit-2026-08-26/03-casebook-project-fixed-mobile.png`

No real customer data, review request, account record or external communication was created during this audit.
