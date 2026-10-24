# Suíte E2E API + Web (Playwright + playwright-bdd + Allure 3) — instruções para a IA

Template de testes com duas camadas num projeto só: **API** (fixture `request` do Playwright, sem browser) e **Web** (Chromium + Page Objects). Cenários em Gherkin rodando no runner do Playwright via `playwright-bdd`; relatório no Allure 3. Genérico: o que é do projeto fica só em [docs/PROJETO.md](../docs/PROJETO.md).

## Antes de qualquer tarefa

1. Regras: [rules/guardrails.md](rules/guardrails.md) (carregado sempre; regras com ID, "pare e pergunte", checklist de pronto).
2. Perfil do projeto: [docs/PROJETO.md](../docs/PROJETO.md). Item vazio de que a tarefa depende: **perguntar**, nunca supor.
3. O roteiro da tarefa, pelo índice [docs/README.md](../docs/README.md#o-que-ler-para-cada-tarefa):

| Tarefa | Roteiro |
|---|---|
| Montar a suíte para um projeto novo | [docs/fluxos/criar-suite.md](../docs/fluxos/criar-suite.md) |
| Automatizar uma funcionalidade | [docs/fluxos/nova-feature.md](../docs/fluxos/nova-feature.md) |
| Revisar código de teste | [docs/fluxos/revisao.md](../docs/fluxos/revisao.md) |
| Refatorar | [docs/fluxos/refatoracao.md](../docs/fluxos/refatoracao.md) |

Referência: [ARQUITETURA](../docs/ARQUITETURA.md) (camadas, decisões, variações) · [CONVENCOES](../docs/CONVENCOES.md) (como escrever, certo × errado) · [GUIA](../docs/GUIA.md) (instalação, config, CI).

## Em uma tela

- **Idioma:** teste em inglês (Gherkin, código, tags, nomes); documentação e conversa em português; textos da aplicação como ela mostra.
- **Quatro camadas:** features (o que o teste faz, frases fixas, **sem valor**) → steps (finos, **sem parâmetro**) → pages (só web: locators `readonly` + ações, sem `expect`) → fixtures + data (pages, `ctx`, reset; toda a massa e o esperado).
- **Camada:** regra de negócio, validação, erro, limite e efeito colateral na **API**; na **web** só o caminho feliz de cada tela, um ou outro negativo e o que só existe na tela.
- **Não inventar** seletor, rota, texto, erro, usuário ou regra: vem das fontes do `PROJETO.md` ou da aplicação; faltou, perguntar.
- **Teste falhou porque a aplicação está errada:** não ajustar o teste; `@fail @bug-<id>` e avisar.
- **Simples:** nada de helper, classe, lib ou camada "para o futuro".

## Comandos

| Comando | Para quê |
|---|---|
| `npm run test:ci` | Limpa, gera (`bddgen`) e roda. **A IA usa este** (`npm run test:ci -- --grep @login`) |
| `npm test` | O mesmo + abre o Allure (prende o terminal; é para pessoas) |
| `npm run typecheck` | `bddgen` + `tsc --noEmit` (step faltando/ambíguo/assinatura errada) |
| `npm run steps` / `steps:unused` | Lista os steps / os sem uso (tem de ficar vazio) |
| `npm run test:ui` / `test:debug` | Modo UI / debug |
| `npm run report` / `allure` | HTML do Playwright / gera e abre o Allure |

Filtro sempre depois de `--grep` e com o `--` do npm. O ID é por feature, então um cenário é arquivo + ID: `npm run test:ci -- web/login --grep TC001`.

## Nunca

- Commitar ou dar push sem pedido.
- Abrir navegador "na mão" (Playwright MCP, Chrome) sem pedido: usar relatório, trace ou erro.
- Editar ou commitar `.features-gen/`, `reports/`, `.env`.
- Adicionar dependência, pasta ou arquivo fora do padrão.
