<!-- Esse é o README, que é basicamente uma parte da documentação para fazer uma introdução geral do projeto e explicar como alguém pode contribuir, assim como outros tipos de informações sobre os devs e detalhes do software. Os comentários separam o documento em partes -->

<!-- Voltar para o topo -->

<a id="readme-top"></a>

<!-- Shields do Projeto -->

<div align="center">

[![Contribuidores][contributors-shield]][contributors-url] &nbsp;&nbsp;
[![Forks][forks-shield]][forks-url] &nbsp;&nbsp;
[![Stars][stars-shield]][stars-url] &nbsp;&nbsp;
[![Issues][issues-shield]][issues-url] &nbsp;&nbsp;
[![Licença][license-shield]][license-url]

</div>

<!-- Logo e título -->
<br />
<div align="center">
  <a href="https://github.com/WilliamLunelli/Chatbot-Rocar">
    <img src="documents/images/logo.png" alt="Logo" width="200" height="120">

  </a>

  <h3 align="center">Chatbot Rocar - Auto Peças</h3>

  <p align="center">
    Chatbot de vendas via WhatsApp com IA local para a empresa Rocar.
    <br />
    <a href="#sobre-o-projeto"><strong>Explorar a documentação »</strong></a>
    <br />
    <br />
    <a href="#uso">Exemplos de uso</a>
    ·
    <a href="https://github.com/WilliamLunelli/Chatbot-Rocar/issues/new?labels=bug&template=bug_report.md">Reportar bug</a>
    ·
    <a href="https://github.com/WilliamLunelli/Chatbot-Rocar/issues/new?labels=enhancement&template=feature_request.md">Sugerir feature</a>
  </p>
</div>

<!-- Sumário -->
<details>
  <summary>Sumário</summary>
  <ol>
    <li>
      <a href="#sobre-o-projeto">Sobre o Projeto</a>
      <ul>
        <li><a href="#tecnologias-usadas">Tecnologias usadas</a></li>
      </ul>
    </li>
    <li>
      <a href="#começando">Começando</a>
      <ul>
        <li><a href="#pré-requisitos">Pré-requisitos</a></li>
        <li><a href="#instalação">Instalação</a></li>
      </ul>
    </li>
    <li><a href="#uso">Uso</a></li>
    <li><a href="#roteiro">Roteiro</a></li>
    <li><a href="#contribuição">Contribuição</a></li>
    <li><a href="#licença">Licença</a></li>
    <li><a href="#contato">Contato</a></li>
    <li><a href="#agradecimentos">Agradecimentos</a></li>
  </ol>
</details>

<!-- Conteúdo geral (já separado por títulos) -->

## Sobre o Projeto

<br/>
<p align="center">
  <img src="documents/images/product_image_not_found.webp" alt="Screenshot do Produto" width="400" height = "400">
</p>
<br/>

O Chatbot Rocar automatiza o atendimento e a venda de autopeças via WhatsApp. Utiliza modelos de linguagem executados localmente para conduzir conversas naturais em português, extrair dados estruturados (produto, modelo e ano do veículo) e criar pedidos com atualização automática de estoque.

Principais objetivos:

- Atendimento natural sem menus rígidos
- Processamento de pedidos e atualização de estoque em tempo real
- Métricas de conversão e monitoramento de conversas
- Independência de APIs externas pagas (IA local)

### Tecnologias usadas

- Backend: Node.js, Express
- Banco de Dados: MongoDB, Mongoose
- IA Local: LM Studio (modelos rodando localmente)
- Messaging: WhatsApp Web API
- HTTP Client: Axios

<p align="right">(<a href="#readme-top">voltar ao topo</a>)</p>

## Começando

Este guia explica como configurar e executar o projeto localmente.

### Pré-requisitos

- Node.js 18+
- npm 9+
- MongoDB em execução local ou via Docker

Opcional via Docker:

```bash
docker run -d -p 27017:27017 --name mongodb mongo
```

### Instalação

1. Clone o repositório

```bash
   git clone https://github.com/WilliamLunelli/Chatbot-Rocar.git
   cd Chatbot-Rocar
```

2. Instale as dependências

