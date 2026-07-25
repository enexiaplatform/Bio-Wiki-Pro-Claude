# Lab Water Selection Checklist

A working guide to choosing, justifying, specifying, and defending the right
water grade for every laboratory task — and to building the monitoring and
documentation that make that choice stand up in an audit.

> IMPORTANT — READ FIRST: This is an educational working template, not a
> regulatory submission, a validated protocol, or legal/QA advice. Compendial
> requirements change between editions and supplements. Before you rely on
> anything here, verify it against the current editions of USP–NF, Ph. Eur.,
> and any applicable guidance (EU GMP Annex 1, WHO TRS), your approved site
> SOPs, your registered specifications, and your validated water system state.
> Nothing in this pack replaces review and approval by your Quality Unit. All
> site-specific values shown in examples are illustrative only.

## How to use this guide

1. Read Section 1 to anchor yourself in the regulatory basis.
2. Use Sections 2–3 to select and document a grade for each task (decision
   framework, task mapping, fill-in justification record).
3. Use Sections 4–6 when you specify, validate, or monitor a water system.
4. Use Sections 7–8 when something goes wrong or when you trend and review.
5. Use Section 9 to prepare for inspection and Section 10 as a model for your
   own decision records.
6. Cross-check numeric specs against the companion CSV,
   `water-grade-quick-reference.csv`.

---

## 1. Purpose and regulatory basis

### 1.1 Purpose

Water is the highest-volume raw material in any pharmaceutical laboratory. An
unjustified or uncontrolled water choice is a recurring source of OOS results,
contaminated media, failed endotoxin tests, and inspection findings. This
guide gives you a defensible, documented answer to three questions:

- Which water grade do you use for each task?
- Why is that grade appropriate (regulatory basis + risk rationale)?
- How do you control, monitor, and review the water you use?

### 1.2 Scope

- QC microbiology and analytical chemistry laboratories in GMP environments.
- Purified Water (PW), Highly Purified Water (HPW), Water for Injections (WFI),
  sterile waters, potable/feed water, and laboratory reagent/analytical water.
- Grade selection, system design basics, validation, monitoring, excursions,
  trending, and inspection readiness.
- Out of scope: detailed engineering qualification (IQ/OQ execution),
  municipal water treatment, and method validation. Cite your site's
  engineering and validation SOPs for those.

### 1.3 Governing documents you must know

- USP <1231> Water for Pharmaceutical Purposes — the key informational
  chapter: grades, system design, sampling, microbial method rationale,
  validation, and control strategy.
- USP <645> Water Conductivity — the three-stage conductivity test for bulk
  PW and WFI.
- USP <643> Total Organic Carbon — TOC test with system suitability
  (sucrose / 1,4-benzoquinone).
- USP <85> Bacterial Endotoxins Test — gel-clot and photometric BET methods;
  defines Water for BET.
- USP <61>/<62> and <1111> — microbial enumeration context when water results
  feed product testing.
- Ph. Eur. monographs: Purified Water (0008), Water for Injections (0169),
  Highly Purified Water (1927), and the associated general chapters
  (2.2.38 conductivity, 2.2.44 TOC, 2.6.14 endotoxins).
- EU GMP Annex 1 (2022) — expectations for water used in sterile manufacture,
  including membrane-based WFI provisions.
- FDA Guide to Inspections of High Purity Water Systems (1993) — still the
  reference inspectors use for the phased validation approach and loop design
  questions.
- WHO Technical Report Series guidance on water for pharmaceutical use
  (originally TRS 970, Annex 2; check the current revision).
- ICH Q7 (APIs), Q9 (quality risk management), Q10 (pharmaceutical quality
  system) — the risk-management frame for grade selection and excursions.
- ASTM D1193 and CLSI C3 — reagent water types for analytical work.
- PDA technical reports (e.g., TR 69 on bioburden/biofilm management) for
  industry practice on microbial control of water systems.

---

## 2. Water grades decision framework

### 2.1 The grades at a glance

