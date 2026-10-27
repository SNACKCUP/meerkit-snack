import { defineConfig, devices } from "@playwright/test";

// 프론트(3000)와 백엔드(8000), DB가 켜져 있어야 한다. 백엔드는 SIGNUP_EMAIL_VERIFICATION_REQUIRED=false 로 실행한다.
// 실행 방법은 e2e/README.md 참고.
const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: { baseURL, trace: "retain-on-failure", screenshot: "only-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
