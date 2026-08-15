# Life Science Atlas — Full Project Audit & Development Roadmap

**Audit date:** 2026-08-13  
**Scope:** product strategy, public content, paid assets, Quality Lab Compiler, evidence governance, visuals, UX, accessibility indicators, engineering validation, and commercial readiness.  
**Canonical direction:** `docs/PRODUCT_SOURCE_OF_TRUTH.md` and `LIFE_SCIENCE_ATLAS_MASTER_GOAL_PROMPT.md`.

## Implementation addendum — 2026-08-13

The repository implementation following this audit now includes:

- one consistent planning-horizon growth definition and regression coverage;
- BSC capacity bound to the user-supplied productive-hours input;
- corrected public maturity copy, mobile Blueprint action placement and blocker-first hierarchy;
- Blog quality disclosure plus a 20-item Quality Lab trust corridor enforced by validation;
- a canonical source-identity layer shared by content, the Compiler pack and Method Navigator;
- application-level Method Graph nodes for method suitability, raw materials, water, environmental monitoring and growth-promotion/media QC;
- explicit uncalibrated uncertainty ranges, derivation labels and output-maturity labels;
- twelve reusable, model-generated technical decision panels spanning eight visual archetypes in the Blueprint decision layer;
- an application-level Method Navigator coverage matrix that separates method depth, evidence state, controlled revision and reuse of the same record across views;
- bounded principal-decision claim-to-source bindings for every trust-corridor item, exposed with exact canonical source editions and release limitations;
- accessible captions and explicit column-header scope on every Blueprint technical table, enforced in the browser smoke suite;
- an automated WCAG 2.1 A/AA accessibility gate across ten strategic desktop/mobile routes, plus planner keyboard-state and 320 CSS-pixel reflow checks;
- a lightweight resource-selection boundary that keeps the source registry and connected-resource graph out of the initial application bundle; the largest entry chunk fell from approximately 614 KB to 354 KB and no longer triggers Vite's 500 KB warning;
- controlled reviewer ownership, paid-pilot economics, estimate-to-actual calibration, buyer decisions, corrections, acceptance, immutable review evidence and separate external-publication permission;
- a two-stage Gate 2 control: four version-matched evidence prerequisites open qualified release review, while actual release requires a separate cross-case decision, rule disposition and documented approval outside Atlas;
- project owner, input-source owner and controlled input revision captured at intake and carried into report/export surfaces.

No real-world proof was fabricated. The current records remain open wherever evidence must come from licensed compendial access, named qualified reviewers, client-controlled documents, paid delivery, observed actuals, written publication permission or external release approval. Those are execution dependencies, not code-completeness defects.

### Requirement completion matrix

