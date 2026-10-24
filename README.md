# TechMoney — testes E2E (API + Web)

Testes de ponta a ponta do TechMoney num projeto só, com Playwright + BDD (Gherkin) e relatório no Allure 3:

- **API**: chamadas HTTP direto na API REST (sem navegador), validando regras de negócio, erros e contrato.
- **Web**: o site no Chromium, com Page Objects, validando os fluxos principais na tela.

## Por que a maior parte dos testes está na API

A suíte segue a **pirâmide de testes**: cada regra é testada na camada mais barata que consegue provar que ela funciona.

| | API | Web |
|---|---|---|
| O que testa | Regras de negócio, validações, erros e exceções, efeitos colaterais (saldo, extrato, limite, bloqueio do PIN) | Caminho feliz de cada tela, alguns cenários negativos, comportamento que só existe na tela |
| Cenários | 47 | 20 |
| Tempo (local) | ~8 s (~0,2 s por cenário) | ~25 s (~1,2 s por cenário) |
| Precisa de navegador | Não | Sim (Chromium) |

Na prática:

- **Regra de negócio vai para a API.** Limite diário, saldo insuficiente, valor máximo do depósito, bloqueio do PIN, CPF/e-mail inválido ou já cadastrado, filtros do extrato: quem decide é a API, então é lá que a regra é testada. Cada cenário roda em décimos de segundo, sem montar tela, e falha apontando direto para a regra quebrada.
- **A tela fica com o que só a tela faz.** Fluxo feliz de ponta a ponta (login, cadastro, transferência, depósito, extrato, perfil, ajuda), um ou outro cenário negativo para provar que o erro da API aparece para o usuário (senha errada no login, PIN errado na transferência) e o que não existe na API: mostrar/ocultar senha, "confirmar senha", erros de todos os campos de uma vez, navegação, calendário do extrato, chat da Ajuda.
- **Resultado:** a suíte é mais rápida, mais barata de rodar no CI e menos frágil (teste de UI quebra por mudança de layout, carregamento, animação; teste de API não). A cobertura das regras aumentou (de 35 para 67 cenários) e o tempo total continua em ~35 s.

Cada feature numera os seus cenários a partir do `TC001` (o `TC001` do login web é outro que o `TC001` da transferência na API). A ligação de cada caso com a matriz de testes está em [docs/RASTREABILIDADE.md](docs/RASTREABILIDADE.md).

## Antes de rodar

1. Suba a aplicação, um terminal para cada (comandos a partir de `testes/Bank_TechMoney_Tests_Web-Api`):

   ```bash
   cd ../../api && npm start      # API em http://localhost:3000
   cd ../../web && npm run dev    # Web em http://localhost:5173
   ```

   Na primeira vez, rode `npm install` em cada uma dessas pastas antes. Para rodar só os testes de API, basta a API no ar.

2. Na primeira vez, dentro de `testes/Bank_TechMoney_Tests_Web-Api`:

   ```bash
   npm ci
   npx playwright install chromium
   ```

3. Opcional: copie `.env.example` para `.env` para trocar `BASE_URL` e `API_URL`.

## Rodar os testes

| Comando | O que faz |
|---|---|
| `npm test` | Roda tudo (API e web) e abre o relatório do Allure no fim |
| `npm test -- --grep <tag>` | Só uma tag: camada (`@api`, `@web`), tipo (`@smoke`, `@regression`) ou funcionalidade (`@login`, `@transfer`...) |
| `npm test -- <camada>/<feature> --grep <TC>` | Só um cenário: a feature (`web/login`, `api/transfer`...) e o ID do caso de teste. Ex.: `npm test -- web/login --grep TC001` |
| `npm test -- --headed` | Com o navegador aparecendo (dá para juntar: `npm test -- --headed --grep @login`) |
| `npm run test:ui` | Abre o modo UI do Playwright (escolha o teste e clique no ▶) |
| `npm run test:debug` | Roda em modo debug, passo a passo |

O `--` repassa o parâmetro ao Playwright. Sem ele o npm engole o `--grep` e o Playwright trata `@login` como nome de arquivo: não acha nada ("No tests"). Para mais de uma tag: `--grep "@login|@transfer"`.

O ID se repete entre as features, então para rodar um cenário só passe sempre a feature junto: `web/login` é o arquivo `tests/features/web/login.feature` (a camada no caminho separa o `transfer` da web do `transfer` da API). Só o `--grep TC001` roda o TC001 de todas as features.

