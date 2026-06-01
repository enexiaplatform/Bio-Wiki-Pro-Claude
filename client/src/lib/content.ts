import type { ComponentType } from "react";
import type { Lng } from "@/i18n";

// ── Types ───────────────────────────────────────────────────────────────────

export type ContentTier = "free" | "pro" | "paid";
export type ContentCollection = "academy" | "blog" | "toolkits";

export interface QuizQuestion {
  q: string;
  options: string[];
  /** index into `options` of the correct answer */
  answer: number;
}

export interface ContentFrontmatter {
  title: string;
  slug: string;
  lang: Lng;
  tier: ContentTier;
  category: string;
  seoDescription?: string;
  updatedAt?: string;
  quiz?: QuizQuestion[];
}

export interface ContentEntry extends ContentFrontmatter {
  collection: ContentCollection;
  /** Compiled MDX component (the prose body). */
  Component: ComponentType<Record<string, unknown>>;
}

// ── Load every MDX file at build time ────────────────────────────────────────
// Files live at <repo>/content/{collection}/{slug}.{vi|en}.mdx
// (relative to this file: client/src/lib → ../../../content)

type MdxModule = {
  default: ComponentType<Record<string, unknown>>;
  frontmatter?: Partial<ContentFrontmatter>;
};

const modules = import.meta.glob<MdxModule>("../../../content/**/*.mdx", {
  eager: true,
});

const PATH_RE = /\/content\/(academy|blog|toolkits)\/(.+)\.(vi|en)\.mdx$/;

const entries: ContentEntry[] = [];
for (const path in modules) {
  const match = path.match(PATH_RE);
  if (!match) continue;
  const [, collection, slug, lang] = match;
  const mod = modules[path];
  const fm = mod.frontmatter ?? {};
  entries.push({
    collection: collection as ContentCollection,
    // Path is the source of truth for slug/lang; frontmatter fills the rest.
    slug: (fm.slug as string) ?? slug,
    lang: lang as Lng,
    title: fm.title ?? slug,
    tier: (fm.tier as ContentTier) ?? "free",
    category: fm.category ?? "Uncategorized",
    seoDescription: fm.seoDescription,
    updatedAt: fm.updatedAt,
    quiz: Array.isArray(fm.quiz) ? fm.quiz : undefined,
    Component: mod.default,
  });
}

// ── Public API ───────────────────────────────────────────────────────────────

export interface ListOptions {
  collection?: ContentCollection;
  lang?: Lng;
  tier?: ContentTier;
}

/** List content entries, filtered by collection / language / tier. */
export function listContent(opts: ListOptions = {}): ContentEntry[] {
  return entries
    .filter((e) => (opts.collection ? e.collection === opts.collection : true))
    .filter((e) => (opts.lang ? e.lang === opts.lang : true))
    .filter((e) => (opts.tier ? e.tier === opts.tier : true))
    .sort((a, b) => a.title.localeCompare(b.title));
}

/** Get one entry by collection + slug + language. */
export function getContentBySlug(
  collection: ContentCollection,
  slug: string,
  lang: Lng,
): ContentEntry | undefined {
  return entries.find(
    (e) => e.collection === collection && e.slug === slug && e.lang === lang,
  );
}

/** All distinct slugs in a collection (language-agnostic). */
export function listSlugs(collection: ContentCollection): string[] {
  return Array.from(
    new Set(entries.filter((e) => e.collection === collection).map((e) => e.slug)),
  );
}
