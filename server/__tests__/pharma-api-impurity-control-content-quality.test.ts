import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";

const root = process.cwd();
const lesson = readFileSync(path.resolve(root, "content", "academy", "pharma-api-process-development-impurity-control.en.mdx"), "utf8");
const guide = readFileSync(path.resolve(root, "content", "deliverables", "pharma-api-impurity-control", "pharma-api-impurity-control-guide.md"), "utf8");
const readme = readFileSync(path.resolve(root, "content", "deliverables", "pharma-api-impurity-control", "README.md"), "utf8");
const workbookDir = path.resolve(root, "content", "deliverables", "pharma-api-impurity-control");

function openWorkbook(filename: string) {
  return XLSX.read(readFileSync(path.join(workbookDir, filename)), { type: "buffer", cellFormula: true });
}

describe("Pharma API process and impurity control package", () => {
  it("keeps distinct API decisions and unsafe shortcuts explicit", () => {
    for (const section of ["## Decision question", "## Applicability and do-not-use boundary", "## Controlled source map", "## Separate eight API evidence objects", "## Build the route-to-control evidence chain", "## Decision table", "## Worked example", "## Working asset", "## Limitations"]) expect(lesson).toContain(section);
    for (const boundary of ["An observed ratio is not a transferable purge factor", "proof of zero material", "reporting boundary", "related but distinct decisions", "supplies no chemical route"]) expect(lesson.toLowerCase()).toContain(boundary.toLowerCase());
    expect(lesson.toLowerCase()).not.toContain("non-detect proves absence");
    expect(lesson.toLowerCase()).not.toContain("final testing proves control");
  });

  it("ships the controlled 12-sheet blank and fictional workbooks", () => {
    const expected = ["Quick Start", "Decision Brief", "Route & Inputs", "Unit Operations", "Impurity Map", "Observed Fate", "Analytical Evidence", "Control Strategy", "Change Assessment", "Evidence Register", "Review & Actions", "Sources & Control"];
    for (const filename of ["pharma-api-impurity-control-v1.xlsx", "pharma-api-impurity-control-v1-fictional-example.xlsx"]) expect(openWorkbook(filename).SheetNames).toEqual(expected);
  });

  it("calculates only a bounded observed ratio and fails closed elsewhere", () => {
    const blank = openWorkbook("pharma-api-impurity-control-v1.xlsx");
    const fictional = openWorkbook("pharma-api-impurity-control-v1-fictional-example.xlsx");
    expect(blank.Sheets["Observed Fate"]["I5"].f).toContain("Evidence required");
    expect(fictional.Sheets["Observed Fate"]["I6"].f).toContain("E6/F6");
    expect(fictional.Sheets["Observed Fate"]["M6"].f).toContain("Qualified review required");
    const fateText = XLSX.utils.sheet_to_json<unknown[]>(fictional.Sheets["Observed Fate"], { header: 1 }).flat().join(" ");
    expect(fateText).toContain("Observed ratio — not purge");
    expect(fateText).toContain("never establishes transferable purge");
  });

  it("carries official sources, review roles and controlled-use limits", () => {
    for (const source of ["ICH-Q11", "ICH-Q11-QA", "ICH-Q3A-R2", "ICH-Q3C-R9", "ICH-Q3D-R2", "ICH-M7-R2", "ICH-Q6A", "ICH-Q7", "ICH-Q2-R2", "ICH-Q14", "ICH-Q9-R1", "ICH-Q10"]) {
      expect(readme).toContain(source);
      expect(guide).toContain(source);
    }
    expect(readme).toContain("Qualified review required");
    expect(readme).toContain("Decision owner");
    expect(guide.toLowerCase()).toContain("observed ratio");
    expect(guide).toContain("Applicability and limitations");
  });
});