| Audit requirement | Repository evidence | Current status |
|---|---|---|
| One growth definition, unit, formula and tests | `shared/quality-lab-sensitivity.ts`, `shared/quality-lab-comparison.ts`, `shared/quality-lab-sensitivity.test.ts` | Implemented and regression-tested |
| BSC productive-time consistency | `shared/quality-lab.ts`, `shared/quality-lab.test.ts` | Bound to the project productive-hours input |
| Mobile action safety and blocker-first hierarchy | `client/src/components/quality-lab/BlueprintReport.tsx`, `e2e/smoke.spec.ts` | Implemented; mobile overflow, focus and non-fixed action asserted |
| Blog evidence transparency and 15–20 page trust corridor | `client/src/pages/BlogPost.tsx`, `shared/quality-lab-trust-corridor.ts`, `script/validate-content-quality.ts` | Twenty-item corridor enforced; release promotion remains blocked until review evidence exists |
| Principal decision claim-to-source relationships | `shared/content-quality.ts`, `shared/content-quality-registry.ts`, `client/src/components/ContentQualityNotice.tsx` | Every corridor record exposes a bounded binding to canonical source editions; all remain `review-required`, not controlled |
| Canonical evidence identity | `shared/content-quality-registry.ts`, `shared/quality-lab-microbiology-pack.ts`, `client/src/data/methodStandardsNavigator.ts` | Shared IDs and version assertions implemented |
| Application-level Method Graph | `shared/quality-lab-method-graph.ts` | Suitability, raw materials, water, EM and GPT/media nodes implemented; unsupported scopes remain explicit |
| Method Navigator coverage matrix | `client/src/data/methodStandardsNavigator.ts`, `client/src/pages/MethodStandardsNavigatorPage.tsx` | One row per application separates architecture, six-dimension depth, source state, missing controlled revision and connected-view reuse |
| Derivation, uncertainty and maturity per output | `shared/quality-lab.ts`, `client/src/components/quality-lab/BlueprintReport.tsx` | Ranges and maturity labels implemented; still uncalibrated where real actuals are absent |
| Coefficient owner, unit, rationale, range, applicability and calibration plan | `shared/quality-lab-model-glossary.ts` | Versioned registry carried into Blueprint and delivery workbook |
| Twelve decision-support visuals | `client/src/components/quality-lab/BlueprintVisualDecisionLayer.tsx` | Twelve model-derived panels; no decorative proof imagery |
| Technical table accessibility | `client/src/components/quality-lab/BlueprintReport.tsx`, `e2e/smoke.spec.ts` | All Blueprint tables have accessible captions and scoped column headers; mobile focus/overflow remain asserted |
| Automated accessibility gate | `e2e/accessibility.spec.ts`, `package.json` | Thirteen checks cover automated WCAG 2.1 A/AA rules on ten strategic desktop/mobile routes, planner keyboard semantics and 320 CSS-pixel reflow; this is not a full conformance claim |
| Initial bundle hygiene | `client/src/data/resourceSelection.ts`, `client/src/hooks/use-resource-selection.ts`, `vite.config.ts` | Heavy evidence/resource registries load with their lazy routes; production entry chunk reduced from ~614 KB to 354 KB with no chunk-size warning |
| Reviewer appointment control | `shared/quality-lab-expert-ownership.ts` | Workflow implemented; no real appointment recorded in source control |
| Three paid engagements with actuals, decisions, corrections, hours and margin | `shared/quality-lab-engagement.ts`, `shared/quality-lab-pilot-portfolio.ts` | Capture and Gate 1 logic implemented; real portfolio remains externally dependent |
| Controlled validation and publication permission | `shared/quality-lab-validation-cases.ts`, `shared/quality-lab-engagement.ts` | Internal learning and external publication permissions are separate; no permission is implied |
| Gate 2 release and change boundary | `shared/quality-lab-gate-2-release.ts` | Evidence eligibility and external release authorization are separate version-matched decisions |

### Remaining evidence dependencies

The repository cannot truthfully manufacture the following completion evidence. Until it is supplied through the controlled workflows, Gate 1 and Gate 2 must remain open:

1. current licensed compendial editions and qualified applicability review;
2. named expert appointments with competence and scope evidence;
3. three distinct paid engagements with controlled commercial, delivery, acceptance and estimate-to-actual records;
4. three accepted immutable validation cases for the released Domain Pack version;
5. explicit client permission before any real case is published;
6. cross-case rule disposition and documented release approval outside Atlas.

### Current repository verification — 2026-08-14

- `npm run validate` passed: 230 MDX files, 55 Quality v2 records, 49 canonical sources, 105/105 learning-path coverage and 305 internal targets.
- `npm test` passed: 80 files and 492 tests.
- Production build passed; the largest entry chunk is 354.10 KB (103.33 KB gzip) and the prior 500 KB warning is cleared.
- The full browser suite passed cleanly against a managed local server: 115 tests passed, including thirteen accessibility/keyboard/reflow checks, and two Stripe test-mode cases were intentionally skipped. Reduced-motion mode and a settled route-entry state keep contrast measurement out of transient fade animations.

## 1. Executive conclusion

Life Science Atlas already has an unusually broad and coherent product surface. The main constraint is no longer “missing pages.” It is the gap between a polished decision-intelligence interface and the amount of controlled, specialist-reviewed, real-world evidence behind it.

The next phase should therefore be **narrow → deepen → verify → calibrate**, not another horizontal content expansion.

### Current health