| Grade | Compendial basis | Microbial (typical) | Endotoxin | Production |
|---|---|---|---|---|
| Potable | EPA / WHO drinking water | N/A (feed only) | N/A | Municipal |
| PW (USP) | USP monograph | 100 cfu/mL (action, guidance) | None set | RO/EDI etc. |
| PW (Ph. Eur.) | Ph. Eur. 0008 | 100 cfu/mL | None set | RO/EDI etc. |
| HPW | Ph. Eur. 1927 | 10 cfu/100 mL | <0.25 IU/mL | RO + UF |
| WFI | USP / Ph. Eur. 0169 | 10 cfu/100 mL | <0.25 IU(EU)/mL | Distillation or equiv. |

Microbial values above are the commonly cited action levels (USP <1231>
guidance and Ph. Eur. monograph acceptance criteria). Confirm against the
current compendial edition and your registered specification.

### 2.2 Potable (drinking) water

- The required minimum feed for any pharmaceutical water system; itself must
  comply with drinking-water regulations (e.g., EU Directive 98/83/EC, US EPA
  NPDWR, or national equivalent).
- Typical lab uses: feed to the purification plant, initial glassware rinse
  (never final rinse), cooling/heating circuits with no product or sample
  contact, environmental cleaning of non-critical areas.
- Never use potable water where it directly contacts samples, media, reagents,
  or product-contact surfaces after the final rinse.

### 2.3 Purified Water (PW)

- Produced from potable water, typically by pretreatment + reverse osmosis
  (RO) + deionization/EDI, stored and distributed in a sanitized loop.
- Chemical control: conductivity per USP <645> (three-stage test — see 6.2)
  and TOC per USP <643> (limit 0.50 mg/L, i.e., 500 ppb carbon).
- USP vs Ph. Eur. difference to state in your justification: Ph. Eur. permits
  either the instrumental route (conductivity + TOC/oxidisable substances) or,
  in defined cases, the wet-chemistry route (nitrates not more than 0.2 ppm,
  heavy metals not more than 0.1 ppm Pb, oxidisable substances). The USP route
  is conductivity + TOC only.
- Microbial action level commonly cited: 100 cfu/mL (USP <1231> guidance; Ph.
  Eur. monograph acceptance criterion for microbial contamination).
- No compendial endotoxin limit, but sites frequently set an internal
  specification where PW feeds critical uses — label it as an internal spec,
  not a compendial one.
- Typical lab uses: culture media preparation, reagent and buffer preparation,
  microbiology dilution blanks (before sterilization), glassware final rinse,
  environmental monitoring diluent/neutralizer preparation, feed to WFI still
  or membrane plant.

### 2.4 Water for Injections (WFI)

- The highest-purity bulk water. Endotoxin limit: not more than 0.25 IU/mL
  (Ph. Eur.) / 0.25 USP-EU/mL (USP <85>); microbial action level commonly
  cited: 10 cfu/100 mL; conductivity and TOC as for PW.
- Production: USP historically required distillation (or equivalent per
  current edition — check); Ph. Eur. monograph 0169 was revised in 2017 to
  permit membrane-based production (e.g., RO coupled with appropriate
  techniques) proven equivalent to distillation. EU GMP Annex 1 (2022)
  accepts non-distillation WFI provided equivalence is demonstrated and the
  controls in Annex 1 are met. State your production route in every WFI
  justification — inspectors will ask.
- Typical lab uses: final rinse of product-contact and depyrogenated items,
  preparation of endotoxin-test reagent dilutions (see 2.6), media/reagents
  for sterile-product testing where specified, feed for sterile waters.

### 2.5 Highly Purified Water (HPW)

- Ph. Eur. monograph 1927. Same endotoxin (<0.25 IU/mL) and microbial
  (10 cfu/100 mL) expectations as WFI, produced by membrane-based sequences
  (e.g., double-pass RO + ultrafiltration) without the WFI designation.
- Typical niche: where WFI-quality microbial/endotoxin control is needed but
  WFI is not mandated (e.g., some biotech or API steps). Confirm acceptability
  with your registration file before substituting HPW for WFI.

