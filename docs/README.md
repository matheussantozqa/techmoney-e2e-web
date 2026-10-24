# Documentação da suíte

Template de testes E2E **API + Web** com Playwright, playwright-bdd (Gherkin), Page Objects e Allure 3. Feito para ser reaproveitado em qualquer aplicação: só o [PROJETO.md](PROJETO.md) é específico do projeto.

## Documentos

| Documento | Tipo | Conteúdo | Tamanho |
|---|---|---|---|
| [../.claude/CLAUDE.md](../.claude/CLAUDE.md) | Entrada | Resumo, ordem de leitura, comandos. Carregado sempre pelo Claude Code | Curto |
| [../.claude/rules/guardrails.md](../.claude/rules/guardrails.md) | **Normativo** | Todas as regras com ID (`FEA-02`), "pare e pergunte", checklist de pronto. Carregado sempre | Médio |
| [PROJETO.md](PROJETO.md) | **Específico** | Perfil do projeto: URLs, fontes da verdade, test id, autenticação, reset, massa | Curto |
| [ARQUITETURA.md](ARQUITETURA.md) | Referência | Camadas, estrutura, `fixtures.ts`, decisões (por quê), variações por tipo de projeto | Médio |
| [CONVENCOES.md](CONVENCOES.md) | Referência | Como escrever feature, frase, step, page, locator, massa, assert — certo × errado | Longo |
| [GUIA.md](GUIA.md) | Passo a passo | Instalação, arquivos de config completos, execução, Allure, CI, VS Code | Longo |
| [fluxos/criar-suite.md](fluxos/criar-suite.md) | Roteiro | Suíte do zero: entrevista, adaptar o template, primeiro fluxo | Médio |
| [fluxos/nova-feature.md](fluxos/nova-feature.md) | Roteiro | Automatizar uma funcionalidade | Curto |
| [fluxos/revisao.md](fluxos/revisao.md) | Roteiro | Revisar código: verificações, checklist por camada, severidade, relatório | Médio |
| [fluxos/refatoracao.md](fluxos/refatoracao.md) | Roteiro | Refatorar sem mudar o que é testado: invariantes, catálogo de transformações | Médio |
| [RASTREABILIDADE.md](RASTREABILIDADE.md) | Específico | `TC<NNN>` ↔ casos do plano de testes (só se o projeto tiver) | — |

Precedência em conflito: **pedido explícito do usuário** (avisando o conflito) > **guardrails** > PROJETO.md > ARQUITETURA/CONVENCOES/GUIA > fluxos.

## O que ler para cada tarefa

| Tarefa | Ler (nesta ordem) |
|---|---|
| Qualquer tarefa | `CLAUDE.md` → `guardrails.md` → `PROJETO.md` |
| Montar a suíte para um projeto novo | + `fluxos/criar-suite.md` → `ARQUITETURA.md` → `GUIA.md` |
| Escrever testes de uma funcionalidade | + `fluxos/nova-feature.md` → `CONVENCOES.md` |
| Revisar código de teste | + `fluxos/revisao.md` → `CONVENCOES.md` → `ARQUITETURA.md §5` |
| Refatorar | + `fluxos/refatoracao.md` → `CONVENCOES.md` → `ARQUITETURA.md §5` |
| Mexer em config, Allure ou CI | + `GUIA.md` |
| Dúvida "por que é assim?" | `ARQUITETURA.md §5` |

## Agentes previstos

Cada agente segue um roteiro e tem limites. Os roteiros já trazem "PODE / NÃO PODE / pare quando".

| Agente | Roteiro | Escreve código? | Ferramentas mínimas | Para e pergunta quando |
|---|---|---|---|---|
| **Criador** (suíte do zero) | `fluxos/criar-suite.md` | Sim | Ler, escrever, shell (`npm`, `npx`) | Item obrigatório do perfil sem resposta |
| **Implementador** (funcionalidade nova) | `fluxos/nova-feature.md` | Sim | Ler, escrever, shell | Antes de implementar (OK dos cenários); fonte faltando; falha que pode ser bug |
| **Revisor** | `fluxos/revisao.md` | **Não** | Ler, buscar, shell só leitura (`typecheck`, `steps`, `test:ci`, `git diff`) | Nunca edita; só reporta |
| **Refatorador** | `fluxos/refatoracao.md` | Sim | Ler, escrever, shell | Mudança tocaria cenário, ID, tag, camada ou frase usada em muitas features |

Ao criar os agentes/skills:

- No prompt do agente, mandar ler os documentos da coluna "O que ler" da tarefa dele, em vez de copiar regras para dentro do prompt (uma fonte só, sem divergência).
- Pedir que cite o ID da regra em cada achado, mudança ou recusa (`ESP-01`).
- Revisor sem ferramenta de escrita.
- O criador e o implementador nunca pulam o "Pare e pergunte" dos guardrails.

## Manter a documentação

- Regra nova ou alterada: só nos **guardrails** (com ID novo; IDs de regra não são reaproveitados). Os outros documentos citam o ID e trazem exemplo.
- Algo do projeto: só no **PROJETO.md**.
- Decisão de arquitetura nova: linha nova em ARQUITETURA §5 com o porquê e a alternativa rejeitada.
- Cenário novo: README (mapa) e RASTREABILIDADE (se houver).
