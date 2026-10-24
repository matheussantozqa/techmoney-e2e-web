import { expect } from '@playwright/test';
import { web } from '../../fixtures/fixtures';
import { help } from '../../data/web';

const { When, Then } = web;

When('I open the help', async ({ helpPage }) => {
  await helpPage.open();
});

When('I choose the deposit topic', async ({ helpPage }) => {
  await helpPage.chooseTopic(help.depositTopic);
});

Then('I see the welcome message', async ({ helpPage }) => {
  await expect(helpPage.messages.last()).toHaveText(help.welcome);
});

Then('I see all the help topics', async ({ helpPage }) => {
  await expect(helpPage.topics).toHaveText(help.topics);
});

Then('I see the deposit answer', async ({ helpPage }) => {
  await expect(helpPage.messages.last()).toHaveText(help.depositAnswer);
});
