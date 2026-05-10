import type { CCSOptionSet, CCSRecommendation } from "@/types/scenario";

export const ccsOptions: CCSOptionSet = {
  facilityTypes: ["Sterile fill-finish", "Biologics manufacturing", "QC microbiology lab", "Oral solid dose"],
  processTypes: ["Aseptic processing", "Terminal sterilization", "Bioburden-controlled process", "Utility support"],
  riskSources: ["People", "Materials", "Utilities", "Equipment", "Environment"],
  controlTypes: ["Prevention", "Detection", "Response", "Lifecycle review"],
};

export function buildCCSRecommendation(
  facilityType: string,
  processType: string,
  riskSource: string,
  controlType: string,
): CCSRecommendation {
  const highCriticality = facilityType.includes("Sterile") || processType.includes("Aseptic");
  const sourceFocus: Record<string, string> = {
    People: "gowning, interventions, aseptic behavior, and qualification drift",
    Materials: "ingress controls, surface disinfection, packaging shedding, and transfer routes",
    Utilities: "water, clean steam, compressed gases, biofilm, and point-of-use risk",
    Equipment: "cleanability, assembly, maintenance, hold time, and intervention frequency",
    Environment: "airflow, pressure cascade, cleaning, traffic, and room recovery",
  };

  return {
    contaminationRiskMap: [
      `${riskSource} risk is most likely expressed through ${sourceFocus[riskSource] ?? "process interfaces"}.`,
      `${processType} increases the need to connect controls to batch exposure and operational timing.`,
      highCriticality ? "Sterility assurance relevance is high; evidence should support batch impact decisions." : "Product impact may be indirect but still needs trend and control rationale.",
    ],
    suggestedControls: [
      `${controlType} control owner and escalation trigger`,
      "Routine trend review with defined adverse-trend criteria",
      "Documented linkage to SOPs, qualification, training, and deviation handling",
      highCriticality ? "Aseptic process simulation or intervention coverage review" : "Periodic effectiveness review through quality metrics",
    ],
    evidenceToPrepare: [
      "Risk assessment or CCS control matrix",
      "Recent trend data and deviation history",
      "Training or qualification records",
      "Change control and management review records",
    ],
    auditReadyExplanation: `For ${facilityType}, the CCS treats ${riskSource.toLowerCase()} as a defined contamination risk source. The control strategy combines ${controlType.toLowerCase()} controls with monitoring evidence, escalation rules, and lifecycle review so the site can explain both prevention and response.`,
  };
}
