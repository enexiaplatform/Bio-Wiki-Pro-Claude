import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  Activity, AlertTriangle, ArrowLeft, ArrowRight, BarChart3, CheckCircle2, Download,
  CalendarClock, FlaskConical, Gauge, GitCompareArrows, Info, ShieldAlert, SlidersHorizontal,
} from "lucide-react";
import { compareQualityLabScenarios, type ComparisonSignalSeverity, type ScenarioComparisonMetric } from "@shared/quality-lab-comparison";
import type { QualityLabProject } from "@shared/quality-lab";
import { listQualityLabProjects } from "@/lib/quality-lab-projects";
import { useSEO } from "@/hooks/use-seo";
import { analytics } from "@/hooks/use-analytics";

const number = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 });

function initialId(key: string): string {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get(key) ?? "";
}

function formatMetric(value: number, unit: ScenarioComparisonMetric["unit"]): string {
  if (unit === "usd") return money.format(value);
  if (unit === "fte") return `${number.format(value)} FTE`;
  if (unit === "sqm") return `${number.format(value)} m²`;
  if (unit === "percent") return `${number.format(value)}%`;
  return number.format(value);
}

function signalStyle(severity: ComparisonSignalSeverity) {
  if (severity === "critical") return { icon: ShieldAlert, className: "border-red-300/20 bg-red-300/[0.06] text-red-100", iconClass: "text-red-300" };
  if (severity === "watch") return { icon: AlertTriangle, className: "border-amber-300/20 bg-amber-300/[0.06] text-amber-100", iconClass: "text-amber-300" };
  if (severity === "positive") return { icon: CheckCircle2, className: "border-teal-300/20 bg-teal-300/[0.06] text-teal-100", iconClass: "text-teal-300" };
  return { icon: Info, className: "border-sky-300/20 bg-sky-300/[0.06] text-sky-100", iconClass: "text-sky-300" };
}

