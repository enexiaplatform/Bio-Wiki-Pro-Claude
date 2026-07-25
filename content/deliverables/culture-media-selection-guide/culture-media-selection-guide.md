# Culture Media Selection Guide

A working guide for selecting, preparing, qualifying, and controlling
microbiological culture media in a pharmaceutical QC laboratory — from
compendial media mapping through Growth Promotion Testing (GPT) to release,
storage, and audit defense.

> Educational tool and working template. It does not replace your approved
> SOPs, the current editions of the compendia (USP/NF, Ph. Eur., JP), your
> site quality system, or QA review. Verify every statement against the
> compendial edition and method validation in force at your site before use.
> Nothing in this pack is validated, regulator-approved, or a substitute for
> professional regulatory advice. Example values are clearly labeled as
> examples — fill in your own site-specific limits where blanks are provided.

---

## 1. Purpose and Regulatory Basis

### 1.1 Why media control matters

Every microbiological result you report — TAMC, TYMC, specified-organism
tests, sterility, environmental monitoring, water counts — is only as good as
the medium that grew (or failed to grow) the organism. A medium that is
overheated, pH-drifted, expired, or never growth-promoted can generate false
negatives that no amount of investigation can undo. Inspectors know this:
media control is one of the first systems they pull.

### 1.2 Governing documents

Know which framework applies to each test you run, and keep current editions
accessible at the bench:

- USP <61> Microbiological Examination of Nonsterile Products: Microbial
  Enumeration Tests — media, GPT strains, and acceptance for TAMC/TYMC.
- USP <62> Microbiological Examination of Nonsterile Products: Tests for
  Specified Microorganisms — selective/differential media and their growth
  promotion, inhibitory, and indicative properties.
- USP <71> Sterility Tests — Fluid Thioglycollate Medium (FTM) and
  Soybean-Casein Digest Medium (SCD/TSB), fertility and sterility checks.
- USP <1117> Microbiological Best Laboratory Practices — media preparation,
  QC, storage, and laboratory practice expectations (informational chapter).
- USP <1111> Microbiological Examination of Nonsterile Products: Acceptance
  Criteria — links media performance to release decisions.
- Ph. Eur. 2.6.12 (Microbial Enumeration), 2.6.13 (Specified Microorganisms),
  and 2.6.1 (Sterility) — harmonized counterparts; strain and acceptance
  details are largely aligned with USP.
- ISO 11133 Microbiology of the food chain — Preparation, production, storage
  and performance testing of culture media — the most detailed practical
  standard for media QC; widely used as best practice in pharma labs.
- FDA expectations (21 CFR 211.113(b), 211.160(b), 211.194; Guidance on
  Investigating OOS Results, 2006/2022) — scientifically sound laboratory
  controls, complete records, and documented media suitability.
- EU GMP Annex 1 (2022) — for sterile manufacturing: media used in EM,
  aseptic process simulation (media fills), and sterility testing must be
  growth-promoted and traceable.

### 1.3 The three questions every medium must answer

Before a lot of media is used to generate reportable data, you must be able
to show, with records:

1. Identity and quality on receipt — correct medium, correct supplier, intact
   packaging, Certificate of Analysis (CoA) reviewed.
2. Fitness for purpose — it supports growth of the compendial challenge
   strains (growth promotion), suppresses what it should suppress
   (inhibitory properties), and produces the expected diagnostic reaction
   (indicative properties), where applicable.
3. Stability in use — it was prepared, sterilized, stored, and used within
   validated conditions and assigned expiry.

---

## 2. Media Selection by Test

### 2.1 Selection logic

Start from the compendial chapter or validated method for the test — never
from habit. The chapter names the medium (or describes its required
properties). Your decision tree:

1. What test am I running (enumeration, specified organism, sterility, water,
   EM, disinfectant efficacy)?
2. Which medium does the governing chapter/method name?
3. Is it non-selective (recover everything) or selective/differential
   (recover the target, suppress the rest)?
