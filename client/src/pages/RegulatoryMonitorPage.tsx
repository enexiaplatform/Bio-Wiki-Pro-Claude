import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { AlertTriangle, ArrowRight, BellRing, Check, ExternalLink, RefreshCw, Rss, ShieldCheck } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { capture } from "@/hooks/use-analytics";
import { useSEO } from "@/hooks/use-seo";
import {
  REGULATORY_SOURCES,
  filterRegulatoryUpdates,
  regulatoryDomainValues,
  type RegulatoryCadence,
  type RegulatoryDigestPreferenceInput,
  type RegulatoryDomain,
  type RegulatorySourceId,
  type RegulatoryUpdate,
} from "@shared/regulatory-monitor";

interface MonitorResponse {
  generatedAt: string;
  items: RegulatoryUpdate[];
  sources: Array<{ id: RegulatorySourceId; ok: boolean; itemCount: number; error?: string }>;
}

const domainLabels: Record<RegulatoryDomain, string> = {
  "nonsterile-microbiology": "Non-sterile microbiology",
  "water-environmental-monitoring": "Water & EM",
  "sterile-biologics": "Sterile & biologics",
  "analytical-chemistry": "Analytical chemistry",
  "quality-systems": "Quality systems",
  "data-integrity": "Data integrity",
};

const priorityStyle = {
  "priority-review": "border-rose-300/25 bg-rose-300/10 text-rose-200",
  review: "border-amber-300/25 bg-amber-300/10 text-amber-200",
  watch: "border-sky-300/25 bg-sky-300/10 text-sky-200",
} as const;

const emptyPreference: RegulatoryDigestPreferenceInput = { cadence: "off", domains: [], sources: [] };

function toggleValue<T extends string>(values: T[], value: T) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

