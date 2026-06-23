import { Microscope } from "lucide-react";
import { AuditReadinessScorecard } from "./AuditReadinessScorecard";
import { WaterTypeSelector } from "./WaterTypeSelector";
import { MediaSelectionHelper } from "./MediaSelectionHelper";
import { SterilityMethodSelector } from "./SterilityMethodSelector";
import { OosDecisionTree } from "./OosDecisionTree";
import { CCSBuilderLite } from "./CCSBuilderLite";
import { InvestigationTemplatePage } from "./InvestigationTemplatePage";
import { ScenarioDecisionTree } from "./ScenarioDecisionTree";
import { useSEO } from "@/hooks/use-seo";
import { useTranslation } from "react-i18next";

// Jump-to index so the right tool is one click away (the page is a long stack).
const TOOL_INDEX = [
  { id: "tool-audit-readiness", label: "Audit Readiness Scorecard" },
  { id: "tool-water-selector", label: "Lab Water Type Selector" },
  { id: "tool-media-helper", label: "Culture Media Selection Helper" },
  { id: "tool-sterility-method", label: "Sterility Test Method Selector" },
  { id: "tool-oos-tree", label: "OOS Investigation Decision Tree" },
  { id: "tool-em-scenarios", label: "EM Scenario Decision Tree" },
  { id: "tool-ccs-builder", label: "CCS Builder Lite" },
  { id: "tool-investigation-template", label: "Investigation Template Viewer" },
];

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

      {/* Jump-to index */}
      <nav aria-label="Tools" className="mb-6 flex flex-wrap gap-2">
        {TOOL_INDEX.map((tool) => (
          <a
            key={tool.id}
            href={`#${tool.id}`}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
          >
            {tool.label}
          </a>
        ))}
      </nav>

      <div className="space-y-6">
        <div id="tool-audit-readiness" className="scroll-mt-20"><AuditReadinessScorecard /></div>
        <div id="tool-water-selector" className="scroll-mt-20"><WaterTypeSelector /></div>
        <div id="tool-media-helper" className="scroll-mt-20"><MediaSelectionHelper /></div>
        <div id="tool-sterility-method" className="scroll-mt-20"><SterilityMethodSelector /></div>
        <div id="tool-oos-tree" className="scroll-mt-20"><OosDecisionTree /></div>
        <div id="tool-em-scenarios" className="scroll-mt-20"><ScenarioDecisionTree /></div>
        <div id="tool-ccs-builder" className="scroll-mt-20"><CCSBuilderLite /></div>
        <div id="tool-investigation-template" className="scroll-mt-20"><InvestigationTemplatePage /></div>
      </div>
    </div>
  );
}
