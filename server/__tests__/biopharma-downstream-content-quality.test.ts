import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";

const root = process.cwd();
const lesson = readFileSync(path.resolve(root, "content", "academy", "biopharma-downstream-purification-clearance.en.mdx"), "utf8");
const guide = readFileSync(path.resolve(root, "content", "deliverables", "biopharma-downstream-clearance", "biopharma-downstream-clearance-guide.md"), "utf8");
const readme = readFileSync(path.resolve(root, "content", "deliverables", "biopharma-downstream-clearance", "README.md"), "utf8");
const workbookDir = path.resolve(root, "content", "deliverables", "biopharma-downstream-clearance");

function openWorkbook(filename: string) {
  return XLSX.read(readFileSync(path.join(workbookDir, filename)), { type: "buffer", cellFormula: true });
}

describe("Biopharma downstream purification and clearance quality boundary", () => {
  it("separates claim families without supplying universal ranges or clearance factors", () => {
    const combined = `${lesson}\n${guide}\n${readme}`.toLowerCase().replace(/\s+/g, " ");
    for (const section of ["## Decision question", "## Applicability and do-not-use boundary", "## Controlled source map", "## Separate four kinds of downstream claim", "## Decision table", "## Worked example", "## Limitations"]) {
      expect(lesson).toContain(section);
    }
    expect(combined).toContain("cannot be inferred from routine impurity clearance alone");
    expect(combined).toContain("does not calculate or recommend a viral-reduction factor");
    expect(combined).toContain("no generic operating range");
    expect(combined).not.toContain("typical log reduction");
    expect(combined).not.toContain("inspection-ready");
  });

  it("ships the expected nine-sheet blank and fictional workbooks", () => {
    const expectedSheets = ["Quick Start", "Decision Brief", "Targets & Attributes", "Unit Operations", "Clearance Claims", "Evidence Register", "Review & Actions", "Sources & Control", "Lists"];
    for (const filename of ["biopharma-downstream-clearance-v1.xlsx", "biopharma-downstream-clearance-v1-fictional-example.xlsx"]) {
      expect(openWorkbook(filename).SheetNames).toEqual(expectedSheets);
    }
  });

  it("fails closed when blank and keeps the fictional change at qualified review", () => {
    const blank = openWorkbook("biopharma-downstream-clearance-v1.xlsx");
    const fictional = openWorkbook("biopharma-downstream-clearance-v1-fictional-example.xlsx");

    expect(blank.Sheets["Decision Brief"].B17?.f).toContain("Evidence required");
    expect(blank.Sheets["Decision Brief"].B17?.v).toBe("Evidence required");
    expect(fictional.Sheets["Decision Brief"].B13?.v).toBe(0);
    expect(fictional.Sheets["Decision Brief"].B14?.v).toBe(0);
    expect(fictional.Sheets["Decision Brief"].B15?.v).toBeGreaterThan(0);
    expect(fictional.Sheets["Decision Brief"].B16?.v).toBe(5);
    expect(fictional.Sheets["Decision Brief"].B17?.v).toBe("Qualified review required");
    expect(fictional.Sheets["Clearance Claims"].R6?.v).toBe("Review required");
  });

  it("keeps source, viral-safety, and controlled-use boundaries inside the workbook", () => {
    const workbook = openWorkbook("biopharma-downstream-clearance-v1.xlsx");
    const controlText = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets["Sources & Control"], { header: 1 }).flat().join(" ");
    expect(controlText).toContain("ICH-Q5A-R2");
    expect(controlText).toContain("ICH-Q11");
    expect(controlText).toContain("No generic operating range");
    expect(controlText).toContain("does not calculate a reduction factor");
    expect(controlText).toContain("not a controlled site record");
  });
});
