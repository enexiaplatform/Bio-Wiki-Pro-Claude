# OOS Investigation Template

**Working template for out-of-specification (OOS) laboratory investigations in pharmaceutical, biotech, and life-science QC laboratories.**

> Educational tool — not a validated procedure. This template reflects the phased
> approach in the FDA OOS guidance (2006, updated 2022), MHRA expectations, and
> GMP principles, but it is a starting point only. Before use, verify every step
> against your approved OOS SOP, your site's quality system, current compendia
> editions (USP–NF, Ph. Eur.), and the product's registered specification. This
> template is not a substitute for QA approval, regulatory advice, or your
> site's deviation and CAPA procedures. It has not been reviewed or endorsed by
> any regulator.

---

## 1. Purpose, Scope, and Regulatory Basis

### 1.1 Purpose

This template gives you a complete, inspection-ready structure for investigating
a confirmed out-of-specification result: what to do in the first hours, how to
run the Phase I laboratory assessment, when (and when not) you may invalidate a
result, how to design hypothesis testing, how to extend into a Phase II
full-scale investigation, and how to reach a defensible disposition with CAPA.

### 1.2 Scope

- Applies to chemical, physical, and microbiological QC testing of raw
  materials, in-process samples, intermediates, finished product, and stability
  samples.
- Applies to OOS, out-of-trend (OOT), out-of-expectation (OOE), and atypical /
  aberrant results.
- Does not replace your deviation system: every OOS investigation must run
  inside a numbered deviation / investigation record in your QMS.

### 1.3 Regulatory and compendial basis

- FDA Guidance for Industry, *Investigating Out-of-Specification (OOS) Test
  Results for Pharmaceutical Production* (2006; updated May 2022) — the core
  two-phase model used here.
- MHRA guidance and GXP Data Integrity Guidance (2018) — expectations on
  evidence, audit trails, and retesting.
- EU GMP Part I, Chapter 1 (Pharmaceutical Quality System) and Chapter 6
  (Quality Control, esp. 6.35 on OOS results).
- ICH Q7 (GMP for APIs), ICH Q9 (Quality Risk Management), ICH Q10
  (Pharmaceutical Quality System).
- USP general chapters: `<1010>` Analytical Data — Interpretation and Treatment
  (reportable result, averaging, outlier treatment); `<61>`, `<62>`, `<1111>`
  (microbiological examination); `<85>`, `<1227>` (endotoxins / method
  suitability, as applicable).
- Ph. Eur. 2.6.1, 2.6.12, 2.6.13 (sterility / microbial enumeration / specified
  organisms) for compendial microbiology.

### 1.4 Key definitions — use them precisely

- **OOS result**: a test result that falls outside the established
  specification or acceptance criteria in the dossier, registered filing, or
  approved specification.
- **Reportable result**: the final value compared against the specification.
  Per USP `<1010>`, it is usually the average of the individual determinations
  defined in the method — not a single injection or reading.
- **Individual determination**: one replicate, injection, or reading that feeds
  the reportable result. A single determination outside limits is not
  automatically an OOS — but the full replicate set must be defined in the
  method *before* testing.
- **OOT (out of trend)**: a result within specification but outside expected
  historical, statistical, or stability trend (e.g. a stability time point that
  breaks the regression, or an assay drifting toward a limit).
- **OOE (out of expectation)**: a result within limits that is atypical for the
  process or method (term common in EU/MHRA usage).
- **Aberrant / atypical result**: an unusual or anomalous observation that is
  not formally OOS but warrants explanation (e.g. an odd chromatogram, an
  unexpected colony type).

### 1.5 Averaging rules — read before you average

- Averaging individual determinations into a reportable result is acceptable
  **only** when the method or specification predefines the number of replicates
  and the averaging rule (per USP `<1010>` and the FDA OOS guidance).
- Averaging is **prohibited** when it hides variability that matters: content
  uniformity, dissolution, and results that are themselves measures of
  variability must never be averaged away.
- Never average an OOS result with passing retest results to bring the
  reportable result into specification. That is "testing into compliance" and
  is a leading cause of FDA 483 observations.
