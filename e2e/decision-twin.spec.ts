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
    const workspace = page.getByRole("navigation", { name: "Blueprint workspace", exact: true });
    await expect(workspace.getByRole("link")).toHaveCount(4);
    await workspace.screenshot({ path: `artifacts/blueprint-workspace-${width}.png` });
    await workspace.getByRole("link", { name: "Evidence", exact: true }).click();
    await expect(page.locator("#evidence-trace")).toBeVisible();
    await expect(page.locator("#evidence-trace")).toBeFocused();
    await expect(page.getByRole("navigation", { name: "Blueprint report sections", exact: true })).toBeHidden();
    await page.getByText("Browse technical report sections", { exact: true }).click();
    await expect(page.getByRole("navigation", { name: "Blueprint report sections", exact: true })).toBeVisible();
    await workspace.getByRole("link", { name: "Decision Twin", exact: true }).click();
    await expect(page.locator("#decision-twin")).toBeFocused();
    await page
      .getByRole("button", { name: "Open Decision Twin", exact: true })
      .click();
    const twin = page.locator("#decision-twin");
    await expect(
      twin.getByRole("button", { name: "Save as separate browser scenario" }),
    ).toBeDisabled();
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

test("Decision Twin rejects invalid assumptions and recovers without changing the saved basis", async ({
  page,
}) => {
  const baseline = createQualityLabProject(
    defaultQualityLabInput,
    "qlp_twin_validation",
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
  await page.goto(`/quality-lab/projects/${baseline.id}`);
  await page
    .getByRole("button", { name: "Open Decision Twin", exact: true })
    .click();
  const twin = page.locator("#decision-twin");
  await twin.getByLabel("Shifts per day", { exact: true }).fill("");
  await twin.getByRole("button", { name: "Compare assumptions" }).click();
  await expect(twin.getByRole("alert")).toContainText("Enter valid values");
  await expect(
    twin.getByRole("button", { name: "Save as separate browser scenario" }),
  ).toHaveCount(0);
  await twin.getByLabel("Shifts per day", { exact: true }).fill("2");
  await twin.getByRole("button", { name: "Compare assumptions" }).click();
  await expect(
    twin.getByRole("button", { name: "Save as separate browser scenario" }),
  ).toBeEnabled();
});

test("Decision Twin reconnects explicitly accepted specialist inputs across pages and revisions", async ({
  page,
}) => {
  const baseline = createQualityLabProject(
    defaultQualityLabInput,
    "qlp_twin_connected",
    "illustrative-example",
  );
  await page.addInitScript((project) => {
    if (!localStorage.getItem("lsa:quality-lab-projects:v1"))
      localStorage.setItem(
        "lsa:quality-lab-projects:v1",
        JSON.stringify([project]),
      );
  }, baseline);
  await page.route("**/api/auth/me", (route) =>
    route.fulfill({ status: 401, json: { message: "Guest" } }),
  );
  await page.route("**/api/quality-lab/funnel-events", (route) =>
    route.fulfill({ status: 202, json: { accepted: true, recorded: true } }),
  );
  for (const kind of [
    "turnaround",
    "equipment-resilience",
    "non-routine-load",
    "skill-shift-coverage",
    "operating-model",
  ]) {
    await page.goto(`/quality-lab/${kind}?project=${baseline.id}`);
    const handoff = page.getByRole("region", {
      name: "Decision Twin analysis basis",
    });
    await expect(
      handoff.getByRole("button", { name: "Use this basis in the Twin" }),
    ).toBeDisabled();
    await handoff
      .getByLabel("I reviewed this analysis basis for scenario comparison.")
      .check();
    if(kind==="turnaround"){
      await page.getByRole("spinbutton",{name:/Deployable analysts/}).fill("4");
      await expect(handoff.getByRole("button",{name:"Use this basis in the Twin"})).toBeDisabled();
      await handoff.getByLabel("I reviewed this analysis basis for scenario comparison.").check();
    }
    await handoff
      .getByRole("button", { name: "Use this basis in the Twin" })
      .click();
    await expect(handoff.getByRole("status")).toContainText(
      "Analysis basis saved in a new browser revision",
    );
    if(kind==="turnaround"){
      await page.getByRole("spinbutton",{name:/Deployable analysts/}).fill("5");
      await handoff.getByRole("button",{name:"Restore accepted basis"}).click();
      await expect(page.getByRole("spinbutton",{name:/Deployable analysts/})).toHaveValue("4");
    }
  }
  const saved = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("lsa:quality-lab-projects:v2") ?? "{}")
        .projects[0],
  );
  expect(saved.input.specialistBasis).toHaveLength(5);
  expect(saved.revisions.length).toBeGreaterThanOrEqual(6);
  await page.goto(`/quality-lab/projects/${baseline.id}`);
  await page
    .getByRole("button", { name: "Open Decision Twin", exact: true })
    .click();
  const twin = page.locator("#decision-twin");
  await expect(
    twin.getByRole("region", { name: "Specialist consequences" }),
  ).toBeVisible();
  await expect(
    twin.getByText("Analysis basis needed", { exact: true }),
  ).toHaveCount(0);
  await twin
    .getByLabel("Finished batches per month", { exact: true })
    .fill("60");
  await twin
    .getByRole("button", { name: "Compare assumptions", exact: true })
    .click();
  await expect(twin.getByText(/Execution utilization:/)).toBeVisible();
  const thresholdSearch = twin.getByRole("region", { name: "Specialist threshold search" });
  await expect(thresholdSearch).toContainText("First change at");
  await expect(thresholdSearch).toContainText("Turnaround");
  for(const width of [1440,390]){
    await page.setViewportSize({width,height:900});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    const audit=await new AxeBuilder({page}).include('#decision-twin').withTags(["wcag2a","wcag2aa","wcag21aa"]).analyze();
    expect(audit.violations).toEqual([]);
    await twin.getByRole("region",{name:"Specialist consequences"}).screenshot({path:`artifacts/twin-specialists-${width}.png`});
    await thresholdSearch.screenshot({path:`artifacts/twin-threshold-${width}.png`});
  }
  await twin.getByLabel("Shifts per day", { exact: true }).fill("2");
  await twin
    .getByRole("button", { name: "Compare assumptions", exact: true })
    .click();
  await expect(
    twin.getByText("Review the analysis basis", { exact: true }),
  ).toHaveCount(5);
});
