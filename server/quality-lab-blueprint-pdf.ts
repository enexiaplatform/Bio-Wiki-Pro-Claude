import PDFDocument from "pdfkit";
import {
  createQualityLabProject,
  defaultQualityLabInput,
  getQualityLabReadiness,
  type QualityLabBlueprint,
  type QualityLabProject,
} from "../shared/quality-lab.js";
import { createQualityLabEngagementPacket } from "../shared/quality-lab-engagement.js";
import {
  qualityLabProjectFromReviewedSnapshot,
  type QualityLabReviewedProjectSnapshot,
} from "../shared/quality-lab-persistence.js";
import { createQualityLabDeliveryPackage } from "../shared/quality-lab-delivery.js";
import { buildCapacityVisual, buildScenarioComparison, buildZoneLayout } from "../shared/quality-lab-visuals.js";
import { analyzeQualityLabSensitivity } from "../shared/quality-lab-sensitivity.js";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 46;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const CONTENT_BOTTOM = PAGE_HEIGHT - 52;

const C = {
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
  blue: "#287BB5",
  blueLight: "#DDECF7",
  gold: "#C58B24",
  goldLight: "#F8EBCB",
  orange: "#D66B2C",
  red: "#C6484B",
  redLight: "#F8DFE0",
  green: "#27835D",
  greenLight: "#DDF1E7",
};

type Doc = PDFKit.PDFDocument;
type Tone = "teal" | "blue" | "gold" | "red" | "neutral";

export interface QualityLabBlueprintPdfOptions {
  publicSample?: boolean;
  issueDate?: string;
}

function clean(value: unknown): string {
  return String(value ?? "")
    .replace(/[\u2010-\u2015]/g, "-")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u00D7/g, "x")
    .replace(/\u00F7/g, "/")
    .replace(/\u00B2/g, "2")
    .replace(/\u00B0/g, " deg ")
    .replace(/\u00A0/g, " ")
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function short(value: unknown, limit: number): string {
  const text = clean(value);
  return text.length <= limit ? text : `${text.slice(0, Math.max(0, limit - 3)).trim()}...`;
}

function number(value: number, digits = 0): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(value);
}

function money(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}m`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}k`;
  return `$${number(value)}`;
}

function pct(value: number): string {
  return `${number(value, 1)}%`;
}

function toneColors(tone: Tone) {
  if (tone === "blue") return { fill: C.blueLight, border: "#B9D6E9", accent: C.blue };
  if (tone === "gold") return { fill: C.goldLight, border: "#ECD49A", accent: C.gold };
  if (tone === "red") return { fill: C.redLight, border: "#E9B8BA", accent: C.red };
  if (tone === "neutral") return { fill: C.panel, border: C.line, accent: C.slate };
  return { fill: C.tealLight, border: "#9BDED3", accent: C.tealDark };
}

function roundedPanel(doc: Doc, x: number, y: number, width: number, height: number, fill = C.panel, border = C.line, radius = 10) {
  doc.roundedRect(x, y, width, height, radius).fillAndStroke(fill, border);
}

function sectionPage(doc: Doc, pageNo: number, kicker: string, title: string, subtitle: string, sample: boolean) {
  doc.addPage({ size: "A4", margin: 0 });
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT).fill(C.white);
  doc.rect(0, 0, PAGE_WIDTH, 8).fill(C.teal);
  doc.font("Helvetica-Bold").fontSize(8).fillColor(C.tealDark).text(clean(kicker).toUpperCase(), MARGIN, 34, { characterSpacing: 1.2 });
  doc.font("Helvetica-Bold").fontSize(23).fillColor(C.ink).text(clean(title), MARGIN, 55, { width: CONTENT_WIDTH, lineGap: 1 });
  doc.font("Helvetica").fontSize(9.5).fillColor(C.slate).text(clean(subtitle), MARGIN, 87, { width: CONTENT_WIDTH, lineGap: 2.5 });
  doc.moveTo(MARGIN, 112).lineTo(PAGE_WIDTH - MARGIN, 112).lineWidth(0.7).strokeColor(C.line).stroke();
  doc.font("Helvetica-Bold").fontSize(7.5).fillColor(sample ? C.gold : C.tealDark).text(sample ? "ILLUSTRATIVE SAMPLE" : "CONTROLLED BLUEPRINT", PAGE_WIDTH - 176, 35, { width: 130, align: "right", characterSpacing: 0.8 });
  doc.y = 129;
  return pageNo;
}

function pageFooter(doc: Doc, pageNo: number, pageCount: number, documentId: string, sample: boolean) {
  const y = PAGE_HEIGHT - 35;
  doc.moveTo(MARGIN, y - 8).lineTo(PAGE_WIDTH - MARGIN, y - 8).lineWidth(0.5).strokeColor(C.line).stroke();
  doc.font("Helvetica").fontSize(7.5).fillColor(C.muted).text(
    sample ? "Life Science Atlas | Synthetic illustrative sample | Not for implementation" : `Life Science Atlas | ${clean(documentId)} | Decision-support artifact`,
    MARGIN,
    y,
    { width: CONTENT_WIDTH - 70, lineBreak: false },
  );
  doc.text(`${pageNo} / ${pageCount}`, PAGE_WIDTH - 92, y, { width: 46, align: "right", lineBreak: false });
}

function label(doc: Doc, text: string, x: number, y: number, width: number, color = C.tealDark) {
  doc.font("Helvetica-Bold").fontSize(7.5).fillColor(color).text(clean(text).toUpperCase(), x, y, { width, characterSpacing: 0.8 });
}

function paragraph(doc: Doc, text: string, x: number, y: number, width: number, options: { size?: number; color?: string; bold?: boolean; lineGap?: number } = {}) {
  doc.font(options.bold ? "Helvetica-Bold" : "Helvetica").fontSize(options.size ?? 9).fillColor(options.color ?? C.slate).text(clean(text), x, y, { width, lineGap: options.lineGap ?? 2 });
}

function kpi(doc: Doc, x: number, y: number, width: number, title: string, value: string, note: string, tone: Tone = "neutral") {
  const colors = toneColors(tone);
  roundedPanel(doc, x, y, width, 76, colors.fill, colors.border, 9);
  label(doc, title, x + 12, y + 11, width - 24, colors.accent);
  doc.font("Helvetica-Bold").fontSize(20).fillColor(C.ink).text(clean(value), x + 12, y + 28, { width: width - 24 });
  paragraph(doc, note, x + 12, y + 54, width - 24, { size: 7.5, color: C.muted, lineGap: 1 });
}

function callout(doc: Doc, x: number, y: number, width: number, title: string, body: string, tone: Tone = "teal", height = 76) {
  const colors = toneColors(tone);
  roundedPanel(doc, x, y, width, height, colors.fill, colors.border, 9);
  doc.rect(x, y, 5, height).fill(colors.accent);
  label(doc, title, x + 16, y + 12, width - 28, colors.accent);
  paragraph(doc, body, x + 16, y + 29, width - 28, { size: 8.6, color: C.ink, lineGap: 2 });
}

function legendDot(doc: Doc, x: number, y: number, color: string, text: string, open = false) {
  doc.circle(x + 4, y + 4, 3.5);
  if (open) doc.lineWidth(1.3).strokeColor(color).stroke(); else doc.fillColor(color).fill();
  paragraph(doc, text, x + 12, y - 1, 90, { size: 7.5, color: C.slate });
}

