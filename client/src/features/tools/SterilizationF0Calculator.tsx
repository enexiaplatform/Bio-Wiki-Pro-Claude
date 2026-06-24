import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Flame, RotateCcw, ArrowRight, Info, BookOpen } from "lucide-react";
import {
  computeF0,
  bandForF0,
  fmtF0,
  DEFAULT_F0,
  type F0Inputs,
} from "@/data/tools/sterilizationF0";
import { analytics } from "@/hooks/use-analytics";

const PLACEMENT = "tool_sterilization_f0";

/**
 * F0 Sterilization Lethality Calculator — a free, static-logic helper that
 * computes the instantaneous lethal rate and the equivalent time at the
 * reference temperature for a moist-heat hold:
 *   L = 10^((T - Tref)/z) ;  F0 = t x L
 * Educational tool — a constant-temperature equivalent, not the integrated
 * delivered F0 of a validated cycle.
 */
export function SterilizationF0Calculator() {
  const [, navigate] = useLocation();
  const [i, setI] = useState<F0Inputs>(DEFAULT_F0);
  const r = computeF0(i);
  const band = bandForF0(r.f0);

  function set<K extends keyof F0Inputs>(key: K, val: number) {
    setI((prev) => ({ ...prev, [key]: val }));
  }

  function unlock() {
    analytics.upgradePromptClicked(PLACEMENT);
    navigate("/pricing");
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-card p-5 md:p-6">
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">F&#8320; Sterilization Lethality Calculator</h2>
        </div>
        <button
          onClick={() => setI(DEFAULT_F0)}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        Work out the lethal rate and the equivalent time at 121.1&nbsp;&deg;C (F&#8320;) for a moist-heat
        hold. General educational guidance — a constant-temperature equivalent, not the integrated
        delivered F&#8320; of your validated cycle.
      </p>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Inputs */}
        <div className="space-y-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2.5">Hold conditions</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field id="f0-temp" label="Holding temperature" value={i.temp} onChange={(v) => set("temp", v)} suffix="°C" />
              <Field id="f0-time" label="Holding time" value={i.time} onChange={(v) => set("time", v)} suffix="min" />
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2.5">Reference parameters</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field id="f0-z" label="z-value" value={i.z} onChange={(v) => set("z", v)} suffix="°C" />
              <Field id="f0-ref" label="Reference temperature" value={i.refTemp} onChange={(v) => set("refTemp", v)} suffix="°C" />
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Standard moist-heat values are z = 10&nbsp;&deg;C and a reference of 121.1&nbsp;&deg;C.
            </p>
          </div>
        </div>

        {/* Results */}
        <div className="lg:sticky lg:top-20 self-start space-y-4">
          <div className="rounded-2xl border border-teal-500/30 bg-teal-500/10 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-teal-300 mb-1">F&#8320; (equivalent time)</p>
            <div className="text-3xl font-bold text-teal-100">
              {r.valid ? fmtF0(r.f0) : "—"}
              {r.valid && <span className="text-base font-semibold text-teal-300/80"> min</span>}
            </div>
            <p className="text-[11px] text-teal-200/70 mt-1">
              F&#8320; = t &times; L = {i.time} &times; {fmtF0(r.lethalRate)}
            </p>
            {r.valid && <p className="text-xs font-semibold text-teal-200 mt-2">{band.label}</p>}

            <div className="mt-4 pt-4 border-t border-teal-500/20">
              <p className="text-xs font-bold uppercase tracking-wider text-teal-300 mb-0.5">Lethal rate (L)</p>
              <div className="text-2xl font-bold text-teal-100">{r.valid ? fmtF0(r.lethalRate) : "—"}</div>
              <p className="text-[11px] text-teal-200/70 mt-0.5">
                L = 10^((T &minus; T&#8341;&#8334;&#8331;) / z)
              </p>
            </div>

            {!r.valid && (
              <p className="mt-3 text-[11px] text-amber-200/90">Enter a positive time and z-value to calculate.</p>
            )}
          </div>

          <Link
            href="/library/steam-sterilization-validation"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-sm hover:border-primary/40 transition-colors"
          >
            <BookOpen className="w-4 h-4 text-primary shrink-0" />
            <span className="text-muted-foreground">
              <span className="font-semibold text-foreground">Learn the method</span> — F&#8320;, overkill vs bioburden, BI challenge
            </span>
          </Link>

          <div className="rounded-2xl border border-teal-500/20 bg-gradient-to-br from-teal-500/10 to-transparent p-4">
            <p className="text-sm font-semibold mb-1">Validate the cycle</p>
            <p className="text-xs text-muted-foreground mb-3">
              Pro unlocks the full toolkit library — qualification checklists, investigation and CAPA
              templates, and SOP gap-analysis sheets for your sterilization program.
            </p>
            <button
              onClick={unlock}
              className="w-full inline-flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 text-teal-950 font-bold text-sm py-2.5 rounded-xl transition-all"
            >
              Unlock with Pro <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Reference</p>
            <ul className="space-y-1 text-[11px] text-muted-foreground leading-relaxed">
              <li>At 121.1 &deg;C the lethal rate L = 1, so F&#8320; equals the hold time in minutes.</li>
              <li>Common targets: ≥ 8 min (bioburden-based), ≥ 15 min (overkill) — your cycle defines it.</li>
              <li>Every 10 &deg;C (one z) changes the lethal rate roughly tenfold.</li>
            </ul>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed flex items-start gap-1.5">
            <Info className="w-3 h-3 mt-0.5 shrink-0 text-primary/70" />
            Educational calculation for a constant temperature. Real cycles integrate lethality over
            the come-up, hold, and cool-down from probe data — follow your validated method and QA review.
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
  suffix,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (n: number) => void;
  suffix?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-muted-foreground mb-1" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="number"
          step="any"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-sm"
        />
        {suffix && (
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
