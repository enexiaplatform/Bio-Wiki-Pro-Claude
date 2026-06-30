// CI guard: the per-tool SEO/acquisition pipeline keeps the tool slug list in
// THREE hand-maintained places — the client catalog (cards + client meta), the
// server TOOL_META (crawler meta injected into index.html), and the sitemap.
// If they drift, a newly added tool ships with generic <title>/OG and/or never
// gets listed in the sitemap — a silent SEO regression. This asserts all three
// agree. Run: npm run validate:tool-meta
import { readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();

/** Pull the tool-entry slugs from the client catalog (skips nested relatedWorkflow slugs). */
async function catalogSlugs(): Promise<string[]> {
  const txt = await readFile(path.join(ROOT, "client/src/data/tools/catalog.ts"), "utf-8");
  // Entry slugs sit at line start; `relatedWorkflow: { slug: ... }` is mid-line, so excluded.
  return [...txt.matchAll(/^\s+slug: "([a-z0-9-]+)"/gm)].map((m) => m[1]);
}

/** Pull the TOOL_META map keys from the server static handler. */
async function serverMetaSlugs(): Promise<string[]> {
  const txt = await readFile(path.join(ROOT, "server/static.ts"), "utf-8");
  const block = txt.match(/const TOOL_META[\s\S]*?\n\};/);
  if (!block) throw new Error("Could not locate the TOOL_META block in server/static.ts");
  return [...block[0].matchAll(/^\s+"([a-z0-9-]+)": \{/gm)].map((m) => m[1]);
}

/** Pull the sitemap tool slugs from the dynamic sitemap route. */
async function sitemapSlugs(): Promise<string[]> {
  const txt = await readFile(path.join(ROOT, "server/routes.ts"), "utf-8");
  const block = txt.match(/const toolPaths = \[([\s\S]*?)\]\.map/);
  if (!block) throw new Error("Could not locate the toolPaths array in server/routes.ts");
  return [...block[1].matchAll(/"([a-z0-9-]+)"/g)].map((m) => m[1]);
}

function diff(a: string[], b: string[]): { missing: string[]; extra: string[] } {
  const A = new Set(a);
  const B = new Set(b);
  return {
    missing: [...A].filter((s) => !B.has(s)).sort(),
    extra: [...B].filter((s) => !A.has(s)).sort(),
  };
}

async function main() {
  const catalog = await catalogSlugs();
  const serverMeta = await serverMetaSlugs();
  const sitemap = await sitemapSlugs();

  if (catalog.length === 0) throw new Error("No tool slugs found in the catalog — regex drift?");

  const problems: string[] = [];
  for (const [label, list] of [
    ["server/static.ts TOOL_META", serverMeta],
    ["server/routes.ts sitemap toolPaths", sitemap],
  ] as const) {
    const d = diff(catalog, list);
    if (d.missing.length) problems.push(`${label} is MISSING: ${d.missing.join(", ")}`);
    if (d.extra.length) problems.push(`${label} has EXTRA (not in catalog): ${d.extra.join(", ")}`);
  }

  if (problems.length) {
    console.error("✗ Tool slug lists are out of sync:\n  - " + problems.join("\n  - "));
    console.error(
      "\nFix: keep client/src/data/tools/catalog.ts, server/static.ts TOOL_META, and " +
        "server/routes.ts toolPaths in sync (every tool needs all three).",
    );
    process.exit(1);
  }

  console.log(
    `✓ Tool slug lists in sync across catalog, server meta, and sitemap (${catalog.length} tools).`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
