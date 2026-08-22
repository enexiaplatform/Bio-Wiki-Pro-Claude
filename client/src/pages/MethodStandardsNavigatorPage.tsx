import { useEffect, useMemo, useState, type ComponentType } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  BookOpenText,
  Check,
  CircleAlert,
  CircleHelp,
  Crosshair,
  ExternalLink,
  FileSearch,
  FlaskConical,
  Info,
  Microscope,
  Search,
  ShieldCheck,
  Sparkles,
  TestTube2,
  Waves,
} from "lucide-react";
import { analytics, capture } from "@/hooks/use-analytics";
import { useSEO } from "@/hooks/use-seo";
import { useResourceSelection } from "@/hooks/use-resource-selection";
import {
  METHOD_NAVIGATOR_RECORDS,
  NAVIGATOR_STANDARDS,
  searchMethodNavigator,
  standardsForMethod,
  type MethodNavigatorRecord,
  type NavigatorCoverage,
} from "@/data/methodStandardsNavigator";

const coverageLabels: Record<NavigatorCoverage, string> = {
  "structured-concept": "Structured concept",
  "source-mapped": "Source mapped",
  "evidence-required": "Evidence required",
};

const coverageStyles: Record<NavigatorCoverage, string> = {
  "structured-concept": "border-teal-300/45 bg-teal-300/10 text-teal-200",
  "source-mapped": "border-sky-300/45 bg-sky-300/10 text-sky-200",
  "evidence-required": "border-amber-300/45 bg-amber-300/10 text-amber-200",
};

const applicationIcons: Record<string, ComponentType<{ className?: string }>> = {
  "water-microbiology": Waves,
  "growth-promotion-media-qc": TestTube2,
  "bioburden-filtration": FlaskConical,
  "specified-microorganisms": Microscope,
  "method-suitability-recovery": ShieldCheck,
  "bet-lal": TestTube2,
  "environmental-monitoring": FileSearch,
  "microbial-identification": Microscope,
};

const routeStages = [
  { label: "Query", helper: "Ask the method question", icon: CircleHelp },
  { label: "Application match", helper: "Find the bounded record", icon: Crosshair },
  { label: "Coverage state", helper: "Expose maturity and gaps", icon: FileSearch },
  { label: "Named source access", helper: "Open current references", icon: BookOpenText },
  { label: "Decision use", helper: "Choose the next action", icon: Check },
];

const radarOffsets = [38, 18, 5, 0, 0, 5, 18, 38];

function findDefaultRecord() {
  return METHOD_NAVIGATOR_RECORDS.find((record) => record.id === "method-suitability-recovery") ?? METHOD_NAVIGATOR_RECORDS[0];
}

function RecordIcon({ record, className = "h-5 w-5" }: { record: MethodNavigatorRecord; className?: string }) {
  const Icon = applicationIcons[record.id] ?? FlaskConical;
  return <Icon className={className} />;
}