function horizontalBar(doc: Doc, x: number, y: number, width: number, value: number, max: number, color: string, background = C.panel2, markerPercent?: number) {
  doc.roundedRect(x, y, width, 10, 5).fill(background);
  const fillWidth = max > 0 ? Math.max(value > 0 ? 2 : 0, Math.min(width, (value / max) * width)) : 0;
  if (fillWidth > 0) doc.roundedRect(x, y, fillWidth, 10, Math.min(5, fillWidth / 2)).fill(color);
  if (markerPercent !== undefined) {
    const markerX = x + width * markerPercent;
    doc.moveTo(markerX, y - 3).lineTo(markerX, y + 13).lineWidth(0.8).strokeColor(C.ink).stroke();
  }
}

function table(
  doc: Doc,
  x: number,
  y: number,
  headers: string[],
  rows: string[][],
  widths: number[],
  options: { rowHeight?: number; headerHeight?: number; fontSize?: number; emphasisColumn?: number } = {},
) {
  const headerHeight = options.headerHeight ?? 27;
  const rowHeight = options.rowHeight ?? 35;
  let xCursor = x;
  headers.forEach((header, index) => {
    doc.rect(xCursor, y, widths[index], headerHeight).fillAndStroke(C.navy2, C.navy2);
    doc.font("Helvetica-Bold").fontSize(7.5).fillColor(C.white).text(short(header, 34), xCursor + 6, y + 8, { width: widths[index] - 12, lineGap: 1 });
    xCursor += widths[index];
  });
  rows.forEach((row, rowIndex) => {
    xCursor = x;
    const rowY = y + headerHeight + rowIndex * rowHeight;
    row.forEach((cell, index) => {
      const fill = rowIndex % 2 === 0 ? C.white : C.panel;
      doc.rect(xCursor, rowY, widths[index], rowHeight).fillAndStroke(fill, C.line);
      doc.font(index === options.emphasisColumn ? "Helvetica-Bold" : "Helvetica")
        .fontSize(options.fontSize ?? 7.5)
        .fillColor(index === options.emphasisColumn ? C.ink : C.slate)
        .text(short(cell, Math.max(18, Math.floor(widths[index] / 2.9))), xCursor + 6, rowY + 7, { width: widths[index] - 12, height: rowHeight - 12, ellipsis: true, lineGap: 1 });
      xCursor += widths[index];
    });
  });
  return y + headerHeight + rows.length * rowHeight;
}

function drawCover(doc: Doc, project: QualityLabProject, snapshot: QualityLabReviewedProjectSnapshot, sample: boolean, issueDate: string) {
  const blueprint = project.blueprint;
  const control = snapshot.engagement?.deliveryControl;
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT).fill(C.navy);
  doc.rect(0, 0, 168, PAGE_HEIGHT).fill("#0A2737");
  doc.polygon([0, 575], [168, 430], [168, PAGE_HEIGHT], [0, PAGE_HEIGHT]).fill(C.tealDark);

  // A compact capability graph: data -> methods -> resources -> decisions.
  const graphNodes = [
    { x: 60, y: 135, r: 8 }, { x: 112, y: 178, r: 7 }, { x: 64, y: 230, r: 6 },
    { x: 126, y: 280, r: 9 }, { x: 72, y: 335, r: 7 }, { x: 125, y: 382, r: 6 },
  ];
  [[0, 1], [1, 2], [1, 3], [2, 3], [3, 4], [3, 5], [4, 5]].forEach(([a, b]) => {
    doc.moveTo(graphNodes[a].x, graphNodes[a].y).lineTo(graphNodes[b].x, graphNodes[b].y).lineWidth(0.7).strokeColor("#4FD1C5").opacity(0.55).stroke().opacity(1);
  });
  graphNodes.forEach((node, index) => {
    doc.circle(node.x, node.y, node.r).fill(index === 3 ? C.gold : C.teal);
    doc.circle(node.x, node.y, node.r + 4).lineWidth(0.6).strokeColor("#8BE4D8").stroke();
  });

  doc.roundedRect(205, 58, 170, 26, 13).fill(sample ? "#3A2A16" : "#123B3A");
  doc.font("Helvetica-Bold").fontSize(8).fillColor(sample ? "#F7D58B" : "#8BE4D8").text(sample ? "ILLUSTRATIVE PUBLIC SAMPLE" : "CONTROLLED DECISION BRIEF", 219, 67, { characterSpacing: 0.9 });
  doc.font("Helvetica-Bold").fontSize(10).fillColor(C.teal).text("ATLAS QUALITY LAB BLUEPRINT", 205, 129, { characterSpacing: 1.2 });
  doc.font("Helvetica-Bold").fontSize(29).fillColor(C.white).text(clean(project.name), 205, 158, { width: 330, lineGap: 3 });
  doc.font("Helvetica").fontSize(11).fillColor("#AFC0D1").text(clean(project.input.primaryDecision), 205, 255, { width: 330, lineGap: 4 });

  roundedPanel(doc, 205, 388, 330, 179, "#0C2034", "#23415B", 12);
  label(doc, "Document control", 223, 407, 294, C.teal);
  const controlRows = [
    ["Document ID", control?.documentId || `ATLAS-${project.id.toUpperCase()}`],
    ["Revision", control?.revision || (sample ? "SAMPLE-1.0" : "D0")],
    ["Status", sample ? "Synthetic illustrative sample" : control?.recordedStatus || "Working draft"],
    ["Issue date", issueDate],
    ["Compiler", blueprint.engineVersion],
    ["Domain Pack", `${blueprint.domainPack.id}@${blueprint.domainPack.version}`],
    ["Input revision", `${project.input.inputRevision} · ${project.input.sourceOwnerRole || "source owner open"}`],
  ];
  controlRows.forEach(([left, right], index) => {
    const y = 432 + index * 17;
    doc.font("Helvetica").fontSize(8).fillColor("#8FA5BA").text(left, 223, y, { width: 86 });
    doc.font("Helvetica-Bold").fillColor("#E8F0F6").text(short(right, 45), 314, y, { width: 203 });
  });

  callout(
    doc,
    205,
    602,
    330,
    sample ? "Truth boundary" : "Controlled-use boundary",
    sample
      ? "All figures are synthetic and demonstrate the same document engine used for controlled Blueprint delivery. They are not a customer result or approved facility design."
      : "This Blueprint supports planning and qualified review. It is not regulatory approval, detailed engineering, a supplier quotation or an approved site specification.",
    sample ? "gold" : "teal",
    90,
  );
  doc.font("Helvetica-Bold").fontSize(10).fillColor(C.teal).text("LIFE SCIENCE ATLAS", 205, 748, { characterSpacing: 1.1 });
  doc.font("Helvetica").fontSize(8).fillColor("#8FA5BA").text("Decision intelligence for regulated manufacturing quality", 205, 766);
}

