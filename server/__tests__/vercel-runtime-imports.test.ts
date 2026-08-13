import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("Vercel serverless runtime imports", () => {
  it("keeps Decision Package value imports resolvable by Node ESM", () => {
    const source = fs.readFileSync(path.resolve(process.cwd(), "shared/decision-packages.ts"), "utf8");
    const valueImportSpecifiers = [...source.matchAll(/^import (?!type\b)[^;]+ from "([^"]+)";/gm)].map((match) => match[1]);

    expect(valueImportSpecifiers).toContain("../client/src/data/workflowSystems.js");
    expect(valueImportSpecifiers).toContain("./content-quality-registry.js");
    expect(valueImportSpecifiers.filter((specifier) => specifier.startsWith(".") && !specifier.endsWith(".js"))).toEqual([]);
  });
});