4. Does the product have antimicrobial activity? If yes, do I need
   neutralizers (e.g. lecithin and polysorbate 80) or dilution/membrane
   filtration to neutralize it — demonstrated by method suitability?
5. Dehydrated, ready-to-use, or prepared in-house from components — and what
   QC does that choice trigger (Section 3)?

### 2.2 Core media map

| Medium | Test / purpose | Type | Incubation |
|---|---|---|---|
| TSA / SCDA | TAMC, EM, GPT | Non-selective agar | 30-35 C |
| TSB / SCD | Sterility (aerobic/fungi), enrichment | Non-selective broth | 20-25 C (sterility) |
| SDA | TYMC, fungi | Non-selective (low pH) | 20-25 C |
| FTM | Sterility (aerobic + anaerobic) | Non-selective broth | 30-35 C |
| MacConkey agar/broth | Bile-tolerant gram-neg., E. coli | Selective/differential | 30-35 C (see note) |
| Mannitol Salt Agar | Staphylococcus aureus | Selective/differential | 30-35 C |
| Cetrimide Agar | Pseudomonas aeruginosa | Selective/differential | 30-35 C |
| XLD Agar | Salmonella | Selective/differential | 30-35 C |
| RV enrichment broth | Salmonella enrichment | Selective broth | 30-35 C |
| CLED Agar | Urine counts (no swarming) | Differential, non-inhibitory | 35-37 C |
| R2A Agar | Water (heterotrophic counts) | Low-nutrient agar | 20-28 C, extended |

Note: in the USP <62> test for E. coli, MacConkey broth is incubated at
42-44 C (24-48 h) to select for E. coli before subculture to MacConkey agar
at 30-35 C. Follow the chapter for the specific test, not the general
incubation on the bottle.

### 2.3 Per-test selection details

- TAMC (USP <61> / Ph. Eur. 2.6.12): Soybean-Casein Digest Agar (TSA/SCDA)
  or Soybean-Casein Digest Broth, 30-35 C, bacteria 3-5 days.
- TYMC: Sabouraud Dextrose Agar (SDA), 20-25 C, 5-7 days.
- Sterility (USP <71> / Ph. Eur. 2.6.1): FTM at 30-35 C (recovers aerobic
  and anaerobic bacteria) and SCD (TSB) at 20-25 C (recovers fungi and
  aerobic bacteria); both incubated for not less than 14 days. Use FTM
  within its shelf life and store protected from light; do not use FTM if
  more than the upper one-third of the medium has turned pink (oxidized) —
  reheat once only, per the chapter.
- Bile-tolerant gram-negative bacteria (USP <62>): Enterobacteria Enrichment
  Broth Mossel (pre-enrichment), then Violet Red Bile Glucose Agar (VRBGA);
  MacConkey broth/agar for the E. coli test specifically.
- S. aureus: Mannitol Salt Agar — mannitol fermentation (yellow) with
  selective high salt; indicative reaction plus coagulase/identification per
  your method.
- P. aeruginosa: Cetrimide Agar — cetrimide selects; growth with greenish
  fluorescence is indicative; oxidase/identification per your method.
- Salmonella: Rappaport Vassiliadis Salmonella Enrichment Broth (selective
  enrichment at 30-35 C, 18-24 h), then XLD Agar — typical Salmonella gives
  red colonies with black centers; confirmation per the chapter.
- CLED: cystine-lactose-electrolyte-deficient agar; non-inhibitory, prevents
  Proteus swarming — used for urine and some non-compendial counts where
  discrete colonies matter.
- R2A: low-nutrient medium for heterotrophic plate counts of purified water
  and water for injection systems (see USP <1231> for water testing
  strategy); longer incubation at lower temperature recovers stressed,
  slow-growing water organisms that TSA misses.
