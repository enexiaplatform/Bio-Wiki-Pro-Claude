import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";

const root = process.cwd();
const lesson = readFileSync(path.resolve(root, "content", "academy", "biopharma-upstream-process-control.en.mdx"), "utf8");
const guide = readFileSync(path.resolve(root, "content", "deliverables", "biopharma-upstream-control", "biopharma-upstream-control-guide.md"), "utf8");
const readme = readFileSync(path.resolve(root, "content", "deliverables", "biopharma-upstream-control", "README.md"), "utf8");
const workbookDir = path.resolve(root, "content", "deliverables", "biopharma-upstream-control");

function openWorkbook(filename: string) {
  return XLSX.read(readFileSync(path.join(workbookDir, filename)), { type: "buffer", cellFormula: true });
}

describe("Biopharma upstream control quality boundary", () => {
  it("teaches an evidence chain without supplying universal parameters or ranges", () => {
    const combined = `${lesson}\n${guide}\n${readme}`.toLowerCase();
    for (const section of ["## Decision question", "## Applicability and do-not-use boundary", "## Controlled source map", "## Decision table", "## Worked example", "## Limitations"]) {
      expect(lesson).toContain(section);
    }
    expect(combined).toContain("not a universal list of bioreactor parameters");
    expect(combined).toContain("no generic numeric operating range");
    expect(combined).toContain("does not establish causality from trend association");
    expect(combined).not.toContain("inspection-ready");
    expect(combined).not.toContain("universal cpp list");
  });

  it("ships the expected eight-sheet blank and fictional workbooks", () => {
    const expectedSheets = ["Quick Start", "Decision Brief", "Product Attributes", "Process Map", "Evidence Register", "Review & Actions", "Sources & Control", "Lists"];
    for (const filename of ["biopharma-upstream-control-v1.xlsx", "biopharma-upstream-control-v1-fictional-example.xlsx"]) {
      expect(openWorkbook(filename).SheetNames).toEqual(expectedSheets);
    }
  });

  it("fails closed and preserves unresolved fictional evidence for qualified review", () => {
    const blank = openWorkbook("biopharma-upstream-control-v1.xlsx");
    const fictional = openWorkbook("biopharma-upstream-control-v1-fictional-example.xlsx");

    expect(blank.Sheets["Decision Brief"].B15?.f).toContain("Evidence required");
    expect(blank.Sheets["Decision Brief"].B15?.v).toBe("Evidence required");
    expect(fictional.Sheets["Decision Brief"].B15?.v).toBe("Qualified review required");
    expect(fictional.Sheets["Decision Brief"].B13?.v).toBe(8);
    expect(fictional.Sheets["Decision Brief"].B14?.v).toBe(4);

    const processMap = fictional.Sheets["Process Map"];
    const attentionFormulas = Object.values(processMap).filter((cell: any) => cell && typeof cell === "object" && typeof cell.f === "string" && cell.f.includes("Review required"));
    expect(attentionFormulas.length).toBeGreaterThan(0);
    expect(processMap.O6?.v).toBe("Review required");
  });

  it("keeps source and controlled-use boundaries inside the workbook", () => {
    const workbook = openWorkbook("biopharma-upstream-control-v1.xlsx");
    const controlText = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets["Sources & Control"], { header: 1 }).flat().join(" ");
    expect(controlText).toContain("ICH-Q8-R2");
    expect(controlText).toContain("ICH-Q11");
    expect(controlText).toContain("No generic numeric range or criterion is supplied");
    expect(controlText).toContain("not a controlled site record");
  });
});
