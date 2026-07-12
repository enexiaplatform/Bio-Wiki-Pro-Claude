import { ArrowRight, CheckCircle2, ClipboardList, Download, FileSpreadsheet, Network, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { analytics } from "@/hooks/use-analytics";
import { useSEO } from "@/hooks/use-seo";
import { blueprintDiscoveryTemplates } from "@/data/qualityLabDiscoveryTemplates";

const domains = [
  ["Compiler Core", "Cross-domain decisions, demand, capacity, scenarios, evidence and review", "/blog/product-portfolio-to-qc-capability-map"],
  ["Non-sterile microbiology", "Product methods, suitability, BOM, incubation and in-house load", "/blog/how-to-scope-nonsterile-microbiology-qc-lab"],
  ["Water & environmental monitoring", "Points, events, sampling, plate-days, trending and investigations", "/blog/water-environmental-monitoring-capability-planning"],
  ["Sterile & biologics", "Sterility-assurance evidence, product attributes, potency and specialist methods", "/blog/sterile-biologics-qc-capability-planning"],
  ["Analytical chemistry", "Preparations, sequences, standards, instruments, analysts and review", "/blog/analytical-chemistry-qc-capability-planning"],
  ["Stability & sample management", "Protocols, chamber inventory, pulls, methods, trends and continuity", "/blog/stability-sample-management-capability-planning"],
  ["Validation & learning governance", "Frozen baselines, actuals, variance drivers, validation cases and controlled rule changes", "/blog/how-to-validate-a-quality-lab-domain-pack"],
] as const;

function csvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function downloadTemplate(template: (typeof blueprintDiscoveryTemplates)[number]) {
  const csv = template.rows.map((row) => row.map(csvCell).join(",")).join("\r\n") + "\r\n";
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = template.filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  analytics.downloadClicked("blueprint_discovery_pack", template.filename);
}

export default function QualityLabDiscoveryPackPage() {
  useSEO({
    title: "Atlas Blueprint Discovery Pack",
    description: "Free structured templates for collecting Quality Lab Blueprint inputs, requirements, evidence, assumptions and decisions.",
  });

  return (
    <div className="min-h-screen bg-[#08111f] px-4 pb-24 pt-8 text-slate-100 md:pt-14">
      <div className="mx-auto max-w-6xl">
        <section className="overflow-hidden rounded-3xl border border-teal-300/20 bg-gradient-to-br from-teal-300/15 via-sky-300/[0.06] to-transparent p-6 md:p-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-teal-300/25 bg-teal-300/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-teal-200">
            <ClipboardList className="h-3.5 w-3.5" /> Free discovery asset
          </span>
          <h1 className="mt-6 max-w-4xl font-display text-4xl font-bold leading-tight md:text-6xl">Atlas Blueprint Discovery Pack</h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300 md:text-lg">
            Collect the minimum structured evidence needed to turn a product portfolio and testing demand into a reviewable quality-laboratory capability model.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/quality-lab/planner" onClick={() => analytics.blueprintCtaClicked("discovery_pack", "planner")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-300 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-teal-200">
              Start a Blueprint <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/quality-lab/review" onClick={() => analytics.blueprintCtaClicked("discovery_pack", "expert_review")} className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold hover:border-white/30">
              Discuss a real project
            </Link>
            <Link href="/quality-lab/casebook" className="inline-flex items-center justify-center rounded-xl border border-sky-300/20 bg-sky-300/[0.06] px-5 py-3 text-sm font-semibold text-sky-200 hover:bg-sky-300/10">
              Explore casebook
            </Link>
            <Link href="/quality-lab/evidence" className="inline-flex items-center justify-center rounded-xl border border-sky-300/20 bg-sky-300/[0.06] px-5 py-3 text-sm font-semibold text-sky-200 hover:bg-sky-300/10">
              Navigate evidence
            </Link>
          </div>
        </section>

        <section className="py-12">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-300">How to use it</p>
            <h2 className="mt-3 text-3xl font-bold">One discovery structure across every Domain Pack</h2>
          </div>
          <div className="mt-7 grid gap-3 md:grid-cols-5">
            {["Define the decision", "Collect portfolio facts", "Map requirements and methods", "Expose evidence gaps", "Review scenarios and corrections"].map((step, index) => (
              <div key={step} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <span className="text-xs font-bold text-teal-300">0{index + 1}</span>
                <p className="mt-4 text-sm font-bold leading-6">{step}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-slate-950/40 p-5 md:p-8">
          <div className="flex items-start gap-3">
            <FileSpreadsheet className="mt-1 h-6 w-6 text-teal-300" />
            <div>
              <h2 className="text-2xl font-bold">Download the working templates</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">Use the intake and mapping templates during discovery, the application readiness and observation templates during controlled evidence capture, then the validation and impact templates only with frozen project baselines. Do not place confidential client data in public or shared systems without authorization.</p>
            </div>
          </div>
          <div className="mt-7 grid gap-4 lg:grid-cols-3">
            {blueprintDiscoveryTemplates.map((template) => (
              <article key={template.filename} className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                <h3 className="text-lg font-bold">{template.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-6 text-slate-400">{template.description}</p>
                <button type="button" onClick={() => downloadTemplate(template)} className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl border border-teal-300/25 bg-teal-300/10 px-4 py-3 text-sm font-bold text-teal-200 hover:bg-teal-300/15">
                  <Download className="h-4 w-4" /> Download CSV
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="py-12">
          <div className="flex items-center gap-3">
            <Network className="h-6 w-6 text-sky-300" />
            <h2 className="text-2xl font-bold">Domain-specific discovery guides</h2>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {domains.map(([title, body, href]) => (
              <Link key={href} href={href} className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-sky-300/30 hover:bg-white/[0.05]">
                <h3 className="font-bold group-hover:text-teal-200">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{body}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-teal-300">Open guide <ArrowRight className="h-3.5 w-3.5" /></span>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.05] p-5">
          <div className="flex gap-3 text-sm leading-6 text-slate-300">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
            <p><strong>Planning boundary:</strong> these templates organize discovery; they do not establish regulatory applicability, approve methods, validate a design or replace controlled site records. Verify every material input with qualified QC, QA, regulatory and engineering owners.</p>
          </div>
        </section>

        <div className="mt-8 flex flex-wrap gap-4 text-sm text-slate-400">
          {["No sign-in required", "CSV format", "Vendor-neutral", "Evidence-aware"].map((item) => <span key={item} className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-teal-300" />{item}</span>)}
        </div>
      </div>
    </div>
  );
}
