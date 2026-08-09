export type ConnectedApplicationKind = "workflow" | "tool" | "lesson" | "toolkit";

export interface ConnectedApplicationRef {
  kind: ConnectedApplicationKind;
  slug: string;
}

export interface WorkflowSystemStage {
  id: string;
  title: string;
  summary: string;
  applications: ConnectedApplicationRef[];
}

export interface WorkflowSystem {
  id: string;
  shortTitle: string;
  title: string;
  description: string;
  audience: string;
  boundary: string;
  stages: WorkflowSystemStage[];
}

const app = (kind: ConnectedApplicationKind, slug: string): ConnectedApplicationRef => ({ kind, slug });

export const workflowSystems: WorkflowSystem[] = [
  {
    id: "biopharma",
    shortTitle: "Biopharma",
    title: "Biopharma product & process quality system",
    description: "Follow the product and evidence chain from cell substrate and materials through manufacturing, analytical control, validation, release, and transfer.",
    audience: "Biopharma development, MSAT, manufacturing, QC, QA, validation, and regulatory CMC",
    boundary: "This is an Atlas navigation model, not a site process description or a claim of universal sequence, method applicability, or regulatory approval.",
    stages: [
      {
        id: "cell-source-materials",
        title: "Cell source & materials",
        summary: "Connect the host, construct, bank, raw materials, and single-use configuration to their controlled evidence.",
        applications: [
          app("workflow", "biopharma-control-strategy"),
          app("toolkit", "biopharma-cell-substrate-control"),
          app("toolkit", "biopharma-materials-control"),
          app("lesson", "biopharma-cell-line-cell-bank-genetic-stability"),
          app("lesson", "biopharma-raw-ancillary-materials-control"),
        ],
      },
      {
        id: "upstream",
        title: "Upstream control",
        summary: "Link cell-culture inputs and process performance to product-quality impact and lifecycle triggers.",
        applications: [
          app("toolkit", "biopharma-upstream-control"),
          app("lesson", "biopharma-upstream-process-control"),
          app("workflow", "process-validation"),
          app("tool", "process-capability-calculator"),
        ],
      },
      {
        id: "downstream",
        title: "Downstream clearance",
        summary: "Trace purification, process impurities, viral safety, recovery, and orthogonal clearance evidence.",
        applications: [
          app("workflow", "host-cell-protein-testing-workflow"),
          app("workflow", "viral-safety-testing-workflow"),
          app("toolkit", "biopharma-downstream-clearance"),
          app("lesson", "biopharma-downstream-purification-clearance"),
          app("tool", "hcp-testing-readiness-planner"),
          app("tool", "viral-safety-readiness-planner"),
        ],
      },
      {
        id: "formulation-fill",
        title: "Formulation & fill-finish",
        summary: "Connect formulation, handling, sterile filtration, aseptic processing, presentation, and stability evidence.",
        applications: [
          app("workflow", "sterile-filtration"),
          app("workflow", "aseptic-process-simulation"),
          app("toolkit", "biopharma-formulation-stability"),
          app("lesson", "biopharma-formulation-fill-finish-stability"),
          app("tool", "sterile-filtration-readiness-planner"),
          app("tool", "media-fill-aps-readiness-planner"),
        ],
      },
      {
        id: "analytical-control",
        title: "Analytical control",
        summary: "Link attributes and decisions to potency, process-impurity, viral-safety, reference, and lifecycle controls.",
        applications: [
          app("workflow", "cell-based-potency-assay"),
          app("workflow", "host-cell-protein-testing-workflow"),
          app("workflow", "viral-safety-testing-workflow"),
          app("toolkit", "biopharma-analytical-control-strategy"),
          app("lesson", "biopharma-integrated-analytical-control-strategy"),
          app("tool", "cell-based-potency-readiness-planner"),
          app("tool", "hcp-testing-readiness-planner"),
          app("tool", "viral-safety-readiness-planner"),
        ],
      },
      {
        id: "validation-cpv",
        title: "Validation & CPV",
        summary: "Connect process knowledge and enabling-system readiness to PPQ, continued verification, and change.",
        applications: [
          app("workflow", "process-validation"),
          app("workflow", "equipment-qualification-lifecycle"),
          app("toolkit", "biopharma-process-validation-cpv"),
          app("lesson", "biopharma-process-validation-continued-verification"),
          app("tool", "process-capability-calculator"),
          app("tool", "equipment-qualification-readiness-planner"),
        ],
      },
      {
        id: "release-transfer",
        title: "Release & transfer",
        summary: "Bring batch disposition, stability, change, comparability, and receiving-unit readiness into one lifecycle view.",
        applications: [
          app("workflow", "batch-record-review-release"),
          app("workflow", "change-control-workflow"),
          app("workflow", "stability-program"),
          app("toolkit", "biopharma-technology-transfer"),
          app("lesson", "biopharma-integrated-technology-transfer"),
          app("tool", "batch-release-readiness-checklist"),
          app("tool", "change-control-impact-triage"),
        ],
      },
    ],
  },
  {
    id: "sterile-product",
    shortTitle: "Sterile product",
    title: "Sterile product contamination-control system",
    description: "Follow the sterile boundary from supplier and facility readiness through personnel, sterilization, filtration, aseptic processing, monitoring, and release.",
    audience: "Sterile manufacturing, microbiology QC, validation, engineering, and QA",
    boundary: "The sequence organizes Atlas resources. Site CCS, process design, qualification, monitoring, and release decisions remain site-specific and qualified-review dependent.",
    stages: [
      {
        id: "sterile-materials",
        title: "Materials & suppliers",
        summary: "Establish supplier risk, incoming controls, and change visibility before material enters the sterile system.",
        applications: [app("workflow", "supplier-qualification-workflow"), app("tool", "supplier-qualification-risk-triage"), app("lesson", "supplier-qualification")],
      },
      {
        id: "facility-readiness",
        title: "Facility readiness",
        summary: "Qualify equipment and cleaning controls that support the controlled manufacturing environment.",
        applications: [app("workflow", "equipment-qualification-lifecycle"), app("workflow", "cleaning-validation-program"), app("tool", "equipment-qualification-readiness-planner"), app("tool", "cleaning-validation-maco-calculator")],
      },
      {
        id: "people-sterilization",
        title: "People & sterilization",
        summary: "Connect gowning qualification and sterilization challenge evidence to the contamination-control strategy.",
        applications: [app("workflow", "aseptic-gowning-qualification"), app("workflow", "biological-indicator-workflow"), app("tool", "gowning-qualification-readiness-planner"), app("tool", "sterilization-f0-calculator")],
      },
      {
        id: "sterile-filtration-stage",
        title: "Sterile filtration",
        summary: "Link filter selection, process parameters, integrity strategy, and qualified readiness.",
        applications: [app("workflow", "sterile-filtration"), app("tool", "sterile-filtration-readiness-planner"), app("lesson", "sterilizing-grade-filtration")],
      },
      {
        id: "aseptic-process",
        title: "Aseptic process",
        summary: "Connect process simulation, operator practice, and environmental controls before routine execution.",
        applications: [app("workflow", "aseptic-process-simulation"), app("workflow", "environmental-monitoring"), app("tool", "media-fill-aps-readiness-planner"), app("tool", "contamination-control-strategy-builder")],
      },
      {
        id: "monitor-investigate",
        title: "Monitor & investigate",
        summary: "Bring EM signals, data review, deviations, OOS, and CAPA into a controlled response path.",
        applications: [app("workflow", "environmental-monitoring"), app("workflow", "oos-investigation"), app("workflow", "deviation-capa"), app("workflow", "data-integrity-review"), app("tool", "em-scenario-decision-tree"), app("tool", "capa-effectiveness-check-planner")],
      },
      {
        id: "sterile-release",
        title: "Release & lifecycle",
        summary: "Connect record review, unresolved events, stability, and change impact before disposition.",
        applications: [app("workflow", "batch-record-review-release"), app("workflow", "change-control-workflow"), app("workflow", "stability-program"), app("tool", "batch-release-readiness-checklist"), app("tool", "change-control-impact-triage")],
      },
    ],
  },
  {
    id: "qc-laboratory",
    shortTitle: "QC laboratory",
    title: "Connected QC laboratory operating system",
    description: "Follow laboratory readiness, utilities and media, microbiology and analytical execution, stability, investigations, and release as one operating chain.",
    audience: "QC analysts, laboratory supervisors, validation, data reviewers, and QA",
    boundary: "This map organizes decision-support resources. It is not LIMS, a test schedule, an approved method set, or a replacement for the site quality system.",
    stages: [
      {
        id: "lab-readiness",
        title: "Lab readiness",
        summary: "Qualify equipment, instruments, people, and data controls before routine testing.",
        applications: [app("workflow", "equipment-qualification-lifecycle"), app("workflow", "data-integrity-review"), app("tool", "equipment-qualification-readiness-planner"), app("tool", "audit-trail-review-triage")],
      },
      {
        id: "media-utilities",
        title: "Media & utilities",
        summary: "Connect culture media, pharmaceutical water, and supporting controls to the tests they enable.",
        applications: [app("workflow", "culture-media-selection"), app("workflow", "water-system-monitoring"), app("tool", "culture-media-selection-helper"), app("tool", "lab-water-type-selector"), app("toolkit", "microbiology-qc-starter-pack")],
      },
      {
        id: "microbiology-controls",
        title: "Microbiology controls",
        summary: "Link environmental monitoring and biological-indicator execution to contamination and sterilization evidence.",
        applications: [app("workflow", "environmental-monitoring"), app("workflow", "biological-indicator-workflow"), app("tool", "microbial-count-calculator"), app("tool", "sterilization-f0-calculator")],
      },
      {
        id: "analytical-testing",
        title: "Analytical testing",
        summary: "Connect instrument suitability and product-test decisions to visible calculations and method evidence.",
        applications: [app("workflow", "hplc-system-suitability-workflow"), app("workflow", "dissolution-testing-workflow"), app("tool", "system-suitability-calculator"), app("tool", "dissolution-acceptance-checker")],
      },
      {
        id: "stability-trending",
        title: "Stability & trending",
        summary: "Connect study design, shelf-life learning, OOT signals, and lifecycle decisions.",
        applications: [app("workflow", "stability-program"), app("tool", "stability-trend-shelf-life-planner"), app("tool", "oot-trend-triage-planner"), app("lesson", "ongoing-stability-program")],
      },
      {
        id: "lab-investigations",
        title: "Investigations",
        summary: "Route atypical signals through data review, OOS, deviation, root cause, and CAPA.",
        applications: [app("workflow", "oos-investigation"), app("workflow", "deviation-capa"), app("workflow", "data-integrity-review"), app("tool", "oos-investigation-decision-tree"), app("tool", "investigation-template-viewer")],
      },
      {
        id: "lab-release",
        title: "Review & release",
        summary: "Bring results, records, events, supplier status, and change impact into disposition readiness.",
        applications: [app("workflow", "batch-record-review-release"), app("workflow", "change-control-workflow"), app("workflow", "supplier-qualification-workflow"), app("tool", "batch-release-readiness-checklist")],
      },
    ],
  },
  {
    id: "pharma-api",
    shortTitle: "Pharma & API",
    title: "Pharmaceutical and API quality lifecycle",
    description: "Follow inputs, process and impurity control, equipment, analytical lifecycle, validation, stability, investigation, release, and change.",
    audience: "API development, manufacturing, analytical development, QC, validation, and Quality Unit",
    boundary: "The map does not invent chemistry, purge factors, methods, limits, specifications, filing conclusions, or approval.",
    stages: [
      {
        id: "api-inputs",
        title: "Inputs & suppliers",
        summary: "Connect starting-material boundaries and supplier chains to incoming controls and lifecycle risk.",
        applications: [app("workflow", "supplier-qualification-workflow"), app("toolkit", "pharma-api-starting-material-input-control"), app("tool", "supplier-qualification-risk-triage"), app("lesson", "pharma-api-starting-materials-input-control")],
      },
      {
        id: "api-process",
        title: "Process & impurities",
        summary: "Trace impurity origin, fate, analytical capability, control placement, and accountable decisions.",
        applications: [app("workflow", "pharma-api-impurity-control"), app("toolkit", "pharma-api-impurity-control"), app("lesson", "pharma-api-process-development-impurity-control")],
      },
      {
        id: "api-equipment-cleaning",
        title: "Equipment & cleaning",
        summary: "Connect equipment readiness and cleaning controls to the process and product-contact risk.",
        applications: [app("workflow", "equipment-qualification-lifecycle"), app("workflow", "cleaning-validation-program"), app("tool", "equipment-qualification-readiness-planner"), app("tool", "cleaning-validation-maco-calculator")],
      },
      {
        id: "api-analytical",
        title: "Analytical lifecycle",
        summary: "Link analytical purpose, capability, system suitability, specifications, transfer, and change.",
        applications: [app("workflow", "hplc-system-suitability-workflow"), app("toolkit", "pharma-api-analytical-lifecycle"), app("tool", "system-suitability-calculator"), app("lesson", "pharma-api-analytical-specification-lifecycle")],
      },
      {
        id: "api-validation",
        title: "Process validation",
        summary: "Connect process knowledge, qualification, PPQ, and continued verification.",
        applications: [app("workflow", "process-validation"), app("tool", "process-capability-calculator"), app("lesson", "process-validation-stages")],
      },
      {
        id: "api-stability-investigation",
        title: "Stability & investigation",
        summary: "Link stability signals and atypical results to controlled investigation and lifecycle decisions.",
        applications: [app("workflow", "stability-program"), app("workflow", "oos-investigation"), app("tool", "stability-trend-shelf-life-planner"), app("tool", "oos-investigation-decision-tree")],
      },
      {
        id: "api-release-change",
        title: "Release & change",
        summary: "Bring records, deviations, data integrity, and change impact into release readiness.",
        applications: [app("workflow", "batch-record-review-release"), app("workflow", "change-control-workflow"), app("workflow", "data-integrity-review"), app("tool", "batch-release-readiness-checklist"), app("tool", "change-control-impact-triage")],
      },
    ],
  },
  {
    id: "quality-lifecycle",
    shortTitle: "Quality lifecycle",
    title: "Pharmaceutical quality-system lifecycle",
    description: "Follow supplier governance, qualification, validation, routine control, signals, CAPA and change, management review, and batch disposition.",
    audience: "QA, Quality Unit, QC leadership, validation, operations, and system owners",
    boundary: "The map supports navigation and readiness thinking; it does not approve a quality decision, CAPA, validation conclusion, or batch disposition.",
    stages: [
      {
        id: "supplier-governance",
        title: "Supplier governance",
        summary: "Qualify suppliers and keep material, service, performance, and change risk visible.",
        applications: [app("workflow", "supplier-qualification-workflow"), app("tool", "supplier-qualification-risk-triage"), app("lesson", "supplier-audit-program")],
      },
      {
        id: "qualification",
        title: "Qualification",
        summary: "Establish equipment and instrument readiness before relying on generated evidence.",
        applications: [app("workflow", "equipment-qualification-lifecycle"), app("tool", "equipment-qualification-readiness-planner"), app("lesson", "analytical-instrument-qualification")],
      },
      {
        id: "validation",
        title: "Validation",
        summary: "Connect process and cleaning knowledge to qualified execution and continued verification.",
        applications: [app("workflow", "process-validation"), app("workflow", "cleaning-validation-program"), app("tool", "process-capability-calculator"), app("tool", "cleaning-validation-maco-calculator")],
      },
      {
        id: "routine-control",
        title: "Routine control",
        summary: "Link laboratory and environmental controls to their intended decisions and evidence quality.",
        applications: [app("workflow", "hplc-system-suitability-workflow"), app("workflow", "dissolution-testing-workflow"), app("workflow", "environmental-monitoring"), app("workflow", "water-system-monitoring")],
      },
      {
        id: "quality-signals",
        title: "Signals & investigations",
        summary: "Route OOS, OOT, deviations, and data signals through controlled review.",
        applications: [app("workflow", "oos-investigation"), app("workflow", "data-integrity-review"), app("tool", "oot-trend-triage-planner"), app("tool", "audit-trail-review-triage")],
      },
      {
        id: "capa-change",
        title: "CAPA & change",
        summary: "Connect root cause, actions, effectiveness, impact assessment, and implementation control.",
        applications: [app("workflow", "deviation-capa"), app("workflow", "change-control-workflow"), app("tool", "capa-effectiveness-check-planner"), app("tool", "change-control-impact-triage")],
      },
      {
        id: "quality-review-release",
        title: "Review & disposition",
        summary: "Bring records, unresolved events, trends, and lifecycle commitments into accountable review.",
        applications: [app("workflow", "batch-record-review-release"), app("workflow", "stability-program"), app("tool", "batch-release-readiness-checklist"), app("tool", "stability-trend-shelf-life-planner")],
      },
    ],
  },
];

export function getWorkflowSystem(id: string): WorkflowSystem | undefined {
  return workflowSystems.find((system) => system.id === id);
}