| Area | Health | Audit conclusion |
|---|---|---|
| Strategic alignment | Good | The flagship Quality Lab Compiler, freemium funnel, diagnostic and Blueprint offer follow the current source of truth. |
| Content breadth and discoverability | Good | 230 MDX items, 105 Academy lessons, 125 blog articles, 9 paths, 25 workflows, 33 tools and 31 toolkits provide extensive coverage. |
| Public content trust | At risk | Only 41/105 Academy lessons have Content Quality v2 records; 64 remain legacy. Most free Academy discovery content is still outside the reviewed trust corridor. Blog articles are presented as “Evidence guide” but do not display the quality notice. |
| Technical depth in the first wedge | Partial | Enumeration and specified-organism testing have executable method logic. Water, EM, raw materials, GPT and other workloads are still mainly aggregate coefficients. |
| Evidence governance | Blocked for controlled release | The microbiology pack is traceable, but 0/14 rules are controlled-review-ready; six of seven local evidence records remain open. |
| Model semantics | At risk | A verified unit/label inconsistency describes horizon growth as annual growth in sensitivity analysis. Several fixed capacity coefficients need explicit rationale or calibration. |
| Visual communication | Partial | The product UI is polished, but 230 MDX files contain no inline explanatory diagrams and editorial imagery is heavily reused. |
| Commercial proof | Blocked | No three paid calibration engagements, no accepted real-world validation cases, and no confirmed named expert role are recorded. |
| Engineering health | Good | Full validation passed; 79 test files and 480 tests passed. Release warnings are correctly preserved rather than hidden. |

### Top five decisions

1. **Freeze broad content expansion** until the first-wedge trust corridor clears release gates.
2. **Repair model semantics before marketing the outputs more strongly**, beginning with horizon growth vs annual growth.
3. **Upgrade the free discovery layer first**: it is currently where the evidence-backed promise is weakest.
4. **Convert aggregate microbiology workloads into application-level Method Graph records**, in a strict priority order.
5. **Make three paid engagements the center of the roadmap**, because they are required to calibrate assumptions, prove decision value and unlock credible case evidence.

## 2. Audit basis and limitations

This audit used:

- the strategic source of truth and master execution prompt;
- repository-wide inventory and targeted code review;
- existing content quality, decision package and coverage audits;
- automated content/path/link/tool metadata/type validation;
- the full unit/server test suite;
- desktop and 390 × 844 mobile walkthroughs of the core public-to-Blueprint journey;
- screenshots captured during this audit under `artifacts/full-project-audit-2026-08-13/`.

This is not a formal regulatory assessment, independent scientific peer review, penetration test or full WCAG conformance audit. Claims that require a qualified microbiology, engineering, finance or regulatory reviewer remain explicitly marked as such.

## 3. Inventory and quantitative findings

### Product surface

- Approximately 900 project files across content, client, shared logic, server and documentation.
- 230 MDX files: 105 Academy lessons and 125 blog articles.
- 70+ routed pages, including the Quality Lab Compiler, Method Navigator, Academy, workflows, tools, toolkits and commercial flows.
- 30 XLSX and 17 CSV deliverables/sources are present.
- 47/230 content items are mapped to decision packages, systems, stages, lifecycle stages and product destinations: 37 Academy items and 10 blog items.

### Content depth

| Collection | Items | Average words | Median words | Under 800 words | Inline images/diagrams |
|---|---:|---:|---:|---:|---:|
| Academy | 105 | 1,462 | 1,513 | 4 | 0 |
| Blog | 125 | 1,644 | 1,734 | 4 | 0 |

Direct reference signals:

- Academy: 20/105 files contain a URL; 14 contain at least three URLs; only six have an explicit references heading.
- Blog: 101/125 files contain a URL; 78 contain at least three URLs; 100 have a references heading.
- The absence of inline URLs is not automatically a defect where the central evidence registry is correctly surfaced. It becomes a trust defect when the page displays no source relationship or quality state.

Shortest items requiring editorial triage:

- `blog/qc-qa-interview-toughest-questions` — 381 words, no URL.
- `blog/biological-indicators-positive-control` — 388 words, no URL.
- `blog/mycoplasma-the-contaminant-your-filter-wont-catch` — 524 words, no URL.
- `academy/health-based-exposure-limits` — 534 words, no URL.
- `blog/career-blueprint-route-to-evidence` — 691 words, no URL.
- `academy/atlas-pro-monthly-quality-review` — 703 words, no URL.
- `academy/biopharma-potency-reference-and-orthogonal-characterization` — 778 words, no URL.
- `academy/decision-led-doe-and-multivariate-process-evidence` — 799 words, no URL.

### Content Quality Contract

- 41 official sources and 41 Academy lessons are registered in Content Quality v2.
- 64/105 Academy lessons remain `legacy/v1`, under review and score 0 by contract.
- 0 lessons have recorded SME review.
- 13 lessons have editorial review; 92 remain under review.
- 43/46 free Academy lessons are legacy. This is the most important content funnel defect because free content establishes initial trust.
- 21/59 Pro Academy lessons are legacy.
- Blog entries receive a legacy fallback in shared data, but `BlogPost` does not render `ContentQualityNotice` while labeling each post an **Evidence guide**. This makes the blog trust state less transparent than the Academy trust state.
- Current paid assets intentionally remain behind release gates. The Quality Lab Blueprint is scored 76/100 and still blocked by reviewer coverage, open evidence and missing estimate-to-actual calibration.

