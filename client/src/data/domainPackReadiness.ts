import type { EvidenceDomainId } from "./atlasEvidenceGraph";

export type ExpansionDomainId = Exclude<EvidenceDomainId, "compiler-core"> | "food-beverage";
export type ReadinessGateId = "expert-owner" | "source-corpus" | "validation-cases" | "qualified-demand";
export type ReadinessGateStatus = "gate-satisfied" | "in-development" | "evidence-required" | "not-started";

export interface DomainReadinessGate {
  id: ReadinessGateId;
  label: string;
  status: ReadinessGateStatus;
  currentEvidence: string;
  exitEvidence: string;
  supportingHref?: string;
  supportingLabel?: string;
}

export interface DomainPackReadiness {
  id: ExpansionDomainId;
  sequence: number;
  title: string;
  currentStage: "executable-concept" | "evidence-development" | "specialist-gated" | "future-gate";
  publicEvidenceHref?: string;
  scopeBoundary: string;
  gates: DomainReadinessGate[];
}

const gate = (id: ReadinessGateId, label: string, status: ReadinessGateStatus, currentEvidence: string, exitEvidence: string, supportingHref?: string, supportingLabel?: string): DomainReadinessGate => ({ id, label, status, currentEvidence, exitEvidence, supportingHref, supportingLabel });

const commonRequired = {
  cases: "Controlled validation cases must compare compiled estimates with qualified project evidence and record corrections and variance.",
  demand: "A paid opportunity or strongly qualified buyer must confirm a real decision, scope and willingness to engage.",
};

