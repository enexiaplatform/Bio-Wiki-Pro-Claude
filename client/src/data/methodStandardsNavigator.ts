import { testMethodApplicationPacks, type TestMethodApplicationPack } from "./testMethodApplications";

export type NavigatorCoverage = "structured-concept" | "source-mapped" | "evidence-required";
export type StandardAccess = "public-source" | "licensed-source-required";

export interface NavigatorStandard {
  id: string;
  canonicalSourceId: string;
  title: string;
  publisher: string;
  market: string;
  version: string;
  locator: string;
  access: StandardAccess;
  scope: string;
  limitation: string;
}

export interface MethodNavigatorRecord {
  id: string;
  title: string;
  domain: string;
  coverage: NavigatorCoverage;
  decision: string;
  boundary: string;
  guideHref: string;
  evidenceHrefs: string[];
  standardIds: string[];
  keywords: string[];
  unresolvedCount: number;
  methodGraphStatus: TestMethodApplicationPack["methodGraphStatus"];
  dimensionStatus: { structured: number; partial: number; evidenceRequired: number };
  controlledRevisionStatus: "not-recorded";
}

export const NAVIGATOR_STANDARDS: NavigatorStandard[] = [
  {
    id: "usp-61",
    canonicalSourceId: "USP-61-CURRENT",
    title: "USP <61> Microbial Enumeration Tests",
    publisher: "United States Pharmacopeia",
    market: "United States / harmonized context",
    version: "Current applicable subscription edition must be confirmed",
    locator: "https://www.usp.org/harmonization-standards/pdg/general-methods/microbial-examination",
    access: "licensed-source-required",
    scope: "Non-sterile product enumeration and product-specific method suitability context.",
    limitation: "Atlas does not reproduce USP–NF text or determine product-specific applicability.",
  },
  {
    id: "usp-62",
    canonicalSourceId: "USP-62-CURRENT",
    title: "USP <62> Tests for Specified Microorganisms",
    publisher: "United States Pharmacopeia",
    market: "United States / harmonized context",
    version: "Current applicable subscription edition must be confirmed",
    locator: "https://www.usp.org/harmonization-standards/pdg/general-methods/microbial-examination",
    access: "licensed-source-required",
    scope: "Specified-organism recovery, enrichment, selection and confirmation context.",
    limitation: "Registered specifications, organism requirements and approved procedures remain authoritative.",
  },
  {
    id: "usp-85",
    canonicalSourceId: "USP-85-CURRENT",
    title: "USP <85> Bacterial Endotoxins Test",
    publisher: "United States Pharmacopeia",
    market: "United States / harmonized context",
    version: "Current applicable subscription edition must be confirmed",
    locator: "https://www.usp.org/harmonization-standards/pdg/general-methods/bacterial-endotoxins",
    access: "licensed-source-required",
    scope: "Bacterial endotoxins method, controls and product-specific suitability context.",
    limitation: "Atlas does not infer a product limit, MVD, dilution, interference outcome or release decision.",
  },
  {
    id: "usp-1111",
    canonicalSourceId: "USP-1111-CURRENT",
    title: "USP <1111> Acceptance Criteria for Nonsterile Products",
    publisher: "United States Pharmacopeia",
    market: "United States",
    version: "Current applicable subscription edition must be confirmed",
    locator: "https://online.uspnf.com/",
    access: "licensed-source-required",
    scope: "Microbiological quality and specified-organism context for non-sterile products.",
    limitation: "Product category, registered specification and market commitments require qualified review.",
  },
  {
    id: "usp-1113",
    canonicalSourceId: "USP-1113-CURRENT",
    title: "USP <1113> Microbial Characterization, Identification, and Strain Typing",
    publisher: "United States Pharmacopeia",
    market: "United States",
    version: "Current applicable subscription edition must be confirmed",
    locator: "https://online.uspnf.com/",
    access: "licensed-source-required",
    scope: "Risk-based microbial identification and characterization context.",
    limitation: "Required resolution, platform suitability, database coverage and confirmation remain site-controlled.",
  },
  {
    id: "usp-1116",
    canonicalSourceId: "USP-1116-CURRENT",
    title: "USP <1116> Microbiological Control and Monitoring of Aseptic Processing Environments",
    publisher: "United States Pharmacopeia",
    market: "United States",
    version: "Current applicable subscription edition must be confirmed",
    locator: "https://online.uspnf.com/",
    access: "licensed-source-required",
    scope: "Environmental-monitoring program and interpretation context for aseptic processing.",
    limitation: "Atlas does not set locations, frequencies, limits, incubation strategy or excursion actions.",
  },
  {
    id: "usp-1231",
    canonicalSourceId: "USP-1231-CURRENT",
    title: "USP <1231> Water for Pharmaceutical Purposes",
    publisher: "United States Pharmacopeia",
    market: "United States",
    version: "Current applicable subscription edition must be confirmed",
    locator: "https://online.uspnf.com/",
    access: "licensed-source-required",
    scope: "Pharmaceutical-water system, sampling, monitoring and microbial-control context.",
    limitation: "Approved water grades, points, limits, trends and control strategy remain site evidence.",
  },
  {
    id: "ph-eur-microbiology",
    canonicalSourceId: "PH-EUR-CURRENT",
    title: "European Pharmacopoeia microbiological methods",
    publisher: "European Directorate for the Quality of Medicines & HealthCare",
    market: "European Pharmacopoeia member states",
    version: "Current applicable licensed edition must be confirmed",
    locator: "https://pheur.edqm.eu/",
    access: "licensed-source-required",
    scope: "Applicable microbiological examination, endotoxins and water monograph context.",
    limitation: "Atlas stores source mapping, not licensed Ph. Eur. text; chapter and monograph applicability require review.",
  },
  {
    id: "eu-gmp-annex-1",
    canonicalSourceId: "EU-GMP-ANNEX1-2022",
    title: "EU GMP Annex 1 — Manufacture of Sterile Medicinal Products",
    publisher: "European Commission",
    market: "European Union / PIC/S-aligned context",
    version: "2022 revision",
    locator: "https://health.ec.europa.eu/medicinal-products/eudralex/eudralex-volume-4_en",
    access: "public-source",
    scope: "Sterile operations, contamination control and environmental-monitoring context.",
    limitation: "It does not constitute a site CCS, monitoring program, facility design or approved interpretation.",
  },
];

