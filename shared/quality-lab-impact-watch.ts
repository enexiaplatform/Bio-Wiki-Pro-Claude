import type { QualityLabProject } from "./quality-lab.js";
import type { RegulatoryUpdate } from "./regulatory-monitor.js";
import { REGULATORY_SOURCES } from "./regulatory-monitor.js";
import { inspectTwinBaseline } from "./quality-lab-decision-twin.js";
import { twinSourceBasisHash } from "./quality-lab-twin-specialists.js";
import { impactReviewSchema, type ImpactReview } from "./quality-lab-impact-contract.js";

export async function impactUpdateFingerprint(update: RegulatoryUpdate) {
  const bytes = new TextEncoder().encode(JSON.stringify([update.sourceId, update.url, update.publishedAt, update.title, update.sourceSummary ?? ""]));
  return Array.from(new Uint8Array(await globalThis.crypto.subtle.digest("SHA-256", bytes)), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function createImpactReview(project: QualityLabProject, update: RegulatoryUpdate, input: Pick<ImpactReview, "disposition" | "reviewerRole" | "rationale">) {
  if (mapProjectRegulatoryImpact(project, update).status === "blocked") throw new Error("Review requires a current project and an official source.");
  return impactReviewSchema.parse({
    ...input, version: "quality-lab-impact-review/v1", projectId: project.id, updateId: update.id,
    updateFingerprint: await impactUpdateFingerprint(update),
    projectBasisFingerprint: await twinSourceBasisHash(project),
    sourceUrl: update.url, sourceTitle: update.title,
    reviewedAt: new Date().toISOString(), confirmation: "human-review-record-only",
  });
}

export async function currentImpactReview(project: QualityLabProject, update: RegulatoryUpdate) {
  if (mapProjectRegulatoryImpact(project, update).status === "blocked") return null;
  const updateHash = await impactUpdateFingerprint(update), projectHash = await twinSourceBasisHash(project);
  return [...(project.input.impactReviewHistory ?? [])].reverse().find((review) => review.projectId === project.id && review.updateFingerprint === updateHash && review.projectBasisFingerprint === projectHash) ?? null;
}

const topicPatterns = [
  /microbial enumeration|enumeration|bioburden/i,
  /method suitability|neutralization|recovery/i,
  /growth promotion/i,
  /water|environmental monitoring/i,
  /specified microorganism|specified organisms/i,
  /data integrity|electronic records/i,
];

export function isOfficialImpactSource(update: RegulatoryUpdate): boolean {
  try {
    if (!REGULATORY_SOURCES.some((source) => source.id === update.sourceId)) return false;
    const url = new URL(update.url);
    const host = update.sourceId.startsWith("fda-") ? "fda.gov" : update.sourceId.startsWith("ema-") ? "ema.europa.eu" : null;
    return Boolean(host && url.protocol === "https:" && !url.username && !url.password && (!url.port || url.port === "443") && (url.hostname === host || url.hostname.endsWith(`.${host}`)));
  } catch { return false; }
}

/** Candidate record links only. Topic overlap cannot establish applicability. */
export function mapProjectRegulatoryImpact(project: QualityLabProject, update: RegulatoryUpdate) {
  const invalid = inspectTwinBaseline(project);
  if (invalid || !isOfficialImpactSource(update)) return {
    status: "blocked" as const,
    message: invalid ?? "The update does not have a verified official-source URL.",
    records: [],
  };
  const patterns = topicPatterns.filter((pattern) => pattern.test(`${update.title} ${update.sourceSummary ?? ""}`));
  const records: Array<{ kind: "method" | "evidence" | "unresolved-input" | "assumption"; id: string; label: string; basis: string }> = [];
  for (const method of project.blueprint.methodRequirements) {
    if (patterns.some((pattern) => pattern.test(`${method.methodName} ${method.requirementType}`))) records.push({
      kind: "method", id: method.id, label: method.methodName,
      basis: "Shared explicit topic in the official update and this Method Graph record; qualified applicability review required.",
    });
  }
  for (const evidence of project.blueprint.evidence) {
    const exactLocator = evidence.locator.replace(/\/$/, "") === update.url.replace(/\/$/, "");
    if (exactLocator || patterns.some((pattern) => pattern.test(`${evidence.title} ${evidence.scope}`))) records.push({
      kind: "evidence", id: evidence.id, label: evidence.title,
      basis: exactLocator ? "The update URL matches this evidence locator. Review the new text and version." : "Shared explicit topic with this evidence reference; no applicability conclusion.",
    });
  }
  for (const input of project.blueprint.unresolvedInputs) {
    if (patterns.some((pattern) => pattern.test(`${input.question} ${input.impact}`))) records.push({
      kind: "unresolved-input", id: input.id, label: input.question,
      basis: "Shared explicit topic with this unresolved decision input; review whether the official text changes its basis.",
    });
  }
  for (const assumption of project.blueprint.assumptions) {
    if (patterns.some((pattern) => pattern.test(`${assumption.label} ${assumption.value} ${assumption.source}`))) records.push({
      kind: "assumption", id: assumption.id, label: assumption.label,
      basis: "Shared explicit topic with this model assumption; review the official text before deciding whether to revise it.",
    });
  }
  return {
    status: records.length ? "review" as const : "no-match" as const,
    records,
    message: records.length ? "Potentially related project records require human review. The model and executable rules are unchanged." : "No current affected record identified by this bounded topic/locator match. This does not prove the update is inapplicable.",
  };
}
