# Commercial request draft UX audit — 2026-08-27

## Outcome

The 4–6 minute commercial brief now has an explicit, privacy-minimal recovery path. A visitor may opt in to keeping unfinished entries in the current tab for up to eight hours. The draft is never sent to Atlas until the visitor submits the form, and it is deleted after a successful request.

This closes an acquisition-friction gap without turning the commercial intake into a hidden account record or silently retaining contact and project information.

## Audited flow and health

1. Open a standalone Diagnostic, Blueprint Pilot, or fit-review intake — healthy.
2. Decide whether to keep an unfinished copy in the current tab — healthy; default is off and the boundary is stated before opt-in.
3. Enter partial commercial-fit, contact, and project-context information — healthy; incomplete values can be saved without weakening final-submit validation.
4. Reload the tab — healthy; the exact standalone/project-scoped draft is restored and visibly identified.
5. Reconfirm the no-confidential-information attestation — healthy; the attestation is deliberately not saved or restored.
6. Delete the saved copy or turn storage off — healthy; the tab copy is removed while current on-screen entries remain available.
7. Submit successfully — healthy; the draft is removed and the existing request receipt becomes the reload-safe source of truth.

## Design and trust decisions

- Opt-in is explicit and off by default because the draft can contain contact details and commercial project context.
- Storage uses `sessionStorage`, not an account API, database, analytics event, or `localStorage`.
- The eight-hour expiry and tab-close boundary are both stated in the interface.
- Drafts are versioned and isolated to `standalone` or the exact local project ID.
- Malformed, future-dated, expired, or wrong-scope drafts fail closed.
- A guest cannot restore a previously selected full-snapshot handoff; that choice falls back to brief-only unless authenticated.
- Confidentiality confirmation is excluded from the draft schema and always returns unchecked after reload.
- Storage failures leave the on-screen form intact and surface an actionable message.

## Accessibility and responsive review

- The opt-in uses a native checkbox with its explanatory text in the accessible name.
- Restore/save state uses `role="status"`; storage failure uses `role="alert"`.
- Delete is a real button with a text label and a minimum mobile target height.
- At 390 × 844, the control stacks without horizontal overflow (`390px` viewport; `382px` document width in the audited run).
- Desktop and mobile visual hierarchy keep the optional storage choice before readiness and commercial inputs.

## Current-run evidence

- Before: [`01-draft-control-before-desktop.png`](design-references/commercial-request-draft-audit-2026-08-27/01-draft-control-before-desktop.png)
- Opted-in desktop state: [`02-draft-opt-in-desktop.png`](design-references/commercial-request-draft-audit-2026-08-27/02-draft-opt-in-desktop.png)
- Restored mobile state: [`03-draft-restored-mobile.png`](design-references/commercial-request-draft-audit-2026-08-27/03-draft-restored-mobile.png)

The browser audit restored partial values after reload, kept the confidentiality attestation unchecked, reported no console warnings/errors, and found no mobile horizontal overflow. Automated coverage additionally verifies explicit opt-in, restore, scope isolation, expiry, deletion, malformed input rejection, confidentiality exclusion, and cleanup after successful submission.

## Evidence limits

- This is convenience recovery, not encrypted vault storage, a controlled record, or an account-synced project record.
- `sessionStorage` remains readable to scripts executing in the same origin and available on a shared device while the tab stays open.
- The audit used synthetic, non-sensitive values and mocked submission responses; it did not transmit a real lead, send email, charge a payment method, or prove real-world commercial conversion.
- Gate 1 still requires three real discovery or paid Blueprint engagements and controlled delivery/acceptance/calibration evidence.