```bash
   npm install
```

3. Configure as variáveis de ambiente  
   Crie um arquivo `.env` na raiz com as chaves necessárias (presentes no .env.example).

4. Inicie o servidor de desenvolvimento

```bash
   npm run dev
```

5. Rodar testes

```bash
   npm test
```

<p align="right">(<a href="#readme-top">voltar ao topo</a>)</p>

## Uso

Exemplo de fluxo:

1. Cliente envia mensagem pelo WhatsApp descrevendo a peça necessária.
2. O chatbot identifica produto, modelo e ano do veículo, valida compatibilidade e cria o pedido.
3. O estoque é atualizado e o cliente recebe confirmação do status do pedido.

Endpoints úteis:

-
-
-

Mais detalhes em `docs/API.md` ou no arquivo OpenAPI `docs/openapi.yaml` (quando disponível).

<p align="right">(<a href="#readme-top">voltar ao topo</a>)</p>

## Roteiro

- [x] Estrutura inicial do repositório
- [ ] Catálogo de produtos e compatibilidade por modelo/ano
- [ ] Integração com WhatsApp Web API
- [ ] Módulo de pedidos com estados (pendente, confirmado, enviado, entregue)
- [ ] Painel web de monitoramento (futuro)

Consulte as issues abertas para ver o progresso e sugerir melhorias:
https://github.com/WilliamLunelli/Chatbot-Rocar/issues

<p align="right">(<a href="#readme-top">voltar ao topo</a>)</p>

## Contribuição

Contribuições são bem-vindas!

1. Faça um fork do projeto
2. Crie uma branch de feature (`git checkout -b feat/minha-feature`)
3. Commit das mudanças (`git commit -m 'feat: adiciona minha feature'`)
4. Push da branch (`git push origin feat/minha-feature`)
5. Abra um Pull Request

Diretrizes resumidas:

- Padrões de commit: `feat:`, `fix:`, `docs:`, `test:`, `chore:`, `refactor:`
- Atualize a documentação quando alterar comportamento
- Inclua testes quando aplicável

<p align="right">(<a href="#readme-top">voltar ao topo</a>)</p>

## Licença

Distribuído sob a licença MIT ou de uso interno.

<p align="right">(<a href="#readme-top">voltar ao topo</a>)</p>

## Contato

- Artur Braga — arturhenriquefc@gmail.com - https://www.linkedin.com/in/artur-braga-103860323
- Guilherme — guisousabarbosa06@gmail.com - https://www.linkedin.com/in/guilherme-sousa-barbosa-05b984261
- William — williamlunelli07@gmail.com - https://www.linkedin.com/in/william-lunelli-6b1448300/

<p align="right">(<a href="#readme-top">voltar ao topo</a>)</p>

## Agradecimentos

- Choose a License — https://choosealicense.com
- Shields.io — https://shields.io
- Markdown Guide — https://www.markdownguide.org
- LM Studio — https://lmstudio.ai

<p align="right">(<a href="#readme-top">voltar ao topo</a>)</p>

<!-- Referências para links e imagens -->

[contributors-shield]: https://img.shields.io/github/contributors/WilliamLunelli/Chatbot-Rocar.svg?style=for-the-badge
[contributors-url]: https://github.com/WilliamLunelli/Chatbot-Rocar/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/WilliamLunelli/Chatbot-Rocar.svg?style=for-the-badge
[forks-url]: https://github.com/WilliamLunelli/Chatbot-Rocar/network/members
[stars-shield]: https://img.shields.io/github/stars/WilliamLunelli/Chatbot-Rocar.svg?style=for-the-badge
[stars-url]: https://github.com/WilliamLunelli/Chatbot-Rocar/stargazers
[issues-shield]: https://img.shields.io/github/issues/WilliamLunelli/Chatbot-Rocar.svg?style=for-the-badge
[issues-url]: https://github.com/WilliamLunelli/Chatbot-Rocar/issues
[license-shield]: https://img.shields.io/github/license/WilliamLunelli/Chatbot-Rocar.svg?style=for-the-badge
[license-url]: https://github.com/WilliamLunelli/Chatbot-Rocar/blob/main/LICENSE
