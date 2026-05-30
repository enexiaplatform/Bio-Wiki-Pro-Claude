import { defineConfig } from "@playwright/test";

// E2E smoke tests. Require a running app (E2E_BASE_URL) and, for the full
// purchase flow, Stripe test mode + a seeded test user (E2E_RUN=1).
// Run: npx playwright install && E2E_RUN=1 E2E_BASE_URL=... npm run test:e2e
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  reporter: "list",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:5000",
    headless: true,
  },
});
