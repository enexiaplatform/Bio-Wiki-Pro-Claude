# Onboarding activation measurement audit

Date: 2026-09-04

## Scope

Local production-mode review of the Admin Control Center after adding first-party first-session activation measurement. The API responses shown in the screenshot are deterministic mock counts used only to verify layout, labels and metric semantics; they are not presented as real customer activity.

## Evidence

- `01-admin-funnel-desktop.png` — the existing Blueprint funnel contains a distinct authenticated-account cohort panel without displacing the commercial funnel. The two primary rates, raw denominators and three non-exclusive path handoffs are visible together.
- The browser accessibility tree exposes the `First-session activation` heading, all three path labels and the guardrail that destination reach is not value realization or purchase intent.
- Critical browser coverage uses a 390 × 844 viewport for this tab and checks that the admin surface does not overflow horizontally.

## Health assessment

- Metric hierarchy: healthy. Selection and destination reach are primary; path rows explain the drivers.
- Honesty: healthy. The panel explicitly declares measurement-first baseline status and does not invent a target.
- Privacy: healthy by contract. Only server-session-attributed account IDs enter the onboarding cohort; no email, project input, regulated evidence or free text is accepted in the event payload.
- Commercial separation: healthy. Onboarding views alone do not create commercial-intent Blueprint journeys.
- Production data availability: open external gate. The current production health response reports the Gate 1 runtime schema as incomplete, so real production counts remain unproven until the reviewed migration is applied.
