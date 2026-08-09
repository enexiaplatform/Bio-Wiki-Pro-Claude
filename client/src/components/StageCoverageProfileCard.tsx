import { Link } from "wouter";
import { AlertTriangle, ArrowRight, BookOpenCheck, Radio, ShieldCheck } from "lucide-react";

import { getConnectionsForSelection, getResourceStage, getResourceSystem, type ResourceArea } from "@/data/resourceConnections";
import { useResourceSelection } from "@/hooks/use-resource-selection";
import { capture } from "@/hooks/use-analytics";

const areaMeta = {
  methods: { eyebrow: "Stage method profile", icon: BookOpenCheck, action: "Use this scope in Blueprint" },
  compliance: { eyebrow: "Stage compliance profile", icon: ShieldCheck, action: "Request expert applicability review" },
  monitor: { eyebrow: "Stage change-watch context", icon: Radio, action: "Review Blueprint impact" },
} as const;

const statusLabel = {
  mapped: "Mapped",
  "evidence-required": "Evidence required",
  "specialist-review-required": "Specialist review required",
  "no-current-change": "No relevant current change",
} as const;

export function StageCoverageProfileCard({ area }: { area: Extract<ResourceArea, "methods" | "compliance" | "monitor"> }) {
  const { selection } = useResourceSelection();
  const system = getResourceSystem(selection.systemId);
  const stage = getResourceStage(selection);
  const profile = getConnectionsForSelection(selection, area).find((connection) => connection.kind === (area === "methods" ? "method" : area === "compliance" ? "compliance" : "monitor"));
  if (!system || !stage || !profile) return null;
  const meta = areaMeta[area];
  const Icon = meta.icon;

  return (
    <section className="mt-5 overflow-hidden rounded-2xl border border-teal-300/20 bg-gradient-to-br from-teal-300/[0.07] via-white/[0.025] to-transparent" aria-label={`${stage.title} ${area} profile`}>
      <div className="grid lg:grid-cols-[1.25fr_0.75fr]">
        <div className="p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300"><Icon className="h-4 w-4" /> {meta.eyebrow}</p><h2 className="mt-2 text-xl font-bold text-slate-100">{profile.title}</h2><p className="mt-1 text-xs text-slate-500">{system.shortTitle} · {stage.title}</p></div><span className="rounded-full border border-amber-300/20 bg-amber-300/[0.06] px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-amber-200">{statusLabel[profile.coverageStatus]}</span></div>
          <p className="mt-4 text-sm leading-7 text-slate-300">{profile.purpose}</p>
          <div className="mt-4 rounded-xl border border-white/10 bg-black/15 p-4"><p className="text-[9px] font-bold uppercase tracking-wider text-slate-600">Applicability</p><p className="mt-2 text-xs leading-6 text-slate-400">{profile.applicability}</p></div>
          <div className="mt-4 flex flex-wrap gap-2">{profile.sourceIds.map((sourceId) => <span key={sourceId} className="rounded-full border border-white/10 px-2.5 py-1 text-[9px] font-semibold text-slate-400">{sourceId}</span>)}</div>
        </div>
        <aside className="border-t border-white/10 bg-black/15 p-5 lg:border-l lg:border-t-0 md:p-6"><p className="text-[9px] font-bold uppercase tracking-wider text-slate-600">Required reviewer</p><p className="mt-2 text-sm font-semibold leading-6 text-sky-200">{profile.reviewerRole}</p><div className="mt-4 rounded-xl border border-amber-300/15 bg-amber-300/[0.04] p-3 text-xs leading-6 text-slate-400"><AlertTriangle className="mr-2 inline h-4 w-4 text-amber-200" />{profile.limitations}</div><Link href="/quality-lab/planner?source=resource-stage-profile" onClick={() => capture("resource_blueprint_transition", { area, system_id: system.id, stage_id: stage.id, status: profile.coverageStatus })} className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-teal-300 px-4 text-sm font-bold text-slate-950">{meta.action}<ArrowRight className="h-4 w-4" /></Link></aside>
      </div>
    </section>
  );
}
