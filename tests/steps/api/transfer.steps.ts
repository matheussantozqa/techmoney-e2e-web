import { expect } from '@playwright/test';
import { api } from '../../fixtures/fixtures';
import { auth, errors, transfer } from '../../data/api';

const { Given, When, Then } = api;

When('I transfer to Bruno', async ({ request, ctx }) => {
  ctx.response = await request.post('/transfers', { data: transfer.toBruno, headers: ctx.headers });
});

When('I search Bruno by his e-mail in uppercase', async ({ request, ctx }) => {
  ctx.response = await request.get('/recipients', { params: transfer.brunoEmailUppercase, headers: ctx.headers });
});

When('I transfer to an unknown key', async ({ request, ctx }) => {
  ctx.response = await request.post('/transfers', { data: transfer.toUnknownKey, headers: ctx.headers });
});

When('I transfer to myself', async ({ request, ctx }) => {
  ctx.response = await request.post('/transfers', { data: transfer.toMyself, headers: ctx.headers });
});

When('I transfer a zero amount', async ({ request, ctx }) => {
  ctx.response = await request.post('/transfers', { data: transfer.zeroAmount, headers: ctx.headers });
});

When('I transfer more than my balance', async ({ request, ctx }) => {
  ctx.response = await request.post('/transfers', { data: transfer.aboveBalance, headers: ctx.headers });
});

When('I transfer exactly my daily limit', async ({ request, ctx }) => {
  ctx.response = await request.post('/transfers', { data: transfer.exactDailyLimit, headers: ctx.headers });
});

When('I transfer above my daily limit', async ({ request, ctx }) => {
  ctx.response = await request.post('/transfers', { data: transfer.aboveDailyLimit, headers: ctx.headers });
});

Given('I have transferred part of my daily limit', async ({ request, ctx }) => {
  const response = await request.post('/transfers', { data: transfer.partOfDailyLimit, headers: ctx.headers });
  expect(response.ok()).toBe(true);
});

When('I check my daily limit', async ({ request, ctx }) => {
  ctx.response = await request.get('/me/daily-limit', { headers: ctx.headers });
});

When('I transfer with a wrong PIN', async ({ request, ctx }) => {
  ctx.response = await request.post('/transfers', { data: transfer.wrongPin, headers: ctx.headers });
});

Given('I have entered a wrong PIN twice', async ({ request, ctx }) => {
  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await request.post('/transfers', { data: transfer.wrongPin, headers: ctx.headers });
    expect(response.status()).toBe(errors.wrongPin.status);
  }
});

Given('I have blocked my transaction PIN', async ({ request, ctx }) => {
  for (let attempt = 0; attempt < 3; attempt++) {
    await request.post('/transfers', { data: transfer.wrongPin, headers: ctx.headers });
  }
  const status = await request.get('/me/pin-status', { headers: ctx.headers });
  expect(await status.json()).toEqual({ blocked: true });
});

When('I log in again', async ({ request, ctx }) => {
  ctx.response = await request.post('/auth/login', { data: auth.validLogin });
});

Then('I get the transfer receipt', async ({ ctx }) => {
  expect(ctx.response.status()).toBe(201);
  const receipt = await ctx.response.json();
  expect(receipt).toMatchObject(transfer.receipt);
  expect(receipt.id).toMatch(transfer.receiptId);
});

Then('my balance is debited by the transfer', async ({ request, ctx }) => {
  const response = await request.get('/me', { headers: ctx.headers });
  expect((await response.json()).balanceCents).toBe(transfer.balanceAfter);
});

Then('Bruno receives the amount', async ({ request, ctx }) => {
  expect(ctx.response.status()).toBe(201);
  const login = await request.post('/auth/login', { data: transfer.brunoLogin });
  const brunoHeaders = { Authorization: `Bearer ${(await login.json()).token}` };
  const response = await request.get('/me', { headers: brunoHeaders });
  expect((await response.json()).balanceCents).toBe(transfer.brunoBalanceAfter);
});

Then('I find Bruno as the recipient', async ({ ctx }) => {
  expect(ctx.response.status()).toBe(200);
  expect(await ctx.response.json()).toEqual(transfer.bruno);
});

Then('I get the unknown recipient error', async ({ ctx }) => {
  expect(ctx.response.status()).toBe(errors.unknownRecipient.status);
  expect(await ctx.response.json()).toEqual(errors.unknownRecipient.body);
});

Then('I get the self transfer error', async ({ ctx }) => {
  expect(ctx.response.status()).toBe(errors.selfTransfer.status);
  expect(await ctx.response.json()).toEqual(errors.selfTransfer.body);
});

Then('I get the insufficient balance error', async ({ ctx }) => {
  expect(ctx.response.status()).toBe(errors.insufficientBalance.status);
  expect(await ctx.response.json()).toEqual(errors.insufficientBalance.body);
});

Then('the transfer is accepted', async ({ ctx }) => {
  expect(ctx.response.status()).toBe(201);
});

Then('I get the daily limit error', async ({ ctx }) => {
  expect(ctx.response.status()).toBe(errors.dailyLimit.status);
  expect(await ctx.response.json()).toEqual(errors.dailyLimit.body);
});

Then('I see the remaining daily limit', async ({ ctx }) => {
  expect(ctx.response.status()).toBe(200);
  expect(await ctx.response.json()).toEqual(transfer.remainingDailyLimit);
});

Then('I get the wrong PIN error', async ({ ctx }) => {
  expect(ctx.response.status()).toBe(errors.wrongPin.status);
  expect(await ctx.response.json()).toEqual(errors.wrongPin.body);
});

Then('I get the blocked PIN error', async ({ ctx }) => {
  expect(ctx.response.status()).toBe(errors.blockedPin.status);
  expect(await ctx.response.json()).toEqual(errors.blockedPin.body);
});

Then('my transaction PIN is blocked', async ({ request, ctx }) => {
  const response = await request.get('/me/pin-status', { headers: ctx.headers });
  expect(await response.json()).toEqual({ blocked: true });
});

Then('my transaction PIN is unblocked', async ({ request, ctx }) => {
  expect(ctx.response.status()).toBe(200);
  const response = await request.get('/me/pin-status', { headers: ctx.headers });
  expect(await response.json()).toEqual({ blocked: false });
});
