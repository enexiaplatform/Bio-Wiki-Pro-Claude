import { useEffect, useMemo, useState } from "react";
import { Link, useRoute } from "wouter";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileSearch,
  GitBranch,
  History,
  ListChecks,
  Save,
  Target,
} from "lucide-react";
import {
  getQualityLabReadiness,
  priorityQualityLabActions,
  qualityLabDecisionMetrics,
  type QualityLabDecisionRecord,
  type QualityLabDecisionStatus,
  type QualityLabProject,
} from "@shared/quality-lab";
import { getQualityLabProject, subscribeToQualityLabProjects, updateQualityLabProjectDecision } from "@/lib/quality-lab-projects";
import { useSEO } from "@/hooks/use-seo";

const statusLabels: Record<QualityLabDecisionStatus, string> = {
  open: "Open",
  "evidence-required": "Evidence required",
  "ready-for-review": "Ready for review",
  "under-review": "Under review",
  decided: "Decision made",
  deferred: "Deferred",
  closed: "Closed",
};

const statusStyles: Record<QualityLabDecisionStatus, string> = {
  open: "border-sky-300/20 bg-sky-300/10 text-sky-100",
  "evidence-required": "border-amber-300/20 bg-amber-300/10 text-amber-100",
  "ready-for-review": "border-teal-300/20 bg-teal-300/10 text-teal-100",
  "under-review": "border-violet-300/20 bg-violet-300/10 text-violet-100",
  decided: "border-emerald-300/20 bg-emerald-300/10 text-emerald-100",
  deferred: "border-white/10 bg-white/[0.04] text-slate-300",
  closed: "border-slate-300/15 bg-slate-300/[0.06] text-slate-300",
};

