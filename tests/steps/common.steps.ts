import { expect } from '@playwright/test';
import { Given, When, Then } from '../fixtures/fixtures';
import { errors, home, login } from '../fixtures/data';

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

// Erros usados por mais de uma feature. toHaveText com lista confere o texto e que não há outro erro na tela.

Then('I see the invalid CPF error', async ({ errorMessages }) => {
  await expect(errorMessages.all).toHaveText([errors.invalidCpf]);
});

Then('I see the invalid e-mail error', async ({ errorMessages }) => {
  await expect(errorMessages.all).toHaveText([errors.invalidEmail]);
});
