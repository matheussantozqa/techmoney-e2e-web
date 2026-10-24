# Arquitetura da suíte

Como a suíte é montada e **por quê**. Genérico: vale para qualquer aplicação. O que é do projeto está em [PROJETO.md](PROJETO.md); as regras estão em [guardrails](../.claude/rules/guardrails.md).

> Exemplos usam uma loja fictícia (login por e-mail, carrinho, pedidos). São ilustrativos: no projeto real, rotas, ids e textos vêm das fontes da verdade (G-03).

## 1. Visão geral

Um projeto só com duas camadas de teste, as duas escritas em Gherkin e rodando no runner do Playwright:

| Camada | Roda em | O que prova |
|---|---|---|
| **API** | Fixture `request` do Playwright, sem navegador | Regra de negócio, validação, erro, valor limite, efeito colateral, contrato |
| **Web** | Chromium + Page Objects | Caminho feliz de cada tela, um ou outro negativo, o que só existe na tela |

Fluxo de execução:

```
tests/features/**/*.feature ──bddgen──▶ .features-gen/ (specs do Playwright, gerados)
                                             │
tests/steps/**  ◀── frase ↔ função ──────────┤
tests/fixtures/fixtures.ts (pages, ctx, reset, createBdd)
                                             ▼
                     playwright test ── projeto api (grep @api) ──▶ request → API_URL
                                     └─ projeto web (grep @web) ──▶ Chromium → BASE_URL
                                             ▼
                     reports/ (HTML do Playwright, allure-results → allure)
```

- `playwright-bdd` não executa nada: **gera** testes do Playwright a partir das features. Por isso não se perde auto-wait, trace, UI mode, retries, paralelismo nem reporters.
- A tag da `Feature` (`@api` / `@web`) decide o projeto do Playwright e o conjunto de steps.

## 2. Estrutura de pastas

```
.claude/
  CLAUDE.md                    # entrada para agentes (carregada sempre)
  rules/guardrails.md          # regras normativas com ID
docs/
  README.md                    # índice: o que ler para cada tarefa
  PROJETO.md                   # perfil do projeto (único arquivo específico)
  ARQUITETURA.md               # este arquivo
  CONVENCOES.md                # como escrever cada camada, com exemplos
  GUIA.md                      # instalação, configuração, execução, Allure, CI
  RASTREABILIDADE.md           # TC<NNN> ↔ casos de teste (se o projeto tiver)
  fluxos/                      # roteiros de trabalho dos agentes
tests/
  features/api/<resource>.feature
  features/web/<screen>.feature
  steps/api/<resource>.steps.ts    # + common.steps.ts (login, erros compartilhados)
  steps/web/<screen>.steps.ts      # + common.steps.ts (login pela tela, frases compartilhadas)
  pages/<Screen>Page.ts            # Page Objects (só web)
  fixtures/fixtures.ts             # test.extend + createBdd por camada + AfterStep
  data/api.ts                      # corpos e respostas esperadas, um bloco por recurso
  data/web.ts                      # o que se digita e o que se vê, um bloco por tela
  support/env.ts                   # lê .env (BASE_URL, API_URL)
reports/                       # gerado, fora do Git
.features-gen/                 # gerado, fora do Git
playwright.config.ts · allurerc.mjs · tsconfig.json · package.json · .env.example · .npmrc · .gitignore · README.md
```

Nada além disso (EST-01, EST-02). Projeto só web ou só API: a pasta da outra camada não existe.

## 3. As quatro camadas

O padrão do playwright-bdd, igual para web e API. Cada camada tem uma responsabilidade só:

| # | Camada | Responsabilidade | Não pode ter |
|---|---|---|---|
| 1 | **Feature** | Dizer **o que** o teste faz, em frases fixas | Valor, seletor, URL, JSON, parâmetro |
| 2 | **Step** | Ligar a frase ao código: chamar a page (web) ou a rota (API) com o valor de `data/`, e conferir | Lógica, laço (fica na page), estado global, parâmetro |
| 3 | **Page** (só web) | Locators + ações da tela | `expect`, dado fixo, herança |
| 4 | **Fixtures + data** | Entregar pages e `ctx` aos steps, preparar dados; guardar toda a massa e o esperado | Gerador, schema, busca, abstração |

