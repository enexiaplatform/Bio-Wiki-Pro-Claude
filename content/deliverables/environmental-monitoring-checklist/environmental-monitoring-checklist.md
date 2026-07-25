# Environmental Monitoring Program Guide

A working template for designing, running, and defending a risk-based
environmental monitoring (EM) program for classified cleanrooms and
controlled environments — aligned to EU GMP Annex 1 (2022), FDA Guidance
for Industry: Sterile Drug Products Produced by Aseptic Processing (2004),
ISO 14644-1/-2, ISO 14698, and USP <1116>.

---

> IMPORTANT — Educational tool, not a validated procedure. This guide is a
> template and training aid. Verify every limit, method, and frequency
> against your approved SOPs, your site contamination control strategy
> (CCS), current compendial editions, and your quality system. Limits that
> depend on your product, process, or facility must be set and approved by
> your site QA. Nothing here substitutes for QA approval, a validated
> method, or regulatory advice.

---

## 1. Purpose and regulatory basis

Environmental monitoring is the routine measurement of viable (microbial)
and non-viable (particulate) contamination in cleanrooms, on surfaces,
and on personnel. It does not guarantee sterility — it demonstrates that
your controlled environment stays in a state of control between
qualifications.

### Why you monitor

- Detect loss of control early, before it reaches the product.
- Provide objective evidence for batch release decisions in aseptic
  processing.
- Feed the contamination control strategy (CCS) with trend data.
- Satisfy inspectors that the environment matches the registered process.

### Governing frameworks

- **EU GMP Annex 1 (2022)** — requires a documented CCS; EM is one output
  of it. Section 9 covers environmental and process monitoring, including
  the grade limits below and the expectation that Grade A/B action-level
  recoveries are identified.
- **FDA Aseptic Processing Guidance (2004)** — expects a written EM
  program covering air, surfaces, and personnel, with alert/action levels
  and investigation of excursions.
- **ISO 14644-1 and -2** — cleanroom *classification* by airborne particle
  concentration. Classification is not routine monitoring: qualification
  establishes the class (e.g. ISO 5 at rest/in operation); routine EM then
  demonstrates ongoing control. Do not confuse the two.
- **ISO 14698-1/-2** — biocontamination control: principles for evaluating
  and controlling airborne biocontamination, risk assessment for sampling
  plans, and validation of sampling methods.
- **USP <1116>** — microbiological control and monitoring of aseptic
  processing environments. Notably, it frames EM results as "contamination
  recovery rates" (fraction of samples showing any growth) rather than
  pass/fail cfu limits — useful context when designing trending.

### Annex 1 microbial limits (action levels)

The table below reproduces the Annex 1 (2022) maximum permitted microbial
action limits. These are regulatory limits — your site's alert and action
levels must be set at or below these values, normally tighter, based on
your own data.

| Grade | Air cfu/m3 | Settle 90mm/4h | Contact 55mm | Glove print |
|-------|-----------|---------------|--------------|-------------|
| A | <1 | <1 | <1 | <1 |
| B | 10 | 5 | 5 | 5 |
| C | 100 | 50 | 25 | - |
| D | 200 | 100 | 50 | - |

Notes on the table:

- Settle plates: 90 mm diameter, exposed up to 4 hours.
- Contact plates: 55 mm diameter.
- Glove print: 5 fingers, both hands.
- Annex 1 expects monitoring during operations ("in operation"); at-rest
  monitoring supports qualification and room recovery checks. For Grade A,
  monitoring should cover the full duration of critical processing,
  including equipment assembly.
- Grade A: any confirmed growth should trigger an investigation — the
  expectation is essentially zero recovery.

---

## 2. Program design: risk-based site selection

Sites must be chosen by documented risk assessment — never by convenience.
An inspector's first question is always: "Why do you sample *here*?"

### Risk assessment inputs

- **Proximity to exposed product.** Sites nearest open containers, fill
  needles, stopper bowls, and sterile connections carry the highest risk.
- **Airflow visualization studies (smoke studies).** Use them to place
  probes and plates where air does or does not protect the critical zone
  — including turbulence and dead spots.
- **Personnel flow and interventions.** Map operator movements; sample
  where hands and gowns go most often, and where interventions occur.
