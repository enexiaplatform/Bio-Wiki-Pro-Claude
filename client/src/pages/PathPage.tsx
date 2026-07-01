import { Link, useParams } from "wouter";
import { ChevronRight, CheckCircle2, Crown, Circle, ArrowRight, Award } from "lucide-react";
import { getLearningPath } from "@/data/learningPaths";
import { getContentBySlug } from "@/lib/content";
import { useReadLessons } from "@/hooks/use-read-lessons";
import { useSEO } from "@/hooks/use-seo";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site";
import NotFound from "@/pages/not-found";

export default function PathPage() {
  const { slug = "" } = useParams();
  const { isRead } = useReadLessons();
  const path = getLearningPath(slug);

  useSEO({ title: path?.title ?? "Learning path", description: path?.description });

  if (!path) return <NotFound />;

  const lessons = path.lessonSlugs
    .map((s) => getContentBySlug("academy", s, "en"))
    .filter((e): e is NonNullable<typeof e> => !!e);

  const readCount = lessons.filter((l) => isRead(l.slug)).length;
  const pct = lessons.length ? Math.round((readCount / lessons.length) * 100) : 0;
  const next = lessons.find((l) => !isRead(l.slug));

  const url = `${SITE_URL}/paths/${slug}`;

  return (
    <div className="pb-24 pt-4 md:pt-8 max-w-2xl mx-auto px-4">
      <JsonLd
        id="path-course"
        data={{
          "@context": "https://schema.org",
          "@type": "Course",
          name: path.title,
          description: path.description,
          url,
          inLanguage: "en",
          provider: { "@type": "Organization", name: "Life Science Atlas", url: SITE_URL },
          numberOfLessons: lessons.length,
          hasPart: lessons.map((l, i) => ({
            "@type": "Course",
            name: l.title,
            position: i + 1,
            url: `${SITE_URL}/library/${l.slug}`,
          })),
        }}
      />
      <JsonLd
        id="path-breadcrumb"
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Life Science Atlas", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Academy", item: `${SITE_URL}/academy` },
            { "@type": "ListItem", position: 3, name: path.title, item: url },
          ],
        }}
      />
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6 flex-wrap">
        <Link href="/" className="hover:text-primary">Life Science Atlas</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/academy" className="hover:text-primary">Academy</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground">Paths</span>
      </nav>

      <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">{path.title}</h1>
      <p className="text-muted-foreground mb-5">{path.description}</p>

      {/* Progress */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-1.5 flex-1 rounded-full bg-white/10 overflow-hidden max-w-xs">
          <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-xs text-muted-foreground shrink-0">{readCount} / {lessons.length} done</span>
      </div>

      {next ? (
        <Link
          href={`/library/${next.slug}`}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors mb-8"
        >
          {readCount > 0 ? "Continue" : "Start"}: {next.title} <ArrowRight className="w-4 h-4" />
        </Link>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-8">
          <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-5 py-2.5 text-sm font-semibold text-emerald-400">
            <CheckCircle2 className="w-4 h-4" /> Path completed — nice work!
          </div>
          <Link
            href={`/certificate/${path.slug}`}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Award className="w-4 h-4" /> Get your certificate
          </Link>
        </div>
      )}

      {/* Ordered lesson list */}
      <ol className="space-y-2">
        {lessons.map((l, i) => {
          const done = isRead(l.slug);
          return (
            <li key={l.slug}>
              <Link
                href={`/library/${l.slug}`}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-card p-4 hover:border-primary/30 transition-colors group"
              >
                <span className="text-xs font-mono text-muted-foreground w-5 shrink-0">{i + 1}</span>
                {done ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground/40 shrink-0" />
                )}
                <span className="flex-1 text-sm font-medium group-hover:text-primary transition-colors">{l.title}</span>
                {l.tier !== "free" && <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
