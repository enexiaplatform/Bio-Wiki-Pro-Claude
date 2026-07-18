import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Boxes,
  BriefcaseBusiness,
  Building2,
  Calculator,
  ClipboardCheck,
  Crown,
  FileOutput,
  FlaskConical,
  Gauge,
  Layers3,
  Microscope,
  Network,
  ShieldCheck,
  Users,
  Workflow,
} from "lucide-react";
import { useSEO } from "@/hooks/use-seo";
import { analytics } from "@/hooks/use-analytics";
import { EditorialImage } from "@/components/EditorialImage";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (index = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.48, delay: index * 0.07 },
  }),
};

const compilationSteps = [
  { icon: Boxes, label: "Products & markets", detail: "Portfolio, batches, target markets" },
  { icon: ClipboardCheck, label: "Quality requirements", detail: "Tests, methods, frequency, TAT" },
  { icon: Network, label: "Capability architecture", detail: "People, equipment, space, utilities" },
  { icon: FileOutput, label: "Operating blueprint", detail: "Scenarios, costs, risks, URS/RFQ basis" },
];

const outputs = [
  { icon: Microscope, title: "Capability map", body: "Define which testing capabilities the site must own, phase, or outsource." },
  { icon: Gauge, title: "Capacity model", body: "Translate demand into hands-on hours, equipment loading, headroom, and bottlenecks." },
  { icon: Users, title: "Operating model", body: "Estimate staffing, shifts, review load, resilience, and turnaround constraints." },
  { icon: Building2, title: "Space concept", body: "Create planning allowances for receipt, preparation, testing, incubation, and support flows." },
  { icon: BarChart3, title: "CAPEX & OPEX", body: "Compare vendor-neutral budget bands, consumables, maintenance, and growth scenarios." },
  { icon: ShieldCheck, title: "Decision traceability", body: "Keep assumptions, confidence, unresolved inputs, and expert-review points visible." },
];

const layers = [
  {
    number: "01",
    eyebrow: "Atlas Evidence",
    title: "The basis for trust",
    body: "Evidence-backed workflows, method context, and regulatory source mapping support every decision path.",
    icon: BookOpen,
  },
  {
    number: "02",
    eyebrow: "Atlas Intelligence",
    title: "The compounding asset",
    body: "A versioned Method Graph, calculation rules, assumptions, and project benchmarks turn knowledge into decisions.",
    icon: Network,
  },
  {
    number: "03",
    eyebrow: "Atlas Blueprint",
    title: "The commercial output",
    body: "An expert-review-ready operating model that QC, QA, engineering, and procurement can challenge together.",
    icon: Layers3,
  },
];

const evidenceLinks = [
  { href: "/workflows", icon: Workflow, title: "QC workflows", body: "See the process logic behind a capability.", image: "/images/editorial/cleanroom-practice.jpg", alt: "Laboratory technicians applying controlled hygiene practices", credit: "Toon Lambrechts", creditUrl: "https://unsplash.com/photos/RkG7wp75b48" },
  { href: "/academy", icon: BookOpen, title: "Evidence library", body: "Explore structured lessons and source context.", image: "/images/editorial/microscope-workbench.jpg", alt: "Laboratory microscope ready for analytical work", credit: "Mezidi Zineb", creditUrl: "https://unsplash.com/photos/dAHABqJ8Nlw" },
  { href: "/tools", icon: Calculator, title: "Decision tools", body: "Check focused calculations with visible formulas.", image: "/images/editorial/pipette-laboratory.jpg", alt: "Scientist using a precision pipette at a laboratory workbench", credit: "Nathan Rimoux", creditUrl: "https://unsplash.com/photos/AqVLU4cx8OI" },
];

