import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, ClipboardCheck, FileDown, Loader2, RotateCcw, ShieldCheck } from "lucide-react";
import { useCreateQualityLabReview } from "@/hooks/use-data";
import { analytics } from "@/hooks/use-analytics";
import { useSEO } from "@/hooks/use-seo";
import { exportQualityLabEngagementPacket, getQualityLabProject, markQualityLabReviewRequested, syncQualityLabReviewedProject } from "@/lib/quality-lab-projects";
import { QUALITY_LAB_REVIEW_BRIEF_VERSION, type QualityLabReviewRequest } from "@shared/quality-lab-review";
import { useUser } from "@/context/UserContext";
import { EditorialImage } from "@/components/EditorialImage";

const fieldClass = "mt-2 h-11 w-full rounded-xl border border-white/10 bg-slate-950/55 px-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-teal-300/50 focus:ring-2 focus:ring-teal-300/10";

const offerCopy = {
  "scope-diagnostic": { label: "Paid Scope Diagnostic", price: "$149 fixed fee", cta: "Request the paid diagnostic" },
  "blueprint-pilot": { label: "Expert-reviewed Blueprint Pilot", price: "From $990", cta: "Request a Blueprint scope" },
  unsure: { label: "Engagement fit review", price: "No commitment", cta: "Request a fit review" },
} as const;

type SnapshotHandoffStatus = "not-requested" | "saved" | "failed" | "login-required";

