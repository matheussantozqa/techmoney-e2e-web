import { Locator, Page } from '@playwright/test';

export class HomePage {
  readonly greeting: Locator;
  readonly balance: Locator;
  readonly transactionDescriptions: Locator;

  constructor(page: Page) {
    this.greeting = page.getByTestId('home_text_greeting');
    this.balance = page.getByTestId('home_text_balance');
    this.transactionDescriptions = page.getByTestId(/^home_item_\d+_description$/);
  }
}
