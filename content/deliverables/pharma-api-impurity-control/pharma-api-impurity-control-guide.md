# Pharma API Process & Impurity Control Evidence Map — Guide

Version `1.0.0-review` · Status `under-review`

## Purpose

Build a reviewable evidence chain from a defined small-molecule API route and process version through inputs, transformations, work-up/isolation, impurity origin, stage-specific observations, analytical capability, control placement and lifecycle change.

This guide does not supply chemistry, process settings, impurity limits, purge factors, acceptable intakes, specifications, validation designs, filing positions or disposition decisions.

## The twelve-sheet workflow

1. **Quick Start** — scope, rules, required roles and fail-closed logic.
2. **Decision Brief** — freeze the drug substance, form, route/process version, sites/scales, decision, owner and market/lifecycle scope.
3. **Route & Inputs** — connect starting materials, intermediates, reagents, solvents, catalysts, processing aids and recovered materials to exact use and change sensitivity.
4. **Unit Operations** — map reactions, work-up, isolation, solid-state and handling operations to their purpose, quality relationship and evidence.
5. **Impurity Map** — separate predicted, observed and confirmed identities; record origin/pathway hypotheses and applicable impurity class.
6. **Observed Fate** — compare stage observations only when sampling, units/basis and analytical capability support comparison. The formula labels a numeric ratio `Observed only — review`; it never outputs “purged”.
7. **Analytical Evidence** — record intended use, matrix, method/version, reference/response basis, capability, validation state and limitations.
8. **Control Strategy** — compare input, process, in-process, intermediate and drug-substance controls with rationale, evidence and change triggers.
9. **Change Assessment** — preserve pre-change basis, predicted impacts, evidence plan, actual observations, validation/filing questions and implementation authority.
10. **Evidence Register** — maintain source, locator, version/date, applicability, verification, owner and limitations.
11. **Review & Actions** — assign gaps, evidence requests, decisions and review roles with due dates and closure evidence.
12. **Sources & Control** — retain package version, sources, limitations, review/sign-off block and global formula status.

## Evidence rules

- One row represents one claim, observation, control or action.
- Use stable IDs (`INP-`, `UO-`, `IMP-`, `FATE-`, `AE-`, `CTL-`, `CHG-`, `E-`, `A-`).
- Record predicted, observed and confirmed impurity identity separately.
- A non-detect must retain its reporting boundary and method capability.
- Do not compare values unless stages, sampling, basis/units and methods are comparable.
- Treat a calculated value as an observed ratio bounded by the entered data, never as a transferable purge factor.
- Every control proposal requires evidence, limitations, change triggers and an accountable owner.
- Every material gap requires an action or an explicit decision not to proceed.

## Review sequence

1. Process chemistry reviews route, inputs, mechanisms and applicability.
2. Analytical development challenges identity, sampling, method capability, response/reference basis and reporting boundary.
3. Engineering/MSAT challenges scale, equipment, mixing, transfer, isolation, drying, milling and hold applicability.
4. Toxicology/impurity safety reviews the applicable safety question; the workbook supplies no classification or acceptable intake.
5. QC and data-integrity owners review executable method and record controls.
6. Quality, validation, technology-transfer and regulatory CMC owners decide controlled use, commitments and implementation.

## Decision-state logic

`Evidence required` means required scope, evidence, comparability or ownership is missing. `Qualified review required` means the structure is complete enough to enter review. Neither status means the process, impurity or control strategy is accepted.

## Controlled sources

- `ICH-Q11` and `ICH-Q11-QA` — https://database.ich.org/sites/default/files/Q11_Guideline.pdf and https://database.ich.org/sites/default/files/Q11_Q%26As_Q%26As.pdf
- `ICH-Q3A-R2` — https://database.ich.org/sites/default/files/Q3A_R2__Guideline.pdf
- `ICH-Q3C-R9` — https://database.ich.org/sites/default/files/ICH_Q3C%28R9%29_Guideline_MinorRevision_2024_2024_Approved.pdf
- `ICH-Q3D-R2` — https://database.ich.org/sites/default/files/ICH_Q3D%28R2%29_Guideline_Step4_2022_0308.pdf
- `ICH-M7-R2` — https://database.ich.org/sites/default/files/ICH_M7%28R2%29_Guideline_Step4_2023_0216_0.pdf
- `ICH-Q6A` — https://database.ich.org/sites/default/files/Q6A%20Guideline.pdf
- `ICH-Q7` — https://database.ich.org/sites/default/files/Q7_Guideline.pdf
- `ICH-Q2-R2`, `ICH-Q14`, `ICH-Q9-R1`, `ICH-Q10` — use the current official ICH versions recorded in the Atlas source catalog.

## Applicability and limitations

The package structures evidence and review. It does not establish starting-material acceptability, supplier approval, reaction mechanism, impurity identity, analytical procedure suitability, process capability, impurity purge, impurity safety, specification, validation status, technology-transfer acceptance, regulatory acceptability, commercial authorization or batch disposition.
