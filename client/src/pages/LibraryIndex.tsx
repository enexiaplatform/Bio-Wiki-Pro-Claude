import { Link } from "wouter";
import { Crown, ChevronRight, Clock, GraduationCap, Route as RouteIcon } from "lucide-react";
import { learningPaths } from "@/data/learningPaths";
import { getContentBySlug, listContent } from "@/lib/content";
import { useLanguage } from "@/hooks/use-language";
import { useSEO } from "@/hooks/use-seo";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site";

export default function LibraryIndex() {
  const { language } = useLanguage();
  useSEO({
    title: "Library — all QC/QA lessons",
    description: "The full Life Science Atlas library: every GMP / QC / QA lesson, organized into structured learning paths — sterility, validation, data integrity, quality systems, and more.",
  });

  const all = listContent({ collection: "academy", lang: language });

  const sections = learningPaths.map((p) => ({
    path: p,
    lessons: p.lessonSlugs
      .map((s) => getContentBySlug("academy", s, language))
      .filter((e): e is NonNullable<typeof e> => !!e),
  }));

  return (
    <div className="pb-24 pt-4 md:pt-8 max-w-3xl mx-auto px-4">
      <JsonLd
        id="library-collection"
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Life Science Atlas Library",
          url: `${SITE_URL}/library`,
          hasPart: all.map((e) => ({
            "@type": "LearningResource",
            name: e.title,
            url: `${SITE_URL}/library/${e.slug}`,
          })),
        }}
      />

      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6 flex-wrap">
        <Link href="/" className="hover:text-primary">Life Science Atlas</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground">Library</span>
      </nav>

      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <GraduationCap className="w-5 h-5" />
        </div>
        <h1 className="text-2xl md:text-3xl font-display font-bold">The library</h1>
      </div>
      <p className="text-muted-foreground mb-8">
        {all.length} in-depth GMP / QC / QA lessons, organized into {learningPaths.length} structured learning paths. Browse by path below, or
        {" "}<Link href="/academy" className="text-primary hover:underline">search the full library</Link>.
      </p>

      <div className="space-y-10">
        {sections.map(({ path, lessons }) => (
          <section key={path.slug}>
            <div className="flex items-center justify-between gap-3 mb-1">
              <div className="flex items-center gap-2">
                <RouteIcon className="w-4 h-4 text-primary" />
                <h2 className="text-lg font-bold">{path.title}</h2>
              </div>
              <Link href={`/paths/${path.slug}`} className="text-xs text-primary hover:underline shrink-0">
                View path →
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{path.description}</p>
            <ul className="rounded-2xl border border-white/10 bg-card divide-y divide-white/5 overflow-hidden">
              {lessons.map((e, i) => (
                <li key={e.slug}>
                  <Link
                    href={`/library/${e.slug}`}
                    className="flex items-center gap-3 p-3.5 hover:bg-white/5 transition-colors group"
                  >
                    <span className="text-xs font-mono text-muted-foreground w-5 shrink-0">{i + 1}</span>
                    <span className="flex-1 text-sm font-medium group-hover:text-primary transition-colors">{e.title}</span>
                    {e.tier !== "free" && <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                    <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-muted-foreground shrink-0">
                      <Clock className="w-3 h-3" /> {e.readMinutes}m
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
