import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Gauge, RotateCcw, ArrowRight, Info, BookOpen } from "lucide-react";
import {
  computeCapability,
  bandForCpk,
  parseData,
  mean,
  sampleStdDev,
  fmtIndex,
  fmtPpm,
  DEFAULT_CAPABILITY,
  type SpecType,
} from "@/data/tools/processCapability";
import { analytics } from "@/hooks/use-analytics";

const PLACEMENT = "tool_process_capability";

const SPEC_TYPES: { value: SpecType; label: string }[] = [
  { value: "two", label: "Two-sided (USL & LSL)" },
  { value: "upper", label: "Upper only (USL)" },
  { value: "lower", label: "Lower only (LSL)" },
];

const TONE: Record<string, string> = {
  teal: "border-teal-500/30 bg-teal-500/10 text-teal-100",
  amber: "border-amber-500/30 bg-amber-500/10 text-amber-100",
  red: "border-red-500/30 bg-red-500/10 text-red-100",
};

/**
 * Process Capability Calculator — a free, static-logic helper that computes
 * Cp / Cpu / Cpl / Cpk and the estimated out-of-spec PPM from spec limits plus
 * a process mean and standard deviation (entered directly or derived from
 * pasted data). Educational tool; indices assume a stable, normal process.
 */
export function ProcessCapabilityCalculator() {
  const [, navigate] = useLocation();
  const [specType, setSpecType] = useState<SpecType>(DEFAULT_CAPABILITY.specType);
  const [usl, setUsl] = useState(DEFAULT_CAPABILITY.usl);
  const [lsl, setLsl] = useState(DEFAULT_CAPABILITY.lsl);
  const [meanIn, setMeanIn] = useState(DEFAULT_CAPABILITY.mean);
  const [sdIn, setSdIn] = useState(DEFAULT_CAPABILITY.sd);
  const [mode, setMode] = useState<"summary" | "data">("summary");
  const [raw, setRaw] = useState("");

  const data = parseData(raw);
  const useData = mode === "data" && data.length >= 2;
  const effMean = useData ? mean(data) : meanIn;
  const effSd = useData ? sampleStdDev(data) : sdIn;

  const r = computeCapability({ specType, usl, lsl, mean: effMean, sd: effSd });
  const band = bandForCpk(r.cpk);
  const useUpper = specType === "two" || specType === "upper";
  const useLower = specType === "two" || specType === "lower";

  function reset() {
    setSpecType(DEFAULT_CAPABILITY.specType);
    setUsl(DEFAULT_CAPABILITY.usl);
    setLsl(DEFAULT_CAPABILITY.lsl);
    setMeanIn(DEFAULT_CAPABILITY.mean);
    setSdIn(DEFAULT_CAPABILITY.sd);
    setMode("summary");
    setRaw("");
  }

  function unlock() {
    analytics.upgradePromptClicked(PLACEMENT);
    navigate("/pricing");
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-card p-5 md:p-6">
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <div className="flex items-center gap-2">
          <Gauge className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">Process Capability Calculator</h2>
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        Compute Cp, Cpk, and the estimated out-of-spec rate from your spec limits and process data.
        Capability indices assume a stable, normally distributed process — confirm statistical control
        and normality first.
      </p>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Inputs */}
        <div className="space-y-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2.5">Specification</p>
            <div className="grid sm:grid-cols-3 gap-2 mb-3" role="group" aria-label="Specification type">
              {SPEC_TYPES.map((s) => {
                const active = s.value === specType;
                return (
                  <button
                    key={s.value}
                    onClick={() => setSpecType(s.value)}
                    aria-pressed={active}
                    className={
                      active
                        ? "rounded-xl border border-primary/40 bg-primary/10 p-2.5 text-xs font-medium"
                        : "rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs text-muted-foreground hover:border-primary/30 transition-colors"
                    }
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {useUpper && <Field id="pc-usl" label="Upper spec limit (USL)" value={usl} onChange={setUsl} />}
              {useLower && <Field id="pc-lsl" label="Lower spec limit (LSL)" value={lsl} onChange={setLsl} />}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-xs font-bold uppercase tracking-wider text-primary">Process data</p>
              <div className="flex gap-1" role="group" aria-label="Input method">
                {(["summary", "data"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    aria-pressed={mode === m}
                    className={
                      mode === m
                        ? "rounded-lg border border-primary/40 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold"
                        : "rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-muted-foreground hover:border-primary/30 transition-colors"
                    }
                  >
                    {m === "summary" ? "Summary stats" : "Paste data"}
                  </button>
                ))}
              </div>
            </div>

            {mode === "summary" ? (
              <div className="grid sm:grid-cols-2 gap-3">
                <Field id="pc-mean" label="Process mean" value={meanIn} onChange={setMeanIn} />
                <Field id="pc-sd" label="Standard deviation (s)" value={sdIn} onChange={setSdIn} />
              </div>
            ) : (
              <div>
                <textarea
                  value={raw}
                  onChange={(e) => setRaw(e.target.value)}
                  rows={4}
                  placeholder="Paste measurements separated by spaces, commas, or new lines&#10;e.g. 100.2, 99.8, 101.1, 100.5, 99.4"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-mono"
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {data.length >= 2 ? (
                    <>
                      n = <span className="font-semibold text-foreground">{data.length}</span> · mean ={" "}
                      <span className="font-semibold text-foreground">{effMean.toPrecision(4)}</span> · s ={" "}
                      <span className="font-semibold text-foreground">{effSd.toPrecision(3)}</span> (sample, n−1)
                    </>
                  ) : (
                    "Enter at least 2 numbers to derive the mean and standard deviation."
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Index breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { k: "Cp", v: r.cp },
              { k: "Cpu", v: r.cpu },
              { k: "Cpl", v: r.cpl },
              { k: "Cpk", v: r.cpk },
            ].map((x) => (
              <div key={x.k} className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{x.k}</p>
                <p className="text-lg font-bold tabular-nums">{fmtIndex(x.v)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="lg:sticky lg:top-20 self-start space-y-4">
          <div className={`rounded-2xl border p-5 ${r.valid ? TONE[band.tone] : "border-white/10 bg-white/5"}`}>
            <p className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">Cpk</p>
            <div className="text-4xl font-bold">{fmtIndex(r.cpk)}</div>
            {r.valid ? (
              <p className="text-sm font-semibold mt-1">{band.label}</p>
            ) : (
              <p className="text-xs text-muted-foreground mt-1">Enter spec limit(s) and a positive standard deviation.</p>
            )}
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-xs font-bold uppercase tracking-wider opacity-80 mb-0.5">Estimated out of spec</p>
              <div className="text-2xl font-bold">
                {fmtPpm(r.ppm)}
                {r.valid && <span className="text-sm font-semibold opacity-70"> PPM</span>}
              </div>
              <p className="text-[11px] opacity-70 mt-0.5">Assuming a normal distribution.</p>
            </div>
          </div>

          <Link
            href="/library/statistical-process-control"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-sm hover:border-primary/40 transition-colors"
          >
            <BookOpen className="w-4 h-4 text-primary shrink-0" />
            <span className="text-muted-foreground">
              <span className="font-semibold text-foreground">Learn the method</span> — control vs capability, Cp vs Cpk vs Ppk
            </span>
          </Link>

          <div className="rounded-2xl border border-teal-500/20 bg-gradient-to-br from-teal-500/10 to-transparent p-4">
            <p className="text-sm font-semibold mb-1">Take it into CPV</p>
            <p className="text-xs text-muted-foreground mb-3">
              Pro unlocks the full toolkit library — protocol checklists, trending and investigation
              templates, and SOP gap-analysis sheets for continued process verification.
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
              <li>Cpk ≥ 1.33 is the common minimum for a capable process.</li>
              <li>Cp uses the spec width; Cpk also accounts for centering.</li>
              <li>Use long-term (overall) s and the same formulas for Pp / Ppk.</li>
            </ul>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed flex items-start gap-1.5">
            <Info className="w-3 h-3 mt-0.5 shrink-0 text-primary/70" />
            Educational calculation. Capability indices are only meaningful for a process that is in
            statistical control and approximately normal — verify both, and follow your validated SOP.
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
        step="any"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-sm"
      />
    </div>
  );
}
