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
    await expect(page.getByText(/microbiology-pack\/v1\.1/i)).toBeVisible();
    for (let step = 0; step < 3; step++) {
      await page.getByRole("button", { name: /^Continue$/ }).click();
    }
    await page.getByRole("button", { name: /Compile blueprint/i }).click();
    await page.waitForURL(/\/quality-lab\/projects\/qlp_/);
    await expect(page.getByRole("heading", { name: /Workforce capacity and skill coverage/i })).toBeVisible();
    await expect(page.getByText(/base execution/i).first()).toBeVisible();
    await expect(page.getByText(/Technical review and release support/i).first()).toBeVisible();
    await expect(page.getByText(/Loads not separately quantified/i)).toBeVisible();
    await expect(page.getByText(/Deviations, OOS\/OOT and contamination investigations/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: /Consumable inventory planning basis/i })).toBeVisible();
    await expect(page.getByText(/end-to-end lead time/i).first()).toBeVisible();
    await expect(page.getByText(/Required item-level evidence/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: /What must be resolved before controlled use/i })).toBeVisible();
    await expect(page.getByText(/^Decision support$/i).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Scope a non-sterile microbiology QC lab/i }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /Engagement packet/i })).toBeVisible();
    await page.getByRole("link", { name: /Review workspace/i }).click();
    await page.waitForURL(/\/quality-lab\/engagements\/qlp_/);
    await expect(page.getByRole("heading", { name: /Estimate-to-actual calibration/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Evidence and review checklist/i })).toBeVisible();
    await page.getByLabel(/^Monthly tests actual$/i).fill("500");
    await expect(page.getByText(/Variance:/i).first()).not.toHaveText(/open/i);
    await page.getByLabel(/Monthly tests variance driver/i).selectOption("scope-change");
    await page.getByLabel(/Monthly tests actual basis/i).fill("Approved quarterly QC workload report Q1-2026");
    await page.getByLabel(/Observed period start/i).fill("2026-01-01");
    await page.getByLabel(/Observed period end/i).fill("2026-03-31");
    await page.getByLabel(/Calibration data owner/i).fill("QC Operations");
    await page.getByLabel(/Calibration evidence references/i).fill("QC-WORKLOAD-Q1-2026");
    await expect(page.getByText(/^Review ready$/i).first()).toBeVisible();
    await page.getByLabel(/Learning disposition/i).selectOption("project-only");
    const calibrationDownload = page.waitForEvent("download");
    await page.getByRole("button", { name: /Export calibration CSV/i }).click();
    expect((await calibrationDownload).suggestedFilename()).toMatch(/-calibration\.csv$/);
    await page.getByRole("link", { name: /Open learning review queue/i }).click();
    await page.waitForURL(/\/quality-lab\/calibration$/);
    await expect(page.getByRole("heading", { name: /Calibration Learning Review Queue/i })).toBeVisible();
    await expect(page.getByText(/^project only$/i).first()).toBeVisible();
    const registryDownload = page.waitForEvent("download");
    await page.getByRole("button", { name: /Export review registry/i }).click();
    expect((await registryDownload).suggestedFilename()).toBe("atlas-calibration-learning-candidates.json");
    await page.getByRole("link", { name: /Open calibration/i }).click();
    await page.getByRole("link", { name: /Back to blueprint/i }).click();
    await expect(page.getByText("quality-lab-blueprint/v1")).toBeVisible();
    await expect(page.getByRole("heading", { name: /Versioned calculation trace/i })).toBeVisible();
    await page.getByRole("link", { name: /Request expert review/i }).click();
    await page.waitForURL(/\/quality-lab\/review\?project=/);
    await expect(page.getByRole("heading", { name: /reviewable project basis/i })).toBeVisible();
    await expect(page.getByText(/Attached browser-local model/i)).toBeVisible();
    await expect(page.getByText(/quality-lab-review-brief\/v1/i)).toBeVisible();
    await expect(page.getByText(/contains no confidential formulations/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Request a scope review/i })).toBeVisible();
  });

  test("Blueprint discovery pack exposes linked domain guidance and downloadable templates", async ({ page }) => {
    await page.goto("/quality-lab/discovery-pack");
    await expect(page.getByRole("heading", { name: /Atlas Blueprint Discovery Pack/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Analytical chemistry/i })).toHaveAttribute("href", "/blog/analytical-chemistry-qc-capability-planning");
    await expect(page.getByRole("button", { name: /Download CSV/i })).toHaveCount(9);
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: /Download CSV/i }).first().click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("atlas-blueprint-project-intake.csv");
    const spaceDownload = page.waitForEvent("download");
    await page.getByRole("button", { name: /Download CSV/i }).nth(3).click();
    expect((await spaceDownload).suggestedFilename()).toBe("atlas-space-flow-engineering-basis.csv");
    const turnaroundDownload = page.waitForEvent("download");
    await page.getByRole("button", { name: /Download CSV/i }).nth(4).click();
    expect((await turnaroundDownload).suggestedFilename()).toBe("atlas-turnaround-queue-calendar-basis.csv");
    const costDownload = page.waitForEvent("download");
    await page.getByRole("button", { name: /Download CSV/i }).nth(5).click();
    expect((await costDownload).suggestedFilename()).toBe("atlas-qc-lab-cost-basis.csv");
    const applicationDownload = page.waitForEvent("download");
    await page.getByRole("button", { name: /Download CSV/i }).nth(6).click();
    expect((await applicationDownload).suggestedFilename()).toBe("atlas-test-method-application-matrix.csv");
    const validationDownload = page.waitForEvent("download");
    await page.getByRole("button", { name: /Download CSV/i }).nth(7).click();
    expect((await validationDownload).suggestedFilename()).toBe("atlas-domain-pack-validation-case.csv");
    const impactDownload = page.waitForEvent("download");
    await page.getByRole("button", { name: /Download CSV/i }).nth(8).click();
    expect((await impactDownload).suggestedFilename()).toBe("atlas-rule-change-impact-assessment.csv");
  });

  test("Blueprint casebook compiles scenarios and opens one as an editable local project", async ({ page }) => {
    await page.goto("/quality-lab/casebook");
    await expect(page.getByRole("heading", { name: /Atlas Blueprint Casebook/i })).toBeVisible();
    await expect(page.getByText(/synthetic planning scenarios/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Open as editable project/i })).toHaveCount(3);
    await expect(page.getByText(/reconciliation required|portfolio derived|aggregate input/i).first()).toBeVisible();
    await page.getByRole("button", { name: /Open as editable project/i }).first().click();
    await page.waitForURL(/\/quality-lab\/projects\/qlp_/);
    await expect(page.getByText(/Illustrative case — reconciled in-house portfolio/i).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /Finished-product sizing basis/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Open Evidence Graph/i })).toBeVisible();
  });

  test("Atlas Evidence Graph connects domains to Blueprint decisions", async ({ page }) => {
    await page.goto("/quality-lab/evidence");
    await expect(page.getByRole("heading", { name: /Follow the evidence behind every Blueprint decision/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Non-sterile pharmaceutical microbiology/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Scope a non-sterile microbiology QC lab/i })).toHaveAttribute("href", "/blog/how-to-scope-nonsterile-microbiology-qc-lab");
    await page.getByRole("button", { name: /Equipment & utilities/i }).click();
    await expect(page.getByText(/What vendor-neutral resources, resilience and qualification basis must exist/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /Equipment Qualification Readiness Planner/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Water & environmental monitoring/i })).not.toBeVisible();
  });

  test("Test Method Application Packs expose maturity and evidence blockers", async ({ page }) => {
    await page.goto("/quality-lab/method-applications");
    await expect(page.getByRole("heading", { name: /A test name becomes useful only when its application is explicit/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Pharmaceutical water microbiology/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Growth promotion and media QC/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Microbial identification/i })).toBeVisible();
    await expect(page.getByText(/workflow only/i).first()).toBeVisible();
    await expect(page.getByText(/evidence blocker/i).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Open application guide/i }).first()).toHaveAttribute("href", "/blog/pharmaceutical-water-microbiology-application-pack");
  });

  test("Domain Pack readiness keeps expansion evidence-gated", async ({ page }) => {
    await page.goto("/quality-lab/domain-readiness");
    await expect(page.getByRole("heading", { name: /A domain becomes a Pack only after the evidence exists/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Non-sterile pharmaceutical microbiology/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Food & beverage quality/i })).toBeVisible();
    await expect(page.getByText(/Synthetic cases exercise reconciliation, outsourcing and unresolved allocation behavior/i)).toBeVisible();
    await expect(page.getByText(/No public evidence area opened/i)).toBeVisible();
    await expect(page.getByText(/No implied launch promise/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /Read validation framework/i }).first()).toHaveAttribute("href", "/blog/how-to-validate-a-quality-lab-domain-pack");
    await expect(page.getByRole("link", { name: /Discuss a real project/i })).toHaveAttribute("href", "/quality-lab/review");
  });

  test("Domain Pack validation guide connects calibration, readiness and evidence governance", async ({ page }) => {
    await page.goto("/blog/how-to-validate-a-quality-lab-domain-pack");
    await expect(page.getByRole("heading", { name: /How to validate a Quality Lab Domain Pack/i }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /Three records that must not be confused/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Eligibility is not approval/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Calibration Learning Review Queue/i })).toHaveAttribute("href", "/quality-lab/calibration");
    await expect(page.getByRole("link", { name: /Domain Pack Readiness/i })).toHaveAttribute("href", "/quality-lab/domain-readiness");
    const context = page.getByRole("complementary", { name: /Atlas Blueprint relevance/i });
    await expect(context.getByRole("heading", { name: /Cross-domain capability architecture/i })).toBeVisible();
  });

  test("Method suitability guide connects recovery evidence to BOM and capacity", async ({ page }) => {
    await page.goto("/blog/method-suitability-to-microbiology-lab-capacity");
    await expect(page.getByRole("heading", { name: /From method suitability to microbiology lab capacity/i }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /How suitability changes the method bill of materials/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Convert method steps into capacity demand/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /What Atlas should block when suitability is unresolved/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Quality Lab Planner/i })).toHaveAttribute("href", "/quality-lab/planner");
    const context = page.getByRole("complementary", { name: /Atlas Blueprint relevance/i });
    await expect(context.getByRole("heading", { name: /Non-sterile pharmaceutical microbiology/i })).toBeVisible();
  });

  test("Usable equipment capacity guide connects natural demand units to redundancy decisions", async ({ page }) => {
    await page.goto("/blog/from-workload-to-usable-qc-equipment-capacity");
    await expect(page.getByRole("heading", { name: /From workload to usable QC equipment capacity/i }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /Incubators: use condition-specific plate-days/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /When a queue or schedule simulation is required/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Redundancy is a business-continuity decision/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Quality Lab Planner/i })).toHaveAttribute("href", "/quality-lab/planner");
    const context = page.getByRole("complementary", { name: /Atlas Blueprint relevance/i });
    await expect(context.getByRole("heading", { name: /Cross-domain capability architecture/i })).toBeVisible();
  });

  test("Resilient QC staffing guide connects productive hours to skill and review constraints", async ({ page }) => {
    await page.goto("/blog/from-hands-on-hours-to-resilient-qc-staffing");
    await expect(page.getByRole("heading", { name: /From hands-on hours to resilient QC staffing/i }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /Reviewer capacity is an independent constraint/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Skill matrices reveal hidden bottlenecks/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Resilience is more than a percentage reserve/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Quality Lab Planner/i })).toHaveAttribute("href", "/quality-lab/planner");
    const context = page.getByRole("complementary", { name: /Atlas Blueprint relevance/i });
    await expect(context.getByRole("heading", { name: /Cross-domain capability architecture/i })).toBeVisible();
  });

  test("Consumable supply guide connects method BOM to expiry-aware inventory decisions", async ({ page }) => {
    await page.goto("/blog/from-method-bom-to-resilient-qc-consumable-supply");
    await expect(page.getByRole("heading", { name: /From method BOM to resilient QC consumable supply/i }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /Separate net, gross and purchased quantities/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Target stock is not an order quantity/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Shelf life constrains usable coverage/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Quality Lab Planner/i })).toHaveAttribute("href", "/quality-lab/planner");
    const context = page.getByRole("complementary", { name: /Atlas Blueprint relevance/i });
    await expect(context.getByRole("heading", { name: /Cross-domain capability architecture/i })).toBeVisible();
  });

  test("Space and flow guide connects capabilities to an engineering-ready basis", async ({ page }) => {
    await page.goto("/blog/from-qc-capability-map-to-space-zoning-and-flow-basis");
    await expect(page.getByRole("heading", { name: /From QC capability map to space, zoning and flow basis/i }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /Model personnel, sample, material and waste flows separately/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Build an adjacency matrix before drawing a layout/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Evidence package for qualified engineering/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Blueprint Discovery Pack/i })).toHaveAttribute("href", "/quality-lab/discovery-pack");
    const context = page.getByRole("complementary", { name: /Atlas Blueprint relevance/i });
    await expect(context.getByRole("heading", { name: /Cross-domain capability architecture/i })).toBeVisible();
  });

  test("Controlled cost-basis guide separates estimate maturity and lifecycle cost", async ({ page }) => {
    await page.goto("/blog/from-concept-cost-band-to-controlled-qc-lab-cost-basis");
    await expect(page.getByRole("heading", { name: /From concept cost band to a controlled QC laboratory cost basis/i }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /Label estimate maturity by scope definition/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Keep price, installed cost and total project cost separate/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Separate escalation from contingency/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Blueprint Discovery Pack/i })).toHaveAttribute("href", "/quality-lab/discovery-pack");
    const context = page.getByRole("complementary", { name: /Atlas Blueprint relevance/i });
    await expect(context.getByRole("heading", { name: /Cross-domain capability architecture/i })).toBeVisible();
  });

  test("Turnaround guide separates queue, hold, handoff and calendar time", async ({ page }) => {
    await page.goto("/blog/from-monthly-workload-to-qc-turnaround-and-queue-feasibility");
    await expect(page.getByRole("heading", { name: /From monthly workload to QC turnaround and queue feasibility/i }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /Distinguish six kinds of time/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Put the method onto a real calendar/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Use the right modeling depth/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Blueprint Discovery Pack/i })).toHaveAttribute("href", "/quality-lab/discovery-pack");
    const context = page.getByRole("complementary", { name: /Atlas Blueprint relevance/i });
    await expect(context.getByRole("heading", { name: /Cross-domain capability architecture/i })).toBeVisible();
  });

  test("Water microbiology application pack connects sampling purpose to method and resources", async ({ page }) => {
    await page.goto("/blog/pharmaceutical-water-microbiology-application-pack");
    await expect(page.getByRole("heading", { name: /Pharmaceutical water microbiology application pack/i }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /Build a sampling-point application matrix/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Select a recovery strategy by purpose/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Evidence required for an executable Atlas node/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Test Method Application Packs/i })).toHaveAttribute("href", "/quality-lab/method-applications");
    const context = page.getByRole("complementary", { name: /Atlas Blueprint relevance/i });
    await expect(context.getByRole("heading", { name: /Water & environmental monitoring/i })).toBeVisible();
  });

  test("Growth promotion application pack connects media properties to release and failure decisions", async ({ page }) => {
    await page.goto("/blog/growth-promotion-media-qc-application-pack");
    await expect(page.getByRole("heading", { level: 1, name: "Growth promotion and media QC application pack" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Build the media–method–property matrix" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Build the release decision" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Investigate failures by genealogy and impact" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Test Method Application Packs/i })).toHaveAttribute("href", "/quality-lab/method-applications");
  });

  test("Bioburden application pack connects matrix recovery to downstream decisions and capacity", async ({ page }) => {
    await page.goto("/blog/bioburden-membrane-filtration-application-pack");
    await expect(page.getByRole("heading", { level: 1, name: "Bioburden and membrane filtration application pack" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Build the product–preparation–recovery matrix" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Decide whether membrane filtration is fit for the application" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Connect the result to its downstream decision" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Test Method Application Packs/i })).toHaveAttribute("href", "/quality-lab/method-applications");
  });

  test("Evidence Graph provides two-way Blueprint context across content surfaces", async ({ page }) => {
    const surfaces = [
      ["/blog/how-to-scope-nonsterile-microbiology-qc-lab", /Non-sterile pharmaceutical microbiology/i],
      ["/library/growth-promotion-testing", /Non-sterile pharmaceutical microbiology/i],
      ["/workflows/culture-media-selection", /Non-sterile pharmaceutical microbiology/i],
      ["/tools/microbial-count-calculator", /Non-sterile pharmaceutical microbiology/i],
    ] as const;
    for (const [href, domain] of surfaces) {
      await page.goto(href);
      const context = page.getByRole("complementary", { name: /Atlas Blueprint relevance/i });
      await expect(context).toBeVisible();
      await expect(context.getByRole("heading", { name: domain })).toBeVisible();
      await expect(context.getByRole("link", { name: /Open Evidence Graph/i })).toHaveAttribute("href", "/quality-lab/evidence");
      await expect(context.getByRole("link", { name: /Apply this reasoning in a Blueprint/i })).toHaveAttribute("href", "/quality-lab/planner");
    }
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
