export type LessonLevel = "Foundation" | "Intermediate" | "Director";

export interface KnowledgeCard {
  title: string;
  explanation: string;
  whyItMatters: string;
  commonMistake: string;
}

export interface DirectorLens {
  juniorView: string;
  supervisorView: string;
  directorView: string;
  regulatoryRisk: string;
  businessRisk: string;
  decisionPrinciple: string;
}

export interface CaseStudy {
  scenario: string;
  context: string;
  problem: string;
  analysisPath: string[];
  decision: string;
  lessonLearned: string;
}

export interface AuditQuestion {
  question: string;
  weakAnswer: string;
  strongAnswer: string;
  evidenceNeeded: string[];
}

export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  level: LessonLevel;
  estimatedMinutes: number;
  summary: string;
  learningGoals: string[];
  keyConcepts: KnowledgeCard[];
  directorLens: DirectorLens;
  caseStudy: CaseStudy;
  auditQuestions: AuditQuestion[];
  relatedTools: string[];
}
