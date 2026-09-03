# Discovery Frame Storage UX Audit — 2026-09-03

## Scope

This audit covers the public Atlas Blueprint Discovery Pack decision-framing flow at `/quality-lab/discovery-pack`, with emphasis on privacy expectations, unfinished-work recovery, explicit handoff, failure states, and responsive reachability.

## Finding

The previous page wrote every decision-frame change to indefinite `localStorage` automatically. The disclosure appeared after all seven fields and after the commercial handoff actions, so a visitor could enter an accountable owner, review scope, decision gate, evidence basis, and unresolved business impact before learning that the data had already been retained. The control labelled “Clear this browser-local frame” mixed two jobs: clearing the visible form and deleting the retained copy.

Health before change: **Needs improvement**. The decision-framing logic and explicit diagnostic handoff were sound, but the retention default and late disclosure weakened trust in a commercially sensitive acquisition flow.

## Implemented correction

- Default state is ephemeral: entries remain only in the rendered page and are not written to browser storage.
- A disclosure and unchecked opt-in now appear before the first decision-frame field.
- Opted-in drafts use `sessionStorage`, expire after eight hours, and disappear when the tab closes.
- Draft records are versioned and reject future-dated, expired, malformed, or oversized content.
- Any legacy silently retained `localStorage` frame is removed and is not restored without consent.
- “Delete saved copy” removes the tab-local draft without erasing the visible form.
- “Clear on-screen frame” clears the visible form, disables persistence, and removes both draft and handoff records.
- The diagnostic handoff remains a separate explicit action. If browser storage is unavailable, navigation stops and the page gives a copy-first recovery instruction.
- No decision-frame content is sent to analytics or a server by this feature.

Health after change: **Healthy for browser-local acquisition use**. Retention, deletion, and transfer are now distinct user decisions with bounded lifetimes and visible recovery guidance.

## Audited flow

1. Open the public Discovery Pack and reach the decision canvas — healthy.
2. Enter decision details with storage opt-in off — healthy; reload starts from an empty frame.
3. Enable “Keep this decision frame in this tab” — healthy; saving status and deletion control appear immediately.
4. Reload within eight hours — healthy; the saved frame is restored with a review-before-handoff message.
5. Delete the saved copy — healthy; on-screen entries remain and persistence turns off.
6. Clear the on-screen frame — healthy; the visible frame, opted-in draft, and pending handoff are removed.
7. Choose the diagnostic handoff — healthy; only that explicit action transfers the frame into the commercial brief in the current tab.
8. Download the eleven existing CSV templates after editing the frame — healthy; filenames and downloads remain unchanged.

## Evidence

- Before: `design-references/discovery-frame-storage-audit-2026-09-03/02-before-canvas-mobile.png`
- Before: `design-references/discovery-frame-storage-audit-2026-09-03/03-before-silent-retention-mobile.png`
- After: `design-references/discovery-frame-storage-audit-2026-09-03/04-after-opt-in-desktop.png`
- After: `design-references/discovery-frame-storage-audit-2026-09-03/05-after-saving-enabled-desktop.png`

Automated coverage verifies the default no-save state, legacy-record cleanup, explicit opt-in, bounded restore contract, delete-without-clearing behavior, full clear behavior, template downloads, and diagnostic handoff. Type checking, repository validation, unit/server tests, the public browser suite, accessibility suite, and production build are the release gates for this change.

## Accessibility and evidence limits

The opt-in is a native labelled checkbox; dynamic save and error messages use status/alert semantics; buttons retain minimum touch-target sizing; and the existing keyboard-reachable handoff remains a link. Automated accessibility coverage supplements manual accessibility-tree inspection.

This audit validates product behavior with synthetic browser data only. It does not establish customer demand, reviewer appointment, commercial acceptance, regulatory applicability, or model calibration. Gate 1 still requires three distinct real discovery or paid Blueprint engagements and their controlled delivery evidence.