function drawExecutivePage(doc: Doc, project: QualityLabProject, sample: boolean) {
  const b = project.blueprint;
  const readiness = getQualityLabReadiness(b);
  sectionPage(doc, 2, "01 / Executive decision", "Decision brief", "The decision, modeled signal, confidence boundary and immediate actions on one page.", sample);
  callout(doc, MARGIN, 132, CONTENT_WIDTH, "Decision mandate", project.input.primaryDecision, "teal", 82);

  const gap = 10;
  const cardWidth = (CONTENT_WIDTH - gap * 3) / 4;
  kpi(doc, MARGIN, 229, cardWidth, "Current workload", number(b.current.monthlyTests), "modeled test units / month", "blue");
  kpi(doc, MARGIN + (cardWidth + gap), 229, cardWidth, "Team basis", number(b.current.totalTeamFte), "current concept FTE", "teal");
  kpi(doc, MARGIN + (cardWidth + gap) * 2, 229, cardWidth, "Space basis", `${number(b.current.estimatedAreaSqm)} m2`, "functional allowance", "neutral");
  kpi(doc, MARGIN + (cardWidth + gap) * 3, 229, cardWidth, "Evidence ready", pct(readiness.evidenceReadiness.score), `${b.dataQuality.blockingOpenCount} blockers remain`, b.dataQuality.blockingOpenCount ? "gold" : "teal");

  label(doc, "Modeled decision signal", MARGIN, 329, 230);
  paragraph(
    doc,
    `${number(b.current.monthlyTests)} current test units rise to ${number(b.future.monthlyTests)} by ${b.future.label}; team allowance moves from ${b.current.totalTeamFte} to ${b.future.totalTeamFte} FTE and the functional area from ${number(b.current.estimatedAreaSqm)} to ${number(b.future.estimatedAreaSqm)} m2.`,
    MARGIN,
    347,
    236,
    { size: 10, color: C.ink, lineGap: 3 },
  );
  callout(doc, MARGIN, 420, 236, "Recommended posture", b.recommendations[0]?.recommendation ?? "Resolve evidence gaps before design freeze.", "blue", 113);

  const rightX = MARGIN + 257;
  label(doc, "Five actions that unlock the next decision", rightX, 329, 246);
  b.recommendations.slice(0, 5).forEach((item, index) => {
    const y = 350 + index * 61;
    doc.circle(rightX + 11, y + 11, 11).fill(index < 3 ? C.teal : C.blueLight);
    doc.font("Helvetica-Bold").fontSize(8).fillColor(index < 3 ? C.white : C.blue).text(String(index + 1), rightX + 7.5, y + 6.5, { width: 7, align: "center" });
    paragraph(doc, short(item.recommendation, 128), rightX + 31, y, 214, { size: 8.2, color: C.ink, bold: true, lineGap: 1.5 });
    paragraph(doc, clean(item.priority).replace(/-/g, " "), rightX + 31, y + 35, 214, { size: 7.2, color: C.muted });
  });
  callout(doc, MARGIN, 663, CONTENT_WIDTH, "Reliance boundary", "A complete intake is not a controlled release. Resolve blocking evidence, reconcile approved methods and record qualified QC, QA and engineering review before funding, URS or procurement decisions.", "gold", 83);
}

function drawScenarioPage(doc: Doc, b: QualityLabBlueprint, sample: boolean) {
  sectionPage(doc, 3, "02 / Scenario model", "Baseline vs future scenario", "Discrete scenario bars show what changes across demand, labor and space. Exact values remain visible beside every mark.", sample);
  const metrics = buildScenarioComparison(b.current, b.future);
  legendDot(doc, 375, 127, C.blue, b.current.label);
  legendDot(doc, 465, 127, C.teal, b.future.label);
  metrics.forEach((metric, index) => {
    const y = 166 + index * 91;
    label(doc, metric.label, MARGIN, y, 170, C.ink);
    paragraph(doc, metric.unit, MARGIN, y + 15, 170, { size: 7.5, color: C.muted });
    const max = Math.max(metric.current, metric.future, 1);
    horizontalBar(doc, 190, y + 1, 266, metric.current, max, C.blue);
    horizontalBar(doc, 190, y + 22, 266, metric.future, max, C.teal);
    doc.font("Helvetica-Bold").fontSize(8).fillColor(C.ink).text(number(metric.current, 1), 464, y, { width: 60, align: "right" });
    doc.text(number(metric.future, 1), 464, y + 21, { width: 60, align: "right" });
    const changeTone = metric.changePercent > 30 ? C.gold : C.tealDark;
    doc.font("Helvetica-Bold").fontSize(8).fillColor(changeTone).text(`+${number(metric.changePercent, 1)}%`, 464, y + 43, { width: 60, align: "right" });
  });
  const deltaCapex = b.future.capexHighUsd - b.current.capexHighUsd;
  const deltaOpex = b.future.annualOpexHighUsd - b.current.annualOpexHighUsd;
  callout(doc, MARGIN, 554, CONTENT_WIDTH, "Commercial implication", `The future concept adds up to ${money(deltaCapex)} to the high CAPEX allowance and ${money(deltaOpex)} to high annual OPEX. Release spend only against approved demand triggers and reviewed requirements.`, "gold", 82);
  callout(doc, MARGIN, 651, CONTENT_WIDTH, "Scenario discipline", `Growth is modeled as ${number((b.future.multiplier - 1) * 100)}% across the planning horizon. This is a comparison case, not a forecast probability or a commitment to linear growth.`, "neutral", 76);
}

function drawWorkloadPage(doc: Doc, b: QualityLabBlueprint, sample: boolean) {
  sectionPage(doc, 4, "03 / Workload architecture", "What creates laboratory demand?", "Workflow bars separate modeled test units from hands-on hours so volume is not mistaken for labor intensity.", sample);
  const rows = [...b.workflows].sort((a, c) => c.monthlyUnits - a.monthlyUnits).slice(0, 7);
  const maxUnits = Math.max(...rows.map((item) => item.monthlyUnits), 1);
  const maxHours = Math.max(...rows.map((item) => item.monthlyHandsOnHours), 1);
  legendDot(doc, 340, 128, C.blue, "Test units");
  legendDot(doc, 430, 128, C.teal, "Hands-on hours", true);
  rows.forEach((row, index) => {
    const y = 162 + index * 63;
    paragraph(doc, short(row.label, 38), MARGIN, y, 154, { size: 8.2, color: C.ink, bold: true });
    paragraph(doc, row.confidence, MARGIN, y + 19, 100, { size: 7.2, color: C.muted });
    horizontalBar(doc, 207, y + 1, 214, row.monthlyUnits, maxUnits, C.blue);
    horizontalBar(doc, 207, y + 22, 214, row.monthlyHandsOnHours, maxHours, C.tealLight);
    doc.font("Helvetica-Bold").fontSize(7.8).fillColor(C.ink).text(`${number(row.monthlyUnits, 1)} u`, 432, y, { width: 72, align: "right" });
    doc.text(`${number(row.monthlyHandsOnHours, 1)} h`, 432, y + 21, { width: 72, align: "right" });
  });
  callout(doc, MARGIN, 626, CONTENT_WIDTH, "Model definition", "A test unit is a planning workload unit created by the current Domain Pack. It is not automatically one sample, plate, determination or reportable result. Approved site methods must replace the concept conversion basis.", "gold", 82);
}

