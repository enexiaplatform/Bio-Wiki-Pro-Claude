import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { Link, useRoute } from "wouter";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  ClipboardCheck,
  Download,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Gauge,
  History,
  ListChecks,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { useSEO } from "@/hooks/use-seo";
import { analytics } from "@/hooks/use-analytics";
import {
  fetchQualityLabReviewedProject,
  fetchQualityLabReviewedProjectRevisions,
  downloadQualityLabDeliveryArtifact,
  getQualityLabProject,
  syncQualityLabReviewedProject,
} from "@/lib/quality-lab-projects";
import {
  downloadCalibration,
  downloadEngagement,
  getOrCreateEngagement,
  saveEngagement,
  setEngagementActual,
} from "@/lib/quality-lab-engagements";
import {
  assessPaidPilotEvidence,
  summarizeCalibration,
  varianceMagnitude,
  type CalibrationMetricKey,
  type QualityLabEngagementPacket,
} from "@shared/quality-lab-engagement";
import { assessQualityLabDeliveryReadiness } from "@shared/quality-lab-delivery";
import { assessValidationCase } from "@shared/quality-lab-validation-cases";
import { useUser } from "@/context/UserContext";
import type { QualityLabProject } from "@shared/quality-lab";

const inputClass = "w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-teal-300/50 focus:ring-2 focus:ring-teal-300/10";
const baselineLabels: Record<keyof QualityLabEngagementPacket["baseline"], string> = {
  monthlyTests: "Monthly tests",
  teamFte: "Team FTE",
  areaSqm: "Area (m²)",
  capexLowUsd: "CAPEX low (USD)",
  capexHighUsd: "CAPEX high (USD)",
};

function WorkspaceDisclosure({
  id,
  title,
  description,
  meta,
  children,
}: {
  id: string;
  title: string;
  description: string;
  meta?: string;
  children: ReactNode;
}) {
  return (
    <details id={id} className="group mt-5 scroll-mt-28 rounded-2xl border border-white/10 bg-white/[0.035]">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 p-5 marker:content-none md:p-6">
        <div>
          <h2 className="text-xl font-bold">{title}</h2>
          <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-400">{description}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {meta && <span className="hidden rounded-full border border-white/10 bg-black/15 px-3 py-1 text-[10px] font-bold uppercase text-slate-400 sm:inline-flex">{meta}</span>}
          <ChevronDown className="mt-1 h-5 w-5 text-slate-500 transition group-open:rotate-180" />
        </div>
      </summary>
      <div className="border-t border-white/10 p-5 md:p-6">{children}</div>
    </details>
  );
}

