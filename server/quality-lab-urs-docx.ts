import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  PageNumber,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from "docx";
import { createQualityLabCommercialHandoff } from "../shared/quality-lab-commercial-handoff.js";
import { qualityLabProjectFromReviewedSnapshot, type QualityLabReviewedProjectSnapshot } from "../shared/quality-lab-persistence.js";

const PAGE_WIDTH = 12240;
const PAGE_HEIGHT = 15840;
const CONTENT_WIDTH = 9360;
const NAVY = "0B2545";
const TEAL = "0F766E";
const BLUE = "2E74B5";
const MUTED = "526579";
const LINE = "D9E2EA";
const LIGHT = "F2F4F7";
const AMBER = "7A5A00";
const RED = "9B1C1C";

const noBorders = { top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" } };

function text(value: string, options: { bold?: boolean; color?: string; size?: number; italics?: boolean } = {}) {
  return new TextRun({ text: value, font: "Calibri", size: options.size ?? 22, bold: options.bold, color: options.color ?? "243142", italics: options.italics });
}

function labeledParagraph(label: string, value: string, color = "243142") {
  return new Paragraph({ spacing: { after: 120, line: 264 }, children: [text(`${label}: `, { bold: true, color: NAVY }), text(value, { color })] });
}

function bullet(value: string) {
  return new Paragraph({ numbering: { reference: "urs-bullets", level: 0 }, spacing: { after: 120, line: 280 }, children: [text(value)] });
}

function metadataTable(rows: Array<[string, string]>) {
  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    borders: noBorders,
    columnWidths: [2700, 6660],
    rows: rows.map(([label, value]) => new TableRow({ cantSplit: true, children: [
      new TableCell({ width: { size: 2700, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, shading: { type: ShadingType.CLEAR, fill: LIGHT }, verticalAlign: VerticalAlign.CENTER, children: [new Paragraph({ children: [text(label, { bold: true, color: NAVY, size: 20 })] })] }),
      new TableCell({ width: { size: 6660, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, verticalAlign: VerticalAlign.CENTER, children: [new Paragraph({ children: [text(value, { size: 20 })] })] }),
    ] })),
  });
}

function traceabilityTable(requirement: ReturnType<typeof createQualityLabCommercialHandoff>["requirements"][number]) {
  const rows: Array<[string, string]> = [
    ["Requirement ID", requirement.requirementId],
    ["Method requirement IDs", requirement.relatedMethodRequirementIds.join(" | ") || "No direct method link recorded"],
    ["Rule references", requirement.ruleRefs.map((item) => `${item.id}@${item.version}`).join(" | ")],
    ["Evidence references", requirement.evidenceRefs.map((item) => `${item.id}@${item.version}`).join(" | ")],
    ["Decision Lineage IDs", requirement.decisionLineageIds.join(" | ")],
    ["Unresolved input IDs", requirement.unresolvedInputIds.join(" | ") || "None"],
  ];
  return metadataTable(rows);
}

export async function qualityLabUrsDocument(snapshot: QualityLabReviewedProjectSnapshot): Promise<Buffer> {
  if (!snapshot.engagement) throw new Error("A review engagement packet is required before URS export");
  const project = qualityLabProjectFromReviewedSnapshot(snapshot);
  const handoff = createQualityLabCommercialHandoff(project, snapshot.engagement);
  const children: Array<Paragraph | Table> = [
    new Paragraph({ spacing: { before: 0, after: 80 }, children: [text("ATLAS QUALITY LAB", { bold: true, color: TEAL, size: 20 })] }),
    new Paragraph({ style: "DocumentTitle", children: [text("Vendor-neutral User Requirement Specification", { bold: true, color: NAVY, size: 46 })] }),
    new Paragraph({ style: "Subtitle", children: [text(`${snapshot.projectName} - controlled drafting basis`, { color: MUTED, size: 28 })] }),
    metadataTable([
      ["Document ID", handoff.documentControl.documentId],
      ["Revision", handoff.documentControl.revision],
      ["Status", handoff.status.replaceAll("-", " ")],
      ["Intended use", handoff.documentControl.intendedUse],
      ["Project revision", handoff.project.revisionReference],
      ["Contract", `${handoff.ursDocumentVersion} from ${handoff.handoffVersion}`],
      ["Generated", handoff.generatedAt],
    ]),
    new Paragraph({ spacing: { before: 240, after: 120 }, shading: { type: ShadingType.CLEAR, fill: "FFF8E8" }, children: [text("CONTROLLED-USE BOUNDARY", { bold: true, color: AMBER, size: 20 }), text(`  ${handoff.controls.notice}`, { color: "594A16", size: 20 })] }),
    new Paragraph({ heading: HeadingLevel.HEADING_1, children: [text("1. Purpose and control boundary", { bold: true, color: BLUE, size: 32 })] }),
    labeledParagraph("Purpose", "Provide a traceable, vendor-neutral basis for qualified URS drafting and comparable supplier responses."),
    labeledParagraph("Not authorized", "This document does not approve engineering, validation, procurement, supplier selection, product equivalence or a purchase quantity.", RED),
    labeledParagraph("Source versions", `${handoff.sourceVersions.inputContract}; ${handoff.sourceVersions.outputContract}; ${handoff.sourceVersions.compilerCore}; ${handoff.sourceVersions.blueprintEngine}; ${handoff.sourceVersions.domainPack}`),
    new Paragraph({ heading: HeadingLevel.HEADING_1, children: [text("2. Handoff readiness", { bold: true, color: BLUE, size: 32 })] }),
    labeledParagraph("Current status", handoff.status.replaceAll("-", " "), handoff.status === "ready-for-qualified-review" ? TEAL : AMBER),
    labeledParagraph("Requirement count", `${handoff.requirements.length}`),
    labeledParagraph("Open blockers", `${handoff.blockers.length}`),
  ];

  if (handoff.blockers.length > 0) {
    children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [text("Blocking evidence before controlled issue", { bold: true, color: RED, size: 26 })] }));
    handoff.blockers.forEach((item) => children.push(bullet(item)));
  }

  children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [text("3. User requirements", { bold: true, color: BLUE, size: 32 })] }));
  handoff.requirements.forEach((requirement) => {
    children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [text(`${requirement.requirementId} - ${requirement.equipmentName}`, { bold: true, color: NAVY, size: 26 })] }));
    children.push(labeledParagraph("Category", requirement.equipmentCategory));
    children.push(labeledParagraph("Requirement status", requirement.handoffStatus.replaceAll("-", " "), requirement.handoffStatus === "blocked" ? RED : TEAL));
    children.push(labeledParagraph("Intended use", requirement.intendedUse));
    children.push(labeledParagraph("Quantity basis", `${requirement.quantityBasis.current} current / ${requirement.quantityBasis.planningHorizon} planning horizon - concept allowance only`));
    children.push(new Paragraph({ heading: HeadingLevel.HEADING_3, children: [text("Functional requirements", { bold: true, color: NAVY, size: 24 })] }));
    requirement.functionalRequirements.forEach((item) => children.push(bullet(item)));
    children.push(new Paragraph({ heading: HeadingLevel.HEADING_3, children: [text("Performance and capacity requirements", { bold: true, color: NAVY, size: 24 })] }));
    requirement.performanceRequirements.forEach((item) => children.push(bullet(item)));
    children.push(new Paragraph({ heading: HeadingLevel.HEADING_3, children: [text("Utilities and interfaces", { bold: true, color: NAVY, size: 24 })] }));
    requirement.utilitiesAndInterfaces.forEach((item) => children.push(bullet(item)));
    children.push(labeledParagraph("Qualification impact", requirement.qualificationImpact));
    children.push(new Paragraph({ heading: HeadingLevel.HEADING_3, children: [text("Supplier evidence requested", { bold: true, color: NAVY, size: 24 })] }));
    requirement.supplierEvidenceRequested.forEach((item) => children.push(bullet(item)));
    children.push(new Paragraph({ heading: HeadingLevel.HEADING_3, children: [text("Explicit exclusions", { bold: true, color: NAVY, size: 24 })] }));
    requirement.exclusions.forEach((item) => children.push(bullet(item)));
    children.push(new Paragraph({ heading: HeadingLevel.HEADING_3, pageBreakBefore: true, children: [text("Traceability", { bold: true, color: NAVY, size: 24 })] }));
    children.push(traceabilityTable(requirement));
  });

  children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: true, children: [text("4. Supplier response instructions", { bold: true, color: BLUE, size: 32 })] }));
  [
    "Respond against every stable requirement ID using comply, deviation, clarification-required or not-offered.",
    "A comply declaration must cite the offered configuration and supporting technical evidence; silence is not compliance.",
    "Identify every assumption, exclusion, dependency, utility, interface, lead time and lifecycle-service boundary.",
    "Do not rewrite the user need into a proprietary feature description. Record alternatives and deviations explicitly.",
    "Commercial comparison remains separate from technical declarations. The companion workbook provides no automatic score, rank or award recommendation.",
  ].forEach((item) => children.push(bullet(item)));

  const doc = new Document({
    creator: "Life Science Atlas",
    title: `${snapshot.projectName} - Vendor-neutral URS drafting basis`,
    description: handoff.controls.notice,
    styles: {
      default: { document: { run: { font: "Calibri", size: 22, color: "243142" }, paragraph: { spacing: { after: 120, line: 264 } } } },
      paragraphStyles: [
        { id: "DocumentTitle", name: "Document Title", basedOn: "Normal", next: "Subtitle", quickFormat: true, run: { font: "Calibri", size: 46, bold: true, color: NAVY }, paragraph: { spacing: { before: 0, after: 80 } } },
        { id: "Subtitle", name: "Subtitle", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: "Calibri", size: 28, color: MUTED }, paragraph: { spacing: { before: 0, after: 320 } } },
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: "Calibri", size: 32, bold: true, color: BLUE }, paragraph: { spacing: { before: 320, after: 160 }, keepNext: true } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: "Calibri", size: 26, bold: true, color: BLUE }, paragraph: { spacing: { before: 240, after: 120 }, keepNext: true } },
        { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: "Calibri", size: 24, bold: true, color: NAVY }, paragraph: { spacing: { before: 160, after: 80 }, keepNext: true } },
      ],
    },
    numbering: { config: [{ reference: "urs-bullets", levels: [{ level: 0, format: "bullet", text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 }, spacing: { after: 120, line: 280 } } } }] }] },
    sections: [{
      properties: { page: { size: { width: PAGE_WIDTH, height: PAGE_HEIGHT }, margin: { top: 1440, right: 1440, bottom: 1800, left: 1440, header: 708, footer: 708 } } },
      headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [text(`${handoff.documentControl.documentId} | ${handoff.documentControl.revision} | working control`, { color: MUTED, size: 18 })] })] }) },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [text("Life Science Atlas | Page ", { color: MUTED, size: 18 }), new TextRun({ children: [PageNumber.CURRENT], font: "Calibri", size: 18, color: MUTED })] })] }) },
      children,
    }],
  });
  return Packer.toBuffer(doc);
}
