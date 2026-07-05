import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, ClipboardCheck, Copy, Info, RotateCcw, ShieldAlert } from "lucide-react";
import { copyText } from "@/lib/clipboard";

type Answer = "yes" | "partial" | "no";

interface Criterion {
  id: string;
  label: string;
  fix: string;
}

const ANSWERS: { value: Answer; label: string; points: number }[] = [
  { value: "yes", label: "Yes", points: 2 },
  { value: "partial", label: "Partial", points: 1 },
  { value: "no", label: "No", points: 0 },
];

const CRITERIA: Criterion[] = [
  {
    id: "root-cause",
    label: "The CAPA is tied to a verified root cause, not only the observed symptom.",
    fix: "Reopen the investigation logic and show why the selected root cause explains the event.",
  },
  {
    id: "action-fit",
    label: "Each action directly removes, controls, or detects the root cause.",
    fix: "Map every action to the root cause. Remove training-only actions unless the cause is competency.",
  },
  {
    id: "metric",
    label: "The effectiveness check has a measurable acceptance criterion.",
    fix: "Define pass/fail criteria before execution, such as zero recurrence or a target reduction.",
  },
  {
    id: "baseline",
    label: "There is a baseline or historical comparator for the metric.",
    fix: "Use prior deviation rate, EM trend, assay failure rate, audit repeat finding rate, or another defensible baseline.",
  },
  {
    id: "window",
    label: "The verification window is long enough to observe recurrence.",
    fix: "Set a window based on process frequency and risk, not a default calendar habit.",
  },
  {
    id: "independent",
    label: "Evidence comes from routine data or independent verification, not only task completion.",
    fix: "Use batch data, audit trail review, EM trend, QC result trend, or QA spot-check evidence.",
  },
  {
    id: "ownership",
    label: "Owner, due date, evidence source, and QA review point are defined.",
    fix: "Assign a single owner and specify exactly what record will prove the check was performed.",
  },
  {
    id: "side-effects",
    label: "The plan checks for unintended effects introduced by the CAPA.",
    fix: "Add a check for delays, new deviations, yield impact, invalid tests, or workarounds.",
  },
];

const EVENT_TYPES = [
  "OOS / laboratory investigation",
  "Deviation / process event",
  "Audit finding",
  "Environmental monitoring excursion",
  "Complaint / market feedback",
];

const TONE = {
  red: "border-red-500/30 bg-red-500/10 text-red-100",
  amber: "border-amber-500/30 bg-amber-500/10 text-amber-100",
  teal: "border-teal-500/30 bg-teal-500/10 text-teal-100",
};

function toneFor(score: number) {
  if (score < 55) {
    return {
      tone: "red" as const,
      label: "Not ready for effectiveness check",
      summary: "The CAPA may be closed on activity rather than effectiveness. Tighten root-cause linkage and measurable criteria first.",
    };
  }
  if (score < 80) {
    return {
      tone: "amber" as const,
      label: "Needs tightening before QA review",
      summary: "The plan has useful pieces, but a regulator or auditor could still challenge the evidence logic.",
    };
  }
  return {
    tone: "teal" as const,
    label: "Ready to verify effectiveness",
    summary: "The plan is tied to evidence, timing, ownership, and recurrence logic. It is ready for QA review.",
  };
}

function recommendationFor(eventType: string, windowDays: number, metric: string) {
  const metricText = metric.trim() || "recurrence of the same or related failure mode";
  if (eventType.includes("Environmental")) {
    return `Review EM trend data for ${windowDays} days and confirm ${metricText} stays within the defined alert/action response criteria.`;
  }
  if (eventType.includes("OOS")) {
    return `Review repeat assay, invalid-run, and related OOT/OOS signals for ${windowDays} days and confirm ${metricText} meets the predefined criterion.`;
  }
  if (eventType.includes("Audit")) {
    return `Perform an independent spot check after implementation and confirm ${metricText} is not repeated in the sampled records.`;
  }
  if (eventType.includes("Complaint")) {
    return `Review complaint trend and batch disposition signals for ${windowDays} days and confirm ${metricText} is controlled.`;
  }
  return `Review routine process and quality-system data for ${windowDays} days and confirm ${metricText} meets the predefined criterion.`;
}