Ao terminar, o Allure abre sozinho no navegador e o terminal fica servindo o relatório: aperte **Ctrl+C** para fechar. Para rodar sem abrir o Allure (ex.: no CI), use `npm run test:ci` (aceita os mesmos parâmetros).

## Relatórios

| Comando | O que faz |
|---|---|
| `npm run report` | Abre o relatório HTML do Playwright |
| `npm run allure` | Gera e abre o Allure da última execução |

No Allure os cenários ficam separados por camada (`api` e `web`). Nos de API, a resposta de cada chamada vai anexada no passo que a fez (com o token mascarado).

## Outros comandos

| Comando | O que faz |
|---|---|
| `npm run typecheck` | Gera os testes e checa os tipos (pega step faltando ou ambíguo) |
| `npm run steps` | Lista os steps existentes |
| `npm run steps:unused` | Lista os steps sem uso |

## Estrutura

```
tests/
├── features/                # cenários em Gherkin
│   ├── api/                 # um por recurso da API
│   └── web/                 # um por tela
├── steps/                   # liga cada frase ao código (mesmo nome da feature)
│   ├── api/                 # chamam a API com o request do Playwright
│   │   └── common.steps.ts  # login (token) e erros usados por mais de uma feature
│   └── web/                 # chamam os Page Objects
│       └── common.steps.ts  # login pela tela e frases usadas por mais de uma feature
├── pages/                   # Page Objects (web): locators + ações
├── fixtures/
│   └── fixtures.ts          # pages, ctx da API, reset do banco e Given/When/Then de cada camada
├── data/
│   ├── api.ts               # corpos das requisições e respostas esperadas, um bloco por recurso
│   └── web.ts               # o que se digita e os textos esperados na tela, um bloco por tela
└── support/
    └── env.ts               # lê o .env (BASE_URL, API_URL)
```

As duas camadas seguem a mesma ideia, sem abstração a mais:

- **Feature** diz o que o teste faz, com frases fixas e sem valor (`When I transfer above my daily limit`).
- **Step** é fino: na web chama uma ação da page; na API faz **uma** chamada com o `request` do Playwright e guarda a resposta em `ctx.response`. O `Then` confere com o valor de `data/`.
- **Valor** fica só em `data/api.ts` ou `data/web.ts`.
- Na API não há classe de cliente nem schema: o step chama a rota direto, como no exemplo oficial do playwright-bdd.

### Telas e recursos automatizados

| Funcionalidade | Tag | Web (tela) | API (regras) |
|---|---|---|---|
| Login / autenticação | `@login` / `@auth` | `web/login` TC001–TC004 | `api/auth` TC001–TC008 |
| Cadastro | `@register` | `web/register` TC001–TC003 | `api/register` TC001–TC006 |
| Home | `@home` | `web/home` TC001–TC002 | — |
| Perfil + editar dados | `@profile` | `web/profile` TC001–TC003 | `api/profile` TC001–TC006 |
| Extrato + detalhe | `@statement` | `web/statement` TC001–TC003 | `api/statement` TC001–TC008 |
| Transferência | `@transfer` | `web/transfer` TC001–TC002 | `api/transfer` TC001–TC013 |
| Depósito | `@deposit` | `web/deposit` TC001 | `api/deposit` TC001–TC006 |
| Ajuda | `@help` | `web/help` TC001–TC002 | — (não tem API) |

Total: **67 cenários** (47 API + 20 web), todos `@regression`. `@smoke`: na web o TC001 de cada tela (no login também o TC002; no perfil TC002 e TC003 em vez do TC001); na API o TC001 de cada recurso, mais `api/transfer` TC009 e TC012 e `api/deposit` TC005.

- **`fixtures.ts`**: uma fixture por page, a `ctx` da API (última resposta e header do token) e `resetData` (`auto: true`), que chama `POST {API_URL}/reset` antes de cada cenário. Como o banco SQLite é único, os testes rodam com `workers: 1` (API primeiro, depois web).
- **Steps por camada**: os steps web vêm de `web` e os de API de `api` (`createBdd` com a tag `@web` / `@api`), então a mesma frase pode existir nas duas camadas sem conflito.

Tudo que a execução gera (relatórios, traces, histórico do Allure) fica em `reports/`, fora do Git.

Documentação da suíte (regras, arquitetura, convenções, guia e roteiros dos agentes): [docs/README.md](docs/README.md). Perfil deste projeto: [docs/PROJETO.md](docs/PROJETO.md). Rastreabilidade dos casos: [docs/RASTREABILIDADE.md](docs/RASTREABILIDADE.md).
