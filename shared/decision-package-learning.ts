import { DECISION_PACKAGES, type DecisionPackageId } from "./decision-packages";
import { BIOPHARMA_DECISION_PACKAGE_LEARNING_FLOWS } from "./decision-package-learning/biopharma";
import { CROSS_CUTTING_DECISION_PACKAGE_LEARNING_FLOWS } from "./decision-package-learning/cross-cutting";
import { DRUG_PRODUCT_DECISION_PACKAGE_LEARNING_FLOWS } from "./decision-package-learning/drug-product";
import { PHARMA_API_DECISION_PACKAGE_LEARNING_FLOWS } from "./decision-package-learning/pharma-api";
import type { DecisionPackageLearningFlow } from "./decision-package-learning-types";

export * from "./decision-package-learning-types";

export const DECISION_PACKAGE_LEARNING_FLOWS: DecisionPackageLearningFlow[] = [
  ...BIOPHARMA_DECISION_PACKAGE_LEARNING_FLOWS,
  ...PHARMA_API_DECISION_PACKAGE_LEARNING_FLOWS,
  ...DRUG_PRODUCT_DECISION_PACKAGE_LEARNING_FLOWS,
  ...CROSS_CUTTING_DECISION_PACKAGE_LEARNING_FLOWS,
];

export function getDecisionPackageLearningFlow(packageId: string) {
  return DECISION_PACKAGE_LEARNING_FLOWS.find((flow) => flow.packageId === packageId);
}

export function validateDecisionPackageLearningFlows(flows = DECISION_PACKAGE_LEARNING_FLOWS): string[] {
  const errors: string[] = [];
  const packageIds = new Set<DecisionPackageId>(DECISION_PACKAGES.map((item) => item.id));
  const seen = new Set<string>();
  for (const flow of flows) {
    if (seen.has(flow.packageId)) errors.push(`duplicate learning flow: ${flow.packageId}`);
    seen.add(flow.packageId);
    if (!packageIds.has(flow.packageId)) errors.push(`unknown learning-flow package: ${flow.packageId}`);
    if (flow.reviewStatus !== "specialist-review-required") errors.push(`${flow.packageId}: learning flow must remain specialist-review-required`);
    if (!flow.reviewPacketPath.startsWith("docs/content-reviews/")) errors.push(`${flow.packageId}: learning-flow review packet must be repository-backed`);
    if (flow.learningObjectives.some((objective) => !objective.trim())) errors.push(`${flow.packageId}: learning objectives must not be empty`);
    if (flow.learningObjectives.length < 3) errors.push(`${flow.packageId}: at least three learning objectives are required`);
    if (flow.knowledgeUnits.length < 3) errors.push(`${flow.packageId}: at least three knowledge units are required`);
    if (flow.knowledgeUnits.some((unit) => !unit.title.trim() || !unit.explanation.trim() || !unit.decisionUse.trim())) errors.push(`${flow.packageId}: knowledge units must be complete`);
    if (flow.workflowPhases.length < 5) errors.push(`${flow.packageId}: at least five workflow phases are required`);
    if (new Set(flow.workflowPhases.map((phase) => phase.id)).size !== flow.workflowPhases.length) errors.push(`${flow.packageId}: workflow phase IDs must be unique`);
    if (flow.workflowPhases.some((phase) => phase.activities.length < 3 || phase.evidenceToCapture.length < 3 || !phase.decisionGate.trim())) errors.push(`${flow.packageId}: every workflow phase requires three activities, three evidence items and a decision gate`);
    if (flow.evidenceActivities.length < 3) errors.push(`${flow.packageId}: at least three evidence activities are required`);
    if (flow.evidenceActivities.some((activity) => activity.approach.length < 3 || activity.expectedOutputs.length < 3 || !activity.boundary.trim())) errors.push(`${flow.packageId}: every evidence activity requires approach, outputs and boundary`);
    if (flow.knowledgeChecks.length < 3 || flow.knowledgeChecks.some((check) => !check.question.trim() || !check.expectedReasoning.trim())) errors.push(`${flow.packageId}: at least three complete knowledge checks are required`);
    if (flow.completionCriteria.length < 4) errors.push(`${flow.packageId}: at least four completion criteria are required`);
  }
  packageIds.forEach((packageId) => {
    if (!seen.has(packageId)) errors.push(`missing learning flow: ${packageId}`);
  });
  return errors;
}
