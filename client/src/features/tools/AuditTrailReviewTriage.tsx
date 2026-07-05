import { useMemo, useState } from "react";
import { CheckCircle2, ClipboardList, Copy, Info, RotateCcw, ShieldAlert } from "lucide-react";
import { copyText } from "@/lib/clipboard";

type Answer = "yes" | "partial" | "no";

interface Signal {
  id: string;
  label: string;
  weight: number;
  evidence: string;
}

const ANSWERS: { value: Answer; label: string; multiplier: number }[] = [
  { value: "yes", label: "Yes", multiplier: 1 },
  { value: "partial", label: "Unclear", multiplier: 0.5 },
  { value: "no", label: "No", multiplier: 0 },
];

const SYSTEM_TYPES = [
  "CDS / chromatographic data system",
  "LIMS",
  "GMP spreadsheet",
  "eBR / MES",
  "Stability system",
  "Other GxP system",
];

const SIGNALS: Signal[] = [
  {
    id: "critical-record",
    label: "The record supports release, stability, OOS, deviation, or another GMP decision.",
    weight: 3,
    evidence: "Attach the record ID, batch/sample reference, and the GMP decision it supports.",
  },
  {
    id: "deleted-modified",
    label: "There are deleted, modified, reprocessed, or repeated entries that affect the result.",
    weight: 4,
    evidence: "List each change with timestamp, user, original value, new value, and business reason.",
  },
  {
    id: "missing-reason",
    label: "A change or repeat action has no clear reason/comment or no linked investigation.",
    weight: 3,
    evidence: "Capture the missing rationale and require the reviewer to reconcile it before approval.",
  },
  {
    id: "privileged-user",
    label: "The action was performed by an admin, shared login, or user with excessive privileges.",
    weight: 4,
    evidence: "Attach the user-role matrix and confirm whether segregation of duties was maintained.",
  },
  {
    id: "after-result",
    label: "The action happened after the result was known or near a reporting/approval deadline.",
    weight: 3,
    evidence: "Show the sequence from acquisition to processing, review, approval, and reporting.",
  },
  {
    id: "review-gap",
    label: "The audit-trail review itself is missing, late, or not documented.",
    weight: 4,
    evidence: "Record who reviewed the trail, when, what exceptions were checked, and the conclusion.",
  },
  {
    id: "raw-data-gap",
    label: "Original/raw data are not easily retrievable, complete, or linked to the final result.",
    weight: 4,
    evidence: "Identify missing files, orphan data, export gaps, or records kept outside the validated system.",
  },
  {
    id: "recurring-pattern",
    label: "The same exception pattern appears across users, methods, batches, or dates.",
    weight: 3,
    evidence: "Trend the pattern by user, method, product, instrument, and time period.",
  },
];

const TONE = {
  red: "border-red-500/30 bg-red-500/10 text-red-100",
  amber: "border-amber-500/30 bg-amber-500/10 text-amber-100",
  teal: "border-teal-500/30 bg-teal-500/10 text-teal-100",
};

function resultFor(score: number) {
  if (score >= 70) {
    return {
      tone: "red" as const,
      label: "High-risk audit-trail exception",
      action:
        "Pause approval or release decisions until QA reviews the exception, reconciles original data, and determines whether a deviation or data-integrity investigation is required.",
    };
  }
  if (score >= 35) {
    return {
      tone: "amber" as const,
      label: "Needs documented reviewer follow-up",
      action:
        "Document the exception review, resolve missing rationale or access questions, and escalate to QA if the explanation is not evidence-backed.",
    };
  }
  return {
    tone: "teal" as const,
    label: "Routine audit-trail review",
    action:
      "No high-risk signal from this triage. Keep the review record with the batch, sample, study, or system review package.",
  };
}

function buildReviewNote({
  systemType,
  recordRef,
  score,
  label,
  action,
  triggeredSignals,
}: {
  systemType: string;
  recordRef: string;
  score: number;
  label: string;
  action: string;
  triggeredSignals: Signal[];
}) {
  const signals = triggeredSignals.length
    ? triggeredSignals.map((signal, index) => `${index + 1}. ${signal.label}\n   Evidence: ${signal.evidence}`).join("\n")
    : "No high-risk exception selected in this triage.";

  return [
    "# Audit trail review triage note",
    "",
    `System type: ${systemType}`,
    `Record / batch / sample reference: ${recordRef.trim() || "Not specified"}`,
    `Risk score: ${score}% - ${label}`,
    "",
    "Recommended action:",
    action,
    "",
    "Exceptions to document:",
    signals,
    "",
    "Minimum review package:",
    "- Audit trail export or screenshot set with timestamps and users",
    "- Original/raw data link and final reported result",
    "- User access / role evidence when relevant",
    "- Reviewer name, date, conclusion, and QA escalation decision",
  ].join("\n");
}

