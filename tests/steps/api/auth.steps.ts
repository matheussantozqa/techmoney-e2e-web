import { expect } from '@playwright/test';
import { api } from '../../fixtures/fixtures';
import { auth, errors, profile } from '../../data/api';

const { When, Then } = api;

When('I log in with valid credentials', async ({ request, ctx }) => {
  ctx.response = await request.post('/auth/login', { data: auth.validLogin });
});

When('I log in with an empty CPF', async ({ request, ctx }) => {
  ctx.response = await request.post('/auth/login', { data: auth.emptyCpf });
});

When('I log in with an empty password', async ({ request, ctx }) => {
  ctx.response = await request.post('/auth/login', { data: auth.emptyPassword });
});

When('I log in with an invalid CPF', async ({ request, ctx }) => {
  ctx.response = await request.post('/auth/login', { data: auth.invalidCpf });
});

When('I log in with a wrong password', async ({ request, ctx }) => {
  ctx.response = await request.post('/auth/login', { data: auth.wrongPassword });
});

When('I log in with an unregistered CPF', async ({ request, ctx }) => {
  ctx.response = await request.post('/auth/login', { data: auth.unregisteredCpf });
});

When('I get my profile without a token', async ({ request, ctx }) => {
  ctx.response = await request.get('/me');
});

When('I log out', async ({ request, ctx }) => {
  ctx.response = await request.post('/auth/logout', { headers: ctx.headers });
});

Then('I get a token and my user data', async ({ ctx }) => {
  expect(ctx.response.status()).toBe(200);
  expect(await ctx.response.json()).toEqual({ token: expect.any(String), user: profile.user });
});

Then('I get the empty CPF error', async ({ ctx }) => {
  expect(ctx.response.status()).toBe(errors.emptyCpf.status);
  expect(await ctx.response.json()).toEqual(errors.emptyCpf.body);
});

Then('I get the empty password error', async ({ ctx }) => {
  expect(ctx.response.status()).toBe(errors.emptyPassword.status);
  expect(await ctx.response.json()).toEqual(errors.emptyPassword.body);
});

Then('I get the invalid credentials error', async ({ ctx }) => {
  expect(ctx.response.status()).toBe(errors.invalidCredentials.status);
  expect(await ctx.response.json()).toEqual(errors.invalidCredentials.body);
});

Then('I get the unauthorized error', async ({ ctx }) => {
  expect(ctx.response.status()).toBe(errors.unauthorized.status);
  expect(await ctx.response.json()).toEqual(errors.unauthorized.body);
});

Then('my token is rejected', async ({ request, ctx }) => {
  expect(ctx.response.status()).toBe(204);
  const response = await request.get('/me', { headers: ctx.headers });
  expect(response.status()).toBe(errors.unauthorized.status);
  expect(await response.json()).toEqual(errors.unauthorized.body);
});
