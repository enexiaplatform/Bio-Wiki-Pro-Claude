import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("Vercel serverless runtime imports", () => {
  it("keeps the Decision Package server dependency graph resolvable by Node ESM", () => {
    const runtimeFiles = [
      "shared/decision-packages.ts",
      "shared/content-quality-registry.ts",
      "shared/content-quality.ts",
      "shared/decision-package-learning.ts",
      "shared/decision-package-learning-types.ts",
      "shared/decision-package-practice-labs.ts",
      "shared/decision-package-learning/biopharma.ts",
      "shared/decision-package-learning/cross-cutting.ts",
      "shared/decision-package-learning/drug-product.ts",
      "shared/decision-package-learning/pharma-api.ts",
    ];
    const invalid: string[] = [];

    for (const file of runtimeFiles) {
      const source = fs.readFileSync(path.resolve(process.cwd(), file), "utf8");
      const valueImports = [...source.matchAll(/^import (?!type\b)[^;]+ from "([^"]+)";/gm)].map((match) => match[1]);
      const runtimeExports = [...source.matchAll(/^export (?:\*|\{[^}]+\}) from "([^"]+)";/gm)].map((match) => match[1]);
      for (const specifier of [...valueImports, ...runtimeExports]) {
        if (specifier.startsWith(".") && !specifier.endsWith(".js")) invalid.push(`${file}: ${specifier}`);
      }
    }

    expect(invalid).toEqual([]);
  });
});
