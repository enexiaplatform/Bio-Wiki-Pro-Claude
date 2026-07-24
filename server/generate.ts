// On-the-fly binary generation for deliverables: a real .xlsx (with working
// formulas) for the gap analysis, and .pdf rendering of the markdown guides.
// Keeps the repo source as MD/CSV but ships customers real Office/PDF files.
import XLSX from "xlsx-js-style";
import PDFDocument from "pdfkit";
import { qualityLabProjectFromReviewedSnapshot, type QualityLabReviewedProjectSnapshot } from "../shared/quality-lab-persistence.js";
import { createQualityLabDeliveryPackage } from "../shared/quality-lab-delivery.js";
import { assessPaidPilotEvidence } from "../shared/quality-lab-engagement.js";

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
  ws["!cols"] = widths.map((wch) => ({ wch: Math.min(wch, 48) }));
  ws["!autofilter"] = ws["!ref"] ? { ref: XLSX.utils.encode_range({ r: headerRow, c: 0 }, XLSX.utils.decode_range(ws["!ref"]).e) } : undefined;
  ws["!freeze"] = { xSplit: 0, ySplit: headerRow + 1, topLeftCell: `A${headerRow + 2}`, activePane: "bottomLeft", state: "frozen" } as any;
  const range = ws["!ref"] ? XLSX.utils.decode_range(ws["!ref"]) : null;
  if (!range) return;
  ws["!rows"] = Array.from({ length: range.e.r + 1 }, (_, row) => ({ hpt: row === headerRow ? 30 : 42 }));
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
          numFmt: cell.t === "n" ? "#,##0.0" : undefined,
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

  addDeliverySheet(wb, "Review Checklist", [["Review item ID", "Owner role", "Question", "Status", "Required evidence", "Related rule IDs", "Reviewer note"], ...packet.checklist.map((item) => [item.id, item.ownerRole, item.question, item.status, item.requiredEvidence, item.relatedRuleIds.join(" | "), item.reviewerNote])], [28, 24, 62, 18, 62, 36, 62]);

  addDeliverySheet(wb, "Decisions Corrections", [["Record type", "Recorded at", "Field, rule or decision", "Previous value / options", "Corrected value", "Evidence / rationale", "Owner or reviewer", "Downstream impact"], ...packet.corrections.map((item) => ["Correction", item.recordedAt, item.fieldOrRuleId, item.previousValue, item.correctedValue, `${item.evidenceRef} | ${item.rationale}`, item.reviewerRole, ""]), ...packet.decisions.map((item) => ["Decision", item.recordedAt, item.decision, item.optionsConsidered.join(" | "), "", item.rationale, item.owner, item.downstreamImpact])], [18, 22, 42, 45, 32, 65, 28, 55]);

  addDeliverySheet(wb, "Calibration", [["Metric", "Estimate", "Actual", "Variance %", "Variance driver", "Actual basis", "Reviewer note", "Observed period", "Data owner", "Evidence references", "Learning disposition", "Applicable rule IDs"], ...Object.entries(packet.baseline).map(([metric, value]) => {
    const note = packet.calibration.metricNotes.find((item) => item.metric === metric);
    return [metric, value.estimate, value.actual, value.variancePercent === null ? null : value.variancePercent / 100, note?.varianceDriver ?? "not-assessed", note?.actualBasis ?? "", note?.reviewerNote ?? "", `${packet.calibration.observedPeriodStart} to ${packet.calibration.observedPeriodEnd}`, packet.calibration.dataOwner, packet.calibration.evidenceRefs.join(" | "), packet.calibration.learningDisposition, packet.calibration.applicableRuleIds.join(" | ")];
  })], [24, 16, 16, 14, 24, 50, 50, 28, 24, 50, 28, 40]);

  wb.Workbook = { Views: [{ RTL: false }] };
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx", cellStyles: true });
}

export function qualityLabDeliveryMarkdown(snapshot: QualityLabReviewedProjectSnapshot): string {
  if (!snapshot.engagement) throw new Error("A review engagement packet is required before delivery export");
  const project = qualityLabProjectFromReviewedSnapshot(snapshot);
  const delivery = createQualityLabDeliveryPackage(project, snapshot.engagement);
  const pilot = assessPaidPilotEvidence(snapshot.engagement, delivery.readiness);
  const blueprint = snapshot.blueprint;
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
    `- Controlled-use evidence readiness: ${blueprint.dataQuality.completenessPercent}%`,
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

function stripInline(s: string): string {
  return s
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/^\s*[-*]\s+\[[ x]\]\s*/i, "☐ "); // checkbox bullets
}

/** Render a markdown string to a PDF Buffer. */
export function markdownToPdf(md: string, title: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 54, info: { Title: title } });
    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(c as Buffer));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const lines = md.replace(/\r\n/g, "\n").split("\n");
    let inCode = false;
    for (const raw of lines) {
      const line = raw;
      if (line.trim().startsWith("```")) {
        inCode = !inCode;
        doc.moveDown(0.3);
        continue;
      }
      if (inCode) {
        doc.font("Courier").fontSize(9).fillColor("#333").text(line, { lineGap: 1 });
        continue;
      }
      if (line.trim() === "" || line.trim() === "---") {
        doc.moveDown(0.5);
        continue;
      }
      if (line.startsWith("# ")) {
        doc.moveDown(0.4).font("Helvetica-Bold").fontSize(18).fillColor("#0f2420").text(stripInline(line.slice(2)));
        doc.moveDown(0.3);
      } else if (line.startsWith("## ")) {
        doc.moveDown(0.4).font("Helvetica-Bold").fontSize(13).fillColor("#10b981").text(stripInline(line.slice(3)));
        doc.moveDown(0.2);
      } else if (line.startsWith("### ")) {
        doc.moveDown(0.3).font("Helvetica-Bold").fontSize(11).fillColor("#222").text(stripInline(line.slice(4)));
      } else if (/^\s*[-*]\s+/.test(line)) {
        const text = stripInline(line.replace(/^\s*[-*]\s+/, ""));
        doc.font("Helvetica").fontSize(10.5).fillColor("#222").text("•  " + text, { indent: 12, lineGap: 1 });
      } else if (/^\s*\d+\.\s+/.test(line)) {
        doc.font("Helvetica").fontSize(10.5).fillColor("#222").text(stripInline(line.trim()), { indent: 12, lineGap: 1 });
      } else if (line.startsWith(">")) {
        doc.font("Helvetica-Oblique").fontSize(10).fillColor("#555").text(stripInline(line.replace(/^>\s?/, "")), { indent: 12 });
      } else if (line.trim().startsWith("|")) {
        // Render table rows as monospace text (skip separator rows).
        if (!/^\s*\|[\s:|-]+\|\s*$/.test(line)) {
          const cells = line.split("|").map((c) => stripInline(c.trim())).filter((_, i, a) => i > 0 && i < a.length - 1 || a.length <= 2);
          doc.font("Courier").fontSize(9).fillColor("#333").text(cells.join("   |   "), { lineGap: 1 });
        }
      } else {
        doc.font("Helvetica").fontSize(10.5).fillColor("#222").text(stripInline(line), { lineGap: 1 });
      }
    }
    doc.end();
  });
}

/** Branded public sample that demonstrates the structure of a paid decision brief. */
export function qualityLabSampleBlueprintPdf(): Promise<Buffer> {
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
