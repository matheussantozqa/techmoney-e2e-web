# E2E Web (Playwright + BDD) — instruções para a IA

Template de suíte de testes **web** com Gherkin rodando no runner do Playwright via `playwright-bdd`, Page Objects e relatório no **Allure 3**. Feito para ser reaproveitado em qualquer projeto: o que é específico do projeto fica na seção [Projeto](#projeto-preencher-ao-usar-o-template).

Siga sempre:

- @.claude/rules/guardrails.md

Guia passo a passo (instalação, config completa, exemplos de código, CI): [docs/GUIA.md](docs/GUIA.md).

## Idioma

| O quê | Idioma |
|---|---|
| Features (Gherkin): `Feature`, `Scenario`, `Given/When/Then/And/But`, texto dos passos, tags | **Inglês** |
| Código: steps, Page Objects, fixtures, nomes de arquivo, variáveis, mensagens de assert | **Inglês** |
| Documentação, guardrails, comentários de "porquê" | Português |
| Conversa com o usuário | Português |

---

## Projeto (preencher ao usar o template)

Esta seção é a única parte específica de cada projeto. Ao copiar o template, preencher; enquanto estiver vazia, **perguntar ao usuário** em vez de supor.

| Item | Valor |
|---|---|
| Nome do projeto | TechMoney (banco digital demo) |
| URL da aplicação | `http://localhost:5173` (variável `BASE_URL`); API em `http://localhost:3000` (`API_URL`) |
| Como subir a aplicação | No repo do app: `cd api && npm start` e `cd web && npm run dev` |
| Atributo de test id usado no front | `data-testid` (padrão `<tela>_<tipo>_<nome>`, ex.: `login_input_cpf`) |
| Estado compartilhado entre testes? | Sim: banco SQLite único → `workers: 1` |
| Como resetar/preparar dados | `POST {API_URL}/reset` (volta ao seed e derruba todos os tokens) |
| Massa de teste (usuários, senhas) | README do app, seção "Usuários de teste" |

Docs do projeto: IDs em `bank_app_techmoney/docs/TEST_IDS.md` (inclui "Diferenças na Web"), contrato em `bank_app_techmoney/docs/API.md`, regras e massa no `README.md`.

Mapa das telas automatizadas (feature, steps, page, bloco de massa, TCs): [README.md, seção Estrutura](../README.md#estrutura). Tela nova: atualizar o mapa junto.

Rastreabilidade: cada `TC<NNN>` está ligado aos casos da matriz (`LOG-01`, `TRF-23`...) em [docs/RASTREABILIDADE.md](docs/RASTREABILIDADE.md). Cenário novo ou alterado: atualizar a tabela junto.

### Fontes da verdade

Nunca inventar seletor, texto, mensagem, usuário ou regra. Usar as fontes que o projeto tiver, nesta ordem:

1. **Requisitos / histórias / critérios de aceite** passados pelo usuário.
2. **Documentação do projeto**, se existir (lista de IDs de automação, protótipos, regras de negócio, massa de teste). Registrar aqui onde fica cada uma.
3. **A própria aplicação**: o DOM (test ids, roles, labels) e os textos que a tela mostra.

Se uma informação não estiver em nenhuma delas: **perguntar**.

---

## Stack (versões mínimas)

| Item | Versão / pacote |
|---|---|
| Node.js | 20+ |
| Linguagem | TypeScript (`strict`) |
| Runner | `@playwright/test` 1.53+ (Chromium por padrão) |
| BDD | `playwright-bdd` v9, estilo Playwright (`createBdd(test)`) |
| Padrão | 4 camadas do playwright-bdd: features → steps → pages (POM) → fixtures (Playwright + massa) |
| Relatório local | HTML do Playwright |
| Relatório oficial | Allure 3: `allure-playwright` + CLI `allure` (npm, sem Java) |
| CI | GitHub Actions + GitHub Pages |

Nenhuma outra dependência sem pedido explícito.

## Estrutura

```
tests/features/<screen>.feature  # one per screen: what the test does, fixed sentences (no values)
tests/steps/<screen>.steps.ts    # same name as the feature; common.steps.ts = what several features use
tests/pages/<Screen>Page.ts      # Page Objects: locators (readonly) + actions
tests/fixtures/fixtures.ts       # test.extend: pages as fixtures + data reset; createBdd
tests/fixtures/data.ts           # test data and expected texts/messages, by screen
tests/support/env.ts             # reads .env (BASE_URL, API_URL)
reports/                     # generated: Playwright HTML, Allure, traces (not committed)
playwright.config.ts         # defineBddConfig + baseURL
allurerc.mjs                 # Allure 3 config
docs/GUIA.md                 # guia completo
.claude/rules/guardrails.md  # regras
```

## Comandos

| Comando | Para quê |
|---|---|
| `npm test` | Limpa resultados, gera (`bddgen`), roda tudo e abre o Allure (fica servindo até Ctrl+C) |
| `npm run test:ci` | O mesmo sem abrir o Allure. **A IA usa este** (aceita os mesmos parâmetros: `npm run test:ci -- --grep @login`) |
| `npm run test:smoke` | Só `@smoke` |
| `npm test -- --grep <tag>` | Só uma tag ou um caso (`--grep @regression`, `--grep TC001`); o `--` repassa o parâmetro ao Playwright. Sem o `--grep` a tag vira nome de arquivo e dá "No tests found" |
| `npm test -- --headed` | Com o navegador aparecendo. Numa tag: `npm test -- --headed --grep @login` |
| `npm run typecheck` | `bddgen` + `tsc --noEmit` (pega step faltando/ambíguo/assinatura errada) |
| `npm run steps` / `steps:unused` | Lista os steps existentes / sem uso |
| `npm run test:ui` / `test:debug` | Depurar |
| `npm run report` | HTML do Playwright |
| `npm run allure` | Gera e abre o Allure |

Sempre `bddgen` antes do `playwright test` (os scripts já fazem). Variável de ambiente vale para o script inteiro: `BASE_URL=... npm test`.

## Código: simples e clean code

O código dos testes segue **simplicidade e clean code**, sempre:

- Fazer só o necessário para o cenário. Nada de abstração, camada, helper ou parâmetro "para o futuro".
- Nomes claros em inglês que dizem a intenção (`login(cpf, password)`, não `doAction(a, b)`).
- Funções pequenas, com uma responsabilidade só. Sem código morto, comentado ou duplicado.
- Comentário só para explicar o *porquê* de algo não óbvio, nunca o *o quê*.
- Antes de escrever algo novo, procurar se já existe (step, ação/locator no Page Object, valor em `fixtures/data.ts`) e reaproveitar.
- **Quatro camadas, o padrão do playwright-bdd, sem abstrair além disso:**
  1. **Features**: dizem **o que o teste faz**, com frases fixas e **sem valor nenhum** (`When I log in with an invalid CPF` / `Then I see the invalid CPF error`). Nada de `"..."`, `{string}`, `Scenario Outline` nem tabela.
  2. **Steps**: um arquivo por feature, finos e sem parâmetro. `Given/When` chamam uma ação da page com o valor de `data.ts` (`loginPage.login(login.invalidCpf, login.validPassword)`); `Then` confere um locator da page com o valor esperado (`expect(homePage.greeting).toHaveText(home.greeting)`).
  3. **Pages**: Page Object padrão, um por tela: locators como `readonly` no construtor (test id escrito ali) + ações curtas e genéricas (`login(cpf, password)`). Sem `expect`, sem atalho com dado dentro (`loginAsAna`).
  4. **Fixtures**: `fixtures.ts` entrega cada page ao step (`async ({ loginPage }) => ...`) e reseta o banco antes de cada cenário; `data.ts` tem a massa e os textos esperados, um bloco por tela (`login`, `transfer`, ..., `errors`).
- **Explícito em vez de abstraído:** test id só na page, valor só em `data.ts`, escritos à mão. Sem lista de usuários, função de busca, componente, interface ou helper. O que sobra é apagado.
- O que abre a partir de outra tela vai junto dela (detalhe da transação no `statement`, editar dados no `profile`).

### Steps nunca se repetem

- **Se a frase já existe, reutilizar.** Não criar outra parecida (`npm run steps` lista todas).
- Caso novo é **frase nova** (sem parâmetro): `When I log in with an empty CPF`, `When I log in with a wrong password`. O valor do caso vai no bloco da tela em `fixtures/data.ts`.
- Step novo entra no `steps/<tela>.steps.ts` da feature dele; frase usada por mais de uma feature vai para `steps/common.steps.ts`.
- `npm run steps:unused` tem de ficar vazio.

## Como a IA trabalha numa feature nova

1. **Ler** as fontes da verdade da feature (requisitos, docs do projeto, a tela).
2. **Propor os cenários** em Gherkin (inglês, declarativo) e esperar o OK do usuário antes de implementar. Cada cenário novo ganha o próximo ID `TC<NNN>` livre da suíte, tem `@regression` (e `@smoke` se for o fluxo feliz principal) e a `Feature` não leva narrativa.
3. `npm run steps` → reaproveitar os steps que já existem.
4. Escrever a `.feature` e rodar `npx bddgen`: ele falha e **imprime o snippet** dos passos que faltam.
5. Criar/atualizar o **Page Object** da tela (locators + ações) e registrá-lo em `fixtures/fixtures.ts`; os valores do caso no bloco da tela em `fixtures/data.ts` (mensagem de erro em `errors`).
6. Implementar os steps em `steps/<tela>.steps.ts` (finos, sem parâmetro): `Given/When` chamam a page com o valor do `data.ts`, `Then` confere o locator da page.
7. `npm run typecheck`, depois `npm run test:ci` **duas vezes** (sem flaky) com a aplicação rodando.
8. Conferir `npm run steps:unused` vazio e o checklist dos guardrails.
9. Se o teste falha porque a aplicação não faz o que o requisito diz: **não ajustar o teste**. Reportar ao usuário e marcar `@fail @bug-<id>`.

Rodar os testes é o trabalho: a IA roda `npm run test:ci` sozinha. Não abrir navegador "na mão" (Playwright MCP, Chrome) para conferir tela sem o usuário pedir: usar relatório, trace ou erro.

## Pontos-chave do playwright-bdd (doc oficial)

- `Given/When/Then` vêm de `createBdd(test)` em `tests/fixtures/fixtures.ts`; o `test` vem de `playwright-bdd` e é exportado (os testes gerados usam ele). O `steps` do config aponta para `tests/steps/*.ts` e esse arquivo.
- **Fixtures em vez de hooks**: Page Objects e reset de dados são fixtures (o reset com `auto: true`).
- Dados entre passos: fixture `ctx` (nasce vazia a cada cenário), só se precisar. Sem `this`/World.
- `missingSteps: 'fail-on-gen'` (padrão) e **arity check** ligado. Como os steps não têm parâmetro, a função recebe só as fixtures (`async ({ loginPage }) => ...`).
- Tags do Gherkin viram tags do Playwright (`--grep @smoke`); `bddgen --tags "<expr>"` filtra na geração.
- Tags especiais: `@skip`, `@fixme`, `@fail`, `@only` (nunca commitado: `forbidOnly` no CI).
- Step com mesmo texto em features diferentes: escopar com `{ tags: '@feature' }`.
- Autenticação: dinâmica (step "I am logged in") ou estática (setup project + `storageState`) quando todos os testes usam o mesmo usuário.
- `.env` com `process.loadEnvFile` (sem dotenv).
- Skill oficial opcional: `npx skills add vitalets/playwright-bdd` (estas regras valem por cima dela).

## Allure Report

- Reporter `allure-playwright` (nunca `allure-cucumberjs`) gravando em `reports/allure-results/`; CLI do Allure 3 gera `reports/allure/`.
- **Limpar `reports/allure-results/` antes de cada execução** (script `clean`): o reporter acumula.
- Sem código extra já aparecem: cada passo do Gherkin como step, tags, diff do `expect`, screenshot/vídeo/**trace** das falhas e o `environmentInfo`.
- Epic `Web` pelo `globalLabels`; o cenário aparece com o ID no título (`TC001-...`) e as tags.
- Não usar `allure.step()` (os passos do Gherkin já são steps) nem espalhar `allure.*` nos steps.
- Histórico em `reports/allure-history.jsonl` (`historyPath`). No CI ele é baixado do Pages, atualizado e publicado de novo.

## CI (GitHub Actions)

- Workflow `web.yml`: em push na pasta da suíte (`@smoke`), manual e noturno (tudo).
- Passos: sobe a aplicação → `npm ci` → `playwright install chromium` → `typecheck` → testes (`test:ci`) → baixa histórico → `allure generate` → publica no `gh-pages` em `/web/` (`keep_files: true`) → artefato do HTML do Playwright.
- Geração e publicação com `if: always()`. `permissions: contents: write`.
- YAML completo: [docs/GUIA.md §14](docs/GUIA.md#14-ci--githubworkflowswebyml).

## Não fazer

- Não criar camada, helper, fixture ou lib "para o futuro".
- Não escrever feature, step ou código em português.
- Não usar locator fora de Page Object, nem XPath, CSS estrutural, `waitForTimeout`, `force: true`.
- Não usar `@retries` por cenário nem `@mode:parallel` para esconder flaky.
- Não editar nem commitar `.features-gen/`, `reports/`, `.env`.
- Tudo que é gerado pela execução (relatórios, resultados, traces, histórico) vai em `reports/`; nada de saída solta na raiz.
- Não commitar nem dar push sem o usuário pedir.
