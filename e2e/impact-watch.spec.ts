import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@playwright/test";
import { createQualityLabProject, defaultQualityLabInput } from "../shared/quality-lab";
import { triageRegulatoryUpdate } from "../shared/regulatory-monitor";

for (const width of [1440, 390]) {
  test(`Project Impact Watch requires explicit review and retains its basis at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const project = createQualityLabProject(defaultQualityLabInput, "qlp_impact_synthetic", "illustrative-example");
    const update = triageRegulatoryUpdate({ sourceId: "fda-drugs", title: "Synthetic method suitability draft", url: "https://www.fda.gov/synthetic-review", publishedAt: "2026-09-08T00:00:00Z" });
    const unrelated = triageRegulatoryUpdate({ sourceId: "fda-drugs", title: "Synthetic unrelated administrative notice", url: "https://www.fda.gov/synthetic-unrelated", publishedAt: "2026-09-08T00:00:00Z" });
    await page.addInitScript((item) => { if (!localStorage.getItem("lsa:quality-lab-projects:v1")) localStorage.setItem("lsa:quality-lab-projects:v1", JSON.stringify([item])); }, project);
    await page.route("**/api/auth/me", (route) => route.fulfill({ status: 401, json: { message: "Guest" } }));
    await page.route("**/api/regulatory-updates", (route) => route.fulfill({ json: { generatedAt: "2026-09-08T00:00:00Z", items: [update, unrelated], sources: [{ id: "fda-drugs", ok: true, itemCount: 2 }] } }));
    await page.route("**/api/quality-lab/funnel-events", (route) => route.fulfill({ status: 202, json: { accepted: true, recorded: true } }));
    await page.goto("/monitor");
    const watch = page.getByRole("region", { name: "Project Impact Watch", exact: true });
    await watch.getByLabel("Saved browser Blueprint").selectOption(project.id);
    await expect(watch.getByText("1 candidate update · select to inspect review status", { exact: true })).toBeVisible();
    await expect(watch.getByText("1 update with no bounded project-record match", { exact: true })).toBeVisible();
    await expect(watch.getByRole("option", { name: /Synthetic unrelated administrative notice/ })).toHaveCount(0);
    await watch.getByLabel("Candidate update to review").selectOption(update.id);
    await expect(watch.getByText(/Potentially related project records/)).toBeVisible();
    const save = watch.getByRole("button", { name: "Record impact review" });
    await expect(save).toBeDisabled();
    await watch.getByRole("combobox", { name: "Disposition", exact: true }).selectOption("deferred");
    await watch.getByLabel("Reviewer role", { exact: true }).fill("QA");
    await watch.getByLabel("Review rationale", { exact: true }).fill("Synthetic review awaits qualified method applicability review.");
    await expect(save).toBeDisabled();
    await watch.getByRole("checkbox").check();
    await save.click();
    await expect(watch.getByText(/Recorded disposition: deferred/)).toBeVisible();
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("lsa:quality-lab-projects:v2") ?? "{}").projects[0]);
    expect(saved.input.impactReviewHistory).toHaveLength(1);
    expect(saved.blueprint.future).toEqual(project.blueprint.future);
    expect((await new AxeBuilder({ page }).include('section[aria-labelledby="project-impact-heading"]').withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await watch.screenshot({ path: `artifacts/impact-watch-${width}.png` });
    await page.reload();
    await watch.getByLabel("Saved browser Blueprint").selectOption(project.id);
    await watch.getByLabel("Candidate update to review").selectOption(update.id);
    await expect(watch.getByText(/Recorded disposition: deferred/)).toBeVisible();
  });
}

test("Project Impact Watch keeps unmatched updates out of an empty project queue", async ({ page }) => {
  const project = createQualityLabProject(defaultQualityLabInput, "qlp_impact_empty", "illustrative-example");
  const update = triageRegulatoryUpdate({ sourceId: "fda-drugs", title: "Synthetic unrelated administrative notice", url: "https://www.fda.gov/synthetic-unrelated", publishedAt: "2026-09-08T00:00:00Z" });
  await page.addInitScript((item) => localStorage.setItem("lsa:quality-lab-projects:v1", JSON.stringify([item])), project);
  await page.route("**/api/auth/me", (route) => route.fulfill({ status: 401, json: { message: "Guest" } }));
  await page.route("**/api/regulatory-updates", (route) => route.fulfill({ json: { generatedAt: "2026-09-08T00:00:00Z", items: [update], sources: [{ id: "fda-drugs", ok: true, itemCount: 1 }] } }));
  await page.goto(`/monitor?project=${project.id}`);
  const watch = page.getByRole("region", { name: "Project Impact Watch", exact: true });
  await expect(watch.getByText("No candidate project review is waiting.", { exact: true })).toBeVisible();
  await expect(watch.getByRole("combobox", { name: "Candidate update to review" })).toHaveCount(0);
  await expect(watch.getByRole("link", { name: "Back to this Blueprint" })).toHaveAttribute("href", `/quality-lab/projects/${project.id}#blueprint-challenge`);
  await expect(watch.getByRole("link", { name: "Browse the full official feed" })).toHaveAttribute("href", "#regulatory-feed");
});

test("Project Impact Watch fails closed when official feeds are unavailable", async ({ page }) => {
  const project = createQualityLabProject(defaultQualityLabInput, "qlp_impact_unavailable", "illustrative-example");
  const update = triageRegulatoryUpdate({ sourceId: "fda-drugs", title: "Synthetic method suitability draft", url: "https://www.fda.gov/synthetic-review", publishedAt: "2026-09-08T00:00:00Z" });
  await page.addInitScript((item) => localStorage.setItem("lsa:quality-lab-projects:v1", JSON.stringify([item])), project);
  await page.route("**/api/auth/me", (route) => route.fulfill({ status: 401, json: { message: "Guest" } }));
  await page.route("**/api/regulatory-updates", (route) => route.fulfill({ json: { generatedAt: "2026-09-08T00:00:00Z", items: [update], sources: [{ id: "fda-drugs", ok: false, itemCount: 0 }] } }));
  await page.goto(`/monitor?project=${project.id}`);
  const watch = page.getByRole("region", { name: "Project Impact Watch", exact: true });
  await expect(watch.getByText(/No updates from currently available official feeds/)).toBeVisible();
  await expect(watch.getByRole("button", { name: "Record impact review" })).toHaveCount(0);
  await expect(watch.getByRole("option", { name: /Synthetic method suitability/ })).toHaveCount(0);
});
