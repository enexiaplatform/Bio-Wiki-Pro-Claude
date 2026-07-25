# Biological Indicator (BI) Workflow Checklist

Sterilization validation and routine monitoring — moist heat, dry heat, VHP, and EtO

> DISCLAIMER — READ FIRST. This pack is an educational working template. It is not a validated procedure, not regulator-approved, and not a substitute for your approved SOPs, your site's quality system, current compendia editions (USP-NF, Ph. Eur.), applicable ISO standards, or QA review and approval. Regulatory texts and standards are revised periodically — always work from the current edition in force at your site. Where a numeric value depends on your product, load, or validated cycle, this pack gives you a fill-in field plus clearly labeled industry-typical examples. QA must approve any use of this document for GMP decisions.

## How to use this pack

- Use Sections 1–3 when you select, receive, or qualify a BI.
- Use Section 4 during cycle validation (PQ/requalification).
- Use Section 5 for routine monitoring runs, together with the BI Run Log (CSV).
- Use Sections 6–7 for incubation, reading, and any positive-BI investigation.
- Use Sections 9–10 to keep records inspection-ready.
- Section 11 is a fully worked fictional example — read it once before your first real run.

## 1. Purpose and regulatory basis

A biological indicator is a standardized population of resistant spores, on a carrier or self-contained unit, used to demonstrate that a sterilization process actually delivers lethal conditions. Physical data (temperature, pressure, F0) prove the machine ran the cycle; only the BI proves the conditions were lethal to a known biological challenge at the exact location where the BI sat. A defensible sterilization program needs both.

You use BIs in four situations:

1. Cycle development and validation (PQ) — including load mapping and worst-case challenge.
2. Periodic requalification — after change, repair, or on a scheduled basis.
3. Routine monitoring — per-load or periodic, depending on your release strategy.
4. Special situations — sterilizer return-to-service, new load configurations, investigations.

Governing documents (verify current editions):

- ISO 11138 series — Sterilization of health care products, Biological indicators: Part 1 general requirements; Part 2 EtO; Part 3 moist heat; Part 4 dry heat.
- USP <55> Biological Indicators — Resistance Performance Tests — CoA verification and D-value/population confirmation.
- USP <1229> Sterilization of Compendial Articles — overall sterilization science, overkill vs bioburden-based vs combined approaches.
- ISO 17665 — moist heat sterilization: development, validation, routine control.
- ISO 11135 — ethylene oxide sterilization: development, validation, routine control.
- ISO 11138-7 — guidance on selection, use, and interpretation of BI results.
- PDA Technical Report No. 1 — Validation of Moist Heat Sterilization Processes.
- PDA Technical Report No. 51 — Biological Indicators for Gas and Vapor-Phase Decontamination Processes (VHP).
- EU GMP Annex 1 (2022) — contamination control strategy expectations for sterile manufacture; sterilization of items entering grade A/B.

Key principle: the BI must be more resistant than the worst bioburden your process is designed to kill. That is what makes a no-growth result meaningful.

## 2. BI selection guide

### 2.1 Organism by process

- Moist heat (saturated steam): Geobacillus stearothermophilus spores (typical reference strains ATCC 7953 or ATCC 12980). Highly heat-resistant; germinates and grows at 55–60 °C.
- Dry heat: Bacillus atrophaeus spores (typical reference strain ATCC 9372; formerly B. subtilis var. niger). Note: dry-heat depyrogenation is normally demonstrated with endotoxin indicators, not viable BIs — check your program.
- Vaporized hydrogen peroxide (VHP / bio-decontamination): G. stearothermophilus spores, typically on stainless-steel or other validated carriers compatible with the enclosure.
- Ethylene oxide (EtO): B. atrophaeus spores (ATCC 9372), per ISO 11138-2.
- Radiation: not covered by this pack (ISO 11137 regime; BIs are generally not used for routine radiation release).

Quick selection reference:

| Process | Organism | Std | Incubation |
| --- | --- | --- | --- |
| Moist heat | G. stearotherm. | ISO 11138-3 | 55-60 C |
| Dry heat | B. atrophaeus | ISO 11138-4 | 30-35 C |
| EtO | B. atrophaeus | ISO 11138-2 | 30-35 C |
| VHP | G. stearotherm. | PDA TR 51 | 55-60 C |

