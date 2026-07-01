// Static calculation logic for the System Suitability %RSD Calculator.
//
// Injection-precision (repeatability) is the everyday system-suitability gate in
// chromatographic QC: run replicate injections of a standard, then check the
// %RSD (relative standard deviation) of the response (peak area or height):
//
//   mean = Σx / n
//   s    = sqrt( Σ(x − mean)² / (n − 1) )      (sample SD, n − 1)
//   %RSD = 100 · s / mean
//
// USP <621> style acceptance: a %RSD limit AND a minimum number of replicate
// injections (commonly 5 for an assay). This tool checks both. Educational —
// always apply your own validated method's SST criteria.

export interface SSTInputs {
  /** Raw pasted replicate responses (peak areas / heights), any separator. */
  data: string;
  /** Acceptance limit for %RSD (e.g. 2.0 for a typical assay). */
  rsdLimit: number;
  /** Minimum number of replicate injections the method requires. */
  minReps: number;
}

export interface SSTResult {
  values: number[];
  n: number;
  mean: number;
  sd: number;
  rsd: number | null; // percent; null when mean is 0 or n < 2
  meetsCount: boolean;
  meetsRsd: boolean;
  pass: boolean;
  valid: boolean;
}

/** Parse pasted measurements (comma / space / semicolon / newline separated). */
export function parseData(text: string): number[] {
  return text
    .split(/[\s,;]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => Number(s))
    .filter((n) => isFinite(n));
}

export function mean(xs: number[]): number {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
}

/** Sample standard deviation (n − 1). */
export function sampleStdDev(xs: number[]): number {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  const ss = xs.reduce((a, b) => a + (b - m) ** 2, 0);
  return Math.sqrt(ss / (xs.length - 1));
}

export function computeSST(i: SSTInputs): SSTResult {
  const values = parseData(i.data);
  const n = values.length;
  const m = mean(values);
  const sd = sampleStdDev(values);
  const rsd = n >= 2 && m !== 0 ? (100 * sd) / m : null;

  const meetsCount = n >= i.minReps;
  const meetsRsd = rsd != null && i.rsdLimit > 0 ? rsd <= i.rsdLimit : false;
  const valid = n >= 2 && m !== 0;

  return {
    values,
    n,
    mean: m,
    sd,
    rsd,
    meetsCount,
    meetsRsd,
    pass: valid && meetsCount && meetsRsd,
    valid,
  };
}

export interface SSTBand {
  label: string;
  tone: "teal" | "amber" | "red";
}

export function bandForSST(r: SSTResult, limit: number): SSTBand {
  if (!r.valid) return { label: "Enter at least two replicate responses", tone: "amber" };
  if (!r.meetsCount) return { label: `Not enough injections — need at least the required minimum`, tone: "amber" };
  if (r.pass) return { label: `System suitability met — %RSD within ${limit}%`, tone: "teal" };
  return { label: `Fails — %RSD exceeds the ${limit}% limit`, tone: "red" };
}

/** Format a %RSD with a sensible number of decimals. */
export function fmtRsd(n: number | null): string {
  if (n == null || !isFinite(n)) return "—";
  return `${n.toFixed(2)}%`;
}

/** Format mean / SD compactly (large peak areas → thousands separators). */
export function fmtNum(n: number): string {
  if (!isFinite(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1000) return Math.round(n).toLocaleString();
  if (abs >= 1) return n.toFixed(2);
  return n.toPrecision(3);
}

// Defaults double as a worked example: five replicate peak areas with ~0.26%
// RSD — comfortably within a 2.0% assay limit and 5-injection requirement.
export const DEFAULT_SST: SSTInputs = {
  data: "1002340, 998210, 1005100, 999870, 1001450",
  rsdLimit: 2.0,
  minReps: 5,
};
