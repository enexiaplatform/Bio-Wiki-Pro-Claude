import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import type { IconType } from "react-icons";
import {
  PiArrowRight,
  PiBooks,
  PiCheckCircle,
  PiClipboardText,
  PiDna,
  PiFactory,
  PiFlask,
  PiFlowArrow,
  PiMagnifyingGlass,
  PiMicroscope,
  PiQuestion,
  PiShieldCheck,
  PiStack,
  PiToolbox,
  PiWrench,
} from "react-icons/pi";

import {
  getConnectionsForSelection,
  getGuidedDestination,
  getResourceSystem,
  getResourceStage,
  getStageResourceCoverage,
  RESOURCE_AREA_PATHS,
  type GuidedOutcome,
  type GuidedWorkPhase,
  type ResourceArea,
} from "@/data/resourceConnections";
import { workflowSystems } from "@/data/workflowSystems";
import { capture } from "@/hooks/use-analytics";
import { useResourceSelection } from "@/hooks/use-resource-selection";
import { StageCoverageDashboard } from "@/components/StageCoverageDashboard";

const SYSTEM_ICONS: Record<string, IconType> = {
  biopharma: PiDna,
  "sterile-product": PiShieldCheck,
  "qc-laboratory": PiMicroscope,
  "pharma-api": PiFlask,
  "pharma-drug-product": PiFactory,
  "quality-lifecycle": PiStack,
};

const AREA_LABELS: Record<ResourceArea, string> = {
  methods: "method records",
  monitor: "change signals",
  workflows: "workflows",
  academy: "lessons",
  tools: "tools",
  toolkits: "toolkits",
  compliance: "compliance themes",
};

const PHASE_OPTIONS: Array<{ value: GuidedWorkPhase; label: string; detail: string }> = [
  { value: "prepare", label: "Prepare", detail: "Inputs, suppliers, readiness" },
  { value: "execute", label: "Execute", detail: "Routine process or testing" },
  { value: "investigate", label: "Investigate", detail: "Signals, validation, CAPA" },
  { value: "release", label: "Release", detail: "Review, disposition, transfer" },
];

const OUTCOME_OPTIONS: Array<{ value: GuidedOutcome; label: string; icon: IconType }> = [
  { value: "learn", label: "Learn", icon: PiBooks },
  { value: "calculate", label: "Calculate", icon: PiWrench },
  { value: "workflow", label: "Run a workflow", icon: PiFlowArrow },
  { value: "toolkit", label: "Use a file", icon: PiToolbox },
  { value: "verify", label: "Verify evidence", icon: PiClipboardText },
];

function areaConnectionCount(area: ResourceArea, systemId: string, stageId?: string) {
  return getConnectionsForSelection({ systemId, stageId }, area).length;
}

