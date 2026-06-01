import { Microscope } from "lucide-react";
import { CCSBuilderLite } from "./CCSBuilderLite";
import { InvestigationTemplatePage } from "./InvestigationTemplatePage";
import { ScenarioDecisionTree } from "./ScenarioDecisionTree";
import { useSEO } from "@/hooks/use-seo";
import { useTranslation } from "react-i18next";

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
            <p className="text-muted-foreground max-w-3xl leading-relaxed">
              {t("tools.subtitle")}
            </p>
          </div>
        </div>
      </section>

      <div className="space-y-6">
        <ScenarioDecisionTree />
        <CCSBuilderLite />
        <InvestigationTemplatePage />
      </div>
    </div>
  );
}
