import { qualityLabInputSchema, type QualityLabInput } from "./quality-lab.js";
import {
  INTAKE_FIELDS,
  intakeConfirmationSchema,
  type IntakeCandidate,
  type IntakeConfirmation,
  type IntakeField,
  type IntakeSource,
} from "./quality-lab-intake-contract.js";

export { INTAKE_FIELDS };
type Cell = { locator: string; text: string; row: number; column: number };
const key = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, "");
const aliases: Record<string, IntakeField> = Object.create(null);
for (const [field, label] of Object.entries(INTAKE_FIELDS)) {
  aliases[key(field)] = field as IntakeField;
  aliases[key(label)] = field as IntakeField;
}
for (const [label, field] of Object.entries({
  "monthly batches": "finishedBatchesPerMonth",
  "batches per month": "finishedBatchesPerMonth",
  "finished products": "finishedProducts",
  "raw materials": "rawMaterials",
  markets: "markets",
  country: "country",
  "water points": "waterPoints",
}))
  aliases[key(label)] = field as IntakeField;

/** Values are reconstructed from the literal source cell; AI never supplies values. */
export function normalizeIntakeValue(
  field: IntakeField,
  raw: string,
): IntakeCandidate["value"] | undefined {
  const text = raw.trim();
  if (!text || /^[=+@]/.test(text)) return undefined;
  let value: unknown = text;
  if (field === "markets") {
    const marketAliases: Record<string, string> = {
      eu: "eu",
      "european union": "eu",
      vietnam: "vietnam",
      vn: "vietnam",
      asean: "asean",
      us: "us",
      usa: "us",
      "united states": "us",
      who: "who",
    };
    const tokens = text
      .toLowerCase()
      .split(/[;|,+]/)
      .map((t) => t.trim());
    if (tokens.some((t) => !Object.hasOwn(marketAliases, t))) return undefined;
    value = Array.from(new Set(tokens.map((t) => marketAliases[t])));
  } else if (field !== "projectName" && field !== "country") {
    // No guessed unit conversion, formulas, thousands separators, ranges or arithmetic.
    if (!/^-?\d+(?:\.\d+)?$/.test(text)) return undefined;
    value = Number(text);
  }
  const parsed = qualityLabInputSchema.shape[field].safeParse(value);
  return parsed.success ? (parsed.data as IntakeCandidate["value"]) : undefined;
}

export function candidatesFromMappings(
  cells: Cell[],
  mappings: { field: string; locator: string }[],
  file: Pick<IntakeSource, "fileName" | "fileSha256">,
  method: IntakeSource["method"],
): IntakeCandidate[] {
  const candidates: IntakeCandidate[] = [];
  for (const mapping of mappings) {
    if (!Object.hasOwn(INTAKE_FIELDS, mapping.field)) continue;
    const field = mapping.field as IntakeField;
    const cell = cells.find((c) => c.locator === mapping.locator);
    if (!cell) continue;
    const value = normalizeIntakeValue(field, cell.text);
    if (value === undefined) continue;
    const id = `${field}:${cell.locator}`;
    if (candidates.some((c) => c.id === id)) continue;
    const context = cells
      .filter((c) => c.row === cell.row)
      .map((c) => c.text)
      .join(" | ")
      .slice(0, 500);
    candidates.push({
      id,
      field,
      value,
      source: {
        ...file,
        section: "CSV",
        locator: cell.locator,
        text: cell.text,
        context,
        method,
        confidence:
          method === "csv-label-match/v1" ? "label-match" : "requires-review",
      },
    });
  }
  return candidates;
}

/** Two-column field/value rows and single-record header/value CSVs; no implicit aggregation. */
export function extractCsvCandidates(
  cells: Cell[],
  file: Pick<IntakeSource, "fileName" | "fileSha256">,
): IntakeCandidate[] {
  const mappings: { field: IntakeField; locator: string }[] = [];
  const dataRows = Array.from(new Set(cells.map((c) => c.row)));
  for (const cell of cells) {
    const field = aliases[key(cell.text)];
    if (!field) continue;
    const adjacent = cells.find(
      (c) => c.row === cell.row && c.column === cell.column + 1,
    );
    const below =
      dataRows.length === 2 && cell.row === dataRows[0]
        ? cells.find((c) => c.row === dataRows[1] && c.column === cell.column)
        : undefined;
    const valueCell =
      adjacent && !aliases[key(adjacent.text)] ? adjacent : below;
    if (valueCell) mappings.push({ field, locator: valueCell.locator });
  }
  return candidatesFromMappings(cells, mappings, file, "csv-label-match/v1");
}

export function confirmIntakeCandidate(
  candidate: IntakeCandidate,
  now = new Date().toISOString(),
): IntakeConfirmation {
  const value = normalizeIntakeValue(candidate.field, candidate.source.text);
  if (
    value === undefined ||
    JSON.stringify(value) !== JSON.stringify(candidate.value)
  )
    throw new Error("Candidate no longer matches its source cell");
  return intakeConfirmationSchema.parse({
    version: "quality-lab-intake-confirmation/v1",
    field: candidate.field,
    value,
    source: candidate.source,
    confirmedAt: now,
  });
}

/** Only explicitly confirmed records cross into canonical input. Missing fields stay unchanged. */
export function applyIntakeConfirmations(
  input: QualityLabInput,
  confirmations: IntakeConfirmation[],
): QualityLabInput {
  if (!confirmations.length)
    throw new Error("Confirm at least one candidate first");
  const next = { ...input };
  const fields = new Set<string>();
  for (const raw of confirmations) {
    const record = intakeConfirmationSchema.parse(raw);
    if (fields.has(record.field))
      throw new Error("Choose one source per input");
    fields.add(record.field);
    const value = normalizeIntakeValue(record.field, record.source.text);
    if (
      value === undefined ||
      JSON.stringify(value) !== JSON.stringify(record.value)
    )
      throw new Error("Confirmation does not match its source");
    Object.assign(next, { [record.field]: value });
  }
  next.intakeProvenance = confirmations;
  // A blank planner is intentionally incomplete, so validate individual fields here.
  // The complete existing input schema still gates model compilation.
  return next;
}
