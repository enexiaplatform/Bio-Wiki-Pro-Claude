import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, BookOpenCheck, CircleAlert, ExternalLink, Filter, FlaskConical, Search, ShieldCheck } from "lucide-react";
import { analytics, capture } from "@/hooks/use-analytics";
import { useSEO } from "@/hooks/use-seo";
import { ResourceSystemNavigator } from "@/components/ResourceSystemNavigator";
import { StageCoverageProfileCard } from "@/components/StageCoverageProfileCard";
import { METHOD_SYSTEM_MAP, getResourceStage, getResourceSystem, resolveExplicitSystemStages } from "@/data/resourceConnections";
import { useResourceSelection } from "@/hooks/use-resource-selection";
import {
  METHOD_NAVIGATOR_RECORDS,
  NAVIGATOR_STANDARDS,
  searchMethodNavigator,
  standardsForMethod,
  type NavigatorCoverage,
} from "@/data/methodStandardsNavigator";

const coverageLabels: Record<NavigatorCoverage, string> = {
  "structured-concept": "Structured concept",
  "source-mapped": "Source mapped",
  "evidence-required": "Evidence required",
};

const coverageStyles: Record<NavigatorCoverage, string> = {
  "structured-concept": "border-teal-300/25 bg-teal-300/10 text-teal-200",
  "source-mapped": "border-sky-300/25 bg-sky-300/10 text-sky-200",
  "evidence-required": "border-amber-300/25 bg-amber-300/10 text-amber-200",
};