- Antimicrobial products and disinfectant efficacy: add neutralizers —
  lecithin and polysorbate 80 (Tween 80) are the classic combination for
  quaternary ammonium compounds, phenolics, and parabens; other neutralizers
  (sodium thiosulfate, histidine, thioglycollate) per the agent. Neutralizer
  effectiveness must be demonstrated in method suitability / disinfectant
  efficacy studies (USP <51>, <1072>), not assumed.

### 2.4 Media selection decision record (template)

- Test / SOP number: ______________________
- Governing chapter and edition: ______________________
- Named medium (or justified equivalent): ______________________
- Non-selective / selective / differential: ______________________
- Neutralizers required (product antimicrobial activity?): ______________________
- Method suitability / neutralization study reference: ______________________
- Approved by (QA): Name ____________ Signature ____________ Date ____________

---

## 3. Dehydrated vs Ready-to-Use Media

### 3.1 Dehydrated media (prepared in-house)

- Lower unit cost, long unopened shelf life, flexible formats.
- QC burden shifts to you: weighing, water quality, dissolution, pH
  adjustment, sterilization cycle control, pouring, and plate QC are all your
  validated processes — and all auditable.
- Every prepared batch is a new "lot" requiring GPT before use.
- Risks: weighing errors, incorrect water, overheating, pH drift, uneven
  pouring, contamination during pouring.

### 3.2 Ready-to-use (RTU) media

- Manufacturer controls prep and sterilization; you receive plates/broths
  with a CoA and typically a GPT certificate per lot.
- QC burden shifts to receipt control: CoA review, transport temperature
  verification, integrity inspection, and your own receipt-level GPT (see
  Section 5.6 — frequency and what can be justified by supplier data).
- Risks: transport temperature excursions, dehydration in transit, damaged
  packaging, irradiation damage (triple-wrapped irradiated plates for
  isolators), shorter remaining shelf life on receipt.
- Cost is higher per unit; total cost of ownership is often lower once labor,
  autoclave time, and failed batches are counted.

### 3.3 Choosing between them

- High volume + autoclave capacity + skilled staff: dehydrated is defensible.
- Isolator/RABS EM, sterility suite, low volume, or limited autoclave access:
  RTU (preferably irradiated, triple-wrapped for barrier systems) is usually
  the better-controlled choice.
- Document the rationale. An inspector may ask why you prepare in-house if
  your failure rate is high, or why you buy RTU without receipt GPT.

---

## 4. Media Preparation Controls

### 4.1 Workflow

1. Confirm the dehydrated medium is in date, container intact, stored per
   label (usually cool, dry, tightly closed; hygroscopic media spoil fast
   once opened — record the date opened).
2. Use purified water of defined quality for preparation (site specification:
   ______________________; typical example: Purified Water meeting USP/Ph.
   Eur., freshly drawn). Record the water source and date.
3. Weigh per the manufacturer's instructions on a calibrated balance; record
   actual weight vs target.
4. Dissolve completely (heat with agitation where required — do not boil
   unless instructed).
5. Measure pH before sterilization and adjust only if the manufacturer's
   instructions allow; record.
6. Dispense into final containers (broths) or hold for sterilization (agars).
7. Sterilize by validated moist heat — typical cycle 121 C for 15 minutes,
   but use the validated cycle for the medium and load; record cycle
   parameters (time at temperature, autoclave printout reference).
8. Measure and record pH after sterilization at 25 C (pH specifications are
   quoted at 25 C). Acceptance: within the manufacturer's specification,
   typically ±0.2 pH units of the target value (ISO 11133 / USP <1117>
   expectation).
9. Cool agar to 45-50 C before pouring (or before adding heat-labile
   supplements). Pouring hotter causes condensation and cracks supplements;
   pouring cooler gives lumpy, uneven plates.
10. Pour under controlled conditions (e.g. within an LAF/biosafety cabinet),
    flame or disinfect per SOP, and label with medium, batch/lot, prep date,
    and expiry.
