import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Beaker, RotateCcw, ArrowRight, Info, BookOpen, AlertTriangle } from "lucide-react";
import {
  computeDilution,
  computeSerial,
  fmtVal,
  CONC_UNITS,
  VOL_UNITS,
  DEFAULT_DILUTION,
  DEFAULT_SERIAL,
} from "@/data/tools/dilution";
import { analytics } from "@/hooks/use-analytics";

const PLACEMENT = "tool_dilution";

type Mode = "dilute" | "serial";

/**
 * Dilution & Standard Prep Calculator — a free, static-logic helper for the two
 * everyday lab dilution jobs: C1·V1 = C2·V2 (how much stock + diluent for a
 * target concentration and volume) and a serial (fold) dilution table.
 * Educational; prepare standards per your validated method.
 */
export function DilutionCalculator() {
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<Mode>("dilute");
  const [concUnit, setConcUnit] = useState<string>(CONC_UNITS[0]);
  const [volUnit, setVolUnit] = useState<string>(VOL_UNITS[0]);

  // Dilute-a-stock inputs.
  const [c1, setC1] = useState(DEFAULT_DILUTION.c1);
  const [c2, setC2] = useState(DEFAULT_DILUTION.c2);
  const [v2, setV2] = useState(DEFAULT_DILUTION.v2);

  // Serial-dilution inputs.
  const [start, setStart] = useState(DEFAULT_SERIAL.start);
  const [factor, setFactor] = useState(DEFAULT_SERIAL.factor);
  const [steps, setSteps] = useState(DEFAULT_SERIAL.steps);

  const d = computeDilution({ c1, c2, v2 });
  const serial = computeSerial({ start, factor, steps });

  function reset() {
    setC1(DEFAULT_DILUTION.c1);
    setC2(DEFAULT_DILUTION.c2);
    setV2(DEFAULT_DILUTION.v2);
    setStart(DEFAULT_SERIAL.start);
    setFactor(DEFAULT_SERIAL.factor);
    setSteps(DEFAULT_SERIAL.steps);
  }

  function unlock() {
    analytics.upgradePromptClicked(PLACEMENT);
    navigate("/pricing");
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-card p-5 md:p-6">
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <div className="flex items-center gap-2">
          <Beaker className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">Dilution &amp; Standard Prep Calculator</h2>
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        Work out how much stock and diluent to prepare a standard or sample (C1·V1 = C2·V2), or build a
        serial-dilution table. Keep the two concentrations in one unit and the volumes in another.
      </p>

      {/* Mode + units */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex gap-1" role="group" aria-label="Calculator mode">
          {([
            ["dilute", "Dilute a stock"],
            ["serial", "Serial dilution"],
          ] as const).map(([m, label]) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              aria-pressed={mode === m}
              className={
                mode === m
                  ? "rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold"
                  : "rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/30 transition-colors"
              }
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs">
          <UnitSelect id="conc-unit" label="Conc." value={concUnit} onChange={setConcUnit} options={CONC_UNITS} />
          <UnitSelect id="vol-unit" label="Vol." value={volUnit} onChange={setVolUnit} options={VOL_UNITS} />
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          {mode === "dilute" ? (
            <div className="grid sm:grid-cols-3 gap-3">
              <Field id="dil-c1" label={`Stock conc. (${concUnit})`} value={c1} onChange={setC1} />
              <Field id="dil-c2" label={`Target conc. (${concUnit})`} value={c2} onChange={setC2} />
              <Field id="dil-v2" label={`Final volume (${volUnit})`} value={v2} onChange={setV2} />
            </div>
          ) : (
            <div className="grid sm:grid-cols-3 gap-3">
              <Field id="ser-start" label={`Start conc. (${concUnit})`} value={start} onChange={setStart} />
              <Field id="ser-factor" label="Fold per step (e.g. 10)" value={factor} onChange={setFactor} />
              <Field id="ser-steps" label="Number of steps" value={steps} onChange={setSteps} />
            </div>
          )}

          {mode === "serial" && serial.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-white/10">
              <table className="w-full text-sm">
                <thead className="bg-white/5 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="text-left font-semibold px-3 py-2">Tube</th>
                    <th className="text-left font-semibold px-3 py-2">Dilution</th>
                    <th className="text-right font-semibold px-3 py-2">Concentration ({concUnit})</th>
                  </tr>
                </thead>
                <tbody>
                  {serial.map((s) => (
                    <tr key={s.tube} className="border-t border-white/5">
                      <td className="px-3 py-2">{s.tube}</td>
                      <td className="px-3 py-2 text-muted-foreground">{s.label}</td>
                      <td className="px-3 py-2 text-right font-medium tabular-nums">{fmtVal(s.concentration)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="lg:sticky lg:top-20 self-start space-y-4">
          {mode === "dilute" ? (
            <div className={`rounded-2xl border p-5 ${d.valid ? "border-teal-500/30 bg-teal-500/10 text-teal-100" : "border-white/10 bg-white/5"}`}>
              {d.valid ? (
                <>
                  <p className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">Take stock</p>
                  <div className="text-4xl font-bold">
                    {fmtVal(d.v1)} <span className="text-lg font-semibold opacity-70">{volUnit}</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider opacity-80 mb-0.5">Add diluent</p>
                      <div className="text-xl font-bold">{fmtVal(d.diluent)} {volUnit}</div>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider opacity-80 mb-0.5">Dilution</p>
                      <div className="text-xl font-bold">{fmtVal(d.factor)}×</div>
                    </div>
                  </div>
                </>
              ) : d.targetTooHigh ? (
                <div className="flex items-start gap-2 text-amber-100">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <p className="text-sm">The target concentration is higher than the stock — you can&rsquo;t dilute up. Use a more concentrated stock.</p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Enter positive stock, target, and final-volume values.</p>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-teal-500/30 bg-teal-500/10 text-teal-100 p-5">
              <p className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">Final tube</p>
              {serial.length > 0 ? (
                <div className="text-3xl font-bold">
                  {fmtVal(serial[serial.length - 1].concentration)} <span className="text-base font-semibold opacity-70">{concUnit}</span>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Enter a start conc., a fold &gt; 1, and at least one step.</p>
              )}
              {serial.length > 0 && (
                <p className="text-[11px] opacity-70 mt-1">{serial.length} steps at {factor}× each ({serial[serial.length - 1].label}).</p>
              )}
            </div>
          )}

          <Link
            href="/library/reference-standards-management"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-sm hover:border-primary/40 transition-colors"
          >
            <BookOpen className="w-4 h-4 text-primary shrink-0" />
            <span className="text-muted-foreground">
              <span className="font-semibold text-foreground">Learn the method</span> — preparing and controlling reference standards
            </span>
          </Link>

          <div className="rounded-2xl border border-teal-500/20 bg-gradient-to-br from-teal-500/10 to-transparent p-4">
            <p className="text-sm font-semibold mb-1">Standardise your prep</p>
            <p className="text-xs text-muted-foreground mb-3">
              Pro unlocks the full toolkit library — standard-prep and method-validation checklists,
              worksheets, and SOP templates for the QC lab.
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
            Educational calculation. Keep concentration and volume units consistent, account for your
            balance/pipette tolerances, and prepare standards per your validated method.
          </p>
        </div>
      </div>
    </section>
  );
}

function UnitSelect({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
}) {
  return (
    <label htmlFor={id} className="flex items-center gap-1.5 text-muted-foreground">
      {label}
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-foreground"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-card">
            {o}
          </option>
        ))}
      </select>
    </label>
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
        step="any"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-sm"
      />
    </div>
  );
}
