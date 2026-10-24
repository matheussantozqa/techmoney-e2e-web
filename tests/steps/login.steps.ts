import { expect } from '@playwright/test';
import { When, Then } from '../fixtures/fixtures';
import { errors, login } from '../fixtures/data';

When('I log in with an empty CPF', async ({ loginPage }) => {
  await loginPage.login('', login.validPassword);
});

When('I log in with an empty password', async ({ loginPage }) => {
  await loginPage.login(login.validCpf, '');
});

When('I log in with an invalid CPF', async ({ loginPage }) => {
  await loginPage.login(login.invalidCpf, login.validPassword);
});

When('I log in with a wrong password', async ({ loginPage }) => {
  await loginPage.login(login.validCpf, login.wrongPassword);
});

When('I log in with an unregistered CPF', async ({ loginPage }) => {
  await loginPage.login(login.unregisteredCpf, login.validPassword);
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

Then('I see the empty CPF error', async ({ errorMessages }) => {
  await expect(errorMessages.all).toHaveText([errors.emptyCpf]);
});

Then('I see the empty password error', async ({ errorMessages }) => {
  await expect(errorMessages.all).toHaveText([errors.emptyPassword]);
});

Then('I see the invalid credentials error', async ({ errorMessages }) => {
  await expect(errorMessages.all).toHaveText([errors.invalidCredentials]);
});
