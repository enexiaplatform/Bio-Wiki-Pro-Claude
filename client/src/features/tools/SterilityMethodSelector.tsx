import { useState } from "react";
import { Link } from "wouter";
import { TestTube2, CheckCircle2, AlertTriangle, Info, ShieldCheck } from "lucide-react";
import { sterilityScenarios, sterilityAlways } from "@/data/tools/sterilityMethodSelector";

/**
 * Sterility Test Method Selector — static decision helper that maps a product
 * scenario to the recommended USP 71 approach. General educational guidance.
 */
export function SterilityMethodSelector() {
  const [selectedId, setSelectedId] = useState(sterilityScenarios[0].id);
  const sc = sterilityScenarios.find((s) => s.id === selectedId) ?? sterilityScenarios[0];

  return (
    <section className="rounded-2xl border border-white/10 bg-card p-5 md:p-6">
      <div className="flex items-center gap-2 mb-1.5">
        <TestTube2 className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold">Sterility Test Method Selector</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        Pick your product type to see the likely USP 71 approach and its key controls.
        General guidance — verify against the pharmacopeia (USP 71 / EP 2.6.1) and a validated method.
      </p>

      <div className="grid lg:grid-cols-[320px_1fr] gap-5">
        {/* Scenarios */}
        <div className="space-y-2" role="group" aria-label="Product scenario">
          {sterilityScenarios.map((s) => {
            const active = s.id === selectedId;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedId(s.id)}
                aria-pressed={active}
                className={active
                  ? "w-full text-left rounded-xl border border-primary/40 bg-primary/10 p-3 text-sm font-medium"
                  : "w-full text-left rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-muted-foreground hover:border-primary/30 transition-colors"}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Recommendation */}
        <div className="space-y-4">
          <div className="rounded-xl border border-teal-500/30 bg-teal-500/10 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-teal-300 mb-1">Recommended approach</p>
            <h3 className="text-lg font-bold text-teal-200">{sc.method}</h3>
            <p className="text-sm text-muted-foreground mt-1.5">{sc.summary}</p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Key controls</p>
            <div className="grid md:grid-cols-2 gap-2">
              {sc.controls.map((c) => (
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
            <p className="text-sm leading-relaxed">{sc.caution}</p>
          </div>
        </div>
      </div>

      {/* Always required */}
      <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-400" /> Required for any method
        </p>
        <div className="grid md:grid-cols-2 gap-2">
          {sterilityAlways.map((a) => (
            <div key={a} className="flex gap-2 text-sm text-muted-foreground">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
              <span>{a}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-4 text-[11px] text-muted-foreground leading-relaxed flex items-start gap-1.5">
        <Info className="w-3 h-3 mt-0.5 shrink-0 text-primary/70" />
        General educational workflow — verify against USP 71 / EP 2.6.1 and a validated method. Learn the background in{" "}
        <Link href="/library/sterility-testing-basics" className="text-teal-400 hover:underline">Sterility testing basics</Link>.
      </p>
    </section>
  );
}
