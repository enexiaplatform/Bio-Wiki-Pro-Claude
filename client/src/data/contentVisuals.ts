export type ContentVisual = {
  src: string;
  alt: string;
  creditName: string;
  creditUrl: string;
  focalPoint: string;
};

const benchWork: ContentVisual = {
  src: "/images/editorial/pipette-laboratory.jpg",
  alt: "Precision pipetting during controlled laboratory bench work",
  creditName: "Nathan Rimoux",
  creditUrl: "https://unsplash.com/photos/AqVLU4cx8OI",
  focalPoint: "object-[center_46%]",
};

const controlledPractice: ContentVisual = {
  src: "/images/editorial/cleanroom-practice.jpg",
  alt: "Laboratory technicians working in a controlled environment",
  creditName: "Toon Lambrechts",
  creditUrl: "https://unsplash.com/photos/RkG7wp75b48",
  focalPoint: "object-[center_48%]",
};

const analyticalObservation: ContentVisual = {
  src: "/images/editorial/microscope-workbench.jpg",
  alt: "Laboratory microscope prepared for analytical observation",
  creditName: "Mezidi Zineb",
  creditUrl: "https://unsplash.com/photos/dAHABqJ8Nlw",
  focalPoint: "object-[center_58%]",
};

const visualsByCategory: Record<string, ContentVisual> = {
  "Quality Lab Planning": benchWork,
  "Laboratory Controls": benchWork,
  "Analytical QC": benchWork,
  Validation: controlledPractice,
  "Quality Systems": controlledPractice,
  "Data Integrity": controlledPractice,
  Investigations: controlledPractice,
  "Quality Investigation": controlledPractice,
  "Regulatory Affairs": controlledPractice,
  "Sterile Manufacturing": controlledPractice,
  "Aseptic Processing": controlledPractice,
  "Microbiology QC": analyticalObservation,
  Microbiology: analyticalObservation,
  "Biologics QC": analyticalObservation,
  Biologics: analyticalObservation,
};

export function getContentVisual(category: string): ContentVisual {
  return visualsByCategory[category] ?? benchWork;
}
