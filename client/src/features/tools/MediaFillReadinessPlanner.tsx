import { useMemo, useState } from "react";
import { CheckCircle2, Copy, Info, RotateCcw, ShieldAlert, TestTubeDiagonal } from "lucide-react";
import { copyText } from "@/lib/clipboard";

type Answer = "yes" | "partial" | "no";

interface Criterion {
  id: string;
  label: string;
  blocker?: boolean;
  fix: string;
}

const ANSWERS: { value: Answer; label: string; points: number }[] = [
  { value: "yes", label: "Yes", points: 2 },
  { value: "partial", label: "Partial", points: 1 },
  { value: "no", label: "No", points: 0 },
];

const CRITERIA: Criterion[] = [
  {
    id: "protocol",
    label: "APS protocol is approved and defines scope, line, product family, acceptance criteria, incubation, and responsibilities.",
    fix: "Approve or update the APS protocol before execution or QA disposition.",
  },
  {
    id: "interventions",
    label: "Intervention matrix covers inherent and corrective interventions at worst-case frequency/posture.",
    blocker: true,
    fix: "Add missing interventions and justify frequency, timing, operator role, and aseptic risk before execution.",
  },
  {
    id: "operator-coverage",
    label: "Operators, shifts, breaks, and maximum room occupancy are represented for the intended aseptic roles.",
    blocker: true,
    fix: "Restrict uncovered operators/roles or repeat APS with the missing personnel and role coverage.",
  },
  {
    id: "media-gpt",
    label: "Medium lot, sterilization, and growth-promotion testing are acceptable before result interpretation.",
    blocker: true,
    fix: "Do not interpret or release an APS result until the medium supports growth and records are complete.",
  },
  {
    id: "run-design",
    label: "Run duration, line speed, filled-unit count, container/closure challenge, and hold points reflect worst case.",
    blocker: true,
    fix: "Redesign the run to challenge the longest/most complex routine process, not an easy demonstration run.",
  },
  {
    id: "incubation-read",
    label: "All integral units are reconciled, incubated, inverted/agitated as required, and inspected per protocol.",
    blocker: true,
    fix: "Reconcile missing/rejected units and complete incubation/read requirements before disposition.",
  },
  {
    id: "em-link",
    label: "Environmental and personnel monitoring from the APS run are reconciled with interventions and video/logs.",
    fix: "Review EM/personnel signals against intervention timing, operator role, and line location before closure.",
  },
  {
    id: "positive-impact",
    label: "Any contaminated unit, turbidity, invalid medium, or critical deviation has a closed investigation and repeat/revalidation decision.",
    blocker: true,
    fix: "Hold qualification status until isolate ID, intervention review, root cause, CAPA, and repeat/revalidation decision are closed.",
  },
];

const DEFAULT_ANSWERS: Record<string, Answer> = {
  protocol: "yes",
  interventions: "partial",
  "operator-coverage": "partial",
  "media-gpt": "yes",
  "run-design": "partial",
  "incubation-read": "yes",
  "em-link": "partial",
  "positive-impact": "no",
};

const TONE = {
  red: "border-red-500/30 bg-red-500/10 text-red-100",
  amber: "border-amber-500/30 bg-amber-500/10 text-amber-100",
  teal: "border-teal-500/30 bg-teal-500/10 text-teal-100",
};

function decisionFor(score: number, blockers: Criterion[]) {
  if (blockers.length > 0) {
    return {
      tone: "red" as const,
      label: "APS not ready - qualification blockers remain",
      summary:
        "One or more media-fill controls are not closed. Do not use the APS to qualify the line/operators until QA has complete worst-case evidence and disposition.",
    };
  }
  if (score < 85) {
    return {
      tone: "amber" as const,
      label: "Needs stronger APS package",
      summary: "No hard blocker is selected, but the simulation package still has weak spots that should be tightened before QA disposition.",
    };
  }
  if (score < 100) {
    return {
      tone: "amber" as const,
      label: "Nearly ready for APS QA disposition",
      summary: "The qualification blockers are closed. Tighten the remaining linkage or documentation gaps before final APS approval.",
    };
  }
  return {
    tone: "teal" as const,
    label: "Ready for APS QA disposition",
    summary: "The APS design, execution, incubation, monitoring linkage, and impact controls support QA disposition for the defined scope.",
  };
}

