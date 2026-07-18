import { Link } from "wouter";
import { ArrowRight, CheckCircle2, Database, Network, PackageCheck, ShieldCheck } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { useSEO } from "@/hooks/use-seo";
import { SITE_URL } from "@/lib/site";

const layers = [
  {
    icon: Database,
    title: "Atlas Evidence",
    desc: "Structured regulations, methods, product context, assumptions, and known gaps—with source links and review status.",
  },
  {
    icon: Network,
    title: "Atlas Intelligence",
    desc: "Rules and models connect testing demand to methods, equipment, capacity, controls, and operational consequences.",
  },
  {
    icon: PackageCheck,
    title: "Commercial outputs",
    desc: "Decision briefs, capability models, demand scenarios, and quality-laboratory blueprints prepared for expert review.",
  },
];

const audiences = [
  "Manufacturers building, expanding, or reassessing a regulated QC laboratory",
  "Engineering firms and equipment partners shaping an evidence-backed lab concept",
  "Contract laboratories evaluating capability, capacity, and service-fit decisions",
];

const proofPoints = [
  { value: "1st wedge", label: "Non-sterile microbiology" },
  { value: "3 layers", label: "Evidence to outputs" },
  { value: "Expert review", label: "Service-assisted delivery" },
];

const cardClass = "rounded-xl border border-white/10 bg-white/[0.045] p-5 shadow-lg shadow-black/10";

