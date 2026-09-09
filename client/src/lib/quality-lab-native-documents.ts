import type { NativeIntakeUnit } from "@shared/quality-lab-native-intake";
import { inspectNativeArchive } from "./quality-lab-native-archive";

const MAX_BYTES = 8 * 1024 * 1024;
const MAX_TEXT = 100_000;
const MAX_UNITS = 2_000;
const MAX_UNIT_TEXT = 500;
const WORD_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
const STRICT_WORD_NS = "http://purl.oclc.org/ooxml/wordprocessingml/main";

function collector() {
  const units: NativeIntakeUnit[] = [];
  let characters = 0;
  return {
    units,
    add(unit: NativeIntakeUnit) {
      const text = unit.text.replace(/\s+/g, " ").trim();
      if (!text) return;
      if (text.length > MAX_UNIT_TEXT) {
        throw new Error("A source passage exceeds 500 characters. Export a shorter project-fact table or CSV; passages are never silently truncated.");
      }
      characters += text.length;
      if (characters > MAX_TEXT || units.length >= MAX_UNITS) {
        throw new Error("This document exceeds the 100,000-character or 2,000-source-unit limit. Upload a smaller project-fact extract.");
      }
      units.push({ ...unit, text });
    },
  };
}

function parseXml(text: string): XMLDocument {
  if (/<!\s*(?:DOCTYPE|ENTITY)\b/i.test(text)) throw new Error("Document XML contains unsupported declarations.");
  const document = new DOMParser().parseFromString(text, "application/xml");
  if (document.getElementsByTagName("parsererror").length || document.getElementsByTagNameNS("*", "parsererror").length) {
    throw new Error("The document contains malformed XML. Export a new DOCX or CSV.");
  }
  return document;
}

function isWord(element: Element, localName: string) {
  return element.localName === localName && (element.namespaceURI === WORD_NS || element.namespaceURI === STRICT_WORD_NS);
}

function wordChildren(element: Element, localName: string) {
  return Array.from(element.children).filter(child => isWord(child, localName));
}

function wordAttribute(element: Element, name: string) {
  return element.getAttributeNS(WORD_NS, name) ?? element.getAttributeNS(STRICT_WORD_NS, name);
}

function hasActiveFlag(element: Element, name: string) {
  return Array.from(element.getElementsByTagNameNS("*", name)).some(flag =>
    isWord(flag, name) && !["0", "false", "off"].includes(wordAttribute(flag, "val") ?? "true"));
}

/** Only visible body text is extracted. No HTML, fields, embedded objects or relationships are executed. */
function visibleText(element: Element): string {
  if (isWord(element, "del") || isWord(element, "moveFrom")) return "";
  if (isWord(element, "r") && wordChildren(element, "rPr").some(properties => hasActiveFlag(properties, "vanish") || hasActiveFlag(properties, "webHidden"))) return "";
  if (isWord(element, "t")) return element.textContent ?? "";
  if (["tab", "br", "cr"].some(name => isWord(element, name))) return " ";
  if (isWord(element, "drawing") || isWord(element, "object") || isWord(element, "pict")) return "";
  return Array.from(element.children).map(visibleText).join(isWord(element, "tc") ? " " : "");
}

async function parseDocx(buffer: ArrayBuffer) {
  await inspectNativeArchive(buffer);
  const { default: JSZip } = await import("jszip");
  const archive = await JSZip.loadAsync(buffer);
  if (Object.keys(archive.files).some(name => /(?:vbaProject\.bin|activeX\/|embeddings\/)/i.test(name))) {
    throw new Error("Documents with macros or embedded executable content are unsupported. Export a plain DOCX or CSV.");
  }
  for (const name of Object.keys(archive.files).filter(name => name.endsWith(".rels"))) {
    const relationships = parseXml(await archive.files[name].async("string"));
    if (Array.from(relationships.getElementsByTagNameNS("*", "Relationship")).some(item => item.getAttribute("TargetMode")?.toLowerCase() === "external")) {
      throw new Error("This DOCX contains external relationships. Remove external links or export the project facts as CSV.");
    }
  }
  const part = archive.file("word/document.xml");
  if (!part) throw new Error("This file is not a readable DOCX document.");
  const document = parseXml(await part.async("string"));
  const body = Array.from(document.getElementsByTagNameNS("*", "body")).find(element => isWord(element, "body"));
  if (!body) throw new Error("This DOCX has no readable document body.");
  const output = collector();
  let section = "Document body";
  let paragraphNumber = 0;
  let tableNumber = 0;
  for (const block of Array.from(body.children)) {
    if (isWord(block, "p")) {
      paragraphNumber += 1;
      const text = visibleText(block).replace(/\s+/g, " ").trim();
      const style = Array.from(block.getElementsByTagNameNS("*", "pStyle")).find(element => isWord(element, "pStyle"));
      if (style && /^(?:heading|title)/i.test(wordAttribute(style, "val") ?? "") && text) section = text.slice(0, 120);
      output.add({ id: `docx:p${paragraphNumber}`, section, locator: `paragraph ${paragraphNumber}`, text, row: paragraphNumber, column: 1 });
    } else if (isWord(block, "tbl")) {
      tableNumber += 1;
      for (const [rowIndex, row] of Array.from(wordChildren(block, "tr").entries())) {
        for (const [columnIndex, cell] of Array.from(wordChildren(row, "tc").entries())) {
          output.add({ id: `docx:t${tableNumber}:r${rowIndex + 1}:c${columnIndex + 1}`, section: `${section} · Table ${tableNumber}`,
            locator: `table ${tableNumber}, row ${rowIndex + 1}, cell ${columnIndex + 1}`, text: visibleText(cell), row: rowIndex + 1, column: columnIndex + 1 });
        }
      }
    }
  }
  if (!output.units.length) throw new Error("No visible body text was found. Export a text-based project-fact table or CSV.");
  return { units: output.units, notices: ["Only visible document-body paragraphs and tables were read. Comments, headers, footers, drawings, deleted and hidden text were excluded; merged table cells retain their source cell positions."] };
}

