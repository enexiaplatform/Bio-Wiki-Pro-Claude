import { FormEvent, useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Download, FileLock2, Filter, History, Network, ShieldCheck, XCircle } from "lucide-react";
import { Link } from "wouter";
import {
  calibrationReviewStatus,
  type CalibrationReviewDecision,
  type CalibrationReviewStatus,
  type QualityLabCalibrationReviewCase,
} from "@shared/quality-lab-calibration-observation";
import { summarizeCalibration } from "@shared/quality-lab-engagement";
import {
  calibrationObservationCounts,
  downloadCalibrationObservationRegistry,
  listCalibrationReviewCases,
  recordCalibrationReviewDecision,
} from "@/lib/quality-lab-calibration-observations";
import { listEngagements } from "@/lib/quality-lab-engagements";
import { useSEO } from "@/hooks/use-seo";
import { analytics } from "@/hooks/use-analytics";
import { EditorialImage } from "@/components/EditorialImage";

const filters: Array<{ id: "all" | CalibrationReviewStatus; label: string }> = [
  { id: "all", label: "All frozen records" },
  { id: "captured", label: "Captured" },
  { id: "eligible", label: "Eligible candidates" },
  { id: "accepted-evidence", label: "Accepted evidence" },
  { id: "rejected", label: "Rejected" },
  { id: "withdrawn", label: "Withdrawn" },
];

const statusStyle: Record<CalibrationReviewStatus, string> = {
  captured: "border-slate-300/20 bg-slate-300/[0.07] text-slate-200",
  eligible: "border-teal-300/25 bg-teal-300/10 text-teal-200",
  "accepted-evidence": "border-violet-300/25 bg-violet-300/10 text-violet-200",
  rejected: "border-red-300/25 bg-red-300/10 text-red-200",
  withdrawn: "border-amber-300/20 bg-amber-300/10 text-amber-200",
};

const inputClass = "w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-violet-300/50";