function buildApsNote({
  apsRef,
  lineScope,
  runContext,
  score,
  decision,
  blockers,
  weakSpots,
}: {
  apsRef: string;
  lineScope: string;
  runContext: string;
  score: number;
  decision: ReturnType<typeof decisionFor>;
  blockers: Criterion[];
  weakSpots: Criterion[];
}) {
  const blockerText = blockers.length
    ? blockers.map((item, index) => `${index + 1}. ${item.label}\n   Action: ${item.fix}`).join("\n")
    : "None selected.";
  const weakSpotText = weakSpots.length
    ? weakSpots.map((item, index) => `${index + 1}. ${item.fix}`).join("\n")
    : "None selected.";

  return [
    "# APS / media fill readiness note",
    "",
    `APS / campaign: ${apsRef.trim() || "Not specified"}`,
    `Line / process scope: ${lineScope.trim() || "Not specified"}`,
    `Run context: ${runContext}`,
    `Readiness score: ${score}% - ${decision.label}`,
    "",
    "Decision guidance:",
    decision.summary,
    "",
    "Qualification blockers to close:",
    blockerText,
    "",
    "Additional gaps to tighten:",
    weakSpotText,
    "",
    "Minimum APS evidence package:",
    "- Approved worst-case APS protocol and acceptance criteria",
    "- Intervention matrix with inherent/corrective interventions",
    "- Operator/shift/role coverage matrix",
    "- Growth-promotion-qualified medium and incubation/read records",
    "- Unit reconciliation and EM/personnel monitoring linkage",
    "- Investigation, CAPA, and repeat/revalidation decision for any positive or critical deviation",
  ].join("\n");
}