- **Historical data.** Persistent low-level recoveries, previous
  excursions, and seasonal patterns justify added or moved sites.
- **Cleaning and sanitization blind spots** — hard-to-reach surfaces,
  equipment joints, behind panels, door handles, pass-throughs.

### Method selection

- **Active (volumetric) air sampling.** Impaction samplers (e.g. sieve or
  slit-to-agar) physically verify sampled volume and are widely accepted;
  centrifugal samplers are convenient but validate efficiency for the
  particle sizes of interest. Whichever you use: calibrate the flow rate,
  validate the sampling volume against the expected grade limit (a 1 m3
  sample in Grade A can in principle detect 1 cfu/m3), and locate the
  sampler so it does not itself disturb unidirectional airflow.
- **Settle (passive) plates.** 90 mm plates exposed at the point of
  greatest risk. Validate the maximum exposure time (Annex 1 allows up to
  4 h) — prove the medium does not desiccate or lose growth-promotion
  capability over the exposure, using growth promotion testing on plates
  exposed for the full duration.
- **Contact plates (RODAC, 55 mm).** For flat, regular surfaces. The
  medium must contain neutralizers (e.g. lecithin, polysorbate 80,
  histidine, thiosulfate as appropriate) to inactivate residual
  disinfectants; validate neutralization against your actual sanitizers.
- **Swabs.** For irregular surfaces, crevices, and equipment interiors
  where a contact plate cannot land. Use a defined wetting/moistening
  fluid and a defined elution and plating method.
- **Personnel monitoring.** Glove prints (fingertips) and gown contact
  plates (chest, forearm — defined sites). Required after each aseptic
  operation session for Grade A/B operators. Sample gloves at defined
  points (e.g. after critical interventions, at session end) and again
  after sanitization steps if your procedure calls for it.

---

## 3. Frequency guidance

Annex 1 sets expectations (continuous for Grade A viable monitoring
during critical processing; risk-based frequencies elsewhere). The table
below is an **example schedule** — a common industry pattern, not a
regulatory requirement. Justify your actual frequencies in the CCS.

| Grade | Active air | Settle plate | Contact/swab | Personnel |
|-------|-----------|--------------|--------------|-----------|
| A | Continuous / each session | Each session (≤4h) | Each session | Each session |
| B | Daily in operation | Each session | Daily | Each session |
| C | Weekly | Weekly | Weekly | - |
| D | Weekly–monthly | Monthly | Weekly–monthly | - |

Additional frequency rules of thumb:

- Sample at-rest before operations and in operation during processing;
  at-rest results support room recovery assessment after shutdowns,
  maintenance, or cleaning failures.
- Increase frequency after excursions, construction, HVAC work, or
  seasonal changes; decrease only with documented trend justification.
- Non-viable particle monitoring usually runs more frequently (continuous
  or per shift for A/B) — keep it in the same register so trends can be
  correlated.

---

## 4. Alert and action levels

### Setting levels

- **Action levels** for grades A–D start from the Annex 1 table above
  (Section 1). You may set tighter action levels — never looser.
- **Alert levels** are internal early warnings, derived from your
  qualification and historical data, not from the compendia. Common
  approaches:
  - Fixed fraction of the action level (e.g. 50 % of action level).
  - Statistical: mean + 2 standard deviations of historical in-control
    data, or the 95th percentile of the recovery-rate distribution.
- Re-evaluate levels at least annually and after significant changes.
  Never raise a level just because excursions keep occurring — that is a
  classic 483 observation.

### Excursion response workflow

1. **Confirm the result.** Check for lab/sample-handling error (plate
   damage, mislabelling, incubation anomaly). Confirm before escalating,
   but do not delay beyond your defined timeline (example: open the
   investigation within 24–48 h of result readout).
2. **Open an excursion investigation.** Record the excursion against the
   register (see the CSV in this pack) and start the template below.
3. **Assess product impact.** Which batches were in process during the
   excursion window? Where was the site relative to exposed product? This
   decision must involve QA and be documented.
4. **Identify the organism(s).** Per the policy in Section 5.
5. **Investigate likely causes.** See checklist below.
6. **Define CAPA and effectiveness checks.** Include re-sampling of the
   affected site/room until back in control.
