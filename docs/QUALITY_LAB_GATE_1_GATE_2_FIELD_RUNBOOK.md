# Quality Lab Gate 1 and Gate 2 field execution runbook

**Status:** operational control for real external evidence

**Applies to:** founding non-sterile pharmaceutical microbiology engagements

**Active Domain Pack basis:** use the exact version displayed in Atlas at the time of each record

**System boundary:** Atlas records controlled references and working assessments. The appointing organization, customer, licensed source system, quality system, finance system and document-control system remain the systems of record.

## 1. Purpose

This runbook converts the remaining Gate 1 and Gate 2 dependencies into an executable field sequence. It does not authorize Atlas to appoint reviewers, reproduce licensed compendial text, approve a customer deliverable, publish a case, validate a Domain Pack or release a rule.

Use it to coordinate the founder, Atlas delivery owner, qualified reviewers and customer-authorized roles without turning synthetic examples or browser-local records into proof.

## 2. Non-negotiable evidence rules

1. Record references, versions, dates, roles and bounded conclusions in Atlas; do not paste confidential source content or customer data into public content, analytics or source control.
2. Keep every appointment, invoice, acceptance, qualification, source review, permission and release approval in its authorized external system of record.
3. Use the exact active Domain Pack and rule versions shown in Atlas. A complete record against an older version does not close the current gate.
4. Preserve corrections, disagreement, rejected evidence and changed scope. Do not overwrite them with a cleaner retrospective narrative.
5. Internal learning permission is not external publication permission.
6. Three cases are a working release threshold, not statistical validation, market proof or universal applicability.

## 3. Roles and accountable decisions

| Role | Accountable field decision | Evidence held outside Atlas | Atlas working surface |
|---|---|---|---|
| Founder / commercial owner | Accept engagement fit, terms and commercial evidence | Proposal, order, invoice or payment reference | Engagement workspace and Paid Pilot Portfolio |
| Atlas delivery owner | Freeze scope, control delivery, measure time/cost and preserve revisions | Kickoff record, delivery log, cost record and controlled handoff | Engagement workspace and URS/RFQ handoff |
| Microbiology Domain Pack owner | Interpret method applicability and rule boundaries | Competence and appointment evidence; source-review record | Expert Ownership and Domain Readiness |
| Quality governance reviewer | Accept evidence quality and approval boundaries | Appointment, conflict declaration and quality review record | Expert Ownership, Validation Cases and Gate 2 |
| Laboratory operations reviewer | Review workload, capacity, staffing, turnaround and resilience assumptions | Time study, operational records and review decision | Engagement calibration and operating-model review |
| Engineering / cost reviewer | Review space, utility, equipment and cost planning boundaries | Controlled estimate, quotation basis or engineering review | Engagement evidence and commercial handoff |
| Customer-authorized approver | Accept delivery and decide learning/publication permission | Acceptance record and explicit written permission | Engagement validation control |
| Gate 2 release authority | Review cross-case evidence and authorize or reject release | Version-matched release decision and approval record | Gate 2 Release Control |

One person may cover more than one role only when competence, scope, conflict and appointment evidence explicitly support it.

## 4. Evidence acquisition sequence

### Stage A — establish source and reviewer authority

**Owner:** founder plus Domain Pack owner

**Do before:** representing a deliverable as expert-reviewed or closing any source rule

1. Open `/quality-lab/domain-readiness` and export the current source registry.
2. Obtain authorized access to the current applicable USP editions and the customer-controlled specifications or methods needed for the engagement.
3. Review each open source record for edition, effective date, locator, product/market applicability, limitations and affected rule IDs.
4. Record the external review reference through the exact-version source-closure workflow. Do not reproduce licensed text.
5. Open `/quality-lab/domain-ownership` and download the ownership charter.
6. For every required role, obtain reviewer name, competence basis and evidence references, conflict declaration, accepted rule scope, external appointment reference, effective date and change-control responsibility.
7. Record the references in the working register and save an account revision. The register is evidence of capture, not the appointment itself.

**Exit evidence:** the current source corpus has no material open evidence records, and every required role has complete exact-version appointment controls.

**Stop conditions:** no licensed access; no qualified reviewer; material conflict not resolved; reviewer refuses the defined scope; or the current registered product/site basis is unavailable.

### Stage B — qualify and contract one paid pilot

**Owner:** founder / commercial owner

**Do before:** kickoff

