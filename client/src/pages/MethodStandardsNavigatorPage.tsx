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
  "structured-concept": "border-teal-300/65 bg-teal-300/[0.12] text-teal-100",
  "source-mapped": "border-sky-400/65 bg-sky-400/[0.13] text-sky-100",
  "evidence-required": "border-amber-400/75 bg-amber-400/[0.14] text-amber-100",
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

const radarLabels: Record<string, string> = {
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
  { label: "Query", helper: "Ask the method question", icon: CircleHelp },
  { label: "Application match", helper: "Find the bounded record", icon: Crosshair },
  { label: "Coverage state", helper: "Expose maturity and gaps", icon: FileSearch },
  { label: "Named source access", helper: "Open current references", icon: BookOpenText },
  { label: "Decision use", helper: "Choose the next action", icon: Check },
];

const routeColumnClasses = ["lg:col-start-1", "lg:col-start-3", "lg:col-start-5", "lg:col-start-7", "lg:col-start-9"];

const radarGeometry = [
  { left: 1, top: 100, height: 142, angle: -28 },
  { left: 12.3, top: 58, height: 176, angle: -20 },
  { left: 23.6, top: 32, height: 194, angle: -12 },
  { left: 34.9, top: 16, height: 204, angle: -4 },
  { left: 46.2, top: 12, height: 208, angle: 4 },
  { left: 57.5, top: 24, height: 202, angle: 12 },
  { left: 68.8, top: 54, height: 180, angle: 20 },
  { left: 80.1, top: 92, height: 150, angle: 28 },
];

function findDefaultRecord() {
  return METHOD_NAVIGATOR_RECORDS.find((record) => record.id === "method-suitability-recovery") ?? METHOD_NAVIGATOR_RECORDS[0];
}

function RecordIcon({ record, className = "h-5 w-5" }: { record: MethodNavigatorRecord; className?: string }) {
  const Icon = applicationIcons[record.id] ?? FlaskConical;
  return <Icon className={className} />;
}