7. **Close with QA sign-off** and feed the event into trending and the
   annual review.

### What to check during an investigation

- **HVAC/facility:** differential pressures, air change rates, filter
  integrity, recent maintenance, door-open events, nearby construction.
- **Cleaning and sanitization:** was the area cleaned on schedule; was
  the disinfectant in date and correctly diluted; rotation followed;
  contact time observed; any missed surfaces?
- **Personnel:** who was in the room; training status; gowning
  qualification current; any unusual interventions or high occupancy?
- **Process:** interventions, line stoppages, equipment assembly events.
- **Organism identity:** does the ID point to a source? Skin flora
  (staphylococci, micrococci) suggests personnel/gowning; spore-formers
  (Bacillus) suggest disinfectant failure or material transfer;
  Gram-negative rods suggest water or wet areas; moulds suggest
  HVAC/humidity or construction.
- **Data context:** is this site recurrent? Is it part of an adverse
  trend below the action level that was missed?

### Excursion investigation template (photocopy as needed)

- Excursion ID: ______________________  Date opened: ______________
- Room / site ID: ______________________  Grade: ______________
- Method: ______________  Result: __________ cfu  Action level: __________
- Batch(es) at risk: ______________________________________________
- Result confirmed valid? Y / N  By: ______________________
- Organism ID (genus/species, method): ______________________________
- Product impact assessment (attach QA decision): _____________________
- Likely cause categories checked: HVAC / Cleaning / Personnel /
  Process / Materials / Unknown
- Root cause summary: ______________________________________________
- ______________________________________________
- CAPA actions and owners: _________________________________________
- Effectiveness check (re-samples, dates, results): ___________________
- Investigation closed by (QA) Name / Signature / Date:
  ______________________ / ______________________ / ______________

---

## 5. Organism identification policy

Identification turns a count into evidence. A defensible policy states
*when* ID is mandatory and *how deep* to go.

### When ID is required

- **Always:** any Grade A recovery, and any Grade A/B excursion at or
  above the action level. Annex 1 expects microorganisms detected in
  Grade A and B areas to be identified to species level, with evaluation
  of potential impact on product quality.
- **Always:** organisms implicated in adverse trends, even below the
  action level (e.g. repeated recovery of the same morphology at the
  same site).
- **Always:** recoveries from critical surfaces and personnel gloves in
  Grade A/B.
- **Risk-based:** Grade C/D excursions and isolated low-level recoveries
  — identify at least to genus, and maintain a library of your normal
  facility flora to make "usual vs unusual" judgments.

### When to speciate

- Genus-level ID is often enough for routine trending in C/D.
- Speciate when: the organism appears in Grade A/B; it recurs across
  sites or time; it is a potential sterility-test or product isolate
  match; it may be objectionable for the product type.

### Objectionable organisms

An organism is "objectionable" when, in *your* product at *your* dose
level, it could harm the patient or spoil the product — there is no
universal list. Spore-formers surviving your disinfection regime,
organisms capable of growing in the product, or pathogens for the route
of administration all qualify. Document the rationale with QA and Micro.
USP <1111> gives a starting point for non-sterile products.

---

## 6. Trending and data review

Counts against limits are the floor, not the goal. Trend review is where
you catch drift before it becomes an excursion.

### What to trend

- **Per room:** recovery rate and counts over time, at rest vs in
  operation.
- **Per method:** active air, settle, contact, swab, personnel separately.
- **Per site:** flag sites with repeated low-level recoveries.
- **Per organism:** shift in flora (e.g. rising spore-former frequency
  may signal disinfectant failure).
- **Per operator:** glove/gown results by individual, feeding gowning
  requalification decisions.
- Non-viable particle data alongside viable data for correlation.

### Review cadence

- **Routine:** review results against limits as read (each batch/session
  for A/B).
- **Quarterly:** trend review per room/method/organism/operator;
  investigate adverse trends even when no action level was breached.
- **Annually:** full program review (Section 11) feeding the CCS and the
  product quality review (PQR/APR).

### Reporting to management

- One-page quarterly summary: excursions opened/closed, top recurring
  sites, organism trends, CAPA status, and any proposed program changes.
