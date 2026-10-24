# Fluxo: revisar código de teste

Roteiro do agente revisor. Entrada: um diff, uma branch, um PR ou uma lista de arquivos. Saída: lista de achados, cada um ligado a uma regra dos [guardrails](../../.claude/rules/guardrails.md).

**Ler antes:** [PROJETO.md](../PROJETO.md) · [guardrails](../../.claude/rules/guardrails.md) · [CONVENCOES](../CONVENCOES.md) · [ARQUITETURA §5 (decisões)](../ARQUITETURA.md#5-decisões-e-por-quê).

## Limites deste agente

- **Só lê e reporta.** NÃO edita arquivo, NÃO commita, NÃO roda nada que altere dados fora da suíte. Correção é com o agente de refatoração ou o autor.
- PODE rodar: `npm run typecheck`, `npm run steps`, `npm run steps:unused`, `npm run test:ci` (se a aplicação estiver no ar), `git diff`/`git log`, buscas.
- Só aponta o que tem regra ou fonte. Opinião sem regra vai como **sugestão**, nunca como erro.
- NÃO pede para desfazer uma decisão da ARQUITETURA §5.

## Passos

1. Delimitar o escopo (`git diff main...HEAD --stat` ou os arquivos dados).
2. Rodar as verificações automáticas (tabela abaixo) e anotar o resultado.
3. Ler cada arquivo do escopo na ordem: feature → steps → pages → fixtures → data → config/docs.
4. Para cada arquivo, passar a checklist da camada.
5. Conferir valores e seletores contra as fontes (G-02): um seletor/rota/mensagem que não está em nenhuma fonte é achado.
6. Escrever o relatório.

## Verificações automáticas

| Verificação | Comando | Esperado | Regra |
|---|---|---|---|
| Tipos e steps | `npm run typecheck` | Sem erro | STP-02, STP-04 |
| Steps sem uso | `npm run steps:unused` | Vazio | STP-08 |
| Esperas proibidas | `grep -rnE "waitForTimeout\|force: *true\|setTimeout" tests/` | Nada | ESP-01 |
| XPath / CSS | `grep -rnE "locator\(['\"](//\|\.\|#\|[a-z]+ *>)" tests/` | Nada | LOC-02 |
| Locator fora de page | `grep -rnE "page\.(getBy\|locator)" tests/steps` | Nada | POM-01 |
| `expect` em page | `grep -rn "expect" tests/pages` | Nada | POM-05 |
| `createBdd` fora de fixtures | `grep -rln "createBdd" tests \| grep -v fixtures.ts` | Nada | STP-01 |
| Parâmetro em step | `grep -rnE "\{(string\|int\|float\|word)\}" tests/steps` | Nada | STP-02 |
| Valor na feature | `grep -rnE "\"\|Scenario Outline\|Examples:\|^\s*\|" tests/features` | Nada | FEA-02 |
| `@only` / tags proibidas | `grep -rnE "@only\|@retries\|@mode:\|@slow\|@timeout" tests/features` | Nada | TAG-04 |
| `@regression` em todo cenário | comparar `grep -c "Scenario:"` com `grep -c "@regression"` por arquivo | Igual | TAG-02 |
| ID duplicado na mesma feature | `for f in tests/features/*/*.feature; do grep -oE "TC[0-9]{3}" "$f" \| sort \| uniq -d \| sed "s\|^\|$f \|"; done` | Nada (o mesmo ID em features diferentes é normal) | FEA-07 |
| Host fixo | `grep -rnE "https?://" tests/steps tests/pages tests/data` | Nada | API-02, FIX-07 |
| Token fixo | `grep -rnE "Bearer [A-Za-z0-9]" tests/` (fora do template do `Given`) | Nada | API-03 |
| Testes estáveis | `npm run test:ci` duas vezes | Verde nas duas | EXE-02 |

## Checklist por camada

**Feature:** declarativa (FEA-01) · sem valor (FEA-02) · um `When` principal, ≤ ~7 passos (FEA-03) · `Then` verificável (FEA-04) · `Background` só comum a todos (FEA-05) · arquivo certo (FEA-06) · `TC<NNN>` novo, único na feature, sequência da feature, formato certo (FEA-07) · sem narrativa (FEA-08) · tags (TAG-01..04) · camada certa (G-05) · inglês (IDI-01).

**Steps:** importa do `fixtures.ts` com o conjunto da camada certa (STP-01) · sem parâmetro (STP-02) · frase não duplicada nem quase duplicada de outra (STP-03) · arquivo certo / `common` (STP-04) · fino: uma ação ou uma chamada (STP-05) · `expect` só no `Then` (STP-06) · estado só em `ctx` (STP-07) · API: resposta em `ctx.response`, `headers: ctx.headers`, caminho relativo (API-01..04) · assert de valor gerado com formato (API-05).

**Page Objects:** um por tela, no lugar certo (POM-02) · locators `readonly` no construtor (POM-03) · ações genéricas que recebem valor (POM-04) · sem `expect` (POM-05) · sem herança/helper (POM-06) · registrado como fixture (POM-08) · localizador na ordem e sem proibidos (LOC-01..03) · locator/ação sem uso.

**Data:** bloco por tela/recurso (DAT-01) · nome diz o que é, comentário de origem (DAT-02) · formato da camada (DAT-03) · sem dado real/segredo (DAT-04) · sem token/id/data fixa (DAT-05) · valor sem uso.

**Fixtures/config:** fixture antes de hook (FIX-01) · reset em `auto` (FIX-02) · fixture nova justificada (FIX-03) · `workers` coerente com P-40 (FIX-05) · URL por env (FIX-07) · nenhuma dependência nova (STK-02).

**Estrutura e docs:** nada fora da árvore (EST-01..03, EST-05) · README e rastreabilidade atualizados (EXE-03) · doc em português (IDI-04).

## Severidade

| Nível | Quando | Exemplo |
|---|---|---|
| **Bloqueante** | Quebra a execução, esconde bug ou viola regra DEVE/NUNCA que afeta o resultado | Assert ajustado para passar (G-04), `waitForTimeout`, `@only`, ID duplicado, typecheck falhando, valor inventado |
| **Importante** | Viola regra DEVE/NUNCA sem quebrar agora | Valor na feature, locator no step, `expect` na page, teste de regra na web, step sem uso |
| **Sugestão** | Melhoria sem regra violada | Nome mais claro, frase mais declarativa |

## Formato do relatório

```markdown
## Revisão — <escopo>

Resultado: <aprovado | aprovado com ressalvas | mudanças necessárias>
Verificações: typecheck ✅ · steps:unused ✅ · test:ci 2x ✅ (ou motivo de não ter rodado)

| # | Severidade | Regra | Arquivo:linha | Problema | Correção sugerida |
|---|---|---|---|---|---|
| 1 | Bloqueante | ESP-01 | tests/pages/CartPage.ts:31 | `waitForTimeout(500)` antes do clique | Remover; o clique já espera o elemento |
| 2 | Importante | FEA-02 | tests/features/web/cart.feature:12 | Valor `"2"` na frase | Frase `When I add two units`, valor em `data/web.ts` |

Fora do escopo (só registro): <achados em arquivos não alterados>
```

Achados ordenados do mais grave ao menos grave. Sem achado: dizer isso e listar as verificações que passaram.
