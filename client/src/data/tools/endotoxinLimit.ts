// Static calculation logic for the Bacterial Endotoxin Limit & MVD Calculator.
// Implements the compendial formulas (USP <85> / Ph. Eur. 2.6.14):
//   Endotoxin limit (EL) = K / M
//   Maximum Valid Dilution (MVD) = (EL x c) / lambda
// Educational tool — not a validated method, and not a substitute for the
// product monograph, your approved SOP, or QA judgement.

export interface RoutePreset {
  id: string;
  label: string;
  /** Threshold pyrogenic dose K, in EU per kg per hour. */
  k: number;
  note: string;
}

// K is the threshold pyrogenic dose per kg of body weight per hour.
export const ROUTE_PRESETS: RoutePreset[] = [
  {
    id: "parenteral",
    label: "Parenteral (IV / IM / SC)",
    k: 5,
    note: "K = 5 EU/kg — the default basis for most injectable products.",
  },
  {
    id: "intrathecal",
    label: "Intrathecal",
    k: 0.2,
    note: "K = 0.2 EU/kg — the stricter limit for intrathecal administration.",
  },
  {
    id: "radiopharma",
    label: "Radiopharmaceutical (per V)",
    k: 175,
    note: "K = 175 EU/V (per maximum dose volume V) for most radiopharmaceuticals — confirm against the specific monograph.",
  },
  {
    id: "custom",
    label: "Custom K",
    k: 5,
    note: "Enter the K value from your product monograph or regulatory basis.",
  },
];

export type DoseUnit = "mg" | "mL" | "Units";

export const DOSE_UNITS: DoseUnit[] = ["mg", "mL", "Units"];

// Common labelled gel-clot lysate sensitivities (EU/mL); kinetic methods use
// the lowest point of the standard curve instead.
export const COMMON_LAMBDAS = [0.5, 0.25, 0.125, 0.06, 0.03, 0.015];

export interface EndotoxinInputs {
  k: number; // threshold pyrogenic dose, EU/kg
  maxDose: number; // maximum human dose per hour, in `unit`
  bodyWeight: number; // kg
  unit: DoseUnit;
  lambda: number; // labelled lysate sensitivity, EU/mL
  sampleConc: number; // concentration the sample is tested at, unit/mL
}

export interface EndotoxinResult {
  m: number; // maximum dose per kg per hour, unit/kg
  el: number; // endotoxin limit, EU per `unit`
  mvd: number; // maximum valid dilution (dimensionless factor)
  valid: boolean;
}

export function computeEndotoxin(i: EndotoxinInputs): EndotoxinResult {
  const valid =
    i.k > 0 &&
    i.maxDose > 0 &&
    i.bodyWeight > 0 &&
    i.lambda > 0 &&
    i.sampleConc > 0;
  const m = i.bodyWeight > 0 ? i.maxDose / i.bodyWeight : 0;
  const el = m > 0 ? i.k / m : 0;
  const mvd = i.lambda > 0 ? (el * i.sampleConc) / i.lambda : 0;
  return { m, el, mvd, valid };
}

/** Format a positive number for display without trailing-zero noise. */
export function fmt(n: number): string {
  if (!isFinite(n) || n <= 0) return "—";
  if (n >= 100) return Math.round(n).toString();
  if (n >= 1) return Number(n.toFixed(2)).toString();
  return Number(n.toPrecision(3)).toString();
}

// Default inputs double as a runnable worked example:
// IV drug, max 700 mg/h over 70 kg => M = 10 mg/kg; lambda 0.25; tested at 10 mg/mL.
//   EL  = 5 / 10  = 0.5 EU/mg
//   MVD = (0.5 x 10) / 0.25 = 20
export const DEFAULT_INPUTS: EndotoxinInputs = {
  k: 5,
  maxDose: 700,
  bodyWeight: 70,
  unit: "mg",
  lambda: 0.25,
  sampleConc: 10,
};

export const WORKED_EXAMPLE_STEPS = [
  "M = maximum dose / body weight = 700 mg / 70 kg = 10 mg/kg",
  "EL = K / M = 5 / 10 = 0.5 EU/mg",
  "MVD = (EL x c) / lambda = (0.5 x 10) / 0.25 = 20",
  "Test the sample at any dilution up to 20x and the method can still detect the endotoxin limit.",
];