## 4. End-to-end product journey audit

### Step 1 — Landing promise and entry points: Healthy, with focus risk

The homepage clearly positions the Quality Lab Compiler as the flagship, shows the commercial ladder and discloses that outputs are planning evidence rather than approved designs. Mobile navigation is clear and the page retains a strong primary action.

![Homepage desktop audit](../artifacts/full-project-audit-2026-08-13/01-home-desktop.png)

![Homepage mobile audit](../artifacts/full-project-audit-2026-08-13/13-home-mobile.png)

Risks:

- The desktop hero exposes several competing actions and a large amount of proof language before the user has selected a job-to-be-done.
- The product is strongest when it leads with the Compiler; Academy and general resource breadth should remain supporting proof, not an equal strategic center.

Recommendation: keep one primary action per intent — build, inspect a sample, or request review — and measure their conversion separately.

### Step 2 — Quality Lab positioning: Clear, but one claim outruns evidence

The Quality Lab page clearly states concept status, vendor neutrality, scenario behavior and the handoff to expert review.

![Quality Lab landing audit](../artifacts/full-project-audit-2026-08-13/02-quality-lab-desktop.png)

Risk: the badge **“SME review-ready”** can be read as a maturity claim, while current source coverage records 0/14 controlled-review-ready rules and no appointed expert role. Prefer **“Structured for SME review”** until the controlled pack clears its gate.

### Step 3 — Planner entry and intake: Healthy

Guided, known-data, example and import modes are clearly separated. The product distinguishes user inputs from planning assumptions and preserves an example scenario.

![Planner start audit](../artifacts/full-project-audit-2026-08-13/03-planner-start-desktop.png)

Recommendation: preserve this structure; add project/source ownership and revision at intake so evidence identity begins before calculation.

### Step 4 — Live planning: Useful, but creates early numerical anchoring

The four-step planner makes scope, workload, capability and operating assumptions legible. Live outputs and evidence readiness are excellent transparency features.

![Example planner audit](../artifacts/full-project-audit-2026-08-13/04-planner-example-desktop.png)

![Demand planner audit](../artifacts/full-project-audit-2026-08-13/05-planner-demand-desktop.png)

![Capability planner audit](../artifacts/full-project-audit-2026-08-13/06-planner-capability-desktop.png)

![Operating planner audit](../artifacts/full-project-audit-2026-08-13/07-planner-operating-desktop.png)

Risks:

- Precise staffing, area and budget values appear while evidence readiness is still low. Users may anchor on them despite the concept labels.
- Aggregate workloads such as water, EM and GPT are visually presented beside Method Graph-derived workloads without a strong distinction in evidence maturity.
- Recommended percentages and workload presets are transparent planning assumptions, but they still need uncertainty ranges and provenance close to the control that uses them.

Recommendation: show an output maturity badge per result — **method-derived**, **aggregate concept**, **project input**, or **verified** — and render ranges before point estimates when evidence readiness is below an agreed threshold.

### Step 5 — Blueprint result: Strong trust architecture, dense mobile execution

The report separates completeness, evidence, blockers, assumptions and the decision brief. It is the strongest part of the product architecture.

![Blueprint result desktop audit](../artifacts/full-project-audit-2026-08-13/08-blueprint-result-desktop.png)

![Blueprint result mobile audit](../artifacts/full-project-audit-2026-08-13/14-blueprint-result-mobile.png)

Risks:

- On mobile, the fixed **Download decision brief** control sits directly over the “0 high operational risks” result card. The button ends exactly where the fixed navigation begins, so the content beneath it has no visible safe area.
- A zero high-risk result can coexist with several evidence blockers. Existing copy explains this, but the visual hierarchy can still make “0” feel more reassuring than the evidence state warrants.
- The report is comprehensive but cognitively dense; the executive decision, confidence and next evidence action should be the first mobile layer.

Recommendation: add bottom padding equal to both fixed controls, move download into the report action bar after the first screen, and place **Evidence blockers** beside or above operational risk severity.

