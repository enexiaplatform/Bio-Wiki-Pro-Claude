// On-the-fly binary generation for deliverables: a real .xlsx (with working
// formulas) for the gap analysis, and .pdf rendering of the markdown guides.
// Keeps the repo source as MD/CSV but ships customers real Office/PDF files.
import XLSX from "xlsx-js-style";
import PDFDocument from "pdfkit";
import { qualityLabProjectFromReviewedSnapshot, type QualityLabReviewedProjectSnapshot } from "../shared/quality-lab-persistence.js";
import { createQualityLabDeliveryPackage } from "../shared/quality-lab-delivery.js";
import { assessPaidPilotEvidence } from "../shared/quality-lab-engagement.js";
import { qualityLabIllustrativeSamplePdf } from "./quality-lab-blueprint-pdf.js";
import { getQualityLabReadiness } from "../shared/quality-lab.js";
import { createQualityLabCommercialHandoff } from "../shared/quality-lab-commercial-handoff.js";

// 20 quality-system elements scored 0–2; % readiness computed by a live formula.
const GAP_ROWS: [number, string, string, string][] = [
  [1, "Document control", "Current vs superseded SOPs controlled and retrievable", "Critical"],
  [2, "Data integrity - access", "Unique logins; no shared accounts; least privilege", "Critical"],
  [3, "Data integrity - audit trail", "Audit trails on; reviewed; review recorded", "Critical"],
  [4, "OOS investigations", "Two-phase process; no testing into compliance", "Critical"],
  [5, "Deviation management", "Timely; risk-assessed; closed with rationale", "Critical"],
  [6, "CAPA", "Root cause verified; effectiveness checks defined", "Critical"],
  [7, "Batch record review", "Complete records; deviations closed before release", "Critical"],
  [8, "Change control", "Assessed and approved before implementation", "Major"],
  [9, "Cleaning validation", "HBEL-based limits; recovery study; worst case", "Major"],
  [10, "Environmental monitoring", "Alert/action levels; excursions ID'd and impact-assessed", "Major"],
  [11, "Equipment qualification", "IQ/OQ/PQ current; within calibration", "Major"],
  [12, "Calibration program", "Schedule met; out-of-tolerance handling defined", "Major"],
  [13, "Analytical method validation", "ICH Q2 characteristics; acceptance criteria pre-set", "Major"],
  [14, "Stability program", "Ongoing batch/year; protocol; excursion handling", "Major"],
  [15, "Supplier qualification", "Risk tiers; quality agreements; change notification", "Major"],
  [16, "Training & qualification", "Records match who performed the work", "Major"],
  [17, "Water system", "Validated; monitored; alert/action; sanitization", "Major"],
  [18, "Sterility assurance (if sterile)", "CCS; media fills; gowning qualification", "Critical"],
  [19, "Complaint handling", "Logged; investigated; trended; linked to CAPA", "Minor"],
  [20, "Self-inspection", "Risk-based schedule; independent; findings to CAPA", "Minor"],
];

