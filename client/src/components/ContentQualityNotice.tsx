import { useEffect } from "react";
import { AlertTriangle, BadgeCheck, ShieldCheck } from "lucide-react";
import type { PublicContentQuality } from "@shared/content-quality";
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

  return (
    <section className="mb-6 rounded-xl border border-white/10 bg-white/[0.035] p-4" aria-label="Content quality status">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${reviewed ? "bg-emerald-400/10 text-emerald-300" : "bg-amber-400/10 text-amber-300"}`}>
          <Icon className="h-3.5 w-3.5" /> {label}
        </span>
        <span className="text-xs text-muted-foreground">v{quality.contentVersion} · {quality.sourceCount} sources · quality score {quality.score}/100</span>
      </div>
      {!reviewed && <p className="mt-2 text-sm text-muted-foreground">This lesson remains accessible, but it is not currently used as evidence for a promoted product claim.</p>}
      {quality.limitations.length > 0 && <p className="mt-2 text-xs text-muted-foreground"><span className="font-semibold text-foreground">Limit:</span> {quality.limitations[0]}</p>}
    </section>
  );
}
