import { useMemo, useState } from "react";
import { CheckCircle2, Copy, Filter, Info, RotateCcw, ShieldAlert } from "lucide-react";
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
    id: "retention-validation",
    label: "Product/filter bacterial-retention validation supports the selected membrane, product matrix, and worst-case conditions.",
    blocker: true,
    fix: "Confirm product-specific retention validation or justify a qualified surrogate before relying on the sterilizing claim.",
  },
  {
    id: "compatibility",
    label: "Compatibility, extractables/leachables, adsorption, and prefilter strategy are justified for the product.",
    fix: "Close compatibility, adsorption, or fouling questions before locking the filtration train.",
  },
  {
    id: "integrity-limits",
    label: "Integrity-test method and limits are validated and correlated to microbial retention.",
    blocker: true,
    fix: "Use validated bubble point, diffusive flow, pressure hold, or water intrusion limits linked to retention data.",
  },
  {
    id: "pupsit",
    label: "PUPSIT is performed where required, or the CCS/QRM rationale for not performing it is documented.",
    blocker: true,
    fix: "Perform pre-use post-sterilization integrity testing or document a robust CCS/QRM justification for the exception.",
  },
  {
    id: "validated-parameters",
    label: "Filtration stayed within validated pressure, time, temperature, volume, and bioburden/pre-filter limits.",
    blocker: true,
    fix: "Investigate any excursion beyond validated parameters before treating the batch as covered by the retention validation.",
  },
  {
    id: "aseptic-setup",
    label: "Aseptic connections, sterile hold, redundant filter/location, and line setup match the approved process.",
    fix: "Reconcile the actual setup to the approved sterile-filtration flow path and document any difference via change/deviation.",
  },
  {
    id: "post-use",
    label: "Post-use integrity test passed before filter removal or batch release decision.",
    blocker: true,
    fix: "Hold the batch and investigate the filter, wetting, test setup, and sterility impact if post-use integrity is not passing.",
  },
  {
    id: "deviation-impact",
    label: "Any integrity-test repeat, marginal result, setup issue, or parameter excursion has a closed batch-impact assessment.",
    blocker: true,
    fix: "Close the deviation and QA impact assessment before release; do not treat a marginal integrity result as a routine pass.",
  },
];

const DEFAULT_ANSWERS: Record<string, Answer> = {
  "retention-validation": "yes",
  compatibility: "yes",
  "integrity-limits": "partial",
  pupsit: "partial",
  "validated-parameters": "yes",
  "aseptic-setup": "partial",
  "post-use": "no",
  "deviation-impact": "no",
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
      label: "Hold - sterile filtration blockers remain",
      summary:
        "At least one sterility-critical control is not closed. Hold the batch/setup until QA has validated evidence and a documented impact assessment.",
    };
  }
  if (score < 85) {
    return {
      tone: "amber" as const,
      label: "Needs stronger filtration evidence",
      summary:
        "No hard blocker is selected, but the filtration package still has weak spots that should be tightened before release or routine use.",
    };
  }
  if (score < 100) {
    return {
      tone: "amber" as const,
      label: "Nearly ready for QA review",
      summary: "The sterility-critical blockers are closed. Tighten or justify the remaining documentation gaps before final disposition.",
    };
  }
  return {
    tone: "teal" as const,
    label: "Ready for sterile-filtration QA review",
    summary: "The retention claim, integrity tests, process parameters, and batch-impact controls support QA review for the defined use.",
  };
}

function buildFiltrationNote({
  batchRef,
  filterTrain,
  productScope,
  score,
  decision,
  blockers,
  weakSpots,
}: {
  batchRef: string;
  filterTrain: string;
  productScope: string;
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
    "# Sterile filtration readiness note",
    "",
    `Batch / campaign: ${batchRef.trim() || "Not specified"}`,
    `Product / process scope: ${productScope.trim() || "Not specified"}`,
    `Filter train: ${filterTrain.trim() || "Not specified"}`,
    `Readiness score: ${score}% - ${decision.label}`,
    "",
    "Decision guidance:",
    decision.summary,
    "",
    "Sterility-critical blockers:",
    blockerText,
    "",
    "Additional gaps to tighten:",
    weakSpotText,
    "",
    "Minimum filtration evidence package:",
    "- Product/filter bacterial-retention validation or justified surrogate",
    "- Validated integrity-test method and limits correlated to retention",
    "- PUPSIT result or documented CCS/QRM rationale where applicable",
    "- Filtration parameters within validated pressure, time, temperature, volume, and bioburden limits",
    "- Passing post-use integrity test and closed batch-impact assessment",
  ].join("\n");
}

export function SterileFiltrationReadinessPlanner() {
  const [batchRef, setBatchRef] = useState("Batch SF-2401 / final bulk filtration");
  const [productScope, setProductScope] = useState("Aqueous sterile drug product before aseptic fill");
  const [filterTrain, setFilterTrain] = useState("0.22 micron PES sterilizing filter + redundant final filter");
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

  const filtrationNote = useMemo(
    () =>
      buildFiltrationNote({
        batchRef,
        filterTrain,
        productScope,
        score: assessment.score,
        decision: assessment.decision,
        blockers: assessment.blockers,
        weakSpots: assessment.weakSpots,
      }),
    [batchRef, filterTrain, productScope, assessment],
  );

  function reset() {
    setBatchRef("Batch SF-2401 / final bulk filtration");
    setProductScope("Aqueous sterile drug product before aseptic fill");
    setFilterTrain("0.22 micron PES sterilizing filter + redundant final filter");
    setAnswers(DEFAULT_ANSWERS);
  }

  async function copyFiltrationNote() {
    await copyText(filtrationNote);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-card p-5 md:p-6">
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">Sterile Filtration Readiness Planner</h2>
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        Check whether a sterilizing-filtration setup or batch package has the retention, integrity-test,
        PUPSIT/QRM, parameter, and batch-impact evidence QA needs.
      </p>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_330px] gap-6">
        <div className="space-y-5">
          <div className="grid md:grid-cols-2 gap-3">
            <label>
              <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Batch / campaign
              </span>
              <input
                value={batchRef}
                onChange={(event) => setBatchRef(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
            </label>
            <label>
              <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Filter train
              </span>
              <input
                value={filterTrain}
                onChange={(event) => setFilterTrain(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
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
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Sterile filtration controls</p>
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
              <p className="text-[11px] font-bold uppercase tracking-wider opacity-80">Filtration readiness</p>
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
            <p className="text-sm font-semibold mb-2">Evidence package</p>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li>Retention validation for filter/product/process</li>
              <li>Validated integrity limits correlated to retention</li>
              <li>PUPSIT result or documented CCS/QRM rationale</li>
              <li>Post-use integrity pass and closed batch impact</li>
            </ul>
            <button
              onClick={copyFiltrationNote}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-teal-500/30 bg-teal-500/10 px-3 py-2 text-xs font-bold text-teal-200 transition-colors hover:bg-teal-500/15"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy filtration note"}
            </button>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed flex items-start gap-1.5">
            <Info className="w-3 h-3 mt-0.5 shrink-0 text-primary/70" />
            Educational planning aid only. Your approved sterile-filtration validation, Annex 1 strategy, CCS/QRM rationale, and QA disposition remain the source of truth.
          </p>
        </aside>
      </div>
    </section>
  );
}