- Escalate immediately (not at the quarterly review): repeated Grade B
  excursions, any pattern of Grade A recoveries, or organism shifts
  suggesting a systemic failure.

---

## 7. Non-sterile and controlled-environment adaptation

The same framework scales down. For non-sterile manufacturing (oral
solids, liquids, topicals) and microbiology laboratories:

- Classify areas by risk (product exposure, water activity, preserved vs
  unpreserved) rather than formal EU grades; document the rationale.
- Set limits from baseline data and product risk — use USP <1111>
  acceptance criteria for the product itself as context for what the
  environment should contribute. Example pattern (clearly an example,
  not a requirement): action 100 cfu/m3 air / 25 cfu per contact plate in
  primary manufacturing areas; alert at 50 % of action.
- Reduce frequency (e.g. monthly or quarterly) but keep the discipline:
  defined sites, defined methods, trend review, excursion investigations.
- For microbiology labs themselves: monitor the sterility test area and
  aseptic test environments to a standard consistent with the tests
  performed there; a contaminated test environment invalidates results
  and is a serious finding.

---

## 8. Media and incubation for EM plates

### Media

- Standard EM medium: soybean-casein digest agar (SCDA/TSA) for routine
  bacteria and many fungi; add a fungal-selective medium (e.g. SDA) where
  mould risk justifies it.
- Contact plates and swab media must contain disinfectant neutralizers
  validated against your actual agents.
- Pre-poured plates for cleanroom use are typically gamma-irradiated and
  double/triple wrapped — unwrap at the airlock per procedure.

### Growth promotion testing (GPT)

- Test every batch/lot of EM media (compendial organisms per Ph. Eur.
  2.6.12 / USP <61> practice, e.g. S. aureus, B. subtilis, P. aeruginosa,
  C. albicans, A. brasiliensis, plus a relevant environmental isolate
  where your procedure requires).
- GPT must also be performed on plates after maximum exposure time (e.g.
  4 h at room conditions) to prove exposed media still support growth.

### Incubation

- Dual-temperature regimes are common and defensible: an example is
  20–25 °C for a defined period followed by 30–35 °C (or the reverse),
  with the sequence and durations **validated to recover your facility
  flora** — do not copy a regime you have not justified.
- Single-temperature incubation (e.g. 30–35 °C) under-recovers
  environmental fungi and stressed organisms; if you use it, justify it
  with comparative recovery data.
- Incubate long enough for slow growers (commonly not less than 5 days
  total), read at defined interim and final points, and reconcile every
  plate issued vs returned vs read.

---

## 9. Inspector expectations: common EM 483 themes

FDA 483 observations and EU inspection findings in EM recur around the
same failures. Expect questions and evidence requests on each:

- **Site selection not justified.** No documented risk assessment; sites
  chosen for convenience; critical zones under-monitored.
- **Alert/action levels not data-based, or raised without justification.**
- **Excursions not investigated or investigations not closed** — open
  investigations older than a few weeks draw attention; product impact
  assessment missing.
- **Organisms not identified** in Grade A/B or for action-level
  excursions.
- **Adverse trends below action level ignored.**
- **Media deficiencies:** no GPT, no post-exposure GPT, no neutralizer
  validation, expired plates.
- **Personnel monitoring gaps:** operators not monitored every session,
  or glove results not tied to gowning requalification.
- **Data integrity:** unaccounted plates, results recorded on unofficial
  paper, missing raw data, discrepancies between the register and lab
  records. (See the Atlas Pro Data Integrity Self-Check pack.)
- **Disinfectant programme weakness** revealed by spore-former trends
  (links to your disinfectant efficacy/sporicidal rotation programme).

Be ready to show: the CCS, the site risk assessment, the register with
current results, trend reports, closed excursion investigations with
CAPA, and media qualification records.

---

## 10. Worked example: excursion investigation (fictional)

Scenario: EM-2026-014. Grade B background room to an aseptic filling
suite. Contact plate (55 mm) at site EM-B-012 (door handle side of the
filling room pass-through, in operation) reads 8 cfu against an action
level of 5 cfu. Alert level is 3 cfu.

Day-by-day handling:

