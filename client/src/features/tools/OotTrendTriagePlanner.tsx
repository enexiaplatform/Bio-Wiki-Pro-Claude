import { useMemo, useState } from "react";
import { Activity, ArrowRight, CheckCircle2, Copy, Info, RotateCcw, ShieldAlert } from "lucide-react";
import { copyText } from "@/lib/clipboard";

type BandTone = "red" | "amber" | "teal";

const TONE: Record<BandTone, string> = {
  red: "border-red-500/30 bg-red-500/10 text-red-100",
  amber: "border-amber-500/30 bg-amber-500/10 text-amber-100",
  teal: "border-teal-500/30 bg-teal-500/10 text-teal-100",
};

function round(value: number, digits = 2) {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function classify({
  current,
  mean,
  sd,
  lower,
  upper,
}: {
  current: number;
  mean: number;
  sd: number;
  lower: number;
  upper: number;
}) {
  const safeSd = Math.max(sd, 0.000001);
  const z = (current - mean) / safeSd;
  const span = Math.max(upper - lower, 0.000001);
  const nearestSpecDistance = Math.min(Math.abs(current - lower), Math.abs(upper - current));
  const headroomPct = Math.max(0, Math.round((nearestSpecDistance / span) * 100));

  if (current < lower || current > upper) {
    return {
      tone: "red" as const,
      label: "OOS - handle under the OOS procedure",
      z,
      headroomPct,
      action:
        "Do not treat this as an OOT. Open the approved OOS process, preserve original data and preparations, and require QA disposition.",
    };
  }

  if (Math.abs(z) >= 3) {
    return {
      tone: "red" as const,
      label: "High-risk OOT signal",
      z,
      headroomPct,
      action:
        "Open an OOT investigation now. Confirm calculation, review method/system suitability, compare related lots and time points, and assess shelf-life or batch impact.",
    };
  }

  if (Math.abs(z) >= 2 || headroomPct <= 10) {
    return {
      tone: "amber" as const,
      label: "Probable OOT - investigate trend",
      z,
      headroomPct,
      action:
        "Document a trend assessment before the next routine review. Check whether the signal is method, product, stability, equipment, or analyst related.",
    };
  }

  if (Math.abs(z) >= 1.5 || headroomPct <= 20) {
    return {
      tone: "amber" as const,
      label: "Watch trend closely",
      z,
      headroomPct,
      action:
        "Keep the result in routine trending, add the next scheduled point to the review queue, and predefine what change would trigger formal investigation.",
    };
  }

  return {
    tone: "teal" as const,
    label: "In control against this baseline",
    z,
    headroomPct,
    action:
      "No OOT signal from these simple rules. Continue routine trending and keep the baseline current.",
  };
}

function buildTriageNote({
  attribute,
  current,
  mean,
  sd,
  lower,
  upper,
  label,
  z,
  headroomPct,
  action,
}: {
  attribute: string;
  current: number;
  mean: number;
  sd: number;
  lower: number;
  upper: number;
  label: string;
  z: number;
  headroomPct: number;
  action: string;
}) {
  return [
    "# OOT trend triage note",
    "",
    `Attribute: ${attribute.trim() || "Quality attribute"}`,
    `Current result: ${current}`,
    `Historical mean: ${mean}`,
    `Historical SD: ${sd}`,
    `Specification: ${lower} to ${upper}`,
    `Z-score vs baseline: ${round(z)}`,
    `Nearest-spec headroom: ${headroomPct}% of spec span`,
    `Triage: ${label}`,
    "",
    "Recommended action:",
    action,
    "",
    "Minimum evidence to attach:",
    "- Raw data and calculation check",
    "- Related historical trend or control chart",
    "- System suitability / method performance review",
    "- Product, stability, or batch-impact assessment where relevant",
  ].join("\n");
}

export function OotTrendTriagePlanner() {
  const [attribute, setAttribute] = useState("Assay at 6-month stability");
  const [current, setCurrent] = useState(96.2);
  const [mean, setMean] = useState(99);
  const [sd, setSd] = useState(0.8);
  const [lower, setLower] = useState(95);
  const [upper, setUpper] = useState(105);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => classify({ current, mean, sd, lower, upper }), [current, mean, sd, lower, upper]);
  const triageNote = useMemo(
    () =>
      buildTriageNote({
        attribute,
        current,
        mean,
        sd,
        lower,
        upper,
        label: result.label,
        z: result.z,
        headroomPct: result.headroomPct,
        action: result.action,
      }),
    [attribute, current, mean, sd, lower, upper, result],
  );

  async function copyTriageNote() {
    await copyText(triageNote);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function reset() {
    setAttribute("Assay at 6-month stability");
    setCurrent(96.2);
    setMean(99);
    setSd(0.8);
    setLower(95);
    setUpper(105);
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-card p-5 md:p-6">
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">OOT Trend Triage Planner</h2>
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        Triage an in-spec result against a historical baseline. Use it to decide whether the signal
        is routine noise, an OOT trend, or already an OOS event.
      </p>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_330px] gap-6">
        <div className="space-y-5">
          <label>
            <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Attribute / context
            </span>
            <input
              value={attribute}
              onChange={(event) => setAttribute(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
          </label>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              ["Current result", current, setCurrent],
              ["Historical mean", mean, setMean],
              ["Historical SD", sd, setSd],
              ["Lower spec", lower, setLower],
              ["Upper spec", upper, setUpper],
            ].map(([label, value, setter]) => (
              <label key={label as string}>
                <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  {label as string}
                </span>
                <input
                  type="number"
                  step="0.1"
                  value={value as number}
                  onChange={(event) => (setter as (value: number) => void)(Number(event.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                />
              </label>
            ))}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-primary mb-3">How this triage works</p>
            <div className="grid sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
              <p className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                OOS overrides trend logic when the current result is outside specification.
              </p>
              <p className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                A result beyond 3 SD from the historical mean is treated as a high-risk OOT signal.
              </p>
              <p className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                A result beyond 2 SD, or close to the nearest spec limit, should trigger trend review.
              </p>
              <p className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                Use your approved SOP for formal control limits, regression rules, and QA disposition.
              </p>
            </div>
          </div>
        </div>

        <aside className="lg:sticky lg:top-20 self-start space-y-4">
          <div className={`rounded-2xl border p-5 ${TONE[result.tone]}`}>
            <div className="flex items-center gap-2 mb-2">
              {result.tone === "teal" ? <CheckCircle2 className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
              <p className="text-[11px] font-bold uppercase tracking-wider opacity-80">Triage result</p>
            </div>
            <p className="text-lg font-bold mb-3">{result.label}</p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="rounded-xl border border-white/10 bg-black/10 p-3">
                <p className="text-[11px] uppercase tracking-wider opacity-70">Z-score</p>
                <p className="text-2xl font-bold">{round(result.z)}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/10 p-3">
                <p className="text-[11px] uppercase tracking-wider opacity-70">Spec headroom</p>
                <p className="text-2xl font-bold">{result.headroomPct}%</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed opacity-90">{result.action}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-semibold mb-2">Evidence checklist</p>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li>Raw data and calculation check</li>
              <li>Control chart or historical trend</li>
              <li>Method and system suitability review</li>
              <li>Batch, stability, or patient-risk impact assessment</li>
            </ul>
            <button
              onClick={copyTriageNote}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-teal-500/30 bg-teal-500/10 px-3 py-2 text-xs font-bold text-teal-200 transition-colors hover:bg-teal-500/15"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy triage note"}
            </button>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed flex items-start gap-1.5">
            <Info className="w-3 h-3 mt-0.5 shrink-0 text-primary/70" />
            Educational triage only. Formal OOT/OOS handling must follow your approved procedure and QA review.
          </p>
        </aside>
      </div>
    </section>
  );
}
