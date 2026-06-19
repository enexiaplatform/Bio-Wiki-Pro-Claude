import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Microscope, ShieldCheck, FlaskConical, ClipboardCheck, Search,
  TestTube2, Dna, Briefcase, ArrowRight, ChevronRight, Layers,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useSEO } from "@/hooks/use-seo";
import { JsonLd } from "@/components/JsonLd";
import {
  workflowCategories, getWorkflowsInCategory, type WorkflowCategory,
} from "@/data/workflows";
import { getLearningPath } from "@/data/learningPaths";
import { useReadLessons } from "@/hooks/use-read-lessons";

// Icons mapped by category slug (data stays serializable).
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "microbiology-qc": Microscope,
  "sterile-aseptic": ShieldCheck,
  "validation": ClipboardCheck,
  "quality-systems": Layers,
  "investigations-data-integrity": Search,
  "laboratory-controls": TestTube2,
  "biologics-qc": Dna,
  "career-skills": Briefcase,
};

function categoryHref(c: WorkflowCategory): string {
  // Categories with workflow pages → anchor on this page; otherwise straight to
  // their learning path or dedicated route.
  if (c.workflowSlugs.length > 0) return `#${c.slug}`;
  if (c.pathSlug) return `/paths/${c.pathSlug}`;
  return c.href ?? "/academy";
}

export default function WorkflowsPage() {
  useSEO({
    title: "Workflow Atlas — what are you working on?",
    description:
      "Practical, step-by-step QC/QA workflows — culture media, environmental monitoring, biological indicators, and more. Pick a workflow, see the steps, control points, and the lessons and toolkits that support it.",
  });
  const { read } = useReadLessons();
  const readSet = new Set(read);

  // Reading progress for a category, via its mapped learning path.
  function pathProgress(c: WorkflowCategory): { done: number; total: number } | null {
    const path = c.pathSlug ? getLearningPath(c.pathSlug) : undefined;
    if (!path || path.lessonSlugs.length === 0) return null;
    const done = path.lessonSlugs.filter((s) => readSet.has(s)).length;
    return { done, total: path.lessonSlugs.length };
  }

  return (
    <div className="pb-24 pt-6 md:pt-10 max-w-5xl mx-auto px-4">
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

      {/* ── HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }} className="mb-10 text-center"
      >
        <span className="inline-flex items-center gap-2 text-[11px] uppercase font-bold tracking-widest text-teal-400 bg-teal-400/10 px-3 py-1.5 rounded-full mb-5">
          <FlaskConical className="w-3 h-3" /> Workflow Atlas
        </span>
        <h1 className="text-3xl md:text-4xl font-bold mb-3 font-display">
          What workflow are you working on?
        </h1>
        <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
          Start from the task in front of you. Each workflow gives you the steps,
          the control points, the common mistakes — and the lessons and toolkits
          that back it up.
        </p>
      </motion.div>

      {/* ── CATEGORY GRID ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-14">
        {workflowCategories.map((c, i) => {
          const Icon = CATEGORY_ICONS[c.slug] ?? FlaskConical;
          const count = c.workflowSlugs.length;
          const href = categoryHref(c);
          const internal = href.startsWith("#");
          const card = (
            <motion.div
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.4, delay: (i % 2) * 0.08 }}
              className="group h-full bg-card border border-white/5 rounded-2xl p-5 hover:border-teal-500/30 transition-colors flex flex-col"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-teal-500/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-teal-400" />
                </div>
                {count > 0 ? (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 bg-teal-400/10 px-2 py-1 rounded">
                    {count} workflow{count > 1 ? "s" : ""}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-white/5 px-2 py-1 rounded">
                    Learning path
                  </span>
                )}
              </div>
              <h2 className="font-bold text-base mb-1.5">{c.title}</h2>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4 flex-1">{c.description}</p>
              {(() => {
                const p = pathProgress(c);
                if (!p || p.done === 0) return null;
                return (
                  <div className="mb-3 flex items-center gap-2">
                    <div className="h-1 flex-1 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full bg-teal-400" style={{ width: `${(p.done / p.total) * 100}%` }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">{p.done}/{p.total} read</span>
                  </div>
                );
              })()}
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-400 group-hover:gap-2.5 transition-all">
                {count > 0 ? "See workflows" : "Browse the path"}
                <ChevronRight className="w-4 h-4" />
              </span>
            </motion.div>
          );
          return internal ? (
            <a key={c.slug} href={href} className="block h-full">{card}</a>
          ) : (
            <Link key={c.slug} href={href} className="block h-full">{card}</Link>
          );
        })}
      </div>

      {/* ── CATEGORIES WITH WORKFLOW PAGES ── */}
      {workflowCategories
        .filter((c) => c.workflowSlugs.length > 0)
        .map((c) => {
          const workflows = getWorkflowsInCategory(c.slug);
          const path = c.pathSlug ? getLearningPath(c.pathSlug) : undefined;
          return (
            <section key={c.slug} id={c.slug} className="mb-14 scroll-mt-24">
              <div className="flex items-end justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold">{c.title}</h2>
                  <p className="text-xs text-muted-foreground mt-1">{c.audience}</p>
                </div>
                {path && (
                  <Link
                    href={`/paths/${path.slug}`}
                    className="shrink-0 text-xs font-semibold text-teal-400 hover:underline whitespace-nowrap"
                  >
                    Full learning path →
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {workflows.map((w) => (
                  <Link
                    key={w.slug}
                    href={`/workflows/${w.slug}`}
                    className="group bg-card border border-white/5 rounded-2xl p-5 hover:border-teal-500/30 transition-colors flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Microscope className="w-5 h-5 text-teal-400" />
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        w.accessTier === "pro"
                          ? "text-amber-400 bg-amber-400/10"
                          : "text-emerald-400 bg-emerald-400/10"
                      }`}>
                        {w.accessTier === "pro" ? "Pro" : "Free"}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm mb-1.5">{w.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-4 flex-1">{w.purpose}</p>
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-400 group-hover:gap-2.5 transition-all">
                      Open workflow <ArrowRight className="w-4 h-4" />
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

      <p className="text-center text-xs text-muted-foreground">
        More workflow verticals are being built out from the learning paths above.
      </p>
    </div>
  );
}
