# Data Integrity Self-Check (ALCOA+)

A structured, system-by-system self-assessment of your laboratory records
against ALCOA+ principles — paper, hybrid, and electronic — so you find and
fix the gaps before an inspector does.

> DISCLAIMER — EDUCATIONAL TOOL. This pack is a working template for internal
> self-assessment. It is not validated, not regulator-approved, and not legal
> or regulatory advice. Verify every checkpoint against your approved SOPs,
> your site quality system, current compendia and guidance editions, and your
> validated system configurations. Risk classifications, frequencies, and
> limits shown here are typical industry examples, clearly labeled as such —
> replace them with your own site-approved values. Nothing in this pack
> substitutes for QA review and approval.

---

## 1. Purpose, scope, and regulatory basis

Purpose: give you a repeatable method to inventory your data-generating
systems, test each one against ALCOA+, score the gaps, and drive CAPA. Use it
for periodic self-inspection, pre-inspection readiness, new-system onboarding,
or after a data-integrity signal (an OOS trend, a whistleblower, a 483 at a
sister site).

Scope: GxP laboratory records — raw data, metadata, audit trails, and the
records derived from them — across QC chemistry, microbiology, and stability
labs. Out of scope: full computer system validation (CSV) and Part 11/Annex 11
compliance certification, which are separate activities.

The regulatory basis you are checking against:

- FDA, Data Integrity and Compliance with Drug CGMP — Questions and Answers
  (Guidance for Industry, December 2018). Covers shared logins, audit trail
  review, metadata, and why printouts are not the complete raw data.
- MHRA, GxP Data Integrity Guidance and Definitions (March 2018). The source
  of most ALCOA+ working definitions and the expectation of risk-based
  audit-trail review.
- WHO, Guidance on Good Data and Record Management Practices (TRS 996,
  Annex 5, 2016). Strong on paper controls, hybrid systems, and management
  responsibility.
- PIC/S PI 041-1, Good Practices for Data Management and Integrity in
  Regulated GMP/GDP Environments (July 2021). The inspector's playbook —
  written for inspectors, so it tells you exactly how you will be audited.
- 21 CFR Part 11 and EU GMP Annex 11: electronic records and signatures,
  audit trails, access control, validation.
- EU GMP Chapter 4 (Documentation): the ALCOA expectations for all GMP
  documentation, paper and electronic.

---

## 2. ALCOA+ deep dive

For each principle below: what it means, a paper example, an electronic
example, and the self-check questions to ask. Work through every principle for
every in-scope system — the questions are phrased so a "no" is a finding.

### 2.1 Attributable

Definition: every entry and every change is traceable to the identified person
(and system) who made it, with the date/time.

- Paper example: each notebook entry signed and dated by the analyst; second
  checks countersigned; no initials without a controlled signature log.
- Electronic example: unique user accounts on the chromatography data system
  (CDS); every result, integration change, and deletion carries a user ID and
  timestamp in the audit trail.

Self-check questions:

- Can you name the person who created every entry in the sampled records?
- Does everyone — including contractors, agency staff, and administrators —
  have a unique account? Is sharing technically impossible or procedurally
  prohibited and enforced?
- Is there a current signature/initials log for paper records?
- Are generic accounts (e.g. "QC1", "Lab", "Admin") used for routine work?
- Are service-engineer accounts disabled when not in use?

### 2.2 Legible

Definition: readable and permanent for the full retention period.

- Paper example: indelible ink (no pencil), entries that do not fade,
  thermal-printer printouts protected or copied before fading.
- Electronic example: data viewable in human-readable form on demand, not
  stranded in an obsolete format; audit trails readable, not hex dumps.

Self-check questions:

- Are any entries in pencil, correction fluid, or overwritten text?
- Are thermal printouts (balances, incubators, autoclaves) checked for fading
  and transcribed or verified-copied where required?
- Can you still open and read records from retired systems?

### 2.3 Contemporaneous

Definition: recorded at the time the activity is performed, not reconstructed
later.