Incubation ranges above are typical label values — always follow the BI manufacturer's label for the lot in hand.

### 2.2 Resistance and population requirements

- The labeled D-value and population must suit your cycle lethality. For steam BIs, ISO 11138-3 specifies a minimum D121 of 1.5 min; typical commercial steam BIs carry D121 of roughly 1.5–3.0 min with populations of 10^5 to 10^6 spores (typical industry examples — confirm against your validated cycle lethality and the BI CoA).
- ISO 11138-4 sets minimum resistance requirements for dry-heat BIs (e.g., a minimum D160); ISO 11138-2 does the same for EtO. Use the part matching your process.
- For an overkill cycle (USP <1229>), the classic demonstration is a 12-log reduction of a suitable challenge. Your BI population and D-value, combined with exposure time, must support that claim — work this out during validation, not at the bench.
- Acceptance tolerances on the label matter: verify population and D-value within the tolerances given by ISO 11138-1 and USP <55> when you perform in-house verification (Section 3.3).

Your validated BI specification (fill in):

- Process: ______________________
- Organism and strain: ______________________
- Required D-value (min, at reference temp): ______________________
- Required population (CFU/carrier): ______________________
- Approved supplier(s) and catalog no.: ______________________

### 2.3 BI format

- Self-contained BI (SCBI): spore strip plus sealed growth-media ampoule in one vial. Fast, simple, low contamination risk; standard for routine autoclave monitoring.
- Spore strip / disc: spores on paper carrier; you aseptically transfer to growth medium after exposure. Cheap and flexible, but the transfer step is a contamination and false-positive risk.
- Inoculated carrier: spores on a carrier representative of your load item (e.g., stainless coupon, suture, stopper). Used in validation when the item itself affects lethality.
- Inoculated product / product BI: spores directly in or on the actual product. Strongest challenge for liquid loads or odd geometries; reserved for validation, not routine use.
- Choose the simplest format that still represents your worst case. Routine monitoring: SCBI. Validation of porous/hard goods: strips or carriers at mapped cold spots. Liquid loads: inoculated product or product-equivalent carriers.

### 2.4 Lethality math you must be able to show

An inspector or auditor can ask why your BI challenge is adequate. Be ready with this arithmetic:

- One D-value kills 90% (one log) of the spore population. N D-values reduce the population by N logs.
- Worked example: a steam BI with population 1 x 10^6 and D121 of 1.5 min. Reducing it to less than one survivor needs more than 6 D-values (9 min at 121 °C); validating the cycle to deliver roughly 7–8 D-values (about 11–12 min) gives a comfortable fraction-negative margin at the BI location.
- For a 12-log overkill claim (USP <1229> style), the exposure at the slowest point must deliver 12 D-values of the challenge organism — in this example, 18 min at 121 °C equivalent.
- The physical exposure time at the coldest mapped point must meet or exceed whatever your chosen margin requires. If your cycle delivers F0 20 at the coldest point and your BI needs 12 D-values of 1.5 min (18 min), the challenge is covered; if it delivered F0 10, the BI could legitimately survive and a no-growth result would be luck, not proof.
- Do this calculation for every BI lot whose D-value or population changes materially, and record it in the validation rationale.

## 3. Receiving and storage QC

### 3.1 Receiving checklist

- [ ] Purchase order matches the approved BI specification (Section 2.2).
- [ ] Shipment inspected: packaging intact, no visible damage, temperature requirements maintained if specified by the manufacturer.
- [ ] Certificate of Analysis (CoA) present for the exact lot received.
- [ ] Lot logged into inventory with expiry date; quarantine label applied until CoA review is complete.

### 3.2 CoA review checklist (one per lot)

- [ ] Organism identity and strain number stated and matching your specification.
- [ ] Nominal population (CFU/carrier) stated, with the test method reference.
- [ ] D-value stated, with the conditions of determination (temperature for steam/dry heat; gas concentration, temperature, humidity for EtO) and the method (survivor curve or fraction-negative).
- [ ] Purity/identity confirmation and, where applicable, z-value or survival/kill time window stated.
- [ ] Expiry date and labeled storage conditions stated.
- [ ] Manufacturer is on your approved supplier list; lot within expiry on receipt with enough remaining shelf life for planned use (site rule, e.g., minimum 6 months — example only).

CoA review sign-off: Reviewed by ______________________ Date __________

