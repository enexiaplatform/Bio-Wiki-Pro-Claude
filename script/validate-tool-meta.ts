// CI guard: the SEO/acquisition pipeline keeps tool, workflow, and learning-path
// slugs in several hand-maintained places: the client catalog/data files, the
// visual registry, the server TOOL_META map, and the sitemap. If they drift, a
// page can ship with generic social meta, fall out of the sitemap, render
// without an interactive component, or render a dead workflow/tool link.
// Run: npm run validate:tool-meta
import { access, readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();

/** Pull the tool-entry slugs from the client catalog. */
async function catalogSlugs(): Promise<string[]> {
  const txt = await readFile(path.join(ROOT, "client/src/data/tools/catalog.ts"), "utf-8");
  // Entry slugs sit at line start; `relatedWorkflow: { slug: ... }` is mid-line, so excluded.
  return [...txt.matchAll(/^\s+slug: "([a-z0-9-]+)"/gm)].map((m) => m[1]);
}

/** Pull workflow slugs referenced from tool catalog cards. */
async function catalogRelatedWorkflowSlugs(): Promise<string[]> {
  const txt = await readFile(path.join(ROOT, "client/src/data/tools/catalog.ts"), "utf-8");
  return [...txt.matchAll(/relatedWorkflow:\s*\{\s*slug: "([a-z0-9-]+)"/g)].map((m) => m[1]).sort();
}

/** Pull toolkit slugs from the client toolkit library. */
async function toolkitSlugs(): Promise<string[]> {
  const txt = await readFile(path.join(ROOT, "client/src/data/toolkits.ts"), "utf-8");
  return [...txt.matchAll(/^\s+slug: "([a-z0-9-]+)"/gm)].map((m) => m[1]).sort();
}

/** Pull toolkit slugs marked as available in the client toolkit library. */
async function availableToolkitSlugs(): Promise<string[]> {
  const txt = await readFile(path.join(ROOT, "client/src/data/toolkits.ts"), "utf-8");
  const slugs: string[] = [];
  for (const match of txt.matchAll(/\n  \{\n([\s\S]*?)\n  \},/g)) {
    const block = match[1];
    const slug = block.match(/^\s+slug: "([a-z0-9-]+)"/m)?.[1];
    const status = block.match(/^\s+status: "([a-z]+)"/m)?.[1];
    if (slug && status === "available") slugs.push(slug);
  }
  return slugs.sort();
}

/** Pull deliverable folder names from the server fulfillment manifest. */
async function deliverableDirs(): Promise<string[]> {
  const txt = await readFile(path.join(ROOT, "server/deliverables.ts"), "utf-8");
  return [...txt.matchAll(/dir: "([a-z0-9-]+)"/g)].map((m) => m[1]).sort();
}

/** Pull fulfillment files and source files from the server deliverables manifest. */
async function deliverableFileRefs(): Promise<Array<{ productId: string; dir: string; filename: string; source?: string }>> {
  const txt = await readFile(path.join(ROOT, "server/deliverables.ts"), "utf-8");
  const manifestBlock = txt.match(/export const DELIVERABLES:[\s\S]*?\n\};/);
  if (!manifestBlock) throw new Error("Could not locate DELIVERABLES in server/deliverables.ts");

  const refs: Array<{ productId: string; dir: string; filename: string; source?: string }> = [];
  for (const match of manifestBlock[0].matchAll(/^\s+([a-z0-9_]+):\s+\{([\s\S]*?)\n  \},/gm)) {
    const productId = match[1];
    const block = match[2];
    const dir = block.match(/^\s+dir: "([a-z0-9-]+)"/m)?.[1];
    if (!dir) continue;
    const filesBlock = block.match(/files:\s+\[([\s\S]*?)\n\s+\],/)?.[1] ?? "";
    for (const fileMatch of filesBlock.matchAll(/\{([^{}]*filename: "[^"]+"[^{}]*)\}/g)) {
      const fileBlock = fileMatch[1];
      const filename = fileBlock.match(/filename: "([^"]+)"/)?.[1];
      if (!filename) continue;
      const source = fileBlock.match(/source: "([^"]+)"/)?.[1];
      refs.push({ productId, dir, filename, source });
    }
  }
  return refs;
}

async function missingDeliverableFiles(): Promise<string[]> {
  const refs = await deliverableFileRefs();
  const missing: string[] = [];
  for (const ref of refs) {
    const diskFile = ref.source ?? ref.filename;
    const fullPath = path.join(ROOT, "content/deliverables", ref.dir, diskFile);
    try {
      await access(fullPath);
    } catch {
      missing.push(`${ref.productId}/${ref.filename} expects content/deliverables/${ref.dir}/${diskFile}`);
    }
  }
  return missing.sort();
}

/** Pull the TOOL_META map keys from the server static handler. */
async function serverMetaSlugs(): Promise<string[]> {
  const txt = await readFile(path.join(ROOT, "server/static.ts"), "utf-8");
  const block = txt.match(/const TOOL_META[\s\S]*?\n\};/);
  if (!block) throw new Error("Could not locate the TOOL_META block in server/static.ts");
  return [...block[0].matchAll(/^\s+"([a-z0-9-]+)": \{/gm)].map((m) => m[1]);
}

/** Pull the visual registry keys that provide the React component + icon. */
async function registryVisualSlugs(): Promise<string[]> {
  const txt = await readFile(path.join(ROOT, "client/src/features/tools/registry.tsx"), "utf-8");
  const block = txt.match(/const VISUALS[\s\S]*?\n\};/);
  if (!block) throw new Error("Could not locate the VISUALS block in client/src/features/tools/registry.tsx");
  return [...block[0].matchAll(/^\s+"([a-z0-9-]+)": \{/gm)].map((m) => m[1]);
}

/** Pull the sitemap tool slugs from the dynamic sitemap route. */
async function sitemapSlugs(): Promise<string[]> {
  const txt = await readFile(path.join(ROOT, "server/routes.ts"), "utf-8");
  const block = txt.match(/const toolPaths = \[([\s\S]*?)\]\.map/);
  if (!block) throw new Error("Could not locate the toolPaths array in server/routes.ts");
  return [...block[1].matchAll(/"([a-z0-9-]+)"/g)].map((m) => m[1]);
}

/** Pull the sitemap workflow slugs from the dynamic sitemap route. */
async function sitemapWorkflowSlugs(): Promise<string[]> {
  const txt = await readFile(path.join(ROOT, "server/routes.ts"), "utf-8");
  const block = txt.match(/const workflowPaths = \[([\s\S]*?)\]\.map/);
  if (!block) throw new Error("Could not locate the workflowPaths array in server/routes.ts");
  return [...block[1].matchAll(/"([a-z0-9-]+)"/g)].map((m) => m[1]).sort();
}

/** Pull the sitemap learning-path slugs from the dynamic sitemap route. */
async function sitemapLearningPathSlugs(): Promise<string[]> {
  const txt = await readFile(path.join(ROOT, "server/routes.ts"), "utf-8");
  const block = txt.match(/const pathPaths = \[([\s\S]*?)\]\.map/);
  if (!block) throw new Error("Could not locate the pathPaths array in server/routes.ts");
  return [...block[1].matchAll(/"([a-z0-9-]+)"/g)].map((m) => m[1]).sort();
}

/** Pull tool slugs referenced by workflow cards. */
async function workflowRelatedToolSlugs(): Promise<string[]> {
  const txt = await readFile(path.join(ROOT, "client/src/data/workflows.ts"), "utf-8");
  const slugs = new Set<string>();
  for (const block of txt.matchAll(/relatedToolSlugs:\s*\[([\s\S]*?)\]/g)) {
    for (const match of block[1].matchAll(/"([a-z0-9-]+)"/g)) {
      slugs.add(match[1]);
    }
  }
  return [...slugs].sort();
}

/** Pull toolkit slugs referenced by workflow cards. */
async function workflowRelatedToolkitSlugs(): Promise<string[]> {
  const txt = await readFile(path.join(ROOT, "client/src/data/workflows.ts"), "utf-8");
  const slugs = new Set<string>();
  for (const block of txt.matchAll(/relatedToolkitSlugs:\s*\[([\s\S]*?)\]/g)) {
    for (const match of block[1].matchAll(/"([a-z0-9-]+)"/g)) {
      slugs.add(match[1]);
    }
  }
  return [...slugs].sort();
}

/** Pull workflow detail slugs from the workflow data file. */
async function workflowSlugs(): Promise<string[]> {
  const txt = await readFile(path.join(ROOT, "client/src/data/workflows.ts"), "utf-8");
  const workflowBlock = txt.match(/export const workflows:[\s\S]*?\n\];/);
  if (!workflowBlock) throw new Error("Could not locate the workflows array in client/src/data/workflows.ts");
  return [...workflowBlock[0].matchAll(/^\s+slug: "([a-z0-9-]+)"/gm)].map((m) => m[1]).sort();
}