- If the method is silent on replicates, treat each full preparation's result
  as reportable — do not improvise averaging after the fact.

---

## 2. Decision Flow — Immediate Actions on Observing an OOS

Speed matters: evidence degrades, solutions age, and memories fade. The
same-day goal is to preserve everything and open the record — not to explain
the result away.

### 2.1 Same-day checklist

- [ ] Stop. Do not discard any sample solution, dilution, standard preparation,
      plates, or remaining sample.
- [ ] Quarantine the data: raw data, chromatograms, spectra, worksheets,
      balance printouts, instrument audit trails.
- [ ] Retain all glassware, columns, media plates, and consumables involved, as
      far as practical.
- [ ] Record the exact date/time the OOS was observed and by whom.
- [ ] Notify your supervisor and QA the same working day (per your SOP's
      timeline; many sites require notification within one business day of
      confirmation).
- [ ] Open a numbered OOS investigation record before any further testing.
- [ ] Quarantine the batch / material physically and in the ERP/LIMS so it
      cannot be released or used.
- [ ] Confirm the result is reportable (check the calculation and transcription
      once — see 2.2 — but do not "re-verify" repeatedly).
- [ ] Start Phase I (Section 3) without retesting anything.

### 2.2 First check — is it a true OOS?

A clear calculation or transcription error corrected before any further
testing, with the error documented, is not an OOS investigation — it is a
record correction. Everything else is.

- Recalculate from raw data once, with a second person verifying.
- Check transcription: units, dilution factors, decimal places, LIMS entry.
- If the result still fails specification: it is a confirmed OOS. Open the
  investigation.

### 2.3 Triggering result record

- Investigation / deviation number: ______________________
- Product / material and batch number: ______________________
- Test and method (incl. version): ______________________
- Specification / acceptance criteria: ______________________
- Reportable result: ______________________
- Individual determinations: ______________________
- Analyst: ______________________  Date/time observed: ______________________
- Supervisor notified (name / date / time): ______________________
- QA notified (name / date / time): ______________________
- Solutions, plates, and raw data retained and quarantined: Yes / No
- Batch quarantined in LIMS/ERP: Yes / No — reference: ______________________

---

## 3. Phase I — Laboratory Assessment

Purpose: determine whether there is an **assignable laboratory cause** — an
identifiable, objective error in the analysis — before any retesting. Work
through every group below and record findings, not just tick boxes. "Pass"
without a note is weak evidence; write what you actually checked.

### 3.1 Calculations and transcription

- [ ] Recalculate the reportable result from raw data; second-person check done.
- [ ] Verify dilution factors, aliquot volumes, and dilution cascades step by
      step against the preparation record.
- [ ] Verify standard concentrations, potency/purity corrections, water
      content, and salt-factor corrections used in the calculation.
- [ ] Verify units and conversion factors (mg/mL vs %, molarity, IU).
- [ ] Check LIMS/worksheet transcription against the raw record.
- [ ] Check rounding and significant figures against the specification's
      rounding rule.

Findings: ______________________

### 3.2 Standards and reagents

- [ ] Reference standard identity, lot, and certificate of analysis correct.
- [ ] Standard potency / assigned content and expiry (or requalification date)
      in date at time of use.
- [ ] Standard preparation records complete: weights, dilutions, storage, and
      use-by time respected.
- [ ] Working standard response consistent with historical response.
- [ ] Reagents, solvents, and mobile-phase components in date, correct grade,
      correctly prepared and labeled.
- [ ] Mobile phase / buffer pH and composition verified against the record.
- [ ] Water quality appropriate for the method (e.g. purified water grade).

Findings: ______________________

### 3.3 Instrument and system suitability

- [ ] Instrument calibration / qualification status current on the test date
      (check calibration sticker and log, not memory).
- [ ] System suitability results reviewed: did SSt pass *throughout* the run,
      or drift after the samples were injected?
- [ ] Injection sequence reviewed: blanks, bracketing standards, check
      standards — any drift, carryover, or failing bracket?
