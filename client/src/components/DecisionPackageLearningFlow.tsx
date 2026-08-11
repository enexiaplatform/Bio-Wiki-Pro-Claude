import { BookOpenCheck, CheckCircle2, ChevronDown, ClipboardCheck, FlaskConical, Route, ShieldAlert, Target } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

import type { DecisionPackageLearningFlow as LearningFlow } from "@shared/decision-package-learning-types";
import { useUser } from "@/context/UserContext";

type LearningFlowResponse =
  | { locked: true; tier: "pro"; reviewStatus: LearningFlow["reviewStatus"]; preview: { learningObjectives: number; knowledgeUnits: number; workflowPhases: number; evidenceActivities: number; knowledgeChecks: number } }
  | { locked: false; tier: "pro"; flow: LearningFlow };

const activityKindLabels: Record<LearningFlow["evidenceActivities"][number]["kind"], string> = {
  "evidence-review": "Evidence review",
  "study-design": "Study design",
  "data-analysis": "Data analysis",
  "challenge-session": "Challenge session",
  "transfer-simulation": "Transfer simulation",
};

export function DecisionPackageLearningFlow({ flow }: { flow: LearningFlow }) {
  return (
    <section id="package-learning-flow" className="mt-8 scroll-mt-24 space-y-6" aria-labelledby="package-learning-flow-heading">
      <header className="rounded-2xl border border-sky-300/20 bg-sky-300/[0.045] p-5 md:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3"><p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-sky-300"><Route className="h-4 w-4" /> Full learning and execution flow</p><span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-amber-200">Specialist review required</span></div>
        <h2 id="package-learning-flow-heading" className="mt-3 text-2xl font-bold text-slate-100 md:text-3xl">Learn the decision, run the workflow, challenge the evidence.</h2>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-400">This structured draft joins the knowledge, execution steps, evidence-generating activities and reasoning checks for this package. It requires qualified specialist review and organizes qualified work; it does not authorize laboratory execution, establish universal criteria or replace controlled protocols.</p>
        <nav aria-label="Learning flow sections" className="mt-4 flex flex-wrap gap-2"><a href="#knowledge-foundation" className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-bold text-slate-300 hover:border-sky-300/30">Knowledge</a><a href="#execution-workflow" className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-bold text-slate-300 hover:border-sky-300/30">Workflow</a><a href="#evidence-activities" className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-bold text-slate-300 hover:border-sky-300/30">Evidence &amp; studies</a><a href="#reasoning-checks" className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-bold text-slate-300 hover:border-sky-300/30">Reasoning checks</a></nav>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {flow.learningObjectives.map((objective, index) => <div key={objective} className="flex gap-3 rounded-xl border border-white/10 bg-slate-950/20 p-4"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-300/10 text-[10px] font-bold text-sky-200">0{index + 1}</span><p className="text-xs leading-5 text-slate-300">{objective}</p></div>)}
        </div>
      </header>

      <section id="knowledge-foundation" className="scroll-mt-24 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-7" aria-labelledby="knowledge-foundation-heading">
        <div className="flex items-center gap-3"><BookOpenCheck className="h-5 w-5 text-teal-300" /><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-300">Knowledge foundation</p><h3 id="knowledge-foundation-heading" className="mt-1 text-xl font-bold text-slate-100">What must be understood before acting</h3></div></div>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {flow.knowledgeUnits.map((unit) => <article key={unit.title} className="rounded-xl border border-white/10 bg-slate-950/20 p-5"><h4 className="text-sm font-bold text-slate-100">{unit.title}</h4><p className="mt-3 text-xs leading-6 text-slate-400">{unit.explanation}</p><div className="mt-4 rounded-lg border border-teal-300/15 bg-teal-300/[0.045] p-3"><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-teal-300">Decision use</p><p className="mt-1 text-xs leading-5 text-slate-300">{unit.decisionUse}</p></div></article>)}
        </div>
      </section>

      <section id="execution-workflow" className="scroll-mt-24 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-7" aria-labelledby="execution-workflow-heading">
        <div className="flex items-center gap-3"><ClipboardCheck className="h-5 w-5 text-violet-300" /><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-violet-300">Execution workflow</p><h3 id="execution-workflow-heading" className="mt-1 text-xl font-bold text-slate-100">Five gated phases from scope to decision</h3></div></div>
        <ol className="mt-6 space-y-4">
          {flow.workflowPhases.map((phase, index) => <li key={phase.id} className="rounded-xl border border-white/10 bg-slate-950/20 p-5"><div className="flex items-start gap-4"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-300/10 text-xs font-bold text-violet-200">{String(index + 1).padStart(2, "0")}</span><div><h4 className="text-base font-bold text-slate-100">{phase.title}</h4><p className="mt-1 text-sm leading-6 text-slate-400">{phase.objective}</p></div></div><div className="mt-5 grid gap-4 lg:grid-cols-2"><FlowList label="Activities" items={phase.activities} /><FlowList label="Evidence to capture" items={phase.evidenceToCapture} /></div><div className="mt-4 flex gap-3 rounded-lg border border-amber-300/15 bg-amber-300/[0.04] p-3"><ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-200" /><div><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-amber-200">Decision gate</p><p className="mt-1 text-xs leading-5 text-slate-300">{phase.decisionGate}</p></div></div></li>)}
        </ol>
      </section>

      <section id="evidence-activities" className="scroll-mt-24 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-7" aria-labelledby="evidence-activities-heading">
        <div className="flex items-center gap-3"><FlaskConical className="h-5 w-5 text-sky-300" /><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-300">Evidence and study activities</p><h3 id="evidence-activities-heading" className="mt-1 text-xl font-bold text-slate-100">What to examine, test or simulate</h3></div></div>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {flow.evidenceActivities.map((activity) => <article key={activity.title} className="flex flex-col rounded-xl border border-white/10 bg-slate-950/20 p-5"><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-sky-300">{activityKindLabels[activity.kind]}</p><h4 className="mt-2 text-sm font-bold text-slate-100">{activity.title}</h4><p className="mt-3 text-xs font-semibold leading-5 text-slate-300">{activity.decisionQuestion}</p><FlowList label="Approach" items={activity.approach} className="mt-4" /><FlowList label="Expected outputs" items={activity.expectedOutputs} className="mt-4" /><div className="mt-auto pt-4"><p className="rounded-lg border border-amber-300/15 bg-amber-300/[0.04] p-3 text-[11px] leading-5 text-amber-100/80">{activity.boundary}</p></div></article>)}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
        <div id="reasoning-checks" className="scroll-mt-24 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-7"><div className="flex items-center gap-3"><Target className="h-5 w-5 text-teal-300" /><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-300">Reasoning checks</p><h3 className="mt-1 text-xl font-bold text-slate-100">Test the decision logic</h3></div></div><div className="mt-5 space-y-3">{flow.knowledgeChecks.map((check, index) => <details key={check.question} className="group rounded-xl border border-white/10 bg-slate-950/20"><summary className="flex cursor-pointer list-none items-start justify-between gap-4 p-4 text-sm font-semibold leading-6 text-slate-200"><span>{index + 1}. {check.question}</span><ChevronDown className="mt-1 h-4 w-4 shrink-0 text-slate-500 transition group-open:rotate-180" /></summary><div className="border-t border-white/10 px-4 py-4"><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-teal-300">Expected reasoning</p><p className="mt-2 text-xs leading-6 text-slate-400">{check.expectedReasoning}</p></div></details>)}</div></div>
        <div className="rounded-2xl border border-teal-300/20 bg-teal-300/[0.04] p-5 md:p-7"><div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-teal-300" /><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-300">Definition of done</p><h3 className="mt-1 text-xl font-bold text-slate-100">Ready for accountable review</h3></div></div><ul className="mt-5 space-y-3">{flow.completionCriteria.map((criterion) => <li key={criterion} className="flex gap-3 text-sm leading-6 text-slate-300"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-teal-300" /><span>{criterion}</span></li>)}</ul><p className="mt-5 border-t border-teal-300/15 pt-4 text-xs leading-6 text-slate-500">Meeting these criteria means the evidence package is structured for qualified review. It does not verify competence, approve a product/site decision or change the executable Atlas Compiler.</p></div>
      </section>
    </section>
  );
}

