# ADR 001 – Uso de Inteligência Artificial Local (Ollama)

**Data:** 20/08/2025  
**Status:** Ativo

## Contexto

O chatbot precisa processar linguagem natural em português para conduzir conversas de vendas. Foram avaliadas APIs externas e soluções locais.

## Decisão

Utilizar **Ollama** para rodar modelos de linguagem localmente.

## Alternativas Consideradas

- **APIs externas (OpenAI, Google, AWS):**  
  Prós: modelos mais poderosos, manutenção zero.  
  Contras: custo recorrente, dependência externa, risco de latência.

- **Modelos locais (Ollama):**  
  Prós: controle total sobre dados, sem custos variáveis, independência de terceiros, suporte a múltiplos modelos de forma simples.  
  Contras: exige hardware robusto, manutenção da infraestrutura.

## Consequências

- Maior segurança dos dados.
- Custos fixos e controlados.
- Facilidade para trocar ou atualizar modelos com o ecossistema Ollama.
- Necessidade de provisionar hardware capaz de rodar modelos grandes.
