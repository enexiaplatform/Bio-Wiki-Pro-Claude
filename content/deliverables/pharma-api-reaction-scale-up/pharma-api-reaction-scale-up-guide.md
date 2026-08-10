# Reaction-to-scale-up decision guide

## Decision question

For a defined API process version and scale or site change, what product,
process, equipment, sampling and analytical evidence is needed before a
qualified team decides whether the next step is justified?

## Use this sequence

1. Freeze route, process version, intended use, scale/site change, decision owner
   and source versions.
2. Separate material and equipment facts from reaction/work-up hypotheses.
3. Map quench, extraction, phase split, filtration, solvent exchange, hold and
   sampling evidence without converting development knowledge into a range.
4. Record observed differences, contradictory evidence, analytical capability,
   deviations and unresolved risks.
5. Define the receiving-site questions, actions, reviewers and authorized
   decision state.

## Do-not-use boundary

Do not copy this guide into a batch record or use it to infer universal process
conditions, batch counts, impurity limits, purge factors, specifications,
validation acceptance criteria or filing conclusions.

## Minimum evidence fields

`decision_id`, `process_version`, `operation`, `material_or_equipment_basis`,
`observation`, `hypothesis`, `method_and_sample_basis`, `source_locator`,
`limitation`, `reviewer`, `action`, `decision_state`.

## Discovery questions

- Which reaction or work-up observation has a defensible link to yield, impurity fate or operability?
- What scale, heat/mass-transfer, equipment or sampling difference remains untested?
- Which evidence would change the next qualified process-development or manufacturing review?

## Controlled source map

| Source | Decision use | Boundary |
| --- | --- | --- |
| ICH-Q8-R2 | Connect process understanding to development decisions | Does not provide universal operating ranges |
| ICH-Q9-R1 | Structure risk questions | Risk priority is not an acceptance criterion |
| ICH-Q10 | Carry knowledge into lifecycle governance | Does not authorize execution |
| ICH-Q11 | Frame chemical-development and starting-material context | Does not determine a site-specific route or specification |
| FDA-PROCESS-VALIDATION-2011 | Structure lifecycle evidence | Does not prescribe a universal batch plan |

## Next handoff

Carry the evidence register into impurity/solid-state, analytical lifecycle and
validation/transfer review. Confirm current source editions, site applicability
and reviewer accountability before any process decision.
