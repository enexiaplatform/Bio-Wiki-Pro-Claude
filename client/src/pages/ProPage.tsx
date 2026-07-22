import { useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  Calculator,
  CalendarDays,
  Check,
  CheckCircle2,
  Copy,
  Crown,
  FileSpreadsheet,
  LockKeyhole,
  PackageCheck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { EditorialImage } from "@/components/EditorialImage";
import { analytics } from "@/hooks/use-analytics";
import { useSEO } from "@/hooks/use-seo";
import { copyText } from "@/lib/clipboard";
import { ATLAS_PRO_WORKFLOWS, formatAtlasProWorkflowBrief, getAtlasProWorkflow, type AtlasProWorkflowId } from "@shared/atlas-pro-workflows";

const proLibrary = [
  {
    icon: BookOpenCheck,
    number: "01",
    title: "Evidence with more context",
    body: "Move beyond public orientation into deeper source context, decision logic, boundaries, and worked interpretation.",
    example: "Lessons and decision guides",
    href: "/academy",
    linkLabel: "Browse public evidence",
  },
  {
    icon: Calculator,
    number: "02",
    title: "Premium decision tools",
    body: "Use focused calculators and models that keep formulas, inputs, assumptions, and limits visible.",
    example: "Calculators and planning models",
    href: "/tools",
    linkLabel: "Explore public tools",
  },
  {
    icon: FileSpreadsheet,
    number: "03",
    title: "Reusable working files",
    body: "Download templates, checklists, and working assets for professional tasks you need to repeat.",
    example: "Templates and downloadable files",
    href: "/toolkits",
    linkLabel: "Preview the toolkit library",
  },
  {
    icon: PackageCheck,
    number: "04",
    title: "GMP Audit Readiness Kit",
    body: "Organize gap review, evidence requests, CAPA planning, interview preparation, and follow-up work.",
    example: "Guide, gap analysis, CAPA, and Q&A",
    href: "/toolkits/gmp-audit-kit",
    linkLabel: "See what the kit contains",
  },
];

const workflow = [
  ["01", "Ask", "Start from a method, compliance, calculation, or audit question."],
  ["02", "Understand", "Inspect the evidence basis, assumptions, and boundaries."],
  ["03", "Apply", "Use the relevant tool, checklist, template, or working file."],
  ["04", "Reuse", "Return to the same reference layer as the work evolves."],
];

const comparisonRows = [
  ["Evidence", "Public orientation and selected guides", "Deeper context, decision logic, and worked examples"],
  ["Tools", "Selected public calculators", "Available premium calculators and planning tools"],
  ["Working files", "Limited public samples", "Available downloadable toolkits and templates"],
  ["Audit readiness", "Public orientation resources", "GMP Audit Readiness Kit included"],
  ["Expert project review", "Not included", "Not included — use Quality Lab for scoped review"],
];

const proReasons = [
  "You repeatedly use evidence, calculators, templates, or audit resources",
  "You need more context than the public orientation layer",
  "The output supports your own recurring professional workflow",
];

const qualityLabReasons = [
  "The decision concerns a site, portfolio, capacity, equipment, cost, or risk",
  "Multiple functions need one controlled decision basis",
  "The scope requires project-specific expert challenge and delivery",
];

export default function ProPage() {
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<AtlasProWorkflowId>("audit-readiness");
  const [briefCopied, setBriefCopied] = useState(false);
  const selectedWorkflow = getAtlasProWorkflow(selectedWorkflowId);

  useSEO({
    title: "Life Science Atlas Pro",
    description: "Explore Atlas Pro evidence, premium tools, reusable working files, and the GMP Audit Readiness Kit for life science quality professionals.",
  });

  function selectWorkflow(id: AtlasProWorkflowId) {
    setSelectedWorkflowId(id);
    setBriefCopied(false);
    analytics.proWorkflowSelected(id);
  }

  async function copyWorkflowBrief() {
    await copyText(formatAtlasProWorkflowBrief(selectedWorkflowId));
    setBriefCopied(true);
    analytics.proWorkflowBriefCopied(selectedWorkflowId);
    window.setTimeout(() => setBriefCopied(false), 1800);
  }

  return (
    <div className="min-h-screen bg-[#f4f7f5] text-[#0b1b2c]">
      <section className="relative overflow-hidden border-b border-white/10 bg-[#061426] px-4 py-12 text-slate-100 md:py-16 lg:py-20">
        <div className="pointer-events-none absolute -right-28 top-8 h-80 w-80 rounded-full bg-sky-300/[0.07] blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.94fr_1.06fr] lg:items-center">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-300/30 bg-sky-300/[0.07] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-sky-200">
              <Crown className="h-3.5 w-3.5" /> Atlas Pro
            </span>
            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.04] tracking-[-0.035em] sm:text-5xl lg:text-[3.7rem]">
              Evidence, tools, and working files for quality work <span className="text-sky-300">you repeat.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 md:text-lg md:leading-8">
              Pro connects deeper evidence to practical tools and reusable outputs—so learning and execution stay in the same professional workflow.
            </p>

            <div className="mt-7 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <strong className="text-3xl tracking-tight text-white">$8/month</strong>
              <span className="text-sm text-slate-400">or $80/year when annual access is available</span>
            </div>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a href="#what-pro-unlocks" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-sky-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                See what Pro unlocks <ArrowRight className="h-4 w-4" />
              </a>
              <Link href="/academy" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/20 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300">
                Explore the public layer
              </Link>
            </div>
            <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-500">
              <LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Membership access for individual professional use · not project-specific expert review
            </p>
          </div>

          <aside className="overflow-hidden rounded-[1.75rem] border border-white/12 bg-[#0b1d33] p-3 shadow-2xl shadow-black/25 sm:p-4" aria-label="Inside Atlas Pro">
            <div className="relative overflow-hidden rounded-2xl">
              <EditorialImage src="/images/editorial/evidence-data-review.jpg" alt="Life science professionals reviewing quality evidence and data" creditName="Faustina Okeke" creditUrl="https://unsplash.com/photos/XLQuTdktpa8" eager className="aspect-[16/7] w-full" imageClassName="object-center" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent px-5 pb-4 pt-12">
                <div><p className="text-[10px] font-bold uppercase tracking-[0.17em] text-sky-200">Inside your membership</p><p className="mt-1 text-lg font-bold text-white">One connected Pro library</p></div>
                <BadgeCheck className="h-6 w-6 shrink-0 text-sky-300" />
              </div>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {proLibrary.map((item) => (
                <div key={item.title} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.045] p-3.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-300/10 text-sky-200"><item.icon className="h-4 w-4" /></span>
                  <div><p className="text-sm font-bold text-white">{item.title}</p><p className="mt-1 text-xs leading-5 text-slate-400">{item.example}</p></div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="border-b border-sky-200/70 bg-[#edf7ff] px-4 py-14 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 overflow-hidden rounded-[1.75rem] border border-sky-200 bg-white shadow-xl shadow-sky-950/5 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="bg-[#07182d] p-6 text-slate-100 sm:p-9">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-300/10 text-sky-200"><CalendarDays className="h-5 w-5" /></span>
            <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.18em] text-sky-300">Monthly Quality Review</p>
            <h2 className="mt-3 text-3xl font-bold leading-tight">A reason to return every month.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-400">Run one recurring quality priority through a visible Frame → Verify → Decide → Close cycle, then carry unresolved work into the next month.</p>
            <Link href="/pro/monthly-review" className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-sky-300 px-5 py-3 text-sm font-bold text-slate-950">Open the monthly workspace <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="grid gap-px bg-sky-100 sm:grid-cols-2">
            {[
              ["01", "Choose the monthly decision", "Focus audit readiness, quality signals, method capacity, data integrity, or supplier control."],
              ["02", "Make evidence gaps visible", "Separate controlled evidence already held from records, confirmation, or qualified review still needed."],
              ["03", "Track an owned operating cycle", "Move the work through four statuses without confusing working completeness with approval."],
              ["04", "Export and roll forward", "Download a decision brief, retain browser-local monthly history, and start the next month from carryover."],
            ].map(([number, title, body]) => <div key={number} className="bg-white p-6"><span className="text-xs font-bold tracking-[0.16em] text-sky-700">{number}</span><h3 className="mt-4 text-lg font-bold text-slate-950">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{body}</p></div>)}
          </div>
        </div>
      </section>

      <section id="what-pro-unlocks" className="scroll-mt-20 border-b border-slate-200 bg-white px-4 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-7 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-800">What Pro unlocks</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-[-0.025em] text-slate-950 md:text-5xl">Not more content. A more useful work layer.</h2>
            </div>
            <p className="max-w-2xl text-base leading-8 text-slate-600 lg:justify-self-end">Each part has a different role: evidence helps you understand, tools help you decide, and working files help you execute without rebuilding the same artifact from scratch.</p>
          </div>

          <div className="mt-10 grid gap-px overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-200 lg:grid-cols-2">
            {proLibrary.map((item) => (
              <article key={item.title} className="bg-[#f8fafb] p-6 sm:p-8">
                <div className="flex items-center justify-between gap-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-800"><item.icon className="h-5 w-5" /></span>
                  <span className="text-xs font-bold tracking-[0.16em] text-sky-800">{item.number}</span>
                </div>
                <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">{item.example}</p>
                <h3 className="mt-2 text-xl font-bold text-slate-950">{item.title}</h3>
                <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">{item.body}</p>
                <Link href={item.href} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-sky-800 hover:text-sky-950">{item.linkLabel} <ArrowRight className="h-4 w-4" /></Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-sky-200/70 bg-[#edf7ff] px-4 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.74fr_1.26fr] lg:items-start">
            <div className="max-w-xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-800">Free versus Pro</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-[-0.025em] text-slate-950 md:text-4xl">Know exactly what changes when you upgrade.</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">Start free. Upgrade only when deeper evidence and reusable files match work you genuinely need to do.</p>
              <Link href="/pricing#evidence-plans" className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-sky-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-800">See plans and availability <ArrowRight className="h-4 w-4" /></Link>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-sky-200 bg-white shadow-xl shadow-sky-950/5">
              <table className="w-full min-w-[650px] border-collapse text-left text-sm">
                <thead className="bg-[#07182d] text-white"><tr><th className="p-4 font-semibold">Access</th><th className="p-4 font-semibold">Free</th><th className="p-4 font-semibold text-sky-200">Atlas Pro</th></tr></thead>
                <tbody>{comparisonRows.map(([label, free, pro]) => <tr key={label} className="border-t border-slate-200"><th className="bg-slate-50 p-4 font-semibold text-slate-950">{label}</th><td className="p-4 leading-6 text-slate-600">{free}</td><td className="p-4 leading-6 text-slate-700"><span className="flex items-start gap-2"><Check className="mt-1 h-3.5 w-3.5 shrink-0 text-sky-700" />{pro}</span></td></tr>)}</tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#081a2d] px-4 py-16 text-slate-100 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-300">How Pro fits the work</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-[-0.025em] md:text-4xl">One question becomes a reusable professional workflow.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-400">Pro is most useful when understanding and execution happen together.</p>
          </div>
          <div className="mt-9 grid gap-3 md:grid-cols-4">
            {workflow.map(([number, title, body]) => (
              <article key={number} className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <span className="text-xs font-bold tracking-[0.16em] text-sky-300">{number}</span>
                <h3 className="mt-5 text-xl font-bold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-sky-200/70 bg-[#edf7ff] px-4 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-800">Three repeatable playbooks</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-[-0.025em] text-slate-950 md:text-4xl">Start with work to be done, then pull the right depth.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">These examples show how the Pro layers connect. Availability still depends on the published lesson, tool and file catalog at the time you use it.</p>
          </div>
          <div className="mt-9 grid gap-4 lg:grid-cols-3">
            {ATLAS_PRO_WORKFLOWS.map((playbook, index) => {
              const selected = playbook.id === selectedWorkflowId;
              return (
                <article key={playbook.question} className={`flex flex-col rounded-2xl border bg-white p-6 shadow-sm shadow-sky-950/5 transition ${selected ? "border-sky-500 ring-2 ring-sky-200" : "border-sky-200"}`}>
                <div className="flex items-center justify-between gap-4"><span className="text-xs font-bold tracking-[0.16em] text-sky-700">0{index + 1}</span><BadgeCheck className="h-5 w-5 text-sky-700" /></div>
                <h3 className="mt-5 text-xl font-bold text-slate-950">{playbook.question}</h3>
                <div className="mt-5 flex-1 space-y-4 border-t border-slate-200 pt-5">
                  {[["Evidence", playbook.evidence], ["Tool", playbook.tool], ["Working file", playbook.workingFile]].map(([label, body]) => (
                    <div key={label} className="grid grid-cols-[5.5rem_1fr] gap-3 text-sm leading-6"><strong className="text-sky-900">{label}</strong><span className="text-slate-600">{body}</span></div>
                  ))}
                </div>
                <button type="button" aria-pressed={selected} onClick={() => selectWorkflow(playbook.id)} className={`mt-6 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${selected ? "bg-sky-900 text-white" : "border border-sky-200 text-sky-900 hover:bg-sky-50"}`}>{selected ? <CheckCircle2 className="h-4 w-4" /> : null}{selected ? "Selected for my brief" : `Build ${playbook.question} brief`}</button>
                <Link href={playbook.href} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-sky-800 hover:text-sky-950">{playbook.cta} <ArrowRight className="h-4 w-4" /></Link>
                </article>
              );
            })}
          </div>
          <div className="mt-8 overflow-hidden rounded-2xl border border-sky-200 bg-[#07182d] text-slate-100 shadow-xl shadow-sky-950/10">
            <div className="grid lg:grid-cols-[0.72fr_1.28fr]">
              <div className="border-b border-white/10 p-6 lg:border-b-0 lg:border-r lg:p-7">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-300">Your reusable work brief</p>
                <h3 className="mt-3 text-2xl font-bold">{selectedWorkflow.question}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-400">Use this as a starting structure for your own work. Confirm claims, evidence, ownership, and site requirements before relying on the result.</p>
                <button type="button" onClick={copyWorkflowBrief} className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-sky-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-sky-200">{briefCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{briefCopied ? "Copied workflow brief" : "Copy selected workflow brief"}</button>
              </div>
              <div className="grid gap-px bg-white/10 sm:grid-cols-2">
                {[["First step", selectedWorkflow.firstStep], ["Review question", selectedWorkflow.reviewPrompt], ["Evidence", selectedWorkflow.evidence], ["Working file", selectedWorkflow.workingFile]].map(([label, body]) => (
                  <div key={label} className="bg-[#0b1d33] p-5"><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-sky-300">{label}</p><p className="mt-2 text-sm leading-6 text-slate-300">{body}</p></div>
                ))}
              </div>
            </div>
            <p className="border-t border-white/10 px-6 py-3 text-[10px] leading-5 text-slate-500">Professional planning support only · not project-specific expert review, QA approval, regulatory advice, or a controlled site record.</p>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white px-4 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-px overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-200 lg:grid-cols-2">
            <article className="bg-sky-50 p-6 sm:p-8">
              <Sparkles className="h-6 w-6 text-sky-800" />
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-sky-800">Choose Pro when</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">You want ongoing professional depth.</h2>
              <ul className="mt-5 space-y-3">{proReasons.map((item) => <li key={item} className="flex items-start gap-2.5 text-sm leading-6 text-slate-700"><Check className="mt-1 h-4 w-4 shrink-0 text-sky-700" />{item}</li>)}</ul>
            </article>
            <article className="bg-teal-50 p-6 sm:p-8">
              <ShieldCheck className="h-6 w-6 text-teal-800" />
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-teal-800">Choose Quality Lab when</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">A real site decision needs scoped work.</h2>
              <ul className="mt-5 space-y-3">{qualityLabReasons.map((item) => <li key={item} className="flex items-start gap-2.5 text-sm leading-6 text-slate-700"><Check className="mt-1 h-4 w-4 shrink-0 text-teal-700" />{item}</li>)}</ul>
              <Link href="/quality-lab" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-teal-800">Explore Quality Lab <ArrowRight className="h-4 w-4" /></Link>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-[#07182d] px-4 py-14 text-slate-100 md:py-16">
        <div className="mx-auto max-w-6xl rounded-[1.75rem] border border-sky-300/20 bg-sky-300/[0.055] p-6 sm:p-9 lg:flex lg:items-center lg:justify-between lg:gap-12">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-sky-200"><Crown className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-[0.17em]">Atlas Pro</span></div>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-[-0.025em] md:text-4xl">Start with the public layer. Upgrade when repeat work begins.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-400">No project engagement is bundled into Pro. You are paying for deeper access and reusable professional resources.</p>
          </div>
          <div className="mt-7 min-w-[17rem] rounded-2xl border border-white/10 bg-[#0b1d33] p-5 lg:mt-0">
            <p className="text-sm text-slate-400">Membership from</p>
            <p className="mt-1 text-3xl font-bold text-white">$8/month</p>
            <Link href="/pricing#evidence-plans" className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-sky-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-sky-200">See plans <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
