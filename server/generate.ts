// On-the-fly binary generation for deliverables: a real .xlsx (with working
// formulas) for the gap analysis, and .pdf rendering of the markdown guides.
// Keeps the repo source as MD/CSV but ships customers real Office/PDF files.
import * as XLSX from "xlsx";
import PDFDocument from "pdfkit";

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
