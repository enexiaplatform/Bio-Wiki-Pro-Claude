# ADR 0005: Confirmed file intake around the Compiler

- **Status:** Accepted
- **Date:** 2026-09-06
- **Scope:** File-to-Blueprint intake, founder intelligence evolution Phase 1

## Decision

Start with UTF-8 comma CSV in the existing planner. Users export a relevant
spreadsheet sheet; native XLSX, PDF and DOCX parsing are deferred. Two-column
field/value rows and a single header/value record provide exact cell locators
without inferring totals or introducing a document-processing service.

Parse locally with hard limits: 256,000 UTF-8 bytes, 500 rows, 40 columns,
2,000 nonempty cells and 500 characters per cell. Reject overflow, invalid UTF-8,
malformed quoting and controls instead of silently truncating input. Formulas are
inert text and cannot become numeric values. Only canonical field ranges pass.

Both exact-label matching and optional AI mapping create candidates. Neither
changes a model. The user must confirm each field against its source, choosing
one source when candidates conflict. Missing and unchecked values stay absent
from the applied set. The existing complete input validation gates compilation.

Optional authenticated AI assistance uses an explicitly configured Responses
model and server-owned field definitions. Its structured response contains only
field keys and locators. The application reconstructs values from original
cells, normalizes again, and requires the same confirmation. Cells are untrusted
data; they cannot supply instructions, tools, executable rules or regulatory
conclusions. No authoritative model calculation depends on provider output.

## Provenance and compatibility

`quality-lab-intake-confirmation/v1` records field, normalized value, exact source
text, bounded row context, filename, SHA-256 fingerprint, CSV cell, extraction
method/version, confidence category and confirmation time. This is self-declared
transcription history, not an expert signature or verified regulatory evidence.
The report identifies later edits that no longer match the imported value.

The optional `intakeProvenance` envelope is additive within canonical input v1;
no existing field meaning or calculation changes. Existing snapshots without it
remain valid. The envelope has its own explicit version; changing its meaning
requires a new version. It travels with the existing input snapshot, frozen
revision, explicit account save and JSON export. No physical database migration
or new project store is introduced. Existing evidence/readiness requirements
remain open until resolved through their established controls.

## Data handling and operation

The full file and unconfirmed candidates stay in component memory. Confirmed
source excerpts persist only as part of a saved Blueprint input. The UI discloses
account/export propagation before applying. Optional AI requires sign-in and
explicit permission to send CSV cell text through Atlas to OpenAI; filename and
file fingerprint are excluded from that request. `store:false` disables response
retrieval storage; it is not a zero-retention claim. Provider/account data policy
must be reviewed before operating this service with confidential customer data.

Leave `OPENAI_API_KEY` and `QUALITY_LAB_INTAKE_MODEL` empty to disable AI. When
operationally approved, use a project-scoped key, a model supporting Responses
Structured Outputs, provider spend limits, and a synthetic preview acceptance
test. No default model or credential is assumed. AI accepts at most 500 cells
and 96,000 serialized input bytes; local parsing supports larger files. Requests
have a 15-second deadline, bounded responses and five attempts per 15 minutes per
IP/process. This in-memory limiter is not a global serverless spending cap.

Logs contain request status and sanitized error codes, never source text or
provider errors. Journey events contain stage/source metadata only. PostHog
recording and automatic text/attribute capture are explicitly disabled.

Provider request format was checked against the official
[Structured Outputs guide](https://developers.openai.com/api/docs/guides/structured-outputs)
and [Responses reference](https://developers.openai.com/api/reference/cli/resources/responses/methods/create).
Analytics options follow [PostHog's configuration reference](https://posthog.com/docs/libraries/js/config).

## Verification

Synthetic tests cover exact locators, normalization, formula and instruction
payloads, limits, conflict handling, explicit confirmation, compilation and
account/revision round trips. Mocked provider tests cover refusal, malformed or
foreign mappings, failed/oversized responses and timeout. Endpoint tests cover
authentication, consent, server allowlists and sanitized failures. Desktop and
mobile browser journeys cover source review, partial application, edited-source
labels, accessibility, reflow, invalid-file recovery, AI consent and failure.

No real uploaded/customer data, real AI call or production setting change was
used for implementation verification. Configured-provider acceptance remains an
operator prerequisite, not a claim established by mocked tests.