- Paper example: weights written into the notebook as the balance is read, not
  onto a scrap of paper first.
- Electronic example: system clock stamps the run at acquisition time; no
  "pre-dating" or "post-dating" of entries.

Self-check questions:

- Do timestamps in consecutive entries match a plausible workflow, or do they
  cluster (e.g. a week of entries written in one sitting)?
- Is scrap paper, loose sticky notes, or unofficial "rough data" tolerated?
- Do analysts record results before or after the second-person check?
- Are system clocks synchronized (see section 5.4) so "contemporaneous" is
  provable across systems?

### 2.4 Original

Definition: the first or primary capture of the data — or a certified true
copy — including all metadata needed to reconstruct the activity.

- Paper example: the bound notebook page, not a photocopy; a verified true
  copy is signed and dated as such.
- Electronic example: the electronic raw data plus metadata in the CDS — the
  printed chromatogram is a report, not the original record (see section 6).

Self-check questions:

- For each record type, have you formally defined what the original record is?
- Where true copies are used, is there a verification step (second person
  checks copy against original, signs and dates)?
- Are original electronic records retained with their metadata and audit
  trails, or only as PDF/printout?

### 2.5 Accurate

Definition: correct, complete in content, and free from undocumented error;
corrections are transparent.

- Paper example: errors corrected with a single line, initial, date, and
  reason where the reason is not obvious; the original entry remains readable.
- Electronic example: audit-trailed edits with a mandatory reason; no
  uncontrolled reprocessing; calculations verified.

Self-check questions:

- Do sampled corrections follow the error-correction rule (section 4.3)?
- Are rounding rules defined and applied consistently (section 8.5)?
- Have manual integrations and reprocessed results been verified against the
  original data?
- Are transcription checks done where data moves between systems or from
  paper to electronic?

### 2.6 Complete

Definition: nothing deleted or lost — including failed runs, aborted
sequences, retests, and all metadata.

- Paper example: all notebook pages present, numbered, and accounted for; no
  torn-out pages; voided pages marked and retained.
- Electronic example: the CDS retains trial injections, failed sequences, and
  aborted runs — they are reviewable, not deleted or hidden.

Self-check questions:

- Does the record include failed, aborted, and out-of-expectation runs?
- Is there any evidence of "testing into compliance" (unofficial runs before
  the official one — see section 8.1)?
- Are deleted-file checks possible (recycle bin, folder gaps in sequence
  numbering, CDS injection-number gaps)?
- Are blank fields in controlled forms explained rather than left empty?

### 2.7 Consistent

Definition: internally coherent — logical date/time sequence, consistent
units, formats, and conventions.

- Paper example: entries in chronological order; no back-dated entries;
  consistent date format (site standard, e.g. DD-MMM-YYYY).
- Electronic example: all systems on synchronized time; method versions and
  units consistent across instruments reporting into one specification.

Self-check questions:

- Do timestamps across systems (balance, CDS, LIMS) tell one coherent story
  for a sampled batch?
- Are date formats, units, and decimal conventions standardized?
- Are sequence injection times logical (no result saved before the run ends)?

### 2.8 Enduring

Definition: preserved on a durable medium for the entire retention period.

- Paper example: bound notebooks in a fire-protected archive, controlled
  issue and return.
- Electronic example: data on managed storage with tested backups; not on
  local C: drives, USB sticks, or the instrument PC desktop.

Self-check questions:

- Is any GMP data stored only on a local instrument PC or removable media?
- Are backup and archival arrangements documented and tested (section 5.5)?
- Is the retention schedule defined and followed for each record type?

### 2.9 Available

Definition: retrievable and readable for review, audit, and inspection for the
whole retention period.

- Paper example: a notebook requested for an inspection is produced within
  hours, not days.
- Electronic example: a five-year-old chromatogram can be re-opened, with its
  audit trail, on current hardware and software.

Self-check questions:

- Time yourself: how long to retrieve a named record from three years ago?
- Can retired-system data still be read, or is a migration/emulation plan
  needed?
