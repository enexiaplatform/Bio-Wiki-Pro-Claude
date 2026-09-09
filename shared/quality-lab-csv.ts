export interface QualityLabCsvCell {
  locator: string;
  text: string;
  row: number;
  column: number;
}

export interface QualityLabCsv {
  cells: QualityLabCsvCell[];
  rows: number;
  columns: number;
}

function columnLabel(column: number): string {
  let label = "";
  while (column > 0) {
    column -= 1;
    label = String.fromCharCode(65 + (column % 26)) + label;
    column = Math.floor(column / 26);
  }
  return label;
}

/** Parse a bounded comma CSV as inert data. Callers must review/map values separately. */
export function parseQualityLabCsv(text: string): QualityLabCsv {
  // Check UTF-16 length first so encoding a hostile oversized string cannot allocate
  // a second unbounded buffer. UTF-8 is never shorter than its UTF-16 code units.
  if (
    text.length > 256_000 ||
    new TextEncoder().encode(text).byteLength > 256_000
  ) {
    throw new Error("CSV must be at most 256,000 UTF-8 bytes.");
  }
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/.test(text)) {
    throw new Error("CSV contains unsupported control characters.");
  }
  // A browser string with lone surrogates has no lossless UTF-8 representation.
  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = text.charCodeAt(i + 1);
      if (!(next >= 0xdc00 && next <= 0xdfff))
        throw new Error("CSV contains invalid Unicode text.");
      i += 1;
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      throw new Error("CSV contains invalid Unicode text.");
    }
  }
  const source = text.startsWith("\uFEFF") ? text.slice(1) : text;
  const result: QualityLabCsv = { cells: [], rows: 0, columns: 0 };
  if (!source.length) return result;

  let row = 1;
  let column = 1;
  let value = "";
  let state: "start" | "unquoted" | "quoted" | "closed" = "start";
  let endedRow = false;

  function append(character: string) {
    value += character;
    if (value.length > 500)
      throw new Error("CSV cell text must be at most 500 characters.");
  }
  function finishCell() {
    if (row > 500) throw new Error("CSV must contain at most 500 rows.");
    if (column > 40) throw new Error("CSV must contain at most 40 columns.");
    if (value.length) {
      if (result.cells.length >= 2_000)
        throw new Error("CSV must contain at most 2,000 nonempty cells.");
      result.cells.push({
        locator: `${columnLabel(column)}${row}`,
        text: value,
        row,
        column,
      });
    }
    result.rows = row;
    result.columns = Math.max(result.columns, column);
    value = "";
    state = "start";
  }

  for (let i = 0; i < source.length; i += 1) {
    const character = source[i];
    endedRow = false;
    if (state === "quoted") {
      if (character === '"') {
        if (source[i + 1] === '"') {
          append('"');
          i += 1;
        } else state = "closed";
      } else append(character);
      continue;
    }
    if (character === ",") {
      finishCell();
      column += 1;
    } else if (character === "\n" || character === "\r") {
      if (character === "\r") {
        if (source[i + 1] !== "\n")
          throw new Error("CSV line endings must use LF or CRLF.");
        i += 1;
      }
      finishCell();
      row += 1;
      column = 1;
      endedRow = true;
    } else if (character === '"' && state === "start") {
      state = "quoted";
    } else if (character === '"' || state === "closed") {
      throw new Error("CSV contains malformed quoted cells.");
    } else if (character === "\t" || character === ";") {
      throw new Error(
        "Use comma-separated CSV; quote any tabs or semicolons within cell text.",
      );
    } else {
      state = "unquoted";
      append(character);
    }
  }
  if (state === "quoted")
    throw new Error("CSV contains an unclosed quoted cell.");
  if (!endedRow) finishCell();
  return result;
}
