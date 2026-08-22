import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  CheckCircle2,
  FileText,
  FlaskConical,
  Network,
  PackageCheck,
  Pill,
  Search,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  TestTube2,
  type LucideIcon,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { getCareerTracksForPackage } from "@shared/career-domain-tracks";
import { EVIDENCE_SOURCE_CATALOG } from "@shared/content-quality-registry";
import { getDecisionPackage, getDecisionPackagesForLane, getNextDecisionPackage, type DecisionPackage, type DecisionPackageLane } from "@shared/decision-packages";
import { DecisionPackageLearningFlowGate } from "@/components/DecisionPackageLearningFlow";
import { analytics } from "@/hooks/use-analytics";
import { useDecisionPackageProgressPortfolio } from "@/hooks/use-decision-package-progress";
import { useSEO } from "@/hooks/use-seo";
import { AtlasMark } from "@/components/Navigation";

const laneLabels: Record<DecisionPackageLane, string> = {
  biopharma: "Biopharma",
  "pharma-api": "Pharma/API",
  "pharma-drug-product": "Drug product",
  "cross-cutting-quality-rd": "Cross-product governance",
};

const laneDescriptions: Record<DecisionPackageLane, string> = {
  biopharma: "Follow product and process evidence from substrate and materials through analytics, validation, comparability and transfer.",
  "pharma-api": "Connect route, inputs, unit operations, impurities, analytical lifecycle, validation and change.",
  "pharma-drug-product": "Use a dosage-form-aware framework with a bounded synthetic oral-solid-dose example.",
  "cross-cutting-quality-rd": "Move analytical and quality signals through data, investigation, CAPA, effectiveness and change.",
};

const laneOrder: DecisionPackageLane[] = ["biopharma", "pharma-api", "pharma-drug-product", "cross-cutting-quality-rd"];

type EvidenceStageKey = "inputs" | "process" | "analytics" | "validation" | "transfer";

type EvidenceStage = {
  key: EvidenceStageKey;
  label: string;
  caption: string;
  icon: LucideIcon;
};

const evidenceStages: EvidenceStage[] = [
  { key: "inputs", label: "Inputs", caption: "Materials & starting context", icon: Network },
  { key: "process", label: "Process", caption: "Process design & controls", icon: Settings2 },
  { key: "analytics", label: "Analytics", caption: "Methods, results & signals", icon: Activity },
  { key: "validation", label: "Validation", caption: "Validation & lifecycle evidence", icon: ShieldCheck },
  { key: "transfer", label: "Transfer", caption: "Transfer & change control", icon: PackageCheck },
];

const laneVisuals: Record<DecisionPackageLane, { icon: LucideIcon; shortLabel: string }> = {
  biopharma: { icon: FlaskConical, shortLabel: "Biopharma" },
  "pharma-api": { icon: TestTube2, shortLabel: "Pharma / API" },
  "pharma-drug-product": { icon: Pill, shortLabel: "Drug Product" },
  "cross-cutting-quality-rd": { icon: ShieldCheck, shortLabel: "Cross-product governance" },
};

const stagePackageSlots: Record<DecisionPackageLane, [number, number, number, number, number]> = {
  biopharma: [0, 0, 1, 2, 2],
  "pharma-api": [0, 1, 2, 3, 3],
  "pharma-drug-product": [0, 1, 2, 3, 3],
  "cross-cutting-quality-rd": [0, 0, 0, 0, 0],
};

type EvidenceFlowNodeData = Record<string, unknown> & {
  kind: "domain" | "stage";
  title: string;
  caption?: string;
  icon: LucideIcon;
  active: boolean;
  hasTarget?: boolean;
  hasSource?: boolean;
  onSelect: () => void;
};

type EvidenceFlowNode = Node<EvidenceFlowNodeData, "evidence-flow">;

