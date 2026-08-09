import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";

const root = process.cwd();
const lesson = readFileSync(path.resolve(root, "content", "academy", "biopharma-raw-ancillary-materials-control.en.mdx"), "utf8");
const guide = readFileSync(path.resolve(root, "content", "deliverables", "biopharma-materials-control", "biopharma-materials-control-guide.md"), "utf8");
const readme = readFileSync(path.resolve(root, "content", "deliverables", "biopharma-materials-control", "README.md"), "utf8");
const workbookDir = path.resolve(root, "content", "deliverables", "biopharma-materials-control");

function openWorkbook(filename: string) {
  return XLSX.read(readFileSync(path.join(workbookDir, filename)), { type: "buffer", cellFormula: true });
}

describe("Biopharma raw/ancillary materials and single-use control quality boundary", () => {
  it("separates eight evidence objects and prevents supplier/conformance shortcuts", () => {
    const combined = `${lesson}\n${guide}\n${readme}`.toLowerCase().replace(/\s+/g, " ");
    for (const section of ["## Decision question", "## Applicability and do-not-use boundary", "## Controlled source map", "## Separate eight material evidence objects", "## Build the material evidence chain", "## Decision table", "## Worked example", "## Working asset", "## Limitations"]) expect(lesson).toContain(section);
    expect(combined).toContain("material control in biologics is not the same as supplier approval");
    expect(combined).toContain("vendor extractables data is not a product-specific leachables conclusion");
    expect(combined).toContain("related but distinct decisions");
    expect(combined).not.toContain("same specification proves equivalence");
    expect(combined).not.toContain("inspection-ready");
  });

  it("ships the expected twelve-sheet blank and fictional workbooks", () => {
    const expected = ["Quick Start", "Decision Brief", "Material Contact Map", "Material Portfolio", "Supplier & Chain", "Functional Attributes", "Single-Use Systems", "Change Assessment", "Evidence Register", "Review & Actions", "Sources & Control", "Lists"];
    for (const filename of ["biopharma-materials-control-v1.xlsx", "biopharma-materials-control-v1-fictional-example.xlsx"]) expect(openWorkbook(filename).SheetNames).toEqual(expected);
  });

  it("fails closed when blank and keeps the fictional change decision unresolved", () => {
    const blank = openWorkbook("biopharma-materials-control-v1.xlsx");
    const fictional = openWorkbook("biopharma-materials-control-v1-fictional-example.xlsx");
    expect(blank.Sheets["Decision Brief"].E9?.f).toContain("Evidence required");
    expect(blank.Sheets["Decision Brief"].E9?.v).toBe("Evidence required");
    expect(fictional.Sheets["Decision Brief"].E5?.v).toBe(0);
    expect(fictional.Sheets["Decision Brief"].E6?.v).toBe(0);
    expect(fictional.Sheets["Decision Brief"].E7?.v).toBeGreaterThan(0);
    expect(fictional.Sheets["Decision Brief"].E8?.v).toBe(5);
    expect(fictional.Sheets["Decision Brief"].E9?.v).toBe("Qualified review required");
    expect(fictional.Sheets["Single-Use Systems"].J8?.v).toBe("Review required");
    expect(fictional.Sheets["Change Assessment"].J9?.v).toBe("Review required");
  });

  it("keeps official sources, applicability, limitations and reviewer ownership inside the workbook", () => {
    const workbook = openWorkbook("biopharma-materials-control-v1.xlsx");
    const text = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets["Sources & Control"], { header: 1 }).flat().join(" ");
    expect(text).toContain("WHO-TRS-996-ANNEX3");
    expect(text).toContain("ICH-Q11");
    expect(text).toContain("EU-GMP-ANNEX1-2022");
    expect(text).toContain("Applicability and limitations");
    expect(text).toContain("Reviewed by role");
    expect(text).toContain("Vendor extractables data is not a product-specific leachables conclusion");
  });
});
