import { defineConfig, devices } from '@playwright/test'

const PORT = 3100
const BASE_URL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: './tests/e2e',
  globalSetup: './tests/e2e/global-setup.ts',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'list' : [['list'], ['html', { open: 'never' }]],
  timeout: 60_000,
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
      testIgnore: /mobile\.spec\.ts/,
    },
    { name: 'mobile', use: { ...devices['iPhone 13'] }, testMatch: /mobile\.spec\.ts/ },
  ],
  webServer: {
    // Preview mode gives the suite a signed-in user, a local database and a
    // mocked AI provider, so no cloud credentials are needed to run tests.
    command: `HIART_PREVIEW_AUTH=1 HIART_MOCK_AI=1 PORT=${PORT} npm run dev`,
    url: BASE_URL,
    // Always a fresh server, so it picks up the freshly seeded database.
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      HIART_PREVIEW_AUTH: '1',
      HIART_MOCK_AI: '1',
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: '',
      CLERK_SECRET_KEY: '',
    },
  },
})
