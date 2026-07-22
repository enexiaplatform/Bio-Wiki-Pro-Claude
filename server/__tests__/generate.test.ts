import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";
import { createQualityLabProject, defaultQualityLabInput } from "../../shared/quality-lab";
import { createQualityLabEngagementPacket } from "../../shared/quality-lab-engagement";
import type { QualityLabReviewedProjectSnapshot } from "../../shared/quality-lab-persistence";
import { markdownToPdf, qualityLabDeliveryMarkdown, qualityLabDeliveryWorkbook, qualityLabSampleBlueprintPdf } from "../generate";

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
      "Evidence Register", "Rule Trace", "Review Checklist", "Decisions Corrections", "Calibration",
    ]);
    const summaryRows = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets["Control Summary"], { header: 1 });
    const summaryValue = (label: string) => summaryRows.find((row) => row[0] === label)?.[1];
    const summaryCell = (label: string) => workbook.Sheets["Control Summary"][`B${summaryRows.findIndex((row) => row[0] === label) + 1}`];
    expect(summaryCell("Review completion").f).toContain("'Review Checklist'");
    expect(summaryCell("Method evidence ready").f).toContain("'Method Portfolio'");
    expect(summaryRows.flat()).toContain("PAID PILOT EVIDENCE");
    expect(summaryValue("Primary decision")).toBe(defaultQualityLabInput.primaryDecision);
    expect(summaryValue("Decision owner")).toBe(defaultQualityLabInput.decisionOwnerRole);
    expect(XLSX.utils.sheet_to_json(workbook.Sheets["Equipment URS"], { header: 1 })).toHaveLength(reviewedSnapshot().blueprint.equipment.length + 1);
    expect(XLSX.utils.sheet_to_json(workbook.Sheets["Action Register"], { header: 1 })).toHaveLength(reviewedSnapshot().blueprint.unresolvedInputs.length + 1);
  });

  it("generates a PDF decision brief that retains the control boundary", async () => {
    const markdown = qualityLabDeliveryMarkdown(reviewedSnapshot());
    expect(markdown).toContain("Release blockers");
    expect(markdown).toContain("Paid-pilot evidence");
    expect(markdown).toContain("Project action register");
    expect(markdown).toContain("Decision mandate");
    expect(markdown).toContain(defaultQualityLabInput.primaryDecision);
    expect(markdown).toContain("not a validated design");
    const pdf = await markdownToPdf(markdown, "Atlas Blueprint Decision Brief");
    expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
    expect(pdf.length).toBeGreaterThan(1000);
  });

  it("generates the branded public Blueprint sample", async () => {
    const pdf = await qualityLabSampleBlueprintPdf();
    expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
    expect(pdf.length).toBeGreaterThan(5000);
    expect(pdf.toString("latin1")).toContain("/Count 3");
  });
});
