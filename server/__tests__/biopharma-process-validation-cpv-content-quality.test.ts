import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";

const root = process.cwd();
const lesson = readFileSync(path.resolve(root, "content", "academy", "biopharma-process-validation-continued-verification.en.mdx"), "utf8");
const guide = readFileSync(path.resolve(root, "content", "deliverables", "biopharma-process-validation-cpv", "biopharma-process-validation-cpv-guide.md"), "utf8");
const readme = readFileSync(path.resolve(root, "content", "deliverables", "biopharma-process-validation-cpv", "README.md"), "utf8");
const workbookDir = path.resolve(root, "content", "deliverables", "biopharma-process-validation-cpv");

function openWorkbook(filename: string) {
  return XLSX.read(readFileSync(path.join(workbookDir, filename)), { type: "buffer", cellFormula: true });
}

describe("Biopharma process-validation and continued-verification quality boundary", () => {
  it("separates eight lifecycle objects and prevents batch-count, specification or statistical shortcuts", () => {
    const combined = `${lesson}\n${guide}\n${readme}`.toLowerCase().replace(/\s+/g, " ");
    for (const section of ["## Decision question", "## Applicability and do-not-use boundary", "## Controlled source map", "## Separate eight lifecycle evidence objects", "## Build the validation-to-verification chain", "## Decision table", "## Worked example", "## Working asset", "## Limitations"]) expect(lesson).toContain(section);
    expect(combined).toContain("a statistical signal is not automatically a batch failure");
    expect(combined).toContain("within-specification result is not automatically evidence");
    expect(combined).toContain("workbook completeness is not validation approval");
    expect(combined).not.toContain("three batches prove validation");
    expect(combined).not.toContain("inspection-ready");
  });

  it("ships the expected twelve-sheet blank and fictional workbooks", () => {
    const expected = ["Quick Start", "Decision Brief", "Lifecycle Map", "Process & Controls", "Qualification", "PPQ Evidence", "CPV Plan", "CPV Data", "Signal Assessment", "Evidence Register", "Review & Actions", "Sources & Control"];
    for (const filename of ["biopharma-process-validation-cpv-v1.xlsx", "biopharma-process-validation-cpv-v1-fictional-example.xlsx"]) expect(openWorkbook(filename).SheetNames).toEqual(expected);
  });

  it("fails closed when blank and preserves a statistical signal within specification in the fictional example", () => {
    const blank = openWorkbook("biopharma-process-validation-cpv-v1.xlsx");
    const fictional = openWorkbook("biopharma-process-validation-cpv-v1-fictional-example.xlsx");
    expect(blank.Sheets["Decision Brief"].E10?.f).toContain("Evidence required");
    expect(blank.Sheets["Decision Brief"].E10?.v).toBe("Evidence required");
    expect(fictional.Sheets["Decision Brief"].E5?.v).toBe(0);
    expect(fictional.Sheets["Decision Brief"].E6?.v).toBe(0);
    expect(fictional.Sheets["Decision Brief"].E7?.v).toBeGreaterThan(0);
    expect(fictional.Sheets["Decision Brief"].E8?.v).toBe(1);
    expect(fictional.Sheets["Decision Brief"].E9?.v).toBe(5);
    expect(fictional.Sheets["Decision Brief"].E10?.v).toBe("Qualified review required");
    expect(fictional.Sheets["CPV Data"].K8?.v).toBe("Statistical signal");
    expect(fictional.Sheets["CPV Data"].L8?.v).toBe("Within entered specification");
    expect(fictional.Sheets["CPV Data"].N8?.v).toBe("Review required");
  });

  it("keeps official sources, applicability, limitations and reviewer ownership inside the workbook", () => {
    const workbook = openWorkbook("biopharma-process-validation-cpv-v1.xlsx");
    const text = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets["Sources & Control"], { header: 1 }).flat().join(" ");
    expect(text).toContain("FDA-PROCESS-VALIDATION-2011");
    expect(text).toContain("EMA-BIOLOGICS-PROCESS-VALIDATION-2016");
    expect(text).toContain("EU-GMP-ANNEX15-2015");
    expect(text).toContain("Applicability and limitations");
    expect(text).toContain("Reviewed by role");
    expect(text).toContain("A statistical signal is not automatically a batch failure");
  });
});
