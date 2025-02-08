// server.js
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares para processar JSON e dados via URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Rota para processar o chat
app.post("/chat", async (req, res) => {
    // Exibe no console o corpo da requisição para depuração
    console.log("Corpo da requisição recebido:", req.body);

    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: "Prompt é obrigatório!" });
        }

        // Requisição para o Ollama (DeepSeek-R1 deve estar rodando)
        const response = await axios.post("http://localhost:11434/api/generate", {
            model: "deepseek-r1",
            prompt: prompt,
            stream: false,
        });

        // Retorna a resposta do modelo
        res.json({ response: response.data.response });
    } catch (error) {
        console.error("Erro ao chamar Ollama:", error.message);
        res.status(500).json({ error: "Erro ao processar a requisição." });
    }
});

// Inicializa o servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
