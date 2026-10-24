# Fluxo: refatorar a suíte

Roteiro do agente que melhora código de teste existente **sem mudar o que ele testa**. Entrada: achados da revisão, um pedido do usuário ou uma área da suíte. Saída: código conforme os guardrails, com a mesma cobertura.

**Ler antes:** [PROJETO.md](../PROJETO.md) · [guardrails](../../.claude/rules/guardrails.md) · [CONVENCOES](../CONVENCOES.md) · [ARQUITETURA §5 (decisões)](../ARQUITETURA.md#5-decisões-e-por-quê).

## Invariantes (nunca quebrar)

| # | Invariante | Como conferir |
|---|---|---|
| R-01 | Mesmos cenários, na mesma feature, com os mesmos `TC<NNN>` e títulos | `grep -roE "TC[0-9]{3}-.*" tests/features \| sort` (arquivo + ID + título) antes e depois: igual |
| R-02 | Mesmas tags por cenário | `npx bddgen export` / leitura das features antes e depois |
| R-03 | Mesmo resultado: o que passava passa, o que era `@fail` continua falhando pelo mesmo motivo | `npm run test:ci` antes e depois |
| R-04 | Nenhum assert enfraquecido (`toEqual` → `toMatchObject`, `toHaveText` → `toContainText`, assert removido) sem motivo de regra | Leitura do diff |
| R-05 | Nenhuma decisão da ARQUITETURA §5 desfeita | Leitura do diff |

Mudar cenário, ID, tag ou camada **não é refatoração**: é feature nova/alteração e precisa de pedido do usuário ([nova-feature.md](nova-feature.md)).

## Limites deste agente

- PODE: editar `tests/`, `docs/`, configs; mover código entre arquivos da estrutura; apagar o que ficou sem uso; rodar os scripts.
- NÃO PODE: mudar comportamento testado (R-01..R-04); adicionar dependência (STK-02); criar abstração para "tirar duplicação" se ela violar G-01/POM-06/DAT-01 (duplicação de frase fixa e de valor em `data/` é esperada pelo padrão); commitar.
- Para e pergunta quando: a correção exige mudar uma frase usada em várias features, um ID, a camada de um cenário, ou o comportamento do teste.

## Passos

1. Rodar a linha de base: `npm run typecheck`, `npm run test:ci` (guardar resultado), `npm run steps`, lista dos `TC` (R-01).
2. Listar os problemas (achados da [revisão](revisao.md) ou rodar as verificações automáticas dela).
3. Planejar em lotes pequenos, um tipo de transformação por lote. Mostrar o plano ao usuário se tocar em mais de ~10 arquivos.
4. Para cada lote: aplicar → `npm run typecheck` → `npm run test:ci -- --grep <área>`.
5. No fim: `npm run test:ci` duas vezes, `npm run steps:unused` vazio, invariantes R-01..R-05 conferidos, limpeza (EST-05).
6. Relatório: lotes aplicados (regra → arquivos), invariantes conferidos, o que ficou de fora e por quê.

## Transformações seguras (catálogo)

| Problema | Regra | Transformação |
|---|---|---|
| Valor literal na feature (`"..."`, Outline, tabela) | FEA-02 | Uma frase fixa por caso; valores para o bloco em `data/`; um step por frase. Título e ID do cenário não mudam. Outline com N linhas → **pedir OK**: vira N cenários e precisa de N−1 IDs novos |
| Step com parâmetro | STP-02 | Idem: uma frase por valor usado nas features |
| Locator no step | POM-01 | Mover para `readonly` no construtor da page da tela; step usa a propriedade |
| Locator criado fora do construtor | POM-03 | Para o construtor; se depende de valor, método que devolve `Locator` |
| `expect` no Page Object | POM-05 | Page expõe o locator; `expect` vai para o `Then` |
| Atalho com dado (`loginAsAdmin()`) | POM-04 | Ação genérica com parâmetros; valor vem de `data/` pelo step |
| `BasePage`/herança/helper com um uso | POM-06, G-01 | Copiar o que é usado para a page; apagar a base |
| Classe de cliente na API | API-01 | Step chama `request` direto; apagar a classe |
| Resposta fora de `ctx.response` | API-01 | `ctx.response = await request...` no `When`; `Then` lê de `ctx` |
| `expect` no `When` | STP-06 | Mover para o `Then` (ou para `Given` se for pré-condição) |
| `waitForTimeout` / sleep / retry | ESP-01 | Remover e usar assert com auto-wait ou esperar o elemento certo |
| `expect(await x.textContent())` | ESP-02 | `await expect(x).toHaveText(...)` |
| XPath / CSS estrutural | LOC-02 | Test id → role → label → texto (LOC-01). Sem alternativa estável: parar e avisar (LOC-04) |
| Frase duplicada / quase igual na camada | STP-03 | Ficar com uma; atualizar as features (texto do passo muda, cenário e ID não). Sentidos diferentes: frases que dizem a diferença |
| Step usado por mais de uma feature fora do `common` | STP-04 | Mover para `common.steps.ts` da camada |
| Valor espalhado / número mágico | DAT-01 | Para o bloco em `data/`, com nome e comentário de origem |
| Hook `Before`/`After` | FIX-01 | Fixture (`auto: true` se for para todos) |
| Reset dentro de step | FIX-02 | Remover; o reset é da fixture |
| Regra testada na web já coberta na API | G-05 | **Pedir OK**: remover o cenário web (ID aposentado) e registrar na rastreabilidade |
| Regra testada só na web, com API disponível | G-05 | **Pedir OK**: cenário novo na feature de API (próximo ID dela), o web fica aposentado na feature web |
| Arquivo/pasta fora do padrão | EST-01, EST-05 | Apagar ou mover; procurar quem usa antes |

## O que NÃO é melhoria aqui

- Juntar steps parecidos num step com parâmetro (contra D-03/D-04).
- Criar `utils/`, `helpers/`, `BasePage`, builders ou geradores de massa (contra G-01/D-07).
- Trocar `toEqual` por `toMatchObject` para "deixar mais flexível" (R-04).
- Renumerar IDs ou reorganizar features só por estética (R-01).