### 2.6 Sterile waters

- Sterile Water for Injections and Sterile Purified Water are packaged,
  sterilized presentations (terminal sterilization or aseptic fill), each with
  its own monograph — do not treat them as "bulk water in a sterile bottle."
- Water for BET (endotoxin-free water): water with endotoxin below the limit
  required for the bacterial endotoxins test (USP <85>), typically prepared
  from WFI or depyrogenated water and verified non-interfering. Use it for
  reconstituting LAL reagent, diluting samples for BET, and rinsing
  depyrogenated labware.
- Shelf life after opening is a site decision — justify it with data (see
  hold-time discussion in 6.6).

### 2.7 Analytical / reagent water

- USP general notices require "water" in analytical procedures to meet the
  compendial article's needs; for trace and instrumental work (HPLC, LC-MS,
  ICP), labs typically use reagent water per ASTM D1193 Type I (resistivity up
  to 18.2 MOhm-cm at 25 °C, very low TOC) from a point-of-use polishing
  system fed by PW.
- Key risk: point-of-use polishers are mini water systems — cartridges have
  capacity limits and can shed ions or organics when exhausted. Monitor
  resistivity/TOC at the outlet and replace cartridges on schedule or on
  indication, whichever comes first.
- Do not use analytical polisher output as a substitute for PW in
  microbiology (uncontrolled bioburden, no monitoring program).

### 2.8 Grade-selection checklist (work this list for every use)

- [ ] Task and its product/sample contact identified (direct, indirect, none).
- [ ] Dosage form / route of the associated product considered (sterile
      parenteral, sterile non-parenteral, non-sterile, API, analytical only).
- [ ] Candidate grade selected from 2.2–2.7 with compendial citation.
- [ ] Risk rationale recorded: what could this water contaminate, and with
      what (ions, organics, microbes, endotoxin)?
- [ ] Monitoring available for that grade at that point of use confirmed
      (Section 6) — if you cannot monitor it, you cannot justify it.
- [ ] Rationale documented in the Water Use Justification Record (3.3) and
      approved by QA.

---

## 3. Lab-use mapping: which water for which task

### 3.1 Typical mapping (starting point — justify each line for your site)

- Culture media preparation: PW (dehydrated media dissolved, then sterilized
  per media SOP). Cross-reference the Culture Media Selection Guide pack.
- Reagent and buffer preparation (micro and wet chemistry): PW.
- Glassware washing: potable or PW for early rinses; PW for the final rinse.
  Glassware to be depyrogenated: WFI final rinse before the depyrogenation
  cycle.
- Endotoxin testing (USP <85>): Water for BET for reagent reconstitution,
  sample dilution, and final rinse of depyrogenated labware.
- HPLC / LC-MS / trace analysis: analytical reagent water (ASTM Type I from a
  validated polisher) or commercial HPLC-grade water; document which.
- Microbiology dilution blanks (peptone saline, buffered diluents): PW,
  subsequently sterilized by validated cycle.
- Environmental monitoring: neutralizer and rinse-fluid preparation with PW,
  then sterilize; cross-reference the Environmental Monitoring Checklist
  pack.
- Water activity, dissolution media: per the compendial method — commonly PW.
- Cleaning of non-product-contact lab surfaces: potable acceptable; define in
  the cleaning SOP.

### 3.2 Decision logic (work top to bottom; stop at the first match)

1. Does the water contact a sterile parenteral product, its contact surfaces
   after final rinse, or an endotoxin-critical test? -> WFI (or Water for BET
   for BET work).
2. Does the water contact samples or reagents in a quantitative instrumental
   method (HPLC/MS/ICP)? -> validated analytical reagent water; specify
   resistivity and TOC at point of use.
3. Does the water enter media, diluents, buffers, or final glassware rinse for
   non-sterile work? -> PW.
4. Is there no product/sample/reagent contact (feed water, early rinse,
   utility)? -> potable water, with controls defined.
5. Anything that does not fit 1–4 -> raise a QA risk assessment before use;
   do not improvise a grade.