### 3.3 In-house resistance verification — when required

- USP <55> and ISO 11138-4-era practice allow you to rely on the manufacturer's CoA when the manufacturer is qualified and you have an audit/quality agreement basis; many sites verify the first lot from a new supplier and re-verify periodically or on suspicion (typical risk-based example — define your rule in an SOP).
- Verification per USP <55> means confirming the viable population and D-value (or survival/kill window) on the received lot, using a resistometer (BIER vessel) for steam or the specified apparatus for other processes.
- A D-value verification is a specialized test (Section 8). If you lack a BIER vessel, contract it out or rely on CoA per your documented supplier-qualification rationale — but write that rationale down.
- Label each lot in inventory with verification status: CoA-accepted / in-house verified / contracted.

### 3.4 Storage

- [ ] Store per the manufacturer's label (commonly refrigerated, protected from light and humidity — follow the label, not habit).
- [ ] Storage temperature monitored and recorded; excursions assessed against manufacturer stability data.
- [ ] Never use an expired BI. Never use a BI exposed to a temperature excursion without QA disposition.
- [ ] Return BIs to storage immediately after dispensing the units needed for the run.

## 4. Validation use: load mapping and placement

### 4.1 Before placing a single BI

- Thermal mapping (heat distribution and heat penetration) for the load pattern must be complete and approved. The BI goes where physics says the cycle is weakest — you do not guess cold spots.
- The load pattern must be fixed and documented: item list, arrangement, wrapping, and loading diagram. BIs are only meaningful against a defined load.

### 4.2 Placement strategy

- Place BIs at the validated worst-case locations: slowest-to-heat points identified by thermal mapping — typically the geometric center of the densest items, the lowest-point drain region, air-entrapment pockets in wrapped goods, and points adjacent to the coldest mapped sensor (typical examples; your mapping report governs).
- For liquid loads, place inoculated product or carriers in the largest-volume and slowest-heating containers.
- For VHP enclosure decontamination, distribute BIs at locations hardest for vapor to reach: occluded surfaces, inside tubing ends, corners, behind equipment (PDA TR 51 style approach).
- Map every BI position to a numbered location diagram filed with the validation protocol.

### 4.3 How many BIs per run

- No universal mandated number — it is risk-based and protocol-defined. Typical practice examples: 10 or more BIs distributed with the thermal sensors for autoclave load PQ; triplicate carriers per location for statistical confidence in VHP studies. State the number and the rationale in the validation protocol before execution.
- Include at least one unexposed positive control from the same lot, and a negative control (uninoculated medium) per incubation batch.

### 4.4 Exposure and retrieval controls

- [ ] Record physical cycle data for the exact run: setpoint vs actual temperature, exposure time, pressure, and F0 where calculated.
- [ ] Retrieve BIs promptly after cycle completion using aseptic technique; note the actual time between cycle end and recovery.
- [ ] Respect the manufacturer's maximum hold time between exposure and recovery/incubation; long delays at ambient conditions can allow spore recovery or loss and invalidate the read (follow the label).
- [ ] Transport exposed BIs to the microbiology lab in a closed, labeled container with the run ID.

## 5. Routine monitoring

### 5.1 Frequency rationale

- Parametric release (where your regulatory pathway and validation support it): the physical data release the load; BIs run on a defined periodic schedule as ongoing assurance.
- BI-based release (common for loads you cannot parametrically release, or where your market/QP expects it): every load carries BIs and the load is quarantined until BI results are known.
- Pick one model per sterilizer/load family, write it into the SOP, and do not drift between them informally.
- Also run BIs: after any sterilizer maintenance or repair, after utility changes (steam quality, supply interruptions), after any cycle parameter change, and after a failed run before the sterilizer returns to service.

Your monitoring schedule (fill in and get QA approval):

- Sterilizer ID: ______________________
- Release model (parametric / BI-based): ______________________
- BI frequency (per load / weekly / monthly / other): ______________________
- Periodic requalification interval (typical example: annual — your validation policy governs): ______________________
- Requalification trigger list reference (SOP no.): ______________________

### 5.2 Routine placement and controls

