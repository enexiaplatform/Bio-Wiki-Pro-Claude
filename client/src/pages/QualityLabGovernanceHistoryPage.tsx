import { useEffect, useState } from "react";
import { ArrowLeft, GitCompareArrows, History, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { useUser } from "@/context/UserContext";
import { useSEO } from "@/hooks/use-seo";
import { fetchAccountGovernanceRevision, fetchAccountGovernanceRevisions } from "@/lib/quality-lab-governance";
import { compareQualityLabGovernanceSnapshots, type QualityLabGovernanceChange, type QualityLabGovernanceKey } from "@shared/quality-lab-governance";

type HistoryState = { revisions: Array<{ revisionNumber: number; createdAt: string }>; changes: QualityLabGovernanceChange[]; notice: string };
const emptyState = (): HistoryState => ({ revisions: [], changes: [], notice: "" });

export default function QualityLabGovernanceHistoryPage() {
  const { isAuthenticated } = useUser();
  const [source, setSource] = useState<HistoryState>(emptyState);
  const [ownership, setOwnership] = useState<HistoryState>(emptyState);
  const [ruleChanges, setRuleChanges] = useState<HistoryState>(emptyState);
  useSEO({ title: "Governance Revision History | Atlas Quality Lab", description: "Inspect account-held working-record revisions for source closure and expert ownership.", noIndex: true });

  useEffect(() => {
    if (!isAuthenticated) return;
    const load = async (recordKey: QualityLabGovernanceKey, setState: (state: HistoryState) => void) => {
      try {
        const revisions = await fetchAccountGovernanceRevisions(recordKey);
        if (revisions.length < 2) return setState({ revisions, changes: [], notice: revisions.length ? "One revision exists; save a material change to enable comparison." : "No account-held revision exists yet." });
        const [before, after] = await Promise.all([fetchAccountGovernanceRevision(recordKey, revisions.at(-2)!.revisionNumber), fetchAccountGovernanceRevision(recordKey, revisions.at(-1)!.revisionNumber)]);
        setState({ revisions, changes: compareQualityLabGovernanceSnapshots(before, after), notice: "Comparing the two latest revisions." });
      } catch { setState({ revisions: [], changes: [], notice: "Revision history could not be loaded." }); }
    };
    load("source-closures", setSource);
    load("expert-ownership", setOwnership);
    load("rule-changes", setRuleChanges);
  }, [isAuthenticated]);

  return <div className="min-h-screen bg-[#08111f] px-4 pb-24 pt-8 text-slate-100 md:pt-14"><div className="mx-auto max-w-6xl">
    <Link href="/quality-lab/gate-2-release" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft className="h-4 w-4" /> Gate 2 release control</Link>
    <section className="mt-6 rounded-3xl border border-violet-300/20 bg-violet-300/[0.04] p-6 md:p-8"><div className="flex gap-4"><History className="h-7 w-7 shrink-0 text-violet-300" /><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-200">Account governance trail</p><h1 className="mt-2 text-3xl font-bold">Working-record changes should be inspectable.</h1><p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">Review append-only source and ownership revisions and compare the two latest snapshots. This trail is not an electronic signature, approval history, or document-control system.</p></div></div></section>
    {!isAuthenticated ? <section className="mt-6 rounded-3xl border border-amber-300/20 bg-amber-300/[0.04] p-6"><h2 className="font-bold">Sign in to inspect account revisions</h2><p className="mt-2 text-sm text-slate-400">Browser-local working records remain available in their control workspaces.</p><Link href="/login?returnTo=/quality-lab/governance-history" className="mt-4 inline-flex rounded-xl bg-amber-300 px-4 py-3 text-xs font-bold text-slate-950">Sign in</Link></section> : <div className="mt-6 grid gap-5"><HistoryPanel title="Source closure revisions" state={source} /><HistoryPanel title="Expert ownership revisions" state={ownership} /><HistoryPanel title="Rule-change revisions" state={ruleChanges} /></div>}
    <section className="mt-6 rounded-2xl border border-white/10 bg-black/15 p-5"><div className="flex gap-3"><ShieldCheck className="h-5 w-5 text-teal-300" /><p className="text-xs leading-6 text-slate-400">Revision comparison exposes recorded field changes only. It does not determine whether the underlying evidence, reviewer, appointment or acceptance is valid.</p></div></section>
  </div></div>;
}

function HistoryPanel({ title, state }: { title: string; state: HistoryState }) {
  return <section className="rounded-3xl border border-white/10 bg-slate-950/40 p-5 md:p-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="text-xl font-bold">{title}</h2><p className="mt-1 text-xs text-slate-500">{state.notice}</p></div><span className="w-fit rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1 text-[10px] font-bold text-violet-200">{state.revisions.length} revision{state.revisions.length === 1 ? "" : "s"}</span></div>
    {state.revisions.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{state.revisions.map((revision) => <span key={revision.revisionNumber} className="rounded-lg border border-white/10 px-2 py-1 text-[10px] text-slate-400">r{revision.revisionNumber} · {new Date(revision.createdAt).toLocaleString()}</span>)}</div>}
    {state.changes.length > 0 && <div className="mt-5 overflow-hidden rounded-2xl border border-white/10"><div className="flex items-center gap-2 border-b border-white/10 px-4 py-3 text-xs font-bold text-slate-200"><GitCompareArrows className="h-4 w-4 text-teal-300" /> Latest material changes</div><div className="divide-y divide-white/8">{state.changes.slice(0, 30).map((change) => <div key={change.path} className="grid gap-2 px-4 py-3 text-xs md:grid-cols-[1fr_1fr_1fr]"><code className="break-all text-violet-200">{change.path}</code><span className="break-all text-rose-200/80">{formatValue(change.before)}</span><span className="break-all text-teal-200/80">{formatValue(change.after)}</span></div>)}</div>{state.changes.length > 30 && <p className="border-t border-white/10 px-4 py-3 text-[10px] text-slate-500">+ {state.changes.length - 30} additional changes omitted from this view.</p>}</div>}
  </section>;
}

function formatValue(value: unknown) { return value === undefined ? "—" : typeof value === "string" ? value || "(empty)" : JSON.stringify(value); }
