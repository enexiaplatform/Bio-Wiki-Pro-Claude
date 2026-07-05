// CI guard: the public brand is Life Science Atlas. This catches old prototype
// names, old event ids, and starter-template names before they slip back into
// docs, metadata, package files, source, or content.
// Run: npm run validate:brand
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();

const SKIP_DIRS = new Set([
  ".git",
  ".vercel",
  ".claude",
  "coverage",
  "dist",
  "node_modules",
  "playwright-report",
  "server/public",
  "test-results",
]);

const SKIP_FILES = new Set([
  ".env",
  "error.log",
  "log.txt",
  "out.txt",
  "status.txt",
  "script/validate-brand.ts",
]);

const TEXT_EXTENSIONS = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".md",
  ".mdx",
  ".svg",
  ".ts",
  ".tsx",
  ".txt",
  ".yaml",
  ".yml",
]);

const FORBIDDEN = [
  /BioWiki/gi,
  /Bio-Wiki/gi,
  /Bio Wiki/gi,
  /BioWikiPro/gi,
  /Bio Wiki Pro/gi,
  /biowiki/gi,
  /bio-wiki/gi,
  /bio wiki/gi,
  /support@biowikipro\.com/gi,
  /bwp:open-search/gi,
  /\bbwp[_:-]/gi,
  /\bBWP-/g,
  /rest-express/gi,
];

const ALLOWED = new Set([
  'client/src/hooks/useVault.ts:const LEGACY_VAULT_KEY = "biowiki-vault-lite";',
  'client/src/components/ExitIntentLeadModal.tsx:const LEGACY_SESSION_KEY = "bwp_exit_intent_shown";',
  'client/src/hooks/use-free-reads.ts:const LEGACY_KEY = "bwp_free_reads";',
  'client/src/hooks/use-read-lessons.ts:const LEGACY_KEY = "bwp_read_lessons";',
  'client/src/hooks/use-read-lessons.ts:const LEGACY_ACTIVATED_KEY = "bwp_activated";',
  'client/src/hooks/use-streak.ts:const LEGACY_KEY = "bwp_streak";',
]);

function normalizePath(filePath: string): string {
  return path.relative(ROOT, filePath).replace(/\\/g, "/");
}

function shouldRead(filePath: string): boolean {
  const rel = normalizePath(filePath);
  if (SKIP_FILES.has(rel)) return false;
  if (rel.endsWith(".lock")) return true;
  return TEXT_EXTENSIONS.has(path.extname(filePath));
}

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  let entries: import("node:fs").Dirent[] = [];
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    const rel = normalizePath(full);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name) || SKIP_DIRS.has(rel)) continue;
      out.push(...(await walk(full)));
    } else if (shouldRead(full)) {
      out.push(full);
    }
  }
  return out;
}

function hasForbiddenBrand(line: string): boolean {
  return FORBIDDEN.some((pattern) => {
    pattern.lastIndex = 0;
    return pattern.test(line);
  });
}

async function main() {
  const files = await walk(ROOT);
  const hits: string[] = [];

  for (const file of files) {
    const rel = normalizePath(file);
    const text = await readFile(file, "utf-8").catch(() => "");
    const lines = text.split(/\r?\n/);
    lines.forEach((line, index) => {
      if (!hasForbiddenBrand(line)) return;
      const trimmed = line.trim();
      if (ALLOWED.has(`${rel}:${trimmed}`)) return;
      hits.push(`${rel}:${index + 1}: ${trimmed}`);
    });
  }

  if (hits.length) {
    console.error("Old brand/template strings found. Replace with Life Science Atlas or add a deliberate allowance:");
    for (const hit of hits) console.error(`  - ${hit}`);
    process.exit(1);
  }

  console.log(`Brand strings are clean across ${files.length} checked files (${ALLOWED.size} deliberate legacy migration allowances).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
