import { Locator, Page } from '@playwright/test';

// Perfil e a tela de editar dados (que abre pelo botão "edit" do perfil).
export class ProfilePage {
  readonly openButton: Locator;
  readonly name: Locator;
  readonly cpf: Locator;
  readonly email: Locator;
  readonly agency: Locator;
  readonly account: Locator;
  readonly editButton: Locator;
  readonly logoutButton: Locator;
  readonly logoutConfirm: Locator;
  readonly editName: Locator;
  readonly editEmail: Locator;
  readonly editSave: Locator;

  constructor(page: Page) {
    this.openButton = page.getByTestId('nav_button_profile');
    this.name = page.getByTestId('profile_text_name');
    this.cpf = page.getByTestId('profile_text_cpf');
    this.email = page.getByTestId('profile_text_email');
    this.agency = page.getByTestId('profile_text_agency');
    this.account = page.getByTestId('profile_text_account');
    this.editButton = page.getByTestId('profile_button_edit');
    this.logoutButton = page.getByTestId('profile_button_logout');
    this.logoutConfirm = page.getByTestId('dialog_button_confirm');
    this.editName = page.getByTestId('edit_profile_input_name');
    this.editEmail = page.getByTestId('edit_profile_input_email');
    this.editSave = page.getByTestId('edit_profile_button_save');
  }

  async open() {
    await this.openButton.click();
  }

  async editData(name: string, email: string) {
    await this.open();
    await this.editButton.click();
    await this.editName.fill(name);
    await this.editEmail.fill(email);
    await this.editSave.click();
  }

  async logout() {
    await this.open();
    await this.logoutButton.click();
    await this.logoutConfirm.click();
  }
}