function prettyDate(value: string) {
  if (!value) return "Not set";
  const date = value.length === 10 ? new Date(`${value}T00:00:00`) : new Date(value);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function DecisionEditor({ decision, onSave }: { decision: QualityLabDecisionRecord; onSave: (draft: QualityLabDecisionRecord) => void }) {
  const [draft, setDraft] = useState(decision);
  const [notice, setNotice] = useState("");

  useEffect(() => { setDraft(decision); setNotice(""); }, [decision]);

  const save = () => {
    onSave(draft);
    setNotice("Decision record saved in this project working copy.");
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-5 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className={`inline-flex rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${statusStyles[draft.status]}`}>{statusLabels[draft.status]}</span>
          <h3 className="mt-3 text-xl font-bold leading-8">{draft.question}</h3>
        </div>
        <span className="shrink-0 text-[10px] text-slate-600">{draft.sourceType === "project-mandate" ? "Project mandate" : "Blueprint decision gate"}</span>
      </div>

      <div className="mt-5 rounded-xl border border-teal-300/15 bg-teal-300/[0.045] p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-200">Current Atlas recommendation</p>
        <p className="mt-2 text-sm leading-6 text-slate-200">{draft.atlasRecommendation}</p>
        <p className="mt-2 text-xs leading-5 text-slate-500">{draft.rationale}</p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <label className="block"><span className="mb-2 block text-xs font-semibold text-slate-300">Owner role</span><input value={draft.ownerRole} onChange={(event) => setDraft({ ...draft, ownerRole: event.target.value })} className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm outline-none focus:border-teal-300/40" /></label>
        <label className="block"><span className="mb-2 block text-xs font-semibold text-slate-300">Target date</span><input type="date" value={draft.targetDate} onChange={(event) => setDraft({ ...draft, targetDate: event.target.value })} className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm outline-none focus:border-teal-300/40" /></label>
        <label className="block"><span className="mb-2 block text-xs font-semibold text-slate-300">Status</span><select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as QualityLabDecisionStatus })} className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm outline-none focus:border-teal-300/40">{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="block"><span className="mb-2 block text-xs font-semibold text-slate-300">Alternative considered</span><textarea value={draft.alternative} onChange={(event) => setDraft({ ...draft, alternative: event.target.value })} rows={3} placeholder="Record the material alternative, if any." className="w-full rounded-xl border border-white/10 bg-slate-950/60 p-3 text-sm leading-6 outline-none focus:border-teal-300/40" /></label>
        <label className="block"><span className="mb-2 block text-xs font-semibold text-slate-300">Final disposition and rationale</span><textarea value={draft.finalDisposition} onChange={(event) => setDraft({ ...draft, finalDisposition: event.target.value })} rows={3} placeholder="What was decided, by whom, and why?" className="w-full rounded-xl border border-white/10 bg-slate-950/60 p-3 text-sm leading-6 outline-none focus:border-teal-300/40" /></label>
      </div>

      <details className="mt-5 rounded-xl border border-violet-300/15 bg-violet-300/[0.035] p-4" open={Boolean(draft.outcome.observed)}>
        <summary className="cursor-pointer text-sm font-bold text-violet-100">Record an observed outcome</summary>
        <p className="mt-2 text-xs leading-5 text-slate-500">Capture estimate-to-actual learning after implementation. A learning candidate never changes a controlled rule automatically.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block"><span className="mb-2 block text-xs font-semibold text-slate-300">Atlas predicted</span><textarea value={draft.outcome.predicted} onChange={(event) => setDraft({ ...draft, outcome: { ...draft.outcome, predicted: event.target.value } })} rows={3} className="w-full rounded-xl border border-white/10 bg-slate-950/60 p-3 text-sm leading-6 outline-none focus:border-violet-300/40" /></label>
          <label className="block"><span className="mb-2 block text-xs font-semibold text-slate-300">Observed</span><textarea value={draft.outcome.observed} onChange={(event) => setDraft({ ...draft, outcome: { ...draft.outcome, observed: event.target.value } })} rows={3} placeholder="What actually happened?" className="w-full rounded-xl border border-white/10 bg-slate-950/60 p-3 text-sm leading-6 outline-none focus:border-violet-300/40" /></label>
          <label className="block"><span className="mb-2 block text-xs font-semibold text-slate-300">Variance explanation</span><textarea value={draft.outcome.varianceExplanation} onChange={(event) => setDraft({ ...draft, outcome: { ...draft.outcome, varianceExplanation: event.target.value } })} rows={3} placeholder="What explains the difference?" className="w-full rounded-xl border border-white/10 bg-slate-950/60 p-3 text-sm leading-6 outline-none focus:border-violet-300/40" /></label>
          <div className="grid gap-4">
            <label className="block"><span className="mb-2 block text-xs font-semibold text-slate-300">Outcome evidence reference</span><input value={draft.outcome.evidenceReference} onChange={(event) => setDraft({ ...draft, outcome: { ...draft.outcome, evidenceReference: event.target.value } })} placeholder="Controlled record ID or source locator" className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm outline-none focus:border-violet-300/40" /></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block"><span className="mb-2 block text-xs font-semibold text-slate-300">Observed date</span><input type="date" value={draft.outcome.observedAt} onChange={(event) => setDraft({ ...draft, outcome: { ...draft.outcome, observedAt: event.target.value } })} className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm outline-none focus:border-violet-300/40" /></label>
              <label className="block"><span className="mb-2 block text-xs font-semibold text-slate-300">Learning state</span><select value={draft.outcome.learningStatus} onChange={(event) => setDraft({ ...draft, outcome: { ...draft.outcome, learningStatus: event.target.value as QualityLabDecisionRecord["outcome"]["learningStatus"] } })} className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/60 px-2 text-xs outline-none focus:border-violet-300/40"><option value="not-assessed">Not assessed</option><option value="learning-candidate">Learning candidate</option><option value="reviewed-no-change">Reviewed — no change</option><option value="governed-change-proposed">Governed change proposed</option></select></label>
            </div>
          </div>
        </div>
      </details>

      <div className="mt-5 flex flex-col gap-3 border-t border-white/8 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] text-slate-500">{draft.blockerActionIds.length} blocking actions · {draft.evidenceIds.length} evidence references · {draft.lineageIds.length} lineage records</p>
        <button type="button" onClick={save} className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-300 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-teal-200"><Save className="h-4 w-4" /> Save decision record</button>
      </div>
      {notice && <p role="status" className="mt-3 text-xs text-teal-200">{notice}</p>}
    </div>
  );
}