function EvidenceFlowNodeView({ data }: NodeProps<EvidenceFlowNode>) {
  const Icon = data.icon;
  if (data.kind === "domain") {
    return (
      <div className="w-[220px]">
        <button
          type="button"
          aria-pressed={data.active}
          onClick={data.onSelect}
          className={`nodrag nopan group flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300/70 ${data.active ? "border-teal-300/60 bg-teal-300/[0.08] text-teal-200 shadow-[0_0_28px_rgba(45,212,191,.12)]" : "border-slate-700/80 bg-[#07172a] text-slate-400 hover:border-sky-300/35 hover:text-slate-200"}`}
        >
          <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border ${data.active ? "border-teal-300/70 bg-teal-300/[0.07] text-teal-300" : "border-slate-600 text-slate-400"}`}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-sm font-semibold leading-5">{data.title}</span>
        </button>
        {data.hasSource && <Handle type="source" position={Position.Right} className="!h-2 !w-2 !border-0 !bg-sky-300" />}
      </div>
    );
  }

  return (
    <div className="w-[150px] text-center">
      {data.hasTarget && <Handle type="target" position={Position.Left} className="!h-2 !w-2 !border-0 !bg-sky-300" />}
      <p className={`text-sm font-semibold ${data.active ? "text-sky-300" : "text-slate-300"}`}>{data.title}</p>
      <button
        type="button"
        aria-pressed={data.active}
        aria-label={`Inspect ${data.title} evidence`}
        onClick={data.onSelect}
        className={`nodrag nopan relative mx-auto mt-3 grid h-[126px] w-[116px] place-items-center rounded-2xl border bg-[#081a30] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/70 ${data.active ? "border-sky-300/70 text-sky-400 shadow-[0_0_34px_rgba(56,189,248,.16)]" : "border-slate-600/80 text-sky-400 hover:border-sky-300/50"}`}
      >
        <span className="absolute left-3 top-3 grid h-5 w-5 place-items-center rounded-full border border-teal-300 text-teal-300">
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
        <Icon className="h-12 w-12 stroke-[1.45]" aria-hidden="true" />
      </button>
      <p className="mx-auto mt-3 max-w-[148px] text-xs leading-5 text-slate-400">{data.caption}</p>
      {data.hasSource && <Handle type="source" position={Position.Right} className="!h-2 !w-2 !border-0 !bg-sky-300" />}
    </div>
  );
}

const evidenceNodeTypes = { "evidence-flow": EvidenceFlowNodeView };

const openEvidenceSearch = () => window.dispatchEvent(new Event("lsa:open-search"));

function EvidenceNav() {
  return (
    <header className="relative z-50 flex h-[4.5rem] items-center border-b border-slate-700/60 bg-[#041426]/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <Link href="/evidence" className="flex shrink-0 items-center gap-2.5 transition hover:opacity-85">
        <span className="grid h-9 w-9 place-items-center rounded-lg border border-teal-300/25 bg-[#081b2f] p-1">
          <AtlasMark className="h-full w-full" />
        </span>
        <span className="font-display text-lg font-bold text-slate-50 sm:text-xl"><span className="text-teal-300">Atlas</span> Evidence</span>
      </Link>

      <nav aria-label="Evidence navigation" className="ml-10 hidden items-center gap-8 text-sm font-medium text-slate-300 lg:flex">
        <Link href="/products" className="transition hover:text-teal-200">Products</Link>
        <Link href="/how-it-works" className="transition hover:text-teal-200">How Atlas works</Link>
        <Link href="/evidence" aria-current="page" className="rounded-lg bg-teal-300/[0.08] px-4 py-2 text-teal-300">Resources</Link>
        <Link href="/pricing" className="transition hover:text-teal-200">Pricing</Link>
      </nav>

      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        <button
          type="button"
          onClick={openEvidenceSearch}
          aria-label="Search"
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-700/80 bg-[#08192c] px-3 text-xs text-slate-400 transition hover:border-teal-300/30 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300/70"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          <span className="hidden md:inline">Search</span>
          <span className="hidden rounded bg-slate-700/60 px-1.5 py-0.5 text-[9px] text-slate-400 xl:inline">Ctrl K</span>
        </button>
        <Link href="/login" className="hidden text-sm font-semibold text-slate-200 transition hover:text-teal-200 sm:inline">Sign in</Link>
        <Link href="/quality-lab/planner" className="inline-flex min-h-10 items-center rounded-lg bg-teal-300 px-4 text-xs font-bold text-slate-950 transition hover:bg-teal-200 sm:px-5 sm:text-sm">Start free</Link>
      </div>
    </header>
  );
}

export default function DecisionPackagesPage() {
  const [location] = useLocation();
  const packageId = location.startsWith("/evidence/packages/") ? location.split("/")[3]?.split("?")[0] : undefined;
  const packageItem = packageId ? getDecisionPackage(packageId) : undefined;
  const hubLane = location === "/evidence/biopharma" ? "biopharma" : location === "/evidence/pharma-api" ? "pharma-api" : location === "/evidence/drug-product" ? "pharma-drug-product" : undefined;

  useSEO({
    title: packageItem ? `${packageItem.title} | Atlas Evidence` : hubLane ? `${laneLabels[hubLane]} Evidence Hub | Atlas Evidence` : "Decision Packages | Atlas Evidence",
    description: packageItem?.summary ?? (hubLane ? laneDescriptions[hubLane] : "Evidence-linked decision packages connecting Biopharma, Pharma/API and drug-product quality work to Atlas Pro, Blueprint and Career."),
  });

  useEffect(() => {
    if (packageItem) analytics.decisionPackageViewed(packageItem.id, packageItem.lane, packageItem.reviewStatus);
  }, [packageItem]);

  if (packageId && !packageItem) {
    return <div className="mx-auto max-w-5xl px-4 py-20 text-center text-slate-200"><h1 className="text-3xl font-bold">Decision package not found</h1><Link href="/evidence" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-teal-300">Back to Atlas Evidence <ArrowRight className="h-4 w-4" /></Link></div>;
  }

  return packageItem ? <DecisionPackageDetail item={packageItem} /> : <DecisionPackageIndex lane={hubLane} />;
}

function DecisionPackageIndex({ lane }: { lane?: DecisionPackageLane }) {
  const progress = useDecisionPackageProgressPortfolio();
  const [activeLane, setActiveLane] = useState<DecisionPackageLane>(lane ?? "biopharma");
  const [activeStageIndex, setActiveStageIndex] = useState(0);

  useEffect(() => {
    if (!lane) return;
    setActiveLane(lane);
    setActiveStageIndex(0);
  }, [lane]);

  const lanePackages = getDecisionPackagesForLane(activeLane);
  const selectedPackage = lanePackages[stagePackageSlots[activeLane][activeStageIndex]] ?? lanePackages[0]!;
  const SelectedLaneIcon = laneVisuals[activeLane].icon;

  const selectLane = (nextLane: DecisionPackageLane) => {
    setActiveLane(nextLane);
    setActiveStageIndex(0);
  };

  const flowNodes = useMemo<EvidenceFlowNode[]>(() => {
    const domainNodes: EvidenceFlowNode[] = laneOrder.map((laneItem, index) => ({
      id: `domain-${laneItem}`,
      type: "evidence-flow",
      position: { x: 0, y: index * 76 },
      draggable: false,
      selectable: false,
      data: {
        kind: "domain",
        title: laneVisuals[laneItem].shortLabel,
        icon: laneVisuals[laneItem].icon,
        active: activeLane === laneItem,
        hasSource: true,
        onSelect: () => selectLane(laneItem),
      },
    }));

    const stageNodes: EvidenceFlowNode[] = evidenceStages.map((stage, index) => ({
      id: `stage-${stage.key}`,
      type: "evidence-flow",
      position: { x: 300 + index * 205, y: 76 },
      draggable: false,
      selectable: false,
      data: {
        kind: "stage",
        title: stage.label,
        caption: stage.caption,
        icon: stage.icon,
        active: activeStageIndex === index,
        hasTarget: true,
        hasSource: index < evidenceStages.length - 1,
        onSelect: () => setActiveStageIndex(index),
      },
    }));

    return [...domainNodes, ...stageNodes];
  }, [activeLane, activeStageIndex]);

  const flowEdges = useMemo<Edge[]>(() => {
    const domainEdges: Edge[] = laneOrder.map((laneItem) => ({
      id: `domain-edge-${laneItem}`,
      source: `domain-${laneItem}`,
      target: "stage-inputs",
      type: "smoothstep",
      animated: laneItem === activeLane,
      style: {
        stroke: laneItem === activeLane ? "#2dd4bf" : "#27445f",
        strokeWidth: laneItem === activeLane ? 2.2 : 1.1,
      },
    }));

    const stageEdges: Edge[] = evidenceStages.slice(0, -1).map((stage, index) => ({
      id: `stage-edge-${stage.key}`,
      source: `stage-${stage.key}`,
      target: `stage-${evidenceStages[index + 1].key}`,
      type: "smoothstep",
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed, color: "#38bdf8", width: 16, height: 16 },
      style: { stroke: "#38bdf8", strokeWidth: 2 },
    }));

    return [...domainEdges, ...stageEdges];
  }, [activeLane]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#041426] text-slate-100">
      <EvidenceNav />
      <section className="mx-auto max-w-[1440px] px-4 pb-10 pt-10 sm:px-6 md:px-10 md:pt-14 lg:px-12">
        <header>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-teal-300">Atlas Evidence · decision packages</p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-[1.05] tracking-[-0.04em] text-slate-50 sm:text-5xl lg:text-[3.5rem]">Trace evidence to the decision.</h1>
          <p className="mt-3 text-sm text-slate-400 sm:text-base">Follow the evidence path across the product lifecycle.</p>
        </header>

        <section aria-label="Interactive evidence decision path" className="relative mt-9 hidden h-[390px] lg:block">
          <img
            src="/images/evidence/evidence-flow-stream.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute left-[20%] top-32 z-0 h-28 w-[78%] object-fill opacity-[0.48]"
          />
          <div className="relative z-10 h-full">
            <ReactFlow
              nodes={flowNodes}
              edges={flowEdges}
              nodeTypes={evidenceNodeTypes}
              fitView
              fitViewOptions={{ padding: 0.015, minZoom: 0.8, maxZoom: 1 }}
              minZoom={0.8}
              maxZoom={1}
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={false}
              panOnDrag={false}
              zoomOnScroll={false}
              zoomOnPinch={false}
              zoomOnDoubleClick={false}
              preventScrolling={false}
              proOptions={{ hideAttribution: true }}
              aria-label="Evidence domains connected across five lifecycle stages"
              onNodeClick={(_, selectedNode) => selectedNode.data.onSelect()}
            />
          </div>
        </section>

        <section className="mt-8 lg:hidden" aria-label="Evidence domain and lifecycle explorer">
          <div className="grid grid-cols-2 gap-2" role="group" aria-label="Evidence domains">
            {laneOrder.map((laneItem) => {
              const Icon = laneVisuals[laneItem].icon;
              return (
                <button
                  key={laneItem}
                  type="button"
                  aria-pressed={activeLane === laneItem}
                  onClick={() => selectLane(laneItem)}
                  className={`flex min-h-14 items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300/70 ${activeLane === laneItem ? "border-teal-300/60 bg-teal-300/[0.08] text-teal-200" : "border-slate-700 bg-[#07172a] text-slate-400"}`}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {laneVisuals[laneItem].shortLabel}
                </button>
              );
            })}
          </div>
          <div className="mt-5 overflow-x-auto pb-2" aria-label="Lifecycle stages">
            <div className="flex w-max items-center gap-2">
              {evidenceStages.map((stage, index) => {
                const Icon = stage.icon;
                return (
                  <div key={stage.key} className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-pressed={activeStageIndex === index}
                      onClick={() => setActiveStageIndex(index)}
                      className={`w-32 rounded-xl border px-3 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/70 ${activeStageIndex === index ? "border-sky-300/70 bg-sky-300/[0.08]" : "border-slate-700 bg-[#081a30]"}`}
                    >
                      <span className="flex items-center justify-between">
                        <Icon className="h-5 w-5 text-sky-400" aria-hidden="true" />
                        <CheckCircle2 className="h-4 w-4 text-teal-300" aria-hidden="true" />
                      </span>
                      <span className="mt-3 block text-sm font-semibold text-slate-100">{stage.label}</span>
                      <span className="mt-1 block text-[10px] leading-4 text-slate-400">{stage.caption}</span>
                    </button>
                    {index < evidenceStages.length - 1 && <ArrowRight className="h-4 w-4 shrink-0 text-sky-400" aria-hidden="true" />}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section
          aria-labelledby="selected-evidence-question"
          className="mt-7 rounded-2xl border border-slate-700/80 bg-[#07182c] px-5 py-4 md:px-7 lg:mt-20 lg:grid lg:grid-cols-[1.9fr_.95fr_.95fr_.95fr_auto] lg:items-center lg:gap-0"
        >
          <div className="flex items-start gap-4 pr-5">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-teal-300/70 text-teal-300">
              <SelectedLaneIcon className="h-7 w-7" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300">Selected question · {evidenceStages[activeStageIndex].label}</p>
              <h2 id="selected-evidence-question" className="mt-2 text-base font-semibold leading-6 text-slate-100">{selectedPackage.decisionQuestion}</h2>
              <p className="mt-1 text-xs text-slate-400">{selectedPackage.title}</p>
            </div>
          </div>

          <EvidenceSignal icon={FileText} tone="amber" label="Named sources" body="Bounded to named, versioned records." />
          <EvidenceSignal icon={Building2} tone="teal" label="Blueprint context" body="Discovery support within the stated scope." />
          <EvidenceSignal icon={BadgeCheck} tone="teal" label={selectedPackage.reviewStatus.replaceAll("-", " ")} body="Editorial review; SME approval is not implied." />

          <Link
            href={`/evidence/packages/${selectedPackage.id}`}
            className="mt-5 inline-flex min-h-11 items-center justify-center gap-4 rounded-lg bg-teal-300 px-5 text-sm font-bold text-slate-950 transition hover:bg-teal-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07182c] lg:mt-0"
          >
            Open package <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </section>

        <div className="mt-3 flex flex-col gap-3 rounded-xl border border-slate-700/70 bg-[#07172a] px-5 py-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-teal-300" aria-hidden="true" />
            <span className="font-semibold text-teal-300">Provenance</span>
            <span>Evidence lineage stays visible from source boundary to decision handoff.</span>
          </div>
          {progress.completedCount > 0 && <span className="shrink-0 font-semibold text-teal-200">Ready for review</span>}
        </div>
      </section>
    </main>
  );
}

function EvidenceSignal({ icon: Icon, tone, label, body }: { icon: LucideIcon; tone: "teal" | "amber"; label: string; body: string }) {
  return (
    <div className="mt-5 flex items-start gap-3 border-t border-slate-700/70 pt-5 lg:mt-0 lg:border-l lg:border-t-0 lg:px-5 lg:pt-0">
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border ${tone === "amber" ? "border-amber-300/70 text-amber-300" : "border-teal-300/60 text-teal-300"}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span>
        <span className="block text-sm font-semibold capitalize text-slate-100">{label}</span>
        <span className="mt-1 block text-xs leading-5 text-slate-400">{body}</span>
      </span>
    </div>
  );
}

function DecisionPackageDetail({ item }: { item: DecisionPackage }) {
  const careerTracks = getCareerTracksForPackage(item.id);
  const careerTrack = careerTracks[0];
  const nextPackage = getNextDecisionPackage(item.id);
  return (
    <main className="min-h-screen bg-[#061426] px-4 pb-24 pt-20 text-slate-100 md:pt-28">
      <div className="mx-auto max-w-6xl">
        <Link href="/evidence" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-teal-300 hover:text-teal-200"><ArrowLeft className="h-4 w-4" /> Atlas Evidence</Link>
        <header className="mt-6 max-w-4xl"><div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500"><span>Month {item.month}</span><span>·</span><span>{laneLabels[item.lane]}</span><span>·</span><span className="text-violet-300">{item.reviewStatus}</span></div><h1 className="mt-4 font-display text-4xl font-bold leading-tight tracking-[-0.03em] md:text-6xl">{item.title}</h1><p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">{item.summary}</p></header>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
          <section className="rounded-2xl border border-teal-300/20 bg-teal-300/[0.045] p-5 md:p-7"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300">Decision question</p><p className="mt-3 text-xl font-semibold leading-8 text-slate-100">{item.decisionQuestion}</p><p className="mt-5 text-sm leading-7 text-slate-400">{item.applicability}</p></section>
          <section className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.04] p-5 md:p-7"><p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200"><ShieldAlert className="h-4 w-4" /> Review boundary</p><p className="mt-3 text-sm leading-7 text-slate-300">This package is editorial-reviewed but not SME-approved. {item.compilerMode === "evidence-context-only" ? "It provides Blueprint evidence context only; the executable Compiler remains limited to the non-sterile microbiology wedge." : "It can be used only within the stated scope and review state."}</p></section>
        </div>

        <section className="mt-6 rounded-2xl border border-violet-300/20 bg-violet-300/[0.04] p-5 md:p-7"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-200">Discovery questions</p><p className="mt-2 text-sm leading-6 text-slate-500">Use these prompts to identify evidence, owners and next decisions; they do not supply a recommendation or acceptance criterion.</p><div className="mt-4 grid gap-3 md:grid-cols-2">{item.discoveryQuestions.map((question, index) => <div key={question} className="flex gap-3 rounded-xl border border-white/10 bg-slate-950/20 p-4"><span className="text-xs font-bold text-violet-300">0{index + 1}</span><p className="text-sm leading-6 text-slate-300">{question}</p></div>)}</div></section>

        <DecisionPackageLearningFlowGate packageId={item.id} />
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 md:p-7"><h2 className="text-xl font-bold">Connected resources</h2><p className="mt-2 text-sm leading-6 text-slate-500">Existing evidence is reused where available; planned artifacts stay visibly open.</p><div className="mt-5 space-y-2">{item.assetRefs.map((asset) => <a key={`${asset.kind}:${asset.slug}`} href={asset.href} onClick={() => analytics.decisionPackageAssetOpened(item.id, asset.kind, asset.slug)} className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-slate-950/20 px-4 py-3 text-sm transition hover:border-teal-300/35"><span><span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">{asset.kind}</span><span className="mt-1 block font-semibold text-slate-200">{asset.title}</span></span><ArrowRight className="h-4 w-4 shrink-0 text-teal-300" /></a>)}</div></section>
          <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 md:p-7"><h2 className="text-xl font-bold">Package completeness</h2><div className="mt-5 space-y-2">{item.artifactPlan.map((artifact) => <div key={artifact.kind} className="flex items-start gap-3 rounded-xl border border-white/10 bg-slate-950/20 px-4 py-3"><CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${artifact.status === "existing" ? "text-teal-300" : "text-amber-300"}`} /><div><p className="text-sm font-semibold text-slate-200">{artifact.title}</p><p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-600">{artifact.status === "existing" ? "Available" : "Planned · evidence required"}</p></div></div>)}</div></section>
        </div>

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.025] p-5 md:p-7"><div className="grid gap-6 lg:grid-cols-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">Sources</p><div className="mt-3 flex flex-wrap gap-2">{item.sourceIds.map((sourceId) => <span key={sourceId} className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-semibold text-slate-400">{sourceId}</span>)}</div></div><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">Required reviewers</p><ul className="mt-3 space-y-1 text-sm leading-6 text-slate-400">{item.reviewerRoles.map((role) => <li key={role}>• {role}</li>)}</ul></div><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">Limitations</p><ul className="mt-3 space-y-1 text-sm leading-6 text-slate-400">{item.limitations.map((limitation) => <li key={limitation}>• {limitation}</li>)}</ul></div></div></section>

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.025] p-5 md:p-7"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">Controlled source map &amp; licensing boundary</p><div className="mt-4 grid gap-3 md:grid-cols-2">{item.sourceIds.map((sourceId) => { const source = EVIDENCE_SOURCE_CATALOG.sources.find((candidate) => candidate.id === sourceId); return <article key={sourceId} className="rounded-xl border border-white/10 bg-slate-950/20 p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-slate-200">{source?.title ?? sourceId}</p><p className="mt-1 text-[10px] uppercase tracking-wider text-slate-600">{sourceId} · {item.sourceVersions[sourceId]}</p><p className="mt-1 text-[10px] text-slate-600">{source?.publisher ?? "Official source"}{source?.effectiveDate ? ` · effective ${source.effectiveDate}` : ""}</p></div>{source?.locator && <a href={source.locator} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-teal-300 hover:text-teal-200">Official source</a>}</div><p className="mt-3 text-xs leading-5 text-slate-500">{source?.licensingBoundary ?? "Confirm current edition, applicability and licensing before use."}</p></article>; })}</div></section>
        <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Handoff href={`/quality-lab/planner?package=${item.id}`} label="Use in Blueprint context" icon={Building2} destination="quality-lab" packageId={item.id} /><Handoff href={`/pro?package=${item.id}`} label="Continue in Atlas Pro" icon={BookOpenCheck} destination="pro" packageId={item.id} /><Handoff href={careerTracks.length > 1 ? "/career/domains" : careerTrack ? `/career?domain=${careerTrack.id}` : "/career"} label={careerTracks.length > 1 ? "Build shared Career evidence" : careerTrack ? `Build ${careerTrack.title} evidence` : "Build Career evidence"} icon={BriefcaseBusiness} destination="career" packageId={item.id} /><Handoff href={`/pro/monthly-review?package=${item.id}`} label="Run monthly review" icon={CalendarClock} destination="pro-monthly-review" packageId={item.id} /></section>
        {nextPackage && <section className="mt-6 flex flex-col gap-3 rounded-2xl border border-sky-300/20 bg-sky-300/[0.045] p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-300">Next lifecycle stage</p><p className="mt-2 text-sm font-semibold text-slate-200">Continue with {nextPackage.title}</p><p className="mt-1 text-xs leading-5 text-slate-500">Keep the same decision lineage and carry unresolved evidence into the next package.</p></div><Link href={`/pro?package=${nextPackage.id}`} onClick={() => analytics.decisionPackageProductHandoff(item.id, "pro-next-stage")} className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-sky-300 px-4 py-2 text-xs font-bold text-slate-950">Open next stage in Pro <ArrowRight className="h-4 w-4" /></Link></section>}
      </div>
    </main>
  );
}

function Handoff({ href, label, icon: Icon, destination, packageId }: { href: string; label: string; icon: typeof Building2; destination: string; packageId: string }) {
  return <Link href={href} onClick={() => analytics.decisionPackageProductHandoff(packageId, destination)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-center text-sm font-bold text-slate-200 transition hover:border-teal-300/35 hover:bg-teal-300/[0.08] hover:text-teal-100"><Icon className="h-4 w-4 text-teal-300" />{label}</Link>;
}
