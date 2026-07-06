import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Briefcase,
  Building,
  CheckCircle2,
  ChevronRight,
  DollarSign,
  GraduationCap,
  Loader2,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  Target,
} from "lucide-react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/context/UserContext";
import { useSEO } from "@/hooks/use-seo";
import { useTranslation } from "react-i18next";

type ProductType = "starter_kit" | "interview_prep" | "bundle";

async function createCheckoutSession(productType: ProductType): Promise<string> {
  const res = await fetch("/api/stripe/create-checkout-session", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productType }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? "Failed to start checkout");
  }
  const { url } = await res.json();
  return url;
}

const roles = ["QC Microbiologist", "QA Specialist", "Regulatory Affairs"] as const;

type Role = (typeof roles)[number];
type SkillState = "Have it" | "Partially" | "Need it";

const careerData: Record<
  Role,
  {
    stages: { label: string; years: string; responsibilities: string; skills: string; salary: string; employers: string }[];
    skills: { id: string; name: string; link: string }[];
  }
> = {
  "QC Microbiologist": {
    stages: [
      { label: "QC Analyst", years: "0-2 yr", responsibilities: "Perform routine microbial limit tests, environmental monitoring, and water testing according to SOPs. Document GMP data exactly as observed.", skills: "Aseptic technique, Media prep, Basic GMP", salary: "$45,000 - $60,000 / yr", employers: "Pfizer, Sanofi, Teva" },
      { label: "Senior QC", years: "2-5 yr", responsibilities: "Review analyst data, perform method validations, investigate OOS results, and draft straightforward deviations.", skills: "OOS Investigation, Method Validation, Advanced Microbiology", salary: "$60,000 - $80,000 / yr", employers: "Novartis, Moderna, Lonza" },
      { label: "QC Manager", years: "5-8 yr", responsibilities: "Manage lab operations, budget, and team scheduling. Interface with QA and operations. Defend methods during regulatory audits.", skills: "Leadership, QMS compliance, Audit defense", salary: "$90,000 - $120,000 / yr", employers: "Roche, B. Braun, Catalent" },
      { label: "QA Director", years: "8+ yr", responsibilities: "Oversee site-wide quality strategy, regulatory compliance, host international audits, and represent quality on the executive leadership team.", skills: "Strategic planning, Cross-functional leadership, Global regulations", salary: "$140,000 - $200,000+ / yr", employers: "Top-tier global pharma & CDMOs" },
    ],
    skills: [
      { id: "qc_s1", name: "Sterility testing", link: "/library/sterility-testing-basics" },
      { id: "qc_s2", name: "Environmental monitoring", link: "/library/environmental-monitoring-basics" },
      { id: "qc_s3", name: "Endotoxin testing", link: "/library/endotoxin-lal-testing" },
      { id: "qc_s4", name: "Microbial Limit Tests", link: "/library/bioburden-usp-61" },
      { id: "qc_s5", name: "Water microbiology", link: "/library/pharmaceutical-water-systems" },
      { id: "qc_s6", name: "GMP documentation", link: "/library/good-documentation-practice" },
      { id: "qc_s7", name: "Contamination Control Strategy", link: "/library/contamination-control-strategy" },
      { id: "qc_s8", name: "Cleanroom classification", link: "/library/environmental-monitoring-basics" },
    ],
  },
  "QA Specialist": {
    stages: [
      { label: "QA Associate", years: "0-2 yr", responsibilities: "Document issuance and review (BMRs, SOPs), logbook management, and basic shop-floor oversight.", skills: "GMP Documentation, Attention to Detail", salary: "$45,000 - $60,000 / yr", employers: "Pharma/Device Manufacturers" },
      { label: "QA Specialist", years: "2-5 yr", responsibilities: "Manage deviations, CAPAs, change controls. Perform root cause analysis and participate in internal audits.", skills: "Root Cause Analysis, QMS Systems", salary: "$60,000 - $85,000 / yr", employers: "Pharma/Device Manufacturers" },
      { label: "QA Manager", years: "5-8 yr", responsibilities: "Lead QA operations, oversee the QMS, prepare for external audits, manage site compliance.", skills: "Auditing, Leadership, QRM", salary: "$95,000 - $130,000 / yr", employers: "Pharma/Device Manufacturers" },
      { label: "Head of Quality", years: "8+ yr", responsibilities: "Total quality oversight, final batch release approval (QP role equivalent), enterprise quality strategy.", skills: "Executive Leadership, Global GMP", salary: "$150,000 - $220,000+ / yr", employers: "Pharma/Device Manufacturers" },
    ],
    skills: [
      { id: "qa_s1", name: "Deviation Management", link: "/library/deviation-management" },
      { id: "qa_s2", name: "CAPA / Root Cause Analysis", link: "/library/capa-fundamentals" },
      { id: "qa_s3", name: "Change Control", link: "/library/change-control" },
      { id: "qa_s4", name: "Internal Auditing", link: "/library/internal-audit-self-inspection" },
      { id: "qa_s5", name: "Quality Risk Management (ICH Q9)", link: "/library/quality-risk-management-q9" },
      { id: "qa_s6", name: "Validation Master Plan", link: "/library/process-validation-stages" },
    ],
  },
  "Regulatory Affairs": {
    stages: [
      { label: "RA Associate", years: "0-2 yr", responsibilities: "Assist in preparing dossiers, formatting documents, tracking submission status, and answering simple queries.", skills: "Dossier Formatting, eCTD Tools, Organization", salary: "$55,000 - $70,000 / yr", employers: "MNCs / Consulting Firms" },
      { label: "RA Specialist", years: "2-5 yr", responsibilities: "Compile full registration dossiers (ICH CTD), manage variations, liaise with health authorities (FDA, EMA, national agencies), and manage product lifecycle.", skills: "ICH CTD, FDA/EMA Regulations", salary: "$75,000 - $100,000 / yr", employers: "MNCs / Regional Pharma" },
      { label: "RA Manager", years: "5-8 yr", responsibilities: "Set regulatory strategy for new launches, manage team, handle complex regulatory authority negotiations.", skills: "Strategic Thinking, Agency Relationships", salary: "$110,000 - $150,000 / yr", employers: "MNCs / Regional Pharma" },
      { label: "Head of Regulatory", years: "8+ yr", responsibilities: "Define regional policy influence, oversee all regulatory compliance, integrate RA into business strategy.", skills: "Policy Influence, Regulatory Intelligence", salary: "$160,000 - $230,000+ / yr", employers: "Top MNCs" },
    ],
    skills: [
      { id: "ra_s1", name: "ICH CTD / eCTD Compilation", link: "/blog/ctd-ectd-dossier-structure" },
      { id: "ra_s2", name: "FDA / EMA Regulations", link: "/blog/fda-vs-ema-regulatory-pathways" },
      { id: "ra_s3", name: "Product Variation Management", link: "/blog/post-approval-variations-explained" },
      { id: "ra_s4", name: "Labeling Regulations", link: "/blog/labeling-and-product-information" },
      { id: "ra_s5", name: "Advertising Approval", link: "/blog/advertising-and-promotion-compliance" },
    ],
  },
};