function drawCapabilityPage(doc: Doc, b: QualityLabBlueprint, sample: boolean) {
  sectionPage(doc, 5, "04 / Capability model", "Capability and method-control map", "The matrix distinguishes modeled coverage from site evidence and controlled readiness.", sample);
  const workflows = b.workflows.slice(0, 7);
  const xColumns = [255, 326, 397, 468];
  ["Modeled", "Method trace", "Resource link", "Site evidence"].forEach((item, index) => label(doc, item, xColumns[index] - 22, 140, 66, index === 3 ? C.gold : C.ink));
  workflows.forEach((workflow, index) => {
    const y = 178 + index * 54;
    if (index % 2 === 0) doc.rect(MARGIN, y - 9, CONTENT_WIDTH, 42).fill(C.panel);
    paragraph(doc, workflow.label, MARGIN + 10, y, 175, { size: 8.5, color: C.ink, bold: true });
    paragraph(doc, workflow.criticality, MARGIN + 10, y + 18, 100, { size: 7.2, color: C.muted });
    const states = [
      { color: C.green, open: false },
      { color: workflow.evidenceIds.length > 1 ? C.blue : C.gold, open: false },
      { color: b.equipment.some((equipment) => equipment.methodLoadBasis.some((basis) => basis.toLowerCase().includes(workflow.label.split(" ")[0].toLowerCase()))) ? C.teal : C.gold, open: false },
      { color: C.gold, open: true },
    ];
    states.forEach((state, column) => {
      doc.circle(xColumns[column] + 10, y + 7, 6);
      if (state.open) doc.lineWidth(1.8).strokeColor(state.color).stroke(); else doc.fillColor(state.color).fill();
    });
  });
  legendDot(doc, MARGIN, 579, C.green, "Modeled");
  legendDot(doc, MARGIN + 108, 579, C.blue, "Trace linked");
  legendDot(doc, MARGIN + 216, 579, C.gold, "Review needed", true);
  callout(doc, MARGIN, 620, CONTENT_WIDTH, "Decision use", `${b.methodRequirements.length} product-market-method requirements are traced in the current concept. Capability presence does not establish approved methods, suitability or deployable staff coverage.`, "teal", 86);
}

function drawCapacityPage(doc: Doc, b: QualityLabBlueprint, sample: boolean) {
  sectionPage(doc, 6, "05 / Equipment capacity", "Resource pressure and headroom", "Utilization uses the method-derived load, a 1.3 peak factor and the concept equipment allowance. The visual scale extends to 120%.", sample);
  const rows = buildCapacityVisual(b.methodCapacitySummary);
  const barX = 230;
  const barWidth = 250;
  doc.font("Helvetica").fontSize(7).fillColor(C.muted).text("0", barX, 141).text("85", barX + barWidth * (85 / 120) - 8, 141).text("100", barX + barWidth * (100 / 120) - 9, 141).text("120%", barX + barWidth - 20, 141);
  rows.forEach((row, index) => {
    const y = 177 + index * 88;
    paragraph(doc, row.resourceName, MARGIN, y, 166, { size: 9, color: C.ink, bold: true });
    paragraph(doc, `${number(row.monthlyDemand, 1)} ${row.unit}`, MARGIN, y + 20, 166, { size: 7.5, color: C.muted });
    const color = row.status === "constrained" ? C.red : row.status === "watch" ? C.gold : C.teal;
    horizontalBar(doc, barX, y + 4, barWidth, Math.min(row.utilizationPercent, 120), 120, color, C.panel2, 100 / 120);
    doc.moveTo(barX + barWidth * (85 / 120), y).lineTo(barX + barWidth * (85 / 120), y + 18).lineWidth(0.7).strokeColor(C.gold).stroke();
    doc.font("Helvetica-Bold").fontSize(10).fillColor(color).text(pct(row.utilizationPercent), 487, y, { width: 53, align: "right" });
    paragraph(doc, row.status, 487, y + 20, 53, { size: 7.2, color, bold: true });
    paragraph(doc, short(row.basis, 104), barX, y + 29, 310, { size: 7.2, color: C.muted, lineGap: 1 });
  });
  const highest = [...rows].sort((a, c) => c.utilizationPercent - a.utilizationPercent)[0];
  callout(doc, MARGIN, 575, CONTENT_WIDTH, "Highest modeled pressure", highest ? `${highest.resourceName} is highest at ${pct(highest.utilizationPercent)}. Confirm usable capacity, cycle time, load geometry, downtime, queueing and redundancy before URS or procurement.` : "No method-derived capacity rows were generated.", highest?.status === "constrained" ? "red" : "gold", 90);
  callout(doc, MARGIN, 680, CONTENT_WIDTH, "Visible formula", "Utilization = (monthly method load x 1.3 peak factor) / available monthly capacity x 100. This is a load check, not a schedule or queue simulation.", "neutral", 66);
}

function drawWorkforcePage(doc: Doc, b: QualityLabBlueprint, sample: boolean) {
  sectionPage(doc, 7, "06 / Workforce", "Team capacity and skill coverage", "FTE is decomposed into execution, resilience and review so aggregate headcount does not hide role constraints.", sample);
  const model = b.workforceCapacity;
  if (!model) {
    callout(doc, MARGIN, 150, CONTENT_WIDTH, "Model unavailable", "The current Blueprint does not contain the workforce-capacity extension.", "gold", 90);
    return;
  }
  const scenarios = [model.current, model.future];
  scenarios.forEach((scenario, index) => {
    const x = MARGIN + index * 257;
    label(doc, scenario.label, x, 142, 230, index ? C.tealDark : C.blue);
    const total = Math.max(scenario.totalTeamFte, 1);
    const barY = 175;
    const barWidth = 224;
    const executionWidth = (scenario.baseExecutionFte / total) * barWidth;
    const reserveWidth = (scenario.resilienceReserveFte / total) * barWidth;
    const reviewerWidth = (scenario.reviewerFte / total) * barWidth;
    doc.roundedRect(x, barY, barWidth, 28, 6).fill(C.panel2);
    doc.rect(x, barY, executionWidth, 28).fill(C.blue);
    doc.rect(x + executionWidth, barY, reserveWidth, 28).fill(C.teal);
    doc.rect(x + executionWidth + reserveWidth, barY, reviewerWidth, 28).fill(C.gold);
    doc.font("Helvetica-Bold").fontSize(16).fillColor(C.ink).text(`${scenario.totalTeamFte} FTE`, x, 215);
    paragraph(doc, `${number(scenario.productiveHoursPerFte)} productive hours/FTE/month`, x, 237, 224, { size: 7.5, color: C.muted });
  });
  legendDot(doc, MARGIN, 275, C.blue, "Execution");
  legendDot(doc, MARGIN + 110, 275, C.teal, "Resilience");
  legendDot(doc, MARGIN + 220, 275, C.gold, "Review");

  label(doc, "Current role demand", MARGIN, 314, 220, C.ink);
  const roles = model.current.roles;
  const maxFte = Math.max(...roles.map((role) => role.requiredFte), 1);
  roles.forEach((role, index) => {
    const y = 345 + index * 54;
    paragraph(doc, short(role.role, 42), MARGIN, y, 190, { size: 8.2, color: C.ink, bold: true });
    horizontalBar(doc, 245, y + 3, 210, role.requiredFte, maxFte, index === roles.length - 1 ? C.gold : C.teal);
    doc.font("Helvetica-Bold").fontSize(8).fillColor(C.ink).text(`${number(role.requiredFte, 2)} FTE`, 466, y, { width: 70, align: "right" });
  });
  callout(doc, MARGIN, 595, CONTENT_WIDTH, "Coverage warning", `${model.skillCoverage.length} skill areas still require named-site confirmation. Aggregate FTE cannot prove shift coverage, leave resilience, reviewer availability or investigation capacity.`, "gold", 86);
}