- Is there an index so records can be located by batch, date, analyst, and
  instrument?

---

## 3. Scoping the self-check: system inventory and risk ranking

You cannot check everything with equal depth. Build the inventory first, then
rank it, then spend your time where the risk is.

### 3.1 System inventory template

List every system that creates, holds, or moves GxP data. One line per system:

1. System / record name: ______________________
2. Type (paper / hybrid / electronic): ______________________
3. Owner (role): ______________________
4. Data it holds (raw data, metadata, audit trail): ______________________
5. Users and admin: ______________________
6. Backup/archival arrangement: ______________________
7. Last reviewed / next review due: ______________________

Include at minimum: CDS and each chromatograph, LIMS, balances, pH meters,
spectrophotometers, incubators, environmental monitoring systems, autoclaves,
freeze dryers, stability chambers, spreadsheets used for GMP calculations,
controlled forms, bound notebooks, logbooks, and any legacy/retired system
still holding records within retention.

### 3.2 Risk ranking (example logic — set your own)

Score each system on two axes, then multiply:

- GMP impact (1–3): 3 = direct product release decision (assay, sterility,
  OOS-relevant); 2 = supporting data (cleaning verification, EM); 1 =
  indirect (training records, equipment logs).
- Data criticality (1–3): 3 = electronic raw data with reprocessing possible
  and high volume; 2 = hybrid or paper with transcription; 1 = simple paper
  records with second-person check at the point of use.

Risk = impact x criticality. Rank 9 and 6 systems first; check those audit
trails every cycle. Rank 1–2 systems can be checked on a longer cycle by
sampling. A typical example: an Empower CDS with manual integration rights =
9; a bound reagent-prep logbook = 2.

---

## 4. Paper record controls

### 4.1 Issuance and binding

- Use bound, paginated notebooks or controlled, numbered forms issued by QA
  or document control — never loose photocopies for primary records.
- Keep an issue/return log: notebook number, issued to, issue date, return
  date. Reconcile it in this self-check.
- Check for unaccounted gaps in numbering — a missing form is a finding.

### 4.2 Entry rules

- Indelible black or blue ink; no pencil, no correction fluid, no
  overwriting.
- Entries made at the time of the activity, in chronological order.
- No ditto marks that obscure what was actually verified.

### 4.3 Error correction

The rule, taught to every analyst:

1. Single line through the error — the original entry stays readable.
2. Initial and date the correction.
3. Record the reason where it is not obvious (e.g. "transcription error",
   "wrong dilution — see entry 14").
4. Never obliterate, scrape, or use correction fluid.

Self-check: sample 20 corrected entries across notebooks and forms. Count how
many are missing initial, date, or a needed reason.

### 4.4 Blank space handling

- Cross out unused space with a single diagonal line, initial, and date so
  nothing can be added later.
- Mark intentionally blank fields N/A with initials — an unexplained blank is
  treated as incomplete data.
- Voided pages: mark "VOID", reason, initial, date — the page stays in the
  notebook.

### 4.5 Second-person verification

- Define which entries need a second-person check at the point of recording:
  typically weights for standards, dilution calculations, and any manual
  transcription into a report.
- The verifier signs and dates against the specific entries checked, not a
  blanket signature on the last page.

### 4.6 Photocopies and true copies

- A photocopy used in place of an original must be verified as a true copy:
  compared against the original, then signed, dated, and marked "true copy"
  by a second person.
- Certified-copy practice matters most for thermal printouts that fade —
  copy them before legibility is lost, and retain the original alongside.

---

## 5. Electronic controls deep dive

### 5.1 Unique accounts and the shared-login prohibition

- Every person has a unique account on every GxP system. Shared or generic
  accounts for routine work are a critical finding — FDA's 2018 Q&A and every
  inspector checklist treat them as a failure of attributability.
- Administrator accounts are for administration only, held by named IT/QA
  staff, never used for routine analysis, and themselves logged.