const ROLE_PATH: Partial<Record<Role, { slug: string; title: string }>> = {
  "QC Microbiologist": { slug: "microbiology-qc-fundamentals", title: "Microbiology QC Fundamentals" },
  "QA Specialist": { slug: "quality-systems", title: "Quality Systems & QMS" },
};

const hubCardClass =
  "rounded-lg border border-white/10 bg-white/[0.045] p-5 shadow-lg shadow-black/10 transition-colors hover:border-teal-400/35";
const pillClass =
  "inline-flex items-center gap-2 rounded-full border border-teal-400/25 bg-teal-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-teal-200";
const productButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-teal-400 px-4 py-2 text-sm font-bold text-teal-950 transition-colors hover:bg-teal-300 disabled:cursor-wait disabled:opacity-60";

export default function Career() {
  const { t } = useTranslation("sections");
  useSEO({ title: t("career.seoTitle"), description: t("career.seoDesc") });
  const [activeRole, setActiveRole] = useState<Role>("QC Microbiologist");
  const [activeStageIdx, setActiveStageIdx] = useState(0);
  const [skillStates, setSkillStates] = useState<Record<string, SkillState>>({});
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState<ProductType | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const { isAuthenticated } = useUser();
  const [, navigate] = useLocation();

  async function handleCheckout(productType: ProductType) {
    if (!isAuthenticated) {
      navigate("/signup");
      return;
    }
    setLoadingProduct(productType);
    setCheckoutError(null);
    try {
      const url = await createCheckoutSession(productType);
      window.location.href = url;
    } catch (err: any) {
      setCheckoutError(err.message ?? "Something went wrong. Please try again.");
      setLoadingProduct(null);
    }
  }

  const activeData = careerData[activeRole];
  const activeStageDetails = activeData.stages[activeStageIdx];
  const totalSkills = activeData.skills.length;

  const metrics = useMemo(() => {
    let have = 0;
    let partial = 0;
    let need = 0;
    activeData.skills.forEach((skill) => {
      const state = skillStates[skill.id];
      if (state === "Have it") have++;
      if (state === "Partially") partial++;
      if (state === "Need it") need++;
    });
    return { have, partial, need };
  }, [skillStates, activeData.skills]);

  const ratedCount = activeData.skills.filter((skill) => skillStates[skill.id]).length;
  const readinessPercent = totalSkills > 0 ? Math.round(((metrics.have + metrics.partial * 0.5) / totalSkills) * 100) : 0;
  const roadmapSteps = useMemo(
    () => [
      ...activeData.skills.filter((skill) => skillStates[skill.id] === "Need it"),
      ...activeData.skills.filter((skill) => skillStates[skill.id] === "Partially"),
    ],
    [skillStates, activeData.skills],
  );
  const firstLessonStep = roadmapSteps.find((skill) => skill.link);
  const rolePath = ROLE_PATH[activeRole];

  const handleRoleChange = (role: Role) => {
    setActiveRole(role);
    setActiveStageIdx(0);
    setShowRoadmap(false);
  };

  const handleSkillChange = (skillId: string, state: SkillState) => {
    setSkillStates((prev) => ({ ...prev, [skillId]: state }));
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-4 md:pt-8">
      <section className="mb-8 overflow-hidden rounded-lg border border-teal-400/20 bg-gradient-to-br from-teal-500/12 via-white/[0.045] to-emerald-500/10 p-6 shadow-xl shadow-black/15 md:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <span className={pillClass}>
              <Briefcase className="h-3.5 w-3.5" />
              Career planner
            </span>
            <h1 className="mt-5 max-w-3xl font-display text-3xl font-bold leading-tight md:text-5xl">
              {t("career.title")}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
              {t("career.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-white/10 bg-background/35 p-4">
              <p className="text-2xl font-bold text-teal-200">{roles.length}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">Career tracks</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-background/35 p-4">
              <p className="text-2xl font-bold text-teal-200">{activeData.stages.length}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">Growth stages</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-background/35 p-4">
              <p className="text-2xl font-bold text-teal-200">{readinessPercent}%</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">Readiness</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8 rounded-lg border border-white/10 bg-white/[0.035] p-3">
        <div className="grid gap-2 md:grid-cols-3">
          {roles.map((role) => {
            const isActive = activeRole === role;
            const data = careerData[role];
            return (
              <button
                key={role}
                onClick={() => handleRoleChange(role)}
                className={clsx(
                  "rounded-lg border p-4 text-left transition-colors",
                  isActive
                    ? "border-teal-400/45 bg-teal-400/10 text-foreground"
                    : "border-white/10 bg-background/40 text-muted-foreground hover:border-white/25 hover:text-foreground",
                )}
              >
                <span className="text-sm font-bold">{role}</span>
                <span className="mt-2 block text-xs leading-relaxed">
                  {data.stages[0].label} to {data.stages[data.stages.length - 1].label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mb-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className={hubCardClass}>
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-300">Career pathway</p>
              <h2 className="mt-2 text-xl font-bold">{activeRole}</h2>
            </div>
            <Briefcase className="h-5 w-5 text-teal-300" />
          </div>

          <div className="space-y-2">
            {activeData.stages.map((stage, idx) => {
              const isActive = idx === activeStageIdx;
              return (
                <button
                  key={stage.label}
                  onClick={() => setActiveStageIdx(idx)}
                  className={clsx(
                    "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                    isActive
                      ? "border-teal-400/45 bg-teal-400/10"
                      : "border-white/10 bg-background/35 hover:border-white/25",
                  )}
                >
                  <span
                    className={clsx(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-bold",
                      isActive ? "border-teal-300 bg-teal-400/15 text-teal-200" : "border-white/15 text-muted-foreground",
                    )}
                  >
                    {idx + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold">{stage.label}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{stage.years}</span>
                  </span>
                  <ChevronRight className={clsx("h-4 w-4", isActive ? "text-teal-300" : "text-muted-foreground")} />
                </button>
              );
            })}
          </div>
        </div>

        <div className={hubCardClass}>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeRole}-${activeStageIdx}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {activeStageDetails.years}
                  </p>
                  <h3 className="mt-2 text-2xl font-bold">{activeStageDetails.label}</h3>
                </div>
                <span className="rounded-full border border-teal-400/25 bg-teal-400/10 px-3 py-1 text-xs font-semibold text-teal-200">
                  Stage {activeStageIdx + 1}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <StageDetail icon={CheckCircle2} label="Responsibilities" value={activeStageDetails.responsibilities} />
                <StageDetail icon={BookOpen} label="Key skills" value={activeStageDetails.skills} />
                <StageDetail icon={DollarSign} label="Estimated salary" value={activeStageDetails.salary} accent="text-green-300" />
                <StageDetail icon={Building} label="Target employers" value={activeStageDetails.employers} />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <section className="mb-8 rounded-lg border border-white/10 bg-white/[0.035] p-5 shadow-lg shadow-black/10 md:p-6">
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-300">Skill gap analyzer</p>
            <h2 className="mt-2 text-2xl font-bold">Build a practical learning roadmap</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Rate the skills for your selected role. The roadmap prioritizes missing skills first, then skills to strengthen.
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-background/45 px-4 py-3">
            <p className="text-sm font-bold">{ratedCount} of {totalSkills} rated</p>
            <p className="mt-1 text-xs text-muted-foreground">Readiness score: {readinessPercent}%</p>
          </div>
        </div>

        <div className="mb-6 h-3 overflow-hidden rounded-full bg-white/5">
          <div className="flex h-full">
            <div style={{ width: `${(metrics.have / totalSkills) * 100}%` }} className="bg-green-500 transition-all duration-500" />
            <div style={{ width: `${(metrics.partial / totalSkills) * 100}%` }} className="bg-amber-500 transition-all duration-500" />
            <div style={{ width: `${(metrics.need / totalSkills) * 100}%` }} className="bg-red-500 transition-all duration-500" />
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          {activeData.skills.map((skill) => (
            <div key={skill.id} className="rounded-lg border border-white/10 bg-background/35 p-3 transition-colors hover:border-white/25">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {skill.link ? (
                  <Link href={skill.link} className="group inline-flex min-w-0 items-center gap-1.5">
                    <span className="truncate text-sm font-semibold transition-colors group-hover:text-teal-300">{skill.name}</span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-teal-300 opacity-70" />
                  </Link>
                ) : (
                  <span className="text-sm font-semibold text-muted-foreground">{skill.name}</span>
                )}

                <div className="grid grid-cols-3 gap-1 rounded-lg border border-white/10 bg-background/70 p-1">
                  {(["Have it", "Partially", "Need it"] as SkillState[]).map((state) => {
                    const isActive = skillStates[skill.id] === state;
                    return (
                      <button
                        key={state}
                        onClick={() => handleSkillChange(skill.id, state)}
                        className={clsx(
                          "rounded-md px-2.5 py-1.5 text-xs font-bold transition-colors",
                          isActive && state === "Have it" && "bg-green-500 text-white",
                          isActive && state === "Partially" && "bg-amber-500 text-white",
                          isActive && state === "Need it" && "bg-red-500 text-white",
                          !isActive && "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                        )}
                      >
                        {state}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {ratedCount === 0
              ? "Rate at least one skill to generate your roadmap."
              : `${metrics.need} missing, ${metrics.partial} partial, ${metrics.have} already strong.`}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {showRoadmap && (
              <button
                onClick={() => setShowRoadmap(false)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Re-rate
              </button>
            )}
            <button
              onClick={() => setShowRoadmap(true)}
              disabled={ratedCount === 0}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-400 px-5 py-2.5 text-sm font-bold text-teal-950 transition-colors hover:bg-teal-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              Build roadmap
            </button>
          </div>
        </div>

        {showRoadmap && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-6 rounded-lg border border-teal-400/25 bg-teal-400/10 p-5"
          >
            <div className="mb-4 flex items-start gap-3">
              <div className="rounded-lg border border-teal-400/25 bg-teal-400/10 p-2 text-teal-200">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Your {activeRole} roadmap</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {roadmapSteps.length === 0
                    ? "Every rated skill is marked strong. Review a full path or aim at the next stage."
                    : "Work top to bottom: missing skills first, then partial skills."}
                </p>
              </div>
            </div>

            {roadmapSteps.length > 0 && (
              <ol className="mb-5 grid gap-2">
                {roadmapSteps.map((skill, index) => {
                  const isNeed = skillStates[skill.id] === "Need it";
                  const content = (
                    <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-background/40 p-3 transition-colors hover:border-teal-400/35">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-400/15 text-sm font-bold text-teal-200">
                        {index + 1}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold">{skill.name}</span>
                      <span
                        className={clsx(
                          "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
                          isNeed ? "bg-red-500/10 text-red-200" : "bg-amber-500/10 text-amber-200",
                        )}
                      >
                        {isNeed ? "Learn" : "Strengthen"}
                      </span>
                      {skill.link && <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
                    </div>
                  );
                  return <li key={skill.id}>{skill.link ? <Link href={skill.link}>{content}</Link> : content}</li>;
                })}
              </ol>
            )}

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {firstLessonStep?.link && (
                <Link href={firstLessonStep.link} className={productButtonClass}>
                  <BookOpen className="h-4 w-4" />
                  Start with {firstLessonStep.name}
                </Link>
              )}
              {rolePath && (
                <Link
                  href={`/paths/${rolePath.slug}`}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold transition-colors hover:border-white/30"
                >
                  <GraduationCap className="h-4 w-4" />
                  Follow {rolePath.title}
                </Link>
              )}
              <Link
                href="/my-learning"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold transition-colors hover:border-white/30"
              >
                Track progress
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </section>

      <section>
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-300">Career resources</p>
            <h2 className="mt-2 text-2xl font-bold">Digital products for the job search</h2>
          </div>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            Templates and prep packs are optional add-ons. Free role planning and linked lessons stay available.
          </p>
        </div>

        {checkoutError && (
          <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-center text-sm text-red-300">
            {checkoutError}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <ProductCard
            badge="Resource"
            title="Career Starter Kit"
            description="Professional CV templates tailored for Pharma, plus a curated research list of leading global pharma and biotech employers."
            price="$15.00"
            loading={loadingProduct === "starter_kit"}
            loadingLabel="Redirecting..."
            buttonLabel="Get access"
            onClick={() => handleCheckout("starter_kit")}
          />
          <ProductCard
            badge="Prep material"
            title="Interview Prep Pack"
            description="Over 100 real technical and behavioral interview questions sourced directly from QC/QA hiring managers."
            price="$20.00"
            loading={loadingProduct === "interview_prep"}
            loadingLabel="Redirecting..."
            buttonLabel="Get access"
            onClick={() => handleCheckout("interview_prep")}
          />

          <div className="rounded-lg border border-teal-400/30 bg-gradient-to-br from-teal-400/12 via-white/[0.045] to-emerald-400/10 p-5 shadow-xl shadow-black/15 md:col-span-2">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <span className="rounded-full bg-teal-300 px-3 py-1 text-xs font-bold uppercase tracking-wide text-teal-950">
                  Best value
                </span>
                <h3 className="mt-4 text-2xl font-bold">Career Accelerator Bundle</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Get both the Career Starter Kit and Interview Prep Pack together. Save 14% and move from planning to applications faster.
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center md:flex-col">
                <div>
                  <span className="mr-2 text-sm text-muted-foreground line-through">$35.00</span>
                  <span className="text-3xl font-bold text-teal-200">$30.00</span>
                </div>
                <button
                  onClick={() => handleCheckout("bundle")}
                  disabled={loadingProduct === "bundle"}
                  className={productButtonClass}
                >
                  {loadingProduct === "bundle" && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loadingProduct === "bundle" ? "Redirecting..." : "Buy bundle"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function StageDetail({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof CheckCircle2;
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-background/35 p-4">
      <h4 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
        <Icon className="h-4 w-4 text-teal-300" />
        {label}
      </h4>
      <p className={clsx("text-sm leading-relaxed", accent ?? "text-foreground")}>{value}</p>
    </div>
  );
}

function ProductCard({
  badge,
  title,
  description,
  price,
  loading,
  loadingLabel,
  buttonLabel,
  onClick,
}: {
  badge: string;
  title: string;
  description: string;
  price: string;
  loading: boolean;
  loadingLabel: string;
  buttonLabel: string;
  onClick: () => void;
}) {
  return (
    <div className={hubCardClass}>
      <div className="flex h-full flex-col">
        <span className="w-fit rounded-full border border-teal-400/25 bg-teal-400/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-teal-200">
          {badge}
        </span>
        <h3 className="mt-4 text-xl font-bold">{title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
        <div className="mt-5 flex items-center justify-between gap-4 border-t border-white/10 pt-4">
          <span className="text-xl font-bold">{price}</span>
          <button onClick={onClick} disabled={loading} className={productButtonClass}>
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {loading ? loadingLabel : buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
