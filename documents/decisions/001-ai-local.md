# ADR 001 – Uso de Inteligência Artificial Local (LM Studio)

**Data:** 20/08/2025  
**Status:** Ativo

## Contexto

O chatbot precisa processar linguagem natural em português para conduzir conversas de vendas. Foram avaliadas APIs externas e soluções locais.

## Decisão

Utilizar **LM Studio** para rodar modelos de linguagem localmente.

## Alternativas Consideradas

- **APIs externas (OpenAI, Google, AWS):**  
  Prós: modelos mais poderosos, manutenção zero.  
  Contras: custo recorrente, dependência externa, risco de latência.

- **Modelos locais (LM Studio):**  
  Prós: controle total sobre dados, sem custos variáveis, independência de terceiros.  
  Contras: exige hardware robusto, manutenção da infraestrutura.

## Consequências

- Maior segurança dos dados.
- Custos fixos e controlados.
- Necessidade de provisionar hardware capaz de rodar modelos grandes.
