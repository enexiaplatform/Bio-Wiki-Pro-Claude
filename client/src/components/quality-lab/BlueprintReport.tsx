import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Boxes,
  Building2,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Download,
  FileText,
  FlaskConical,
  Gauge,
  Info,
  Network,
  Printer,
  ShieldCheck,
  Users,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";
import type { QualityLabProject } from "@shared/quality-lab";
import { exportQualityLabEngagementPacket, exportQualityLabProject } from "@/lib/quality-lab-projects";
import { Link } from "wouter";
import { analytics } from "@/hooks/use-analytics";
import { evidenceForRuleIds, ruleGuidanceForIds } from "@/data/atlasEvidenceGraph";

interface Props {
  project: QualityLabProject;
  onEdit?: () => void;
}

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const number = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

const confidenceClass = {
  high: "border-emerald-300/20 bg-emerald-300/10 text-emerald-200",
  medium: "border-sky-300/20 bg-sky-300/10 text-sky-200",
  indicative: "border-amber-300/20 bg-amber-300/10 text-amber-200",
};

const severityClass = {
  high: "border-red-300/25 bg-red-300/10 text-red-100",
  medium: "border-amber-300/25 bg-amber-300/10 text-amber-100",
  low: "border-sky-300/20 bg-sky-300/10 text-sky-100",
};

function Section({ icon: Icon, eyebrow, title, children, id, collapsible = false, defaultOpen = true, collapsedSummary }: { icon: typeof Gauge; eyebrow: string; title: string; children: React.ReactNode; id?: string; collapsible?: boolean; defaultOpen?: boolean; collapsedSummary?: string }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section id={id} className="min-w-0 scroll-mt-32 break-inside-avoid rounded-2xl border border-white/10 bg-white/[0.035] p-5 shadow-lg shadow-black/10 md:p-6 print:border-slate-300 print:bg-white print:shadow-none">
      <div className={`${open || !collapsible ? "mb-5" : ""} flex items-start gap-3`}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-teal-300/20 bg-teal-300/10 text-teal-200 print:border-slate-300 print:bg-slate-100 print:text-slate-800"><Icon className="h-5 w-5" /></div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300 print:text-slate-500">{eyebrow}</p>
          <h2 className="mt-1 text-xl font-bold print:text-slate-950">{title}</h2>
          {collapsible && !open && collapsedSummary && <p className="mt-1 text-[11px] leading-5 text-slate-500 print:hidden">{collapsedSummary}</p>}
        </div>
        {collapsible && <button type="button" aria-label={`${open ? "Hide" : "Show"} ${title} detail`} aria-expanded={open} onClick={() => setOpen((current) => !current)} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[10px] font-bold text-slate-300 transition hover:border-white/20 print:hidden">{open ? "Hide detail" : "Show detail"}<ChevronDown className={`h-3.5 w-3.5 transition ${open ? "rotate-180" : ""}`} /></button>}
      </div>
      <div className={`${open || !collapsible ? "block" : "hidden"} print:block`}>{children}</div>
    </section>
  );
}

function DecisionEvidenceLinks({ ruleIds }: { ruleIds: string[] }) {
  const guidance = ruleGuidanceForIds(ruleIds, 3);
  return <div data-print="hide" className="mt-3 rounded-lg border border-sky-300/10 bg-sky-300/[0.035] p-3">
    <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-[9px] font-bold uppercase tracking-wider text-sky-300">Decision support</p><span className="text-[9px] text-slate-600">{guidance.fallbackUsed ? "Compiler Core fallback" : `${guidance.matchedRuleIds.length} rule${guidance.matchedRuleIds.length === 1 ? "" : "s"} mapped`}</span></div>
    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-2">{guidance.resources.map((resource)=><Link key={resource.href} href={resource.href} className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-200/80 hover:text-sky-100">{resource.title}<ArrowRight className="h-3 w-3" /></Link>)}</div>
    {guidance.unmatchedRuleIds.length > 0 && <p className="mt-2 break-words font-mono text-[9px] leading-4 text-amber-200/60">Unmapped: {guidance.unmatchedRuleIds.join(" · ")}</p>}
  </div>;
}

