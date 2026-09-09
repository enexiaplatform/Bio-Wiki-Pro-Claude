import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@playwright/test";

for (const width of [1440, 390]) {
  test(`file intake requires source confirmation and preserves provenance at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const events: unknown[] = [];
    const uploads: string[] = [];
    const errors: string[] = [];
    page.on("pageerror", e => errors.push(e.message));
    page.on("request", request => { if (request.url().includes("intake-assistance")) uploads.push(request.postData() ?? ""); });
    await page.route("**/api/auth/me", route => route.fulfill({ status: 401, json: { message: "Guest" } }));
    await page.route("**/api/quality-lab/intake-capabilities", route => route.fulfill({ json: { aiAvailable: false } }));
    await page.route("**/api/quality-lab/funnel-events", route => {
      events.push(route.request().postDataJSON());
      return route.fulfill({ status: 202, json: { accepted: true, recorded: true } });
    });
    await page.goto("/quality-lab/planner");
    await page.getByLabel("Project file", { exact: true }).setInputFiles({ name: "synthetic-project.csv", mimeType: "text/csv", buffer: Buffer.from("Project name,Synthetic confirmation project\nFinished products,42\nFinished batches per month,36\nFinished batches per month,45") });
    await expect(page.getByRole("button", { name: "Use 0 confirmed values in planner" })).toBeDisabled();
    await page.getByLabel("Confirm Project name from B1").check();
    await page.getByLabel("Confirm Finished batches per month from B3").check();
    await page.getByLabel("Confirm Finished batches per month from B4").check();
    await expect(page.getByLabel("Confirm Finished batches per month from B3")).not.toBeChecked();
    await page.getByLabel("Confirm Finished batches per month from B3").check();
    await expect(page.getByLabel("Confirm Finished batches per month from B4")).not.toBeChecked();
    await page.getByText("Missing or unconfirmed inputs", { exact: true }).click();
    await expect(page.getByText("Finished product count — not confirmed", { exact: true })).toBeVisible();
    await page.getByText("Optional AI assistance for unfamiliar labels", { exact: true }).click();
    await expect(page.getByRole("button", { name: "Suggest additional candidates" })).toBeDisabled();
    const accessibility = await new AxeBuilder({ page }).include('[aria-labelledby="file-intake-heading"]').withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(accessibility.violations).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await page.screenshot({ path: `artifacts/intake-review-${width}.png`, fullPage: true });
    await page.getByRole("button", { name: "Use 2 confirmed values in planner" }).click();
    await expect(page.getByLabel("Project name", { exact: true })).toHaveValue("Synthetic confirmation project");
    await page.getByText("Imported input sources · 2 confirmations", { exact: true }).click();
    await expect(page.getByText("synthetic-project.csv → CSV → B3", { exact: true })).toBeVisible();
    await expect(page.getByText("Finished batches per month: 36", { exact: true })).toBeVisible();
    await page.getByLabel("Project name", { exact: true }).fill("Edited project");
    await expect(page.getByText("Edited since import · confirmed value was Synthetic confirmation project", { exact: true })).toBeVisible();
    await expect(page.getByRole("spinbutton", { name: /Finished products/i })).toHaveValue("0");
    await page.getByLabel("Facility country", { exact: true }).fill("Vietnam");
    await page.getByRole("button", { name: "Vietnam", exact: true }).click();
    await page.getByLabel(/Primary decision to resolve/i).fill("Confirm capacity for the synthetic monthly release forecast.");
    await page.getByRole("button", { name: /^Continue$/ }).click();
    await expect(page.getByRole("spinbutton", { name: /Finished-product batches/i })).toHaveValue("36");
    await page.getByRole("button", { name: /^Continue$/ }).click();
    await page.getByRole("button", { name: /Apply recommendation/i }).click();
    await page.getByRole("button", { name: /^Continue$/ }).click();
    await page.getByRole("button", { name: /Compile blueprint/i }).click();
    await page.waitForURL(/\/quality-lab\/projects\/qlp_/);
    await page.reload();
    await page.getByText("Imported input sources · 2 confirmations", { exact: true }).click();
    await expect(page.getByText("synthetic-project.csv → CSV → B3", { exact: true })).toBeVisible();
    await expect(page.getByText("Edited since import · confirmed value was Synthetic confirmation project", { exact: true })).toBeVisible();
    expect(uploads).toEqual([]);
    expect(JSON.stringify(events)).not.toContain("Synthetic confirmation project");
    expect(JSON.stringify(events)).not.toContain("synthetic-project.csv");
    expect(errors).toEqual([]);
  });
}

test("file intake recovers from empty and malformed files without applying inputs", async ({ page }) => {
  await page.goto("/quality-lab/planner");
  await page.getByLabel("Project file", { exact: true }).setInputFiles({ name: "empty.csv", mimeType: "text/csv", buffer: Buffer.from("") });
  await expect(page.getByRole("status").filter({ hasText: "This CSV is empty" })).toBeVisible();
  await page.getByLabel("Project file", { exact: true }).setInputFiles({ name: "broken.csv", mimeType: "text/csv", buffer: Buffer.from('Project name,"unterminated') });
  await expect(page.getByRole("button", { name: /Use .* confirmed values/ })).toHaveCount(0);
  await page.getByLabel("Project file", { exact: true }).setInputFiles({ name: "recovery.csv", mimeType: "text/csv", buffer: Buffer.from("Project name,Synthetic recovered") });
  await expect(page.getByLabel("Confirm Project name from B1")).toBeVisible();
  await expect(page.getByRole("button", { name: "Use 0 confirmed values in planner" })).toBeDisabled();
});

test("file intake AI assistance requires consent and leaves suggestions unconfirmed", async ({ page }) => {
  await page.route("**/api/auth/me", route => route.fulfill({ json: { id: "synthetic-intake-user", email: "intake@example.com", isPro: false, verifiedEmail: true, subscriptionStatus: "free" } }));
  await page.route("**/api/quality-lab/intake-capabilities", route => route.fulfill({ json: { aiAvailable: true } }));
  await page.route("**/api/quality-lab/funnel-events", route => route.fulfill({ status: 202, json: { accepted: true, recorded: true } }));
  const requests: Record<string, unknown>[] = [];
  let releaseResponse: (() => void) | undefined;
  await page.route("**/api/quality-lab/intake-assistance", async route => {
    requests.push(route.request().postDataJSON());
    if (requests.length === 1) {
      await new Promise<void>(resolve => { releaseResponse = resolve; });
      await route.fulfill({ json: { version: "ai-csv-field-map/v1", mappings: [{ field: "finishedBatchesPerMonth", locator: "B2" }] } });
    } else await route.fulfill({ status: 503, json: { message: "Unavailable" } });
  });
  await page.goto("/quality-lab/planner");
  await page.getByLabel("Project file", { exact: true }).setInputFiles({ name: "synthetic-ai.csv", mimeType: "text/csv", buffer: Buffer.from("Project name,Synthetic AI review\nExpected releases each month,36") });
  await page.getByLabel("Confirm Project name from B1").check();
  await page.getByText("Optional AI assistance for unfamiliar labels", { exact: true }).click();
  const suggest = page.getByRole("button", { name: "Suggest additional candidates" });
  await expect(suggest).toBeDisabled();
  expect(requests).toHaveLength(0);
  await page.getByLabel(/I authorize sending the eligible visible source text/).check();
  await suggest.click();
  await expect.poll(() => requests.length).toBe(1);
  await expect(page.getByLabel("Project file", { exact: true })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Use 1 confirmed values in planner" })).toBeDisabled();
  releaseResponse!();
  const candidate = page.getByLabel("Confirm Finished batches per month from B2");
  await expect(candidate).not.toBeChecked();
  await expect(page.getByLabel("Confirm Project name from B1")).toBeChecked();
  expect(Object.keys(requests[0]).sort()).toEqual(["cells", "consent"]);
  expect(JSON.stringify(requests[0])).not.toContain("synthetic-ai.csv");
  await candidate.check();
  await suggest.click();
  await expect(page.getByRole("status").filter({ hasText: "AI assistance is unavailable" })).toBeVisible();
  await expect(candidate).toBeChecked();
  await page.getByRole("button", { name: "Use 2 confirmed values in planner" }).click();
  await page.getByText("Imported input sources · 2 confirmations", { exact: true }).click();
  await expect(page.getByText(/ai-csv-field-map\/v1 · requires-review/)).toBeVisible();
});