### 3.3 Water Use Justification Record (fill in — one per task)

1. Task / process step: ______________________
2. Laboratory and room: ______________________
3. Associated product / test and dosage form: ______________________
4. Contact type (direct / indirect / none): ______________________
5. Contamination risk if wrong grade used: ______________________
6. Selected grade: ______________________
7. Compendial / regulatory basis (cite chapter/monograph and edition):
   ______________________
8. Point of use (loop, valve ID, polisher ID): ______________________
9. Specification applied (conductivity / TOC / microbial / endotoxin):
   ______________________
10. Monitoring covering this point (test, frequency, SOP ref.):
    ______________________
11. Hold time / flushing requirement at this point: ______________________
12. Alternatives considered and rejected (why): ______________________
13. Prepared by (Name / Signature / Date): ______________________
14. QA approval (Name / Signature / Date): ______________________

---

## 4. Water system design overview

You do not need to design the plant, but you must be able to explain yours in
an inspection. A typical PW/WFI train:

1. Pretreatment: multimedia filtration, water softening, activated carbon
   (dechlorination — residual chlorine destroys RO membranes), sometimes
   bisulfite dosing. Pretreatment is the most neglected source of bioburden;
   carbon beds and softeners are microbial incubators — sanitize/regenerate on
   schedule.
2. Primary purification: reverse osmosis, then electrodeionization (EDI) or
   mixed-bed deionization.
3. Polishing: UV (254 nm) for microbial/ozone control, final filtration;
   for WFI: distillation (multi-effect or vapor compression) or a membrane
   sequence proven equivalent (Ph. Eur./Annex 1 route).
4. Storage and distribution loop: continuously recirculating. Options: hot
   loops (maintained roughly 65–80 °C — self-sanitizing), ambient loops with
   periodic hot-water or chemical sanitization, and ozonated storage with 254
   nm UV destruct of ozone ahead of points of use (verify ozone removal).

Design elements inspectors probe (know yours):

- Materials: 316L stainless steel (orbital-welded, passivated; electropolished
  internal finish typical per ASME BPE) or hygienic polymers (PVDF, PP, PFA).
  No brass, no black iron downstream of purification.
- Dead legs: eliminate or minimize. Legacy rule of thumb was length <= 6
  pipe diameters; ASME BPE targets <= 2D. Know your site's standard and your
  worst dead leg.
- Slope: lines sloped (commonly ~1%) to fully drainable low points.
- Flow: turbulent recirculation (commonly > 1 m/s return velocity) to deter
  biofilm; know your loop's validated velocity.
- Sampling valves: sanitary design, flushable, located to represent loop
  conditions; a dedicated, standardized flushing/sampling technique.
- Instrumentation: online conductivity and temperature at return (and often
  TOC), with offline lab confirmation per <645>/<643>.
- Documentation: current P&ID, point-of-use list with IDs, sanitization SOP
  and log, passivation records, change control history.

---

## 5. Validation approach: Phases 1–3

Industry practice (derived from the FDA 1993 high-purity water inspection
guide and USP <1231>) uses three phases. Durations below are the commonly
applied ranges — follow your validation master plan.

### 5.1 Phase 1 — intensive characterization (typically 2–4 weeks)

- Purpose: prove the system as built produces compliant water and establish
  operating ranges; no routine lab use of the water yet (or use under
  quarantine rules per your SOP).
- Sampling: every point of use, plus pretreatment, post-RO, storage, and loop
  supply/return — sampled daily.
- Tests: conductivity, TOC, microbial (and endotoxin for WFI systems); record
  operating parameters (flows, temperatures, pressures, sanitization cycles).
- Exit criteria: pre-approved — e.g., all results within specification for
  the full phase, operating parameters stable, sampling technique validated.

### 5.2 Phase 2 — refined operation (typically 2–4 weeks)

- Purpose: demonstrate consistent control under the intended routine
  operating and sanitization schedule.
- Sampling: daily at a rotating subset of points so every point of use is
  covered within the phase; same tests as Phase 1.
