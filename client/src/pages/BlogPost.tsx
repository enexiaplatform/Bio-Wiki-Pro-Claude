import { useEffect } from "react";
import { Link, useParams } from "wouter";
import { ChevronRight, Clock, Printer } from "lucide-react";
import { getContentBySlug, listContent } from "@/lib/content";
import { useLanguage } from "@/hooks/use-language";
import { useSEO } from "@/hooks/use-seo";
import { JsonLd } from "@/components/JsonLd";
import { useFreeReads } from "@/hooks/use-free-reads";
import { FreeReadBanner, UpgradeInlineCTA } from "@/components/UpgradePrompts";
import NotFound from "@/pages/not-found";
import { SITE_URL as BASE_URL } from "@/lib/site";

export default function BlogPost() {
  const { slug = "" } = useParams();
  const { language } = useLanguage();
  const { count, record } = useFreeReads();

  const entry = getContentBySlug("blog", slug, language);

  useEffect(() => {
    if (entry) record(`blog/${slug}`);
  }, [entry, slug, record]);

  useSEO({
    title: entry?.title ?? "Blog",
    description: entry?.seoDescription,
  });

  if (!entry) return <NotFound />;

  const Body = entry.Component;
  const related = listContent({ collection: "blog", lang: language })
    .filter((p) => p.slug !== slug && p.category === entry.category)
    .slice(0, 3);

  return (
    <div className="pb-24 pt-4 md:pt-8 max-w-4xl mx-auto px-4">
      <JsonLd
        id="blog-article"
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: entry.title,
          description: entry.seoDescription ?? "",
          inLanguage: entry.lang,
          datePublished: entry.updatedAt,
          dateModified: entry.updatedAt,
          articleSection: entry.category,
          url: `${BASE_URL}/blog/${slug}`,
          publisher: { "@type": "Organization", name: "BioWikiPro" },
        }}
      />
      <JsonLd
        id="blog-breadcrumb"
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "BioWikiPro", item: BASE_URL },
            { "@type": "ListItem", position: 2, name: "Blog", item: `${BASE_URL}/blog` },
            { "@type": "ListItem", position: 3, name: entry.title, item: `${BASE_URL}/blog/${slug}` },
          ],
        }}
      />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6 flex-wrap">
        <Link href="/" className="hover:text-primary">BioWikiPro</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/blog" className="hover:text-primary">Blog</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground">{entry.category}</span>
      </nav>

      <div className="flex items-center justify-between gap-3 mb-6" data-print="hide">
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="w-3.5 h-3.5" /> {entry.readMinutes} min read
        </p>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Print or save as PDF"
        >
          <Printer className="w-3.5 h-3.5" /> Print
        </button>
      </div>

      <FreeReadBanner count={count} />

      <article className="prose prose-invert max-w-none prose-headings:font-display prose-a:text-primary">
        <Body />
      </article>

      <UpgradeInlineCTA placement="blog_post_end" />

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-10 border-t border-white/10 pt-6" data-print="hide">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            {entry.category}
          </h2>
          <ul className="space-y-2">
            {related.map((r) => (
              <li key={r.slug}>
                <Link href={`/blog/${r.slug}`} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                  {r.title} <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
