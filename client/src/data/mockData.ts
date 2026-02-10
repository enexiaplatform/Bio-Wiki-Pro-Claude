import { Term, Job, Product, SOP } from "@shared/schema";

export const academyData: Term[] = [
  {
    id: "1",
    slug: "pcr-basics",
    title: "Polymerase Chain Reaction (PCR)",
    category: "Molecular Biology",
    tags: ["DNA", "Amplification", "Genetics"],
    summary: "A method widely used in molecular biology to make millions to billions of copies of a specific DNA sample rapidly.",
    whyItMatters: "PCR is fundamental to almost all genetic mapping, cloning, and forensics.",
    commonMistakes: [
      "Contamination of reagents leading to false positives.",
      "Incorrect annealing temperatures resulting in non-specific binding.",
      "Pipetting errors causing inconsistent results."
    ],
    difficulty: "Beginner",
    readTimeMin: 5
  },
  {
    id: "2",
    slug: "western-blot",
    title: "Western Blotting",
    category: "Protein Analysis",
    tags: ["Proteins", "Antibodies", "Immunology"],
    summary: "An analytical technique used to detect specific proteins in a sample of tissue homogenate or extract.",
    whyItMatters: "It allows you to identify specific proteins from a complex mixture of proteins extracted from cells.",
    commonMistakes: [
      "High background noise due to insufficient washing.",
      "Non-specific bands from poor primary antibody specificity.",
      "Over-transferring proteins through the membrane."
    ],
    difficulty: "Intermediate",
    readTimeMin: 8
  },
  {
    id: "3",
    slug: "cell-culture",
    title: "Mammalian Cell Culture",
    category: "Cell Biology",
    tags: ["Sterile Technique", "Media", "Incubation"],
    summary: "The process by which cells are grown under controlled conditions, generally outside their natural environment.",
    whyItMatters: "Essential for producing vaccines, studying cell signaling, and testing drug toxicity.",
    commonMistakes: [
      "Bacterial or fungal contamination.",
      "Over-confluency leading to cell death or differentiation.",
      "Improper pH management of the media."
    ],
    difficulty: "Intermediate",
    readTimeMin: 7
  },
  {
    id: "4",
    slug: "flow-cytometry",
    title: "Flow Cytometry",
    category: "Immunology",
    tags: ["Fluorescence", "Cell Sorting", "Analysis"],
    summary: "A technique used to detect and measure physical and chemical characteristics of a population of cells or particles.",
    whyItMatters: "Allows simultaneous multi-parametric analysis of thousands of particles per second.",
    commonMistakes: [
      "Poor compensation settings leading to false positives.",
      "Cell clumping clogging the cytometer.",
      "Using too high a flow rate reducing resolution."
    ],
    difficulty: "Advanced",
    readTimeMin: 12
  },
  {
    id: "5",
    slug: "crispr-cas9",
    title: "CRISPR-Cas9 Gene Editing",
    category: "Genetics",
    tags: ["Gene Editing", "Cas9", "gRNA"],
    summary: "A unique technology that enables geneticists and medical researchers to edit parts of the genome by removing, adding or altering sections of the DNA sequence.",
    whyItMatters: "It is faster, cheaper and more accurate than previous techniques of editing DNA.",
    commonMistakes: [
      "Off-target effects modifying unintended genes.",
      "Inefficient delivery of the Cas9 complex into cells.",
      "Mosaicism in the resulting cell population."
    ],
    difficulty: "Advanced",
    readTimeMin: 10
  },
  {
    id: "6",
    slug: "elisa",
    title: "ELISA (Enzyme-Linked Immunosorbent Assay)",
    category: "Immunology",
    tags: ["Antibodies", "Antigens", "Quantification"],
    summary: "A plate-based assay technique designed for detecting and quantifying soluble substances such as peptides, proteins, antibodies, and hormones.",
    whyItMatters: "Standard method for quantifying secreted proteins and diagnosing infections.",
    commonMistakes: [
      "Edge effect on plates causing uneven signal.",
      "Insufficient blocking leading to high background.",
      "Pipetting variability between replicates."
    ],
    difficulty: "Beginner",
    readTimeMin: 6
  },
  {
    id: "7",
    slug: "hplc",
    title: "HPLC (High-Performance Liquid Chromatography)",
    category: "Analytical Chemistry",
    tags: ["Separation", "Purification", "Chemistry"],
    summary: "A technique in analytical chemistry used to separate, identify, and quantify each component in a mixture.",
    whyItMatters: "Crucial for drug purity testing and metabolomics.",
    commonMistakes: [
      "Column contamination causing peak tailing.",
      "Air bubbles in the pump or detector.",
      "Using incompatible solvents precipitating samples."
    ],
    difficulty: "Advanced",
    readTimeMin: 15
  },
  {
    id: "8",
    slug: "gram-staining",
    title: "Gram Staining",
    category: "Microbiology",
    tags: ["Bacteria", "Microscopy", "Diagnosis"],
    summary: "A method of staining used to differentiate bacterial species into two large groups (gram-positive and gram-negative).",
    whyItMatters: "The first step in identifying bacterial infections.",
    commonMistakes: [
      "Over-decolorizing leading to false gram-negatives.",
      "Using old cultures that stain inconsistently.",
      "Heat fixing for too long distorting cell shape."
    ],
    difficulty: "Beginner",
    readTimeMin: 4
  }
];