### Step 6 — Expert review request: Commercially coherent, trust proof incomplete

The review page explains price, consent, included context and the distinction between a free snapshot and a full submission.

![Expert review audit](../artifacts/full-project-audit-2026-08-13/09-expert-review-desktop.png)

Risk: the offer is credible in structure, but it cannot yet show a named reviewer role, qualification evidence, service-level proof or accepted case evidence. Do not invent or imply this proof; make appointment and qualification a Gate 1 deliverable.

### Step 7 — Academy and article trust: Broad, but currently the weakest trust corridor

The Academy has excellent structural breadth, connected learning paths and system/lifecycle views.

![Academy audit](../artifacts/full-project-audit-2026-08-13/10-academy-desktop.png)

The article page is admirably honest about legacy status, but it also demonstrates the gap: a precise AQL article is visibly `legacy/v1`, under review, has 0 sources and a quality score of 0/100.

![Academy article trust audit](../artifacts/full-project-audit-2026-08-13/11-academy-article-desktop.png)

Recommendation: do not try to review all 230 items at once. Upgrade the 15–20 pages that directly support the Quality Lab buying and usage journey, then demote, archive or clearly label the rest until reviewed.

### Step 8 — Method Navigator: Honest boundaries, incomplete executable breadth

The Navigator shows source links, explicitly states that there are zero approved methods and communicates its current limits.

![Method Navigator audit](../artifacts/full-project-audit-2026-08-13/12-methods-desktop.png)

Risk: system and lifecycle views can make the same small microbiology record set feel broader than it is. Coverage should distinguish **record reused in another view** from **new method depth**.

Recommendation: expose a coverage matrix by application, method architecture, evidence status and controlled revision rather than relying on view counts.

## 5. Logic and model integrity audit

### Confirmed P0 semantic defect: growth horizon vs annual growth

- The planner correctly labels the input **Growth over horizon**.
- The core calculation applies it once: `1 + growthRatePercent / 100`.
- The sensitivity registry labels the same field **Annual demand growth**, uses `%/year`, and describes final-year dependence.

This is a material trust defect because a value such as 70% means either 1.7× over the full horizon or 1.7^years if interpreted as annual compound growth.

Required decision:

1. Keep the current formula and rename every downstream label/unit to **Growth over planning horizon (%)**; or
2. Change the model to a clearly defined annual CAGR formula and add migration/regression tests.

Acceptance criteria: one definition, one unit, one formula, one explanation and test coverage across planner, sensitivity analysis, export and saved projects.

### Capacity and cost assumptions requiring explicit calibration

The model is transparent but still contains important fixed coefficients:

- 46% of total workflow hours assigned to manipulation;
- BSC capacity uses six hours/shift internally even when `productiveHoursPerShift` is changed elsewhere;
- incubator, autoclave, air-sampler and colony-counter throughput assumptions;
- equipment cost bands and 35% space/support allowance;
- one reviewer per eight execution FTE;
- fixed workflow coefficients for raw materials, finished products, water, EM, sterility, endotoxin, bioburden and GPT.

These are not inherently wrong. They are **concept assumptions** that need owner, rationale, range, source, applicability and estimate-to-actual calibration. The BSC six-hour rule additionally needs a deliberate decision: bind it to the user input or label it as separate equipment productive time.

### Missing depth in the first microbiology wedge

Prioritize these additions in order:

1. **Method suitability/recovery:** inhibition, neutralization, filterability, recovery acceptance, product bracketing and evidence reuse.
2. **Media and growth promotion:** media family, lot/container, organism/control, inoculum preparation, incubation, release and reduced-testing boundaries.
3. **Water microbiology:** water grade, point criticality, route/timing, sampling, method architecture, trending and excursion workload.
4. **Environmental monitoring:** zone/activity/event/location/shift matrix; active air, passive air, surface and personnel methods; incubation/read schedule and excursions.
5. **Raw materials:** material/specification matrix, compendial applicability, sampling/testing frequency and supplier/skip-lot boundaries.
6. **Non-routine demand:** deviations, OOS/investigations, repeats, training/qualification, failed media, revalidation, shutdown/startup and cleaning/disinfection studies.
7. **Capacity mechanics:** batch cutoffs, queues/TAT, rack geometry, weekend/holiday coverage, downtime/qualification and backup capacity.
8. **People and supply:** skill matrix per shift, reviewer coverage, leave/training; MOQ, shelf life, quarantine/release, lead-time variance and alternate supply.
9. **CAPEX/OPEX and space:** regional quotations, freight/tax/install/qualification/service/utilities; adjacency, flows, HVAC, heat rejection, water, drainage, power/data and backup. These must remain qualified engineering inputs, not compliance approvals.