- Exit criteria: water may be released for routine use after QA approval;
  provisional alert/action levels drafted from Phase 1–2 data.

### 5.3 Phase 3 — routine seasonal monitoring (typically 1 year)

- Purpose: confirm control across seasonal feedwater variation (temperature,
  microbial load, organics) under the routine monitoring program.
- Sampling: per the routine program (Section 6).
- Exit criteria: annual review confirms control; finalize alert/action levels
  from the accumulated dataset; close the validation report.

### 5.4 Validation fill-in summary

- System ID / loop: ______________________
- Phase 1 dates / daily points sampled: ______________________
- Phase 2 dates / rotation logic: ______________________
- Phase 3 start / planned review month: ______________________
- Provisional alert / action levels and data source: ______________________
- Validation report reference / QA approval date: ______________________

---

## 6. Routine monitoring program

### 6.1 What to monitor

- Chemical: conductivity (USP <645>) and TOC (USP <643>) for PW/HPW/WFI.
- Microbial: all grades in loops; method and media per 6.3.
- Endotoxin (USP <85>): WFI, HPW, Water for BET, and any grade with an
  internal endotoxin spec.
- Physical/operational: loop temperature, flow/velocity, pressure, ozone
  residual where applicable, sanitization completion.

### 6.2 Conductivity — the three-stage logic (USP <645>)

1. Stage 1 (inline or immediate offline, non-temperature-compensated):
   compare the reading against the temperature-dependent limit table in
   <645> — e.g., the limit at 25 °C is 1.3 µS/cm. Pass -> done.
2. Stage 2 (offline, controlled 25 ± 1 °C): equilibrate the sample, measure;
   limit 2.1 µS/cm. Pass -> done.
3. Stage 3 (offline, pH-adjusted with saturated KCl): measure pH and
   conductivity; compare against the pH-dependent limit table in the chapter
   (limits are on the order of 4–6 µS/cm). This stage diagnoses CO2/ammonia
   contributions — use it to understand failures, not to hide them.

State in your SOP which stages you run routinely and who is authorized to
progress to the next stage.

### 6.3 Microbial method decisions (justify them in your SOP)

- Membrane filtration vs pour plate: membrane filtration is preferred —
  you can filter larger volumes (mandatory-scale for WFI: 100 mL) and you
  avoid heat stress from molten agar. Pour plate is limited to ~1 mL and
  misses low-count excursions by statistics alone.
- Medium: R2A is the standard choice — a low-nutrient medium that recovers
  stressed, slow-growing water organisms (oligotrophs) that rich media like
  TSA under-recover or suppress.
- Incubation: Ph. Eur. monographs specify R2A at 30–35 °C for at least 5
  days. A lower temperature (20–25 °C) for 5–7 days often recovers more
  environmental water flora; whichever you choose, fix it in the SOP, keep it
  constant for trending, and have recovery data behind it.
- Sample handling: analyze promptly — common practice is within about 2 hours
  of sampling, or refrigerate (2–8 °C) and test within a defined, validated
  window (many sites use 24 h). Validate your hold time with recovery data.

### 6.4 Frequency (common industry practice — adapt per risk and Phase 3 data)

- PW/WFI loops: sample at least one point of use every working day on a
  rotation that covers every point (commonly within 1–2 weeks); storage and
  loop return more frequently; online conductivity/TOC continuous.
- WFI: endotoxin on a defined rotation (commonly weekly per point as a
  starting position — justify from data).
- Polisher/analytical water: outlet resistivity/TOC each day of use.
- Potable feed: periodic testing against drinking-water specs at a defined
  interval.

### 6.5 Alert vs action levels

- Action level: a result above it requires documented investigation and
  impact assessment (Section 7). Never set it above the compendial/registered
  limit; it is typically set at or below it.
- Alert level: an early-warning level below action — a result above it
  triggers heightened attention and documented review, not necessarily a
  full investigation.
- Setting them: derive from your Phase 3 dataset (e.g., percentile- or
  standard-deviation-based on the microbial data of each point or the loop),
  reviewed at least annually. "We copied 50/100 cfu/mL from a textbook" is
  not a defensible answer.
