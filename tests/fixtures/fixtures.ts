import { APIResponse } from '@playwright/test';
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

// Estado de um cenário de API: o When guarda a resposta e o Then confere; o login guarda o header do token.
type Ctx = {
  response: APIResponse;
  headers: { Authorization: string };
  attached?: APIResponse;
};

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
  ctx: Ctx;
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

  // Nasce vazio a cada cenário: todo cenário de API começa sem resposta e sem login.
  ctx: async ({}, use) => use({} as Ctx),

  // Todo cenário (web e API) começa no seed do app.
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

// Um conjunto de steps por camada (pela tag da feature): a mesma frase pode existir na web e na API sem conflito.
export const web = createBdd(test, { tags: '@web' });
export const api = createBdd(test, { tags: '@api' });

// Anexa no Allure a resposta que o passo de API recebeu (o request completo fica no trace).
// O token é mascarado porque o relatório é publicado.
api.AfterStep(async ({ ctx, $testInfo }) => {
  const response = ctx.response;
  if (!response || response === ctx.attached) return;
  ctx.attached = response;
  const text = await response.text();
  const body = text ? JSON.stringify(JSON.parse(text), (key, value) => (key === 'token' ? '***' : value), 2) : '';
  await $testInfo.attach(`${response.status()} ${new URL(response.url()).pathname}`, {
    body,
    contentType: 'application/json',
  });
});