export default function About() {
  useSEO({
    title: "About Life Science Atlas | Decision intelligence for quality laboratories",
    description: "Life Science Atlas converts product, regulatory, and testing demand into evidence-linked quality-laboratory operating blueprints.",
  });

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-4 md:pt-8">
      <JsonLd
        id="about-org"
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Life Science Atlas",
          url: SITE_URL,
          description: "Decision intelligence for regulated manufacturing quality and quality-laboratory planning.",
          knowsAbout: ["Quality laboratory planning", "Pharmaceutical microbiology", "GMP", "Testing demand", "Laboratory capacity"],
        }}
      />

      <section className="mb-8 overflow-hidden rounded-xl border border-teal-400/20 bg-gradient-to-br from-teal-500/12 via-white/[0.045] to-emerald-500/10 shadow-xl shadow-black/15">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
          <div className="p-6 md:p-8 lg:py-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-400/25 bg-teal-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-teal-200">
              <ShieldCheck className="h-3.5 w-3.5" /> About Life Science Atlas
            </span>
            <h1 className="mt-5 max-w-3xl font-display text-3xl font-bold leading-tight md:text-5xl">
              Decision intelligence for regulated manufacturing quality.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Atlas converts product, regulatory, and testing demand into an evidence-linked quality-laboratory operating blueprint—so teams can see what is required, why it is required, and what remains uncertain.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/quality-lab/planner" className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-400 px-5 py-3 text-sm font-bold text-teal-950 transition hover:bg-teal-300">
                Build an initial model <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/quality-lab/review" className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold transition hover:border-white/30 hover:bg-white/10">
                Request expert review
              </Link>
            </div>
          </div>
          <div className="flex min-h-72 items-center border-t border-white/10 bg-[#071520] p-6 lg:min-h-full lg:border-l lg:border-t-0">
            <div className="w-full space-y-3" aria-label="Atlas reasoning flow">
              {[{ label: "Products and markets", note: "Customer facts" }, { label: "Methods and demand", note: "Evidence-linked model" }, { label: "Operating blueprint", note: "Controlled decision package" }].map((item, index) => (
                <div key={item.label} className="relative rounded-xl border border-teal-300/20 bg-teal-300/[0.07] p-4">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300">0{index + 1}</span>
                  <p className="mt-1 font-bold">{item.label}</p><p className="mt-1 text-xs text-muted-foreground">{item.note}</p>
                  {index < 2 && <span aria-hidden="true" className="absolute -bottom-4 left-1/2 z-10 text-teal-300">↓</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="grid border-t border-white/10 sm:grid-cols-3">
          {proofPoints.map((point) => (
            <div key={point.label} className="border-b border-white/10 p-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
              <p className="font-bold text-teal-200">{point.value}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{point.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-300">How Atlas works</p>
        <h2 className="mt-2 text-2xl font-bold">A traceable path from source evidence to a decision-ready output</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {layers.map((layer, index) => (
            <article key={layer.title} className={cardClass}>
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-teal-400/20 bg-teal-400/10 text-teal-200"><layer.icon className="h-5 w-5" /></div>
                <span className="text-xs font-bold text-muted-foreground">0{index + 1}</span>
              </div>
              <h3 className="mt-4 font-bold">{layer.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{layer.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-8 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className={cardClass}>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-300">Mission</p>
          <h2 className="mt-2 text-2xl font-bold">Make quality-laboratory decisions defensible.</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Critical design knowledge is often fragmented across regulations, methods, spreadsheets, vendor conversations, and senior practitioners. Atlas makes the reasoning visible: inputs, rules, assumptions, uncertainty, and the evidence behind each recommendation.
          </p>
        </div>
        <div className={cardClass}>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-300">First customers</p>
          <ul className="mt-4 space-y-3">
            {audiences.map((item) => <li key={item} className="flex items-start gap-3 text-sm leading-relaxed"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" /><span>{item}</span></li>)}
          </ul>
        </div>
      </section>

      <section className="mb-8 rounded-xl border border-white/10 bg-white/[0.035] p-5 md:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-300">Who delivers and reviews the work</p>
        <h2 className="mt-2 text-2xl font-bold">Founder-led delivery, with engagement-specific reviewer confirmation.</h2>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-muted-foreground">Atlas owns intake, model preparation, assumption control, decision framing and the controlled delivery package. Before paid Blueprint work begins, the proposal names the accountable delivery role, the required reviewer discipline and the competence evidence that must be confirmed for that project.</p>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {[{ title: "Atlas delivery owner", body: "Controls scope, inputs, model versions, open questions and delivery records." }, { title: "Qualified project reviewer", body: "Confirmed by name and relevant competence evidence in the proposal before review is represented as complete." }, { title: "Client accountable roles", body: "QC, QA, engineering, safety and regulatory owners retain site approval and implementation responsibility." }].map((item) => <article key={item.title} className="rounded-xl border border-white/10 bg-slate-950/40 p-4"><h3 className="font-bold text-teal-100">{item.title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p></article>)}
        </div>
        <p className="mt-4 text-xs leading-5 text-amber-100/80">Atlas does not publish an unconfirmed reviewer identity, client logo, validation claim or approval reference. Engagement-specific names and evidence are disclosed before kickoff.</p>
      </section>

      <section className="mb-8 rounded-xl border border-amber-300/20 bg-amber-300/[0.055] p-5 md:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200">Trust boundary</p>
        <h2 className="mt-2 text-2xl font-bold">Decision support with explicit uncertainty—not an approval claim</h2>
        <p className="mt-3 max-w-4xl text-sm leading-relaxed text-muted-foreground">
          Atlas outputs are planning artifacts. They expose evidence, assumptions, gaps, and review status so qualified experts can verify the result against the actual product, facility, jurisdiction, and quality system before implementation.
        </p>
      </section>

      <section className="rounded-xl border border-teal-400/25 bg-teal-400/10 p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div><h2 className="text-xl font-bold">Start with a real product and testing demand.</h2><p className="mt-2 text-sm text-muted-foreground">Compile an initial blueprint, then bring the evidence and assumptions into an expert review.</p></div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href="/quality-lab/planner" className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-400 px-5 py-2.5 text-sm font-bold text-teal-950 transition hover:bg-teal-300">Build a blueprint <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/quality-lab/review" className="inline-flex items-center justify-center rounded-lg border border-white/15 px-5 py-2.5 text-sm font-semibold transition hover:border-white/30">Discuss a real project</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
