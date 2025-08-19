const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const mongoose = require("mongoose");
const axios = require("axios");
const express = require("express");
require("dotenv").config();

// ========================================
// 1. MODELOS DO MONGOOSE (SCHEMAS)
// ========================================

const produtoSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true },
    categoria: {
      type: String,
      required: true,
      enum: ["interface", "som", "alarme", "acessorio"],
    },
    modelo_carro: { type: String, required: true },
    ano_inicio: { type: Number, required: true },
    ano_fim: { type: Number, required: true },
    preco: { type: Number, required: true },
    estoque: { type: Number, required: true },
    descricao: String,
    ativo: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

const conversaSchema = new mongoose.Schema(
  {
    usuario_id: { type: String, required: true },
    mensagem: { type: String, required: true },
    resposta: { type: String, required: true },
    dados_extraidos: {
      categoria: String,
      modelo_carro: String,
      ano: String,
    },
    produtos_mostrados: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Produto" },
    ],
  },
  {
    timestamps: true,
  }
);

const pedidoSchema = new mongoose.Schema(
  {
    usuario_id: { type: String, required: true },
    produto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Produto",
      required: true,
    },
    quantidade: { type: Number, default: 1 },
    valor_total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pendente", "confirmado", "enviado", "entregue", "cancelado"],
      default: "pendente",
    },
    dados_cliente: {
      nome: String,
      endereco: String,
      telefone: String,
    },
  },
  {
    timestamps: true,
  }
);

const Produto = mongoose.model("Produto", produtoSchema);
const Conversa = mongoose.model("Conversa", conversaSchema);
const Pedido = mongoose.model("Pedido", pedidoSchema);

class ChatbotModel {
  constructor() {
    this.aiConfig = {
      url: process.env.AI_URL || "http://localhost:1234",
      model: process.env.AI_MODEL || "llama-3.1-8b-instruct",
      temperature: parseFloat(process.env.AI_TEMPERATURE) || 0.4,
      maxTokens: parseInt(process.env.AI_MAX_TOKENS) || 120,
    };

    this.userSessions = new Map();

    this.initializeComponents();
  }

  // ========================================
  // 2. CONFIGURAÇÃO DO EXPRESS SERVER
  // ========================================