function drawSpacePage(doc: Doc, b: QualityLabBlueprint, sample: boolean) {
  sectionPage(doc, 8, "07 / Space concept", "Functional area schematic", "Area-proportional blocks communicate functional demand. They are deliberately not room geometry or a floor plan.", sample);
  const zones = buildZoneLayout(b.spaces, 475, 320, 5);
  const x0 = 60;
  const y0 = 154;
  const palette = [C.tealLight, C.blueLight, C.goldLight, "#E7E1F4", "#E4EFE6", "#F6E3D8", "#E8EFF5", "#DCE8EA"];
  zones.forEach((zone, index) => {
    const x = x0 + zone.x;
    const y = y0 + zone.y;
    doc.roundedRect(x, y, Math.max(zone.width, 10), Math.max(zone.height, 10), 5).fillAndStroke(palette[index % palette.length], C.white);
    if (zone.width > 68 && zone.height > 42) {
      paragraph(doc, short(zone.name, zone.width > 115 ? 38 : 22), x + 7, y + 8, zone.width - 14, { size: zone.width > 115 ? 8 : 7, color: C.ink, bold: true, lineGap: 1 });
      paragraph(doc, `${number(zone.areaSqm, 1)} m2 | ${pct(zone.sharePercent)}`, x + 7, y + Math.min(zone.height - 17, 42), zone.width - 14, { size: 6.8, color: C.slate });
    }
  });
  label(doc, "Functional allowance", MARGIN, 499, 180, C.ink);
  doc.font("Helvetica-Bold").fontSize(23).fillColor(C.tealDark).text(`${number(b.current.estimatedAreaSqm)} m2`, MARGIN, 518);
  paragraph(doc, `Future scenario: ${number(b.future.estimatedAreaSqm)} m2`, MARGIN, 549, 180, { size: 8.2, color: C.slate });
  callout(doc, 229, 501, 320, "Engineering boundary", "Adjacencies, dimensions, people/material/waste flows, equipment envelopes, utilities, HVAC, containment and code compliance require qualified engineering.", "gold", 87);
  callout(doc, MARGIN, 617, CONTENT_WIDTH, "Use this page for", "Confirming which functions need space, where allowances concentrate and which interfaces require an engineering basis-of-design workshop - not for construction or room approval.", "neutral", 78);
}

function rangeRow(doc: Doc, x: number, y: number, width: number, labelText: string, low: number, high: number, max: number, color: string) {
  paragraph(doc, labelText, x, y, 130, { size: 8.3, color: C.ink, bold: true });
  const barX = x + 145;
  const barWidth = width - 225;
  doc.roundedRect(barX, y + 3, barWidth, 12, 6).fill(C.panel2);
  const lowX = barX + (low / Math.max(max, 1)) * barWidth;
  const highX = barX + (high / Math.max(max, 1)) * barWidth;
  doc.roundedRect(lowX, y + 3, Math.max(4, highX - lowX), 12, 6).fill(color);
  doc.circle(lowX, y + 9, 3).fill(C.ink);
  doc.circle(highX, y + 9, 3).fill(C.ink);
  doc.font("Helvetica-Bold").fontSize(8).fillColor(C.ink).text(`${money(low)} - ${money(high)}`, x + width - 76, y, { width: 76, align: "right" });
}

function drawCostPage(doc: Doc, b: QualityLabBlueprint, sample: boolean) {
  sectionPage(doc, 9, "08 / Commercial model", "CAPEX, OPEX and procurement gates", "Range bars preserve uncertainty; exact low/high values remain visible and are not presented as quotations.", sample);
  label(doc, "CAPEX allowance", MARGIN, 142, 190, C.ink);
  const capexMax = Math.max(b.current.capexHighUsd, b.future.capexHighUsd, 1);
  rangeRow(doc, MARGIN, 177, CONTENT_WIDTH, b.current.label, b.current.capexLowUsd, b.current.capexHighUsd, capexMax, C.blue);
  rangeRow(doc, MARGIN, 225, CONTENT_WIDTH, b.future.label, b.future.capexLowUsd, b.future.capexHighUsd, capexMax, C.teal);

  label(doc, "Annual OPEX allowance", MARGIN, 298, 190, C.ink);
  const opexMax = Math.max(b.current.annualOpexHighUsd, b.future.annualOpexHighUsd, 1);
  rangeRow(doc, MARGIN, 333, CONTENT_WIDTH, b.current.label, b.current.annualOpexLowUsd, b.current.annualOpexHighUsd, opexMax, C.blue);
  rangeRow(doc, MARGIN, 381, CONTENT_WIDTH, b.future.label, b.future.annualOpexLowUsd, b.future.annualOpexHighUsd, opexMax, C.teal);

  label(doc, "Procurement sequence", MARGIN, 455, 190, C.ink);
  b.procurementSequence.slice(0, 3).forEach((phase, index) => {
    const x = MARGIN + index * 169;
    roundedPanel(doc, x, 481, 156, 109, index === 0 ? C.tealLight : C.panel, index === 0 ? "#9BDED3" : C.line, 9);
    doc.circle(x + 20, 501, 11).fill(index === 0 ? C.teal : C.blueLight);
    doc.font("Helvetica-Bold").fontSize(8).fillColor(index === 0 ? C.white : C.blue).text(String(index + 1), x + 16.5, 496.5, { width: 7, align: "center" });
    paragraph(doc, short(phase.phase, 28), x + 38, 492, 104, { size: 8, color: C.ink, bold: true });
    paragraph(doc, short(phase.timing, 32), x + 13, 523, 130, { size: 7.3, color: C.slate });
    paragraph(doc, short(phase.items.join(", "), 68), x + 13, 545, 130, { size: 7, color: C.muted, lineGap: 1 });
  });
  callout(doc, MARGIN, 624, CONTENT_WIDTH, "Budget boundary", "Replace concept bands with dated local quotations, installed-cost scope, qualification assumptions, taxes, freight, service terms and approved contingency before budget approval.", "gold", 82);
}

function drawConsumablesPage(doc: Doc, b: QualityLabBlueprint, sample: boolean) {
  sectionPage(doc, 10, "09 / Supply resilience", "Consumables and inventory exposure", "The supply view combines demand, reorder point, safety stock and annual spend instead of showing volume alone.", sample);
  const rows = [...(b.consumableSupply?.current ?? [])].sort((a, c) => c.annualSpendHighUsd - a.annualSpendHighUsd).slice(0, 5);
  const maxSpend = Math.max(...rows.map((row) => row.annualSpendHighUsd), 1);
  rows.forEach((row, index) => {
    const y = 158 + index * 78;
    paragraph(doc, short(row.name, 40), MARGIN, y, 166, { size: 8.6, color: C.ink, bold: true });
    paragraph(doc, `${number(row.grossMonthlyDemand, 1)} ${clean(row.unit)}/month`, MARGIN, y + 20, 166, { size: 7.3, color: C.muted });
    horizontalBar(doc, 224, y + 4, 206, row.annualSpendHighUsd, maxSpend, C.teal);
    doc.font("Helvetica-Bold").fontSize(8).fillColor(C.ink).text(`${money(row.annualSpendLowUsd)}-${money(row.annualSpendHighUsd)}`, 438, y, { width: 98, align: "right" });
    paragraph(doc, `ROP ${number(row.reorderPoint, 1)} | safety ${number(row.safetyStock, 1)} | target ${number(row.targetStock, 1)}`, 224, y + 24, 312, { size: 7.2, color: C.slate });
  });
  const params = b.consumableSupply?.parameters;
  callout(doc, MARGIN, 575, CONTENT_WIDTH, "Planning assumptions", params ? `${number(params.wastePercent)}% waste allowance, ${number(params.leadTimeDays)}-day replenishment and ${number(params.safetyStockDays)} demand days of safety stock. Confirm pack size, shelf life, release timing and alternate-source status.` : "Supply parameters are not available in this model version.", "blue", 90);
  callout(doc, MARGIN, 680, CONTENT_WIDTH, "Continuity boundary", "Average inventory does not prove service continuity. Approved item masters, qualified suppliers, expiry-at-receipt rules, storage constraints and disruption scenarios remain required.", "gold", 68);
}