- [ ] Chromatography: integration review — correct integration events, baseline
      placement, peak splitting/co-elution, manual integrations identified and
      justified. Manual re-integration is a top data-integrity red flag.
- [ ] Audit-trail review of the sequence: repeated injections, aborted runs,
      deleted or renamed sequences, test injections into sample result files,
      clock changes. Record what you reviewed and what you found.
- [ ] Detector / lamp / electrode performance within expected response.
- [ ] Balance: daily check in date, correct weight set, printouts attached.
- [ ] Environmental conditions during the run (temperature, humidity) where the
      method is sensitive to them.

Findings: ______________________

### 3.4 Sample handling and preparation

- [ ] Correct sample taken, correct container, correct storage before analysis.
- [ ] Sample homogeneous? Suspension/emulsion sampled correctly? Composite vs
      discrete sampling as the method requires?
- [ ] Preparation followed step-by-step: weighings, transfers, sonication /
      dissolution time and temperature, filtration (filter type, first-mL
      discard), dilution scheme.
- [ ] Glassware: correct class, clean, no carryover; volumetric vs graduated
      used as the method specifies.
- [ ] Stability of the prepared solution respected (use-by time, protection
      from light, temperature).
- [ ] Any deviation or unusual observation recorded at the bench (spillage,
      incomplete dissolution, color change)?

Findings: ______________________

### 3.5 Analyst technique — interview

Interview the analyst factually and without blame. The goal is reconstruction,
not attribution. Suggested script:

1. Walk me through the preparation exactly as you performed it — show me the
   glassware and the record as we go.
2. Was anything about this run different from your usual runs of this method?
3. Did you observe anything unusual at any step (weighing, dissolution,
   injection, plating)?
4. Were there interruptions, instrument messages, or second attempts?
5. Was this your first time running this method / product? Were you supervised?
6. Is there anything you would do differently if you ran it again today?

- Training record for this method current: Yes / No
- Interview conducted by / date: ______________________
- Findings: ______________________

### 3.6 Microbiology-specific Phase I assessment

Microbiological OOS results rarely have an assignable laboratory cause — the
FDA OOS guidance and USP `<61>`/`<62>`/`<1111>` practice recognize that
contamination found in a product is usually real. You must still run a rigorous
lab assessment, but set the invalidation bar high: only clear, objective
laboratory error justifies invalidation.

- [ ] Media: correct media per method (e.g. SCD, SDA per USP `<61>`/`<62>` or
      Ph. Eur. 2.6.12/2.6.13), in date, correct lot, growth promotion test
      (GPT) passed for the lot in use, sterility and pH checks acceptable.
- [ ] Incubation: correct temperatures and durations per the compendial method
      (e.g. SCD 30–35 °C for 3–5 days, SDA 20–25 °C for 5–7 days for USP
      `<61>`/`62` — verify against the current edition), incubator mapping and
      daily records reviewed for excursions.
- [ ] Plate reading: counts re-read by a second analyst; spreader vs discrete
      colonies distinguished; counting within the method's countable range;
      dilution factor applied correctly.
- [ ] Negative controls: media, diluent, and environmental/personnel controls
      from the test session — any growth invalidates the *test*, not the
      product result, and points to lab contamination.
- [ ] Cross-contamination controls: biosafety cabinet / isolator checks,
      session layout, other organisms handled in the same session, disinfectant
      in date and contact time respected.
- [ ] Identification: is the recovered organism consistent with the
      environment/personnel flora (e.g. common skin organisms) or with a
      product/raw-material source? Identification alone does not invalidate —
      it informs root cause.
- [ ] Aseptic technique: analyst qualification, media-fill/simulation history,
      glove and gowning monitoring from the session.
- [ ] For sterility tests (USP `<71>`, Ph. Eur. 2.6.1): invalidation is
      permitted only under the strict conditions of the chapter (documented
      lab error, or identifiable contamination from the test environment with
      supporting data). A repeat sterility test is otherwise not allowed.

Findings: ______________________

### 3.7 Phase I conclusion

