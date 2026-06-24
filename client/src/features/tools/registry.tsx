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
  type LucideIcon,
} from "lucide-react";
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

export interface ToolDef {
  /** Clean URL slug — /tools/<slug>. Keep in sync with the sitemap in server/routes.ts. */
  slug: string;
  /** H1 + SEO title base. */
  title: string;
  /** Topical group, shown as a chip on the index card. */
  category: string;
  /** Short teaser for the index card. */
  blurb: string;
  /** SEO meta description for the standalone page. */
  description: string;
  icon: LucideIcon;
  /** The interactive tool itself. */
  element: ReactNode;
}

// Single source of truth for the /tools index, the /tools/:slug pages, and the
// sitemap. Order here is the order shown on the index.
export const TOOLS: ToolDef[] = [
  {
    slug: "audit-readiness-scorecard",
    title: "GMP Audit Readiness Scorecard",
    category: "Quality systems",
    blurb: "Score your inspection readiness across six GMP areas and see your top gaps.",
    description:
      "Free GMP audit readiness self-assessment — rate your quality system across six areas and get a prioritized list of the gaps to close before an inspection.",
    icon: ClipboardCheck,
    element: <AuditReadinessScorecard />,
  },
  {
    slug: "lab-water-type-selector",
    title: "Lab Water Type Selector",
    category: "Microbiology",
    blurb: "Match your use case to the right pharmacopeial water grade and its controls.",
    description:
      "Free pharmaceutical water grade selector — pick your use case (Water for Injection, Purified Water, reagent grade) and see the key controls and pitfalls for each.",
    icon: Droplets,
    element: <WaterTypeSelector />,
  },
  {
    slug: "culture-media-selection-helper",
    title: "Culture Media Selection Helper",
    category: "Microbiology",
    blurb: "Choose the right culture media for your microbiology test and incubation.",
    description:
      "Free culture media selector for pharmaceutical microbiology — match your test (bioburden, sterility, environmental monitoring, growth promotion) to the right media.",
    icon: FlaskRound,
    element: <MediaSelectionHelper />,
  },
  {
    slug: "sterility-test-method-selector",
    title: "Sterility Test Method Selector",
    category: "Sterility",
    blurb: "Decide between membrane filtration and direct inoculation for your product.",
    description:
      "Free sterility test method selector — choose between membrane filtration and direct inoculation based on your product type and volume, with the key method controls.",
    icon: ShieldCheck,
    element: <SterilityMethodSelector />,
  },
  {
    slug: "endotoxin-limit-calculator",
    title: "Endotoxin Limit & MVD Calculator",
    category: "Microbiology",
    blurb: "Calculate the endotoxin limit (K/M) and Maximum Valid Dilution for a BET.",
    description:
      "Free bacterial endotoxin limit and MVD calculator — apply the compendial formulas (endotoxin limit = K/M, Maximum Valid Dilution) for your LAL / bacterial endotoxin test.",
    icon: FlaskConical,
    element: <EndotoxinLimitCalculator />,
  },
  {
    slug: "cleaning-validation-maco-calculator",
    title: "Cleaning Validation MACO Calculator",
    category: "Validation",
    blurb: "Compute MACO by dose, HBEL, and 10 ppm, then derive surface and swab limits.",
    description:
      "Free cleaning validation MACO calculator — dose-based, HBEL/PDE, and 10 ppm maximum allowable carryover limits, with surface and recovery-corrected swab limits.",
    icon: Sparkles,
    element: <CleaningValidationCalculator />,
  },
  {
    slug: "process-capability-calculator",
    title: "Process Capability Calculator",
    category: "Validation",
    blurb: "Compute Cp, Cpk, and the estimated out-of-spec PPM from your process data.",
    description:
      "Free process capability calculator — Cp, Cpu, Cpl, Cpk and the estimated out-of-spec PPM from spec limits and process data, with raw-data paste support.",
    icon: Gauge,
    element: <ProcessCapabilityCalculator />,
  },
  {
    slug: "oos-investigation-decision-tree",
    title: "OOS Investigation Decision Tree",
    category: "Investigations",
    blurb: "Walk a phased FDA OOS investigation and see the right next step.",
    description:
      "Free OOS investigation decision tree — walk the phased FDA out-of-specification process (Phase I laboratory investigation, Phase II) and see the appropriate next step.",
    icon: GitBranch,
    element: <OosDecisionTree />,
  },
  {
    slug: "em-scenario-decision-tree",
    title: "EM Scenario Decision Tree",
    category: "Microbiology",
    blurb: "Work through common environmental monitoring excursions and responses.",
    description:
      "Free environmental monitoring decision tree — work through common EM excursion scenarios (alert and action limits, investigations) and the appropriate response.",
    icon: Wind,
    element: <ScenarioDecisionTree />,
  },
  {
    slug: "contamination-control-strategy-builder",
    title: "CCS Builder Lite",
    category: "Sterility",
    blurb: "Outline a contamination control strategy across the key control elements.",
    description:
      "Free contamination control strategy (CCS) builder — outline your Annex 1 contamination controls across the key elements and spot the gaps.",
    icon: Layers,
    element: <CCSBuilderLite />,
  },
  {
    slug: "investigation-template-viewer",
    title: "Investigation Template Viewer",
    category: "Investigations",
    blurb: "Preview a structured investigation template you can adapt.",
    description:
      "Free QC investigation template viewer — preview a structured deviation/OOS investigation outline you can adapt to your quality system.",
    icon: ClipboardList,
    element: <InvestigationTemplatePage />,
  },
];

export function getToolBySlug(slug: string): ToolDef | undefined {
  return TOOLS.find((t) => t.slug === slug);
}

/** Slugs for the sitemap (kept in sync with server/routes.ts). */
export const TOOL_SLUGS = TOOLS.map((t) => t.slug);
