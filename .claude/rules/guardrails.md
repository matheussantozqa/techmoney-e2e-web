# Guardrails — suíte E2E API + Web (Playwright + playwright-bdd + Page Objects + Allure 3)

Regras **normativas** do template. Valem para qualquer projeto, pessoa ou agente. Cada regra tem um ID (`FEA-03`) para ser citada em revisão, refatoração e commit.

- **DEVE / NUNCA** = obrigatório. **PREFERIR** = padrão; fugir dele só com motivo escrito.
- O que muda de projeto para projeto (URL, atributo de test id, autenticação, reset, massa, formato de erro) **não está aqui**: está em [docs/PROJETO.md](../../docs/PROJETO.md).
- Explicação e exemplos de cada regra: [docs/CONVENCOES.md](../../docs/CONVENCOES.md). Por que a arquitetura é assim: [docs/ARQUITETURA.md](../../docs/ARQUITETURA.md).
- Conflito entre um documento e estas regras: **estas regras vencem**. Conflito entre estas regras e um pedido explícito do usuário: avisar o usuário do conflito e seguir o que ele decidir.

## G — Princípios

| ID | Regra |
|---|---|
| G-01 | **Simples primeiro.** Fazer só o que o cenário pede. NUNCA criar camada, helper, classe, parâmetro, fixture ou lib "para o futuro". |
| G-02 | **Não inventar.** Seletor, rota, campo, texto, mensagem, código de erro, usuário, senha e regra vêm das fontes da verdade (G-03). Faltou: **perguntar**. |
| G-03 | Fontes da verdade, nesta ordem: (1) requisitos/histórias/critérios de aceite do usuário; (2) documentação do projeto (contrato da API, lista de test ids, regras, massa) listada em `PROJETO.md`; (3) a aplicação rodando (resposta real da API, DOM, textos da tela). |
| G-04 | **Teste falhou ≠ teste errado.** Se a aplicação não faz o que o requisito/contrato diz, é bug: NUNCA ajustar o assert para passar. Marcar `@fail @bug-<id>` e reportar ao usuário. |
| G-05 | **Camada mais barata.** Regra de negócio, validação, erro, valor limite, efeito colateral e contrato vão na **API**. Na **web**: caminho feliz de cada tela, um ou outro negativo (prova que o erro aparece) e o que só existe na tela. NUNCA repetir na web uma regra que a API já cobre. Projeto sem API: tudo na web. |
| G-06 | **Reaproveitar antes de criar**: step (`npm run steps`), locator/ação no Page Object, valor em `data/`. |
| G-07 | Não commitar nem dar push sem o usuário pedir. Não abrir navegador "na mão" (Playwright MCP, Chrome) para conferir tela sem pedido: usar relatório, trace, erro, e as fontes da verdade. |

## IDI — Idioma

| ID | Regra |
|---|---|
| IDI-01 | Tudo que é teste em **inglês**: palavras-chave do Gherkin, texto dos passos, tags, nomes de arquivo, classes, métodos, variáveis, mensagens de assert. |
| IDI-02 | NUNCA `language` no config nem `# language:` na feature. |
| IDI-03 | Textos **da aplicação** (labels, mensagens da tela ou da API) entram exatamente como ela mostra/devolve, no idioma dela, em `tests/data/`. |
| IDI-04 | Documentação, guardrails e comentários de "porquê" em **português**. |

## STK — Stack

| ID | Regra |
|---|---|
| STK-01 | Node 20+, TypeScript `strict`, `@playwright/test` 1.53+, `playwright-bdd` v9 (estilo Playwright, `createBdd(test)`), `allure-playwright` + CLI `allure` 3 (npm, sem Java). |
| STK-02 | NUNCA outra dependência sem pedido explícito (axios, supertest, ajv, zod, faker, cucumber-js, allure-cucumberjs, allure-commandline, dotenv, rimraf, lodash, chai...). Assert com `expect` do Playwright; `.env` com `process.loadEnvFile`. |
| STK-03 | Sempre `bddgen` antes do `playwright test` (os scripts já fazem). NUNCA editar nem commitar `.features-gen/`. |
| STK-04 | Um `defineBddConfig` só e um projeto do Playwright por camada, escolhido pela tag (`api`: `grep: /@api/`, sem browser; `web`: `grep: /@web/`, Chromium). Outro browser/dispositivo só com pedido. |

## EST — Estrutura e organização