const STANDARD_LINKS: Record<string, string[]> = {
  "water-microbiology": ["usp-1231", "ph-eur-microbiology"],
  "growth-promotion-media-qc": ["usp-61", "usp-62", "ph-eur-microbiology"],
  "bioburden-filtration": ["usp-61", "ph-eur-microbiology"],
  "specified-microorganisms": ["usp-62", "usp-1111", "ph-eur-microbiology"],
  "method-suitability-recovery": ["usp-61", "usp-62", "ph-eur-microbiology"],
  "bet-lal": ["usp-85", "ph-eur-microbiology"],
  "environmental-monitoring": ["usp-1116", "eu-gmp-annex-1"],
  "microbial-identification": ["usp-1113", "eu-gmp-annex-1"],
};

function coverageFor(pack: TestMethodApplicationPack): NavigatorCoverage {
  if (pack.methodGraphStatus === "executable-concept") return "structured-concept";
  if (pack.methodGraphStatus === "workflow-only") return "source-mapped";
  return "evidence-required";
}

export const METHOD_NAVIGATOR_RECORDS: MethodNavigatorRecord[] = testMethodApplicationPacks.map((pack) => ({
  id: pack.id,
  title: pack.title,
  domain: pack.domain,
  coverage: coverageFor(pack),
  decision: pack.decision,
  boundary: pack.boundary,
  guideHref: pack.guideHref,
  evidenceHrefs: pack.evidenceHrefs,
  standardIds: STANDARD_LINKS[pack.id] ?? [],
  keywords: [pack.title, pack.domain, pack.decision, pack.boundary, ...(STANDARD_LINKS[pack.id] ?? [])].map((value) => value.toLowerCase()),
  unresolvedCount: pack.dimensions.filter((dimension) => dimension.status !== "structured").length,
  methodGraphStatus: pack.methodGraphStatus,
  dimensionStatus: {
    structured: pack.dimensions.filter((dimension) => dimension.status === "structured").length,
    partial: pack.dimensions.filter((dimension) => dimension.status === "partial").length,
    evidenceRequired: pack.dimensions.filter((dimension) => dimension.status === "evidence-required").length,
  },
  controlledRevisionStatus: "not-recorded",
}));

export function searchMethodNavigator(query: string, coverage: NavigatorCoverage | "all" = "all") {
  const normalized = query.trim().toLowerCase();
  const methods = METHOD_NAVIGATOR_RECORDS.filter((record) => {
    const coverageMatch = coverage === "all" || record.coverage === coverage;
    return coverageMatch && (!normalized || record.keywords.some((keyword) => keyword.includes(normalized)));
  });
  const standards = NAVIGATOR_STANDARDS.filter((standard) => !normalized || [standard.title, standard.publisher, standard.market, standard.scope, standard.id]
    .some((value) => value.toLowerCase().includes(normalized)));
  return { methods, standards };
}

export function standardsForMethod(record: MethodNavigatorRecord) {
  return record.standardIds.flatMap((id) => {
    const standard = NAVIGATOR_STANDARDS.find((candidate) => candidate.id === id);
    return standard ? [standard] : [];
  });
}
