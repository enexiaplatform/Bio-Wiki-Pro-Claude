import { useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, Boxes, Crown, Download, FlaskConical, Gauge, LockKeyhole, Save, ShieldCheck } from "lucide-react";
import { compileQualityLabBlueprint, type QualityLabProject } from "@shared/quality-lab";
import { useUser } from "@/context/UserContext";
import { analytics, capture } from "@/hooks/use-analytics";
import { useSEO } from "@/hooks/use-seo";
import { listQualityLabProjects, saveQualityLabProject } from "@/lib/quality-lab-projects";

function csvCell(value: unknown) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function downloadWorkbenchCsv(project: QualityLabProject, blueprint: ReturnType<typeof compileQualityLabBlueprint>) {
  const rows: unknown[][] = [
    ["section", "id", "name", "unit", "current", "supporting_value", "status_or_basis"],
    ...blueprint.workflows.map((row) => ["workflow-demand", row.id, row.label, "monthly units", row.monthlyUnits, `${row.monthlyHandsOnHours} hands-on hours`, row.basis]),
    ...blueprint.methodCapacitySummary.map((row) => ["resource-capacity", row.resourceId, row.resourceName, row.unit, row.monthlyDemand, `${row.utilizationPercent}% utilization`, row.limitations]),
    ...(blueprint.consumableSupply?.current ?? []).map((row) => ["consumable-supply", row.id, row.name, row.unit, row.grossMonthlyDemand, `reorder ${row.reorderPoint}; target ${row.targetStock}`, row.status]),
  ];
  const url = URL.createObjectURL(new Blob([rows.map((row) => row.map(csvCell).join(",")).join("\r\n") + "\r\n"], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${project.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "atlas"}-lab-workbench.csv`;
  document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
}

function ProjectWorkbench({ initialProjects }: { initialProjects: QualityLabProject[] }) {
  const [projects, setProjects] = useState(initialProjects);
  const [projectId, setProjectId] = useState(initialProjects[0]?.id ?? "");
  const selected = projects.find((project) => project.id === projectId) ?? projects[0];
  const [wastePercent, setWastePercent] = useState(selected?.input.consumableWastePercent ?? 10);
  const [leadTimeDays, setLeadTimeDays] = useState(selected?.input.consumableLeadTimeDays ?? 45);
  const [safetyStockDays, setSafetyStockDays] = useState(selected?.input.consumableSafetyStockDays ?? 30);
  const [notice, setNotice] = useState("");

  const blueprint = useMemo(() => selected ? compileQualityLabBlueprint({ ...selected.input, consumableWastePercent: wastePercent, consumableLeadTimeDays: leadTimeDays, consumableSafetyStockDays: safetyStockDays }) : null, [leadTimeDays, safetyStockDays, selected, wastePercent]);

  function chooseProject(id: string) {
    const project = projects.find((candidate) => candidate.id === id);
    if (!project) return;
    setProjectId(id); setWastePercent(project.input.consumableWastePercent); setLeadTimeDays(project.input.consumableLeadTimeDays); setSafetyStockDays(project.input.consumableSafetyStockDays); setNotice("");
    capture("pro_lab_workbench_project_selected", { project_id: id });
  }

  function saveAssumptions() {
    if (!selected) return;
    const saved = saveQualityLabProject({ ...selected.input, consumableWastePercent: wastePercent, consumableLeadTimeDays: leadTimeDays, consumableSafetyStockDays: safetyStockDays }, selected.id);
    setProjects(listQualityLabProjects());
    setNotice("Supply assumptions saved through the Blueprint compiler as a new local revision.");
    capture("pro_lab_workbench_assumptions_saved", { project_id: saved.id, waste_percent: wastePercent, lead_time_days: leadTimeDays, safety_stock_days: safetyStockDays });
  }

  if (!selected || !blueprint) return <section className="rounded-3xl border border-dashed border-sky-300/25 bg-sky-300/[0.04] p-8 text-center"><FlaskConical className="mx-auto h-8 w-8 text-sky-300" /><h2 className="mt-4 text-2xl font-bold">Start with a Blueprint basis</h2><p className="mx-auto mt-2 max-w-2xl text-sm leading-7 text-slate-400">The workbench deliberately does not create a disconnected calculator record. Compile a project first so demand, resource load and supply assumptions share the same versioned model.</p><Link href="/quality-lab/planner?source=pro-lab-workbench" onClick={() => analytics.blueprintStarted("pro_lab_workbench")} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-sky-300 px-5 py-3 text-sm font-bold text-slate-950">Create Blueprint <ArrowRight className="h-4 w-4" /></Link></section>;

  const totalHours = blueprint.workflows.reduce((sum, row) => sum + row.monthlyHandsOnHours, 0);
  const totalPlateDays = blueprint.workflows.reduce((sum, row) => sum + row.monthlyPlateDays, 0);
  const highCapacity = blueprint.methodCapacitySummary.filter((row) => row.utilizationPercent >= 70);

  return <>
    <section className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 md:grid-cols-[1fr_auto]"><label className="text-xs font-bold text-slate-300">Blueprint basis<select value={selected.id} onChange={(event) => chooseProject(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-[#0a1a2c] px-3 text-sm font-semibold outline-none focus:border-sky-300/40">{projects.map((project) => <option key={project.id} value={project.id}>{project.name} · {project.input.scenarioLabel}</option>)}</select></label><div className="flex items-end gap-2"><Link href={`/quality-lab/projects/${selected.id}`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-xs font-bold">Open Blueprint <ArrowRight className="h-4 w-4" /></Link><button type="button" onClick={() => { downloadWorkbenchCsv(selected, blueprint); capture("pro_lab_workbench_exported", { project_id: selected.id }); }} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-xs font-bold"><Download className="h-4 w-4" /> Export</button></div></section>

    <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">{[[blueprint.current.monthlyTests, "Monthly test units"], [Math.round(totalHours), "Hands-on hours"], [Math.round(totalPlateDays), "Plate-days"], [highCapacity.length, "Capacity signals ≥70%"]].map(([value, label]) => <div key={label} className="rounded-2xl border border-white/10 bg-black/15 p-4"><p className="text-2xl font-bold text-sky-200">{value}</p><p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">{label}</p></div>)}</section>

    <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 md:p-6"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300">Daily view 1</p><h2 className="mt-2 text-xl font-bold">Test demand pulse</h2></div><Gauge className="h-6 w-6 text-teal-300" /></div><p className="mt-2 text-xs leading-6 text-slate-500">One shared view of compiled workload. It is a monthly capacity basis, not a sample schedule or result log.</p><div className="mt-5 space-y-2">{blueprint.workflows.map((row) => <div key={row.id} className="rounded-xl border border-white/8 bg-black/15 p-3"><div className="flex items-center justify-between gap-3"><p className="text-xs font-bold text-slate-200">{row.label}</p><span className="text-xs font-bold text-teal-200">{row.monthlyUnits.toLocaleString()} units</span></div><div className="mt-2 grid grid-cols-3 gap-2 text-[10px] text-slate-500"><span>{row.monthlyHandsOnHours} h</span><span>{row.monthlyPlateDays} plate-days</span><span>{row.monthlyMediaLiters} L media</span></div></div>)}</div></section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 md:p-6"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-300">Daily view 2</p><h2 className="mt-2 text-xl font-bold">Method resource load</h2></div><FlaskConical className="h-6 w-6 text-sky-300" /></div><p className="mt-2 text-xs leading-6 text-slate-500">Method-derived demand is shown only where product/application records exist. Broad workflow allowances are not silently converted into method evidence.</p>{blueprint.methodCapacitySummary.length === 0 ? <p className="mt-5 rounded-xl border border-dashed border-amber-300/20 p-5 text-xs leading-6 text-amber-200/80">No product-level method capacity is compiled. Add product profiles and physical test-allocation decisions in the Blueprint.</p> : <div className="mt-5 grid gap-3 sm:grid-cols-2">{blueprint.methodCapacitySummary.map((row) => <article key={row.resourceId} className="rounded-xl border border-white/8 bg-black/15 p-4"><div className="flex items-center justify-between gap-2"><p className="text-xs font-bold text-slate-200">{row.resourceName}</p><span className={`rounded-full border px-2 py-1 text-[9px] font-bold ${row.utilizationPercent >= 70 ? "border-amber-300/25 text-amber-200" : "border-teal-300/20 text-teal-200"}`}>{row.utilizationPercent}%</span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className={`h-full rounded-full ${row.utilizationPercent >= 70 ? "bg-amber-300" : "bg-teal-300"}`} style={{ width: `${Math.min(100, row.utilizationPercent)}%` }} /></div><p className="mt-3 text-[10px] leading-5 text-slate-500">{row.monthlyDemand} {row.unit} demand · {row.availableMonthlyCapacity} available</p></article>)}</div>}</section>
    </div>

    <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.035] p-5 md:p-6"><div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300">Daily view 3</p><h2 className="mt-2 text-xl font-bold">Consumable replenishment scenario</h2><p className="mt-2 max-w-3xl text-xs leading-6 text-slate-500">Adjust three planning assumptions and recompile through the same Blueprint logic. These values do not establish purchase quantities, qualified suppliers, shelf life or storage acceptance.</p></div><Boxes className="h-6 w-6 shrink-0 text-amber-300" /></div><div className="mt-5 grid gap-3 sm:grid-cols-3">{[
      { label: "Waste allowance (%)", value: wastePercent, min: 0, max: 50, set: setWastePercent },
      { label: "Lead time (days)", value: leadTimeDays, min: 1, max: 365, set: setLeadTimeDays },
      { label: "Safety stock (days)", value: safetyStockDays, min: 0, max: 365, set: setSafetyStockDays },
    ].map((field) => <label key={field.label} className="text-xs font-bold text-slate-300">{field.label}<input type="number" min={field.min} max={field.max} value={field.value} onChange={(event) => field.set(Math.max(field.min, Math.min(field.max, Number(event.target.value) || 0)))} className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-base outline-none focus:border-amber-300/40" /></label>)}</div><div className="mt-5 overflow-x-auto"><table className="min-w-[720px] w-full text-left text-xs"><thead className="text-[9px] uppercase tracking-wider text-slate-600"><tr><th className="pb-3">Supply class</th><th className="pb-3">Gross/month</th><th className="pb-3">Reorder point</th><th className="pb-3">Safety stock</th><th className="pb-3">Target stock</th><th className="pb-3">Status</th></tr></thead><tbody>{(blueprint.consumableSupply?.current ?? []).map((row) => <tr key={row.id} className="border-t border-white/8"><td className="py-3 font-bold text-slate-200">{row.name}</td><td className="py-3 text-slate-400">{row.grossMonthlyDemand} {row.unit}</td><td className="py-3 text-slate-400">{row.reorderPoint}</td><td className="py-3 text-slate-400">{row.safetyStock}</td><td className="py-3 font-bold text-amber-200">{row.targetStock}</td><td className="py-3 text-[9px] uppercase text-slate-600">Concept basis</td></tr>)}</tbody></table></div><div className="mt-5 flex flex-wrap items-center gap-3"><button type="button" onClick={saveAssumptions} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-amber-300 px-5 py-3 text-sm font-bold text-slate-950"><Save className="h-4 w-4" /> Save to Blueprint revision</button>{notice && <p role="status" className="text-xs leading-5 text-slate-400">{notice}</p>}</div></section>
  </>;
}

export default function ProLabWorkbenchPage() {
  const { isPro, isLoading } = useUser();
  const projects = useMemo(() => listQualityLabProjects(), []);
  useSEO({ title: "Atlas Pro Lab Workbench", description: "Use a mobile-first Blueprint companion for test demand, method resource load and consumable replenishment scenarios." });
  if (isLoading) return <div className="min-h-[70vh] bg-[#07182d]" />;
  return <div className="min-h-screen bg-[#07182d] px-4 pb-24 pt-8 text-slate-100 md:pt-14"><div className="mx-auto max-w-7xl"><header className="rounded-3xl border border-amber-300/20 bg-gradient-to-br from-amber-300/10 via-slate-950 to-sky-300/5 p-6 md:p-9"><div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"><div><p className="inline-flex items-center gap-2 rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200"><Crown className="h-4 w-4" /> Atlas Pro · Blueprint companion</p><h1 className="mt-5 max-w-4xl text-4xl font-bold leading-tight md:text-6xl">One mobile workbench. One Blueprint basis.</h1><p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400">Review recurring demand, method-derived resource load and consumable supply assumptions without creating a disconnected lab record or replacing LIMS, SOPs or the site quality system.</p></div><div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-xs leading-6 text-slate-400"><ShieldCheck className="mr-2 inline h-4 w-4 text-teal-300" />Planning support only · no sample/results management · no pass/fail or compliance decision.</div></div></header>{isPro ? <ProjectWorkbench initialProjects={projects} /> : <section className="mt-6 grid gap-6 lg:grid-cols-[0.75fr_1.25fr]"><div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6"><LockKeyhole className="h-7 w-7 text-amber-300" /><h2 className="mt-4 text-2xl font-bold">Included with Atlas Pro</h2><p className="mt-3 text-sm leading-7 text-slate-400">The public calculators remain free. Pro adds the durable value: a shared Blueprint basis, saved assumptions, local revision history and exportable operational views.</p><Link href="/pricing#evidence-plans" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-amber-300 px-5 py-3 text-sm font-bold text-slate-950">Start Pro <ArrowRight className="h-4 w-4" /></Link></div><div className="pointer-events-none select-none opacity-55"><ProjectWorkbench initialProjects={projects} /></div></section>}</div></div>;
}
