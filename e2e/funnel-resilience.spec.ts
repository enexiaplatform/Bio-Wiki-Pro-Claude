import { test, expect } from "@playwright/test";
import { createQualityLabProject, defaultQualityLabInput } from "../shared/quality-lab";

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  test(`Pro Workbench preview fits the screen with a saved example at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.route("**/api/auth/me", (route) => route.fulfill({ status: 401, json: { message: "Guest" } }));
    const example = createQualityLabProject(defaultQualityLabInput, "qlp_layout_example", "illustrative-example");
    await page.addInitScript((project) => localStorage.setItem("lsa:quality-lab-projects:v1", JSON.stringify([project])), example);
    await page.goto("/pro/lab-workbench");
    await expect(page.getByRole("heading", { name: "Included with Atlas Pro" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
    await page.screenshot({ path: `artifacts/phase0-audit/fixed-workbench-${viewport.width}.png` });
  });

  test(`Blueprint intake remains usable during funnel recovery at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const events: Record<string, unknown>[] = [];
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    await page.route("**/api/quality-lab/funnel-events", async (route) => {
      const event = route.request().postDataJSON();
      if (event.stage !== "planner_started") {
        await route.fulfill({ status: 202, json: { accepted: true, recorded: true } });
        return;
      }
      events.push(event);
      await route.fulfill(events.length < 3
        ? { status: 503, json: { accepted: false, recorded: false } }
        : { status: 202, json: { accepted: true, recorded: true } });
    });
    await page.goto("/quality-lab/planner");
    await page.getByRole("button", { name: /Atlas-guided/i }).click();
    await page.getByLabel("Project name").fill("Synthetic private intake test");
    await expect(page.getByRole("heading", { name: "Build with Atlas guidance." })).toBeVisible();
    await expect.poll(() => events.length, { timeout: 12000 }).toBe(3);
    expect(events[1]).toEqual(events[0]);
    expect(events[2]).toEqual(events[0]);
    expect(JSON.stringify(events)).not.toContain("Synthetic private intake test");
    await expect(page.getByLabel("Project name")).toHaveValue("Synthetic private intake test");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect(pageErrors).toEqual([]);
  });
}
