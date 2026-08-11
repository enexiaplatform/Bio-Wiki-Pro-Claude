import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";
import { DELIVERABLES } from "../deliverables";

const core = [
  "gmp_audit_kit",
  "oos_investigation_template",
  "environmental_monitoring_checklist",
  "lab_water_selection_checklist",
  "biopharma_upstream_control",
  "biopharma_downstream_clearance",
  "biopharma_formulation_stability",
  "biopharma_analytical_control_strategy",
  "biopharma_technology_transfer",
  "biopharma_materials_control",
  "biopharma_cell_substrate_control",
  "biopharma_process_validation_cpv",
  "pharma_api_impurity_control",
] as const;
const expectedVersions: Record<(typeof core)[number], string> = {
  gmp_audit_kit: "2.0.0-review",
  oos_investigation_template: "2.1.0-review",
  environmental_monitoring_checklist: "2.0.0-review",
  lab_water_selection_checklist: "2.0.0-review",
  biopharma_upstream_control: "1.0.0-review",
  biopharma_downstream_clearance: "1.0.0-review",
  biopharma_formulation_stability: "1.0.0-review",
  biopharma_analytical_control_strategy: "1.0.0-review",
  biopharma_technology_transfer: "1.0.0-review",
  biopharma_materials_control: "1.0.0-review",
  biopharma_cell_substrate_control: "1.0.0-review",
  biopharma_process_validation_cpv: "1.0.0-review",
  pharma_api_impurity_control: "1.0.0-review",
};
const editorialReviewed = new Set([
  "oos_investigation_template",
  "biopharma_upstream_control",
  "biopharma_downstream_clearance",
  "biopharma_formulation_stability",
  "biopharma_analytical_control_strategy",
  "biopharma_technology_transfer",
  "biopharma_materials_control",
  "biopharma_cell_substrate_control",
  "biopharma_process_validation_cpv",
  "pharma_api_impurity_control",
]);

const customWorkbookStructure: Partial<Record<(typeof core)[number], { sheets: string[]; workingSheet: string }>> = {
  biopharma_upstream_control: {
    sheets: ["Quick Start", "Decision Brief", "Product Attributes", "Process Map", "Evidence Register", "Review & Actions", "Sources & Control", "Lists"],
    workingSheet: "Process Map",
  },
  biopharma_downstream_clearance: {
    sheets: ["Quick Start", "Decision Brief", "Targets & Attributes", "Unit Operations", "Clearance Claims", "Evidence Register", "Review & Actions", "Sources & Control", "Lists"],
    workingSheet: "Clearance Claims",
  },
  biopharma_formulation_stability: {
    sheets: ["Quick Start", "Decision Brief", "Quality & Pathways", "Formulation Map", "Process & Fill", "Stability Plan", "Evidence Register", "Review & Actions", "Sources & Control", "Lists"],
    workingSheet: "Stability Plan",
  },
  biopharma_analytical_control_strategy: {
    sheets: ["Quick Start", "Decision Brief", "Attribute Map", "Method Portfolio", "Specification Basis", "Reference Materials", "Lifecycle Changes", "Evidence Register", "Review & Actions", "Sources & Control", "Lists"],
    workingSheet: "Method Portfolio",
  },
  biopharma_technology_transfer: {
    sheets: ["Quick Start", "Decision Brief", "Scope & Governance", "Knowledge Package", "Facility & Equipment", "Process & Materials", "Analytical Transfer", "Validation & Commitments", "Evidence Register", "Review & Actions", "Sources & Control", "Lists"],
    workingSheet: "Validation & Commitments",
  },
  biopharma_materials_control: {
    sheets: ["Quick Start", "Decision Brief", "Material Contact Map", "Material Portfolio", "Supplier & Chain", "Functional Attributes", "Single-Use Systems", "Change Assessment", "Evidence Register", "Review & Actions", "Sources & Control", "Lists"],
    workingSheet: "Change Assessment",
  },
  biopharma_cell_substrate_control: {
    sheets: ["Quick Start", "Decision Brief", "Lineage & Construct", "Clone Development", "Bank Hierarchy", "Bank Manufacture", "Characterization", "Stability & Age", "Change Assessment", "Evidence Register", "Review & Actions", "Sources & Control"],
    workingSheet: "Stability & Age",
  },
  biopharma_process_validation_cpv: {
    sheets: ["Quick Start", "Decision Brief", "Lifecycle Map", "Process & Controls", "Qualification", "PPQ Evidence", "CPV Plan", "CPV Data", "Signal Assessment", "Evidence Register", "Review & Actions", "Sources & Control"],
    workingSheet: "CPV Data",
  },
  pharma_api_impurity_control: {
    sheets: ["Quick Start", "Decision Brief", "Route & Inputs", "Unit Operations", "Impurity Map", "Observed Fate", "Analytical Evidence", "Control Strategy", "Change Assessment", "Evidence Register", "Review & Actions", "Sources & Control"],
    workingSheet: "Observed Fate",
  },
};

describe("core toolkit quality packages", () => {
  for (const productId of core) {
    it(`${productId} ships a guide, blank workbook, fictional example and control metadata`, () => {
      const product = DELIVERABLES[productId];
      expect(product.quality).toMatchObject({ reviewStatus: editorialReviewed.has(productId) ? "editorial-reviewed" : "under-review", version: expectedVersions[productId] });
      expect(product.quality?.limitations.length).toBeGreaterThan(0);
      expect(product.files.some((file) => file.filename === "README.md")).toBe(true);
      expect(product.files.some((file) => file.filename.endsWith(".pdf"))).toBe(true);

      const workbookFiles = product.files.filter((file) => file.filename.endsWith(".xlsx") && file.generate !== "gap-xlsx");
      expect(workbookFiles).toHaveLength(2);
      expect(workbookFiles.some((file) => file.filename.includes("fictional-example"))).toBe(true);

      for (const file of workbookFiles) {
        const location = path.resolve(process.cwd(), "content", "deliverables", product.dir, file.filename);
        expect(existsSync(location)).toBe(true);
        const workbook = XLSX.read(readFileSync(location), { type: "buffer", cellFormula: true });
        const custom = customWorkbookStructure[productId];
        const expectedSheets = custom?.sheets ?? ["Quick Start", "Working Register", "Sources & Control", "Lists"];
        expect(workbook.SheetNames).toEqual(expectedSheets);
        const working = workbook.Sheets[custom?.workingSheet ?? "Working Register"];
        const formulas = Object.values(working).filter((cell: any) => cell && typeof cell === "object" && typeof cell.f === "string");
        expect(formulas.length).toBeGreaterThan(0);
        const controlText = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets["Sources & Control"], { header: 1 }).flat().join(" ");
        expect(controlText).toContain("Applicability and limitations");
        expect(controlText).toContain("Reviewed by role");
      }
    });
  }
});
