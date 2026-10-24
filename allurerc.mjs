import { defineConfig } from 'allure';

export default defineConfig({
  name: 'TechMoney — E2E (API + Web)',
  output: './reports/allure',
  historyPath: './reports/allure-history.jsonl',
  plugins: {
    allure2: {
      options: { reportName: 'TechMoney — E2E (API + Web)', reportLanguage: 'en' },
    },
  },
});
