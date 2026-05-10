import type { AuditQuestion } from "./lesson";

export interface ComplianceTopic {
  id: string;
  title: string;
  focus: string;
  whyItMatters: string;
  evidenceExamples: string[];
}

export interface ComplianceQuestion extends AuditQuestion {
  id: string;
  topic: string;
}