export default function MethodStandardsNavigatorPage() {
  const [query, setQuery] = useState("");
  const [coverage, setCoverage] = useState<NavigatorCoverage | "all">("all");
  const { selection, hrefWithSelection } = useResourceSelection();
  const result = useMemo(() => searchMethodNavigator(query, coverage), [coverage, query]);
  const selectedSystem = getResourceSystem(selection.systemId);
  const selectedStage = getResourceStage(selection);
  const connectedMethods = METHOD_NAVIGATOR_RECORDS.filter((record) => (METHOD_SYSTEM_MAP[record.id] ?? []).some((mapping) => mapping.systemId === selection.systemId && (!selection.stageId || mapping.stageId === selection.stageId)));

  useSEO({
    title: "Method & Standards Navigator | Life Science Atlas",
    description: "Search the bounded Atlas microbiology method and standards map with visible coverage, applicability, source access, limitations, and evidence gaps.",
  });

  useEffect(() => {
    const normalized = query.trim();
    if (normalized.length < 3) return;
    const timer = window.setTimeout(() => analytics.searchPerformed(normalized, "method_standards_navigator", result.methods.length + result.standards.length), 700);
    return () => window.clearTimeout(timer);
  }, [query, result.methods.length, result.standards.length]);

  const noResults = query.trim().length > 0 && result.methods.length === 0 && result.standards.length === 0;
  const reviewHref = `/quality-lab/review?source=method-navigator&method=${encodeURIComponent(query.trim())}`;

  return <div className="method-navigator-page min-h-screen bg-[#07182d] px-4 pb-24 pt-8 text-slate-100 md:pt-14"><div className="mx-auto max-w-7xl">
    <header className="overflow-hidden rounded-3xl border border-teal-300/20 bg-gradient-to-br from-teal-300/10 via-slate-950 to-sky-300/5 p-6 md:p-9">
      <div className="grid gap-7 lg:grid-cols-[1fr_22rem] lg:items-end">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-teal-300/25 bg-teal-300/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-teal-200"><BookOpenCheck className="h-4 w-4" /> Atlas Evidence Navigator</p>
          <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-tight md:text-6xl">Find what Atlas covers—and what it does not.</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400">Search a bounded non-sterile pharmaceutical microbiology map. Every result separates source mapping, executable concept logic, missing site evidence, and licensed text that Atlas does not reproduce.</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[[METHOD_NAVIGATOR_RECORDS.length, "Methods"], [NAVIGATOR_STANDARDS.length, "Sources"], [0, "Approved"]].map(([value, label]) => <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-center"><p className="text-2xl font-bold text-teal-200">{value}</p><p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">{label}</p></div>)}
        </div>
      </div>
      <div className="mt-7 rounded-2xl border border-amber-300/15 bg-amber-300/[0.05] p-4 text-xs leading-6 text-slate-400"><CircleAlert className="mr-2 inline h-4 w-4 text-amber-200" />A result is a navigation and planning record, not a site-approved method, registered specification, compliance determination, or replacement for the current official source.</div>
    </header>

    <div className="mt-6"><ResourceSystemNavigator area="methods" /><StageCoverageProfileCard area="methods" /></div>

    {selectedSystem && <section className="mt-6"><div className="mb-3"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-300">Connected method records</p><h2 className="mt-1 text-lg font-bold">{selectedStage ? selectedStage.title : selectedSystem.shortTitle} method context</h2></div>{connectedMethods.length > 0 ? <div className="grid gap-3 md:grid-cols-2">{connectedMethods.map((record) => <article key={record.id} className="rounded-xl border border-teal-300/20 bg-teal-300/[0.05] p-4"><div className="flex items-center justify-between gap-3"><span className={`rounded-full border px-2 py-1 text-[8px] font-bold uppercase ${coverageStyles[record.coverage]}`}>{coverageLabels[record.coverage]}</span><span className="text-[9px] font-bold uppercase text-slate-600">Human review required</span></div><h3 className="mt-3 text-sm font-bold">{record.title}</h3><p className="mt-2 text-xs leading-5 text-slate-500">{record.decision}</p><Link href={hrefWithSelection(record.guideHref, "system-recommendation")} className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-teal-300">Open application guide <ArrowRight className="h-3.5 w-3.5" /></Link></article>)}</div> : <div className="rounded-xl border border-dashed border-amber-300/20 bg-amber-300/[0.04] p-5 text-sm text-slate-400"><strong className="text-amber-200">Stage profile only:</strong> no executable or source-mapped catalog method is claimed for this stage. Use the profile above to collect the evidence required for qualified review.</div>}</section>}

    <section className="sticky top-16 z-20 mt-6 grid gap-3 rounded-2xl border border-white/10 bg-[#081628]/95 p-3 shadow-2xl shadow-black/20 backdrop-blur md:grid-cols-[1fr_auto]">
      <label className="relative block"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><span className="sr-only">Search methods and standards</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try: bioburden, USP <85>, water, environmental monitoring…" className="h-12 w-full rounded-xl border border-white/10 bg-black/20 pl-10 pr-3 text-sm outline-none placeholder:text-slate-600 focus:border-teal-300/40 focus:ring-2 focus:ring-teal-300/10" /></label>
      <div className="flex items-center gap-2 overflow-x-auto"><Filter className="hidden h-4 w-4 text-slate-500 sm:block" />{(["all", "structured-concept", "source-mapped", "evidence-required"] as const).map((value) => <button key={value} type="button" aria-pressed={coverage === value} onClick={() => setCoverage(value)} className={`shrink-0 rounded-xl border px-3 py-3 text-[10px] font-bold uppercase tracking-wider ${coverage === value ? "border-teal-300/35 bg-teal-300/10 text-teal-200" : "border-white/10 text-slate-500"}`}>{value === "all" ? "All coverage" : coverageLabels[value]}</button>)}</div>
    </section>

    {noResults ? <section className="mt-6 rounded-3xl border border-dashed border-amber-300/25 bg-amber-300/[0.04] p-8 text-center"><CircleAlert className="mx-auto h-8 w-8 text-amber-200" /><h2 className="mt-4 text-2xl font-bold">Not yet covered</h2><p className="mx-auto mt-2 max-w-2xl text-sm leading-7 text-slate-400">Atlas will not invent a method or silently infer applicability. Record this as a coverage request so it can be assessed against qualified demand, source access, SME ownership and validation evidence.</p><Link href={reviewHref} onClick={() => capture("method_coverage_requested", { query: query.trim(), result_count: 0 })} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-amber-300 px-5 py-3 text-sm font-bold text-slate-950">Request scoped review <ArrowRight className="h-4 w-4" /></Link></section> : <>
      <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.025] p-5 md:p-7">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300">Coverage matrix</p><h2 className="mt-2 text-2xl font-bold">Application depth—not repeated view counts</h2><p className="mt-2 max-w-4xl text-xs leading-6 text-slate-400">Each row is one application record. Connected-view count shows reuse of that same record across lifecycle/system views; it is not additional method depth or controlled evidence.</p></div><span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-[10px] font-bold uppercase text-amber-200">0 controlled revisions</span></div>
        <div className="mt-5 overflow-x-auto rounded-xl border border-white/10" tabIndex={0} role="region" aria-label="Method application coverage matrix">
          <table className="w-full min-w-[1040px] text-left text-xs">
            <caption className="sr-only">Method application coverage matrix by architecture, evidence status, controlled revision and connected-view reuse</caption>
            <thead className="bg-black/20 text-[10px] uppercase tracking-wider text-slate-400"><tr><th scope="col" className="px-3 py-3">Application</th><th scope="col" className="px-3 py-3">Method architecture</th><th scope="col" className="px-3 py-3">Dimension depth</th><th scope="col" className="px-3 py-3">Evidence status</th><th scope="col" className="px-3 py-3">Controlled revision</th><th scope="col" className="px-3 py-3">Connected-view reuse</th></tr></thead>
            <tbody className="divide-y divide-white/8">{result.methods.map((record) => {
              const standards = standardsForMethod(record);
              const licensedCount = standards.filter((standard) => standard.access === "licensed-source-required").length;
              const viewCount = resolveExplicitSystemStages(METHOD_SYSTEM_MAP[record.id]).length;
              return <tr key={record.id} className="align-top"><th scope="row" className="px-3 py-3"><span className="font-semibold text-slate-100">{record.title}</span><span className="mt-1 block font-mono text-[9px] font-normal text-slate-600">{record.id}</span></th><td className="px-3 py-3"><span className="font-semibold text-sky-200">{record.methodGraphStatus.replaceAll("-", " ")}</span><span className="mt-1 block text-[10px] text-slate-500">{coverageLabels[record.coverage]}</span></td><td className="px-3 py-3 text-slate-300">{record.dimensionStatus.structured} structured · {record.dimensionStatus.partial} partial · {record.dimensionStatus.evidenceRequired} evidence required</td><td className="px-3 py-3 text-slate-300">{standards.length} canonical sources<span className="mt-1 block text-[10px] text-amber-200">{licensedCount} licensed edition{licensedCount === 1 ? "" : "s"} require confirmation</span></td><td className="px-3 py-3"><span className="font-semibold text-amber-200">Not recorded</span><span className="mt-1 block text-[10px] text-slate-500">No site-approved method revision or SME release</span></td><td className="px-3 py-3 text-slate-300">{viewCount} connected context{viewCount === 1 ? "" : "s"}<span className="mt-1 block text-[10px] text-slate-500">Same application record reused</span></td></tr>;
            })}</tbody>
          </table>
        </div>
      </section>
      <section className="mt-8"><div className="flex items-end justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Browse full catalog</p><h2 className="mt-2 text-2xl font-bold">Methods and decisions</h2></div><span className="text-xs text-slate-500">{result.methods.length} result{result.methods.length === 1 ? "" : "s"}</span></div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">{result.methods.map((record) => <article key={record.id} className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.035] p-5 md:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><span className={`rounded-full border px-3 py-1 text-[9px] font-bold uppercase tracking-wider ${coverageStyles[record.coverage]}`}>{coverageLabels[record.coverage]}</span><span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">{record.unresolvedCount} unresolved dimensions</span></div><h3 className="mt-4 text-xl font-bold">{record.title}</h3><p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-sky-300">{record.domain}</p><div className="mt-3 flex flex-wrap gap-1.5">{resolveExplicitSystemStages(METHOD_SYSTEM_MAP[record.id]).map(({ system, stage }) => <span key={`${system.id}:${stage.id}`} className="rounded-full border border-white/10 px-2 py-1 text-[9px] font-semibold text-slate-500">{system.shortTitle} · {stage.title}</span>)}</div><p className="mt-4 text-sm leading-7 text-slate-300">{record.decision}</p><div className="mt-4 rounded-xl border border-amber-300/10 bg-amber-300/[0.035] p-3 text-xs leading-6 text-slate-500">{record.boundary}</div><div className="mt-4 flex flex-wrap gap-2">{standardsForMethod(record).map((standard) => <a key={standard.id} href={standard.locator} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/15 px-2.5 py-1.5 text-[10px] font-semibold text-slate-400 hover:text-white">{standard.title}<ExternalLink className="h-3 w-3" /></a>)}</div><div className="mt-auto flex flex-wrap gap-4 pt-5"><Link href={hrefWithSelection(record.guideHref, "full-catalog")} className="inline-flex items-center gap-2 text-xs font-bold text-teal-300">Open application guide <ArrowRight className="h-4 w-4" /></Link><Link href="/quality-lab/planner?source=method-navigator" onClick={() => capture("method_navigator_blueprint_opened", { method_id: record.id, coverage: record.coverage })} className="inline-flex items-center gap-2 text-xs font-bold text-sky-300">Use in Blueprint <ArrowRight className="h-4 w-4" /></Link></div></article>)}</div>
      </section>

      {result.standards.length > 0 && <section className="mt-10"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-300">Source registry</p><h2 className="mt-2 text-2xl font-bold">Standards and regulatory context</h2></div><div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{result.standards.map((standard) => <article key={standard.id} className="rounded-2xl border border-white/10 bg-black/15 p-5"><div className="flex items-start justify-between gap-3"><ShieldCheck className="h-5 w-5 text-sky-300" /><span className={`rounded-full border px-2 py-1 text-[8px] font-bold uppercase ${standard.access === "public-source" ? "border-teal-300/20 text-teal-200" : "border-amber-300/20 text-amber-200"}`}>{standard.access === "public-source" ? "Public source" : "Licensed text"}</span></div><h3 className="mt-4 text-sm font-bold leading-6">{standard.title}</h3><p className="mt-1 text-[10px] uppercase tracking-wider text-slate-600">{standard.publisher} · {standard.market}</p><p className="mt-3 text-xs leading-6 text-slate-400">{standard.scope}</p><p className="mt-3 text-[11px] leading-5 text-amber-200/70">{standard.version}</p><a href={standard.locator} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-sky-300">Open official source <ExternalLink className="h-4 w-4" /></a></article>)}</div></section>}
    </>}

    <section className="mt-10 rounded-3xl border border-sky-300/20 bg-sky-300/[0.05] p-6 md:p-8"><FlaskConical className="h-6 w-6 text-sky-300" /><h2 className="mt-4 text-2xl font-bold">Coverage grows from controlled cases, not content volume.</h2><p className="mt-2 max-w-4xl text-sm leading-7 text-slate-400">A new method becomes executable only after applicability, current sources, approved method detail, observed resource demand, lifecycle evidence and qualified review are available. A catalog link alone never promotes maturity.</p><Link href="/quality-lab/review?source=method-navigator" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-sky-300">Bring a real method or lab scope <ArrowRight className="h-4 w-4" /></Link></section>
  </div></div>;
}
