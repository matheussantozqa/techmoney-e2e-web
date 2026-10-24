import { expect } from '@playwright/test';
import { web } from '../../fixtures/fixtures';
import { errors, transfer } from '../../data/web';

const { Given, When, Then } = web;

When('I transfer to Bruno', async ({ transferPage }) => {
  await transferPage.goToPinStep(transfer.brunoCpf, transfer.amount, transfer.description);
  await transferPage.enterPin(transfer.pin);
});

Given('I am on the PIN step of a transfer to Bruno', async ({ transferPage }) => {
  await transferPage.goToPinStep(transfer.brunoCpf, transfer.amount);
});

When('I enter a wrong PIN', async ({ transferPage }) => {
  await transferPage.enterPin(transfer.wrongPin);
});

When('I finish the transfer', async ({ transferPage }) => {
  await transferPage.finish();
});

Then('I see the transfer receipt', async ({ transferPage }) => {
  await expect(transferPage.receiptAmount).toHaveText(transfer.receiptAmount);
  await expect(transferPage.receiptRecipient).toHaveText(transfer.receiptRecipient);
  await expect(transferPage.receiptDescription).toHaveText(transfer.receiptDescription);
});

Then('I see the balance after the transfer', async ({ homePage }) => {
  await expect(homePage.balance).toHaveText(transfer.balanceAfter);
});

Then('I see the wrong PIN error', async ({ errorMessages }) => {
  await expect(errorMessages.all).toHaveText([errors.wrongPin]);
});
