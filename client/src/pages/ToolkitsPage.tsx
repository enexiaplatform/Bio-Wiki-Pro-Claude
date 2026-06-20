import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Package, Crown, ArrowRight, Lock, CheckCircle2, Clock } from "lucide-react";
import { useSEO } from "@/hooks/use-seo";
import { JsonLd } from "@/components/JsonLd";
import { analytics } from "@/hooks/use-analytics";
import { useUser } from "@/context/UserContext";
import { toolkits } from "@/data/toolkits";

const PLACEMENT = "toolkits_index";

export default function ToolkitsPage() {
  useSEO({
    title: "Toolkits — checklists & templates for QC/QA",
    description:
      "Workflow checklists, templates, and downloadable toolkits for QC/QA and life-science teams — including the GMP Audit Survival Kit. Unlock every toolkit with Pro.",
  });
  const [, navigate] = useLocation();
  const { isPro } = useUser();

  function handleUnlock() {
    analytics.upgradePromptClicked(PLACEMENT);
    navigate("/pricing");
  }

  return (
    <div className="pb-24 pt-6 md:pt-10 max-w-5xl mx-auto px-4">
      <JsonLd
        id="toolkits-collection"
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "QC/QA Toolkits",
          description: "Workflow checklists, templates, and downloadable toolkits for QC/QA professionals.",
        }}
      />

      {/* ── HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }} className="mb-8 text-center"
      >
        <span className="inline-flex items-center gap-2 text-[11px] uppercase font-bold tracking-widest text-teal-400 bg-teal-400/10 px-3 py-1.5 rounded-full mb-5">
          <Package className="w-3 h-3" /> Toolkit Library
        </span>
        <h1 className="text-3xl md:text-4xl font-bold mb-3 font-display">
          Checklists & toolkits you actually use
        </h1>
        <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
          In-app workflow assets — not lead magnets. Download checklists, templates,
          and guides that map to the workflows you run. Pro unlocks every toolkit.
        </p>
      </motion.div>

      {/* ── PRO VALUE STRIP ── */}
      {!isPro && (
        <div className="mb-10 bg-gradient-to-r from-teal-500/10 via-emerald-500/5 to-transparent border border-teal-500/20 rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div className="flex items-start gap-3">
            <Crown className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm mb-0.5">Pro unlocks every toolkit</p>
              <p className="text-xs text-muted-foreground">
                The GMP Audit Survival Kit plus all workflow checklists and templates — $8/mo, cancel anytime.
              </p>
            </div>
          </div>
          <button
            onClick={handleUnlock}
            className="shrink-0 inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-teal-950 font-bold px-5 py-2.5 rounded-xl transition-all whitespace-nowrap"
          >
            View Pro <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── TOOLKIT GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {toolkits.map((tk, i) => {
          const isAvailable = tk.status === "available";
          return (
            <motion.div
              key={tk.slug}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.4, delay: (i % 3) * 0.06 }}
              className={`bg-card border rounded-2xl p-5 flex flex-col ${
                isAvailable ? "border-teal-500/20" : "border-white/5"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-teal-400" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    tk.accessTier === "pro" ? "text-amber-400 bg-amber-400/10" : "text-emerald-400 bg-emerald-400/10"
                  }`}>
                    {tk.accessTier === "pro" ? "Pro" : "Free"}
                  </span>
                  {!isAvailable && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-white/5 px-2 py-0.5 rounded">
                      <Clock className="w-3 h-3" /> Soon
                    </span>
                  )}
                </div>
              </div>

              <h2 className="font-bold text-base mb-1">{tk.title}</h2>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">{tk.problemSolved}</p>

              <dl className="text-[11px] text-muted-foreground space-y-1 mb-4">
                <div className="flex gap-1.5">
                  <dt className="font-semibold text-foreground/70">For:</dt>
                  <dd>{tk.audience}</dd>
                </div>
                <div className="flex gap-1.5">
                  <dt className="font-semibold text-foreground/70">Format:</dt>
                  <dd>{tk.format}</dd>
                </div>
              </dl>

              <div className="mt-auto">
                {isAvailable && tk.href ? (
                  <Link
                    href={tk.href}
                    className="w-full inline-flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 text-teal-950 font-bold py-2.5 rounded-xl text-sm transition-all"
                  >
                    {isPro ? <CheckCircle2 className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                    {isPro ? "Open kit" : "View kit"}
                  </Link>
                ) : tk.accessTier === "pro" ? (
                  <button
                    onClick={handleUnlock}
                    className="w-full inline-flex items-center justify-center gap-2 border border-teal-500/30 text-teal-400 hover:bg-teal-500/10 font-semibold py-2.5 rounded-xl text-sm transition-all"
                  >
                    <Lock className="w-3.5 h-3.5" /> Unlock with Pro
                  </button>
                ) : (
                  <span className="w-full inline-flex items-center justify-center gap-2 border border-white/10 text-muted-foreground font-semibold py-2.5 rounded-xl text-sm">
                    <Clock className="w-3.5 h-3.5" /> Coming soon
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <p className="text-center text-xs text-muted-foreground mt-10">
        Every toolkit here is a real, downloadable Pro resource — no fake downloads. New toolkits are added as they ship.
      </p>
    </div>
  );
}