export default function QualityLabEngagementPage() {
  const [, params] = useRoute("/quality-lab/engagements/:id");
  const localProject = useMemo(() => (params?.id ? getQualityLabProject(params.id) : undefined), [params?.id]);
  const { isAuthenticated } = useUser();
  const [recoveredProject, setRecoveredProject] = useState<QualityLabProject | null>(null);
  const [revisions, setRevisions] = useState<Array<{ revisionNumber: number; createdAt: string; blockingOpenCount: number }>>([]);
  const project = localProject ?? recoveredProject ?? undefined;
  const [packet, setPacket] = useState<QualityLabEngagementPacket | null>(() => (localProject ? getOrCreateEngagement(localProject) : null));
  const [activeMetric, setActiveMetric] = useState<CalibrationMetricKey>("monthlyTests");
  const [correction, setCorrection] = useState({ fieldOrRuleId: "", previousValue: "", correctedValue: "", evidenceRef: "", rationale: "", reviewerRole: "" });
  const [decision, setDecision] = useState({ decision: "", rationale: "", owner: "", downstreamImpact: "", options: "" });
  const [deliveryExport, setDeliveryExport] = useState<"workbook" | "brief" | null>(null);
  const [deliveryError, setDeliveryError] = useState("");

  useSEO({
    title: "Blueprint Engagement Workspace",
    description: "Resolve evidence, record corrections and capture project decisions for an Atlas Quality Lab Blueprint.",
    noIndex: true,
  });

  useEffect(() => {
    if (localProject) {
      setRecoveredProject(null);
      setPacket(getOrCreateEngagement(localProject));
      return;
    }
    if (!isAuthenticated || !params?.id) return;
    let active = true;
    fetchQualityLabReviewedProject(params.id)
      .then((snapshot) => {
        if (!active || !snapshot) return;
        const recovered: QualityLabProject = {
          id: snapshot.localProjectId,
          name: snapshot.projectName,
          input: snapshot.input,
          blueprint: snapshot.blueprint,
          createdAt: snapshot.blueprint.generatedAt,
          updatedAt: snapshot.blueprint.generatedAt,
          reviewRequestedAt: snapshot.reviewRequestedAt ?? undefined,
        };
        setRecoveredProject(recovered);
        setPacket(snapshot.engagement ?? getOrCreateEngagement(recovered));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [isAuthenticated, localProject, params?.id]);

  useEffect(() => {
    if (!isAuthenticated || !project?.reviewRequestedAt) return;
    fetchQualityLabReviewedProjectRevisions(project.id).then(setRevisions).catch(() => undefined);
  }, [isAuthenticated, project?.id, project?.reviewRequestedAt]);

  if (!project || !packet) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">{isAuthenticated ? "Loading reviewed project…" : "Engagement project not found"}</h1>
        <Link href="/quality-lab/projects" className="mt-5 inline-block text-teal-300">Open saved projects</Link>
      </div>
    );
  }

  function persist(next: QualityLabEngagementPacket) {
    const saved = saveEngagement(next);
    const reviewedProject = project;
    setPacket(saved);
    if (isAuthenticated && reviewedProject?.reviewRequestedAt) {
      syncQualityLabReviewedProject(reviewedProject, saved).catch(() => undefined);
    }
  }

  function addCorrection(event: FormEvent) {
    event.preventDefault();
    persist({
      ...packet!,
      corrections: [
        ...packet!.corrections,
        { id: `cor_${Date.now().toString(36)}`, recordedAt: new Date().toISOString(), ...correction },
      ],
    });
    setCorrection({ fieldOrRuleId: "", previousValue: "", correctedValue: "", evidenceRef: "", rationale: "", reviewerRole: "" });
  }

  function addDecision(event: FormEvent) {
    event.preventDefault();
    persist({
      ...packet!,
      decisions: [
        ...packet!.decisions,
        {
          id: `dec_${Date.now().toString(36)}`,
          recordedAt: new Date().toISOString(),
          decision: decision.decision,
          rationale: decision.rationale,
          owner: decision.owner,
          downstreamImpact: decision.downstreamImpact,
          optionsConsidered: decision.options.split("\n").map((value) => value.trim()).filter(Boolean),
        },
      ],
    });
    setDecision({ decision: "", rationale: "", owner: "", downstreamImpact: "", options: "" });
  }

  const resolved = packet.checklist.filter((item) => item.status === "resolved" || item.status === "not-applicable").length;
  const openChecklist = packet.checklist.filter((item) => item.status === "open" || item.status === "in-review");
  const nextChecklistItem = openChecklist[0];
  const calibrationSummary = summarizeCalibration(packet);
  const deliveryReadiness = assessQualityLabDeliveryReadiness(project, packet);
  const pilotEvidence = assessPaidPilotEvidence(packet, deliveryReadiness);
  const validationCase = assessValidationCase(packet);
  const selectedBaseline = packet.baseline[activeMetric];
  const selectedMetricNote = packet.calibration.metricNotes.find((row) => row.metric === activeMetric)!;
  const selectedVarianceBand = varianceMagnitude(selectedBaseline.variancePercent);

  function updateCalibration(patch: Partial<QualityLabEngagementPacket["calibration"]>) {
    persist({ ...packet!, calibration: { ...packet!.calibration, ...patch } });
  }

  function updateMetricNote(metric: CalibrationMetricKey, patch: Partial<QualityLabEngagementPacket["calibration"]["metricNotes"][number]>) {
    updateCalibration({
      metricNotes: packet!.calibration.metricNotes.map((item) => (item.metric === metric ? { ...item, ...patch } : item)),
    });
  }

  function updateDeliveryControl(patch: Partial<QualityLabEngagementPacket["deliveryControl"]>) {
    persist({ ...packet!, deliveryControl: { ...packet!.deliveryControl, ...patch } });
  }

  function updatePilotControl(patch: Partial<QualityLabEngagementPacket["pilotControl"]>) {
    persist({ ...packet!, pilotControl: { ...packet!.pilotControl, ...patch } });
  }

  function updateValidationControl(patch: Partial<QualityLabEngagementPacket["validationControl"]>) {
    persist({ ...packet!, validationControl: { ...packet!.validationControl, ...patch } });
  }

  async function exportDeliveryArtifact(artifact: "workbook" | "brief") {
    setDeliveryError("");
    const activeProject = project;
    if (!isAuthenticated || !activeProject?.reviewRequestedAt) {
      setDeliveryError("Sign in and submit the expert-review brief before generating controlled delivery files.");
      return;
    }
    setDeliveryExport(artifact);
    try {
      await syncQualityLabReviewedProject(activeProject, packet!);
      await downloadQualityLabDeliveryArtifact(activeProject.id, artifact);
      analytics.engagementPacketDownloaded(artifact === "workbook" ? "delivery_workbook" : "delivery_brief_pdf", deliveryReadiness.blockers.length);
    } catch (error) {
      setDeliveryError(error instanceof Error ? error.message : "Unable to prepare the delivery file.");
    } finally {
      setDeliveryExport(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#08111f] px-4 pb-24 pt-6 text-slate-100 md:pt-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href={`/quality-lab/projects/${project.id}`} className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Back to blueprint
          </Link>
          <div className="flex flex-wrap gap-4"><Link href="/quality-lab/pilots" className="text-sm font-bold text-teal-300 hover:text-teal-200">Open paid pilot portfolio</Link><Link href="/quality-lab/calibration" className="text-sm font-bold text-sky-300 hover:text-sky-200">Open learning review queue</Link><Link href="/quality-lab/validation-cases" className="text-sm font-bold text-violet-300 hover:text-violet-200">Open validation registry</Link></div>
        </div>

        <header className="mt-5 rounded-3xl border border-teal-300/20 bg-gradient-to-br from-teal-300/10 to-slate-950 p-5 md:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_300px] lg:items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-300">Service-assisted review workspace</p>
              <h1 className="mt-2 max-w-3xl text-3xl font-bold md:text-4xl">{project.name}</h1>
              <p className="mt-3 text-sm text-slate-400">{packet.packetVersion} · {resolved}/{packet.checklist.length} review items resolved</p>
            </div>
            <details className="group rounded-xl border border-white/10 bg-black/15">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-bold marker:content-none">
                <span className="inline-flex items-center gap-2"><Download className="h-4 w-4 text-teal-300" /> Exports and handoff</span>
                <ChevronDown className="h-4 w-4 text-slate-500 transition group-open:rotate-180" />
              </summary>
              <div className="space-y-2 border-t border-white/10 p-3">
                <button type="button" disabled={deliveryExport !== null} onClick={() => exportDeliveryArtifact("workbook")} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-teal-300 px-3 py-2.5 text-xs font-bold text-slate-950 disabled:cursor-wait disabled:opacity-60">
                  <FileSpreadsheet className="h-4 w-4" /> {deliveryExport === "workbook" ? "Preparing workbook…" : "Blueprint delivery workbook"}
                </button>
                <button type="button" disabled={deliveryExport !== null} onClick={() => exportDeliveryArtifact("brief")} className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-sky-300/25 bg-sky-300/10 px-3 py-2.5 text-xs font-bold text-sky-200 disabled:cursor-wait disabled:opacity-60">
                  <FileText className="h-4 w-4" /> {deliveryExport === "brief" ? "Preparing brief…" : "Decision brief PDF"}
                </button>
                <button type="button" onClick={() => { downloadCalibration(packet); analytics.engagementPacketDownloaded("calibration_csv", packet.checklist.length - resolved); }} className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-teal-300/25 bg-teal-300/10 px-3 py-2.5 text-xs font-bold text-teal-200">
                  <Download className="h-4 w-4" /> Export calibration CSV
                </button>
                <button type="button" onClick={() => { downloadEngagement(packet); analytics.engagementPacketDownloaded("engagement_workspace", packet.checklist.length - resolved); }} className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-bold text-slate-200">
                  <Download className="h-4 w-4" /> Export working packet
                </button>
                {deliveryError && <p role="alert" className="rounded-lg border border-red-300/20 bg-red-300/10 p-2 text-[11px] leading-4 text-red-200">{deliveryError}</p>}
              </div>
            </details>
          </div>
          <div className="mt-5 flex gap-3 rounded-xl border border-amber-300/15 bg-amber-300/[0.05] p-4 text-xs leading-5 text-slate-400">
            <ShieldCheck className="h-5 w-5 shrink-0 text-amber-300" /> This workspace records review work; it does not approve the Blueprint. Controlled approval remains under the client quality system.
          </div>
        </header>

        <section aria-labelledby="workspace-status-heading" className="mt-5 rounded-2xl border border-white/10 bg-white/[0.035] p-5 md:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-300">Workspace status</p>
              <h2 id="workspace-status-heading" className="mt-2 text-2xl font-bold">Move evidence into reviewable decisions.</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Resolve the evidence checklist first. Add calibration only when observed data exists, then record corrections and project decisions before export.</p>
            </div>
            {nextChecklistItem ? (
              <a href="#evidence-review" className="group rounded-xl border border-amber-300/20 bg-amber-300/[0.06] p-4 lg:max-w-sm">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-200">Next best action</span>
                <span className="mt-2 block text-sm font-semibold leading-5 text-slate-100 group-hover:text-white">{nextChecklistItem.question}</span>
                <span className="mt-2 block text-xs text-slate-500">Owner: {nextChecklistItem.ownerRole}</span>
              </a>
            ) : (
              <div className="rounded-xl border border-teal-300/20 bg-teal-300/[0.06] p-4 text-sm font-semibold text-teal-200">Evidence checklist complete</div>
            )}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { icon: ListChecks, value: `${resolved}/${packet.checklist.length}`, label: "evidence items resolved" },
              { icon: Gauge, value: `${calibrationSummary.coveragePercent}%`, label: "metrics observed" },
              { icon: FileCheck2, value: packet.corrections.length, label: "corrections recorded" },
              { icon: CheckCircle2, value: packet.decisions.length, label: "decisions recorded" },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="rounded-xl border border-white/8 bg-black/15 p-4">
                <Icon className="h-4 w-4 text-teal-300" />
                <strong className="mt-3 block text-xl text-white">{value}</strong>
                <span className="mt-1 block text-[11px] leading-4 text-slate-500">{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="pilot-evidence" aria-labelledby="pilot-evidence-heading" className="mt-5 scroll-mt-28 rounded-2xl border border-sky-300/15 bg-sky-300/[0.035] p-5 md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-300">Gate 1 evidence</p>
              <h2 id="pilot-evidence-heading" className="mt-2 text-xl font-bold">Paid-pilot record</h2>
              <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-400">Record controlled references and delivery metrics only after they exist. Do not paste invoices, confidential payment details or client-controlled content into Atlas.</p>
            </div>
            <span className={`w-fit rounded-full border px-3 py-1 text-[10px] font-bold uppercase ${pilotEvidence.eligibility === "eligible-gate-1-pilot-record" ? "border-teal-300/25 bg-teal-300/10 text-teal-200" : "border-amber-300/20 bg-amber-300/10 text-amber-200"}`}>{pilotEvidence.eligibility.replaceAll("-", " ")}</span>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <label className="text-xs text-slate-400">Engagement class<select aria-label="Pilot engagement class" value={packet.pilotControl.engagementClass} onChange={(event) => updatePilotControl({ engagementClass: event.target.value as QualityLabEngagementPacket["pilotControl"]["engagementClass"] })} className={`${inputClass} mt-1`}><option value="unclassified">Not classified</option><option value="discovery">Discovery engagement</option><option value="blueprint">Blueprint engagement</option></select></label>
            <label className="text-xs text-slate-400">Commercial status<select aria-label="Pilot commercial status" value={packet.pilotControl.commercialStatus} onChange={(event) => updatePilotControl({ commercialStatus: event.target.value as QualityLabEngagementPacket["pilotControl"]["commercialStatus"] })} className={`${inputClass} mt-1`}><option value="not-recorded">Not recorded</option><option value="qualified-unpaid">Qualified, unpaid</option><option value="paid">Paid — evidence referenced</option></select></label>
            <label className="text-xs text-slate-400">Commercial evidence reference<input aria-label="Commercial evidence reference" value={packet.pilotControl.commercialEvidenceReference} onChange={(event) => updatePilotControl({ commercialEvidenceReference: event.target.value })} className={`${inputClass} mt-1`} placeholder="CRM opportunity or invoice-status reference" /></label>
            <label className="text-xs text-slate-400">Service started<input aria-label="Pilot service started" type="datetime-local" value={packet.pilotControl.serviceStartedAt} onChange={(event) => updatePilotControl({ serviceStartedAt: event.target.value })} className={`${inputClass} mt-1`} /></label>
            <label className="text-xs text-slate-400">Scope confirmed<input aria-label="Pilot scope confirmed" type="datetime-local" value={packet.pilotControl.scopeConfirmedAt} onChange={(event) => updatePilotControl({ scopeConfirmedAt: event.target.value })} className={`${inputClass} mt-1`} /></label>
            <label className="text-xs text-slate-400">First controlled delivery<input aria-label="Pilot first controlled delivery" type="datetime-local" value={packet.pilotControl.firstControlledDeliveryAt} onChange={(event) => updatePilotControl({ firstControlledDeliveryAt: event.target.value })} className={`${inputClass} mt-1`} /></label>
            <label className="text-xs text-slate-400">Delivery effort hours<input aria-label="Pilot delivery effort hours" type="number" min="0" step="0.5" value={packet.pilotControl.deliveryEffortHours ?? ""} onChange={(event) => updatePilotControl({ deliveryEffortHours: event.target.value === "" ? null : Number(event.target.value) })} className={`${inputClass} mt-1`} placeholder="Measured effort" /></label>
            <label className="text-xs text-slate-400">Client acceptance status<select aria-label="Pilot client acceptance status" value={packet.pilotControl.acceptanceStatus} onChange={(event) => updatePilotControl({ acceptanceStatus: event.target.value as QualityLabEngagementPacket["pilotControl"]["acceptanceStatus"] })} className={`${inputClass} mt-1`}><option value="not-requested">Not requested</option><option value="pending">Pending</option><option value="accepted">Accepted</option><option value="accepted-with-actions">Accepted with actions</option><option value="not-accepted">Not accepted</option></select></label>
            <label className="text-xs text-slate-400">Client acceptance time<input aria-label="Pilot client acceptance time" type="datetime-local" value={packet.pilotControl.clientAcceptanceAt} onChange={(event) => updatePilotControl({ clientAcceptanceAt: event.target.value })} className={`${inputClass} mt-1`} /></label>
            <label className="text-xs text-slate-400 md:col-span-2">Acceptance reference<input aria-label="Pilot acceptance reference" value={packet.pilotControl.acceptanceReference} onChange={(event) => updatePilotControl({ acceptanceReference: event.target.value })} className={`${inputClass} mt-1`} placeholder="Controlled meeting minute, email or client document reference" /></label>
            <label className="text-xs text-slate-400 md:col-span-2 lg:col-span-3">Outcome note<textarea aria-label="Pilot outcome note" value={packet.pilotControl.outcomeNote} onChange={(event) => updatePilotControl({ outcomeNote: event.target.value })} className={`${inputClass} mt-1`} rows={2} placeholder="Decision outcome and remaining client actions; no confidential content" /></label>
          </div>
          <div className="mt-5 grid gap-3 lg:grid-cols-[220px_1fr]">
            <div className="rounded-xl border border-white/8 bg-black/15 p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Measured delivery</p><p className="mt-3 text-xl font-bold text-white">{pilotEvidence.deliveryCalendarDays === null ? "Open" : `${pilotEvidence.deliveryCalendarDays} days`}</p><p className="mt-1 text-xs text-slate-500">{pilotEvidence.deliveryEffortHours === null ? "Effort hours open" : `${pilotEvidence.deliveryEffortHours} effort hours`}</p></div>
            <div className="rounded-xl border border-amber-300/15 bg-amber-300/[0.04] p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-amber-200">Pilot evidence blockers</p><div className="mt-3 grid gap-2 md:grid-cols-2">{pilotEvidence.blockers.length ? pilotEvidence.blockers.map((item) => <p key={item} className="flex gap-2 text-xs leading-5 text-slate-400"><CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" />{item}</p>) : <p className="text-xs text-teal-200">Evidence-complete paid-pilot record. Portfolio-level Gate 1 still requires three real engagements.</p>}</div></div>
          </div>
        </section>

        <section id="delivery-control" aria-labelledby="delivery-control-heading" className="mt-5 scroll-mt-28 rounded-2xl border border-white/10 bg-white/[0.035] p-5 md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300">Blueprint Delivery v1</p>
              <h2 id="delivery-control-heading" className="mt-2 text-xl font-bold">Controlled handoff readiness</h2>
              <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-400">The workbook and decision brief carry these identifiers, source versions, open items and release boundaries into the client handoff.</p>
            </div>
            <span className={`w-fit rounded-full border px-3 py-1 text-[10px] font-bold uppercase ${deliveryReadiness.status === "working-draft" ? "border-amber-300/20 bg-amber-300/10 text-amber-200" : "border-teal-300/25 bg-teal-300/10 text-teal-200"}`}>{deliveryReadiness.status.replaceAll("-", " ")}</span>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <label className="text-xs text-slate-400">Document ID<input value={packet.deliveryControl.documentId} onChange={(event) => updateDeliveryControl({ documentId: event.target.value })} className={`${inputClass} mt-1`} placeholder="CLIENT-QLB-001" /></label>
            <label className="text-xs text-slate-400">Revision<input value={packet.deliveryControl.revision} onChange={(event) => updateDeliveryControl({ revision: event.target.value })} className={`${inputClass} mt-1`} placeholder="D0" /></label>
            <label className="text-xs text-slate-400">Recorded status<select value={packet.deliveryControl.recordedStatus} onChange={(event) => updateDeliveryControl({ recordedStatus: event.target.value as QualityLabEngagementPacket["deliveryControl"]["recordedStatus"] })} className={`${inputClass} mt-1`}><option value="working-draft">Working draft</option><option value="ready-for-qualified-review">Ready for qualified review</option><option value="recorded-external-release">Record external release</option></select></label>
            <label className="text-xs text-slate-400">Prepared by role<input value={packet.deliveryControl.preparedByRole} onChange={(event) => updateDeliveryControl({ preparedByRole: event.target.value })} className={`${inputClass} mt-1`} placeholder="Atlas project lead" /></label>
            <label className="text-xs text-slate-400">Reviewed by role<input value={packet.deliveryControl.reviewedByRole} onChange={(event) => updateDeliveryControl({ reviewedByRole: event.target.value })} className={`${inputClass} mt-1`} placeholder="Qualified microbiology SME" /></label>
            <label className="text-xs text-slate-400">External approval reference<input value={packet.deliveryControl.externalApprovalReference} onChange={(event) => updateDeliveryControl({ externalApprovalReference: event.target.value })} className={`${inputClass} mt-1`} placeholder="Client-controlled document reference" /></label>
            <label className="text-xs text-slate-400 md:col-span-2 lg:col-span-3">Intended use<textarea value={packet.deliveryControl.intendedUse} onChange={(event) => updateDeliveryControl({ intendedUse: event.target.value })} className={`${inputClass} mt-1 min-h-20 py-2`} rows={2} /></label>
          </div>
          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            <div className="rounded-xl border border-amber-300/15 bg-amber-300/[0.04] p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-200">Release blockers</p>
              <div className="mt-3 space-y-2">{deliveryReadiness.blockers.length ? deliveryReadiness.blockers.map((item) => <p key={item} className="flex gap-2 text-xs leading-5 text-slate-400"><CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" />{item}</p>) : <p className="text-xs text-teal-200">No readiness blockers recorded. Qualified review is still required.</p>}</div>
            </div>
            <div className="rounded-xl border border-white/8 bg-black/15 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Delivery contents</p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px] text-slate-500"><span aria-label="11 workbook sheets"><strong className="block text-lg text-slate-100">11</strong>workbook sheets</span><span aria-label="1 decision brief"><strong className="block text-lg text-slate-100">1</strong>decision brief</span><span aria-label="version 1 package contract"><strong className="block text-lg text-slate-100">v1</strong>package contract</span></div>
            </div>
          </div>
        </section>

        <nav aria-label="Review workspace sections" className="sticky top-2 z-20 mt-5 flex gap-2 overflow-x-auto rounded-xl border border-white/10 bg-[#0b1525]/95 p-2 shadow-xl shadow-black/20 backdrop-blur">
          {[
            ["Pilot evidence", "#pilot-evidence"],
            ["Delivery control", "#delivery-control"],
            ["Evidence review", "#evidence-review"],
            ["Calibration", "#calibration"],
            ["Validation case", "#validation-case"],
            ["Method evidence", "#method-evidence"],
            ["Corrections & decisions", "#decision-records"],
          ].map(([label, href]) => <a key={href} href={href} className="shrink-0 rounded-lg px-3 py-2 text-xs font-bold text-slate-400 transition hover:bg-white/5 hover:text-white">{label}</a>)}
        </nav>

        <section id="evidence-review" className="mt-5 scroll-mt-28 rounded-2xl border border-white/10 bg-white/[0.035] p-5 md:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <ClipboardCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal-300" />
              <div>
                <h2 className="text-xl font-bold">Evidence and review checklist</h2>
                <p className="mt-1 text-xs leading-5 text-slate-400">Work from controlled source material. Expand an item to capture the evidence reference and reviewer note.</p>
              </div>
            </div>
            <span className="w-fit rounded-full border border-white/10 bg-black/15 px-3 py-1 text-[10px] font-bold uppercase text-slate-400">{openChecklist.length} still open</span>
          </div>
          <div className="mt-5 space-y-3">
            {packet.checklist.map((item) => (
              <article key={item.id} className={`rounded-xl border p-4 ${item.status === "resolved" || item.status === "not-applicable" ? "border-teal-300/15 bg-teal-300/[0.035]" : "border-white/8 bg-black/15"}`}>
                <div className="grid gap-3 md:grid-cols-[1fr_180px] md:items-start">
                  <div className="flex gap-3">
                    {item.status === "resolved" || item.status === "not-applicable" ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" /> : <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />}
                    <div>
                      <p className="text-sm font-bold leading-5">{item.question}</p>
                      <p className="mt-1 text-[11px] text-slate-500">Owner: {item.ownerRole}</p>
                    </div>
                  </div>
                  <select aria-label={`Status for ${item.question}`} value={item.status} onChange={(event) => persist({ ...packet, checklist: packet.checklist.map((row) => row.id === item.id ? { ...row, status: event.target.value as typeof row.status } : row) })} className={inputClass}>
                    <option value="open">Open</option>
                    <option value="in-review">In review</option>
                    <option value="resolved">Resolved</option>
                    <option value="not-applicable">Not applicable</option>
                  </select>
                </div>
                <details className="group mt-3 border-t border-white/8 pt-3">
                  <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-bold text-sky-300 marker:content-none">
                    Evidence needed and reviewer note
                    <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 text-xs leading-5 text-slate-400"><strong className="text-slate-300">Evidence:</strong> {item.requiredEvidence}</p>
                  <textarea aria-label={`Reviewer note for ${item.question}`} value={item.reviewerNote} onChange={(event) => persist({ ...packet, checklist: packet.checklist.map((row) => row.id === item.id ? { ...row, reviewerNote: event.target.value } : row) })} className={`${inputClass} mt-3`} rows={2} placeholder="Reviewer note and evidence reference" />
                </details>
              </article>
            ))}
          </div>
        </section>

        <section id="calibration" className="mt-5 scroll-mt-28 rounded-2xl border border-white/10 bg-white/[0.035] p-5 md:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-xl font-bold">Estimate-to-actual calibration</h2>
              <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-400">Choose one metric, record the observed result, then explain its basis and variance. Empty metrics remain visibly open without showing five full forms at once.</p>
            </div>
            <span className={`w-fit rounded-full border px-3 py-1 text-[10px] font-bold uppercase ${calibrationSummary.reviewReady ? "border-teal-300/25 bg-teal-300/10 text-teal-200" : "border-amber-300/20 bg-amber-300/10 text-amber-200"}`}>{calibrationSummary.reviewReady ? "Review ready" : "Evidence incomplete"}</span>
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {(Object.keys(packet.baseline) as CalibrationMetricKey[]).map((key) => {
              const item = packet.baseline[key];
              const band = varianceMagnitude(item.variancePercent);
              const isActive = key === activeMetric;
              return (
                <button type="button" key={key} onClick={() => setActiveMetric(key)} aria-pressed={isActive} className={`rounded-xl border p-3 text-left transition ${isActive ? "border-teal-300/40 bg-teal-300/[0.09]" : "border-white/8 bg-black/15 hover:border-white/20"}`}>
                  <span className="block text-xs font-semibold text-slate-200">{baselineLabels[key]}</span>
                  <span className="mt-2 block text-[11px] text-slate-500">Estimate {item.estimate.toLocaleString()}</span>
                  <span className={`mt-2 block text-xs font-bold ${band === "over-25" ? "text-red-200" : band === "10-to-25" ? "text-amber-200" : item.actual === null ? "text-slate-500" : "text-teal-200"}`}>{item.actual === null ? "Actual open" : `${item.variancePercent}% variance`}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 rounded-xl border border-teal-300/15 bg-black/15 p-4 md:p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-bold text-white">{baselineLabels[activeMetric]}</p>
                <p className="mt-1 text-xs text-slate-500">Estimate: {selectedBaseline.estimate.toLocaleString()}</p>
              </div>
              <span className={`text-xs font-bold ${selectedVarianceBand === "over-25" ? "text-red-200" : selectedVarianceBand === "10-to-25" ? "text-amber-200" : "text-teal-200"}`}>Variance: {selectedBaseline.variancePercent === null ? "open" : `${selectedBaseline.variancePercent}%`}</span>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="text-xs text-slate-400">Observed actual
                <input aria-label={`${baselineLabels[activeMetric]} actual`} type="number" min="0" step="any" value={selectedBaseline.actual ?? ""} onChange={(event) => persist(setEngagementActual(packet, activeMetric, event.target.value === "" ? null : Number(event.target.value)))} className={`${inputClass} mt-1`} placeholder="Actual" />
              </label>
              <label className="text-xs text-slate-400">Primary variance driver
                <select aria-label={`${baselineLabels[activeMetric]} variance driver`} value={selectedMetricNote.varianceDriver} onChange={(event) => updateMetricNote(activeMetric, { varianceDriver: event.target.value as typeof selectedMetricNote.varianceDriver })} className={`${inputClass} mt-1`}>
                  <option value="not-assessed">Driver not assessed</option>
                  <option value="input-quality">Input quality</option>
                  <option value="scope-change">Scope change</option>
                  <option value="rule-assumption">Rule assumption</option>
                  <option value="site-performance">Site performance</option>
                  <option value="market-price">Market price</option>
                  <option value="implementation-choice">Implementation choice</option>
                  <option value="mixed">Mixed drivers</option>
                </select>
              </label>
              <label className="text-xs text-slate-400">Actual basis / calculation
                <textarea aria-label={`${baselineLabels[activeMetric]} actual basis`} value={selectedMetricNote.actualBasis} onChange={(event) => updateMetricNote(activeMetric, { actualBasis: event.target.value })} className={`${inputClass} mt-1`} rows={3} placeholder="Controlled source and calculation basis" />
              </label>
              <label className="text-xs text-slate-400">Reviewer interpretation
                <textarea aria-label={`${baselineLabels[activeMetric]} calibration note`} value={selectedMetricNote.reviewerNote} onChange={(event) => updateMetricNote(activeMetric, { reviewerNote: event.target.value })} className={`${inputClass} mt-1`} rows={3} placeholder="What changed and why it matters" />
              </label>
            </div>
          </div>

          <details className="group mt-4 rounded-xl border border-white/8 bg-black/15">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 marker:content-none">
              <div>
                <p className="text-sm font-bold">Observation provenance and learning disposition</p>
                <p className="mt-1 text-[11px] text-slate-500">Required before a calibration can enter controlled learning review.</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-bold uppercase ${calibrationSummary.provenanceComplete ? "text-teal-200" : "text-amber-200"}`}>{calibrationSummary.provenanceComplete ? "Complete" : "Open"}</span>
                <ChevronDown className="h-4 w-4 text-slate-500 transition group-open:rotate-180" />
              </div>
            </summary>
            <div className="grid gap-4 border-t border-white/8 p-4 md:grid-cols-2 lg:grid-cols-4">
              <label className="text-xs text-slate-400">Observed period start<input aria-label="Observed period start" type="date" value={packet.calibration.observedPeriodStart} onChange={(event) => updateCalibration({ observedPeriodStart: event.target.value })} className={`${inputClass} mt-1`} /></label>
              <label className="text-xs text-slate-400">Observed period end<input aria-label="Observed period end" type="date" value={packet.calibration.observedPeriodEnd} onChange={(event) => updateCalibration({ observedPeriodEnd: event.target.value })} className={`${inputClass} mt-1`} /></label>
              <label className="text-xs text-slate-400">Data owner<input aria-label="Calibration data owner" value={packet.calibration.dataOwner} onChange={(event) => updateCalibration({ dataOwner: event.target.value })} className={`${inputClass} mt-1`} placeholder="Role or controlled function" /></label>
              <label className="text-xs text-slate-400">Calibration status<select aria-label="Calibration status" value={packet.calibration.status} onChange={(event) => updateCalibration({ status: event.target.value as typeof packet.calibration.status, reviewedAt: event.target.value === "reviewed" ? new Date().toISOString() : null })} className={`${inputClass} mt-1`}><option value="draft">Draft</option><option value="observed">Observed</option><option value="review-ready">Review ready</option><option value="reviewed">Reviewed for learning</option></select></label>
              <label className="text-xs text-slate-400 md:col-span-2">Controlled evidence references (one per line)<textarea aria-label="Calibration evidence references" value={packet.calibration.evidenceRefs.join("\n")} onChange={(event) => updateCalibration({ evidenceRefs: event.target.value.split("\n").map((value) => value.trim()).filter(Boolean) })} className={`${inputClass} mt-1`} rows={3} placeholder="Document ID, approved report, purchase record, time study…" /></label>
              <label className="text-xs text-slate-400">Learning disposition<select aria-label="Learning disposition" value={packet.calibration.learningDisposition} onChange={(event) => updateCalibration({ learningDisposition: event.target.value as typeof packet.calibration.learningDisposition })} className={`${inputClass} mt-1`}><option value="hold">Hold — evidence incomplete</option><option value="project-only">Project only</option><option value="candidate-rule-update">Candidate rule update</option><option value="candidate-benchmark">Candidate benchmark</option></select></label>
              <label className="text-xs text-slate-400">Reviewed by role<input aria-label="Calibration reviewed by role" value={packet.calibration.reviewedByRole} onChange={(event) => updateCalibration({ reviewedByRole: event.target.value })} className={`${inputClass} mt-1`} placeholder="Qualified reviewer role" /></label>
              <label className="text-xs text-slate-400 md:col-span-2">Applicable rule IDs (one per line)<textarea aria-label="Applicable calibration rule IDs" value={packet.calibration.applicableRuleIds.join("\n")} onChange={(event) => updateCalibration({ applicableRuleIds: event.target.value.split("\n").map((value) => value.trim()).filter(Boolean) })} className={`${inputClass} mt-1`} rows={3} placeholder={project.blueprint.ruleTrace.slice(0, 3).map((rule) => rule.ruleId).join("\n")} /></label>
              <label className="text-xs text-slate-400 md:col-span-2">Disposition rationale<textarea aria-label="Calibration disposition rationale" value={packet.calibration.dispositionRationale} onChange={(event) => updateCalibration({ dispositionRationale: event.target.value })} className={`${inputClass} mt-1`} rows={3} placeholder="Why this learning should remain local or enter controlled rule/benchmark review" /></label>
            </div>
          </details>

          <div className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
            <span className="rounded-lg border border-white/8 p-3 text-slate-400"><strong className="block text-lg text-slate-100">{calibrationSummary.coveragePercent}%</strong>metrics observed</span>
            <span className="rounded-lg border border-white/8 p-3 text-slate-400"><strong className="block text-lg text-slate-100">{calibrationSummary.materialVarianceCount}</strong>variances over 25%</span>
            <span className="rounded-lg border border-white/8 p-3 text-slate-400"><strong className="block text-sm text-slate-100">{calibrationSummary.provenanceComplete ? "Complete" : "Open"}</strong>provenance</span>
            <span className="rounded-lg border border-white/8 p-3 text-slate-400"><strong className="block text-sm text-slate-100">{calibrationSummary.notesComplete ? "Classified" : "Open"}</strong>variance drivers</span>
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] leading-5 text-amber-200/70">{calibrationSummary.notice}</p>
            <Link href="/blog/how-to-validate-a-quality-lab-domain-pack" className="shrink-0 text-[11px] font-bold text-teal-300">Validation framework</Link>
          </div>
        </section>

        <WorkspaceDisclosure id="validation-case" title="Controlled validation-case acceptance" description="Promote reviewed project evidence only after baseline, scope, permission, evidence quality and reviewer acceptance are controlled." meta={validationCase.eligibility.replaceAll("-", " ")}>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <label className="text-xs text-slate-400">Validation case ID<input aria-label="Validation case ID" value={packet.validationControl.caseId} onChange={(event) => updateValidationControl({ caseId: event.target.value })} className={`${inputClass} mt-1`} /></label>
            <label className="text-xs text-slate-400">Case status<select aria-label="Validation case status" value={packet.validationControl.status} onChange={(event) => updateValidationControl({ status: event.target.value as QualityLabEngagementPacket["validationControl"]["status"], acceptedAt: event.target.value === "accepted" ? new Date().toISOString() : null })} className={`${inputClass} mt-1`}><option value="draft">Draft</option><option value="in-review">In review</option><option value="accepted">Accepted as validation case</option><option value="rejected">Rejected</option></select></label>
            <label className="text-xs text-slate-400">Baseline frozen at<input aria-label="Validation baseline frozen at" type="datetime-local" value={packet.validationControl.baselineFrozenAt.slice(0, 16)} onChange={(event) => updateValidationControl({ baselineFrozenAt: event.target.value })} className={`${inputClass} mt-1`} /></label>
            <label className="text-xs text-slate-400">Confidentiality class<select aria-label="Validation confidentiality class" value={packet.validationControl.confidentialityClass} onChange={(event) => updateValidationControl({ confidentialityClass: event.target.value as QualityLabEngagementPacket["validationControl"]["confidentialityClass"] })} className={`${inputClass} mt-1`}><option value="not-classified">Not classified</option><option value="client-confidential">Client confidential</option><option value="internal-anonymized">Internal anonymized</option><option value="shareable">Shareable</option></select></label>
            <label className="text-xs text-slate-400">Learning-use permission<select aria-label="Validation learning use permission" value={packet.validationControl.learningUsePermission} onChange={(event) => updateValidationControl({ learningUsePermission: event.target.value as QualityLabEngagementPacket["validationControl"]["learningUsePermission"] })} className={`${inputClass} mt-1`}><option value="not-assessed">Not assessed</option><option value="project-validation-only">Project validation only</option><option value="internal-anonymized-learning">Internal anonymized learning permitted</option></select></label>
            <label className="text-xs text-slate-400">Scope alignment<select aria-label="Validation scope alignment" value={packet.validationControl.scopeAlignment} onChange={(event) => updateValidationControl({ scopeAlignment: event.target.value as QualityLabEngagementPacket["validationControl"]["scopeAlignment"] })} className={`${inputClass} mt-1`}><option value="unknown">Unknown</option><option value="yes">Aligned to frozen estimate</option><option value="partial">Partially aligned</option><option value="no">Not aligned</option></select></label>
            <label className="text-xs text-slate-400 md:col-span-2 lg:col-span-3">Validation question and intended learning<textarea aria-label="Validation case purpose" value={packet.validationControl.casePurpose} onChange={(event) => updateValidationControl({ casePurpose: event.target.value })} className={`${inputClass} mt-1`} rows={2} placeholder="What rule or estimate is being tested, for which scope, and why?" /></label>
            <label className="text-xs text-slate-400 md:col-span-2">Qualification or source-quality evidence references (one per line)<textarea aria-label="Validation qualification evidence references" value={packet.validationControl.qualificationEvidenceRefs.join("\n")} onChange={(event) => updateValidationControl({ qualificationEvidenceRefs: event.target.value.split("\n").map((value) => value.trim()).filter(Boolean) })} className={`${inputClass} mt-1`} rows={3} placeholder="Controlled method, qualification, audit, or data-quality record ID" /></label>
            <label className="text-xs text-slate-400">Accepted by qualified role<input aria-label="Validation accepted by role" value={packet.validationControl.acceptedByRole} onChange={(event) => updateValidationControl({ acceptedByRole: event.target.value })} className={`${inputClass} mt-1`} placeholder="Qualified reviewer role" /></label>
            <label className="text-xs text-slate-400 md:col-span-2 lg:col-span-3">Acceptance rationale<textarea aria-label="Validation acceptance rationale" value={packet.validationControl.acceptanceRationale} onChange={(event) => updateValidationControl({ acceptanceRationale: event.target.value })} className={`${inputClass} mt-1`} rows={3} placeholder="Why the frozen baseline, observed scope, evidence provenance and variance interpretation support or reject this case" /></label>
          </div>
          <div className="mt-5 rounded-xl border border-amber-300/15 bg-amber-300/[0.04] p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-amber-200">Validation-case blockers</p><div className="mt-3 grid gap-2 md:grid-cols-2">{validationCase.blockers.length ? validationCase.blockers.map((item) => <p key={item} className="flex gap-2 text-xs leading-5 text-slate-400"><CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" />{item}</p>) : <p className="text-xs text-teal-200">Eligible validation-case record. Portfolio release still requires distinct cross-case evidence and all other Domain Pack gates.</p>}</div></div>
        </WorkspaceDisclosure>

        {revisions.length > 0 && (
          <WorkspaceDisclosure id="project-history" title="Reviewed-project history" description="Immutable server revisions; comparison is decision-support only." meta={`${revisions.length} revisions`}>
            <div className="flex flex-wrap gap-2">
              {revisions.map((revision) => <span key={revision.revisionNumber} className="rounded-lg border border-white/10 bg-black/15 px-3 py-2 text-xs text-slate-300">Revision {revision.revisionNumber} · {revision.blockingOpenCount} blocking</span>)}
            </div>
          </WorkspaceDisclosure>
        )}

        {packet.methodEvidenceMatrix.length > 0 && (
          <WorkspaceDisclosure id="method-evidence" title="Method evidence matrix" description="A review matrix, not a claim that the displayed method is approved for this site." meta={`${packet.methodEvidenceMatrix.length} methods`}>
            <div className="space-y-3">
              {packet.methodEvidenceMatrix.map((item) => (
                <article key={item.id} className="rounded-xl border border-white/8 bg-black/15 p-4">
                  <div className="grid gap-3 md:grid-cols-[1fr_190px]">
                    <div>
                      <p className="text-sm font-bold">{item.productName} · {item.methodName}</p>
                      <p className="mt-1 text-[11px] text-slate-500">{item.market} · {item.requirementType.replaceAll("-", " ")}</p>
                      <p className="mt-2 text-xs leading-5 text-slate-400"><strong>Evidence references:</strong> {item.evidenceIds.join(" · ")}</p>
                      <p className="mt-2 text-xs leading-5 text-amber-200/80"><strong>Verification:</strong> {item.verificationRequirement}</p>
                    </div>
                    <select aria-label={`Method evidence status for ${item.methodName}`} value={item.status} onChange={(event) => persist({ ...packet, methodEvidenceMatrix: packet.methodEvidenceMatrix.map((row) => row.id === item.id ? { ...row, status: event.target.value as typeof row.status } : row) })} className={inputClass}>
                      <option value="draft">Draft</option>
                      <option value="needs-site-evidence">Needs site evidence</option>
                      <option value="ready-for-qualified-review">Ready for qualified review</option>
                    </select>
                  </div>
                  <textarea aria-label={`Method evidence reviewer note for ${item.methodName}`} value={item.reviewerNote} onChange={(event) => persist({ ...packet, methodEvidenceMatrix: packet.methodEvidenceMatrix.map((row) => row.id === item.id ? { ...row, reviewerNote: event.target.value } : row) })} className={`${inputClass} mt-3`} rows={2} placeholder="Controlled document reference, reviewer note, or gap" />
                </article>
              ))}
            </div>
          </WorkspaceDisclosure>
        )}

        {packet.ursBasis.length > 0 && (
          <WorkspaceDisclosure id="urs-basis" title="Vendor-neutral URS basis" description="Functional requirements for qualified drafting; this is not an issued URS or RFQ package." meta={`${packet.ursBasis.length} equipment classes`}>
            <div className="grid gap-3 md:grid-cols-2">
              {packet.ursBasis.map((item) => (
                <article key={item.id} className="rounded-xl border border-white/8 bg-black/15 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div><p className="text-sm font-bold">{item.equipmentName}</p><p className="mt-1 text-[11px] text-slate-500">{item.equipmentCategory}</p></div>
                    <span className="rounded-full border border-white/10 px-2 py-1 text-[9px] font-bold uppercase text-slate-400">{item.status.replaceAll("-", " ")}</span>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-slate-300"><strong>Functional basis:</strong> {item.functionalRequirement}</p>
                  <p className="mt-3 text-xs leading-5 text-amber-200/80"><strong>Qualification impact:</strong> {item.qualificationImpact}</p>
                  {item.relatedMethodRequirementIds.length > 0 && <p className="mt-2 break-words font-mono text-[10px] text-sky-200/70">Method links: {item.relatedMethodRequirementIds.join(" · ")}</p>}
                  {item.evidenceIds.length > 0 && <p className="mt-2 break-words font-mono text-[10px] text-sky-200/70">Evidence: {item.evidenceIds.join(" · ")}</p>}
                </article>
              ))}
            </div>
          </WorkspaceDisclosure>
        )}

        <WorkspaceDisclosure id="decision-records" title="Corrections and project decisions" description="Record what changed, why it changed and who owns the downstream decision." meta={`${packet.corrections.length + packet.decisions.length} records`}>
          <div className="grid gap-5 lg:grid-cols-2">
            <form onSubmit={addCorrection} className="rounded-xl border border-white/8 bg-black/15 p-4">
              <div className="flex items-center gap-2"><FileCheck2 className="h-4 w-4 text-sky-300" /><h3 className="font-bold">Correction log</h3></div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {([['fieldOrRuleId', 'Field or rule ID'], ['previousValue', 'Previous value'], ['correctedValue', 'Corrected value'], ['evidenceRef', 'Evidence reference'], ['reviewerRole', 'Reviewer role']] as const).map(([key, label]) => <label key={key} className="text-xs text-slate-400">{label}<input required value={correction[key]} onChange={(event) => setCorrection({ ...correction, [key]: event.target.value })} className={`${inputClass} mt-1`} /></label>)}
              </div>
              <label className="mt-3 block text-xs text-slate-400">Rationale<textarea required value={correction.rationale} onChange={(event) => setCorrection({ ...correction, rationale: event.target.value })} className={`${inputClass} mt-1`} rows={3} /></label>
              <button className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-bold"><Plus className="h-4 w-4" /> Add correction</button>
              <p className="mt-3 text-xs text-slate-500">{packet.corrections.length} corrections recorded</p>
            </form>
            <form onSubmit={addDecision} className="rounded-xl border border-white/8 bg-black/15 p-4">
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-teal-300" /><h3 className="font-bold">Decision log</h3></div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {([['decision', 'Decision'], ['owner', 'Decision owner'], ['downstreamImpact', 'Downstream impact']] as const).map(([key, label]) => <label key={key} className="text-xs text-slate-400">{label}<input required value={decision[key]} onChange={(event) => setDecision({ ...decision, [key]: event.target.value })} className={`${inputClass} mt-1`} /></label>)}
              </div>
              <label className="mt-3 block text-xs text-slate-400">Options considered (one per line)<textarea required value={decision.options} onChange={(event) => setDecision({ ...decision, options: event.target.value })} className={`${inputClass} mt-1`} rows={2} /></label>
              <label className="mt-3 block text-xs text-slate-400">Rationale<textarea required value={decision.rationale} onChange={(event) => setDecision({ ...decision, rationale: event.target.value })} className={`${inputClass} mt-1`} rows={3} /></label>
              <button className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-bold"><Plus className="h-4 w-4" /> Add decision</button>
              <p className="mt-3 flex items-center gap-2 text-xs text-slate-500"><CheckCircle2 className="h-3.5 w-3.5" />{packet.decisions.length} decisions recorded</p>
            </form>
          </div>
        </WorkspaceDisclosure>

        <div className="mt-5 flex items-start gap-3 rounded-xl border border-white/8 bg-white/[0.025] p-4 text-xs leading-5 text-slate-500">
          <History className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" /> Review records are working artifacts. Approval, document control and final release remain outside Atlas under the client quality system.
        </div>
      </div>
    </div>
  );
}
