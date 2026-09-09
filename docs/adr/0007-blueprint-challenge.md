# Blueprint Challenge: deterministic review priority

Challenge composes existing Compiler unresolved inputs, bounded equipment
thresholds, sensitivity criteria and accepted current specialist engine warnings.
It does not use an LLM, change the saved model, approve applicability or create
new regulatory requirements. Stale models fail closed before ranking. Missing
specialist bases are visible coverage gaps; they do not become default site facts.

## Version 1 scoring policy

The score is a sum of review-priority points, not risk probability, confidence,
regulatory severity or a calibrated financial estimate. Stable IDs break ties.

| Source | Decision impact | Proximity | Evidence gap | Dependencies |
| --- | --- | --- | --- | --- |
| Unresolved input | Blocking 40; important 25; advisory 10 | 0 | 30 / 20 / 10 respectively | 2 per distinct linked output, capped at 10 |
| Equipment threshold | 30 | Demand margin <=5%: 30; <=20%: 20; farther: 10; undefined: 0 | 0 (not inferred) | 2 per distinct equipment class, capped at 10 |
| Sensitivity | Decision-critical 30; material 20 | Nearest threshold within first 33% of tested range: 20; other threshold: 10; absent: 0 | 20 | 2 per affected metric, capped at 10 |
| Accepted specialist warning | Critical 40; watch 25 | 0 (current warning) | 20 | 2 per distinct rule-linked output, capped at 10 |

Sensitivities classified stable-in-tested-range do not generate findings.
Portfolio-derived batch demand is excluded from aggregate-demand probing.
Current specialist warnings come from the existing turnaround, resilience,
non-routine and skill/shift engines. Operating-model application evidence blockers
map to critical review priority and its major risks to watch priority, retaining
the engine's original text and rule references. These are orchestration priority
labels, not regulatory severity. Shared rule links indicate
context rather than proof of a direct causal dependency. Findings from different
sources can overlap and are not independent risks to add together.

## Review journey and measurement

The report shows five priorities initially with an explicit expand-all action.
Each finding retains the original explanation, evidence/action requirement,
factor breakdown, model confidence and links to existing decision lineage.
Actions preserve the project when opening inputs or specialist analyses. Public
samples without an editor offer explicitly labeled personal intake.

`challenge_viewed` records a successful explicit evaluation; `challenge_action_taken`
records a review action. `decision_insight_reached` is emitted only when the user
explicitly opens Challenge and it produces at least one model-backed finding.
First-session activation is the proportion of journeys with that event among
journeys starting planner/intake, deduplicated by journey ID. It is a product
engagement measure, not proof that the user understood or validated a finding.
These events contain only the existing allowlisted stage/source metadata and
random journey/event IDs, never project facts, filenames, findings or project IDs.
Runtime persistence still depends on the separately prepared schema repair.

## Verification and remaining work

Unit coverage checks traceability, stable ties, proximity, source criteria,
stale models and accepted-versus-stale specialist bases. Browser coverage checks
desktop/mobile ranking, expanded findings, lineage presentation, project-preserving
actions, privacy-safe events and automated accessibility. Full release gates and
deployed verification remain required before claiming this slice published.
Overlapping source findings retain their separate evidence and actions; their
scores must never be summed as independent risk. Executive and Finance lenses
join QA, QC/laboratory, Engineering and Procurement over the same saved model.
Switching a lens changes presentation only. Project Impact Watch is specified in
ADR 0008; existing controlled calibration gates remain authoritative.
