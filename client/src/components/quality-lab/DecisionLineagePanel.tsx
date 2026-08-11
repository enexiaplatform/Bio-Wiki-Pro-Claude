import { ArrowRight, Calculator, FileSearch, GitBranch, Info, Network, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import type { DecisionLineage, QualityLabBlueprint } from "@shared/quality-lab";
import { analytics } from "@/hooks/use-analytics";

export function DecisionTraceLink({ projectId, lineage, label = "Trace this decision" }: { projectId: string; lineage?: DecisionLineage; label?: string }) {
  if (!lineage) return null;
  const packageId = typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("package");
  const packageQuery = packageId ? `?package=${encodeURIComponent(packageId)}` : "";
  return (
    <Link
      data-print="hide"
      href={`/quality-lab/projects/${encodeURIComponent(projectId)}/lineage/${encodeURIComponent(lineage.id)}${packageQuery}`}
      className="inline-flex items-center gap-1.5 text-[11px] font-bold text-sky-300 transition hover:text-sky-200"
    >
      <GitBranch className="h-3.5 w-3.5" /> {label} <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  );
}

const confidenceCopy = {
  high: "High confidence within the declared model basis",
  medium: "Medium confidence; targeted confirmation remains",
  indicative: "Indicative concept output; site evidence is required",
};

export function DecisionLineagePanel({ projectId, blueprint, lineage }: { projectId: string; blueprint: QualityLabBlueprint; lineage: DecisionLineage }) {
  const assumptions = blueprint.assumptions.filter((item) => lineage.assumptionIds.includes(item.id));
  const unresolved = blueprint.unresolvedInputs.filter((item) => lineage.unresolvedInputIds.includes(item.id));
  const workflows = blueprint.workflows.filter((item) => lineage.workflowIds.includes(item.id));
  const methods = blueprint.methodRequirements.filter((item) => lineage.methodIds.includes(item.methodId));

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-sky-300/20 bg-gradient-to-br from-sky-300/[0.08] via-white/[0.035] to-teal-300/[0.04] p-5 md:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-4xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-300">Decision conclusion</p>
            <h1 className="mt-2 text-2xl font-bold leading-tight md:text-4xl">{lineage.summary}</h1>
            <p className="mt-4 text-lg font-bold text-teal-200">{lineage.currentOutput}</p>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">{lineage.calculation}</p>
          </div>
          <div className="shrink-0 rounded-2xl border border-white/10 bg-slate-950/30 p-4 lg:w-72">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Confidence boundary</p>
            <p className="mt-2 text-sm font-bold capitalize text-amber-200">{lineage.confidence}</p>
            <p className="mt-2 text-xs leading-5 text-slate-400">{confidenceCopy[lineage.confidence]}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
        <article className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
          <Heading icon={Calculator} title="How Atlas reached it" subtitle="Inputs and material change factors recorded by the compiler." />
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <List title="Contributing inputs" items={lineage.contributingInputPaths} mono />
            <List title="What can change the result" items={lineage.materialChangeFactors} />
          </div>
        </article>
        <article className="rounded-2xl border border-amber-300/15 bg-amber-300/[0.04] p-5">
          <Heading icon={ShieldCheck} title="Decision boundary" subtitle="Limitations are part of the decision record, not footnotes." />
          <List title="Known limitations" items={lineage.limitations} />
        </article>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 md:p-6">
        <Heading icon={Network} title="Versioned rule and evidence trace" subtitle="Open the supporting Evidence Graph without implying site approval." />
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <TraceGroup
            title="Rules"
            rows={lineage.ruleRefs}
            onOpen={(id) => analytics.decisionLineageSourceOpened(projectId, lineage.id, "rule", id)}
          />
          <TraceGroup
            title="Evidence records"
            rows={lineage.evidenceRefs}
            onOpen={(id) => analytics.decisionLineageSourceOpened(projectId, lineage.id, "evidence", id)}
          />
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <article className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><Heading icon={GitBranch} title="Workflow links" subtitle={`${workflows.length} compiled workflow${workflows.length === 1 ? "" : "s"}`} /><List title="Linked workflow" items={workflows.map((item) => `${item.label} — ${item.monthlyUnits.toLocaleString("en-US")} units/month`)} empty="No workflow is directly linked." /></article>
        <article className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><Heading icon={FileSearch} title="Method links" subtitle={`${methods.length} method application${methods.length === 1 ? "" : "s"}`} /><List title="Linked method" items={Array.from(new Set(methods.map((item) => `${item.productName} — ${item.methodName}`)))} empty="No method application is directly linked." /></article>
        <article className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><Heading icon={Info} title="Assumptions" subtitle={`${assumptions.length} declared assumption${assumptions.length === 1 ? "" : "s"}`} /><List title="Applied assumption" items={assumptions.map((item) => `${item.label}: ${item.value}`)} empty="No declared assumption is directly linked." /></article>
      </section>

      <section className={`rounded-2xl border p-5 ${unresolved.length > 0 ? "border-red-300/15 bg-red-300/[0.04]" : "border-teal-300/15 bg-teal-300/[0.04]"}`}>
        <Heading icon={unresolved.length > 0 ? Info : ShieldCheck} title={unresolved.length > 0 ? "Open inputs that qualify this decision" : "No linked open input"} subtitle={unresolved.length > 0 ? `${unresolved.length} unresolved input${unresolved.length === 1 ? "" : "s"} can change or constrain this conclusion.` : "The lineage record has no directly linked unresolved input."} />
        {unresolved.length > 0 && <div className="mt-5 grid gap-3 md:grid-cols-2">{unresolved.map((item) => <article key={item.id} className="rounded-xl border border-white/10 bg-slate-950/25 p-4"><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-bold text-slate-100">{item.question}</p><span className="rounded-full border border-current/15 px-2 py-0.5 text-[9px] font-bold uppercase text-amber-200">{item.severity}</span></div><p className="mt-2 text-xs leading-5 text-slate-400">{item.impact}</p><p className="mt-3 text-[11px] leading-5 text-sky-200/80"><strong>Resolve:</strong> {item.resolution}</p></article>)}</div>}
      </section>

      <details className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 text-xs text-slate-400">
        <summary className="cursor-pointer font-bold text-slate-200">Technical record</summary>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2"><Meta label="Lineage ID" value={lineage.id} /><Meta label="Output key" value={lineage.outputKey} /><Meta label="Decision type" value={lineage.decisionType} /><Meta label="Contract" value={lineage.contractVersion} /><Meta label="Compiler" value={blueprint.compilerCoreVersion} /><Meta label="Domain Pack" value={blueprint.domainPack.version} /></dl>
      </details>
    </div>
  );
}

function Heading({ icon: Icon, title, subtitle }: { icon: typeof Network; title: string; subtitle: string }) {
  return <div className="flex items-start gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-300/10 text-sky-300"><Icon className="h-4 w-4" /></div><div><h2 className="text-base font-bold text-white">{title}</h2><p className="mt-1 text-xs leading-5 text-slate-500">{subtitle}</p></div></div>;
}

function List({ title, items, mono = false, empty = "Nothing recorded." }: { title: string; items: string[]; mono?: boolean; empty?: string }) {
  return <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{title}</p>{items.length > 0 ? <ul className={`mt-3 space-y-2 text-xs leading-5 text-slate-300 ${mono ? "font-mono" : ""}`}>{items.map((item) => <li key={item} className="border-l border-sky-300/30 pl-3">{item}</li>)}</ul> : <p className="mt-3 text-xs text-slate-600">{empty}</p>}</div>;
}

function TraceGroup({ title, rows, onOpen }: { title: string; rows: Array<{ id: string; version: string }>; onOpen: (id: string) => void }) {
  return <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{title}</p><div className="mt-3 space-y-2">{rows.map((row) => <Link key={`${row.id}:${row.version}`} href="/quality-lab/evidence" onClick={() => onOpen(row.id)} className="group flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-slate-950/25 p-3 transition hover:border-sky-300/25"><div className="min-w-0"><p className="truncate font-mono text-xs font-bold text-sky-200">{row.id}</p><p className="mt-1 text-[10px] text-slate-600">Version {row.version}</p></div><ArrowRight className="h-4 w-4 shrink-0 text-slate-600 group-hover:text-sky-300" /></Link>)}</div></div>;
}

function Meta({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-[10px] font-bold uppercase tracking-wider text-slate-600">{label}</dt><dd className="mt-1 break-all font-mono text-sky-200/80">{value}</dd></div>;
}
