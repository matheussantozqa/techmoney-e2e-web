# Guia — instalação, configuração, execução e CI

Passo a passo para montar e operar a suíte a partir do template. Genérico; valores do projeto vêm do [PROJETO.md](PROJETO.md).

- Regras: [guardrails](../.claude/rules/guardrails.md). Como escrever os testes: [CONVENCOES](CONVENCOES.md). Por que é assim: [ARQUITETURA](ARQUITETURA.md).
- Os arquivos de config abaixo são os **reais** do template. Ao mudar um deles, atualizar aqui.

Índice: [1. Fontes](#1-fontes) · [2. Pré-requisitos](#2-pré-requisitos) · [3. Instalação](#3-instalação) · [4. Configuração](#4-configuração) · [5. Autenticação](#5-autenticação) · [6. Rodando](#6-rodando) · [7. Tags na execução](#7-tags-na-execução) · [8. Allure](#8-allure-report) · [9. CI](#9-ci--githubworkflowse2eyml) · [10. VS Code](#10-vs-code) · [11. Skill oficial](#11-skill-oficial-do-playwright-bdd-opcional) · [12. Problemas comuns](#12-problemas-comuns) · [13. Ordem de implementação](#13-ordem-sugerida-de-implementação)

---

## 1. Fontes

- [Documentação oficial do playwright-bdd](https://vitalets.github.io/playwright-bdd/#/) (v9): API e boas práticas. Base principal.
- [Playwright API testing](https://playwright.dev/docs/api-testing) e o [exemplo de API do playwright-bdd](https://github.com/vitalets/playwright-bdd/tree/main/examples/api-testing): fixture `request`.
- [Allure Report 3](https://allurereport.org/docs/v3/) + [allure-playwright](https://allurereport.org/docs/playwright/).
- Artigo [Playwright + BDD with TypeScript](https://medium.com/@sreekanth.parikipandla/playwright-bdd-with-typescript-a-practical-guide-to-fast-readable-e2e-tests-6bd1dca6b3d1) (Sreekanth Parikipandla, dez/2025): caminho geral. Partes desatualizadas pela v9:

| Tema | Artigo | v9 (o que usamos) |
|---|---|---|
| Import dos steps | `import { Given } from 'playwright-bdd'` | `createBdd(test)` em `fixtures.ts`, um conjunto por camada |
| Config | `defineBddConfig` solto | Devolve o `testDir` passado ao `defineConfig` |
| Dados entre passos | World | Fixture `ctx` |
| Versões | — | Node 20+, Playwright 1.53+ |

---

## 2. Pré-requisitos

- Node.js **20+**.
- A aplicação rodando (PROJETO.md P-05). Só testes de API: basta a API.
- O contrato da API e a lista de test ids, se existirem (PROJETO.md P-11, P-12).
- **Sem Java**: o Allure 3 é um pacote npm.

---

## 3. Instalação

Projeto novo (fora do template):

```bash
npm init -y
npm i -D @playwright/test playwright-bdd typescript @types/node allure-playwright allure
npx playwright install --with-deps chromium   # só se tiver web
```

A partir do template: `npm ci` e `npx playwright install chromium`.

| Pacote | Para quê |
|---|---|
| `@playwright/test` | Runner, browser, `request`, `expect` |
| `playwright-bdd` | Gherkin → testes do Playwright (`bddgen`) |
| `typescript`, `@types/node` | Tipos e `tsc --noEmit` |
| `allure-playwright` | Reporter que grava `reports/allure-results/` |
| `allure` | CLI do Allure 3 (`allure generate`, `allure open`, `allure run`) |

Nenhum outro pacote (STK-02). Conferir o ambiente: `npx bddgen env`.

---

## 4. Configuração

### `playwright.config.ts`

```ts
import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import { API_URL, BASE_URL } from './tests/support/env';

const testDir = defineBddConfig({
  featuresRoot: 'tests/features', // encurta o caminho dos testes gerados na saída
  features: 'tests/features/**/*.feature',
  steps: ['tests/steps/**/*.ts', 'tests/fixtures/fixtures.ts'],
});

export default defineConfig({
  testDir,
  // Só com estado compartilhado (PROJETO.md P-40). Sem estado compartilhado: remover as duas linhas.
  workers: 1,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  outputDir: 'reports/test-results',
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'reports/playwright' }],
    [
      'allure-playwright',
      {
        resultsDir: 'reports/allure-results',
        environmentInfo: { BASE_URL, API_URL, node: process.version },
      },
    ],
  ],
  use: {
    trace: 'retain-on-failure',
  },
  // Um projeto por camada, escolhido pela tag da feature. Camada que o projeto não tem: remover.
  projects: [
    { name: 'api', grep: /@api/, use: { baseURL: API_URL } },
    {
      name: 'web',
      grep: /@web/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: BASE_URL,
        // testIdAttribute: 'data-test', // se o atributo de automação não for data-testid (P-20)
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
      },
    },
  ],
});
```

- Um `defineBddConfig` só (D-10); os projetos se separam pela tag.
- Sem `language`: o padrão é inglês (IDI-02).
- `forbidOnly`: um `@only` esquecido quebra o CI.
- `retries: 1` só no CI, para não mascarar flaky local (o Allure marca o que passou no retry).

### `tests/support/env.ts`

```ts
import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';

// Carrega o .env aqui (e não no config) porque este arquivo é importado antes de qualquer leitura das variáveis.
if (existsSync('.env')) loadEnvFile('.env');

export const BASE_URL = process.env.BASE_URL ?? 'http://localhost:5173';
export const API_URL = process.env.API_URL ?? 'http://localhost:3000';
```

Defaults = URLs locais do PROJETO.md (P-03, P-04). `.env.example` com as mesmas chaves; `.env` nunca no Git.

### `tests/fixtures/fixtures.ts`

Forma canônica e explicação: [ARQUITETURA §4](ARQUITETURA.md#4-fixturests-o-centro-da-suíte). Pontos que dependem do projeto: `resetData` (P-41), `Ctx.headers` (P-30), campo mascarado no `AfterStep` (P-31).

### `allurerc.mjs`

```js
import { defineConfig } from 'allure';

export default defineConfig({
  name: '<Project> — E2E (API + Web)',
  output: './reports/allure',
  historyPath: './reports/allure-history.jsonl',
  plugins: {
    allure2: {
      options: { reportName: '<Project> — E2E (API + Web)', reportLanguage: 'en' },
    },
  },
});
```

- `allure2`: layout clássico (Overview com gráficos, Graphs, Timeline, Categories). O padrão do Allure 3 (`awesome`) é mais enxuto.
- `historyPath`: tendência e flaky entre execuções.

### `package.json` (scripts)

```json
{
  "scripts": {
    "clean": "node -e \"for (const d of ['reports/allure-results','reports/allure','reports/test-results']) require('fs').rmSync(d, { recursive: true, force: true })\"",
    "test": "npm run clean && bddgen && allure run --open -- playwright test",
    "test:ci": "npm run clean && bddgen && playwright test",
    "test:ui": "bddgen && playwright test --ui",
    "test:debug": "bddgen && playwright test --debug",
    "steps": "bddgen export",
    "steps:unused": "bddgen export --unused-steps",
    "typecheck": "bddgen && tsc --noEmit",
    "report": "playwright show-report reports/playwright",
    "allure": "allure generate --clean reports/allure-results && allure open reports/allure"
  }
}
```

- `clean` antes de cada execução: o `allure-playwright` acumula resultados (REL-02).
- `test`: o `allure run --open` roda os testes, gera e serve o relatório (Ctrl+C fecha). Devolve o código de saída dos testes; o que vem depois do `--` vai para o Playwright.
- `test:ci`: sem Allure. Usado pelo CI (que gera o relatório num passo próprio) e pelos agentes (EXE-01).
- `clean` com `node -e` em vez de `rimraf` (STK-02) e para funcionar no Windows.

### `.npmrc`

```
loglevel=silent
```

Tira os cabeçalhos do npm (`> pkg@1.0.0 test`) e o `npm ERR!` quando um teste falha: fica só a saída do Playwright. Efeito colateral: erro do próprio npm (script inexistente) só devolve código 1. Para ver tudo: `npm test --loglevel=notice`.

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noEmit": true,
    "types": ["node"]
  },
  "include": ["**/*.ts"],
  "exclude": ["node_modules", ".features-gen"]
}
```

### `.gitignore`

```
node_modules/
.features-gen/
reports/
.env
```

`docs/` e `.claude/` **são** commitados: são o template e as instruções dos agentes.

---

## 5. Autenticação

| Situação | Como fazer |
|---|---|
| API (padrão) | `Given I am logged in` em `steps/api/common.steps.ts` obtém a credencial como o PROJETO.md P-30 define e guarda em `ctx.headers` (API-03). Variações (cookie, API key): [ARQUITETURA §6](ARQUITETURA.md#6-variações-por-tipo-de-projeto) |
| Web, login simples (padrão) | **Dinâmica**: `Given I am logged in` em `steps/web/common.steps.ts` faz o login pela `LoginPage` com a conta de `data/web.ts` |
| Web, login lento, SSO ou 2FA | **Estática**: setup project que loga uma vez e salva `storageState`; o projeto `web` usa `dependencies: ['setup']` e `storageState` ([doc](https://vitalets.github.io/playwright-bdd/#/guides/authentication)) |
| Cenário deslogado com `storageState` ligado | Tag `@noauth` + fixture `storageState` que limpa o estado quando a tag existe |

Começar pela dinâmica. Estática só quando a dinâmica atrapalhar (tempo, 2FA).

---

## 6. Rodando

| Comando | O que faz |
|---|---|
| `npm test` | Limpa, gera, roda tudo (headless) e abre o Allure |
| `npm run test:ci` | O mesmo sem abrir o Allure (CI e agentes) |
| `npm test -- --grep <tag>` | Só uma tag: camada, tipo ou funcionalidade |
| `npm test -- web/login --grep TC001` | Só um cenário: arquivo + ID (o ID é por feature) |
| `npm test -- --headed` | Com o navegador aparecendo |
| `npm run test:ui` | UI mode: passo a passo, voltar no tempo, inspecionar |
| `npm run test:debug` | Playwright Inspector, ação por ação |
| `npm run typecheck` | Gera e checa tipos |
| `npm run steps` / `steps:unused` | Lista os steps / os sem uso |
| `npm run report` | HTML do Playwright |
| `npm run allure` | Gera e abre o Allure da última execução |

- O `--` repassa o resto ao `playwright test` do script (sem ele o npm engole o parâmetro); `clean` e `bddgen` continuam rodando antes.
- Variável de ambiente vale para o script inteiro: `BASE_URL=https://staging... npm test`.
- O padrão é headless (o CI usa); `headless: false` não vai no config.

---

## 7. Tags na execução

Uso de cada tag: [CONVENCOES §4](CONVENCOES.md#4-tags-e-ids) e TAG-01..04.

| Quero rodar | Comando |
|---|---|
| Só uma camada | `npm test -- --grep @api` |
| Só smoke | `npm test -- --grep @smoke` |
| A regressão inteira | `npm test -- --grep @regression` |
| Uma funcionalidade (as duas camadas) | `npm test -- --grep @login` |
| Um caso | `npm test -- web/login --grep TC001` (sem o arquivo, roda o TC001 de todas as features) |
| Uma tag **ou** outra | `npm test -- --grep "@smoke\|@login"` |
| Tudo **menos** uma tag | `npm test -- --grep-invert @smoke` |
| Headed numa tag | `npm test -- --headed --grep @login` |
| Expressão `and`/`not` | `npx bddgen --tags "@login and not @skip" && npx playwright test` |

- "Ou" no terminal é `|` **sem barra**: `--grep "@smoke|@login"` (a barra na tabela é só o escape do Markdown).
- `--grep` é regex: `@login` também pega `@login-extra`; exata: `--grep "@login( |$)"`.
- Tag e ID **sempre depois de `--grep`**: `npm test -- --headed @login` dá "No tests found" (o Playwright trata o solto como nome de arquivo).
- `bddgen --tags` usa a sintaxe do Cucumber e não roda o `clean`.

---

## 8. Allure Report

1. **Coleta:** `allure-playwright` grava um JSON por teste em `reports/allure-results/`.
2. **Relatório:** a CLI do Allure 3 gera o HTML em `reports/allure/`.

Sem código extra aparecem: cada passo do Gherkin como step (com as ações do Playwright dentro), tags, diff do `expect`, screenshot/vídeo/**trace** das falhas (web), `environmentInfo`, cenários agrupados por projeto (`api` / `web`) e o `TC<NNN>` no título. Na API, a resposta de cada chamada vai anexada no passo pelo `api.AfterStep`, com segredos mascarados; o request completo fica no trace.

- `allure open` serve por HTTP (abrir `index.html` por `file://` não funciona).
- Não usar `allure-cucumberjs`, `allure.step()` nem Allure 2/Java (REL-01, REL-03).

---

## 9. CI — `.github/workflows/e2e.yml`

```yaml
name: e2e
on:
  push:
    paths: ['<pasta-da-suite>/**']
  workflow_dispatch:
  schedule:
    - cron: '0 6 * * *'

permissions:
  contents: write

jobs:
  test:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: <pasta-da-suite>
    # Subir a aplicação: service containers, deploy de staging (BASE_URL/API_URL) ou passos de build/start (PROJETO.md P-05).
    services:
      app:
        image: <registry>/<app-image>:latest
        ports: ['3000:3000']
    env:
      BASE_URL: http://localhost:5173
      API_URL: http://localhost:3000
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with: { node-version: '20' }

      - run: npm ci
      - run: npx playwright install --with-deps chromium # remover se não tiver web
      - run: npm run typecheck

      - name: Tests
        run: npm run test:ci -- ${{ github.event_name == 'push' && '--grep @smoke' || '' }}

      - name: Allure history
        if: always()
        continue-on-error: true
        run: curl -sfL --create-dirs -o reports/allure-history.jsonl https://<user>.github.io/<repo>/<pasta-da-suite>/allure-history.jsonl

      - name: Generate Allure
        if: always()
        run: |
          npx allure generate reports/allure-results
          cp reports/allure-history.jsonl reports/allure/ || true

      - name: Publish to GitHub Pages
        if: always() && github.ref == 'refs/heads/main'
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_branch: gh-pages
          publish_dir: <pasta-da-suite>/reports/allure
          destination_dir: <pasta-da-suite>
          keep_files: true

      - name: Playwright report (artifact)
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: <pasta-da-suite>/reports/playwright
```

- Push: só `@smoke`. Noturno e manual: tudo.
- `if: always()`: o relatório sai principalmente quando falha (REL-04).
- Histórico: baixa o `allure-history.jsonl` publicado, o `generate` acrescenta a execução e ele volta publicado. Na primeira execução o download falha e segue.
- `keep_files: true` + `destination_dir`: não apaga outros relatórios do Pages.
- Credenciais como secrets (`env: ADMIN_PASSWORD: ${{ secrets.ADMIN_PASSWORD }}`).
- Uma vez: **Settings → Pages → Deploy from a branch → `gh-pages` / root**.
- Outro CI (GitLab, Azure): mesmos passos; só a sintaxe muda.

---

## 10. VS Code

- Extensão oficial do **Playwright**: roda/debuga os testes gerados em `.features-gen/`.
- Extensão **Cucumber (Gherkin) Full Support** (uma extensão de Cucumber ligada só), em `.vscode/settings.json` local (não versionado):

```json
{
  "cucumberautocomplete.steps": ["tests/steps/**/*.ts", "tests/fixtures/fixtures.ts"],
  "cucumberautocomplete.strictGherkinCompletion": false,
  "cucumberautocomplete.strictGherkinValidation": false,
  "cucumberautocomplete.smartSnippets": true
}
```

---

## 11. Skill oficial do playwright-bdd (opcional)

```bash
npx skills add vitalets/playwright-bdd
```

Rascunha cenários, pede aprovação, implementa reaproveitando steps e roda os testes. Os guardrails e os fluxos deste template valem por cima dela.

---

## 12. Problemas comuns

| Sintoma | Causa | Solução |
|---|---|---|
| `No tests found` | Tag sem `--grep`, ou sem o `--` do npm | `npm test -- --grep @login` |
| `bddgen` falha com "Missing step" | Frase sem step | Copiar o snippet impresso para o `.steps.ts` |
| "Multiple definitions" / ambíguo | Mesma frase duas vezes na camada | Ficar com uma (STP-03) |
| Erro de aridade | Step declara parâmetro que a frase não tem | Função só com fixtures (STP-02) |
| Step "não existe" numa feature | Step importou `web` em vez de `api` (ou a feature está sem a tag da camada) | Conferir import e TAG-01 |
| Allure com resultados antigos | Rodou `playwright test` sem `clean` | Usar os scripts |
| Fixture de reset falhando | Aplicação fora do ar ou rota mudou | Subir a aplicação; conferir P-41 |
| Passa sozinho, falha na suíte | Dependência de dados entre cenários | FIX-04/FIX-05; nunca `@retries` |
| Terminal preso no fim | `npm test` serve o Allure | Ctrl+C, ou `test:ci` |

---

## 13. Ordem sugerida de implementação

1. Preencher o [PROJETO.md](PROJETO.md) ([fluxos/criar-suite.md](fluxos/criar-suite.md)).
2. Config + `fixtures.ts` + `allurerc.mjs` + `.env.example` adaptados ao perfil.
3. Login de ponta a ponta: `api/auth.feature` (token + erros) e `web/login.feature` com a `LoginPage`.
4. Uma funcionalidade por vez: primeiro as regras na API (feliz, validações, erros, limites, efeitos), depois o feliz e um ou outro negativo na tela ([fluxos/nova-feature.md](fluxos/nova-feature.md)).
5. `@regression` em todo cenário, `@smoke` no feliz de cada funcionalidade.
6. CI + Allure no GitHub Pages.

---

## Referências

- [playwright-bdd](https://vitalets.github.io/playwright-bdd/#/): [config](https://vitalets.github.io/playwright-bdd/#/configuration/options) · [estilo Playwright](https://vitalets.github.io/playwright-bdd/#/writing-steps/playwright-style) · [tags especiais](https://vitalets.github.io/playwright-bdd/#/writing-features/special-tags) · [autenticação](https://vitalets.github.io/playwright-bdd/#/guides/authentication) · [Allure](https://vitalets.github.io/playwright-bdd/#/reporters/allure) · [CLI](https://vitalets.github.io/playwright-bdd/#/cli) · [exemplo](https://github.com/vitalets/playwright-bdd-example)
- [Allure Playwright](https://allurereport.org/docs/playwright/) · [configuração](https://allurereport.org/docs/playwright-configuration/) · [Allure 3](https://allurereport.org/docs/v3/configure/) · [GitHub Pages](https://allurereport.org/docs/guides/github-pages/)
- [Playwright — Locators](https://playwright.dev/docs/locators) · [Page Object Models](https://playwright.dev/docs/pom) · [Fixtures](https://playwright.dev/docs/test-fixtures) · [API testing](https://playwright.dev/docs/api-testing)
- [Gherkin reference](https://cucumber.io/docs/gherkin/reference/)
