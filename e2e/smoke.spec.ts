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

  // Atlas Quality Lab Compiler is the flagship front door; knowledge surfaces
  // remain reachable as the supporting Atlas Evidence layer.
  test("homepage leads with the Quality Lab Blueprint funnel", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /defensible quality lab blueprint/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Compile an initial blueprint/i })).toHaveAttribute("href", "/quality-lab/planner");
    await expect(page.getByText(/Atlas Evidence/i).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /QC workflows/i })).toHaveAttribute("href", "/workflows");
  });

  test("quality lab funnel reaches planner and expert review intake", async ({ page }) => {
    await page.goto("/quality-lab");
    await expect(page.getByRole("heading", { name: /defensible QC lab blueprint/i })).toBeVisible();
    await page.getByRole("link", { name: /Build a blueprint/i }).click();
    await page.waitForURL(/\/quality-lab\/planner$/);
    await expect(page.getByText(/Microbiology compiler/i)).toBeVisible();
    await page.goto("/quality-lab/review");
    await expect(page.getByRole("heading", { name: /reviewable project basis/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Request a scope review/i })).toBeVisible();
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

  test("Deviation & CAPA workflow links to the CAPA planner", async ({ page }) => {
    await page.goto("/workflows/deviation-capa");
    await expect(page.getByRole("heading", { name: /^Deviation & CAPA$/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /CAPA Effectiveness Check Planner/i })).toBeVisible();
  });

  test("water system workflow links monitoring lessons and tools", async ({ page }) => {
    await page.goto("/workflows/water-system-monitoring");
    await expect(page.getByRole("heading", { name: /^Pharmaceutical Water System Monitoring$/i })).toBeVisible();
    await expect(page.getByText(/Step-by-step workflow/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /Lab Water Type Selector/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Endotoxin Limit & MVD Calculator/i })).toBeVisible();
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
    await expect(page.locator('a[href="/tools/stability-trend-shelf-life-planner"]').first()).toBeVisible();
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

  test("the sterile filtration planner flags integrity and batch-impact blockers", async ({ page }) => {
    await page.goto("/tools/sterile-filtration-readiness-planner");
    await expect(page.getByRole("heading", { name: /Sterile Filtration Readiness Planner/i }).first()).toBeVisible();
    await expect(page.getByText("56%").first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Hold - sterile filtration blockers remain/i).first()).toBeVisible();
    await page
      .getByRole("group", { name: /Integrity-test method and limits/i })
      .getByRole("button", { name: "Yes" })
      .click();
    await page
      .getByRole("group", { name: /PUPSIT is performed where required/i })
      .getByRole("button", { name: "Yes" })
      .click();
    await page
      .getByRole("group", { name: /Post-use integrity test passed/i })
      .getByRole("button", { name: "Yes" })
      .click();
    await page
      .getByRole("group", { name: /Any integrity-test repeat/i })
      .getByRole("button", { name: "Yes" })
      .click();
    await expect(page.getByText("94%").first()).toBeVisible();
    await expect(page.getByText(/Nearly ready for QA review/i).first()).toBeVisible();
    await page.getByRole("button", { name: /Copy filtration note/i }).click();
    await expect(page.getByRole("button", { name: /Copied/i })).toBeVisible();
  });

  test("the gowning qualification planner flags aseptic access blockers", async ({ page }) => {
    await page.goto("/tools/gowning-qualification-readiness-planner");
    await expect(page.getByRole("heading", { name: /Gowning Qualification Readiness Planner/i }).first()).toBeVisible();
    await expect(page.getByText("69%").first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Do not qualify - access blockers remain/i).first()).toBeVisible();
    await page
      .getByRole("group", { name: /A qualified assessor observed/i })
      .getByRole("button", { name: "Yes" })
      .click();
    await page
      .getByRole("group", { name: /Required consecutive successful/i })
      .getByRole("button", { name: "Yes" })
      .click();
    await page
      .getByRole("group", { name: /Operator media-fill\/APS coverage/i })
      .getByRole("button", { name: "Yes" })
      .click();
    await expect(page.getByText("94%").first()).toBeVisible();
    await expect(page.getByText(/Nearly ready for QA approval/i).first()).toBeVisible();
    await page.getByRole("button", { name: /Copy gowning note/i }).click();
    await expect(page.getByRole("button", { name: /Copied/i })).toBeVisible();
  });

  test("the media fill planner flags APS qualification blockers", async ({ page }) => {
    await page.goto("/tools/media-fill-aps-readiness-planner");
    await expect(page.getByRole("heading", { name: /Media Fill APS Readiness Planner/i }).first()).toBeVisible();
    await expect(page.getByText("63%").first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/APS not ready - qualification blockers remain/i).first()).toBeVisible();
    await page
      .getByRole("group", { name: /Intervention matrix covers/i })
      .getByRole("button", { name: "Yes" })
      .click();
    await page
      .getByRole("group", { name: /Operators, shifts, breaks/i })
      .getByRole("button", { name: "Yes" })
      .click();
    await page
      .getByRole("group", { name: /Run duration, line speed/i })
      .getByRole("button", { name: "Yes" })
      .click();
    await page
      .getByRole("group", { name: /Any contaminated unit/i })
      .getByRole("button", { name: "Yes" })
      .click();
    await expect(page.getByText("94%").first()).toBeVisible();
    await expect(page.getByText(/Nearly ready for APS QA disposition/i).first()).toBeVisible();
    await page.getByRole("button", { name: /Copy APS note/i }).click();
    await expect(page.getByRole("button", { name: /Copied/i })).toBeVisible();
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

  test("the equipment qualification planner flags release blockers", async ({ page }) => {
    await page.goto("/tools/equipment-qualification-readiness-planner");
    await expect(page.getByRole("heading", { name: /Equipment Qualification Readiness Planner/i }).first()).toBeVisible();
    await expect(page.getByText("69%").first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Not ready for GMP use/i).first()).toBeVisible();
    await page
      .getByRole("group", { name: /OQ challenges operating ranges/i })
      .getByRole("button", { name: "Yes" })
      .click();
    await page
      .getByRole("group", { name: /PQ demonstrates consistent performance/i })
      .getByRole("button", { name: "Yes" })
      .click();
    await page
      .getByRole("group", { name: /Qualification deviations/i })
      .getByRole("button", { name: "Yes" })
      .click();
    await expect(page.getByText("94%").first()).toBeVisible();
    await expect(page.getByText(/Ready for QA release with minor gaps/i).first()).toBeVisible();
    await page.getByRole("button", { name: /Copy qualification note/i }).click();
    await expect(page.getByRole("button", { name: /Copied/i })).toBeVisible();
  });

  test("the system suitability calculator computes %RSD and a verdict", async ({ page }) => {
    await page.goto("/tools/system-suitability-calculator");
    // Defaults: 5 replicate peak areas (~0.26% RSD) vs a 2.0% limit → passes.
    await expect(page.getByText(/0\.26%/).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/System suitability met/i).first()).toBeVisible();
  });

  test("the dilution calculator solves C1V1 = C2V2", async ({ page }) => {
    await page.goto("/tools/dilution-calculator");
    // Defaults: 100 → 10 in 10 mL → take 1 mL stock, add 9 mL diluent, 10× dilution.
    await expect(page.getByText(/Take stock/i).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Add diluent/i).first()).toBeVisible();
  });

  test("the dissolution acceptance checker evaluates staged criteria", async ({ page }) => {
    await page.goto("/tools/dissolution-acceptance-checker");
    await expect(page.getByRole("heading", { name: /Dissolution S1\/S2\/S3 Acceptance Checker/i }).first()).toBeVisible();
    await expect(page.getByText(/Accepted at S2/i).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/82.9% vs 80%/i).first()).toBeVisible();
    await page.getByRole("button", { name: /Copy dissolution note/i }).click();
    await expect(page.getByRole("button", { name: /Copied/i })).toBeVisible();
  });

  test("the stability trend planner projects shelf-life risk", async ({ page }) => {
    await page.goto("/tools/stability-trend-shelf-life-planner");
    await expect(page.getByRole("heading", { name: /Stability Trend & Shelf-Life Planner/i }).first()).toBeVisible();
    await expect(page.getByText(/Limited extrapolation review/i).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/96\.99/).first()).toBeVisible();
    await page.getByLabel(/Proposed months/i).fill("48");
    await expect(page.getByText(/Proposed period is not supported/i).first()).toBeVisible();
    await page.getByRole("button", { name: /Copy stability note/i }).click();
    await expect(page.getByRole("button", { name: /Copied/i })).toBeVisible();
  });

  test("the cell-based potency planner flags reportability blockers", async ({ page }) => {
    await page.goto("/tools/cell-based-potency-readiness-planner");
    await expect(page.getByRole("heading", { name: /Cell-Based Potency Readiness Planner/i }).first()).toBeVisible();
    await expect(page.getByText("69%").first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Do not report potency - blockers remain/i).first()).toBeVisible();
    await page
      .getByRole("group", { name: /Cell line\/passage/i })
      .getByRole("button", { name: "Yes" })
      .click();
    await page
      .getByRole("group", { name: /Reference and sample curves/i })
      .getByRole("button", { name: "Yes" })
      .click();
    await page
      .getByRole("group", { name: /Parallelism\/similarity is met/i })
      .getByRole("button", { name: "Yes" })
      .click();
    await expect(page.getByText("94%").first()).toBeVisible();
    await expect(page.getByText(/Nearly ready to report relative potency/i).first()).toBeVisible();
    await page.getByRole("button", { name: /Copy potency note/i }).click();
    await expect(page.getByRole("button", { name: /Copied/i })).toBeVisible();
  });

  test("the HCP testing planner flags reportability blockers", async ({ page }) => {
    await page.goto("/tools/hcp-testing-readiness-planner");
    await expect(page.getByRole("heading", { name: /HCP Testing Readiness Planner/i }).first()).toBeVisible();
    await expect(page.getByText("69%").first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Do not report HCP - blockers remain/i).first()).toBeVisible();
    await page
      .getByRole("group", { name: /Antibody\/reagent coverage/i })
      .getByRole("button", { name: "Yes" })
      .click();
    await page
      .getByRole("group", { name: /Dilutional linearity/i })
      .getByRole("button", { name: "Yes" })
      .click();
    await expect(page.getByText("81%").first()).toBeVisible();
    await expect(page.getByText(/Needs stronger HCP evidence/i).first()).toBeVisible();
    await page.getByRole("button", { name: /Copy HCP note/i }).click();
    await expect(page.getByRole("button", { name: /Copied/i })).toBeVisible();
  });

  test("the viral safety planner flags source-testing-clearance blockers", async ({ page }) => {
    await page.goto("/tools/viral-safety-readiness-planner");
    await expect(page.getByRole("heading", { name: /Viral Safety Readiness Planner/i }).first()).toBeVisible();
    await expect(page.getByText("56%").first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Do not rely on viral safety package - blockers remain/i).first()).toBeVisible();
    await page
      .getByRole("group", { name: /testing panel is appropriate/i })
      .getByRole("button", { name: "Yes" })
      .click();
    await page
      .getByRole("group", { name: /Scaled-down viral clearance studies/i })
      .getByRole("button", { name: "Yes" })
      .click();
    await page
      .getByRole("group", { name: /Clearance steps are mechanistically orthogonal/i })
      .getByRole("button", { name: "Yes" })
      .click();
    await expect(page.getByText("81%").first()).toBeVisible();
    await expect(page.getByText(/Needs stronger viral safety package/i).first()).toBeVisible();
    await page.getByRole("button", { name: /Copy viral safety note/i }).click();
    await expect(page.getByRole("button", { name: /Copied/i })).toBeVisible();
  });

  test("the CAPA effectiveness planner scores closure readiness", async ({ page }) => {
    await page.goto("/tools/capa-effectiveness-check-planner");
    await expect(page.getByRole("heading", { name: /CAPA Effectiveness Check Planner/i }).first()).toBeVisible();
    await expect(page.getByText("63%").first()).toBeVisible({ timeout: 15_000 });
    await page
      .getByRole("group", { name: /measurable acceptance criterion/i })
      .getByRole("button", { name: "No" })
      .click();
    await expect(page.getByText("50%").first()).toBeVisible();
    await expect(page.getByText(/Not ready for effectiveness check/i).first()).toBeVisible();
    await page.getByRole("button", { name: /Copy plan/i }).click();
    await expect(page.getByRole("button", { name: /Copied/i })).toBeVisible();
  });

  test("the OOT trend triage planner classifies trend signals", async ({ page }) => {
    await page.goto("/tools/oot-trend-triage-planner");
    await expect(page.getByRole("heading", { name: /OOT Trend Triage Planner/i }).first()).toBeVisible();
    await expect(page.getByText(/High-risk OOT signal/i).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("-3.5").first()).toBeVisible();
    await page.getByLabel(/Current result/i).fill("94");
    await expect(page.getByText(/OOS - handle under the OOS procedure/i).first()).toBeVisible();
    await page.getByRole("button", { name: /Copy triage note/i }).click();
    await expect(page.getByRole("button", { name: /Copied/i })).toBeVisible();
  });

  test("the audit trail review triage ranks data-integrity exceptions", async ({ page }) => {
    await page.goto("/tools/audit-trail-review-triage");
    await expect(page.getByRole("heading", { name: /Audit Trail Review Triage/i }).first()).toBeVisible();
    await expect(page.getByText("46%").first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Needs documented reviewer follow-up/i).first()).toBeVisible();
    await page
      .getByRole("group", { name: /admin, shared login, or user with excessive privileges/i })
      .getByRole("button", { name: "Yes" })
      .click();
    await page
      .getByRole("group", { name: /Original\/raw data are not easily retrievable/i })
      .getByRole("button", { name: "Yes" })
      .click();
    await expect(page.getByText(/High-risk audit-trail exception/i).first()).toBeVisible();
    await page.getByRole("button", { name: /Copy review note/i }).click();
    await expect(page.getByRole("button", { name: /Copied/i })).toBeVisible();
  });

  test("the batch release readiness checklist flags release blockers", async ({ page }) => {
    await page.goto("/tools/batch-release-readiness-checklist");
    await expect(page.getByRole("heading", { name: /Batch Release Readiness Checklist/i }).first()).toBeVisible();
    await expect(page.getByText("83%").first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Hold - release blockers remain/i).first()).toBeVisible();
    await page
      .getByRole("group", { name: /Batch-impacting deviations, OOS\/OOT, and investigations/i })
      .getByRole("button", { name: "Yes" })
      .click();
    await page
      .getByRole("group", { name: /Relevant audit trails and data-review exceptions/i })
      .getByRole("button", { name: "Yes" })
      .click();
    await expect(page.getByText("94%").first()).toBeVisible();
    await expect(page.getByText(/Release review nearly ready/i).first()).toBeVisible();
    await page.getByRole("button", { name: /Copy release note/i }).click();
    await expect(page.getByRole("button", { name: /Copied/i })).toBeVisible();
  });

  test("the change control impact triage classifies approval blockers", async ({ page }) => {
    await page.goto("/tools/change-control-impact-triage");
    await expect(page.getByRole("heading", { name: /Change Control Impact Triage/i }).first()).toBeVisible();
    await expect(page.getByText("56%").first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/High impact - hold before approval/i).first()).toBeVisible();
    await page
      .getByRole("group", { name: /Impact on CQAs, CPPs/i })
      .getByRole("button", { name: "Yes" })
      .click();
    await page
      .getByRole("group", { name: /Impact on validated\/qualified state/i })
      .getByRole("button", { name: "Yes" })
      .click();
    await page
      .getByRole("group", { name: /Regulatory filing, established conditions/i })
      .getByRole("button", { name: "Yes" })
      .click();
    await expect(page.getByText("72%").first()).toBeVisible();
    await expect(page.getByText(/Moderate change - tighten package/i).first()).toBeVisible();
    await page.getByRole("button", { name: /Copy change note/i }).click();
    await expect(page.getByRole("button", { name: /Copied/i })).toBeVisible();
  });

  test("the supplier qualification risk triage recommends qualification depth", async ({ page }) => {
    await page.goto("/tools/supplier-qualification-risk-triage");
    await expect(page.getByRole("heading", { name: /Supplier Qualification Risk Triage/i }).first()).toBeVisible();
    await expect(page.getByText("13 / 15").first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/High-risk supplier - qualify deeply/i).first()).toBeVisible();
    await page.getByRole("button", { name: /Copy supplier note/i }).click();
    await expect(page.getByRole("button", { name: /Copied/i })).toBeVisible();
  });

  test("command palette finds tools", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press(process.platform === "darwin" ? "Meta+K" : "Control+K");
    await page.getByPlaceholder(/Search pages/i).fill("CAPA effectiveness");
    await expect(page.getByText(/CAPA Effectiveness Check Planner/i).first()).toBeVisible();
  });

  test("career skill-gap builds a personalised learning roadmap", async ({ page }) => {
    await page.goto("/career");
    await expect(page.getByRole("heading", { name: /Build a practical learning roadmap/i })).toBeVisible();
    await page.getByRole("button", { name: /^Need it$/ }).first().click();
    await page.getByRole("button", { name: /^Build roadmap$/i }).click();
    await expect(page.getByRole("heading", { name: /^Your .* roadmap$/i })).toBeVisible();
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
