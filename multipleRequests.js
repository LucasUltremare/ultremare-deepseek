// multipleRequests.js
const axios = require("axios");

async function sendMultipleRequests() {
  // Array para armazenar as promessas das requisições
  const requests = [];

  // Cria 20 requisições com prompts diferentes ou iguais
  for (let i = 1; i <= 20; i++) {
    const payload = {
      prompt: `Requisição número ${i}: O que é inteligência artificial?`
    };

    // Adiciona a requisição POST à lista de promessas
    requests.push(
      axios.post("http://localhost:3000/chat", payload, {
        headers: {
          "Content-Type": "application/json"
        }
      })
    );
  }

  try {
    // Aguarda todas as requisições completarem
    const responses = await Promise.all(requests);

    // Exibe as respostas no console
    responses.forEach((response, index) => {
      console.log(`Resposta da requisição ${index + 1}:`, response.data.response);
    });
  } catch (error) {
    console.error("Erro durante as requisições:", error.message);
  }
}

// Executa a função
sendMultipleRequests();
