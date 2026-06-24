// Static calculation logic for the F0 Sterilization Lethality Calculator.
// For moist-heat sterilization, the instantaneous lethal rate and the
// equivalent time at the reference temperature are:
//
//   L  = 10^((T - Tref) / z)            (lethal rate, dimensionless)
//   F0 = t x L                          (equivalent minutes at Tref)
//
// with the standard reference Tref = 121.1 C and z = 10 C. Educational tool —
// a constant-temperature equivalent; the validated cycle and its delivered F0
// (integrated from probe data) govern the real process.

export interface F0Inputs {
  temp: number; // holding temperature, C
  time: number; // holding time at temperature, minutes
  z: number; // z-value, C
  refTemp: number; // reference temperature, C
}

export interface F0Result {
  lethalRate: number; // L
  f0: number; // equivalent minutes at refTemp
  valid: boolean;
}

export function computeF0(i: F0Inputs): F0Result {
  const valid = i.time > 0 && i.z > 0;
  const lethalRate = i.z > 0 ? Math.pow(10, (i.temp - i.refTemp) / i.z) : 0;
  const f0 = i.time * lethalRate;
  return { lethalRate, f0, valid };
}

export interface F0Band {
  label: string;
  tone: "teal" | "amber";
}

// Informational only — the required F0 is set by your validated cycle, not a
// universal threshold.
export function bandForF0(f0: number): F0Band {
  if (f0 >= 15) return { label: "≥ 15 min — overkill-level lethality", tone: "teal" };
  if (f0 >= 8) return { label: "8–15 min — typical terminal sterilization range", tone: "teal" };
  return { label: "below 8 min — verify against your validated cycle", tone: "amber" };
}

export function fmtF0(n: number): string {
  if (!isFinite(n) || n < 0) return "—";
  if (n === 0) return "0";
  if (n >= 100) return Math.round(n).toLocaleString();
  if (n >= 1) return Number(n.toFixed(1)).toString();
  return Number(n.toPrecision(2)).toString();
}

// Defaults double as a worked example: 121.1 C for 15 min at z = 10 -> L = 1,
// F0 = 15 min (the textbook reference point).
export const DEFAULT_F0: F0Inputs = {
  temp: 121.1,
  time: 15,
  z: 10,
  refTemp: 121.1,
};
