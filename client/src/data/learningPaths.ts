// Ordered learning paths grouping Academy MDX lessons into structured tracks.
// `lessonSlugs` must match content/academy/<slug>.en.mdx files.

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
    description: "Core microbiology testing every QC analyst must master — from sterility to endotoxin.",
    lessonSlugs: [
      "sterility-testing-basics",
      "environmental-monitoring-basics",
      "bioburden-usp-61",
      "endotoxin-lal-testing",
      "growth-promotion-testing",
      "microbial-identification",
      "pharmaceutical-water-systems",
    ],
  },
  {
    slug: "audit-readiness",
    title: "Audit Readiness",
    description: "Be ready for GMP & Annex 1 inspections — contamination control, aseptic practice, and data integrity.",
    lessonSlugs: [
      "contamination-control-strategy",
      "aseptic-technique",
      "visual-inspection",
      "data-integrity-deep-dive",
      "oos-investigation-deep-dive",
    ],
  },
  {
    slug: "quality-systems",
    title: "Quality Systems",
    description: "Run the QMS engine — deviations, CAPA, suppliers, complaints, and trend signals.",
    lessonSlugs: [
      "deviation-management",
      "capa-fundamentals",
      "out-of-trend-investigation",
      "supplier-qualification",
      "complaint-handling",
    ],
  },
  {
    slug: "validation-essentials",
    title: "Validation Essentials",
    description: "Validate processes, cleaning, and stability with the modern lifecycle approach.",
    lessonSlugs: [
      "process-validation-stages",
      "cleaning-validation",
      "stability-studies",
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
