import type { ReactNode } from "react";
import { Link, useRoute, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Target, ListChecks, AlertTriangle,
  Wrench, BookOpen, Package, Crown, ShieldAlert, Lightbulb, CheckCircle2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useSEO } from "@/hooks/use-seo";
import { JsonLd } from "@/components/JsonLd";
import { ContentDisclaimer } from "@/components/ContentDisclaimer";
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from "@/components/ui/accordion";
import { analytics } from "@/hooks/use-analytics";
import { useReadLessons } from "@/hooks/use-read-lessons";
import { getWorkflow, getWorkflowCategory } from "@/data/workflows";
import { getToolkit } from "@/data/toolkits";
import { getToolMeta } from "@/data/tools/catalog";
import { listContent } from "@/lib/content";

function Section({
  icon: Icon, title, children,
}: { icon: LucideIcon; title: string; children: ReactNode }) {
  return (
    <section className="mb-10">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-teal-400" />
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
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold mb-3">Workflow not found</h1>
        <p className="text-muted-foreground text-sm mb-6">
          This workflow doesn&rsquo;t exist yet. Browse the full atlas instead.
        </p>
        <Link href="/workflows" className="text-teal-400 font-semibold hover:underline">
          ← Back to the Workflow Atlas
        </Link>
      </div>
    );
  }

  const category = getWorkflowCategory(workflow.categorySlug);
  const academy = listContent({ collection: "academy", lang: "en" });
  const lessonBySlug = new Map(academy.map((l) => [l.slug, l]));
  const relatedLessons = workflow.relatedLessonSlugs
    .map((s) => lessonBySlug.get(s))
    .filter((l): l is NonNullable<typeof l> => Boolean(l));
  const relatedToolkits = workflow.relatedToolkitSlugs
    .map(getToolkit)
    .filter((t): t is NonNullable<typeof t> => Boolean(t));
  const relatedTools = (workflow.relatedToolSlugs ?? [])
    .map(getToolMeta)
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  // Tie the workflow back to learning progress (localStorage + server sync).
  const readSet = new Set(read);
  const lessonsRead = relatedLessons.filter((l) => readSet.has(l.slug)).length;
  // The next lesson to read drives a "continue learning" nudge.
  const nextLesson = relatedLessons.find((l) => !readSet.has(l.slug));

  // The primary action: open an available toolkit, or drive Pro for a locked one.
  const availableToolkit = relatedToolkits.find((t) => t.status === "available");
  const proCtaPlacement = `workflow_${workflow.slug}`;

  function handleUnlock() {
    analytics.upgradePromptClicked(proCtaPlacement);
    navigate("/pricing");
  }

  return (
    <div className="pb-24 pt-6 md:pt-10 max-w-3xl mx-auto px-4">
      <JsonLd
        id={`workflow-${workflow.slug}`}
        data={{
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: workflow.title,
          description: workflow.purpose,
          step: workflow.steps.map((s, i) => ({
            "@type": "HowToStep",
            position: i + 1,
            name: s.title,
            text: s.detail,
          })),
        }}
      />

      {/* ── BREADCRUMB ── */}
      <Link href="/workflows" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-5">
        <ArrowLeft className="w-3.5 h-3.5" /> Workflow Atlas
      </Link>

      {/* ── HEADER ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        {category && (
          <span className="text-[11px] uppercase font-bold tracking-widest text-teal-400">{category.title}</span>
        )}
        <h1 className="text-2xl md:text-4xl font-bold mt-1.5 mb-3 font-display leading-tight">{workflow.title}</h1>
        <p className="text-muted-foreground text-base leading-relaxed mb-5">{workflow.purpose}</p>

        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded ${
            workflow.accessTier === "pro" ? "text-amber-400 bg-amber-400/10" : "text-emerald-400 bg-emerald-400/10"
          }`}>
            {workflow.accessTier === "pro" ? "Pro workflow" : "Free workflow"}
          </span>
          <span className="text-xs text-muted-foreground">{workflow.audience}</span>
        </div>

        {/* Primary action */}
        {availableToolkit ? (
          <Link
            href={availableToolkit.href ?? "/toolkits"}
            className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-teal-950 font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-teal-500/20"
          >
            <Package className="w-4 h-4" /> Use the {availableToolkit.title}
          </Link>
        ) : relatedToolkits.length > 0 ? (
          <button
            onClick={handleUnlock}
            className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-teal-950 font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-teal-500/20"
          >
            <Crown className="w-4 h-4" /> Unlock the checklist with Pro
          </button>
        ) : null}
      </motion.div>

      <div className="my-8 h-px bg-white/5" />

      {/* ── USE THIS WHEN ── */}
      <Section icon={Target} title="Use this when">
        <ul className="space-y-2.5">
          {workflow.useWhen.map((u) => (
            <li key={u} className="flex items-start gap-2.5 text-sm">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <span>{u}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* ── INPUTS ── */}
      <Section icon={ListChecks} title="Inputs & prerequisites">
        <div className="bg-card border border-white/5 rounded-2xl p-5">
          <ul className="space-y-2.5">
            {workflow.inputs.map((inp) => (
              <li key={inp} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                <span>{inp}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* ── STEPS ── */}
      <Section icon={ArrowRight} title="Step-by-step workflow">
        <ol className="space-y-3">
          {workflow.steps.map((s, i) => (
            <li key={s.title} className="bg-card border border-white/5 rounded-2xl p-5 flex gap-4">
              <span className="shrink-0 w-7 h-7 rounded-full bg-teal-500/15 text-teal-400 text-sm font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <div>
                <p className="font-semibold text-sm mb-1">{s.title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {/* ── CRITICAL CONTROL POINTS ── */}
      <Section icon={ShieldAlert} title="Critical control points">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {workflow.criticalControlPoints.map((c) => (
            <div key={c} className="flex items-start gap-2.5 bg-teal-500/[0.06] border border-teal-500/15 rounded-xl p-3.5 text-sm">
              <Target className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <span>{c}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* ── COMMON MISTAKES ── */}
      <Section icon={AlertTriangle} title="Common mistakes">
        <div className="space-y-2.5">
          {workflow.commonMistakes.map((m) => (
            <div key={m} className="flex items-start gap-2.5 bg-amber-500/[0.06] border border-amber-500/15 rounded-xl p-3.5 text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{m}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* ── TROUBLESHOOTING ── */}
      <Section icon={Wrench} title="Troubleshooting">
        <div className="space-y-3">
          {workflow.troubleshooting.map((t) => (
            <div key={t.problem} className="bg-card border border-white/5 rounded-2xl p-5">
              <p className="text-sm font-semibold mb-1.5 flex items-center gap-2">
                <span className="text-amber-400">⚠</span> {t.problem}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed pl-6">
                <span className="font-semibold text-teal-400">Do this: </span>{t.action}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── DEEP DIVE (collapsed) ── */}
      {workflow.deepDive && (
        <Accordion type="single" collapsible className="mb-10 bg-card border border-white/5 rounded-2xl px-5">
          <AccordionItem value="deep-dive" className="border-b-0">
            <AccordionTrigger className="hover:no-underline">
              <span className="flex items-center gap-2.5 text-sm font-semibold">
                <Lightbulb className="w-4 h-4 text-teal-400" /> Deep dive — why this matters
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
              {workflow.deepDive}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {/* ── RELATED LESSONS (with reading progress) ── */}
      {relatedLessons.length > 0 && (
        <Section icon={BookOpen} title="Learn the background">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-1.5 flex-1 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-teal-400 transition-all"
                style={{ width: `${(lessonsRead / relatedLessons.length) * 100}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {lessonsRead} of {relatedLessons.length} read
            </span>
          </div>

          {/* Continue-learning nudge: point at the next unread lesson. */}
          {nextLesson ? (
            <Link
              href={`/library/${nextLesson.slug}`}
              className="group mb-4 flex items-center gap-3 rounded-xl border border-teal-500/20 bg-teal-500/[0.06] p-4 transition-colors hover:border-teal-500/40"
            >
              <ArrowRight className="w-4 h-4 text-teal-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-teal-400">
                  {lessonsRead === 0 ? "Start here" : `Next — you're ${lessonsRead} of ${relatedLessons.length}`}
                </p>
                <p className="text-sm font-semibold truncate group-hover:text-teal-400 transition-colors">
                  {nextLesson.title}
                </p>
              </div>
            </Link>
          ) : (
            <div className="mb-4 flex items-center gap-3 rounded-xl border border-teal-500/20 bg-teal-500/[0.06] p-4">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
              <p className="text-sm font-semibold">
                All background lessons read — you&rsquo;re ready to run this workflow.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {relatedLessons.map((l) => {
              const done = readSet.has(l.slug);
              return (
                <Link
                  key={l.slug}
                  href={`/library/${l.slug}`}
                  className="group bg-card border border-white/5 rounded-xl p-4 hover:border-teal-500/30 transition-colors flex items-center gap-3"
                >
                  {done
                    ? <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                    : l.tier === "free"
                      ? <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
                      : <Crown className="w-4 h-4 text-amber-400 shrink-0" />}
                  <span className={`text-sm font-medium flex-1 transition-colors ${done ? "text-muted-foreground" : "group-hover:text-teal-400"}`}>
                    {l.title}
                  </span>
                  {done
                    ? <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 shrink-0">Read</span>
                    : <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                </Link>
              );
            })}
          </div>
        </Section>
      )}

      {/* ── RELATED TOOLKITS ── */}
      {relatedTools.length > 0 && (
        <Section icon={Wrench} title="Try the free tools">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {relatedTools.map((tool) => (
              <Link key={tool.slug} href={`/tools/${tool.slug}`} className="block h-full">
                <div className="h-full bg-card border border-white/5 rounded-xl p-4 hover:border-teal-500/30 transition-colors flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <Wrench className="w-4 h-4 text-teal-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded text-emerald-400 bg-emerald-400/10">
                      Free
                    </span>
                  </div>
                  <p className="text-sm font-semibold mb-1">{tool.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed flex-1">{tool.blurb}</p>
                  <span className="mt-3 text-xs font-semibold text-teal-400">Open tool →</span>
                </div>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {relatedToolkits.length > 0 && (
        <Section icon={Package} title="Checklists & toolkits">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {relatedToolkits.map((tk) => {
              const inner = (
                <div className="h-full bg-card border border-white/5 rounded-xl p-4 hover:border-teal-500/30 transition-colors flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <Package className="w-4 h-4 text-teal-400" />
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      tk.accessTier === "pro" ? "text-amber-400 bg-amber-400/10" : "text-emerald-400 bg-emerald-400/10"
                    }`}>
                      {tk.accessTier === "pro" ? "Pro" : "Free"}
                    </span>
                  </div>
                  <p className="text-sm font-semibold mb-1">{tk.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed flex-1">{tk.problemSolved}</p>
                  <span className="mt-3 text-xs font-semibold text-teal-400">
                    {tk.status === "available" ? "Open toolkit →" : "Coming soon"}
                  </span>
                </div>
              );
              return tk.status === "available" && tk.href
                ? <Link key={tk.slug} href={tk.href} className="block h-full">{inner}</Link>
                : <div key={tk.slug} className="opacity-80">{inner}</div>;
            })}
          </div>
        </Section>
      )}

      <ContentDisclaimer />
    </div>
  );
}
