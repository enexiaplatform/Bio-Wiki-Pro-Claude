import { useEffect, useMemo, useRef, useState } from "react";
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
  PiFactory,
  PiFlowArrow,
  PiInfo,
  PiJar,
  PiMicroscope,
  PiPackage,
  PiSealCheck,
  PiShieldCheck,
  PiStack,
  PiTestTube,
  PiToolbox,
  PiWarningCircle,
  PiWrench,
} from "react-icons/pi";

import { EditorialImage } from "@/components/EditorialImage";
import { JsonLd } from "@/components/JsonLd";
import { ResourceSystemNavigator } from "@/components/ResourceSystemNavigator";
import { StageCoverageDashboard } from "@/components/StageCoverageDashboard";
import { getToolMeta } from "@/data/tools/catalog";
import { getToolkit } from "@/data/toolkits";
import { getWorkflow } from "@/data/workflows";
import { buildResourceContextHref, getResourceStage, getResourceSystem } from "@/data/resourceConnections";
import {
  type ConnectedApplicationKind,
  type ConnectedApplicationRef,
  type WorkflowSystem,
  type WorkflowSystemStage,
} from "@/data/workflowSystems";
import { useSEO } from "@/hooks/use-seo";
import { capture } from "@/hooks/use-analytics";
import { useResourceSelection } from "@/hooks/use-resource-selection";
import { listContent } from "@/lib/content";

const STAGE_ICONS: IconType[] = [
  PiDatabase,
  PiFactory,
  PiStack,
  PiTestTube,
  PiMicroscope,
  PiSealCheck,
  PiPackage,
];

const BIOPHARMA_STAGE_SUMMARIES = [
  "Cell banks, media, excipients",
  "Cell culture, bioreactor, monitoring",
  "Capture, polish, viral removal",
  "Formulation, fill/finish, container closure",
  "Release testing, stability, method qualification",
  "Process validation, continued process verification",
  "Batch release, lot tracking, transfer",
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
  desktop = false,
  summaryOverride,
}: {
  stage: WorkflowSystemStage;
  index: number;
  active: boolean;
  onSelect: () => void;
  desktop?: boolean;
  summaryOverride?: string;
}) {
  const Icon = STAGE_ICONS[index] ?? PiCirclesThreePlus;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className="group relative z-10 flex min-w-0 flex-col items-center text-center outline-none"
    >
      <span className={`mb-2 flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold transition ${
        active ? "border-teal-300 bg-[#11233a] text-teal-300" : "border-slate-500/70 bg-[#11233a] text-slate-300"
      }`}>
        {index + 1}
      </span>
      <span className={`relative flex items-center justify-center rounded-full border-2 transition duration-200 group-hover:border-teal-300/65 group-focus-visible:ring-4 group-focus-visible:ring-teal-300/20 ${desktop ? "h-28 w-28" : "h-[5.8rem] w-[5.8rem]"} ${
        active
          ? "border-teal-300 bg-teal-300/[0.09] text-teal-300 shadow-[0_0_0_8px_rgba(45,212,191,0.07)]"
          : "border-slate-600/70 bg-[#0a1a2e] text-slate-300"
      }`}>
        {desktop && index === 3 ? (
          <span className="flex items-end -space-x-2" aria-hidden="true">
            <PiJar className="h-11 w-11" />
            <PiJar className="h-14 w-14" />
            <PiJar className="h-11 w-11" />
          </span>
        ) : (
          <Icon className={desktop ? "h-14 w-14" : "h-11 w-11"} aria-hidden="true" />
        )}
        {active && desktop && <span className="absolute -right-3 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-slate-100 bg-[#08172a] shadow-[0_0_0_3px_rgba(45,212,191,0.35)]" aria-hidden="true" />}
      </span>
      <span className={`mt-3 max-w-[11rem] font-bold leading-5 ${desktop ? "text-[15px]" : "text-sm"} ${active ? "text-teal-200" : "text-slate-100"}`}>
        {stage.title}
      </span>
      <span className={`mt-1 line-clamp-2 max-w-[11rem] leading-4 text-slate-500 ${desktop ? "text-xs" : "text-[11px]"}`}>
        {summaryOverride ?? stage.summary}
      </span>
    </button>
  );
}