/** Build the SOP Gap Analysis as a real .xlsx with live SUM/% formulas. */
export function gapAnalysisWorkbook(): Buffer {
  const aoa: any[][] = [
    ["GMP Audit Readiness — SOP Gap Analysis"],
    ["Score each element 0-2 (0=absent, 1=partial, 2=compliant with evidence). % Readiness updates automatically."],
    [],
    ["#", "Quality System Element", "What the auditor checks", "Score (0-2)", "Priority", "Notes / Action"],
  ];
  for (const [n, el, chk, pri] of GAP_ROWS) {
    aoa.push([n, el, chk, "", pri, ""]);
  }
  aoa.push([]); // row 25
  aoa.push(["", "", "Total score", null, "", ""]); // row 26 → D26 formula
  aoa.push(["", "", "Maximum possible", 40, "", ""]); // row 27 → D27
  aoa.push(["", "", "% Readiness", null, "", "Aim for 90%+ before an inspection"]); // row 28 → D28

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  // Live formulas (column D). Score cells are D5:D24.
  ws["D26"] = { t: "n", f: "SUM(D5:D24)" };
  ws["D28"] = { t: "n", f: "IF(D27=0,0,ROUND(D26/D27*100,0))" };
  ws["!cols"] = [{ wch: 4 }, { wch: 30 }, { wch: 48 }, { wch: 10 }, { wch: 10 }, { wch: 28 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Gap Analysis");
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
}

// ── Markdown → PDF (lightweight; headings, paragraphs, lists, code, quotes) ──
const DELIVERY_HEADER_STYLE = {
  font: { bold: true, color: { rgb: "FFFFFF" } },
  fill: { patternType: "solid", fgColor: { rgb: "0F766E" } },
  alignment: { vertical: "center", wrapText: true },
};

const DELIVERY_TITLE_STYLE = {
  font: { bold: true, color: { rgb: "FFFFFF" }, sz: 18 },
  fill: { patternType: "solid", fgColor: { rgb: "0B1220" } },
  alignment: { vertical: "center" },
};

function applyDeliverySheetLayout(ws: XLSX.WorkSheet, widths: number[], headerRow = 0) {
  const effectiveWidths = widths.map((wch) => Math.min(wch, 48));
  ws["!cols"] = effectiveWidths.map((wch) => ({ wch }));
  ws["!autofilter"] = ws["!ref"] ? { ref: XLSX.utils.encode_range({ r: headerRow, c: 0 }, XLSX.utils.decode_range(ws["!ref"]).e) } : undefined;
  ws["!freeze"] = { xSplit: 0, ySplit: headerRow + 1, topLeftCell: `A${headerRow + 2}`, activePane: "bottomLeft", state: "frozen" } as any;
  const range = ws["!ref"] ? XLSX.utils.decode_range(ws["!ref"]) : null;
  if (!range) return;
  ws["!rows"] = Array.from({ length: range.e.r + 1 }, (_, row) => {
    if (row === headerRow) return { hpt: 30 };
    let maxLines = 1;
    for (let column = range.s.c; column <= range.e.c; column += 1) {
      const value = ws[XLSX.utils.encode_cell({ r: row, c: column })]?.v;
      if (value === undefined || value === null || value === "") continue;
      const width = Math.max(8, effectiveWidths[column] ?? 12);
      const lines = String(value).split("\n").reduce((count, line) => count + Math.max(1, Math.ceil(line.length / width)), 0);
      maxLines = Math.max(maxLines, lines);
    }
    return { hpt: Math.min(240, Math.max(42, maxLines * 15 + 8)) };
  });
  for (let row = range.s.r; row <= range.e.r; row += 1) {
    for (let column = range.s.c; column <= range.e.c; column += 1) {
      const cell = ws[XLSX.utils.encode_cell({ r: row, c: column })];
      if (!cell) continue;
      if (row === headerRow) {
        cell.s = DELIVERY_HEADER_STYLE;
      } else {
        cell.s = {
          font: { color: { rgb: "243142" }, sz: 10 },
          fill: { patternType: "solid", fgColor: { rgb: "FFFFFF" } },
          alignment: { vertical: "top", wrapText: true, horizontal: cell.t === "n" ? "right" : "left" },
          border: { bottom: { style: "thin", color: { rgb: "E2E8F0" } } },
          numFmt: cell.t === "n" ? (Number.isInteger(cell.v) ? "#,##0" : "#,##0.0") : undefined,
        };
      }
    }
  }
}

function addDeliverySheet(wb: XLSX.WorkBook, name: string, rows: unknown[][], widths: number[]) {
  const ws = XLSX.utils.aoa_to_sheet(rows);
  applyDeliverySheetLayout(ws, widths);
  XLSX.utils.book_append_sheet(wb, ws, name);
  return ws;
}

/** Build a controlled working workbook for an authenticated reviewed Blueprint. */
export function qualityLabDeliveryWorkbook(snapshot: QualityLabReviewedProjectSnapshot): Buffer {
  if (!snapshot.engagement) throw new Error("A review engagement packet is required before delivery export");
  const project = qualityLabProjectFromReviewedSnapshot(snapshot);
  const packet = snapshot.engagement;
  const delivery = createQualityLabDeliveryPackage(project, packet);
  const pilot = assessPaidPilotEvidence(packet, delivery.readiness);
  const blueprint = snapshot.blueprint;
  const readiness = getQualityLabReadiness(blueprint);
  const wb = XLSX.utils.book_new();
  wb.Props = { Title: `${snapshot.projectName} - Atlas Quality Lab Blueprint Delivery`, Subject: delivery.control.intendedUse, Author: "Life Science Atlas", CreatedDate: new Date(delivery.generatedAt) };

  const summaryRows: unknown[][] = [
    ["ATLAS QUALITY LAB BLUEPRINT - DELIVERY CONTROL", ""],
    ["Package version", delivery.packageVersion], ["Project", snapshot.projectName], ["Project ID", snapshot.localProjectId],
    [], ["DECISION MANDATE", ""], ["Primary decision", snapshot.input.primaryDecision], ["Project intent", snapshot.input.projectIntent],
    ["Decision owner", snapshot.input.decisionOwnerRole], ["Decision window", snapshot.input.decisionWindow], ["Scenario label", snapshot.input.scenarioLabel],
    [], ["DOCUMENT CONTROL", ""],
    ["Document ID", delivery.control.documentId], ["Revision", delivery.control.revision], ["Recorded status", delivery.control.recordedStatus],
    ["Computed readiness", delivery.readiness.status], ["Intended use", delivery.control.intendedUse], ["Prepared by role", delivery.control.preparedByRole],
    ["Reviewed by role", delivery.control.reviewedByRole], ["External approval reference", delivery.control.externalApprovalReference], ["Generated at", delivery.generatedAt],
    ["Input contract", delivery.sourceVersions.inputContract], ["Output contract", delivery.sourceVersions.outputContract], ["Compiler Core", delivery.sourceVersions.compilerCore], ["Domain Pack", delivery.sourceVersions.domainPack],
    [], ["READINESS METRIC", "VALUE"], ["Blocking inputs", blueprint.dataQuality.blockingOpenCount], ["Important inputs", blueprint.dataQuality.importantOpenCount],
    ["Review completion", null], ["Method evidence ready", null], ["URS basis ready", null], [],
    ["PAID PILOT EVIDENCE", ""], ["Pilot eligibility", pilot.eligibility], ["Engagement class", packet.pilotControl.engagementClass],
    ["Commercial status", packet.pilotControl.commercialStatus], ["Commercial evidence reference", packet.pilotControl.commercialEvidenceReference],
    ["Service started", packet.pilotControl.serviceStartedAt], ["Scope confirmed", packet.pilotControl.scopeConfirmedAt],
    ["First controlled delivery", packet.pilotControl.firstControlledDeliveryAt], ["Delivery calendar days", pilot.deliveryCalendarDays],
    ["Delivery effort hours", pilot.deliveryEffortHours], ["Acceptance status", packet.pilotControl.acceptanceStatus],
    ["Client acceptance time", packet.pilotControl.clientAcceptanceAt], ["Acceptance reference", packet.pilotControl.acceptanceReference],
    ["Outcome note", packet.pilotControl.outcomeNote], [], ["PILOT EVIDENCE BLOCKERS", ""],
    ...pilot.blockers.map((item) => ["", item]), [], ["RELEASE BLOCKERS", ""],
    ...delivery.readiness.blockers.map((item) => ["", item]), [], ["CAUTIONS", ""], ...delivery.readiness.cautions.map((item) => ["", item]), [], ["CONTROL NOTICE", delivery.controlNotice],
  ];
  const summary = XLSX.utils.aoa_to_sheet(summaryRows);
  summary["!cols"] = [{ wch: 34 }, { wch: 72 }];
  summary["!rows"] = summaryRows.map((row, index) => ({ hpt: index === 0 ? 34 : row[0] === "CONTROL NOTICE" ? 46 : 24 }));
  summary["!merges"] = [XLSX.utils.decode_range("A1:B1")];
  const summarySectionLabels = new Set(["DECISION MANDATE", "DOCUMENT CONTROL", "READINESS METRIC", "PAID PILOT EVIDENCE", "PILOT EVIDENCE BLOCKERS", "RELEASE BLOCKERS", "CAUTIONS", "CONTROL NOTICE"]);
  summaryRows.forEach((row, index) => {
    const isSection = summarySectionLabels.has(String(row[0] ?? ""));
    for (let column = 0; column < 2; column += 1) {
      const address = XLSX.utils.encode_cell({ r: index, c: column });
      const cell = summary[address] ?? (summary[address] = { t: "s", v: "" });
      if (index === 0) continue;
      cell.s = isSection ? DELIVERY_HEADER_STYLE : {
        font: { bold: column === 0, color: { rgb: column === 0 ? "334155" : "0F172A" }, sz: 10 },
        fill: { patternType: "solid", fgColor: { rgb: column === 0 ? "F1F5F9" : "FFFFFF" } },
        alignment: { vertical: "top", wrapText: true, horizontal: cell.t === "n" ? "right" : "left" },
        border: { bottom: { style: "thin", color: { rgb: "E2E8F0" } } },
        numFmt: cell.t === "n" ? "#,##0.0" : undefined,
      };
    }
  });
  summary["A1"].s = DELIVERY_TITLE_STYLE;
  const percentStyle = { font: { color: { rgb: "0F172A" }, sz: 10 }, fill: { patternType: "solid", fgColor: { rgb: "FFFFFF" } }, alignment: { horizontal: "right" }, border: { bottom: { style: "thin", color: { rgb: "E2E8F0" } } }, numFmt: "0%" };
  const summaryValueCell = (label: string) => `B${summaryRows.findIndex((row) => row[0] === label) + 1}`;
  summary[summaryValueCell("Review completion")] = { t: "n", f: "IFERROR((COUNTIF('Review Checklist'!D2:D1000,\"resolved\")+COUNTIF('Review Checklist'!D2:D1000,\"not-applicable\"))/COUNTA('Review Checklist'!A2:A1000),0)", v: delivery.readiness.totalReviewItems ? delivery.readiness.completedReviewItems / delivery.readiness.totalReviewItems : 0, s: percentStyle };
  summary[summaryValueCell("Method evidence ready")] = { t: "n", f: "IFERROR(COUNTIF('Method Portfolio'!J2:J1000,\"ready-for-qualified-review\")/COUNTA('Method Portfolio'!A2:A1000),0)", v: delivery.readiness.totalMethodEvidence ? delivery.readiness.methodEvidenceReady / delivery.readiness.totalMethodEvidence : 0, s: percentStyle };
  summary[summaryValueCell("URS basis ready")] = { t: "n", f: "IFERROR(COUNTIF('Equipment URS'!K2:K1000,\"ready-for-qualified-review\")/COUNTA('Equipment URS'!A2:A1000),0)", v: delivery.readiness.totalUrsItems ? delivery.readiness.ursItemsReady / delivery.readiness.totalUrsItems : 0, s: percentStyle };
  XLSX.utils.book_append_sheet(wb, summary, "Control Summary");

  addDeliverySheet(wb, "Demand Capacity", [
    ["Scenario", "Monthly tests", "Team FTE", "Estimated area m2", "CAPEX low USD", "CAPEX high USD", "Annual OPEX low USD", "Annual OPEX high USD"],
    ["Current", blueprint.current.monthlyTests, blueprint.current.totalTeamFte, blueprint.current.estimatedAreaSqm, blueprint.current.capexLowUsd, blueprint.current.capexHighUsd, blueprint.current.annualOpexLowUsd, blueprint.current.annualOpexHighUsd],
    [`Year ${snapshot.input.horizonYears}`, blueprint.future.monthlyTests, blueprint.future.totalTeamFte, blueprint.future.estimatedAreaSqm, blueprint.future.capexLowUsd, blueprint.future.capexHighUsd, blueprint.future.annualOpexLowUsd, blueprint.future.annualOpexHighUsd],
  ], [18, 16, 12, 20, 18, 18, 22, 22]);

  addDeliverySheet(wb, "Method Portfolio", [["Requirement ID", "Product", "Market", "Requirement", "Method", "Execution", "Monthly tests", "Verification requirement", "Evidence IDs", "Review status", "Reviewer note"], ...blueprint.methodRequirements.map((item) => {
    const review = packet.methodEvidenceMatrix.find((row) => row.id === `method-evidence-${item.id}`);
    return [item.id, item.productName, item.market, item.requirementType, item.methodName, item.execution, item.allocatedMonthlyExecutions, item.verificationRequirement, item.evidenceIds.join(" | "), review?.status ?? "draft", review?.reviewerNote ?? ""];
  })], [24, 24, 14, 20, 34, 14, 14, 55, 38, 28, 55]);

  addDeliverySheet(wb, "Equipment URS", [["Equipment ID", "Equipment", "Category", "Qty current", "Qty future", "Unit budget low USD", "Unit budget high USD", "Functional requirement", "Qualification impact", "Evidence IDs", "Review status"], ...blueprint.equipment.map((item) => {
    const urs = packet.ursBasis.find((row) => row.id === `urs-basis-${item.id}`);
    return [item.id, item.name, item.category, item.quantityNow, item.quantityFuture, item.unitCapexLowUsd, item.unitCapexHighUsd, urs?.functionalRequirement ?? item.specification, urs?.qualificationImpact ?? "Qualified review required", (urs?.evidenceIds ?? item.evidenceIds ?? []).join(" | "), urs?.status ?? "draft"];
  })], [22, 28, 18, 12, 12, 20, 20, 60, 60, 36, 28]);

  addDeliverySheet(wb, "Consumables", [["Consumable", "Unit", "Monthly current", "Monthly future", "Annual spend low USD", "Annual spend high USD", "Unit cost low USD", "Unit cost high USD"], ...blueprint.consumables.map((item) => {
    const supply = blueprint.consumableSupply?.current.find((row) => row.id === item.id);
    return [item.name, item.unit, item.quantityPerMonthNow, item.quantityPerMonthFuture, supply?.annualSpendLowUsd ?? item.quantityPerMonthNow * item.unitCostLowUsd * 12, supply?.annualSpendHighUsd ?? item.quantityPerMonthNow * item.unitCostHighUsd * 12, item.unitCostLowUsd, item.unitCostHighUsd];
  })], [30, 16, 18, 18, 22, 22, 20, 20]);

  addDeliverySheet(wb, "Open Inputs", [["Input ID", "Severity", "Category", "Question", "Decision impact", "Resolution", "Related rule IDs"], ...blueprint.unresolvedInputs.map((item) => [item.id, item.severity, item.category, item.question, item.impact, item.resolution, item.relatedRuleIds.join(" | ")])], [24, 14, 16, 62, 58, 58, 36]);

  addDeliverySheet(wb, "Action Register", [["Action ID", "Source input", "Severity", "Status", "Owner role", "Due date", "Question", "Required evidence", "Evidence note", "Last updated"], ...project.actionPlan.actions.map((item) => [item.id, item.sourceInputId, item.severity, item.status, item.ownerRole, item.dueDate, item.question, item.requiredEvidence, item.evidenceNote, item.updatedAt])], [26, 24, 14, 20, 26, 16, 62, 62, 62, 24]);

  addDeliverySheet(wb, "Evidence Register", [["Evidence ID", "Title", "Kind", "Status", "Publisher", "Version", "Locator", "Scope", "Limitations"], ...blueprint.evidence.map((item) => [item.id, item.title, item.kind, item.status, item.publisher, item.version, item.locator, item.scope, item.limitations])], [28, 42, 24, 24, 28, 18, 52, 65, 65]);

  addDeliverySheet(wb, "Rule Trace", [["Rule ID", "Rule version", "Domain Pack", "Output types", "Applicability", "Confidence", "Review required", "Evidence IDs", "Limitations"], ...blueprint.ruleTrace.map((item) => [item.ruleId, item.ruleVersion, item.domainPackId, item.outputTypes.join(" | "), item.applicability, item.confidence, item.reviewRequired ? "Yes" : "No", item.evidenceIds.join(" | "), item.limitations])], [30, 18, 28, 28, 65, 16, 18, 38, 65]);

  addDeliverySheet(wb, "Decision Lineage", [["Lineage ID", "Decision type", "Output key", "Conclusion", "Current output", "Calculation", "Input paths", "Rule versions", "Evidence versions", "Assumptions", "Limitations", "Open inputs", "Material change factors"], ...blueprint.decisionLineage.map((item) => [item.id, item.decisionType, item.outputKey, item.summary, item.currentOutput, item.calculation, item.contributingInputPaths.join(" | "), item.ruleRefs.map((ref) => `${ref.id}@${ref.version}`).join(" | "), item.evidenceRefs.map((ref) => `${ref.id}@${ref.version}`).join(" | "), item.assumptionIds.join(" | "), item.limitations.join(" | "), item.unresolvedInputIds.join(" | "), item.materialChangeFactors.join(" | ")])], [36, 18, 32, 55, 22, 70, 55, 55, 55, 40, 70, 45, 55]);

  addDeliverySheet(wb, "Readiness", [["Measure", "Dimension / stage", "Score", "Status", "Summary", "Related open inputs", "Formula / next gate"], ["Model completeness", "Overall", readiness.modelCompleteness.score, "calculated", readiness.modelCompleteness.summary, "", readiness.modelCompleteness.formula], ...readiness.modelCompleteness.dimensions.map((item) => ["Model completeness", item.label, item.score, item.status, item.summary, item.relatedUnresolvedInputIds.join(" | "), ""]), ["Evidence readiness", "Overall", readiness.evidenceReadiness.score, "calculated", readiness.evidenceReadiness.summary, "", readiness.evidenceReadiness.formula], ...readiness.evidenceReadiness.dimensions.map((item) => ["Evidence readiness", item.label, item.score, item.status, item.summary, item.relatedUnresolvedInputIds.join(" | "), ""]), ["Decision readiness", readiness.decisionReadiness.label, readiness.decisionReadiness.score, readiness.decisionReadiness.stage, readiness.decisionReadiness.summary, readiness.decisionReadiness.blockingInputIds.join(" | "), `${readiness.decisionReadiness.formula} Next gate: ${readiness.decisionReadiness.nextGate}`]], [22, 30, 12, 22, 70, 45, 75]);

  addDeliverySheet(wb, "Review Checklist", [["Review item ID", "Owner role", "Question", "Status", "Required evidence", "Related rule IDs", "Reviewer note"], ...packet.checklist.map((item) => [item.id, item.ownerRole, item.question, item.status, item.requiredEvidence, item.relatedRuleIds.join(" | "), item.reviewerNote])], [28, 24, 62, 18, 62, 36, 62]);

  addDeliverySheet(wb, "Decisions Corrections", [["Record type", "Recorded at", "Field, rule or decision", "Previous value / options", "Corrected value", "Evidence / rationale", "Owner or reviewer", "Downstream impact"], ...packet.corrections.map((item) => ["Correction", item.recordedAt, item.fieldOrRuleId, item.previousValue, item.correctedValue, `${item.evidenceRef} | ${item.rationale}`, item.reviewerRole, ""]), ...packet.decisions.map((item) => ["Decision", item.recordedAt, item.decision, item.optionsConsidered.join(" | "), "", item.rationale, item.owner, item.downstreamImpact])], [18, 22, 42, 45, 32, 65, 28, 55]);

  addDeliverySheet(wb, "Calibration", [["Metric", "Estimate", "Actual", "Variance %", "Variance driver", "Actual basis", "Reviewer note", "Observed period", "Data owner", "Evidence references", "Learning disposition", "Applicable rule IDs"], ...Object.entries(packet.baseline).map(([metric, value]) => {
    const note = packet.calibration.metricNotes.find((item) => item.metric === metric);
    return [metric, value.estimate, value.actual, value.variancePercent === null ? null : value.variancePercent / 100, note?.varianceDriver ?? "not-assessed", note?.actualBasis ?? "", note?.reviewerNote ?? "", `${packet.calibration.observedPeriodStart} to ${packet.calibration.observedPeriodEnd}`, packet.calibration.dataOwner, packet.calibration.evidenceRefs.join(" | "), packet.calibration.learningDisposition, packet.calibration.applicableRuleIds.join(" | ")];
  })], [24, 16, 16, 14, 24, 50, 50, 28, 24, 50, 28, 40]);

  wb.Workbook = { Views: [{ RTL: false }] };
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx", cellStyles: true });
}

/** Build a supplier-neutral RFQ response and comparison workbook from the same versioned handoff contract as the URS document. */
export function qualityLabRfqWorkbook(snapshot: QualityLabReviewedProjectSnapshot): Buffer {
  if (!snapshot.engagement) throw new Error("A review engagement packet is required before RFQ export");
  const project = qualityLabProjectFromReviewedSnapshot(snapshot);
  const handoff = createQualityLabCommercialHandoff(project, snapshot.engagement);
  const wb = XLSX.utils.book_new();
  wb.Props = { Title: `${snapshot.projectName} - Vendor-neutral RFQ Comparison`, Subject: handoff.controls.notice, Author: "Life Science Atlas", CreatedDate: new Date(handoff.generatedAt) };

  addDeliverySheet(wb, "RFQ Control", [
    ["Control field", "Value"],
    ["Workbook contract", handoff.rfqWorkbookVersion],
    ["Handoff contract", handoff.handoffVersion],
    ["Project", handoff.project.name],
    ["Project ID", handoff.project.id],
    ["Project revision", handoff.project.revisionReference],
    ["Document ID", handoff.documentControl.documentId],
    ["Revision", handoff.documentControl.revision],
    ["Handoff status", handoff.status],
    ["Generated at", handoff.generatedAt],
    ["Input contract", handoff.sourceVersions.inputContract],
    ["Output contract", handoff.sourceVersions.outputContract],
    ["Compiler Core", handoff.sourceVersions.compilerCore],
    ["Blueprint engine", handoff.sourceVersions.blueprintEngine],
    ["Domain Pack", handoff.sourceVersions.domainPack],
    ["Vendor-neutral", "Yes"],
    ["Automatic supplier selection", "No"],
    ["Product equivalence asserted", "No"],
    ["Approved engineering specification", "No"],
    ["Control notice", handoff.controls.notice],
  ], [32, 100]);

  addDeliverySheet(wb, "Requirements", [[
    "Requirement ID", "Equipment ID", "Equipment", "Category", "Intended use", "Qty current", "Qty planning horizon", "Quantity status",
    "Functional requirements", "Performance requirements", "Utilities and interfaces", "Qualification impact", "Explicit exclusions", "Supplier evidence requested",
    "Method requirement IDs", "Rule references", "Evidence references", "Decision Lineage IDs", "Unresolved input IDs", "Handoff status", "Blockers",
  ], ...handoff.requirements.map((item) => [
    item.requirementId, item.equipmentId, item.equipmentName, item.equipmentCategory, item.intendedUse, item.quantityBasis.current, item.quantityBasis.planningHorizon, item.quantityBasis.status,
    item.functionalRequirements.join("\n"), item.performanceRequirements.join("\n"), item.utilitiesAndInterfaces.join("\n"), item.qualificationImpact, item.exclusions.join("\n"), item.supplierEvidenceRequested.join("\n"),
    item.relatedMethodRequirementIds.join(" | "), item.ruleRefs.map((ref) => `${ref.id}@${ref.version}`).join(" | "), item.evidenceRefs.map((ref) => `${ref.id}@${ref.version}`).join(" | "), item.decisionLineageIds.join(" | "), item.unresolvedInputIds.join(" | "), item.handoffStatus, item.blockers.join("\n"),
  ])], [28, 24, 30, 22, 60, 14, 18, 18, 65, 70, 70, 60, 70, 70, 45, 50, 50, 45, 40, 24, 70]);

  const supplierSlots = ["Supplier A", "Supplier B", "Supplier C"];
  const responseRows = supplierSlots.flatMap((supplier, supplierIndex) => handoff.requirements.map((item) => [
    supplier, { t: "s", f: `IF('Comparison Summary'!B${supplierIndex + 2}="","",'Comparison Summary'!B${supplierIndex + 2})`, v: "" }, item.requirementId, "", "", "", "", "", "",
  ]));
  const responses = addDeliverySheet(wb, "Supplier Responses", [[
    "Supplier slot", "Supplier legal name", "Requirement ID", "Declared response", "Offered configuration / approach", "Technical evidence reference", "Deviation or exception", "Clarification requested", "Reviewer note",
  ], ...responseRows], [18, 30, 30, 24, 55, 45, 55, 55, 55]);
  responses["!autofilter"] = { ref: `A1:I${responseRows.length + 1}` };

  const comparisonRows: unknown[][] = [["Supplier slot", "Supplier legal name", "Requirements", "Responses recorded", "Declared comply", "Deviation", "Clarification required", "Not offered", "Open responses", "Decision boundary"]];
  supplierSlots.forEach((slot, index) => comparisonRows.push([slot, "", null, null, null, null, null, null, null, "No automatic score, rank, equivalence or award recommendation."]));
  const comparison = addDeliverySheet(wb, "Comparison Summary", comparisonRows, [18, 30, 18, 20, 18, 16, 24, 16, 18, 65]);
  supplierSlots.forEach((slot, index) => {
    const row = index + 2;
    const quoted = slot.replaceAll('"', '""');
    const formulas = [
      ["C", `COUNTA('Requirements'!A2:A${handoff.requirements.length + 1})`],
      ["D", `COUNTIFS('Supplier Responses'!A2:A${responseRows.length + 1},"${quoted}",'Supplier Responses'!D2:D${responseRows.length + 1},"<>")`],
      ["E", `COUNTIFS('Supplier Responses'!A2:A${responseRows.length + 1},"${quoted}",'Supplier Responses'!D2:D${responseRows.length + 1},"comply")`],
      ["F", `COUNTIFS('Supplier Responses'!A2:A${responseRows.length + 1},"${quoted}",'Supplier Responses'!D2:D${responseRows.length + 1},"deviation")`],
      ["G", `COUNTIFS('Supplier Responses'!A2:A${responseRows.length + 1},"${quoted}",'Supplier Responses'!D2:D${responseRows.length + 1},"clarification-required")`],
      ["H", `COUNTIFS('Supplier Responses'!A2:A${responseRows.length + 1},"${quoted}",'Supplier Responses'!D2:D${responseRows.length + 1},"not-offered")`],
      ["I", `C${row}-D${row}`],
    ];
    formulas.forEach(([column, formula]) => {
      comparison[`${column}${row}`] = {
        t: "n",
        f: formula,
        v: column === "C" || column === "I" ? handoff.requirements.length : 0,
        s: {
          font: { color: { rgb: "123C3A" }, sz: 10, bold: true },
          fill: { patternType: "solid", fgColor: { rgb: "E7F4F2" } },
          alignment: { vertical: "top", horizontal: "right" },
          border: { bottom: { style: "thin", color: { rgb: "B7D9D4" } } },
          numFmt: "#,##0",
        },
      };
    });
  });

  const supplierNameInputStyle = {
    font: { color: { rgb: "243142" }, sz: 10, bold: true },
    fill: { patternType: "solid", fgColor: { rgb: "FFF4CC" } },
    alignment: { vertical: "top", wrapText: true },
    border: { bottom: { style: "thin", color: { rgb: "D6A800" } } },
  };
  supplierSlots.forEach((_, index) => { comparison[`B${index + 2}`].s = supplierNameInputStyle; });
  for (let row = 2; row <= responseRows.length + 1; row += 1) {
    for (const column of ["D", "E", "F", "G", "H", "I"]) {
      responses[`${column}${row}`].s = {
        font: { color: { rgb: "243142" }, sz: 10 },
        fill: { patternType: "solid", fgColor: { rgb: "FFFBEA" } },
        alignment: { vertical: "top", wrapText: true },
        border: { bottom: { style: "thin", color: { rgb: "E9D88A" } } },
      };
    }
  }

  const quoteScope = addDeliverySheet(wb, "Quote Scope", [[
    "Supplier slot", "Supplier legal name", "Quote reference", "Currency", "Total quoted price", "Lead time days", "Installation and commissioning scope", "Qualification support", "Training", "Warranty", "Service response", "Quote validity date", "Explicit commercial exclusions", "Clarifications",
  ], ...supplierSlots.map((slot, index) => [slot, { t: "s", f: `IF('Comparison Summary'!B${index + 2}="","",'Comparison Summary'!B${index + 2})`, v: "" }, "", "", "", "", "", "", "", "", "", "", "", ""])], [18, 30, 24, 14, 22, 18, 55, 45, 35, 28, 35, 22, 55, 55]);
  supplierSlots.forEach((_, index) => {
    const row = index + 2;
    quoteScope[`B${row}`].s = {
      font: { color: { rgb: "123C3A" }, sz: 10 },
      fill: { patternType: "solid", fgColor: { rgb: "E7F4F2" } },
      alignment: { vertical: "top", wrapText: true },
      border: { bottom: { style: "thin", color: { rgb: "B7D9D4" } } },
    };
    for (const column of ["C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N"]) {
      quoteScope[`${column}${row}`] ??= { t: "z", v: undefined };
      quoteScope[`${column}${row}`].s = {
        font: { color: { rgb: "243142" }, sz: 10 },
        fill: { patternType: "solid", fgColor: { rgb: "FFFBEA" } },
        alignment: { vertical: "top", wrapText: true, horizontal: ["E", "F"].includes(column) ? "right" : "left" },
        border: { bottom: { style: "thin", color: { rgb: "E9D88A" } } },
      };
    }
  });

  addDeliverySheet(wb, "Instructions", [["Step", "Controlled instruction"],
    [1, "Enter each supplier legal name once in Comparison Summary. Supplier Responses and Quote Scope reference those cells automatically."],
    [2, "Record one declared response for every requirement ID: comply, deviation, clarification-required or not-offered."],
    [3, "Require technical evidence for every comply declaration. Blank cells are open responses, not compliance."],
    [4, "Record deviations, assumptions, dependencies, utilities, interfaces and exclusions verbatim enough for qualified review."],
    [5, "Use Quote Scope for commercial terms. Do not mix price with technical compliance declarations."],
    [6, "The workbook intentionally contains no score, rank, product-equivalence claim or automatic supplier recommendation."],
    [7, "Qualified users must approve the URS, resolve clarifications and make any award decision under their procurement and quality systems."],
  ], [12, 110]);

  wb.Workbook = { Views: [{ RTL: false }] };
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx", cellStyles: true });
}

export function qualityLabDeliveryMarkdown(snapshot: QualityLabReviewedProjectSnapshot): string {
  if (!snapshot.engagement) throw new Error("A review engagement packet is required before delivery export");
  const project = qualityLabProjectFromReviewedSnapshot(snapshot);
  const delivery = createQualityLabDeliveryPackage(project, snapshot.engagement);
  const pilot = assessPaidPilotEvidence(snapshot.engagement, delivery.readiness);
  const blueprint = snapshot.blueprint;
  const readiness = getQualityLabReadiness(blueprint);
  return [
    `# ${snapshot.projectName}`, "## Atlas Quality Lab Blueprint - Decision Brief",
    `Document: ${delivery.control.documentId || "Unassigned"} | Revision: ${delivery.control.revision} | Status: ${delivery.readiness.status}`,
    `Generated: ${delivery.generatedAt}`, "", `> ${delivery.controlNotice}`, "", "## Decision mandate",
    `- Primary decision: ${snapshot.input.primaryDecision}`,
    `- Project intent: ${snapshot.input.projectIntent}`,
    `- Decision owner: ${snapshot.input.decisionOwnerRole}`,
    `- Decision window: ${snapshot.input.decisionWindow}`,
    `- Scenario: ${snapshot.input.scenarioLabel}`,
    "", "## Executive basis",
    `- Facility: ${snapshot.input.facilityType} in ${snapshot.input.country}`,
    `- Current demand: ${blueprint.current.monthlyTests.toLocaleString("en-US")} modeled tests/month`,
    `- Current team basis: ${blueprint.current.totalTeamFte} FTE`, `- Current area basis: ${blueprint.current.estimatedAreaSqm} m2`,
    `- Current CAPEX allowance: USD ${blueprint.current.capexLowUsd.toLocaleString("en-US")} to ${blueprint.current.capexHighUsd.toLocaleString("en-US")}`,
    `- Model completeness: ${readiness.modelCompleteness.score}%`,
    `- Evidence readiness: ${readiness.evidenceReadiness.score}%`,
    `- Decision readiness: ${readiness.decisionReadiness.label} (${readiness.decisionReadiness.score}%)`,
    `- Controlled-use blockers: ${blueprint.dataQuality.blockingOpenCount}`, "", "## Project action register",
    ...project.actionPlan.actions.map((item) => `- [${item.status}] ${item.question} | Owner: ${item.ownerRole || "Unassigned"} | Due: ${item.dueDate || "Open"} | Evidence: ${item.evidenceNote || item.requiredEvidence}`),
    "", "## Paid-pilot evidence",
    `- Eligibility: ${pilot.eligibility}`, `- Engagement class: ${snapshot.engagement.pilotControl.engagementClass}`,
    `- Commercial status: ${snapshot.engagement.pilotControl.commercialStatus}`, `- Commercial evidence reference: ${snapshot.engagement.pilotControl.commercialEvidenceReference || "Open"}`,
    `- Delivery time: ${pilot.deliveryCalendarDays === null ? "Open" : `${pilot.deliveryCalendarDays} calendar days`}`,
    `- Delivery effort: ${pilot.deliveryEffortHours === null ? "Open" : `${pilot.deliveryEffortHours} hours`}`,
    `- Client acceptance: ${snapshot.engagement.pilotControl.acceptanceStatus}`, `- Acceptance reference: ${snapshot.engagement.pilotControl.acceptanceReference || "Open"}`,
    ...(pilot.blockers.length ? pilot.blockers.map((item) => `- Blocker: ${item}`) : ["- Evidence-complete record; portfolio-level Gate 1 still requires three real engagements."]),
    "", "## Release blockers",
    ...(delivery.readiness.blockers.length ? delivery.readiness.blockers.map((item) => `- ${item}`) : ["- No package-readiness blockers recorded; qualified review is still required."]),
    "", "## Priority decisions", ...blueprint.recommendations.map((item) => `- [${item.priority}] ${item.recommendation}: ${item.rationale}`),
    "", "## Material risks", ...blueprint.risks.map((item) => `- [${item.severity}] ${item.title}: ${item.mitigation}`),
    "", "## Open information", ...blueprint.unresolvedInputs.map((item) => `- [${item.severity}] ${item.question} Resolution: ${item.resolution}`),
    "", "## Version basis", `- Input: ${delivery.sourceVersions.inputContract}`, `- Output: ${delivery.sourceVersions.outputContract}`, `- Compiler: ${delivery.sourceVersions.compilerCore}`, `- Domain Pack: ${delivery.sourceVersions.domainPack}`,
    "", "## Review boundary", "This document is a planning and decision-support artifact. It is not a validated design, regulatory opinion, supplier quotation, approved specification or substitute for qualified QC, QA, engineering and client document-control review.",
  ].join("\n");
}

// ── Markdown → PDF (designed renderer — Atlas house style) ─────────────────
// Matches the design system of server/quality-lab-blueprint-pdf.ts: same
// palette, page furniture, callouts and styled tables. All text passes through
// pdfClean() because core PDF fonts are latin-1 (prevents mojibake).
const PDF_PAGE_W = 595.28;
const PDF_PAGE_H = 841.89;
const PDF_MARGIN = 46;
const PDF_CONTENT_W = PDF_PAGE_W - PDF_MARGIN * 2;
const PDF_BOTTOM = PDF_PAGE_H - 78;

const PDF_C = {
  navy: "#071526",
  navy2: "#0D2238",
  ink: "#102033",
  slate: "#526579",
  muted: "#7C8A9B",
  line: "#D9E2EA",
  panel: "#F3F7FA",
  panel2: "#EAF2F6",
  white: "#FFFFFF",
  teal: "#0F9D8A",
  tealDark: "#0B6F65",
  tealLight: "#CFF4ED",
  gold: "#C58B24",
  goldLight: "#F8EBCB",
  goldBorder: "#ECD49A",
};

function pdfClean(value: unknown): string {
  return String(value ?? "")
    .replace(/[‐-―]/g, "-")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/×/g, "x")
    .replace(/÷/g, "/")
    .replace(/²/g, "2")
    .replace(/³/g, "3")
    .replace(/°/g, " deg ")
    .replace(/≤/g, "<=")
    .replace(/≥/g, ">=")
    .replace(/µ|μ/g, "u")
    .replace(/•/g, "-")
    .replace(/ /g, " ")
    .replace(/[^ -~]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripInline(s: string): string {
  return s
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1");
}

type MdBlock =
  | { type: "h1" | "h2" | "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: { text: string; checked: boolean | null }[] }
  | { type: "ol"; items: string[] }
  | { type: "quote"; text: string }
  | { type: "table"; rows: string[][] }
  | { type: "code"; lines: string[] }
  | { type: "hr" };

function parseMarkdownBlocks(md: string): MdBlock[] {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const blocks: MdBlock[] = [];
  let para: string[] = [];
  let bullets: { text: string; checked: boolean | null }[] = [];
  let numbered: string[] = [];
  let quote: string[] = [];
  let tableRows: string[][] = [];
  let code: string[] | null = null;

  const flushPara = () => { if (para.length) { blocks.push({ type: "p", text: stripInline(para.join(" ")) }); para = []; } };
  const flushBullets = () => { if (bullets.length) { blocks.push({ type: "ul", items: bullets }); bullets = []; } };
  const flushNumbered = () => { if (numbered.length) { blocks.push({ type: "ol", items: numbered }); numbered = []; } };
  const flushQuote = () => { if (quote.length) { blocks.push({ type: "quote", text: quote.join(" ") }); quote = []; } };
  const flushTable = () => { if (tableRows.length) { blocks.push({ type: "table", rows: tableRows }); tableRows = []; } };
  const flushAll = () => { flushPara(); flushBullets(); flushNumbered(); flushQuote(); flushTable(); };

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      if (code) { blocks.push({ type: "code", lines: code }); code = null; } else { flushAll(); code = []; }
      continue;
    }
    if (code) { code.push(line); continue; }
    const t = line.trim();
    if (t === "") { flushAll(); continue; }
    if (t === "---") { flushAll(); blocks.push({ type: "hr" }); continue; }
    if (line.startsWith("### ")) { flushAll(); blocks.push({ type: "h3", text: stripInline(line.slice(4)) }); continue; }
    if (line.startsWith("## ")) { flushAll(); blocks.push({ type: "h2", text: stripInline(line.slice(3)) }); continue; }
    if (line.startsWith("# ")) { flushAll(); blocks.push({ type: "h1", text: stripInline(line.slice(2)) }); continue; }
    if (t.startsWith("|")) {
      if (/^\|[\s:|-]+\|$/.test(t)) continue;
      flushPara(); flushBullets(); flushNumbered(); flushQuote();
      tableRows.push(t.split("|").slice(1, -1).map((c) => stripInline(c.trim())));
      continue;
    }
    if (t.startsWith(">")) {
      flushPara(); flushBullets(); flushNumbered(); flushTable();
      quote.push(stripInline(t.replace(/^>\s?/, "")));
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      flushPara(); flushNumbered(); flushQuote(); flushTable();
      let item = line.replace(/^\s*[-*]\s+/, "");
      let checked: boolean | null = null;
      const m = item.match(/^\[([ xX])\]\s*/);
      if (m) { checked = m[1].toLowerCase() === "x"; item = item.slice(m[0].length); }
      bullets.push({ text: stripInline(item), checked });
      continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      flushPara(); flushBullets(); flushQuote(); flushTable();
      numbered.push(stripInline(line.replace(/^\s*\d+\.\s+/, "")));
      continue;
    }
    flushBullets(); flushNumbered(); flushQuote(); flushTable();
    para.push(t);
  }
  flushAll();
  if (code && code.length) blocks.push({ type: "code", lines: code });
  return blocks;
}

/** Render a markdown string to a designed, branded PDF Buffer. */
export function markdownToPdf(md: string, title: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const blocks = parseMarkdownBlocks(md);
    const h1 = blocks.find((b) => b.type === "h1");
    const docTitle = pdfClean(title.replace(/\s*\(PDF\)\s*$/i, "")) || (h1 && "text" in h1 ? pdfClean(h1.text) : "Atlas Pro working document");
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 66, bottom: 72, left: PDF_MARGIN, right: PDF_MARGIN },
      bufferPages: true,
      autoFirstPage: false,
      info: { Title: docTitle, Author: "Life Science Atlas" },
    });
    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(c as Buffer));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    let kicker = docTitle;
    // Drawing inside pageAdded corrupts pdfkit's line wrapper when a text flow
    // spans a page break — so we only RECORD the active kicker per page here
    // and paint all header furniture in the final buffered pass instead.
    const pageKickers: string[] = [];
    doc.on("pageAdded", () => { pageKickers.push(kicker); });

    // ── Cover ────────────────────────────────────────────────────────────
    doc.addPage();
    doc.rect(0, 0, PDF_PAGE_W, PDF_PAGE_H).fill(PDF_C.navy);
    doc.rect(0, PDF_PAGE_H - 190, PDF_PAGE_W, 190).fill(PDF_C.navy2);
    // network motif
    doc.lineWidth(1).strokeColor("#1E4A5F");
    const nodes: [number, number][] = [[86, 210], [150, 268], [96, 340], [168, 410], [104, 488], [176, 556]];
    for (let i = 0; i < nodes.length - 1; i += 1) {
      doc.moveTo(nodes[i][0], nodes[i][1]).lineTo(nodes[i + 1][0], nodes[i + 1][1]).stroke();
    }
    nodes.forEach(([nx, ny], i) => {
      doc.circle(nx, ny, 9).fill(i === 3 ? PDF_C.gold : PDF_C.teal);
      doc.circle(nx, ny, 12).lineWidth(1.2).strokeColor(PDF_C.white).stroke();
    });
    // pill
    doc.roundedRect(284, 84, 176, 26, 13).fill("#12333A");
    doc.font("Helvetica-Bold").fontSize(9).fillColor(PDF_C.tealLight)
      .text("ATLAS PRO TOOLKIT", 284, 93, { width: 176, align: "center", characterSpacing: 1.1, lineBreak: false });
    doc.font("Helvetica-Bold").fontSize(30).fillColor(PDF_C.white)
      .text(docTitle, 284, 150, { width: 268, lineGap: 3 });
    doc.font("Helvetica").fontSize(10.5).fillColor("#9FB1C5")
      .text("A working document for regulated quality professionals — guide plus register, built to be used at the bench and in audits.", 284, 240, { width: 268, lineGap: 3 });
    // document control panel
    doc.roundedRect(284, 330, 268, 150, 10).fillAndStroke(PDF_C.navy2, "#1E3A4F");
    doc.font("Helvetica-Bold").fontSize(8).fillColor(PDF_C.tealLight)
      .text("DOCUMENT CONTROL", 300, 346, { characterSpacing: 1, lineBreak: false });
    const controlRows: [string, string][] = [
      ["Document", docTitle],
      ["Format", "PDF guide + Excel register"],
      ["Access", "Atlas Pro membership"],
      ["Publisher", "Life Science Atlas"],
    ];
    controlRows.forEach(([k, v], i) => {
      const ry = 370 + i * 26;
      doc.font("Helvetica").fontSize(8.5).fillColor("#8EA3B8").text(k, 300, ry, { width: 80, lineBreak: false });
      doc.font("Helvetica-Bold").fontSize(8.5).fillColor("#E2E8F0").text(pdfClean(v), 384, ry, { width: 152, lineBreak: false });
    });
    // educational boundary callout
    doc.roundedRect(284, 506, 268, 96, 9).fillAndStroke(PDF_C.goldLight, PDF_C.goldBorder);
    doc.rect(284, 506, 5, 96).fill(PDF_C.gold);
    doc.font("Helvetica-Bold").fontSize(8).fillColor(PDF_C.gold)
      .text("EDUCATIONAL USE", 300, 518, { characterSpacing: 1, lineBreak: false });
    doc.font("Helvetica").fontSize(8.6).fillColor(PDF_C.ink)
      .text("Working support only. Verify against your approved SOPs, current compendia editions and site quality system. Not QA approval, a validated method or regulatory advice.", 300, 534, { width: 236, lineGap: 2 });
    doc.font("Helvetica-Bold").fontSize(9.5).fillColor(PDF_C.tealLight)
      .text("LIFE SCIENCE ATLAS", 284, PDF_PAGE_H - 120, { characterSpacing: 1.2, lineBreak: false });
    doc.font("Helvetica").fontSize(8.5).fillColor("#8EA3B8")
      .text("Decision intelligence for regulated manufacturing quality", 284, PDF_PAGE_H - 102, { lineBreak: false });

    // ── Content ──────────────────────────────────────────────────────────
    doc.addPage();
    doc.y = 66;
    doc.font("Helvetica-Bold").fontSize(21).fillColor(PDF_C.ink).text(docTitle, PDF_MARGIN, doc.y, { width: PDF_CONTENT_W, lineGap: 1 });
    doc.moveDown(0.4);
    doc.font("Helvetica").fontSize(9).fillColor(PDF_C.slate)
      .text("Atlas Pro working document. Educational use — verify against approved SOPs and current compendia before relying on it.", { width: PDF_CONTENT_W, lineGap: 2 });
    doc.moveTo(PDF_MARGIN, doc.y + 6).lineTo(PDF_PAGE_W - PDF_MARGIN, doc.y + 6).lineWidth(0.7).strokeColor(PDF_C.line).stroke();
    doc.y += 16;

    const ensure = (needed: number) => { if (doc.y + needed > PDF_BOTTOM) doc.addPage(); };

    const renderTable = (rows: string[][]) => {
      const colCount = Math.max(...rows.map((r) => r.length));
      const norm = rows.map((r) => Array.from({ length: colCount }, (_, i) => pdfClean(r[i] ?? "")));
      doc.font("Helvetica").fontSize(7.5);
      const natural = Array.from({ length: colCount }, () => 30);
      for (const row of norm) row.forEach((cell, c) => { natural[c] = Math.max(natural[c], Math.min(doc.widthOfString(cell) + 12, 240)); });
      const total = natural.reduce((a, b) => a + b, 0);
      const widths = natural.map((w) => Math.max(36, (w / total) * PDF_CONTENT_W));
      const pad = 5;
      const drawRow = (cells: string[], header: boolean, zebra: boolean) => {
        doc.font(header ? "Helvetica-Bold" : "Helvetica").fontSize(7.5);
        const heights = cells.map((cell, c) => doc.heightOfString(cell || " ", { width: widths[c] - pad * 2, lineGap: 1 }));
        const rowH = Math.max(...heights) + pad * 2;
        if (doc.y + rowH > PDF_BOTTOM) {
          doc.addPage();
          if (!header) drawRow(norm[0], true, false);
        }
        const y = doc.y;
        let x = PDF_MARGIN;
        cells.forEach((cell, c) => {
          const fill = header ? PDF_C.tealDark : zebra ? PDF_C.panel : PDF_C.white;
          doc.rect(x, y, widths[c], rowH).fillAndStroke(fill, header ? PDF_C.tealDark : PDF_C.line);
          doc.font(header ? "Helvetica-Bold" : "Helvetica").fontSize(7.5).fillColor(header ? PDF_C.white : PDF_C.ink)
            .text(cell, x + pad, y + pad, { width: widths[c] - pad * 2, lineGap: 1 });
          x += widths[c];
        });
        doc.y = y + rowH;
        doc.x = PDF_MARGIN;
      };
      norm.forEach((row, i) => drawRow(row, i === 0, i % 2 === 0));
      doc.moveDown(0.8);
    };

    let skippedH1 = false;
    for (const block of blocks) {
      if (block.type === "h1" && !skippedH1) { skippedH1 = true; continue; }
      if (block.type === "h1" || block.type === "h2") {
        kicker = block.text;
        ensure(64);
        doc.moveDown(0.6);
        const hy = doc.y;
        doc.rect(PDF_MARGIN, hy + 1, 5, 15).fill(PDF_C.teal);
        doc.font("Helvetica-Bold").fontSize(13).fillColor(PDF_C.ink)
          .text(pdfClean(block.text), PDF_MARGIN + 12, hy, { width: PDF_CONTENT_W - 12, lineGap: 1 });
        doc.moveDown(0.5);
      } else if (block.type === "h3") {
        ensure(40);
        doc.moveDown(0.4);
        doc.font("Helvetica-Bold").fontSize(11).fillColor(PDF_C.ink).text(pdfClean(block.text), { width: PDF_CONTENT_W, lineGap: 1 });
        doc.moveDown(0.2);
      } else if (block.type === "p") {
        ensure(28);
        doc.font("Helvetica").fontSize(9.5).fillColor(PDF_C.slate).text(pdfClean(block.text), { width: PDF_CONTENT_W, lineGap: 2 });
        doc.moveDown(0.45);
      } else if (block.type === "ul") {
        for (const item of block.items) {
          ensure(24);
          const iy = doc.y + 1;
          if (item.checked === null) {
            doc.circle(PDF_MARGIN + 3, iy + 4, 2).fill(PDF_C.teal);
          } else {
            doc.rect(PDF_MARGIN, iy, 7, 7).lineWidth(0.9).strokeColor(PDF_C.tealDark).stroke();
            if (item.checked) {
              doc.moveTo(PDF_MARGIN + 1.5, iy + 3.5).lineTo(PDF_MARGIN + 3, iy + 5.5).lineTo(PDF_MARGIN + 6, iy + 1.5)
                .lineWidth(1).strokeColor(PDF_C.tealDark).stroke();
            }
          }
          doc.font("Helvetica").fontSize(9.5).fillColor(PDF_C.ink)
            .text(pdfClean(item.text), PDF_MARGIN + 14, doc.y, { width: PDF_CONTENT_W - 14, lineGap: 1.5 });
          doc.moveDown(0.25);
        }
        doc.moveDown(0.3);
      } else if (block.type === "ol") {
        block.items.forEach((item, i) => {
          ensure(24);
          doc.font("Helvetica-Bold").fontSize(9.5).fillColor(PDF_C.tealDark)
            .text(`${i + 1}.`, PDF_MARGIN, doc.y, { width: 18, lineBreak: false });
          doc.font("Helvetica").fontSize(9.5).fillColor(PDF_C.ink)
            .text(pdfClean(item), PDF_MARGIN + 20, doc.y, { width: PDF_CONTENT_W - 20, lineGap: 1.5 });
          doc.moveDown(0.25);
        });
        doc.moveDown(0.3);
      } else if (block.type === "quote") {
        const body = pdfClean(block.text);
        doc.font("Helvetica").fontSize(8.6);
        const boxH = doc.heightOfString(body, { width: PDF_CONTENT_W - 34, lineGap: 2 }) + 36;
        ensure(boxH + 12);
        const qy = doc.y;
        doc.roundedRect(PDF_MARGIN, qy, PDF_CONTENT_W, boxH, 9).fillAndStroke(PDF_C.goldLight, PDF_C.goldBorder);
        doc.rect(PDF_MARGIN, qy, 5, boxH).fill(PDF_C.gold);
        doc.font("Helvetica-Bold").fontSize(7.5).fillColor(PDF_C.gold)
          .text("NOTE", PDF_MARGIN + 16, qy + 10, { characterSpacing: 0.8, lineBreak: false });
        doc.font("Helvetica").fontSize(8.6).fillColor(PDF_C.ink)
          .text(body, PDF_MARGIN + 16, qy + 25, { width: PDF_CONTENT_W - 34, lineGap: 2 });
        doc.y = qy + boxH + 10;
        doc.x = PDF_MARGIN;
      } else if (block.type === "table") {
        ensure(40);
        renderTable(block.rows);
      } else if (block.type === "code") {
        ensure(30);
        doc.font("Courier").fontSize(8.5).fillColor(PDF_C.ink);
        for (const codeLine of block.lines) {
          ensure(14);
          doc.text(pdfClean(codeLine), { width: PDF_CONTENT_W, lineGap: 1 });
        }
        doc.moveDown(0.4);
      } else if (block.type === "hr") {
        ensure(20);
        doc.moveDown(0.4);
        doc.moveTo(PDF_MARGIN, doc.y).lineTo(PDF_PAGE_W - PDF_MARGIN, doc.y).lineWidth(0.5).strokeColor(PDF_C.line).stroke();
        doc.moveDown(0.6);
      }
    }

    // ── Page furniture (header + footer, painted after content is final) ──
    const range = doc.bufferedPageRange();
    for (let i = range.start + 1; i < range.start + range.count; i += 1) {
      doc.switchToPage(i);
      const bottom = doc.page.margins.bottom;
      doc.page.margins.bottom = 0;
      // header
      doc.rect(0, 0, PDF_PAGE_W, 8).fill(PDF_C.teal);
      doc.font("Helvetica-Bold").fontSize(8).fillColor(PDF_C.tealDark)
        .text(pdfClean(pageKickers[i] ?? kicker).toUpperCase(), PDF_MARGIN, 28, { characterSpacing: 1.2, lineBreak: false });
      doc.font("Helvetica-Bold").fontSize(7.5).fillColor(PDF_C.gold)
        .text("ATLAS PRO", PDF_PAGE_W - PDF_MARGIN - 90, 29, { width: 90, align: "right", characterSpacing: 0.8, lineBreak: false });
      doc.moveTo(PDF_MARGIN, 48).lineTo(PDF_PAGE_W - PDF_MARGIN, 48).lineWidth(0.7).strokeColor(PDF_C.line).stroke();
      // footer
      const fy = PDF_PAGE_H - 36;
      doc.moveTo(PDF_MARGIN, fy - 8).lineTo(PDF_PAGE_W - PDF_MARGIN, fy - 8).lineWidth(0.5).strokeColor(PDF_C.line).stroke();
      doc.font("Helvetica").fontSize(7.5).fillColor(PDF_C.muted)
        .text(`Life Science Atlas | ${docTitle} | Atlas Pro working document`, PDF_MARGIN, fy, { width: PDF_CONTENT_W - 70, lineBreak: false });
      doc.text(`${i + 1} / ${range.count}`, PDF_PAGE_W - PDF_MARGIN - 46, fy, { width: 46, align: "right", lineBreak: false });
      doc.page.margins.bottom = bottom;
    }
    doc.end();
  });
}

