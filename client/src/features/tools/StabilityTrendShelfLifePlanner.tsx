import { useMemo, useState } from "react";
import { Activity, CheckCircle2, Copy, Info, RotateCcw, ShieldAlert } from "lucide-react";
import { copyText } from "@/lib/clipboard";

type Tone = "red" | "amber" | "teal";

const DEFAULT_POINTS = `0, 100.5
3, 100.1
6, 99.6
9, 99.2
12, 98.7
18, 97.9`;

const TONE: Record<Tone, string> = {
  red: "border-red-500/30 bg-red-500/10 text-red-100",
  amber: "border-amber-500/30 bg-amber-500/10 text-amber-100",
  teal: "border-teal-500/30 bg-teal-500/10 text-teal-100",
};

interface Point {
  month: number;
  value: number;
}

function parsePoints(raw: string): Point[] {
  return raw
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [monthRaw, valueRaw] = line.split(/[\s,;\t]+/);
      return { month: Number(monthRaw), value: Number(valueRaw) };
    })
    .filter((point) => Number.isFinite(point.month) && Number.isFinite(point.value))
    .sort((a, b) => a.month - b.month);
}

function round(value: number, digits = 2) {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function regression(points: Point[]) {
  if (points.length < 2) return { slope: 0, intercept: points[0]?.value ?? 0, r2: 0 };
  const n = points.length;
  const meanX = points.reduce((sum, p) => sum + p.month, 0) / n;
  const meanY = points.reduce((sum, p) => sum + p.value, 0) / n;
  const sxx = points.reduce((sum, p) => sum + (p.month - meanX) ** 2, 0);
  const sxy = points.reduce((sum, p) => sum + (p.month - meanX) * (p.value - meanY), 0);
  const slope = sxx === 0 ? 0 : sxy / sxx;
  const intercept = meanY - slope * meanX;
  const ssTot = points.reduce((sum, p) => sum + (p.value - meanY) ** 2, 0);
  const ssRes = points.reduce((sum, p) => sum + (p.value - (intercept + slope * p.month)) ** 2, 0);
  const r2 = ssTot === 0 ? 1 : Math.max(0, 1 - ssRes / ssTot);
  return { slope, intercept, r2 };
}

function evaluate({
  points,
  lower,
  upper,
  proposedMonths,
  acceleratedChange,
}: {
  points: Point[];
  lower: number;
  upper: number;
  proposedMonths: number;
  acceleratedChange: boolean;
}) {
  const stats = regression(points);
  const latest = points[points.length - 1];
  const maxObservedMonth = latest?.month ?? 0;
  const projectedAtProposed = stats.intercept + stats.slope * proposedMonths;
  const currentOos = points.some((point) => point.value < lower || point.value > upper);
  const projectedOos = projectedAtProposed < lower || projectedAtProposed > upper;
  const span = Math.max(upper - lower, 0.000001);
  const projectedHeadroom = Math.min(Math.abs(projectedAtProposed - lower), Math.abs(upper - projectedAtProposed));
  const headroomPct = Math.max(0, Math.round((projectedHeadroom / span) * 100));
  const monthsToLower = stats.slope < 0 ? (lower - stats.intercept) / stats.slope : Number.POSITIVE_INFINITY;
  const monthsToUpper = stats.slope > 0 ? (upper - stats.intercept) / stats.slope : Number.POSITIVE_INFINITY;
  const monthsToLimit = Math.min(monthsToLower, monthsToUpper);
  const extrapolating = proposedMonths > maxObservedMonth;
  const driftPerYear = Math.abs(stats.slope) * 12;
  const lowDrift = driftPerYear <= span * 0.08;
  const tightFit = stats.r2 < 0.85 || points.length >= 4;

  if (points.length < 3) {
    return {
      tone: "amber" as const,
      label: "Need more stability points",
      summary: "Enter at least three time points before using the trend for shelf-life discussion.",
      stats,
      maxObservedMonth,
      projectedAtProposed,
      headroomPct,
      monthsToLimit,
      extrapolating,
    };
  }

  if (currentOos) {
    return {
      tone: "red" as const,
      label: "Stability OOS present",
      summary: "At least one entered result is outside specification. Treat this as a stability OOS and assess distributed-batch or shelf-life impact.",
      stats,
      maxObservedMonth,
      projectedAtProposed,
      headroomPct,
      monthsToLimit,
      extrapolating,
    };
  }

  if (projectedOos || monthsToLimit <= proposedMonths) {
    return {
      tone: "red" as const,
      label: "Proposed period is not supported",
      summary: "The simple trend projects a specification crossing before the proposed retest period or shelf life. Do not extrapolate this package without stronger data and QA/statistical review.",
      stats,
      maxObservedMonth,
      projectedAtProposed,
      headroomPct,
      monthsToLimit,
      extrapolating,
    };
  }

  if (acceleratedChange && extrapolating) {
    return {
      tone: "amber" as const,
      label: "Extrapolation needs caution",
      summary: "A significant accelerated change is selected while the proposed period exceeds real-time data. Intermediate/long-term support and a documented Q1E rationale are needed.",
      stats,
      maxObservedMonth,
      projectedAtProposed,
      headroomPct,
      monthsToLimit,
      extrapolating,
    };
  }

  if (extrapolating && (!lowDrift || !tightFit || headroomPct < 15)) {
    return {
      tone: "amber" as const,
      label: "Limited extrapolation review",
      summary: "The result remains projected in specification, but the trend, variability, or headroom should be reviewed before extending beyond real-time data.",
      stats,
      maxObservedMonth,
      projectedAtProposed,
      headroomPct,
      monthsToLimit,
      extrapolating,
    };
  }

  return {
    tone: "teal" as const,
    label: extrapolating ? "Trend supports limited Q1E discussion" : "Trend supports the observed period",
    summary: extrapolating
      ? "The simple long-term trend remains in specification with adequate headroom. Use this as a discussion aid for limited Q1E extrapolation, not as automatic approval."
      : "The proposed period is covered by real-time data and all entered points remain in specification.",
    stats,
    maxObservedMonth,
    projectedAtProposed,
    headroomPct,
    monthsToLimit,
    extrapolating,
  };
}

function fmt(value: number, digits = 1) {
  if (!Number.isFinite(value)) return "Not projected";
  return round(value, digits).toString();
}

function buildNote({
  attribute,
  condition,
  lower,
  upper,
  proposedMonths,
  acceleratedChange,
  points,
  result,
}: {
  attribute: string;
  condition: string;
  lower: number;
  upper: number;
  proposedMonths: number;
  acceleratedChange: boolean;
  points: Point[];
  result: ReturnType<typeof evaluate>;
}) {
  return [
    "# Stability trend and shelf-life planning note",
    "",
    `Attribute: ${attribute.trim() || "Stability attribute"}`,
    `Condition: ${condition}`,
    `Specification: ${lower} to ${upper}`,
    `Proposed retest period / shelf life: ${proposedMonths} months`,
    `Real-time data through: ${result.maxObservedMonth} months`,
    `Accelerated significant change selected: ${acceleratedChange ? "Yes" : "No"}`,
    "",
    `Trend slope: ${fmt(result.stats.slope, 3)} units/month`,
    `R2: ${fmt(result.stats.r2, 2)}`,
    `Projected result at proposed period: ${fmt(result.projectedAtProposed, 2)}`,
    `Projected nearest-spec headroom: ${result.headroomPct}% of spec span`,
    `Projected limit crossing: ${fmt(result.monthsToLimit, 1)} months`,
    `Triage: ${result.label}`,
    "",
    "Decision guidance:",
    result.summary,
    "",
    "Entered stability points:",
    points.map((point) => `- Month ${point.month}: ${point.value}`).join("\n") || "- None",
    "",
    "Minimum evidence to attach:",
    "- Approved stability protocol and storage condition",
    "- Stability-indicating method validation or suitability evidence",
    "- Long-term, accelerated, and intermediate data as applicable",
    "- OOT/OOS and distributed-batch impact assessment where triggered",
    "- QA/statistical rationale for any extrapolation beyond real-time data",
  ].join("\n");
}

export function StabilityTrendShelfLifePlanner() {
  const [attribute, setAttribute] = useState("Assay, long-term stability");
  const [condition, setCondition] = useState("25 C / 60% RH long-term");
  const [lower, setLower] = useState(95);
  const [upper, setUpper] = useState(105);
  const [proposedMonths, setProposedMonths] = useState(24);
  const [acceleratedChange, setAcceleratedChange] = useState(false);
  const [rawPoints, setRawPoints] = useState(DEFAULT_POINTS);
  const [copied, setCopied] = useState(false);

  const points = useMemo(() => parsePoints(rawPoints), [rawPoints]);
  const result = useMemo(
    () => evaluate({ points, lower, upper, proposedMonths, acceleratedChange }),
    [points, lower, upper, proposedMonths, acceleratedChange],
  );
  const note = useMemo(
    () =>
      buildNote({
        attribute,
        condition,
        lower,
        upper,
        proposedMonths,
        acceleratedChange,
        points,
        result,
      }),
    [attribute, condition, lower, upper, proposedMonths, acceleratedChange, points, result],
  );

  function reset() {
    setAttribute("Assay, long-term stability");
    setCondition("25 C / 60% RH long-term");
    setLower(95);
    setUpper(105);
    setProposedMonths(24);
    setAcceleratedChange(false);
    setRawPoints(DEFAULT_POINTS);
  }

  async function copyNote() {
    await copyText(note);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-card p-5 md:p-6">
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">Stability Trend & Shelf-Life Planner</h2>
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        Plot a simple long-term stability trend, project the nearest specification limit, and decide
        whether a proposed retest period or shelf life needs Q1E/statistical review.
      </p>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_330px] gap-6">
        <div className="space-y-5">
          <div className="grid md:grid-cols-2 gap-3">
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
            <label>
              <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Storage condition
              </span>
              <select
                value={condition}
                onChange={(event) => setCondition(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option>25 C / 60% RH long-term</option>
                <option>30 C / 65% RH intermediate</option>
                <option>30 C / 75% RH long-term</option>
                <option>40 C / 75% RH accelerated</option>
                <option>2-8 C refrigerated</option>
              </select>
            </label>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              ["Lower spec", lower, setLower],
              ["Upper spec", upper, setUpper],
              ["Proposed months", proposedMonths, setProposedMonths],
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
            <label className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
              <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Accelerated change?
              </span>
              <button
                type="button"
                onClick={() => setAcceleratedChange((value) => !value)}
                aria-pressed={acceleratedChange}
                className={
                  acceleratedChange
                    ? "rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-100"
                    : "rounded-lg border border-white/10 bg-background px-3 py-1.5 text-xs text-muted-foreground"
                }
              >
                {acceleratedChange ? "Yes" : "No"}
              </button>
            </label>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2.5">
              Stability points
            </p>
            <textarea
              value={rawPoints}
              onChange={(event) => setRawPoints(event.target.value)}
              rows={7}
              placeholder="One row per point: month, result"
              className="w-full rounded-xl border border-white/10 bg-background px-3 py-2.5 text-sm font-mono outline-none focus:ring-2 focus:ring-primary/40"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Parsed <span className="font-semibold text-foreground">{points.length}</span> time point
              {points.length === 1 ? "" : "s"}. Use long-term data for the main shelf-life discussion.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-2">
            <Metric label="Slope" value={`${fmt(result.stats.slope, 3)} / month`} />
            <Metric label="R2" value={fmt(result.stats.r2, 2)} />
            <Metric label="Data through" value={`${result.maxObservedMonth} months`} />
          </div>
        </div>

        <aside className="lg:sticky lg:top-20 self-start space-y-4">
          <div className={`rounded-2xl border p-5 ${TONE[result.tone]}`}>
            <div className="flex items-center gap-2 mb-2">
              {result.tone === "teal" ? <CheckCircle2 className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
              <p className="text-[11px] font-bold uppercase tracking-wider opacity-80">Stability triage</p>
            </div>
            <p className="text-lg font-bold mb-2">{result.label}</p>
            <p className="text-xs opacity-85 leading-relaxed">{result.summary}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-semibold mb-2">Projection</p>
            <div className="space-y-2 text-xs text-muted-foreground">
              <Stat label={`At ${proposedMonths} months`} value={fmt(result.projectedAtProposed, 2)} />
              <Stat label="Nearest-spec headroom" value={`${result.headroomPct}%`} />
              <Stat label="Limit crossing" value={`${fmt(result.monthsToLimit, 1)} months`} />
            </div>
            <button
              onClick={copyNote}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-teal-500/30 bg-teal-500/10 px-3 py-2 text-xs font-bold text-teal-200 transition-colors hover:bg-teal-500/15"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy stability note"}
            </button>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed flex items-start gap-1.5">
            <Info className="w-3 h-3 mt-0.5 shrink-0 text-primary/70" />
            Educational planning aid only. ICH Q1A/Q1E, your approved stability protocol,
            validated methods, and QA/statistical review remain the source of truth.
          </p>
        </aside>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm font-bold tabular-nums">{value}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span>{label}</span>
      <span className="font-semibold text-foreground tabular-nums">{value}</span>
    </div>
  );
}
