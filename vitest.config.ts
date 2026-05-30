import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["server/**/*.test.ts", "shared/**/*.test.ts"],
    exclude: ["node_modules", "dist", "e2e/**"],
    // Set before any module loads so the Stripe client initializes in routes.ts.
    env: {
      STRIPE_SECRET_KEY: "sk_test_dummy",
      STRIPE_WEBHOOK_SECRET: "whsec_test",
      SESSION_SECRET: "test_secret",
      NODE_ENV: "test",
    },
  },
});
