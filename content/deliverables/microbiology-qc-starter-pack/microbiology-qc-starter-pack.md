# Microbiology QC Starter Guide

Your working handbook for the first 90 days as a QC microbiology analyst in a GMP
facility. It explains what your lab actually does, walks the core compendial tests
bench-deep, and gives you the documentation habits, failure modes, and learning
roadmap that separate a qualified analyst from a supervised trainee.

**IMPORTANT — READ FIRST.** This guide is an educational and training template. It
is not a validated method, not QA-approved, and not regulatory advice. Always verify
every step against your approved site SOPs, the current editions of the compendia
(USP, Ph. Eur., JP), and your site quality system. Where this guide gives numbers,
they come from the harmonized compendial chapters; where a limit or acceptance
criterion is product- or site-specific, you will find a fill-in blank and a clearly
labeled industry example. Never perform GMP testing from this document alone.

---

## 1. Welcome: what a QC microbiology lab actually does

### 1.1 The lab's job in one sentence

A QC microbiology laboratory demonstrates, with documented evidence, that the
facility, its water, its raw materials, its environment, and its products are under
microbiological control — and it says so before anything is released to a patient.

### 1.2 Where you fit: the five workstreams

- **Release testing.** Microbial limits (USP <61>/<62>, Ph. Eur. 2.6.12/2.6.13) for
  non-sterile products; sterility testing (USP <71>, Ph. Eur. 2.6.1) for sterile
  products. Nothing ships without your result.
- **Environmental monitoring (EM).** Viable air, surface, and personnel sampling of
  cleanrooms to prove the contamination control strategy is working. See the Atlas
  Pro Environmental Monitoring Checklist.
- **Water testing.** Routine microbial monitoring of Purified Water and Water for
  Injection against pharmacopeial expectations (USP <1231>, Ph. Eur. 0008/0169).
- **Media and culture control.** Growth promotion testing (GPT) of every media lot
  before use, plus control of reference cultures and biological indicators.
- **Validations and suitability.** Method suitability (neutralization validation),
  disinfectant qualification, container-closure integrity support, and periodic
  requalification — the work that proves the tests themselves are trustworthy.

### 1.3 The regulatory landscape in plain language

- **USP <61> / Ph. Eur. 2.6.12** — how to count total aerobic microbes (TAMC) and
  total yeasts and molds (TYMC) in non-sterile products. Harmonized chapters.
- **USP <62> / Ph. Eur. 2.6.13** — how to test for specified (named) organisms that
  must be absent, such as E. coli and Salmonella. Harmonized.
- **USP <60>** — Burkholderia cepacia complex testing for aqueous non-sterile
  products; written after fatal recalls of contaminated oral liquids and sprays.
- **USP <71> / Ph. Eur. 2.6.1** — the sterility test for sterile products.
- **USP <1111> / Ph. Eur. 5.1.4** — acceptance criteria for non-sterile products
  (the numbers your specifications come from).
- **USP <1231>** — pharmaceutical water: how it is made, monitored, and controlled.
- **EU GMP Annex 1 (2022 revision)** — the EU rulebook for sterile manufacture;
  drives EM programs, media fills, aseptic behavior, and the Contamination Control
  Strategy. FDA expects equivalent control under 21 CFR 211.
- **FDA guidance on OOS results (2006, updated 2022)** — how to investigate an
  out-of-specification result without retesting your way to a pass.
- **MHRA GXP Data Integrity Guidance (2018)** and **FDA data integrity Q&A (2018)** —
  the ALCOA+ expectations behind every entry you make.
- **ICH Q7/Q9/Q10** — GMP for APIs, quality risk management, and the pharmaceutical
  quality system that your lab operates inside.

## 2. The core test battery, bench-deep

### 2.1 Microbial enumeration: TAMC and TYMC per USP <61>

**What it answers.** How many viable aerobic bacteria (TAMC) and how many yeasts and
molds (TYMC) are present per gram or millilitre of product.

**Sample preparation.** Unless the product is already soluble, prepare a 1:10
dilution: 10 g or 10 mL of product into 90 mL (or proportional volumes) of a
suitable diluent — typically pH 7.0 buffered sodium chloride-peptone solution, or
Soybean-Casein Digest Broth (TSB) when growth support during prep is wanted. Dissolve,
disperse, or emulsify as the product demands: gentle warming not above 45 °C, minimal
time at temperature, and start plating within the SOP's hold-time limit (commonly
2 hours; use your SOP: ______________________).

