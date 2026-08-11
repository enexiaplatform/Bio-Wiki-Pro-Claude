import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import {
  CONTENT_QUALITY_REGISTRY,
  CONTENT_QUIZ_V2_REGISTRY,
  EVIDENCE_SOURCE_CATALOG,
} from "../shared/content-quality-registry.js";
import { PAID_ASSET_QUALITY } from "../shared/paid-asset-quality.js";
import { passesQualityGate, totalQualityScore } from "../shared/content-quality.js";
import { BIOPHARMA_CONTENT_MAP } from "../shared/biopharma-content-map.js";
import { MANUFACTURING_QUALITY_PORTFOLIO } from "../shared/manufacturing-quality-portfolio.js";
import { DECISION_PACKAGES, validateDecisionPackages } from "../shared/decision-packages.js";
import { CAREER_DOMAIN_TRACKS, validateCareerDomainTracks } from "../shared/career-domain-tracks.js";
import { workflowSystems } from "../client/src/data/workflowSystems.js";
import { workflows } from "../client/src/data/workflows.js";
import { TOOL_CATALOG } from "../client/src/data/tools/catalog.js";
import { toolkits } from "../client/src/data/toolkits.js";
import { DELIVERABLES } from "../server/deliverables.js";

const root = process.cwd();
const errors: string[] = [];
const warnings: string[] = [];
const sourceMap = new Map(EVIDENCE_SOURCE_CATALOG.sources.map((source) => [source.id, source]));

function validateSourceIds(owner: string, sourceIds: string[]) {
  for (const sourceId of sourceIds) {
    const source = sourceMap.get(sourceId);
    if (!source) errors.push(`${owner}: unknown sourceId ${sourceId}`);
    if (source?.lifecycleStatus === "expired" || source?.lifecycleStatus === "superseded") {
      errors.push(`${owner}: ${sourceId} is ${source.lifecycleStatus} and cannot be represented as current`);
    }
  }
}

