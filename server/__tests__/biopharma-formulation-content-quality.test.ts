import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";

const root = process.cwd();
const lesson = readFileSync(path.resolve(root, "content", "academy", "biopharma-formulation-fill-finish-stability.en.mdx"), "utf8");
const guide = readFileSync(path.resolve(root, "content", "deliverables", "biopharma-formulation-stability", "biopharma-formulation-stability-guide.md"), "utf8");
const readme = readFileSync(path.resolve(root, "content", "deliverables", "biopharma-formulation-stability", "README.md"), "utf8");
const workbookDir = path.resolve(root, "content", "deliverables", "biopharma-formulation-stability");

function openWorkbook(filename: string) {
  return XLSX.read(readFileSync(path.join(workbookDir, filename)), { type: "buffer", cellFormula: true });
}

describe("Biopharma formulation, fill-finish and stability quality boundary", () => {
  it("connects six evidence layers without supplying a platform recipe or shelf life", () => {
    const combined = `${lesson}\n${guide}\n${readme}`.toLowerCase().replace(/\s+/g, " ");
    for (const section of ["## Decision question", "## Applicability and do-not-use boundary", "## Controlled source map", "## Separate five evidence objects", "## Decision table", "## Worked example", "## Limitations"]) expect(lesson).toContain(section);
    expect(combined).toContain("not a chamber schedule followed by a shelf-life number");
    expect(combined).toContain("sterility assurance and molecular stability are connected but distinct evidence systems");
    expect(combined).toContain("no platform formulation or generic operating range");
    expect(combined).not.toContain("accelerated data proves shelf life");
    expect(combined).not.toContain("inspection-ready");
  });

  it("ships the expected ten-sheet blank and fictional workbooks", () => {
    const expected = ["Quick Start", "Decision Brief", "Quality & Pathways", "Formulation Map", "Process & Fill", "Stability Plan", "Evidence Register", "Review & Actions", "Sources & Control", "Lists"];
    for (const filename of ["biopharma-formulation-stability-v1.xlsx", "biopharma-formulation-stability-v1-fictional-example.xlsx"]) expect(openWorkbook(filename).SheetNames).toEqual(expected);
  });

  it("fails closed when blank and preserves the fictional change for qualified review", () => {
    const blank = openWorkbook("biopharma-formulation-stability-v1.xlsx");
    const fictional = openWorkbook("biopharma-formulation-stability-v1-fictional-example.xlsx");
    expect(blank.Sheets["Decision Brief"].B18?.f).toContain("Evidence required");
    expect(blank.Sheets["Decision Brief"].B18?.v).toBe("Evidence required");
    expect(fictional.Sheets["Decision Brief"].B14?.v).toBe(0);
    expect(fictional.Sheets["Decision Brief"].B15?.v).toBe(0);
    expect(fictional.Sheets["Decision Brief"].B16?.v).toBeGreaterThan(0);
    expect(fictional.Sheets["Decision Brief"].B17?.v).toBe(5);
    expect(fictional.Sheets["Decision Brief"].B18?.v).toBe("Qualified review required");
    expect(fictional.Sheets["Stability Plan"].R9?.v).toBe("Review required");
  });

  it("keeps source, revision-watch, and controlled-use boundaries inside the workbook", () => {
    const workbook = openWorkbook("biopharma-formulation-stability-v1.xlsx");
    const text = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets["Sources & Control"], { header: 1 }).flat().join(" ");
    expect(text).toContain("ICH-Q5C");
    expect(text).toContain("ICH-Q1A-R2");
    expect(text).toContain("No generic composition");
    expect(text).toContain("draft revision activity");
    expect(text).toContain("Not a controlled formulation");
  });
});
