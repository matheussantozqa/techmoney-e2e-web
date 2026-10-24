import { expect } from '@playwright/test';
import { web } from '../../fixtures/fixtures';
import { home, login } from '../../data/web';

const { Given, When, Then } = web;

// Acesso (usado por quase todas as features)

Given('I am on the login page', async ({ loginPage }) => {
  await loginPage.open();
});

Given('I am logged in', async ({ loginPage, homePage }) => {
  await loginPage.open();
  await loginPage.login(login.validCpf, login.validPassword);
  await homePage.greeting.waitFor();
});

When('I log in with valid credentials', async ({ loginPage }) => {
  await loginPage.login(login.validCpf, login.validPassword);
});

Then('I see my home', async ({ homePage }) => {
  await expect(homePage.greeting).toHaveText(home.greeting);
});
