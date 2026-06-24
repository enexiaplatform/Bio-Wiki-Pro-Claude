// Static calculation logic for the Cleaning Validation MACO Calculator.
// Computes the Maximum Allowable Carryover by the three common criteria and
// picks the most stringent (lowest), then derives surface and swab limits.
//
//   Dose-based : MACO = (TDD_prev x MBS) / (SF x MDD_next)
//   HBEL-based : MACO = (PDE x MBS) / MDD_next
//   10 ppm     : MACO = 10 mg/kg x MBS(kg)
//
// Educational tool — not a validated method, and not a substitute for your
// cleaning validation protocol, toxicological assessment, or QA approval.

export interface CleaningInputs {
  tddPrev: number; // smallest therapeutic daily dose of the previous product, mg/day
  pde: number; // health-based exposure limit (PDE/ADE) of the previous product, mg/day (0 = skip)
  mddNext: number; // maximum daily dose of the next product, mg/day
  mbsKg: number; // minimum batch size of the next product, kg
  sf: number; // safety factor for the dose-based criterion
  // Optional sampling parameters (0 = skip surface/swab output):
  totalAreaCm2: number; // total shared product-contact surface area, cm^2
  swabAreaCm2: number; // area swabbed per swab, cm^2
  recoveryPct: number; // validated swab recovery, %
}

export interface CleaningCriterion {
  id: string;
  label: string;
  maco: number; // mg
  available: boolean;
  formula: string;
}

export interface CleaningResult {
  criteria: CleaningCriterion[];
  selected: CleaningCriterion | null; // most stringent (lowest) available MACO
  surfaceLimitUgCm2: number | null; // µg/cm^2
  swabLimitUgPerSwab: number | null; // µg/swab, recovery-corrected
}

export function computeCleaning(i: CleaningInputs): CleaningResult {
  const mbsMg = i.mbsKg > 0 ? i.mbsKg * 1e6 : 0;

  const dose: CleaningCriterion = {
    id: "dose",
    label: "Dose-based",
    available: i.tddPrev > 0 && i.mddNext > 0 && mbsMg > 0 && i.sf > 0,
    maco: i.mddNext > 0 && i.sf > 0 ? (i.tddPrev * mbsMg) / (i.sf * i.mddNext) : 0,
    formula: "(TDD x MBS) / (SF x MDD)",
  };
  const hbel: CleaningCriterion = {
    id: "hbel",
    label: "HBEL (PDE/ADE)",
    available: i.pde > 0 && i.mddNext > 0 && mbsMg > 0,
    maco: i.mddNext > 0 ? (i.pde * mbsMg) / i.mddNext : 0,
    formula: "(PDE x MBS) / MDD",
  };
  const ppm: CleaningCriterion = {
    id: "ppm",
    label: "10 ppm",
    available: i.mbsKg > 0,
    maco: i.mbsKg * 10, // 10 mg per kg of next-product batch
    formula: "10 mg/kg x MBS(kg)",
  };

  const criteria = [dose, hbel, ppm];
  const valid = criteria.filter((c) => c.available && c.maco > 0);
  const selected =
    valid.length > 0 ? valid.reduce((a, b) => (b.maco < a.maco ? b : a)) : null;

  let surfaceLimitUgCm2: number | null = null;
  let swabLimitUgPerSwab: number | null = null;
  if (selected && i.totalAreaCm2 > 0) {
    // MACO in mg over total area in cm^2 -> mg/cm^2, then x1000 for µg/cm^2.
    surfaceLimitUgCm2 = (selected.maco / i.totalAreaCm2) * 1000;
    if (i.swabAreaCm2 > 0 && i.recoveryPct > 0) {
      swabLimitUgPerSwab =
        (surfaceLimitUgCm2 * i.swabAreaCm2) / (i.recoveryPct / 100);
    }
  }

  return { criteria, selected, surfaceLimitUgCm2, swabLimitUgPerSwab };
}

/** Format a positive number for display without trailing-zero noise. */
export function fmtNum(n: number | null): string {
  if (n == null || !isFinite(n) || n <= 0) return "—";
  if (n >= 1000) return Math.round(n).toLocaleString();
  if (n >= 1) return Number(n.toFixed(2)).toString();
  return Number(n.toPrecision(3)).toString();
}

// Defaults double as a runnable worked example with a potent contaminant, so
// the health-based limit ends up most stringent (the modern best practice).
export const DEFAULT_CLEANING: CleaningInputs = {
  tddPrev: 5,
  pde: 0.002,
  mddNext: 500,
  mbsKg: 50,
  sf: 1000,
  totalAreaCm2: 25000,
  swabAreaCm2: 25,
  recoveryPct: 80,
};

export const CLEANING_EXAMPLE_STEPS = [
  "Dose-based: (5 x 50,000,000) / (1000 x 500) = 500 mg",
  "HBEL: (0.002 x 50,000,000) / 500 = 200 mg",
  "10 ppm: 10 x 50 = 500 mg",
  "Most stringent = HBEL, 200 mg. Surface limit = 200 mg / 25,000 cm² = 8 µg/cm².",
  "Swab limit (80% recovery) = 8 x 25 / 0.80 = 250 µg per swab.",
];
