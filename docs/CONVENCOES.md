# Convenções de escrita

Como escrever cada peça da suíte, com exemplos **certo / errado**. Cada seção cita os IDs dos [guardrails](../.claude/rules/guardrails.md). Genérico; exemplos de uma loja fictícia (ilustrativos, G-02).

Índice: [1. Camada](#1-em-qual-camada-vai-o-teste) · [2. Features](#2-features) · [3. Frases](#3-como-escrever-as-frases) · [4. Tags e IDs](#4-tags-e-ids) · [5. Steps web](#5-steps-web) · [6. Page Objects](#6-page-objects) · [7. Localizadores](#7-localizadores) · [8. Steps de API](#8-steps-de-api) · [9. Massa](#9-massa-testsdata) · [10. Asserts](#10-asserts) · [11. Clean code](#11-clean-code)

---

## 1. Em qual camada vai o teste

G-05. Pergunta de decisão: **"dá para provar isso chamando a API?"** Sim → API. Não → web.

| Caso | Camada | Por quê |
|---|---|---|
| Login com sucesso | API **e** web | API: contrato do token. Web: o fluxo feliz da tela |
| Senha errada | API (todos os erros) + web (um) | Web só prova que o erro aparece para o usuário |
| E-mail inválido, campo vazio, tamanho mínimo | API | Validação é regra |
| Valor limite (máximo, mínimo, igual ao limite) | API | Regra |
| Efeito colateral (estoque baixou, saldo, status) | API | GET depois do `When` mostra o efeito |
| Mostrar/ocultar senha, "confirmar senha" só no front | Web | Só existe na tela |
| Todos os erros de campo de uma vez no formulário | Web | Comportamento da tela |
| Navegação, menu, link, calendário, componente visual | Web | Só existe na tela |
| Ordenação/filtro de lista | API (regra) + web (um, se o filtro for da tela) | |

Teste que muda de camada ganha o próximo ID da feature de destino; o antigo fica aposentado na feature de origem (FEA-07).

---

## 2. Features

FEA-01..08, TAG-01..02.

Certo:

```gherkin
@web @login
Feature: Login

  Background:
    Given I am on the login page

  @smoke @regression
  Scenario: TC001-Successful login with valid credentials
    When I log in with valid credentials
    Then I see my home

  @regression
  Scenario: TC002-Wrong password is rejected
    When I log in with a wrong password
    Then I see the invalid credentials error
```

```gherkin
@api @order
Feature: Order

  Background:
    Given I am logged in

  @smoke @regression
  Scenario: TC001-Successful order returns the receipt and lowers the stock
    When I order an available product
    Then I get the order receipt
    And the product stock is lowered

  @regression
  Scenario: TC002-Quantity above the stock is rejected
    When I order more than the stock
    Then I get the out of stock error
```

Errado (e a regra quebrada):

```gherkin
Feature: Login                                   # TAG-01: falta @web e @login
  As a customer I want to log in                 # FEA-08: narrativa
  Scenario: login                                # FEA-07: sem TC<NNN>; TAG-02: sem @regression
    When I fill "user@shop.com" in the e-mail    # FEA-01 imperativo; FEA-02 valor na feature
    And I click the "Sign in" button             # FEA-01
    Then I am redirected to "/home"              # FEA-01: URL na feature

  Scenario Outline: invalid login                # FEA-02: Outline
    When I log in with "<email>"
    Examples:
      | email |
```

```gherkin
@api @order
Feature: Order
  Scenario: TC003-Order
    When I send a POST to /orders with quantity 999   # FEA-01: HTTP e valor
    Then the status is 422                             # FEA-01: detalhe técnico na frase
```

---

## 3. Como escrever as frases

Frases fixas, em inglês, primeira pessoa, que dizem a **intenção**. Padrão observado e recomendado:

| Tipo | Web | API |
|---|---|---|
| Pré-condição | `Given I am on the <screen> page` / `Given I am logged in` / `Given I have <state>` | `Given I am logged in` / `Given I have <state>` |
| Ação | `When I <verbo> <o caso>`: `When I log in with a wrong password`, `When I open the cart` | `When I <verbo> <o caso>`: `When I order more than the stock`, `When I get my orders filtered by status` |
| Resultado | `Then I see <o que aparece>`: `Then I see the order receipt` | `Then I get <a resposta>`: `Then I get the out of stock error` |
| Efeito | `Then I see <o estado novo>` | `Then <o recurso> is <estado>`: `Then the product stock is lowered` |

- O caso vai **no texto**: `When I order more than the stock`, não `When I order with an invalid quantity` se houver vários inválidos (cada um tem a sua frase).
- Mesma frase, sentidos diferentes, na mesma camada: diferenciar (`I see the order receipt` x `I see the refund receipt`) (STP-03).
- Mesma frase em web e API (`Given I am logged in`): normal, cada camada tem a sua implementação.
- Nome de pessoa/entidade da massa pode aparecer se ajudar a ler (`When I transfer to Bruno`) — o valor dela continua em `data/`.

---

## 4. Tags e IDs

| Tag | Onde | Regra |
|---|---|---|
| `@web` / `@api` | Linha da `Feature` | Escolhe o projeto e o conjunto de steps (TAG-01) |
| `@<funcionalidade>` | Linha da `Feature` | Mesma tag nas duas camadas: `--grep @order` roda as duas |
| `@regression` | Todo cenário | TAG-02 |
| `@smoke` | Fluxo feliz principal (1–3 por funcionalidade) | Roda em todo push |
| `@skip` / `@fixme` | Cenário | Com comentário do motivo acima (TAG-03) |
| `@fail @bug-<id>` | Cenário | Bug conhecido: o teste avisa quando o bug for corrigido (G-04) |
| `@only` | Só local | Nunca commitado; `forbidOnly` no CI |

IDs (FEA-07):

- Formato `TC<NNN>-<Description in English>`: `TC004-Empty cart shows the empty message`.
- **Por feature**: cada `.feature` numera a partir do `TC001`. O cenário é identificado por feature + ID (`web/cart` TC004); o mesmo `TC001` existe em vários arquivos.
- Próximo ID da feature = maior `TC` dela (incluindo os aposentados na rastreabilidade) + 1. Para achar: `grep -oE "TC[0-9]{3}" tests/features/web/cart.feature | sort -u | tail -1`.
- Rodar um cenário: arquivo + ID, `npm run test:ci -- web/cart --grep TC004`.
- Nunca reaproveitar, renumerar ou "fechar buracos".

Bug conhecido:

```gherkin
  # Bug: a API aceita quantidade negativa (contrato diz 422). Abrir/linkar no tracker.
  @regression @fail @bug-123
  Scenario: TC004-Negative quantity is rejected
```

---

## 5. Steps web

STP-01..08.

```ts
import { expect } from '@playwright/test';
import { web } from '../../fixtures/fixtures';
import { errors, login } from '../../data/web';

const { Given, When, Then } = web;

Given('I am on the login page', async ({ loginPage }) => {
  await loginPage.open();
});

When('I log in with a wrong password', async ({ loginPage }) => {
  await loginPage.login(login.validEmail, login.wrongPassword);
});

Then('I see the invalid credentials error', async ({ loginPage }) => {
  await expect(loginPage.error).toHaveText(errors.invalidCredentials);
});
```

Errado:

```ts
import { test } from '@playwright/test';                       // STP-01
const { When } = createBdd();                                   // STP-01
let lastEmail: string;                                          // STP-07

When('I log in with {string}', async ({ page }, email) => {    // STP-02 parâmetro; POM-01 page direto
  await page.locator('#email').fill(email);                     // POM-01, LOC-02
  await page.waitForTimeout(1000);                              // ESP-01
  expect(await page.locator('.error').textContent()).toBe('x'); // STP-06, ESP-02, LOC-02
});
```

- Pré-condição de login pela tela pode esperar um elemento da tela seguinte (`await homePage.greeting.waitFor()`) para garantir que o login terminou.
- Laço (digitar dígitos, percorrer itens) fica na page, não no step.

---

## 6. Page Objects

POM-01..08.

```ts
import { Locator, Page } from '@playwright/test';

export class CartPage {
  readonly openButton: Locator;
  readonly items: Locator;
  readonly total: Locator;
  readonly checkoutButton: Locator;

  constructor(private page: Page) {
    this.openButton = page.getByTestId('nav_button_cart');
    this.items = page.getByTestId(/^cart_item_\d+$/);
    this.total = page.getByTestId('cart_text_total');
    this.checkoutButton = page.getByRole('button', { name: 'Checkout' });
  }

  async open() {
    await this.openButton.click();
  }

  // Locator que depende do valor: método que devolve Locator (POM-03).
  item(name: string) {
    return this.items.filter({ hasText: name });
  }

  async removeItem(name: string) {
    await this.item(name).getByRole('button', { name: 'Remove' }).click();
  }

  async checkout() {
    await this.checkoutButton.click();
  }
}
```

Registrar como fixture (POM-08):

```ts
type Fixtures = { cartPage: CartPage; /* ... */ };
// ...
cartPage: async ({ page }, use) => use(new CartPage(page)),
```

Errado:

```ts
export class CartPage extends BasePage {                    // POM-06
  async removeBananaAndCheckout() { ... }                   // POM-04: dado dentro, duas ações de caso
  async expectTotal(value: string) {
    await expect(this.total).toHaveText(value);              // POM-05
  }
  get rows() { return this.page.locator('table tr'); }       // POM-03 fora do construtor; LOC-02
}
```

Organização:

- O que abre a partir da tela fica na page dela (detalhe do pedido em `OrdersPage`, modal de edição em `ProfilePage`).
- Ação que encadeia passos da mesma tela é aceita se o step precisar dela inteira (`goToPaymentStep(...)`), desde que receba os valores.
- Objeto transversal (ex.: `ErrorMessages` com `page.getByTestId(/_error$/)`) só se o front tiver o padrão comum (POM-02, `PROJETO.md` P-22).

---

## 7. Localizadores

LOC-01..04.

| Preferência | Exemplo | Quando |
|---|---|---|
| 1. Test id | `page.getByTestId('login_input_email')` | O front tem atributo de automação |
| 2. Role + nome | `page.getByRole('button', { name: 'Sign in' })` | Sem test id; elemento interativo |
| 3. Label / placeholder | `page.getByLabel('E-mail')` | Campos de formulário |
| 4. Texto | `page.getByText('Your cart is empty')` | Texto estático e único |

- Repetido: `header.getByRole('link', { name: 'Cart' })`, `items.filter({ has: page.getByText(name, { exact: true }) })`.
- Lista por padrão de id: `getByTestId(/^cart_item_\d+$/)` é aceito (é o próprio atributo de automação).
- Proibido: `page.locator('//div[2]')`, `.btn-primary`, `div > span:nth-child(2)`, `.nth(3)` para escolher item.
- Sem jeito estável: parar, avisar e pedir test id (LOC-04). Não "dar um jeito".

---

## 8. Steps de API

API-01..06, STP-05..06.

```ts
import { expect } from '@playwright/test';
import { api } from '../../fixtures/fixtures';
import { errors, order } from '../../data/api';

const { Given, When, Then } = api;

When('I order more than the stock', async ({ request, ctx }) => {
  ctx.response = await request.post('/orders', { data: order.aboveStock, headers: ctx.headers });
});

Then('I get the out of stock error', async ({ ctx }) => {
  expect(ctx.response.status()).toBe(errors.outOfStock.status);
  expect(await ctx.response.json()).toEqual(errors.outOfStock.body);
});

// Valor gerado (id, data): toMatchObject + formato (API-05).
Then('I get the order receipt', async ({ ctx }) => {
  expect(ctx.response.status()).toBe(201);
  const receipt = await ctx.response.json();
  expect(receipt).toMatchObject(order.receipt);
  expect(receipt.id).toMatch(order.receiptId); // regex em data/api.ts
});

// Efeito colateral: um GET no Then mostra o resultado.
Then('the product stock is lowered', async ({ request, ctx }) => {
  const response = await request.get(`/products/${order.available.productId}`, { headers: ctx.headers });
  expect((await response.json()).stock).toBe(order.stockAfter);
});
```

Login (em `steps/api/common.steps.ts`), conforme `PROJETO.md` P-30:

```ts
// Pré-condição: o expect garante que o cenário para no login se ele falhar (STP-06).
Given('I am logged in', async ({ request, ctx }) => {
  const response = await request.post('/auth/login', { data: auth.validLogin });
  expect(response.ok()).toBe(true);
  ctx.headers = { Authorization: `Bearer ${(await response.json()).token}` };
});
```

Pré-condição que repete chamadas (ex.: errar a senha duas vezes antes do `When`): laço curto no `Given`, conferindo cada resposta.

Errado:

```ts
const client = new OrdersClient(request);                         // API-01
When('I order', async ({ request }) => {
  const res = await request.post('http://localhost:3000/orders', { // API-02 host fixo
    data: { productId: 'P1', quantity: 999 },                       // API-04 valor no step
    headers: { Authorization: 'Bearer eyJhb...' },                  // API-03 token fixo
  });
  expect(res.status()).toBe(422);                                   // STP-06 expect no When; resposta fora do ctx
});
```

---

## 9. Massa (`tests/data/`)

DAT-01..05.

`data/web.ts` — como aparece na tela:

```ts
// Massa dos testes web. Origem: seed do app (README "Usuários de teste").

export const login = {
  validEmail: 'customer@shop.test',
  validPassword: 'secret123',
  wrongPassword: 'wrong000',
};

export const cart = {
  total: 'R$ 59,90',
  items: ['Coffee', 'Mug'],
};

export const errors = {
  invalidCredentials: 'E-mail ou senha inválidos',
};
```

`data/api.ts` — como a API recebe e devolve:

```ts
// Massa dos testes de API. Origem: contrato (docs/API.md) e seed. Dinheiro em centavos.

export const order = {
  available: { productId: 'P1', quantity: 1 },
  aboveStock: { productId: 'P1', quantity: 999 },
  receipt: { productId: 'P1', quantity: 1, status: 'CREATED' },
  receiptId: /^ORD\d+$/,
  stockAfter: 9,
};

export const errors = {
  outOfStock: { status: 422, body: { code: 'OUT_OF_STOCK', message: 'Produto sem estoque' } },
};
```

- Nome diz **o que** o valor é (`aboveStock`, não `invalid2`).
- Valor esperado que depende do seed: comentário dizendo de onde vem (`// estoque do P1 no seed: 10`).
- Credencial sensível: `process.env.ADMIN_PASSWORD` (do `.env`), nunca o literal (DAT-04).
- Data relativa a "hoje": calcular no `data/` a partir de `new Date()` só se o requisito exigir; nunca a data literal de hoje (DAT-05).

---

## 10. Asserts

ESP-01..05.

| Quero conferir | Web | API |
|---|---|---|
| Texto exato | `await expect(page.total).toHaveText(cart.total)` | `expect(body.name).toBe(x)` |
| Lista em ordem | `await expect(page.itemNames).toHaveText(cart.items)` | `expect(body.map(i => i.name)).toEqual(list)` |
| Só esse erro na tela | `await expect(errorMessages.all).toHaveText([errors.x])` | — |
| Erro da API | — | `status` + `toEqual(errors.x.body)` |
| Corpo com valor gerado | — | `toMatchObject` + `expect.any(String)` / regex |
| Estado | `toHaveAttribute('aria-pressed', 'true')`, `toBeDisabled()`, `toHaveAttribute('type', 'password')` | GET do recurso |
| Navegou | `await expect(page.title).toBeVisible()` ou `toHaveURL` | — |
| Ausência | `await expect(locator).toBeHidden()` / `toHaveCount(0)` | — |

---

## 11. Clean code

- Função pequena, uma responsabilidade, nome que diz a intenção (`login(email, password)`, não `doAction(a, b)`).
- Comentário só para o **porquê** não óbvio (`// o <input type="date"> só aceita aaaa-mm-dd`). Nunca o "o quê", nunca código comentado.
- Sem código morto nem duplicado: `npm run steps:unused` vazio; locator/ação/valor sem uso é apagado (EST-05).
- Explícito em vez de abstraído: test id só na page, valor só em `data/`, escritos à mão (D-03, D-07).
