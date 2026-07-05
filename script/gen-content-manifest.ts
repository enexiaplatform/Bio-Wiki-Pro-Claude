// Build-time content manifest generator.
//
// Emits client/src/data/content-manifest.json: frontmatter + computed reading
// time for every MDX file, so the CLIENT can list/sort/SEO content WITHOUT
// eager-importing the compiled bodies or raw source. That keeps Pro/paid
// academy bodies OUT of the public bundle (server-gated only) and shrinks the
// initial chunk. Run via `npm run gen:content` and automatically in the build.
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, "content");
const OUT = path.join(ROOT, "client", "src", "data", "content-manifest.json");
const COLLECTIONS = ["academy", "blog", "toolkits"] as const;
const FILE_RE = /^(.+)\.(en)\.mdx$/;

function readingMinutes(body: string): number {
  const words = body.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

interface ManifestEntry {
  collection: string;
  slug: string;
  lang: string;
  title: string;
  tier: string;
  category: string;
  seoDescription?: string;
  updatedAt?: string;
  quiz?: unknown[];
  readMinutes: number;
}

export async function generateManifestEntries(): Promise<ManifestEntry[]> {
  const entries: ManifestEntry[] = [];
  for (const collection of COLLECTIONS) {
    const dir = path.join(CONTENT_DIR, collection);
    let files: string[] = [];
    try {
      files = await readdir(dir);
    } catch {
      continue; // collection dir may not exist
    }
    for (const file of files) {
      const m = file.match(FILE_RE);
      if (!m) continue;
      const [, slug, lang] = m;
      const raw = await readFile(path.join(dir, file), "utf-8");
      const { data: fm, content } = matter(raw);
      entries.push({
        collection,
        slug: (fm.slug as string) ?? slug,
        lang,
        title: (fm.title as string) ?? slug,
        tier: (fm.tier as string) ?? "free",
        category: (fm.category as string) ?? "Uncategorized",
        seoDescription: fm.seoDescription as string | undefined,
        updatedAt: fm.updatedAt as string | undefined,
        quiz: Array.isArray(fm.quiz) ? fm.quiz : undefined,
        readMinutes: readingMinutes(content),
      });
    }
  }
  // Deterministic order so the committed file has a stable diff.
  entries.sort((a, b) =>
    `${a.collection}/${a.slug}/${a.lang}`.localeCompare(`${b.collection}/${b.slug}/${b.lang}`),
  );
  return entries;
}

export async function writeManifest(): Promise<number> {
  const entries = await generateManifestEntries();
  await writeFile(OUT, JSON.stringify(entries, null, 2) + "\n", "utf-8");
  return entries.length;
}

// Run directly (tsx script/gen-content-manifest.ts)
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("gen-content-manifest.ts")) {
  writeManifest().then((n) => console.log(`content-manifest.json written: ${n} entries`));
}
