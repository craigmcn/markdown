import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      testIgnore: /\.csp\.spec\.ts$/,
      use: { ...devices["Desktop Chrome"], baseURL: "http://localhost:3040" },
    },
    {
      // Only `vite preview` sends netlify.toml's headers; see vite.config.ts.
      name: "csp",
      testMatch: /\.csp\.spec\.ts$/,
      use: { ...devices["Desktop Chrome"], baseURL: "http://localhost:3041" },
    },
  ],
  webServer: [
    {
      command: "yarn dev",
      url: "http://localhost:3040",
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "yarn build && yarn preview",
      url: "http://localhost:3041",
      reuseExistingServer: !process.env.CI,
    },
  ],
});
