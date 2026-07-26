import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { AlertTriangle, ArrowLeft, ArrowRight, Calculator, Clock3, Download, FileQuestion, FlaskConical, GitBranch, Info, Network, Scale, ShieldCheck } from "lucide-react";
import {
  analyzeQualityLabOperatingModel,
  type QualityLabOperatingModelApplication,
  type QualityLabOperatingModelApplicationInput,
  type QualityLabOperatingModelInput,
} from "@shared/quality-lab-operating-model";
import type { QualityLabProject } from "@shared/quality-lab";
import { DecisionTraceLink } from "@/components/quality-lab/DecisionLineagePanel";
import { analytics } from "@/hooks/use-analytics";
import { useSEO } from "@/hooks/use-seo";
import { loadQualityLabOperatingModelInput, saveQualityLabOperatingModelInput } from "@/lib/quality-lab-operating-model";
import { listQualityLabProjects } from "@/lib/quality-lab-projects";

const number = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function queryProjectId() {
  return typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("project") ?? "";
}

function modeStyle(mode: QualityLabOperatingModelApplication["recommendedMode"]) {
  if (mode === "insource") return { label: "Insource", className: "border-teal-300/25 bg-teal-300/[0.08] text-teal-100" };
  if (mode === "outsource") return { label: "Outsource", className: "border-sky-300/25 bg-sky-300/[0.08] text-sky-100" };
  if (mode === "hybrid") return { label: "Hybrid", className: "border-violet-300/25 bg-violet-300/[0.08] text-violet-100" };
  return { label: "Evidence required", className: "border-amber-300/25 bg-amber-300/[0.08] text-amber-100" };
}

function numericValue(value: number | null) {
  return value === null ? "" : String(value);
}

