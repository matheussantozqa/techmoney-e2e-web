import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import { API_URL, BASE_URL } from './tests/support/env';

const testDir = defineBddConfig({
  featuresRoot: 'tests/features', // encurta o caminho dos testes gerados na saída
  features: 'tests/features/**/*.feature',
  steps: ['tests/steps/*.ts', 'tests/fixtures/fixtures.ts'],
});

export default defineConfig({
  testDir,
  // Banco único e o /reset derruba todos os tokens: testes em paralelo se atrapalham.
  workers: 1,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  outputDir: 'reports/test-results',
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'reports/playwright' }],
    [
      'allure-playwright',
      {
        resultsDir: 'reports/allure-results',
        globalLabels: { epic: 'Web' },
        environmentInfo: { BASE_URL, API_URL, node: process.version },
      },
    ],
  ],
  use: {
    ...devices['Desktop Chrome'],
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