**The four plating methods.**

- **Membrane filtration** — preferred for aqueous or filterable products. Filter the
  sample (typically the equivalent of 1 g/1 mL, or 10 mL of the 1:10 dilution) through
  a membrane with nominal pore size not greater than 0.45 µm, rinse as validated to
  remove antimicrobial residues, transfer the membrane to the agar surface. Best
  sensitivity because you can test a large volume and wash away inhibitors.
- **Pour plate** — 1 mL of the prepared sample into a 9 cm Petri dish (or 2 mL into a
  15 cm dish), add molten agar cooled to not more than 45 °C (typically 15–20 mL per
  9 cm plate), mix, allow to solidify. Simple, but dilutes colonies into the agar
  depth and is limited to small inoculum volumes.
- **Spread plate** — spread 0.1 mL per 9 cm plate (or 0.5 mL on 15 cm) onto the dried
  agar surface with a sterile spreader. All colonies grow on the surface — easiest to
  count and pick — but the small inoculum raises the limit of quantification.
- **Most Probable Number (MPN)** — serial tenfold dilutions inoculated into broth
  tubes in replicate; the count is read statistically from the pattern of growth.
  The least precise method, reserved for products where no plating method works.

**Neutralization of antimicrobial activity.** If the product kills or inhibits the
organisms you are trying to count, your result is a false negative. Remove the
activity by one or more of: dilution (the inhibitor falls below its active
concentration), membrane filtration with rinsing (the inhibitor washes through), or
chemical neutralizers added to the diluent or medium — classic examples: polysorbate
80 and lecithin for quaternary ammonium compounds and preservatives, sodium
thiosulfate for halogens, beta-lactamases for beta-lactam antibiotics. The
neutralization scheme is not improvised at the bench; it comes from your validated
method suitability (Section 4).

**Incubation.**

- TAMC: Soybean-Casein Digest Agar (SCDA/TSA), 30–35 °C, 3–5 days.
- TYMC: Sabouraud Dextrose Agar (SDA), 20–25 °C, 5–7 days.
- Membrane filtration uses the same media and conditions.

**Counting rules.** Select plates within the countable range — classically 30–300
cfu for bacteria on a standard plate (up to ~300 for fungi, lower for spread plates);
below the range the count is statistically weak, above it colonies merge and
compete. Calculate the cfu per gram or millilitre by multiplying the colony count by
the dilution factor and dividing by the plated volume. If no plate falls in range,
report against the dilution actually used: for example, if the 1:10 dilution plate
shows zero growth, report the result as less than the limit of quantification for
that dilution (e.g. "<10 cfu/g"), never as "zero organisms". Record plates read,
colonies counted, and the arithmetic — an auditor will re-do your math.

**Reading the result against the specification.** USP <1111> interprets the
harmonized acceptance criteria: 10^1 cfu means a maximum acceptable count of 20,
10^2 means 200, 10^3 means 2000. So a limit of 100 cfu/g (10^2) is not failed until
the count exceeds 200. Know this before you call anything OOS.

### 2.2 Specified organisms per USP <62>

Each test follows the same logic: enrich in a non-selective broth so injured cells
recover, then streak onto selective/differential agar, then confirm suspect colonies
with biochemical or serological tests. Test quantity is typically 1 g or 1 mL (10 g
or 10 mL for some organisms and categories — check the chapter and your monograph).

**Escherichia coli.** Enrich the 1:10 TSB preparation at 30–35 °C, subculture onto
MacConkey agar (lactose fermenters give pink-red colonies), then confirm: Gram
stain (Gram-negative rods), oxidase negative, and indole production from tryptophan
broth. Growth of Gram-negative, indole-positive, lactose-fermenting rods indicates
E. coli.

**Staphylococcus aureus.** Enrich in TSB, streak onto Mannitol Salt Agar (mannitol
fermentation gives yellow zones around colonies) or Baird-Parker-type media per your
SOP; confirm with the coagulase test (plasma clotting) — coagulase-positive,
Gram-positive cocci in clusters indicate S. aureus.

