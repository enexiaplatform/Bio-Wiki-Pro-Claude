import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";

const root = process.cwd();
const lesson = readFileSync(path.resolve(root, "content", "academy", "biopharma-integrated-analytical-control-strategy.en.mdx"), "utf8");
const guide = readFileSync(path.resolve(root, "content", "deliverables", "biopharma-analytical-control-strategy", "biopharma-analytical-control-strategy-guide.md"), "utf8");
const readme = readFileSync(path.resolve(root, "content", "deliverables", "biopharma-analytical-control-strategy", "README.md"), "utf8");
const workbookDir = path.resolve(root, "content", "deliverables", "biopharma-analytical-control-strategy");

function openWorkbook(filename: string) {
  return XLSX.read(readFileSync(path.join(workbookDir, filename)), { type: "buffer", cellFormula: true });
}

describe("Biopharma integrated analytical control-strategy quality boundary", () => {
  it("connects seven evidence objects without supplying methods or specifications", () => {
    const combined = `${lesson}\n${guide}\n${readme}`.toLowerCase().replace(/\s+/g, " ");
    for (const section of ["## Decision question", "## Applicability and do-not-use boundary", "## Controlled source map", "## Separate seven evidence objects", "## Build the attribute-to-decision evidence chain", "## Decision table", "## Worked example", "## Working asset", "## Limitations"]) expect(lesson).toContain(section);
    expect(combined).toContain("an analytical control strategy is not a list of instruments or a release specification");
    expect(combined).toContain("specification conformance is not full product characterization");
    expect(combined).toContain("no universal analytical panel and no product-specific specification");
    expect(combined).not.toContain("validated method proves product quality");
    expect(combined).not.toContain("inspection-ready");
  });

  it("ships the expected eleven-sheet blank and fictional workbooks", () => {
    const expected = ["Quick Start", "Decision Brief", "Attribute Map", "Method Portfolio", "Specification Basis", "Reference Materials", "Lifecycle Changes", "Evidence Register", "Review & Actions", "Sources & Control", "Lists"];
    for (const filename of ["biopharma-analytical-control-strategy-v1.xlsx", "biopharma-analytical-control-strategy-v1-fictional-example.xlsx"]) expect(openWorkbook(filename).SheetNames).toEqual(expected);
  });

  it("fails closed when blank and keeps the fictional cross-functional decision unresolved", () => {
    const blank = openWorkbook("biopharma-analytical-control-strategy-v1.xlsx");
    const fictional = openWorkbook("biopharma-analytical-control-strategy-v1-fictional-example.xlsx");
    expect(blank.Sheets["Decision Brief"].B19?.f).toContain("Evidence required");
    expect(blank.Sheets["Decision Brief"].B19?.v).toBe("Evidence required");
    expect(fictional.Sheets["Decision Brief"].B15?.v).toBe(0);
    expect(fictional.Sheets["Decision Brief"].B16?.v).toBe(0);
    expect(fictional.Sheets["Decision Brief"].B17?.v).toBeGreaterThan(0);
    expect(fictional.Sheets["Decision Brief"].B18?.v).toBe(5);
    expect(fictional.Sheets["Decision Brief"].B19?.v).toBe("Qualified review required");
    expect(fictional.Sheets["Reference Materials"].O7?.v).toBe("Review required");
    expect(fictional.Sheets["Specification Basis"].M9?.v).toBe("Review required");
  });

  it("keeps source, revision-watch, and total-control boundaries inside the workbook", () => {
    const workbook = openWorkbook("biopharma-analytical-control-strategy-v1.xlsx");
    const text = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets["Sources & Control"], { header: 1 }).flat().join(" ");
    expect(text).toContain("ICH-Q6B");
    expect(text).toContain("ICH-Q6-R1-CONCEPT-2024");
    expect(text).toContain("WHO-IBRS-2026");
    expect(text).toContain("concept/revision activity, not effective revised guidance");
    expect(text).toContain("Specification conformance is not full characterization");
  });
});
