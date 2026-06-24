// Static calculation logic for the Process Capability Calculator.
// Computes Cp / Cpu / Cpl / Cpk from spec limits + process mean + standard
// deviation, plus the estimated out-of-spec rate (PPM) under a normal model.
//
//   Cp  = (USL - LSL) / (6s)
//   Cpu = (USL - mean) / (3s)
//   Cpl = (mean - LSL) / (3s)
//   Cpk = min(Cpu, Cpl)
//
// Educational tool — capability indices assume a stable, normally distributed
// process. Confirm normality and statistical control before relying on them.

export type SpecType = "two" | "upper" | "lower";

export interface CapabilityInputs {
  specType: SpecType;
  usl: number;
  lsl: number;
  mean: number;
  sd: number;
}

export interface CapabilityResult {
  cp: number | null;
  cpu: number | null;
  cpl: number | null;
  cpk: number | null;
  ppm: number | null; // estimated out-of-spec parts per million
  valid: boolean;
}

/** Standard normal CDF via an Abramowitz & Stegun erf approximation. */
export function normalCdf(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989422804014327 * Math.exp((-z * z) / 2);
  const p =
    d *
    t *
    (0.319381530 +
      t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return z >= 0 ? 1 - p : p;
}

export function computeCapability(i: CapabilityInputs): CapabilityResult {
  const twoSided = i.specType === "two";
  const useUpper = i.specType === "two" || i.specType === "upper";
  const useLower = i.specType === "two" || i.specType === "lower";

  const valid =
    i.sd > 0 &&
    (!useUpper || isFinite(i.usl)) &&
    (!useLower || isFinite(i.lsl)) &&
    (!twoSided || i.usl > i.lsl);

  if (!valid) return { cp: null, cpu: null, cpl: null, cpk: null, ppm: null, valid: false };

  const cp = twoSided ? (i.usl - i.lsl) / (6 * i.sd) : null;
  const cpu = useUpper ? (i.usl - i.mean) / (3 * i.sd) : null;
  const cpl = useLower ? (i.mean - i.lsl) / (3 * i.sd) : null;

  const sides = [cpu, cpl].filter((v): v is number => v != null);
  const cpk = sides.length ? Math.min(...sides) : null;

  // Estimated fraction outside the spec(s) under a normal model.
  const tailUpper = useUpper ? 1 - normalCdf((i.usl - i.mean) / i.sd) : 0;
  const tailLower = useLower ? normalCdf((i.lsl - i.mean) / i.sd) : 0;
  const ppm = (tailUpper + tailLower) * 1e6;

  return { cp, cpu, cpl, cpk, ppm, valid: true };
}

export interface CapabilityBand {
  label: string;
  tone: "teal" | "amber" | "red";
}

export function bandForCpk(cpk: number | null): CapabilityBand {
  if (cpk == null) return { label: "—", tone: "amber" };
  if (cpk >= 2.0) return { label: "World-class (≈6σ)", tone: "teal" };
  if (cpk >= 1.67) return { label: "Highly capable (≈5σ)", tone: "teal" };
  if (cpk >= 1.33) return { label: "Capable — meets the common minimum", tone: "teal" };
  if (cpk >= 1.0) return { label: "Marginal — tighten the process", tone: "amber" };
  return { label: "Not capable", tone: "red" };
}

/** Parse pasted measurements (comma / space / newline separated). */
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

/** Sample standard deviation (n - 1). */
export function sampleStdDev(xs: number[]): number {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  const ss = xs.reduce((a, b) => a + (b - m) ** 2, 0);
  return Math.sqrt(ss / (xs.length - 1));
}

export function fmtIndex(n: number | null): string {
  if (n == null || !isFinite(n)) return "—";
  return n.toFixed(2);
}

export function fmtPpm(n: number | null): string {
  if (n == null || !isFinite(n)) return "—";
  if (n < 1) return "< 1";
  if (n >= 1000) return Math.round(n).toLocaleString();
  return Math.round(n).toString();
}

// Defaults double as a worked example: centred process, Cp = Cpk = 1.33, ~63 PPM.
export const DEFAULT_CAPABILITY: CapabilityInputs = {
  specType: "two",
  usl: 110,
  lsl: 90,
  mean: 100,
  sd: 2.5,
};
