import { Link } from "wouter";
import { AlertTriangle, ArrowRight, BarChart3, Boxes, Building2, CheckCircle2, Download, FileCheck2, Gauge, Network, ShieldCheck } from "lucide-react";
import { useSEO } from "@/hooks/use-seo";
import { QUALITY_LAB_COMMERCIAL_TERMS } from "@shared/quality-lab-commercial";
import { analytics } from "@/hooks/use-analytics";

const evidenceRows = [
  ["Monthly demand", "Planning estimate", "Low", "Replace with 12-month history"],
  ["Method cycle time", "Generic planning range", "Low", "Confirm site methods"],
  ["Analyst availability", "Headcount assumption", "Medium", "Confirm non-routine load"],
] as const;

const sampleSections = [
  ["#sample-readiness", "Readiness & controls"],
  ["#sample-capacity", "Demand & capacity"],
  ["#sample-resources", "Equipment, space & cost"],
  ["#sample-trace", "Evidence & rule trace"],
] as const;

const samplePages = [
  "Cover and document control", "Executive decision brief", "Scenario comparison", "Evidence readiness", "Demand and capacity", "Equipment pressure",
  "Functional space allowance", "Cost and sensitivity", "Risks, blockers and actions", "Evidence and assumptions", "Versioned rule trace", "Review competence", "Scope and controlled handover",
];

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
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400 md:text-base">This synthetic illustrative example shows the decision brief, scenario comparison, evidence register, scope boundaries and acceptance controls. It is not a customer result or an approved facility design.</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <a href="/api/quality-lab/sample-blueprint.pdf" onClick={() => analytics.sampleBlueprintDownloaded()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-300 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-teal-200"><Download className="h-4 w-4" /> Download sample PDF</a>
                <Link href="/quality-lab/review?offer=diagnostic" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold hover:border-white/30">Start with the $149 Diagnostic <ArrowRight className="h-4 w-4" /></Link>
              </div>
            </div>
            <div className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-5 text-sm leading-6 text-amber-100/80"><ShieldCheck className="mb-3 h-5 w-5 text-amber-200" /><strong className="text-amber-100">Boundary:</strong> all figures below are illustrative inputs and concept calculations. Engineering, validation, procurement and regulatory reliance require project-specific evidence and separately qualified professionals.</div>
          </div>
        </header>

        <nav aria-label="Sample Blueprint sections" className="sticky top-16 z-30 mt-5 overflow-x-auto rounded-xl border border-white/10 bg-[#07111f]/95 p-2 shadow-xl backdrop-blur">
          <div className="flex min-w-max gap-1">{sampleSections.map(([href, label]) => <a key={href} href={href} className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-400 transition hover:bg-white/5 hover:text-teal-200">{label}</a>)}</div>
        </nav>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <SampleCard title="Decision framed" icon={FileCheck2}><p>Can a one-shift microbiology concept support assumed release-testing demand, or should a second-shift scenario enter detailed planning?</p></SampleCard>
          <SampleCard title="What remains blocked" icon={ShieldCheck}><p>Final room sizing, equipment procurement, method transfer, biosafety classification and regulatory approval.</p></SampleCard>
        </section>

        <section id="sample-readiness" className="mt-6 scroll-mt-32 rounded-2xl border border-white/10 bg-white/[0.035] p-5 md:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-300">Readiness and decision controls</p>
          <h2 className="mt-2 text-2xl font-bold">A completed planner can still be unready for controlled use.</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[["4/4", "Planner steps", "Concept intake complete"], ["10%", "Evidence readiness", "Weighted evidence-gap score"], ["5", "Controlled-use blockers", "Reliance remains prohibited"], ["12", "Active actions", "Work to resolve open evidence"]].map(([value, label, detail]) => <div key={label} className="rounded-xl border border-white/10 bg-slate-950/30 p-4"><p className="text-2xl font-bold text-slate-100">{value}</p><p className="mt-1 text-xs font-bold text-slate-300">{label}</p><p className="mt-2 text-[11px] leading-5 text-slate-500">{detail}</p></div>)}
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-3"><ControlCard icon={AlertTriangle} title="Modeled operational risk" body="A signal produced by the currently modeled scenario. Zero detected risks does not cancel evidence blockers." /><ControlCard icon={ShieldCheck} title="Controlled-use blocker" body="Missing evidence or review that prevents reliance for investment, URS or procurement." /><ControlCard icon={CheckCircle2} title="Action" body="Owned work with evidence, due date and review status that resolves a blocker or important input." /></div>
        </section>

        <section id="sample-capacity" className="mt-6 scroll-mt-32 rounded-2xl border border-sky-300/15 bg-sky-300/[0.04] p-5 md:p-7">
          <div className="flex items-start gap-3"><BarChart3 className="mt-1 h-5 w-5 text-sky-300" /><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-300">Demand and capacity</p><h2 className="mt-2 text-2xl font-bold">The sample exposes the calculation at the point of use.</h2></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
            <div className="rounded-xl border border-white/10 bg-slate-950/30 p-4"><p className="text-sm font-bold">Scenario movement</p><div className="mt-5 space-y-5">{[["Test units / month", 1200, 1200], ["Team FTE", 6, 9], ["Concept area (m²)", 185, 238]].map(([label, current, future]) => <div key={label}><div className="flex justify-between text-xs"><span className="text-slate-400">{label}</span><strong>{current} → {future}</strong></div><div className="mt-2 h-2 rounded-full bg-white/10"><div className="h-full rounded-full bg-teal-300" style={{ width: `${Math.min(100, Number(future) / Math.max(Number(current), Number(future)) * 100)}%` }} /></div></div>)}</div></div>
            <div className="overflow-x-auto rounded-xl border border-white/10"><table className="w-full min-w-[680px] text-left text-sm"><thead className="text-[10px] uppercase tracking-wider text-slate-500"><tr><th className="p-3">Resource</th><th className="p-3">Monthly load</th><th className="p-3">Available</th><th className="p-3">Planning utilization</th></tr></thead><tbody className="divide-y divide-white/8"><tr><td className="p-3 font-semibold">Incubator 20–25 °C</td><td className="p-3">450 plate-days</td><td className="p-3">5,355</td><td className="p-3"><strong className="text-teal-200">10.9%</strong><p className="mt-1 text-[10px] text-slate-500">(450 × 1.3 peak factor) ÷ 5,355 × 100</p></td></tr><tr><td className="p-3 font-semibold">Class II BSC</td><td className="p-3">186 hours</td><td className="p-3">232 hours</td><td className="p-3"><strong className="text-red-200">104.2%</strong><p className="mt-1 text-[10px] text-slate-500">Concept constraint · schedule verification required</p></td></tr></tbody></table></div>
          </div>
        </section>

        <section id="sample-resources" className="mt-6 scroll-mt-32 grid gap-4 lg:grid-cols-3">
          <SampleCard title="Equipment pressure" icon={Boxes}><p>Vendor-neutral classes, current/future quantities, budget ranges, method links and qualification boundaries.</p></SampleCard>
          <SampleCard title="Functional space" icon={Building2}><p>Net functional allowances separated from circulation, utilities, HVAC and detailed-engineering decisions.</p></SampleCard>
          <SampleCard title="Cost sensitivity" icon={Gauge}><p>Range basis, currency date, exclusions and the inputs most likely to move CAPEX or OPEX.</p></SampleCard>
        </section>

        <section id="sample-trace" className="mt-6 scroll-mt-32 rounded-2xl border border-white/10 bg-white/[0.035] p-5 md:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-300">Evidence and assumption register</p>
          <h2 className="mt-2 text-2xl font-bold">Every important number carries a basis and a next action.</h2>
          <p className="mt-3 text-xs text-slate-500 md:hidden">Swipe horizontally to inspect the complete register →</p>
          <div className="mt-3 overflow-x-auto rounded-xl border border-white/5"><table className="w-full min-w-[700px] text-left text-sm"><thead className="text-xs uppercase tracking-wider text-slate-400"><tr><th className="p-3">Item</th><th className="p-3">Current basis</th><th className="p-3">Confidence</th><th className="p-3">Required action</th></tr></thead><tbody className="divide-y divide-white/8">{evidenceRows.map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell} className="p-3 text-slate-300">{cell}</td>)}</tr>)}</tbody></table></div>
        </section>

        <section className="mt-6 rounded-2xl border border-violet-300/15 bg-violet-300/[0.035] p-5 md:p-7">
          <div className="flex items-start gap-3"><Network className="mt-1 h-5 w-5 text-violet-300" /><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-300">Inside the 13-page public PDF</p><h2 className="mt-2 text-2xl font-bold">A sanitized view of the same decision architecture.</h2></div></div>
          <ol className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{samplePages.map((page, index) => <li key={page} className="flex gap-3 rounded-lg border border-white/8 bg-white/[0.025] p-3 text-xs leading-5 text-slate-300"><span className="font-bold text-violet-200">{String(index + 1).padStart(2, "0")}</span>{page}</li>)}</ol>
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

function ControlCard({ title, icon: Icon, body }: { title: string; icon: typeof AlertTriangle; body: string }) {
  return <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4"><Icon className="h-4 w-4 text-amber-300" /><p className="mt-3 text-sm font-bold">{title}</p><p className="mt-2 text-xs leading-5 text-slate-500">{body}</p></div>;
}
