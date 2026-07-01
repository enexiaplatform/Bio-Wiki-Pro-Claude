import { test, expect } from "@playwright/test";

// Public smoke tests — no auth, no Stripe, no DB writes. These run against a
// dev/prod server (auto-started via playwright.config webServer, or set
// E2E_BASE_URL). They cover routing, content rendering, and that server-side
// Pro gating does not leak bodies to guests.
test.describe("public smoke", () => {
  test("home renders", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /Life Science Atlas/i }).first()).toBeVisible();
  });

  test("academy library lists lessons", async ({ page }) => {
    await page.goto("/academy");
    await expect(page.getByRole("link", { name: /Learning paths/i }).or(page.getByText(/Learning paths/i)).first()).toBeVisible();
    await expect(page.locator('a[href^="/library/"]').first()).toBeVisible();
  });

  test("the /library index redirects into the unified Learn hub", async ({ page }) => {
    await page.goto("/library");
    await expect(page).toHaveURL(/\/academy$/);
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

  // Subscription-first pivot: the GMP kit is folded into Pro — its page must
  // drive Pro (route to /pricing) and NOT start a standalone one-time checkout.
  test("GMP kit page promotes Pro, not a standalone purchase", async ({ page }) => {
    await page.goto("/toolkits/gmp-audit-kit");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // No standalone price anywhere on the page.
    await expect(page.getByText(/\$59/)).toHaveCount(0);
    // The lead-magnet capture (guest nurture toward Pro) is present.
    await expect(page.getByText(/Free download/i).first()).toBeVisible();
    // Primary CTA routes to /pricing (client navigation — no Stripe needed).
    const cta = page.getByRole("button", { name: /Unlock with Pro/i }).first();
    await expect(cta).toBeVisible();
    await cta.click();
    await page.waitForURL(/\/pricing$/, { timeout: 10_000 });
  });

  test("pricing & upgrade surface that toolkits are included in Pro", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByText(/toolkits/i).first()).toBeVisible();
    await page.goto("/upgrade");
    await expect(page.getByText(/toolkit/i).first()).toBeVisible();
  });

  // Workflow Learning OS: the front door is workflow-first.
  test("homepage is workflow-first", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /What workflow are you working on/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Start with Microbiology QC/i })).toBeVisible();
    // Subscription-first: no standalone kit price leaks onto the landing page.
    await expect(page.getByText(/\$59/)).toHaveCount(0);
  });

  test("workflow atlas lists workflows", async ({ page }) => {
    await page.goto("/workflows");
    await expect(page.getByRole("heading", { name: /What workflow are you working on/i })).toBeVisible();
    await expect(page.locator('a[href^="/workflows/"]').first()).toBeVisible();
  });

  test("workflow detail renders the operational template", async ({ page }) => {
    await page.goto("/workflows/environmental-monitoring");
    await expect(page.getByRole("heading", { name: /^Environmental Monitoring$/i })).toBeVisible();
    await expect(page.getByText(/Step-by-step workflow/i)).toBeVisible();
    await expect(page.getByText(/Critical control points/i)).toBeVisible();
    await expect(page.getByText(/Common mistakes/i)).toBeVisible();
  });

  test("toolkit library lists toolkits with downloads available", async ({ page }) => {
    await page.goto("/toolkits");
    await expect(page.getByRole("heading", { name: /Checklists & toolkits/i })).toBeVisible();
    await expect(page.getByText(/GMP Audit Survival Kit/i).first()).toBeVisible();
    // Toolkits are real, gated downloads — guests see a View/Open kit CTA.
    await expect(page.getByRole("link", { name: /View kit|Open kit/i }).first()).toBeVisible();
  });

  test("tools index lists the tools, each linking to its own page", async ({ page }) => {
    await page.goto("/tools");
    await expect(page.getByRole("heading", { name: /Audit Readiness Scorecard/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Sterility Test Method Selector/i })).toBeVisible();
    // Each card links to a standalone, indexable tool page.
    await expect(page.locator('a[href="/tools/sterility-test-method-selector"]').first()).toBeVisible();
    await expect(page.locator('a[href="/tools/endotoxin-limit-calculator"]').first()).toBeVisible();
  });

  test("a tool detail page runs the interactive tool", async ({ page }) => {
    await page.goto("/tools/sterility-test-method-selector");
    await expect(page.getByRole("heading", { name: /Sterility Test Method Selector/i }).first()).toBeVisible();
    // Static-logic switch: pick a non-filterable product → Direct inoculation.
    await page.getByRole("button", { name: /Oily, viscous, or non-filterable/i }).click();
    await expect(page.getByRole("heading", { name: /^Direct inoculation$/i })).toBeVisible();
  });

  test("the endotoxin calculator computes a limit and MVD", async ({ page }) => {
    await page.goto("/tools/endotoxin-limit-calculator");
    // Defaults (K=5, M=10 mg/kg, λ=0.25, c=10) → EL = 0.5 EU/mg, MVD = 20.
    // (.first() — the formula also appears in the worked example; 15s for the cold lazy-route compile.)
    await expect(page.getByText("EL = K / M = 5 / 10").first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/= \(0\.5 .{1,3} 10\) \/ 0\.25/).first()).toBeVisible();
  });

  test("the F0 sterilization calculator computes lethality", async ({ page }) => {
    await page.goto("/tools/sterilization-f0-calculator");
    // Defaults: 121.1 °C for 15 min at z=10, ref 121.1 → L = 1, F0 = 15 min.
    await expect(page.getByText(/= t .{1,3} L = 15 .{1,3} 1/).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/overkill-level lethality/i).first()).toBeVisible();
  });

  test("the microbial count calculator converts colonies to CFU/mL", async ({ page }) => {
    await page.goto("/tools/microbial-count-calculator");
    // Defaults: duplicate pour plates (142, 158 → mean 150) at 10^-2, 1 mL → 15,000 CFU/mL.
    await expect(page.getByText(/1\.5 x 10\^4 CFU\/mL/i).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/150 colonies/i).first()).toBeVisible();
  });

  test("the system suitability calculator computes %RSD and a verdict", async ({ page }) => {
    await page.goto("/tools/system-suitability-calculator");
    // Defaults: 5 replicate peak areas (~0.26% RSD) vs a 2.0% limit → passes.
    await expect(page.getByText(/0\.26%/).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/System suitability met/i).first()).toBeVisible();
  });

  test("career skill-gap builds a personalised learning roadmap", async ({ page }) => {
    await page.goto("/career");
    await expect(page.getByRole("heading", { name: /Skill Gap Analyzer/i })).toBeVisible();
    await page.getByRole("button", { name: /^Need it$/ }).first().click();
    await page.getByRole("button", { name: /Build my learning roadmap/i }).click();
    await expect(page.getByRole("heading", { name: /learning roadmap/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Start with/i })).toBeVisible();
  });

  test("the legacy /qc-hub redirects into the unified Learn hub", async ({ page }) => {
    await page.goto("/qc-hub");
    await expect(page).toHaveURL(/\/academy$/);
    await expect(page.locator('a[href^="/library/"]').first()).toBeVisible();
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

  test("Pro subscribe CTA starts Stripe checkout or routes to auth", async ({ page }) => {
    await page.goto("/pricing");
    const cta = page.getByRole("button", { name: /Start Pro|free trial/i }).first();
    await cta.click();
    await page.waitForURL(/checkout\.stripe\.com|\/register|\/login/, { timeout: 15_000 });
  });
});
