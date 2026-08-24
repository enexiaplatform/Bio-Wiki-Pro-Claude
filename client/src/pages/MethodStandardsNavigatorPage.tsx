import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  BookOpen,
  CircleAlert,
  CircleCheck,
  CircleHelp,
  Crosshair,
  ExternalLink,
  FileSearch,
  FileText,
  FlaskConical,
  Info,
  Microscope,
  Search,
  ShieldCheck,
  TestTube2,
  Waves,
  type LucideIcon,
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

const coverageTone: Record<NavigatorCoverage, string> = {
  "structured-concept": "text-teal-300",
  "source-mapped": "text-sky-300",
  "evidence-required": "text-amber-300",
};

const applicationIcons: Record<string, LucideIcon> = {
  "water-microbiology": FlaskConical,
  "growth-promotion-media-qc": TestTube2,
  "bioburden-filtration": FileSearch,
  "specified-microorganisms": ShieldCheck,
  "method-suitability-recovery": Crosshair,
  "bet-lal": TestTube2,
  "environmental-monitoring": Waves,
  "microbial-identification": Microscope,
};

const conciseApplicationLabels: Record<string, string> = {
  "water-microbiology": "Pharma water microbiology",
  "growth-promotion-media-qc": "Growth promotion & media QC",
  "bioburden-filtration": "Bioburden & membrane filtration",
  "specified-microorganisms": "Specified organisms & objectionability",
  "method-suitability-recovery": "Method suitability & recovery",
  "bet-lal": "Bacterial endotoxins (BET/LAL)",
  "environmental-monitoring": "Environmental monitoring",
  "microbial-identification": "Microbial identification",
};

const routeStages = [
  { label: "Query", icon: CircleHelp },
  { label: "Application match", icon: Crosshair },
  { label: "Coverage state", icon: FileText },
  { label: "Named sources", icon: BookOpen },
  { label: "Decision use", icon: CircleCheck },
];

function findDefaultRecord() {
  return METHOD_NAVIGATOR_RECORDS.find((record) => record.id === "method-suitability-recovery") ?? METHOD_NAVIGATOR_RECORDS[0];
}

function RecordIcon({ record, className = "h-5 w-5" }: { record: MethodNavigatorRecord; className?: string }) {
  const Icon = applicationIcons[record.id] ?? FlaskConical;
  return <Icon className={className} strokeWidth={1.55} />;
}

function ApplicationIndex({ selectedId, onSelect }: { selectedId?: string; onSelect: (record: MethodNavigatorRecord) => void }) {
  return (
    <section aria-labelledby="applications-title" className="min-w-0 lg:pr-5 xl:pr-7">
      <h2 id="applications-title" className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300">Applications in scope</h2>
      <p className="mt-1 text-sm text-slate-400">Non-sterile microbiology</p>

      <div className="mt-4 border-y border-slate-700/70" role="list" aria-label="Method applications">
        {METHOD_NAVIGATOR_RECORDS.map((record, index) => {
          const active = selectedId === record.id;
          return (
            <button
              key={record.id}
              type="button"
              onClick={() => onSelect(record)}
              aria-pressed={active}
              aria-label={record.title}
              className={`group relative flex min-h-[48px] w-full items-center gap-3 border-b border-slate-700/70 px-3 text-left transition-colors last:border-b-0 focus-visible:z-10 ${active ? "bg-teal-300/[0.075] text-white" : "text-slate-300 hover:bg-white/[0.025] hover:text-white"}`}
            >
              {active && <span aria-hidden="true" className="absolute inset-y-0 left-0 w-0.5 bg-teal-300" />}
              <RecordIcon record={record} className={`h-[18px] w-[18px] shrink-0 ${active ? "text-teal-200" : "text-slate-400"}`} />
              <span className="w-4 shrink-0 text-center text-[11px] font-medium text-slate-400">{index + 1}</span>
              <span className={`min-w-0 flex-1 text-[12px] leading-4 xl:text-[13px] ${active ? "font-semibold" : "font-medium"}`}>{conciseApplicationLabels[record.id] ?? record.title}</span>
              <span aria-label={coverageLabels[record.coverage]} className={`h-2.5 w-2.5 shrink-0 rounded-full border ${active ? "border-teal-200 bg-teal-300" : record.coverage === "evidence-required" ? "border-amber-300/80" : record.coverage === "source-mapped" ? "border-sky-300/80" : "border-slate-400/70"}`} />
            </button>
          );
        })}
      </div>
    </section>
  );
}