function FlowArrow({ direction = "right" }: { direction?: "right" | "left" }) {
  const Icon = direction === "left" ? PiArrowLeft : PiArrowRight;
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
    <div className="relative hidden min-h-[36rem] min-w-0 pt-6 xl:block" role="group" aria-label="Connected system stages">
      <div className="absolute left-[12.5%] right-[12.5%] top-[7.25rem] h-0.5 bg-teal-300/65" aria-hidden="true" />
      {[25, 50, 75].map((left) => (
        <PiArrowRight key={left} className="absolute top-[6.75rem] z-20 h-5 w-5 -translate-x-1/2 bg-[#08172a] text-teal-300" style={{ left: `${left}%` }} aria-hidden="true" />
      ))}
      <div className="absolute left-[62.5%] right-[4%] top-[7.25rem] h-[17.75rem] rounded-r-[4rem] border-b-2 border-r-2 border-t-2 border-teal-300/65" aria-hidden="true" />
      <div className="absolute left-[12.5%] right-[37.5%] top-[25rem] h-0.5 bg-teal-300/65" aria-hidden="true" />
      {[25, 50].map((left) => (
        <PiArrowLeft key={left} className="absolute top-[24.5rem] z-20 h-5 w-5 -translate-x-1/2 bg-[#08172a] text-teal-300" style={{ left: `${left}%` }} aria-hidden="true" />
      ))}
      {[3.5, 28.5, 53.5].map((left) => (
        <div key={left} className="absolute top-[25rem] z-20 flex h-[7.1rem] -translate-x-1/2 flex-col items-center" style={{ left: `${left}%` }} aria-hidden="true">
          <span className="flex-1 border-l-2 border-dotted border-[#ff725f]" />
          <PiWarningCircle className="h-9 w-9 bg-[#08172a] text-[#ff725f]" />
        </div>
      ))}

      <div className="relative z-10 grid grid-cols-4 items-start">
        {system.stages.slice(0, 4).map((stage, index) => (
          <StageNode key={stage.id} stage={stage} index={index} active={stage.id === activeStageId} onSelect={() => onSelect(stage.id)} desktop summaryOverride={system.id === "biopharma" ? BIOPHARMA_STAGE_SUMMARIES[index] : undefined} />
        ))}
      </div>

      <div className="relative z-10 mt-20 grid w-3/4 grid-cols-3 items-start">
        {[6, 5, 4].map((index) => {
          const stage = system.stages[index];
          return <StageNode key={stage.id} stage={stage} index={index} active={stage.id === activeStageId} onSelect={() => onSelect(stage.id)} desktop summaryOverride={system.id === "biopharma" ? BIOPHARMA_STAGE_SUMMARIES[index] : undefined} />;
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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollRef.current;
    const activeStage = container?.querySelector<HTMLElement>(`[data-stage-id="${activeStageId}"]`);
    if (!container || !activeStage) return;

    const centeredLeft = activeStage.offsetLeft - (container.clientWidth - activeStage.offsetWidth) / 2;
    container.scrollTo({ left: Math.max(0, centeredLeft), behavior: "auto" });
  }, [activeStageId]);

  return (
    <div ref={scrollRef} className="overflow-x-auto pb-4 xl:hidden" role="group" aria-label="Connected system stages">
      <div className="flex min-w-max items-center px-1">
        {system.stages.map((stage, index) => (
          <div key={stage.id} className="flex items-center" data-stage-id={stage.id}>
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
  onOpen,
}: {
  applications: ResolvedApplication[];
  expanded: boolean;
  onToggle: () => void;
  onOpen: (application: ResolvedApplication) => void;
}) {
  const visibleApplications = expanded ? applications : applications.slice(0, 4);

  return (
    <aside id="linked-stage-applications" className="relative border-t border-white/[0.08] pt-5 xl:border-t-0 xl:pl-7 xl:pt-8" aria-label="Applications connected to selected stage">
      <span className="absolute left-0 top-16 hidden h-[22rem] border-l border-slate-400/75 xl:block" aria-hidden="true" />
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 xl:sr-only">Linked to this stage</p>
      <div className="mt-4 grid gap-1 sm:grid-cols-2 xl:mt-0 xl:grid-cols-1 xl:gap-3">
        {visibleApplications.map((application) => {
          const meta = KIND_META[application.kind];
          const Icon = meta.icon;
          return (
            <Link
              key={application.key}
              href={application.href}
              onClick={() => onOpen(application)}
              className="group relative flex min-w-0 items-center gap-3 border-b border-white/[0.08] px-1 py-3 outline-none transition before:absolute before:-left-7 before:top-1/2 before:hidden before:w-7 before:border-t before:border-dashed before:border-slate-400/75 hover:bg-white/[0.025] focus-visible:ring-2 focus-visible:ring-teal-300/40 xl:border-b-0 xl:before:block"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-600/70 bg-[#08172a] text-slate-300 transition group-hover:border-teal-300/60 group-hover:text-teal-300 xl:h-12 xl:w-12">
                <Icon className="h-5 w-5 xl:h-6 xl:w-6" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-teal-300">{meta.label}</span>
                <span className="mt-1 block line-clamp-2 text-sm font-semibold leading-5 text-slate-100">{application.title}</span>
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
    <div className="hidden w-72 rounded-xl border border-white/[0.09] bg-[#08172a]/75 p-5 lg:block">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-300">Legend</p>
      <div className="mt-3 space-y-2 text-xs text-slate-400">
        <div className="flex items-center gap-3"><span className="h-px w-10 bg-teal-300" /><span>Process flow</span></div>
        <div className="flex items-center gap-3"><span className="w-10 border-t border-dashed border-slate-400" /><span>Information flow</span></div>
        <div className="flex items-center gap-3"><span className="w-10 border-t-2 border-dotted border-[#ff725f]" /><span>Critical control</span></div>
      </div>
    </div>
  );
}

export default function WorkflowsPage() {
  useSEO({
    title: "Connected Quality Systems | Life Science Atlas",
    description: "Explore five connected manufacturing and quality systems with stage-linked workflows, tools, lessons, and toolkits.",
  });

  const academy = useMemo(() => listContent({ collection: "academy", lang: "en" }), []);
  const lessonBySlug = useMemo(() => new Map(academy.map((lesson) => [lesson.slug, lesson])), [academy]);
  const { selection, setSelection, clearSelection } = useResourceSelection();
  const activeSystem = getResourceSystem(selection.systemId);
  const [showAllApplications, setShowAllApplications] = useState(false);
  const activeStage = getResourceStage(selection) ?? activeSystem?.stages[0];
  const stageApplications = useMemo(
    () => activeStage ? activeStage.applications
      .map((reference) => resolveApplication(reference, activeStage, lessonBySlug))
      .filter((application): application is ResolvedApplication => Boolean(application))
      .map((application) => ({ ...application, href: buildResourceContextHref(application.href, selection, "stage-application") })) : [],
    [activeStage, lessonBySlug, selection],
  );
  if (!activeSystem || !activeStage) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#071426] px-4 pb-20 pt-5 lg:px-7">
        <header className="mx-auto mb-6 max-w-7xl rounded-3xl border border-white/[0.09] bg-[#08172a] p-6 [background-image:radial-gradient(rgba(94,234,212,0.10)_0.8px,transparent_0.8px)] [background-size:18px_18px] md:p-8">
          <p className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-teal-300"><PiFlowArrow className="h-4 w-4" /> Connected Resource Blueprint</p>
          <h1 className="mt-4 max-w-4xl font-display text-3xl font-bold leading-tight text-slate-50 md:text-5xl">Start from the full quality system.</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">See how five manufacturing and quality systems organize the same evidence, workflows, tools, lessons, and working files. Choose a system—or answer three quick questions—to enter at the right decision stage.</p>
        </header>
        <div className="mx-auto max-w-7xl"><ResourceSystemNavigator area="workflows" showGuide /></div>
      </div>
    );
  }
  const activeStageIndex = activeSystem.stages.indexOf(activeStage);
  const activeSystemId = activeSystem.id;

  const counts = stageApplications.reduce<Record<ConnectedApplicationKind, number>>(
    (result, application) => ({ ...result, [application.kind]: result[application.kind] + 1 }),
    { workflow: 0, tool: 0, lesson: 0, toolkit: 0 },
  );
  const primaryWorkflow = stageApplications.find((application) => application.kind === "workflow") ?? stageApplications[0];
  const primaryActionLabel = activeStage.id === "formulation-fill" ? "Open fill-finish workflow" : "Open stage workflow";
  const displayTitle = activeSystem.id === "biopharma" ? "Biopharma Manufacturing System" : activeSystem.title;

  function selectStage(stageId: string) {
    setSelection({ systemId: activeSystemId, stageId });
    setShowAllApplications(false);
    capture("resource_stage_selected", { system_id: activeSystemId, stage_id: stageId, area: "workflows" });
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
        <header className="flex flex-col gap-4 px-5 pb-3 pt-7 lg:flex-row lg:items-start lg:justify-between lg:px-12">
          <div>
            <button type="button" onClick={() => { clearSelection(); capture("resource_system_overview_opened", { area: "workflows" }); }} className="text-[11px] font-bold uppercase tracking-[0.16em] text-teal-300 transition hover:text-teal-200">
              Process blueprint
            </button>
            <h1 className="mt-3 font-display text-2xl font-bold leading-tight text-slate-50 sm:text-3xl">{displayTitle}</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400" title={`Evidence boundary: ${activeSystem.boundary}`}>Explore the connected end-to-end process.<br />Select any stage to see linked resources. <PiInfo className="ml-1 inline h-4 w-4" aria-label="Human applicability review required" /></p>
          </div>
          <Legend />
        </header>

        <div className="grid gap-3 px-4 pb-3 pt-2 lg:px-10 xl:grid-cols-[minmax(0,1fr)_18rem]">
          <DesktopBlueprint system={activeSystem} activeStageId={activeStage.id} onSelect={selectStage} />
          <MobileBlueprint system={activeSystem} activeStageId={activeStage.id} onSelect={selectStage} />
          <StageApplications applications={stageApplications} expanded={showAllApplications} onToggle={() => setShowAllApplications((value) => !value)} onOpen={(application) => capture("resource_connection_opened", { source_href: "/workflows", system_id: activeSystem.id, stage_id: activeStage.id, destination_kind: application.kind, destination_href: application.href })} />
        </div>

        <section className="mx-3 mb-5 mt-0 overflow-hidden rounded-xl border border-white/[0.09] bg-[#0a1a2e]/95 lg:mx-5" aria-live="polite">
          <div className="grid lg:grid-cols-[1.25fr_0.55fr_0.58fr_0.72fr_0.95fr_0.52fr]">
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
                {["Drug substance", "Drug product", "Biologics"].map((item) => (
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
                  <Link href={primaryWorkflow.href} onClick={() => capture("resource_connection_opened", { source_href: "/workflows", system_id: activeSystem.id, stage_id: activeStage.id, destination_kind: primaryWorkflow.kind, destination_href: primaryWorkflow.href })} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-teal-300 px-4 text-center text-sm font-bold text-slate-950 transition hover:bg-teal-200">
                    {primaryActionLabel} <PiArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <Link href="/academy" className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-teal-300/35 px-4 text-center text-sm font-bold text-teal-200">
                    Browse stage resources <PiArrowRight className="h-4 w-4" />
                  </Link>
                )}
                <Link href={buildResourceContextHref("/academy", selection, "browse-stage-resources")} className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-teal-300 hover:text-teal-200">
                  Browse all stage resources <PiArrowRight className="h-4 w-4" />
                </Link>
            </div>

            <div className="relative min-h-36 overflow-hidden border-t border-white/[0.08] lg:border-t-0">
              <EditorialImage
                src="/images/editorial/sterile-vial-fill-finish.png"
                alt="Sterile injectable vials on a pharmaceutical fill-finish line"
                creditName="Life Science Atlas"
                creditUrl="/"
                className="absolute inset-0"
                imageClassName="opacity-75 saturate-75"
              />
            </div>
          </div>

          <StageCoverageDashboard selection={{ systemId: activeSystem.id, stageId: activeStage.id }} />

        </section>
      </motion.section>
    </div>
  );
}
