import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FileSpreadsheet,
  FlaskConical,
  LockKeyhole,
  Network,
  Scale,
  Search,
  ShieldCheck,
  Target,
  type LucideIcon,
} from "lucide-react";
import {
  Handle,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { AtlasMark } from "@/components/Navigation";
import { analytics } from "@/hooks/use-analytics";
import { useSEO } from "@/hooks/use-seo";
import {
  getAtlasProWorkflow,
  type AtlasProWorkflowId,
} from "@shared/atlas-pro-workflows";
import { getDecisionPackage } from "@shared/decision-packages";

type SourceId = "evidence" | "workbench" | "file" | "audit";
type ReviewStepId = "frame" | "verify" | "decide" | "close";

const sourceShelf: Array<{
  id: SourceId;
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
  tone: string;
}> = [
  {
    id: "evidence",
    label: "Evidence",
    description: "Named sources and context",
    href: "/evidence",
    icon: BookOpenCheck,
    tone: "text-teal-300",
  },
  {
    id: "workbench",
    label: "Lab Workbench",
    description: "Demand, capacity, supply",
    href: "/pro/lab-workbench",
    icon: FlaskConical,
    tone: "text-violet-300",
  },
  {
    id: "file",
    label: "Working File",
    description: "Analysis and assumptions",
    href: "/toolkits",
    icon: FileSpreadsheet,
    tone: "text-sky-300",
  },
  {
    id: "audit",
    label: "Audit Readiness",
    description: "Gaps and preparedness",
    href: "/toolkits/gmp-audit-kit",
    icon: ShieldCheck,
    tone: "text-teal-300",
  },
];

const reviewSteps: Array<{
  id: ReviewStepId;
  label: string;
  description: string;
  icon: LucideIcon;
}> = [
  { id: "frame", label: "Frame", description: "Define the decision and boundaries", icon: Target },
  { id: "verify", label: "Verify", description: "Check evidence and assumptions", icon: Search },
  { id: "decide", label: "Decide", description: "Compare options and choose a path", icon: Scale },
  { id: "close", label: "Close", description: "Document decision and next actions", icon: CheckCircle2 },
];

function openSearch() {
  window.dispatchEvent(new Event("lsa:open-search"));
}

function ProNav() {
  return (
    <header className="relative z-50 flex h-[4.75rem] items-center border-b border-slate-700/60 bg-[#031426]/95 px-4 backdrop-blur-md sm:px-6 lg:px-7">
      <Link href="/" aria-label="Life Science Atlas home" className="flex shrink-0 items-center gap-2.5 transition hover:opacity-85">
        <span className="grid h-10 w-10 place-items-center rounded-lg border border-teal-300/20 bg-[#071b2f] p-1.5">
          <AtlasMark className="h-full w-full" />
        </span>
        <span className="hidden font-display text-xl font-bold text-slate-50 sm:inline">
          Life Science <span className="text-teal-300">Atlas</span>
        </span>
      </Link>

      <span className="ml-3 inline-flex min-h-9 items-center rounded-lg border border-teal-300/40 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-teal-200 sm:text-xs">
        Atlas Pro
      </span>

      <nav aria-label="Atlas Pro navigation" className="ml-10 hidden items-center gap-8 text-sm font-medium text-slate-300 lg:flex">
        <Link href="/products" className="transition hover:text-teal-200">Products</Link>
        <Link href="/how-it-works" className="transition hover:text-teal-200">How Atlas works</Link>
        <Link href="/evidence" className="transition hover:text-teal-200">Resources</Link>
        <Link href="/pricing" className="transition hover:text-teal-200">Pricing</Link>
      </nav>

      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        <button
          type="button"
          onClick={openSearch}
          aria-label="Search Atlas"
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-700/80 bg-[#07192c] px-3 text-xs text-slate-400 transition hover:border-teal-300/30 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300/70"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          <span className="hidden md:inline">Search</span>
          <span className="hidden rounded bg-slate-700/60 px-1.5 py-0.5 text-[9px] xl:inline">Ctrl K</span>
        </button>
        <Link href="/login" className="hidden text-sm font-semibold text-slate-200 transition hover:text-teal-200 sm:inline">Sign in</Link>
        <Link href="/register" className="inline-flex min-h-10 items-center rounded-lg bg-teal-300 px-4 text-xs font-bold text-slate-950 transition hover:bg-teal-200 sm:px-5 sm:text-sm">Start free</Link>
      </div>
    </header>
  );
}

type SourceNodeData = Record<string, unknown> & {
  item: (typeof sourceShelf)[number];
  active: boolean;
  onSelect: () => void;
};

type CenterNodeData = Record<string, unknown> & {
  question: string;
  evidenceStatus: string;
  assumptionStatus: string;
  owner: string;
  nextReview: string;
  activeSource: string;
};

type CanvasSourceNode = Node<SourceNodeData, "source-node">;
type CanvasCenterNode = Node<CenterNodeData, "center-node">;

function SourceNodeView({ data }: NodeProps<CanvasSourceNode>) {
  const Icon = data.item.icon;
  return (
    <div className="relative w-[290px]">
      <button
        type="button"
        aria-label={`${data.item.label}: ${data.item.description}`}
        aria-pressed={data.active}
        onClick={data.onSelect}
        className={`nodrag nopan group flex min-h-[74px] w-full items-center gap-3 rounded-xl border py-2.5 pl-3 pr-14 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300/70 ${data.active ? "border-teal-300/60 bg-teal-300/[0.075] shadow-[0_0_28px_rgba(45,212,191,.1)]" : "border-slate-700/80 bg-[#07192b]/95 hover:border-sky-300/35"}`}
      >
        <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-slate-600/70 bg-[#0a2138] ${data.item.tone}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-slate-100">{data.item.label}</span>
          <span className="mt-1 block text-xs leading-5 text-slate-400">{data.item.description}</span>
        </span>
      </button>
      <Link
        href={data.item.href}
        aria-label={`Open ${data.item.label}`}
        className="nodrag nopan absolute right-2.5 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-slate-500 transition hover:bg-white/5 hover:text-teal-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300/70"
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Link>
      <Handle type="source" position={Position.Right} isConnectable={false} className="!h-2.5 !w-2.5 !border-2 !border-[#041426] !bg-sky-300" />
    </div>
  );
}

function CenterNodeView({ data }: NodeProps<CanvasCenterNode>) {
  const rows = [
    [BookOpenCheck, "Evidence status", data.evidenceStatus, "text-teal-300"],
    [ClipboardCheck, "Assumptions", data.assumptionStatus, "text-violet-300"],
    [Target, "Owner", data.owner, "text-sky-300"],
    [CalendarDays, "Next review", data.nextReview, "text-teal-300"],
  ] as const;

  return (
    <div className="relative grid h-[500px] w-[500px] place-items-center rounded-full border-2 border-sky-300/80 bg-[#031426]/95 p-14 text-center shadow-[0_0_48px_rgba(56,189,248,.12),inset_0_0_45px_rgba(14,165,233,.045)]">
      <Handle type="target" position={Position.Left} isConnectable={false} className="!h-3 !w-3 !border-2 !border-[#041426] !bg-sky-300" />
      <div className="w-full">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-teal-300/60 bg-teal-300/[0.05] text-teal-200">
          <Network className="h-7 w-7" aria-hidden="true" />
        </span>
        <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300">This month&apos;s decision</p>
        <h2 className="mx-auto mt-3 max-w-[360px] font-display text-[1.35rem] font-semibold leading-8 text-slate-100">{data.question}</h2>
        <div className="mt-5 border-t border-slate-700/70 text-left">
          {rows.map(([Icon, label, value, tone]) => (
            <div key={label} className="flex min-h-11 items-center gap-3 border-b border-slate-700/55 px-1 py-2 text-xs">
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/[0.04] ${tone}`}><Icon className="h-4 w-4" aria-hidden="true" /></span>
              <span className="text-slate-400">{label}</span>
              <span className={`ml-auto max-w-[190px] text-right font-semibold ${tone}`}>{value}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[10px] leading-5 text-slate-500">Selected source · {data.activeSource}</p>
      </div>
    </div>
  );
}

const canvasNodeTypes = {
  "source-node": SourceNodeView,
  "center-node": CenterNodeView,
};

function CanvasGraph({
  activeSource,
  onSource,
  centerData,
}: {
  activeSource: SourceId;
  onSource: (id: SourceId) => void;
  centerData: CenterNodeData;
}) {
  const nodes = useMemo<Array<CanvasSourceNode | CanvasCenterNode>>(() => [
    ...sourceShelf.map((item, index): CanvasSourceNode => ({
      id: item.id,
      type: "source-node",
      position: { x: 40, y: 195 + index * 88 },
      draggable: false,
      selectable: false,
      data: { item, active: activeSource === item.id, onSelect: () => onSource(item.id) },
    })),
    {
      id: "decision",
      type: "center-node",
      position: { x: 480, y: 85 },
      draggable: false,
      selectable: false,
      data: centerData,
    },
  ], [activeSource, centerData, onSource]);

  const edges = useMemo<Edge[]>(() => sourceShelf.map((item) => ({
    id: `${item.id}-decision`,
    source: item.id,
    target: "decision",
    type: "smoothstep",
    animated: item.id === activeSource,
    style: {
      stroke: item.id === activeSource ? "#67e8f9" : "#35546d",
      strokeWidth: item.id === activeSource ? 2 : 1.2,
    },
  })), [activeSource]);

  return (
    <div className="relative h-[660px] min-w-0">
      <div className="pointer-events-none absolute left-10 top-[168px] z-20 text-[10px] font-bold uppercase tracking-[0.2em] text-teal-300">Source shelf</div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={canvasNodeTypes}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={1}
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
        aria-label="Atlas Pro sources connected to this month's quality decision"
        onNodeClick={(_, selectedNode) => {
          if ("onSelect" in selectedNode.data && typeof selectedNode.data.onSelect === "function") selectedNode.data.onSelect();
        }}
      />
    </div>
  );
}

function monthLabel(offset: number) {
  const value = new Date();
  value.setDate(1);
  value.setMonth(value.getMonth() + offset);
  return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(value).toUpperCase();
}

function reviewDateLabel() {
  const value = new Date();
  value.setMonth(value.getMonth() + 1, 0);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(value);
}

export default function ProPage() {
  const packageId = typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("package");
  const packageContext = packageId ? getDecisionPackage(packageId) : undefined;
  const [activeSource, setActiveSource] = useState<SourceId>("evidence");
  const [activeStep, setActiveStep] = useState<ReviewStepId>("frame");
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<AtlasProWorkflowId>("audit-readiness");
  const selectedWorkflow = getAtlasProWorkflow(selectedWorkflowId);
  const activeSourceItem = sourceShelf.find((item) => item.id === activeSource) ?? sourceShelf[0];

  const history = useMemo(() => [
    { month: monthLabel(-3), workflowId: "quality-signal" as const, status: "Example closed", tone: "text-teal-300" },
    { month: monthLabel(-2), workflowId: "method-capacity" as const, status: "Example closed", tone: "text-teal-300" },
    { month: monthLabel(-1), workflowId: "pharma-api-impurity-control" as const, status: "Example closed", tone: "text-teal-300" },
    { month: monthLabel(0), workflowId: selectedWorkflowId, status: "In progress", tone: "text-sky-300", current: true },
    { month: "CARRYOVER", workflowId: "biopharma-control-strategy" as const, status: "Deferred example", tone: "text-violet-300" },
  ], [selectedWorkflowId]);

  const centerData = useMemo<CenterNodeData>(() => ({
    question: packageContext?.decisionQuestion ?? selectedWorkflow.question,
    evidenceStatus: packageContext ? `${packageContext.sourceIds.length} named sources` : `${selectedWorkflow.lessonSlugs.length} linked lessons`,
    assumptionStatus: packageContext ? packageContext.reviewStatus.replaceAll("-", " ") : "Reviewer check open",
    owner: packageContext?.reviewerRoles[0] ?? "Unassigned",
    nextReview: reviewDateLabel(),
    activeSource: activeSourceItem.label,
  }), [activeSourceItem.label, packageContext, selectedWorkflow]);

  const monthlyReviewHref = packageContext ? `/pro/monthly-review?package=${packageContext.id}` : "/pro/monthly-review";

  useSEO({
    title: "Atlas Pro Quality Review Canvas",
    description: "Build one bounded monthly quality decision from evidence, practical tools, working files, review steps and accountable carryover.",
  });

  function selectWorkflow(id: AtlasProWorkflowId) {
    setSelectedWorkflowId(id);
    setActiveStep("frame");
    analytics.proWorkflowSelected(id);
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#041426] text-slate-100" style={{ backgroundImage: "url('/images/blueprint/decision-observatory-grid.jpg')", backgroundPosition: "top center", backgroundSize: "1600px auto", backgroundBlendMode: "soft-light" }}>
      <ProNav />

      <section className="mx-auto max-w-[1440px] px-4 pb-5 pt-8 sm:px-6 lg:px-8 lg:pt-10">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_275px] lg:items-start">
          <div className="relative min-w-0">
            <header className="relative z-20 lg:absolute lg:left-10">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-teal-300">Quality review canvas</p>
              <h1 className="mt-3 max-w-[390px] font-display text-4xl font-bold leading-[1.03] tracking-[-0.035em] text-slate-50 sm:text-5xl">
                Build this month&apos;s quality <span className="text-sky-300">decision.</span>
              </h1>
            </header>

            <div className="hidden lg:block">
              <CanvasGraph activeSource={activeSource} onSource={setActiveSource} centerData={centerData} />
            </div>

            <div className="mt-7 lg:hidden">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-300">Source shelf</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {sourceShelf.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button key={item.id} type="button" aria-label={`${item.label}: ${item.description}`} aria-pressed={activeSource === item.id} onClick={() => setActiveSource(item.id)} className={`min-h-24 rounded-xl border p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300/70 ${activeSource === item.id ? "border-teal-300/60 bg-teal-300/[0.07]" : "border-slate-700 bg-[#07192b]/90"}`}>
                      <Icon className={`h-5 w-5 ${item.tone}`} aria-hidden="true" />
                      <span className="mt-3 block text-xs font-bold text-slate-100">{item.label}</span>
                      <span className="mt-1 block text-[10px] leading-4 text-slate-500">{item.description}</span>
                    </button>
                  );
                })}
              </div>

              <section className="mx-auto mt-7 grid aspect-square max-w-[390px] place-items-center rounded-full border-2 border-sky-300/75 bg-[#031426]/95 p-8 text-center shadow-[0_0_42px_rgba(56,189,248,.12)]">
                <div>
                  <Network className="mx-auto h-8 w-8 text-teal-300" aria-hidden="true" />
                  <p className="mt-4 text-[9px] font-bold uppercase tracking-[0.18em] text-teal-300">This month&apos;s decision</p>
                  <h2 className="mt-3 text-lg font-semibold leading-7 text-white">{centerData.question}</h2>
                  <div className="mt-5 space-y-2 border-t border-slate-700/70 pt-4 text-left text-[11px]">
                    <p className="flex justify-between gap-3"><span className="text-slate-500">Evidence</span><strong className="text-teal-300">{centerData.evidenceStatus}</strong></p>
                    <p className="flex justify-between gap-3"><span className="text-slate-500">Assumptions</span><strong className="text-violet-300">{centerData.assumptionStatus}</strong></p>
                    <p className="flex justify-between gap-3"><span className="text-slate-500">Owner</span><strong className="text-sky-300">{centerData.owner}</strong></p>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <aside className="pt-2 lg:pl-8 lg:pt-11" aria-label="Review path">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-teal-300">Review path</p>
            <div className="mt-5 grid grid-cols-2 gap-2 lg:grid-cols-1 lg:gap-3">
              {reviewSteps.map((step, index) => {
                const Icon = step.icon;
                const active = activeStep === step.id;
                return (
                  <button key={step.id} type="button" aria-label={`${step.label}: ${step.description}`} aria-pressed={active} onClick={() => setActiveStep(step.id)} className={`group flex min-h-[84px] items-center gap-3 rounded-xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300/70 ${active ? "border-teal-300/55 bg-teal-300/[0.065] shadow-[0_0_26px_rgba(45,212,191,.08)]" : "border-slate-700/80 bg-[#07192b]/90 hover:border-sky-300/35"}`}>
                    <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border text-sm font-bold ${active ? "border-sky-300 text-sky-300" : "border-slate-600 text-slate-500"}`}>{index + 1}</span>
                    <span className="min-w-0">
                      <span className={`flex items-center gap-2 text-sm font-bold ${active ? "text-teal-200" : "text-slate-300"}`}><Icon className="h-4 w-4" aria-hidden="true" />{step.label}</span>
                      <span className="mt-1 block text-[11px] leading-4 text-slate-500">{step.description}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            <Link href={monthlyReviewHref} className="mt-5 inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-xl bg-sky-300 px-5 text-sm font-bold text-slate-950 transition hover:bg-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
              Open review canvas <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href={activeSourceItem.href} className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-white/[0.025] px-4 text-xs font-semibold text-slate-300 transition hover:border-teal-300/40 hover:text-teal-200">
              Open selected source <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </aside>
        </div>

        <section className="mt-3 lg:-mt-6 lg:ml-10" aria-labelledby="monthly-history-heading">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p id="monthly-history-heading" className="text-[10px] font-bold uppercase tracking-[0.22em] text-teal-300">Illustrative monthly history</p>
              <p className="mt-1 text-[10px] leading-5 text-slate-600">Examples show the operating pattern only; they are not client records or approved decisions.</p>
            </div>
            <Link href="/pro/monthly-review" className="hidden text-xs font-bold text-sky-300 hover:text-sky-200 sm:inline">View monthly workspace</Link>
          </div>
          <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
            {history.map((item, index) => {
              const workflow = getAtlasProWorkflow(item.workflowId);
              const selected = Boolean(item.current);
              return (
                <button key={`${item.month}-${index}`} type="button" onClick={() => selectWorkflow(item.workflowId)} className={`min-h-[102px] min-w-[220px] flex-1 rounded-xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300/70 ${selected ? "border-sky-300/80 bg-sky-300/[0.065]" : "border-slate-700/80 bg-[#07192b]/85 hover:border-sky-300/35"}`}>
                  <span className="flex items-center justify-between gap-2 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500"><span>{item.month}</span>{item.current && <span className="rounded-full bg-sky-300 px-2 py-0.5 text-[8px] text-slate-950">Current</span>}</span>
                  <span className="mt-3 block text-xs font-semibold leading-5 text-slate-200">{workflow.question}</span>
                  <span className={`mt-2 block text-[10px] font-semibold ${item.tone}`}>{item.status}</span>
                </button>
              );
            })}
          </div>
        </section>

        <footer className="mt-4 flex items-start gap-3 rounded-xl border border-slate-700/75 bg-[#07192b]/80 px-4 py-3 text-[10px] leading-5 text-slate-500 lg:ml-10">
          <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
          <p>Atlas Pro provides professional working support to structure and document decisions. It is not project-specific expert review, QA approval, regulatory advice, or a controlled site record.</p>
        </footer>
      </section>
    </div>
  );
}
