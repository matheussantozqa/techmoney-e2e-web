import { expect } from '@playwright/test';
import { web } from '../../fixtures/fixtures';
import { profile } from '../../data/web';

const { When, Then } = web;

When('I open my profile', async ({ profilePage }) => {
  await profilePage.open();
});

When('I log out', async ({ profilePage }) => {
  await profilePage.logout();
});

When('I change my name', async ({ profilePage }) => {
  await profilePage.editData(profile.newName, profile.email);
});

Then('I see my profile data', async ({ profilePage }) => {
  await expect(profilePage.name).toHaveText(profile.name);
  await expect(profilePage.cpf).toHaveText(profile.cpf);
  await expect(profilePage.email).toHaveText(profile.email);
  await expect(profilePage.agency).toHaveText(profile.agency);
  await expect(profilePage.account).toHaveText(profile.account);
});

Then('I see the new name in my profile', async ({ profilePage }) => {
  await expect(profilePage.name).toHaveText(profile.newName);
});

Then('I see the login screen', async ({ loginPage }) => {
  await expect(loginPage.submit).toBeVisible();
});
