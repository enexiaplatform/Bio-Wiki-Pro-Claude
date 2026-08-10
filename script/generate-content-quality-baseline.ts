import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { getContentQuality } from "../shared/content-quality-registry.js";
import { PAID_ASSET_QUALITY } from "../shared/paid-asset-quality.js";
import { totalQualityScore } from "../shared/content-quality.js";
import { DECISION_PACKAGES } from "../shared/decision-packages.js";
import { CAREER_DOMAIN_TRACKS } from "../shared/career-domain-tracks.js";

const root = process.cwd();
const academyDir = path.join(root, "content", "academy");
const outputPath = path.join(root, "docs", "CONTENT_QUALITY_BASELINE.md");

function escapeCell(value: string) {
  return value.replaceAll("|", "\\|").replaceAll("\n", " ");
}

const lessons: Array<{ slug: string; title: string; score: number; status: string; core: boolean; fail: string }> = [];
for (const file of (await readdir(academyDir)).filter((file) => file.endsWith(".en.mdx")).sort()) {
  const { data } = matter(await readFile(path.join(academyDir, file), "utf8"));
  if (data.tier !== "pro") continue;
  const slug = String(data.slug ?? file.replace(/\.en\.mdx$/, ""));
  const title = String(data.title ?? slug);
  const quality = getContentQuality("academy", slug, title, "pro");
  lessons.push({
    slug,
    title,
    score: totalQualityScore(quality.score),
    status: quality.reviewStatus,
    core: quality.strategicCore,
    fail: quality.score.criticalFails.join("; ") || "None",
  });
}

const paidOutputs = PAID_ASSET_QUALITY.filter((asset) => asset.product !== "atlas-pro");
const toolkits = PAID_ASSET_QUALITY.filter((asset) => asset.product === "atlas-pro");
const counts = {
  proLessons: lessons.length,
  coreLessons: lessons.filter((lesson) => lesson.core).length,
  toolkits: toolkits.length,
  paidOutputs: paidOutputs.length,
};

const lines = [
  "# Content Quality Baseline",
  "",
  "> Generated from repository evidence. This is a triage score, not an SME approval. Editorial-reviewed assets remain bounded by their limitations and release gates; no asset is promoted as SME-approved without the required evidence.",
  "",
  `Generated: ${new Date().toISOString().slice(0, 10)}`,
  "",
  `Inventory: ${counts.proLessons} Pro lessons, ${counts.toolkits} Atlas Pro toolkits, ${counts.paidOutputs} paid-output packages.`,
  `Decision intelligence inventory: ${DECISION_PACKAGES.length} Decision Packages, ${CAREER_DOMAIN_TRACKS.length} Career domain tracks; package quality and review records retain explicit editorial, SME and release boundaries.`,
  "",
  `Strategic core: ${counts.coreLessons} lessons; all other paid content is compatibility inventory until reviewed.`,
  "",
  "## Gate interpretation",
  "",
  "- Public evidence: 75/100.",
  "- Promoted Pro lesson or toolkit: 85/100.",
  "- Diagnostic, Blueprint or Career paid output: 90/100.",
  "- Any critical fail blocks release regardless of score.",
  "",
  "## Paid outputs",
  "",
  "| Product | Asset | Score | Review | Critical release blockers |",
  "|---|---|---:|---|---|",
  ...paidOutputs.map((asset) => `| ${asset.product} | ${escapeCell(asset.name)} | ${totalQualityScore(asset.score)} | ${asset.reviewStatus} | ${escapeCell(asset.score.criticalFails.join("; ") || "None")} |`),
  "",
  "## Atlas Pro toolkits",
  "",
  "| Asset | Priority | Score | Review | Critical release blockers |",
  "|---|---|---:|---|---|",
  ...toolkits.map((asset) => `| ${escapeCell(asset.name)} | ${asset.strategicPriority} | ${totalQualityScore(asset.score)} | ${asset.reviewStatus} | ${escapeCell(asset.score.criticalFails.join("; ") || "None")} |`),
  "",
  "## Pro lessons",
  "",
  "| Lesson | Slug | Priority | Score | Review | Critical release blockers |",
  "|---|---|---|---:|---|---|",
  ...lessons.map((lesson) => `| ${escapeCell(lesson.title)} | \`${lesson.slug}\` | ${lesson.core ? "core" : "compatibility"} | ${lesson.score} | ${lesson.status} | ${escapeCell(lesson.fail)} |`),
  "",
  "## Week 1 decision",
  "",
    "No paid asset currently clears its release gate. The repository therefore records editorial review where declared, keeps access bounded by limitations, and prevents any asset from being promoted as SME-approved evidence of paid-product quality. The next release queue is Quality Lab outputs, legacy workflow lessons, and assets requiring qualified reviewers or permissioned real cases.",
  "",
];

await writeFile(outputPath, lines.join("\n"), "utf8");
console.log(`Wrote ${path.relative(root, outputPath)} with ${lessons.length + toolkits.length + paidOutputs.length} paid inventory records.`);
