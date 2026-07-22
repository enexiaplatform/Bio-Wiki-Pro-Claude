import { Link } from "wouter";
import {
  ArrowRight,
  BookOpenCheck,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  FileCheck2,
  GitBranch,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useSEO } from "@/hooks/use-seo";

const layers = [
  {
    number: "01",
    icon: BookOpenCheck,
    eyebrow: "Atlas Evidence",
    title: "Start from visible knowledge, not a black box.",
    body: "Workflows, source context, decision guides, calculators, and reusable tools form the public evidence layer.",
    items: ["Evidence-backed learning", "Visible formulas and assumptions", "Reusable professional resources"],
    href: "/academy",
    cta: "Explore resources",
  },
  {
    number: "02",
    icon: GitBranch,
    eyebrow: "Atlas Intelligence",
    title: "Structure the inputs into a challengeable model.",
    body: "Atlas connects inputs, rules, constraints, alternatives, and uncertainty so the reasoning behind an output stays inspectable.",
    items: ["Context-specific inputs", "Rules and scenario logic", "Gaps, confidence, and open questions"],
    href: "/quality-lab/planner",
    cta: "Try the flagship model",
  },
  {
    number: "03",
    icon: FileCheck2,
    eyebrow: "Commercial outputs",
    title: "Buy the decision asset that matches the job.",
    body: "Choose a project Blueprint, ongoing professional access, or a one-time personal career plan. Each has its own buyer, output, and payment model.",
    items: ["Quality Lab decision package", "Atlas Pro membership", "Personal Career Blueprint"],
    href: "/products",
    cta: "Compare all products",
  },
];

const products = [
  {
    icon: Building2,
    audience: "Organization",
    model: "Project-based",
    title: "Quality Lab Blueprint",
    job: "Plan a real regulated quality laboratory decision.",
    process: "Describe the site and demand → compile scenarios → expert challenge → controlled delivery.",
    price: "Free model · $149 diagnostic · from $990",
    finish: "A controlled project decision package",
    href: "/quality-lab/how-it-works",
    cta: "See the project process",
    tone: "border-teal-200 bg-teal-50 text-teal-900",
  },
  {
    icon: Sparkles,
    audience: "Professional",
    model: "Subscription",
    title: "Atlas Pro",
    job: "Go deeper with evidence, tools, and working files.",
    process: "Find a work question → study the source context → use the file or tool → retain a reusable reference layer.",
    price: "$8/month · $80/year when available",
    finish: "Ongoing access to deeper professional resources",
    href: "/pro",
    cta: "See what Pro includes",
    tone: "border-sky-200 bg-sky-50 text-sky-900",
  },
  {
    icon: BriefcaseBusiness,
    audience: "Individual",
    model: "One-time",
    title: "Career Blueprint",
    job: "Make a more evidence-based next career move.",
    process: "Describe your profile → compare credible routes → inspect gaps → unlock a named execution plan.",
    price: "Free snapshot · personalized PDF for $20",
    finish: "A named 38-page career execution plan",
    href: "/career",
    cta: "See the Career product",
    tone: "border-amber-200 bg-amber-50 text-amber-900",
  },
];

