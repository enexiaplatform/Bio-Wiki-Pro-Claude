import type { ReactNode } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Crown,
  Lightbulb,
  ListChecks,
  Package,
  ShieldAlert,
  Target,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ContentDisclaimer } from "@/components/ContentDisclaimer";
import { JsonLd } from "@/components/JsonLd";
import { analytics } from "@/hooks/use-analytics";
import { useReadLessons } from "@/hooks/use-read-lessons";
import { useSEO } from "@/hooks/use-seo";
import { getToolMeta } from "@/data/tools/catalog";
import { getToolkit } from "@/data/toolkits";
import { getWorkflow, getWorkflowCategory } from "@/data/workflows";
import { listContent } from "@/lib/content";
import { AtlasBlueprintContext } from "@/components/quality-lab/AtlasBlueprintContext";
import { EditorialImage } from "@/components/EditorialImage";
import { getContentVisual } from "@/data/contentVisuals";

const panelClass = "rounded-lg border border-white/10 bg-white/[0.045] p-5 shadow-lg shadow-black/10";

function Section({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) {
  return (
    <section className="mb-8">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-teal-400/20 bg-teal-400/10">
          <Icon className="h-4 w-4 text-teal-300" />
        </div>
        <h2 className="text-lg font-bold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default function WorkflowDetailPage() {
  const [, params] = useRoute("/workflows/:slug");
  const [, navigate] = useLocation();
  const { read } = useReadLessons();
  const slug = params?.slug ?? "";
  const workflow = getWorkflow(slug);

  useSEO({
    title: workflow ? workflow.title : "Workflow",
    description: workflow?.purpose,
  });

  if (!workflow) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="mb-3 text-2xl font-bold">Workflow not found</h1>
        <p className="mb-6 text-sm text-muted-foreground">This workflow does not exist yet. Browse the full atlas instead.</p>
        <Link href="/workflows" className="font-semibold text-teal-300 hover:underline">
          Back to the Workflow Atlas
        </Link>
      </div>
    );
  }

  const category = getWorkflowCategory(workflow.categorySlug);
  const workflowVisual = getContentVisual(category?.title ?? "Laboratory Controls");
  const academy = listContent({ collection: "academy", lang: "en" });
  const lessonBySlug = new Map(academy.map((lesson) => [lesson.slug, lesson]));
  const relatedLessons = workflow.relatedLessonSlugs
    .map((lessonSlug) => lessonBySlug.get(lessonSlug))
    .filter((lesson): lesson is NonNullable<typeof lesson> => Boolean(lesson));
  const relatedToolkits = workflow.relatedToolkitSlugs.map(getToolkit).filter((toolkit): toolkit is NonNullable<typeof toolkit> => Boolean(toolkit));
  const relatedTools = (workflow.relatedToolSlugs ?? []).map(getToolMeta).filter((tool): tool is NonNullable<typeof tool> => Boolean(tool));

  const readSet = new Set(read);
  const lessonsRead = relatedLessons.filter((lesson) => readSet.has(lesson.slug)).length;
  const nextLesson = relatedLessons.find((lesson) => !readSet.has(lesson.slug));
  const availableToolkit = relatedToolkits.find((toolkit) => toolkit.status === "available");
  const proCtaPlacement = `workflow_${workflow.slug}`;

  function handleUnlock() {
    analytics.upgradePromptClicked(proCtaPlacement);
    navigate("/pricing");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-4 md:pt-8">
      <JsonLd
        id={`workflow-${workflow.slug}`}
        data={{
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: workflow.title,
          description: workflow.purpose,
          step: workflow.steps.map((step, index) => ({
            "@type": "HowToStep",
            position: index + 1,
            name: step.title,
            text: step.detail,
          })),
        }}
      />

      <Link href="/workflows" className="mb-5 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" />
        Workflow Atlas
      </Link>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mb-8 overflow-hidden rounded-lg border border-teal-400/20 bg-gradient-to-br from-teal-500/12 via-white/[0.045] to-emerald-500/10 p-6 shadow-xl shadow-black/15 md:p-8"
      >
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-stretch">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-400/25 bg-teal-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-teal-200">
              <Target className="h-3.5 w-3.5" />
              {category?.title ?? "Workflow"}
            </span>
            <h1 className="mt-5 max-w-3xl font-display text-3xl font-bold leading-tight md:text-5xl">{workflow.title}</h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">{workflow.purpose}</p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                  workflow.accessTier === "pro" ? "bg-amber-400/10 text-amber-200" : "bg-emerald-400/10 text-emerald-200"
                }`}
              >
                {workflow.accessTier === "pro" ? "Pro workflow" : "Free workflow"}
              </span>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-muted-foreground">{workflow.audience}</span>
            </div>
          </div>

          <div className="relative min-h-56 overflow-hidden rounded-xl border border-white/10">
            <EditorialImage src={workflowVisual.src} alt={workflowVisual.alt} creditName={workflowVisual.creditName} creditUrl={workflowVisual.creditUrl} eager className="absolute inset-0" imageClassName={`${workflowVisual.focalPoint} opacity-65 saturate-75`} />
            <div className="absolute inset-x-3 bottom-3 grid grid-cols-3 gap-2 rounded-lg border border-white/10 bg-slate-950/80 p-3 backdrop-blur">
            <div className="rounded-lg border border-white/10 bg-background/35 p-4">
              <p className="text-2xl font-bold text-teal-200">{workflow.steps.length}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">Steps</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-background/35 p-4">
              <p className="text-2xl font-bold text-teal-200">{relatedLessons.length}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">Lessons</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-background/35 p-4">
              <p className="text-2xl font-bold text-teal-200">{relatedTools.length + relatedToolkits.length}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">Resources</p>
            </div>
            </div>
          </div>
        </div>

        {(availableToolkit || relatedToolkits.length > 0) && (
          <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">Use the workflow now, then deepen with lessons and templates below.</p>
            {availableToolkit ? (
              <Link
                href={availableToolkit.href ?? "/toolkits"}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-400 px-5 py-2.5 text-sm font-bold text-teal-950 transition-colors hover:bg-teal-300"
              >
                <Package className="h-4 w-4" />
                Use {availableToolkit.title}
              </Link>
            ) : (
              <button
                onClick={handleUnlock}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-400 px-5 py-2.5 text-sm font-bold text-teal-950 transition-colors hover:bg-teal-300"
              >
                <Crown className="h-4 w-4" />
                Unlock checklist with Pro
              </button>
            )}
          </div>
        )}
      </motion.section>

      <AtlasBlueprintContext href={`/workflows/${workflow.slug}`} />

      <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <Section icon={Target} title="Use this when">
            <div className={panelClass}>
              <ul className="space-y-3">
                {workflow.useWhen.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Section>

          <Section icon={ListChecks} title="Inputs and prerequisites">
            <div className={panelClass}>
              <ul className="space-y-3">
                {workflow.inputs.map((input) => (
                  <li key={input} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-300" />
                    <span>{input}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Section>

          <Section icon={ShieldAlert} title="Critical control points">
            <div className="grid gap-3">
              {workflow.criticalControlPoints.map((item) => (
                <div key={item} className="flex items-start gap-2.5 rounded-lg border border-teal-400/20 bg-teal-400/10 p-3.5 text-sm">
                  <Target className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <div>
          <Section icon={ArrowRight} title="Step-by-step workflow">
            <ol className="space-y-3">
              {workflow.steps.map((step, index) => (
                <li key={step.title} className="flex gap-4 rounded-lg border border-white/10 bg-white/[0.045] p-5 shadow-lg shadow-black/10">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-teal-400/25 bg-teal-400/10 text-sm font-bold text-teal-200">
                    {index + 1}
                  </span>
                  <div>
                    <p className="mb-1 text-sm font-bold">{step.title}</p>
                    <p className="text-sm leading-relaxed text-muted-foreground">{step.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Section>
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <Section icon={AlertTriangle} title="Common mistakes">
          <div className="space-y-3">
            {workflow.commonMistakes.map((item) => (
              <div key={item} className="flex items-start gap-2.5 rounded-lg border border-amber-400/20 bg-amber-400/10 p-3.5 text-sm">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section icon={Wrench} title="Troubleshooting">
          <div className="space-y-3">
            {workflow.troubleshooting.map((item) => (
              <div key={item.problem} className={panelClass}>
                <p className="mb-2 flex items-center gap-2 text-sm font-bold">
                  <AlertTriangle className="h-4 w-4 text-amber-300" />
                  {item.problem}
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  <span className="font-semibold text-teal-300">Do this: </span>
                  {item.action}
                </p>
              </div>
            ))}
          </div>
        </Section>
      </section>

      {workflow.deepDive && (
        <Accordion type="single" collapsible className="mb-8 rounded-lg border border-white/10 bg-white/[0.035] px-5 shadow-lg shadow-black/10">
          <AccordionItem value="deep-dive" className="border-b-0">
            <AccordionTrigger className="hover:no-underline">
              <span className="flex items-center gap-2.5 text-sm font-bold">
                <Lightbulb className="h-4 w-4 text-teal-300" />
                Deep dive: why this matters
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed text-muted-foreground">{workflow.deepDive}</AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {relatedLessons.length > 0 && (
        <Section icon={BookOpen} title="Learn the background">
          <div className={panelClass}>
            <div className="mb-4 flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-teal-400 transition-all" style={{ width: `${(lessonsRead / relatedLessons.length) * 100}%` }} />
              </div>
              <span className="whitespace-nowrap text-xs text-muted-foreground">{lessonsRead} of {relatedLessons.length} read</span>
            </div>

            {nextLesson ? (
              <Link
                href={`/library/${nextLesson.slug}`}
                className="group mb-4 flex items-center gap-3 rounded-lg border border-teal-400/25 bg-teal-400/10 p-4 transition-colors hover:border-teal-400/45"
              >
                <ArrowRight className="h-4 w-4 shrink-0 text-teal-300" />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-teal-300">
                    {lessonsRead === 0 ? "Start here" : `Next: ${lessonsRead} of ${relatedLessons.length}`}
                  </p>
                  <p className="truncate text-sm font-bold transition-colors group-hover:text-teal-200">{nextLesson.title}</p>
                </div>
              </Link>
            ) : (
              <div className="mb-4 flex items-center gap-3 rounded-lg border border-teal-400/25 bg-teal-400/10 p-4">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-300" />
                <p className="text-sm font-semibold">All background lessons read. You are ready to run this workflow.</p>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              {relatedLessons.map((lesson) => {
                const done = readSet.has(lesson.slug);
                return (
                  <Link
                    key={lesson.slug}
                    href={`/library/${lesson.slug}`}
                    className="group flex items-center gap-3 rounded-lg border border-white/10 bg-background/35 p-4 transition-colors hover:border-teal-400/35"
                  >
                    {done ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-300" />
                    ) : lesson.tier === "free" ? (
                      <BookOpen className="h-4 w-4 shrink-0 text-emerald-300" />
                    ) : (
                      <Crown className="h-4 w-4 shrink-0 text-amber-300" />
                    )}
                    <span className={`flex-1 text-sm font-semibold transition-colors ${done ? "text-muted-foreground" : "group-hover:text-teal-300"}`}>
                      {lesson.title}
                    </span>
                    {done ? <span className="text-[10px] font-bold uppercase tracking-wide text-teal-300">Read</span> : <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
                  </Link>
                );
              })}
            </div>
          </div>
        </Section>
      )}

      {relatedTools.length > 0 && (
        <Section icon={Wrench} title="Try the free tools">
          <div className="grid gap-3 sm:grid-cols-2">
            {relatedTools.map((tool) => (
              <Link key={tool.slug} href={`/tools/${tool.slug}`} className="block h-full">
                <div className="flex h-full flex-col rounded-lg border border-white/10 bg-white/[0.045] p-4 shadow-lg shadow-black/10 transition-colors hover:border-teal-400/35">
                  <div className="mb-2 flex items-center justify-between">
                    <Wrench className="h-4 w-4 text-teal-300" />
                    <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-200">Free</span>
                  </div>
                  <p className="mb-1 text-sm font-bold">{tool.title}</p>
                  <p className="flex-1 text-xs leading-relaxed text-muted-foreground">{tool.blurb}</p>
                  <span className="mt-3 text-xs font-semibold text-teal-300">Open tool</span>
                </div>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {relatedToolkits.length > 0 && (
        <Section icon={Package} title="Checklists and toolkits">
          <div className="grid gap-3 sm:grid-cols-2">
            {relatedToolkits.map((toolkit) => {
              const inner = (
                <div className="flex h-full flex-col rounded-lg border border-white/10 bg-white/[0.045] p-4 shadow-lg shadow-black/10 transition-colors hover:border-teal-400/35">
                  <div className="mb-2 flex items-center justify-between">
                    <Package className="h-4 w-4 text-teal-300" />
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                        toolkit.accessTier === "pro" ? "bg-amber-400/10 text-amber-200" : "bg-emerald-400/10 text-emerald-200"
                      }`}
                    >
                      {toolkit.accessTier === "pro" ? "Pro" : "Free"}
                    </span>
                  </div>
                  <p className="mb-1 text-sm font-bold">{toolkit.title}</p>
                  <p className="flex-1 text-xs leading-relaxed text-muted-foreground">{toolkit.problemSolved}</p>
                  <span className="mt-3 text-xs font-semibold text-teal-300">{toolkit.status === "available" ? "Open toolkit" : "Coming soon"}</span>
                </div>
              );
              return toolkit.status === "available" && toolkit.href ? (
                <Link key={toolkit.slug} href={toolkit.href} className="block h-full">{inner}</Link>
              ) : (
                <div key={toolkit.slug} className="opacity-80">{inner}</div>
              );
            })}
          </div>
        </Section>
      )}

      <ContentDisclaimer />
    </div>
  );
}
