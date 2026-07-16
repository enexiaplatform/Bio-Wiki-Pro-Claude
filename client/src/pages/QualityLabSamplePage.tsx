import { Link } from "wouter";
import { ArrowRight, CheckCircle2, Download, FileCheck2, ShieldCheck } from "lucide-react";
import { useSEO } from "@/hooks/use-seo";
import { QUALITY_LAB_COMMERCIAL_TERMS } from "@shared/quality-lab-commercial";

const evidenceRows = [
  ["Monthly demand", "Planning estimate", "Low", "Replace with 12-month history"],
  ["Method cycle time", "Generic planning range", "Low", "Confirm site methods"],
  ["Analyst availability", "Headcount assumption", "Medium", "Confirm non-routine load"],
] as const;

export default function QualityLabSamplePage() {
  useSEO({
    title: "Illustrative Quality Lab Blueprint Sample",
    description: "See the structure, boundaries, evidence register and controlled deliverables in an illustrative Atlas Quality Lab Blueprint.",
  });

  return (
    <div className="min-h-screen bg-[#07111f] px-4 pb-24 pt-8 text-slate-100 md:pt-14">
      <div className="mx-auto max-w-6xl">
        <header className="rounded-3xl border border-teal-300/20 bg-gradient-to-br from-teal-300/10 via-white/[0.035] to-transparent p-6 md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-300">Public illustrative sample</p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">See what a controlled Blueprint looks like before you buy.</h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400 md:text-base">This synthetic, redacted example shows the decision brief, scenario comparison, evidence register, scope boundaries and acceptance controls. It is not a customer result or an approved facility design.</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <a href="/api/quality-lab/sample-blueprint.pdf" className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-300 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-teal-200"><Download className="h-4 w-4" /> Download sample PDF</a>
                <Link href="/quality-lab/review?offer=diagnostic" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold hover:border-white/30">Start with the $149 Diagnostic <ArrowRight className="h-4 w-4" /></Link>
              </div>
            </div>
            <div className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-5 text-sm leading-6 text-amber-100/80"><ShieldCheck className="mb-3 h-5 w-5 text-amber-200" /><strong className="text-amber-100">Boundary:</strong> all figures below are illustrative inputs and concept calculations. Engineering, validation, procurement and regulatory reliance require project-specific evidence and separately qualified professionals.</div>
          </div>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <SampleCard title="Decision framed" icon={FileCheck2}><p>Can a one-shift microbiology concept support assumed release-testing demand, or should a second-shift scenario enter detailed planning?</p></SampleCard>
          <SampleCard title="What remains blocked" icon={ShieldCheck}><p>Final room sizing, equipment procurement, method transfer, biosafety classification and regulatory approval.</p></SampleCard>
        </section>

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.035] p-5 md:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-300">Evidence and assumption register</p>
          <h2 className="mt-2 text-2xl font-bold">Every important number carries a basis and a next action.</h2>
          <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="text-xs uppercase tracking-wider text-slate-500"><tr><th className="p-3">Item</th><th className="p-3">Current basis</th><th className="p-3">Confidence</th><th className="p-3">Required action</th></tr></thead><tbody className="divide-y divide-white/8">{evidenceRows.map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell} className="p-3 text-slate-300">{cell}</td>)}</tr>)}</tbody></table></div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[1fr_.9fr]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 md:p-7"><p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-300">Included in a paid Blueprint</p><ul className="mt-4 space-y-3">{QUALITY_LAB_COMMERCIAL_TERMS.blueprintDeliverables.map((item) => <li key={item} className="flex items-start gap-2 text-sm text-slate-300"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" />{item}</li>)}</ul></div>
          <div className="rounded-2xl border border-sky-300/15 bg-sky-300/[0.055] p-5 md:p-7"><p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-200">Operating terms</p><ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300"><li>{QUALITY_LAB_COMMERCIAL_TERMS.responseSla}</li><li>{QUALITY_LAB_COMMERCIAL_TERMS.blueprintTarget}</li><li>{QUALITY_LAB_COMMERCIAL_TERMS.acceptance}</li></ul></div>
        </section>
      </div>
    </div>
  );
}

function SampleCard({ title, icon: Icon, children }: { title: string; icon: typeof FileCheck2; children: React.ReactNode }) {
  return <article className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 md:p-6"><Icon className="h-5 w-5 text-teal-300" /><h2 className="mt-4 text-lg font-bold">{title}</h2><div className="mt-2 text-sm leading-7 text-slate-400">{children}</div></article>;
}
