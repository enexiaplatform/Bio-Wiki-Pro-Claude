import { useMemo, useState } from "react";
import { CheckCircle2, ClipboardCheck, Copy, Info, RotateCcw, ShieldAlert } from "lucide-react";
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
    id: "record-complete",
    label: "Executed batch record is complete, signed, dated, and matches the approved master version.",
    blocker: true,
    fix: "Resolve blanks, missing signatures, version mismatches, and undocumented corrections before disposition.",
  },
  {
    id: "critical-steps",
    label: "Critical process steps, IPCs, holds, and yields are within approved limits or justified.",
    fix: "Investigate out-of-limit IPCs, hold-time excursions, and unexplained yield/reconciliation differences.",
  },
  {
    id: "testing-complete",
    label: "All required QC tests are complete, in specification, and traceable to approved methods and standards.",
    blocker: true,
    fix: "Hold the batch until required testing is complete and any OOS/OOT signal is dispositioned.",
  },
  {
    id: "events-closed",
    label: "Batch-impacting deviations, OOS/OOT, and investigations are closed with impact assessment.",
    blocker: true,
    fix: "Do not release on a promise to close later. Complete the investigation and document product impact.",
  },
  {
    id: "audit-trail",
    label: "Relevant audit trails and data-review exceptions have been reviewed and documented.",
    blocker: true,
    fix: "Review high-risk audit trails before approval, especially CDS/LIMS changes, reprocessing, and deleted data.",
  },
  {
    id: "materials-labels",
    label: "Materials, components, labels, and reconciliation are acceptable and traceable.",
    fix: "Resolve label/component count differences, unapproved material status, or unexplained reconciliation gaps.",
  },
  {
    id: "changes-training",
    label: "Applicable change controls, training, and procedure versions were effective for the batch.",
    fix: "Confirm the batch was made under approved procedures by trained personnel after effective change dates.",
  },
  {
    id: "stability-commitments",
    label: "Stability, APR/PQR, post-approval, and market commitments do not block release.",
    fix: "Check whether stability commitments, regulatory conditions, complaints, or recalls affect disposition.",
  },
  {
    id: "authorized-releaser",
    label: "The authorized releaser / QP is independent, trained, and has the full evidence package.",
    blocker: true,
    fix: "Route the complete package to the authorized person; production pressure cannot substitute for QA disposition.",
  },
];

const TONE = {
  red: "border-red-500/30 bg-red-500/10 text-red-100",
  amber: "border-amber-500/30 bg-amber-500/10 text-amber-100",
  teal: "border-teal-500/30 bg-teal-500/10 text-teal-100",
};

function decisionFor(score: number, blockers: Criterion[]) {
  if (blockers.length > 0) {
    return {
      tone: "red" as const,
      label: "Hold - release blockers remain",
      summary: "At least one release-critical item is not fully closed. The batch should stay on hold until QA disposition is evidence-backed.",
    };
  }
  if (score < 85) {
    return {
      tone: "amber" as const,
      label: "Not ready for release review",
      summary: "No hard blocker is selected, but the package still has weak spots that an independent reviewer should resolve before disposition.",
    };
  }
  if (score < 100) {
    return {
      tone: "amber" as const,
      label: "Release review nearly ready",
      summary: "The core blockers are closed. Tighten the remaining evidence gaps before the authorized release signature.",
    };
  }
  return {
    tone: "teal" as const,
    label: "Ready for release review",
    summary: "The release package is complete enough for the authorized person to make and document the disposition decision.",
  };
}

function buildReleaseNote({
  batchRef,
  productType,
  score,
  decision,
  blockers,
  weakSpots,
}: {
  batchRef: string;
  productType: string;
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
    "# Batch release readiness note",
    "",
    `Batch / lot reference: ${batchRef.trim() || "Not specified"}`,
    `Product / batch type: ${productType}`,
    `Readiness score: ${score}% - ${decision.label}`,
    "",
    "Decision guidance:",
    decision.summary,
    "",
    "Release blockers to close:",
    blockerText,
    "",
    "Additional gaps to tighten:",
    weakSpotText,
    "",
    "Minimum release evidence package:",
    "- Executed batch record and reconciliation",
    "- QC results / CoA with raw-data traceability",
    "- Closed deviations, OOS/OOT, and change impacts",
    "- Audit-trail/data-review evidence",
    "- Authorized release signature and rationale",
  ].join("\n");
}

