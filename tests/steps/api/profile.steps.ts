import { expect } from '@playwright/test';
import { api } from '../../fixtures/fixtures';
import { errors, profile } from '../../data/api';

const { Given, When, Then } = api;

When('I get my profile', async ({ request, ctx }) => {
  ctx.response = await request.get('/me', { headers: ctx.headers });
});

When('I change my name and e-mail', async ({ request, ctx }) => {
  ctx.response = await request.put('/me', { data: profile.newData, headers: ctx.headers });
});

When('I save an empty name', async ({ request, ctx }) => {
  ctx.response = await request.put('/me', { data: profile.emptyName, headers: ctx.headers });
});

When('I save an invalid e-mail', async ({ request, ctx }) => {
  ctx.response = await request.put('/me', { data: profile.invalidEmail, headers: ctx.headers });
});

When('I save the e-mail of another account', async ({ request, ctx }) => {
  ctx.response = await request.put('/me', { data: profile.otherAccountEmail, headers: ctx.headers });
});

Given('I have changed my e-mail', async ({ request, ctx }) => {
  const response = await request.put('/me', { data: profile.newEmail, headers: ctx.headers });
  expect(response.ok()).toBe(true);
});

When('I search a recipient by my new e-mail', async ({ request, ctx }) => {
  ctx.response = await request.get('/recipients', { params: { key: profile.newEmail.email }, headers: ctx.headers });
});

Then('I get my user data', async ({ ctx }) => {
  expect(ctx.response.status()).toBe(200);
  expect(await ctx.response.json()).toEqual(profile.user);
});

Then('I get my new data with the e-mail in lowercase', async ({ ctx }) => {
  expect(ctx.response.status()).toBe(200);
  expect(await ctx.response.json()).toEqual({ ...profile.user, ...profile.updatedData });
});

Then('I get the empty name error', async ({ ctx }) => {
  expect(ctx.response.status()).toBe(errors.emptyName.status);
  expect(await ctx.response.json()).toEqual(errors.emptyName.body);
});

Then('I find myself as the recipient', async ({ ctx }) => {
  expect(ctx.response.status()).toBe(200);
  expect(await ctx.response.json()).toEqual(profile.recipientMe);
});
