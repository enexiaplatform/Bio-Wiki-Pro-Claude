import { useState } from "react";
import { useLocation } from "wouter";
import { GitBranch, RotateCcw, ArrowLeft, CheckCircle2, Info, ArrowRight } from "lucide-react";
import { oosNodes, OOS_START, type NodeTone } from "@/data/tools/oosDecisionTree";
import { analytics } from "@/hooks/use-analytics";

const TONE: Record<NodeTone, string> = {
  teal: "border-teal-500/30 bg-teal-500/10 text-teal-200",
  amber: "border-amber-500/25 bg-amber-500/10 text-amber-100",
  red: "border-red-500/25 bg-red-500/10 text-red-100",
};

const PLACEMENT = "tool_oos_decision_tree";

/**
 * OOS Investigation Decision Tree — a guided walk through the phased OOS
 * approach. Educational only; follow your approved OOS SOP and QA disposition.
 */
export function OosDecisionTree() {
  const [, navigate] = useLocation();
  const [path, setPath] = useState<string[]>([OOS_START]);
  const current = oosNodes[path[path.length - 1]];

  function choose(next: string) {
    setPath((p) => [...p, next]);
  }
  function back() {
    setPath((p) => (p.length > 1 ? p.slice(0, -1) : p));
  }
  function restart() {
    setPath([OOS_START]);
  }
  function unlock() {
    analytics.upgradePromptClicked(PLACEMENT);
    navigate("/pricing");
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-card p-5 md:p-6">
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <div className="flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">OOS Investigation Decision Tree</h2>
        </div>
        <div className="flex items-center gap-3">
          {path.length > 1 && (
            <button onClick={back} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          )}
          {path.length > 1 && (
            <button onClick={restart} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <RotateCcw className="w-3.5 h-3.5" /> Restart
            </button>
          )}
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        Answer each step to see the next action in a phased OOS investigation. A guide, not a
        decision of record — follow your approved OOS SOP and QA disposition.
      </p>

      {current.type === "question" ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-primary mb-2">
            Step {path.length}
          </p>
          <p className="text-base font-medium mb-4">{current.text}</p>
          <div className="flex flex-wrap gap-2">
            {current.options?.map((o) => (
              <button
                key={o.label}
                onClick={() => choose(o.next)}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold hover:border-primary/40 hover:bg-primary/10 transition-colors"
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className={`rounded-xl border p-5 ${TONE[current.tone ?? "teal"]}`}>
            <div className="flex items-center gap-2 mb-1.5">
              <CheckCircle2 className="w-5 h-5" />
              <p className="text-[11px] font-bold uppercase tracking-wider opacity-80">Recommended next step</p>
            </div>
            <h3 className="text-lg font-bold mb-1.5">{current.text}</h3>
            <p className="text-sm leading-relaxed opacity-90">{current.detail}</p>
          </div>

          <div className="rounded-xl border border-teal-500/20 bg-gradient-to-br from-teal-500/10 to-transparent p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <p className="text-xs text-muted-foreground">
              Run it formally with the OOS Investigation Template — included in Pro.
            </p>
            <button
              onClick={unlock}
              className="shrink-0 inline-flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 text-teal-950 font-bold text-sm px-4 py-2 rounded-xl transition-all"
            >
              Unlock with Pro <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <p className="mt-4 text-[11px] text-muted-foreground leading-relaxed flex items-start gap-1.5">
        <Info className="w-3 h-3 mt-0.5 shrink-0 text-primary/70" />
        General educational workflow. Not a substitute for your validated OOS procedure, QA disposition, or regulatory advice.
      </p>
    </section>
  );
}
