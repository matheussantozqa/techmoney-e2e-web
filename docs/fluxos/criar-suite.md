# Fluxo: criar a suíte do zero

Roteiro do agente que monta a suíte para uma aplicação nova a partir deste template. Saída: o template configurado para o projeto, `PROJETO.md` preenchido e o login automatizado de ponta a ponta.

**Ler antes:** [guardrails](../../.claude/rules/guardrails.md) · [ARQUITETURA](../ARQUITETURA.md) · [GUIA](../GUIA.md) · [CONVENCOES](../CONVENCOES.md).

## Limites deste agente

- PODE: perguntar, ler documentação do projeto, chamar a API para conferir contrato, criar/editar arquivos do template, rodar `npm`/`npx` do projeto.
- NÃO PODE: inventar qualquer item do perfil (G-02), adicionar dependência fora do STK-01, criar estrutura fora do EST-01, commitar (G-07), abrir navegador por conta própria (G-07).
- Para quando: um item obrigatório da entrevista ficou sem resposta.

## Passo 1 — Entrevista

Perguntar **em blocos**, no máximo 4 perguntas por vez, nesta ordem. Cada resposta vai para o item do [PROJETO.md](../PROJETO.md) indicado. Obrigatório = não segue sem.

| Bloco | Pergunta | Item | Obrigatório |
|---|---|---|---|
| A. Aplicação | Qual é a aplicação e o nome do projeto? | P-01 | Sim |
| | Vamos testar web, API ou as duas? | P-02 | Sim |
| | Qual a URL da web? E da API? (local e/ou ambiente) | P-03, P-04 | Sim |
| | Como subir a aplicação localmente? | P-05 | Sim, se local |
| B. Fontes | Onde estão os requisitos/critérios de aceite? | P-10 | Sim |
| | Tem contrato da API (OpenAPI/Swagger, doc, Postman)? | P-11 | Sim, se API |
| | O front tem atributo de automação (`data-testid`, `data-test`...)? Tem lista dos ids? | P-12, P-20, P-21 | Sim, se web |
| | Onde estão as regras de negócio e a massa de teste (usuários, senhas)? | P-13, P-42 | Sim |
| C. Acesso | Como a API autentica (token Bearer, cookie, API key, outro)? Qual rota? | P-30 | Sim, se API |
| | Que campo da resposta é segredo (para mascarar no relatório)? | P-31 | Sim, se API |
| | Qual o formato do erro da API? | P-32 | Sim, se API |
| | Login da web: tela comum, SSO, 2FA? | P-23 | Sim, se web |
| D. Dados | Os testes compartilham estado (um banco só)? | P-40 | Sim |
| | Como resetar ou preparar os dados (rota de reset, script de seed, criar pela API)? | P-41 | Sim |
| | Há credenciais sensíveis? | P-43 | Sim |
| E. Processo | Tem matriz/plano de testes para rastrear os `TC`? | P-50 | Não (padrão: sem) |
| | Qual o bug tracker? | P-52 | Não |
| | CI: GitHub Actions + Pages? | P-53 | Não (padrão: sim) |

Regras da entrevista:

- Se o usuário apontar um documento, **ler** e preencher dali; perguntar só o que faltar.
- Resposta "não sei" num obrigatório: propor como descobrir (ex.: "posso chamar `POST /auth/login` e ver a resposta?") e esperar o OK.
- No fim, mostrar o `PROJETO.md` preenchido e pedir confirmação.

## Passo 2 — Adaptar o template

Na ordem, conforme o perfil (ver [ARQUITETURA §6](../ARQUITETURA.md#6-variações-por-tipo-de-projeto)):

1. Apagar o que é do projeto anterior: features, steps, pages, `data/*.ts` (deixar os arquivos com os blocos vazios), `RASTREABILIDADE.md`, mapa do README.
2. `.env.example` e defaults de `tests/support/env.ts` com P-03/P-04.
3. `playwright.config.ts`: projetos das camadas usadas (P-02); `testIdAttribute` se P-20 ≠ `data-testid`; `workers` conforme P-40 (com o comentário do porquê).
4. `fixtures.ts`: `resetData` conforme P-41 (ou remover se não houver preparo comum); `Ctx.headers` conforme P-30; campo mascarado do `AfterStep` conforme P-31; remover `web`/`api` da camada não usada.
5. `allurerc.mjs`: nome do projeto (P-01).
6. `package.json`: `name`.
7. README: "Antes de rodar" (P-05) e o mapa vazio.
8. `npm ci` (ou `npm install` se não houver lock) e `npx playwright install chromium` (só se tiver web).

## Passo 3 — Primeiro fluxo: login

Seguir [nova-feature.md](nova-feature.md) para a funcionalidade de login (ou o primeiro fluxo que o usuário escolher se não houver login):

- API: `features/api/auth.feature` — login ok (`@smoke`), um erro, rota protegida sem credencial. Inclui `Given I am logged in` em `steps/api/common.steps.ts`.
- Web: `features/web/login.feature` — login ok (`@smoke`) e um negativo, `LoginPage`, `Given I am logged in` em `steps/web/common.steps.ts`.
- Cada `.feature` numera os seus cenários a partir do `TC001` (FEA-07).

## Passo 4 — Validar a base

1. `npm run typecheck` sem erro.
2. `npm run test:ci` duas vezes, passando.
3. `npm run steps:unused` vazio.
4. Árvore conferida contra EST-01/EST-02.

## Passo 5 — Entrega

Responder ao usuário com: o que foi configurado (por item do perfil), o que ficou pendente/assumido, resultado das duas execuções e o próximo passo sugerido (funcionalidades a automatizar, na ordem do [GUIA §13](../GUIA.md#13-ordem-sugerida-de-implementação)).
