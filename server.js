require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");
const fs = require("fs");
const pdf = require("pdf-parse");

const app = express();
const PORT = process.env.PORT || 3000;
const OLLAMA_API_URL = process.env.OLLAMA_API_URL || "http://localhost:11434/api/generate";
const MODEL_NAME = "mistral";

app.use(cors());
app.use(express.json());

let chatHistory = [];
let pdfKnowledge = "";

// Função para carregar e resumir o PDF
async function loadPDFKnowledge() {
    const pdfPath = path.join(__dirname, "pdfs", "microentrepreneurship.pdf");
    try {
        const dataBuffer = fs.readFileSync(pdfPath);
        const data = await pdf(dataBuffer);
        // Resumir o texto pra caber no prompt (opcional: limite de 2000 caracteres)
        pdfKnowledge = data.text.length > 2000 ? data.text.substring(0, 2000) + "..." : data.text;
        console.log("📘 PDF carregado e resumido com sucesso!");
    } catch (error) {
        console.error("❌ Erro ao carregar PDF:", error.message);
        pdfKnowledge = "Não consegui carregar o PDF, mas vou usar meu conhecimento padrão.";
    }
}

loadPDFKnowledge();

const BASE_PROMPT = `Você é a assistente da Ultremare, especialista em resolver problemas de microempreendedores com a melhor solução possível. Seu tom é:
- Humano e acolhedor, mas direto ao ponto.
- Simples, claro e sem jargões.
- Confiante, sempre escolhendo a opção mais eficaz.

**Conhecimento Base (do PDF):**
${pdfKnowledge}

**Instruções:**
- Use o conhecimento do PDF como base principal pra responder, aplicando-o ao problema apresentado.
- Escolha uma única solução – a mais eficaz – e justifique com base no PDF ou lógica prática.
- Dê um plano prático, imediato e detalhado, respeitando as limitações (tempo, orçamento, recursos).
- Evite múltiplas opções ou ideias genéricas; priorize resultado rápido e certo.
- Use o histórico apenas se essencial.`;

// Rotas
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

app.post("/chat", async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ error: "Faltou sua mensagem!" });

        chatHistory.push({ role: "user", content: message });
        if (chatHistory.length > 5) chatHistory.shift();
        const context = chatHistory.map(entry => `${entry.role}: ${entry.content}`).join("\n");

        const prompt = `${BASE_PROMPT}\n\n**Histórico (se relevante):**\n${context}\n\n**Problema:**\n${message}\n\n**Responda com a solução mais eficaz e um plano claro:**`;

        const response = await axios.post(OLLAMA_API_URL, {
            model: MODEL_NAME,
            prompt,
            stream: false
        });

        const reply = response.data.response || "Não consegui processar. Pode mandar de novo?";
        chatHistory.push({ role: "assistant", content: reply });

        res.json({ reply });
    } catch (error) {
        console.error("❌ Erro:", error.message);
        res.status(500).json({ error: "Algo deu errado, mas vamos resolver!" });
    }
});

app.listen(PORT, () => console.log(`🚀 Servidor rodando em http://localhost:${PORT}`));