/** Pull workflow slug -> categorySlug pairs from the workflow detail data. */
async function workflowCategoryPairs(): Promise<Array<{ slug: string; categorySlug: string }>> {
  const txt = await readFile(path.join(ROOT, "client/src/data/workflows.ts"), "utf-8");
  const workflowBlock = txt.match(/export const workflows:[\s\S]*?\n\];/);
  if (!workflowBlock) throw new Error("Could not locate the workflows array in client/src/data/workflows.ts");

  return [...workflowBlock[0].matchAll(/\n  \{\n\s+slug: "([a-z0-9-]+)",\n\s+categorySlug: "([a-z0-9-]+)"/g)].map(
    (m) => ({ slug: m[1], categorySlug: m[2] }),
  );
}

/** Pull workflow category cards with their path and listed workflow refs. */
async function workflowCategoryRefs(): Promise<
  Array<{ slug: string; pathSlug?: string; href?: string; workflowSlugs: string[] }>
> {
  const txt = await readFile(path.join(ROOT, "client/src/data/workflows.ts"), "utf-8");
  const categoryBlock = txt.match(/export const workflowCategories:[\s\S]*?\n\];/);
  if (!categoryBlock) throw new Error("Could not locate workflowCategories in client/src/data/workflows.ts");

  const categories: Array<{ slug: string; pathSlug?: string; href?: string; workflowSlugs: string[] }> = [];
  for (const match of categoryBlock[0].matchAll(/\n  \{\n([\s\S]*?)\n  \},/g)) {
    const block = match[1];
    const slug = block.match(/^\s+slug: "([a-z0-9-]+)"/m)?.[1];
    if (!slug) continue;
    const pathSlug = block.match(/^\s+pathSlug: "([a-z0-9-]+)"/m)?.[1];
    const href = block.match(/^\s+href: "([^"]+)"/m)?.[1];
    const workflowList = block.match(/workflowSlugs:\s*\[([\s\S]*?)\]/)?.[1] ?? "";
    const workflowSlugs = [...workflowList.matchAll(/"([a-z0-9-]+)"/g)].map((m) => m[1]);
    categories.push({ slug, pathSlug, href, workflowSlugs });
  }
  return categories;
}