11. Hold plates to set, inspect (Section 6), and quarantine until GPT passes.

### 4.2 Sterilization — the overheating problem

- Media are sterilized for sterility, but every extra minute at temperature
  degrades nutrients, darkens the medium (Maillard reactions between sugars
  and peptones), destroys selective agents, and reduces recovery of stressed
  organisms.
- The F0 concept expresses lethality as equivalent minutes at 121.1 C. Media
  cycles are usually validated by demonstrated sterility plus retained growth
  promotion — not by maximizing F0. Validate the minimum cycle that reliably
  sterilizes the actual load (volume and container size change heat
  penetration — validate worst case).
- Never re-autoclave a medium unless the manufacturer explicitly allows it.
  Never autoclave media containing heat-labile supplements (add aseptically
  after cooling to 45-50 C).
- Selective agents to watch: bile salts, brilliant green, cetrimide, and
  antibiotics all degrade with excess heat — a failed inhibitory-properties
  test often traces back to overheating.

### 4.3 Expiry assignment

- Dehydrated powder: manufacturer's expiry (unopened); assign an in-use
  expiry after opening (site limit: ______________________; typical example:
  12 months after opening or manufacturer expiry, whichever is first).
- Prepared plates/broths: assign expiry from a validated storage study or
  documented literature/manufacturer basis, per storage condition (site
  limits: plates at 2-8 C: __________; broths at 2-8 C: __________; typical
  industry examples: 2-4 weeks for poured plates in sealed bags, longer for
  shrink-wrapped or RTU formats — examples only, validate your own).
- Expiry must be supported by GPT (or equivalent performance data) on the
  oldest stored batch — expiry without data is a finding.

### 4.4 Preparation record (template)

- Medium / manufacturer / dehydrated lot: ______________________
- Batch number assigned (in-house): ______________________
- Water source / lot: ______________________
- Weight: target __________ g; actual __________ g; balance ID __________
- Volume prepared: __________ mL; container size: __________
- pH before sterilization: __________ (25 C)
- Sterilization cycle: __________ C / __________ min; autoclave ID/cycle no.:
  __________
- pH after sterilization: __________ (25 C); within spec? Y / N
- Pouring temperature: __________ C; number of plates/bottles: __________
- Prepared by: __________ Date: __________
- Checked by: __________ Date: __________

---

## 5. Growth Promotion Testing (GPT)

### 5.1 Principle

GPT demonstrates that each lot/batch of medium can recover a low-level
inoculum (not more than 100 cfu) of the compendial challenge strains. It is
mandatory before the medium is used to generate reportable results (USP
<61>/<62>/<71>, Ph. Eur. 2.6.x, ISO 11133).

### 5.2 Compendial test strains

Use the current culture-collection references in force (ATCC numbers below;
equivalent national collection strains are acceptable if traceable). Maintain
cultures per the compendial passage limits (typically not more than 5
passages from the reference stock).

- Staphylococcus aureus ATCC 6538 — TSA/TSB, SDA support, sterility media
- Pseudomonas aeruginosa ATCC 9027 — TSA/TSB, Cetrimide, sterility media
- Bacillus subtilis ATCC 6633 — TSA/TSB, FTM, sterility media
- Candida albicans ATCC 10231 — SDA, TSA/TSB, sterility media
- Aspergillus brasiliensis ATCC 16404 — SDA, TSA/TSB (fungi), sterility media
- Escherichia coli ATCC 8739 — MacConkey / bile-tolerant gram-negative media
- Salmonella enterica (Typhimurium) ATCC 14028 — RV broth and XLD
- Clostridium sporogenes ATCC 19404 (or 11437) — FTM (anaerobic challenge)

### 5.3 Strain-to-medium assignment

