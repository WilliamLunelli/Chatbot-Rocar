# Guia de Contribuição

Obrigado por considerar contribuir com o **Chatbot Rocar**!  
Este documento descreve as diretrizes para contribuir de forma consistente e organizada.

## Fluxo de Trabalho

1. **Fork** do repositório.
2. **Clone** seu fork para sua máquina.
3. Crie uma nova branch a partir da `develop`:
   ```bash
   git checkout develop
   git checkout -b feat/minha-feature
   ```
4. Faça suas alterações.

5. Execute os testes e lints localmente (veja abaixo).

6. Commit seguindo os padrões estabelecidos.

7. Envie sua branch para o fork:

```bash
git push origin feat/minha-feature
```

8. Abra um Pull Request (PR) para a branch develop.

## Modelo de Branches

`main` → versão estável em produção.

`develop` → branch de desenvolvimento principal.

`feat/`\* → novas funcionalidades.

`fix/`\* → correções de bugs.

`docs/`\* → alterações na documentação.

`test/`\* → criação ou manutenção de testes.

`chore/`\* → tarefas de manutenção (configs, deps, CI/CD).

Exemplo: `feat/catalogo-produtos`,` fix/login-error.`

## Commits

Usamos o padrão Conventional Commits. Prefixos comuns:

`feat:` → nova funcionalidade.

`fix:` → correção de bug.

`docs:` → mudanças de documentação.

`test:` → adição/alteração de testes.

`chore:` → ajustes de config, dependências.

`refactor:` → melhorias de código sem mudar comportamento.

Exemplos:

```bash
feat: adiciona integração inicial com WhatsApp
fix: corrige bug de conexão com MongoDB
docs: atualiza README com instruções de setup
```

## Estilo de Código

Backend: Node.js + Express + MongoDB (Mongoose).

Siga boas práticas de linting (ESLint/Prettier).

Nome de variáveis e funções em inglês.

Código limpo, com funções pequenas e reutilizáveis.

Sempre que possível, adicione comentários explicativos para trechos complexos.

## Testes e Lints

Rodar testes:

```bash
npm test
```

Rodar lints:

```bash
npm run lint
```

Corrigir automaticamente onde possível:

```bash
npm run lint:fix
```

## Pull Requests (PRs)

Crie PRs pequenos e objetivos.

Sempre vincule a issue correspondente.

Descreva claramente o que foi feito e como testar.

Aguarde ao menos 1 revisão antes do merge.

## Definição de Ready/Done

Ready: issue bem descrita, com critérios de aceitação claros.

Done: código implementado, testado, revisado, documentado e integrado na develop.

## Comunicação

Use as issues do GitHub para discutir bugs e novas features.

Evite discussões complexas fora do repositório, para manter histórico.

## Inglês ou Português?

Commits - Inglês
<br/>
Documentação - Português (terá tradução no futuro)
<br/>
Variáveis - Inglês
<br/>
Comentários - Inglês
<br/>
Branches - Inglês