- Assignable laboratory cause identified: Yes / No
- If Yes — describe the cause: ______________________
- Objective evidence supporting it (data, records, observations — not
  inference): ______________________
- Original result invalidated (QA-approved, justification attached): Yes / No
- If No — proceed to Section 5 (hypothesis testing, if justified) and
  Section 6 (Phase II). Do not invalidate.
- Phase I completed by / date: ______________________
- QA review of Phase I / date: ______________________

---

## 4. Invalidation Rules

Invalidation is the most inspected decision in the whole investigation. The
rule is simple: **objective evidence, or the result stands.**

### 4.1 What counts as objective evidence

- A documented, identifiable error that demonstrably caused the result: e.g. a
  recorded wrong dilution, a mislabeled standard with the weight record to
  prove it, a failing bracketing standard in the same run, a negative-control
  failure in a micro session.
- Evidence must exist independently of the OOS itself — "the result is low,
  therefore something must have gone wrong" is circular and unacceptable.

### 4.2 What does not count

- Passing retest results on their own.
- Analyst inexperience, "possible" technique issues, or hypothetical
  contamination without supporting data.
- Instrument quirks with no documented failure at the time of the run.
- Statistical improbability (an outlier test alone never invalidates a result).

### 4.3 Retest vs resample — know the difference

- **Retest**: re-analysis of the *same* original sample (new preparation from
  the retained sample, where stability permits). Used for hypothesis testing
  under a pre-approved protocol.
- **Resample**: collection of a *new* sample from the batch. Resampling to
  escape an OOS is effectively prohibited — regulators treat it as testing
  into compliance. A new sample is defensible only where the original sampling
  itself is proven deficient (e.g. wrong container, compromised integrity) or
  where the science requires it (e.g. microbiology, where the original sample
  is consumed).
- If the OOS is confirmed and no assignable cause exists, the batch result
  stands. More testing does not change the batch.

### 4.4 Testing into compliance — prohibited

Repeatedly testing until a passing result appears, then releasing on the
passing results, is an explicit finding in the FDA OOS guidance and in
warning letters. Any retesting must be hypothesis-driven, pre-approved by QA,
and capped at a pre-defined number.

---

## 5. Hypothesis Testing

### 5.1 When permitted

Hypothesis testing is appropriate when Phase I has *not* found objective
evidence, but a specific, scientifically plausible laboratory explanation
remains testable (e.g. incomplete extraction, a filtration adsorption issue, an
instrument parameter). It is not a license to repeat the assay.

### 5.2 Pre-approved protocol — complete before any retest

- Hypothesis (specific and falsifiable): ______________________
- Rationale and supporting observations from Phase I: ______________________
- Exact test design: what will be prepared/injected/plated, by whom, on which
  instrument: ______________________
- Number of retests pre-defined: __________
- Analyst(s): same analyst and/or second analyst: ______________________
- Acceptance / decision criteria in advance — what outcome supports the
  hypothesis, what outcome confirms the OOS: ______________________
- QA pre-approval: Name __________ Signature __________ Date __________

### 5.3 Number of retests

- Common industry practice — and what FDA investigators commonly expect to see
  in a retest protocol — is on the order of **6 retest determinations** (for
  example, six preparations run by the same analyst, or split between the
  original and a second analyst). Treat this as common practice, not a
  regulatory number: your SOP must define the count in advance, and more is not
  better.
- All retest results are reported individually — never cherry-picked, never
  averaged with the original to mask failure.

### 5.4 Statistical view

- Compare retest results to the original with appropriate statistics (e.g.
  mean, %RSD vs method precision, or a pre-defined significance test).
- Remember: statistical outlier treatment (e.g. a Grubbs-type test, per USP
  `<1010>` discussion) can *inform* but never *invalidate* a result by itself.
- If retest results are consistent with the original OOS, the OOS is confirmed.
- If retest results clearly and consistently contradict the original and the
  hypothesis is confirmed with objective evidence, document the invalidation
  with QA approval — and still consider Phase II if the cause could affect
  other results.

### 5.5 Outcome record