async function parsePdf(buffer: ArrayBuffer) {
  const [pdfjs, worker] = await Promise.all([import("pdfjs-dist"), import("pdfjs-dist/build/pdf.worker.min.mjs?url")]);
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  const task = pdfjs.getDocument({ data: new Uint8Array(buffer), disableFontFace: true, useSystemFonts: false,
    stopAtErrors: true, maxImageSize: 1, useWasm: false });
  const output = collector();
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const work = async () => {
    const document = await task.promise;
    if (document.numPages > 40) throw new Error("PDF intake supports at most 40 pages. Upload the relevant project-fact pages.");
    const emptyPages: number[] = [];
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent();
      if (content.items.length > 20000) throw new Error("PDF page contains too many text fragments. Upload a smaller project-fact extract.");
      const lines: { y: number; items: { x: number; text: string }[] }[] = [];
      for (const item of content.items) {
        if (!("str" in item) || !item.str.trim()) continue;
        const x = item.transform[4];
        const y = item.transform[5];
        if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
        let line = lines.find(candidate => Math.abs(candidate.y - y) < 2);
        if (!line) { line = { y, items: [] }; lines.push(line); }
        line.items.push({ x, text: item.str });
        if (lines.length > MAX_UNITS) throw new Error("PDF contains too many source lines. Upload a smaller project-fact extract.");
      }
      lines.sort((a, b) => b.y - a.y);
      if (!lines.length) emptyPages.push(pageNumber);
      for (const [index, line] of Array.from(lines.entries())) {
        const locator = `p${pageNumber}:line${index + 1}`;
        output.add({ id: `pdf:${locator}`, section: `Page ${pageNumber}`, locator, row: index + 1, column: 1,
          text: line.items.sort((a, b) => a.x - b.x).map(item => item.text).join(" ") });
      }
      page.cleanup();
    }
    if (!output.units.length) throw new Error("This PDF has no extractable text and may be scanned. OCR is not supported; export text or CSV first.");
    return { units: output.units, notices: ["PDF text was grouped by page and line position. Check reading order and table context before confirming any value; PDF labels do not establish applicability.",
      ...(emptyPages.length ? [`No extractable text on page(s) ${emptyPages.join(", ")}; images and scanned content were not read.`] : [])] };
  };
  try {
    return await Promise.race([work(), new Promise<never>((_, reject) => {
      timeout = setTimeout(() => reject(new Error("PDF extraction exceeded 15 seconds. Upload fewer project-fact pages.")), 15_000);
    })]);
  } catch (error) {
    if (error instanceof Error && error.name === "PasswordException") throw new Error("Password-protected PDFs are unsupported. Export an unprotected project-fact extract.");
    throw error;
  } finally {
    clearTimeout(timeout);
    await task.destroy();
  }
}

export async function parseNativeDocument(buffer: ArrayBuffer, fileName: string): Promise<{ units: NativeIntakeUnit[]; notices: string[] }> {
  if (!buffer.byteLength || buffer.byteLength > MAX_BYTES) throw new Error("Upload a non-empty document no larger than 8 MB.");
  if (/\.docx$/i.test(fileName)) return parseDocx(buffer);
  if (/\.pdf$/i.test(fileName)) return parsePdf(buffer);
  throw new Error("Document intake supports PDF and DOCX files.");
}
