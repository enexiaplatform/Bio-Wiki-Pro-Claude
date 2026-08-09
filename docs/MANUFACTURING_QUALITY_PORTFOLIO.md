# Manufacturing Quality Portfolio v1

This is the product-coverage source of truth for expanding Life Science Atlas beyond its initial Pharma QC Microbiology wedge. It does not override `docs/PRODUCT_SOURCE_OF_TRUTH.md`: Atlas Evidence may broaden through reviewed content and working assets, while any new Atlas Compiler Domain Pack remains demand-, evidence-, reviewer- and validation-gated.

## Portfolio boundary

The portfolio now plans across four lanes and five operating functions:

| Lane | End-to-end boundary | Current position |
| --- | --- | --- |
| Pharma API | Route and starting materials → reaction/work-up → isolation/solid state → impurity strategy → analytics/specifications → validation/stability/transfer/change | Controlled-under-review slices now cover starting-material/input, process/impurity control, and analytical/specification/lifecycle evidence; qualified review and real cases remain open |
| Pharma Drug Product | Formulation/material attributes → unit operations/scale-up → performance/release → stability/container → validation/transfer/change | Partial cross-cutting evidence only; formulation remains explicitly not covered |
| Biopharma | Cell substrate/materials → upstream → downstream → formulation/fill-finish → analytical/product control → validation/comparability/transfer | Broad protein-biologics evidence chain under review; no advanced-modality generalization |
| Cross-cutting Quality & R&D | Analytical lifecycle → statistics/data/process understanding → QRM/PQS → investigations/CAPA/change | Reusable foundations exist but real cases and qualified reviews remain gaps |

Functions are explicit in the code contract: R&D, process development, manufacturing science, QC, and quality/regulatory CMC. “QC content exists” is never treated as proof that the development or manufacturing lifecycle is covered.

## Release rules

- `covered-under-review` means an integrated lesson and working asset exist, not that the content is approved or proven in a real engagement.
- `partial` means relevant material exists but does not yet create a complete decision package.
- `not-covered` means the product must not imply coverage.
- Every area keeps material gaps, reviewer roles, source IDs, and the next defensible asset visible.
- All four lanes have `compilerDomainPackReady=false`. Evidence content does not authorize a project-specific calculator or recommendation engine.
- No asset may supply a product-specific route, formulation, process setting, impurity limit, specification, validation conclusion, filing decision or batch disposition.

## Expansion sequence

1. Pharma API: process development, impurity fate/purge and control strategy — controlled-under-review asset delivered.
2. Pharma API: starting-material/input control — controlled-under-review asset delivered.
3. Pharma API: analytical/specification/stability/lifecycle — controlled-under-review asset delivered; real method lifecycle cases remain next.
4. Pharma Drug Product: choose one dosage-form wedge from validated demand, then build formulation–unit-operation–performance evidence as one chain.
5. Biopharma: close qualified review and real-case gaps before adding advanced modalities.
6. Cross-cutting: analytical target profile/lifecycle and decision-led statistics/DoE.

Expansion is measured by a decision package that users can apply and review, not by lesson count.

## Full-lifecycle content expansion (2026-08-09)

The Pharma API content chain now explicitly includes reaction and work-up, scale-up
and receiving-site readiness, isolation and solid-state control, downstream bulk
material handling, process validation, routine manufacture and lifecycle change.
These are evidence and review guides, not recipes, operating ranges or approvals.

The Biopharma chain now includes a full-lifecycle product-process orchestration
capstone that connects cell substrate, materials, upstream, downstream,
formulation/fill-finish, analytics, validation, comparability, transfer and
lifecycle decisions. The capstone does not generalize protein-biologics evidence
to advanced modalities.

The next depth layer adds an API full-lifecycle drug-substance control capstone,
Biopharma potency/reference and orthogonal-characterization evidence, and a
decision-led DoE/multivariate process-evidence workflow. These remain under review
until qualified reviewers and permissioned real cases close the evidence gaps.
