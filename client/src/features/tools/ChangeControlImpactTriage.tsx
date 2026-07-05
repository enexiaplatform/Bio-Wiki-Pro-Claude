import { useMemo, useState } from "react";
import { CheckCircle2, ClipboardCheck, Copy, GitBranch, Info, RotateCcw, ShieldAlert } from "lucide-react";
import { copyText } from "@/lib/clipboard";

type Answer = "yes" | "partial" | "no";

interface Criterion {
  id: string;
  label: string;
  blocker?: boolean;
  action: string;
}

const ANSWERS: { value: Answer; label: string; points: number }[] = [
  { value: "yes", label: "Yes", points: 2 },
  { value: "partial", label: "Partial", points: 1 },
  { value: "no", label: "No", points: 0 },
];

const CHANGE_TYPES = [
  "Process parameter change",
  "Equipment / utility change",
  "Analytical method change",
  "Material / supplier change",
  "Computer system change",
  "Document / SOP change",
];

const CRITERIA: Criterion[] = [
  {
    id: "description",
    label: "Current state, proposed state, rationale, and affected product/process are clearly described.",
    action: "Rewrite the change description so reviewers can compare current versus proposed state without tribal knowledge.",
  },
  {
    id: "quality-impact",
    label: "Impact on CQAs, CPPs, contamination control, and patient/product risk has been assessed.",
    blocker: true,
    action: "Complete a quality-risk assessment before approval. Identify affected CQAs/CPPs and product-risk controls.",
  },
  {
    id: "validated-state",
    label: "Impact on validated/qualified state, method validation, equipment qualification, and CSV has been assessed.",
    blocker: true,
    action: "Define required validation, qualification, method, or CSV actions before implementation.",
  },
  {
    id: "regulatory-impact",
    label: "Regulatory filing, established conditions, customer/authority notification, and quality agreement impact are assessed.",
    blocker: true,
    action: "Involve Regulatory Affairs before implementation and decide whether notification, variation, or approval is needed.",
  },
  {
    id: "stability-impact",
    label: "Stability, shelf life, comparability, and ongoing monitoring impact are assessed where relevant.",
    action: "Justify no stability impact, or define stability/comparability monitoring triggered by the change.",
  },
  {
    id: "documents-training",
    label: "SOPs, batch records, methods, specs, labels, and training updates are identified.",
    action: "List each controlled document and training item with owner, due date, and effective date.",
  },
  {
    id: "implementation",
    label: "Prerequisites, implementation window, affected inventory/batches, and rollback/contingency plan are defined.",
    action: "Add implementation controls so no batch, lot, or system crosses the change boundary without traceability.",
  },
  {
    id: "effectiveness",
    label: "Post-implementation verification or effectiveness check is defined before closure.",
    action: "Define what evidence will prove the change worked and did not create unintended effects.",
  },
  {
    id: "approval",
    label: "QA and affected functions approve before implementation starts.",
    blocker: true,
    action: "Do not implement until QA and required functions approve the assessed change package.",
  },
];

const TONE = {
  red: "border-red-500/30 bg-red-500/10 text-red-100",
  amber: "border-amber-500/30 bg-amber-500/10 text-amber-100",
  teal: "border-teal-500/30 bg-teal-500/10 text-teal-100",
};

function resultFor(score: number, blockers: Criterion[]) {
  if (blockers.length >= 2) {
    return {
      tone: "red" as const,
      label: "High impact - hold before approval",
      summary:
        "Multiple change-control blockers remain. The change needs stronger impact assessment before approval or implementation.",
    };
  }
  if (blockers.length === 1) {
    return {
      tone: "amber" as const,
      label: "Major change - approval actions required",
      summary:
        "One release-critical impact area is not fully assessed. Keep the change open until the triggered action is resolved.",
    };
  }
  if (score < 85) {
    return {
      tone: "amber" as const,
      label: "Moderate change - tighten package",
      summary:
        "No hard blocker is selected, but the package still needs clearer implementation and closure evidence.",
    };
  }
  return {
    tone: "teal" as const,
    label: "Ready for QA approval review",
    summary:
      "The impact assessment, implementation controls, and closure evidence are ready for QA and function review.",
  };
}

function buildChangeNote({
  changeType,
  changeRef,
  score,
  result,
  blockers,
  weakSpots,
}: {
  changeType: string;
  changeRef: string;
  score: number;
  result: ReturnType<typeof resultFor>;
  blockers: Criterion[];
  weakSpots: Criterion[];
}) {
  const blockerText = blockers.length
    ? blockers.map((item, index) => `${index + 1}. ${item.label}\n   Action: ${item.action}`).join("\n")
    : "None selected.";
  const weakSpotText = weakSpots.length
    ? weakSpots.map((item, index) => `${index + 1}. ${item.action}`).join("\n")
    : "None selected.";

  return [
    "# Change control impact triage note",
    "",
    `Change reference: ${changeRef.trim() || "Not specified"}`,
    `Change type: ${changeType}`,
    `Impact readiness score: ${score}% - ${result.label}`,
    "",
    "Decision guidance:",
    result.summary,
    "",
    "Impact blockers:",
    blockerText,
    "",
    "Actions to tighten before closure:",
    weakSpotText,
    "",
    "Minimum change package:",
    "- Current state, proposed state, and rationale",
    "- Product quality / validated state / regulatory impact assessment",
    "- Required validation, documentation, training, and notification actions",
    "- Implementation plan with effective date and affected inventory/batches",
    "- Post-implementation verification evidence",
  ].join("\n");
}

