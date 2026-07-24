import { Link } from "wouter";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Crown,
  FileCheck2,
  FileSpreadsheet,
  FlaskConical,
  Layers3,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { useSEO } from "@/hooks/use-seo";
import { analytics } from "@/hooks/use-analytics";
import { EditorialImage } from "@/components/EditorialImage";
import { LazyHomepageModelPreview } from "@/components/LazyHomepageModelPreview";

const journeySteps = [
  {
    number: "1",
    title: "Describe",
    body: "Define the site, products, markets, workload, constraints, and decision horizon.",
  },
  {
    number: "2",
    title: "Model",
    body: "Atlas compiles capability, capacity, people, equipment, cost, and risk scenarios.",
  },
  {
    number: "3",
    title: "Review & deliver",
    body: "Experts challenge assumptions and deliver a controlled decision package.",
  },
];

const trustPoints = [
  {
    icon: ShieldCheck,
    title: "Vendor-neutral requirements",
    body: "We are not a system or equipment seller.",
  },
  {
    icon: FileCheck2,
    title: "Visible assumptions & evidence",
    body: "See what drives each recommendation.",
  },
  {
    icon: UsersRound,
    title: "Human review stays in the loop",
    body: "Experts challenge; accountable teams decide.",
  },
];

const commercialPaths = [
  {
    eyebrow: "For quality and project teams",
    icon: Building2,
    title: "Atlas Quality Lab Blueprint",
    body: "Turn a real laboratory operating question into a vendor-neutral, expert-review-ready decision package.",
    price: "Free model · $149 diagnostic · from $990",
    note: "Flagship · project-based",
    href: "/quality-lab",
    cta: "Explore Quality Lab",
    image: "/images/blueprint/quality-lab-blueprint-deliverables.webp",
    alt: "Illustrative Quality Lab Blueprint decision package",
    imageWidth: 900,
    imageHeight: 720,
    highlights: ["Capability and capacity model", "Planning workbook", "Expert-reviewed decision package"],
    tone: "border-teal-200 bg-[#e8f8f4] text-slate-950",
    iconTone: "bg-teal-300 text-slate-950",
    textTone: "text-teal-800",
    titleTone: "text-slate-950",
    priceTone: "text-slate-950",
    bodyTone: "text-slate-600",
    dividerTone: "border-teal-900/10",
    badgeTone: "border-teal-900/10 bg-white/65 text-teal-900",
  },
  {
    eyebrow: "For deeper professional access",
    icon: Crown,
    title: "Life Science Atlas Pro",
    body: "Unlock deeper lessons, reusable working files, premium tools, and the GMP Audit Readiness Kit.",
    price: "$8/month · $80/year when available",
    note: "Professional membership",
    href: "/pro",
    cta: "Explore Atlas Pro",
    image: "/images/editorial/evidence-data-review.jpg",
    alt: "Professional reviewing quality evidence and data",
    imageWidth: 1600,
    imageHeight: 1067,
    highlights: ["Deeper evidence-backed lessons", "Reusable tools and working files", "GMP Audit Readiness Kit"],
    tone: "border-sky-300/25 bg-[#0d2942] text-white",
    iconTone: "bg-sky-300/15 text-sky-200",
    textTone: "text-sky-200",
    titleTone: "text-white",
    priceTone: "text-white",
    bodyTone: "text-slate-300",
    dividerTone: "border-white/10",
    badgeTone: "border-white/10 bg-slate-950/35 text-slate-200",
  },
  {
    eyebrow: "For your next career move",
    icon: BriefcaseBusiness,
    title: "Personal Career Blueprint",
    body: "Build a free snapshot, then unlock a named 38-page plan based on your role, evidence, constraints, and target route.",
    price: "$20 one time",
    note: "Personalized · one time",
    href: "/career",
    cta: "Start the free snapshot",
    image: "/images/career/personal-career-blueprint-preview.webp",
    alt: "Personal Career Blueprint report preview",
    imageWidth: 1421,
    imageHeight: 1107,
    highlights: ["Named and role-specific report", "Evidence and gap analysis", "Sequenced career action plan"],
    tone: "border-amber-200 bg-[#fff7df] text-slate-950",
    iconTone: "bg-amber-200 text-amber-950",
    textTone: "text-amber-800",
    titleTone: "text-slate-950",
    priceTone: "text-slate-950",
    bodyTone: "text-slate-600",
    dividerTone: "border-amber-900/10",
    badgeTone: "border-amber-900/10 bg-white/65 text-amber-900",
  },
];