- Retest results (all, individually): ______________________
- Interpretation against pre-set criteria: ______________________
- Hypothesis confirmed / refuted: ______________________
- QA review: Name __________ Date __________

---

## 6. Phase II — Full-Scale Investigation

Open Phase II when Phase I finds no assignable laboratory cause and hypothesis
testing (if performed) confirms the OOS. The investigation now extends to the
manufacturing process, and QA owns the coordination.

### 6.1 Manufacturing and batch record review

- [ ] Batch record reviewed step-by-step: deviations, omissions, unusual
      entries, corrections, second-person checks.
- [ ] All in-process controls in specification and in trend; any borderline
      IPCs noted.
- [ ] Process parameters vs registered/validated ranges (times, temperatures,
      speeds, pressures, pH adjustments).
- [ ] Deviations, events, alarms, or unplanned interventions during
      manufacture.
- [ ] Cleaning status and changeover history of the equipment train; campaign
      position; hold times respected.

Findings: ______________________

### 6.2 Raw materials and components

- [ ] CoA and receipt testing of all lots used, especially the actives and key
      excipients.
- [ ] Supplier changes, new lots first use, or unqualified alternate sources.
- [ ] Storage conditions and retest dates at time of use.
- [ ] Water, gases, and other utilities used in the batch within specification.

Findings: ______________________

### 6.3 Equipment and maintenance

- [ ] Qualification and calibration status of manufacturing equipment.
- [ ] Maintenance, repairs, or replacements since the last conforming batch.
- [ ] Sensor / probe verification where the failing attribute depends on in-line
      measurement.

Findings: ______________________

### 6.4 People and environment

- [ ] Staffing, training, shift changes, new operators on critical steps.
- [ ] Environmental monitoring of the area during manufacture (viable and
      non-viable) — cross-reference your EM program for excursions.

Findings: ______________________

### 6.5 Trend review

- [ ] Method history: previous OOS/OOT on this test, method transfers, method
      changes.
- [ ] Product history: assay/content trend over recent batches; is this batch
      an outlier or the continuation of a drift?
- [ ] Analyst and instrument trend for this method.
- [ ] Stability data for this batch (if tested) and comparable batches.

Findings: ______________________

### 6.6 Batch impact assessment

- [ ] Other batches made with the same raw-material lots, equipment train, or
      campaign — list and assess: ______________________
- [ ] Stability batches potentially affected — flag for protocol amendment or
      extra time points: ______________________
- [ ] Distributed product potentially affected — reconcile with distribution
      records: ______________________
- [ ] If distributed product may be affected: evaluate field alert / recall
      obligations (e.g. FDA Field Alert Report within 3 working days for
      distributed product with confirmed OOS for US NDA/ANDA holders; national
      recall procedures elsewhere). QA/regulatory affairs decision and
      rationale: ______________________

### 6.7 Phase II conclusion

- Probable root cause (or state that none could be assigned — a valid,
  documented outcome): ______________________
- Evidence summary: ______________________
- OOS confirmed / not confirmed: ______________________
- Phase II lead / date: __________  QA review / date: __________

> A Phase II that finds no root cause does not make the result go away. A
> confirmed OOS with no identified cause still requires batch rejection or a
> scientifically justified disposition — never release on the absence of a
> cause.

---

## 7. OOT and Trend Handling

- Treat OOT results with the same discipline as OOS, scaled by risk: they are
  early warnings, not non-events.
- Define trend rules in your SOP before you need them — examples of commonly
  used triggers (adapt to your product, clearly site-defined): a result outside
  the historical mean ± 3 SD, three consecutive points moving one direction, or
  a stability point off the regression line with a significant slope change.
- For stability OOT (per FDA/ICH expectations): investigate promptly even when
  in-specification; a significant change can trigger shelf-life impact
  assessment.
- Microbiology: trending is essential because individual counts are noisy —
  trend EM, water, and product bioburden data together rather than reacting to
  single excursions.
- Log every OOT in the investigation log (the CSV in this pack) with the same
  fields as an OOS; mark the "phase reached" column accordingly.

OOT record:

- Product / batch / test: ______________________
- Result vs expectation and trend basis: ______________________
- Assessment and outcome: ______________________

---

## 8. Disposition and CAPA

### 8.1 Disposition

- Decided by QA, independent of the analyst and of production pressure, on the
  totality of evidence.
- Possible dispositions: Release (only with documented invalidation), Reject,
  Reprocess/Rework (if a registered/approved route exists), Hold pending
  further data, or Other with rationale.
- Batch disposition: ______________________
- Rationale referencing investigation sections: ______________________
- Impact on other batches / stability / market (from 6.6): ______________________

### 8.2 CAPA

- Corrective action (this occurrence): ______________________
- Preventive action (systemic — method, training, equipment, process):
  ______________________
- CAPA reference number(s): ______________________
- Owner(s) and due date(s): ______________________

### 8.3 Effectiveness checks

- Every CAPA needs a pre-defined effectiveness check — otherwise you cannot
  show the fix worked.
- Examples (choose and adapt): zero recurrence of this OOS cause over the next
  N batches; retrained analysts pass a method requalification; revised method
  shows acceptable precision in a verification run; alarm/audit-trail review
  added to the batch-release checklist and confirmed in use for N batches.
- Defined effectiveness check and criteria: ______________________
- Check performed by / date / result: ______________________

### 8.4 Closure

- Investigation closed only when: Phase I and (if applicable) Phase II complete,
  disposition recorded, CAPA raised with owners and dates, effectiveness check
  defined, and the log entry updated.
- Date closed: __________  Closed by (QA): __________

---

## 9. What Inspectors Look For — Top 10 OOS Deficiencies

These are the most commonly cited OOS failures in FDA 483 observations and
warning letters, and how using this template defends against each.

1. **Invalidation without objective evidence.** Defense: Section 4 forces a
   documented cause with independent evidence before any invalidation; the
   Phase I conclusion block requires the evidence to be written down.
2. **Incomplete or skipped Phase I.** Defense: Section 3's grouped checklists
   cover calculations, standards, instruments, sample prep, technique, and
   microbiology — with findings recorded per group, not a single tick.
3. **Testing into compliance / averaging into compliance.** Defense: Sections
   1.5 and 4.4 state the prohibitions; Section 5 caps retesting at a
   pre-defined count with all results reported.
4. **Retesting without a pre-approved hypothesis.** Defense: the Section 5
   protocol must be completed and QA-signed before any retest.
5. **Failure to extend into Phase II when no lab cause is found.** Defense:
   Section 3.7 routes a "No" conclusion directly into Section 6; the log tracks
   "phase reached" per investigation.
6. **No audit-trail or integration review.** Defense: Section 3.3 makes
   audit-trail and manual-integration review an explicit checklist item —
   exactly what MHRA/FDA data-integrity inspections ask for.
7. **Resampling used to escape the result.** Defense: Section 4.3 defines
   retest vs resample and the narrow conditions for a new sample.
8. **Microbiological OOS casually invalidated.** Defense: Section 3.6 sets a
   high invalidation bar with media/GPT, incubation, negative-control, and
   technique review documented.
9. **No batch impact assessment.** Defense: Section 6.6 requires review of
   other batches, stability, distributed product, and field alert / recall
   evaluation.
10. **Open investigations aging without closure or CAPA.** Defense: the CSV log
    tracks days open, target dates, disposition, CAPA references, and closure
    per investigation.

Expect inspectors to ask: show me your OOS SOP; show me all OOS investigations
in the last 2–3 years and their closure times; show me one invalidation and its
objective evidence; show me how you review audit trails; how many retests does
your SOP allow and why.

---

## 10. Worked Example — Completed Investigation (Fictional)

The following shows this template completed end-to-end. All names, products,
and data are fictional.

### 10.1 Triggering result

- Investigation number: OOS-2026-014
- Product / batch: Amoxicillin Capsules 500 mg, batch AC-26114
- Test / method: Assay by HPLC, method AMX-ASY-04 v3
- Specification: 95.0–105.0% of label claim
- Reportable result: **89.2%** (mean of two preparations: 89.1%, 89.3%)
- Analyst: J. Okafor — observed 2026-03-04 14:20
- Supervisor notified: L. Marsh, 2026-03-04 15:05; QA notified: R. Iqbal,
  2026-03-04 15:30
