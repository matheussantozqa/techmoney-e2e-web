import { expect } from '@playwright/test';
import { web } from '../../fixtures/fixtures';
import { errors, login } from '../../data/web';

const { When, Then } = web;

When('I log in with a wrong password', async ({ loginPage }) => {
  await loginPage.login(login.validCpf, login.wrongPassword);
});

When('I type a password', async ({ loginPage }) => {
  await loginPage.typePassword(login.validPassword);
});

When('I toggle the password visibility', async ({ loginPage }) => {
  await loginPage.togglePassword();
});

When('I choose to create an account', async ({ loginPage }) => {
  await loginPage.openRegister();
});

Then('the password is hidden', async ({ loginPage }) => {
  await expect(loginPage.password).toHaveAttribute('type', 'password');
});

Then('the password is visible', async ({ loginPage }) => {
  await expect(loginPage.password).toHaveAttribute('type', 'text');
});

Then('I see the register screen', async ({ registerPage }) => {
  await expect(registerPage.title).toBeVisible();
});

Then('I see the invalid credentials error', async ({ errorMessages }) => {
  await expect(errorMessages.all).toHaveText([errors.invalidCredentials]);
});
