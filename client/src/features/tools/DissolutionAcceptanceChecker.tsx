import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Beaker, BookOpen, CheckCircle2, Copy, Info, RotateCcw, XCircle } from "lucide-react";
import { copyText } from "@/lib/clipboard";

const DEFAULT_Q = 80;
const DEFAULT_UNITS = "86, 85, 84, 88, 87, 82, 80, 81, 78, 79, 83, 82";

const TONE = {
  teal: "border-teal-500/30 bg-teal-500/10 text-teal-100",
  amber: "border-amber-500/30 bg-amber-500/10 text-amber-100",
  red: "border-red-500/30 bg-red-500/10 text-red-100",
};

function parseValues(raw: string): number[] {
  return raw
    .split(/[\s,;]+/)
    .map((part) => Number(part.trim()))
    .filter((value) => Number.isFinite(value));
}

function mean(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function fmt(value: number) {
  return Number.isFinite(value) ? value.toFixed(1).replace(/\.0$/, "") : "-";
}

function evaluateDissolution(q: number, values: number[]) {
  const units = values.slice(0, 24);
  const s1 = units.slice(0, 6);
  const s2 = units.slice(0, 12);
  const s3 = units.slice(0, 24);
  const qPlus5 = q + 5;
  const qMinus15 = q - 15;
  const qMinus25 = q - 25;

  const s1Pass = s1.length === 6 && s1.every((value) => value >= qPlus5);
  const s2Pass = s2.length >= 12 && mean(s2) >= q && s2.every((value) => value >= qMinus15);
  const s3Below15 = s3.filter((value) => value < qMinus15).length;
  const s3Pass = s3.length >= 24 && mean(s3) >= q && s3Below15 <= 2 && s3.every((value) => value >= qMinus25);

  if (s1.length < 6) {
    return {
      tone: "amber" as const,
      stage: "Need S1 data",
      label: "Enter 6 units for S1",
      detail: `${6 - s1.length} more unit result${6 - s1.length === 1 ? "" : "s"} needed before S1 can be evaluated.`,
      s1Pass,
      s2Pass,
      s3Pass,
      mean12: mean(s2),
      mean24: mean(s3),
      qPlus5,
      qMinus15,
      qMinus25,
      s3Below15,
    };
  }

  if (s1Pass) {
    return {
      tone: "teal" as const,
      stage: "S1",
      label: "Accepted at S1",
      detail: `All first 6 units are at least Q + 5 (${fmt(qPlus5)}%). No additional staged testing is indicated by this table.`,
      s1Pass,
      s2Pass,
      s3Pass,
      mean12: mean(s2),
      mean24: mean(s3),
      qPlus5,
      qMinus15,
      qMinus25,
      s3Below15,
    };
  }

  if (s2.length < 12) {
    return {
      tone: "amber" as const,
      stage: "Move to S2",
      label: "S1 not met - test 6 additional units",
      detail: `At least one of the first 6 units is below Q + 5 (${fmt(qPlus5)}%). Add 6 units and evaluate S2.`,
      s1Pass,
      s2Pass,
      s3Pass,
      mean12: mean(s2),
      mean24: mean(s3),
      qPlus5,
      qMinus15,
      qMinus25,
      s3Below15,
    };
  }

  if (s2Pass) {
    return {
      tone: "teal" as const,
      stage: "S2",
      label: "Accepted at S2",
      detail: `Average of 12 units is at least Q (${fmt(mean(s2))}% vs ${fmt(q)}%), and no unit is below Q - 15 (${fmt(qMinus15)}%).`,
      s1Pass,
      s2Pass,
      s3Pass,
      mean12: mean(s2),
      mean24: mean(s3),
      qPlus5,
      qMinus15,
      qMinus25,
      s3Below15,
    };
  }

  if (s3.length < 24) {
    return {
      tone: "amber" as const,
      stage: "Move to S3",
      label: "S2 not met - test 12 additional units",
      detail: `S2 did not meet the average and individual-unit criteria. Add 12 units and evaluate S3 before final disposition.`,
      s1Pass,
      s2Pass,
      s3Pass,
      mean12: mean(s2),
      mean24: mean(s3),
      qPlus5,
      qMinus15,
      qMinus25,
      s3Below15,
    };
  }

  if (s3Pass) {
    return {
      tone: "teal" as const,
      stage: "S3",
      label: "Accepted at S3",
      detail: `Average of 24 units is at least Q, not more than 2 units are below Q - 15, and no unit is below Q - 25.`,
      s1Pass,
      s2Pass,
      s3Pass,
      mean12: mean(s2),
      mean24: mean(s3),
      qPlus5,
      qMinus15,
      qMinus25,
      s3Below15,
    };
  }

  return {
    tone: "red" as const,
    stage: "S3",
    label: "Not accepted after S3",
    detail: "The 24-unit set does not meet the S3 acceptance criteria. Treat as a dissolution failure/OOS per your approved procedure.",
    s1Pass,
    s2Pass,
    s3Pass,
    mean12: mean(s2),
    mean24: mean(s3),
    qPlus5,
    qMinus15,
    qMinus25,
    s3Below15,
  };
}

function buildDissolutionNote(q: number, values: number[], result: ReturnType<typeof evaluateDissolution>) {
  const units = values.slice(0, 24);
  return [
    "# Dissolution staged acceptance check",
    "",
    `Q value: ${fmt(q)}%`,
    `Units evaluated: ${units.length}${values.length > 24 ? " (first 24 used)" : ""}`,
    `Result: ${result.label}`,
    `Stage: ${result.stage}`,
    "",
    "Summary:",
    `- S1 criterion: each of first 6 units >= Q + 5 (${fmt(result.qPlus5)}%): ${result.s1Pass ? "met" : "not met"}`,
    `- S2 criterion: 12-unit average >= Q and no unit < Q - 15 (${fmt(result.qMinus15)}%): ${result.s2Pass ? "met" : "not met"}`,
    `- S3 criterion: 24-unit average >= Q, max 2 units < Q - 15, none < Q - 25 (${fmt(result.qMinus25)}%): ${result.s3Pass ? "met" : "not met"}`,
    "",
    "Unit results (% dissolved):",
    units.map((value, index) => `${index + 1}. ${fmt(value)}%`).join("\n"),
  ].join("\n");
}

export function DissolutionAcceptanceChecker() {
  const [q, setQ] = useState(DEFAULT_Q);
  const [raw, setRaw] = useState(DEFAULT_UNITS);
  const [copied, setCopied] = useState(false);

  const values = useMemo(() => parseValues(raw), [raw]);
  const result = useMemo(() => evaluateDissolution(q, values), [q, values]);
  const note = useMemo(() => buildDissolutionNote(q, values, result), [q, values, result]);

  function reset() {
    setQ(DEFAULT_Q);
    setRaw(DEFAULT_UNITS);
  }

  async function copyNote() {
    await copyText(note);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  const unitsUsed = values.slice(0, 24);

  return (
    <section className="rounded-2xl border border-white/10 bg-card p-5 md:p-6">
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <div className="flex items-center gap-2">
          <Beaker className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">Dissolution S1/S2/S3 Acceptance Checker</h2>
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        Paste immediate-release dissolution unit results (% dissolved), enter the product Q value,
        and check the staged USP 711-style S1/S2/S3 acceptance table.
      </p>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_330px] gap-6">
        <div className="space-y-5">
          <div className="grid sm:grid-cols-[160px_minmax(0,1fr)] gap-3">
            <label>
              <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Q value (%)
              </span>
              <input
                type="number"
                min={1}
                max={100}
                step={0.1}
                value={q}
                onChange={(event) => setQ(Number(event.target.value))}
                className="w-full rounded-xl border border-white/10 bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
            </label>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Thresholds</p>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <Threshold label="Q + 5" value={result.qPlus5} />
                <Threshold label="Q - 15" value={result.qMinus15} />
                <Threshold label="Q - 25" value={result.qMinus25} />
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2.5">
              Unit results (% dissolved)
            </p>
            <textarea
              value={raw}
              onChange={(event) => setRaw(event.target.value)}
              rows={6}
              placeholder="Paste 6, 12, or 24 values separated by spaces, commas, semicolons, or new lines"
              className="w-full rounded-xl border border-white/10 bg-background px-3 py-2.5 text-sm font-mono outline-none focus:ring-2 focus:ring-primary/40"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Parsed <span className="font-semibold text-foreground">{values.length}</span> value
              {values.length === 1 ? "" : "s"}. {values.length > 24 ? "Only the first 24 are used." : ""}
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-2">
            <Criterion
              ok={result.s1Pass}
              label="S1"
              detail={`6 units, each >= ${fmt(result.qPlus5)}%`}
            />
            <Criterion
              ok={result.s2Pass}
              label="S2"
              detail={`Avg 12 >= ${fmt(q)}%; none < ${fmt(result.qMinus15)}%`}
            />
            <Criterion
              ok={result.s3Pass}
              label="S3"
              detail={`Avg 24 >= ${fmt(q)}%; <=2 below ${fmt(result.qMinus15)}%`}
            />
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-semibold mb-3">Parsed unit table</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {unitsUsed.length ? (
                unitsUsed.map((value, index) => (
                  <div key={`${index}-${value}`} className="rounded-lg border border-white/10 bg-background px-2.5 py-2">
                    <p className="text-[11px] text-muted-foreground">Unit {index + 1}</p>
                    <p className="text-sm font-bold tabular-nums">{fmt(value)}%</p>
                  </div>
                ))
              ) : (
                <p className="col-span-full text-sm text-muted-foreground">No numeric values parsed yet.</p>
              )}
            </div>
          </div>
        </div>

        <aside className="lg:sticky lg:top-20 self-start space-y-4">
          <div className={`rounded-2xl border p-5 ${TONE[result.tone]}`}>
            <p className="text-[11px] font-bold uppercase tracking-wider opacity-80 mb-1">Dissolution result</p>
            <div className="text-4xl font-bold mb-1">{result.stage}</div>
            <p className="text-sm font-semibold mb-2">{result.label}</p>
            <p className="text-xs opacity-85 leading-relaxed">{result.detail}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-semibold mb-2">Stage statistics</p>
            <div className="space-y-2 text-xs text-muted-foreground">
              <Stat label="12-unit average" value={unitsUsed.length >= 12 ? `${fmt(result.mean12)}%` : "Need 12 units"} />
              <Stat label="24-unit average" value={unitsUsed.length >= 24 ? `${fmt(result.mean24)}%` : "Need 24 units"} />
              <Stat label="Units below Q - 15" value={`${result.s3Below15}`} />
            </div>
            <button
              onClick={copyNote}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-teal-500/30 bg-teal-500/10 px-3 py-2 text-xs font-bold text-teal-200 transition-colors hover:bg-teal-500/15"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy dissolution note"}
            </button>
          </div>

          <Link
            href="/library/dissolution-testing-usp-711"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-sm hover:border-primary/40 transition-colors"
          >
            <BookOpen className="w-4 h-4 text-primary shrink-0" />
            <span className="text-muted-foreground">
              <span className="font-semibold text-foreground">Learn the method</span> - dissolution setup and staged acceptance
            </span>
          </Link>

          <p className="text-[11px] text-muted-foreground leading-relaxed flex items-start gap-1.5">
            <Info className="w-3 h-3 mt-0.5 shrink-0 text-primary/70" />
            Educational checker for immediate-release/conventional forms. Always apply the current monograph, USP chapter, validated method, and SOP.
          </p>
        </aside>
      </div>
    </section>
  );
}

function Threshold({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="font-bold tabular-nums">{fmt(value)}%</p>
    </div>
  );
}

function Criterion({ ok, label, detail }: { ok: boolean; label: string; detail: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="flex items-center gap-2 mb-1">
        {ok ? <CheckCircle2 className="w-4 h-4 text-teal-300" /> : <XCircle className="w-4 h-4 text-amber-300" />}
        <p className="text-sm font-semibold">{label}</p>
      </div>
      <p className="text-xs text-muted-foreground">{detail}</p>
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
