import { useMemo, useState } from "react";
import { Biohazard, CheckCircle2, Copy, Info, RotateCcw, ShieldAlert } from "lucide-react";
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
    id: "source-control",
    label: "MCB/WCB, cell substrate, and production cell age are characterized for relevant adventitious and endogenous viruses.",
    blocker: true,
    fix: "Hold the viral-safety conclusion until source qualification and cell-bank characterization are complete and current.",
  },
  {
    id: "raw-materials",
    label: "Animal/human-derived raw materials and biological reagents have viral-risk controls and supplier qualification evidence.",
    fix: "Close raw-material viral-risk gaps with origin controls, supplier evidence, treatment steps, or justified alternatives.",
  },
  {
    id: "testing-panel",
    label: "The testing panel is appropriate to the cell substrate, product type, stage, and known/emerging viral risks.",
    blocker: true,
    fix: "Define or update the stage-appropriate testing panel before relying on negative test results.",
  },
  {
    id: "assay-controls",
    label: "Viral assays, controls, sample suitability, and inhibition/interference checks are valid for the tested material.",
    blocker: true,
    fix: "Invalidate or repeat any viral assay run with failed controls or unresolved sample interference.",
  },
  {
    id: "clearance-model",
    label: "Scaled-down viral clearance studies are qualified and representative of the commercial process parameters.",
    blocker: true,
    fix: "Do not claim clearance until the scale-down model and operating ranges represent the manufacturing process.",
  },
  {
    id: "orthogonal-lrv",
    label: "Clearance steps are mechanistically orthogonal and provide a justified log-reduction margin for relevant model viruses.",
    blocker: true,
    fix: "Re-justify additive LRV claims or add a mechanistically different removal/inactivation step.",
  },
  {
    id: "prior-knowledge",
    label: "Any use of platform data, prior knowledge, resin reuse, or continuous processing assumptions is documented and justified.",
    fix: "Document why prior knowledge applies to this product/process, or run product-specific confirmation work.",
  },
  {
    id: "signal-response",
    label: "Any adventitious-agent signal has containment, batch-impact assessment, source investigation, and QA disposition documented.",
    blocker: true,
    fix: "Contain affected material and close the required investigation before release or viral-safety conclusion.",
  },
];

const DEFAULT_ANSWERS: Record<string, Answer> = {
  "source-control": "yes",
  "raw-materials": "partial",
  "testing-panel": "partial",
  "assay-controls": "yes",
  "clearance-model": "partial",
  "orthogonal-lrv": "no",
  "prior-knowledge": "no",
  "signal-response": "yes",
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
      label: "Do not rely on viral safety package - blockers remain",
      summary:
        "One or more source, testing, clearance, or signal-response blockers are not closed. Hold the viral-safety conclusion until the barrier strategy is defensible.",
    };
  }
  if (score < 85) {
    return {
      tone: "amber" as const,
      label: "Needs stronger viral safety package",
      summary: "No hard blocker is selected, but raw-material controls, prior knowledge, or margin justification still need tightening.",
    };
  }
  if (score < 100) {
    return {
      tone: "amber" as const,
      label: "Nearly ready for viral safety review",
      summary: "The key blockers are closed. Tighten remaining evidence before final QA/regulatory reliance.",
    };
  }
  return {
    tone: "teal" as const,
    label: "Ready for viral safety review",
    summary: "Source control, testing, clearance, LRV margin, and signal-response controls support the defined viral-safety conclusion.",
  };
}

function buildViralSafetyNote({
  programRef,
  productScope,
  strategyType,
  score,
  decision,
  blockers,
  weakSpots,
}: {
  programRef: string;
  productScope: string;
  strategyType: string;
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
    "# Viral safety readiness note",
    "",
    `Program / batch scope: ${programRef.trim() || "Not specified"}`,
    `Product / process scope: ${productScope.trim() || "Not specified"}`,
    `Strategy type: ${strategyType}`,
    `Readiness score: ${score}% - ${decision.label}`,
    "",
    "Decision guidance:",
    decision.summary,
    "",
    "Viral-safety blockers:",
    blockerText,
    "",
    "Additional gaps to tighten:",
    weakSpotText,
    "",
    "Minimum viral-safety package:",
    "- Qualified cell banks, cell substrate, and production cell age controls",
    "- Raw-material viral-risk controls and supplier evidence",
    "- Stage-appropriate testing panel with valid assay controls",
    "- Representative scale-down viral clearance model",
    "- Orthogonal removal/inactivation steps with justified LRV margin",
    "- Documented prior-knowledge/platform rationale where used",
    "- Containment, investigation, and QA disposition for any adventitious-agent signal",
  ].join("\n");
}