export default function QualityLabCalibrationQueuePage() {
  const [filter, setFilter] = useState<"all" | CalibrationReviewStatus>("all");
  const [cases, setCases] = useState<QualityLabCalibrationReviewCase[]>(() => listCalibrationReviewCases());
  const counts = useMemo(() => calibrationObservationCounts(cases), [cases]);
  const workingCount = useMemo(() => listEngagements().filter((packet) => summarizeCalibration(packet).observedCount > 0).length, []);
  const visible = cases.filter((item) => filter === "all" || calibrationReviewStatus(item) === filter);
  useSEO({ title: "Calibration Evidence Review Queue", description: "Review immutable estimate-to-actual observations without automatically changing Atlas rules or benchmarks.", noIndex: true });

  function exportRegistry() {
    downloadCalibrationObservationRegistry(cases);
    analytics.calibrationObservationRegistryExported(cases.length, counts["accepted-evidence"]);
  }

  return <div className="min-h-screen bg-[#08111f] px-4 pb-24 pt-8 text-slate-100">
    <div className="mx-auto max-w-6xl">
      <Link href="/quality-lab/projects" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft className="h-4 w-4" /> Quality lab projects</Link>
      <header className="mt-6 overflow-hidden rounded-3xl border border-violet-300/20 bg-gradient-to-br from-violet-300/12 via-sky-300/[0.05] to-transparent p-6 md:p-9">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between"><div><span className="inline-flex items-center gap-2 rounded-full border border-violet-300/25 bg-violet-300/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-200"><Network className="h-3.5 w-3.5" /> Atlas Intelligence governance</span><h1 className="mt-5 text-3xl font-bold md:text-5xl">Calibration Evidence Review Queue</h1><p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">Review frozen project observations as captured records, eligible candidates, accepted calibration evidence, rejected records or withdrawn records. The original observation never changes.</p></div>{cases.length > 0 && <button onClick={exportRegistry} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-300 px-4 py-3 text-sm font-bold text-slate-950"><Download className="h-4 w-4" /> Export frozen registry</button>}</div>
        <div className="mt-6 flex gap-3 rounded-xl border border-amber-300/15 bg-amber-300/[0.05] p-4 text-xs leading-6 text-slate-400"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" /><p><strong className="text-slate-200">Control boundary:</strong> accepting a record means it can be used as project calibration evidence in controlled cross-case review. It does not update an executable rule, approve a universal benchmark, validate the Domain Pack or authorize external use.</p></div>
      </header>

      {cases.length === 0 ? <section className="mt-5 grid overflow-hidden rounded-3xl border border-dashed border-white/15 bg-white/[0.025] md:grid-cols-[0.9fr_1.1fr]">
        <EditorialImage src="/images/editorial/laboratory-record-review.jpg" alt="Laboratory scientist recording identifiers on sample tubes" creditName="Nathan Rimoux" creditUrl="https://unsplash.com/photos/iul3dSPs1G4" className="h-56 md:h-full md:min-h-80" imageClassName="object-center saturate-75" />
        <div className="flex flex-col justify-center p-6 md:p-10"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-300">Freeze before review</p><h2 className="mt-3 text-2xl font-bold">No immutable observations yet</h2><p className="mt-3 max-w-xl text-sm leading-7 text-slate-400">{workingCount > 0 ? `${workingCount} working calibration record${workingCount === 1 ? " has" : "s have"} observed data but remain editable.` : "Start in a real Blueprint engagement workspace and record observed data with controlled evidence provenance."} Complete the variance basis, then freeze a snapshot before it enters this queue.</p><Link href="/quality-lab/projects" className="mt-6 inline-flex w-fit items-center gap-2 rounded-xl bg-teal-300 px-4 py-3 text-sm font-bold text-slate-950">Open a Blueprint project <ArrowRight className="h-4 w-4" /></Link></div>
      </section> : <>
        <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
          <Metric value={counts.captured} label="captured" tone="text-slate-100" />
          <Metric value={counts.eligible} label="eligible" tone="text-teal-200" />
          <Metric value={counts["accepted-evidence"]} label="accepted evidence" tone="text-violet-200" />
          <Metric value={counts.rejected} label="rejected" tone="text-red-200" />
          <Metric value={counts.withdrawn} label="withdrawn" tone="text-amber-200" />
        </section>

        <section className="mt-5"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500"><Filter className="h-4 w-4" /> Review state</div><div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Frozen calibration review status filter">{filters.map((item) => <button key={item.id} onClick={() => setFilter(item.id)} className={`rounded-full border px-3 py-2 text-xs font-bold ${filter === item.id ? "border-violet-300 bg-violet-300 text-slate-950" : "border-white/10 bg-white/[0.03] text-slate-300"}`}>{item.label}</button>)}</div></section>

        <section className="mt-5 space-y-4">
          {visible.length === 0 ? <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.025] px-6 py-14 text-center"><h2 className="text-xl font-bold">No frozen observations in this state</h2><p className="mt-2 text-sm text-slate-500">Choose another state or freeze a new evidence-complete observation.</p></div> : visible.map((reviewCase) => <ReviewCard key={`${reviewCase.observation.observationId}:${calibrationReviewStatus(reviewCase)}`} reviewCase={reviewCase} onUpdated={() => setCases(listCalibrationReviewCases())} />)}
        </section>
      </>}
    </div>
  </div>;
}

function Metric({ value, label, tone }: { value: number; label: string; tone: string }) {
  return <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4"><p className={`text-2xl font-bold ${tone}`}>{value}</p><p className="mt-1 text-xs text-slate-500">{label}</p></div>;
}

function ReviewCard({ reviewCase, onUpdated }: { reviewCase: QualityLabCalibrationReviewCase; onUpdated: () => void }) {
  const observation = reviewCase.observation;
  const status = calibrationReviewStatus(reviewCase);
  const closed = status === "rejected" || status === "withdrawn";
  const [decision, setDecision] = useState<CalibrationReviewDecision>(status === "eligible" ? "accepted-evidence" : status === "accepted-evidence" ? "withdrawn" : "rejected");
  const [reviewedByRole, setReviewedByRole] = useState("");
  const [externalReviewReference, setExternalReviewReference] = useState("");
  const [rationale, setRationale] = useState("");
  const [error, setError] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      recordCalibrationReviewDecision(observation.observationId, { decision, reviewedByRole, externalReviewReference, rationale });
      analytics.calibrationReviewDecisionRecorded(observation.observationId, decision, status);
      onUpdated();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to record the review decision.");
    }
  }

  return <article className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"><div><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${statusStyle[status]}`}>{status.replaceAll("-", " ")}</span><span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{observation.learningDisposition.replaceAll("-", " ")}</span></div><h2 className="mt-3 text-xl font-bold">{observation.source.projectName}</h2><p className="mt-1 text-xs text-slate-500">{observation.source.domainPack} · frozen {new Date(observation.recordedAt).toLocaleString("en-US")}</p></div><Link href={`/quality-lab/engagements/${observation.source.projectId}#calibration`} className="inline-flex items-center gap-2 text-sm font-bold text-teal-300">Open working record <ArrowRight className="h-4 w-4" /></Link></div>
    <div className="mt-4 grid gap-3 md:grid-cols-3"><div className="rounded-xl border border-white/8 bg-black/15 p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Frozen source</p><p className="mt-2 break-all font-mono text-[10px] leading-5 text-violet-200/80">{observation.source.projectRevisionReference}<br />{observation.sourceFingerprint}</p></div><div className="rounded-xl border border-white/8 bg-black/15 p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Observed metrics</p><p className="mt-2 text-sm text-slate-300">{observation.metrics.map((item) => `${item.metric}: ${item.variancePercent ?? "open"}%`).join(" · ")}</p></div><div className="rounded-xl border border-white/8 bg-black/15 p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Evidence provenance</p><p className="mt-2 text-sm text-slate-300">{observation.evidenceRefs.length} reference(s) · {observation.dataOwner}</p></div></div>
    {observation.eligibilityAtFreeze.blockers.length > 0 && <div className="mt-4 rounded-xl border border-amber-300/15 bg-amber-300/[0.04] p-4"><p className="flex items-center gap-2 text-xs font-bold text-amber-200"><AlertTriangle className="h-4 w-4" /> Eligibility frozen with blockers</p><ul className="mt-2 space-y-1 text-xs leading-5 text-slate-400">{observation.eligibilityAtFreeze.blockers.map((item) => <li key={item}>• {item}</li>)}</ul></div>}
    <details className="group mt-4 rounded-xl border border-white/8 bg-black/10">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4"><span className="inline-flex items-center gap-2 text-sm font-bold"><History className="h-4 w-4 text-violet-300" /> Controlled review history</span><span className="text-[10px] text-slate-500">{reviewCase.events.length} event(s)</span></summary>
      <div className="border-t border-white/8 p-4">
        {reviewCase.events.length > 0 ? <ol className="space-y-3">{reviewCase.events.map((item) => <li key={item.eventId} className="rounded-lg border border-white/8 p-3 text-xs leading-5 text-slate-400"><p className="font-bold text-slate-200">{item.decision.replaceAll("-", " ")} · {item.reviewedByRole}</p><p className="mt-1">{item.rationale}</p><p className="mt-1 font-mono text-[10px] text-slate-600">{item.externalReviewReference} · {item.recordedAt}</p></li>)}</ol> : <p className="text-xs text-slate-500">No review decision has been appended.</p>}
        {!closed && <form onSubmit={submit} className="mt-4 grid gap-3 border-t border-white/8 pt-4 md:grid-cols-2"><label className="text-xs text-slate-400">Decision<select aria-label={`Review decision for ${observation.observationId}`} value={decision} onChange={(event) => setDecision(event.target.value as CalibrationReviewDecision)} className={`${inputClass} mt-1`}><option value="accepted-evidence" disabled={status !== "eligible"}>Accept as project calibration evidence</option><option value="rejected" disabled={status === "accepted-evidence"}>Reject observation</option><option value="withdrawn" disabled={status === "captured"}>Withdraw from learning review</option></select></label><label className="text-xs text-slate-400">Reviewed by role<input aria-label={`Reviewed by role for ${observation.observationId}`} value={reviewedByRole} onChange={(event) => setReviewedByRole(event.target.value)} className={`${inputClass} mt-1`} /></label><label className="text-xs text-slate-400 md:col-span-2">External review reference<input aria-label={`External review reference for ${observation.observationId}`} value={externalReviewReference} onChange={(event) => setExternalReviewReference(event.target.value)} className={`${inputClass} mt-1`} placeholder="Controlled board minute, approval or review record ID" /></label><label className="text-xs text-slate-400 md:col-span-2">Decision rationale<textarea aria-label={`Review rationale for ${observation.observationId}`} value={rationale} onChange={(event) => setRationale(event.target.value)} className={`${inputClass} mt-1`} rows={3} /></label>{error && <p role="alert" className="md:col-span-2 text-xs text-red-200">{error}</p>}<button type="submit" className="inline-flex w-fit items-center gap-2 rounded-lg bg-violet-300 px-4 py-2.5 text-xs font-bold text-slate-950">{decision === "accepted-evidence" ? <CheckCircle2 className="h-4 w-4" /> : decision === "rejected" ? <XCircle className="h-4 w-4" /> : <FileLock2 className="h-4 w-4" />} Append review decision</button></form>}
      </div>
    </details>
  </article>;
}