- Service accounts are disabled except during scheduled maintenance.
- Where legacy equipment technically cannot support unique logins, apply
  compensating controls and document them: physical key control, an
  instrument logbook recording who ran what and when, and a procedural
  prohibition on unrecorded use.

### 5.2 Access privilege matrix

Document who can do what. Template (one row per role):

| Role | Create | Edit | Delete | Admin |
|------|--------|------|--------|-------|
| Analyst | Yes | Pre-approval | No | No |
| Reviewer | No | Comment only | No | No |
| QA | No | No | No | Audit cfg |
| IT admin | No | No | No | Yes |

Replace with your real roles and systems. Then verify the live system matches
the matrix — pull the actual user/privilege list from each system and compare.
Check that ex-employees and movers are de-provisioned (compare against a
current staff list).

### 5.3 Audit trail: what must be captured, and how to review it

The audit trail must capture, automatically and tamper-proof:

- Who: the unique user ID.
- What: the old value, the new value, and the record affected (e.g. a changed
  integration parameter, a deleted result, a renamed sample).
- When: date/time from the synchronized system clock.
- Why: a mandatory reason for change, entered by the user at the time.

Confirm audit trails are enabled, cannot be disabled by users, and have never
been switched off (look for gaps in the trail itself). A disabled or
switchable audit trail is a critical finding.

Audit trail review procedure (risk-based frequencies are examples — set yours
in an SOP):

- With every batch: review the audit trail for that batch's runs — injection
  list changes, integration changes, deletions, reprocessing — as part of
  routine second-person data review.
- Monthly or quarterly by risk: a system-level audit trail review sampling
  high-risk events (deletions, configuration changes, time changes, failed
  logins) across the whole CDS for release-critical systems.
- Annually: a full access, configuration, and audit-trail-integrity review
  per system, feeding this self-check.

Define in your SOP what triggers escalation: any deletion of results, any
repeated reprocessing of the same injection, any out-of-hours activity, any
admin action on production data.

### 5.4 System time synchronization

- All GxP systems synchronize to a controlled time source (e.g. site NTP).
- Check that users and local admins cannot change system time; test by
  reviewing the audit trail for clock-change events.
- Cross-check one batch across balance, CDS, and LIMS timestamps — the story
  must be coherent (section 2.7).

### 5.5 Backup, restore verification, and the archival distinction

- Backup is for recovery from failure; archival is for long-term retention in
  readable form. You need both, and they are not the same thing.
- Backups: defined schedule, off-site or segregated copy, and — the part most
  sites skip — periodic restore tests. A backup never tested is an
  assumption. Record restore-test dates and results.
- Archival: data migrated to long-term storage with its metadata and audit
  trails, in a format you can still open. Plan for readability across
  software versions.

---

## 6. Hybrid systems: the "printout is not the original record" trap

A hybrid system prints paper from electronic data (e.g. a chromatography
system where analysts sign the printed chromatogram). The trap: treating the
printout as the complete record and ignoring the electronic raw data.

The rule, per FDA 2018 and MHRA 2018: for a chromatography system, the
original record is the electronic raw data plus its metadata — the injection
sequence, method version, integration parameters, and audit trail. The
printout is a report of that data, and it is never complete: it does not show
deleted runs, reprocessed injections, or integration history.

Worked example — what this means at the bench for an HPLC assay:

1. Analyst runs the assay on Empower; electronic raw data is the record.
2. Reviewer signs the printed chromatogram AND reviews the electronic record:
   full injection list, integration events, audit trail for the sequence.
3. If review happens on paper only, you have an incomplete review — this is
   one of the most common inspection findings.

Self-check: for each hybrid system, is the original record formally defined?
Does the review procedure cover the electronic data, not just the printout?
Are printouts reconciled against the electronic injection list (same
injections, same results, nothing omitted)?

---

## 7. Spreadsheet controls

GMP calculation spreadsheets (assay calculations, trend analyses, EM counts)
are electronic records and are a classic weak spot. Requirements:

- Validation: the spreadsheet is verified before use — formulas tested
  against hand calculations or reference datasets, version identified, and
  re-verified after any change. Document the validation, even if lightweight.
