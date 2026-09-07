import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import {
  findTwinEquipmentThreshold,
  simulateQualityLabTwin,
  type TwinChanges,
  type TwinThreshold,
} from "@shared/quality-lab-decision-twin";
import {
  isIllustrativeQualityLabProject,
  type QualityLabProject,
} from "@shared/quality-lab";
import { saveQualityLabProject } from "@/lib/quality-lab-projects";
import { recordQualityLabFunnelEvent } from "@/lib/quality-lab-funnel";
import {
  compareTwinSpecialists,
  findTwinSpecialistThreshold,
  SPECIALIST_LABELS,
  type TwinSpecialistSummary,
} from "@shared/quality-lab-twin-specialists";

const fields = [
  ["finishedBatchesPerMonth", "Finished batches per month", 0, 100000],
  ["growthRatePercent", "Total growth over planning horizon (%)", -50, 500],
  ["workingDaysPerMonth", "Working days per month", 10, 31],
  ["shifts", "Shifts per day", 1, 3],
  ["outsourcePercent", "Outsourced workload (%)", 0, 95],
  ["redundancyPercent", "People capacity reserve (%)", 0, 100],
] as const;
const format = (value: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value);
const usd = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
type Simulation = ReturnType<typeof simulateQualityLabTwin>;

export function DecisionTwin({ project }: { project: QualityLabProject }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Simulation | null>(null);
  const [threshold, setThreshold] = useState<TwinThreshold | null>(null);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState<string | null>(null);
  const [specialists, setSpecialists] = useState<TwinSpecialistSummary[]>([]);
  const [operationalThreshold, setOperationalThreshold] = useState<Awaited<ReturnType<typeof findTwinSpecialistThreshold>> | null>(null);
  const generation = useRef(0);
  useEffect(() => {
    generation.current++;
    setDraft(
      Object.fromEntries(
        fields.map(([key]) => [key, String(project.input[key])]),
      ),
    );
    setResult(null);
    setThreshold(null);
    setOperationalThreshold(null);
    setDirty(false);
    setSaved(null);
    setOpen(false);
    setBusy(false);
    return () => {
      generation.current++;
    };
  }, [project]);
  async function run(initial = false) {
    const revision = ++generation.current;
    setBusy(true);
    setMessage("");
    setSaved(null);
    // Let the pending state paint before bounded local Compiler probes.
    await new Promise((resolve) => setTimeout(resolve, 20));
    if (revision !== generation.current) return;
    try {
      const changes = initial
        ? {}
        : Object.fromEntries(
            fields.map(([key]) => [
              key,
              draft[key]?.trim() === "" ? NaN : Number(draft[key]),
            ]),
          );
      const next = simulateQualityLabTwin(project, changes);
      setResult(next);
      if (next.status === "ready") {
        const summaries = await compareTwinSpecialists(project, {
          ...project,
          id: `${project.id}:twin-preview`,
          input: next.scenario.input,
          blueprint: next.scenario,
        });
        if (revision !== generation.current) return;
        setSpecialists(summaries);
        const operational = await findTwinSpecialistThreshold(project);
        if (revision !== generation.current) return;
        setOperationalThreshold(operational);
        setThreshold(findTwinEquipmentThreshold(project));
        setDirty(false);
        if (!initial)
          recordQualityLabFunnelEvent({
            stage: "twin_scenario_changed",
            source: "decision-twin",
          });
      }
    } catch {
      if (revision !== generation.current) return;
      setResult(null);
      setMessage(
        "This model could not be simulated. Review its saved basis in the planner.",
      );
    } finally {
      if (revision === generation.current) setBusy(false);
    }
  }
  function saveScenario() {
    if (
      result?.status !== "ready" ||
      dirty ||
      busy ||
      !result.comparison.comparisonIntegrity.exportAllowed
    )
      return;
    try {
      const input = {
        ...result.scenario.input,
        scenarioLabel: `Twin scenario — ${project.input.scenarioLabel}`.slice(
          0,
          100,
        ),
      };
      const copy = saveQualityLabProject(
        input,
        undefined,
        isIllustrativeQualityLabProject(project)
          ? "illustrative-example"
          : "user-entered",
      );
      setSaved(copy.id);
      setMessage(
        "Saved a separate browser scenario. Review its evidence and decisions before an explicit account save.",
      );
    } catch {
      setMessage(
        "The scenario could not be saved in this browser. The original Blueprint is unchanged.",
      );
    }
  }
  const ready = result?.status === "ready" ? result : null;
  return (
    <section
      id="decision-twin"
      aria-labelledby="decision-twin-heading"
      className="mb-5 scroll-mt-32 rounded-2xl border border-teal-300/25 bg-teal-300/[0.04] p-5 md:p-6 print:hidden"
    >
      <h2 id="decision-twin-heading" className="text-xl font-bold">
        Atlas Decision Twin
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-300">
        Test a change against this saved Blueprint. See the consequences and the
        first modeled equipment decision that changes.
      </p>
      {!open ? (
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            recordQualityLabFunnelEvent({
              stage: "twin_opened",
              source: "decision-twin",
            });
            void run(true);
          }}
          className="mt-4 min-h-11 rounded-xl bg-teal-300 px-5 py-3 font-bold text-slate-950"
        >
          Open Decision Twin
        </button>
      ) : (
        <>
          <p role="status" className="mt-4 text-sm text-teal-100">
            {busy
              ? "Running the existing Compiler against your saved basis…"
              : message}
          </p>
          {result?.status === "blocked" && (
            <p
              role="alert"
              className="mt-3 rounded-xl border border-amber-300/30 p-4 text-sm text-amber-100"
            >
              {result.message}
            </p>
          )}
          {ready && operationalThreshold && !busy && (
            <div role="region" aria-label="Specialist threshold search" className="mt-4 rounded-xl border border-teal-300/20 p-4">
              <h3 className="font-semibold">First specialist warning or status change from the saved baseline</h3>
              <p className="mt-2 text-sm leading-6">
                {operationalThreshold.status === "found"
                  ? `First change at ${format(operationalThreshold.firstChangedDemand!)} batches/month, checking every whole batch above ${format(operationalThreshold.baselineDemand)}.`
                  : operationalThreshold.status === "none-in-range"
                    ? `No new warning or status transition through ${format(operationalThreshold.testedThrough)} batches/month. Existing failures remain failures; this does not establish spare capacity.`
                    : "A complete status search is unavailable. Review the accepted specialist bases and project demand scope."}
              </p>
              {operationalThreshold.changes.map((item) => (
                <div key={item.kind} className="mt-2 text-sm">
                  <p>{SPECIALIST_LABELS[item.kind]} ({item.horizon}): {item.before} → {item.after}</p>
                  {item.newSignals?.map((signal) => <div key={signal.id} className="mt-2">
                    <p className="font-semibold">{signal.title}</p>
                    <p>{signal.description}</p>
                    <p className="mt-1 text-xs text-slate-400">Rule basis: {signal.relatedRuleIds.join(", ") || "No linked rule"}</p>
                  </div>)}
                </div>
              ))}
              <details className="mt-3 text-sm">
                <summary className="cursor-pointer">Search coverage and assumptions</summary>
                <p className="mt-2">Accepted staffing, fleet and calendar stay fixed. This tests engine status transitions and new watch or critical signals, not every utilization or equipment quantity change. Missing analyses are outside the search.</p>
                {operationalThreshold.coverage.map((item) => (
                  <p className="mt-2" key={item.kind}>{SPECIALIST_LABELS[item.kind]}: {item.status === "ready" ? item.before : item.status}. {item.boundary}</p>
                ))}
              </details>
            </div>
          )}
          {ready && threshold && !busy && (
            <article className="mt-5 rounded-xl border border-amber-300/25 bg-amber-300/[0.04] p-4">
              <h3 className="font-bold">
                First equipment threshold from the saved baseline
              </h3>
              <p className="mt-2 text-sm leading-6">{threshold.explanation}</p>
              {threshold.changes.map((change) => (
                <div
                  key={`${change.id}-${change.horizon}`}
                  className="mt-3 text-sm"
                >
                  <strong>
                    {change.name}: {change.before} → {change.after} units ·{" "}
                    {change.horizon === "current"
                      ? "current demand"
                      : "planning horizon"}
                  </strong>
                  <p className="mt-1 text-xs text-slate-400">
                    Confirm peak demand and usable equipment capacity before
                    freezing this investment. Confidence: {change.confidence};
                    site evidence required.
                  </p>
                  <details className="mt-2 text-xs leading-6">
                    <summary className="cursor-pointer">
                      Inspect calculation and lineage
                    </summary>
                    <p>{change.basis}</p>
                    {change.lineageIds.map((id) => (
                      <Link
                        key={id}
                        href={`/quality-lab/projects/${project.id}/lineage/${encodeURIComponent(id)}`}
                        className="mr-3 text-teal-200 underline"
                      >
                        Trace saved equipment basis
                      </Link>
                    ))}
                  </details>
                </div>
              ))}
            </article>
          )}
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {fields.map(([key, label, min, max]) => (
              <label
                key={key}
                className="min-w-0 text-xs font-semibold text-slate-300"
              >
                {label}
                <input
                  type="number"
                  min={min}
                  max={max}
                  step={
                    key === "shifts" || key === "workingDaysPerMonth"
                      ? 1
                      : "any"
                  }
                  value={draft[key] ?? ""}
                  disabled={
                    busy ||
                    (key === "finishedBatchesPerMonth" &&
                      project.blueprint.finishedProductDemand.source !==
                        "aggregate-input")
                  }
                  onChange={(event) => {
                    setDraft((current) => ({
                      ...current,
                      [key]: event.target.value,
                    }));
                    setDirty(true);
                    setSaved(null);
                  }}
                  className="mt-2 block h-11 w-full rounded-lg border border-white/20 bg-slate-950 p-3 text-sm text-white disabled:opacity-50"
                />
              </label>
            ))}
          </div>
          <p className="mt-3 text-xs leading-6 text-slate-400">
            Growth is the total change over {project.input.horizonYears} years.
            People reserve does not specify equipment redundancy.
            Portfolio-derived demand must be changed through product allocation
            in the planner.
          </p>
          <button
            type="button"
            disabled={busy}
            onClick={() => void run()}
            className="mt-3 min-h-11 rounded-xl bg-teal-300 px-5 py-3 font-bold text-slate-950 disabled:opacity-50"
          >
            Compare assumptions
          </button>
          {dirty && (
            <p role="status" className="mt-3 text-sm text-amber-100">
              Assumptions changed. Compare again to refresh the results.
            </p>
          )}
          {ready && !dirty && !busy && (
            <>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {ready.comparison.metrics
                  .filter((m) =>
                    ["team-fte", "hands-on-hours", "area"].includes(m.id),
                  )
                  .map((metric) => (
                    <article
                      key={metric.id}
                      className="rounded-xl border border-white/15 p-4"
                    >
                      <h3 className="text-xs text-slate-300">
                        {metric.label} · planning horizon
                      </h3>
                      <p className="mt-2 text-lg font-bold">
                        {format(metric.baseline)} → {format(metric.alternative)}{" "}
                        {metric.unit === "count" ? "hours" : metric.unit}
                      </p>
                    </article>
                  ))}
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {(["capex", "opex"] as const).map((kind) => (
                  <article
                    key={kind}
                    className="rounded-xl border border-white/15 p-4"
                  >
                    <h3 className="text-xs text-slate-300">
                      {kind === "capex" ? "CAPEX" : "Annual OPEX"} concept band
                      · planning horizon
                    </h3>
                    <p className="mt-2 text-sm">
                      {usd(
                        kind === "capex"
                          ? ready.baseline.future.capexLowUsd
                          : ready.baseline.future.annualOpexLowUsd,
                      )}
                      –
                      {usd(
                        kind === "capex"
                          ? ready.baseline.future.capexHighUsd
                          : ready.baseline.future.annualOpexHighUsd,
                      )}
                    </p>
                    <p className="mt-1 text-sm text-teal-100">
                      →{" "}
                      {usd(
                        kind === "capex"
                          ? ready.scenario.future.capexLowUsd
                          : ready.scenario.future.annualOpexLowUsd,
                      )}
                      –
                      {usd(
                        kind === "capex"
                          ? ready.scenario.future.capexHighUsd
                          : ready.scenario.future.annualOpexHighUsd,
                      )}
                    </p>
                  </article>
                ))}
              </div>
              <h3 className="mt-5 font-bold">Equipment consequences</h3>
              {ready.equipmentChanges.length ? (
                <ul className="mt-2 space-y-2 text-sm">
                  {ready.equipmentChanges.map((change) => (
                    <li key={`${change.id}-${change.horizon}`}>
                      {change.name}: {change.before} → {change.after} units ·{" "}
                      {change.horizon === "current"
                        ? "current demand"
                        : "planning horizon"}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-slate-400">
                  No equipment quantity changes under these assumptions.
                </p>
              )}
              <section aria-label="Specialist consequences" className="mt-5">
                <h3 className="font-bold">Operational consequences</h3>
                <p className="mt-2 text-xs leading-6 text-slate-400">
                  Accepted operating assumptions are held fixed in both models.
                  Missing or stale bases are not replaced by invented site
                  facts.
                </p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {specialists.map((summary) => (
                    <article
                      key={summary.kind}
                      className="rounded-xl border border-white/15 p-4"
                    >
                      <h4 className="text-sm font-bold">
                        {SPECIALIST_LABELS[summary.kind]}
                      </h4>
                      {summary.status === "ready" ? (
                        <>
                          <p className="mt-2 text-sm">
                            {summary.before?.replaceAll("-", " ")} →{" "}
                            {summary.after?.replaceAll("-", " ")} ·{" "}
                            {summary.horizon === "future"
                              ? "planning horizon"
                              : "current demand"}
                          </p>
                          <ul className="mt-2 space-y-1 text-xs">
                            {summary.metrics?.map((metric) => (
                              <li key={metric.label}>
                                {metric.label}: {format(metric.before)} →{" "}
                                {format(metric.after)} {metric.unit}
                              </li>
                            ))}
                          </ul>
                        </>
                      ) : (
                        <p className="mt-2 text-sm text-amber-100">
                          {summary.status === "missing"
                            ? "Analysis basis needed"
                            : "Review the analysis basis"}
                        </p>
                      )}
                      <details className="mt-2 text-xs leading-6 text-slate-400">
                        <summary className="cursor-pointer">
                          Basis and limits
                        </summary>
                        <p>{summary.boundary}</p>
                      </details>
                      <Link
                        href={`/quality-lab/${summary.kind}?project=${project.id}`}
                        className="mt-2 inline-block py-2 text-xs text-teal-200 underline"
                      >
                        Review {SPECIALIST_LABELS[summary.kind].toLowerCase()}{" "}
                        basis
                      </Link>
                    </article>
                  ))}
                </div>
              </section>
              <details className="mt-5 text-sm">
                <summary className="cursor-pointer font-semibold">
                  What remains unresolved?
                </summary>
                <p className="mt-2 text-xs leading-6 text-slate-400">
                  Turnaround, installed-capacity sufficiency and shift coverage
                  require their specialist inputs; these are not inferred from
                  monthly averages.
                </p>
                <ul className="mt-3 space-y-2 text-xs leading-6 text-slate-300">
                  {ready.scenario.unresolvedInputs.map((item) => (
                    <li key={item.id}>
                      <strong>{item.question}</strong> {item.resolution}
                    </li>
                  ))}
                </ul>
              </details>
              <p className="mt-4 text-xs leading-6 text-slate-400">
                {ready.boundary}
              </p>
              <button
                type="button"
                disabled={
                  !!saved || !ready.comparison.comparisonIntegrity.exportAllowed
                }
                onClick={saveScenario}
                className="mt-3 min-h-11 rounded-xl border border-teal-300/30 px-4 py-3 text-sm font-bold disabled:opacity-50"
              >
                Save as separate browser scenario
              </button>
              {saved && (
                <Link
                  href={`/quality-lab/projects/${saved}`}
                  className="ml-3 inline-block py-3 text-sm text-teal-200 underline"
                >
                  Open saved scenario
                </Link>
              )}
            </>
          )}
          <details className="mt-5 text-sm">
            <summary className="cursor-pointer font-semibold">
              Continue with a specialist analysis
            </summary>
            <p className="mt-2 text-xs text-slate-400">
              These analyses open the saved baseline. Save and open the scenario
              first to analyze the changed basis.
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              {[
                ["sensitivity", "Robustness"],
                ["turnaround", "Turnaround"],
                ["operating-model", "Operating model"],
                ["equipment-resilience", "Equipment resilience"],
                ["non-routine-load", "Non-routine load"],
                ["skill-shift-coverage", "Skill / shift coverage"],
              ].map(([path, label]) => (
                <Link
                  key={path}
                  href={`/quality-lab/${path}?project=${project.id}`}
                  className="min-h-11 rounded-lg border border-white/15 px-3 py-3 text-xs text-teal-200"
                >
                  {label}
                </Link>
              ))}
            </div>
          </details>
        </>
      )}
    </section>
  );
}
