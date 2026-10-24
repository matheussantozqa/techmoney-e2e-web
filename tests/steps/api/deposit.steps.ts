import { expect } from '@playwright/test';
import { api } from '../../fixtures/fixtures';
import { deposit, errors } from '../../data/api';

const { When, Then } = api;

When('I deposit a valid amount', async ({ request, ctx }) => {
  ctx.response = await request.post('/deposits', { data: deposit.validAmount, headers: ctx.headers });
});

When('I deposit without an amount', async ({ request, ctx }) => {
  ctx.response = await request.post('/deposits', { data: deposit.noAmount, headers: ctx.headers });
});

When('I deposit a zero amount', async ({ request, ctx }) => {
  ctx.response = await request.post('/deposits', { data: deposit.zeroAmount, headers: ctx.headers });
});

When('I deposit the maximum amount', async ({ request, ctx }) => {
  ctx.response = await request.post('/deposits', { data: deposit.maximumAmount, headers: ctx.headers });
});

When('I deposit above the maximum', async ({ request, ctx }) => {
  ctx.response = await request.post('/deposits', { data: deposit.aboveMaximum, headers: ctx.headers });
});

When('I deposit a non-integer amount', async ({ request, ctx }) => {
  ctx.response = await request.post('/deposits', { data: deposit.nonIntegerAmount, headers: ctx.headers });
});

Then('I get the deposit receipt', async ({ ctx }) => {
  expect(ctx.response.status()).toBe(201);
  expect(await ctx.response.json()).toMatchObject(deposit.receipt);
});

Then('my balance is credited by the deposit', async ({ request, ctx }) => {
  const response = await request.get('/me', { headers: ctx.headers });
  expect((await response.json()).balanceCents).toBe(deposit.balanceAfter);
});

Then('I get the empty amount error', async ({ ctx }) => {
  expect(ctx.response.status()).toBe(errors.emptyAmount.status);
  expect(await ctx.response.json()).toEqual(errors.emptyAmount.body);
});

Then('the deposit is accepted', async ({ ctx }) => {
  expect(ctx.response.status()).toBe(201);
});

Then('I get the deposit limit error', async ({ ctx }) => {
  expect(ctx.response.status()).toBe(errors.depositLimit.status);
  expect(await ctx.response.json()).toEqual(errors.depositLimit.body);
});

Then('I get the invalid amount error', async ({ ctx }) => {
  expect(ctx.response.status()).toBe(errors.invalidAmount.status);
  expect(await ctx.response.json()).toEqual(errors.invalidAmount.body);
});
