export interface QualityLabDecisionFrameInput {
  decision: string;
  decisionOwner: string;
  firstScope: string;
  decisionGate: string;
  evidenceBasis: string;
  unresolvedImpact: string;
  excludedDecisions: string;
}

export type QualityLabDecisionFrameCriterionId = keyof QualityLabDecisionFrameInput;

export interface QualityLabDecisionFrameCriterion {
  id: QualityLabDecisionFrameCriterionId;
  label: string;
  complete: boolean;
  action: string;
}

export interface QualityLabDecisionFrameReadiness {
  completeCount: number;
  totalCount: number;
  percent: number;
  criteria: QualityLabDecisionFrameCriterion[];
  nextAction: string;
  boundary: string;
}

export const emptyQualityLabDecisionFrame: QualityLabDecisionFrameInput = {
  decision: "",
  decisionOwner: "",
  firstScope: "",
  decisionGate: "",
  evidenceBasis: "",
  unresolvedImpact: "",
  excludedDecisions: "",
};

function described(value: string, minimumLength: number) {
  return value.trim().length >= minimumLength;
}

export function assessQualityLabDecisionFrame(input: QualityLabDecisionFrameInput): QualityLabDecisionFrameReadiness {
  const criteria: QualityLabDecisionFrameCriterion[] = [
    {
      id: "decision",
      label: "Decision to support",
      complete: described(input.decision, 30),
      action: "State the operating, investment, capacity, sourcing, or sequencing decision that the Blueprint must support.",
    },
    {
      id: "decisionOwner",
      label: "Owner and reviewers",
      complete: described(input.decisionOwner, 10),
      action: "Name the accountable decision owner and the QC, QA, regulatory, engineering, finance, or operations reviewers required.",
    },
    {
      id: "firstScope",
      label: "First review scope",
      complete: described(input.firstScope, 30),
      action: "Bound the first site, product families, markets, workflows, scenarios, and important exclusions.",
    },
    {
      id: "decisionGate",
      label: "Decision gate",
      complete: described(input.decisionGate, 4),
      action: "Name the date or event when the next budget, design, operating, outsourcing, or procurement decision is due.",
    },
    {
      id: "evidenceBasis",
      label: "Available evidence",
      complete: described(input.evidenceBasis, 30),
      action: "List the controlled or working inputs that exist, their owners, periods, versions, and known limitations.",
    },
    {
      id: "unresolvedImpact",
      label: "Impact if unresolved",
      complete: described(input.unresolvedImpact, 20),
      action: "Explain what delay, cost, compliance, capacity, release, continuity, or redesign risk remains if the decision is not resolved.",
    },
    {
      id: "excludedDecisions",
      label: "Decisions not authorized",
      complete: described(input.excludedDecisions, 20),
      action: "State what the work must not approve yet, such as supplier selection, detailed engineering, method validation, or regulatory acceptance.",
    },
  ];
  const completeCount = criteria.filter((criterion) => criterion.complete).length;
  const nextOpenCriterion = criteria.find((criterion) => !criterion.complete);

  return {
    completeCount,
    totalCount: criteria.length,
    percent: Math.round((completeCount / criteria.length) * 100),
    criteria,
    nextAction: nextOpenCriterion?.action ?? "Review every statement with the named owners, link controlled evidence, and carry unresolved items into the discovery log.",
    boundary: "This measures decision-frame detail only. It does not establish regulatory applicability, evidence sufficiency, commercial fit, reviewer appointment, project approval, or readiness for design, procurement, validation, or site use.",
  };
}

function valueOrGap(value: string) {
  return value.trim() || "Not described - discovery gap";
}

export function formatQualityLabDecisionFrame(input: QualityLabDecisionFrameInput): string {
  const readiness = assessQualityLabDecisionFrame(input);
  const missing = readiness.criteria.filter((criterion) => !criterion.complete);

  return [
    "# Atlas Blueprint Decision Frame",
    `Planning boundary: ${readiness.boundary}`,
    "",
    "## Decision to support",
    valueOrGap(input.decision),
    "",
    "## Ownership and review",
    valueOrGap(input.decisionOwner),
    "",
    "## First review scope",
    valueOrGap(input.firstScope),
    "",
    "## Decision gate",
    valueOrGap(input.decisionGate),
    "",
    "## Available evidence and limitations",
    valueOrGap(input.evidenceBasis),
    "",
    "## Impact if unresolved",
    valueOrGap(input.unresolvedImpact),
    "",
    "## Decisions not authorized by this work",
    valueOrGap(input.excludedDecisions),
    "",
    "## Discovery status",
    `- Decision inputs described: ${readiness.completeCount} of ${readiness.totalCount} (${readiness.percent}%)`,
    `- Next action: ${readiness.nextAction}`,
    ...(missing.length ? ["- Open inputs:", ...missing.map((criterion) => `  - ${criterion.label}: ${criterion.action}`)] : ["- Open inputs: none based on description length; owner and evidence verification are still required."]),
  ].join("\n");
}