export default function MethodStandardsNavigatorPage() {
  const initialRecord = findDefaultRecord();
  const [query, setQuery] = useState("microbial method suitability");
  const [selectedId, setSelectedId] = useState(initialRecord.id);
  const { hrefWithSelection } = useResourceSelection();
  const result = useMemo(() => searchMethodNavigator(query), [query]);
  const selected = METHOD_NAVIGATOR_RECORDS.find((record) => record.id === selectedId) ?? initialRecord;
  const selectedSources = standardsForMethod(selected);
  const hasApplicationMatch = result.methods.length > 0 || query.trim().length === 0;

  useSEO({
    title: "Method & Standards Navigator | Life Science Atlas",
    description: "Ask a method question and trace Atlas coverage, named sources, evidence boundaries, and the next decision-support action.",
  });

  useEffect(() => {
    const normalized = query.trim();
    if (normalized.length < 3) return;
    const timer = window.setTimeout(() => {
      analytics.searchPerformed(normalized, "method_standards_navigator", result.methods.length + result.standards.length);
    }, 700);
    return () => window.clearTimeout(timer);
  }, [query, result.methods.length, result.standards.length]);

  useEffect(() => {
    if (query.trim().length === 0 || result.methods.some((record) => record.id === selectedId)) return;
    if (result.methods[0]) setSelectedId(result.methods[0].id);
  }, [query, result.methods, selectedId]);

  const chooseRecord = (record: MethodNavigatorRecord) => {
    setSelectedId(record.id);
    setQuery(record.title);
    capture("method_navigator_application_selected", { method_id: record.id, coverage: record.coverage });
  };

  const requestReviewHref = `/quality-lab/review?source=method-navigator&method=${encodeURIComponent(query.trim())}`;

  return (
    <div
      className="method-navigator-page relative min-h-[calc(100vh-4rem)] overflow-hidden bg-[#061426] text-slate-100"
      style={{ backgroundImage: "url('/images/blueprint/decision-observatory-grid.jpg')", backgroundColor: "#061426", backgroundBlendMode: "soft-light", backgroundSize: "cover", backgroundPosition: "center top" }}
    >
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[1440px] flex-col px-4 pb-6 pt-5 sm:px-6 lg:px-8">
        <header>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-teal-300">Method &amp; Standards Navigator</p>
          <h1 className="mx-auto mt-3 max-w-[1240px] text-center text-3xl font-bold leading-tight sm:text-4xl lg:whitespace-nowrap lg:text-[40px]">
            Ask the method question. <span className="text-teal-300">See the evidence boundary.</span>
          </h1>
          <label className="relative mx-auto mt-6 block max-w-[44rem]">
            <span className="sr-only">Search methods and standards</span>
            <Search className="pointer-events-none absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-slate-300" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-16 w-full rounded-xl border border-teal-300/80 bg-[#081a2e]/90 pl-14 pr-5 text-base text-white shadow-[0_0_22px_rgba(45,212,191,.08)] outline-none placeholder:text-slate-500 focus:border-teal-200 focus:ring-2 focus:ring-teal-300/15 sm:text-xl"
              placeholder="Try: bioburden, USP <85>, water, environmental monitoring…"
            />
          </label>
        </header>

        <section className="mt-10" aria-label="Method evidence route">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 sm:gap-2">
            {routeStages.map((stage, index) => {
              const Icon = stage.icon;
              const inactive = !hasApplicationMatch && index > 0;
              return (
                <div key={stage.label} className="relative text-center">
                  {index < routeStages.length - 1 && (
                    <>
                      <span aria-hidden="true" className={`absolute left-[62%] top-[53px] hidden w-[78%] border-t sm:block ${inactive ? "border-slate-700" : "border-teal-300/70"}`} />
                      <span aria-hidden="true" className={`absolute left-[calc(100%-8px)] top-[46px] z-20 hidden h-4 w-4 items-center justify-center rounded-full border sm:flex ${inactive ? "border-slate-700 bg-[#07182b] text-slate-600" : "border-teal-300 bg-teal-300 text-[#061426]"}`}><ArrowRight className="h-2.5 w-2.5" /></span>
                    </>
                  )}
                  <p className={`text-[10px] font-bold uppercase tracking-[0.13em] ${inactive ? "text-slate-600" : "text-teal-300"}`}>{index + 1}. {stage.label}</p>
                  <div className={`relative z-10 mx-auto mt-2 flex h-[72px] w-[72px] items-center justify-center rounded-full border bg-[#07182b] ${inactive ? "border-slate-700 text-slate-600" : "border-teal-300/80 text-teal-100 shadow-[0_0_18px_rgba(45,212,191,.12)]"}`}>
                    <Icon className="h-9 w-9" />
                  </div>
                  <span className="sr-only">{stage.helper}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_1.18fr_1fr_1.42fr_1.18fr]">
            <article className="min-h-[178px] rounded-xl border border-white/15 bg-[#0a1b30]/92 p-4">
              <p className="text-lg font-semibold text-white">{query.trim() || "All method applications"}</p>
              <p className="mt-2 text-xs leading-5 text-slate-400">{hasApplicationMatch ? selected.domain : "No bounded application record matched"}</p>
            </article>

            <article className={`min-h-[178px] rounded-xl border p-4 ${hasApplicationMatch ? "border-teal-300/75 bg-teal-300/[0.065] shadow-[0_0_20px_rgba(45,212,191,.09)]" : "border-amber-300/40 bg-amber-300/[0.04]"}`}>
              {hasApplicationMatch ? (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <RecordIcon record={selected} className="h-6 w-6 text-teal-200" />
                    <span className={`rounded-full border px-2 py-1 text-[8px] font-bold uppercase tracking-wide ${coverageStyles[selected.coverage]}`}>{coverageLabels[selected.coverage]}</span>
                  </div>
                  <h2 className="mt-4 text-base font-bold leading-5">{selected.title}</h2>
                  <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-teal-300">{selected.domain}</p>
                </>
              ) : (
                <>
                  <CircleAlert className="h-6 w-6 text-amber-200" />
                  <h2 className="mt-4 text-lg font-bold">Not yet covered</h2>
                  <p className="mt-2 text-xs leading-5 text-slate-400">Atlas will not invent a method or silently infer applicability.</p>
                </>
              )}
            </article>

            <div>
              <article className="min-h-[178px] rounded-xl border border-white/15 bg-[#0a1b30]/92 p-4">
                <p className={`inline-flex items-center gap-2 text-sm font-semibold ${hasApplicationMatch ? "text-teal-200" : "text-slate-500"}`}><span className={`h-3 w-3 rounded-full ${hasApplicationMatch ? "bg-teal-300" : "bg-slate-600"}`} />{hasApplicationMatch ? coverageLabels[selected.coverage] : "Not covered"}</p>
                <p className="mt-5 text-2xl font-medium text-white">{hasApplicationMatch ? selected.unresolvedCount : "—"}</p>
                <p className="mt-1 text-sm text-slate-300">{hasApplicationMatch ? "unresolved dimensions" : "no application match"}</p>
                {hasApplicationMatch && <p className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-amber-200"><CircleAlert className="h-4 w-4" /> Evidence boundary</p>}
              </article>
              {hasApplicationMatch && (
                <div className="mt-3 flex min-h-[104px] items-start gap-2 rounded-xl border border-amber-300/45 bg-amber-300/[0.07] px-3 py-3 text-[10px] leading-4 text-amber-100/90">
                  <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-200" />
                  <p>{selected.boundary}</p>
                </div>
              )}
            </div>

            <article className="min-h-[178px] rounded-xl border border-white/15 bg-[#0a1b30]/92 p-4">
              <p className="text-sm font-semibold text-teal-200">{hasApplicationMatch ? `Open in ${selectedSources.length} named source${selectedSources.length === 1 ? "" : "s"}` : "Named source access"}</p>
              <div className="mt-3 divide-y divide-white/10">
                {hasApplicationMatch ? selectedSources.map((source) => (
                  <a key={source.id} href={source.locator} target="_blank" rel="noreferrer" className="flex min-h-9 items-center gap-2 py-2 text-[10px] font-semibold leading-4 text-slate-200 transition hover:text-white">
                    <BookOpenText className="h-4 w-4 shrink-0 text-slate-300" />
                    <span className="flex-1">{source.title}</span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                  </a>
                )) : <p className="pt-2 text-xs leading-5 text-slate-500">No source is asserted without an application match.</p>}
              </div>
            </article>

            <article className="min-h-[178px] rounded-xl border border-white/15 bg-[#0a1b30]/92 p-4">
              {hasApplicationMatch ? (
                <>
                  <dl className="divide-y divide-white/10 text-xs">
                    <div className="flex justify-between gap-3 pb-2"><dt className="text-slate-300">Covered for planning</dt><dd className="font-bold text-teal-200">Yes</dd></div>
                    <div className="flex justify-between gap-3 py-2"><dt className="text-slate-300">Site-approved</dt><dd className="font-bold text-amber-200">No</dd></div>
                    <div className="flex justify-between gap-3 py-2"><dt className="text-slate-300">Qualified review</dt><dd className="font-bold text-amber-200">Required</dd></div>
                  </dl>
                  <Link href={hrefWithSelection(selected.guideHref, "method-route")} className="mt-3 flex min-h-10 items-center justify-center gap-2 rounded-lg bg-teal-300 px-3 text-xs font-bold text-slate-950 transition hover:bg-teal-200">Open application guide <ExternalLink className="h-3.5 w-3.5" /></Link>
                  <Link href="/quality-lab/planner?source=method-navigator" onClick={() => capture("method_navigator_blueprint_opened", { method_id: selected.id, coverage: selected.coverage })} className="mt-2 flex min-h-10 items-center justify-center gap-2 rounded-lg border border-teal-300/40 text-xs font-semibold text-slate-200 transition hover:bg-teal-300/10">Use in Blueprint <ArrowRight className="h-3.5 w-3.5" /></Link>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-amber-200">Coverage request</p>
                  <p className="mt-3 text-xs leading-5 text-slate-400">Assess the query against qualified demand, source access, SME ownership and validation evidence.</p>
                  <Link href={requestReviewHref} className="mt-4 flex min-h-10 items-center justify-center gap-2 rounded-lg bg-amber-300 px-3 text-xs font-bold text-slate-950">Request scoped review <ArrowRight className="h-3.5 w-3.5" /></Link>
                </>
              )}
            </article>
          </div>

        </section>

        <section className="mt-5 rounded-2xl border border-white/15 bg-[#08192c]/94 px-4 pb-3 pt-4 sm:px-5" aria-labelledby="coverage-radar-title">
          <div className="grid gap-5 xl:grid-cols-[1fr_23rem] xl:items-end">
            <div className="min-w-0 overflow-x-auto">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-teal-300">Coverage radar</p>
              <h2 id="coverage-radar-title" className="mt-1 text-lg font-bold">Applications in scope</h2>
              <p className="mt-1 text-[11px] text-slate-400">Bounded to the current eight non-sterile microbiology application records.</p>
              <div className="mt-4 grid min-w-[760px] grid-cols-8 gap-1" role="list" aria-label="Method applications">
                {METHOD_NAVIGATOR_RECORDS.map((record, index) => {
                  const active = record.id === selected.id && hasApplicationMatch;
                  return (
                    <button
                      key={record.id}
                      type="button"
                      onClick={() => chooseRecord(record)}
                      aria-pressed={active}
                      className={`group min-h-24 rounded-t-[2rem] border px-2 py-2 text-center transition hover:-translate-y-1 hover:border-teal-200/70 ${active ? "border-teal-200 bg-teal-300/15 shadow-[0_0_18px_rgba(45,212,191,.12)]" : coverageStyles[record.coverage]}`}
                      style={{ marginTop: `${radarOffsets[index]}px` }}
                    >
                      <span className="text-xs font-bold text-white">{index + 1}</span>
                      <RecordIcon record={record} className="mx-auto mt-1 h-4 w-4" />
                      <span className="mt-1.5 block text-[8px] font-semibold leading-[11px] text-slate-100">{record.title}</span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[9px] font-medium text-slate-400">
                <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-teal-300" /> Structured concept</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-sky-400" /> Source mapped</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-300" /> Evidence required</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-slate-600" /> Not covered</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 border-t border-white/10 pt-5 xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0">
              {[
                { value: METHOD_NAVIGATOR_RECORDS.length, label: "Methods", icon: FileSearch, tone: "text-teal-300" },
                { value: NAVIGATOR_STANDARDS.length, label: "Sources", icon: BookOpenText, tone: "text-sky-300" },
                { value: 0, label: "Approved", icon: ShieldCheck, tone: "text-amber-300" },
              ].map((metric) => (
                <div key={metric.label} aria-label={`${metric.value} ${metric.label.toLowerCase()}`} className="rounded-xl border border-white/15 bg-black/10 px-2 py-3 text-center">
                  <metric.icon className={`mx-auto h-5 w-5 ${metric.tone}`} />
                  <p className={`mt-2 text-3xl font-bold ${metric.tone}`}>{metric.value}</p>
                  <p className="mt-1 text-[9px] font-semibold uppercase tracking-wide text-slate-400">{metric.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="mt-2 flex items-center gap-3 rounded-xl border border-white/15 bg-[#08192c]/90 px-4 py-2 text-xs text-slate-400">
          <Info className="h-4 w-4 shrink-0 text-slate-300" />
          <p>Navigation and planning only — not a registered specification, site-approved method, or compliance determination.</p>
          <Sparkles className="ml-auto hidden h-4 w-4 text-teal-300 sm:block" />
        </footer>
      </div>
    </div>
  );
}
