import "dotenv/config";
import { readdir, readFile } from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { storage } from "../server/storage.js";

// Sync MDX frontmatter → content_entries (publish state / tier / sort).
// The MDX file stays the source of truth for content; this only mirrors
// operational metadata into Postgres. Safe to re-run (upsert).

const CONTENT_DIR = path.resolve(process.cwd(), "content");
const COLLECTIONS = ["academy", "blog", "toolkits"];
const FILE_RE = /^(.+)\.(en)\.mdx$/;

async function seed() {
  if (!process.env.DATABASE_URL) {
    console.error("✗ DATABASE_URL not set — cannot seed content_entries.");
    process.exit(1);
  }

  let count = 0;
  for (const collection of COLLECTIONS) {
    const dir = path.join(CONTENT_DIR, collection);
    let files: string[] = [];
    try {
      files = await readdir(dir);
    } catch {
      continue; // collection dir may not exist yet
    }

    for (const file of files) {
      const m = file.match(FILE_RE);
      if (!m) continue;
      const [, slugFromName, lang] = m;
      const raw = await readFile(path.join(dir, file), "utf-8");
      const { data } = matter(raw);

      const slug = (data.slug as string) ?? slugFromName;
      const tier = (data.tier as string) ?? "free";
      await storage.upsertContentEntry({
        slug,
        lang,
        tier,
        published: data.published === false ? false : true,
        sort: typeof data.sort === "number" ? data.sort : 0,
      });
      count++;
      console.log(`  ✓ ${collection}/${slug} [${lang}] tier=${tier}`);
    }
  }

  console.log(`\nSeeded ${count} content entries.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