const atlasOffers = [
  {
    audience: "For quality teams",
    title: "Plan a quality laboratory",
    body: "Turn testing demand into a practical lab operating plan.",
    price: "Free model · $149 diagnostic · from $990",
    cta: "Explore Quality Lab",
    href: "/quality-lab",
    icon: Building2,
    tone: "border-teal-300/35 bg-teal-300/[0.075]",
    iconTone: "bg-teal-300 text-slate-950",
  },
  {
    audience: "For working professionals",
    title: "Use deeper evidence and tools",
    body: "Get practical lessons, tools, templates, and working files.",
    price: "Free access · Pro from $8/month",
    cta: "Compare Free and Pro",
    href: "/pricing#evidence-plans",
    icon: Crown,
    tone: "border-sky-300/20 bg-sky-300/[0.045]",
    iconTone: "bg-sky-300/12 text-sky-200",
  },
  {
    audience: "For your next career move",
    title: "Build a personal career plan",
    body: "See your strongest route, skill gaps, and next 13 weeks.",
    price: "Free snapshot · $20 one-time Blueprint",
    cta: "Start Career Snapshot",
    href: "/career",
    icon: BriefcaseBusiness,
    tone: "border-amber-300/25 bg-amber-300/[0.045]",
    iconTone: "bg-amber-300/12 text-amber-200",
  },
];

const boundaries = [
  "Planning intelligence — not detailed architectural, HVAC, or construction design",
  "Vendor-neutral requirements — not supplier quotations or product placement",
  "Regulatory mapping support — not legal advice or an approved site specification",
  "Human-reviewed decisions — not autonomous compliance or investment approval",
];

const primaryCta = "inline-flex items-center justify-center gap-2 rounded-xl bg-teal-300 px-5 py-3 text-sm font-bold text-slate-950 shadow-xl shadow-teal-500/20 transition hover:-translate-y-0.5 hover:bg-teal-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08111f]";
const secondaryCta = "inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08111f]";

