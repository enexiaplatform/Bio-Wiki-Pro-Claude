export interface ScenarioDecision {
  id: string;
  title: string;
  possibleCauses: string[];
  immediateActions: string[];
  investigationPath: string[];
  capaIdeas: string[];
  releaseImpact: string;
  auditConcern: string;
}

export interface CCSOptionSet {
  facilityTypes: string[];
  processTypes: string[];
  riskSources: string[];
  controlTypes: string[];
}

export interface CCSRecommendation {
  contaminationRiskMap: string[];
  suggestedControls: string[];
  evidenceToPrepare: string[];
  auditReadyExplanation: string;
}
