# Decision Intelligence Architecture Alignment

Last audited: 2026-07-26  
Repository baseline: `main` at `c23b583` before this change set  
Production surface audited: current public Vercel alias supplied for this repository

This document records the architecture lock and phased implementation path for Life Science Atlas. `PRODUCT_SOURCE_OF_TRUTH.md` remains canonical for product direction.

## Product architecture lock

Life Science Atlas has exactly three commercial product axes:

1. **Atlas Quality Lab Blueprint** — the flagship B2B decision product and principal moat builder.
2. **Life Science Atlas Pro** — the subscription professional knowledge and working layer.
3. **Atlas Career Blueprint** — the separate personal career-decision product and execution workspace.

Evidence graphs, Domain Packs, ontology, rules, governance, validation, persistence, analytics, authentication, billing and the design system are infrastructure. They are not a fourth product.

## Shared and product-specific boundaries

| Layer | Shared platform | Quality Lab | Atlas Pro | Atlas Career |
| --- | --- | --- | --- | --- |
| Identity and commerce | Express sessions, users, purchases, Stripe entitlements | Uses shared accounts and paid diagnostic/engagement access | Uses shared Pro entitlement | Uses shared one-time purchase entitlement |
| Evidence and content | Stable content IDs, MDX metadata, evidence conventions, search/taxonomy | Domain Packs, rule/evidence traces, Method Graph and compiler | Academy, workflows, tools and working packs | Regulated-role content and evidence artifacts only where appropriate |
| Decision engine | No generic cross-product engine | Portfolio → method/application → resource → recommendation | Bounded professional tools; not a Blueprint substitute | Role → competency → evidence → gap → route → execution plan |
| Persistence | PostgreSQL plus explicit browser resilience where product-appropriate | Browser-local working copy plus explicit account snapshot/revisions | Account learning, downloads and monthly reviews | Browser resilience plus account profile/execution records |

Career contracts remain separate from Quality Lab method and resource contracts. Pro content may reference the same evidence standards but does not inherit Quality Lab project state.

## Current sources of truth

| Data class | Current source of truth | Notes and boundary |
| --- | --- | --- |
| Accounts, sessions, purchases, leads, commercial requests | PostgreSQL through Drizzle schemas in `shared/models/auth.ts` and `shared/schema.ts` | Server-authoritative when configured |
| Account-saved Quality Lab projects and revisions | PostgreSQL `quality_lab_reviewed_projects` and `quality_lab_reviewed_project_revisions` | Phase 1 deliberately reuses these legacy physical tables for explicit concept saves and review-stage snapshots; the validated JSON contract distinguishes state |
| Anonymous and resilient Quality Lab working projects | `localStorage` envelope `lsa:quality-lab-projects:v2` | Migrates from v1 without deleting the legacy key; invalid records are skipped, not rewritten over the source |
| Compiler rules, Domain Pack, Method Graph and evidence catalog | Typed TypeScript registries under `shared/quality-lab*.ts` | Executable source; exact compiler, pack, rule and evidence versions are carried into outputs |
| Academy, blog and toolkit long-form content | MDX under `content/` | MDX remains the authoring source |
| Searchable/gating metadata | Generated `client/src/data/content-manifest.json` | Derived artifact; not an authoring source |
| Static navigation and product catalog data | Typed client registries under `client/src/data/` and the English i18n catalog | Product/UI configuration, not project evidence |
| Governance working registers | Browser-local or authenticated PostgreSQL revisions depending on register | Working evidence controls; never automatic verification or approval |

## Compiler boundary and maturity

The executable wedge is non-sterile pharmaceutical microbiology. It currently supports market-aware product profiles, explicit in-house/outsource allocation, a versioned Method Graph concept, method BOM, workload/resource compilation, staffing, equipment, consumables, space and cost ranges, operational risks, source coverage, rule trace and governance controls.

The compiler is a concept decision model, not a site-approved design. Method nodes remain conventional concept benchmarks. Raw materials, water and environmental monitoring retain broader workload rules. Capacity is not a detailed scheduler or engineering simulation. No paid real-world calibration or accepted real validation case exists in the repository baseline, and the Domain Pack is not verified.

