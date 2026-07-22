import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, BriefcaseBusiness, CheckCircle2, ChevronRight, Download, LockKeyhole, RotateCcw, Save, ShieldCheck, Target } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { analytics } from "@/hooks/use-analytics";
import { useSEO } from "@/hooks/use-seo";
import { CAREER_PROFILE_STORAGE_KEY, careerProfileSchema } from "@shared/career-blueprint";
import { careerExecutionDecisionValues, careerExecutionStatusValues, compileCareerExecution, type CareerExecutionDecision, type CareerExecutionRecord, type CareerExecutionStatus } from "@shared/career-execution";
import { downloadCareerExecution, loadCareerExecution, saveCareerExecution } from "@/lib/career-execution";

const statusLabels: Record<CareerExecutionStatus, string> = { "not-started": "Not started", "in-progress": "In progress", "waiting-review": "Waiting review", complete: "Complete" };
const decisionLabels: Record<CareerExecutionDecision, string> = { "not-decided": "Not decided", continue: "Continue the route", adjust: "Adjust the route", pivot: "Pivot to another route" };
const fieldClass = "mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-teal-300/50 focus:ring-2 focus:ring-teal-300/10";

function readCareerProfile() {
  try {
    const raw = window.localStorage.getItem(CAREER_PROFILE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = careerProfileSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

function LockedWorkspace() {
  return <div className="min-h-screen bg-[#07182d] px-4 pb-24 pt-8 text-slate-100"><div className="mx-auto max-w-6xl">
    <section className="grid gap-7 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
      <div className="lg:sticky lg:top-24"><span className="inline-flex items-center gap-2 rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200"><LockKeyhole className="h-3.5 w-3.5" /> Career Blueprint workspace</span><h1 className="mt-5 text-4xl font-bold leading-tight md:text-5xl">Turn your Blueprint into 13 weeks of evidence.</h1><p className="mt-4 text-sm leading-7 text-slate-400">The paid Blueprint includes a lifetime-access execution workspace for weekly actions, sanitized proof records, reviewer feedback, and a continue-adjust-pivot decision.</p><div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5"><p className="text-sm font-bold text-white">Included with the $20 one-time Blueprint</p><ul className="mt-3 space-y-2 text-xs leading-5 text-slate-400">{["Personalized 13-week action path", "Weekly evidence and artifact log", "Reviewer feedback checkpoints", "Continue, adjust, or pivot decision gate", "Portable Markdown execution brief", "Lifetime browser-local workspace access"].map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-300" />{item}</li>)}</ul><Link href="/career" className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-amber-300 px-5 py-3 text-sm font-bold text-slate-950">Build my free snapshot first <ArrowRight className="h-4 w-4" /></Link></div><p className="mt-4 flex gap-2 text-[11px] leading-5 text-slate-500"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />The preview shows the operating structure. Personalized weekly instructions require a completed one-time purchase.</p></div>
      <div className="overflow-hidden rounded-3xl border border-amber-300/20 bg-gradient-to-br from-amber-300/[0.08] via-slate-950 to-teal-300/[0.05] p-5 md:p-7"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200">Illustrative execution map</p><div className="mt-5 grid gap-3 sm:grid-cols-2">{[["01", "Validate", "Confirm the route against real requirements and reviewed evidence."], ["02", "Build", "Create one bounded proof asset without inflating contribution."], ["03", "Prove", "Obtain reviewer challenge and make the outcome observable."], ["04", "Transition", "Translate accepted proof and make a continue-adjust-pivot decision."]].map(([number, title, body]) => <article key={number} className="rounded-2xl border border-white/10 bg-black/20 p-5"><span className="text-xs font-bold text-amber-200">{number}</span><h2 className="mt-4 text-xl font-bold">{title}</h2><p className="mt-2 text-xs leading-6 text-slate-400">{body}</p></article>)}</div><div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-5"><div className="flex items-center justify-between gap-3"><p className="text-sm font-bold">13-week progress rail</p><span className="text-[10px] uppercase tracking-wider text-slate-500">Evidence, not gamification</span></div><div className="mt-5 grid grid-cols-[repeat(13,minmax(0,1fr))] gap-1">{Array.from({ length: 13 }, (_, index) => <span key={index} className={`h-8 rounded-md border ${index < 3 ? "border-amber-300/30 bg-amber-300/10" : "border-white/10 bg-white/[0.03]"}`} />)}</div></div></div>
    </section>
  </div></div>;
}

export default function CareerBlueprintWorkspacePage() {
  const { isAuthenticated, isLoading } = useUser();
  const [record, setRecord] = useState<CareerExecutionRecord | null>(() => loadCareerExecution());
  const [access, setAccess] = useState<"checking" | "locked" | "ready">("checking");
  const [activeWeek, setActiveWeek] = useState(1);
  const [notice, setNotice] = useState("");
  const compiled = useMemo(() => record ? compileCareerExecution(record) : null, [record]);

  useSEO({ title: "Career Blueprint Execution Workspace", description: "Run a personalized 13-week career evidence plan with weekly actions, artifact references, reviewer feedback, progress, and a route decision gate." });

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) { setAccess("locked"); return; }
    let active = true;
    async function initialize() {
      try {
        const accessResponse = await fetch("/api/career-blueprint/access", { credentials: "include" });
        const accessData = accessResponse.ok ? await accessResponse.json() : { entitled: false };
        if (!active) return;
        if (!accessData.entitled) { setAccess("locked"); return; }
        const saved = loadCareerExecution();
        if (saved) { setRecord(saved); setActiveWeek(compileCareerExecution(saved).currentWeek); setAccess("ready"); analytics.careerExecutionOpened(saved.routeId, true); return; }
        const profile = readCareerProfile();
        if (!profile) { setAccess("ready"); return; }
        const response = await fetch("/api/career-blueprint/execution", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profile) });
        const data = await response.json();
        if (!response.ok || !data.record) throw new Error(data.message ?? "Unable to create execution workspace");
        const next = saveCareerExecution(data.record);
        if (!active) return;
        setRecord(next); setActiveWeek(1); setAccess("ready"); analytics.careerExecutionOpened(next.routeId, false);
      } catch { if (active) { setAccess("ready"); setNotice("Your purchased workspace could not be prepared. Your browser-local profile remains unchanged."); } }
    }
    void initialize();
    return () => { active = false; };
  }, [isAuthenticated, isLoading]);

  if (isLoading || access === "checking") return <div className="min-h-[70vh] bg-[#07182d]" />;
  if (access === "locked") return <LockedWorkspace />;
  if (!record || !compiled) return <div className="min-h-screen bg-[#07182d] px-4 py-12 text-slate-100"><div className="mx-auto max-w-2xl rounded-3xl border border-amber-300/20 bg-amber-300/[0.05] p-7 text-center"><BriefcaseBusiness className="mx-auto h-8 w-8 text-amber-200" /><h1 className="mt-5 text-3xl font-bold">Complete your Career Snapshot first.</h1><p className="mt-3 text-sm leading-7 text-slate-400">Your purchased workspace needs the browser-local profile and selected route from the free assessment before it can generate the 13-week path.</p><Link href="/career" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-300 px-5 py-3 text-sm font-bold text-slate-950">Open Career assessment <ArrowRight className="h-4 w-4" /></Link>{notice && <p className="mt-4 text-xs text-amber-200">{notice}</p>}</div></div>;

  const activeDefinition = record.plan.find((item) => item.week === activeWeek)!;
  const activeState = record.weeks.find((item) => item.week === activeWeek)!;

  function patchWeek(patch: Partial<typeof activeState>) { setRecord((current) => current ? { ...current, weeks: current.weeks.map((item) => item.week === activeWeek ? { ...item, ...patch } : item) } : current); setNotice(""); }
  function save() { if (!record) return; const saved = saveCareerExecution(record); setRecord(saved); setNotice("Execution workspace saved in this browser."); analytics.careerExecutionSaved(saved.routeId, compileCareerExecution(saved).completeWeeks); }
  function exportBrief() { if (!record || !compiled) return; downloadCareerExecution(record); analytics.careerExecutionExported(record.routeId, compiled.completeWeeks); }

  return <div className="min-h-screen bg-[#07182d] px-4 pb-28 pt-8 text-slate-100"><div className="mx-auto max-w-7xl">
    <header className="rounded-3xl border border-amber-300/20 bg-gradient-to-br from-amber-300/[0.08] via-slate-950 to-teal-300/[0.05] p-6 md:p-8"><div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"><div><span className="inline-flex items-center gap-2 rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200"><BriefcaseBusiness className="h-3.5 w-3.5" /> Purchased Career Blueprint</span><h1 className="mt-5 text-3xl font-bold md:text-5xl">13-Week Execution Workspace</h1><p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">{record.profile.fullName} · {record.profile.currentRole} → {record.routeTitle}</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={save} className="inline-flex items-center gap-2 rounded-xl bg-teal-300 px-4 py-3 text-sm font-bold text-slate-950"><Save className="h-4 w-4" /> Save progress</button><button type="button" onClick={exportBrief} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-bold"><Download className="h-4 w-4" /> Export brief</button><Link href="/career" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-bold"><RotateCcw className="h-4 w-4" /> Review route</Link></div></div>{notice && <p role="status" className="mt-4 text-xs font-semibold text-teal-200">{notice}</p>}</header>

    <section className="mt-6 grid gap-4 md:grid-cols-4" aria-label="Career execution phases">{compiled.phases.map((phase, index) => <article key={phase.id} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"><div className="flex items-center justify-between"><span className="text-xs font-bold text-amber-200">0{index + 1}</span><span className="text-[10px] text-slate-500">{phase.complete}/{phase.total} complete</span></div><h2 className="mt-4 font-bold">{phase.label}</h2><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-teal-300" style={{ width: `${(phase.complete / phase.total) * 100}%` }} /></div></article>)}</section>

    <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.035] p-5" aria-label="13-week execution progress"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300">Execution progress</p><h2 className="mt-2 text-xl font-bold">{compiled.completeWeeks}/13 weeks complete</h2></div><div className="flex gap-4 text-xs text-slate-500"><span>{compiled.evidenceWeeks} with evidence</span><span>{compiled.reviewedWeeks} with reviewer feedback</span></div></div><div className="mt-5 grid grid-cols-7 gap-2 sm:grid-cols-[repeat(13,minmax(0,1fr))]">{record.weeks.map((item) => <button key={item.week} type="button" aria-label={`Open week ${item.week}: ${statusLabels[item.status]}`} aria-pressed={activeWeek === item.week} onClick={() => setActiveWeek(item.week)} className={`flex aspect-square items-center justify-center rounded-lg border text-xs font-bold transition ${activeWeek === item.week ? "border-amber-300 bg-amber-300/10 text-amber-200" : item.status === "complete" ? "border-teal-300/30 bg-teal-300/10 text-teal-200" : item.status === "in-progress" || item.status === "waiting-review" ? "border-sky-300/25 bg-sky-300/[0.07] text-sky-200" : "border-white/10 bg-black/15 text-slate-500"}`}>{item.week}</button>)}</div></section>

    <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_22rem]">
      <main className="space-y-6"><section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 md:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200">Week {activeDefinition.week} · {activeDefinition.phaseLabel}</p><h2 className="mt-2 text-2xl font-bold">{activeDefinition.title}</h2><p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">{activeDefinition.action}</p></div><span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-400">{activeDefinition.effortHours} planned hours</span></div><div className="mt-5 grid gap-4 border-t border-white/10 pt-5 md:grid-cols-2"><div><p className="text-[10px] font-bold uppercase tracking-wider text-teal-300">Evidence to create</p><p className="mt-2 text-xs leading-6 text-slate-400">{activeDefinition.evidencePrompt}</p></div><div><p className="text-[10px] font-bold uppercase tracking-wider text-teal-300">Review question</p><p className="mt-2 text-xs leading-6 text-slate-400">{activeDefinition.reviewQuestion}</p></div></div></section>
        <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 md:p-6"><div className="grid gap-5 md:grid-cols-2"><label className="block text-xs font-semibold text-slate-300">Week status<select value={activeState.status} onChange={(event) => patchWeek({ status: event.target.value as CareerExecutionStatus })} className={`${fieldClass} h-11`}>{careerExecutionStatusValues.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}</select></label><div className="hidden md:block" /><label className="block text-xs font-semibold text-slate-300">Evidence note<textarea rows={4} value={activeState.evidenceNote} onChange={(event) => patchWeek({ evidenceNote: event.target.value })} className={`${fieldClass} py-3 leading-6`} placeholder="What evidence was created, observed, or is still missing?" /></label><label className="block text-xs font-semibold text-slate-300">Sanitized artifact reference<textarea rows={4} value={activeState.artifactReference} onChange={(event) => patchWeek({ artifactReference: event.target.value })} className={`${fieldClass} py-3 leading-6`} placeholder="Non-confidential file name, portfolio label, or location reference" /></label><label className="block text-xs font-semibold text-slate-300">Reviewer feedback<textarea rows={4} value={activeState.reviewerFeedback} onChange={(event) => patchWeek({ reviewerFeedback: event.target.value })} className={`${fieldClass} py-3 leading-6`} placeholder="What did the reviewer accept, correct, or leave open?" /></label><label className="block text-xs font-semibold text-slate-300">Reflection and next move<textarea rows={4} value={activeState.reflection} onChange={(event) => patchWeek({ reflection: event.target.value })} className={`${fieldClass} py-3 leading-6`} placeholder="What changed in your evidence position, and what happens next?" /></label></div></section></main>

      <aside className="space-y-5"><section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300">Completion</p><p className="mt-2 text-3xl font-bold">{compiled.percent}%</p></div><Target className="h-6 w-6 text-teal-300" /></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-teal-300" style={{ width: `${compiled.percent}%` }} /></div><p className="mt-3 text-[11px] leading-5 text-slate-500">Execution completion only. This is not a competence, employability, or hiring score.</p></section>
        <section className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.05] p-5"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200">Route decision gate</p><label className="mt-4 block text-xs font-semibold text-slate-300">Decision<select value={record.decision} onChange={(event) => { const decision = event.target.value as CareerExecutionDecision; setRecord({ ...record, decision }); setNotice(""); analytics.careerExecutionDecisionChanged(record.routeId, decision); }} className={`${fieldClass} h-11`}>{careerExecutionDecisionValues.map((decision) => <option key={decision} value={decision}>{decisionLabels[decision]}</option>)}</select></label><label className="mt-4 block text-xs font-semibold text-slate-300">Decision rationale<textarea rows={5} value={record.decisionRationale} onChange={(event) => setRecord({ ...record, decisionRationale: event.target.value })} className={`${fieldClass} py-3 leading-6`} placeholder="What evidence and real-world signal support this choice?" /></label><label className="mt-4 block text-xs font-semibold text-slate-300">Next review date<input type="date" value={record.nextReviewDate} onChange={(event) => setRecord({ ...record, nextReviewDate: event.target.value })} className={`${fieldClass} h-11`} /></label></section>
        <div className="rounded-xl border border-white/10 bg-black/15 p-4 text-[10px] leading-5 text-slate-500"><ShieldCheck className="mr-2 inline h-4 w-4 text-amber-200" />{compiled.boundary}</div><Link href="/career" className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs font-bold text-slate-300 hover:border-teal-300/25">Return to route comparison <ChevronRight className="h-4 w-4 text-teal-300" /></Link>
      </aside>
    </div>
  </div></div>;
}
