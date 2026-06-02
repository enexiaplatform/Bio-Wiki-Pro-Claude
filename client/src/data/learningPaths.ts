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
