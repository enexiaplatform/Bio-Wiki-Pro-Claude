import { useEffect } from "react";
import { AlertTriangle, BadgeCheck, ExternalLink, ShieldCheck } from "lucide-react";
import type { PublicContentQuality } from "@shared/content-quality";
import { EVIDENCE_SOURCE_CATALOG } from "@shared/content-quality-registry";
import { analytics } from "@/hooks/use-analytics";

export function ContentQualityNotice({ contentId, quality }: { contentId: string; quality: PublicContentQuality }) {
  useEffect(() => {
    analytics.contentQualityStatusViewed(contentId, quality.contentVersion, quality.reviewStatus, quality.score);
  }, [contentId, quality.contentVersion, quality.reviewStatus, quality.score]);

  const reviewed = quality.reviewStatus !== "under-review";
  const Icon = quality.reviewStatus === "sme-reviewed" ? ShieldCheck : reviewed ? BadgeCheck : AlertTriangle;
  const label = quality.reviewStatus === "sme-reviewed"
    ? "SME reviewed"
    : quality.reviewStatus === "editorial-reviewed"
      ? "Editorially reviewed"
      : "Under review";
  const sources = new Map(EVIDENCE_SOURCE_CATALOG.sources.map((source) => [source.id, source]));

  return (
    <section className="mb-6 rounded-xl border border-white/10 bg-white/[0.035] p-4" aria-label="Content quality status">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${reviewed ? "bg-emerald-400/10 text-emerald-300" : "bg-amber-400/10 text-amber-300"}`}>
          <Icon className="h-3.5 w-3.5" /> {label}
        </span>
        <span className="text-xs text-muted-foreground">v{quality.contentVersion} · {quality.sourceCount} sources · quality score {quality.score}/100</span>
      </div>
      {!reviewed && <p className="mt-2 text-sm text-muted-foreground">This content remains accessible for orientation, but it is not currently used as evidence for a promoted product claim.</p>}
      {quality.limitations.length > 0 && <p className="mt-2 text-xs text-muted-foreground"><span className="font-semibold text-foreground">Limit:</span> {quality.limitations[0]}</p>}
      {quality.claimSourceBindings.length > 0 && <details className="mt-3 border-t border-white/10 pt-3">
        <summary className="cursor-pointer text-xs font-semibold text-foreground">Inspect {quality.claimSourceBindings.length} bounded claim-to-source binding{quality.claimSourceBindings.length === 1 ? "" : "s"}</summary>
        <div className="mt-3 space-y-3">
          {quality.claimSourceBindings.map((binding) => <article key={binding.claimId} className="rounded-lg border border-white/10 bg-black/10 p-3 text-xs leading-5 text-muted-foreground">
            <p className="font-semibold text-foreground">{binding.claim}</p>
            <p className="mt-2"><span className="font-semibold text-foreground">Applicability:</span> {binding.applicability}</p>
            <p className="mt-1"><span className="font-semibold text-foreground">Boundary:</span> {binding.limitation}</p>
            <ul className="mt-2 space-y-1" aria-label={`Sources for ${binding.claimId}`}>
              {binding.sourceIds.map((sourceId) => {
                const source = sources.get(sourceId);
                return <li key={sourceId}>{source ? <a href={source.locator} target="_blank" rel="noreferrer" className="inline-flex items-start gap-1 font-medium text-sky-300 hover:text-sky-200">{source.title} · {source.edition}<ExternalLink className="mt-0.5 h-3 w-3 shrink-0" /></a> : sourceId}</li>;
              })}
            </ul>
            <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-amber-300">{binding.status.replaceAll("-", " ")}</p>
          </article>)}
        </div>
      </details>}
    </section>
  );
}
