import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { ClipboardCheck, RotateCcw, ArrowRight, AlertTriangle, Info } from "lucide-react";
import {
  auditCriteria, ANSWER_POINTS, bandForScore, type Answer,
} from "@/data/tools/auditReadiness";
import { analytics } from "@/hooks/use-analytics";

const ANSWERS: { value: Answer; label: string }[] = [
  { value: "yes", label: "Yes" },
  { value: "partial", label: "Partial" },
  { value: "no", label: "No" },
];

const TONE: Record<string, string> = {
  red: "text-red-300 bg-red-500/10 border-red-500/30",
  amber: "text-amber-300 bg-amber-500/10 border-amber-500/30",
  teal: "text-teal-300 bg-teal-500/10 border-teal-500/30",
};

const PLACEMENT = "tool_audit_readiness";

/**
 * GMP Audit Readiness Scorecard — a free, static-logic self-assessment.
 * Scores readiness over the criteria assessed and lists prioritized gaps.
 * Not an audit, certification, or QA approval.
 */
export function AuditReadinessScorecard() {
  const [, navigate] = useLocation();
  const [answers, setAnswers] = useState<Record<string, Answer>>({});

  const categories = useMemo(
    () => auditCriteria.map((c) => c.category).filter((v, i, a) => a.indexOf(v) === i),
    [],
  );

  const assessed = Object.keys(answers).length;
  const earned = Object.values(answers).reduce((sum, a) => sum + ANSWER_POINTS[a], 0);
  const pct = assessed ? Math.round((earned / (assessed * 2)) * 100) : 0;
  const band = bandForScore(pct);

  // Gaps = assessed criteria not fully met, "No" before "Partial".
  const gaps = auditCriteria
    .filter((c) => answers[c.id] && answers[c.id] !== "yes")
    .sort((a, b) => (answers[a.id] === "no" ? 0 : 1) - (answers[b.id] === "no" ? 0 : 1));

  function unlock() {
    analytics.upgradePromptClicked(PLACEMENT);
    navigate("/pricing");
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-card p-5 md:p-6">
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">GMP Audit Readiness Scorecard</h2>
        </div>
        {assessed > 0 && (
          <button
            onClick={() => setAnswers({})}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        Rate each item honestly to gauge audit readiness and see your top gaps. A self-assessment,
        not an audit — verify against your approved SOPs and quality system.
      </p>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        {/* Criteria */}
        <div className="space-y-6">
          {categories.map((cat) => (
            <div key={cat}>
              <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2.5">{cat}</p>
              <div className="space-y-2.5">
                {auditCriteria.filter((c) => c.category === cat).map((c) => (
                  <div key={c.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-2.5 sm:gap-3">
                      <p className="text-sm flex-1">{c.label}</p>
                      <div className="flex gap-1 shrink-0" role="group" aria-label={c.label}>
                        {ANSWERS.map((a) => {
                          const active = answers[c.id] === a.value;
                          const activeTone =
                            a.value === "yes" ? "bg-teal-500 text-teal-950 border-teal-500"
                            : a.value === "partial" ? "bg-amber-500 text-amber-950 border-amber-500"
                            : "bg-red-500 text-red-950 border-red-500";
                          return (
                            <button
                              key={a.value}
                              onClick={() => setAnswers((prev) => ({ ...prev, [c.id]: a.value }))}
                              aria-pressed={active}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                                active ? activeTone : "border-white/10 text-muted-foreground hover:border-white/30"
                              }`}
                            >
                              {a.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    {answers[c.id] && answers[c.id] !== "yes" && (
                      <p className="mt-2 text-xs text-muted-foreground flex items-start gap-1.5">
                        <ArrowRight className="w-3 h-3 mt-0.5 shrink-0 text-amber-400" />
                        <span><span className="font-semibold text-foreground">Next: </span>{c.fix}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Score panel */}
        <div className="lg:sticky lg:top-20 self-start space-y-4">
          <div className={`rounded-2xl border p-5 text-center ${assessed ? TONE[band.tone] : "border-white/10 bg-white/5"}`}>
            <p className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">Readiness</p>
            <div className="text-4xl font-bold mb-1">{assessed ? `${pct}%` : "—"}</div>
            {assessed > 0 ? (
              <>
                <p className="text-sm font-semibold mb-1">{band.label}</p>
                <p className="text-xs opacity-80 leading-relaxed">{band.summary}</p>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">Rate the items to see your score.</p>
            )}
            <div className="mt-3 pt-3 border-t border-white/10 text-xs opacity-80">
              {assessed} of {auditCriteria.length} criteria assessed
            </div>
          </div>

          {gaps.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Top gaps to close
              </p>
              <ol className="space-y-2">
                {gaps.slice(0, 5).map((c, i) => (
                  <li key={c.id} className="text-xs flex gap-2">
                    <span className="text-amber-400 font-bold shrink-0">{i + 1}</span>
                    <span className="text-muted-foreground">{c.label}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="rounded-2xl border border-teal-500/20 bg-gradient-to-br from-teal-500/10 to-transparent p-4">
            <p className="text-sm font-semibold mb-1">Close the gaps faster</p>
            <p className="text-xs text-muted-foreground mb-3">
              The GMP Audit Survival Kit — checklist, CAPA templates, and a scored gap-analysis sheet — is included in Pro.
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
            General educational workflow. Not a substitute for QA approval, a validated method, or a formal audit.
          </p>
        </div>
      </div>
    </section>
  );
}