| Medium | Growth promotion | Inhibitory | Indicative |
|---|---|---|---|
| TSA / TSB | Sa, Pa, Bs, Ca, Ab | — | — |
| SDA | Ca, Ab (also Sa per method) | — | — |
| FTM | Sa, Pa, Bs, Cs | — | — |
| MacConkey agar | Ec, Pa | Sa (no growth) | Ec: pink colonies |
| Mannitol Salt | Sa | Ec (no growth) | Sa: yellow zone |
| Cetrimide | Pa | Ec (no growth) | Pa: greenish |
| XLD | Salmonella | Ec (no growth) | red, black center |
| RV broth | Salmonella | Sa (no growth) | subculture to XLD |

Sa = S. aureus, Pa = P. aeruginosa, Bs = B. subtilis, Ca = C. albicans,
Ab = A. brasiliensis, Ec = E. coli, Cs = C. sporogenes.

### 5.4 Procedure

1. Prepare inoculum suspensions of each strain; plate-count the suspension to
   confirm the challenge level is not more than 100 cfu per plate/tube (and
   record the actual cfu used — this is also your denominator for recovery).
2. Inoculate the test medium with ≤100 cfu of each required strain; inoculate
   a previously approved batch (or the reference/control medium) in parallel.
3. Incubate: bacteria not more than 3 days, fungi not more than 5 days, at
   the temperature specified for the medium/test (Section 2.2).
4. Acceptance — compendial wording (USP <61>/<62>, harmonized):
   - Liquid media: growth must be comparable to that obtained with a
     previously tested and approved batch of medium.
   - Solid media: the growth obtained must not differ by a factor greater
     than 2 from the calculated value for a standardized inoculum (i.e.
     recovery within roughly 50-200% — often recorded as 0.5-2.0x vs control
     plate).
   - Inhibitory properties: inoculate with at least 100 cfu of the
     non-target strain and incubate for not less than the specified period —
     no growth.
   - Indicative properties: colonies must show the characteristic appearance
     described for the medium.
5. Record everything in the GPT log (see the accompanying
   media-gpt-log.csv) and release or reject the lot.

### 5.5 GPT for sterility-test media (USP <71>)

- Each lot of FTM and SCD/TSB used in the sterility test must pass both:
  - Sterility check: incubate a portion of the uninoculated medium (per your
    SOP; e.g. representative containers from the lot) — no growth.
  - Fertility (growth promotion) check: challenge each lot with the USP <71>
    panel — S. aureus, P. aeruginosa, B. subtilis (both media), C. sporogenes
    (FTM), C. albicans and A. brasiliensis (TSB) at ≤100 cfu; clearly visible
    growth within not more than 3 days (bacteria) or 5 days (fungi).
- For media used with products having antimicrobial activity, suitability of
  the sterility test method (neutralization/elimination) must additionally be
  demonstrated — that is method validation, separate from lot GPT.

### 5.6 GPT frequency

- In-house prepared media: every prepared batch, before use.
- Dehydrated media (new manufacturer lot, same prepared batch QC): every lot
  received; re-verify if storage or prep conditions change.
- Ready-to-use media: every lot/shipment received. Reliance on the supplier's
  GPT certificate with periodic confirmatory testing is a risk-based option
  some sites adopt under ISO 11133-style justification — if you do this,
  document the rationale, the supplier qualification, the confirmatory
  frequency, and get QA approval. Never skip GPT on media used for sterility
  tests or media fills without a documented, QA-approved justification.
- Quarantine every lot until GPT passes. Label clearly: QUARANTINED —
  GPT PENDING.

### 5.7 GPT worksheet (template)

- Medium / lot / batch: ______________________
- Previous approved batch (control): ______________________
- Strain / inoculum cfu (actual): __________ / __________ cfu
- Incubation: __________ C / __________ days
- Recovery on test medium: __________ cfu; on control: __________ cfu
- Ratio (test/control): __________ (acceptance: 0.5-2.0)
- Inhibitory strain / result (no growth?): __________ / __________
- Indicative reaction observed?: Y / N / NA
- [ ] GPT passed — lot released for use
- [ ] GPT failed — lot rejected, quarantined, and investigated (Section 9)
- Performed by: __________ Date: __________
- Reviewed/QA: Name __________ Signature __________ Date __________

