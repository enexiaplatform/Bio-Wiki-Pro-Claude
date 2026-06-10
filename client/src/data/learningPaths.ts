// Ordered learning paths grouping Academy MDX lessons into structured tracks.
// `lessonSlugs` must match content/academy/<slug>.en.mdx files.
// Paths are kept disjoint (each lesson in exactly one path) so reader prev/next
// and the "Lesson X of N" header resolve unambiguously.

export interface LearningPath {
  slug: string;
  title: string;
  description: string;
  lessonSlugs: string[];
}

export const learningPaths: LearningPath[] = [
  {
    slug: "microbiology-qc-fundamentals",
    title: "Microbiology QC Fundamentals",
    description: "Core microbiology testing every QC analyst must master — sterility, bioburden, EM, endotoxin, and water.",
    lessonSlugs: [
      "sterility-testing-basics",
      "bioburden-usp-61",
      "environmental-monitoring-basics",
      "growth-promotion-testing",
      "endotoxin-lal-testing",
      "microbial-identification",
      "pharmaceutical-water-systems",
      "rapid-sterility-testing",
    ],
  },
  {
    slug: "sterile-aseptic-manufacturing",
    title: "Sterile & Aseptic Manufacturing",
    description: "Protect the sterile boundary — gowning, aseptic technique, contamination control, sterilization, media fills, and container closure.",
    lessonSlugs: [
      "gowning-qualification",
      "aseptic-technique",
      "contamination-control-strategy",
      "disinfectant-qualification",
      "annex-1-key-changes",
      "visual-inspection",
      "steam-sterilization-validation",
      "dry-heat-depyrogenation",
      "sterilizing-grade-filtration",
      "media-fill-aps",
      "container-closure-integrity",
      "lyophilization-validation",
    ],
  },
  {
    slug: "validation-essentials",
    title: "Validation Essentials",
    description: "Qualify and validate equipment, methods, processes, cleaning, and computerized systems with the modern lifecycle approach.",
    lessonSlugs: [
      "equipment-qualification",
      "calibration-metrology",
      "analytical-instrument-qualification",
      "hvac-qualification",
      "process-validation-stages",
      "cleaning-validation",
      "analytical-method-validation",
      "analytical-method-transfer",
      "technology-transfer",
      "computer-system-validation",
      "health-based-exposure-limits",
    ],
  },
  {
    slug: "quality-systems",
    title: "Quality Systems & QMS",
    description: "Run the QMS engine — deviations, CAPA, change control, risk, suppliers, complaints, metrics, and product release.",
    lessonSlugs: [
      "deviation-management",
      "capa-fundamentals",
      "change-control",
      "quality-risk-management-q9",
      "acceptance-sampling-aql",
      "complaint-handling",
      "recall-management",
      "supplier-qualification",
      "supplier-audit-program",
      "gmp-training-qualification",
      "quality-metrics-kpis",
      "annual-product-review",
      "batch-record-review",
    ],
  },
  {
    slug: "investigations-data-integrity",
    title: "Investigations & Data Integrity",
    description: "Investigate failures and defend your data — good documentation, ALCOA+, OOS/OOT, and SPC/MSA for trending.",
    lessonSlugs: [
      "good-documentation-practice",
      "data-integrity-deep-dive",
      "electronic-records-part-11",
      "oos-investigation-deep-dive",
      "out-of-trend-investigation",
      "microbial-excursion-investigation",
      "statistical-process-control",
      "measurement-systems-analysis",
    ],
  },
  {
    slug: "laboratory-controls-stability",
    title: "Laboratory Controls & Stability",
    description: "Compendial and analytical control — reference standards, USP tests, impurities, extractables, and stability.",
    lessonSlugs: [
      "reference-standards-management",
      "hplc-system-suitability",
      "dissolution-testing-usp-711",
      "particulate-matter-usp-788",
      "elemental-impurities-q3d",
      "residual-solvents-q3c",
      "nitrosamine-impurity-control",
      "extractables-and-leachables",
      "objectionable-organisms",
      "stability-studies",
      "retest-period-shelf-life",
      "ongoing-stability-program",
    ],
  },
];

export function getLearningPath(slug: string): LearningPath | undefined {
  return learningPaths.find((p) => p.slug === slug);
}

export interface PathContext {
  path: LearningPath;
  index: number; // zero-based position of the lesson in the path
  total: number;
  prev?: string; // slug of the previous lesson, if any
  next?: string; // slug of the next lesson, if any
}

/**
 * Find the first learning path that contains a lesson and return its position
 * plus the neighbouring lesson slugs, for prev/next reader navigation.
 */
export function getPathContext(lessonSlug: string): PathContext | undefined {
  for (const path of learningPaths) {
    const index = path.lessonSlugs.indexOf(lessonSlug);
    if (index !== -1) {
      return {
        path,
        index,
        total: path.lessonSlugs.length,
        prev: index > 0 ? path.lessonSlugs[index - 1] : undefined,
        next: index < path.lessonSlugs.length - 1 ? path.lessonSlugs[index + 1] : undefined,
      };
    }
  }
  return undefined;
}
