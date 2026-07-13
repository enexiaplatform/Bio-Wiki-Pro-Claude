import { useMemo, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  ChevronRight,
  ClipboardCheck,
  Dna,
  Filter,
  FlaskConical,
  Layers,
  Microscope,
  Search,
  ShieldCheck,
  Sparkles,
  TestTube2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { JsonLd } from "@/components/JsonLd";
import { useReadLessons } from "@/hooks/use-read-lessons";
import { EditorialImage } from "@/components/EditorialImage";
import { useSEO } from "@/hooks/use-seo";
import { getLearningPath } from "@/data/learningPaths";
import {
  getWorkflowsInCategory,
  workflowCategories,
  workflows,
  type Workflow,
  type WorkflowCategory,
} from "@/data/workflows";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "microbiology-qc": Microscope,
  "sterile-aseptic": ShieldCheck,
  validation: ClipboardCheck,
  "quality-systems": Layers,
  "investigations-data-integrity": Search,
  "laboratory-controls": TestTube2,
  "biologics-qc": Dna,
  "career-skills": Briefcase,
};

function categoryHref(category: WorkflowCategory): string {
  if (category.workflowSlugs.length > 0) return `#${category.slug}`;
  if (category.pathSlug) return `/paths/${category.pathSlug}`;
  return category.href ?? "/academy";
}

function workflowMatchesQuery(workflow: Workflow, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;

  return [
    workflow.title,
    workflow.purpose,
    workflow.audience,
    workflow.categorySlug,
    ...workflow.useWhen,
  ].some((value) => value.toLowerCase().includes(normalizedQuery));
}