- [ ] Place the routine BI at the validated worst-case location from the mapping report — the same location every run, so trends mean something.
- [ ] Include an unexposed positive control from the same BI lot in every run — non-negotiable. A no-growth exposed BI with a failed positive control proves nothing.
- [ ] Include a negative control (uninoculated medium, or an unopened SCBI medium blank per the manufacturer's method) in every incubation batch.
- [ ] Log everything in the BI Run Log (CSV) at the time of the run, not at week's end.

### 5.3 Pre-run checklist (print and use)

- [ ] Sterilizer ID and cycle program confirmed against the approved cycle list.
- [ ] BI lot within expiry, storage compliant, verification status current (Section 3.3).
- [ ] BI organism and format correct for this process (Section 2).
- [ ] Placement location matches the validated location map.
- [ ] Positive and negative controls staged and labeled.
- [ ] Run ID assigned and log opened before the cycle starts.

## 6. Incubation and reading

### 6.1 Conditions

- G. stearothermophilus (steam, VHP): incubate at 55–60 °C in the specified medium (commonly soybean-casein digest broth for strips; the SCBI's own activated ampoule for self-contained units).
- B. atrophaeus (dry heat, EtO): incubate at 30–35 °C in the specified medium (typically soybean-casein digest broth at 30–35 °C; follow the manufacturer's label — example range given).
- EtO-exposed strips must be aerated per the manufacturer's instructions before transfer to media, to avoid residual-EtO growth inhibition (a classic false-negative cause).
- Activate SCBIs per the manufacturer: crush/break the media ampoule only after the vial has cooled; verify media contact with the strip.

### 6.2 Duration and reading

- The compendial convention for conventional BIs is incubation up to 7 days with observation during the period (per USP <55>-style practice and manufacturer labeling). Rapid-readout/enzyme-based BIs have shorter validated read times — use them only as labeled and within your SOP.
- Read and record at defined intervals (typical example: daily, with a final 7-day read). A positive at day 2 is a positive — you do not wait for day 7 to act (Section 7).
- Interpretation: growth = turbidity and/or the manufacturer's color change in the exposed unit. No growth in all exposed BIs plus valid controls = the biological challenge passed.

### 6.3 Control validity rules

- Positive control must grow. If it does not: the run is invalid — suspect BI viability (storage, expiry, handling) or media failure. Repeat the run with a fresh lot or verified stock; investigate the control failure itself.
- Negative control must not grow. If it does: your aseptic technique or media is compromised — all results in that batch are suspect.
- An invalid run is not a passed run. Repeat it, and treat any product held on that run per QA disposition.

### 6.4 Media and incubator controls

- [ ] Recovery media (for strips) within expiry, growth-promotion tested on receipt per your media QC program.
- [ ] SCBI media ampoules intact and the lot within the manufacturer's shelf life.
- [ ] Incubator temperature monitored and recorded daily (or continuously) across the whole incubation window; excursions trigger an impact assessment on every run inside.
- [ ] Incubator loading does not exceed validated capacity; units spaced for even heating.
- [ ] Read results recorded on the day read, with the reader's initials — no batch entry at week's end.

## 7. Positive BI: sterilization failure investigation

A growth-positive exposed BI is a potential sterilization failure. Until the investigation concludes otherwise, treat the load as non-sterile.

### 7.1 Immediate actions (same shift)

1. Quarantine the load. Block distribution or further processing of every item in it. Physically and electronically segregate.
2. Notify supervision and QA immediately — a positive BI is a deviation, not a bench-level event.
3. Preserve evidence: retain the positive unit(s) (do not discard), the controls, the BI lot stock, the cycle printout, and the load diagram.
4. Open a deviation record and assign the investigation reference; link it in the BI Run Log.

### 7.2 Investigation decision tree

Step 1 — Confirm the positive. Subculture from the positive unit to a non-selective plate and incubate; identify the organism. If the growth is not the BI organism (e.g., a Gram-negative or a mold), suspect handling/transfer contamination — this points to a false positive, which still requires documented evidence.

Step 2 — Check the controls and handling. Positive control grew? Negative control clean? Recovery aseptic and within hold time? Incubator temperature in range? Any handling error found here supports a BI-handling cause, not a cycle cause.

Step 3 — Review the physical cycle data. Exposure temperature and time met? F0 achieved? Pressure profile normal? Any alarms, steam-quality events, vacuum failures, or come-up anomalies? If the physical data also failed, you have a genuine cycle failure — proceed as a nonconforming sterilization.

Step 4 — Review load configuration. Was the load built to the validated pattern? New items, changed wrapping, overloading, or a BI placed in a non-validated position? Load deviation alone can explain a positive with normal physical data.

Step 5 — Conclude and disposition.

- BI handling error proven (contaminant identified, controls or technique failure documented): the cycle itself may stand on physical data, but the repeat BI run is required; document the rationale. QA dispositions the load.
- Cycle failure confirmed or not excluded: reject the load. Restrain affected product. If product already left quarantine, escalate immediately per your recall/field-action procedure.
- Cause undetermined: treat as a failure. Do not release on ambiguity.

### 7.3 Product impact assessment

- Identify every load item and every downstream batch the load fed (media, equipment, components, product contact parts). The quarantine boundary is everything the suspect load touched.
- Determine whether the items were already used. A sterilization failure discovered after use means assessing every batch made with those items — QA owns this assessment, with the investigation record attached.
- Check whether other loads ran on the same sterilizer between the suspect run and discovery; each needs review against its own physical and BI data.
- Resterilization is acceptable for hard goods only if the items tolerate a second cycle and your SOP permits it; media and product are normally discarded. Document the disposition per item type.

### 7.4 Requalification triggers

Requalify the sterilizer/cycle (or at minimum run consecutive successful BI challenges per your SOP — define the number in advance, typical example: three consecutive passing runs) when:

- A cycle failure is confirmed and root cause corrected (repair, utility fix, re-tuning).
- The sterilizer underwent maintenance affecting the chamber, steam path, traps, valves, vacuum system, or controls.
- The load pattern, packaging, or cycle parameters changed.
- An investigation could not exclude cycle failure.

## 8. D-value verification — method overview

D-value is the exposure time (or dose) at specified conditions that reduces the spore population by 90% (one log). Two established approaches, both described in USP <55>:

- Survivor curve (direct enumeration) method: expose replicate carriers to graded exposure times, recover and plate-count survivors, plot log survivors vs exposure time, and take the D-value from the slope of the linear portion. Conceptually simple; requires counts across at least several logs of kill and a resistometer (BIER vessel) for steam conditions.
- Fraction-negative method (e.g., the Limited Spearman-Karber method): expose groups of replicate carriers at bracketing exposure times chosen so lower exposures give all-positive and higher exposures give all-negative growth, then compute the D-value statistically from the fraction of negatives at each exposure. No plate counting; it is the practical method for most labs and for CoA verification.
- Verify against acceptance criteria: the measured D-value and population must fall within the tolerances of ISO 11138-1 / USP <55> relative to the label (commonly applied tolerance: D-value within 20% of labeled — confirm against the current compendial text and your SOP).
- Steam D-value work requires a BIER vessel capable of square-wave exposure profiles. Without one, contract the test; do not improvise with a production autoclave — its come-up and exhaust transients make the exposure time undefined.

## 9. Documentation and records

- The BI Run Log (this pack's CSV) is the primary record: one row per BI or control per run, completed in real time. Never back-fill.
- File the CoA for every BI lot used, with the receiving/review record (Section 3.2) and verification status.
- Attach the cycle physical printout (or its reference) to the run record; the run log row and the printout must be traceable to each other via the Run ID.
- Every unexpected result links to a deviation reference. A positive BI with no deviation number is itself a finding.
- Retention: keep BI records with the sterilization batch records for the product retention period per your site retention SOP and applicable GMP expectations.
- The run log is a GMP record: date/time entries are real, corrections are single-line with initials and reason, and no fields are left blank (enter N/A where not applicable).

## 10. Inspector expectations and common findings

What an inspector will ask:

- Show me the CoA and receiving record for the BI lot used in run ______. How did you accept its D-value and population?
- How did you choose the BI placement location? (Answer must point to the thermal mapping report.)
- Show me a run with a positive control failure and what you did.
- Show me your last positive BI investigation: the deviation, the subculture/identification, the physical data review, and the disposition rationale.
- Who incubates and reads BIs, and how are they trained? Where is the incubation temperature record?
- How do you trend BI performance and sterilizer failures?

Common findings to pre-empt:

- BIs used past expiry, or stored at room temperature against a refrigerated label.
- No positive control, or a failed positive control ignored.
- Routine BI placed wherever convenient instead of the validated worst-case location.
- No link between a positive BI result and a deviation record.
- Cycle physical data never reviewed alongside BI results.
- CoAs filed without any review record — no evidence anyone read them.
- Incubator temperature excursions with no impact assessment.

## 11. Worked example: routine autoclave positive BI (fictional)

Scenario: Site QC microbiology lab runs gravity autoclave ST-02, cycle G-121 (121.1 °C, 20 min exposure) to sterilize wrapped glassware and media-prep tubing. Routine monitoring uses one SCBI (G. stearothermophilus, lot GS-4471, D121 1.9 min, population 2.3 x 10^6) at the validated cold spot — the center of the densest wrapped tubing coil — plus an unexposed positive control and a media negative control per run.

Day 0, 09:10: Analyst Tran loads the run, places the BI at the mapped location, starts cycle G-121, and logs run ST02-2026-0312 in the BI Run Log. Cycle completes; printout shows 121.0–121.4 °C for 20.0 min, F0 21.3. BIs recovered at 10:05, SCBIs activated, incubated at 56 °C.

Day 1, 08:30: Daily read. Exposed BI: no growth. Positive control: growth. Negative control: no growth. So far, normal.

Day 3, 08:35: Exposed BI shows turbidity and color change — growth positive. Tran immediately notifies the lab supervisor and QA, quarantines the Day-0 load (still in quarantine pending the 7-day read — the monitoring program holds loads until final BI read), retains all units, and opens deviation DEV-2026-041.

Investigation:

1. Subculture from the positive SCBI grows Gram-positive rod, catalase-positive, identified as G. stearothermophilus — the BI organism. A handling-contamination explanation is now unlikely.
2. Controls review: positive control grew, negative control clean, incubator 55–57 °C throughout, recovery within hold time, technique unremarkable. Handling is excluded.
3. Physical data review: printout shows an unremarkable temperature profile — but the supervisor notices the come-up time was 14 min versus the validated 9 min typical for this load. Pulling the utility log shows a site steam-header pressure dip that morning during another sterilizer's run.
4. Load review: the load matched the validated pattern.

Conclusion: extended come-up from the steam-supply excursion produced slow air removal and a non-lethal condition at the cold spot despite a passing exposure phase. Root cause: utility event, not equipment defect. Corrective actions: stagger sterilizer start times (scheduling control added), add a come-up-time limit alarm review to the cycle acceptance criteria, and run three consecutive passing BI challenge runs before ST-02 returns to routine service. The Day-0 load is rejected and resterilized after return-to-service. Run log row ST02-2026-0312 carries disposition "Load rejected — DEV-2026-041" and the deviation reference. The investigation, subculture record, utility log extract, and printout are filed with the deviation and referenced in the batch record.

Lessons the example illustrates: the 7-day read period is why quarantine-until-read programs exist; organism identification from the positive unit is the single fastest discriminator between handling error and real failure; and "physical data passed" can still hide a come-up anomaly — review the whole profile, not just the exposure-phase numbers.

## Quick-reference: BI workflow checklist (print)

- [ ] BI specification approved (organism, D-value, population, format) — Section 2
- [ ] Lot received, CoA reviewed, verification status current — Section 3
- [ ] Storage compliant; lot within expiry — Section 3
- [ ] Placement per validated map; load pattern confirmed — Sections 4–5
- [ ] Run ID assigned; log opened before cycle start — Section 5
- [ ] Physical cycle data recorded and reviewed — Sections 4, 7
- [ ] Positive and negative controls included — Section 5
- [ ] Recovery within hold time; correct incubation conditions — Section 6
- [ ] Controls valid; results read and recorded — Section 6
- [ ] Any positive: quarantine, deviation, decision tree — Section 7
- [ ] Disposition and requalification decision documented — Section 7
- [ ] Records complete: log, CoA, printout, deviation links — Section 9

## Sign-off

Prepared by (Name / Role): ______________________

Signature / Date: ______________________

Reviewed by QA (Name): ______________________

Signature / Date: ______________________

## Revision and ownership

- Version: ______________________
- Effective date: ______________________
- Document owner (role): ______________________
- Review cycle: ______________________
- Supersedes: ______________________

References: ISO 11138-1/-2/-3/-4 and ISO 11138-7; USP <55>; USP <1229>; ISO 17665; ISO 11135; PDA TR 1; PDA TR 51; EU GMP Annex 1 (2022). Verify current editions before use.
