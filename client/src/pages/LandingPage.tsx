import { useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  BookOpen, Package, Briefcase, ArrowRight, CheckCircle2,
  FlaskConical, ChevronRight, TrendingUp, Users, Star,
  Microscope, ShieldCheck, ClipboardCheck, Layers, Search, TestTube2, Dna, Workflow, Calculator,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSEO } from "@/hooks/use-seo";
import { listContent } from "@/lib/content";
import { useReadLessons } from "@/hooks/use-read-lessons";
import { prefetchLikelyNext } from "@/lib/route-prefetch";
import { ContinueLearning } from "@/components/ContinueLearning";
import { workflowCategories } from "@/data/workflows";
import { TOOL_CATALOG } from "@/data/tools/catalog";

// Workflow category → icon (data stays serializable).
const WORKFLOW_ICONS: Record<string, LucideIcon> = {
  "microbiology-qc": Microscope,
  "sterile-aseptic": ShieldCheck,
  "validation": ClipboardCheck,
  "quality-systems": Layers,
  "investigations-data-integrity": Search,
  "laboratory-controls": TestTube2,
  "biologics-qc": Dna,
  "career-skills": Briefcase,
};

function workflowHref(c: typeof workflowCategories[number]): string {
  if (c.workflowSlugs.length > 0) return `/workflows#${c.slug}`;
  if (c.pathSlug) return `/paths/${c.pathSlug}`;
  return c.href ?? "/workflows";
}

const byUpdatedDesc = (a: { updatedAt?: string }, b: { updatedAt?: string }) =>
  (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "");

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1 } }),
};

const pillClass = "inline-flex items-center gap-2 rounded-full border border-teal-400/20 bg-teal-400/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-teal-300";
const primaryCtaClass = "inline-flex items-center justify-center gap-2 rounded-lg bg-teal-400 px-5 py-3 text-sm font-bold text-teal-950 shadow-lg shadow-teal-500/20 transition-all hover:-translate-y-0.5 hover:bg-teal-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const secondaryCtaClass = "inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-foreground transition-all hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const elevatedCardClass = "group h-full rounded-lg border border-white/10 bg-white/[0.045] p-4 shadow-lg shadow-black/10 transition-all hover:-translate-y-1 hover:border-teal-400/35 hover:bg-white/[0.07]";

// Non-translatable presentation metadata, merged with translated copy by index.
const solutionMeta = [
  { icon: BookOpen, badgeColor: "text-emerald-400 bg-emerald-400/10", href: "/academy", ctaStyle: "border border-white/10 hover:border-white/30", featured: false },
  { icon: Package, badgeColor: "text-teal-400 bg-teal-400/10", href: "/toolkits/gmp-audit-kit", ctaStyle: "bg-teal-500 hover:bg-teal-400 text-teal-950", featured: true },
  { icon: Briefcase, badgeColor: "text-blue-400 bg-blue-400/10", href: "/career", ctaStyle: "border border-white/10 hover:border-white/30", featured: false },
];

const trustCardMeta = [
  { icon: BookOpen, color: "text-emerald-400" },
  { icon: Users, color: "text-blue-400" },
  { icon: Star, color: "text-amber-400" },
  { icon: TrendingUp, color: "text-teal-400" },
];

const problemCardMeta = [
  { icon: TrendingUp, color: "text-emerald-300", bg: "bg-emerald-400/10" },
  { icon: ShieldCheck, color: "text-amber-300", bg: "bg-amber-400/10" },
  { icon: Search, color: "text-cyan-300", bg: "bg-cyan-400/10" },
];

// Flagship free calculators surfaced on the home page (links only — the tool
// components are NOT imported here, to keep the landing bundle lean).
const FLAGSHIP_TOOLS: { slug: string; label: string; blurb: string; icon: LucideIcon }[] = [
  { slug: "endotoxin-limit-calculator", label: "Endotoxin Limit & MVD", blurb: "Endotoxin limit (K/M) and Maximum Valid Dilution for a BET.", icon: FlaskConical },
  { slug: "cleaning-validation-maco-calculator", label: "Cleaning Validation MACO", blurb: "Carryover limits by dose, HBEL, and 10 ppm, plus swab limits.", icon: TestTube2 },
  { slug: "process-capability-calculator", label: "Process Capability (Cpk)", blurb: "Cp, Cpk, and estimated out-of-spec PPM from your data.", icon: TrendingUp },
  { slug: "microbial-count-calculator", label: "Microbial Count (CFU)", blurb: "Plate or membrane counts back to CFU/mL in the sample.", icon: Dna },
];

