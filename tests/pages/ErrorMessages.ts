import { Locator, Page } from '@playwright/test';

// Mensagens de erro de qualquer tela: no app, todo ID de erro termina em "_error".
export class ErrorMessages {
  readonly all: Locator;

  constructor(page: Page) {
    this.all = page.getByTestId(/_error$/);
  }
}