- Cell locking: formula cells locked; only input cells editable. Verify the
  protection is actually on and the password is controlled.
- Version control: a version number in the file, a controlled master copy,
  and a prohibition on uncontrolled local copies ("FINAL_v7_USE_THIS_ONE.xlsx"
  on a shared drive is a finding, not a filing system).
- Access: stored on access-controlled, backed-up storage — not on desktops or
  USB sticks.
- Formula verification: periodically re-verify a sample of live files against
  the master — drift happens when users copy and edit.

Compliant-spreadsheet checklist:

- [ ] Unique validated version, with the version shown in the file
- [ ] Formula cells locked; input cells only editable
- [ ] Master copy controlled; local copies prohibited and checked for
- [ ] Validation evidence on file (tested formulas, dated)
- [ ] Stored on controlled, backed-up storage
- [ ] Audit trail of use: completed files saved read-only per batch, or used
      within a system that logs changes
- [ ] Periodic re-verification scheduled

---

## 8. Laboratory-specific hot spots

### 8.1 Reprocessing, reintegration, and trial injections

Chromatography is where data-integrity findings concentrate. The rules:

- All integration — first and every reintegration — is retained with its
  audit trail. Reintegration needs a documented, scientifically justified
  reason (reason code) selected at the time: e.g. "baseline misassigned",
  "split peak", "wrong peak identified".
- "Test injections", "trial runs", or "pre-conditioning samples" made with
  the test article to see whether the batch will pass, outside the approved
  sequence, are prohibited. This is testing into compliance. The only
  legitimate pre-run checks are system suitability with a defined standard,
  per the approved method.
- Every injection of sample or standard is part of the record — none may be
  deleted from the reviewable dataset.

Self-check: pull the injection lists for sampled sequences. Look for
unexplained injections before the official sequence, gaps in injection
numbers, and repeated reprocessing of the same injection with different
integration parameters.

### 8.2 Manual integration policy

- You need a written policy: when manual integration is permitted, who may do
  it, what reason codes are used, and how it is reviewed.
- Manual integration of standards and samples must follow the same rules;
  asymmetric practice (manually integrating failing samples but never
  standards) is a red flag inspectors look for.
- Track the manual-integration rate per analyst and per method as a metric; a
  rising rate or a single outlier analyst warrants review.

### 8.3 Trial injections beyond chromatography

The same principle applies elsewhere: unofficial plate reads before the
official reading, unofficial weigh checks that are not recorded, unofficial
EM settle-plate reads. If the measurement generates GMP-relevant data, it is
part of the record.

### 8.4 Deleted and aborted sequences

- Aborted sequences and failed runs stay in the system, reviewable, with the
  reason recorded.
- Review deletions specifically: user-level deletion rights should be off;
  admin deletions need a documented reason and QA awareness.
- Check the recycle bin and data folders of sampled instrument PCs —
  inspectors do (section 12).

### 8.5 Rounding rules

- Define rounding once, in an SOP, aligned with the compendial convention
  (compare against the full unrounded value, or round per your approved rule
  — but consistently).
- Example pattern (label as example, set your own): report assay to one
  decimal; compare against specification only after rounding per the SOP.
- Check spreadsheets and CDS custom fields implement the SOP rule — a formula
  that rounds before summing can silently change results.

### 8.6 Second analyst review of raw data

- The reviewer must see the raw data and audit trail, not just the reported
  result. Define what the review covers: injection list completeness,
  integration events, SST, calculations, transcription into the report.
- The review is documented — what was checked, by whom, when.

### 8.7 Standalone equipment with no audit trail

Balances, pH meters, incubators, older spectrophotometers: many have no user
accounts and no audit trail. Mitigation strategies, in order of preference:

1. Where the instrument supports it, enable user management and audit trail
   (often a paid firmware option — cost it).
2. Network it or attach a printer/data collector so output is captured
   contemporaneously.
3. Compensating procedural controls: unique instrument logbook, entries in
   real time, second-person verification of critical weights/readings,
   physical access control, and periodic reconciliation of printouts against
   logbooks.
