export type InvestigationTemplateSection =
  | "eventSummary"
  | "immediateContainment"
  | "sampleIntegrityCheck"
  | "labErrorAssessment"
  | "processFacilityAssessment"
  | "organismSignificance"
  | "rootCauseHypothesis"
  | "capa"
  | "effectivenessCheck";

export interface InvestigationTemplate {
  id: string;
  title: string;
  trigger: string;
  sections: Record<InvestigationTemplateSection, string[]>;
}

export interface InvestigationNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}
