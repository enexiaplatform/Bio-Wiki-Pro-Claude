import { useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, CheckCircle2, ChevronRight, Crown, Download, History, LockKeyhole, RefreshCw, Save, ShieldCheck, Target } from "lucide-react";
import { analytics } from "@/hooks/use-analytics";
import { useSEO } from "@/hooks/use-seo";
import { useUser } from "@/context/UserContext";
import { downloadAtlasProMonthlyReview, emptyAtlasProMonthlyStatuses, loadAtlasProMonthlyReviews, saveAtlasProMonthlyReview, type StoredAtlasProMonthlyReview } from "@/lib/atlas-pro-monthly";
import { ATLAS_PRO_MONTHLY_FOCUS, atlasProMonthlyFocusValues, atlasProMonthlyRoleValues, compileAtlasProMonthlyReview, defaultAtlasProMonthlyInput, exampleAtlasProMonthlyInput, formatAtlasProMonthlyReview, type AtlasProMonthlyActionStatus, type AtlasProMonthlyCycleStep, type AtlasProMonthlyInput } from "@shared/atlas-pro-monthly";

const fieldClass = "mt-2 w-full rounded-xl border border-white/10 bg-slate-950/55 px-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-sky-300/50 focus:ring-2 focus:ring-sky-300/10";
const roleLabels: Record<AtlasProMonthlyInput["role"], string> = { qc: "QC", qa: "QA", validation: "Validation", "quality-leadership": "Quality leadership", "cross-functional": "Cross-functional" };
const statusLabels: Record<AtlasProMonthlyActionStatus, string> = { "not-started": "Not started", "in-progress": "In progress", "waiting-review": "Waiting review", closed: "Closed" };
const statusTone: Record<AtlasProMonthlyActionStatus, string> = { "not-started": "border-white/10 bg-white/[0.03] text-slate-400", "in-progress": "border-sky-300/20 bg-sky-300/[0.07] text-sky-100", "waiting-review": "border-amber-300/20 bg-amber-300/[0.07] text-amber-100", closed: "border-emerald-300/20 bg-emerald-300/[0.07] text-emerald-100" };

function localMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function nextMonth(value: string) {
  const [year, month] = value.split("-").map(Number);
  if (!year || !month) return localMonth();
  const next = new Date(year, month, 1);
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`;
}

function readableMonth(value: string) {
  const [year, month] = value.split("-").map(Number);
  return year && month ? new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(new Date(year, month - 1, 1)) : value;
}

function ReviewPreview({ input, statuses, interactive, onStatus }: { input: AtlasProMonthlyInput; statuses: Record<AtlasProMonthlyCycleStep["id"], AtlasProMonthlyActionStatus>; interactive: boolean; onStatus?: (id: AtlasProMonthlyCycleStep["id"], status: AtlasProMonthlyActionStatus) => void }) {
  const review = compileAtlasProMonthlyReview(input);
  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-sky-300/20 bg-sky-300/[0.055] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-300">Monthly decision mandate</p><h2 className="mt-2 max-w-3xl text-xl font-bold leading-8 text-white">{input.decision || "Describe the decision this monthly review must support."}</h2></div>
          <span className="rounded-full border border-white/10 bg-slate-950/50 px-3 py-1 text-xs font-bold text-slate-300">{review.roleLabel}</span>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-black/15 p-3"><p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Signal</p><p className="mt-1 text-xs leading-5 text-slate-300">{input.signal || "Not yet described"}</p></div>
          <div className="rounded-xl border border-white/10 bg-black/15 p-3"><p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Owner</p><p className="mt-1 text-xs leading-5 text-slate-300">{input.owner || "Not assigned"}</p></div>
          <div className="rounded-xl border border-white/10 bg-black/15 p-3"><p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Review date</p><p className="mt-1 text-xs leading-5 text-slate-300">{input.reviewDate || "Not scheduled"}</p></div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-300">Monthly operating cycle</p><h2 className="mt-2 text-xl font-bold text-white">Frame → Verify → Decide → Close</h2></div><span className="text-xs font-semibold text-slate-500">{review.title}</span></div>
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {review.steps.map((step, index) => {
            const status = statuses[step.id];
            return <article key={step.id} className={`rounded-xl border p-4 ${statusTone[status]}`}>
              <div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-current/20 text-xs font-bold">{index + 1}</span><div><h3 className="font-bold text-white">{step.label}</h3><p className="mt-0.5 text-[10px] text-slate-500">{step.outcome}</p></div></div>{interactive ? <select aria-label={`Status for ${step.label}`} value={status} onChange={(event) => onStatus?.(step.id, event.target.value as AtlasProMonthlyActionStatus)} className="h-8 rounded-lg border border-white/10 bg-slate-950 px-2 text-[10px] font-bold text-white">{(Object.keys(statusLabels) as AtlasProMonthlyActionStatus[]).map((value) => <option key={value} value={value}>{statusLabels[value]}</option>)}</select> : <span className="rounded-full border border-current/20 px-2 py-1 text-[9px] font-bold uppercase">{statusLabels[status]}</span>}</div>
              <p className="mt-4 text-sm leading-6 text-slate-300">{step.action}</p>
              <p className="mt-3 border-t border-white/10 pt-3 text-[11px] leading-5 text-slate-500"><strong className="text-slate-400">Expected evidence:</strong> {step.evidence}</p>
            </article>;
          })}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-300">Evidence position</p><div className="mt-4 space-y-4 text-sm leading-6"><div><strong className="text-slate-200">Held now</strong><p className="mt-1 text-slate-400">{input.evidenceHeld || "Not yet described"}</p></div><div><strong className="text-slate-200">Still needed</strong><p className="mt-1 text-slate-400">{input.evidenceNeeded || "Not yet described"}</p></div></div></div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-300">Review question</p><p className="mt-3 text-sm font-semibold leading-7 text-slate-200">{review.focus.reviewQuestion}</p><p className="mt-4 text-xs leading-5 text-slate-500">{review.focus.promise}</p></div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-300">Connected Atlas resources</p><div className="mt-4 grid gap-3 sm:grid-cols-3">{review.focus.resources.map((resource) => <Link key={resource.label} href={resource.href} className="group rounded-xl border border-white/10 bg-black/15 p-4 transition hover:border-sky-300/25"><span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">{resource.kind.replaceAll("-", " ")}</span><p className="mt-2 text-sm font-bold text-slate-200 group-hover:text-sky-200">{resource.label}</p><span className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-sky-300">Open resource <ChevronRight className="h-3 w-3" /></span></Link>)}</div></section>

      <div className="rounded-xl border border-amber-300/15 bg-amber-300/[0.05] p-4 text-xs leading-6 text-slate-400"><ShieldCheck className="mr-2 inline h-4 w-4 text-amber-200" />{review.boundary}</div>
    </div>
  );
}

export default function AtlasProMonthlyReviewPage() {
  const { isPro, isLoading } = useUser();
  const [input, setInput] = useState(() => defaultAtlasProMonthlyInput(localMonth()));
  const [statuses, setStatuses] = useState(emptyAtlasProMonthlyStatuses);
  const [records, setRecords] = useState<StoredAtlasProMonthlyReview[]>(loadAtlasProMonthlyReviews);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const review = useMemo(() => compileAtlasProMonthlyReview(input), [input]);

  useSEO({ title: "Atlas Pro Monthly Quality Review", description: "Build a reusable monthly quality operating brief with a decision mandate, evidence position, owned actions, review status and carryover." });

  const patch = <K extends keyof AtlasProMonthlyInput>(key: K, value: AtlasProMonthlyInput[K]) => { setInput((current) => ({ ...current, [key]: value })); setNotice(""); };
  const updateStatus = (id: AtlasProMonthlyCycleStep["id"], status: AtlasProMonthlyActionStatus) => { setStatuses((current) => ({ ...current, [id]: status })); setNotice(""); };

  function save() {
    const id = activeId ?? `apr_${input.month}_${Date.now()}`;
    const next: StoredAtlasProMonthlyReview = { id, version: "atlas-pro-monthly-review/v1", input, statuses, updatedAt: new Date().toISOString() };
    setRecords(saveAtlasProMonthlyReview(next));
    setActiveId(id);
    setNotice("Monthly review saved in this browser.");
    analytics.proMonthlyReviewSaved(input.focus, review.readiness.percent);
  }

  function load(record: StoredAtlasProMonthlyReview) {
    setInput(record.input); setStatuses(record.statuses); setActiveId(record.id); setNotice(`Loaded ${readableMonth(record.input.month)} review.`);
  }

  function startNextMonth() {
    setInput((current) => ({ ...current, month: nextMonth(current.month), signal: current.carryover || "", outcome: "", carryover: "", reviewDate: "" }));
    setStatuses(emptyAtlasProMonthlyStatuses()); setActiveId(null); setNotice("Started a new month from the current carryover. Review every inherited assumption before saving.");
    analytics.proMonthlyReviewRolledForward(input.focus);
  }

  function download() {
    downloadAtlasProMonthlyReview(formatAtlasProMonthlyReview(input, statuses), input.month);
    analytics.proMonthlyReviewExported(input.focus, review.readiness.percent);
  }

  if (isLoading) return <div className="min-h-[70vh] bg-[#07182d]" />;

  if (!isPro) {
    return <div className="min-h-screen bg-[#07182d] px-4 pb-24 pt-10 text-slate-100"><div className="mx-auto max-w-6xl">
      <div className="grid gap-7 lg:grid-cols-[0.72fr_1.28fr] lg:items-start"><div className="lg:sticky lg:top-24"><span className="inline-flex items-center gap-2 rounded-full border border-sky-300/25 bg-sky-300/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-sky-200"><Crown className="h-3.5 w-3.5" /> Atlas Pro monthly workspace</span><h1 className="mt-5 text-4xl font-bold leading-tight md:text-5xl">A quality review you can run again next month.</h1><p className="mt-4 text-sm leading-7 text-slate-400">Turn one recurring quality priority into a decision mandate, evidence position, four-step operating cycle, owned review and carryover record.</p><div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5"><p className="text-sm font-bold text-white">Included with Atlas Pro</p><ul className="mt-3 space-y-2 text-xs leading-5 text-slate-400">{["Five recurring quality-review focus areas", "Browser-local monthly history", "Status tracking and next-month carryover", "Downloadable Markdown decision brief", "Links into relevant evidence, tools and working files"].map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-300" />{item}</li>)}</ul><Link href="/pricing#evidence-plans" className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-sky-300 px-5 py-3 text-sm font-bold text-slate-950">Start Pro <ArrowRight className="h-4 w-4" /></Link></div><p className="mt-4 flex gap-2 text-[11px] leading-5 text-slate-500"><LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0" />The sample is illustrative. Editing, saving, history and export require an active Pro entitlement.</p></div><div><ReviewPreview input={exampleAtlasProMonthlyInput} statuses={{ frame: "closed", verify: "in-progress", decide: "waiting-review", close: "not-started" }} interactive={false} /></div></div>
    </div></div>;
  }

  return <div className="min-h-screen bg-[#07182d] px-4 pb-24 pt-8 text-slate-100"><div className="mx-auto max-w-7xl">
    <header className="rounded-3xl border border-sky-300/20 bg-gradient-to-br from-sky-300/10 via-slate-950 to-teal-300/5 p-6 md:p-8"><div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"><div><span className="inline-flex items-center gap-2 rounded-full border border-sky-300/25 bg-sky-300/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-sky-200"><Crown className="h-3.5 w-3.5" /> Active Pro workspace</span><h1 className="mt-5 text-3xl font-bold md:text-5xl">Monthly Quality Review</h1><p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">Run one bounded quality priority through a repeatable evidence-to-decision cycle, then carry the unresolved work into the next month.</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={save} className="inline-flex items-center gap-2 rounded-xl bg-sky-300 px-4 py-3 text-sm font-bold text-slate-950"><Save className="h-4 w-4" /> Save month</button><button type="button" onClick={download} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-bold"><Download className="h-4 w-4" /> Export brief</button><button type="button" onClick={startNextMonth} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-bold"><RefreshCw className="h-4 w-4" /> Start next month</button></div></div>{notice && <p role="status" className="mt-4 text-xs font-semibold text-sky-200">{notice}</p>}</header>

    <div className="mt-6 grid gap-6 xl:grid-cols-[22rem_1fr]">
      <aside className="space-y-5">
        <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-300">Working completeness</p><p className="mt-2 text-3xl font-bold">{review.readiness.percent}%</p></div><span className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-300/10 text-sky-200"><Target className="h-5 w-5" /></span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-sky-300" style={{ width: `${review.readiness.percent}%` }} /></div><p className="mt-3 text-xs leading-5 text-slate-500">{review.readiness.completeCount}/{review.readiness.totalCount} working inputs described. This is not a compliance or approval score.</p>{review.readiness.missing.length > 0 && <p className="mt-2 text-[11px] leading-5 text-amber-200">Still open: {review.readiness.missing.join(" · ")}</p>}</section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-300">Review setup</p><div className="mt-4 space-y-4"><label className="block text-xs font-semibold text-slate-300">Month<input type="month" value={input.month} onChange={(event) => patch("month", event.target.value)} className={`${fieldClass} h-11`} /></label><label className="block text-xs font-semibold text-slate-300">Role lens<select value={input.role} onChange={(event) => patch("role", event.target.value as AtlasProMonthlyInput["role"])} className={`${fieldClass} h-11`}>{atlasProMonthlyRoleValues.map((role) => <option key={role} value={role}>{roleLabels[role]}</option>)}</select></label><label className="block text-xs font-semibold text-slate-300">Monthly focus<select value={input.focus} onChange={(event) => patch("focus", event.target.value as AtlasProMonthlyInput["focus"])} className={`${fieldClass} h-11`}>{atlasProMonthlyFocusValues.map((focus) => <option key={focus} value={focus}>{ATLAS_PRO_MONTHLY_FOCUS[focus].label}</option>)}</select></label></div></section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><div className="flex items-center gap-2"><History className="h-4 w-4 text-sky-300" /><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-300">Monthly history</p></div>{records.length === 0 ? <p className="mt-4 text-xs leading-5 text-slate-500">No saved months yet. Save this review to create the first browser-local record.</p> : <div className="mt-4 space-y-2">{records.slice(0, 8).map((record) => <button type="button" key={record.id} onClick={() => load(record)} className={`w-full rounded-xl border p-3 text-left transition ${record.id === activeId ? "border-sky-300/30 bg-sky-300/10" : "border-white/10 bg-black/15 hover:border-white/20"}`}><p className="text-xs font-bold text-slate-200">{readableMonth(record.input.month)}</p><p className="mt-1 text-[10px] text-slate-500">{ATLAS_PRO_MONTHLY_FOCUS[record.input.focus].label} · {statusLabels[record.statuses.close]}</p></button>)}</div>}<p className="mt-4 text-[10px] leading-4 text-slate-600">Up to 24 recent records stay in this browser. They are not controlled site records or synced to Atlas.</p></section>
      </aside>

      <main className="space-y-6">
        <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 md:p-6"><div className="grid gap-5 lg:grid-cols-2"><label className="block text-xs font-semibold text-slate-300 lg:col-span-2">Decision this month<textarea rows={3} value={input.decision} onChange={(event) => patch("decision", event.target.value)} className={`${fieldClass} py-3 leading-6`} placeholder="What decision must this monthly review support?" /></label><label className="block text-xs font-semibold text-slate-300 lg:col-span-2">Signal or trigger<textarea rows={3} value={input.signal} onChange={(event) => patch("signal", event.target.value)} className={`${fieldClass} py-3 leading-6`} placeholder="What changed, recurred, became overdue or now needs a decision?" /></label><label className="block text-xs font-semibold text-slate-300">Evidence held<textarea rows={4} value={input.evidenceHeld} onChange={(event) => patch("evidenceHeld", event.target.value)} className={`${fieldClass} py-3 leading-6`} placeholder="Controlled records, trends, logs or observations already available" /></label><label className="block text-xs font-semibold text-slate-300">Evidence still needed<textarea rows={4} value={input.evidenceNeeded} onChange={(event) => patch("evidenceNeeded", event.target.value)} className={`${fieldClass} py-3 leading-6`} placeholder="Missing records, confirmations, review or qualification evidence" /></label><label className="block text-xs font-semibold text-slate-300">Accountable owner<input value={input.owner} onChange={(event) => patch("owner", event.target.value)} className={`${fieldClass} h-11`} placeholder="Role or named owner" /></label><label className="block text-xs font-semibold text-slate-300">Review date<input type="date" value={input.reviewDate} onChange={(event) => patch("reviewDate", event.target.value)} className={`${fieldClass} h-11`} /></label><label className="block text-xs font-semibold text-slate-300">Working outcome<textarea rows={3} value={input.outcome} onChange={(event) => patch("outcome", event.target.value)} className={`${fieldClass} py-3 leading-6`} placeholder="What was decided, escalated or left open?" /></label><label className="block text-xs font-semibold text-slate-300">Carryover / next trigger<textarea rows={3} value={input.carryover} onChange={(event) => patch("carryover", event.target.value)} className={`${fieldClass} py-3 leading-6`} placeholder="What must be checked or reopened next month?" /></label></div></section>
        <ReviewPreview input={input} statuses={statuses} interactive onStatus={updateStatus} />
      </main>
    </div>
  </div></div>;
}
