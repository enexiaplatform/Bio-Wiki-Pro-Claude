import { readdir, readFile } from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { generateManifestEntries } from "./gen-content-manifest.js";

// Validates content/**.mdx against the Sprint 3.1 schema. Run before seeding /
// committing imported content. Exits non-zero on errors (CI-friendly).

const CONTENT_DIR = path.resolve(process.cwd(), "content");
const COLLECTIONS = ["academy", "blog", "toolkits"];
// English-only product.
const LANGS = ["en"];
const TIERS = ["free", "pro", "paid"];
const REQUIRED_FIELDS = ["title", "slug", "lang", "tier", "category"];
const FILE_RE = /^(.+)\.(en)\.mdx$/;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const SEO_MIN_LENGTH = 70;
const SEO_MAX_LENGTH = 280;
const MOJIBAKE_RE = /[\u00e2\u00c2\u00c3\ufffd]/;

const errors: string[] = [];
const warnings: string[] = [];
const MANIFEST_PATH = path.resolve(process.cwd(), "client", "src", "data", "content-manifest.json");

interface Found {
  collection: string;
  slug: string;
  lang: string;
  tier: string;
}

async function validate() {
  const found: Found[] = [];
  const seen = new Set<string>();

  for (const collection of COLLECTIONS) {
    const dir = path.join(CONTENT_DIR, collection);
    let files: string[] = [];
    try {
      files = await readdir(dir);
    } catch {
      continue;
    }

    for (const file of files) {
      if (!file.endsWith(".mdx")) continue;
      const rel = `content/${collection}/${file}`;
      const m = file.match(FILE_RE);
      if (!m) {
        errors.push(`${rel}: filename must be <slug>.en.mdx`);
        continue;
      }
      const [, slugFromName, langFromName] = m;
      const raw = await readFile(path.join(dir, file), "utf-8");
      if (MOJIBAKE_RE.test(raw)) {
        errors.push(`${rel}: contains likely mojibake/encoding artifacts`);
      }
      const { data, content } = matter(raw);

      if (data.title && typeof data.title !== "string")
        errors.push(`${rel}: frontmatter title must be a string`);
      if (data.category && typeof data.category !== "string")
        errors.push(`${rel}: frontmatter category must be a string`);
      if (data.slug && !SLUG_RE.test(String(data.slug)))
        errors.push(`${rel}: frontmatter slug "${data.slug}" must be kebab-case lowercase`);
      if (data.seoDescription && typeof data.seoDescription !== "string") {
        errors.push(`${rel}: frontmatter seoDescription must be a string`);
      } else if (!data.seoDescription) {
        errors.push(`${rel}: missing frontmatter "seoDescription" teaser`);
      } else if (data.seoDescription.length < SEO_MIN_LENGTH || data.seoDescription.length > SEO_MAX_LENGTH) {
        errors.push(
          `${rel}: seoDescription should be ${SEO_MIN_LENGTH}-${SEO_MAX_LENGTH} characters (actual ${data.seoDescription.length})`,
        );
      }
      if (!data.updatedAt) {
        errors.push(`${rel}: missing frontmatter "updatedAt"`);
      } else if (typeof data.updatedAt !== "string" || !DATE_RE.test(data.updatedAt)) {
        errors.push(`${rel}: updatedAt must use YYYY-MM-DD`);
      } else {
        const parsed = new Date(`${data.updatedAt}T00:00:00.000Z`);
        if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== data.updatedAt) {
          errors.push(`${rel}: updatedAt "${data.updatedAt}" is not a valid calendar date`);
        }
      }

      for (const f of REQUIRED_FIELDS) {
        if (!data[f]) errors.push(`${rel}: missing frontmatter "${f}"`);
      }
      if (data.lang && data.lang !== langFromName)
        errors.push(`${rel}: frontmatter lang "${data.lang}" does not match filename "${langFromName}"`);
      if (data.slug && data.slug !== slugFromName)
        errors.push(`${rel}: frontmatter slug "${data.slug}" does not match filename "${slugFromName}"`);
      if (data.tier && !TIERS.includes(data.tier))
        errors.push(`${rel}: invalid tier "${data.tier}" (free|pro|paid)`);

      // Pro/paid must ship a teaser (seoDescription) for the paywall.
      if ((data.tier === "pro" || data.tier === "paid") && !data.seoDescription)
        errors.push(`${rel}: tier=${data.tier} requires a "seoDescription" teaser (free preview -> upgrade)`);

      if (!data.updatedAt) warnings.push(`${rel}: no "updatedAt"`);

      // Unescaped `<` before a digit/space is parsed by MDX as a JSX tag and
      // breaks the build (e.g. "USP <85>"). Require &lt; instead.
      const badAngle = content.match(/<\s*\d/);
      if (badAngle) {
        errors.push(
          `${rel}: unescaped "<" before a digit ("${badAngle[0]}") - MDX reads it as JSX. Use &lt; (e.g. "USP &lt;85&gt;").`
        );
      }

      // Duplicate key
      const key = `${collection}/${slugFromName}/${langFromName}`;
      if (seen.has(key)) errors.push(`${rel}: duplicate (collection, slug, lang) = ${key}`);
      seen.add(key);


      found.push({ collection, slug: slugFromName, lang: langFromName, tier: data.tier });
    }
  }

  // English-only product: every content item should have exactly one EN file.
  const bySlug = new Map<string, Set<string>>();
  for (const f of found) {
    const k = `${f.collection}/${f.slug}`;
    (bySlug.get(k) ?? bySlug.set(k, new Set()).get(k)!).add(f.lang);
  }
  for (const [k, langs] of bySlug) {
    for (const l of LANGS) {
      if (!langs.has(l)) {
        const msg = `${k}: missing ${l.toUpperCase()} content entry`;
        errors.push(`${msg} (English content is required)`);
      }
    }
  }

  try {
    const expected = JSON.stringify(await generateManifestEntries(), null, 2) + "\n";
    const current = await readFile(MANIFEST_PATH, "utf-8");
    if (current !== expected) {
      errors.push(
        "client/src/data/content-manifest.json is stale. Run `npm run gen:content` and commit the updated manifest.",
      );
    }
  } catch (error) {
    errors.push(`client/src/data/content-manifest.json could not be verified: ${(error as Error).message}`);
  }

  console.log(`\nScanned ${found.length} MDX files.`);
  if (warnings.length) {
    console.log(`\n${warnings.length} warning(s):`);
    warnings.forEach((w) => console.log(`   - ${w}`));
  }
  if (errors.length) {
    console.log(`\n${errors.length} error(s):`);
    errors.forEach((e) => console.log(`   - ${e}`));
    process.exit(1);
  }
  console.log("\nContent valid.");
  process.exit(0);
}

validate().catch((err) => {
  console.error(err);
  process.exit(1);
});
