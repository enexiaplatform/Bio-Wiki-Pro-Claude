import { Link } from "wouter";
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Flame,
  GraduationCap,
  Lock,
  Route as RouteIcon,
  Trophy,
} from "lucide-react";
import clsx from "clsx";
import { learningPaths } from "@/data/learningPaths";
import { listContent } from "@/lib/content";
import { useLanguage } from "@/hooks/use-language";
import { useReadLessons } from "@/hooks/use-read-lessons";
import { useStreak } from "@/hooks/use-streak";
import { useUser } from "@/context/UserContext";
import { ContinueLearning } from "@/components/ContinueLearning";
import { VerifyEmailBanner } from "@/components/VerifyEmailBanner";
import { useSEO } from "@/hooks/use-seo";

const statCardClass = "rounded-lg border border-white/10 bg-background/35 p-4";
const panelClass = "rounded-lg border border-white/10 bg-white/[0.035] p-5 shadow-lg shadow-black/10 md:p-6";

export default function MyLearningPage() {
  useSEO({ title: "My learning", description: "Your QC/QA learning progress, paths, and certificates." });
  const { language } = useLanguage();
  const { isRead, count } = useReadLessons();
  const { current: streak, longest: longestStreak } = useStreak();
  const { user } = useUser();

  const library = listContent({ collection: "academy", lang: language });
  const readInLibrary = library.filter((entry) => isRead(entry.slug)).length;
  const pct = library.length ? Math.round((readInLibrary / library.length) * 100) : 0;

  const paths = learningPaths.map((path) => {
    const done = path.lessonSlugs.filter((slug) => isRead(slug)).length;
    const total = path.lessonSlugs.length;
    return { ...path, done, total, complete: total > 0 && done === total, pct: total ? Math.round((done / total) * 100) : 0 };
  });
  const certificates = paths.filter((path) => path.complete);
  const completedPaths = certificates.length;
  const halfway = Math.ceil(library.length / 2);

  const badges = [
    { label: "First steps", desc: "Read your first lesson", earned: readInLibrary >= 1 },
    { label: "Getting serious", desc: "Read 10 lessons", earned: readInLibrary >= 10 },
    { label: "Halfway there", desc: `Read ${halfway} lessons`, earned: readInLibrary >= halfway },
    { label: "Path finisher", desc: "Complete a learning path", earned: completedPaths >= 1 },
    { label: "Track master", desc: "Complete every path", earned: completedPaths >= paths.length && paths.length > 0 },
    { label: "Completionist", desc: "Read every lesson", earned: library.length > 0 && readInLibrary >= library.length },
  ];
  const earnedCount = badges.filter((badge) => badge.earned).length;
  const greetingName = user?.firstName?.trim();

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-4 md:pt-8">
      <section className="mb-6 overflow-hidden rounded-lg border border-teal-400/20 bg-gradient-to-br from-teal-500/12 via-white/[0.045] to-emerald-500/10 p-6 shadow-xl shadow-black/15 md:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-400/25 bg-teal-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-teal-200">
              <GraduationCap className="h-3.5 w-3.5" />
              My learning
            </span>
            <h1 className="mt-5 font-display text-3xl font-bold leading-tight md:text-5xl">
              {greetingName ? `Welcome back, ${greetingName}` : "Track your learning momentum"}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Keep paths, certificates, lesson progress, and streaks in one calm workspace.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className={statCardClass}>
              <p className="text-2xl font-bold text-teal-200">{pct}%</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">Library read</p>
            </div>
            <div className={statCardClass}>
              <p className="text-2xl font-bold text-teal-200">{completedPaths}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">Paths done</p>
            </div>
            <div className={statCardClass}>
              <p className="text-2xl font-bold text-teal-200">{streak}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">Day streak</p>
            </div>
          </div>
        </div>
      </section>

      <VerifyEmailBanner />

      <section className={`${panelClass} mb-6`}>
        <div className="mb-3 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold">Library progress</p>
            <p className="mt-1 text-xs text-muted-foreground">{readInLibrary} of {library.length} lessons read</p>
          </div>
          {streak >= 1 && (
            <span
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300"
              title={longestStreak > streak ? `Longest streak: ${longestStreak} days` : undefined}
            >
              <Flame className="h-3.5 w-3.5" />
              {streak}-day streak
            </span>
          )}
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-white/10">
          <div className="h-full bg-teal-400 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          {pct === 100 ? "You've read the entire library. Nicely done." : `${pct}% of the in-depth library read.`}
        </p>
      </section>

      <div className="mb-8">
        <ContinueLearning />
      </div>

      <section className="mb-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className={panelClass}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-teal-300" />
              <h2 className="text-lg font-bold">Achievements</h2>
            </div>
            <span className="text-xs text-muted-foreground">{earnedCount} / {badges.length}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {badges.map((badge) => (
              <div
                key={badge.label}
                className={clsx(
                  "rounded-lg border p-4 text-center transition-colors",
                  badge.earned ? "border-teal-400/30 bg-teal-400/10" : "border-white/10 bg-background/35 opacity-70",
                )}
              >
                <div
                  className={clsx(
                    "mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg",
                    badge.earned ? "bg-teal-400/15 text-teal-200" : "bg-white/5 text-muted-foreground",
                  )}
                >
                  {badge.earned ? <Trophy className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                </div>
                <p className="text-sm font-semibold">{badge.label}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={panelClass}>
          <div className="mb-4 flex items-center gap-2">
            <RouteIcon className="h-4 w-4 text-teal-300" />
            <h2 className="text-lg font-bold">Learning paths</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {paths.map((path) => (
              <Link
                key={path.slug}
                href={`/paths/${path.slug}`}
                className="group rounded-lg border border-white/10 bg-background/35 p-4 transition-colors hover:border-teal-400/35"
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="text-sm font-bold transition-colors group-hover:text-teal-300">{path.title}</p>
                  {path.complete && (
                    <span className="inline-flex shrink-0 items-center gap-1 text-[11px] text-emerald-300">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Done
                    </span>
                  )}
                </div>
                <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">{path.description}</p>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div className={clsx("h-full", path.complete ? "bg-emerald-400" : "bg-teal-400")} style={{ width: `${path.pct}%` }} />
                  </div>
                  <span className="shrink-0 text-[11px] text-muted-foreground">{path.done}/{path.total}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {certificates.length > 0 && (
        <section className={`${panelClass} mb-8`}>
          <div className="mb-4 flex items-center gap-2">
            <Award className="h-4 w-4 text-teal-300" />
            <h2 className="text-lg font-bold">Certificates earned</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {certificates.map((path) => (
              <Link
                key={path.slug}
                href={`/certificate/${path.slug}`}
                className="group rounded-lg border border-teal-400/25 bg-teal-400/10 p-4 transition-colors hover:border-teal-400/45"
              >
                <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-teal-200">
                  <Award className="h-3.5 w-3.5" />
                  Certificate
                </div>
                <p className="text-sm font-bold transition-colors group-hover:text-teal-200">{path.title}</p>
                <span className="mt-2 inline-flex items-center gap-1 text-xs text-teal-200">
                  View and print
                  <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="flex flex-col items-start gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold">Ready for the next lesson?</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {count === 0 ? "Open any lesson and your progress will show up here." : "Browse the full library or continue from your active path."}
          </p>
        </div>
        <Link href="/academy" className="inline-flex items-center gap-2 rounded-lg bg-teal-400 px-4 py-2 text-sm font-bold text-teal-950 transition-colors hover:bg-teal-300">
          <BookOpen className="h-4 w-4" />
          Browse library
        </Link>
      </div>
    </div>
  );
}
