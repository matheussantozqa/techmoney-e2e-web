import { expect } from '@playwright/test';
import { web } from '../../fixtures/fixtures';
import { errors, register } from '../../data/web';

const { Given, When, Then } = web;

Given('I am on the register page', async ({ loginPage }) => {
  await loginPage.open();
  await loginPage.openRegister();
});

When('I register a new account', async ({ registerPage }) => {
  const { name, cpf, email, password } = register;
  await registerPage.register(name, cpf, email, password, password);
});

When('I submit an empty registration form', async ({ registerPage }) => {
  await registerPage.register('', '', '', '', '');
});

When('I register with different passwords', async ({ registerPage }) => {
  const { name, cpf, email, password, differentConfirmation } = register;
  await registerPage.register(name, cpf, email, password, differentConfirmation);
});

Then('I see the new account home', async ({ homePage }) => {
  await expect(homePage.greeting).toHaveText(register.greeting);
  await expect(homePage.balance).toHaveText(register.balance);
});

Then('I see all the required field errors', async ({ errorMessages }) => {
  await expect(errorMessages.all).toHaveText(errors.requiredFields);
});

Then('I see the password mismatch error', async ({ errorMessages }) => {
  await expect(errorMessages.all).toHaveText([errors.passwordMismatch]);
});
