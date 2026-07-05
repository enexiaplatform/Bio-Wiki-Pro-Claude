import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { BookOpen, Calendar, ChevronRight, Clock, Filter, Rss, Search } from "lucide-react";

import { JsonLd } from "@/components/JsonLd";
import { useLanguage } from "@/hooks/use-language";
import { useSEO } from "@/hooks/use-seo";
import { listContent } from "@/lib/content";
import { SITE_URL as BASE_URL } from "@/lib/site";

const PAGE_SIZE = 6;
const all = "All";

export default function Blog() {
  const { t } = useTranslation("common");
  const { language } = useLanguage();
  const [category, setCategory] = useState(() => new URLSearchParams(window.location.search).get("category") ?? all);
  const [query, setQuery] = useState(() => new URLSearchParams(window.location.search).get("q") ?? "");
  const [page, setPage] = useState(1);

  useSEO({ title: "Blog", description: "GMP, QC/QA and data integrity insights for Pharma professionals." });

  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (category !== all) params.set("category", category);
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
  }, [category, query]);

  const posts = listContent({ collection: "blog", lang: language });
  const categories = [all, ...Array.from(new Set(posts.map((post) => post.category)))];
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = posts.filter((post) => {
    const matchesCategory = category === all || post.category === category;
    const matchesQuery =
      !normalizedQuery ||
      [post.title, post.seoDescription ?? "", post.category].some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      );
    return matchesCategory && matchesQuery;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const pageItems = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  function resetFilters() {
    setQuery("");
    setCategory(all);
    setPage(1);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-4 md:pt-8">
      <JsonLd
        id="blog-itemlist"
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: filtered.map((post, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: `${BASE_URL}/blog/${post.slug}`,
            name: post.title,
          })),
        }}
      />

      <section className="relative mb-6 overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-teal-400/10 via-white/[0.04] to-transparent p-5 shadow-xl shadow-black/10 md:p-7">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_10%,rgba(20,184,166,0.18),transparent_30%),radial-gradient(circle_at_86%_18%,rgba(16,185,129,0.1),transparent_28%)]" />
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-400/20 bg-teal-400/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-teal-300">
              <BookOpen className="h-3.5 w-3.5" />
              Insights
            </span>
            <h1 className="mb-3 font-display text-3xl font-bold leading-tight md:text-5xl">Blog</h1>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
              GMP, QC/QA, data integrity, regulatory pathways, and practical inspection-readiness thinking.
            </p>
          </div>

          <div className="grid w-full grid-cols-3 gap-2 rounded-lg border border-white/10 bg-slate-950/45 p-3 md:w-72">
            <div>
              <div className="text-xl font-bold text-teal-300">{posts.length}</div>
              <div className="text-[11px] text-muted-foreground">Posts</div>
            </div>
            <div>
              <div className="text-xl font-bold text-teal-300">{categories.length - 1}</div>
              <div className="text-[11px] text-muted-foreground">Topics</div>
            </div>
            <div>
              <div className="text-xl font-bold text-teal-300">{PAGE_SIZE}</div>
              <div className="text-[11px] text-muted-foreground">Per page</div>
            </div>
          </div>
        </div>
        <a
          href="/blog/rss.xml"
          className="absolute right-5 top-5 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
          title="RSS"
        >
          <Rss className="h-4 w-4" /> RSS
        </a>
      </section>

      <section className="mb-6 grid gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-3 md:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Search posts, topics, or inspection themes"
            className="h-11 w-full rounded-lg border border-white/10 bg-background/70 pl-10 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-teal-400/50 focus:ring-2 focus:ring-teal-400/20"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:max-w-xl md:pb-0">
          <span className="hidden items-center gap-1.5 text-xs font-semibold text-muted-foreground md:inline-flex">
            <Filter className="h-3.5 w-3.5" />
            Topic
          </span>
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => {
                setCategory(item);
                setPage(1);
              }}
              className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                item === category
                  ? "border-teal-400/40 bg-teal-400/15 text-teal-200"
                  : "border-white/10 bg-white/[0.04] text-muted-foreground hover:border-white/20 hover:text-foreground"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <p className="mb-6 text-xs text-muted-foreground">
        {filtered.length} {filtered.length === 1 ? "post" : "posts"}
        {filtered.length !== posts.length && ` of ${posts.length}`}
      </p>

      {pageItems.length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.035] p-8 text-center">
          <Search className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <h2 className="mb-2 text-lg font-bold">No posts match that filter</h2>
          <p className="mx-auto mb-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            Try a broader term or clear the filters.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center justify-center rounded-lg bg-teal-400 px-4 py-2 text-sm font-bold text-teal-950 hover:bg-teal-300"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {pageItems.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex h-full flex-col rounded-lg border border-white/10 bg-white/[0.045] p-5 shadow-lg shadow-black/10 transition-all hover:-translate-y-1 hover:border-primary/35 hover:bg-white/[0.07]"
            >
              <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-primary">{post.category}</span>
                {post.updatedAt && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {post.updatedAt}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {post.readMinutes} min read
                </span>
              </div>
              <h2 className="mb-1 text-lg font-bold transition-colors group-hover:text-primary">{post.title}</h2>
              {post.seoDescription && <p className="line-clamp-3 flex-1 text-sm text-muted-foreground">{post.seoDescription}</p>}
              <span className="mt-4 inline-flex items-center gap-1 text-sm text-primary">
                {t("actions.learnMore")} <ChevronRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
            <button
              key={number}
              onClick={() => setPage(number)}
              className={
                "h-9 w-9 rounded-lg text-sm font-medium transition-colors " +
                (number === current ? "bg-teal-400 text-teal-950" : "bg-white/5 text-muted-foreground hover:text-foreground")
              }
            >
              {number}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
