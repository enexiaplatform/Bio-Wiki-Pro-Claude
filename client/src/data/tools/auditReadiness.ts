// Static decision-logic data for the GMP Audit Readiness Scorecard tool.
// Each criterion is scored Yes (2) / Partial (1) / No (0); the tool computes a
// readiness % over the criteria assessed and surfaces the gaps with a fix hint.
// Educational self-assessment only — not an audit, certification, or QA approval.

export interface AuditCriterion {
  id: string;
  category: string;
  label: string;
  /** Shown as the next action when the criterion is not fully met. */
  fix: string;
}

export const auditCriteria: AuditCriterion[] = [
  // Quality Systems
  { id: "qms-1", category: "Quality Systems", label: "Quality manual and SOPs are current, approved, and version-controlled", fix: "Check SOP review dates and retire superseded versions from point-of-use." },
  { id: "qms-2", category: "Quality Systems", label: "Deviations are recorded, risk-classified, and closed within defined timelines", fix: "Triage open deviations by risk and escalate overdue ones." },
  { id: "qms-3", category: "Quality Systems", label: "Change control assesses validation and regulatory impact before implementation", fix: "Confirm no change was implemented ahead of QA approval." },

  // CAPA & Investigations
  { id: "capa-1", category: "CAPA & Investigations", label: "CAPAs address true root cause (not just 'retraining') with effectiveness checks", fix: "Re-open recurring CAPAs and add an effectiveness verification step." },
  { id: "capa-2", category: "CAPA & Investigations", label: "OOS investigations follow a phased procedure with QA-owned disposition", fix: "Verify no failing result was invalidated without an assignable cause." },

  // Documentation & Data Integrity
  { id: "di-1", category: "Documentation & Data Integrity", label: "Records meet ALCOA+ — attributable, contemporaneous, original, accurate", fix: "Run a data-integrity self-check on your key systems." },
  { id: "di-2", category: "Documentation & Data Integrity", label: "Audit trails are enabled, reviewed, and protected; no shared logins", fix: "Move to unique accounts and add audit-trail review to data review." },
  { id: "di-3", category: "Documentation & Data Integrity", label: "Batch records are complete with good documentation practice and no unexplained entries", fix: "Review recent batch records for blanks and uncontrolled corrections." },

  // Production & Controls
  { id: "prod-1", category: "Production & Controls", label: "Equipment is qualified (IQ/OQ/PQ) and the qualified state is maintained", fix: "Check calibration and preventive-maintenance due-dates on critical instruments." },
  { id: "prod-2", category: "Production & Controls", label: "Processes are validated with continued process verification in routine use", fix: "Confirm CPV/trending is active, not a one-off validation report." },
  { id: "prod-3", category: "Production & Controls", label: "Cleaning validation uses health-based (HBEL) limits with validated recovery", fix: "Replace any legacy 10-ppm/0.1% limits with HBEL-derived MACO." },

  // Microbiology & Environment
  { id: "micro-1", category: "Microbiology & Environment", label: "Environmental monitoring is risk-based with trending and excursion response", fix: "Review EM trends and confirm excursions were investigated." },
  { id: "micro-2", category: "Microbiology & Environment", label: "Media and reagents are growth-promotion tested and within expiry", fix: "Verify GPT records and media expiry on the current lots." },

  // Suppliers & Training
  { id: "sup-1", category: "Suppliers & Training", label: "Critical-material suppliers are qualified with current quality agreements", fix: "Check the approved-supplier list and quality-agreement dates." },
  { id: "train-1", category: "Suppliers & Training", label: "Personnel are trained and qualified for their GMP tasks, with current records", fix: "Reconcile the training matrix against current roles and tasks." },
];

export type Answer = "yes" | "partial" | "no";

export const ANSWER_POINTS: Record<Answer, number> = { yes: 2, partial: 1, no: 0 };

export interface ReadinessBand {
  min: number; // inclusive lower bound of the %
  label: string;
  tone: "red" | "amber" | "teal";
  summary: string;
}

// Bands are ordered high→low; pick the first whose `min` the score meets.
export const readinessBands: ReadinessBand[] = [
  { min: 80, label: "Audit-ready", tone: "teal", summary: "Strong footing. Close the remaining gaps and keep evidence current." },
  { min: 50, label: "Developing", tone: "amber", summary: "Foundations exist but key gaps remain. Prioritize the items below before an audit." },
  { min: 0, label: "Critical gaps", tone: "red", summary: "Significant exposure. Address the high-priority gaps before inviting an inspection." },
];

export function bandForScore(pct: number): ReadinessBand {
  return readinessBands.find((b) => pct >= b.min) ?? readinessBands[readinessBands.length - 1];
}
