import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  outputDir: './test-results',
  
  // Run tests in files in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 1,
  
  // Opt out of parallel tests on CI for more stable execution
  workers: process.env.CI ? 2 : undefined,
  
  // Reporter to use
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list'],
  ],
  
  // Global test timeout
  timeout: 30000,
  expect: {
    timeout: 10000,
  },

  // Shared settings for all the projects below
  use: {
    baseURL: 'http://localhost:4200',
    
    // Collect trace when retrying the failed test
    trace: 'retain-on-failure',
    
    // Screenshots on failure
    screenshot: 'only-on-failure',
    
    // Record video on failure
    video: 'retain-on-failure',
    
    // Configure API testing
    extraHTTPHeaders: {
      'Accept': 'application/json',
    },
    
    // Browser context options
    contextOptions: {
      ignoreHTTPSErrors: true,
      permissions: ['notifications'],
    },
    
    // Viewport size
    viewport: { width: 1280, height: 720 },
  },

  // Test projects for different browsers and scenarios
  projects: [
    // Desktop browsers
    {
      name: 'Desktop Chrome',
      use: { 
        ...devices['Desktop Chrome'],
        // Enable Chrome DevTools for debugging
        launchOptions: {
          args: ['--disable-dev-shm-usage'],
        },
      },
    },
    {
      name: 'Desktop Firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'Desktop Safari',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile browsers
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    // API Testing project
    {
      name: 'API Tests',
      testDir: './e2e/api',
      use: {
        baseURL: 'http://localhost:8080', // API Gateway URL
      },
    },

    // Visual regression testing
    {
      name: 'Visual Regression',
      testDir: './e2e/visual',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },
  ],

  // Configure local dev server
  webServer: [
    {
      command: 'npm run dev',
      url: 'http://localhost:4200',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
  ],

  // Global setup and teardown
  globalSetup: require.resolve('./e2e/config/global-setup.ts'),
  globalTeardown: require.resolve('./e2e/config/global-teardown.ts'),
});