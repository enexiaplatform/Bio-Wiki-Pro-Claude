# Illustrative project quarantine UX audit

Date: 2026-08-25
Scope: Quality Lab Blueprint worked example, expert-review handoff, Projects reporting, and account-sync boundary.

## User goal

Let a first-time visitor explore a complete Blueprint example without allowing synthetic facts to become commercial evidence, an expert-review request, an active work item, or an account-synced project.

## Flow health

1. **Worked example → compiled report — Healthy after fix.** The report is explicitly labeled `Illustrative synthetic example`, explains what is excluded, removes the engagement packet, and routes the user to build a model with their own facts.
2. **Compiled report → commercial review — Healthy and fail-closed.** A direct review URL cannot attach an illustrative project. The review page shows an alert, clears the synthetic handoff, and resets to a no-commitment fit review.
3. **Compiled report → Projects / queue / account sync — Healthy for newly tagged examples.** Illustrative projects are presented in a separate section and excluded from portfolio metrics, the work queue, weekly review, comparison actions, and account-sync controls.

## What is working well

- The amber status treatment makes the data boundary visible at the moment a user might otherwise mistake the report for a real project.
- The replacement CTA preserves momentum: users can explore the example, then start a real model without encountering a dead end.
- The review guard gives a clear reason and a recovery path instead of silently discarding context.
- Projects keeps the example available for learning while preventing it from affecting operational or commercial reporting.
- The persisted `origin` marker makes the boundary deterministic across duplicate, save, review, and sync paths.

## Risks resolved

- Synthetic site, demand, and cost values can no longer prefill the paid expert-review handoff.
- Illustrative projects no longer inflate active-project, decision-value, work-queue, or weekly-review metrics.
- Duplicating an example preserves its illustrative origin instead of turning it into a normal project.
- Account snapshot creation and account sync reject illustrative projects even if a client-side caller bypasses the visible controls.

## Accessibility notes

- The report boundary uses a live status region; the blocked review handoff uses an alert region.
- Primary recovery actions retain the existing large-button treatment and remain comfortably targetable on the 390 px mobile viewport.
- The report banner, actions, and content reflow without horizontal clipping at the audited mobile size.
- Screenshot review cannot prove keyboard order, screen-reader phrasing across assistive technologies, zoom behavior, or full WCAG conformance; automated flow coverage supplements but does not replace those checks.

## Evidence and limits

- Existing legacy projects without an `origin` field remain user-entered by default. No name-based migration was added because project titles are not reliable provenance.
- The authenticated account-sync boundary is covered by shared logic and unit tests, not by mutating a live production account.
- No customer, payment, expert-review, or production pipeline record was created during this audit.

## Screenshots

1. [Desktop example quarantine](./design-references/illustrative-project-quarantine-audit-2026-08-25/01-example-quarantine-desktop.png)
2. [Mobile example quarantine](./design-references/illustrative-project-quarantine-audit-2026-08-25/02-example-quarantine-mobile.png)
3. [Direct review URL guard](./design-references/illustrative-project-quarantine-audit-2026-08-25/03-review-guard-desktop.png)
4. [Projects separation](./design-references/illustrative-project-quarantine-audit-2026-08-25/04-projects-separation-desktop.png)
