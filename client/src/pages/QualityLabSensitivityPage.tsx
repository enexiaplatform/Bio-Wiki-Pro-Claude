import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { Activity, AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Download, FileSearch, FlaskConical, Gauge, GitBranch, Info, PencilLine, ShieldAlert, Target, Wrench } from "lucide-react";
import { analyzeQualityLabSensitivity, type SensitivityDriver, type SensitivityMetric, type SensitivityMetricId, type SensitivityRobustnessClass, type SensitivityThreshold } from "@shared/quality-lab-sensitivity";
import type { QualityLabProject } from "@shared/quality-lab";
import { listQualityLabProjects } from "@/lib/quality-lab-projects";
import { useSEO } from "@/hooks/use-seo";
import { analytics } from "@/hooks/use-analytics";
import { DecisionTraceLink } from "@/components/quality-lab/DecisionLineagePanel";

const number = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 });

function queryProjectId() {
  return typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("project") ?? "";
}

function format(value: number, metric: SensitivityMetric) {
  if (metric.unit === "usd") return money.format(value);
  if (metric.unit === "fte") return `${number.format(value)} FTE`;
  if (metric.unit === "sqm") return `${number.format(value)} m²`;
  if (metric.unit === "percent") return `${number.format(value)}%`;
  return `${number.format(value)} h`;
}

function priorityStyle(priority: SensitivityDriver["verificationPriority"]) {
  if (priority === "critical") return { label: "Verify first", icon: ShieldAlert, className: "border-red-300/20 bg-red-300/[0.06] text-red-100", iconClass: "text-red-300" };
  if (priority === "high") return { label: "High priority", icon: AlertTriangle, className: "border-amber-300/20 bg-amber-300/[0.06] text-amber-100", iconClass: "text-amber-300" };
  return { label: "Confirm", icon: Info, className: "border-sky-300/20 bg-sky-300/[0.06] text-sky-100", iconClass: "text-sky-300" };
}

function robustnessStyle(value: SensitivityRobustnessClass) {
  if (value === "fragile-in-tested-range") return { label: "Fragile in tested range", className: "border-red-300/25 bg-red-300/[0.08] text-red-100" };
  if (value === "conditional-in-tested-range") return { label: "Conditional in tested range", className: "border-amber-300/25 bg-amber-300/[0.08] text-amber-100" };
  return { label: "Robust in tested range", className: "border-emerald-300/25 bg-emerald-300/[0.07] text-emerald-100" };
}

function thresholdLabel(threshold: SensitivityThreshold) {
  return `${number.format(threshold.inputValue)} ${threshold.inputUnit}`;
}

