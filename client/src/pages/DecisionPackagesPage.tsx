import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpenCheck, BriefcaseBusiness, Building2, CalendarClock, CheckCircle2, FileCheck2, ShieldAlert, Sparkles } from "lucide-react";
import { Link, useLocation } from "wouter";

import { getCareerTracksForPackage } from "@shared/career-domain-tracks";
import { EVIDENCE_SOURCE_CATALOG } from "@shared/content-quality-registry";
import { getDecisionPackage, getDecisionPackagesForLane, getNextDecisionPackage, type DecisionPackage, type DecisionPackageLane } from "@shared/decision-packages";
import { analytics } from "@/hooks/use-analytics";
import { useSEO } from "@/hooks/use-seo";

const laneLabels: Record<DecisionPackageLane, string> = {
  biopharma: "Biopharma",
  "pharma-api": "Pharma/API",
  "pharma-drug-product": "Drug product",
  "cross-cutting-quality-rd": "Cross-product governance",
};

const laneDescriptions: Record<DecisionPackageLane, string> = {
  biopharma: "Follow product and process evidence from substrate and materials through analytics, validation, comparability and transfer.",
  "pharma-api": "Connect route, inputs, unit operations, impurities, analytical lifecycle, validation and change.",
  "pharma-drug-product": "Use a dosage-form-aware framework with a bounded synthetic oral-solid-dose example.",
  "cross-cutting-quality-rd": "Move analytical and quality signals through data, investigation, CAPA, effectiveness and change.",
};

const laneOrder: DecisionPackageLane[] = ["biopharma", "pharma-api", "pharma-drug-product", "cross-cutting-quality-rd"];
const laneSlugs: Partial<Record<DecisionPackageLane, string>> = { biopharma: "biopharma", "pharma-api": "pharma-api", "pharma-drug-product": "drug-product" };

export default function DecisionPackagesPage() {
  const [location] = useLocation();
  const packageId = location.startsWith("/evidence/packages/") ? location.split("/")[3]?.split("?")[0] : undefined;
  const packageItem = packageId ? getDecisionPackage(packageId) : undefined;
  const hubLane = location === "/evidence/biopharma" ? "biopharma" : location === "/evidence/pharma-api" ? "pharma-api" : location === "/evidence/drug-product" ? "pharma-drug-product" : undefined;

  useSEO({
    title: packageItem ? `${packageItem.title} | Atlas Evidence` : hubLane ? `${laneLabels[hubLane]} Evidence Hub | Atlas Evidence` : "Decision Packages | Atlas Evidence",
    description: packageItem?.summary ?? (hubLane ? laneDescriptions[hubLane] : "Evidence-linked decision packages connecting Biopharma, Pharma/API and drug-product quality work to Atlas Pro, Blueprint and Career."),
  });

  useEffect(() => {
    if (packageItem) analytics.decisionPackageViewed(packageItem.id, packageItem.lane, packageItem.reviewStatus);
  }, [packageItem]);

  if (packageId && !packageItem) {
    return <div className="mx-auto max-w-5xl px-4 py-20 text-center text-slate-200"><h1 className="text-3xl font-bold">Decision package not found</h1><Link href="/evidence" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-teal-300">Back to Atlas Evidence <ArrowRight className="h-4 w-4" /></Link></div>;
  }

  return packageItem ? <DecisionPackageDetail item={packageItem} /> : <DecisionPackageIndex lane={hubLane} />;
}

