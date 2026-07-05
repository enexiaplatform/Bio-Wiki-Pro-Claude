import { useMemo, useState } from "react";
import { CheckCircle2, Copy, Info, RotateCcw, ShieldAlert, Wrench } from "lucide-react";
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
    id: "urs",
    label: "URS is approved and defines intended use, GMP functions, ranges, utilities, and acceptance expectations.",
    blocker: true,
    fix: "Approve or update the URS before relying on DQ/IQ/OQ/PQ evidence.",
  },
  {
    id: "risk",
    label: "Critical aspects are risk-assessed and linked to product quality, data integrity, safety, or compliance.",
    fix: "Identify critical functions and scale qualification depth using documented risk rationale.",
  },
  {
    id: "dq",
    label: "DQ confirms the selected design/vendor package meets URS and GMP needs before installation.",
    fix: "Document URS-to-design traceability and resolve design gaps before IQ.",
  },
  {
    id: "iq",
    label: "IQ verifies installation, utilities, components, software/firmware, manuals, and calibration status.",
    blocker: true,
    fix: "Close installation, documentation, utility, and critical calibration gaps before OQ/PQ.",
  },
  {
    id: "oq",
    label: "OQ challenges operating ranges, alarms, interlocks, recipes, permissions, and worst-case settings.",
    blocker: true,
    fix: "Run or repeat OQ challenges with pre-approved acceptance criteria; do not release on nominal-only testing.",
  },
  {
    id: "pq",
    label: "PQ demonstrates consistent performance under actual or simulated routine GMP conditions.",
    blocker: true,
    fix: "Complete representative PQ runs or justify why PQ is not required for this equipment/use.",
  },
  {
    id: "deviations",
    label: "Qualification deviations and failed acceptance criteria are investigated, impact-assessed, and closed.",
    blocker: true,
    fix: "Close deviations with QA-approved impact assessment before releasing the equipment for GMP use.",
  },
  {
    id: "lifecycle",
    label: "Qualified-state controls are set: calibration, PM, periodic review, requalification triggers, and change control.",
    fix: "Add lifecycle controls so the qualified state remains true after the initial protocol signatures.",
  },
];

const DEFAULT_ANSWERS: Record<string, Answer> = {
  urs: "yes",
  risk: "yes",
  dq: "partial",
  iq: "yes",
  oq: "partial",
  pq: "no",
  deviations: "partial",
  lifecycle: "yes",
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
      label: "Not ready for GMP use - qualification blockers remain",
      summary: "One or more qualification-critical items are not complete. Keep the equipment out of routine GMP use until QA has a closed, evidence-backed package.",
    };
  }
  if (score < 85) {
    return {
      tone: "amber" as const,
      label: "Needs qualification strengthening",
      summary: "No hard blocker is selected, but the package is still thin. Strengthen traceability, evidence, and lifecycle controls before final release.",
    };
  }
  if (score < 100) {
    return {
      tone: "amber" as const,
      label: "Ready for QA release with minor gaps",
      summary: "The qualification blockers are closed. QA can review for release while the remaining minor gaps are tightened or justified.",
    };
  }
  return {
    tone: "teal" as const,
    label: "Ready for qualified-state release",
    summary: "The qualification package supports QA release for the defined GMP use, with lifecycle controls in place.",
  };
}

function buildQualificationNote({
  equipmentRef,
  intendedUse,
  qualificationType,
  score,
  decision,
  blockers,
  weakSpots,
}: {
  equipmentRef: string;
  intendedUse: string;
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
    "# Equipment qualification readiness note",
    "",
    `Equipment / asset: ${equipmentRef.trim() || "Not specified"}`,
    `Intended GMP use: ${intendedUse.trim() || "Not specified"}`,
    `Qualification context: ${qualificationType}`,
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
    "Minimum release package:",
    "- Approved URS and risk assessment",
    "- DQ/IQ/OQ/PQ protocols and executed evidence as applicable",
    "- Closed deviations and acceptance-criteria failures",
    "- QA-approved qualification summary / release memo",
    "- Calibration, PM, periodic review, requalification, and change-control triggers",
  ].join("\n");
}

export function EquipmentQualificationReadinessPlanner() {
  const [equipmentRef, setEquipmentRef] = useState("Autoclave AC-204 / GMP sterilizer");
  const [intendedUse, setIntendedUse] = useState("Moist-heat sterilization of wrapped components");
  const [qualificationType, setQualificationType] = useState("New equipment qualification");
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

  const qualificationNote = useMemo(
    () =>
      buildQualificationNote({
        equipmentRef,
        intendedUse,
        qualificationType,
        score: assessment.score,
        decision: assessment.decision,
        blockers: assessment.blockers,
        weakSpots: assessment.weakSpots,
      }),
    [equipmentRef, intendedUse, qualificationType, assessment],
  );

  function reset() {
    setEquipmentRef("Autoclave AC-204 / GMP sterilizer");
    setIntendedUse("Moist-heat sterilization of wrapped components");
    setQualificationType("New equipment qualification");
    setAnswers(DEFAULT_ANSWERS);
  }

  async function copyQualificationNote() {
    await copyText(qualificationNote);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-card p-5 md:p-6">
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <div className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">Equipment Qualification Readiness Planner</h2>
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        Check whether a DQ/IQ/OQ/PQ package is strong enough for QA release and ongoing qualified-state control.
      </p>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_330px] gap-6">
        <div className="space-y-5">
          <div className="grid md:grid-cols-2 gap-3">
            <label>
              <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Equipment / asset
              </span>
              <input
                value={equipmentRef}
                onChange={(event) => setEquipmentRef(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
            </label>
            <label>
              <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Qualification context
              </span>
              <select
                value={qualificationType}
                onChange={(event) => setQualificationType(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option>New equipment qualification</option>
                <option>Requalification after move</option>
                <option>Major repair / upgrade</option>
                <option>Periodic review / qualified-state check</option>
              </select>
            </label>
          </div>

          <label>
            <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Intended GMP use
            </span>
            <input
              value={intendedUse}
              onChange={(event) => setIntendedUse(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
          </label>

          <div className="space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Qualification evidence</p>
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
              <p className="text-[11px] font-bold uppercase tracking-wider opacity-80">Qualification readiness</p>
            </div>
            <div className="text-4xl font-bold mb-1">{assessment.score}%</div>
            <p className="text-sm font-semibold mb-2">{assessment.decision.label}</p>
            <p className="text-xs opacity-85 leading-relaxed">{assessment.decision.summary}</p>
          </div>

          {assessment.blockers.length > 0 && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-red-200 mb-2.5">Blockers</p>
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
            <p className="text-sm font-semibold mb-2">Release package</p>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li>Approved URS, risk assessment, and traceability matrix</li>
              <li>Executed DQ/IQ/OQ/PQ evidence with acceptance criteria</li>
              <li>Closed deviations and QA-approved qualification summary</li>
              <li>Calibration, PM, periodic review, and change-control triggers</li>
            </ul>
            <button
              onClick={copyQualificationNote}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-teal-500/30 bg-teal-500/10 px-3 py-2 text-xs font-bold text-teal-200 transition-colors hover:bg-teal-500/15"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy qualification note"}
            </button>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed flex items-start gap-1.5">
            <Info className="w-3 h-3 mt-0.5 shrink-0 text-primary/70" />
            Educational planning aid only. Your approved validation master plan, qualification SOP, and QA release decision remain the source of truth.
          </p>
        </aside>
      </div>
    </section>
  );
}