export default function QualityLabOperatingModelPage() {
  useSEO({ title: "Insource / Outsource Decision", description: "Compare insource, outsource and hybrid routes for each Quality Lab application using bounded economics, operational feasibility, quality control and Decision Lineage." });
  const [projects] = useState<QualityLabProject[]>(() => listQualityLabProjects());
  const [projectId, setProjectId] = useState(() => queryProjectId() || projects[0]?.id || "");
  const project = projects.find((item) => item.id === projectId);
  const [input, setInput] = useState<QualityLabOperatingModelInput | null>(() => project ? loadQualityLabOperatingModelInput(project) : null);
  const analysis = useMemo(() => project && input ? analyzeQualityLabOperatingModel(project, input) : null, [project, input]);
  const [applicationId, setApplicationId] = useState("");
  const selected = analysis?.applications.find((item) => item.id === applicationId) ?? analysis?.applications[0];
  const selectedInput = input?.applications.find((item) => item.applicationId === selected?.id);

  useEffect(() => {
    if (!project) return;
    setInput(loadQualityLabOperatingModelInput(project));
    setApplicationId("");
    const url = new URL(window.location.href);
    url.searchParams.set("project", project.id);
    window.history.replaceState({}, "", url);
  }, [project?.id]);

  useEffect(() => {
    if (!analysis) return;
    analytics.operatingModelAnalyzed(analysis.project.id, analysis.applications.length, analysis.summary.evidenceRequired);
  }, [analysis?.project.id]);

  function persist(mutator: (current: QualityLabOperatingModelInput) => QualityLabOperatingModelInput, field: string) {
    setInput((current) => current ? saveQualityLabOperatingModelInput(mutator(current)) : current);
    analytics.operatingModelInputUpdated(field);
  }

  function updateApplication<K extends keyof QualityLabOperatingModelApplicationInput>(field: K, value: QualityLabOperatingModelApplicationInput[K]) {
    if (!selected) return;
    persist((current) => ({
      ...current,
      applications: current.applications.map((item) => item.applicationId === selected.id ? { ...item, [field]: value } : item),
    }), String(field));
  }

  function exportAnalysis() {
    if (!analysis) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(analysis, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "atlas-application-operating-model.json";
    anchor.click();
    URL.revokeObjectURL(url);
    analytics.operatingModelExported(analysis.applications.length, analysis.summary.evidenceRequired);
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#07111f] px-4 pb-24 pt-6 text-slate-100 md:pt-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link href="/quality-lab/projects" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white"><ArrowLeft className="h-4 w-4" /> Quality lab projects</Link>
          {analysis && <div className="flex flex-wrap gap-2"><Link href={`/quality-lab/engagements/${analysis.project.id}/operating-model-review`} className="inline-flex items-center gap-2 rounded-xl border border-teal-300/20 bg-teal-300/[0.06] px-4 py-2.5 text-sm font-bold text-teal-200"><ShieldCheck className="h-4 w-4" /> Controlled stakeholder review</Link><Link href={`/quality-lab/sensitivity?project=${analysis.project.id}`} className="inline-flex items-center gap-2 rounded-xl border border-violet-300/20 bg-violet-300/[0.06] px-4 py-2.5 text-sm font-bold text-violet-200">Stress the assumptions <ArrowRight className="h-4 w-4" /></Link><button onClick={exportAnalysis} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-slate-200"><Download className="h-4 w-4" /> Export analysis</button></div>}
        </div>

        <header className="rounded-3xl border border-sky-300/20 bg-gradient-to-br from-sky-300/10 via-white/[0.035] to-teal-300/[0.04] p-6 md:p-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-300/10 text-sky-200"><Scale className="h-5 w-5" /></div>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-sky-300">Atlas Decision Intelligence</p>
          <h1 className="mt-2 text-3xl font-bold md:text-5xl">Insource / Outsource Decision</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">Decide at application level—not with one site-wide percentage. Atlas combines transparent break-even ranges with turnaround, sample stability, qualification, data access, investigation response, surge capacity and strategic control.</p>
        </header>

        {projects.length === 0 ? (
          <section className="mt-6 rounded-3xl border border-dashed border-white/15 bg-white/[0.025] px-6 py-16 text-center"><FlaskConical className="mx-auto h-8 w-8 text-slate-500" /><h2 className="mt-5 text-xl font-bold">A compiled Blueprint is required</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">Build a project first so each application inherits demand, workflow, method, cost and evidence lineage.</p><Link href="/quality-lab/planner" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-300 px-5 py-3 text-sm font-bold text-slate-950">Build a blueprint <ArrowRight className="h-4 w-4" /></Link></section>
        ) : analysis && input && selected && selectedInput && project ? (
          <div className="mt-6 space-y-6">
            <section className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-5 md:grid-cols-[1fr_220px]">
              <label className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Blueprint project<select value={projectId} onChange={(event) => setProjectId(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-slate-950 px-4 text-sm font-semibold normal-case tracking-normal text-white">{projects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
              <label className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Asset life assumption<input aria-label="Asset life assumption" type="number" min="1" max="30" value={input.assetLifeYears} onChange={(event) => persist((current) => ({ ...current, assetLifeYears: Math.max(1, Math.min(30, Number(event.target.value) || 1)) }), "assetLifeYears")} className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-slate-950 px-4 text-sm font-semibold normal-case tracking-normal text-white" /></label>
            </section>

            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryCard label="Insource" value={analysis.summary.insource} note="bounded conclusion" tone="teal" />
              <SummaryCard label="Outsource" value={analysis.summary.outsource} note="bounded conclusion" tone="sky" />
              <SummaryCard label="Hybrid" value={analysis.summary.hybrid} note="split or transition route" tone="violet" />
              <SummaryCard label="Evidence required" value={analysis.summary.evidenceRequired} note="no recommendation yet" tone="amber" />
            </section>

            <section className="grid min-w-0 gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
              <div className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <SectionTitle icon={Network} title="Applications" description="Each method-product or workflow application is decided separately." />
                <div className="mt-4 max-h-[720px] space-y-2 overflow-y-auto pr-1">{analysis.applications.map((application) => {
                  const style = modeStyle(application.recommendedMode);
                  return <button key={application.id} onClick={() => { setApplicationId(application.id); analytics.operatingModelApplicationOpened(project.id, application.id, application.recommendedMode); }} className={`w-full rounded-xl border p-3 text-left ${application.id === selected.id ? "border-sky-300/35 bg-sky-300/[0.07]" : "border-white/8 bg-slate-950/25 hover:border-white/15"}`}><p className="break-words text-sm font-semibold text-slate-200">{application.label}</p><div className="mt-2 flex flex-wrap items-center justify-between gap-2"><span className="text-[10px] text-slate-500">{number.format(application.monthlyDemand)} tests/month</span><span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${style.className}`}>{style.label}</span></div></button>;
                })}</div>
              </div>

              <div className="min-w-0 space-y-5">
                <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 md:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Selected application</p><h2 className="mt-2 break-words text-2xl font-bold text-white">{selected.label}</h2><p className="mt-2 text-xs leading-5 text-slate-500">{selected.scope}</p></div><ModeBadge application={selected} /></div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3"><MiniFact label="Physical demand" value={`${number.format(selected.monthlyDemand)} / month`} /><MiniFact label="Blueprint TAT target" value={`${number.format(selected.targetTurnaroundDays)} days`} /><MiniFact label="Current execution" value={selected.currentExecution.replace("-", " ")} /></div>
                </section>

                <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 md:p-6">
                  <SectionTitle icon={FileQuestion} title="Controlled assumptions" description="Record comparable, application-specific evidence. Changes save in this browser and recalculate immediately." />
                  <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <NumberField label="External price per reportable test (USD)" value={selectedInput.externalPricePerTestUsd} onChange={(value) => updateApplication("externalPricePerTestUsd", value)} />
                    <NumberField label="External end-to-end turnaround (days)" value={selectedInput.externalTurnaroundDays} onChange={(value) => updateApplication("externalTurnaroundDays", value)} />
                    <NumberField label="Sample hold-time limit (days)" value={selectedInput.sampleHoldTimeDays} onChange={(value) => updateApplication("sampleHoldTimeDays", value)} />
                    <NumberField label="Method transfer / validation cost (USD)" value={selectedInput.methodTransferCostUsd} onChange={(value) => updateApplication("methodTransferCostUsd", value)} allowZero />
                    <SelectField label="Internal capability" value={selectedInput.internalCapability} onChange={(value) => updateApplication("internalCapability", value as QualityLabOperatingModelApplicationInput["internalCapability"])} options={[["unknown", "Unknown"], ["concept-modeled", "Concept modeled"], ["confirmed", "Confirmed"], ["not-available", "Not available"]]} />
                    <SelectField label="Method readiness" value={selectedInput.methodReadiness} onChange={(value) => updateApplication("methodReadiness", value as QualityLabOperatingModelApplicationInput["methodReadiness"])} options={[["unknown", "Unknown"], ["ready", "Ready"], ["not-required", "Not required"], ["transfer-required", "Transfer required"], ["validation-required", "Validation required"]]} />
                    <SelectField label="External laboratory qualified" value={selectedInput.externalLabQualified} onChange={(value) => updateApplication("externalLabQualified", value as QualityLabOperatingModelApplicationInput["externalLabQualified"])} options={yesNoOptions} />
                    <SelectField label="Qualified backup external coverage" value={selectedInput.backupExternalCoverage} onChange={(value) => updateApplication("backupExternalCoverage", value as QualityLabOperatingModelApplicationInput["backupExternalCoverage"])} options={yesNoOptions} />
                    <SelectField label="External data access" value={selectedInput.dataAccess} onChange={(value) => updateApplication("dataAccess", value as QualityLabOperatingModelApplicationInput["dataAccess"])} options={[["unknown", "Unknown"], ["full", "Full raw data and audit trail"], ["limited", "Limited"]]} />
                    <SelectField label="Investigation responsiveness" value={selectedInput.investigationResponsiveness} onChange={(value) => updateApplication("investigationResponsiveness", value as QualityLabOperatingModelApplicationInput["investigationResponsiveness"])} options={[["unknown", "Unknown"], ["internal-faster", "Internal faster"], ["comparable", "Comparable"], ["external-faster", "External faster"]]} />
                    <SelectField label="Qualified surge capacity" value={selectedInput.surgeCapacity} onChange={(value) => updateApplication("surgeCapacity", value as QualityLabOperatingModelApplicationInput["surgeCapacity"])} options={[["unknown", "Unknown"], ["internal", "Internal"], ["external", "External"], ["both", "Both"], ["neither", "Neither"]]} />
                    <SelectField label="Continuity priority" value={selectedInput.continuityPriority} onChange={(value) => updateApplication("continuityPriority", value as QualityLabOperatingModelApplicationInput["continuityPriority"])} options={priorityOptions} />
                    <SelectField label="Strategic control" value={selectedInput.strategicControl} onChange={(value) => updateApplication("strategicControl", value as QualityLabOperatingModelApplicationInput["strategicControl"])} options={priorityOptions} />
                    <SelectField label="Confidentiality" value={selectedInput.confidentiality} onChange={(value) => updateApplication("confidentiality", value as QualityLabOperatingModelApplicationInput["confidentiality"])} options={[["standard", "Standard"], ["sensitive", "Sensitive"], ["highly-sensitive", "Highly sensitive"]]} />
                    <label className="text-xs font-semibold text-slate-400 md:col-span-2 xl:col-span-3">Application note<textarea value={selectedInput.note} maxLength={1000} onChange={(event) => updateApplication("note", event.target.value)} className="mt-2 min-h-20 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-sky-300/40" /></label>
                  </div>
                </section>

                {selected.missingEvidence.length > 0 && <section data-testid="operating-model-evidence" className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.045] p-5"><SectionTitle icon={AlertTriangle} title={`${selected.missingEvidence.length} blocking evidence item${selected.missingEvidence.length === 1 ? "" : "s"}`} description="Atlas will not recommend a route while any material item below remains unresolved." /><div className="mt-4 space-y-3">{selected.missingEvidence.map((item) => <article key={item.id} className="rounded-xl border border-amber-200/15 bg-black/10 p-4"><h3 className="text-sm font-bold text-amber-100">{item.question}</h3><p className="mt-2 text-xs leading-5 text-amber-100/70">{item.whyItMatters}</p><p className="mt-2 text-[11px] leading-5 text-slate-400"><strong className="text-slate-300">Evidence needed:</strong> {item.evidenceNeeded}</p></article>)}</div></section>}

                <section className="grid gap-5 lg:grid-cols-2">
                  <DecisionBasis application={selected} />
                  <Economics application={selected} />
                </section>

                <section className="grid gap-5 lg:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><SectionTitle icon={Clock3} title="Sensitivity triggers" description="These changes can move the current conclusion." /><div className="mt-4 space-y-3">{selected.sensitivityDrivers.map((driver) => <article key={driver.id} className="rounded-xl border border-white/8 bg-slate-950/25 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-bold text-slate-200">{driver.label}</h3><span className="text-[10px] font-semibold text-sky-200">{driver.currentValue}</span></div><p className="mt-2 text-xs leading-5 text-slate-400">{driver.decisionChange}</p><p className="mt-2 text-[10px] leading-5 text-slate-600">Confirm with: {driver.evidenceNeeded}</p></article>)}</div></div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><SectionTitle icon={GitBranch} title="Decision Lineage" description="Inspect inputs, rules, evidence references and the conditions that would change this output." /><div className="mt-4"><DecisionTraceLink projectId={project.id} lineage={selected.lineage} label="Open operating-model lineage" /></div><details className="mt-4 rounded-xl border border-white/8 bg-slate-950/25 p-4"><summary className="cursor-pointer text-xs font-bold text-slate-300">Technical trace</summary><div className="mt-3 space-y-3 text-[11px] leading-5 text-slate-500"><p><strong className="text-slate-300">Output:</strong> {selected.lineage.outputKey}</p><p><strong className="text-slate-300">Rules:</strong> {selected.lineage.ruleRefs.map((item) => `${item.id}@${item.version}`).join(" · ")}</p><p><strong className="text-slate-300">Evidence:</strong> {selected.lineage.evidenceRefs.map((item) => `${item.id}@${item.version}`).join(" · ")}</p><p><strong className="text-slate-300">Material change factors:</strong> {selected.lineage.materialChangeFactors.join(" · ")}</p></div></details>{selected.relatedBlueprintLineageIds.length > 0 && <div className="mt-4"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">Related Blueprint decisions</p><div className="mt-2 flex flex-wrap gap-2">{selected.relatedBlueprintLineageIds.slice(0, 6).map((id) => { const lineage = project.blueprint.decisionLineage.find((item) => item.id === id); return lineage ? <DecisionTraceLink key={id} projectId={project.id} lineage={lineage} label={lineage.outputKey} /> : null; })}</div></div>}</div>
                </section>
              </div>
            </section>

            <div className="rounded-2xl border border-sky-300/15 bg-sky-300/[0.05] p-5 text-xs leading-6 text-sky-100"><Info className="mr-2 inline h-4 w-4 text-sky-300" />{analysis.boundary}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

const yesNoOptions: Array<[string, string]> = [["unknown", "Unknown"], ["yes", "Yes"], ["no", "No"]];
const priorityOptions: Array<[string, string]> = [["standard", "Standard"], ["high", "High"], ["critical", "Critical"]];

function NumberField({ label, value, onChange, allowZero = false }: { label: string; value: number | null; onChange: (value: number | null) => void; allowZero?: boolean }) {
  return <label className="text-xs font-semibold text-slate-400">{label}<input aria-label={label} type="number" min={allowZero ? 0 : 0.01} step="any" value={numericValue(value)} onChange={(event) => { const next = event.target.value === "" ? null : Number(event.target.value); onChange(next === null || Number.isFinite(next) && (allowZero ? next >= 0 : next > 0) ? next : null); }} className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none focus:border-sky-300/40" /></label>;
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: Array<[string, string]>; onChange: (value: string) => void }) {
  return <label className="text-xs font-semibold text-slate-400">{label}<select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none focus:border-sky-300/40">{options.map(([option, text]) => <option key={option} value={option}>{text}</option>)}</select></label>;
}

function ModeBadge({ application }: { application: QualityLabOperatingModelApplication }) {
  const style = modeStyle(application.recommendedMode);
  return <div data-testid="operating-model-mode" className={`rounded-xl border px-4 py-3 text-center ${style.className}`}><p className="text-[9px] font-bold uppercase tracking-[0.16em] opacity-70">Current bounded conclusion</p><strong className="mt-1 block text-sm uppercase tracking-wide">{style.label}</strong></div>;
}

function SummaryCard({ label, value, note, tone }: { label: string; value: number; note: string; tone: "teal" | "sky" | "violet" | "amber" }) {
  const tones = { teal: "text-teal-200", sky: "text-sky-200", violet: "text-violet-200", amber: "text-amber-200" };
  return <article className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"><p className="text-xs font-semibold text-slate-500">{label}</p><strong className={`mt-3 block text-2xl ${tones[tone]}`}>{value}</strong><p className="mt-1 text-[10px] text-slate-600">{note}</p></article>;
}

function MiniFact({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-white/8 bg-slate-950/25 p-3"><p className="text-[10px] font-semibold text-slate-600">{label}</p><p className="mt-1 text-sm font-bold capitalize text-slate-200">{value}</p></div>;
}

function SectionTitle({ icon: Icon, title, description }: { icon: typeof Calculator; title: string; description: string }) {
  return <div className="flex items-start gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-300/10 text-sky-300"><Icon className="h-4 w-4" /></div><div><h2 className="text-lg font-bold text-white">{title}</h2><p className="mt-1 text-xs leading-5 text-slate-500">{description}</p></div></div>;
}

function DecisionBasis({ application }: { application: QualityLabOperatingModelApplication }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><SectionTitle icon={ShieldCheck} title="Decision basis" description="Economic, operational and quality-control reasoning stay visible together." /><div className="mt-4 space-y-4 text-xs leading-6 text-slate-400"><p><strong className="text-slate-200">Economic:</strong> {application.economicBasis}</p><p><strong className="text-slate-200">Operational:</strong> {application.operationalBasis}</p><p><strong className="text-slate-200">Quality & control:</strong> {application.qualityControlBasis}</p></div><div className="mt-4 border-t border-white/8 pt-4"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">Decision drivers</p><ul className="mt-2 space-y-2">{application.decisionDrivers.map((item) => <li key={item} className="text-xs leading-5 text-slate-400">• {item}</li>)}</ul>{application.majorRisks.length > 0 && <><p className="mt-4 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-300">Major risks</p><ul className="mt-2 space-y-2">{application.majorRisks.map((item) => <li key={item} className="text-xs leading-5 text-amber-100/70">• {item}</li>)}</ul></>}</div></div>;
}

function Economics({ application }: { application: QualityLabOperatingModelApplication }) {
  const item = application.economics;
  const range = item.breakEvenMonthlyLow === null ? "Not available" : `${number.format(item.breakEvenMonthlyLow)}–${number.format(item.breakEvenMonthlyHigh ?? item.breakEvenMonthlyLow)} tests/month`;
  return <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><SectionTitle icon={Calculator} title="Break-even range" description="A transparent planning range—not a savings promise or supplier quote." /><div className="mt-4 rounded-xl border border-sky-300/15 bg-sky-300/[0.045] p-4"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-sky-300">Steady-state threshold</p><strong className="mt-2 block text-xl text-white">{range}</strong><p className="mt-1 text-[11px] capitalize text-slate-500">{item.economicPosition.replaceAll("-", " ")}</p></div><dl className="mt-4 grid gap-3 sm:grid-cols-2"><Cost label="Annual internal low" value={money.format(item.annualInternalCostLowUsd)} /><Cost label="Annual internal high" value={money.format(item.annualInternalCostHighUsd)} /><Cost label="Annual external" value={item.annualExternalCostUsd === null ? "Open" : money.format(item.annualExternalCostUsd)} /><Cost label="First-year external" value={item.firstYearExternalCostUsd === null ? "Open" : money.format(item.firstYearExternalCostUsd)} /></dl><details className="mt-4 rounded-xl border border-white/8 bg-slate-950/25 p-4"><summary className="cursor-pointer text-xs font-bold text-slate-300">Calculation basis and limits</summary><p className="mt-3 text-[11px] leading-5 text-slate-500">{item.basis}</p><ul className="mt-2 space-y-1">{item.limitations.map((limit) => <li key={limit} className="text-[10px] leading-5 text-slate-600">• {limit}</li>)}</ul></details></div>;
}

function Cost({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-white/8 bg-slate-950/25 p-3"><dt className="text-[10px] text-slate-600">{label}</dt><dd className="mt-1 text-sm font-bold text-slate-200">{value}</dd></div>;
}
