import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@playwright/test";
import {
  createQualityLabProject,
  defaultQualityLabInput,
} from "../shared/quality-lab";

for (const width of [1440, 390]) {
  test(`Decision Twin compares and saves a separate scenario at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const baseline = createQualityLabProject(
      defaultQualityLabInput,
      "qlp_twin_synthetic",
      "illustrative-example",
    );
    await page.addInitScript(
      (project) =>
        localStorage.setItem(
          "lsa:quality-lab-projects:v1",
          JSON.stringify([project]),
        ),
      baseline,
    );
    await page.route("**/api/auth/me", (route) =>
      route.fulfill({ status: 401, json: { message: "Guest" } }),
    );
    await page.route("**/api/quality-lab/funnel-events", (route) =>
      route.fulfill({ status: 202, json: { accepted: true, recorded: true } }),
    );
    await page.goto(`/quality-lab/projects/${baseline.id}`);
    await page
      .getByRole("button", { name: "Open Decision Twin", exact: true })
      .click();
    const twin = page.locator("#decision-twin");
    await expect(twin.getByRole("button", { name: "Save as separate browser scenario" })).toBeDisabled();
    await expect(
      twin.getByText(/First modeled equipment quantity change found at 53/),
    ).toBeVisible();
    await twin
      .getByLabel("Finished batches per month", { exact: true })
      .fill("60");
    await expect(
      twin.getByText(
        "Assumptions changed. Compare again to refresh the results.",
      ),
    ).toBeVisible();
    await twin
      .getByRole("button", { name: "Compare assumptions", exact: true })
      .click();
    await expect(
      twin.getByRole("heading", {
        name: "Equipment consequences",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      twin.getByText(/5 → 6 units · planning horizon/).first(),
    ).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
    const audit = await new AxeBuilder({ page })
      .include("#decision-twin")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(audit.violations).toEqual([]);
    await twin.screenshot({ path: `artifacts/decision-twin-${width}.png` });
    await twin
      .getByRole("button", { name: "Save as separate browser scenario" })
      .click();
    await expect(
      twin.getByRole("link", { name: "Open saved scenario" }),
    ).toBeVisible();
    const projects = await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("lsa:quality-lab-projects:v2") ?? "{}")
          .projects,
    );
    expect(projects).toHaveLength(2);
    expect(
      projects.find((p: any) => p.id === baseline.id).input
        .finishedBatchesPerMonth,
    ).toBe(30);
    const saved = projects.find((p: any) => p.id !== baseline.id);
    expect(saved.input.finishedBatchesPerMonth).toBe(60);
    expect(saved.origin).toBe("illustrative-example");
    await twin.getByRole("link", { name: "Open saved scenario" }).click();
    await expect(page).toHaveURL(
      new RegExp(`/quality-lab/projects/${saved.id}$`),
    );
  });
}

test("Decision Twin rejects invalid assumptions and recovers without changing the saved basis", async ({ page }) => {
  const baseline=createQualityLabProject(defaultQualityLabInput,"qlp_twin_validation","illustrative-example");
  await page.addInitScript(project=>localStorage.setItem("lsa:quality-lab-projects:v1",JSON.stringify([project])),baseline);
  await page.goto(`/quality-lab/projects/${baseline.id}`);
  await page.getByRole("button",{name:"Open Decision Twin",exact:true}).click();
  const twin=page.locator("#decision-twin");
  await twin.getByLabel("Shifts per day",{exact:true}).fill("");
  await twin.getByRole("button",{name:"Compare assumptions"}).click();
  await expect(twin.getByRole("alert")).toContainText("Enter valid values");
  await expect(twin.getByRole("button",{name:"Save as separate browser scenario"})).toHaveCount(0);
  await twin.getByLabel("Shifts per day",{exact:true}).fill("2");
  await twin.getByRole("button",{name:"Compare assumptions"}).click();
  await expect(twin.getByRole("button",{name:"Save as separate browser scenario"})).toBeEnabled();
});