/** Branded public sample that demonstrates the structure of a paid decision brief. */
export function qualityLabSampleBlueprintPdf(): Promise<Buffer> {
  return qualityLabIllustrativeSamplePdf();
}

/** @deprecated Retained temporarily as source history; the shared paid/sample renderer is authoritative. */
function legacyQualityLabSampleBlueprintPdf(): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 48,
      bufferPages: true,
      info: { Title: "Atlas Quality Lab Blueprint - Illustrative sample", Author: "Life Science Atlas" },
    });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk as Buffer));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const teal = "#14b8a6";
    const navy = "#08111f";
    const slate = "#334155";
    const contentWidth = doc.page.width - 96;
    const whitePixel = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4//8/AAX+Av4N70a4AAAAAElFTkSuQmCC", "base64");

    const section = (eyebrow: string, title: string, summary?: string) => {
      doc.font("Helvetica-Bold").fontSize(8.5).fillColor("#0f766e").text(eyebrow.toUpperCase(), { characterSpacing: 1.1 });
      doc.moveDown(0.45).font("Helvetica-Bold").fontSize(20).fillColor(navy).text(title);
      if (summary) doc.moveDown(0.35).font("Helvetica").fontSize(10.5).fillColor("#64748b").text(summary, { lineGap: 3 });
      doc.moveDown(0.8);
    };

    const callout = (title: string, body: string, tone: "teal" | "amber" = "teal") => {
      const fill = tone === "teal" ? "#f0fdfa" : "#fffbeb";
      const border = tone === "teal" ? "#5eead4" : "#fcd34d";
      const height = doc.heightOfString(body, { width: contentWidth - 32, lineGap: 3 }) + 48;
      const y = doc.y;
      doc.roundedRect(48, y, contentWidth, height, 9).fillAndStroke(fill, border);
      doc.font("Helvetica-Bold").fontSize(9.5).fillColor(navy).text(title, 64, y + 13, { width: contentWidth - 32 });
      doc.font("Helvetica").fontSize(9.2).fillColor(slate).text(body, 64, y + 31, { width: contentWidth - 32, lineGap: 3 });
      doc.y = y + height + 13;
    };

    const bullets = (items: string[]) => {
      items.forEach((item) => {
        doc.font("Helvetica-Bold").fontSize(10).fillColor(teal).text("-", 52, doc.y, { continued: true });
        doc.font("Helvetica").fillColor(slate).text(`  ${item}`, { width: contentWidth - 16, lineGap: 2 });
        doc.moveDown(0.25);
      });
    };

    const table = (headers: string[], rows: string[][], widths: number[]) => {
      [headers, ...rows].forEach((row, rowIndex) => {
        const padding = 7;
        const rowHeight = Math.max(31, ...row.map((cell, index) => doc.heightOfString(cell, { width: widths[index] - padding * 2, lineGap: 1 }) + padding * 2));
        const y = doc.y;
        let x = 48;
        row.forEach((cell, index) => {
          doc.rect(x, y, widths[index], rowHeight).fillAndStroke(rowIndex === 0 ? "#0f766e" : rowIndex % 2 ? "#f8fafc" : "#f1f5f9", rowIndex === 0 ? "#0f766e" : "#cbd5e1");
          doc.font(rowIndex === 0 ? "Helvetica-Bold" : "Helvetica").fontSize(rowIndex === 0 ? 8.5 : 8.2).fillColor(rowIndex === 0 ? "#ffffff" : "#1e293b").text(cell, x + padding, y + padding, { width: widths[index] - padding * 2, lineGap: 1 });
          x += widths[index];
        });
        doc.y = y + rowHeight;
      });
      doc.moveDown(0.7);
    };

    const newContentPage = () => {
      doc.addPage();
      doc.image(whitePixel, 0, 0, { width: 596, height: 842 });
      doc.x = 48;
      doc.y = 48;
    };

    // Cover
    doc.rect(0, 0, doc.page.width, doc.page.height).fill(navy);
    doc.roundedRect(48, 58, 188, 28, 14).fill("#11333a");
    doc.font("Helvetica-Bold").fontSize(9.5).fillColor("#99f6e4").text("ILLUSTRATIVE PUBLIC SAMPLE", 62, 67, { characterSpacing: 1.1 });
    doc.font("Helvetica-Bold").fontSize(30).fillColor("#f8fafc").text("Atlas Quality Lab\nBlueprint", 48, 132, { lineGap: 4 });
    doc.font("Helvetica").fontSize(14).fillColor("#94a3b8").text("Decision brief for a synthetic non-sterile pharmaceutical microbiology scenario", 48, 230, { width: 430, lineGap: 5 });
    doc.roundedRect(48, 338, contentWidth, 118, 12).fill("#0f2032").strokeColor("#1e3a4f").stroke();
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#5eead4").text("DOCUMENT CONTROL", 66, 356, { characterSpacing: 1 });
    doc.font("Helvetica").fontSize(10.5).fillColor("#e2e8f0").text("Document ID", 66, 384).text("LSA-SAMPLE-BP-001", 235, 384);
    doc.text("Revision", 66, 406).text("1.0 / Public sample", 235, 406);
    doc.text("Issue date", 66, 428).text("16 July 2026", 235, 428);
    doc.font("Helvetica").fontSize(9.5).fillColor("#94a3b8").text("Synthetic illustrative scenario. Not a customer result, validated design, regulatory approval, engineering specification or supplier quotation.", 48, 526, { width: contentWidth, lineGap: 4 });
    doc.font("Helvetica-Bold").fontSize(11).fillColor(teal).text("LIFE SCIENCE ATLAS", 48, 740);

    // Executive decision page
    newContentPage();
    section("01 / Decision brief", "What decision is being framed?", "One ASEAN non-sterile oral solid-dose site is evaluating whether its microbiology operating model can support assumed release demand with one staffed shift.");
    callout("Illustrative decision", "Compare a one-shift baseline with a two-shift alternative, identify the assumptions driving utilization, and define the evidence required before detailed planning.");
    doc.font("Helvetica-Bold").fontSize(11).fillColor(navy).text("This concept can support");
    doc.moveDown(0.45);
    bullets(["Directional workload and staffing comparison.", "Identification of capacity-sensitive assumptions.", "Prioritization of evidence needed before design or procurement."]);
    doc.moveDown(0.5).font("Helvetica-Bold").fontSize(11).fillColor(navy).text("This concept cannot support");
    doc.moveDown(0.45);
    bullets(["Final room sizing or equipment procurement.", "Validated method transfer, biosafety classification or regulatory approval.", "A claim that an expert, engineer, supplier or authority approved the concept."]);
    callout("Review boundary", "A paid proposal names the reviewer role, required competence evidence, scope exclusions, schedule and acceptance basis. Reviewer appointment is never implied before confirmation.", "amber");

    // Scenario page
    newContentPage();
    section("02 / Scenario comparison", "Demand-capacity view", "The values below are synthetic planning inputs and concept calculations. They demonstrate presentation and decision logic, not a customer result.");
    table(
      ["Measure", "Baseline", "Alternative", "Control status"],
      [
        ["Monthly test demand", "1,200", "1,200", "Illustrative input"],
        ["Operating shifts", "1", "2", "Scenario assumption"],
        ["Directional utilization", "92%", "61%", "Concept calculation"],
        ["Peak-demand resilience", "Low", "Moderate", "Requires verification"],
      ],
      [145, 105, 105, 144],
    );
    callout("Decision signal", "The alternative reduces directional utilization but creates shift-handover, supervision, training and sample-chain-of-custody questions. Atlas would not recommend a scenario until these inputs are resolved.");
    doc.moveDown(0.25).font("Helvetica-Bold").fontSize(8.5).fillColor("#0f766e").text("EVIDENCE CONTROL", { characterSpacing: 1.1 });
    doc.moveDown(0.25).font("Helvetica-Bold").fontSize(13).fillColor(navy).text("Assumption and verification register");
    doc.moveDown(0.35);
    table(
      ["Item", "Current basis", "Confidence", "Required action"],
      [
        ["Monthly demand", "Planning estimate", "Low", "Replace with 12-month sample/test history"],
        ["Method cycle time", "Generic planning range", "Low", "Confirm site methods and incubation rules"],
        ["Analyst availability", "Headcount assumption", "Medium", "Confirm leave, training and non-routine load"],
      ],
      [113, 123, 76, 187],
    );
    callout("Controlled delivery and next step", "Paid delivery carries a document ID, version, input freeze, revision record and acceptance status. Use the $149 Paid Scope Diagnostic to frame the evidence and Blueprint scope; the fee is credited when a Blueprint begins within 30 days.");

    // Evidence readiness
    newContentPage();
    section("03 / Readiness", "Planner completion is not evidence readiness", "The illustrative intake is complete enough to compile. Controlled-use readiness remains low until site facts, approved methods and qualified review evidence replace concept assumptions.");
    table(["Measure", "Illustrative status", "Meaning"], [["Planner completion", "4 / 4 steps", "All required concept-intake sections completed"], ["Controlled-use evidence readiness", "10%", "Weighted evidence-gap indicator—not form completion"], ["Controlled-use blockers", "5 open", "Reliance prohibited until resolved"], ["Important inputs", "6 open", "Could materially change estimates or conditions"]], [150, 110, 239]);
    callout("How the readiness score moves", "The concept score starts at 100, deducts 12 points for each blocking input and 5 points for each important input, then clamps between 0 and 100. A higher score still does not equal approval.", "amber");
    bullets(["Confirm the controlled product and market portfolio.", "Reconcile approved method steps, controls, incubation and suitability.", "Replace generic workload and capacity ranges with observed site evidence."]);

    // Demand and capacity
    newContentPage();
    section("04 / Demand and capacity", "Workload follows batches, lots and rounds", "Synthetic demand illustrates how operational drivers become method load and resource pressure.");
    table(["Demand source", "Monthly basis", "Modeled test units", "Control"], [["Finished-product release", "80 batches", "640", "Synthetic input"], ["Raw-material receipt", "45 lots", "225", "Synthetic input"], ["Water microbiology", "24 points × 4 rounds", "192", "Synthetic input"], ["Environmental monitoring", "18 locations × 4 rounds", "144", "Synthetic input"]], [154, 112, 112, 121]);
    callout("Test-unit definition", "A test unit is a planning workload unit generated by the current rule set. It is not automatically a sample, determination, plate or reportable result. The paid Blueprint reconciles that definition against the approved site method architecture.", "amber");

    // Equipment pressure
    newContentPage();
    section("05 / Equipment", "Method-derived resource pressure", "Quantities and utilization are vendor-neutral concept allowances. Cycle data, rack geometry, downtime and redundancy remain site-specific.");
    table(["Resource", "Method load", "Available", "Utilization", "Status"], [["Incubator 20–25 °C", "450 plate-days", "5,355", "10.9%", "Headroom"], ["Incubator 30–35 °C", "1,130 plate-days", "5,355", "27.4%", "Headroom"], ["Class II BSC", "186 hours", "232 hours", "104.2%", "Constraint"], ["Autoclave", "1,260 L", "1,400 L", "117.0%", "Constraint"]], [150, 105, 88, 76, 80]);
    callout("Visible formula", "Planning utilization = (monthly method load × 1.3 peak factor) ÷ available monthly capacity × 100. This is a resource-load check, not a queue or schedule simulation.");

    // Space schematic
    newContentPage();
    section("06 / Space", "Functional area allowance—not a floor plan", "The paid model separates net functional allowances from circulation/support factors and gross departmental implications.");
    table(["Functional zone", "Net allowance", "Planning role"], [["Sample receipt and staging", "18 m²", "Controlled receipt, hold and transfer basis"], ["Media preparation and QC", "34 m²", "Preparation, sterilization and release workflow"], ["Microbial limits testing", "52 m²", "In-house product and raw-material execution"], ["Incubation and reading", "31 m²", "Temperature-separated incubation concept"], ["Wash and waste handling", "22 m²", "Decontamination and waste-interface basis"]], [190, 100, 209]);
    callout("Geometry boundary", "Room dimensions, adjacencies, people/material/waste routes, equipment envelopes, utilities, HVAC, containment and code compliance require qualified engineering. Atlas does not present this allowance as a layout or 3D design.", "amber");

    // Cost and sensitivity
    newContentPage();
    section("07 / Cost and sensitivity", "Ranges expose the assumptions that drive budget", "Synthetic USD allowances demonstrate decision framing; they are not quotations.");
    table(["Cost family", "Baseline range", "Alternative range", "Primary sensitivity"], [["Equipment CAPEX", "$310k–$520k", "$420k–$710k", "Redundancy and qualification scope"], ["Annual people OPEX", "$180k–$260k", "$290k–$410k", "Productive hours and shift model"], ["Annual consumables", "$95k–$155k", "$120k–$205k", "Test frequency and wastage"], ["Facility allowance", "$240k–$460k", "$330k–$610k", "Site, utilities and grossing factor"]], [130, 112, 112, 145]);
    bullets(["Currency basis: illustrative 2026 USD; taxes, freight, duties and escalation excluded.", "Geography, qualification, installation and service scope require quotation evidence.", "Sensitivity ranks decision-critical inputs before budget freeze."]);

    // Risks, blockers and actions
    newContentPage();
    section("08 / Decision controls", "Risk, blocker, open input and action are different", "The taxonomy prevents a low modeled-risk count from creating false comfort.");
    table(["Type", "Illustrative count", "Interpretation"], [["High modeled operational risk", "0", "No high risk detected from current modeled inputs"], ["Controlled-use blocker", "5", "Missing evidence prevents reliance"], ["Important open input", "6", "Could materially change the result"], ["Active action", "12", "Owned work to resolve blockers or open inputs"]], [170, 100, 229]);
    callout("Relationship", "5 blockers lead to blocker-resolution actions; important inputs lead to evidence or confirmation actions. The action register records owner, due date, evidence note, status and activity history.", "amber");

    // Evidence and assumptions
    newContentPage();
    section("09 / Evidence and assumptions", "Every material output carries a basis", "The full paid workbook includes the complete registers; this public excerpt is deliberately sanitized.");
    table(["Record", "Status", "Scope", "Limitation"], [["Compendial microbiology basis", "Reference traced", "Method architecture", "Current edition and site applicability require review"], ["Site product portfolio", "Open", "Demand boundary", "Illustrative portfolio is not controlled"], ["Observed task-time study", "Missing", "People capacity", "Generic hands-on ranges remain indicative"], ["Equipment cycle evidence", "Missing", "Resource capacity", "Load geometry and downtime not verified"]], [155, 94, 116, 134]);
    callout("Evidence discipline", "A catalog link or named source does not by itself close an evidence gap. Closure requires the exact source/version, locator, project scope, limitations and qualified review disposition.");

    // Rule trace
    newContentPage();
    section("10 / Rule trace", "Versioned calculation logic", "A rule trace links outputs to applicability, evidence and known limitations without claiming verification.");
    table(["Rule ID / version", "Output", "Applicability", "Confidence"], [["core.capacity.people / 1.2", "Analyst and reviewer FTE", "Concept workload with productive-time input", "Indicative"], ["core.capacity.equipment / 1.1", "Equipment pressure", "Method load and concept uptime", "Indicative"], ["micro.workflow.finished-products / 0.6", "Release-test demand", "Non-sterile product profiles", "Medium"], ["core.space.allowance / 0.5", "Functional area", "Capability and equipment concept", "Indicative"]], [150, 126, 160, 63]);
    callout("Change control", "Corrections from real projects become controlled rule-change candidates. They do not edit executable rules until evidence, impact, validation cases and external approval references support a separate versioned release.", "amber");

    // Reviewer model
    newContentPage();
    section("11 / Review competence", "Role coverage is confirmed during scoping", "Atlas describes the competence pattern without implying a named reviewer before appointment.");
    table(["Review interface", "Expected competence evidence", "Decision contribution"], [["Microbiology SME", "Relevant method, product and regulated-lab experience", "Challenge method architecture and workload basis"], ["QA review", "Quality-system and controlled-document experience", "Confirm governance, evidence and approval boundaries"], ["Engineering interface", "Laboratory facility, utilities and equipment experience", "Challenge space, utilities and constructability assumptions"], ["Procurement / cost", "Qualified sourcing and commercial evidence", "Replace allowances with comparable quotations"]], [120, 195, 184]);
    callout("Appointment boundary", "The paid proposal names accountable roles, required competence evidence and any external specialist dependency. Public material never fabricates a reviewer identity, qualification or approval.");

    // Scope and acceptance
    newContentPage();
    section("12 / Controlled handover", "What the founding Blueprint engagement includes", "The starting USD 990 scope is productized service work, not a software entitlement.");
    bullets(["One site and the first non-sterile pharmaceutical microbiology wedge.", "Baseline plus one alternative scenario.", "Controlled XLSX workbook, executive PDF brief and evidence/assumption/open-question register.", "One review workshop and one consolidated revision.", "Written acceptance or accepted-with-actions within five business days of controlled delivery."]);
    callout("Excluded unless quoted", "Travel, taxes, third-party specialists, detailed engineering, supplier selection, method validation, site approval and regulatory approval are outside the starting scope.", "amber");
    callout("Start with the Paid Scope Diagnostic", "USD 149 includes one 60-minute stakeholder workshop and a written scope and decision memo within two business days after the workshop. The fee is credited to a Blueprint engagement started within 30 days.");

    const range = doc.bufferedPageRange();
    for (let pageIndex = range.start; pageIndex < range.start + range.count; pageIndex += 1) {
      doc.switchToPage(pageIndex);
      if (pageIndex === 0) continue;
      doc.page.margins.bottom = 0;
      const footerY = doc.page.height - 30;
      doc.moveTo(48, footerY - 8).lineTo(doc.page.width - 48, footerY - 8).lineWidth(0.5).strokeColor("#cbd5e1").stroke();
      doc.font("Helvetica").fontSize(8).fillColor("#64748b").text("Life Science Atlas | Illustrative sample | Not for implementation", 48, footerY, { width: contentWidth - 70, lineBreak: false });
      doc.text(`${pageIndex + 1} / ${range.count}`, doc.page.width - 92, footerY, { width: 44, align: "right", lineBreak: false });
    }
    doc.end();
  });
}
