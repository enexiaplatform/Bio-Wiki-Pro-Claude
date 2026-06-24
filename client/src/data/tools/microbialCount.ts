// Static calculation logic for the Microbial Count (CFU) Calculator.
// Converts colonies counted on a plate or membrane back to the concentration
// in the original sample:
//
//   CFU/mL = mean colonies x dilution factor / volume plated (mL)
//
// where the dilution factor is the reciprocal of the dilution tested
// (e.g. a 10^-2 dilution -> factor 100). Educational tool — follow your
// validated method and pharmacopeial counting rules (countable range, TNTC).

export type CountMethod = "pour" | "spread" | "membrane";

export interface CountMethodInfo {
  id: CountMethod;
  label: string;
  /** Default volume plated / filtered, mL. */
  defaultVolume: number;
  /** Show a per-100 mL figure (water / membrane filtration convention). */
  per100: boolean;
  note: string;
}

export const COUNT_METHODS: CountMethodInfo[] = [
  {
    id: "pour",
    label: "Pour plate",
    defaultVolume: 1,
    per100: false,
    note: "1 mL plated. Pharmacopeial countable range is typically 25–250 CFU per plate.",
  },
  {
    id: "spread",
    label: "Spread plate",
    defaultVolume: 0.1,
    per100: false,
    note: "0.1 mL spread. Countable range typically 25–250 CFU per plate.",
  },
  {
    id: "membrane",
    label: "Membrane filtration",
    defaultVolume: 100,
    per100: true,
    note: "Volume filtered through the membrane. Water results are usually reported per 100 mL.",
  },
];

// Tenfold dilutions: exponent n means a 10^-n dilution -> multiply by 10^n.
export const DILUTION_EXPONENTS = [0, 1, 2, 3, 4, 5, 6];

export interface CountInputs {
  method: CountMethod;
  colonies1: number;
  colonies2: number | null; // optional replicate plate, null = ignore
  dilutionExp: number; // n in 10^-n
  volume: number; // mL plated / filtered
}

export interface CountResult {
  meanColonies: number;
  factor: number; // 10^n
  cfuPerMl: number;
  cfuPer100: number;
  valid: boolean;
}

export function computeCount(i: CountInputs): CountResult {
  const hasReplicate = i.colonies2 != null && isFinite(i.colonies2) && i.colonies2 >= 0;
  const meanColonies = hasReplicate ? (i.colonies1 + (i.colonies2 as number)) / 2 : i.colonies1;
  const factor = Math.pow(10, i.dilutionExp);
  const valid = i.colonies1 >= 0 && i.volume > 0 && isFinite(meanColonies);
  const cfuPerMl = valid && i.volume > 0 ? (meanColonies * factor) / i.volume : 0;
  return { meanColonies, factor, cfuPerMl, cfuPer100: cfuPerMl * 100, valid };
}

/** Format a count for display: plain for small, scientific for large. */
export function fmtCount(n: number): string {
  if (!isFinite(n) || n < 0) return "—";
  if (n === 0) return "0";
  if (n < 1) return Number(n.toPrecision(2)).toString();
  if (n < 10000) return Math.round(n).toLocaleString();
  // Large counts read better in scientific notation, e.g. 1.5 x 10^4.
  const exp = Math.floor(Math.log10(n));
  const mant = n / Math.pow(10, exp);
  return `${Number(mant.toFixed(1))} x 10^${exp}`;
}

// Defaults double as a worked example: duplicate pour plates (142, 158 -> mean
// 150) at a 10^-2 dilution, 1 mL plated -> 150 x 100 / 1 = 15,000 CFU/mL.
export const DEFAULT_COUNT: CountInputs = {
  method: "pour",
  colonies1: 142,
  colonies2: 158,
  dilutionExp: 2,
  volume: 1,
};