export function ChangeControlImpactTriage() {
  const [changeType, setChangeType] = useState(CHANGE_TYPES[0]);
  const [changeRef, setChangeRef] = useState("CC-2026-014 - mixing speed setpoint update");
  const [copied, setCopied] = useState(false);
  const [answers, setAnswers] = useState<Record<string, Answer>>({
    description: "yes",
    "quality-impact": "partial",
    "validated-state": "partial",
    "regulatory-impact": "partial",
    "stability-impact": "no",
    "documents-training": "yes",
    implementation: "partial",
    effectiveness: "no",
    approval: "yes",
  });

  const assessment = useMemo(() => {
    const earned = CRITERIA.reduce((sum, criterion) => {
      const answer = answers[criterion.id];
      return sum + (ANSWERS.find((item) => item.value === answer)?.points ?? 0);
    }, 0);
    const score = Math.round((earned / (CRITERIA.length * 2)) * 100);
    const blockers = CRITERIA.filter((criterion) => criterion.blocker && answers[criterion.id] !== "yes");
    const weakSpots = CRITERIA.filter((criterion) => answers[criterion.id] && answers[criterion.id] !== "yes");
    return { score, blockers, weakSpots, result: resultFor(score, blockers) };
  }, [answers]);

  const changeNote = useMemo(
    () =>
      buildChangeNote({
        changeType,
        changeRef,
        score: assessment.score,
        result: assessment.result,
        blockers: assessment.blockers,
        weakSpots: assessment.weakSpots,
      }),
    [changeType, changeRef, assessment],
  );

  function reset() {
    setChangeType(CHANGE_TYPES[0]);
    setChangeRef("CC-2026-014 - mixing speed setpoint update");
    setAnswers({});
  }

  async function copyChangeNote() {
    await copyText(changeNote);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-card p-5 md:p-6">
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <div className="flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">Change Control Impact Triage</h2>
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        Classify a proposed GMP change before approval. The key question is what the
        change could disturb: product quality, validated state, stability, or the regulatory filing.
      </p>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_330px] gap-6">
        <div className="space-y-5">
          <div className="grid md:grid-cols-2 gap-3">
            <label>
              <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Change type
              </span>
              <select
                value={changeType}
                onChange={(event) => setChangeType(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              >
                {CHANGE_TYPES.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Change reference
              </span>
              <input
                value={changeRef}
                onChange={(event) => setChangeRef(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
            </label>
          </div>

          <div className="space-y-2.5">
            {CRITERIA.map((criterion) => (
              <div key={criterion.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="flex flex-col sm:flex-row sm:items-start gap-2.5 sm:gap-3">
                  <div className="flex-1">
                    <p className="text-sm">{criterion.label}</p>
                    {criterion.blocker && (
                      <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-red-300">
                        Approval blocker if incomplete
                      </p>
                    )}
                  </div>
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
                  <p className="mt-2 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">Action: </span>
                    {criterion.action}
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
              <p className="text-[11px] font-bold uppercase tracking-wider opacity-80">Impact triage</p>
            </div>
            <div className="text-4xl font-bold mb-1">{assessment.score}%</div>
            <p className="text-sm font-semibold mb-2">{assessment.result.label}</p>
            <p className="text-xs opacity-85 leading-relaxed">{assessment.result.summary}</p>
          </div>

          {assessment.blockers.length > 0 && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-red-200 mb-2.5">Impact blockers</p>
              <ol className="space-y-2">
                {assessment.blockers.map((item, index) => (
                  <li key={item.id} className="text-xs flex gap-2">
                    <span className="font-bold text-red-300 shrink-0">{index + 1}</span>
                    <span className="text-muted-foreground">{item.action}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-semibold mb-2">Change package</p>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li>Current and proposed state</li>
              <li>Quality, validation, stability, and regulatory impact assessment</li>
              <li>Required validation, documentation, training, and notification actions</li>
              <li>Implementation plan and post-implementation verification</li>
            </ul>
            <button
              onClick={copyChangeNote}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-teal-500/30 bg-teal-500/10 px-3 py-2 text-xs font-bold text-teal-200 transition-colors hover:bg-teal-500/15"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy change note"}
            </button>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed flex items-start gap-1.5">
            <Info className="w-3 h-3 mt-0.5 shrink-0 text-primary/70" />
            Educational triage only. Your approved change-control SOP, QA approval, and regulatory assessment remain the source of truth.
          </p>
        </aside>
      </div>
    </section>
  );
}
