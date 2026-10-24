# Guardrails — suíte web (Playwright + BDD + Page Objects + Allure)

Regras para quem escreve testes nesta suíte (pessoa ou IA). Carregadas pelo `CLAUDE.md` da raiz. Valem para qualquer projeto que use este template; o que é específico do projeto fica na seção "Projeto" do `CLAUDE.md`.

Guia de implementação: [docs/GUIA.md](../../docs/GUIA.md).

## Princípios

- **Simples primeiro.** Só o que foi pedido. Nada de camada, helper ou lib "para o futuro".
- **Não inventar.** Seletores, textos, mensagens, usuários e regras vêm das fontes da verdade do projeto (requisitos, docs, a própria tela). Faltou informação: perguntar.
- **Teste falhou ≠ teste errado.** Se a aplicação não faz o que o requisito diz, é bug: reportar e marcar `@fail @bug-<id>`, nunca "ajustar" o assert para passar.
- **Testa a tela.** Contrato de API é da suíte de API; aqui a API só prepara dados, se o projeto tiver.

## Idioma

1. **Tudo que é teste em inglês:** palavras-chave do Gherkin (`Feature`, `Background`, `Scenario`, `Scenario Outline`, `Examples`, `Given/When/Then/And/But`), texto dos passos, tags, nomes de arquivo, classes, métodos, variáveis.
2. Sem `language` no config e sem `# language:` nas features (o padrão do playwright-bdd é inglês).
3. Textos **da aplicação** (labels, mensagens) entram como estão na tela, no idioma dela: `Then I see the error "E-mail inválido"`.
4. Documentação, guardrails e comentários de "porquê" em português.

## Stack

- Playwright Test + `playwright-bdd` **v9** + TypeScript, Node 20+, Chromium por padrão.
- Relatórios: HTML do Playwright (local) e **Allure 3** (`allure-playwright` + CLI `allure`).
- **Sem outras libs** sem pedido (nada de axios, faker, cucumber-js, allure-cucumberjs, dotenv, rimraf, lodash, chai). Asserts com o `expect` do Playwright; `.env` com `process.loadEnvFile`.
- Testes rodam sempre com **`bddgen` antes** do `playwright test` (os scripts já fazem). Nunca editar nem commitar `.features-gen/`: é gerado.

## Features (Gherkin)

1. **Declarativo, não imperativo:** descreve o comportamento (`When I log in with valid credentials`), não o clique (`When I click the email field`). Nada de seletor ou URL na feature.
2. **Um comportamento por cenário**, com um `When` principal. Mais de ~7 passos: quebrar.
3. Todo cenário tem `Then` com algo **visível na tela** (texto, valor, estado, página aberta).
4. `Background` só para pré-condição comum a **todos** os cenários do arquivo, e curto (1–2 passos).
5. **A feature diz o que o teste faz, sem valor:** nada de `"..."`, `{string}`, `Scenario Outline` nem tabela. Cada caso tem a sua frase (`When I log in with an invalid CPF`, `Then I see the invalid CPF error`); o valor fica no bloco da tela em `tests/fixtures/data.ts`.
6. Uma `.feature` por tela em `tests/features/`, nome em kebab-case inglês (`login.feature`). O que abre a partir de outra tela entra na feature dela (detalhe da transação em `statement.feature`, editar dados em `profile.feature`).
7. **Tags:** a `Feature` tem `@web` e a tag da funcionalidade (`@login`, `@checkout`...). **Todo cenário tem `@regression`**; o fluxo feliz principal tem também `@smoke` (`@smoke @regression`).
8. **Título do cenário com ID de caso de teste:** `TC<NNN>-<descrição em inglês>`, sem espaço em volta do hífen. Ex.: `Scenario: TC001-Successful login with valid credentials`. ID com 3 dígitos, **único na suíte**, em ordem de criação (o próximo é o maior existente + 1). Nunca reaproveitar nem renumerar: o ID liga o cenário ao relatório e ao plano de testes.
9. **`Feature` sem narrativa:** só `Feature: <nome>`, sem `As a / I want / So that`.
10. Tags especiais do playwright-bdd:
   - `@skip`/`@fixme` só com comentário do motivo na linha de cima.
   - `@fail` + `@bug-<id>` para bug conhecido (o teste avisa quando o bug for corrigido).
   - `@only` **nunca** commitado (o CI quebra com `forbidOnly`).
   - Proibido sem pedido: `@mode:parallel`, `@retries:N`, `@slow`, `@timeout:N`.

