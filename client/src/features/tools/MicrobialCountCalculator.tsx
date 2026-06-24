import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Bug, RotateCcw, ArrowRight, Info, BookOpen } from "lucide-react";
import {
  COUNT_METHODS,
  DILUTION_EXPONENTS,
  computeCount,
  fmtCount,
  DEFAULT_COUNT,
  type CountMethod,
} from "@/data/tools/microbialCount";
import { analytics } from "@/hooks/use-analytics";

const PLACEMENT = "tool_microbial_count";

/**
 * Microbial Count (CFU) Calculator — a free, static-logic helper that converts
 * colonies counted on a plate or membrane back to CFU/mL in the original
 * sample, accounting for dilution and volume plated. Educational tool; follow
 * your validated method and pharmacopeial counting rules.
 */
export function MicrobialCountCalculator() {
  const [, navigate] = useLocation();
  const [method, setMethod] = useState<CountMethod>(DEFAULT_COUNT.method);
  const [colonies1, setColonies1] = useState(DEFAULT_COUNT.colonies1);
  const [colonies2, setColonies2] = useState<string>(String(DEFAULT_COUNT.colonies2));
  const [dilutionExp, setDilutionExp] = useState(DEFAULT_COUNT.dilutionExp);
  const [volume, setVolume] = useState(DEFAULT_COUNT.volume);

  const methodInfo = COUNT_METHODS.find((m) => m.id === method) ?? COUNT_METHODS[0];
  const c2 = colonies2.trim() === "" ? null : Number(colonies2);
  const r = computeCount({ method, colonies1, colonies2: c2, dilutionExp, volume });

  function pickMethod(id: CountMethod) {
    setMethod(id);
    const info = COUNT_METHODS.find((m) => m.id === id);
    if (info) setVolume(info.defaultVolume);
  }

  function reset() {
    setMethod(DEFAULT_COUNT.method);
    setColonies1(DEFAULT_COUNT.colonies1);
    setColonies2(String(DEFAULT_COUNT.colonies2));
    setDilutionExp(DEFAULT_COUNT.dilutionExp);
    setVolume(DEFAULT_COUNT.volume);
  }

  function unlock() {
    analytics.upgradePromptClicked(PLACEMENT);
    navigate("/pricing");
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-card p-5 md:p-6">
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <div className="flex items-center gap-2">
          <Bug className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">Microbial Count (CFU) Calculator</h2>
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        Convert colonies counted on a plate or membrane back to CFU/mL in the original sample,
        accounting for the dilution and volume plated. General educational guidance — apply your
        validated method and pharmacopeial counting rules (countable range, TNTC).
      </p>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Inputs */}
        <div className="space-y-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2.5">Method</p>
            <div className="grid sm:grid-cols-3 gap-2" role="group" aria-label="Count method">
              {COUNT_METHODS.map((m) => {
                const active = m.id === method;
                return (
                  <button
                    key={m.id}
                    onClick={() => pickMethod(m.id)}
                    aria-pressed={active}
                    className={
                      active
                        ? "rounded-xl border border-primary/40 bg-primary/10 p-2.5 text-sm font-medium"
                        : "rounded-xl border border-white/10 bg-white/5 p-2.5 text-sm text-muted-foreground hover:border-primary/30 transition-colors"
                    }
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{methodInfo.note}</p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2.5">Colonies counted</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field id="mc-c1" label="Plate / membrane 1" value={colonies1} onChange={setColonies1} />
              <div>
                <label className="block text-xs text-muted-foreground mb-1" htmlFor="mc-c2">
                  Plate 2 (optional — averaged)
                </label>
                <input
                  id="mc-c2"
                  type="number"
                  min={0}
                  step="any"
                  value={colonies2}
                  onChange={(e) => setColonies2(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2.5">Dilution &amp; volume</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1" htmlFor="mc-dil">
                  Dilution tested
                </label>
                <select
                  id="mc-dil"
                  value={dilutionExp}
                  onChange={(e) => setDilutionExp(Number(e.target.value))}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-sm"
                >
                  {DILUTION_EXPONENTS.map((n) => (
                    <option key={n} value={n} className="bg-card">
                      {n === 0 ? "Undiluted (10^0)" : `10^-${n} (x${Math.pow(10, n).toLocaleString()})`}
                    </option>
                  ))}
                </select>
              </div>
              <Field id="mc-vol" label="Volume plated / filtered (mL)" value={volume} onChange={setVolume} />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:sticky lg:top-20 self-start space-y-4">
          <div className="rounded-2xl border border-teal-500/30 bg-teal-500/10 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-teal-300 mb-1">Result</p>
            <div className="text-3xl font-bold text-teal-100">
              {r.valid ? fmtCount(r.cfuPerMl) : "—"}
              {r.valid && <span className="text-base font-semibold text-teal-300/80"> CFU/mL</span>}
            </div>
            <p className="text-[11px] text-teal-200/70 mt-1">
              = {fmtCount(r.meanColonies)} colonies &times; {r.factor.toLocaleString()} / {volume} mL
            </p>

            {methodInfo.per100 && (
              <div className="mt-4 pt-4 border-t border-teal-500/20">
                <p className="text-xs font-bold uppercase tracking-wider text-teal-300 mb-0.5">Reported per 100 mL</p>
                <div className="text-2xl font-bold text-teal-100">
                  {r.valid ? fmtCount(r.cfuPer100) : "—"}
                  {r.valid && <span className="text-sm font-semibold text-teal-300/80"> CFU/100 mL</span>}
                </div>
              </div>
            )}

            {!r.valid && (
              <p className="mt-3 text-[11px] text-amber-200/90">Enter colonies and a positive volume to calculate.</p>
            )}
          </div>

          <Link
            href="/library/bioburden-usp-61"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-sm hover:border-primary/40 transition-colors"
          >
            <BookOpen className="w-4 h-4 text-primary shrink-0" />
            <span className="text-muted-foreground">
              <span className="font-semibold text-foreground">Learn the method</span> — bioburden, countable range, TNTC rules
            </span>
          </Link>

          <div className="rounded-2xl border border-teal-500/20 bg-gradient-to-br from-teal-500/10 to-transparent p-4">
            <p className="text-sm font-semibold mb-1">Standardize your micro testing</p>
            <p className="text-xs text-muted-foreground mb-3">
              Pro unlocks the full toolkit library — environmental monitoring and microbiology QC
              checklists, investigation templates, and SOP gap-analysis sheets.
            </p>
            <button
              onClick={unlock}
              className="w-full inline-flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 text-teal-950 font-bold text-sm py-2.5 rounded-xl transition-all"
            >
              Unlock with Pro <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed flex items-start gap-1.5">
            <Info className="w-3 h-3 mt-0.5 shrink-0 text-primary/70" />
            Educational calculation. Counts outside the validated countable range, TNTC plates, and
            spreader rules must be handled per your SOP and the pharmacopeia — not a substitute for QA review.
          </p>
        </div>
      </div>
    </section>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <label className="block text-xs text-muted-foreground mb-1" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type="number"
        min={0}
        step="any"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-sm"
      />
    </div>
  );
}
