import { useMemo, useState } from "react";
import { ArrowRight, BookOpen, Boxes, CircleAlert, FlaskConical, Network, ShieldCheck, Wrench } from "lucide-react";
import { Link } from "wouter";
import { QualityLabEditorialHero } from "@/components/QualityLabEditorialHero";
import { atlasEvidenceDomains, blueprintDecisions, type BlueprintDecisionId, type EvidenceResourceKind } from "@/data/atlasEvidenceGraph";
import { useSEO } from "@/hooks/use-seo";
import { useLanguage } from "@/hooks/use-language";
import { getContentBySlug, type ContentCollection } from "@/lib/content";
import { QUALITY_LAB_TRUST_CORRIDOR, QUALITY_LAB_TRUST_CORRIDOR_VERSION } from "@shared/quality-lab-trust-corridor";

const kindIcon: Record<EvidenceResourceKind, typeof BookOpen> = {
  guide: BookOpen,
  lesson: FlaskConical,
  workflow: Network,
  tool: Wrench,
};

const maturityLabel = {
  "executable-concept": "Executable concept",
  "evidence-development": "Evidence development",
  "specialist-gated": "Specialist gated",
};

const corridorRoleLabel = {
  scope: "Scope",
  method: "Method",
  workload: "Workload",
  capacity: "Capacity",
  evidence: "Evidence",
  governance: "Governance",
};

