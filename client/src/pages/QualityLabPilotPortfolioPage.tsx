import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Clock3, Download, FileCheck2, Gauge, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { assessQualityLabDeliveryReadiness } from "@shared/quality-lab-delivery";
import { assessPaidPilotPortfolio, type PilotPortfolioInput } from "@shared/quality-lab-pilot-portfolio";
import { downloadPaidPilotRegistry, listEngagements } from "@/lib/quality-lab-engagements";
import { fetchQualityLabReviewedProjects, getQualityLabProject } from "@/lib/quality-lab-projects";
import { useSEO } from "@/hooks/use-seo";
import { useUser } from "@/context/UserContext";
import { qualityLabProjectFromReviewedSnapshot } from "@shared/quality-lab-persistence";

const statusStyle = {
  "not-started": "border-slate-300/15 bg-white/5 text-slate-300",
  "in-progress": "border-amber-300/20 bg-amber-300/10 text-amber-200",
  "evidence-complete": "border-teal-300/25 bg-teal-300/10 text-teal-200",
};

export default function QualityLabPilotPortfolioPage() {
  const { isAuthenticated } = useUser();
  const [serverSnapshots, setServerSnapshots] = useState<Awaited<ReturnType<typeof fetchQualityLabReviewedProjects>>>([]);
  const [portfolioError, setPortfolioError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchQualityLabReviewedProjects().then(setServerSnapshots).catch(() => setPortfolioError("Account-connected reviewed projects could not be loaded. Local records are still shown."));
  }, [isAuthenticated]);

  const records = useMemo<PilotPortfolioInput[]>(() => {
    const byProject = new Map<string, PilotPortfolioInput>();
    serverSnapshots.forEach((snapshot) => {
      if (!snapshot.engagement) return;
      const project = qualityLabProjectFromReviewedSnapshot(snapshot);
      byProject.set(snapshot.localProjectId, { packet: snapshot.engagement, deliveryReadiness: assessQualityLabDeliveryReadiness(project, snapshot.engagement) });
    });
    listEngagements().forEach((packet) => {
      const project = getQualityLabProject(packet.project.id);
      byProject.set(packet.project.id, {
        packet,
        deliveryReadiness: project
          ? assessQualityLabDeliveryReadiness(project, packet)
          : { status: "working-draft", blockers: ["Recover the corresponding Blueprint project to compute controlled delivery readiness."] },
      });
    });
    return Array.from(byProject.values());
  }, [serverSnapshots]);
  const portfolio = useMemo(() => assessPaidPilotPortfolio(records), [records]);
  const progress = Math.min(100, Math.round((portfolio.eligibleCount / portfolio.targetCount) * 100));

  useSEO({ title: "Gate 1 Paid Pilot Portfolio", description: "Controlled evidence tracker for real Atlas Quality Lab Blueprint engagements.", noIndex: true });

  return <div className="min-h-screen bg-[#08111f] px-4 pb-24 pt-8 text-slate-100">
    <div className="mx-auto max-w-6xl">
      <Link href="/quality-lab/projects" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft className="h-4 w-4" /> Quality lab projects</Link>

      <header className="mt-6 rounded-3xl border border-teal-300/20 bg-gradient-to-br from-teal-300/10 via-sky-300/[0.04] to-transparent p-6 md:p-9">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-300">Gate 1 · service-assisted validation</p><h1 className="mt-4 text-3xl font-bold md:text-5xl">Paid Pilot Portfolio</h1><p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">Track the three real engagements required before Atlas can claim paid service-assisted validation. A project counts only after controlled delivery, client acceptance and estimate-to-actual evidence are complete.</p></div>
          {records.length > 0 && <button type="button" onClick={() => downloadPaidPilotRegistry(records)} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-teal-300 px-4 py-3 text-sm font-bold text-slate-950"><Download className="h-4 w-4" /> Export Gate 1 registry</button>}
        </div>
        <div className="mt-6 rounded-xl border border-amber-300/15 bg-amber-300/[0.05] p-4 text-xs leading-6 text-slate-400"><div className="flex gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" /><p><strong className="text-slate-200">Evidence boundary:</strong> references prove that an external record exists; they do not replace invoices, client acceptance records or controlled source documents. Do not store confidential payment or client content here.</p></div></div>
      </header>

      <section aria-labelledby="gate-progress-heading" className="mt-5 rounded-2xl border border-white/10 bg-white/[0.035] p-5 md:p-6">
        {portfolioError && <p role="alert" className="mb-4 rounded-xl border border-amber-300/20 bg-amber-300/10 p-3 text-xs text-amber-100">{portfolioError}</p>}
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-300">Portfolio completion</p><h2 id="gate-progress-heading" className="mt-2 text-2xl font-bold">{portfolio.eligibleCount}/{portfolio.targetCount} evidence-complete engagements</h2><p className="mt-2 text-sm text-slate-400">{portfolio.remainingCount === 0 ? "Gate 1 evidence target reached; founder review is still required before changing roadmap status." : `${portfolio.remainingCount} more real engagement${portfolio.remainingCount === 1 ? "" : "s"} required.`}</p></div><span className={`w-fit rounded-full border px-3 py-1 text-[10px] font-bold uppercase ${statusStyle[portfolio.status]}`}>{portfolio.status.replaceAll("-", " ")}</span></div>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-label="Gate 1 paid pilot progress" aria-valuemin={0} aria-valuemax={3} aria-valuenow={portfolio.eligibleCount}><div className="h-full rounded-full bg-teal-300" style={{ width: `${progress}%` }} /></div>
        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { icon: FileCheck2, value: portfolio.paidRecordedCount, label: "paid records" },
            { icon: CheckCircle2, value: portfolio.acceptedCount, label: "client acceptances" },
            { icon: Clock3, value: portfolio.averageDeliveryCalendarDays === null ? "Open" : `${portfolio.averageDeliveryCalendarDays}d`, label: "average delivery" },
            { icon: Gauge, value: portfolio.observedCalibrationMetrics, label: "observed metrics" },
          ].map(({ icon: Icon, value, label }) => <div key={label} className="rounded-xl border border-white/8 bg-black/15 p-4"><Icon className="h-4 w-4 text-teal-300" /><strong className="mt-3 block text-xl">{value}</strong><span className="mt-1 block text-[11px] text-slate-500">{label}</span></div>)}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4"><div className="rounded-xl border border-white/8 p-3 text-xs text-slate-500"><strong className="block text-lg text-white">{portfolio.deliveryMeasuredCount}</strong>delivery times measured</div><div className="rounded-xl border border-white/8 p-3 text-xs text-slate-500"><strong className="block text-lg text-white">{portfolio.averageDeliveryEffortHours ?? "Open"}</strong>average effort hours</div><div className="rounded-xl border border-white/8 p-3 text-xs text-slate-500"><strong className="block text-lg text-white">{portfolio.totalCorrections}</strong>corrections captured</div><div className="rounded-xl border border-white/8 p-3 text-xs text-slate-500"><strong className="block text-lg text-white">{portfolio.totalDecisions}</strong>buyer decisions captured</div></div>
      </section>

      {portfolio.records.length === 0 ? <section className="mt-5 rounded-3xl border border-dashed border-white/15 bg-white/[0.025] px-6 py-16 text-center"><h2 className="text-2xl font-bold">No real engagement records yet</h2><p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-400">Submit a Blueprint for expert review, open its engagement workspace and record only evidence that exists. Concept projects and synthetic casebook scenarios do not count.</p><Link href="/quality-lab/projects" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-300 px-5 py-3 text-sm font-bold text-slate-950">Open Blueprint projects <ArrowRight className="h-4 w-4" /></Link></section> : <section className="mt-5 space-y-4">
        {portfolio.records.map((record) => <article key={record.packet.project.id} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"><div><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase ${record.gate1EvidenceComplete ? "border-teal-300/25 bg-teal-300/10 text-teal-200" : "border-amber-300/20 bg-amber-300/10 text-amber-200"}`}>{record.gate1EvidenceComplete ? "Gate 1 evidence complete" : record.pilot.eligibility.replaceAll("-", " ")}</span><span className="text-[10px] font-bold uppercase text-slate-500">{record.packet.pilotControl.commercialStatus.replaceAll("-", " ")}</span></div><h2 className="mt-3 text-xl font-bold">{record.packet.project.name}</h2><p className="mt-1 text-xs text-slate-500">{record.packet.sourceVersions.domainPack}</p></div><Link href={`/quality-lab/engagements/${record.packet.project.id}`} className="inline-flex items-center gap-2 text-sm font-bold text-teal-300">Open engagement <ArrowRight className="h-4 w-4" /></Link></div>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4"><div className="rounded-xl border border-white/8 bg-black/15 p-3 text-xs text-slate-500"><strong className="block text-lg text-white">{record.pilot.deliveryCalendarDays === null ? "Open" : `${record.pilot.deliveryCalendarDays}d`}</strong>delivery time</div><div className="rounded-xl border border-white/8 bg-black/15 p-3 text-xs text-slate-500"><strong className="block text-lg text-white">{record.pilot.deliveryEffortHours ?? "Open"}</strong>effort hours</div><div className="rounded-xl border border-white/8 bg-black/15 p-3 text-xs text-slate-500"><strong className="block text-lg text-white">{record.packet.decisions.length}</strong>decisions</div><div className="rounded-xl border border-white/8 bg-black/15 p-3 text-xs text-slate-500"><strong className="block text-lg text-white">{record.calibration.observedCount}</strong>observed metrics</div></div>
          {record.blockers.length > 0 && <div className="mt-4 rounded-xl border border-amber-300/15 bg-amber-300/[0.04] p-4"><p className="flex items-center gap-2 text-xs font-bold text-amber-200"><AlertTriangle className="h-4 w-4" /> Evidence blockers</p><ul className="mt-2 grid gap-1 text-xs leading-5 text-slate-400 md:grid-cols-2">{record.blockers.map((item) => <li key={item}>• {item}</li>)}</ul></div>}
        </article>)}
      </section>}

      <p className="mt-5 text-xs leading-6 text-slate-500">{portfolio.controlNotice}</p>
    </div>
  </div>;
}