export const jobsData: Job[] = [
  {
    id: "j1",
    title: "QC Analyst II",
    company: "BioGenex Pharma",
    location: "Boston, MA",
    level: "Mid",
    salaryRange: "$75k - $90k",
    requiredSkills: ["HPLC", "GMP", "LIMS"],
    postedAt: "2 days ago",
    domain: "QC"
  },
  {
    id: "j2",
    title: "Senior QA Specialist",
    company: "Vertex Therapeutics",
    location: "San Diego, CA",
    level: "Senior",
    salaryRange: "$110k - $135k",
    requiredSkills: ["FDA Regulations", "CAPA", "Auditing"],
    postedAt: "1 week ago",
    domain: "QA"
  },
  {
    id: "j3",
    title: "Regulatory Affairs Associate",
    company: "Pfizer",
    location: "New York, NY",
    level: "Entry",
    salaryRange: "$65k - $80k",
    requiredSkills: ["Documentation", "Communication", "Science Degree"],
    postedAt: "3 days ago",
    domain: "RA"
  },
  {
    id: "j4",
    title: "Biomanufacturing Technician",
    company: "Moderna",
    location: "Cambridge, MA",
    level: "Entry",
    salaryRange: "$60k - $75k",
    requiredSkills: ["Aseptic Technique", "SOP Adherence", "Bioreactors"],
    postedAt: "Just now",
    domain: "Manufacturing"
  },
  {
    id: "j5",
    title: "Validation Engineer",
    company: "Amgen",
    location: "Thousand Oaks, CA",
    level: "Mid",
    salaryRange: "$95k - $115k",
    requiredSkills: ["IQ/OQ/PQ", "Engineering", "Validation Protocols"],
    postedAt: "5 days ago",
    domain: "Manufacturing"
  },
  {
    id: "j6",
    title: "Clinical Research Coordinator",
    company: "Mass General Hospital",
    location: "Boston, MA",
    level: "Mid",
    salaryRange: "$70k - $85k",
    requiredSkills: ["Patient Recruitment", "IRB", "Data Entry"],
    postedAt: "4 days ago",
    domain: "QA"
  }
];

export const solutionsData: Product[] = [
  {
    id: "p1",
    name: "UltraPure Water System",
    tagline: "Type 1 water for critical applications.",
    features: ["18.2 MΩ·cm resistivity", "TOC monitoring", "Endotoxin-free"]
  },
  {
    id: "p2",
    name: "Automated Pipetting Robot",
    tagline: "Increase throughput and reduce RSI.",
    features: ["96-well format", "High precision", "Customizable protocols"]
  },
  {
    id: "p3",
    name: "Next-Gen Sequencer Mini",
    tagline: "Desktop sequencing power.",
    features: ["Rapid turnaround", "Low cost per run", "Easy library prep"]
  },
  {
    id: "p4",
    name: "CryoStorage -80°C Freezer",
    tagline: "Reliable sample preservation.",
    features: ["Dual compressor", "Backup CO2", "Cloud monitoring"]
  }
];

export const sopsData: SOP[] = [
  {
    id: "s1",
    title: "SOP-001: Gowning Procedure for Cleanrooms",
    summary: "Standard procedure for entering ISO 7 and ISO 8 cleanroom environments.",
    content: "1. Remove outer garments.\n2. Wash hands thoroughly with antimicrobial soap.\n3. Don hair net, beard cover (if applicable), and shoe covers.\n4. Enter gowning room.\n5. Don sterile coverall without touching the exterior...",
    isLocked: false
  },
  {
    id: "s2",
    title: "SOP-002: Pipette Calibration and Maintenance",
    summary: "Quarterly calibration requirements and daily verification steps for air-displacement pipettes.",
    content: "LOCKED CONTENT",
    isLocked: true
  },
  {
    id: "s3",
    title: "SOP-003: Hazardous Waste Disposal",
    summary: "Proper segregation and disposal of biological, chemical, and sharps waste.",
    content: "LOCKED CONTENT",
    isLocked: true
  },
  {
    id: "s4",
    title: "SOP-004: Emergency Spill Response",
    summary: "Action plan for biological spills > 100mL outside of a biosafety cabinet.",
    content: "LOCKED CONTENT",
    isLocked: true
  },
  {
    id: "s5",
    title: "SOP-005: Autoclave Operation",
    summary: "Loading patterns, cycle selection, and safety checks for steam sterilization.",
    content: "LOCKED CONTENT",
    isLocked: true
  }
];
