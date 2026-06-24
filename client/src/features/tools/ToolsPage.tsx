import { Link } from "wouter";
import { Microscope, ArrowRight } from "lucide-react";
import { TOOLS } from "./registry";
import { useSEO } from "@/hooks/use-seo";
import { useTranslation } from "react-i18next";

/**
 * /tools — a scannable index of the free interactive QC/QA tools. Each card
 * links to a focused standalone page (/tools/:slug) so a single tool is one
 * click away and individually shareable + indexable.
 */
export default function ToolsPage() {
  const { t } = useTranslation("sections");
  useSEO({ title: t("tools.seoTitle"), description: t("tools.seoDesc") });

  return (
    <div className="pb-24 pt-4 md:pt-8 max-w-6xl mx-auto px-4">
      <section className="mb-8 rounded-2xl border border-white/10 bg-card p-5 md:p-7 shadow-xl shadow-black/10">
        <div className="flex items-start gap-4">
          <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-primary/10 text-primary items-center justify-center">
            <Microscope className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">{t("tools.eyebrow")}</p>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">{t("tools.title")}</h1>
            <p className="text-muted-foreground max-w-3xl leading-relaxed">{t("tools.subtitle")}</p>
          </div>
        </div>
      </section>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="group flex flex-col rounded-2xl border border-white/10 bg-card p-5 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {tool.category}
                </span>
              </div>
              <h2 className="text-base font-bold mb-1.5 leading-snug">{tool.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">{tool.blurb}</p>
              <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:gap-2.5 transition-all">
                Open tool <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
