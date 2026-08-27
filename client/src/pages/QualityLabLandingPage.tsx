import { useEffect, useMemo, useState, type ComponentType } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Boxes,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Droplets,
  FileOutput,
  FileText,
  FlaskConical,
  Gauge,
  Hexagon,
  Layers3,
  Menu,
  Microscope,
  PackageCheck,
  Settings2,
  ShieldCheck,
  TestTubeDiagonal,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import {
  Line,
  LineChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import {
  Handle,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useSEO } from "@/hooks/use-seo";
import { SITE_URL } from "@/lib/site";
import { analytics } from "@/hooks/use-analytics";

type StageKey = "portfolio" | "methods" | "workload" | "resources" | "outputs";
type NodeVariant = "portfolio" | "method" | "workload" | "seasonality" | "resource" | "output" | "anchor";

type Stage = {
  key: StageKey;
  number: string;
  label: string;
  detail: string;
  icon: LucideIcon;
};

type AtlasNodeData = Record<string, unknown> & {
  stage: StageKey;
  variant: NodeVariant;
  title: string;
  meta?: string;
  badge?: string;
  icon?: ComponentType<{ className?: string }>;
  hasTarget?: boolean;
  hasSource?: boolean;
  selected?: boolean;
  active?: boolean;
};

type AtlasNode = Node<AtlasNodeData, "atlas">;
type AtlasEdge = Edge<{ stage: StageKey }>;

const stages: Stage[] = [
  { key: "portfolio", number: "1", label: "Product portfolio", detail: "Products + markets", icon: Boxes },
  { key: "methods", number: "2", label: "Applicable methods", detail: "Evidence-linked scope", icon: FlaskConical },
  { key: "workload", number: "3", label: "Workload", detail: "Demand over time", icon: Activity },
  { key: "resources", number: "4", label: "Resources", detail: "People, equipment, space", icon: Users },
  { key: "outputs", number: "5", label: "Blueprint outputs", detail: "Decisions you can defend", icon: FileOutput },
];

const demandSeries = [
  { horizon: "Now", batches: 30 },
  { horizon: "Y1", batches: 36 },
  { horizon: "Y2", batches: 42 },
  { horizon: "Y3", batches: 51 },
];

const seasonalitySeries = [
  { month: "J", load: 26 },
  { month: "F", load: 33 },
  { month: "M", load: 38 },
  { month: "A", load: 36 },
  { month: "M", load: 31 },
  { month: "J", load: 44 },
  { month: "J", load: 28 },
  { month: "A", load: 35 },
  { month: "S", load: 42 },
  { month: "O", load: 49 },
  { month: "N", load: 56 },
  { month: "D", load: 61 },
];

const radialDemand = [{ name: "Three-year growth", value: 70, fill: "#5eead4" }];

const portfolioRows = [
  { title: "Finished products", meta: "40 products", badge: "Selected", icon: PackageCheck },
  { title: "Production cadence", meta: "30 batches / month", icon: Boxes },
  { title: "Growth horizon", meta: "+70% over 3 years", icon: Activity },
  { title: "Target markets", meta: "EU + Vietnam", icon: Building2 },
  { title: "Site evidence", meta: "Inputs still required", icon: FileText },
];

const methodRows = [
  { title: "Microbial enumeration", meta: "Compendial basis", badge: "In scope", icon: Microscope },
  { title: "Specified organisms", meta: "Compendial basis", badge: "In scope", icon: TestTubeDiagonal },
  { title: "Method suitability", meta: "Product-specific proof", badge: "Verify", icon: ShieldCheck },
  { title: "Media + growth promotion", meta: "Controlled evidence", badge: "Review", icon: Layers3 },
  { title: "Water microbiology", meta: "Site system input", badge: "Open", icon: Droplets },
];

const resourceRows = [
  { title: "People", meta: "Analyst touch time", badge: "Size", icon: Users },
  { title: "Incubation", meta: "Occupancy + hold time", badge: "Model", icon: Gauge },
  { title: "Autoclave", meta: "Cycle demand", badge: "Model", icon: Wrench },
  { title: "Consumables", meta: "Forecast basis", badge: "Open", icon: PackageCheck },
  { title: "Review support", meta: "Cross-functional gate", badge: "Required", icon: BadgeCheck },
];

const outputRows = [
  { title: "Workload model", meta: "Inputs → demand", badge: "Visible", icon: Activity },
  { title: "Capacity model", meta: "Demand → resources", badge: "Review", icon: Gauge },
  { title: "Capability map", meta: "Scope + gaps", badge: "Traceable", icon: ClipboardList },
  { title: "Operating model", meta: "Scenarios + risks", badge: "Compare", icon: BriefcaseBusiness },
  { title: "Investment basis", meta: "Concept band only", badge: "Not final", icon: Settings2 },
];

const node = (
  id: string,
  x: number,
  y: number,
  width: number,
  height: number,
  data: AtlasNodeData,
): AtlasNode => ({ id, type: "atlas", position: { x, y }, style: { width, height }, data });

const baseNodes: AtlasNode[] = [
  ...portfolioRows.map((item, index) => node(
    `portfolio-${index}`,
    8,
    34 + index * 66,
    214,
    56,
    { ...item, stage: "portfolio", variant: "portfolio", selected: index === 0, hasSource: index === 0 },
  )),
  ...methodRows.map((item, index) => node(
    `method-${index}`,
    350,
    34 + index * 66,
    202,
    56,
    { ...item, stage: "methods", variant: "method", hasTarget: true, hasSource: true },
  )),
  node("workload", 665, 76, 218, 218, {
    stage: "workload",
    variant: "workload",
    title: "Production demand",
    meta: "Illustrative monthly batches",
    hasTarget: true,
    hasSource: true,
    icon: Activity,
  }),
  node("seasonality", 658, 312, 232, 92, {
    stage: "workload",
    variant: "seasonality",
    title: "Seasonality view",
    meta: "Illustrative load index",
  }),
  node("flow-anchor", 770, 479, 1, 1, {
    stage: "workload",
    variant: "anchor",
    title: "",
  }),
  ...resourceRows.map((item, index) => node(
    `resource-${index}`,
    992,
    34 + index * 66,
    194,
    56,
    { ...item, stage: "resources", variant: "resource", hasTarget: true, hasSource: true },
  )),
  ...outputRows.map((item, index) => node(
    `output-${index}`,
    1288,
    34 + index * 66,
    238,
    56,
    { ...item, stage: "outputs", variant: "output", hasTarget: true },
  )),
];

const edge = (id: string, source: string, target: string, stage: StageKey, stroke: string): AtlasEdge => ({
  id,
  source,
  target,
  type: "default",
  data: { stage },
  selectable: false,
  focusable: false,
  style: { stroke, strokeWidth: 1.5 },
});

const baseEdges: AtlasEdge[] = [
  ...methodRows.map((_, index) => edge(`portfolio-method-${index}`, "portfolio-0", `method-${index}`, "methods", "#2dd4bf")),
  ...methodRows.map((_, index) => edge(`method-workload-${index}`, `method-${index}`, "workload", "workload", "#1f9d92")),
  ...resourceRows.map((_, index) => edge(`workload-resource-${index}`, "workload", `resource-${index}`, "resources", "#0ea5e9")),
  edge("resource-output-0", "resource-0", "output-0", "outputs", "#1687d9"),
  edge("resource-output-1", "resource-1", "output-1", "outputs", "#1687d9"),
  edge("resource-output-2", "resource-2", "output-2", "outputs", "#1687d9"),
  edge("resource-output-3", "resource-3", "output-3", "outputs", "#1687d9"),
  edge("resource-output-4", "resource-4", "output-4", "outputs", "#1687d9"),
  edge("support-workload", "resource-4", "output-0", "outputs", "#1687d9"),
  edge("support-capacity", "resource-4", "output-1", "outputs", "#1687d9"),
  edge("support-capability", "resource-4", "output-2", "outputs", "#1687d9"),
  edge("support-operating", "resource-4", "output-3", "outputs", "#1687d9"),
];

const trustItems = [
  { label: "Evidence basis", value: "Linked sources", note: "Standards + site data", icon: FileText, tone: "teal", href: "/quality-lab/evidence" },
  { label: "Assumptions", value: "Open by design", note: "Unresolved stays visible", icon: CircleHelp, tone: "sky", href: "/quality-lab/sample" },
  { label: "Expert review", value: "Required gate", note: "Quality, engineering, ops", icon: CheckCircle2, tone: "teal", href: "/quality-lab/review" },
  { label: "Decision status", value: "Concept", note: "Not a validated design", icon: AlertTriangle, tone: "amber", href: "/quality-lab/how-it-works" },
] as const;

const toneClasses = {
  teal: "border-teal-300/25 bg-teal-300/[0.08] text-teal-200",
  sky: "border-sky-300/25 bg-sky-300/[0.08] text-sky-200",
  amber: "border-amber-300/25 bg-amber-300/[0.08] text-amber-200",
};

function AtlasFlowNode({ data }: NodeProps<AtlasNode>) {
  const Icon = data.icon;
  const emphasized = data.active || data.selected;
  const handleClass = data.variant === "output" || data.variant === "resource"
    ? "!border-[#061522] !bg-sky-400"
    : "!border-[#061522] !bg-teal-300";

  if (data.variant === "anchor") return <span aria-hidden="true" />;

  if (data.variant === "workload") {
    return (
      <div className={`relative h-full w-full rounded-full border bg-[#071827]/95 shadow-[0_0_45px_rgba(45,212,191,0.12)] ${emphasized ? "border-teal-300/55" : "border-teal-300/30"}`}>
        {data.hasTarget && <Handle type="target" position={Position.Left} className={`!h-3 !w-3 !border-2 ${handleClass}`} isConnectable={false} />}
        <RadialBarChart width={218} height={218} cx="50%" cy="50%" innerRadius="78%" outerRadius="96%" barSize={8} data={radialDemand} startAngle={215} endAngle={-35}>
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar dataKey="value" background={{ fill: "#103548" }} cornerRadius={8} isAnimationActive={false} />
        </RadialBarChart>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="text-[10px] font-medium text-slate-400">{data.title}</p>
          <strong className="mt-1 font-display text-[31px] leading-none text-teal-300">30 → 51</strong>
          <p className="mt-2 text-[9px] text-slate-400">batches / month · 3 years</p>
          <span className="mt-3 rounded-full border border-teal-300/20 bg-teal-300/[0.07] px-2 py-1 text-[8px] font-bold uppercase tracking-[0.12em] text-teal-200">+70% horizon</span>
        </div>
        {data.hasSource && <Handle type="source" position={Position.Right} className="!h-3 !w-3 !border-2 !border-[#061522] !bg-sky-400" isConnectable={false} />}
      </div>
    );
  }

  if (data.variant === "seasonality") {
    return (
      <div className={`h-full w-full ${emphasized ? "opacity-100" : "opacity-75"}`} role="img" aria-label="Illustrative seasonality line showing a variable monthly load index.">
        <LineChart width={232} height={62} data={seasonalitySeries} margin={{ top: 8, right: 5, bottom: 0, left: 5 }}>
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 7 }} interval={0} />
          <Line type="monotone" dataKey="load" stroke="#2dd4bf" strokeWidth={2} dot={{ r: 2.2, fill: "#071827", stroke: "#5eead4", strokeWidth: 1.5 }} isAnimationActive={false} />
        </LineChart>
        <p className="mt-1 text-center text-[8px] font-medium text-slate-400">Seasonality view · illustrative index</p>
      </div>
    );
  }

  const variantClass = data.variant === "output"
    ? "border-sky-400/25 bg-sky-400/[0.055]"
    : data.variant === "method"
      ? "border-transparent bg-teal-300/[0.055]"
      : data.variant === "resource"
        ? "border-transparent bg-sky-400/[0.055]"
        : "border-white/10 bg-[#0a1c2b]/92";

  return (
    <div className={`relative flex h-full w-full items-center gap-3 rounded-md border px-3 shadow-[0_8px_22px_rgba(0,0,0,0.14)] transition ${variantClass} ${emphasized ? "border-teal-300/65 bg-teal-300/[0.09]" : ""}`}>
      {data.hasTarget && <Handle type="target" position={Position.Left} className={`!h-3 !w-3 !border-2 ${handleClass}`} isConnectable={false} />}
      {Icon && (
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${data.variant === "output" || data.variant === "resource" ? "bg-sky-400/10 text-sky-300" : "bg-teal-300/[0.08] text-teal-200"}`}>
          <Icon className="h-[17px] w-[17px]" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[11px] font-semibold leading-4 text-slate-100">{data.title}</span>
        {data.meta && <span className="mt-0.5 block truncate text-[9px] leading-3 text-slate-400">{data.meta}</span>}
      </span>
      {data.badge && <span className={`shrink-0 text-[9px] font-bold ${data.variant === "output" || data.variant === "resource" ? "text-sky-300" : data.badge === "Open" || data.badge === "Verify" ? "text-amber-200" : "text-teal-300"}`}>{data.badge}</span>}
      {data.hasSource && <Handle type="source" position={Position.Right} className={`!h-3 !w-3 !border-2 ${handleClass}`} isConnectable={false} />}
    </div>
  );
}

const nodeTypes = { atlas: AtlasFlowNode };

function BrandMark() {
  return (
    <span className="relative flex h-9 w-9 items-center justify-center text-teal-300" aria-hidden="true">
      <Hexagon className="absolute inset-0 h-9 w-9 stroke-[1.4]" />
      <span className="font-display text-base font-semibold">A</span>
    </span>
  );
}

function QualityLabNav() {
  return (
    <header className="border-b border-white/10 bg-[#061421]/96">
      <div className="mx-auto flex h-[68px] max-w-[96rem] items-center px-5 lg:px-7">
        <Link href="/quality-lab" className="flex shrink-0 items-center gap-2.5" aria-label="Atlas Quality Lab Compiler home">
          <BrandMark />
          <span className="font-display text-[15px] font-semibold tracking-tight text-white"><span className="text-teal-300">Atlas</span><span className="hidden sm:inline"> Quality Lab Compiler</span></span>
        </Link>
        <nav className="mx-auto hidden items-center gap-12 text-[13px] font-medium text-slate-300 lg:flex" aria-label="Quality Lab navigation">
          <Link href="/quality-lab/how-it-works" className="transition hover:text-white">How Atlas works</Link>
          <Link href="/methods" className="transition hover:text-white">Methods</Link>
          <Link href="/evidence" className="transition hover:text-white">Resources</Link>
          <Link href="/pricing" className="transition hover:text-white">Pricing</Link>
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <Link href="/login?next=/quality-lab/projects" className="hidden text-[13px] font-semibold text-slate-100 transition hover:text-teal-200 sm:inline-flex">Sign in</Link>
          <Link href="/quality-lab/planner" onClick={() => analytics.blueprintCtaClicked("quality_lab_immersive_nav", "planner")} className="inline-flex min-h-10 items-center justify-center rounded-lg bg-teal-300 px-3 text-[12px] font-bold text-slate-950 transition hover:bg-teal-200 sm:px-4 sm:text-[13px]"><span className="sm:hidden">Build</span><span className="hidden sm:inline">Build a blueprint</span></Link>
          <Link href="/products" className="inline-flex h-10 w-10 items-center justify-center text-slate-200 lg:hidden" aria-label="Open product navigation"><Menu className="h-5 w-5" /></Link>
        </div>
      </div>
    </header>
  );
}

function StageHeading({ stage, active, onSelect }: { stage: Stage; active: boolean; onSelect: () => void }) {
  const Icon = stage.icon;
  return (
    <button type="button" role="tab" aria-selected={active} aria-controls="blueprint-flow-canvas" onClick={onSelect} className={`group relative min-w-0 px-3 py-2 text-left transition ${active ? "text-white" : "text-slate-400 hover:text-slate-200"}`}>
      <span className="flex items-start gap-2.5">
        <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${active ? "text-teal-300" : "text-slate-400 group-hover:text-teal-200"}`} />
        <span className="min-w-0">
          <span className="block truncate text-[10px] font-bold uppercase tracking-[0.08em]">{stage.number}. {stage.label}</span>
          <span className="mt-1 block truncate text-[9px] text-slate-400">{stage.detail}</span>
        </span>
      </span>
      {stage.key !== "outputs" && <ChevronRight className="absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />}
    </button>
  );
}

function WorkloadMobile() {
  return (
    <div className="grid gap-4 sm:grid-cols-[0.9fr_1.1fr]">
      <div className="relative mx-auto h-52 w-52 rounded-full border border-teal-300/35 bg-[#071827]">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart cx="50%" cy="50%" innerRadius="78%" outerRadius="96%" barSize={8} data={radialDemand} startAngle={215} endAngle={-35}>
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar dataKey="value" background={{ fill: "#103548" }} cornerRadius={8} isAnimationActive={false} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] text-slate-400">Production demand</span>
          <strong className="mt-1 font-display text-3xl text-teal-300">30 → 51</strong>
          <span className="mt-2 text-[9px] text-slate-400">batches / month</span>
        </div>
      </div>
      <div className="h-52 rounded-xl border border-white/10 bg-white/[0.03] p-3" role="img" aria-label="Illustrative production demand grows from 30 to 51 batches per month over three years.">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Three-year horizon</p>
        <ResponsiveContainer width="100%" height="84%">
          <LineChart data={demandSeries} margin={{ top: 18, right: 8, left: 8, bottom: 0 }}>
            <XAxis dataKey="horizon" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 9 }} />
            <Tooltip contentStyle={{ background: "#071827", border: "1px solid #1f5562", borderRadius: 8, color: "#fff", fontSize: 10 }} formatter={(value) => [`${value} batches / month`, "Illustrative demand"]} />
            <Line type="monotone" dataKey="batches" stroke="#5eead4" strokeWidth={2.5} dot={{ fill: "#071827", stroke: "#5eead4", strokeWidth: 2, r: 3.5 }} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function MobileStagePanel({ stage }: { stage: StageKey }) {
  if (stage === "workload") return <WorkloadMobile />;
  const rows = stage === "portfolio" ? portfolioRows : stage === "methods" ? methodRows : stage === "resources" ? resourceRows : outputRows;
  return (
    <div className="space-y-2">
      {rows.map((row, index) => {
        const Icon = row.icon;
        return (
          <div key={row.title} className={`flex items-center gap-3 rounded-xl border p-3 ${stage === "portfolio" && index === 0 ? "border-teal-300/55 bg-teal-300/[0.08]" : stage === "outputs" ? "border-sky-300/20 bg-sky-300/[0.05]" : "border-white/10 bg-white/[0.03]"}`}>
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${stage === "outputs" ? "bg-sky-300/10 text-sky-200" : "bg-teal-300/[0.08] text-teal-200"}`}><Icon className="h-4 w-4" /></span>
            <span className="min-w-0 flex-1"><strong className="block text-xs text-slate-100">{row.title}</strong><span className="mt-0.5 block text-[10px] text-slate-400">{row.meta}</span></span>
            {"badge" in row && row.badge && <span className="text-[9px] font-bold text-teal-200">{row.badge}</span>}
          </div>
        );
      })}
    </div>
  );
}

function TrustStrip() {
  return (
    <section className="mx-auto mb-9 mt-5 max-w-[92rem] px-5 lg:px-7" aria-label="Blueprint review status">
      <div className="grid overflow-hidden rounded-xl border border-white/10 bg-[#0a1c2b]/82 sm:grid-cols-2 xl:grid-cols-[1.15fr_repeat(4,1fr)]">
        <div className="flex min-h-[118px] flex-col justify-center border-b border-white/10 px-6 py-5 sm:col-span-2 xl:col-span-1 xl:border-b-0 xl:border-r">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-200">Built on evidence.</p>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-sky-300">Held for review.</p>
        </div>
        {trustItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <Link key={item.label} href={item.href} className={`group flex min-h-[118px] items-center gap-3 px-5 py-4 transition hover:bg-white/[0.035] ${index > 0 ? "border-t border-white/10 sm:border-l sm:border-t-0" : ""} ${index === 2 ? "sm:border-l-0 xl:border-l" : ""}`}>
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${toneClasses[item.tone]}`}><Icon className="h-[18px] w-[18px]" /></span>
              <span className="min-w-0">
                <span className="block text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">{item.label}</span>
                <strong className={`mt-1 block text-base ${item.tone === "amber" ? "text-amber-200" : item.tone === "sky" ? "text-sky-200" : "text-teal-200"}`}>{item.value}</strong>
                <span className="mt-1 block text-[10px] text-slate-400">{item.note}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default function QualityLabLandingPage() {
  const [activeStage, setActiveStage] = useState<StageKey>("workload");
  const [desktopLayout, setDesktopLayout] = useState(() => typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches);
  const activeIndex = stages.findIndex((stage) => stage.key === activeStage);
  const nodes = useMemo(() => baseNodes.map((item) => ({ ...item, data: { ...item.data, active: item.data.stage === activeStage } })), [activeStage]);
  const edges = useMemo(() => baseEdges.map((item) => ({
    ...item,
    style: { ...item.style, opacity: item.data?.stage === activeStage ? 0.95 : 0.45, strokeWidth: item.data?.stage === activeStage ? 2 : 1.35 },
  })), [activeStage]);

  useSEO({
    title: "Atlas Quality Lab Compiler",
    description: "See how Atlas connects product demand, applicable microbiology methods, workload, resources and review-ready Blueprint outputs.",
    canonical: `${SITE_URL}/quality-lab`,
    ogImage: `${SITE_URL}/quality-lab-og.png`,
  });

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const syncLayout = () => setDesktopLayout(query.matches);
    syncLayout();
    query.addEventListener("change", syncLayout);
    return () => query.removeEventListener("change", syncLayout);
  }, []);

  return (
    <div
      className="quality-lab-landing-page min-h-screen overflow-hidden bg-[#061522] text-slate-100"
      style={{
        backgroundImage: "linear-gradient(rgba(6, 21, 34, 0.45), rgba(6, 21, 34, 0.45)), url('/images/blueprint/decision-observatory-grid.jpg')",
        backgroundPosition: "top, top",
        backgroundRepeat: "repeat, repeat-y",
        backgroundSize: "auto, 1440px auto",
      }}
    >
      <QualityLabNav />

      <main>
        <section className="px-5 pb-5 pt-10 text-center lg:pb-5 lg:pt-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="mx-auto max-w-4xl">
            <h1 className="font-display text-4xl font-bold leading-[1.03] tracking-[-0.035em] text-white sm:text-5xl lg:text-[50px]">See the blueprint <span className="text-teal-300">take shape.</span></h1>
            <p className="mx-auto mt-3 max-w-3xl text-sm leading-6 text-slate-400 lg:text-[16px]">Atlas compiles your lab blueprint from product portfolio to decisions you can defend.</p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-8">
              <Link href="/quality-lab/planner" onClick={() => analytics.blueprintCtaClicked("quality_lab_flow_hero", "planner")} className="inline-flex min-h-12 min-w-52 items-center justify-center gap-8 rounded-lg bg-teal-300 px-5 text-sm font-bold text-slate-950 shadow-[0_12px_35px_rgba(20,184,166,0.18)] transition hover:-translate-y-0.5 hover:bg-teal-200">Build a blueprint <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/quality-lab/sample" onClick={() => analytics.blueprintExampleExplored("quality_lab_flow_hero", "sample")} className="inline-flex min-h-12 items-center justify-center text-sm font-bold text-teal-200 underline decoration-teal-300/40 decoration-dotted underline-offset-8 transition hover:text-teal-100">Inspect a sample</Link>
            </div>
          </motion.div>
        </section>

        {desktopLayout && <section className="mx-auto max-w-[96rem] px-5 lg:px-7" aria-label="Atlas Blueprint compiler flow">
          <div role="tablist" aria-label="Blueprint compiler stages" className="grid grid-cols-[1fr_1.1fr_1fr_1fr_1.15fr] gap-6 px-1">
            {stages.map((stage) => <StageHeading key={stage.key} stage={stage} active={stage.key === activeStage} onSelect={() => setActiveStage(stage.key)} />)}
          </div>
          <motion.div id="blueprint-flow-canvas" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="relative mt-1 h-[380px]">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={{ padding: 0.012, minZoom: 0.6, maxZoom: 1 }}
              minZoom={0.6}
              maxZoom={1}
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={false}
              panOnDrag={false}
              panOnScroll={false}
              zoomOnScroll={false}
              zoomOnPinch={false}
              preventScrolling={false}
              proOptions={{ hideAttribution: true }}
              onNodeClick={(_, selectedNode) => setActiveStage(selectedNode.data.stage)}
              aria-label="Product portfolio connects to methods, workload, resources and Blueprint outputs"
            />
            <div className="pointer-events-none absolute bottom-1 right-2 flex items-center gap-3 text-left">
              <span className="rounded-md border border-amber-300/45 bg-amber-300/[0.06] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.08em] text-amber-200">Concept</span>
              <span><strong className="block text-[11px] text-slate-100">Non-sterile microbiology scope</strong><span className="mt-0.5 block text-[9px] text-slate-400">Illustrative · site evidence required</span></span>
            </div>
          </motion.div>
        </section>}

        {!desktopLayout && <section className="px-4 pb-3" aria-label="Atlas Blueprint compiler stages">
          <div role="tablist" aria-label="Blueprint compiler stages" className="flex gap-2 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {stages.map((stage) => {
              const Icon = stage.icon;
              const active = stage.key === activeStage;
              return (
                <button key={stage.key} type="button" role="tab" aria-selected={active} onClick={() => setActiveStage(stage.key)} className={`flex min-h-11 shrink-0 items-center gap-2 rounded-lg border px-3 text-[10px] font-bold uppercase tracking-[0.08em] ${active ? "border-teal-300/45 bg-teal-300/[0.1] text-teal-100" : "border-white/10 bg-white/[0.025] text-slate-400"}`}><Icon className="h-4 w-4" />{stage.number}. {stage.label}</button>
              );
            })}
          </div>
          <div role="tabpanel" className="rounded-2xl border border-white/10 bg-[#081826]/90 p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/10 pb-3"><div><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-teal-200">Stage {stages[activeIndex].number}</p><h2 className="mt-1 text-base font-bold text-white">{stages[activeIndex].label}</h2></div><span className="text-[10px] text-slate-400">{stages[activeIndex].detail}</span></div>
            <MobileStagePanel stage={activeStage} />
            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
              <button type="button" disabled={activeIndex === 0} onClick={() => setActiveStage(stages[Math.max(0, activeIndex - 1)].key)} className="min-h-10 rounded-lg border border-white/10 px-3 text-xs font-semibold text-slate-300 disabled:opacity-30">Previous</button>
              <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">{activeIndex + 1} / {stages.length}</span>
              <button type="button" disabled={activeIndex === stages.length - 1} onClick={() => setActiveStage(stages[Math.min(stages.length - 1, activeIndex + 1)].key)} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-teal-300/25 bg-teal-300/[0.08] px-3 text-xs font-bold text-teal-200 disabled:opacity-30">Next <ArrowRight className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        </section>}

        <TrustStrip />
      </main>
    </div>
  );
}