export default function LandingPage() {
  useSEO({
    title: "Quality Laboratory Decision Intelligence",
    description: "Atlas converts products, regulations and testing demand into an expert-review-ready quality laboratory operating blueprint.",
  });

  const trackCta = (placement: string, destination: string) => () => {
    analytics.blueprintCtaClicked(placement, destination);
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#08111f] text-slate-100">
      <section className="relative isolate border-b border-white/10 px-4 pb-12 pt-10 md:pb-16 md:pt-16">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_16%_8%,rgba(45,212,191,0.2),transparent_28%),radial-gradient(circle_at_84%_16%,rgba(56,189,248,0.13),transparent_28%)]" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:52px_52px] [mask-image:linear-gradient(to_bottom,black,transparent_88%)]" />

        <div className="mx-auto grid max-w-6xl gap-9 lg:grid-cols-[1.04fr_0.96fr] lg:items-center">
          <div>
            <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
              <span className="inline-flex items-center gap-2 rounded-full border border-teal-300/25 bg-teal-300/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-teal-200">
                <FlaskConical className="h-3.5 w-3.5" /> Quality lab decision intelligence
              </span>
            </motion.div>

            <motion.h1 variants={fadeUp} initial="hidden" animate="show" custom={1} className="mt-5 max-w-3xl font-display text-4xl font-bold leading-[1.05] md:text-5xl lg:text-[3.35rem]">
              Plan the right quality lab <span className="text-teal-300">before you spend.</span>
            </motion.h1>

            <motion.p variants={fadeUp} initial="hidden" animate="show" custom={2} className="mt-5 max-w-xl text-base leading-7 text-slate-300 md:text-lg">
              Turn products and testing demand into a clear plan for capability, capacity, people, equipment, and cost.
            </motion.p>

            <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3} className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/quality-lab/planner" className={primaryCta} onClick={trackCta("home_hero", "planner")}>
                Build a free lab model <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#atlas-products" className={secondaryCta}>
                See all products
              </a>
            </motion.div>

            <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4} className="mt-6 hidden flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-slate-400 sm:flex">
              <span>Vendor-neutral</span><span className="text-slate-600">•</span>
              <span>Assumptions visible</span><span className="text-slate-600">•</span>
              <span>Expert review available</span>
            </motion.div>
          </div>

          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2} className="relative hidden lg:block">
            <div className="absolute -inset-8 -z-10 rounded-full bg-teal-400/10 blur-3xl" />
            <div className="overflow-hidden rounded-3xl border border-white/12 bg-slate-950/80 p-5 shadow-2xl shadow-black/40 backdrop-blur md:p-6">
              <EditorialImage
                src="/images/editorial/pipette-laboratory.jpg"
                alt="Scientist translating a laboratory method into controlled bench work"
                creditName="Nathan Rimoux"
                creditUrl="https://unsplash.com/photos/AqVLU4cx8OI"
                eager
                className="-mx-5 -mt-5 mb-5 h-28 border-b border-white/10 md:-mx-6 md:-mt-6"
                imageClassName="object-[center_44%] opacity-75 saturate-75"
              />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300">Example planning output</p>
                  <p className="mt-1 font-display text-xl font-bold">One model your whole team can challenge</p>
                </div>
                <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-200">Concept</span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {compilationSteps.map((step, index) => (
                  <div key={step.label} className="relative rounded-xl border border-white/8 bg-white/[0.025] p-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-300/10 text-teal-200"><step.icon className="h-4 w-4" /></div>
                    <p className="mt-3 text-xs font-semibold leading-4">{step.label}</p>
                    {index < compilationSteps.length - 1 && <ArrowRight className="absolute -right-3 top-5 z-10 hidden h-3.5 w-3.5 text-teal-300/60 sm:block" />}
                  </div>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-3 divide-x divide-white/10 rounded-xl border border-white/10 bg-white/[0.035] py-3 text-center">
                {["Capability", "Capacity", "Cost & risk"].map((item) => <span key={item} className="px-2 text-[11px] font-semibold text-slate-300">{item}</span>)}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="atlas-products" className="scroll-mt-20 border-b border-white/10 bg-slate-950/45 px-4 py-8 md:py-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className="hidden text-xs font-bold uppercase tracking-[0.18em] text-teal-300 sm:block">Choose your outcome</p>
              <h2 className="text-3xl font-bold sm:mt-2 md:text-4xl">Choose your path</h2>
            </div>
            <Link href="/pricing" className="inline-flex items-center gap-2 text-sm font-semibold text-teal-300 transition hover:text-teal-200">
              Compare plans <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-5 grid gap-4 md:mt-7 lg:grid-cols-3">
            {atlasOffers.map((offer) => (
              <Link key={offer.title} href={offer.href} className={`group flex min-h-[250px] flex-col rounded-2xl border p-5 transition hover:-translate-y-1 hover:border-teal-200/45 ${offer.tone}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${offer.iconTone}`}><offer.icon className="h-5 w-5" /></div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{offer.audience}</span>
                </div>
                <h3 className="mt-5 text-xl font-bold leading-tight">{offer.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-slate-400">{offer.body}</p>
                <div className="mt-5 border-t border-white/10 pt-4">
                  <p className="text-sm font-semibold text-slate-100">{offer.price}</p>
                  <span className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-teal-300">{offer.cta} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-slate-950/35 px-4 py-8">
        <div className="mx-auto grid max-w-6xl gap-3 text-center text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 sm:grid-cols-4">
          {["Requirements", "Capabilities", "Resources", "Controlled output"].map((item, index) => (
            <div key={item} className="flex items-center justify-center gap-3 rounded-xl border border-white/8 bg-white/[0.025] px-3 py-3">
              <span className="text-teal-300">0{index + 1}</span> {item}
              {index < 3 && <ArrowRight className="hidden h-3.5 w-3.5 text-slate-600 sm:block" />}
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-300">Requirements-to-blueprint</p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl">Define what the laboratory must be capable of before choosing vendors or drawing rooms.</h2>
            <p className="mt-4 max-w-2xl leading-7 text-slate-400">Atlas gives QC, QA, engineering, and procurement one operating model to challenge together before expensive commitments are made.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {outputs.map((item, index) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: (index % 3) * 0.07 }} className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.055] to-white/[0.02] p-5 shadow-lg shadow-black/10">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-teal-300/15 bg-teal-300/10 text-teal-200"><item.icon className="h-5 w-5" /></div>
                <h3 className="mt-5 text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{item.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-slate-950/45 px-4 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-300">One compounding system</p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl">Knowledge becomes intelligence. Intelligence becomes a controlled decision package.</h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {layers.map((layer) => (
              <div key={layer.number} className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] p-6">
                <span className="absolute right-5 top-4 font-display text-4xl font-bold text-white/[0.045]">{layer.number}</span>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-300/10 text-teal-200"><layer.icon className="h-5 w-5" /></div>
                <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300">{layer.eyebrow}</p>
                <h3 className="mt-2 text-xl font-bold">{layer.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{layer.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.03fr_0.97fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-300">Focused entry, wider destination</p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl">Microbiology is the first Domain Pack — not the edge of the map.</h2>
            <p className="mt-5 max-w-2xl leading-7 text-slate-400">The concept edition starts with non-sterile pharmaceutical microbiology because the workflows are structured and the domain knowledge is strongest. The Compiler Core is designed for regulated manufacturing quality across pharma, biologics, food, cosmetics, and medical devices.</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/quality-lab/planner" className={primaryCta} onClick={trackCta("home_domain", "planner")}>
                Start with Microbiology <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/quality-lab/review" className={secondaryCta} onClick={trackCta("home_domain", "expert_review")}>
                Discuss a real lab project
              </Link>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-950/65 p-5 shadow-2xl shadow-black/20 md:p-6">
            <div className="rounded-2xl border border-teal-300/20 bg-teal-300/10 p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-200">Domain Pack 01 · active concept</p>
              <h3 className="mt-2 text-xl font-bold">Non-sterile Pharma Microbiology</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">Microbial limits, specified organisms, water, media QC, growth promotion, suitability, and capacity planning.</p>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {["Sterile & biologics", "Analytical chemistry", "Stability", "Food & beverage"].map((item) => (
                <div key={item} className="rounded-xl border border-dashed border-white/12 bg-white/[0.025] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Evidence-gated</p>
                  <p className="mt-1 text-sm font-semibold text-slate-400">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-slate-950/45 px-4 py-16">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">Strict product boundary</p>
            <h2 className="mt-3 text-3xl font-bold">Planning intelligence, with expert judgment kept in the loop.</h2>
            <p className="mt-4 leading-7 text-slate-400">Atlas improves the basis of design. It does not pretend to replace qualified site teams, engineering, validation, or regulatory review.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {boundaries.map((item) => (
              <div key={item} className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-4 text-sm leading-6 text-slate-300">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" /> {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-300">Atlas Evidence</p>
            <h2 className="mt-3 text-3xl font-bold">Inspect the knowledge behind the decisions.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {evidenceLinks.map((item) => (
              <Link key={item.href} href={item.href} className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] transition hover:-translate-y-1 hover:border-teal-300/30 hover:bg-white/[0.055]">
                <EditorialImage src={item.image} alt={item.alt} creditName={item.credit} creditUrl={item.creditUrl} className="h-36 border-b border-white/10" imageClassName="opacity-80 saturate-75" />
                <div className="p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-teal-200"><item.icon className="h-5 w-5" /></div>
                <h3 className="mt-5 text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{item.body}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-teal-300">Explore evidence <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 pt-4">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-teal-300/25 bg-gradient-to-br from-teal-300/15 via-sky-300/5 to-transparent p-7 shadow-2xl shadow-teal-950/25 md:p-10">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-300 text-slate-950"><Layers3 className="h-5 w-5" /></div>
              <h2 className="mt-6 text-3xl font-bold">Build the first model. Then pressure-test it with experts.</h2>
              <p className="mt-3 leading-7 text-slate-300">The concept engine gives your team a shared starting point. Expert review turns assumptions, gaps, and scenarios into a controlled project brief.</p>
            </div>
            <div className="flex shrink-0 flex-col gap-3">
              <Link href="/quality-lab/planner" className={primaryCta} onClick={trackCta("home_final", "planner")}>Compile a blueprint <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/quality-lab/review" className={secondaryCta} onClick={trackCta("home_final", "expert_review")}>Request expert review</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
