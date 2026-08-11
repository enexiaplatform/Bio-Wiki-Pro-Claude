import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { DECISION_PACKAGES } from "../../shared/decision-packages";
import { DELIVERABLES } from "../deliverables";

const expandedPackages = [
  ["pharma-api-reaction-workup-scale-up", "pharma_api_reaction_scale_up"],
  ["drug-product-formulation-material-attributes", "drug_product_formulation_material_attributes"],
  ["drug-product-unit-operations-scale-up", "drug_product_unit_operations_scale_up"],
  ["drug-product-analytical-release-stability-packaging", "drug_product_analytical_release_stability"],
  ["drug-product-validation-transfer-lifecycle", "drug_product_validation_transfer_lifecycle"],
  ["cross-cutting-evidence-governance", "analytical_lifecycle_evidence_map"],
  ["cross-cutting-evidence-governance", "decision_led_statistics_evidence_map"],
  ["cross-cutting-evidence-governance", "investigation_capa_change_evidence_loop"],
] as const;

const drugProductAssetIds = [
  "drug_product_formulation_material_attributes",
  "drug_product_unit_operations_scale_up",
  "drug_product_analytical_release_stability",
  "drug_product_validation_transfer_lifecycle",
] as const;

describe("expanded decision-package assets", () => {
  it("keeps each expanded package linked to a review packet and repository files", () => {
    for (const [packageId, productId] of expandedPackages) {
      const packageItem = DECISION_PACKAGES.find((item) => item.id === packageId);
      const product = DELIVERABLES[productId];
      expect(packageItem?.reviewPacketPath).toBeTruthy();
      if (!product) throw new Error(`Missing deliverable ${productId}`);
      expect(product?.quality).toMatchObject({ reviewStatus: "editorial-reviewed", version: "1.0.0-review" });
      expect(product?.files.map((file) => file.filename)).toEqual(expect.arrayContaining([
        "README.md",
        `${product?.dir}-guide.md`,
        `${product?.dir}-blank.csv`,
        `${product?.dir}-fictional-example.md`,
      ]));
      for (const file of product?.files ?? []) {
        expect(existsSync(path.resolve(process.cwd(), "content", "deliverables", product.dir, file.filename))).toBe(true);
      }
      const fictional = readFileSync(path.resolve(process.cwd(), "content", "deliverables", product.dir, `${product.dir}-fictional-example.md`), "utf8");
      const readme = readFileSync(path.resolve(process.cwd(), "content", "deliverables", product.dir, "README.md"), "utf8");
      expect(fictional.toLowerCase()).toContain("fictional");
      expect(readme.toLowerCase()).toContain("editorial-reviewed");
    }
  });

  it("ships multi-record Drug Product working files and end-to-end fictional examples", () => {
    for (const productId of drugProductAssetIds) {
      const product = DELIVERABLES[productId];
      if (!product) throw new Error(`Missing deliverable ${productId}`);
      const blank = readFileSync(path.resolve(process.cwd(), "content", "deliverables", product.dir, `${product.dir}-blank.csv`), "utf8");
      const fictional = readFileSync(path.resolve(process.cwd(), "content", "deliverables", product.dir, `${product.dir}-fictional-example.md`), "utf8");
      expect(blank.trim().split(/\r?\n/)).toHaveLength(6);
      expect(blank).toContain("record_type");
      expect(blank).toContain("accountable_reviewer");
      expect(blank).toContain("decision_state");
      for (const section of ["## Record sequence", "## Three-round practice trace", "## Expected completed artifacts"]) expect(fictional).toContain(section);
      expect(fictional.length).toBeGreaterThanOrEqual(1_500);
      expect(fictional.toLowerCase()).toMatch(/no .*approval|no .*conclusion|no .*criterion|no .*authorization/);
    }
  });
});