**Pseudomonas aeruginosa.** Enrich in TSB, streak onto Cetrimide Agar (selective for
pseudomonads; P. aeruginosa often shows greenish pigment); confirm with the oxidase
test (positive) and growth at 42 °C where the SOP requires it. Oxidase-positive,
Gram-negative rods on cetrimide indicate P. aeruginosa.

**Salmonella.** Enrich 10 g/10 mL of product in TSB (or the volume directed), then
subculture into Rappaport Vassiliadis Salmonella enrichment broth, then onto Xylose
Lysine Deoxycholate (XLD) agar — Salmonella typically gives red colonies with black
centers (H2S production). Confirm with the biochemical pattern on triple sugar iron
agar and urease negativity per the chapter.

**Bile-tolerant Gram-negative bacteria.** Enrich the 1:10 sample in Enterobacteria
Enrichment Broth Mossel at 30–35 °C, then subculture onto Violet Red Bile Glucose
Agar (VRBGA). Growth of Gram-negative rods indicates bile-tolerant Gram-negative
bacteria; the chapter also defines a quantitative version of this test for products
with a numeric specification.

**Candida albicans.** Enrich in Sabouraud Dextrose Broth at 30–35 °C, streak onto
Sabouraud Dextrose Agar; growth of white colonies may indicate C. albicans. Confirm
per current compendial identification requirements (e.g. growth on chromogenic
Candida agar or a validated identification method).

### 2.3 Burkholderia cepacia complex per USP <60>

**Why it exists.** B. cepacia complex (BCC) organisms are water-loving, preservative-
tolerant Gram-negative rods that have caused fatal outbreaks through contaminated
aqueous non-sterile products — oral liquids, nasal sprays, and similar. USP <60>
applies to aqueous non-sterile products, especially inhaled and oral dosage forms;
your product monograph or risk assessment decides whether it applies.

**The test in outline.** Enrich 10 mL of product (or the 1:10 preparation) in TSB at
30–35 °C, subculture onto Burkholderia Cepacia Selective Agar (BCSA) — a selective
medium containing crystal violet, polymyxin, gentamicin, and other agents that
suppress the background flora — incubate at 30–35 °C and examine for the characteristic
colony types. Confirm suspect colonies by a suitable identification method (biochemical
panels, MALDI-TOF, or genotypic ID per your SOP). Suitability of the method must be
demonstrated with a BCC strain such as B. cepacia ATCC 25416 or current compendial
equivalent — use your culture collection SOP for the exact strain set.

## 3. Sterility testing per USP <71>: the working overview

### 3.1 What it is — and is not

The sterility test is a qualitative growth test: if anything viable was in the
sampled units, it grows in 14 days and you see turbidity. It samples a tiny fraction
of the batch, so a "pass" is weak statistical evidence — sterility is assured by the
validated process, not by this test. Treat it with the respect that statement implies:
one lapse of aseptic technique creates a false positive that triggers a major
investigation.

### 3.2 The two methods

- **Membrane filtration** — the method of choice whenever the product is filterable.
  Filter each unit's contents through a membrane not greater than 0.45 µm in a closed
  system, rinse with the validated volume of rinsing fluid (to remove antimicrobial
  residues), then immerse one membrane half (or one canister) in Fluid Thioglycollate
  Medium (FTM) and one in Soybean-Casein Digest Medium (SCD/TSB).
- **Direct inoculation** — for products that cannot be filtered (oils, suspensions,
  ointments, some devices). Transfer the product directly into FTM and SCD; the
  product volume must not exceed 10% of the medium volume unless validated otherwise,
  and antimicrobial activity must still be neutralized.

### 3.3 Media, incubation, and reading

- **FTM**, 30–35 °C: supports anaerobic and aerobic bacteria; the resazurin (oxygen)
  indicator layer tells you the anaerobic zone is intact.
- **SCD (TSB)**, 20–25 °C: supports aerobic bacteria and fungi.
- **Incubation: 14 days minimum.** Read the containers at intervals per your SOP
  (commonly several documented reads across the 14 days) and at the end. Turbidity,
  pellicles, flocculent growth = suspect; proceed to the investigation path, never
  to quiet disposal.

