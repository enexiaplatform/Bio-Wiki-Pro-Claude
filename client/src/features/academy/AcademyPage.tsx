import { useMemo, useState } from "react";
import { BookOpen, Filter, Search, ShieldCheck, ChevronRight, Crown, CheckCircle2 } from "lucide-react";
import clsx from "clsx";
import { Link } from "wouter";
import { microbiologyLessons } from "@/data/lessons/microbiologyLessons";
import { LessonCard } from "./LessonCard";
import { useSEO } from "@/hooks/use-seo";
import { useTranslation } from "react-i18next";
import { LeadMagnetBanner } from "@/components/LeadMagnetBanner";
import { listContent } from "@/lib/content";
import { useLanguage } from "@/hooks/use-language";
import { useReadLessons } from "@/hooks/use-read-lessons";
import { ContinueLearning } from "@/components/ContinueLearning";
import { learningPaths } from "@/data/learningPaths";

const all = "All";

export default function AcademyPage() {
  const { t } = useTranslation("sections");
  const { language } = useLanguage();
  const { isRead, count: readCount } = useReadLessons();
  useSEO({ title: t("academy.seoTitle"), description: t("academy.seoDesc") });

  // MDX lessons from the content engine.
  const libraryEntries = listContent({ collection: "academy", lang: language });
  const readInLibrary = libraryEntries.filter((e) => isRead(e.slug)).length;
  const progressPct = libraryEntries.length ? Math.round((readInLibrary / libraryEntries.length) * 100) : 0;
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(all);
  const [level, setLevel] = useState(all);

  const categories = useMemo(() => [all, ...Array.from(new Set(microbiologyLessons.map((lesson) => lesson.category)))], []);
  const levels = useMemo(() => [all, ...Array.from(new Set(microbiologyLessons.map((lesson) => lesson.level)))], []);

  const filteredLessons = microbiologyLessons.filter((lesson) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || [lesson.title, lesson.subtitle, lesson.summary, lesson.category].some((value) => value.toLowerCase().includes(query));
    const matchesCategory = category === all || lesson.category === category;
    const matchesLevel = level === all || lesson.level === level;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  return (
    <div className="pb-24 pt-4 md:pt-8 max-w-6xl mx-auto px-4">
      <LeadMagnetBanner />
      <section className="mb-8 rounded-2xl border border-white/10 bg-card p-5 md:p-7 shadow-xl shadow-black/10">
        <div className="flex items-start gap-4">
          <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-primary/10 text-primary items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">{t("academy.eyebrow")}</p>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">{t("academy.title")}</h1>
            <p className="text-muted-foreground max-w-3xl leading-relaxed">
              {t("academy.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {libraryEntries.length > 0 && <ContinueLearning />}

      {/* Learning paths */}
      <section className="mb-8">
        <h2 className="text-lg font-bold mb-1">Learning paths</h2>
        <p className="text-sm text-muted-foreground mb-4">Structured tracks that take you from fundamentals to audit-ready.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {learningPaths.map((p) => {
            const done = p.lessonSlugs.filter((s) => isRead(s)).length;
            const total = p.lessonSlugs.length;
            const pct = total ? Math.round((done / total) * 100) : 0;
            return (
              <Link
                key={p.slug}
                href={`/paths/${p.slug}`}
                className="block rounded-2xl border border-white/10 bg-card p-4 hover:border-primary/30 transition-colors group"
              >
                <p className="font-bold text-sm mb-1 group-hover:text-primary transition-colors">{p.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{p.description}</p>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[11px] text-muted-foreground shrink-0">{done}/{total}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {libraryEntries.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-1">{t("academy.libraryHeading")}</h2>
          <p className="text-sm text-muted-foreground mb-3">{t("academy.librarySubtitle")}</p>

          {/* Reading progress */}
          <div className="mb-4 flex items-center gap-3">
            <div className="h-1.5 flex-1 rounded-full bg-white/10 overflow-hidden max-w-xs">
              <div className="h-full bg-primary transition-all" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="text-xs text-muted-foreground shrink-0">
              {t("academy.progress", { read: readInLibrary, total: libraryEntries.length })}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {libraryEntries.map((e) => (
              <Link
                key={e.slug}
                href={`/library/${e.slug}`}
                className="block rounded-2xl border border-white/10 bg-card p-4 hover:border-primary/30 transition-colors group"
              >
                <div className="flex items-center gap-2 text-[11px] mb-2">
                  <span className="rounded-md bg-primary/10 text-primary px-2 py-0.5 font-semibold">{e.category}</span>
                  <span
                    className={clsx(
                      "rounded-md px-2 py-0.5 font-semibold inline-flex items-center gap-1",
                      e.tier === "free" ? "bg-emerald-400/10 text-emerald-400" : "bg-amber-400/10 text-amber-400"
                    )}
                  >
                    {e.tier !== "free" && <Crown className="w-3 h-3" />}
                    {t(e.tier === "free" ? "academy.tierFree" : e.tier === "paid" ? "academy.tierPaid" : "academy.tierPro")}
                  </span>
                </div>
                <p className="font-bold text-sm mb-1 group-hover:text-primary transition-colors">{e.title}</p>
                {e.seoDescription && <p className="text-xs text-muted-foreground line-clamp-2">{e.seoDescription}</p>}
                <div className="flex items-center justify-between mt-2">
                  <span className="inline-flex items-center gap-1 text-xs text-primary">
                    {t("academy.readMore")} <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                  {isRead(e.slug) && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {t("academy.readBadge")}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4 mb-8 sticky top-[60px] md:top-20 z-30 bg-background/95 backdrop-blur-xl py-3 -mx-4 px-4 border-b border-white/5 md:static md:border-none md:bg-transparent md:p-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("academy.search")}
            className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm outline-none transition focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_1fr]">
          <FilterBar label={t("academy.filterCategory")} values={categories} active={category} onChange={setCategory} />
          <FilterBar label={t("academy.filterLevel")} values={levels} active={level} onChange={setLevel} />
        </div>
      </section>

      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <BookOpen className="w-4 h-4 text-primary" />
        <span>{filteredLessons.length} {t("academy.lessonCount")}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredLessons.map((lesson) => (
          <LessonCard key={lesson.id} lesson={lesson} />
        ))}
      </div>

      {filteredLessons.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-card p-10 text-center text-muted-foreground">
          No matching lessons yet. Try a broader search or filter.
        </div>
      )}
    </div>
  );
}

function FilterBar({ label, values, active, onChange }: { label: string; values: string[]; active: string; onChange: (value: string) => void }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <Filter className="w-3.5 h-3.5" />
        {label}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {values.map((value) => (
          <button
            key={value}
            onClick={() => onChange(value)}
            className={clsx(
              "shrink-0 rounded-full border px-4 py-1.5 text-xs font-medium transition-colors",
              active === value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:border-primary/50",
            )}
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  );
}