1. Confirm the project fits the founding non-sterile microbiology scope and record exclusions.
2. Confirm the engagement-specific reviewer and competence evidence in the proposal.
3. Agree inputs, input-freeze event, deliverables, one consolidated revision, timing, payment, cancellation, data handling and five-business-day acceptance event.
4. Keep the signed proposal, order and payment evidence in the commercial system of record.
5. Create or explicitly attach the authenticated Blueprint project; open `/quality-lab/engagements/{project-id}`.
6. Record engagement class, paid status, commercial reference, service start and scope-confirmation time. Do not count a qualified-unpaid project as Gate 1 evidence.

**Exit evidence:** a paid, in-scope engagement with a controlled commercial reference, named delivery ownership and confirmed reviewer coverage.

**Stop conditions:** scope requires detailed engineering, validation, supplier selection or regulatory approval not separately contracted; reviewer coverage is absent; or the customer cannot provide an authorized input basis.

### Stage C — deliver and preserve project learning

**Owner:** Atlas delivery owner with appointed reviewers

1. Freeze the project input revision and source versions before calculation review.
2. Resolve the evidence checklist or leave every unresolved item visible with owner and due date.
3. Record material corrections with field/rule ID, previous value, corrected value, evidence reference, rationale and reviewer role.
4. Record buyer/project decisions with accountable owner, options considered, rationale and downstream impact.
5. Measure delivery effort, direct delivery cost and first controlled-delivery time from contemporaneous records.
6. Generate the controlled workbook and decision brief using a document ID, revision, intended use, prepared-by role and reviewed-by role.
7. Record external release only when the customer-controlled approval reference exists.
8. Request written acceptance or accepted-with-actions within five business days. Silence is not acceptance.

**Exit evidence:** controlled delivery, measured effort/economics, at least one inspectable correction or confirmation where applicable, buyer decision evidence and a referenced client acceptance outcome.

### Stage D — freeze estimate-to-actual calibration

**Owner:** laboratory operations reviewer and Atlas delivery owner

**Do after:** the relevant observed period ends

1. Record the observed-period start/end, data owner and controlled evidence references.
2. For each measured metric, retain the frozen estimate, observed actual, unit, actual basis, primary variance driver and reviewer interpretation.
3. Link applicable rule IDs and state whether the learning is project-only, a candidate rule update or a candidate benchmark.
4. Provide a substantive disposition rationale and qualified reviewer role.
5. Freeze the calibration observation. Review decisions must be append-only; rejection or withdrawal remains visible.
6. Use `/quality-lab/calibration` to accept or reject the observation as project evidence. Acceptance does not change executable rules.

**Exit evidence:** at least one accepted immutable observation with complete provenance and variance classification for the project.

### Stage E — close the paid-pilot record

**Owner:** founder / commercial owner

1. Complete contract value, direct delivery cost and evidence references.
2. Complete delivery dates and effort hours.
3. Record client acceptance status, time and reference.
4. Record a bounded outcome note without confidential content.
5. Open `/quality-lab/pilots` and confirm that Atlas counts the project as Gate 1 evidence-complete.
6. Export the Gate 1 registry and reconcile it to the external commercial and delivery records.

Repeat Stages B–E for three distinct real projects. Do not duplicate a project or relabel a synthetic scenario to reach the threshold.

**Gate 1 exit:** three distinct evidence-complete paid engagements, named review ownership, estimate-to-actual learning and at least one permissioned proof artifact.

### Stage F — accept validation cases and publication boundaries

**Owner:** qualified case reviewer and customer-authorized approver

For each candidate case:

1. Use the exact accepted calibration observation for that project.
2. Record a unique controlled case ID and a baseline freeze that predates the observed period.
3. State the validation question and intended learning, confidentiality class, scope alignment and qualification/source-quality references.
4. Obtain explicit permission for internal anonymized learning before using the case to assess the Domain Pack.
5. Record qualified acceptance only after the observed period and learning review are complete, with a substantive rationale, accepting role and timestamp.
6. Treat external publication separately. Record `not permitted` unless a customer-authorized role grants a defined anonymized or attributed scope in writing.
7. Open `/quality-lab/validation-cases` and confirm eligibility. Resolve duplicate project IDs, duplicate case IDs and version mismatches.

**Exit evidence:** three distinct accepted, immutable, current-version cases. Publication eligibility is optional for Gate 2 and never inferred from internal learning permission.

### Stage G — conduct the Gate 2 release review

