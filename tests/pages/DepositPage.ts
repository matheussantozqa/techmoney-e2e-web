import { Locator, Page } from '@playwright/test';

export class DepositPage {
  readonly openButton: Locator;
  readonly amount: Locator;
  readonly submit: Locator;
  readonly done: Locator;
  readonly receiptAmount: Locator;
  readonly receiptBalance: Locator;

  constructor(page: Page) {
    this.openButton = page.getByTestId('nav_button_deposit');
    this.amount = page.getByTestId('deposit_input_amount');
    this.submit = page.getByTestId('deposit_button_submit');
    this.done = page.getByTestId('deposit_button_done');
    this.receiptAmount = page.getByTestId('deposit_text_receipt_amount');
    this.receiptBalance = page.getByTestId('deposit_text_receipt_balance');
  }

  async deposit(amount: string) {
    await this.openButton.click();
    await this.amount.fill(amount);
    await this.submit.click();
  }

  async finish() {
    await this.done.click();
  }
}