Como um valor percorre as camadas (web):

```
feature:  When I log in with a wrong password
step:     await loginPage.login(login.validEmail, login.wrongPassword)   ← valor de data/web.ts
page:     this.email.fill(email); this.password.fill(password); this.submit.click()
data:     export const login = { validEmail: '...', wrongPassword: '...' }
```

API:

```
feature:  When I order more than the stock
step:     ctx.response = await request.post('/orders', { data: order.aboveStock, headers: ctx.headers })
then:     expect(ctx.response.status()).toBe(errors.outOfStock.status)
data:     export const order = { aboveStock: { productId: 'P1', quantity: 999 } }
```

## 4. `fixtures.ts`: o centro da suíte

Único arquivo que cria `Given/When/Then`. Forma canônica:

```ts
import { APIResponse } from '@playwright/test';
import { test as base, createBdd } from 'playwright-bdd';
import { LoginPage } from '../pages/LoginPage';
import { API_URL } from '../support/env';

// Estado de um cenário de API: o When guarda a resposta e o Then confere; o login guarda o header.
type Ctx = {
  response: APIResponse;
  headers: Record<string, string>;
  attached?: APIResponse;
};

type Fixtures = {
  loginPage: LoginPage;
  ctx: Ctx;
  resetData: void;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),

  // Nasce vazio a cada cenário: todo cenário de API começa sem resposta e sem login.
  ctx: async ({}, use) => use({} as Ctx),

  // Preparo de dados como o PROJETO.md define (aqui: rota de reset).
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

// Um conjunto de steps por camada: a mesma frase pode existir na web e na API sem conflito.
export const web = createBdd(test, { tags: '@web' });
export const api = createBdd(test, { tags: '@api' });

// Anexa no Allure a resposta de cada passo de API. Segredos mascarados: o relatório é publicado.
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
```

- `test` vem de `playwright-bdd` e é **exportado**: os testes gerados usam ele.
- Fixtures são preguiçosas: cenário de API não pede `page`, então não abre navegador.
- `ctx.attached` evita anexar a mesma resposta duas vezes quando um `Then` não faz chamada nova.
- Resposta que não é JSON: o `AfterStep` precisa de ajuste (anexar `text/plain`) — só se o projeto tiver esse caso.

## 5. Decisões (e por quê)

Cada decisão abaixo é intencional. Agente de refatoração: **não desfazer** sem pedido do usuário.

| # | Decisão | Por quê | Alternativa rejeitada |
|---|---|---|---|
| D-01 | `playwright-bdd`, não Cucumber-JS | Mantém o runner do Playwright (trace, UI mode, fixtures, paralelismo) | Cucumber-JS + Playwright: perde o runner |
| D-02 | Regras na API, tela só no essencial | API é ~5x mais rápida, não quebra por layout e aponta a regra quebrada | Tudo pela tela: lento e frágil |
| D-03 | Feature sem valor (sem `{string}`/Outline) | A feature vira especificação legível; o valor muda só em `data/`; steps sem parâmetro não quebram | Steps parametrizados: frase vira código e o reuso esconde casos |
| D-04 | Steps sem parâmetro | Um caso = uma frase = um step; o `bddgen` acha frase faltando e duplicada | Expressões com parâmetro |
| D-05 | Page Object sem `expect` | O assert é do teste (`Then`); a page só sabe achar e agir | Page com verificações |
| D-06 | Sem classe de cliente na API | O step mostra a rota e o corpo; nada a manter entre o teste e o HTTP | Wrapper `OrdersClient` |
| D-07 | Massa escrita à mão em `data/` | Lê-se o caso inteiro num lugar; nada aleatório, falha reproduzível | Faker/geradores |
| D-08 | Fixtures em vez de hooks | Rodam só quando usadas, sem tag extra (recomendação da doc do playwright-bdd) | `Before/After` |
| D-09 | Estado em `ctx`, não World | Estilo Playwright, tipado, nasce vazio por cenário | `this`/World do Cucumber |
| D-10 | Um `defineBddConfig` + projetos por tag | Vários `defineBddProject` quebram o `bddgen export` na v9.2.1 | Um config BDD por camada |
| D-11 | Allure 3 (npm) + `allure-playwright` | Sem Java; passos do Gherkin viram steps sozinhos | Allure 2, `allure-cucumberjs` |
| D-12 | IDs `TC<NNN>` por feature (cada `.feature` começa em `TC001`), nunca renumerados | Feature + ID liga cenário ↔ relatório ↔ plano de testes; numerar por arquivo evita disputa de ID entre features e camadas | ID global na suíte; renumerar ao reorganizar |