export function BatchReleaseReadinessChecklist() {
  const [batchRef, setBatchRef] = useState("Batch A123 / finished product release");
  const [productType, setProductType] = useState("Finished drug product");
  const [copied, setCopied] = useState(false);
  const [answers, setAnswers] = useState<Record<string, Answer>>({
    "record-complete": "yes",
    "critical-steps": "yes",
    "testing-complete": "yes",
    "events-closed": "partial",
    "audit-trail": "partial",
    "materials-labels": "yes",
    "changes-training": "yes",
    "stability-commitments": "partial",
    "authorized-releaser": "yes",
  });

  const assessment = useMemo(() => {
    const earned = CRITERIA.reduce((sum, criterion) => {
      const answer = answers[criterion.id];
      return sum + (ANSWERS.find((item) => item.value === answer)?.points ?? 0);
    }, 0);
    const score = Math.round((earned / (CRITERIA.length * 2)) * 100);
    const blockers = CRITERIA.filter((criterion) => criterion.blocker && answers[criterion.id] !== "yes");
    const weakSpots = CRITERIA.filter((criterion) => answers[criterion.id] && answers[criterion.id] !== "yes");
    return { score, blockers, weakSpots, decision: decisionFor(score, blockers) };
  }, [answers]);

  const releaseNote = useMemo(
    () =>
      buildReleaseNote({
        batchRef,
        productType,
        score: assessment.score,
        decision: assessment.decision,
        blockers: assessment.blockers,
        weakSpots: assessment.weakSpots,
      }),
    [batchRef, productType, assessment],
  );

  function reset() {
    setBatchRef("Batch A123 / finished product release");
    setProductType("Finished drug product");
    setAnswers({});
  }

  async function copyReleaseNote() {
    await copyText(releaseNote);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-card p-5 md:p-6">
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">Batch Release Readiness Checklist</h2>
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        Check whether a batch release package is ready for an authorized QA/QP disposition.
        Release blockers override the score: a mostly complete package can still require hold.
      </p>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_330px] gap-6">
        <div className="space-y-5">
          <div className="grid md:grid-cols-2 gap-3">
            <label>
              <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Batch / lot reference
              </span>
              <input
                value={batchRef}
                onChange={(event) => setBatchRef(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
            </label>
            <label>
              <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Product / batch type
              </span>
              <select
                value={productType}
                onChange={(event) => setProductType(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option>Finished drug product</option>
                <option>Drug substance / API</option>
                <option>Biologics batch</option>
                <option>Sterile batch</option>
                <option>Intermediate / bulk hold</option>
              </select>
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
                        Release blocker if not fully closed
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
                    <span className="font-semibold text-foreground">Before disposition: </span>
                    {criterion.fix}
                  </p>
                )}
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
              <p className="text-[11px] font-bold uppercase tracking-wider opacity-80">Disposition readiness</p>
            </div>
            <div className="text-4xl font-bold mb-1">{assessment.score}%</div>
            <p className="text-sm font-semibold mb-2">{assessment.decision.label}</p>
            <p className="text-xs opacity-85 leading-relaxed">{assessment.decision.summary}</p>
          </div>

          {assessment.blockers.length > 0 && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-red-200 mb-2.5">Release blockers</p>
              <ol className="space-y-2">
                {assessment.blockers.map((item, index) => (
                  <li key={item.id} className="text-xs flex gap-2">
                    <span className="font-bold text-red-300 shrink-0">{index + 1}</span>
                    <span className="text-muted-foreground">{item.fix}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-semibold mb-2">Release evidence package</p>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li>Executed batch record and reconciliation</li>
              <li>QC results / CoA with raw-data traceability</li>
              <li>Closed deviation, OOS/OOT, and change impact assessments</li>
              <li>Audit-trail review and authorized disposition rationale</li>
            </ul>
            <button
              onClick={copyReleaseNote}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-teal-500/30 bg-teal-500/10 px-3 py-2 text-xs font-bold text-teal-200 transition-colors hover:bg-teal-500/15"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy release note"}
            </button>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed flex items-start gap-1.5">
            <Info className="w-3 h-3 mt-0.5 shrink-0 text-primary/70" />
            Educational checklist only. Final release, rejection, or hold must follow your approved SOP and authorized QA/QP disposition.
          </p>
        </aside>
      </div>
    </section>
  );
}