/** Pull learning path slugs from the client path data file. */
async function learningPathSlugs(): Promise<string[]> {
  const txt = await readFile(path.join(ROOT, "client/src/data/learningPaths.ts"), "utf-8");
  const pathBlock = txt.match(/export const learningPaths:[\s\S]*?\n\];/);
  if (!pathBlock) throw new Error("Could not locate learningPaths in client/src/data/learningPaths.ts");
  return [...pathBlock[0].matchAll(/^\s+slug: "([a-z0-9-]+)"/gm)].map((m) => m[1]).sort();
}

/** Pull workflow detail pages that do not expose at least one related tool. */
async function workflowsWithoutTools(): Promise<string[]> {
  const txt = await readFile(path.join(ROOT, "client/src/data/workflows.ts"), "utf-8");
  const workflowBlock = txt.match(/export const workflows:[\s\S]*?\n\];/);
  if (!workflowBlock) throw new Error("Could not locate the workflows array in client/src/data/workflows.ts");

  const missing: string[] = [];
  for (const match of workflowBlock[0].matchAll(/\n  \{\n\s+slug: "([a-z0-9-]+)",[\s\S]*?\n  \},/g)) {
    const block = match[0];
    const slug = match[1];
    const title = block.match(/^\s+title: "([^"]+)"/m)?.[1] ?? slug;
    const relatedTools = block.match(/relatedToolSlugs:\s*\[([\s\S]*?)\]/)?.[1] ?? "";
    if (!/"[a-z0-9-]+"/.test(relatedTools)) missing.push(`${slug} (${title})`);
  }
  return missing.sort();
}

function diff(a: string[], b: string[]): { missing: string[]; extra: string[] } {
  const A = new Set(a);
  const B = new Set(b);
  return {
    missing: [...A].filter((s) => !B.has(s)).sort(),
    extra: [...B].filter((s) => !A.has(s)).sort(),
  };
}

function duplicates(values: string[]): string[] {
  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) dupes.add(value);
    seen.add(value);
  }
  return [...dupes].sort();
}

