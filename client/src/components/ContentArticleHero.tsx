import { Clock, ShieldCheck } from "lucide-react";
import { EditorialImage } from "@/components/EditorialImage";
import { getContentVisual } from "@/data/contentVisuals";

type ContentArticleHeroProps = {
  title: string;
  description?: string;
  category: string;
  readMinutes: number;
  label: string;
};

export function ContentArticleHero({ title, description, category, readMinutes, label }: ContentArticleHeroProps) {
  const visual = getContentVisual(category);

  return (
    <header className="mb-8 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.025] shadow-2xl shadow-black/15">
      <EditorialImage
        src={visual.src}
        alt={visual.alt}
        creditName={visual.creditName}
        creditUrl={visual.creditUrl}
        eager
        className="h-48 border-b border-white/10 sm:h-64"
        imageClassName={`${visual.focalPoint} opacity-75 saturate-75`}
      />
      <div className="p-5 sm:p-7">
        <div className="mb-4 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em]">
          <span className="rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1.5 text-teal-200">{category}</span>
          <span className="inline-flex items-center gap-1.5 text-slate-400"><Clock className="h-3.5 w-3.5" /> {readMinutes} min</span>
          <span className="inline-flex items-center gap-1.5 text-slate-400"><ShieldCheck className="h-3.5 w-3.5" /> {label}</span>
        </div>
        <h1 className="max-w-3xl font-display text-3xl font-bold leading-tight text-white sm:text-4xl">{title}</h1>
        {description && <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">{description}</p>}
      </div>
    </header>
  );
}
