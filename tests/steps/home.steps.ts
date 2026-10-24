import { expect } from '@playwright/test';
import { Then } from '../fixtures/fixtures';
import { home } from '../fixtures/data';

Then('I see my balance', async ({ homePage }) => {
  await expect(homePage.balance).toHaveText(home.balance);
});

Then('I see my recent transactions', async ({ homePage }) => {
  await expect(homePage.transactionDescriptions).toHaveText(home.recentTransactions);
});