export default function RegulatoryMonitorPage() {
  const { isPro, isAuthenticated } = useUser();
  const [monitor, setMonitor] = useState<MonitorResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<RegulatoryDomain | "all">("all");
  const [preference, setPreference] = useState<RegulatoryDigestPreferenceInput>(emptyPreference);
  const [preferenceNotice, setPreferenceNotice] = useState("");
  const [saving, setSaving] = useState(false);

  useSEO({ title: "Regulatory Change Monitor | Life Science Atlas", description: "Follow official FDA and EMA source updates with bounded, transparent impact triage for regulated manufacturing quality." });

  async function loadMonitor() {
    setLoading(true); setLoadError("");
    try {
      const response = await fetch("/api/regulatory-updates");
      if (!response.ok) throw new Error("Official-source feeds are unavailable");
      setMonitor(await response.json());
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Official-source feeds are unavailable");
    } finally { setLoading(false); }
  }

  useEffect(() => { void loadMonitor(); }, []);
  useEffect(() => {
    if (!isPro || !isAuthenticated) return;
    fetch("/api/regulatory-preference", { credentials: "include" }).then(async (response) => {
      if (!response.ok) throw new Error("Watchlist unavailable");
      return response.json();
    }).then((result) => setPreference({ cadence: result.cadence, domains: result.domains, sources: result.sources })).catch(() => setPreferenceNotice("Account watchlist is unavailable until database setup is complete."));
  }, [isAuthenticated, isPro]);

  const visibleItems = useMemo(() => {
    if (!monitor) return [];
    return selectedDomain === "all" ? monitor.items : filterRegulatoryUpdates(monitor.items, { domains: [selectedDomain], sources: [] });
  }, [monitor, selectedDomain]);

  async function savePreference() {
    setSaving(true); setPreferenceNotice("");
    try {
      const response = await fetch("/api/regulatory-preference", { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(preference) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? "Watchlist could not be saved");
      setPreferenceNotice(preference.cadence === "off" ? "Regulatory digest turned off." : `${preference.cadence === "daily" ? "Daily" : "Weekly"} impact digest enabled.`);
      capture("regulatory_digest_preference_saved", { cadence: preference.cadence, domain_count: preference.domains.length, source_count: preference.sources.length });
    } catch (err) { setPreferenceNotice(err instanceof Error ? err.message : "Watchlist could not be saved"); }
    finally { setSaving(false); }
  }

  return <div className="min-h-screen bg-[#07182d] px-4 pb-24 pt-8 text-slate-100 md:pt-14"><div className="mx-auto max-w-7xl">
    <header className="rounded-3xl border border-sky-300/20 bg-gradient-to-br from-sky-300/10 via-slate-950 to-teal-300/5 p-6 md:p-9"><div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between"><div><p className="inline-flex items-center gap-2 rounded-full border border-sky-300/25 bg-sky-300/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-sky-200"><Rss className="h-4 w-4" /> Official-source monitor</p><h1 className="mt-5 max-w-4xl text-4xl font-bold leading-tight md:text-6xl">Changes mapped to quality decisions—not a generic news feed.</h1><p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400">Atlas checks focused FDA and EMA feeds, then applies deterministic topic and impact triage. The official publication remains authoritative and every impact label still requires human applicability review.</p></div><button type="button" onClick={() => void loadMonitor()} disabled={loading} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-bold disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh sources</button></div><div className="mt-6 rounded-xl border border-amber-300/15 bg-amber-300/[0.05] p-4 text-xs leading-6 text-slate-400"><AlertTriangle className="mr-2 inline h-4 w-4 text-amber-200" />Machine triage is not regulatory advice, an approved interpretation, a change-control trigger, or proof that a publication applies to your product, market or site.</div></header>

    <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{REGULATORY_SOURCES.map((source) => { const status=monitor?.sources.find((candidate) => candidate.id === source.id); return <a key={source.id} href={source.landingUrl} target="_blank" rel="noreferrer" className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:border-sky-300/25"><div className="flex items-center justify-between"><p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">{source.publisher} · {source.market}</p><span className={`h-2.5 w-2.5 rounded-full ${status?.ok ? "bg-teal-300" : status ? "bg-rose-300" : "bg-slate-600"}`} /></div><p className="mt-2 text-xs font-bold leading-5 text-slate-200">{source.label}</p><p className="mt-2 text-[10px] text-slate-600">{status ? `${status.itemCount} current feed items` : "Awaiting refresh"}</p></a>; })}</section>

    <div className="mt-7 flex items-center gap-2 overflow-x-auto pb-2">{(["all", ...regulatoryDomainValues] as const).map((domain) => <button type="button" key={domain} onClick={() => { setSelectedDomain(domain); capture("regulatory_monitor_filtered", { domain }); }} className={`shrink-0 rounded-xl border px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider ${selectedDomain === domain ? "border-sky-300/35 bg-sky-300/10 text-sky-200" : "border-white/10 text-slate-500"}`}>{domain === "all" ? "All impact areas" : domainLabels[domain]}</button>)}</div>

    {loadError ? <section className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-300/[0.05] p-6"><p className="font-bold text-rose-200">{loadError}</p><p className="mt-2 text-xs leading-6 text-slate-500">No cached feed item is presented as current while the official sources are unavailable.</p></section> : loading ? <section className="mt-4 rounded-2xl border border-white/10 p-10 text-center text-sm text-slate-500">Refreshing official feeds…</section> : <section className="mt-4 grid gap-4 lg:grid-cols-2">{visibleItems.map((item) => <article key={item.id} className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.035] p-5"><div className="flex flex-wrap items-center justify-between gap-3"><span className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase ${priorityStyle[item.impactLevel]}`}>{item.impactLevel.replaceAll("-", " ")}</span><span className="text-[10px] text-slate-600">{new Date(item.publishedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span></div><p className="mt-4 text-[10px] font-bold uppercase tracking-[0.15em] text-sky-300">{item.publisher} · {item.sourceLabel}</p><h2 className="mt-2 text-lg font-bold leading-7">{item.title}</h2><div className="mt-3 flex flex-wrap gap-1.5">{item.domains.map((domain) => <span key={domain} className="rounded-full border border-white/10 px-2 py-1 text-[9px] text-slate-500">{domainLabels[domain]}</span>)}</div><p className="mt-4 flex-1 text-xs leading-6 text-slate-400">{item.impactNote}</p><div className="mt-4 flex items-center justify-between gap-3 border-t border-white/8 pt-4"><span className="text-[9px] font-bold uppercase tracking-wider text-amber-200/70">{item.documentStatus.replaceAll("-", " ")} · machine triaged</span><a href={item.url} target="_blank" rel="noreferrer" onClick={() => capture("regulatory_source_opened", { item_id: item.id, source_id: item.sourceId, impact_level: item.impactLevel })} className="inline-flex items-center gap-2 text-xs font-bold text-sky-300">Official source <ExternalLink className="h-4 w-4" /></a></div></article>)}</section>}

    <section className="mt-10 rounded-3xl border border-sky-300/20 bg-slate-950/50 p-6 md:p-8"><div className="grid gap-7 lg:grid-cols-[0.75fr_1.25fr]"><div><BellRing className="h-7 w-7 text-sky-300" /><p className="mt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-sky-300">Atlas Pro watchlist</p><h2 className="mt-2 text-2xl font-bold">Receive impact, not noise.</h2><p className="mt-3 text-sm leading-7 text-slate-400">Weekly is the recommended cadence. Daily is an explicit opt-in for narrow watchlists. Atlas sends nothing when no matching official-source update is found.</p>{!isPro && <Link href="/pricing#evidence-plans" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-sky-300 px-5 py-3 text-sm font-bold text-slate-950">Start Pro <ArrowRight className="h-4 w-4" /></Link>}</div>
      <div className={!isPro ? "pointer-events-none select-none opacity-45" : ""}><div className="grid grid-cols-3 gap-2">{(["off", "weekly", "daily"] as RegulatoryCadence[]).map((cadence) => <button type="button" key={cadence} onClick={() => setPreference((current) => ({ ...current, cadence }))} className={`rounded-xl border p-3 text-xs font-bold ${preference.cadence === cadence ? "border-sky-300/35 bg-sky-300/10 text-sky-200" : "border-white/10 text-slate-500"}`}>{cadence === "off" ? "Off" : cadence === "weekly" ? "Weekly (recommended)" : "Daily opt-in"}</button>)}</div><p className="mt-5 text-[10px] font-bold uppercase tracking-wider text-slate-500">Impact areas · none selected means all</p><div className="mt-2 flex flex-wrap gap-2">{regulatoryDomainValues.map((domain) => <button type="button" key={domain} onClick={() => setPreference((current) => ({ ...current, domains: toggleValue(current.domains, domain) }))} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-[10px] font-semibold ${preference.domains.includes(domain) ? "border-teal-300/30 bg-teal-300/10 text-teal-200" : "border-white/10 text-slate-500"}`}>{preference.domains.includes(domain) && <Check className="h-3 w-3" />}{domainLabels[domain]}</button>)}</div><p className="mt-5 text-[10px] font-bold uppercase tracking-wider text-slate-500">Official sources · none selected means all</p><div className="mt-2 flex flex-wrap gap-2">{REGULATORY_SOURCES.map((source) => <button type="button" key={source.id} onClick={() => setPreference((current) => ({ ...current, sources: toggleValue(current.sources, source.id) }))} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-[10px] font-semibold ${preference.sources.includes(source.id) ? "border-sky-300/30 bg-sky-300/10 text-sky-200" : "border-white/10 text-slate-500"}`}>{preference.sources.includes(source.id) && <Check className="h-3 w-3" />}{source.publisher} · {source.label}</button>)}</div><button type="button" disabled={!isPro || saving} onClick={() => void savePreference()} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-sky-300 px-5 py-3 text-sm font-bold text-slate-950 disabled:opacity-50"><ShieldCheck className="h-4 w-4" />{saving ? "Saving…" : "Save opt-in watchlist"}</button>{preferenceNotice && <p role="status" className="mt-3 text-xs leading-5 text-slate-400">{preferenceNotice}</p>}</div></div></section>
  </div></div>;
}
