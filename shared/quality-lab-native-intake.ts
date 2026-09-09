import { INTAKE_FIELDS, intakeSourceSchema, type IntakeCandidate, type IntakeField, type IntakeSource } from "./quality-lab-intake-contract.js";
import { normalizeIntakeValue, intakeFieldForLabel } from "./quality-lab-intake.js";

export interface NativeIntakeUnit {
  id: string; section: string; locator: string; text: string;
  row: number; column: number; columnSpan?:number; rawText?: string; numberFormat?: string;
}
export type NativeFormat = "xlsx" | "pdf" | "docx";

function literal(field: IntakeField, unit: { text: string; rawText?: string; numberFormat?: string }) {
  let text = unit.text.trim();
  if (field !== "markets" && field !== "projectName" && field !== "country") {
    // Explicit display units only; no arithmetic, extrapolation or date conversion.
    const suffixes: Partial<Record<IntakeField, RegExp>> = {
      finishedBatchesPerMonth: /\s*batches\s*(?:\/|per)\s*month$/i,
      rawMaterialLotsPerMonth: /\s*lots\s*(?:\/|per)\s*month$/i,
      mediaLotsPerMonth: /\s*lots\s*(?:\/|per)\s*month$/i,
      targetTurnaroundDays: /\s*days$/i, workingDaysPerMonth: /\s*days(?:\s*(?:\/|per)\s*month)?$/i,
      horizonYears: /\s*years$/i, productiveHoursPerShift: /\s*hours(?:\s*(?:\/|per)\s*shift)?$/i,
      shifts: /\s*shifts(?:\s*(?:\/|per)\s*day)?$/i, waterPoints: /\s*points$/i,
      emLocations: /\s*locations$/i, finishedProducts: /\s*products$/i,
      waterRoundsPerWeek: /\s*rounds\s*(?:\/|per)\s*week$/i,
      emRoundsPerWeek: /\s*rounds\s*(?:\/|per)\s*week$/i,
      growthRatePercent: /\s*%$/, outsourcePercent: /\s*%$/, redundancyPercent: /\s*%$/,
    };
    if (suffixes[field]) text = text.replace(suffixes[field]!, "").trim();
    if (/^-?\d{1,3}(?:,\d{3})+(?:\.\d+)?$/.test(text)) text = text.replaceAll(",", "");
  }
  return normalizeIntakeValue(field, text);
}

export function reconstructNativeValue(field: IntakeField, source: IntakeSource): IntakeCandidate["value"] | undefined {
  const parsed = intakeSourceSchema.safeParse(source);
  if (!parsed.success || !parsed.data.nativeBasis) return undefined;
  const basis = parsed.data.nativeBasis;
  if (basis.operation === "literal") return basis.units.length === 1 ? literal(field, basis.units[0]) : undefined;
  if (basis.operation === "unique-markets" && field === "markets") {
    const values = basis.units.map(unit => literal(field, unit));
    if (values.some(value => !Array.isArray(value))) return undefined;
    return normalizeIntakeValue(field, Array.from(new Set(values.flat() as string[])).join(","));
  }
  if (basis.operation === "distinct-products" && field === "finishedProducts") {
    if (basis.units.some(unit => /^[=+@]/.test(unit.text))) return undefined;
    return normalizeIntakeValue(field, String(new Set(basis.units.map(unit => unit.text.trim().toLowerCase())).size));
  }
  return undefined;
}

function makeCandidate(field: IntakeField, units: NativeIntakeUnit[], file: Pick<IntakeSource, "fileName" | "fileSha256">, format: NativeFormat, operation: "literal" | "unique-markets" | "distinct-products", context: string, ai = false): IntakeCandidate | undefined {
  if (!units.length || units.length > 500 || units.some(unit => unit.text.length > 500)) return;
  if (field === "growthRatePercent" && /\b(annual|annually|cagr|yearly|per year)\b/i.test(context)) return;
  if (field === "redundancyPercent" && /\b(equipment|incubator|autoclave|n\+1)\b/i.test(context)) return;
  const source: IntakeSource = { ...file, section: units[0].section,
    locator: units.length === 1 ? units[0].locator : `${units[0].locator}…${units.at(-1)!.locator}`,
    text: units.length === 1 ? units[0].text : `${units.length} contributing source values`,
    context: context.slice(0, 500), method: ai ? "ai-native-field-map/v1" : "native-project-facts/v1",
    confidence: operation === "literal" && !ai ? "label-match" : "requires-review",
    nativeBasis: { version: "quality-lab-native-basis/v1", format, operation,
      units: units.map(({ id, text, rawText, numberFormat }) => ({ locator: id, text, ...(rawText !== undefined ? {rawText} : {}), ...(numberFormat ? {numberFormat} : {}) })) } };
  const value = reconstructNativeValue(field, source);
  return value === undefined ? undefined : { id: `${field}:${units[0].id}:${operation}`, field, value, source };
}

