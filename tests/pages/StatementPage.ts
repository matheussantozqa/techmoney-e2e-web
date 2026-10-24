import { Locator, Page } from '@playwright/test';

// Extrato e detalhe da transação (que abre ao tocar num item do extrato).
export class StatementPage {
  readonly openButton: Locator;
  readonly startDate: Locator;
  readonly endDate: Locator;
  readonly transactions: Locator;
  readonly transactionDescriptions: Locator;
  // Calendário: na web é o campo de data do navegador numa caixa do app.
  readonly dateInput: Locator;
  readonly dateConfirm: Locator;
  readonly detailType: Locator;
  readonly detailAmount: Locator;
  readonly detailDescription: Locator;
  readonly detailCounterpart: Locator;
  readonly detailDate: Locator;
  readonly detailId: Locator;

  constructor(private page: Page) {
    this.openButton = page.getByTestId('nav_button_statement');
    this.startDate = page.getByTestId('statement_button_date_from');
    this.endDate = page.getByTestId('statement_button_date_to');
    this.transactions = page.getByTestId(/^statement_item_\d+$/);
    this.transactionDescriptions = page.getByTestId(/^statement_item_\d+_description$/);
    this.dateInput = page.getByTestId('datepicker_input_date');
    this.dateConfirm = page.getByTestId('datepicker_button_confirm');
    this.detailType = page.getByTestId('transaction_text_type');
    this.detailAmount = page.getByTestId('transaction_text_amount');
    this.detailDescription = page.getByTestId('transaction_text_description');
    this.detailCounterpart = page.getByTestId('transaction_text_counterpart');
    this.detailDate = page.getByTestId('transaction_text_date');
    this.detailId = page.getByTestId('transaction_text_id');
  }

  async open() {
    await this.openButton.click();
  }

  /** Datas como na tela: "05/10/2026". */
  async setPeriod(from: string, to: string) {
    await this.startDate.click();
    await this.pickDate(from);
    await this.endDate.click();
    await this.pickDate(to);
  }

  async openTransaction(description: string) {
    await this.transactions.filter({ has: this.page.getByText(description, { exact: true }) }).click();
  }

  // O <input type="date"> só aceita "aaaa-mm-dd".
  private async pickDate(date: string) {
    const [day, month, year] = date.split('/');
    await this.dateInput.fill(`${year}-${month}-${day}`);
    await this.dateConfirm.click();
  }
}
