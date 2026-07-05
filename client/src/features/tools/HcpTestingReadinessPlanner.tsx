import { useMemo, useState } from "react";
import { CheckCircle2, Copy, Dna, Info, RotateCcw, ShieldAlert } from "lucide-react";
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
    id: "method",
    label: "HCP method, standard, reportable range, and acceptance criteria are validated/current for this product/process.",
    blocker: true,
    fix: "Hold reporting until the method and standard cover the product matrix, process, and reportable range.",
  },
  {
    id: "coverage",
    label: "Antibody/reagent coverage is assessed and adequate for process-specific HCPs.",
    blocker: true,
    fix: "Complete or update coverage assessment; a low-coverage ELISA is a blind spot, not a control.",
  },
  {
    id: "dilution-linearity",
    label: "Dilutional linearity and spike recovery show matrix interference/hook effect is controlled.",
    blocker: true,
    fix: "Repeat at validated dilutions or investigate hook/matrix interference before reporting.",
  },
  {
    id: "range",
    label: "Sample result is inside the validated assay range after dilution and product-concentration normalization.",
    blocker: true,
    fix: "Do not report outside range; dilute/retest within the validated range or open an investigation.",
  },
  {
    id: "controls",
    label: "Plate controls, standard curve, blanks, replicates, and acceptance criteria are met.",
    blocker: true,
    fix: "Invalidate or repeat the run if controls, curve fit, or replicate precision fail criteria.",
  },
  {
    id: "orthogonal",
    label: "Orthogonal method/characterization supports critical claims or trending HCP concerns.",
    fix: "Use LC-MS/MS, 2D gel/Western, or other orthogonal evidence for high-risk or unexplained HCP signals.",
  },
  {
    id: "clearance",
    label: "Purification-step clearance and batch trend support process consistency.",
    fix: "Review upstream load, column performance, process changes, and clearance trend before closing the result.",
  },
  {
    id: "impact",
    label: "Any HCP OOS/OOT, high trend, or high-risk species has a documented assay-vs-process impact assessment.",
    blocker: true,
    fix: "Open/close the required investigation before release or process conclusion.",
  },
];

const DEFAULT_ANSWERS: Record<string, Answer> = {
  method: "yes",
  coverage: "partial",
  "dilution-linearity": "partial",
  range: "yes",
  controls: "yes",
  orthogonal: "no",
  clearance: "partial",
  impact: "yes",
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
      label: "Do not report HCP - blockers remain",
      summary:
        "One or more HCP reportability blockers are not closed. Hold reporting or release use until the method, coverage, range, controls, and impact are defensible.",
    };
  }
  if (score < 85) {
    return {
      tone: "amber" as const,
      label: "Needs stronger HCP evidence",
      summary: "No hard blocker is selected, but the package still has weak spots in orthogonal support, clearance, or trend interpretation.",
    };
  }
  if (score < 100) {
    return {
      tone: "amber" as const,
      label: "Nearly ready to report HCP",
      summary: "The reportability blockers are closed. Tighten remaining characterization or clearance evidence before final approval.",
    };
  }
  return {
    tone: "teal" as const,
    label: "Ready to report HCP",
    summary: "Coverage, dilutional linearity, range, controls, clearance trend, and investigation controls support reporting for the defined sample.",
  };
}

function buildHcpNote({
  sampleRef,
  processScope,
  methodType,
  score,
  decision,
  blockers,
  weakSpots,
}: {
  sampleRef: string;
  processScope: string;
  methodType: string;
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
    "# HCP testing reportability note",
    "",
    `Sample / batch: ${sampleRef.trim() || "Not specified"}`,
    `Product / process scope: ${processScope.trim() || "Not specified"}`,
    `Method type: ${methodType}`,
    `Readiness score: ${score}% - ${decision.label}`,
    "",
    "Decision guidance:",
    decision.summary,
    "",
    "Reportability blockers:",
    blockerText,
    "",
    "Additional gaps to tighten:",
    weakSpotText,
    "",
    "Minimum HCP reporting package:",
    "- Validated HCP method, standard, reportable range, and acceptance criteria",
    "- Antibody/reagent coverage assessment for process-specific HCPs",
    "- Dilutional linearity/spike recovery and matrix/hook-effect control",
    "- Valid plate controls and result within range",
    "- Clearance and batch trend review",
    "- Orthogonal characterization for high-risk or unexplained HCP signals",
    "- Investigation and impact assessment for any OOS/OOT or atypical trend",
  ].join("\n");
}