### 3.4 Growth promotion and method suitability (bacteriostasis/fungistasis)

Every media lot must pass GPT with low inocula (not more than 100 cfu) of the
compendial challenge panel before or concurrent with use. The stasis test proves the
product does not inhibit recovery: inoculate the product-plus-medium combination
with not more than 100 cfu of each challenge organism and show growth comparable to
a product-free control. No growth means your test would miss real contamination —
the method fails suitability until neutralization, dilution, or extra rinsing fixes it.

### 3.5 Aseptic technique essentials for sterility work

- Work in the classified environment your SOP specifies (typically a Grade A zone,
  isolator, or RABS) with unidirectional airflow never blocked by hands or objects.
- Disinfect every item before it crosses into the critical zone; respect contact times.
- Move slowly and deliberately; never reach over open containers; keep critical
  surfaces in first air.
- Controls every run: negative (medium/rinse) controls as the SOP requires, plus
  media GPT records on file.

## 4. Method suitability and verification: proving the test works

### 4.1 The question you must answer

"Would this test detect the organisms if they were actually there?" Method suitability
(USP <61>/<62>) — historically called preparatory testing — answers it, once per
product formulation (and again after any relevant change).

### 4.2 How it runs

1. Prepare the product exactly as in the routine method, including every
   neutralization step (dilution, membrane filtration and rinsing, chemical
   neutralizers).
2. Spike the final preparation (and a product-free control) with not more than
   100 cfu of each compendial challenge organism (e.g. S. aureus, P. aeruginosa,
   B. subtilis, C. albicans, A. brasiliensis for <61>; the relevant species for <62>).
3. Run the full routine procedure on both.
4. Acceptance: recovery in the presence of product must be within **50–200%** of the
   inoculum (per the harmonized chapters). For <62>, the specified organism must be
   recovered from the spiked product.

### 4.3 If recovery fails

- Increase dilution, add rinse cycles, add or raise neutralizer concentration, or
  switch method (e.g. pour plate to membrane filtration) — one variable at a time,
  documented.
- Record every attempt. A failed suitability is useful evidence, not an embarrassment.

### 4.4 Documenting the method

Your site method document must capture: product and formulation details, sample
preparation, neutralization scheme and its rationale, challenge organisms and strain
sources, inoculum verification counts, recovery data per organism, acceptance against
the 50–200% criterion, approval signatures, and a re-verification trigger list
(formulation change, preservative change, supplier change of key ingredients).

Method suitability record (fill in):

1. Product / formulation code: ______________________
2. Method (filtration / pour / spread / MPN): ______________________
3. Neutralization scheme: ______________________
4. Challenge organisms and ATCC/equivalent strains: ______________________
5. Inoculum counts (cfu) verified: ______________________
6. Recovery per organism (%): ______________________
7. Meets 50–200% criterion? [ ] Yes [ ] No — deviation ref: ______________________
8. Analyst: ______________________  Date: ______________________
9. Reviewed by (QA): ______________________  Date: ______________________

## 5. Water, raw materials, and environmental monitoring

### 5.1 Pharmaceutical water testing

- **What you sample:** Purified Water (PW) and Water for Injection (WFI) points of
  use, on a rotating schedule that covers every point within your SOP's cycle.
- **How:** Sample aseptically (flush per SOP, flame or sanitize the outlet as
  directed, sterile container, test within the validated hold time — commonly a few
  hours; your SOP: ______________________). Test by membrane filtration (typically
  100 mL) onto a low-nutrient medium such as R2A agar, incubated at 30–35 °C for at
  least 5 days — or the validated alternative your site uses. Heterotrophic plate
  counts, not selective pathogen hunts, are the routine measure.
- **Limits:** Site alert and action levels are derived from trend data and capability,
  not copied from a book. Common industry starting points (EXAMPLES ONLY — your site
  levels rule): action levels around 100 cfu/mL for PW and 10 cfu/100 mL for WFI.
  Fill in your site's levels here: PW alert ______ cfu/mL, PW action ______ cfu/mL;
  WFI alert ______ cfu/100 mL, WFI action ______ cfu/100 mL.
