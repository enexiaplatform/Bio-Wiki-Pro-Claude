import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@playwright/test";
import { createQualityLabProject, defaultQualityLabInput } from "../shared/quality-lab";

for (const width of [1440, 390]) {
  test(`Challenge ranks traceable decisions and preserves project context at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const baseline = createQualityLabProject(defaultQualityLabInput, "qlp_challenge_synthetic", "illustrative-example");
    await page.addInitScript((project) => localStorage.setItem("lsa:quality-lab-projects:v1", JSON.stringify([project])), baseline);
    await page.route("**/api/auth/me", (route) => route.fulfill({ status: 401, json: { message: "Guest" } }));
    const events: any[] = [];
    await page.route("**/api/quality-lab/funnel-events", (route) => {
      events.push(route.request().postDataJSON());
      return route.fulfill({ status: 202, json: { accepted: true, recorded: true } });
    });
    await page.goto(`/quality-lab/projects/${baseline.id}`);
    await expect(page.getByRole("button", { name: "Finance", exact: true })).toBeVisible();
    const savedBefore = await page.evaluate(() => localStorage.getItem("lsa:quality-lab-projects:v2"));
    await page.getByRole("button", { name: "Finance", exact: true }).click();
    await expect(page.getByText("Finance focus:", { exact: true })).toBeVisible();
    await page.locator("#decision-brief").screenshot({ path: `artifacts/finance-lens-${width}.png` });
    await page.getByRole("button", { name: "Executive", exact: true }).click();
    await expect(page.getByText("Executive focus:", { exact: true })).toBeVisible();
    await page.locator("#decision-brief").screenshot({ path: `artifacts/executive-lens-${width}.png` });
    expect(await page.evaluate(() => localStorage.getItem("lsa:quality-lab-projects:v2"))).toBe(savedBefore);
    const challenge = page.getByRole("region", { name: "Challenge this Blueprint", exact: true });
    await challenge.getByRole("button", { name: "Show decision priorities" }).click();
    await expect(challenge.getByRole("listitem")).toHaveCount(5);
    await challenge.locator("summary").filter({ hasText: "Why this is ranked here" }).first().click();
    await expect(challenge.getByText(/Decision impact/).first()).toBeVisible();
    expect((await new AxeBuilder({ page }).include("#blueprint-challenge").withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await challenge.screenshot({ path: `artifacts/challenge-${width}.png` });
    await challenge.getByRole("button", { name: /Show all .* findings/ }).click();
    expect(await challenge.getByRole("listitem").count()).toBeGreaterThan(5);
    await challenge.locator(`a[href="/quality-lab/sensitivity?project=${baseline.id}"]`).first().click();
    await expect(page).toHaveURL(new RegExp(`/quality-lab/sensitivity\\?project=${baseline.id}`));
    await expect.poll(() => events.some((event) => event.stage === "challenge_action_taken")).toBe(true);
    expect(events.some((event) => event.stage === "decision_insight_reached")).toBe(true);
    expect(JSON.stringify(events)).not.toContain(baseline.id);
  });
}
