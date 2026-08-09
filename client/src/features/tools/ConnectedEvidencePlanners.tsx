import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, CircleDashed, ShieldCheck } from "lucide-react";

type EvidenceState = "open" | "in-review" | "controlled";

interface PlannerConfig {
  eyebrow: string;
  title: string;
  description: string;
  boundary: string;
  prompts: string[];
}

const stateLabel: Record<EvidenceState, string> = {
  open: "Open evidence",
  "in-review": "In review",
  controlled: "Controlled reference",
};

function ConnectedEvidencePlanner({ config }: { config: PlannerConfig }) {
  const [states, setStates] = useState<EvidenceState[]>(() => config.prompts.map(() => "open"));
  const controlled = states.filter((state) => state === "controlled").length;
  const reviewed = states.filter((state) => state !== "open").length;
  const readiness = useMemo(() => Math.round(((controlled + reviewed * 0.35) / (config.prompts.length * 1.35)) * 100), [controlled, reviewed, config.prompts.length]);

  function update(index: number, state: EvidenceState) {
    setStates((current) => current.map((value, itemIndex) => itemIndex === index ? state : value));
  }

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-teal-300/20 bg-teal-300/[0.05] p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300">{config.eyebrow}</p>
        <h2 className="mt-2 text-xl font-bold">{config.title}</h2>
        <p className="mt-2 text-sm leading-7 text-slate-400">{config.description}</p>
        <div className="mt-4 flex items-center gap-3"><div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-teal-300 transition-all" style={{ width: `${readiness}%` }} /></div><strong className="text-sm text-teal-200">{readiness}%</strong></div>
      </div>

      <div className="space-y-3">
        {config.prompts.map((prompt, index) => (
          <article key={prompt} className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">{states[index] === "controlled" ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal-300" /> : <CircleDashed className="mt-0.5 h-5 w-5 shrink-0 text-amber-200" />}<p className="text-sm font-semibold leading-6 text-slate-200">{prompt}</p></div>
              <select aria-label={`${prompt} evidence state`} value={states[index]} onChange={(event) => update(index, event.target.value as EvidenceState)} className="h-10 rounded-lg border border-white/10 bg-slate-950 px-3 text-xs text-slate-200 outline-none focus:border-teal-300/50">
                {(Object.keys(stateLabel) as EvidenceState[]).map((state) => <option key={state} value={state}>{stateLabel[state]}</option>)}
              </select>
            </div>
          </article>
        ))}
      </div>

      <div className="rounded-xl border border-amber-300/20 bg-amber-300/[0.05] p-4 text-xs leading-6 text-slate-400"><AlertTriangle className="mr-2 inline h-4 w-4 text-amber-200" />{config.boundary}</div>
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500"><ShieldCheck className="h-4 w-4 text-sky-300" /> Browser-local working assessment · qualified review remains required</div>
    </section>
  );
}

export function CellBankEvidenceReadinessPlanner() {
  return <ConnectedEvidencePlanner config={{ eyebrow: "Biopharma evidence", title: "Cell bank decision readiness", description: "Organize the evidence chain before a cell-substrate, bank-use, production-age, or lifecycle decision is reviewed.", boundary: "This planner does not define a universal characterization panel, acceptance criterion, production age, biosafety conclusion, or authorized bank use.", prompts: ["Host, construct, clone, and lineage are versioned and traceable", "Master and working bank manufacture, custody, storage, and use are controlled", "Characterization and adventitious-agent evidence match the intended product and substrate", "Genetic or phenotypic stability and production-age evidence are linked", "Changes, deviations, limitations, and accountable reviewers are recorded"] }} />;
}

export function ImpurityFatePurgeEvidenceMapper() {
  return <ConnectedEvidencePlanner config={{ eyebrow: "API process evidence", title: "Impurity fate and control readiness", description: "Separate observed process evidence from assumptions before placing or changing an impurity control.", boundary: "This mapper does not invent chemistry, purge factors, safety limits, specifications, filing conclusions, or process authorization.", prompts: ["Route, process version, materials, and impurity identity are frozen", "Origin and observed fate are linked to representative process evidence", "Analytical capability and reporting limitations are recorded", "Control placement and downstream impact are justified", "Uncertainty, changes, specialist review, and authorized decisions remain visible"] }} />;
}

export function RoutineControlSignalPlanner() {
  return <ConnectedEvidencePlanner config={{ eyebrow: "Quality-system evidence", title: "Routine signal readiness", description: "Connect each routine signal to its intended decision, escalation path, and accountable review.", boundary: "This planner does not set alert/action limits, approve a trend rule, determine batch disposition, or replace the site quality system.", prompts: ["Signal source, intended decision, and controlled procedure are identified", "Data quality, method capability, and decision limits are traceable", "Review frequency, owner, and escalation path are defined", "Cross-signal, product, process, utility, and environmental context is considered", "Open evidence, investigations, CAPA, changes, and disposition boundaries are visible"] }} />;
}
