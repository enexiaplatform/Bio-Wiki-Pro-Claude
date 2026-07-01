// Static calculation logic for the Dilution & Standard Prep Calculator.
//
// Two everyday lab modes:
//
// 1. Dilute a stock (C1·V1 = C2·V2): how much stock and diluent to make a
//    target concentration at a target final volume.
//        V1 (stock)   = C2 · V2 / C1
//        diluent      = V2 − V1
//        dilution×    = C1 / C2
//
// 2. Serial dilution: repeated fold-dilutions from a starting concentration.
//        Cn = C0 / factor^n
//
// The math is unit-agnostic as long as the two concentrations share a unit and
// the volumes share a unit — the unit labels are for display only. Educational;
// prepare standards per your validated method.

export interface DilutionInputs {
  c1: number; // stock concentration
  c2: number; // target concentration
  v2: number; // target final volume
}

export interface DilutionResult {
  v1: number | null; // volume of stock to take
  diluent: number | null; // volume of diluent to add
  factor: number | null; // dilution factor (C1/C2)
  valid: boolean;
  /** True when the target exceeds the stock — you cannot dilute UP. */
  targetTooHigh: boolean;
}

export function computeDilution(i: DilutionInputs): DilutionResult {
  const positive = i.c1 > 0 && i.c2 > 0 && i.v2 > 0;
  const targetTooHigh = positive && i.c2 > i.c1;
  const valid = positive && !targetTooHigh;
  if (!valid) {
    return { v1: null, diluent: null, factor: positive ? i.c1 / i.c2 : null, valid: false, targetTooHigh };
  }
  const v1 = (i.c2 * i.v2) / i.c1;
  return { v1, diluent: i.v2 - v1, factor: i.c1 / i.c2, valid: true, targetTooHigh: false };
}

export interface SerialInputs {
  start: number; // starting concentration
  factor: number; // fold dilution per step (e.g. 10 for 1:10)
  steps: number; // number of dilution steps
}

export interface SerialStep {
  tube: number;
  concentration: number;
  label: string; // e.g. "1:100"
}

export function computeSerial(i: SerialInputs): SerialStep[] {
  if (!(i.start > 0) || !(i.factor > 1) || !(i.steps > 0)) return [];
  const n = Math.min(Math.floor(i.steps), 20); // guard against runaway input
  const out: SerialStep[] = [];
  for (let step = 1; step <= n; step++) {
    const cumulative = i.factor ** step;
    out.push({
      tube: step,
      concentration: i.start / cumulative,
      label: `1:${cumulative.toLocaleString()}`,
    });
  }
  return out;
}

/** Format a volume/concentration with sensible precision. */
export function fmtVal(n: number | null): string {
  if (n == null || !isFinite(n)) return "—";
  const abs = Math.abs(n);
  if (abs !== 0 && abs < 0.001) return n.toExponential(2);
  if (abs >= 1000) return Math.round(n).toLocaleString();
  if (Number.isInteger(n)) return n.toString();
  return Number(n.toPrecision(4)).toString();
}

export const CONC_UNITS = ["mg/mL", "µg/mL", "M", "mM", "% w/v"] as const;
export const VOL_UNITS = ["mL", "µL", "L"] as const;

// Defaults double as a worked example: dilute a 100 mg/mL stock to 10 mg/mL in
// 10 mL → take 1 mL stock + 9 mL diluent (10× dilution).
export const DEFAULT_DILUTION: DilutionInputs = {
  c1: 100,
  c2: 10,
  v2: 10,
};

export const DEFAULT_SERIAL: SerialInputs = {
  start: 100,
  factor: 10,
  steps: 5,
};
