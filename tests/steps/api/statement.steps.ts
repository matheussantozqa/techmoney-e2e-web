import { APIResponse, expect } from '@playwright/test';
import { api } from '../../fixtures/fixtures';
import { errors, statement } from '../../data/api';

const { When, Then } = api;

// A ordem e o filtro do extrato ficam claros comparando só as descrições.
async function descriptions(response: APIResponse) {
  const transactions: { description: string }[] = await response.json();
  return transactions.map((transaction) => transaction.description);
}

When('I get my statement', async ({ request, ctx }) => {
  ctx.response = await request.get('/me/transactions', { headers: ctx.headers });
});

When('I get my statement filtered by income', async ({ request, ctx }) => {
  ctx.response = await request.get('/me/transactions', { params: statement.incomeFilter, headers: ctx.headers });
});

When('I get my statement filtered by outcome', async ({ request, ctx }) => {
  ctx.response = await request.get('/me/transactions', { params: statement.outcomeFilter, headers: ctx.headers });
});

When('I get my statement for September', async ({ request, ctx }) => {
  ctx.response = await request.get('/me/transactions', { params: statement.septemberFilter, headers: ctx.headers });
});

When('I get my statement for a single day', async ({ request, ctx }) => {
  ctx.response = await request.get('/me/transactions', { params: statement.singleDayFilter, headers: ctx.headers });
});

When('I get my statement with the start date after the end date', async ({ request, ctx }) => {
  ctx.response = await request.get('/me/transactions', { params: statement.invertedPeriodFilter, headers: ctx.headers });
});

When('I get a transaction by its id', async ({ request, ctx }) => {
  ctx.response = await request.get(`/me/transactions/${statement.transactionId}`, { headers: ctx.headers });
});

When('I get an unknown transaction', async ({ request, ctx }) => {
  ctx.response = await request.get(`/me/transactions/${statement.unknownTransactionId}`, { headers: ctx.headers });
});

Then('I get all my transactions from the most recent', async ({ ctx }) => {
  expect(ctx.response.status()).toBe(200);
  expect(await descriptions(ctx.response)).toEqual(statement.allTransactions);
});

Then('I get only the income transactions', async ({ ctx }) => {
  expect(ctx.response.status()).toBe(200);
  expect(await descriptions(ctx.response)).toEqual(statement.incomeTransactions);
});

Then('I get only the outcome transactions', async ({ ctx }) => {
  expect(ctx.response.status()).toBe(200);
  expect(await descriptions(ctx.response)).toEqual(statement.outcomeTransactions);
});

Then('I get only the September transactions', async ({ ctx }) => {
  expect(ctx.response.status()).toBe(200);
  expect(await descriptions(ctx.response)).toEqual(statement.septemberTransactions);
});

Then('I get only the transactions of that day', async ({ ctx }) => {
  expect(ctx.response.status()).toBe(200);
  expect(await descriptions(ctx.response)).toEqual(statement.singleDayTransactions);
});

Then('I get the inverted period error', async ({ ctx }) => {
  expect(ctx.response.status()).toBe(errors.invertedPeriod.status);
  expect(await ctx.response.json()).toEqual(errors.invertedPeriod.body);
});

Then('I get the transaction details', async ({ ctx }) => {
  expect(ctx.response.status()).toBe(200);
  expect(await ctx.response.json()).toEqual(statement.transaction);
});

Then('I get the transaction not found error', async ({ ctx }) => {
  expect(ctx.response.status()).toBe(errors.transactionNotFound.status);
  expect(await ctx.response.json()).toEqual(errors.transactionNotFound.body);
});
