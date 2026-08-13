export const QUALITY_LAB_TRUST_CORRIDOR_VERSION = "quality-lab-trust-corridor/v1" as const;

export type QualityLabTrustCorridorRole =
  | "scope"
  | "method"
  | "workload"
  | "capacity"
  | "evidence"
  | "governance";

export interface QualityLabTrustCorridorItem {
  id: `academy/${string}` | `blog/${string}`;
  role: QualityLabTrustCorridorRole;
  decisionUse: string;
}

/**
 * The bounded public evidence corridor for the first non-sterile microbiology
 * wedge. Items outside this list can stay accessible, but must not be used to
 * substantiate the flagship journey until they complete their own quality gate.
 */
export const QUALITY_LAB_TRUST_CORRIDOR: QualityLabTrustCorridorItem[] = [
  { id: "blog/how-to-scope-nonsterile-microbiology-qc-lab", role: "scope", decisionUse: "Define the first-wedge project boundary before design or procurement freeze." },
  { id: "academy/bioburden-usp-61", role: "method", decisionUse: "Frame enumeration and microbial-limits applicability questions." },
  { id: "academy/method-suitability-nonsterile-products", role: "method", decisionUse: "Identify recovery, inhibition and neutralization evidence needed before method use." },
  { id: "academy/objectionable-organisms", role: "method", decisionUse: "Separate specified-organism tests from product-specific objectionability assessment." },
  { id: "academy/growth-promotion-testing", role: "method", decisionUse: "Frame media growth-promotion and release-control evidence." },
  { id: "academy/pharmaceutical-water-systems", role: "method", decisionUse: "Define water-system monitoring questions and microbiology application boundaries." },
  { id: "academy/environmental-monitoring-basics", role: "method", decisionUse: "Define risk-based EM program inputs without asserting site approval." },
  { id: "academy/microbial-identification", role: "method", decisionUse: "Define isolate-identification depth and evidence ownership." },
  { id: "blog/quality-lab-demand-to-capacity-decision", role: "workload", decisionUse: "Translate portfolio demand into challengeable workflow demand." },
  { id: "blog/microbiology-qc-lab-capacity-modelling", role: "capacity", decisionUse: "Explain bounded resource and capacity planning logic." },
  { id: "blog/microbiology-incubator-capacity-and-plate-day-planning", role: "capacity", decisionUse: "Frame plate-day, usable-position and calendar evidence before incubator sizing." },
  { id: "blog/microbiology-autoclave-load-and-cycle-capacity-planning", role: "capacity", decisionUse: "Frame load-family, cycle-occupancy and utility evidence before autoclave sizing." },
  { id: "blog/microbiology-analyst-qualification-and-skill-coverage-planning", role: "capacity", decisionUse: "Frame task-level qualification and shift-coverage evidence before staffing approval." },
  { id: "blog/from-method-bom-to-resilient-qc-consumable-supply", role: "capacity", decisionUse: "Translate method demand into bounded supply and continuity planning." },
  { id: "academy/steam-sterilization-validation", role: "evidence", decisionUse: "Identify qualification and cycle evidence without supplying a validated cycle." },
  { id: "academy/water-system-validation", role: "evidence", decisionUse: "Frame lifecycle qualification evidence for a pharmaceutical water system." },
  { id: "academy/microbial-excursion-investigation", role: "governance", decisionUse: "Structure microbial excursion hypotheses, impact evidence and escalation." },
  { id: "academy/oos-investigation-deep-dive", role: "governance", decisionUse: "Structure OOS evidence and disposition boundaries." },
  { id: "academy/data-integrity-deep-dive", role: "governance", decisionUse: "Keep data-lifecycle risks and evidence limitations visible." },
  { id: "academy/supplier-qualification", role: "governance", decisionUse: "Frame retained responsibility, supplier evidence and re-evaluation triggers." },
];

export const QUALITY_LAB_TRUST_CORRIDOR_IDS = new Set(QUALITY_LAB_TRUST_CORRIDOR.map((item) => item.id));

export function isQualityLabTrustCorridorItem(collection: string, slug: string): boolean {
  return QUALITY_LAB_TRUST_CORRIDOR_IDS.has(`${collection}/${slug}` as QualityLabTrustCorridorItem["id"]);
}