- **Reference:** USP <1231> is the design-and-control chapter; chemical attributes
  are covered elsewhere. Excursions always require organism identification at action
  level, and usually at alert.

### 5.2 Bioburden of raw materials and components

- Non-sterile raw materials carry a flora that reflects their origin (botanicals
  high, synthetics low). Test incoming materials per the microbial limits methods
  of Section 2, against specifications justified by the product they feed.
- Trend by supplier and lot; a rising trend in one excipient is an early warning
  for your finished product.
- For sterile manufacturing, pre-sterilization bioburden of the bulk product and of
  components is a release-relevant control: it sizes the sterilization challenge.

### 5.3 Environmental monitoring basics

- You sample viable air (active air samplers, settle plates), surfaces (contact
  plates, swabs), and personnel (glove fingertips, gown plates) at defined grades
  and frequencies.
- Results are judged against grade-specific limits (EU GMP Annex 1 2022 Table for
  Grades A–D) and, more importantly, against your own trends.
- Excursions: identify the organism, assess product impact, review the batch record
  and aseptic behavior for that session.
- This guide does not duplicate the program: use the **Atlas Pro Environmental
  Monitoring Checklist** for the full sampling matrix, limits, and excursion workflow.

## 6. Aseptic technique and laboratory disciplines

### 6.1 Biosafety cabinet vs laminar flow hood — know your box

- **Laminar flow (clean bench):** blows filtered air across the work surface toward
  you. Protects the PRODUCT, not you. Never use it for handling unknown or
  potentially pathogenic cultures.
- **Biosafety cabinet (Class II):** draws air away from you through HEPA-filtered
  airflow. Protects you AND the product. Required for culture handling, identifications,
  and anything that could aerosolize organisms.
- Rule of thumb: product protection under a clean bench in a classified room;
  personnel protection in a BSC. Your SOP defines which — never improvise.

### 6.2 Disinfection and sporicides

- Know your site's rotation: a routine disinfectant (e.g. 70% alcohol or a
  quaternary ammonium/phenolic agent) plus a periodic SPORICIDE, because routine
  agents do not kill spores.
- Contact time is the active ingredient. Spraying and immediately wiping achieves
  nothing; record the applied time.
- Example rotation pattern (EXAMPLE ONLY): routine alcohol between operations,
  broad-spectrum disinfectant daily, sporicidal agent weekly/monthly per the
  qualified program. Your qualified program: ______________________.

### 6.3 Plate handling and labeling discipline

- Label the PLATE (base), not only the lid — lids get swapped. Minimum: sample ID,
  dilution, media, date, analyst initials.
- Stack and store plates inverted (lid down) so condensation does not drip onto the
  agar surface.
- Let plates come to room temperature before inoculation; dry condensation from lids.
- Handle one sample's set of plates at a time; clear the bench between samples.

### 6.4 Incubator discipline

- Incubators are qualified and mapped (temperature mapping shows the hot/cold spots);
  load plates so airflow is not blocked.
- Record actual temperatures daily (or confirm continuous monitoring) — with the
  real value, not the setpoint. A plate incubated at the wrong temperature for days
  is compromised data.
- One organism group per stated temperature range; do not park fungi plates at 35 °C
  "because there was space".

## 7. Documentation habits that keep you audit-safe

### 7.1 The principles

- **Contemporaneous recording:** write it down when you do it, not at the end of the
  shift. Backdating is a data integrity finding.
- **ALCOA+** (per MHRA GXP and FDA data integrity guidance): every record is
  Attributable, Legible, Contemporaneous, Original, Accurate — plus Complete,
  Consistent, Enduring, and Available.
- **Error correction:** single line through the error, initial, date, and reason
  where the reason is not obvious. Never overwrite, never use correction fluid,
  never discard the "wrong" page.
- **Plate reading records:** record the raw count per plate, the dilution, the
  calculation, and the final reported result. Photograph or retain plates per your
  SOP where second review is expected.
- **Second-person verification:** your SOP defines where it is required (commonly
  sterility test observations, OOS-adjacent counts, critical calculations). When
  required, it is a real independent check, not a courtesy initial.

### 7.2 What an inspector will ask you

