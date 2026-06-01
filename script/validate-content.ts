import { readdir, readFile } from "fs/promises";
import path from "path";
import matter from "gray-matter";

// Validates content/**.mdx against the Sprint 3.1 schema. Run before seeding /
// committing imported content. Exits non-zero on errors (CI-friendly).

const CONTENT_DIR = path.resolve(process.cwd(), "content");
const COLLECTIONS = ["academy", "blog", "toolkits"];
const LANGS = ["vi", "en"];
const TIERS = ["free", "pro", "paid"];
const REQUIRED_FIELDS = ["title", "slug", "lang", "tier", "category"];
const FILE_RE = /^(.+)\.(vi|en)\.mdx$/;
// internal links in markdown body that would NOT keep the language prefix
const INTERNAL_LINK_RE = /\]\((\/[^)]*)\)/g;

const errors: string[] = [];
const warnings: string[] = [];

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
        errors.push(`${rel}: filename must be <slug>.<vi|en>.mdx`);
        continue;
      }
      const [, slugFromName, langFromName] = m;
      const raw = await readFile(path.join(dir, file), "utf-8");
      const { data, content } = matter(raw);

      for (const f of REQUIRED_FIELDS) {
        if (!data[f]) errors.push(`${rel}: missing frontmatter "${f}"`);
      }
      if (data.lang && data.lang !== langFromName)
        errors.push(`${rel}: frontmatter lang "${data.lang}" ≠ filename "${langFromName}"`);
      if (data.slug && data.slug !== slugFromName)
        errors.push(`${rel}: frontmatter slug "${data.slug}" ≠ filename "${slugFromName}"`);
      if (data.tier && !TIERS.includes(data.tier))
        errors.push(`${rel}: invalid tier "${data.tier}" (free|pro|paid)`);

      // Pro/paid must ship a teaser (seoDescription) for the paywall.
      if ((data.tier === "pro" || data.tier === "paid") && !data.seoDescription)
        errors.push(`${rel}: tier=${data.tier} requires a "seoDescription" teaser (free preview → upgrade)`);

      if (!data.updatedAt) warnings.push(`${rel}: no "updatedAt"`);

      // Unescaped `<` before a digit/space is parsed by MDX as a JSX tag and
      // breaks the build (e.g. "USP <85>"). Require &lt; instead.
      const badAngle = content.match(/<\s*\d/);
      if (badAngle) {
        errors.push(
          `${rel}: unescaped "<" before a digit ("${badAngle[0]}") — MDX reads it as JSX. Use &lt; (e.g. "USP &lt;85&gt;").`
        );
      }

      // Duplicate key
      const key = `${collection}/${slugFromName}/${langFromName}`;
      if (seen.has(key)) errors.push(`${rel}: duplicate (collection, slug, lang) = ${key}`);
      seen.add(key);

      // Internal links that won't keep the language prefix
      let lm: RegExpExecArray | null;
      while ((lm = INTERNAL_LINK_RE.exec(content)) !== null) {
        const href = lm[1];
        if (!/^\/(vi|en)(\/|$)/.test(href)) {
          warnings.push(`${rel}: internal link "${href}" has no /vi or /en prefix (renders as plain <a>, loses language)`);
        }
      }

      found.push({ collection, slug: slugFromName, lang: langFromName, tier: data.tier });
    }
  }

  // Missing translations — VI fallback renders, but flag gaps.
  const bySlug = new Map<string, Set<string>>();
  for (const f of found) {
    const k = `${f.collection}/${f.slug}`;
    (bySlug.get(k) ?? bySlug.set(k, new Set()).get(k)!).add(f.lang);
  }
  for (const [k, langs] of bySlug) {
    for (const l of LANGS) {
      if (!langs.has(l)) {
        const msg = `${k}: missing ${l.toUpperCase()} translation`;
        if (l === "vi") errors.push(`${msg} (VI is the fallback — required)`);
        else warnings.push(`${msg} (will fall back to VI)`);
      }
    }
  }

  console.log(`\nScanned ${found.length} MDX files.`);
  if (warnings.length) {
    console.log(`\n⚠️  ${warnings.length} warning(s):`);
    warnings.forEach((w) => console.log(`   - ${w}`));
  }
  if (errors.length) {
    console.log(`\n✗ ${errors.length} error(s):`);
    errors.forEach((e) => console.log(`   - ${e}`));
    process.exit(1);
  }
  console.log("\n✓ Content valid.");
  process.exit(0);
}

validate().catch((err) => {
  console.error(err);
  process.exit(1);
});
