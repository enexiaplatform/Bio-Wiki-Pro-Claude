import type { ReactNode } from "react";
import {
  ClipboardCheck,
  Droplets,
  FlaskRound,
  ShieldCheck,
  FlaskConical,
  Sparkles,
  Gauge,
  GitBranch,
  Wind,
  Layers,
  ClipboardList,
  Bug,
  Flame,
  Sigma,
  Beaker,
  type LucideIcon,
} from "lucide-react";
import { TOOL_CATALOG, type ToolMeta } from "@/data/tools/catalog";
import { AuditReadinessScorecard } from "./AuditReadinessScorecard";
import { WaterTypeSelector } from "./WaterTypeSelector";
import { MediaSelectionHelper } from "./MediaSelectionHelper";
import { SterilityMethodSelector } from "./SterilityMethodSelector";
import { EndotoxinLimitCalculator } from "./EndotoxinLimitCalculator";
import { CleaningValidationCalculator } from "./CleaningValidationCalculator";
import { ProcessCapabilityCalculator } from "./ProcessCapabilityCalculator";
import { OosDecisionTree } from "./OosDecisionTree";
import { CCSBuilderLite } from "./CCSBuilderLite";
import { InvestigationTemplatePage } from "./InvestigationTemplatePage";
import { ScenarioDecisionTree } from "./ScenarioDecisionTree";
import { MicrobialCountCalculator } from "./MicrobialCountCalculator";
import { SterilizationF0Calculator } from "./SterilizationF0Calculator";
import { SystemSuitabilityCalculator } from "./SystemSuitabilityCalculator";
import { DilutionCalculator } from "./DilutionCalculator";

export interface ToolDef extends ToolMeta {
  icon: LucideIcon;
  /** The interactive tool itself. */
  element: ReactNode;
}

// The icon + interactive element for each catalog slug. Metadata (title, blurb,
// description, category) lives in @/data/tools/catalog so content pages can link
// to tools without importing these components.
const VISUALS: Record<string, { icon: LucideIcon; element: ReactNode }> = {
  "audit-readiness-scorecard": { icon: ClipboardCheck, element: <AuditReadinessScorecard /> },
  "lab-water-type-selector": { icon: Droplets, element: <WaterTypeSelector /> },
  "culture-media-selection-helper": { icon: FlaskRound, element: <MediaSelectionHelper /> },
  "sterility-test-method-selector": { icon: ShieldCheck, element: <SterilityMethodSelector /> },
  "microbial-count-calculator": { icon: Bug, element: <MicrobialCountCalculator /> },
  "sterilization-f0-calculator": { icon: Flame, element: <SterilizationF0Calculator /> },
  "endotoxin-limit-calculator": { icon: FlaskConical, element: <EndotoxinLimitCalculator /> },
  "cleaning-validation-maco-calculator": { icon: Sparkles, element: <CleaningValidationCalculator /> },
  "process-capability-calculator": { icon: Gauge, element: <ProcessCapabilityCalculator /> },
  "system-suitability-calculator": { icon: Sigma, element: <SystemSuitabilityCalculator /> },
  "dilution-calculator": { icon: Beaker, element: <DilutionCalculator /> },
  "oos-investigation-decision-tree": { icon: GitBranch, element: <OosDecisionTree /> },
  "em-scenario-decision-tree": { icon: Wind, element: <ScenarioDecisionTree /> },
  "contamination-control-strategy-builder": { icon: Layers, element: <CCSBuilderLite /> },
  "investigation-template-viewer": { icon: ClipboardList, element: <InvestigationTemplatePage /> },
};

// Single source of truth for the /tools index and the /tools/:slug pages.
export const TOOLS: ToolDef[] = TOOL_CATALOG.map((m) => ({ ...m, ...VISUALS[m.slug] }));

export function getToolBySlug(slug: string): ToolDef | undefined {
  return TOOLS.find((t) => t.slug === slug);
}