## 6. Variações por tipo de projeto

O template se adapta pelo `PROJETO.md`. O que muda em cada caso:

| Situação do projeto | O que fazer |
|---|---|
| **Sem API acessível** (só web) | Remover o projeto `api` do config, `features/api`, `steps/api`, `data/api.ts`, o `api.AfterStep` e `ctx`. Regras passam a ser testadas na web (G-05). Preparo de dados pela tela ou script do projeto |
| **Só API** (sem front) | Remover o projeto `web`, `features/web`, `steps/web`, `pages/`, `data/web.ts` e as fixtures de page. Não instalar Chromium no CI |
| **Sem test id no front** | `getByRole` + nome acessível → `getByLabel` → `getByText` (LOC-01). Pedir test id para o que não tiver jeito estável (LOC-04) |
| **Atributo diferente de `data-testid`** | `use: { testIdAttribute: 'data-test' }` no projeto `web` |
| **Sem padrão comum de erro na tela** | Sem `ErrorMessages`: cada page expõe o locator do próprio erro |
| **Sem rota de reset** | Ordem: (1) script/CLI de seed do projeto chamado na fixture `auto`; (2) criar os dados de cada cenário pela API num `Given` e apagar na fixture; (3) perguntar. Nunca depender de dado deixado por outro cenário (FIX-04) |
| **Sem estado compartilhado** (dados por cenário) | `workers` padrão e `fullyParallel: true` |
| **Auth por cookie de sessão** | O `request` da fixture guarda cookies sozinho dentro do cenário: o `Given I am logged in` só faz o login (sem `ctx.headers`) |
| **Auth por API key** | `ctx.headers = { 'x-api-key': process.env.API_KEY }` no `Given`; chave no `.env`/secret |
| **Login web lento ou com 2FA/SSO** | Autenticação estática: setup project + `storageState` ([doc](https://vitalets.github.io/playwright-bdd/#/guides/authentication)). Cenário deslogado: tag `@noauth` |
| **Resposta da API não é JSON** | Ajustar o `AfterStep` e os `Then` para `text()` |
| **Ambiente remoto (staging)** | Só `BASE_URL`/`API_URL` no `.env` ou no CI. Sem reset destrutivo em ambiente compartilhado: perguntar como isolar os dados |
| **Sem matriz de testes** | Não criar `RASTREABILIDADE.md`; os `TC<NNN>` continuam (FEA-07) |

## 7. Execução e relatórios (resumo)

| Script | Faz |
|---|---|
| `clean` | Apaga `reports/allure-results`, `reports/allure`, `reports/test-results` |
| `test` | `clean` → `bddgen` → `allure run --open -- playwright test` (abre o Allure, prende o terminal) |
| `test:ci` | `clean` → `bddgen` → `playwright test` (CI e agentes) |
| `typecheck` | `bddgen` + `tsc --noEmit` (step faltando, ambíguo, assinatura errada) |
| `steps` / `steps:unused` | `bddgen export` / `--unused-steps` |

Detalhes, config completa e CI: [GUIA.md](GUIA.md).
