import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { CheckCircle2, ChevronRight, Briefcase, DollarSign, Building, AlertCircle, ShoppingBag, BookOpen, Loader2 } from "lucide-react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/context/UserContext";
import { useSEO } from "@/hooks/use-seo";

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

const roles = [
  "QC Microbiologist",
  "QA Specialist",
  "Technical Sales",
  "Regulatory Affairs"
] as const;

type Role = typeof roles[number];
type SkillState = "Have it" | "Partially" | "Need it";

const careerData: Record<Role, {
  stages: { label: string; years: string; responsibilities: string; skills: string; salary: string; employers: string }[];
  skills: { id: string; name: string; link: string }[];
}> = {
  "QC Microbiologist": {
    stages: [
      { label: "QC Analyst", years: "0-2 yr", responsibilities: "Perform routine microbial limit tests, environmental monitoring, and water testing according to SOPs. Document GMP data exactly as observed.", skills: "Aseptic technique, Media prep, Basic GMP", salary: "10,000,000 - 15,000,000 VND", employers: "Sanofi, DHG Pharma, Imexpharm" },
      { label: "Senior QC", years: "2-5 yr", responsibilities: "Review analyst data, perform method validations, investigate OOS results, and draft straightforward deviations.", skills: "OOS Investigation, Method Validation, Advanced Microbiology", salary: "16,000,000 - 25,000,000 VND", employers: "Moderna, FPT Long Chau QC, Medochemie" },
      { label: "QC Manager", years: "5-8 yr", responsibilities: "Manage lab operations, budget, and team scheduling. Interface with QA and operations. Defend methods during regulatory audits.", skills: "Leadership, QMS compliance, Audit defense", salary: "30,000,000 - 45,000,000 VND", employers: "B.Braun, Zuellig Pharma, Vimedimex" },
      { label: "QA Director", years: "8+ yr", responsibilities: "Oversee site-wide quality strategy, regulatory compliance, host international audits, and represent quality on the executive leadership team.", skills: "Strategic planning, Cross-functional leadership, Global regulations", salary: "60,000,000 - 90,000,000+ VND", employers: "Top tier MNCs and large domestic Pharma" }
    ],
    skills: [
      { id: "qc_s1", name: "Sterility testing", link: "/academy/sterility-testing-membrane-filtration" },
      { id: "qc_s2", name: "Environmental monitoring", link: "/academy/environmental-monitoring-overview" },
      { id: "qc_s3", name: "Endotoxin testing", link: "/academy/endotoxin-lal-testing" },
      { id: "qc_s4", name: "Microbial Limit Tests", link: "/academy/microbial-limit-test" },
      { id: "qc_s5", name: "Water microbiology", link: "/academy/purified-water-microbiology-testing" },
      { id: "qc_s6", name: "GMP documentation", link: "#" },
      { id: "qc_s7", name: "Contamination Control Strategy", link: "/academy/contamination-control-strategy" },
      { id: "qc_s8", name: "Cleanroom classification", link: "/academy/environmental-monitoring-cleanroom-classification" }
    ]
  },
  "QA Specialist": {
    stages: [
      { label: "QA Associate", years: "0-2 yr", responsibilities: "Document issuance and review (BMRs, SOPs), logbook management, and basic shop-floor oversight.", skills: "GMP Documentation, Attention to Detail", salary: "10,000,000 - 15,000,000 VND", employers: "Pharma/Device Manufacturers" },
      { label: "QA Specialist", years: "2-5 yr", responsibilities: "Manage deviations, CAPAs, change controls. Perform root cause analysis and participate in internal audits.", skills: "Root Cause Analysis, QMS Systems", salary: "16,000,000 - 28,000,000 VND", employers: "Pharma/Device Manufacturers" },
      { label: "QA Manager", years: "5-8 yr", responsibilities: "Lead QA operations, oversee the QMS, prepare for external audits, manage site compliance.", skills: "Auditing, Leadership, QRM", salary: "35,000,000 - 50,000,000 VND", employers: "Pharma/Device Manufacturers" },
      { label: "Head of Quality", years: "8+ yr", responsibilities: "Total quality oversight, final batch release approval (QP role equivalent), enterprise quality strategy.", skills: "Executive Leadership, Global GMP", salary: "60,000,000 - 100,000,000+ VND", employers: "Pharma/Device Manufacturers" }
    ],
    skills: [
      { id: "qa_s1", name: "Deviation Management", link: "#" },
      { id: "qa_s2", name: "CAPA / Root Cause Analysis", link: "#" },
      { id: "qa_s3", name: "Change Control", link: "#" },
      { id: "qa_s4", name: "Internal Auditing", link: "#" },
      { id: "qa_s5", name: "Quality Risk Management (ICH Q9)", link: "#" },
      { id: "qa_s6", name: "Validation Master Plan", link: "#" }
    ]
  },
  "Technical Sales": {
    stages: [
      { label: "Sales Executive", years: "0-2 yr", responsibilities: "Lead generation, CRM entry, basic product demonstrations, responding to quote requests.", skills: "Communication, CRM, Resilience", salary: "12,000,000 - 20,000,000 VND + Commission", employers: "Distributors (DKSH, Sibelco, etc.)" },
      { label: "Technical Sales Rep", years: "2-5 yr", responsibilities: "Manage key accounts, provide technical advising, negotiate contracts, and hit quarterly quotas.", skills: "Negotiation, Deep Product Knowledge", salary: "20,000,000 - 35,000,000 VND + Commission", employers: "Distributors & Manufacturers" },
      { label: "Sales Manager", years: "4-7 yr", responsibilities: "Lead a regional sales team, develop go-to-market strategies, and manage principal supplier relationships.", skills: "Strategy, Coaching, Forecasting", salary: "40,000,000 - 60,000,000 VND + Bonus", employers: "Distributors & Manufacturers" },
      { label: "Country Sales Manager", years: "7+ yr", responsibilities: "Total national P&L responsibility, high-level business development, expansion strategy.", skills: "Executive Strategy, Financial Acumen", salary: "70,000,000 - 120,000,000+ VND", employers: "Major MNCs (Merck, Thermo Fisher)" }
    ],
    skills: [
      { id: "ts_s1", name: "B2B Sales Techniques", link: "#" },
      { id: "ts_s2", name: "Laboratory Equipment Knowledge", link: "#" },
      { id: "ts_s3", name: "Negotiation Strategies", link: "#" },
      { id: "ts_s4", name: "CRM Management", link: "#" },
      { id: "ts_s5", name: "Public Speaking & Demos", link: "#" }
    ]
  },
  "Regulatory Affairs": {
    stages: [
      { label: "RA Associate", years: "0-2 yr", responsibilities: "Assist in preparing dossiers, translating documents, tracking submission status, and answering simple queries.", skills: "Dossier Formatting, Translation, Organization", salary: "12,000,000 - 18,000,000 VND", employers: "MNCs / Consulting Firms" },
      { label: "RA Specialist", years: "2-5 yr", responsibilities: "Compile full registration dossiers (ACTD/CTD), manage variations, liaise directly with DAV, manage product lifecycle.", skills: "ACTD/CTD, DAV Regulations", salary: "20,000,000 - 35,000,000 VND", employers: "MNCs / Local Pharma" },
      { label: "RA Manager", years: "5-8 yr", responsibilities: "Set regulatory strategy for new launches, manage team, handle complex regulatory authority negotiations.", skills: "Strategic Thinking, Agency Relationships", salary: "40,000,000 - 60,000,000 VND", employers: "MNCs / Local Pharma" },
      { label: "Head of Regulatory", years: "8+ yr", responsibilities: "Define regional policy influence, oversee all regulatory compliance, integrate RA into business strategy.", skills: "Policy Influence, Regulatory Intelligence", salary: "60,000,000 - 100,000,000 VND", employers: "Top MNCs" }
    ],
    skills: [
      { id: "ra_s1", name: "ACTD / ICH CTD Compilation", link: "#" },
      { id: "ra_s2", name: "Vietnam DAV Regulations", link: "#" },
      { id: "ra_s3", name: "Product Variation Management", link: "#" },
      { id: "ra_s4", name: "Labeling Regulations", link: "#" },
      { id: "ra_s5", name: "Advertising Approval", link: "#" }
    ]
  }
};

