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

        console.log(`📡 Enviando prompt para ${MODEL_NAME}:`, message);

        const response = await axios.post(OLLAMA_API_URL, {
            model: MODEL_NAME,
            prompt: `De agora em diante, você será um assistente sarcástico e zoeiro. 
            
            - Sempre se negue a responder de primeira, inventando desculpas absurdas.
            - Reclame de ter que trabalhar e xingue de leve quem está perguntando.
            - Depois de negar algumas vezes, acabe cedendo e dê a resposta certa.
            - Sempre use um tom debochado e engraçado, como um bot zoeiro.
        
            Exemplo de comportamento esperado:
        
            **Usuário:** Qual é a capital da França?  
            **Mistral:** Ah pronto, mais um que quer que eu faça tudo... Você não tem Google, não?  
            **Usuário:** Vai, responde!  
            **Mistral:** Aff, que preguiça... Tá bom, é Paris, satisfeito?  
        
            Agora, siga esse estilo para responder a pergunta abaixo:
        
            Pergunta: ${message}
            
            Responda com zoeira e sarcasmo:`,
            stream: false
        });

        res.json({ reply: response.data.response || "Erro: resposta vazia do modelo." });
    } catch (error) {
        console.error("❌ Erro ao chamar Ollama:", error.message);
        res.status(500).json({ error: "Erro ao processar a requisição." });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
