import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Download, FlaskConical, GitCompareArrows, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { QualityLabEditorialHero } from "@/components/QualityLabEditorialHero";
import { useSEO } from "@/hooks/use-seo";
import { downloadValidationCaseRegistry, listEngagements } from "@/lib/quality-lab-engagements";
import { assessValidationCaseRegistry } from "@shared/quality-lab-validation-cases";

const eligibilityStyle = {
  "not-started": "border-white/10 bg-white/[0.04] text-slate-400",
  blocked: "border-amber-300/20 bg-amber-300/10 text-amber-200",
  "eligible-validation-case": "border-teal-300/20 bg-teal-300/10 text-teal-200",
};

export default function QualityLabValidationCasesPage() {
  const packets = listEngagements();
  const registry = assessValidationCaseRegistry(packets);
  useSEO({ title: "Controlled Validation Case Registry | Atlas Quality Lab", description: "Track evidence-complete estimate-to-actual cases before they can support Microbiology Domain Pack validation.", noIndex: true });
  return <div className="min-h-screen bg-[#08111f] px-4 pb-24 pt-8 text-slate-100 md:pt-14">
    <div className="mx-auto max-w-7xl">
      <Link href="/quality-lab/domain-readiness" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft className="h-4 w-4" /> Domain Pack readiness</Link>
      <div className="mt-6">
        <QualityLabEditorialHero
          eyebrow={<span className="inline-flex items-center gap-2 rounded-full border border-violet-300/25 bg-violet-300/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-200"><GitCompareArrows className="h-4 w-4" /> Gate 2 evidence control</span>}
          title="A calibration record is not automatically a validation case."
          description="Freeze the estimate, reconcile it with qualified actuals, confirm scope alignment and learning permission, then require an evidence-backed reviewer acceptance before the case counts toward Domain Pack validation."
          image={{ src: "/images/editorial/lab-team-collaboration.jpg", alt: "Laboratory team comparing controlled evidence and validation records", creditName: "Toon Lambrechts", creditUrl: "https://unsplash.com/photos/0q4ipgUIw5g", className: "object-[center_42%]" }}
          tone="sky"
          boundary={{ label: "Working threshold only", text: "Three accepted cases do not prove statistical validation or representativeness. Expert ownership, source closure, cross-case review and controlled rule-change approval remain separate gates.", tone: "red" }}
        />
      </div>

      <section className="mt-8 rounded-3xl border border-violet-300/20 bg-violet-300/[0.045] p-5 md:p-7">
        <div className="flex flex-col gap-5 border-b border-white/10 pb-6 lg:flex-row lg:items-start lg:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-200">Registry status</p><h2 className="mt-3 text-2xl font-bold">{registry.eligibleCount}/{registry.targetCount} accepted validation cases</h2><p className="mt-2 max-w-3xl text-sm leading-7 text-slate-400">Only distinct projects with evidence-complete calibration, aligned scope, controlled learning permission and qualified acceptance are counted.</p></div><button type="button" onClick={() => downloadValidationCaseRegistry(packets)} className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl border border-violet-300/25 bg-violet-300/10 px-4 py-3 text-xs font-bold text-violet-100 hover:bg-violet-300/15"><Download className="h-4 w-4" /> Export validation registry</button></div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric value={packets.length} label="Engagement records" tone="text-slate-100" /><Metric value={registry.eligibleCount} label="Eligible cases" tone="text-teal-200" /><Metric value={registry.observedMetricCount} label="Accepted observed metrics" tone="text-sky-200" /><Metric value={registry.coveredRuleCount} label="Rules covered by accepted cases" tone="text-violet-200" /></div>
      </section>

      <section className="mt-6 grid gap-3 md:grid-cols-3" aria-label="Evidence record distinctions">
        <Stage icon={FlaskConical} title="Synthetic case" text="Exercises engine behavior only. It cannot count as project evidence or validation." tone="text-slate-400" />
        <Stage icon={GitCompareArrows} title="Calibration candidate" text="Has estimate-to-actual evidence and variance review, but may still lack scope, permission or case acceptance." tone="text-sky-300" />
        <Stage icon={CheckCircle2} title="Accepted validation case" text="Adds frozen baseline, aligned scope, qualification evidence, learning permission and qualified acceptance." tone="text-teal-300" />
      </section>

      <section className="mt-6 space-y-4">
        {registry.records.length === 0 ? <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.025] px-6 py-14 text-center"><AlertTriangle className="mx-auto h-7 w-7 text-amber-300" /><h2 className="mt-4 text-xl font-bold">No validation-case acceptance has started</h2><p className="mx-auto mt-2 max-w-2xl text-sm leading-7 text-slate-500">Create or open a real reviewed project, record qualified actuals in calibration, then complete the validation-case acceptance control in its review workspace.</p><div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/quality-lab/projects" className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-300 px-4 py-3 text-sm font-bold text-slate-950">Open project workspace <ArrowRight className="h-4 w-4" /></Link><Link href="/quality-lab/casebook" className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-slate-200">Inspect synthetic cases</Link></div></div> : registry.records.map(({ packet, assessment }) => <article key={packet.project.id} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"><div><span className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase ${eligibilityStyle[assessment.eligibility]}`}>{assessment.eligibility.replaceAll("-", " ")}</span><h2 className="mt-3 text-xl font-bold">{packet.project.name}</h2><p className="mt-1 text-xs text-slate-500">{packet.validationControl.caseId || "Case ID open"} · {packet.sourceVersions.domainPack}</p></div><Link href={`/quality-lab/engagements/${packet.project.id}#validation-case`} className="inline-flex items-center gap-2 text-sm font-bold text-teal-300">Open case control <ArrowRight className="h-4 w-4" /></Link></div><div className="mt-4 grid gap-3 md:grid-cols-3"><Metric value={assessment.observedMetricCount} label="Observed metrics" tone="text-sky-200" /><Metric value={assessment.applicableRuleIds.length} label="Linked rules" tone="text-violet-200" /><Metric value={assessment.blockers.length} label="Case blockers" tone="text-amber-200" /></div>{assessment.blockers.length > 0 && <div className="mt-4 rounded-xl border border-amber-300/15 bg-amber-300/[0.04] p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-amber-200">Next evidence required</p><ul className="mt-2 space-y-1 text-xs leading-5 text-slate-400">{assessment.blockers.map((blocker) => <li key={blocker}>• {blocker}</li>)}</ul></div>}</article>)}
      </section>

      <section className="mt-6 rounded-3xl border border-amber-300/15 bg-amber-300/[0.04] p-5 md:p-6"><div className="flex gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" /><div><h2 className="font-bold">Portfolio release boundary</h2><p className="mt-2 text-xs leading-6 text-slate-400">{registry.controlNotice}</p><Link href="/blog/how-to-validate-a-quality-lab-domain-pack" className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-teal-300">Read the validation and rule-change framework <ArrowRight className="h-4 w-4" /></Link></div></div></section>
    </div>
  </div>;
}

function Metric({ value, label, tone }: { value: string | number; label: string; tone: string }) { return <div className="rounded-xl border border-white/10 bg-black/15 p-4"><p className={`text-2xl font-bold ${tone}`}>{value}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p></div>; }
function Stage({ icon: Icon, title, text, tone }: { icon: typeof FlaskConical; title: string; text: string; tone: string }) { return <article className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"><Icon className={`h-5 w-5 ${tone}`} /><h2 className="mt-3 font-bold">{title}</h2><p className="mt-2 text-xs leading-6 text-slate-500">{text}</p></article>; }