function CoverageRadar({ selected, onSelect }: { selected: MethodNavigatorRecord; onSelect: (record: MethodNavigatorRecord) => void }) {
  return (
    <section className="relative mt-5 hidden h-[257px] overflow-hidden rounded-2xl border border-white/[0.14] bg-[#07182a]/95 xl:block" aria-labelledby="coverage-radar-title">
      <div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: "url('/images/blueprint/decision-observatory-grid.jpg')", backgroundSize: "cover", backgroundPosition: "center 72%" }} />
      <div className="absolute left-5 top-5 z-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300">Coverage radar</p>
        <h2 id="coverage-radar-title" className="mt-1 text-lg font-bold text-white">Applications in scope</h2>
        <p className="mt-1 text-xs text-slate-400">Non-sterile microbiology</p>
      </div>

      <div className="absolute bottom-0 left-[5.2%] h-full w-[61.5%]" role="list" aria-label="Method applications">
        {METHOD_NAVIGATOR_RECORDS.map((record, index) => {
          const active = record.id === selected.id;
          const geometry = radarGeometry[index];
          return (
            <button
              key={record.id}
              type="button"
              onClick={() => onSelect(record)}
              aria-pressed={active}
              className={`group absolute w-[15%] overflow-hidden border px-2 pb-3 pt-3 text-center transition duration-200 hover:z-20 hover:brightness-125 focus-visible:z-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-200 ${coverageStyles[record.coverage]} ${active ? "z-10 brightness-125 shadow-[0_0_28px_rgba(45,212,191,.22)]" : ""}`}
              style={{
                left: `${geometry.left}%`,
                top: `${geometry.top}px`,
                height: `${geometry.height}px`,
                clipPath: "polygon(16% 0, 91% 0, 100% 100%, 0 100%)",
                borderRadius: "52px 52px 8px 8px",
                transform: `rotate(${geometry.angle}deg)`,
                transformOrigin: "50% 100%",
              }}
            >
              <span className="flex h-full flex-col items-center" style={{ transform: `rotate(${-geometry.angle}deg)` }}>
                <span className="block text-base font-bold text-white">{index + 1}</span>
                <RecordIcon record={record} className="mx-auto mt-1 h-7 w-7" />
                <span className="mx-auto mt-2 block max-w-[6.4rem] text-[10px] font-semibold leading-[12px] text-slate-100">{radarLabels[record.id] ?? record.title}</span>
              </span>
            </button>
          );
        })}

        <div className="absolute bottom-2 left-[24%] z-30 flex gap-5 whitespace-nowrap text-[10px] font-medium text-slate-400">
          <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-full border border-teal-200/60 bg-teal-300/30" /> Structured concept</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-full border border-sky-300/60 bg-sky-400/35" /> Source mapped</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-full border border-amber-300/60 bg-amber-400/35" /> Evidence required</span>
        </div>
      </div>

      <div className="absolute bottom-6 right-5 top-5 z-10 grid w-[28%] grid-cols-3 gap-4 border-l border-white/15 pl-7">
        {[
          { value: METHOD_NAVIGATOR_RECORDS.length, label: "Methods", icon: FileSearch, tone: "text-teal-300" },
          { value: NAVIGATOR_STANDARDS.length, label: "Sources", icon: BookOpenText, tone: "text-sky-300" },
          { value: 0, label: "Approved", icon: ShieldCheck, tone: "text-amber-300" },
        ].map((metric) => (
          <div key={metric.label} aria-label={`${metric.value} ${metric.label.toLowerCase()}`} className="flex flex-col items-center justify-center rounded-xl border border-white/20 bg-[#0a1c31]/80 text-center shadow-[inset_0_1px_0_rgba(255,255,255,.025)]">
            <metric.icon className={`h-9 w-9 ${metric.tone}`} strokeWidth={1.6} />
            <p className={`mt-2 text-[42px] font-medium leading-none ${metric.tone}`}>{metric.value}</p>
            <p className="mt-2 text-sm text-slate-300">{metric.label}</p>
          </div>
        ))}
      </div>
    </section>
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
    <div
      className="method-navigator-page relative min-h-[calc(100vh-4rem)] overflow-hidden bg-[#061426] text-slate-100"
      style={{ backgroundImage: "url('/images/blueprint/decision-observatory-grid.jpg')", backgroundColor: "#061426", backgroundBlendMode: "soft-light", backgroundSize: "cover", backgroundPosition: "center top" }}
    >
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[1490px] flex-col px-3 pb-3 pt-4 sm:px-9">
        <header>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-teal-300">Method &amp; Standards Navigator</p>
          <h1 className="mx-auto mt-3 max-w-[1240px] text-center text-3xl font-bold leading-tight sm:text-4xl lg:whitespace-nowrap lg:text-[40px]">
            Ask the method question. <span className="text-teal-300">See the evidence boundary.</span>
          </h1>
          <label className="relative mx-auto mt-7 block max-w-[44rem]">
            <span className="sr-only">Search methods and standards</span>
            <Search className="pointer-events-none absolute left-5 top-1/2 h-7 w-7 -translate-y-1/2 text-slate-200" strokeWidth={1.7} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-16 w-full rounded-xl border border-teal-300 bg-[#081a2e]/90 pl-16 pr-5 text-xl text-white shadow-[0_0_24px_rgba(45,212,191,.11),inset_0_1px_0_rgba(255,255,255,.025)] outline-none placeholder:text-slate-500 focus:border-teal-200 focus:ring-2 focus:ring-teal-300/20"
              placeholder="Try: bioburden, USP <85>, water, environmental monitoring…"
            />
          </label>
        </header>

        <section className="mt-8" aria-label="Method evidence route">
          <div className="relative hidden lg:grid lg:grid-cols-[15%_3.8%_16.5%_3.8%_17.5%_2.1%_19.6%_1.2%_19.5%]">
            <div aria-hidden="true" className="absolute left-[7.4%] right-[7.8%] top-[69px] border-t-2 border-teal-300/80 shadow-[0_0_12px_rgba(45,212,191,.38)]" />
            {[19.2, 38.5, 58.1, 78.4].map((left) => (
              <span key={left} aria-hidden="true" className="absolute top-[61px] z-20 flex h-[18px] w-[18px] items-center justify-center rounded-full border border-teal-200 bg-teal-300 text-[#061426] shadow-[0_0_12px_rgba(45,212,191,.35)]" style={{ left: `${left}%` }}>
                <ArrowRight className="h-3 w-3" strokeWidth={2.6} />
              </span>
            ))}
            {routeStages.map((stage, index) => {
              const Icon = stage.icon;
              const inactive = !hasApplicationMatch && index > 0;
              return (
                <div key={stage.label} className={`relative z-10 text-center ${routeColumnClasses[index]}`}>
                  <p className={`text-[11px] font-bold uppercase tracking-[0.13em] ${inactive ? "text-slate-600" : "text-teal-300"}`}>{index + 1}. {stage.label}</p>
                  <div className={`relative z-10 mx-auto mt-4 flex h-[80px] w-[80px] items-center justify-center rounded-full border bg-[#07182b] ${inactive ? "border-slate-700 text-slate-600" : "border-teal-300 text-slate-100 shadow-[0_0_22px_rgba(45,212,191,.2),inset_0_0_20px_rgba(45,212,191,.035)]"}`}>
                    <Icon className="h-10 w-10" strokeWidth={1.65} />
                  </div>
                  <span className="sr-only">{stage.helper}</span>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 gap-3 lg:mt-3 lg:grid-cols-[15%_3.8%_16.5%_3.8%_17.5%_2.1%_19.6%_1.2%_19.5%] lg:items-start lg:gap-0">
            <article className="min-h-[166px] rounded-xl border border-white/20 bg-[#0a1b30]/92 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,.02)] lg:col-start-1">
              <p className="text-[17px] font-semibold leading-7 text-white">{query.trim() || "All method applications"}</p>
              <p className="mt-2 text-[13px] leading-5 text-slate-400">{hasApplicationMatch ? selected.domain : "No bounded application record matched"}</p>
            </article>

            <article className={`min-h-[166px] rounded-xl border p-5 lg:col-start-3 ${hasApplicationMatch ? "border-teal-300/90 bg-teal-300/[0.065] shadow-[0_0_22px_rgba(45,212,191,.11),inset_0_0_22px_rgba(45,212,191,.025)]" : "border-amber-300/40 bg-amber-300/[0.04]"}`}>
              {hasApplicationMatch ? (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <RecordIcon record={selected} className="h-7 w-7 text-teal-100" />
                    <span className={`rounded-full border px-2 py-1 text-[8px] font-bold uppercase tracking-wide ${coverageStyles[selected.coverage]}`}>{coverageLabels[selected.coverage]}</span>
                  </div>
                  <h2 className="mt-4 text-[17px] font-bold leading-5">{selected.title}</h2>
                  <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-teal-300">{selected.domain}</p>
                </>
              ) : (
                <>
                  <CircleAlert className="h-7 w-7 text-amber-200" />
                  <h2 className="mt-4 text-lg font-bold">Not yet covered</h2>
                  <p className="mt-2 text-xs leading-5 text-slate-400">Atlas will not invent a method or silently infer applicability.</p>
                </>
              )}
            </article>

            <div className="lg:col-start-5">
              <article className="min-h-[180px] rounded-xl border border-white/20 bg-[#0a1b30]/92 p-5">
                <p className={`inline-flex items-center gap-2 text-[15px] font-semibold ${hasApplicationMatch ? "text-teal-200" : "text-slate-500"}`}><span className={`h-3.5 w-3.5 rounded-full ${hasApplicationMatch ? "bg-teal-300 shadow-[0_0_10px_rgba(45,212,191,.5)]" : "bg-slate-600"}`} />{hasApplicationMatch ? coverageLabels[selected.coverage] : "Not covered"}</p>
                <p className="mt-5 text-[24px] font-medium leading-none text-white">{hasApplicationMatch ? selected.unresolvedCount : "—"}</p>
                <p className="mt-2 text-[15px] text-slate-300">{hasApplicationMatch ? "unresolved dimensions" : "no application match"}</p>
                {hasApplicationMatch && <p className="mt-5 inline-flex items-center gap-2 text-[13px] font-semibold text-amber-300"><CircleAlert className="h-4 w-4" /> Evidence boundary</p>}
              </article>
              {hasApplicationMatch && (
                <div className="mt-3 flex min-h-[108px] items-start gap-3 rounded-xl border border-amber-400/65 bg-amber-400/[0.075] px-4 py-4 text-[11px] leading-[18px] text-amber-100/95">
                  <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                  <p>{selected.boundary}</p>
                </div>
              )}
            </div>

            <article className="min-h-[242px] rounded-xl border border-white/20 bg-[#0a1b30]/92 p-4 lg:col-start-7">
              <p className="text-[15px] font-semibold text-teal-200">{hasApplicationMatch ? "Open in these sources" : "Named source access"}</p>
              <div className="mt-3 space-y-2">
                {hasApplicationMatch ? selectedSources.map((source) => (
                  <a key={source.id} href={source.locator} target="_blank" rel="noreferrer" className="flex min-h-[51px] items-center gap-3 rounded-lg border border-white/10 bg-white/[0.025] px-3 py-2 text-[12px] font-medium leading-4 text-slate-100 transition hover:border-teal-300/40 hover:bg-teal-300/[0.055]">
                    <FileSearch className="h-5 w-5 shrink-0 text-slate-200" strokeWidth={1.5} />
                    <span className="flex-1">{source.title}</span>
                    <ExternalLink className="h-4 w-4 shrink-0 text-slate-400" />
                  </a>
                )) : <p className="pt-2 text-xs leading-5 text-slate-500">No source is asserted without an application match.</p>}
              </div>
            </article>

            <article className="min-h-[297px] rounded-xl border border-white/20 bg-[#0a1b30]/92 p-5 lg:col-start-9">
              {hasApplicationMatch ? (
                <>
                  <dl className="divide-y divide-white/15 text-[14px]">
                    <div className="flex justify-between gap-3 pb-3"><dt className="text-slate-200">Covered for planning:</dt><dd className="font-bold text-teal-200">Yes</dd></div>
                    <div className="flex justify-between gap-3 py-3"><dt className="text-slate-200">Site-approved:</dt><dd className="font-bold text-amber-300">No</dd></div>
                    <div className="flex justify-between gap-3 py-3"><dt className="text-slate-200">Qualified review:</dt><dd className="font-bold text-amber-300">Required</dd></div>
                  </dl>
                  <Link href={hrefWithSelection(selected.guideHref, "method-route")} className="mt-5 flex min-h-11 items-center justify-center gap-2 rounded-lg bg-teal-300 px-3 text-[14px] font-bold text-slate-950 shadow-[0_0_18px_rgba(45,212,191,.12)] transition hover:bg-teal-200">Open application guide <ExternalLink className="h-4 w-4" /></Link>
                  <Link href="/quality-lab/planner?source=method-navigator" onClick={() => capture("method_navigator_blueprint_opened", { method_id: selected.id, coverage: selected.coverage })} className="mt-3 flex min-h-11 items-center justify-center gap-2 rounded-lg border border-teal-300/65 text-[14px] font-medium text-slate-100 transition hover:bg-teal-300/10">Use in Blueprint <ArrowRight className="h-4 w-4" /></Link>
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

        <CoverageRadar selected={selected} onSelect={chooseRecord} />

        <section className="mt-5 rounded-2xl border border-white/15 bg-[#08192c]/94 px-4 py-4 xl:hidden" aria-label="Applications in scope">
          <h2 className="text-lg font-bold">Applications in scope</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {METHOD_NAVIGATOR_RECORDS.map((record, index) => (
              <button key={record.id} type="button" onClick={() => chooseRecord(record)} className={`flex min-h-14 items-center gap-3 rounded-xl border px-3 text-left ${coverageStyles[record.coverage]} ${record.id === selected.id ? "ring-2 ring-teal-200/60" : ""}`}>
                <span className="text-xs font-bold">{index + 1}</span>
                <RecordIcon record={record} className="h-5 w-5 shrink-0" />
                <span className="text-xs font-semibold">{record.title}</span>
              </button>
            ))}
          </div>
        </section>

        <footer className="mt-2 flex min-h-16 items-center gap-4 rounded-xl border border-white/15 bg-[#08192c]/90 px-5 text-[14px] text-slate-400">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.025]"><Info className="h-5 w-5 text-slate-300" /></span>
          <p>Navigation and planning only — not a registered specification, site-approved method, or compliance determination.</p>
        </footer>
      </div>
    </div>
  );
}
