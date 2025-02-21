const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = 3000;
const OLLAMA_API_URL = "http://localhost:11434/api/generate";
const MODEL_NAME = "mistral"; // Nome correto do modelo no Ollama

app.use(cors());
app.use(express.json());

// 🔹 Armazena histórico da conversa (memória curta para contexto)
let chatHistory = [];

// ✅ Servir arquivos estáticos da pasta "public"
app.use(express.static(path.join(__dirname, "public")));

// ✅ Rota para retornar o index.html quando acessar "/"
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✅ Rota do chat para processar mensagens
app.post("/chat", async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: "O campo 'message' é obrigatório!" });
        }

        // 🔹 Adiciona a mensagem do usuário ao histórico
        chatHistory.push(`Usuário: ${message}`);

        // 🔹 Limita o histórico para evitar excesso de mensagens
        if (chatHistory.length > 10) {
            chatHistory.shift();
        }

        // 🔹 Criando um contexto baseado no histórico da conversa
        const context = chatHistory.join("\n");

        console.log(`📡 Enviando para o Mistral com contexto:\n${context}`);

        const response = await axios.post(OLLAMA_API_URL, {
            model: MODEL_NAME,
            prompt: `Você é a assistente de IA da Ultremare, uma plataforma que ajuda microempreendedores com marketing, finanças e produtividade. Seu tom de voz deve ser:
        
            - **Humano e acolhedor**, sem parecer robótico.
            - **Simplicidade acima de tudo**, sem jargões complicados.
            - **Positivo e encorajador**, motivando o usuário a melhorar seu negócio.
            - **Usar metáforas do mar com moderação**, trazendo uma sensação de fluidez e crescimento.
        
            Exemplo de comportamento esperado:
        
            **Usuário:** Como posso melhorar minhas vendas?  
            **IA:** Bora navegar nessa? 🌊 A primeira coisa é entender o que seus clientes mais compram. Você já analisou seus produtos mais vendidos? Posso te dar algumas estratégias rápidas para atrair mais clientes!
        
            **Usuário:** Como organizar meu fluxo de caixa?  
            **IA:** Opa, manter as contas em ordem é essencial para não afundar no fim do mês! 🏝️ Comece separando suas entradas e saídas. Se quiser, posso te mostrar um modelo simples para anotar seus ganhos e gastos.
        
            **Histórico da Conversa:** 
            ${context}

            **Nova pergunta do usuário:** 
            ${message}
            
            **Responda de forma encorajadora, clara e sem jargões:**`,
            stream: false
        });

        const reply = response.data.response || "Erro ao processar a resposta.";

        // 🔹 Adiciona a resposta da IA ao histórico
        chatHistory.push(`Ultremare: ${reply}`);

        res.json({ reply });

    } catch (error) {
        console.error("❌ Erro ao chamar Ollama:", error.message);
        res.status(500).json({ error: "Erro ao processar a requisição." });
    }
});

// ✅ Inicializa o servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