function drawControlsPage(doc: Doc, project: QualityLabProject, sample: boolean) {
  const b = project.blueprint;
  sectionPage(doc, 11, "10 / Decision controls", "Risk, blocker, open input and action", "These are different control objects. A low modeled-risk count cannot override missing evidence.", sample);
  const highRisks = b.risks.filter((item) => item.severity === "high").length;
  const activeActions = project.actionPlan.actions.filter((item) => item.status !== "resolved").length;
  const counts = [
    ["Modeled high risk", highRisks, "Detected from modeled inputs", "blue" as Tone],
    ["Evidence blocker", b.dataQuality.blockingOpenCount, "Prevents controlled reliance", "red" as Tone],
    ["Important input", b.dataQuality.importantOpenCount, "Could materially change output", "gold" as Tone],
    ["Active action", activeActions, "Owned work to resolve gaps", "teal" as Tone],
  ];
  counts.forEach(([title, value, note, tone], index) => kpi(doc, MARGIN + index * 128, 150, 117, String(title), String(value), String(note), tone as Tone));

  label(doc, "Control chain", MARGIN, 257, 190, C.ink);
  const chain = ["Input / assumption", "Modeled signal", "Evidence gap", "Owned action", "Qualified decision"];
  chain.forEach((item, index) => {
    const x = MARGIN + index * 101;
    roundedPanel(doc, x, 289, 88, 58, index === 4 ? C.tealLight : C.panel, index === 4 ? "#9BDED3" : C.line, 8);
    paragraph(doc, item, x + 8, 305, 72, { size: 7.5, color: C.ink, bold: true, lineGap: 1 });
    if (index < chain.length - 1) {
      doc.moveTo(x + 88, 318).lineTo(x + 98, 318).lineWidth(1.2).strokeColor(C.teal).stroke();
      doc.polygon([x + 98, 318], [x + 93, 315], [x + 93, 321]).fill(C.teal);
    }
  });

  label(doc, "Material risk register", MARGIN, 386, 190, C.ink);
  const riskRows = b.risks.slice(0, 5).map((risk) => [risk.severity.toUpperCase(), risk.title, risk.mitigation]);
  const bottom = table(doc, MARGIN, 410, ["Severity", "Risk", "Control response"], riskRows.length ? riskRows : [["OPEN", "No modeled high-risk rows", "Evidence blockers still govern reliance"]], [68, 155, 280], { rowHeight: 44, fontSize: 7.4, emphasisColumn: 0 });
  callout(doc, MARGIN, Math.min(bottom + 18, 679), CONTENT_WIDTH, "Interpretation", `${b.dataQuality.blockingOpenCount} blockers map to blocker-resolution actions. The action register records owner, due date, required evidence, status and activity history.`, "gold", 70);
}

function drawEvidencePage(doc: Doc, project: QualityLabProject, sample: boolean) {
  const b = project.blueprint;
  const readiness = getQualityLabReadiness(b);
  sectionPage(doc, 12, "11 / Evidence readiness", "What must be true before controlled use?", "Model completeness, evidence readiness and decision readiness are separate measures; none is an approval badge or regulatory score.", sample);
  const ready = readiness.evidenceReadiness.score;
  label(doc, "Evidence readiness", MARGIN, 143, 240, C.ink);
  doc.roundedRect(MARGIN, 175, CONTENT_WIDTH, 30, 15).fill(C.panel2);
  doc.roundedRect(MARGIN, 175, Math.max(8, CONTENT_WIDTH * ready / 100), 30, 15).fill(ready >= 80 ? C.teal : ready >= 50 ? C.gold : C.red);
  doc.moveTo(MARGIN + CONTENT_WIDTH * 0.8, 168).lineTo(MARGIN + CONTENT_WIDTH * 0.8, 213).lineWidth(1).strokeColor(C.ink).stroke();
  doc.font("Helvetica-Bold").fontSize(18).fillColor(C.ink).text(`${ready}%`, MARGIN, 217);
  paragraph(doc, `${readiness.modelCompleteness.score}% model completeness; ${readiness.decisionReadiness.label.toLowerCase()}.`, MARGIN + 66, 224, 250, { size: 7.5, color: C.muted });
  callout(doc, 366, 217, 183, "Score logic", "Equal-weight evidence dimensions: 100 closed, 70 advisory, 40 important, 0 blocking.", "neutral", 63);

  label(doc, "Priority evidence gaps", MARGIN, 304, 220, C.ink);
  const gaps = b.unresolvedInputs.filter((item) => item.severity !== "advisory").slice(0, 6);
  gaps.forEach((gap, index) => {
    const y = 337 + index * 60;
    const isBlocker = gap.severity === "blocking";
    doc.roundedRect(MARGIN, y, 72, 20, 10).fill(isBlocker ? C.redLight : C.goldLight);
    doc.font("Helvetica-Bold").fontSize(7).fillColor(isBlocker ? C.red : C.gold).text(gap.severity.toUpperCase(), MARGIN + 7, y + 6, { width: 58, align: "center" });
    paragraph(doc, short(gap.question, 104), MARGIN + 88, y - 1, 264, { size: 8, color: C.ink, bold: true, lineGap: 1 });
    paragraph(doc, short(gap.resolution, 74), MARGIN + 365, y - 1, 138, { size: 7.2, color: C.slate, lineGap: 1 });
  });
  callout(doc, MARGIN, 713, CONTENT_WIDTH, "Closure rule", "A source link alone does not close a gap. Record exact version, locator, project scope, limitations and qualified review disposition.", "teal", 58);
}

