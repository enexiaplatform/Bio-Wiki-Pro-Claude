import type { ReactNode } from "react";
import { ShieldAlert } from "lucide-react";
import { EditorialImage } from "@/components/EditorialImage";

type HeroTone = "teal" | "sky" | "amber";
type BoundaryTone = "amber" | "red";

type QualityLabEditorialHeroProps = {
  eyebrow: ReactNode;
  title: string;
  description: string;
  image: {
    src: string;
    alt: string;
    creditName: string;
    creditUrl: string;
    className?: string;
  };
  tone?: HeroTone;
  boundary?: {
    label: string;
    text: string;
    tone?: BoundaryTone;
  };
  actions?: ReactNode;
};

const heroTone: Record<HeroTone, string> = {
  teal: "border-teal-300/20 bg-gradient-to-br from-teal-300/12 via-sky-300/[0.055] to-transparent",
  sky: "border-sky-300/20 bg-gradient-to-br from-sky-300/12 via-teal-300/[0.055] to-transparent",
  amber: "border-amber-300/20 bg-gradient-to-br from-amber-300/10 via-sky-300/[0.045] to-transparent",
};

const boundaryTone: Record<BoundaryTone, string> = {
  amber: "border-amber-300/15 bg-amber-300/[0.04] text-amber-200",
  red: "border-red-300/15 bg-red-300/[0.04] text-red-200",
};

export function QualityLabEditorialHero({
  eyebrow,
  title,
  description,
  image,
  tone = "teal",
  boundary,
  actions,
}: QualityLabEditorialHeroProps) {
  const boundaryClass = boundaryTone[boundary?.tone ?? "amber"];

  return (
    <header className={`overflow-hidden rounded-3xl border p-4 md:p-6 ${heroTone[tone]}`}>
      <div className="grid gap-5 lg:grid-cols-[1.06fr_0.94fr] lg:items-stretch">
        <div className="flex flex-col p-2 md:p-4">
          <div>{eyebrow}</div>
          <h1 className="mt-5 max-w-4xl font-display text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">{title}</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">{description}</p>
          {actions ? <div className="mt-5 flex flex-wrap gap-3">{actions}</div> : null}
        </div>

        <EditorialImage
          src={image.src}
          alt={image.alt}
          creditName={image.creditName}
          creditUrl={image.creditUrl}
          eager
          className="h-48 rounded-2xl border border-white/10 sm:h-60 lg:h-auto lg:min-h-72"
          imageClassName={`${image.className ?? "object-center"} saturate-75`}
        />
      </div>

      {boundary ? (
        <>
          <details className={`group mt-4 rounded-xl border p-4 text-xs leading-6 lg:hidden ${boundaryClass}`}>
            <summary className="flex cursor-pointer list-none items-center gap-2 font-bold text-slate-200 marker:content-none">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              {boundary.label}
              <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider opacity-70 group-open:hidden">Read limits</span>
            </summary>
            <p className="mt-3 border-t border-white/10 pt-3 text-slate-400">{boundary.text}</p>
          </details>
          <div className={`mt-4 hidden gap-3 rounded-xl border p-4 text-xs leading-6 lg:flex ${boundaryClass}`}>
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="text-slate-400"><strong className="text-slate-200">{boundary.label}:</strong> {boundary.text}</p>
          </div>
        </>
      ) : null}
    </header>
  );
}
