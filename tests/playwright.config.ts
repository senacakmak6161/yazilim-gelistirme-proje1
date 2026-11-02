import path from 'node:path';
import { defineConfig, devices, type ReporterDescription } from '@playwright/test';

const isCI = !!process.env.CI;

// Uygulamanın adresi. Ortam değişkeniyle değiştirilebilir:
//   BASE_URL=http://localhost:3000 npx playwright test
const BASE_URL = process.env.BASE_URL ?? 'http://localhost:5173';
const APP_DIR = process.env.APP_DIR;

const reporters: ReporterDescription[] = [
  ['list'],
  ['html', { open: 'never', outputFolder: 'playwright-report' }],
  // İzlenebilirlik raporu (AC → Başarılı/Başarısız/Test edilmedi) bu dosyadan üretilecek.
  ['json', { outputFile: 'test-results/results.json' }],
];
if (isCI) {
  reporters.push(['github'], ['junit', { outputFile: 'test-results/junit.xml' }]);
}

export default defineConfig({
  testDir: './e2e/specs',
  outputDir: './test-results',
  timeout: 30_000,
  expect: { timeout: 5_000 },

  // Testler birbirinden bağımsız olduğu için paralel çalışabilir.
  fullyParallel: true,

  // CI'da unutulmuş test.only tüm diğer testleri sessizce atlar; bunu engeller.
  forbidOnly: isCI,

  // Yerelde 0: kararsız (flaky) bir test yeniden denemeyle gizlenmesin, hemen görülsün.
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,

  reporter: reporters,

  use: {
    baseURL: BASE_URL,
    locale: 'tr-TR',
    timezoneId: 'Europe/Istanbul',
    colorScheme: 'light',
    testIdAttribute: 'data-testid',
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
    trace: isCI ? 'on-first-retry' : 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  // Aynı testler farklı tarayıcı motorlarında ve cihazlarda çalışır (US-08, NFR-1).
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 13'] } },
    { name: 'tablet', use: { ...devices['iPad (gen 7)'] } },
  ],

  // Playwright uygulamayı kendisi başlatır, testler bitince kapatır.
  webServer: APP_DIR
    ? {
        command: process.env.APP_CMD ?? 'npm run dev',
        cwd: path.resolve(__dirname, APP_DIR),
        url: BASE_URL,
        reuseExistingServer: !isCI, // Yerelde zaten açıksa onu kullanır
        timeout: 120_000,
        stdout: 'ignore',
        stderr: 'pipe',
      }
    : undefined,
});