async function validateRegistry() {
  for (const error of validateDecisionPackages()) errors.push(error);
  for (const error of validateCareerDomainTracks()) errors.push(error);
  if (CAREER_DOMAIN_TRACKS.length !== 3) errors.push(`career domain tracks: expected three lifecycle tracks, found ${CAREER_DOMAIN_TRACKS.length}`);
  const packageIds = new Set(DECISION_PACKAGES.map((item) => item.id));
  const stageKeys = new Set(workflowSystems.flatMap((system) => system.stages.map((stage) => `${system.id}:${stage.id}`)));
  const workflowSlugs = new Set(workflows.map((item) => item.slug));
  const toolSlugs = new Set(TOOL_CATALOG.map((item) => item.slug));
  const toolkitSlugs = new Set(toolkits.map((item) => item.slug));
  const toolkitBySlug = new Map(toolkits.map((item) => [item.slug, item]));
  const deliverableDirs = new Set(Object.values(DELIVERABLES).map((item) => item.dir));
  const paidAssetIds = new Set(PAID_ASSET_QUALITY.map((item) => item.id));
  const blogSlugs = new Set((await readdir(path.join(root, "content", "blog"))).filter((file) => file.endsWith(".en.mdx")).map((file) => file.replace(/\.en\.mdx$/, "")));
  const academySlugs = new Set((await readdir(path.join(root, "content", "academy"))).filter((file) => file.endsWith(".en.mdx")).map((file) => file.replace(/\.en\.mdx$/, "")));
  for (const item of DECISION_PACKAGES) {
    validateSourceIds(`decision package ${item.id}`, item.sourceIds);
    for (const stage of item.stageRefs) if (!stageKeys.has(`${stage.systemId}:${stage.stageId}`)) errors.push(`decision package ${item.id}: unknown stage ${stage.systemId}:${stage.stageId}`);
    if (!item.applicability.trim()) errors.push(`decision package ${item.id}: applicability is required`);
    if (item.limitations.length === 0) errors.push(`decision package ${item.id}: limitations are required`);
    if (item.reviewerRoles.length === 0) errors.push(`decision package ${item.id}: reviewer roles are required`);
    for (const destination of ["public", "pro", "quality-lab", "career"] as const) {
      if (!item.productDestinations.includes(destination)) errors.push(`decision package ${item.id}: missing product binding ${destination}`);
    }
    const assetSlugs = new Set(item.assetRefs.map((asset) => asset.slug));
    for (const asset of item.assetRefs) {
      const exists = asset.kind === "guide" ? blogSlugs.has(asset.slug)
        : asset.kind === "academy" ? academySlugs.has(asset.slug)
          : asset.kind === "workflow" ? workflowSlugs.has(asset.slug)
            : asset.kind === "tool" ? toolSlugs.has(asset.slug)
                : asset.kind === "toolkit" ? toolkitSlugs.has(asset.slug)
                : false;
      if (!exists) errors.push(`decision package ${item.id}: orphan ${asset.kind} asset ${asset.slug}`);
      if (asset.kind === "toolkit") {
        const toolkit = toolkitBySlug.get(asset.slug);
        if (toolkit?.status !== "available") errors.push(`decision package ${item.id}: toolkit ${asset.slug} must be available for an existing asset reference`);
        if (!deliverableDirs.has(asset.slug)) errors.push(`decision package ${item.id}: toolkit ${asset.slug} has no repository deliverable directory`);
      }
    }
    try {
      const reviewPacket = await readFile(path.join(root, item.reviewPacketPath), "utf8");
      for (const required of ["editorial-reviewed", "reviewer", "source", "bound"]) {
        if (!reviewPacket.toLowerCase().includes(required.toLowerCase())) errors.push(`decision package ${item.id}: review packet missing ${required}`);
      }
    } catch {
      errors.push(`decision package ${item.id}: review packet not found at ${item.reviewPacketPath}`);
    }
    for (const artifact of item.artifactPlan) if (artifact.assetRef && !assetSlugs.has(artifact.assetRef)) errors.push(`decision package ${item.id}: artifact ${artifact.kind} references orphan asset ${artifact.assetRef}`);
    const artifactKinds = new Set(item.artifactPlan.map((artifact) => artifact.kind));
    for (const kind of ["public-guide", "pro-lesson", "workflow-or-tool", "working-asset", "fictional-example", "review-packet"] as const) {
      if (!artifactKinds.has(kind)) errors.push(`decision package ${item.id}: artifact plan is missing ${kind}`);
    }
    const proLessonRef = item.artifactPlan.find((artifact) => artifact.kind === "pro-lesson")?.assetRef;
    if (!proLessonRef) {
      errors.push(`decision package ${item.id}: Pro lesson artifact must reference an academy slug`);
    } else {
      const lessonQuality = CONTENT_QUALITY_REGISTRY[`academy/${proLessonRef}`];
      if (!lessonQuality) errors.push(`decision package ${item.id}: Pro lesson ${proLessonRef} has no content quality record`);
      else if (lessonQuality.reviewStatus !== item.reviewStatus) errors.push(`decision package ${item.id}: Pro lesson ${proLessonRef} review status does not match package status`);
    }
    const workingAssetRef = item.artifactPlan.find((artifact) => artifact.kind === "working-asset")?.assetRef;
    if (!workingAssetRef) {
      errors.push(`decision package ${item.id}: working asset artifact must reference an asset id`);
    } else {
      const assetQuality = PAID_ASSET_QUALITY.find((asset) => asset.id === workingAssetRef);
      if (!assetQuality) errors.push(`decision package ${item.id}: working asset ${workingAssetRef} has no paid-asset quality record`);
      else if (assetQuality.reviewStatus !== item.reviewStatus) errors.push(`decision package ${item.id}: working asset ${workingAssetRef} review status does not match package status`);
    }
  }
  const sourceIds = new Set<string>();
  for (const source of EVIDENCE_SOURCE_CATALOG.sources) {
    if (sourceIds.has(source.id)) errors.push(`source catalog: duplicate id ${source.id}`);
    sourceIds.add(source.id);
    if (source.verificationStatus === "verified" && !source.verifiedAt) errors.push(`source catalog: ${source.id} is verified without verifiedAt`);
    if (source.lifecycleStatus === "current" && source.verificationStatus === "pending") warnings.push(`source catalog: ${source.id} is current but pending verification`);
  }

  for (const [key, quality] of Object.entries(CONTENT_QUALITY_REGISTRY)) {
    validateSourceIds(key, quality.sourceIds);
    if (quality.reviewStatus !== "under-review" && (!quality.lastReviewedAt || !quality.reviewDueAt || quality.reviewerRoles.length === 0)) {
      errors.push(`${key}: reviewed content requires review dates and reviewer roles`);
    }
    if (quality.promoted && (!passesQualityGate(quality.score, "pro") || quality.reviewStatus === "under-review")) {
      errors.push(`${key}: promoted Pro content must pass 85 with no critical fail and recorded review`);
    }
    if (quality.promoted && quality.riskLevel === "high" && quality.reviewStatus !== "sme-reviewed") {
      errors.push(`${key}: high-risk content cannot be promoted before SME review`);
    }
    if (quality.strategicCore) {
      const questions = CONTENT_QUIZ_V2_REGISTRY[key];
      if (!questions || questions.length !== 4) errors.push(`${key}: strategic core lesson requires exactly four quiz v2 questions`);
      if (questions) {
        const types = new Set(questions.map((question) => question.type));
        for (const type of ["concept", "applicability", "scenario", "evidence-action"]) {
          if (!types.has(type as never)) errors.push(`${key}: quiz is missing ${type}`);
        }
        questions.forEach((question, index) => validateSourceIds(`${key} quiz ${index + 1}`, question.sourceIds));
      }
    }
  }

  const positions = [0, 0, 0, 0];
  Object.values(CONTENT_QUIZ_V2_REGISTRY).flat().forEach((question) => positions[question.answer] += 1);
  if (Math.max(...positions) - Math.min(...positions) > 1) errors.push(`quiz v2: answer-position distribution is skewed (${positions.join(", ")})`);

  for (const asset of PAID_ASSET_QUALITY) {
    const score = totalQualityScore(asset.score);
    if (asset.reviewStatus === "under-review" && asset.strategicPriority === "core") warnings.push(`${asset.id}: core paid asset remains under review (${score}/100)`);
    if (asset.reviewStatus === "editorial-reviewed" && !passesQualityGate(asset.score, asset.assetClass)) warnings.push(`${asset.id}: editorially reviewed but release gate remains open (${score}/100)`);
    if (asset.reviewStatus === "sme-reviewed" && !passesQualityGate(asset.score, asset.assetClass)) errors.push(`${asset.id}: SME-reviewed asset does not pass its ${asset.assetClass} gate`);
  }

  const lessonKeys = new Set(Object.keys(CONTENT_QUALITY_REGISTRY).map((key) => key.replace(/^academy\//, "")));
  for (const area of BIOPHARMA_CONTENT_MAP) {
    validateSourceIds(`biopharma coverage ${area.id}`, area.sourceIds);
    if (area.materialGaps.length === 0) errors.push(`biopharma coverage ${area.id}: material gaps must be explicit`);
    if (area.requiredReviewerRoles.length === 0) errors.push(`biopharma coverage ${area.id}: reviewer roles must be explicit`);
    if (area.status === "not-covered" && area.currentLessonSlugs.length > 0) errors.push(`biopharma coverage ${area.id}: not-covered area cannot claim current lessons`);
    if (area.status === "covered-under-review" && !area.currentLessonSlugs.some((slug) => lessonKeys.has(slug))) errors.push(`biopharma coverage ${area.id}: at least one current lesson requires quality registration`);
    for (const slug of area.currentLessonSlugs) {
      const academyFile = path.join(root, "content", "academy", `${slug}.en.mdx`);
      try {
        await access(academyFile);
      } catch {
        errors.push(`biopharma coverage ${area.id}: lesson ${slug} is missing`);
      }
    }
  }

  const portfolioAreaIds = new Set<string>();
  for (const lane of MANUFACTURING_QUALITY_PORTFOLIO) {
    if (lane.compilerDomainPackReady !== false) errors.push(`manufacturing portfolio ${lane.id}: Compiler Domain Pack readiness must stay evidence-gated`);
    for (const area of lane.areas) {
      const areaKey = `${lane.id}/${area.id}`;
      if (portfolioAreaIds.has(areaKey)) errors.push(`manufacturing portfolio: duplicate area ${areaKey}`);
      portfolioAreaIds.add(areaKey);
      validateSourceIds(`manufacturing portfolio ${areaKey}`, area.sourceIds);
      for (const packageId of area.decisionPackageIds) if (!packageIds.has(packageId)) errors.push(`manufacturing portfolio ${areaKey}: unknown decision package ${packageId}`);
      if (area.status !== "not-covered" && area.decisionPackageIds.length === 0) errors.push(`manufacturing portfolio ${areaKey}: covered or reviewable area requires a decision package link`);
      if (area.materialGaps.length === 0) errors.push(`manufacturing portfolio ${areaKey}: material gaps must be explicit`);
      if (area.requiredReviewerRoles.length === 0) errors.push(`manufacturing portfolio ${areaKey}: reviewer roles must be explicit`);
      if (area.status === "not-covered" && (area.currentLessonSlugs.length > 0 || area.currentAssetIds.length > 0)) errors.push(`manufacturing portfolio ${areaKey}: not-covered area cannot claim current assets`);
      if (area.status === "covered-under-review" && area.currentAssetIds.length === 0) errors.push(`manufacturing portfolio ${areaKey}: covered area requires a repository-backed working asset`);
      for (const assetId of area.currentAssetIds) {
        if (!paidAssetIds.has(assetId)) errors.push(`manufacturing portfolio ${areaKey}: asset ${assetId} has no paid-asset quality record`);
        if (toolkitBySlug.get(assetId)?.status !== "available") errors.push(`manufacturing portfolio ${areaKey}: asset ${assetId} is not an available toolkit`);
        if (!deliverableDirs.has(assetId)) errors.push(`manufacturing portfolio ${areaKey}: asset ${assetId} has no repository deliverable directory`);
      }
      for (const slug of area.currentLessonSlugs) {
        try {
          await access(path.join(root, "content", "academy", `${slug}.en.mdx`));
        } catch {
          errors.push(`manufacturing portfolio ${areaKey}: lesson ${slug} is missing`);
        }
      }
    }
  }
}

async function validateFiles() {
  const academyDir = path.join(root, "content", "academy");
  const files = await readdir(academyDir);
  for (const file of files.filter((file) => file.endsWith(".en.mdx"))) {
    const raw = await readFile(path.join(academyDir, file), "utf8");
    const { data } = matter(raw);
    const key = `academy/${data.slug ?? file.replace(/\.en\.mdx$/, "")}`;
    const quality = CONTENT_QUALITY_REGISTRY[key];
    if (data.tier === "pro" && !quality) warnings.push(`${key}: legacy Pro lesson defaults to Under review and is excluded from promotion`);
  }

  for (const asset of PAID_ASSET_QUALITY.filter((asset) => asset.product === "atlas-pro")) {
    const toolkitDir = path.join(root, "content", "deliverables", asset.id);
    try {
      await access(toolkitDir);
    } catch {
      errors.push(`${asset.id}: deliverable directory is missing`);
    }
  }

  const oosLesson = await readFile(path.join(academyDir, "oos-investigation-deep-dive.en.mdx"), "utf8");
  for (const section of ["## Decision question", "## Applicability and do-not-use boundary", "## Controlled source map", "## Decision table", "## Worked example"]) {
    if (!oosLesson.includes(section)) errors.push(`academy/oos-investigation-deep-dive: missing required section ${section}`);
  }
  for (const unsafeClaim of ["complete, inspection-ready", "30 days is common industry practice", "FDA OOS Guidance (2006)"]) {
    if (oosLesson.toLowerCase().includes(unsafeClaim.toLowerCase())) errors.push(`academy/oos-investigation-deep-dive: stale or unsupported claim remains: ${unsafeClaim}`);
  }

  const oosDir = path.join(root, "content", "deliverables", "oos-investigation-template");
  const oosReadme = await readFile(path.join(oosDir, "README.md"), "utf8");
  for (const required of ["2.1.0-review", "oos-investigation-v2.xlsx", "oos-investigation-v2-fictional-example.xlsx", "FDA-OOS-2022", "Decision owner"]) {
    if (!oosReadme.includes(required)) errors.push(`oos-investigation-template README: missing ${required}`);
  }
  const reviewPacket = await readFile(path.join(root, "docs", "content-reviews", "OOS_WORKFLOW_2_1_REVIEW_PACKET.md"), "utf8");
for (const required of ["editorial-reviewed", "FDA-OOS-2022", "EU-GMP-CH6-2014", "ICH-Q9-R1", "ICH-Q10", "Critical review checklist", "Review record"]) {
    if (!reviewPacket.includes(required)) errors.push(`OOS review packet: missing ${required}`);
  }

  const biopharmaLesson = await readFile(path.join(academyDir, "biopharma-product-process-control-strategy.en.mdx"), "utf8");
  for (const section of ["## Decision question", "## Applicability and do-not-use boundary", "## Controlled source map", "## The product-process evidence chain", "## Decision table", "## Worked example", "## Limitations"]) {
    if (!biopharmaLesson.includes(section)) errors.push(`academy/biopharma-product-process-control-strategy: missing required section ${section}`);
  }
  for (const unsafeClaim of ["the process defines the product", "release testing proves", "universal CPP", "inspection-ready"]) {
    if (biopharmaLesson.toLowerCase().includes(unsafeClaim.toLowerCase())) errors.push(`academy/biopharma-product-process-control-strategy: unsupported shortcut remains: ${unsafeClaim}`);
  }
  const comparabilityLesson = await readFile(path.join(academyDir, "biopharma-manufacturing-comparability.en.mdx"), "utf8");
  for (const section of ["## Decision question", "## Applicability and do-not-use boundary", "## Controlled source map", "## Build the change-to-evidence map", "## Decision table", "## Worked example", "## Limitations"]) {
    if (!comparabilityLesson.includes(section)) errors.push(`academy/biopharma-manufacturing-comparability: missing required section ${section}`);
  }
  for (const requiredBoundary of ["do not need to be analytically identical", "passing release specifications alone establishes comparability", "a biosimilarity assessment", "do not invent a universal number of batches"]) {
    if (!comparabilityLesson.toLowerCase().includes(requiredBoundary.toLowerCase())) errors.push(`academy/biopharma-manufacturing-comparability: missing boundary ${requiredBoundary}`);
  }

  const upstreamLesson = await readFile(path.join(academyDir, "biopharma-upstream-process-control.en.mdx"), "utf8");
  for (const section of ["## Decision question", "## Applicability and do-not-use boundary", "## Controlled source map", "## Separate four kinds of information", "## Build the upstream evidence chain", "## Decision table", "## Worked example", "## Working asset", "## Limitations"]) {
    if (!upstreamLesson.includes(section)) errors.push(`academy/biopharma-upstream-process-control: missing required section ${section}`);
  }
  for (const requiredBoundary of ["not a universal list of bioreactor parameters", "do not convert a development range", "range or criterion reference", "does not establish causality from trend association"]) {
    if (!upstreamLesson.toLowerCase().includes(requiredBoundary.toLowerCase())) errors.push(`academy/biopharma-upstream-process-control: missing boundary ${requiredBoundary}`);
  }
  for (const unsafeClaim of ["universal cpp list", "inspection-ready", "release attributes prove no impact"]) {
    if (upstreamLesson.toLowerCase().includes(unsafeClaim.toLowerCase())) errors.push(`academy/biopharma-upstream-process-control: unsupported shortcut remains: ${unsafeClaim}`);
  }

  const upstreamDir = path.join(root, "content", "deliverables", "biopharma-upstream-control");
  const upstreamReadme = await readFile(path.join(upstreamDir, "README.md"), "utf8");
  for (const required of ["1.0.0-review", "biopharma-upstream-control-v1.xlsx", "biopharma-upstream-control-v1-fictional-example.xlsx", "ICH-Q8-R2", "ICH-Q11", "Decision owner", "no generic numeric operating range"]) {
    if (!upstreamReadme.toLowerCase().includes(required.toLowerCase())) errors.push(`biopharma-upstream-control README: missing ${required}`);
  }
  for (const filename of ["biopharma-upstream-control-guide.md", "biopharma-upstream-control-v1.xlsx", "biopharma-upstream-control-v1-fictional-example.xlsx"]) {
    try {
      await access(path.join(upstreamDir, filename));
    } catch {
      errors.push(`biopharma-upstream-control: missing ${filename}`);
    }
  }
  const upstreamReviewPacket = await readFile(path.join(root, "docs", "content-reviews", "BIOPHARMA_UPSTREAM_CONTROL_1_0_REVIEW_PACKET.md"), "utf8");
  for (const required of ["editorial-reviewed", "ICH-Q8-R2", "ICH-Q11", "FDA-PROCESS-VALIDATION-2011", "Critical review checklist", "Workbook usability acceptance", "Open evidence and product backlog", "Review record"]) {
    if (!upstreamReviewPacket.includes(required)) errors.push(`Biopharma upstream review packet: missing ${required}`);
  }

  const downstreamLesson = await readFile(path.join(academyDir, "biopharma-downstream-purification-clearance.en.mdx"), "utf8");
  for (const section of ["## Decision question", "## Applicability and do-not-use boundary", "## Controlled source map", "## Separate four kinds of downstream claim", "## Build the downstream evidence chain", "## Decision table", "## Worked example", "## Working asset", "## Limitations"]) {
    if (!downstreamLesson.includes(section)) errors.push(`academy/biopharma-downstream-purification-clearance: missing required section ${section}`);
  }
  for (const requiredBoundary of ["not a sequence of equipment names", "cannot be inferred from routine impurity clearance alone", "does not calculate or recommend a viral-reduction factor", "final conformance proves unchanged process robustness"]) {
    if (!downstreamLesson.toLowerCase().includes(requiredBoundary.toLowerCase())) errors.push(`academy/biopharma-downstream-purification-clearance: missing boundary ${requiredBoundary}`);
  }
  for (const unsafeClaim of ["typical log reduction", "universal purification platform", "inspection-ready"]) {
    if (downstreamLesson.toLowerCase().includes(unsafeClaim.toLowerCase())) errors.push(`academy/biopharma-downstream-purification-clearance: unsupported shortcut remains: ${unsafeClaim}`);
  }

  const downstreamDir = path.join(root, "content", "deliverables", "biopharma-downstream-clearance");
  const downstreamReadme = await readFile(path.join(downstreamDir, "README.md"), "utf8");
  for (const required of ["1.0.0-review", "biopharma-downstream-clearance-v1.xlsx", "biopharma-downstream-clearance-v1-fictional-example.xlsx", "ICH-Q5A-R2", "ICH-Q11", "Decision owner", "no generic operating range"]) {
    if (!downstreamReadme.toLowerCase().includes(required.toLowerCase())) errors.push(`biopharma-downstream-clearance README: missing ${required}`);
  }
  for (const filename of ["biopharma-downstream-clearance-guide.md", "biopharma-downstream-clearance-v1.xlsx", "biopharma-downstream-clearance-v1-fictional-example.xlsx"]) {
    try {
      await access(path.join(downstreamDir, filename));
    } catch {
      errors.push(`biopharma-downstream-clearance: missing ${filename}`);
    }
  }
  const downstreamReviewPacket = await readFile(path.join(root, "docs", "content-reviews", "BIOPHARMA_DOWNSTREAM_CLEARANCE_1_0_REVIEW_PACKET.md"), "utf8");
for (const required of ["editorial-reviewed", "ICH-Q5A-R2", "ICH-Q11", "ICH-Q6B", "FDA-PROCESS-VALIDATION-2011", "Critical review checklist", "Workbook usability acceptance", "Open evidence and product backlog", "Review record"]) {
    if (!downstreamReviewPacket.includes(required)) errors.push(`Biopharma downstream review packet: missing ${required}`);
  }

  const formulationLesson = await readFile(path.join(academyDir, "biopharma-formulation-fill-finish-stability.en.mdx"), "utf8");
  for (const section of ["## Decision question", "## Applicability and do-not-use boundary", "## Controlled source map", "## Separate five evidence objects", "## Build the formulation-to-stability evidence chain", "## Decision table", "## Worked example", "## Working asset", "## Limitations"]) {
    if (!formulationLesson.includes(section)) errors.push(`academy/biopharma-formulation-fill-finish-stability: missing required section ${section}`);
  }
  for (const requiredBoundary of ["not a chamber schedule followed by a shelf-life number", "Sterility assurance and molecular stability are connected but distinct evidence systems", "supplies no default condition or testing schedule", "release conformance proves unchanged stability", "draft guideline"] ) {
    if (!formulationLesson.toLowerCase().includes(requiredBoundary.toLowerCase())) errors.push(`academy/biopharma-formulation-fill-finish-stability: missing boundary ${requiredBoundary}`);
  }
  for (const unsafeClaim of ["accelerated data proves shelf life", "sterility testing proves stability", "platform formulation is validated", "inspection-ready"]) {
    if (formulationLesson.toLowerCase().includes(unsafeClaim.toLowerCase())) errors.push(`academy/biopharma-formulation-fill-finish-stability: unsupported shortcut remains: ${unsafeClaim}`);
  }

  const formulationDir = path.join(root, "content", "deliverables", "biopharma-formulation-stability");
  const formulationReadme = await readFile(path.join(formulationDir, "README.md"), "utf8");
  for (const required of ["1.0.0-review", "biopharma-formulation-stability-v1.xlsx", "biopharma-formulation-stability-v1-fictional-example.xlsx", "ICH-Q5C", "ICH-Q1A-R2", "EU-GMP-ANNEX1-2022", "Decision owner", "no platform formulation", "no generic operating range"]) {
    if (!formulationReadme.toLowerCase().includes(required.toLowerCase())) errors.push(`biopharma-formulation-stability README: missing ${required}`);
  }
  for (const filename of ["biopharma-formulation-stability-guide.md", "biopharma-formulation-stability-v1.xlsx", "biopharma-formulation-stability-v1-fictional-example.xlsx"]) {
    try {
      await access(path.join(formulationDir, filename));
    } catch {
      errors.push(`biopharma-formulation-stability: missing ${filename}`);
    }
  }
  const formulationReviewPacket = await readFile(path.join(root, "docs", "content-reviews", "BIOPHARMA_FORMULATION_STABILITY_1_0_REVIEW_PACKET.md"), "utf8");
  for (const required of ["editorial-reviewed", "ICH-Q5C", "ICH-Q1A-R2", "ICH-Q1B", "EU-GMP-ANNEX1-2022", "FDA-CONTAINER-CLOSURE-1999", "Critical review checklist", "Workbook usability acceptance", "Open evidence and product backlog", "Review record"]) {
    if (!formulationReviewPacket.includes(required)) errors.push(`Biopharma formulation/stability review packet: missing ${required}`);
  }

  const analyticalLesson = await readFile(path.join(academyDir, "biopharma-integrated-analytical-control-strategy.en.mdx"), "utf8");
  for (const section of ["## Decision question", "## Applicability and do-not-use boundary", "## Controlled source map", "## Separate seven evidence objects", "## Build the attribute-to-decision evidence chain", "## Decision table", "## Worked example", "## Working asset", "## Limitations"]) {
    if (!analyticalLesson.includes(section)) errors.push(`academy/biopharma-integrated-analytical-control-strategy: missing required section ${section}`);
  }
  for (const requiredBoundary of ["not a list of instruments or a release specification", "Specification conformance is not full product characterization", "supplies no default specification or acceptance criterion", "Q6(R1) concept paper as an effective revised guideline", "international or national biological standard"] ) {
    if (!analyticalLesson.toLowerCase().includes(requiredBoundary.toLowerCase())) errors.push(`academy/biopharma-integrated-analytical-control-strategy: missing boundary ${requiredBoundary}`);
  }
  for (const unsafeClaim of ["validated method proves product quality", "international standard proves product suitability", "release conformance proves comparability", "inspection-ready"]) {
    if (analyticalLesson.toLowerCase().includes(unsafeClaim.toLowerCase())) errors.push(`academy/biopharma-integrated-analytical-control-strategy: unsupported shortcut remains: ${unsafeClaim}`);
  }

  const analyticalDir = path.join(root, "content", "deliverables", "biopharma-analytical-control-strategy");
  const analyticalReadme = await readFile(path.join(analyticalDir, "README.md"), "utf8");
  for (const required of ["1.0.0-review", "biopharma-analytical-control-strategy-v1.xlsx", "biopharma-analytical-control-strategy-v1-fictional-example.xlsx", "ICH-Q6B", "ICH-Q6-R1-CONCEPT-2024", "WHO-IBRS-2026", "Decision owner", "no universal analytical panel", "no product-specific specification"]) {
    if (!analyticalReadme.toLowerCase().includes(required.toLowerCase())) errors.push(`biopharma-analytical-control-strategy README: missing ${required}`);
  }
  for (const filename of ["biopharma-analytical-control-strategy-guide.md", "biopharma-analytical-control-strategy-v1.xlsx", "biopharma-analytical-control-strategy-v1-fictional-example.xlsx"]) {
    try {
      await access(path.join(analyticalDir, filename));
    } catch {
      errors.push(`biopharma-analytical-control-strategy: missing ${filename}`);
    }
  }
  const analyticalReviewPacket = await readFile(path.join(root, "docs", "content-reviews", "BIOPHARMA_ANALYTICAL_CONTROL_STRATEGY_1_0_REVIEW_PACKET.md"), "utf8");
for (const required of ["editorial-reviewed", "ICH-Q6B", "ICH-Q6-R1-CONCEPT-2024", "ICH-Q2-R2", "ICH-Q14", "WHO-IBRS-2026", "Critical review checklist", "Workbook usability acceptance", "Open evidence and product backlog", "Review record"]) {
    if (!analyticalReviewPacket.includes(required)) errors.push(`Biopharma analytical control-strategy review packet: missing ${required}`);
  }

  const technologyTransferLesson = await readFile(path.join(academyDir, "biopharma-integrated-technology-transfer.en.mdx"), "utf8");
  for (const section of ["## Decision question", "## Applicability and do-not-use boundary", "## Controlled source map", "## Separate eight transfer evidence objects", "## Build the transfer evidence chain", "## Decision table", "## Worked example", "## Working asset", "## Limitations"]) {
    if (!technologyTransferLesson.includes(section)) errors.push(`academy/biopharma-integrated-technology-transfer: missing required section ${section}`);
  }
  for (const requiredBoundary of ["not a document handoff", "Protocol completion is not successful transfer", "related but distinct decisions", "Site equivalence does not mean literal equipment sameness", "do not invent a universal number of batches"]) {
    if (!technologyTransferLesson.toLowerCase().includes(requiredBoundary.toLowerCase())) errors.push(`academy/biopharma-integrated-technology-transfer: missing boundary ${requiredBoundary}`);
  }
  for (const unsafeClaim of ["three validation batches are required", "release tests prove successful transfer", "equipment identity proves equivalence", "inspection-ready"]) {
    if (technologyTransferLesson.toLowerCase().includes(unsafeClaim.toLowerCase())) errors.push(`academy/biopharma-integrated-technology-transfer: unsupported shortcut remains: ${unsafeClaim}`);
  }

  const technologyTransferDir = path.join(root, "content", "deliverables", "biopharma-technology-transfer");
  const technologyTransferReadme = await readFile(path.join(technologyTransferDir, "README.md"), "utf8");
  for (const required of ["1.0.0-review", "biopharma-technology-transfer-v1.xlsx", "biopharma-technology-transfer-v1-fictional-example.xlsx", "WHO-TRS-1044-ANNEX4", "ICH-Q5E", "ICH-Q14", "Decision owner", "Protocol completion is not successful transfer", "no product-specific process"]) {
    if (!technologyTransferReadme.toLowerCase().includes(required.toLowerCase())) errors.push(`biopharma-technology-transfer README: missing ${required}`);
  }
  for (const filename of ["biopharma-technology-transfer-guide.md", "biopharma-technology-transfer-v1.xlsx", "biopharma-technology-transfer-v1-fictional-example.xlsx"]) {
    try {
      await access(path.join(technologyTransferDir, filename));
    } catch {
      errors.push(`biopharma-technology-transfer: missing ${filename}`);
    }
  }
  const technologyTransferReviewPacket = await readFile(path.join(root, "docs", "content-reviews", "BIOPHARMA_TECHNOLOGY_TRANSFER_1_0_REVIEW_PACKET.md"), "utf8");
for (const required of ["editorial-reviewed", "WHO-TRS-1044-ANNEX4", "ICH-Q10", "ICH-Q5E", "ICH-Q2-R2", "ICH-Q14", "FDA-PROCESS-VALIDATION-2011", "Critical review checklist", "Workbook usability acceptance", "Open evidence and product backlog", "Review record"]) {
    if (!technologyTransferReviewPacket.includes(required)) errors.push(`Biopharma technology-transfer review packet: missing ${required}`);
  }

  const materialsLesson = await readFile(path.join(academyDir, "biopharma-raw-ancillary-materials-control.en.mdx"), "utf8");
  for (const section of ["## Decision question", "## Applicability and do-not-use boundary", "## Controlled source map", "## Separate eight material evidence objects", "## Build the material evidence chain", "## Decision table", "## Worked example", "## Working asset", "## Limitations"]) {
    if (!materialsLesson.includes(section)) errors.push(`academy/biopharma-raw-ancillary-materials-control: missing required section ${section}`);
  }
  for (const requiredBoundary of ["not the same as supplier approval", "related but distinct decisions", "An approved supplier is not automatic approval", "Vendor extractables studies", "supplies no product-specific specification"]) {
    if (!materialsLesson.toLowerCase().includes(requiredBoundary.toLowerCase())) errors.push(`academy/biopharma-raw-ancillary-materials-control: missing boundary ${requiredBoundary}`);
  }
  for (const unsafeClaim of ["same specification proves equivalence", "sterilization certificate proves sterility assurance", "approved supplier proves material suitability", "inspection-ready"]) {
    if (materialsLesson.toLowerCase().includes(unsafeClaim.toLowerCase())) errors.push(`academy/biopharma-raw-ancillary-materials-control: unsupported shortcut remains: ${unsafeClaim}`);
  }

  const materialsDir = path.join(root, "content", "deliverables", "biopharma-materials-control");
  const materialsReadme = await readFile(path.join(materialsDir, "README.md"), "utf8");
  for (const required of ["1.0.0-review", "biopharma-materials-control-v1.xlsx", "biopharma-materials-control-v1-fictional-example.xlsx", "WHO-TRS-996-ANNEX3", "ICH-Q11", "EU-GMP-ANNEX1-2022", "Decision owner", "Vendor extractables data is not a product-specific leachables conclusion", "no product-specific specification"]) {
    if (!materialsReadme.toLowerCase().includes(required.toLowerCase())) errors.push(`biopharma-materials-control README: missing ${required}`);
  }
  for (const filename of ["biopharma-materials-control-guide.md", "biopharma-materials-control-v1.xlsx", "biopharma-materials-control-v1-fictional-example.xlsx"]) {
    try {
      await access(path.join(materialsDir, filename));
    } catch {
      errors.push(`biopharma-materials-control: missing ${filename}`);
    }
  }
  const materialsReviewPacket = await readFile(path.join(root, "docs", "content-reviews", "BIOPHARMA_MATERIALS_CONTROL_1_0_REVIEW_PACKET.md"), "utf8");
  for (const required of ["editorial-reviewed", "ICH-Q11", "ICH-Q5A-R2", "ICH-Q5E", "EU-GMP-ANNEX1-2022", "WHO-TRS-996-ANNEX3", "FDA-QUALITY-AGREEMENTS-2016", "Critical review checklist", "Workbook usability acceptance", "Open evidence and product backlog", "Review record"]) {
    if (!materialsReviewPacket.includes(required)) errors.push(`Biopharma materials-control review packet: missing ${required}`);
  }

  const cellSubstrateLesson = await readFile(path.join(academyDir, "biopharma-cell-line-cell-bank-genetic-stability.en.mdx"), "utf8");
  for (const section of ["## Decision question", "## Applicability and do-not-use boundary", "## Controlled source map", "## Separate eight cell-substrate evidence objects", "## Build the cell-substrate evidence chain", "## Decision table", "## Worked example", "## Working asset", "## Limitations"]) {
    if (!cellSubstrateLesson.includes(section)) errors.push(`academy/biopharma-cell-line-cell-bank-genetic-stability: missing required section ${section}`);
  }
  for (const requiredBoundary of ["not merely a vial", "related but distinct decisions", "An intact coding sequence does not by itself establish", "No single experimental approach detects every possible", "supplies no host, vector, construct"]) {
    if (!cellSubstrateLesson.toLowerCase().includes(requiredBoundary.toLowerCase())) errors.push(`academy/biopharma-cell-line-cell-bank-genetic-stability: missing boundary ${requiredBoundary}`);
  }
  for (const unsafeClaim of ["same master cell bank proves equivalence", "coding sequence proves genetic stability", "bank manufacture proves bank release", "inspection-ready"]) {
    if (cellSubstrateLesson.toLowerCase().includes(unsafeClaim.toLowerCase())) errors.push(`academy/biopharma-cell-line-cell-bank-genetic-stability: unsupported shortcut remains: ${unsafeClaim}`);
  }

  const cellSubstrateDir = path.join(root, "content", "deliverables", "biopharma-cell-substrate-control");
  const cellSubstrateReadme = await readFile(path.join(cellSubstrateDir, "README.md"), "utf8");
  for (const required of ["1.0.0-review", "biopharma-cell-substrate-control-v1.xlsx", "biopharma-cell-substrate-control-v1-fictional-example.xlsx", "ICH-Q5D", "ICH-Q5B", "WHO-TRS-978-ANNEX3", "Decision owner", "An intact coding sequence does not by itself establish", "Bank manufacture completion is not bank release"]) {
    if (!cellSubstrateReadme.toLowerCase().includes(required.toLowerCase())) errors.push(`biopharma-cell-substrate-control README: missing ${required}`);
  }
  for (const filename of ["biopharma-cell-substrate-control-guide.md", "biopharma-cell-substrate-control-v1.xlsx", "biopharma-cell-substrate-control-v1-fictional-example.xlsx"]) {
    try {
      await access(path.join(cellSubstrateDir, filename));
    } catch {
      errors.push(`biopharma-cell-substrate-control: missing ${filename}`);
    }
  }
  const cellSubstrateReviewPacket = await readFile(path.join(root, "docs", "content-reviews", "BIOPHARMA_CELL_SUBSTRATE_CONTROL_1_0_REVIEW_PACKET.md"), "utf8");
for (const required of ["editorial-reviewed", "ICH-Q5D", "ICH-Q5B", "ICH-Q5A-R2", "WHO-TRS-978-ANNEX3", "ICH-Q5E", "Critical review checklist", "Workbook usability acceptance", "Open evidence and product backlog", "Review record"]) {
    if (!cellSubstrateReviewPacket.includes(required)) errors.push(`Biopharma cell-substrate review packet: missing ${required}`);
  }

  const processValidationLesson = await readFile(path.join(academyDir, "biopharma-process-validation-continued-verification.en.mdx"), "utf8");
  for (const section of ["## Decision question", "## Applicability and do-not-use boundary", "## Controlled source map", "## Separate eight lifecycle evidence objects", "## Build the validation-to-verification chain", "## Decision table", "## Worked example", "## Working asset", "## Limitations"]) {
    if (!processValidationLesson.includes(section)) errors.push(`academy/biopharma-process-validation-continued-verification: missing required section ${section}`);
  }
  for (const requiredBoundary of ["not a ceremony performed after development", "related but distinct decisions", "A statistical signal is not automatically a batch failure", "within-specification result is not automatically evidence", "supplies no product-specific critical quality attribute"]) {
    if (!processValidationLesson.toLowerCase().includes(requiredBoundary.toLowerCase())) errors.push(`academy/biopharma-process-validation-continued-verification: missing boundary ${requiredBoundary}`);
  }
  for (const unsafeClaim of ["three batches prove validation", "within specification proves process control", "capability index proves validation", "inspection-ready"]) {
    if (processValidationLesson.toLowerCase().includes(unsafeClaim.toLowerCase())) errors.push(`academy/biopharma-process-validation-continued-verification: unsupported shortcut remains: ${unsafeClaim}`);
  }

  const processValidationDir = path.join(root, "content", "deliverables", "biopharma-process-validation-cpv");
  const processValidationReadme = await readFile(path.join(processValidationDir, "README.md"), "utf8");
  for (const required of ["1.0.0-review", "biopharma-process-validation-cpv-v1.xlsx", "biopharma-process-validation-cpv-v1-fictional-example.xlsx", "FDA-PROCESS-VALIDATION-2011", "EMA-BIOLOGICS-PROCESS-VALIDATION-2016", "EU-GMP-ANNEX15-2015", "Decision owner", "statistical signal is not automatically a batch failure", "Workbook completeness is not validation approval"]) {
    if (!processValidationReadme.toLowerCase().includes(required.toLowerCase())) errors.push(`biopharma-process-validation-cpv README: missing ${required}`);
  }
  for (const filename of ["biopharma-process-validation-cpv-guide.md", "biopharma-process-validation-cpv-v1.xlsx", "biopharma-process-validation-cpv-v1-fictional-example.xlsx"]) {
    try {
      await access(path.join(processValidationDir, filename));
    } catch {
      errors.push(`biopharma-process-validation-cpv: missing ${filename}`);
    }
  }
  const processValidationReviewPacket = await readFile(path.join(root, "docs", "content-reviews", "BIOPHARMA_PROCESS_VALIDATION_CPV_1_0_REVIEW_PACKET.md"), "utf8");
for (const required of ["editorial-reviewed", "FDA-PROCESS-VALIDATION-2011", "EMA-BIOLOGICS-PROCESS-VALIDATION-2016", "EU-GMP-ANNEX15-2015", "ICH-Q8-R2", "ICH-Q11", "Critical review checklist", "Workbook usability acceptance", "Open evidence and product backlog", "Review record"]) {
    if (!processValidationReviewPacket.includes(required)) errors.push(`Biopharma process-validation/CPV review packet: missing ${required}`);
  }

  const apiLesson = await readFile(path.join(academyDir, "pharma-api-process-development-impurity-control.en.mdx"), "utf8");
  for (const section of ["## Decision question", "## Applicability and do-not-use boundary", "## Controlled source map", "## Separate eight API evidence objects", "## Build the route-to-control evidence chain", "## Decision table", "## Worked example", "## Working asset", "## Limitations"]) {
    if (!apiLesson.includes(section)) errors.push(`academy/pharma-api-process-development-impurity-control: missing required section ${section}`);
  }
  for (const requiredBoundary of ["supplies no chemical route", "related but distinct decisions", "An observed ratio is not a transferable purge factor", "proof of zero material", "reporting boundary"]) {
    if (!apiLesson.toLowerCase().includes(requiredBoundary.toLowerCase())) errors.push(`academy/pharma-api-process-development-impurity-control: missing boundary ${requiredBoundary}`);
  }
  for (const unsafeClaim of ["non-detect proves absence", "final testing proves control", "purge factor can be transferred", "inspection-ready"]) {
    if (apiLesson.toLowerCase().includes(unsafeClaim.toLowerCase())) errors.push(`academy/pharma-api-process-development-impurity-control: unsupported shortcut remains: ${unsafeClaim}`);
  }
  const apiDir = path.join(root, "content", "deliverables", "pharma-api-impurity-control");
  const apiReadme = await readFile(path.join(apiDir, "README.md"), "utf8");
  for (const required of ["1.0.0-review", "pharma-api-impurity-control-v1.xlsx", "pharma-api-impurity-control-v1-fictional-example.xlsx", "ICH-Q11-QA", "ICH-Q3A-R2", "ICH-M7-R2", "Decision owner", "An observed ratio is not a transferable purge factor", "Qualified review required"]) {
    if (!apiReadme.toLowerCase().includes(required.toLowerCase())) errors.push(`pharma-api-impurity-control README: missing ${required}`);
  }
  for (const filename of ["pharma-api-impurity-control-guide.md", "pharma-api-impurity-control-v1.xlsx", "pharma-api-impurity-control-v1-fictional-example.xlsx"]) {
    try {
      await access(path.join(apiDir, filename));
    } catch {
      errors.push(`pharma-api-impurity-control: missing ${filename}`);
    }
  }
  const apiReviewPacket = await readFile(path.join(root, "docs", "content-reviews", "PHARMA_API_IMPURITY_CONTROL_1_0_REVIEW_PACKET.md"), "utf8");
for (const required of ["editorial-reviewed", "ICH-Q11", "ICH-Q11-QA", "ICH-Q3A-R2", "ICH-Q3C-R9", "ICH-Q3D-R2", "ICH-M7-R2", "ICH-Q6A", "ICH-Q7", "Critical review checklist", "Workbook usability acceptance", "Open evidence and product backlog", "Review record"]) {
    if (!apiReviewPacket.includes(required)) errors.push(`Pharma API review packet: missing ${required}`);
  }

  const apiInputLesson = await readFile(path.join(academyDir, "pharma-api-starting-materials-input-control.en.mdx"), "utf8");
  for (const section of ["## Decision question", "## Applicability and do-not-use boundary", "## Controlled source map", "## Separate eight starting-material evidence objects", "## Build the boundary-to-use evidence chain", "## Decision table", "## Worked example", "## Working asset", "## Limitations"]) {
    if (!apiInputLesson.includes(section)) errors.push(`academy/pharma-api-starting-materials-input-control: missing required section ${section}`);
  }
  for (const requiredBoundary of ["Multiple suppliers", "not sufficient alone", "related but distinct decisions", "Qualified review required"]) {
    if (!apiInputLesson.toLowerCase().includes(requiredBoundary.toLowerCase())) errors.push(`academy/pharma-api-starting-materials-input-control: missing boundary ${requiredBoundary}`);
  }
  const apiInputDir = path.join(root, "content", "deliverables", "pharma-api-starting-material-input-control");
  const apiInputReadme = await readFile(path.join(apiInputDir, "README.md"), "utf8");
  for (const required of ["1.0.0-review", "pharma-api-starting-material-input-control-v1.xlsx", "pharma-api-starting-material-input-control-v1-fictional-example.xlsx", "ICH-Q11-QA", "ICH-Q7-QA", "FDA-QUALITY-AGREEMENTS-2016", "Decision owner", "Qualified review required"]) {
    if (!apiInputReadme.toLowerCase().includes(required.toLowerCase())) errors.push(`pharma-api-starting-material-input-control README: missing ${required}`);
  }
  for (const filename of ["pharma-api-starting-material-input-control-guide.md", "pharma-api-starting-material-input-control-v1.xlsx", "pharma-api-starting-material-input-control-v1-fictional-example.xlsx"]) {
    try { await access(path.join(apiInputDir, filename)); } catch { errors.push(`pharma-api-starting-material-input-control: missing ${filename}`); }
  }
  const apiInputReview = await readFile(path.join(root, "docs", "content-reviews", "PHARMA_API_STARTING_MATERIAL_INPUT_CONTROL_1_0_REVIEW_PACKET.md"), "utf8");
for (const required of ["editorial-reviewed", "Critical fail conditions", "Required reviewers", "permissioned real case"]) {
    if (!apiInputReview.toLowerCase().includes(required.toLowerCase())) errors.push(`Pharma API starting-material review packet: missing ${required}`);
  }
  const apiLifecycleLesson = await readFile(path.join(academyDir, "pharma-api-analytical-specification-lifecycle.en.mdx"), "utf8");
  for (const section of ["## Decision question", "## Applicability and do-not-use boundary", "## Controlled source map", "## Separate eight lifecycle evidence objects", "## Build the attribute-to-decision evidence chain", "## Decision table", "## Worked example", "## Working asset", "## Limitations"]) {
    if (!apiLifecycleLesson.includes(section)) errors.push(`academy/pharma-api-analytical-specification-lifecycle: missing required section ${section}`);
  }
  for (const requiredBoundary of ["precision alone", "stability-indicating", "changed measurement system", "Qualified review required"]) {
    if (!apiLifecycleLesson.toLowerCase().includes(requiredBoundary.toLowerCase())) errors.push(`academy/pharma-api-analytical-specification-lifecycle: missing boundary ${requiredBoundary}`);
  }
  const apiLifecycleDir = path.join(root, "content", "deliverables", "pharma-api-analytical-lifecycle");
  const apiLifecycleReadme = await readFile(path.join(apiLifecycleDir, "README.md"), "utf8");
  for (const required of ["1.0.0-review", "pharma-api-analytical-lifecycle-v1.xlsx", "pharma-api-analytical-lifecycle-v1-fictional-example.xlsx", "ICH-Q14", "ICH-Q2-R2", "ICH-Q1A-R2", "FDA-ANALYTICAL-PROCEDURES-2015", "Decision owner", "Qualified review required"]) {
    if (!apiLifecycleReadme.toLowerCase().includes(required.toLowerCase())) errors.push(`pharma-api-analytical-lifecycle README: missing ${required}`);
  }
  for (const filename of ["pharma-api-analytical-lifecycle-guide.md", "pharma-api-analytical-lifecycle-v1.xlsx", "pharma-api-analytical-lifecycle-v1-fictional-example.xlsx"]) {
    try { await access(path.join(apiLifecycleDir, filename)); } catch { errors.push(`pharma-api-analytical-lifecycle: missing ${filename}`); }
  }
  const apiLifecycleReview = await readFile(path.join(root, "docs", "content-reviews", "PHARMA_API_ANALYTICAL_LIFECYCLE_1_0_REVIEW_PACKET.md"), "utf8");
for (const required of ["editorial-reviewed", "Critical fail conditions", "Required reviewers", "permissioned real method lifecycle case"]) {
    if (!apiLifecycleReview.toLowerCase().includes(required.toLowerCase())) errors.push(`Pharma API analytical lifecycle review packet: missing ${required}`);
  }
  const portfolioReport = await readFile(path.join(root, "docs", "MANUFACTURING_QUALITY_PORTFOLIO.md"), "utf8");
  for (const required of ["Pharma API", "Pharma Drug Product", "Biopharma", "Cross-cutting Quality & R&D", "compilerDomainPackReady=false", "not-covered"]) {
    if (!portfolioReport.includes(required)) errors.push(`Manufacturing quality portfolio report: missing ${required}`);
  }

  const qualityLabGuide = await readFile(path.join(root, "content", "blog", "quality-lab-demand-to-capacity-decision.en.mdx"), "utf8");
  for (const required of ["## The decision package, not an equipment list", "## Convert demand into work, not just samples", "## Compare scenarios that a team can actually choose between", "## Worked fictional case: one signal, two portfolios", "## Release criteria for a useful Quality Lab package"]) {
    if (!qualityLabGuide.includes(required)) errors.push(`blog/quality-lab-demand-to-capacity-decision: missing required section ${required}`);
  }
  if (qualityLabGuide.toLowerCase().includes(".xlsx")) errors.push("blog/quality-lab-demand-to-capacity-decision: new content must not introduce workbook deliverables");

  const monthlyReviewLesson = await readFile(path.join(academyDir, "atlas-pro-monthly-quality-review.en.mdx"), "utf8");
  for (const required of ["## Decision question", "## The four-part cycle", "## Worked scenario: a cross-domain signal", "## Completion standard"]) {
    if (!monthlyReviewLesson.includes(required)) errors.push(`academy/atlas-pro-monthly-quality-review: missing required section ${required}`);
  }
  if (monthlyReviewLesson.toLowerCase().includes(".xlsx")) errors.push("academy/atlas-pro-monthly-quality-review: new content must not introduce workbook deliverables");

  const careerGuide = await readFile(path.join(root, "content", "blog", "career-blueprint-route-to-evidence.en.mdx"), "utf8");
  for (const required of ["## Start with the route, not the title", "## Keep three evidence states separate", "## A 13-week evidence sequence", "## Worked fictional profile", "## The route decision gate"]) {
    if (!careerGuide.includes(required)) errors.push(`blog/career-blueprint-route-to-evidence: missing required section ${required}`);
  }
  if (careerGuide.toLowerCase().includes(".xlsx")) errors.push("blog/career-blueprint-route-to-evidence: new content must not introduce workbook deliverables");

  const apiExpansionLessons = [
    ["pharma-api-full-lifecycle-drug-substance-control", ["## Decision question", "## Applicability and do-not-use boundary", "## Controlled source map", "## Separate eight API control objects", "## Decision table", "## Worked example", "## Working asset", "## Limitations"]],
    ["pharma-api-reaction-workup-scale-up", ["## Decision question", "## Applicability and do-not-use boundary", "## Controlled source map", "## Separate six evidence objects", "## Decision table", "## Worked example", "## Working asset", "## Limitations"]],
    ["pharma-api-isolation-solid-state-control", ["## Decision question", "## Applicability and do-not-use boundary", "## Controlled source map", "## Separate seven downstream evidence objects", "## Decision table", "## Worked example", "## Working asset", "## Limitations"]],
    ["pharma-api-process-validation-commercial-lifecycle", ["## Decision question", "## Applicability and do-not-use boundary", "## Controlled source map", "## Separate seven lifecycle evidence objects", "## Decision table", "## Worked example", "## Working asset", "## Limitations"]],
    ["biopharma-full-lifecycle-product-process-orchestration", ["## Decision question", "## Applicability and do-not-use boundary", "## Controlled source map", "## Separate nine evidence objects", "## Decision table", "## Worked example", "## Working asset", "## Limitations"]],
    ["biopharma-potency-reference-and-orthogonal-characterization", ["## Decision question", "## Applicability and do-not-use boundary", "## Controlled source map", "## Separate seven evidence objects", "## Decision table", "## Worked example", "## Working asset", "## Limitations"]],
    ["decision-led-doe-and-multivariate-process-evidence", ["## Decision question", "## Applicability and do-not-use boundary", "## Controlled source map", "## Separate six analysis objects", "## Decision table", "## Worked example", "## Working asset", "## Limitations"]],
  ] as const;
  for (const [slug, sections] of apiExpansionLessons) {
    const lesson = await readFile(path.join(academyDir, `${slug}.en.mdx`), "utf8");
    for (const section of sections) if (!lesson.includes(section)) errors.push(`academy/${slug}: missing required section ${section}`);
    if (lesson.toLowerCase().includes(".xlsx")) errors.push(`academy/${slug}: new lifecycle content must not introduce workbook deliverables`);
  }

  const biopharmaReviewPacket = await readFile(path.join(root, "docs", "content-reviews", "BIOPHARMA_CONTROL_STRATEGY_1_0_REVIEW_PACKET.md"), "utf8");
  for (const required of ["editorial-reviewed", "ICH-Q5A-R2", "ICH-Q5C", "ICH-Q5D", "ICH-Q5B", "ICH-Q5E", "ICH-Q6B", "WHO-TRS-978-ANNEX3", "WHO-TRS-1044-ANNEX4", "WHO-TRS-996-ANNEX3", "EMA-BIOLOGICS-PROCESS-VALIDATION-2016", "EU-GMP-ANNEX15-2015", "Critical review checklist", "Open content backlog", "Review record"]) {
    if (!biopharmaReviewPacket.includes(required)) errors.push(`Biopharma review packet: missing ${required}`);
  }
  const biopharmaCoverage = await readFile(path.join(root, "docs", "BIOPHARMA_CONTENT_COVERAGE.md"), "utf8");
  for (const required of ["Cell-line development and bank lifecycle", "Raw/ancillary materials and single-use systems", "Upstream process control", "Downstream purification and clearance", "Formulation, fill-finish, and stability", "Integrated analytical control strategy", "Process validation and continued verification", "Biologics tech transfer", "Comparability, transfer, and lifecycle", "Advanced modalities", "Not covered"]) {
    if (!biopharmaCoverage.includes(required)) errors.push(`Biopharma coverage report: missing ${required}`);
  }
}

await validateRegistry();
await validateFiles();

console.log(`Content quality v2: ${Object.keys(CONTENT_QUALITY_REGISTRY).length} core lessons, ${EVIDENCE_SOURCE_CATALOG.sources.length} sources, ${PAID_ASSET_QUALITY.length} paid assets.`);
warnings.forEach((warning) => console.warn(`warning: ${warning}`));
if (errors.length) {
  errors.forEach((error) => console.error(`error: ${error}`));
  process.exit(1);
}
console.log("Content quality contract valid. Editorial review is recorded where declared; SME and release gates remain enforced.");