Phase 1 adds `quality-lab-lineage/v1`, a reusable compiler-produced lineage record for material totals, recommendations and sized equipment outputs. Each record holds stable output and decision IDs, calculation basis, contributing inputs, workflow/method links, exact rule/evidence versions, assumptions, confidence, limitations, unresolved evidence and material-change factors. Compiler integrity validation rejects duplicate IDs and orphan rule/evidence/assumption/workflow/method references.

Phase 2 exposes those records through `/quality-lab/projects/:id/lineage/:lineageId` and a reusable human-readable panel. Material scenario resources, equipment quantities and recommendations link to the same compiler record. The `quality-lab-readiness/v1` contract separately records model completeness, evidence readiness and decision readiness, with dimension scores, formulas, blocker caps and a fallback derivation path for saved v1 Blueprints that predate the field.

Phase 4 separates the editable engagement calibration worksheet from `quality-lab-calibration-observation/v1`. Freezing an observation records the exact project revision timestamp, input/output/compiler/Domain Pack versions, complete rule-version trace, observed period, data owner, evidence references, actuals, recalculated variances, metric bases, variance drivers and candidate eligibility at that instant. A deterministic application fingerprint detects accidental snapshot or variance tampering. `quality-lab-calibration-review/v1` keeps acceptance, rejection and withdrawal as append-only review events; no event can edit the observation, executable rule registry or benchmark registry. `quality-lab-validation-case-registry/v2` then requires an accepted frozen observation and exports its observation ID, so an editable calibration worksheet cannot qualify a Validation Case by itself. The browser-local registry is an application-level working control, not a cryptographic signature, database audit log, client document-control system or approval record.

Phase 5 adds `quality-lab-commercial-handoff/v1` as the shared, versioned source for a controlled URS drafting document and RFQ comparison workbook. Every stable requirement carries intended use, concept quantity basis, functional/performance requirements, utilities and interfaces, qualification impact, exclusions, supplier evidence requests, exact method/rule/evidence references, Decision Lineage IDs, unresolved inputs, readiness and blockers. The internal handoff page, authenticated DOCX export and six-sheet XLSX export all compile from that contract. Supplier names are entered once, response completeness is formula-backed, and the workbook intentionally contains no automatic score, rank, equivalence claim, vendor selection or award recommendation. These remain qualified-review working artifacts, not an approved URS, engineering specification, quotation or procurement decision.

Phase 6 adds `quality-lab-operating-model-input/v1` and `quality-lab-operating-model/v1`. The engine derives stable method-product and workflow applications from the compiled Blueprint, allocates concept CAPEX by application workload weight, annualizes it over an explicit asset-life assumption, derives a current Blueprint OPEX-per-test range and compares that basis with a scoped external price. Each application records steady-state break-even bounds, first-year transfer cost, turnaround and sample-hold feasibility, internal capability, method readiness, external qualification, backup coverage, data access, investigation responsiveness, surge capacity, continuity, strategic control and confidentiality. Any material unknown forces `evidence-required`; only a complete basis can produce `insource`, `outsource` or `hybrid`. Every conclusion has a versioned operating-model Decision Lineage record, exact missing-evidence questions, sensitivity triggers and related Blueprint lineage links. Inputs remain browser-local under `lsa:quality-lab-operating-model:v1`; the result is decision support, not a savings guarantee, laboratory qualification, method approval, supplier selection, transfer authorization or procurement award.

The service-assisted review bridge adds `quality-lab-operating-model-review-draft/v1` and the immutable `quality-lab-operating-model-review/v1` snapshot. Freeze eligibility fails closed unless the exact project is in expert review, a paid engagement and commercial reference are recorded, every application has a non-blocked operating-model basis plus controlled review evidence, and QA, laboratory, finance and procurement roles each have a referenced review. A frozen snapshot preserves the complete operating-model input and analysis, project/compiler/Blueprint/Domain Pack versions, model-versus-reviewed mode, rationale, actions, evidence references, application lineage IDs and a deterministic source/review fingerprint. It explicitly does not approve the operating model, select a supplier, create validation evidence or change executable rules. Drafts and snapshots remain browser-local under `lsa:quality-lab-operating-model-reviews:v1` with portable registry export.

## Persistence progression and safety

Phase 1 keeps browser storage as the working copy and makes account persistence an explicit user action. Account writes carry an expected server timestamp. A stale timestamp returns `409` with the current account record; the browser project is not silently overwritten. Every changed accepted account snapshot uses the existing append-only revision path. Cross-device recovery recreates a local working copy.