## Quatro camadas (padrão do playwright-bdd)

| Camada | Onde | O que tem |
|---|---|---|
| Features | `tests/features/<tela>.feature` | O que o teste faz, em frases fixas |
| Steps | `tests/steps/<tela>.steps.ts` (+ `common.steps.ts`) | Liga cada frase à page, com o valor de `data.ts` |
| Pages | `tests/pages/<Tela>Page.ts` | Page Object: locators + ações |
| Fixtures | `tests/fixtures/fixtures.ts` + `data.ts` | Pages entregues aos steps, reset do banco, massa e textos esperados |

### Page Objects (obrigatório)

1. **Toda interação com a página passa por um Page Object** em `tests/pages/`. Step não usa `page` direto nem monta locator.
2. **Um Page Object por tela** (`LoginPage`, `TransferPage`). O que abre a partir de outra tela fica na page dela (detalhe da transação em `StatementPage`, editar dados em `ProfilePage`). `ErrorMessages` pega o erro de qualquer tela (todo ID de erro termina em `_error`).
3. Locators como propriedades `readonly` criadas no construtor (o test id fica escrito ali); ações como métodos curtos e genéricos que recebem o valor (`login(cpf, password)`). Sem atalho com dado dentro (`loginAsAna`).
4. **Sem `expect` no Page Object.** Ele expõe locators e ações; o assert fica no `Then`.
5. Navegação: `open()` (pelo menu ou URL), sem esperar nada além do que o Playwright já espera.
6. Sem `BasePage`, componente, interface de formulário ou helper com um uso só.
7. Todo Page Object vira **fixture** em `tests/fixtures/fixtures.ts` (`loginPage`, `transferPage`).

### Massa (`tests/fixtures/data.ts`)

1. Um arquivo só, um bloco por tela (`export const login = {...}`, `transfer`, ..., `errors`), escrito à mão.
2. Tem **todo valor**: o que se digita (`invalidCpf`, `wrongPin`) e o que se espera ver (`greeting`, `receiptAmount`, listas, mensagens de erro). Nome diz o que o valor é. Comentário da origem (seed, README).

## Localizadores

Ordem de preferência (a primeira que o projeto tiver):

1. **Test id** (`getByTestId`), se o front tiver um atributo de automação. Atributo diferente de `data-testid`: configurar `testIdAttribute` no `playwright.config.ts`.
2. **Role + nome acessível** (`getByRole('button', { name: 'Sign in' })`).
3. `getByLabel` / `getByPlaceholder` para campos; `getByText` só para texto estático e único.

Regras:

- Proibido: XPath, CSS por classe/estrutura (`div > span:nth-child(2)`), `nth()` para escolher item quando existe algo melhor.
- Texto repetido na página (botão em dois lugares): restringir pelo container (`header.getByRole(...)`), não pelo índice.
- Elemento que o teste precisa e não tem jeito estável de achar: **não contornar**. Pedir um test id ao time (ou registrar como melhoria) e avisar o usuário.

## Steps

1. `Given/When/Then` vêm **sempre** de `tests/fixtures/fixtures.ts` (`createBdd(test)`). Nunca chamar `createBdd()` em outro arquivo nem importar `test` de `@playwright/test` nos steps.
2. **Antes de criar um step, rodar `npm run steps`** e reaproveitar a frase se ela existir. **Sem parâmetro** (`{string}`, `{int}`, `DataTable`): caso novo é frase nova.
3. Step novo nasce do **snippet que o `bddgen` imprime** quando falta um passo.
4. Step é **fino**: `Given/When` chamam uma ação da page com o valor de `data.ts` (`loginPage.login(login.invalidCpf, login.validPassword)`, com `import { login } from '../fixtures/data'`); `Then` faz o assert num locator da page (`expect(homePage.greeting).toHaveText(home.greeting)`). Erro: `expect(errorMessages.all).toHaveText([errors.x])` (a lista já confere que só existe esse erro). Laços ficam no Page Object.
5. `expect` só no `Then`. `Given`/`When` não validam.
6. Estado entre passos só pela fixture **`ctx`**. Nada de variável global, `let` no topo do arquivo nem `this` (World).
7. Steps no estilo **Playwright** (arrow function com fixtures). Sem estilo Cucumber (`this`) e sem decorators.
8. A função do step recebe só as fixtures (`async ({ loginPage }) => ...`). Não desligar `arityCheck`.
9. Duas frases iguais com sentidos diferentes: mudar a frase para dizer a diferença (`I see the deposit receipt` x `I see the transfer receipt`).
10. `npm run steps:unused` vazio antes de terminar: step sem uso é removido.
11. Um arquivo de steps por feature (`login.steps.ts`); frase usada por mais de uma feature em `common.steps.ts`.

