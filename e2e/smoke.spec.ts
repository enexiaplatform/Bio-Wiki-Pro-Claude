import { test, expect } from "@playwright/test";

// Opt-in: the full purchase/subscribe flow needs a running app, Stripe test
// mode, and a logged-in test user. Set E2E_RUN=1 to enable.
const RUN = process.env.E2E_RUN === "1";

test.describe("smoke: purchase & subscribe (test mode)", () => {
  test.skip(!RUN, "Set E2E_RUN=1 (+ running app, Stripe test mode) to run e2e smoke");

  test("GMP kit page renders and buy CTA starts checkout", async ({ page }) => {
    await page.goto("/vi/toolkits/gmp-audit-kit");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // A logged-in user clicking buy is redirected to Stripe Checkout.
    // (Requires an authenticated session; otherwise it routes to /signup.)
    const buy = page.getByRole("button", { name: /Mua ngay|Buy/i }).first();
    await expect(buy).toBeVisible();
    await buy.click();
    await page.waitForURL(/checkout\.stripe\.com|\/signup/, { timeout: 15_000 });
  });

  test("upgrade page renders Pro subscribe CTA", async ({ page }) => {
    await page.goto("/vi/upgrade");
    await expect(page.getByText(/Pro/i).first()).toBeVisible();
    // Subscribe (authenticated) → Stripe; guest → login.
    const cta = page.getByTestId("button-subscribe-pro").or(page.getByTestId("button-login-to-upgrade"));
    await expect(cta.first()).toBeVisible();
  });
});
