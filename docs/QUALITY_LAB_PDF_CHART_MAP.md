# Quality Lab Blueprint PDF chart map

The public sample and controlled delivery use the same `qualityLabBlueprintPdf` renderer. Public figures are synthetic; paid figures come from the reviewed project snapshot. No chart introduces values that are absent from the Compiler output.

| Page | Decision question | Visual | Data fields | Reading boundary |
|---|---|---|---|---|
| Executive decision | What must the team decide next? | KPI strip + ranked actions | current scenario, readiness, recommendations | Directional planning only |
| Scenario model | What moves between baseline and future? | Paired horizontal bars | monthly tests, hands-on hours, FTE, area | Discrete scenarios, not a time-series forecast |
| Workload architecture | Which workflows create volume and labor? | Dual horizontal bars | workflow units and hands-on hours | Bars use separate scales and show exact values |
| Capability map | Which modeled capabilities still lack site evidence? | Status matrix | workflows, evidence IDs, equipment links | Presence does not mean approval or qualification |
| Equipment capacity | Which resource has the least headroom? | Utilization bars with 85/100 markers | method capacity summary | Load check to 120%; not queue simulation |
| Workforce | How is team capacity composed? | Stacked scenario bars + role bars | workforce scenarios and roles | Aggregate FTE does not prove shift coverage |
| Space | Where does functional allowance concentrate? | Area-proportional treemap | space recommendations | Functional schematic, not room geometry |
| Commercial model | What budget range and gate sequence apply? | Floating range bars + stage cards | CAPEX/OPEX ranges, procurement sequence | Planning allowances, not quotations |
| Supply resilience | Which consumables drive spend and stock exposure? | Ranked spend bars | gross demand, reorder point, safety stock, spend | Item master and supplier qualification remain open |
| Decision controls | How do risk, evidence and action relate? | KPI taxonomy + control chain | risks, gaps, actions | Zero modeled high risk does not cancel blockers |
| Evidence readiness | What prevents controlled reliance? | Readiness meter + ranked gap list | readiness score and unresolved inputs | Weighted gap indicator, not approval score |
| Decision sensitivity | Which assumptions can move the decision most, and what should be verified first? | Ranked influence bars + evidence queue | one-at-a-time driver ranges, six planning outputs, verification priority | Deterministic tested ranges, not probability, correlation or combined-driver simulation |
| Action roadmap | What work unlocks the decision? | Four-stage roadmap | blockers and recommendations | Owners/dates remain in the workbook |
| Traceability | How does an input reach an output? | Directed calculation chain + rule table | input, workflows, methods, rules, evidence | Traceability does not itself close evidence |
| Registers | What basis and assumptions are carried? | Controlled tables | evidence and assumptions | PDF is an excerpt; workbook is complete register |

Palette policy: a restrained two-root analytical palette (teal and blue) plus neutral, gold and red control states. Every status is also distinguished by label, fill/open mark or ordering so interpretation does not depend on color alone.
