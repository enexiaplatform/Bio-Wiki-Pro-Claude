import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, ArrowRight, BarChart3, Building2, Copy, FileText, FlaskConical, Plus, Trash2 } from "lucide-react";
import type { QualityLabProject } from "@shared/quality-lab";
import { deleteQualityLabProject, duplicateQualityLabProject, listQualityLabProjects, subscribeToQualityLabProjects } from "@/lib/quality-lab-projects";
import { useSEO } from "@/hooks/use-seo";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 });

export default function QualityLabProjectsPage() {
  useSEO({ title: "Quality Lab Projects", description: "Saved Atlas Quality Lab Blueprint scenarios on this device." });
  const [, setLocation] = useLocation();
  const [projects, setProjects] = useState<QualityLabProject[]>([]);

  const refresh = () => setProjects(listQualityLabProjects());
  useEffect(() => {
    refresh();
    return subscribeToQualityLabProjects(refresh);
  }, []);

  function duplicate(id: string) {
    const copy = duplicateQualityLabProject(id);
    if (copy) setLocation(`/quality-lab/projects/${copy.id}`);
  }

  function remove(id: string, name: string) {
    if (!window.confirm(`Delete “${name}” from this browser?`)) return;
    deleteQualityLabProject(id);
    refresh();
  }

  return (
    <div className="min-h-screen bg-[#08111f] px-4 pb-24 pt-6 text-slate-100 md:pt-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link href="/quality-lab" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white"><ArrowLeft className="h-4 w-4" /> Quality Lab Blueprint</Link>
          <div className="flex flex-wrap gap-2"><Link href="/quality-lab/calibration" className="inline-flex items-center gap-2 rounded-xl border border-sky-300/20 bg-sky-300/[0.06] px-4 py-2.5 text-sm font-bold text-sky-200 transition hover:bg-sky-300/10"><BarChart3 className="h-4 w-4" /> Learning review queue</Link><Link href="/quality-lab/planner" className="inline-flex items-center gap-2 rounded-xl bg-teal-300 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-teal-200"><Plus className="h-4 w-4" /> New project</Link></div>
        </div>

        <header className="mb-6 rounded-3xl border border-teal-300/20 bg-gradient-to-br from-teal-300/10 via-white/[0.035] to-transparent p-6 md:p-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-300/10 text-teal-200"><FlaskConical className="h-5 w-5" /></div>
          <h1 className="mt-5 text-3xl font-bold md:text-5xl">Quality lab projects</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">Compare scenarios, revisit assumptions and export the underlying model. Projects in this concept edition stay in this browser.</p>
        </header>

        {projects.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.025] px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-slate-400"><FileText className="h-6 w-6" /></div>
            <h2 className="mt-5 text-xl font-bold">No blueprints yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Start with the example assumptions, replace them with your site data and compile the first scenario.</p>
            <Link href="/quality-lab/planner" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-teal-200">Build a blueprint <ArrowRight className="h-4 w-4" /></Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map((project) => (
              <article key={project.id} className="group rounded-2xl border border-white/10 bg-white/[0.035] p-5 transition hover:-translate-y-0.5 hover:border-teal-300/30 hover:bg-white/[0.05]">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-300/10 text-teal-200"><Building2 className="h-5 w-5" /></div>
                  <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-amber-200">Concept</span>
                </div>
                <h2 className="mt-5 text-xl font-bold">{project.name}</h2>
                <p className="mt-1 text-xs text-slate-500">{project.input.companyName || "Company not specified"} · {project.input.country} · Updated {new Date(project.updatedAt).toLocaleDateString()}</p>
                <div className="mt-5 grid grid-cols-3 gap-2">
                  <div className="rounded-xl border border-white/8 bg-slate-950/30 p-3"><p className="font-bold text-teal-200">{project.blueprint.current.monthlyTests}</p><p className="mt-1 text-[10px] text-slate-500">tests / month</p></div>
                  <div className="rounded-xl border border-white/8 bg-slate-950/30 p-3"><p className="font-bold text-teal-200">{project.blueprint.current.totalTeamFte}</p><p className="mt-1 text-[10px] text-slate-500">team FTE</p></div>
                  <div className="rounded-xl border border-white/8 bg-slate-950/30 p-3"><p className="font-bold text-teal-200">{money.format(project.blueprint.current.capexHighUsd)}</p><p className="mt-1 text-[10px] text-slate-500">CAPEX high</p></div>
                </div>
                <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/8 pt-4">
                  <div className="flex gap-1">
                    <button onClick={() => duplicate(project.id)} className="rounded-lg p-2 text-slate-500 transition hover:bg-white/5 hover:text-white" title="Duplicate scenario" aria-label={`Duplicate ${project.name}`}><Copy className="h-4 w-4" /></button>
                    <button onClick={() => remove(project.id, project.name)} className="rounded-lg p-2 text-slate-500 transition hover:bg-red-300/10 hover:text-red-200" title="Delete project" aria-label={`Delete ${project.name}`}><Trash2 className="h-4 w-4" /></button>
                  </div>
                  <Link href={`/quality-lab/projects/${project.id}`} className="inline-flex items-center gap-2 text-sm font-bold text-teal-300 transition group-hover:text-teal-200">Open blueprint <ArrowRight className="h-4 w-4" /></Link>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-6 flex items-start gap-3 rounded-xl border border-sky-300/15 bg-sky-300/5 p-4 text-xs leading-6 text-sky-100"><BarChart3 className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" />To compare two scenarios, duplicate a project and change one planning assumption at a time — for example growth, outsourcing or shift coverage.</div>
      </div>
    </div>
  );
}