function drawSensitivityPage(doc: Doc, project: QualityLabProject, sample: boolean) {
  const analysis = analyzeQualityLabSensitivity(project);
  const ranked = analysis.drivers.slice(0, 6);
  const maximum = Math.max(1, ...ranked.map((driver) => driver.maxOutputSwingPercent));
  const dominant = ranked[0];
  sectionPage(doc, 13, "12 / Decision sensitivity", "Decision sensitivity and evidence priority", "One-at-a-time input tests rank which assumptions can move the planning decision and which site evidence should be verified first.", sample);

  const cardWidth = (CONTENT_WIDTH - 20) / 3;
  kpi(doc, MARGIN, 140, cardWidth, "Dominant tested swing", dominant ? pct(dominant.maxOutputSwingPercent) : "0%", dominant?.label ?? "No active driver", dominant?.verificationPriority === "critical" ? "gold" : "blue");
  kpi(doc, MARGIN + cardWidth + 10, 140, cardWidth, "Decision-critical", number(analysis.summary.decisionCriticalCount), "drivers in tested ranges", analysis.summary.decisionCriticalCount ? "gold" : "teal");
  kpi(doc, MARGIN + (cardWidth + 10) * 2, 140, cardWidth, "Evidence required", number(analysis.summary.siteEvidenceRequiredCount), `screened by ${analysis.engineVersion}`, "neutral");

  label(doc, "Ranked driver influence", MARGIN, 247, 220, C.ink);
  paragraph(doc, "Largest absolute movement across six planning outputs", 305, 247, 244, { size: 7.2, color: C.muted });
  ranked.forEach((driver, index) => {
    const y = 278 + index * 45;
    paragraph(doc, `${index + 1}. ${short(driver.label, 34)}`, MARGIN, y - 3, 145, { size: 8, color: C.ink, bold: true });
    horizontalBar(doc, 198, y, 235, driver.maxOutputSwingPercent, maximum, driver.verificationPriority === "critical" ? C.gold : C.teal);
    doc.font("Helvetica-Bold").fontSize(8).fillColor(C.ink).text(pct(driver.maxOutputSwingPercent), 440, y - 2, { width: 43, align: "right" });
    doc.font("Helvetica-Bold").fontSize(6.8).fillColor(driver.verificationPriority === "critical" ? C.gold : C.slate).text(driver.verificationPriority.toUpperCase(), 488, y - 2, { width: 61, align: "right" });
    paragraph(doc, `${number(driver.lowValue, 1)}-${number(driver.highValue, 1)} ${driver.unit}`, 198, y + 15, 235, { size: 6.8, color: C.muted });
  });

  callout(doc, MARGIN, 548, CONTENT_WIDTH, "How to read this chart", "The longest bar identifies the input with the largest modeled output movement inside its stated test range. It does not express likelihood, statistical confidence, design margin, combined-driver interaction or an approval basis.", "blue", 62);
  label(doc, "Evidence verification queue", MARGIN, 628, 220, C.ink);
  const queueRows = analysis.verificationQueue.slice(0, 3).map((driver) => [driver.verificationPriority.toUpperCase(), driver.label, driver.evidenceNeeded]);
  table(doc, MARGIN, 651, ["Priority", "Driver", "Evidence needed before reliance"], queueRows, [68, 128, 307], { rowHeight: 35, fontSize: 6.9, emphasisColumn: 0 });
}

function drawActionPage(doc: Doc, project: QualityLabProject, sample: boolean) {
  const b = project.blueprint;
  sectionPage(doc, 14, "13 / Action roadmap", "From concept to a defensible decision", "The roadmap converts open information into owned evidence work and explicit decision gates.", sample);
  const groups = [
    { title: "Now - frame evidence", tone: "red" as Tone, items: b.unresolvedInputs.filter((item) => item.severity === "blocking").slice(0, 3).map((item) => item.resolution) },
    { title: "Before design freeze", tone: "blue" as Tone, items: b.recommendations.filter((item) => item.priority === "before-design-freeze").slice(0, 3).map((item) => item.recommendation) },
    { title: "Before budget approval", tone: "gold" as Tone, items: b.recommendations.filter((item) => item.priority === "before-budget-approval").slice(0, 3).map((item) => item.recommendation) },
    { title: "Controlled handover", tone: "teal" as Tone, items: ["Record qualified review and corrections.", "Freeze document version and evidence register.", "Request written acceptance or acceptance with actions."] },
  ];
  groups.forEach((group, index) => {
    const y = 145 + index * 146;
    const colors = toneColors(group.tone);
    doc.circle(MARGIN + 17, y + 18, 17).fill(colors.accent);
    doc.font("Helvetica-Bold").fontSize(10).fillColor(C.white).text(String(index + 1), MARGIN + 11, y + 12, { width: 12, align: "center" });
    if (index < groups.length - 1) doc.moveTo(MARGIN + 17, y + 37).lineTo(MARGIN + 17, y + 139).lineWidth(2).strokeColor(C.line).stroke();
    roundedPanel(doc, MARGIN + 47, y, CONTENT_WIDTH - 47, 126, colors.fill, colors.border, 10);
    label(doc, group.title, MARGIN + 63, y + 14, 300, colors.accent);
    group.items.slice(0, 3).forEach((item, itemIndex) => {
      doc.circle(MARGIN + 69, y + 47 + itemIndex * 27, 2.7).fill(colors.accent);
      paragraph(doc, short(item, 112), MARGIN + 79, y + 40 + itemIndex * 27, CONTENT_WIDTH - 96, { size: 7.8, color: C.ink, lineGap: 1 });
    });
  });
  paragraph(doc, `${project.actionPlan.actions.filter((item) => item.status !== "resolved").length} active actions are available in the controlled workbook with owner, due date, evidence note and status.`, MARGIN + 47, 740, CONTENT_WIDTH - 47, { size: 8, color: C.slate, bold: true });
}

function drawTracePage(doc: Doc, b: QualityLabBlueprint, sample: boolean) {
  sectionPage(doc, 15, "14 / Traceability", "How the Blueprint reaches an output", "Counts and version labels make the calculation chain inspectable without implying that every evidence dependency is closed.", sample);
  const nodes = [
    { title: "Project inputs", value: "4 steps", note: b.input.contractVersion, tone: "blue" as Tone },
    { title: "Workflow demand", value: String(b.workflows.length), note: "operating workflows", tone: "teal" as Tone },
    { title: "Method requirements", value: String(b.methodRequirements.length), note: "product-market links", tone: "teal" as Tone },
    { title: "Versioned rules", value: String(b.dataQuality.tracedRuleCount), note: b.compilerCoreVersion, tone: "blue" as Tone },
    { title: "Evidence records", value: String(b.dataQuality.evidenceCount), note: "catalog + project basis", tone: "gold" as Tone },
    { title: "Decision outputs", value: "8", note: "workload to actions", tone: "teal" as Tone },
  ];
  nodes.forEach((node, index) => {
    const row = Math.floor(index / 3);
    const col = index % 3;
    const x = MARGIN + col * 172;
    const y = 155 + row * 149;
    const colors = toneColors(node.tone);
    roundedPanel(doc, x, y, 157, 94, colors.fill, colors.border, 10);
    label(doc, node.title, x + 13, y + 13, 131, colors.accent);
    doc.font("Helvetica-Bold").fontSize(22).fillColor(C.ink).text(node.value, x + 13, y + 34, { width: 131 });
    paragraph(doc, short(node.note, 31), x + 13, y + 68, 131, { size: 7.2, color: C.muted });
    if (col < 2) {
      doc.moveTo(x + 157, y + 47).lineTo(x + 169, y + 47).lineWidth(1.2).strokeColor(C.teal).stroke();
      doc.polygon([x + 169, y + 47], [x + 164, y + 44], [x + 164, y + 50]).fill(C.teal);
    }
  });
  doc.moveTo(PAGE_WIDTH - MARGIN - 79, 249).lineTo(PAGE_WIDTH - MARGIN - 79, 285).lineWidth(1.2).strokeColor(C.teal).stroke();
  doc.polygon([PAGE_WIDTH - MARGIN - 79, 285], [PAGE_WIDTH - MARGIN - 82, 280], [PAGE_WIDTH - MARGIN - 76, 280]).fill(C.teal);
  label(doc, "Rule trace excerpt", MARGIN, 470, 190, C.ink);
  const traceRows = b.ruleTrace.slice(0, 5).map((item) => [item.ruleId, item.ruleVersion, item.confidence, item.reviewRequired ? "Required" : "Advisory"]);
  table(doc, MARGIN, 495, ["Rule", "Version", "Confidence", "Review"], traceRows, [215, 85, 90, 113], { rowHeight: 37, fontSize: 7.2, emphasisColumn: 0 });
  callout(doc, MARGIN, 728, CONTENT_WIDTH, "Change control", "Project corrections become candidates only. They do not change executable rules until evidence, impact review, validation cases and controlled release support a new version.", "gold", 56);
}

