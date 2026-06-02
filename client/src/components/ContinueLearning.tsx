import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { ArrowRight, GraduationCap } from "lucide-react";
import { listContent } from "@/lib/content";
import { useLanguage } from "@/hooks/use-language";
import { useReadLessons } from "@/hooks/use-read-lessons";

/**
 * Suggests the next unread Academy lesson based on reading progress.
 * Renders nothing once every lesson has been read.
 */
export function ContinueLearning() {
  const { t } = useTranslation("sections");
  const { language } = useLanguage();
  const { isRead, count } = useReadLessons();

  const lessons = listContent({ collection: "academy", lang: language });
  const next = lessons.find((l) => !isRead(l.slug));
  if (!next) return null;

  const started = count > 0;

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 mb-6 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
        <GraduationCap className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] uppercase font-bold tracking-wider text-primary">
          {started ? t("academy.continueTitle") : t("academy.startTitle")}
        </p>
        <p className="font-bold text-sm truncate">{next.title}</p>
      </div>
      <Link
        href={`/library/${next.slug}`}
        className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
      >
        {started ? t("academy.continueCta") : t("academy.startCta")}
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
