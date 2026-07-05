import type { ComponentType } from "react";
import type { Lng } from "@/i18n";
import manifest from "@/data/content-manifest.json";

export type ContentTier = "free" | "pro" | "paid";
export type ContentCollection = "academy" | "blog" | "toolkits";

export interface QuizQuestion {
  q: string;
  options: string[];
  /** Index into `options` of the correct answer. */
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
  /**
   * MDX bodies are not attached during list/get calls. Blog bodies are loaded on
   * demand with loadBlogComponent(); academy/toolkit bodies stay server-gated.
   */
  Component?: ComponentType<Record<string, unknown>>;
  /** Estimated reading time in minutes, precomputed in the manifest. */
  readMinutes: number;
}

type MdxModule = { default: ComponentType<Record<string, unknown>> };

const entries = manifest as ContentEntry[];

const blogModules = import.meta.glob<MdxModule>("../../../content/blog/**/*.mdx");
const BLOG_RE = /\/content\/blog\/(.+)\.(en)\.mdx$/;
const blogLoaders = new Map<string, () => Promise<MdxModule>>();

for (const path in blogModules) {
  const match = path.match(BLOG_RE);
  if (match) {
    blogLoaders.set(`${match[1]}.${match[2]}`, blogModules[path]);
  }
}

export interface ListOptions {
  collection?: ContentCollection;
  lang?: Lng;
  tier?: ContentTier;
}

/** List content entries, filtered by collection, language, or tier. */
export function listContent(opts: ListOptions = {}): ContentEntry[] {
  return entries
    .filter((entry) => (opts.collection ? entry.collection === opts.collection : true))
    .filter((entry) => (opts.lang ? entry.lang === opts.lang : true))
    .filter((entry) => (opts.tier ? entry.tier === opts.tier : true))
    .sort((a, b) => a.title.localeCompare(b.title));
}

/** Get one entry by collection, slug, and language. */
export function getContentBySlug(
  collection: ContentCollection,
  slug: string,
  lang: Lng,
): ContentEntry | undefined {
  return entries.find(
    (entry) => entry.collection === collection && entry.slug === slug && entry.lang === lang,
  );
}

/** All distinct slugs in a collection, language-agnostic. */
export function listSlugs(collection: ContentCollection): string[] {
  return Array.from(
    new Set(entries.filter((entry) => entry.collection === collection).map((entry) => entry.slug)),
  );
}

/** Load the compiled MDX body for one public blog post. */
export async function loadBlogComponent(
  slug: string,
  lang: Lng,
): Promise<ComponentType<Record<string, unknown>> | undefined> {
  const loader = blogLoaders.get(`${slug}.${lang}`);
  if (!loader) return undefined;
  const module = await loader();
  return module.default;
}