const deliverables = [
  {
    icon: ClipboardCheck,
    title: "Executive decision brief",
    body: "The decision, recommended direction, material risks, and unresolved questions in one concise PDF.",
  },
  {
    icon: Layers3,
    title: "Capability & capacity model",
    body: "A practical view of what the lab needs to do, how much demand it must support, and where gaps remain.",
  },
  {
    icon: FileSpreadsheet,
    title: "Planning workbook",
    body: "People, equipment, consumables, space allowances, and CAPEX/OPEX scenarios with visible bases.",
  },
  {
    icon: FileCheck2,
    title: "Evidence & assumptions register",
    body: "Sources, user inputs, confidence, open decisions, limitations, and expert-review points kept traceable.",
  },
];

const evidenceLinks = [
  {
    href: "/workflows",
    title: "QC workflows",
    body: "See the process logic behind a capability.",
    image: "/images/editorial/cleanroom-practice.jpg",
    alt: "Laboratory technicians applying controlled hygiene practices",
    credit: "Toon Lambrechts",
    creditUrl: "https://unsplash.com/photos/RkG7wp75b48",
  },
  {
    href: "/academy",
    title: "Evidence library",
    body: "Explore structured lessons and source context.",
    image: "/images/editorial/microscope-workbench.jpg",
    alt: "Laboratory microscope ready for analytical work",
    credit: "Mezidi Zineb",
    creditUrl: "https://unsplash.com/photos/dAHABqJ8Nlw",
  },
  {
    href: "/tools",
    title: "Decision tools",
    body: "Use focused calculations with visible formulas.",
    image: "/images/editorial/pipette-laboratory.jpg",
    alt: "Scientist using a precision pipette at a laboratory workbench",
    credit: "Nathan Rimoux",
    creditUrl: "https://unsplash.com/photos/AqVLU4cx8OI",
  },
];