export default function PlatformHowItWorksPage() {
  useSEO({
    title: "How Life Science Atlas Works",
    description: "See how Atlas connects evidence, structured intelligence, and distinct commercial outputs for quality teams and life science professionals.",
  });

  return (
    <div className="min-h-screen bg-[#f4f7f5] text-[#0b1b2c]">
      <section className="border-b border-white/10 bg-[#061426] px-4 py-16 text-slate-100 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-300/30 bg-teal-300/[0.07] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-teal-200">
              <ShieldCheck className="h-3.5 w-3.5" /> How Atlas works
            </span>
            <h1 className="mt-6 max-w-3xl font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              One evidence system. <span className="text-teal-300">Three clear ways to use it.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
              Build a laboratory decision package, unlock deeper professional resources, or create a named career plan. The evidence system is shared; the buyer, workflow, payment, and finish line are not.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/products" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-teal-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-teal-200">
                Compare the products <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/quality-lab/planner" className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/25 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:border-white/45 hover:bg-white/[0.08]">
                Try the flagship model
              </Link>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-[#0a1d32] p-5 shadow-2xl shadow-black/20 sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-300">Choose your finish line</p>
            <div className="mt-5 space-y-3">
              {[
                { audience: "Organization", product: "Quality Lab Blueprint", outcome: "Project decision package", href: "/quality-lab" },
                { audience: "Professional", product: "Atlas Pro", outcome: "Evidence, tools, and working files", href: "/pro" },
                { audience: "Individual", product: "Career Blueprint", outcome: "Named career execution plan", href: "/career" },
              ].map((item) => (
                <Link key={item.product} href={item.href} className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-teal-300/35 hover:bg-white/[0.06]">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-300/10 text-[10px] font-bold uppercase text-teal-200">{item.audience.slice(0, 3)}</span>
                  <span className="min-w-0"><span className="block text-sm font-bold text-slate-100">{item.product}</span><span className="mt-1 block text-xs text-slate-400">{item.outcome}</span></span>
                  <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-teal-300" />
                </Link>
              ))}
            </div>
            <div className="mt-5 rounded-xl border border-amber-300/20 bg-amber-300/[0.06] p-4 text-xs leading-6 text-amber-100/80">
              Not sure yet? Start with the free product comparison. No purchase is required to choose a path.
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-800">How value is created</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950 md:text-5xl">Three layers with different responsibilities.</h2>
            <p className="mt-4 text-base leading-7 text-slate-600">This separation keeps the knowledge library, reasoning system, and paid products from competing for the same role.</p>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {layers.map((layer) => (
              <article key={layer.number} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,35,50,0.06)] sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-800"><layer.icon className="h-5 w-5" /></span>
                  <span className="font-display text-sm font-bold text-slate-300">{layer.number}</span>
                </div>
                <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.16em] text-teal-800">{layer.eyebrow}</p>
                <h3 className="mt-2 text-xl font-bold text-slate-950">{layer.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{layer.body}</p>
                <ul className="mt-5 flex-1 space-y-2 border-t border-slate-200 pt-4">
                  {layer.items.map((item) => <li key={item} className="flex items-start gap-2 text-sm text-slate-700"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />{item}</li>)}
                </ul>
                <Link href={layer.href} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-teal-800 hover:text-teal-950">{layer.cta} <ArrowRight className="h-4 w-4" /></Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white px-4 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-800">The paths separate here</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950 md:text-4xl">Different buyer. Different payment. Different finish line.</h2>
            <p className="mt-4 text-base leading-7 text-slate-600">The three offers share Atlas evidence and reasoning, but they are not tiers of the same product.</p>
          </div>
          <div className="mt-9 grid gap-4 lg:grid-cols-3">
            {products.map((product) => (
              <article key={product.title} className={`rounded-2xl border p-6 ${product.tone}`}>
                <div className="flex items-center justify-between gap-4">
                  <product.icon className="h-6 w-6" />
                  <span className="rounded-full bg-white/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em]">{product.audience} · {product.model}</span>
                </div>
                <h3 className="mt-6 text-xl font-bold text-slate-950">{product.title}</h3>
                <p className="mt-2 text-sm font-semibold text-slate-800">{product.job}</p>
                <p className="mt-4 border-t border-slate-900/10 pt-4 text-sm leading-7 text-slate-600">{product.process}</p>
                <div className="mt-5 border-t border-slate-900/10 pt-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Payment</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{product.price}</p>
                  <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Ends with</p>
                  <p className="mt-1 text-sm text-slate-700">{product.finish}</p>
                </div>
                <Link href={product.href} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-slate-950">{product.cta} <ArrowRight className="h-4 w-4" /></Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#081a2d] px-4 py-16 text-slate-100 md:py-20">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-7 lg:flex-row lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-300">Choose the outcome first</p>
            <h2 className="mt-3 max-w-3xl text-3xl font-bold md:text-4xl">You should never need to decode the product catalog before getting value.</h2>
          </div>
          <Link href="/products" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-teal-300 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-teal-200">Find the right product <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </div>
  );
}