export default function QualityLabEvidenceGraphPage() {
  const [decision, setDecision] = useState<BlueprintDecisionId | "all">("all");
  const { language } = useLanguage();
  useSEO({
    title: "Atlas Evidence Graph | Quality Lab Blueprint",
    description: "Explore how Atlas connects QC planning decisions to domain guides, lessons, operational workflows and decision-support tools.",
  });

  const visibleDomains = useMemo(() => atlasEvidenceDomains.map((domain) => ({
    ...domain,
    resources: decision === "all" ? domain.resources : domain.resources.filter((item) => item.decisions.includes(decision)),
  })).filter((domain) => domain.resources.length > 0), [decision]);
  const corridorItems = useMemo(() => QUALITY_LAB_TRUST_CORRIDOR.map((item) => {
    const [collection, slug] = item.id.split("/") as [ContentCollection, string];
    return { ...item, collection, slug, entry: getContentBySlug(collection, slug, language) };
  }), [language]);
  const corridorSourceCount = corridorItems.reduce((total, item) => total + (item.entry?.quality.sourceCount ?? 0), 0);
  const corridorPromotedCount = corridorItems.filter((item) => item.entry?.quality.promoted).length;

  return (
    <div className="min-h-screen bg-[#08111f] px-4 pb-24 pt-8 text-slate-100 md:pt-14">
      <div className="mx-auto max-w-7xl">
        <QualityLabEditorialHero
          eyebrow={<span className="inline-flex items-center gap-2 rounded-full border border-sky-300/25 bg-sky-300/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-sky-200"><Network className="h-3.5 w-3.5" /> Atlas Evidence Graph</span>}
          title="Trace the evidence behind the decision."
          description="Move from a planning question to the domain guide, technical lesson, workflow and tool that support it—then identify the controlled site evidence still needed."
          image={{ src: "/images/editorial/evidence-data-review.jpg", alt: "Two laboratory scientists reviewing analytical results at a computer workstation", creditName: "Faustina Okeke", creditUrl: "https://unsplash.com/photos/XLQuTdktpa8", className: "object-center" }}
          tone="sky"
          boundary={{ label: "Planning evidence, not site approval", text: "These resources explain the reasoning. Current controlled sources and qualified review must still establish product-specific applicability, method suitability, equipment qualification and laboratory design decisions." }}
          actions={<>
            <Link href="/quality-lab/planner" className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-300 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-teal-200">Build a Blueprint <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/quality-lab/discovery-pack" className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold hover:border-white/30">Collect project evidence</Link>
          </>}
        />

        <section className="mt-8 rounded-3xl border border-teal-300/20 bg-teal-300/[0.035] p-5 md:p-7" aria-labelledby="trust-corridor-title">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="max-w-3xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300">{QUALITY_LAB_TRUST_CORRIDOR_VERSION}</p>
              <h2 id="trust-corridor-title" className="mt-2 text-2xl font-bold">First-wedge trust corridor</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">These 20 resources are the bounded evidence path for the non-sterile microbiology Blueprint. They are registered and sourced, but remain unpromoted until their applicable editorial and specialist gates close.</p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-3"><strong className="block text-lg text-teal-200">{corridorItems.length}</strong><span className="text-[9px] uppercase tracking-wider text-slate-500">resources</span></div>
              <div className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-3"><strong className="block text-lg text-sky-200">{corridorSourceCount}</strong><span className="text-[9px] uppercase tracking-wider text-slate-500">source links</span></div>
              <div className="rounded-xl border border-amber-300/15 bg-amber-300/[0.04] px-3 py-3"><strong className="block text-lg text-amber-200">{corridorPromotedCount}</strong><span className="text-[9px] uppercase tracking-wider text-slate-500">promoted</span></div>
            </div>
          </div>
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-300/15 bg-amber-300/[0.04] p-4 text-xs leading-5 text-slate-400"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" /><p><strong className="text-slate-200">Release boundary:</strong> Registration and source linkage are not SME review, site applicability or controlled release. Each item exposes its current quality state on the destination page.</p></div>
          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {corridorItems.map((item) => {
              const href = item.collection === "academy" ? `/library/${item.slug}` : `/blog/${item.slug}`;
              return <Link key={item.id} href={href} className="group rounded-xl border border-white/10 bg-slate-950/30 p-4 transition hover:border-teal-300/30 hover:bg-white/[0.05]">
                <div className="flex items-center justify-between gap-2"><span className="text-[9px] font-bold uppercase tracking-wider text-teal-300">{corridorRoleLabel[item.role]}</span><span className="text-[9px] text-slate-500">{item.entry?.quality.sourceCount ?? 0} sources</span></div>
                <h3 className="mt-2 text-sm font-bold leading-5 text-slate-200 group-hover:text-teal-200">{item.entry?.title ?? item.slug}</h3>
                <p className="mt-2 line-clamp-2 text-[11px] leading-5 text-slate-500">{item.decisionUse}</p>
              </Link>;
            })}
          </div>
        </section>

        <section className="py-10">
          <div className="flex items-center gap-3"><Boxes className="h-5 w-5 text-teal-300" /><h2 className="text-xl font-bold">Choose the decision you need to defend</h2></div>
          <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Blueprint decision filter">
            <button type="button" onClick={() => setDecision("all")} className={`rounded-full border px-4 py-2 text-xs font-bold transition ${decision === "all" ? "border-teal-300 bg-teal-300 text-slate-950" : "border-white/10 bg-white/[0.035] text-slate-300 hover:border-white/25"}`}>All decisions</button>
            {blueprintDecisions.map((item) => <button key={item.id} type="button" onClick={() => setDecision(item.id)} title={item.question} className={`rounded-full border px-4 py-2 text-xs font-bold transition ${decision === item.id ? "border-teal-300 bg-teal-300 text-slate-950" : "border-white/10 bg-white/[0.035] text-slate-300 hover:border-white/25"}`}>{item.title}</button>)}
          </div>
          {decision !== "all" && <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-400">{blueprintDecisions.find((item) => item.id === decision)?.question}</p>}
        </section>

        <section className="grid gap-5">
          {visibleDomains.map((domain) => (
            <article key={domain.id} className="rounded-3xl border border-white/10 bg-slate-950/35 p-5 md:p-7">
              <div className="flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-300">{domain.eyebrow}</p>
                  <h2 className="mt-2 text-2xl font-bold">{domain.title}</h2>
                </div>
                <span className="w-fit rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-200">{maturityLabel[domain.maturity]}</span>
              </div>
              <div className="mt-5 flex gap-3 rounded-xl border border-amber-300/15 bg-amber-300/[0.04] p-4 text-xs leading-6 text-slate-400"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" /><p><strong className="text-slate-200">Boundary:</strong> {domain.boundary}</p></div>
              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {domain.resources.map((item) => {
                  const Icon = kindIcon[item.kind];
                  return <Link key={item.href} href={item.href} className="group flex min-h-52 flex-col rounded-2xl border border-white/10 bg-white/[0.035] p-5 transition hover:-translate-y-1 hover:border-teal-300/30 hover:bg-white/[0.055]">
                    <div className="flex items-center justify-between"><span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-teal-300"><Icon className="h-4 w-4" />{item.kind}</span><ArrowRight className="h-4 w-4 text-slate-600 transition group-hover:text-teal-300" /></div>
                    <h3 className="mt-5 font-bold leading-6 group-hover:text-teal-200">{item.title}</h3>
                    <p className="mt-3 flex-1 text-xs leading-6 text-slate-400">{item.purpose}</p>
                    <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-600">Supports {item.decisions.length} decision{item.decisions.length === 1 ? "" : "s"}</p>
                  </Link>;
                })}
              </div>
            </article>
          ))}
        </section>

      </div>
    </div>
  );
}
