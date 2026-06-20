import { useState } from "react";
import { Droplets, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { waterUseCases } from "@/data/tools/waterSelector";

/**
 * Lab Water Type Selector — static decision helper that maps a use case to a
 * recommended water grade. General educational guidance, not a validated method.
 */
export function WaterTypeSelector() {
  const [selectedId, setSelectedId] = useState(waterUseCases[0].id);
  const uc = waterUseCases.find((w) => w.id === selectedId) ?? waterUseCases[0];

  return (
    <section className="rounded-2xl border border-white/10 bg-card p-5 md:p-6">
      <div className="flex items-center gap-2 mb-1.5">
        <Droplets className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold">Lab Water Type Selector</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        Pick what you&rsquo;re using the water for to see the recommended grade and its key controls.
        General guidance — verify against your pharmacopeia (USP/EP/JP) and validated water system.
      </p>

      <div className="grid lg:grid-cols-[300px_1fr] gap-5">
        {/* Use cases */}
        <div className="space-y-2" role="group" aria-label="Water use case">
          {waterUseCases.map((w) => {
            const active = w.id === selectedId;
            return (
              <button
                key={w.id}
                onClick={() => setSelectedId(w.id)}
                aria-pressed={active}
                className={active
                  ? "w-full text-left rounded-xl border border-primary/40 bg-primary/10 p-3 text-sm font-medium"
                  : "w-full text-left rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-muted-foreground hover:border-primary/30 transition-colors"}
              >
                {w.label}
              </button>
            );
          })}
        </div>

        {/* Recommendation */}
        <div className="space-y-4">
          <div className="rounded-xl border border-teal-500/30 bg-teal-500/10 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-teal-300 mb-1">Recommended grade</p>
            <h3 className="text-lg font-bold text-teal-200">{uc.grade}</h3>
            <p className="text-sm text-muted-foreground mt-1.5">{uc.summary}</p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Key controls</p>
            <div className="grid md:grid-cols-2 gap-2">
              {uc.controls.map((c) => (
                <div key={c} className="rounded-xl border border-white/10 bg-white/5 p-3 flex gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-300" />
              <p className="text-xs font-bold uppercase tracking-wider text-amber-200">Watch out</p>
            </div>
            <p className="text-sm leading-relaxed">{uc.caution}</p>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed flex items-start gap-1.5">
            <Info className="w-3 h-3 mt-0.5 shrink-0 text-primary/70" />
            General educational workflow. Confirm the grade against the applicable pharmacopeia, your approved SOP,
            and your validated water system — not a substitute for QA approval.
          </p>
        </div>
      </div>
    </section>
  );
}
