import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BellRing,
  Building2,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  CloudDownload,
  Copy,
  FileText,
  FlaskConical,
  GitCompareArrows,
  Plus,
  Trash2,
  Users,
  Wrench,
} from "lucide-react";
import {
  priorityQualityLabActions,
  qualityLabActionPlanMetrics,
  qualityLabPortfolioQueueMetrics,
  qualityLabPortfolioWorkQueue,
  qualityLabProjectStage,
  type QualityLabActionTiming,
  type QualityLabProject,
} from "@shared/quality-lab";
import {
  deleteQualityLabProject,
  deleteQualityLabReviewedProjectSnapshot,
  duplicateQualityLabProject,
  fetchQualityLabReviewedProjectRevisions,
  fetchQualityLabReviewedProjects,
  fetchQualityLabReminderPreference,
  listQualityLabProjects,
  restoreQualityLabReviewedProject,
  saveQualityLabReminderPreference,
  subscribeToQualityLabProjects,
  type QualityLabReminderCadence,
} from "@/lib/quality-lab-projects";
import { useSEO } from "@/hooks/use-seo";
import { useUser } from "@/context/UserContext";
import { analytics } from "@/hooks/use-analytics";
import type { QualityLabReviewedProjectSnapshot } from "@shared/quality-lab-persistence";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 });
type ReviewedProjectStatus = { revisionCount: number; lastSyncedAt: string | null };
const projectStageLabels = {
  "awaiting-inputs": "Awaiting inputs",
  "ready-for-review": "Ready for review",
  "review-requested": "Review requested",
};
const timingDetails: Record<QualityLabActionTiming, { label: string; className: string }> = {
  overdue: { label: "Overdue", className: "border-red-300/20 bg-red-300/10 text-red-100" },
  "due-soon": { label: "Due within 7 days", className: "border-amber-300/20 bg-amber-300/10 text-amber-100" },
  scheduled: { label: "Scheduled", className: "border-sky-300/20 bg-sky-300/10 text-sky-100" },
  unscheduled: { label: "Needs a due date", className: "border-white/10 bg-white/[0.04] text-slate-300" },
};

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function displayDueDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function QualityLabProjectsPage() {
  useSEO({ title: "Quality Lab Projects", description: "Saved Atlas Quality Lab Blueprint scenarios on this device." });
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useUser();
  const [projects, setProjects] = useState<QualityLabProject[]>([]);
  const [reviewedProjects, setReviewedProjects] = useState<QualityLabReviewedProjectSnapshot[]>([]);
  const [reviewedProjectStatuses, setReviewedProjectStatuses] = useState<Record<string, ReviewedProjectStatus>>({});
  const [deletingSnapshotId, setDeletingSnapshotId] = useState<string | null>(null);
  const [snapshotActionError, setSnapshotActionError] = useState("");
  const [reminderCadence, setReminderCadence] = useState<QualityLabReminderCadence>("off");
  const [reminderSaving, setReminderSaving] = useState(false);
  const [reminderStatus, setReminderStatus] = useState("");
  const projectsWithBlockingInputs = projects.filter((project) => project.blueprint.dataQuality.blockingOpenCount > 0).length;
  const averageCompleteness = projects.length
    ? Math.round(projects.reduce((sum, project) => sum + project.blueprint.dataQuality.completenessPercent, 0) / projects.length)
    : 0;
  const activeProjectActions = projects.reduce((sum, project) => sum + qualityLabActionPlanMetrics(project.actionPlan).activeCount, 0);
  const workQueue = qualityLabPortfolioWorkQueue(projects, localDateKey());
  const workQueueMetrics = qualityLabPortfolioQueueMetrics(workQueue);
  const visibleWorkQueue = workQueue.slice(0, 5);

  const refresh = () => setProjects(listQualityLabProjects());
  useEffect(() => {
    refresh();
    return subscribeToQualityLabProjects(refresh);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setReviewedProjects([]);
      setReviewedProjectStatuses({});
      return;
    }
    let active = true;
    fetchQualityLabReviewedProjects()
      .then(async (snapshots) => {
        const statuses = await Promise.all(snapshots.map(async (snapshot) => {
          const revisions = await fetchQualityLabReviewedProjectRevisions(snapshot.localProjectId);
          return [snapshot.localProjectId, { revisionCount: revisions.length, lastSyncedAt: revisions[revisions.length - 1]?.createdAt ?? null }] as const;
        }));
        if (!active) return;
        setReviewedProjects(snapshots);
        setReviewedProjectStatuses(Object.fromEntries(statuses));
      })
      .catch(() => {
        if (active) {
          setReviewedProjects([]);
          setReviewedProjectStatuses({});
        }
      });
    return () => { active = false; };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setReminderCadence("off");
      setReminderStatus("");
      return;
    }
    let active = true;
    fetchQualityLabReminderPreference()
      .then((preference) => {
        if (active) setReminderCadence(preference.cadence);
      })
      .catch(() => {
        if (active) setReminderStatus("Reminder settings are temporarily unavailable.");
      });
    return () => { active = false; };
  }, [isAuthenticated]);

  useEffect(() => {
    if (projects.length === 0) return;
    analytics.projectWorkQueueViewed(projects.length, activeProjectActions, workQueueMetrics.overdueCount);
  }, [projects.length, activeProjectActions, workQueueMetrics.overdueCount]);

  function duplicate(id: string) {
    const source = projects.find((project) => project.id === id);
    const label = window.prompt("Scenario label for the duplicate", source ? `${source.input.scenarioLabel} - alternative` : "Alternative scenario");
    if (label === null) return;
    const copy = duplicateQualityLabProject(id, label);
    if (copy) setLocation(`/quality-lab/projects/${copy.id}`);
  }

  function remove(id: string, name: string) {
    if (!window.confirm(`Delete "${name}" from this browser?`)) return;
    deleteQualityLabProject(id);
    refresh();
  }

  function recover(snapshot: QualityLabReviewedProjectSnapshot) {
    const restored = restoreQualityLabReviewedProject(snapshot);
    analytics.reviewedProjectRecovered(restored.id);
    refresh();
    setLocation(`/quality-lab/projects/${restored.id}`);
  }

  async function removeAccountSnapshot(project: QualityLabProject) {
    const revisionCount = reviewedProjectStatuses[project.id]?.revisionCount ?? 0;
    if (!window.confirm(`Remove the securely saved review snapshot and its ${revisionCount} account revision(s) for "${project.name}"? This does not delete the browser-local project.`)) return;
    setDeletingSnapshotId(project.id);
    setSnapshotActionError("");
    try {
      await deleteQualityLabReviewedProjectSnapshot(project.id);
      setReviewedProjects((current) => current.filter((snapshot) => snapshot.localProjectId !== project.id));
      setReviewedProjectStatuses((current) => {
        const { [project.id]: _removed, ...remaining } = current;
        return remaining;
      });
      analytics.reviewedProjectSnapshotDeleted(project.id);
    } catch (error) {
      setSnapshotActionError(error instanceof Error ? error.message : "Unable to remove the account-held review snapshot.");
    } finally {
      setDeletingSnapshotId(null);
    }
  }

  async function changeReminderCadence(cadence: QualityLabReminderCadence) {
    setReminderSaving(true);
    setReminderStatus("");
    try {
      const preference = await saveQualityLabReminderPreference(cadence);
      setReminderCadence(preference.cadence);
      setReminderStatus(preference.cadence === "off" ? "Email reminders are off." : "Reminder cadence saved.");
      analytics.projectReminderCadenceChanged(preference.cadence, reviewedProjects.length);
    } catch (error) {
      setReminderStatus(error instanceof Error ? error.message : "Unable to save the reminder preference.");
    } finally {
      setReminderSaving(false);
    }
  }

  const firstProject = projects[0];
  const recoverableProjects = reviewedProjects.filter((snapshot) => !projects.some((project) => project.id === snapshot.localProjectId));

  return (
    <div className="min-h-screen bg-[#08111f] px-4 pb-24 pt-6 text-slate-100 md:pt-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link href="/quality-lab" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Quality Lab Blueprint
          </Link>
          <div className="flex flex-wrap gap-2">
            {firstProject && (
              <>
                <Link href={`/quality-lab/skill-shift-coverage?project=${firstProject.id}`} className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-300/[0.06] px-4 py-2.5 text-sm font-bold text-cyan-200 transition hover:bg-cyan-300/10">
                  <Users className="h-4 w-4" /> Skill & shift coverage
                </Link>
                <Link href={`/quality-lab/non-routine-load?project=${firstProject.id}`} className="inline-flex items-center gap-2 rounded-xl border border-amber-300/20 bg-amber-300/[0.06] px-4 py-2.5 text-sm font-bold text-amber-200 transition hover:bg-amber-300/10">
                  <AlertTriangle className="h-4 w-4" /> Exception load
                </Link>
                <Link href={`/quality-lab/equipment-resilience?project=${firstProject.id}`} className="inline-flex items-center gap-2 rounded-xl border border-emerald-300/20 bg-emerald-300/[0.06] px-4 py-2.5 text-sm font-bold text-emerald-200 transition hover:bg-emerald-300/10">
                  <Wrench className="h-4 w-4" /> Equipment resilience
                </Link>
                <Link href={`/quality-lab/sensitivity?project=${firstProject.id}`} className="inline-flex items-center gap-2 rounded-xl border border-violet-300/20 bg-violet-300/[0.06] px-4 py-2.5 text-sm font-bold text-violet-200 transition hover:bg-violet-300/10">
                  <Activity className="h-4 w-4" /> Sensitivity
                </Link>
                <Link href={`/quality-lab/turnaround?project=${firstProject.id}`} className="inline-flex items-center gap-2 rounded-xl border border-sky-300/20 bg-sky-300/[0.06] px-4 py-2.5 text-sm font-bold text-sky-200 transition hover:bg-sky-300/10">
                  <CalendarClock className="h-4 w-4" /> Queue feasibility
                </Link>
              </>
            )}
            {projects.length >= 2 && (
              <Link href={`/quality-lab/compare?baseline=${projects[0].id}&alternative=${projects[1].id}`} className="inline-flex items-center gap-2 rounded-xl border border-violet-300/20 bg-violet-300/[0.06] px-4 py-2.5 text-sm font-bold text-violet-200 transition hover:bg-violet-300/10">
                <GitCompareArrows className="h-4 w-4" /> Compare scenarios
              </Link>
            )}
            <Link href="/quality-lab/planner" className="inline-flex items-center gap-2 rounded-xl bg-teal-300 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-teal-200">
              <Plus className="h-4 w-4" /> New project
            </Link>
          </div>
        </div>

        <header className="mb-6 rounded-3xl border border-teal-300/20 bg-gradient-to-br from-teal-300/10 via-white/[0.035] to-transparent p-5 md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between md:gap-6">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-300/10 text-teal-200">
                <FlaskConical className="h-5 w-5" />
              </div>
              <h1 className="mt-4 text-3xl font-bold md:mt-5 md:text-5xl">Quality lab projects</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 md:leading-7">
                Compare scenarios, resolve critical inputs and export the model basis. Projects stay local unless you explicitly attach a full Blueprint for review; signed-in users can recover an attached snapshot on another device.
              </p>
            </div>
            {projects.length > 0 && (
              <div className="grid min-w-64 grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Project portfolio summary">
                <div className="rounded-xl border border-white/10 bg-black/15 p-3 text-center">
                  <strong className="block text-lg text-white">{projects.length}</strong>
                  <span className="text-[10px] text-slate-500">projects</span>
                </div>
                <div className="rounded-xl border border-amber-300/15 bg-amber-300/[0.04] p-3 text-center">
                  <strong className="block text-lg text-amber-200">{projectsWithBlockingInputs}</strong>
                  <span className="text-[10px] text-slate-500">not controlled-use ready</span>
                </div>
                <div className="rounded-xl border border-teal-300/15 bg-teal-300/[0.04] p-3 text-center">
                  <strong className="block text-lg text-teal-200">{averageCompleteness}%</strong>
                  <span className="text-[10px] text-slate-500">avg input completeness</span>
                </div>
                <div className="rounded-xl border border-sky-300/15 bg-sky-300/[0.04] p-3 text-center">
                  <strong className="block text-lg text-sky-200">{activeProjectActions}</strong>
                  <span className="text-[10px] text-slate-500">active actions</span>
                </div>
              </div>
            )}
          </div>
        </header>

        {snapshotActionError && <div role="alert" className="mb-6 rounded-xl border border-red-300/20 bg-red-300/10 p-4 text-sm text-red-100">{snapshotActionError}</div>}

        {isAuthenticated && recoverableProjects.length > 0 && (
          <section className="mb-6 rounded-3xl border border-sky-300/20 bg-sky-300/[0.055] p-5 md:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-200">Account recovery</p><h2 className="mt-1 text-xl font-bold">Securely saved review projects</h2><p className="mt-2 max-w-2xl text-xs leading-5 text-slate-400">These review snapshots are attached to your account but are not yet available in this browser. Recovering creates a local copy; it does not change the account-held revision history.</p></div><span className="inline-flex items-center gap-2 self-start rounded-full border border-sky-300/20 px-3 py-1 text-xs font-bold text-sky-200"><CloudDownload className="h-3.5 w-3.5" /> {recoverableProjects.length} available</span></div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">{recoverableProjects.map((snapshot) => <article key={snapshot.localProjectId} className="rounded-xl border border-white/10 bg-slate-950/35 p-4"><p className="font-bold">{snapshot.projectName}</p><p className="mt-1 text-xs text-slate-500">{snapshot.input.scenarioLabel} · {snapshot.input.country} · {reviewedProjectStatuses[snapshot.localProjectId]?.revisionCount ?? 0} account revisions{reviewedProjectStatuses[snapshot.localProjectId]?.lastSyncedAt ? ` · last saved ${new Date(reviewedProjectStatuses[snapshot.localProjectId].lastSyncedAt!).toLocaleDateString()}` : ""}</p><div className="mt-3 flex items-center justify-between gap-3"><span className="text-[10px] font-bold uppercase text-amber-200">Review requested</span><button type="button" onClick={() => recover(snapshot)} className="inline-flex items-center gap-2 rounded-lg bg-sky-300 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-sky-200"><CloudDownload className="h-3.5 w-3.5" /> Recover here</button></div></article>)}</div>
          </section>
        )}

        {isAuthenticated && (
          <section className="mb-6 rounded-3xl border border-violet-300/20 bg-violet-300/[0.045] p-5 md:p-6" aria-labelledby="blueprint-reminder-title">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 text-violet-200"><BellRing className="h-5 w-5" /><p className="text-[10px] font-bold uppercase tracking-[0.18em]">Account reminder</p></div>
                <h2 id="blueprint-reminder-title" className="mt-2 text-xl font-bold">Bring priority Blueprint work back to your inbox</h2>
                <p className="mt-2 text-xs leading-5 text-slate-400">Opt in to a concise work-queue email when an account-held review project has overdue, due-soon, in-progress, ready-for-review or blocking unscheduled work.</p>
              </div>
              <div className="shrink-0">
                <div className="inline-flex rounded-xl border border-white/10 bg-slate-950/45 p-1" aria-label="Blueprint reminder cadence">
                  {(["off", "weekdays", "daily"] as const).map((cadence) => (
                    <button
                      key={cadence}
                      type="button"
                      disabled={reminderSaving}
                      aria-pressed={reminderCadence === cadence}
                      onClick={() => void changeReminderCadence(cadence)}
                      className={`rounded-lg px-3 py-2 text-xs font-bold capitalize transition disabled:cursor-wait disabled:opacity-60 ${reminderCadence === cadence ? "bg-violet-300 text-slate-950" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
                    >
                      {cadence}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-2 border-t border-white/8 pt-4 text-[11px] leading-5 text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <p>Only the {reviewedProjects.length} review snapshot{reviewedProjects.length === 1 ? "" : "s"} explicitly saved to your account can be included. Browser-local projects stay on this device.</p>
              <p className="shrink-0">Daily scan: 09:00 UTC</p>
            </div>
            {reminderStatus && <p role="status" className="mt-2 text-[11px] text-violet-200">{reminderStatus}</p>}
          </section>
        )}

        {projects.length > 0 && (
          <section className="mb-6 rounded-3xl border border-sky-300/20 bg-gradient-to-br from-sky-300/[0.07] via-white/[0.03] to-transparent p-5 md:p-6" aria-labelledby="portfolio-work-queue-title">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 text-sky-200"><ClipboardList className="h-5 w-5" /><p className="text-[10px] font-bold uppercase tracking-[0.18em]">Daily project pulse</p></div>
                <h2 id="portfolio-work-queue-title" className="mt-2 text-2xl font-bold">Today&apos;s work queue</h2>
                <p className="mt-2 text-xs leading-5 text-slate-400">One prioritized view across every local Blueprint. Due dates create the cadence; ready-for-review and in-progress work stay ahead of unscheduled inputs.</p>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Portfolio work queue summary">
                <div className="min-w-24 rounded-xl border border-red-300/15 bg-red-300/[0.04] p-3 text-center"><strong className="block text-lg text-red-200">{workQueueMetrics.overdueCount}</strong><span className="text-[10px] text-slate-500">overdue</span></div>
                <div className="min-w-24 rounded-xl border border-amber-300/15 bg-amber-300/[0.04] p-3 text-center"><strong className="block text-lg text-amber-200">{workQueueMetrics.dueSoonCount}</strong><span className="text-[10px] text-slate-500">due in 7 days</span></div>
                <div className="min-w-24 rounded-xl border border-white/10 bg-white/[0.025] p-3 text-center"><strong className="block text-lg text-white">{workQueueMetrics.unscheduledBlockingCount}</strong><span className="text-[10px] text-slate-500">blocking unscheduled</span></div>
                <div className="min-w-24 rounded-xl border border-teal-300/15 bg-teal-300/[0.04] p-3 text-center"><strong className="block text-lg text-teal-200">{workQueueMetrics.readyForReviewCount}</strong><span className="text-[10px] text-slate-500">ready for review</span></div>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              {visibleWorkQueue.map((item) => {
                const timing = timingDetails[item.timing];
                return (
                  <article key={`${item.projectId}:${item.action.id}`} className="flex flex-col gap-3 rounded-xl border border-white/10 bg-slate-950/35 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full border px-2 py-1 text-[9px] font-bold uppercase tracking-wider ${timing.className}`}>{timing.label}</span>
                        <span className="text-[10px] font-semibold text-slate-500">{item.projectName} · {item.scenarioLabel}</span>
                      </div>
                      <h3 className="mt-2 text-sm font-bold leading-5 text-slate-100">{item.action.question}</h3>
                      <p className="mt-1 text-[11px] text-slate-500">Owner: {item.action.ownerRole || "Unassigned"}{item.action.dueDate ? ` · due ${displayDueDate(item.action.dueDate)}` : " · due date not set"} · {item.action.status.replaceAll("-", " ")}</p>
                    </div>
                    <Link href={`/quality-lab/projects/${item.projectId}#project-action-center`} onClick={() => analytics.projectWorkQueueActionOpened(item.projectId, item.action.id, item.timing)} className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-sky-300/20 bg-sky-300/10 px-3 py-2 text-xs font-bold text-sky-100 transition hover:bg-sky-300/15 sm:self-auto">
                      Open action <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </article>
                );
              })}
            </div>

            {workQueue.length > visibleWorkQueue.length && <p className="mt-3 text-[11px] text-slate-500">Showing the 5 highest-priority actions from {workQueue.length} active items. Open a project action to update its owner, evidence, status or due date.</p>}
            {workQueue.length === 0 && <div className="mt-5 flex items-start gap-3 rounded-xl border border-teal-300/20 bg-teal-300/[0.055] p-4"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal-300" /><div><h3 className="text-sm font-bold">No active compiled-input actions.</h3><p className="mt-1 text-xs leading-5 text-slate-400">Qualified review is still required before controlled use.</p></div></div>}
          </section>
        )}

        {projects.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.025] px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-slate-400">
              <FileText className="h-6 w-6" />
            </div>
            <h2 className="mt-5 text-xl font-bold">No blueprints yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Start with the example assumptions, replace them with your site data and compile the first scenario.</p>
            <Link href="/quality-lab/planner" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-teal-200">
              Build a blueprint <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map((project) => {
              const actionMetrics = qualityLabActionPlanMetrics(project.actionPlan);
              const nextAction = priorityQualityLabActions(project.actionPlan)[0];
              const stage = qualityLabProjectStage(project.actionPlan, project.reviewRequestedAt);
              return (
                <article key={project.id} className="group rounded-2xl border border-white/10 bg-white/[0.035] p-5 transition hover:-translate-y-0.5 hover:border-teal-300/30 hover:bg-white/[0.05]">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-300/10 text-teal-200">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <span className={`rounded-full border px-2 py-1 text-[9px] font-bold uppercase tracking-wider ${project.blueprint.dataQuality.blockingOpenCount > 0 ? "border-amber-300/20 bg-amber-300/10 text-amber-200" : "border-sky-300/20 bg-sky-300/10 text-sky-200"}`}>
                    {project.blueprint.dataQuality.blockingOpenCount > 0 ? "Not ready for controlled use" : "Concept"}
                  </span>
                </div>
                <h2 className="mt-5 text-xl font-bold">{project.name}</h2>
                <p className="mt-1 text-sm font-semibold text-teal-200">{project.input.scenarioLabel}</p>
                <p className="mt-1 text-xs text-slate-500">{project.input.companyName || "Company not specified"} - {project.input.country} - Updated {new Date(project.updatedAt).toLocaleDateString()}</p>
                {project.reviewRequestedAt && <div className="mt-2 rounded-lg border border-sky-300/15 bg-sky-300/[0.04] px-3 py-2 text-[11px] leading-5 text-sky-100"><p>Account-held review snapshot {reviewedProjects.some((snapshot) => snapshot.localProjectId === project.id) ? `saved · ${reviewedProjectStatuses[project.id]?.revisionCount ?? 0} immutable revision${(reviewedProjectStatuses[project.id]?.revisionCount ?? 0) === 1 ? "" : "s"}${reviewedProjectStatuses[project.id]?.lastSyncedAt ? ` · last saved ${new Date(reviewedProjectStatuses[project.id].lastSyncedAt!).toLocaleDateString()}` : ""}` : "not confirmed in this session"}. Review request: {new Date(project.reviewRequestedAt).toLocaleDateString()}.</p>{reviewedProjects.some((snapshot) => snapshot.localProjectId === project.id) && <button type="button" disabled={deletingSnapshotId === project.id} onClick={() => void removeAccountSnapshot(project)} className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-bold text-sky-200 underline underline-offset-2 hover:text-white disabled:cursor-wait disabled:opacity-60"><Trash2 className="h-3 w-3" /> {deletingSnapshotId === project.id ? "Removing secure copy…" : "Remove account-held snapshot"}</button>}</div>}
                <div className="mt-4 rounded-xl border border-teal-300/15 bg-teal-300/[0.045] p-3">
                  <div className="flex items-center justify-between gap-3"><span className="text-[10px] font-bold uppercase tracking-wider text-teal-200">{projectStageLabels[stage]}</span><span className="text-[10px] text-slate-500">{actionMetrics.activeCount} active</span></div>
                  <p className="mt-2 line-clamp-2 text-xs font-semibold leading-5 text-slate-200">{nextAction?.question ?? "No compiled input action remains open."}</p>
                  {nextAction && <p className="mt-1 text-[10px] text-slate-500">Owner: {nextAction.ownerRole || "Unassigned"}{nextAction.dueDate ? ` · due ${new Date(`${nextAction.dueDate}T00:00:00`).toLocaleDateString()}` : " · no due date"}</p>}
                  <Link href={`/quality-lab/projects/${project.id}#project-action-center`} className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-teal-200 hover:text-white">Manage actions <ArrowRight className="h-3.5 w-3.5" /></Link>
                </div>
                <div className="mt-3 rounded-xl border border-white/8 bg-slate-950/30 p-3">
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="font-semibold text-slate-300">Input completeness</span>
                    <span className="font-bold text-teal-200">{project.blueprint.dataQuality.completenessPercent}%</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-label={`${project.name} input completeness`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={project.blueprint.dataQuality.completenessPercent}>
                    <div className="h-full rounded-full bg-teal-300" style={{ width: `${project.blueprint.dataQuality.completenessPercent}%` }} />
                  </div>
                  <p className="mt-2 text-[10px] text-slate-500">
                    <span className="font-bold text-red-200">{project.blueprint.dataQuality.blockingOpenCount} controlled-use blockers</span> - <span className="font-bold text-amber-200">{project.blueprint.dataQuality.importantOpenCount} important</span> inputs remain
                  </p>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="rounded-xl border border-white/8 bg-slate-950/30 p-3">
                    <p className="font-bold text-teal-200">{project.blueprint.current.monthlyTests}</p>
                    <p className="mt-1 text-[10px] text-slate-500">tests / month</p>
                  </div>
                  <div className="rounded-xl border border-white/8 bg-slate-950/30 p-3">
                    <p className="font-bold text-teal-200">{project.blueprint.current.totalTeamFte}</p>
                    <p className="mt-1 text-[10px] text-slate-500">team FTE</p>
                  </div>
                  <div className="rounded-xl border border-white/8 bg-slate-950/30 p-3">
                    <p className="font-bold text-teal-200">{money.format(project.blueprint.current.capexHighUsd)}</p>
                    <p className="mt-1 text-[10px] text-slate-500">CAPEX high</p>
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/8 pt-4">
                  <div className="flex gap-1">
                    <button onClick={() => duplicate(project.id)} className="rounded-lg p-2 text-slate-500 transition hover:bg-white/5 hover:text-white" title="Duplicate scenario" aria-label={`Duplicate ${project.name}`}>
                      <Copy className="h-4 w-4" />
                    </button>
                    <button onClick={() => remove(project.id, project.name)} className="rounded-lg p-2 text-slate-500 transition hover:bg-red-300/10 hover:text-red-200" title="Delete project" aria-label={`Delete ${project.name}`}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <Link href={`/quality-lab/projects/${project.id}`} className="inline-flex items-center gap-2 text-sm font-bold text-teal-300 transition group-hover:text-teal-200">
                    Open blueprint <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="mt-6 flex items-start gap-3 rounded-xl border border-sky-300/15 bg-sky-300/5 p-4 text-xs leading-6 text-sky-100">
          <BarChart3 className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" />
          To compare two scenarios, duplicate a project, give the duplicate a clear scenario label, then change one planning assumption at a time.
        </div>
      </div>
    </div>
  );
}
