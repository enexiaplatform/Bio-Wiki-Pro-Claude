import { lazy, type ComponentType, type LazyExoticComponent } from "react";
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
  Activity,
  Wrench,
  Filter,
  UserCheck,
  TestTubeDiagonal,
  Dna,
  Biohazard,
  type LucideIcon,
} from "lucide-react";
import { TOOL_CATALOG, type ToolMeta } from "@/data/tools/catalog";

export interface ToolDef extends ToolMeta {
  icon: LucideIcon;
  /** The interactive tool itself, loaded only on its standalone page. */
  Component: LazyExoticComponent<ComponentType>;
}

// The icon + lazy component for each catalog slug. Metadata (title, blurb,
// description, category) lives in @/data/tools/catalog so content pages can link
// to tools without importing the full interactive tool bundle.
const VISUALS: Record<string, { icon: LucideIcon; Component: LazyExoticComponent<ComponentType> }> = {
  "audit-readiness-scorecard": {
    icon: ClipboardCheck,
    Component: lazy(() => import("./AuditReadinessScorecard").then((m) => ({ default: m.AuditReadinessScorecard }))),
  },
  "lab-water-type-selector": {
    icon: Droplets,
    Component: lazy(() => import("./WaterTypeSelector").then((m) => ({ default: m.WaterTypeSelector }))),
  },
  "culture-media-selection-helper": {
    icon: FlaskRound,
    Component: lazy(() => import("./MediaSelectionHelper").then((m) => ({ default: m.MediaSelectionHelper }))),
  },
  "sterility-test-method-selector": {
    icon: ShieldCheck,
    Component: lazy(() => import("./SterilityMethodSelector").then((m) => ({ default: m.SterilityMethodSelector }))),
  },
  "sterile-filtration-readiness-planner": {
    icon: Filter,
    Component: lazy(() => import("./SterileFiltrationReadinessPlanner").then((m) => ({ default: m.SterileFiltrationReadinessPlanner }))),
  },
  "gowning-qualification-readiness-planner": {
    icon: UserCheck,
    Component: lazy(() => import("./GowningQualificationReadinessPlanner").then((m) => ({ default: m.GowningQualificationReadinessPlanner }))),
  },
  "media-fill-aps-readiness-planner": {
    icon: TestTubeDiagonal,
    Component: lazy(() => import("./MediaFillReadinessPlanner").then((m) => ({ default: m.MediaFillReadinessPlanner }))),
  },
  "microbial-count-calculator": {
    icon: Bug,
    Component: lazy(() => import("./MicrobialCountCalculator").then((m) => ({ default: m.MicrobialCountCalculator }))),
  },
  "sterilization-f0-calculator": {
    icon: Flame,
    Component: lazy(() => import("./SterilizationF0Calculator").then((m) => ({ default: m.SterilizationF0Calculator }))),
  },
  "endotoxin-limit-calculator": {
    icon: FlaskConical,
    Component: lazy(() => import("./EndotoxinLimitCalculator").then((m) => ({ default: m.EndotoxinLimitCalculator }))),
  },
  "cleaning-validation-maco-calculator": {
    icon: Sparkles,
    Component: lazy(() => import("./CleaningValidationCalculator").then((m) => ({ default: m.CleaningValidationCalculator }))),
  },
  "process-capability-calculator": {
    icon: Gauge,
    Component: lazy(() => import("./ProcessCapabilityCalculator").then((m) => ({ default: m.ProcessCapabilityCalculator }))),
  },
  "equipment-qualification-readiness-planner": {
    icon: Wrench,
    Component: lazy(() => import("./EquipmentQualificationReadinessPlanner").then((m) => ({ default: m.EquipmentQualificationReadinessPlanner }))),
  },
  "system-suitability-calculator": {
    icon: Sigma,
    Component: lazy(() => import("./SystemSuitabilityCalculator").then((m) => ({ default: m.SystemSuitabilityCalculator }))),
  },
  "dilution-calculator": {
    icon: Beaker,
    Component: lazy(() => import("./DilutionCalculator").then((m) => ({ default: m.DilutionCalculator }))),
  },
  "dissolution-acceptance-checker": {
    icon: Beaker,
    Component: lazy(() => import("./DissolutionAcceptanceChecker").then((m) => ({ default: m.DissolutionAcceptanceChecker }))),
  },
  "stability-trend-shelf-life-planner": {
    icon: Activity,
    Component: lazy(() => import("./StabilityTrendShelfLifePlanner").then((m) => ({ default: m.StabilityTrendShelfLifePlanner }))),
  },
  "cell-based-potency-readiness-planner": {
    icon: Activity,
    Component: lazy(() => import("./CellBasedPotencyReadinessPlanner").then((m) => ({ default: m.CellBasedPotencyReadinessPlanner }))),
  },
  "hcp-testing-readiness-planner": {
    icon: Dna,
    Component: lazy(() => import("./HcpTestingReadinessPlanner").then((m) => ({ default: m.HcpTestingReadinessPlanner }))),
  },
  "viral-safety-readiness-planner": {
    icon: Biohazard,
    Component: lazy(() => import("./ViralSafetyReadinessPlanner").then((m) => ({ default: m.ViralSafetyReadinessPlanner }))),
  },
  "oot-trend-triage-planner": {
    icon: Activity,
    Component: lazy(() => import("./OotTrendTriagePlanner").then((m) => ({ default: m.OotTrendTriagePlanner }))),
  },
  "audit-trail-review-triage": {
    icon: ClipboardList,
    Component: lazy(() => import("./AuditTrailReviewTriage").then((m) => ({ default: m.AuditTrailReviewTriage }))),
  },
  "batch-release-readiness-checklist": {
    icon: ClipboardCheck,
    Component: lazy(() => import("./BatchReleaseReadinessChecklist").then((m) => ({ default: m.BatchReleaseReadinessChecklist }))),
  },
  "change-control-impact-triage": {
    icon: GitBranch,
    Component: lazy(() => import("./ChangeControlImpactTriage").then((m) => ({ default: m.ChangeControlImpactTriage }))),
  },
  "supplier-qualification-risk-triage": {
    icon: ShieldCheck,
    Component: lazy(() => import("./SupplierQualificationRiskTriage").then((m) => ({ default: m.SupplierQualificationRiskTriage }))),
  },
  "oos-investigation-decision-tree": {
    icon: GitBranch,
    Component: lazy(() => import("./OosDecisionTree").then((m) => ({ default: m.OosDecisionTree }))),
  },
  "em-scenario-decision-tree": {
    icon: Wind,
    Component: lazy(() => import("./ScenarioDecisionTree").then((m) => ({ default: m.ScenarioDecisionTree }))),
  },
  "contamination-control-strategy-builder": {
    icon: Layers,
    Component: lazy(() => import("./CCSBuilderLite").then((m) => ({ default: m.CCSBuilderLite }))),
  },
  "investigation-template-viewer": {
    icon: ClipboardList,
    Component: lazy(() => import("./InvestigationTemplatePage").then((m) => ({ default: m.InvestigationTemplatePage }))),
  },
  "capa-effectiveness-check-planner": {
    icon: ClipboardCheck,
    Component: lazy(() => import("./CapaEffectivenessPlanner").then((m) => ({ default: m.CapaEffectivenessPlanner }))),
  },
};

// Single source of truth for the /tools index and the /tools/:slug pages.
export const TOOLS: ToolDef[] = TOOL_CATALOG.map((m) => ({ ...m, ...VISUALS[m.slug] }));

export function getToolBySlug(slug: string): ToolDef | undefined {
  return TOOLS.find((t) => t.slug === slug);
}