async function main() {
  const catalog = await catalogSlugs();
  const catalogWorkflowRefs = await catalogRelatedWorkflowSlugs();
  const toolkits = await toolkitSlugs();
  const availableToolkits = await availableToolkitSlugs();
  const deliverables = await deliverableDirs();
  const registryVisuals = await registryVisualSlugs();
  const serverMeta = await serverMetaSlugs();
  const sitemap = await sitemapSlugs();
  const sitemapWorkflows = await sitemapWorkflowSlugs();
  const sitemapLearningPaths = await sitemapLearningPathSlugs();
  const workflowRefs = await workflowRelatedToolSlugs();
  const workflowToolkitRefs = await workflowRelatedToolkitSlugs();
  const workflows = await workflowSlugs();
  const workflowPairs = await workflowCategoryPairs();
  const workflowCategories = await workflowCategoryRefs();
  const learningPaths = await learningPathSlugs();
  const workflowsMissingTools = await workflowsWithoutTools();
  const missingDeliverables = await missingDeliverableFiles();

  if (catalog.length === 0) throw new Error("No tool slugs found in the catalog - regex drift?");

  const problems: string[] = [];
  const duplicateCatalogSlugs = duplicates(catalog);
  if (duplicateCatalogSlugs.length) {
    problems.push(`client/src/data/tools/catalog.ts has duplicate tool slugs: ${duplicateCatalogSlugs.join(", ")}`);
  }
  const duplicateToolkitSlugs = duplicates(toolkits);
  if (duplicateToolkitSlugs.length) {
    problems.push(`client/src/data/toolkits.ts has duplicate toolkit slugs: ${duplicateToolkitSlugs.join(", ")}`);
  }
  const duplicateDeliverableDirs = duplicates(deliverables);
  if (duplicateDeliverableDirs.length) {
    problems.push(`server/deliverables.ts has duplicate deliverable dirs: ${duplicateDeliverableDirs.join(", ")}`);
  }

  for (const [label, list] of [
    ["client/src/features/tools/registry.tsx VISUALS", registryVisuals],
    ["server/static.ts TOOL_META", serverMeta],
    ["server/routes.ts sitemap toolPaths", sitemap],
  ] as const) {
    const d = diff(catalog, list);
    if (d.missing.length) problems.push(`${label} is MISSING: ${d.missing.join(", ")}`);
    if (d.extra.length) problems.push(`${label} has EXTRA (not in catalog): ${d.extra.join(", ")}`);
  }

  const catalogSet = new Set(catalog);
  const missingWorkflowRefs = workflowRefs.filter((slug) => !catalogSet.has(slug));
  if (missingWorkflowRefs.length) {
    problems.push(
      `client/src/data/workflows.ts references unknown relatedToolSlugs: ${missingWorkflowRefs.join(", ")}`,
    );
  }

  const toolkitSet = new Set(toolkits);
  const missingWorkflowToolkitRefs = workflowToolkitRefs.filter((slug) => !toolkitSet.has(slug));
  if (missingWorkflowToolkitRefs.length) {
    problems.push(
      `client/src/data/workflows.ts references unknown relatedToolkitSlugs: ${missingWorkflowToolkitRefs.join(", ")}`,
    );
  }

  const deliverableDirSet = new Set(deliverables);
  const availableToolkitsWithoutDeliverables = availableToolkits.filter((slug) => !deliverableDirSet.has(slug));
  if (availableToolkitsWithoutDeliverables.length) {
    problems.push(
      `client/src/data/toolkits.ts marks toolkit(s) available but server/deliverables.ts has no matching dir: ${availableToolkitsWithoutDeliverables.join(", ")}`,
    );
  }

  const workflowSet = new Set(workflows);
  const missingCatalogWorkflowRefs = catalogWorkflowRefs.filter((slug) => !workflowSet.has(slug));
  if (missingCatalogWorkflowRefs.length) {
    problems.push(
      `client/src/data/tools/catalog.ts references unknown relatedWorkflow slugs: ${missingCatalogWorkflowRefs.join(", ")}`,
    );
  }

  const sitemapWorkflowDiff = diff(workflows, sitemapWorkflows);
  if (sitemapWorkflowDiff.missing.length) {
    problems.push(`server/routes.ts sitemap workflowPaths is MISSING: ${sitemapWorkflowDiff.missing.join(", ")}`);
  }
  if (sitemapWorkflowDiff.extra.length) {
    problems.push(`server/routes.ts sitemap workflowPaths has EXTRA (not in workflows): ${sitemapWorkflowDiff.extra.join(", ")}`);
  }

  const sitemapLearningPathDiff = diff(learningPaths, sitemapLearningPaths);
  if (sitemapLearningPathDiff.missing.length) {
    problems.push(`server/routes.ts sitemap pathPaths is MISSING: ${sitemapLearningPathDiff.missing.join(", ")}`);
  }
  if (sitemapLearningPathDiff.extra.length) {
    problems.push(`server/routes.ts sitemap pathPaths has EXTRA (not in learningPaths): ${sitemapLearningPathDiff.extra.join(", ")}`);
  }

  const categorySlugs = workflowCategories.map((c) => c.slug);
  const duplicateCategorySlugs = duplicates(categorySlugs);
  if (duplicateCategorySlugs.length) {
    problems.push(`client/src/data/workflows.ts has duplicate workflow category slugs: ${duplicateCategorySlugs.join(", ")}`);
  }

  const categorySet = new Set(categorySlugs);
  const workflowCategoryMap = new Map(workflowPairs.map((pair) => [pair.slug, pair.categorySlug]));
  const listedWorkflowRefs = workflowCategories.flatMap((category) =>
    category.workflowSlugs.map((workflowSlug) => ({ workflowSlug, categorySlug: category.slug })),
  );
  const listedWorkflowSlugs = listedWorkflowRefs.map((ref) => ref.workflowSlug);
  const duplicateListedWorkflows = duplicates(listedWorkflowSlugs);
  if (duplicateListedWorkflows.length) {
    problems.push(`client/src/data/workflows.ts workflowCategories list workflow slugs more than once: ${duplicateListedWorkflows.join(", ")}`);
  }

  const unknownListedWorkflows = listedWorkflowSlugs.filter((slug) => !workflowSet.has(slug)).sort();
  if (unknownListedWorkflows.length) {
    problems.push(`client/src/data/workflows.ts workflowCategories reference unknown workflows: ${unknownListedWorkflows.join(", ")}`);
  }

  const uncategorizedWorkflows = workflows.filter((slug) => !listedWorkflowSlugs.includes(slug));
  if (uncategorizedWorkflows.length) {
    problems.push(`client/src/data/workflows.ts workflows missing from workflowCategories.workflowSlugs: ${uncategorizedWorkflows.join(", ")}`);
  }

  const mismatchedWorkflowCategories = listedWorkflowRefs
    .filter((ref) => workflowCategoryMap.has(ref.workflowSlug) && workflowCategoryMap.get(ref.workflowSlug) !== ref.categorySlug)
    .map((ref) => `${ref.workflowSlug} listed under ${ref.categorySlug}, but categorySlug is ${workflowCategoryMap.get(ref.workflowSlug)}`)
    .sort();
  if (mismatchedWorkflowCategories.length) {
    problems.push(`client/src/data/workflows.ts workflow category mismatches: ${mismatchedWorkflowCategories.join("; ")}`);
  }

  const unknownWorkflowCategoryRefs = workflowPairs
    .filter((pair) => !categorySet.has(pair.categorySlug))
    .map((pair) => `${pair.slug} -> ${pair.categorySlug}`)
    .sort();
  if (unknownWorkflowCategoryRefs.length) {
    problems.push(`client/src/data/workflows.ts workflows reference unknown categorySlug values: ${unknownWorkflowCategoryRefs.join(", ")}`);
  }

  const learningPathSet = new Set(learningPaths);
  const missingCategoryPaths = workflowCategories
    .filter((category) => category.pathSlug && !learningPathSet.has(category.pathSlug))
    .map((category) => `${category.slug} -> ${category.pathSlug}`)
    .sort();
  if (missingCategoryPaths.length) {
    problems.push(`client/src/data/workflows.ts workflowCategories reference unknown pathSlug values: ${missingCategoryPaths.join(", ")}`);
  }

  if (workflowsMissingTools.length) {
    problems.push(
      `client/src/data/workflows.ts workflow pages without relatedToolSlugs: ${workflowsMissingTools.join(", ")}`,
    );
  }

  if (missingDeliverables.length) {
    problems.push(
      `server/deliverables.ts references missing deliverable file/source paths: ${missingDeliverables.join("; ")}`,
    );
  }

  if (problems.length) {
    console.error("Tool slug metadata is out of sync:\n  - " + problems.join("\n  - "));
    console.error(
      "\nFix: keep client/src/data/tools/catalog.ts, client/src/features/tools/registry.tsx VISUALS, " +
        "server/static.ts TOOL_META, server/routes.ts toolPaths/workflowPaths/pathPaths, workflow categories, workflow relatedToolSlugs/relatedToolkitSlugs, toolkit deliverables, deliverable files/sources, and catalog relatedWorkflow refs in sync.",
    );
    process.exit(1);
  }

  console.log(
    `Tool slug metadata is in sync across catalog, registry, server meta, sitemap, workflow refs, catalog workflow refs, workflow categories, path/workflow sitemap, workflow tool/toolkit coverage, available toolkit deliverables, and deliverable files/sources (${catalog.length} tools, ${toolkits.length} toolkits, ${workflows.length} workflows, ${workflowCategories.length} workflow categories, ${learningPaths.length} learning paths).`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