The snapshot contract `quality-lab-account-project/v1` includes project timestamps plus an extensible workspace foundation: project status, decision owner, review state, evidence requests, unresolved assumptions, action-owner roles and revision history. Old review snapshots remain readable because all additions have compatibility defaults or are optional.

### Migration risk

`migrations/0000_baseline.sql` contains seven tables, while the current Drizzle schemas contain substantially more production entities. The migration ledger therefore does not describe the current application schema. This phase makes no physical schema change and reuses existing deployed tables. Before any new table or column is shipped, capture the actual production schema, reconcile it against Drizzle definitions and the migration journal in a staging copy, generate additive migrations, rehearse backup/restore, and only then apply production migrations. `db:push` must not be used against production data.

## Production audit snapshot

The audited production deployment was Ready and served the public application without observed 500-level runtime logs during the checked window. `/api/health` reported the service operational but not commerce-ready. Database, sessions, Stripe core and cron were reported ready; the paid Scope Diagnostic price, transactional email, analytics and configured public origin were not ready. The reported public origin pointed to a Vercel project URL rather than the public production alias. These are deployment configuration gaps, not values that should be committed to source.

The production homepage already presents Quality Lab as flagship while retaining Pro and Career as distinct product axes. The planner already provides guided, known-input, example and import entry modes, and the sample is clearly synthetic and bounded. Before Phase 1, projects were browser-local until review attachment, readiness language conflated completeness with evidence readiness, sensitivity lacked threshold detection, and no reusable Decision Lineage contract or per-output lineage UI existed.

## Delivery phases

| Phase | Status after this change | Scope |
| --- | --- | --- |
| 0 — audit and architecture lock | Complete | Route/schema/storage/production audit, architecture and migration-risk record, baseline gates |
| 1 — foundation | Complete in code | Versioned lineage contract and referential integrity; explicit account project save/restore/delete; local v1→v2 compatibility; conflict detection; revision-safe API; UI/analytics/privacy copy; no physical DB change |
| 2 — signature transparency | Complete in code | Human-readable Decision Lineage route/panel; separate model completeness, evidence readiness and decision readiness; formula drill-downs, trace/source analytics and migration-compatible fallback |
| 3 — decision robustness | Complete in code | Versioned deterministic bounded threshold search; per-output and per-driver fragile/conditional/robust-in-tested-range classification; exact planner-input deep links; affected Decision Lineage links; ordered what-to-confirm-next queue and analytics |
| 4 — learning moat | Complete in code | Immutable estimate-to-actual observation snapshots; frozen Blueprint/rule/evidence/variance/eligibility basis; append-only accepted/rejected/withdrawn review events; controlled registry export; no automatic rule or benchmark update |
| 5 — commercial handoff | Complete in code | Versioned vendor-neutral requirement contract; internal traceability page; authenticated controlled URS DOCX and six-sheet RFQ XLSX from one source; supplier declaration completeness without scoring, ranking, equivalence or vendor selection |
| 6 — operating-model decision | Complete in code | Versioned application-level inputs and analysis; transparent break-even range and first-year transfer basis; operational/quality/control factors; evidence-required fail-closed behavior; sensitivity triggers, export, analytics and Decision Lineage; paid-diagnostic cross-functional review gate with immutable model-versus-review snapshots |

## Exact continuation points

1. Use the completed Phase 6 worksheet and review bridge in the first controlled paid diagnostic; capture comparable provider quotations, actual end-to-end turnaround, sample stability, qualification scope, data package, investigation response and continuity evidence without relabeling the frozen stakeholder record as an approval or award decision.
2. After real execution data exists, freeze a separate calibration observation and compare estimates with qualified actuals; record corrections and estimate-to-actual variance before changing any executable rule or cost benchmark. The operating-model review snapshot is not a substitute for calibration evidence.
3. Reconcile the production database and migration ledger before moving browser-local operating-model assumptions, calibration observations, organization/workspace membership or normalized canonical graph records server-side.
4. Configure deployment-only `PUBLIC_APP_URL`, paid Scope Diagnostic price, transactional email, commercial recipients and analytics; verify `/api/health` reports commerce readiness without exposing secret values.

No work in later phases should relabel synthetic cases as real, mark a Domain Pack verified automatically, select a vendor, or update executable rules without controlled expert approval and rollback.
