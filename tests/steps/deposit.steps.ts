import { expect } from '@playwright/test';
import { When, Then } from '../fixtures/fixtures';
import { deposit, errors } from '../fixtures/data';

When('I deposit a valid amount', async ({ depositPage }) => {
  await depositPage.deposit(deposit.amount);
});

When('I deposit an empty amount', async ({ depositPage }) => {
  await depositPage.deposit('');
});

When('I deposit above the maximum', async ({ depositPage }) => {
  await depositPage.deposit(deposit.amountAboveMaximum);
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

Then('I see the empty amount error', async ({ errorMessages }) => {
  await expect(errorMessages.all).toHaveText([errors.emptyAmount]);
});

Then('I see the deposit above the maximum error', async ({ errorMessages }) => {
  await expect(errorMessages.all).toHaveText([errors.depositAboveMaximum]);
});
