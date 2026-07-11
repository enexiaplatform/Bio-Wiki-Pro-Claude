import { FormEvent, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, CheckCircle2, ClipboardCheck, Loader2, ShieldCheck } from "lucide-react";
import { useCreateQualityLabReview } from "@/hooks/use-data";
import { analytics } from "@/hooks/use-analytics";
import { useSEO } from "@/hooks/use-seo";
import { getQualityLabProject, markQualityLabReviewRequested } from "@/lib/quality-lab-projects";
import { QUALITY_LAB_REVIEW_BRIEF_VERSION } from "@shared/quality-lab-review";

const fieldClass = "mt-2 h-11 w-full rounded-xl border border-white/10 bg-slate-950/55 px-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-teal-300/50 focus:ring-2 focus:ring-teal-300/10";

export default function QualityLabReviewPage() {
  useSEO({
    title: "Request Expert Blueprint Review",
    description: "Request a scoped expert review of your Atlas Quality Lab Blueprint assumptions, gaps and operating scenarios.",
    noIndex: true,
  });

  const projectId = useMemo(() => new URLSearchParams(window.location.search).get("project"), []);
  const project = useMemo(() => projectId ? getQualityLabProject(projectId) : null, [projectId]);
  const request = useCreateQualityLabReview();
  const [submitted, setSubmitted] = useState(false);
  const [confidentialityConfirmed, setConfidentialityConfirmed] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: project?.input.companyName ?? "",
    role: "",
    need: project
      ? `Expert review requested for Atlas project: ${project.name}. Key areas to review: assumptions, testing demand, capacity, risks and implementation priorities.`
      : "We are planning or expanding a regulated manufacturing quality laboratory and need help defining the project basis, capability scope and operating model.",
  });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    analytics.expertReviewStarted(project ? "blueprint_report" : "standalone");
    try {
      await request.mutateAsync({
        briefVersion: QUALITY_LAB_REVIEW_BRIEF_VERSION,
        contact: { name: form.name, email: form.email, company: form.company || null, role: form.role || null },
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
          readinessPercent: project.blueprint.dataQuality.completenessPercent,
          blockingOpenCount: project.blueprint.dataQuality.blockingOpenCount,
          importantOpenCount: project.blueprint.dataQuality.importantOpenCount,
          unresolvedInputs: project.blueprint.unresolvedInputs.map(({ id, severity, question, resolution }) => ({ id, severity, question, resolution })),
        } : null,
        confidentialityConfirmed: true,
      });
      if (project) markQualityLabReviewRequested(project.id);
      analytics.expertReviewRequested(Boolean(project));
      setSubmitted(true);
    } catch {
      // The shared mutation displays the actionable error toast.
    }
  }

  if (submitted) {
    return (
      <div className="min-h-[75vh] bg-[#08111f] px-4 py-16 text-slate-100">
        <div className="mx-auto max-w-2xl rounded-3xl border border-teal-300/25 bg-gradient-to-br from-teal-300/12 to-slate-950 p-7 text-center shadow-2xl shadow-black/25 md:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-300 text-slate-950"><CheckCircle2 className="h-7 w-7" /></div>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-teal-300">Request received</p>
          <h1 className="mt-3 text-3xl font-bold">Your review request has been captured.</h1>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-400">The next step is a scope check: project basis, available inputs, decision deadline, and which assumptions need qualified review. No model output will be treated as approved until that review is complete.</p>
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
        <div className="mt-8 grid gap-10 lg:grid-cols-[0.82fr_1.18fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-teal-200"><ClipboardCheck className="h-3.5 w-3.5" /> Service-assisted review</span>
            <h1 className="mt-5 text-4xl font-bold leading-tight">Turn the concept model into a reviewable project basis.</h1>
            <p className="mt-5 leading-7 text-slate-400">Atlas surfaces the assumptions. Expert review tests whether the inputs, capability scope, capacity logic, risks, and implementation sequence are fit for your actual site.</p>
            <div className="mt-7 space-y-3">
              {["Scope and critical-input check", "Assumption and gap review", "Scenario priorities and decision questions", "Recommended controlled deliverables"].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-slate-300"><CheckCircle2 className="h-4 w-4 shrink-0 text-teal-300" /> {item}</div>
              ))}
            </div>
            <div className="mt-8 flex gap-3 rounded-2xl border border-amber-300/15 bg-amber-300/[0.06] p-4 text-sm leading-6 text-slate-400">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" /> A review request does not create an approved design, regulatory opinion, supplier specification, or investment recommendation.
            </div>
          </div>

          <form onSubmit={submit} className="rounded-3xl border border-white/10 bg-slate-950/65 p-5 shadow-2xl shadow-black/25 md:p-7">
            {project && (
              <div className="mb-6 rounded-2xl border border-teal-300/20 bg-teal-300/[0.07] p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300">Attached browser-local model</p>
                <p className="mt-1 font-semibold">{project.name}</p>
                <p className="mt-1 text-xs text-slate-500">The model itself remains in this browser. Only the written context below is submitted.</p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px] text-slate-400">
                  <span className="rounded-lg bg-black/20 p-2"><strong className="block text-sm text-red-200">{project.blueprint.dataQuality.blockingOpenCount}</strong>blocking</span>
                  <span className="rounded-lg bg-black/20 p-2"><strong className="block text-sm text-amber-200">{project.blueprint.dataQuality.importantOpenCount}</strong>important</span>
                  <span className="rounded-lg bg-black/20 p-2"><strong className="block text-sm text-teal-200">{project.blueprint.dataQuality.completenessPercent}%</strong>readiness</span>
                </div>
              </div>
            )}
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
              {request.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending request</> : <>Request a scope review <ArrowRight className="h-4 w-4" /></>}
            </button>
            <p className="mt-3 text-center text-[11px] leading-5 text-slate-600">Structured brief: {QUALITY_LAB_REVIEW_BRIEF_VERSION}. It includes contract versions, model summary, and open-input checklist—not the complete browser-local model.</p>
          </form>
        </div>
      </div>
    </div>
  );
}
