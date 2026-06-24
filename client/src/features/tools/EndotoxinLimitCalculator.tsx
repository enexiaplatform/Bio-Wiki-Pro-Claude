import { useState } from "react";
import { Link } from "wouter";
import { useLocation } from "wouter";
import { FlaskConical, RotateCcw, ArrowRight, Info, BookOpen } from "lucide-react";
import {
  ROUTE_PRESETS,
  DOSE_UNITS,
  COMMON_LAMBDAS,
  DEFAULT_INPUTS,
  WORKED_EXAMPLE_STEPS,
  computeEndotoxin,
  fmt,
  type DoseUnit,
} from "@/data/tools/endotoxinLimit";
import { analytics } from "@/hooks/use-analytics";

const PLACEMENT = "tool_endotoxin_limit";

/**
 * Bacterial Endotoxin Limit & MVD Calculator — a free, static-logic helper that
 * applies the compendial formulas (USP <85> / Ph. Eur. 2.6.14):
 *   Endotoxin limit (EL) = K / M ;  Maximum Valid Dilution (MVD) = (EL x c) / lambda
 * Educational tool, not a validated method or a substitute for the monograph/SOP.
 */
export function EndotoxinLimitCalculator() {
  const [, navigate] = useLocation();
  const [routeId, setRouteId] = useState(ROUTE_PRESETS[0].id);
  const [k, setK] = useState(DEFAULT_INPUTS.k);
  const [maxDose, setMaxDose] = useState(DEFAULT_INPUTS.maxDose);
  const [bodyWeight, setBodyWeight] = useState(DEFAULT_INPUTS.bodyWeight);
  const [unit, setUnit] = useState<DoseUnit>(DEFAULT_INPUTS.unit);
  const [lambda, setLambda] = useState(DEFAULT_INPUTS.lambda);
  const [sampleConc, setSampleConc] = useState(DEFAULT_INPUTS.sampleConc);

  const route = ROUTE_PRESETS.find((r) => r.id === routeId) ?? ROUTE_PRESETS[0];
  const result = computeEndotoxin({ k, maxDose, bodyWeight, unit, lambda, sampleConc });

  function pickRoute(id: string) {
    setRouteId(id);
    const preset = ROUTE_PRESETS.find((r) => r.id === id);
    if (preset && id !== "custom") setK(preset.k);
  }

  function reset() {
    setRouteId(ROUTE_PRESETS[0].id);
    setK(DEFAULT_INPUTS.k);
    setMaxDose(DEFAULT_INPUTS.maxDose);
    setBodyWeight(DEFAULT_INPUTS.bodyWeight);
    setUnit(DEFAULT_INPUTS.unit);
    setLambda(DEFAULT_INPUTS.lambda);
    setSampleConc(DEFAULT_INPUTS.sampleConc);
  }

  function unlock() {
    analytics.upgradePromptClicked(PLACEMENT);
    navigate("/pricing");
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-card p-5 md:p-6">
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">Endotoxin Limit &amp; MVD Calculator</h2>
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        Work out the endotoxin limit (EL = K/M) and the Maximum Valid Dilution (MVD) for a bacterial
        endotoxin test. General educational guidance — confirm K, the dose basis, and lysate sensitivity
        against the product monograph and your validated method.
      </p>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Inputs */}
        <div className="space-y-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2.5">
              Route &amp; threshold dose (K)
            </p>
            <div className="grid sm:grid-cols-2 gap-2" role="group" aria-label="Route of administration">
              {ROUTE_PRESETS.map((r) => {
                const active = r.id === routeId;
                return (
                  <button
                    key={r.id}
                    onClick={() => pickRoute(r.id)}
                    aria-pressed={active}
                    className={
                      active
                        ? "text-left rounded-xl border border-primary/40 bg-primary/10 p-2.5 text-sm font-medium"
                        : "text-left rounded-xl border border-white/10 bg-white/5 p-2.5 text-sm text-muted-foreground hover:border-primary/30 transition-colors"
                    }
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <label className="text-xs text-muted-foreground" htmlFor="bet-k">
                K (EU/kg)
              </label>
              <input
                id="bet-k"
                type="number"
                min={0}
                step="any"
                value={k}
                disabled={routeId !== "custom"}
                onChange={(e) => setK(Number(e.target.value))}
                className="w-24 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-sm disabled:opacity-60"
              />
              <span className="text-xs text-muted-foreground">{route.note}</span>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2.5">
              Maximum human dose (M)
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              <Field
                id="bet-maxdose"
                label="Max dose / hour"
                value={maxDose}
                onChange={setMaxDose}
                suffix={unit}
              />
              <Field
                id="bet-bw"
                label="Body weight"
                value={bodyWeight}
                onChange={setBodyWeight}
                suffix="kg"
              />
              <div>
                <label className="block text-xs text-muted-foreground mb-1" htmlFor="bet-unit">
                  Dose unit
                </label>
                <select
                  id="bet-unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as DoseUnit)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-sm"
                >
                  {DOSE_UNITS.map((u) => (
                    <option key={u} value={u} className="bg-card">
                      {u}/mL &amp; {u}/kg
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              M = max dose / body weight ={" "}
              <span className="font-semibold text-foreground">
                {fmt(result.m)} {unit}/kg
              </span>
              . If the dose is already per kg, set body weight to 1.
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2.5">
              Test parameters
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1" htmlFor="bet-lambda">
                  Lysate sensitivity &lambda; (EU/mL)
                </label>
                <input
                  id="bet-lambda"
                  type="number"
                  min={0}
                  step="any"
                  value={lambda}
                  onChange={(e) => setLambda(Number(e.target.value))}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-sm"
                />
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {COMMON_LAMBDAS.map((l) => (
                    <button
                      key={l}
                      onClick={() => setLambda(l)}
                      aria-pressed={lambda === l}
                      className={
                        lambda === l
                          ? "rounded-md border border-primary/40 bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium"
                          : "rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[11px] text-muted-foreground hover:border-primary/30 transition-colors"
                      }
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <Field
                id="bet-conc"
                label={`Sample concentration tested (${unit}/mL)`}
                value={sampleConc}
                onChange={setSampleConc}
                suffix={`${unit}/mL`}
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:sticky lg:top-20 self-start space-y-4">
          <div className="rounded-2xl border border-teal-500/30 bg-teal-500/10 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-teal-300 mb-1">
              Endotoxin limit
            </p>
            <div className="text-3xl font-bold text-teal-100">
              {result.valid ? `${fmt(result.el)}` : "—"}
              {result.valid && <span className="text-base font-semibold text-teal-300/80"> EU/{unit}</span>}
            </div>
            <p className="text-[11px] text-teal-200/70 mt-1">EL = K / M = {fmt(k)} / {fmt(result.m)}</p>

            <div className="mt-4 pt-4 border-t border-teal-500/20">
              <p className="text-xs font-bold uppercase tracking-wider text-teal-300 mb-1">
                Maximum valid dilution
              </p>
              <div className="text-3xl font-bold text-teal-100">
                {result.valid ? fmt(result.mvd) : "—"}
                {result.valid && <span className="text-base font-semibold text-teal-300/80">&times;</span>}
              </div>
              <p className="text-[11px] text-teal-200/70 mt-1">
                MVD = (EL &times; c) / &lambda; = ({fmt(result.el)} &times; {fmt(sampleConc)}) / {fmt(lambda)}
              </p>
            </div>

            {!result.valid && (
              <p className="mt-3 text-[11px] text-amber-200/90">
                Enter positive values for every field to calculate.
              </p>
            )}
          </div>

          <Link
            href="/library/endotoxin-lal-testing"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-sm hover:border-primary/40 transition-colors"
          >
            <BookOpen className="w-4 h-4 text-primary shrink-0" />
            <span className="text-muted-foreground">
              <span className="font-semibold text-foreground">Learn the method</span> — gel-clot vs kinetic, PPC and inhibition/enhancement
            </span>
          </Link>

          <div className="rounded-2xl border border-teal-500/20 bg-gradient-to-br from-teal-500/10 to-transparent p-4">
            <p className="text-sm font-semibold mb-1">Run a complete BET workflow</p>
            <p className="text-xs text-muted-foreground mb-3">
              Pro unlocks the full toolkit library — checklists, investigation and CAPA templates, and
              SOP gap-analysis sheets to back up your endotoxin testing.
            </p>
            <button
              onClick={unlock}
              className="w-full inline-flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 text-teal-950 font-bold text-sm py-2.5 rounded-xl transition-all"
            >
              Unlock with Pro <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Worked example
            </p>
            <ol className="space-y-1">
              {WORKED_EXAMPLE_STEPS.map((s, idx) => (
                <li key={idx} className="text-[11px] text-muted-foreground leading-relaxed flex gap-1.5">
                  <span className="text-primary font-bold shrink-0">{idx + 1}</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed flex items-start gap-1.5">
            <Info className="w-3 h-3 mt-0.5 shrink-0 text-primary/70" />
            Educational calculation. Verify K, the dose basis, and &lambda; against the product monograph,
            the current pharmacopeia (USP &lt;85&gt; / Ph. Eur. 2.6.14), and your validated method — not a substitute for QA approval.
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
          min={0}
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
