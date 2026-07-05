import { useEffect, useMemo, useState } from "react";
import { BookOpen, Filter, Search, ShieldCheck, ChevronRight, Crown, CheckCircle2, GraduationCap } from "lucide-react";
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
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site";

const all = "All";
const pillClass = "inline-flex items-center gap-2 rounded-full border border-teal-400/20 bg-teal-400/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-teal-300";
const hubCardClass = "rounded-lg border border-white/10 bg-white/[0.045] shadow-lg shadow-black/10 transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:bg-white/[0.07]";

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

  // Library (MDX) filters — independent from the legacy lesson filters below.
  // Initialized from (and synced back to) the URL so category/tier views are shareable.
  const [libQuery, setLibQuery] = useState(() => new URLSearchParams(window.location.search).get("q") ?? "");
  const [libCategory, setLibCategory] = useState(() => new URLSearchParams(window.location.search).get("category") ?? all);
  const [libTier, setLibTier] = useState(() => new URLSearchParams(window.location.search).get("tier") ?? all);

  useEffect(() => {
    const p = new URLSearchParams();
    if (libQuery.trim()) p.set("q", libQuery.trim());
    if (libCategory !== all) p.set("category", libCategory);
    if (libTier !== all) p.set("tier", libTier);
    const qs = p.toString();
    window.history.replaceState(null, "", qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
  }, [libQuery, libCategory, libTier]);

  const libCategories = [all, ...Array.from(new Set(libraryEntries.map((e) => e.category)))];
  const libTiers = [all, ...Array.from(new Set(libraryEntries.map((e) => e.tier)))];
  const tierLabel = (v: string) =>
    v === all ? all : t(v === "free" ? "academy.tierFree" : v === "paid" ? "academy.tierPaid" : "academy.tierPro");

  const filteredLibrary = libraryEntries.filter((e) => {
    const q = libQuery.trim().toLowerCase();
    const matchesQuery = !q || [e.title, e.seoDescription ?? "", e.category].some((v) => v.toLowerCase().includes(q));
    const matchesCategory = libCategory === all || e.category === libCategory;
    const matchesTier = libTier === all || e.tier === libTier;
    return matchesQuery && matchesCategory && matchesTier;
  });

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
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-4 md:pt-8">
      {libraryEntries.length > 0 && (
        <JsonLd
          id="academy-itemlist"
          data={{
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Life Science Atlas Academy library",
            itemListElement: libraryEntries.map((e, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${SITE_URL}/library/${e.slug}`,
              name: e.title,
            })),
          }}
        />
      )}
      <LeadMagnetBanner />
      <section className="relative mb-6 overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-teal-400/10 via-white/[0.04] to-transparent p-5 shadow-xl shadow-black/10 md:p-7">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_10%,rgba(20,184,166,0.18),transparent_30%),radial-gradient(circle_at_86%_18%,rgba(16,185,129,0.1),transparent_28%)]" />
        <div className="grid gap-6 lg:grid-cols-[1fr_19rem] lg:items-end">
          <div className="flex items-start gap-4">
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:flex">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className={`${pillClass} mb-3`}>{t("academy.eyebrow")}</p>
              <h1 className="mb-3 max-w-3xl font-display text-3xl font-bold leading-tight md:text-5xl">{t("academy.title")}</h1>
              <p className="max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
                {t("academy.subtitle")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-lg border border-white/10 bg-slate-950/45 p-3">
            <div>
              <div className="text-xl font-bold text-teal-300">{libraryEntries.length}</div>
              <div className="text-[11px] text-muted-foreground">Lessons</div>
            </div>
            <div>
              <div className="text-xl font-bold text-teal-300">{learningPaths.length}</div>
              <div className="text-[11px] text-muted-foreground">Paths</div>
            </div>
            <div>
              <div className="text-xl font-bold text-teal-300">{readCount}</div>
              <div className="text-[11px] text-muted-foreground">Read</div>
            </div>
          </div>
        </div>
      </section>

      {libraryEntries.length > 0 && (
        <div className="mb-8">
          <ContinueLearning />
        </div>
      )}

      {/* Learning paths */}
      <section className="mb-8">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="mb-1 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-300">
              <BookOpen className="h-3.5 w-3.5" />
              Start with a path
            </p>
            <h2 className="text-lg font-bold">Learning paths</h2>
            <p className="text-sm text-muted-foreground">Structured tracks that take you from fundamentals to audit-ready.</p>
          </div>
          <span className="hidden text-sm text-muted-foreground sm:inline">{learningPaths.length} tracks</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {learningPaths.map((p) => {
            const done = p.lessonSlugs.filter((s) => isRead(s)).length;
            const total = p.lessonSlugs.length;
            const pct = total ? Math.round((done / total) * 100) : 0;
            return (
              <Link
                key={p.slug}
                href={`/paths/${p.slug}`}
                className={`group block p-4 ${hubCardClass}`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="font-bold text-sm group-hover:text-primary transition-colors">{p.title}</p>
                  {done === total && total > 0 && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{p.description}</p>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-white/10 overflow-hidden">
                    <div className={clsx("h-full", done === total && total > 0 ? "bg-emerald-400" : "bg-primary")} style={{ width: `${pct}%` }} />
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
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold">{t("academy.libraryHeading")}</h2>
              <p className="text-sm text-muted-foreground">{t("academy.librarySubtitle")}</p>
            </div>
            <span className="hidden text-sm text-muted-foreground sm:inline">{filteredLibrary.length} shown</span>
          </div>

          {/* Reading progress */}
          <div className="mb-4 flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-3">
            <div className="h-1.5 flex-1 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-primary transition-all" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="text-xs text-muted-foreground shrink-0">
              {t("academy.progress", { read: readInLibrary, total: libraryEntries.length })}
            </span>
          </div>

          {/* Library filters */}
          <div className="space-y-3 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={libQuery}
                onChange={(event) => setLibQuery(event.target.value)}
                placeholder="Search the library…"
                className="w-full rounded-lg border border-white/10 bg-background/70 py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-teal-400/50 focus:ring-2 focus:ring-teal-400/20"
              />
            </div>
            <div className="grid gap-3 md:grid-cols-[1fr_1fr]">
              <FilterBar label="Category" values={libCategories} active={libCategory} onChange={setLibCategory} />
              <FilterBar label="Access" values={libTiers} active={libTier} onChange={setLibTier} labelFor={tierLabel} />
            </div>
          </div>

          <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
            <BookOpen className="w-3.5 h-3.5 text-primary" />
            <span>
              {filteredLibrary.length} {filteredLibrary.length === 1 ? "lesson" : "lessons"}
              {filteredLibrary.length !== libraryEntries.length && ` of ${libraryEntries.length}`}
            </span>
          </div>

          {filteredLibrary.length === 0 ? (
            <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.035] p-8 text-center text-sm text-muted-foreground">
              No lessons match your search. Try a broader term or clear the filters.
            </div>
          ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filteredLibrary.map((e) => (
              <Link
                key={e.slug}
                href={`/library/${e.slug}`}
                className={`group block p-4 ${hubCardClass}`}
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
                  <span className="text-muted-foreground">{e.readMinutes} min</span>
                  {e.quiz && e.quiz.length > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-sky-400/10 text-sky-300 px-2 py-0.5 font-semibold">
                      <GraduationCap className="w-3 h-3" /> Quiz
                    </span>
                  )}
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
          )}
        </section>
      )}

      <section className="mb-3">
        <p className="mb-1 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-300">
          <GraduationCap className="h-3.5 w-3.5" />
          Guided practice
        </p>
        <h2 className="text-lg font-bold mb-1">{t("academy.guidedHeading")}</h2>
        <p className="text-sm text-muted-foreground">{t("academy.guidedSubtitle")}</p>
      </section>

      <section className="space-y-4 mb-8 sticky top-[60px] md:top-20 z-30 bg-background/95 backdrop-blur-xl py-3 -mx-4 px-4 border-b border-white/5 md:static md:rounded-lg md:border md:border-white/10 md:bg-white/[0.035] md:p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("academy.search")}
            className="w-full rounded-lg border border-white/10 bg-background/70 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-teal-400/50 focus:ring-2 focus:ring-teal-400/20"
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
        <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.035] p-10 text-center text-muted-foreground">
          No matching lessons yet. Try a broader search or filter.
        </div>
      )}
    </div>
  );
}

function FilterBar({ label, values, active, onChange, labelFor }: { label: string; values: string[]; active: string; onChange: (value: string) => void; labelFor?: (value: string) => string }) {
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
              "shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors",
              active === value ? "border-teal-400/40 bg-teal-400/15 text-teal-200" : "border-white/10 bg-white/[0.04] text-muted-foreground hover:border-white/20 hover:text-foreground",
            )}
          >
            {labelFor ? labelFor(value) : value}
          </button>
        ))}
      </div>
    </div>
  );
}
