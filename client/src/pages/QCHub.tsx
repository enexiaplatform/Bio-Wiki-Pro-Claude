import { useState } from "react";
import { useAcademyTerms } from "@/hooks/use-data";
import { Search, Clock, ChevronRight, BookOpen, FlaskConical, Microscope, Bug, Thermometer } from "lucide-react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import clsx from "clsx";
import { useSEO } from "@/hooks/use-seo";
import { useTranslation } from "react-i18next";
import { LeadMagnetBanner } from "@/components/LeadMagnetBanner";
import { analytics } from "@/hooks/use-analytics";

const workflows = [
  { name: "Sterility Testing", icon: FlaskConical, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", desc: "Membrane filtration & direct inoculation" },
  { name: "Environmental Monitoring", icon: Thermometer, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", desc: "Settle plates, air sampling & surface swabs" },
  { name: "Bioburden", icon: Bug, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", desc: "Microbial limits per USP <61>" },
  { name: "Endotoxin", icon: Microscope, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", desc: "LAL kinetic turbidimetric & gel-clot" },
];

export default function QCHub() {
  const { t } = useTranslation("sections");
  useSEO({ title: t("qcHub.seoTitle"), description: t("qcHub.seoDesc") });
  const { data: terms, isLoading } = useAcademyTerms();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const qcTerms = terms?.filter(t => t.mode === "QC") || [];
  const categories = ["All", ...Array.from(new Set(qcTerms.map(t => t.category)))];

  const filteredTerms = qcTerms.filter(term => {
    const matchesSearch = term.title.toLowerCase().includes(search.toLowerCase()) ||
                          term.summary.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || term.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="pb-24 pt-4 md:pt-8 max-w-5xl mx-auto px-4">
      <LeadMagnetBanner />
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{t("qcHub.title")}</h1>
        <p className="text-muted-foreground">{t("qcHub.subtitle")}</p>
        <div className="flex gap-3 mt-3">
          <span className="text-[11px] bg-white/5 border border-white/10 px-2.5 py-1 rounded-md text-muted-foreground" data-testid="stat-topics">{t("qcHub.topics")}: {qcTerms.length}</span>
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-lg font-bold mb-4">{t("qcHub.quickWorkflows")}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {workflows.map(wf => (
            <div
              key={wf.name}
              onClick={() => analytics.workflowClicked(wf.name)}
              className={clsx("bg-card border rounded-2xl p-4 cursor-pointer hover:border-primary/30 transition-colors", wf.border)}
              data-testid={`card-workflow-${wf.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center mb-3", wf.bg, wf.color)}>
                <wf.icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold mb-1">{wf.name}</h3>
              <p className="text-[11px] text-muted-foreground leading-snug">{wf.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 mb-8 sticky top-[60px] md:top-24 z-30 bg-background/95 backdrop-blur-xl py-2 -mx-4 px-4 border-b border-white/5 md:border-none md:bg-transparent md:static md:p-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder={t("qcHub.search")}
            className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (e.target.value.length > 2) analytics.searchPerformed(e.target.value, "qc_hub", filteredTerms.length);
            }}
            data-testid="input-search-qc"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              data-testid={`button-qc-category-${cat.toLowerCase().replace(/\s+/g, '-')}`}
              className={clsx(
                "px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border",
                selectedCategory === cat
                  ? "bg-primary text-white border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/50"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-40 bg-card/50 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTerms.map((term) => (
            <Dialog key={term.id}>
              <DialogTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-card border border-white/5 rounded-2xl p-5 cursor-pointer hover:border-primary/30 transition-colors group relative overflow-hidden"
                  data-testid={`card-qc-topic-${term.id}`}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-primary/10 transition-colors" />
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded-md">
                        {term.category}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-medium bg-white/5 px-2 py-1 rounded text-muted-foreground">
                          {term.difficulty}
                        </span>
                        <div className="flex items-center gap-1 text-muted-foreground text-[10px] bg-white/5 px-2 py-1 rounded">
                          <Clock className="w-3 h-3" />
                          <span>{term.readTimeMin} min</span>
                        </div>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{term.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{term.summary}</p>
                    <div className="flex items-center gap-2 mt-auto">
                      {term.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-muted-foreground">
                          #{tag}
                        </span>
                      ))}
                      <div className="ml-auto w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-card border-white/10 text-foreground p-0 overflow-hidden sm:rounded-2xl">
                <div className="max-h-[85vh] overflow-y-auto">
                  <div className="p-6 md:p-8">
                    <div className="flex items-center gap-2 text-primary mb-4">
                      <BookOpen className="w-5 h-5" />
                      <span className="text-sm font-bold uppercase tracking-widest">{term.category}</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">{term.title}</h2>
                    <div className="space-y-8">
                      <div className="bg-white/5 rounded-xl p-5 border border-white/5">
                        <h4 className="text-lg font-bold mb-2">Summary</h4>
                        <p className="text-muted-foreground leading-relaxed">{term.summary}</p>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-lg font-bold mb-3 text-blue-400">Why It Matters</h4>
                          <div className="text-sm text-muted-foreground leading-relaxed bg-blue-500/5 border border-blue-500/20 p-4 rounded-xl">
                            {typeof term.whyItMatters === "string" && term.whyItMatters.includes(". ") ? (
                              <ul className="space-y-2">
                                {term.whyItMatters.split(". ").map((point, i) => (
                                  <li key={i} className="flex gap-2 items-start">
                                    <span className="text-blue-400 font-bold">*</span>
                                    <span>{point}{i < term.whyItMatters.split(". ").length - 1 ? "." : ""}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p>{term.whyItMatters}</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-lg font-bold mb-3 text-red-400">Common Mistakes</h4>
                          <ul className="space-y-2">
                            {term.commonMistakes.map((mistake, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex gap-2 items-start bg-red-500/5 border border-red-500/10 p-3 rounded-lg">
                                <span className="text-red-500 font-bold">*</span>
                                {mistake}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-4 border-t border-white/10">
                        {term.tags.map(tag => (
                          <span key={tag} className="px-3 py-1 rounded-full bg-secondary text-xs font-medium text-secondary-foreground">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      )}

      {!isLoading && filteredTerms.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <FlaskConical className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">{t("qcHub.empty")}</p>
          <p className="text-sm mt-1">{t("qcHub.emptyHint")}</p>
        </div>
      )}
    </div>
  );
}