- "Show me how you recorded this result from plate to report." (Raw data traceability.)
- "This incubator log shows 36.8 °C on a 30–35 °C test — what happened?" (Excursion handling.)
- "Who trained you on this method, and where is the record?" (Qualification evidence.)
- "This plate count was crossed out and changed — why?" (Error correction practice.)
- "Show me the media lot and its growth promotion record." (Media control chain.)
- Answer from the record, not from memory. If you do not know, say so and find the
  record — never guess in an inspection.

## 8. Growth promotion and media QC basics

- **Every lot, before use:** each batch of prepared medium (in-house or purchased,
  per your SOP's incoming-control policy) must demonstrate growth promotion with not
  more than 100 cfu of the compendial challenge organisms relevant to that medium's
  purpose. Inoculate, incubate per the medium's specified conditions, and compare
  against a previously approved (control) batch or defined acceptance criteria.
- **Also on the lot record:** pH check, sterility of the medium itself (an
  uninoculated portion incubated shows no growth), physical appearance, fill volume,
  and container integrity.
- **Storage and expiry:** store media as qualified; honor both the manufacturer's
  expiry and your in-house prepared-media expiry — whichever applies first. An
  expired plate is a deviation, not a judgment call.
- **Full workflow:** use the **Atlas Pro Culture Media Selection Guide** for medium
  selection logic, GPT panels, and acceptance criteria.

## 9. Ten beginner mistakes with real consequences

1. **Wrong dilution math.** Plating 1:100 and calculating as 1:10 understates the
   count tenfold. Consequence: a failing product reported as passing. Prevention:
   say the dilution aloud, write it on the plate, and have your calculation verified
   until qualified.
2. **Unlabeled or lid-only labels.** Lids swap; unlabeled plates are untraceable and
   the result is void. Prevention: label the base before inoculation, one sample at
   a time.
3. **Reading plates too early.** Slow-growing stressed organisms and molds appear
   late; a day-2 read of a 3–5 day test misses them. Prevention: read at the
   compendial/SOP timepoints only; if you peek early, never record it as the result.
4. **Forgetting controls.** A negative control that grows invalidates the run; a
   missing negative control means you cannot prove it would not have. Prevention:
   a written run checklist — controls first, samples second.
5. **Contamination from poor aseptic technique.** Reaching over open plates, talking
   over the work, blocked first air. Consequence: false positives, investigations,
   and in sterility testing potentially a rejected batch you caused. Prevention:
   slow deliberate movements, disinfect everything, respect airflow.
6. **Mis-recording incubator temperatures.** Writing the setpoint instead of the
   actual value, or skipping the log. Consequence: weeks of results become
   indefensible when the mapping excursion is found. Prevention: read the actual
   display/LOGGER at the same time daily and record what you see.
7. **Averaging away failures.** Two plates at 40 cfu and one at 250 cfu is not "an
   average of 110, pass". Compendial rules govern which plates count; an outlier is
   investigated, not diluted. Prevention: know your SOP's counting and averaging
   rules; escalate odd plates.
8. **Neutralizer omission.** Skipping the validated neutralization step because the
   product "looks clean". Consequence: antimicrobial carryover kills the spike and
   the real flora — a systematic false negative. Prevention: the method sheet is a
   recipe; every step, every time.
9. **Expired media or reagents.** Aged plates lose moisture and selectivity; GPT may
   have passed but performance has drifted. Prevention: check expiry at pickup, not
   at plating; quarantine expired stock physically.
10. **Uncalibrated pipettes.** A micropipette 10% off corrupts every dilution and
    spike you make — invisibly. Prevention: verify calibration status before use;
    never use a pipette past its calibration due date.

## 10. Your first OOS or deviation: the first hour

Sooner or later a count exceeds action level, a negative control grows, or a
sterility test turns turbid. What you do in the first hour shapes the entire
investigation.

**Do:**

- Stop and secure the evidence: retain the plates, tubes, canisters, and raw data
  exactly as they are. Nothing goes in the autoclave.
- Notify your supervisor immediately and record the time.
- Record objectively what you observe (counts, appearance, conditions) and what you
  did, while it is fresh.
- Check the obvious context honestly: media lot and GPT status, incubator record,
  controls' behavior, your own technique notes.

**Do NOT:**

- Do not retest, re-plate, or "check again" to see if the result goes away — that is
  testing into compliance, the central violation of FDA's OOS guidance.
- Do not discard plates or tidy the bench before the evidence is secured.
- Do not average the OOS result with other data.
- Do not speculate a conclusion ("probably contamination") into the record; record
  facts, let the investigation conclude.
- Do not hide a technique error you made. Self-reported errors are handled as
  deviations; discovered cover-ups end careers.

**Then:** the formal phased investigation (lab assessment Phase I, then full-scale
if needed) follows your site procedure and FDA's OOS guidance (2006/2022). Use the
**Atlas Pro OOS Investigation Template** for the complete workflow.

## 11. Glossary: 40 terms every analyst must know

1. **cfu (colony-forming unit)** — one viable unit (cell or clump) that grows into one colony.
2. **TAMC** — Total Aerobic Microbial Count per USP <61>.
3. **TYMC** — Total Combined Yeasts and Molds Count per USP <61>.
4. **Bioburden** — the population of viable microorganisms on or in a material before sterilization.
5. **Objectionable organism** — an organism that, given the product's route and patient population, poses a risk even below numeric limits (see USP <1111>).
6. **Specified organism** — an organism a monograph requires to be absent (USP <62> panel).
7. **GPT (growth promotion test)** — challenge of each media lot with low inocula to prove it supports growth.
8. **Neutralization** — dilution, filtration, or chemical inactivation of a product's antimicrobial activity so recovery is honest.
9. **Method suitability** — the compendial demonstration that the test recovers challenge organisms in the presence of product (50–200%).
10. **Bacteriostasis/fungistasis** — the sterility-test equivalent of suitability: the product must not inhibit recovery in FTM/SCD.
11. **Membrane filtration** — capturing organisms on a ≤0.45 µm membrane so large volumes can be tested and inhibitors rinsed away.
12. **MPN (most probable number)** — statistical count from growth patterns in dilution series, used when plating fails.
13. **Enrichment** — non-selective broth growth step that revives injured cells before selective plating.
14. **Selective medium** — medium that suppresses background flora (e.g. cetrimide, MacConkey, XLD, BCSA).
15. **Differential medium** — medium on which target organisms look distinct (color, black centers, hemolysis).
16. **D-value** — decimal reduction time: exposure time at a given condition to reduce a population by 90% (one log). Core sterilization concept.
17. **Z-value** — temperature change needed to change the D-value tenfold.
18. **F0** — lethality of a moist-heat process expressed as equivalent minutes at 121.1 °C.
19. **Biological indicator (BI)** — a standardized spore preparation used to prove a sterilization cycle (see the Atlas Pro BI Workflow Checklist).
20. **Alert level** — a limit derived from trend data that signals drift; triggers attention, not automatic action.
21. **Action level** — a limit that, when exceeded, triggers documented investigation and corrective action.
22. **OOS (out of specification)** — a result outside an approved specification; starts a formal investigation.
23. **OOA / OOT** — out of action level / out of trend: early-warning categories before OOS.
24. **Deviation** — any departure from an approved procedure or expectation, documented and assessed.
25. **CAPA** — corrective and preventive action; the fix and the proof it stays fixed.
26. **Media fill (APS)** — aseptic process simulation using growth medium instead of product.
27. **First air** — the unidirectional HEPA-filtered air that reaches the critical surface first; never interrupt it.
28. **Grade A–D** — EU GMP cleanroom classifications from the most critical (A) to controlled background (D).
29. **RABS / Isolator** — restricted access barrier system / sealed glove-operated enclosure for aseptic operations.
30. **Sporicide** — an agent validated to kill bacterial spores; required in rotation because routine disinfectants do not.
31. **ALCOA+** — data integrity principles: Attributable, Legible, Contemporaneous, Original, Accurate, plus Complete, Consistent, Enduring, Available.
32. **Contemporaneous** — recorded at the time the work is done.
33. **Second-person verification** — independent check of a critical step, reading, or calculation by another qualified person.
34. **Hold time** — validated maximum time a sample or preparation may wait before testing.
35. **LOQ** — limit of quantification: the lowest count a method can report credibly; results below it are reported as "less than".
36. **Negative control** — medium/reagent processed without sample; growth invalidates the run.
37. **Positive control** — known organism processed to prove the system can detect it.
38. **Incubator mapping** — documented temperature distribution study locating hot and cold spots.
39. **TNTC** — too numerous to count: colonies merged beyond countable range; repeat at higher dilution.
40. **Trend** — results viewed over time; a passing result inside a worsening trend still demands attention.

## 12. Your learning roadmap: weeks 1–12

Work this roadmap together with the **First 90 Days Checklist (CSV)** in this pack —
every row below maps to checklist lines your trainer signs off.

- **Weeks 1–2 — Orientation.** Read this guide end to end. Walk the lab: where media
  is stored, where incubators are, where records live. Read your site's core SOPs
  (microbial limits, sterility, EM, media prep, data integrity). Evidence: SOP
  read-and-understood records.
- **Weeks 3–4 — Media and cultures.** Shadow media preparation and GPT. Learn the
  selective/differential logic of Section 2 by plating reference strains yourself
  (training plates, not GMP samples). Evidence: observed GPT run; training plate
  reads signed by your trainer.
- **Weeks 5–6 — Aseptic technique.** Formal aseptic technique training; practice
  transfers, streaking, and mock membrane filtration. Begin gowning qualification if
  you need classified-area access. Evidence: aseptic technique assessment pass.
- **Weeks 7–8 — Core tests, shadowing.** Shadow TAMC/TYMC, a specified-organism test,
  water sampling, and EM rounds. Do the dilution math yourself on every shadowed run
  and compare. Evidence: completed shadow log in the CSV.
- **Weeks 9–10 — Supervised runs and data.** Perform microbial limits and water
  tests under direct supervision with co-signed records. Learn the LIMS/notebook
  entry, trending reports, and how an excursion is documented. Evidence: co-signed
  runs; a trend report you can explain.
- **Weeks 11–12 — Qualification.** Formal method qualification/assessment on the
  tests you will own. Walk through a real (closed) deviation or OOS file with your
  supervisor to see the lifecycle. Evidence: signed qualification records.
- **What "good" looks like at 90 days:** you perform the routine tests unsupervised
  with clean documentation; you catch your own errors before review does; you know
  every control on your run sheet and why it exists; you have never backdated,
  averaged away, or quietly discarded anything; and you ask "show me the SOP" before
  you improvise.
- **Keep growing:** the **Microbiology QC Fundamentals** and **Aseptic Technique**
  learning paths in the free Life Science Atlas Academy; then the deeper Atlas Pro
  packs — Environmental Monitoring Checklist, Culture Media Selection Guide, BI
  Workflow Checklist, OOS Investigation Template, and Data Integrity Self-Check.

## 13. References

- USP <60> Burkholderia Cepacia Complex — current USP-NF edition
- USP <61> / <62> Microbiological Examination of Nonsterile Products — current USP-NF
- USP <71> Sterility Tests — current USP-NF
- USP <1111> Microbiological Examination of Nonsterile Products: Acceptance Criteria
- USP <1231> Water for Pharmaceutical Purposes
- Ph. Eur. 2.6.1, 2.6.12, 2.6.13, 5.1.4 — current Ph. Eur. edition
- EU GMP Annex 1: Manufacture of Sterile Medicinal Products (2022)
- FDA Guidance for Industry: Investigating Out-of-Specification Test Results (2006; draft revision 2022)
- FDA Data Integrity and Compliance With Drug CGMP: Questions and Answers (2018)
- MHRA GXP Data Integrity Guidance and Definitions (2018)
- ICH Q7 (GMP for APIs), ICH Q9 (Quality Risk Management), ICH Q10 (Pharmaceutical Quality System)
- ISO 14698 (biocontamination control); relevant PDA Technical Reports on EM and media fills

## 14. Document control

- Pack: Microbiology QC Starter Pack — main guide
- Version: ______________________  Effective date: ______________________
- Prepared by (Analyst): ______________________  Signature: ______________________  Date: ______________________
- Reviewed by (Trainer/Supervisor): ______________________  Signature: ______________________  Date: ______________________
- Approved by (QA, if adopted at site): ______________________  Signature: ______________________  Date: ______________________
- Revision note: review against current compendia editions and site SOPs at least
  annually, and immediately upon any relevant compendial or regulatory revision.