function buildEvidencePlan({
  eventType,
  windowDays,
  metric,
  recommendation,
  score,
  bandLabel,
  weakSpots,
}: {
  eventType: string;
  windowDays: number;
  metric: string;
  recommendation: string;
  score: number;
  bandLabel: string;
  weakSpots: Criterion[];
}) {
  const metricText = metric.trim() || "Define a measurable CAPA effectiveness metric";
  const tighten = weakSpots.length
    ? weakSpots.map((spot, index) => `${index + 1}. ${spot.fix}`).join("\n")
    : "None identified from this planner check.";

  return [
    "# CAPA effectiveness check plan",
    "",
    `Event type: ${eventType}`,
    `Readiness score: ${score}% - ${bandLabel}`,
    `Effectiveness metric: ${metricText}`,
    `Verification window: ${windowDays} days`,
    "",
    "Suggested effectiveness check:",
    recommendation,
    "",
    "Evidence package:",
    "- Routine records or trend data linked to the original failure mode",
    "- QA review against a predefined pass/fail criterion",
    "- Confirmation that the CAPA did not create unintended side effects",
    "",
    "Before closure, tighten:",
    tighten,
  ].join("\n");
}

export function CapaEffectivenessPlanner() {
  const [eventType, setEventType] = useState(EVENT_TYPES[1]);
  const [windowDays, setWindowDays] = useState(90);
  const [metric, setMetric] = useState("no repeat deviation for the same root cause");
  const [copied, setCopied] = useState(false);
  const [answers, setAnswers] = useState<Record<string, Answer>>({
    "root-cause": "partial",
    "action-fit": "partial",
    metric: "yes",
    baseline: "partial",
    window: "yes",
    independent: "partial",
    ownership: "yes",
    "side-effects": "no",
  });

  const result = useMemo(() => {
    const assessed = Object.keys(answers).length;
    const earned = Object.values(answers).reduce((sum, answer) => {
      return sum + (ANSWERS.find((item) => item.value === answer)?.points ?? 0);
    }, 0);
    const score = assessed ? Math.round((earned / (assessed * 2)) * 100) : 0;
    const weakSpots = CRITERIA.filter((criterion) => answers[criterion.id] && answers[criterion.id] !== "yes");
    return { assessed, score, band: toneFor(score), weakSpots };
  }, [answers]);

  const recommendation = recommendationFor(eventType, windowDays, metric);
  const evidencePlan = useMemo(
    () =>
      buildEvidencePlan({
        eventType,
        windowDays,
        metric,
        recommendation,
        score: result.score,
        bandLabel: result.band.label,
        weakSpots: result.weakSpots,
      }),
    [eventType, windowDays, metric, recommendation, result.score, result.band.label, result.weakSpots],
  );

  async function copyEvidencePlan() {
    await copyText(evidencePlan);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-card p-5 md:p-6">
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">CAPA Effectiveness Check Planner</h2>
        </div>
        <button
          onClick={() => {
            setEventType(EVENT_TYPES[1]);
            setWindowDays(90);
            setMetric("no repeat deviation for the same root cause");
            setAnswers({});
          }}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        Build a defensible CAPA effectiveness check before closure. The goal is evidence that the
        root cause is controlled, not just proof that tasks were completed.
      </p>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_330px] gap-6">
        <div className="space-y-5">
          <div className="grid md:grid-cols-3 gap-3">
            <label>
              <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Event type
              </span>
              <select
                value={eventType}
                onChange={(event) => setEventType(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              >
                {EVENT_TYPES.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Verification window
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={7}
                  max={365}
                  value={windowDays}
                  onChange={(event) => setWindowDays(Math.max(7, Number(event.target.value) || 7))}
                  className="w-full rounded-xl border border-white/10 bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                />
                <span className="text-xs text-muted-foreground">days</span>
              </div>
            </label>
            <label>
              <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Effectiveness metric
              </span>
              <input
                value={metric}
                onChange={(event) => setMetric(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
            </label>
          </div>

          <div className="space-y-2.5">
            {CRITERIA.map((criterion) => (
              <div key={criterion.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="flex flex-col sm:flex-row sm:items-start gap-2.5 sm:gap-3">
                  <p className="text-sm flex-1">{criterion.label}</p>
                  <div className="flex gap-1 shrink-0" role="group" aria-label={criterion.label}>
                    {ANSWERS.map((answer) => {
                      const active = answers[criterion.id] === answer.value;
                      const activeTone =
                        answer.value === "yes"
                          ? "bg-teal-500 text-teal-950 border-teal-500"
                          : answer.value === "partial"
                            ? "bg-amber-500 text-amber-950 border-amber-500"
                            : "bg-red-500 text-red-950 border-red-500";
                      return (
                        <button
                          key={answer.value}
                          onClick={() => setAnswers((prev) => ({ ...prev, [criterion.id]: answer.value }))}
                          aria-pressed={active}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                            active ? activeTone : "border-white/10 text-muted-foreground hover:border-white/30"
                          }`}
                        >
                          {answer.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {answers[criterion.id] && answers[criterion.id] !== "yes" && (
                  <p className="mt-2 text-xs text-muted-foreground flex items-start gap-1.5">
                    <ArrowRight className="w-3 h-3 mt-0.5 shrink-0 text-amber-400" />
                    <span>
                      <span className="font-semibold text-foreground">Tighten: </span>
                      {criterion.fix}
                    </span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <aside className="lg:sticky lg:top-20 self-start space-y-4">
          <div className={`rounded-2xl border p-5 ${TONE[result.band.tone]}`}>
            <div className="flex items-center gap-2 mb-2">
              {result.band.tone === "teal" ? <CheckCircle2 className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
              <p className="text-[11px] font-bold uppercase tracking-wider opacity-80">Planner score</p>
            </div>
            <div className="text-4xl font-bold mb-1">{result.score}%</div>
            <p className="text-sm font-semibold mb-1">{result.band.label}</p>
            <p className="text-xs opacity-85 leading-relaxed">{result.band.summary}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Suggested check</p>
            <p className="text-sm leading-relaxed">{recommendation}</p>
          </div>

          {result.weakSpots.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
                Before closure, tighten
              </p>
              <ol className="space-y-2">
                {result.weakSpots.slice(0, 4).map((spot, index) => (
                  <li key={spot.id} className="text-xs flex gap-2">
                    <span className="font-bold text-amber-400 shrink-0">{index + 1}</span>
                    <span className="text-muted-foreground">{spot.fix}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="rounded-2xl border border-teal-500/20 bg-gradient-to-br from-teal-500/10 to-transparent p-4">
            <p className="text-sm font-semibold mb-1">Effectiveness package</p>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li>Metric: {metric.trim() || "define a measurable metric"}</li>
              <li>Window: {windowDays} days</li>
              <li>Evidence: routine records plus QA review</li>
              <li>Decision: pass/fail before closure</li>
            </ul>
            <button
              onClick={copyEvidencePlan}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-teal-500/30 bg-teal-500/10 px-3 py-2 text-xs font-bold text-teal-200 transition-colors hover:bg-teal-500/15"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy plan"}
            </button>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed flex items-start gap-1.5">
            <Info className="w-3 h-3 mt-0.5 shrink-0 text-primary/70" />
            Educational planning aid only. Your approved CAPA procedure and QA disposition remain the source of truth.
          </p>
        </aside>
      </div>
    </section>
  );
}