export function BlueprintReport({ project, onEdit }: Props) {
  const { blueprint } = project;
  const { input, current, future } = blueprint;
  const highRisks = blueprint.risks.filter((risk) => risk.severity === "high").length;
  const supportingEvidence = evidenceForRuleIds(blueprint.ruleTrace.map((rule) => rule.ruleId));

  return (
    <div className="quality-blueprint-report mx-auto max-w-7xl px-4 pb-24 pt-6 print:max-w-none print:px-0 print:pt-0">
      <div data-print="hide" className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <button onClick={onEdit} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Edit inputs
        </button>
        <div className="hidden flex-wrap gap-2 sm:flex">
          <button onClick={() => exportQualityLabProject(project)} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold transition hover:border-white/25 hover:bg-white/10">
            <Download className="h-4 w-4" /> Export model
          </button>
          <button onClick={() => { exportQualityLabEngagementPacket(project); analytics.engagementPacketDownloaded("blueprint_report", blueprint.unresolvedInputs.length); }} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold transition hover:border-white/25 hover:bg-white/10">
            <ClipboardCheck className="h-4 w-4" /> Engagement packet
          </button>
          <Link href={`/quality-lab/engagements/${project.id}`} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold transition hover:border-white/25 hover:bg-white/10">
            <ClipboardCheck className="h-4 w-4" /> Review workspace
          </Link>
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg bg-teal-300 px-3 py-2 text-xs font-bold text-slate-950 transition hover:bg-teal-200">
            <Printer className="h-4 w-4" /> Print / save PDF
          </button>
          <Link href={`/quality-lab/review?project=${project.id}`} onClick={() => analytics.blueprintCtaClicked("blueprint_report", "expert_review")} className="inline-flex items-center gap-2 rounded-lg border border-teal-300/25 bg-teal-300/10 px-3 py-2 text-xs font-bold text-teal-200 transition hover:bg-teal-300/15">
            {project.reviewRequestedAt ? "Review brief submitted" : "Request expert review"} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <Link href={`/quality-lab/review?project=${project.id}`} onClick={() => analytics.blueprintCtaClicked("blueprint_report", "expert_review")} className="inline-flex items-center gap-2 rounded-lg border border-teal-300/25 bg-teal-300/10 px-3 py-2 text-xs font-bold text-teal-200 sm:hidden">
          {project.reviewRequestedAt ? "Review submitted" : "Expert review"} <ArrowRight className="h-4 w-4" />
        </Link>
        <details className="w-full rounded-xl border border-white/10 bg-white/[0.03] sm:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-xs font-bold text-slate-300">Exports and review tools <ChevronDown className="h-4 w-4" /></summary>
          <div className="grid grid-cols-2 gap-2 border-t border-white/10 p-3">
            <button onClick={() => exportQualityLabProject(project)} className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold"><Download className="h-4 w-4" /> Export model</button>
            <button onClick={() => { exportQualityLabEngagementPacket(project); analytics.engagementPacketDownloaded("blueprint_report", blueprint.unresolvedInputs.length); }} className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold"><ClipboardCheck className="h-4 w-4" /> Engagement packet</button>
            <Link href={`/quality-lab/engagements/${project.id}`} className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold"><ClipboardCheck className="h-4 w-4" /> Review workspace</Link>
            <button onClick={() => window.print()} className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-300 px-3 py-2 text-xs font-bold text-slate-950"><Printer className="h-4 w-4" /> Print / PDF</button>
          </div>
        </details>
      </div>

      <header className="relative mb-5 overflow-hidden rounded-3xl border border-teal-300/20 bg-gradient-to-br from-teal-300/12 via-slate-900 to-sky-300/5 p-6 shadow-2xl shadow-black/20 md:p-8 print:border-slate-400 print:bg-white print:shadow-none">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] print:hidden" />
        <div className="grid gap-5">
          <div className="grid gap-6 md:grid-cols-[1fr_18rem] md:items-start">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200 print:border-slate-400 print:bg-white print:text-slate-700">
              <ShieldCheck className="h-3.5 w-3.5" /> {project.reviewRequestedAt ? "Review requested · triage pending" : "Concept blueprint · SME review required"}
            </span>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-teal-300 print:text-slate-600">Atlas Quality Lab Blueprint</p>
            <h1 className="mt-2 max-w-4xl text-3xl font-bold leading-tight md:text-5xl print:text-slate-950">{project.name}</h1>
            <p className="mt-3 text-sm text-slate-400 print:text-slate-600">
              {input.companyName || "Company not specified"} · {input.country} · {input.facilityType.replaceAll("-", " ")} · {blueprint.domainPack.version}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 print:border-slate-300 print:bg-white">
              <p className="text-xl font-bold text-teal-200 print:text-slate-950">{current.monthlyTests}</p><p className="text-[11px] text-slate-400 print:text-slate-600">monthly test units</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 print:border-slate-300 print:bg-white">
              <p className="text-xl font-bold text-teal-200 print:text-slate-950">{current.totalTeamFte}</p><p className="text-[11px] text-slate-400 print:text-slate-600">modeled team FTE</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 print:border-slate-300 print:bg-white">
              <p className="text-xl font-bold text-teal-200 print:text-slate-950">{current.estimatedAreaSqm} m²</p><p className="text-[11px] text-slate-400 print:text-slate-600">concept allowance</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 print:border-slate-300 print:bg-white">
              <p className="text-xl font-bold text-amber-200 print:text-slate-950">{highRisks}</p><p className="text-[11px] text-slate-400 print:text-slate-600">high-priority risks</p>
            </div>
          </div>
          </div>
          <div className="grid grid-cols-2 gap-2 border-t border-white/10 pt-5 sm:grid-cols-4 print:border-slate-300">
            <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3 print:border-slate-300 print:bg-white"><p className="text-lg font-bold text-teal-200 print:text-slate-950">{blueprint.dataQuality.completenessPercent}%</p><p className="text-[10px] text-slate-500">controlled-use readiness</p></div>
            <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3 print:border-slate-300 print:bg-white"><p className="text-lg font-bold text-red-200 print:text-slate-950">{blueprint.dataQuality.blockingOpenCount}</p><p className="text-[10px] text-slate-500">blocking inputs open</p></div>
            <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3 print:border-slate-300 print:bg-white"><p className="text-lg font-bold text-sky-200 print:text-slate-950">{blueprint.dataQuality.tracedRuleCount}</p><p className="text-[10px] text-slate-500">versioned rules traced</p></div>
            <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3 print:border-slate-300 print:bg-white"><p className="truncate text-xs font-bold text-amber-200 print:text-slate-950">{blueprint.contractVersion}</p><p className="mt-1 text-[10px] text-slate-500">output contract</p></div>
          </div>
        </div>
      </header>

      <section id="decision-brief" className="mb-5 scroll-mt-32 rounded-2xl border border-amber-300/20 bg-gradient-to-br from-amber-300/[0.07] via-white/[0.025] to-transparent p-5 md:p-6 print:border-slate-300 print:bg-white">
        <div className="grid gap-5 lg:grid-cols-[1fr_1.25fr_auto] lg:items-start">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200 print:text-slate-500">Decision brief</p>
            <h2 className="mt-2 text-xl font-bold print:text-slate-950">Model compiled. Controlled use is not yet ready.</h2>
            <p className="mt-2 text-xs leading-5 text-slate-400 print:text-slate-700">The model is useful for discovery and scenario discussion. Resolve the blocking inputs and complete qualified review before using it for investment, URS or procurement decisions.</p>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10 print:bg-slate-200"><div className="h-full rounded-full bg-teal-300" style={{ width: `${blueprint.dataQuality.completenessPercent}%` }} /></div>
            <p className="mt-2 text-[10px] text-slate-500">{blueprint.dataQuality.completenessPercent}% controlled-use readiness · {blueprint.dataQuality.blockingOpenCount} blocking inputs</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Resolve first</p>
            <div className="mt-3 space-y-2">
              {blueprint.unresolvedInputs.filter((item) => item.severity === "blocking").slice(0, 3).map((item) => <div key={item.id} className="flex gap-2 text-xs leading-5 text-slate-300 print:text-slate-800"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-300 print:text-slate-600" /><span>{item.question}</span></div>)}
            </div>
          </div>
          <Link href={`/quality-lab/review?project=${project.id}`} onClick={() => analytics.blueprintCtaClicked("decision_brief", "expert_review")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-300 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-teal-200 print:hidden">Prepare expert review <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>

      <nav data-print="hide" aria-label="Blueprint report sections" className="sticky top-16 z-30 mb-5 overflow-x-auto rounded-xl border border-white/10 bg-[#08111f]/95 p-2 shadow-xl shadow-black/20 backdrop-blur">
        <div className="flex min-w-max gap-1 text-xs font-semibold text-slate-400">
          {[["#decision-brief", "Decision brief"], ["#demand-model", "Demand & capacity"], ["#capability-plan", "Capability & cost"], ["#decision-risks", "Risks & actions"], ["#evidence-trace", "Evidence & trace"]].map(([href, label]) => <a key={href} href={href} className="rounded-lg px-3 py-2 transition hover:bg-white/5 hover:text-teal-200">{label}</a>)}
        </div>
      </nav>

      <div className="mb-5 grid gap-4 lg:grid-cols-2">
        {[current, future].map((scenario, index) => (
          <div key={scenario.label} className={`rounded-2xl border p-5 ${index === 1 ? "border-teal-300/25 bg-teal-300/[0.055]" : "border-white/10 bg-white/[0.035]"} print:border-slate-300 print:bg-white`}>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-300 print:text-slate-500">{scenario.label}</p>
                <h2 className="mt-1 text-xl font-bold print:text-slate-950">{scenario.multiplier}× demand</h2>
              </div>
              <BarChart3 className="h-6 w-6 text-teal-300 print:text-slate-700" />
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm sm:grid-cols-3">
              {[
                [number.format(scenario.monthlyTests), "Tests / month"],
                [number.format(scenario.monthlyHandsOnHours), "Hands-on h / month"],
                [`${scenario.analystFte} + ${scenario.totalTeamFte - scenario.analystFte}`, "Analysts + review"],
                [money.format(scenario.capexLowUsd), "CAPEX low"],
                [money.format(scenario.capexHighUsd), "CAPEX high"],
                [`${money.format(scenario.annualOpexLowUsd)}–${money.format(scenario.annualOpexHighUsd)}`, "Annual OPEX"],
              ].map(([value, label]) => (
                <div key={label}><p className="font-bold text-slate-100 print:text-slate-950">{value}</p><p className="mt-1 text-xs text-slate-500">{label}</p></div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-5">
        <Section id="demand-model" icon={FlaskConical} eyebrow="Demand model" title="Testing workload">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-white/10 text-[10px] uppercase tracking-wider text-slate-500 print:border-slate-300">
                <tr><th className="pb-3 pr-4">Workflow</th><th className="pb-3 pr-4">Units / month</th><th className="pb-3 pr-4">Hands-on h</th><th className="pb-3 pr-4">Plate-days</th><th className="pb-3 pr-4">Media L</th><th className="pb-3">Criticality</th></tr>
              </thead>
              <tbody>
                {blueprint.workflows.map((row) => (
                  <tr key={row.id} className="border-b border-white/5 print:border-slate-200">
                    <td className="py-3 pr-4"><p className="font-semibold print:text-slate-950">{row.label}</p><p className="mt-1 max-w-xl text-[11px] leading-5 text-slate-500">{row.basis}</p></td>
                    <td className="py-3 pr-4 font-semibold print:text-slate-950">{number.format(row.monthlyUnits)}</td>
                    <td className="py-3 pr-4 print:text-slate-800">{number.format(row.monthlyHandsOnHours)}</td>
                    <td className="py-3 pr-4 print:text-slate-800">{number.format(row.monthlyPlateDays)}</td>
                    <td className="py-3 pr-4 print:text-slate-800">{number.format(row.monthlyMediaLiters)}</td>
                    <td className="py-3"><span className="rounded-full border border-white/10 px-2 py-1 text-[10px] font-bold uppercase text-slate-300 print:border-slate-300 print:text-slate-700">{row.criticality}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {blueprint.workforceCapacity && (
          <Section icon={Users} eyebrow="Compiler Core · people capacity" title="Workforce capacity and skill coverage" collapsible defaultOpen={false} collapsedSummary={`${current.totalTeamFte} current FTE · ${future.totalTeamFte} at year ${input.horizonYears} · skill continuity still requires site evidence.`}>
            <p className="mb-4 max-w-4xl text-xs leading-5 text-slate-400 print:text-slate-700">This separates execution, review and skill-continuity constraints without claiming that aggregate FTE proves a workable roster. Site time studies, qualification records and shift coverage remain required.</p>
            <div className="grid gap-4 lg:grid-cols-2">
              {[blueprint.workforceCapacity.current, blueprint.workforceCapacity.future].map((workforce) => (
                <div key={workforce.label} className="rounded-xl border border-white/8 bg-slate-950/30 p-4 print:border-slate-300 print:bg-white">
                  <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-wider text-teal-300 print:text-slate-600">{workforce.label}</p><p className="mt-1 text-sm font-semibold print:text-slate-950">{workforce.productiveHoursPerFte} productive h/FTE-month</p></div><p className="text-lg font-bold text-teal-200 print:text-slate-950">{workforce.totalTeamFte} FTE</p></div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center"><div><p className="font-bold print:text-slate-950">{workforce.baseExecutionFte}</p><p className="text-[9px] text-slate-500">base execution</p></div><div><p className="font-bold print:text-slate-950">+{workforce.resilienceReserveFte}</p><p className="text-[9px] text-slate-500">reserve</p></div><div><p className="font-bold print:text-slate-950">+{workforce.reviewerFte}</p><p className="text-[9px] text-slate-500">review</p></div></div>
                  <div className="mt-4 space-y-2">{workforce.roles.map((role) => <div key={role.id} className="flex items-start justify-between gap-4 border-t border-white/5 pt-2 print:border-slate-200"><div><p className="text-xs font-semibold print:text-slate-950">{role.role}</p><p className="mt-1 text-[10px] leading-4 text-slate-500">{role.basis}</p></div><div className="shrink-0 text-right"><p className="text-xs font-bold text-sky-200 print:text-slate-950">{role.requiredFte} FTE</p><p className="text-[9px] text-slate-500">{role.monthlyHours ? `${role.monthlyHours} h` : "ratio basis"}</p></div></div>)}</div>
                </div>
              ))}
            </div>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Minimum skill-continuity floor</p><div className="mt-2 space-y-2">{blueprint.workforceCapacity.skillCoverage.map((skill) => <div key={skill.id} className="rounded-lg border border-white/8 p-3 print:border-slate-300"><div className="flex items-start justify-between gap-3"><p className="text-xs font-semibold print:text-slate-950">{skill.skill}</p><span className="shrink-0 text-[10px] font-bold text-amber-200 print:text-slate-700">{skill.minimumQualifiedPeople} qualified</span></div><p className="mt-1 text-[10px] leading-4 text-slate-500">{skill.rationale}</p></div>)}</div></div>
              <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Loads not separately quantified</p><div className="mt-2 space-y-2">{blueprint.workforceCapacity.excludedLoads.map((load) => <div key={load.id} className="rounded-lg border border-amber-300/10 bg-amber-300/[0.025] p-3 print:border-slate-300 print:bg-white"><p className="text-xs font-semibold text-amber-100 print:text-slate-950">{load.load}</p><p className="mt-1 text-[10px] leading-4 text-slate-400 print:text-slate-700">{load.impact}</p><p className="mt-1 text-[10px] leading-4 text-sky-200/70 print:text-slate-600">Evidence needed: {load.evidenceNeeded}</p></div>)}</div></div>
            </div>
            <DecisionEvidenceLinks ruleIds={["core.capacity.people"]} />
          </Section>
        )}

        <Section icon={ClipboardCheck} eyebrow="Demand reconciliation" title="Finished-product sizing basis">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-white/8 bg-slate-950/30 p-4 print:border-slate-300 print:bg-white"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Sizing source</p><p className="mt-2 text-sm font-bold capitalize print:text-slate-950">{blueprint.finishedProductDemand.source.replaceAll("-", " ")}</p></div>
            <div className="rounded-xl border border-white/8 bg-slate-950/30 p-4 print:border-slate-300 print:bg-white"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Aggregate batches</p><p className="mt-2 text-lg font-bold text-teal-200 print:text-slate-950">{number.format(blueprint.finishedProductDemand.aggregateMonthlyBatches)}<span className="ml-1 text-xs font-normal text-slate-500">/ month</span></p></div>
            <div className="rounded-xl border border-white/8 bg-slate-950/30 p-4 print:border-slate-300 print:bg-white"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Portfolio batches</p><p className="mt-2 text-lg font-bold text-teal-200 print:text-slate-950">{number.format(blueprint.finishedProductDemand.portfolioMonthlyBatches)}<span className="ml-1 text-xs font-normal text-slate-500">/ month</span></p></div>
            <div className="rounded-xl border border-white/8 bg-slate-950/30 p-4 print:border-slate-300 print:bg-white"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Portfolio in-house</p><p className="mt-2 text-lg font-bold text-teal-200 print:text-slate-950">{number.format(blueprint.finishedProductDemand.portfolioInHouseBatches)}<span className="ml-1 text-xs font-normal text-slate-500">/ month</span></p></div>
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-400 print:text-slate-700">{blueprint.finishedProductDemand.message}</p>
          {blueprint.finishedProductDemand.differencePercent !== null && <p className="mt-2 text-xs text-amber-200/80 print:text-slate-700">Portfolio versus aggregate difference: {number.format(blueprint.finishedProductDemand.differencePercent)}%. Reconcile material variance before design freeze.</p>}
        </Section>

        <Section icon={Network} eyebrow="Quality Method Graph" title="Product-to-method trace" collapsible defaultOpen={false}>
          {blueprint.methodRequirements.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="border-b border-white/10 text-[10px] uppercase tracking-wider text-slate-500 print:border-slate-300">
                  <tr><th className="pb-3 pr-4">Product / market</th><th className="pb-3 pr-4">Requirement</th><th className="pb-3 pr-4">Method architecture</th><th className="pb-3 pr-4">Requirement / allocated executions</th><th className="pb-3">Verification boundary</th></tr>
                </thead>
                <tbody>
                  {blueprint.methodRequirements.map((item) => (
                    <tr key={item.id} className="align-top border-b border-white/5 print:border-slate-200">
                      <td className="py-3 pr-4"><p className="font-semibold print:text-slate-950">{item.productName}</p><p className="mt-1 text-[11px] text-slate-500">{item.market} · {item.execution}</p></td>
                      <td className="py-3 pr-4 capitalize print:text-slate-800">{item.requirementType.replaceAll("-", " ")}</td>
                      <td className="py-3 pr-4"><p className="font-semibold print:text-slate-950">{item.methodName}</p><p className="mt-1 max-w-md text-[11px] leading-5 text-slate-500">{item.applicability}</p><p className="mt-1 max-w-md text-[11px] leading-5 text-slate-500">{item.acceptanceCriteria}</p></td>
                      <td className="py-3 pr-4"><p className="font-semibold print:text-slate-950">{number.format(item.monthlyExecutions)} / {number.format(item.allocatedMonthlyExecutions)}</p><p className={`mt-1 text-[10px] font-bold uppercase ${item.operationalDemandStatus === "unresolved" ? "text-amber-200" : "text-teal-200"}`}>{item.operationalDemandStatus === "unresolved" ? "allocation unresolved" : "physical load allocated"}</p></td>
                      <td className="max-w-md py-3 text-xs leading-5 text-amber-200/80 print:text-slate-700">{item.verificationRequirement}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="text-sm leading-6 text-slate-400">No product profiles are available for this domain. Add product-level method inputs before using a method BOM for planning.</p>}
        </Section>

        {blueprint.methodBom.length > 0 && (
          <Section icon={Boxes} eyebrow="Method bill of materials" title="Method-level consumables and controls" collapsible defaultOpen={false}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] text-left text-sm">
                <thead className="border-b border-white/10 text-[10px] uppercase tracking-wider text-slate-500 print:border-slate-300">
                  <tr><th className="pb-3 pr-4">Product / method</th><th className="pb-3 pr-4">Item</th><th className="pb-3 pr-4">Per execution</th><th className="pb-3 pr-4">Monthly</th><th className="pb-3">Control / condition</th></tr>
                </thead>
                <tbody>
                  {blueprint.methodBom.map((item) => (
                    <tr key={item.id} className="border-b border-white/5 print:border-slate-200">
                      <td className="py-3 pr-4"><p className="font-semibold print:text-slate-950">{item.productName}</p><p className="mt-1 text-[11px] text-slate-500">{item.methodName}</p></td>
                      <td className="py-3 pr-4 capitalize print:text-slate-800">{item.item}<p className="mt-1 text-[10px] text-amber-200/80 print:text-slate-600">{item.status.replaceAll("-", " ")}</p></td>
                      <td className="py-3 pr-4 print:text-slate-800">{number.format(item.quantityPerExecution)} {item.unit}</td>
                      <td className="py-3 pr-4 font-semibold print:text-slate-950">{number.format(item.quantityPerMonth)} {item.unit}</td>
                      <td className="max-w-md py-3 text-xs leading-5 text-slate-400 print:text-slate-700">{item.incubationOrControl}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        )}

        {blueprint.methodCapacitySummary.length > 0 && (
          <Section icon={BarChart3} eyebrow="Method-derived operating load" title="Resource capacity check" collapsible defaultOpen={false}>
            <p className="mb-4 max-w-4xl text-xs leading-5 text-slate-400">This checks the in-house product-method slice against the current equipment concept. It deliberately does not present itself as a complete operational simulation.</p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] text-left text-sm">
                <thead className="border-b border-white/10 text-[10px] uppercase tracking-wider text-slate-500 print:border-slate-300">
                  <tr><th className="pb-3 pr-4">Resource</th><th className="pb-3 pr-4">Method load / month</th><th className="pb-3 pr-4">Peak-week allowance</th><th className="pb-3 pr-4">Available capacity</th><th className="pb-3">Planning utilization</th></tr>
                </thead>
                <tbody>
                  {blueprint.methodCapacitySummary.map((item) => (
                    <tr key={item.resourceId} className="align-top border-b border-white/5 print:border-slate-200">
                      <td className="py-3 pr-4"><p className="font-semibold print:text-slate-950">{item.resourceName}</p><p className="mt-1 text-[11px] text-slate-500">{item.unit}</p></td>
                      <td className="py-3 pr-4 print:text-slate-800">{number.format(item.monthlyDemand)}</td>
                      <td className="py-3 pr-4 print:text-slate-800">{number.format(item.peakWeekDemand)}</td>
                      <td className="py-3 pr-4 print:text-slate-800">{number.format(item.availableMonthlyCapacity)}</td>
                      <td className="py-3"><p className={`font-bold ${item.utilizationPercent >= 85 ? "text-amber-200" : "text-teal-200"} print:text-slate-950`}>{number.format(item.utilizationPercent)}%</p><p className="mt-1 max-w-sm text-[10px] leading-4 text-slate-500">{item.limitations}</p></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        )}

        <Section id="capability-plan" icon={Boxes} eyebrow="Capability architecture" title="Vendor-neutral equipment plan" collapsible defaultOpen={false} collapsedSummary={`${blueprint.equipment.length} equipment classes · ${money.format(current.capexLowUsd)}–${money.format(current.capexHighUsd)} current CAPEX allowance.`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[940px] text-left text-sm">
              <thead className="border-b border-white/10 text-[10px] uppercase tracking-wider text-slate-500 print:border-slate-300">
                <tr><th className="pb-3 pr-4">Equipment</th><th className="pb-3 pr-4">Now</th><th className="pb-3 pr-4">Future</th><th className="pb-3 pr-4">Unit budget</th><th className="pb-3 pr-4">Confidence</th><th className="pb-3">Basis / specification</th></tr>
              </thead>
              <tbody>
                {blueprint.equipment.map((item) => (
                  <tr key={item.id} className="align-top border-b border-white/5 print:border-slate-200">
                    <td className="py-3 pr-4"><p className="font-semibold print:text-slate-950">{item.name}</p><p className="mt-1 text-[11px] text-slate-500">{item.category}</p></td>
                    <td className="py-3 pr-4 text-lg font-bold text-teal-200 print:text-slate-950">{item.quantityNow}</td>
                    <td className="py-3 pr-4 text-lg font-bold text-teal-200 print:text-slate-950">{item.quantityFuture}</td>
                    <td className="py-3 pr-4 whitespace-nowrap print:text-slate-800">{money.format(item.unitCapexLowUsd)}–{money.format(item.unitCapexHighUsd)}</td>
                    <td className="py-3 pr-4"><span className={`rounded-full border px-2 py-1 text-[10px] font-bold uppercase ${confidenceClass[item.confidence]} print:border-slate-300 print:bg-white print:text-slate-700`}>{item.confidence}</span></td>
                    <td className="max-w-xl py-3 text-xs leading-5 text-slate-400 print:text-slate-700"><p>{item.rationale}</p><p className="mt-1 text-slate-500 print:text-slate-600"><strong>URS seed:</strong> {item.specification}</p>{item.methodLoadBasis && item.methodLoadBasis.length > 0 && <p className="mt-2 text-sky-200/80 print:text-slate-600"><strong>Method / demand basis:</strong> {item.methodLoadBasis.join(" · ")}</p>}{item.methodRequirementIds && item.methodRequirementIds.length > 0 && <p className="mt-2 break-words font-mono text-[10px] text-sky-200/70 print:text-slate-600">Method links: {item.methodRequirementIds.join(" · ")}</p>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <div className="grid gap-5 lg:grid-cols-2">
          <Section icon={Building2} eyebrow="Space concept" title="Functional area allowance">
            <div className="space-y-3">
              {blueprint.spaces.map((space) => (
                <div key={space.name} className="flex items-start justify-between gap-4 border-b border-white/5 pb-3 print:border-slate-200">
                  <div><p className="text-sm font-semibold print:text-slate-950">{space.name}</p><p className="mt-1 text-xs leading-5 text-slate-500">{space.rationale}</p></div>
                  <p className="shrink-0 text-lg font-bold text-teal-200 print:text-slate-950">{space.areaSqm} m²</p>
                </div>
              ))}
            </div>
          </Section>

          <Section icon={Gauge} eyebrow="Run-rate" title="Monthly consumable forecast">
            <div className="space-y-3">
              {blueprint.consumables.map((item) => (
                <div key={item.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-white/5 pb-3 text-sm print:border-slate-200">
                  <div><p className="font-semibold print:text-slate-950">{item.name}</p><p className="text-xs text-slate-500">{item.unit}</p></div>
                  <div className="text-right"><p className="font-bold print:text-slate-950">{number.format(item.quantityPerMonthNow)}</p><p className="text-[10px] text-slate-500">now</p></div>
                  <div className="text-right"><p className="font-bold text-teal-200 print:text-slate-950">{number.format(item.quantityPerMonthFuture)}</p><p className="text-[10px] text-slate-500">future</p></div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {blueprint.consumableSupply && (
          <Section icon={Boxes} eyebrow="Compiler Core · supply resilience" title="Consumable inventory planning basis">
            <div className="mb-4 grid gap-2 sm:grid-cols-3">
              <div className="rounded-lg border border-white/8 bg-slate-950/30 p-3 print:border-slate-300 print:bg-white"><p className="text-lg font-bold text-teal-200 print:text-slate-950">{blueprint.consumableSupply.parameters.wastePercent}%</p><p className="text-[10px] text-slate-500">gross-use allowance</p></div>
              <div className="rounded-lg border border-white/8 bg-slate-950/30 p-3 print:border-slate-300 print:bg-white"><p className="text-lg font-bold text-teal-200 print:text-slate-950">{blueprint.consumableSupply.parameters.leadTimeDays} days</p><p className="text-[10px] text-slate-500">end-to-end lead time</p></div>
              <div className="rounded-lg border border-white/8 bg-slate-950/30 p-3 print:border-slate-300 print:bg-white"><p className="text-lg font-bold text-teal-200 print:text-slate-950">{blueprint.consumableSupply.parameters.safetyStockDays} days</p><p className="text-[10px] text-slate-500">protected demand</p></div>
            </div>
            <p className="mb-4 max-w-4xl text-xs leading-5 text-slate-400 print:text-slate-700">Reorder and target-stock values are concept planning quantities—not purchase instructions. Pack size, MOQ, shelf life, qualified storage, receipt release and supplier status remain unresolved.</p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="border-b border-white/10 text-[10px] uppercase tracking-wider text-slate-500 print:border-slate-300"><tr><th className="pb-3 pr-4">Item</th><th className="pb-3 pr-4">Net / gross month</th><th className="pb-3 pr-4">Reorder point</th><th className="pb-3 pr-4">Safety stock</th><th className="pb-3 pr-4">Target stock</th><th className="pb-3">Annual spend range</th></tr></thead>
                <tbody>{blueprint.consumableSupply.current.map((item) => <tr key={item.id} className="border-b border-white/5 print:border-slate-200"><td className="py-3 pr-4"><p className="font-semibold print:text-slate-950">{item.name}</p><p className="text-[10px] text-slate-500">{item.unit}</p></td><td className="py-3 pr-4 print:text-slate-800">{number.format(item.netMonthlyDemand)} / <strong>{number.format(item.grossMonthlyDemand)}</strong></td><td className="py-3 pr-4 print:text-slate-800">{number.format(item.reorderPoint)}</td><td className="py-3 pr-4 print:text-slate-800">{number.format(item.safetyStock)}</td><td className="py-3 pr-4 font-bold text-teal-200 print:text-slate-950">{number.format(item.targetStock)}</td><td className="py-3 print:text-slate-800">{money.format(item.annualSpendLowUsd)}–{money.format(item.annualSpendHighUsd)}</td></tr>)}</tbody>
              </table>
            </div>
            <div className="mt-4 rounded-lg border border-amber-300/10 bg-amber-300/[0.025] p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-amber-200">Required item-level evidence</p><p className="mt-2 text-xs leading-5 text-slate-400">{blueprint.consumableSupply.current[0]?.confirmationRequired.join(" · ")}</p></div>
            <DecisionEvidenceLinks ruleIds={["core.supply.consumables"]} />
          </Section>
        )}

        <Section id="decision-risks" icon={AlertTriangle} eyebrow="Decision risks" title="Review before investment approval">
          <div className="grid gap-3 md:grid-cols-2">
            {blueprint.risks.map((risk) => (
              <div key={risk.id} className={`rounded-xl border p-4 ${severityClass[risk.severity]} print:border-slate-300 print:bg-white print:text-slate-900`}>
                <div className="mb-2 flex items-center gap-2"><span className="text-[10px] font-bold uppercase tracking-wider">{risk.severity}</span><h3 className="text-sm font-bold print:text-slate-950">{risk.title}</h3></div>
                <p className="text-xs leading-5 opacity-80">{risk.description}</p>
                <p className="mt-2 text-xs leading-5"><strong>Mitigation:</strong> {risk.mitigation}</p>
              </div>
            ))}
          </div>
        </Section>

        <div className="grid gap-5 lg:grid-cols-2">
          <Section icon={ClipboardCheck} eyebrow="Action plan" title="Recommended next decisions" collapsible defaultOpen={false} collapsedSummary={`${blueprint.recommendations.length} prioritized decisions are ready for review.`}>
            <ol className="space-y-3">
              {blueprint.recommendations.map((recommendation, index) => (
                <li key={recommendation.id} className="flex gap-3 text-sm leading-6 text-slate-300 print:text-slate-800"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-teal-300/10 text-xs font-bold text-teal-200 print:bg-slate-100 print:text-slate-800">{index + 1}</span><div className="min-w-0 flex-1"><div className="mb-1 flex flex-wrap items-center gap-2"><span>{recommendation.recommendation}</span><span className="rounded-full border border-white/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500 print:border-slate-300">{recommendation.priority.replaceAll("-", " ")}</span></div><p className="text-xs leading-5 text-slate-500">{recommendation.rationale}</p><DecisionEvidenceLinks ruleIds={recommendation.relatedRuleIds} /></div></li>
              ))}
            </ol>
          </Section>
          <Section icon={FileText} eyebrow="Procurement" title="Phased implementation sequence">
            <div className="space-y-4">
              {blueprint.procurementSequence.map((phase) => (
                <div key={phase.phase} className="border-l-2 border-teal-300/30 pl-4 print:border-slate-300">
                  <div className="flex items-center justify-between gap-3"><h3 className="text-sm font-bold print:text-slate-950">{phase.phase}</h3><span className="text-[10px] uppercase tracking-wider text-slate-500">{phase.timing}</span></div>
                  <p className="mt-1 text-xs leading-5 text-slate-400 print:text-slate-700">{phase.items.join(" · ")}</p>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <Section icon={Info} eyebrow="Assumption ledger" title="What this model believes" collapsible defaultOpen={false}>
          <div className="grid gap-3 md:grid-cols-2">
            {blueprint.assumptions.map((assumption) => (
              <div key={assumption.id} className="rounded-xl border border-white/8 bg-slate-950/30 p-4 print:border-slate-300 print:bg-white">
                <div className="flex items-start justify-between gap-3"><p className="text-sm font-bold print:text-slate-950">{assumption.label}</p><span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${confidenceClass[assumption.confidence]} print:border-slate-300 print:bg-white print:text-slate-700`}>{assumption.confidence}</span></div>
                <p className="mt-2 text-sm text-slate-300 print:text-slate-800">{assumption.value}</p>
                <p className="mt-1 text-[11px] leading-5 text-slate-500">Source: {assumption.source}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section icon={AlertTriangle} eyebrow="Open information" title="What must be resolved before controlled use" collapsible defaultOpen={false} collapsedSummary={`${blueprint.dataQuality.blockingOpenCount} blocking and ${blueprint.dataQuality.importantOpenCount} important inputs remain open.`}>
          <div className="mb-4 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider">
            <span className="rounded-full border border-red-300/20 bg-red-300/10 px-2.5 py-1 text-red-200 print:border-slate-300 print:bg-white print:text-slate-700">{blueprint.dataQuality.blockingOpenCount} blocking</span>
            <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2.5 py-1 text-amber-200 print:border-slate-300 print:bg-white print:text-slate-700">{blueprint.dataQuality.importantOpenCount} important</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {blueprint.unresolvedInputs.map((item) => (
              <div key={item.id} className={`rounded-xl border p-4 ${item.severity === "blocking" ? "border-red-300/20 bg-red-300/[0.06]" : item.severity === "important" ? "border-amber-300/20 bg-amber-300/[0.05]" : "border-white/10 bg-white/[0.025]"} print:border-slate-300 print:bg-white`}>
                <div className="flex flex-wrap items-center gap-2"><span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">{item.category}</span><span className="rounded-full border border-white/10 px-2 py-0.5 text-[9px] font-bold uppercase text-slate-400 print:border-slate-300">{item.severity}</span></div>
                <h3 className="mt-2 text-sm font-bold print:text-slate-950">{item.question}</h3>
                <p className="mt-2 text-xs leading-5 text-slate-400 print:text-slate-700">{item.impact}</p>
                <p className="mt-2 text-xs leading-5 text-slate-300 print:text-slate-800"><strong>Resolve:</strong> {item.resolution}</p>
                <DecisionEvidenceLinks ruleIds={item.relatedRuleIds} />
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.025] p-4 text-xs leading-6 text-slate-400 print:border-slate-300 print:bg-white print:text-slate-700">
            <p><strong className="text-slate-200 print:text-slate-950">Review status:</strong> {blueprint.review.status.replaceAll("-", " ")} · Required roles: {blueprint.review.requiredRoles.join(" · ")}</p>
            <p className="mt-1">{blueprint.review.reviewNote}</p>
          </div>
        </Section>

        <div id="evidence-trace" className="scroll-mt-32 grid gap-5 lg:grid-cols-2">
          <Section icon={FileText} eyebrow="Evidence register" title="Sources and missing site evidence" collapsible defaultOpen={false}>
            <div data-print="hide" className="mb-5 rounded-xl border border-sky-300/15 bg-sky-300/[0.04] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-sky-200">Supporting Atlas Evidence</p>
                  <p className="mt-1 max-w-xl text-[11px] leading-5 text-slate-400">Use these resources to challenge the model logic. They are not controlled project evidence and do not resolve open inputs.</p>
                </div>
                <Link href="/quality-lab/evidence" className="inline-flex items-center gap-1.5 text-[11px] font-bold text-teal-300 hover:text-teal-200">Open Evidence Graph <ArrowRight className="h-3.5 w-3.5" /></Link>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {supportingEvidence.map((item) => <Link key={item.href} href={item.href} className="rounded-lg border border-white/8 bg-white/[0.03] p-3 transition hover:border-sky-300/25">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-sky-300">{item.kind}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-200">{item.title}</p>
                </Link>)}
              </div>
            </div>
            <div className="space-y-3">
              {blueprint.evidence.map((record) => (
                <div key={record.id} className="rounded-xl border border-white/8 bg-slate-950/30 p-4 print:border-slate-300 print:bg-white">
                  <div className="flex items-start justify-between gap-3"><h3 className="text-sm font-bold print:text-slate-950">{record.title}</h3><span className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 text-[9px] font-bold uppercase text-slate-500 print:border-slate-300">{record.status.replaceAll("-", " ")}</span></div>
                  <p className="mt-1 text-[11px] text-slate-500">{record.publisher} · {record.version}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-400 print:text-slate-700">{record.scope}</p>
                  <p className="mt-2 break-all text-[11px] leading-5 text-sky-200/70 print:text-slate-600">Locator: {record.locator.startsWith("https://") ? <a href={record.locator} target="_blank" rel="noreferrer" className="underline underline-offset-2">{record.locator}</a> : record.locator}</p>
                  <p className="mt-2 text-[11px] leading-5 text-amber-200/70 print:text-slate-600">Limit: {record.limitations}</p>
                </div>
              ))}
            </div>
          </Section>
          <Section icon={Network} eyebrow="Rule registry" title="Versioned calculation trace" collapsible defaultOpen={false}>
            <div className="space-y-3">
              {blueprint.ruleTrace.map((rule) => (
                <div key={rule.ruleId} className="rounded-xl border border-white/8 bg-slate-950/30 p-4 print:border-slate-300 print:bg-white">
                  <div className="flex items-start justify-between gap-3"><div><h3 className="text-sm font-bold print:text-slate-950">{rule.name}</h3><p className="mt-1 font-mono text-[10px] text-slate-500">{rule.ruleId} · {rule.ruleVersion}</p></div><span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${confidenceClass[rule.confidence]} print:border-slate-300 print:bg-white print:text-slate-700`}>{rule.confidence}</span></div>
                  <p className="mt-2 text-xs leading-5 text-slate-400 print:text-slate-700">Applies when: {rule.applicability}</p>
                  <p className="mt-2 break-words font-mono text-[10px] leading-5 text-sky-200/70 print:text-slate-600">Evidence: {rule.evidenceIds.join(" · ")}</p>
                  <p className="mt-2 text-[11px] leading-5 text-amber-200/70 print:text-slate-600">Limit: {rule.limitations}</p>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>

      <footer className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-300/5 p-5 text-xs leading-6 text-slate-400 print:border-slate-300 print:bg-white print:text-slate-700">
        <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-300 print:text-slate-700" /><p><strong className="text-slate-200 print:text-slate-950">Concept-use notice.</strong> This blueprint is a planning aid, not a validated design, regulatory opinion, supplier quote, approved specification or substitute for qualified QC, QA and engineering review. Reconcile all outputs against current registered specifications, pharmacopeial requirements, site procedures, methods, utilities, local regulations and vendor data before use.</p></div>
      </footer>
    </div>
  );
}
