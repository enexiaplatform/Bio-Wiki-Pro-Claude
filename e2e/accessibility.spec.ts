import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

type AuditTarget = {
  name: string;
  path: string;
  readyHeading: RegExp;
  viewport?: { width: number; height: number };
};

const strategicTargets: AuditTarget[] = [
  { name: "homepage", path: "/", readyHeading: /A quality lab plan your whole project team can challenge/i },
  { name: "Quality Lab landing", path: "/quality-lab", readyHeading: /See the blueprint take shape/i },
  { name: "Atlas Evidence", path: "/evidence", readyHeading: /Trace evidence to the decision/i },
  { name: "Quality Lab planner intake", path: "/quality-lab/planner", readyHeading: /You do not need to know every lab number/i },
  { name: "public Blueprint sample", path: "/quality-lab/sample", readyHeading: /See what a controlled Blueprint looks like before you buy/i },
  { name: "Method Navigator", path: "/methods", readyHeading: /Ask the method question/i },
  { name: "Academy trust-corridor lesson", path: "/library/method-suitability-nonsterile-products", readyHeading: /Method suitability for non-sterile products/i },
  { name: "Blog trust-corridor guide", path: "/blog/how-to-validate-a-quality-lab-domain-pack", readyHeading: /How to validate a Quality Lab Domain Pack/i },
  { name: "pricing", path: "/pricing", readyHeading: /Start with the decision you need to make/i },
  { name: "All Products Decision Router", path: "/products", readyHeading: /Choose the decision\. Atlas routes the work/i },
  { name: "Atlas Pro review canvas", path: "/pro", readyHeading: /Build this month's quality decision/i },
  { name: "Career Proof Studio", path: "/career", readyHeading: /Turn your next role into a proof plan/i },
  { name: "mobile Blueprint sample", path: "/quality-lab/sample", readyHeading: /See what a controlled Blueprint looks like before you buy/i, viewport: { width: 390, height: 844 } },
  { name: "mobile Atlas Evidence", path: "/evidence", readyHeading: /Trace evidence to the decision/i, viewport: { width: 390, height: 844 } },
  { name: "mobile Method Navigator", path: "/methods", readyHeading: /Ask the method question/i, viewport: { width: 390, height: 844 } },
  { name: "mobile All Products Decision Router", path: "/products", readyHeading: /Choose the decision\. Atlas routes the work/i, viewport: { width: 390, height: 844 } },
  { name: "mobile Atlas Pro review canvas", path: "/pro", readyHeading: /Build this month's quality decision/i, viewport: { width: 390, height: 844 } },
  { name: "mobile Career Proof Studio", path: "/career", readyHeading: /Turn your next role into a proof plan/i, viewport: { width: 390, height: 844 } },
];

async function preparePage(page: Page, target: AuditTarget) {
  if (target.viewport) await page.setViewportSize(target.viewport);
  await page.route("**/api/quality-lab/funnel-events", (route) => route.fulfill({
    status: 202,
    contentType: "application/json",
    body: JSON.stringify({ accepted: true, recorded: true }),
  }));
  await page.goto(target.path);
  await expect(page.locator("main#main")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: target.readyHeading })).toBeVisible();
  // Axe computes contrast from the rendered pixels. Let route-entry opacity
  // transitions settle so a transient fade is not reported as the final color.
  await page.waitForTimeout(1_200);
}

function readableViolations(violations: Awaited<ReturnType<AxeBuilder["analyze"]>>["violations"]) {
  return violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    help: violation.help,
    nodes: violation.nodes.map((node) => ({ target: node.target, summary: node.failureSummary })),
  }));
}

test.describe("automated accessibility", () => {
  test.use({ reducedMotion: "reduce" });

  for (const target of strategicTargets) {
    test(`${target.name} passes WCAG 2.1 A/AA automated accessibility checks`, async ({ page }) => {
      await preparePage(page, target);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      expect(readableViolations(results.violations)).toEqual([]);
    });
  }

  test("planner keyboard order exposes focus, selection state and locked-step reason", async ({ page }) => {
    await page.goto("/quality-lab/planner");
    const guided = page.getByRole("button", { name: /Guide me from the decision/i });
    const blank = page.getByRole("button", { name: /Enter known site data/i });

    await guided.focus();
    await expect(guided).toBeFocused();
    expect(await guided.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe("none");
    await page.keyboard.press("Tab");
    await expect(blank).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Enter");

    await expect(page.getByRole("heading", { name: /Build with Atlas guidance/i })).toBeVisible();
    await expect(page.getByRole("button", { name: "Non-sterile pharma" })).toHaveAttribute("aria-pressed", "true");
    const lockedStep = page.getByRole("button", { name: /Testing demand\. Locked\. Complete Project basis before opening Testing demand/i });
    await expect(lockedStep).toBeDisabled();
    await expect(lockedStep).toHaveAttribute("title", "Complete Project basis before opening Testing demand.");
  });

  for (const target of [
    { name: "homepage", path: "/" },
    { name: "planner intake", path: "/quality-lab/planner" },
    { name: "All Products Decision Router", path: "/products" },
    { name: "Atlas Pro review canvas", path: "/pro" },
    { name: "Career Proof Studio", path: "/career" },
  ]) {
    test(`${target.name} reflows without document-level horizontal scrolling at 320 CSS pixels`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 640 });
      await page.goto(target.path);
      await expect(page.locator("main#main")).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(1);
    });
  }
});