function DecisionPackageIndex({ lane }: { lane?: DecisionPackageLane }) {
  const visibleLanes = lane ? [lane] : laneOrder;
  return (
    <main className="min-h-screen bg-[#061426] text-slate-100">
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,.16),transparent_42%),#07182d] px-4 pb-14 pt-16 md:pb-20 md:pt-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-teal-300"><Sparkles className="h-4 w-4" /> Atlas Evidence · decision packages</p>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight tracking-[-0.03em] md:text-6xl">{lane ? `${laneLabels[lane]} evidence for the decision in front of you.` : "A connected evidence path for the decision in front of you."}</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">{lane ? laneDescriptions[lane] : "Each package connects public orientation, deeper professional resources, a Blueprint context and a Career evidence route. Review maturity stays visible at every step."}</p>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <TrustCard icon={BookOpenCheck} label="Evidence" body="Named sources, applicability and limitations." />
            <TrustCard icon={Building2} label="Blueprint context" body="Discovery support, not a new verified Domain Pack." />
            <TrustCard icon={BriefcaseBusiness} label="Career evidence" body="Competency activities, not competence certification." />
          </div>
          <div className="mt-6 flex flex-wrap gap-2" aria-label="Evidence domain hubs"><Link href="/evidence" className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${!lane ? "border-teal-300/35 bg-teal-300/10 text-teal-200" : "border-white/10 text-slate-400"}`}>All packages</Link>{(["biopharma", "pharma-api", "pharma-drug-product"] as DecisionPackageLane[]).map((hub) => <Link key={hub} href={`/evidence/${laneSlugs[hub]}`} className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${lane === hub ? "border-teal-300/35 bg-teal-300/10 text-teal-200" : "border-white/10 text-slate-400"}`}>{laneLabels[hub]}</Link>)}</div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-10 md:py-14">
        <div className="space-y-12">
          {visibleLanes.map((lane) => {
            const items = getDecisionPackagesForLane(lane);
            return <section key={lane} aria-labelledby={`${lane}-packages`}>
              <div className="flex flex-col gap-2 border-b border-white/10 pb-4 md:flex-row md:items-end md:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300">{laneLabels[lane]}</p><h2 id={`${lane}-packages`} className="mt-2 text-2xl font-bold">{laneLabels[lane]} decision chain</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{laneDescriptions[lane]}</p></div><span className="text-xs font-semibold text-slate-500">{items.length} package{items.length === 1 ? "" : "s"}</span></div>
              <div className="mt-5 grid gap-4 lg:grid-cols-2">{items.map((item) => <PackageCard key={item.id} item={item} />)}</div>
            </section>;
          })}
        </div>
      </section>
    </main>
  );
}

function PackageCard({ item }: { item: DecisionPackage }) {
  return <Link href={`/evidence/packages/${item.id}`} className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.035] p-5 transition hover:-translate-y-0.5 hover:border-teal-300/35 hover:bg-teal-300/[0.045] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300/50"><div className="flex items-start justify-between gap-4"><div><span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Month {item.month} · {item.reviewStatus}</span><h3 className="mt-2 text-lg font-bold text-slate-100 group-hover:text-teal-200">{item.title}</h3></div><ArrowRight className="mt-1 h-5 w-5 shrink-0 text-slate-600 transition group-hover:translate-x-1 group-hover:text-teal-300" /></div><p className="mt-3 text-sm leading-6 text-slate-400">{item.summary}</p><div className="mt-auto flex flex-wrap gap-2 pt-5">{item.stageRefs.map((stage) => <span key={`${stage.systemId}:${stage.stageId}`} className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-semibold text-slate-500">{stage.stageId.replaceAll("-", " ")}</span>)}</div></Link>;
}

