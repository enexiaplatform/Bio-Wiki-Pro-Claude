import type { QualityLabProject } from "./quality-lab.js";
import { findTwinEquipmentThreshold, inspectTwinBaseline } from "./quality-lab-decision-twin.js";
import { analyzeQualityLabSensitivity } from "./quality-lab-sensitivity.js";
import { compareTwinSpecialists, SPECIALIST_LABELS } from "./quality-lab-twin-specialists.js";

export const QUALITY_LAB_CHALLENGE_VERSION = "quality-lab-challenge/v1";
export interface ChallengeFinding {
  id: string;
  kind: "equipment-threshold" | "unresolved-input" | "sensitivity" | "specialist-warning";
  title: string;
  explanation: string;
  nextAction: string;
  affectedOutputs: string[];
  lineageIds: string[];
  ruleIds: string[];
  confidence: "high" | "medium" | "indicative";
  factors: { decisionImpact: number; proximity: number; evidenceGap: number; dependencies: number };
  score: number;
}

export async function analyzeQualityLabChallengeWithSpecialists(project: QualityLabProject) {
  const core = analyzeQualityLabChallenge(project);
  if (core.status === "blocked") return core;
  const specialists = await compareTwinSpecialists(project, project);
  const additional: Omit<ChallengeFinding, "score">[] = [];
  for (const specialist of specialists) {
    if (specialist.status !== "ready") continue;
    for (const signal of specialist.baselineSignals ?? []) {
      if (signal.severity !== "critical" && signal.severity !== "watch") continue;
      const lineage = project.blueprint.decisionLineage.filter((record) => record.ruleRefs.some((rule) => signal.relatedRuleIds.includes(rule.id)));
      additional.push({
        id: `specialist:${specialist.kind}:${signal.id}`,
        kind: "specialist-warning",
        title: `${SPECIALIST_LABELS[specialist.kind]}: ${signal.title}`,
        explanation: `${signal.description} ${specialist.boundary}`,
        nextAction: `Review the accepted ${SPECIALIST_LABELS[specialist.kind].toLowerCase()} assumptions and confirm the relevant site capacity, coverage and evidence before approving the affected decision.`,
        affectedOutputs: Array.from(new Set(lineage.map((record) => record.outputKey))),
        lineageIds: lineage.map((record) => record.id),
        ruleIds: signal.relatedRuleIds,
        confidence: "indicative",
        factors: {
          decisionImpact: signal.severity === "critical" ? 40 : 25,
          proximity: 0,
          evidenceGap: 20,
          dependencies: Math.min(10, new Set(lineage.map((record) => record.outputKey)).size * 2),
        },
      });
    }
  }
  return {
    ...core,
    findings: rankChallengeFindings([...core.findings, ...additional]),
    specialistCoverage: specialists.map(({ kind, status, boundary }) => ({ kind, status, boundary })),
    boundary: "Review-priority policy over concept outputs, not a regulatory classification or statistical risk score. Only explicitly accepted, current specialist bases contribute warnings. Missing analyses are not evidence of safety. Sensitivity ranges are stress tests, not validated operating limits. Rule-linked outputs indicate a shared basis, not proof of direct causation.",
  };
}

/** Policy weights express review priority, never regulatory severity or probability. */
export function rankChallengeFindings(findings: Omit<ChallengeFinding, "score">[]): ChallengeFinding[] {
  return findings.map((finding) => ({
    ...finding,
    score: Object.values(finding.factors).reduce((sum, factor) => sum + factor, 0),
  })).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
}