export function ResourceSystemNavigator({ area, showGuide = false }: { area: ResourceArea; showGuide?: boolean }) {
  const [, navigate] = useLocation();
  const { selection, setSelection, clearSelection } = useResourceSelection();
  const [guideOpen, setGuideOpen] = useState(false);
  const [guideSystem, setGuideSystem] = useState(workflowSystems[0].id);
  const [guidePhase, setGuidePhase] = useState<GuidedWorkPhase>("prepare");
  const [guideOutcome, setGuideOutcome] = useState<GuidedOutcome>(area === "workflows" ? "workflow" : area === "tools" ? "calculate" : area === "toolkits" ? "toolkit" : area === "academy" ? "learn" : "verify");
  const system = getResourceSystem(selection.systemId);
  const stage = getResourceStage(selection);
  const connectionCount = useMemo(() => selection.systemId ? areaConnectionCount(area, selection.systemId, selection.stageId) : 0, [area, selection]);
  const stageCoverage = useMemo(() => getStageResourceCoverage(selection), [selection]);

  useEffect(() => {
    if (!stageCoverage) return;
    capture("resource_coverage_viewed", { system_id: stageCoverage.system.id, stage_id: stageCoverage.stage.id, area_count: Object.keys(stageCoverage.areas).length });
  }, [stageCoverage]);

  function chooseSystem(systemId: string) {
    const selectedSystem = workflowSystems.find((item) => item.id === systemId);
    setSelection(area === "workflows" && selectedSystem ? { systemId, stageId: selectedSystem.stages[0].id } : { systemId });
    capture("resource_system_selected", { system_id: systemId, area });
  }

  function chooseStage(stageId: string) {
    if (!system) return;
    setSelection({ systemId: system.id, stageId });
    capture("resource_stage_selected", { system_id: system.id, stage_id: stageId, area });
  }

  function submitGuide() {
    const destination = getGuidedDestination(guideSystem, guidePhase, guideOutcome);
    capture("resource_selector_completed", { system_id: guideSystem, phase: guidePhase, outcome: guideOutcome, destination });
    navigate(destination);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  if (!system) {
    return (
      <section className="mb-7 overflow-hidden rounded-2xl border border-white/[0.09] bg-[#08172a]/85" aria-label="Connected quality systems">
        <div className="flex flex-col gap-3 border-b border-white/[0.08] px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300">Full general workflow</p>
            <h2 className="mt-1 text-lg font-bold text-slate-100">Choose the system around the work—not a content category</h2>
            <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">{workflowSystems.length} connected views organize the same Atlas resources. Select one to reveal its decision stages.</p>
          </div>
          {showGuide && (
            <button
              type="button"
              onClick={() => { setGuideOpen((value) => !value); capture("resource_selector_opened", { area }); }}
              aria-expanded={guideOpen}
              className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-teal-300/25 bg-teal-300/[0.07] px-4 text-xs font-bold text-teal-200 outline-none hover:border-teal-300/45 focus-visible:ring-2 focus-visible:ring-teal-300/40"
            >
              <PiQuestion className="h-4 w-4" /> Help me choose
            </button>
          )}
        </div>

        {guideOpen && (
          <div className="border-b border-white/[0.08] bg-black/15 p-4 md:p-5" role="group" aria-label="Resource guided selector">
            <div className="grid gap-5 xl:grid-cols-[1fr_1fr_1fr_auto] xl:items-end">
              <label className="block text-xs font-semibold text-slate-300">1. Which system?
                <select value={guideSystem} onChange={(event) => setGuideSystem(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-[#071426] px-3 text-sm outline-none focus:border-teal-300/50">
                  {workflowSystems.map((item) => <option key={item.id} value={item.id}>{item.shortTitle}</option>)}
                </select>
              </label>
              <label className="block text-xs font-semibold text-slate-300">2. Where is the work?
                <select value={guidePhase} onChange={(event) => setGuidePhase(event.target.value as GuidedWorkPhase)} className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-[#071426] px-3 text-sm outline-none focus:border-teal-300/50">
                  {PHASE_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label} · {item.detail}</option>)}
                </select>
              </label>
              <label className="block text-xs font-semibold text-slate-300">3. What do you need?
                <select value={guideOutcome} onChange={(event) => setGuideOutcome(event.target.value as GuidedOutcome)} className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-[#071426] px-3 text-sm outline-none focus:border-teal-300/50">
                  {OUTCOME_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </label>
              <button type="button" onClick={submitGuide} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-teal-300 px-5 text-sm font-bold text-slate-950 hover:bg-teal-200">Show my route <PiArrowRight className="h-4 w-4" /></button>
            </div>
            <button type="button" onClick={() => { setGuideOpen(false); clearSelection(); capture("resource_selector_skipped", { area }); }} className="mt-3 text-xs font-semibold text-slate-500 hover:text-slate-200">Skip — view all systems</button>
          </div>
        )}

        <div className="grid gap-px bg-white/[0.07] sm:grid-cols-2 xl:grid-cols-5">
          {workflowSystems.map((item) => {
            const Icon = SYSTEM_ICONS[item.id] ?? PiFactory;
            const areaCount = areaConnectionCount(area, item.id);
            return (
              <button key={item.id} type="button" onClick={() => chooseSystem(item.id)} className="group min-h-44 bg-[#08172a] p-4 text-left outline-none transition hover:bg-teal-300/[0.05] focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-300/50">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-teal-300/20 bg-teal-300/[0.06] text-teal-300"><Icon className="h-5 w-5" /></span>
                <span className="mt-4 block text-sm font-bold text-slate-100 group-hover:text-teal-200">{item.shortTitle}</span>
                <span className="mt-1 block text-[11px] leading-5 text-slate-500">{item.description}</span>
                <span className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-teal-300">{item.stages.length} stages · {areaCount} {AREA_LABELS[area]} <PiArrowRight className="h-3.5 w-3.5" /></span>
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  const SystemIcon = SYSTEM_ICONS[system.id] ?? PiFactory;
  return (
    <section className="mb-7 overflow-hidden rounded-2xl border border-white/[0.09] bg-[#08172a]/85" aria-label={`${system.shortTitle} resource context`}>
      <div className="flex flex-col gap-3 border-b border-white/[0.08] px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-teal-300/20 bg-teal-300/[0.07] text-teal-300"><SystemIcon className="h-5 w-5" /></span>
          <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300">System context</p><h2 className="mt-1 text-base font-bold text-slate-100">{system.title}</h2><p className="mt-1 text-[11px] leading-5 text-slate-500">{stage ? `${stage.title} · ${stage.summary}` : "Choose a stage to narrow the connected resources."}</p></div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href={RESOURCE_AREA_PATHS.workflows + `?system=${system.id}${stage ? `&stage=${stage.id}` : ""}`} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-semibold text-slate-300 hover:border-teal-300/30 hover:text-teal-200">Open system map <PiArrowRight className="h-4 w-4" /></Link>
          <button type="button" onClick={() => { clearSelection(); capture("resource_system_overview_opened", { area }); }} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-semibold text-slate-400 hover:text-slate-100"><PiMagnifyingGlass className="h-4 w-4" /> All systems</button>
        </div>
      </div>
      <div className="overflow-x-auto border-b border-white/[0.08] p-3">
        <div className="flex min-w-max gap-2">
          {system.stages.map((item, index) => {
            const active = stage?.id === item.id;
            const count = areaConnectionCount(area, system.id, item.id);
            return <button key={item.id} type="button" onClick={() => chooseStage(item.id)} aria-pressed={active} className={`w-40 rounded-xl border p-3 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-teal-300/40 ${active ? "border-teal-300/40 bg-teal-300/[0.09]" : "border-white/10 bg-black/10 hover:border-white/20"}`}><span className={`text-[10px] font-bold ${active ? "text-teal-300" : "text-slate-600"}`}>0{index + 1}</span><span className="mt-1 block text-xs font-bold text-slate-200">{item.title}</span><span className="mt-2 block text-[10px] text-slate-500">{count} {AREA_LABELS[area]}</span></button>;
          })}
        </div>
      </div>
      {stageCoverage && <StageCoverageDashboard selection={selection} className="border-b" />}
      <div className="flex flex-col gap-2 px-4 py-3 text-[11px] sm:flex-row sm:items-center sm:justify-between">
        <span className={connectionCount ? "text-teal-200" : "text-amber-200"}>{stage ? (connectionCount ? `${connectionCount} connected ${AREA_LABELS[area]} for this stage.` : `No focused ${AREA_LABELS[area]} mapped to this stage yet.`) : `${connectionCount} connected ${AREA_LABELS[area]} across this system.`}</span>
        <span className="inline-flex items-center gap-1.5 text-slate-500"><PiCheckCircle className="h-4 w-4" /> Navigation context only · applicability review required</span>
      </div>
    </section>
  );
}
