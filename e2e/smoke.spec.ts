import { test, expect } from "@playwright/test";

// Public smoke tests — no auth, no Stripe, no DB writes. These run against a
// dev/prod server (auto-started via playwright.config webServer, or set
// E2E_BASE_URL). They cover routing, content rendering, and that server-side
// Pro gating does not leak bodies to guests.
test.describe("public smoke", () => {
  test("home renders", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /BioWikiPro/i }).first()).toBeVisible();
  });

  test("academy library lists lessons", async ({ page }) => {
    await page.goto("/academy");
    await expect(page.getByRole("link", { name: /Learning paths/i }).or(page.getByText(/Learning paths/i)).first()).toBeVisible();
    await expect(page.locator('a[href^="/library/"]').first()).toBeVisible();
  });

  test("library hub lists all paths", async ({ page }) => {
    await page.goto("/library");
    await expect(page.getByRole("heading", { name: /The library/i })).toBeVisible();
    await expect(page.locator('a[href^="/paths/"]').first()).toBeVisible();
  });

  test("free lesson renders its body", async ({ page }) => {
    await page.goto("/library/sterility-testing-basics");
    // Free content is returned in full by the server.
    await expect(page.getByText(/min read|On this page|sterility/i).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Pro content/i)).toHaveCount(0);
  });

  test("pro lesson is gated for guests (no body leak)", async ({ page }) => {
    await page.goto("/library/computer-system-validation");
    // Guests get the paywall, never the body.
    await expect(page.getByText(/Pro content|Upgrade to Pro/i).first()).toBeVisible({ timeout: 15_000 });
  });

  test("blog and pricing render", async ({ page }) => {
    await page.goto("/blog");
    await expect(page.getByRole("heading", { name: /^Blog$/i })).toBeVisible();
    await page.goto("/pricing");
    await expect(page.getByText(/Pro/i).first()).toBeVisible();
  });

  test("certificate is gated until a path is complete", async ({ page }) => {
    await page.goto("/certificate/validation-essentials");
    await expect(page.getByText(/Certificate locked/i)).toBeVisible();
  });
});

// Full purchase/subscribe flow — needs a logged-in user + Stripe test mode.
// Opt-in via E2E_RUN=1.
const RUN = process.env.E2E_RUN === "1";
test.describe("purchase & subscribe (test mode)", () => {
  test.skip(!RUN, "Set E2E_RUN=1 (+ auth + Stripe test mode) to run");

  test("upgrade page shows a Pro CTA", async ({ page }) => {
    await page.goto("/upgrade");
    const cta = page.getByTestId("button-subscribe-pro").or(page.getByTestId("button-login-to-upgrade"));
    await expect(cta.first()).toBeVisible();
  });

  test("GMP kit buy CTA starts checkout or routes to signup", async ({ page }) => {
    await page.goto("/toolkits/gmp-audit-kit");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const buy = page.getByRole("button", { name: /Buy|Get|Upgrade/i }).first();
    await buy.click();
    await page.waitForURL(/checkout\.stripe\.com|\/register|\/login/, { timeout: 15_000 });
  });
});