/** Initial orchestration sources. No external inference, model mutation or invented evidence. */
export function analyzeQualityLabChallenge(project: QualityLabProject) {
  const invalid = inspectTwinBaseline(project);
  if (invalid) return { status: "blocked" as const, version: QUALITY_LAB_CHALLENGE_VERSION, message: invalid, findings: [] };
  const findings: Omit<ChallengeFinding, "score">[] = [];
  const threshold = findTwinEquipmentThreshold(project);
  if (threshold.status === "found") {
    const distance = threshold.distancePercent;
    findings.push({
      id: "equipment-demand-threshold",
      kind: "equipment-threshold",
      title: "Equipment sizing changes within the tested demand range",
      explanation: threshold.explanation + " " + threshold.changes.map((change) => `${change.name} (${change.horizon}): ${change.before} → ${change.after}.`).join(" "),
      nextAction: "Confirm the peak-month production plan and test this demand in the Decision Twin before freezing equipment CAPEX.",
      affectedOutputs: threshold.changes.map((change) => `equipment.${change.id}.${change.horizon === "current" ? "quantityNow" : "quantityFuture"}`),
      lineageIds: Array.from(new Set(threshold.changes.flatMap((change) => change.lineageIds))),
      ruleIds: [],
      confidence: threshold.changes.some((change) => change.confidence === "indicative") ? "indicative" : threshold.changes.some((change) => change.confidence === "medium") ? "medium" : "high",
      factors: {
        decisionImpact: 30,
        proximity: distance === null ? 0 : distance <= 5 ? 30 : distance <= 20 ? 20 : 10,
        evidenceGap: 0,
        dependencies: Math.min(10, new Set(threshold.changes.map((change) => change.id)).size * 2),
      },
    });
  }
  for (const input of project.blueprint.unresolvedInputs) {
    const lineage = project.blueprint.decisionLineage.filter((record) => record.unresolvedInputIds.includes(input.id));
    findings.push({
      id: `unresolved:${input.id}`,
      kind: "unresolved-input",
      title: input.question,
      explanation: input.impact,
      nextAction: input.resolution,
      affectedOutputs: Array.from(new Set(lineage.map((record) => record.outputKey))),
      lineageIds: lineage.map((record) => record.id),
      ruleIds: input.relatedRuleIds,
      confidence: "indicative",
      factors: {
        decisionImpact: input.severity === "blocking" ? 40 : input.severity === "important" ? 25 : 10,
        proximity: 0,
        evidenceGap: input.severity === "blocking" ? 30 : input.severity === "important" ? 20 : 10,
        dependencies: Math.min(10, new Set(lineage.map((record) => record.outputKey)).size * 2),
      },
    });
  }
  const sensitivity = analyzeQualityLabSensitivity(project);
  for (const driver of sensitivity.drivers) {
    if (driver.decisionClass === "stable-in-tested-range") continue;
    if (driver.id === "finishedBatchesPerMonth" && project.blueprint.finishedProductDemand.source !== "aggregate-input") continue;
    const nearest = driver.nearestThreshold;
    const affected = driver.outcomes.filter((outcome) => outcome.robustnessClass !== "robust-in-tested-range");
    findings.push({
      id: `sensitivity:${driver.id}`,
      kind: "sensitivity",
      title: `${driver.label} changes a modeled decision`,
      explanation: nearest
        ? `${nearest.change} Tested change near ${nearest.inputValue} ${nearest.inputUnit}. Criterion: ${nearest.criterion}. ${driver.perturbationBasis}`
        : `${driver.robustnessSummary} ${driver.perturbationBasis}`,
      nextAction: driver.evidenceNeeded,
      affectedOutputs: affected.map((outcome) => outcome.metricId),
      lineageIds: driver.lineageIds,
      ruleIds: driver.relatedRuleIds,
      confidence: driver.modelConfidence,
      factors: {
        decisionImpact: driver.decisionClass === "decision-critical" ? 30 : 20,
        proximity: nearest ? nearest.distancePercentOfTestRange <= 33 ? 20 : 10 : 0,
        evidenceGap: 20,
        dependencies: Math.min(10, new Set(affected.map((outcome) => outcome.metricId)).size * 2),
      },
    });
  }
  return {
    status: "ready" as const,
    version: QUALITY_LAB_CHALLENGE_VERSION,
    findings: rankChallengeFindings(findings),
    coverage: { equipmentThreshold: threshold.status, unresolvedInputs: project.blueprint.unresolvedInputs.length, sensitivityDrivers: sensitivity.drivers.length },
    boundary: "Review-priority policy over concept outputs, not a regulatory classification or statistical risk score. Sensitivity uses one-at-a-time stress ranges, not validated operating limits. Specialist signals are not yet included in this initial ranking.",
  };
}