const primaryCta =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-teal-300 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-teal-950/25 transition hover:-translate-y-0.5 hover:bg-teal-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-100 focus-visible:ring-offset-2 focus-visible:ring-offset-[#061426]";
const secondaryCta =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/25 bg-white/[0.035] px-5 py-3 text-sm font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:border-white/45 hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-100 focus-visible:ring-offset-2 focus-visible:ring-offset-[#061426]";
const lightSecondaryCta =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-700 hover:text-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4f7f5]";

export default function LandingPage() {
  useSEO({
    title: "Quality Laboratory Decision Intelligence",
    description:
      "Atlas converts products, markets and testing demand into an expert-review-ready quality laboratory operating blueprint.",
  });

  const trackCta = (placement: string, destination: string) => () => {
    analytics.blueprintCtaClicked(placement, destination);
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#061426] text-slate-100">
      <section className="relative px-4 pb-12 pt-10 md:pt-12">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.94fr_1.06fr] lg:items-center xl:gap-14">
          <div>
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-teal-300/30 bg-teal-300/[0.07] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.17em] text-teal-200">
                <FlaskConical className="h-3.5 w-3.5" /> Atlas Quality Lab Blueprint
              </span>
            </div>

            <h1 className="mt-6 max-w-3xl font-display text-[2.65rem] font-bold leading-[1.05] sm:text-5xl lg:text-[3.45rem] xl:text-[3.75rem]">
              A quality lab plan your whole project team can <span className="text-teal-300">challenge.</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 md:text-lg md:leading-8">
              Atlas translates products, markets and testing demand into one controlled basis for capability, capacity, people, equipment, cost, and risk.
            </p>

            <div className="mt-5 flex items-start gap-2 text-sm leading-6 text-slate-300">
              <FlaskConical className="mt-1 h-4 w-4 shrink-0 text-teal-300" />
              <span><strong className="text-teal-200">First wedge:</strong> non-sterile pharmaceutical microbiology</span>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/quality-lab/planner" className={primaryCta} onClick={trackCta("home_hero", "planner")}>
                Build the free model <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/quality-lab/sample" className={secondaryCta} onClick={trackCta("home_hero", "sample")}>
                See a sample Blueprint
              </Link>
            </div>

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              <Link
                href="/quality-lab/review?offer=diagnostic"
                className="inline-flex items-center gap-1.5 font-semibold text-slate-200 underline decoration-white/30 underline-offset-4 transition hover:text-teal-200"
                onClick={trackCta("home_hero", "diagnostic")}
              >
                Book the $149 diagnostic <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link href="/products" className="font-semibold text-teal-200 transition hover:text-teal-100">
                See every Atlas product
              </Link>
            </div>
          </div>

          <div className="relative rounded-[1.75rem] border border-white/10 bg-[#091b30] p-4 shadow-2xl shadow-slate-950/25 sm:p-6 lg:-mt-3">
            <img
              src="/images/blueprint/quality-lab-blueprint-deliverables.webp"
              alt="Illustrative Atlas Quality Lab Blueprint delivery package with an executive brief, capability and capacity model, cost scenario, and evidence register"
              width="900"
              height="720"
              fetchPriority="high"
              decoding="async"
              className="mx-auto w-full max-w-[760px] object-contain mix-blend-lighten drop-shadow-[0_28px_50px_rgba(0,0,0,0.34)]"
            />
            <div className="mt-2 grid gap-3 border-t border-white/10 pt-4 text-xs text-slate-400 sm:grid-cols-2 sm:gap-5">
              <div className="flex items-start gap-2">
                <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" />
                <span><strong className="text-teal-200">Controlled delivery in 10 business days</strong> after complete agreed inputs and kickoff.</span>
              </div>
              <div className="flex items-start gap-2">
                <UsersRound className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" />
                <span><strong className="text-teal-200">Expert-reviewed Blueprint from $990</strong> for the founding pilot scope.</span>
              </div>
            </div>
            <p className="mt-3 text-center text-[10px] italic tracking-wide text-slate-500 sm:text-left">Illustrative concept output · final scope and deliverables are agreed before kickoff</p>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white px-4 py-6 text-[#0b1b2c]" aria-label="Atlas trust principles">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3 md:divide-x md:divide-slate-200">
          {trustPoints.map((point) => (
            <div key={point.title} className="flex items-start gap-3 md:px-6 first:md:pl-0 last:md:pr-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-teal-700/15 bg-teal-50 text-teal-800">
                <point.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-950">{point.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-600">{point.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-20 border-b border-slate-200 bg-[#f4f7f5] px-4 py-14 text-[#0b1b2c] md:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-800">From uncertainty to a controlled package</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950 md:text-4xl">One decision path your whole project team can follow.</h2>
            <Link href="/quality-lab/how-it-works" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-teal-800 transition hover:text-teal-950">See the complete process <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="mt-9 grid gap-6 lg:grid-cols-3 lg:gap-0">
            {journeySteps.map((step, index) => (
              <div key={step.number} className="relative flex gap-4 lg:pr-12">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-300 text-sm font-bold text-slate-950">{step.number}</span>
                <div>
                  <h3 className="text-lg font-bold text-slate-950">{step.title}</h3>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600">{step.body}</p>
                </div>
                {index < journeySteps.length - 1 && <div className="absolute right-6 top-5 hidden h-px w-16 border-t border-dashed border-slate-400 lg:block" />}
              </div>
            ))}
          </div>

          <LazyHomepageModelPreview />
        </div>
      </section>

      <section id="atlas-products" className="scroll-mt-20 border-b border-white/10 bg-[#081a2d] px-4 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-300">Flagship · Quality Lab Blueprint</p>
              <h2 className="mt-3 text-3xl font-bold md:text-5xl">Move one real laboratory decision forward.</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 md:text-base">Build a free concept model, inspect the full public sample, then use the $149 Diagnostic when the decision, evidence and project scope need qualified framing.</p>
            </div>
            <Link href="/products" className="inline-flex items-center gap-2 text-sm font-semibold text-teal-200 transition hover:text-teal-100">
              Compare every option <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-[1.45fr_.55fr] lg:items-start">
            <CommercialPathCard offer={commercialPaths[0]} />
            <aside className="space-y-4" aria-label="Also from Life Science Atlas">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Also from Atlas</p>
              {commercialPaths.slice(1).map((offer) => <CommercialPathCard key={offer.title} offer={offer} compact />)}
            </aside>
          </div>

          <p className="mt-6 text-xs leading-5 text-slate-500">Partner-led laboratory projects are scoped through the Quality Lab review path. Larger portfolios, specialist coverage, and additional scenarios are quoted separately.</p>
        </div>
      </section>

      <section id="deliverables" className="scroll-mt-20 border-b border-slate-200 bg-white px-4 py-14 text-[#0b1b2c] md:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div className="lg:sticky lg:top-24">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-800">What the Blueprint contains</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950 md:text-4xl">A controlled decision package, not another software dashboard.</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 md:text-base">The founding scope is designed to support a real project conversation across QC, QA, engineering, procurement, and leadership.</p>
            <Link href="/quality-lab/deliverables" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-teal-800 transition hover:text-teal-950">Explore every deliverable <ArrowRight className="h-4 w-4" /></Link>
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-slate-700">
              Atlas supports planning and decision-making. It does not replace site risk assessment, qualified engineering, validation, QA approval, or regulatory review.
            </div>
          </div>
          <div className="divide-y divide-slate-200 border-y border-slate-200">
            {deliverables.map((item) => (
              <article key={item.title} className="grid gap-4 py-6 sm:grid-cols-[3rem_1fr]">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-teal-700/15 bg-teal-50 text-teal-800"><item.icon className="h-5 w-5" /></div>
                <div>
                  <h3 className="text-lg font-bold text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#081a2d] px-4 py-14 md:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-300">Atlas Evidence</p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl">Inspect the knowledge behind the decisions.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400 md:text-base">The Academy, workflows, tools, and Pro resources support the flagship product without pretending to replace project-specific review.</p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {evidenceLinks.map((item) => (
              <Link key={item.href} href={item.href} className="group overflow-hidden rounded-2xl border border-white/10 bg-[#061426] transition hover:-translate-y-1 hover:border-teal-300/30">
                <EditorialImage src={item.image} alt={item.alt} creditName={item.credit} creditUrl={item.creditUrl} className="h-40 border-b border-white/10" imageClassName="saturate-75 transition duration-500 group-hover:scale-[1.025]" />
                <div className="p-5">
                  <h3 className="text-lg font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{item.body}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-teal-200">Explore evidence <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f4f7f5] px-4 py-14 text-[#0b1b2c] md:py-20">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-800">Start with the decision in front of you</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-950 md:text-5xl">Build an initial model before committing capital.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">Use the free model for orientation, the $149 diagnostic to resolve scope, or request a founding Blueprint engagement when the project is ready.</p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/quality-lab/planner" className={primaryCta} onClick={trackCta("home_final", "planner")}>Build the free model <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/quality-lab/review" className={lightSecondaryCta} onClick={trackCta("home_final", "expert_review")}>Discuss a real project</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

type CommercialPath = (typeof commercialPaths)[number];

function CommercialPathCard({ offer, compact = false }: { offer: CommercialPath; compact?: boolean }) {
  return <Link href={offer.href} className={`group flex flex-col overflow-hidden rounded-[1.35rem] border shadow-[0_22px_60px_rgba(0,0,0,0.18)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_75px_rgba(0,0,0,0.24)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-200 ${offer.tone} ${compact ? "min-h-0" : "min-h-[560px]"}`}>
    {!compact && <div className="relative h-56 overflow-hidden border-b border-black/10"><img src={offer.image} alt={offer.alt} width={offer.imageWidth} height={offer.imageHeight} loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]" /><div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950/35 to-transparent" aria-hidden="true" /><div className={`absolute left-5 top-5 flex h-11 w-11 items-center justify-center rounded-xl shadow-lg ${offer.iconTone}`}><offer.icon className="h-5 w-5" /></div><span className={`absolute right-4 top-4 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] backdrop-blur-md ${offer.badgeTone}`}>{offer.note}</span></div>}
    <div className={`flex flex-1 flex-col ${compact ? "p-5" : "p-6 md:p-8"}`}>
      <div className="flex items-start justify-between gap-3">{compact && <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${offer.iconTone}`}><offer.icon className="h-4 w-4" /></div>}<div className="min-w-0 flex-1"><p className={`text-[10px] font-bold uppercase tracking-[0.16em] ${offer.textTone}`}>{offer.eyebrow}</p><h3 className={`${compact ? "mt-1 text-lg" : "mt-2 text-3xl"} font-bold leading-tight ${offer.titleTone}`}>{offer.title}</h3></div>{compact && <span className={`shrink-0 rounded-full border px-2 py-1 text-[9px] font-bold uppercase ${offer.badgeTone}`}>{offer.note}</span>}</div>
      <p className={`${compact ? "mt-3 text-xs" : "mt-4 text-sm"} leading-6 ${offer.bodyTone}`}>{offer.body}</p>
      {!compact && <ul className={`mt-6 flex-1 space-y-2.5 border-t pt-5 ${offer.dividerTone}`}>{offer.highlights.map((item) => <li key={item} className={`flex items-start gap-2 text-sm ${offer.bodyTone}`}><CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${offer.textTone}`} />{item}</li>)}</ul>}
      <div className={`${compact ? "mt-4" : "mt-6"} border-t pt-4 ${offer.dividerTone}`}><p className={`${compact ? "text-sm" : "text-base"} font-bold ${offer.priceTone}`}>{offer.price}</p><span className={`mt-2 inline-flex items-center gap-2 text-sm font-bold ${offer.textTone}`}>{offer.cta} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span></div>
    </div>
  </Link>;
}
