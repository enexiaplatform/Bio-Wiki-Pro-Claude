import { useState } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Calendar, ChevronRight, Rss, Clock } from "lucide-react";
import { listContent } from "@/lib/content";
import { useLanguage } from "@/hooks/use-language";
import { useSEO } from "@/hooks/use-seo";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL as BASE_URL } from "@/lib/site";

const PAGE_SIZE = 6;

export default function Blog() {
  const { t } = useTranslation("common");
  const { language } = useLanguage();
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);

  useSEO({ title: "Blog", description: "GMP, QC/QA and data integrity insights for Pharma professionals." });

  // Posts in current language; fall back to VI entries whose EN is missing.
  const posts = listContent({ collection: "blog", lang: language });
  const categories = ["All", ...Array.from(new Set(posts.map((p) => p.category)))];
  const filtered = category === "All" ? posts : posts.filter((p) => p.category === category);

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

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-8">
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

      {/* Posts */}
      {pageItems.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center">{t("actions.loading")}</p>
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
