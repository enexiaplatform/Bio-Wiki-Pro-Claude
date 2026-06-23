// Static decision-logic for the Sterility Test Method Selector tool.
// Maps a product scenario to the recommended USP 71 sterility test approach.
// General educational guidance — verify against the pharmacopeia (USP 71 /
// EP 2.6.1), your approved SOP, and a validated method.

export interface SterilityScenario {
  id: string;
  /** The selectable product scenario. */
  label: string;
  /** Recommended approach (display name). */
  method: string;
  /** One-line why. */
  summary: string;
  /** Key controls for this approach. */
  controls: string[];
  /** The main pitfall to avoid. */
  caution: string;
}

export const sterilityScenarios: SterilityScenario[] = [
  {
    id: "filterable",
    label: "Filterable aqueous solution or suspension",
    method: "Membrane filtration",
    summary: "The preferred approach when the product passes a suitable membrane — filtration concentrates organisms and rinses inhibitory substances away.",
    controls: [
      "Use a membrane of appropriate porosity (commonly 0.45 micron for sterility)",
      "Rinse to remove any antimicrobial residues before adding media",
      "Establish method suitability (bacteriostasis / fungistasis) with the compendial organisms",
      "Run negative controls and a positive (growth-promotion) control",
    ],
    caution: "Confirm the product does not damage the membrane or let organisms pass.",
  },
  {
    id: "antimicrobial",
    label: "Antimicrobial / preserved product (still filterable)",
    method: "Membrane filtration with rinsing / neutralization",
    summary: "Filtration plus an adequate rinse — and a neutralizer where needed — removes the inhibitory activity so a contaminant can still grow.",
    controls: [
      "Determine the rinse volume and any neutralizer during method suitability",
      "Demonstrate recovery of a low inoculum of the test organisms",
      "Negative and growth-promotion controls every run",
    ],
    caution: "If method suitability fails, the result is unreliable — resolve it before release testing.",
  },
  {
    id: "non-filterable",
    label: "Oily, viscous, or non-filterable liquid",
    method: "Direct inoculation",
    summary: "When the product cannot be filtered, inoculate it directly into media at the compendial product-to-media ratio.",
    controls: [
      "Use the media volume and product ratio defined in the method",
      "Add a neutralizer or emulsifier for inhibitory or oily products",
      "Method suitability must show the product does not inhibit growth",
    ],
    caution: "Direct inoculation cannot rinse away inhibitors — neutralization and the correct ratio are critical.",
  },
  {
    id: "device",
    label: "Solid product or device that can be immersed",
    method: "Direct inoculation / immersion",
    summary: "Immerse or transfer the article into media so the whole product contacts the medium.",
    controls: [
      "Ensure the entire article is in contact with the media",
      "Method suitability covering any extractables or inhibitors",
      "Negative and positive controls",
    ],
    caution: "Validate that immersion can recover contamination from the whole article, not just its surface.",
  },
];

// Applies to every sterility test regardless of method.
export const sterilityAlways: string[] = [
  "Method suitability (bacteriostasis / fungistasis) established for the product",
  "The compendial test organisms, media, and incubation regime",
  "Rigorous aseptic technique with negative controls every time",
  "A failure is investigated, not assumed to be a lab error",
];
