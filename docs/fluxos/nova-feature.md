# Fluxo: automatizar uma funcionalidade

Roteiro do agente que cria testes para uma tela/recurso numa suíte já configurada.

**Ler antes:** [PROJETO.md](../PROJETO.md) · [guardrails](../../.claude/rules/guardrails.md) · [CONVENCOES](../CONVENCOES.md).

## Limites deste agente

- PODE: ler fontes da verdade, chamar a API para conferir resposta real, criar/editar arquivos em `tests/`, atualizar README e rastreabilidade, rodar os scripts.
- NÃO PODE: implementar antes do OK dos cenários; mexer em cenário/ID existente sem pedido; ajustar assert para passar (G-04); criar estrutura, lib ou abstração nova (G-01, STK-02); commitar.

## Passos

| # | Passo | Saída / critério |
|---|---|---|
| 1 | **Ler as fontes** da funcionalidade (G-03): requisitos, contrato (rotas, campos, ordem das validações, erros), test ids, massa | Lista do que foi lido. Faltou algo: perguntar |
| 2 | **Decidir a camada** de cada caso ([CONVENCOES §1](../CONVENCOES.md#1-em-qual-camada-vai-o-teste)) | Tabela caso → camada → motivo |
| 3 | **Propor os cenários** em Gherkin (inglês, declarativo, sem valor), com `TC<NNN>` a partir do próximo livre **da feature** (feature nova começa em `TC001`), tags e a feature de destino | **Esperar o OK do usuário** |
| 4 | `npm run steps` | Frases reaproveitadas marcadas na proposta |
| 5 | Escrever a `.feature` e rodar `npx bddgen` | Ele falha e imprime os snippets que faltam |
| 6 | Web: criar/atualizar o Page Object (locators no construtor, ações genéricas) e registrar em `fixtures.ts`. API: conferir rota, corpo e erro no contrato | Seletor/rota com fonte |
| 7 | Valores no bloco da tela/recurso em `data/web.ts` / `data/api.ts`, com comentário da origem | Nenhum valor no step nem na feature |
| 8 | Implementar os steps a partir dos snippets (finos, sem parâmetro) | Arquivo `<feature>.steps.ts`; compartilhados no `common.steps.ts` |
| 9 | `npm run typecheck` | Sem erro |
| 10 | `npm run test:ci -- --grep @<funcionalidade>` e depois a suíte toda, **duas vezes** | Verde, sem flaky |
| 11 | Falhou: classificar (tabela abaixo) | Erro do teste → corrigir; bug → `@fail @bug-<id>` + reportar |
| 12 | `npm run steps:unused` vazio; limpar o que sobrou (EST-05) | |
| 13 | Atualizar o mapa do README e a rastreabilidade (EXE-03) | |
| 14 | Checklist de pronto dos guardrails | Todos os itens |

## Formato da proposta (passo 3)

````markdown
### @api @cart — tests/features/api/cart.feature (nova)

| TC | Cenário | Camada | Tags | Fonte |
|---|---|---|---|---|
| TC001 | Adding a product returns the updated cart | API | @smoke @regression | Contrato POST /cart/items |
| TC002 | Quantity zero is rejected | API | @regression | Contrato: 422 INVALID_QUANTITY |

```gherkin
@api @cart
Feature: Cart
  ...
```

Reaproveitados: `Given I am logged in` (api/common).
Novos steps: 3. Page Objects: nenhum.
Dúvidas: <o que não está nas fontes>
````

## Teste falhou: é bug ou é o teste?

| Sinal | Conclusão | Ação |
|---|---|---|
| Seletor não encontrado, timeout esperando elemento que existe no DOM com outro id | Erro do teste | Corrigir pela fonte (lista de ids / DOM do trace) |
| Status/corpo diferente do **contrato** | Bug da aplicação | `@fail @bug-<id>`, reportar com o esperado (contrato) × obtido (anexo do Allure) |
| Texto da tela diferente do **requisito** | Bug | Idem |
| Texto diferente, mas o requisito não fala do texto | Dúvida | Perguntar ao usuário |
| Passa sozinho, falha na suíte | Isolamento (FIX-04) | Corrigir a dependência de dados; nunca `@retries` |
| Aplicação fora do ar / `/reset` falhando | Ambiente | Avisar; não dar como pronto (EXE-02) |
