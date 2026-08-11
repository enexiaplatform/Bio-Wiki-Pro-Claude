# Biopharma Product & Process Quality Coverage

> Status: working coverage map, not a claim of SME approval or Domain Pack readiness
>
> Contract: `biopharma-content-map/v2`
>
> Updated: 2026-08-11

## Direction correction

Life Science Atlas must not treat a collection of QC assays as complete Biopharma coverage. The content architecture now follows the product and process lifecycle:

```text
Intended product quality
-> cell substrate and raw materials
-> upstream process
-> downstream purification and clearance
-> drug substance, formulation, and fill-finish
-> characterization, potency, specifications, and stability
-> process validation and continued process verification
-> comparability, transfer, and lifecycle control
```

The current repository now has dedicated cell-substrate/bank-lifecycle, raw/ancillary-material and single-use control, upstream, downstream, formulation/stability, integrated analytical control-strategy, process-validation/continued-verification, and integrated technology-transfer Evidence -> Decision -> Working Asset chains. All eight are mapped and editorial-reviewed, while qualified review and real permissioned cases remain open. Mapping does not imply SME approval, Domain Pack readiness or product/site applicability.

## Repository baseline

| Decision area | Current status | Useful content already present | Material gap |
| --- | --- | --- | --- |
| Product-process control strategy | Mapped | Cross-lifecycle lesson, three linked Decision Packages and the stage working assets | No qualified cross-functional review or real case |
| Cell substrate and raw materials | Mapped | Dedicated lessons plus cell-substrate and materials blank/fictional working packages | Qualified cross-functional review and real permissioned bank plus material/SUS changes with actual process/product outcomes |
| Upstream process control | Mapped | Dedicated lesson plus blank and fictional CQA-parameter evidence workbook | Qualified review and real scale-up, process-characterization, or continued-verification case |
| Downstream purification and clearance | Mapped | Dedicated lesson plus blank and fictional downstream evidence workbook; HCP, viral safety, aggregation | Qualified review and real downstream change, scale-down, resin/membrane lifecycle, and clearance evidence |
| Process validation and continued verification | Mapped | Dedicated lifecycle lesson plus blank and fictional twelve-sheet workbook connecting process knowledge, qualification, PPQ, CPV plan/data, statistical versus specification signals, evidence and actions | Qualified cross-functional review and a real permissioned PPQ-to-CPV or revalidation case with actual process/product outcomes |
| Characterization, potency, and specifications | Mapped | Dedicated analytical control-strategy lesson plus blank and fictional workbook connecting attributes, methods, specification basis, reference systems, lifecycle changes, evidence, and review; protein characterization, potency, glycans, aggregates, HCP | Qualified review, a real analytical/reference/specification change case, and deeper charge-variant and residual-DNA evidence |
| Formulation, fill-finish, and stability | Mapped | Dedicated lesson plus blank and fictional formulation/stability evidence workbook; aggregation and general sterile orientation | Qualified review and real formulation, fill-finish, container, shipping, storage, or stability change evidence |
| Comparability, transfer, and lifecycle | Mapped | Dedicated Q5E comparability lesson plus integrated technology-transfer lesson and blank/fictional twelve-sheet working package | Qualified cross-functional review and a real permissioned site-transfer/comparability case with actual outcomes |
| Advanced modalities | Not covered | Incidental references only | Modality-specific coverage and reviewer paths for CGT, vectors, mRNA, vaccines, plasma products, ADCs, and oligonucleotides |

## Build sequence

Content is prioritized by decision leverage rather than article count.

1. **Product-process control strategy:** establish the common evidence model and cross-functional vocabulary.
2. **Comparability after change:** build a pre-change/post-change evidence plan based on ICH Q5E without prescribing product criteria.
3. **Cell-line development and bank lifecycle:** dedicated lesson and twelve-sheet workbook now separate lineage, construct, clone selection, bank hierarchy/manufacture/use, characterization, genetic/phenotypic stability, production age, comparability and authorization; close qualified review and a real permissioned bank case without publishing universal tests, limits or criteria.
4. **Raw/ancillary materials and single-use systems:** dedicated lesson and twelve-sheet workbook now separate supplier approval, material qualification, incoming release, process suitability, configured-SUS evidence, E&L applicability, change acceptance, and continuity; close qualified review and a real permissioned material/SUS change case without publishing universal specifications, limits, study designs, or approval shortcuts.
5. **Upstream process control:** dedicated lesson and evidence-map workbook now exist; close qualified review and a real permissioned case without publishing generic platform ranges.
6. **Downstream purification:** dedicated lesson and evidence-map workbook now separate impurity, product-variant, recovery, and viral-safety claims; close qualified review and a real permissioned case without publishing platform clearance factors.
7. **Formulation and stability:** dedicated lesson and evidence-map workbook now separate degradation, formulation, process/fill, container, analytical, and study evidence; close qualified review and a real permissioned case without publishing platform recipes, conditions, or shelf life.
8. **Integrated analytical control strategy:** dedicated lesson and evidence-map workbook now connect attributes, intended decisions, complementary methods, potency and impurities, reference systems, specification basis, reportability, and lifecycle change; close qualified review and a real permissioned case without publishing product methods or criteria.
9. **Process validation and continued verification:** dedicated lesson and twelve-sheet workbook now connect process knowledge, enabling qualification, PPQ, CPV signal/data lineage, statistical versus specification signals, investigation, lifecycle change and decisions; close qualified review and a real permissioned case without publishing universal batch counts, sampling designs, limits, statistical rules or validation conclusions.
10. **Biologics tech transfer:** dedicated lesson and twelve-sheet evidence-map workbook now connect frozen scope, knowledge, material, facility/equipment/automation fit, process, analytical transfer, validation, comparability, commitments, staged acceptance, evidence, and actions; close qualified review and a real permissioned site-transfer case without publishing product criteria, batch counts, validation design, or authorization.

Each slice must ship as an Evidence -> Decision -> Working Asset chain with a fictional completed example, source IDs, applicability, limitations, and qualified review record before it can be featured.

## Scope guardrails

- The active commercial Quality Lab Domain Pack remains the evidence-gated non-sterile microbiology wedge.
- Biopharma content expansion strengthens Atlas Evidence and prepares future product/process quality capabilities; it does not imply that a Sterile & Biologics Domain Pack is verified.
- Advanced modalities remain explicitly not covered until a source corpus, qualified reviewer, demand evidence, and validation cases exist.
- No platform operating range, specification, process parameter, clearance factor, or acceptance criterion may be invented or generalized from a single product.
- QC, process development, MSAT, manufacturing, formulation, analytical development, quality, and regulatory CMC perspectives must be visible where the decision crosses those functions.

## Full-lifecycle content expansion (2026-08-09)

The product-process coverage now includes a full-lifecycle orchestration lesson in
addition to the stage-specific lessons. It deliberately keeps the relationships
between cell substrate, materials, upstream, downstream, formulation/fill-finish,
analytics, validation, comparability, transfer and lifecycle change visible in one
decision chain. It is editorial-reviewed and does not close the qualified-review or
permissioned-real-case gaps.

The analytical depth layer now also includes potency, reference-system and
orthogonal-characterization evidence. It covers charge, size, impurity and
residual-DNA questions as decision objects without publishing product-specific
assays, limits or specifications.