---

## 6. Media Sterility Check and Plate QC

Before release and at each use point, inspect plates and broths:

- [ ] Cracks, shrinking, or pulling away from the plate edge (dehydration)
- [ ] Bubbles in the agar (poured too hot / agitation)
- [ ] Uneven thickness or lumpy surface (poured too cold)
- [ ] Condensation on the lid (excess — dry before use per SOP; do not use
      plates with free water dripping)
- [ ] Contamination — any colony or turbidity on uninoculated medium
- [ ] Correct color and clarity for the medium (e.g. FTM: clear, no pink in
      more than the upper third; if oxidized beyond that, discard or reheat
      once only per USP <71>)
- [ ] Label legible: medium, lot/batch, prep or receipt date, expiry,
      storage condition
- [ ] Packaging integrity for RTU (wraps sealed, no moisture between layers)

Sterility check frequency: for each prepared batch, incubate representative
uninoculated plates/tubes (site rule: __________; typical example: 3-5% of
the batch or a minimum of 2 units) at the medium's incubation conditions —
no growth. For sterility-test media, see Section 5.5. Any growth = batch
failure; investigate before rejecting the batch or the results it supported.

---

## 7. Equivalence Studies: Ready-to-Use Media and Supplier Changes

### 7.1 When equivalence is required

- Changing supplier or manufacturer of the same medium.
- Switching between dehydrated and RTU formats of the same medium.
- Substituting a different medium for one named in a compendial chapter (the
  chapter allows equivalents, but the burden of proof is yours).
- Significant formulation, sterilization, or packaging change notified by the
  supplier.

### 7.2 What an equivalence study contains

1. Change control record describing the change and rationale.
2. Side-by-side GPT: old vs new medium, all compendial strains for that
   medium, in triplicate where practical; recovery ratios (new vs old) within
   0.5-2.0, and inhibitory/indicative properties demonstrated.
3. Parallel testing on representative routine samples or EM plates (same
   samples, both media) — compare counts and recovery; define acceptance
   before you start (example: no statistically/clinically meaningful
   difference in recovery; state your criterion).
4. Review of supplier CoA, formulation statement, and sterilization
   validation summary for RTU.
5. QA approval before the new medium is released for reportable testing.

### 7.3 Equivalence study sign-off (template)

- Change control no.: __________
- Old medium (supplier/lot): ______________________
- New medium (supplier/lot): ______________________
- GPT comparison reference (worksheet/log entry): __________
- Parallel sample comparison reference: __________
- Conclusion: [ ] Equivalent — approved  [ ] Not equivalent — rejected
- QA: Name __________ Signature __________ Date __________

---

## 8. Storage and Transport Validation

### 8.1 Storage

- Store every medium at its labeled condition: dehydrated media cool, dry,
  tightly closed; prepared plates typically 2-8 C, protected from light and
  dehydration (sealed bags); broths per manufacturer; FTM protected from
  light at room temperature unless the label says otherwise.
- Bring refrigerated plates to room temperature before use (condensation and
  cold-shock both hurt recovery); do not warm in an incubator.
- First in, first out. A monthly expiry sweep is a cheap defense against a
  painful finding.

### 8.2 Transport (RTU media)

- Specify transport conditions in the purchase specification (temperature
  range, maximum transit time, packaging).
- On receipt: record the temperature indicator/data logger result, transit
  time, and packaging condition before accepting the shipment.
- Define what happens on excursion: quarantine, QA disposition, possible
  receipt-level GPT before release — do not use media from a compromised
  shipment on assumption.
- If you transport media between your own sites, qualify the route
  (temperature mapping of the shipper, worst-season consideration) the same
  way you would qualify any cold-chain transfer.

