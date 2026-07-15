import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  AlertTriangle, ArrowLeft, ArrowRight, CalendarClock, CheckCircle2, Clock3,
  Download, FlaskConical, Gauge, Info, ListChecks, ShieldAlert, Users,
} from "lucide-react";
import type { QualityLabProject } from "@shared/quality-lab";
import {
  defaultTurnaroundFeasibilityInput, evaluateTurnaroundFeasibility,
  type TurnaroundFeasibilityInput, type TurnaroundStatus,
} from "@shared/quality-lab-turnaround";
import { listQualityLabProjects } from "@/lib/quality-lab-projects";
import { useSEO } from "@/hooks/use-seo";
import { analytics } from "@/hooks/use-analytics";

const number = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

function initialProjectId() {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("project") ?? "";
}

function statusMeta(status: TurnaroundStatus) {
  if (status === "capacity-overload") return { label: "Capacity overload", className: "border-red-300/25 bg-red-300/10 text-red-100", icon: ShieldAlert };
  if (status === "concept-fail") return { label: "Target not demonstrated", className: "border-red-300/20 bg-red-300/[0.06] text-red-100", icon: AlertTriangle };
  if (status === "tight") return { label: "Tight planning margin", className: "border-amber-300/20 bg-amber-300/[0.06] text-amber-100", icon: AlertTriangle };
  return { label: "Concept screen passes", className: "border-teal-300/20 bg-teal-300/[0.06] text-teal-100", icon: CheckCircle2 };
}