- Example (illustrative only): a PW loop with 12 months of data, 95th
  percentile 12 cfu/mL, might carry alert = 20 cfu/mL and action = 100 cfu/mL.

### 6.6 Monitoring plan fill-in (one per system)

- System / loop ID: ______________________
- Points of use (list IDs and locations): ______________________
- Rotation schedule (attach or reference): ______________________
- Tests, methods, SOP references: ______________________
- Alert / action levels per test and their data basis: ______________________
- Sample transport and hold-time rule: ______________________
- Responsible roles (sampling / testing / review): ______________________

---

## 7. Excursion handling

### 7.1 Classify first

- Above action level (or above compendial limit): treat as OOS-equivalent for
  a utility — open a formal investigation per your deviation/OOS SOP.
  Cross-reference the OOS Investigation Template pack for investigation
  structure and root-cause logic.
- Above alert but below action: documented review — check sampling technique,
  recent sanitization, loop changes, and trend position; increase sampling
  vigilance; record rationale for any decision not to escalate.
- Out-of-trend (within limits but unusual, e.g., steady climb over 2 weeks):
  investigate before it becomes an excursion; trend breaks are biofilm
  announcements.

### 7.2 Immediate actions (action-level excursion)

1. Quarantine the point of use (tag it; stop use for critical work per SOP).
2. Verify the result: check sample handling, incubation, media suitability,
   and analyst technique; resample the same point plus adjacent points and
   loop supply/return under standardized flushing. A resample never erases
   the original result — report both.
3. Assess impact: list every batch, test, media lot, and rinse that used
   water from the affected point (and, per risk, the loop) since the last
   acceptable result. Assess each with QC/QA — this is the part inspectors
   read first.
4. Sanitize and restore per 7.3; confirm effectiveness with defined
   post-sanitization sampling (e.g., consecutive acceptable results over a
   defined period) before releasing the point for use.
5. Close with root cause, CAPA, and effectiveness check dates. Recurring
   excursions at the same point = design or sanitization problem, not bad
   luck.

### 7.3 Sanitization options

- Thermal: circulate hot water (commonly 65–80 °C for a validated contact
  time — many sites use 30–60 min at the coldest point) or steam where the
  design allows. Validate the coldest point reaches target.
- Ozone: maintain validated residual in storage with UV destruct ahead of
  points of use; verify ozone removal before drawing water for use.
- Chemical: peracetic acid / hydrogen peroxide blends for loops; chlorine
  species mainly for pretreatment. Rinse to a validated endpoint
  (conductivity/TOC baseline) and document it.

### 7.4 Excursion record fill-in

- Excursion ID / date / point of use: ______________________
- Result vs alert / action / compendial limit: ______________________
- Classification (alert / action / OOT): ______________________
- Resample results (original + resamples, all reported): ______________________
- Impact assessment (batches/tests reviewed, conclusion): ______________________
- Sanitization performed (method, parameters, date): ______________________
- Post-sanitization confirmation results: ______________________
- Root cause and CAPA reference: ______________________
- QA disposition (Name / Signature / Date): ______________________

---

## 8. Trending and annual review

- Trend every test by point of use: control charts or tabulated trend
  reports for microbial counts, conductivity, TOC, and endotoxin (WFI).
  Point-level trending finds localized problems (valves, dead legs) that
  loop-average data hides.
- Review frequency: monthly or quarterly trend review by QC/engineering;
  defined out-of-trend triggers (e.g., consecutive rises, repeated same-
  organism recovery, results clustering near alert).
- Organism identification: define in your SOP when you identify isolates
  (e.g., all action-level excursions, recurring alert-level flora) — the
  organism tells you the source (Gram-negative water flora = biofilm;
  skin flora = sampling technique).
- Annual (or periodic) review of the water system: data summary vs
  alert/action levels, excursion history, sanitization frequency adequacy,
  change control and maintenance history, recalibration status, and a formal
  decision — continue / tighten levels / requalify. Feed this into the site
  product quality review where water touches product.