### 8.3 Receipt checklist (template)

- [ ] Correct medium and quantity; within shelf life on receipt (minimum
      remaining shelf life per site rule: __________)
- [ ] CoA received and reviewed (including supplier GPT results for RTU)
- [ ] Transport temperature within specification: recorded value __________
- [ ] Packaging intact; plates free of cracks, bubbles, dehydration
- [ ] Lot logged and quarantined pending receipt GPT (if applicable)
- Received by: __________ Date: __________

---

## 9. Common Failures — Causes and Fixes

### 9.1 GPT failure (poor or no growth)

- Most common causes: overheated medium (check autoclave cycle record),
  expired or improperly stored dehydrated powder (check date opened, caking),
  pH out of specification, inoculum error (wrong dilution, dead suspension —
  confirm with the plate count of the suspension), wrong incubation
  temperature, or a genuinely defective lot.
- Response: quarantine the lot, repeat GPT once with fresh inoculum and a
  confirmed control batch. If it fails again, reject the lot, raise a
  deviation, and assess impact: did any reportable results use this lot? If
  yes, escalate per your OOS/deviation procedure — the results may be
  invalid.

### 9.2 Inhibitory/indicative failure (selective media)

- Non-target organism grows (inhibitory failure): selective agents degraded
  — overheating is the prime suspect; also check powder age and hydration.
- Target grows but no diagnostic reaction (indicative failure): often pH
  drift or degraded indicator (e.g. neutral red in MacConkey); verify pH
  after sterilization and powder storage.

### 9.3 pH drift

- Check the meter first (calibration, buffers in date), then the water, then
  the weighing, then the sterilization cycle (overheating shifts pH). Adjust
  before sterilization only if the manufacturer permits; if post-sterilization
  pH is out of spec, discard the batch — do not re-adjust sterile media.

### 9.4 Overheating (darkened medium, poor recovery)

- Reduce load size or split volumes; verify the validated cycle was used;
  check for blocked drain/steam traps causing slow exhaust. Validate worst-
  case container volume — a 2 L bottle heats much slower than 100 mL.

### 9.5 Desiccation / dehydration of plates

- Causes: storage too long, unsealed stacks, low-humidity incubators,
  over-drying in LAF airflow.
- Fixes: seal plates in bags, shorten assigned expiry to match reality,
  validate incubator humidity for long incubations (e.g. sterility media
  fills, 14-day sterility tests), and weigh plates in a storage study if you
  need data to defend the expiry.

### 9.6 Contamination of prepared media

- Review aseptic pouring technique, LAF/cabinet maintenance and airflow,
  sanitizer contact times, and personnel monitoring. Trend sterility-check
  failures by operator and by pouring session — patterns find the cause
  faster than retesting.

---

## 10. What an Inspector Will Ask

Be ready to produce, within minutes:

- Show me your media preparation SOP and the last three batch records.
- How do you know this lot of TSA grows what it should? (GPT records,
  strains, inoculum levels, acceptance criteria — and how you control
  culture passages.)
- How do you assign expiry to prepared plates? Where is the supporting data?
- Show me a failed GPT. What did you do? (If you have never had one, expect
  skepticism — your log should show real failures handled correctly.)
- How do you qualify a new media supplier or a supplier change?
- For RTU media: what do you verify on receipt? What happened the last time
  a shipment arrived warm?
- How is the media lot linked to the test results it supported? (Traceability
  both directions: lot → tests, and result → media lot.)
- Where is FTM stored, and how do you know it is not oxidized?
- Who releases media for use, and under what authority? (QA release, not
  analyst self-release, is the strong answer.)

Records that answer these questions live in the GPT log, preparation records,
receipt checklists, and equivalence files — keep them complete, attributable,
and contemporaneous (ALCOA+).

---

## 11. Worked Example: Receiving and Qualifying a New Lot of TSA

Fictional example — for illustration only.