export default function QualityLabTurnaroundPage() {
  useSEO({ title: "Turnaround & Queue Feasibility", description: "Screen whether a Quality Lab Blueprint has enough operational margin across execution, calendars, batching, handoffs and technical review." });
  const [projects] = useState<QualityLabProject[]>(() => listQualityLabProjects());
  const [projectId, setProjectId] = useState(() => initialProjectId() || projects[0]?.id || "");
  const project = projects.find((item) => item.id === projectId);
  const [input, setInput] = useState<TurnaroundFeasibilityInput | null>(() => project ? defaultTurnaroundFeasibilityInput(project) : null);

  useEffect(() => {
    if (!project) return;
    setInput(defaultTurnaroundFeasibilityInput(project));
    const url = new URL(window.location.href);
    url.searchParams.set("project", project.id);
    window.history.replaceState({}, "", url);
  }, [project?.id]);

  const result = useMemo(() => project && input ? evaluateTurnaroundFeasibility(project, input) : null, [project, input]);

  useEffect(() => {
    if (!result) return;
    analytics.turnaroundFeasibilityEvaluated(projectId, result.input.demandHorizon, result.overallStatus, result.workflows.length);
  }, [projectId, result?.input.demandHorizon, result?.overallStatus]);

  function patch<K extends keyof TurnaroundFeasibilityInput>(key: K, value: TurnaroundFeasibilityInput[K]) {
    setInput((current) => current ? { ...current, [key]: value } : current);
  }

  function exportTrace() {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "atlas-turnaround-feasibility-trace.json";
    anchor.click();
    URL.revokeObjectURL(url);
    analytics.turnaroundFeasibilityExported(result.overallStatus, result.signals.length);
  }

  return (
    <div className="min-h-screen bg-[#07111f] px-4 pb-24 pt-6 text-slate-100 md:pt-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link href="/quality-lab/projects" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white"><ArrowLeft className="h-4 w-4" /> Quality lab projects</Link>
          <div className="flex flex-wrap gap-2">{result && <><Link href={`/quality-lab/non-routine-load?project=${result.project.id}`} className="inline-flex items-center gap-2 rounded-xl border border-amber-300/20 bg-amber-300/[0.06] px-4 py-2.5 text-sm font-bold text-amber-200"><Users className="h-4 w-4" /> Model exception load</Link><button onClick={exportTrace} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-slate-200 hover:border-teal-300/30 hover:text-white"><Download className="h-4 w-4" /> Export feasibility trace</button></>}</div>
        </div>

        <header className="rounded-3xl border border-sky-300/20 bg-gradient-to-br from-sky-300/10 via-white/[0.035] to-teal-300/[0.05] p-6 md:p-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-300/10 text-sky-200"><CalendarClock className="h-5 w-5" /></div>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-sky-300">Operational feasibility</p>
          <h1 className="mt-2 text-3xl font-bold md:text-5xl">Turnaround & Queue Feasibility</h1>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-400">Monthly capacity can look sufficient while peaks, closed days, batching, handoffs or technical review still miss the release target. Screen those constraints explicitly before commissioning a detailed site simulation.</p>
        </header>

        {!project || !input || !result ? (
          <section className="mt-6 rounded-3xl border border-dashed border-white/15 bg-white/[0.025] px-6 py-16 text-center"><FlaskConical className="mx-auto h-8 w-8 text-slate-500" /><h2 className="mt-5 text-xl font-bold">A compiled Blueprint is required</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">Create a project first. Atlas uses its method demand, workflow durations and workforce model as the queue-screening basis.</p><Link href="/quality-lab/planner" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-300 px-5 py-3 text-sm font-bold text-slate-950">Build a Blueprint <ArrowRight className="h-4 w-4" /></Link></section>
        ) : (
          <div className="mt-6 space-y-6">
            <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 md:p-6">
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Blueprint project"><select value={projectId} onChange={(event) => setProjectId(event.target.value)} className={controlClass}>{projects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>
                <Field label="Demand horizon"><select value={input.demandHorizon} onChange={(event) => patch("demandHorizon", event.target.value as TurnaroundFeasibilityInput["demandHorizon"])} className={controlClass}><option value="current">Current demand</option><option value="future">Year {project.input.horizonYears} demand</option></select></Field>
                <NumberField label="Target turnaround" value={input.targetTurnaroundDays} suffix="days" min={1} max={60} step={0.5} onChange={(value) => patch("targetTurnaroundDays", value)} />
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="Arrival pattern"><select value={input.arrivalPattern} onChange={(event) => patch("arrivalPattern", event.target.value as TurnaroundFeasibilityInput["arrivalPattern"])} className={controlClass}><option value="level">Level flow</option><option value="weekday-loaded">Weekday loaded</option><option value="campaign">Campaign / batch peak</option></select></Field>
                <NumberField label="Execution calendar" value={input.executionDaysPerWeek} suffix="days/week" min={5} max={7} step={1} onChange={(value) => patch("executionDaysPerWeek", value)} />
                <NumberField label="Review calendar" value={input.reviewDaysPerWeek} suffix="days/week" min={5} max={7} step={1} onChange={(value) => patch("reviewDaysPerWeek", value)} />
                <NumberField label="Investigation reserve" value={input.investigationReservePercent} suffix="%" min={0} max={100} step={5} onChange={(value) => patch("investigationReservePercent", value)} />
                <NumberField label="Deployable analysts" value={input.analystFteAvailable} suffix="FTE" min={0.1} max={500} step={0.1} onChange={(value) => patch("analystFteAvailable", value)} />
                <NumberField label="Deployable reviewers" value={input.reviewerFteAvailable} suffix="FTE" min={0.1} max={100} step={0.1} onChange={(value) => patch("reviewerFteAvailable", value)} />
                <NumberField label="Review time per unit" value={input.reviewMinutesPerUnit} suffix="minutes" min={1} max={240} step={1} onChange={(value) => patch("reviewMinutesPerUnit", value)} />
                <NumberField label="Batching window" value={input.batchWindowHours} suffix="hours" min={0} max={72} step={1} onChange={(value) => patch("batchWindowHours", value)} />
                <NumberField label="Execution-to-review handoff" value={input.handoffHours} suffix="hours" min={0} max={72} step={1} onChange={(value) => patch("handoffHours", value)} />
              </div>
            </section>

            <section className="grid gap-3 md:grid-cols-3">
              <StatusCard status={result.overallStatus} />
              <LoadCard icon={Users} title="Execution load" demand={result.executionLoad.demandHoursPerMonth} capacity={result.executionLoad.capacityHoursPerMonth} utilization={result.executionLoad.utilizationPercent} queue={result.executionLoad.queueAllowanceDays} />
              <LoadCard icon={ListChecks} title="Technical review load" demand={result.reviewLoad.demandHoursPerMonth} capacity={result.reviewLoad.capacityHoursPerMonth} utilization={result.reviewLoad.utilizationPercent} queue={result.reviewLoad.queueAllowanceDays} />
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 md:p-6">
              <SectionHeading icon={Clock3} title="Workflow turnaround decomposition" description="The modeled result adds operational allowances to the Domain Pack technical duration. Red values do not demonstrate the selected target." />
              <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[1080px] text-left text-xs"><thead className="uppercase tracking-wider text-slate-600"><tr><th className="px-3 py-3">Workflow</th><th className="px-3 py-3 text-right">Technical</th><th className="px-3 py-3 text-right">Batch</th><th className="px-3 py-3 text-right">Exec queue</th><th className="px-3 py-3 text-right">Calendar</th><th className="px-3 py-3 text-right">Handoff</th><th className="px-3 py-3 text-right">Review queue</th><th className="px-3 py-3 text-right">Modeled</th><th className="px-3 py-3 text-right">Margin</th><th className="px-3 py-3 text-right">Status</th></tr></thead><tbody className="divide-y divide-white/8">{result.workflows.map((workflow) => { const meta = statusMeta(workflow.status); return <tr key={workflow.id} className="hover:bg-white/[0.02]"><td className="px-3 py-4"><p className="font-semibold text-slate-200">{workflow.label}</p><p className="mt-1 text-[10px] text-slate-600">{number.format(workflow.monthlyUnits)} units/month · {workflow.criticality}</p></td><Days value={workflow.technicalDurationDays} /><Days value={workflow.batchingDelayDays} /><Days value={workflow.executionQueueDays} /><Days value={workflow.executionCalendarExposureDays + workflow.reviewCalendarExposureDays} /><Days value={workflow.handoffDays} /><Days value={workflow.reviewQueueDays} /><td className="px-3 py-4 text-right font-bold text-white">{number.format(workflow.modeledTurnaroundDays)}d</td><td className={`px-3 py-4 text-right font-bold ${workflow.marginDays < 0 ? "text-red-300" : workflow.marginDays < 1 ? "text-amber-300" : "text-teal-300"}`}>{workflow.marginDays > 0 ? "+" : ""}{number.format(workflow.marginDays)}d</td><td className="px-3 py-4 text-right"><span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${meta.className}`}>{meta.label}</span></td></tr>; })}</tbody></table></div>
            </section>

            <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><SectionHeading icon={Gauge} title="Decision signals" description="Bottlenecks and margins generated from the selected operating assumptions." /><div className="mt-4 space-y-3">{result.signals.map((signal) => <Signal key={signal.id} signal={signal} />)}</div></div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><SectionHeading icon={Info} title="Evidence still required" description="Inputs needed before moving from screening to site schedule validation." /><ul className="mt-4 space-y-2">{result.unresolvedInputs.map((item) => <li key={item} className="flex items-start gap-2 text-xs leading-6 text-slate-400"><AlertTriangle className="mt-1 h-3.5 w-3.5 shrink-0 text-amber-300" />{item}</li>)}</ul></div>
            </section>

            <section className="grid gap-5 lg:grid-cols-2">
              <TracePanel title="Assumption register" rows={result.assumptions.map((item) => ({ title: item.value, detail: item.evidenceNeeded, meta: item.confidence }))} />
              <TracePanel title="Rule trace" rows={result.ruleTrace.map((item) => ({ title: item.ruleId, detail: `${item.role} ${item.limitation}`, meta: "review required" }))} />
            </section>
            <div className="rounded-2xl border border-sky-300/15 bg-sky-300/[0.05] p-5 text-xs leading-6 text-sky-100"><Info className="mr-2 inline h-4 w-4 text-sky-300" />{result.boundary}</div>
          </div>
        )}
      </div>
    </div>
  );
}

const controlClass = "mt-2 h-11 w-full rounded-xl border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none focus:border-teal-300/40";
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label><span className="text-xs font-semibold text-slate-400">{label}</span>{children}</label>; }
function NumberField({ label, value, suffix, min, max, step, onChange }: { label: string; value: number; suffix: string; min: number; max: number; step: number; onChange: (value: number) => void }) { return <Field label={label}><div className="relative"><input type="number" value={value} min={min} max={max} step={step} onChange={(event) => onChange(Math.min(max, Math.max(min, Number(event.target.value))))} className={`${controlClass} pr-20`} /><span className="pointer-events-none absolute right-3 top-1/2 mt-1 -translate-y-1/2 text-[10px] text-slate-600">{suffix}</span></div></Field>; }
function SectionHeading({ icon: Icon, title, description }: { icon: typeof Gauge; title: string; description: string }) { return <div className="flex items-start gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-300/10 text-sky-300"><Icon className="h-4 w-4" /></div><div><h2 className="text-lg font-bold text-white">{title}</h2><p className="mt-1 text-xs leading-5 text-slate-500">{description}</p></div></div>; }
function StatusCard({ status }: { status: TurnaroundStatus }) { const meta = statusMeta(status); const Icon = meta.icon; return <article className={`rounded-2xl border p-5 ${meta.className}`}><Icon className="h-5 w-5" /><p className="mt-4 text-xs font-bold uppercase tracking-wider opacity-60">Overall screen</p><strong className="mt-1 block text-xl">{meta.label}</strong><p className="mt-2 text-xs leading-5 opacity-70">Concept screening result; evidence and qualified review remain required.</p></article>; }
function LoadCard({ icon: Icon, title, demand, capacity, utilization, queue }: { icon: typeof Users; title: string; demand: number; capacity: number; utilization: number; queue: number }) { return <article className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><Icon className="h-5 w-5 text-teal-300" /><p className="mt-4 text-xs font-semibold text-slate-400">{title}</p><strong className={`mt-1 block text-2xl ${utilization >= 100 ? "text-red-300" : utilization >= 85 ? "text-amber-300" : "text-white"}`}>{number.format(utilization)}%</strong><p className="mt-2 text-xs text-slate-500">{number.format(demand)}h demand / {number.format(capacity)}h capacity</p><p className="mt-1 text-xs text-slate-500">Queue allowance: {number.format(queue)} days</p></article>; }
function Days({ value }: { value: number }) { return <td className="px-3 py-4 text-right text-slate-400">{number.format(value)}d</td>; }
function Signal({ signal }: { signal: ReturnType<typeof evaluateTurnaroundFeasibility>["signals"][number] }) { const style = signal.severity === "critical" ? "border-red-300/20 bg-red-300/[0.05] text-red-100" : signal.severity === "watch" ? "border-amber-300/20 bg-amber-300/[0.05] text-amber-100" : signal.severity === "positive" ? "border-teal-300/20 bg-teal-300/[0.05] text-teal-100" : "border-sky-300/20 bg-sky-300/[0.05] text-sky-100"; return <article className={`rounded-xl border p-4 ${style}`}><h3 className="text-sm font-bold">{signal.title}</h3><p className="mt-1 text-xs leading-6 opacity-70">{signal.description}</p>{signal.relatedRuleIds.length > 0 && <p className="mt-2 font-mono text-[10px] opacity-45">{signal.relatedRuleIds.join(" · ")}</p>}</article>; }
function TracePanel({ title, rows }: { title: string; rows: Array<{ title: string; detail: string; meta: string }> }) { return <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><h2 className="font-bold text-white">{title}</h2><div className="mt-4 space-y-2">{rows.map((row, index) => <article key={`${row.title}-${index}`} className="rounded-xl border border-white/8 bg-slate-950/30 p-3"><div className="flex items-start justify-between gap-3"><p className="text-sm font-semibold text-slate-300">{row.title}</p><span className="shrink-0 text-[9px] uppercase tracking-wider text-slate-600">{row.meta}</span></div><p className="mt-1 text-xs leading-5 text-slate-500">{row.detail}</p></article>)}</div></section>; }
