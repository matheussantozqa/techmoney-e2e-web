import { Locator, Page } from '@playwright/test';

export class HelpPage {
  readonly openButton: Locator;
  readonly topics: Locator;
  readonly messages: Locator;

  constructor(page: Page) {
    this.openButton = page.getByTestId('help_button_open');
    this.topics = page.getByTestId(/^help_button_topic_/);
    this.messages = page.getByTestId(/^help_item_\d+_text$/);
  }

  async open() {
    await this.openButton.click();
  }

  async chooseTopic(question: string) {
    await this.topics.filter({ hasText: question }).click();
  }
}
