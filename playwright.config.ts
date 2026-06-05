import { defineConfig } from "@playwright/test";

// E2E smoke tests. The "public smoke" group runs against an auto-started dev
// server (or set E2E_BASE_URL to point at a deployment). The full purchase
// flow additionally needs Stripe test mode + a seeded user (E2E_RUN=1).
// Run: npx playwright install && npm run test:e2e
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  reporter: "list",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:5000",
    headless: true,
  },
  // Auto-start the app unless an external base URL is provided.
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: "npm run dev",
        port: 5000,
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
