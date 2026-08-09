import { useMemo, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import type { IconType } from "react-icons";
import {
  PiArrowDown,
  PiArrowLeft,
  PiArrowRight,
  PiBookOpenText,
  PiBooks,
  PiChartLine,
  PiCheckCircle,
  PiCirclesThreePlus,
  PiClipboardText,
  PiCube,
  PiDatabase,
  PiDna,
  PiFactory,
  PiFlask,
  PiFlowArrow,
  PiInfo,
  PiMicroscope,
  PiPackage,
  PiSealCheck,
  PiShieldCheck,
  PiStack,
  PiSyringe,
  PiTestTube,
  PiToolbox,
  PiWarningCircle,
  PiWrench,
} from "react-icons/pi";

import { EditorialImage } from "@/components/EditorialImage";
import { JsonLd } from "@/components/JsonLd";
import { getToolMeta } from "@/data/tools/catalog";
import { getToolkit } from "@/data/toolkits";
import { getWorkflow } from "@/data/workflows";
import {
  workflowSystems,
  type ConnectedApplicationKind,
  type ConnectedApplicationRef,
  type WorkflowSystem,
  type WorkflowSystemStage,
} from "@/data/workflowSystems";
import { useSEO } from "@/hooks/use-seo";
import { listContent } from "@/lib/content";

const SYSTEM_ICONS: Record<string, IconType> = {
  biopharma: PiDna,
  "sterile-product": PiShieldCheck,
  "qc-laboratory": PiMicroscope,
  "pharma-api": PiFlask,
  "quality-lifecycle": PiStack,
};

const STAGE_ICONS: IconType[] = [
  PiDatabase,
  PiFactory,
  PiStack,
  PiSyringe,
  PiMicroscope,
  PiSealCheck,
  PiPackage,
];

const KIND_META: Record<ConnectedApplicationKind, { label: string; icon: IconType }> = {
  workflow: { label: "Workflow", icon: PiFlowArrow },
  tool: { label: "Interactive tool", icon: PiWrench },
  lesson: { label: "Lesson", icon: PiBookOpenText },
  toolkit: { label: "Toolkit", icon: PiToolbox },
};

interface ResolvedApplication {
  key: string;
  kind: ConnectedApplicationKind;
  title: string;
  description: string;
  href: string;
  accessLabel: string;
}

function resolveApplication(
  reference: ConnectedApplicationRef,
  stage: WorkflowSystemStage,
  lessonBySlug: Map<string, ReturnType<typeof listContent>[number]>,
): ResolvedApplication | null {
  if (reference.kind === "workflow") {
    const workflow = getWorkflow(reference.slug);
    return workflow ? {
      key: `workflow:${workflow.slug}`,
      kind: "workflow",
      title: workflow.title,
      description: workflow.purpose,
      href: `/workflows/${workflow.slug}`,
      accessLabel: workflow.accessTier === "pro" ? "Pro" : "Free",
    } : null;
  }

  if (reference.kind === "tool") {
    const tool = getToolMeta(reference.slug);
    return tool ? {
      key: `tool:${tool.slug}`,
      kind: "tool",
      title: tool.title,
      description: tool.blurb,
      href: `/tools/${tool.slug}`,
      accessLabel: "Free",
    } : null;
  }

  if (reference.kind === "toolkit") {
    const toolkit = getToolkit(reference.slug);
    return toolkit ? {
      key: `toolkit:${toolkit.slug}`,
      kind: "toolkit",
      title: toolkit.title,
      description: toolkit.problemSolved,
      href: toolkit.href ?? "/toolkits",
      accessLabel: toolkit.accessTier === "pro" ? "Pro" : "Free",
    } : null;
  }

  const lesson = lessonBySlug.get(reference.slug);
  return lesson ? {
    key: `lesson:${lesson.slug}`,
    kind: "lesson",
    title: lesson.title,
    description: lesson.seoDescription ?? `Evidence-backed background for ${stage.title.toLowerCase()}.`,
    href: `/library/${lesson.slug}`,
    accessLabel: lesson.tier === "pro" ? "Pro" : "Free",
  } : null;
}

function StageNode({
  stage,
  index,
  active,
  onSelect,
}: {
  stage: WorkflowSystemStage;
  index: number;
  active: boolean;
  onSelect: () => void;
}) {
  const Icon = STAGE_ICONS[index] ?? PiCirclesThreePlus;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className="group flex min-w-0 flex-col items-center text-center outline-none"
    >
      <span className={`mb-2 flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold transition ${
        active ? "border-teal-300 bg-teal-300 text-slate-950" : "border-slate-500/70 bg-[#11233a] text-slate-300"
      }`}>
        {index + 1}
      </span>
      <span className={`relative flex h-[5.8rem] w-[5.8rem] items-center justify-center rounded-full border-2 transition duration-200 group-hover:border-teal-300/65 group-focus-visible:ring-4 group-focus-visible:ring-teal-300/20 ${
        active
          ? "border-teal-300 bg-teal-300/[0.09] text-teal-300 shadow-[0_0_0_8px_rgba(45,212,191,0.07)]"
          : "border-slate-600/70 bg-[#0a1a2e] text-slate-300"
      }`}>
        <Icon className="h-11 w-11" aria-hidden="true" />
      </span>
      <span className={`mt-3 max-w-[10rem] text-sm font-bold leading-5 ${active ? "text-teal-200" : "text-slate-100"}`}>
        {stage.title}
      </span>
      <span className="mt-1 line-clamp-2 max-w-[10rem] text-[11px] leading-4 text-slate-500">
        {stage.summary}
      </span>
      {index >= 4 && (
        <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-coral-300">
          <PiWarningCircle className="h-4 w-4 text-[#ff725f]" /> Critical control
        </span>
      )}
    </button>
  );
}