4. Document the risk assessment and the chosen controls — an undocumented
   workaround reads as an unaddressed gap.

---

## 9. Behavioral and cultural checks

Technical controls fail under cultural pressure. Add these checks:

- Management pressure signals: are analysts rewarded for throughput or for
  passing rates? Have there been comments about "too many OOS results"? Is
  overtime structured so results get reported before the weekend? Anonymous
  pulse questions help: "Have you ever felt pressure to reach a result?"
- Data frequency as a leading indicator: trend OOS rate, invalid-assay rate,
  manual-integration rate, and audit-trail-event rate per analyst, per
  method, per month. A site with zero OOS results for a year is not
  necessarily healthy — it may be a reporting problem. PIC/S PI 041
  explicitly tells inspectors to look at these patterns.
- Speak-up route: confirm analysts know how to raise a data-integrity concern
  confidentially, and that QA responds.

---

## 10. Running the self-check

### 10.1 Scoring method (example — adopt or adapt)

For each checkpoint, score:

- C (Compliant): evidence available, control works.
- O (Observation): control exists but weakly implemented or poorly evidenced.
- NC (Non-conformity): control missing or failed.

Every O and NC goes into the ALCOA+ Gap Log (CSV) with a risk class
(section 11.2). Roll the scores up per system and per ALCOA+ principle — a
principle failing across many systems is a systemic CAPA, not ten local ones.

### 10.2 Sampling plan (example minimums — scale to your site)

- Per system per cycle: 3–5 completed batches/records, chosen across
  different analysts and months, including at least one OOS, deviation, or
  invalidated run if any occurred.
- Per audit-trail review: the full trail for the sampled batches, plus a
  system-level query for deletions, time changes, and out-of-hours activity.
- Paper: 10–20 pages/entries per record type, deliberately including
  corrected entries.
- Access: 100% of the user list vs. current staff list — this one is cheap
  and catches ex-employee accounts.

### 10.3 Evidence to attach

For each finding: system name, record/batch reference, screenshot or scanned
page reference (file name and where it is stored), the audit-trail extract
reference, and the name of the checker. Evidence refs go in the Gap Log.

### 10.4 Interview prompts for analysts

Ask at the bench, not in a meeting room:

- "Walk me through what happens when a result looks wrong."
- "Show me the last correction you made — how did you record it?"
- "When did you last review an audit trail? Show me."
- "Has anyone ever asked you to re-run something without recording the first
  run?"
- "If you found a colleague's error, what would you do?"

Hesitation, or answers that differ from the SOP, are findings as much as a
missing control is.

---

## 11. Findings to CAPA

### 11.1 Using the Gap Log

Log every O and NC in alcoa-gap-log.csv: finding ID, date, system/record,
ALCOA+ principle(s), description, evidence reference, risk class, root cause,
corrective action, preventive action, owner, due date, effectiveness check,
status, verified by. One row per finding; do not merge unrelated gaps to keep
the count down.

### 11.2 Risk classification (examples — align with your deviation SOP)

- Critical: data reliability is compromised for released or pending product —
  e.g. deleted results, shared logins on a release system, disabled audit
  trail, testing into compliance. Immediate containment and QA assessment of
  product impact required.
- Major: control missing or failed but product impact not yet shown — e.g. no
  audit-trail review in routine practice, unvalidated spreadsheet in use,
  ex-employee account active.
- Minor: documentation/implementation weakness — e.g. corrections missing a
  reason, blank fields not ruled through, restore test overdue.

### 11.3 Remediation patterns

- Corrective action fixes the instance (remove the shared account, verify the
  affected results, validate the spreadsheet).
- Preventive action fixes the system (unique-account policy with technical
  enforcement, audit-trail review added to the review SOP, periodic restore
  tests scheduled).
- Root cause: use a real cause analysis (5-Why, fishbone) for critical/major
  findings — "human error" is not a root cause.

### 11.4 Effectiveness checks