export function AuditTrailReviewTriage() {
  const [systemType, setSystemType] = useState(SYSTEM_TYPES[0]);
  const [recordRef, setRecordRef] = useState("HPLC assay sequence - Batch A123");
  const [copied, setCopied] = useState(false);
  const [answers, setAnswers] = useState<Record<string, Answer>>({
    "critical-record": "yes",
    "deleted-modified": "partial",
    "missing-reason": "partial",
    "privileged-user": "no",
    "after-result": "yes",
    "review-gap": "partial",
    "raw-data-gap": "no",
    "recurring-pattern": "partial",
  });

  const assessment = useMemo(() => {
    const max = SIGNALS.reduce((sum, signal) => sum + signal.weight, 0);
    const earned = SIGNALS.reduce((sum, signal) => {
      const answer = answers[signal.id];
      const multiplier = ANSWERS.find((item) => item.value === answer)?.multiplier ?? 0;
      return sum + signal.weight * multiplier;
    }, 0);
    const score = Math.round((earned / max) * 100);
    const triggeredSignals = SIGNALS.filter((signal) => answers[signal.id] && answers[signal.id] !== "no");
    return { score, triggeredSignals, result: resultFor(score) };
  }, [answers]);

  const reviewNote = useMemo(
    () =>
      buildReviewNote({
        systemType,
        recordRef,
        score: assessment.score,
        label: assessment.result.label,
        action: assessment.result.action,
        triggeredSignals: assessment.triggeredSignals,
      }),
    [systemType, recordRef, assessment],
  );

  function reset() {
    setSystemType(SYSTEM_TYPES[0]);
    setRecordRef("HPLC assay sequence - Batch A123");
    setAnswers({});
  }

  async function copyReviewNote() {
    await copyText(reviewNote);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-card p-5 md:p-6">
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">Audit Trail Review Triage</h2>
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        Review audit-trail exceptions by risk before approving GMP data. The goal is
        review-by-exception that proves ALCOA+, not a checkbox after the result is signed.
      </p>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_330px] gap-6">
        <div className="space-y-5">
          <div className="grid md:grid-cols-2 gap-3">
            <label>
              <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                System type
              </span>
              <select
                value={systemType}
                onChange={(event) => setSystemType(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              >
                {SYSTEM_TYPES.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Record reference
              </span>
              <input
                value={recordRef}
                onChange={(event) => setRecordRef(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
            </label>
          </div>

          <div className="space-y-2.5">
            {SIGNALS.map((signal) => (
              <div key={signal.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="flex flex-col sm:flex-row sm:items-start gap-2.5 sm:gap-3">
                  <p className="text-sm flex-1">{signal.label}</p>
                  <div className="flex gap-1 shrink-0" role="group" aria-label={signal.label}>
                    {ANSWERS.map((answer) => {
                      const active = answers[signal.id] === answer.value;
                      const activeTone =
                        answer.value === "yes"
                          ? "bg-red-500 text-red-950 border-red-500"
                          : answer.value === "partial"
                            ? "bg-amber-500 text-amber-950 border-amber-500"
                            : "bg-teal-500 text-teal-950 border-teal-500";
                      return (
                        <button
                          key={answer.value}
                          onClick={() => setAnswers((prev) => ({ ...prev, [signal.id]: answer.value }))}
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
                {answers[signal.id] && answers[signal.id] !== "no" && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">Evidence to capture: </span>
                    {signal.evidence}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <aside className="lg:sticky lg:top-20 self-start space-y-4">
          <div className={`rounded-2xl border p-5 ${TONE[assessment.result.tone]}`}>
            <div className="flex items-center gap-2 mb-2">
              {assessment.result.tone === "teal" ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <ShieldAlert className="w-5 h-5" />
              )}
              <p className="text-[11px] font-bold uppercase tracking-wider opacity-80">Review risk</p>
            </div>
            <div className="text-4xl font-bold mb-1">{assessment.score}%</div>
            <p className="text-sm font-semibold mb-2">{assessment.result.label}</p>
            <p className="text-xs opacity-85 leading-relaxed">{assessment.result.action}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-semibold mb-2">Review package</p>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li>Audit trail export with timestamp and user</li>
              <li>Original/raw data and final reported result</li>
              <li>User role/access evidence when relevant</li>
              <li>Reviewer conclusion and QA escalation decision</li>
            </ul>
            <button
              onClick={copyReviewNote}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-teal-500/30 bg-teal-500/10 px-3 py-2 text-xs font-bold text-teal-200 transition-colors hover:bg-teal-500/15"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy review note"}
            </button>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed flex items-start gap-1.5">
            <Info className="w-3 h-3 mt-0.5 shrink-0 text-primary/70" />
            Educational triage only. Your approved data-review, Part 11 / Annex 11, and QA procedures remain the source of truth.
          </p>
        </aside>
      </div>
    </section>
  );
}