- Solutions and data retained: Yes — sample and standard solutions refrigerated
  at 2–8 °C, sequence and audit trail exported
- Batch quarantined in ERP: Yes — hold H-7782

### 10.2 Same-day actions

All items in 2.1 completed by 17:00 on 2026-03-04. Investigation opened before
any retesting.

### 10.3 Phase I findings

- 3.1 Calculations: **FAIL** — recalculation shows the second preparation used
  a 50.0 mL volumetric flask recorded and diluted as 100.0 mL in the worksheet;
  the dilution factor entered in the LIMS calculation was wrong by 2×.
  Objective evidence: original weighing and dilution record, balance printout
  (final weight 49.98 g in a 50 mL flask tare set), and the LIMS calculation
  audit trail showing the incorrect factor.
- 3.2 Standards/reagents: Pass — reference standard lot AS-118 in date, potency
  99.8% per CoA, preparation record complete.
- 3.3 Instrument/SSt: Pass — system suitability passed throughout; bracketing
  standards within 2%; audit trail clean, no repeated or aborted injections.
- 3.4 Sample prep: Confirms 3.1 — preparation P2 diluted to 50 mL instead of
  the method-specified 100 mL.
- 3.5 Analyst interview: analyst confirms using a 50 mL flask during a busy
  session and transcribing the nominal 100 mL volume from habit; training
  current, no blame attached.
- 3.6 Microbiology: Not applicable.

### 10.4 Phase I conclusion

- Assignable laboratory cause identified: **Yes** — dilution error in
  preparation P2, proven by the weighing record and balance printout.
- Corrected reportable result from preparation P1 alone, per the method's
  pre-defined replication rule and with QA approval: 99.4% — within
  specification.
- Original result invalidated: Yes — QA approval R. Iqbal, 2026-03-06,
  justification attached.

### 10.5 Hypothesis testing

Not required — objective evidence found in Phase I. (Had the dilution record
been ambiguous, a pre-approved protocol would have re-prepared the sample in
duplicate by a second analyst, 6 determinations total, decision criteria set in
advance.)

### 10.6 Phase II

Not required — assignable laboratory cause confirmed. A limited method-use
review confirmed no other open assays by this analyst used the affected
worksheet template.

### 10.7 Disposition

- Disposition: **Release** — OOS invalidated with objective evidence; corrected
  reportable result 99.4% within 95.0–105.0%.
- Impact: no other batches used the erroneous worksheet entry (verified by LIMS
  query); no stability or distributed product affected.

### 10.8 CAPA and closure

- Corrective action: worksheet template AMX-ASY-04-W revised so the dilution
  volume is a verified field with a second-person check before LIMS entry —
  effective 2026-03-20.
- Preventive action: volumetric flask size must be recorded with the tare
  printout attached for all assay preparations; analysts briefed 2026-03-18.
- CAPA ref: CAPA-2026-031. Effectiveness check: zero dilution-entry errors in
  the next 20 assay runs of this method (checked 2026-06-30 — zero errors,
  CAPA closed effective).
- Investigation closed: 2026-03-21 by R. Iqbal (QA). Days open: 17.

---

## 11. Sign-Off and Revision Block

### 11.1 Investigation sign-off

| Role | Name | Signature | Date |
|---|---|---|---|
| Analyst | | | |
| Lab supervisor | | | |
| QA reviewer | | | |
| QA approver (disposition) | | | |

### 11.2 Template revision history (this document)

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-07 | Initial Atlas Pro release |

### 11.3 Ownership

- Template owner (adapt at your site): ______________________
- Site SOP this template maps to: ______________________
- Next review date: ______________________

> Reminder: before site use, map every section of this template to your approved
> OOS SOP, your deviation and CAPA procedures, and current compendia editions.
> Where this template and your SOP differ, your approved SOP governs.
