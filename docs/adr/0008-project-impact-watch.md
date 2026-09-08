# Project-aware official update review

## Decision

Reuse the existing FDA/EMA monitor and the saved canonical Blueprint. A bounded,
deterministic topic and exact-evidence-locator match produces candidate links to
actual methods, evidence, assumptions and unresolved inputs. No separate model,
LLM, database service or executable rule update is introduced.

Only updates from currently successful feeds enter the project queue. Publisher
URLs must use HTTPS and the registered FDA or EMA host family. A source failure,
stale model or unavailable project cannot produce an applicability conclusion.
No match explicitly means the bounded match found nothing, not regulatory safety.
The matching uses feed title/summary and locators, not a verified full-text diff.
It does not establish applicability by market or product. The full official
publication remains the required human review source.

## Human disposition and provenance

The user selects a disposition, states a role and rationale, and explicitly
confirms review before recording it. The versioned strict contract binds the
record to project ID, a SHA-256 canonical basis fingerprint and a publication
fingerprint covering source, URL, date, title and summary. A copied project,
changed basis or changed publication needs another review. The role is a user
statement, not a verified identity or electronic approval signature.

Records append to the existing input annotation/revision path, capped at 100;
they do not change sizing inputs or executable rules. Review annotations do not
invalidate accepted specialist assumptions. Browser storage is the initial home;
existing explicit account snapshot saves carry the record. Concurrent project
edits are checked before saving. The feature does not send emails, silently sync
project files or automatically revise customer models.

## Presentation and measurement

Blueprint links directly to the project-selected monitor. The existing monitor
hosts one project selector, update queue and review form; there is no new primary
navigation destination. Long publication titles remain visible below the selector
on mobile. `impact_watch_reviewed` uses only allowlisted stage/source and random
journey/event IDs. No source title, rationale or project fact enters analytics.

## Verification and limits

Tests cover official-host spoofing, stale models, untrusted instruction text,
record provenance, changed/copy invalidation, snapshot preservation, explicit
confirmation, failed feeds and mobile/desktop accessibility. There is no claim of
complete regulatory surveillance, verified applicability or public benchmark
confidence. Production analytics/digest persistence still depends on the
separately prepared runtime schema repair and operational configuration.