Sterility testing and advanced modalities should not lead this phase unless a qualified paid engagement changes the first-wedge priority.

## 6. Evidence and reliability audit

### What is strong

- All 14 microbiology rules are linked to catalog records; there are no missing or duplicate evidence links.
- Concept, open, controlled-context and project-input states are explicitly separated.
- The interface exposes assumptions, evidence gaps, dependencies, disclaimers and expert-review requirements.
- Official evidence sources are already cataloged and content release gates are enforced by validation.

### What blocks a trustable controlled release

- 0/14 microbiology rules are controlled-review-ready.
- Six of seven local evidence records remain open; only EU GMP Annex 1 is controlled context.
- USP 61/62 applicable editions remain to be confirmed.
- Site methods/specifications/SOPs, vendor evidence and project revision ownership are open.
- Concept benchmarks have not been replaced or calibrated against three engagements.
- No SME-reviewed content, accepted validation case, confirmed expert appointment or three paid estimate-to-actual records are present.
- Evidence is distributed across at least three registries/catalogs: the 41-source content catalog, seven-record Compiler pack and nine-source Navigator view. This creates version-drift risk even when each local structure validates.

Recommendation: create one canonical source identity/version layer and allow content, Compiler and Navigator records to reference it with context-specific applicability. A source should not be copied merely to appear in another surface.

## 7. Visual and accessibility audit

### Visual gaps

- None of the 230 MDX files contains an inline image or explanatory diagram.
- The editorial hero system reuses only a few generic laboratory photographs across many categories.
- Generic photos communicate atmosphere but do not explain requirement lineage, workflows, capacity, uncertainty or decisions.

Do not create 230 decorative images. Start with 12 high-value technical visuals across eight reusable archetypes:

1. requirement → method → resource lineage;
2. laboratory workflow swimlane;
3. sample queue and turnaround timeline;
4. incubator/room occupancy and capacity;
5. utilization and bottleneck chart;
6. evidence-status matrix;
7. scenario delta waterfall;
8. conceptual lab-zone adjacency/flow diagram with an engineering disclaimer.

Every quantitative visual should be generated from the actual model state. Hero photography should be unique only for strategic pillars, with source/license, alt text and no implied site-specific proof.

### Accessibility indicators

Observed strengths include a skip link, semantic landmarks, accessible control labels, pressed states, locked-step reasons and a dedicated mobile navigation pattern.

The repository now enforces an automated accessibility regression gate over ten strategic desktop/mobile routes. The same suite verifies visible keyboard focus, planner selection/locked-step semantics, keyboard activation and 320 CSS-pixel reflow. During implementation it identified and closed muted-text contrast, focus visibility, unlabeled file-input and scrollable-region focus defects.

Items that still require human or assistive-technology review before any conformance claim:

- status communication that does not rely on color alone;
- safe areas for fixed mobile actions;
- meaningful alt text for editorial and future explanatory images.

No full WCAG conformance claim should be made from this audit alone.

## 8. Engineering validation

Run on 2026-08-13:

- `npm run validate` — passed.
  - 230 MDX files valid.
  - 105/105 Academy lessons appear in exactly one learning path.
  - 305 internal targets checked with no broken literal link.
  - tool/workflow/toolkit metadata synchronized.
  - brand validation passed across 860 files.
  - type-check passed.
- `npm test -- --run` — 79 files passed, 480 tests passed.
- `npm run test:e2e` — 101 tests passed, 2 tests skipped, 0 failed.

Validation correctly reports release warnings rather than treating under-review assets as complete. This is a strength. One additional browser warning was found during the original walkthrough:

- React reported that `fetchPriority` was not recognized on a DOM `img` element in the runtime used for the audit. This has been resolved; the attribute no longer occurs in application source.

## 9. Prioritized development roadmap

### P0 — Trust and semantic integrity (1–2 weeks)

**Goal:** remove claims or model semantics that can mislead before acquiring more users.

