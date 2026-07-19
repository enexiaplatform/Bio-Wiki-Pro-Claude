import { Link } from "wouter";
import {
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  BriefcaseBusiness,
  Building2,
  Check,
  Crown,
  FileText,
  Gauge,
  Route,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useSEO } from "@/hooks/use-seo";

const productPaths = [
  {
    eyebrow: "Plan a quality laboratory",
    title: "Quality Lab Blueprint",
    price: "Free start · $149 diagnostic · from $990",
    href: "/quality-lab",
    image: "/images/blueprint/quality-lab-blueprint-deliverables.webp",
    alt: "Illustrative Quality Lab Blueprint decision package",
    imageClassName: "object-contain bg-[#07182d]",
  },
  {
    eyebrow: "Work with deeper resources",
    title: "Atlas Pro",
    price: "$8/month · $80/year when available",
    href: "/pro",
    image: "/images/editorial/evidence-data-review.jpg",
    alt: "Life science professionals reviewing quality evidence",
    imageClassName: "object-cover object-center",
  },
  {
    eyebrow: "Make a career move",
    title: "Personal Career Blueprint",
    price: "$20 one time",
    href: "/career",
    image: "/images/career/personal-career-blueprint-preview.webp",
    alt: "Personal Career Blueprint report preview",
    imageClassName: "object-cover",
  },
];

const comparisonRows = [
  {
    label: "Made for",
    values: ["Quality, engineering, and project teams", "Life science quality professionals", "An individual career decision"],
  },
  {
    label: "You receive",
    values: ["Controlled project decision package", "Ongoing premium access", "Named personalized PDF"],
  },
  {
    label: "How you buy",
    values: ["Free model → diagnostic → scoped project", "Monthly or annual membership", "One-time purchase"],
  },
  {
    label: "Review boundary",
    values: ["Human review in paid Blueprint scope", "Not project-specific review", "Planning aid; mentor review encouraged"],
  },
];

function ProductPathCard({ product }: { product: (typeof productPaths)[number] }) {
  return (
    <Link
      href={product.href}
      className="group grid grid-cols-[72px_1fr_auto] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.055] p-2.5 transition hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.09] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
    >
      <img
        src={product.image}
        alt=""
        width="144"
        height="104"
        decoding="async"
        className={`h-[52px] w-[72px] rounded-xl border border-white/10 ${product.imageClassName}`}
      />
      <span className="min-w-0">
        <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{product.eyebrow}</span>
        <span className="mt-1 block truncate text-sm font-bold text-white">{product.title}</span>
        <span className="mt-0.5 block text-xs text-slate-400">{product.price}</span>
      </span>
      <ArrowRight className="h-4 w-4 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-teal-200" />
    </Link>
  );
}