export default function QualityLabDecisionWorkspacePage() {
  const [, params] = useRoute("/quality-lab/projects/:id/workspace");
  const projectId = params?.id ?? "";
  const [project, setProject] = useState<QualityLabProject | undefined>(() => getQualityLabProject(projectId));
  const [selectedDecisionId, setSelectedDecisionId] = useState("decision-project-mandate");
  useSEO({ title: project ? `${project.name} Decision Workspace` : "Quality Lab Decision Workspace", description: "Connect Quality Lab evidence, decisions, actions, outcomes and history." });

  useEffect(() => subscribeToQualityLabProjects(() => setProject(getQualityLabProject(projectId))), [projectId]);
  const readiness = project ? getQualityLabReadiness(project.blueprint) : null;
  const metrics = project ? qualityLabDecisionMetrics(project.decisionRegister) : null;
  const nextAction = project ? priorityQualityLabActions(project.actionPlan)[0] : undefined;
  const selectedDecision = project?.decisionRegister.decisions.find((decision) => decision.id === selectedDecisionId) ?? project?.decisionRegister.decisions[0];
  const history = useMemo(() => {
    if (!project) return [];
    return [
      ...project.decisionRegister.decisions.flatMap((decision) => decision.activity.map((event) => ({ ...event, subject: decision.question, source: "Decision" }))),
      ...project.actionPlan.actions.flatMap((action) => action.activity.map((event) => ({ ...event, subject: action.question, source: "Action" }))),
    ].sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
  }, [project]);

  if (!project || !readiness || !metrics) return <div className="mx-auto max-w-4xl px-4 py-16"><Link href="/quality-lab/projects" className="inline-flex items-center gap-2 text-sm font-bold text-teal-200"><ArrowLeft className="h-4 w-4" /> Back to projects</Link><div className="mt-8 rounded-2xl border border-amber-300/20 bg-amber-300/[0.05] p-6"><h1 className="text-xl font-bold">Project not found in this browser</h1><p className="mt-2 text-sm text-slate-400">Recover the account copy from the projects page, then open its decision workspace.</p></div></div>;

  return (
    <div className="min-h-screen bg-[#08111f] py-10 text-slate-100 md:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/quality-lab/projects" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white"><ArrowLeft className="h-4 w-4" /> All Quality Lab projects</Link>
          <Link href={`/quality-lab/projects/${project.id}`} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/5">Edit model inputs <ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>

        <header className="mt-6 rounded-3xl border border-teal-300/20 bg-gradient-to-br from-teal-300/[0.08] via-white/[0.035] to-transparent p-6 md:p-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-200">Quality Lab Decision Workspace</p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">{project.name}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{project.input.primaryDecision}</p>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
            {[[`${readiness.evidenceReadiness.score}%`, "evidence ready"], [String(metrics.openCount), "open decisions"], [String(metrics.evidenceRequiredCount), "need evidence"], [String(project.actionPlan.actions.filter((action) => action.status !== "resolved").length), "active actions"], [String(metrics.outcomeCount), "outcomes recorded"]].map(([value, label]) => <div key={label} className="rounded-xl border border-white/10 bg-slate-950/30 p-3"><strong className="text-xl text-teal-200">{value}</strong><p className="mt-1 text-[10px] text-slate-500">{label}</p></div>)}
          </div>
          <div className="mt-6 grid grid-cols-7 gap-1 text-center text-[9px] font-bold uppercase tracking-wide text-slate-500" aria-label="Project decision loop">{["Evidence", "Model", "Decisions", "Actions", "Review", "Outcomes", "Learning"].map((label, index) => <div key={label} className={`rounded-lg border px-1 py-2 ${index <= 3 ? "border-teal-300/15 bg-teal-300/[0.04] text-teal-100" : "border-white/8 bg-white/[0.02]"}`}>{label}</div>)}</div>
        </header>

        <nav className="sticky top-16 z-20 mt-5 flex gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-[#08111f]/95 p-2 backdrop-blur" aria-label="Workspace sections">{[["overview", "Overview"], ["evidence", "Evidence"], ["decisions", "Decisions"], ["actions", "Actions"], ["outcomes", "Outcomes"], ["history", "History"]].map(([id, label]) => <a key={id} href={`#${id}`} className="shrink-0 rounded-lg px-3 py-2 text-xs font-bold text-slate-400 hover:bg-white/5 hover:text-white">{label}</a>)}</nav>

        <section id="overview" className="scroll-mt-32 mt-6 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6"><div className="flex items-center gap-2 text-teal-200"><Target className="h-5 w-5" /><h2 className="font-bold">Current state</h2></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><div><p className="text-[10px] font-bold uppercase text-slate-600">Decision owner</p><p className="mt-1 text-sm font-semibold">{project.input.decisionOwnerRole.replaceAll("-", " ")}</p></div><div><p className="text-[10px] font-bold uppercase text-slate-600">Decision window</p><p className="mt-1 text-sm font-semibold">{project.input.decisionWindow.replaceAll("-", " ")}</p></div><div><p className="text-[10px] font-bold uppercase text-slate-600">Model completeness</p><p className="mt-1 text-sm font-semibold">{readiness.modelCompleteness.score}%</p></div><div><p className="text-[10px] font-bold uppercase text-slate-600">Decision readiness</p><p className="mt-1 text-sm font-semibold">{readiness.decisionReadiness.label}</p></div></div><p className="mt-5 border-t border-white/8 pt-4 text-xs leading-5 text-slate-500">Atlas is a concept decision-support workspace. Final approvals, electronic signatures and controlled records remain outside Atlas under the client quality system.</p></div>
          <div className="rounded-2xl border border-sky-300/20 bg-sky-300/[0.045] p-5 md:p-6"><div className="flex items-center gap-2 text-sky-200"><ListChecks className="h-5 w-5" /><h2 className="font-bold">Next best thing to resolve</h2></div>{nextAction ? <><p className="mt-4 text-sm font-bold leading-6">{nextAction.question}</p><p className="mt-2 text-xs leading-5 text-slate-400">{nextAction.requiredEvidence}</p><p className="mt-3 text-[10px] text-slate-500">Owner: {nextAction.ownerRole || "Unassigned"} · {nextAction.dueDate ? `due ${prettyDate(nextAction.dueDate)}` : "due date not set"}</p><Link href={`/quality-lab/projects/${project.id}#project-action-center`} className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-sky-200">Open action center <ArrowRight className="h-3.5 w-3.5" /></Link></> : <div className="mt-4 flex gap-3"><CheckCircle2 className="h-5 w-5 text-teal-300" /><p className="text-sm text-slate-300">No compiled-input action remains open. Qualified review is still required.</p></div>}</div>
        </section>

        <section id="evidence" className="scroll-mt-32 mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="flex gap-3"><FileSearch className="mt-0.5 h-5 w-5 text-amber-300" /><div><h2 className="font-bold">Evidence readiness</h2><p className="mt-1 text-xs text-slate-500">What Atlas has, what remains unresolved, and the action that will close each gap.</p></div></div><span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-bold text-amber-100">{project.blueprint.unresolvedInputs.length} requests</span></div><div className="mt-5 grid gap-3 md:grid-cols-2">{project.blueprint.unresolvedInputs.slice(0, 6).map((input) => { const action = project.actionPlan.actions.find((item) => item.sourceInputId === input.id); return <article key={input.id} className="rounded-xl border border-white/8 bg-slate-950/30 p-4"><div className="flex items-center justify-between gap-2"><span className={`text-[9px] font-bold uppercase ${input.severity === "blocking" ? "text-red-200" : input.severity === "important" ? "text-amber-200" : "text-slate-400"}`}>{input.severity}</span><span className="text-[9px] text-slate-600">{input.category}</span></div><p className="mt-2 text-sm font-bold leading-5">{input.question}</p><p className="mt-2 text-[11px] leading-5 text-slate-500">Needed: {input.resolution}</p><p className="mt-2 text-[10px] text-sky-200">Action: {action?.status.replaceAll("-", " ") ?? "not linked"}</p></article>; })}</div>{project.blueprint.unresolvedInputs.length > 6 && <p className="mt-3 text-[11px] text-slate-500">Showing 6 highest-level requests. The action center retains all {project.blueprint.unresolvedInputs.length} items.</p>}</section>

        <section id="decisions" className="scroll-mt-32 mt-6"><div className="mb-4 flex items-center gap-3"><ClipboardCheck className="h-6 w-6 text-teal-300" /><div><h2 className="text-xl font-bold">Decision register</h2><p className="text-xs text-slate-500">Recommendations become reviewable records with evidence, ownership, disposition and outcomes.</p></div></div><div className="grid gap-5 lg:grid-cols-[0.38fr_0.62fr]"><div className="space-y-2">{project.decisionRegister.decisions.map((decision) => <button key={decision.id} type="button" onClick={() => setSelectedDecisionId(decision.id)} className={`w-full rounded-xl border p-4 text-left transition ${selectedDecision?.id === decision.id ? "border-teal-300/35 bg-teal-300/[0.07]" : "border-white/10 bg-white/[0.025] hover:border-white/20"}`}><div className="flex items-center justify-between gap-2"><span className={`rounded-full border px-2 py-1 text-[8px] font-bold uppercase ${statusStyles[decision.status]}`}>{statusLabels[decision.status]}</span><span className="text-[9px] text-slate-600">{decision.blockerActionIds.length} blockers</span></div><p className="mt-2 text-xs font-bold leading-5">{decision.question}</p><p className="mt-2 text-[10px] text-slate-500">Owner: {decision.ownerRole || "Unassigned"}</p></button>)}</div>{selectedDecision && <DecisionEditor decision={selectedDecision} onSave={(draft) => { const updated = updateQualityLabProjectDecision(project.id, selectedDecision.id, { ownerRole: draft.ownerRole, targetDate: draft.targetDate, status: draft.status, alternative: draft.alternative, finalDisposition: draft.finalDisposition, decidedAt: draft.decidedAt, outcome: draft.outcome }); if (updated) setProject(updated); }} />}</div></section>

        <section id="actions" className="scroll-mt-32 mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6"><div className="flex items-center gap-3"><ListChecks className="h-5 w-5 text-sky-300" /><div><h2 className="font-bold">Decision-related actions</h2><p className="mt-1 text-xs text-slate-500">The existing action plan remains the single task layer; this workspace does not create a parallel project-management system.</p></div></div><div className="mt-5 space-y-2">{priorityQualityLabActions(project.actionPlan).slice(0, 5).map((action) => <article key={action.id} className="flex flex-col gap-3 rounded-xl border border-white/8 bg-slate-950/30 p-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-2"><span className={`text-[9px] font-bold uppercase ${action.severity === "blocking" ? "text-red-200" : "text-amber-200"}`}>{action.severity}</span><span className="text-[9px] text-slate-600">{action.status.replaceAll("-", " ")}</span></div><p className="mt-2 text-sm font-bold">{action.question}</p><p className="mt-1 text-[10px] text-slate-500">{action.ownerRole || "Unassigned"} · {action.dueDate ? prettyDate(action.dueDate) : "No due date"}</p></div><Link href={`/quality-lab/projects/${project.id}#project-action-center`} className="inline-flex shrink-0 items-center gap-2 text-xs font-bold text-sky-200">Update <ArrowRight className="h-3.5 w-3.5" /></Link></article>)}</div></section>

        <section id="outcomes" className="scroll-mt-32 mt-6 rounded-2xl border border-violet-300/15 bg-violet-300/[0.03] p-5 md:p-6"><div className="flex items-center gap-3"><BookOpenCheck className="h-5 w-5 text-violet-300" /><div><h2 className="font-bold">Outcomes and governed learning</h2><p className="mt-1 text-xs text-slate-500">Compare Atlas predictions with observations after implementation, then nominate—not enact—learning.</p></div></div><div className="mt-5 grid gap-3 md:grid-cols-2">{project.decisionRegister.decisions.filter((decision) => decision.outcome.observed).map((decision) => <article key={decision.id} className="rounded-xl border border-violet-300/10 bg-slate-950/30 p-4"><p className="text-xs font-bold">{decision.question}</p><p className="mt-3 text-[10px] font-bold uppercase text-slate-600">Observed</p><p className="mt-1 text-xs leading-5 text-slate-300">{decision.outcome.observed}</p><p className="mt-2 text-[10px] text-violet-200">{decision.outcome.learningStatus.replaceAll("-", " ")} · {prettyDate(decision.outcome.observedAt)}</p></article>)}{metrics.outcomeCount === 0 && <div className="md:col-span-2 rounded-xl border border-dashed border-white/10 p-6 text-center"><Clock3 className="mx-auto h-5 w-5 text-slate-600" /><p className="mt-2 text-sm font-bold">No observed outcomes yet</p><p className="mt-1 text-xs text-slate-500">Open a decision above after implementation to record estimate-to-actual evidence.</p></div>}</div></section>

        <section id="history" className="scroll-mt-32 mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6"><div className="flex items-center gap-3"><History className="h-5 w-5 text-slate-300" /><div><h2 className="font-bold">Working history</h2><p className="mt-1 text-xs text-slate-500">Decision and action events preserved in this project working copy. Account saves add revisioned snapshots.</p></div></div><div className="mt-5 space-y-2">{history.slice(0, 12).map((event) => <article key={event.id} className="flex gap-3 rounded-xl border border-white/8 bg-slate-950/25 p-3"><GitBranch className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" /><div><p className="text-[10px] font-bold uppercase text-slate-500">{event.source} · {event.type.replaceAll("-", " ")} · {new Date(event.recordedAt).toLocaleString()}</p><p className="mt-1 text-xs font-semibold text-slate-300">{event.subject}</p><p className="mt-1 text-[11px] text-slate-500">{event.summary}</p></div></article>)}</div><p className="mt-4 text-[10px] leading-5 text-slate-600"><AlertTriangle className="mr-1 inline h-3.5 w-3.5" />This is inspectable application history, not an electronic signature, immutable audit trail or controlled approval record.</p></section>
      </div>
    </div>
  );
}
