# Pharma API Starting Material & Input Control Evidence Map

Version: `1.0.0-review`  
Status: `editorial-reviewed`
Decision state: `Evidence required` or `Qualified review required` only

This package structures the route-to-input evidence chain for a chemically synthesized small-molecule API. It does not approve a starting material, supplier, specification, quality agreement, incoming-control program, filing or batch.

## Files

- `pharma-api-starting-material-input-control-guide.md` — source-bounded workflow and review logic.
- `pharma-api-starting-material-input-control-v1.xlsx` — blank formula-driven 12-sheet working file.
- `pharma-api-starting-material-input-control-v1-fictional-example.xlsx` — fictional custom-intermediate and sub-tier-change example that remains unresolved.

## Controlled sources

`ICH-Q11`, `ICH-Q11-QA`, `ICH-Q7`, `ICH-Q7-QA`, `ICH-Q3A-R2`, `ICH-Q3C-R9`, `ICH-Q3D-R2`, `ICH-M7-R2`, `ICH-Q6A`, `ICH-Q2-R2`, `ICH-Q14`, `ICH-Q9-R1`, `ICH-Q10`, `FDA-QUALITY-AGREEMENTS-2016`.

## Decision boundary

Multiple suppliers or market availability are not sufficient alone to establish commodity status or starting-material acceptability. A significant structural fragment is relevant but not sufficient alone. Starting-material selection, supplier qualification, material specification, receipt/release, process validation, filing acceptance and batch disposition remain distinct decisions.

The workbook requires a Decision owner and fails closed when evidence, source locators, change assessment, actions or required reviews are open. Even when structurally complete, it reports `Qualified review required`, never approval.

Required review roles include synthetic process development, supplier quality, API analytical development/QC, quality, manufacturing science, validation and regulatory CMC.