export default function QualityLabScenarioComparePage() {
  useSEO({ title: "Scenario Decision Studio", description: "Compare two Atlas Quality Lab Blueprints and expose the assumptions, capacity pressures and commercial consequences behind the difference." });
  const [projects] = useState<QualityLabProject[]>(() => listQualityLabProjects());
  const [baselineId, setBaselineId] = useState(() => initialId("baseline") || projects[0]?.id || "");
  const [alternativeId, setAlternativeId] = useState(() => initialId("alternative") || projects.find((project) => project.id !== (initialId("baseline") || projects[0]?.id))?.id || "");
  const baseline = projects.find((project) => project.id === baselineId);
  const alternative = projects.find((project) => project.id === alternativeId);
  const comparison = useMemo(() => baseline && alternative && baseline.id !== alternative.id ? compareQualityLabScenarios(baseline, alternative) : null, [baseline, alternative]);

  useEffect(() => {
    if (!comparison || !comparison.comparisonIntegrity.exportAllowed) return;
    const url = new URL(window.location.href);
    url.searchParams.set("baseline", comparison.baseline.id);
    url.searchParams.set("alternative", comparison.alternative.id);
    window.history.replaceState({}, "", url);
    analytics.scenarioCompared(comparison.baseline.id, comparison.alternative.id, comparison.inputChanges.length);
  }, [comparison?.baseline.id, comparison?.alternative.id]);

  function exportComparison() {
    if (!comparison) return;
    const blob = new Blob([JSON.stringify(comparison, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "atlas-scenario-decision-comparison.json";
    anchor.click();
    URL.revokeObjectURL(url);
    analytics.scenarioComparisonExported(comparison.signals.length);
  }

  return (
    <div className="min-h-screen bg-[#07111f] px-4 pb-24 pt-6 text-slate-100 md:pt-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link href="/quality-lab/projects" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white"><ArrowLeft className="h-4 w-4" /> Quality lab projects</Link>
          <div className="flex flex-wrap gap-2">{baseline && <><Link href={`/quality-lab/sensitivity?project=${baseline.id}`} className="inline-flex items-center gap-2 rounded-xl border border-violet-300/20 bg-violet-300/[0.06] px-4 py-2.5 text-sm font-bold text-violet-200"><Activity className="h-4 w-4" /> Test sensitivity</Link><Link href={`/quality-lab/turnaround?project=${baseline.id}`} className="inline-flex items-center gap-2 rounded-xl border border-sky-300/20 bg-sky-300/[0.06] px-4 py-2.5 text-sm font-bold text-sky-200"><CalendarClock className="h-4 w-4" /> Test queue feasibility</Link></>}{comparison && <button onClick={exportComparison} disabled={!comparison.comparisonIntegrity.exportAllowed} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-slate-200 hover:border-teal-300/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"><Download className="h-4 w-4" /> Export decision trace</button>}</div>
        </div>

        <header className="rounded-3xl border border-teal-300/20 bg-gradient-to-br from-teal-300/10 via-white/[0.035] to-sky-300/[0.04] p-6 md:p-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-300/10 text-teal-200"><GitCompareArrows className="h-5 w-5" /></div>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-teal-300">Atlas Intelligence</p>
          <h1 className="mt-2 text-3xl font-bold md:text-5xl">Scenario Decision Studio</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">Compare two compiled Blueprints and trace which planning assumptions change workload, people, equipment, space and cost. Signals identify decisions that require evidence or expert review.</p>
        </header>

        {projects.length < 2 ? (
          <section className="mt-6 rounded-3xl border border-dashed border-white/15 bg-white/[0.025] px-6 py-16 text-center">
            <FlaskConical className="mx-auto h-8 w-8 text-slate-500" />
            <h2 className="mt-5 text-xl font-bold">Two scenarios are required</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">Create a Blueprint, duplicate it, then change one or more operating assumptions such as growth, outsourcing, shifts, downtime or redundancy.</p>
            <Link href="/quality-lab/projects" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-300 px-5 py-3 text-sm font-bold text-slate-950">Open projects <ArrowRight className="h-4 w-4" /></Link>
          </section>
        ) : (
          <>
            <section className="mt-6 grid gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-5 md:grid-cols-[1fr_auto_1fr] md:items-end">
              <ScenarioSelector label="Baseline" value={baselineId} projects={projects} onChange={setBaselineId} />
              <GitCompareArrows className="mx-auto mb-3 hidden h-5 w-5 text-slate-600 md:block" />
              <ScenarioSelector label="Alternative" value={alternativeId} projects={projects} onChange={setAlternativeId} />
            </section>

            {!comparison ? (
              <div className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-300/[0.05] p-5 text-sm text-amber-100">Select two different projects to build a decision comparison.</div>
            ) : (
              <div className="mt-6 space-y-6">
                {!comparison.engineVersions.comparable && <div className="rounded-2xl border border-red-300/20 bg-red-300/[0.06] p-5 text-sm text-red-100"><ShieldAlert className="mr-2 inline h-4 w-4" />These scenarios use different engine versions. Recompile both before relying on their deltas.</div>}
                {comparison.comparisonIntegrity.status !== "valid" && <div className="rounded-2xl border border-red-300/20 bg-red-300/[0.06] p-5 text-sm text-red-100"><ShieldAlert className="mr-2 inline h-4 w-4" />{comparison.comparisonIntegrity.message}</div>}
                <section>
                  <SectionHeading icon={BarChart3} title="Decision deltas" description={`Planning-horizon comparison: ${comparison.baseline.horizonYears} years versus ${comparison.alternative.horizonYears} years.`} />
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{comparison.metrics.map((item) => <MetricDelta key={item.id} metric={item} />)}</div>
                </section>

                <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                    <SectionHeading icon={SlidersHorizontal} title="Changed assumptions" description="Controlled numeric, scope, market, portfolio, evidence and version differences." />
                    <div className="mt-4 space-y-2">
                      {comparison.inputChanges.map((item) => <div key={item.id} className="grid grid-cols-[1fr_auto] gap-4 rounded-xl border border-white/8 bg-slate-950/30 p-3"><div><p className="text-sm font-semibold text-slate-200">{item.label}</p><p className="mt-1 text-xs text-slate-500">{number.format(item.baseline)} to {number.format(item.alternative)} {item.unit}</p></div><span className={`self-center text-sm font-bold ${item.delta > 0 ? "text-amber-200" : "text-teal-200"}`}>{item.delta > 0 ? "+" : ""}{number.format(item.delta)}</span></div>)}
                      {comparison.normalizedInputChanges.map((item) => <div key={item.id} className="rounded-xl border border-white/8 bg-slate-950/30 p-3"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-semibold text-slate-200">{item.label}</p><span className="rounded-full border border-white/10 px-2 py-0.5 text-[9px] font-bold uppercase text-slate-500">{item.category}</span></div><p className="mt-1 line-clamp-2 text-xs text-slate-500">{item.baseline} to {item.alternative}</p>{item.relatedRuleIds.length > 0 && <p className="mt-2 font-mono text-[10px] text-sky-200/50">{item.relatedRuleIds.join(" · ")}</p>}</div>)}
                      {comparison.inputChanges.length === 0 && comparison.normalizedInputChanges.length === 0 && <Empty text="No controlled input or version difference found." />}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                    <SectionHeading icon={Gauge} title="Decision signals" description="Rule-linked consequences that deserve review before selecting a scenario." />
                    <div className="mt-4 space-y-3">{comparison.signals.map((signal) => { const style = signalStyle(signal.severity); const Icon = style.icon; return <article key={signal.id} className={`rounded-xl border p-4 ${style.className}`}><div className="flex items-start gap-3"><Icon className={`mt-0.5 h-4 w-4 shrink-0 ${style.iconClass}`} /><div><h3 className="text-sm font-bold">{signal.title}</h3><p className="mt-1 text-xs leading-6 opacity-75">{signal.description}</p>{signal.relatedRuleIds.length > 0 && <p className="mt-2 font-mono text-[10px] opacity-50">{signal.relatedRuleIds.join(" · ")}</p>}</div></div></article>; })}</div>
                  </div>
                </section>

                <section className="grid gap-5 lg:grid-cols-2">
                  <ChangeTable title="Equipment quantity changes" empty="No equipment quantity change at the planning horizon." rows={comparison.equipmentChanges.map((item) => ({ label: item.name, before: item.baselineQuantity, after: item.alternativeQuantity, delta: item.delta }))} />
                  <ChangeTable title="Method-derived capacity pressure" empty="No tracked capacity delta or planning trigger." suffix="%" rows={comparison.capacityChanges.map((item) => ({ label: item.name, before: item.baselineUtilization, after: item.alternativeUtilization, delta: item.delta }))} />
                </section>

                <div className="rounded-2xl border border-sky-300/15 bg-sky-300/[0.05] p-5 text-xs leading-6 text-sky-100"><Info className="mr-2 inline h-4 w-4 text-sky-300" />{comparison.boundary}</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ScenarioSelector({ label, value, projects, onChange }: { label: string; value: string; projects: QualityLabProject[]; onChange: (value: string) => void }) {
  return <label><span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-slate-950 px-4 text-sm font-semibold text-white outline-none focus:border-teal-300/40">{projects.map((project) => <option key={project.id} value={project.id}>{project.input.scenarioLabel} - {project.name}</option>)}</select></label>;
}

function SectionHeading({ icon: Icon, title, description }: { icon: typeof Gauge; title: string; description: string }) {
  return <div className="flex items-start gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-300/10 text-teal-300"><Icon className="h-4 w-4" /></div><div><h2 className="text-lg font-bold text-white">{title}</h2><p className="mt-1 text-xs leading-5 text-slate-500">{description}</p></div></div>;
}

function MetricDelta({ metric }: { metric: ScenarioComparisonMetric }) {
  const deltaLabel = metric.delta === 0 ? "No change" : `${metric.delta > 0 ? "+" : ""}${formatMetric(metric.delta, metric.unit)}${metric.percentChange === null ? "" : ` (${metric.percentChange > 0 ? "+" : ""}${metric.percentChange}%)`}`;
  return <article className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"><p className="text-xs font-semibold text-slate-400">{metric.label}</p><div className="mt-4 grid grid-cols-2 gap-2"><div><span className="text-[10px] uppercase tracking-wider text-slate-600">Baseline</span><strong className="mt-1 block text-lg text-slate-200">{formatMetric(metric.baseline, metric.unit)}</strong></div><div><span className="text-[10px] uppercase tracking-wider text-teal-500">Alternative</span><strong className="mt-1 block text-lg text-teal-200">{formatMetric(metric.alternative, metric.unit)}</strong></div></div><p className={`mt-3 border-t border-white/8 pt-3 text-xs font-bold ${metric.delta === 0 ? "text-slate-500" : metric.delta > 0 ? "text-amber-200" : "text-teal-200"}`}>{deltaLabel}</p></article>;
}

function ChangeTable({ title, rows, empty, suffix = "" }: { title: string; rows: Array<{ label: string; before: number; after: number; delta: number }>; empty: string; suffix?: string }) {
  return <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><h2 className="font-bold text-white">{title}</h2>{rows.length ? <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-[10px] uppercase tracking-wider text-slate-600"><tr><th className="py-2">Resource</th><th className="py-2 text-right">Baseline</th><th className="py-2 text-right">Alternative</th><th className="py-2 text-right">Delta</th></tr></thead><tbody className="divide-y divide-white/8">{rows.map((row) => <tr key={row.label}><td className="py-3 pr-3 font-semibold text-slate-300">{row.label}</td><td className="py-3 text-right text-slate-500">{number.format(row.before)}{suffix}</td><td className="py-3 text-right text-slate-200">{number.format(row.after)}{suffix}</td><td className={`py-3 text-right font-bold ${row.delta > 0 ? "text-amber-200" : "text-teal-200"}`}>{row.delta > 0 ? "+" : ""}{number.format(row.delta)}{suffix}</td></tr>)}</tbody></table></div> : <Empty text={empty} />}</section>;
}

function Empty({ text }: { text: string }) { return <p className="mt-4 rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-slate-600">{text}</p>; }
