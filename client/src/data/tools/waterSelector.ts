// Static decision-logic data for the Lab Water Type Selector tool.
// Maps a use case to a recommended water grade with key controls and a caution.
// General educational guidance — verify against the applicable pharmacopeia
// (USP/EP/JP), your approved SOP, and your validated water system.

export interface WaterUseCase {
  id: string;
  /** The user's selectable scenario. */
  label: string;
  /** Recommended water grade (display name). */
  grade: string;
  /** One-line why. */
  summary: string;
  /** Key controls / typical specs for the recommended grade. */
  controls: string[];
  /** The main pitfall to avoid. */
  caution: string;
}

export const waterUseCases: WaterUseCase[] = [
  {
    id: "parenteral",
    label: "Parenteral / injectable — formulation or final product-contact rinse",
    grade: "Water for Injection (WFI)",
    summary: "Injectables and the final rinse of product-contact surfaces require WFI — the most controlled compendial grade.",
    controls: [
      "Endotoxin: not more than 0.25 EU/mL",
      "TOC and conductivity within compendial limits",
      "Microbial action limit typically below 10 CFU per 100 mL",
      "Produced by distillation or a validated equivalent (EP permits membrane-based WFI since 2017)",
    ],
    caution: "Do not substitute Purified Water on injectable product-contact surfaces.",
  },
  {
    id: "sterile-nonparenteral",
    label: "Sterile non-injectable product (ophthalmic, inhalation, nasal)",
    grade: "Purified Water (minimum) — verify by route",
    summary: "Purified Water is the baseline, but the route and pharmacopeia may require WFI for product-contact.",
    controls: [
      "TOC and conductivity within compendial limits",
      "Microbial action limit typically below 100 CFU/mL",
      "Step up to WFI where the route/dosage form demands low endotoxin",
    ],
    caution: "Route drives the grade — confirm against your pharmacopeia and registered specification.",
  },
  {
    id: "nonsterile",
    label: "Non-sterile product manufacture or final cleaning rinse",
    grade: "Purified Water",
    summary: "The standard grade for non-sterile manufacture, granulation, and cleaning final rinses.",
    controls: [
      "TOC and conductivity within compendial limits",
      "Microbial action limit typically below 100 CFU/mL",
      "No compendial endotoxin limit (monitor where product risk warrants)",
    ],
    caution: "Not suitable for parenteral product-contact — step up to WFI.",
  },
  {
    id: "analytical",
    label: "Analytical — HPLC, trace analysis, or molecular biology",
    grade: "Reagent-grade water (Type I)",
    summary: "Ultrapure lab water for methods where ions, organics, or nucleases would interfere.",
    controls: [
      "Resistivity about 18.2 MΩ·cm at 25 °C",
      "Low TOC, polished and filtered at point of use",
      "Per ASTM D1193 / CLSI Type I (Type II/III for less demanding use)",
    ],
    caution: "A lab/analytical grade — distinct from compendial process waters; match the method's stated requirement.",
  },
  {
    id: "general-lab",
    label: "General lab use / initial equipment cleaning",
    grade: "Purified Water (or reagent Type III)",
    summary: "Purified Water suits most GMP general use; reagent Type III covers non-critical lab rinsing.",
    controls: [
      "Purified Water for GMP-relevant general use",
      "Reagent Type III for glassware pre-rinse and non-critical lab tasks",
      "Avoid potable/tap water for any product- or sample-contact step",
    ],
    caution: "Initial cleaning can use a lower grade, but the final rinse grade must match the product's needs.",
  },
];
