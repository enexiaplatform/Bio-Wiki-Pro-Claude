import { Link } from "wouter";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  FileSpreadsheet,
  Layers3,
  ShieldAlert,
  UsersRound,
} from "lucide-react";
import { useSEO } from "@/hooks/use-seo";

const packageContents = [
  {
    icon: ClipboardCheck,
    title: "Executive decision brief",
    format: "Leadership-ready PDF",
    body: "The operating question, recommended direction, scenario comparison, material risks, and unresolved decisions in a concise review format.",
    includes: ["Decision summary", "Recommended direction", "Key risks and dependencies"],
  },
  {
    icon: Layers3,
    title: "Capability & capacity model",
    format: "Structured model",
    body: "A traceable view from required tests and methods to workload, capability coverage, bottlenecks, redundancy, and turnaround pressure.",
    includes: ["Capability gap map", "Demand and capacity basis", "Baseline and alternative scenario"],
  },
  {
    icon: FileSpreadsheet,
    title: "Planning workbook",
    format: "Editable working file",
    body: "People, equipment, consumables, space allowances, utilities, and CAPEX/OPEX assumptions organized for project discussion and refinement.",
    includes: ["Resource model", "Equipment and consumables basis", "Cost assumptions and sensitivity"],
  },
  {
    icon: FileCheck2,
    title: "Evidence & assumption register",
    format: "Controlled register",
    body: "The source basis, user-supplied facts, confidence, open questions, exclusions, and expert-verification needs behind each material recommendation.",
    includes: ["Evidence trace", "Assumption ownership", "Open decision and verification queue"],
  },
];

const levels = [
  {
    name: "Free initial model",
    price: "$0",
    purpose: "Orient the problem and reveal the highest-value information gaps.",
    items: ["Initial capability view", "Illustrative workload pressure", "Open-question summary"],
    href: "/quality-lab/planner",
    cta: "Build the model",
  },
  {
    name: "Scope Diagnostic",
    price: "$149",
    purpose: "Turn a broad project question into an agreed scope and decision memo.",
    items: ["60-minute stakeholder workshop", "Input and gap triage", "Written scope and decision memo"],
    href: "/quality-lab/review?offer=diagnostic",
    cta: "Book the diagnostic",
  },
  {
    name: "Expert-reviewed Blueprint",
    price: "From $990",
    purpose: "Deliver the controlled package for the agreed founding pilot scope.",
    items: ["Baseline plus one alternative", "One review workshop", "One controlled revision"],
    href: "/quality-lab/review",
    cta: "Discuss the Blueprint",
  },
];

export default function DeliverablesPage() {
  useSEO({
    title: "Quality Lab Blueprint Deliverables",
    description: "Explore the decision brief, capability model, planning workbook, and evidence register included in an Atlas Quality Lab Blueprint.",
  });

  return (
    <div className="min-h-screen bg-[#f4f7f5] text-[#0b1b2c]">
      <section className="border-b border-white/10 bg-[#061426] px-4 py-16 text-slate-100 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <span className="inline-flex rounded-full border border-teal-300/30 bg-teal-300/[0.07] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-teal-200">Blueprint deliverables</span>
            <h1 className="mt-6 font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">A decision package built to be <span className="text-teal-300">reviewed, challenged, and controlled.</span></h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">Each output answers a different project question. Together they connect the recommendation to its operating basis, evidence, assumptions, and unresolved decisions.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/quality-lab/sample" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-teal-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-teal-200">See a sample Blueprint <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/quality-lab/how-it-works" className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/25 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:border-white/45 hover:bg-white/[0.08]">See the Quality Lab process</Link>
            </div>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-[#0a1d32] p-4 shadow-2xl shadow-black/20 sm:p-6">
            <img src="/images/blueprint/quality-lab-blueprint-deliverables.webp" alt="Illustrative Quality Lab Blueprint package showing an executive brief, capability model, cost scenario, and evidence register" width="900" height="720" fetchPriority="high" className="mx-auto w-full object-contain" />
            <p className="mt-3 text-center text-[10px] italic tracking-wide text-slate-500">Illustrative concept output · final scope and deliverables are agreed before kickoff</p>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-800">Inside the package</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950 md:text-5xl">Four connected outputs. One decision basis.</h2>
            <p className="mt-4 text-base leading-7 text-slate-600">The exact depth follows the agreed project scope; every material recommendation is intended to remain traceable to its basis.</p>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {packageContents.map((item) => (
              <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,35,50,0.06)] sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-800"><item.icon className="h-5 w-5" /></div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">{item.format}</span>
                </div>
                <h3 className="mt-6 text-xl font-bold text-slate-950">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{item.body}</p>
                <ul className="mt-5 space-y-2 border-t border-slate-200 pt-4">
                  {item.includes.map((line) => <li key={line} className="flex items-start gap-2 text-sm text-slate-700"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />{line}</li>)}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#081a2d] px-4 py-16 text-slate-100 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-300">Choose the depth you need</p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl">Start free, then add rigor as the decision becomes real.</h2>
          </div>
          <div className="mt-9 grid gap-4 lg:grid-cols-3">
            {levels.map((level, index) => (
              <article key={level.name} className={`flex flex-col rounded-2xl border p-6 ${index === 2 ? "border-teal-300/35 bg-teal-300/[0.08]" : "border-white/10 bg-white/[0.035]"}`}>
                <div className="flex items-start justify-between gap-4"><h3 className="text-lg font-bold">{level.name}</h3><span className="whitespace-nowrap text-sm font-bold text-teal-200">{level.price}</span></div>
                <p className="mt-3 min-h-16 text-sm leading-6 text-slate-400">{level.purpose}</p>
                <ul className="mt-5 flex-1 space-y-3 border-t border-white/10 pt-5">{level.items.map((item) => <li key={item} className="flex items-start gap-2 text-sm text-slate-300"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" />{item}</li>)}</ul>
                <Link href={level.href} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-teal-200 transition hover:text-teal-100">{level.cta} <ArrowRight className="h-4 w-4" /></Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white px-4 py-16 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6 sm:p-8">
            <UsersRound className="h-6 w-6 text-teal-800" />
            <h2 className="mt-4 text-2xl font-bold text-slate-950">Designed for cross-functional review</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">The package gives QC, QA, engineering, procurement, and leadership a shared basis without hiding assumptions inside a black box.</p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 sm:p-8">
            <ShieldAlert className="h-6 w-6 text-amber-800" />
            <h2 className="mt-4 text-2xl font-bold text-slate-950">Explicit planning boundary</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">Outputs support planning and decisions. They do not replace site risk assessment, detailed engineering, method verification or validation, QA approval, or regulatory review.</p>
          </div>
        </div>
      </section>

      <section className="bg-[#ecf5f2] px-4 py-16 md:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-slate-950 md:text-5xl">See the package before you scope the project.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600">Review the illustrative sample, then build an initial model or discuss the real operating question with Atlas.</p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/quality-lab/sample" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-teal-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-800">View the sample <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/quality-lab/review" className="inline-flex min-h-12 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:border-teal-700">Discuss a real project</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
