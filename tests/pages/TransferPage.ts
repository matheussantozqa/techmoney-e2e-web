import { Locator, Page } from '@playwright/test';

export class TransferPage {
  readonly openButton: Locator;
  readonly key: Locator;
  readonly amount: Locator;
  readonly description: Locator;
  readonly next: Locator;
  readonly confirm: Locator;
  readonly done: Locator;
  readonly receiptAmount: Locator;
  readonly receiptRecipient: Locator;
  readonly receiptDescription: Locator;

  constructor(private page: Page) {
    this.openButton = page.getByTestId('nav_button_transfer');
    this.key = page.getByTestId('transfer_input_key');
    this.amount = page.getByTestId('transfer_input_amount');
    this.description = page.getByTestId('transfer_input_description');
    this.next = page.getByTestId('transfer_button_next');
    this.confirm = page.getByTestId('transfer_button_confirm');
    this.done = page.getByTestId('transfer_button_done');
    this.receiptAmount = page.getByTestId('transfer_text_receipt_amount');
    this.receiptRecipient = page.getByTestId('transfer_text_receipt_recipient');
    this.receiptDescription = page.getByTestId('transfer_text_receipt_description');
  }

  async open() {
    await this.openButton.click();
  }

  async enterKey(key: string) {
    await this.key.fill(key);
    await this.next.click();
  }

  async enterAmount(amount: string, description = '') {
    await this.amount.fill(amount);
    await this.description.fill(description);
    await this.next.click();
  }

  async goToPinStep(key: string, amount: string, description = '') {
    await this.open();
    await this.enterKey(key);
    await this.enterAmount(amount, description);
    await this.confirm.click();
  }

  async enterPin(pin: string) {
    for (const digit of pin) {
      await this.page.getByTestId(`transfer_button_pin_${digit}`).click();
    }
  }

  async finish() {
    await this.done.click();
  }
}