export const domainPackReadiness: DomainPackReadiness[] = [
  {
    id: "nonsterile-microbiology", sequence: 1, title: "Non-sterile pharmaceutical microbiology", currentStage: "executable-concept", publicEvidenceHref: "/quality-lab/evidence",
    scopeBoundary: "The current executable slice is a concept model. It is not yet a verified Microbiology Domain Pack or a source of site-approved methods.",
    gates: [
      gate("expert-owner", "Qualified expert ownership", "in-development", "Four accountable review scopes cover the current rule registry; 0 roles have an evidence-backed external appointment in the product record.", "Name accountable microbiology SME reviewer(s), competence basis, review scope and change-control responsibilities.", "/quality-lab/domain-ownership", "Inspect ownership control"),
      gate("source-corpus", "Versioned source corpus", "in-development", "A public-reference catalog and versioned concept rule registry exist for the current slice.", "Complete applicability conditions, source versions, rule provenance and controlled review for every material method/resource rule."),
      gate("validation-cases", "Validation cases", "evidence-required", "Synthetic cases exercise engine behavior, but 0 of the 3-case working evidence threshold are accepted validation cases.", commonRequired.cases, "/quality-lab/validation-cases", "Inspect validation registry"),
      gate("qualified-demand", "Paying or qualified demand", "evidence-required", "The repository contains discovery and review workflows but no claim of a completed paid Blueprint engagement.", commonRequired.demand),
    ],
  },
  {
    id: "water-em", sequence: 2, title: "Water & environmental monitoring", currentStage: "evidence-development", publicEvidenceHref: "/quality-lab/evidence",
    scopeBoundary: "Water and EM have planning guidance and broad workload rules, not a verified point/zone/method graph or operational simulation.",
    gates: [
      gate("expert-owner", "Qualified expert ownership", "evidence-required", "No accountable Water/EM Domain Pack owner is asserted.", "Establish qualified ownership across pharmaceutical water, EM program design, microbiology operations and excursion review."),
      gate("source-corpus", "Versioned source corpus", "in-development", "Public planning guidance and selected regulatory context exist.", "Build a versioned corpus covering water grades, sampling rationale, EM zones/events, methods, limits, incubation, trending and investigations."),
      gate("validation-cases", "Validation cases", "evidence-required", "No controlled Water/EM validation case is claimed.", commonRequired.cases, "/blog/how-to-validate-a-quality-lab-domain-pack"),
      gate("qualified-demand", "Paying or qualified demand", "evidence-required", "No domain-specific paid or strongly qualified opportunity is claimed.", commonRequired.demand),
    ],
  },
  {
    id: "sterile-biologics", sequence: 3, title: "Sterile & biologics quality", currentStage: "specialist-gated", publicEvidenceHref: "/quality-lab/evidence",
    scopeBoundary: "Educational sterile/biologics content does not constitute a sterile assurance or biologics QC Domain Pack.",
    gates: [
      gate("expert-owner", "Qualified expert ownership", "evidence-required", "No accountable sterile/biologics pack owner is asserted.", "Establish modality-appropriate SME ownership, including contamination control and specialist assay expertise."),
      gate("source-corpus", "Versioned source corpus", "in-development", "Educational lessons, workflows, tools and a capability-planning guide exist.", "Version applicability and dependency evidence for sterile assurance, product modality, specialist assays, reagents, facilities and lifecycle controls."),
      gate("validation-cases", "Validation cases", "evidence-required", "No controlled sterile or biologics validation case is claimed.", commonRequired.cases, "/blog/how-to-validate-a-quality-lab-domain-pack"),
      gate("qualified-demand", "Paying or qualified demand", "evidence-required", "No domain-specific paid or strongly qualified opportunity is claimed.", commonRequired.demand),
    ],
  },
  {
    id: "analytical-chemistry", sequence: 4, title: "Analytical chemistry", currentStage: "specialist-gated", publicEvidenceHref: "/quality-lab/evidence",
    scopeBoundary: "Existing analytical content supports discovery; the product does not claim an executable analytical capacity compiler.",
    gates: [
      gate("expert-owner", "Qualified expert ownership", "evidence-required", "The canonical roadmap explicitly requires a qualified analytical SME.", "Name qualified analytical SME ownership for method architecture, validation lifecycle, instrument capacity and review rules."),
      gate("source-corpus", "Versioned source corpus", "in-development", "Planning guidance and supporting analytical lessons/workflows/tools exist.", "Build source-linked method-family rules for preparation, sequence design, runtime, suitability, standards, failures, review and lifecycle work."),
      gate("validation-cases", "Validation cases", "evidence-required", "No controlled analytical capacity validation case is claimed.", commonRequired.cases, "/blog/how-to-validate-a-quality-lab-domain-pack"),
      gate("qualified-demand", "Paying or qualified demand", "evidence-required", "No domain-specific paid or strongly qualified opportunity is claimed.", commonRequired.demand),
    ],
  },
  {
    id: "stability-sample-management", sequence: 5, title: "Stability & sample management", currentStage: "evidence-development", publicEvidenceHref: "/quality-lab/evidence",
    scopeBoundary: "Planning guidance and tools exist, but no protocol inventory/chamber geometry/pull-calendar compiler is claimed.",
    gates: [
      gate("expert-owner", "Qualified expert ownership", "evidence-required", "No accountable stability/sample-management pack owner is asserted.", "Establish qualified ownership spanning protocol governance, chamber qualification, sample operations, analytical demand and excursion response."),
      gate("source-corpus", "Versioned source corpus", "in-development", "Planning guidance and stability learning resources exist.", "Version rules for protocols, storage orientations, reserve policy, positions, pulls, methods, trends, excursions, retention and continuity."),
      gate("validation-cases", "Validation cases", "evidence-required", "No controlled stability capacity validation case is claimed.", commonRequired.cases, "/blog/how-to-validate-a-quality-lab-domain-pack"),
      gate("qualified-demand", "Paying or qualified demand", "evidence-required", "No domain-specific paid or strongly qualified opportunity is claimed.", commonRequired.demand),
    ],
  },
  {
    id: "food-beverage", sequence: 6, title: "Food & beverage quality", currentStage: "future-gate",
    scopeBoundary: "This is a future market boundary, not a current Domain Pack, product promise or implemented evidence area.",
    gates: [
      gate("expert-owner", "Qualified expert ownership", "not-started", "No expert-owner claim is made.", "Establish credible sector and method ownership before product work begins."),
      gate("source-corpus", "Versioned source corpus", "not-started", "No Food & Beverage Domain Pack corpus is claimed.", "Define the regulated subsegment, jurisdiction, product families, methods and authoritative source corpus."),
      gate("validation-cases", "Validation cases", "not-started", "No validation cases are claimed.", commonRequired.cases, "/blog/how-to-validate-a-quality-lab-domain-pack"),
      gate("qualified-demand", "Paying or qualified demand", "not-started", "No domain-specific demand claim is made.", commonRequired.demand),
    ],
  },
];

export function assessDomainPackReadiness(domain: DomainPackReadiness) {
  const satisfied = domain.gates.filter((item) => item.status === "gate-satisfied").length;
  const blockers = domain.gates.filter((item) => item.status !== "gate-satisfied");
  return {
    satisfied,
    total: domain.gates.length,
    readinessPercent: Math.round((satisfied / domain.gates.length) * 100),
    eligibleForVerifiedPack: blockers.length === 0,
    blockers,
    notice: "Readiness is an evidence gate, not a release date or commercial promise.",
  };
}
