import { Locator, Page } from '@playwright/test';

export class LoginPage {
  readonly cpf: Locator;
  readonly password: Locator;
  readonly togglePasswordButton: Locator;
  readonly submit: Locator;
  readonly registerButton: Locator;

  constructor(private page: Page) {
    this.cpf = page.getByTestId('login_input_cpf');
    this.password = page.getByTestId('login_input_password');
    this.togglePasswordButton = page.getByTestId('login_button_toggle_password');
    this.submit = page.getByTestId('login_button_submit');
    this.registerButton = page.getByTestId('login_button_register');
  }

  async open() {
    await this.page.goto('/');
  }

  async login(cpf: string, password: string) {
    await this.cpf.fill(cpf);
    await this.password.fill(password);
    await this.submit.click();
  }

  async typePassword(password: string) {
    await this.password.fill(password);
  }

  async togglePassword() {
    await this.togglePasswordButton.click();
  }

  async openRegister() {
    await this.registerButton.click();
  }
}
