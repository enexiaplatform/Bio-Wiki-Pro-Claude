import { useEffect, useMemo } from "react";
import { ArrowLeft, FlaskConical, GitBranch } from "lucide-react";
import { Link, useRoute } from "wouter";
import { getQualityLabProject } from "@/lib/quality-lab-projects";
import { loadQualityLabOperatingModelInput } from "@/lib/quality-lab-operating-model";
import { analyzeQualityLabOperatingModel } from "@shared/quality-lab-operating-model";
import { DecisionLineagePanel } from "@/components/quality-lab/DecisionLineagePanel";
import { analytics } from "@/hooks/use-analytics";
import { useSEO } from "@/hooks/use-seo";
import { DecisionPackageContextCard } from "@/components/DecisionPackageContextCard";

function decoded(value?: string) {
  if (!value) return "";
  try { return decodeURIComponent(value); } catch { return value; }
}

export default function QualityLabDecisionLineagePage() {
  const [, params] = useRoute("/quality-lab/projects/:id/lineage/:lineageId");
  const projectId = decoded(params?.id);
  const lineageId = decoded(params?.lineageId);
  const project = useMemo(() => getQualityLabProject(projectId), [projectId]);
  const operatingModelLineage = useMemo(() => {
    if (!project || !lineageId.startsWith("decision:operating-model:")) return undefined;
    return analyzeQualityLabOperatingModel(project, loadQualityLabOperatingModelInput(project)).applications.find((item) => item.lineage.id === lineageId)?.lineage;
  }, [project, lineageId]);
  const lineage = project?.blueprint.decisionLineage.find((item) => item.id === lineageId) ?? operatingModelLineage;
  useSEO({ title: lineage ? `${lineage.summary} | Decision Lineage` : "Decision Lineage | Quality Lab Blueprint", description: "Trace a Quality Lab Blueprint decision to its inputs, calculations, rules, evidence, assumptions and open limitations." });

  useEffect(() => {
    if (project && lineage) analytics.decisionLineageOpened(project.id, lineage.id, lineage.decisionType);
  }, [project?.id, lineage?.id]);

  if (!project || !lineage) {
    return <div className="min-h-screen bg-[#07111f] px-4 py-16 text-slate-100"><div className="mx-auto max-w-2xl rounded-3xl border border-dashed border-white/15 bg-white/[0.025] p-8 text-center"><GitBranch className="mx-auto h-8 w-8 text-slate-500" /><h1 className="mt-5 text-2xl font-bold">Decision trace not available</h1><p className="mt-3 text-sm leading-6 text-slate-500">This project or lineage record is not present in this browser. Open the saved Blueprint and choose a current “Trace this decision” link.</p><Link href="/quality-lab/projects" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-300 px-5 py-3 text-sm font-bold text-slate-950"><ArrowLeft className="h-4 w-4" /> Quality lab projects</Link></div></div>;
  }

  return (
    <div className="min-h-screen bg-[#07111f] px-4 pb-24 pt-6 text-slate-100 md:pt-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link href={lineage.decisionType === "operating-model" ? `/quality-lab/operating-model?project=${encodeURIComponent(project.id)}` : `/quality-lab/projects/${encodeURIComponent(project.id)}`} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white"><ArrowLeft className="h-4 w-4" /> {lineage.decisionType === "operating-model" ? "Back to operating-model analysis" : "Back to Blueprint"}</Link>
          <span className="inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-sky-200"><FlaskConical className="h-3.5 w-3.5" /> {project.name}</span>
        </div>
        <div className="mb-6"><DecisionPackageContextCard packageId="cross-cutting-evidence-governance" compact /></div>
        <DecisionLineagePanel projectId={project.id} blueprint={project.blueprint} lineage={lineage} />
      </div>
    </div>
  );
}