function DecisionPackageDetail({ item }: { item: DecisionPackage }) {
  const careerTracks = getCareerTracksForPackage(item.id);
  const careerTrack = careerTracks[0];
  const nextPackage = getNextDecisionPackage(item.id);
  const [completed, setCompleted] = useState(false);
  const existingArtifacts = item.artifactPlan.filter((artifact) => artifact.status === "existing").length;
  return (
    <main className="min-h-screen bg-[#061426] px-4 pb-24 pt-20 text-slate-100 md:pt-28">
      <div className="mx-auto max-w-6xl">
        <Link href="/evidence" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-teal-300 hover:text-teal-200"><ArrowLeft className="h-4 w-4" /> Atlas Evidence</Link>
        <header className="mt-6 max-w-4xl"><div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500"><span>Month {item.month}</span><span>·</span><span>{laneLabels[item.lane]}</span><span>·</span><span className="text-violet-300">{item.reviewStatus}</span></div><h1 className="mt-4 font-display text-4xl font-bold leading-tight tracking-[-0.03em] md:text-6xl">{item.title}</h1><p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">{item.summary}</p></header>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
          <section className="rounded-2xl border border-teal-300/20 bg-teal-300/[0.045] p-5 md:p-7"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300">Decision question</p><p className="mt-3 text-xl font-semibold leading-8 text-slate-100">{item.decisionQuestion}</p><p className="mt-5 text-sm leading-7 text-slate-400">{item.applicability}</p></section>
          <section className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.04] p-5 md:p-7"><p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200"><ShieldAlert className="h-4 w-4" /> Review boundary</p><p className="mt-3 text-sm leading-7 text-slate-300">This package is editorial-reviewed but not SME-approved. {item.compilerMode === "evidence-context-only" ? "It provides Blueprint evidence context only; the executable Compiler remains limited to the non-sterile microbiology wedge." : "It can be used only within the stated scope and review state."}</p></section>
        </div>

        <section className="mt-6 rounded-2xl border border-violet-300/20 bg-violet-300/[0.04] p-5 md:p-7"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-200">Discovery questions</p><p className="mt-2 text-sm leading-6 text-slate-500">Use these prompts to identify evidence, owners and next decisions; they do not supply a recommendation or acceptance criterion.</p><div className="mt-4 grid gap-3 md:grid-cols-2">{item.discoveryQuestions.map((question, index) => <div key={question} className="flex gap-3 rounded-xl border border-white/10 bg-slate-950/20 p-4"><span className="text-xs font-bold text-violet-300">0{index + 1}</span><p className="text-sm leading-6 text-slate-300">{question}</p></div>)}</div></section>

        <button type="button" onClick={() => { setCompleted(true); analytics.decisionPackageCompleted(item.id, existingArtifacts); }} className={`mb-4 inline-flex min-h-10 items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold ${completed ? "bg-teal-300 text-slate-950" : "border border-teal-300/30 bg-teal-300/10 text-teal-200"}`}>{completed ? "Package review noted" : "Mark review step complete"}<CheckCircle2 className="h-4 w-4" /></button>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 md:p-7"><h2 className="text-xl font-bold">Connected resources</h2><p className="mt-2 text-sm leading-6 text-slate-500">Existing evidence is reused where available; planned artifacts stay visibly open.</p><div className="mt-5 space-y-2">{item.assetRefs.map((asset) => <a key={`${asset.kind}:${asset.slug}`} href={asset.href} onClick={() => analytics.decisionPackageAssetOpened(item.id, asset.kind, asset.slug)} className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-slate-950/20 px-4 py-3 text-sm transition hover:border-teal-300/35"><span><span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">{asset.kind}</span><span className="mt-1 block font-semibold text-slate-200">{asset.title}</span></span><ArrowRight className="h-4 w-4 shrink-0 text-teal-300" /></a>)}</div></section>
          <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 md:p-7"><h2 className="text-xl font-bold">Package completeness</h2><div className="mt-5 space-y-2">{item.artifactPlan.map((artifact) => <div key={artifact.kind} className="flex items-start gap-3 rounded-xl border border-white/10 bg-slate-950/20 px-4 py-3"><CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${artifact.status === "existing" ? "text-teal-300" : "text-amber-300"}`} /><div><p className="text-sm font-semibold text-slate-200">{artifact.title}</p><p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-600">{artifact.status === "existing" ? "Available" : "Planned · evidence required"}</p></div></div>)}</div></section>
        </div>

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.025] p-5 md:p-7"><div className="grid gap-6 lg:grid-cols-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">Sources</p><div className="mt-3 flex flex-wrap gap-2">{item.sourceIds.map((sourceId) => <span key={sourceId} className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-semibold text-slate-400">{sourceId}</span>)}</div></div><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">Required reviewers</p><ul className="mt-3 space-y-1 text-sm leading-6 text-slate-400">{item.reviewerRoles.map((role) => <li key={role}>• {role}</li>)}</ul></div><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">Limitations</p><ul className="mt-3 space-y-1 text-sm leading-6 text-slate-400">{item.limitations.map((limitation) => <li key={limitation}>• {limitation}</li>)}</ul></div></div></section>

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.025] p-5 md:p-7"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">Controlled source map &amp; licensing boundary</p><div className="mt-4 grid gap-3 md:grid-cols-2">{item.sourceIds.map((sourceId) => { const source = EVIDENCE_SOURCE_CATALOG.sources.find((candidate) => candidate.id === sourceId); return <article key={sourceId} className="rounded-xl border border-white/10 bg-slate-950/20 p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-slate-200">{source?.title ?? sourceId}</p><p className="mt-1 text-[10px] uppercase tracking-wider text-slate-600">{sourceId} · {item.sourceVersions[sourceId]}</p><p className="mt-1 text-[10px] text-slate-600">{source?.publisher ?? "Official source"}{source?.effectiveDate ? ` · effective ${source.effectiveDate}` : ""}</p></div>{source?.locator && <a href={source.locator} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-teal-300 hover:text-teal-200">Official source</a>}</div><p className="mt-3 text-xs leading-5 text-slate-500">{source?.licensingBoundary ?? "Confirm current edition, applicability and licensing before use."}</p></article>; })}</div></section>
        <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Handoff href={`/quality-lab/planner?package=${item.id}`} label="Use in Blueprint context" icon={Building2} destination="quality-lab" packageId={item.id} /><Handoff href={`/pro?package=${item.id}`} label="Continue in Atlas Pro" icon={BookOpenCheck} destination="pro" packageId={item.id} /><Handoff href={careerTracks.length > 1 ? "/career/domains" : careerTrack ? `/career?domain=${careerTrack.id}` : "/career"} label={careerTracks.length > 1 ? "Build shared Career evidence" : careerTrack ? `Build ${careerTrack.title} evidence` : "Build Career evidence"} icon={BriefcaseBusiness} destination="career" packageId={item.id} /><Handoff href={`/pro/monthly-review?package=${item.id}`} label="Run monthly review" icon={CalendarClock} destination="pro-monthly-review" packageId={item.id} /></section>
        {nextPackage && <section className="mt-6 flex flex-col gap-3 rounded-2xl border border-sky-300/20 bg-sky-300/[0.045] p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-300">Next lifecycle stage</p><p className="mt-2 text-sm font-semibold text-slate-200">Continue with {nextPackage.title}</p><p className="mt-1 text-xs leading-5 text-slate-500">Keep the same decision lineage and carry unresolved evidence into the next package.</p></div><Link href={`/pro?package=${nextPackage.id}`} onClick={() => analytics.decisionPackageProductHandoff(item.id, "pro-next-stage")} className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-sky-300 px-4 py-2 text-xs font-bold text-slate-950">Open next stage in Pro <ArrowRight className="h-4 w-4" /></Link></section>}
      </div>
    </main>
  );
}

function Handoff({ href, label, icon: Icon, destination, packageId }: { href: string; label: string; icon: typeof Building2; destination: string; packageId: string }) {
  return <Link href={href} onClick={() => analytics.decisionPackageProductHandoff(packageId, destination)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-center text-sm font-bold text-slate-200 transition hover:border-teal-300/35 hover:bg-teal-300/[0.08] hover:text-teal-100"><Icon className="h-4 w-4 text-teal-300" />{label}</Link>;
}

function TrustCard({ icon: Icon, label, body }: { icon: typeof Building2; label: string; body: string }) {
  return <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4"><Icon className="h-4 w-4 text-teal-300" /><p className="mt-3 text-sm font-bold text-slate-200">{label}</p><p className="mt-1 text-xs leading-5 text-slate-500">{body}</p></div>;
}
