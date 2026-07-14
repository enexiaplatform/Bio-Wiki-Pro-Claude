import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";
import { createQualityLabProject, defaultQualityLabInput } from "../../shared/quality-lab";
import { createQualityLabEngagementPacket } from "../../shared/quality-lab-engagement";
import type { QualityLabReviewedProjectSnapshot } from "../../shared/quality-lab-persistence";
import { markdownToPdf, qualityLabDeliveryMarkdown, qualityLabDeliveryWorkbook } from "../generate";

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
      "Control Summary", "Demand Capacity", "Method Portfolio", "Equipment URS", "Consumables", "Open Inputs",
      "Evidence Register", "Rule Trace", "Review Checklist", "Decisions Corrections", "Calibration",
    ]);
    expect(workbook.Sheets["Control Summary"]["B22"].f).toContain("'Review Checklist'");
    expect(workbook.Sheets["Control Summary"]["B23"].f).toContain("'Method Portfolio'");
    expect(XLSX.utils.sheet_to_json(workbook.Sheets["Control Summary"], { header: 1 }).flat()).toContain("PAID PILOT EVIDENCE");
    expect(XLSX.utils.sheet_to_json(workbook.Sheets["Equipment URS"], { header: 1 })).toHaveLength(reviewedSnapshot().blueprint.equipment.length + 1);
  });

  it("generates a PDF decision brief that retains the control boundary", async () => {
    const markdown = qualityLabDeliveryMarkdown(reviewedSnapshot());
    expect(markdown).toContain("Release blockers");
    expect(markdown).toContain("Paid-pilot evidence");
    expect(markdown).toContain("not a validated design");
    const pdf = await markdownToPdf(markdown, "Atlas Blueprint Decision Brief");
    expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
    expect(pdf.length).toBeGreaterThan(1000);
  });
});
