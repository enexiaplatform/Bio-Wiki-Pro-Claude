import { ArrowRight, BriefcaseBusiness, CheckCircle2, ShieldAlert } from "lucide-react";
import { Link } from "wouter";

import { CAREER_DOMAIN_TRACKS } from "@shared/career-domain-tracks";
import { getDecisionPackage } from "@shared/decision-packages";
import { analytics } from "@/hooks/use-analytics";
import { useSEO } from "@/hooks/use-seo";

export default function CareerDomainTracksPage() {
  useSEO({ title: "Career Domain Tracks | Life Science Atlas", description: "Choose a Biopharma, Pharma/API or Drug Product evidence track and turn domain decisions into bounded career proof activities." });
  return (
    <main className="min-h-screen bg-[#061426] px-4 pb-24 pt-20 text-slate-100 md:pt-28">
      <div className="mx-auto max-w-6xl">
        <Link href="/career" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-teal-300 hover:text-teal-200"><ArrowRight className="h-4 w-4 rotate-180" /> Career Blueprint</Link>
        <header className="mt-6 max-w-3xl"><p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-teal-300"><BriefcaseBusiness className="h-4 w-4" /> Career evidence tracks</p><h1 className="mt-5 font-display text-4xl font-bold leading-tight tracking-[-0.03em] md:text-6xl">Choose the domain where you want to build proof.</h1><p className="mt-5 text-base leading-8 text-slate-300 md:text-lg">These tracks reuse Atlas decision packages to suggest evidence activities and reviewer questions. Completing an activity never certifies competence.</p></header>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {CAREER_DOMAIN_TRACKS.map((track) => (
            <article key={track.id} className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.035] p-5 md:p-6">
              <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">{track.packageMaps.length} evidence packages</p><h2 className="mt-2 text-xl font-bold text-slate-100">{track.title}</h2></div><span className="rounded-xl border border-teal-300/20 bg-teal-300/[0.06] p-2 text-teal-300"><BriefcaseBusiness className="h-4 w-4" /></span></div>
              <p className="mt-3 text-sm leading-6 text-slate-400">{track.summary}</p>
              <div className="mt-5"><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600">Role families</p><div className="mt-2 flex flex-wrap gap-2">{track.roleFamilies.map((role) => <span key={role} className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-semibold text-slate-500">{role}</span>)}</div></div>
              <div className="mt-5 space-y-2"><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600">Evidence packages</p>{track.packageMaps.map((mapping) => { const pkg = getDecisionPackage(mapping.packageId); return <Link key={mapping.packageId} href={`/evidence/packages/${mapping.packageId}`} onClick={() => analytics.careerDomainTrackSelected(track.id, "career-domain-tracks")} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-950/20 px-3 py-3 text-xs transition hover:border-teal-300/35"><span><span className="block font-semibold text-slate-200">{pkg?.title ?? mapping.packageId}</span><span className="mt-1 block text-slate-600">{mapping.evidenceActivities[0]}</span><span className="mt-1 block text-slate-700">Reviewer prompt: {mapping.reviewerPrompt}</span></span><ArrowRight className="h-4 w-4 shrink-0 text-teal-300" /></Link>; })}</div>
              <details className="mt-5 rounded-xl border border-teal-300/15 bg-teal-300/[0.035] p-3"><summary className="cursor-pointer text-[10px] font-bold uppercase tracking-[0.15em] text-teal-200">13-week evidence actions</summary><ol className="mt-3 space-y-2">{track.thirteenWeekActions.map((action, index) => <li key={action} className="flex gap-2 text-xs leading-5 text-slate-400"><span className="font-bold text-teal-300">{String(index + 1).padStart(2, "0")}</span><span>{action}</span></li>)}</ol></details>
              <div className="mt-auto pt-6"><div className="flex items-start gap-2 rounded-xl border border-amber-300/15 bg-amber-300/[0.04] p-3 text-xs leading-5 text-slate-500"><ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-200" />{track.boundary}</div><Link href={`/career?domain=${track.id}`} onClick={() => analytics.careerDomainTrackSelected(track.id, "career-domain-cta")} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-teal-300 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-teal-200">Build this track into my snapshot <ArrowRight className="h-4 w-4" /></Link></div>
            </article>
          ))}
        </div>
        <section className="mt-8 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-5 text-sm leading-6 text-slate-400"><CheckCircle2 className="h-5 w-5 shrink-0 text-teal-300" />Role, competency, evidence and reviewer prompts remain separate from Quality Lab project state and do not imply hiring, promotion or regulatory authorization.</section>
      </div>
    </main>
  );
}
