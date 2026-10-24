# TechMoney — testes E2E Web

Testes de ponta a ponta da versão web do TechMoney, com Playwright + BDD (Gherkin), Page Objects e relatório no Allure 3.

## Antes de rodar

1. Suba a aplicação, um terminal para cada (comandos a partir de `testes/web`):

   ```bash
   cd ../../api && npm start      # API em http://localhost:3000
   cd ../../web && npm run dev    # Web em http://localhost:5173
   ```

   Na primeira vez, rode `npm install` em cada uma dessas pastas antes.

2. Na primeira vez, dentro de `testes/web`:

   ```bash
   npm ci
   npx playwright install chromium
   ```

3. Opcional: copie `.env.example` para `.env` para trocar `BASE_URL` e `API_URL`.

## Rodar os testes

| Comando | O que faz |
|---|---|
| `npm test` | Roda todos os testes e abre o relatório do Allure no fim |
| `npm run test:smoke` | Roda só os `@smoke` |
| `npm test -- --grep @login` | Roda só uma tag (`@login`, `@transfer`, `@regression`...) |
| `npm test -- --grep TC001` | Roda só um cenário pelo ID |
| `npm test -- --headed` | Roda com o navegador aparecendo |
| `npm run test:ui` | Abre o modo UI do Playwright (escolha o teste e clique no ▶) |
| `npm run test:ui -- --grep TC001` | Modo UI só com os cenários que batem com o filtro |
| `npm run test:debug` | Roda em modo debug |

O `--` repassa o parâmetro ao Playwright. Sem ele o npm engole o `--grep` e o Playwright trata `@login` como nome de arquivo: não acha nada ("No tests"). O `--grep` recebe **um** filtro: para dois, use `"@login|TC001"`.

Ao terminar, o Allure abre sozinho no navegador e o terminal fica servindo o relatório: aperte **Ctrl+C** para fechar. Para rodar sem abrir o Allure (ex.: no CI), use `npm run test:ci` (aceita os mesmos parâmetros).

## Relatórios

| Comando | O que faz |
|---|---|
| `npm run report` | Abre o relatório HTML do Playwright |
| `npm run allure:open` | Abre de novo o Allure da última execução |

## Outros comandos

| Comando | O que faz |
|---|---|
| `npm run typecheck` | Gera os testes e checa os tipos (pega step faltando ou ambíguo) |
| `npm run steps` | Lista os steps existentes |
| `npm run steps:unused` | Lista os steps sem uso |

## Estrutura

```
tests/
├── features/                # cenários em Gherkin, um por tela
│   ├── login.feature
│   ├── register.feature
│   ├── home.feature
│   ├── transfer.feature
│   ├── deposit.feature
│   ├── statement.feature    # extrato + detalhe da transação
│   ├── profile.feature      # perfil + editar dados
│   └── help.feature
├── steps/                   # liga cada frase ao código (mesmo nome da feature)
│   ├── common.steps.ts      # frases usadas por mais de uma feature
│   ├── login.steps.ts
│   ├── register.steps.ts
│   ├── home.steps.ts
│   ├── transfer.steps.ts
│   ├── deposit.steps.ts
│   ├── statement.steps.ts
│   ├── profile.steps.ts
│   └── help.steps.ts
├── pages/                   # Page Objects: locators + ações
│   ├── LoginPage.ts
│   ├── RegisterPage.ts
│   ├── HomePage.ts
│   ├── TransferPage.ts
│   ├── DepositPage.ts
│   ├── StatementPage.ts
│   ├── ProfilePage.ts
│   ├── HelpPage.ts
│   └── ErrorMessages.ts     # erros de qualquer tela
├── fixtures/
│   ├── fixtures.ts          # pages como fixtures + reset do banco + Given/When/Then
│   └── data.ts              # massa e textos esperados, um bloco por tela
└── support/
    └── env.ts               # lê o .env (BASE_URL, API_URL)
```

### Telas automatizadas

| Tela | Tag | Feature / Steps | Page | Bloco em `data.ts` | Cenários |
|---|---|---|---|---|---|
| Login | `@login` | `login` | `LoginPage` | `login` | TC001, TC003, TC004, TC005, TC007, TC008, TC009, TC012 |
| Cadastro | `@register` | `register` | `RegisterPage` | `register` | TC015, TC016, TC017, TC020, TC129, TC130 |
| Home | `@home` | `home` | `HomePage` | `home` | TC028, TC030 |
| Transferência | `@transfer` | `transfer` | `TransferPage` | `transfer` | TC038, TC041, TC048, TC049, TC064, TC065 |
| Depósito | `@deposit` | `deposit` | `DepositPage` | `deposit` | TC073, TC074, TC075 |
| Extrato + detalhe | `@statement` | `statement` | `StatementPage` | `statement` | TC082, TC083, TC084, TC096 |
| Perfil + editar dados | `@profile` | `profile` | `ProfilePage` | `profile` | TC098, TC099, TC105, TC107 |
| Ajuda | `@help` | `help` | `HelpPage` | `help` | TC118, TC119 |

Total: **35 cenários**, todos `@regression`; 13 também são `@smoke` (TC001, TC007, TC015, TC028, TC038, TC049, TC065, TC073, TC075, TC082, TC099, TC105, TC118). A ligação de cada TC com a matriz de testes está em [docs/RASTREABILIDADE.md](docs/RASTREABILIDADE.md).

- **`common.steps.ts`**: `I am on the login page`, `I am logged in`, `I log in with valid credentials`, `I see my home`, `I see the invalid CPF error`, `I see the invalid e-mail error`.
- **`ErrorMessages`**: pega a mensagem de erro de qualquer tela (todo test id de erro termina em `_error`); os textos ficam no bloco `errors` do `data.ts`.
- **`fixtures.ts`**: uma fixture por page (`loginPage`, `transferPage`...) e `resetData` (`auto: true`), que chama `POST {API_URL}/reset` antes de cada cenário. Como o banco SQLite é único, os testes rodam com `workers: 1`.

Tudo que a execução gera (relatórios, traces, histórico do Allure) fica em `reports/`, fora do Git.

Guia completo: [docs/GUIA.md](docs/GUIA.md). Rastreabilidade dos casos: [docs/RASTREABILIDADE.md](docs/RASTREABILIDADE.md).
