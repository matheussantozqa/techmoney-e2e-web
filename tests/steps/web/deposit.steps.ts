import { expect } from '@playwright/test';
import { web } from '../../fixtures/fixtures';
import { deposit } from '../../data/web';

const { When, Then } = web;

When('I deposit a valid amount', async ({ depositPage }) => {
  await depositPage.deposit(deposit.amount);
});

When('I finish the deposit', async ({ depositPage }) => {
  await depositPage.finish();
});

Then('I see the deposit receipt', async ({ depositPage }) => {
  await expect(depositPage.receiptAmount).toHaveText(deposit.receiptAmount);
  await expect(depositPage.receiptBalance).toHaveText(deposit.receiptBalance);
});

Then('I see the balance after the deposit', async ({ homePage }) => {
  await expect(homePage.balance).toHaveText(deposit.balanceAfter);
});
