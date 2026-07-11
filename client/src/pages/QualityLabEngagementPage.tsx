import { FormEvent, useMemo, useState } from "react";
import { Link, useRoute } from "wouter";
import { ArrowLeft, CheckCircle2, ClipboardCheck, Download, Plus, ShieldCheck } from "lucide-react";
import { useSEO } from "@/hooks/use-seo";
import { analytics } from "@/hooks/use-analytics";
import { getQualityLabProject } from "@/lib/quality-lab-projects";
import { downloadEngagement, getOrCreateEngagement, saveEngagement, setEngagementActual } from "@/lib/quality-lab-engagements";
import type { QualityLabEngagementPacket } from "@shared/quality-lab-engagement";

const inputClass = "w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-teal-300/50";
const baselineLabels: Record<keyof QualityLabEngagementPacket["baseline"], string> = { monthlyTests: "Monthly tests", teamFte: "Team FTE", areaSqm: "Area (m²)", capexLowUsd: "CAPEX low (USD)", capexHighUsd: "CAPEX high (USD)" };

export default function QualityLabEngagementPage() {
  const [, params] = useRoute("/quality-lab/engagements/:id");
  const project = params?.id ? getQualityLabProject(params.id) : undefined;
  const initial = useMemo(() => project ? getOrCreateEngagement(project) : null, [project]);
  const [packet, setPacket] = useState(initial);
  const [correction, setCorrection] = useState({ fieldOrRuleId: "", previousValue: "", correctedValue: "", evidenceRef: "", rationale: "", reviewerRole: "" });
  const [decision, setDecision] = useState({ decision: "", rationale: "", owner: "", downstreamImpact: "", options: "" });
  useSEO({ title: "Blueprint Engagement Workspace", description: "Resolve evidence, record corrections and capture project decisions for an Atlas Quality Lab Blueprint.", noIndex: true });

  if (!project || !packet) return <div className="mx-auto max-w-2xl px-4 py-20 text-center"><h1 className="text-2xl font-bold">Engagement project not found</h1><Link href="/quality-lab/projects" className="mt-5 inline-block text-teal-300">Open saved projects</Link></div>;

  function persist(next: QualityLabEngagementPacket) { setPacket(saveEngagement(next)); }
  function addCorrection(event: FormEvent) {
    event.preventDefault();
    persist({ ...packet!, corrections: [...packet!.corrections, { id: `cor_${Date.now().toString(36)}`, recordedAt: new Date().toISOString(), ...correction }] });
    setCorrection({ fieldOrRuleId: "", previousValue: "", correctedValue: "", evidenceRef: "", rationale: "", reviewerRole: "" });
  }
  function addDecision(event: FormEvent) {
    event.preventDefault();
    persist({ ...packet!, decisions: [...packet!.decisions, { id: `dec_${Date.now().toString(36)}`, recordedAt: new Date().toISOString(), decision: decision.decision, rationale: decision.rationale, owner: decision.owner, downstreamImpact: decision.downstreamImpact, optionsConsidered: decision.options.split("\n").map((v) => v.trim()).filter(Boolean) }] });
    setDecision({ decision: "", rationale: "", owner: "", downstreamImpact: "", options: "" });
  }
  const resolved = packet.checklist.filter((item) => item.status === "resolved" || item.status === "not-applicable").length;

  return <div className="min-h-screen bg-[#08111f] px-4 pb-24 pt-8 text-slate-100">
    <div className="mx-auto max-w-6xl">
      <Link href={`/quality-lab/projects/${project.id}`} className="inline-flex items-center gap-2 text-sm text-slate-400"><ArrowLeft className="h-4 w-4" /> Back to blueprint</Link>
      <header className="mt-6 rounded-3xl border border-teal-300/20 bg-gradient-to-br from-teal-300/10 to-slate-950 p-6 md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-300">Service-assisted delivery · browser-local</p><h1 className="mt-2 text-3xl font-bold md:text-4xl">{project.name}</h1><p className="mt-3 text-sm text-slate-400">{packet.packetVersion} · {resolved}/{packet.checklist.length} review items resolved</p></div><button onClick={() => { downloadEngagement(packet); analytics.engagementPacketDownloaded("engagement_workspace", packet.checklist.length - resolved); }} className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-300 px-4 py-3 text-sm font-bold text-slate-950"><Download className="h-4 w-4" /> Export working packet</button></div>
        <div className="mt-5 flex gap-3 rounded-xl border border-amber-300/15 bg-amber-300/[0.05] p-4 text-xs leading-5 text-slate-400"><ShieldCheck className="h-5 w-5 shrink-0 text-amber-300" /> This workspace records review work; it does not approve the Blueprint. Controlled approval remains under the client quality system.</div>
      </header>

      <section className="mt-5 rounded-2xl border border-white/10 bg-white/[0.035] p-5"><h2 className="text-xl font-bold">Estimate-to-actual baseline</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{(Object.keys(packet.baseline) as Array<keyof typeof packet.baseline>).map((key) => { const item=packet.baseline[key]; return <label key={key} className="rounded-xl border border-white/8 bg-black/15 p-3 text-xs text-slate-400"><span className="font-semibold text-slate-200">{baselineLabels[key]}</span><span className="mt-2 block">Estimate: {item.estimate.toLocaleString()}</span><input aria-label={`${baselineLabels[key]} actual`} type="number" min="0" step="any" value={item.actual ?? ""} onChange={(e) => setPacket(setEngagementActual(packet, key, e.target.value === "" ? null : Number(e.target.value)))} className={`${inputClass} mt-2`} placeholder="Actual" /><span className="mt-2 block text-teal-200">Variance: {item.variancePercent === null ? "open" : `${item.variancePercent}%`}</span></label>; })}</div></section>

      <section className="mt-5 rounded-2xl border border-white/10 bg-white/[0.035] p-5"><div className="flex items-center gap-3"><ClipboardCheck className="h-5 w-5 text-teal-300"/><h2 className="text-xl font-bold">Evidence and review checklist</h2></div><div className="mt-4 space-y-3">{packet.checklist.map((item) => <article key={item.id} className="rounded-xl border border-white/8 bg-black/15 p-4"><div className="grid gap-3 md:grid-cols-[1fr_180px]"><div><p className="text-sm font-bold">{item.question}</p><p className="mt-2 text-xs leading-5 text-slate-400"><strong>Evidence:</strong> {item.requiredEvidence}</p><p className="mt-1 text-[11px] text-slate-500">Owner: {item.ownerRole}</p></div><select aria-label={`Status for ${item.question}`} value={item.status} onChange={(e) => persist({ ...packet, checklist: packet.checklist.map((row) => row.id === item.id ? { ...row, status: e.target.value as typeof row.status } : row) })} className={inputClass}><option value="open">Open</option><option value="in-review">In review</option><option value="resolved">Resolved</option><option value="not-applicable">Not applicable</option></select></div><textarea aria-label={`Reviewer note for ${item.question}`} value={item.reviewerNote} onChange={(e) => persist({ ...packet, checklist: packet.checklist.map((row) => row.id === item.id ? { ...row, reviewerNote: e.target.value } : row) })} className={`${inputClass} mt-3`} rows={2} placeholder="Reviewer note and evidence reference" /></article>)}</div></section>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <form onSubmit={addCorrection} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><h2 className="text-xl font-bold">Correction log</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{([['fieldOrRuleId','Field or rule ID'],['previousValue','Previous value'],['correctedValue','Corrected value'],['evidenceRef','Evidence reference'],['reviewerRole','Reviewer role']] as const).map(([key,label])=><label key={key} className="text-xs text-slate-400">{label}<input required value={correction[key]} onChange={(e)=>setCorrection({...correction,[key]:e.target.value})} className={`${inputClass} mt-1`}/></label>)}</div><label className="mt-3 block text-xs text-slate-400">Rationale<textarea required value={correction.rationale} onChange={(e)=>setCorrection({...correction,rationale:e.target.value})} className={`${inputClass} mt-1`} rows={3}/></label><button className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-bold"><Plus className="h-4 w-4"/> Add correction</button><p className="mt-3 text-xs text-slate-500">{packet.corrections.length} corrections recorded</p></form>
        <form onSubmit={addDecision} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><h2 className="text-xl font-bold">Decision log</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{([['decision','Decision'],['owner','Decision owner'],['downstreamImpact','Downstream impact']] as const).map(([key,label])=><label key={key} className="text-xs text-slate-400">{label}<input required value={decision[key]} onChange={(e)=>setDecision({...decision,[key]:e.target.value})} className={`${inputClass} mt-1`}/></label>)}</div><label className="mt-3 block text-xs text-slate-400">Options considered (one per line)<textarea required value={decision.options} onChange={(e)=>setDecision({...decision,options:e.target.value})} className={`${inputClass} mt-1`} rows={2}/></label><label className="mt-3 block text-xs text-slate-400">Rationale<textarea required value={decision.rationale} onChange={(e)=>setDecision({...decision,rationale:e.target.value})} className={`${inputClass} mt-1`} rows={3}/></label><button className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-bold"><Plus className="h-4 w-4"/> Add decision</button><p className="mt-3 flex items-center gap-2 text-xs text-slate-500"><CheckCircle2 className="h-3.5 w-3.5"/>{packet.decisions.length} decisions recorded</p></form>
      </div>
    </div>
  </div>;
}
