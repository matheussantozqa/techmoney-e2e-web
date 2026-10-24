import { expect } from '@playwright/test';
import { api } from '../../fixtures/fixtures';
import { errors, register } from '../../data/api';

const { When, Then } = api;

When('I register a new account', async ({ request, ctx }) => {
  ctx.response = await request.post('/auth/register', { data: register.newAccount });
});

When('I register with an invalid CPF', async ({ request, ctx }) => {
  ctx.response = await request.post('/auth/register', { data: register.invalidCpf });
});

When('I register with an invalid e-mail', async ({ request, ctx }) => {
  ctx.response = await request.post('/auth/register', { data: register.invalidEmail });
});

When('I register with an already registered CPF', async ({ request, ctx }) => {
  ctx.response = await request.post('/auth/register', { data: register.registeredCpf });
});

When('I register with an already registered e-mail in uppercase', async ({ request, ctx }) => {
  ctx.response = await request.post('/auth/register', { data: register.registeredEmailUppercase });
});

When('I register with a 5-character password', async ({ request, ctx }) => {
  ctx.response = await request.post('/auth/register', { data: register.shortPassword });
});

Then('I get a token and the new account with zero balance', async ({ ctx }) => {
  expect(ctx.response.status()).toBe(201);
  const body = await ctx.response.json();
  expect(body.token).toEqual(expect.any(String));
  expect(body.user).toMatchObject(register.createdAccount);
});

Then('I get the already registered CPF error', async ({ ctx }) => {
  expect(ctx.response.status()).toBe(errors.registeredCpf.status);
  expect(await ctx.response.json()).toEqual(errors.registeredCpf.body);
});

Then('I get the short password error', async ({ ctx }) => {
  expect(ctx.response.status()).toBe(errors.shortPassword.status);
  expect(await ctx.response.json()).toEqual(errors.shortPassword.body);
});