export default function QualityLabReviewPage() {
  useSEO({
    title: "Request Expert Blueprint Review",
    description: "Request a scoped expert review of your Atlas Quality Lab Blueprint assumptions, gaps and operating scenarios.",
    noIndex: true,
  });

  const projectId = useMemo(() => new URLSearchParams(window.location.search).get("project"), []);
  const requestedOffer = useMemo<QualityLabReviewRequest["qualification"]["engagementIntent"]>(() => {
    const offer = new URLSearchParams(window.location.search).get("offer");
    return offer === "diagnostic" ? "scope-diagnostic" : offer === "blueprint" || projectId ? "blueprint-pilot" : "unsure";
  }, [projectId]);
  const project = useMemo(() => projectId ? getQualityLabProject(projectId) : null, [projectId]);
  const request = useCreateQualityLabReview();
  const { isAuthenticated } = useUser();
  const [submitted, setSubmitted] = useState(false);
  const [confidentialityConfirmed, setConfidentialityConfirmed] = useState(false);
  const [attachMode, setAttachMode] = useState<"brief-only" | "full-snapshot">("brief-only");
  const [snapshotStatus, setSnapshotStatus] = useState<SnapshotHandoffStatus>("not-requested");
  const [snapshotError, setSnapshotError] = useState("");
  const [retryingSnapshot, setRetryingSnapshot] = useState(false);
  const [diagnosticCheckoutAvailable, setDiagnosticCheckoutAvailable] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [qualification, setQualification] = useState<QualityLabReviewRequest["qualification"]>({
    engagementIntent: requestedOffer,
    projectStage: "concept",
    decisionWindow: "not-set",
    budgetStatus: "exploring",
    decisionRole: "technical-lead",
    dataReadiness: project ? "substantial" : "initial",
    portfolioScale: "not-set",
  });
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: project?.input.companyName ?? "",
    role: "",
    need: project
      ? `Expert review requested for Atlas project: ${project.name}. Key areas to review: assumptions, testing demand, capacity, risks and implementation priorities.`
      : "We are planning or expanding a regulated manufacturing quality laboratory and need help defining the project basis, capability scope and operating model.",
  });

  useEffect(() => {
    fetch("/api/billing/plans", { credentials: "include" })
      .then((response) => response.json())
      .then((plans) => setDiagnosticCheckoutAvailable(Boolean(plans?.scopeDiagnostic)))
      .catch(() => setDiagnosticCheckoutAvailable(false));
  }, []);

  async function payForDiagnostic() {
    setCheckoutLoading(true);
    setCheckoutError("");
    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productType: "scope_diagnostic" }),
      });
      const result = await response.json();
      if (!response.ok || !result.url) throw new Error(result.message ?? "Unable to start secure checkout.");
      analytics.checkoutStarted("scope_diagnostic");
      window.location.href = result.url;
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : "Unable to start secure checkout.");
      setCheckoutLoading(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    analytics.expertReviewStarted(project ? "blueprint_report" : "standalone", qualification.engagementIntent);
    try {
      await request.mutateAsync({
        briefVersion: QUALITY_LAB_REVIEW_BRIEF_VERSION,
        contact: { name: form.name, email: form.email, company: form.company || null, role: form.role || null },
        qualification,
        projectContext: form.need,
        project: project ? {
          localProjectId: project.id,
          projectName: project.name,
          country: project.input.country,
          facilityType: project.input.facilityType,
          inputContractVersion: project.input.contractVersion,
          outputContractVersion: project.blueprint.contractVersion,
          compilerCoreVersion: project.blueprint.compilerCoreVersion,
          domainPackId: project.blueprint.domainPack.id,
          domainPackVersion: project.blueprint.domainPack.version,
          monthlyTests: project.blueprint.current.monthlyTests,
          inputCompletenessPercent: project.blueprint.dataQuality.completenessPercent,
          blockingOpenCount: project.blueprint.dataQuality.blockingOpenCount,
          importantOpenCount: project.blueprint.dataQuality.importantOpenCount,
          unresolvedInputs: project.blueprint.unresolvedInputs.map(({ id, severity, question, resolution }) => ({ id, severity, question, resolution })),
        } : null,
        confidentialityConfirmed: true,
      });
      if (project) {
        const reviewedProject = markQualityLabReviewRequested(project.id);
        if (attachMode === "full-snapshot") {
          if (!isAuthenticated) {
            setSnapshotStatus("login-required");
          } else if (reviewedProject) {
            try {
              await syncQualityLabReviewedProject(reviewedProject);
              setSnapshotStatus("saved");
              setSnapshotError("");
              analytics.reviewedProjectSync("success", reviewedProject.id);
            } catch (error) {
              setSnapshotStatus("failed");
              setSnapshotError(error instanceof Error ? error.message : "Unable to securely save the full Blueprint snapshot.");
              analytics.reviewedProjectSync("failed", reviewedProject.id);
            }
          }
        } else {
          setSnapshotStatus("not-requested");
        }
      }
      analytics.expertReviewRequested(Boolean(project), qualification.engagementIntent);
      setSubmitted(true);
    } catch {
      // The shared mutation displays the actionable error toast.
    }
  }

  async function retrySnapshotSync() {
    if (!project || !isAuthenticated) return;
    setRetryingSnapshot(true);
    setSnapshotError("");
    analytics.reviewedProjectSync("retry", project.id);
    try {
      const reviewedProject = markQualityLabReviewRequested(project.id);
      if (!reviewedProject) throw new Error("Project not found in this browser.");
      await syncQualityLabReviewedProject(reviewedProject);
      setSnapshotStatus("saved");
      analytics.reviewedProjectSync("success", reviewedProject.id);
    } catch (error) {
      setSnapshotStatus("failed");
      setSnapshotError(error instanceof Error ? error.message : "Unable to securely save the full Blueprint snapshot.");
      analytics.reviewedProjectSync("failed", project.id);
    } finally {
      setRetryingSnapshot(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-[75vh] bg-[#08111f] px-4 py-16 text-slate-100">
        <div className="mx-auto max-w-2xl rounded-3xl border border-teal-300/25 bg-gradient-to-br from-teal-300/12 to-slate-950 p-7 text-center shadow-2xl shadow-black/25 md:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-300 text-slate-950"><CheckCircle2 className="h-7 w-7" /></div>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-teal-300">Engagement request received</p>
            <h1 className="mt-3 text-3xl font-bold">Your {offerCopy[qualification.engagementIntent].label} request has been captured.</h1>
            <p className="mx-auto mt-3 text-sm font-semibold text-teal-200">{offerCopy[qualification.engagementIntent].price}</p>
            <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-400">Atlas responds within two business days to confirm fit, available inputs, decision deadline, reviewer coverage and the delivery basis. No model output is approved by this request.</p>
          {qualification.engagementIntent === "scope-diagnostic" && (
            <div className="mt-6 rounded-2xl border border-sky-300/20 bg-sky-300/[0.07] p-5 text-left">
              <p className="font-bold text-sky-100">Next: reserve the $149 Diagnostic</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">Includes one 60-minute workshop and a written scope and decision memo within two business days after the workshop.</p>
              {checkoutError && <p role="alert" className="mt-3 text-xs text-red-300">{checkoutError}</p>}
              {isAuthenticated && diagnosticCheckoutAvailable ? (
                <button type="button" onClick={payForDiagnostic} disabled={checkoutLoading} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-300 px-5 py-3 text-sm font-bold text-slate-950 disabled:opacity-60">
                  {checkoutLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />} Pay $149 securely
                </button>
              ) : isAuthenticated ? (
                <p className="mt-3 text-xs leading-5 text-sky-100/75">Atlas will send secure payment instructions after confirming fit.</p>
              ) : (
                <Link href="/register?next=/quality-lab/review?offer=diagnostic" className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-sky-300 px-5 py-3 text-sm font-bold text-slate-950">Create an account to pay securely</Link>
              )}
            </div>
          )}
          {project && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/15 p-4 text-left">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-300">Engagement handoff</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">Scope brief received. Full Blueprint snapshot: {snapshotStatus === "saved" ? "securely saved for review" : snapshotStatus === "failed" ? "not saved yet" : snapshotStatus === "login-required" ? "requires sign-in" : "not requested"}.</p>
              {snapshotStatus === "failed" && (
                <div role="alert" className="mt-3 rounded-xl border border-red-300/20 bg-red-300/10 p-3 text-xs leading-5 text-red-100">
                  <AlertTriangle className="mr-1 inline h-3.5 w-3.5" />
                  {snapshotError || "The brief was received, but the full Blueprint snapshot did not save. Retry or use the engagement packet fallback."}
                </div>
              )}
              <button type="button" onClick={() => { exportQualityLabEngagementPacket(project); analytics.engagementPacketDownloaded("review_success", project.blueprint.unresolvedInputs.length); }} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-teal-300/25 bg-teal-300/10 px-4 py-2.5 text-sm font-bold text-teal-200 transition hover:bg-teal-300/15">
                <FileDown className="h-4 w-4" /> Download engagement packet
              </button>
              {snapshotStatus === "failed" && isAuthenticated && (
                <button type="button" disabled={retryingSnapshot} onClick={retrySnapshotSync} className="ml-0 mt-3 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-bold text-slate-200 disabled:cursor-wait disabled:opacity-60 sm:ml-2">
                  {retryingSnapshot ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />} Retry secure save
                </button>
              )}
            </div>
          )}
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/quality-lab" className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-300 px-5 py-3 text-sm font-bold text-slate-950">Quality Lab overview <ArrowRight className="h-4 w-4" /></Link>
            {project && <Link href={`/quality-lab/projects/${project.id}`} className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold">Return to blueprint</Link>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08111f] px-4 pb-24 pt-8 text-slate-100 md:pt-14">
      <div className="mx-auto max-w-5xl">
        <Link href={project ? `/quality-lab/projects/${project.id}` : "/quality-lab"} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white"><ArrowLeft className="h-4 w-4" /> {project ? "Back to blueprint" : "Quality Lab Blueprint"}</Link>
        <Link href="/quality-lab/sample" className="ml-5 inline-flex items-center gap-2 text-sm font-semibold text-teal-300 transition hover:text-teal-200">View illustrative sample <ArrowRight className="h-4 w-4" /></Link>
        <div className="mt-8 grid gap-10 lg:grid-cols-[0.82fr_1.18fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-teal-200"><ClipboardCheck className="h-3.5 w-3.5" /> Commercial fit and scope request</span>
            <h1 className="mt-5 text-4xl font-bold leading-tight">Choose the smallest paid engagement that resolves the next decision.</h1>
            <p className="mt-4 leading-7 text-slate-400">Use the $149 diagnostic to frame the operating question, evidence and gaps. Use a Blueprint Pilot, starting at $990, when a non-sterile pharmaceutical microbiology build, expansion, or operating-model change is ready for expert-reviewed planning.</p>
            <EditorialImage src="/images/editorial/laboratory-record-review.jpg" alt="Laboratory scientist documenting sample tube identifiers" creditName="Nathan Rimoux" creditUrl="https://unsplash.com/photos/iul3dSPs1G4" className="mt-6 h-40 rounded-2xl border border-white/10 md:h-48" imageClassName="object-center saturate-75" />
            <div className="mt-6 space-y-3">
              {["Scope qualification and input check", "Reviewer coverage, assumptions and scenario challenge", "Controlled workbook, decision brief and acceptance basis agreed in scope"].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-slate-300"><CheckCircle2 className="h-4 w-4 shrink-0 text-teal-300" /> {item}</div>
              ))}
            </div>
            <div className="mt-8 flex gap-3 rounded-2xl border border-amber-300/15 bg-amber-300/[0.06] p-4 text-sm leading-6 text-slate-400">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" /> A review request does not create an approved design, regulatory opinion, supplier specification, or investment recommendation.
            </div>
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs leading-6 text-slate-400"><p className="font-bold text-slate-200">What Atlas confirms after qualification</p><p className="mt-1">Fit, project inputs and workshops, named delivery files, reviewer role coverage, timeline, payment schedule, clarification/revision policy, acceptance event and the applicable data-handling arrangement. Travel, third-party specialists, detailed engineering, supplier selection, method validation, site approval and regulatory approval remain outside the quoted scope unless stated otherwise.</p></div>
          </div>

          <form onSubmit={submit} className="rounded-3xl border border-white/10 bg-slate-950/65 p-5 shadow-2xl shadow-black/25 md:p-7">
            <section className="mb-6 rounded-2xl border border-teal-300/20 bg-teal-300/[0.06] p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300">1. Choose an engagement</p>
              <div className="mt-3 grid gap-2">
                {(["scope-diagnostic", "blueprint-pilot", "unsure"] as const).map((intent) => (
                  <label key={intent} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-xs leading-5 ${qualification.engagementIntent === intent ? "border-teal-300/35 bg-teal-300/10 text-teal-50" : "border-white/10 bg-black/15 text-slate-400"}`}>
                    <input type="radio" name="engagement-intent" checked={qualification.engagementIntent === intent} onChange={() => setQualification({ ...qualification, engagementIntent: intent })} className="mt-1 accent-teal-300" />
                    <span><strong className="block text-sm text-slate-100">{offerCopy[intent].label} <span className="ml-1 text-xs font-semibold text-teal-200">{offerCopy[intent].price}</span></strong>{intent === "scope-diagnostic" ? "Frame the decision, input gaps, and a written Blueprint scope before a larger commitment." : intent === "blueprint-pilot" ? "Scope an expert-reviewed capability, demand, resource, and decision package for a real project." : "Let Atlas recommend the appropriate starting point from the information below."}</span>
                  </label>
                ))}
              </div>
            </section>

            {project && (
              <div className="mb-6 rounded-2xl border border-teal-300/20 bg-teal-300/[0.07] p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300">Review handoff choice</p>
                <p className="mt-1 font-semibold">{project.name}</p>
                <p className="mt-1 text-xs text-slate-500">Choose whether Atlas receives only the scope brief or also a full Blueprint snapshot for expert review.</p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px] text-slate-400">
                  <span className="rounded-lg bg-black/20 p-2"><strong className="block text-sm text-red-200">{project.blueprint.dataQuality.blockingOpenCount}</strong>blocking</span>
                  <span className="rounded-lg bg-black/20 p-2"><strong className="block text-sm text-amber-200">{project.blueprint.dataQuality.importantOpenCount}</strong>important</span>
                  <span className="rounded-lg bg-black/20 p-2"><strong className="block text-sm text-teal-200">{project.blueprint.dataQuality.completenessPercent}%</strong>input complete</span>
                </div>
                <div className="mt-4 grid gap-2">
                  <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-xs leading-5 ${attachMode === "brief-only" ? "border-teal-300/30 bg-teal-300/10 text-teal-50" : "border-white/10 bg-black/15 text-slate-400"}`}>
                    <input type="radio" name="handoff" checked={attachMode === "brief-only"} onChange={() => setAttachMode("brief-only")} className="mt-1 accent-teal-300" />
                    <span><strong className="block text-slate-100">Submit scope brief only</strong>The complete Blueprint remains in this browser. The brief includes summary metrics, contract versions and open-input checklist.</span>
                  </label>
                  <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-xs leading-5 ${attachMode === "full-snapshot" ? "border-teal-300/30 bg-teal-300/10 text-teal-50" : "border-white/10 bg-black/15 text-slate-400"} ${!isAuthenticated ? "opacity-60" : ""}`}>
                    <input type="radio" name="handoff" checked={attachMode === "full-snapshot"} disabled={!isAuthenticated} onChange={() => setAttachMode("full-snapshot")} className="mt-1 accent-teal-300" />
                    <span><strong className="block text-slate-100">Attach full Blueprint snapshot</strong>Stores inputs, compiled output, evidence gaps and engagement packet for Atlas review. Access is limited to authenticated Atlas review/admin operations; deletion and retention are handled through the agreed project workflow.</span>
                  </label>
                  {!isAuthenticated && <p className="text-[11px] leading-5 text-amber-200">Sign in before submission if you want to attach the full Blueprint snapshot.</p>}
                </div>
              </div>
            )}
            <section className="mb-6">
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300">2. Commercial fit</p>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="text-xs font-semibold text-slate-300">Project stage *<select required value={qualification.projectStage} onChange={(event) => setQualification({ ...qualification, projectStage: event.target.value as QualityLabReviewRequest["qualification"]["projectStage"] })} className={fieldClass}><option value="concept">Concept / feasibility</option><option value="budget-planning">Budget planning</option><option value="approved-project">Approved project</option><option value="active-project">Active project / procurement</option><option value="expansion-or-change">Operating change or expansion</option></select></label>
                <label className="text-xs font-semibold text-slate-300">Decision window *<select required value={qualification.decisionWindow} onChange={(event) => setQualification({ ...qualification, decisionWindow: event.target.value as QualityLabReviewRequest["qualification"]["decisionWindow"] })} className={fieldClass}><option value="under-30-days">Under 30 days</option><option value="1-3-months">1–3 months</option><option value="3-6-months">3–6 months</option><option value="over-6-months">Over 6 months</option><option value="not-set">Not set</option></select></label>
                <label className="text-xs font-semibold text-slate-300">Budget status *<select required value={qualification.budgetStatus} onChange={(event) => setQualification({ ...qualification, budgetStatus: event.target.value as QualityLabReviewRequest["qualification"]["budgetStatus"] })} className={fieldClass}><option value="exploring">Exploring / no range yet</option><option value="range-defined">Working range defined</option><option value="budget-approved">Budget approved</option><option value="procurement-ready">Procurement ready</option><option value="prefer-not-to-say">Prefer not to say</option></select></label>
                <label className="text-xs font-semibold text-slate-300">Your decision role *<select required value={qualification.decisionRole} onChange={(event) => setQualification({ ...qualification, decisionRole: event.target.value as QualityLabReviewRequest["qualification"]["decisionRole"] })} className={fieldClass}><option value="decision-owner">Decision owner / budget holder</option><option value="technical-lead">Technical lead</option><option value="influencer">Project contributor / influencer</option><option value="advisor-or-partner">Engineering, distributor, or specialist partner</option><option value="other">Other</option></select></label>
                <label className="text-xs font-semibold text-slate-300">Data readiness *<select required value={qualification.dataReadiness} onChange={(event) => setQualification({ ...qualification, dataReadiness: event.target.value as QualityLabReviewRequest["qualification"]["dataReadiness"] })} className={fieldClass}><option value="initial">Initial facts only</option><option value="partial">Partial product, demand, or site data</option><option value="substantial">Substantial working data</option><option value="review-ready">Controlled inputs ready for review</option></select></label>
                <label className="text-xs font-semibold text-slate-300">Portfolio scale *<select required value={qualification.portfolioScale} onChange={(event) => setQualification({ ...qualification, portfolioScale: event.target.value as QualityLabReviewRequest["qualification"]["portfolioScale"] })} className={fieldClass}><option value="1-3-products">1–3 products</option><option value="4-10-products">4–10 products</option><option value="11-25-products">11–25 products</option><option value="over-25-products">Over 25 products</option><option value="not-set">Not confirmed</option></select></label>
              </div>
            </section>
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300">3. Contact and project context</p>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-xs font-semibold text-slate-300">Name *<input required minLength={2} autoComplete="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className={fieldClass} placeholder="Your name" /></label>
              <label className="text-xs font-semibold text-slate-300">Work email *<input required type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className={fieldClass} placeholder="you@company.com" /></label>
              <label className="text-xs font-semibold text-slate-300">Company<input autoComplete="organization" value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} className={fieldClass} placeholder="Organization" /></label>
              <label className="text-xs font-semibold text-slate-300">Role<input autoComplete="organization-title" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} className={fieldClass} placeholder="QC, QA, Engineering…" /></label>
            </div>
            <label className="mt-5 block text-xs font-semibold text-slate-300">Project context *
              <textarea required minLength={20} rows={7} value={form.need} onChange={(event) => setForm({ ...form, need: event.target.value })} className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-slate-950/55 px-3 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-teal-300/50 focus:ring-2 focus:ring-teal-300/10" />
            </label>
            <label className="mt-5 flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs leading-5 text-slate-400">
              <input required type="checkbox" checked={confidentialityConfirmed} onChange={(event) => setConfidentialityConfirmed(event.target.checked)} className="mt-1 h-4 w-4 accent-teal-300" />
              <span>I confirm this submission contains no confidential formulations, proprietary methods, credentials, or personal data about other people.</span>
            </label>
            <button type="submit" disabled={request.isPending || !confidentialityConfirmed} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-teal-200 disabled:cursor-not-allowed disabled:opacity-60">
              {request.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending request</> : <>{offerCopy[qualification.engagementIntent].cta} <ArrowRight className="h-4 w-4" /></>}
            </button>
            <p className="mt-3 text-center text-[11px] leading-5 text-slate-600">Structured brief: {QUALITY_LAB_REVIEW_BRIEF_VERSION}. Full Blueprint storage occurs only when you choose the full-snapshot handoff and secure save succeeds.</p>
          </form>
        </div>
      </div>
    </div>
  );
}
