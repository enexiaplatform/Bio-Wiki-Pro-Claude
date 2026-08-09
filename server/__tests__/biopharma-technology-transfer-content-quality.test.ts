import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";

const root = process.cwd();
const lesson = readFileSync(path.resolve(root, "content", "academy", "biopharma-integrated-technology-transfer.en.mdx"), "utf8");
const guide = readFileSync(path.resolve(root, "content", "deliverables", "biopharma-technology-transfer", "biopharma-technology-transfer-guide.md"), "utf8");
const readme = readFileSync(path.resolve(root, "content", "deliverables", "biopharma-technology-transfer", "README.md"), "utf8");
const workbookDir = path.resolve(root, "content", "deliverables", "biopharma-technology-transfer");

function openWorkbook(filename: string) {
  return XLSX.read(readFileSync(path.join(workbookDir, filename)), { type: "buffer", cellFormula: true });
}

describe("Biopharma integrated technology-transfer quality boundary", () => {
  it("connects eight evidence objects while separating transfer, comparability, validation and authorization", () => {
    const combined = `${lesson}\n${guide}\n${readme}`.toLowerCase().replace(/\s+/g, " ");
    for (const section of ["## Decision question", "## Applicability and do-not-use boundary", "## Controlled source map", "## Separate eight transfer evidence objects", "## Build the transfer evidence chain", "## Decision table", "## Worked example", "## Working asset", "## Limitations"]) expect(lesson).toContain(section);
    expect(combined).toContain("biologics technology transfer is not a document handoff");
    expect(combined).toContain("protocol completion is not successful transfer");
    expect(combined).toContain("related but distinct decisions");
    expect(combined).not.toContain("three validation batches are required");
    expect(combined).not.toContain("inspection-ready");
  });

  it("ships the expected twelve-sheet blank and fictional workbooks", () => {
    const expected = ["Quick Start", "Decision Brief", "Scope & Governance", "Knowledge Package", "Facility & Equipment", "Process & Materials", "Analytical Transfer", "Validation & Commitments", "Evidence Register", "Review & Actions", "Sources & Control", "Lists"];
    for (const filename of ["biopharma-technology-transfer-v1.xlsx", "biopharma-technology-transfer-v1-fictional-example.xlsx"]) expect(openWorkbook(filename).SheetNames).toEqual(expected);
  });

  it("fails closed when blank and keeps the fictional acceptance decision unresolved", () => {
    const blank = openWorkbook("biopharma-technology-transfer-v1.xlsx");
    const fictional = openWorkbook("biopharma-technology-transfer-v1-fictional-example.xlsx");
    expect(blank.Sheets["Decision Brief"].E9?.f).toContain("Evidence required");
    expect(blank.Sheets["Decision Brief"].E9?.v).toBe("Evidence required");
    expect(fictional.Sheets["Decision Brief"].E5?.v).toBe(0);
    expect(fictional.Sheets["Decision Brief"].E6?.v).toBe(0);
    expect(fictional.Sheets["Decision Brief"].E7?.v).toBeGreaterThan(0);
    expect(fictional.Sheets["Decision Brief"].E8?.v).toBe(5);
    expect(fictional.Sheets["Decision Brief"].E9?.v).toBe("Qualified review required");
    expect(fictional.Sheets["Analytical Transfer"].K5?.v).toBe("Review required");
    expect(fictional.Sheets["Validation & Commitments"].J7?.v).toBe("Review required");
  });

  it("keeps official sources, applicability, limitations and reviewer ownership inside the workbook", () => {
    const workbook = openWorkbook("biopharma-technology-transfer-v1.xlsx");
    const text = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets["Sources & Control"], { header: 1 }).flat().join(" ");
    expect(text).toContain("WHO-TRS-1044-ANNEX4");
    expect(text).toContain("ICH-Q5E");
    expect(text).toContain("ICH-Q14");
    expect(text).toContain("Applicability and limitations");
    expect(text).toContain("Reviewed by role");
    expect(text).toContain("remain distinct");
  });
});
