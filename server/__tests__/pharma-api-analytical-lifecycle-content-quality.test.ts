import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";

const root = process.cwd();
const lesson = readFileSync(path.resolve(root, "content", "academy", "pharma-api-analytical-specification-lifecycle.en.mdx"), "utf8");
const guide = readFileSync(path.resolve(root, "content", "deliverables", "pharma-api-analytical-lifecycle", "pharma-api-analytical-lifecycle-guide.md"), "utf8");
const readme = readFileSync(path.resolve(root, "content", "deliverables", "pharma-api-analytical-lifecycle", "README.md"), "utf8");
const dir = path.resolve(root, "content", "deliverables", "pharma-api-analytical-lifecycle");
const open = (file: string) => XLSX.read(readFileSync(path.join(dir, file)), { type: "buffer", cellFormula: true });

describe("Pharma API analytical and lifecycle package", () => {
  it("keeps intended use, method capability, stability and transfer decisions distinct", () => {
    for (const section of ["## Decision question", "## Applicability and do-not-use boundary", "## Controlled source map", "## Separate eight lifecycle evidence objects", "## Build the attribute-to-decision evidence chain", "## Decision table", "## Worked example", "## Working asset", "## Limitations"]) expect(lesson).toContain(section);
    for (const boundary of ["precision alone", "stability-indicating", "changed measurement system", "Qualified review required", "supplies no product-specific method"]) expect(lesson.toLowerCase()).toContain(boundary.toLowerCase());
    expect(lesson.toLowerCase()).not.toContain("precision proves the method");
  });

  it("ships the controlled 12-sheet blank and fictional workbooks", () => {
    const expected = ["Quick Start", "Decision Brief", "Analytical Target", "Attribute Map", "Procedure Capability", "Specification Basis", "Stability Evidence", "Transfer Assessment", "Change & Filing", "Evidence Register", "Review & Actions", "Sources & Control"];
    for (const file of ["pharma-api-analytical-lifecycle-v1.xlsx", "pharma-api-analytical-lifecycle-v1-fictional-example.xlsx"]) expect(open(file).SheetNames).toEqual(expected);
  });

  it("fails closed and keeps transfer/stability questions open", () => {
    const blank = open("pharma-api-analytical-lifecycle-v1.xlsx"); const fictional = open("pharma-api-analytical-lifecycle-v1-fictional-example.xlsx");
    expect(blank.Sheets["Quick Start"]["B9"].f).toContain("Evidence required");
    expect(fictional.Sheets["Transfer Assessment"]["J5"].f).toContain("Qualified review required");
    const text = XLSX.utils.sheet_to_json<unknown[]>(fictional.Sheets["Change & Filing"], { header: 1 }).flat().join(" ");
    expect(text).toContain("Column + sample-preparation change"); expect(text).toContain("No authorized implementation");
  });

  it("carries controlled sources and limitations", () => {
    for (const source of ["ICH-Q14", "ICH-Q2-R2", "ICH-Q6A", "ICH-Q1A-R2", "ICH-Q7", "ICH-Q9-R1", "ICH-Q10", "FDA-ANALYTICAL-PROCEDURES-2015", "FDA-PROCESS-VALIDATION-2011"]) { expect(readme).toContain(source); expect(guide).toContain(source); }
    expect(guide).toContain("Critical review checklist"); expect(readme).toContain("Decision owner");
  });
});
