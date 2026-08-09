import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const lesson = readFileSync(path.resolve(process.cwd(), "content", "academy", "oos-investigation-deep-dive.en.mdx"), "utf8");
const guide = readFileSync(path.resolve(process.cwd(), "content", "deliverables", "oos-investigation-template", "oos-investigation-template.md"), "utf8");
const readme = readFileSync(path.resolve(process.cwd(), "content", "deliverables", "oos-investigation-template", "README.md"), "utf8");

describe("OOS workflow quality boundary", () => {
  it("states the decision, applicability, sources, limitations and working output", () => {
    expect(lesson).toContain("## Decision question");
    expect(lesson).toContain("## Applicability and do-not-use boundary");
    expect(lesson).toContain("## Controlled source map");
    expect(lesson).toContain("## Decision table");
    expect(lesson).toContain("## Worked example");
    expect(lesson).toContain("OOS Investigation Template v2");
  });

  it("does not market the guide as complete or inspection-ready", () => {
    const combined = `${lesson}\n${guide}\n${readme}`.toLowerCase();
    expect(combined).not.toContain("complete, inspection-ready");
    expect(combined).not.toContain("30 days is common industry practice");
    expect(combined).not.toContain("fda oos guidance (2006)");
    expect(combined).toContain("stated chemistry-testing scope");
    expect(combined).toContain("licensed compendial");
  });

  it("ships both v2 workbooks and names the authorized decision owner", () => {
    expect(readme).toContain("oos-investigation-v2.xlsx");
    expect(readme).toContain("oos-investigation-v2-fictional-example.xlsx");
    expect(readme).toContain("The authorized site quality unit, not Atlas");
  });
});
