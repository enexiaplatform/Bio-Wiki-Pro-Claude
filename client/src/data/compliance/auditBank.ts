import { microbiologyLessons } from "@/data/lessons/microbiologyLessons";
import type { ComplianceQuestion, ComplianceTopic } from "@/types/compliance";

export const complianceTopics: ComplianceTopic[] = [
  {
    id: "annex-1",
    title: "Annex 1 Microbiology Intelligence",
    focus: "Holistic sterile manufacturing contamination control.",
    whyItMatters: "Annex 1 expects sites to connect process, facility, people, monitoring, and CCS evidence.",
    evidenceExamples: ["CCS", "APS reports", "EM trends", "Deviation and CAPA review"],
  },
  {
    id: "ccs",
    title: "Contamination Control Strategy",
    focus: "Risk source mapping, control effectiveness, and lifecycle review.",
    whyItMatters: "A CCS must be more than a document; it must explain how contamination risk is controlled.",
    evidenceExamples: ["Control matrix", "Management review", "Change controls", "Effectiveness checks"],
  },
  {
    id: "em",
    title: "Environmental Monitoring",
    focus: "Trend intelligence, organism significance, and batch impact.",
    whyItMatters: "EM is a signal system for cleanroom behavior and aseptic control.",
    evidenceExamples: ["Viable trends", "Non-viable trends", "Organism IDs", "Excursion investigations"],
  },
  {
    id: "aseptic-processing",
    title: "Aseptic Processing",
    focus: "Interventions, personnel behavior, airflow protection, and APS coverage.",
    whyItMatters: "Aseptic process weakness can challenge sterility even when final tests pass.",
    evidenceExamples: ["Batch records", "Intervention matrix", "Gowning qualification", "APS design"],
  },
  {
    id: "sterility-assurance",
    title: "Sterility Assurance",
    focus: "Control-system evidence supporting sterile product release.",
    whyItMatters: "Sterility assurance is built across validated process control, not final testing alone.",
    evidenceExamples: ["Sterilization validation", "APS", "EM review", "Sterility investigation procedure"],
  },
];

export const auditQuestionBank: ComplianceQuestion[] = microbiologyLessons.flatMap((lesson) =>
  lesson.auditQuestions.map((question, index) => ({
    ...question,
    id: `${lesson.id}-audit-${index + 1}`,
    topic: lesson.category,
  })),
);