function Metric({ value, label, icon: Icon }: { value: number; label: string; icon: LucideIcon }) {
  return (
    <div aria-label={`${value} ${label.toLowerCase()}`} className="flex min-w-[120px] items-center gap-4 px-5 py-4 sm:min-w-[170px] lg:px-7">
      <Icon className="h-6 w-6 shrink-0 text-slate-300" strokeWidth={1.45} />
      <div>
        <p className="font-display text-[30px] font-medium leading-none text-white">{value}</p>
        <p className="mt-1 text-[12px] text-slate-400">{label}</p>
      </div>
    </div>
  );
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
    <div className="method-navigator-page min-h-[calc(100vh-4rem)] bg-[#030c19] text-slate-100">
      <main className="mx-auto max-w-[1490px] px-5 pb-7 pt-6 sm:px-8 lg:px-9">
        <header className="max-w-[780px]">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-300">Method &amp; Standards Navigator</p>
          <h1 className="mt-5 max-w-[760px] text-[34px] font-bold leading-[1.08] sm:text-[42px] lg:text-[46px]">
            Ask the method question.<br />
            See the <span className="text-teal-300">evidence boundary.</span>
          </h1>
          <label className="relative mt-7 block max-w-[748px]">
            <span className="sr-only">Search methods and standards</span>
            <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-300" strokeWidth={1.6} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-[56px] w-full rounded-md border border-teal-300/70 bg-[#061322] pl-14 pr-5 text-[16px] text-white outline-none transition placeholder:text-slate-500 hover:border-teal-200/80 focus:border-teal-200 focus:ring-2 focus:ring-teal-300/15"
              placeholder="Try: bioburden, USP <85>, water, environmental monitoring…"
            />
          </label>
        </header>

        <section className="mt-6 border-b border-slate-700/80 pb-5" aria-label="Method evidence route">
          <div className="grid gap-3 sm:grid-cols-5 sm:gap-0">
            {routeStages.map((stage, index) => {
              const Icon = stage.icon;
              const inactive = !hasApplicationMatch && index > 0;
              return (
                <div key={stage.label} className={`relative flex items-center gap-2.5 px-1 text-[12px] sm:justify-center sm:px-3 ${inactive ? "text-slate-600" : "text-slate-300"}`}>
                  {index > 0 && <span aria-hidden="true" className="absolute right-full hidden w-[28%] border-t border-slate-600 sm:block xl:w-[38%]" />}
                  <Icon className={`h-5 w-5 shrink-0 ${inactive ? "text-slate-600" : "text-slate-300"}`} strokeWidth={1.45} />
                  <span>{stage.label}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid border-b border-slate-700/80 py-7 lg:grid-cols-[32%_36%_32%]" aria-label="Method evidence dossier">
          <ApplicationIndex selectedId={hasApplicationMatch ? selected.id : undefined} onSelect={chooseRecord} />

          <section className="mt-8 min-w-0 border-y border-slate-700/80 py-7 lg:mt-0 lg:border-y-0 lg:border-x lg:px-7 xl:px-8" aria-labelledby="selected-application-title">
            {hasApplicationMatch ? (
              <>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300">Selected application</p>
                <h2 id="selected-application-title" className="mt-4 max-w-[430px] text-[25px] font-bold leading-[1.2] text-white lg:text-[27px]">{selected.title}</h2>

                <dl className="mt-6 grid gap-5 border-b border-slate-700/70 pb-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-[11px] text-slate-500">Domain</dt>
                    <dd className="mt-1 text-[13px] text-slate-300">{selected.domain}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-slate-500">Status</dt>
                    <dd className={`mt-1 text-[13px] ${coverageTone[selected.coverage]}`}>{coverageLabels[selected.coverage]}</dd>
                  </div>
                </dl>

                <div className="pt-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300">Coverage state</p>
                  <p className="mt-3 flex items-baseline gap-3 text-slate-200"><strong className="font-display text-[32px] font-medium text-white">{selected.unresolvedCount}</strong><span className="text-[15px]">unresolved dimensions</span></p>
                  <p className="mt-3 inline-flex items-center gap-2 text-[13px] font-semibold text-amber-300"><CircleAlert className="h-4 w-4" strokeWidth={1.7} />Evidence boundary</p>
                </div>

                <div className="mt-5 flex items-start gap-3 rounded-md border border-amber-400/70 px-4 py-4 text-[12px] leading-5 text-amber-100">
                  <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" strokeWidth={1.7} />
                  <p>{selected.boundary}</p>
                </div>
              </>
            ) : (
              <div className="flex min-h-[390px] flex-col justify-center">
                <CircleAlert className="h-6 w-6 text-amber-300" strokeWidth={1.6} />
                <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300">No bounded record</p>
                <h2 id="selected-application-title" className="mt-3 text-2xl font-bold">Not yet covered</h2>
                <p className="mt-3 max-w-sm text-sm leading-6 text-slate-400">Atlas will not invent a method or silently infer applicability. Request a scoped review to assess the query against qualified evidence.</p>
              </div>
            )}
          </section>

          <section className="mt-8 min-w-0 lg:mt-0 lg:pl-7 xl:pl-8" aria-labelledby="named-sources-title">
            <p id="named-sources-title" className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300">Named sources</p>
            {hasApplicationMatch && <p className="mt-1 text-[11px] text-slate-500">Open in {selectedSources.length} named sources</p>}
            <div className="mt-3 border-y border-slate-700/70">
              {hasApplicationMatch ? selectedSources.map((source) => (
                <a key={source.id} href={source.locator} target="_blank" rel="noreferrer" className="group flex min-h-[53px] items-center gap-3 border-b border-slate-700/70 px-3 py-2 text-[12px] font-medium leading-4 text-slate-200 transition-colors last:border-b-0 hover:bg-white/[0.025] hover:text-white">
                  <FileText className="h-5 w-5 shrink-0 text-slate-400 transition group-hover:text-teal-200" strokeWidth={1.45} />
                  <span className="flex-1">{source.title}</span>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-500" strokeWidth={1.5} />
                </a>
              )) : <p className="px-3 py-5 text-xs leading-5 text-slate-500">No source is asserted without an application match.</p>}
            </div>

            <div className="mt-5 border-t border-slate-700/70 pt-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300">Decision use</p>
              {hasApplicationMatch ? (
                <>
                  <dl className="mt-2 divide-y divide-slate-700/70 text-[13px]">
                    <div className="flex justify-between gap-3 py-2.5"><dt className="text-slate-300">Covered for planning:</dt><dd className="font-semibold text-teal-300">Yes</dd></div>
                    <div className="flex justify-between gap-3 py-2.5"><dt className="text-slate-300">Site-approved:</dt><dd className="font-semibold text-amber-300">No</dd></div>
                    <div className="flex justify-between gap-3 py-2.5"><dt className="text-slate-300"><span>Qualified review</span><span aria-hidden="true">:</span></dt><dd className="font-semibold text-amber-300">Required</dd></div>
                  </dl>
                  <Link href={hrefWithSelection(selected.guideHref, "method-route")} className="mt-4 flex min-h-10 items-center justify-center gap-2 rounded-md bg-teal-300 px-4 text-[13px] font-bold text-slate-950 transition hover:bg-teal-200">Open application guide <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.8} /></Link>
                  <Link href="/quality-lab/planner?source=method-navigator" onClick={() => capture("method_navigator_blueprint_opened", { method_id: selected.id, coverage: selected.coverage })} className="mt-2.5 flex min-h-10 items-center justify-center gap-2 rounded-md border border-teal-300/65 px-4 text-[13px] font-medium text-slate-100 transition hover:bg-teal-300/[0.06]">Use in Blueprint <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.8} /></Link>
                </>
              ) : (
                <>
                  <p className="mt-3 text-xs leading-5 text-slate-400">Assess the query against demand, source access, SME ownership and validation evidence.</p>
                  <Link href={requestReviewHref} className="mt-4 flex min-h-10 items-center justify-center gap-2 rounded-md bg-amber-300 px-3 text-xs font-bold text-slate-950">Request scoped review <ArrowRight className="h-3.5 w-3.5" /></Link>
                </>
              )}
            </div>
          </section>
        </section>

        <footer className="mt-4 flex flex-col border border-slate-700/80 sm:flex-row sm:items-stretch">
          <div className="flex shrink-0 divide-x divide-slate-700/80">
            <Metric value={METHOD_NAVIGATOR_RECORDS.length} label="Methods" icon={FileText} />
            <Metric value={NAVIGATOR_STANDARDS.length} label="Sources" icon={BookOpen} />
            <Metric value={0} label="Approved" icon={ShieldCheck} />
          </div>
          <div className="flex min-h-[78px] flex-1 items-center gap-4 border-t border-slate-700/80 px-6 py-4 text-[12px] leading-5 text-slate-400 sm:border-l sm:border-t-0 lg:px-9">
            <Info className="h-5 w-5 shrink-0 text-slate-400" strokeWidth={1.45} />
            <p>Navigation and planning only — not a registered specification, site-approved method, or compliance determination.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