## Fixtures e hooks

1. **Fixture antes de hook** (recomendação da doc): Page Objects e preparo de dados são fixtures em `tests/fixtures/fixtures.ts`. `Before/After` só se uma fixture não resolver.
2. Preparo comum a todo cenário (ex.: reset de dados) é fixture com `{ auto: true }`. Não fazer reset dentro de step.
3. Fixture nova (fora Page Object) só quando usada por mais de um arquivo de steps.

## Esperas e asserts

1. **Proibido `waitForTimeout`/`sleep`.** Usar asserts com auto-wait: `toHaveText`, `toBeVisible`, `toBeEnabled`, `toHaveURL`, `toHaveAttribute`...
2. Nada de `expect(await locator.textContent()).toBe(...)`: usar `await expect(locator).toHaveText(...)`.
3. Textos comparados **exatos** (`toHaveText`); `toContainText` só se o texto for dinâmico de verdade (data/hora).
4. Sem `force: true` em clique. Se precisa, o teste ou a aplicação tem problema.
5. Estado por atributo acessível quando existir (`aria-pressed`, `aria-current`, `aria-checked`, `disabled`).

## Dados e isolamento

1. Nenhum cenário depende de outro nem da ordem. Cada cenário abre numa página nova.
2. Se a aplicação tiver estado compartilhado (banco único, reset global), **`workers: 1`** e reset numa fixture `auto`. Senão, paralelo.
3. Massa vem da fonte documentada do projeto (seed, planilha, README) e fica em `tests/fixtures/data.ts`. Nada de dado real.
4. Preparar estado pela **API** quando a tela de preparo não é o que está sendo testado (se o projeto tiver API).
5. URLs só por variável de ambiente (`BASE_URL`, `API_URL`) com default local. Nada de host espalhado.
6. Credenciais fora do código: `.env` (nunca no Git, só o `.env.example`) ou secrets do CI.

## Allure

1. Reporter **`allure-playwright`** (nunca `allure-cucumberjs`) e CLI do **Allure 3** (`allure`, npm). Nada de Allure 2/Java.
2. **Limpar `reports/allure-results/` antes de cada execução** (script `clean`): o reporter acumula resultados.
3. Epic `Web` pelo `globalLabels`. Sem severidade nem outros `allure.*` nos steps.
4. Não usar `allure.step()`: os passos do Gherkin já são os steps do relatório.
5. Anexo extra só quando ajuda a entender uma falha. Screenshot, vídeo e trace já vão sozinhos nas falhas.
6. No CI, gerar e publicar o relatório com `if: always()`; publicar com `keep_files: true` na pasta da suíte.

## Organização e nomes

- Arquivos: `features/login.feature`, `steps/login.steps.ts`, `pages/LoginPage.ts`; `fixtures/fixtures.ts` e `fixtures/data.ts` únicos.
- `tests/support/` só com `env.ts`. Arquivo, tipo, helper ou script que sobra é apagado.
- Comentário só para explicar o *porquê*. Sem código comentado, sem step morto.
- Usando a skill oficial do playwright-bdd (`npx skills add vitalets/playwright-bdd`): estas regras valem por cima dela.

## Checklist antes de dar como pronto

- [ ] Feature, steps e código em inglês; nenhum locator fora de Page Object; nenhum valor na feature.
- [ ] `npm run typecheck` sem erro (inclui `bddgen`: nenhum step faltando, ambíguo ou com assinatura errada).
- [ ] `npm test` passando localmente (falhas só em `@fail @bug-*`).
- [ ] Rodou **duas vezes seguidas** sem flaky.
- [ ] `npm run steps:unused` vazio.
- [ ] Nenhum `waitForTimeout`, XPath, CSS estrutural, `force: true` ou `@only`.
- [ ] `@web` e tag da funcionalidade em toda feature; `@regression` em todo cenário (+ `@smoke` no fluxo feliz).
- [ ] Título `TC<NNN>-...` com ID novo e único em todo cenário; `Feature` sem narrativa.
- [ ] `npm run allure` abre o relatório com os cenários novos (com o ID `TC<NNN>` no título).
