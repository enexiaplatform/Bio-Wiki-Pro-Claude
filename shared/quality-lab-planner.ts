import type { QualityLabInput } from "./quality-lab.js";

export interface QualityLabPlannerIssue {
  id: string;
  message: string;
}

/** Validates every required input in the current planner step in one pass. */
export function qualityLabPlannerStepIssues(input: QualityLabInput, step: number): QualityLabPlannerIssue[] {
  const issues: QualityLabPlannerIssue[] = [];
  if (step === 0) {
    if (input.projectName.trim().length < 2) issues.push({ id: "projectName", message: "Give this project a clear name." });
    if (input.primaryDecision.trim().length < 10) issues.push({ id: "primaryDecision", message: "Describe the decision this Blueprint must help resolve." });
    if (input.country.trim().length < 2) issues.push({ id: "country", message: "Add the facility country." });
    if (input.markets.length === 0) issues.push({ id: "markets", message: "Select at least one target market." });
  }
  if (step === 1) {
    const demand = input.finishedBatchesPerMonth + input.rawMaterialLotsPerMonth + input.waterPoints + input.emLocations + input.sterilityBatchesPerMonth + input.endotoxinSamplesPerMonth + input.bioburdenSamplesPerMonth;
    if (demand <= 0) issues.push({ id: "testing-demand", message: "Add at least one source of monthly testing demand." });
  }
  if (step === 2 && !Object.values(input.scope).some(Boolean)) issues.push({ id: "capability-scope", message: "Select at least one in-house capability." });
  return issues;
}
