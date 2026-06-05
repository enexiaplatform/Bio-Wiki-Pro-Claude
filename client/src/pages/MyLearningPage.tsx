import { Link } from "wouter";
import { GraduationCap, Award, CheckCircle2, ChevronRight, Route as RouteIcon, BookOpen } from "lucide-react";
import clsx from "clsx";
import { learningPaths } from "@/data/learningPaths";
import { listContent } from "@/lib/content";
import { useLanguage } from "@/hooks/use-language";
import { useReadLessons } from "@/hooks/use-read-lessons";
import { useUser } from "@/context/UserContext";
import { ContinueLearning } from "@/components/ContinueLearning";
import { useSEO } from "@/hooks/use-seo";

export default function MyLearningPage() {
  useSEO({ title: "My learning", description: "Your QC/QA learning progress, paths, and certificates." });
  const { language } = useLanguage();
  const { isRead, count } = useReadLessons();
  const { user } = useUser();

  const library = listContent({ collection: "academy", lang: language });
  const readInLibrary = library.filter((e) => isRead(e.slug)).length;
  const pct = library.length ? Math.round((readInLibrary / library.length) * 100) : 0;

  const paths = learningPaths.map((p) => {
    const done = p.lessonSlugs.filter((s) => isRead(s)).length;
    const total = p.lessonSlugs.length;
    return { ...p, done, total, complete: total > 0 && done === total, pct: total ? Math.round((done / total) * 100) : 0 };
  });
  const certificates = paths.filter((p) => p.complete);

  const greetingName = user?.firstName?.trim();

  return (
    <div className="pb-24 pt-4 md:pt-8 max-w-3xl mx-auto px-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">My learning</h1>
          <p className="text-sm text-muted-foreground">
            {greetingName ? `Welcome back, ${greetingName}.` : "Track your progress, paths, and certificates."}
          </p>
        </div>
      </div>

      {/* Overall library progress */}
      <div className="rounded-2xl border border-white/10 bg-card p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold">Library progress</p>
          <span className="text-xs text-muted-foreground">{readInLibrary} / {library.length} lessons</span>
        </div>
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {pct === 100 ? "You've read the entire library — outstanding." : `${pct}% of the in-depth library read.`}
        </p>
      </div>

      <ContinueLearning />

      {/* Certificates earned */}
      {certificates.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-4 h-4 text-primary" />
            <h2 className="text-lg font-bold">Certificates earned</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {certificates.map((p) => (
              <Link
                key={p.slug}
                href={`/certificate/${p.slug}`}
                className="group rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/10 to-transparent p-4 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center gap-2 text-xs text-primary font-semibold mb-1">
                  <Award className="w-3.5 h-3.5" /> Certificate
                </div>
                <p className="font-bold text-sm group-hover:text-primary transition-colors">{p.title}</p>
                <span className="inline-flex items-center gap-1 text-xs text-primary mt-2">
                  View &amp; print <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Learning paths */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <RouteIcon className="w-4 h-4 text-primary" />
          <h2 className="text-lg font-bold">Learning paths</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {paths.map((p) => (
            <Link
              key={p.slug}
              href={`/paths/${p.slug}`}
              className="group rounded-2xl border border-white/10 bg-card p-4 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="font-bold text-sm group-hover:text-primary transition-colors">{p.title}</p>
                {p.complete && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Done
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{p.description}</p>
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={clsx("h-full", p.complete ? "bg-emerald-400" : "bg-primary")}
                    style={{ width: `${p.pct}%` }}
                  />
                </div>
                <span className="text-[11px] text-muted-foreground shrink-0">{p.done}/{p.total}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Link
        href="/academy"
        className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
      >
        <BookOpen className="w-4 h-4" /> Browse the full library
      </Link>

      {count === 0 && (
        <p className="text-xs text-muted-foreground mt-4">
          You haven't started yet — open any lesson and your progress will show up here.
        </p>
      )}
    </div>
  );
}