**Owner:** appointed release authority outside Atlas

1. Open `/quality-lab/gate-2-release` and verify all four controls against the same Domain Pack version:
   - controlled source corpus;
   - qualified expert ownership;
   - controlled validation cases;
   - paid and accepted demand.
2. Export the Gate 2 dossier and reconcile every reference to the authorized external record.
3. Conduct a cross-case review covering at least the three accepted case IDs.
4. Disposition every affected rule: retain, approve a controlled change, remove/defer unsupported scope, or reject release.
5. If rules change, use `/quality-lab/rule-changes` and retain impact assessment, trigger projects, evidence, validation cases and external approval references. Do not edit executable rules silently.
6. Record a version-matched approval or rejection outside Atlas with at least two accountable roles, decision date and approval reference.
7. Only after the prerequisites and external decision are complete may Atlas record the pack as `approved-outside-atlas`.

**Gate 2 exit:** a released, versioned Microbiology Domain Pack with complete controlled evidence, explicit rule disposition, accepted cases and documented external authorization.

## 5. Minimum external evidence manifest

| Evidence object | Minimum identifier recorded in Atlas | Required control outside Atlas | Gate |
|---|---|---|---|
| Licensed source review | source ID, edition/effective date, locator, scope and review reference | Authorized current source access and qualified applicability review | Gate 2 source corpus |
| Reviewer appointment | role, name, competence references, scope, conflict, appointment reference and dates | Appointment/authorization by the responsible organization | Gate 1 and Gate 2 ownership |
| Commercial evidence | engagement class, paid status and commercial reference | Signed order, invoice/payment or equivalent controlled record | Gate 1 demand |
| Controlled delivery | document ID, revision, roles, intended use and external release reference | Customer/project document-control record | Gate 1 delivery |
| Client acceptance | status, timestamp and acceptance reference | Written acceptance or accepted-with-actions | Gate 1 demand |
| Estimate-to-actual observation | frozen estimate, actual, unit, period, basis, evidence refs and variance driver | Authorized source data and reviewer interpretation | Gate 1 calibration |
| Validation case | unique case ID, accepted observation, scope alignment, rationale, role and date | Qualified acceptance and learning permission | Gate 2 validation |
| Publication permission | permitted scope, approving role, date and evidence reference | Explicit customer-authorized written permission | Public proof only |
| Gate 2 release decision | reviewed case IDs, rule disposition, roles, date and approval reference | Cross-case decision and approval outside Atlas | Gate 2 release |

## 6. Weekly operating cadence

- **Monday — evidence readiness:** review open source, ownership and input blockers; assign owner and due date.
- **During delivery — contemporaneous capture:** record decisions, corrections, hours, costs and evidence references when they occur.
- **Delivery day — controlled handoff:** freeze revision, export deliverables and start the acceptance window.
- **Acceptance review — commercial closure:** record acceptance or non-acceptance and all remaining actions.
- **Observed-period close — calibration:** freeze actuals and submit the append-only learning review.
- **Monthly — portfolio review:** reconcile `/quality-lab/pilots`, `/quality-lab/validation-cases` and `/quality-lab/gate-2-release` to their external systems of record.

## 7. Copy-ready external requests

### Reviewer appointment evidence request

> Please confirm whether you accept the attached review scope for the stated Microbiology Domain Pack version. If accepted, provide the appointment/authorization reference, effective and expiry dates, competence basis and evidence references, conflict declaration, and the change-control responsibility you accept. This request does not ask Atlas to certify competence or create the appointment.

### Client acceptance request

> Please record one of the following outcomes for document [ID/revision]: accepted; accepted with the listed actions; or not accepted with reasons. Confirm the decision date and accountable role. Acceptance confirms receipt and the agreed project outcome only; it does not constitute regulatory, engineering, validation or site-quality approval.

### Publication-permission request

> Internal anonymized learning does not authorize publication. Please state whether publication is not permitted, permitted only as an anonymized/redacted case, or permitted with attribution. Define the allowed scope, exclusions, approving role and controlled permission reference. No case will be published without this explicit record.

## 8. Founder go/no-go review

Proceed to the next gate only when the corresponding Atlas assessment is complete and the exported registry reconciles to external records. If an evidence object is missing, contradictory, out of version, unauthorized or confidential beyond the agreed handling basis, leave the gate open and record the blocker.

Do not substitute additional pages, synthetic cases, source counts, traffic, registrations or green software tests for real commercial and validation evidence.
