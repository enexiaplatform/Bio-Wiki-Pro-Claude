import { useEffect, useMemo, useState } from "react";
import { Link, useRoute } from "wouter";
import { AlertTriangle, ArrowLeft, CheckCircle2, Download, FileCheck2, FlaskConical, GitCompareArrows, Info, LockKeyhole, Scale, ShieldCheck, Users } from "lucide-react";
import { analyzeQualityLabOperatingModel } from "@shared/quality-lab-operating-model";
import {
  assessQualityLabOperatingModelReview,
  operatingModelReviewOutcomeValues,
  type QualityLabOperatingModelReviewDraft,
} from "@shared/quality-lab-operating-model-review";
import { getOrCreateEngagement } from "@/lib/quality-lab-engagements";
import { getQualityLabProject } from "@/lib/quality-lab-projects";
import { loadQualityLabOperatingModelInput } from "@/lib/quality-lab-operating-model";
import {
  downloadQualityLabOperatingModelReviewRegistry,
  freezeQualityLabOperatingModelReview,
  listQualityLabOperatingModelReviewSnapshots,
  loadQualityLabOperatingModelReviewDraft,
  saveQualityLabOperatingModelReviewDraft,
} from "@/lib/quality-lab-operating-model-reviews";
import { analytics } from "@/hooks/use-analytics";
import { useSEO } from "@/hooks/use-seo";

function decoded(value?: string) {
  if (!value) return "";
  try { return decodeURIComponent(value); } catch { return value; }
}

const inputClass = "h-11 w-full rounded-xl border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none focus:border-sky-300/40";

