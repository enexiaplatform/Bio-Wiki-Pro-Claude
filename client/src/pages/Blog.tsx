import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Calendar, ChevronRight, Rss, Clock, Search } from "lucide-react";
import { listContent } from "@/lib/content";
import { useLanguage } from "@/hooks/use-language";
import { useSEO } from "@/hooks/use-seo";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL as BASE_URL } from "@/lib/site";

const PAGE_SIZE = 6;

export default function Blog() {
  const { t } = useTranslation("common");
  const { language } = useLanguage();
  // Filters initialize from (and sync back to) the URL so views are shareable.
  const [category, setCategory] = useState(() => new URLSearchParams(window.location.search).get("category") ?? "All");
  const [query, setQuery] = useState(() => new URLSearchParams(window.location.search).get("q") ?? "");
  const [page, setPage] = useState(1);

  useSEO({ title: "Blog", description: "GMP, QC/QA and data integrity insights for Pharma professionals." });

  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (category !== "All") params.set("category", category);
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
  }, [category, query]);

  const posts = listContent({ collection: "blog", lang: language });
  const categories = ["All", ...Array.from(new Set(posts.map((p) => p.category)))];
  const q = query.trim().toLowerCase();
  const filtered = posts.filter((p) => {
    const matchesCategory = category === "All" || p.category === category;
    const matchesQuery = !q || [p.title, p.seoDescription ?? "", p.category].some((v) => v.toLowerCase().includes(q));
    return matchesCategory && matchesQuery;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const pageItems = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <div className="pb-24 pt-4 md:pt-8 max-w-4xl mx-auto px-4">
      <JsonLd
        id="blog-itemlist"
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: filtered.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${BASE_URL}/blog/${p.slug}`,
            name: p.title,
          })),
        }}
      />

      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">Blog</h1>
          <p className="text-muted-foreground">GMP · QC/QA · Data Integrity</p>
        </div>
        <a
          href="/blog/rss.xml"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors shrink-0 mt-2"
          title="RSS"
        >
          <Rss className="w-4 h-4" /> RSS
        </a>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder="Search posts…"
          className="w-full rounded-xl border border-border bg-card py-2.5 pl-9 pr-4 text-sm outline-none transition focus:ring-2 focus:ring-primary/40"
        />
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => {
              setCategory(c);
              setPage(1);
            }}
            className={
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors " +
              (c === category
                ? "bg-primary/15 text-primary"
                : "bg-white/5 text-muted-foreground hover:text-foreground")
            }
          >
            {c}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mb-6">
        {filtered.length} {filtered.length === 1 ? "post" : "posts"}
        {filtered.length !== posts.length && ` of ${posts.length}`}
      </p>

      {/* Posts */}
      {pageItems.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center">No posts match your search. Try a broader term or clear the filters.</p>
      ) : (
        <div className="space-y-4">
          {pageItems.map((p) => (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}`}
              className="block rounded-2xl border border-white/10 bg-card p-5 hover:border-primary/30 transition-colors group"
            >
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <span className="rounded-md bg-primary/10 text-primary px-2 py-0.5">{p.category}</span>
                {p.updatedAt && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {p.updatedAt}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {p.readMinutes} min read
                </span>
              </div>
              <h2 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">{p.title}</h2>
              {p.seoDescription && (
                <p className="text-sm text-muted-foreground line-clamp-2">{p.seoDescription}</p>
              )}
              <span className="inline-flex items-center gap-1 text-sm text-primary mt-3">
                {t("actions.learnMore")} <ChevronRight className="w-4 h-4" />
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={
                "w-9 h-9 rounded-lg text-sm font-medium transition-colors " +
                (n === current ? "bg-primary text-white" : "bg-white/5 text-muted-foreground hover:text-foreground")
              }
            >
              {n}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
