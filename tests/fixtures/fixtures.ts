import { test as base, createBdd } from 'playwright-bdd';
import { DepositPage } from '../pages/DepositPage';
import { ErrorMessages } from '../pages/ErrorMessages';
import { HelpPage } from '../pages/HelpPage';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { ProfilePage } from '../pages/ProfilePage';
import { RegisterPage } from '../pages/RegisterPage';
import { StatementPage } from '../pages/StatementPage';
import { TransferPage } from '../pages/TransferPage';
import { API_URL } from '../support/env';

type Fixtures = {
  loginPage: LoginPage;
  registerPage: RegisterPage;
  homePage: HomePage;
  transferPage: TransferPage;
  depositPage: DepositPage;
  statementPage: StatementPage;
  profilePage: ProfilePage;
  helpPage: HelpPage;
  errorMessages: ErrorMessages;
  resetData: void;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  registerPage: async ({ page }, use) => use(new RegisterPage(page)),
  homePage: async ({ page }, use) => use(new HomePage(page)),
  transferPage: async ({ page }, use) => use(new TransferPage(page)),
  depositPage: async ({ page }, use) => use(new DepositPage(page)),
  statementPage: async ({ page }, use) => use(new StatementPage(page)),
  profilePage: async ({ page }, use) => use(new ProfilePage(page)),
  helpPage: async ({ page }, use) => use(new HelpPage(page)),
  errorMessages: async ({ page }, use) => use(new ErrorMessages(page)),

  // Todo cenário começa no seed do app.
  resetData: [
    async ({ playwright }, use) => {
      const api = await playwright.request.newContext({ baseURL: API_URL });
      const response = await api.post('/reset');
      if (!response.ok()) throw new Error(`API /reset -> ${response.status()}: ${await response.text()}`);
      await api.dispose();
      await use();
    },
    { auto: true },
  ],
});

export const { Given, When, Then } = createBdd(test);