export function DecisionPackageLearningFlowGate({ packageId, completed, onComplete }: { packageId: string; completed: boolean; onComplete: () => void }) {
  const { isPro, isAdmin } = useUser();
  const query = useQuery<LearningFlowResponse>({
    queryKey: ["decision-package-learning-flow", packageId, isPro || isAdmin ? "entitled" : "guest"],
    queryFn: async () => {
      const response = await fetch(`/api/decision-packages/${encodeURIComponent(packageId)}/learning-flow`, { credentials: "include" });
      if (!response.ok) throw new Error("Unable to load this learning flow");
      return response.json();
    },
  });

  if (query.isLoading) return <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6" aria-label="Loading learning flow"><div className="h-4 w-40 animate-pulse rounded bg-white/10" /><div className="mt-4 h-16 animate-pulse rounded-xl bg-white/[0.05]" /></section>;
  if (query.isError || !query.data) return <section className="mt-8 rounded-2xl border border-amber-300/20 bg-amber-300/[0.04] p-5 text-sm text-amber-100/80">The full learning flow is temporarily unavailable. Package sources, limitations and product handoffs remain available below.</section>;
  if (!query.data.locked) return <><DecisionPackageLearningFlow flow={query.data.flow} /><button type="button" onClick={onComplete} className={`mt-6 inline-flex min-h-10 items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold ${completed ? "bg-teal-300 text-slate-950" : "border border-teal-300/30 bg-teal-300/10 text-teal-200"}`}>{completed ? "Full flow completion noted" : "Mark full flow complete"}<CheckCircle2 className="h-4 w-4" /></button></>;

  const preview = query.data.preview;
  return (
    <section id="package-learning-flow" className="mt-8 scroll-mt-24 rounded-2xl border border-sky-300/20 bg-sky-300/[0.045] p-5 md:p-7" aria-labelledby="package-learning-flow-preview-heading">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-sky-300"><Route className="h-4 w-4" /> Full learning and execution flow</p><h2 id="package-learning-flow-preview-heading" className="mt-3 text-2xl font-bold text-slate-100">Continue from orientation into the complete Pro workflow.</h2></div><span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-amber-200">Specialist review required</span></div>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">Active Pro membership unlocks the detailed knowledge, gated execution steps, evidence and study activities, reasoning checks and completion criteria. The detailed body has not been sent to this guest session.</p>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5"><PreviewCount value={preview.knowledgeUnits} label="Knowledge units" /><PreviewCount value={preview.workflowPhases} label="Workflow phases" /><PreviewCount value={preview.evidenceActivities} label="Evidence activities" /><PreviewCount value={preview.knowledgeChecks} label="Reasoning checks" /><PreviewCount value={preview.learningObjectives} label="Learning objectives" /></div>
      <div className="mt-5 flex flex-wrap gap-3"><Link href={`/pro?package=${packageId}`} className="inline-flex min-h-11 items-center justify-center rounded-lg bg-sky-300 px-4 py-2 text-xs font-bold text-slate-950">Preview this package in Atlas Pro</Link><Link href="/upgrade" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/15 px-4 py-2 text-xs font-bold text-slate-200">Unlock Pro</Link></div>
      <p className="mt-4 text-xs leading-5 text-slate-500">Pro access does not make the flow SME-approved and does not authorize laboratory execution, product/site decisions or Compiler expansion.</p>
    </section>
  );
}

function PreviewCount({ value, label }: { value: number; label: string }) {
  return <div className="rounded-xl border border-white/10 bg-slate-950/20 p-3 text-center"><p className="text-lg font-bold text-sky-200">{value}</p><p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">{label}</p></div>;
}

function FlowList({ label, items, className = "" }: { label: string; items: string[]; className?: string }) {
  return <div className={className}><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p><ul className="mt-2 space-y-2">{items.map((item) => <li key={item} className="flex gap-2 text-xs leading-5 text-slate-400"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-600" />{item}</li>)}</ul></div>;
}
