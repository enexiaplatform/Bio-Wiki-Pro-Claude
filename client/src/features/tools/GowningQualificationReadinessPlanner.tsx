import { useMemo, useState } from "react";
import { CheckCircle2, Copy, Info, RotateCcw, ShieldAlert, UserCheck } from "lucide-react";
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
    id: "training",
    label: "Operator completed gowning theory, aseptic behavior training, and supervised practice before qualification.",
    fix: "Complete training and supervised practice before attempting qualification.",
  },
  {
    id: "sop-sequence",
    label: "A qualified assessor observed the full gowning sequence against the approved SOP with no critical technique breach.",
    blocker: true,
    fix: "Retrain and re-observe the failed gowning step; a critical technique breach is a fail even if plate counts pass.",
  },
  {
    id: "sessions",
    label: "Required consecutive successful qualification sessions are complete for the target area grade.",
    blocker: true,
    fix: "Complete the required consecutive successful sessions before granting or renewing access.",
  },
  {
    id: "sampling-sites",
    label: "Contact plates/swabs cover the defined sites such as gloves, forearms, chest, hood, and mask/face area.",
    fix: "Add missing sample sites from the SOP or justify the monitoring scheme before qualification approval.",
  },
  {
    id: "counts",
    label: "All gowning-monitoring counts are within the applicable alert/action limits and incubation/read requirements.",
    blocker: true,
    fix: "Investigate excursions and repeat qualification after retraining or corrective action.",
  },
  {
    id: "media-fill-link",
    label: "Operator media-fill/APS coverage is current for the intended aseptic role and interventions.",
    blocker: true,
    fix: "Restrict aseptic operations until APS/media-fill coverage is current for the role.",
  },
  {
    id: "routine-monitoring",
    label: "Routine personnel monitoring and excursion trending are reviewed for recurring glove/gown failures.",
    fix: "Review recent monitoring trends and address recurring failures before approving access.",
  },
  {
    id: "requalification",
    label: "Next periodic requalification date, absence trigger, and disqualification/retraining rules are defined.",
    fix: "Set requalification cadence, lapse controls, and retraining triggers so access does not drift out of control.",
  },
];

const DEFAULT_ANSWERS: Record<string, Answer> = {
  training: "yes",
  "sop-sequence": "partial",
  sessions: "partial",
  "sampling-sites": "yes",
  counts: "yes",
  "media-fill-link": "no",
  "routine-monitoring": "partial",
  requalification: "yes",
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
      label: "Do not qualify - access blockers remain",
      summary: "One or more aseptic-access blockers are not closed. Keep the operator out of the target grade/role until training, monitoring, and QA approval are complete.",
    };
  }
  if (score < 85) {
    return {
      tone: "amber" as const,
      label: "Needs stronger gowning evidence",
      summary: "No hard blocker is selected, but the record is still thin. Tighten the evidence before granting or renewing access.",
    };
  }
  if (score < 100) {
    return {
      tone: "amber" as const,
      label: "Nearly ready for QA approval",
      summary: "The access blockers are closed. QA can review while remaining documentation or trend checks are tightened.",
    };
  }
  return {
    tone: "teal" as const,
    label: "Ready for gowning qualification approval",
    summary: "Technique, monitoring, consecutive sessions, APS coverage, and ongoing controls support access for the defined role.",
  };
}

function buildGowningNote({
  operatorRef,
  areaRole,
  qualificationType,
  score,
  decision,
  blockers,
  weakSpots,
}: {
  operatorRef: string;
  areaRole: string;
  qualificationType: string;
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
    "# Gowning qualification readiness note",
    "",
    `Operator: ${operatorRef.trim() || "Not specified"}`,
    `Area / role: ${areaRole.trim() || "Not specified"}`,
    `Qualification type: ${qualificationType}`,
    `Readiness score: ${score}% - ${decision.label}`,
    "",
    "Decision guidance:",
    decision.summary,
    "",
    "Access blockers to close:",
    blockerText,
    "",
    "Additional gaps to tighten:",
    weakSpotText,
    "",
    "Minimum gowning qualification package:",
    "- Training and supervised practice evidence",
    "- Assessor observation checklist with no critical technique breach",
    "- Required consecutive successful sessions",
    "- Contact plate/swab results at defined sites within limits",
    "- Current APS/media-fill coverage for the intended role",
    "- Routine monitoring trend review and next requalification date",
  ].join("\n");
}

export function GowningQualificationReadinessPlanner() {
  const [operatorRef, setOperatorRef] = useState("Operator AB / Grade B access");
  const [areaRole, setAreaRole] = useState("Grade B gowning for Grade A intervention support");
  const [qualificationType, setQualificationType] = useState("Initial qualification");
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

  const gowningNote = useMemo(
    () =>
      buildGowningNote({
        operatorRef,
        areaRole,
        qualificationType,
        score: assessment.score,
        decision: assessment.decision,
        blockers: assessment.blockers,
        weakSpots: assessment.weakSpots,
      }),
    [operatorRef, areaRole, qualificationType, assessment],
  );

  function reset() {
    setOperatorRef("Operator AB / Grade B access");
    setAreaRole("Grade B gowning for Grade A intervention support");
    setQualificationType("Initial qualification");
    setAnswers(DEFAULT_ANSWERS);
  }

  async function copyGowningNote() {
    await copyText(gowningNote);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-card p-5 md:p-6">
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <div className="flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">Gowning Qualification Readiness Planner</h2>
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        Check whether an operator has the training, technique observation, gown-monitoring results,
        APS coverage, and ongoing controls needed for aseptic-area access.
      </p>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_330px] gap-6">
        <div className="space-y-5">
          <div className="grid md:grid-cols-2 gap-3">
            <label>
              <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Operator / access request
              </span>
              <input
                value={operatorRef}
                onChange={(event) => setOperatorRef(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
            </label>
            <label>
              <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Qualification type
              </span>
              <select
                value={qualificationType}
                onChange={(event) => setQualificationType(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option>Initial qualification</option>
                <option>Periodic requalification</option>
                <option>Requalification after excursion</option>
                <option>Return after extended absence</option>
              </select>
            </label>
          </div>

          <label>
            <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Area / role
            </span>
            <input
              value={areaRole}
              onChange={(event) => setAreaRole(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
          </label>

          <div className="space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Gowning qualification evidence</p>
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
              <p className="text-[11px] font-bold uppercase tracking-wider opacity-80">Gowning readiness</p>
            </div>
            <div className="text-4xl font-bold mb-1">{assessment.score}%</div>
            <p className="text-sm font-semibold mb-2">{assessment.decision.label}</p>
            <p className="text-xs opacity-85 leading-relaxed">{assessment.decision.summary}</p>
          </div>

          {assessment.blockers.length > 0 && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-red-200 mb-2.5">Access blockers</p>
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
            <p className="text-sm font-semibold mb-2">Qualification package</p>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li>Training record and supervised practice evidence</li>
              <li>Assessor observation checklist</li>
              <li>Gown plate/swab results and incubation/read records</li>
              <li>APS/media-fill coverage and next requalification date</li>
            </ul>
            <button
              onClick={copyGowningNote}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-teal-500/30 bg-teal-500/10 px-3 py-2 text-xs font-bold text-teal-200 transition-colors hover:bg-teal-500/15"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy gowning note"}
            </button>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed flex items-start gap-1.5">
            <Info className="w-3 h-3 mt-0.5 shrink-0 text-primary/70" />
            Educational planning aid only. Your approved gowning SOP, area-grade limits, APS matrix, and QA access decision remain the source of truth.
          </p>
        </aside>
      </div>
    </section>
  );
}