interface Stat { value: string; label: string }
interface Problem { emoji: string; title: string; desc: string }
interface Solution { badge: string; title: string; desc: string; cta: string }
interface TrustCard { label: string; value: string }

export default function LandingPage() {
  const { t } = useTranslation("landing");
  useSEO({ title: t("seo.title"), description: t("seo.description") });
  const { count: readCount } = useReadLessons();

  // Warm the chunks a visitor is most likely to click next, once idle.
  useEffect(() => { prefetchLikelyNext(); }, []);

  const latestLessons = [...listContent({ collection: "academy", lang: "en" })].sort(byUpdatedDesc).slice(0, 4);
  const latestPosts = [...listContent({ collection: "blog", lang: "en" })].sort(byUpdatedDesc).slice(0, 4);

  const stats = t("stats", { returnObjects: true }) as Stat[];
  const problems = t("problems.items", { returnObjects: true }) as Problem[];
  const solutions = t("solutions.items", { returnObjects: true }) as Solution[];
  const features = t("trust.features", { returnObjects: true }) as string[];
  const cards = t("trust.cards", { returnObjects: true }) as TrustCard[];

  return (
    <div className="min-h-screen">
      {/* Returning visitor — resume where they left off */}
      {readCount > 0 && (
        <div className="mx-auto max-w-4xl px-4 pt-6">
          <ContinueLearning />
        </div>
      )}

      {/* ── HERO ── */}
      <section className="relative isolate overflow-hidden border-b border-white/10 px-4 py-12 md:py-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_12%,rgba(20,184,166,0.18),transparent_30%),radial-gradient(circle_at_86%_18%,rgba(16,185,129,0.12),transparent_28%)]" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_78%)]" />

        <div className="relative mx-auto max-w-6xl text-center">
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
            <span className={`${pillClass} mb-6`}>
              <FlaskConical className="h-3.5 w-3.5" />
              {t("hero.badge")}
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp} initial="hidden" animate="show" custom={1}
            className="mx-auto mb-6 max-w-4xl font-display text-4xl font-bold leading-[1.04] md:text-6xl"
          >
            {t("hero.titleLead")}{" "}
            <span className="bg-gradient-to-r from-teal-300 via-emerald-300 to-cyan-300 bg-clip-text text-transparent">
              {t("hero.titleHighlight")}
            </span>
            <br className="hidden md:block" />
            {" "}{t("hero.titleTail")}
          </motion.h1>

          <motion.p
            variants={fadeUp} initial="hidden" animate="show" custom={2}
            className="mx-auto mb-10 max-w-2xl text-base leading-8 text-muted-foreground md:text-lg"
          >
            {t("hero.subtitle")}
          </motion.p>

          <motion.div
            variants={fadeUp} initial="hidden" animate="show" custom={3}
            className="mb-8 flex flex-col justify-center gap-3 sm:flex-row"
          >
            <Link href="/workflows">
              <button className={primaryCtaClass}>
                <Workflow className="h-4 w-4" />
                {t("hero.ctaWorkflows")}
              </button>
            </Link>
            <Link href="/register">
              <button className={secondaryCtaClass}>
                {t("hero.ctaStart")}
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </motion.div>

          <motion.div
            variants={fadeUp} initial="hidden" animate="show" custom={4}
            className="mx-auto mb-8 grid max-w-4xl gap-3 rounded-lg border border-white/10 bg-slate-950/50 p-3 text-left shadow-2xl shadow-black/20 backdrop-blur md:grid-cols-3"
          >
            {[
              { href: "/workflows", icon: Workflow, title: "Follow a workflow", desc: "Steps, controls, mistakes, and linked tools." },
              { href: "/tools", icon: Calculator, title: "Use a calculator", desc: "Run QC math with formulas visible." },
              { href: "/academy", icon: BookOpen, title: "Deepen the topic", desc: "Structured lessons and articles behind the task." },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-3 transition-all hover:border-teal-400/35 hover:bg-teal-400/10"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 text-teal-300">
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.desc}</p>
                </div>
                <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-teal-300" />
              </Link>
            ))}
          </motion.div>

          <motion.div
            variants={fadeUp} initial="hidden" animate="show" custom={5}
            className="mx-auto grid max-w-3xl grid-cols-2 gap-3 md:grid-cols-4"
          >
            {stats.map((s) => (
              <div key={s.label} className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
                <div className="text-xl font-bold text-teal-300">{s.value}</div>
                <div className="mt-1 text-[11px] text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── WORKFLOW START (workflow-first front door) ── */}
      <section className="py-12 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <span className={`${pillClass} mb-4`}>
              <Workflow className="w-3 h-3" /> Workflow Atlas
            </span>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">What workflow are you working on?</h2>
            <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
              Start from the task in front of you — the steps, control points, common mistakes,
              and the lessons and toolkits that back it up.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {workflowCategories.map((c, i) => {
              const Icon = WORKFLOW_ICONS[c.slug] ?? FlaskConical;
              return (
                <motion.div
                  key={c.slug}
                  initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.35, delay: (i % 4) * 0.06 }}
                >
                  <Link
                    href={workflowHref(c)}
                    className={elevatedCardClass}
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="w-9 h-9 rounded-lg bg-teal-500/10 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-teal-400" />
                      </div>
                      {c.workflowSlugs.length > 0 && (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-teal-400 bg-teal-400/10 px-1.5 py-0.5 rounded">
                          {c.workflowSlugs.length} flows
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-sm mb-1 leading-snug">{c.title}</h3>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{c.description}</p>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
            <Link href="/workflows#microbiology-qc">
              <button className={primaryCtaClass}>
                <Microscope className="w-4 h-4" /> Start with Microbiology QC
              </button>
            </Link>
            <Link href="/tools">
              <button className={secondaryCtaClass}>
                <Calculator className="w-4 h-4" /> Try a free tool
              </button>
            </Link>
            <Link href="/toolkits">
              <button className={secondaryCtaClass}>
                <Package className="w-4 h-4" /> Browse toolkits
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FREE CALCULATORS ── */}
      <section className="py-12 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <span className={`${pillClass} mb-4`}>
              <Calculator className="w-3 h-3" /> Free calculators
            </span>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">The QC math, done for you</h2>
            <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
              Interactive calculators for the work you actually do — no sign-up, instant answers,
              with the formula shown so you can check it.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            {FLAGSHIP_TOOLS.map((tool, i) => {
              const Icon = tool.icon;
              return (
                <motion.div
                  key={tool.slug}
                  initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.35, delay: (i % 4) * 0.06 }}
                >
                  <Link
                    href={`/tools/${tool.slug}`}
                    className={elevatedCardClass}
                  >
                    <div className="w-9 h-9 rounded-lg bg-teal-500/10 flex items-center justify-center mb-2.5">
                      <Icon className="w-4 h-4 text-teal-400" />
                    </div>
                    <h3 className="font-bold text-sm mb-1 leading-snug">{tool.label}</h3>
                    <p className="text-[11px] text-muted-foreground leading-relaxed flex-1">{tool.blurb}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-teal-400 group-hover:gap-2 transition-all">
                      Open <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          <div className="text-center">
            <Link href="/tools">
              <button className={secondaryCtaClass}>
                <Calculator className="w-4 h-4" /> See all {TOOL_CATALOG.length} free tools
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── PROBLEMS ── */}
      <section className="py-16 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-3">{t("problems.heading")}</h2>
            <p className="text-muted-foreground text-sm">{t("problems.subtitle")}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {problems.map((p, i) => {
              const meta = problemCardMeta[i] ?? problemCardMeta[0];
              const Icon = meta.icon;
              return (
                <motion.div
                  key={p.title}
                  initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="rounded-lg border border-white/10 bg-white/[0.045] p-5 shadow-lg shadow-black/10"
                >
                  <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${meta.bg} ${meta.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-2 text-sm font-bold leading-snug">{p.title}</h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">{p.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SOLUTIONS ── */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-3">{t("solutions.heading")}</h2>
            <p className="text-muted-foreground text-sm">{t("solutions.subtitle")}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {solutionMeta.map((m, i) => {
              const s = solutions[i];
              return (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }}
                  className={`bg-card rounded-2xl p-6 flex flex-col relative overflow-hidden ${
                    m.featured
                      ? "border-2 border-teal-500/40 shadow-[0_0_30px_rgba(20,184,166,0.1)]"
                      : "border border-white/5"
                  }`}
                >
                  {m.featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-teal-500 text-teal-950 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                        {t("solutions.featuredBadge")}
                      </span>
                    </div>
                  )}
                  <div className="mt-2">
                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded w-fit block mb-3 ${m.badgeColor}`}>
                      {s.badge}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                      <m.icon className="w-5 h-5 text-teal-400" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">{s.desc}</p>
                  </div>
                  <Link href={m.href}>
                    <button className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${m.ctaStyle}`}>
                      {s.cta}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCT BANNER ── */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="relative bg-gradient-to-r from-teal-500/10 via-emerald-500/5 to-transparent border border-teal-500/20 rounded-2xl p-8 md:p-10 overflow-hidden"
          >
            <div className="absolute right-0 top-0 w-80 h-80 bg-teal-400/8 blur-3xl rounded-full -mr-20 -mt-20 pointer-events-none" />
            <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
              <div className="max-w-xl">
                <span className="text-[10px] uppercase font-bold tracking-widest text-teal-400 mb-3 block">
                  {t("banner.eyebrow")}
                </span>
                <h3 className="text-2xl font-bold mb-2">{t("banner.title")}</h3>
                <p className="text-sm text-muted-foreground mb-4">{t("banner.desc")}</p>
                <div className="flex flex-wrap gap-2">
                  {["GMP WHO", "Annex 1 EU", "FSSC 22000", "ISO 15189"].map((tag) => (
                    <span key={tag} className="text-[10px] font-semibold bg-white/5 border border-white/10 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="shrink-0 text-center md:text-right">
                <div className="mb-1 inline-flex items-center gap-1.5 text-teal-400 font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-xl">{t("banner.includedBadge")}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-4">{t("banner.priceNote")}</p>
                <div className="flex flex-col sm:flex-row gap-2 md:justify-end">
                  <Link href="/pricing">
                    <button className="bg-teal-500 hover:bg-teal-400 text-teal-950 font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-teal-500/20 w-full sm:w-auto">
                      {t("banner.cta")}
                    </button>
                  </Link>
                  <Link href="/toolkits/gmp-audit-kit">
                    <button className="border border-white/10 hover:border-white/30 font-semibold px-5 py-3 rounded-xl transition-all w-full sm:w-auto">
                      {t("banner.ctaSecondary")}
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── TRUST / CREDIBILITY ── */}
      <section className="py-16 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold mb-4">{t("trust.heading")}</h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">{t("trust.body")}</p>
              <div className="space-y-3">
                {features.map((f) => (
                  <div key={f} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                    <span className="text-sm">{f}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5 }}
              className="grid grid-cols-1 gap-4"
            >
              {trustCardMeta.map((m, i) => {
                const c = cards[i];
                return (
                  <div key={c.label} className="bg-card border border-white/5 rounded-xl p-4 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center ${m.color}`}>
                      <m.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{c.label}</p>
                      <p className="text-sm font-semibold">{c.value}</p>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── LATEST CONTENT ── */}
      <section className="py-16 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-3">{t("latest.heading")}</h2>
            <p className="text-muted-foreground text-sm">{t("latest.subtitle")}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-3">{t("latest.academyLabel")}</h3>
              <ul className="space-y-2 mb-3">
                {latestLessons.map((l) => (
                  <li key={l.slug}>
                    <Link href={`/library/${l.slug}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                      <BookOpen className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      <span className="truncate">{l.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href="/academy" className="text-xs text-primary hover:underline">{t("latest.browseAcademy")}</Link>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-3">{t("latest.blogLabel")}</h3>
              <ul className="space-y-2 mb-3">
                {latestPosts.map((p) => (
                  <li key={p.slug}>
                    <Link href={`/blog/${p.slug}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                      <ChevronRight className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      <span className="truncate">{p.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href="/blog" className="text-xs text-primary hover:underline">{t("latest.browseBlog")}</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-20 px-4 border-t border-white/5">
        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-2xl md:text-4xl font-bold mb-4 font-display">{t("finalCta.heading")}</h2>
          <p className="text-muted-foreground mb-8">{t("finalCta.subtitle")}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register">
              <button className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-teal-950 font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-teal-500/20">
                <ArrowRight className="w-4 h-4" /> {t("finalCta.ctaStart")}
              </button>
            </Link>
            <Link href="/academy">
              <button className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/10 font-semibold px-6 py-3 rounded-xl transition-all">
                <BookOpen className="w-4 h-4" /> {t("finalCta.ctaAcademy")}
              </button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
