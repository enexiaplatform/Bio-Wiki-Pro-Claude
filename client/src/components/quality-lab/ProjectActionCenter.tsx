import { useEffect, useMemo, useState } from "react";
import { CalendarClock, CheckCircle2, ChevronDown, CircleDotDashed, ClipboardList, UserRound } from "lucide-react";
import type { QualityLabProject, QualityLabProjectAction } from "@shared/quality-lab";
import { priorityQualityLabActions, qualityLabActionPlanMetrics, qualityLabProjectStage } from "@shared/quality-lab";
import { updateQualityLabProjectAction, type QualityLabProjectActionPatch } from "@/lib/quality-lab-projects";
import { analytics } from "@/hooks/use-analytics";
import { getQualityLabReminderAttribution } from "@/lib/quality-lab-reminder-attribution";

const statusOptions: Array<{ value: Exclude<QualityLabProjectAction["status"], "resolved">; label: string }> = [
  { value: "open", label: "Open" },
  { value: "in-progress", label: "In progress" },
  { value: "ready-for-review", label: "Ready for review" },
];

const stageCopy = {
  "awaiting-inputs": { label: "Awaiting project inputs", className: "border-amber-300/20 bg-amber-300/10 text-amber-100" },
  "ready-for-review": { label: "Ready to request review", className: "border-teal-300/20 bg-teal-300/10 text-teal-100" },
  "review-requested": { label: "Review requested", className: "border-sky-300/20 bg-sky-300/10 text-sky-100" },
};

const severityClass = {
  blocking: "border-red-300/20 bg-red-300/10 text-red-100",
  important: "border-amber-300/20 bg-amber-300/10 text-amber-100",
  advisory: "border-sky-300/20 bg-sky-300/10 text-sky-100",
};