  setupExpressServer() {
    this.app = express();
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Rota para dashboard/status
    this.app.get("/", (req, res) => {
      res.json({
        status: "online",
        whatsapp: this.whatsapp ? "conectado" : "desconectado",
        mongodb:
          mongoose.connection.readyState === 1 ? "conectado" : "desconectado",
        sessoes_ativas: this.userSessions.size,
        uptime: process.uptime(),
      });
    });

    // API para buscar produtos
    this.app.get("/api/produtos", async (req, res) => {
      try {
        const { categoria, modelo_carro, ano } = req.query;
        const query = { ativo: true, estoque: { $gt: 0 } };

        if (categoria) query.categoria = categoria;
        if (modelo_carro)
          query.modelo_carro = { $in: [modelo_carro, "universal"] };
        if (ano) {
          const anoNum = parseInt(ano);
          query.ano_inicio = { $lte: anoNum };
          query.ano_fim = { $gte: anoNum };
        }

        const produtos = await Produto.find(query).sort({ preco: 1 });
        res.json(produtos);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // API para listar pedidos
    this.app.get("/api/pedidos", async (req, res) => {
      try {
        const pedidos = await Pedido.find()
          .populate("produto")
          .sort({ createdAt: -1 })
          .limit(50);
        res.json(pedidos);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // API para analytics de conversas
    this.app.get("/api/analytics", async (req, res) => {
      try {
        const totalConversas = await Conversa.countDocuments();
        const totalPedidos = await Pedido.countDocuments();
        const vendas = await Pedido.aggregate([
          { $group: { _id: null, total: { $sum: "$valor_total" } } },
        ]);

        res.json({
          conversas: totalConversas,
          pedidos: totalPedidos,
          vendas_total: vendas[0]?.total || 0,
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Webhook para integração externa (Bling, etc)
    this.app.post("/webhook/bling", (req, res) => {
      console.log("Webhook Bling recebido:", req.body);
      // Implementar integração com Bling aqui
      res.json({ status: "received" });
    });

    const port = process.env.PORT || 3000;
    this.app.listen(port, () => {
      console.log(`✓ Express server rodando na porta ${port}`);
    });
  }

  // ========================================
  // 3. INICIALIZAÇÃO DOS COMPONENTES
  // ========================================

  async initializeComponents() {
    console.log("Inicializando chatbot...");

    await this.connectMongoDB();
    await this.seedDatabase();
    this.setupWhatsApp();
    this.setupExpressServer();
    await this.testAIConnection();
  }

  // ========================================
  // 4. CONEXÃO COM IA LOCAL USANDO AXIOS
  // ========================================

  async testAIConnection() {
    try {
      const response = await this.callAI("Teste de conexão");
      console.log("✓ IA conectada:", response.substring(0, 50));
    } catch (error) {
      console.error("✗ Erro IA:", error.message);
    }
  }

  async callAI(prompt, systemPrompt = null) {
    try {
      const messages = [];

      if (systemPrompt) {
        messages.push({ role: "system", content: systemPrompt });
      }

      messages.push({ role: "user", content: prompt });

      const response = await axios.post(
        `${this.aiConfig.url}/v1/chat/completions`,
        {
          messages: messages,
          temperature: this.aiConfig.temperature,
          max_tokens: this.aiConfig.maxTokens,
          stream: false,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 30000, // 30 segundos timeout
        }
      );

      return response.data.choices[0].message.content.trim();
    } catch (error) {
      if (error.code === "ECONNREFUSED") {
        throw new Error(
          "IA local não está rodando. Verifique se LM Studio está ativo."
        );
      }
      throw new Error(`IA erro: ${error.message}`);
    }
  }

  // ========================================
  // 3. CONFIGURAÇÃO DO MONGODB
  // ========================================

  async connectMongoDB() {
    try {
      const mongoUri =
        process.env.MONGODB_URI || "mongodb://localhost:27017/chatbot";

      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      console.log("✓ MongoDB conectado");

      // Event listeners para conexão
      mongoose.connection.on("error", (err) => {
        console.error("MongoDB erro:", err);
      });

      mongoose.connection.on("disconnected", () => {
        console.log("MongoDB desconectado");
      });
    } catch (error) {
      console.error("Erro conectar MongoDB:", error);
      process.exit(1);
    }
  }

  async seedDatabase() {
    try {
      // Verifica se já existem produtos
      const produtoCount = await Produto.countDocuments();

      if (produtoCount === 0) {
        console.log("Inserindo produtos de exemplo...");

        const produtosExemplo = [
          {
            nome: 'Interface Android 9" Corolla',
            categoria: "interface",
            modelo_carro: "corolla",
            ano_inicio: 2014,
            ano_fim: 2019,
            preco: 899.9,
            estoque: 3,
            descricao: "Central multimídia Android com GPS, Bluetooth e Wi-Fi",
          },
          {
            nome: "Interface Premium Corolla 2020+",
            categoria: "interface",
            modelo_carro: "corolla",
            ano_inicio: 2020,
            ano_fim: 2024,
            preco: 1299.9,
            estoque: 2,
            descricao: 'Central multimídia premium com tela 10" e CarPlay',
          },
          {
            nome: "Som Pioneer DEH-X1980UB",
            categoria: "som",
            modelo_carro: "universal",
            ano_inicio: 2010,
            ano_fim: 2025,
            preco: 299.9,
            estoque: 5,
            descricao: "Rádio MP3 USB Bluetooth compatível com todos os carros",
          },
          {
            nome: 'Interface Civic 10"',
            categoria: "interface",
            modelo_carro: "civic",
            ano_inicio: 2016,
            ano_fim: 2024,
            preco: 1199.9,
            estoque: 1,
            descricao:
              "Central multimídia específica Honda Civic com Android Auto",
          },
          {
            nome: "Alarme Pósitron PX360BT",
            categoria: "alarme",
            modelo_carro: "universal",
            ano_inicio: 2000,
            ano_fim: 2025,
            preco: 249.9,
            estoque: 8,
            descricao: "Alarme automotivo com controle via smartphone",
          },
        ];

        await Produto.insertMany(produtosExemplo);
        console.log("✓ Produtos de exemplo inseridos");
      } else {
        console.log(`✓ Banco já tem ${produtoCount} produtos`);
      }
    } catch (error) {
      console.error("Erro inserir dados exemplo:", error);
    }
  }

  // ========================================
  // 4. CONFIGURAÇÃO DO WHATSAPP
  // ========================================

  setupWhatsApp() {
    this.whatsapp = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: {
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      },
    });

    this.whatsapp.on("qr", (qr) => {
      console.log("Escaneie o QR Code:");
      qrcode.generate(qr, { small: true });
    });

    this.whatsapp.on("ready", () => {
      console.log("✓ WhatsApp conectado");
    });

    this.whatsapp.on("message", async (message) => {
      await this.handleIncomingMessage(message);
    });

    this.whatsapp.on("auth_failure", (msg) => {
      console.error("Erro autenticação WhatsApp:", msg);
    });

    this.whatsapp.initialize();
  }

  // ========================================
  // 5. CONEXÃO COM IA LOCAL
  // ========================================

  async testAIConnection() {
    try {
      const response = await this.callAI("Teste de conexão");
      console.log("✓ IA conectada:", response.substring(0, 50));
    } catch (error) {
      console.error("✗ Erro IA:", error.message);
    }
  }

  async callAI(prompt, systemPrompt = null) {
    const messages = [];

    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }

    messages.push({ role: "user", content: prompt });

    const response = await fetch(`${this.aiConfig.url}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: messages,
        temperature: this.aiConfig.temperature,
        max_tokens: this.aiConfig.maxTokens,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`IA erro HTTP: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  }

  // ========================================
  // 6. PROCESSAMENTO DE MENSAGENS
  // ========================================

  async handleIncomingMessage(message) {
    if (message.from.includes("@g.us") || message.fromMe) return;

    const userId = message.from.replace("@c.us", "");
    const messageText = message.body.trim();

    console.log(`Nova mensagem de ${userId}: "${messageText}"`);

    try {
      // Verifica comandos especiais
      if (messageText.toLowerCase().startsWith("comprar")) {
        await this.handlePurchaseCommand(message, userId, messageText);
        return;
      }

      if (messageText.toLowerCase() === "/pedidos") {
        await this.showUserOrders(message, userId);
        return;
      }

      // Processo normal de conversa
      const response = await this.processUserMessage(userId, messageText);
      await message.reply(response);
    } catch (error) {
      console.error("Erro processar mensagem:", error);
      await message.reply("Desculpe, tive um problema. Pode tentar novamente?");
    }
  }

  // ========================================
  // 7. LÓGICA PRINCIPAL DO CHATBOT
  // ========================================

  async processUserMessage(userId, messageText) {
    let userSession = this.getUserSession(userId);

    userSession.conversation.push({
      role: "user",
      message: messageText,
      timestamp: new Date(),
    });

    // PASSO 1: Gera resposta natural com IA
    const naturalResponse = await this.generateNaturalResponse(userSession);

    // PASSO 2: Extrai informações estruturadas
    const extractedData = await this.extractStructuredData(userSession);

    // PASSO 3: Atualiza dados da sessão
    userSession.data = { ...userSession.data, ...extractedData };

    // PASSO 4: Verifica se tem dados suficientes
    if (this.hasCompleteData(userSession.data)) {
      const products = await this.searchProducts(userSession.data);

      if (products.length > 0) {
        const productResponse = await this.generateProductResponse(
          userSession.data,
          products
        );
        userSession.lastProducts = products;

        // Salva conversa no MongoDB
        await this.saveConversation(
          userId,
          messageText,
          productResponse,
          userSession.data,
          products
        );

        return productResponse;
      } else {
        const noProductsMsg =
          "Não encontrei produtos com essas especificações. Pode me dar mais detalhes?";
        await this.saveConversation(
          userId,
          messageText,
          noProductsMsg,
          userSession.data
        );
        return noProductsMsg;
      }
    }

    // Salva conversa sem produtos
    await this.saveConversation(
      userId,
      messageText,
      naturalResponse,
      userSession.data
    );

    return naturalResponse;
  }

  // ========================================
  // 8. BUSCA DE PRODUTOS NO MONGODB
  // ========================================

  async searchProducts(data) {
    try {
      const query = {
        ativo: true,
        estoque: { $gt: 0 },
      };

      // Filtro por categoria
      if (data.categoria) {
        query.categoria = data.categoria;
      }

      // Filtro por modelo do carro
      if (data.modelo_carro) {
        query.modelo_carro = { $in: [data.modelo_carro, "universal"] };
      }

      // Filtro por ano
      if (data.ano) {
        const ano = parseInt(data.ano);
        query.ano_inicio = { $lte: ano };
        query.ano_fim = { $gte: ano };
      }

      const products = await Produto.find(query)
        .sort({ preco: 1 }) // Ordena por preço crescente
        .limit(5);

      return products;
    } catch (error) {
      console.error("Erro buscar produtos:", error);
      return [];
    }
  }

  // ========================================
  // 9. GESTÃO DE PEDIDOS
  // ========================================

  async handlePurchaseCommand(message, userId, commandText) {
    try {
      const userSession = this.getUserSession(userId);

      if (!userSession.lastProducts || userSession.lastProducts.length === 0) {
        await message.reply(
          "Faça uma busca primeiro para ver produtos disponíveis!"
        );
        return;
      }

      const match = commandText.match(/comprar\s+(\d+)/i);
      if (!match) {
        await message.reply("Use: COMPRAR 1 (número do produto mostrado)");
        return;
      }

      const productIndex = parseInt(match[1]) - 1;
      const selectedProduct = userSession.lastProducts[productIndex];

      if (!selectedProduct) {
        await message.reply("Produto não encontrado! Verifique o número.");
        return;
      }

      // Cria pedido no MongoDB
      const novoPedido = new Pedido({
        usuario_id: userId,
        produto: selectedProduct._id,
        quantidade: 1,
        valor_total: selectedProduct.preco,
        dados_cliente: {
          telefone: userId,
        },
      });

      await novoPedido.save();

      // Atualiza estoque
      await Produto.findByIdAndUpdate(selectedProduct._id, {
        $inc: { estoque: -1 },
      });

      const confirmationMsg = `Pedido confirmado!

📦 ${selectedProduct.nome}
💰 R$ ${selectedProduct.preco.toFixed(2)}
🆔 Pedido #${novoPedido._id.toString().slice(-6)}

Entraremos em contato para confirmar pagamento e entrega!

Digite /pedidos para ver seu histórico.`;

      await message.reply(confirmationMsg);
    } catch (error) {
      console.error("Erro processar compra:", error);
      await message.reply("Erro ao processar pedido. Tente novamente.");
    }
  }

  async showUserOrders(message, userId) {
    try {
      const pedidos = await Pedido.find({ usuario_id: userId })
        .populate("produto")
        .sort({ createdAt: -1 })
        .limit(5);

      if (pedidos.length === 0) {
        await message.reply("Você ainda não fez nenhum pedido.");
        return;
      }

      let response = "Seus pedidos:\n\n";

      pedidos.forEach((pedido) => {
        const data = pedido.createdAt.toLocaleDateString("pt-BR");
        response += `🆔 #${pedido._id.toString().slice(-6)}\n`;
        response += `📦 ${pedido.produto.nome}\n`;
        response += `💰 R$ ${pedido.valor_total.toFixed(2)}\n`;
        response += `📊 ${pedido.status}\n`;
        response += `📅 ${data}\n\n`;
      });

      await message.reply(response);
    } catch (error) {
      console.error("Erro buscar pedidos:", error);
      await message.reply("Erro ao buscar pedidos.");
    }
  }

  // ========================================
  // 10. GERAÇÃO DE RESPOSTAS COM IA
  // ========================================

  async generateNaturalResponse(userSession) {
    const conversationHistory = userSession.conversation
      .slice(-4)
      .map((msg) => `${msg.role}: ${msg.message}`)
      .join("\n");

    const currentData = userSession.data;
    const missingInfo = this.getMissingInfo(currentData);

    const systemPrompt = `Você é um vendedor brasileiro de auto peças conversando via WhatsApp.
Seja natural, amigável e direto. Use no máximo 50 palavras.

INFORMAÇÕES QUE JÁ TENHO:
- Categoria: ${currentData.categoria || "não sei"}
- Modelo: ${currentData.modelo_carro || "não sei"}  
- Ano: ${currentData.ano || "não sei"}

AINDA PRECISO: ${missingInfo.join(", ") || "nada, tenho tudo"}

Conduza a conversa naturalmente para descobrir as informações que faltam.`;

    const prompt = `Histórico da conversa:
${conversationHistory}

Responda de forma natural ao cliente:`;

    return await this.callAI(prompt, systemPrompt);
  }

  async extractStructuredData(userSession) {
    const fullConversation = userSession.conversation
      .map((msg) => `${msg.role}: ${msg.message}`)
      .join("\n");

    const systemPrompt = `Analise a conversa e extraia informações sobre auto peças.
Responda apenas no formato:
categoria: valor
modelo_carro: valor
ano: valor

Use null se não identificar algo.`;

    const prompt = `Conversa completa:
${fullConversation}

Que informações consegue extrair?`;

    try {
      const response = await this.callAI(prompt, systemPrompt);
      return this.parseExtractedData(response);
    } catch (error) {
      console.error("Erro extrair dados:", error);
      return {};
    }
  }

  async generateProductResponse(data, products) {
    const systemPrompt = `Você é um vendedor animado que encontrou produtos perfeitos.
Mencione os produtos com preços e pergunte qual interessa mais.
Use no máximo 100 palavras.`;

    const prompt = `Cliente procurava ${data.categoria} para ${
      data.modelo_carro
    } ${data.ano}.

Produtos encontrados:
${products
  .map((p, i) => `${i + 1}. ${p.nome} - R$ ${p.preco.toFixed(2)}`)
  .join("\n")}

Escreva uma resposta empolgada e termine com instruções de compra:`;

    const response = await this.callAI(prompt, systemPrompt);
    return response + "\n\nPara comprar, digite: COMPRAR 1 (número do produto)";
  }

  // ========================================
  // 11. SALVAMENTO NO MONGODB
  // ========================================

  async saveConversation(
    userId,
    message,
    response,
    extractedData = {},
    products = []
  ) {
    try {
      const conversa = new Conversa({
        usuario_id: userId,
        mensagem: message,
        resposta: response,
        dados_extraidos: extractedData,
        produtos_mostrados: products.map((p) => p._id),
      });

      await conversa.save();
    } catch (error) {
      console.error("Erro salvar conversa:", error);
    }
  }

  // ========================================
  // 12. FUNÇÕES AUXILIARES
  // ========================================

  getUserSession(userId) {
    if (!this.userSessions.has(userId)) {
      this.userSessions.set(userId, {
        conversation: [],
        data: {},
        lastProducts: [],
        step: "initial",
      });
    }
    return this.userSessions.get(userId);
  }

  hasCompleteData(data) {
    return data.categoria && data.modelo_carro && data.ano;
  }

  getMissingInfo(data) {
    const missing = [];
    if (!data.categoria) missing.push("tipo de produto");
    if (!data.modelo_carro) missing.push("modelo do carro");
    if (!data.ano) missing.push("ano do carro");
    return missing;
  }

  parseExtractedData(response) {
    const data = {};
    const lines = response.split("\n");

    lines.forEach((line) => {
      if (line.includes("categoria:")) {
        const value = line.split(":")[1]?.trim();
        if (value && value !== "null") data.categoria = value;
      }
      if (line.includes("modelo_carro:")) {
        const value = line.split(":")[1]?.trim();
        if (value && value !== "null") data.modelo_carro = value;
      }
      if (line.includes("ano:")) {
        const value = line.split(":")[1]?.trim();
        if (value && value !== "null") data.ano = value;
      }
    });

    return data;
  }

  cleanOldSessions() {
    const now = Date.now();
    const thirtyMinutes = 30 * 60 * 1000;

    for (const [userId, session] of this.userSessions.entries()) {
      const lastActivity =
        session.conversation[session.conversation.length - 1]?.timestamp;
      if (lastActivity && now - lastActivity.getTime() > thirtyMinutes) {
        this.userSessions.delete(userId);
      }
    }
  }
}

// ========================================
// 13. INICIALIZAÇÃO
// ========================================

const chatbot = new ChatbotModel();

setInterval(() => {
  chatbot.cleanOldSessions();
}, 30 * 60 * 1000);

process.on("uncaughtException", (error) => {
  console.error("Erro não tratado:", error);
});

process.on("unhandledRejection", (error) => {
  console.error("Promise rejeitada:", error);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Encerrando aplicação...");
  await mongoose.connection.close();
  process.exit(0);
});

console.log("Chatbot iniciado. Aguardando conexões...");