function drawRegistersPage(doc: Doc, b: QualityLabBlueprint, sample: boolean) {
  sectionPage(doc, 16, "15 / Registers", "Evidence, assumptions and limitations", "The PDF carries decision-critical entries; the workbook retains the full editable registers.", sample);
  label(doc, "Evidence register excerpt", MARGIN, 140, 220, C.ink);
  const evidenceRows = b.evidence.slice(0, 5).map((item) => [item.title, item.kind, item.status, item.version || "Open"]);
  const evidenceBottom = table(doc, MARGIN, 165, ["Evidence", "Kind", "Status", "Version"], evidenceRows, [214, 88, 103, 98], { rowHeight: 36, fontSize: 7.2, emphasisColumn: 0 });
  label(doc, "Assumption register excerpt", MARGIN, evidenceBottom + 24, 240, C.ink);
  const assumptionRows = b.assumptions.slice(0, 5).map((item) => [item.label, item.value, item.confidence, item.source]);
  const assumptionBottom = table(doc, MARGIN, evidenceBottom + 49, ["Assumption", "Value", "Confidence", "Source"], assumptionRows, [190, 101, 84, 128], { rowHeight: 35, fontSize: 7.1, emphasisColumn: 0 });
  callout(doc, MARGIN, Math.min(assumptionBottom + 18, 718), CONTENT_WIDTH, "Full controlled register", "The companion workbook contains method portfolio, equipment URS basis, consumables, open inputs, actions, evidence, rules, review checklist, decisions, corrections and calibration fields.", "teal", 66);
}

function drawHandoverPage(doc: Doc, project: QualityLabProject, snapshot: QualityLabReviewedProjectSnapshot, sample: boolean) {
  const b = project.blueprint;
  const readiness = getQualityLabReadiness(b);
  const control = snapshot.engagement?.deliveryControl;
  sectionPage(doc, 17, "16 / Controlled handover", "Release, acceptance and next decision", "The final page states exactly what the artifact can support, what remains open and how the client records acceptance.", sample);
  const leftWidth = 241;
  callout(doc, MARGIN, 145, leftWidth, "Suitable now", "Discovery, scenario discussion, evidence planning, scope definition and qualified review preparation.", "teal", 102);
  callout(doc, MARGIN + leftWidth + 21, 145, leftWidth, "Not suitable yet", "Final staffing, room design, turnaround commitment, URS approval, procurement, validation or regulatory reliance.", "red", 102);

  label(doc, "Release control", MARGIN, 282, 200, C.ink);
  const rows = [
    ["Recorded status", sample ? "Illustrative sample" : control?.recordedStatus || "Working draft"],
    ["Document ID", control?.documentId || `ATLAS-${project.id.toUpperCase()}`],
    ["Revision", control?.revision || "D0"],
    ["Prepared by", sample ? "Illustrative role pattern" : control?.preparedByRole || "Open"],
    ["Reviewed by", sample ? "Engagement-specific" : control?.reviewedByRole || "Open"],
    ["External approval", sample ? "Not applicable" : control?.externalApprovalReference || "Open"],
    ["Model / evidence readiness", `${readiness.modelCompleteness.score}% / ${readiness.evidenceReadiness.score}%`],
    ["Decision readiness", readiness.decisionReadiness.label],
  ];
  const bottom = table(doc, MARGIN, 307, ["Control", "Recorded value"], rows, [150, 353], { rowHeight: 37, fontSize: 7.6, emphasisColumn: 0 });
  callout(doc, MARGIN, bottom + 20, CONTENT_WIDTH, sample ? "What a paid engagement adds" : "Acceptance basis", sample ? "A scoped project replaces synthetic inputs with site evidence, names accountable reviewers, records corrections, supplies the editable workbook and issues one controlled revision after review." : "Record written acceptance or accepted-with-actions against this document ID and revision. Any material input change requires impact review and a controlled revision.", "blue", 92);
  paragraph(doc, "This document is a planning and decision-support artifact. It is not a validated design, regulatory opinion, supplier quotation, approved specification or substitute for qualified QC, QA, engineering and client document-control review.", MARGIN, 736, CONTENT_WIDTH, { size: 7.6, color: C.muted, lineGap: 1.5 });
}

export function qualityLabBlueprintPdf(snapshot: QualityLabReviewedProjectSnapshot, options: QualityLabBlueprintPdfOptions = {}): Promise<Buffer> {
  if (!snapshot.engagement) throw new Error("A review engagement packet is required before Blueprint PDF export");
  const engagement = snapshot.engagement;
  const sample = options.publicSample === true;
  const project = qualityLabProjectFromReviewedSnapshot(snapshot);
  const issueDate = options.issueDate ?? new Date().toISOString().slice(0, 10);
  // Evaluate package controls up front so a malformed engagement cannot produce a polished but invalid file.
  createQualityLabDeliveryPackage(project, engagement);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 0, bufferPages: true, autoFirstPage: true, compress: true, info: { Title: `${project.name} - Atlas Quality Lab Blueprint`, Author: "Life Science Atlas", Subject: clean(project.input.primaryDecision) } });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk as Buffer));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    drawCover(doc, project, snapshot, sample, issueDate);
    drawExecutivePage(doc, project, sample);
    drawScenarioPage(doc, project.blueprint, sample);
    drawWorkloadPage(doc, project.blueprint, sample);
    drawCapabilityPage(doc, project.blueprint, sample);
    drawCapacityPage(doc, project.blueprint, sample);
    drawWorkforcePage(doc, project.blueprint, sample);
    drawSpacePage(doc, project.blueprint, sample);
    drawCostPage(doc, project.blueprint, sample);
    drawConsumablesPage(doc, project.blueprint, sample);
    drawControlsPage(doc, project, sample);
    drawEvidencePage(doc, project, sample);
    drawSensitivityPage(doc, project, sample);
    drawActionPage(doc, project, sample);
    drawTracePage(doc, project.blueprint, sample);
    drawRegistersPage(doc, project.blueprint, sample);
    drawHandoverPage(doc, project, snapshot, sample);

    const range = doc.bufferedPageRange();
    const documentId = engagement.deliveryControl.documentId || `ATLAS-${project.id.toUpperCase()}`;
    for (let index = range.start; index < range.start + range.count; index += 1) {
      if (index === 0) continue;
      doc.switchToPage(index);
      pageFooter(doc, index + 1, range.count, documentId, sample);
    }
    doc.end();
  });
}

export function qualityLabIllustrativeSamplePdf(): Promise<Buffer> {
  const project = createQualityLabProject(defaultQualityLabInput, "qlp_public_sample");
  project.reviewRequestedAt = "2026-07-25T00:00:00.000Z";
  const engagement = createQualityLabEngagementPacket(project, "2026-07-25T00:00:00.000Z");
  engagement.deliveryControl.documentId = "LSA-SAMPLE-BP-001";
  engagement.deliveryControl.revision = "SAMPLE-2.0";
  engagement.deliveryControl.intendedUse = "Public illustration of the controlled Blueprint document system";
  engagement.deliveryControl.preparedByRole = "Illustrative Atlas project lead";
  const snapshot: QualityLabReviewedProjectSnapshot = {
    localProjectId: project.id,
    projectName: project.name,
    input: project.input,
    blueprint: project.blueprint,
    actionPlan: project.actionPlan,
    engagement,
    reviewRequestedAt: project.reviewRequestedAt,
  };
  return qualityLabBlueprintPdf(snapshot, { publicSample: true, issueDate: "2026-07-25" });
}