export function HcpTestingReadinessPlanner() {
  const [sampleRef, setSampleRef] = useState("DS batch HCP-2408 / release sample");
  const [processScope, setProcessScope] = useState("CHO-derived monoclonal antibody downstream process");
  const [methodType, setMethodType] = useState("Process-specific HCP ELISA");
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

  const hcpNote = useMemo(
    () =>
      buildHcpNote({
        sampleRef,
        processScope,
        methodType,
        score: assessment.score,
        decision: assessment.decision,
        blockers: assessment.blockers,
        weakSpots: assessment.weakSpots,
      }),
    [sampleRef, processScope, methodType, assessment],
  );

  function reset() {
    setSampleRef("DS batch HCP-2408 / release sample");
    setProcessScope("CHO-derived monoclonal antibody downstream process");
    setMethodType("Process-specific HCP ELISA");
    setAnswers(DEFAULT_ANSWERS);
  }

  async function copyHcpNote() {
    await copyText(hcpNote);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-card p-5 md:p-6">
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <div className="flex items-center gap-2">
          <Dna className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">HCP Testing Readiness Planner</h2>
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        Check whether an HCP result is ready to report: method validity, antibody coverage,
        dilutional linearity, assay range, controls, orthogonal evidence, clearance trend, and impact assessment.
      </p>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_330px] gap-6">
        <div className="space-y-5">
          <div className="grid md:grid-cols-2 gap-3">
            <label>
              <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Sample / batch
              </span>
              <input
                value={sampleRef}
                onChange={(event) => setSampleRef(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
            </label>
            <label>
              <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Method type
              </span>
              <select
                value={methodType}
                onChange={(event) => setMethodType(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option>Process-specific HCP ELISA</option>
                <option>Platform / generic HCP ELISA</option>
                <option>Commercial HCP ELISA with coverage justification</option>
                <option>LC-MS/MS orthogonal characterization</option>
              </select>
            </label>
          </div>

          <label>
            <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Product / process scope
            </span>
            <input
              value={processScope}
              onChange={(event) => setProcessScope(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
          </label>

          <div className="space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">HCP reportability evidence</p>
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
              <p className="text-[11px] font-bold uppercase tracking-wider opacity-80">HCP readiness</p>
            </div>
            <div className="text-4xl font-bold mb-1">{assessment.score}%</div>
            <p className="text-sm font-semibold mb-2">{assessment.decision.label}</p>
            <p className="text-xs opacity-85 leading-relaxed">{assessment.decision.summary}</p>
          </div>

          {assessment.blockers.length > 0 && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-red-200 mb-2.5">Reportability blockers</p>
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
            <p className="text-sm font-semibold mb-2">Reporting package</p>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li>Validated method, qualified standard, and reportable range</li>
              <li>Coverage assessment and dilutional linearity/spike recovery</li>
              <li>Valid plate controls and in-range result</li>
              <li>Clearance trend, orthogonal support, and impact assessment</li>
            </ul>
            <button
              onClick={copyHcpNote}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-teal-500/30 bg-teal-500/10 px-3 py-2 text-xs font-bold text-teal-200 transition-colors hover:bg-teal-500/15"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy HCP note"}
            </button>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed flex items-start gap-1.5">
            <Info className="w-3 h-3 mt-0.5 shrink-0 text-primary/70" />
            Educational planning aid only. Your validated HCP method, coverage strategy, safety justification, and QA/QC disposition remain the source of truth.
          </p>
        </aside>
      </div>
    </section>
  );
}
