import { Link } from "wouter";
import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  CheckCircle2,
  ClipboardList,
  FileCheck2,
  FlaskConical,
  Gauge,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { useSEO } from "@/hooks/use-seo";

const phases = [
  {
    number: "01",
    icon: ClipboardList,
    title: "Frame the operating question",
    body: "Capture the site, products, markets, volumes, testing scope, turnaround targets, constraints, and the decision that must be made.",
    output: "A visible input basis and a prioritized list of missing decisions.",
  },
  {
    number: "02",
    icon: Boxes,
    title: "Compile the first model",
    body: "Atlas connects testing demand to capabilities, methods, workload, people, equipment, consumables, space allowances, cost, and risk.",
    output: "An initial model with scenarios, gaps, assumptions, and evidence needs.",
  },
  {
    number: "03",
    icon: UsersRound,
    title: "Challenge the assumptions",
    body: "QC, QA, engineering, procurement, and qualified experts review the same basis instead of debating disconnected spreadsheets.",
    output: "Corrections, agreed decisions, open questions, and an expert-review trail.",
  },
  {
    number: "04",
    icon: FileCheck2,
    title: "Release a controlled package",
    body: "The agreed scope is assembled into a decision brief and planning files that make the recommendation, uncertainty, and exclusions explicit.",
    output: "A Blueprint package your project team can use for the next controlled decision.",
  },
];

const roles = [
  { title: "Your project team", body: "Provides site facts, constraints, priorities, and accountable decisions." },
  { title: "Atlas", body: "Structures the evidence, compiles scenarios, exposes gaps, and prepares the controlled package." },
  { title: "Qualified reviewers", body: "Challenge applicable assumptions and identify where site verification or specialist review is required." },
];

const signals = [
  "What is supplied by the client",
  "What is an Atlas planning assumption",
  "What evidence supports a recommendation",
  "What still requires verification",
];

export default function HowItWorksPage() {
  useSEO({
    title: "How the Quality Lab Blueprint Works",
    description: "See how the Atlas Quality Lab Blueprint turns a laboratory question into a visible, expert-review-ready decision package.",
  });

  return (
    <div className="min-h-screen bg-[#f4f7f5] text-[#0b1b2c]">
      <section className="border-b border-white/10 bg-[#061426] px-4 py-16 text-slate-100 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-300/30 bg-teal-300/[0.07] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-teal-200">
              <FlaskConical className="h-3.5 w-3.5" /> Quality Lab process
            </span>
            <h1 className="mt-6 max-w-3xl font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              From a fragmented lab question to <span className="text-teal-300">one challengeable decision basis.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
              Atlas does not begin with equipment. It begins with what the site must manufacture, test, release, and defend—then works forward to the operating capabilities required.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/quality-lab/planner" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-teal-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-teal-200">
                Build the free model <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/quality-lab/deliverables" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/25 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:border-white/45 hover:bg-white/[0.08]">
                Explore the deliverables
              </Link>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-[#0a1d32] p-5 shadow-2xl shadow-black/20 sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-300">The compilation chain</p>
            <div className="mt-5 space-y-3">
              {["Products & markets", "Tests, methods & workload", "People, equipment & operating needs", "Cost, risk & procurement basis"].map((item, index) => (
                <div key={item} className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.035] p-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-300/10 text-xs font-bold text-teal-200">{index + 1}</span>
                  <span className="text-sm font-semibold text-slate-100">{item}</span>
                  {index < 3 && <ArrowRight className="ml-auto h-4 w-4 rotate-90 text-slate-600" />}
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-300/20 bg-amber-300/[0.06] p-4 text-xs leading-6 text-amber-100/80">
              <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-amber-300" />
              Every stage keeps assumptions, confidence, unresolved information, and expert-verification needs visible.
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-800">The working sequence</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950 md:text-5xl">Four stages, with a decision at the end of each.</h2>
            <p className="mt-4 text-base leading-7 text-slate-600">The process is designed to reduce expensive ambiguity before it becomes procurement, construction, staffing, or compliance rework.</p>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {phases.map((phase) => (
              <article key={phase.number} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,35,50,0.06)] sm:p-7">
                <div className="flex items-start justify-between gap-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-800"><phase.icon className="h-5 w-5" /></div>
                  <span className="font-display text-sm font-bold text-slate-300">{phase.number}</span>
                </div>
                <h3 className="mt-6 text-xl font-bold text-slate-950">{phase.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{phase.body}</p>
                <div className="mt-5 border-t border-slate-200 pt-4">
                  <p className="flex items-start gap-2 text-sm leading-6 text-slate-700"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-teal-700" /><span><strong>Stage output:</strong> {phase.output}</span></p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white px-4 py-16 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.82fr_1.18fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-800">Shared accountability</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950 md:text-4xl">Software structures the question. People remain accountable for the answer.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">Atlas is service-assisted decision intelligence—not a replacement for site knowledge, qualified engineering, QA approval, or regulatory review.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {roles.map((role, index) => (
              <article key={role.title} className="rounded-2xl border border-slate-200 bg-[#f8faf9] p-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white">{index + 1}</span>
                <h3 className="mt-5 font-bold text-slate-950">{role.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{role.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#081a2d] px-4 py-16 text-slate-100 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-300">Designed for defensible decisions</p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl">Know the status of every material input.</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {signals.map((signal) => (
              <div key={signal} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-4 text-sm text-slate-300">
                <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" />{signal}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#ecf5f2] px-4 py-16 md:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <Gauge className="mx-auto h-8 w-8 text-teal-800" />
          <h2 className="mt-4 text-3xl font-bold text-slate-950 md:text-5xl">Start with the model. Add expert depth when the decision warrants it.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600">Create the free initial view, use the $149 diagnostic to resolve scope, or discuss an expert-reviewed Blueprint from $990.</p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/quality-lab/planner" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-teal-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-800">Build the free model <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/quality-lab/review" className="inline-flex min-h-12 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:border-teal-700">Discuss a real project</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
