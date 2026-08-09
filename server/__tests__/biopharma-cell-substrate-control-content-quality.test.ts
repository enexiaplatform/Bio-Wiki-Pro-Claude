import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";

const root = process.cwd();
const lesson = readFileSync(path.resolve(root, "content", "academy", "biopharma-cell-line-cell-bank-genetic-stability.en.mdx"), "utf8");
const guide = readFileSync(path.resolve(root, "content", "deliverables", "biopharma-cell-substrate-control", "biopharma-cell-substrate-control-guide.md"), "utf8");
const readme = readFileSync(path.resolve(root, "content", "deliverables", "biopharma-cell-substrate-control", "README.md"), "utf8");
const workbookDir = path.resolve(root, "content", "deliverables", "biopharma-cell-substrate-control");

function openWorkbook(filename: string) {
  return XLSX.read(readFileSync(path.join(workbookDir, filename)), { type: "buffer", cellFormula: true });
}

describe("Biopharma cell-line, cell-bank and genetic-stability quality boundary", () => {
  it("separates eight evidence objects and prevents single-result or bank-completion shortcuts", () => {
    const combined = `${lesson}\n${guide}\n${readme}`.toLowerCase().replace(/\s+/g, " ");
    for (const section of ["## Decision question", "## Applicability and do-not-use boundary", "## Controlled source map", "## Separate eight cell-substrate evidence objects", "## Build the cell-substrate evidence chain", "## Decision table", "## Worked example", "## Working asset", "## Limitations"]) expect(lesson).toContain(section);
    expect(combined).toContain("a production cell line is not merely a vial");
    expect(combined).toContain("an intact coding sequence does not by itself establish cell-substrate stability");
    expect(combined).toContain("bank manufacture completion is not bank release or authorization to use");
    expect(combined).not.toContain("same master cell bank proves equivalence");
    expect(combined).not.toContain("inspection-ready");
  });

  it("ships the expected twelve-sheet blank and fictional workbooks", () => {
    const expected = ["Quick Start", "Decision Brief", "Lineage & Construct", "Clone Development", "Bank Hierarchy", "Bank Manufacture", "Characterization", "Stability & Age", "Change Assessment", "Evidence Register", "Review & Actions", "Sources & Control"];
    for (const filename of ["biopharma-cell-substrate-control-v1.xlsx", "biopharma-cell-substrate-control-v1-fictional-example.xlsx"]) expect(openWorkbook(filename).SheetNames).toEqual(expected);
  });

  it("fails closed when blank and keeps the fictional replacement-bank decision unresolved", () => {
    const blank = openWorkbook("biopharma-cell-substrate-control-v1.xlsx");
    const fictional = openWorkbook("biopharma-cell-substrate-control-v1-fictional-example.xlsx");
    expect(blank.Sheets["Decision Brief"].E9?.f).toContain("Evidence required");
    expect(blank.Sheets["Decision Brief"].E9?.v).toBe("Evidence required");
    expect(fictional.Sheets["Decision Brief"].E5?.v).toBe(0);
    expect(fictional.Sheets["Decision Brief"].E6?.v).toBe(0);
    expect(fictional.Sheets["Decision Brief"].E7?.v).toBeGreaterThan(0);
    expect(fictional.Sheets["Decision Brief"].E8?.v).toBe(5);
    expect(fictional.Sheets["Decision Brief"].E9?.v).toBe("Qualified review required");
    expect(fictional.Sheets["Stability & Age"].J9?.v).toBe("Review required");
    expect(fictional.Sheets["Change Assessment"].J9?.v).toBe("Review required");
  });

  it("keeps official sources, applicability, limitations and reviewer ownership inside the workbook", () => {
    const workbook = openWorkbook("biopharma-cell-substrate-control-v1.xlsx");
    const text = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets["Sources & Control"], { header: 1 }).flat().join(" ");
    expect(text).toContain("ICH-Q5D");
    expect(text).toContain("ICH-Q5B");
    expect(text).toContain("WHO-TRS-978-ANNEX3");
    expect(text).toContain("Applicability and limitations");
    expect(text).toContain("Reviewed by role");
    expect(text).toContain("Bank manufacture completion is not bank release or authorization to use");
  });
});
