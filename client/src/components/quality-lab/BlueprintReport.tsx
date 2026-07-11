import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Boxes,
  Building2,
  CheckCircle2,
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
import type { QualityLabProject } from "@shared/quality-lab";
import { exportQualityLabProject } from "@/lib/quality-lab-projects";
import { Link } from "wouter";
import { analytics } from "@/hooks/use-analytics";

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

function Section({ icon: Icon, eyebrow, title, children }: { icon: typeof Gauge; eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section className="min-w-0 break-inside-avoid rounded-2xl border border-white/10 bg-white/[0.035] p-5 shadow-lg shadow-black/10 md:p-6 print:border-slate-300 print:bg-white print:shadow-none">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-teal-300/20 bg-teal-300/10 text-teal-200 print:border-slate-300 print:bg-slate-100 print:text-slate-800"><Icon className="h-5 w-5" /></div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300 print:text-slate-500">{eyebrow}</p>
          <h2 className="mt-1 text-xl font-bold print:text-slate-950">{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}

export function BlueprintReport({ project, onEdit }: Props) {
  const { blueprint } = project;
  const { input, current, future } = blueprint;
  const highRisks = blueprint.risks.filter((risk) => risk.severity === "high").length;

  return (
    <div className="quality-blueprint-report mx-auto max-w-7xl px-4 pb-24 pt-6 print:max-w-none print:px-0 print:pt-0">
      <div data-print="hide" className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <button onClick={onEdit} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Edit inputs
        </button>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => exportQualityLabProject(project)} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold transition hover:border-white/25 hover:bg-white/10">
            <Download className="h-4 w-4" /> Export model
          </button>
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg bg-teal-300 px-3 py-2 text-xs font-bold text-slate-950 transition hover:bg-teal-200">
            <Printer className="h-4 w-4" /> Print / save PDF
          </button>
          <Link href={`/quality-lab/review?project=${project.id}`} onClick={() => analytics.blueprintCtaClicked("blueprint_report", "expert_review")} className="inline-flex items-center gap-2 rounded-lg border border-teal-300/25 bg-teal-300/10 px-3 py-2 text-xs font-bold text-teal-200 transition hover:bg-teal-300/15">
            Request expert review <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <header className="relative mb-5 overflow-hidden rounded-3xl border border-teal-300/20 bg-gradient-to-br from-teal-300/12 via-slate-900 to-sky-300/5 p-6 shadow-2xl shadow-black/20 md:p-8 print:border-slate-400 print:bg-white print:shadow-none">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] print:hidden" />
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200 print:border-slate-400 print:bg-white print:text-slate-700">
              <ShieldCheck className="h-3.5 w-3.5" /> Concept blueprint · SME review required
            </span>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-teal-300 print:text-slate-600">Atlas Quality Lab Blueprint</p>
            <h1 className="mt-2 max-w-4xl text-3xl font-bold leading-tight md:text-5xl print:text-slate-950">{project.name}</h1>
            <p className="mt-3 text-sm text-slate-400 print:text-slate-600">
              {input.companyName || "Company not specified"} · {input.country} · {input.facilityType.replaceAll("-", " ")} · {blueprint.domainPack.version}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 md:w-72">
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
          <div className="mt-5 grid gap-2 border-t border-white/10 pt-5 sm:grid-cols-4 print:border-slate-300">
            <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3 print:border-slate-300 print:bg-white"><p className="text-lg font-bold text-teal-200 print:text-slate-950">{blueprint.dataQuality.completenessPercent}%</p><p className="text-[10px] text-slate-500">controlled-use readiness</p></div>
            <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3 print:border-slate-300 print:bg-white"><p className="text-lg font-bold text-red-200 print:text-slate-950">{blueprint.dataQuality.blockingOpenCount}</p><p className="text-[10px] text-slate-500">blocking inputs open</p></div>
            <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3 print:border-slate-300 print:bg-white"><p className="text-lg font-bold text-sky-200 print:text-slate-950">{blueprint.dataQuality.tracedRuleCount}</p><p className="text-[10px] text-slate-500">versioned rules traced</p></div>
            <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3 print:border-slate-300 print:bg-white"><p className="truncate text-xs font-bold text-amber-200 print:text-slate-950">{blueprint.contractVersion}</p><p className="mt-1 text-[10px] text-slate-500">output contract</p></div>
          </div>
        </div>
      </header>

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
        <Section icon={FlaskConical} eyebrow="Demand model" title="Testing workload">
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

        <Section icon={Boxes} eyebrow="Capability architecture" title="Vendor-neutral equipment plan">
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
                    <td className="max-w-xl py-3 text-xs leading-5 text-slate-400 print:text-slate-700"><p>{item.rationale}</p><p className="mt-1 text-slate-500 print:text-slate-600"><strong>URS seed:</strong> {item.specification}</p></td>
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

        <Section icon={AlertTriangle} eyebrow="Decision risks" title="Review before investment approval">
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
          <Section icon={ClipboardCheck} eyebrow="Action plan" title="Recommended next decisions">
            <ol className="space-y-3">
              {blueprint.recommendations.map((recommendation, index) => (
                <li key={recommendation.id} className="flex gap-3 text-sm leading-6 text-slate-300 print:text-slate-800"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-teal-300/10 text-xs font-bold text-teal-200 print:bg-slate-100 print:text-slate-800">{index + 1}</span><div><div className="mb-1 flex flex-wrap items-center gap-2"><span>{recommendation.recommendation}</span><span className="rounded-full border border-white/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500 print:border-slate-300">{recommendation.priority.replaceAll("-", " ")}</span></div><p className="text-xs leading-5 text-slate-500">{recommendation.rationale}</p></div></li>
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

        <Section icon={Info} eyebrow="Assumption ledger" title="What this model believes">
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

        <Section icon={AlertTriangle} eyebrow="Open information" title="What must be resolved before controlled use">
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
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.025] p-4 text-xs leading-6 text-slate-400 print:border-slate-300 print:bg-white print:text-slate-700">
            <p><strong className="text-slate-200 print:text-slate-950">Review status:</strong> {blueprint.review.status.replaceAll("-", " ")} · Required roles: {blueprint.review.requiredRoles.join(" · ")}</p>
            <p className="mt-1">{blueprint.review.reviewNote}</p>
          </div>
        </Section>

        <div className="grid gap-5 lg:grid-cols-2">
          <Section icon={FileText} eyebrow="Evidence register" title="Sources and missing site evidence">
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
          <Section icon={Network} eyebrow="Rule registry" title="Versioned calculation trace">
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
