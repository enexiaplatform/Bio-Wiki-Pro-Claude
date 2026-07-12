import { ArrowRight, FlaskConical, Network, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { evidenceContextForHref } from "@/data/atlasEvidenceGraph";
import { analytics } from "@/hooks/use-analytics";

const maturityLabel = {
  "executable-concept": "Executable concept",
  "evidence-development": "Evidence development",
  "specialist-gated": "Specialist gated",
};

export function AtlasBlueprintContext({ href }: { href: string }) {
  const contexts = evidenceContextForHref(href);
  if (contexts.length === 0) return null;

  return <aside data-print="hide" aria-label="Atlas Blueprint relevance" className="my-8 overflow-hidden rounded-2xl border border-sky-300/20 bg-gradient-to-br from-sky-300/[0.08] via-teal-300/[0.035] to-transparent p-5 md:p-6">
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div><p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-sky-300"><Network className="h-4 w-4" /> Blueprint relevance</p><h2 className="mt-2 text-xl font-bold text-slate-100">How this resource supports a laboratory decision</h2></div>
      <Link href="/quality-lab/evidence" className="inline-flex shrink-0 items-center gap-2 text-xs font-bold text-teal-300 hover:text-teal-200">Open Evidence Graph <ArrowRight className="h-3.5 w-3.5" /></Link>
    </div>
    <div className="mt-5 space-y-4">
      {contexts.map(({ domain, resource, decisions, nextResources }) => <section key={`${domain.id}:${resource.href}`} className="rounded-xl border border-white/10 bg-slate-950/30 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-[10px] font-bold uppercase tracking-wider text-teal-300">{domain.eyebrow}</p><h3 className="mt-1 font-bold text-slate-100">{domain.title}</h3></div><span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2.5 py-1 text-[9px] font-bold uppercase text-amber-200">{maturityLabel[domain.maturity]}</span></div>
        <p className="mt-3 text-xs leading-6 text-slate-400">{resource.purpose}</p>
        <div className="mt-4"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Blueprint decisions supported</p><div className="mt-2 flex flex-wrap gap-2">{decisions.map((decision)=><span key={decision.id} title={decision.question} className="rounded-full border border-sky-300/15 bg-sky-300/[0.06] px-2.5 py-1 text-[10px] font-semibold text-sky-200">{decision.title}</span>)}</div></div>
        <div className="mt-4 flex gap-2 rounded-lg border border-amber-300/15 bg-amber-300/[0.04] p-3 text-[11px] leading-5 text-slate-400"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" /><p><strong className="text-slate-200">Domain boundary:</strong> {domain.boundary}</p></div>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">{nextResources.slice(0,3).map((item)=><Link key={item.href} href={item.href} className="group rounded-lg border border-white/8 bg-white/[0.025] p-3 hover:border-teal-300/25"><p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Next · {item.kind}</p><p className="mt-1 text-xs font-semibold leading-5 text-slate-300 group-hover:text-teal-200">{item.title}</p></Link>)}</div>
      </section>)}
    </div>
    <div className="mt-5 flex flex-col gap-3 sm:flex-row"><Link href="/quality-lab/planner" onClick={()=>analytics.blueprintCtaClicked("blueprint_context", "planner")} className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-300 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-teal-200"><FlaskConical className="h-4 w-4" /> Apply this reasoning in a Blueprint</Link><Link href="/quality-lab/discovery-pack" className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/[0.035] px-4 py-2.5 text-xs font-bold text-slate-200 hover:border-white/25">Collect controlled project evidence</Link></div>
  </aside>;
}