export default function WorkflowsPage() {
  useSEO({
    title: "Workflow Atlas - what are you working on?",
    description:
      "Practical, step-by-step QC/QA workflows for microbiology, validation, quality systems, laboratory controls, and biologics QC.",
  });

  const { read } = useReadLessons();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const readSet = useMemo(() => new Set(read), [read]);

  function pathProgress(category: WorkflowCategory): { done: number; total: number } | null {
    const path = category.pathSlug ? getLearningPath(category.pathSlug) : undefined;
    if (!path || path.lessonSlugs.length === 0) return null;
    const done = path.lessonSlugs.filter((slug) => readSet.has(slug)).length;
    return { done, total: path.lessonSlugs.length };
  }

  const categoryOptions = useMemo(
    () => ["All", ...workflowCategories.map((category) => category.title)],
    [],
  );

  const visibleCategories = useMemo(() => {
    return workflowCategories
      .map((category) => {
        const categoryWorkflows = getWorkflowsInCategory(category.slug).filter((workflow) =>
          workflowMatchesQuery(workflow, query),
        );
        const categoryTextMatches =
          !query.trim() ||
          [category.title, category.description, category.audience].some((value) =>
            value.toLowerCase().includes(query.trim().toLowerCase()),
          );

        return { category, workflows: categoryWorkflows, categoryTextMatches };
      })
      .filter(({ category, workflows: categoryWorkflows, categoryTextMatches }) => {
        const categoryMatch = activeCategory === "All" || category.title === activeCategory;
        const queryMatch = categoryTextMatches || categoryWorkflows.length > 0;
        return categoryMatch && queryMatch;
      });
  }, [activeCategory, query]);

  const featuredWorkflows = workflows.slice(0, 3);
  const totalWorkflowCount = workflows.length;
  const shownWorkflowCount = visibleCategories.reduce((total, item) => total + item.workflows.length, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-4 md:pt-8">
      <JsonLd
        id="workflows-breadcrumb"
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "/" },
            { "@type": "ListItem", position: 2, name: "Workflows", item: "/workflows" },
          ],
        }}
      />

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative mb-6 overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-teal-400/10 via-white/[0.04] to-transparent p-5 shadow-xl shadow-black/10 md:p-7"
      >
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_10%,rgba(20,184,166,0.18),transparent_30%),radial-gradient(circle_at_90%_20%,rgba(16,185,129,0.1),transparent_28%)]" />
        <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-stretch">
          <div>
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-400/20 bg-teal-400/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-teal-300">
              <FlaskConical className="h-3.5 w-3.5" />
              Workflow Atlas
            </span>
            <h1 className="mb-3 max-w-3xl font-display text-3xl font-bold leading-tight md:text-5xl">
              What workflow are you working on?
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
              Start from the task in front of you. Each workflow gives you the steps, control points,
              common mistakes, and the lessons and toolkits that support the work.
            </p>
          </div>

          <div className="relative min-h-44 overflow-hidden rounded-lg border border-white/10">
            <EditorialImage src="/images/editorial/cleanroom-practice.jpg" alt="Controlled laboratory workflow in practice" creditName="Toon Lambrechts" creditUrl="https://unsplash.com/photos/RkG7wp75b48" eager className="absolute inset-0" imageClassName="opacity-65 saturate-75" />
            <div className="absolute inset-x-3 bottom-3 grid grid-cols-3 gap-2 rounded-lg border border-white/10 bg-slate-950/80 p-3 backdrop-blur">
            <div>
              <div className="text-xl font-bold text-teal-300">{totalWorkflowCount}</div>
              <div className="text-[11px] text-muted-foreground">Workflows</div>
            </div>
            <div>
              <div className="text-xl font-bold text-teal-300">{workflowCategories.length}</div>
              <div className="text-[11px] text-muted-foreground">Tracks</div>
            </div>
            <div>
              <div className="text-xl font-bold text-teal-300">Stepwise</div>
              <div className="text-[11px] text-muted-foreground">Guides</div>
            </div>
            </div>
          </div>
        </div>
      </motion.section>

      <section className="mb-6 grid gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-3 md:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search workflows, tasks, or GMP topics"
            className="h-11 w-full rounded-lg border border-white/10 bg-background/70 pl-10 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-teal-400/50 focus:ring-2 focus:ring-teal-400/20"
            aria-label="Search workflows"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:max-w-xl md:pb-0">
          <span className="hidden items-center gap-1.5 text-xs font-semibold text-muted-foreground md:inline-flex">
            <Filter className="h-3.5 w-3.5" />
            Track
          </span>
          {categoryOptions.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                activeCategory === category
                  ? "border-teal-400/40 bg-teal-400/15 text-teal-200"
                  : "border-white/10 bg-white/[0.04] text-muted-foreground hover:border-white/20 hover:text-foreground"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-300">
              <Sparkles className="h-3.5 w-3.5" />
              Start here
            </p>
            <h2 className="mt-1 text-lg font-bold">High-signal workflows for first-time users</h2>
          </div>
          <Link href="/tools" className="hidden text-sm font-semibold text-teal-300 hover:underline sm:inline-flex">
            Open tools
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {featuredWorkflows.map((workflow) => (
            <Link
              key={workflow.slug}
              href={`/workflows/${workflow.slug}`}
              className="group rounded-lg border border-white/10 bg-white/[0.045] p-4 shadow-lg shadow-black/10 transition-all hover:-translate-y-0.5 hover:border-teal-400/35 hover:bg-white/[0.07]"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-400/10 text-teal-300">
                  <BookOpen className="h-5 w-5" />
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {workflow.accessTier === "pro" ? "Pro" : "Free"}
                </span>
              </div>
              <h3 className="mb-1.5 text-sm font-bold leading-snug">{workflow.title}</h3>
              <p className="mb-3 text-xs leading-relaxed text-muted-foreground">{workflow.purpose}</p>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-300 transition-all group-hover:gap-2.5">
                Open workflow <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold">Explore by track</h2>
        <span className="text-sm text-muted-foreground">
          {shownWorkflowCount} of {totalWorkflowCount} workflows
        </span>
      </div>

      {visibleCategories.length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.035] p-8 text-center">
          <Search className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <h2 className="mb-2 text-lg font-bold">No workflows match that filter</h2>
          <p className="mx-auto mb-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            Try a broader search term or return to all workflow tracks.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setActiveCategory("All");
            }}
            className="inline-flex items-center justify-center rounded-lg bg-teal-400 px-4 py-2 text-sm font-bold text-teal-950 hover:bg-teal-300"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <>
          <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {visibleCategories.map(({ category }, index) => {
              const Icon = CATEGORY_ICONS[category.slug] ?? FlaskConical;
              const count = category.workflowSlugs.length;
              const href = categoryHref(category);
              const internal = href.startsWith("#");
              const progress = pathProgress(category);
              const card = (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: (index % 2) * 0.06 }}
                  className="group flex h-full flex-col rounded-lg border border-white/10 bg-white/[0.045] p-5 shadow-lg shadow-black/10 transition-all hover:-translate-y-1 hover:border-teal-400/35 hover:bg-white/[0.07]"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-teal-500/10">
                      <Icon className="h-5 w-5 text-teal-300" />
                    </div>
                    <span className="rounded-lg bg-white/5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {count > 0 ? `${count} workflow${count > 1 ? "s" : ""}` : "Learning path"}
                    </span>
                  </div>
                  <h3 className="mb-1.5 text-base font-bold">{category.title}</h3>
                  <p className="mb-4 flex-1 text-xs leading-relaxed text-muted-foreground">{category.description}</p>
                  {progress && progress.done > 0 && (
                    <div className="mb-3 flex items-center gap-2">
                      <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full bg-teal-400"
                          style={{ width: `${(progress.done / progress.total) * 100}%` }}
                        />
                      </div>
                      <span className="whitespace-nowrap text-[10px] text-muted-foreground">
                        {progress.done}/{progress.total} read
                      </span>
                    </div>
                  )}
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-300 transition-all group-hover:gap-2.5">
                    {count > 0 ? "See workflows" : "Browse the path"}
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </motion.div>
              );

              return internal ? (
                <a key={category.slug} href={href} className="block h-full">
                  {card}
                </a>
              ) : (
                <Link key={category.slug} href={href} className="block h-full">
                  {card}
                </Link>
              );
            })}
          </div>

          {visibleCategories
            .filter(({ category, workflows: categoryWorkflows }) => category.workflowSlugs.length > 0 && categoryWorkflows.length > 0)
            .map(({ category, workflows: categoryWorkflows }) => {
              const path = category.pathSlug ? getLearningPath(category.pathSlug) : undefined;
              return (
                <section key={category.slug} id={category.slug} className="mb-12 scroll-mt-24">
                  <div className="mb-5 flex items-end justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold md:text-2xl">{category.title}</h2>
                      <p className="mt-1 text-xs text-muted-foreground">{category.audience}</p>
                    </div>
                    {path && (
                      <Link
                        href={`/paths/${path.slug}`}
                        className="shrink-0 whitespace-nowrap text-xs font-semibold text-teal-300 hover:underline"
                      >
                        Full learning path
                      </Link>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {categoryWorkflows.map((workflow) => (
                      <Link
                        key={workflow.slug}
                        href={`/workflows/${workflow.slug}`}
                        className="group flex flex-col rounded-lg border border-white/10 bg-white/[0.045] p-5 shadow-lg shadow-black/10 transition-all hover:-translate-y-1 hover:border-teal-400/35 hover:bg-white/[0.07]"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <Microscope className="h-5 w-5 text-teal-300" />
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              workflow.accessTier === "pro"
                                ? "bg-amber-400/10 text-amber-300"
                                : "bg-emerald-400/10 text-emerald-300"
                            }`}
                          >
                            {workflow.accessTier === "pro" ? "Pro" : "Free"}
                          </span>
                        </div>
                        <h3 className="mb-1.5 text-sm font-bold leading-snug">{workflow.title}</h3>
                        <p className="mb-4 flex-1 text-xs leading-relaxed text-muted-foreground">{workflow.purpose}</p>
                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-300 transition-all group-hover:gap-2.5">
                          Open workflow <ArrowRight className="h-4 w-4" />
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}
        </>
      )}

      <p className="text-center text-xs text-muted-foreground">
        More workflow verticals are being built out from the learning paths above.
      </p>
    </div>
  );
}
