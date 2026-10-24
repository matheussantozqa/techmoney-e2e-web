import { expect } from '@playwright/test';
import { api } from '../../fixtures/fixtures';
import { auth, errors } from '../../data/api';

const { Given, Then } = api;

// Pré-condição: o expect aqui garante que o cenário para no login se ele falhar.
Given('I am logged in', async ({ request, ctx }) => {
  const response = await request.post('/auth/login', { data: auth.validLogin });
  expect(response.ok()).toBe(true);
  ctx.headers = { Authorization: `Bearer ${(await response.json()).token}` };
});

// Erros usados por mais de uma feature.

Then('I get the invalid CPF error', async ({ ctx }) => {
  expect(ctx.response.status()).toBe(errors.invalidCpf.status);
  expect(await ctx.response.json()).toEqual(errors.invalidCpf.body);
});

Then('I get the invalid e-mail error', async ({ ctx }) => {
  expect(ctx.response.status()).toBe(errors.invalidEmail.status);
  expect(await ctx.response.json()).toEqual(errors.invalidEmail.body);
});

Then('I get the already registered e-mail error', async ({ ctx }) => {
  expect(ctx.response.status()).toBe(errors.registeredEmail.status);
  expect(await ctx.response.json()).toEqual(errors.registeredEmail.body);
});

Then('I get the zero amount error', async ({ ctx }) => {
  expect(ctx.response.status()).toBe(errors.zeroAmount.status);
  expect(await ctx.response.json()).toEqual(errors.zeroAmount.body);
});
