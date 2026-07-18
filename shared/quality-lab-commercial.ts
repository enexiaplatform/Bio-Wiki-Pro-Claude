export const QUALITY_LAB_COMMERCIAL_TERMS = {
  responseSla: "Atlas responds within 2 business days.",
  diagnosticWorkshop: "One 60-minute stakeholder workshop.",
  diagnosticMemo: "Written scope and decision memo within 2 business days after the workshop.",
  blueprintTarget: "Target delivery within 10 business days after kickoff and receipt of complete agreed inputs.",
  blueprintDeliverables: [
    "Controlled Blueprint workbook (XLSX)",
    "Executive decision brief (PDF)",
    "Evidence, assumption and open-question register",
    "One review workshop and one consolidated revision",
  ],
  acceptance: "Written acceptance or accepted-with-actions within 5 business days of controlled delivery.",
  reviewerBoundary: "The proposal names the reviewer role and required evidence. Atlas does not imply a reviewer appointment or approval until that person is confirmed.",
  dataHandling: "Concept models remain in the browser by default. Contact and qualification context is stored when a request is submitted. A full Blueprint snapshot is stored only when an authenticated user explicitly attaches it, and can be deleted from Projects.",
} as const;

export const QUALITY_LAB_SAMPLE_BLUEPRINT_MARKDOWN = `# Atlas Quality Lab Blueprint — Illustrative sample

> Synthetic illustrative demonstration. This is not a customer result, validated design, regulatory approval, engineering specification, or supplier quotation.

## 1. Decision brief

**Illustrative context:** one ASEAN non-sterile oral solid-dose site evaluating a microbiology laboratory operating model.

**Decision being framed:** whether the concept can support the assumed release-testing demand with one staffed shift, or whether a second-shift scenario should enter detailed planning.

### Decisions this concept can support

- Compare directional workload and staffing scenarios.
- Identify which assumptions drive the largest capacity changes.
- Prioritize the evidence needed before design or procurement.

### Decisions this concept cannot support

- Final room sizing, equipment procurement, validated method transfer, biosafety classification, or regulatory approval.
- Any claim that a named expert, engineer, supplier, or authority has approved the concept.

## 2. Illustrative scenario comparison

| Measure | Baseline concept | Alternative concept | Status |
|---|---:|---:|---|
| Monthly test demand | 1,200 | 1,200 | Illustrative input |
| Planned operating shifts | 1 | 2 | Scenario assumption |
| Directional utilization | 92% | 61% | Concept calculation |
| Resilience to peak demand | Low | Moderate | Requires verification |

The alternative reduces directional utilization, but adds shift-handover, supervision, training, and sample-chain-of-custody questions. The Blueprint would not recommend a scenario until these inputs are resolved.

## 3. Evidence and assumption register

| Item | Current basis | Confidence | Required action |
|---|---|---|---|
| Monthly demand | Planning estimate | Low | Replace with 12-month sample/test history |
| Method cycle time | Generic planning range | Low | Confirm site methods and incubation rules |
| Analyst availability | Headcount assumption | Medium | Confirm leave, training and non-routine load |
| Peak factor | 1.25× concept assumption | Low | Reconcile campaign and stability schedules |

## 4. Controlled deliverables

- Blueprint workbook with inputs, assumptions, calculations, scenarios and change record.
- Executive PDF brief with decisions possible, decisions blocked, risks and next actions.
- Evidence and open-question register.
- One review workshop and one consolidated revision.

## 5. Review and acceptance boundary

The engagement proposal confirms the reviewer role, evidence required, scope exclusions, schedule and commercial terms. Delivery is accepted in writing, or accepted with documented actions, within five business days. Any engineering design, validation, procurement or regulatory reliance requires a separately qualified professional and project-specific evidence.

## 6. Version control

This public sample is illustrative only. A paid delivery includes a controlled issue date, version identifier, input freeze, revision record and acceptance status.
`;