function ActionEditor({ action, projectId, onUpdated, prominent = false }: { action: QualityLabProjectAction; projectId: string; onUpdated: (project: QualityLabProject) => void; prominent?: boolean }) {
  function apply(patch: QualityLabProjectActionPatch, field: string) {
    const updated = updateQualityLabProjectAction(projectId, action.id, patch);
    if (!updated) return;
    const updatedAction = updated.actionPlan.actions.find((item) => item.id === action.id);
    const attribution = getQualityLabReminderAttribution();
    analytics.projectActionUpdated(projectId, action.id, field, updatedAction?.status ?? action.status, attribution?.source, attribution?.attributionAgeMinutes);
    onUpdated(updated);
  }

  return (
    <article className={`${prominent ? "border-teal-300/25 bg-teal-300/[0.055]" : "border-white/10 bg-slate-950/30"} rounded-2xl border p-4 md:p-5`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {prominent && <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-200">Next action</span>}
            <span className={`rounded-full border px-2 py-1 text-[9px] font-bold uppercase tracking-wider ${severityClass[action.severity]}`}>{action.severity}</span>
            <span className="text-[10px] uppercase tracking-wider text-slate-500">{action.category}</span>
          </div>
          <h3 className={`${prominent ? "text-lg" : "text-base"} mt-3 font-bold text-white`}>{action.question}</h3>
          <p className="mt-2 text-xs leading-5 text-slate-400"><strong className="text-slate-200">Required evidence:</strong> {action.requiredEvidence}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500"><strong className="text-slate-300">Decision impact:</strong> {action.impact}</p>
        </div>
        {action.status === "resolved" ? (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1.5 text-[10px] font-bold uppercase text-teal-100"><CheckCircle2 className="h-3.5 w-3.5" /> Resolved by recompile</span>
        ) : (
          <label className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Status
            <select aria-label={`Status for ${action.question}`} value={action.status} onChange={(event) => apply({ status: event.target.value as QualityLabProjectAction["status"] }, "status")} className="mt-1 block rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-xs font-semibold normal-case tracking-normal text-white outline-none focus:border-teal-300/50">
              {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        )}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Owner role
          <div className="relative mt-1"><UserRound className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-600" /><input aria-label={`Owner role for ${action.question}`} defaultValue={action.ownerRole} onBlur={(event) => apply({ ownerRole: event.target.value.trim() }, "owner_role")} className="h-9 w-full rounded-lg border border-white/10 bg-slate-950/60 pl-9 pr-3 text-xs text-white outline-none focus:border-teal-300/50" /></div>
        </label>
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Due date
          <div className="relative mt-1"><CalendarClock className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-600" /><input type="date" aria-label={`Due date for ${action.question}`} defaultValue={action.dueDate} onBlur={(event) => apply({ dueDate: event.target.value }, "due_date")} className="h-9 w-full rounded-lg border border-white/10 bg-slate-950/60 pl-9 pr-3 text-xs text-white outline-none focus:border-teal-300/50" /></div>
        </label>
      </div>

      <label className="mt-3 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
        Evidence note or reference
        <textarea aria-label={`Evidence note for ${action.question}`} defaultValue={action.evidenceNote} onBlur={(event) => apply({ evidenceNote: event.target.value.trim() }, "evidence_note")} rows={prominent ? 3 : 2} placeholder="Record the controlled source, document reference, decision owner, or what is still missing." className="mt-1 w-full resize-y rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-xs font-normal normal-case tracking-normal text-white outline-none placeholder:text-slate-600 focus:border-teal-300/50" />
      </label>

      <p className="mt-3 text-[10px] leading-4 text-slate-600">Latest activity: {action.activity[action.activity.length - 1]?.summary} · {new Date(action.updatedAt).toLocaleString()}</p>
    </article>
  );
}

export function ProjectActionCenter({ project }: { project: QualityLabProject }) {
  const [currentProject, setCurrentProject] = useState(project);
  const [registerOpen, setRegisterOpen] = useState(false);
  const metrics = useMemo(() => qualityLabActionPlanMetrics(currentProject.actionPlan), [currentProject.actionPlan]);
  const priorityActions = useMemo(() => priorityQualityLabActions(currentProject.actionPlan), [currentProject.actionPlan]);
  const nextAction = priorityActions[0];
  const remainingActions = currentProject.actionPlan.actions.filter((action) => action.id !== nextAction?.id);
  const stage = qualityLabProjectStage(currentProject.actionPlan, currentProject.reviewRequestedAt);
  const stageDetails = stageCopy[stage];

  useEffect(() => {
    analytics.projectActionCenterViewed(project.id, metrics.activeCount, metrics.blockingCount);
  }, [project.id]);

  useEffect(() => setCurrentProject(project), [project.id, project.updatedAt]);

  return (
    <section id="project-action-center" className="scroll-mt-28 rounded-2xl border border-teal-300/20 bg-gradient-to-br from-teal-300/[0.07] via-white/[0.03] to-transparent p-5 shadow-lg shadow-black/10 md:p-6 print:hidden" aria-labelledby="project-action-center-title">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-teal-200"><ClipboardList className="h-5 w-5" /><p className="text-[10px] font-bold uppercase tracking-[0.18em]">Project action center</p></div>
          <h2 id="project-action-center-title" className="mt-2 text-2xl font-bold">Move the Blueprint toward qualified review.</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">Actions come directly from unresolved Blueprint inputs. Update ownership, timing and evidence here; the item closes automatically only when recompiling removes its source blocker.</p>
        </div>
        <span className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${stageDetails.className}`}><CircleDotDashed className="h-3.5 w-3.5" /> {stageDetails.label}</span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-slate-950/30 p-3"><strong className="block text-lg text-white">{metrics.activeCount}</strong><span className="text-[10px] text-slate-500">active actions</span></div>
        <div className="rounded-xl border border-red-300/15 bg-red-300/[0.04] p-3"><strong className="block text-lg text-red-200">{metrics.blockingCount}</strong><span className="text-[10px] text-slate-500">blocking</span></div>
        <div className="rounded-xl border border-sky-300/15 bg-sky-300/[0.04] p-3"><strong className="block text-lg text-sky-200">{metrics.inProgressCount}</strong><span className="text-[10px] text-slate-500">in progress</span></div>
        <div className="rounded-xl border border-teal-300/15 bg-teal-300/[0.04] p-3"><strong className="block text-lg text-teal-200">{metrics.readyForReviewCount}</strong><span className="text-[10px] text-slate-500">ready for review</span></div>
      </div>

      <div className="mt-5">
        {nextAction ? <ActionEditor action={nextAction} projectId={currentProject.id} onUpdated={setCurrentProject} prominent /> : <div className="rounded-2xl border border-teal-300/20 bg-teal-300/[0.055] p-5"><div className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal-300" /><div><h3 className="font-bold">No compiled input actions remain open.</h3><p className="mt-1 text-xs leading-5 text-slate-400">Qualified review is still required before controlled use. Recompile after any input change to keep this action register aligned.</p></div></div></div>}
      </div>

      {remainingActions.length > 0 && <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/20">
        <button type="button" aria-expanded={registerOpen} onClick={() => setRegisterOpen((value) => !value)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-xs font-bold text-slate-300 hover:text-white"><span>{registerOpen ? "Hide" : "Show"} full action register · {remainingActions.length} more</span><ChevronDown className={`h-4 w-4 transition ${registerOpen ? "rotate-180" : ""}`} /></button>
        {registerOpen && <div className="space-y-3 border-t border-white/10 p-3 md:p-4">{remainingActions.map((action) => <ActionEditor key={action.id} action={action} projectId={currentProject.id} onUpdated={setCurrentProject} />)}</div>}
      </div>}

      {currentProject.reviewRequestedAt && <p className="mt-4 text-[10px] leading-5 text-sky-200/70">This browser action plan may be newer than the securely saved review snapshot. Account storage changes only through an explicit secure review save.</p>}
    </section>
  );
}
