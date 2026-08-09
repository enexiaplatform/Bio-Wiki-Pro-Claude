# Pharma API Analytical & Lifecycle Control Evidence Map

Version: `1.0.0-review`  
Status: `Under review`  
Decision state: `Evidence required` or `Qualified review required` only

This package structures the analytical decision chain for a defined small-molecule API: intended use, analytical target profile, procedure capability, specification linkage, stability evidence, transfer and lifecycle change. It does not validate a method, approve a specification, establish shelf life or release a batch.

## Files

- `pharma-api-analytical-lifecycle-guide.md` — source-bounded workflow and review logic.
- `pharma-api-analytical-lifecycle-v1.xlsx` — blank formula-driven 12-sheet working file.
- `pharma-api-analytical-lifecycle-v1-fictional-example.xlsx` — fictional column/sample-preparation transfer case that remains unresolved.

## Controlled sources

`ICH-Q14`, `ICH-Q2-R2`, `ICH-Q6A`, `ICH-Q1A-R2`, `ICH-Q7`, `ICH-Q9-R1`, `ICH-Q10`, `FDA-ANALYTICAL-PROCEDURES-2015`, `FDA-PROCESS-VALIDATION-2011`.

## Decision boundary

Precision, specification conformance, system suitability or a passing bridge result does not alone establish fitness for intended use, stability indication, validation, transfer acceptance, filing acceptance or batch disposition. The workbook requires a Decision owner, source locators, limitations and open-action review; it fails closed when evidence is incomplete.
