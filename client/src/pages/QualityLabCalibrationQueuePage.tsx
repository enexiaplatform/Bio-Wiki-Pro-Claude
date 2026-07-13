import { useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Download, Filter, Network, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { assessCalibrationCandidate, createCalibrationLearningCandidate, type CalibrationEligibility } from "@shared/quality-lab-engagement";
import { downloadLearningCandidateRegistry, listEngagements } from "@/lib/quality-lab-engagements";
import { useSEO } from "@/hooks/use-seo";
import { EditorialImage } from "@/components/EditorialImage";

const filters: Array<{ id: "all" | CalibrationEligibility; label: string }> = [
  { id: "all", label: "All records" },
  { id: "eligible-for-learning-review", label: "Eligible" },
  { id: "blocked", label: "Blocked candidates" },
  { id: "project-only", label: "Project only" },
  { id: "hold", label: "On hold" },
];

const eligibilityStyle: Record<CalibrationEligibility, string> = {
  "eligible-for-learning-review": "border-teal-300/25 bg-teal-300/10 text-teal-200",
  blocked: "border-red-300/25 bg-red-300/10 text-red-200",
  "project-only": "border-sky-300/20 bg-sky-300/10 text-sky-200",
  hold: "border-amber-300/20 bg-amber-300/10 text-amber-200",
};

export default function QualityLabCalibrationQueuePage() {
  const [filter, setFilter] = useState<"all" | CalibrationEligibility>("all");
  const packets = useMemo(() => listEngagements(), []);
  const records = useMemo(() => packets.map((packet) => ({ packet, candidate: createCalibrationLearningCandidate(packet), assessment: assessCalibrationCandidate(packet) })), [packets]);
  const visible = records.filter((record) => filter === "all" || record.assessment.eligibility === filter);
  const eligible = records.filter((record) => record.assessment.eligibility === "eligible-for-learning-review").length;
  const blocked = records.filter((record) => record.assessment.eligibility === "blocked").length;
  useSEO({ title: "Calibration Learning Review Queue", description: "Review estimate-to-actual calibration candidates before any Atlas rule or benchmark update.", noIndex: true });

  return <div className="min-h-screen bg-[#08111f] px-4 pb-24 pt-8 text-slate-100">
    <div className="mx-auto max-w-6xl">
      <Link href="/quality-lab/projects" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft className="h-4 w-4" /> Quality lab projects</Link>
      <header className="mt-6 overflow-hidden rounded-3xl border border-sky-300/20 bg-gradient-to-br from-sky-300/12 via-teal-300/[0.05] to-transparent p-6 md:p-9">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between"><div><span className="inline-flex items-center gap-2 rounded-full border border-sky-300/25 bg-sky-300/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-sky-200"><Network className="h-3.5 w-3.5" /> Atlas Intelligence governance</span><h1 className="mt-5 text-3xl font-bold md:text-5xl">Calibration Learning Review Queue</h1><p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">Separate project observations from evidence-complete candidates before any benchmark calibration or Domain Pack rule change is considered.</p></div>{packets.length > 0 && <button onClick={() => downloadLearningCandidateRegistry(packets)} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-teal-300 px-4 py-3 text-sm font-bold text-slate-950"><Download className="h-4 w-4" /> Export review registry</button>}</div>
        <details className="group mt-5 rounded-xl border border-amber-300/15 bg-amber-300/[0.05] p-4 text-xs leading-6 md:hidden"><summary className="flex cursor-pointer list-none items-center gap-2 font-bold text-slate-200 marker:content-none"><ShieldCheck className="h-4 w-4 shrink-0 text-amber-300" />Governance boundary<span className="ml-auto text-[10px] uppercase tracking-wider text-amber-200 group-open:hidden">Read</span></summary><p className="mt-3 border-t border-white/10 pt-3 text-slate-400">Eligibility only means the record is ready to enter controlled learning review. It does not approve a rule update, pool confidential customer data or create a benchmark.</p></details>
        <div className="mt-6 hidden gap-3 rounded-xl border border-amber-300/15 bg-amber-300/[0.05] p-4 text-xs leading-6 text-slate-400 md:flex"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" /><p><strong className="text-slate-200">Governance boundary:</strong> eligibility only means the record is ready to enter controlled learning review. It does not approve a rule update, pool confidential customer data or create a benchmark.</p></div>
        <Link href="/blog/how-to-validate-a-quality-lab-domain-pack" className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-teal-300">Read the validation and rule-change framework <ArrowRight className="h-4 w-4" /></Link>
      </header>

      {records.length === 0 ? <section className="mt-5 grid overflow-hidden rounded-3xl border border-dashed border-white/15 bg-white/[0.025] md:grid-cols-[0.9fr_1.1fr]">
        <EditorialImage src="/images/editorial/laboratory-record-review.jpg" alt="Laboratory scientist recording identifiers on sample tubes" creditName="Nathan Rimoux" creditUrl="https://unsplash.com/photos/iul3dSPs1G4" className="h-56 md:h-full md:min-h-80" imageClassName="object-center saturate-75" />
        <div className="flex flex-col justify-center p-6 md:p-10"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-300">Start with a controlled observation</p><h2 className="mt-3 text-2xl font-bold">No calibration records yet</h2><p className="mt-3 max-w-xl text-sm leading-7 text-slate-400">A record appears only after a Blueprint review workspace captures an observed period, actual metrics, provenance and a learning disposition.</p><div className="mt-6 flex flex-wrap gap-3"><Link href="/quality-lab/projects" className="inline-flex items-center gap-2 rounded-xl bg-teal-300 px-4 py-3 text-sm font-bold text-slate-950">Open a Blueprint project <ArrowRight className="h-4 w-4" /></Link><Link href="/blog/how-to-validate-a-quality-lab-domain-pack" className="inline-flex items-center rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold">Read the review framework</Link></div></div>
      </section> : <>
      <section className="mt-5 grid gap-3 sm:grid-cols-4"><div className="rounded-xl border border-white/10 bg-white/[0.035] p-4"><p className="text-2xl font-bold">{records.length}</p><p className="mt-1 text-xs text-slate-500">calibration records</p></div><div className="rounded-xl border border-teal-300/15 bg-teal-300/[0.04] p-4"><p className="text-2xl font-bold text-teal-200">{eligible}</p><p className="mt-1 text-xs text-slate-500">eligible for review</p></div><div className="rounded-xl border border-red-300/15 bg-red-300/[0.04] p-4"><p className="text-2xl font-bold text-red-200">{blocked}</p><p className="mt-1 text-xs text-slate-500">candidate records blocked</p></div><div className="rounded-xl border border-white/10 bg-white/[0.035] p-4"><p className="text-2xl font-bold">{records.reduce((sum, record) => sum + record.assessment.observedMetrics.length, 0)}</p><p className="mt-1 text-xs text-slate-500">observed metrics</p></div></section>

      <section className="mt-5"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500"><Filter className="h-4 w-4" /> Review state</div><div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Calibration eligibility filter">{filters.map((item)=><button key={item.id} onClick={()=>setFilter(item.id)} className={`rounded-full border px-3 py-2 text-xs font-bold ${filter===item.id ? "border-teal-300 bg-teal-300 text-slate-950" : "border-white/10 bg-white/[0.03] text-slate-300"}`}>{item.label}</button>)}</div></section>

      <section className="mt-5 space-y-4">
        {visible.length === 0 ? <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.025] px-6 py-14 text-center"><h2 className="text-xl font-bold">No calibration records in this view</h2><p className="mt-2 text-sm text-slate-500">Choose another review state or complete the missing evidence in a Blueprint review workspace.</p></div> : visible.map(({ packet, candidate, assessment }) => <article key={packet.project.id} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"><div><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${eligibilityStyle[assessment.eligibility]}`}>{assessment.eligibility.replaceAll("-", " ")}</span><span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{packet.calibration.learningDisposition.replaceAll("-", " ")}</span></div><h2 className="mt-3 text-xl font-bold">{packet.project.name}</h2><p className="mt-1 text-xs text-slate-500">{packet.sourceVersions.domainPack} · {candidate.observedPeriod.start || "period open"} to {candidate.observedPeriod.end || "period open"}</p></div><Link href={`/quality-lab/engagements/${packet.project.id}`} className="inline-flex items-center gap-2 text-sm font-bold text-teal-300">Open calibration <ArrowRight className="h-4 w-4" /></Link></div>
          <div className="mt-4 grid gap-3 md:grid-cols-3"><div className="rounded-xl border border-white/8 bg-black/15 p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Observed metrics</p><p className="mt-2 text-sm text-slate-300">{assessment.observedMetrics.length ? assessment.observedMetrics.join(" · ") : "None captured"}</p></div><div className="rounded-xl border border-white/8 bg-black/15 p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Rule links</p><p className="mt-2 break-words font-mono text-[11px] leading-5 text-sky-200/70">{packet.calibration.applicableRuleIds.length ? packet.calibration.applicableRuleIds.join(" · ") : "No rule linked"}</p></div><div className="rounded-xl border border-white/8 bg-black/15 p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Evidence provenance</p><p className="mt-2 text-sm text-slate-300">{packet.calibration.evidenceRefs.length} reference(s) · {packet.calibration.dataOwner || "owner open"}</p></div></div>
          {assessment.blockers.length > 0 && <div className="mt-4 rounded-xl border border-red-300/15 bg-red-300/[0.04] p-4"><p className="flex items-center gap-2 text-xs font-bold text-red-200"><AlertTriangle className="h-4 w-4" /> Eligibility blockers</p><ul className="mt-2 space-y-1 text-xs leading-5 text-slate-400">{assessment.blockers.map((item)=><li key={item}>• {item}</li>)}</ul></div>}
          {assessment.eligibility === "eligible-for-learning-review" && <div className="mt-4 flex items-center gap-2 text-xs text-teal-200"><CheckCircle2 className="h-4 w-4" /> Evidence-complete candidate; controlled rule/benchmark review is still required.</div>}
        </article>)}
      </section>
      </>}
    </div>
  </div>;
}
