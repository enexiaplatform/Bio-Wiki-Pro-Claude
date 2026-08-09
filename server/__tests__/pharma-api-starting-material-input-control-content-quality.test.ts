import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";

const root = process.cwd();
const lesson = readFileSync(path.resolve(root, "content", "academy", "pharma-api-starting-materials-input-control.en.mdx"), "utf8");
const guide = readFileSync(path.resolve(root, "content", "deliverables", "pharma-api-starting-material-input-control", "pharma-api-starting-material-input-control-guide.md"), "utf8");
const readme = readFileSync(path.resolve(root, "content", "deliverables", "pharma-api-starting-material-input-control", "README.md"), "utf8");
const workbookDir = path.resolve(root, "content", "deliverables", "pharma-api-starting-material-input-control");

function openWorkbook(filename: string) {
  return XLSX.read(readFileSync(path.join(workbookDir, filename)), { type: "buffer", cellFormula: true });
}

describe("Pharma API starting-material and input-control package", () => {
  it("keeps distinct material, supplier, filing and release decisions explicit", () => {
    for (const section of ["## Decision question", "## Applicability and do-not-use boundary", "## Controlled source map", "## Separate eight starting-material evidence objects", "## Build the boundary-to-use evidence chain", "## Decision table", "## Worked example", "## Working asset", "## Limitations"]) expect(lesson).toContain(section);
    for (const boundary of ["not sufficient alone", "related but distinct decisions", "supplies no starting-material identity", "Multiple suppliers", "Qualified review required"]) expect(lesson.toLowerCase()).toContain(boundary.toLowerCase());
    expect(lesson.toLowerCase()).not.toContain("multiple suppliers prove commercial availability");
  });

  it("ships controlled 12-sheet blank and fictional workbooks", () => {
    const expected = ["Quick Start", "Decision Brief", "Route Boundary", "Material Portfolio", "Supplier Chain", "Specification Basis", "Impurity Link", "Incoming Control", "Change Assessment", "Evidence Register", "Review & Actions", "Sources & Control"];
    for (const filename of ["pharma-api-starting-material-input-control-v1.xlsx", "pharma-api-starting-material-input-control-v1-fictional-example.xlsx"]) expect(openWorkbook(filename).SheetNames).toEqual(expected);
  });

  it("fails closed and preserves unresolved fictional evidence", () => {
    const blank = openWorkbook("pharma-api-starting-material-input-control-v1.xlsx");
    const fictional = openWorkbook("pharma-api-starting-material-input-control-v1-fictional-example.xlsx");
    expect(blank.Sheets["Quick Start"]["B9"].f).toContain("Evidence required");
    expect(fictional.Sheets["Route Boundary"]["J5"].f).toContain("Qualified review required");
    const text = XLSX.utils.sheet_to_json<unknown[]>(fictional.Sheets["Change Assessment"], { header: 1 }).flat().join(" ");
    expect(text).toContain("Sub-tier manufacturing-site change");
    expect(text).toContain("Evidence required");
  });

  it("carries sources, reviewer boundaries and controlled-use limits", () => {
    for (const source of ["ICH-Q11", "ICH-Q11-QA", "ICH-Q7", "ICH-Q7-QA", "ICH-Q3A-R2", "ICH-M7-R2", "ICH-Q6A", "ICH-Q2-R2", "ICH-Q14", "ICH-Q9-R1", "ICH-Q10", "FDA-QUALITY-AGREEMENTS-2016"]) {
      expect(readme).toContain(source);
      expect(guide).toContain(source);
    }
    expect(guide).toContain("Critical review checklist");
    expect(readme).toContain("Decision owner");
  });
});
