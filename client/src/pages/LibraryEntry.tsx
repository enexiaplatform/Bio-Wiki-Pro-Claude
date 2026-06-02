import { useEffect } from "react";
import { Link, useParams } from "wouter";
import { useTranslation } from "react-i18next";
import { ChevronRight, Clock } from "lucide-react";
import { getContentBySlug, listContent } from "@/lib/content";
import { useLanguage } from "@/hooks/use-language";
import { useSEO } from "@/hooks/use-seo";
import { useReadLessons } from "@/hooks/use-read-lessons";
import { GatedContent } from "@/components/GatedContent";
import { LessonQuiz } from "@/components/LessonQuiz";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site";
import NotFound from "@/pages/not-found";

export default function LibraryEntry() {
  const { slug = "" } = useParams();
  const { language } = useLanguage();
  const { t } = useTranslation("sections");
  const { markRead } = useReadLessons();

  const entry = getContentBySlug("academy", slug, language);

  useSEO({ title: entry?.title ?? "Academy", description: entry?.seoDescription });

  useEffect(() => {
    if (entry) markRead(slug);
  }, [entry, slug, markRead]);

  if (!entry) return <NotFound />;

  const related = listContent({ collection: "academy", lang: language })
    .filter((e) => e.slug !== slug && e.category === entry.category)
    .slice(0, 3);

  const url = `${SITE_URL}/library/${slug}`;

  return (
    <div className="pb-24 pt-4 md:pt-8 max-w-4xl mx-auto px-4">
      <JsonLd
        id="library-article"
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: entry.title,
          description: entry.seoDescription ?? "",
          inLanguage: "en",
          datePublished: entry.updatedAt,
          dateModified: entry.updatedAt,
          articleSection: entry.category,
          url,
          publisher: { "@type": "Organization", name: "BioWikiPro" },
        }}
      />
      <JsonLd
        id="library-breadcrumb"
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "BioWikiPro", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Academy", item: `${SITE_URL}/academy` },
            { "@type": "ListItem", position: 3, name: entry.title, item: url },
          ],
        }}
      />
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6 flex-wrap">
        <Link href="/" className="hover:text-primary">BioWikiPro</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/academy" className="hover:text-primary">Academy</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground">{entry.category}</span>
      </nav>

      <p className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
        <Clock className="w-3.5 h-3.5" /> {entry.readMinutes} min read
      </p>

      {/* Server-gated body (free → full, pro/paid → teaser + paywall).
          Quiz is rendered only when unlocked (passed as footer). */}
      <GatedContent
        collection="academy"
        slug={slug}
        footer={entry.quiz?.length ? <LessonQuiz quiz={entry.quiz} /> : null}
      />

      {related.length > 0 && (
        <div className="mt-10 border-t border-white/10 pt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            {t("academy.related")}
          </h2>
          <ul className="space-y-2">
            {related.map((r) => (
              <li key={r.slug}>
                <Link href={`/library/${r.slug}`} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
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
