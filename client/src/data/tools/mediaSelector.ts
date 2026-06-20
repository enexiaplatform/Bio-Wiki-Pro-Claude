// Static decision-logic for the Culture Media Selection Helper tool.
// Maps a microbiology QC test/purpose to a recommended medium and the
// growth-promotion (GPT) strains used to qualify it. General educational
// guidance — verify against the current pharmacopeia and your approved SOP.

export interface GptStrain {
  strain: string;
  role: "Recovery" | "Inhibition";
}

export interface MediaRecommendation {
  id: string;
  /** The selectable test/purpose. */
  purpose: string;
  /** Recommended medium. */
  media: string;
  /** One-line why. */
  rationale: string;
  /** Growth-promotion strains and what they demonstrate. */
  gptStrains: GptStrain[];
  /** Incubation / practical notes. */
  notes: string;
}

export const mediaRecommendations: MediaRecommendation[] = [
  {
    id: "tamc",
    purpose: "Total Aerobic Microbial Count (USP 61)",
    media: "Tryptic Soy Agar (TSA / SCDA)",
    rationale: "Non-selective recovery of total aerobic bacteria.",
    gptStrains: [
      { strain: "S. aureus", role: "Recovery" },
      { strain: "P. aeruginosa", role: "Recovery" },
      { strain: "B. subtilis", role: "Recovery" },
      { strain: "C. albicans", role: "Recovery" },
      { strain: "A. brasiliensis", role: "Recovery" },
    ],
    notes: "Incubate 30-35 °C for 3-5 days; challenge recovery with a low inoculum (not more than 100 CFU).",
  },
  {
    id: "tymc",
    purpose: "Total Yeast & Mould Count (USP 61)",
    media: "Sabouraud Dextrose Agar (SDA)",
    rationale: "Recovery of fungi — yeast and mould.",
    gptStrains: [
      { strain: "C. albicans", role: "Recovery" },
      { strain: "A. brasiliensis", role: "Recovery" },
    ],
    notes: "Incubate 20-25 °C for 5-7 days.",
  },
  {
    id: "ecoli",
    purpose: "Escherichia coli (USP 62)",
    media: "MacConkey broth, then MacConkey agar",
    rationale: "Selective enrichment and isolation of bile-tolerant lactose fermenters.",
    gptStrains: [
      { strain: "E. coli", role: "Recovery" },
      { strain: "S. aureus", role: "Inhibition" },
    ],
    notes: "Demonstrate recovery of E. coli and inhibition of Gram-positive organisms.",
  },
  {
    id: "pseudomonas",
    purpose: "Pseudomonas aeruginosa (USP 62)",
    media: "Cetrimide Agar",
    rationale: "Selective for P. aeruginosa.",
    gptStrains: [
      { strain: "P. aeruginosa", role: "Recovery" },
      { strain: "E. coli", role: "Inhibition" },
    ],
    notes: "Confirm growth of P. aeruginosa and suppression of other organisms.",
  },
  {
    id: "saureus",
    purpose: "Staphylococcus aureus (USP 62)",
    media: "Mannitol Salt Agar (or Baird-Parker)",
    rationale: "Selective and differential for S. aureus.",
    gptStrains: [
      { strain: "S. aureus", role: "Recovery" },
      { strain: "E. coli", role: "Inhibition" },
    ],
    notes: "Mannitol fermentation (colour change) differentiates S. aureus.",
  },
  {
    id: "sterility",
    purpose: "Sterility test (USP 71)",
    media: "Fluid Thioglycollate Medium (FTM) + Soybean-Casein Digest (TSB / SCDM)",
    rationale: "FTM recovers anaerobes and aerobes; SCDM recovers fungi and aerobes.",
    gptStrains: [
      { strain: "C. sporogenes (FTM)", role: "Recovery" },
      { strain: "S. aureus (FTM)", role: "Recovery" },
      { strain: "P. aeruginosa (FTM)", role: "Recovery" },
      { strain: "B. subtilis (SCDM)", role: "Recovery" },
      { strain: "C. albicans (SCDM)", role: "Recovery" },
      { strain: "A. brasiliensis (SCDM)", role: "Recovery" },
    ],
    notes: "Incubate FTM 30-35 °C and SCDM 20-25 °C for not less than 14 days.",
  },
];