export function nativeCandidatesFromMappings(units: NativeIntakeUnit[], mappings: {field: string; locator: string}[], file: Pick<IntakeSource,"fileName"|"fileSha256">, format: NativeFormat): IntakeCandidate[] {
  return mappings.flatMap(mapping => {
    if (!Object.hasOwn(INTAKE_FIELDS, mapping.field)) return [];
    const unit = units.find(item => item.id === mapping.locator);
    if (!unit) return [];
    const context = units.filter(item => item.section === unit.section && (item.row === unit.row || item.column === unit.column && item.row < unit.row)).map(item => item.text).join(" | ");
    // A mapped document passage may contain a label and a literal, but the AI
    // supplies only a locator. Never accept a generated replacement value.
    const passage = format !== "xlsx" ? unit.text.match(/^(.{2,90}?)\s*[:=]\s*(.+)$/) : null;
    const valueUnit = passage ? {...unit,text:passage[2],rawText:unit.text} : unit;
    const candidate = makeCandidate(mapping.field as IntakeField,[valueUnit],file,format,"literal",context,true);
    return candidate ? [candidate] : [];
  });
}

export function extractNativeCandidates(units: NativeIntakeUnit[], file: Pick<IntakeSource,"fileName"|"fileSha256">, format: NativeFormat): IntakeCandidate[] {
  const candidates: IntakeCandidate[] = [];
  const add = (candidate: IntakeCandidate | undefined) => { if (candidate && !candidates.some(item => item.id === candidate.id)) candidates.push(candidate); };
  for (const unit of units) {
    const field = intakeFieldForLabel(unit.text);
    const productHeader = /^(?:product(?: name| code| id)?|sku(?: code| id)?)$/i.test(unit.text.trim());
    if (field || productHeader) {
      const siblings = units.filter(item => item.section === unit.section);
      const right = siblings.find(item => item.row === unit.row && item.column === unit.column + (unit.columnSpan??1));
      const below = siblings.filter(item => item.column === unit.column && item.row > unit.row);
      const context = siblings.filter(item => item.row === unit.row).map(item => item.text).join(" | ");
      const adjacentCandidate = field && right && !intakeFieldForLabel(right.text) ? makeCandidate(field,[right],file,format,"literal",context) : undefined;
      if(adjacentCandidate) { add(adjacentCandidate); continue; }
      // An explicit column heading plus source rows supports a bounded candidate,
      // never a silent portfolio total. Unknown market values withhold aggregation.
      if (field === "markets" && below.length > 0) add(makeCandidate(field,below,file,format,"unique-markets",context));
      else if (productHeader && below.length > 0) add(makeCandidate("finishedProducts",below,file,format,"distinct-products",`${context}. Count distinct listed product identifiers; confirm that these rows cover the intended portfolio.`));
      else if (field && below.length <= 100) for(const value of below) {
        add(makeCandidate(field,[value],file,format,"literal",`${context} | ${siblings.filter(item=>item.row===value.row).map(item=>item.text).join(" | ")}`));
      }
    }
    // Project briefs: one explicit label/value fact per paragraph or PDF line.
    const match = unit.text.match(/^(.{2,90}?)(?:\s*[:=]\s*|\s{2,})(.+)$/);
    if (match) {
      const field = intakeFieldForLabel(match[1]);
      if (field) add(makeCandidate(field,[{...unit,text:match[2],rawText:unit.text}],file,format,"literal",unit.text));
    }
  }
  if(candidates.length>200)throw new Error("More than 200 candidate facts were found. Upload a smaller project table to review completely.");
  return candidates;
}
