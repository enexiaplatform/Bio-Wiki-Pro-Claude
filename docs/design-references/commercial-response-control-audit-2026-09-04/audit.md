# Commercial response control audit

Date: 2026-09-04

## Scope

Combined UX and accessibility review of the private Admin Pipeline response queue. The operational goal is to prevent a stored commercial request from being missed when email routing is unavailable while preserving the two-business-day response promise.

## Flow evidence

1. `01-response-control-desktop.png` — healthy. The time-critical summary appears before request detail; overdue work is first; missing owner and next action are visible on the same card.
2. `02-response-control-mobile.png` — healthy after responsive refinement. KPI cards use a compact two-column layout, forms remain single-column, the primary save action has a 44px minimum target, and the page has no horizontal overflow at 390px.

## Strengths

- The queue reuses the existing request and pipeline fields and needs no production schema change.
- Two-business-day deadlines are deterministic, skip weekends in UTC and expose the public-holiday limitation.
- New overdue and due-soon requests sort before progressed records.
- The interface states that internal status is not proof of buyer contact and directs operators to retain an external communication reference.

## Risks and evidence limits

- Public holidays and local operating calendars are not modeled.
- Moving a request beyond `new` removes it from the open response queue, but does not prove that an external response was delivered.
- The current schema has no immutable first-response timestamp or notification-delivery history. Adding those controls would require a reviewed migration and real workflow evidence.
- Screenshot review does not establish screen-reader or full keyboard compatibility; automated coverage verifies the response summary, overdue state, mobile reflow and primary action target size.