- Define the check when you log the CAPA, not after: e.g. "re-audit the next
  10 batches for reprocessing reasons — 100% must carry reason codes" or
  "access review next quarter shows zero orphan accounts".
- Set the check date, run it, record the result, and have QA verify closure.

---

## 12. What inspectors do

Recurring 483/warning-letter themes (from FDA, MHRA, and PIC/S findings):

- Shared passwords and generic accounts on CDS and instruments.
- Audit trails disabled, switched off by users, or never reviewed.
- Deleted files found in recycle bins and data folders on instrument PCs.
- Trial/unofficial HPLC injections before the official sequence.
- System clock changes, or clocks out of sync across systems.
- Back-dating, and "rough data" on scrap paper later transcribed.
- Original electronic data discarded; only printouts retained.
- Uncontrolled spreadsheets performing release calculations.
- Second-person review that never looks at the electronic raw data.

Interview questions inspectors actually ask analysts:

- "Do you share your password with anyone?"
- "Have you ever deleted a result? What happened?"
- "What do you do when system suitability fails?"
- "Show me how you would find the audit trail for this batch."
- "Has anyone ever asked you to change a date or re-run a sample quietly?"
- "Who reviews your raw data, and what do they look at?"

Your self-check should rehearse exactly these questions with your team.

---

## 13. Worked example: standalone HPLC with Empower

Scenario: one standalone HPLC (QC-HPLC-04) running Empower, used for assay
and related-substances release testing. Self-check performed 2026-05-12 by
the QC supervisor. Three findings (also shown as example rows in the CSV):

Finding 1 — DI-001 (Critical; Attributable, Complete). The Empower project
has one shared account "QC_Analyst" used by all six analysts; audit trail
attributes every integration change to that account, so no change is
attributable to a person. Corrective action: issue unique named accounts to
all analysts and disable the shared account. Preventive action: add
unique-account verification to the quarterly access review; procedural
prohibition on shared credentials. Effectiveness check: next quarterly access
review shows 100% named accounts; audit trail sampled for 10 batches shows
person-level attribution.

Finding 2 — DI-002 (Major; Accurate, Complete). No audit-trail review is
performed as part of second-person data review; reviewers sign printouts
only. Sampling of five assay sequences found 12 manual integrations with no
reason codes, two of them on failing related-substances results later
reprocessed to pass. Corrective action: QA reviews the two results for
product impact; manual-integration policy issued with mandatory reason
codes. Preventive action: audit-trail review added to the data-review SOP
checklist; reviewer training. Effectiveness check: next 20 sequences show
100% reason-coded integrations and documented audit-trail review.

Finding 3 — DI-003 (Minor; Enduring). Backup of the Empower project runs
nightly, but no restore test has ever been performed; backup is the only
copy. Corrective action: perform and document a restore test to an isolated
environment. Preventive action: schedule restore tests every six months with
results filed in the IT qualification record. Effectiveness check: next
scheduled restore test completed on time with verified data readability.

Lesson from the example: the scoring (9 = impact 3 x criticality 3) put this
system first in the cycle, and the findings — shared account, unreviewed
audit trail, untested backup — are the three most common real-world patterns
for standalone CDS installations.

---

## Sign-off block

Self-check performed by: ______________________

Role: ______________________

Systems covered: ______________________

Date(s): ______________________

Number of findings (Critical / Major / Minor): ______ / ______ / ______

Reviewed and approved by QA:

Name: ______________________

Signature: ______________________

Date: ______________________

## Revision and ownership

- Pack owner: Life Science Atlas — Atlas Pro deliverables.
- Adapt the example frequencies, scoring, and risk classes to your site
  deviation/CAPA SOP before first use; record local changes in your own
  controlled copy.
- References: FDA Data Integrity and Compliance with Drug CGMP Q&A (2018);
  MHRA GxP Data Integrity Guidance (2018); WHO TRS 996 Annex 5 (2016);
  PIC/S PI 041-1 (2021); 21 CFR Part 11; EU GMP Annex 11 and Chapter 4.
