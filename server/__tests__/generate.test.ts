import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";
import { createQualityLabProject, defaultQualityLabInput } from "../../shared/quality-lab";
import { createQualityLabEngagementPacket } from "../../shared/quality-lab-engagement";
import type { QualityLabReviewedProjectSnapshot } from "../../shared/quality-lab-persistence";
import { qualityLabDeliveryMarkdown, qualityLabDeliveryWorkbook, qualityLabRfqWorkbook, qualityLabSampleBlueprintPdf } from "../generate";
import { qualityLabBlueprintPdf } from "../quality-lab-blueprint-pdf";
import { qualityLabUrsDocument } from "../quality-lab-urs-docx";

function reviewedSnapshot(): QualityLabReviewedProjectSnapshot {
  const project = createQualityLabProject(defaultQualityLabInput, "qlp_delivery_test");
  project.reviewRequestedAt = "2026-07-14T00:00:00.000Z";
  const engagement = createQualityLabEngagementPacket(project, "2026-07-14T00:00:00.000Z");
  engagement.deliveryControl.preparedByRole = "Atlas project lead";
  return {
    localProjectId: project.id,
    projectName: project.name,
    input: project.input,
    blueprint: project.blueprint,
    engagement,
    reviewRequestedAt: project.reviewRequestedAt,
  };
}

describe("Quality Lab controlled delivery files", () => {
  it("generates an auditable workbook with formulas and all delivery registers", () => {
    const workbook = XLSX.read(qualityLabDeliveryWorkbook(reviewedSnapshot()), { type: "buffer", cellFormula: true });
    expect(workbook.SheetNames).toEqual([
      "Control Summary", "Demand Capacity", "Method Portfolio", "Equipment URS", "Consumables", "Open Inputs", "Action Register",
      "Evidence Register", "Rule Trace", "Model Controls", "Model Glossary", "Decision Lineage", "Readiness", "Review Checklist", "Decisions Corrections", "Calibration",
    ]);
    const summaryRows = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets["Control Summary"], { header: 1 });
    const summaryValue = (label: string) => summaryRows.find((row) => row[0] === label)?.[1];
    const summaryCell = (label: string) => workbook.Sheets["Control Summary"][`B${summaryRows.findIndex((row) => row[0] === label) + 1}`];
    expect(summaryCell("Review completion").f).toContain("'Review Checklist'");
    expect(summaryCell("Method evidence ready").f).toContain("'Method Portfolio'");
    expect(summaryRows.flat()).toContain("PAID PILOT EVIDENCE");
    expect(summaryValue("Primary decision")).toBe(defaultQualityLabInput.primaryDecision);
    expect(summaryValue("Decision owner")).toBe(defaultQualityLabInput.decisionOwnerRole);
    expect(summaryValue("Contract value USD")).toBe("");
    expect(summaryValue("Gross margin percent")).toBe("");
    expect(XLSX.utils.sheet_to_json(workbook.Sheets["Equipment URS"], { header: 1 })).toHaveLength(reviewedSnapshot().blueprint.equipment.length + 1);
    expect(XLSX.utils.sheet_to_json(workbook.Sheets["Action Register"], { header: 1 })).toHaveLength(reviewedSnapshot().blueprint.unresolvedInputs.length + 1);
    expect(XLSX.utils.sheet_to_json(workbook.Sheets["Decision Lineage"], { header: 1 })).toHaveLength(reviewedSnapshot().blueprint.decisionLineage.length + 1);
    expect(XLSX.utils.sheet_to_json(workbook.Sheets["Model Controls"], { header: 1 })).toHaveLength(reviewedSnapshot().blueprint.modelControls.length + 1);
    expect(XLSX.utils.sheet_to_json(workbook.Sheets["Model Glossary"], { header: 1 }).flat()).toContain("quality-lab-model-controls/v1");
    expect(XLSX.utils.sheet_to_json(workbook.Sheets["Readiness"], { header: 1 }).flat()).toContain("Decision readiness");
  });

  it("generates a PDF decision brief that retains the control boundary", async () => {
    const markdown = qualityLabDeliveryMarkdown(reviewedSnapshot());
    expect(markdown).toContain("Release blockers");
    expect(markdown).toContain("Paid-pilot evidence");
    expect(markdown).toContain("Project action register");
    expect(markdown).toContain("Decision mandate");
    expect(markdown).toContain("Model completeness");
    expect(markdown).toContain("Decision readiness");
    expect(markdown).toContain(defaultQualityLabInput.primaryDecision);
    expect(markdown).toContain("not a validated design");
    const pdf = await qualityLabBlueprintPdf(reviewedSnapshot());
    expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
    expect(pdf.length).toBeGreaterThan(40000);
    expect(pdf.toString("latin1")).toContain("/Count 17");
  });

  it("generates the URS document and RFQ workbook from the same controlled handoff", async () => {
    const snapshot = reviewedSnapshot();
    const docx = await qualityLabUrsDocument(snapshot);
    expect(docx.subarray(0, 2).toString()).toBe("PK");
    expect(docx.length).toBeGreaterThan(15000);

    const workbook = XLSX.read(qualityLabRfqWorkbook(snapshot), { type: "buffer", cellFormula: true });
    expect(workbook.SheetNames).toEqual(["RFQ Control", "Requirements", "Supplier Responses", "Comparison Summary", "Quote Scope", "Instructions"]);
    const controlRows = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets["RFQ Control"], { header: 1 });
    expect(controlRows.flat()).toEqual(expect.arrayContaining(["quality-lab-commercial-handoff/v1", "quality-lab-rfq-workbook/v1", "No"]));
    const requirementRows = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets["Requirements"], { header: 1 });
    expect(requirementRows).toHaveLength(snapshot.blueprint.equipment.filter((item) => item.quantityNow > 0 || item.quantityFuture > 0).length + 1);
    const comparison = workbook.Sheets["Comparison Summary"];
    expect(comparison.C2.f).toContain("'Requirements'");
    expect(comparison.I2.f).toBe("C2-D2");
    expect(XLSX.utils.sheet_to_json<unknown[]>(comparison, { header: 1 }).flat()).toContain("No automatic score, rank, equivalence or award recommendation.");
    expect(workbook.Sheets["Supplier Responses"].B2.f).toBe("IF('Comparison Summary'!B2=\"\",\"\",'Comparison Summary'!B2)");
    expect(workbook.Sheets["Quote Scope"].B2.f).toBe("IF('Comparison Summary'!B2=\"\",\"\",'Comparison Summary'!B2)");
  });

  it("generates the branded public Blueprint sample", async () => {
    const pdf = await qualityLabSampleBlueprintPdf();
    expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
    expect(pdf.length).toBeGreaterThan(40000);
    expect(pdf.toString("latin1")).toContain("/Count 17");
  });
});
