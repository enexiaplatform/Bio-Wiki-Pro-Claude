import { ArrowRight, BookOpenCheck, BriefcaseBusiness, ShieldAlert } from "lucide-react";
import { Link } from "wouter";
import { getDecisionPackage } from "@shared/decision-packages";
import { getCareerTracksForPackage } from "@shared/career-domain-tracks";
import { analytics } from "@/hooks/use-analytics";

export function DecisionPackageContextCard({ packageId, compact = false }: { packageId?: string; compact?: boolean }) {
  if (!packageId) return null;
  const item = getDecisionPackage(packageId);
  if (!item) return null;
  const careerTracks = getCareerTracksForPackage(item.id);
  const careerTrack = careerTracks[0];
  return (
    <section className={`rounded-2xl border border-violet-300/25 bg-violet-300/[0.06] ${compact ? "p-4" : "p-5 md:p-6"}`} aria-label="Decision package context">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-200"><ShieldAlert className="h-3.5 w-3.5" /> Decision package context</p>
          <h2 className="mt-2 text-lg font-bold text-slate-100">{item.title}</h2>
          <p className="mt-1 text-xs leading-5 text-slate-400">{item.decisionQuestion}</p>
        </div>
        <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-amber-200">Domain Pack not verified</span>
      </div>
      <p className="mt-4 text-xs leading-6 text-slate-400">This {item.reviewStatus} package is evidence context for Blueprint. It does not create a new calculation, recommendation, specification or site-approved conclusion.</p>
      <div className={`mt-4 rounded-xl border border-white/10 bg-slate-950/20 ${compact ? "p-3" : "p-4"}`}><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Discovery prompts</p><ul className="mt-2 space-y-1 text-xs leading-5 text-slate-400">{item.discoveryQuestions.slice(0, compact ? 2 : 3).map((question) => <li key={question}>• {question}</li>)}</ul></div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={`/evidence/packages/${item.id}`} onClick={() => analytics.decisionPackageViewed(item.id, item.lane, item.reviewStatus)} className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-white/30 hover:text-white">Open package <ArrowRight className="h-3.5 w-3.5" /></Link>
        <Link href={`/pro?package=${item.id}`} onClick={() => analytics.decisionPackageProductHandoff(item.id, "pro")} className="inline-flex items-center gap-1.5 rounded-lg border border-sky-300/25 bg-sky-300/10 px-3 py-2 text-xs font-semibold text-sky-200"><BookOpenCheck className="h-3.5 w-3.5" /> Atlas Pro</Link>
        {careerTrack && <Link href={careerTracks.length > 1 ? "/career/domains" : `/career?domain=${careerTrack.id}`} onClick={() => analytics.decisionPackageProductHandoff(item.id, "career")} className="inline-flex items-center gap-1.5 rounded-lg border border-teal-300/25 bg-teal-300/10 px-3 py-2 text-xs font-semibold text-teal-200"><BriefcaseBusiness className="h-3.5 w-3.5" /> {careerTracks.length > 1 ? "Shared Career tracks" : "Career track"}</Link>}
      </div>
    </section>
  );
}