export default function QualityLabOperatingModelReviewPage() {
  const [, params] = useRoute("/quality-lab/engagements/:id/operating-model-review");
  const projectId = decoded(params?.id);
  const project = useMemo(() => getQualityLabProject(projectId), [projectId]);
  const input = useMemo(() => project ? loadQualityLabOperatingModelInput(project) : null, [project]);
  const engagement = useMemo(() => project ? getOrCreateEngagement(project) : null, [project]);
  const analysis = useMemo(() => project && input ? analyzeQualityLabOperatingModel(project, input) : null, [project, input]);
  const [draft, setDraft] = useState<QualityLabOperatingModelReviewDraft | null>(() => project && input ? loadQualityLabOperatingModelReviewDraft(project, input) : null);
  const [applicationId, setApplicationId] = useState("");
  const [snapshots, setSnapshots] = useState(() => listQualityLabOperatingModelReviewSnapshots(projectId));
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const assessment = useMemo(() => project && input && engagement && draft ? assessQualityLabOperatingModelReview(project, input, engagement, draft) : null, [project, input, engagement, draft]);
  const selected = analysis?.applications.find((item) => item.id === applicationId) ?? analysis?.applications[0];
  const selectedReview = draft?.applications.find((item) => item.applicationId === selected?.id);
  useSEO({ title: project ? `${project.name} | Operating-model review` : "Operating-model review", description: "Freeze a controlled paid-diagnostic comparison between Atlas operating-model conclusions and qualified stakeholder review." });

  useEffect(() => {
    if (!project || !input) return;
    setDraft(loadQualityLabOperatingModelReviewDraft(project, input));
    setSnapshots(listQualityLabOperatingModelReviewSnapshots(project.id));
  }, [project?.id, input?.updatedAt]);

  useEffect(() => {
    if (analysis && assessment) analytics.operatingModelReviewOpened(analysis.project.id, analysis.applications.length, assessment.blockers.length);
  }, [analysis?.project.id]);

  function persist(mutator: (current: QualityLabOperatingModelReviewDraft) => QualityLabOperatingModelReviewDraft, field: string) {
    setDraft((current) => current ? saveQualityLabOperatingModelReviewDraft(mutator(current)) : current);
    setNotice("");
    setError("");
    analytics.operatingModelReviewDraftUpdated(field);
  }

  function updateApplication(patch: Partial<QualityLabOperatingModelReviewDraft["applications"][number]>, field: string) {
    if (!selected) return;
    persist((current) => ({ ...current, applications: current.applications.map((item) => item.applicationId === selected.id ? { ...item, ...patch } : item) }), field);
  }

  function freezeReview() {
    if (!project || !input || !engagement || !draft) return;
    try {
      const snapshot = freezeQualityLabOperatingModelReview(project, input, engagement, draft);
      setSnapshots(listQualityLabOperatingModelReviewSnapshots(project.id));
      setError("");
      setNotice(`Snapshot ${snapshot.snapshotId} is frozen. Later changes create a new record; this one remains unchanged.`);
      analytics.operatingModelReviewFrozen(project.id, snapshot.snapshotId, snapshot.comparison.changedWithRationale);
    } catch (reason) {
      setNotice("");
      setError(reason instanceof Error ? reason.message : "Unable to freeze the operating-model review.");
    }
  }

  if (!project || !input || !engagement || !analysis || !draft || !assessment || !selected || !selectedReview) {
    return <div className="min-h-screen bg-[#07111f] px-4 py-16 text-slate-100"><div className="mx-auto max-w-2xl rounded-3xl border border-dashed border-white/15 bg-white/[0.025] p-8 text-center"><FlaskConical className="mx-auto h-8 w-8 text-slate-500" /><h1 className="mt-5 text-2xl font-bold">Operating-model review not available</h1><p className="mt-3 text-sm leading-6 text-slate-500">The reviewed Blueprint or browser-local operating-model worksheet is unavailable on this device.</p><Link href="/quality-lab/projects" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-300 px-5 py-3 text-sm font-bold text-slate-950"><ArrowLeft className="h-4 w-4" /> Quality lab projects</Link></div></div>;
  }

  const modelMode = selected.recommendedMode;
  const selectedBlockers = assessment.blockers.filter((item) => item.applicationId === selected.id);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#07111f] px-4 pb-24 pt-6 text-slate-100 md:pt-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><Link href={`/quality-lab/operating-model?project=${project.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to operating-model analysis</Link><div className="flex flex-wrap gap-2"><Link href={`/quality-lab/engagements/${project.id}`} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-slate-200">Engagement evidence</Link><button onClick={() => { downloadQualityLabOperatingModelReviewRegistry(); analytics.operatingModelReviewRegistryExported(snapshots.length); }} className="inline-flex items-center gap-2 rounded-xl border border-sky-300/20 bg-sky-300/[0.06] px-4 py-2.5 text-sm font-bold text-sky-200"><Download className="h-4 w-4" /> Export review registry</button></div></div>

        <header className="rounded-3xl border border-violet-300/20 bg-gradient-to-br from-violet-300/10 via-white/[0.035] to-sky-300/[0.04] p-6 md:p-8"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-300/10 text-violet-200"><FileCheck2 className="h-5 w-5" /></div><p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-violet-300">Controlled paid-diagnostic review</p><h1 className="mt-2 text-3xl font-bold md:text-5xl">Model conclusion vs stakeholder review</h1><p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">Preserve the exact Atlas analysis, then record where QA, laboratory, finance and procurement agree, add actions, change the mode with rationale, or defer for evidence.</p></header>

        <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Summary label="Applications reviewed" value={`${assessment.summary.applicationReviewsComplete}/${assessment.summary.applicationCount}`} tone="sky" /><Summary label="Stakeholder reviews" value={`${assessment.summary.stakeholderReviewsComplete}/4`} tone="violet" /><Summary label="Freeze blockers" value={String(assessment.blockers.length)} tone={assessment.blockers.length ? "amber" : "teal"} /><Summary label="Frozen snapshots" value={String(snapshots.length)} tone="teal" /></section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><Heading icon={ShieldCheck} title="Paid engagement gate" description="Commercial status is referenced from the existing engagement packet; it is not inferred from browser activity." /><dl className="mt-4 grid gap-3 sm:grid-cols-2"><Fact label="Expert review requested" value={project.reviewRequestedAt ? "Recorded" : "Not recorded"} /><Fact label="Engagement class" value={engagement.pilotControl.engagementClass.replaceAll("-", " ")} /><Fact label="Commercial status" value={engagement.pilotControl.commercialStatus.replaceAll("-", " ")} /><Fact label="Evidence reference" value={engagement.pilotControl.commercialEvidenceReference || "Open"} /></dl></div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><Heading icon={Users} title="Review context" description="Record roles and purpose only; do not enter personal contact data." /><div className="mt-4 space-y-3"><label className="text-xs font-semibold text-slate-400">Facilitator role<input aria-label="Operating-model review facilitator role" value={draft.facilitatorRole} onChange={(event) => persist((current) => ({ ...current, facilitatorRole: event.target.value }), "facilitatorRole")} className={`${inputClass} mt-2`} placeholder="Blueprint engagement lead" /></label><label className="text-xs font-semibold text-slate-400">Review purpose<textarea aria-label="Operating-model review purpose" value={draft.reviewPurpose} onChange={(event) => persist((current) => ({ ...current, reviewPurpose: event.target.value }), "reviewPurpose")} className="mt-2 min-h-24 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-sky-300/40" /></label></div></div>
        </section>

        <section className="mt-5 grid min-w-0 gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
          <div className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.035] p-4"><Heading icon={Scale} title="Application review" description="Review every application against its frozen model mode." /><div className="mt-4 max-h-[720px] space-y-2 overflow-y-auto pr-1">{analysis.applications.map((application) => { const review = draft.applications.find((item) => item.applicationId === application.id)!; const blockers = assessment.blockers.filter((item) => item.applicationId === application.id).length; return <button key={application.id} onClick={() => setApplicationId(application.id)} className={`w-full rounded-xl border p-3 text-left ${application.id === selected.id ? "border-violet-300/35 bg-violet-300/[0.07]" : "border-white/8 bg-slate-950/25"}`}><p className="break-words text-sm font-semibold text-slate-200">{application.label}</p><div className="mt-2 flex flex-wrap justify-between gap-2 text-[10px]"><span className="capitalize text-sky-200">Model: {application.recommendedMode.replaceAll("-", " ")}</span><span className={blockers ? "text-amber-300" : "text-teal-300"}>{blockers ? `${blockers} blocker${blockers === 1 ? "" : "s"}` : review.outcome.replaceAll("-", " ")}</span></div></button>; })}</div></div>

          <div className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.035] p-5 md:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">Selected application</p><h2 className="mt-2 text-2xl font-bold">{selected.label}</h2></div><div className="rounded-xl border border-sky-300/20 bg-sky-300/[0.06] px-4 py-3 text-center"><p className="text-[9px] uppercase tracking-wider text-sky-300">Atlas model</p><strong className="mt-1 block text-sm capitalize text-sky-100">{modelMode.replaceAll("-", " ")}</strong></div></div><div className="mt-5 grid gap-4 md:grid-cols-2"><label className="text-xs font-semibold text-slate-400">Review outcome<select aria-label="Stakeholder review outcome" value={selectedReview.outcome} onChange={(event) => updateApplication({ outcome: event.target.value as typeof selectedReview.outcome }, "applicationOutcome")} className={`${inputClass} mt-2`}>{operatingModelReviewOutcomeValues.map((value) => <option key={value} value={value}>{value.replaceAll("-", " ")}</option>)}</select></label><label className="text-xs font-semibold text-slate-400">Stakeholder-reviewed mode<select aria-label="Stakeholder-reviewed operating mode" value={selectedReview.reviewedMode ?? ""} onChange={(event) => updateApplication({ reviewedMode: event.target.value ? event.target.value as typeof selectedReview.reviewedMode : null }, "reviewedMode")} className={`${inputClass} mt-2`}><option value="">Select reviewed mode</option><option value="insource">Insource</option><option value="outsource">Outsource</option><option value="hybrid">Hybrid</option><option value="evidence-required">Evidence required</option></select></label><label className="text-xs font-semibold text-slate-400 md:col-span-2">Review rationale<textarea aria-label="Application review rationale" value={selectedReview.rationale} onChange={(event) => updateApplication({ rationale: event.target.value }, "applicationRationale")} rows={4} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-sky-300/40" placeholder="Why the review agrees, changes or defers the model conclusion" /></label><label className="text-xs font-semibold text-slate-400">Controlled evidence references<textarea aria-label="Application review evidence references" value={selectedReview.evidenceRefs.join("\n")} onChange={(event) => updateApplication({ evidenceRefs: event.target.value.split("\n").map((item) => item.trim()).filter(Boolean) }, "applicationEvidenceRefs")} rows={4} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-sky-300/40" placeholder="One controlled reference per line" /></label><label className="text-xs font-semibold text-slate-400">Required actions<textarea aria-label="Application review required actions" value={selectedReview.requiredActions.join("\n")} onChange={(event) => updateApplication({ requiredActions: event.target.value.split("\n").map((item) => item.trim()).filter(Boolean) }, "applicationRequiredActions")} rows={4} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-sky-300/40" placeholder="One controlled action per line" /></label></div>{selectedBlockers.length > 0 && <div className="mt-5 rounded-xl border border-amber-300/15 bg-amber-300/[0.04] p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-amber-200">Application blockers</p><div className="mt-3 space-y-2">{selectedBlockers.map((item) => <p key={item.id} className="text-xs leading-5 text-slate-400"><strong className="text-amber-100">{item.message}</strong> {item.resolution}</p>)}</div></div>}</div>
        </section>

        <section className="mt-5 rounded-2xl border border-white/10 bg-white/[0.035] p-5 md:p-6"><Heading icon={GitCompareArrows} title="Cross-functional attestations" description="A complete snapshot requires the four decision perspectives named in the operating-model review boundary." /><div className="mt-5 grid gap-4 lg:grid-cols-2">{draft.stakeholders.map((stakeholder) => <article key={stakeholder.stakeholder} className="rounded-xl border border-white/8 bg-slate-950/25 p-4"><h3 className="text-sm font-bold capitalize text-slate-200">{stakeholder.stakeholder.replaceAll("-", " ")}</h3><div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="text-xs text-slate-400">Reviewer role<input aria-label={`${stakeholder.stakeholder} reviewer role`} value={stakeholder.reviewerRole} onChange={(event) => persist((current) => ({ ...current, stakeholders: current.stakeholders.map((item) => item.stakeholder === stakeholder.stakeholder ? { ...item, reviewerRole: event.target.value } : item) }), `${stakeholder.stakeholder}Role`)} className={`${inputClass} mt-1`} /></label><label className="text-xs text-slate-400">Review status<select aria-label={`${stakeholder.stakeholder} review status`} value={stakeholder.status} onChange={(event) => persist((current) => ({ ...current, stakeholders: current.stakeholders.map((item) => item.stakeholder === stakeholder.stakeholder ? { ...item, status: event.target.value as typeof item.status } : item) }), `${stakeholder.stakeholder}Status`)} className={`${inputClass} mt-1`}><option value="not-reviewed">Not reviewed</option><option value="reviewed-no-objection">Reviewed, no objection</option><option value="concern-recorded">Concern recorded</option></select></label><label className="text-xs text-slate-400 sm:col-span-2">External review reference<input aria-label={`${stakeholder.stakeholder} external review reference`} value={stakeholder.externalReviewReference} onChange={(event) => persist((current) => ({ ...current, stakeholders: current.stakeholders.map((item) => item.stakeholder === stakeholder.stakeholder ? { ...item, externalReviewReference: event.target.value } : item) }), `${stakeholder.stakeholder}Reference`)} className={`${inputClass} mt-1`} placeholder="Controlled meeting or decision record" /></label></div></article>)}</div></section>

        <section className={`mt-5 rounded-2xl border p-5 md:p-6 ${assessment.eligibleToFreeze ? "border-teal-300/20 bg-teal-300/[0.045]" : "border-amber-300/20 bg-amber-300/[0.045]"}`}><div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between"><div><Heading icon={assessment.eligibleToFreeze ? CheckCircle2 : AlertTriangle} title={assessment.eligibleToFreeze ? "Review record is ready to freeze" : `${assessment.blockers.length} blocker${assessment.blockers.length === 1 ? "" : "s"} before freeze`} description={assessment.boundary} />{assessment.blockers.length > 0 && <div data-testid="operating-model-review-blockers" className="mt-5 grid gap-2 md:grid-cols-2">{assessment.blockers.map((item) => <article key={item.id} className="rounded-lg border border-amber-200/10 bg-black/10 p-3"><p className="text-xs font-bold text-amber-100">{item.message}</p><p className="mt-1 text-[11px] leading-5 text-slate-500">{item.resolution}</p></article>)}</div>}</div><button data-testid="freeze-operating-model-review" disabled={!assessment.eligibleToFreeze} onClick={freezeReview} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-300 px-5 py-3 text-sm font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"><LockKeyhole className="h-4 w-4" /> Freeze review snapshot</button></div>{notice && <p role="status" className="mt-4 rounded-lg border border-teal-300/20 bg-teal-300/[0.06] p-3 text-xs text-teal-100">{notice}</p>}{error && <p role="alert" className="mt-4 whitespace-pre-line rounded-lg border border-red-300/20 bg-red-300/[0.06] p-3 text-xs text-red-100">{error}</p>}</section>

        {snapshots.length > 0 && <section className="mt-5 rounded-2xl border border-violet-300/15 bg-violet-300/[0.035] p-5"><Heading icon={LockKeyhole} title="Immutable review history" description="Each material change creates a new fingerprinted record; existing records are never edited." /><div className="mt-4 space-y-2">{snapshots.map((snapshot) => <article key={snapshot.snapshotId} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/8 bg-slate-950/25 p-4"><div><p className="font-mono text-xs font-bold text-violet-200">{snapshot.snapshotId}</p><p className="mt-1 text-[10px] text-slate-600">{new Date(snapshot.recordedAt).toLocaleString()} · project revision {snapshot.source.projectRevision}</p></div><p className="text-xs text-slate-400">{snapshot.comparison.aligned} aligned · {snapshot.comparison.changedWithRationale} changed · {snapshot.comparison.deferred} deferred</p></article>)}</div></section>}

        <div className="mt-5 rounded-2xl border border-sky-300/15 bg-sky-300/[0.05] p-5 text-xs leading-6 text-sky-100"><Info className="mr-2 inline h-4 w-4 text-sky-300" />A frozen review is a project decision record, not a client approval. It cannot qualify an external laboratory, approve a method, authorize transfer, select a supplier, release procurement or update Atlas rules and benchmarks.</div>
      </div>
    </div>
  );
}

function Heading({ icon: Icon, title, description }: { icon: typeof ShieldCheck; title: string; description: string }) {
  return <div className="flex items-start gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-300/10 text-violet-300"><Icon className="h-4 w-4" /></div><div><h2 className="text-lg font-bold text-white">{title}</h2><p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">{description}</p></div></div>;
}

function Summary({ label, value, tone }: { label: string; value: string; tone: "sky" | "violet" | "amber" | "teal" }) {
  const tones = { sky: "text-sky-200", violet: "text-violet-200", amber: "text-amber-200", teal: "text-teal-200" };
  return <article className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"><p className="text-xs text-slate-500">{label}</p><strong className={`mt-2 block text-2xl ${tones[tone]}`}>{value}</strong></article>;
}

function Fact({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-white/8 bg-slate-950/25 p-3"><dt className="text-[10px] text-slate-600">{label}</dt><dd className="mt-1 break-words text-sm font-bold capitalize text-slate-200">{value}</dd></div>;
}
