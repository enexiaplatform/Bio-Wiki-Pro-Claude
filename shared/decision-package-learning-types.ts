import type { DecisionPackageId } from "./decision-packages";

export const DECISION_PACKAGE_LEARNING_CONTRACT_VERSION = "decision-package-learning/v2" as const;
export const DECISION_PACKAGE_LEARNING_REVIEW_PACKET_PATH = "docs/content-reviews/DECISION_PACKAGE_LEARNING_FLOWS_1_0_REVIEW_PACKET.md" as const;

export type EvidenceActivityKind = "evidence-review" | "study-design" | "data-analysis" | "challenge-session" | "transfer-simulation";

export interface DecisionPackageKnowledgeUnit {
  title: string;
  explanation: string;
  decisionUse: string;
}

export interface DecisionPackageWorkflowPhase {
  id: string;
  title: string;
  objective: string;
  activities: string[];
  evidenceToCapture: string[];
  decisionGate: string;
}

export interface DecisionPackageEvidenceActivity {
  title: string;
  kind: EvidenceActivityKind;
  decisionQuestion: string;
  approach: string[];
  expectedOutputs: string[];
  boundary: string;
}

export interface DecisionPackageKnowledgeCheck {
  question: string;
  expectedReasoning: string;
}

export interface DecisionPackagePracticeRound {
  title: string;
  event: string;
  tasks: string[];
  evidenceToRecord: string[];
  reviewGate: string;
}

export interface DecisionPackagePracticeLab {
  title: string;
  scenario: string;
  learnerRole: string;
  startingEvidence: string[];
  rounds: DecisionPackagePracticeRound[];
  expectedArtifacts: string[];
  debriefQuestions: string[];
  boundary: string;
}

export interface DecisionPackageLearningFlow {
  contractVersion: typeof DECISION_PACKAGE_LEARNING_CONTRACT_VERSION;
  reviewStatus: "specialist-review-required";
  reviewPacketPath: typeof DECISION_PACKAGE_LEARNING_REVIEW_PACKET_PATH;
  packageId: DecisionPackageId;
  learningObjectives: string[];
  knowledgeUnits: DecisionPackageKnowledgeUnit[];
  workflowPhases: DecisionPackageWorkflowPhase[];
  evidenceActivities: DecisionPackageEvidenceActivity[];
  knowledgeChecks: DecisionPackageKnowledgeCheck[];
  completionCriteria: string[];
  practiceLab: DecisionPackagePracticeLab;
}

export type LearningFlowDefinition = Omit<DecisionPackageLearningFlow, "contractVersion" | "reviewStatus" | "reviewPacketPath" | "practiceLab">;
export type DecisionPackageLearningFlowBase = Omit<DecisionPackageLearningFlow, "practiceLab">;

export const defineLearningFlow = (definition: LearningFlowDefinition): DecisionPackageLearningFlowBase => ({
  contractVersion: DECISION_PACKAGE_LEARNING_CONTRACT_VERSION,
  reviewStatus: "specialist-review-required",
  reviewPacketPath: DECISION_PACKAGE_LEARNING_REVIEW_PACKET_PATH,
  ...definition,
});