export function ViralSafetyReadinessPlanner() {
  const [programRef, setProgramRef] = useState("Viral safety package VS-2409 / DS release");
  const [productScope, setProductScope] = useState("CHO-derived monoclonal antibody downstream process");
  const [strategyType, setStrategyType] = useState("ICH Q5A(R2) three-pillar strategy");
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

  const viralSafetyNote = useMemo(
    () =>
      buildViralSafetyNote({
        programRef,
        productScope,
        strategyType,
        score: assessment.score,
        decision: assessment.decision,
        blockers: assessment.blockers,
        weakSpots: assessment.weakSpots,
      }),
    [programRef, productScope, strategyType, assessment],
  );

  function reset() {
    setProgramRef("Viral safety package VS-2409 / DS release");
    setProductScope("CHO-derived monoclonal antibody downstream process");
    setStrategyType("ICH Q5A(R2) three-pillar strategy");
    setAnswers(DEFAULT_ANSWERS);
  }

  async function copyViralSafetyNote() {
    await copyText(viralSafetyNote);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-card p-5 md:p-6">
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <div className="flex items-center gap-2">
          <Biohazard className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">Viral Safety Readiness Planner</h2>
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        Check whether a biologics viral-safety package is ready to support review:
        source control, stage-appropriate testing, valid assay controls, representative
        clearance, orthogonal LRV margin, prior knowledge, and signal response.
      </p>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_330px] gap-6">
        <div className="space-y-5">
          <div className="grid md:grid-cols-2 gap-3">
            <label>
              <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Program / batch scope
              </span>
              <input
                value={programRef}
                onChange={(event) => setProgramRef(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
            </label>
            <label>
              <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Strategy type
              </span>
              <select
                value={strategyType}
                onChange={(event) => setStrategyType(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option>ICH Q5A(R2) three-pillar strategy</option>
                <option>Cell-bank characterization package</option>
                <option>Viral clearance validation package</option>
                <option>Adventitious-agent investigation package</option>
              </select>
            </label>
          </div>

          <label>
            <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Product / process scope
            </span>
            <input
              value={productScope}
              onChange={(event) => setProductScope(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
          </label>

          <div className="space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Viral-safety evidence</p>
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
              <p className="text-[11px] font-bold uppercase tracking-wider opacity-80">Viral safety readiness</p>
            </div>
            <div className="text-4xl font-bold mb-1">{assessment.score}%</div>
            <p className="text-sm font-semibold mb-2">{assessment.decision.label}</p>
            <p className="text-xs opacity-85 leading-relaxed">{assessment.decision.summary}</p>
          </div>

          {assessment.blockers.length > 0 && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-red-200 mb-2.5">Viral-safety blockers</p>
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
            <p className="text-sm font-semibold mb-2">Review package</p>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li>Source and raw-material viral-risk controls</li>
              <li>Stage-appropriate testing panel and valid assay controls</li>
              <li>Representative clearance model and justified LRV margin</li>
              <li>Containment and QA disposition for any adventitious-agent signal</li>
            </ul>
            <button
              onClick={copyViralSafetyNote}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-teal-500/30 bg-teal-500/10 px-3 py-2 text-xs font-bold text-teal-200 transition-colors hover:bg-teal-500/15"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy viral safety note"}
            </button>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed flex items-start gap-1.5">
            <Info className="w-3 h-3 mt-0.5 shrink-0 text-primary/70" />
            Educational planning aid only. ICH Q5A(R2), your registered strategy, validated methods, and QA/regulatory disposition remain the source of truth.
          </p>
        </aside>
      </div>
    </section>
  );
}
