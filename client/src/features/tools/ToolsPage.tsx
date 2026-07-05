import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  Calculator,
  Filter,
  Microscope,
  Search,
  Sparkles,
  Workflow,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { useSEO } from "@/hooks/use-seo";
import { TOOLS } from "./registry";

/**
 * /tools - a scannable index of the free interactive QC/QA tools. Each card
 * links to a focused standalone page (/tools/:slug) so a single tool is one
 * click away and individually shareable + indexable.
 */
export default function ToolsPage() {
  const { t } = useTranslation("sections");
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useSEO({ title: t("tools.seoTitle"), description: t("tools.seoDesc") });

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(TOOLS.map((tool) => tool.category)))],
    [],
  );

  const filteredTools = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return TOOLS.filter((tool) => {
      const categoryMatch = activeCategory === "All" || tool.category === activeCategory;
      const queryMatch =
        normalizedQuery.length === 0 ||
        [tool.title, tool.blurb, tool.category, tool.relatedWorkflow?.title]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalizedQuery));

      return categoryMatch && queryMatch;
    });
  }, [activeCategory, query]);

  const starterTools = TOOLS.filter((tool) => tool.relatedWorkflow).slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-4 md:pt-8">
      <section className="relative mb-6 overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-teal-400/10 via-white/[0.04] to-transparent p-5 shadow-xl shadow-black/10 md:p-7">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_10%,rgba(20,184,166,0.18),transparent_30%)]" />
        <div className="grid gap-6 lg:grid-cols-[1fr_18rem] lg:items-end">
          <div className="flex items-start gap-4">
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:flex">
              <Microscope className="h-6 w-6" />
            </div>
            <div>
              <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-teal-400/20 bg-teal-400/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-teal-300">
                <Calculator className="h-3.5 w-3.5" />
                {t("tools.eyebrow")}
              </p>
              <h1 className="mb-3 max-w-3xl font-display text-3xl font-bold leading-tight md:text-4xl">
                {t("tools.title")}
              </h1>
              <p className="max-w-3xl leading-relaxed text-muted-foreground">{t("tools.subtitle")}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-lg border border-white/10 bg-slate-950/45 p-3">
            <div>
              <div className="text-xl font-bold text-teal-300">{TOOLS.length}</div>
              <div className="text-[11px] text-muted-foreground">Free tools</div>
            </div>
            <div>
              <div className="text-xl font-bold text-teal-300">{categories.length - 1}</div>
              <div className="text-[11px] text-muted-foreground">Categories</div>
            </div>
            <div>
              <div className="text-xl font-bold text-teal-300">1-click</div>
              <div className="text-[11px] text-muted-foreground">Launch</div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-6 grid gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-3 md:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by tool, workflow, or topic"
            className="h-11 w-full rounded-lg border border-white/10 bg-background/70 pl-10 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-teal-400/50 focus:ring-2 focus:ring-teal-400/20"
            aria-label="Search tools"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:max-w-xl md:pb-0">
          <span className="hidden items-center gap-1.5 text-xs font-semibold text-muted-foreground md:inline-flex">
            <Filter className="h-3.5 w-3.5" />
            Filter
          </span>
          {categories.map((category) => (
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

      {starterTools.length > 0 && (
        <section className="mb-8">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-300">
                <Sparkles className="h-3.5 w-3.5" />
                Good starting points
              </p>
              <h2 className="mt-1 text-lg font-bold">Start from a workflow-backed tool</h2>
            </div>
            <Link href="/workflows" className="hidden text-sm font-semibold text-teal-300 hover:underline sm:inline-flex">
              Browse workflows
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {starterTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.slug}
                  href={`/tools/${tool.slug}`}
                  className="group rounded-lg border border-white/10 bg-white/[0.045] p-4 shadow-lg shadow-black/10 transition-all hover:-translate-y-0.5 hover:border-teal-400/35 hover:bg-white/[0.07]"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-400/10 text-teal-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {tool.category}
                    </span>
                  </div>
                  <h3 className="mb-1.5 text-sm font-bold leading-snug">{tool.title}</h3>
                  <p className="mb-3 text-xs leading-relaxed text-muted-foreground">{tool.relatedWorkflow?.title}</p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-300 transition-all group-hover:gap-2.5">
                    Open tool <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold">All tools</h2>
        <span className="text-sm text-muted-foreground">
          {filteredTools.length} of {TOOLS.length}
        </span>
      </div>

      {filteredTools.length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.035] p-8 text-center">
          <Search className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <h2 className="mb-2 text-lg font-bold">No tools match that filter</h2>
          <p className="mx-auto mb-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            Try a broader search term or switch back to all categories.
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="group flex flex-col rounded-lg border border-white/10 bg-white/[0.045] p-5 shadow-lg shadow-black/10 transition-all hover:-translate-y-1 hover:border-primary/40 hover:bg-white/[0.07]"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {tool.category}
                  </span>
                </div>
                <h3 className="mb-1.5 text-base font-bold leading-snug">{tool.title}</h3>
                <p className="flex-1 text-sm leading-relaxed text-muted-foreground">{tool.blurb}</p>
                {tool.relatedWorkflow && (
                  <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                    <Workflow className="h-3.5 w-3.5 text-teal-300" />
                    {tool.relatedWorkflow.title}
                  </span>
                )}
                <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-all group-hover:gap-2.5">
                  Open tool <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