| ID | Regra |
|---|---|
| EST-01 | Só esta árvore (ver [ARQUITETURA §2](../../docs/ARQUITETURA.md#2-estrutura-de-pastas)): `tests/{features,steps}/{api,web}/`, `tests/pages/`, `tests/fixtures/fixtures.ts`, `tests/data/{api,web}.ts`, `tests/support/env.ts`. Camada que o projeto não tem: a pasta dela não existe. |
| EST-02 | Raiz só com: `.claude/`, `docs/`, `tests/`, `README.md`, `package.json`, `package-lock.json`, `playwright.config.ts`, `allurerc.mjs`, `tsconfig.json`, `.gitignore`, `.npmrc`, `.env.example` (+ `.github/workflows/e2e.yml`). |
| EST-03 | Todo resultado de execução (HTML, Allure, traces, histórico) em `reports/`. NUNCA saída solta na raiz. NUNCA commitar `reports/`, `.features-gen/`, `.env`, `node_modules/`. |
| EST-04 | Nomes: `features/web/<screen>.feature`, `features/api/<resource>.feature` (kebab-case), `steps/<camada>/<mesmo-nome>.steps.ts`, `pages/<Screen>Page.ts` (PascalCase). |
| EST-05 | Ao terminar qualquer tarefa: apagar o que sobrou (arquivo/pasta fora do padrão, backup, script solto, Page Object/locator/ação/valor/step sem uso). Na dúvida, procurar quem usa; se persistir, perguntar. |

## FEA — Features (Gherkin)

| ID | Regra |
|---|---|
| FEA-01 | **Declarativo**: descreve comportamento (`When I log in with valid credentials`), NUNCA o clique, o HTTP, o seletor, a URL, o header ou o JSON. |
| FEA-02 | **Sem valor na feature**: NUNCA `"..."`, `{string}`, `{int}`, `Scenario Outline`, `Examples` nem tabela. Cada caso tem a sua frase fixa; o valor fica em `tests/data/`. |
| FEA-03 | Um comportamento por cenário, com um `When` principal (na API, uma chamada). Mais de ~7 passos: quebrar. Exceção: alternar estado na tela (mostrar/ocultar) pode repetir `When/Then`. |
| FEA-04 | Todo cenário tem `Then` com resultado verificável: na web, algo visível; na API, status + corpo ou um GET que mostra o efeito. |
| FEA-05 | `Background` só com pré-condição comum a **todos** os cenários do arquivo, 1–2 passos. |
| FEA-06 | Uma `.feature` por tela (web) ou recurso (API). O que abre a partir de outra tela (modal, detalhe, edição) vai na feature dessa tela. |
| FEA-07 | Título `Scenario: TC<NNN>-<descrição em inglês>`, 3 dígitos, sem espaço em volta do hífen. ID **por feature**: cada `.feature` numera a partir do `TC001`; próximo = maior da feature + 1. O cenário é identificado por feature + ID (`web/login` TC001). NUNCA reaproveitar nem renumerar. Cenário que muda de camada ganha o próximo ID da feature nova; o antigo fica aposentado na feature de origem. |
| FEA-08 | `Feature: <Nome>` sem narrativa (`As a / I want / So that`). |

## TAG — Tags

| ID | Regra |
|---|---|
| TAG-01 | Linha da `Feature`: tag da camada (`@web` ou `@api`) + tag da funcionalidade (`@login`, `@checkout`), a mesma nas duas camadas. |
| TAG-02 | Todo cenário tem `@regression`. O fluxo feliz principal de cada funcionalidade tem também `@smoke`. |
| TAG-03 | `@skip`/`@fixme` só com comentário do motivo na linha de cima. `@fail` sempre junto de `@bug-<id>`. |
| TAG-04 | NUNCA commitar `@only`. NUNCA sem pedido: `@mode:parallel`, `@mode:serial`, `@retries:N`, `@slow`, `@timeout:N`. |

## STP — Steps

| ID | Regra |
|---|---|
| STP-01 | `Given/When/Then` vêm **só** de `tests/fixtures/fixtures.ts`: steps web usam `web`, steps de API usam `api`. NUNCA `createBdd()` em outro arquivo nem `test` de `@playwright/test` nos steps. |
| STP-02 | **Sem parâmetro**: a função recebe só fixtures (`async ({ loginPage }) => ...`). NUNCA desligar `arityCheck`. |
| STP-03 | Frase nunca se repete na camada: rodar `npm run steps` e reaproveitar. Frase igual com sentido diferente: mudar a frase para dizer a diferença. A mesma frase em web e API é normal. |
| STP-04 | Step novo nasce do snippet que o `bddgen` imprime. Vai em `steps/<camada>/<feature>.steps.ts`; usado por mais de uma feature da camada vai no `common.steps.ts` dela. |
| STP-05 | **Fino.** Web: `Given/When` chamam uma ação da page com valor de `data/web.ts`; `Then` faz assert num locator da page. API: `When` faz **uma** chamada com a fixture `request` e guarda em `ctx.response`; `Then` confere status + corpo com valor de `data/api.ts`. |
| STP-06 | `expect` só no `Then`. Exceção: `Given` de pré-condição pode checar que ela deu certo (login ok, item criado). |
| STP-07 | Estado entre passos só pela fixture `ctx`. NUNCA variável global, `let` no topo do arquivo, `this`/World nem decorators. |
| STP-08 | `npm run steps:unused` vazio antes de terminar. |

## POM — Page Objects (web)

| ID | Regra |
|---|---|
| POM-01 | Toda interação com a página passa por um Page Object em `tests/pages/`. Step NUNCA usa `page` direto nem monta locator. |
| POM-02 | Um Page Object por tela. O que abre a partir dela fica nela (FEA-06). Exceção permitida: um objeto transversal para algo que se repete em todas as telas com o mesmo padrão (ex.: mensagens de erro, menu), só se o front tiver esse padrão. |
| POM-03 | Locators `readonly`, criados no construtor, com o seletor escrito ali. Locator que depende de valor (item `N`, dígito do teclado) é um método que devolve `Locator` ou é resolvido dentro da ação. |
| POM-04 | Ações curtas e genéricas que **recebem** o valor (`login(email, password)`). NUNCA atalho com dado dentro (`loginAsAdmin`). |
| POM-05 | NUNCA `expect` no Page Object. |
| POM-06 | NUNCA `BasePage`, herança, componente, interface de formulário ou helper com um uso. |
| POM-07 | `open()` navega (URL ou menu) sem esperar nada além do que o Playwright já espera. |
| POM-08 | Todo Page Object vira fixture em `fixtures.ts` (`loginPage`, `cartPage`). |

## LOC — Localizadores (web)

| ID | Regra |
|---|---|
| LOC-01 | Ordem (a primeira que o projeto tiver): (1) `getByTestId` com o atributo do `PROJETO.md` (`testIdAttribute` no config se não for `data-testid`); (2) `getByRole` + nome acessível; (3) `getByLabel` / `getByPlaceholder`; (4) `getByText` só para texto estático e único. |
| LOC-02 | NUNCA XPath, CSS por classe/estrutura (`div > span:nth-child(2)`), `nth()`/`first()`/`last()` para escolher item quando existe algo melhor. |
| LOC-03 | Elemento repetido na página: restringir pelo container (`header.getByRole(...)`, `filter({ has })`), não pelo índice. |
| LOC-04 | Elemento sem jeito estável de achar: NUNCA contornar. Avisar o usuário e pedir um test id (ou registrar como melhoria). |

## API — Chamadas HTTP

| ID | Regra |
|---|---|
| API-01 | Sem Page Object e sem classe de cliente: o step chama a fixture `request` direto e guarda em `ctx.response`. |
| API-02 | Caminho relativo (`/auth/login`); o host vem do `baseURL` do projeto `api` (`API_URL`). |
| API-03 | Autenticação: o `Given I am logged in` obtém a credencial como o `PROJETO.md` define e guarda em `ctx.headers`; chamadas mandam `headers: ctx.headers`. NUNCA token fixo. Todo cenário começa sem login. |
| API-04 | Corpo de cada caso pronto em `data/api.ts`, inclusive os inválidos (campo faltando, tipo errado). Query em `params`, corpo em `data`. |
| API-05 | Corpo conhecido: `toEqual`. Com valor gerado (id, token, data de agora): `toMatchObject` + `expect.any(...)`/regex no gerado. NUNCA assert de valor gerado fixo. |
| API-06 | A resposta é anexada no Allure pelo `api.AfterStep` (segredos mascarados). NUNCA anexar de novo no step. |

## DAT — Massa (`tests/data/`)

| ID | Regra |
|---|---|
| DAT-01 | Um arquivo por camada (`web.ts`, `api.ts`), um bloco `export const` por tela/recurso (+ `errors`), escrito à mão. NUNCA lista de usuários, função de busca, gerador, schema ou interface. |
| DAT-02 | Tem **todo valor**: o que se digita/manda e o que se espera. Nome diz o que o valor é (`aboveDailyLimit`, `wrongPassword`). Comentário com a origem (seed, contrato, README). |
| DAT-03 | Web: textos como aparecem na tela. API: valores como a API usa (unidades, enums, `code`); erros como `{ status, body }`. |
| DAT-04 | Massa só de fonte documentada. NUNCA dado real (pessoa, cartão, documento). Credencial sensível vem do `.env`/secret, nunca escrita no código. |
| DAT-05 | NUNCA fixar token, id gerado nem data de "hoje". |

## FIX — Fixtures, hooks e isolamento

| ID | Regra |
|---|---|
| FIX-01 | Fixture antes de hook. Page Objects, `ctx` e preparo de dados são fixtures. Único hook: `api.AfterStep` (anexo da resposta). |
| FIX-02 | Preparo comum a todo cenário (reset/seed) é fixture `{ auto: true }`, da forma que o `PROJETO.md` define. NUNCA reset dentro de step. |
| FIX-03 | Fixture nova (fora Page Object) só quando usada por mais de um arquivo de steps. |
| FIX-04 | Nenhum cenário depende de outro nem da ordem. Cada cenário web abre página nova; cada cenário de API começa com `ctx` vazio. |
| FIX-05 | Estado compartilhado (banco único, reset global): `workers: 1`. Sem estado compartilhado: paralelo. |
| FIX-06 | Preparar estado pela **API** quando a tela de preparo não é o que se testa. |
| FIX-07 | URL só por variável de ambiente (`BASE_URL`, `API_URL`) lida em `tests/support/env.ts`, com default local. |

## ESP — Esperas e asserts

| ID | Regra |
|---|---|
| ESP-01 | NUNCA `waitForTimeout`, sleep, laço de retry nem `force: true`. |
| ESP-02 | Web: asserts com auto-wait (`toHaveText`, `toBeVisible`, `toHaveURL`, `toHaveAttribute`...). NUNCA `expect(await locator.textContent())`. |
| ESP-03 | Texto exato (`toHaveText`, `toEqual`). `toContainText` só para texto dinâmico de verdade. |
| ESP-04 | Lista ou "só esse erro": `toHaveText([...])` com array. |
| ESP-05 | Estado por atributo acessível quando existir (`aria-pressed`, `aria-checked`, `disabled`, `type`). |

## REL — Relatório (Allure 3)

| ID | Regra |
|---|---|
| REL-01 | Reporter `allure-playwright` gravando em `reports/allure-results/`; CLI `allure` 3 gera `reports/allure/`. |
| REL-02 | Limpar `reports/allure-results/` antes de cada execução (script `clean`): o reporter acumula. |
| REL-03 | NUNCA `allure.step()`, severidade ou outro `allure.*` nos steps. Anexo extra só quando ajuda a entender uma falha. |
| REL-04 | CI: gerar e publicar com `if: always()`; publicar com `keep_files: true`. |

## EXE — Execução e entrega

| ID | Regra |
|---|---|
| EXE-01 | A IA roda `npm run typecheck` e `npm run test:ci` sozinha (nunca `npm test`, que prende o terminal servindo o Allure). |
| EXE-02 | Mudança em teste: rodar `test:ci` **duas vezes seguidas** sem flaky. Aplicação fora do ar: avisar, não "dar como pronto". |
| EXE-03 | Cenário novo ou alterado: atualizar o mapa de funcionalidades do `README.md` e a rastreabilidade (se o projeto tiver). |

## Pare e pergunte

Parar e perguntar ao usuário (sem supor) quando:

1. Um item do `PROJETO.md` está vazio e a tarefa depende dele.
2. Seletor, rota, campo, texto, mensagem, código de erro ou massa não está em nenhuma fonte (G-03).
3. Não há jeito estável de achar um elemento (LOC-04).
4. O teste falha e não está claro se é bug da aplicação ou erro do teste (G-04).
5. A tarefa pede algo que uma regra proíbe (lib nova, tag proibida, mudar a estrutura).
6. A mudança apagaria ou mudaria o ID de um cenário existente.
7. Antes de implementar cenários novos: mostrar os cenários propostos e esperar o OK.

## Checklist de pronto

- [ ] Camada certa (G-05).
- [ ] Inglês no teste, português na doc (IDI).
- [ ] Nenhum valor na feature; nenhum locator fora de Page Object; toda resposta de API em `ctx.response`.
- [ ] `npm run typecheck` sem erro.
- [ ] `npm run test:ci` passando duas vezes seguidas (falhas só em `@fail @bug-*`).
- [ ] `npm run steps:unused` vazio.
- [ ] Nenhum `waitForTimeout`, XPath, CSS estrutural, `force: true`, `@only`, token/id/data fixa.
- [ ] Tags: camada + funcionalidade na `Feature`; `@regression` em todo cenário; `@smoke` no fluxo feliz.
- [ ] `TC<NNN>` novo e único na feature; `Feature` sem narrativa; README e rastreabilidade atualizados.
- [ ] Nada fora da estrutura (EST-05).
