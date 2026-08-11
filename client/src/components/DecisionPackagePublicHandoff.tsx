import { ArrowRight, BookOpenCheck, BriefcaseBusiness, Building2, ShieldAlert } from "lucide-react";
import { Link } from "wouter";

import { getCareerTracksForPackage } from "@shared/career-domain-tracks";
import { getDecisionPackage } from "@shared/decision-packages";
import { analytics } from "@/hooks/use-analytics";

export function DecisionPackagePublicHandoff({ packageId }: { packageId: string }) {
  const item = getDecisionPackage(packageId);
  if (!item) return null;
  const careerTracks = getCareerTracksForPackage(item.id);
  const careerHref = careerTracks.length === 1 ? `/career?domain=${careerTracks[0].id}` : "/career/domains";

  return (
    <section className="mt-10 rounded-2xl border border-teal-300/20 bg-teal-300/[0.045] p-5 md:p-6" aria-label="Continue this decision across Atlas products" data-print="hide">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300">Continue this decision</p>
          <h2 className="mt-2 text-xl font-bold text-slate-100">{item.title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">Move from public orientation into the matching Blueprint discovery context, Pro depth or Career evidence track without losing the decision boundary.</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/20 bg-amber-300/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-amber-200"><ShieldAlert className="h-3.5 w-3.5" /> Not SME-approved</span>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <ProductLink href={`/quality-lab/discovery-pack?package=${item.id}`} label="Blueprint discovery" destination="quality-lab-discovery" packageId={item.id} icon={Building2} />
        <ProductLink href={`/pro?package=${item.id}`} label="Atlas Pro depth" destination="pro" packageId={item.id} icon={BookOpenCheck} />
        <ProductLink href={careerHref} label="Career evidence track" destination="career" packageId={item.id} icon={BriefcaseBusiness} />
      </div>
      <p className="mt-4 text-xs leading-5 text-slate-500">Blueprint receives evidence and discovery context only. This handoff creates no calculation, recommendation, competence verification or product/site approval.</p>
    </section>
  );
}

function ProductLink({ href, label, destination, packageId, icon: Icon }: { href: string; label: string; destination: string; packageId: string; icon: typeof Building2 }) {
  return <Link href={href} onClick={() => analytics.decisionPackageProductHandoff(packageId, destination)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-950/25 px-4 py-3 text-sm font-bold text-slate-200 transition hover:border-teal-300/35 hover:text-teal-100"><Icon className="h-4 w-4 text-teal-300" />{label}<ArrowRight className="h-3.5 w-3.5" /></Link>;
}