export default function ProductsPage() {
  useSEO({
    title: "Life Science Atlas Products",
    description: "Compare the Atlas Quality Lab Blueprint, Atlas Pro, and the Personal Career Blueprint by buyer, outcome, output, and price.",
  });

  return (
    <div className="min-h-screen bg-[#f4f7f5] text-[#0b1b2c]">
      <section className="relative overflow-hidden border-b border-white/10 bg-[#061426] px-4 py-12 text-slate-100 md:py-16 lg:py-20">
        <div className="pointer-events-none absolute -left-32 top-16 h-80 w-80 rounded-full bg-teal-300/[0.07] blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-300/30 bg-teal-300/[0.07] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-teal-200">
              <Sparkles className="h-3.5 w-3.5" /> Three products, three jobs
            </span>
            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.04] tracking-[-0.035em] sm:text-5xl lg:text-[3.75rem]">
              One Atlas. Three ways to make a <span className="text-teal-300">better decision.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 md:text-lg md:leading-8">
              Choose by the decision in front of you—not by a bundle. Each product has a different buyer, outcome, and payment model.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/quality-lab/planner" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-teal-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-teal-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                Build the free lab model <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/pricing" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/20 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300">
                Compare all pricing
              </Link>
            </div>
            <div className="mt-8 hidden max-w-xl gap-3 border-t border-white/10 pt-5 text-xs text-slate-400 sm:grid sm:grid-cols-3">
              <span className="flex items-center gap-2"><Check className="h-4 w-4 text-teal-300" /> Clear free starting point</span>
              <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-teal-300" /> Evidence-led boundaries</span>
              <span className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-teal-300" /> No forced bundle</span>
            </div>
          </div>

          <aside className="rounded-[1.75rem] border border-white/12 bg-[#0b1d33]/90 p-4 shadow-2xl shadow-black/20 sm:p-5" aria-label="Choose a Life Science Atlas product">
            <div className="mb-4 flex items-end justify-between gap-4 px-1">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-200">Start with the job</p>
                <h2 className="mt-1.5 text-xl font-bold text-white">What are you trying to do?</h2>
              </div>
              <Route className="hidden h-6 w-6 text-teal-300 sm:block" />
            </div>
            <div className="space-y-2.5">
              {productPaths.map((product) => <ProductPathCard key={product.title} product={product} />)}
            </div>
          </aside>
        </div>
      </section>

      <section className="border-b border-slate-200/80 bg-white px-4 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div className="max-w-xl">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-100 text-teal-800"><Building2 className="h-5 w-5" /></span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-800">Flagship · project-based</p>
                  <p className="mt-1 text-sm font-semibold text-slate-500">For a real laboratory planning decision</p>
                </div>
              </div>
              <h2 className="mt-7 font-display text-3xl font-bold tracking-[-0.025em] text-slate-950 sm:text-4xl lg:text-5xl">Atlas Quality Lab Blueprint</h2>
              <p className="mt-4 text-lg font-semibold leading-8 text-slate-800">Translate products, markets, and testing demand into one controlled basis for capability, capacity, cost, and risk.</p>
              <div className="mt-6 border-y border-slate-200 py-5">
                <div className="grid gap-4 text-sm sm:grid-cols-2">
                  <div>
                    <p className="font-bold text-slate-950">Bring</p>
                    <p className="mt-1.5 leading-6 text-slate-600">Portfolio, markets, volumes, site facts, constraints, and decision horizon.</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-950">Leave with</p>
                    <p className="mt-1.5 leading-6 text-slate-600">A controlled decision package for one agreed site and scope.</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href="/quality-lab" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800">Explore Quality Lab <ArrowRight className="h-4 w-4" /></Link>
                <Link href="/quality-lab/sample" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 transition hover:border-slate-400">See sample Blueprint</Link>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-teal-100 bg-[#e7f7f3] p-4 sm:p-7">
              <div className="overflow-hidden rounded-2xl border border-slate-900/10 bg-[#07182d] shadow-2xl shadow-slate-900/15">
                <img src="/images/blueprint/quality-lab-blueprint-deliverables.webp" alt="Illustrative Quality Lab Blueprint package showing an executive brief, capacity model, cost scenario, and evidence register" width="900" height="720" fetchPriority="high" className="aspect-[5/4] w-full object-contain" />
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {[
                  ["01", "Free model", "See the initial capability picture"],
                  ["02", "$149 diagnostic", "Clarify scope and decision gaps"],
                  ["03", "Blueprint from $990", "Receive the reviewed package"],
                ].map(([number, title, body]) => (
                  <div key={number} className="rounded-xl border border-teal-900/10 bg-white/75 p-3.5">
                    <p className="text-[10px] font-bold tracking-[0.16em] text-teal-700">{number}</p>
                    <p className="mt-2 text-sm font-bold text-slate-950">{title}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-600">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-sky-200/70 bg-[#edf7ff] px-4 py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.06fr_0.94fr] lg:items-center">
          <div className="relative overflow-hidden rounded-[1.75rem] border border-sky-200 bg-slate-950 p-3 shadow-xl shadow-sky-950/10 sm:p-5">
            <img src="/images/editorial/evidence-data-review.jpg" alt="Life science professionals reviewing quality evidence and data" width="1600" height="1067" loading="lazy" decoding="async" className="aspect-[4/3] w-full rounded-2xl object-cover object-center opacity-90" />
            <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/15 bg-slate-950/85 p-4 text-white backdrop-blur sm:inset-x-8 sm:bottom-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-200">Your professional execution layer</p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-slate-300">
                <span>Evidence</span><span>Tools</span><span>Working files</span>
              </div>
            </div>
          </div>

          <div className="max-w-xl lg:pl-6">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-800"><Crown className="h-5 w-5" /></span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-800">Membership · when available</p>
                <p className="mt-1 text-sm font-semibold text-slate-600">$8/month · $80/year</p>
              </div>
            </div>
            <h2 className="mt-7 font-display text-3xl font-bold tracking-[-0.025em] text-slate-950 sm:text-4xl lg:text-5xl">Life Science Atlas Pro</h2>
            <p className="mt-4 text-lg font-semibold leading-8 text-slate-800">For professionals who need reusable depth—not a project-specific consulting engagement.</p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {["Deeper evidence-backed lessons", "Premium calculators", "Reusable working files", "GMP Audit Readiness Kit"].map((item) => (
                <li key={item} className="flex items-center gap-2.5 rounded-xl border border-sky-200 bg-white/70 px-3.5 py-3 text-sm font-semibold text-slate-700"><Check className="h-4 w-4 shrink-0 text-sky-700" />{item}</li>
              ))}
            </ul>
            <Link href="/pro" className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-sky-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-800">See Free vs Pro <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>

      <section className="border-b border-amber-200/70 bg-[#fffaf0] px-4 py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.84fr_1.16fr] lg:items-center">
          <div className="max-w-xl">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-800"><BriefcaseBusiness className="h-5 w-5" /></span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-800">Personalized PDF · one-time</p>
                <p className="mt-1 text-sm font-semibold text-slate-600">Free snapshot · $20 full Blueprint</p>
              </div>
            </div>
            <h2 className="mt-7 font-display text-3xl font-bold tracking-[-0.025em] text-slate-950 sm:text-4xl lg:text-5xl">Personal Career Blueprint</h2>
            <p className="mt-4 text-lg font-semibold leading-8 text-slate-800">A named 38-page operating plan built from your current role, evidence, constraints, timeline, and target route.</p>
            <div className="mt-6 space-y-3">
              {[
                [Gauge, "See your current position", "A free snapshot makes the first diagnosis visible before purchase."],
                [Route, "Choose a realistic route", "Target-role evidence, gap priorities, and decision constraints stay connected."],
                [FileText, "Execute the next 13 weeks", "The paid PDF turns the route into a proof plan and weekly calendar."],
              ].map(([Icon, title, body]) => {
                const ItemIcon = Icon as typeof Gauge;
                return (
                  <div key={String(title)} className="flex gap-3 border-t border-amber-900/10 pt-3 first:border-0 first:pt-0">
                    <ItemIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                    <div><p className="text-sm font-bold text-slate-950">{String(title)}</p><p className="mt-1 text-sm leading-6 text-slate-600">{String(body)}</p></div>
                  </div>
                );
              })}
            </div>
            <Link href="/career" className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-300">Build the free snapshot <ArrowRight className="h-4 w-4" /></Link>
          </div>

          <div className="rounded-[1.75rem] border border-amber-200 bg-[#fff3cf] p-4 sm:p-7">
            <img src="/images/career/personal-career-blueprint-preview.webp" alt="Personal Career Blueprint cover and evidence comparison page" width="1421" height="1107" loading="lazy" decoding="async" className="aspect-[9/7] w-full rounded-2xl border border-amber-900/10 object-cover shadow-2xl shadow-amber-950/10" />
            <div className="mt-4 flex flex-wrap gap-2">
              {["Named for you", "Role-specific", "Evidence-led", "13-week plan"].map((item) => <span key={item} className="rounded-full border border-amber-900/10 bg-white/75 px-3 py-1.5 text-xs font-bold text-amber-900">{item}</span>)}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-800">Compare without the overlap</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-[-0.025em] text-slate-950 md:text-4xl">The shared foundation stops before the product begins.</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">Atlas Evidence supports all three. The buyer, output, payment model, and review boundary remain deliberately separate.</p>
            </div>
            <div className="hidden grid-cols-3 gap-3 text-center text-xs font-bold text-slate-700 md:grid"><span>Quality Lab</span><span>Atlas Pro</span><span>Career</span></div>
          </div>
          <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead className="bg-[#07182d] text-white"><tr><th className="p-4 font-semibold">Compare</th><th className="p-4 font-semibold">Quality Lab Blueprint</th><th className="p-4 font-semibold">Atlas Pro</th><th className="p-4 font-semibold">Career Blueprint</th></tr></thead>
              <tbody>{comparisonRows.map((row) => <tr key={row.label} className="border-t border-slate-200"><th className="bg-slate-50 p-4 font-semibold text-slate-900">{row.label}</th>{row.values.map((value, index) => <td key={`${row.label}-${index}`} className="p-4 leading-6 text-slate-600">{value}</td>)}</tr>)}</tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="bg-[#07182d] px-4 py-14 text-slate-100 md:py-16">
        <div className="mx-auto max-w-7xl rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 sm:p-8 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-200">Choose from the decision</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-[-0.025em]">Still not sure where to begin?</h2>
            <p className="mt-3 text-sm leading-7 text-slate-400">Use the job in front of you: plan a lab, deepen your professional toolkit, or execute a career move.</p>
          </div>
          <div className="mt-6 grid gap-2 sm:grid-cols-3 lg:mt-0 lg:min-w-[34rem]">
            {[
              [Building2, "Plan a lab", "/quality-lab/planner"],
              [BookOpenCheck, "Go deeper", "/pro"],
              [BriefcaseBusiness, "Plan my career", "/career"],
            ].map(([Icon, label, href]) => {
              const ItemIcon = Icon as typeof Building2;
              return <Link key={String(label)} href={String(href)} className="group flex min-h-12 items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-white transition hover:border-teal-300/40 hover:bg-teal-300/10"><span className="flex items-center gap-2"><ItemIcon className="h-4 w-4 text-teal-300" />{String(label)}</span><ArrowRight className="h-4 w-4 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-teal-200" /></Link>;
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
