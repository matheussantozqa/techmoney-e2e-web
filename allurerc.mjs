import { defineConfig } from 'allure';

export default defineConfig({
  name: 'TechMoney — Web',
  output: './reports/allure',
  historyPath: './reports/allure-history.jsonl',
  plugins: {
    allure2: {
      options: { reportName: 'TechMoney — Web', reportLanguage: 'en' },
    },
  },
});