function FlowArrow({ direction = "right" }: { direction?: "right" | "left" | "down" }) {
  const Icon = direction === "left" ? PiArrowLeft : direction === "down" ? PiArrowDown : PiArrowRight;
  return (
    <div className="flex min-w-8 items-center justify-center text-teal-300/75" aria-hidden="true">
      <span className="h-px flex-1 bg-teal-300/45" />
      <Icon className="-ml-1 h-5 w-5 shrink-0" />
    </div>
  );
}

function DesktopBlueprint({
  system,
  activeStageId,
  onSelect,
}: {
  system: WorkflowSystem;
  activeStageId: string;
  onSelect: (stageId: string) => void;
}) {
  return (
    <div className="hidden min-w-0 xl:block">
      <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-start gap-x-2">
        {system.stages.slice(0, 4).map((stage, index) => (
          <div key={stage.id} className="contents">
            <StageNode stage={stage} index={index} active={stage.id === activeStageId} onSelect={() => onSelect(stage.id)} />
            {index < 3 && <FlowArrow />}
          </div>
        ))}
      </div>

      <div className="my-3 flex justify-end pr-[10%] text-teal-300/75" aria-hidden="true">
        <div className="flex w-[74%] items-center">
          <span className="h-px flex-1 bg-teal-300/45" />
          <PiArrowDown className="h-5 w-5" />
        </div>
      </div>

      <div className="grid w-[75%] grid-cols-[1fr_auto_1fr_auto_1fr] items-start gap-x-2">
        {[6, 5, 4].map((index, position) => {
          const stage = system.stages[index];
          return (
            <div key={stage.id} className="contents">
              <StageNode stage={stage} index={index} active={stage.id === activeStageId} onSelect={() => onSelect(stage.id)} />
              {position < 2 && <FlowArrow direction="left" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MobileBlueprint({
  system,
  activeStageId,
  onSelect,
}: {
  system: WorkflowSystem;
  activeStageId: string;
  onSelect: (stageId: string) => void;
}) {
  return (
    <div className="overflow-x-auto pb-4 xl:hidden">
      <div className="flex min-w-max items-center px-1">
        {system.stages.map((stage, index) => (
          <div key={stage.id} className="flex items-center">
            <div className="w-44">
              <StageNode stage={stage} index={index} active={stage.id === activeStageId} onSelect={() => onSelect(stage.id)} />
            </div>
            {index < system.stages.length - 1 && <div className="w-12"><FlowArrow /></div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function StageApplications({
  applications,
  expanded,
  onToggle,
}: {
  applications: ResolvedApplication[];
  expanded: boolean;
  onToggle: () => void;
}) {
  const visibleApplications = expanded ? applications : applications.slice(0, 4);

  return (
    <aside id="linked-stage-applications" className="border-t border-white/[0.08] pt-5 xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0" aria-label="Applications connected to selected stage">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Linked to this stage</p>
      <div className="mt-4 grid gap-1 sm:grid-cols-2 xl:grid-cols-1">
        {visibleApplications.map((application) => {
          const meta = KIND_META[application.kind];
          const Icon = meta.icon;
          return (
            <Link
              key={application.key}
              href={application.href}
              className="group flex min-w-0 items-center gap-3 border-b border-white/[0.08] px-1 py-3 outline-none transition hover:bg-white/[0.025] focus-visible:ring-2 focus-visible:ring-teal-300/40"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-600/70 text-slate-300 transition group-hover:border-teal-300/60 group-hover:text-teal-300">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-teal-300">{meta.label}</span>
                <span className="mt-1 block truncate text-sm font-semibold text-slate-100">{application.title}</span>
              </span>
              <PiArrowRight className="h-4 w-4 shrink-0 text-slate-500 transition group-hover:translate-x-1 group-hover:text-teal-300" />
            </Link>
          );
        })}
      </div>
      {applications.length > 4 && (
        <button type="button" onClick={onToggle} className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-teal-300 hover:text-teal-200">
          {expanded ? "Show key links" : `Show ${applications.length - 4} more linked resources`} <PiArrowDown className={`h-4 w-4 transition ${expanded ? "rotate-180" : ""}`} />
        </button>
      )}
    </aside>
  );
}

function Legend() {
  return (
    <div className="hidden w-64 rounded-xl border border-white/[0.09] bg-[#08172a]/75 p-4 lg:block">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-300">Legend</p>
      <div className="mt-3 space-y-2 text-xs text-slate-400">
        <div className="flex items-center gap-3"><span className="h-px w-10 bg-teal-300" /><span>Process flow</span></div>
        <div className="flex items-center gap-3"><span className="w-10 border-t border-dashed border-slate-400" /><span>Application link</span></div>
        <div className="flex items-center gap-3"><span className="w-10 border-t-2 border-dotted border-[#ff725f]" /><span>Critical control</span></div>
      </div>
    </div>
  );
}

export default function WorkflowsPage() {
  useSEO({
    title: "Biopharma Process Blueprint | Life Science Atlas",
    description: "Explore connected manufacturing and quality systems with stage-linked workflows, tools, lessons, and toolkits.",
  });

  const academy = useMemo(() => listContent({ collection: "academy", lang: "en" }), []);
  const lessonBySlug = useMemo(() => new Map(academy.map((lesson) => [lesson.slug, lesson])), [academy]);
  const [activeSystemId, setActiveSystemId] = useState(workflowSystems[0].id);
  const activeSystem = workflowSystems.find((system) => system.id === activeSystemId) ?? workflowSystems[0];
  const [activeStageId, setActiveStageId] = useState(activeSystem.stages[3].id);
  const [showAllApplications, setShowAllApplications] = useState(false);
  const activeStage = activeSystem.stages.find((stage) => stage.id === activeStageId) ?? activeSystem.stages[3];
  const activeStageIndex = activeSystem.stages.indexOf(activeStage);

  const stageApplications = useMemo(
    () => activeStage.applications
      .map((reference) => resolveApplication(reference, activeStage, lessonBySlug))
      .filter((application): application is ResolvedApplication => Boolean(application)),
    [activeStage, lessonBySlug],
  );

  const counts = stageApplications.reduce<Record<ConnectedApplicationKind, number>>(
    (result, application) => ({ ...result, [application.kind]: result[application.kind] + 1 }),
    { workflow: 0, tool: 0, lesson: 0, toolkit: 0 },
  );
  const primaryWorkflow = stageApplications.find((application) => application.kind === "workflow") ?? stageApplications[0];
  const SystemIcon = SYSTEM_ICONS[activeSystem.id] ?? PiFlowArrow;
  const displayTitle = activeSystem.id === "biopharma" ? "Biopharma Manufacturing System" : activeSystem.title;

  function selectSystem(systemId: string) {
    const nextSystem = workflowSystems.find((system) => system.id === systemId) ?? workflowSystems[0];
    setActiveSystemId(nextSystem.id);
    setActiveStageId(nextSystem.stages[3].id);
    setShowAllApplications(false);
  }

  function selectStage(stageId: string) {
    setActiveStageId(stageId);
    setShowAllApplications(false);
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#071426] pb-20">
      <JsonLd
        id="workflows-breadcrumb"
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "/" },
            { "@type": "ListItem", position: 2, name: "Process Blueprint", item: "/workflows" },
          ],
        }}
      />

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full overflow-hidden border-b border-white/[0.08] bg-[#08172a] [background-image:radial-gradient(rgba(94,234,212,0.10)_0.8px,transparent_0.8px)] [background-size:18px_18px] shadow-2xl shadow-black/20"
      >
        <header className="flex flex-col gap-4 border-b border-white/[0.08] px-5 py-5 lg:flex-row lg:items-start lg:justify-between lg:px-7">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300">
                <SystemIcon className="h-4 w-4" /> Process blueprint
              </p>
              <label className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                <span>System</span>
              <select
                value={activeSystem.id}
                onChange={(event) => selectSystem(event.target.value)}
                  className="h-8 rounded-lg border border-white/[0.12] bg-[#0a1a2e] px-2.5 pr-7 text-[11px] font-semibold normal-case tracking-normal text-slate-100 outline-none focus:border-teal-300/60 focus:ring-2 focus:ring-teal-300/20"
                aria-label="Select workflow system"
              >
                {workflowSystems.map((system) => <option key={system.id} value={system.id}>{system.shortTitle}</option>)}
              </select>
              </label>
            </div>
            <h1 className="mt-3 font-display text-2xl font-bold leading-tight text-slate-50 sm:text-3xl">{displayTitle}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Explore the connected end-to-end system. Select any stage to see the exact resources attached to that decision point.</p>
          </div>
          <Legend />
        </header>

        <div className="grid gap-6 px-4 py-6 lg:px-7 xl:grid-cols-[minmax(0,1fr)_17rem]">
          <DesktopBlueprint system={activeSystem} activeStageId={activeStage.id} onSelect={selectStage} />
          <MobileBlueprint system={activeSystem} activeStageId={activeStage.id} onSelect={selectStage} />
          <StageApplications applications={stageApplications} expanded={showAllApplications} onToggle={() => setShowAllApplications((value) => !value)} />
        </div>

        <section className="m-3 mt-0 overflow-hidden rounded-xl border border-white/[0.09] bg-[#0a1a2e]/95 lg:m-5 lg:mt-0" aria-live="polite">
          <div className="grid lg:grid-cols-[1.2fr_0.55fr_0.65fr_0.8fr_0.95fr_0.42fr]">
            <div className="p-5 lg:border-r lg:border-white/[0.08]">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300">Stage {activeStageIndex + 1}</p>
              <h2 className="mt-2 text-xl font-bold text-slate-50">{activeStage.title}</h2>
              <p className="mt-2 text-xs leading-5 text-slate-400">{activeStage.summary}</p>
              <button type="button" onClick={() => { setShowAllApplications(true); document.getElementById("linked-stage-applications")?.scrollIntoView({ behavior: "smooth", block: "center" }); }} className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-teal-300 hover:text-teal-200">
                View all stage resources <PiArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="border-t border-white/[0.08] p-5 lg:border-r lg:border-t-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-300">Applicability</p>
              <div className="mt-3 space-y-2 text-xs text-slate-300">
                {["Product-specific", "Site-specific", "Lifecycle use"].map((item) => (
                  <div key={item} className="flex items-center gap-2"><PiCheckCircle className="h-4 w-4 shrink-0 text-teal-300" />{item}</div>
                ))}
              </div>
            </div>

            <div id="stage-applications" className="border-t border-white/[0.08] p-5 lg:border-r lg:border-t-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-300">Evidence & content</p>
              <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs text-slate-400 lg:grid-cols-1">
                {(Object.keys(KIND_META) as ConnectedApplicationKind[]).map((kind) => (
                  <div key={kind} className="flex items-center gap-2"><strong className="text-base text-teal-300">{counts[kind]}</strong>{KIND_META[kind].label}{counts[kind] === 1 ? "" : "s"}</div>
                ))}
              </div>
            </div>

            <div className="border-t border-white/[0.08] p-5 lg:border-r lg:border-t-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-300">Source types</p>
              <div className="mt-3 space-y-2 text-xs text-slate-400">
                <div className="flex items-center gap-2"><PiShieldCheck className="h-4 w-4" /> Regulatory guidance</div>
                <div className="flex items-center gap-2"><PiBooks className="h-4 w-4" /> Industry standards</div>
                <div className="flex items-center gap-2"><PiClipboardText className="h-4 w-4" /> Expert-reviewed</div>
              </div>
            </div>

            <div className="border-t border-white/[0.08] p-5 lg:border-r lg:border-t-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-300">Primary action</p>
                {primaryWorkflow ? (
                  <Link href={primaryWorkflow.href} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-teal-300 px-4 text-center text-sm font-bold text-slate-950 transition hover:bg-teal-200">
                    Open stage workflow <PiArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <Link href="/academy" className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-teal-300/35 px-4 text-center text-sm font-bold text-teal-200">
                    Browse stage resources <PiArrowRight className="h-4 w-4" />
                  </Link>
                )}
                <p className="mt-3 text-[10px] leading-4 text-slate-400">{stageApplications.length} linked applications for this stage.</p>
            </div>

            <div className="relative min-h-36 overflow-hidden border-t border-white/[0.08] lg:border-t-0">
              <EditorialImage
                src="/images/editorial/test-tube-evidence-review.jpg"
                alt="Laboratory samples representing stage evidence"
                creditName="National Cancer Institute"
                creditUrl="https://unsplash.com/photos/L7en7Lb-Ovc"
                className="absolute inset-0"
                imageClassName="opacity-55 saturate-50"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-white/[0.08] px-5 py-3 text-[10px] leading-4 text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span className="inline-flex items-start gap-2"><PiInfo className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Evidence boundary: {activeSystem.boundary}</span>
            <span className="shrink-0 text-slate-600">Atlas navigation model · Human applicability review required</span>
          </div>
        </section>
      </motion.section>
    </div>
  );
}