1. **Day 0 (read).** Analyst records 8 cfu, notifies Micro supervisor
   same day. Plate retained, colonies subcultured for ID.
2. **Day 1.** Excursion opened. Result validity confirmed: plate intact,
   no handling anomaly, incubation normal, concurrent Grade B air and
   settle results at this location were <1 and 2 cfu respectively.
   Batches filled in the room during the session identified: two batches
   flagged for QA impact assessment.
3. **Day 2–3.** ID returns: *Bacillus cereus* group — a spore-former.
   That reframes the investigation: contact plates include neutralizer
   for the routine quaternary ammonium disinfectant, but spore-formers
   point at the sporicidal step.
4. **Investigation findings.** Review of cleaning records shows the
   weekly sporicidal application in this airlock was signed off but the
   dilution log for that day is missing; two other Bacillus spp.
   recoveries (below alert) occurred in adjacent rooms in the prior
   6 weeks and were visible in the trend report but not acted on.
   HVAC, personnel, and process checks are unremarkable.
5. **Root cause (most probable).** Missed or ineffective sporicidal
   application; contributing cause: adverse trend below action level
   not investigated per procedure.
6. **Product impact.** QA assesses: excursion was on a non-product-
   contact surface in the background room, Grade A zone monitoring
   throughout was <1 cfu with no personnel excursions; batches released
   with documented rationale.
7. **CAPA.** Immediate sporicidal re-treatment of airlock and adjacent
   rooms with re-sampling (3 consecutive in-control sessions required);
   retraining on dilution documentation; trend-review SOP revised to
   force investigation of repeated same-genus recoveries below alert;
   effectiveness check at 30 and 90 days.
8. **Closure.** QA closes EM-2026-014 on day 21; event entered into the
   quarterly trend report and the annual program review.

Lessons encoded in this pack: ID changed the investigation direction;
sub-alert trending would have caught it earlier; the register and trend
report were the evidence that made the QA decision defensible.

---

## 11. Annual program review checklist

Work through this once per year (and feed it into the PQR/APR and CCS).

- [ ] All sample sites re-challenged against the risk assessment —
      still worst-case? New equipment, new flows, new blind spots?
- [ ] Alert and action levels re-derived from the last 12 months of data;
      changes justified and approved.
- [ ] Frequencies reviewed against excursion history and seasonal data.
- [ ] Every excursion investigation closed; CAPA effectiveness verified.
- [ ] Trend reports complete for each room, method, organism, operator.
- [ ] Flora library updated; new or objectionable organisms assessed.
- [ ] Media programme current: GPT records, post-exposure GPT, neutralizer
      validation against current disinfectants.
- [ ] Sampler calibration certificates in date; volumes re-validated if
      methods changed.
- [ ] Personnel monitoring records complete; glove results reconciled
      with gowning qualifications.
- [ ] Smoke studies current (per Annex 1 expectations) and site placement
      still consistent with airflow patterns.
- [ ] Changes to regulations/guidance reviewed and gap-assessed.
- [ ] Program changes from this review captured in the CCS and approved.

Annual review completed by: ______________________ / ______________
Name and role / Date
QA approval: ______________________ / ______________
Name / Signature / Date

---

## References

- EU GMP Annex 1: Manufacture of Sterile Medicinal Products (2022)
- FDA Guidance for Industry: Sterile Drug Products Produced by Aseptic
  Processing — Current Good Manufacturing Practice (2004)
- ISO 14644-1 and ISO 14644-2 (cleanroom classification and monitoring)
- ISO 14698-1 and ISO 14698-2 (biocontamination control)
- USP <1116> Microbiological Control and Monitoring of Aseptic
  Processing Environments; USP <1111>; Ph. Eur. 2.6.12 / 2.6.13
- ICH Q9(R1) Quality Risk Management; ICH Q10 Pharmaceutical Quality
  System

## Document control

- Document ID: EM-GUIDE-001  Version: ______  Effective date: __________
- Prepared by: ______________________ / ______________
  Name / Date
- Reviewed by (Microbiology): ______________________ / ______________
  Name / Date
- Approved by (QA): ______________________ / ______________
  Name / Signature / Date
- Next review due: ______________