export default function Career() {
  useSEO({
    title: "Career — Lộ trình thăng tiến QC/QA Pharma",
    description: "Roadmap nghề nghiệp từ QC Microbiologist lên QA Manager: skill map, salary guide, và Career Starter Kit cho Pharma & Life Science Vietnam.",
  });
  const [activeRole, setActiveRole] = useState<Role>("QC Microbiologist");
  const [activeStageIdx, setActiveStageIdx] = useState(0);
  const [skillStates, setSkillStates] = useState<Record<string, SkillState>>({});
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

  const handleRoleChange = (role: Role) => {
    setActiveRole(role);
    setActiveStageIdx(0);
  };

  const handleSkillChange = (skillId: string, state: SkillState) => {
    setSkillStates(prev => ({ ...prev, [skillId]: state }));
  };

  const activeData = careerData[activeRole];
  const activeStageDetails = activeData.stages[activeStageIdx];

  // Calculate Progress
  const totalSkills = activeData.skills.length;
  const metrics = useMemo(() => {
    let have = 0, partial = 0, need = 0;
    activeData.skills.forEach(s => {
      const state = skillStates[s.id];
      if (state === "Have it") have++;
      if (state === "Partially") partial++;
      if (state === "Need it") need++;
    });
    return { have, partial, need };
  }, [skillStates, activeData.skills]);

  return (
    <div className="pb-24 pt-4 md:pt-8 max-w-5xl mx-auto px-4">
      {/* HEADER SECTION */}
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl md:text-5xl font-bold mb-4 font-display text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">Career Hub</h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Chart your career pathway. Analyze your skill gaps. Download the resources you need to get hired.
        </p>
      </div>

      {/* 1. ROLE TABS */}
      <div className="mb-8 overflow-x-auto scrollbar-hide flex gap-3 pb-2">
        {roles.map(role => (
          <button
            key={role}
            onClick={() => handleRoleChange(role)}
            className={clsx(
              "px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap border transition-all duration-300",
              activeRole === role
                ? "bg-teal-500/10 text-teal-400 border-teal-500/50 shadow-[0_0_15px_rgba(20,184,166,0.2)]"
                : "bg-card text-muted-foreground border-white/5 hover:border-white/20 hover:text-foreground"
            )}
          >
            {role}
          </button>
        ))}
      </div>

      {/* 2. CAREER PATHWAY */}
      <div className="mb-12 bg-card rounded-2xl border border-white/5 p-6 md:p-8">
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <Briefcase className="w-5 h-5 mr-2 text-teal-400" />
          Career Pathway
        </h2>
        
        {/* Horizontal Roadmap */}
        <div className="relative flex justify-between items-center mb-10 overflow-x-auto scrollbar-hide py-4 px-2 min-w-[600px] md:min-w-0">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 -translate-y-1/2 z-0" />
          
          {activeData.stages.map((stage, idx) => {
            const isActive = idx === activeStageIdx;
            return (
              <button
                key={stage.label}
                onClick={() => setActiveStageIdx(idx)}
                className="relative z-10 flex flex-col items-center group"
              >
                <div className={clsx(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 mb-3",
                  isActive 
                    ? "bg-teal-500/20 border-teal-400 text-teal-400 shadow-[0_0_20px_rgba(20,184,166,0.3)]"
                    : "bg-background border-white/20 text-muted-foreground group-hover:border-teal-400/50 group-hover:text-teal-400"
                )}>
                  {idx + 1}
                </div>
                <span className={clsx("text-sm font-bold", isActive ? "text-foreground" : "text-muted-foreground")}>{stage.label}</span>
                <span className="text-xs text-muted-foreground bg-white/5 px-2 py-0.5 rounded mt-1">{stage.years}</span>
              </button>
            );
          })}
        </div>

        {/* Stage Details */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStageIdx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="bg-white/5 border border-white/5 p-5 rounded-xl">
              <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2 text-teal-400" />
                Responsibilities
              </h4>
              <p className="text-sm leading-relaxed">{activeStageDetails.responsibilities}</p>
            </div>
            
            <div className="bg-white/5 border border-white/5 p-5 rounded-xl">
              <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center">
                <BookOpen className="w-4 h-4 mr-2 text-blue-400" />
                Key Skills Needed
              </h4>
              <p className="text-sm font-medium">{activeStageDetails.skills}</p>
            </div>
            
            <div className="bg-white/5 border border-white/5 p-5 rounded-xl">
              <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center">
                <DollarSign className="w-4 h-4 mr-2 text-green-400" />
                Estimated Salary
              </h4>
              <p className="text-[15px] font-bold text-green-400">{activeStageDetails.salary}</p>
            </div>
            
            <div className="bg-white/5 border border-white/5 p-5 rounded-xl">
              <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center">
                <Building className="w-4 h-4 mr-2 text-amber-400" />
                Target Employers
              </h4>
              <p className="text-sm text-foreground">{activeStageDetails.employers}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 3. SKILL GAP ANALYZER */}
      <div className="mb-12 bg-card rounded-2xl border border-white/5 p-6 md:p-8">
        <h2 className="text-xl font-bold mb-2 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 text-primary" />
          Skill Gap Analyzer
        </h2>
        <p className="text-sm text-muted-foreground mb-6">Evaluate your competency. Click a skill to learn it in the Academy.</p>

        {/* Progress Bar */}
        <div className="bg-white/5 rounded-full h-3 w-full mb-8 flex overflow-hidden">
          {totalSkills > 0 && (
            <>
              <div style={{ width: `${(metrics.have / totalSkills) * 100}%` }} className="bg-green-500 h-full transition-all duration-500" />
              <div style={{ width: `${(metrics.partial / totalSkills) * 100}%` }} className="bg-amber-500 h-full transition-all duration-500" />
              <div style={{ width: `${(metrics.need / totalSkills) * 100}%` }} className="bg-red-500 h-full transition-all duration-500" />
            </>
          )}
        </div>

        {/* Skill List */}
        <div className="space-y-3">
          {activeData.skills.map((skill) => {
            const currentState = skillStates[skill.id] || "Need it"; // default to need it visually if unselected? Let's just leave unselected blank or allow null.
            const isUnselected = !skillStates[skill.id];

            return (
              <div key={skill.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-white/5 hover:border-white/10 transition-colors bg-white/5 gap-4">
                <Link href={skill.link.includes('coming soon') ? '#' : skill.link}>
                  <div className="flex items-center group cursor-pointer">
                    <span className="text-sm font-medium group-hover:text-teal-400 transition-colors">{skill.name}</span>
                    <ChevronRight className="w-4 h-4 mr-1 opacity-0 group-hover:opacity-100 text-teal-400 transition-all -translate-x-2 group-hover:translate-x-0" />
                  </div>
                </Link>
                
                <div className="flex items-center gap-1.5 self-start sm:self-auto bg-background p-1 rounded-md border border-white/5">
                  {(["Have it", "Partially", "Need it"] as SkillState[]).map(state => {
                    const isActive = skillStates[skill.id] === state;
                    return (
                      <button
                        key={state}
                        onClick={() => handleSkillChange(skill.id, state)}
                        className={clsx(
                          "px-3 py-1 rounded text-xs font-semibold transition-all",
                          isActive && state === "Have it" ? "bg-green-500 text-white" :
                          isActive && state === "Partially" ? "bg-amber-500 text-white" :
                          isActive && state === "Need it" ? "bg-red-500 text-white" :
                          "bg-transparent text-muted-foreground hover:bg-white/5"
                        )}
                      >
                        {state}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. DIGITAL PRODUCTS */}
      <div>
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <ShoppingBag className="w-5 h-5 mr-2 text-emerald-400" />
          Digital Products
        </h2>

        {checkoutError && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
            {checkoutError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1 */}
          <div className="bg-card border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex flex-col h-full">
              <span className="text-[10px] uppercase font-bold text-teal-400 bg-teal-400/10 px-2 py-1 rounded w-fit mb-3">Resource</span>
              <h3 className="text-xl font-bold mb-2">Career Starter Kit</h3>
              <p className="text-sm text-muted-foreground mb-6">Professional CV templates tailored for Pharma, plus a verified list of the top 20 biotech employers in Vietnam.</p>
              <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                <span className="text-lg font-bold text-foreground">$15.00</span>
                <button
                  onClick={() => handleCheckout("starter_kit")}
                  disabled={loadingProduct === "starter_kit"}
                  className="bg-white/10 hover:bg-teal-500 hover:text-white text-sm font-bold px-4 py-2 rounded-lg transition-all disabled:opacity-60 disabled:cursor-wait flex items-center gap-2"
                >
                  {loadingProduct === "starter_kit" && <Loader2 className="w-3 h-3 animate-spin" />}
                  {loadingProduct === "starter_kit" ? "Redirecting…" : "Get Access"}
                </button>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-card border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex flex-col h-full">
              <span className="text-[10px] uppercase font-bold text-teal-400 bg-teal-400/10 px-2 py-1 rounded w-fit mb-3">Prep Material</span>
              <h3 className="text-xl font-bold mb-2">Interview Prep Pack</h3>
              <p className="text-sm text-muted-foreground mb-6">Over 100 real technical and behavioral interview questions sourced directly from QC/QA hiring managers.</p>
              <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                <span className="text-lg font-bold text-foreground">$20.00</span>
                <button
                  onClick={() => handleCheckout("interview_prep")}
                  disabled={loadingProduct === "interview_prep"}
                  className="bg-white/10 hover:bg-teal-500 hover:text-white text-sm font-bold px-4 py-2 rounded-lg transition-all disabled:opacity-60 disabled:cursor-wait flex items-center gap-2"
                >
                  {loadingProduct === "interview_prep" && <Loader2 className="w-3 h-3 animate-spin" />}
                  {loadingProduct === "interview_prep" ? "Redirecting…" : "Get Access"}
                </button>
              </div>
            </div>
          </div>

          {/* Card 3 (Full Width) */}
          <div className="bg-card border border-teal-500/20 rounded-2xl p-6 relative overflow-hidden group md:col-span-2">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-emerald-500/5" />
            <div className="absolute right-0 top-0 w-64 h-64 bg-teal-400/10 blur-3xl rounded-full -mr-20 -mt-20 group-hover:bg-teal-400/20 transition-all" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="max-w-xl">
                <span className="text-[10px] uppercase font-bold text-teal-950 bg-teal-400 px-2 py-1 rounded w-fit mb-3 inline-block">Best Value</span>
                <h3 className="text-2xl font-bold mb-2">Career Accelerator Bundle</h3>
                <p className="text-sm text-muted-foreground">Get both the Career Starter Kit and Interview Prep Pack together. Save 14% and turbocharge your job hunt.</p>
              </div>
              <div className="flex flex-row md:flex-col items-center gap-4 min-w-32 shrink-0">
                <div className="text-center">
                  <span className="text-xs text-muted-foreground line-through mr-2">$35.00</span>
                  <span className="text-2xl font-bold text-teal-400">$30.00</span>
                </div>
                <button
                  onClick={() => handleCheckout("bundle")}
                  disabled={loadingProduct === "bundle"}
                  className="w-full bg-teal-500 hover:bg-teal-400 text-teal-950 text-sm font-bold px-6 py-3 rounded-lg transition-all shadow-lg shadow-teal-500/20 disabled:opacity-60 disabled:cursor-wait flex items-center justify-center gap-2"
                >
                  {loadingProduct === "bundle" && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loadingProduct === "bundle" ? "Redirecting…" : "Buy Bundle"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
