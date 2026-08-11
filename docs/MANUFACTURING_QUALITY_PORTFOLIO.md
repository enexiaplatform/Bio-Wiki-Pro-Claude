# Manufacturing Quality Portfolio v2

This is the product-coverage source of truth for expanding Life Science Atlas beyond its initial Pharma QC Microbiology wedge. It does not override `docs/PRODUCT_SOURCE_OF_TRUTH.md`: Atlas Evidence may broaden through reviewed content and working assets, while any new Atlas Compiler Domain Pack remains demand-, evidence-, reviewer- and validation-gated.

## Portfolio boundary

The portfolio now plans across four lanes and five operating functions:

| Lane | End-to-end boundary | Current position |
| --- | --- | --- |
| Pharma API | Route and starting materials → reaction/work-up → isolation/solid state → impurity strategy → analytics/specifications → validation/stability/transfer/change | Mapped editorial-reviewed slices cover starting-material/input, process/impurity control, and analytical/specification/lifecycle evidence; qualified review and real cases remain open |
| Pharma Drug Product | Formulation/material attributes → unit operations/scale-up → performance/release → stability/container → validation/transfer/change | Four linked Decision Packages and assets are mapped and editorial-reviewed; OSD is synthetic planning context only and no dosage-form applicability is verified |
| Biopharma | Cell substrate/materials → upstream → downstream → formulation/fill-finish → analytical/product control → validation/comparability/transfer | Broad protein-biologics evidence chain is mapped and editorial-reviewed; no advanced-modality generalization |
| Cross-cutting Quality & R&D | Analytical lifecycle → statistics/data/process understanding → QRM/PQS → investigations/CAPA/change | Three asset-backed review slices now cover analytical lifecycle, decision-led statistics/process evidence and investigation/change; qualified review and real cases remain open |

Functions are explicit in the code contract: R&D, process development, manufacturing science, QC, and quality/regulatory CMC. “QC content exists” is never treated as proof that the development or manufacturing lifecycle is covered.

## Release rules

- `mapped` means an integrated lesson, Decision Package and repository-backed working asset exist. Review status is tracked separately and mapping is not approval or proof from a real engagement.
- `partial` means relevant material exists but does not yet create a complete decision package.
- `not-covered` means the product must not imply coverage.
- Every area keeps material gaps, reviewer roles, source IDs, and the next defensible asset visible.
- All four lanes have `compilerDomainPackReady=false`. Evidence content does not authorize a project-specific calculator or recommendation engine.
- No asset may supply a product-specific route, formulation, process setting, impurity limit, specification, validation conclusion, filing decision or batch disposition.

## Expansion sequence

1. Pharma API: process development, impurity fate/purge and control strategy — mapped editorial-reviewed asset delivered.
2. Pharma API: starting-material/input control — mapped editorial-reviewed asset delivered.
3. Pharma API: analytical/specification/stability/lifecycle — mapped editorial-reviewed asset delivered; real method lifecycle cases remain next.
4. Pharma Drug Product: maintain the four linked formulation–unit-operation–performance–lifecycle packages as mapped editorial-reviewed evidence, then qualify any dosage-form wedge from validated demand before adding product-specific depth.
5. Biopharma: close qualified review and real-case gaps before adding advanced modalities.
6. Cross-cutting: analytical lifecycle and decision-led statistics/process-evidence working packs delivered; close qualified review and permissioned-case gaps before promotion.

Expansion is measured by a decision package that users can apply and review, not by lesson count.

## Full-lifecycle content expansion (2026-08-10)

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
decision-led DoE/multivariate process-evidence workflow. These are
editorial-reviewed but cannot pass specialist or real-case release gates until
qualified reviewers and permissioned cases close the evidence gaps.

The six-month Atlas End-to-End Content Intelligence slice now also carries a
drug-product lifecycle hub, four Pro lessons, four repository-backed working
assets, fictional OSD examples, and review packets. The assets are linked from
public decision guides, Blueprint context and Career evidence tracks; they do
not create a Compiler recommendation or a verified Domain Pack.

The cross-cutting lane now has dedicated repository-backed working packs for
analytical lifecycle, decision-led statistics/process evidence, and the full
investigation–CAPA–change–effectiveness–knowledge-transfer loop, alongside the
existing investigation workflow and OOS working asset. All fourteen
non-advanced portfolio areas therefore have an integrated lesson/package and a
working asset. This is asset coverage only: qualified reviewers, permissioned
real cases, release gates and Domain Pack verification remain open.
