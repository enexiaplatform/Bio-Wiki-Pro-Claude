import { useEffect } from "react";
import { Link, useParams } from "wouter";
import { useTranslation } from "react-i18next";
import { ChevronRight, ChevronLeft, Printer, Route } from "lucide-react";
import { getContentBySlug, listContent } from "@/lib/content";
import { getPathContext } from "@/data/learningPaths";
import { useLanguage } from "@/hooks/use-language";
import { useSEO } from "@/hooks/use-seo";
import { useReadLessons } from "@/hooks/use-read-lessons";
import { analytics } from "@/hooks/use-analytics";
import { GatedContent } from "@/components/GatedContent";
import { ContentDisclaimer } from "@/components/ContentDisclaimer";
import { LessonQuiz } from "@/components/LessonQuiz";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site";
import NotFound from "@/pages/not-found";
import { AtlasBlueprintContext } from "@/components/quality-lab/AtlasBlueprintContext";
import { ContentArticleHero } from "@/components/ContentArticleHero";
import { ReadingProgress } from "@/components/ReadingProgress";

export default function LibraryEntry() {
  const { slug = "" } = useParams();
  const { language } = useLanguage();
  const { t } = useTranslation("sections");
  const { markRead } = useReadLessons();

  const entry = getContentBySlug("academy", slug, language);

  useSEO({ title: entry?.title ?? "Academy", description: entry?.seoDescription });

  useEffect(() => {
    if (entry) {
      markRead(slug);
      analytics.lessonOpened(slug, entry.title);
    }
  }, [entry, slug, markRead]);

  if (!entry) return <NotFound />;

  const related = listContent({ collection: "academy", lang: language })
    .filter((e) => e.slug !== slug && e.category === entry.category)
    .slice(0, 3);

  const pathCtx = getPathContext(slug);
  const prevEntry = pathCtx?.prev ? getContentBySlug("academy", pathCtx.prev, language) : undefined;
  const nextEntry = pathCtx?.next ? getContentBySlug("academy", pathCtx.next, language) : undefined;

  const url = `${SITE_URL}/library/${slug}`;

  return (
    <div className="pb-24 pt-4 md:pt-8 max-w-4xl mx-auto px-4">
      <ReadingProgress />
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
          publisher: { "@type": "Organization", name: "Life Science Atlas" },
        }}
      />
      <JsonLd
        id="library-breadcrumb"
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Life Science Atlas", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Academy", item: `${SITE_URL}/academy` },
            { "@type": "ListItem", position: 3, name: entry.title, item: url },
          ],
        }}
      />
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6 flex-wrap">
        <Link href="/" className="hover:text-primary">Life Science Atlas</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/academy" className="hover:text-primary">Academy</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground">{entry.category}</span>
      </nav>

      <div className="flex items-center justify-end gap-3 mb-4" data-print="hide">
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Print or save as PDF"
        >
          <Printer className="w-3.5 h-3.5" /> Print
        </button>
      </div>

      <ContentArticleHero title={entry.title} description={entry.seoDescription} category={entry.category} readMinutes={entry.readMinutes} label="Structured lesson" />

      {/* Server-gated body (free → full, pro/paid → teaser + paywall).
          Quiz is rendered only when unlocked (passed as footer). */}
      <GatedContent
        collection="academy"
        slug={slug}
        hideBodyTitle
        footer={entry.quiz?.length ? <LessonQuiz quiz={entry.quiz} /> : null}
      />

      <AtlasBlueprintContext href={`/library/${slug}`} />

      {pathCtx && (prevEntry || nextEntry) && (
        <div className="mt-10 border-t border-white/10 pt-6" data-print="hide">
          <Link
            href={`/paths/${pathCtx.path.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-primary transition-colors mb-3"
          >
            <Route className="w-3.5 h-3.5" />
            {pathCtx.path.title} · Lesson {pathCtx.index + 1} of {pathCtx.total}
          </Link>
          <div className="grid gap-3 sm:grid-cols-2">
            {prevEntry ? (
              <Link
                href={`/library/${prevEntry.slug}`}
                className="group rounded-2xl border border-white/10 bg-card p-4 hover:border-primary/30 transition-colors"
              >
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground mb-1">
                  <ChevronLeft className="w-3.5 h-3.5" /> Previous
                </span>
                <p className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-2">{prevEntry.title}</p>
              </Link>
            ) : (
              <span className="hidden sm:block" />
            )}
            {nextEntry && (
              <Link
                href={`/library/${nextEntry.slug}`}
                className="group rounded-2xl border border-white/10 bg-card p-4 hover:border-primary/30 transition-colors sm:text-right"
              >
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground mb-1 sm:justify-end sm:w-full">
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </span>
                <p className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-2">{nextEntry.title}</p>
              </Link>
            )}
          </div>
        </div>
      )}

      {related.length > 0 && (
        <div className="mt-10 border-t border-white/10 pt-6" data-print="hide">
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

      <ContentDisclaimer />
    </div>
  );
}
