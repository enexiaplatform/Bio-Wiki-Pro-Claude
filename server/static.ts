import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const SLUG_RE = /^[a-z0-9-]+$/;
const SITE_URL = (process.env.BASE_URL ?? "https://bio-wiki-pro-claude.vercel.app").replace(/\/$/, "");

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Rewrite the document title + description/OG/Twitter/canonical tags in the
 * static index.html so a shared or crawled content URL shows ITS OWN preview
 * (most social/SEO crawlers don't run the JS that sets these client-side).
 * Replacement is by tag identity, so it's resilient to value changes.
 */
function injectMeta(
  html: string,
  meta: { title: string; description: string; url: string; type: string },
): string {
  const title = escapeHtml(`${meta.title} | BioWikiPro`);
  const desc = escapeHtml(meta.description);
  const url = escapeHtml(meta.url);
  const type = escapeHtml(meta.type);
  return html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${desc}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${title}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${desc}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta property="og:type" content=")[^"]*(")/, `$1${type}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${title}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${desc}$2`);
}

async function readFrontmatter(
  collection: "academy" | "blog",
  slug: string,
): Promise<{ title: string; description: string } | null> {
  // SLUG_RE + fixed dir prevent path traversal.
  const filePath = path.resolve(process.cwd(), "content", collection, `${slug}.en.mdx`);
  try {
    const raw = await fs.promises.readFile(filePath, "utf-8");
    const { data } = matter(raw);
    return {
      title: (data.title as string) ?? slug,
      description: (data.seoDescription as string) ?? "",
    };
  } catch {
    return null;
  }
}

export function serveStatic(app: Express) {
  const candidatePaths = [
    path.resolve(process.cwd(), "dist", "public"),
    path.resolve(process.cwd(), "server", "public"),
  ];
  const distPath = candidatePaths.find((p) => fs.existsSync(p));

  if (!distPath) {
    throw new Error(
      `Could not find the build directory in: ${candidatePaths.join(", ")}`,
    );
  }

  const indexPath = path.resolve(distPath, "index.html");

  app.use(express.static(distPath));

  // Per-page social/SEO meta for content URLs. Title + seoDescription are
  // public teaser fields (the gated body is never touched), so this is safe
  // for Pro/paid lessons too. Any miss falls through to the default index.
  const contentMeta = (collection: "academy" | "blog", prefix: string) =>
    app.get(`${prefix}/:slug`, async (req, res, next) => {
      const slug = String(req.params.slug ?? "");
      if (!SLUG_RE.test(slug)) return next();
      try {
        const fm = await readFrontmatter(collection, slug);
        if (!fm) return next();
        const html = await fs.promises.readFile(indexPath, "utf-8");
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        return res.send(
          injectMeta(html, {
            title: fm.title,
            description: fm.description,
            url: `${SITE_URL}${prefix}/${slug}`,
            type: "article",
          }),
        );
      } catch {
        return next();
      }
    });

  contentMeta("blog", "/blog");
  contentMeta("academy", "/library");

  // SPA fallback for everything else.
  app.use("/{*path}", (_req, res) => {
    res.sendFile(indexPath);
  });
}
