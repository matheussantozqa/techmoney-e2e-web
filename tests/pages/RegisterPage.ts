import { Locator, Page } from '@playwright/test';

export class RegisterPage {
  readonly title: Locator;
  readonly name: Locator;
  readonly cpf: Locator;
  readonly email: Locator;
  readonly password: Locator;
  readonly confirmation: Locator;
  readonly submit: Locator;

  constructor(page: Page) {
    this.title = page.getByTestId('register_text_title');
    this.name = page.getByTestId('register_input_name');
    this.cpf = page.getByTestId('register_input_cpf');
    this.email = page.getByTestId('register_input_email');
    this.password = page.getByTestId('register_input_password');
    this.confirmation = page.getByTestId('register_input_confirm_password');
    this.submit = page.getByTestId('register_button_submit');
  }

  async register(name: string, cpf: string, email: string, password: string, confirmation: string) {
    await this.name.fill(name);
    await this.cpf.fill(cpf);
    await this.email.fill(email);
    await this.password.fill(password);
    await this.confirmation.fill(confirmation);
    await this.submit.click();
  }
}
