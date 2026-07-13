import { ArrowLeft, ArrowRight, CheckCircle2, CircleDashed, FlaskConical, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { QualityLabEditorialHero } from "@/components/QualityLabEditorialHero";
import { assessDomainPackReadiness, domainPackReadiness, type ReadinessGateStatus } from "@/data/domainPackReadiness";
import { useSEO } from "@/hooks/use-seo";

const stageLabel = { "executable-concept": "Executable concept", "evidence-development": "Evidence development", "specialist-gated": "Specialist gated", "future-gate": "Future gate only" };
const statusLabel: Record<ReadinessGateStatus, string> = { "gate-satisfied": "Gate satisfied", "in-development": "In development", "evidence-required": "Evidence required", "not-started": "Not started" };
const statusStyle: Record<ReadinessGateStatus, string> = {
  "gate-satisfied": "border-teal-300/25 bg-teal-300/10 text-teal-200",
  "in-development": "border-sky-300/20 bg-sky-300/10 text-sky-200",
  "evidence-required": "border-amber-300/20 bg-amber-300/10 text-amber-200",
  "not-started": "border-white/10 bg-white/[0.035] text-slate-400",
};

export default function QualityLabDomainReadinessPage() {
  useSEO({ title: "Domain Pack Readiness Gates | Atlas Quality Lab", description: "See the evidence, expert ownership, validation cases and qualified demand required before Atlas treats a quality domain as a verified Domain Pack." });
  return <div className="min-h-screen bg-[#08111f] px-4 pb-24 pt-8 text-slate-100 md:pt-14">
    <div className="mx-auto max-w-7xl">
      <Link href="/quality-lab/evidence" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft className="h-4 w-4" /> Atlas Evidence Graph</Link>
      <div className="mt-6">
        <QualityLabEditorialHero
          eyebrow={<span className="inline-flex items-center gap-2 rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200"><ShieldCheck className="h-4 w-4" /> Evidence-gated expansion</span>}
          title="A domain becomes a Pack only after its evidence exists."
          description="Compare every planned domain against the same release gates: accountable expertise, a versioned source corpus, controlled validation cases, and paying or strongly qualified demand."
          image={{ src: "/images/editorial/test-tube-evidence-review.jpg", alt: "Gloved laboratory worker holding an organized tray of test tubes for evidence review", creditName: "Eka P. Amdela", creditUrl: "https://unsplash.com/photos/JcsYP0IJvnI", className: "object-[center_52%]" }}
          tone="amber"
          boundary={{ label: "No implied launch promise", text: "The sequence below is a strategic order and gating record. It is not a release schedule, regulatory claim, or assertion that later packs already exist.", tone: "red" }}
        />
      </div>

      <section className="mt-8 grid gap-5">
        {domainPackReadiness.map((domain) => { const assessment=assessDomainPackReadiness(domain); return <article key={domain.id} className="rounded-3xl border border-white/10 bg-slate-950/35 p-5 md:p-7">
          <div className="flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-start md:justify-between"><div className="flex gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] font-bold text-teal-200">{domain.sequence}</div><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Expansion sequence</p><h2 className="mt-1 text-2xl font-bold">{domain.title}</h2></div></div><span className="w-fit rounded-full border border-sky-300/20 bg-sky-300/[0.07] px-3 py-1 text-[10px] font-bold uppercase text-sky-200">{stageLabel[domain.currentStage]}</span></div>
          <p className="mt-5 text-sm leading-7 text-slate-400"><strong className="text-slate-200">Current boundary:</strong> {domain.scopeBoundary}</p>
          <div className="mt-5 grid gap-3 lg:grid-cols-4">{domain.gates.map((item)=><section key={item.id} className="flex flex-col rounded-2xl border border-white/8 bg-white/[0.025] p-4"><div className="flex items-start justify-between gap-2">{item.status === "gate-satisfied" ? <CheckCircle2 className="h-5 w-5 text-teal-300" /> : <CircleDashed className="h-5 w-5 text-slate-500" />}<span className={`rounded-full border px-2 py-1 text-[8px] font-bold uppercase ${statusStyle[item.status]}`}>{statusLabel[item.status]}</span></div><h3 className="mt-4 text-sm font-bold">{item.label}</h3><p className="mt-2 flex-1 text-xs leading-6 text-slate-500">{item.currentEvidence}</p><div className="mt-4 border-t border-white/8 pt-3"><p className="text-[9px] font-bold uppercase tracking-wider text-amber-300/70">Exit evidence</p><p className="mt-1 text-[11px] leading-5 text-slate-400">{item.exitEvidence}</p>{item.supportingHref && <Link href={item.supportingHref} className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-teal-300">Read validation framework <ArrowRight className="h-3 w-3" /></Link>}</div></section>)}</div>
          <div className="mt-5 flex flex-col gap-3 rounded-xl border border-white/8 bg-black/15 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold text-slate-200">Verified Pack eligibility: {assessment.eligibleForVerifiedPack ? "Eligible for controlled release review" : `${assessment.blockers.length} gate${assessment.blockers.length === 1 ? "" : "s"} remain`}</p><p className="mt-1 text-[11px] text-slate-500">{assessment.notice}</p></div>{domain.publicEvidenceHref ? <Link href={domain.publicEvidenceHref} className="inline-flex items-center gap-2 text-xs font-bold text-teal-300">Inspect current public evidence <ArrowRight className="h-4 w-4" /></Link> : <span className="text-xs font-semibold text-slate-600">No public evidence area opened</span>}</div>
        </article>; })}
      </section>

      <section className="mt-8 rounded-3xl border border-teal-300/20 bg-teal-300/[0.05] p-6 md:p-8"><div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><FlaskConical className="h-6 w-6 text-teal-300" /><h2 className="mt-4 text-2xl font-bold">The current commercial path remains microbiology-first.</h2><p className="mt-2 max-w-3xl text-sm leading-7 text-slate-400">Use the executable concept in real discovery, capture corrections and estimate-to-actual variance, then move only reviewed learning candidates into controlled Domain Pack development.</p></div><Link href="/quality-lab/review" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-teal-300 px-5 py-3 text-sm font-bold text-slate-950">Discuss a real project <ArrowRight className="h-4 w-4" /></Link></div></section>
    </div>
  </div>;
}
