// CI guard: every LITERAL internal link to a dynamic content route resolves to a
// real slug. Catches the "dead /academy/<slug> link" class of bug. Template
// literals (e.g. `/library/${slug}`) are naturally skipped — `${` isn't a slug
// char — so only hard-coded paths are checked. Run: npm run validate:links
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();

async function walk(dir: string, exts: string[]): Promise<string[]> {
  const out: string[] = [];
  let entries: import("node:fs").Dirent[] = [];
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name.startsWith(".")) continue;
      out.push(...(await walk(full, exts)));
    } else if (exts.some((x) => e.name.endsWith(x))) {
      out.push(full);
    }
  }
  return out;
}

function slugsFromDir(files: string[], dirName: string): Set<string> {
  const set = new Set<string>();
  for (const f of files) {
    const m = f.replace(/\\/g, "/").match(new RegExp(`/content/${dirName}/(.+)\\.en\\.mdx$`));
    if (m) set.add(m[1]);
  }
  return set;
}

function captures(src: string, re: RegExp): string[] {
  return [...src.matchAll(re)].map((m) => m[1]);
}

async function main() {
  const contentFiles = await walk(path.join(ROOT, "content"), [".mdx"]);
  const srcFiles = await walk(path.join(ROOT, "client", "src"), [".ts", ".tsx"]);

  const academy = slugsFromDir(contentFiles, "academy");
  const blog = slugsFromDir(contentFiles, "blog");

  const lpSrc = await readFile(path.join(ROOT, "client/src/data/learningPaths.ts"), "utf-8");
  const paths = new Set(captures(lpSrc, /slug:\s*["']([a-z0-9-]+)["']/g));

  const workflowSrc = await readFile(path.join(ROOT, "client/src/data/workflows.ts"), "utf-8");
  const workflowBlock = workflowSrc.match(/export const workflows:[\s\S]*?\n\];/);
  if (!workflowBlock) throw new Error("Could not locate workflows in client/src/data/workflows.ts");
  const workflows = new Set(captures(workflowBlock[0], /slug:\s*["']([a-z0-9-]+)["']/g));

  const toolCatalogSrc = await readFile(path.join(ROOT, "client/src/data/tools/catalog.ts"), "utf-8");
  const tools = new Set(captures(toolCatalogSrc, /^\s+slug:\s*["']([a-z0-9-]+)["']/gm));

  const mlSrc = await readFile(path.join(ROOT, "client/src/data/lessons/microbiologyLessons.ts"), "utf-8");
  const lessonIds = new Set(captures(mlSrc, /id:\s*["']([a-z0-9-]+)["']/g));

  const valid: Record<string, Set<string>> = { library: academy, blog, paths, workflows, tools, academy: lessonIds };
  // Trailing lookahead excludes file paths like /blog/rss.xml (slug must not be
  // followed by another slug char or a "." extension).
  const linkRe = /(?<![A-Za-z0-9_@.-])\/(library|paths|blog|workflows|tools|academy)\/([a-z0-9][a-z0-9-]{2,})(?![a-z0-9-.])/g;

  const broken: string[] = [];
  for (const f of [...contentFiles, ...srcFiles]) {
    const src = await readFile(f, "utf-8");
    for (const m of src.matchAll(linkRe)) {
      const [, kind, slug] = m;
      if (!valid[kind].has(slug)) {
        broken.push(`${path.relative(ROOT, f)} -> /${kind}/${slug}`);
      }
    }
  }

  const total = academy.size + blog.size + paths.size + workflows.size + tools.size + lessonIds.size;
  console.log(
    `Checked internal links against ${total} targets ` +
      `(${academy.size} library, ${blog.size} blog, ${paths.size} paths, ${workflows.size} workflows, ${tools.size} tools, ${lessonIds.size} academy).`,
  );
  if (broken.length) {
    console.error(`\nFAIL: ${broken.length} broken internal link(s):`);
    for (const b of Array.from(new Set(broken))) console.error(`  - ${b}`);
    process.exit(1);
  }
  console.log("OK: All literal internal links resolve.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
