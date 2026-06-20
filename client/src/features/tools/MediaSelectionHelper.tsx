import { useState } from "react";
import { FlaskConical, CheckCircle2, ShieldX, Info } from "lucide-react";
import { mediaRecommendations } from "@/data/tools/mediaSelector";

/**
 * Culture Media Selection Helper — static decision helper mapping a QC test to a
 * recommended medium and its growth-promotion strains. General educational
 * guidance, not a validated method.
 */
export function MediaSelectionHelper() {
  const [selectedId, setSelectedId] = useState(mediaRecommendations[0].id);
  const rec = mediaRecommendations.find((m) => m.id === selectedId) ?? mediaRecommendations[0];

  return (
    <section className="rounded-2xl border border-white/10 bg-card p-5 md:p-6">
      <div className="flex items-center gap-2 mb-1.5">
        <FlaskConical className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold">Culture Media Selection Helper</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        Pick the test to see the recommended medium and the growth-promotion strains used to
        qualify it. General guidance — verify against the current pharmacopeia (USP/EP/JP) and your
        approved SOP.
      </p>

      <div className="grid lg:grid-cols-[300px_1fr] gap-5">
        {/* Purposes */}
        <div className="space-y-2" role="group" aria-label="Test purpose">
          {mediaRecommendations.map((m) => {
            const active = m.id === selectedId;
            return (
              <button
                key={m.id}
                onClick={() => setSelectedId(m.id)}
                aria-pressed={active}
                className={active
                  ? "w-full text-left rounded-xl border border-primary/40 bg-primary/10 p-3 text-sm font-medium"
                  : "w-full text-left rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-muted-foreground hover:border-primary/30 transition-colors"}
              >
                {m.purpose}
              </button>
            );
          })}
        </div>

        {/* Recommendation */}
        <div className="space-y-4">
          <div className="rounded-xl border border-teal-500/30 bg-teal-500/10 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-teal-300 mb-1">Recommended medium</p>
            <h3 className="text-lg font-bold text-teal-200">{rec.media}</h3>
            <p className="text-sm text-muted-foreground mt-1.5">{rec.rationale}</p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Growth-promotion strains</p>
            <div className="flex flex-wrap gap-2">
              {rec.gptStrains.map((s) => (
                <span
                  key={s.strain}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium ${
                    s.role === "Recovery"
                      ? "border-teal-500/25 bg-teal-500/10 text-teal-200"
                      : "border-amber-500/25 bg-amber-500/10 text-amber-100"
                  }`}
                >
                  {s.role === "Recovery"
                    ? <CheckCircle2 className="w-3.5 h-3.5" />
                    : <ShieldX className="w-3.5 h-3.5" />}
                  {s.strain}
                  <span className="opacity-60">· {s.role}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Notes</p>
            <p className="text-sm leading-relaxed">{rec.notes}</p>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed flex items-start gap-1.5">
            <Info className="w-3 h-3 mt-0.5 shrink-0 text-primary/70" />
            General educational workflow. Confirm media, strains, and conditions against the current
            pharmacopeia monograph and your approved SOP — not a substitute for QA approval or a validated method.
          </p>
        </div>
      </div>
    </section>
  );
}