1. Resolve horizon-growth semantics across formula, sensitivity, export, copy and tests.
2. Decide and document the BSC productive-time rule; audit all labels, units and fixed coefficients for the same class of mismatch.
3. Fix mobile Blueprint safe areas and move evidence blockers ahead of reassuring risk counts.
4. Change “SME review-ready” to “Structured for SME review” until controlled-review readiness exists.
5. Show content quality state on blog evidence guides or stop using the evidence label for legacy posts.
6. Define the first 15–20 trust-corridor pages and prevent legacy pages from being promoted into flagship journeys.

**Exit gate:** no known label/formula mismatch; no mobile control covers decision content; all flagship claims match recorded evidence maturity.

### P1 — First-wedge depth and evidence unification (2–5 weeks)

**Goal:** make the non-sterile microbiology corridor genuinely inspectable.

1. Upgrade trust-corridor content to Quality v2 with exact source version, applicability, limitations and claim-to-source relationships.
2. Confirm USP 61/62 editions and close source-version ownership.
3. Unify source identity across content, Compiler and Navigator.
4. Implement Method Graph records for suitability/recovery, GPT/media, water, EM and raw materials in that order.
5. Replace aggregate coefficients with application-level BOM/capacity rules, uncertainty ranges and evidence maturity labels where the new graph exists.
6. Produce the first 12 technical visuals from real model state.

**Exit gate:** the chosen corridor has no unexplained legacy content, every modeled result declares derivation and uncertainty, and source changes propagate consistently.

### P2 — Gate 1 commercial calibration (4–8 weeks; external dependency)

**Goal:** prove that buyers pay, use the output and correct the model.

**Acquisition execution:** use the current `docs/SOFT_LAUNCH.md` for target-account preparation, qualification, bounded outreach copy and the existing commercial-status evidence discipline. It supersedes the former Academy/Pro launch campaign.

**Field execution:** follow `docs/QUALITY_LAB_GATE_1_GATE_2_FIELD_RUNBOOK.md` to create, reference and reconcile the required external records without placing confidential or licensed evidence in source control.

1. Appoint and document qualified reviewer role(s), qualifications, scope and escalation boundaries.
2. Sell and deliver three paid diagnostics/Blueprint engagements.
3. Record estimate vs actual, buyer decision, corrections, delivery hours, margin and evidence closures.
4. Add controlled acceptance records and change history to each engagement.
5. Publish one anonymized/redacted case only with explicit permission; do not fabricate a synthetic success story.

**Exit gate:** three paid records with estimate-to-actual learning, named review ownership and at least one permissioned proof artifact.

### P3 — Gate 2 verified micro pack (after P2)

**Goal:** release a calibrated, versioned first-wedge pack.

**Field execution:** continue with the validation-case and Gate 2 release sections of `docs/QUALITY_LAB_GATE_1_GATE_2_FIELD_RUNBOOK.md`; the Atlas assessment is a working control, while appointment, case acceptance and release authorization remain external decisions.

1. Calibrate all high-impact coefficients and confidence ranges against the three cases.
2. Close all 14 rule evidence records to controlled-review-ready or explicitly remove/defer unsupported rules.
3. Obtain three accepted validation cases for the released scope.
4. Version and release the Domain Pack with controlled change management.
5. Only then deepen water/EM coverage or consider the next domain wedge.

**Exit gate:** controlled evidence coverage, accepted cases and a released pack with explicit boundaries.

## 10. Backlog triage rules

Use these rules to prevent the roadmap from drifting back into volume production:

- A new page is P0/P1 only if it closes a decision, evidence or conversion gap in the first-wedge journey.
- A new model coefficient requires owner, unit, source/rationale, range, applicability and validation plan.
- A new visual must improve comprehension of a decision, workflow, evidence state or uncertainty; decorative stock alone is not a roadmap item.
- A source count is not a quality metric unless the source is versioned, applicable and connected to a claim/rule.
- “Traceable” must not be presented as “controlled,” and “structured for review” must not be presented as “reviewed.”
- Real-world calibration and buyer learning outrank additional catalogs, routes or modalities.

## 11. Recommended next sprint

The most valuable immediate sprint is **P0 Trust & Semantic Integrity**:

1. create a single model glossary for growth, workload, capacity, FTE, evidence maturity and risk;
2. fix the growth mismatch and add regression tests;
3. audit every planner/sensitivity/export label against the glossary;
4. repair the mobile result safe area;
5. add blog quality disclosure and remove/qualify the SME maturity claim;
6. select and publish the 15–20-item trust-corridor backlog with owners and exit criteria.

This sprint improves trust without pretending that external scientific review or commercial validation has already occurred.
