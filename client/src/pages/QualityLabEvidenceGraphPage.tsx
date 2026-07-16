import { useMemo, useState } from "react";
import { ArrowRight, BookOpen, Boxes, FlaskConical, Network, ShieldCheck, Wrench } from "lucide-react";
import { Link } from "wouter";
import { QualityLabEditorialHero } from "@/components/QualityLabEditorialHero";
import { atlasEvidenceDomains, blueprintDecisions, type BlueprintDecisionId, type EvidenceResourceKind } from "@/data/atlasEvidenceGraph";
import { useSEO } from "@/hooks/use-seo";

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

export default function QualityLabEvidenceGraphPage() {
  const [decision, setDecision] = useState<BlueprintDecisionId | "all">("all");
  useSEO({
    title: "Atlas Evidence Graph | Quality Lab Blueprint",
    description: "Explore how Atlas connects QC planning decisions to domain guides, lessons, operational workflows and decision-support tools.",
  });

  const visibleDomains = useMemo(() => atlasEvidenceDomains.map((domain) => ({
    ...domain,
    resources: decision === "all" ? domain.resources : domain.resources.filter((item) => item.decisions.includes(decision)),
  })).filter((domain) => domain.resources.length > 0), [decision]);

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