export function MediaFillReadinessPlanner() {
  const [apsRef, setApsRef] = useState("APS-2026-01 / vial filling line");
  const [lineScope, setLineScope] = useState("Grade A vial filling with Grade B background");
  const [runContext, setRunContext] = useState("Periodic semi-annual APS");
  const [copied, setCopied] = useState(false);
  const [answers, setAnswers] = useState<Record<string, Answer>>(DEFAULT_ANSWERS);

  const assessment = useMemo(() => {
    const earned = CRITERIA.reduce((sum, criterion) => {
      const answer = answers[criterion.id];
      return sum + (ANSWERS.find((item) => item.value === answer)?.points ?? 0);
    }, 0);
    const score = Math.round((earned / (CRITERIA.length * 2)) * 100);
    const blockers = CRITERIA.filter((criterion) => criterion.blocker && answers[criterion.id] !== "yes");
    const weakSpots = CRITERIA.filter((criterion) => answers[criterion.id] !== "yes");
    return { score, blockers, weakSpots, decision: decisionFor(score, blockers) };
  }, [answers]);

  const apsNote = useMemo(
    () =>
      buildApsNote({
        apsRef,
        lineScope,
        runContext,
        score: assessment.score,
        decision: assessment.decision,
        blockers: assessment.blockers,
        weakSpots: assessment.weakSpots,
      }),
    [apsRef, lineScope, runContext, assessment],
  );

  function reset() {
    setApsRef("APS-2026-01 / vial filling line");
    setLineScope("Grade A vial filling with Grade B background");
    setRunContext("Periodic semi-annual APS");
    setAnswers(DEFAULT_ANSWERS);
  }

  async function copyApsNote() {
    await copyText(apsNote);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-card p-5 md:p-6">
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <div className="flex items-center gap-2">
          <TestTubeDiagonal className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">Media Fill APS Readiness Planner</h2>
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        Check whether an aseptic process simulation has the worst-case design, intervention coverage,
        incubation/read, EM linkage, and investigation controls needed for QA disposition.
      </p>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_330px] gap-6">
        <div className="space-y-5">
          <div className="grid md:grid-cols-2 gap-3">
            <label>
              <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                APS / campaign
              </span>
              <input
                value={apsRef}
                onChange={(event) => setApsRef(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
            </label>
            <label>
              <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Run context
              </span>
              <select
                value={runContext}
                onChange={(event) => setRunContext(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option>Initial line qualification APS</option>
                <option>Periodic semi-annual APS</option>
                <option>APS after significant change</option>
                <option>Repeat APS after positive unit</option>
              </select>
            </label>
          </div>

          <label>
            <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Line / process scope
            </span>
            <input
              value={lineScope}
              onChange={(event) => setLineScope(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
          </label>

          <div className="space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">APS evidence</p>
            {CRITERIA.map((criterion) => (
              <div key={criterion.id} className="rounded-xl border border-white/10 bg-white/5 p-3" role="group" aria-label={criterion.label}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="text-sm">{criterion.label}</p>
                    {answers[criterion.id] !== "yes" && (
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">Action: </span>
                        {criterion.fix}
                      </p>
                    )}
                  </div>
                  {criterion.blocker && <span className="shrink-0 rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-200">Blocker</span>}
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {ANSWERS.map((answer) => {
                    const active = answers[criterion.id] === answer.value;
                    return (
                      <button
                        key={answer.value}
                        type="button"
                        onClick={() => setAnswers((prev) => ({ ...prev, [criterion.id]: answer.value }))}
                        aria-pressed={active}
                        className={
                          active
                            ? "rounded-lg border border-primary/40 bg-primary/10 px-2.5 py-1.5 text-xs font-semibold"
                            : "rounded-lg border border-white/10 bg-background px-2.5 py-1.5 text-xs text-muted-foreground hover:border-primary/30 transition-colors"
                        }
                      >
                        {answer.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="lg:sticky lg:top-20 self-start space-y-4">
          <div className={`rounded-2xl border p-5 ${TONE[assessment.decision.tone]}`}>
            <div className="flex items-center gap-2 mb-2">
              {assessment.decision.tone === "teal" ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <ShieldAlert className="w-5 h-5" />
              )}
              <p className="text-[11px] font-bold uppercase tracking-wider opacity-80">APS readiness</p>
            </div>
            <div className="text-4xl font-bold mb-1">{assessment.score}%</div>
            <p className="text-sm font-semibold mb-2">{assessment.decision.label}</p>
            <p className="text-xs opacity-85 leading-relaxed">{assessment.decision.summary}</p>
          </div>

          {assessment.blockers.length > 0 && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-red-200 mb-2.5">Qualification blockers</p>
              <ol className="space-y-2">
                {assessment.blockers.map((blocker, index) => (
                  <li key={blocker.id} className="text-xs flex gap-2">
                    <span className="font-bold text-red-300 shrink-0">{index + 1}</span>
                    <span className="text-muted-foreground">{blocker.fix}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-semibold mb-2">APS package</p>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li>Worst-case APS protocol and acceptance criteria</li>
              <li>Intervention and operator coverage matrix</li>
              <li>Growth-promotion, incubation, inspection, and reconciliation records</li>
              <li>EM/personnel linkage and investigation package for any positive</li>
            </ul>
            <button
              onClick={copyApsNote}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-teal-500/30 bg-teal-500/10 px-3 py-2 text-xs font-bold text-teal-200 transition-colors hover:bg-teal-500/15"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy APS note"}
            </button>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed flex items-start gap-1.5">
            <Info className="w-3 h-3 mt-0.5 shrink-0 text-primary/70" />
            Educational planning aid only. Your approved APS protocol, Annex 1 strategy, CCS, and QA disposition remain the source of truth.
          </p>
        </aside>
      </div>
    </section>
  );
}
