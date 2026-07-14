import { describe, expect, it } from "vitest";
import { assessDomainPackReadiness, domainPackReadiness } from "../client/src/data/domainPackReadiness";
import { atlasEvidenceDomains } from "../client/src/data/atlasEvidenceGraph";

describe("Domain Pack readiness gates", () => {
  it("covers every planned expansion domain in canonical sequence", () => {
    expect(domainPackReadiness.map((domain) => domain.id)).toEqual([
      "nonsterile-microbiology", "water-em", "sterile-biologics", "analytical-chemistry", "stability-sample-management", "food-beverage",
    ]);
    const evidenceDomains = atlasEvidenceDomains.filter((domain) => domain.id !== "compiler-core").map((domain) => domain.id);
    for (const domainId of evidenceDomains) expect(domainPackReadiness.some((domain) => domain.id === domainId)).toBe(true);
  });

  it("requires all four canonical gates before verified-pack eligibility", () => {
    for (const domain of domainPackReadiness) {
      expect(domain.gates.map((gate) => gate.id)).toEqual(["expert-owner", "source-corpus", "validation-cases", "qualified-demand"]);
      expect(assessDomainPackReadiness(domain).eligibleForVerifiedPack).toBe(false);
      expect(domain.gates.find((gate) => gate.id === "validation-cases")?.supportingHref).toBe(domain.id === "nonsterile-microbiology" ? "/quality-lab/validation-cases" : "/blog/how-to-validate-a-quality-lab-domain-pack");
    }
    const completed = { ...domainPackReadiness[0], gates: domainPackReadiness[0].gates.map((gate) => ({ ...gate, status: "gate-satisfied" as const })) };
    expect(assessDomainPackReadiness(completed)).toMatchObject({ satisfied: 4, total: 4, readinessPercent: 100, eligibleForVerifiedPack: true, blockers: [] });
  });

  it("keeps Food & Beverage explicitly unopened", () => {
    const future = domainPackReadiness.find((domain) => domain.id === "food-beverage")!;
    expect(future.currentStage).toBe("future-gate");
    expect(future.publicEvidenceHref).toBeUndefined();
    expect(future.gates.every((gate) => gate.status === "not-started")).toBe(true);
  });

  it("connects microbiology expert ownership to its controlled register", () => {
    const microbiology = domainPackReadiness.find((domain) => domain.id === "nonsterile-microbiology")!;
    expect(microbiology.gates.find((gate) => gate.id === "expert-owner")).toMatchObject({
      status: "in-development",
      supportingHref: "/quality-lab/domain-ownership",
      supportingLabel: "Inspect ownership control",
    });
  });

  it("connects microbiology validation evidence to its controlled registry", () => {
    const microbiology = domainPackReadiness.find((domain) => domain.id === "nonsterile-microbiology")!;
    expect(microbiology.gates.find((gate) => gate.id === "validation-cases")).toMatchObject({
      status: "evidence-required",
      supportingHref: "/quality-lab/validation-cases",
      supportingLabel: "Inspect validation registry",
    });
  });
});
