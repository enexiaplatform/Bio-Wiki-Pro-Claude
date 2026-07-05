import { useMemo, useState } from "react";
import { Activity, CheckCircle2, Copy, Info, RotateCcw, ShieldAlert } from "lucide-react";
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
    label: "Validated potency method, reportable range, curve model, and acceptance criteria are current for this product.",
    blocker: true,
    fix: "Hold reporting until the validated method and acceptance criteria cover this product, matrix, and reportable range.",
  },
  {
    id: "reference",
    label: "Qualified reference standard is within expiry/retest, assigned potency, storage, and bridging requirements.",
    blocker: true,
    fix: "Use a qualified reference or complete bridging before reporting relative potency.",
  },
  {
    id: "cell-system",
    label: "Cell line/passage, viability, seeding density, and culture conditions are within qualified limits.",
    blocker: true,
    fix: "Investigate cell health, passage, density, and culture conditions before interpreting the plate.",
  },
  {
    id: "plate-controls",
    label: "Plate controls, blanks, standards, replicates, and layout control edge/position effects.",
    fix: "Repeat or justify the run if controls, replicates, or layout do not support a reportable result.",
  },
  {
    id: "curve-fit",
    label: "Reference and sample curves meet curve-fit/system-suitability criteria for the validated model.",
    blocker: true,
    fix: "Do not report potency until curve fit, asymptotes, slope, response window, and residual criteria are acceptable.",
  },
  {
    id: "parallelism",
    label: "Parallelism/similarity is met before calculating or reporting relative potency.",
    blocker: true,
    fix: "Investigate non-parallelism as a matrix, mechanism, sample, or assay issue; relative potency is not valid until similarity is met.",
  },
  {
    id: "variability",
    label: "Replicate plates/wells, %CV or precision, and analyst/instrument run controls are within limits.",
    fix: "Investigate high variability before averaging or quietly repeating the run.",
  },
  {
    id: "oos-impact",
    label: "Any potency OOS/OOT, invalid run, or atypical curve has a documented assay-vs-sample impact assessment.",
    blocker: true,
    fix: "Open/close the required investigation before batch disposition or final potency reporting.",
  },
];

const DEFAULT_ANSWERS: Record<string, Answer> = {
  method: "yes",
  reference: "yes",
  "cell-system": "partial",
  "plate-controls": "yes",
  "curve-fit": "partial",
  parallelism: "no",
  variability: "partial",
  "oos-impact": "yes",
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
      label: "Do not report potency - blockers remain",
      summary:
        "One or more reportability blockers are not closed. Hold relative-potency reporting until the assay is valid and QA/QC has documented impact.",
    };
  }
  if (score < 85) {
    return {
      tone: "amber" as const,
      label: "Needs stronger assay evidence",
      summary: "No hard blocker is selected, but the run package still has weak spots that should be tightened before final reporting.",
    };
  }
  if (score < 100) {
    return {
      tone: "amber" as const,
      label: "Nearly ready to report relative potency",
      summary: "The reportability blockers are closed. Tighten remaining precision, layout, or documentation gaps before final approval.",
    };
  }
  return {
    tone: "teal" as const,
    label: "Ready to report relative potency",
    summary: "Reference, cell system, controls, fit, parallelism, and investigation controls support reporting for the defined method.",
  };
}

function buildPotencyNote({
  runRef,
  productScope,
  assayFormat,
  score,
  decision,
  blockers,
  weakSpots,
}: {
  runRef: string;
  productScope: string;
  assayFormat: string;
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
    "# Cell-based potency reportability note",
    "",
    `Run / plate set: ${runRef.trim() || "Not specified"}`,
    `Product / sample scope: ${productScope.trim() || "Not specified"}`,
    `Assay format: ${assayFormat}`,
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
    "Minimum potency reporting package:",
    "- Validated method and current acceptance criteria",
    "- Qualified reference standard and bridging status",
    "- Qualified cell system conditions and passage/viability records",
    "- Valid plate controls, curve fit, and system suitability",
    "- Parallelism/similarity decision before relative potency",
    "- Investigation and assay-vs-sample impact assessment for any OOS/OOT or invalid run",
  ].join("\n");
}

export function CellBasedPotencyReadinessPlanner() {
  const [runRef, setRunRef] = useState("Potency run P-2407 / plate set 3");
  const [productScope, setProductScope] = useState("Monoclonal antibody release potency");
  const [assayFormat, setAssayFormat] = useState("Cell-based reporter assay");
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

  const potencyNote = useMemo(
    () =>
      buildPotencyNote({
        runRef,
        productScope,
        assayFormat,
        score: assessment.score,
        decision: assessment.decision,
        blockers: assessment.blockers,
        weakSpots: assessment.weakSpots,
      }),
    [runRef, productScope, assayFormat, assessment],
  );

  function reset() {
    setRunRef("Potency run P-2407 / plate set 3");
    setProductScope("Monoclonal antibody release potency");
    setAssayFormat("Cell-based reporter assay");
    setAnswers(DEFAULT_ANSWERS);
  }

  async function copyPotencyNote() {
    await copyText(potencyNote);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-card p-5 md:p-6">
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">Cell-Based Potency Readiness Planner</h2>
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        Check whether a bioassay run is ready to report relative potency: reference standard,
        cell system, controls, curve fit, parallelism, precision, and investigation controls.
      </p>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_330px] gap-6">
        <div className="space-y-5">
          <div className="grid md:grid-cols-2 gap-3">
            <label>
              <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Run / plate set
              </span>
              <input
                value={runRef}
                onChange={(event) => setRunRef(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
            </label>
            <label>
              <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Assay format
              </span>
              <select
                value={assayFormat}
                onChange={(event) => setAssayFormat(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option>Cell-based reporter assay</option>
                <option>Proliferation / viability assay</option>
                <option>Cytotoxicity assay</option>
                <option>Binding surrogate assay</option>
              </select>
            </label>
          </div>

          <label>
            <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Product / sample scope
            </span>
            <input
              value={productScope}
              onChange={(event) => setProductScope(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
          </label>

          <div className="space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Reportability evidence</p>
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
              <p className="text-[11px] font-bold uppercase tracking-wider opacity-80">Potency readiness</p>
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
              <li>Validated method, reportable range, and acceptance criteria</li>
              <li>Qualified reference standard and cell system records</li>
              <li>System suitability, curve fit, and parallelism decision</li>
              <li>Investigation/impact assessment for invalid or OOS/OOT runs</li>
            </ul>
            <button
              onClick={copyPotencyNote}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-teal-500/30 bg-teal-500/10 px-3 py-2 text-xs font-bold text-teal-200 transition-colors hover:bg-teal-500/15"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy potency note"}
            </button>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed flex items-start gap-1.5">
            <Info className="w-3 h-3 mt-0.5 shrink-0 text-primary/70" />
            Educational planning aid only. Your validated bioassay method, statistical model, system suitability criteria, and QA/QC disposition remain the source of truth.
          </p>
        </aside>
      </div>
    </section>
  );
}
