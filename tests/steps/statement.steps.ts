import { expect } from '@playwright/test';
import { When, Then } from '../fixtures/fixtures';
import { statement } from '../fixtures/data';

When('I open the statement', async ({ statementPage }) => {
  await statementPage.open();
});

When('I filter by income', async ({ statementPage }) => {
  await statementPage.filterBy(statement.incomeFilter);
});

When('I filter by a period', async ({ statementPage }) => {
  await statementPage.setPeriod(statement.periodFrom, statement.periodTo);
});

When('I open a transaction from the statement', async ({ statementPage }) => {
  await statementPage.open();
  await statementPage.openTransaction(statement.detailDescription);
});

Then('I see all the transactions', async ({ statementPage }) => {
  await expect(statementPage.transactionDescriptions).toHaveText(statement.allTransactions);
});

Then('I see only the income transactions', async ({ statementPage }) => {
  await expect(statementPage.transactionDescriptions).toHaveText(statement.incomeTransactions);
});

Then('I see only the transactions of that period', async ({ statementPage }) => {
  await expect(statementPage.transactionDescriptions).toHaveText(statement.periodTransactions);
});

Then('I see the transaction details', async ({ statementPage }) => {
  await expect(statementPage.detailType).toHaveText(statement.detailType);
  await expect(statementPage.detailAmount).toHaveText(statement.detailAmount);
  await expect(statementPage.detailDescription).toHaveText(statement.detailDescription);
  await expect(statementPage.detailCounterpart).toHaveText(statement.detailCounterpart);
  await expect(statementPage.detailDate).toHaveText(statement.detailDate);
  await expect(statementPage.detailId).toHaveText(statement.detailId);
});
