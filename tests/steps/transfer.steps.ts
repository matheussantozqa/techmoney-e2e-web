import { expect } from '@playwright/test';
import { Given, When, Then } from '../fixtures/fixtures';
import { errors, transfer } from '../fixtures/data';

When('I transfer to Bruno', async ({ transferPage }) => {
  await transferPage.goToPinStep(transfer.brunoCpf, transfer.amount, transfer.description);
  await transferPage.enterPin(transfer.pin);
});

When('I start a transfer to Bruno', async ({ transferPage }) => {
  await transferPage.open();
  await transferPage.enterKey(transfer.brunoCpf);
});

When('I start a transfer to an unknown key', async ({ transferPage }) => {
  await transferPage.open();
  await transferPage.enterKey(transfer.unknownKey);
});

When('I enter an amount above the balance', async ({ transferPage }) => {
  await transferPage.enterAmount(transfer.amountAboveBalance);
});

When('I enter an amount above the daily limit', async ({ transferPage }) => {
  await transferPage.enterAmount(transfer.amountAboveDailyLimit);
});

Given('I am on the PIN step of a transfer to Bruno', async ({ transferPage }) => {
  await transferPage.goToPinStep(transfer.brunoCpf, transfer.amount);
});

When('I enter a wrong PIN', async ({ transferPage }) => {
  await transferPage.enterPin(transfer.wrongPin);
});

When('I enter a wrong PIN 3 times', async ({ transferPage }) => {
  await transferPage.enterPinTimes(transfer.wrongPin, 3);
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

Then('I see the unknown recipient error', async ({ errorMessages }) => {
  await expect(errorMessages.all).toHaveText([errors.unknownRecipient]);
});

Then('I see the insufficient balance error', async ({ errorMessages }) => {
  await expect(errorMessages.all).toHaveText([errors.insufficientBalance]);
});

Then('I see the daily limit error', async ({ errorMessages }) => {
  await expect(errorMessages.all).toHaveText([errors.aboveDailyLimit]);
});

Then('I see the wrong PIN error', async ({ errorMessages }) => {
  await expect(errorMessages.all).toHaveText([errors.wrongPin]);
});

Then('I see the blocked PIN error', async ({ errorMessages }) => {
  await expect(errorMessages.all).toHaveText([errors.blockedPin]);
});