- Requalification triggers: major modification, extended shutdown,
  persistent excursions, relocation of points of use.

---

## 9. Inspector expectations and common findings

What an inspector will ask you (FDA, EMA/MHRA, or WHO):

- Show me your water system's validation summary and current P&ID.
- Which water do you use for this test, and why? (Have your Section 3
  justification records ready.)
- How were your alert and action levels set, and when were they last updated?
- Show me the last three excursions and the impact assessments.
- Where are your dead legs, what is your loop velocity, and how do you
  sanitize?
- Show me sampling technique training for the person who draws water samples.

Recurring real-world findings to self-audit against:

- Dead legs and non-draining sections never addressed after system changes.
- No TOC monitoring (or uncalibrated TOC analyzer) where the compendial
  route requires it.
- Alert/action levels set at validation and never revisited — levels that
  do not reflect current system performance are worse than none.
- Sanitization performed but not documented, or documented without
  effectiveness data.
- Non-standardized sampling: variable flush times, unsterile technique,
  samples held too long before plating.
- Excursions closed without impact assessment on tests/product, or resamples
  used to overwrite original results.
- Point-of-use polishers with no capacity tracking — exhausted cartridges
  silently degrading "analytical" water.

---

## 10. Worked example: selecting water for a new QC microbiology lab

Fictional illustration — not a recommendation for your site.

Situation: "Meridian Biologics" (fictional) is commissioning a QC
microbiology lab supporting a non-sterile oral-solid-dose site plus one
sterile fill line. The lab will prepare media and diluents, run microbial
limit tests (USP <61>/<62>), perform environmental monitoring, and run BET
for the sterile line's WFI system. Available systems: a validated PW loop
(RO/EDI, ozonated storage, ambient loop with weekly hot sanitization), a WFI
loop (distillation, hot at ~70 °C) in the sterile suite, and no lab polisher
yet.

Decisions recorded (one justification record per line, per Section 3.3):

1. Media preparation -> PW from lab point of use POU-M01. Basis: USP <1231>
   and media SOP; non-sterile product contact, subsequent sterilization of
   media. Rejected: WFI (no endotoxin driver for non-sterile media;
   unjustified cost and draw on the sterile loop).
2. Dilution blanks and EM neutralizers -> PW, sterilized by validated cycle.
   Same basis as (1). For EM in the Grade A/B rooms, fluids purchased sterile
   or prepared from WFI and sterilized — flagged for QA risk assessment
   because they enter the aseptic zone (Annex 1 consideration).
3. BET reagent reconstitution and sample dilution -> Water for BET,
   purchased sterile, endotoxin-certified, opened-container hold time 8 h
   (example) set by site data. Basis: USP <85>.
4. Final rinse of glassware for depyrogenation -> WFI from POU-W02 in the
   sterile suite, before the 250 °C depyrogenation tunnel cycle.
5. HPLC (assay of the oral product) -> new point-of-use polisher purchased;
   specified as ASTM Type I, outlet resistivity >= 18 MOhm-cm and TOC
   monitored daily; cartridge change on indication or 6 months (example),
   whichever first. Rejected: PW direct (ionic load risks baseline noise and
   column damage).
6. Glassware early rinses -> potable, then PW final rinse.

Outcome: six justification records signed by QC and QA; monitoring plan
updated to add POU-M01 to the daily PW rotation; polisher added to the
equipment log with a daily resistivity/TOC check. When the site later added a
second sterile line, the EM fluid decision was revisited and moved to
purchased sterile fluids — recorded as a revision of record (2).

---

## 11. Revision and ownership

- Document owner (role): ______________________
- Site SOP(s) this pack was adapted into: ______________________
- Compendial editions verified against (USP / Ph. Eur. and dates):
  ______________________
- Review frequency: ______________________
- Next scheduled review: ______________________
- Revision history (version / date / change / approver):
  ______________________

> Reminder: this pack is a template. It becomes a controlled document only
> when your Quality Unit approves your site-adapted version. Never represent
> the unmodified pack as a validated or regulator-approved procedure.
