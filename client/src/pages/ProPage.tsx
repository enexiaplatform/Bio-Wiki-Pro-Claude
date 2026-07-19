import { Link } from "wouter";
import {
  ArrowRight,
  BookOpenCheck,
  Calculator,
  CheckCircle2,
  Crown,
  FileSpreadsheet,
  LockKeyhole,
  PackageCheck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useSEO } from "@/hooks/use-seo";
import { EditorialImage } from "@/components/EditorialImage";

const included = [
  { icon: BookOpenCheck, title: "Deeper evidence-backed lessons", body: "Move beyond public orientation into more detailed source context, decision logic, and practical interpretation." },
  { icon: Calculator, title: "Premium decision tools", body: "Use focused calculators and models that keep formulas, inputs, and planning assumptions visible." },
  { icon: FileSpreadsheet, title: "Reusable working files", body: "Download templates and working assets designed to support repeat professional tasks—not just reading." },
  { icon: PackageCheck, title: "GMP Audit Readiness Kit", body: "Use the included readiness kit to organize audit preparation, evidence requests, and follow-up work." },
];

const workflow = [
  { number: "01", title: "Start from a real work question", body: "Choose the method, compliance task, calculation, or deliverable you need to understand or execute." },
  { number: "02", title: "Inspect the evidence context", body: "Use deeper lessons and linked source context to understand the basis and boundaries—not only the answer." },
  { number: "03", title: "Apply a tool or working file", body: "Turn the learning into a calculation, checklist, template, or reusable professional artifact." },
  { number: "04", title: "Keep the reference layer", body: "Return to the same evidence and files as the work evolves, without purchasing a project engagement." },
];

export default function ProPage() {
  useSEO({
    title: "Life Science Atlas Pro",
    description: "Explore Atlas Pro evidence, premium tools, reusable working files, and the GMP Audit Readiness Kit for life science quality professionals.",
  });

  return (
    <div className="min-h-screen bg-[#f4f7f5] text-[#0b1b2c]">
      <section className="border-b border-white/10 bg-[#061426] px-4 py-16 text-slate-100 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-300/30 bg-sky-300/[0.07] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-sky-200"><Crown className="h-3.5 w-3.5" /> Atlas Pro</span>
            <h1 className="mt-6 max-w-3xl font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">A deeper professional layer for the work <span className="text-sky-300">you need to reuse.</span></h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">Pro connects deeper evidence, premium tools, working files, and audit-readiness resources in one ongoing membership.</p>
            <div className="mt-7 flex flex-wrap items-center gap-3"><strong className="text-2xl text-white">$8/month</strong><span className="text-sm text-slate-400">or $80/year when annual access is available</span></div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/pricing#evidence-plans" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-sky-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-sky-200">Compare Free and Pro <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/academy" className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/25 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white hover:bg-white/[0.08]">Explore public evidence first</Link>
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs text-slate-500"><LockKeyhole className="h-3.5 w-3.5" /> Membership access · not a project-specific expert review</p>
          </div>
          <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0a1d32] p-3 shadow-2xl shadow-black/20">
            <EditorialImage src="/images/editorial/evidence-data-review.jpg" alt="Professional reviewing quality evidence and data" creditName="Faustina Okeke" creditUrl="https://unsplash.com/photos/XLQuTdktpa8" eager className="aspect-[4/3] w-full rounded-[1.25rem]" imageClassName="object-center" />
            <div className="grid gap-2 p-4 sm:grid-cols-3">
              {["Learn deeper", "Apply faster", "Reuse the work"].map((item, index) => <div key={item} className="rounded-lg border border-white/10 bg-white/[0.035] p-3"><span className="text-[10px] font-bold text-sky-300">0{index + 1}</span><p className="mt-1 text-xs font-semibold text-slate-200">{item}</p></div>)}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-800">What Pro includes</p><h2 className="mt-3 text-3xl font-bold text-slate-950 md:text-5xl">Four kinds of depth, designed to work together.</h2><p className="mt-4 text-base leading-7 text-slate-600">The value is not “more pages.” It is the connection between evidence, a practical tool, and a reusable output.</p></div>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {included.map((item) => <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,35,50,0.06)] sm:p-7"><span className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-800"><item.icon className="h-5 w-5" /></span><h3 className="mt-6 text-xl font-bold text-slate-950">{item.title}</h3><p className="mt-3 text-sm leading-7 text-slate-600">{item.body}</p></article>)}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#081a2d] px-4 py-16 text-slate-100 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
            <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-300">How professionals use it</p><h2 className="mt-3 text-3xl font-bold md:text-4xl">From a work question to a reusable reference.</h2><p className="mt-4 text-sm leading-7 text-slate-400">Pro is most useful when learning and execution happen in the same workflow.</p></div>
            <div className="grid gap-4 sm:grid-cols-2">
              {workflow.map((step) => <article key={step.number} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"><span className="text-xs font-bold text-sky-300">{step.number}</span><h3 className="mt-4 font-bold text-white">{step.title}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{step.body}</p></article>)}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white px-4 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-5 lg:grid-cols-2">
            <article className="rounded-2xl border border-sky-200 bg-sky-50 p-6 sm:p-8"><Sparkles className="h-6 w-6 text-sky-800" /><p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-sky-800">Choose Pro when</p><h2 className="mt-2 text-2xl font-bold text-slate-950">You want ongoing professional depth.</h2><ul className="mt-5 space-y-3">{["You repeatedly use evidence, calculators, templates, or audit resources", "You want deeper material than the public orientation layer", "The output is for your own professional workflow"].map((item) => <li key={item} className="flex items-start gap-2 text-sm text-slate-700"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" />{item}</li>)}</ul></article>
            <article className="rounded-2xl border border-teal-200 bg-teal-50 p-6 sm:p-8"><ShieldCheck className="h-6 w-6 text-teal-800" /><p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-teal-800">Choose Quality Lab when</p><h2 className="mt-2 text-2xl font-bold text-slate-950">A real site decision needs project-specific work.</h2><ul className="mt-5 space-y-3">{["The decision concerns a site, product portfolio, capacity, equipment, cost, or risk", "Multiple functions need one controlled decision basis", "The scope requires project-specific expert challenge and delivery"].map((item) => <li key={item} className="flex items-start gap-2 text-sm text-slate-700"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />{item}</li>)}</ul><Link href="/quality-lab" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-teal-800">Explore Quality Lab <ArrowRight className="h-4 w-4" /></Link></article>
          </div>
        </div>
      </section>

      <section className="bg-[#ecf5f2] px-4 py-16 md:py-20">
        <div className="mx-auto max-w-4xl text-center"><Crown className="mx-auto h-8 w-8 text-sky-800" /><h2 className="mt-4 text-3xl font-bold text-slate-950 md:text-5xl">Inspect the public layer before upgrading.</h2><p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600">Explore public evidence and tools first. Upgrade when the deeper resources and reusable files match work you actually need to do.</p><div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/pricing#evidence-plans" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-sky-700 px-5 py-3 text-sm font-bold text-white hover:bg-sky-800">Compare Free and Pro <ArrowRight className="h-4 w-4" /></Link><Link href="/academy" className="inline-flex min-h-12 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-950 hover:border-sky-700">Explore public resources</Link></div></div>
      </section>
    </div>
  );
}
