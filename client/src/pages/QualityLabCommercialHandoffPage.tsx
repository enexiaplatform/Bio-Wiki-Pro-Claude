import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Download, FileSpreadsheet, FileText, GitCompareArrows, Link2, ShieldCheck } from "lucide-react";
import { Link, useRoute } from "wouter";
import { analytics } from "@/hooks/use-analytics";
import { useSEO } from "@/hooks/use-seo";
import { getOrCreateEngagement } from "@/lib/quality-lab-engagements";
import { downloadQualityLabDeliveryArtifact, fetchQualityLabReviewedProject, getQualityLabProject, syncQualityLabReviewedProject } from "@/lib/quality-lab-projects";
import { createQualityLabCommercialHandoff } from "@shared/quality-lab-commercial-handoff";
import { qualityLabProjectFromReviewedSnapshot } from "@shared/quality-lab-persistence";
import { isIllustrativeQualityLabProject, type QualityLabProject } from "@shared/quality-lab";
import type { QualityLabEngagementPacket } from "@shared/quality-lab-engagement";

export default function QualityLabCommercialHandoffPage() {
  const [, params] = useRoute("/quality-lab/engagements/:id/commercial-handoff");
  const localProject = useMemo(() => params?.id ? getQualityLabProject(params.id) : undefined, [params?.id]);
  const [recovered, setRecovered] = useState<{ project: QualityLabProject; packet: QualityLabEngagementPacket } | null>(null);
  const [exporting, setExporting] = useState<"urs" | "rfq" | null>(null);
  const [exportError, setExportError] = useState("");

  useEffect(() => {
    if (localProject || !params?.id) return;
    fetchQualityLabReviewedProject(params.id).then((snapshot) => {
      if (!snapshot) return;
      const project = qualityLabProjectFromReviewedSnapshot(snapshot);
      if (isIllustrativeQualityLabProject(project)) return;
      setRecovered({ project, packet: snapshot.engagement ?? getOrCreateEngagement(project) });
    }).catch(() => undefined);
  }, [localProject, params?.id]);

  const project = localProject ?? recovered?.project;
  const illustrativeProject = project ? isIllustrativeQualityLabProject(project) : false;
  const packet = localProject && !illustrativeProject ? getOrCreateEngagement(localProject) : recovered?.packet;
  const handoff = useMemo(() => project && packet ? createQualityLabCommercialHandoff(project, packet) : null, [packet, project]);
  useSEO({ title: "Vendor-neutral URS & RFQ Handoff | Atlas Quality Lab", description: "Inspect traceable vendor-neutral requirements and generate controlled URS and RFQ drafting files from one Blueprint contract.", noIndex: true });

  if (illustrativeProject && project) return <div className="min-h-screen bg-[#08111f] px-4 py-20 text-slate-100"><div className="mx-auto max-w-2xl rounded-3xl border border-amber-300/20 bg-amber-300/[0.045] p-8 text-center"><ShieldCheck className="mx-auto h-8 w-8 text-amber-300" /><h1 className="mt-5 text-2xl font-bold">Commercial handoff is unavailable for synthetic examples</h1><p className="mt-3 text-sm leading-6 text-slate-400">Start a separate Blueprint from your own inputs and submit it for expert review before generating controlled URS or RFQ drafting files.</p><Link href={`/quality-lab/projects/${project.id}`} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-300 px-5 py-3 text-sm font-bold text-slate-950"><ArrowLeft className="h-4 w-4" /> Return to synthetic Blueprint</Link></div></div>;
  if (!project || !packet || !handoff) return <div className="mx-auto max-w-2xl px-4 py-20 text-center"><h1 className="text-2xl font-bold">Loading commercial handoff…</h1><Link href="/quality-lab/projects" className="mt-5 inline-block text-teal-300">Open saved projects</Link></div>;

  const activeProject = project;
  const activePacket = packet;
  const activeHandoff = handoff;
  const readyCount = handoff.requirements.filter((item) => item.handoffStatus === "ready-for-qualified-drafting").length;

  async function exportArtifact(artifact: "urs" | "rfq") {
    setExportError("");
    if (!activeProject.reviewRequestedAt) {
      setExportError("Submit the expert-review brief before generating account-controlled handoff files.");
      return;
    }
    setExporting(artifact);
    try {
      await syncQualityLabReviewedProject(activeProject, activePacket);
      await downloadQualityLabDeliveryArtifact(activeProject.id, artifact);
      analytics.commercialHandoffExported(activeProject.id, artifact, activeHandoff.requirements.length, activeHandoff.blockers.length);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : "Unable to prepare the commercial handoff file.");
    } finally {
      setExporting(null);
    }
  }

  return <div className="min-h-screen bg-[#08111f] px-4 pb-24 pt-7 text-slate-100 md:pt-12">
    <div className="mx-auto max-w-7xl">
      <Link href={`/quality-lab/engagements/${project.id}`} className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft className="h-4 w-4" /> Engagement workspace</Link>

      <header className="mt-5 overflow-hidden rounded-3xl border border-teal-300/20 bg-gradient-to-br from-teal-300/10 via-slate-950 to-violet-300/[0.06] p-5 md:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-300">Phase 5 · Commercial handoff</p>
            <h1 className="mt-3 max-w-4xl text-3xl font-bold md:text-5xl">One controlled requirement basis. Two comparable handoff files.</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400">Inspect each vendor-neutral user need against its Blueprint revision, methods, rules, evidence and Decision Lineage. The DOCX and XLSX exports are generated from this same versioned contract.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Current handoff</p>
            <p className={`mt-3 text-lg font-bold ${handoff.status === "ready-for-qualified-review" ? "text-teal-200" : "text-amber-200"}`}>{handoff.status.replaceAll("-", " ")}</p>
            <p className="mt-2 break-all text-[10px] leading-5 text-slate-500">{handoff.handoffVersion}<br />{handoff.project.revisionReference}</p>
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Metric value={handoff.requirements.length} label="stable requirements" tone="text-white" />
          <Metric value={readyCount} label="ready for qualified drafting" tone="text-teal-200" />
          <Metric value={handoff.blockers.length} label="blocking evidence links" tone="text-amber-200" />
        </div>
      </header>

      <section className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr]" aria-label="Commercial handoff exports">
        <ExportCard icon={FileText} title="Vendor-neutral URS document" description="Editable DOCX with document control, intended use, functional/performance requirements, utilities, qualification impact, exclusions, supplier evidence requests and traceability." buttonLabel={exporting === "urs" ? "Preparing URS…" : "Generate URS DOCX"} disabled={exporting !== null} onClick={() => exportArtifact("urs")} />
        <ExportCard icon={FileSpreadsheet} title="RFQ comparison workbook" description="XLSX response matrix for three supplier slots, technical declarations, deviations, quote scope and formula-driven completeness—without score, rank or award recommendation." buttonLabel={exporting === "rfq" ? "Preparing RFQ…" : "Generate RFQ XLSX"} disabled={exporting !== null} onClick={() => exportArtifact("rfq")} />
      </section>
      {exportError && <p role="alert" className="mt-4 rounded-xl border border-red-300/20 bg-red-300/10 p-4 text-xs text-red-100">{exportError}</p>}

      <section className="mt-6 rounded-2xl border border-amber-300/15 bg-amber-300/[0.04] p-5 md:p-6">
        <div className="flex gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" /><div><h2 className="font-bold">Controlled-use boundary</h2><p className="mt-2 text-xs leading-6 text-slate-400">{handoff.controls.notice}</p><div className="mt-3 flex flex-wrap gap-2 text-[10px] font-bold uppercase"><BoundaryPill label="No vendor selection" /><BoundaryPill label="No equivalence claim" /><BoundaryPill label="Not an approved URS" /><BoundaryPill label="Concept quantities" /></div></div></div>
      </section>

      <section className="mt-8" aria-labelledby="requirement-register-heading">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-300">Shared-source requirement register</p><h2 id="requirement-register-heading" className="mt-2 text-2xl font-bold">Trace before sending.</h2><p className="mt-2 max-w-3xl text-sm leading-7 text-slate-400">A blocked requirement may still be exported as a controlled drafting aid, but the blocker remains visible in the document and workbook. Export does not change readiness.</p></div><p className="text-xs text-slate-500">{handoff.sourceVersions.domainPack}</p></div>
        <div className="mt-5 space-y-4">
          {handoff.requirements.map((requirement) => <article key={requirement.requirementId} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 md:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div><div className="flex flex-wrap items-center gap-2"><span className="rounded-full border border-sky-300/20 bg-sky-300/10 px-2.5 py-1 font-mono text-[9px] font-bold text-sky-200">{requirement.requirementId}</span><span className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase ${requirement.handoffStatus === "blocked" ? "border-amber-300/20 bg-amber-300/10 text-amber-200" : "border-teal-300/20 bg-teal-300/10 text-teal-200"}`}>{requirement.handoffStatus.replaceAll("-", " ")}</span></div><h3 className="mt-3 text-xl font-bold">{requirement.equipmentName}</h3><p className="mt-1 text-xs text-slate-500">{requirement.equipmentCategory} · {requirement.quantityBasis.current} current / {requirement.quantityBasis.planningHorizon} planning horizon</p></div>
              <Link href={`/quality-lab/projects/${project.id}/lineage/${encodeURIComponent(requirement.decisionLineageIds[0])}`} onClick={() => analytics.commercialHandoffLineageOpened(project.id, requirement.requirementId, requirement.decisionLineageIds[0])} className="inline-flex w-fit items-center gap-2 text-xs font-bold text-teal-300">Open Decision Lineage <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-300"><strong>Intended use:</strong> {requirement.intendedUse}</p>
            <div className="mt-4 grid gap-3 lg:grid-cols-3"><Detail icon={CheckCircle2} label="Functional basis" text={requirement.functionalRequirements[0]} /><Detail icon={GitCompareArrows} label="Performance basis" text={requirement.performanceRequirements[0]} /><Detail icon={Link2} label="Qualification impact" text={requirement.qualificationImpact} /></div>
            <div className="mt-4 grid gap-3 md:grid-cols-2"><Trace label="Rule references" values={requirement.ruleRefs.map((item) => `${item.id}@${item.version}`)} /><Trace label="Evidence references" values={requirement.evidenceRefs.map((item) => `${item.id}@${item.version}`)} /></div>
            {requirement.blockers.length > 0 && <div className="mt-4 rounded-xl border border-amber-300/15 bg-amber-300/[0.04] p-4"><p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-amber-200"><AlertTriangle className="h-4 w-4" /> Before qualified issue</p><ul className="mt-2 space-y-1.5 text-xs leading-5 text-slate-400">{requirement.blockers.map((item) => <li key={item}>• {item}</li>)}</ul></div>}
          </article>)}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-violet-300/15 bg-violet-300/[0.035] p-5 md:p-6"><h2 className="text-xl font-bold">Comparable responses, not an automated award.</h2><div className="mt-4 grid gap-3 md:grid-cols-3"><Step number="1" title="Declare" text="Each supplier responds to every stable requirement ID and cites the offered configuration." /><Step number="2" title="Resolve" text="Qualified reviewers reconcile deviations, clarifications, utilities, interfaces and exclusions." /><Step number="3" title="Decide outside Atlas" text="Technical and commercial owners make and record any award decision under controlled procurement." /></div></section>
    </div>
  </div>;
}

function Metric({ value, label, tone }: { value: number; label: string; tone: string }) { return <div className="rounded-xl border border-white/10 bg-black/15 p-4"><p className={`text-2xl font-bold ${tone}`}>{value}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p></div>; }
function BoundaryPill({ label }: { label: string }) { return <span className="rounded-full border border-amber-300/15 bg-black/10 px-2.5 py-1 text-amber-100/80">{label}</span>; }
function ExportCard({ icon: Icon, title, description, buttonLabel, disabled, onClick }: { icon: typeof FileText; title: string; description: string; buttonLabel: string; disabled: boolean; onClick: () => void }) { return <article className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 md:p-6"><Icon className="h-6 w-6 text-teal-300" /><h2 className="mt-4 text-xl font-bold">{title}</h2><p className="mt-2 text-xs leading-6 text-slate-400">{description}</p><button type="button" disabled={disabled} onClick={onClick} className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-teal-300 px-4 py-3 text-sm font-bold text-slate-950 disabled:cursor-wait disabled:opacity-60"><Download className="h-4 w-4" /> {buttonLabel}</button></article>; }
function Detail({ icon: Icon, label, text }: { icon: typeof CheckCircle2; label: string; text: string }) { return <div className="rounded-xl border border-white/8 bg-black/15 p-4"><Icon className="h-4 w-4 text-sky-300" /><p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p><p className="mt-2 text-xs leading-5 text-slate-400">{text}</p></div>; }
function Trace({ label, values }: { label: string; values: string[] }) { return <div className="rounded-xl border border-white/8 bg-slate-950/30 p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p><p className="mt-2 break-words font-mono text-[10px] leading-5 text-sky-200/75">{values.join(" · ")}</p></div>; }
function Step({ number, title, text }: { number: string; title: string; text: string }) { return <div className="rounded-xl border border-white/8 bg-black/15 p-4"><span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-violet-300/15 text-xs font-bold text-violet-200">{number}</span><h3 className="mt-3 font-bold">{title}</h3><p className="mt-2 text-xs leading-5 text-slate-500">{text}</p></div>; }
