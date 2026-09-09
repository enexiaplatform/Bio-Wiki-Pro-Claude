import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import type { RegulatoryUpdate } from "@shared/regulatory-monitor";
import type { ImpactReview } from "@shared/quality-lab-impact-contract";
import { createImpactReview, currentImpactReview, mapProjectRegulatoryImpact } from "@shared/quality-lab-impact-watch";
import { twinSourceBasisHash } from "@shared/quality-lab-twin-specialists";
import { isIllustrativeQualityLabProject, type QualityLabProject } from "@shared/quality-lab";
import { getQualityLabProject, listQualityLabProjects, saveQualityLabProject } from "@/lib/quality-lab-projects";
import { recordQualityLabFunnelEvent } from "@/lib/quality-lab-funnel";
import { DecisionTraceLink } from "./DecisionLineagePanel";

export function ProjectImpactWatch({ updates }: { updates: RegulatoryUpdate[] }) {
  const [projects, setProjects] = useState<QualityLabProject[]>(() => listQualityLabProjects());
  const [projectId, setProjectId] = useState(() => new URLSearchParams(window.location.search).get("project") ?? "");
  const [updateId, setUpdateId] = useState("");
  const [review, setReview] = useState<ImpactReview | null>(null);
  const [disposition, setDisposition] = useState("");
  const [role, setRole] = useState("");
  const [rationale, setRationale] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const project = projects.find((item) => item.id === projectId);
  const entries = useMemo(() => project ? updates.map((update) => ({ update, impact: mapProjectRegulatoryImpact(project, update) })) : [], [project, updates]);
  const candidateEntries = useMemo(() => entries.filter((entry) => entry.impact.status === "review"), [entries]);
  const noMatchCount = entries.filter((entry) => entry.impact.status === "no-match").length;
  const blockedEntries = entries.filter((entry) => entry.impact.status === "blocked");
  const selected = candidateEntries.find((entry) => entry.update.id === updateId);
  useEffect(() => {
    let active = true;
    setReview(null); setDisposition(""); setRole(""); setRationale(""); setConfirmed(false);
    if (project && selected) void currentImpactReview(project, selected.update).then((value) => { if (active) setReview(value); }).catch(() => { if (active) setMessage("The previous review could not be verified. Reload before recording a disposition."); });
    return () => { active = false; };
  }, [project, selected]);
  async function saveReview() {
    if (!project || !selected || !confirmed || busy) return;
    setBusy(true); setMessage("");
    try {
      const latest = getQualityLabProject(project.id);
      if (!latest || await twinSourceBasisHash(latest) !== await twinSourceBasisHash(project)) throw new Error("Project basis changed. Reload the monitor and review the new basis.");
      const before = JSON.stringify(latest);
      const record = await createImpactReview(latest, selected.update, { disposition: disposition as ImpactReview["disposition"], reviewerRole: role, rationale });
      if (JSON.stringify(getQualityLabProject(project.id)) !== before) throw new Error("The project changed during review. Reload and review the latest revision.");
      const saved = saveQualityLabProject({ ...latest.input, impactReviewHistory: [...(latest.input.impactReviewHistory ?? []), record] }, latest.id, isIllustrativeQualityLabProject(latest) ? "illustrative-example" : "user-entered");
      setProjects((current) => current.map((item) => item.id === saved.id ? saved : item));
      setReview(record);
      setMessage("Review recorded in a new browser revision. Executable rules and model inputs were not changed by this disposition.");
      recordQualityLabFunnelEvent({ stage: "impact_watch_reviewed", source: "project-impact-watch" });
    } catch (error) {
      setMessage(error instanceof Error && !error.message.startsWith("[") ? error.message : "Review could not be saved. Check the required fields and browser storage.");
    } finally { setBusy(false); }
  }
  return <section aria-labelledby="project-impact-heading" className="mt-6 rounded-2xl border border-teal-300/20 p-5">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <h2 id="project-impact-heading" className="text-xl font-bold">Project Impact Watch</h2>
      {project && <Link href={`/quality-lab/projects/${encodeURIComponent(project.id)}#blueprint-challenge`} className="inline-flex min-h-11 items-center text-sm font-semibold text-teal-200 underline">Back to this Blueprint</Link>}
    </div>
    <p className="mt-2 text-sm leading-6 text-slate-300">Compare official updates with a saved Blueprint's method, evidence and unresolved decision records. Topic overlap is a review candidate, not a regulatory applicability decision.</p>
    <label className="mt-4 block text-sm">Saved browser Blueprint<select disabled={busy} value={projectId} onChange={(event) => { setProjectId(event.target.value); setUpdateId(""); }} className="mt-2 block min-h-11 w-full rounded-lg border border-white/20 bg-slate-950 p-2"><option value="">Select a project</option>{projects.map((item) => <option key={item.id} value={item.id}>{item.input.projectName}</option>)}</select></label>
    {!projects.length && <p className="mt-3 text-sm">Save a Blueprint in this browser to review project-specific impacts.</p>}
    {project && <>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <p className="rounded-xl border border-teal-300/15 bg-teal-300/[0.045] p-3 text-sm"><strong className="text-teal-100">{candidateEntries.length}</strong> candidate {candidateEntries.length === 1 ? "update" : "updates"} · select to inspect review status</p>
        <p className="rounded-xl border border-white/10 bg-white/[0.025] p-3 text-sm text-slate-400"><strong className="text-slate-200">{noMatchCount}</strong> {noMatchCount === 1 ? "update" : "updates"} with no bounded project-record match</p>
      </div>
      {blockedEntries.length > 0 && <p role="alert" className="mt-3 text-sm text-amber-200">{blockedEntries.length} updates could not be compared: {blockedEntries[0].impact.message} No all-clear can be inferred.</p>}
      {candidateEntries.length ? <label className="mt-3 block text-sm">Candidate update to review<select disabled={busy} value={updateId} onChange={(event) => setUpdateId(event.target.value)} className="mt-2 block min-h-11 w-full rounded-lg border border-white/20 bg-slate-950 p-2"><option value="">Select a candidate update</option>{candidateEntries.map(({ update, impact }) => <option key={update.id} value={update.id}>{update.title} — {impact.records.length} candidate records</option>)}</select></label> : noMatchCount > 0 && !blockedEntries.length && <div className="mt-3 rounded-xl border border-dashed border-sky-300/20 bg-sky-300/[0.04] p-4 text-sm leading-6 text-slate-300"><strong className="text-sky-100">No candidate project review is waiting.</strong> The bounded matcher found no project-record links in the current successful feeds. This is not an all-clear or a substitute for applicability review.</div>}
      {noMatchCount > 0 && <p className="mt-3 text-xs leading-5 text-slate-400">Updates without a bounded match stay out of this project queue. <a href="#regulatory-feed" className="font-semibold text-sky-200 underline">Browse the full official feed</a> when you need to inspect them manually.</p>}
      {!entries.length && <p className="mt-3 text-sm">No updates from currently available official feeds. This is not an all-clear for the project.</p>}
    </>}
    {selected && <div className="mt-4 rounded-xl border border-white/10 p-4">
      <h3 className="mb-3 break-words font-semibold">{selected.update.title}</h3>
      <p className="text-sm leading-6">{selected.impact.message}</p>
      <p className="mt-2 text-sm leading-6 text-slate-300">{selected.impact.marketContext}</p>
      {selected.impact.status !== "blocked" && <>
        <a href={selected.update.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex min-h-11 items-center text-teal-200 underline">Read the official publication</a>
        <p className="text-xs text-slate-400">Machine-labeled status: {selected.update.documentStatus}. Confirm status, effective dates and applicability in the official text.</p>
        <details className="mt-3"><summary className="min-h-11 cursor-pointer">Inspect {selected.impact.records.length} candidate records</summary>{selected.impact.records.map((record) => <div key={`${record.kind}:${record.id}`} className="mt-3 break-words text-sm"><p><strong>{record.label}</strong> ({record.kind}, {record.id}). {record.basis}</p>{record.decisions.length ? <details><summary className="min-h-11 cursor-pointer">{record.decisions.length} linked decision records</summary>{record.decisions.map(lineage => <div key={lineage.id} className="my-2"><p>{lineage.summary}</p><DecisionTraceLink projectId={project!.id} lineage={lineage} /></div>)}</details> : <p className="text-xs text-slate-400">No explicit decision-lineage link exists for this record.</p>}</div>)}</details>
        {review && <p className="mt-3 text-sm text-teal-100">Recorded disposition: {review.disposition}. Reviewer role: {review.reviewerRole}. {review.rationale}</p>}
        <p className="mt-3 text-xs text-slate-400">A changed project basis or changed publication content requires a new review. This record preserves your stated role and rationale; it does not verify professional authority or automatically change rules. Explicit account saves include this browser revision.</p>
        <label className="mt-3 block text-sm">Disposition<select disabled={busy} value={disposition} onChange={(event) => { setDisposition(event.target.value); setConfirmed(false); }} className="mt-1 block min-h-11 w-full rounded-lg bg-slate-950 p-2"><option value="">Choose a disposition</option><option value="action-required">Action required</option><option value="not-applicable">Not applicable to this basis</option><option value="deferred">Defer for further review</option></select></label>
        <label className="mt-3 block text-sm">Reviewer role<input disabled={busy} value={role} maxLength={100} onChange={(event) => { setRole(event.target.value); setConfirmed(false); }} className="mt-1 block min-h-11 w-full rounded-lg bg-slate-950 p-2" /></label>
        <label className="mt-3 block text-sm">Review rationale<textarea disabled={busy} value={rationale} maxLength={2000} onChange={(event) => { setRationale(event.target.value); setConfirmed(false); }} className="mt-1 block min-h-24 w-full rounded-lg bg-slate-950 p-2" /></label>
        <label className="mt-3 flex gap-2 text-sm"><input type="checkbox" disabled={busy} checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />I reviewed the official publication and recorded a disposition for this project basis.</label>
        <button type="button" disabled={busy || !confirmed || !disposition || role.trim().length < 2 || rationale.trim().length < 10} onClick={() => void saveReview()} className="mt-3 min-h-11 rounded-lg bg-teal-200 px-4 py-2 font-bold text-slate-950 disabled:opacity-50">{busy ? "Saving review…" : "Record impact review"}</button>
      </>}
    </div>}
    <p role="status" className="mt-3 text-sm text-teal-100">{message}</p>
  </section>;
}