export default function QualityLabSensitivityPage() {
  useSEO({ title: "Sensitivity & Evidence Confidence", description: "Identify which Quality Lab Blueprint assumptions can change staffing, equipment, area and cost decisions, then prioritize the evidence needed to resolve them." });
  const [projects] = useState<QualityLabProject[]>(() => listQualityLabProjects());
  const [projectId, setProjectId] = useState(() => queryProjectId() || projects[0]?.id || "");
  const [metricId, setMetricId] = useState<SensitivityMetricId>("future-team-fte");
  const project = projects.find((item) => item.id === projectId);
  const analysis = useMemo(() => project ? analyzeQualityLabSensitivity(project) : null, [project]);
  const selectedMetric = analysis?.metrics.find((metric) => metric.id === metricId);
  const selectedLineage = project?.blueprint.decisionLineage.find((item) => item.outputKey === ({
    "future-team-fte": "future.totalTeamFte",
    "future-capex-high": "future.capexHighUsd",
    "future-opex-high": "future.annualOpexHighUsd",
    "future-area": "future.estimatedAreaSqm",
  } as Partial<Record<SensitivityMetricId, string>>)[metricId]);
  const displayedDrivers = useMemo(() => analysis ? [...analysis.drivers].sort((a, b) => {
    const aSwing = a.outcomes.find((outcome) => outcome.metricId === metricId)?.swingPercent ?? 0;
    const bSwing = b.outcomes.find((outcome) => outcome.metricId === metricId)?.swingPercent ?? 0;
    return bSwing - aSwing;
  }) : [], [analysis, metricId]);

  useEffect(() => {
    if (!analysis) return;
    const url = new URL(window.location.href);
    url.searchParams.set("project", analysis.project.id);
    window.history.replaceState({}, "", url);
    analytics.sensitivityAnalyzed(analysis.project.id, analysis.drivers.length, analysis.summary.decisionCriticalCount);
  }, [analysis?.project.id]);

  function exportAnalysis() {
    if (!analysis) return;
    const blob = new Blob([JSON.stringify(analysis, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "atlas-sensitivity-evidence-priority.json";
    anchor.click();
    URL.revokeObjectURL(url);
    analytics.sensitivityExported(analysis.summary.decisionCriticalCount, analysis.verificationQueue.length);
  }

  return (
    <div className="min-h-screen bg-[#07111f] px-4 pb-24 pt-6 text-slate-100 md:pt-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link href="/quality-lab/projects" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white"><ArrowLeft className="h-4 w-4" /> Quality lab projects</Link>
          <div className="flex flex-wrap gap-2">{analysis && <><Link href={`/quality-lab/equipment-resilience?project=${analysis.project.id}`} className="inline-flex items-center gap-2 rounded-xl border border-emerald-300/20 bg-emerald-300/[0.06] px-4 py-2.5 text-sm font-bold text-emerald-200"><Wrench className="h-4 w-4" /> Test equipment resilience</Link><button onClick={exportAnalysis} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-slate-200 hover:border-teal-300/30 hover:text-white"><Download className="h-4 w-4" /> Export evidence priority</button></>}</div>
        </div>

        <header className="rounded-3xl border border-violet-300/20 bg-gradient-to-br from-violet-300/10 via-white/[0.035] to-teal-300/[0.04] p-6 md:p-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-300/10 text-violet-200"><Activity className="h-5 w-5" /></div>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-violet-300">Atlas Intelligence</p>
          <h1 className="mt-2 text-3xl font-bold md:text-5xl">Sensitivity & Evidence Confidence</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">Stress one planning input at a time, see which outputs move, and turn uncertainty into an ordered evidence plan before design or budget decisions are frozen.</p>
        </header>

        {projects.length === 0 ? (
          <section className="mt-6 rounded-3xl border border-dashed border-white/15 bg-white/[0.025] px-6 py-16 text-center"><FlaskConical className="mx-auto h-8 w-8 text-slate-500" /><h2 className="mt-5 text-xl font-bold">A compiled Blueprint is required</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">Build a first project so Atlas can test its assumptions against the same executable Compiler Core.</p><Link href="/quality-lab/planner" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-300 px-5 py-3 text-sm font-bold text-slate-950">Build a blueprint <ArrowRight className="h-4 w-4" /></Link></section>
        ) : analysis && selectedMetric && project ? (
          <div className="mt-6 space-y-6">
            <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
              <label className="block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Blueprint project<select value={projectId} onChange={(event) => setProjectId(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-slate-950 px-4 text-sm font-semibold normal-case tracking-normal text-white outline-none focus:border-violet-300/40">{projects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            </section>

            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryCard label="Fragile drivers" value={String(analysis.summary.fragileDriverCount)} note="nearest threshold is close" tone="red" />
              <SummaryCard label="Conditional drivers" value={String(analysis.summary.conditionalDriverCount)} note="threshold found farther away" tone="amber" />
              <SummaryCard label="Robust drivers" value={String(analysis.summary.robustDriverCount)} note="no threshold in tested range" tone="teal" />
              <SummaryCard label="Open blocking inputs" value={String(analysis.summary.openBlockingInputCount)} note="still require evidence" tone="violet" />
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 md:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><SectionHeading icon={Gauge} title="Decision robustness map" description="The bar shows the tested output range. Open a driver to see the nearest input value that changes the selected decision." /><label className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Decision output<select value={metricId} onChange={(event) => setMetricId(event.target.value as SensitivityMetricId)} className="mt-2 h-11 w-full min-w-64 rounded-xl border border-white/10 bg-slate-950 px-3 text-sm font-semibold normal-case tracking-normal text-white">{analysis.metrics.map((metric) => <option key={metric.id} value={metric.id}>{metric.label}</option>)}</select></label></div>
              <div className="mt-6 rounded-xl border border-white/8 bg-slate-950/30 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><span className="text-xs text-slate-500">Current compiled result</span><strong className="text-lg text-white">{format(selectedMetric.baseline, selectedMetric)}</strong></div>{project && <div className="mt-2"><DecisionTraceLink projectId={project.id} lineage={selectedLineage} label="Trace the baseline decision" /></div>}</div>
              <div className="mt-5 space-y-3">{displayedDrivers.map((driver) => <SensitivityBar key={driver.id} driver={driver} metricId={metricId} project={project} />)}</div>
            </section>

            <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><SectionHeading icon={Target} title="What to confirm next" description="Fragile thresholds come first, followed by evidence priority and tested output movement." /><div className="mt-5 space-y-3">{analysis.verificationQueue.map((driver, index) => <VerificationCard key={driver.id} driver={driver} rank={index + 1} project={project} />)}</div></div>
              <div className="space-y-5">
                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><SectionHeading icon={FileSearch} title="Methodology" description="How to interpret this screen." /><ol className="mt-4 space-y-3">{analysis.methodology.map((item, index) => <li key={item} className="flex gap-3 text-xs leading-6 text-slate-400"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-300/10 font-bold text-violet-200">{index + 1}</span>{item}</li>)}</ol></div>
                <div className="rounded-2xl border border-teal-300/15 bg-teal-300/[0.04] p-5"><SectionHeading icon={CheckCircle2} title="Rule trace" description={`${analysis.ruleTrace[0].ruleId} · ${analysis.ruleTrace[0].ruleVersion}`} /><p className="mt-4 text-xs leading-6 text-teal-100/70">{analysis.ruleTrace[0].applicability}</p><p className="mt-3 text-xs leading-6 text-slate-500">{analysis.ruleTrace[0].limitations}</p></div>
              </div>
            </section>

            <div className="rounded-2xl border border-sky-300/15 bg-sky-300/[0.05] p-5 text-xs leading-6 text-sky-100"><Info className="mr-2 inline h-4 w-4 text-sky-300" />{analysis.boundary}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, note, tone }: { label: string; value: string; note: string; tone: "violet" | "red" | "amber" | "teal" }) {
  const tones = { violet: "text-violet-200", red: "text-red-200", amber: "text-amber-200", teal: "text-teal-200" };
  return <article className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"><p className="text-xs font-semibold text-slate-500">{label}</p><strong className={`mt-3 block text-xl ${tones[tone]}`}>{value}</strong><p className="mt-1 text-[10px] text-slate-600">{note}</p></article>;
}

function SensitivityBar({ driver, metricId, project }: { driver: SensitivityDriver; metricId: SensitivityMetricId; project: QualityLabProject }) {
  const outcome = driver.outcomes.find((item) => item.metricId === metricId)!;
  const max = Math.max(1, Math.abs(outcome.lowDeltaPercent), Math.abs(outcome.highDeltaPercent));
  const lowPosition = 50 + (outcome.lowDeltaPercent / max) * 48;
  const highPosition = 50 + (outcome.highDeltaPercent / max) * 48;
  const left = Math.min(lowPosition, highPosition);
  const width = Math.max(1.5, Math.abs(highPosition - lowPosition));
  const robustness = robustnessStyle(outcome.robustnessClass);
  const nearest = [...outcome.thresholds].sort((a, b) => a.distancePercentOfTestRange - b.distancePercentOfTestRange)[0];
  const lineage = nearest?.lineageIds.length ? project.blueprint.decisionLineage.find((item) => item.id === nearest.lineageIds[0]) : undefined;
  return <details className="group rounded-xl border border-white/8 bg-slate-950/25 p-4 open:border-violet-300/25 open:bg-violet-300/[0.035]"><summary onClick={() => nearest && analytics.sensitivityThresholdOpened(project.id, driver.id, metricId, nearest.direction)} className="cursor-pointer list-none"><div className="grid gap-3 md:grid-cols-[minmax(180px,0.8fr)_minmax(240px,1.35fr)_auto] md:items-center"><div><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-semibold text-slate-200">{driver.label}</p><span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${robustness.className}`}>{robustness.label}</span></div><p className="mt-1 text-[10px] text-slate-600">{number.format(driver.lowValue)} ↔ {number.format(driver.highValue)} {driver.unit}</p></div><div className="relative h-8 overflow-hidden rounded-lg border border-white/8 bg-slate-950/50"><div className="absolute inset-y-0 left-1/2 w-px bg-white/25" /><div className="absolute top-2 h-4 rounded bg-gradient-to-r from-sky-300/70 to-violet-300/80" style={{ left: `${left}%`, width: `${width}%` }} /></div><div className="flex items-center justify-between gap-3 md:justify-end"><span className="text-right text-xs font-bold text-violet-200">{outcome.lowDeltaPercent > 0 ? "+" : ""}{number.format(outcome.lowDeltaPercent)}% / {outcome.highDeltaPercent > 0 ? "+" : ""}{number.format(outcome.highDeltaPercent)}%</span><span className="text-slate-500 transition group-open:rotate-90">›</span></div></div></summary><div className="mt-4 grid gap-3 border-t border-white/8 pt-4 lg:grid-cols-[1fr_auto]"><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Decision-change criterion</p><p className="mt-1 text-xs leading-5 text-slate-300">{outcome.changeCriterion}</p>{nearest ? <div className="mt-3 rounded-lg border border-violet-300/20 bg-violet-300/[0.055] p-3"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-violet-200">Nearest threshold · {nearest.direction}</p><p className="mt-1 text-sm font-bold text-white">{thresholdLabel(nearest)}</p><p className="mt-1 text-xs leading-5 text-slate-400">{nearest.change}</p><p className="mt-1 text-[10px] text-slate-600">{number.format(nearest.distancePercentOfTestRange)}% of the way from baseline to the tested endpoint.</p></div> : <p className="mt-3 text-xs leading-5 text-emerald-200">No decision-change threshold was found inside this driver’s displayed test range.</p>}</div><div className="flex min-w-48 flex-col items-start gap-2 lg:items-end"><Link href={`/quality-lab/projects/${project.id}?edit=input&field=${driver.inputPath}#input-${driver.inputPath}`} onClick={() => analytics.sensitivityInputEditOpened(project.id, driver.id, driver.plannerStep)} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-200 hover:border-violet-300/30"><PencilLine className="h-3.5 w-3.5" /> Edit this input</Link>{lineage && <DecisionTraceLink projectId={project.id} lineage={lineage} label="Trace affected decision" />}</div></div></details>;
}

function VerificationCard({ driver, rank, project }: { driver: SensitivityDriver; rank: number; project: QualityLabProject }) {
  const style = priorityStyle(driver.verificationPriority); const Icon = style.icon;
  const robustness = robustnessStyle(driver.robustnessClass);
  const lineage = driver.nearestThreshold?.lineageIds.length ? project.blueprint.decisionLineage.find((item) => item.id === driver.nearestThreshold?.lineageIds[0]) : undefined;
  return <article className={`rounded-xl border p-4 ${style.className}`}><div className="flex items-start gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/15 text-xs font-bold">{rank}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-bold">{driver.label}</h3><span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${robustness.className}`}>{robustness.label}</span><span className="rounded-full border border-current/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider opacity-80">{style.label}</span></div><p className="mt-2 text-xs font-semibold leading-5">{driver.whatToConfirmNext}</p><p className="mt-2 text-xs leading-5 opacity-70">Evidence: {driver.evidenceNeeded}</p><div className="mt-3 flex flex-wrap items-center gap-3"><Link href={`/quality-lab/projects/${project.id}?edit=input&field=${driver.inputPath}#input-${driver.inputPath}`} onClick={() => analytics.sensitivityInputEditOpened(project.id, driver.id, driver.plannerStep)} className="inline-flex items-center gap-1.5 text-[11px] font-bold underline decoration-current/30 underline-offset-4"><PencilLine className="h-3.5 w-3.5" /> Edit input</Link>{lineage && <DecisionTraceLink projectId={project.id} lineage={lineage} label="Open lineage" />}{driver.lineageIds.length > 1 && <span className="inline-flex items-center gap-1 text-[10px] opacity-55"><GitBranch className="h-3.5 w-3.5" /> {driver.lineageIds.length} linked decisions</span>}</div>{driver.relatedUnresolvedInputIds.length > 0 && <p className="mt-2 font-mono text-[9px] opacity-45">Open: {driver.relatedUnresolvedInputIds.join(" · ")}</p>}</div><Icon className={`h-4 w-4 shrink-0 ${style.iconClass}`} /></div></article>;
}

function SectionHeading({ icon: Icon, title, description }: { icon: typeof Gauge; title: string; description: string }) {
  return <div className="flex items-start gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-300/10 text-violet-300"><Icon className="h-4 w-4" /></div><div><h2 className="text-lg font-bold text-white">{title}</h2><p className="mt-1 text-xs leading-5 text-slate-500">{description}</p></div></div>;
}
