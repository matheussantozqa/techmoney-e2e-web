# Perfil do projeto

**Único arquivo específico do projeto.** Todo o resto (`.claude/`, `docs/ARQUITETURA.md`, `docs/CONVENCOES.md`, `docs/GUIA.md`, `docs/fluxos/`) é genérico e vale para qualquer aplicação.

Regras para agentes:

- Ler este arquivo **antes** de qualquer tarefa. Os outros documentos dizem "como o `PROJETO.md` define" sempre que algo depende do projeto.
- Item vazio ou `?` de que a tarefa depende: **perguntar ao usuário** (guardrail G-02). Nunca supor a partir de outro projeto.
- Novo projeto a partir do template: apagar a coluna "Valor" e preencher com o roteiro [fluxos/criar-suite.md](fluxos/criar-suite.md).

## 1. Aplicação

| # | Item | Valor | O que isso muda na suíte |
|---|---|---|---|
| P-01 | Nome | TechMoney (banco digital demo) | Título do Allure (`allurerc.mjs`), README |
| P-02 | Camadas testadas | API + Web | Camada sem uso: tirar o projeto do `playwright.config.ts` e as pastas dela |
| P-03 | URL da web (`BASE_URL`) | `http://localhost:5173` | Default em `tests/support/env.ts` e `.env.example` |
| P-04 | URL da API (`API_URL`) | `http://localhost:3000` | Idem |
| P-05 | Como subir a aplicação | No repo do app: `cd api && npm start` e `cd web && npm run dev` | README "Antes de rodar" e passo do CI |
| P-06 | Idioma dos textos da aplicação | Português (BR) | Textos em `tests/data/` ficam nesse idioma (IDI-03) |

## 2. Fontes da verdade

| # | Fonte | Onde |
|---|---|---|
| P-10 | Requisitos / critérios de aceite | Passados pelo usuário em cada tarefa; matriz de testes em `bank_app_techmoney/MATRIZ_DE_TESTES.md` |
| P-11 | Contrato da API | `bank_app_techmoney/docs/API.md` (rotas, modelos, ordem das validações, erros) |
| P-12 | Lista de test ids | `bank_app_techmoney/docs/TEST_IDS.md` (inclui "Diferenças na Web") |
| P-13 | Regras de negócio e massa | `bank_app_techmoney/README.md`, seção "Usuários de teste" |

## 3. Web

| # | Item | Valor | O que isso muda |
|---|---|---|---|
| P-20 | Atributo de automação | `data-testid` | `getByTestId` (LOC-01). Outro nome: `testIdAttribute` no config. **Sem atributo**: role/label/texto |
| P-21 | Padrão dos test ids | `<tela>_<tipo>_<nome>` (ex.: `login_input_cpf`) | Ajuda a achar o id na lista; não gerar id "pelo padrão" sem conferir |
| P-22 | Padrão comum de erro na tela | Todo id de erro termina em `_error` | Permite o objeto transversal `ErrorMessages` (POM-02). Sem padrão: erro como locator de cada page |
| P-23 | Login na web | Pela tela de login (step `Given I am logged in`) | Autenticação dinâmica; `storageState` só se o login for lento |

## 4. API

| # | Item | Valor | O que isso muda |
|---|---|---|---|
| P-30 | Autenticação | `POST /auth/login` devolve `token`; mandar `Authorization: Bearer <token>` | Implementação do `Given I am logged in` (API-03) e o tipo de `ctx.headers` |
| P-31 | Segredos na resposta | Campo `token` | Mascarado no `api.AfterStep` |
| P-32 | Formato de erro | `{ code, message, field? }` (+ `attemptsLeft` no `WRONG_PIN`); `code` é estável | Formato dos erros em `data/api.ts` (`{ status, body }`) |
| P-33 | Unidades e formatos | Dinheiro em centavos (`amountCents`); datas `aaaa-mm-dd` | Valores em `data/api.ts` |

## 5. Dados e isolamento

| # | Item | Valor | O que isso muda |
|---|---|---|---|
| P-40 | Estado compartilhado entre testes? | Sim: banco SQLite único | `workers: 1` (FIX-05) |
| P-41 | Como resetar / preparar dados | `POST {API_URL}/reset` (volta ao seed e derruba todos os tokens) | Fixture `resetData` (`auto: true`) em `fixtures.ts` |
| P-42 | Massa de teste | Seed do app: Ana (conta principal), Bruno (destinatário); CPF livre para cadastro no README | Blocos de `data/web.ts` e `data/api.ts` |
| P-43 | Credenciais sensíveis | Nenhuma (seed público de demo) | Se houver: `.env` + secret do CI |

## 6. Processo

| # | Item | Valor |
|---|---|---|
| P-50 | Rastreabilidade | Sim: `TC<NNN>` ↔ casos da matriz (`LOG-01`, `TRF-23`...) em [RASTREABILIDADE.md](RASTREABILIDADE.md) |
| P-51 | Próximo ID livre | Por feature: maior `TC` da feature (incluindo aposentados da [RASTREABILIDADE.md](RASTREABILIDADE.md)) + 1 |
| P-52 | Bug tracker (para `@bug-<id>`) | ? (perguntar ao usuário) |
| P-53 | CI | GitHub Actions + GitHub Pages (workflow ainda não criado) |
| P-54 | Mapa das funcionalidades | [README.md, seção Estrutura](../README.md#estrutura) |
