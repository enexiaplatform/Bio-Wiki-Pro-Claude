import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Sigma, RotateCcw, ArrowRight, Info, BookOpen, CheckCircle2, XCircle } from "lucide-react";
import {
  computeSST,
  bandForSST,
  fmtRsd,
  fmtNum,
  DEFAULT_SST,
} from "@/data/tools/systemSuitability";
import { analytics } from "@/hooks/use-analytics";

const PLACEMENT = "tool_system_suitability";

const TONE: Record<string, string> = {
  teal: "border-teal-500/30 bg-teal-500/10 text-teal-100",
  amber: "border-amber-500/30 bg-amber-500/10 text-amber-100",
  red: "border-red-500/30 bg-red-500/10 text-red-100",
};

/**
 * System Suitability %RSD Calculator — a free, static-logic helper that computes
 * the injection-precision %RSD (relative standard deviation) of replicate
 * standard injections and checks it against a %RSD limit and a minimum number of
 * injections (USP <621>-style). Educational; apply your own validated criteria.
 */
export function SystemSuitabilityCalculator() {
  const [, navigate] = useLocation();
  const [raw, setRaw] = useState(DEFAULT_SST.data);
  const [rsdLimit, setRsdLimit] = useState(DEFAULT_SST.rsdLimit);
  const [minReps, setMinReps] = useState(DEFAULT_SST.minReps);

  const r = computeSST({ data: raw, rsdLimit, minReps });
  const band = bandForSST(r, rsdLimit);

  function reset() {
    setRaw(DEFAULT_SST.data);
    setRsdLimit(DEFAULT_SST.rsdLimit);
    setMinReps(DEFAULT_SST.minReps);
  }

  function unlock() {
    analytics.upgradePromptClicked(PLACEMENT);
    navigate("/pricing");
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-card p-5 md:p-6">
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <div className="flex items-center gap-2">
          <Sigma className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">System Suitability %RSD Calculator</h2>
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        Check injection precision (repeatability) for a chromatographic run: paste the replicate standard
        responses (peak area or height) and see the %RSD against your limit and required number of
        injections. Educational — always apply your validated method&rsquo;s SST criteria.
      </p>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Inputs */}
        <div className="space-y-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2.5">Replicate responses</p>
            <textarea
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              rows={4}
              placeholder="Paste peak areas separated by spaces, commas, or new lines&#10;e.g. 1002340, 998210, 1005100, 999870, 1001450"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-mono"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              {r.valid ? (
                <>
                  n = <span className="font-semibold text-foreground">{r.n}</span> · mean ={" "}
                  <span className="font-semibold text-foreground">{fmtNum(r.mean)}</span> · s ={" "}
                  <span className="font-semibold text-foreground">{fmtNum(r.sd)}</span> (sample, n−1)
                </>
              ) : (
                "Enter at least 2 replicate responses to compute the %RSD."
              )}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <Field id="sst-limit" label="%RSD acceptance limit" value={rsdLimit} onChange={setRsdLimit} />
            <Field id="sst-reps" label="Required injections (min)" value={minReps} onChange={setMinReps} />
          </div>

          {/* Criteria breakdown */}
          <div className="grid grid-cols-2 gap-2">
            <Criterion
              ok={r.valid && r.meetsCount}
              label="Injection count"
              detail={`${r.n} of ${minReps} required`}
            />
            <Criterion
              ok={r.valid && r.meetsRsd}
              label="%RSD within limit"
              detail={`${fmtRsd(r.rsd)} vs ${rsdLimit}%`}
            />
          </div>
        </div>

        {/* Results */}
        <div className="lg:sticky lg:top-20 self-start space-y-4">
          <div className={`rounded-2xl border p-5 ${r.valid ? TONE[band.tone] : "border-white/10 bg-white/5"}`}>
            <p className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">%RSD</p>
            <div className="text-4xl font-bold">{fmtRsd(r.rsd)}</div>
            {r.valid ? (
              <p className="text-sm font-semibold mt-1">{band.label}</p>
            ) : (
              <p className="text-xs text-muted-foreground mt-1">Enter at least two replicate responses.</p>
            )}
            <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider opacity-80 mb-0.5">Mean</p>
                <div className="text-lg font-bold tabular-nums">{fmtNum(r.mean)}</div>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider opacity-80 mb-0.5">Std dev</p>
                <div className="text-lg font-bold tabular-nums">{fmtNum(r.sd)}</div>
              </div>
            </div>
          </div>

          <Link
            href="/library/hplc-system-suitability"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-sm hover:border-primary/40 transition-colors"
          >
            <BookOpen className="w-4 h-4 text-primary shrink-0" />
            <span className="text-muted-foreground">
              <span className="font-semibold text-foreground">Learn the method</span> — what SST checks and why it gatekeeps
            </span>
          </Link>

          <div className="rounded-2xl border border-teal-500/20 bg-gradient-to-br from-teal-500/10 to-transparent p-4">
            <p className="text-sm font-semibold mb-1">Run it every sequence</p>
            <p className="text-xs text-muted-foreground mb-3">
              Pro unlocks the full toolkit library — method-validation and SST protocol checklists,
              trending sheets, and investigation templates for chromatographic QC.
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
              Reference
            </p>
            <ul className="space-y-1 text-[11px] text-muted-foreground leading-relaxed">
              <li>%RSD = 100 × sample SD ÷ mean, on replicate injections of a standard.</li>
              <li>Assays commonly require ≤ 2.0% over 5 injections; impurity methods allow more.</li>
              <li>SST must pass before the run — a failing system invalidates the results.</li>
            </ul>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed flex items-start gap-1.5">
            <Info className="w-3 h-3 mt-0.5 shrink-0 text-primary/70" />
            Educational calculation. Use the acceptance criteria in your validated method and pharmacopeia
            (USP &lt;621&gt;, Ph. Eur. 2.2.46), not this default limit.
          </p>
        </div>
      </div>
    </section>
  );
}

function Criterion({ ok, label, detail }: { ok: boolean; label: string; detail: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3 flex items-start gap-2">
      {ok ? (
        <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
      ) : (
        <XCircle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
      )}
      <div>
        <p className="text-xs font-semibold leading-tight">{label}</p>
        <p className="text-[11px] text-muted-foreground">{detail}</p>
      </div>
    </div>
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
