import { useMemo, useState } from "react";
import { ArrowRight, Check, CheckCircle2, CircleDashed, ClipboardList, Copy, Download, FileSpreadsheet, Network, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { QualityLabEditorialHero } from "@/components/QualityLabEditorialHero";
import { analytics } from "@/hooks/use-analytics";
import { useSEO } from "@/hooks/use-seo";
import { copyText } from "@/lib/clipboard";
import { blueprintDiscoveryTemplates } from "@/data/qualityLabDiscoveryTemplates";
import {
  assessQualityLabDecisionFrame,
  emptyQualityLabDecisionFrame,
  formatQualityLabDecisionFrame,
  type QualityLabDecisionFrameInput,
} from "@shared/quality-lab-decision-frame";

const domains = [
  ["Compiler Core", "Cross-domain decisions, demand, capacity, scenarios, evidence and review", "/blog/product-portfolio-to-qc-capability-map"],
  ["Non-sterile microbiology", "Product methods, suitability, BOM, incubation and in-house load", "/blog/how-to-scope-nonsterile-microbiology-qc-lab"],
  ["Water & environmental monitoring", "Points, events, sampling, plate-days, trending and investigations", "/blog/water-environmental-monitoring-capability-planning"],
  ["Sterile & biologics", "Sterility-assurance evidence, product attributes, potency and specialist methods", "/blog/sterile-biologics-qc-capability-planning"],
  ["Analytical chemistry", "Preparations, sequences, standards, instruments, analysts and review", "/blog/analytical-chemistry-qc-capability-planning"],
  ["Stability & sample management", "Protocols, chamber inventory, pulls, methods, trends and continuity", "/blog/stability-sample-management-capability-planning"],
  ["Validation & learning governance", "Frozen baselines, actuals, variance drivers, validation cases and controlled rule changes", "/blog/how-to-validate-a-quality-lab-domain-pack"],
] as const;

const decisionFrameFields = [
  { key: "decision", label: "Decision to support", prompt: "What operating, investment, capacity, sourcing, or sequencing decision must this Blueprint support?" },
  { key: "decisionOwner", label: "Owner and reviewers", prompt: "Who owns the decision, and which QC, QA, regulatory, engineering, finance, or operations roles must review it?" },
  { key: "firstScope", label: "First review scope", prompt: "Which site, products, markets, workflows, and scenarios belong in the first bounded review?" },
  { key: "decisionGate", label: "Decision gate", prompt: "What date or project event requires the next decision?" },
  { key: "evidenceBasis", label: "Available evidence", prompt: "Which demand histories, methods, specifications, equipment records, layouts, costs, or other inputs exist, and what are their limits?" },
  { key: "unresolvedImpact", label: "Impact if unresolved", prompt: "What delay, cost, compliance, capacity, release, continuity, or redesign risk remains if this stays open?" },
  { key: "excludedDecisions", label: "Decisions not authorized", prompt: "What must this work not approve yet, such as supplier selection, detailed engineering, validation, or regulatory acceptance?" },
] as const satisfies ReadonlyArray<{ key: keyof QualityLabDecisionFrameInput; label: string; prompt: string }>;

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
  const [decisionFrame, setDecisionFrame] = useState<QualityLabDecisionFrameInput>(emptyQualityLabDecisionFrame);
  const [decisionFrameCopied, setDecisionFrameCopied] = useState(false);
  const decisionFrameReadiness = useMemo(() => assessQualityLabDecisionFrame(decisionFrame), [decisionFrame]);

  useSEO({
    title: "Atlas Blueprint Discovery Pack",
    description: "Free structured templates for collecting Quality Lab Blueprint inputs, requirements, evidence, assumptions and decisions.",
  });

  function updateDecisionFrame(key: keyof QualityLabDecisionFrameInput, value: string) {
    setDecisionFrame((current) => ({ ...current, [key]: value }));
    setDecisionFrameCopied(false);
  }

  async function copyDecisionFrame() {
    await copyText(formatQualityLabDecisionFrame(decisionFrame));
    setDecisionFrameCopied(true);
    analytics.blueprintDecisionFrameCopied(decisionFrameReadiness.percent, decisionFrameReadiness.completeCount);
    window.setTimeout(() => setDecisionFrameCopied(false), 1800);
  }

  return (
    <div className="min-h-screen bg-[#08111f] px-4 pb-24 pt-8 text-slate-100 md:pt-14">
      <div className="mx-auto max-w-6xl">
        <QualityLabEditorialHero
          eyebrow={<span className="inline-flex items-center gap-2 rounded-full border border-teal-300/25 bg-teal-300/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-teal-200"><ClipboardList className="h-3.5 w-3.5" /> Free discovery asset</span>}
          title="Collect the facts a defensible Blueprint needs."
          description="Use one structured pack to frame the decision, capture the product portfolio and testing demand, and make missing evidence visible before detailed modelling begins."
          image={{ src: "/images/editorial/laboratory-glassware-planning.jpg", alt: "Laboratory glassware arranged for structured planning and evidence collection", creditName: "Hans Reniers", creditUrl: "https://unsplash.com/photos/lQGJCMY5qcM", className: "object-[center_54%]" }}
          actions={<><Link href="/quality-lab/planner" onClick={() => analytics.blueprintCtaClicked("discovery_pack", "planner")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-300 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-teal-200">Start a Blueprint <ArrowRight className="h-4 w-4" /></Link><Link href="/quality-lab/review" onClick={() => analytics.blueprintCtaClicked("discovery_pack", "expert_review")} className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold hover:border-white/30">Discuss a real project</Link></>}
        />

        <nav aria-label="Related Blueprint resources" className="mt-4 flex flex-wrap gap-x-5 gap-y-2 px-2 text-xs font-bold text-sky-300">
          <Link href="/quality-lab/casebook" className="inline-flex items-center gap-1.5 hover:text-sky-200">Explore worked cases <ArrowRight className="h-3.5 w-3.5" /></Link>
          <Link href="/quality-lab/evidence" className="inline-flex items-center gap-1.5 hover:text-sky-200">Navigate the evidence graph <ArrowRight className="h-3.5 w-3.5" /></Link>
        </nav>

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

        <section className="mb-12 overflow-hidden rounded-3xl border border-teal-300/20 bg-[#0a1728]">
          <div className="grid lg:grid-cols-[1.3fr_0.7fr]">
            <div className="border-b border-white/10 p-5 md:p-8 lg:border-b-0 lg:border-r">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-300">Decision framing canvas</p>
              <h2 className="mt-3 text-3xl font-bold">Define the decision before collecting every possible input.</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">A narrow decision frame prevents discovery from becoming an open-ended data request. Describe what must be decided, by whom, against which evidence, and what this work is not authorized to conclude.</p>
              <div className="mt-7 grid gap-4 md:grid-cols-2">
                {decisionFrameFields.map((field, index) => (
                  <label key={field.key} className={index === decisionFrameFields.length - 1 ? "md:col-span-2" : ""}>
                    <span className="mb-2 flex items-center justify-between gap-3 text-xs font-bold text-slate-200"><span>{field.label}</span><span className="text-[10px] font-semibold text-slate-600">0{index + 1}</span></span>
                    <textarea aria-label={field.label} value={decisionFrame[field.key]} onChange={(event) => updateDecisionFrame(field.key, event.target.value)} rows={index === decisionFrameFields.length - 1 ? 3 : 4} placeholder={field.prompt} className="w-full resize-y rounded-xl border border-white/10 bg-slate-950/45 px-4 py-3 text-sm leading-6 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-teal-300/50" />
                  </label>
                ))}
              </div>
            </div>

            <aside className="bg-slate-950/35 p-5 md:p-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-300">Description status</p>
              <h3 className="mt-2 text-2xl font-bold">{decisionFrameReadiness.completeCount} of {decisionFrameReadiness.totalCount} decision inputs described</h3>
              <div role="progressbar" aria-label="Decision frame detail" aria-valuemin={0} aria-valuemax={100} aria-valuenow={decisionFrameReadiness.percent} className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-teal-300 transition-all" style={{ width: `${decisionFrameReadiness.percent}%` }} />
              </div>
              <p className="mt-2 text-xs text-slate-500">{decisionFrameReadiness.percent}% described</p>

              <div className="mt-6 space-y-3">
                {decisionFrameReadiness.criteria.map((criterion) => (
                  <div key={criterion.id} className="flex gap-3 text-xs leading-5">
                    {criterion.complete ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" /> : <CircleDashed className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" />}
                    <div><p className={criterion.complete ? "font-bold text-slate-200" : "font-semibold text-slate-400"}>{criterion.label}</p>{!criterion.complete && <p className="mt-1 text-slate-600">{criterion.action}</p>}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-xl border border-amber-300/20 bg-amber-300/[0.045] p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-300">Next discovery action</p>
                <p className="mt-2 text-xs leading-6 text-slate-400">{decisionFrameReadiness.nextAction}</p>
              </div>

              <button type="button" onClick={copyDecisionFrame} className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-teal-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-teal-200">
                {decisionFrameCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{decisionFrameCopied ? "Copied decision frame" : "Copy decision frame"}
              </button>
              <p className="mt-4 text-[10px] leading-5 text-slate-600">{decisionFrameReadiness.boundary}</p>
            </aside>
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