Scenario: Your lab receives lot TS-4471 of TSA (dehydrated, 500 g) from
MediChem Labs. The previous lot TS-4402 is your approved control batch.

### Step 1 — Receipt

- [ ] CoA reviewed: conforms to specification, pH 7.3 ±0.2 at 25 C — Y
- [ ] Container intact, desiccant present, powder free-flowing — Y
- [ ] Logged in media register; labeled QUARANTINED — GPT PENDING
- [ ] Receipt record signed: J. Rivera, 2026-02-10

### Step 2 — Preparation (batch TSA-2026-007)

- Water: PW system, point PW-04, sampled same day
- Weight: 40.0 g per 1000 mL target; actual 40.02 g; balance BAL-07
- pH before sterilization: 7.28 (25 C)
- Sterilization: 121 C, 15 min, autoclave AC-2, cycle 1142
- pH after sterilization: 7.31 (25 C) — within 7.3 ±0.2
- Poured at 47 C; 120 plates; appearance: clear, amber, no bubbles/cracks
- Sterility check: 4 uninoculated plates incubated 3 days at 30-35 C — no
  growth

### Step 3 — GPT results

| Strain | Inoculum (cfu) | Test recovery | Control recovery | Pass? |
|---|---|---|---|---|
| S. aureus 6538 | 62 | 58 | 60 | Y |
| P. aeruginosa 9027 | 74 | 70 | 72 | Y |
| B. subtilis 6633 | 55 | 52 | 54 | Y |
| C. albicans 10231 | 48 | 45 | 47 | Y |
| A. brasiliensis 16404 | 81 | 30 | 79 | N |

Ratios (test/control) for the first four strains are within 0.5-2.0. A.
brasiliensis recovered at 0.38x — below acceptance.

### Step 4 — Failure handling

- Lot quarantined; deviation DEV-2026-014 raised.
- Inoculum rechecked (suspension count 81 cfu — valid); control batch fine;
  second aliquot of A. brasiliensis suspension prepared fresh.
- Repeat GPT of the suspect strain: 78 cfu inoculum, recovery 76 (0.97x) —
  passes. Root cause assigned to a degraded first spore suspension (older
  than SOP limit), not to the medium. Corrective action: tighten spore
  suspension in-use period in SOP MB-118.
- Because no reportable testing had used the lot, no impact assessment on
  released data was needed.
- Lot TS-4471 / batch TSA-2026-007 released for use; expiry assigned per
  validated storage limit.

### Step 5 — Release sign-off

- [ ] All GPT results within acceptance (including repeat with rationale)
- [ ] Sterility check passed
- [ ] Plate appearance QC passed
- [ ] Records complete in media-gpt-log.csv and batch record
- Performed by: J. Rivera Date: 2026-02-13
- Released by (QA): Name __________ Signature __________ Date __________

---

## 12. References

- USP <61>, <62>, <71> Microbiological examination and sterility tests
  (current edition)
- USP <1111> Acceptance criteria for nonsterile products
- USP <1117> Microbiological best laboratory practices
- USP <1231> Water for pharmaceutical purposes
- Ph. Eur. 2.6.1, 2.6.12, 2.6.13 (current edition)
- ISO 11133 Preparation, production, storage and performance testing of
  culture media
- 21 CFR Part 211 (cGMP for finished pharmaceuticals)
- FDA Guidance: Investigating Out-of-Specification (OOS) Test Results
  (2006; updated 2022)
- EU GMP Annex 1: Manufacture of Sterile Medicinal Products (2022)

---

## Revision and Ownership

- Document owner: ______________________
- Reviewed by (QA): ______________________
- Approved by: Name __________ Signature __________ Date __________
- Version: __________ Effective date: __________
- Next review due: __________
- Revision history:

| Version | Date | Change | Author |
|---|---|---|---|
| 1.0 | __________ | Initial issue | __________ |
| | | | |
