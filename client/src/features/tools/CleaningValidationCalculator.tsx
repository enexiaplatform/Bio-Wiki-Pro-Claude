import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Sparkles, RotateCcw, ArrowRight, Info, BookOpen, CheckCircle2 } from "lucide-react";
import {
  computeCleaning,
  fmtNum,
  DEFAULT_CLEANING,
  CLEANING_EXAMPLE_STEPS,
  type CleaningInputs,
} from "@/data/tools/cleaningValidation";
import { analytics } from "@/hooks/use-analytics";

const PLACEMENT = "tool_cleaning_validation";

/**
 * Cleaning Validation MACO Calculator — a free, static-logic helper that computes
 * the Maximum Allowable Carryover by dose-based, HBEL, and 10 ppm criteria, picks
 * the most stringent, and derives surface + swab limits. Educational tool, not a
 * validated method or a substitute for the cleaning validation protocol.
 */
export function CleaningValidationCalculator() {
  const [, navigate] = useLocation();
  const [i, setI] = useState<CleaningInputs>(DEFAULT_CLEANING);
  const r = computeCleaning(i);

  function set<K extends keyof CleaningInputs>(key: K, val: number) {
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
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">Cleaning Validation MACO Calculator</h2>
        </div>
        <button
          onClick={() => setI(DEFAULT_CLEANING)}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        Work out the Maximum Allowable Carryover by the three common criteria, see which is most
        stringent, and derive the surface and swab limits. General educational guidance — confirm the
        PDE/ADE, batch sizes, and recovery against your toxicological assessment and validated method.
      </p>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Inputs */}
        <div className="space-y-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2.5">
              Previous (contaminating) product
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field id="cv-tdd" label="Smallest therapeutic dose (TDD)" value={i.tddPrev} onChange={(v) => set("tddPrev", v)} suffix="mg/day" />
              <Field id="cv-pde" label="HBEL / PDE / ADE" value={i.pde} onChange={(v) => set("pde", v)} suffix="mg/day" />
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">Leave PDE at 0 to skip the health-based criterion.</p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2.5">
              Next product &amp; limit basis
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              <Field id="cv-mdd" label="Max daily dose (MDD)" value={i.mddNext} onChange={(v) => set("mddNext", v)} suffix="mg/day" />
              <Field id="cv-mbs" label="Min batch size (MBS)" value={i.mbsKg} onChange={(v) => set("mbsKg", v)} suffix="kg" />
              <Field id="cv-sf" label="Safety factor (dose-based)" value={i.sf} onChange={(v) => set("sf", v)} />
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2.5">
              Sampling (optional — for surface &amp; swab limits)
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              <Field id="cv-area" label="Total shared surface area" value={i.totalAreaCm2} onChange={(v) => set("totalAreaCm2", v)} suffix="cm²" />
              <Field id="cv-swab" label="Swab area" value={i.swabAreaCm2} onChange={(v) => set("swabAreaCm2", v)} suffix="cm²" />
              <Field id="cv-rec" label="Swab recovery" value={i.recoveryPct} onChange={(v) => set("recoveryPct", v)} suffix="%" />
            </div>
          </div>

          {/* Per-criterion breakdown */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2.5">MACO by criterion</p>
            <div className="space-y-2">
              {r.criteria.map((c) => {
                const isSelected = r.selected?.id === c.id;
                return (
                  <div
                    key={c.id}
                    className={
                      isSelected
                        ? "rounded-xl border border-teal-500/40 bg-teal-500/10 p-3 flex items-center justify-between gap-3"
                        : "rounded-xl border border-white/10 bg-white/5 p-3 flex items-center justify-between gap-3"
                    }
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium flex items-center gap-1.5">
                        {c.label}
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />}
                      </p>
                      <p className="text-[11px] text-muted-foreground">{c.formula}</p>
                    </div>
                    <p className="text-sm font-bold shrink-0 tabular-nums">
                      {c.available ? `${fmtNum(c.maco)} mg` : "—"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:sticky lg:top-20 self-start space-y-4">
          <div className="rounded-2xl border border-teal-500/30 bg-teal-500/10 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-teal-300 mb-1">
              Most stringent MACO
            </p>
            <div className="text-3xl font-bold text-teal-100">
              {r.selected ? fmtNum(r.selected.maco) : "—"}
              {r.selected && <span className="text-base font-semibold text-teal-300/80"> mg</span>}
            </div>
            <p className="text-[11px] text-teal-200/70 mt-1">
              {r.selected ? `Driven by the ${r.selected.label} criterion` : "Enter values to calculate"}
            </p>

            <div className="mt-4 pt-4 border-t border-teal-500/20 space-y-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-teal-300 mb-0.5">Surface limit</p>
                <div className="text-xl font-bold text-teal-100">
                  {r.surfaceLimitUgCm2 ? fmtNum(r.surfaceLimitUgCm2) : "—"}
                  {r.surfaceLimitUgCm2 && <span className="text-sm font-semibold text-teal-300/80"> µg/cm²</span>}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-teal-300 mb-0.5">Swab limit (recovery-corrected)</p>
                <div className="text-xl font-bold text-teal-100">
                  {r.swabLimitUgPerSwab ? fmtNum(r.swabLimitUgPerSwab) : "—"}
                  {r.swabLimitUgPerSwab && <span className="text-sm font-semibold text-teal-300/80"> µg/swab</span>}
                </div>
              </div>
            </div>
          </div>

          <Link
            href="/library/cleaning-validation"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-sm hover:border-primary/40 transition-colors"
          >
            <BookOpen className="w-4 h-4 text-primary shrink-0" />
            <span className="text-muted-foreground">
              <span className="font-semibold text-foreground">Learn the method</span> — HBEL shift, worst-case bracketing, recovery
            </span>
          </Link>

          <div className="rounded-2xl border border-teal-500/20 bg-gradient-to-br from-teal-500/10 to-transparent p-4">
            <p className="text-sm font-semibold mb-1">Build the validation package</p>
            <p className="text-xs text-muted-foreground mb-3">
              Pro unlocks the full toolkit library — protocol checklists, CAPA and investigation
              templates, and SOP gap-analysis sheets for your cleaning program.
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
              {CLEANING_EXAMPLE_STEPS.map((s, idx) => (
                <li key={idx} className="text-[11px] text-muted-foreground leading-relaxed flex gap-1.5">
                  <span className="text-primary font-bold shrink-0">{idx + 1}</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed flex items-start gap-1.5">
            <Info className="w-3 h-3 mt-0.5 shrink-0 text-primary/70" />
            Educational calculation. Health-based limits should be set by a qualified toxicologist;
            verify every input and the chosen acceptance criterion against your validated cleaning
            program — not a substitute for QA approval.
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
